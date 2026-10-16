"""V3 timeline: new hook (0–3.84) before the V2 story, typologies line inserted after the brand
(+2 bars of drop 2), sign-off + new CTA at the end. Same 125 BPM bar grid; '30%' lands on the
last drop. The no-hook cut starts at 3.84 (bar 2)."""
import json

S = "/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/"
vo3 = json.load(open(S + "vo3.json"))
BEAT, BAR, T0 = 0.48, 1.92, 1.496
tb = lambda b: round(T0 + b * BAR, 4)
EDIT = [
    (44, 2, 0),   # hook: breakdown pad (enters after the 'Pare.' impact)
    (0, 2, 2),    # L01: intro groove
    (18, 2, 4),   # question: breakdown end + build
    (20, 6, 6),   # personas: DROP 1
    (26, 1, 12),  # 'ou simplesmente…'
    (44, 1, 13),  # 'sem pressa'
    (59, 1, 14),  # build
    (60, 7, 15),  # brand + typologies + homes: DROP 2
    (17, 3, 22),  # offer setup
    (20, 4, 25),  # '30%' on the drop -> sign-off -> CTA
]
segments = [[tb(a), tb(a + n), round(s * BAR, 4)] for a, n, s in EDIT]
SHIFT = 2 * BAR
start = {
    "H01": 0.06,
    "L01": 3.95, "L02": 7.02, "L03": 11.56, "L04": 13.96, "L05": 16.36, "L06": 18.28, "L07": 20.20,
    "L08": 21.64, "E01": 25.06, "L09": 29.22,
    "T01": 34.08,
    "L10": round(34.62 + SHIFT, 3), "L11": round(39.40 + SHIFT, 3),
}
drop3 = 25 * BAR  # 48.0
p30 = [w for w in vo3["L12"]["words"] if w[0].startswith("30")][0][1]
start["L12"] = round(drop3 - p30, 3)
start["S01"] = 49.98
props_end = start["S01"] + vo3["S01"]["words"][-1][2]
start["C01"] = round(props_end + 0.2 - vo3["C01"]["words"][0][1], 3)
stop = 114 * BEAT  # 54.72, beat 3 of bar 28
DUR = 56.4
order = ["H01", "L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "E01", "L09", "T01", "L10", "L11", "L12", "S01", "C01"]
vo, words, prev = [], {}, 0
for k in order:
    d = vo3[k]
    s = start[k]
    assert s >= prev - 1e-6, (k, s, prev)
    prev = s + d["words"][-1][2] + 0.1
    vo.append(dict(id=k, file=d["file"], start=s, dur=d["dur"], text=d["text"]))
    words[k] = d["words"]
scenes = dict(
    hook3=[0.0, 3.84], hook=[3.84, 7.0], question=[7.0, 11.52], personas=[11.52, 21.5], memories=[21.5, 28.8],
    brand=[28.8, 34.0], typo=[33.9, 38.34], homes=[38.34, 42.44], offer=[42.44, 49.94], cta=[49.94, DUR],
)
music = dict(file="m3_firefire_shimza", bpm=125.0, beat=BEAT, bar=BAR, segments=segments, stop=stop,
             drops=[0.0, 6 * BAR, 15 * BAR, drop3], tapeStop=None, hookIn=0.62)
tl = dict(fps=60, duration=DUR, nohookStart=3.84, vo=vo, words=words, scenes=scenes, music=music, sfx=[])
json.dump(tl, open("/home/user/Teste/src/longstay/data/timeline.json", "w"), indent=1, ensure_ascii=False)
for v in vo:
    print(f"{v['id']}  {v['start']:6.2f} – {v['start'] + v['dur']:6.2f}  {v['text']}")
print("C01 'Reserve' at", round(start["C01"] + vo3["C01"]["words"][0][1], 3), "props end", round(props_end, 3), "connosco end", round(start["C01"] + vo3["C01"]["words"][-1][2], 3))
