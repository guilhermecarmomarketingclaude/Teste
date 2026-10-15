import cv2,numpy as np
S='/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad/'
O=S+'clean/'
i=cv2.imread(S+'prev_reel/interior/i_18.40.png')
f=i.astype(np.float32)
lum=cv2.cvtColor(i,cv2.COLOR_BGR2GRAY).astype(np.float32)
H,W=lum.shape
b,g,r=f[:,:,0],f[:,:,1],f[:,:,2]
med=cv2.medianBlur(i,31)
lmed=cv2.cvtColor(med,cv2.COLOR_BGR2GRAY).astype(np.float32)
band=np.zeros((H,W),bool); band[296:352,95:545]=True
dark=(lum<lmed-8)&band
blue=((b-r)>30)&band
m=((dark|blue)*255).astype(np.uint8)
m=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
m[314:328,150:330]=255   # the rule line
m[290:378,838:972]=255   # logo
cv2.imwrite(O+'interior_mask2.png',m)
out=i.copy()
for box,mode in [((60,250,600,420),cv2.xphoto.INPAINT_FSR_FAST),((760,230,1060,450),cv2.xphoto.INPAINT_FSR_BEST)]:
    x0,y0,x1,y1=box
    c=i[y0:y1,x0:x1].copy(); mm=m[y0:y1,x0:x1]; o=c.copy()
    cv2.xphoto.inpaint(c,255-mm,o,mode)
    out[y0:y1,x0:x1]=o
cv2.imwrite(O+'interior_clean.png',out)
cv2.imwrite(O+'interior_cmp2.png',np.vstack([i[230:450],cv2.cvtColor(m[230:450],cv2.COLOR_GRAY2BGR),out[230:450]]))
