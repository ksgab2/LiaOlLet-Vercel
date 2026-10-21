import os
import base64
import datetime
import concurrent.futures
from io import BytesIO
from typing import Iterable
from functools import lru_cache
import logging

from google import genai
from google.genai import types
from PIL import Image
from tenacity import retry, stop_after_attempt, wait_exponential

# 로깅 설정 (Vercel 대시보드에서 확인 가능)
logger = logging.getLogger(__name__)

# --- 설정 값 (Vercel 환경 변수에서 읽어옴) ---
MAX_IMAGE_SIDE = 512
MAX_IMAGES = 3
NANO_BANANA_LITE_MODEL = os.environ.get("NANO_BANANA_LITE_MODEL", "gemini-3.1-flash-lite-image")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

PERSONA_INFO = {
    "lia": {
        "name": "Lia", "role": "Text & Silhouette",
        "voice": "짧고 조용한 문장. 여백을 남긴다. 감정을 직접 말하지 않고 장면으로 옮긴다.",
        "keywords": ["여백", "실루엣", "문장", "새벽", "느린 풍경"],
    },
    "ol": {
        "name": "Ol", "role": "Visual & Texture",
        "voice": "단어만 툭. 질감과 색을 먼저 본다. 손으로 붙이는 사람.",
        "keywords": ["종이질감", "오린 단면", "테이프", "콜라주", "따뜻한 검정"],
    },
    "let": {
        "name": "Let", "role": "Synthesis & Layer",
        "voice": "질문과 느낌표. 공간과 사람을 잇는다. 다층 레이어.",
        "keywords": ["오버레이", "공간", "큐레이션", "조명", "버건디"],
    },
}

FALLBACK_STORY = {
    "lia": "입력된 문장의 잔상이 여백으로 정돈됩니다. 지나온 순간들은 실루엣으로 남아 기록의 한 면을 이룹니다.",
    "ol": "수집된 조각들의 질감과 색면이 하나의 도록으로 재구성되었습니다. 손끝의 온도가 시각적 층위로 남습니다.",
    "let": "서로 다른 층위의 조각들이 겹쳐지며 하나의 장면으로 정리됩니다. 다층의 언어가 은은하게 공명합니다.",
}

COLLAGE_STYLE_PROMPTS = {
    "lia": "A cozy, nostalgic Parisian vintage film collage. Warm golden hour light, soft muted tones, cinematic multi-layer composition. Classic Parisian lifestyle, analog film grain.",
    "ol": "A dreamy, moody, subconscious monochrome collage. Low-saturation deep contrast, prism rainbow blurs, motion blur, halftone dots. Experimental high-angle composition.",
    "let": "A vibrant summer European lifestyle collage. Bright harsh sunlight, strong sharp shadows, deep blue and warm yellow primary colors. Kodak Portra 400 film grain, minimalist bold composition.",
}

@lru_cache(maxsize=1)
def _get_client() -> genai.Client:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY 환경 변수가 없습니다.")
    return genai.Client(api_key=api_key)

def _strip_exif_and_resize(raw: bytes) -> bytes:
    img = Image.open(BytesIO(raw))
    if img.mode != "RGB": img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > MAX_IMAGE_SIDE:
        scale = MAX_IMAGE_SIDE / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=75, optimize=True)
    return buf.getvalue()

def _bytes_to_data_url(jpeg_bytes: bytes) -> str:
    b64 = base64.b64encode(jpeg_bytes).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"

def _prepare_photos(files_bytes: list[bytes]) -> tuple[list[str], list[bytes]]:
    data_urls, cleaned = [], []
    for raw in files_bytes[:MAX_IMAGES]:
        try:
            jpeg = _strip_exif_and_resize(raw)
            data_urls.append(_bytes_to_data_url(jpeg))
            cleaned.append(jpeg)
        except Exception as e:
            logger.warning(f"이미지 처리 실패: {e}")
    return data_urls, cleaned

# ==========================================
# 키워드 추출 (FastAPI용)
# ==========================================
def extract_keywords(files_bytes: list[bytes], text: str) -> list[str]:
    _, cleaned_bytes = _prepare_photos(files_bytes)
    client = _get_client()
    prompt = f"""사용자가 입력한 글귀: "{text or '없음'}"
제공된 이미지들의 분위기, 색감, 사물을 분석하여 사용자의 취향을 나타내는 키워드를 5~8개 도출하세요.
반드시 '#'으로 시작하는 한국어 단어 형태로 작성하세요. (예: #정제된침묵, #흑백필름)
쉼표로 구분하여 키워드만 출력하세요. 다른 설명은 절대 쓰지 마세요."""

    contents = [prompt]
    for img_bytes in cleaned_bytes:
        contents.append(types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"))
        
    try:
        resp = client.models.generate_content(model=GEMINI_MODEL, contents=contents)
        keywords = [k.strip() for k in resp.text.replace("\n", "").split(",") if k.strip().startswith("#")]
        return keywords[:8]
    except Exception as e:
        logger.error(f"키워드 추출 실패: {e}")
        return ["#취향아카이브", "#기록", "#일상"]

# ==========================================
# 콜라주 이미지 생성
# ==========================================
def generate_collage_image(user_text: str, persona: str, aspect_ratio: str = "1:1") -> str:
    style = COLLAGE_STYLE_PROMPTS.get(persona, COLLAGE_STYLE_PROMPTS["lia"])
    prompt = f"{style}\n\nUser's memory/text: {user_text or 'quiet everyday moment'}"
    client = _get_client()
    
    try:
        response = client.models.generate_content(
            model=NANO_BANANA_LITE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                image_config=types.ImageConfig(aspect_ratio=aspect_ratio),
            ),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                return _bytes_to_data_url(part.inline_data.data)
    except Exception as e:
        logger.error(f"콜라주 생성 실패: {e}")
    return ""

# ==========================================
# 텍스트 생성
# ==========================================
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5), reraise=True)
def _generate_text_with_retry(prompt: str) -> str:
    client = _get_client()
    resp = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    return (resp.text or "").strip()

# ==========================================
# 메인 분석 함수 (병렬 처리)
# ==========================================
def analyze_entry(files_bytes: list[bytes], text: str, tags: list[str], aspect: str) -> dict:
    aspect = aspect if aspect in PERSONA_INFO else "lia"
    photo_data_urls, cleaned_bytes = _prepare_photos(files_bytes)

    image_summaries = []
    if cleaned_bytes:
        # 요약 프롬프트 생략 (기존 코드와 동일)
        pass

    # 텍스트 프롬프트 구성 (기존 로직 유지)
    info = PERSONA_INFO[aspect]
    tag_line = ", ".join(tags) if tags else "(선택 없음)"
    prompt_text = f"""당신은 사적인 취향 아카이브의 큐레이터입니다.
[페르소나] {info['name']} / {info['role']} / {info['voice']}
[입력] 글: {text} / 태그: {tag_line}
[규칙] 2~3문장, 150~220자, 입력에 없는 사실 지어내지 말 것. 출력은 해설 문단만."""

    # ★ 병렬 처리
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_text = executor.submit(_generate_text_with_retry, prompt_text)
        future_image = executor.submit(generate_collage_image, user_text=text, persona=aspect)
        
        try: poetic_story = future_text.result()
        except: poetic_story = FALLBACK_STORY[aspect]
        
        try: collage_url = future_image.result()
        except: collage_url = ""

    final_photos = [collage_url] if collage_url else photo_data_urls

    return {
        "persona": aspect,
        "date": datetime.date.today().strftime("%Y.%m.%d"),
        "quote": text or "창가로 들어오는 조용한 빛과 마음이 정돈되던 순간.",
        "poetic_story": poetic_story,
        "tags": tags if tags else ["#취향아카이브"],
        "photos": final_photos,
        "likes": 0,
    }