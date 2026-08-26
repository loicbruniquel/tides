#!/usr/bin/env python3
"""
Generates the app icon set from a single SVG master.

The mark is a symbolised tide curve: a smooth wave, stroked with the same
high-water → low-water gradient the graph itself uses, over the app's dark
background, with a soft fill beneath the line to give it mass at small sizes.

Two geometries are produced from the same drawing:

  tight  full amplitude — favicons and the `any` PWA icons, where nothing crops it.
  safe   reduced amplitude — maskable and Apple icons, where the platform applies a
         circle or squircle mask. Android's safe zone is the inner 80%. The curve
         spans the full width in both, so a mask cropping the sides just trims the
         curve; only the amplitude has to be held back.

Run from the repo root:  python3 scripts/make-icons.py
Requires rsvg-convert and ImageMagick (`convert`).
"""

import math
import pathlib
import subprocess

OUT = pathlib.Path("public/icons")
BUILD = pathlib.Path("scripts/.icon-build")

SIZE = 512

# Matches --background / --tide-high / --tide-low in src/assets/main.css, nudged
# brighter so the curve keeps its contrast against the dark ground at 16px.
BG = "#0b1220"
CREST = "#38e5b0"
TROUGH = "#4d9bf5"

# One real day at Bouznika (33.88,-7.04 on 2026-08-27), normalised to [-1, 1] and
# subsampled from the API's 48 half-hourly heights. Two highs of unequal height and
# two unequal lows — the diurnal inequality that makes it read as a tide.
TIDE_CURVE = [
    0.1162, 0.6339, 0.7520, 0.3805, -0.2608, -0.7668, -0.8484, -0.4644,
    0.2033, 0.8065, 1.0000, 0.6424, -0.0820, -0.7497, -1.0000, -0.7334,
]

STROKE_RATIO = 0.0525

# Peak-to-centre, as a fraction of the canvas.
TIGHT_AMPLITUDE = 0.20
# Android's maskable safe zone is the inner 80%, so crests must stay inside
# 256 ± 0.4 * 512. Held well under that, allowing for the stroke half-width.
SAFE_AMPLITUDE = 0.145


def catmull_rom_path(points: list[tuple[float, float]]) -> str:
    """Smooth cubic path through every point — the same idea as lib/plot.ts."""
    d = f"M {points[0][0]:.2f},{points[0][1]:.2f}"
    for i in range(len(points) - 1):
        p0 = points[i - 1] if i > 0 else points[i]
        p1 = points[i]
        p2 = points[i + 1]
        p3 = points[i + 2] if i + 2 < len(points) else points[i + 1]

        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C {c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {p2[0]:.2f},{p2[1]:.2f}"
    return d


def wave(amplitude_ratio: float):
    """Returns (stroke path, closed fill path, stroke width) for the tide curve.

    The curve is a real day rather than a sine: a sine is too regular to read as a
    tide. Real semidiurnal tides show diurnal inequality — successive highs and lows
    differ — and that asymmetry is what makes the mark look like a tide graph rather
    than a generic wave.

    It runs exactly edge to edge, so the line meets both borders flush.
    """
    amplitude = SIZE * amplitude_ratio
    mid = SIZE / 2

    n = len(TIDE_CURVE) - 1
    points = [
        (SIZE * i / n, mid - amplitude * value) for i, value in enumerate(TIDE_CURVE)
    ]

    stroke = catmull_rom_path(points)
    fill = f"{stroke} L {SIZE},{SIZE} L 0,{SIZE} Z"
    return stroke, fill, SIZE * STROKE_RATIO


def svg(amplitude_ratio: float, radius: float) -> str:
    stroke, fill, width = wave(amplitude_ratio)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" width="{SIZE}" height="{SIZE}">
  <defs>
    <linearGradient id="tide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{CREST}"/>
      <stop offset="100%" stop-color="{TROUGH}"/>
    </linearGradient>
    <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{CREST}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="{TROUGH}" stop-opacity="0.05"/>
    </linearGradient>
    <clipPath id="frame">
      <rect width="{SIZE}" height="{SIZE}" rx="{radius}" ry="{radius}"/>
    </clipPath>
  </defs>

  <rect width="{SIZE}" height="{SIZE}" rx="{radius}" ry="{radius}" fill="{BG}"/>
  <g clip-path="url(#frame)">
    <path d="{fill}" fill="url(#wash)"/>
    <path d="{stroke}" fill="none" stroke="url(#tide)" stroke-width="{width:.2f}"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
"""


def monochrome_svg() -> str:
    """Safari pinned-tab masks require a single-colour, flat SVG."""
    stroke, _, width = wave(TIGHT_AMPLITUDE)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" width="{SIZE}" height="{SIZE}">
  <path d="{stroke}" fill="none" stroke="black" stroke-width="{width:.2f}"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""


def render(src: pathlib.Path, dest: pathlib.Path, size: int) -> None:
    subprocess.run(
        ["rsvg-convert", "-w", str(size), "-h", str(size), str(src), "-o", str(dest)],
        check=True,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    BUILD.mkdir(parents=True, exist_ok=True)

    rounded = BUILD / "master-rounded.svg"
    square = BUILD / "master-square.svg"
    maskable = BUILD / "master-maskable.svg"

    # 18% corner radius reads as "app icon" without the OS having to mask it.
    rounded.write_text(svg(TIGHT_AMPLITUDE, radius=SIZE * 0.18))
    # Full bleed: iOS applies its own squircle, and self-rounded corners would
    # leave dark notches inside it.
    square.write_text(svg(TIGHT_AMPLITUDE, radius=0))
    maskable.write_text(svg(SAFE_AMPLITUDE, radius=0))

    for size in (16, 32, 48, 96):
        render(rounded, OUT / f"favicon-{size}x{size}.png", size)
    for size in (192, 512):
        render(rounded, OUT / f"icon-{size}x{size}.png", size)

    render(maskable, OUT / "icon-512x512-maskable.png", 512)

    for size in (120, 152, 167, 180):
        render(square, OUT / f"apple-icon-{size}x{size}.png", size)

    # Multi-resolution .ico for legacy tab and bookmark rendering.
    subprocess.run(
        [
            "convert",
            str(OUT / "favicon-16x16.png"),
            str(OUT / "favicon-32x32.png"),
            str(OUT / "favicon-48x48.png"),
            str(OUT / "favicon.ico"),
        ],
        check=True,
    )
    (OUT / "favicon-48x48.png").unlink()

    (OUT / "safari-pinned-tab.svg").write_text(monochrome_svg())

    print(f"wrote {len(list(OUT.iterdir()))} files to {OUT}/")


if __name__ == "__main__":
    main()
