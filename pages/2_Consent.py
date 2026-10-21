import datetime
import streamlit as st

# 1. 완전한 일체형 서류 스타일 CSS (모든 요소를 하나의 종이 레이어 안에 완벽 수납)
st.markdown(
    """
<style>
    /* 전체 배경 톤 */
    .stApp, header[data-testid="stHeader"] {
        background-color: #E8E2D5 !important;
    }

    .block-container {
        padding-top: 2.5rem !important;
        padding-bottom: 2.5rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        max-width: 100% !important;
    }

    /* 서류철 바깥쪽 갈색 액자 프레임 */
    .document-frame {
        background-color: #26201B;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        position: relative;
        max-width: 420px;
        margin: 0 auto;
    }

    /* 아래 깔린 서류 레이어 (그림자 효과용) */
    .document-layer-back {
        background-color: #E2DBD0;
        border-radius: 8px;
        padding: 4px;
        position: relative;
    }

    /* 메인 종이 문서 레이어 */
    .document-paper {
        background-color: #F7F3EC;
        border-radius: 6px;
        padding: 32px 22px 28px 22px;
        position: relative;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.03);
    }

    /* 상단 마스킹 테이프 */
    .document-paper::before {
        content: "";
        position: absolute;
        top: -16px;
        left: 50%;
        transform: translateX(-50%) rotate(-1.5deg);
        width: 100px;
        height: 24px;
        background-color: rgba(214, 204, 189, 0.92);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 10;
    }

    /* 문서 타이틀 및 텍스트 스타일 */
    .page-num { text-align: right; font-family: 'Space Mono', monospace; font-size: 11px; color: #7A6F64; margin-bottom: 6px; letter-spacing: 1px; }
    .paper-title { font-size: 25px; font-weight: 800; color: #1C1815; margin-bottom: 4px; font-family: 'Noto Serif KR', serif; }
    .paper-sub { font-size: 13.5px; color: #615549; margin-bottom: 22px; font-family: 'Noto Serif KR', serif; }
    .sub-text { margin-left: 28px; margin-top: -6px; margin-bottom: 14px; font-size: 11px; color: #75685B; font-family: 'Noto Serif KR'; word-break: keep-all; }

    /* Streamlit 체크박스 간격 미세 조정 */
    div[data-testid="stCheckbox"] {
        margin-bottom: 2px !important;
    }
    div[data-testid="stCheckbox"] label p {
        color: #1C1815 !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        line-height: 1.55 !important;
        word-break: keep-all;
    }
    div[data-testid="stCheckbox"] div[role="checkbox"] {
        border-radius: 2px !important;
        border: 1.5px solid #1C1815 !important;
        width: 20px !important;
        height: 20px !important;
        background-color: #FCFAF7 !important;
    }
    div[data-testid="stCheckbox"] div[role="checkbox"][aria-checked="true"] {
        border-color: #1C1815 !important;
        background-color: #1C1815 !important;
    }
    div[data-testid="stCheckbox"] svg {
        fill: #F7F3EC !important;
        width: 14px !important;
        height: 14px !important;
    }

    /* 종이 문서 안쪽에 딱 붙는 하단 액션 영역 (버튼 + 스탬프) */
    .paper-bottom-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 24px;
        gap: 12px;
        position: relative;
    }

    /* 버튼 스타일 */
    div.stButton > button {
        height: 44px !important;
        font-size: 14px !important;
        font-family: 'Noto Serif KR', serif !important;
        border-radius: 2px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    div.stButton > button[kind="secondary"] {
        background-color: #F7F3EC !important;
        color: #1C1815 !important;
        border: 1.5px solid #1C1815 !important;
    }
    div.stButton > button[kind="primary"] {
        background-color: #26201B !important;
        color: #F7F3EC !important;
        border: 1.5px solid #26201B !important;
    }

    /* 서류 결재 도장 (스탬프) */
    .stamp {
        border: 2px solid #A64E55;
        border-radius: 50%;
        color: #A64E55;
        width: 74px;
        height: 74px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transform: rotate(-10deg);
        font-family: 'Space Mono', monospace;
        text-align: center;
        background-color: rgba(166, 78, 85, 0.04);
        box-shadow: inset 0 0 6px rgba(166, 78, 85, 0.12);
        flex-shrink: 0;
    }
</style>
""",
    unsafe_allow_html=True,
)


# 세션 상태 초기화
if "c1" not in st.session_state:
  st.session_state.c1 = False
if "c2" not in st.session_state:
  st.session_state.c2 = False
if "c3" not in st.session_state:
  st.session_state.c3 = False


def agree_all():
  st.session_state.c1 = True
  st.session_state.c2 = True
  st.session_state.c3 = True


# 2. 문서 레이어 시작 (HTML 마크업으로 상단 종이 영역 오픈)
st.markdown(
    """
    <div class="document-frame">
        <div class="document-layer-back">
            <div class="document-paper">
                <div class="page-num">p.02 / 07</div>
                <div class="paper-title">입장 동의서</div>
                <div class="paper-sub">다락방에 들어가기 전, 작은 약속</div>
""",
    unsafe_allow_html=True,
)

# 체크박스 위젯들 (종이 카드 내부 영역)
st.checkbox("업로드한 사진과 문장은 작품 생성에만 사용됩니다.", key="c1")

st.checkbox("사진 속 인물이 작품에 반영될 수 있습니다.", key="c2")
st.markdown(
    "<div class='sub-text'>타인의 동의 없는 사진은 올리지 말아 주세요.</div>",
    unsafe_allow_html=True,
)

st.checkbox(
    "완성된 작품이 익명으로 '취향의 서가'에 전시·활용되는 것에 동의합니다.",
    key="c3",
)

# 3. 문서 내부 하단 영역 레이어 오픈 (버튼과 스탬프가 종이 영역 안에 묶이도록 처리)
st.markdown('<div class="paper-bottom-section">', unsafe_allow_html=True)

c_btn, c_stamp = st.columns([1.2, 1], vertical_alignment="center")
with c_btn:
  st.button(
      "모두 동의", use_container_width=True, on_click=agree_all, type="secondary"
  )

with c_stamp:
  if st.session_state.c1 and st.session_state.c2 and st.session_state.c3:
    today = datetime.date.today().strftime("%Y.%m.%d")
    st.markdown(
        f"""
        <div class="stamp">
            <div style="font-size: 7px; letter-spacing: 1px; font-weight: bold;">LIAOLLET</div>
            <div style="font-size: 8px; letter-spacing: 1px; font-weight: bold; margin: 1px 0;">AGREED</div>
            <div style="font-size: 6px;">{today}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.markdown("</div>", unsafe_allow_html=True)  # paper-bottom-section 닫기

# 4. 종이 문서 레이어 마감 태그 (여기서 문서 카드가 완전히 닫힙니다)
st.markdown(
    """
            </div>
        </div>
    </div>
""",
    unsafe_allow_html=True,
)

st.markdown("<br>", unsafe_allow_html=True)

# 5. 페이지 이동 버튼 (이전 / 다음 장은 문서 액자 바깥 하단에 독립 배치)
b1, b2 = st.columns(2)
with b1:
  if st.button("← 이전", use_container_width=True, type="secondary"):
    st.switch_page("pages/1_Cover.py")
with b2:
  is_valid = st.session_state.c1 and st.session_state.c3
  if st.button(
      "다음 장 →", type="primary", use_container_width=True, disabled=not is_valid
  ):
    st.session_state.consent_given = True
    st.session_state.gallery_public = st.session_state.c3
    st.switch_page("pages/3_Aspect.py")