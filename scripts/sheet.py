# Tile PNG stills into one contact sheet: python sheet.py dir out.png cols
import sys, glob
from PIL import Image, ImageDraw
d, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(f"{d}/f*.png"))
ims = [Image.open(f).convert("RGB") for f in fs]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 30)), "white")
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 30)
    sheet.paste(im, (x, y + 30))
    fr = int(f.split("/f")[-1][:-4])
    dr.text((x + 8, y + 6), f"{fr} ({fr/60:.2f}s)", fill=(0, 0, 0))
sheet.save(out)
print(out, sheet.size)
