# Phase 1 deck — archived

This directory is the Phase 1 reveal.js deck, moved out of `docs/` during the
Phase 3 Pip-Boy single-game rework. It is **not shipped** and is **not linked**
from the live site. It is kept as history, not as a maintained build.

## What is here

| Path | Original purpose |
|---|---|
| `docs/deck.html` | 35-slide reveal.js deck (29 source frames + 4 Try-it + References + QR) |
| `docs/css/deck.css` | deck layout, blocks, title slide and Try-it overlay |
| `docs/js/deck.js` | footline, figure injection, overflow safety net |
| `docs/js/tryit.js` | Try-it dialog and lazy game iframe |
| `docs/vendor/reveal/` | reveal.js 4.6.1 + math/notes plugins |
| `docs/vendor/qrcode/` | qrcode-generator 1.4.4 |
| `docs/assets/ui/mif.png` | Vilnius University logo (removed from the shipped site) |
| `docs/assets/figures/value-function.svg` | Phase 1 prospect-theory plot |
| `docs/assets/figures/probability-weighting.svg` | Phase 1 prospect-theory plot |

The deck's own `config.js`, `css/theme.css`, `js/figures.js` and
`vendor/katex/` were rewritten for the Phase 3 game and stayed in `docs/`.
This archive is therefore a static snapshot of the deck-specific files, not a
standalone runnable copy. The last complete deck was commit `58527b9`.

## What replaced it

The shipped site is one game, **The Caravan Lockboxes** (Allais / common
consequence), in `docs/index.html` and `docs/play.html`. It uses the
`#12FF12` Pip-Boy green palette, keeps the nine original pixel-art PNGs, and
shows a theory checkpoint after each contract instead of the Phase 2 ×1,000
simulation.

The LaTeX sources in `Microeconomic_analysis__Copy_/` were not touched.
