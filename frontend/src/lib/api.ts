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

// ... (기존 extractKeywords, analyzeEntry 코드 유지) ...

// 👇 JSON 데이터를 보낼 때는 헤더를 명시적으로 지정해 줍니다.
export const saveEntryToDB = async (data: any) => {
  const response = await api.post('/api/save_entry', data, {
    headers: {
      'Content-Type': 'application/json', // 👈 이 부분이 핵심입니다!
    },
  });
  return response.data;
};

// 2. 서가 데이터 불러오기
export const fetchEntriesFromDB = async () => {
  const response = await api.get('/api/get_entries');
  return response.data;
};

// 3. 좋아요 증가
export const likeEntryInDB = async (id: string) => {
  const response = await api.post(`/api/like/${id}`);
  return response.data;
};