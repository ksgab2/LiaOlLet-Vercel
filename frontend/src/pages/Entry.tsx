import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractKeywords, analyzeEntry } from '../lib/api';

export default function Entry() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 사진 업로드 처리 (최대 3장)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).slice(0, 3 - files.length);

    if (files.length + newFiles.length > 3) {
      alert('사진은 최대 3장까지 업로드할 수 있습니다.');
    }

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  // 사진 삭제
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // AI 키워드 추출
  const handleExtractKeywords = async () => {
    if (files.length === 0 && !text.trim()) {
      alert('사진이나 글귀를 먼저 입력해주세요.');
      return;
    }

    setIsExtracting(true);
    try {
      const result = await extractKeywords(files, text);
      setKeywords(result);
      setSelectedTags(result.slice(0, 3)); // 기본적으로 3개 선택
    } catch (error) {
      console.error(error);
      alert('키워드 추출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExtracting(false);
    }
  };

  // 태그 선택 토글
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 최종 생성
  const handleGenerate = async () => {
    if (files.length === 0 && !text.trim()) {
      alert('사진이나 글귀를 먼저 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    const aspect = sessionStorage.getItem('aspect') || 'lia';

    try {
      const result = await analyzeEntry(files, text, selectedTags, aspect);
      sessionStorage.setItem('entry_result', JSON.stringify(result));
      navigate('/result');
    } catch (error) {
      console.error(error);
      alert('콜라주 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-archive-bg text-archive-paper flex flex-col justify-center items-center p-6 md:p-12 font-serif relative">

      {/* 헤더 */}
      <div className="w-full max-w-3xl mb-8">
        <span className="font-mono text-xs text-archive-terracotta uppercase tracking-widest block mb-2">03. ARCHIVE ENTRY</span>
        <h2 className="text-3xl font-bold mb-3">기록 도록: 감각과 소스 수집</h2>
        <p className="text-archive-craft text-sm">콜라주에 사용될 사진 파편과 마음속에 스쳐간 문장을 담백하게 올려주세요.</p>
      </div>

      {/* 메인 종이 컨테이너 */}
      <div className="relative w-full max-w-3xl bg-archive-paper text-archive-dark p-6 sm:p-10 rounded-sm shadow-2xl">
        {/* 테이프 장식 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-archive-craft/80 rotate-1 shadow-sm"></div>

        {/* 날짜 및 인덱스 헤더 */}
        <div className="flex justify-between items-center border-b border-archive-craft pb-3 mb-8 font-mono text-xs text-archive-muted">
          <span>INDEX NO. <strong className="text-archive-dark font-bold">20261021-ATTIC</strong></span>
          <span className="uppercase">ENTRY DATE: {new Date().toISOString().split('T')[0].replace(/-/g, '.')}</span>
        </div>

        {/* 1. 사진 업로드 영역 (3칸) */}
        <div className="mb-8">
          <label className="block font-mono text-xs font-bold text-archive-dark uppercase tracking-wider mb-3">
            SOURCE 01. 이미지 조각 (최대 3장)
          </label>

          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative aspect-[3/4] bg-archive-craft/20 border border-dashed border-archive-craft flex items-center justify-center overflow-hidden rounded-sm group">
                {previews[index] ? (
                  <>
                    <img src={previews[index]} alt={`preview-${index}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-archive-terracotta text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-full text-archive-muted hover:bg-archive-craft/30 transition-colors"
                  >
                    <span className="text-2xl mb-2">+</span>
                    <span className="font-mono text-[10px]">CUT #{index + 1}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* 2. 글귀 입력 */}
        <div className="mb-8">
          <label className="block font-mono text-xs font-bold text-archive-dark uppercase tracking-wider mb-3">
            SOURCE 02. 스쳐간 글귀 또는 감각적 문장
          </label>
          <div className="bg-archive-paper border border-archive-craft p-4 rounded-sm" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #D3C9B8 32px)', lineHeight: '32px' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="창밖으로 스며들던 빗소리와 차분한 공간의 온도. '모든 빛은 그늘을 동반한다'던 구절..."
              className="w-full bg-transparent text-sm text-archive-dark placeholder-archive-muted/60 focus:outline-none resize-none font-serif leading-[32px]"
            />
          </div>
        </div>

        {/* 3. AI 키워드 추출 및 선택 */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <label className="block font-mono text-xs font-bold text-archive-dark uppercase tracking-wider">
              SOURCE 03. 취향 및 기분 키워드
            </label>
            <button
              onClick={handleExtractKeywords}
              disabled={isExtracting}
              className="px-3 py-1.5 bg-archive-dark text-archive-paper font-mono text-[10px] hover:bg-black transition-colors disabled:opacity-50"
            >
              {isExtracting ? '분석 중...' : '✨ AI에게 키워드 추천받기'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {keywords.length > 0 ? (
              keywords.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 border text-xs font-serif transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-archive-dark text-archive-paper border-archive-dark'
                      : 'bg-transparent text-archive-muted border-archive-craft hover:bg-archive-craft/30'
                  }`}
                >
                  {tag}
                </button>
              ))
            ) : (
              <span className="text-xs text-archive-muted font-serif">AI 추천 버튼을 눌러 키워드를 추출해보세요.</span>
            )}
          </div>
        </div>

      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="w-full max-w-3xl flex gap-4 mt-8">
        <button
          onClick={() => navigate('/aspect')}
          className="flex-1 py-3 border border-archive-muted text-archive-craft font-mono text-sm hover:bg-archive-muted/20 transition-colors"
        >
          ← BACK
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (files.length === 0 && !text.trim())}
          className={`flex-[2] py-3 font-mono text-sm font-bold transition-colors ${
            isGenerating || (files.length === 0 && !text.trim())
              ? 'bg-archive-muted/30 text-archive-muted cursor-not-allowed'
              : 'bg-archive-paper text-archive-dark hover:bg-white'
          }`}
        >
          {isGenerating ? '콜라주 생성 중...' : 'GENERATE CATALOGUE →'}
        </button>
      </div>

      {/* 로딩 오버레이 */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-archive-craft border-t-archive-terracotta rounded-full animate-spin mb-6"></div>
          <p className="text-archive-paper font-serif text-lg">AI가 콜라주를 조립하고 있습니다...</p>
          <p className="text-archive-craft font-mono text-xs mt-2">약 10~15초 소요됩니다.</p>
        </div>
      )}

    </div>
  );
}