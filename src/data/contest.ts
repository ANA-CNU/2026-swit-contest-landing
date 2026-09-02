/**
 * 대회 정보 콘텐츠.
 *
 * CLAUDE.md 의 "대회 정보" 절이 기준이다. 여기 없는 정보를 만들어 넣지 않는다.
 * 확정되지 않은 값은 컴포넌트에서 TODO 주석과 함께 비워 둔다.
 */

/** 섹션 목록. sticky 네비게이션이 이 순서와 라벨을 그대로 쓴다. */
export const SECTIONS = [
  { id: 'schedule', label: '대회 일정' },
  { id: 'venue', label: '대회 장소' },
  { id: 'eligibility', label: '참가 대상' },
  { id: 'rules', label: '대회 규칙' },
  { id: 'prizes', label: '대회 상금' },
  { id: 'apply', label: '참가 신청' },
] as const;

/**
 * 섹션 제목 아이콘. 이모지를 쓰지 않고 asset 오브젝트를 쓴다.
 * 일정과 규칙은 둘 다 keycab 이지만 같은 그림이 반복되지 않게 다른 파일을 골랐다.
 * 참가 대상은 사람을 가리키므로 figure 를 쓴다.
 */
export const SECTION_ICON: Record<string, string> = {
  schedule: '/assets/keycab/keycab_5.webp',
  venue: '/assets/sparkle/sparkle_9.webp',
  eligibility: '/assets/figure/figure_4.webp',
  rules: '/assets/keycab/keycab_7.webp',
  prizes: '/assets/corn/corn_1.webp',
};

/** 대회 일자. */
export const CONTEST_DATE = '2026.10.05 (월)';

/** 진행 일정. 실제 순서가 있는 유일한 콘텐츠라 번호를 붙인다. */
export const SCHEDULE = [
  { time: '12:00 - 13:00', title: '전문가 특강 세션' },
  { time: '13:00 - 13:30', title: '휴식 및 대회 OT' },
  { time: '13:30 - 16:30', title: '대회 진행' },
  { time: '16:30 - 18:00', title: '대회 문제 해설 및 시상식' },
] as const;

/** 대회 장소. */
export const VENUE = '충남대학교 제3학생회관 (N-7) 1층 영탑홀';

/** 참가 대상. */
export const ELIGIBILITY = [
  '충남대학교 및 대전·충청 지역 소재 대학 재학생',
  'COSS 컨소시엄 소속 대학 재학생',
  '3인으로 팀 구성',
] as const;

/** 대회 규칙. 허용과 금지를 나눠 담는다. */
export const RULES = {
  allowed: [
    'AOJ (ANA 온라인 저지 사이트) 에 접속 후 사전에 발부한 대회 전용 계정으로 참가',
    '본인이 지참한 노트북으로 문제 풀이 진행',
    'ICPC 평가 기준에 의거해 대회 진행',
    '프로그래밍 언어 선택 자유, IDE 사용 가능, 사전에 작성한 팀 노트 허용',
  ],
  forbidden: ['ChatGPT, Claude 등 자동으로 소스 코드를 작성해주는 서비스 사용 금지'],
} as const;

/** 대회 상금. 금액 내림차순이며 대상만 최상위 강조(gold)다. */
export const PRIZES = [
  { grade: '대상', amount: '600,000원', teams: '1팀', top: true },
  { grade: '금상', amount: '400,000원', teams: '2팀', top: false },
  { grade: '은상', amount: '200,000원', teams: '3팀', top: false },
  { grade: '동상', amount: '100,000원', teams: '5팀', top: false },
] as const;

export const PRIZE_NOTE =
  "수상 팀에는 상금과 함께 '충남대학교데이터보안활용 혁신융합대학사업단장상' 을 수여한다.";

/** 주최. */
export const HOST = '충남대학교 컴퓨터인공지능학부 알고리즘 동아리 ANA';

/**
 * 푸터 로고 자리. CLAUDE.md 는 넷을 배치하라고 한다 —
 * ANA, 충남대학교, 소프트웨어중심대학사업단, COSS.
 * 파일이 아직 없으므로 이름만 담은 플레이스홀더로 둔다.
 */
export const LOGOS = [
  'ANA',
  '충남대학교',
  '소프트웨어중심대학사업단',
  'COSS',
] as const;
