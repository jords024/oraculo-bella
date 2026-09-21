#!/usr/bin/env python3
"""
generate_coerencia_raw.py
Gera imagens de background esotéricas premium locais para simular o cache de API (raw-XX.jpg).
Assim, evitamos custos e erros de cota e entregamos uma estética impecável.
"""

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DEST_DIR = Path("C:/Users/julia/Desktop/carrossel-coerencia-cardiaca-fe")
W, H = 1024, 1536

def add_artistic_texture(img, noise_intensity=12, vignette_strength=0.85):
    """Aplica textura de grão de pintura a óleo fina e vinheta mecânica suave."""
    # 1. Grão fino via numpy
    arr = np.array(img, dtype=np.float32)
    noise = np.random.randn(*arr.shape) * noise_intensity
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    noisy_img = Image.fromarray(arr)

    # 2. Vinheta radial escura para chiaroscuro marcante
    vignette = Image.new("L", (W, H), 255)
    draw = ImageDraw.Draw(vignette)

    # Centro da vinheta (meio)
    cx, cy = W // 2, H // 2
    max_radius = math.sqrt(cx**2 + cy**2)

    for r in range(int(max_radius), 0, -8):
        factor = (r / max_radius)
        # Curva de escurecimento acentuada nas bordas
        alpha = int(255 * (1 - (factor ** 2.2) * vignette_strength))
        alpha = max(0, min(255, alpha))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)

    vignette = vignette.filter(ImageFilter.GaussianBlur(60))

    final_img = Image.new("RGBA", (W, H))
    final_img.paste(noisy_img, (0, 0))

    black = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    final_img = Image.composite(final_img, black, vignette)
    return final_img.convert("RGB")

def make_gradient(c1, c2):
    """Cria um degradê vertical básico entre duas cores RGB."""
    base = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(base)
    for y in range(H):
        p = y / H
        r = int(c1[0] * (1 - p) + c2[0] * p)
        g = int(c1[1] * (1 - p) + c2[1] * p)
        b = int(c1[2] * (1 - p) + c2[2] * p)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    return base

def draw_glow_sphere(draw, cx, cy, radius, color, blur=50):
    """Desenha uma esfera brilhante translúcida que simula energia quântica/nebulosa."""
    sphere = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sphere)
    s_draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    sphere = sphere.filter(ImageFilter.GaussianBlur(blur))
    return sphere

# ── SELEÇÃO E DESIGN DOS BACKGROUNDS ──────────────────────────────────────────

def generate_slide_01():
    """Slide 01 (Capa): Torus de luz eletromagnética e energia do peito, fundo cósmico."""
    print("Gerando raw-01.jpg (Capa - Torus Quântico)...")
    # Fundo roxo profundo a azul escuro
    base = make_gradient((12, 6, 26), (4, 4, 16))

    # Nebulosas de fundo
    glow1 = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 200, 320, (120, 20, 200, 80), blur=120)
    glow2 = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 300, 240, (0, 150, 255, 60), blur=100)

    base = Image.alpha_composite(base.convert("RGBA"), glow1)
    base = Image.alpha_composite(base, glow2)

    # Desenhar linhas de energia toroidais
    torus_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(torus_overlay)

    cx, cy = W//2, H//2 + 250
    # Círculos concêntricos e elipses
    for i in range(1, 10):
        r_x = i * 45
        r_y = i * 22
        # Linhas douradas finas com opacidade variável
        opacity = int(220 * (1 - (i/10)))
        t_draw.ellipse([cx - r_x, cy - r_y, cx + r_x, cy + r_y], outline=(220, 160, 30, opacity), width=2)
        # Elipses verticais representando o fluxo do campo
        t_draw.ellipse([cx - r_y, cy - r_x, cx + r_y, cy + r_x], outline=(0, 180, 240, opacity // 2), width=1)

    torus_overlay = torus_overlay.filter(ImageFilter.GaussianBlur(6))
    base = Image.alpha_composite(base, torus_overlay)

    # Centro brilhante do peito
    core_glow = draw_glow_sphere(ImageDraw.Draw(base), cx, cy, 60, (255, 230, 150, 255), blur=25)
    base = Image.alpha_composite(base, core_glow)

    final = add_artistic_texture(base.convert("RGB"))
    final.save(DEST_DIR / "raw-01.jpg", "JPEG", quality=95)

def generate_slide_02():
    """Slide 02: Descida - Ondas frias e vazias de azul marinho, silhueta espiritual em tensão."""
    print("Gerando raw-02.jpg (Descida)...")
    # Fundo azul marinho escuro quase preto
    base = make_gradient((6, 12, 22), (2, 3, 8))

    # Brilho azul gélido no fundo
    glow = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 100, 280, (0, 80, 180, 50), blur=140)
    base = Image.alpha_composite(base.convert("RGBA"), glow)

    # Ondas de frio (estática linear)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    o_draw = ImageDraw.Draw(overlay)
    for y in range(H//2, H - 200, 15):
        opacity = int(40 * (1 - abs((y - H//2 - 200) / 400)))
        o_draw.line([(0, y), (W, y)], fill=(0, 140, 220, opacity), width=1)

    overlay = overlay.filter(ImageFilter.GaussianBlur(8))
    base = Image.alpha_composite(base, overlay)

    # Núcleo gélido fraco
    core = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 250, 50, (140, 180, 255, 100), blur=40)
    base = Image.alpha_composite(base, core)

    final = add_artistic_texture(base.convert("RGB"), noise_intensity=10, vignette_strength=0.90)
    final.save(DEST_DIR / "raw-02.jpg", "JPEG", quality=95)

def generate_slide_03():
    """Slide 03: Nomeação - Velhos dogmas, raiva, luzes rubi e catedral geométrica escura."""
    print("Gerando raw-03.jpg (Nomeação - Catedral de Dogmas)...")
    # Fundo cinza carvão e vermelho-tijolo profundo
    base = make_gradient((18, 6, 8), (4, 2, 2))

    # Brilho rubi esotérico
    glow = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 200, 250, (180, 10, 15, 60), blur=110)
    base = Image.alpha_composite(base.convert("RGBA"), glow)

    # Desenho esotérico abstrato (Arcos e linhas angulares)
    lines_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    l_draw = ImageDraw.Draw(lines_overlay)

    cx = W // 2
    # Cúpula de catedral em linhas
    for i in range(1, 6):
        r_x = i * 70
        r_y = i * 140
        opacity = int(120 * (1 - (i/6)))
        # Arcos góticos apontados
        l_draw.arc([cx - r_x, H//2 - r_y + 400, cx + r_x, H//2 + r_y + 400], 180, 360, fill=(180, 30, 40, opacity), width=2)
        # Linhas radiais saindo do centro
        angle = math.radians(45 + i*15)
        lx = int(cx + 400 * math.cos(angle))
        ly = int(H//2 + 250 + 400 * math.sin(angle))
        l_draw.line([(cx, H//2 + 250), (lx, ly)], fill=(200, 50, 40, opacity // 2), width=1)
        l_draw.line([(cx, H//2 + 250), (W - lx, ly)], fill=(200, 50, 40, opacity // 2), width=1)

    lines_overlay = lines_overlay.filter(ImageFilter.GaussianBlur(5))
    base = Image.alpha_composite(base, lines_overlay)

    final = add_artistic_texture(base.convert("RGB"), noise_intensity=12, vignette_strength=0.92)
    final.save(DEST_DIR / "raw-03.jpg", "JPEG", quality=95)

def generate_slide_07():
    """Slide 07: Ascensão - Alinhamento, amanhecer dourado estourado rasgando as nuvens escuras."""
    print("Gerando raw-07.jpg (Ascensão - Alinhamento e Luz)...")
    # Fundo azul royal escuro para dourado solar
    base = make_gradient((10, 15, 38), (5, 5, 12))

    # Grande amanhecer na parte inferior (sol nascente)
    glow_gold = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 350, 350, (235, 170, 40, 210), blur=90)
    glow_white = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 350, 180, (255, 245, 220, 255), blur=40)

    base = Image.alpha_composite(base.convert("RGBA"), glow_gold)
    base = Image.alpha_composite(base, glow_white)

    # Raios de luz verticais subindo
    rays = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(rays)
    for x in range(W//2 - 250, W//2 + 250, 40):
        # Linhas de raios de sol divergentes
        opacity = int(70 * (1 - abs((x - W//2) / 250)))
        dx = (x - W//2) * 1.5
        r_draw.line([(W//2, H//2 + 350), (W//2 + dx, H//2 - 100)], fill=(255, 220, 130, opacity), width=8)

    rays = rays.filter(ImageFilter.GaussianBlur(25))
    base = Image.alpha_composite(base, rays)

    final = add_artistic_texture(base.convert("RGB"), noise_intensity=9, vignette_strength=0.75)
    final.save(DEST_DIR / "raw-07.jpg", "JPEG", quality=95)

def generate_slide_08():
    """Slide 08: Cristalização - Geometria Sagrada perfeita dourada refletida em águas quânticas."""
    print("Gerando raw-08.jpg (Cristalização - Geometria Sagrada)...")
    # Fundo marrom-âmbar e dourado escuro profundo
    base = make_gradient((20, 14, 5), (6, 4, 2))

    # Brilho central esotérico dourado/bronze
    glow = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 250, 280, (200, 140, 20, 100), blur=100)
    base = Image.alpha_composite(base.convert("RGBA"), glow)

    # Desenhar Flor da Vida ou Geometria Sagrada concêntrica
    geo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(geo)
    cx, cy = W//2, H//2 + 250

    # Círculos perfeitos que se cruzam
    for i in range(1, 6):
        r = i * 55
        opacity = int(180 * (1 - (i/6)))
        # Círculo central
        g_draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(225, 175, 40, opacity), width=2)

    # Pétalas geométricas em estrela (seis eixos)
    for a in range(0, 360, 60):
        angle = math.radians(a)
        offset_r = 110
        px = int(cx + offset_r * math.cos(angle))
        py = int(cy + offset_r * math.sin(angle))
        g_draw.ellipse([px - 110, py - 110, px + 110, py + 110], outline=(225, 175, 40, 60), width=1)

    geo = geo.filter(ImageFilter.GaussianBlur(4))
    base = Image.alpha_composite(base, geo)

    # Estrelas/partículas quânticas brilhando
    stars = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(stars)
    import random
    random.seed(42) # determinístico
    for _ in range(35):
        sx = random.randint(cx - 300, cx + 300)
        sy = random.randint(cy - 200, cy + 200)
        sz = random.randint(3, 8)
        s_draw.ellipse([sx - sz, sy - sz, sx + sz, sy + sz], fill=(255, 235, 180, 160))

    stars = stars.filter(ImageFilter.GaussianBlur(1))
    base = Image.alpha_composite(base, stars)

    final = add_artistic_texture(base.convert("RGB"), noise_intensity=10, vignette_strength=0.82)
    final.save(DEST_DIR / "raw-08.jpg", "JPEG", quality=95)

def generate_slide_10():
    """Slide 10: CTA Fixo - Portal monumental dourado de luz hipnótica pura e brilhante."""
    print("Gerando raw-10.jpg (Portal Dourado)...")
    # Fundo preto para âmbar/laranja
    base = make_gradient((12, 6, 2), (2, 1, 0))

    # Brilho monumental do portal de fundo
    glow1 = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 100, 350, (230, 130, 20, 160), blur=110)
    glow2 = draw_glow_sphere(ImageDraw.Draw(base), W//2, H//2 + 100, 180, (255, 220, 100, 255), blur=50)

    base = Image.alpha_composite(base.convert("RGBA"), glow1)
    base = Image.alpha_composite(base, glow2)

    # Estrutura física do portal (Colunas e Arco monumental)
    portal = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(portal)

    cx = W // 2
    # Desenhar arco portal brilhante
    for w_thick in range(4, 0, -1):
        opacity = int(255 * (w_thick / 4))
        p_draw.ellipse([cx - 200, H//2 - 100, cx + 200, H//2 + 300], outline=(255, 200, 50, opacity), width=w_thick * 2)
        # Linhas de pilares nas laterais
        p_draw.line([(cx - 200, H//2 + 100), (cx - 200, H)], fill=(255, 200, 50, opacity), width=w_thick * 2)
        p_draw.line([(cx + 200, H//2 + 100), (cx + 200, H)], fill=(255, 200, 50, opacity), width=w_thick * 2)

    portal = portal.filter(ImageFilter.GaussianBlur(8))
    base = Image.alpha_composite(base, portal)

    # Núcleo de luz hipnótica concentrado no centro do portal
    core = draw_glow_sphere(ImageDraw.Draw(base), cx, H//2 + 100, 80, (255, 255, 255, 255), blur=20)
    base = Image.alpha_composite(base, core)

    final = add_artistic_texture(base.convert("RGB"), noise_intensity=11, vignette_strength=0.88)
    final.save(DEST_DIR / "raw-10.jpg", "JPEG", quality=95)

# ── EXECUTOR PRINCIPAL ────────────────────────────────────────────────────────

def main():
    print(f"Iniciando a geração de Raw Backgrounds em: {DEST_DIR.resolve()}")
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    generate_slide_01()
    generate_slide_02()
    generate_slide_03()
    generate_slide_07()
    generate_slide_08()
    generate_slide_10()
    print("\n✓ Todos os 6 backgrounds locais (Raw Cache) gerados com sucesso!")

if __name__ == "__main__":
    main()
