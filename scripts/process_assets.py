"""Cut the raw render + logo into layered PNGs for the Remotion intro.

Usage:  python3 scripts/process_assets.py
Needs:  pip install "rembg[cpu]" opencv-python-headless scipy pillow numpy

Inputs  public/raw/render.png   (1953x1080 Yakuza-0 style split cover)
        public/raw/logo.png     (transparent KITSCH. logo)
Outputs public/assets/*.png
"""

from pathlib import Path

import json

import cv2
import numpy as np
from PIL import Image, ImageDraw
from rembg import new_session, remove
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "public" / "raw"
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
BBOXES = {}

# Column where the teal half meets the crimson half in the render.
SPLIT_X = 966

# Jojo (left) stands in front: his right arm block overlaps Sevas's coat.
# Everything inside this polygon belongs to Jojo; the rest of the mask is Sevas.
JOJO_POLY = [
    (0, 0), (978, 0), (978, 476), (1040, 480), (1069, 500),
    (1066, 560), (1057, 700), (1051, 800), (1047, 900), (1046, 960),
    (1030, 972), (990, 980), (985, 1080), (0, 1080),
]
# Part of Sevas hidden behind Jojo's arm; painted in as dark coat so his
# solo cutout has no hole.
SEVAS_OCCLUDED = [(996, 470), (1070, 470), (1070, 975), (1000, 975)]


def poly_mask(size, poly, ss=4):
    """Anti-aliased polygon mask (supersampled) as float 0..1."""
    w, h = size
    im = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(im).polygon([(x * ss, y * ss) for x, y in poly], fill=255)
    return np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255


def save_rgba(rgb, alpha, name, crop=True):
    a = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    img = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), a])
    if crop:
        ys, xs = np.where(a > 4)
        pad = 8
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, a.shape[0])
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, a.shape[1])
        img = img[y0:y1, x0:x1]
        print(f"{name}: bbox x={x0}..{x1} y={y0}..{y1}")
        BBOXES[name] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0), "srcW": a.shape[1], "srcH": a.shape[0]}
    Image.fromarray(img, "RGBA").save(OUT / name)


def process_render():
    src = Image.open(RAW / "render.png").convert("RGB")
    rgb = np.asarray(src).astype(np.float32)
    h, w = rgb.shape[:2]

    mask = remove(src, session=new_session("birefnet-general"), only_mask=True)
    mask = np.asarray(mask.convert("L")).astype(np.float32) / 255

    # Characters are grayscale; desaturating kills teal/pink edge fringing.
    gray = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    gray_rgb = np.dstack([gray] * 3)

    jojo_region = poly_mask((w, h), JOJO_POLY)
    jojo_a = mask * jojo_region
    save_rgba(gray_rgb, jojo_a, "jojo.png")

    occl = poly_mask((w, h), SEVAS_OCCLUDED) * jojo_region
    sevas_a = np.maximum(mask * (1 - jojo_region), occl)
    # Fill the occluded strip by mirroring the coat just right of the arm.
    xs = np.arange(w)
    mirror_x = np.clip(2 * 1072 - xs, 0, w - 1)
    fill = gray[:, mirror_x]
    sevas_gray = gray * (1 - occl) + fill * occl
    save_rgba(np.dstack([sevas_gray] * 3), sevas_a, "sevas.png")

    # Background plates: raw halves (with characters) for the clash reveal,
    # and inpainted "clean" halves for the boss cards.
    src.crop((0, 0, SPLIT_X, h)).save(OUT / "plate_blue_raw.png")
    src.crop((SPLIT_X, 0, w, h)).save(OUT / "plate_pink_raw.png")

    hole = (mask > 0.08).astype(np.uint8) * 255
    hole = cv2.dilate(hole, np.ones((45, 45), np.uint8))
    bgr = cv2.cvtColor(np.asarray(src), cv2.COLOR_RGB2BGR)
    for name, x0, x1 in (("blue", 0, SPLIT_X), ("pink", SPLIT_X, w)):
        # Inpaint each half separately so colours don't bleed across the split.
        half = np.ascontiguousarray(bgr[:, x0:x1])
        hm = np.ascontiguousarray(hole[:, x0:x1])
        # Downscale for a smoother fill over the big character holes.
        small = cv2.resize(half, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
        smask = cv2.resize(hm, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
        filled = cv2.inpaint(small, smask, 15, cv2.INPAINT_NS)
        filled = cv2.resize(filled, (half.shape[1], half.shape[0]), interpolation=cv2.INTER_CUBIC)
        soft = cv2.GaussianBlur(hm, (31, 31), 0).astype(np.float32)[..., None] / 255
        out = half * (1 - soft) + filled * soft
        out = cv2.cvtColor(out.astype(np.uint8), cv2.COLOR_BGR2RGB)
        Image.fromarray(out).save(OUT / f"plate_{name}.png")


def process_logo():
    src = np.asarray(Image.open(RAW / "logo.png").convert("RGBA")).astype(np.float32)
    rgb, al = src[..., :3], src[..., 3] / 255
    L = rgb.mean(-1)
    h, w = al.shape

    bar = np.zeros((h, w), bool)
    bar[696:1175, 534:2275] = True
    bar &= al > 0.02

    # White cat: largest bright blob right of x=576 (the black cat's right
    # eye stroke reaches the white cat's edge there). Its mouth touches the
    # bar, so fill holes with the bar counted as solid, then remove the bar.
    bright = (L > 150) & (al > 0.5) & ~bar
    bright[:, :576] = False
    lab, n = ndimage.label(bright)
    sizes = ndimage.sum(bright, lab, range(1, n + 1))
    white = lab == (np.argmax(sizes) + 1)
    closed = white.copy()
    closed[696:760, :] |= (al[696:760, :] > 0.02)
    white = ndimage.binary_fill_holes(closed)[:696] 
    white = np.vstack([white, np.zeros((h - 696, w), bool)])
    white = ndimage.binary_dilation(white, iterations=3) & (al > 0.02) & ~bar
    wa = ndimage.gaussian_filter(white.astype(np.float32), 0.8) * al
    black_a = np.clip(al * (1 - wa / np.maximum(al, 1e-3)), 0, 1) * ~bar
    # Keep only the black cat's own blob (drops slivers of the bar's edge).
    lab, n = ndimage.label(black_a > 0.1)
    sizes = ndimage.sum(black_a > 0.1, lab, range(1, n + 1))
    keep = lab == (np.argmax(sizes) + 1)
    keep = ndimage.binary_opening(keep, structure=np.ones((7, 7)))  # drop hairlines
    keep = ndimage.binary_dilation(keep, iterations=2)
    black_a = black_a * keep

    save_rgba(rgb, wa, "cat_white.png")
    save_rgba(rgb, black_a, "cat_black.png")
    # The bar proper starts at y=706; rows above it belong to the cats.
    bar_only = bar.copy()
    bar_only[:706] = False
    save_rgba(rgb, al * bar_only, "kitsch_bar.png")
    # Full logo, tightly cropped, for reference/fallback.
    save_rgba(rgb, al, "logo_full.png")


if __name__ == "__main__":
    process_render()
    process_logo()
    (OUT / "layout.json").write_text(json.dumps(BBOXES, indent=2))
