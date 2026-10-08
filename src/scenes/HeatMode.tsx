import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame} from 'remotion';
import {AURA_PAD, IMG, RENDER} from '../assets';
import {FLICKER_KANJI, HEAT_LABEL_JP} from '../copy';
import {F} from '../fonts';
import {addShakes, clamp, Flash, RGBSplit, shake, shakeTransform, SpeedLines} from '../fx';
import {C, Side, sideColor} from '../theme';

// Local frames (scene is 150 frames = 2.5s).
const ENTER = 10;
const IGNITE = 8;
const BEAT = 15; // drum hits in heat.wav every 0.25s

// Flame look: displace a pre-baked soft silhouette with stretched noise, then tint it.
const AuraFilter: React.FC<{id: string; color: string; seed: number; disp: number}> = ({id, color, seed, disp}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={disp} xChannelSelector="R" yChannelSelector="G" result="m" />
      <feFlood floodColor={color} result="c" />
      <feComposite in="c" in2="m" operator="in" />
    </filter>
  </svg>
);

const Fighter: React.FC<{
  side: Side;
  src: string;
  aura: string;
  rim: string;
  w: number;
  h: number;
  left: number;
  enterFrom: number;
  power: number;
}> = ({side, src, aura, rim, w, h, left, enterFrom, power}) => {
  const frame = useCurrentFrame();
  const col = sideColor(side);
  const height = 980;
  const k = height / h;
  const width = w * k;
  const x = interpolate(frame, [0, ENTER], [enterFrom, 0], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const seed = Math.floor(frame / 2);
  const flare = 1 + Math.sin(frame / 3.1) * 0.06 + (frame % BEAT < 3 ? 0.06 : 0);
  const top = 1080 - height + 70;
  const box: React.CSSProperties = {position: 'absolute', left: left + x, top, width, height};
  const pad = AURA_PAD * k;
  const auraBox: React.CSSProperties = {
    position: 'absolute',
    left: left + x - pad,
    top: top - pad,
    width: width + pad * 2,
    height: height + pad * 2,
    transformOrigin: '50% 90%',
    mixBlendMode: 'screen',
  };
  const outer = `aura-o-${side}`;
  const inner = `aura-i-${side}`;
  return (
    <>
      <AuraFilter id={outer} color={col} seed={seed} disp={110} />
      <AuraFilter id={inner} color="#ffffff" seed={seed + 50} disp={40} />
      {/* outer flame, stretched upward */}
      <Img
        src={aura}
        style={{...auraBox, filter: `url(#${outer})`, opacity: power, transform: `scale(${1.02 * flare}, ${1.08 * flare})`}}
      />
      <Img
        src={aura}
        style={{
          ...auraBox,
          filter: `url(#${outer})`,
          opacity: power * 0.6,
          transform: `scale(${1.1 * flare}, ${1.2 * flare}) translateY(-30px)`,
        }}
      />
      {/* hot inner rim */}
      <Img src={rim} style={{...auraBox, filter: `url(#${inner})`, opacity: power * 0.5}} />
      <Img
        src={src}
        style={{
          ...box,
          filter: `contrast(1.2) brightness(${1 + power * 0.08}) drop-shadow(0 0 3px ${col})`,
        }}
      />
    </>
  );
};

const Embers: React.FC<{side: Side; x0: number; x1: number}> = ({side, x0, x1}) => {
  const frame = useCurrentFrame();
  const col = sideColor(side);
  return (
    <>
      {Array.from({length: 46}, (_, i) => {
        const speed = 6 + random(`es${side}${i}`) * 12;
        const off = random(`eo${side}${i}`) * 1300;
        const y = 1150 - ((frame * speed + off) % 1300);
        const x = x0 + random(`ex${side}${i}`) * (x1 - x0) + Math.sin((frame + i * 17) / 8) * 20;
        const size = 3 + random(`ez${side}${i}`) * 7;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size * 1.6,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: `0 0 ${size * 2}px ${size}px ${col}`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </>
  );
};

const KanjiFlicker: React.FC = () => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 3);
  const chars = Array.from(FLICKER_KANJI);
  return (
    <AbsoluteFill>
      {Array.from({length: 26}, (_, i) => {
        const x = random(`kx${i}-${k}`) * 1920;
        const ch = chars[Math.floor(random(`kc${i}-${k}`) * chars.length)];
        const size = 60 + random(`ks${i}-${k}`) * 260;
        const col = x < 960 ? C.teal : C.magenta;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: random(`ky${i}-${k}`) * 1080 - size / 2,
              fontFamily: i % 2 ? F.brush : F.heavyJP,
              fontSize: size,
              lineHeight: 1,
              color: col,
              opacity: 0.08 + random(`ko${i}-${k}`) * 0.25,
              textShadow: `0 0 20px ${col}`,
            }}
          >
            {ch}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const HeatGauge: React.FC = () => {
  const frame = useCurrentFrame();
  const segs = 24;
  const fill = interpolate(frame, [14, 60], [0, segs], {...clamp, easing: Easing.out(Easing.quad)});
  const full = fill >= segs;
  const blink = full && Math.floor(frame / 4) % 2 === 0;
  const o = interpolate(frame, [6, 14], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 960 - 470,
        top: 960,
        width: 940,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity: o,
        transform: 'skewX(-14deg)',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 0.9}}>
        <div style={{fontFamily: F.heavyJP, fontSize: 26, color: C.white}}>{HEAT_LABEL_JP}</div>
        <div
          style={{
            fontFamily: F.anton,
            fontSize: 64,
            color: blink ? '#fff' : C.white,
            textShadow: `0 0 ${blink ? 30 : 10}px ${C.magenta}, 0 0 ${blink ? 30 : 10}px ${C.teal}`,
          }}
        >
          HEAT
        </div>
      </div>
      <div
        style={{
          flex: 1,
          height: 40,
          border: '4px solid #fff',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          gap: 4,
          padding: 4,
          boxShadow: full ? `0 0 ${blink ? 40 : 16}px #fff` : 'none',
        }}
      >
        {Array.from({length: segs}, (_, i) => {
          const on = i < fill;
          const t = i / (segs - 1);
          const col = t < 0.5 ? C.teal : C.magenta;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: on ? (blink ? '#fff' : col) : 'rgba(255,255,255,0.08)',
                boxShadow: on ? `0 0 12px ${col}` : 'none',
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontFamily: F.anton,
          fontSize: 56,
          width: 120,
          color: '#fff',
          opacity: full ? (blink ? 1 : 0.35) : 0,
          textShadow: `0 0 20px ${C.magenta}`,
        }}
      >
        MAX
      </div>
    </div>
  );
};

export const HeatMode: React.FC = () => {
  const frame = useCurrentFrame();
  const power = interpolate(frame, [IGNITE, IGNITE + 14], [0, 1], clamp);
  const beats = Array.from({length: 10}, (_, i) => shake(frame, i * BEAT, 8, i === 0 ? 30 : 9, `hb${i}`));
  const s = addShakes(...beats);
  const zoom = interpolate(frame, [0, 150], [1.0, 1.07], clamp);
  const ab = interpolate(frame, [0, 10], [26, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <RGBSplit amount={ab}>
        <AbsoluteFill style={{transform: shakeTransform(s, zoom)}}>
          {/* split energy background */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 25% 60%, ${C.tealMid} 0%, ${C.tealDeep} 35%, #000 70%)`,
              clipPath: 'polygon(0 0, 56% 0, 44% 100%, 0 100%)',
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 75% 60%, ${C.crimson} 0%, ${C.pinkDeep} 35%, #000 70%)`,
              clipPath: 'polygon(56% 0, 100% 0, 100% 100%, 44% 100%)',
            }}
          />
          <KanjiFlicker />
          <AbsoluteFill style={{mixBlendMode: 'screen'}}>
            <SpeedLines count={100} inner={380} opacity={0.32} seed="hm" />
          </AbsoluteFill>
          <Fighter
            side="blue"
            src={IMG.jojo}
            aura={IMG.jojoAura}
            rim={IMG.jojoRim}
            w={RENDER.jojo.w}
            h={RENDER.jojo.h}
            left={330}
            enterFrom={-700}
            power={power}
          />
          <Fighter
            side="pink"
            src={IMG.sevas}
            aura={IMG.sevasAura}
            rim={IMG.sevasRim}
            w={RENDER.sevas.w}
            h={RENDER.sevas.h}
            left={1010}
            enterFrom={700}
            power={power}
          />
          <Embers side="blue" x0={200} x1={960} />
          <Embers side="pink" x0={960} x1={1720} />
        </AbsoluteFill>
      </RGBSplit>
      <HeatGauge />
      <Flash at={0} dur={10} />
      <Flash at={IGNITE} dur={8} peak={0.4} color={C.magenta} />
    </AbsoluteFill>
  );
};
