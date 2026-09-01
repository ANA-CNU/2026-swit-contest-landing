/**
 * 디자인 토큰은 포스터 원본(3175x4490) 픽셀을 직접 샘플링한 값이다.
 * 임의로 바꾸지 않는다. CLAUDE.md "디자인 토큰" 절 참조.
 *
 * Tailwind v4 는 CSS 우선 설정이지만, 이 파일은
 * src/styles/global.css 의 `@config` 지시자로 로드된다.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#FB8227', // 광선, 사람 실루엣, 주요 강조
        'orange-title': '#FD7E21', // 제목 CONTEST
        'orange-soft': '#FDB35E', // 광선 밝은 톤, 보조
        gold: '#F7B03E', // 제목 SW-IT, 옥수수 알
        paper: '#FFFFFF', // 배경
        ink: '#000000', // 본문 텍스트
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
    },
  },
};
