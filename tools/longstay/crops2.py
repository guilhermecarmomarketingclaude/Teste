import cv2,numpy as np
S='/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/'
O=S+'clean/'
im=cv2.imread(S+'prev_reel/card/d_22.0.png')
src=np.float32([[174,412],[929,404],[931,798],[162,796]])
Wd,Hd=780,406
dst=np.float32([[0,0],[Wd,0],[Wd,Hd],[0,Hd]])
P=cv2.getPerspectiveTransform(src,dst)
w=cv2.warpPerspective(im,P,(Wd,Hd),flags=cv2.INTER_CUBIC)
cv2.imwrite(O+'listing_raw.png',w)
# heart button: bright near-white disc in the top-right corner
f=w.astype(np.int32); lum=cv2.cvtColor(w,cv2.COLOR_BGR2GRAY)
reg=np.zeros(lum.shape,np.uint8); reg[0:90,620:780]=1
m=((lum>238)&(reg>0)).astype(np.uint8)
n,lab,st,cen=cv2.connectedComponentsWithStats(m)
k=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); print('heart',st[k],cen[k])
cx,cy=cen[k]; r=max(st[k,2],st[k,3])/2+8
mask=np.zeros(lum.shape,np.uint8); cv2.circle(mask,(int(cx),int(cy)),int(r),255,-1)
out=w.copy(); cv2.xphoto.inpaint(w,255-mask,out,cv2.xphoto.INPAINT_FSR_BEST)
cv2.imwrite(O+'listing.png',out)
