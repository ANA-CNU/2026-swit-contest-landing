# SW-IT Contest Landing Page

충남대학교 컴퓨터인공지능학부 알고리즘 동아리 **ANA** 가 주최하는
SW-IT Contest 2026 홍보용 원페이지 정적 사이트다.
Astro + Tailwind CSS 로 만들고, 빌드 결과물은 순수 정적 파일이다.

배포 주소: <https://2026-swit-contest.anacnu.kr>

---

## 빠르게 실행하기

```bash
git clone <이 저장소 주소>
cd swit-contest

npm ci                          # 1. 의존성
pip install Pillow              # 2. 에셋 전처리에 필요 (한 번만)
python scripts/build-assets.py  # 3. 에셋 전처리  ← 건너뛰면 이미지가 전부 안 나온다
npm run dev                     # 4. http://localhost:4321
```

지도까지 띄우려면 [4. 카카오맵 키](#4-카카오맵-키-지도가-필요할-때만) 를 추가로 설정한다.
설정하지 않아도 페이지는 정상 동작한다 — 지도 자리만 비고 주소와 길찾기 링크가 남는다.

---

## 사전 준비물

| 도구        | 필요 버전                           | 확인                                             |
| ----------- | ----------------------------------- | ------------------------------------------------ |
| **Node.js** | **22.12.0 이상** (Astro 7 요구사항) | `node -v`                                        |
| **npm**     | 9.6.5 이상                          | `npm -v`                                         |
| **Python**  | 3.9 이상                            | `python --version`                               |
| **Pillow**  | 아무 최신 버전                      | `python -c "import PIL; print(PIL.__version__)"` |

Node 22 미만에서는 `npm ci` 단계에서 막힌다. Python 과 Pillow 는
에셋 전처리 스크립트에만 쓰인다. 웹 빌드 자체에는 관여하지 않는다.

> 검증 환경: Windows 11 / Node 24.11.0 / npm 11.6.1 / Python 3.14.0 / Pillow 12.3.0

---

## 절차

### 1. 클론

```bash
git clone <이 저장소 주소>
cd swit-contest
```

클론 직후 상태는 이렇다.

```
asset/            원본 PNG·SVG 61개  ← 추적된다. 클론에 포함되어 있다
public/assets/    없음               ← 다음 단계에서 생성한다
.env              없음               ← 필요하면 직접 만든다
```

### 2. 의존성 설치

```bash
npm ci
```

`npm install` 대신 **`npm ci`** 를 쓴다. `package-lock.json` 을 그대로 재현하고
파일을 수정하지 않는다. `npm install` 로도 동작하지만, 플랫폼별 optional
의존성 항목이 정리되면서 `package-lock.json` 에 23줄 정도 diff 가 생긴다.
기능에는 영향이 없지만 커밋에 섞이면 지저분하다.

### 3. 에셋 전처리 — 생략하면 안 된다

```bash
pip install Pillow              # 처음 한 번만
python scripts/build-assets.py
```

`asset/` 의 원본 PNG 를 알파 여백만큼 잘라내고 WebP 로 변환해
`public/assets/` 에 넣는다. 종횡비 표는 `src/data/assets.json` 에 기록된다.

**`public/assets/` 는 `.gitignore` 에 있다.** 생성물이라 커밋하지 않는다.
따라서 클론 직후에는 이미지가 하나도 없고, 이 스크립트를 돌려야 채워진다.

정상 출력은 이렇다.

```
종류             원본 수          원본        WebP      절감률
─────────────────────────────────────────────────────────────
corn              7      3.2 MB    143.3 KB    95.6%
figure            4      2.2 MB     80.9 KB    96.4%
keycab            8      4.0 MB    263.1 KB    93.6%
logo              4    758.1 KB    155.7 KB    79.5%
pixel             8      4.5 MB    326.2 KB    92.9%
popcorn          12      6.0 MB    313.1 KB    94.9%
sparkle          16      2.5 MB    326.3 KB    87.4%
─────────────────────────────────────────────────────────────
합계             59     23.2 MB      1.6 MB    93.2%
```

> **왜 강조하나** — 이 단계를 건너뛰어도 `npm run build` 는 **성공한다.**
> 에러도, 경고도 없다. 그런데 HTML 은 이미지 40개를 참조하고 `dist/assets/`
> 에는 0개가 들어간다. 브라우저에서 열면 히어로가 텅 비고 섹션 아이콘과
> 푸터 로고가 사라진다. 원인을 찾기 어려운 종류의 실패다.
>
> 이 스크립트는 `asset/` 에 아무것도 쓰지 않는다. 원본은 읽기 전용이다.

### 4. 카카오맵 키 (지도가 필요할 때만)

"대회 장소" 섹션의 지도는 카카오맵 SDK 를 쓴다.
**설정하지 않아도 된다.** 키가 없으면 지도 컨테이너 자체가 렌더되지 않고
주소 텍스트와 "카카오맵에서 길찾기" 링크만 남는다. 빌드도 렌더도 깨지지 않는다.

지도를 띄우려면 두 가지가 **모두** 필요하다. 키만으로는 뜨지 않는다.

**(1) `.env` 만들기**

```bash
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
```

`.env` 를 열어 카카오 JavaScript 키를 채운다.

```
PUBLIC_KAKAO_MAP_KEY=여기에_JavaScript_키
```

발급: <https://developers.kakao.com> → 내 애플리케이션 → 앱 키 → **JavaScript 키**

`.env` 는 `.gitignore` 에 있다. 커밋되지 않는다.
`PUBLIC_` 접두사가 붙은 값은 빌드 결과물에 그대로 들어가므로 비밀 값을 넣지 않는다.
카카오 JavaScript 키는 도메인 제한으로 보호되는 공개 키다.

**(2) 카카오 개발자 콘솔 설정 두 곳**

| 설정                   | 위치                                          | 빠뜨리면                               |
| ---------------------- | --------------------------------------------- | -------------------------------------- |
| 카카오맵 서비스 활성화 | 제품 설정 → **카카오맵** → 활성화 설정 **ON** | `403` — SDK 파일이 아예 안 내려온다    |
| 웹 플랫폼 도메인 등록  | 앱 설정 → 플랫폼 → **Web** → 사이트 도메인    | `401` — 등록 안 된 주소에서만 실패한다 |

등록할 도메인 둘 다 넣는다.

```
https://2026-swit-contest.anacnu.kr    (배포)
http://localhost:4321                  (로컬 개발)
```

### 5. 개발 서버

```bash
npm run dev
```

<http://localhost:4321> 에서 열린다. 파일을 저장하면 자동 갱신된다.

`.env` 를 새로 만들거나 값을 고쳤으면 **dev 서버를 재시작해야 한다.**
환경변수는 빌드 시점에 주입되므로 HMR 로는 반영되지 않는다.

### 6. 프로덕션 빌드

```bash
npm run build     # dist/ 생성
npm run preview   # dist/ 를 http://localhost:4321 로 서빙해 확인
```

`npm run preview` 는 빌드 결과물을 그대로 서빙한다. 배포 전 마지막 확인용이다.

---

## npm 스크립트

| 명령              | 하는 일                           |
| ----------------- | --------------------------------- |
| `npm run dev`     | 개발 서버 (`localhost:4321`, HMR) |
| `npm run build`   | 정적 빌드 → `dist/`               |
| `npm run preview` | `dist/` 를 로컬에서 서빙          |
| `npm run astro`   | Astro CLI 직접 호출               |

에셋 전처리는 npm 스크립트가 아니다. `python scripts/build-assets.py` 로 직접 돌린다.
원본 에셋이 바뀌었을 때만 다시 돌리면 된다.

---

## 배포

`dist/` 를 정적 서빙하면 끝이다. 서버 로직도 런타임 의존성도 없다.

```bash
npm ci
python scripts/build-assets.py
npm run build
# dist/ 를 웹 서버 루트로 복사
```

대상은 ANA 동아리 서버(Ubuntu 24.04, nginx)의 `2026-swit-contest.anacnu.kr` 이다.
`astro.config.mjs` 의 `site` 값이 이 주소로 고정돼 있다 — sitemap 과 OG 절대 URL
생성에 쓰이므로 다른 도메인에 올릴 때는 함께 고쳐야 한다.

빌드 산출물 크기는 약 1.9 MB 이고 그중 1.8 MB 가 `dist/assets/` 의 이미지다.

---

## 문제가 생겼을 때

### 이미지가 하나도 안 보인다

3단계를 건너뛴 것이다. `python scripts/build-assets.py` 를 돌리고
`public/assets/` 에 59개 파일이 생겼는지 확인한다.

### 지도가 안 뜨고 주소·길찾기 링크만 보인다

의도된 폴백이다. 어느 경로로 빠졌는지는 **개발 서버에서 브라우저 콘솔**을 보면 나온다.
`npm run dev` 로 띄운 상태에서 "대회 장소" 섹션까지 스크롤하면 이렇게 찍힌다.

```
[VenueMap] 지도를 표시하지 못했다 (network) — 주소와 길찾기 링크로 폴백한다.
  SDK 스크립트를 불러오지 못했다. ...
```

| 괄호 안       | 뜻                                                                         | 조치                |
| ------------- | -------------------------------------------------------------------------- | ------------------- |
| `no-key`      | `.env` 가 없거나 값이 비었다                                               | 4-(1)               |
| `network`     | SDK 를 못 받았다. 카카오가 403/401 을 돌려줘 브라우저가 막은 경우가 대부분 | 4-(2)               |
| `sdk-missing` | 스크립트는 왔는데 생성자가 없다                                            | 앱 키·도메인 재확인 |
| `timeout`     | 8초 안에 응답이 없다                                                       | 네트워크 확인       |
| `init`        | 지도 생성 중 예외                                                          | 이슈로 올려 달라    |

이 메시지는 개발 빌드에만 있다. 프로덕션 빌드에서는 문자열째 제거된다.

`network` 가 나오면 브라우저는 응답 본문을 감추므로(ORB) `curl` 로 직접 받아 확인한다.

```bash
curl -i -H "Referer: http://localhost:4321/" \
  "https://dapi.kakao.com/v2/maps/sdk.js?appkey=<키>&autoload=false"
```

| 응답                                          | 원인                                   |
| --------------------------------------------- | -------------------------------------- |
| `403 ... disabled OPEN_MAP_AND_LOCAL service` | 카카오맵 서비스가 꺼져 있다            |
| `401 ... domain mismatched!`                  | 그 도메인이 등록돼 있지 않다           |
| `200` + 4145 bytes JS                         | 정상 (본체가 아니라 로더다. 이게 맞다) |

### `npm ci` 가 실패한다

Node 버전을 확인한다. Astro 7 은 Node 22.12.0 이상을 요구한다.

### `python scripts/build-assets.py` 가 `ModuleNotFoundError: PIL` 로 죽는다

`pip install Pillow`. 스크립트의 유일한 의존성이다.

---

## 구조

```
asset/                   원본 에셋. 읽기 전용. 절대 수정하지 않는다
  SOURCE_corn/ keycab/ pixel/ popcorn/ sparkle/ figure/   오브젝트 PNG
  SOURCE_logo/                                            기관 로고 PNG
  SOURCE_title/                                           제목 로고 SVG
scripts/build-assets.py  에셋 전처리 (크롭 → WebP → 매니페스트)
public/
  assets/                전처리 결과물. gitignore. 생성해야 한다
  robots.txt
src/
  pages/index.astro      단일 페이지
  layouts/Layout.astro   head, 메타태그, OG
  components/
    Hero.astro           히어로 (분사 애니메이션 + 제목 + CTA)
    Rays.astro           광선 레이어 (CSS wedge)
    TitleLockup.astro    SW-IT CONTEST 제목 (벡터 패스 인라인)
    SectionNav.astro     sticky 섹션 네비게이션
    ContestInfo.astro    일정·장소·대상·규칙·상금·신청 6개 섹션
    VenueMap.astro       카카오맵
    SiteFooter.astro     주최 표기 + 기관 로고 4개
  data/
    contest.ts           대회 정보 콘텐츠 (수정은 대부분 여기서)
    hero-layout.ts       히어로 오브젝트 배치 상수 (난수 없음)
    assets.json          전처리 매니페스트 (생성물이지만 추적한다)
  styles/global.css      Pretendard, Tailwind 진입점, 공용 클래스
CLAUDE.md                설계 규칙과 실측 기록. 코드 수정 전에 읽는다
```

**대회 정보를 고칠 일이 대부분이라면 `src/data/contest.ts` 만 보면 된다.**
날짜·장소·일정·상금·규칙·링크가 전부 여기 있다.

설계 제약(디자인 토큰, 히어로 애니메이션 규칙, 에셋 처리 방침,
카카오맵 SDK 의 `autoload=false` 가 필수인 이유 등)은 `CLAUDE.md` 에 있다.
