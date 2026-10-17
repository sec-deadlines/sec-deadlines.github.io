#!/usr/bin/env python3
"""Generate a 1200x630 OG image for sec-deadlines.github.io.

Reproduces the site's brand: dark #333 top strip, red #e74c3c accent,
hourglass motif (from the favicon), white light ground.
Pillow-only, no external deps beyond a TTF font.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
DARK = (51, 51, 51)        # #333
RED = (231, 76, 60)        # #e74c3c
WHITE = (255, 255, 255)
GREY = (128, 128, 128)     # #808080

def find_font(size):
    for p in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def draw_hourglass(d, cx, cy, scale, color):
    """Draw the favicon's hourglass silhouette centered at (cx, cy)."""
    # bar thickness and glass width scale with `scale`
    bar_h = int(18 * scale)
    glass_w = int(150 * scale)
    glass_h = int(210 * scale)
    neck = int(34 * scale)
    # top bar
    d.rounded_rectangle([cx - glass_w, cy - glass_h, cx + glass_w, cy - glass_h + bar_h],
                        radius=bar_h // 2, fill=color)
    # bottom bar
    d.rounded_rectangle([cx - glass_w, cy + glass_h - bar_h, cx + glass_w, cy + glass_h],
                        radius=bar_h // 2, fill=color)
    # glass walls: two curved pillars narrowing at the neck
    # left wall
    d.polygon([
        (cx - glass_w, cy - glass_h + bar_h),
        (cx - glass_w, cy - glass_h + bar_h + int(40 * scale)),
        (cx - neck, cy),
        (cx - neck, cy),
        (cx - glass_w, cy + glass_h - bar_h - int(40 * scale)),
        (cx - glass_w, cy + glass_h - bar_h),
        (cx - neck, cy + glass_h - bar_h),
        (cx - neck, cy),
    ], fill=color)
    # right wall (mirror)
    d.polygon([
        (cx + glass_w, cy - glass_h + bar_h),
        (cx + glass_w, cy - glass_h + bar_h + int(40 * scale)),
        (cx + neck, cy),
        (cx + neck, cy),
        (cx + glass_w, cy + glass_h - bar_h - int(40 * scale)),
        (cx + glass_w, cy + glass_h - bar_h),
        (cx + neck, cy + glass_h - bar_h),
        (cx + neck, cy),
    ], fill=color)
    # top sand: fill lower part of upper bulb
    d.polygon([
        (cx - glass_w + int(6 * scale), cy - glass_h + bar_h + int(70 * scale)),
        (cx + glass_w - int(6 * scale), cy - glass_h + bar_h + int(70 * scale)),
        (cx + neck, cy),
        (cx - neck, cy),
    ], fill=color)
    # bottom sand pile: triangle pointing up
    d.polygon([
        (cx - glass_w + int(6 * scale), cy + glass_h - bar_h),
        (cx + glass_w - int(6 * scale), cy + glass_h - bar_h),
        (cx, cy + glass_h - bar_h - int(90 * scale)),
    ], fill=color)

def main():
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    # dark top strip (brand)
    d.rectangle([0, 0, W, 90], fill=DARK)
    # red accent bar under the strip
    d.rectangle([0, 90, W, 100], fill=RED)

    # hourglass motif, left-of-center, large
    draw_hourglass(d, 300, 360, 1.6, DARK)

    # title text
    title_font = find_font(50)
    sub_font = find_font(30)
    small_font = find_font(24)

    title = "Security & Privacy"
    title2 = "Conference Deadlines"
    sub = "Top Security, Privacy & Crypto deadlines"
    small = "sec-deadlines.github.io"

    d.text((450, 205), title, font=title_font, fill=DARK)
    d.text((450, 275), title2, font=title_font, fill=RED)
    d.text((450, 375), sub, font=sub_font, fill=GREY)
    d.text((450, 460), small, font=small_font, fill=GREY)

    # red accent underline under title
    d.rectangle([450, 350, 450 + 200, 356], fill=RED)

    img.save("static/img/og-image.png")
    print("wrote static/img/og-image.png", img.size)

if __name__ == "__main__":
    main()
