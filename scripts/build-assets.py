#!/usr/bin/env python3
"""asset/ 의 원본 PNG 를 웹용 WebP 로 가공하고 배치 매니페스트의 기초 데이터를 만든다.

동작
  1. asset/SOURCE_*/ 의 PNG 를 순회한다 (SOURCE_title 은 SVG 이므로 제외).
  2. 알파 채널의 불투명 픽셀 바운딩 박스를 구해 여백을 제거한다.
     원본은 사방에 투명 여백이 있어 그대로 쓰면 크기와 회전 중심이 어긋난다.
  3. 크롭 결과를 public/assets/<종류>/<이름>.webp 로 저장한다 (quality=88).
  4. 긴 변이 512px 을 넘으면 512px 로 축소한다. 히어로에서 그보다 크게 쓰지 않는다.
  5. src/data/assets.json 에 종류별 배열을 자연 정렬 순서로 기록한다.

SOURCE_logo 만 처리 방식이 다르다 (아래 process() 참조).
  - 알파 크롭을 하지 않는다. 로고 원본의 여백이 로고의 일부다.
  - 긴 변이 아니라 가로 폭을 240px 로 맞춘다.

asset/ 은 읽기 전용이다. 이 스크립트는 asset/ 에 절대 쓰지 않는다.
Pillow 외의 의존성은 쓰지 않는다.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "asset"
OUT_DIR = ROOT / "public" / "assets"
MANIFEST = ROOT / "src" / "data" / "assets.json"

SOURCE_PREFIX = "SOURCE_"
SKIP_KINDS = {"title"}  # SVG 원본. 크롭/변환 대상이 아니다.
MAX_EDGE = 512
WEBP_QUALITY = 88

# 로고는 오브젝트와 처리 방식이 다르다. 아래 process() 의 분기를 참조한다.
LOGO_KIND = "logo"
LOGO_WIDTH = 640

_NUM = re.compile(r"(\d+)")


def natural_key(name: str) -> tuple:
    """corn_10 이 corn_2 앞에 오지 않도록 숫자 구간을 정수로 비교한다."""
    return tuple(
        int(part) if part.isdigit() else part.lower()
        for part in _NUM.split(name)
    )


def human(size: int) -> str:
    value = float(size)
    for unit in ("B", "KB", "MB"):
        if value < 1024 or unit == "MB":
            precision = 0 if unit == "B" else 1
            return f"{value:.{precision}f} {unit}"
        value /= 1024
    return f"{value:.1f} MB"


def alpha_of(img: Image.Image) -> Image.Image | None:
    """알파 채널을 돌려준다. 알파가 없으면 None."""
    if img.mode in ("RGBA", "LA"):
        return img.getchannel("A")
    if img.mode == "P" and "transparency" in img.info:
        return img.convert("RGBA").getchannel("A")
    return None


def process(png: Path, out_path: Path, kind: str, warnings: list[str]) -> tuple[int, int] | None:
    """PNG 하나를 가공해 WebP 로 저장하고 최종 (w, h) 를 돌려준다.

    오브젝트(corn/keycab/pixel/popcorn/sparkle/figure)는 알파 크롭 후 긴 변 상한을 건다.
    로고는 그 로직을 쓰지 않는다 — 아래 로고 분기를 참조한다.
    완전히 투명한 이미지는 None 을 돌려준다 (건너뜀).
    """
    with Image.open(png) as img:
        img.load()
        alpha = alpha_of(img)

        if kind == LOGO_KIND:
            # 로고는 알파 크롭을 하지 않는다. 기관 로고의 여백은 디자인의 일부이고,
            # 크롭해 버리면 푸터에 나란히 놓았을 때 간격이 제각각이 된다.
            canvas = img.convert("RGBA") if alpha is not None else img.convert("RGB")
            # 긴 변이 아니라 가로 폭을 기준으로 맞춘다. 세로형과 가로형이 섞여 있어
            # 긴 변 기준으로 맞추면 시각적 크기가 제각각이 된다.
            if canvas.width != LOGO_WIDTH:
                scale = LOGO_WIDTH / canvas.width
                canvas = canvas.resize(
                    (LOGO_WIDTH, max(1, round(canvas.height * scale))), Image.LANCZOS
                )
            out_path.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
            return canvas.size

        if alpha is None:
            warnings.append(f"알파 채널 없음, 크롭 없이 변환: {png.name}")
            canvas = img.convert("RGB")
        else:
            bbox = alpha.getbbox()  # 불투명 픽셀의 (left, top, right, bottom)
            if bbox is None:
                return None  # 전부 투명
            canvas = img.convert("RGBA").crop(bbox)

        # 긴 변 512px 상한. 종횡비는 유지한다.
        longest = max(canvas.size)
        if longest > MAX_EDGE:
            scale = MAX_EDGE / longest
            target = (
                max(1, round(canvas.width * scale)),
                max(1, round(canvas.height * scale)),
            )
            canvas = canvas.resize(target, Image.LANCZOS)

        out_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
        return canvas.size


def main() -> int:
    if not SOURCE_DIR.is_dir():
        print(f"원본 디렉터리가 없다: {SOURCE_DIR}", file=sys.stderr)
        return 1

    manifest: dict[str, list[dict]] = {}
    warnings: list[str] = []
    skipped: list[str] = []
    rows: list[tuple[str, int, int, int]] = []

    kind_dirs = sorted(
        (d for d in SOURCE_DIR.iterdir() if d.is_dir() and d.name.startswith(SOURCE_PREFIX)),
        key=lambda d: d.name.lower(),
    )

    for kind_dir in kind_dirs:
        kind = kind_dir.name[len(SOURCE_PREFIX):]
        if kind in SKIP_KINDS:
            continue

        pngs = sorted(
            (p for p in kind_dir.iterdir() if p.is_file() and p.suffix.lower() == ".png"),
            key=lambda p: natural_key(p.name),
        )
        if not pngs:
            continue

        entries: list[dict] = []
        src_bytes = 0
        out_bytes = 0

        for png in pngs:
            out_path = OUT_DIR / kind / f"{png.stem}.webp"
            size = process(png, out_path, kind, warnings)
            if size is None:
                skipped.append(f"완전히 투명해 건너뜀: {kind}/{png.name}")
                continue

            width, height = size
            src_bytes += png.stat().st_size
            out_bytes += out_path.stat().st_size
            entries.append({
                "src": f"/assets/{kind}/{out_path.name}",
                "w": width,
                "h": height,
                "ratio": round(width / height, 3),
            })

        if entries:
            manifest[kind] = entries
            rows.append((kind, len(entries), src_bytes, out_bytes))

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # ── 표 출력 ────────────────────────────────────────────────
    header = ("종류", "파일 수", "원본", "WebP", "감소율")
    widths = (10, 7, 10, 10, 7)
    line = "─" * (sum(widths) + 4 * 2)

    print()
    print(f"{header[0]:<{widths[0]}}  {header[1]:>{widths[1]}}  "
          f"{header[2]:>{widths[2]}}  {header[3]:>{widths[3]}}  {header[4]:>{widths[4]}}")
    print(line)

    for kind, count, src_bytes, out_bytes in rows:
        cut = (1 - out_bytes / src_bytes) * 100 if src_bytes else 0.0
        print(f"{kind:<{widths[0]}}  {count:>{widths[1]}}  "
              f"{human(src_bytes):>{widths[2]}}  {human(out_bytes):>{widths[3]}}  "
              f"{cut:>{widths[4] - 1}.1f}%")

    total_count = sum(r[1] for r in rows)
    total_src = sum(r[2] for r in rows)
    total_out = sum(r[3] for r in rows)
    total_cut = (1 - total_out / total_src) * 100 if total_src else 0.0

    print(line)
    print(f"{'합계':<{widths[0] - 2}}  {total_count:>{widths[1]}}  "
          f"{human(total_src):>{widths[2]}}  {human(total_out):>{widths[3]}}  "
          f"{total_cut:>{widths[4] - 1}.1f}%")
    print()

    for message in warnings + skipped:
        print(f"경고: {message}")
    if warnings or skipped:
        print()

    print(f"매니페스트: {MANIFEST.relative_to(ROOT).as_posix()} ({len(manifest)} 종류)")
    print(f"출력 경로:   {OUT_DIR.relative_to(ROOT).as_posix()}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
