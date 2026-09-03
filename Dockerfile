# 정적 Astro 사이트를 빌드하고 Nginx로 배포하기 위한 이미지입니다; 자산 변환까지 컨테이너 안에서 재현합니다.
FROM node:22-bookworm

WORKDIR /app

# 공개 지도 키는 빌드 시 Astro/Vite에 주입하고 최종 Nginx 이미지에는 복사하지 않습니다.
ARG PUBLIC_KAKAO_MAP_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && pip3 install --break-system-packages --no-cache-dir Pillow \
    && python3 scripts/build-assets.py \
    && rm -rf /var/lib/apt/lists/*
RUN PUBLIC_KAKAO_MAP_KEY="$PUBLIC_KAKAO_MAP_KEY" npm run build

FROM nginx:1.27-alpine

COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
