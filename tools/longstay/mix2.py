"""V2 mix: Fire Fire (Shimza remix) DJ edit with real drops, stem-aware ducking (the song's
vocal ducks hard under the narration, the instrumental stays big), tape stop, high-pass
'suck' sweeps into each drop, trigger SFX, final hit + tail. Master -14 LUFS / -1 dBTP.
usage: python -I mix2.py <timeline.json> <out.wav>
"""
import json, sys, os
import numpy as np, soundfile as sf
import scipy.signal as ss
import pyloudnorm as pyln
from scipy.ndimage import minimum_filter1d

S = "/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/"
PUB = "/home/user/Teste/public/"
SR = 48000
tl = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
DUR = tl["duration"]
N = int(round(DUR * SR))
M = tl["music"]


def db(x):
    return 10 ** (np.asarray(x) / 20)


def load(path, sr=SR):
    x, r = sf.read(path, always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    if r != sr:
        g = np.gcd(int(r), sr)
        x = ss.resample_poly(x, sr // g, int(r) // g, axis=0)
    return x.astype(np.float64)


def automation(points, n=N):
    ts = np.array([p[0] for p in points]) * SR
    vs = np.array([p[1] for p in points], dtype=float)
    return np.interp(np.arange(n), ts, vs)


# ------------------------------------------------------------------ music edit (per stem)
name = M["file"]
full = load(S + f"music_sep/{name}.wav")
voc = load(S + f"music_sep/{name}_vocals.wav")
n_ = min(len(full), len(voc))
full, voc = full[:n_], voc[:n_]
acc = full - voc  # instrumental = mix minus the separated vocal (keeps the mix's own balance)

XF = int(0.02 * SR)
PRE = int(0.008 * SR)


def edit(src):
    out = np.zeros((N + SR * 4, 2))
    for s0, s1, d0 in M["segments"]:
        a = int(round(s0 * SR)) - PRE - XF // 2
        b = int(round(s1 * SR)) - PRE + XF // 2
        seg = src[max(0, a):b].copy()
        w = np.ones(len(seg))
        w[:XF] = np.sin(np.linspace(0, np.pi / 2, XF)) ** 2
        w[-XF:] = np.cos(np.linspace(0, np.pi / 2, XF)) ** 2
        seg *= w[:, None]
        o = int(round(d0 * SR)) - XF // 2
        if o < 0:
            seg = seg[-o:]
            o = 0
        out[o : o + len(seg)] += seg[: len(out) - o]
    return out


m_acc = edit(acc)
m_voc = edit(voc)


def tape_stop(x, t_a, t_b):
    a = int(t_a * SR)
    b = int(t_b * SR)
    n = b - a
    tt = np.arange(n) / n
    rate = (1 - tt) ** 1.6
    pos = a + np.cumsum(rate)
    for c in range(2):
        x[a:b, c] = np.interp(pos, np.arange(len(x)), x[:, c])
    f = int(0.03 * SR)
    x[b - f : b] *= np.linspace(1, 0, f)[:, None]
    return x


ta, tb_ = M["tapeStop"]
m_acc = tape_stop(m_acc, ta, tb_)
m_voc = tape_stop(m_voc, ta, tb_)


def sweep_hp(x, t_a, t_b, f0=30, f1=900):
    """time-varying high-pass (RBJ biquad, block-wise) — the 'suck' into a drop"""
    a = int(t_a * SR)
    b = int(t_b * SR)
    blk = 128
    zi = np.zeros((2, 2))
    y = x.copy()
    first = True
    for i in range(a, b, blk):
        p = (i - a) / max(1, b - a)
        fc = f0 * (f1 / f0) ** (p ** 1.5)
        w0 = 2 * np.pi * fc / SR
        al = np.sin(w0) / (2 * 0.9)
        cs = np.cos(w0)
        bb = np.array([(1 + cs) / 2, -(1 + cs), (1 + cs) / 2]) / (1 + al)
        aa = np.array([1, -2 * cs / (1 + al), (1 - al) / (1 + al)])
        for c in range(2):
            z0 = ss.lfilter_zi(bb, aa) * x[i, c] if first else zi[c]
            y[i : i + blk, c], zi[c] = ss.lfilter(bb, aa, x[i : i + blk, c], zi=z0)
        first = False
    return y


for d in M["drops"][1:]:
    m_acc = sweep_hp(m_acc, d - 0.48, d)
    m_voc = sweep_hp(m_voc, d - 0.48, d)

stop = M["stop"]
# final downbeat: freeze the last beat into a wash, hard cut
ir_len = int(2.4 * SR)
rng = np.random.default_rng(7)
ir = rng.standard_normal((ir_len, 2)) * np.exp(-np.arange(ir_len) / (0.45 * SR))[:, None]
for c in range(2):
    ir[:, c] = ss.sosfilt(ss.butter(2, 6000, "low", fs=SR, output="sos"), ir[:, c])
music = m_acc + m_voc
last = music[int((stop - 0.48) * SR) : int(stop * SR)].copy()
tail = np.stack([ss.fftconvolve(last[:, c], ir[:, c]) for c in range(2)], 1)
tail = tail / (np.abs(tail).max() + 1e-9) * np.abs(last).max() * 0.5
cut = int(stop * SR)
f = int(0.02 * SR)
for arr in (m_acc, m_voc):
    arr[cut : cut + f] *= np.linspace(1, 0, f)[:, None]
    arr[cut + f :] = 0
m_acc[cut : cut + len(tail)] += tail[: len(m_acc) - cut]
m_acc = m_acc[:N]
m_voc = m_voc[:N]

# section levels (dB)
base = automation(
    [
        (0, 0.0), (3.84, 0.0), (3.86, -1.5), (7.68, -1.5), (7.7, 0.5), (11.5, 1.5), (11.52, 0.0),
        (23.0, 0.0), (24.9, 0.0), (24.96, 3.0), (26.88, 3.0), (26.9, 1.0), (28.78, 2.0), (28.8, 0.0),
        (38.38, 0.0), (38.4, 1.5), (44.14, 2.0), (44.16, 0.0), (DUR, 0.0),
    ]
)
# extra clearance under the brand name and the 30% so they read through the drops
focus = np.zeros(N)
for v in tl["vo"]:
    if v["id"] in ("L09", "L14", "L12"):
        for wd, wa, wb in tl["words"][v["id"]]:
            if wd.startswith(("HD", "Properties", "30")):
                a0 = int((v["start"] + wa - 0.08) * SR)
                b0 = int((v["start"] + wb + 0.1) * SR)
                focus[a0:b0] = 1.0
focus = np.convolve(focus, np.ones(int(0.06 * SR)) / int(0.06 * SR), "same")
base = base - 3.5 * focus
m_acc *= db(base)[:, None]
m_voc *= db(base)[:, None]

# ------------------------------------------------------------------ narration
meter = pyln.Meter(SR)
vo = np.zeros((N, 2))
for cue in tl["vo"]:
    x = load(PUB + cue["file"])
    x = ss.sosfilt(ss.butter(2, 80, "high", fs=SR, output="sos"), x, axis=0)
    # gentle presence lift so the voice sits on top of a louder track
    pres = ss.sosfilt(ss.butter(2, [2500, 6000], "band", fs=SR, output="sos"), x, axis=0)
    x = x + pres * 0.35
    L = meter.integrated_loudness(x)
    x *= db(-16.0 - L)
    o = int(round(cue["start"] * SR))
    n = min(len(x), N - o)
    vo[o : o + n] += x[:n]

win = int(0.02 * SR)
lvl = np.sqrt(np.convolve((vo ** 2).mean(1), np.ones(win) / win, "same"))
gate = np.r_[lvl[int(0.06 * SR):], np.zeros(int(0.06 * SR))] > db(-42)
att = np.exp(-1 / (0.03 * SR))
rel = np.exp(-1 / (0.28 * SR))
env = np.zeros(N)
e = 0.0
for i in range(N):
    tgt = 1.0 if gate[i] else 0.0
    c = att if tgt > e else rel
    e = c * e + (1 - c) * tgt
    env[i] = e

sos_lo = ss.butter(4, 200, "low", fs=SR, output="sos")
a_lo = ss.sosfiltfilt(sos_lo, m_acc, axis=0)
a_hi = m_acc - a_lo
m_acc = a_lo * db(-2.5 * env)[:, None] + a_hi * db(-7.0 * env)[:, None]
m_voc = m_voc * db(-16.0 * env)[:, None]
music = m_acc + m_voc

# ------------------------------------------------------------------ sfx
_cache = {}


def clip(nm):
    if nm not in _cache:
        x = load(S + "sfx_wav/" + nm + ".wav")
        x /= np.abs(x).max() + 1e-9
        x *= db(-1)
        m = np.abs(x).max(1)
        envs = np.convolve(m, np.ones(240) / 240, "same")
        on = int(np.argmax(envs > envs.max() * 0.1))
        _cache[nm] = (x, envs.argmax() / SR, on / SR)
    return _cache[nm]


sfx = np.zeros((N, 2))
for c in tl["sfx"]:
    x, pk, on = clip(c["name"])
    x = x.copy()
    if c.get("src"):  # slice of the clip [a, b] seconds
        a, b = c["src"]
        x = x[int(a * SR) : int(b * SR)]
        pk, on = max(0.0, pk - a), max(0.0, on - a)
    al = c.get("align", "peak")
    off = pk if al == "peak" else on if al == "onset" else float(al)
    x *= db(c["gain"])
    if c.get("lp"):
        x = ss.sosfilt(ss.butter(2, c["lp"], "low", fs=SR, output="sos"), x, axis=0)
    if c.get("hp"):
        x = ss.sosfilt(ss.butter(2, c["hp"], "high", fs=SR, output="sos"), x, axis=0)
    if c.get("pan") is not None:
        p = c["pan"]
        x = x * np.array([np.sqrt(1 - p), np.sqrt(1 + p)])
    if c.get("dur"):
        n = int(c["dur"] * SR)
        x = x[:n]
        fl = min(int(0.2 * SR), max(1, n // 3))
        x[-fl:] *= np.linspace(1, 0, fl)[:, None]
    if c.get("fadein"):
        fl = int(c["fadein"] * SR)
        x[:fl] *= np.linspace(0, 1, fl)[:, None]
    o = int(round((c["t"] - off) * SR))
    if o < 0:
        x = x[-o:]
        o = 0
    n = min(len(x), N - o)
    if n > 0:
        sfx[o : o + n] += x[:n]

# ------------------------------------------------------------------ master
mixed = vo + music * db(-2.5) + sfx * db(-4.0)
L0 = meter.integrated_loudness(mixed)
mixed *= db(-14.0 - L0)


def tp_limit(x, ceiling_db=-1.2):
    up = ss.resample_poly(x, 4, 1, axis=0)
    pk = np.abs(up).max(1).reshape(-1, 4).max(1)[: len(x)]
    pk = np.r_[pk, np.zeros(len(x) - len(pk))]
    need = np.minimum(1.0, db(ceiling_db) / np.maximum(pk, 1e-9))
    la = int(0.002 * SR)
    g = minimum_filter1d(need, size=2 * la + 1)
    g = np.r_[g[la:], np.ones(la)]
    out = np.empty_like(g)
    r = np.exp(-1 / (0.08 * SR))
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else r * cur + (1 - r) * g[i]
        out[i] = cur
    return x * out[:, None], out


grs = []
for _ in range(3):
    mixed, gr = tp_limit(mixed, -1.2)
    grs.append(gr)
    mixed *= db(-14.0 - meter.integrated_loudness(mixed))
mixed, gr = tp_limit(mixed, -1.1)
L2 = meter.integrated_loudness(mixed)
tp = 20 * np.log10(np.abs(ss.resample_poly(mixed, 4, 1, axis=0)).max())
os.makedirs(os.path.dirname(OUT), exist_ok=True)
sf.write(OUT, mixed.astype(np.float32), SR, subtype="PCM_24")
grmin = 20 * np.log10(min(g.min() for g in grs))
print(f"LUFS {L2:.2f}  TP {tp:.2f} dBTP  max limiter GR {grmin:.1f} dB  dur {len(mixed)/SR:.2f}s  sfx cues {len(tl['sfx'])}")
sf.write(S + "mix2_vo.wav", vo.astype(np.float32), SR)
sf.write(S + "mix2_music.wav", (music * db(-2.5)).astype(np.float32), SR)
sf.write(S + "mix2_sfx.wav", (sfx * db(-4.0)).astype(np.float32), SR)
