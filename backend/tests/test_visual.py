import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from PIL import Image, ImageDraw

from core.util.compose_util_v3 import MAX_TW, _fit_title, _line_h, _wrap

bg = Image.new("RGBA", (1080, 1350), (0,0,0,0))
draw = ImageDraw.Draw(bg)

title = "COMENTE\nFONTE"
body = "E eu te envio o protocolo da Tecnologia Sonora que tira o seu cérebro do modo sobrevivência e acessa a coerência."

T_START, T_MIN = 78, 38
B_SIZE = 36
BOTTOM_PAD = 88
Y_MIN = int(1350 * 0.64)
MAX_ZONE = 1350 - Y_MIN - BOTTOM_PAD

t_sz = _fit_title(draw, title, T_START, T_MIN)

def local_block_h(ts, bs):
    lht = _line_h(draw, ts) * 1.20
    lhb = _line_h(draw, bs) * 1.65
    nt  = sum(max(len(_wrap(draw, ln, ts, MAX_TW)), 1) for ln in title.split("\n"))
    nb  = sum(max(len(_wrap(draw, ln, bs, MAX_TW)), 1) for ln in body.split("\n")) if body.strip() else 0
    return int(nt * lht), int(nb * lhb)

th, bh = local_block_h(t_sz, B_SIZE)
GAP = 22
print(f"th={th}, bh={bh}")

b_sz = B_SIZE
while (th + bh + GAP) > MAX_ZONE and b_sz > 26:
    b_sz -= 1
    _, bh = local_block_h(t_sz, b_sz)

while (th + bh + GAP) > MAX_ZONE and t_sz > T_MIN:
    t_sz -= 2
    th, bh = local_block_h(t_sz, b_sz)
print(f"After loops: th={th}, bh={bh}, t_sz={t_sz}, b_sz={b_sz}")

y_raw = 1350 - th - bh - GAP - BOTTOM_PAD
y = float(max(y_raw, Y_MIN))

lh = _line_h(draw, b_sz) * 1.65
max_y = float(1350 - BOTTOM_PAD)

cy = y + th + GAP
for raw in body.split("\n"):
    wrapped = _wrap(draw, raw, b_sz, MAX_TW)
    for ln_segs in wrapped:
        print(f"Line: '{''.join(w for w, s in ln_segs)}', cy={cy:.1f}, cy+lh={(cy+lh):.1f}")
        if cy + lh > max_y + 15:
            print(f"  --> TRUNCATED! ({cy+lh} > {max_y+15})")
        cy += lh
