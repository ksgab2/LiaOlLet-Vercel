import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface EntryResult {
  persona: string;
  date: string;
  quote: string;
  poetic_story: string;
  tags: string[];
  photos: string[];
  likes: number;
}

export default function Shelves() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EntryResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'lia' | 'ol' | 'let'>('all');
  const [selectedItem, setSelectedItem] = useState<EntryResult | null>(null);

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('liaollet_shelves');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // 필터링된 아이템 목록
  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.persona === filter);

  // 좋아요(하트) 클릭 로직
  const handleLike = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // 카드 클릭(모달 열림) 이벤트 방지
    const updatedItems = [...items];
    // 필터링된 배열의 인덱스가 아닌 원본 배열에서의 인덱스를 찾아야 함
    const originalIndex = items.findIndex(item => item.date === filteredItems[index].date && item.quote === filteredItems[index].quote);

    if (originalIndex !== -1) {
      updatedItems[originalIndex].likes += 1;
      setItems(updatedItems);
      localStorage.setItem('liaollet_shelves', JSON.stringify(updatedItems));

      // 모달이 열려있다면 모달 데이터도 업데이트
      if (selectedItem && selectedItem.date === updatedItems[originalIndex].date) {
        setSelectedItem(updatedItems[originalIndex]);
      }
    }
  };

  const personaNames: Record<string, string> = { lia: 'LIA', ol: 'OL', let: 'LET' };

  return (
    <div className="min-h-screen bg-archive-bg text-archive-paper p-6 md:p-12 font-serif relative">

      {/* 헤더 */}
      <div className="max-w-5xl mx-auto mb-10 text-center sm:text-left">
        <span className="font-mono text-xs text-archive-terracotta uppercase tracking-widest block mb-2">05. ATTIC SHELVES</span>
        <h2 className="text-3xl font-bold mb-3">취향의 서가</h2>
        <p className="text-archive-craft text-sm">다락방 서가에 정갈하게 보관된 다른 아카이브 인덱스 카드를 감상합니다.</p>
      </div>

      {/* 필터 버튼 */}
      <div className="max-w-5xl mx-auto flex justify-center sm:justify-start space-x-2 mb-8 font-mono text-xs">
        {(['all', 'lia', 'ol', 'let'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 transition-colors border ${
              filter === type 
                ? 'bg-archive-paper text-archive-dark border-archive-paper font-bold' 
                : 'bg-transparent text-archive-craft border-archive-muted/40 hover:text-white'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 서가 그리드 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center text-archive-muted font-serif">
            아직 서가가 비어 있습니다.<br/>
            <button onClick={() => navigate('/entry')} className="mt-4 underline text-archive-paper hover:text-white">
              첫 번째 아카이브 만들기
            </button>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedItem(item)}
              className="bg-archive-paper p-4 relative cursor-pointer hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              {/* 테이프 장식 */}
              <div className="absolute -top-2 left-4 w-16 h-5 bg-archive-craft/80 -rotate-1 shadow-sm z-10"></div>

              <div>
                {/* 상단 뱃지 & 날짜 */}
                <div className="flex justify-between items-center mb-3 pt-1 font-mono text-[9px] text-archive-dark">
                  <span className="px-2 py-0.5 bg-archive-dark text-archive-paper font-bold uppercase">
                    {personaNames[item.persona]}
                  </span>
                  <span className="text-archive-muted">{item.date}</span>
                </div>

                {/* 이미지 썸네일 */}
                <div className="bg-[#1C1A18] p-1.5 mb-3 aspect-[4/3] flex items-center justify-center overflow-hidden">
                  {item.photos && item.photos[0] ? (
                    <img src={item.photos[0]} alt="thumbnail" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-archive-muted text-xs">No Image</span>
                  )}
                </div>

                {/* 문장 요약 */}
                <p className="text-xs text-archive-dark italic line-clamp-2 mb-3">
                  "{item.quote}"
                </p>
              </div>

              {/* 하단 태그 & 좋아요 */}
              <div className="pt-2 border-t border-archive-craft/60 flex justify-between items-center font-mono text-[10px] text-archive-muted">
                <span className="truncate max-w-[120px]">{item.tags[0] || '#취향기록'}</span>
                <button
                  onClick={(e) => handleLike(e, index)}
                  className="flex items-center space-x-1 hover:text-archive-terracotta transition-colors"
                >
                  <span>♥</span>
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 새 아카이브 추가 버튼 */}
      <div className="max-w-5xl mx-auto text-center pt-12 mt-12 border-t border-archive-muted/30">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-archive-paper text-archive-dark font-mono text-sm font-bold hover:bg-white transition-all shadow-lg"
        >
          + NEW ARCHIVE ENTRY
        </button>
      </div>

      {/* ========================================== */}
      {/* 상세 모달 (카드를 클릭했을 때) */}
      {/* ========================================== */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)} // 배경 클릭 시 닫기
        >
          <div
            className="bg-archive-paper text-archive-dark w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-archive-muted hover:text-archive-terracotta font-mono text-lg"
            >
              [×]
            </button>

            <div className="absolute -top-2 left-6 w-20 h-5 bg-archive-craft/80 -rotate-1 shadow-sm"></div>

            {/* 모달 헤더 */}
            <div className="flex items-center space-x-2 mb-4 pt-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 bg-archive-dark text-archive-paper uppercase font-bold">
                {personaNames[selectedItem.persona]}
              </span>
              <span className="text-archive-muted">{selectedItem.date}</span>
            </div>

            {/* 모달 이미지 */}
            <div className="bg-[#1C1A18] p-2 mb-4">
              <img src={selectedItem.photos[0]} alt="detail" className="w-full h-auto max-h-[40vh] object-contain mx-auto" />
            </div>

            {/* 모달 텍스트 */}
            <div className="border border-archive-craft p-4 mb-4">
              <p className="text-xs text-archive-dark leading-relaxed font-serif">
                {selectedItem.poetic_story}
              </p>
            </div>

            <div className="bg-archive-craft/20 p-3 text-xs text-archive-muted font-serif mb-5">
              <div className="mb-2">
                <strong className="font-mono text-[10px] text-archive-dark block">QUOTED TEXT</strong>
                <span className="italic">"{selectedItem.quote}"</span>
              </div>
              <div>
                <strong className="font-mono text-[10px] text-archive-dark block">KEYWORDS</strong>
                <span>{selectedItem.tags.join(' ')}</span>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex justify-between items-center font-mono text-xs">
              <button
                onClick={(e) => {
                  // 모달 내에서 좋아요 누르기
                  const updatedItems = [...items];
                  const idx = items.findIndex(i => i.date === selectedItem.date && i.quote === selectedItem.quote);
                  if (idx !== -1) {
                    updatedItems[idx].likes += 1;
                    setItems(updatedItems);
                    setSelectedItem(updatedItems[idx]);
                    localStorage.setItem('liaollet_shelves', JSON.stringify(updatedItems));
                  }
                }}
                className="px-4 py-2 border border-archive-craft hover:bg-archive-craft/30 text-archive-dark transition-colors flex items-center space-x-1.5"
              >
                <span className="text-archive-terracotta">♥</span>
                <span>SAVED {selectedItem.likes}</span>
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-archive-dark text-archive-paper hover:bg-black transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}