"""V3 takes: speaker similarity to the previous reel + V2 narration, speech/gap layout,
Whisper transcript (pt, and en for the sign-off), loudness."""
import sys, json, glob, os, subprocess, numpy as np, soundfile as sf, sherpa_onnx
sys.path.insert(0, os.path.dirname(__file__))
from spkutil import load, vad_segments, extractor, emb
SP = "/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad"
R = f"{SP}/vo3/raw"
ex = extractor(f"{SP}/models/titanet.onnx")
prev = load(f"{SP}/prev_reel/audio16k.wav")
eprev = emb(ex, np.concatenate([x for _, _, x in vad_segments(prev)]))
# V2 narration reference (all lines concatenated)
v2 = []
for f in sorted(glob.glob("/home/user/Teste/public/longstay/narration2/*.wav")):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-ar", "16000", "-ac", "1", f"{SP}/vo3/_tmp.wav"], check=True)
    v2.append(load(f"{SP}/vo3/_tmp.wav"))
ev2 = emb(ex, np.concatenate(v2))
W = f"{SP}/models/sherpa-onnx-whisper-base"
def rec(lang):
    return sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{W}/base-encoder.onnx", decoder=f"{W}/base-decoder.onnx", tokens=f"{W}/base-tokens.txt", language=lang, task="transcribe", num_threads=4)
rpt, ren = rec("pt"), rec("en")
def asr(r, a):
    s = r.create_stream(); s.accept_waveform(16000, a); r.decode_stream(s); return s.result.text.strip()
out = []
for f in sorted(glob.glob(f"{R}/*.mp3")):
    n = os.path.basename(f)[:-4]
    w16 = f"{R}/{n}.16k.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-ar", "16000", "-ac", "1", w16], check=True)
    a = load(w16)
    segs = vad_segments(a, min_sil=0.08)
    gaps = [round(segs[i + 1][0] - (segs[i][0] + segs[i][1]), 2) for i in range(len(segs) - 1)]
    sp = np.concatenate([x for _, _, x in segs])
    e = emb(ex, sp)
    rms = 20 * np.log10(np.sqrt(np.mean(sp ** 2)) + 1e-9)
    t_pt = asr(rpt, a)
    t_en = asr(ren, a) if n.startswith("sign") else ""
    out.append(dict(n=n, dur=round(len(a) / 16000, 2), sim_prev=round(float(e @ eprev), 3), sim_v2=round(float(e @ ev2), 3), rms=round(rms, 1),
                    segs=[(round(s, 2), round(d, 2)) for s, d, _ in segs], gaps=gaps, pt=t_pt, en=t_en))
    o = out[-1]
    print(f"{n:7s} dur={o['dur']:.2f} simPrev={o['sim_prev']:.3f} simV2={o['sim_v2']:.3f} rms={o['rms']}  segs={o['segs']} gaps={gaps}\n        pt: {t_pt}" + (f"\n        en: {t_en}" if t_en else ""))
json.dump(out, open(f"{SP}/vo3/takes_score.json", "w"), indent=1, ensure_ascii=False)
