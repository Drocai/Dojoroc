#!/usr/bin/env python3
"""
Generate transparent pixel-art Roc sprites with ZERO dependencies.
PNG is just zlib-compressed scanlines + CRC32 — both in the stdlib. We draw each
Roc on a low-res grid, then scale up nearest-neighbor for crisp chunky pixels.

Output: src/assets/rocs/<species>.png  (512x512, transparent)
"""
import zlib, struct, os

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "rocs")
GRID = 32          # design grid
SCALE = 16         # 32*16 = 512px
SIZE = GRID * SCALE

# ---- minimal PNG writer -----------------------------------------------------
def write_png(path, pixels, w, h):
    """pixels: list of (r,g,b,a) length w*h. Writes an RGBA PNG."""
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter type 0
        row = pixels[y * w:(y + 1) * w]
        for (r, g, b, a) in row:
            raw += bytes((r, g, b, a))
    comp = zlib.compress(bytes(raw), 9)

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)  # 8-bit RGBA
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", comp) + chunk(b"IEND", b""))

# ---- tiny drawing canvas (grid space) ---------------------------------------
class Canvas:
    def __init__(self, n):
        self.n = n
        self.px = [(0, 0, 0, 0)] * (n * n)
    def set(self, x, y, c):
        if 0 <= x < self.n and 0 <= y < self.n and c[3] > 0:
            self.px[y * self.n + x] = c
    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.set(x, y, c)
    def disc(self, cx, cy, r, c):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                    self.set(x, y, c)
    def ring(self, cx, cy, r, c):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                d = (x - cx) ** 2 + (y - cy) ** 2
                if (r - 1) ** 2 < d <= r * r:
                    self.set(x, y, c)
    def upscale(self, s):
        out = [(0, 0, 0, 0)] * (self.n * s * self.n * s)
        W = self.n * s
        for y in range(self.n):
            for x in range(self.n):
                c = self.px[y * self.n + x]
                for dy in range(s):
                    for dx in range(s):
                        out[(y * s + dy) * W + (x * s + dx)] = c
        return out, W, W

# ---- palette helpers --------------------------------------------------------
def hx(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

def shade(c, f):
    return (max(0, min(255, int(c[0] * f))), max(0, min(255, int(c[1] * f))),
            max(0, min(255, int(c[2] * f))), 255)

BLACK = hx("#0a0a0f")
WHITE = (255, 255, 255, 255)
BELT = hx("#f59e0b")        # default amber belt
BELT_D = shade(BELT, 0.6)

# Accent colors per species (matches the app's theme)
ACCENT = {
    "emerald": "#10b981", "cyan": "#22d3ee", "amber": "#f59e0b",
    "blue": "#3b82f6", "rose": "#f43f5e", "purple": "#a855f7",
}

# ---- the rock body (shared silhouette) --------------------------------------
def draw_body(cv, base):
    mid = shade(base, 1.0)
    dark = shade(base, 0.55)
    light = shade(base, 1.25)
    # chunky rounded rock — built from stacked rows (x ranges per y)
    rows = {
        8: (12, 19), 9: (10, 21), 10: (9, 22), 11: (8, 23),
        12: (7, 24), 13: (7, 24), 14: (6, 25), 15: (6, 25),
        16: (6, 25), 17: (6, 25), 18: (7, 24), 19: (7, 24),
        20: (8, 23), 21: (9, 22), 22: (10, 21), 23: (12, 19),
    }
    for y, (x0, x1) in rows.items():
        cv.rect(x0, y, x1, y, mid)
    # outline
    for y, (x0, x1) in rows.items():
        cv.set(x0 - 1, y, dark); cv.set(x1 + 1, y, dark)
    cv.rect(11, 7, 20, 7, dark)   # top cap
    cv.rect(11, 24, 20, 24, dark) # bottom cap
    # shading: darker bottom-right, lighter top-left
    for y in range(17, 24):
        for x in range(16, 26):
            if cv.px[y * cv.n + x][3] and cv.px[y * cv.n + x] == mid:
                cv.set(x, y, shade(base, 0.8))
    for x in range(7, 14):
        cv.set(x, 9, light); cv.set(x + 1, 10, light)
    # little cracks (rock texture)
    cv.set(14, 12, dark); cv.set(15, 13, dark); cv.set(20, 16, dark); cv.set(21, 17, dark)

def draw_eyes(cv, narrowed=False):
    # white sclera + dark pupil
    for ex in (12, 18):
        cv.rect(ex, 13, ex + 2, 15, WHITE)
        cv.rect(ex + 1, 14, ex + 2, 15, BLACK) if narrowed else cv.rect(ex + 1, 14, ex + 1, 15, BLACK)

def draw_belt(cv, belt=BELT):
    bd = shade(belt, 0.6)
    cv.rect(6, 20, 25, 21, belt)
    cv.rect(6, 20, 25, 20, shade(belt, 1.2))
    cv.rect(15, 19, 17, 22, belt)   # knot
    cv.rect(15, 19, 17, 19, bd)

# ---- per-species feature overlays -------------------------------------------
def feat_topknot(cv, a): cv.disc(16, 5, 2, shade(a, 0.7)); cv.rect(15, 6, 16, 7, shade(a, 0.7))
def feat_headband(cv, a):
    cv.rect(7, 10, 24, 11, BELT); cv.set(6, 10, BELT_D); cv.set(25, 10, BELT_D)
    cv.rect(24, 10, 27, 13, BELT)  # tail
def feat_horns(cv, a):
    for hx0, d in ((9, -1), (22, 1)):
        cv.set(hx0, 6, shade(a, 0.5)); cv.set(hx0 + d, 5, shade(a, 0.5)); cv.set(hx0 + 2 * d, 4, shade(a, 0.5))
def feat_mask(cv, a): cv.rect(10, 12, 21, 16, BLACK); cv.rect(11, 13, 20, 13, shade(a, 0.4))
def feat_crystal(cv, a):
    c = shade(a, 1.3)
    for i, (x, y) in enumerate([(16, 3), (15, 4), (17, 4), (16, 5), (16, 6)]):
        cv.set(x, y, c)
def feat_beard(cv, a):
    g = (229, 231, 235, 255)
    cv.rect(11, 17, 20, 18, g); cv.rect(12, 19, 19, 20, g); cv.rect(13, 21, 18, 22, g)
    cv.rect(13, 16, 18, 16, g)  # brow/hair tuft
def feat_staff(cv, a):
    w = shade(a, 0.45)
    for y in range(4, 27):
        cv.set(26, y, w); cv.set(27, y, shade(a, 0.3))
def feat_nunchuck(cv, a):
    w = shade(a, 0.4); cv.disc(27, 11, 1, w); cv.disc(28, 16, 1, w); cv.set(27, 13, w); cv.set(28, 14, w)
def feat_wings(cv, a):
    d = shade(a, 0.55)
    cv.rect(3, 15, 5, 19, d); cv.set(4, 14, d); cv.set(2, 17, d)
    cv.rect(26, 15, 28, 19, d); cv.set(27, 14, d); cv.set(29, 17, d)

FEATURES = {
    "topknot": feat_topknot, "headband": feat_headband, "band": feat_headband,
    "horns": feat_horns, "mask": feat_mask, "crystal": feat_crystal,
    "beard": feat_beard, "staff": feat_staff, "nunchuck": feat_nunchuck,
    "belt2": None, "wings": feat_wings,
}

# species: (key, accent, feature, narrowed_eyes)
SPECIES = [
    ("zen-pebble",        "cyan",    "topknot",  False),
    ("makiwara-rock",     "amber",   "headband", True),
    ("nunchuck-rocks",    "emerald", "nunchuck", False),
    ("bo-staffali",       "blue",    "staff",    True),
    ("smash-boulder",     "rose",    "horns",    True),
    ("sumo-bava",         "amber",   "belt2",    False),
    ("ninja-obsidian",    "purple",  "mask",     True),
    ("guardian-gargoyle", "blue",    "wings",    True),
    ("pa-geode",          "purple",  "crystal",  False),
    ("sensei-stone",      "emerald", "beard",    True),
]

def build():
    os.makedirs(OUT, exist_ok=True)
    for key, accent, feature, narrowed in SPECIES:
        a = hx(ACCENT[accent])
        cv = Canvas(GRID)
        # gargoyle wings sit behind the body
        if feature == "wings":
            feat_wings(cv, a)
        draw_body(cv, a)
        draw_belt(cv)
        if feature == "belt2":  # sumo: extra thick belt
            cv.rect(6, 18, 25, 22, BELT); cv.rect(6, 18, 25, 18, shade(BELT, 1.2))
        draw_eyes(cv, narrowed)
        fn = FEATURES.get(feature)
        if fn and feature != "wings":
            fn(cv, a)
        out, w, h = cv.upscale(SCALE)
        write_png(os.path.join(OUT, key + ".png"), out, w, h)
        print("wrote", key + ".png", f"({w}x{h})")

if __name__ == "__main__":
    build()
