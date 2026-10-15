"""Write the SFX cue sheet into timeline.json, derived from the same word timings the scenes use."""
import json

P = "/home/user/Teste/src/longstay/data/timeline.json"
tl = json.load(open(P))
start = {v["id"]: v["start"] for v in tl["vo"]}


def w(line, word, nth=0, edge="a"):
    norm = lambda s: s.lower().strip(".,:;!?…")
    hits = [x for x in tl["words"][line] if norm(x[0]) == norm(word)]
    a, b = hits[nth][1], hits[nth][2]
    return round(start[line] + (a if edge == "a" else b), 3)


cues = []


def cue(t, name, gain, **kw):
    cues.append(dict(t=round(t, 3), name=name, gain=gain, **kw))


# --- hook: the week flies away
cue(0.02, "whoosh_short_b", -14, align="onset")
cue(0.18, "pages_b", -16, align="onset", dur=0.6)
passa = w("L01", "passa")
cue(passa - 0.05, "whoosh_deep_a", -10)
cue(passa + 0.05, "pages_a", -12, align="onset", dur=1.0, fadein=0.05)
cue(w("L01", "voar.", edge="b") + 0.12, "swoosh_a", -11)
cue(3.1, "whoosh_short_a", -12)
# --- question: calendar, range, price
cue(3.28, "ticks_b", -23, align="onset", dur=0.8)
mes = w("L02", "mês…")
cue(mes - 0.1, "swoosh_b", -21, align="onset")
cue(mes + 0.85, "chime_b", -16, align="onset")
cue(w("L02", "pagasse") - 0.2, "pop_b", -12, align="onset")
cue(7.68, "riser_a", -11, **{"from": 6.42})  # peak lands on the drop
cue(7.4, "whoosh_deep_b", -10)
cue(7.68, "impact_a", -7, align="onset")
# --- personas
cue(7.72, "pop_b", -14, align="onset")
cue(7.8, "wind_b", -16, align="onset", dur=1.0, lp=3000)
foge = w("L03", "foge")
cue(foge + 0.1, "sparkle_b", -19, align="onset")
cue(foge + 0.35, "ticks_a", -24, align="onset", dur=0.6)
for at in [9.7, 11.95, 13.96, 15.86]:
    cue(at + 0.05, "whoosh_short_b", -13, align="onset")
golfe = w("L04", "golfe")
cue(golfe - 0.55, "golf_b", 4, align="onset")
cue(golfe - 0.55 + 1.12, "click_a", -8, align="onset")
cue(w("L04", "ano") - 0.1, "ticks_b", -22, align="onset", dur=0.9)
trab = w("L05", "trabalha")
cue(trab - 0.08, "pop_b", -15, align="onset")
cue(trab + 0.1, "typing_b", -18, align="onset", dur=0.9)
cue(w("L05", "qualquer") - 0.08, "notify_a", -13, align="onset")
# boxes land at at+0.35+0.294, at+0.6+0.294, entre-0.05+0.294
h = 13.96
entre = w("L06", "entre")
for k, tland in enumerate([h + 0.35 + 0.294, h + 0.6 + 0.294, entre - 0.05 + 0.294]):
    cue(tland, "box_b" if k != 1 else "box_a", -9, align="onset")
cue(w("L06", "casas.") - 0.15, "keys_a", -10, align="onset")
cue(15.86 + 0.2, "book_b", -12, align="onset")
est = w("L07", "estudar.")
cue(est - 0.2, "swoosh_b", -14, align="onset")
cue(17.32, "whoosh_deep_a", -12)
for k in range(5):
    cue(17.3 + 0.25 + k * 0.07, "pop_b", -20, align="onset", pan=[-0.6, 0.6, -0.5, 0.5, 0][k])
cue(19.18, "whoosh_deep_b", -11, align="onset")
cue(19.3, "sparkle_b", -14, align="onset")
# --- slow: sea air
cue(21.1, "waves_b", -15, align="onset", fadein=0.8, dur=3.9)
cue(24.96, "riser_b", -11)
cue(24.72, "whoosh_deep_a", -8)
# --- brand
cue(24.96, "impact_a", -6, align="onset")
cue(25.0, "swoosh_a", -12)
cue(25.75, "sparkle_a", -11, align="onset")
cue(26.3, "whoosh_deep_a", -14)
vil = w("L09", "Vilamoura")
olh = w("L09", "Olhão.")
for k, at in enumerate([vil - 0.05, vil + (olh - vil) * 0.25, vil + (olh - vil) * 0.5, vil + (olh - vil) * 0.75, olh - 0.05]):
    cue(at + 0.12, "tap_a" if k in (1, 2, 3) else "pop_b", -14 if k in (0, 4) else -9, align="onset")
cue(vil, "swoosh_b", -18, align="onset")
cue(29.62, "whoosh_short_a", -11)
# --- homes
for k in range(3):
    cue(29.8 + 0.25 + k * 0.17 + 0.3, "click_a", -12, align="onset")
com = w("L10", "com")
cue(com - 0.05, "whoosh_short_b", -13, align="onset")
cue(com + 0.32, "pop_b", -14, align="onset")
h24 = w("L10", "24")
cue(h24 - 0.12, "ticks_a", -21, align="onset", dur=0.9)
cue(h24 + 0.3, "notify_a", -11, align="onset")
cue(33.52, "whoosh_short_a", -16)
# --- offer
cue(33.78, "swoosh_b", -15, align="onset")
cue(34.2, "ticks_b", -24, align="onset", dur=1.4)
menos = w("L11", "menos")
cue(menos - 0.03, "pop_b", -12, align="onset")
em = w("L12", "em")
cue(em - 0.25, "whoosh_short_b", -13, align="onset")
cue(em + 0.05, "ticks_a", -23, align="onset", dur=1.15, lp=5000)
n28 = w("L12", "28")
cue(n28 + 0.12, "pop_b", -16, align="onset")
drop = w("L12", "30%")
cue(drop, "riser_a", -13, **{"from": 37.95})
cue(drop - 0.3, "whoosh_deep_b", -12, align="onset")
cue(drop - 0.02, "impact_a", -3, align="onset", lp=180)
cue(drop + 0.25, "sparkle_b", -15, align="onset")
cue(w("L12", "de", 1) - 0.05, "pop_b", -14, align="onset")
cue(w("L12", "de", 1) + 0.5, "pop_b", -19, align="onset")
# --- cta
cue(40.2, "whoosh_deep_a", -10)
cue(40.45, "swoosh_b", -15, align="onset")
tap = w("L13", "estadia.") + 0.12
cue(tap, "tap_a", -8, align="onset")
cue(tap + 0.02, "click_a", -15, align="onset")
cue(42.3, "whoosh_short_a", -12)
# --- end
hd = w("L14", "HD")
cue(hd - 0.12, "swoosh_a", -13)
cue(45.2, "pop_b", -15, align="onset")
cue(45.45, "pop_b", -15, align="onset")
cue(46.08, "impact_a", -7, align="onset")
cue(46.03, "sparkle_b", -10, align="onset")

tl["sfx"] = sorted(cues, key=lambda c: c["t"])
json.dump(tl, open(P, "w"), indent=1, ensure_ascii=False)
print(len(cues), "cues")
