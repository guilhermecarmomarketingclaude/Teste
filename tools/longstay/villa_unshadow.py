import cv2,numpy as np
S='/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/'
O=S+'clean/'
v=cv2.imread(S+'prev_reel/villa/v_15.6.png').astype(np.float32)
H,W=v.shape[:2]
b,g,r=[v[:,:,i] for i in range(3)]
mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
band=np.zeros((H,W),bool); band[1095:1195,195:885]=True
G=(((mn>222)&((mx-mn)<34))|((b>170)&(r<130)&(b-r>70)))&band
G8=G.astype(np.uint8)
# glyph core incl. antialias: dilate 2
core=cv2.dilate(G8,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))
dist=cv2.distanceTransform(1-G8,cv2.DIST_L2,5)
lum=0.299*r+0.587*g+0.114*b
reg=np.zeros((H,W),bool); reg[1122:1170,640:870]=True
sel=reg&(core==0)&(dist<26)
best=None
for sig in [3,4,5,6,7,8,10,12]:
    for dy in [0,2,4,6,8]:
        for dx in [0,2]:
            M=np.float32([[1,0,dx],[0,1,dy]])
            Gs=cv2.warpAffine(G8.astype(np.float32),M,(W,H))
            bl=cv2.GaussianBlur(Gs,(0,0),sig)
            # fit lum = B*(1-a*bl): linear in (B, B*a)
            X=np.stack([np.ones(sel.sum()),-bl[sel]],1); y=lum[sel]
            coef,res,_,_=np.linalg.lstsq(X,y,rcond=None)
            err=float(((X@coef-y)**2).mean())
            if best is None or err<best[0]: best=(err,sig,dy,dx,coef[0],coef[1]/coef[0])
print('best err sig dy dx B alpha',best)
err,sig,dy,dx,B,a=best
M=np.float32([[1,0,dx],[0,1,dy]])
bl=cv2.GaussianBlur(cv2.warpAffine(G8.astype(np.float32),M,(W,H)),(0,0),sig)
fac=np.clip(1-a*bl,0.25,1)[:,:,None]
un=v/fac
un=np.clip(un,0,255).astype(np.uint8)
mask=(core*255).astype(np.uint8)
mask[285:385,835:975]=255
cv2.imwrite(O+'villa_mask2.png',mask)
out=un.copy()
for box in [(150,1060,940,1230),(760,220,1060,460)]:
    x0,y0,x1,y1=box
    c=un[y0:y1,x0:x1].copy(); m=mask[y0:y1,x0:x1]; o=c.copy()
    cv2.xphoto.inpaint(c,255-m,o,cv2.xphoto.INPAINT_FSR_FAST)
    out[y0:y1,x0:x1]=o
cv2.imwrite(O+'villa_clean.png',out)
a0=cv2.imread(S+'prev_reel/villa/v_15.6.png')[980:1280,100:1000]
cv2.imwrite(O+'villa_cmp2.png',np.vstack([a0,un[980:1280,100:1000],out[980:1280,100:1000]]))
