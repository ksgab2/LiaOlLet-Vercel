import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pipeline


app = FastAPI(title="LIAOLLET API")

# 프론트엔드(Vercel)에서의 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실배포 시에는 프론트엔드 도메인으로 제한하세요.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "LIAOLLET Backend"}


@app.post("/api/extract_keywords")
async def api_extract_keywords(
        files: List[UploadFile] = File(default=[]),
        text: str = Form("")
):
    """사진과 글귀를 분석해 키워드 반환"""
    try:
        files_bytes = [await f.read() for f in files]
        keywords = pipeline.extract_keywords(files_bytes, text)
        return {"keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze")
async def api_analyze(
        files: List[UploadFile] = File(default=[]),
        text: str = Form(""),
        tags: str = Form(""),
        aspect: str = Form("lia")
):
    """분석 및 콜라주 생성 (결과 dict 반환)"""
    try:
        files_bytes = [await f.read() for f in files]
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

        result = pipeline.analyze_entry(files_bytes, text, tag_list, aspect)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))