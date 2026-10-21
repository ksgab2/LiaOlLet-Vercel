import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 키워드 추출
export const extractKeywords = async (files: File[], text: string) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('text', text);

  const response = await api.post('/api/extract_keywords', formData);
  return response.data.keywords;
};

// 콜라주 분석 및 생성
export const analyzeEntry = async (
  files: File[],
  text: string,
  tags: string[],
  aspect: string
) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('text', text);
  formData.append('tags', tags.join(','));
  formData.append('aspect', aspect);

  const response = await api.post('/api/analyze', formData);
  return response.data;
};