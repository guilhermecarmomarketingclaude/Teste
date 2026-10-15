import json
# Word timings from ElevenLabs Scribe alignment of take 2 (source seconds).
W = """Uma 0 0.24|semana 0.32 0.64|no 0.72 0.8|Algarve 0.88 1.44|passa 1.52 1.8|a 1.84 1.92|voar. 2.04 2.72
E 2.96 3.04|se 3.08 3.12|ficasse 3.2 3.52|um 3.6 3.68|mês… 3.76 4.56|e 4.64 4.68|pagasse 4.72 5.04|menos 5.12 5.36|por 5.44 5.52|noite? 5.6 6.0
Para 6.48 6.56|quem 6.64 6.72|foge 6.88 7.2|ao 7.28 7.36|frio 7.44 7.68|do 7.76 7.84|inverno. 7.92 8.56
Para 8.72 8.8|quem 8.88 8.96|joga 9.04 9.28|golfe 9.36 9.76|o 9.84 9.92|ano 10 10.16|inteiro. 10.32 10.88
Para 11.04 11.12|quem 11.2 11.28|trabalha 11.36 11.76|de 11.84 11.92|qualquer 12 12.32|lado. 12.4 12.96
Para 13.12 13.2|quem 13.28 13.36|está 13.44 13.68|entre 13.84 14.08|casas. 14.16 14.88
Para 15.04 15.12|quem 15.2 15.28|vem 15.36 15.52|estudar. 15.6 16.24
Ou 16.4 16.453|para 16.48 16.64|quem, 16.68 16.96|simplesmente, 17.12 17.96|quer 18.08 18.24|ficar 18.36 18.56|mais 18.64 18.8|tempo. 18.88 19.28
Na 19.68 19.76|HD 19.88 20.16|Properties, 20.48 20.84|temos 20.88 21.12|casas 21.24 21.44|prontas 21.6 21.92|a 22.0 22.04|viver, 22.08 22.56|de 22.6 22.64|Vilamoura 22.72 23.28|a 23.36 23.44|Olhão. 23.52 24.08
Totalmente 24.24 24.72|equipadas, 24.88 25.44|com 25.52 25.6|apoio 25.72 25.88|local 25.92 26.24|24 26.4 26.56|horas 26.64 27.2|por 27.36 27.44|dia. 27.6 27.92
E 28.08 28.12|quanto 28.16 28.4|mais 28.44 28.56|tempo 28.64 28.8|fica, 28.84 29.36|menos 29.44 29.68|paga: 29.76 30.4
em 30.44 30.48|estadias 30.56 30.96|com 31.04 31.12|mais 31.16 31.28|de 31.36 31.44|28 31.48 31.68|dias, 31.72 32.36|tem 32.4 32.64|30% 32.68 32.88|de 33.04 33.52|desconto. 33.6 34.4
Reserve 34.48 34.8|já 34.88 35.04|a 35.08 35.12|sua 35.2 35.36|estadia. 35.44 36.16
HD 36.24 36.64|Properties. 36.72 37.6|Fique 37.68 38.0|o 38.16 38.32|tempo 38.44 38.6|que 38.64 38.72|quiser. 38.8 39.44"""
ids = ["L01","L02","L03","L04","L05","L06","L07","L08","L09","L10","L11","L12","L13","L14"]
cut_start = {"L01":0.05,"L02":2.92,"L03":6.42,"L04":8.66,"L05":11.00,"L06":13.05,"L07":14.97,"L08":16.31,"L09":19.54,"L10":24.28,"L11":27.96,"L12":30.33,"L13":34.33,"L14":36.12}
dur = {"L01":2.35,"L02":3.16,"L03":2.0,"L04":2.1,"L05":1.85,"L06":1.77,"L07":1.16,"L08":2.89,"L09":4.43,"L10":3.57,"L11":2.29,"L12":3.87,"L13":1.62,"L14":3.21,"E01":2.76}
start = {"L01":0.12,"L02":3.30,"L03":7.72,"L04":9.86,"L05":12.10,"L06":14.08,"L07":15.98,"L08":17.40,"E01":21.30,"L09":25.25,"L10":29.90,"L11":33.75,"L12":36.05,"L13":40.40,"L14":42.60}
words = {}
for i, line in enumerate(W.split("\n")):
    lid = ids[i]
    ws = []
    for tok in line.split("|"):
        w, a, b = tok.rsplit(" ", 2)
        ws.append([w, round(float(a) - cut_start[lid], 3), round(float(b) - cut_start[lid], 3)])
    words[lid] = ws
# extra line, estimated from VAD segments (0.09-1.54, 1.98-2.73 in source; cut starts at 0.04)
words["E01"] = [["O",0.05,0.16],["Algarve",0.18,0.72],["sabe",0.76,1.02],["melhor…",1.04,1.5],["sem",1.94,2.16],["pressa.",2.2,2.7]]
order = ["L01","L02","L03","L04","L05","L06","L07","L08","E01","L09","L10","L11","L12","L13","L14"]
vo = [dict(id=k, file=f"longstay/narration/{k}.wav", start=start[k], dur=dur[k], text=" ".join(w[0] for w in words[k])) for k in order]
scenes = dict(hook=[0.0,3.2], question=[3.2,7.68], personas=[7.68,21.12], slow=[21.12,24.96], brand=[24.96,29.8], homes=[29.8,33.6], offer=[33.6,40.2], cta=[40.2,42.5], end=[42.5,48.0])
music = dict(file="m2_firefire_innerbloom", bpm=125.0, beat=0.48, bar=1.92,
    segments=[[22.642,30.322,0.0],[30.322,43.762,7.68],[88.402,92.242,21.12],[92.242,96.082,24.96],[99.922,105.682,28.8],[103.762,107.602,34.56],[107.602,115.282,38.4]],
    stop=46.08, drops=[7.68, 24.96, 38.4], gapBar=[5.76, 7.68], miniBreak=[32.64, 38.4])
tl = dict(fps=60, duration=48.0, vo=vo, words=words, scenes=scenes, music=music, sfx=[])
json.dump(tl, open("/home/user/Teste/src/longstay/data/timeline.json","w"), indent=1, ensure_ascii=False)
print("ok", len(vo))
