"""Генерирует verus-icon.ico — красивая neon-иконка дашборда Verus.
Запускается вручную (или из build-flash.ps1). Стандартная Pillow."""
import sys, io, math
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from PIL import Image, ImageDraw, ImageFilter
import os, pathlib

OUT_ICO = pathlib.Path(__file__).parent / 'verus-icon.ico'
OUT_PNG = pathlib.Path(__file__).parent / 'verus-icon-256.png'

# Палитра Verus
BG_TOP    = (10, 14, 23)     # #0A0E17 — основной фон
BG_GLOW   = (20, 33, 61)     # #14213d — лёгкое свечение в центре
CY        = (34, 211, 238)   # #22d3ee — neon cyan
CY_BRIGHT = (160, 240, 255)
GOLD      = (212, 175, 55)
PURPLE    = (168, 85, 247)


def radial_gradient(size, inner_color, outer_color):
    """Радиальный градиент в квадрате size×size."""
    img = Image.new('RGB', (size, size), outer_color)
    pixels = img.load()
    cx = cy = size / 2
    max_r = size * 0.7  # радиус заполнения градиента
    for y in range(size):
        for x in range(size):
            dx = x - cx
            dy = y - cy
            d = math.sqrt(dx * dx + dy * dy)
            t = min(1.0, d / max_r)
            # smoothstep
            t = t * t * (3 - 2 * t)
            r = int(inner_color[0] * (1 - t) + outer_color[0] * t)
            g = int(inner_color[1] * (1 - t) + outer_color[1] * t)
            b = int(inner_color[2] * (1 - t) + outer_color[2] * t)
            pixels[x, y] = (r, g, b)
    return img


def make_icon(size):
    """Сгенерировать одну иконку нужного размера. Используем оверсэмплинг для антиализинга."""
    OVER = 4
    s = size * OVER
    # Фон — радиальный градиент
    bg = radial_gradient(s, BG_GLOW, BG_TOP)

    # Скруглённые углы (rounded square) — маска
    mask = Image.new('L', (s, s), 0)
    md = ImageDraw.Draw(mask)
    radius = int(s * 0.18)
    md.rounded_rectangle((0, 0, s - 1, s - 1), radius=radius, fill=255)

    # Основной layer для рисования
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    img.paste(bg, (0, 0))

    # Cyber-grid фон (тонкая сетка)
    grid = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    grid_step = s // 8
    grid_color = (34, 211, 238, 28)
    for x in range(0, s, grid_step):
        gd.line((x, 0, x, s), fill=grid_color, width=max(1, OVER // 2))
    for y in range(0, s, grid_step):
        gd.line((0, y, s, y), fill=grid_color, width=max(1, OVER // 2))
    img = Image.alpha_composite(img.convert('RGBA'), grid)

    d = ImageDraw.Draw(img)

    # Внешнее кольцо с лучами (как score-ring дашборда)
    ring_cx, ring_cy = s / 2, s / 2
    ring_outer = int(s * 0.42)
    ring_inner = int(s * 0.36)
    # Лёгкое cyan кольцо
    d.ellipse(
        (ring_cx - ring_outer, ring_cy - ring_outer, ring_cx + ring_outer, ring_cy + ring_outer),
        outline=(34, 211, 238, 100),
        width=max(2, OVER),
    )
    # Активная дуга 3/4
    d.arc(
        (ring_cx - ring_inner, ring_cy - ring_inner, ring_cx + ring_inner, ring_cy + ring_inner),
        start=-90,
        end=200,
        fill=CY,
        width=max(3, int(OVER * 1.5)),
    )

    # Главная буква V — символ Verus
    # Рисуем как два хода — линии от верха к центру и от центра вверх вправо
    v_w = max(4, int(OVER * 3))  # толщина линии
    v_top_y = int(s * 0.30)
    v_bot_y = int(s * 0.68)
    v_left_x = int(s * 0.32)
    v_right_x = int(s * 0.68)
    v_cx = s // 2
    # glow слой
    glow = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    gd2 = ImageDraw.Draw(glow)
    gd2.line((v_left_x, v_top_y, v_cx, v_bot_y), fill=CY, width=v_w + int(OVER * 1.5))
    gd2.line((v_cx, v_bot_y, v_right_x, v_top_y), fill=CY, width=v_w + int(OVER * 1.5))
    # Размытие glow
    glow = glow.filter(ImageFilter.GaussianBlur(radius=int(OVER * 2)))
    img = Image.alpha_composite(img, glow)

    # Основная V — чёткая, поверх glow
    d = ImageDraw.Draw(img)
    d.line((v_left_x, v_top_y, v_cx, v_bot_y), fill=CY_BRIGHT, width=v_w)
    d.line((v_cx, v_bot_y, v_right_x, v_top_y), fill=CY_BRIGHT, width=v_w)

    # Маленькая звезда сверху между ножками V
    star_cx, star_cy = s // 2, int(s * 0.22)
    star_r = int(s * 0.05)
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = star_r if i % 2 == 0 else star_r * 0.45
        pts.append((star_cx + r * math.cos(ang), star_cy + r * math.sin(ang)))
    d.polygon(pts, fill=GOLD)

    # Применяем маску скруглённых углов
    img.putalpha(mask)

    # Уменьшаем до целевого размера
    img = img.resize((size, size), Image.LANCZOS)
    return img


def main():
    # Стандартные размеры для .ico (Windows использует разные в разных контекстах)
    sizes = [16, 32, 48, 64, 128, 256]
    images = []
    for sz in sizes:
        print(f'  Render {sz}x{sz}…', end='', flush=True)
        img = make_icon(sz)
        images.append(img)
        print(' ok')

    # Сохранение в .ico — multi-resolution
    # Pillow saves в .ico с list of (width, height) sizes
    base = images[-1]  # 256
    base.save(
        OUT_ICO,
        format='ICO',
        sizes=[(s, s) for s in sizes],
        append_images=images[:-1],
    )
    print(f'\n✓ {OUT_ICO} — {OUT_ICO.stat().st_size} bytes')

    # Дополнительно PNG 256 — для preview/use в HTML
    base.save(OUT_PNG, format='PNG')
    print(f'✓ {OUT_PNG} — {OUT_PNG.stat().st_size} bytes')


if __name__ == '__main__':
    main()
