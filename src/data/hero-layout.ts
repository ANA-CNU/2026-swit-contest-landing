/**
 * 히어로 버스트 배치 상수.
 *
 * 포스터 상단 일러스트가 애니메이션의 종료 상태다. 오브젝트는 사람 머리 위
 * 지점(= 버스트 원점)에서 뿜어져 나와 여기 정의된 최종 구도로 정착한다.
 *
 * 모든 값은 하드코딩이다. Math.random() 을 쓰지 않는다.
 * 새로고침마다 구도가 바뀌면 안 되기 때문이다.
 *
 * 좌표계
 *   스테이지는 고정 aspect-ratio 도, 고정 비율도 아니다. 100vh 에서 제목 블록을
 *   뺀 나머지 공간이다.
 *   따라서 크기가 뷰포트에 따라 변한다. 기준 길이(대각선)는 하드코딩하지 않고
 *   CSS 가 런타임에 `hypot(100cqw, 100cqh)` 로 실제 컨테이너 크기에서 구한다.
 *   (스테이지에 container-type: size 를 걸어 cqw/cqh 가 스테이지 크기를 가리킨다.)
 *
 *   - angle  원점 기준 각도(deg). 양수는 위쪽.
 *   - dist   원점에서의 거리. 스테이지 대각선 대비 비율.
 *   - size   표시 폭. 스테이지 폭 대비 %(= cqw).
 *
 *   위치·크기는 CSS calc 로만 계산하므로 JS 없이 최종 구도가 나온다.
 *   애니메이션이 꺼진 경우(reduced-motion, 640px 이하)에도 그대로 렌더된다.
 */

/**
 * 버스트 원점 — 사람 실루엣의 머리 위 지점.
 * 광선·픽셀·오브젝트가 모두 이 점에서 출발한다.
 * x 는 스테이지 폭 대비 %, y 는 스테이지 높이 대비 %.
 * 이 값을 옮기면 부채꼴 전체가 따라 움직인다. 구도 조정은 여기만 고친다.
 */
export const ORIGIN = { xPct: 10, yPct: 62 } as const;

/**
 * figure_1 — 서 있는 실루엣. 좌하단에 고정하며 애니메이션 대상이 아니다.
 * figure_2 는 뿜어지는 요소가 함께 그려져 있어 개별 오브젝트와 중복되므로 쓰지 않는다.
 *
 * heightPct 는 스테이지(분사 영역) 높이 대비 %다. 스테이지 높이는 100vh 에서
 * 제목 블록 내용 높이를 뺀 나머지이므로 뷰포트에 따라 변한다.
 */
export const FIGURE = {
  src: '/assets/figure/figure_1.webp',
  ratio: 0.443,
  heightPct: 32,
} as const;

/** 애니메이션 타임라인 (ms). 총 진행 시간은 1.4초 이내로 유지한다. */
export const TIMING = {
  rayStart: 0,
  rayDur: 380,
  rayStagger: 90,
  objStart: 360,
  objStagger: 360,
  objDur: 620,
  titleSwit: 860,
  titleContest: 1000,
  titleDur: 380,
} as const;

/** 마지막 애니메이션이 끝나는 시점(ms). 1400 을 넘으면 안 된다. */
export const TIMELINE_END = Math.max(
  TIMING.rayStart + TIMING.rayStagger + TIMING.rayDur,
  TIMING.objStart + TIMING.objStagger + TIMING.objDur,
  TIMING.titleContest + TIMING.titleDur,
);

export interface HeroObject {
  /** public/assets/ 아래 경로. scripts/build-assets.py 가 생성한다. */
  src: string;
  /** 크롭 후 종횡비 w/h. src/data/assets.json 에서 가져온 값이다. */
  ratio: number;
  /** 원점 기준 각도(deg). -35 ~ 78 에 고르게 분포. 광선 각도를 피하지 않는다. */
  angle: number;
  /** 원점에서의 거리. 스테이지 대각선 대비 비율. */
  dist: number;
  /** 표시 폭. 스테이지 폭 대비 %. dist 에 비례한다(원근). */
  size: number;
  /**
   * 오브젝트끼리의 겹침 순서. 1~50 이며 종류를 섞어 배분해 서로 겹치게 했다.
   *
   * 이 값은 오브젝트 레이어 안에서만 의미가 있다. 광선과의 앞뒤는 z 로
   * 정하지 않는다 — Hero.astro 의 .layer--objects 가 isolation: isolate 로
   * 쌓임 문맥을 만들어 여기 어떤 값을 넣어도 광선 레이어 밖으로 나갈 수 없다.
   * 그래서 이 숫자를 마음대로 바꿔도 광선이 오브젝트 앞으로 튀어나오지 않는다.
   */
  z: number;
  /**
   * 최종 회전(deg). CSS rotate 와 같은 방향이라 양수가 시계방향이다.
   * 애니메이션 대상이 아니다 — 정착한 뒤에도 유지되는 정적인 값이다.
   *
   * 크롭 원본에 이미 회전이 구워져 있으므로 이 값은 원본 방향에 더해진다.
   * 옥수수를 제외한 나머지는 0 이다. 옥수수만 쓰는 이유는 아래 배치 목록 주석 참조.
   */
  tilt: number;
  /**
   * 비행 중 스핀(deg). 원점에서 출발할 때의 추가 회전이며 정착하면서 0 으로 풀린다.
   * 최종 회전은 spin 이 아니라 tilt 가 정한다.
   */
  spin: number;
}

/**
 * 배치 목록 — 50개. figure_1 을 더해 오브젝트 51개다.
 * pixel_* 에셋은 쓰지 않는다. 광선 레이어에도 오브젝트 레이어에도 없다.
 *
 * 사용 파일 33종 (corn_5, corn_7, popcorn_1 은 쓰지 않는다)
 *   corn     1, 2, 3, 4, 6            가장 큰 크기(최대 16%)
 *   popcorn  2, 3, 5, 7, 9, 11, 12    중간 크기
 *   keycab   3, 4, 6, 7, 8            중간 크기. 화살표와 괄호를 우선했다
 *   sparkle  1~16 전부                가장 작은 크기(최소 1.2%)
 *
 * 같은 src 를 여러 항목에서 재사용한다. 중복은 같은 파일을 다시 내려받지 않으므로
 * 전송량이 늘지 않고, 광선 다발 내부를 채우는 데 쓴다. 중복 시 조건:
 *   - 서로 인접하지 않게 angle 을 15도 이상 또는 dist 를 0.18 이상 벌린다
 *   - size 를 다르게 준다 (dist 에 비례하므로 dist 가 다르면 자동으로 달라진다)
 *   - spin 을 다르게 준다
 *
 * 광선을 피해 배치하지 않는다. 오브젝트가 광선 위에 겹쳐 함께 뿜어져 나가는
 * 것으로 읽히게 하는 것이 목적이며, 18개 항목이 광선 각도와 2도 이내다.
 *
 * 영역 배분 (기준 스테이지 1440x585px 에서 검증)
 *   부채꼴 내부 중거리  angle -8 ~ 34,  dist 0.16 ~ 0.47
 *   좌하단              angle -35 ~ -20, dist 0.13 ~ 0.26
 *   중앙 하단           angle -18 ~ -5,  dist 0.30 ~ 0.62
 *   고각(좌상)          angle 40 ~ 78,   dist 0.11 ~ 0.245
 *   우측 원거리         angle -1 ~ 18,   dist 0.55 ~ 0.87
 *   원점 근처           angle -28 ~ 50,  dist 0.065 ~ 0.11
 *
 * angle 은 -35 ~ 78 전 범위에 고르게 퍼져 있다(인접 항목 최대 간격 6도).
 * dist 가 큰 corn_2 는 프레임 우측에 걸쳐 잘린다. 의도된 동작이다.
 *
 * z 는 종류를 섞어 배분해 오브젝트끼리 겹치게 했다. 1~50 이며 오브젝트 레이어
 * 안에서만 의미가 있다. 광선은 구조적으로 항상 최후방이다(HeroObject.z 주석 참조).
 *
 * ── 옥수수의 tilt
 *
 * corn_1/2/3/4/6 원본은 다섯 개가 모두 같은 방향으로 그려져 있다. 알파 채널
 * 2차 모멘트로 재 보면 장축이 전부 수직(±88~90도)이고 편차가 5.7도뿐이며,
 * 뾰족한 배아 쪽이 다섯 다 아래를 향한다. 그대로 두면 여덟 개가 열병식처럼
 * 같은 방향으로 정렬돼 보인다.
 *
 * 그래서 항목별로 최종 회전(tilt)을 준다. 값은 화면상 실제 위치를 계산해
 * 아래 조건을 만족하도록 고른 것이다.
 *   - 여덟 개가 서로 12도 이상 다르다
 *   - 최근접 이웃끼리는 48도 이상 벌어지고 기울기 부호가 반대다
 *     (한쪽이 시계방향이면 다른 쪽은 반시계방향)
 *   - 두 번째 이웃(450~750px)끼리도 24도 이상 다르다
 *   - |tilt| <= 84 로 제한한다. 90 을 넘으면 알이 뒤집혀 보인다
 *
 * 결과 뾰족한 쪽 방향: -6, -102, -150, -18, -66, -126, -174, -42 도
 * (0 = 오른쪽, 양수 = 위). 아래·좌·우로 퍼지고 위를 향하는 것은 없다.
 */
export const HERO_OBJECTS: readonly HeroObject[] = [
  // corn
  { src: '/assets/corn/corn_2.webp', ratio: 0.826, angle: 0.5, dist: 0.87, size: 16.0, z: 1, tilt: -84, spin: -68 },
  { src: '/assets/corn/corn_1.webp', ratio: 0.824, angle: 12.0, dist: 0.66, size: 13.1, z: 8, tilt: 12, spin: -226 },
  { src: '/assets/corn/corn_4.webp', ratio: 0.844, angle: -9.0, dist: 0.52, size: 11.17, z: 15, tilt: 60, spin: 238 },
  { src: '/assets/corn/corn_3.webp', ratio: 0.842, angle: 20.0, dist: 0.42, size: 9.79, z: 22, tilt: -72, spin: -128 },
  { src: '/assets/corn/corn_6.webp', ratio: 0.822, angle: -18.0, dist: 0.32, size: 8.41, z: 29, tilt: -24, spin: 96 },
  { src: '/assets/corn/corn_1.webp', ratio: 0.824, angle: 33.0, dist: 0.26, size: 7.59, z: 36, tilt: 36, spin: 152 },
  { src: '/assets/corn/corn_3.webp', ratio: 0.842, angle: -27.0, dist: 0.19, size: 6.62, z: 43, tilt: 84, spin: 98 },
  { src: '/assets/corn/corn_6.webp', ratio: 0.822, angle: 50.0, dist: 0.145, size: 6.0, z: 50, tilt: -48, spin: 264 },
  // popcorn
  { src: '/assets/popcorn/popcorn_9.webp', ratio: 0.898, angle: -1.0, dist: 0.78, size: 7.6, z: 7, tilt: 0, spin: -104 },
  { src: '/assets/popcorn/popcorn_7.webp', ratio: 0.953, angle: 6.0, dist: 0.72, size: 7.11, z: 14, tilt: 0, spin: 74 },
  { src: '/assets/popcorn/popcorn_3.webp', ratio: 0.936, angle: 18.0, dist: 0.55, size: 5.71, z: 21, tilt: 0, spin: 208 },
  { src: '/assets/popcorn/popcorn_3.webp', ratio: 0.936, angle: -5.0, dist: 0.61, size: 6.2, z: 28, tilt: 0, spin: 238 },
  { src: '/assets/popcorn/popcorn_7.webp', ratio: 0.953, angle: -11.0, dist: 0.47, size: 5.05, z: 35, tilt: 0, spin: -172 },
  { src: '/assets/popcorn/popcorn_11.webp', ratio: 0.858, angle: -13.0, dist: 0.42, size: 4.64, z: 42, tilt: 0, spin: 316 },
  { src: '/assets/popcorn/popcorn_12.webp', ratio: 1.006, angle: 26.0, dist: 0.4, size: 4.48, z: 49, tilt: 0, spin: 121 },
  { src: '/assets/popcorn/popcorn_5.webp', ratio: 0.865, angle: 8.0, dist: 0.34, size: 3.99, z: 6, tilt: 0, spin: -93 },
  { src: '/assets/popcorn/popcorn_5.webp', ratio: 0.865, angle: -16.0, dist: 0.3, size: 3.66, z: 13, tilt: 0, spin: -158 },
  { src: '/assets/popcorn/popcorn_2.webp', ratio: 0.842, angle: -24.0, dist: 0.26, size: 3.33, z: 20, tilt: 0, spin: -215 },
  { src: '/assets/popcorn/popcorn_11.webp', ratio: 0.858, angle: 34.0, dist: 0.22, size: 3.0, z: 27, tilt: 0, spin: 112 },
  { src: '/assets/popcorn/popcorn_12.webp', ratio: 1.006, angle: -8.0, dist: 0.22, size: 3.0, z: 34, tilt: 0, spin: 58 },
  // keycab
  { src: '/assets/keycab/keycab_7.webp', ratio: 1.085, angle: 2.0, dist: 0.47, size: 5.0, z: 41, tilt: 0, spin: -47 },
  { src: '/assets/keycab/keycab_3.webp', ratio: 1.078, angle: -2.0, dist: 0.35, size: 3.84, z: 48, tilt: 0, spin: -63 },
  { src: '/assets/keycab/keycab_8.webp', ratio: 1.085, angle: 4.0, dist: 0.3, size: 3.36, z: 5, tilt: 0, spin: 143 },
  { src: '/assets/keycab/keycab_6.webp', ratio: 1.08, angle: 12.0, dist: 0.24, size: 2.79, z: 12, tilt: 0, spin: -76 },
  { src: '/assets/keycab/keycab_8.webp', ratio: 1.085, angle: 52.0, dist: 0.235, size: 2.74, z: 19, tilt: 0, spin: 66 },
  { src: '/assets/keycab/keycab_4.webp', ratio: 1.082, angle: 74.0, dist: 0.22, size: 2.59, z: 26, tilt: 0, spin: -42 },
  { src: '/assets/keycab/keycab_7.webp', ratio: 1.085, angle: 40.0, dist: 0.2, size: 2.4, z: 33, tilt: 0, spin: 84 },
  // sparkle
  { src: '/assets/sparkle/sparkle_6.webp', ratio: 0.809, angle: 14.0, dist: 0.8, size: 4.2, z: 40, tilt: 0, spin: 37 },
  { src: '/assets/sparkle/sparkle_5.webp', ratio: 0.793, angle: -6.0, dist: 0.62, size: 3.47, z: 47, tilt: 0, spin: 196 },
  { src: '/assets/sparkle/sparkle_7.webp', ratio: 0.811, angle: 8.0, dist: 0.44, size: 2.73, z: 4, tilt: 0, spin: -54 },
  { src: '/assets/sparkle/sparkle_12.webp', ratio: 0.772, angle: 20.0, dist: 0.3, size: 2.16, z: 11, tilt: 0, spin: 176 },
  { src: '/assets/sparkle/sparkle_4.webp', ratio: 0.592, angle: 61.0, dist: 0.245, size: 1.93, z: 18, tilt: 0, spin: -262 },
  { src: '/assets/sparkle/sparkle_11.webp', ratio: 0.678, angle: -4.0, dist: 0.24, size: 1.91, z: 25, tilt: 0, spin: 284 },
  { src: '/assets/sparkle/sparkle_1.webp', ratio: 0.588, angle: -35.0, dist: 0.22, size: 1.83, z: 32, tilt: 0, spin: -134 },
  { src: '/assets/sparkle/sparkle_9.webp', ratio: 0.679, angle: 25.0, dist: 0.2, size: 1.75, z: 39, tilt: 0, spin: -186 },
  { src: '/assets/sparkle/sparkle_15.webp', ratio: 0.75, angle: 64.0, dist: 0.19, size: 1.71, z: 46, tilt: 0, spin: -31 },
  { src: '/assets/sparkle/sparkle_10.webp', ratio: 0.782, angle: 1.0, dist: 0.18, size: 1.67, z: 3, tilt: 0, spin: 128 },
  { src: '/assets/sparkle/sparkle_2.webp', ratio: 0.67, angle: -30.0, dist: 0.17, size: 1.63, z: 10, tilt: 0, spin: -208 },
  { src: '/assets/sparkle/sparkle_8.webp', ratio: 0.797, angle: 16.0, dist: 0.16, size: 1.59, z: 17, tilt: 0, spin: 244 },
  { src: '/assets/sparkle/sparkle_13.webp', ratio: 0.734, angle: 46.0, dist: 0.16, size: 1.59, z: 24, tilt: 0, spin: -118 },
  { src: '/assets/sparkle/sparkle_16.webp', ratio: 0.736, angle: 70.0, dist: 0.145, size: 1.53, z: 31, tilt: 0, spin: 92 },
  { src: '/assets/sparkle/sparkle_3.webp', ratio: 0.59, angle: -33.0, dist: 0.13, size: 1.47, z: 38, tilt: 0, spin: -244 },
  { src: '/assets/sparkle/sparkle_14.webp', ratio: 0.773, angle: 58.0, dist: 0.13, size: 1.47, z: 45, tilt: 0, spin: 168 },
  { src: '/assets/sparkle/sparkle_4.webp', ratio: 0.592, angle: -20.0, dist: 0.2, size: 1.75, z: 2, tilt: 0, spin: -88 },
  { src: '/assets/sparkle/sparkle_2.webp', ratio: 0.67, angle: 78.0, dist: 0.11, size: 1.38, z: 9, tilt: 0, spin: 212 },
  { src: '/assets/sparkle/sparkle_15.webp', ratio: 0.75, angle: -28.0, dist: 0.11, size: 1.38, z: 16, tilt: 0, spin: -68 },
  { src: '/assets/sparkle/sparkle_11.webp', ratio: 0.678, angle: 50.0, dist: 0.1, size: 1.34, z: 23, tilt: 0, spin: -226 },
  { src: '/assets/sparkle/sparkle_5.webp', ratio: 0.793, angle: -12.0, dist: 0.09, size: 1.3, z: 30, tilt: 0, spin: 238 },
  { src: '/assets/sparkle/sparkle_13.webp', ratio: 0.734, angle: 30.0, dist: 0.075, size: 1.24, z: 37, tilt: 0, spin: -128 },
  { src: '/assets/sparkle/sparkle_7.webp', ratio: 0.811, angle: 44.0, dist: 0.065, size: 1.2, z: 44, tilt: 0, spin: 96 },
];

/** 각도의 cos/sin. 설계 상수는 각도이고 이 값은 파생이므로 빌드 시 계산한다. */
export function trig(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { cos: +Math.cos(rad).toFixed(6), sin: +Math.sin(rad).toFixed(6) };
}

/**
 * 오브젝트 하나의 CSS 커스텀 프로퍼티.
 *
 * left/top/width 는 정적으로 배치하고 애니메이션하지 않는다. 초기 상태는
 * "최종 위치에서 원점까지의 벡터만큼 밀어놓고 scale 축소", 최종은 transform: none 이다.
 * 그 벡터는 극좌표 변위의 반대이므로 대각선 길이로 그대로 표현된다.
 */
export function objectVars(o: { angle: number; dist: number; size: number; ratio: number }) {
  const { cos, sin } = trig(o.angle);
  return {
    '--dist': `${o.dist}`,
    '--cos': `${cos}`,
    '--sin': `${sin}`,
    '--size': `${o.size}`,
    // 중심을 좌표에 맞추기 위한 음수 마진 (폭 대비 유닛)
    '--halfw': `${+(o.size / 2).toFixed(4)}`,
    '--halfh': `${+(o.size / o.ratio / 2).toFixed(4)}`,
  };
}

/**
 * 스태거 순서 — 원점에서 가까운 것부터. dist 오름차순 순위로 지연을 준다.
 * 배열 순서(종류별 그룹)와 무관하게 항상 같은 결과가 나온다.
 */
export function staggerDelays(objects: readonly HeroObject[]): number[] {
  const order = objects
    .map((o, i) => ({ i, dist: o.dist }))
    .sort((a, b) => a.dist - b.dist || a.i - b.i);
  const delays = new Array<number>(objects.length);
  const last = Math.max(1, order.length - 1);
  order.forEach((entry, rank) => {
    delays[entry.i] = TIMING.objStart + Math.round((rank / last) * TIMING.objStagger);
  });
  return delays;
}
