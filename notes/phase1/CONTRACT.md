# Phase 1 builder contract

Read this together with `PLAN.md` §1–§6, the Phase 0 notes for your frame range,
and the source frames in `Microeconomic_analysis__Copy_/slides.tex`.

## Non-negotiable rules

1. **Only write the files assigned to you.** Never edit `docs/deck.html`,
   `docs/config.js`, `docs/css/theme.css`, `docs/css/deck.css`, `docs/index.html`,
   `docs/js/deck.js`, `docs/play.html`, any Phase 0 file, or another subagent's file.
2. **Never edit anything under `Microeconomic_analysis__Copy_/`.** It is the source.
3. **No external requests, no modules, no fetch().** Everything is local and
   relative. This deck must work by double-clicking `docs/deck.html` (`file://`).
4. **Faithful math.** Copy the LaTeX verbatim into `$…$` / `$$…$$`. Do not
   simplify, reorder or "improve" a formula. The only approved source changes are:
   - frame 13: `x_1,x_2,x_3 \in \chi` → `x_1,x_2,x_3 \in \mathcal{X}` (log it);
   - frame 14: the four `\(…\)` inline segments → `$…$` (same meaning, log it);
   - title slide: title "Paradoxes of Choices under Uncertainty", supervisor
     "Supervisor: Assoc. Prof. Dmitrij Celov".
5. **No inline `<style>` or `<script>` in a fragment.** No `<html>`, `<head>`,
   `<body>`. Return only `<section>…</section>` blocks (plus HTML comments where
   the contract asks for a slot marker).
6. **No inline `style=""` attributes.** Use the classes below. If a table needs
   fixed widths, use `<colgroup>` with percentages.
7. **No invented content.** A Try-it slide is the only new content, and it is
   S6's job — S1–S4 never write Try-it markup, only the slot comments.

## Canvas and type

- Reveal canvas: **1280 × 720 px**, 1 cm = 100 px. The source is 4:3; the web
  deck is 16:9, so there is more horizontal room, never less.
- Content box: 1188 px wide × ~590 px tall (title bar 66 px, body padding
  20 px top / 44 px bottom). Aim to fit without shrinking.
- Base body type: 34 px. A section may add `class="tight"` (30 px) when the
  source says `\small`/`\footnotesize` for the whole frame, or `class="script"`
  (27 px) when the source says `\scriptsize` for the whole frame. Do not go
  below those classes.
- Titles: `<h2>` is styled by `deck.css`; put the exact source title inside it.
  Math in a title (frame 11) is allowed and rendered by KaTeX.
- The deck auto-shrinks a body only if it would overflow. Do not rely on it:
  mark the dense frames (`5`, `13`) as `script`, and the `\small`/`\footnotesize`
  frames as `tight`, then check your own fragment visually.

## Section skeleton

```html
<section data-frame="3" data-section="Expected utility: the benchmark">
  <h2>Choices under uncertainty</h2>
  <div class="slide-body">
    …
  </div>
</section>
```

- `data-frame` is the source frame number (1–29). For the References pages use
  `29a` and `29b`. For Try-it use `tryit-stp`, `tryit-allais`,
  `tryit-ellsberg`, `tryit-framing`; for the QR slide `qr`.
- `data-section` is the exact section name, or `""` before the first section.
  Section names: `Expected utility: the benchmark`, `St. Petersburg paradox`,
  `Allais paradox`, `Ellsberg paradox`, `Framing and loss aversion`,
  `Explaining the paradoxes`, `Conclusion`, `Appendix`, `References`.
- Do not add a footer; `js/deck.js` injects `n / N` into every content section.
- No speaker notes exist in the source. Do not invent notes. Do not add
  `<aside class="notes">` at all.

## Math in HTML

- Inline: `$…$`. Display: `$$…$$` (own paragraph or `<div class="math">`).
- **Escape `<` and `>` inside math** as `&lt;` and `&gt;` so the browser does
  not parse them as tags: `0&lt;\alpha&lt;1`, `\alpha&gt;0`, `u''&lt;0`,
  `\pi_R&gt;\pi_E`, `-600&lt;0`, `x&lt;0`, `\lambda&gt;1`, `k&gt;n`.
- **Alignment ampersands**: write `&amp;` in `aligned`/`align*`/`cases`
  (`&amp;=`), so the HTML stays valid; KaTeX receives `&` after entity decoding.
  A bare `&` is usually tolerated but is not valid HTML.
- `\\` is a TeX line break; do not turn it into a single backslash.
- Do not use `\[…\]` or `\(…\)` in new markup; use `$$…$$` / `$…$`.
- The deck loads KaTeX 0.16.11. Native: `\mathcal`, `\mathbb`, `\succeq`,
  `\succ`, `\iff`, `\Longleftrightarrow`, `\bot`, `\boxed`, `\tfrac`,
  `\Big\{`, `\bigl`, `\bigr`, `\text`, `\checkmark`, `\delta`, `aligned`,
  `align*`, `cases`, `\\[4pt]`, `\tag` (display only). Unsupported:
  `\vspace`, `\hfill`, `\smallskip`, `tabular`, `\multirow`, `\multicolumn`,
  `\toprule`, `\midrule`, `\bottomrule`, `\setlength`, `\vline`, `columns`,
  `\centering`, `\pause`, `\note`, TikZ/pgfplots.

## Text conventions

- Typographic quotes: `` ``…'' `` → “…” (U+201C/U+201D). Do not use straight
  quotes in prose.
- `--` → en dash “–” (U+2013): `50–50`, `5–20`, `Marschak–Machina`,
  `von Neumann–Morgenstern`. Keep a literal `—` (U+2014) where the source has
  one (frames 16 and 24).
- `\,` thousands separators in prose → a thin space U+2009 (or
  `&thinsp;`): `2 400k gp`, `1 000`, `20 000`. Inside math, `\,` is fine.
- `\%` in text → a literal `%` (no escape needed in HTML text).
- `\&` in text → `&amp;`.
- `St.\ Petersburg` → `St. Petersburg`; `vs.\` → `vs.`; `Assoc.` → the approved
  supervisor line.
- `\textbf{…}` → `<strong>…</strong>`; `\emph{…}` → `<em>…</em>`.
- Keep the source's `\emph`/bold emphasis exactly where it is.

## Components (use these classes, all defined in `css/theme.css` / `css/deck.css`)

**Block / alertblock / gameblock**

```html
<div class="block">
  <div class="block__title">Expected value is not enough</div>
  <div class="block__body">…</div>
</div>

<div class="block block--alert">…</div>
<div class="block block--game">…</div>
<div class="block block--untitled">…</div>   <!-- empty title in source -->
```

Keep the title text verbatim. For an empty source title (`\begin{block}{}`,
`\begin{alertblock}{}`) use `block--untitled` and omit the title element
entirely. Log it in your report; the coordinator records the deviation.

**Columns** (source `columns` widths → classes)

```html
<div class="cols cols--48-50">
  <div class="col">…</div>
  <div class="col">…</div>
</div>
```

`cols--48-50` (frame 9), `cols--52-46` (frame 12, vertically centred),
`cols--50-50` (frame 21). Do not stack them with media queries; the canvas is
fixed 16:9.

**Lists**

```html
<ul>
  <li>…</li>
</ul>
```

The bullet colour is already set. For the right-aligned `\hfill [72%]` use:

```html
<div class="plan-row"><span>Plan A: 200 people will be saved.</span><span class="pct">[72%]</span></div>
```

inside the `<li>` (or replace the `<li>` content with the `.plan-row` div).

**Tables** (booktabs → HTML)

```html
<table class="tbl">
  <thead>
    <tr><th>Wealth $w$</th><th>Price $p$</th></tr>
  </thead>
  <tbody>
    <tr><td>10</td><td>4.97</td></tr>
  </tbody>
</table>
```

- `.tbl` draws the thick top/bottom rules and the header rule. No vertical rules.
- For the Ellsberg table's extra midrule after row II, add `class="mid"` to that
  `<tr>`.
- For the 9-column `w(p)` table use `class="tbl tbl--compact"`.
- For the fixed-width frame-23 table use `class="tbl tbl--fixed"` and a
  `<colgroup>` with widths 22% / 27% / 48% (plus a little for padding).
- `\multirow{2}{*}` → `rowspan="2"` on the first row and an empty cell on the
  paired row. `\checkmark` is native KaTeX: `$\checkmark$`.
- `\setlength{\tabcolsep}{3pt}` → the `tbl--compact` padding; do not write the
  command.

**Figures**

- Frame 12 triangle: a host only, S5 supplies the SVG at runtime:
  ```html
  <div class="figure figure--triangle" data-figure="triangle" role="img"
       aria-label="Probability triangle with lotteries A, B, C and D"></div>
  ```
  Do not inline an SVG yourself.
- Frame 21 plots: `<img class="plot" src="assets/figures/value-function.svg"
  alt="Value function: concave for gains, convex and steeper for losses">` and
  the same for `probability-weighting.svg`. S5 commits the files.
- Logo (frame 1 only): `<img class="title-slide__logo" src="assets/ui/mif.png"
  alt="Vilnius University Faculty of Mathematics and Informatics">`.

**Small helpers**

- `.center` — text-align centre.
- `.note-small` — a smaller note/caption (frame 9's `\footnotesize` note).
- `.plot-caption` — caption under a plot.
- `.refs` — reference list (frame 29).
- `.spaced` — extra letter spacing (use sparingly).
- `.no-bullets` — a `<ul>` with no markers.

## Overlays / fragments (only two frames)

- Frame 10: wrap “Question 2” **and** its C/D `<ul>` in one
  `<div class="fragment">…</div>` (inside the gameblock, after Question 1's
  list). Then the separate “Typical answers …” block gets
  `class="fragment"` on the block `div`. Nothing else is a fragment.
- Frame 17: the “Typical choice” block gets `class="fragment"`. Nothing else.
- Do not add `data-fragment-index`; DOM order is the order.

## Try-it slot markers (S1–S3 only)

Write exactly one HTML comment on its own line, immediately before the target
frame section:

- S1: `<!-- tryit:stp -->` before frame 8.
- S2: `<!-- tryit:allais -->` before frame 10.
- S3: `<!-- tryit:ellsberg -->` before frame 17 and
  `<!-- tryit:framing -->` before frame 19.

Do not write any Try-it markup. The coordinator replaces the marker with S6's
section.

## Reporting back

Write a short report at the end of your response (and, if you like, in a file
under `notes/phase1/` that is yours): files written, frames covered, what you
verified (open the fragment in a browser if you can; otherwise say what you
could not verify), any deviation you had to make, and any uncertainty for the
coordinator. Do not claim a visual check you did not do.
