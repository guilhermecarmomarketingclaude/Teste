import cv2,numpy as np
S='/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/'
O=S+'clean/'
# ---- listing photo (living room with sea view) ----
for name in ['card/d_22.0.png','hi/f_22.5.png']:
    im=cv2.imread(S+'prev_reel/'+name)
    f=im.astype(np.int32)
    lum=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    sat=f.max(2)-f.min(2)
    reg=np.zeros(lum.shape,np.uint8); reg[340:840,120:980]=1
    m=(((lum<225)|(sat>40))&(reg>0)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8))
    n,lab,st,cen=cv2.connectedComponentsWithStats(m)
    k=1+np.argmax(st[1:,cv2.CC_STAT_AREA])
    comp=(lab==k).astype(np.uint8)
    cnts,_=cv2.findContours(comp,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    c=max(cnts,key=cv2.contourArea)
    hull=cv2.convexHull(c)
    ap=cv2.approxPolyDP(hull,0.02*cv2.arcLength(hull,True),True)
    print(name,'area',st[k,cv2.CC_STAT_AREA],'bbox',st[k,:4],'approx',ap.reshape(-1,2).tolist())
