"""V2 timeline: Fire Fire (Shimza remix) bar-aligned DJ edit at 125 BPM, cold open on drop 2,
personas on drop 1 (one per beat-locked slot), memories + 'sem pressa' on breakdown 2,
brand on drop 2, offer build on breakdown 1 into drop 1 exactly on '30%'."""
import json

S = "/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/"
vo2 = json.load(open(S + "vo2.json"))
BEAT = 0.48
BAR = 1.92
T0 = 1.496  # first downbeat in the source track
tb = lambda b: round(T0 + b * BAR, 4)  # source time of track bar b

# music edit: (track_bar_from, n_bars, ad_bar_start)
EDIT = [
    (60, 2, 0),    # cold open: drop 2
    (0, 2, 2),     # hook: intro groove
    (18, 2, 4),    # question: breakdown end + build
    (20, 6, 6),    # personas: DROP 1
    (26, 1, 12),   # 'ou simplesmente…': dip
    (44, 1, 13),   # 'sem pressa': breakdown 2
    (59, 1, 14),   # pre-drop build
    (60, 5, 15),   # brand + homes: DROP 2
    (17, 3, 20),   # offer setup: breakdown 1 → build
    (20, 4, 23),   # '30%' on DROP 1 → CTA → end
]
segments = [[tb(a), tb(a + n), round(s * BAR, 4)] for a, n, s in EDIT]
stop = 27 * BAR  # 51.84 — final downbeat, music cuts with a tail

# narration starts (beat-locked where it matters)
start = {
    "L01": 3.95,
    "L02": 7.02,
    "L03": 11.56,
    "L04": 13.96,
    "L05": 16.36,
    "L06": 18.28,
    "L07": 20.20,
    "L08": 21.64,
    "E01": 25.06,
    "L09": 29.22,
    "L10": 34.62,
    "L11": 39.40,
    "L12": None,  # placed so that '30%' lands on the drop at 44.16
    "L13": 46.22,
    "L14": 48.22,
}
drop3 = 23 * BAR  # 44.16
w12 = vo2["L12"]["words"]
p30 = [w for w in w12 if w[0].startswith("30")][0][1]
start["L12"] = round(drop3 - p30, 3)

order = ["L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "E01", "L09", "L10", "L11", "L12", "L13", "L14"]
vo = []
words = {}
prev_end = 0
for k in order:
    d = vo2[k]
    s = start[k]
    assert s >= prev_end - 1e-6, (k, s, prev_end)
    prev_end = s + d["dur"]
    vo.append(dict(id=k, file=d["file"], start=s, dur=d["dur"], text=d["text"]))
    words[k] = d["words"]

scenes = dict(
    cold=[0.0, 3.84],
    hook=[3.84, 7.0],
    question=[7.0, 11.52],
    personas=[11.52, 21.5],
    memories=[21.5, 28.8],
    brand=[28.8, 34.5],
    homes=[34.5, 38.6],
    offer=[38.6, 46.1],
    cta=[46.1, 48.15],
    end=[48.15, 54.0],
)
music = dict(
    file="m3_firefire_shimza",
    bpm=125.0,
    beat=BEAT,
    bar=BAR,
    segments=segments,
    stop=stop,
    drops=[0.0, 6 * BAR, 15 * BAR, drop3],
    tapeStop=[3.36, 3.84],
)
tl = dict(fps=60, duration=54.0, vo=vo, words=words, scenes=scenes, music=music, sfx=[])
json.dump(tl, open("/home/user/Teste/src/longstay/data/timeline.json", "w"), indent=1, ensure_ascii=False)
for v in vo:
    print(f"{v['id']}  {v['start']:6.2f} – {v['start'] + v['dur']:6.2f}  {v['text']}")
print("segments", segments)
