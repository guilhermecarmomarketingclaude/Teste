"""V3 cue sheet: hook impacts, typologies fly-through, new CTA taps; V2 cues kept where the visuals
are unchanged (shifted +2 bars after the brand). Cues are tagged hook=True when they belong to the
hook only (dropped in the no-hook mix)."""
import json

P = "/home/user/Teste/src/longstay/data/timeline.json"
tl = json.load(open(P))
st = {v["id"]: v["start"] for v in tl["vo"]}
B = tl["music"]["beat"]
SH = 2 * tl["music"]["bar"]


def w(line, word, nth=0, edge="a"):
    norm = lambda s: s.lower().strip(".,:;!?…")
    hits = [x for x in tl["words"][line] if norm(x[0]) == norm(word)]
    a, b = hits[nth][1], hits[nth][2]
    return round(st[line] + (a if edge == "a" else b), 3)


cues = []


def cue(t, name, gain, **kw):
    cues.append(dict(t=round(t, 3), name=name, gain=gain, **kw))


D1, D2, D3 = tl["music"]["drops"][1], tl["music"]["drops"][2], tl["music"]["drops"][3]
# ---------------- hook (0–3.84)
hit = w("H01", "Pare.") + 0.014
cue(0.0, "whoosh_short_b", -9, align="onset", hook=True)
cue(hit, "hit2_3", -1, align="onset", hook=True)
cue(hit, "subdrop2_4", -2, align="onset", hook=True)
cue(hit + 0.01, "shutter2_1", -8, align="onset", hook=True)
cue(hit + 0.02, "glitch2_1", -14, align="onset", dur=0.22, hook=True)
for word, g in (("Não", -15), ("reserve", -19), ("o", -21), ("Algarve", -17)):
    cue(w("H01", word) - 0.05, "swish2_3", g, align="onset", hook=True)
cue(w("H01", "à") - 0.02, "pop_b", -13, align="onset", hook=True)
strike = w("H01", "semana.", edge="b") + 0.04
cue(strike, "swish2_1", -4, align="onset", hook=True)
cue(strike + 0.01, "glitch2_2", -13, align="onset", dur=0.16, hook=True)
cue(strike + 0.02, "subdrop2_1", -8, align="onset", hook=True)
cue(3.84, "riser_a", -13, hook=True, **{"from": 2.95})
cue(3.84, "suck2_1", -7, align=0.70, hook=True)
# ---------------- L01 (3.84–7.0)
cue(3.86, "snap2_4", -3, align="onset", dur=0.6)
cue(3.9, "whoosh_short_b", -15, align="onset")
cue(4.02, "pages_b", -18, align="onset", dur=0.6)
passa = w("L01", "passa")
cue(passa - 0.05, "whoosh_deep_a", -11)
cue(passa + 0.05, "pages_a", -14, align="onset", dur=1.0, fadein=0.05)
cue(w("L01", "voar.", edge="b") + 0.12, "swish2_1", -10)
# ---------------- question (7.0–11.52)
cue(6.84, "swish2_3", -13, align="onset")
cue(7.1, "ticks_b", -24, align="onset", dur=0.8)
mes = w("L02", "mês…")
cue(mes - 0.1, "swoosh_b", -21, align="onset")
cue(mes + 0.85, "chime_b", -18, align="onset")
cue(w("L02", "pagasse") - 0.2, "pop_b", -13, align="onset")
cue(D1, "riser_a", -13, **{"from": 10.0})
cue(D1, "suck2_2", -7, align=1.45)
# ---------------- personas on drop 1
cue(D1, "subdrop2_4", -2, align="onset")
cue(D1 + 0.01, "hit2_2", -9, align="onset", lp=3000)
steps = [st["L04"] - 0.04, st["L05"] - 0.04, st["L06"] - 0.04, st["L07"] - 0.04]
for k, s in enumerate(steps):
    cue(s, "snap2_1" if k % 2 == 0 else "snap2_2", -3, align="peak")
    cue(s - 0.02, "swish2_3", -16, align="onset")
cue(st["L03"] + 0.1, "wind_b", -19, align="onset", dur=0.9, lp=3000)
fug = w("L03", "fugir")
cue(fug + 0.05, "sparkle_b", -18, align="onset")
golfe = w("L04", "golfe")
cue(golfe + 0.05, "golf_b", 3, align="onset")  # the real swing's impact
cue(golfe + 0.12, "typing_b", -18, align="onset", dur=0.45)
cue(w("L04", "ano") - 0.1, "ticks_b", -22, align="onset", dur=0.8)
trab = w("L05", "trabalha")
cue(trab - 0.05, "pop_b", -15, align="onset")
cue(trab + 0.1, "typing_b", -19, align="onset", dur=0.8)
cue(w("L05", "qualquer") - 0.05, "notify_a", -13, align="onset")
cue(w("L05", "qualquer") + 0.1, "pop_b", -16, align="onset")
cue(w("L06", "casas.") - 0.12, "keys_a", -11, align="onset")
cue(w("L06", "casas.") - 0.05, "pop_b", -17, align="onset")
cue(w("L07", "estudar.") - 0.05, "pop_b", -15, align="onset")
cue(w("L07", "estudar.") - 0.2, "swoosh_b", -16, align="onset")
# ---------------- memories (21.6–28.8)
mem0 = st["L08"] - 0.04
cue(mem0, "whoosh_deep_a", -10)
cue(mem0, "snap2_2", -3, align="peak")
for k in range(6):
    tk = mem0 + 0.48 + k * B * 0.75
    cue(tk, "shutter2_1", -7 - k * 0.6, align="onset", pan=[-0.4, 0.4, -0.2, 0.3, -0.3, 0.2][k])
cue(w("L08", "tempo.") - 0.05, "sparkle_a", -13, align="onset")
e0 = w("E01", "O")
cue(e0 - 0.4, "whoosh_deep_b", -14)
cue(e0 - 0.2, "waves_b", -12, align="onset", fadein=0.6, dur=3.9)
cue(D2, "riser_b", -12)
cue(D2, "suck2_2", -6, align=1.45)
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
# ---------------- typologies (33.9–38.34)
y0, y1 = tl["scenes"]["typo"]
cue(y0 - 0.05, "whoosh_deep_a", -10)
cue(w("T01", "estúdio") - 0.04, "pop_b", -12, align="onset")
mor = w("T01", "moradia")
pis = w("T01", "piscina,")
cue(mor - 0.12, "whoosh_short_a", -8, align="onset")
for k, at in enumerate([0.25, 0.5, 0.75]):
    cue(mor - 0.12 + (pis + 0.02 - mor + 0.12) * at, "tap_a", -11, align="onset", pan=[-0.3, 0.0, 0.3][k])
cue(pis - 0.06, "pop_b", -11, align="onset")
cue(pis + 0.05, "sparkle_b", -15, align="onset")
ha = w("T01", "há")
cue(ha - 0.15, "swoosh_b", -13, align="onset")
cue(ha - 0.1, "ticks_a", -20, align="onset", dur=0.9)
cue(w("T01", "uma") - 0.06, "pop_b", -15, align="onset")
cue(w("T01", "cada") - 0.06, "pop_b", -12, align="onset")
cue(y1 - 0.62, "whoosh_deep_b", -11)
# ---------------- homes (V2 +2 bars)
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
cue(D3, "riser_a", -17, **{"from": D3 - 0.71})
cue(D3, "suck2_1", -7, align=0.70)
cue(D3 - 0.02, "subdrop2_4", -1, align="onset")
cue(D3 - 0.02, "hit2_3", -6, align="onset", lp=700)
cue(D3 + 0.3, "sparkle_b", -15, align="onset")
cue(w("L12", "de", 1) - 0.05, "pop_b", -14, align="onset")
cue(w("L12", "de", 1) + 0.5, "pop_b", -19, align="onset")
# ---------------- sign-off + CTA
c0 = tl["scenes"]["cta"][0]
land = w("S01", "HD") - 0.02
cue(c0, "whoosh_deep_a", -10)
cue(land - 0.42, "whoosh_short_a", -12, align="onset")
for k in range(3):
    cue(land - 0.42 + k * 0.07 + 0.4, "tap_a", -9 - k, align="onset", pan=[-0.3, 0.3, 0.0][k])
cue(land + 0.05, "sparkle_a", -12, align="onset")
cue(w("C01", "Reserve") - 0.06, "swish2_3", -15, align="onset")
cue(w("C01", "estadia,") + 0.05, "pop_b", -11, align="onset")
cue(w("C01", "fale") - 0.08, "pop_b", -13, align="onset")
tap1 = w("C01", "estadia,", edge="b") + 0.2
tap2 = w("C01", "connosco.", edge="b") + 0.12
for tp in (tap1, tap2):
    cue(tp, "tap_a", -7, align="onset")
    cue(tp + 0.02, "click_a", -14, align="onset")
cue(w("C01", "connosco.", edge="b") + 0.35, "pop_b", -17, align="onset")
stop = tl["music"]["stop"]
cue(stop, "hit2_3", -3, align="onset")
cue(stop, "subdrop2_4", -3, align="onset")
cue(stop + 0.05, "sparkle_b", -10, align="onset")

tl["sfx"] = sorted(cues, key=lambda c: c["t"])
json.dump(tl, open(P, "w"), indent=1, ensure_ascii=False)
print(len(cues), "cues;", sum(1 for c in cues if c.get("hook")), "hook-only")
