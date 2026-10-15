"""V2 narration: swap in the new takes (L03, L09, L14), trim, speed up 8% with ffmpeg atempo
(WSOLA, pitch preserved), and write word timings relative to each processed file."""
import json, subprocess, numpy as np, soundfile as sf
S='/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/'
PUB='/home/user/Teste/public/longstay/'
SPEED=1.08
tl=json.load(open('/home/user/Teste/src/longstay/data/timeline.json'))
words={k:[list(w) for w in v] for k,v in tl['words'].items()}
src={v['id']:PUB+v['file'].replace('longstay/','') for v in tl['vo']}
new={
 'L03':(S+'narr2/L03_3.mp3',[['Para',0.10,0.26],['quem',0.28,0.42],['quer',0.48,0.60],['fugir',0.72,1.10],['ao',1.14,1.22],['frio',1.42,1.64],['do',1.68,1.74],['inverno.',1.82,2.30]]),
 'L09':(S+'narr2/L09_3.mp3',[['Na',0.08,0.16],['HD',0.30,0.56],['Properties,',0.66,1.24],['temos',1.40,1.66],['casas',1.68,2.00],['prontas',2.14,2.50],['a',2.54,2.58],['viver,',2.64,3.04],['de',3.32,3.40],['Vilamoura',3.42,3.96],['a',4.14,4.22],['Olhão.',4.26,4.62]]),
 'L14':(S+'narr2/L14_1.mp3',[['HD',0.12,0.40],['Properties.',0.50,1.10],['Fale',1.58,1.74],['connosco.',1.82,2.30]]),
}
order=[v['id'] for v in tl['vo']]
out={}
for k in order:
    if k in new:
        path,ws=new[k]; lead=max(0.0,ws[0][1]-0.05); words[k]=[[w,a-lead,b-lead] for w,a,b in ws]
    else:
        path=src[k]; lead=0.0
    end=words[k][-1][2]+0.22
    tmp=S+f'narr2/{k}_trim.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{lead:.3f}','-i',path,'-t',f'{end:.3f}','-ar','48000','-ac','1',tmp],check=True)
    dst=PUB+f'narration2/{k}.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-filter:a',f'atempo={SPEED}','-ar','48000','-ac','1','-c:a','pcm_s16le',dst],check=True)
    x,sr=sf.read(dst)
    # 6 ms fades against clicks
    f=int(0.006*sr); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f); sf.write(dst,x,sr,subtype='PCM_16')
    ws=[[w,round(a/SPEED,3),round(b/SPEED,3)] for w,a,b in words[k]]
    out[k]=dict(file=f'longstay/narration2/{k}.wav',dur=round(len(x)/sr,3),words=ws,text=' '.join(w for w,_,_ in ws))
    print(k, out[k]['dur'], out[k]['text'])
json.dump(out,open(S+'vo2.json','w'),indent=1,ensure_ascii=False)
