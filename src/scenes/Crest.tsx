import React from 'react';
import {Img} from 'remotion';
import {IMG, LOGO} from '../assets';
import {C} from '../theme';

/**
 * Family crest ("mon") built from the two logo cats: a one-colour white
 * emblem in a double ring. The black cat is inverted to white; the white cat
 * sits in front with a black gap, and the KITSCH bar becomes a band.
 */
export const CREST_SIZE = 620;

// Union of the two cat boxes in logo pixel space.
const GX0 = Math.min(LOGO.catBlack.x, LOGO.catWhite.x);
const GY0 = Math.min(LOGO.catBlack.y, LOGO.catWhite.y);
const GX1 = Math.max(LOGO.catBlack.x + LOGO.catBlack.w, LOGO.catWhite.x + LOGO.catWhite.w);
const GY1 = Math.max(LOGO.catBlack.y + LOGO.catBlack.h, LOGO.catWhite.y + LOGO.catWhite.h);
const GW = GX1 - GX0;
const GH = GY1 - GY0;

const place = (b: {x: number; y: number; w: number; h: number}): React.CSSProperties => ({
  position: 'absolute',
  left: b.x - GX0,
  top: b.y - GY0,
  width: b.w,
  height: b.h,
});

export const CrestArt: React.FC = () => {
  const D = CREST_SIZE;
  const inner = D * 0.78;
  const s = (inner * 0.86) / GW;
  const barTop = LOGO.bar.y - GY0;
  return (
    <div style={{position: 'relative', width: D, height: D}}>
      {/* disc */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 45%, #1a1a1a 0%, #050505 70%)',
        }}
      />
      {/* emblem, clipped to the inner circle */}
      <div
        style={{
          position: 'absolute',
          left: (D - inner) / 2,
          top: (D - inner) / 2,
          width: inner,
          height: inner,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: GW,
            height: GH,
            left: inner / 2 - (GW * s) / 2 - 10,
            top: inner / 2 - (GH * s) / 2 + 18,
            transform: `scale(${s})`,
            transformOrigin: '0 0',
          }}
        >
          <Img src={IMG.catBlack} style={{...place(LOGO.catBlack), filter: 'invert(1) brightness(1.05)'}} />
          {/* black gap around the white cat */}
          <Img
            src={IMG.catWhite}
            style={{...place(LOGO.catWhite), filter: 'brightness(0)', transform: 'scale(1.07)'}}
          />
          <Img src={IMG.catWhite} style={place(LOGO.catWhite)} />
          {/* bar -> band (with a black gap line above it) */}
          <div
            style={{
              position: 'absolute',
              left: LOGO.bar.x - GX0,
              top: barTop - 18,
              width: 2000,
              height: 18,
              background: '#050505',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: LOGO.bar.x - GX0,
              top: barTop,
              width: 2000,
              height: 150,
              background: C.white,
            }}
          />
        </div>
      </div>
      {/* double ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `16px solid ${C.white}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 30,
          borderRadius: '50%',
          border: `5px solid ${C.white}`,
        }}
      />
    </div>
  );
};
