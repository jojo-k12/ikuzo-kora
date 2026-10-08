// Timeline of the "6ties kitsch 5" montage remake, measured from the source edit
// (public/raw/montage_src.mp4). Times are in seconds; use f() for frames.
import {FPS} from '../theme';

export const f = (s: number) => Math.round(s * FPS);

export const SOURCE_DURATION = 28.43;

// Hard cuts in the source edit (scene detection).
export const CUTS = [3.83, 4.87, 5.97, 7.37, 7.83, 8.03, 9.0, 10.1, 10.5, 11.47, 12.73, 14.23, 16.07, 20.4, 21.5, 21.9];

export const M = {
  coldOpenEnd: 3.83, // source is black until here
  crestIn: 2.36, // first music hit
  crack: 3.27,
  shatter: 3.73,
  hex: [10.5, 11.47], // hex text clip: "LOOK AT WHAT IT DID TO ME"
  goal: 11.47,
  scoreFlip: 12.07, // 1-1 -> 2-1
  heatAction: 12.95, // car hit
  heatActionEnd: 14.2,
  styles: [14.23, 14.57, 15.4], // shirt colour changes in the desert clip
  stylesEnd: 16.07,
  substory: 16.2,
  substoryOut: 18.5,
  complete: 19.62,
  drop: 20.4, // music comes back in
  legend: 21.9, // flyover
  logo: 24.17,
  powerOff: 26.87,
};

// Kick drums after the drop (spectral analysis of the source audio).
export const KICKS = [21.36, 21.82, 22.06, 22.28, 22.51, 22.71, 23.0, 23.31, 23.8];

// Kanji stamped on cuts: [time, glyph index into MONTAGE.stamps, corner].
export type Corner = 'tl' | 'tr' | 'bl' | 'br';
export const STAMPS: [number, number, Corner][] = [
  [3.83, 0, 'tr'], // 闇
  [4.87, 1, 'bl'], // 蹴
  [5.97, 2, 'tr'], // 夜
  [7.37, 3, 'br'], // 銃
  [8.03, 4, 'tl'], // 怨
  [9.0, 5, 'tr'], // 龍
  [10.1, 6, 'bl'], // 影
  [12.73, 8, 'br'], // 血
  [14.23, 9, 'tr'], // 変
  [21.5, 10, 'tl'], // 勝
];
