# Phase 2 — G2 art report (Allais: The Caravan Lockboxes)

**Builder:** G2. **Scope:** `tools/make_sprites.py`, seven 32×32 sprites,
the 640×360 hub card, the 1280×720 background, this report. No other file
was edited. `docs/config.js` was **not** touched by me (see §4).

All art is original geometric/pixel composition drawn from code with
Pillow; no downloads, no external image inputs, no copyrighted game art.
Genre mood only (desert caravan / raider country). No text is drawn into any
image.

---

## 1. Files produced

| File | Purpose |
|---|---|
| `tools/make_sprites.py` | Regenerates all nine PNGs from scratch; deterministic |
| `docs/assets/sprites/allais/chest_a.png` | sealed steel strongbox |
| `docs/assets/sprites/allais/chest_b.png` | battered crate, green seam glow |
| `docs/assets/sprites/allais/chest_c.png` | single canvas satchel |
| `docs/assets/sprites/allais/chest_d.png` | double-strapped leather satchel |
| `docs/assets/sprites/allais/trader.png` | caravan trader, arms folded |
| `docs/assets/sprites/allais/raider.png` | hooded raider with pipe rifle |
| `docs/assets/sprites/allais/icon_caps.png` | bottle-cap currency |
| `docs/assets/cards/hub_allais.png` | hub card, 640×360 |
| `docs/assets/backgrounds/allais_bg.png` | scene background, 1280×720 |

---

## 2. `assets` entries for `docs/config.js`

Merge these into the existing `assets: { … }` object. Paths are relative to
`docs/` and safe under the checker. Every entry carries `file`, `alt`,
`kind`, `w`, `h` as required.

```js
hub_allais: {
  file: "assets/cards/hub_allais.png",
  alt: "A steel strongbox alone on a broken desert road, with a raider watchtower and blowing dust behind",
  kind: "card",
  w: 640,
  h: 360
},
allais_bg: {
  file: "assets/backgrounds/allais_bg.png",
  alt: "A caravan halt at dusk beside a broken highway: a covered wagon, a small camp fire and a raider watchtower on the ridge",
  kind: "background",
  w: 1280,
  h: 720
},
allais_chest_a: {
  file: "assets/sprites/allais/chest_a.png",
  alt: "A sealed steel strongbox with brass hinges, a brass lock and a dark keyhole",
  kind: "sprite",
  w: 32,
  h: 32
},
allais_chest_b: {
  file: "assets/sprites/allais/chest_b.png",
  alt: "A battered wooden crate bound with rope, with a faint sickly-green glow in the lid seam",
  kind: "sprite",
  w: 32,
  h: 32
},
allais_chest_c: {
  file: "assets/sprites/allais/chest_c.png",
  alt: "A single-strap canvas satchel in sand-coloured cloth with a small brass buckle",
  kind: "sprite",
  w: 32,
  h: 32
},
allais_chest_d: {
  file: "assets/sprites/allais/chest_d.png",
  alt: "A double-strapped leather satchel with two brass buckles and two small tags",
  kind: "sprite",
  w: 32,
  h: 32
},
allais_trader: {
  file: "assets/sprites/allais/trader.png",
  alt: "A caravan trader in a wide hat, headwrap and duster coat, arms folded",
  kind: "sprite",
  w: 32,
  h: 32
},
allais_raider: {
  file: "assets/sprites/allais/raider.png",
  alt: "A hooded raider in dark scrap armour holding a pipe rifle, with red goggle glints",
  kind: "sprite",
  w: 32,
  h: 32
},
icon_caps: {
  file: "assets/sprites/allais/icon_caps.png",
  alt: "A bottle cap with a crimped silver rim and a brass face stamped with a four-point star",
  kind: "sprite",
  w: 32,
  h: 32
}
```

---

## 3. Verification (run on this machine)

Command: `python3 tools/make_sprites.py` — exits 0. The script's own
`verify()` fails loudly (non-zero `SystemExit`) on wrong dimensions, wrong
mode, missing alpha or a file over budget. All values below are read back
from the written PNGs.

| File | Dimensions | Mode | Alpha | Size | sha256 (first 16) |
|---|---|---|---|---|---|
| `chest_a.png` | 32 × 32 | RGBA | 0..255 (transparent border, opaque body) | 401 B | `d8c795cb0d45c3b4` |
| `chest_b.png` | 32 × 32 | RGBA | 0..255 | 541 B | `5d500e875597889d` |
| `chest_c.png` | 32 × 32 | RGBA | 0..255 | 446 B | `dc9fb30e0785c595` |
| `chest_d.png` | 32 × 32 | RGBA | 0..255 | 411 B | `086836d999489ce4` |
| `trader.png` | 32 × 32 | RGBA | 0..255 | 565 B | `5b14cd59a9b3bfdf` |
| `raider.png` | 32 × 32 | RGBA | 0..255 | 702 B | `e6b63e51ce502daf` |
| `icon_caps.png` | 32 × 32 | RGBA | 0..255 | 558 B | `ceeab81ac113c52c` |
| `hub_allais.png` | 640 × 360 | RGB | opaque, no alpha channel (full-bleed card) | 23 560 B (23.0 KB) | `5cfa86b6826a0d03` |
| `allais_bg.png` | 1280 × 720 | RGB | opaque, no alpha channel (full-bleed background) | 18 996 B (18.6 KB) | `0ed4d763475bbad2` |

Budgets: card 23 560 B ≤ 150 KB; background 18 996 B ≤ 400 KB. Sprites are
hundreds of bytes each.

Other checks performed:

- **Sprite alpha:** every sprite has fully transparent pixels at the border
  (bbox leaves at least a 1 px margin on all sides) and alpha values are only
  `0` or `255` — no anti-aliased edge pixels.
- **Palette size:** sprites use 7–16 unique RGBA colours each, including the
  outline. The card uses 761 colours and the background 189 colours after
  Bayer dithering/vignette blending (still well under the size caps).
- **PNG chunks:** only `IHDR`, `IDAT`, `IEND` — no `tIME`, `tEXt` or other
  metadata, so reruns cannot drift through timestamps.
- **Determinism:** the generator was rerun repeatedly, including a
  before/after hash comparison around the final run. `shasum -a 256` matched
  for all nine files and the run logs were identical: **byte-identical
  reruns**, not merely identical pixels.
- **No baked-in text** in any image (nothing is drawn with fonts anywhere in
  the script).

---

## 4. `tools/check_assets.py`

I did not edit `docs/config.js`. While I worked, the coordinator (or another
builder) added the nine entries; at the time of writing
`python3 tools/check_assets.py` reports **all 10 assets and both figures OK,
exit 0**, including these files:

```
OK   hub_allais         docs/assets/cards/hub_allais.png  640x360 RGB (expected 640x360)
OK   allais_bg          docs/assets/backgrounds/allais_bg.png  1280x720 RGB (expected 1280x720)
OK   allais_chest_a     docs/assets/sprites/allais/chest_a.png  32x32 RGBA (expected 32x32)
… (b–d, trader, raider, icon_caps all 32x32 RGBA)
```

If the coordinator replaces the entries with §2's block (longer alt text),
rerun the checker; paths and dimensions are unchanged, so it should still
pass. My earlier run before those entries existed saw only `ui_mif`; the
checker only validates what `config.js` declares, so it never needed to fail
on my account.

---

## 5. Drawing approach and palette (also in the script comments)

- **Sprites:** drawn directly on a 32×32 grid with Pillow rectangles,
  polygons and Bresenham lines. No anti-aliasing anywhere. A final pass
  expands the alpha mask by one pixel (`MaxFilter(3)`) and paints the ring in
  a single near-black ink (`#14161A`) to give every silhouette a deliberate
  1 px outline. All content is kept inside a 1 px safe margin.
- **Card/background:** composed on a 320×180 canvas, then enlarged with
  `NEAREST` ×2 (card) and ×4 (background). Sky gradients use a 4×4 Bayer
  dither between a handful of palette stops; the vignette is quantised to six
  darkening levels and dithered, keeping edges dark and low-contrast for
  white UI text while compressing to ~19–24 KB.
- **Palette:** shared desert/steel/brass family, e.g. ink `#14161A`;
  steel `#4A5560/#7C8A96/#AAB6C0`; brass `#7A5A24/#C9A227/#E8CD6A`;
  wood `#4A3524/#7B5A3A/#A17A4E`; canvas `#6B6247/#9A8F68/#C0B48A`;
  leather `#5B3A28/#8A5A3C/#B07A52`; sand `#9C8766/#C9B48D`; rust
  `#56302A/#7C4232`; the only saturated accents are the raider's red goggle
  glint and the bottle-cap brass. Full RGB tuples are defined at the top of
  `tools/make_sprites.py`.
- **Silhouette choices:** the trader has a wide hat and folded-arm bar; the
  raider has a hood, scrap pauldron, taped pipe rifle crossing the body and a
  muzzle breaking the frame, so the two read differently without relying on
  colour. The card's strongbox is outlined and sits against the lightest part
  of the road/dust so it still reads when the card is shown at 160 px wide.

---

## 6. What I could not verify

- **In-browser rendering.** I checked the sprites at 64 px and the card
  downsampled to 160×90 with Pillow, but I did not load `play.html` / the hub
  in a real browser at 64/128 CSS px with `image-rendering: pixelated`; the
  CSS/engine integration and any browser scaling differences are untested.
- **Background/UI legibility in situ.** The vignette and low-contrast edges
  are designed for white text, but I could not check the real UI overlay at
  375 / 1280 px (it does not exist yet in a form that uses these keys), nor
  the card's crop/aspect in the actual hub tile.
- **Screen-reader behaviour** of the alt strings; they are written for that
  purpose but not tested with VoiceOver/NVDA.
- **Human aesthetic review** and any cross-asset consistency with the other
  Phase 2 builders (Ellsberg/St. Petersburg/Framing art), which I did not see.
- The card and background are **RGB without an alpha channel** by design
  (full-bleed scenes). Browsers load them normally; if any engine code
  specifically requires RGBA for these kinds, that is the one integration
  detail to confirm.
