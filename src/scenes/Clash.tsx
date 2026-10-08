import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame} from 'remotion';
import {IMG} from '../assets';
import {CLASH_STAMP} from '../copy';
import {F} from '../fonts';
import {addShakes, clamp, Flash, RGBSplit, shake, shakeTransform, SpeedLines} from '../fx';
import {C} from '../theme';

// Local frames (scene is 120 frames = 2s).
const TEAR_END = 8;
const SLIDE_START = 8;
export const SLAM = 26;
export const STAMP = 50;

// The render is 1953px wide; centre it on the 1920 canvas.
const RENDER_W = 1953;
const SPLIT_X = 966;
const OFF_X = (1920 - RENDER_W) / 2;
const SEAM_X = OFF_X + SPLIT_X;

const GlitchTear: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > SLAM + 2) return null;
  const grow = interpolate(frame, [0, TEAR_END - 2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const bars = Array.from({length: 14}, (_, i) => {
    const k = Math.floor(frame / 2);
    return {
      y: random(`gy${i}-${k}`) * 1080 * grow,
      h: 2 + random(`gh${i}-${k}`) * 22,
      w: 40 + random(`gw${i}-${k}`) * 420,
      x: SEAM_X + (random(`gx${i}-${k}`) - 0.5) * 300,
      c: [C.teal, C.magenta, '#fff'][i % 3],
      on: random(`go${i}-${k}`) > 0.35,
    };
  });
  const lineW = interpolate(frame, [0, 4, SLAM], [2, 10, 4], clamp);
  return (
    <AbsoluteFill>
      {/* the slash itself */}
      <div
        style={{
          position: 'absolute',
          left: SEAM_X - lineW / 2,
          top: 0,
          width: lineW,
          height: 1080 * grow,
          background: '#fff',
          boxShadow: `0 0 30px #fff, -8px 0 24px ${C.teal}, 8px 0 24px ${C.magenta}`,
          transform: `skewX(${(random(`sk${frame}`) - 0.5) * 6}deg)`,
        }}
      />
      {bars.map((b, i) =>
        b.on ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x - b.w / 2,
              top: b.y,
              width: b.w,
              height: b.h,
              background: b.c,
              opacity: 0.8,
              mixBlendMode: 'screen',
            }}
          />
        ) : null,
      )}
    </AbsoluteFill>
  );
};

const Stamp: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - STAMP;
  if (t < 0) return null;
  const sc = interpolate(t, [0, 6], [2.6, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const o = interpolate(t, [0, 3], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 960 - 130,
        top: 800,
        width: 260,
        height: 160,
        opacity: o,
        transform: `rotate(-7deg) scale(${sc})`,
        border: `8px solid ${C.red}`,
        boxShadow: `inset 0 0 0 4px rgba(0,0,0,0.0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.brush,
        fontSize: 120,
        color: C.red,
        lineHeight: 1,
        background: 'rgba(10,0,0,0.35)',
        textShadow: '0 0 2px rgba(0,0,0,0.6)',
      }}
    >
      {CLASH_STAMP}
    </div>
  );
};

export const Clash: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.in(Easing.cubic);
  const blueX = interpolate(frame, [SLIDE_START, SLAM], [-1100, 0], {...clamp, easing: ease});
  const pinkX = interpolate(frame, [SLIDE_START, SLAM], [1100, 0], {...clamp, easing: ease});
  // A little bounce on impact: plates overshoot into each other and recoil.
  const recoil = frame >= SLAM ? Math.sin((frame - SLAM) * 0.9) * Math.exp(-(frame - SLAM) * 0.25) * 16 : 0;
  const push = interpolate(frame, [SLAM, 120], [1.0, 1.09], clamp);
  const s = addShakes(shake(frame, SLAM, 34, 38, 'cl'), shake(frame, STAMP, 12, 10, 'st'));
  const ab = interpolate(frame, [SLAM, SLAM + 22], [34, 0], clamp) + (frame < SLAM ? 6 : 0);
  const seamGlow = interpolate(frame, [SLAM, SLAM + 30], [1, 0], clamp);
  const blur = frame < SLAM ? interpolate(frame, [SLIDE_START, SLAM], [0, 14], clamp) : 0;

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <RGBSplit amount={ab}>
        <AbsoluteFill style={{transform: shakeTransform(s, push)}}>
          <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>
            {frame >= SLIDE_START ? (
              <>
                <Img
                  src={IMG.plateBlueRaw}
                  style={{
                    position: 'absolute',
                    left: OFF_X + blueX - recoil,
                    top: 0,
                    height: 1080,
                    filter: 'contrast(1.1) saturate(1.15)',
                  }}
                />
                <Img
                  src={IMG.platePinkRaw}
                  style={{
                    position: 'absolute',
                    left: SEAM_X + pinkX + recoil,
                    top: 0,
                    height: 1080,
                    filter: 'contrast(1.1) saturate(1.2)',
                  }}
                />
              </>
            ) : null}
          </AbsoluteFill>
          {/* impact seam */}
          {seamGlow > 0 ? (
            <div
              style={{
                position: 'absolute',
                left: SEAM_X - 40,
                top: 0,
                width: 80,
                height: 1080,
                opacity: seamGlow,
                background: 'linear-gradient(90deg, rgba(34,215,234,0) 0%, #fff 50%, rgba(255,63,174,0) 100%)',
                mixBlendMode: 'screen',
              }}
            />
          ) : null}
          {frame >= SLAM && frame < SLAM + 14 ? (
            <AbsoluteFill style={{mixBlendMode: 'screen'}}>
              <SpeedLines count={110} inner={180} opacity={interpolate(frame, [SLAM, SLAM + 14], [0.9, 0], clamp)} cx={SEAM_X} seed="cs" />
            </AbsoluteFill>
          ) : null}
          <Stamp />
        </AbsoluteFill>
      </RGBSplit>
      <GlitchTear />
      <Flash at={SLAM} dur={12} />
      <Flash at={STAMP} dur={5} peak={0.25} color={C.red} />
    </AbsoluteFill>
  );
};
