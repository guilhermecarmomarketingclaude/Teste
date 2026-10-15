"""V2 cue sheet: trigger-style SFX (snaps, sucks, shutter, glitch, sub drops) on the beat grid and
on the same word timings / step times the scenes use."""
import json

P = "/home/user/Teste/src/longstay/data/timeline.json"
tl = json.load(open(P))
st = {v["id"]: v["start"] for v in tl["vo"]}
B = tl["music"]["beat"]


def w(line, word, nth=0, edge="a"):
    norm = lambda s: s.lower().strip(".,:;!?…")
    hits = [x for x in tl["words"][line] if norm(x[0]) == norm(word)]
    a, b = hits[nth][1], hits[nth][2]
    return round(st[line] + (a if edge == "a" else b), 3)


cues = []


def cue(t, name, gain, **kw):
    cues.append(dict(t=round(t, 3), name=name, gain=gain, **kw))


D1, D2, D3 = tl["music"]["drops"][1], tl["music"]["drops"][2], tl["music"]["drops"][3]

# ---------------- cold open (0–3.84): slam, snaps on the beat, polaroids, sticker, suck + tape stop
cue(0.0, "hit2_3", -2, align="onset")
cue(0.0, "subdrop2_4", -3, align="onset")
cue(0.02, "glitch2_1", -14, align="onset", dur=0.25)
cue(1 * B, "snap2_1", 0, align="peak")
cue(2 * B, "snap2_2", 0, align="peak")
cue(3 * B, "shutter2_1", -4, align="onset")
cue(4 * B, "shutter2_1", -4, align="onset")
cue(5 * B, "pop_b", -6, align="onset")
cue(5 * B + 0.04, "sparkle_b", -12, align="onset")
cue(6 * B, "shutter2_1", -4, align="onset")
cue(6 * B + 0.24, "snap2_1", -3, align="peak")
cue(3.84, "suck2_1", -4, align=0.70)
# ---------------- hook (3.84–7.0)
cue(3.86, "snap2_4", -4, align="onset", dur=0.6)
cue(3.9, "whoosh_short_b", -14, align="onset")
cue(4.02, "pages_b", -17, align="onset", dur=0.6)
passa = w("L01", "passa")
cue(passa - 0.05, "whoosh_deep_a", -11)
cue(passa + 0.05, "pages_a", -13, align="onset", dur=1.0, fadein=0.05)
cue(w("L01", "voar.", edge="b") + 0.12, "swish2_1", -9)
# ---------------- question (7.0–11.52)
cue(6.84, "swish2_3", -12, align="onset")
cue(7.1, "ticks_b", -23, align="onset", dur=0.8)
mes = w("L02", "mês…")
cue(mes - 0.1, "swoosh_b", -21, align="onset")
cue(mes + 0.85, "chime_b", -17, align="onset")
cue(w("L02", "pagasse") - 0.2, "pop_b", -12, align="onset")
cue(D1, "riser_a", -12, **{"from": 10.0})
cue(D1, "suck2_2", -6, align=1.45)
# ---------------- personas on drop 1
cue(D1, "subdrop2_4", -2, align="onset")
cue(D1 + 0.01, "hit2_2", -9, align="onset", lp=3000)
steps = [st["L04"] - 0.04, st["L05"] - 0.04, st["L06"] - 0.04, st["L07"] - 0.04]
for k, s in enumerate(steps):
    cue(s, "snap2_1" if k % 2 == 0 else "snap2_2", -2, align="peak")
    cue(s - 0.02, "swish2_3", -15, align="onset")
cue(st["L03"] + 0.1, "wind_b", -19, align="onset", dur=0.9, lp=3000)
fug = w("L03", "fugir")
cue(fug + 0.05, "sparkle_b", -18, align="onset")
cue(fug + 0.3, "ticks_a", -24, align="onset", dur=0.6)
golfe = w("L04", "golfe")
cue(golfe - 0.5, "golf_b", 4, align="onset")
cue(golfe + 0.07, "typing_b", -17, align="onset", dur=0.45)
cue(golfe - 0.5 + 1.0, "click_a", -9, align="onset")
cue(w("L04", "ano") - 0.1, "ticks_b", -22, align="onset", dur=0.8)
trab = w("L05", "trabalha")
cue(trab - 0.05, "pop_b", -15, align="onset")
cue(trab + 0.1, "typing_b", -19, align="onset", dur=0.8)
cue(w("L05", "qualquer") - 0.05, "notify_a", -13, align="onset")
h = steps[2]
entre = w("L06", "entre")
for k, tland in enumerate([h + 0.3 + 0.294, h + 0.52 + 0.294, entre - 0.05 + 0.294]):
    cue(tland, "box_b" if k != 1 else "box_a", -10, align="onset")
cue(w("L06", "casas.") - 0.12, "keys_a", -11, align="onset")
cue(steps[3] + 0.18, "book_b", -12, align="onset")
cue(w("L07", "estudar.") - 0.2, "swoosh_b", -15, align="onset")
# ---------------- memories (21.6–28.8)
mem0 = st["L08"] - 0.04
cue(mem0, "whoosh_deep_a", -10)
cue(mem0, "snap2_2", -3, align="peak")
for k in range(6):
    tk = mem0 + 0.48 + k * B * 0.75
    cue(tk, "shutter2_1", -7 - k * 0.6, align="onset", pan=[-0.4, 0.4, -0.2, 0.3, -0.3, 0.2][k])
cue(w("L08", "tempo.") - 0.05, "sparkle_a", -12, align="onset")
cue(24.96, "waves_b", -16, align="onset", fadein=0.9, dur=3.6)
cue(D2, "riser_b", -11)
cue(D2, "suck2_2", -5, align=1.45)
# ---------------- brand on drop 2
cue(D2, "hit2_3", -6, align="onset", lp=2500)
cue(D2, "subdrop2_4", -2, align="onset")
cue(D2 + 0.03, "swoosh_a", -12)
cue(D2 + 0.78, "sparkle_a", -11, align="onset")
cue(D2 + 1.3, "whoosh_deep_a", -14)
vil = w("L09", "Vilamoura")
olh = w("L09", "Olhão.")
for k, at in enumerate([vil - 0.05, vil + (olh - vil) * 0.25, vil + (olh - vil) * 0.5, vil + (olh - vil) * 0.75, olh - 0.05]):
    cue(at + 0.12, "pop_b" if k in (0, 4) else "tap_a", -13 if k in (0, 4) else -8, align="onset")
cue(vil, "swoosh_b", -18, align="onset")
cue(34.3, "swish2_1", -10)
# ---------------- homes
m0 = tl["scenes"]["homes"][0]
for k in range(3):
    cue(m0 + 0.25 + k * 0.17 + 0.3, "click_a", -12, align="onset")
com = w("L10", "com")
cue(com - 0.05, "whoosh_short_b", -13, align="onset")
cue(com + 0.32, "pop_b", -14, align="onset")
h24 = w("L10", "24")
cue(h24 - 0.12, "ticks_a", -21, align="onset", dur=0.9)
cue(h24 + 0.3, "notify_a", -11, align="onset")
cue(tl["scenes"]["homes"][1] - 0.15, "swish2_3", -12, align="onset")
# ---------------- offer
o0 = tl["scenes"]["offer"][0]
cue(o0 + 0.15, "swoosh_b", -15, align="onset")
cue(o0 + 0.6, "ticks_b", -24, align="onset", dur=1.4)
cue(w("L11", "menos") - 0.03, "pop_b", -12, align="onset")
em = w("L12", "em")
cue(em - 0.25, "swish2_3", -11, align="onset")
cue(em + 0.05, "ticks_a", -26, align="onset", dur=0.9, lp=5000)
cue(w("L12", "28") + 0.12, "pop_b", -16, align="onset")
cue(D3, "riser_a", -17, **{"from": 43.45})
cue(D3, "suck2_1", -7, align=0.70)
cue(D3 - 0.02, "subdrop2_4", -1, align="onset")
cue(D3 - 0.02, "hit2_3", -6, align="onset", lp=700)
cue(D3 + 0.3, "sparkle_b", -15, align="onset")
cue(w("L12", "de", 1) - 0.05, "pop_b", -14, align="onset")
cue(w("L12", "de", 1) + 0.5, "pop_b", -19, align="onset")
# ---------------- cta
c0 = tl["scenes"]["cta"][0]
cue(c0, "whoosh_deep_a", -10)
cue(c0 + 0.25, "swoosh_b", -15, align="onset")
tap = w("L13", "estadia.") + 0.12
cue(tap, "tap_a", -8, align="onset")
cue(tap + 0.02, "click_a", -15, align="onset")
# ---------------- end
e0 = tl["scenes"]["end"][0]
cue(e0, "snap2_1", -4, align="peak")
cue(w("L14", "HD") - 0.12, "swoosh_a", -13)
fale = w("L14", "Fale")
cue(fale - 0.05, "pop_b", -12, align="onset")
cue(fale + 0.35, "pop_b", -15, align="onset")
stop = tl["music"]["stop"]
cue(stop, "hit2_3", -3, align="onset")
cue(stop, "subdrop2_4", -3, align="onset")
cue(stop + 0.05, "sparkle_b", -10, align="onset")

tl["sfx"] = sorted(cues, key=lambda c: c["t"])
json.dump(tl, open(P, "w"), indent=1, ensure_ascii=False)
print(len(cues), "cues")
