# SW-IT Contest Landing Page

스위트콘 신청 및 홍보 시에 사용할 페이지입니다.
<br>
아나~ 야호~!

충남대학교 컴퓨터인공지능학부 알고리즘 동아리 [**ANA**](https://anacnu.kr) 에서 주최하는
SW-IT Contest 2026 홍보용 정적 웹 페이지 입니다.
Astro + Tailwind CSS 로 만들었고, 빌드 결과물은 순수 정적 파일로 구성되어 있습니다.

배포 주소: https://2026-swit-contest.anacnu.kr

## 빠르게 실행하기

```bash
git clone <이 레포>
cd swit-contest

npm ci                          # 1. 의존성
pip install Pillow              # 2. 에셋 전처리에 필요 (한 번만)
python scripts/build-assets.py  # 3. 에셋 전처리 (해야 이미지가 나옵니다.)
npm run dev                     # 4. http://localhost:4321
```

지도까지 띄우려면 .env를 만들어 Kakao Map API 키를 추가로 설정하면 됩니다.
설정하지 않으면 지도가 나오지 않지만, 페이지는 정상 동작합니다.. 지도 대신 주소와 길찾기 링크만 보입니다.

스위트콘 많관부 !!
