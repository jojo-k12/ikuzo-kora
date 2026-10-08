"""Download the intro's Google Fonts into public/fonts/ (OFL-licensed).

Japanese fonts are requested with Google's `text=` subsetting, containing
only the glyphs used in src/copy.ts, so each file is a few KB.
Re-run after changing any Japanese copy:  python3 scripts/fetch_fonts.py
"""

import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

copy = (ROOT / "src" / "copy.ts").read_text(encoding="utf-8")
jp = sorted({ch for ch in copy if ord(ch) > 0x2000})
jp_text = "".join(jp)

# (output name, family, weight, japanese?)
FONTS = [
    ("anton", "Anton", 400, False),
    ("bebas-neue", "Bebas Neue", 400, False),
    ("yellowtail", "Yellowtail", 400, False),
    ("yuji-boku", "Yuji Boku", 400, True),
    ("noto-serif-jp-600", "Noto Serif JP", 600, True),
    ("noto-serif-jp-900", "Noto Serif JP", 900, True),
    ("dela-gothic-one", "Dela Gothic One", 400, True),
]


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return r.read()


for name, family, weight, is_jp in FONTS:
    q = {"family": f"{family}:wght@{weight}", "display": "block"}
    if is_jp:
        # Include basic Latin too so mixed strings never fall back.
        q["text"] = jp_text + "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'"
    css = get("https://fonts.googleapis.com/css2?" + urllib.parse.urlencode(q)).decode()
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*{([^}]*)}", css)
    if blocks:
        # Pick the plain latin block for Latin fonts.
        body = dict(blocks).get("latin") or blocks[-1][1]
    else:
        body = css
    url = re.search(r"url\((https://[^)]+)\)", body).group(1)
    data = get(url)
    (OUT / f"{name}.woff2").write_bytes(data)
    print(f"{name}.woff2  {len(data) / 1024:.1f} KB")

print(f"japanese glyphs: {len(jp)}")
