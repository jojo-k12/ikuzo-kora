import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are self-hosted in public/fonts (fetched by scripts/fetch_fonts.py;
// the Japanese ones are subset to the glyphs in copy.ts), so renders work
// offline and never wait on Google's CDN.
const load = (family: string, file: string, weight = '400') => {
  loadFont({family, url: staticFile(`fonts/${file}.woff2`), weight, format: 'woff2'}).catch((err) => {
    console.error(`Failed to load ${family}`, err);
  });
  return family;
};

load('KitschNotoSerifJP', 'noto-serif-jp-600', '600');

export const F = {
  anton: load('KitschAnton', 'anton'),
  bebas: load('KitschBebas', 'bebas-neue'),
  neon: load('KitschYellowtail', 'yellowtail'),
  brush: load('KitschYujiBoku', 'yuji-boku'),
  serifJP: load('KitschNotoSerifJP', 'noto-serif-jp-900', '900'),
  heavyJP: load('KitschDelaGothic', 'dela-gothic-one'),
};
