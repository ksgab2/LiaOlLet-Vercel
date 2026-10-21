import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

// 3가지 페르소나 데이터
const ASPECTS = [
  {
    id: 'lia',
    title: 'LIA',
    role: 'Text & Silhouette',
    desc: '문장의 잔상과 필름 프레임 속 피사체의 여백, 실루엣, 텍스트 서사 중심의 정제된 조형.',
    tags: '#문장잔상 #실루엣',
    mockupType: 'silhouette',
  },
  {
    id: 'ol',
    title: 'OL',
    role: 'Visual & Texture',
    desc: '찢어진 수제 종이의 거친 질감, 색면 구도와 시각적 파편이 만들어내는 명확한 시각성.',
    tags: '#종이질감 #시각파편',
    mockupType: 'texture',
  },
  {
    id: 'let',
    title: 'LET',
    role: 'Synthesis & Layer',
    desc: '필름 네거티브와 텍스트, 다층 오버레이 조화로 완성되는 차분하고 완성도 높은 융합.',
    tags: '#오버레이 #다층조화',
    mockupType: 'layer',
  },
];

export default function Aspect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // 선택 시 카드 애니메이션 (GSAP)
  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      const isSelected = selected === ASPECTS[index].id;
      const isDimmed = selected !== null && !isSelected;

      if (isSelected) {
        gsap.to(card, { scale: 1.05, y: -10, zIndex: 10, duration: 0.4, ease: "back.out(1.5)" });
      } else if (isDimmed) {
        gsap.to(card, { scale: 0.95, y: 0, zIndex: 1, opacity: 0.3, duration: 0.4 });
      } else {
        gsap.to(card, { scale: 1, y: 0, zIndex: 1, opacity: 1, duration: 0.4 });
      }
    });
  }, [selected]);

  // 호버 애니메이션 (마우스 올렸을 때)
  const handleMouseEnter = (index: number) => {
    if (selected !== null) return; // 선택된 상태에서는 호버 효과 무시
    gsap.to(cardsRef.current[index], { y: -10, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", duration: 0.3 });
  };

  const handleMouseLeave = (index: number) => {
    if (selected !== null) return;
    gsap.to(cardsRef.current[index], { y: 0, scale: 1, boxShadow: "0 10px 20px rgba(0,0,0,0.2)", duration: 0.3 });
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    sessionStorage.setItem('aspect', id); // 다음 페이지를 위해 세션에 저장
  };

  return (
    <div className="min-h-screen bg-archive-bg text-archive-paper flex flex-col justify-center items-center p-6 md:p-12 font-serif relative overflow-hidden">

      {/* 헤더 */}
      <div className="w-full max-w-5xl mb-12">
        <span className="font-mono text-xs text-archive-terracotta uppercase tracking-widest block mb-2">02. EXPRESSIONAL COMPONENT</span>
        <h2 className="text-3xl font-bold mb-3">아트워크를 구성할 주요 시선 레이어</h2>
        <p className="text-archive-craft text-sm">결과물을 이루는 LIA, OL, LET 중 어떤 조형적 관점에 비중을 둘지 선택합니다.</p>
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16 perspective-[1000px]">
        {ASPECTS.map((aspect, index) => (
          <div
            key={aspect.id}
            ref={(el) => { cardsRef.current[index] = el; }}
            onClick={() => handleSelect(aspect.id)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            className={`relative bg-archive-paper p-6 rounded-sm cursor-pointer transition-colors border-2 ${
              selected === aspect.id ? 'border-archive-terracotta' : 'border-transparent'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 테이프 장식 */}
            <div className="absolute -top-2 left-6 w-16 h-5 bg-archive-craft/70 -rotate-1 shadow-sm"></div>

            {/* 카드 그래픽 목업 영역 */}
            <div className="bg-[#1C1A18] p-4 mb-5 rounded-sm h-40 flex flex-col justify-between">
              <div className="flex justify-between font-mono text-[9px] text-archive-muted">
                <span>{aspect.id.toUpperCase()} ASPECT</span>
                <span>{aspect.role.split(' & ')[0]}</span>
              </div>

              {/* 목업 그래픽 */}
              <div className="flex-1 flex items-center justify-center">
                {aspect.mockupType === 'silhouette' && (
                  <div className="w-10 h-16 bg-archive-craft border border-archive-muted flex items-end justify-center pb-1">
                    <span className="text-[8px] font-serif italic text-archive-dark">Text</span>
                  </div>
                )}
                {aspect.mockupType === 'texture' && (
                  <div className="relative w-20 h-16">
                    <div className="absolute inset-0 bg-[#9B4028]/60 -rotate-6"></div>
                    <div className="absolute inset-0 bg-archive-craft/40 rotate-3 mix-blend-screen"></div>
                  </div>
                )}
                {aspect.mockupType === 'layer' && (
                  <div className="w-16 h-16 border border-archive-craft flex items-center justify-center text-[9px] font-mono text-archive-craft">
                    LAYER
                  </div>
                )}
              </div>
            </div>

            {/* 텍스트 정보 */}
            <div className="text-archive-dark">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-bold">{aspect.title}</h3>
                <span className="font-mono text-[10px] text-archive-terracotta uppercase">{aspect.role}</span>
              </div>
              <p className="text-xs text-archive-muted leading-relaxed mb-4 h-12">
                {aspect.desc}
              </p>
            </div>

            {/* 하단 태그 및 체크 아이콘 */}
            <div className="pt-3 border-t border-archive-craft/50 flex justify-between items-center font-mono text-[10px] text-archive-muted">
              <span>{aspect.tags}</span>
              <span className={`text-sm transition-opacity ${selected === aspect.id ? 'opacity-100 text-archive-terracotta font-bold' : 'opacity-0'}`}>
                ✓
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="w-full max-w-xs flex gap-4 mt-auto">
        <button
          onClick={() => navigate('/consent')}
          className="flex-1 py-3 border border-archive-muted text-archive-craft font-mono text-sm hover:bg-archive-muted/20 transition-colors"
        >
          ← BACK
        </button>
        <button
          onClick={() => {
            if (selected) navigate('/entry');
            else alert('스타일을 먼저 선택해주세요.');
          }}
          disabled={!selected}
          className={`flex-1 py-3 font-mono text-sm font-bold transition-colors ${
            selected 
              ? 'bg-archive-paper text-archive-dark hover:bg-white' 
              : 'bg-archive-muted/30 text-archive-muted cursor-not-allowed'
          }`}
        >
          NEXT →
        </button>
      </div>

    </div>
  );
}