import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 정적 출력 전용. SSR 어댑터를 추가하지 않는다.
export default defineConfig({
  site: 'https://2026-swit-contest.anacnu.kr',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
