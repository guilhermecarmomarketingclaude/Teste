"""V3 narration: new takes (hook H01, typologies T01, sign-off S01, CTA C01) trimmed and sped up
8% like V2; the drawn-out final 's' of 'Properties' is shortened (L09 and S01) so the next word
follows naturally. Writes public/longstay/narration3/*.wav and vo3.json (word times per file)."""
import json, subprocess, shutil, numpy as np, soundfile as sf
S = '/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/'
PUB = '/home/user/Teste/public/longstay/'
SPEED = 1.08
SR = 48000
tl = json.load(open('/home/user/Teste/src/longstay/data/timeline.json'))
import os
os.makedirs(PUB + 'narration3', exist_ok=True)


def excise(x, a, b, xf=0.012):
    """remove [a, b) seconds with an equal-power crossfade inside a noise-like sibilant"""
    n = int(xf * SR)
    ia, ib = int(a * SR), int(b * SR)
    fo = np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    fi = np.sin(np.linspace(0, np.pi / 2, n)) ** 2
    mid = x[ia:ia + n] * fo + x[ib:ib + n] * fi
    return np.concatenate([x[:ia], mid, x[ib + n:]])


def fades(x):
    f = int(0.006 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x


out = {}
# ---- V2 lines (already sped up); L09 gets its sibilant shortened
for v in tl['vo']:
    k = v['id']
    if k in ('L13', 'L14'):
        continue
    x, sr = sf.read(PUB + v['file'].replace('longstay/', ''))
    assert sr == SR
    ws = [list(w) for w in tl['words'][k]]
    if k == 'L09':
        a, b = 1.06, 1.15  # inside the /s/ of "Properties," (1.02–1.21)
        x = excise(x, a, b)
        cut = b - a
        ws = [[w, s if s < a else round(s - cut, 3), e if e < a else round(max(a, e - cut), 3)] for w, s, e in ws]
    x = fades(x)
    sf.write(PUB + f'narration3/{k}.wav', x, SR, subtype='PCM_16')
    out[k] = dict(file=f'longstay/narration3/{k}.wav', dur=round(len(x) / SR, 3), words=ws, text=' '.join(w for w, _, _ in ws))

# ---- new takes (raw ElevenLabs output, Scribe word times before speed-up)
NEW = {
    'H01': ('hook_3', [['Pare.', 0.10, 0.36], ['Não', 0.88, 1.12], ['reserve', 1.16, 1.54], ['o', 1.56, 1.62], ['Algarve', 1.66, 2.02], ['à', 2.06, 2.08], ['semana.', 2.18, 2.54]], None),
    'T01': ('typ_1', [['Do', 0.10, 0.16], ['estúdio', 0.22, 0.62], ['à', 0.68, 0.74], ['moradia', 0.76, 1.12], ['com', 1.20, 1.30], ['piscina,', 1.36, 1.78], ['há', 2.04, 2.14], ['uma', 2.18, 2.42], ['casa', 2.46, 2.76], ['para', 2.88, 3.00], ['cada', 3.14, 3.30], ['orçamento.', 3.34, 3.92]], None),
    'S01': ('sign_3', [['HD', 0.16, 0.48], ['Properties.', 0.58, 1.24]], (1.17, 1.25)),
    'C01': ('cta_3', [['Reserve', 0.08, 0.48], ['já', 0.58, 0.72], ['a', 0.78, 0.82], ['sua', 0.90, 1.04], ['estadia,', 1.06, 1.60], ['ou', 1.94, 2.08], ['fale', 2.26, 2.46], ['connosco.', 2.50, 2.96]], None),
}
for k, (take, ws, cut) in NEW.items():
    raw = S + f'vo3/{take}.raw48.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', S + f'vo3/raw/{take}.mp3', '-ar', str(SR), '-ac', '1', raw], check=True)
    x, _ = sf.read(raw)
    if cut:
        a, b = cut
        x = excise(x, a, b)
        ws = [[w, s if s < a else s - (b - a), e if e < a else max(a, e - (b - a))] for w, s, e in ws]
    lead = max(0.0, ws[0][1] - 0.05)
    end = min(len(x) / SR, ws[-1][2] + 0.2)
    x = x[int(lead * SR):int(end * SR)]
    ws = [[w, s - lead, e - lead] for w, s, e in ws]
    tmp = S + f'vo3/{k}_trim.wav'
    sf.write(tmp, x, SR, subtype='PCM_24')
    dst = PUB + f'narration3/{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-filter:a', f'atempo={SPEED}', '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', dst], check=True)
    y, _ = sf.read(dst)
    y = fades(y)
    sf.write(dst, y, SR, subtype='PCM_16')
    ws = [[w, round(s / SPEED, 3), round(e / SPEED, 3)] for w, s, e in ws]
    out[k] = dict(file=f'longstay/narration3/{k}.wav', dur=round(len(y) / SR, 3), words=ws, text=' '.join(w for w, _, _ in ws))
for k, v in out.items():
    print(f"{k} {v['dur']:.2f}s  {v['text']}   last={v['words'][-1]}")
json.dump(out, open(S + 'vo3.json', 'w'), indent=1, ensure_ascii=False)
