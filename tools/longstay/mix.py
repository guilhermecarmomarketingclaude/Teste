"""Offline mix for the long-stay reel: bar-aligned music edit (instrumental stem), VO, SFX,
sidechain ducking, filter build-ups, loudness to -14 LUFS / -1 dBTP.
usage: python -I mix.py <timeline.json> <out.wav>
"""
import json, sys, os
import numpy as np, soundfile as sf
import scipy.signal as ss
import pyloudnorm as pyln

S = "/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/"
PUB = "/home/user/Teste/public/"
SR = 48000
tl = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
DUR = tl["duration"]
N = int(round(DUR * SR))


def db(x):
    return 10 ** (x / 20)


def load(path, sr=SR):
    x, r = sf.read(path, always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    if r != sr:
        g = np.gcd(int(r), sr)
        x = ss.resample_poly(x, sr // g, int(r) // g, axis=0)
    return x.astype(np.float64)


def ramp(n, a, b):
    return np.linspace(a, b, n)


def env_from_points(points, n=N):
    """piecewise-linear automation in dB: [(t, dB), ...] -> linear gain array"""
    ts = np.array([p[0] for p in points]) * SR
    vs = np.array([p[1] for p in points])
    idx = np.arange(n)
    return db(np.interp(idx, ts, vs))


# ------------------------------------------------------------------ music edit
mus_src = load(S + "music_sep/m2_firefire_innerbloom_accomp.wav")
music = np.zeros((N + SR * 4, 2))
XF = int(0.012 * SR)
for s0, s1, d0 in tl["music"]["segments"]:
    a = int(round(s0 * SR)) - XF
    b = int(round(s1 * SR)) + XF
    seg = mus_src[a:b].copy()
    w = np.ones(len(seg))
    w[: 2 * XF] = np.sin(np.linspace(0, np.pi / 2, 2 * XF)) ** 2
    w[-2 * XF :] = np.cos(np.linspace(0, np.pi / 2, 2 * XF)) ** 2
    seg *= w[:, None]
    o = int(round(d0 * SR)) - XF
    if o < 0:
        seg = seg[-o:]
        o = 0
    music[o : o + len(seg)] += seg
music = music[: N + SR * 4]

stop = tl["music"]["stop"]
# low-passed copy for build-ups (dry/wet crossfade reads as a filter sweep)
sos_lp = ss.butter(4, 520, "low", fs=SR, output="sos")
music_lp = ss.sosfiltfilt(sos_lp, music, axis=0)
wet = np.interp(
    np.arange(len(music)),
    np.array([0, 5.6, 7.3, 7.66, 7.68, 34.0, 36.5, 38.25, 38.39, 38.4, 999]) * SR,
    [0, 0, 0.75, 0.9, 0, 0, 0.35, 0.85, 0.9, 0, 0],
)
music = music * (1 - wet[:, None]) + music_lp * wet[:, None]

# tail: freeze the last beat into a reverb wash, then hard stop on the downbeat
ir_len = int(2.6 * SR)
rng = np.random.default_rng(7)
ir = rng.standard_normal((ir_len, 2)) * np.exp(-np.arange(ir_len) / (0.42 * SR))[:, None]
ir[:, 0] = ss.sosfilt(ss.butter(2, 5000, "low", fs=SR, output="sos"), ir[:, 0])
ir[:, 1] = ss.sosfilt(ss.butter(2, 5000, "low", fs=SR, output="sos"), ir[:, 1])
last = music[int((stop - 0.48) * SR) : int(stop * SR)].copy()
tail = np.stack([ss.fftconvolve(last[:, c], ir[:, c]) for c in range(2)], 1)
tail /= np.abs(tail).max() + 1e-9
tail *= np.abs(last).max() * 0.55
cut = int(stop * SR)
fade = int(0.035 * SR)
music[cut : cut + fade] *= np.linspace(1, 0, fade)[:, None]
music[cut + fade :] = 0
music[cut : cut + len(tail)] += tail[: len(music) - cut]
music = music[:N]

# base level automation (dB): quiet breakdown lifted, drops at full
base = env_from_points(
    [
        (0, -3.0), (0.05, 0.0), (5.6, 0.0), (7.68, 0.0),
        (21.0, 0.0), (21.2, 5.5), (24.0, 6.0), (24.9, 3.0), (24.96, 0.0),
        (32.6, 0.0), (36.0, 1.5), (38.38, 2.0), (38.4, 0.0),
        (46.0, 0.0), (48.0, 0.0),
    ]
)
music *= base[:, None]
music[: int(0.04 * SR)] *= np.linspace(0, 1, int(0.04 * SR))[:, None]

# ------------------------------------------------------------------ voice
vo = np.zeros((N, 2))
meter = pyln.Meter(SR)
for cue in tl["vo"]:
    x = load(PUB + cue["file"])
    x = ss.sosfilt(ss.butter(2, 75, "high", fs=SR, output="sos"), x, axis=0)
    L = meter.integrated_loudness(x)
    x *= db(-17.0 - L)
    o = int(round(cue["start"] * SR))
    n = min(len(x), N - o)
    vo[o : o + n] += x[:n]

# sidechain: duck the music under the voice
win = int(0.02 * SR)
lvl = np.sqrt(np.convolve((vo ** 2).mean(1), np.ones(win) / win, "same"))
att = np.exp(-1 / (0.025 * SR))
rel = np.exp(-1 / (0.32 * SR))
envv = np.zeros(N)
e = 0.0
thr = db(-42)
lead = int(0.06 * SR)
gate = np.r_[lvl[lead:], np.zeros(lead)] > thr  # look-ahead
for i in range(N):
    target = 1.0 if gate[i] else 0.0
    c = att if target > e else rel
    e = c * e + (1 - c) * target
    envv[i] = e
# two-band duck: keep the kick/bass pumping, clear the speech band harder
sos_lo = ss.butter(4, 220, "low", fs=SR, output="sos")
m_lo = ss.sosfiltfilt(sos_lo, music, axis=0)
m_hi = music - m_lo
music = m_lo * db(-6.0 * envv)[:, None] + m_hi * db(-14.0 * envv)[:, None]

# ------------------------------------------------------------------ sfx
SFX_DIR = S + "sfx_wav/"
_cache = {}


def sfx_clip(name):
    if name not in _cache:
        x = load(SFX_DIR + name + ".wav")
        x /= np.abs(x).max() + 1e-9
        x *= db(-1)
        m = np.abs(x).max(1)
        envs = np.convolve(m, np.ones(240) / 240, "same")
        _cache[name] = (x, envs.argmax() / SR)
    return _cache[name]


sfx = np.zeros((N, 2))
cues = tl["sfx"]
for c in cues:
    x, pk = sfx_clip(c["name"])
    align = pk if c.get("align", "peak") == "peak" else 0.0
    x = x * db(c["gain"])
    if c.get("lp"):
        x = ss.sosfilt(ss.butter(2, c["lp"], "low", fs=SR, output="sos"), x, axis=0)
    if c.get("pan"):
        p = c["pan"]
        x = x * np.array([np.sqrt(0.5 * (1 - p)) * np.sqrt(2), np.sqrt(0.5 * (1 + p)) * np.sqrt(2)])
    if c.get("dur"):
        n = int(c["dur"] * SR)
        x = x[:n].copy()
        f = min(int(0.25 * SR), n // 3)
        x[-f:] *= np.linspace(1, 0, f)[:, None]
    if c.get("fadein"):
        f = int(c["fadein"] * SR)
        x[:f] *= np.linspace(0, 1, f)[:, None]
    o = int(round((c["t"] - align) * SR))
    if c.get("from") is not None:
        k = int(round(c["from"] * SR)) - o
        if 0 < k < len(x):
            x = x.copy()
            x[:k] = 0
            f = min(int(0.3 * SR), len(x) - k)
            x[k : k + f] *= np.linspace(0, 1, f)[:, None]
    if o < 0:
        x = x[-o:]
        o = 0
    n = min(len(x), N - o)
    if n > 0:
        sfx[o : o + n] += x[:n]

# ------------------------------------------------------------------ master
mixed = vo + music * db(-7.0) + sfx * db(-4.0)
# gentle glue: soft-knee bus compression on the sum (RMS, slow)
L0 = meter.integrated_loudness(mixed)
mixed *= db(-14.0 - L0)


def true_peak_limit(x, ceiling_db=-1.0):
    up = ss.resample_poly(x, 4, 1, axis=0)
    pk = np.abs(up).max(1).reshape(-1, 4).max(1)[: len(x)]
    pk = np.r_[pk, np.zeros(len(x) - len(pk))]
    ceil = db(ceiling_db)
    need = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    la = int(0.002 * SR)
    need = np.minimum.accumulate(np.r_[need[la:], np.ones(la)][::-1])[::-1] if False else need
    # look-ahead min filter then smooth release
    from scipy.ndimage import minimum_filter1d

    g = minimum_filter1d(need, size=2 * la + 1)
    g = np.r_[g[la:], np.ones(la)]
    out = np.empty_like(g)
    r = np.exp(-1 / (0.08 * SR))
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else r * cur + (1 - r) * g[i]
        out[i] = cur
    return x * out[:, None]


for _ in range(3):
    mixed = true_peak_limit(mixed, -1.2)
    L1 = meter.integrated_loudness(mixed)
    mixed *= db(-14.0 - L1)
mixed = true_peak_limit(mixed, -1.1)
L2 = meter.integrated_loudness(mixed)
tp = 20 * np.log10(np.abs(ss.resample_poly(mixed, 4, 1, axis=0)).max())
os.makedirs(os.path.dirname(OUT), exist_ok=True)
sf.write(OUT, mixed.astype(np.float32), SR, subtype="PCM_24")
print(f"LUFS {L2:.2f}  TP {tp:.2f} dBTP  dur {len(mixed)/SR:.2f}s  cues {len(cues)}")
# stems for review
sf.write(S + "mix_vo.wav", (vo * db(-3)).astype(np.float32), SR)
sf.write(S + "mix_music.wav", (music * db(-7)).astype(np.float32), SR)
sf.write(S + "mix_sfx.wav", (sfx * db(-4)).astype(np.float32), SR)
