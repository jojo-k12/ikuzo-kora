import {staticFile} from 'remotion';
import layout from '../public/assets/layout.json';

export const IMG = {
  jojo: staticFile('assets/jojo.png'),
  sevas: staticFile('assets/sevas.png'),
  plateBlue: staticFile('assets/plate_blue.png'),
  platePink: staticFile('assets/plate_pink.png'),
  plateBlueRaw: staticFile('assets/plate_blue_raw.png'),
  platePinkRaw: staticFile('assets/plate_pink_raw.png'),
  catBlack: staticFile('assets/cat_black.png'),
  catWhite: staticFile('assets/cat_white.png'),
  bar: staticFile('assets/kitsch_bar.png'),
  jojoAura: staticFile('assets/jojo_aura.png'),
  jojoRim: staticFile('assets/jojo_rim.png'),
  sevasAura: staticFile('assets/sevas_aura.png'),
  sevasRim: staticFile('assets/sevas_rim.png'),
};

/** Padding (px, source scale) baked around the aura silhouettes. */
export const AURA_PAD = 140;

export const SFX = (name: string) => staticFile(`sfx/${name}.wav`);

type Box = {x: number; y: number; w: number; h: number};
const L = layout as Record<string, Box>;

/** Boxes of the logo layers in the original logo's pixel space. */
export const LOGO = {
  catBlack: L['cat_black.png'],
  catWhite: L['cat_white.png'],
  bar: L['kitsch_bar.png'],
  full: L['logo_full.png'],
};

/** Boxes of the character cutouts in the original render's pixel space. */
export const RENDER = {
  jojo: L['jojo.png'],
  sevas: L['sevas.png'],
};
