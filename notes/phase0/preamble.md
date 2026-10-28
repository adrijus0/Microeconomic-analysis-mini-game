# Phase 0 — Preamble, macros, figures, bibliography audit

**Scope:** `BRIEF.md` §4–§7, `Microeconomic_analysis__Copy_/slides.tex` (715 lines, 29 `\begin{frame}`), `VUMIF.sty` (54 lines), `references.bib` (12 entries), `resources/MIF.png`.
**Method:** every line number below was re-checked with `grep -n`/`sed -n` on the files as they are now; every "KaTeX supports/does not support" claim was tested locally with **KaTeX 0.16.11** (`npm i katex@0.16.11` in a throw-away dir; not installed into the project). Nothing in `slides.tex`, `VUMIF.sty` or `references.bib` was modified.

Deck facts used throughout:

| quantity | value | evidence |
|---|---|---|
| frames (`\begin{frame}`) | **29** | `grep -o '\\begin{frame}' \| wc -l` = 29 |
| numbered sections | 8 | `\section{` at L76, 209, 266, 453, 496, 532, 642, 666; plus `\section*{References}` L708 |
| display constructs | **26** = 23 `\[…\]` + 3 `align*` | count of `\]` = 23 (the 6 extra `\[` are `\\[4pt]`/`\\[3pt]` row skips at L294, 440, 611–614); the 3 bare displays are `\begin{align*}` at L292 (frame 11), L482 (frame 18), L699 (frame 28) |
| extracted math segments | 172 | 169 render clean in KaTeX 0.16.11, 3 are extraction artefacts (see §2.3) |
| overlay commands | **3** | `\pause` at L276, L283, L473; `\only`/`\onslide`/`\uncover`/`\note` = **0** |
| blocks | 13 `block` + 4 `alertblock` + 9 `gameblock` + 0 `exampleblock` | L98…; `\begin{block}` at L43 is inside the `gameblock` definition |
| `tabular` | 6 | L240, 461, 580, 607, 629, 692 |
| TikZ pictures | 3 | L310 (pstriangle), L548, L561 |
| images | 1 | `\includegraphics` L59 only |

---

## 1. Document setup

### 1.1 Class, options, and the aspect-ratio conflict

```latex
L4:   \documentclass[12pt]{beamer}
L5:   % You can use \documentclass[11pt,aspectratio=169]{beamer}
L6:   % to adjust the aspect ratio to 16:9.
```

- `[12pt]` is honoured (beamer accepts 8/9/10/11/12/14/17/20pt; the default is 11pt). **Base type is 12 pt**, which is why many frames switch down to `\small` (11 pt), `\footnotesize` (10 pt), `\scriptsize` (8 pt) to fit.
- **No `aspectratio` option.** Beamer's default paper is **128 mm × 96 mm = 4:3 (1.333)**, and the `169` alternative is only present as a comment (L5–L6). So the current PDF is **4:3 at 128 mm × 96 mm**, with `\setbeamersize{text margin left=1em,text margin right=1em}` (inherited from the `infolines` outer theme) giving a text width of ≈ 119 mm.
- **Conflict with the brief:** `BRIEF.md` §4, L65 — *"the deck is 16:9 and readable from the back of a room"*. The source is 4:3. **State this plainly in `PLAN.md` and `NOTES.md`:** the web deck will be 16:9, i.e. the projection geometry will *not* be pixel-identical to the PDF the authors rehearsed with. Concretely: 16:9 buys 33 % more horizontal room (at the same height), so the reflow *adds* space rather than crowding frames — but every `width=5.0cm` figure and every `cm`-based TikZ dimension must be re-expressed, and the authors' rehearsed 4:3 geometry will not be reproduced exactly.
- **Recommended mapping:** reveal.js `width: 1280, height: 720` ⇒ 128 mm → 1280 px, i.e. **1 mm = 10 px, 1 cm = 100 px**. Under that rule `width=5.0cm` → 500 px and `width=2cm` (the logo) → 200 px (the source PNG is 244 px, see §4.1). So every `cm` number in the .tex transfers at ×100 (cm→px), and `\textwidth` = 119 mm → 1190 px. That is the cheapest way to keep the two figures and the three column pairs at their intended relative size.
- Resolution independence: serve SVG/vector for the figures so the 1280→1920 px projector upscale stays crisp.

### 1.2 Theme

`L48: \usetheme{Madrid}` is issued **after** the colour macros at L39–44 but **before** `\usepackage{VUMIF}` at L61, so VUMIF's `\setbeamercolor`s override the theme's. `beamerthemeMadrid.sty` (checked against the beamer sources) resolves to:

```latex
\PassOptionsToPackage{shadow=true}{beamerinnerthemerounded}
\usecolortheme{whale}
\usecolortheme{orchid}
\useinnertheme{rounded}      % rounded block corners + drop shadow
\useoutertheme{infolines}
\setbeamertemplate{headline}[default]   % secheader=false ⇒ no headline bar
```

- So: **rounded, shadowed blocks**; **no headline** (no section navigation strip); a three-thirds **footline** (author | short title | page number `n / N`), supplied by `infolines`; frametitle is a full-width bar.
- Web equivalent: a navy title bar, no section strip, and a 3-cell footer. Drop the block *drop shadow* or keep a very light `box-shadow` — see §3.
- `VUMIF.sty` L38 sets `\setbeamertemplate{caption}[numbered]`, L40 `itemize items [circle]`, L41 `enumerate items [default]`.

### 1.3 Colour definitions (exact values)

Explicit definitions:

| name | source | RGB | hex |
|---|---|---|---|
| `blue` (**redefines xcolor's blue**) | `VUMIF.sty` L4 | `2, 72, 127` | `#02487F` |
| `burgundy` (defined, never used) | `VUMIF.sty` L3 | `123, 0, 63` | `#7B003F` |
| `gamegreen` | `slides.tex` L39 | `46, 125, 50` | `#2E7D32` |
| `beamer@blendedblue` = `structure` | beamer default colour theme | `0.2, 0.2, 0.7` | `#3333B3` |

Roles set by `VUMIF.sty` / `slides.tex`:

| role | definition | resolved |
|---|---|---|
| `titlelike` (title page title + subtitle) | L22 `bg=blue, fg=white` | bg `#02487F`, white |
| `frametitle` | L24 `bg=blue` (+ inherited `fg=white`) | bg `#02487F`, white |
| `alerted text` | L8 `fg=blue!80!gray` | `#1B537F` |
| `palette primary` | L9 `fg=white, bg=blue!80!white` | `#356D99` |
| `palette secondary` | L10 identical to primary | `#356D99` |
| `palette tertiary` | L11 `fg=white, bg=blue!80!black` | `#023A66` |
| `palette quaternary` | L12 `fg=blue, bg=gray!80!white` | `#02487F` on `#999999` |
| `item projected` (enumerate badge) | L30 `fg=white, bg=blue` | white on `#02487F` |
| `section in toc` | L7 `fg=black, bg=white` | black |
| `navigation symbols` | `slides.tex` L58 `\setbeamertemplate{navigation symbols}{}` | **none** |
| `separation line` / `fine separation line` | L27–28 empty | no rules |

Derived from theme + those definitions (polynomial mixes, computed — verify against the PDF if in doubt):

| element | derivation | resolved |
|---|---|---|
| `block` title | orchid: `structure.fg!75!black`, fg white | `#262686` |
| `block` body | orchid: `block title.bg!10!bg` | `#E9E9F3` |
| `alertblock` title | orchid: `alerted text.fg!75!black` | `#143E5F` |
| `alertblock` body | `10 %` of the above on white | `#E8ECEF` |
| `gameblock` title | `slides.tex` L41 `bg=gamegreen,fg=white` | `#2E7D32` |
| `gameblock` body | L42 `bg=gamegreen!8` | `#EEF5EF` |
| itemize bullet / `item` | `parent=local structure` → `structure.fg` | `#3333B3` (indigo, *not* the navy) |
| footline cells | `author in head/foot`=`palette tertiary`, `title`=`palette secondary`, `date`=`palette primary` | `#023A66` / `#356D99` / `#356D99` |

**Trap worth knowing:** `VUMIF.sty` L4 redefines `blue` globally. `VUMIF` is loaded at L61, i.e. **after** `\usepackage{tikz}` (L34) and `pgfplots` (L35). So every `blue` in the TikZ code (L322, L323, L326, L552, L566) is **`#02487F`**, not `#0000FF`. `red` is untouched (`#FF0000`), `gray!70` is `#595959`. When redrawing the figures, use `#02487F` / `#FF0000` / `#595959` — using pure blue changes the figure.

### 1.4 Fonts

- `\usefonttheme{default}` (`VUMIF` L43) → **sans-serif text** (Computer Modern sans / EC `ecss`, since no `lmodern`/`fontspec` is loaded).
- `\usefonttheme[onlymath]{serif}` (`VUMIF` L44) → **serif math** (Computer Modern math).
- `\usepackage[T1]{fontenc}` (`slides.tex` L62, loaded last, which is unusual but harmless): T1 text encoding only; **no effect on math** and no effect on the web.
- Web plan: body text in a neutral humanist sans (system stack or a vendored WOFF2), math in KaTeX's default Computer Modern look. **Do not** try to reproduce `ecss`; the mismatch is invisible on a projector and the KaTeX fonts are already vendored per §4 of the brief.
- Diacritics in the author line (L52) are LaTeX escapes and must become real UTF-8 in HTML: `Ber\v{z}inskas` → **Beržinskas**, `Jok\={u}bas \v{Z}itkevi\v{c}ius` → **Jokūbas Žitkevičius** (plus `\v{c}` = č). `deck.html` needs `<meta charset="utf-8">`.

### 1.5 Navigation, figure/table naming

```latex
L7:  \renewcommand{\figurename}{}
L8:  \renewcommand{\tablename}{}
L9:  \renewcommand\thefigure{\arabic{figure} figure.}
L10: \renewcommand\thetable{\arabic{table} table.}
```

These produce captions like "1 figure." / "1 table." (number *before* the noun, and a trailing period). **They are inert**: there is not a single `\caption` in the deck (`grep '\\caption{'` = 0; the only "caption" hits are the two `\captionsetup` lines L21–L22). Likewise `\captionsetup` (L21–L22) and `\captionsetup*` (`VUMIF` L48–L49) never fire. **Do not port any of this.**

`L58: \setbeamertemplate{navigation symbols}{}` → no navigation glyphs, but reveal.js keeps its own arrow controls; use `controls: false` (or `controlsBackArrows: 'hidden'`) plus a slide-number counter to match the beamer look.

### 1.6 Packages — does each matter for the web?

| package | lines | used in the deck? | matters for the web version? |
|---|---|---|---|
| `graphicx` | L12 | yes, `\includegraphics` L59 | **yes** — the MIF logo (§4.1) |
| `listings` | L13 | no (`lstlisting`/`lstinline` = 0) | no — drop |
| `biblatex` (`backend=biber, style=numeric, sorting=ynt`) | L14–18 | yes, `\nocite{*}` + `\printbibliography` L711–712 | **yes** — the 12 references (§5) |
| `biblatex` (again, no options) | **L25** | duplicate | no — flag only (§5.3) |
| `algorithm, algorithmic` | L19 | no (`\begin{algorithm}` = 0) | no — drop |
| `caption` | L20–22 | no `\caption` | no — drop |
| `hyperref` | L26 | no `\href`/`\url` | no (beamer loads it anyway); web = plain `<a href>` if ever added |
| `subfig` | L27 | no (`\subfloat` = 0) | no — drop |
| `amsmath, amssymb` | L30 | yes (`align*`, `aligned`, `cases`, `\succeq`, `\bot`, `\boxed`) | **yes** — but all of it is native KaTeX (§2.3) |
| `booktabs` | L31 | yes (`\toprule`/`\midrule`/`\bottomrule` in all 6 tables) | **yes** — becomes CSS borders (§3) |
| `multirow` | L32 | yes, 4× (L584, 586, 589, 591) | **yes** — becomes `rowspan` (§2.4) |
| `array` | L33 | yes, `>{\raggedright\arraybackslash}p{2.2cm}` L607 | **yes** — becomes `table-layout` + widths |
| `tikz` (+ `arrows.meta`, `>=Stealth`) | L34, L37 | yes, 3 pictures | **yes** — 3 figures to redraw (§4.2) |
| `pgfplots` (`compat=1.17`) | L35–36 | yes, 2 axes | **yes** — 2 plots to redraw (§4.2) |
| `VUMIF` | L61 | theme | **yes** — palette (§1.3) |
| `fontenc[T1]` | L62 | text encoding | no |

### 1.7 Title block

```latex
L50: \title[Paradoxes of Choices under Uncertainty]{Paradoxes of Choices under Uncertainty}
L51: \subtitle[]{Microeconomic analysis}
L52: \author[Ber\v{z}inskas, Skuodas, \v{Z}itkevi\v{c}ius]{Gedas Ber\v{z}inskas, Adrijus Skuodas, Jok\={u}bas \v{Z}itkevi\v{c}ius}
L53: \date{}
L56: \addtobeamertemplate{author}{}{Supervisor: Assoc. Dmitrij Celov\par}
L59: \titlegraphic{\includegraphics[width=2cm]{resources/MIF.png}}
```

- No `\institute` (grep = 0), so the footline's author cell shows only the short author list.
- `\date{}` empty ⇒ footline right cell = page number only; `n / 29` from `infolines`' `page number in head/foot[totalframenumber]`. Note the PDF page count may exceed 29 because of `[allowframebreaks]` on the References frame (L710).
- The supervisor line is injected **after the author** by a template hook (L56) — on the web it is a separate `<p class="title-slide__supervisor">`. It is also an unfinished abbreviation ("Assoc." without "Prof."), §6.
- `\titlegraphic` puts the logo on the **title slide only**; it is *not* on every frame (no `\logo{}`). Frame 1 (L67–69) is a bare `\titlepage`; frame 2 (L72–74) is `\tableofcontents`.
- **Title page composition, in beamer's actual order** (`beamerinnerthemedefault.sty`, `title page` template — Madrid does not override it): `\vfill` → `\begin{center}` → **title** box (navy, 8 pt sep, centred) → `\vskip1em` → **author** box (the supervisor line is appended *inside* this box by the L56 hook) → **institute** box (empty — there is no `\institute`) → **date** box (empty, L53) → `\vskip0.5em` → **`\titlegraphic`** → `\end{center}` → `\vfill`. So the 2 cm logo sits **centred at the bottom of the title block, below the author and the (empty) institute/date lines** — not above or left of the title. A top-left logo on the web title slide (a natural choice for a web page header) would therefore be a **deliberate deviation from the PDF**: log it in `CONVERSION_NOTES.md` and show it to the team before Phase 1 review.

---

## 2. Macro map for KaTeX

### 2.1 The user-defined macros (verified: exactly one `\newcommand`, one `\newenvironment`)

`grep 'newcommand\|newenvironment' slides.tex VUMIF.sty`:

```latex
slides.tex:40: \newenvironment{gameblock}[1]{...}
slides.tex:44: \newcommand{\X}{\mathcal{X}}
```

`\X` is **defined but never used** in `slides.tex` (only the definition line matches `\X\b`). It still belongs in `katexMacros` because the brief (§5, L91) makes it the shared macro surface for deck **and** games.

### 2.2 Ready-to-paste object literal

```js
// config.js — consumed by both deck.html and play.html
katexMacros: {
  "\\X": "\\mathcal{X}",   // slides.tex L44 — the only user \newcommand in the source
},
```

Notes that matter in Phase 1:

- Keys are the macro **including** the backslash, escaped for JS (`"\\X"`); values are TeX strings (`"\\mathcal{X}"`).
- **Do not** add `\checkmark`, `\bot`, `\delta`, `\tfrac`, `\succeq`, `\boxed`, `\Big`, `\text`, `\mathcal`, `\mathbb` — all are native (§2.3). Redefining them adds risk for zero gain.
- KaTeX **mutates** the macros object when a `\gdef` is parsed, so pass a copy per render:
  `renderMathInElement(el, { macros: Object.assign({}, CONFIG.katexMacros) })`.
- **`gameblock` cannot be a KaTeX macro.** `\begin{gameblock}{…}` is an *environment*; KaTeX's `macros` map only expands control sequences, and `\begin{…}` is parsed as an environment name, not expanded. It also carries colour and layout semantics, which KaTeX cannot express. Render it as HTML (§3) and keep its *title text* verbatim.

### 2.3 What KaTeX 0.16.11 does with the deck's constructs (tested, not guessed)

Test harness: all 172 auto-extracted `\[…\]` / `$…$` / `\(…\)` segments were passed to `katex.renderToString(..., {throwOnError: true})`. **169/172 clean.** The 3 failures are artefacts of my extractor, not of KaTeX: L294, L440 and L611 contain `\\[4pt]` / `\\[3pt]`, whose `\[` looks like the start of display math. Re-extracted correctly, the L294 `align*` block renders clean; L440 and L611 are a text line and a `tabular` row, respectively. **Conclusion: the deck's math is, as written, 100 % KaTeX-parseable with zero macro changes.** Only `\X` (unused) is missing from KaTeX's vocabulary.

| construct | where | verdict |
|---|---|---|
| `\mathcal{X}` `\mathcal{L}` `\mathcal{P}` | L84, 345, 400–403 | **native** |
| `\mathbb{E}` `\mathbb{R}` | L111, 126, 218, 679 | **native** |
| `\succeq`, `\succ`, `\iff`, `\Longleftrightarrow` | 40+ uses | **native** |
| `\bot` (as falsum, L298, L426) | L298, L426 | **native** (renders ⊥) |
| `\boxed{…}` | L425 | **native** |
| `\Big\{ … \Big\}`, `\bigl( … \bigr)`, `\bigl[ … \bigr]` | L110, 178–182, 541, 688 | **native** |
| `\tfrac` | L110, 111, 481, 625, 633 | **native** (no `amsmath` needed) |
| `\underbrace` | not used | **native** (if a game needs it) |
| `\text{…}` inside math (`\text{mine}`, `\text{prize}`, `\text{Violation of independence}`) | L110, 111, 218, 430–431 | **native** |
| `\checkmark` | L584, 586, 589, 591 | **native** ✔ (KaTeX has it; no macro needed) |
| `\begin{aligned}`, `\begin{align*}`, `\begin{cases}` | L177, 292, 399, 416, 482, 540, 699 | **native** |
| `\\[4pt]` row skip inside `align*` | L294 | **native** ✔ (verified) |
| `\dots`, `\quad`, `\qquad`, `\,`, `\;`, `\!`, `\ ` | throughout | **native** |
| `\Pr`, `\ln`, `\min`, `\sum`, `\infty`, `\approx` | L217, 234, 677 | **native** |
| `\%` (percent) | L285 `82\%`, L446 `20\%`/`25\%`, L503–509 `[72\%]` — **all in text mode** | not a math construct; in HTML write a bare `%` (no escape needed). Listed only so the source's `\%` is not carried over literally |
| `\emph{x}` inside math | – | **native** (but it is a text command; don't rely on it) |
| `\delta` | L400–403 | **native** (δ symbol and `\delta_{x_M}`) |
| `\chi` | L345 | **native** — and *that is the problem*: it silently renders χ (§6.1) |
| `\tag{…}` / `\tag*{…}` | not used | **native in display mode only** — KaTeX 0.16.11 renders `\tag` inside `$$…$$`/`align*` and throws "\tag works only in display equations" inline (verified). Nothing in the deck tags an equation, so no work needed |

Tested and confirmed **unsupported** by KaTeX (with the error it raises):

| construct | KaTeX error | used where | smallest faithful web workaround | frames affected |
|---|---|---|---|---|
| `\vspace{…}` | `Undefined control sequence: \vspace` | text mode only: L87 (−0.15 cm, frame 3), L97 (+0.1 cm, frame 3), L148 (+0.05 cm, frame 5), L232 (−4 pt, frame 9), L536 (−6 pt, frame 21), L543 (−4 pt, frame 21), L577 (−4 pt, frame 22) | CSS vertical margin on the following element. At the project scale **1 cm = 100 px** and **1 pt ≈ 3.51 px** (TeX pt, 1/72.27 in): −0.15 cm = **−15 px**, +0.1 cm = **+10 px**, +0.05 cm = **+5 px**, −4 pt = **−14 px**, −6 pt = **−21 px** (keep the value in cm/pt in the source and let CSS do the conversion via `em`, so the two scales never get mixed) | **3, 5, 9, 21, 22** |
| `\hfill` | `Undefined control sequence: \hfill` | text, L503, 504, 508, 509 | flex row: `<li class="row"><span>Plan A: …</span><span class="pct">[72%]</span></li>` with `display:flex; justify-content:space-between` (keep the literal `[72%]`, brackets included) | 19 |
| `\smallskip` | `Undefined control sequence` | L251 | `margin-top:.4em` on the note under the table | 9 |
| `\begin{tabular}` | `No such environment: tabular` | 6 tables (L240, 461, 580, 607, 629, 692) | real HTML `<table>`; `booktabs` rules → `border-top/bottom` (see §3) | 9, 17, 22, 23, 24, 28 |
| `\toprule`/`\midrule`/`\bottomrule` | `Undefined control sequence` | same 6 tables | `thead` border-bottom 1.2px, `tbody tr:first-child` border-top 0.8px, table border-top/bottom 1.2px; no vertical rules anywhere | 9, 17, 22, 23, 24, 28 |
| `\multirow{2}{*}{…}` | `Undefined control sequence` | L584, 586, 589, 591 | `<td rowspan="2">` on the 4th column, empty 4th cell on the paired row | 22 |
| `\multicolumn` | `Undefined control sequence` | not used | `colspan` (if ever needed) | – |
| `>{\raggedright\arraybackslash}p{2.2cm}` | `Undefined control sequence` | L607 (`2.2cm`, `2.7cm`, `4.8cm`) | `table-layout:fixed` + `<colgroup>` with 22/27/48 of the table width (`min-width:0` to allow wrapping) | 23 |
| `\setlength{\tabcolsep}{3pt}` | `Undefined control sequence` | L692 | `td{padding:0 .18em}` (denser cell padding) | 28 |
| `\begin{algorithm}` / `algorithmic` | `No such environment` | not used | nothing to do (drop the packages) | – |
| `\begin{columns}` / `column` | `No such environment` | 3 | CSS grid (§3.2) | 9, 12, 21 |
| `\centering`, `\pause`, `\only`, `\onslide`, `\uncover`, `\note`, `\titlepage`, `\tableofcontents` | `Undefined control sequence` | `\centering` L238, 309, 547, 560, 662; `\pause` L276, 283, 473; `\titlepage` L68; `\tableofcontents` L73 | beamer semantics → HTML/CSS/reveal (§3) | all |
| `\textsc`, `\textbackslash`, `\ensuremath`, `\label`, `\intertext` | various | not used | – | – |
| `\vline` | `Undefined control sequence: \vline` (all forms: top level, in-cell, array preamble spec, row start) | not used | if a vertical rule is ever needed in a KaTeX array, put it in the column spec instead — `\begin{array}{c\|c}` ✔ (KaTeX parses the escaped bar there); in HTML tables use `border-left` | – |
| TikZ/`pgfplots` (`\draw`, `\node`, `\clip`, `\foreach`, `\fill`, `\begin{axis}`, `\addplot`) | not math at all | L310–328, L548–555, L561–568 | redraw as SVG (§4.2) | 12, 21 |

Footnote for the `\hfill` case: in LaTeX it right-aligns inside the `\item`'s text block, i.e. the `[72%]` sits at the item's right margin — not the page margin. Reproduce with the flex row inside the `<li>`, not by absolutely positioning to the slide edge.

**Reviewer disagreement, kept as-is (with proof).** The independent review asked to move both `\tag` and `\vline` out of the unsupported list. `\tag` was moved ✔ (display mode only). `\vline` was **not**, because KaTeX 0.16.11 does not implement it in any form:

```
$ grep -c 'vline' node_modules/katex/dist/katex.js   →  0        # string absent from the bundle
a \vline b                                   → Undefined control sequence: \vline
\begin{array}{c} a \vline b \end{array}      → Undefined control sequence: \vline
\begin{array}{c\vline c} a & b \end{array}   → Undefined control sequence: \vline
\begin{array}{c} a \\ \vline b \end{array}   → Undefined control sequence: \vline
\begin{array}{c|c} a & b \end{array}         → OK   # the "|" column spec is the supported route
```

So the table row stays, with the working alternative (`{c|c}` / CSS `border-left`) recorded. Neither construct is used in the deck, so nothing downstream depends on this.

---

## 3. Beamer semantics → reveal.js mapping

### 3.1 Element table

| beamer element | where | reveal.js / HTML equivalent | notes |
|---|---|---|---|
| `\begin{frame}{Title}` | 29× | `<section>` + `<h2>` | one section per frame; keep source order |
| `\begin{frame}` (no title) | L67 (title), L661 (`[plain]`) | `<section class="title-slide">`, `<section class="plain">` | no `<h2>` |
| `\titlepage` | L68 | hand-built title block: `<h1>` → subtitle → authors (+ supervisor) → logo | order fixed by the default title-page template: title, author, institute, date, **then** the logo (§1.7) |
| `\titlegraphic` | L59 | `<img class="title-slide__logo" src="assets/ui/mif.png" alt="…">` at 200 px (2 cm) | title slide only, **centred at the bottom**, after the author block — a top-left logo is a deliberate deviation to log (§1.7) |
| `\tableofcontents` | L73 | `<ol class="toc">` with the 8 section titles (string list, hard-coded) | 8 numbered sections; `References` is `\section*` (L708) and must **not** appear |
| `\section{…}` × 8 | L76, 209, 266, 453, 496, 532, 642, 666 | **not** a slide (beamer 4:3 has no section pages here — they are only TOC/footline metadata) | use them for `data-section` labels + progress/QR navigation only |
| `block` (13×) | L98, 188, 224, 261, 284, 300, 365, 448, 474, 490, 512, 526, 637 | `<div class="block"><p class="block__title">…</p><div class="block__body">…</div></div>` | colours §1.3 (`#262686` / `#E9E9F3`); rounded 4 px, optional 1 px shadow |
| `alertblock` (4×) | L149, 204, 388, 429 | `.block--alert` | `#143E5F` / `#E8ECEF` |
| `exampleblock` | none | `.block--example` (define for games) | – |
| `gameblock` (9×) | L107, 197, 213, 270, 437, 457, 500, 519, 655 | `.block--game` | `#2E7D32` / `#EEF5EF`; **this is the deck's signature box — keep the exact green** |
| empty block title (`{}`) | L429, L448 | `.block--untitled` (no title element, body only) | beamer draws an empty 1-line title bar; recommend dropping it and keeping only the body card — log the deviation |
| `\pause` (3×) | L276, 283 (frame 10), L473 (frame 17) | `class="fragment"` on the *next* element | see §3.3 |
| `\only<…>` / `\onslide<…>` / `\uncover<…>` | **none** | – | nothing to do; the deck is nearly static |
| `itemize` / `\item` (46 items) | throughout | `<ul><li>` | bullets are `#3333B3` circles (`itemize items [circle]`); `\item` label `$A$:` stays in the text |
| `\note{}` | **none** | `<aside class="notes">` (empty) | no speaker notes exist — Phase 1 has nothing to port; if we want notes we must write them (flag as *new* content, not conversion) |
| `columns` + `column{0.48\textwidth}` | L236–260 | `display:grid; grid-template-columns:48fr 50fr; gap:2%` | §3.2 |
| `columns[c]` | L307 | `align-items:center` | §3.2 |
| `[plain]` | L661 | `.plain` section: no footer/slide number | "Thank you" frame; keep it plain, `\Huge` → 2.4 em |
| `[allowframebreaks]` | L710 | 2 `<section>`s (`References`, `References (cont.)`) | §5.2 |
| `\nocite{*}` + `\printbibliography` | L711–712 | static `<ol class="refs">`, 12 items | §5 |
| footline `n / 29` | theme | `.slide-number` "n / 29" (or `n / N` with the References split → 30) | keep the `/ N` form, it is part of the look |
| `\vspace`/`\smallskip`/`\hfill` | §2.3 | CSS margins / flex | – |
| `\textbf` / `\emph` | many | `<strong>` / `<em>` | – |
| ` ``…'' ` (TeX quotes) | L202, 301, 446, 475, 488, 599 | `“…”` (curly quotes, U+201C/201D) | `door, then $L$`, `sure thing!`, `Sapphire`, `saved`, … |
| `--` (en dash) | text: L140 "von Neumann--Morgenstern", L198/519/524 "50--50", L222 "5--20", L305 "Marschak--Machina" (also inside TikZ `--` path operators, which are not dashes) | `–` (U+2013) | `50–50`, `5–20`, `Marschak–Machina` |
| literal `—` (U+2014 em dash, already in the source) | L449 "…should not change the choice — but it does." (frame 16), L638 "I ≻ II and IV ≻ III — exactly the observed choices." (frame 24) | copy the character verbatim as `—` | do **not** "fix" these to `–`; the `---` ligature itself is unused in the deck |
| `St.\ Petersburg` | L209, L211, L611, **L649** (frame 25 item), **L668** (frame 27 title) | "St. Petersburg" | `\ ` = normal space |

### 3.2 Column widths

Three `columns` environments, all with `[T]` (top-aligned) except the second:

| frame | lines | beamer | CSS |
|---|---|---|---|
| 9 Bernoulli | L236–260 | `0.48` + `0.5` (sum 0.98) | `grid-template-columns: 48fr 50fr; column-gap: 2%` → **48 / 50**, `align-items:start` |
| 12 triangle | L307–339 | `0.52` + `0.46` (sum 0.98) | `52fr 46fr`, gap `2%`, `align-items:center` (`[c]`) |
| 21 prospect theory | L545–572 | `0.5` + `0.5` | `50fr 50fr`, gap `0` (beamer puts the slack between them), `align-items:start` |

Use `fr` units (not `%`) plus a explicit `gap` so the ratios survive the 4:3 → 16:9 change. On phones (`max-width: 700px`) collapse to `grid-template-columns: 1fr` — the brief's "stacks on phones" rule.

### 3.3 Overlay inventory (complete, so Phase 1 does not over-build)

| frame | line | what is revealed |
|---|---|---|
| 10 Allais OSRS | L276 | after `\pause`: **Question 2** + items `$C$`, `$D` |
| 10 | L283 | after 2nd `\pause`: the `block` "Typical answers (Kahneman & Tversky, 1979)" |
| 17 Ellsberg | L473 | after `\pause`: the `block` "Typical choice" |

That is **all** the animation in the deck: 3 fragments, 2 frames. Note the `\pause` is *inside* the `gameblock` (L276, L283) — so the fragment targets are elements inside the green box, not the box itself. The `\pause` at L283 is outside the `gameblock` (it closes at L282), revealing the block at L284.

---

## 4. Figures and graphics inventory

### 4.1 `resources/MIF.png` — the only raster asset

Verified with `file` + `sips`:

```
resources/MIF.png: PNG image data, 244 x 244, 8-bit/color RGBA, non-interlaced
pixelWidth 244, pixelHeight 244, dpiWidth 96, dpiHeight 96, format png   (90 584 bytes)
```

Additional properties (Pillow 12.2.0): mode `RGBA`, alpha range **64–255** (i.e. it is *not* a transparent cut-out: 59 049 of 59 536 pixels are ≥ 200 alpha), corners are white with alpha 64/128, dominant colours are white (`#E0E0E0`-bucket, ~29 k px) plus a dark navy mark (`#004060`-bucket, ~14 k px), mean luminance of the opaque pixels 166.

- **It is a white-background square logo, not a transparent PNG.** On a dark start screen it will appear as a white tile. Do **not** chroma-key the white: the semi-transparent edge (alpha 64–128) will fringe. Either put it on a deliberate white/very light rounded card, or leave it as-is on a light header.
- **Use:** title graphic only, `width=2cm` (L59) on a 128 mm-wide slide = 15.6 % of width ⇒ **200 px** at 1280 px canvas (300 px at 1920). Source is 244 px, so the deck shows it at ≤ 1.23× upscale — acceptable, slightly soft at 4K. No crop/trim needed (alpha bbox = full 244×244, there is no transparent margin to trim).
- **Conversion plan:** copy **as-is** to `docs/assets/ui/mif.png` (keep the filename uppercase-insensitive-safe; GitHub Pages/Linux is case-sensitive, so reference the exact filename you commit). One file serves both uses:
  - deck title slide at 200 px;
  - start screen (`index.html`) as a small badge next to the pixel-art title, 96–140 px.
  Adding a second "start screen version" is **not** needed unless the design wants a transparent logo — in which case ask the team for the original SVG/vector (do not upscale).
- **Confirm: this is the only raster asset in the deck.** `ls resources/` → `MIF.png` only; `\includegraphics` appears exactly once (L59). No `assets/`, no PDFs, no other images.

### 4.2 TikZ / pgfplots pictures (3)

| frame | lines | what it draws | reproducible exactly? |
|---|---|---|---|
| **12** "The probability triangle (Marschak–Machina)" | L310–328 | `tikzpicture[scale=3.9,>=Stealth]`: two axes (`p_0`, `p_2500`), the hypotenuse `p_2400=0` from (1,0) to (0,1), 7 **dashed parallel** indifference lines `(0,\c) -- (1,\c+2.5)` for `\c ∈ {-1.6,-1.2,-0.8,-0.4,0,0.4,0.8}` clipped to the triangle, 4 labelled points A(0,0) B(0.01,0.33) C(0.67,0.33) D(0.66,0), and two thick segments A–B (blue) and D–C (red) | **Yes, exactly.** Every coordinate is explicit; the only free choice is the slope 2.5, which the source itself calls "illustrative slope" (comment L315). Point geometry checks out against the Allais lotteries: B = (p₀=.01, p₂₅₀₀=.33, p₂₄₀₀=.66), C = (.67,.33,0), D = (.66,0,.34), A = (0,0,1). |
| **21** left, "Value function" | L548–555 | `axis` 5.0 cm × 3.7 cm, `xmin=-100 xmax=100 ymin=-140 ymax=70`, no ticks, `axis lines=middle`; `x^0.88` in blue for x∈[0,100], `-2.25(-x)^0.88` in red for x∈[-100,0], 60 samples each | **Yes** — closed-form, no randomness; the axis ranges are chosen so the loss branch at x=−100 (−129.4) stays inside `ymin=-140` |
| **21** right, "Probability weighting" | L561–568 | `axis` 5.0 cm × 3.7 cm, `xmin=0 xmax=1 ymin=0 ymax=1`, dashed grey identity `w(p)=p`, thick blue `p^0.61/((p^0.61+(1-p)^0.61)^(1/0.61))` on `p∈[0.0005,0.9995]`, 120 samples, `\tiny` tick labels | **Yes** — same formula as L541 and L688 |

Both plot axes are drawn with `\scriptsize` labels and the value-function axis is `axis lines=middle` (no frame); the weighting plot keeps pgfplots' default **boxed** frame. Reproduce that difference, it is visible.

### 4.3 Method comparison (no TeX, no `pdftocairo`, no `dvisvgm`, no ImageMagick)

Verified tool state in this environment:

```
pdflatex / xelatex / lualatex / pdftocairo / dvisvgm / magick / convert / inkscape : NOT FOUND
python 3.13.7 · matplotlib 3.10.8 · Pillow 12.2.0 : available (no cairosvg)
node 24.21.0 / npm 24.x : available
network : available
```

| option | pros | cons |
|---|---|---|
| **(a) hand-written inline SVG** | no build step, no asset, crisp at any zoom, works on `file://`, can be edited by a teammate, lets us highlight A/B/C/D later in the deck | every coordinate/typographic detail is manual; risky for curves + ticks; text is a separate font dependency unless we convert to paths |
| **(b) matplotlib → SVG committed to `assets/figures/`** | exact formulas, real axis ranges/ticks, one script regenerates all figures, `svg.fonttype='path'` removes the font dependency, `mathtext.fontset='cm'` matches KaTeX | one extra asset file per figure; needs the script kept (put it in `tools/make_figures.py`, *not* in `docs/`, since `docs/` is served); visual style must be tuned to look like pgfplots |
| **(c) ask the team to export from Overleaf** | pixel-identical to the PDF, zero drawing risk | needs a human + a compile round-trip; Overleaf gives **PDF**, and the PDF→SVG step still needs `pdftocairo`/`dvisvgm` (absent) or `pip install pymupdf`/`cairosvg`; blocks Phase 1 on someone else's calendar |

**Recommendation per figure**

- **Frame 12 (triangle) → (a) inline SVG.** It is 4 points, 2 segments, 3 lines, 7 dashed lines and 7 labels — all explicit numbers. Inlining avoids a request (works on `file://`, offline) and lets the "Try it" overlay reuse the same markup. Fallback if the team prefers a single pipeline: (b), same script as the plots.
- **Frame 21, both plots → (b) matplotlib SVG**, committed as `docs/assets/figures/value-function.svg` and `docs/assets/figures/probability-weighting.svg`, at the source aspect ratio 5.0 × 3.7 cm (= 500 × 370 px at 1 cm = 100 px), `svg.fonttype='path'`, transparent background, `#02487F` blue / `#FF0000` red / `#595959` grey. Hand-writing these curves is where an error would actually cost fidelity; matplotlib removes it.
- **(c) only as a last resort** for either figure — and note that a PDF export alone does not finish the job.

A ready starting point for (a) — generated and rasterised locally to check that the geometry is right (it renders correctly; the `2400 sure` / `A` labels need ~10 px of nudging against the real theme):

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 480" role="img"
     aria-label="Probability triangle with lotteries A, B, C, D">
  <defs><clipPath id="tri"><path d="M 110 440 L 490 440 L 110 40 Z"/></clipPath></defs>
  <g clip-path="url(#tri)" stroke="#595959" stroke-width="1.1" stroke-dasharray="5 4" fill="none">
    <line x1="110" y1="1048" x2="490" y2="98"/>   <!-- (0,-1.6)-(1,0.9) etc. -->
    <line x1="110" y1="896"  x2="490" y2="-54"/>
    <line x1="110" y1="744"  x2="490" y2="-206"/>
    <line x1="110" y1="592"  x2="490" y2="-358"/>
    <line x1="110" y1="440"  x2="490" y2="-510"/>
    <line x1="110" y1="288"  x2="490" y2="-662"/>
    <line x1="110" y1="136"  x2="490" y2="-814"/>
  </g>
  <g stroke="#000" stroke-width="1.4" fill="none">
    <line x1="110" y1="440" x2="512.8" y2="440"/>
    <line x1="110" y1="440" x2="110" y2="37.2"/>
    <line x1="490" y1="440" x2="110" y2="60"/>
  </g>
  <path d="M 520.4 440 l -12 -4 l 0 8 Z" fill="#000"/>
  <path d="M 110 29.6 l -4 12 l 8 0 Z" fill="#000"/>
  <line x1="110"    y1="440" x2="113.8"  y2="314.6" stroke="#02487F" stroke-width="2.4"/>
  <line x1="360.8"  y1="440" x2="364.6"  y2="314.6" stroke="#FF0000" stroke-width="2.4"/>
  <circle cx="110"   cy="440"   r="4.8" fill="#02487F"/>
  <circle cx="113.8" cy="314.6" r="4.8" fill="#02487F"/>
  <circle cx="364.6" cy="314.6" r="4.8" fill="#FF0000"/>
  <circle cx="360.8" cy="440"   r="4.8" fill="#FF0000"/>
  <g font-size="19" fill="#000">
    <text x="498" y="466" text-anchor="middle">p<tspan font-size="13" dy="4">0</tspan></text>
    <text x="102" y="45"  text-anchor="end" dominant-baseline="middle">p<tspan font-size="13" dy="4">2500</tspan></text>
    <text x="104" y="448" text-anchor="end" dominant-baseline="hanging">2400 sure</text>
    <text x="119" y="432">A</text>
    <text x="105" y="311" text-anchor="end">B</text>
    <text x="374" y="311">C</text>
    <text x="361" y="464" text-anchor="middle">D</text>
  </g>
</svg>
```

(Scaling rule: origin at (110, 440), 380 px per data unit, y flipped; `Y = 440 − 380·y`. Point radius 4.8 px corresponds to `circle (0.012)` at this scale. Labels are plain `<text>`; if you need them font-independent, either embed KaTeX-rendered HTML labels beside the SVG or convert to paths.)

For (b), a working snippet (run locally: produces valid SVGs):

```python
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams.update({"svg.fonttype": "path", "mathtext.fontset": "cm",
                     "font.family": "serif", "font.size": 9, "axes.linewidth": 0.8})
cm = 1/2.54
BLUE, RED, GREY = "#02487F", "#FF0000", "#595959"

# --- left: value function, pgfplots width=5.0cm height=3.7cm, xmin=-100 xmax=100 ymin=-140 ymax=70
fig, ax = plt.subplots(figsize=(5.0*cm, 3.7*cm))
x = np.linspace(0, 100, 60);   ax.plot(x,  x**0.88,            color=BLUE, lw=1.8)
x = np.linspace(-100, 0, 60);  ax.plot(x, -2.25*(-x)**0.88,    color=RED,  lw=1.8)
ax.set_xlim(-100, 100); ax.set_ylim(-140, 70)
ax.axhline(0, color="k", lw=0.8); ax.axvline(0, color="k", lw=0.8)
ax.set_xticks([]); ax.set_yticks([])
for s in ("top","right","left","bottom"): ax.spines[s].set_visible(False)  # axis lines=middle
ax.set_xlabel(r"$x$", fontsize=9, labelpad=2); ax.set_ylabel(r"$v(x)$", fontsize=9, labelpad=2)
ax.set_title("Value function", fontsize=9, pad=3)
fig.subplots_adjust(left=.16, right=.97, bottom=.17, top=.86)
fig.savefig("value-function.svg"); plt.close(fig)

# --- right: probability weighting, xmin=0 xmax=1 ymin=0 ymax=1, boxed axes
fig, ax = plt.subplots(figsize=(5.0*cm, 3.7*cm))
p = np.linspace(0, 1, 100);            ax.plot(p, p, ls="--", color=GREY, lw=1.0)
p = np.linspace(0.0005, 0.9995, 120); g = 0.61
ax.plot(p, p**g / (p**g + (1-p)**g)**(1/g), color=BLUE, lw=1.8)
ax.set_xlim(0, 1); ax.set_ylim(0, 1)
ax.set_xlabel(r"$p$", fontsize=9, labelpad=2); ax.set_ylabel(r"$w(p)$", fontsize=9, labelpad=2)
ax.set_title("Probability weighting", fontsize=9, pad=3)
ax.tick_params(labelsize=6, length=2)          # \tiny tick labels
fig.subplots_adjust(left=.17, right=.97, bottom=.19, top=.86)
fig.savefig("probability-weighting.svg"); plt.close(fig)
```

---

## 5. Bibliography

`references.bib` — **12 entries**, `grep -c '^@'` = 12, keys listed at L1, 10, 20, 29, 38, 47, 56, 62, 71, 80, 89, 98.

### 5.1 Entries, in-text forms, and full lines

`biblatex` is loaded with `style=numeric, sorting=ynt` (L14–18) ⇒ the printed list is numbered `[1]…[12]` and sorted by **year → name → title**. There is **no `\cite` anywhere** in the deck (`grep 'cite{'` matches only `\nocite{*}` at L711), so the numbers are attached to nothing. Recommend printing **author–year, no numbers**, so the list matches the "(Author Year)" in-text style the brief asks for (§7, L134).

| # (printed) | key | author(s) | year | in-text (short) | full reference line |
|---|---|---|---|---|---|
| 1 | `allais1953` | Allais, Maurice | 1953 | **Allais 1953** | Allais, M. (1953). Le comportement de l'homme rationnel devant le risque: critique des postulats et axiomes de l'école américaine. *Econometrica*, 21(4), 503–546. |
| 2 | `bernoulli1954` | Bernoulli, Daniel | 1954 | **Bernoulli 1738** *(see flag 5.3c)* | Bernoulli, D. (1954). Exposition of a New Theory on the Measurement of Risk. *Econometrica*, 22(1), 23–36. [Translation of the 1738 original] |
| 3 | `ellsberg1961` | Ellsberg, Daniel | 1961 | **Ellsberg 1961** | Ellsberg, D. (1961). Risk, Ambiguity, and the Savage Axioms. *Quarterly Journal of Economics*, 75(4), 643–669. |
| 4 | `kahneman1979` | Kahneman, Daniel; Tversky, Amos | 1979 | **Kahneman & Tversky 1979** | Kahneman, D., & Tversky, A. (1979). Prospect Theory: An Analysis of Decision under Risk. *Econometrica*, 47(2), 263–291. |
| 5 | `tversky1981` | Tversky, Amos; Kahneman, Daniel | 1981 | **Tversky & Kahneman 1981** | Tversky, A., & Kahneman, D. (1981). The Framing of Decisions and the Psychology of Choice. *Science*, 211(4481), 453–458. |
| 6 | `quiggin1982` | Quiggin, John | 1982 | **Quiggin 1982** | Quiggin, J. (1982). A Theory of Anticipated Utility. *Journal of Economic Behavior & Organization*, 3(4), 323–343. |
| 7 | `machina1987` | Machina, Mark J. | 1987 | **Machina 1987** | Machina, M. J. (1987). Choice under Uncertainty: Problems Solved and Unsolved. *Journal of Economic Perspectives*, 1(1), 121–154. |
| 8 | `gilboa1989` | Gilboa, Itzhak; Schmeidler, David | 1989 | **Gilboa & Schmeidler 1989** | Gilboa, I., & Schmeidler, D. (1989). Maxmin Expected Utility with Non-Unique Prior. *Journal of Mathematical Economics*, 18(2), 141–153. |
| 9 | `tversky1992` | Tversky, Amos; Kahneman, Daniel | 1992 | **Tversky & Kahneman 1992** | Tversky, A., & Kahneman, D. (1992). Advances in Prospect Theory: Cumulative Representation of Uncertainty. *Journal of Risk and Uncertainty*, 5(4), 297–323. |
| 10 | `mascolell1995` | Mas-Colell; Whinston; Green | 1995 | **Mas-Colell, Whinston & Green 1995** | Mas-Colell, A., Whinston, M. D., & Green, J. R. (1995). *Microeconomic Theory*. Oxford University Press. |
| 11 | `rabin2000` | Rabin, Matthew | 2000 | **Rabin 2000** | Rabin, M. (2000). Risk Aversion and Expected-Utility Theory: A Calibration Theorem. *Econometrica*, 68(5), 1281–1292. |
| 12 | `celov2026` | Celov, Dmitrij | 2026 | **Celov 2026** | Celov, D. (2026). *Microeconomic Analysis, Lecture 5: Uncertainty*. Lecture slides, Vilnius University. |

Where the deck already names these in text (verbatim, do not "fix"):
`(Kahneman & Tversky, 1979)` L284 · `(Bernoulli, 1738)` L225 · `(Tversky & Kahneman, 1981; Lecture 5)` L512 · `(Quiggin, 1982)` L612 · `(Gilboa & Schmeidler, 1989)` L613 and L623 · `Rabin (2000)` L524 · `(Marschak--Machina)` L305 (name only, no year) · `Savage's sure-thing principle` L488 (name only, no year).

Note the deck's existing style is the **comma** form — "(Kahneman & Tversky, 1979)" — while `BRIEF.md` §7 L134 writes "(Author Year)". Since no `\cite` exists, **keep the deck's comma form** and make the References slide match it; a global normalisation would be a content edit.

### 5.2 Rendering the References frame

`L710: \begin{frame}[allowframebreaks]{References}` + `L711 \nocite{*}` + `L712 \printbibliography` ⇒ **all 12 entries are printed, no citations in the body** (nothing is suppressed).

Recommendation: **split into two `<section>`s of 6 entries each** (`References`, `References (cont.)`), one column, ~0.62–0.7 em type, hanging indent, journal names italic. Reasons: 12 two-line entries at projector-legible size do not fit one 16:9 slide without dropping below the brief's "readable from the back of a room" bar; `[allowframebreaks]` was already going to paginate it in the PDF, so a 2-slide split is the *faithful* mapping, not a liberty. Keep the split point at the year boundary 1982/1987 (entries 1–6 = 1953–1982, entries 7–12 = 1987–2026) so each slide reads as a period.

Acceptable alternative if the team insists on 1:1 frames: a **single** `References` section with a vertically scrollable body (`max-height:70%; overflow-y:auto`), which works on `file://` and on touch; but scrolling inside a slide is a presentation risk (a stray key press can leave it mid-scroll) — prefer the 2-slide split. Either way, record the choice in `CONVERSION_NOTES.md` and add it to the slide counter (`n / 30`).

### 5.3 Flags (report only, do not edit)

a. **Duplicate `biblatex`.** `L14–18` loads it with `backend=biber, style=numeric, sorting=ynt`; `L25` loads it **again** with no options. LaTeX tolerates this (no option clash is raised because the second load adds no options), but it is dead code and a trap for anyone editing the preamble — if someone adds options at L25 they *will* get "Option clash for package biblatex".
b. **`celov2026` is the lecture itself** (L98–103, `@misc`, no `url`/`howpublished`): the supervisor's Lecture 5 slides. It is defensible as source attribution, and it is what `Lecture 5` on L512 refers to — but it will appear as entry 12 in a list of the literature the talk *cites*. Decide explicitly whether "References" means *literature* or *sources*; if the latter, keep it and label the group.
c. **Bernoulli year mismatch.** The bib entry is `bernoulli1954` with `note = {Translation of the 1738 original}` (L18), but L225 says "(Bernoulli, 1738)". The web must show one form in the text and the other in the list. Recommendation: keep **1738** in the sentence (it is the substantive date), and print the reference with both years as above.
d. **Two names in the body have no bib entry:** *Savage* (sure-thing principle, L488) and *von Neumann–Morgenstern* (theorem, L140). Also `tversky1992`, `mascolell1995` and `machina1987` are in the bib but never named with a year in the body. Net effect: the 12-entry list is neither exactly "cited works" nor "further reading". Content decision for the team, not a conversion bug.
e. **`quiggin1982` title contains `\&`** (`Journal of Economic Behavior \& Organization`, L65) — that is correct LaTeX; in HTML it must be a literal `&amp;`.

---

## 6. Content-fidelity risks

Nothing below was changed. Each item: quote + line, why it matters, and the "do not silently fix" instruction.

### 6.1 The one real error in the source

1. **`\chi` instead of `\mathcal{X}` — frame 13, L345.**
   `Consider four lotteries $L_1,L_2,L_3,L_4 \in \mathcal{L}$ over outcomes $x_1,x_2,x_3 \in \chi$.`
   The outcome set elsewhere is `\mathcal{X}` (L84 `x_i\in\mathcal{X}`, and L44 defines `\X` for exactly this). Lowercase `\chi` renders as the Greek letter χ and **KaTeX renders it without any error**, so this is a silent semantic corruption that a "0 `.katex-error`" check will never catch. Only frame 13 is affected. Fix later (with the team's OK) by `\in \mathcal{X}` — log it in `CONVERSION_NOTES.md` as slide 13.

Everything else below is **style, wording or notation**, not a factual error. Re-read them before "correcting" anything.

### 6.2 Style and wording decisions (not errors)

1. **Compressed notation in the expectation — frame 27, L679.**
   `\mathbb{E}=\sum_{k=1}^{n}1+\sum_{k>n}2^{-k}2^{n}=n+1 .`
   This is **numerically correct**: each term of the first sum is `2^{-k}2^{k} = 1`, so `\sum_{k=1}^{n}1 = n`, and the whole line gives `n+1`, which L681 confirms (`2^{20} → 21`, `2^{30} → 31`). It is only *notation*: writing `1` instead of the payoff term hides where the `n` comes from, and `\mathbb{E}` is set without an argument. Optional polish, frame 27 only — do not "fix" it silently, and do not treat it as a numbers bug.

2. **Grammar in a frame title — frame 11, L289.**
   `\begin{frame}{Why $A\succ B$ and $C\succ D$ is inconsistent}` — a compound subject would normally take "are" (or the title could be recast, e.g. "Why A≻B and C≻D cannot both hold"). Cosmetic; the title is on screen for the whole discussion.

3. **Unfinished abbreviation on the title slide — L56.**
   `Supervisor: Assoc. Dmitrij Celov` — "Assoc." is missing "Prof." (and the line has no final period). Rendered on frame 1; will be a prominent `<p>` on the web title slide.

4. **Deck title vs. brief title.** `slides.tex` L50: *"Paradoxes of Choices under Uncertainty"* (plural "Choices", lowercase "under"); `BRIEF.md` L1: *"Paradoxes of Choice Under Uncertainty"*. Nothing in the deck explains the plural. The website `<title>`, the start-screen pixel-art headline and possibly the repo name all inherit this — **decide once** and use one string everywhere. Recommendation: use the .tex string (it is what the audience has seen), and note the discrepancy.

5. **Dead caption machinery — L7–L10, L21–L22, `VUMIF` L38, L48–L49.** `\thefigure{\arabic{figure} figure.}` would print "1 figure." (noun after the number, stray period) if any `\caption` existed; none does. Do not port; if a figure caption is ever added on the web, use a plain `<figcaption>`.

### 6.3 Checked and found *consistent* (so nobody "fixes" them)

- **C/D ordering (frame 11 title vs. frame 12 L335).** L289 says *"Why A≻B and C≻D is inconsistent"*; L293–295 derive exactly `A≻B ⇔ 0.34u(2400) > 0.33u(2500)` and `C≻D ⇔ 0.33u(2500) > 0.34u(2400)`; L335 says `$AB \parallel DC$, so EU ranks both pairs alike: $A\succ B \Leftrightarrow D\succ C$`. **No contradiction:** D≻C is the *EU-implied* ranking, C≻D is the *observed* one (82 % A, 83 % C at L285), and the frame's point is precisely that the observed pair cannot hold. L298 `\bot` closes it. All three statements are correct together.
- **Allais numbers (frame 10, L273–281).** A: 2400k sure; B: 2500k w.p. .33, 2400k w.p. .66, 0 w.p. .01; C: 2500k w.p. .33, 0 w.p. .67; D: 2400k w.p. .34, 0 w.p. .66 — the standard Allais pair, and the triangle points (L322–325) match exactly.
- **`2\,400k gp` (L273, 274, 279, 280)** is "2 400 thousand gp" = 2.4 M gp — correct for OSRS, just unusual typography (thin space as thousands separator). Keep the thin space in HTML (`2 400k`, U+2009 or `&thinsp;`), not `2,400k`.
- **Frame 22's V column** (L584–592): I recomputed all eight values from `v(x)=x^{0.88}`, `w(p)` with γ=0.61 and λ=2.25 — 943.2, 806.5, 326.7, 320.1, 19.9, 15.6, 5.8, 6.7 all check (±0.5). Same for the `w(p)` row of frame 28 (L695) and for `v(2400)=943.2` / `=V(A)` on L700.
- **Loss aversion arithmetic (frame 20, L527):** `0.5·1050 − 0.5·2.25·1000 = −600` ✓; "+25" expected value on L523 ✓; Rabin's 20 000/any-amount calibration (L524) is the ×10 rescaling of Rabin's $100/$105 → $20 000 example ✓.
- **Ellsberg (frames 17–18):** 30 rubies + 60 unknown = 90 (L457–458); bets I–IV (L465–469); π_R=1/3, π_E+π_S=2/3 (L481); both implications (L483–484) and the worst-case row (L633: 1/3, 0, 1/3, 2/3) are right.
- **Framing (frame 19):** 72/28 and 22/78 (L503–509) are the Kahneman–Tversky 1981 numbers; "A ≡ C and B ≡ D" (L513) is correct.
- **`prizes $e^{2^k}$` (L262)** is not a typo: with u = ln x, ln(e^{2^k}) = 2^k and Σ 2^{-k}·2^k diverges, which is exactly the "log utility breaks again" claim.
- **St. Petersburg (frame 8):** Pr(k)=2^{-k}, E = Σ 2^{-k}2^k = ∞ (L217–218); the WTP equation at L234 and its truncation K=200 / Brent (L674–676) are internally consistent with the table at L244–247 (10→4.97, 100→7.79, 1000→10.95, 10⁶→20.87 — all plausible for the log case).

### 6.4 Font-size switches (projector readability)

Base is 12 pt on a 128 mm-wide canvas. LaTeX's 12 pt-class ratios: `\small` = 0.92, `\footnotesize` = 0.83, `\scriptsize` = **0.67**, `\tiny` = 0.5 of the base — i.e. `\scriptsize` is **8 pt on a 128 mm slide ≈ 2.2 % of slide width** (≈ 28 px on the 1280 px canvas; ≈ 3 cm cap height on a 2.4 m projection ⇒ comfortable to ~10 m, marginal beyond that).

| frame | line | switch | scope |
|---|---|---|---|
| 5 Expected utility | **L123** | `\scriptsize` | **whole frame** — the densest slide in the deck (two displays + 3 axioms + an `alertblock`) |
| 13 Paradoxical pattern | **L343** | `\scriptsize` | **whole frame** — also the frame with the `\chi` bug |
| 21 Prospect theory | L535 `\footnotesize`, **L537 `{\scriptsize …}`**, L550–551/557/563–564/570 `\scriptsize`/`\tiny` | mixed | the big `V(L)` display is set in `\scriptsize`, the axis tick labels in `\tiny` |
| 9 Bernoulli | L230 `\small`, L252 `\footnotesize` | partial | table note |
| 10 Allais | **L269 `\footnotesize`** | whole frame | `\footnotesize` on a game-frame that people must read while voting |
| 19 Framing | L499 `\footnotesize`; **L501 `\small`** | partial | `\footnotesize` covers only the `gameblock` **title** (L500) and the trailing `block` (L512, after `\end{gameblock}` at L511). The `\small` issued at the start of L501 persists to the end of the `gameblock` (it is inside the environment group), so **both headings and all four plan lines are `\small`**, not `\footnotesize` |
| 22, 23, 28 | L579, L606, L686 | `\footnotesize` | tables; L691 `\small` overrides for the w(p) table |
| 26 Thank you | L663 | `\Huge` | fine |

Recommendation for Phase 1: do **not** copy these ratios literally. At 1 cm = 100 px the PDF's own sizes are 12 pt ≈ 42 px, 10 pt ≈ 35 px, 8 pt ≈ 28 px; since the deck's *dominant effective* body size is `\footnotesize`/`\small`, set the web base around **34–36 px** (≈10 pt) on the 1280×720 canvas and map `\small→0.92em`, `\footnotesize→0.85em`, `\scriptsize→0.78em` (≈27 px), i.e. keep nothing below ~26 px. For frames 5 and 13 add a fragment step or accept 0.85 em instead of shrinking further. Note in `CONVERSION_NOTES.md` wherever the web type is larger than the PDF — it is a readability improvement, not a fidelity loss, but the presenters should know the frame will look different.

---

## 7. Self-check (what I verified, and how)

- **Line numbers:** every citation above was re-read with `grep -n`/`sed -n` on the current files after drafting (frames list, block/alertblock/gameblock/table/TikZ/`\pause`/`\vspace`/`\hfill`/font-switch lines, the `\chi` line 345, and the style lines 273, 289, 298, 335, 679).
- **Frame count:** 29. Section count: 8 numbered + 1 starred. `\pause`: 3, at L276/283/473. `\only|\onslide|\uncover|\note`: 0. `\caption`: 0. `\multicolumn`: 0. `\begin{algorithm}`: 0. `\subfloat`, `lstlisting`, `\href`, `\url`: 0. `\cite`: 0 (only `\nocite{*}`).
- **Bib:** `grep -c '^@' references.bib` = **12**; keys at L1, 10, 20, 29, 38, 47, 56, 62, 71, 80, 89, 98.
- **PNG:** `file` → `PNG image data, 244 x 244, 8-bit/color RGBA, non-interlaced`; `sips -g pixelWidth -g pixelHeight -g dpiWidth -g dpiHeight -g format` → 244 / 244 / 96 / 96 / png; Pillow: mode RGBA, alpha 64–255, 59 049 of 59 536 px ≥ 200 alpha, white-dominant.
- **Toolchain:** `pdflatex`, `xelatex`, `lualatex`, `pdftocairo`, `dvisvgm`, `magick`, `convert`, `inkscape` all *not found*; Python 3.13.7 + matplotlib 3.10.8 + Pillow 12.2.0 present; `cairosvg` absent; node 24.21.0 + npm present.
- **KaTeX:** installed 0.16.11 in a scratch directory and rendered (a) 172 auto-extracted segments — 169 clean, 3 extractor artefacts, and (b) 180+ targeted construct probes. Native ✔: `\checkmark`, `\bot`, `\delta`, `\tfrac`, `\boxed`, `\underbrace`, `\Big\{`, `\bigl`, `\text`, `\succeq`, `\mathcal`, `\mathbb`, `\\[4pt]`, `aligned`/`align*`/`cases`, `\tag`/`\tag*` (**display mode only**; inline raises "\tag works only in display equations"). Unsupported ✘: `\vspace`, `\hfill`, `\smallskip`, `\multirow`, `\multicolumn`, `tabular`, `columns`, `\centering`, `\pause`, `\only`, `\uncover`, `\onslide`, `\note`, `\setlength`, `\arraybackslash`, `\raggedright`, `\toprule`/`\midrule`/`\bottomrule`, `\cline`, `\vline`, `\textsc`, `\textbackslash`, `\ensuremath`, `\label`, `\intertext`, `\sfrac`, `\nicefrac`. (`\hline` **is** supported inside `array`; `\vline` is not — see the disagreement note in §2.3.)
- **Figures:** the inline-SVG triangle and the matplotlib snippet were both actually generated and rasterised here; the triangle's geometry (A/B/C/D coordinates, parallel A–B and D–C segments, clipped dashed lines) and the value function's shape were visually confirmed. They are starting points, not final art.
- **Not verified (impossible without a TeX install):** the exact rendered tint of theme-inherited elements (`structure`, block tints), the real PDF page count after `[allowframebreaks]`, and whether any frame overfulls in the 4:3 original. Flagged as "verify against the PDF" where relevant.

---

**Report to coordinator**

- **File written:** `notes/phase0/preamble.md` (this file). No other file touched.
- **Review round applied** (7 items from the independent audit): (1) title-page order corrected to title → author → institute → date → **logo, centred at the bottom** (§1.7, §3.1), with the top-left-logo deviation flagged for `CONVERSION_NOTES.md`; (2) `\vspace` row now lists frames **3, 5, 9, 21, 22** (L148 added) with single-scale px values (−15 / +10 / +5 / −14 / −21 px at 1 cm = 100 px, 1 pt = 3.53 px); (3) display count restated as **26 = 23 `\[…\]` + 3 `align*`** (L292/L482/L699); (4) `\tag` moved to *supported, display mode only*; (5) frame 19 font claim corrected (body is `\small` from L501; only the gameblock title L500 and the closing block L512 are `\footnotesize`) and frame 19 dropped from the font-overflow risk; (6) `St.\ Petersburg` also at **L649, L668**, literal `—` at **L449, L638**, `\%` row reworded as text-mode, Allais title `risque: critique` (no space before the colon); (7) §6 retitled: **only `\chi` (L345) is an error**, with items 2–6 moved to "Style and wording decisions".
- **Disagreement (1):** the review asked to move `\vline` out of the unsupported list; KaTeX 0.16.11 does **not** support it in any form (string "vline" occurs 0 times in `katex.js`; four parse tests fail), while the `{c|c}` column spec does. Row kept, alternative documented (§2.3). Not used in the deck, so no downstream impact.
- **Bib entry count:** **12** (`allais1953`, `bernoulli1954`, `ellsberg1961`, `gilboa1989`, `kahneman1979`, `machina1987`, `mascolell1995`, `quiggin1982`, `rabin2000`, `tversky1981`, `tversky1992`, `celov2026`), all printed via `\nocite{*}`; recommend a 2-slide split, 6 + 6.
- **Figures found:** **4 total** — 1 raster (`resources/MIF.png`, 244×244 RGBA, white background, 96 dpi, used once at `width=2cm`) and **3 TikZ/pgfplots pictures** (frame 12 probability triangle; frame 21 value function; frame 21 probability weighting). 6 `tabular`s are tables, not figures.
- **Recommended for the two figures:** frame 12 → hand-written inline SVG (coordinates verified, snippet supplied); frame 21 ×2 → matplotlib SVG at 5.0×3.7 cm with `svg.fonttype='path'`, committed to `docs/assets/figures/`. Overleaf export only as fallback, since the PDF→SVG step is also un-tooled here.
- **Top 5 conversion risks:**
  1. **4:3 vs 16:9.** The source is 4:3 128×96 mm (no `aspectratio` option, L4–L6); the brief demands 16:9. Everything must re-flow; fix 1 cm = 100 px and accept that the projection geometry differs from the rehearsed PDF.
  2. **Only `\X` needs a KaTeX macro, but two silent-error traps remain:** `\chi` at L345 renders fine and is wrong (a "0 `.katex-error`" check won't catch it), and `\vspace`/`\hfill`/`\smallskip` are *undefined* in KaTeX — if any survives into a `$…$`, the frame shows a red parse error.
  3. **Overlay inventory is 3 `\pause` commands (L276, L283, L473) and nothing else** — no `\only`/`\onslide`/`\uncover`, and **no `\note{}`**, so there is no speaker-note content to port. Phase 1 must not invent fragments beyond those three, and "speaker notes on S" will be empty unless the team writes notes.
  4. **Tables are the fiddly part, not the math:** 6 `booktabs` tables, 4 `\multirow` cells (rowspan), one `p{2.2cm}`-constrained table, one `\tabcolsep=3pt` dense 9-column table — all unsupported by KaTeX and all needing hand-built CSS. Frames 9, 17, 22, 23, 24, 28.
  5. **Readability:** frames 5 (L123) and 13 (L343) are set entirely in `\scriptsize` (0.67 × base, 8 pt on a 128 mm slide); frame 10 is entirely `\footnotesize` (L269); plus `\tiny` axis ticks on frame 21. (Frame 19 is **not** in this list: its body is `\small` from L501 — only its `gameblock` title and the closing block are `\footnotesize`.) Copying the ratios literally gives ~28 px at 1280 px wide — hard to read at the back; lift to ~0.78 em of a 34–36 px base and log it.
