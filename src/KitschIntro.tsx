import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {IMG, RENDER, SFX} from './assets';
import {CHARACTERS, NEON_WORD} from './copy';
import './fonts';
import {FilmTexture, GlobalDefs, Vignette} from './fx';
import {BossCard, CARD} from './scenes/BossCard';
import {Clash, SLAM, STAMP} from './scenes/Clash';
import {ColdOpen} from './scenes/ColdOpen';
import {HeatMode} from './scenes/HeatMode';
import {LogoSlam, LS} from './scenes/LogoSlam';
import {T} from './theme';

type Cue = {at: number; sfx: string; volume?: number};

const cardCues = (start: number): Cue[] => [
  {at: start, sfx: 'whoosh', volume: 0.8},
  {at: start + CARD.KANJI + 4, sfx: 'hit', volume: 0.55},
  {at: start + CARD.NAME + 4, sfx: 'slam', volume: 0.9},
  {at: start + CARD.FREEZE, sfx: 'freeze', volume: 0.9},
  {at: start + CARD.CUT, sfx: 'slash', volume: 0.8},
];

const CUES: Cue[] = [
  // 1. cold open
  {at: T.cold, sfx: 'boom', volume: 1},
  {at: T.cold, sfx: 'drone', volume: 0.7},
  {at: T.cold + 62, sfx: 'shatter', volume: 0.85},
  // 2. clash
  {at: T.clash, sfx: 'slash', volume: 0.9},
  {at: T.clash + 8, sfx: 'whoosh', volume: 0.9},
  {at: T.clash + SLAM, sfx: 'slam', volume: 1},
  {at: T.clash + STAMP, sfx: 'hit', volume: 0.6},
  // 3. boss cards
  ...cardCues(T.jojo),
  ...cardCues(T.sevas),
  // 4. heat mode
  {at: T.heat, sfx: 'heat', volume: 1},
  {at: T.heat, sfx: 'slam', volume: 0.6},
  // 5. logo
  {at: T.logo + LS.IMPACT - 1, sfx: 'slam', volume: 1},
  {at: T.logo + LS.TYPE, sfx: 'buzz', volume: 0.7},
  ...Array.from({length: NEON_WORD.length}, (_, i) => ({
    at: T.logo + LS.TYPE + i * LS.TYPE_STEP,
    sfx: 'tink',
    volume: 0.5,
  })),
  {at: T.logo + LS.HOP_BLACK, sfx: 'boing', volume: 0.7},
  {at: T.logo + LS.HOP_WHITE, sfx: 'boing', volume: 0.6},
  {at: T.logo + LS.BLINK, sfx: 'pip', volume: 0.7},
];

const Grade: React.FC = () => {
  // Grain is heavier in the story beats and eases off for the final logo hold.
  const frame = useCurrentFrame();
  const strength = interpolate(frame, [T.logo + 40, T.end - 10], [1, 0.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <>
      <Vignette amount={0.7} />
      <FilmTexture strength={strength} />
    </>
  );
};

export const KitschIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <GlobalDefs />
      <Sequence from={T.cold} durationInFrames={T.clash - T.cold} name="1 Cold open">
        <ColdOpen />
      </Sequence>
      <Sequence from={T.clash} durationInFrames={T.jojo - T.clash} name="2 Clash">
        <Clash />
      </Sequence>
      <Sequence from={T.jojo} durationInFrames={T.sevas - T.jojo} name="3a Jojo">
        <BossCard
          side="blue"
          image={IMG.jojo}
          imageW={RENDER.jojo.w}
          imageH={RENDER.jojo.h}
          plate={IMG.plateBlue}
          {...CHARACTERS.jojo}
        />
      </Sequence>
      <Sequence from={T.sevas} durationInFrames={T.heat - T.sevas} name="3b Sevas">
        <BossCard
          side="pink"
          image={IMG.sevas}
          imageW={RENDER.sevas.w}
          imageH={RENDER.sevas.h}
          plate={IMG.platePink}
          flip
          {...CHARACTERS.sevas}
        />
      </Sequence>
      <Sequence from={T.heat} durationInFrames={T.logo - T.heat} name="4 Heat mode">
        <HeatMode />
      </Sequence>
      <Sequence from={T.logo} durationInFrames={T.end - T.logo} name="5 Logo slam">
        <LogoSlam />
      </Sequence>
      <Grade />
      {CUES.map((c, i) => (
        <Sequence key={i} from={c.at} name={`sfx ${c.sfx}`} layout="none">
          <Audio src={SFX(c.sfx)} volume={c.volume ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
