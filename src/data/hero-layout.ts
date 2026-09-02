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
  /** 오브젝트 레이어 내부의 z-index. 종류를 섞어 배분해 서로 겹치게 했다.
   *  광선 레이어는 별도 쌓임 문맥이라 이 값으로 광선 아래로 보낼 수는 없다. */
  z: number;
  /** 비행 중 스핀(deg). 최종 회전은 항상 0 이다 — 크롭 원본에 회전이 구워져 있다. */
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
 * z 는 종류를 섞어 배분해 오브젝트끼리 겹치게 했다. 다만 오브젝트가 광선보다
 * 아래로 갈 수는 없다 — Hero.astro 의 .layer--objects 가 z-index: 10 으로
 * 쌓임 문맥을 만들어 .layer--rays(z-index: 0) 전체보다 위에 그려지기 때문이다.
 * 이는 hero-layout.ts 에서 바꿀 수 없다.
 */
export const HERO_OBJECTS: readonly HeroObject[] = [
  // corn
  { src: '/assets/corn/corn_2.webp', ratio: 0.826, angle: 0.5, dist: 0.87, size: 16.0, z: 10, spin: -68 },
  { src: '/assets/corn/corn_1.webp', ratio: 0.824, angle: 12.0, dist: 0.66, size: 13.1, z: 17, spin: -226 },
  { src: '/assets/corn/corn_4.webp', ratio: 0.844, angle: -9.0, dist: 0.52, size: 11.17, z: 24, spin: 238 },
  { src: '/assets/corn/corn_3.webp', ratio: 0.842, angle: 20.0, dist: 0.42, size: 9.79, z: 31, spin: -128 },
  { src: '/assets/corn/corn_6.webp', ratio: 0.822, angle: -18.0, dist: 0.32, size: 8.41, z: 38, spin: 96 },
  { src: '/assets/corn/corn_1.webp', ratio: 0.824, angle: 33.0, dist: 0.26, size: 7.59, z: 45, spin: 152 },
  { src: '/assets/corn/corn_3.webp', ratio: 0.842, angle: -27.0, dist: 0.19, size: 6.62, z: 52, spin: 98 },
  { src: '/assets/corn/corn_6.webp', ratio: 0.822, angle: 50.0, dist: 0.145, size: 6.0, z: 59, spin: 264 },
  // popcorn
  { src: '/assets/popcorn/popcorn_9.webp', ratio: 0.898, angle: -1.0, dist: 0.78, size: 7.6, z: 16, spin: -104 },
  { src: '/assets/popcorn/popcorn_7.webp', ratio: 0.953, angle: 6.0, dist: 0.72, size: 7.11, z: 23, spin: 74 },
  { src: '/assets/popcorn/popcorn_3.webp', ratio: 0.936, angle: 18.0, dist: 0.55, size: 5.71, z: 30, spin: 208 },
  { src: '/assets/popcorn/popcorn_3.webp', ratio: 0.936, angle: -5.0, dist: 0.61, size: 6.2, z: 37, spin: 238 },
  { src: '/assets/popcorn/popcorn_7.webp', ratio: 0.953, angle: -11.0, dist: 0.47, size: 5.05, z: 44, spin: -172 },
  { src: '/assets/popcorn/popcorn_11.webp', ratio: 0.858, angle: -13.0, dist: 0.42, size: 4.64, z: 51, spin: 316 },
  { src: '/assets/popcorn/popcorn_12.webp', ratio: 1.006, angle: 26.0, dist: 0.4, size: 4.48, z: 58, spin: 121 },
  { src: '/assets/popcorn/popcorn_5.webp', ratio: 0.865, angle: 8.0, dist: 0.34, size: 3.99, z: 15, spin: -93 },
  { src: '/assets/popcorn/popcorn_5.webp', ratio: 0.865, angle: -16.0, dist: 0.3, size: 3.66, z: 22, spin: -158 },
  { src: '/assets/popcorn/popcorn_2.webp', ratio: 0.842, angle: -24.0, dist: 0.26, size: 3.33, z: 29, spin: -215 },
  { src: '/assets/popcorn/popcorn_11.webp', ratio: 0.858, angle: 34.0, dist: 0.22, size: 3.0, z: 36, spin: 112 },
  { src: '/assets/popcorn/popcorn_12.webp', ratio: 1.006, angle: -8.0, dist: 0.22, size: 3.0, z: 43, spin: 58 },
  // keycab
  { src: '/assets/keycab/keycab_7.webp', ratio: 1.085, angle: 2.0, dist: 0.47, size: 5.0, z: 50, spin: -47 },
  { src: '/assets/keycab/keycab_3.webp', ratio: 1.078, angle: -2.0, dist: 0.35, size: 3.84, z: 57, spin: -63 },
  { src: '/assets/keycab/keycab_8.webp', ratio: 1.085, angle: 4.0, dist: 0.3, size: 3.36, z: 14, spin: 143 },
  { src: '/assets/keycab/keycab_6.webp', ratio: 1.08, angle: 12.0, dist: 0.24, size: 2.79, z: 21, spin: -76 },
  { src: '/assets/keycab/keycab_8.webp', ratio: 1.085, angle: 52.0, dist: 0.235, size: 2.74, z: 28, spin: 66 },
  { src: '/assets/keycab/keycab_4.webp', ratio: 1.082, angle: 74.0, dist: 0.22, size: 2.59, z: 35, spin: -42 },
  { src: '/assets/keycab/keycab_7.webp', ratio: 1.085, angle: 40.0, dist: 0.2, size: 2.4, z: 42, spin: 84 },
  // sparkle
  { src: '/assets/sparkle/sparkle_6.webp', ratio: 0.809, angle: 14.0, dist: 0.8, size: 4.2, z: 49, spin: 37 },
  { src: '/assets/sparkle/sparkle_5.webp', ratio: 0.793, angle: -6.0, dist: 0.62, size: 3.47, z: 56, spin: 196 },
  { src: '/assets/sparkle/sparkle_7.webp', ratio: 0.811, angle: 8.0, dist: 0.44, size: 2.73, z: 13, spin: -54 },
  { src: '/assets/sparkle/sparkle_12.webp', ratio: 0.772, angle: 20.0, dist: 0.3, size: 2.16, z: 20, spin: 176 },
  { src: '/assets/sparkle/sparkle_4.webp', ratio: 0.592, angle: 61.0, dist: 0.245, size: 1.93, z: 27, spin: -262 },
  { src: '/assets/sparkle/sparkle_11.webp', ratio: 0.678, angle: -4.0, dist: 0.24, size: 1.91, z: 34, spin: 284 },
  { src: '/assets/sparkle/sparkle_1.webp', ratio: 0.588, angle: -35.0, dist: 0.22, size: 1.83, z: 41, spin: -134 },
  { src: '/assets/sparkle/sparkle_9.webp', ratio: 0.679, angle: 25.0, dist: 0.2, size: 1.75, z: 48, spin: -186 },
  { src: '/assets/sparkle/sparkle_15.webp', ratio: 0.75, angle: 64.0, dist: 0.19, size: 1.71, z: 55, spin: -31 },
  { src: '/assets/sparkle/sparkle_10.webp', ratio: 0.782, angle: 1.0, dist: 0.18, size: 1.67, z: 12, spin: 128 },
  { src: '/assets/sparkle/sparkle_2.webp', ratio: 0.67, angle: -30.0, dist: 0.17, size: 1.63, z: 19, spin: -208 },
  { src: '/assets/sparkle/sparkle_8.webp', ratio: 0.797, angle: 16.0, dist: 0.16, size: 1.59, z: 26, spin: 244 },
  { src: '/assets/sparkle/sparkle_13.webp', ratio: 0.734, angle: 46.0, dist: 0.16, size: 1.59, z: 33, spin: -118 },
  { src: '/assets/sparkle/sparkle_16.webp', ratio: 0.736, angle: 70.0, dist: 0.145, size: 1.53, z: 40, spin: 92 },
  { src: '/assets/sparkle/sparkle_3.webp', ratio: 0.59, angle: -33.0, dist: 0.13, size: 1.47, z: 47, spin: -244 },
  { src: '/assets/sparkle/sparkle_14.webp', ratio: 0.773, angle: 58.0, dist: 0.13, size: 1.47, z: 54, spin: 168 },
  { src: '/assets/sparkle/sparkle_4.webp', ratio: 0.592, angle: -20.0, dist: 0.2, size: 1.75, z: 11, spin: -88 },
  { src: '/assets/sparkle/sparkle_2.webp', ratio: 0.67, angle: 78.0, dist: 0.11, size: 1.38, z: 18, spin: 212 },
  { src: '/assets/sparkle/sparkle_15.webp', ratio: 0.75, angle: -28.0, dist: 0.11, size: 1.38, z: 25, spin: -68 },
  { src: '/assets/sparkle/sparkle_11.webp', ratio: 0.678, angle: 50.0, dist: 0.1, size: 1.34, z: 32, spin: -226 },
  { src: '/assets/sparkle/sparkle_5.webp', ratio: 0.793, angle: -12.0, dist: 0.09, size: 1.3, z: 39, spin: 238 },
  { src: '/assets/sparkle/sparkle_13.webp', ratio: 0.734, angle: 30.0, dist: 0.075, size: 1.24, z: 46, spin: -128 },
  { src: '/assets/sparkle/sparkle_7.webp', ratio: 0.811, angle: 44.0, dist: 0.065, size: 1.2, z: 53, spin: 96 },
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
