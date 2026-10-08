import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {MONTAGE} from '../copy';
import {F} from '../fonts';
import {clamp, SpeedLines} from '../fx';
import {KanjiFlicker} from '../scenes/HeatMode';
import {C} from '../theme';
import {Corner, f, KICKS, M, STAMPS} from './timeline';

const slam = (t: number, from = 2.4, dur = 5) =>
  interpolate(t, [0, dur], [from, 1], {...clamp, easing: Easing.in(Easing.cubic)});

/** Brush kanji slammed into a corner on each cut. */
export const CutStamps: React.FC = () => {
  const frame = useCurrentFrame();
  const glyphs = Array.from(MONTAGE.stamps);
  const pos: Record<Corner, React.CSSProperties> = {
    tl: {left: 70, top: 40},
    tr: {right: 70, top: 40},
    bl: {left: 70, bottom: 60},
    br: {right: 70, bottom: 60},
  };
  return (
    <AbsoluteFill>
      {STAMPS.map(([at, gi, corner], i) => {
        const t = frame - f(at);
        if (t < 0 || t > 46) return null;
        const col = i % 2 ? C.magenta : C.teal;
        const o = interpolate(t, [0, 2, 30, 46], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos[corner],
              fontFamily: F.brush,
              fontSize: 250,
              lineHeight: 1,
              color: col,
              opacity: o,
              transform: `scale(${slam(t)}) rotate(${corner.endsWith('l') ? -8 : 8}deg)`,
              textShadow: `10px 10px 0 #000, 0 0 40px ${col}`,
              WebkitTextStroke: `3px ${C.white}`,
            }}
          >
            {glyphs[gi]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const HEX = '0123456789ABCDEF#%&@';

/** Decodes the hex clip's message as a glitchy type-on. */
export const HexDecode: React.FC = () => {
  const frame = useCurrentFrame();
  const [a, b] = M.hex.map(f);
  const t = frame - a - 4;
  if (frame < a || frame >= b) return null;
  const msg = MONTAGE.hexDecoded;
  const locked = Math.floor(interpolate(t, [0, 34], [0, msg.length], clamp));
  const text = Array.from(msg)
    .map((ch, i) => (ch === ' ' || i < locked ? ch : HEX[Math.floor(random(`hx${i}-${frame}`) * HEX.length)]))
    .join('');
  const jx = (random(`hj${frame}`) - 0.5) * (locked < msg.length ? 8 : 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 260,
        display: 'flex',
        justifyContent: 'center',
        opacity: interpolate(frame, [a, a + 4], [0, 1], clamp),
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.75)',
          border: `2px solid ${C.teal}`,
          padding: '10px 34px 4px',
          transform: `translateX(${jx}px)`,
          boxShadow: `0 0 30px rgba(34,215,234,0.4)`,
        }}
      >
        <div style={{fontFamily: F.bebas, fontSize: 26, letterSpacing: 8, color: C.magenta}}>
          {locked < msg.length ? '> DECODING…' : '> DECODED'}
        </div>
        <div
          style={{
            fontFamily: F.bebas,
            fontSize: 76,
            letterSpacing: 10,
            color: C.white,
            textShadow: `0 0 18px ${C.teal}, 3px 0 0 rgba(255,63,174,0.7), -3px 0 0 rgba(34,215,234,0.7)`,
            whiteSpace: 'pre',
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

/** ゴール!! slam with the GOAL clip, and a 勝ち越し hanko when the score flips. */
export const GoalOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - f(M.goal);
  const end = f(M.goal + 1.26);
  if (t < 0 || frame >= end) return null;
  const s = frame - f(M.scoreFlip);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 90,
          top: 60,
          fontFamily: F.brush,
          fontSize: 230,
          color: C.magenta,
          transform: `scale(${slam(t, 2.6, 6)}) rotate(-7deg)`,
          opacity: interpolate(t, [0, 2], [0, 1], clamp),
          textShadow: `12px 12px 0 #000, 0 0 50px ${C.magenta}`,
          WebkitTextStroke: `4px ${C.white}`,
          whiteSpace: 'nowrap',
        }}
      >
        {MONTAGE.goal}
      </div>
      {s >= 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 110,
            bottom: 120,
            padding: '6px 26px',
            border: `9px solid ${C.red}`,
            fontFamily: F.brush,
            fontSize: 120,
            color: C.red,
            background: 'rgba(10,0,0,0.45)',
            transform: `scale(${slam(s, 2.6, 6)}) rotate(-9deg)`,
            opacity: interpolate(s, [0, 2], [0, 1], clamp),
          }}
        >
          {MONTAGE.goAhead}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Yakuza-style heat action name banner. */
export const HeatActionBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const a = f(M.heatAction);
  const b = f(M.heatActionEnd);
  if (frame < a || frame >= b) return null;
  const t = frame - a;
  const x = interpolate(t, [0, 8], [900, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const out = interpolate(frame, [b - 8, b], [1, 0], clamp);
  const {label, labelJP, name} = MONTAGE.heatAction;
  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 70,
        width: 1100,
        padding: '14px 60px 14px 120px',
        transform: `translateX(${x}px)`,
        opacity: out,
        background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(6,48,61,0.92) 22%, rgba(0,0,0,0.92) 100%)`,
        borderTop: `3px solid ${C.teal}`,
        borderBottom: `3px solid ${C.teal}`,
        textAlign: 'right',
      }}
    >
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 18, alignItems: 'baseline'}}>
        <span style={{fontFamily: F.heavyJP, fontSize: 26, color: C.teal}}>{labelJP}</span>
        <span style={{fontFamily: F.bebas, fontSize: 34, letterSpacing: 8, color: C.teal}}>{label}</span>
      </div>
      <div
        style={{
          fontFamily: F.anton,
          fontSize: 66,
          color: C.white,
          transform: 'skewX(-10deg)',
          textShadow: `4px 4px 0 #000, 0 0 24px ${C.teal}`,
          letterSpacing: 2,
        }}
      >
        {name}
      </div>
    </div>
  );
};

const STYLE_COLORS = ['#ff4b3e', '#3f74ff', '#b74cff'];

/** Yakuza 0 style-switch HUD synced to the outfit colour changes. */
export const StyleSwitch: React.FC = () => {
  const frame = useCurrentFrame();
  const starts = M.styles.map(f);
  const end = f(M.stylesEnd);
  if (frame < starts[0] || frame >= end) return null;
  let idx = 0;
  starts.forEach((s, i) => {
    if (frame >= s) idx = i;
  });
  const t = frame - starts[idx];
  const col = STYLE_COLORS[idx];
  const st = MONTAGE.styles[idx];
  const bump = interpolate(t, [0, 6], [1.35, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const flash = interpolate(t, [0, 8], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        bottom: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        transform: `scale(${bump})`,
        transformOrigin: '0% 100%',
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: '50%',
          border: `6px solid ${C.white}`,
          background: `radial-gradient(circle, ${col} 0%, #000 75%)`,
          boxShadow: `0 0 ${20 + flash * 50}px ${col}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.heavyJP,
          fontSize: 44,
          color: C.white,
        }}
      >
        {st.jp.slice(0, 1)}
      </div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{fontFamily: F.bebas, fontSize: 34, letterSpacing: 10, color: C.silver}}>STYLE</div>
        <div
          style={{
            fontFamily: F.anton,
            fontSize: 92,
            lineHeight: 0.95,
            color: C.white,
            transform: 'skewX(-10deg)',
            textShadow: `5px 5px 0 ${col}, 9px 9px 0 #000`,
          }}
        >
          {st.name}
        </div>
        <div style={{fontFamily: F.heavyJP, fontSize: 28, color: col}}>{st.jp}</div>
      </div>
    </div>
  );
};

const GOLD = '#d9b45c';

/** "SUBSTORY: How Are We Not Dead?" card, then SUBSTORY COMPLETE before the drop. */
export const Substory: React.FC = () => {
  const frame = useCurrentFrame();
  const a = f(M.substory);
  const b = f(M.substoryOut);
  const c = f(M.complete);
  const d = f(M.drop);
  const {labelJP, number, title, complete, stamp} = MONTAGE.substory;
  const inT = frame - a;
  const x =
    interpolate(inT, [0, 12], [-1000, 0], {...clamp, easing: Easing.out(Easing.cubic)}) +
    interpolate(frame, [b - 10, b], [0, -1000], {...clamp, easing: Easing.in(Easing.cubic)});
  const cT = frame - c;
  return (
    <AbsoluteFill>
      {frame >= a && frame < b ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 90,
            padding: '18px 90px 22px 80px',
            transform: `translateX(${x}px)`,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 70%, rgba(0,0,0,0) 100%)',
            borderLeft: `14px solid ${GOLD}`,
          }}
        >
          <div style={{display: 'flex', gap: 22, alignItems: 'baseline'}}>
            <span style={{fontFamily: F.serifJP, fontWeight: 900, fontSize: 32, color: GOLD}}>{labelJP}</span>
            <span style={{fontFamily: F.bebas, fontSize: 38, letterSpacing: 8, color: C.silver}}>{number}</span>
          </div>
          <div style={{height: 2, background: GOLD, margin: '8px 0 10px', opacity: 0.7}} />
          <div style={{fontFamily: F.anton, fontSize: 72, color: C.white, letterSpacing: 2}}>
            {title.toUpperCase()}
          </div>
        </div>
      ) : null}
      {cT >= 0 && frame < d ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              width: 2200,
              padding: '26px 0 30px',
              background: 'rgba(0,0,0,0.88)',
              borderTop: `4px solid ${GOLD}`,
              borderBottom: `4px solid ${GOLD}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `scaleY(${interpolate(cT, [0, 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)})})`,
            }}
          >
            <div style={{fontFamily: F.bebas, fontSize: 40, letterSpacing: 16, color: GOLD}}>SUBSTORY</div>
            <div
              style={{
                fontFamily: F.anton,
                fontSize: 150,
                lineHeight: 1,
                color: C.white,
                letterSpacing: interpolate(cT, [0, 14], [60, 14], clamp),
                textShadow: `0 0 30px ${GOLD}`,
              }}
            >
              {complete}
            </div>
          </div>
          {cT >= 12 ? (
            <div
              style={{
                position: 'absolute',
                right: 380,
                top: 330,
                width: 200,
                height: 200,
                border: `10px solid ${C.red}`,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.brush,
                fontSize: 150,
                color: C.red,
                transform: `scale(${slam(cT - 12, 2.4, 5)}) rotate(12deg)`,
                background: 'rgba(20,0,0,0.3)',
              }}
            >
              {stamp}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Heat Mode treatment on the drop: kanji flicker, speed lines, colour pulses, gauge. */
export const HeatDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = f(M.drop);
  const b = f(M.legend);
  if (frame < a || frame >= b) return null;
  const t = frame - a;
  const kicks = [M.drop, ...KICKS].map(f).filter((k) => k <= frame);
  const lastKick = kicks.length ? kicks[kicks.length - 1] : a;
  const kt = frame - lastKick;
  const pulse = interpolate(kt, [0, 10], [1, 0], clamp);
  const pulseCol = kicks.length % 2 ? C.magenta : C.teal;
  const fill = interpolate(t, [4, 50], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const full = fill >= 1;
  const blink = full && Math.floor(frame / 4) % 2 === 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55}}>
        <KanjiFlicker />
      </AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        <SpeedLines count={90} inner={420} opacity={0.15 + pulse * 0.35} seed="md" />
      </AbsoluteFill>
      <AbsoluteFill style={{background: pulseCol, mixBlendMode: 'screen', opacity: pulse * 0.28}} />
      {/* big 熱 slam on the drop */}
      {t < 40 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              fontFamily: F.brush,
              fontSize: 760,
              lineHeight: 1,
              color: C.magenta,
              opacity: interpolate(t, [0, 2, 26, 40], [0, 0.9, 0.9, 0], clamp),
              transform: `scale(${slam(t, 2.2, 6)}) rotate(-5deg)`,
              textShadow: `20px 20px 0 #000, 0 0 80px ${C.magenta}`,
              WebkitTextStroke: `6px ${C.white}`,
            }}
          >
            {MONTAGE.heat.big}
          </div>
        </AbsoluteFill>
      ) : null}
      {/* HEAT gauge, top-left (the game's scoreboard is top-centre, FLOW bar bottom-centre) */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 60,
          width: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transform: 'skewX(-14deg)',
          opacity: interpolate(t, [0, 6], [0, 1], clamp),
        }}
      >
        <div
          style={{
            fontFamily: F.anton,
            fontSize: 54,
            color: C.white,
            textShadow: `0 0 ${blink ? 30 : 10}px ${C.magenta}, 0 0 ${blink ? 30 : 10}px ${C.teal}`,
          }}
        >
          HEAT
        </div>
        <div style={{flex: 1, height: 30, border: '4px solid #fff', background: 'rgba(0,0,0,0.6)', padding: 3}}>
          <div
            style={{
              width: `${fill * 100}%`,
              height: '100%',
              background: blink ? '#fff' : `linear-gradient(90deg, ${C.teal}, ${C.magenta})`,
              boxShadow: `0 0 20px ${C.magenta}`,
            }}
          />
        </div>
        <div style={{fontFamily: F.anton, fontSize: 48, width: 100, color: '#fff', opacity: full ? (blink ? 1 : 0.4) : 0}}>
          MAX
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Letterboxed flyover with drifting vertical text. */
export const Legend: React.FC = () => {
  const frame = useCurrentFrame();
  const a = f(M.legend);
  const b = f(M.logo);
  if (frame < a || frame >= b) return null;
  const t = frame - a;
  const bar = interpolate(t, [0, 14], [0, 130], {...clamp, easing: Easing.out(Easing.cubic)});
  const chars = Array.from(MONTAGE.legendJP);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: bar,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: F.bebas,
            fontSize: 46,
            letterSpacing: interpolate(t, [20, 120], [30, 16], clamp),
            color: C.silver,
            opacity: interpolate(t, [24, 44], [0, 1], clamp),
          }}
        >
          {MONTAGE.legendEN}
        </div>
      </div>
      <div style={{position: 'absolute', right: 180, top: 190 - t * 0.25}}>
        {chars.map((ch, i) => {
          const ct = t - 14 - i * 6;
          return (
            <div
              key={i}
              style={{
                fontFamily: F.serifJP,
                fontWeight: 900,
                fontSize: 80,
                lineHeight: 1.15,
                writingMode: 'vertical-rl',
                color: C.white,
                opacity: interpolate(ct, [0, 12], [0, 1], clamp),
                filter: `blur(${interpolate(ct, [0, 12], [8, 0], clamp)}px)`,
                textShadow: `0 0 24px ${i % 2 ? C.magenta : C.teal}, 3px 3px 0 #000`,
              }}
            >
              {ch}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
