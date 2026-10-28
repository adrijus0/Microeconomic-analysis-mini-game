# ASSETS — what art is needed, in what format, and how to swap it

This is the shopping list for the mini-games. **Nothing here has to exist before Phase 2**: the engine renders a labelled coloured placeholder and logs a warning for any missing key, so a game is never broken by absent art. Drop a file in, add one line to `config.js`, reload — no code changes, no build step.

---

## 1. The rules

### File format

| Kind | Canvas | Format | Notes |
|---|---|---|---|
| **sprite** (objects, NPCs, icons) | **32 × 32 px** native art, 1 image pixel = 1 art pixel | PNG-24 with alpha | transparent background, no text, no drop shadow; displayed at **64 or 128 CSS px** (2× or 4×, always integer) with `image-rendering: pixelated` |
| **portrait** (NPC close-up) | 256 × 256 px | PNG-24 with alpha | *reserved — no key uses it yet; optional* |
| **background** (scene) | **1280 × 720 px** (16:9) | PNG or WebP, ≤ 400 KB | low contrast and darker at the edges so white text stays readable; **no baked-in text** |
| **card** (hub thumbnail) | 640 × 360 px | PNG or WebP, ≤ 150 KB | one clear silhouette, readable at 160 px wide |
| **ui** (logo, badges) | as noted | PNG or SVG | the university logo stays as-is |
| **audio** (optional) | — | OGG/MP3, ≤ 100 KB | muted by default; all prototype sounds are generated in code, no files needed |

Other formats (JPG, SVG, animated GIF, sprite sheets) work if you add `kind` explicitly, but PNG-24 with alpha is the safe default. Keep every file **lowercase, ASCII, snake_case**, no spaces.

### The one-line swap

`docs/config.js` is the only place paths live. Code refers to **keys**, never to files:

```js
assets: {
  allais_chest_a: {
    file: "assets/sprites/allais/chest_vault.png",
    alt: "A sealed steel strongbox",   // read by screen readers
    kind: "sprite",
    w: 32, h: 32
  },
  // …
}
```

If you replace a file but keep the name, you change **nothing**. If you rename it, change only the `file` string. If you omit `file`, the engine looks for `assets/<kind>/<key>.png` by convention. One key is pinned: `ui_mif` → `assets/ui/mif.png` (the copied university logo), because its source filename is already fixed.

### If a key is missing

The engine draws a coloured box with the key's name, logs `console.warn("[assets] missing: <key>")`, and continues. A broken path must never produce a blank screen.

---

## 2. Minimum set to ship the first game (Phase 2)

Ten files, and the game is complete:

| Key | Depicts | Kind | Size |
|---|---|---|---|
| `ui_mif` | university logo (already exists at `resources/MIF.png`) | ui | 244×244 (copy as-is) |
| `hub_allais` | hub card: a strongbox on a desert road | card | 640×360 |
| `allais_bg` | caravan halt at dusk, raider country behind | background | 1280×720 |
| `allais_chest_a` | sealed steel strongbox, clean | sprite | 32×32 |
| `allais_chest_b` | battered crate with a faint glow, raider-route | sprite | 32×32 |
| `allais_chest_c` | single canvas satchel | sprite | 32×32 |
| `allais_chest_d` | double-strapped satchel | sprite | 32×32 |
| `allais_trader` | caravan trader (flavour scene) | sprite | 32×32 |
| `icon_caps` | bottle-cap currency icon | sprite | 32×32 |
| `allais_raider` | raider silhouette (flavour/ambush) | sprite | 32×32 |

That is enough to ship: the resolve animation needs **no open-state art** — the engine shakes the closed sprite, flashes, and shows the outcome card. If you want a real open-chest frame, add `allais_chest_a_open` (etc.) and it will be used automatically when the key exists.

---

## 3. Full manifest

**Not in this manifest:** the probability triangle is generated in code (`Figures.triangleSVG()` in `docs/js/figures.js`) from the slide coordinates, so it is not an image asset and cannot go missing. The two prospect-theory plots are committed SVG files generated once by `tools/make_figures.py` (they live in `docs/assets/figures/`, not in this art list).

### Global / UI

| Key | Depicts | Kind | Size | Priority |
|---|---|---|---|---|
| `ui_mif` | Vilnius University MIF logo | ui | 244×244, as-is | **required** |
| `icon_caps` | Fallout-style bottle cap | sprite | 32×32 | **required** (Allais) |
| `icon_crowns` | Witcher-style gold crown coin | sprite | 32×32 | required (St. Petersburg) |
| `icon_eddies` | Cyberpunk-style credit chip | sprite | 32×32 | required (Ellsberg) |
| `icon_septims` | Skyrim-style septim | sprite | 32×32 | optional (framing) |
| `badge_independence` | cracked shield / broken chain | sprite | 32×32 | optional (Report Card) |
| `badge_ambiguity` | two crates, one fogged | sprite | 32×32 | optional |
| `badge_value` | coin with an infinity mark | sprite | 32×32 | optional |
| `badge_framing` | two speech bubbles, one dark | sprite | 32×32 | optional |
| `ui_placeholder` | generic "missing art" tile (optional — the engine draws one) | sprite | 32×32 | optional |

### Game 1 — The Caravan Lockboxes (Allais / Fallout)

| Key | Depicts | Kind | Size |
|---|---|---|---|
| `hub_allais` | strongbox on a desert road, sandstorm behind | card | 640×360 |
| `allais_bg` | caravan halt, broken highway, raider watchtower | background | 1280×720 |
| `allais_chest_a` | sealed steel strongbox, clean and intact | sprite | 32×32 |
| `allais_chest_b` | battered crate, faint glow, raider-route | sprite | 32×32 |
| `allais_chest_c` | single canvas satchel, one strap | sprite | 32×32 |
| `allais_chest_d` | double-strapped satchel, two tags | sprite | 32×32 |
| `allais_trader` | caravan trader in a duster, arms folded | sprite | 32×32 |
| `allais_raider` | raider silhouette with a pipe rifle | sprite | 32×32 |
| `icon_caps` | bottle cap | sprite | 32×32 |

### Game 2 — The Fixer's Crate (Ellsberg / Cyberpunk 2077)

| Key | Depicts | Kind | Size |
|---|---|---|---|
| `hub_ellsberg` | neon crate behind rain-streaked glass | card | 640×360 |
| `ellsberg_bg` | fixer's den: crates, screens, neon | background | 1280×720 |
| `ellsberg_crate_known` | open crate, contents labelled and counted | sprite | 32×32 |
| `ellsberg_crate_unknown` | sealed crate, question-mark stencil | sprite | 32×32 |
| `ellsberg_chip_ruby` | red chip/gem | sprite | 32×32 |
| `ellsberg_chip_emerald` | green chip/gem | sprite | 32×32 |
| `ellsberg_chip_sapphire` | blue chip/gem | sprite | 32×32 |
| `ellsberg_fixer` | fixer with mirrored glasses | sprite | 32×32 |
| `icon_eddies` | credit chip | sprite | 32×32 |

### Game 3 — The Doubling Contract (St. Petersburg / Witcher 3)

| Key | Depicts | Kind | Size |
|---|---|---|---|
| `hub_petersburg` | coin spinning over a tavern table | card | 640×360 |
| `stp_bg` | timber tavern, candlelight, contract board | background | 1280×720 |
| `stp_coin_heads` | gold coin, crown face | sprite | 32×32 |
| `stp_coin_tails` | gold coin, reverse | sprite | 32×32 |
| `stp_tavernkeeper` | tavernkeeper behind the bar | sprite | 32×32 |
| `stp_crown_pile` | pile of crowns, growing | sprite | 32×32 |
| `stp_contract` | wax-sealed contract | sprite | 32×32 |
| `icon_crowns` | crown coin | sprite | 32×32 |

### Game 4 — The Jarl's Orders (Framing / Skyrim)

| Key | Depicts | Kind | Size |
|---|---|---|---|
| `hub_framing` | dragon over a stone city | card | 640×360 |
| `framing_bg` | Whiterun walls, smoke on the horizon | background | 1280×720 |
| `framing_dragon` | dragon silhouette, wings spread | sprite | 32×32 |
| `framing_jarl` | Jarl on a throne, scroll in hand | sprite | 32×32 |
| `framing_scroll_a` | sealed plan scroll, blue ribbon | sprite | 32×32 |
| `framing_scroll_b` | sealed plan scroll, red ribbon | sprite | 32×32 |
| `framing_scroll_c` | same scroll, torn seal | sprite | 32×32 |
| `framing_scroll_d` | same scroll, black seal | sprite | 32×32 |
| `icon_citizens` | two small citizen figures | sprite | 32×32 |

### Optional 5th — The Hardcore Run (loss aversion / Fallout)

| Key | Depicts | Kind | Size |
|---|---|---|---|
| `hub_hardcore` | hub card: a campfire and a cracked backpack | card | 640×360 |
| `loss_bg` | dark survival camp (may reuse `allais_bg`) | background | 1280×720 |
| `loss_inventory` | backpack with a broken strap | sprite | 32×32 |
| `loss_coin` | coin balanced on an edge | sprite | 32×32 |

---

## 4. How to add or swap art (the 60-second version)

1. Put the file in `docs/assets/` — e.g. `docs/assets/sprites/allais/chest_vault.png`.
2. Open `docs/config.js` and point the key at it:
   ```js
   allais_chest_a: { file: "assets/sprites/allais/chest_vault.png", kind: "sprite", alt: "…" }
   ```
3. Reload. No rebuild, no server.

To **add a brand-new image** (say a banner for the hub): add a key that no code uses yet, then reference it in the game config with `sprite: "my_new_key"` — the engine resolves keys at runtime.

To **check everything before a phase**, run `python3 tools/check_assets.py` (built by subagent S5 in Phase 1): it reads `config.js`'s asset block, verifies every file exists, reports PNG dimensions against the expected size, and exits non-zero on a mismatch. The manifest above is its input.

---

## 5. If you want me to source art instead

Two options, with the caveat stated up front:

- **Original art, generated by me (default).** I generate 32 × 32 pixel sprites with Pillow in the style of each world (desert, neon, tavern, stone city). They are mine to give, safe to publish, and deliberately plain — placeholders you can replace.
- **Real game art supplied by you.** Drop the files in and map them in `config.js`. I will not download or extract assets from Fallout / Skyrim / The Witcher 3 / Cyberpunk 2077: those are copyrighted, the brief forbids ripped assets, and GitHub Pages (if the repo is public) publishes whatever is committed. For a private run this is your call; before sharing, swap the files or make the repo private.
- **Third-party art with a licence** (OpenGameArt, Kenney, itch.io packs): tell me which pack and its licence, and I will integrate it. Best long-term option if you want nicer art than I can generate.

Every asset entry can carry a `credit` string, which the Report Card's footer shows only if non-empty.
