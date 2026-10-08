# sixties KITSCH — channel intro

A 12-second, 1920×1080, 60fps YouTube intro built in [Remotion](https://remotion.dev),
styled after Yakuza's opening and boss-fight intro cards.

| Time | Scene | What happens |
| --- | --- | --- |
| 0.0–1.5s | Cold open | Low boom, vertical kanji drift up like smoke, the two cats form a glowing family crest, which cracks and shatters |
| 1.5–3.5s | Clash | Glitch slash tears the screen, teal and crimson plates slam together: flash, shake, chromatic aberration, 対決 stamp |
| 3.5–5.5s | Boss card: JOJO | Punch-in, 流 brush kanji, name slam, 【ネオンの流れ者】 / NEON EXILE, freeze-frame, diagonal tear-out |
| 5.5–7.5s | Boss card: SEVAS | Same, mirrored: 護, 【神室町の世話係】 / KAMURO'S CAREGIVER |
| 7.5–10s | Heat Mode | Both fighters in blue / pink flame auras, embers, speed lines, kanji flicker, HEAT gauge to MAX |
| 10–12s | Logo slam | KITSCH. slams with shockwave rings, "sixties" flickers on as a neon sign, the cats hop and the white cat blinks |

## Montage remake (`KitschMontage`, 28.4s)

A remake of the "6ties kitsch 5" montage (`public/raw/montage_src.mp4`), using the original
footage and audio. It adds the cold open over the black lead-in, cut impacts (punch-zoom, shake,
RGB split, flash), kanji stamps on cuts, a hex message decode, ゴール!! / 勝ち越し on the goal,
a heat action banner on the car hit, Yakuza 0 style-switch callouts synced to the outfit
changes, a SUBSTORY card for "how are we not dead", Heat Mode on the drop, a letterboxed
"そして、伝説へ。" flyover, and the logo slam ending with the neon sign switching off.
Timings are in `src/montage/timeline.ts`.

## Commands

```bash
npm install
npm run studio        # live preview / scrub timeline
npm run render        # -> out/intro.mp4 (H.264, CRF 16, AAC)
npm run render:montage  # -> out/montage.mp4
```

If Remotion can't download its own headless Chrome, point it at a local one:
`npx remotion render KitschIntro out/intro.mp4 --browser-executable=/path/to/chrome`.

## Layout

- `src/KitschIntro.tsx`: timeline, global film grade, all sound cues
- `src/theme.ts`: scene start frames and palette
- `src/copy.ts`: every on-screen string (names, titles, kanji)
- `src/fx.tsx`: shake, RGB split, film grain/dust/scratches, flashes, speed lines
- `src/scenes/*`: one file per scene (`Crest.tsx` is the cat family crest)

## Assets pipeline

The source images are in `public/raw/`. Generated files are committed, so you only
need these scripts if you change the inputs.

- `scripts/process_assets.py`: BiRefNet (rembg) cutouts of each character, background
  plates (raw + inpainted), logo split into black cat / white cat / KITSCH bar,
  pre-baked aura silhouettes. Writes `public/assets/` + `layout.json`.
  Needs `pip install "rembg[cpu]" opencv-python-headless scipy`.
- `scripts/make_sfx.py`: synthesizes every sound effect into `public/sfx/` (numpy only).
- `scripts/fetch_fonts.py`: downloads the Google Fonts (OFL) into `public/fonts/`.
  The Japanese fonts are subset to the glyphs in `src/copy.ts`, **so re-run it after
  changing any Japanese text**.
- `scripts/stills.mjs`: renders half-res preview PNGs of chosen frames (`COMP=KitschMontage` for the montage).

Fonts: Anton, Bebas Neue, Yellowtail, Yuji Boku, Noto Serif JP, Dela Gothic One.
