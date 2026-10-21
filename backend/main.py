import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pipeline
from supabase import create_client, Client

class EntrySaveRequest(BaseModel):
    persona: str
    quote: str
    poetic_story: str
    tags: List[str]
    photos: List[str]

app = FastAPI(title="LIAOLLET API")

# CORS 설정 (프론트엔드 5173 포트 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase 연결
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ==========================================
# 1. 기본 상태 확인
# ==========================================
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "LIAOLLET Backend"}


# ==========================================
# 2. AI 키워드 추출 (이 부분이 빠져있었을 확률이 높습니다)
# ==========================================
@app.post("/api/extract_keywords")
async def api_extract_keywords(
        files: List[UploadFile] = File(default=[]),
        text: str = Form("")
):
    try:
        files_bytes = [await f.read() for f in files]
        keywords = pipeline.extract_keywords(files_bytes, text)
        return {"keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 3. 콜라주 생성 및 분석 (이 부분도 필수)
# ==========================================
@app.post("/api/analyze")
async def api_analyze(
        files: List[UploadFile] = File(default=[]),
        text: str = Form(""),
        tags: str = Form(""),
        aspect: str = Form("lia")
):
    try:
        files_bytes = [await f.read() for f in files]
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

        result = pipeline.analyze_entry(files_bytes, text, tag_list, aspect)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 4. DB 저장, 불러오기, 좋아요 (Supabase)
# ==========================================
# 👇 라우터 수정 (data: dict 대신 EntrySaveRequest 사용)
@app.post("/api/save_entry")
async def save_entry(data: EntrySaveRequest):
    try:
        row = {
            "persona": data.persona,
            "quote": data.quote,
            "poetic_story": data.poetic_story,
            "tags": data.tags,
            "photos": data.photos,
            "likes": 0
        }
        response = supabase.table("entries").insert(row).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/get_entries")
async def get_entries():
    try:
        response = supabase.table("entries").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/like/{entry_id}")
async def like_entry(entry_id: str):
    try:
        existing = supabase.table("entries").select("likes").eq("id", entry_id).execute()
        current_likes = existing.data[0]['likes'] if existing.data else 0
        response = supabase.table("entries").update({"likes": current_likes + 1}).eq("id", entry_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))