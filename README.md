# Wasteland Odds

A phone-first, Fallout: New Vegas–themed mini-game for the talk
*Paradoxes of Choices under Uncertainty* (Microeconomic analysis). Each deal
takes about a minute and ends with a reveal built from the lecture slides.

| Deal | Paradox | Slides | Deep link |
|---|---|---|---|
| Mr. House's Chip Toss | St. Petersburg | 6 | `play.html#stpetersburg` |
| The Crimson Caravan Contracts | Allais | 7–10 | `play.html#allais` |
| Festus's Cap Barrel | Ellsberg | 11–12 | `play.html#ellsberg` |
| The Atomic Wrangler Flip | Loss aversion | 13–14 | `play.html#lossaversion` |

Live site: <https://adrijus0.github.io/Microeconomic-analysis-mini-game/>
(GitHub Pages, served from `docs/`).

## Presenter tips

- Put the QR code on the site root. Players land on the title screen, then the map.
- To send the room to one deal while its slide is up, share its deep link (see the table).
- Every deal draws fresh random flips and caps. `?fast=1` skips the travel beats and animations.
- The caps wallet (top right) starts at 100, slide 6's w. A deal's caps lock in at its reveal, and a replay replaces them, so caps can't be farmed. St. Petersburg uses the wallet you bring as Bernoulli's w (100 → 7.79 caps, 2,500 → 12.25).
- 8-bit sound is on by default; the "♪ Sound on/off" switch (same on every page) turns it off, remembered per phone. Browsers only allow sound after a tap, so the title page starts with "Tap to power on" (and so does a deal or the Report Card opened fresh by a deep link or a reload). The normal title → map → deals flow needs that one tap only.
- Progress and caps stay on each phone (localStorage). "Wipe Pip-Boy memory" on the map resets both.

## Development

No build step: open `docs/index.html`, or run `python3 -m http.server -d docs`.

```bash
node tools/test_allais_verdicts.mjs   # Allais verdict algebra
node tools/test_paradoxes.mjs         # St. Petersburg, Ellsberg, wallet, config + copy budget
python3 tools/check_assets.py         # every asset in config.js exists
python3 tools/make_sprites.py         # regenerate the pixel art (deterministic)
```

Content (story text, numbers, crowd shares, slide references) lives in
`docs/config.js`. The maths for each paradox is in `docs/js/games/`.

Fan-made class project, not affiliated with Bethesda. All art is original and drawn from code.
