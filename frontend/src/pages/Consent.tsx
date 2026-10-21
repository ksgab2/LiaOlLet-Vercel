import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Consent() {
  const navigate = useNavigate();

  // 체크박스 상태 관리
  const [checks, setChecks] = useState({
    c1: false, // 필수: 업로드 사진/문장 사용
    c2: false, // 선택: 사진 속 인물 반영
    c3: false, // 필수: 익명 전시 동의
  });

  // 모두 동의 버튼
  const handleAgreeAll = () => {
    setChecks({ c1: true, c2: true, c3: true });
  };

  // 개별 토글
  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 필수 항목(c1, c3)이 모두 체크되어야 다음으로 이동 가능
  const isValid = checks.c1 && checks.c3;

  const handleNext = () => {
    if (isValid) {
      // 동의 여부를 세션에 저장 (필요시 사용)
      sessionStorage.setItem('consent_given', 'true');
      navigate('/aspect');
    }
  };

  // 오늘 날짜 (스탬프용)
  const today = new Date();
  const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    // 1단: 가장 바깥쪽 배경 (밝은 회색)
    <div className="min-h-screen bg-[#F2F2F2] flex justify-center items-center p-4 py-10 font-serif">

      {/* 2단: 짙은 갈색 액자 테두리 */}
      <div className="bg-[#2A241E] p-4 sm:p-5 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-[420px] relative">

        {/* 테이프 효과 */}
        <div className="absolute -top-3 left-8 w-20 h-6 bg-[#D3C9B8] -rotate-2 shadow-sm z-10 opacity-90"></div>

        {/* 3단: 안쪽 미색 종이 */}
        <div className="bg-archive-paper p-6 sm:p-8 rounded-sm text-archive-dark w-full relative min-h-[600px] flex flex-col">

          {/* 헤더 */}
          <div className="text-right font-mono text-xs text-archive-muted mb-1">p.02 / 07</div>
          <h1 className="text-3xl font-extrabold mb-2 font-serif">입장 동의서</h1>
          <p className="text-sm text-[#5A5045] mb-8 font-serif">다락방에 들어가기 전, 작은 약속</p>

          {/* 체크박스 리스트 */}
          <div className="flex flex-col gap-6 flex-grow">

            {/* 체크박스 1 */}
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleCheck('c1')}>
              <div className={`w-6 h-6 flex-shrink-0 border-2 border-archive-dark flex items-center justify-center mt-0.5 transition-colors ${checks.c1 ? 'bg-transparent' : 'bg-transparent'}`}>
                {checks.c1 && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-archive-dark stroke-[3]"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <p className="text-[15px] font-semibold leading-snug word-break-keep-all">
                업로드한 사진과 문장은 작품 생성에만 사용됩니다.
              </p>
            </div>

            {/* 체크박스 2 (서브 텍스트 포함) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleCheck('c2')}>
                <div className={`w-6 h-6 flex-shrink-0 border-2 border-archive-dark flex items-center justify-center mt-0.5 transition-colors ${checks.c2 ? 'bg-transparent' : 'bg-transparent'}`}>
                  {checks.c2 && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-archive-dark stroke-[3]"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <p className="text-[15px] font-semibold leading-snug word-break-keep-all">
                  사진 속 인물이 작품에 반영될 수 있습니다.
                </p>
              </div>
              <p className="text-[12px] text-archive-muted ml-9 word-break-keep-all">
                타인의 동의 없는 사진은 올리지 말아 주세요.
              </p>
            </div>

            {/* 체크박스 3 */}
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleCheck('c3')}>
              <div className={`w-6 h-6 flex-shrink-0 border-2 border-archive-dark flex items-center justify-center mt-0.5 transition-colors ${checks.c3 ? 'bg-transparent' : 'bg-transparent'}`}>
                {checks.c3 && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-archive-dark stroke-[3]"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <p className="text-[15px] font-semibold leading-snug word-break-keep-all">
                완성된 작품이 익명으로 '취향의 서가'에 전시·활용되는 것에 동의합니다.
              </p>
            </div>

          </div>

          {/* 모두 동의 & 스탬프 영역 */}
          <div className="flex justify-between items-center mt-10 mb-8 h-24">
            <button
              onClick={handleAgreeAll}
              className="px-5 py-2.5 bg-transparent border border-archive-dark text-archive-dark font-serif text-[15px] hover:bg-archive-dark hover:text-archive-paper transition-colors"
            >
              모두 동의
            </button>

            {/* 모든 항목이 체크되면 스탬프 등장 */}
            {checks.c1 && checks.c2 && checks.c3 && (
              <div className="w-24 h-24 rounded-full border-2 border-[#B5473A] text-[#B5473A] flex flex-col justify-center items-center -rotate-12 opacity-90 animate-in zoom-in duration-300">
                <span className="font-mono text-[10px] font-bold mb-0.5">LIAOLLET</span>
                <span className="font-mono text-[10px]">AGREED</span>
                <span className="font-mono text-[9px] mt-1">{dateString}</span>
              </div>
            )}
          </div>

          {/* 하단 이전/다음 버튼 */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 border border-archive-dark text-archive-dark font-serif text-[15px] hover:bg-archive-craft/20 transition-colors"
            >
              ← 이전
            </button>
            <button
              onClick={handleNext}
              disabled={!isValid}
              className={`flex-1 py-3.5 font-serif text-[15px] transition-colors ${
                isValid 
                  ? 'bg-[#2A241E] text-archive-paper hover:bg-black' 
                  : 'bg-archive-craft/50 text-archive-muted cursor-not-allowed'
              }`}
            >
              다음 장 →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}