# CONVERSION_NOTES — LaTeX deck → reveal.js

**Phase 1, 2026-10-28.** Source: `Microeconomic_analysis__Copy_/slides.tex`
(29 frames, 715 lines, 4:3, 12 pt). Output: `docs/deck.html` (35 web slides,
16:9, 1280 × 720). The LaTeX sources were **not** modified.

This file records every deliberate deviation. The approved content changes are
also listed in `PLAN.md` §0 and `NOTES.md`.

---

## 1. Geometry and typography

| Item | Source (beamer, 4:3) | Web (reveal, 16:9) | Why / note |
|---|---|---|---|
| Canvas | 128 × 96 mm, 4:3 | **1280 × 720 px, 16:9** | Approved D1. Mapping **1 cm = 100 px**. The source is 12.8 × 9.6 cm; the web canvas is 12.8 × 7.2 cm. The scale is the same in both axes and the **absolute width is unchanged**, but the 16:9 canvas is **25 % shorter vertically**. That is the main reason several frames auto-fit (see below); the 16:9 aspect gives more width *relative to height*, not more absolute width. |
| Title bar | Madrid frametitle, ~0.5 cm + text | **66 px** (31 px type) | A fixed 66 px bar keeps the body height predictable. |
| Body type | 12 pt ≈ 42 px at 1 cm = 100 px | **34 px** base | Deliberate readability/space compromise: 42 px did not fit the 720 px canvas for the dense frames. Per-frame classes: `.tight` = 30 px (source `\small`/`\footnotesize`), `.script` = 28 px (source `\scriptsize`). |
| `\small` / `\footnotesize` / `\scriptsize` | 11.04 / 10 / 8 pt ≈ 38.8 / 35 / 28 px | 30 px / 30 px / 28 px | `\scriptsize` is exact (28 px). `\small`/`\footnotesize` are both mapped to `.tight` 30 px; the source difference (38.8 vs 35 px) is not reproduced. Frames 9, 10, 16–20 and 22–28 use `.tight`. |
| Dense frames 5 and 13 | whole frame `\scriptsize` | `.script`, 28 px; frame 5 auto-fits to 0.93 → **26.04 px**; frame 13 stays 28 px | Frame 5 is the only frame that needs the safety net; 26 px is the floor in `PLAN.md` §2.4. Frame 13 has room to spare. |
| Title slide | `\titlepage`, title in a blue box, logo 2 cm at the bottom | `h1` 42 px in a blue box, logo **200 px** (2 cm) bottom-centred, `1 / 35` footline | The title type is smaller than beamer's `\LARGE` (~60 px) so the 41-character title fits one line; the logo size and bottom position are faithful. |
| Footer | `infolines` footline, `n / 29` | 13 px footline, `n / 35` | The denominator changes because the web deck adds four Try-it slides, splits References into two pages and appends the QR slide (D7). Only the `[plain]` Thank-you frame has no footer; the title slide keeps `1 / 35`, like beamer's infolines. |
| Fonts | beamer sans text + serif math | system sans text + KaTeX Computer Modern math | No external font at runtime. Press Start 2P (OFL, vendored) is used only for the start screen, Try-it buttons and the QR URL. |
| Controls | navigation symbols removed in the preamble | reveal controls **off**; progress bar on | Faithful to `\setbeamertemplate{navigation symbols}{}`. The progress bar is a web affordance; it is the thin blue line at the bottom. |

**Frames that auto-fit** (the `data-fit` attribute; all content still readable):
frame 3 = 0.98, frame 5 = 0.93, frame 6 = 0.98, frame 9 = 0.94, frame 10 = 0.98,
frame 17 = 0.98. Everything else is 1.00. The fitter shrinks type rather than
clipping; it re-runs when a fragment is revealed.

**Phones:** the deck is a fixed 1280 × 720 canvas, so at 375 px reveal scales
the whole slide (0.293) and letterboxes it. It does **not** reflow; the games
(`play.html`, Phase 2) are the mobile-first surface. This is deliberate for a
presenter-facing 16:9 deck. No horizontal scroll at 375 or 1280.

---

## 2. Structural additions (35 web slides)

| Web slide | Content | Source |
|---:|---|---|
| 8 | Try it: The Doubling Contract | new, before frame 8 |
| 11 | Try it: The Caravan Lockboxes | new, before frame 10 |
| 19 | Try it: The Fixer's Crate | new, before frame 17 |
| 22 | Try it: The Jarl's Orders | new, before frame 19 |
| 33–34 | References / References (cont.), 6 + 6 | frame 29, split |
| 35 | Play the games + QR | new, after References |

Total: 29 original frames + 1 extra References page + 4 Try-it + 1 QR = **35**.
The footer is generated from the DOM, so if References needs a third page the
count becomes 36 automatically.

**References split:** the source uses `[allowframebreaks]` and was never
compiled (no TeX locally), so the exact break is unknown. The web deck uses
6 + 6 entries at the year boundary 1982/1987; each page fits without scrolling.
Author–year style is used (no `[1]…[12]`), matching the deck's existing
"(Kahneman & Tversky, 1979)" prose style. `bernoulli1954` keeps the source's
"[Translation of the 1738 original]" note while the body still says 1738.

**Try-it slides** are new content. Their visible copy does not name the
paradox, show an EV, or say which answer is "rational". The only numbers are
the ones already on the corresponding source frames: 90/30/60 (Ellsberg) and
600 (framing). The overlay is a true viewport dialog (`position: fixed`, moved
to `<body>`), the iframe is lazy (`play.html#<id>`), the Close button is
≥ 44 px at 375 px, and the QR uses a 4-module quiet zone.

---

## 3. Content changes (approved)

1. **Frame 13, line 345:** `x_1,x_2,x_3 \in \chi` → `\in \mathcal{X}`. This is
   the one real error in the source (χ is a Greek letter, not the outcome set).
   Approved by the team; logged here as required. KaTeX renders both without an
   error, so the 0-`.katex-error` check would not have caught it.
2. **Title string:** `Paradoxes of Choices under Uncertainty` (the `.tex`
   string, not the brief's "Choice Under"). Used on the title slide, start
   screen, `<title>` and footer.
3. **Supervisor line:** `Supervisor: Assoc. Prof. Dmitrij Celov` (the source's
   "Assoc." was an unfinished abbreviation and had no final period).
4. **Frame 14:** the four `\(…\)` inline segments were normalised to `$…$`
   (same meaning; the deck is otherwise all `$…$`).
5. **Empty block titles** on frames 15 (`alertblock{}`) and 16 (`block{}`) were
   dropped (`.block--untitled` with no title element) rather than drawn as a
   bare coloured bar. Content unchanged.
6. **8 speaker notes?** None. The `.tex` has zero `\note{}`; no notes were
   invented (D9). `S` opens reveal's speaker view with empty note panes.

---

## 4. Per-frame conversion notes

- **Frame 1** — title slide, no `<h2>`, logo 200 px bottom-centred, supervisor
  line corrected. Keeps the `1 / 35` footline, like beamer's infolines; the logo
  sits above it, so there is no overlap.
- **Frame 2** — hand-built 8-item TOC (reveal has no automatic beamer TOC).
  `References` is starred in the source and is excluded, as in beamer.
- **Frame 3** — display lottery definition, 3 bullets, block. `\vspace` values
  (−0.15 cm / +0.1 cm) became CSS margins; the frame auto-fits to 0.98.
- **Frame 4** — `.tight` (source `\small`), gameblock, `\tfrac` fractions and
  `\Big\{` copied verbatim; `2.2 > 2` uses `&gt;` in the HTML.
- **Frame 5** — `.script`; all four displays, the VNM sentence, 3 axioms and the
  alertblock. Source inconsistency preserved: `0<α<1` here, `α>0` on frame 6.
- **Frame 6** — `.tight`; the 5-line `aligned` derivation keeps the source's
  leading `&` / `&\quad` hanging pattern; `&amp;` in the HTML.
- **Frame 7** — `.tight`; gameblock + 2 bullets + alertblock. One `<br>` was
  added before the long inline mixture chain so the formula does not break
  mid-expression at 1280 px (content unchanged).
- **Frame 8** — `.tight`; `\Pr(k)`, the infinite series, `2^k`, 5–20 emeralds.
  `St.` keeps its escaped-period space.
- **Frame 9** — `.tight`, `columns` 48/50. The booktabs table is an HTML table
  with `{rr}` right alignment; the `\footnotesize` note is `.note-small`; the
  Takeaway block. The right column keeps the source's bullet list.
- **Frame 10** — `.tight` (source `\footnotesize`), gameblock with Question 1;
  `\pause` (L276) → first fragment (Question 2 + C/D) **inside** the green box;
  `\pause` (L283) → second fragment (Typical answers) **outside** it. Fragments
  use `fragment--collapse` so the box grows like beamer's separate pages rather
  than reserving empty space. 82%/83% are in the second fragment.
- **Frame 11** — `.tight`; `align*` with `\\[4pt]`; the chained contradiction
  and `\bot`; block "Common consequence". The title contains inline math.
- **Frame 12** — `.tight`, `columns` 52/46. The TikZ picture is replaced by
  `Figures.triangleSVG()`: viewBox 540 × 480, origin (110,440), 380 px per
  unit, A(0,0) B(.01,.33) C(.67,.33) D(.66,0), 7 dashed `gray!70` parallels
  (c ∈ {−1.6,−1.2,−0.8,−0.4,0,0.4,0.8}, slope 2.5) clipped to the triangle,
  blue A–B / red D–C, labels. The SVG is **larger** than the TikZ (560 px wide
  vs ~390 px at the source scale) because it shares a 16:9 column; coordinates
  and slope are exact. The `gray!70` value is **#A6A6A6**, not #595959.
- **Frame 13** — `.script`; the approved `\mathcal{X}` fix; three displays;
  block "Question". The source's `\mathcal{L}` lottery set is kept.
- **Frame 14** — `.tight`; the two displays and alertblock; `\(…\)` normalised.
- **Frame 15** — `.tight`; the 4-column `aligned` P definitions (KaTeX keeps the
  double-`&` layout), both implications, the boxed contradiction, and the
  untitled alertblock.
- **Frame 16** — `.tight`; gameblock with P_A/P_B and the stronghold P_C/P_D;
  `\qquad` became two `&emsp;`; untitled block "Scaling all winning chances…".
- **Frame 17** — `.tight`; gameblock 90 gems, the `lccc` bets table (extra
  midrule after II), and the `\pause` block "Typical choice" (one fragment).
- **Frame 18** — `.tight`; the two `align*` implications, 2 bullets, block
  "Risk vs. ambiguity".
- **Frame 19** — `.tight` (source `\footnotesize`; both headings are `\small`);
  the four `\hfill [72%]`-style percentages are flex rows with the bracket kept
  as text and pushed right inside the item, not the page margin.
- **Frame 20** — `.tight`; 1 000 / 1 050 with thin spaces (U+2009), +25,
  20 000, λ≈2.25, −600; block with the two-sentence explanation.
- **Frame 21** — `.tight`; one display with V(L), the `cases` v(x), and the
  Tversky–Kahneman (1992) one-parameter w(p); two committed SVGs (5.0 × 3.7 cm
  source → 500 × 370 px display) with captions. The weighting identity line is
  **#808080** (xcolor `gray`), not the triangle's #A6A6A6; the value curve is
  #02487F, losses #FF0000. Fonts in the SVGs are paths.
- **Frame 22** — `.tight`; the 8-row prospect-theory table with four
  `rowspan="2"` prediction cells (✓ included), the full-width group rule, and
  the two bullets. The Example column is blank on continuation rows, as in the
  source.
- **Frame 23** — `.tight`; the 3-column fixed table (22/27/48 % of the 1188 px
  content width ≈ 261/321/570 px, instead of 220/270/480 px at 1 cm = 100 px,
  because 16:9 is wider); all five rows and both citations.
- **Frame 24** — `.tight`; maxmin intro, 2 bullets, the `lcccc` table centred,
  block "Result".
- **Frame 25** — `.tight`; six bullets and the green "In game terms" block.
- **Frame 26** — `[plain]`, no `<h2>`, no footer, "Thank you for your
  attention!" centred with an inner flex wrapper (reveal forces `display:block`
  on the present section).
- **Frame 27** — `.tight`; the two displays and the unusual
  `\sum_{k=1}^{n}1` notation are kept verbatim (it is correct; do not
  "simplify"). Custom `.item` rows keep the text after each display in the same
  content column; the displays are centred on that column, not the page.
- **Frame 28** — `.tight`; v(x)=x^0.88, w(p) with 0.61, the 9-column
  `lcccccccc` table (data centred; **no midrule** between p and w(p), matching
  the source), the two V(B)/V(C) lines, and the note.
- **Frame 29** — two sections, 6 + 6 references, author–year, hanging indent.
- **QR slide** — "Play the games", QR generated locally from
  `CONFIG.siteUrl` (placeholder `https://example.github.io/paradoxes-of-choices/`),
  URL text, no install/account line.

---

## 5. Things that are intentionally not there

- **No speaker notes.** The source has none; none were written. `S` opens the
  speaker view with empty note panes.
- **No external requests.** reveal.js 4.6.1, KaTeX 0.16.11 (with fonts),
  qrcode-generator 1.4.4 and Press Start 2P are vendored in `docs/vendor/`.
  The deck loads 27 `file://` requests; 0 `http(s)` requests, even with all
  network blocked.
- **No `play.html` games in Phase 1.** A small placeholder page existed so the
  Try-it iframe opened and closed cleanly; Phase 2 replaced it with the hub,
  the engine and the first game (see §8). The Phase 1 deck itself is unchanged.
- **No GitHub Pages settings / no push.** `siteUrl` is a placeholder; ask before
  changing it or pushing (BRIEF §11).
- **No analytics, accounts or storage.** None added.

---

## 6. Known residual nits (not blockers)

- The focus ring is `#f0a500`; on a white background its contrast is ~2.08:1
  (WCAG 2.2 enhanced 3:1 target). It is clearly visible on the blue controls.
- The Try-it dialog declares `aria-modal="true"` but does not set `inert` on
  `.reveal`; Tab can reach the body behind it. The visible Close button always
  works. A parent-level Escape bridge is impossible on `file://`; the hint
  promises only ✕.
- The QR card's white quiet zone is 4 modules inside the SVG plus 16 px of card
  padding. It decodes in testing; a real phone scan belongs in Phase 4.
- The deck scales rather than reflows at 375 px (fixed 16:9 canvas). The games
  are the mobile-first surface.
- Only the `[plain]` Thank-you frame has no footer, as in beamer; the title slide keeps the `1 / 35` infolines footline.

---

## 7. How to check it

```bash
# from the project root
python3 tools/check_assets.py      # assets + figures, exits 0
open docs/index.html               # double-click equivalent: start screen
# Presentation -> deck.html; S = speaker view; F = fullscreen; arrows/space = next
```

`docs/deck.html` must also work when double-clicked directly (`file://`), and
under a GitHub Pages sub-path (all paths relative, `docs/.nojekyll` present).

---

## 8. Phase 2 — game engine + The Caravan Lockboxes

**Phase 2, 2026-10-28.** `docs/play.html` is now the real hub + game runner.
`docs/deck.html`, `docs/index.html`, `docs/css/theme.css`, `docs/css/deck.css`
and `docs/js/tryit.js` were not changed. The LaTeX sources were not touched.

### 8.1 Structure

| File | Role |
|---|---|
| `docs/play.html` | hub, game mount, coming-soon panel and Report Card routes |
| `docs/js/play.js` | hash router (`#allais`, `#stp`, `#ellsberg`, `#framing`, `#report`); hides the site bar inside the deck iframe |
| `docs/js/engine.js` | reusable stage machine: scene → choice → lock → resolve → simulate → interlude → reveal |
| `docs/js/rng.js` | mulberry32 seeded PRNG and `?seed=` parsing |
| `docs/js/charts.js` | canvas histogram and running-average chart, no chart library |
| `docs/js/store.js` | localStorage progress with an in-memory fallback, all reads/writes in try/catch |
| `docs/js/assets.js` | key → path resolution, labelled missing-art fallback, single `console.warn` per key |
| `docs/js/hub.js` | four thematic hub cards, coming-soon panels and the Paradox Report Card |
| `docs/js/games/allais.js` | pure `verdict(choices, game)` derived from the lotteries |
| `docs/css/games.css` | mobile-first hub/game/report layout |
| `docs/css/games/allais.css` | scoped colour tokens only; no layout or panel rules |

The extra helper files (`store.js`, `assets.js`, `play.js`) are coordinator-owned
and keep the engine, hub and router from duplicating the same fallbacks.

### 8.2 Content deviations, all deliberate

1. **Display currency is caps at ×1/1000.** The slides say “2,400k gp”
   (thousands). The game shows `1.00 → 2,400 caps`, etc. — the same digits at a
   deliberate ×1/1000 display rescale. The contradiction is invariant to a
   positive rescaling; no probability or payoff was invented. Logged in
   `NOTES.md` and shown in the reveal footnote.
2. **The 20-second “weigh the cargo” interlude.** New UI copy, no new numbers
   and no choices. The countdown is visible, Continue is available immediately
   (non-blocking), and `?fast=1` skips it for demos. It is placed between
   Round 1 and Round 2 by `interlude.afterRound: "r1"`.
3. **The paradox name appears only in the reveal.** Scene, hub card, choice
   prompts and the interlude never say “Allais”; the Report Card stays empty
   until a game is completed. The paired structure is not described until the
   reveal.
4. **B+D copy is mathematically truthful, not the task prompt’s wording.** The
   Phase 2 task prompt said B+D “took the higher-EV option every time”, but the
   slide numbers give B 2,409 > A 2,400 and C 825 > D 816: B+C is the
   higher-EV pair, and B+D is still a mirror violation. The shipped copy says
   B is higher-EV in Round 1 and D is lower-EV in Round 2, and explains that
   the pattern is the mirror of the textbook A+C answer. The verdict table
   (A+C No, A+D Yes, B+C Yes, B+D No) is unchanged.
5. **Allais does not measure a certainty equivalent or CRRA coefficient.** The
   Report Card shows “Not measured in this game” for both fields rather than
   inventing a number.
6. **Mobile line breaks in the reveal formulas.** The three-line `aligned`
   form of the `A≻B` derivation and the `V(A)…V(D)` line use the same symbols
   and values as the slides, split only so a 375 px screen does not clip them.
   The slide source itself already breaks the derivation over two lines.
7. **Formula cards are the textbook derivation.** They are labelled “Textbook
   pattern: A over B” / “Textbook pattern: C over D”; the player’s own pattern
   is in the separate “You vs. expected utility” panel, so an A+D or B+C
   player is not told that the textbook inequalities were their choices.
8. **The `⊥` formula is conditional.** The static Slide 11 contradiction card
   carries `when: "inconsistent"` and the engine filters it by the computed
   verdict. A+D/B+C therefore show only the derivation, C≻D and the
   prospect-theory values; A+C/B+D still show the contradiction. The dynamic
   panel is always the authority.
9. **Figure aria/caption wording corrected.** The caption and the triangle’s
   screen-reader text now say “the segments AB and DC are parallel” (A and B
   on the left, C and D on the right) instead of calling them triangle edges.
   The SVG geometry is unchanged; this only fixes the description. It affects
   the deck’s frame 12 aria text too, not its visual.
10. **Verdict logic reads round ids, not literal `r1`/`r2`.** The engine keys
    choices by `round.id`; `AllaisGame` now resolves the round objects first
    and normalises its returned choices to `{r1, r2}` for the panel. A
    renamed-round test covers it. The simulation mean label is “Mean (1,000)”
    so a sample mean such as C 765 is not read as the exact EV 825.
11. **Post-review fixes (layout/QA).** Option-sprite frames are 66×66 with a
    non-shrinking 64×64 image; `image-rendering` resolves to `pixelated`; the
    375 px seed chip shows the full value; Enter on a focused `a`, `button` or
    `summary` now uses native activation (a focused “← Hub” link can no longer
    start or lock a choice); `?fast=1` skips the interlude screen entirely;
    formula text is 0.85em at ≤600 px; missing-sprite labels show a short key
    stem; the Report Card grid is 0.9fr/1.3fr with the label “Benchmark
    (A+C)”. None of these changes game content.

### 8.3 Art and presentation

- Nine original PNGs generated by `tools/make_sprites.py`: seven 32×32
  sprites, one 640×360 hub card, one 1280×720 background. No downloaded or
  copyrighted game art, no text baked into an image.
- Sprites display at 64 px (2×) on phones and 128 px (4×) on wider screens
  with `image-rendering: pixelated`; the bottle-cap icon is 32 px (1×).
- Missing art produces a labelled coloured box (or a labelled gradient for a
  background) and one `console.warn`; the engine continues.
- `python3 tools/check_assets.py` passes with all 10 assets and 2 figures.

### 8.4 Routes

`play.html` (bare) = hub; `play.html#allais` = the game;
`play.html#stp`, `#ellsberg`, `#framing` = clean “Coming in Phase 3” panels;
`play.html#report` = Paradox Report Card. The deck’s four Try-it iframes still
load `play.html#<id>` and the overlay’s ✕ still closes them.

---

## 9. Phase 3 — Pip-Boy single-game rework

**Phase 3, 2026-10-28.** The shipped site is now **one game** (The Caravan
Lockboxes / Allais) in a green CRT terminal. The Phase 1 deck is archived
outside `docs/`; the university logo, the other three games and the ×1,000
simulation are gone. The LaTeX sources were **not** touched.

### 9.1 Removed, archived, replaced

| Removed | Where it went / what replaced it |
|---|---|
| `docs/deck.html`, `docs/css/deck.css`, `docs/js/deck.js`, `docs/js/tryit.js` | `archive/phase1-deck/docs/` (moved with history) |
| `docs/vendor/reveal/`, `docs/vendor/qrcode/` | `archive/phase1-deck/docs/vendor/` |
| `docs/assets/ui/mif.png` (university logo) | `archive/phase1-deck/docs/assets/ui/` |
| `docs/assets/figures/value-function.svg`, `probability-weighting.svg` | `archive/phase1-deck/docs/assets/figures/` |
| `docs/js/charts.js`, the ×1,000 simulation stage, `simulations` config | Deleted. Replaced by a per-round theory checkpoint. |
| `#stp`, `#ellsberg`, `#framing`, the four-card hub, coming-soon panels | Deleted. Bare `play.html` and `#allais` mount the same game; `#report` remains. |
| Authors/supervisor/logo block on the start screen | Deleted. The entry screen is one terminal with one **Enter the game** action. |

`docs/vendor/` now ships KaTeX 0.16.11 and Press Start 2P only. The archived deck
is not a runnable standalone copy: its old `theme.css`, `config.js`, `figures.js`
and `vendor/katex/` stayed in `docs/` and were rewritten for the game. The last
complete deck is commit `58527b9`.

### 9.2 New theory flow

Per contract:

1. scene (unchanged caravan halt, 2–3 lines);
2. choice (sprite, label, lottery numbers, stacked probability bar; no EV);
3. lock in (no take-backs, `choices[round.id]`);
4. seeded resolve (single draw; `?seed=42` still reproduces it);
5. **theory checkpoint** — chosen vs other option, the lottery-derived
   expected-utility inequality with KaTeX, and one sentence beginning “Under
   expected utility, this choice means …”;
6. interlude after Round 1 (20 s, `?fast=1` skips it);
7. Round 2;
8. reveal after both locks.

`AllaisGame.checkpoint(round, choice, game)` is new. It reuses the same
`collectOutcomes` / `coefficients` / `difference` algebra as `verdict()`, so the
inequality is derived from the lotteries, never pattern-matched. `verdict()` and
the four-pattern table are unchanged. The checkpoint never says “Allais”; the
paradox name appears only in the reveal.

No statistical output ships: no histogram, running average, mean, SD, P(worst),
“1,000 runs”, confidence interval or p-value. A single seeded draw is described
as a draw, not as an expected value or average.

### 9.3 Palette and presentation

- Primary green **`#12FF12`** (RGB 18/255/18) on the entry screen, game,
  checkpoints, reveal and Report Card.
- Secondary text `#8CFF8C`; rules/panels `#0B7A0B` / `#0A5A0A`; near-black
  green backgrounds. Warning red `#FF3B2F` only for the violation verdict and
  missing-art/error states.
- Monospace body, Press Start 2P headings, static scanlines, phosphor glow and
  a CRT vignette. `prefers-reduced-motion` disables the chest animation and all
  transitions; scanlines are static, not animated.
- The nine original PNGs are unchanged. Sprites keep their desert colours inside
  green CRT frames and still display at integer 2×/4× sizes.
- The probability triangle keeps the exact frame-12 geometry, but is recoloured
  to the greens. A–B is a solid bright line and D–C a dashed soft line, so the
  pairs remain distinguishable without relying on colour.
- The Report Card is a green terminal readout: pattern, EU verdict, population
  benchmark, slide refs, and CE/CRRA **“Not measured in this game”**. No CE or
  CRRA is invented.

### 9.4 Verification

- `node tools/test_allais_verdicts.mjs` → **119/119** (all four patterns,
  lotteries, inequalities, benchmark, renamed ids and 30 checkpoint checks);
  order **A+C No, A+D Yes, B+C Yes, B+D No**.
- `python3 tools/check_assets.py` → **9 assets**, exit 0.
- Browser checks at 375 and 1280: no horizontal page scroll; 0 `.katex-error`;
  checkpoint formula 277/277 px at 375; dynamic algebra 262/262 px; keyboard
  `1`/`2`/`Enter` completes both contracts; A+C/B+D show `⊥`, A+D does not;
  triangle strokes/fills use only `#12FF12`, `#8CFF8C`, `#0B7A0B`; interlude
  counts down and `?fast=1` skips it; missing-art fallback logs one warning;
  every request is `file://`; no console/page errors.
- Fresh theory/content and Pip-Boy/layout reviews were run after the build
  (reports in `notes/phase3/`). Review fixes: landing copy (two draws, full
  pattern only after both locks), no “Allais” in page metadata, header Report
  link removed and mid-run Report gated, Round 1 checkpoint hint neutralised,
  primary link-button contrast fixed, triangle x-axis arrowhead repaired,
  meaningful small labels moved to secondary green, unused P(worst) removed.

**No push.** The Phase 3 commit is local only. `CONFIG.siteUrl` is still the
placeholder and no repo setting was changed.
