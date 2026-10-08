import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {SFX} from '../assets';
import {NEON_WORD} from '../copy';
import '../fonts';
import {addShakes, FilmTexture, GlobalDefs, NO_SHAKE, RGBSplit, shake, shakeTransform, Vignette} from '../fx';
import {ColdOpen} from '../scenes/ColdOpen';
import {LogoSlam, LS, POWER_OFF_STEP} from '../scenes/LogoSlam';
import {CutStamps, GoalOverlay, HeatActionBanner, HeatDrop, HexDecode, Legend, StyleSwitch, Substory} from './Overlays';
import {CUTS, f, KICKS, M, SOURCE_DURATION} from './timeline';

export const MONTAGE_FRAMES = f(SOURCE_DURATION);

const CUT_FRAMES = CUTS.map(f);
// Bigger hits: the GOAL, the score flip, the drop.
const BIG_HITS = [M.goal, M.scoreFlip, M.drop].map(f);
const KICK_FRAMES = KICKS.map(f);

/** Impact treatment around every cut: punch-zoom, shake, RGB split, flash. */
const useCutFX = (frame: number) => {
  let last = -999;
  for (const c of CUT_FRAMES) if (c <= frame) last = c;
  const t = frame - last;
  const big = BIG_HITS.some((b) => frame - b >= 0 && frame - b < 14);
  const k = t >= 0 && t < 12 ? 1 - t / 12 : 0;
  const s = addShakes(
    last > 0 ? shake(frame, last, 12, 16, 'cut') : NO_SHAKE,
    ...BIG_HITS.map((b) => shake(frame, b, 20, 34, `big${b}`)),
    ...KICK_FRAMES.map((kf) => shake(frame, kf, 7, 7, `k${kf}`)),
  );
  return {
    zoom: 1 + 0.07 * k * k + (big ? 0.03 : 0),
    shake: s,
    ab: 20 * k + (big ? 10 : 0),
    flash: t >= 0 && t < 6 ? 0.45 * (1 - t / 6) : 0,
  };
};

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const fx = useCutFX(frame);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <RGBSplit amount={fx.ab}>
        <AbsoluteFill style={{transform: shakeTransform(fx.shake, fx.zoom)}}>
          <OffthreadVideo
            src={staticFile('raw/montage_src.mp4')}
            style={{width: 1920, height: 1080, filter: 'contrast(1.1) saturate(1.12) brightness(1.03)'}}
          />
        </AbsoluteFill>
      </RGBSplit>
      {fx.flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: fx.flash}} /> : null}
    </AbsoluteFill>
  );
};

type Cue = {at: number; sfx: string; volume?: number};
const LOGO = f(M.logo);
const POWER_OFF = f(M.powerOff) - LOGO;

const CUES: Cue[] = [
  {at: 0, sfx: 'drone', volume: 0.5},
  {at: f(M.crestIn), sfx: 'boom', volume: 0.7},
  {at: f(M.shatter) - 4, sfx: 'shatter', volume: 0.6},
  {at: f(M.goal), sfx: 'hit', volume: 0.45},
  {at: f(M.scoreFlip), sfx: 'slam', volume: 0.4},
  {at: f(M.heatAction), sfx: 'whoosh', volume: 0.6},
  ...M.styles.map((s) => ({at: f(s), sfx: 'tink', volume: 0.5})),
  {at: f(M.substory), sfx: 'whoosh', volume: 0.5},
  {at: f(M.complete), sfx: 'freeze', volume: 0.7},
  {at: f(M.complete) + 12, sfx: 'hit', volume: 0.5},
  {at: f(M.drop), sfx: 'slam', volume: 0.45},
  // logo
  {at: LOGO + LS.IMPACT - 1, sfx: 'slam', volume: 0.9},
  {at: LOGO + LS.TYPE, sfx: 'buzz', volume: 0.6},
  ...Array.from({length: NEON_WORD.length}, (_, i) => ({at: LOGO + LS.TYPE + i * LS.TYPE_STEP, sfx: 'tink', volume: 0.45})),
  {at: LOGO + LS.HOP_BLACK, sfx: 'boing', volume: 0.6},
  {at: LOGO + LS.HOP_WHITE, sfx: 'boing', volume: 0.5},
  {at: LOGO + LS.BLINK, sfx: 'pip', volume: 0.6},
  {at: LOGO + POWER_OFF, sfx: 'buzz', volume: 0.5},
  ...Array.from({length: NEON_WORD.length}, (_, i) => ({at: LOGO + POWER_OFF + i * POWER_OFF_STEP, sfx: 'tink', volume: 0.3})),
];

/**
 * Remake of the "6ties kitsch 5" montage in the intro's Yakuza style: the
 * original footage and music, re-dressed with the cold open, cut impacts,
 * kanji stamps, Yakuza UI gags, Heat Mode on the drop and the logo slam.
 */
export const KitschMontage: React.FC = () => {
  const coldEnd = f(M.coldOpenEnd);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <GlobalDefs />
      {/* Footage runs the whole time so its audio (music + game sound) plays through. */}
      <Footage />
      <CutStamps />
      <HexDecode />
      <GoalOverlay />
      <HeatActionBanner />
      <StyleSwitch />
      <Substory />
      <HeatDrop />
      <Legend />
      <Sequence durationInFrames={coldEnd} name="Cold open">
        <ColdOpen timing={{crestIn: f(M.crestIn), crack: f(M.crack), shatter: f(M.shatter), smokeSpread: 120}} />
      </Sequence>
      <Sequence from={LOGO} name="Logo slam">
        <LogoSlam powerOff={POWER_OFF} />
      </Sequence>
      <Vignette amount={0.6} />
      <FilmTexture strength={0.85} />
      {CUES.map((c, i) => (
        <Sequence key={i} from={c.at} name={`sfx ${c.sfx}`} layout="none">
          <Audio src={SFX(c.sfx)} volume={c.volume ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
