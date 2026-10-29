#!/usr/bin/env python3
"""
make_sprites.py — original pixel art for "The Caravan Lockboxes" (Allais).

Everything here is drawn from code: no downloads, no external images, no
copyrighted game art. The style is genre mood only (desert caravan, raider
country), built from geometric shapes and a deliberately small palette.

Outputs (all regenerated from scratch on every run):

    32 x 32 RGBA sprites, transparent background, 1 px dark outline:
        docs/assets/sprites/allais/chest_a.png    sealed steel strongbox
        docs/assets/sprites/allais/chest_b.png    battered crate, green seam
        docs/assets/sprites/allais/chest_c.png    single canvas satchel
        docs/assets/sprites/allais/chest_d.png    double-strapped satchel
        docs/assets/sprites/allais/trader.png     caravan trader, arms folded
        docs/assets/sprites/allais/raider.png     raider with a pipe rifle
        docs/assets/sprites/allais/icon_caps.png  bottle-cap currency

    640 x 360 card (2x of a 320 x 180 pixel canvas):
        docs/assets/cards/hub_allais.png

    1280 x 720 background (4x of the same 320 x 180 pixel canvas):
        docs/assets/backgrounds/allais_bg.png

Drawing approach
----------------
* Sprites are drawn directly on a 32 x 32 grid with Pillow rectangles,
  polygons and Bresenham lines. Nothing is anti-aliased: one image pixel is
  one art pixel. A single automatic pass grows the alpha mask by one pixel
  and paints the ring in INK, which gives every silhouette a deliberate
  1 px dark outline without hand-tracing it.
* Scenes are composed on a 320 x 180 canvas, then enlarged with NEAREST to
  640 x 360 (card) and 1280 x 720 (background). Gradients are dithered with
  a 4 x 4 Bayer matrix between a handful of palette stops, so the result
  keeps the pixel-art look and compresses tiny.
* A vignette is quantised to a few alpha steps and Bayer-dithered before
  enlargement; the edges therefore stay dark and low-contrast under white UI
  text, and the PNG does not pay for a smooth 24-bit gradient.
* No text is drawn anywhere. Palette values are listed below and are the
  only colours used, apart from the quantised vignette/shadow overlays.

Determinism: no randomness, no timestamps, no PNG metadata (no tIME, no
text chunks), fixed zlib compression. Running twice yields identical bytes.

Run from the repository root:   python3 tools/make_sprites.py
"""

from __future__ import annotations

import hashlib
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "docs" / "assets" / "sprites" / "allais"
CARD_DIR = ROOT / "docs" / "assets" / "cards"
BG_DIR = ROOT / "docs" / "assets" / "backgrounds"
WASTELAND_DIR = ROOT / "docs" / "assets" / "sprites" / "wasteland"

# ---------------------------------------------------------------------------
# Palette — a limited, shared set. Sprites use one outline colour and at most
# three tones per material; scenes reuse the same desert/steel/brass family.
# ---------------------------------------------------------------------------

INK = (20, 22, 26, 255)          # near-black outline, never pure black

STEEL_D = (74, 85, 96, 255)
STEEL = (124, 138, 150, 255)
STEEL_L = (170, 182, 192, 255)
STEEL_H = (205, 214, 221, 255)

BRASS_D = (122, 90, 36, 255)
BRASS = (201, 162, 39, 255)
BRASS_L = (232, 205, 106, 255)

WOOD_D = (74, 53, 36, 255)
WOOD = (123, 90, 58, 255)
WOOD_L = (161, 122, 78, 255)
WOOD_H = (190, 154, 104, 255)

ROPE_D = (138, 116, 78, 255)
ROPE = (194, 168, 120, 255)
ROPE_L = (216, 196, 152, 255)

GLOW_D = (58, 92, 52, 255)
GLOW = (127, 191, 90, 255)
GLOW_L = (168, 224, 122, 255)

CANVAS_D = (107, 98, 71, 255)
CANVAS = (154, 143, 104, 255)
CANVAS_L = (192, 180, 138, 255)
CANVAS_H = (214, 203, 165, 255)

LEATHER_D = (91, 58, 40, 255)
LEATHER = (138, 90, 60, 255)
LEATHER_L = (176, 122, 82, 255)
LEATHER_H = (198, 148, 103, 255)

SAND_D = (156, 135, 102, 255)
SAND = (201, 180, 141, 255)

COAT_D = (110, 91, 66, 255)
COAT = (168, 147, 114, 255)
COAT_L = (198, 180, 146, 255)

SKIN_D = (146, 107, 76, 255)
SKIN = (193, 151, 112, 255)
SKIN_L = (216, 178, 137, 255)

SCARF_D = (108, 74, 56, 255)
SCARF = (151, 108, 81, 255)

CHAR = (34, 36, 42, 255)
CHAR_D = (24, 25, 30, 255)
FACE = (19, 18, 22, 255)
RUST_D = (86, 46, 36, 255)
RUST = (124, 66, 50, 255)
RUST_L = (158, 88, 64, 255)
RED = (218, 58, 48, 255)
RED_H = (255, 120, 102, 255)

SILVER_D = (111, 122, 130, 255)
SILVER = (185, 194, 201, 255)
SILVER_L = (226, 232, 236, 255)

# Wasteland Odds additions: Securitron screen phosphor and the cap colours.
SCREEN_D = (16, 46, 20, 255)
SCREEN = (40, 120, 44, 255)
SCREEN_L = (150, 255, 140, 255)
SUNSET_D = (176, 120, 30, 255)
SUNSET = (240, 190, 60, 255)
STAR_BLUE = (77, 163, 255, 255)
CHIP_W = (232, 226, 210, 255)

# Scene-only tones (opaque RGB; scenes have no alpha channel).
S_SKY = [
    (24, 23, 38), (42, 33, 48), (74, 45, 54), (117, 60, 57),
    (160, 82, 60), (193, 115, 71), (214, 150, 94), (224, 177, 121),
]
S_DUST = [(92, 72, 59), (120, 94, 70), (150, 117, 85), (177, 142, 102)]
S_SAND = [(122, 96, 68), (150, 118, 83), (176, 141, 100), (198, 162, 116)]
S_ROAD = [(52, 47, 44), (66, 59, 53), (82, 73, 64), (101, 90, 78)]
S_TOWER = (48, 40, 40)
S_TOWER_D = (34, 29, 30)
S_FIRE = (222, 126, 58)


# ---------------------------------------------------------------------------
# Small pixel-art toolkit
# ---------------------------------------------------------------------------

def new_sprite() -> Image.Image:
    return Image.new("RGBA", (32, 32), (0, 0, 0, 0))


def rect(im, x0, y0, x1, y1, colour):
    """Inclusive rectangle, no anti-aliasing."""
    ImageDraw.Draw(im).rectangle([x0, y0, x1, y1], fill=colour)


def px(im, x, y, colour):
    im.putpixel((x, y), colour)


def line(im, points, colour, width=1):
    """Pixel line through integer points (Pillow draws aliased by default)."""
    ImageDraw.Draw(im).line(points, fill=colour, width=width)


def poly(im, points, colour):
    ImageDraw.Draw(im).polygon(points, fill=colour)


def outline(im: Image.Image, colour=INK) -> Image.Image:
    """Paint a 1 px exterior ring around the opaque silhouette."""
    alpha = im.getchannel("A")
    grown = alpha.filter(ImageFilter.MaxFilter(3))
    ring = ImageChops.subtract(grown, alpha)
    im.paste(Image.new("RGBA", im.size, colour), (0, 0), ring)
    return im


def star(im, cx, cy, r_out, r_in, colour, points=4, start=-math.pi / 2):
    vertices = []
    for i in range(points * 2):
        angle = start + i * math.pi / points
        r = r_out if i % 2 == 0 else r_in
        vertices.append((cx + math.cos(angle) * r,
                         cy + math.sin(angle) * r))
    poly(im, vertices, colour)


# ---------------------------------------------------------------------------
# Sprites (32 x 32)
# ---------------------------------------------------------------------------

def sprite_chest_a() -> Image.Image:
    """Sealed steel strongbox: cool steel body, brass lock, clean edges."""
    im = new_sprite()

    # Feet first, so the body sits on top of them.
    rect(im, 7, 26, 10, 28, STEEL_D)
    rect(im, 21, 26, 24, 28, STEEL_D)

    # Lid (slightly overhangs the body) and body.
    rect(im, 6, 10, 25, 10, STEEL_L)
    rect(im, 5, 11, 26, 14, STEEL_L)
    rect(im, 5, 12, 26, 13, STEEL)
    line(im, [(6, 11), (25, 11)], STEEL_H)
    line(im, [(5, 14), (26, 14)], STEEL_D)

    rect(im, 6, 15, 25, 26, STEEL)
    line(im, [(6, 15), (25, 15)], STEEL_D)      # lid/body seam
    line(im, [(7, 16), (24, 16)], STEEL_L)      # top bevel
    rect(im, 7, 17, 8, 25, STEEL_D)             # left shadow rail
    rect(im, 23, 17, 24, 25, STEEL_D)           # right shadow rail
    line(im, [(6, 26), (25, 26)], STEEL_D)      # bottom bevel
    line(im, [(9, 17), (9, 25)], STEEL_L)       # inner highlights
    line(im, [(22, 17), (22, 25)], STEEL_L)

    # Corner rivets, cool steel rather than brass.
    for x, y in ((9, 18), (22, 18), (9, 24), (22, 24)):
        px(im, x, y, STEEL_H)
        px(im, x + 1, y, STEEL_D)

    # Brass lock plate with a keyhole, straddling the lid seam.
    rect(im, 14, 12, 17, 20, BRASS)
    line(im, [(14, 12), (14, 20)], BRASS_L)
    line(im, [(17, 12), (17, 20)], BRASS_D)
    line(im, [(14, 12), (17, 12)], BRASS_L)
    rect(im, 15, 16, 16, 17, INK)
    px(im, 15, 18, INK)

    # Hinge pins on the lid.
    px(im, 8, 13, BRASS_L)
    px(im, 23, 13, BRASS_L)

    return outline(im)


def sprite_chest_b() -> Image.Image:
    """Battered crate on the raider route: rope straps, glowing seam."""
    im = new_sprite()

    # Lid and body, deliberately a little out of true.
    rect(im, 6, 11, 25, 11, WOOD_L)
    rect(im, 5, 12, 26, 15, WOOD)
    line(im, [(6, 11), (25, 11)], WOOD_H)
    line(im, [(5, 15), (26, 15)], WOOD_D)

    rect(im, 6, 16, 25, 26, WOOD)
    line(im, [(6, 16), (25, 16)], WOOD_D)
    line(im, [(6, 26), (25, 26)], WOOD_D)

    # Plank seams and grain.
    for y in (20, 23):
        line(im, [(6, y), (25, y)], WOOD_D)
        line(im, [(7, y - 1), (24, y - 1)], WOOD_L)
    for x in (10, 15, 20):
        line(im, [(x, 17), (x, 25)], WOOD_D)
    line(im, [(17, 18), (18, 19)], WOOD_L)
    line(im, [(12, 21), (13, 22)], WOOD_L)

    # Glowing seam: a short sickly-green bleed under the lid.
    rect(im, 9, 15, 20, 16, WOOD_D)
    line(im, [(11, 16), (16, 16)], GLOW_D)
    line(im, [(12, 15), (15, 15)], GLOW)
    px(im, 13, 14, GLOW_L)
    px(im, 17, 16, GLOW_D)
    px(im, 10, 17, GLOW_D)

    # Rope straps, with a knot on the right-hand one.
    for x in (9, 21):
        rect(im, x, 11, x + 1, 27, ROPE)
        line(im, [(x, 11), (x, 27)], ROPE_L)
        line(im, [(x + 1, 12), (x + 1, 27)], ROPE_D)
    rect(im, 20, 19, 23, 21, ROPE)
    line(im, [(20, 19), (23, 19)], ROPE_L)
    line(im, [(21, 21), (22, 22)], ROPE_D)

    # Chipped corner and a splinter: read as battered.
    px(im, 5, 12, INK)
    px(im, 6, 11, INK)
    rect(im, 5, 24, 6, 25, WOOD_D)
    px(im, 4, 26, WOOD_D)
    px(im, 4, 25, WOOD_L)
    px(im, 25, 17, WOOD_D)
    # Nail heads.
    for x, y in ((7, 18), (24, 18), (7, 25), (24, 25)):
        px(im, x, y, STEEL_D)
        px(im, x, y - 1, STEEL_L)

    return outline(im)


def sprite_chest_c() -> Image.Image:
    """Single canvas satchel: light cloth, one diagonal shoulder strap."""
    im = new_sprite()

    # The one strap leaves the bag and runs up to the top-right shoulder,
    # exiting the frame: an asymmetric silhouette, not a handbag handle.
    line(im, [(17, 16), (20, 13), (23, 10), (25, 7), (26, 4)],
         CANVAS_D, width=2)
    line(im, [(17, 15), (20, 12), (23, 9), (25, 6), (26, 4)],
         CANVAS, width=1)
    px(im, 26, 3, CANVAS_D)
    # Strap buckle.
    rect(im, 21, 8, 23, 10, BRASS_D)
    rect(im, 22, 9, 22, 9, BRASS_L)
    px(im, 21, 8, BRASS)
    px(im, 23, 10, BRASS)

    # Body: rounded canvas bag, low and slightly left of centre.
    rect(im, 6, 15, 22, 27, CANVAS)
    rect(im, 7, 14, 21, 14, CANVAS_D)
    line(im, [(6, 15), (6, 26)], CANVAS_L)
    line(im, [(6, 27), (22, 27)], CANVAS_D)
    line(im, [(22, 16), (22, 27)], CANVAS_D)
    line(im, [(7, 26), (21, 26)], CANVAS_L)
    # Rounded bottom corners.
    px(im, 6, 27, (0, 0, 0, 0))
    px(im, 22, 27, (0, 0, 0, 0))
    px(im, 5, 16, (0, 0, 0, 0))
    px(im, 23, 16, (0, 0, 0, 0))

    # Flap over the top, with a stitched hem.
    rect(im, 5, 14, 23, 19, CANVAS_L)
    rect(im, 6, 14, 22, 14, CANVAS_H)
    line(im, [(5, 19), (23, 19)], CANVAS_D)
    for x in range(7, 23, 2):
        px(im, x, 18, CANVAS_D)

    # The strap's lower end passes behind the flap: a small tab makes the
    # attachment read at 32 px instead of leaving the strap floating.
    rect(im, 18, 13, 20, 15, CANVAS_D)
    px(im, 19, 13, CANVAS)
    px(im, 20, 15, CANVAS_D)

    # Flap tab and its small brass buckle.
    rect(im, 12, 19, 15, 22, CANVAS_D)
    rect(im, 13, 20, 14, 21, BRASS)
    px(im, 13, 20, BRASS_L)

    # Side gusset shading and a scuff.
    line(im, [(8, 20), (8, 26)], CANVAS_D)
    line(im, [(20, 20), (20, 26)], CANVAS_D)
    px(im, 11, 24, CANVAS_D)
    px(im, 12, 25, CANVAS_D)

    return outline(im)


def sprite_chest_d() -> Image.Image:
    """Double-strapped satchel: warm leather, two buckles, two tags."""
    im = new_sprite()

    # Body.
    rect(im, 6, 14, 25, 26, LEATHER)
    rect(im, 7, 13, 24, 13, LEATHER_L)
    line(im, [(6, 14), (6, 25)], LEATHER_L)
    line(im, [(6, 26), (25, 26)], LEATHER_D)
    line(im, [(25, 15), (25, 26)], LEATHER_D)

    # Flap with stitching.
    rect(im, 5, 13, 26, 18, LEATHER_L)
    rect(im, 6, 13, 25, 13, LEATHER_H)
    line(im, [(5, 18), (26, 18)], LEATHER_D)
    for x in range(7, 25, 2):
        px(im, x, 14, LEATHER_D)
    for x in range(7, 25, 2):
        px(im, x, 17, LEATHER_D)

    # Two vertical straps with brass buckles.
    for x in (9, 20):
        rect(im, x, 11, x + 1, 23, LEATHER_D)
        line(im, [(x, 11), (x, 23)], LEATHER)
        rect(im, x - 1, 18, x + 2, 20, BRASS_D)
        rect(im, x, 18, x + 1, 19, BRASS)
        px(im, x, 18, BRASS_L)

    # Two little tags hanging off the buckles.
    rect(im, 8, 21, 10, 23, SAND)
    line(im, [(8, 23), (10, 23)], SAND_D)
    px(im, 9, 22, SAND_D)
    rect(im, 21, 21, 23, 23, SAND)
    line(im, [(21, 23), (23, 23)], SAND_D)
    px(im, 22, 22, SAND_D)

    # Side gusset and scuff.
    line(im, [(8, 19), (8, 25)], LEATHER_D)
    line(im, [(23, 18), (23, 25)], LEATHER_D)
    px(im, 13, 24, LEATHER_H)

    return outline(im)


def sprite_trader() -> Image.Image:
    """Caravan trader: wide hat, headwrap, duster coat, folded arms."""
    im = new_sprite()

    # Duster coat: shoulders, nipped waist, flared hem and split tails.
    poly(im, [(11, 12), (20, 12), (21, 17), (22, 27), (9, 27), (10, 17)],
         COAT)

    # Coat tails, centre opening and a lit left edge.
    rect(im, 9, 26, 22, 26, COAT_D)
    line(im, [(15, 27), (15, 23)], COAT_D)
    line(im, [(16, 24), (16, 26)], COAT_L)
    line(im, [(11, 14), (10, 25)], COAT_L)
    line(im, [(20, 15), (21, 26)], COAT_D)

    # Belt with a small brass buckle.
    rect(im, 10, 22, 21, 23, SCARF_D)
    rect(im, 15, 22, 16, 23, BRASS)
    px(im, 15, 22, BRASS_L)

    # Folded arms: a distinct dark slab with two visible hands and cuffs.
    rect(im, 8, 18, 23, 20, COAT_D)
    line(im, [(8, 18), (23, 18)], COAT)
    line(im, [(12, 19), (15, 19)], COAT)
    line(im, [(18, 20), (21, 20)], COAT_D)
    rect(im, 8, 19, 10, 20, SKIN)
    px(im, 9, 19, SKIN_L)
    px(im, 8, 20, SKIN_D)
    rect(im, 21, 19, 23, 20, SKIN_D)
    line(im, [(11, 19), (11, 20)], SCARF_D)
    line(im, [(20, 19), (20, 20)], SCARF_D)

    # Neck and head.
    rect(im, 14, 12, 17, 13, SKIN_D)
    rect(im, 12, 8, 19, 12, SKIN)
    line(im, [(12, 8), (19, 8)], SKIN_D)         # shadow under the brim
    px(im, 13, 10, SKIN_D)
    px(im, 18, 10, SKIN_D)
    px(im, 14, 9, INK)
    px(im, 17, 9, INK)

    # Headwrap: a visible cloth band at the temples under the hat.
    rect(im, 12, 8, 19, 8, SCARF_D)
    px(im, 12, 9, SCARF)
    px(im, 19, 9, SCARF)
    rect(im, 11, 7, 20, 7, SCARF)
    rect(im, 11, 6, 20, 6, SCARF_D)

    # Wide hat: broad brim, low crown, dark band.
    rect(im, 7, 6, 24, 6, COAT_D)
    rect(im, 6, 7, 25, 7, COAT)
    line(im, [(8, 6), (23, 6)], COAT_L)
    line(im, [(7, 7), (24, 7)], COAT_D)
    rect(im, 11, 2, 20, 5, COAT)
    rect(im, 11, 2, 20, 2, COAT_L)
    rect(im, 11, 5, 20, 5, SCARF_D)
    px(im, 12, 3, COAT_L)
    px(im, 13, 3, COAT_L)

    # Scarf at the throat, not across the mouth.
    rect(im, 13, 12, 18, 12, SCARF)
    px(im, 13, 12, SCARF_D)

    # Legs and boots, visible beneath the split coat.
    rect(im, 10, 27, 13, 28, SCARF_D)
    rect(im, 17, 27, 20, 28, SCARF_D)
    rect(im, 9, 29, 14, 29, INK)
    rect(im, 17, 29, 22, 29, INK)

    return outline(im)


def sprite_raider() -> Image.Image:
    """Raider: hooded, hunched, pipe rifle diagonal, red goggle glint."""
    im = new_sprite()

    # Tattered coat / body silhouette, leaning right.
    poly(im, [(12, 8), (20, 9), (22, 14), (24, 26), (22, 29), (19, 27),
              (17, 29), (15, 27), (12, 29), (9, 27), (7, 24), (10, 15)],
         CHAR)
    line(im, [(20, 14), (22, 26)], CHAR_D)
    line(im, [(11, 15), (9, 25)], RUST_D)

    # Ragged hem.
    px(im, 8, 28, CHAR_D)
    px(im, 12, 29, CHAR_D)
    px(im, 17, 29, CHAR_D)
    px(im, 20, 28, CHAR_D)

    # Scrap pauldron on the left shoulder, smaller plate on the right.
    poly(im, [(7, 12), (12, 11), (14, 15), (9, 17), (6, 15)], RUST_D)
    line(im, [(8, 12), (12, 12)], RUST)
    line(im, [(8, 14), (11, 15)], RUST)
    poly(im, [(18, 13), (22, 12), (23, 15), (19, 16)], RUST_D)
    line(im, [(19, 13), (22, 13)], RUST)

    # Hood, narrower than the shoulders so the head stays readable.
    poly(im, [(12, 4), (15, 2), (19, 3), (21, 6), (20, 9), (18, 12),
              (13, 11), (11, 8)], CHAR)
    poly(im, [(13, 7), (19, 7), (19, 11), (17, 12), (13, 11)], FACE)

    # Goggle glint: two hard red pixels under a thin metal band.
    line(im, [(13, 7), (19, 7)], RUST_D)
    px(im, 14, 8, RED)
    px(im, 17, 8, RED_H)
    px(im, 14, 9, RED_H)
    px(im, 17, 9, RED)

    # Pipe rifle: wooden stock low-left, long rusted pipe to upper-right.
    # Drawn thick enough to survive at 32 px; both ends leave the silhouette.
    line(im, [(6, 28), (26, 5)], CHAR_D, width=3)
    line(im, [(6, 27), (25, 6)], RUST_D, width=2)
    line(im, [(7, 26), (24, 7)], RUST, width=1)
    rect(im, 3, 24, 8, 29, WOOD_D)              # stock
    line(im, [(4, 24), (7, 24)], WOOD_L)
    line(im, [(3, 26), (7, 26)], WOOD)
    line(im, [(4, 28), (7, 28)], WOOD)
    rect(im, 18, 8, 22, 12, CHAR_D)             # receiver / sight block
    line(im, [(19, 8), (21, 8)], RUST_L)
    px(im, 22, 9, RED)                          # sight lamp
    line(im, [(10, 24), (12, 22)], ROPE_D)      # tape binding
    line(im, [(22, 13), (24, 11)], ROPE_D)
    rect(im, 25, 4, 27, 7, STEEL_D)             # muzzle
    px(im, 26, 4, STEEL_L)
    px(im, 28, 5, CHAR_D)

    # Boots, planted wide: a different stance from the trader.
    rect(im, 7, 26, 11, 29, CHAR_D)
    rect(im, 19, 26, 23, 29, CHAR_D)
    line(im, [(7, 29), (11, 29)], RUST_D)
    line(im, [(19, 29), (23, 29)], RUST_D)

    return outline(im)


def sprite_icon_caps() -> Image.Image:
    """Bottle cap: crimped silver rim, brass face, simple star emblem."""
    im = new_sprite()
    cx, cy = 15.5, 15.5
    n = 32
    outer = 12.0
    crimp = 10.2

    # Crimped rim as 32 wedges, alternating light/dark with the light source
    # at the upper left. Wedges overlap by one vertex so there are no seams.
    pts = []
    for i in range(n):
        ang = 2 * math.pi * i / n
        r = outer if i % 2 == 0 else crimp
        pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        mid = 2 * math.pi * (i + 0.5) / n
        lit = math.cos(mid - 3 * math.pi / 4) > 0
        poly(im, [(cx, cy), a, b], SILVER_L if lit else SILVER_D)

    # Brass face and inner rim.
    poly(im, [(cx + math.cos(2 * math.pi * i / 40) * 9.2,
               cy + math.sin(2 * math.pi * i / 40) * 9.2) for i in range(40)],
         BRASS_D)
    poly(im, [(cx + math.cos(2 * math.pi * i / 40) * 8.4,
               cy + math.sin(2 * math.pi * i / 40) * 8.4) for i in range(40)],
         BRASS)
    d = ImageDraw.Draw(im)
    d.arc([cx - 8, cy - 8, cx + 8, cy + 8], 180, 300, fill=BRASS_L)

    # Four-point star emblem, embossed, readable at 32 px.
    star(im, cx, cy, 6.4, 2.6, BRASS_D)
    star(im, cx - 0.4, cy - 0.4, 5.0, 2.0, BRASS_L)
    star(im, cx, cy, 3.6, 1.5, BRASS)

    return outline(im)


# ---------------------------------------------------------------------------
# Wasteland Odds sprites (32 x 32): Victor, Festus, the cap barrel and the
# two faces of a Lucky 38 chip. Same palette family, same 1 px INK outline.
# ---------------------------------------------------------------------------

def disc(im, cx, cy, r, colour, n=40):
    poly(im, [(cx + math.cos(2 * math.pi * i / n) * r,
               cy + math.sin(2 * math.pi * i / n) * r) for i in range(n)],
         colour)


def sprite_victor() -> Image.Image:
    """Securitron: a monitor head with a cowboy face, arms, one wheel."""
    im = new_sprite()

    # Wheel base.
    disc(im, 15.5, 27.0, 4.2, CHAR_D)
    disc(im, 15.5, 27.0, 2.4, STEEL_D)
    px(im, 15, 26, STEEL_L)
    rect(im, 11, 23, 20, 24, CHAR)

    # Torso and shoulder plate.
    rect(im, 10, 15, 21, 22, CHAR)
    line(im, [(10, 15), (21, 15)], STEEL_D)
    rect(im, 12, 17, 19, 21, STEEL_D)
    line(im, [(12, 17), (19, 17)], STEEL)
    px(im, 13, 19, BRASS_L)
    px(im, 18, 19, BRASS_L)

    # Arms with blocky gun-hands.
    rect(im, 6, 16, 9, 21, STEEL_D)
    rect(im, 22, 16, 25, 21, STEEL_D)
    line(im, [(6, 16), (9, 16)], STEEL)
    line(im, [(22, 16), (25, 16)], STEEL)
    rect(im, 6, 22, 8, 24, CHAR)
    rect(im, 23, 22, 25, 24, CHAR)

    # Monitor head: dark bezel, green phosphor screen.
    rect(im, 7, 1, 24, 14, CHAR)
    line(im, [(7, 1), (24, 1)], STEEL_D)
    rect(im, 9, 3, 22, 12, SCREEN_D)
    for y in range(3, 13, 2):                    # scanlines
        line(im, [(9, y), (22, y)], (20, 58, 24, 255))

    # Victor's face: hat, eyes, grin — drawn in bright phosphor.
    rect(im, 13, 3, 18, 5, SCREEN)               # hat crown
    line(im, [(10, 6), (21, 6)], SCREEN_L)       # hat brim
    rect(im, 12, 8, 13, 8, SCREEN_L)             # eyes
    rect(im, 18, 8, 19, 8, SCREEN_L)
    line(im, [(12, 10), (19, 10)], SCREEN_L)     # grin
    px(im, 11, 9, SCREEN_L)
    px(im, 20, 9, SCREEN_L)

    return outline(im)


def sprite_festus() -> Image.Image:
    """Festus, the animatronic cowboy: hat, tin face, moustache, star badge."""
    im = new_sprite()

    # Shoulders, vest and shirt.
    rect(im, 7, 19, 24, 30, CANVAS)
    rect(im, 7, 19, 11, 30, LEATHER)
    rect(im, 20, 19, 24, 30, LEATHER)
    line(im, [(11, 19), (11, 30)], LEATHER_D)
    line(im, [(20, 19), (20, 30)], LEATHER_D)
    star(im, 22.0, 23.5, 2.6, 1.1, BRASS_L, points=5)

    # Red bandana.
    rect(im, 11, 17, 20, 19, RED)
    poly(im, [(14, 19), (17, 19), (15.5, 22)], RED)
    line(im, [(11, 17), (20, 17)], RED_H)

    # Tin face with rivets and a jointed jaw.
    rect(im, 10, 8, 21, 16, SILVER)
    line(im, [(10, 8), (10, 16)], SILVER_L)
    line(im, [(21, 8), (21, 16)], SILVER_D)
    line(im, [(11, 14), (20, 14)], SILVER_D)     # jaw seam
    px(im, 11, 9, SILVER_D)
    px(im, 20, 9, SILVER_D)
    rect(im, 12, 10, 13, 11, INK)                # eyes
    rect(im, 18, 10, 19, 11, INK)
    px(im, 12, 10, BRASS_L)
    px(im, 18, 10, BRASS_L)
    rect(im, 12, 12, 19, 13, WOOD_D)             # moustache
    px(im, 11, 13, WOOD_D)
    px(im, 20, 13, WOOD_D)

    # Ten-gallon hat.
    rect(im, 11, 2, 20, 7, LEATHER)
    line(im, [(11, 2), (20, 2)], LEATHER_L)
    line(im, [(15, 2), (16, 2)], LEATHER_D)      # crown dent
    rect(im, 11, 6, 20, 6, LEATHER_D)            # hat band
    rect(im, 5, 7, 26, 8, LEATHER_L)             # brim
    line(im, [(5, 8), (26, 8)], LEATHER_D)
    px(im, 5, 6, LEATHER_L)
    px(im, 26, 6, LEATHER_L)

    return outline(im)


def sprite_cap_barrel() -> Image.Image:
    """A rusty barrel brimming with Nuka-Cola, Sunset and star caps."""
    im = new_sprite()

    # Barrel body with two steel bands.
    rect(im, 8, 12, 23, 29, RUST)
    rect(im, 7, 14, 24, 27, RUST)
    line(im, [(9, 13), (9, 28)], RUST_L)
    line(im, [(22, 13), (22, 28)], RUST_D)
    line(im, [(15, 13), (15, 28)], RUST_D)
    for y in (16, 25):
        rect(im, 7, y, 24, y + 1, STEEL_D)
        line(im, [(7, y), (24, y)], STEEL)

    # Rim and the pile of caps.
    rect(im, 7, 10, 24, 12, STEEL_D)
    line(im, [(8, 10), (23, 10)], STEEL_L)
    caps = [
        (9, 8, RED), (12, 6, SUNSET), (15, 8, RED), (18, 6, SUNSET),
        (21, 8, SUNSET), (11, 9, SUNSET), (14, 5, RED), (17, 9, RED),
        (20, 9, SUNSET), (16, 3, SUNSET),
    ]
    for x, y, colour in caps:
        rect(im, x, y, x + 2, y + 1, colour)
        px(im, x, y, RED_H if colour == RED else BRASS_L)
    # One star cap on top of the pile.
    rect(im, 15, 3, 17, 4, SUNSET)
    px(im, 16, 3, STAR_BLUE)
    px(im, 16, 4, STAR_BLUE)
    px(im, 15, 4, STAR_BLUE)
    px(im, 17, 4, STAR_BLUE)

    return outline(im)


def chip_base(im):
    """Lucky 38 chip: red/white edge spots around a dark felt centre."""
    cx, cy = 15.5, 15.5
    disc(im, cx, cy, 13.0, RED)
    for i in range(8):
        a0 = 2 * math.pi * i / 8 + math.pi / 16
        a1 = a0 + math.pi / 8
        poly(im, [(cx + math.cos(a0) * 13.0, cy + math.sin(a0) * 13.0),
                  (cx + math.cos(a1) * 13.0, cy + math.sin(a1) * 13.0),
                  (cx + math.cos(a1) * 9.8, cy + math.sin(a1) * 9.8),
                  (cx + math.cos(a0) * 9.8, cy + math.sin(a0) * 9.8)],
             CHIP_W)
    disc(im, cx, cy, 9.6, RUST_D)
    disc(im, cx, cy, 8.6, CHAR)
    ImageDraw.Draw(im).arc([cx - 12, cy - 12, cx + 12, cy + 12], 190, 260,
                           fill=RED_H)
    return cx, cy


def sprite_chip_heads() -> Image.Image:
    """Heads: the Lucky 38 tower in brass."""
    im = new_sprite()
    chip_base(im)
    rect(im, 15, 8, 16, 23, BRASS)               # spire
    line(im, [(15, 8), (15, 23)], BRASS_L)
    rect(im, 11, 10, 20, 11, BRASS)              # the saucer top
    line(im, [(12, 9), (19, 9)], BRASS_L)
    line(im, [(12, 12), (19, 12)], BRASS_D)
    px(im, 15, 6, RED_H)                         # beacon
    px(im, 16, 7, BRASS_L)
    rect(im, 13, 21, 18, 23, BRASS_D)            # base
    line(im, [(13, 21), (18, 21)], BRASS)
    return outline(im)


def sprite_chip_tails() -> Image.Image:
    """Tails: a lucky horseshoe in brass, open end up to hold the luck."""
    im = new_sprite()
    chip_base(im)
    rect(im, 10, 9, 12, 17, BRASS)               # left leg
    rect(im, 19, 9, 21, 17, BRASS)               # right leg
    ImageDraw.Draw(im).arc([10, 11, 21, 22], 0, 180, fill=BRASS, width=3)
    px(im, 9, 9, BRASS)                          # flared tips
    px(im, 22, 9, BRASS)
    line(im, [(10, 10), (10, 16)], BRASS_L)
    for x, y in ((11, 11), (20, 11), (11, 14), (20, 14)):
        px(im, x, y, BRASS_D)                    # nail holes
    return outline(im)


def sprite_garret() -> Image.Image:
    """James Garret of the Atomic Wrangler: slicked quiff, smirk, worn suit."""
    im = new_sprite()

    # Worn pre-War suit: dingy brown jacket with lapels over a white
    # shirt, and a rust-red tie.
    rect(im, 7, 19, 24, 30, WOOD_D)
    line(im, [(7, 20), (7, 30)], WOOD)
    line(im, [(24, 20), (24, 30)], CHAR)
    poly(im, [(12, 19), (19, 19), (17, 27), (14, 27)], SILVER_L)     # shirt
    line(im, [(12, 19), (14, 26)], WOOD)                             # lapels
    line(im, [(19, 19), (17, 26)], WOOD)
    rect(im, 15, 19, 16, 20, RUST)                                   # tie knot
    poly(im, [(15, 21), (16, 21), (17, 26), (15.5, 27), (14, 26)], RUST_L)
    px(im, 10, 25, WOOD)                                             # worn patches
    px(im, 21, 28, WOOD)
    px(im, 22, 23, WOOD_L)

    # Neck and face with a one-sided smirk.
    rect(im, 13, 16, 18, 18, SKIN_D)
    rect(im, 11, 7, 20, 16, SKIN)
    line(im, [(20, 8), (20, 16)], SKIN_D)
    line(im, [(11, 8), (11, 15)], SKIN_L)
    rect(im, 13, 10, 14, 10, INK)                # eyebrows
    rect(im, 17, 10, 18, 10, INK)
    px(im, 13, 11, INK)                          # eyes
    px(im, 18, 11, INK)
    px(im, 15, 13, SKIN_D)                       # nose
    line(im, [(14, 15), (17, 14)], INK)          # smirk
    px(im, 18, 14, SKIN_D)

    # Slicked-back dark hair: a swept quiff, short at the sides.
    rect(im, 11, 3, 20, 6, CHAR)
    rect(im, 12, 1, 18, 2, CHAR)
    px(im, 19, 2, CHAR)
    line(im, [(13, 2), (18, 2)], STEEL_D)        # shine on the quiff
    line(im, [(12, 4), (16, 3)], STEEL_D)
    rect(im, 10, 6, 10, 9, CHAR)
    rect(im, 21, 6, 21, 9, CHAR)

    return outline(im)


WASTELAND_SPRITES = {
    "victor": sprite_victor,
    "festus": sprite_festus,
    "cap_barrel": sprite_cap_barrel,
    "chip_heads": sprite_chip_heads,
    "chip_tails": sprite_chip_tails,
    "garret": sprite_garret,
}


# ---------------------------------------------------------------------------
# Scene toolkit (320 x 180 pixel canvas, enlarged with NEAREST)
# ---------------------------------------------------------------------------

BAYER4 = (
    (0, 8, 2, 10),
    (12, 4, 14, 6),
    (3, 11, 1, 9),
    (15, 7, 13, 5),
)


def dither_between(im, x, y, colour_a, colour_b, t):
    """Bayer-dithered pick between two colours; t=0 -> a, t=1 -> b."""
    im.putpixel((x, y), colour_b if t * 16 > BAYER4[y % 4][x % 4] + 0.5
                else colour_a)


def gradient(im, y0, y1, stops):
    """Vertical gradient across palette stops, dithered between neighbours."""
    span = y1 - y0
    for yy in range(span):
        t = yy / max(span - 1, 1) * (len(stops) - 1)
        i = min(int(t), len(stops) - 2)
        frac = t - i
        for x in range(im.width):
            dither_between(im, x, y0 + yy, stops[i], stops[i + 1], frac)


def vignette(im: Image.Image, strength=150, start=0.42, end=1.05):
    """Darken the edges in quantised, Bayer-dithered steps (pixel-art safe)."""
    w, h = im.size
    cx, cy = w / 2, h / 2
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    levels = (0, 18, 34, 52, 72, 96)
    for y in range(h):
        ny = (y - cy) / (h * 0.5)
        for x in range(w):
            nx = (x - cx) / (w * 0.5)
            d = math.sqrt((nx * 0.92) ** 2 + ny ** 2)
            t = max(0.0, min(1.0, (d - start) / (end - start)))
            q = t * strength / 96 * len(levels)
            idx = min(len(levels) - 1, int(q))
            # Dither the boundary so the rings do not band hard.
            thresh = BAYER4[y % 4][x % 4] / 16
            if idx < len(levels) - 1 and (q - idx) > thresh:
                idx += 1
            a = levels[idx]
            if a:
                overlay.putpixel((x, y), (0, 0, 0, a))
    return Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")


def haze(im, lines, colour, alpha):
    """Diagonal dust streaks on a translucent overlay."""
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x0, y0, x1, y1, width in lines:
        d.line([(x0, y0), (x1, y1)], fill=colour + (alpha,), width=width)
    im.paste(Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB"),
             (0, 0))


def atmospheric_haze(im, y0, y1, colour, peak_alpha):
    """A soft horizontal dust haze that fades in and out with height."""
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    pix = layer.load()
    span = max(y1 - y0, 1)
    for y in range(y0, y1):
        t = (y - y0) / span
        a = int(peak_alpha * math.sin(math.pi * t))
        if a <= 0:
            continue
        for x in range(im.width):
            pix[x, y] = colour + (a,)
    im.paste(Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB"),
             (0, 0))


def strongbox(im, x, y, w, h):
    """Large low-res strongbox for scenes; proportions mirror chest_a."""
    d = ImageDraw.Draw(im)
    steel_mid = (96, 108, 121)
    steel_dk = (62, 73, 84)
    steel_lt = (140, 154, 167)
    steel_hi = (176, 190, 201)
    ink = (20, 22, 26)

    # Feet first, then body and lid.
    d.rectangle([x + 4, y + h - 5, x + w // 3, y + h], fill=steel_dk)
    d.rectangle([x + w - w // 3, y + h - 5, x + w - 4, y + h],
                fill=steel_dk)
    d.rectangle([x + 2, y + 9, x + w - 2, y + h - 5], fill=steel_mid)
    d.rectangle([x, y, x + w, y + 9], fill=steel_lt)

    # Bevels and panel seams.
    d.rectangle([x + 2, y + 2, x + w - 2, y + 4], fill=steel_hi)
    d.line([(x + 2, y + 9), (x + w - 2, y + 9)], fill=ink)
    d.line([(x + 2, y + 10), (x + w - 2, y + 10)], fill=steel_hi)
    d.line([(x + 2, y + h - 6), (x + w - 2, y + h - 6)], fill=steel_dk)
    for sx in (x + 7, x + w - 7):
        d.line([(sx, y + 12), (sx, y + h - 9)], fill=steel_dk)
    # Rivets.
    for rx, ry in ((x + 5, y + 13), (x + w - 5, y + 13),
                   (x + 5, y + h - 9), (x + w - 5, y + h - 9)):
        d.point((rx, ry), fill=steel_hi)
    # Brass corner brackets.
    for bx in (x + 2, x + w - 8):
        d.rectangle([bx, y + 4, bx + 5, y + 6], fill=(150, 112, 40))
    # Brass lock plate and keyhole.
    lx = x + w // 2 - 6
    d.rectangle([lx, y + 4, lx + 12, y + 20], fill=(140, 104, 38))
    d.rectangle([lx + 2, y + 6, lx + 10, y + 18], fill=(206, 169, 62))
    d.line([(lx + 2, y + 6), (lx + 2, y + 18)], fill=(236, 207, 110))
    d.rectangle([lx + 5, y + 10, lx + 7, y + 14], fill=ink)
    d.rectangle([lx + 5, y + 15, lx + 5, y + 16], fill=ink)

    # Dark outline, drawn last so the silhouette stays crisp at 160 px.
    d.rectangle([x, y, x + w, y + h], outline=ink, width=2)
    d.rectangle([x + 2, y + 9, x + w - 2, y + h - 5], outline=ink)


def watchtower(im, x, y, w, h, beacon=True):
    """Raider-country watchtower silhouette: splayed legs, cabin, antenna."""
    d = ImageDraw.Draw(im)
    dark = S_TOWER
    darker = S_TOWER_D
    platform_y = y + h * 0.20

    # Splayed legs with cross bracing and a ladder between them.
    d.line([(x + 3, y + h), (x + w * 0.34, platform_y)], fill=dark, width=4)
    d.line([(x + w - 3, y + h), (x + w * 0.66, platform_y)],
           fill=dark, width=4)
    d.line([(x + w * 0.5, y + h), (x + w * 0.5, platform_y)],
           fill=darker, width=1)
    for yy in range(int(platform_y) + 4, y + h - 2, 5):
        d.line([(x + w * 0.5 - 2, yy), (x + w * 0.5 + 2, yy)],
               fill=darker)
    for frac in (0.38, 0.56, 0.76):
        yy = int(y + h * frac)
        # Follow the splayed legs so bracing never pokes outside the tower.
        t = (1.0 - frac) / 0.80
        lx = (x + 3) + ((x + w * 0.34) - (x + 3)) * t
        rx = (x + w - 3) + ((x + w * 0.66) - (x + w - 3)) * t
        d.line([(lx + 1, yy), (rx - 1, yy + 2)], fill=darker)
        d.line([(lx + 1, yy + 2), (rx - 1, yy)], fill=darker)

    # Platform, railing, cabin and roof.
    d.rectangle([x + w * 0.14, platform_y - 3, x + w * 0.86, platform_y + 1],
                fill=darker)
    d.rectangle([x + w * 0.20, y + h * 0.06, x + w * 0.80, platform_y - 3],
                fill=dark)
    d.rectangle([x + w * 0.26, y + h * 0.09, x + w * 0.44, y + h * 0.15],
                fill=(78, 58, 48))
    d.rectangle([x + w * 0.56, y + h * 0.09, x + w * 0.74, y + h * 0.15],
                fill=(78, 58, 48))
    d.polygon([(x + w * 0.10, y + h * 0.06), (x + w * 0.5, y),
               (x + w * 0.90, y + h * 0.06)], fill=darker)
    # Railing posts.
    for px_x in (x + w * 0.16, x + w * 0.84):
        d.line([(px_x, platform_y - 7), (px_x, platform_y)],
               fill=darker, width=1)
    # Antenna and beacon.
    d.line([(x + w * 0.5, y), (x + w * 0.5, y - h * 0.10)],
           fill=darker, width=2)
    d.line([(x + w * 0.5, y - h * 0.07), (x + w * 0.66, y - h * 0.06)],
           fill=darker)
    if beacon:
        d.rectangle([x + w * 0.5 - 2, y - h * 0.13, x + w * 0.5, y - h * 0.11],
                    fill=(196, 58, 48))


def card_scene() -> Image.Image:
    """320 x 180: a strongbox alone on a desert road, sandstorm behind."""
    im = Image.new("RGB", (320, 180), S_DUST[1])

    # Dusty sky, dimmer and browner than the background's dusk.
    gradient(im, 0, 108, [(74, 58, 50), (108, 82, 62), (146, 110, 79),
                          (181, 144, 101), (203, 168, 119)])
    # Low sun smothered by the storm.
    d = ImageDraw.Draw(im)
    d.ellipse([194, 26, 232, 64], fill=(220, 184, 126))
    d.ellipse([201, 33, 225, 57], fill=(233, 203, 148))

    # Storm air: a soft dust haze plus diagonal streaks, never a hard edge.
    atmospheric_haze(im, 30, 112, (222, 186, 140), 62)
    haze(im, [(0, 18, 180, 96, 5), (40, 4, 250, 110, 3),
              (120, 0, 300, 92, 3), (0, 60, 150, 120, 3),
              (20, 78, 120, 112, 2)],
         (228, 195, 148), 38)
    haze(im, [(80, 8, 260, 86, 1), (20, 34, 210, 108, 1),
              (150, 22, 300, 100, 2)],
         (240, 216, 176), 30)

    # Dunes and the road shoulder.
    d.polygon([(0, 96), (52, 86), (108, 94), (168, 88), (228, 96),
               (286, 90), (320, 96), (320, 180), (0, 180)],
              fill=S_SAND[1])
    d.polygon([(0, 108), (70, 99), (140, 106), (210, 99), (280, 106),
               (320, 102), (320, 180), (0, 180)], fill=S_SAND[2])
    d.polygon([(0, 132), (90, 124), (180, 130), (260, 124), (320, 130),
               (320, 180), (0, 180)], fill=S_SAND[3])

    # Broken road, converging to a vanishing point right of centre.
    d.polygon([(0, 180), (320, 180), (206, 104), (176, 104)],
              fill=S_ROAD[1])
    d.polygon([(18, 180), (300, 180), (204, 104), (180, 104)],
              fill=S_ROAD[2])
    d.line([(176, 104), (0, 180)], fill=S_ROAD[0], width=3)
    d.line([(206, 104), (320, 180)], fill=S_ROAD[0], width=3)
    # Faded centre dashes and cracks.
    for i in range(4):
        t = i / 4
        y0 = int(112 + t * 52)
        y1 = int(y0 + 6 + t * 6)
        x0 = int(192 + t * 2)
        d.line([(x0, y0), (x0, y1)], fill=(152, 132, 100))
    d.line([(150, 150), (166, 162), (159, 172)], fill=S_ROAD[0])
    d.line([(230, 140), (244, 148), (238, 156)], fill=S_ROAD[0])
    d.line([(96, 166), (112, 160), (126, 170)], fill=S_ROAD[3])

    # Watchtower on the ridge, low contrast.
    watchtower(im, 248, 34, 48, 74, beacon=True)
    haze(im, [(236, 30, 312, 112, 10)], (203, 170, 127), 44)

    # The strongbox: the one silhouette that must read at 160 px.
    strongbox(im, 110, 110, 104, 58)
    # Contact shadow.
    shadow = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse([100, 158, 224, 178], fill=(38, 28, 22, 105))
    im.paste(Image.alpha_composite(im.convert("RGBA"), shadow).convert("RGB"),
             (0, 0))

    # Foreground dust drifting across the box's base.
    haze(im, [(60, 158, 260, 150, 2), (90, 168, 300, 158, 2)],
         (214, 178, 130), 46)

    return vignette(im, strength=120, start=0.46, end=1.06)


def strip_scene() -> Image.Image:
    """320 x 180: the New Vegas Strip at night, the Lucky 38 in the middle."""
    im = Image.new("RGB", (320, 180), (12, 10, 28))
    night = [(8, 8, 22), (14, 12, 34), (26, 18, 48), (48, 26, 58), (86, 38, 60)]
    gradient(im, 0, 124, night)
    d = ImageDraw.Draw(im)

    # Stars: a fixed linear-congruential scatter, so the output never changes.
    seed = 1338
    for _ in range(70):
        seed = (seed * 1103515245 + 12345) % (2 ** 31)
        x = seed % 320
        seed = (seed * 1103515245 + 12345) % (2 ** 31)
        y = seed % 70
        d.point((x, y), fill=(150, 150, 190) if x % 3 else (210, 210, 240))

    # Far mountains.
    d.polygon([(0, 112), (40, 100), (86, 108), (130, 96), (180, 106),
               (232, 98), (280, 108), (320, 102), (320, 180), (0, 180)],
              fill=(30, 20, 40))

    def block(x0, x1, top, body, lit, sign=None):
        d.rectangle([x0, top, x1, 150], fill=body)
        for wy in range(top + 4, 146, 5):
            for wx in range(x0 + 3, x1 - 2, 4):
                if (wx * 7 + wy * 3) % 5:
                    d.point((wx, wy), fill=lit)
        if sign:
            d.rectangle([x0 + 2, top - 5, x1 - 2, top - 2], fill=sign)

    # Casino blocks either side, with neon signs (no lettering).
    block(6, 44, 98, (26, 22, 36), (150, 120, 70), (220, 60, 60))
    block(48, 92, 84, (32, 26, 44), (170, 150, 90), (60, 210, 120))
    block(96, 128, 106, (24, 20, 34), (140, 110, 70), (240, 170, 50))
    block(192, 226, 102, (24, 20, 34), (140, 110, 70), (230, 80, 160))
    block(230, 272, 88, (32, 26, 44), (170, 150, 90), (240, 170, 50))
    block(276, 316, 100, (26, 22, 36), (150, 120, 70), (60, 200, 220))

    # The Lucky 38: shaft, ring of lit windows, saucer top, spire, beacon.
    cx = 160
    d.rectangle([cx - 10, 52, cx + 10, 150], fill=(44, 40, 52))
    d.rectangle([cx - 10, 52, cx - 7, 150], fill=(70, 64, 80))
    for wy in range(58, 148, 4):
        for wx in range(cx - 6, cx + 8, 3):
            if (wx + wy) % 7:
                d.point((wx, wy), fill=(220, 190, 110))
    d.polygon([(cx - 30, 44), (cx + 30, 44), (cx + 22, 52), (cx - 22, 52)],
              fill=(70, 64, 80))
    d.rectangle([cx - 30, 42, cx + 30, 44], fill=(110, 100, 120))
    for wx in range(cx - 26, cx + 27, 4):
        d.point((wx, 48), fill=(250, 210, 120))
    d.polygon([(cx - 14, 42), (cx + 14, 42), (cx + 8, 36), (cx - 8, 36)],
              fill=(56, 50, 66))
    d.line([(cx, 36), (cx, 12)], fill=(110, 100, 120), width=2)
    d.rectangle([cx - 1, 9, cx + 1, 11], fill=(255, 70, 60))

    # A neon glow around the base of the Strip.
    atmospheric_haze(im, 112, 156, (200, 90, 120), 40)

    # The boulevard, with lane dashes towards the tower.
    d = ImageDraw.Draw(im)
    d.rectangle([0, 150, 320, 180], fill=S_ROAD[0])
    d.polygon([(110, 180), (210, 180), (168, 150), (152, 150)], fill=S_ROAD[1])
    for y in (154, 160, 168, 177):
        d.line([(cx, y), (cx, y + 2)], fill=(200, 180, 110))

    return vignette(im, strength=140)


def sunset_hq_scene() -> Image.Image:
    """320 x 180: Sunset Sarsaparilla HQ at dusk, with its round sun sign."""
    im = Image.new("RGB", (320, 180), S_SKY[2])
    gradient(im, 0, 112, S_SKY)
    d = ImageDraw.Draw(im)

    # Far mesas and the desert floor.
    d.polygon([(0, 100), (44, 92), (90, 98), (140, 90), (196, 98),
               (250, 92), (320, 100), (320, 180), (0, 180)], fill=(78, 55, 52))
    d.rectangle([0, 112, 320, 180], fill=S_SAND[0])
    d.polygon([(0, 124), (120, 118), (240, 124), (320, 120), (320, 180),
               (0, 180)], fill=S_SAND[1])

    # The headquarters: a long, low building with a dark window band.
    d.rectangle([70, 96, 270, 146], fill=(196, 170, 128))
    d.rectangle([70, 96, 270, 100], fill=(150, 64, 48))
    d.rectangle([78, 108, 262, 120], fill=(46, 40, 44))
    for wx in range(84, 260, 12):
        d.rectangle([wx, 110, wx + 7, 118], fill=(214, 150, 80))
    d.rectangle([156, 124, 184, 146], fill=(60, 44, 40))
    d.rectangle([158, 126, 168, 146], fill=(110, 70, 52))
    d.rectangle([172, 126, 182, 146], fill=(110, 70, 52))
    d.line([(70, 146), (270, 146)], fill=(120, 96, 70))

    # A giant sarsaparilla bottle on the roof.
    d.rectangle([96, 64, 110, 96], fill=(92, 52, 34))
    d.rectangle([100, 52, 106, 64], fill=(92, 52, 34))
    d.rectangle([99, 49, 107, 52], fill=(210, 170, 70))
    d.rectangle([96, 74, 110, 84], fill=(232, 190, 80))
    d.line([(98, 66), (98, 94)], fill=(140, 86, 56))

    # The round sun sign on its mast: a half sun with rays, no lettering.
    cx, cy, r = 214, 44, 26
    d.rectangle([212, 70, 216, 96], fill=(70, 60, 60))
    d.ellipse([cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3], fill=(60, 40, 40))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(196, 72, 48))
    d.ellipse([cx - r + 4, cy - r + 4, cx + r - 4, cy + r - 4], fill=(232, 120, 60))
    for i in range(9):
        ang = math.pi + i * math.pi / 8
        d.line([(cx, cy + 6), (cx + math.cos(ang) * (r - 6), cy + 6 + math.sin(ang) * (r - 6))],
               fill=(250, 196, 90), width=2)
    d.pieslice([cx - 12, cy - 6, cx + 12, cy + 18], 180, 360, fill=(255, 214, 110))
    d.rectangle([cx - r + 4, cy + 8, cx + r - 4, cy + 14], fill=(150, 46, 40))

    atmospheric_haze(im, 86, 122, (224, 177, 121), 46)
    return vignette(im, strength=140)


def background_scene() -> Image.Image:
    """320 x 180: caravan halt at dusk, broken highway, raider watchtower."""
    im = Image.new("RGB", (320, 180), S_SKY[2])

    # Dusk sky, deeper than the card's dust storm.
    gradient(im, 0, 104, S_SKY)
    d = ImageDraw.Draw(im)

    # Low sun and its reflection band.
    d.ellipse([48, 62, 82, 96], fill=(226, 158, 96))
    d.ellipse([54, 68, 76, 90], fill=(240, 186, 120))
    d.line([(36, 96), (96, 96)], fill=(206, 138, 88))

    # Thin, broken cloud bands, kept away from the centre where UI text sits
    # and away from the watchtower so they cannot read as power lines.
    for y, x0, x1, c in (
        (20, 0, 84, S_SKY[3]), (28, 14, 122, S_SKY[2]),
        (37, 0, 62, S_SKY[3]), (48, 150, 214, S_SKY[3]),
        (16, 196, 300, S_SKY[2]),
    ):
        d.line([(x0, y), (x1, y + 2)], fill=c, width=2)
        d.line([(x0 + 8, y + 3), (x1 - 12, y + 3)], fill=S_SKY[2])

    # Far mesas / dunes.
    d.polygon([(0, 92), (38, 84), (74, 90), (112, 82), (148, 92),
               (188, 86), (226, 94), (262, 88), (300, 94), (320, 90),
               (320, 180), (0, 180)], fill=(78, 55, 52))
    d.polygon([(0, 100), (54, 94), (118, 100), (170, 95), (234, 102),
               (288, 96), (320, 100), (320, 180), (0, 180)], fill=S_SAND[0])
    d.polygon([(0, 112), (80, 106), (150, 112), (220, 106), (282, 112),
               (320, 108), (320, 180), (0, 180)], fill=S_SAND[1])

    # Watchtower on the right ridge, the raider-country note.
    watchtower(im, 244, 34, 46, 76, beacon=True)

    # Broken highway sweeping from the bottom-left to the horizon.
    d.polygon([(0, 180), (150, 180), (208, 108), (186, 108)],
              fill=(58, 54, 52))
    d.polygon([(12, 180), (136, 180), (204, 108), (191, 108)],
              fill=(74, 68, 62))
    d.line([(186, 108), (0, 180)], fill=(96, 84, 72), width=2)
    d.line([(208, 108), (150, 180)], fill=(96, 84, 72), width=2)
    # Cracks and a broken edge.
    d.line([(70, 126), (92, 140), (84, 152), (104, 166)], fill=(44, 41, 40))
    d.line([(108, 118), (116, 130)], fill=(44, 41, 40))
    d.line([(40, 160), (58, 152), (74, 160)], fill=(44, 41, 40))
    # Faded centre-line dashes, following the road's perspective.
    for t0, t1 in ((0.20, 0.26), (0.38, 0.44), (0.56, 0.62), (0.74, 0.80)):
        x0 = int(197 + (75 - 197) * t0)
        y0 = int(108 + 72 * t0)
        x1 = int(197 + (75 - 197) * t1)
        y1 = int(108 + 72 * t1)
        d.line([(x0, y0), (x1, y1)], fill=(154, 138, 106))
    # Rubble along the shoulder.
    for x, y in ((20, 174), (26, 171), (116, 173), (126, 170), (140, 168)):
        d.rectangle([x, y, x + 3, y + 2], fill=(92, 82, 70))

    # Caravan halt on the left: wagon with an arched canvas cover.
    d.rectangle([46, 116, 96, 123], fill=(84, 63, 48))          # bed
    d.rectangle([46, 116, 96, 118], fill=(108, 82, 60))         # side rail
    d.ellipse([50, 96, 92, 120], fill=(150, 138, 110))          # canvas
    d.rectangle([50, 108, 92, 120], fill=(150, 138, 110))
    d.ellipse([54, 99, 88, 119], fill=(177, 164, 132))
    d.rectangle([54, 108, 88, 119], fill=(177, 164, 132))
    for rib_x in (58, 66, 74, 82):
        d.line([(rib_x, 101), (rib_x, 118)], fill=(128, 118, 94))
    d.line([(51, 119), (91, 119)], fill=(104, 95, 76))
    # Wheels.
    for wx in (51, 85):
        d.ellipse([wx, 118, wx + 16, 134], fill=(46, 38, 33))
        d.ellipse([wx + 4, 122, wx + 12, 130], fill=(84, 63, 48))
        d.line([(wx + 8, 119), (wx + 8, 133)], fill=(120, 96, 68))
        d.line([(wx + 1, 126), (wx + 15, 126)], fill=(120, 96, 68))
    # Crates and a tarp by the wagon.
    d.rectangle([97, 116, 108, 128], fill=(105, 78, 52))
    d.rectangle([97, 116, 108, 118], fill=(135, 104, 70))
    d.rectangle([100, 120, 104, 124], fill=(78, 57, 40))
    d.polygon([(110, 128), (126, 124), (130, 130), (112, 134)],
              fill=(122, 106, 84))

    # Small camp fire, warm note against the dusk.
    d.rectangle([118, 130, 124, 132], fill=(64, 48, 38))
    d.polygon([(119, 130), (121, 124), (123, 130)], fill=S_FIRE)
    d.point((121, 127), fill=(246, 206, 132))
    d.point((120, 128), fill=(240, 170, 86))

    # Two tiny caravan figures by the fire (silhouettes, not character art).
    d.rectangle([130, 118, 134, 129], fill=(58, 50, 46))        # body
    d.rectangle([131, 113, 133, 117], fill=(58, 50, 46))        # head
    d.line([(130, 130), (130, 133)], fill=(58, 50, 46))         # legs
    d.line([(134, 130), (134, 133)], fill=(58, 50, 46))
    d.line([(130, 120), (126, 124)], fill=(58, 50, 46))         # arm to fire
    d.rectangle([138, 122, 141, 130], fill=(52, 45, 42))
    d.rectangle([139, 118, 140, 121], fill=(52, 45, 42))
    d.line([(138, 131), (138, 133)], fill=(52, 45, 42))
    d.line([(141, 131), (141, 133)], fill=(52, 45, 42))

    # Low haze at the horizon, then the vignette that protects UI text.
    haze(im, [(0, 100, 320, 104, 2), (0, 94, 320, 98, 1)],
         (198, 140, 96), 26)
    return vignette(im, strength=176, start=0.40, end=1.02)


def outlined_layer(size, draw_fn) -> Image.Image:
    """Draw on a clear RGBA layer, then give the silhouette a 1 px INK ring."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    return outline(layer)


def wrangler_scene() -> Image.Image:
    """320 x 180: Freeside at night, the Atomic Wrangler's neon hat sign."""
    im = Image.new("RGB", (320, 180), (10, 9, 20))
    gradient(im, 0, 120, [(8, 8, 20), (14, 12, 30), (28, 18, 40), (54, 28, 46)])
    d = ImageDraw.Draw(im)

    # Stars over the wall.
    seed = 4242
    for _ in range(40):
        seed = (seed * 1103515245 + 12345) % (2 ** 31)
        x = seed % 320
        seed = (seed * 1103515245 + 12345) % (2 ** 31)
        d.point((x, seed % 50), fill=(150, 150, 190))

    # Freeside's patchwork wall and the ruined block behind it.
    d.rectangle([0, 70, 70, 150], fill=(34, 28, 34))
    d.rectangle([250, 64, 320, 150], fill=(36, 30, 36))
    for x0 in range(0, 320, 26):
        d.rectangle([x0, 112, x0 + 22, 150], fill=(48, 40, 40) if x0 % 52 else (56, 46, 42))
        d.line([(x0 + 3, 118), (x0 + 19, 118)], fill=(70, 58, 50))

    # The saloon facade: false front, porch roof and posts.
    d.rectangle([84, 56, 236, 150], fill=(78, 52, 38))
    d.rectangle([84, 56, 236, 62], fill=(104, 70, 48))
    for x0 in range(88, 236, 8):
        d.line([(x0, 64), (x0, 150)], fill=(66, 44, 32))
    d.rectangle([96, 104, 224, 108], fill=(58, 38, 28))
    for x0 in (98, 140, 180, 222):
        d.rectangle([x0, 108, x0 + 3, 150], fill=(56, 36, 26))
    # Warm doorway and windows.
    d.rectangle([148, 118, 172, 150], fill=(40, 24, 18))
    d.rectangle([150, 120, 159, 150], fill=(232, 168, 84))
    d.rectangle([161, 120, 170, 150], fill=(214, 146, 70))
    for x0 in (106, 190):
        d.rectangle([x0, 118, x0 + 20, 134], fill=(222, 156, 76))
        d.line([(x0 + 10, 118), (x0 + 10, 134)], fill=(120, 70, 40))

    # The neon sign: a cowboy hat ringed by atom orbits, no lettering.
    cx, cy = 160, 34
    d.ellipse([cx - 44, cy - 10, cx + 44, cy + 10], outline=(80, 240, 200))
    d.ellipse([cx - 40, cy - 22, cx + 40, cy + 22], outline=(255, 90, 170))
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 240, 160))
    d.polygon([(cx - 30, cy + 6), (cx + 30, cy + 6), (cx + 22, cy + 10),
               (cx - 22, cy + 10)], fill=(255, 196, 70))
    d.polygon([(cx - 14, cy + 6), (cx - 12, cy - 10), (cx, cy - 6),
               (cx + 12, cy - 10), (cx + 14, cy + 6)], fill=(255, 176, 50))
    d.line([(cx - 12, cy + 2), (cx + 12, cy + 2)], fill=(200, 60, 60), width=2)
    d.rectangle([cx - 2, cy + 22, cx + 2, 56], fill=(60, 50, 50))

    # String lights along the porch roof.
    for i, x0 in enumerate(range(90, 232, 7)):
        d.point((x0, 101 + (i % 2)), fill=(255, 210, 120) if i % 3 else (255, 120, 120))

    # A burning barrel by the wall.
    d.rectangle([34, 132, 50, 152], fill=(86, 46, 36))
    d.line([(34, 138), (50, 138)], fill=(60, 34, 28))
    d.polygon([(36, 132), (42, 118), (44, 126), (48, 116), (49, 132)], fill=(255, 150, 60))
    d.polygon([(39, 132), (43, 124), (46, 132)], fill=(255, 220, 120))

    atmospheric_haze(im, 96, 150, (220, 100, 140), 34)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 150, 320, 180], fill=S_ROAD[0])
    d.line([(0, 151), (320, 151)], fill=S_ROAD[2])
    for x0 in (30, 120, 210, 290):
        d.line([(x0, 162), (x0 + 14, 166)], fill=S_ROAD[1])
    return vignette(im, strength=140)


def title_scene() -> Image.Image:
    """320 x 180 title card: New Vegas at dusk, a far mushroom cloud, and a
    Pip-Boy, a power armor helmet and a Nuka-Cola bottle in the sand."""
    im = Image.new("RGB", (320, 180), S_SKY[2])
    gradient(im, 0, 124, [(16, 14, 34), (34, 24, 50), (74, 40, 60),
                          (132, 64, 62), (196, 106, 70), (232, 160, 96)])
    d = ImageDraw.Draw(im)
    seed = 777
    for _ in range(45):
        seed = (seed * 1103515245 + 12345) % (2 ** 31)
        x = seed % 320
        seed = (seed * 1103515245 + 12345) % (2 ** 31)
        d.point((x, seed % 46), fill=(170, 160, 200))

    # Far mushroom cloud on the right horizon, clear of the bottle.
    mx = 232
    d.polygon([(mx - 6, 120), (mx - 4, 70), (mx + 4, 70), (mx + 6, 120)], fill=(170, 84, 56))
    d.line([(mx - 2, 72), (mx - 3, 118)], fill=(214, 120, 70))
    d.ellipse([mx - 22, 84, mx + 22, 94], fill=(150, 72, 54))
    d.ellipse([mx - 30, 34, mx + 30, 74], fill=(150, 66, 52))
    d.ellipse([mx - 26, 32, mx + 26, 66], fill=(206, 104, 64))
    d.ellipse([mx - 18, 34, mx + 18, 58], fill=(240, 152, 78))
    d.ellipse([mx - 10, 38, mx + 10, 52], fill=(255, 210, 120))
    atmospheric_haze(im, 26, 80, (255, 170, 90), 28)

    # Mesas and the Strip skyline, the Lucky 38 rising above.
    d = ImageDraw.Draw(im)
    d.polygon([(0, 112), (36, 104), (70, 110), (110, 100), (150, 108),
               (200, 102), (320, 112), (320, 124), (0, 124)], fill=(70, 42, 52))
    for x0, x1, top in ((70, 88, 96), (90, 104, 90), (136, 152, 94),
                        (154, 170, 100), (176, 190, 104)):
        d.rectangle([x0, top, x1, 124], fill=(40, 30, 44))
        for wy in range(top + 3, 122, 4):
            for wx in range(x0 + 2, x1 - 1, 3):
                if (wx * 5 + wy) % 4:
                    d.point((wx, wy), fill=(200, 160, 96))
    cx = 120
    d.rectangle([cx - 6, 54, cx + 6, 124], fill=(52, 44, 58))
    d.rectangle([cx - 6, 54, cx - 4, 124], fill=(80, 70, 88))
    for wy in range(58, 122, 3):
        for wx in range(cx - 3, cx + 5, 2):
            if (wx + wy) % 5:
                d.point((wx, wy), fill=(232, 200, 120))
    d.polygon([(cx - 18, 48), (cx + 18, 48), (cx + 12, 54), (cx - 12, 54)], fill=(80, 70, 88))
    d.rectangle([cx - 18, 46, cx + 18, 48], fill=(120, 108, 130))
    d.polygon([(cx - 8, 46), (cx + 8, 46), (cx + 4, 41), (cx - 4, 41)], fill=(64, 56, 74))
    d.line([(cx, 41), (cx, 26)], fill=(120, 108, 130))
    d.rectangle([cx - 1, 24, cx + 1, 25], fill=(255, 70, 60))
    atmospheric_haze(im, 100, 128, (240, 150, 100), 40)

    # Desert floor.
    d = ImageDraw.Draw(im)
    gradient(im, 124, 180, [S_SAND[1], S_SAND[2], S_SAND[3]])
    d = ImageDraw.Draw(im)
    d.line([(40, 140), (90, 136)], fill=S_SAND[0])
    d.line([(200, 150), (260, 146)], fill=S_SAND[0])

    shadows = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadows)
    for box in ([6, 158, 106, 174], [116, 166, 210, 180], [268, 164, 316, 178]):
        sd.ellipse(box, fill=(40, 26, 20, 110))
    im = Image.alpha_composite(im.convert("RGBA"), shadows)

    # Power armor helmet (left): a T-51 helmet traced from a reference
    # photo. Every shape is written in the photo's own 600 x 900 pixel
    # coordinates and mapped onto the canvas by P() (scale 0.21), so parts
    # keep their true positions and proportions.
    def helmet(dd):
        S, OX, OY = 0.21, 4, 82

        def P(x, y):
            return (OX + (x - 70) * S, OY + (y - 258) * S)

        def poly_ref(points, fill):
            dd.polygon([P(x, y) for x, y in points], fill=fill)

        def circle_ref(x, y, r, fill):
            cx2, cy2 = P(x, y)
            rr = r * S
            dd.ellipse([cx2 - rr, cy2 - rr, cx2 + rr, cy2 + rr], fill=fill)

        black, visor = (18, 20, 24, 255), (62, 72, 74, 255)
        dark, mid = (50, 54, 60, 255), (116, 122, 130, 255)
        light, hi = (168, 174, 182, 255), (214, 218, 224, 255)

        def slatted(x, y, r, ring):
            circle_ref(x, y, r, dark)
            circle_ref(x, y, r - 3, ring)
            circle_ref(x, y, r - 8, black)
            cx2, cy2 = P(x, y)
            inner = (r - 8) * S
            gx = cx2 - inner + 1.5
            while gx < cx2 + inner - 1:
                h = (max(0.0, inner ** 2 - (gx - cx2) ** 2)) ** 0.5
                if h > 1:
                    dd.line([(round(gx), round(cy2 - h + 1)), (round(gx), round(cy2 + h - 1))], fill=mid)
                gx += 2

        def hose(points, width):
            """Corrugated hose: a chain of silver beads across the run, each
            lit on top and shaded below, with dark gaps between them."""
            pts = [P(x, y) for x, y in points]
            w = width * S
            dd.line(pts, fill=black, width=max(3, round(w)))
            gap = max(3.0, w * 0.42)
            carry = 0.0
            for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                length = math.hypot(x1 - x0, y1 - y0) or 1
                along_x = abs(x1 - x0) >= abs(y1 - y0)
                d = carry
                while d <= length:
                    t = d / length
                    x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
                    a, b = (gap * 0.55, w / 2) if along_x else (w / 2, gap * 0.55)
                    dd.ellipse([x - a, y - b, x + a, y + b], fill=mid)
                    dd.ellipse([x - a + 0.5, y - b + 0.5, x + a - 0.5, y + b * 0.2], fill=light)
                    dd.point((round(x - a * 0.3), round(y - b * 0.6)), fill=hi)
                    d += gap
                carry = d - length

        # Hoses' upper runs, which pass behind the shell.
        hose([(72, 580), (80, 540), (110, 495), (140, 465), (160, 445)], 50)
        hose([(528, 560), (515, 510), (490, 470), (460, 450), (440, 435)], 50)

        # Ear rings at the ends of the visor.
        for box in ((116, 370, 160, 438), (424, 352, 470, 438)):
            x0, y0 = P(box[0], box[1])
            x1, y1 = P(box[2], box[3])
            dd.ellipse([x0, y0, x1, y1], fill=dark)
            dd.ellipse([x0 + 2, y0 + 2, x1 - 2, y1 - 2], fill=light)
            dd.ellipse([x0 + 3, y0 + 4, x1 - 3, y1 - 4], fill=mid)

        # The shell: flat-topped crest, round dome, tapering mask to the chin.
        poly_ref([(252, 262), (327, 260), (360, 268), (392, 290), (410, 320), (422, 350),
                  (432, 385), (440, 430), (446, 470), (445, 510), (430, 560), (405, 605),
                  (375, 640), (345, 666), (300, 672), (255, 666), (225, 640), (195, 605),
                  (170, 560), (155, 510), (152, 470), (150, 430), (150, 385), (155, 345),
                  (168, 315), (190, 288), (220, 270)], mid)
        poly_ref([(250, 440), (340, 440), (360, 520), (340, 600), (300, 640), (260, 600),
                  (238, 520)], light)                                   # lit mask centre
        poly_ref([(400, 300), (420, 340), (430, 385), (410, 385), (402, 330)], dark)
        poly_ref([(420, 450), (440, 470), (438, 520), (420, 560), (412, 520)], dark)

        # Crest plate with the round slatted intake.
        poly_ref([(250, 262), (330, 260), (340, 300), (340, 365), (320, 385), (290, 393),
                  (262, 385), (244, 365), (244, 300)], light)
        dd.line([P(244, 300), P(244, 365)], fill=dark)
        dd.line([P(340, 300), P(340, 365)], fill=dark)
        slatted(291, 325, 38, light)

        # Louvred vents either side of the crest.
        for x0, y0, x1, y1 in ((214, 308, 244, 380), (336, 304, 368, 374)):
            a0, b0 = P(x0, y0)
            a1, b1 = P(x1, y1)
            dd.rectangle([a0, b0, a1, b1], fill=black)
            yy = b0 + 1
            while yy < b1:
                dd.line([(a0 + 1, yy), (a1 - 1, yy)], fill=mid)
                yy += 2

        # Visor frame and the wide visor, its top dipping at the centre.
        poly_ref([(148, 364), (290, 394), (434, 358), (438, 434), (148, 438)], light)
        poly_ref([(172, 378), (290, 405), (418, 372), (418, 424), (172, 426)], visor)
        poly_ref([(172, 410), (418, 408), (418, 424), (172, 426)], (84, 98, 100, 255))   # reflection
        dd.line([P(180, 384), P(260, 402)], fill=(120, 146, 152, 255))   # glint

        # Centre ridge down into the round slatted chin grille.
        a0, b0 = P(281, 440)
        a1, b1 = P(306, 578)
        dd.rectangle([a0, b0, a1, b1], fill=light)
        a0, b0 = P(289, 448)
        a1, b1 = P(298, 572)
        dd.rectangle([a0, b0, a1, b1], fill=black)
        slatted(300, 617, 50, light)

        # Mesh cheek grilles.
        for x, y in ((240, 502), (352, 492)):
            circle_ref(x, y, 24, dark)
            circle_ref(x, y, 21, hi)
            circle_ref(x, y, 15, black)
            cx2, cy2 = P(x, y)
            for mx in (-1, 0, 1):
                for my in (-1, 0, 1):
                    if (mx + my) % 2 == 0:
                        dd.point((round(cx2 + mx), round(cy2 + my)), fill=light)

        # Hook pipes from under the visor, curving down the cheeks.
        for pts in (((214, 446), (196, 460), (176, 482), (160, 508), (152, 534)),
                    ((376, 446), (394, 460), (414, 482), (430, 508), (438, 534))):
            line_pts = [P(x, y) for x, y in pts]
            dd.line(line_pts, fill=black, width=6)
            dd.line(line_pts, fill=light, width=4)
            dd.line(line_pts, fill=hi, width=1)
            for jx, jy in (line_pts[0], line_pts[2]):                   # joint rings
                dd.ellipse([jx - 3, jy - 3, jx + 3, jy + 3], fill=dark)
                dd.ellipse([jx - 2, jy - 2, jx + 2, jy + 2], fill=light)

        # The big corrugated hoses in front, from the cheeks out to the sides.
        hose([(252, 596), (205, 604), (150, 606), (100, 598), (72, 580)], 76)
        hose([(348, 596), (400, 604), (460, 596), (505, 578), (528, 560)], 76)

        # Headlamp on its wire arm, top left.
        dd.line([P(168, 298), P(138, 304), P(134, 340), P(138, 382)], fill=dark, width=2)
        circle_ref(205, 300, 40, dark)
        circle_ref(205, 296, 35, light)
        circle_ref(205, 296, 27, mid)
        circle_ref(203, 290, 18, hi)
    im = Image.alpha_composite(im, outlined_layer(im.size, helmet))

    # Pip-Boy 3000 (centre): screen glowing green, knobs, wrist cuff.
    def pipboy(dd):
        body, body_l, body_d = (112, 100, 70, 255), (150, 138, 98, 255), (76, 66, 46, 255)
        dd.rectangle([118, 150, 132, 172], fill=body_d)
        dd.rectangle([196, 150, 210, 172], fill=body_d)
        dd.rectangle([128, 140, 200, 176], fill=body)
        dd.rectangle([128, 140, 200, 143], fill=body_l)
        dd.rectangle([134, 146, 172, 170], fill=(20, 24, 18, 255))
        dd.rectangle([136, 148, 170, 168], fill=(28, 92, 34, 255))
        for sy in range(149, 168, 2):
            dd.line([(136, sy), (170, sy)], fill=(36, 112, 40, 255))
        for i, h in enumerate((6, 10, 4, 12, 8)):
            dd.rectangle([140 + i * 6, 164 - h, 143 + i * 6, 164], fill=(150, 255, 140, 255))
        dd.ellipse([178, 146, 190, 158], fill=body_d)
        dd.ellipse([180, 148, 188, 156], fill=(180, 168, 120, 255))
        dd.ellipse([178, 160, 186, 168], fill=body_d)
        dd.ellipse([189, 160, 197, 168], fill=body_d)
        dd.rectangle([192, 146, 196, 150], fill=(220, 60, 50, 255))
    im = Image.alpha_composite(im, outlined_layer(im.size, pipboy))

    # Nuka-Cola bottle (right): curvy glass, red label band, cap on top.
    def bottle(dd):
        glass, glass_l = (110, 26, 30, 255), (170, 60, 60, 255)
        half = [(4, 0), (4, 12), (9, 22), (11, 32), (8, 44), (10, 56), (13, 70), (13, 78)]
        bx, by = 292, 92
        pts = [(bx + x, by + y) for x, y in half] + [(bx - x, by + y) for x, y in reversed(half)]
        dd.polygon(pts, fill=glass)
        dd.line([(bx - 6, by + 24), (bx - 8, by + 34)], fill=glass_l, width=2)
        dd.line([(bx - 9, by + 58), (bx - 11, by + 74)], fill=glass_l, width=2)
        dd.rectangle([bx - 10, by + 40, bx + 9, by + 52], fill=(218, 58, 48, 255))
        dd.line([(bx - 8, by + 48), (bx - 2, by + 44), (bx + 4, by + 48), (bx + 8, by + 44)],
                fill=(240, 236, 220, 255))
        dd.rectangle([bx - 5, by - 4, bx + 5, by], fill=(200, 200, 206, 255))
        dd.line([(bx - 5, by - 4), (bx + 5, by - 4)], fill=(240, 240, 244, 255))
    im = Image.alpha_composite(im, outlined_layer(im.size, bottle))

    # Bottle caps scattered in the sand.
    def caps(dd):
        for cx2, cy2, red in ((110, 172, True), (226, 172, False), (258, 168, True),
                              (112, 160, False), (236, 158, True)):
            fill = (218, 58, 48, 255) if red else (240, 190, 60, 255)
            dd.ellipse([cx2 - 3, cy2 - 2, cx2 + 3, cy2 + 2], fill=fill)
            dd.point((cx2 - 1, cy2 - 1), fill=(255, 230, 200, 255))
    im = Image.alpha_composite(im, outlined_layer(im.size, caps))

    return vignette(im.convert("RGB"), strength=110, start=0.5, end=1.08)


# ---------------------------------------------------------------------------
# Saving and verification
# ---------------------------------------------------------------------------

def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # No pnginfo: Pillow then writes no tIME / text chunks, so bytes are stable.
    im.save(path, format="PNG", optimize=True, compress_level=9)


def upscale(im: Image.Image, factor: int) -> Image.Image:
    return im.resize((im.width * factor, im.height * factor),
                     Image.Resampling.NEAREST)


def sha16(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def verify() -> list[str]:
    """Fail loudly on the wrong size, mode, alpha or file weight."""
    problems: list[str] = []
    print("verification:")
    sprites = [SPRITE_DIR / f"{name}.png" for name in (
        "chest_a", "chest_b", "chest_c", "chest_d",
        "trader", "raider", "icon_caps",
    )] + [WASTELAND_DIR / f"{name}.png" for name in WASTELAND_SPRITES]
    for path in sprites:
        with Image.open(path) as im:
            if im.size != (32, 32):
                problems.append(f"{path.name}: {im.size} != (32, 32)")
            if im.mode != "RGBA":
                problems.append(f"{path.name}: mode {im.mode} != RGBA")
            alpha = im.getchannel("A")
            lo, hi = alpha.getextrema()
            if lo != 0 or hi != 255:
                problems.append(
                    f"{path.name}: alpha range {lo}..{hi}, expected 0..255")
            if alpha.getbbox() is None:
                problems.append(f"{path.name}: fully transparent")
            print(f"  {path.name:<14} {im.size[0]}x{im.size[1]} {im.mode} "
                  f"alpha {lo}..{hi}  {path.stat().st_size:>5} B  "
                  f"sha256:{sha16(path)}")

    card = CARD_DIR / "hub_allais.png"
    with Image.open(card) as im:
        if im.size != (640, 360):
            problems.append(f"hub_allais.png: {im.size} != (640, 360)")
        if im.mode != "RGB":
            problems.append(f"hub_allais.png: mode {im.mode} != RGB")
        print(f"  {'hub_allais.png':<14} {im.size[0]}x{im.size[1]} {im.mode} "
              f"opaque          {card.stat().st_size:>5} B  "
              f"sha256:{sha16(card)}")
    if card.stat().st_size > 150 * 1024:
        problems.append(f"hub_allais.png: {card.stat().st_size} B > 150 KB")

    bg = BG_DIR / "allais_bg.png"
    with Image.open(bg) as im:
        if im.size != (1280, 720):
            problems.append(f"allais_bg.png: {im.size} != (1280, 720)")
        if im.mode != "RGB":
            problems.append(f"allais_bg.png: mode {im.mode} != RGB")
        print(f"  {'allais_bg.png':<14} {im.size[0]}x{im.size[1]} {im.mode} "
              f"opaque          {bg.stat().st_size:>5} B  "
              f"sha256:{sha16(bg)}")
    if bg.stat().st_size > 400 * 1024:
        problems.append(f"allais_bg.png: {bg.stat().st_size} B > 400 KB")

    title = CARD_DIR / "title_card.png"
    with Image.open(title) as im:
        if im.size != (640, 360):
            problems.append(f"title_card.png: {im.size} != (640, 360)")
        print(f"  {'title_card.png':<14} {im.size[0]}x{im.size[1]} {im.mode} "
              f"opaque          {title.stat().st_size:>5} B  "
              f"sha256:{sha16(title)}")
    if title.stat().st_size > 150 * 1024:
        problems.append(f"title_card.png: {title.stat().st_size} B > 150 KB")

    for name in ("strip_bg.png", "sunset_bg.png", "wrangler_bg.png"):
        extra = BG_DIR / name
        with Image.open(extra) as im:
            if im.size != (1280, 720):
                problems.append(f"{name}: {im.size} != (1280, 720)")
            print(f"  {name:<14} {im.size[0]}x{im.size[1]} {im.mode} "
                  f"opaque          {extra.stat().st_size:>5} B  "
                  f"sha256:{sha16(extra)}")
        if extra.stat().st_size > 400 * 1024:
            problems.append(f"{name}: {extra.stat().st_size} B > 400 KB")
    return problems


def main() -> None:
    SPRITE_DIR.mkdir(parents=True, exist_ok=True)
    CARD_DIR.mkdir(parents=True, exist_ok=True)
    BG_DIR.mkdir(parents=True, exist_ok=True)

    sprites = {
        "chest_a": sprite_chest_a,
        "chest_b": sprite_chest_b,
        "chest_c": sprite_chest_c,
        "chest_d": sprite_chest_d,
        "trader": sprite_trader,
        "raider": sprite_raider,
        "icon_caps": sprite_icon_caps,
    }
    for name, builder in sprites.items():
        path = SPRITE_DIR / f"{name}.png"
        save_png(builder(), path)
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} B)")

    WASTELAND_DIR.mkdir(parents=True, exist_ok=True)
    for name, builder in WASTELAND_SPRITES.items():
        path = WASTELAND_DIR / f"{name}.png"
        save_png(builder(), path)
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} B)")

    card = CARD_DIR / "hub_allais.png"
    save_png(upscale(card_scene(), 2), card)
    print(f"wrote {card.relative_to(ROOT)} ({card.stat().st_size} B)")

    bg = BG_DIR / "allais_bg.png"
    save_png(upscale(background_scene(), 4), bg)
    print(f"wrote {bg.relative_to(ROOT)} ({bg.stat().st_size} B)")

    strip = BG_DIR / "strip_bg.png"
    save_png(upscale(strip_scene(), 4), strip)
    print(f"wrote {strip.relative_to(ROOT)} ({strip.stat().st_size} B)")

    sunset = BG_DIR / "sunset_bg.png"
    save_png(upscale(sunset_hq_scene(), 4), sunset)
    print(f"wrote {sunset.relative_to(ROOT)} ({sunset.stat().st_size} B)")

    wrangler = BG_DIR / "wrangler_bg.png"
    save_png(upscale(wrangler_scene(), 4), wrangler)
    print(f"wrote {wrangler.relative_to(ROOT)} ({wrangler.stat().st_size} B)")

    title = CARD_DIR / "title_card.png"
    save_png(upscale(title_scene(), 2), title)
    print(f"wrote {title.relative_to(ROOT)} ({title.stat().st_size} B)")

    problems = verify()
    if problems:
        raise SystemExit("make_sprites: verification FAILED\n  - " +
                         "\n  - ".join(problems))
    print(f"verified: {7 + len(WASTELAND_SPRITES)} sprites 32x32 RGBA with alpha; card 640x360 RGB; "
          "background 1280x720 RGB; all size caps satisfied")


if __name__ == "__main__":
    main()
