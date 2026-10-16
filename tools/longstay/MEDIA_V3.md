# Long-stay reel V3: media that is not in the repo

The repository is public, so three kinds of media are kept out of git (see `.gitignore`):

| Path | What | Why it is not committed |
| --- | --- | --- |
| `public/longstay/mix/` | music mix (Fire Fire, Shimza remix) | licensed music |
| `public/longstay/v3/clips/c_*.mp4` | vertical cuts of the client's 4K property film | client footage, private |
| `public/longstay/v3/clips/s_*.mp4` | Mixkit stock clips (free licence) | Mixkit forbids redistributing raw files |
| `public/longstay/v3/img/` | original-size listing photos + frames taken from the footage | frames of private/stock footage |

Listing photos (`v3/tex`, `v3/tiles`) come from hdproperties.pt (the client's own listings).

## Client footage (`c_*`)

Source: the client's edited film (3840×2160, 59.94 fps). It carries a semi-transparent logo
watermark centred at roughly x 1500–2350, y 700–1460. Every cut is a full-height 9:16 window
(1215×2160) taken entirely left of x = 1480 or right of x = 2370, so the watermark is never in
frame:

```
ffmpeg -ss <start> -i film.mp4 -t <dur> -vf "crop=1215:2160:<x>:0,scale=1080:1920:flags=lanczos,fps=60" \
  -c:v libx264 -crf 17 -pix_fmt yuv420p -an out.mp4
```

| clip | start | dur | x |
| --- | --- | --- | --- |
| c_golf_drone | 2.2 | 3.4 | 2625 |
| c_golf_drone2 | 76.0 | 3.6 | 2625 |
| c_dev_drone | 7.6 | 3.2 | 2470 |
| c_pool | 18.0 | 3.0 | 2625 |
| c_living | 21.0 | 3.0 | 2625 |
| c_dining | 24.0 | 3.4 | 0 |
| c_kitchen | 31.0 | 3.4 | 0 |
| c_balcony_view | 45.0 | 3.0 | 2470 |
| c_bed1 / c_bed2 / c_bed3 | 48.0 / 52.0 / 65.0 | 3.2 / 3.0 / 3.2 | 2625 / 0 / 2625 |

`v3/img/hook_freeze.jpg` is frame 0.1333 s of `c_golf_drone.mp4`.

## Stock (`s_*`, Mixkit free licence, commercial use allowed)

Download `https://assets.mixkit.co/videos/<id>/<id>-<res>.mp4` (2160 where available, else 1080/720):

| clip | Mixkit id | start | dur | crop | out size |
| --- | --- | --- | --- | --- | --- |
| s_cold | 46707 (720p) | 3.5 | 4.0 | 720:720:420:0 | 720 |
| s_golf | 4273 (1080p) | 0.3 | 4.0 | 1080:1080:0:0 | 900 |
| s_work | 4844 (4K) | 1.0 | 4.0 | 2160:2160:1000:0 | 900 |
| s_pack | 31218 (4K) | 1.2 | 4.0 | 2160:2160:500:0 | 900 |
| s_students | 4519 (4K) | 2.0 | 4.0 | 2160:2160:840:0 | 900 |
| s_waves | 44482 (4K) | 9.0 | 4.2 | 1215:2160:1300:0 → 1080×1920 | — |

`v3/tex/waves_still.jpg` is frame 0.5 s of `s_waves.mp4`, fitted to 1280 px.

## Audio

`tools/longstay/mix3.py <timeline.json> public/longstay/mix/mix3.wav` (hook version) and
`... <tmp.wav> nohook` → cut at 116/30 s → `public/longstay/mix/mix3_nohook.wav`.
