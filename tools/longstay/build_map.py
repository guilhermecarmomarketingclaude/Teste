"""Build terrain heightmaps + baked textures for the Algarve 3D map (brand clay style)."""
import os, json, numpy as np, rasterio, shapefile
from rasterio.merge import merge
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_bounds
from rasterio.features import rasterize
from shapely.geometry import shape as shp_shape, mapping
from PIL import Image, ImageFilter
import cv2

SP = "/tmp/claude-0/-home-user-Teste/d5bb2191-ae19-523d-be85-7871755de0f3/scratchpad"
OUT = "/home/user/Teste/public/longstay/map"
os.makedirs(OUT, exist_ok=True)
os.environ["CURL_CA_BUNDLE"] = "/root/.ccr/ca-bundle.crt"

dem_srcs = [rasterio.open(f"{SP}/mapdata/dem_{t}.tif") for t in ["N36_00_W009_00","N36_00_W008_00","N37_00_W009_00","N37_00_W008_00"]]
dem_mosaic, dem_tf = merge(dem_srcs)
dem_mosaic = dem_mosaic[0].astype(np.float32)
dem_crs = dem_srcs[0].crs
wc = rasterio.open("/vsicurl/https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N36W009_Map.tif")

# Faro district polygon (Natural Earth 10m)
r = shapefile.Reader(f"{SP}/mapdata/ne/ne_10m_admin_1_states_provinces.shp")
flds = [f[0] for f in r.fields[1:]]
faro = None
for sr in r.iterShapeRecords():
    d = dict(zip(flds, sr.record))
    if d.get("admin") == "Portugal" and d.get("name") == "Faro":
        faro = shp_shape(sr.shape.__geo_interface__)
# extend seaward so WorldCover defines the coast (buffer ~3 km), but keep the inland border as is
faro_sea = faro.buffer(0.03)

def build(name, lon0, lon1, lat0, lat1, W, H, meshW, meshH, exag, plate):
    tf = from_bounds(lon0, lat0, lon1, lat1, W, H)
    # --- land cover at texture resolution
    lc = np.zeros((H, W), np.uint8)
    reproject(rasterio.band(wc, 1), lc, src_transform=wc.transform, src_crs=wc.crs, dst_transform=tf, dst_crs="EPSG:4326", resampling=Resampling.mode)
    water = (lc == 80) | (lc == 0)
    marsh = (lc == 90) | (lc == 95)
    bare = (lc == 60)
    built = (lc == 50)
    trees = (lc == 10)
    crop = (lc == 40)
    grass = (lc == 30) | (lc == 20)
    inside = rasterize([(mapping(faro_sea), 1)], out_shape=(H, W), transform=tf, fill=0, dtype=np.uint8).astype(bool)
    land = (~water) & inside
    # clean tiny specks
    land_u8 = land.astype(np.uint8)*255
    land_u8 = cv2.morphologyEx(land_u8, cv2.MORPH_OPEN, np.ones((3,3), np.uint8))
    land = land_u8 > 127
    # --- DEM at texture resolution
    dem = np.zeros((H, W), np.float32)
    reproject(dem_mosaic, dem, src_transform=dem_tf, src_crs=dem_crs, dst_transform=tf, dst_crs="EPSG:4326", resampling=Resampling.bilinear)
    dem = np.clip(dem, 0, 2000)
    # hillshade (meters per pixel)
    lat_mid = (lat0+lat1)/2
    mx = (lon1-lon0)/W * 111320*np.cos(np.radians(lat_mid)); my = (lat1-lat0)/H * 111320
    dzdx = cv2.Sobel(dem, cv2.CV_32F, 1, 0, ksize=3)/(8*mx)
    dzdy = cv2.Sobel(dem, cv2.CV_32F, 0, 1, ksize=3)/(8*my)
    z = 2.2
    nx, ny, nz = -dzdx*z, dzdy*z, np.ones_like(dem)
    n = np.sqrt(nx*nx+ny*ny+nz*nz); nx/=n; ny/=n; nz/=n
    L = np.array([-0.55, 0.55, 0.63]); L/=np.linalg.norm(L)   # light from NW (x east, y north)
    shade = np.clip(nx*L[0] + ny*L[1] + nz*L[2], 0, 1)
    shade = shade / (L[2])  # flat = 1
    # --- colors (sRGB 0..1)
    def c(hexs): return np.array([int(hexs[i:i+2],16)/255 for i in (1,3,5)], np.float32)
    col = np.zeros((H, W, 3), np.float32)
    land_col = c("#FBFCFD"); shadow_col = c("#B9C9D8"); bare_col = c("#F4EDE2"); marsh_col = c("#DCEFF3"); built_col = c("#F1F3F6"); green_col = c("#EAF1EE")
    base = np.broadcast_to(land_col, col.shape).copy()
    base[bare] = bare_col; base[marsh] = marsh_col; base[built] = built_col
    base[trees | grass | crop] = green_col
    # soften class edges
    base = cv2.GaussianBlur(base, (0,0), 1.0)
    s = np.clip(shade, 0.35, 1.15)[..., None]
    lit = np.where(s < 1, base*s + shadow_col*(1-s)*0.55, base + (s-1)*0.25)
    sea_col = c("#D6E8F5")
    col[:] = sea_col
    col[land] = lit[land]
    # coastline glow on the sea side
    landf = land.astype(np.float32)
    dist_sea = cv2.distanceTransform((~land).astype(np.uint8), cv2.DIST_L2, 5)  # px distance from land, for sea px
    px_m = mx
    glow = np.exp(-(dist_sea*px_m)/ (220.0 if name=="wide" else 90.0)) * (~land)
    line = np.clip(1.0 - np.abs(dist_sea*px_m - (60 if name=="wide" else 22))/(45 if name=="wide" else 16), 0, 1) * (~land)
    blue = c("#1FA6EB")
    col = col*(1-0.35*glow[...,None]) + blue*(0.35*glow[...,None])
    col = col*(1-0.85*line[...,None]) + blue*(0.85*line[...,None])
    img = (np.clip(col,0,1)*255).astype(np.uint8)
    Image.fromarray(img).save(f"{OUT}/{name}_tex.jpg", quality=92)
    # --- mesh heights (meters, exaggerated), plate for land
    land_small = cv2.resize(landf, (meshW, meshH), interpolation=cv2.INTER_AREA)
    dem_small = cv2.resize(dem, (meshW, meshH), interpolation=cv2.INTER_AREA)
    h = (dem_small*exag + plate) * np.clip(land_small*1.6-0.3, 0, 1)
    hmax = float(h.max())
    q = np.round(h / hmax * 65535).astype(np.uint16)
    q.tofile(f"{OUT}/{name}_height.u16")
    meta = dict(name=name, lon0=lon0, lon1=lon1, lat0=lat0, lat1=lat1, texW=W, texH=H, meshW=meshW, meshH=meshH,
                hmax_m=hmax, width_m=(lon1-lon0)*111320*np.cos(np.radians(lat_mid)), height_m=(lat1-lat0)*111320, exag=exag, plate=plate)
    json.dump(meta, open(f"{OUT}/{name}_meta.json","w"), indent=1)
    print(name, meta, "land frac", land.mean())
    return meta

wide = build("wide", -9.06, -7.34, 36.885, 37.5705, 8192, 4096, 1024, 512, exag=3.0, plate=420.0)
detail = build("detail", -8.20, -7.74, 36.93, 37.17, 4096, 2672, 920, 600, exag=3.0, plate=420.0)
