import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cover() {
  const navigate = useNavigate();

  // 책 페이지 넘김 상태 (0: 표지, 1: 첫번째 장, 2: 두번째 장, 3: 세번째 장)
  const [page, setPage] = useState(0);

  // 책을 클릭하면 페이지가 넘어감 (3장까지)
  const flipPage = () => {
    if (page < 3) setPage(page + 1);
  };

  return (
    // 전체 배경 (어두운 다락방 느낌)
    <div className="min-h-screen bg-[#1A1816] flex justify-center items-center p-4 relative overflow-hidden font-sans">

      {/* 배경 이미지 및 오버레이 */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1000&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1816]/80 via-transparent to-[#1A1816]"></div>

      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* 상단 타이틀 */}
        <div className="text-center mb-10">
          <h2 className="font-display tracking-[0.3em] text-xs mb-3 text-[#D3C9B8]">LIAOLLET</h2>
          <h1 className="font-serif font-bold text-4xl mb-2 text-white drop-shadow-lg">감정의 다락방</h1>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#D3C9B8]">THE ATTIC OF FEELINGS</p>
        </div>

        {/* ========================================== */}
        {/* 3D 책(Diary) 영역 */}
        {/* ========================================== */}
        <div className="relative w-[280px] h-[360px] perspective-[1500px] mb-12 cursor-pointer group" onClick={flipPage}>

          {/* 책의 두께감과 그림자 */}
          <div className="absolute inset-0 bg-[#2A241E] rounded-r-lg shadow-[20px_20px_50px_rgba(0,0,0,0.8)] transform translate-z-[-10px]"></div>

          {/* 책의 왼쪽 페이지 (고정) */}
          <div className="absolute top-0 left-0 w-1/2 h-full bg-[#F5F2EC] rounded-l-lg overflow-hidden border-r border-[#D3C9B8] shadow-inner flex flex-col justify-center p-4">
             <div className="text-[10px] text-[#6E675F] font-mono mb-2">VOL. 01</div>
             <div className="text-sm font-serif text-[#2A2825] leading-relaxed">
                다락방의<br/>가장 깊은<br/>서랍.
             </div>
          </div>

          {/* 고리(링) 바인딩 장식 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex flex-col justify-evenly z-30 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-200 rounded-full border border-gray-500 shadow-sm transform translate-x-[-50%]"></div>
            ))}
          </div>

          {/* 넘어가는 오른쪽 페이지들 (3D Flip) */}
          {/* Page 3 (맨 밑장) */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full bg-[#F5F2EC] rounded-r-lg overflow-hidden origin-left transition-transform duration-700 ease-in-out border-l border-gray-300 ${page >= 3 ? '-rotate-y-180' : 'rotate-y-0'}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 backface-hidden p-2">
              <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover rounded-sm opacity-80" alt="page3" />
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#EAE5DC]"></div>
          </div>

          {/* Page 2 */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full bg-[#F5F2EC] rounded-r-lg overflow-hidden origin-left transition-transform duration-700 ease-in-out border-l border-gray-300 ${page >= 2 ? '-rotate-y-180' : 'rotate-y-0'}`}
            style={{ transformStyle: 'preserve-3d', zIndex: 10 }}
          >
            <div className="absolute inset-0 backface-hidden p-2 bg-white">
              <div className="w-full h-full border border-gray-200 p-2 flex flex-col justify-end">
                 <div className="w-full h-1/2 bg-gray-200 mb-2"></div>
                 <div className="text-[8px] text-gray-400">기록의 파편들...</div>
              </div>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#EAE5DC] p-4 flex items-center justify-center">
               <span className="text-xs font-serif text-[#9B4028] italic">"빛과 그림자"</span>
            </div>
          </div>

          {/* Page 1 (표지) */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full bg-[#D3C9B8] rounded-r-lg overflow-hidden origin-left transition-transform duration-700 ease-in-out shadow-[5px_0_15px_rgba(0,0,0,0.2)] ${page >= 1 ? '-rotate-y-180' : 'rotate-y-0'}`}
            style={{ transformStyle: 'preserve-3d', zIndex: 20 }}
          >
            {/* 표지 앞면 */}
            <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center border-4 border-[#C2B7A5]">
              <div className="w-16 h-20 border-2 border-[#9B4028] mb-4 flex items-center justify-center">
                <span className="text-[#9B4028] text-2xl font-serif">L</span>
              </div>
              <span className="font-serif text-[#5A5045] text-sm">Archives</span>
            </div>
            {/* 표지 뒷면 */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#F5F2EC] p-4 flex flex-col justify-between border-l border-gray-300">
                <div className="text-[9px] font-mono text-[#6E675F]">THE ATTIC</div>
                <img src="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=200&auto=format&fit=crop" className="w-full h-24 object-cover filter grayscale" alt="inner" />
                <div className="text-[8px] text-right text-[#6E675F]">Page 01</div>
            </div>
          </div>

          {/* 넘길 페이지가 없을 때 안내 */}
          {page === 3 && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-40 animate-in fade-in duration-500">
                <span className="text-white text-xs font-mono">END OF PREVIEW</span>
             </div>
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full flex flex-col items-center gap-6">
          <p className="font-serif text-[13px] text-white/80 animate-pulse">
            {page < 3 ? "책장을 넘겨 다락방을 미리보세요" : "다락방의 문이 열렸습니다"}
          </p>

          <button
            onClick={() => navigate('/consent')}
            className="w-full py-4 border border-[#D3C9B8] text-[#D3C9B8] font-serif text-[15px] hover:bg-[#D3C9B8] hover:text-[#2A2825] transition-all bg-black/30 backdrop-blur-sm"
          >
            창작 에디션 티켓 받기
          </button>

          <button
            onClick={() => alert('기존 티켓 번호를 입력하는 창이 열립니다.')}
            className="font-serif text-[13px] text-[#D3C9B8] underline underline-offset-4 hover:text-white transition-colors"
          >
            이미 받은 번호가 있나요?
          </button>
        </div>

      </div>
    </div>
  );
}