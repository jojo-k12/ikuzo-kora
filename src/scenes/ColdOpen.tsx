import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {SMOKE_COLUMNS} from '../copy';
import {F} from '../fonts';
import {clamp, Flash, shake, shakeTransform} from '../fx';
import {C} from '../theme';
import {CREST_SIZE, CrestArt} from './Crest';

// Local frames (scene is 90 frames = 1.5s).
const CREST_IN = 16;
const CRACK = 54;
const SHATTER = 64;

const COLS = SMOKE_COLUMNS.map((text, i) => {
  const x = 120 + i * 240 + (random(`cx${i}`) - 0.5) * 60;
  return {
    text,
    x,
    top: 120 + random(`ct${i}`) * 260,
    size: 46 + random(`cs${i}`) * 26,
    delay: Math.floor(random(`cd${i}`) * 18),
    color: i % 3 === 0 ? C.teal : i % 3 === 1 ? C.silver : C.magenta,
  };
});

const SmokeKanji: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {COLS.map((col, ci) =>
        Array.from(col.text).map((ch, j) => {
          const appear = col.delay + j * 3;
          const t = frame - appear;
          if (t < 0) return null;
          const o = interpolate(t, [0, 10], [0, 0.85], clamp) * interpolate(t, [30, 70], [1, 0], clamp);
          const rise = Math.pow(t, 1.35) * 0.9;
          const sway = Math.sin((frame + j * 9 + ci * 13) / 10) * t * 0.18;
          const blur = interpolate(t, [8, 60], [0, 9], clamp);
          return (
            <div
              key={`${ci}-${j}`}
              style={{
                position: 'absolute',
                left: col.x + sway,
                top: col.top + j * col.size * 1.15 - rise,
                fontFamily: F.serifJP,
                fontWeight: 600,
                fontSize: col.size,
                lineHeight: 1,
                color: col.color,
                opacity: o,
                filter: `blur(${blur}px)`,
                transform: `scale(${1 + t * 0.006}, ${1 + t * 0.012})`,
                textShadow: `0 0 18px ${col.color}`,
              }}
            >
              {ch}
            </div>
          );
        }),
      )}
    </AbsoluteFill>
  );
};

// Shards: wedges around the centre, each split into an inner and outer piece.
const N = 14;
const SHARDS = (() => {
  const angles = Array.from({length: N + 1}, (_, k) =>
    k === N ? Math.PI * 2 : (k / N) * Math.PI * 2 + (random(`sa${k}`) - 0.5) * 0.25,
  );
  const pt = (a: number, r: number) => `${50 + Math.cos(a) * r}% ${50 + Math.sin(a) * r}%`;
  const out: {clip: string; mid: number; r: number; spin: number; speed: number}[] = [];
  for (let k = 0; k < N; k++) {
    const a0 = angles[k];
    const a1 = angles[k + 1];
    const rin = 22 + random(`ri${k}`) * 14;
    const mid = (a0 + a1) / 2;
    out.push({
      clip: `polygon(50% 50%, ${pt(a0, rin)}, ${pt(mid, rin + 4)}, ${pt(a1, rin)})`,
      mid,
      r: 0.5,
      spin: (random(`sp${k}`) - 0.5) * 14,
      speed: 7 + random(`sv${k}`) * 6,
    });
    out.push({
      clip: `polygon(${pt(a0, rin)}, ${pt(a0, 80)}, ${pt(a1, 80)}, ${pt(a1, rin)}, ${pt(mid, rin + 4)})`,
      mid,
      r: 1,
      spin: (random(`so${k}`) - 0.5) * 22,
      speed: 14 + random(`sw${k}`) * 12,
    });
  }
  return out;
})();

const CRACKS = Array.from({length: 7}, (_, i) => {
  const a = (i / 7) * Math.PI * 2 + random(`ck${i}`);
  const pts: [number, number][] = [[0, 0]];
  let r = 0;
  for (let s = 1; s <= 5; s++) {
    r += 50 + random(`cr${i}${s}`) * 30;
    const j = (random(`cj${i}${s}`) - 0.5) * 0.5;
    pts.push([Math.cos(a + j) * r, Math.sin(a + j) * r]);
  }
  return pts;
});

export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [CREST_IN, CREST_IN + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.6)),
  });
  const glow = interpolate(frame, [CREST_IN, CREST_IN + 14, CRACK, SHATTER], [0, 1, 1.2, 2], clamp);
  const pulse = 1 + Math.sin(frame / 4) * 0.08;
  const s = shake(frame, SHATTER, 18, 22, 'co');
  const crackP = interpolate(frame, [CRACK, SHATTER], [0, 1], clamp);
  const t = frame - SHATTER;

  const glowFilter = `drop-shadow(0 0 ${14 * glow * pulse}px rgba(255,255,255,0.8)) drop-shadow(-24px 0 ${
    50 * glow
  }px ${C.teal}) drop-shadow(24px 0 ${50 * glow}px ${C.magenta})`;

  const D = CREST_SIZE;
  const crestBox: React.CSSProperties = {
    position: 'absolute',
    left: 960 - D / 2,
    top: 540 - D / 2,
    width: D,
    height: D,
  };

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SmokeKanji />
      <AbsoluteFill style={{transform: shakeTransform(s)}}>
        {frame >= CREST_IN && t < 0 ? (
          <div
            style={{
              ...crestBox,
              opacity: appear,
              transform: `scale(${0.7 + appear * 0.3 + frame * 0.0015})`,
              filter: glowFilter,
            }}
          >
            <CrestArt />
            {crackP > 0 ? (
              <svg width={D} height={D} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                {CRACKS.map((pts, i) => {
                  const n = Math.max(1, Math.ceil(crackP * (pts.length - 1)));
                  const d = pts
                    .slice(0, n + 1)
                    .map(([x, y], k) => `${k ? 'L' : 'M'}${D / 2 + x},${D / 2 + y}`)
                    .join(' ');
                  return (
                    <path key={i} d={d} stroke="#fff" strokeWidth={4} fill="none" style={{filter: 'drop-shadow(0 0 6px #fff)'}} />
                  );
                })}
              </svg>
            ) : null}
          </div>
        ) : null}
        {t >= 0
          ? SHARDS.map((sh, i) => {
              const dist = sh.speed * t + t * t * 0.35;
              const o = interpolate(t, [4, 24], [1, 0], clamp);
              return (
                <div
                  key={i}
                  style={{
                    ...crestBox,
                    clipPath: sh.clip,
                    opacity: o,
                    filter: glowFilter,
                    transformOrigin: `${50 + Math.cos(sh.mid) * (sh.r === 1 ? 45 : 15)}% ${
                      50 + Math.sin(sh.mid) * (sh.r === 1 ? 45 : 15)
                    }%`,
                    transform: `translate(${Math.cos(sh.mid) * dist}px, ${
                      Math.sin(sh.mid) * dist + t * t * 0.25
                    }px) rotate(${sh.spin * t * 0.5}deg) scale(${1 + t * 0.01})`,
                  }}
                >
                  <CrestArt />
                </div>
              );
            })
          : null}
      </AbsoluteFill>
      <Flash at={SHATTER} dur={8} peak={0.85} />
    </AbsoluteFill>
  );
};
