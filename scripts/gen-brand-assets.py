#!/usr/bin/env python3
"""Generate premium branded icons + Open Graph share card for Read the Room.

Palette matches the app (src/index.css): warm cream page, espresso ink,
amber/terracotta accent. Replaces the placeholder blue-circle PWA icons and
adds a proper 1200x630 social share card so link previews look premium.
"""
import os
from PIL import Image, ImageDraw, ImageFont

FONTS = "/home/ubuntu/fonts"
OUT = os.path.join(os.path.dirname(__file__), "..", "public")

# Brand palette (from src/index.css)
PAGE = (251, 247, 240)      # --page cream
CARD = (244, 236, 223)      # --card
INK = (42, 35, 32)          # --ink espresso
TEXT_DIM = (156, 145, 132)  # --text-dim
AMBER = (232, 162, 74)      # --accent-strong
TERRA = (199, 125, 58)      # --accent
DEEP = (154, 90, 34)        # --accent-ink
ESPRESSO = (32, 27, 24)     # slightly darker than ink for depth


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vgrad(size, top, bottom):
    """Vertical-ish diagonal gradient."""
    w, h = size
    base = Image.new("RGB", size, top)
    top_img = Image.new("RGB", size, bottom)
    mask = Image.new("L", size)
    md = mask.load()
    for y in range(h):
        for x in range(w):
            # diagonal blend
            t = (x / w * 0.35 + y / h * 0.65)
            md[x, y] = int(max(0, min(1, t)) * 255)
    base.paste(top_img, (0, 0), mask)
    return base


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return m


def draw_bubble(draw, cx, cy, w, h, fill, dot_fill):
    """A rounded speech bubble with a tail, centered at (cx,cy)."""
    left, top = cx - w // 2, cy - h // 2
    right, bottom = cx + w // 2, cy + h // 2
    r = int(h * 0.32)
    draw.rounded_rectangle([left, top, right, bottom], radius=r, fill=fill)
    # tail (lower-left)
    tail_x = left + int(w * 0.24)
    ty = bottom - int(h * 0.02)
    draw.polygon(
        [(tail_x, ty - 2), (tail_x + int(w * 0.20), ty - 2),
         (tail_x - int(w * 0.02), bottom + int(h * 0.30))],
        fill=fill,
    )
    # three dots (conversation / reading the room)
    dot_r = int(h * 0.085)
    gap = int(w * 0.20)
    for i in (-1, 0, 1):
        draw.ellipse(
            [cx + i * gap - dot_r, cy - dot_r, cx + i * gap + dot_r, cy + dot_r],
            fill=dot_fill,
        )


def make_icon(px, maskable=False):
    """Rounded-square app icon on an amber gradient with a cream bubble mark."""
    ss = 4  # supersample
    size = (px * ss, px * ss)
    img = vgrad(size, lerp(AMBER, (245, 190, 120), 0.15), lerp(TERRA, DEEP, 0.25))
    d = ImageDraw.Draw(img)
    # subtle top-left sheen
    sheen = Image.new("RGBA", size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen)
    sd.ellipse([-px * ss * 0.3, -px * ss * 0.4, px * ss * 0.9, px * ss * 0.7],
               fill=(255, 255, 255, 28))
    img = Image.alpha_composite(img.convert("RGBA"), sheen).convert("RGB")
    d = ImageDraw.Draw(img)
    # bubble mark — smaller safe zone if maskable
    scale = 0.52 if maskable else 0.62
    bw = int(size[0] * scale)
    bh = int(bw * 0.82)
    draw_bubble(d, size[0] // 2, int(size[1] * 0.46), bw, bh,
                fill=PAGE, dot_fill=DEEP)
    img = img.resize((px, px), Image.LANCZOS)
    if not maskable:
        # rounded corners for the standard icon
        radius = int(px * 0.22)
        out = Image.new("RGBA", (px, px), (0, 0, 0, 0))
        out.paste(img, (0, 0), rounded_mask((px, px), radius))
        return out
    return img.convert("RGBA")


def draw_growth_chart(img, box, ss):
    """A premium ascending bar chart with a rising trend line + arrow,
    evoking sales growth. `box` = (x0, y0, x1, y1) in supersampled coords."""
    x0, y0, x1, y1 = box
    d = ImageDraw.Draw(img)

    # soft rounded panel behind the chart
    panel = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pad = 34 * ss
    pd.rounded_rectangle([x0 - pad, y0 - pad, x1 + pad, y1 + pad],
                         radius=40 * ss, fill=(255, 255, 255, 150))
    img.alpha_composite(panel)
    d = ImageDraw.Draw(img)

    baseline = y1
    chart_h = y1 - y0
    n = 5
    heights = [0.26, 0.40, 0.55, 0.74, 1.0]
    gap = int((x1 - x0) * 0.045)
    bw = int(((x1 - x0) - gap * (n - 1)) / n)

    tops = []
    for i, hf in enumerate(heights):
        bx0 = x0 + i * (bw + gap)
        bx1 = bx0 + bw
        bh = int(chart_h * hf)
        bt = baseline - bh
        tops.append((bx0 + bw // 2, bt))
        # vertical amber gradient per bar
        bar = Image.new("RGBA", (bw, max(1, bh)), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bar)
        for yy in range(bh):
            t = yy / max(1, bh)
            c = lerp((245, 193, 128), TERRA, t)
            bd.line([(0, yy), (bw, yy)], fill=c + (255,))
        # rounded-top mask
        m = Image.new("L", (bw, max(1, bh)), 0)
        md = ImageDraw.Draw(m)
        md.rounded_rectangle([0, 0, bw, bh + 20 * ss], radius=min(bw // 2, 16 * ss), fill=255)
        img.paste(bar, (bx0, bt), m)

    d = ImageDraw.Draw(img)
    # rising trend line just above the bar tops
    pts = [(cx, ty - 22 * ss) for (cx, ty) in tops]
    d.line(pts, fill=DEEP, width=8 * ss, joint="curve")
    for (px, py) in pts:
        r = 11 * ss
        d.ellipse([px - r, py - r, px + r, py + r], fill=PAGE, outline=DEEP, width=6 * ss)
    # arrowhead extending up-right past the last node
    lx, ly = pts[-1]
    ax, ay = lx + 46 * ss, ly - 46 * ss
    d.line([(lx, ly), (ax, ay)], fill=DEEP, width=8 * ss)
    ah = 26 * ss
    d.polygon([(ax + ah * 0.15, ay - ah * 0.1),
               (ax - ah, ay - ah * 0.15),
               (ax + ah * 0.1, ay + ah)], fill=DEEP)


def make_og():
    """1200x630 social share card."""
    ss = 2
    W, H = 1200 * ss, 630 * ss
    img = Image.new("RGB", (W, H), PAGE)
    d = ImageDraw.Draw(img)

    # warm top band + soft amber glow blob on the right
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W * 0.58, -H * 0.35, W * 1.25, H * 0.9],
               fill=(232, 162, 74, 40))
    gd.ellipse([W * 0.66, H * 0.25, W * 1.2, H * 1.25],
               fill=(199, 125, 58, 30))
    img = Image.alpha_composite(img.convert("RGBA"), glow)
    d = ImageDraw.Draw(img)

    pad = int(72 * ss)
    left_max = int(W * 0.585)         # text column right edge
    col_w = left_max - pad            # available text width

    # commercial growth chart on the right
    cx0 = int(W * 0.635)
    draw_growth_chart(img, (cx0, int(H * 0.30), W - pad - 34 * ss, int(H * 0.74)), ss)

    # brand row: mini icon + wordmark
    icon = make_icon(92 * ss).convert("RGBA")
    img.paste(icon, (pad, pad), icon)
    fw = font("Inter-Bold.ttf", 29 * ss)
    d.text((pad + 92 * ss + 24 * ss, pad + 30 * ss), "READ THE ROOM",
           font=fw, fill=DEEP)

    # headline — auto-fit both lines to the text column
    def fit(text, start):
        for s in range(start, 40 * ss, -2 * ss):
            f = font("Inter-ExtraBold.ttf", s)
            bb = d.textbbox((0, 0), text, font=f)
            if bb[2] - bb[0] <= col_w:
                return f, s
        return font("Inter-ExtraBold.ttf", 40 * ss), 40 * ss

    l1, l2 = "Read any room.", "Close every deal."
    f1, s1 = fit(l1, 104 * ss)
    f2, s2 = fit(l2, 104 * ss)
    hs = min(s1, s2)                  # use one consistent size
    f1 = font("Inter-ExtraBold.ttf", hs)
    y0 = int(H * 0.29)
    line_gap = int(hs * 1.06)
    d.text((pad, y0), l1, font=f1, fill=INK)
    d.text((pad, y0 + line_gap), l2, font=f1, fill=DEEP)

    # subhead — fit within the text column so it clears the badge
    sub = "Diagnostic sales training for Devin"
    ssz = 37 * ss
    while ssz > 22 * ss:
        fsub = font("Inter-Medium.ttf", ssz)
        bb = d.textbbox((0, 0), sub, font=fsub)
        if bb[2] - bb[0] <= col_w:
            break
        ssz -= 1 * ss
    d.text((pad, y0 + line_gap * 2 + int(hs * 0.30)), sub,
           font=fsub, fill=TEXT_DIM)

    # pill chips
    fchip = font("Inter-SemiBold.ttf", 27 * ss)
    chips = ["375 scenarios", "Spaced repetition", "Read the buyer"]
    x = pad
    y = int(H * 0.845)
    for c in chips:
        bbox = d.textbbox((0, 0), c, font=fchip)
        tw = bbox[2] - bbox[0]
        cw = tw + 44 * ss
        ch = 56 * ss
        d.rounded_rectangle([x, y, x + cw, y + ch], radius=ch // 2,
                            fill=CARD, outline=lerp(CARD, TERRA, 0.25), width=ss)
        d.text((x + 22 * ss, y + 13 * ss), c, font=fchip, fill=DEEP)
        x += cw + 20 * ss

    return img.convert("RGB").resize((1200, 630), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    # PWA + favicon icons
    make_icon(512).save(os.path.join(OUT, "pwa-512x512.png"))
    make_icon(192).save(os.path.join(OUT, "pwa-192x192.png"))
    make_icon(512, maskable=True).save(os.path.join(OUT, "pwa-maskable-512x512.png"))
    # apple-touch-icon should be opaque (no alpha) — flatten onto amber
    at = make_icon(180).convert("RGBA")
    flat = Image.new("RGB", (180, 180), TERRA)
    flat.paste(at, (0, 0), at)
    flat.save(os.path.join(OUT, "apple-touch-icon.png"))
    # favicon.ico (multi-size) from the brand icon
    ico = make_icon(256).convert("RGBA")
    ico.save(os.path.join(OUT, "favicon.ico"),
             sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    # Open Graph share card
    make_og().save(os.path.join(OUT, "og-image.png"))
    print("Wrote pwa-512x512, pwa-192x192, pwa-maskable-512x512, "
          "apple-touch-icon, favicon.ico, og-image")


if __name__ == "__main__":
    main()
