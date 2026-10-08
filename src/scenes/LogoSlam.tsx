import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame} from 'remotion';
import {IMG, LOGO} from '../assets';
import {NEON_WORD} from '../copy';
import {F} from '../fonts';
import {addShakes, clamp, Flash, RGBSplit, shake, shakeTransform} from '../fx';
import {C} from '../theme';

// Local frames (scene is 120 frames = 2s).
export const LS = {
  DROP: 6,
  IMPACT: 13,
  TYPE: 34,
  TYPE_STEP: 5,
  HOP_BLACK: 76,
  HOP_WHITE: 84,
  BLINK: 100,
};
const WORD = NEON_WORD;

const S = 1320 / LOGO.full.w;
const X0 = LOGO.full.x;
const Y0 = LOGO.full.y;

// White cat's eyes in logo pixel space (measured from the source logo).
const EYES = [
  {x: 712, y: 511, w: 160, h: 90},
  {x: 978, y: 470, w: 134, h: 106},
];

const place = (b: {x: number; y: number; w: number; h: number}): React.CSSProperties => ({
  position: 'absolute',
  left: b.x - X0,
  top: b.y - Y0,
  width: b.w,
  height: b.h,
});

/** Frames between letters when the sign powers off (last letter first). */
export const POWER_OFF_STEP = 4;

/** Is letter i lit at local frame f? Flickers on like a neon tube, with one bad letter. */
const letterOn = (i: number, f: number, powerOff?: number) => {
  const t = f - (LS.TYPE + i * LS.TYPE_STEP);
  if (t < 0) return false;
  if (powerOff !== undefined && f >= powerOff + (WORD.length - 1 - i) * POWER_OFF_STEP) return false;
  if (t < 7) return [1, 1, 0, 0, 1, 0, 1][t] === 1;
  // Whole-sign stutter.
  if (f === 70 || f === 71) return false;
  // The last "s" has a dodgy transformer.
  if (i === WORD.length - 1 && f >= 92 && f < 104) return random(`bad${f}`) > 0.5;
  return true;
};

const hop = (f: number, start: number) => {
  const t = f - start;
  if (t < 0 || t > 16) return {y: 0, sx: 1, sy: 1};
  if (t < 3) return {y: 0, sx: 1.08, sy: 0.9}; // anticipation squash
  if (t < 13) {
    const p = (t - 3) / 10;
    return {y: -Math.sin(p * Math.PI) * 70, sx: 0.95, sy: 1.07};
  }
  return {y: 0, sx: 1.1, sy: 0.88}; // landing squash
};

const NeonWord: React.FC<{powerOff?: number}> = ({powerOff}) => {
  const frame = useCurrentFrame();
  const lit = Array.from(WORD).filter((_, i) => letterOn(i, frame, powerOff)).length;
  const hum = 0.92 + random(`hum${frame}`) * 0.08;
  return (
    <div
      style={{
        position: 'absolute',
        left: 1300 - X0,
        top: 40 - Y0,
        width: 960,
        height: 640,
      }}
    >
      {/* glow spilling onto the "wall" */}
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background: `radial-gradient(ellipse at 50% 55%, rgba(255,63,174,${0.32 * (lit / WORD.length) * hum}) 0%, rgba(255,63,174,0) 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 40,
          textAlign: 'center',
          fontFamily: F.neon,
          fontSize: 400,
          lineHeight: 1.2,
          transform: 'rotate(-7deg)',
          whiteSpace: 'nowrap',
        }}
      >
        {Array.from(WORD).map((ch, i) => {
          const on = letterOn(i, frame, powerOff);
          const typed = frame >= LS.TYPE + i * LS.TYPE_STEP;
          return (
            <span
              key={i}
              style={{
                color: on ? '#ffe6f5' : 'rgba(150,50,100,0.45)',
                opacity: typed ? 1 : 0,
                WebkitTextStroke: on ? '0px transparent' : '3px rgba(255,120,190,0.25)',
                textShadow: on
                  ? `0 0 6px #fff, 0 0 16px ${C.magenta}, 0 0 34px ${C.magenta}, 0 0 70px ${C.magenta}, 0 0 130px ${C.crimson}`
                  : 'none',
                filter: on ? `brightness(${hum})` : 'none',
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/**
 * powerOff: optional local frame where the neon sign switches off letter by
 * letter, after which the whole logo fades to black.
 */
export const LogoSlam: React.FC<{powerOff?: number}> = ({powerOff}) => {
  const frame = useCurrentFrame();
  const fadeOut =
    powerOff === undefined
      ? 1
      : interpolate(frame, [powerOff + WORD.length * POWER_OFF_STEP + 6, powerOff + WORD.length * POWER_OFF_STEP + 50], [1, 0], clamp);
  const {DROP, IMPACT} = LS;
  const drop = interpolate(frame, [DROP, IMPACT], [2.8, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const settle = frame >= IMPACT ? 1 + Math.sin((frame - IMPACT) * 0.8) * Math.exp(-(frame - IMPACT) * 0.3) * 0.03 : 0;
  const scale = (frame < IMPACT ? drop : settle) * S;
  const o = interpolate(frame, [DROP, DROP + 3], [0, 1], clamp);
  const s = addShakes(shake(frame, IMPACT, 26, 34, 'lg'), shake(frame, LS.TYPE, 6, 3, 'ty'));
  const ab = interpolate(frame, [IMPACT, IMPACT + 16], [24, 0], clamp);

  const blackHop = hop(frame, LS.HOP_BLACK);
  const whiteHop = hop(frame, LS.HOP_WHITE);
  const blinking = frame >= LS.BLINK && frame < LS.BLINK + 6;

  const ring = (delay: number, color: string, width: number) => {
    const t = frame - IMPACT - delay;
    if (t < 0 || t > 30) return null;
    const r = interpolate(t, [0, 30], [80, 1500], {...clamp, easing: Easing.out(Easing.cubic)});
    return (
      <div
        style={{
          position: 'absolute',
          left: 960 - r,
          top: 560 - r * 0.62,
          width: r * 2,
          height: r * 1.24,
          borderRadius: '50%',
          border: `${interpolate(t, [0, 30], [width, 1], clamp)}px solid ${color}`,
          opacity: interpolate(t, [0, 30], [1, 0], clamp),
          boxShadow: `0 0 40px ${color}`,
        }}
      />
    );
  };

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <RGBSplit amount={ab}>
        <AbsoluteFill style={{transform: shakeTransform(s)}}>
          {/* soft spotlight so the black elements separate from the void */}
          <AbsoluteFill
            style={{
              opacity: interpolate(frame, [IMPACT, IMPACT + 8], [0, 1], clamp) * fadeOut,
              background: 'radial-gradient(ellipse 55% 60% at 50% 55%, #24232b 0%, #0b0b0e 60%, #000 100%)',
            }}
          />
          {ring(0, '#ffffff', 40)}
          {ring(3, C.teal, 18)}
          {ring(6, C.magenta, 14)}
          {frame >= DROP ? (
            <div
              style={{
                position: 'absolute',
                left: 960 - (LOGO.full.w * S) / 2,
                top: 590 - (LOGO.full.h * S) / 2,
                width: LOGO.full.w,
                height: LOGO.full.h,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                opacity: o * fadeOut,
              }}
            >
              <NeonWord powerOff={powerOff} />
              <Img
                src={IMG.catBlack}
                style={{
                  ...place(LOGO.catBlack),
                  // Black-on-black needs a rim light to read.
                  filter: `drop-shadow(0 0 2px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.8)) drop-shadow(-6px 0 26px ${C.teal})`,
                  transform: `translateY(${blackHop.y}px) scale(${blackHop.sx}, ${blackHop.sy})`,
                  transformOrigin: '50% 100%',
                }}
              />
              <div
                style={{
                  ...place(LOGO.catWhite),
                  transform: `translateY(${whiteHop.y}px) scale(${whiteHop.sx}, ${whiteHop.sy})`,
                  transformOrigin: '50% 100%',
                }}
              >
                <Img src={IMG.catWhite} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
                {blinking
                  ? EYES.map((e, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: e.x - LOGO.catWhite.x - 8,
                          top: e.y - LOGO.catWhite.y - 8,
                          width: e.w + 16,
                          height: e.h + 16,
                          background: '#fdfdf3',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: 10,
                            right: 10,
                            top: e.h * 0.62,
                            height: 18,
                            background: '#000',
                          }}
                        />
                      </div>
                    ))
                  : null}
              </div>
              <Img
                src={IMG.bar}
                style={{
                  ...place(LOGO.bar),
                  filter: `drop-shadow(0 0 2px rgba(220,220,230,0.9)) drop-shadow(0 0 30px rgba(255,63,174,0.35))`,
                }}
              />
            </div>
          ) : null}
        </AbsoluteFill>
      </RGBSplit>
      <Flash at={IMPACT} dur={10} peak={0.9} />
    </AbsoluteFill>
  );
};
