"""Synthesize the intro's sound effects into public/sfx/*.wav (no samples needed).

Usage: python3 scripts/make_sfx.py
"""

from pathlib import Path
import wave

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1960)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, attack=0.002, decay=0.3, dur=None):
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-5), 0, 1)
    return a * np.exp(-x / decay)


def lowpass(x, cutoff):
    # One-pole low-pass; cutoff may be an array (sweeps).
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def sweep(f0, f1, dur, curve=3.0):
    x = t(dur)
    f = f1 + (f0 - f1) * np.exp(-x * curve / dur * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(dur):
    return rng.uniform(-1, 1, int(SR * dur))


def reverb(x, size=0.35, mix=0.3):
    out = x.copy()
    for d, g in ((0.029, 0.5), (0.037, 0.45), (0.053, 0.4), (0.071, 0.35), (0.11, 0.25)):
        n = int(d * SR / size * 0.35)
        tail = np.zeros(len(x) + n * 8)
        tail[: len(x)] = x
        for k in range(1, 8):
            tail[n * k : n * k + len(x)] += x * (g ** k)
        out = np.pad(out, (0, len(tail) - len(out)))
        out += tail * mix / 3
    return out


def save(name, x, gain=0.9):
    x = np.asarray(x, np.float64)
    x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.4) * gain
    fade = min(len(x), int(0.01 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"{name}.wav  {len(x) / SR:.2f}s")


def boom(dur=2.2, f0=90, f1=32, body=0.9):
    x = t(dur)
    sub = sweep(f0, f1, dur, 2.0) * env(len(x), 0.004, body)
    thump = lowpass(noise(dur), 300) * env(len(x), 0.001, 0.06) * 3
    return sub + thump


# 1. Cold-open low impact: deep sub hit with a long tail.
save("boom", reverb(boom(2.6, 80, 28, 1.1), mix=0.25))

# 2. Glass/crest shatter: bright noise crackle + inharmonic ringing.
d = 1.4
x = t(d)
crack = highpass(noise(d), 2500) * env(len(x), 0.0005, 0.12)
grains = np.zeros(len(x))
for _ in range(60):
    s = int(rng.uniform(0, 0.5) * SR)
    n = int(rng.uniform(0.004, 0.02) * SR)
    grains[s : s + n] += highpass(rng.uniform(-1, 1, n), 4000) * rng.uniform(0.2, 1)
ring = sum(np.sin(2 * np.pi * f * x) * env(len(x), 0.0005, rng.uniform(0.1, 0.4))
           for f in (2370, 3120, 4410, 5230, 6870))
save("shatter", reverb(crack + grains * 0.6 + ring * 0.25 + boom(d, 120, 40, 0.15) * 0.6, mix=0.35), 0.8)

# 3. Glitch slash: fast noise sweep, bit-crushed, with digital stutter.
d = 0.55
x = t(d)
sw = lowpass(noise(d), np.linspace(9000, 600, len(x))) * env(len(x), 0.001, 0.18)
crushed = np.round(sw * 6) / 6
stutter = (np.sin(2 * np.pi * 38 * x) > 0) * 1.0
zap = sweep(3000, 200, d, 4) * env(len(x), 0.001, 0.08)
save("slash", crushed * (0.6 + 0.4 * stutter) + zap * 0.5, 0.75)

# 4. Whoosh (plates sliding in): swelling band-passed noise.
d = 0.45
x = t(d)
sw_env = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2 * np.linspace(0.3, 1, len(x))
wh = highpass(lowpass(noise(d), np.linspace(800, 5000, len(x))), 200) * sw_env
save("whoosh", wh, 0.6)

# 5. Big clash slam: sub boom + crack + metallic clang.
d = 2.0
x = t(d)
clang = sum(np.sin(2 * np.pi * f * x) * env(len(x), 0.0005, 0.35) for f in (310, 467, 731, 1093))
crack = highpass(noise(d), 1500) * env(len(x), 0.0003, 0.05) * 2
save("slam", reverb(boom(d, 110, 35, 0.6) * 1.4 + crack + clang * 0.25, mix=0.3))

# 6. Name hit: punchy, shorter impact (taiko-ish).
d = 1.2
x = t(d)
taiko = sweep(160, 60, d, 3) * env(len(x), 0.001, 0.22)
skin = lowpass(noise(d), 1800) * env(len(x), 0.0005, 0.03) * 2
save("hit", reverb(taiko * 1.3 + skin + boom(d, 70, 35, 0.4) * 0.8, mix=0.22))

# 7. Freeze-frame "ka-chunk" (camera shutter / film stop).
d = 0.35
x = t(d)
click = highpass(noise(d), 3000) * env(len(x), 0.0002, 0.008)
click2 = np.roll(click, int(0.07 * SR)) * 0.7
thud = sweep(220, 90, d, 4) * env(len(x), 0.001, 0.05)
save("freeze", click * 1.5 + click2 + thud * 0.6, 0.7)

# 8. Heat-mode ignition: rising roar + flame rumble (3s).
d = 3.0
x = t(d)
rise = np.clip(x / 0.6, 0, 1)
roar = lowpass(noise(d), 700 + 900 * rise) * (0.4 + 0.6 * rise)
rumble = np.sin(2 * np.pi * 45 * x + 2 * np.sin(2 * np.pi * 3 * x)) * 0.5
drums = np.zeros(len(x))
for k in range(12):
    s = int((0.25 * k) * SR)
    hit = boom(0.4, 140, 50, 0.12)
    drums[s : s + len(hit)] += hit[: len(drums) - s] * (1.0 if k % 2 == 0 else 0.6)
fade = np.clip((d - x) / 0.5, 0, 1)
save("heat", (roar * 0.9 + rumble * 0.6 + drums * 1.1) * fade, 0.85)

# 9. Neon buzz: 120 Hz mains hum with harmonics + crackle, ~1.6s.
d = 1.6
x = t(d)
hum = sum(np.sign(np.sin(2 * np.pi * 120 * h * x)) / h for h in (1, 2, 3, 5)) * 0.25
flick = (rng.uniform(0, 1, int(d * 30)) > 0.25).repeat(int(SR / 30) + 1)[: len(x)]
crackle = highpass(noise(d), 5000) * (rng.uniform(0, 1, len(x)) > 0.995) * 3
save("buzz", lowpass(hum, 4000) * (0.4 + 0.6 * flick) + crackle, 0.5)

# 10. Neon "tink" for each letter turning on.
d = 0.18
x = t(d)
save("tink", (np.sin(2 * np.pi * 1800 * x) + 0.5 * highpass(noise(d), 6000)) * env(len(x), 0.0005, 0.03), 0.5)

# 11. Cartoon boing for the cats' bounce.
d = 0.5
x = t(d)
f = 300 + 180 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 6) + 200 * x
b = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.003, 0.18)
save("boing", b, 0.6)

# 12. Blink "pip".
d = 0.12
x = t(d)
save("pip", np.sin(2 * np.pi * (1400 + 2400 * x) * x) * env(len(x), 0.001, 0.035), 0.45)

# 13. Low drone bed under the cold open + clash.
d = 4.0
x = t(d)
drone = (np.sin(2 * np.pi * 55 * x) + 0.5 * np.sin(2 * np.pi * 82.4 * x)
         + 0.3 * lowpass(noise(d), 200)) * np.clip(x / 0.8, 0, 1) * np.clip((d - x) / 1.0, 0, 1)
save("drone", drone, 0.4)
