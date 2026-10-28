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
- **No `play.html` games yet.** A small placeholder page exists so the Try-it
  iframe opens and closes cleanly; Phase 2 replaces it with the hub and the
  first game. It is not Phase 2 logic.
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
