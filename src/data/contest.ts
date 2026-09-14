/**
 * 대회 정보 콘텐츠.
 *
 * CLAUDE.md 의 "대회 정보" 절이 기준이다. 여기 없는 정보를 만들어 넣지 않는다.
 * 확정되지 않은 값은 컴포넌트에서 TODO 주석과 함께 비워 둔다.
 */

/** 섹션 목록. sticky 네비게이션이 이 순서와 라벨을 그대로 쓴다. */
export const SECTIONS = [
    { id: "schedule", label: "대회 일정" },
    { id: "venue", label: "대회 장소" },
    { id: "eligibility", label: "참가 대상" },
    { id: "rules", label: "대회 규칙" },
    { id: "prizes", label: "대회 상금" },
    { id: "gallery", label: "지난 대회" },
    { id: "apply", label: "참가 신청" },
] as const;

/**
 * 섹션 제목 아이콘. 이모지를 쓰지 않고 asset 오브젝트를 쓴다.
 * 일정과 규칙은 둘 다 keycab 이지만 같은 그림이 반복되지 않게 다른 파일을 골랐다.
 * 참가 대상은 사람을 가리키므로 figure 를 쓴다.
 */
export const SECTION_ICON: Record<string, string> = {
    schedule: "/assets/keycab/keycab_5.webp",
    venue: "/assets/sparkle/sparkle_9.webp",
    eligibility: "/assets/figure/figure_4.webp",
    rules: "/assets/keycab/keycab_7.webp",
    prizes: "/assets/corn/corn_1.webp",
    gallery: "/assets/sparkle/sparkle_13.webp",
};

/**
 * 지난 대회 사진의 대체 텍스트.
 *
 * 사진은 장식이 아니라 콘텐츠다. 파일명을 키로 두고, 새 사진이 들어와도
 * 빈 alt 로 나가지 않게 GALLERY_ALT_FALLBACK 을 쓴다. 사진을 추가하면 여기에
 * 한 줄 적어 주는 게 좋다.
 */
export const GALLERY_ALT: Record<string, string> = {
    gallery_1:
        "지난 SW-IT Contest 대회장에서 참가자들이 노트북으로 문제를 푸는 모습",
    gallery_2:
        "지난 SW-IT Contest 를 마치고 참가자 전원이 무대 앞에서 찍은 단체 사진",
    gallery_3: "SW-IT CONTEST 현수막을 들고 무대 위에서 기념 촬영하는 운영진",
    gallery_4:
        "대회 소개 화면이 걸린 강의실에서 참가자들이 노트북을 펴고 대기하는 모습",
};

export const GALLERY_ALT_FALLBACK = "지난 SW-IT Contest 현장 사진";

/**
 * '지난 대회' 섹션 맨 아래 버튼 두 개.
 *
 * 한 배열에 두는 이유는 둘이 한 쌍으로 보여야 하기 때문이다. 주소가 흩어져
 * 있으면 한쪽만 바뀌었을 때 다른 쪽과 모양이 갈리는 것을 놓친다.
 * PastGallery 가 이 배열을 그대로 돌려 같은 스타일의 버튼을 만든다.
 *
 * 대회 규칙의 AOJ 링크(LINKS.aoj)와는 목적이 다르다. 저건 대회 당일 접속할
 * 사이트 안내이고 이건 기출 문제 아카이브다. 주소가 같은 도메인이라고 해서
 * 합치지 않는다.
 */
export const GALLERY_LINKS = [
    {
        label: "더 많은 사진 보기",
        href: "https://www.instagram.com/stories/highlights/17897581755296007/",
    },
    { label: "역대 기출 문제 보기", href: "https://aoj.anacnu.kr/sources/7" },
] as const;

/**
 * 위 버튼 아래 한 줄.
 *
 * 4년째 이어져 온 대회라는 신호이자, 참가를 고민하는 사람이 난이도를 가늠할
 * 근거다. 문제 수는 적지 않는다 — 아카이브가 늘거나 정리되면 틀린 정보가 된다.
 */
export const GALLERY_LINKS_NOTE =
    "2022년부터 2025년까지 네 번의 대회 문제가 AOJ에 공개되어 있습니다.";

/** 대회 일자. */
export const CONTEST_DATE = "2026.10.05 (월)";

/** 진행 일정. 실제 순서가 있는 유일한 콘텐츠라 번호를 붙인다. */
export const SCHEDULE = [
    { time: "12:00 - 13:00", title: "전문가 특강 세션" },
    { time: "13:00 - 13:30", title: "휴식 및 대회 OT" },
    { time: "13:30 - 16:30", title: "대회 진행" },
    { time: "16:30 - 18:00", title: "대회 문제 해설 및 시상식" },
] as const;

/** 대회 장소. */
export const VENUE = "충남대학교 제3학생회관 (N-7) 1층 영탑홀";

/**
 * 영탑홀 좌표. 주소 지오코딩을 하지 않고 이 값을 그대로 쓴다.
 * 마커가 실제 위치와 어긋나면 아래 두 숫자만 조정하면 된다.
 *
 * level 은 카카오맵 확대 수준이며 작을수록 확대된다.
 * 3 이면 건물 하나가 식별되는 정도다.
 */
export const VENUE_COORD = {
    lat: 36.3716235,
    lng: 127.3450588,
    level: 3,
    label: "영탑홀",
} as const;

/**
 * 카카오맵 길찾기 주소. 형식은 /link/to/이름,위도,경도 다.
 * 지도가 뜨지 않는 상황에서도 이 링크는 항상 표시된다.
 */
export const KAKAO_DIRECTIONS_URL = `https://map.kakao.com/link/to/${encodeURIComponent(
    VENUE_COORD.label,
)},${VENUE_COORD.lat},${VENUE_COORD.lng}`;

/**
 * 참가 대상. 전부 명사형으로 끝난다.
 *
 * 타 대학 인원 제한은 여기 넣지 않는다. 존댓말 한 문장이라 어투가 섞이고,
 * 자격 조건이 아니라 신청을 서두르라는 안내라 성격도 다르다.
 * ELIGIBILITY_NOTICE 로 분리해 목록 아래 박스로 띄운다.
 */
export const ELIGIBILITY = [
    "충남대학교 및 대전·충청 지역 소재 대학 재학생",
    "COSS 컨소시엄 소속 대학 재학생",
    "1~3인으로 팀 구성",
] as const;

/**
 * 참가 대상 목록 아래 안내 박스.
 *
 * em: true 인 조각만 강조된다 (NoticeBox). 인원 상한과 반려 가능성 두 곳이며,
 * 이 둘이 '빨리 신청해야 하는 이유' 의 전부다.
 */
export const ELIGIBILITY_NOTICE = [
    { text: "타 대학 재학생은 " },
    { text: "대학별 선착순 6명", em: true },
    { text: "까지 참가할 수 있으며, 수용 인원에 따라 신청이 " },
    { text: "반려될 수 있으니", em: true },
    { text: " 빠른 신청 바랍니다." },
] as const;

/**
 * 본문에서 링크로 거는 외부 주소.
 * 마크업에서는 공유 클래스 .text-link 를 붙인다 (src/styles/global.css).
 */
export const LINKS = {
    ana: "https://anacnu.kr/",
    aoj: "https://aoj.anacnu.kr/",
} as const;

/**
 * 대회 규칙 한 항목.
 * lead 가 있으면 항목 맨 앞이 링크로 시작하고, text 가 그 뒤를 잇는다.
 */
type RuleItem = {
    lead?: { text: string; href: string };
    text: string;
};

/** 대회 규칙. 허용과 금지를 나눠 담는다. */
export const RULES: { allowed: RuleItem[]; forbidden: string[] } = {
    allowed: [
        {
            // 링크 범위는 괄호를 포함한 이름 전체다.
            lead: { text: "AOJ (ANA 온라인 저지 사이트)", href: LINKS.aoj },
            text: " 에 접속 후 사전에 발부한 대회 전용 계정으로 참가",
        },
        { text: "본인이 지참한 노트북으로 문제 풀이 진행" },
        { text: "ICPC 평가 기준에 의거해 대회 진행" },
        {
            text: "프로그래밍 언어 선택 자유, IDE 사용 가능, 사전에 작성한 팀 노트 허용",
        },
    ],
    forbidden: [
        "ChatGPT, Claude 등 자동으로 소스 코드를 작성해주는 서비스 사용 금지",
    ],
};

/** 대회 상금. 금액 내림차순이며 대상만 최상위 강조(gold)다. */
export const PRIZES = [
    { grade: "대상", amount: "600,000원", teams: "1팀", top: true },
    { grade: "금상", amount: "450,000원", teams: "1팀", top: false },
    { grade: "은상", amount: "300,000원", teams: "2팀", top: false },
    { grade: "동상", amount: "150,000원", teams: "5팀", top: false },
] as const;

export const PRIZE_NOTE = [
    "* 수상 팀은 '충남대학교데이터보안활용 혁신융합대학사업단장상' 을 수여",
    "* 충남대학교 소속 학생: 충남대 COSS 사업단에서 시상금 지급",
    "* COSS 컨소시엄 참여대학 소속 학생: 소속 대학 COSS 사업단에서 시상금 지급",
    "* 기타 참가자(위 대상 외): 충남대 COSS 사업단에서 시상금에 상응하는 부상(상품)으로 대체 지급",
] as const;

/** 주최. */
export const HOST = "충남대학교 컴퓨터인공지능학부 알고리즘 동아리 ANA";

/**
 * 푸터 로고 넷 — ANA, 충남대학교, 소프트웨어중심대학사업단, COSS (CLAUDE.md "로고" 절).
 *
 * width 는 표시 폭(px)이다. 높이를 고정하지 않고 폭으로 맞춘 뒤 세로 중앙 정렬한다.
 * 로고마다 종횡비가 1.79 ~ 6.86 으로 크게 달라 같은 높이를 주면 가로형 워드마크가
 * 훨씬 커 보인다. 그래서 폭을 개별로 잡아 표시 높이가 40~50px 안에 들어오게 했다.
 * 괄호 안이 그 폭에서 나오는 실제 표시 높이다.
 */
export const LOGOS = [
    {
        src: "/assets/logo/logo_ana.webp",
        name: "ANA",
        width: 82,
        url: "https://anacnu.kr/",
    }, // 높이 46px
    {
        src: "/assets/logo/logo_cnu.webp",
        name: "충남대학교",
        width: 132,
        url: "https://plus.cnu.ac.kr/",
    }, // 높이 45px
    {
        src: "/assets/logo/logo_swuniv.webp",
        name: "소프트웨어중심대학사업단",
        width: 280,
        url: "https://swuniv.cnu.ac.kr/",
    }, // 높이 41px
    {
        src: "/assets/logo/logo_coss.webp",
        name: "COSS",
        width: 104,
        url: "https://www.cossnet.com/",
    }, // 높이 47px
] as const;
