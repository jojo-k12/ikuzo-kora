import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import {F} from '../fonts';
import {addShakes, clamp, Flash, RGBSplit, shake, shakeTransform, SpeedLines} from '../fx';
import {C, Side, sideColor, sideDeep} from '../theme';

// Local frames (scene is 120 frames = 2s).
export const CARD = {
  KANJI: 6,
  NAME: 30,
  TITLE: 36,
  FREEZE: 46,
  CUT: 110,
  LEN: 120,
};

export type BossCardProps = {
  side: Side;
  image: string;
  imageW: number;
  imageH: number;
  name: string;
  nameJP: string;
  title: string;
  titleJP: string;
  kanji: string;
  plate: string;
  /** Character on the right, text on the left. */
  flip?: boolean;
};

export const BossCard: React.FC<BossCardProps> = ({
  side,
  image,
  imageW,
  imageH,
  name,
  nameJP,
  title,
  titleJP,
  kanji,
  plate,
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const {KANJI, NAME, TITLE, FREEZE, CUT} = CARD;
  // Everything except grain and the freeze treatment stops at FREEZE.
  const m = Math.min(frame, FREEZE);
  const frozen = frame >= FREEZE;
  const col = sideColor(side);
  const deep = sideDeep(side);

  // Character punch-in.
  const punch = interpolate(m, [0, 9], [1.9, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const drift = 1 + m * 0.0012;
  const charBlur = interpolate(m, [0, 8], [14, 0], clamp);
  const charH = 1040;
  const charW = (imageW / imageH) * charH;
  const charLeft = flip ? 1920 - 300 - charW : 300;
  const charCx = charLeft + charW / 2;

  // Kanji slam.
  const kT = m - KANJI;
  const kScale = interpolate(kT, [0, 6], [2.4, 1], {...clamp, easing: Easing.in(Easing.quad)}) + Math.max(0, kT) * 0.002;
  const kOpacity = interpolate(kT, [0, 3], [0, 1], clamp);

  // Name slam.
  const nT = m - NAME;
  const nScale = interpolate(nT, [0, 6], [2.8, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const nOpacity = interpolate(nT, [0, 2], [0, 1], clamp);
  const tT = m - TITLE;
  const titleX = interpolate(tT, [0, 8], [flip ? -160 : 160, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const titleO = interpolate(tT, [0, 5], [0, 1], clamp);

  const s = addShakes(
    shake(frame, KANJI + 6, 16, 14, 'k'),
    shake(frame, NAME + 6, 12, 30, 'n'),
    shake(frame, FREEZE, 6, 8, 'f'),
  );
  const ab = interpolate(frame, [NAME + 6, NAME + 18], [22, 0], clamp) + interpolate(frame, [0, 8], [16, 0], clamp);

  // Cut out: frame tears along a diagonal and the halves fly apart.
  const cT = frame - CUT;
  const split = cT >= 0 ? Math.pow(cT, 2) * 9 : 0;

  // Freeze treatment: snap zoom + contrast hit + frame border.
  const fz = frozen ? 1.025 : 1;
  const fzFilter = frozen ? 'contrast(1.18) brightness(1.04)' : 'none';

  const textBlock: React.CSSProperties = flip
    ? {left: 90, width: 860, alignItems: 'flex-end', textAlign: 'right'}
    : {left: 990, width: 860, alignItems: 'flex-start', textAlign: 'left'};

  const scene = (
    <AbsoluteFill style={{transform: shakeTransform(s, fz), filter: fzFilter}}>
      {/* grainy monochrome plate, duotoned to this side's colour */}
      <AbsoluteFill style={{background: deep, overflow: 'hidden'}}>
        <Img
          src={plate}
          style={{
            position: 'absolute',
            inset: 0,
            width: 1920,
            height: 1080,
            objectFit: 'cover',
            objectPosition: side === 'blue' ? '0% 30%' : '100% 30%',
            filter: 'grayscale(1) contrast(1.8) brightness(0.75)',
            transform: `scale(${1.12 - m * 0.0012})`,
            opacity: 0.9,
          }}
        />
        <AbsoluteFill style={{background: col, mixBlendMode: 'multiply'}} />
        <AbsoluteFill style={{background: deep, mixBlendMode: 'screen', opacity: 0.6}} />
        {/* halftone-ish diagonal stripes */}
        <AbsoluteFill
          style={{
            backgroundImage: `repeating-linear-gradient(${flip ? -60 : 60}deg, rgba(0,0,0,0.35) 0 3px, rgba(0,0,0,0) 3px 11px)`,
            mixBlendMode: 'multiply',
          }}
        />
      </AbsoluteFill>

      {m < 16 ? (
        <AbsoluteFill style={{mixBlendMode: 'screen'}}>
          <SpeedLines count={90} inner={260} cx={charCx} opacity={interpolate(m, [0, 16], [0.7, 0], clamp)} seed={`bc${side}`} />
        </AbsoluteFill>
      ) : null}

      {/* brush kanji */}
      <div
        style={{
          position: 'absolute',
          left: charCx - 560 + (flip ? -170 : 170),
          top: -60,
          width: 1120,
          height: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.brush,
          fontSize: 1050,
          lineHeight: 1,
          color: col,
          opacity: kOpacity * 0.95,
          WebkitTextStroke: `4px ${C.white}`,
          transform: `scale(${kScale}) rotate(${flip ? 6 : -6}deg)`,
          textShadow: `16px 16px 0 #000, 0 0 60px ${col}`,
        }}
      >
        {kanji}
      </div>

      {/* character */}
      <Img
        src={image}
        style={{
          position: 'absolute',
          left: charLeft,
          top: 1080 - charH + 60,
          width: charW,
          height: charH,
          transform: `scale(${punch * drift})`,
          transformOrigin: '50% 40%',
          filter: `blur(${charBlur}px) contrast(1.12) drop-shadow(${flip ? 10 : -10}px 0 0 ${col}) drop-shadow(0 0 40px rgba(0,0,0,0.9))`,
        }}
      />

      {/* name block */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          display: 'flex',
          flexDirection: 'column',
          ...textBlock,
        }}
      >
        <div
          style={{
            fontFamily: F.serifJP,
            fontWeight: 900,
            fontSize: 46,
            color: C.white,
            letterSpacing: 6,
            opacity: titleO,
            transform: `translateX(${titleX}px)`,
            textShadow: `0 0 18px ${col}, 3px 3px 0 #000`,
          }}
        >
          【{titleJP}】
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: flip ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 26,
            opacity: nOpacity,
            transform: `scale(${nScale}) skewX(-8deg)`,
            transformOrigin: flip ? '100% 50%' : '0% 50%',
          }}
        >
          <div
            style={{
              fontFamily: F.anton,
              fontSize: 300,
              lineHeight: 0.95,
              color: C.white,
              letterSpacing: 4,
              WebkitTextStroke: '6px #000',
              textShadow: `12px 12px 0 ${col}, 22px 22px 0 #000`,
            }}
          >
            {name}
          </div>
          <div
            style={{
              writingMode: 'vertical-rl',
              fontFamily: F.brush,
              fontSize: 64,
              color: col,
              lineHeight: 1,
              textShadow: '3px 3px 0 #000',
            }}
          >
            {nameJP}
          </div>
        </div>
        <div
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: titleO,
            transform: `translateX(${-titleX}px)`,
          }}
        >
          <div style={{width: 70, height: 6, background: col}} />
          <div
            style={{
              fontFamily: F.bebas,
              fontSize: flip ? 68 : 80,
              letterSpacing: 10,
              color: '#000',
              background: col,
              padding: '4px 22px 0',
              lineHeight: 1.05,
              boxShadow: '8px 8px 0 #000',
            }}
          >
            {title}
          </div>
          <div style={{width: 70, height: 6, background: col}} />
        </div>
      </div>

      {frozen ? (
        <AbsoluteFill
          style={{
            border: `14px solid ${C.white}`,
            boxShadow: `inset 0 0 0 4px #000, inset 0 0 0 10px ${col}`,
            margin: 22,
            opacity: interpolate(frame, [FREEZE, FREEZE + 3], [0, 1], clamp),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {cT < 0 ? (
        <RGBSplit amount={ab}>{scene}</RGBSplit>
      ) : (
        <>
          <AbsoluteFill
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 38%, 0 62%)',
              transform: `translate(${-split}px, ${-split * 0.2}px)`,
            }}
          >
            {scene}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              clipPath: 'polygon(0 62%, 100% 38%, 100% 100%, 0 100%)',
              transform: `translate(${split}px, ${split * 0.2}px)`,
            }}
          >
            {scene}
          </AbsoluteFill>
          {cT < 5 ? (
            <div
              style={{
                position: 'absolute',
                left: -100,
                top: 540 - 4,
                width: 2120,
                height: 8,
                background: '#fff',
                boxShadow: `0 0 30px ${col}`,
                transform: 'rotate(-7.1deg)',
              }}
            />
          ) : null}
        </>
      )}
      <Flash at={NAME + 6} dur={6} peak={0.7} />
      <Flash at={FREEZE} dur={4} peak={0.5} />
    </AbsoluteFill>
  );
};
