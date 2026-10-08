import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Shake = {x: number; y: number; r: number};
export const NO_SHAKE: Shake = {x: 0, y: 0, r: 0};

/** Decaying random camera shake starting at `start` (frames), lasting `dur`. */
export const shake = (frame: number, start: number, dur: number, amp: number, seed = 's'): Shake => {
  const t = frame - start;
  if (t < 0 || t > dur) return NO_SHAKE;
  const k = Math.pow(1 - t / dur, 2) * amp;
  return {
    x: (random(`${seed}x${frame}`) * 2 - 1) * k,
    y: (random(`${seed}y${frame}`) * 2 - 1) * k,
    r: (random(`${seed}r${frame}`) * 2 - 1) * k * 0.025,
  };
};

export const addShakes = (...s: Shake[]): Shake =>
  s.reduce((a, b) => ({x: a.x + b.x, y: a.y + b.y, r: a.r + b.r}), NO_SHAKE);

export const shakeTransform = (s: Shake, scale = 1) =>
  `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${scale})`;

/** SVG filters shared by every scene (channel isolation for RGB split). */
export const GlobalDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ch-r" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="ch-g" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="ch-b" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </svg>
);

/**
 * Chromatic aberration: renders children once per colour channel and offsets
 * them, recombining with additive (screen) blending on black.
 */
export const RGBSplit: React.FC<{amount: number; children: React.ReactNode}> = ({amount, children}) => {
  if (Math.abs(amount) < 0.5) return <AbsoluteFill>{children}</AbsoluteFill>;
  const offs = [
    [-amount, amount * 0.25],
    [0, 0],
    [amount, -amount * 0.25],
  ];
  return (
    <AbsoluteFill style={{background: '#000', isolation: 'isolate'}}>
      {(['r', 'g', 'b'] as const).map((c, i) => (
        <AbsoluteFill
          key={c}
          style={{
            filter: `url(#ch-${c})`,
            mixBlendMode: 'screen',
            transform: `translate(${offs[i][0]}px, ${offs[i][1]}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** Animated film grain + dust + scratches + exposure flicker. */
export const FilmTexture: React.FC<{strength?: number}> = ({strength = 1}) => {
  const frame = useCurrentFrame();
  const seed = frame % 113;
  const id = `grain-${seed}`;
  const jx = Math.floor(random(`gx${frame}`) * 6);
  const jy = Math.floor(random(`gy${frame}`) * 6);

  const scratches = Array.from({length: 3}, (_, i) => ({
    on: random(`sc${i}-${frame}`) > 0.72,
    x: random(`scx${i}-${frame}`) * 1920,
    top: random(`sct${i}-${frame}`) * 500,
    h: 300 + random(`sch${i}-${frame}`) * 700,
    o: 0.08 + random(`sco${i}-${frame}`) * 0.18,
  }));
  const dust = Array.from({length: 7}, (_, i) => ({
    on: random(`d${i}-${frame}`) > 0.55,
    x: random(`dx${i}-${frame}`) * 1920,
    y: random(`dy${i}-${frame}`) * 1080,
    s: 2 + random(`ds${i}-${frame}`) * 6,
    dark: random(`dd${i}-${frame}`) > 0.5,
  }));
  const flicker = random(`fl${frame}`) * 0.05 * strength;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg
        width={960}
        height={540}
        viewBox="0 0 960 540"
        style={{
          position: 'absolute',
          left: -12,
          top: -12,
          width: 1944,
          height: 1104,
          transform: `translate(${jx}px, ${jy}px)`,
          mixBlendMode: 'overlay',
          opacity: 0.55 * strength,
        }}
      >
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="2.2" intercept="-0.6" />
            <feFuncG type="linear" slope="2.2" intercept="-0.6" />
            <feFuncB type="linear" slope="2.2" intercept="-0.6" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
      {/* faint lift so grain also reads in pure black areas */}
      <svg
        width={960}
        height={540}
        viewBox="0 0 960 540"
        style={{
          position: 'absolute',
          inset: 0,
          width: 1920,
          height: 1080,
          mixBlendMode: 'screen',
          opacity: 0.07 * strength,
        }}
      >
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
      {scratches.map((s, i) =>
        s.on ? (
          <div
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.top,
              width: 1.5,
              height: s.h,
              background: 'rgba(255,255,255,1)',
              opacity: s.o * strength,
            }}
          />
        ) : null,
      )}
      {dust.map((d, i) =>
        d.on ? (
          <div
            key={`d${i}`}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: d.s,
              height: d.s * (0.6 + (i % 3) * 0.3),
              borderRadius: '50%',
              background: d.dark ? '#000' : '#fff',
              opacity: 0.35 * strength,
            }}
          />
        ) : null,
      )}
      <AbsoluteFill style={{background: '#000', opacity: flicker}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{amount?: number}> = ({amount = 0.65}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${amount}) 100%)`,
    }}
  />
);

/** Full-screen flash that decays from `peak` over `dur` frames. */
export const Flash: React.FC<{at: number; dur?: number; color?: string; peak?: number}> = ({
  at,
  dur = 10,
  color = '#fff',
  peak = 1,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + dur], [peak, 0], clamp);
  if (frame < at || o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

/** Radial speed lines; re-randomised every `step` frames. */
export const SpeedLines: React.FC<{
  count?: number;
  opacity?: number;
  inner?: number;
  color?: string;
  cx?: number;
  cy?: number;
  step?: number;
  seed?: string;
}> = ({count = 80, opacity = 0.35, inner = 320, color = '#fff', cx = 960, cy = 540, step = 2, seed = 'sl'}) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / step);
  const R = 1600;
  const polys = Array.from({length: count}, (_, i) => {
    const a = random(`${seed}a${i}-${k}`) * Math.PI * 2;
    const w = 0.003 + random(`${seed}w${i}-${k}`) * 0.012;
    const r0 = inner + random(`${seed}r${i}-${k}`) * 260;
    const p = (ang: number, r: number) => `${cx + Math.cos(ang) * r},${cy + Math.sin(ang) * r}`;
    return {
      pts: `${p(a, r0)} ${p(a - w, R)} ${p(a + w, R)}`,
      o: 0.3 + random(`${seed}o${i}-${k}`) * 0.7,
    };
  });
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity}}>
      {polys.map((p, i) => (
        <polygon key={i} points={p.pts} fill={color} opacity={p.o} />
      ))}
    </svg>
  );
};
