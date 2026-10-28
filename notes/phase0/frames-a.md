# Phase 0 inventory — frames 1–15

Scope: `Microeconomic_analysis__Copy_/slides.tex`, lines **1–433** (preamble + frames 1–15, i.e. title slide through "Generalized Allais paradox"). Frame 16 ("Common ratio effect: a Minecraft expedition") starts at line 435 and is **out of scope** here.

Source structural facts established while reading:

- `\documentclass[12pt]{beamer}` (line 4) — **4:3 by default**; the 16:9 line is commented out on line 5.
- Theme `Madrid`, restyled by `VUMIF.sty` (`\usetheme{Madrid}` line 48, `\usepackage{VUMIF}` line 61).
- Three `\section`s occur in this range: line 76 `Expected utility: the benchmark`, line 209 `St.\ Petersburg paradox`, line 266 `Allais paradox`. Frames 1–2 sit before the first section.
- One custom environment in play: `gameblock` (green block, defined lines 39–43 in the preamble).
- One custom macro: `\X` = `\mathcal{X}` (line 44) — **never used** in frames 1–15 (frame 13 writes `\chi` instead; see flags).
- `\addtobeamertemplate{author}{}{Supervisor: Assoc. Dmitrij Celov\par}` (line 56) injects a supervisor line into the title slide author block.

---

## Frame-by-frame inventory (frames 1–15)

| frame | title (exact) | section | content types | overlay steps | notes |
|---|---|---|---|---|---|
| 1 | *(none — `\begin{frame}` with no title argument, line 67)* | — (before first section) | titlepage, figure | none | `\titlepage`; logo via `\titlegraphic{\includegraphics[width=2cm]{resources/MIF.png}}` (line 59). Author template is extended by `\addtobeamertemplate{author}` → extra line "Supervisor: Assoc. Dmitrij Celov". Title "Paradoxes of Choices under Uncertainty", subtitle "Microeconomic analysis", three authors, empty `\date{}`. src 67–69 |
| 2 | `Outline` | — (before first section) | toc | none | `\tableofcontents` only. Renders all 8 numbered sections: 1 Expected utility: the benchmark; 2 St. Petersburg paradox; 3 Allais paradox; 4 Ellsberg paradox; 5 Framing and loss aversion; 6 Explaining the paradoxes; 7 Conclusion; 8 Appendix (`References` is `\section*`, L708, excluded). Beamer's `\tableofcontents` lists every numbered section in the document, not only those encountered so far; the Madrid theme may split the TOC across "current section" shading. src 72–74 |
| 3 | `Choices under uncertainty` | Expected utility: the benchmark | math, itemize, block | none | `\vspace{-0.15cm}` before itemize and `\vspace{0.1cm}` before the block — deliberate negative spacing. `\textbf{lottery}` inline. 3 bullets + block. src 78–103 |
| 4 | `Example: a lottery in Minecraft` | Expected utility: the benchmark | gameblock, math, itemize | none | `\small` frame-wide; `gameblock` (green) titled "Mining a diamond ore with a \emph{Fortune III} pickaxe". `\tfrac` fractions, `\Big\{...\Big\}`. 3 bullets after the block. src 105–120 |
| 5 | `Expected utility` | Expected utility: the benchmark | math, itemize, alertblock | none | `\scriptsize` frame-wide (densest frame in the range). Two display equations + one inline `u:\mathcal{X}\rightarrow\mathbb{R}`; `\vspace{0.05cm}` before alertblock. alertblock "Independence: the key axiom" states `0<\alpha<1`. src 122–161 |
| 6 | `Independence axiom` | Expected utility: the benchmark | math, block | none | `\small`; display equation, then a 2-column-style `aligned` derivation inside `\[ \]` manually split with `&` and `\quad`. `\bigl(...\bigr)` throughout. block "Prediction". src 163–193 |
| 7 | `Independence in plain words: a Skyrim dungeon` | Expected utility: the benchmark | gameblock, itemize, alertblock | none | `\small`; gameblock "Two chests behind a door". Uses `W.p.\ $1-\alpha$`; both `W.p.` occurrences are sentence-initial. One inline display-style chain `\alpha L+(1-\alpha)N\succeq\alpha M+(1-\alpha)N` with `\ ` before it. alertblock "The paradoxes". src 195–207 |
| 8 | `St.\ Petersburg paradox: the villager's coin` | St. Petersburg paradox | gameblock, math, itemize, block | none | `\small`; gameblock "A villager offers a game". `2^k` written *without* braces in the source (`$2^k$`). `\Pr`, `\mathbb{E}`, `\infty`, `\dots`. block "Paradox" cites (Bernoulli, 1738) as plain text — no `\cite`. src 211–227 |
| 9 | `Bernoulli's resolution: concave utility` | St. Petersburg paradox | math, columns, table, itemize, block | none | `\small` frame + `\vspace{-4pt}` hack before the display. `\begin{columns}[T]` with 0.48 / 0.5 `\textwidth`; left column `\centering`, a booktabs `tabular{rr}` table, `\smallskip`, then `{\footnotesize (numerical solution, see Appendix)}`. Right column has its own `\begin{itemize}` but **no `\small` repeat** (inherits). `\ln\!\big(...\big)`. block "Takeaway". src 229–264 |
| 10 | `Allais paradox: a rare drop in OSRS (vote!)` | Allais paradox | gameblock, itemize, block, math (inline only) | **Step 1.** `\pause` (L276, *inside* the `gameblock`) → reveals `\textbf{Question 2.}` + its 2-item itemize (C/D). `\end{gameblock}` is L282. **Step 2.** `\pause` (L283, after the green box) → reveals the separate blue `block` "Typical answers (Kahneman & Tversky, 1979)" (L284–286) **outside** the `gameblock`. Question 1 + its itemize are visible from the start; **two fragment steps** total. | `\footnotesize` frame-wide; only step 1 is inside the green box — the second step is a separate `block` after it, so the `gameblock` has two internal states, not three. `2\,400k gp` thinned thousands. `w.p.\ 0.33` notation. Percent signs escaped (`82\%`, `83\%`) and *inside math-free text*. src 268–287 |
| 11 | `Why $A\succ B$ and $C\succ D$ is inconsistent` | Allais paradox | math, block | none | `\small`; title itself contains math (`$A\succ B$`, `$C\succ D$`). `align*` with `\\[4pt]` extra row spacing. `\qquad \bot` as contradiction marker. block "Common consequence" — contains `2\,400 w.p.\ 0.66` inside quotation marks ``` ``...'' ```. src 289–303 |
| 12 | `The probability triangle (Marschak--Machina)` | Allais paradox | columns, tikz, itemize | none | `\small`; `columns[c]` 0.52 / 0.46. TikZ `scale=3.9`, `>=Stealth`, `\clip` triangle, `\foreach \c in {-1.6,...,0.8}` dashed `gray!70` lines slope 2.5, four `\fill` dots radius 0.012 in `blue`/`red`, two thick segments. Slim `\scriptsize` axis/point labels. Second column re-declares `\small` inside the itemize. src 305–340 |
| 13 | `Paradoxical pattern of choice` | Allais paradox | math, block | none | `\scriptsize`; a **blank line** after `\scriptsize` (line 344) before the text. Three separate `\[ \]` displays separated by blank lines. Uses `\mathcal{L}` for the lottery set but `\chi` (not `\mathcal{X}`) for outcomes — see flags. block "Question". src 342–370 |
| 14 | `Independence and inconsistent preferences` | Allais paradox | math, alertblock | none | `\small`; this frame alone uses `\(...\)` inline delimiters instead of `$...$` (lines 380, 386). Two displays. alertblock "Conclusion". src 372–392 |
| 15 | `Generalized Allais paradox` | Allais paradox | math, alertblock | none | `\small`; two `aligned` blocks inside `\[ \]`, `\delta_{x_H}` Dirac notation, `\boxed{...}`, `\bot`, `\;\Longrightarrow\;`. Final `alertblock` has an **empty title** (`\begin{alertblock}{}`) and contains `\text{...}` strings. src 394–433 |

---

## Formula and number register

### Frame 1 — *(title slide, no title argument)*

No math, no numbers on the slide body. Text content only: title "Paradoxes of Choices under Uncertainty", subtitle "Microeconomic analysis", authors "Gedas Ber\v{z}inskas, Adrijus Skuodas, Jok\={u}bas \v{Z}itkevi\v{c}ius", supervisor line, logo `resources/MIF.png` at `width=2cm`.

- Numbers: none.
- KaTeX/typo notes: none.

### Frame 2 — Outline

No math on the slide. `\tableofcontents` only.

- Numbers: none typed in the source — beamer prints the section numbers 1–8 for the 8 numbered sections.
- KaTeX/typo notes: none. Reveal has no automatic TOC — must be hand-built.

### Frame 3 — Choices under uncertainty

```latex
L=\{(x_1,p_1),\ldots,(x_n,p_n)\}, \quad
p_i\geq 0,\quad \sum_{i=1}^n p_i=1,\quad
x_i\in\mathcal{X}.
```

Inline math also present: `$L\succeq M$`, `$L$`, `$M$`.

- Numbers: `0` (`p_i\geq 0`); `1` (`\sum_{i=1}^n p_i=1`); indices `1` and `n`; outcome indices `1`…`n`.
- KaTeX: all supported (`\mathcal`, `\succeq`, `\sum` with limits, `\ldots`).
- Typos: none.

### Frame 4 — Example: a lottery in Minecraft

```latex
L_{\text{mine}}=\Big\{(1,\tfrac25),\ (2,\tfrac15),\ (3,\tfrac15),\ (4,\tfrac15)\Big\},
\qquad \mathbb{E}[L_{\text{mine}}]=\tfrac{2+2+3+4}{5}=2.2 .
```

Inline math also present: `$2.2>2$`, `$2$`.

- Numbers, exactly as written:
  - payout `1` diamond w.p. `\tfrac25` (2/5)
  - payout `2` diamonds w.p. `\tfrac15` (1/5)
  - payout `3` diamonds w.p. `\tfrac15` (1/5)
  - payout `4` diamonds w.p. `\tfrac15` (1/5)
  - expected value numerator `2+2+3+4`, denominator `5`, result `2.2` diamonds
  - alternative offer: **2 diamonds for sure**
  - item text: `2.2>2`
  - pickaxe enchantment level: `Fortune III` (Roman numeral III)
- KaTeX: `\tfrac` and `\Big\{` are supported. Note `\tfrac25` renders as a stacked fraction in text style — check it does not overflow the line at 375 px.
- Typos: none. (`Fortune III` is the correct Minecraft enchantment name.)

### Frame 5 — Expected utility

```latex
u:\mathcal{X}\rightarrow\mathbb{R}
```
```latex
EU(L)=\sum_{i=1}^n p_i u(x_i).
```
```latex
L\succeq M
\quad\Longleftrightarrow\quad
EU(L)\geq EU(M).
```
```latex
\alpha L+(1-\alpha)N
\succeq
\alpha M+(1-\alpha)N.
```

- Numbers: `0` and `1` in `0<\alpha<1` (alertblock hypothesis).
- KaTeX: all supported. `\Longleftrightarrow` is fine.
- Typos / content flags: none orthographic; note the **axiom is stated with `0<\alpha<1` here but with `\alpha>0` on frame 6** — an inconsistency in the source, do not silently harmonise (flag to coordinator).

### Frame 6 — Independence axiom

```latex
\alpha L+(1-\alpha)N
\succeq
\alpha M+(1-\alpha)N,
\qquad \alpha>0.
```
```latex
\begin{aligned}
&EU\bigl(\alpha L+(1-\alpha)N\bigr)\\
&\quad-EU\bigl(\alpha M+(1-\alpha)N\bigr)\\
&=\alpha EU(L)+(1-\alpha)EU(N)\\
&\quad-\alpha EU(M)-(1-\alpha)EU(N)\\
&=\alpha\bigl[EU(L)-EU(M)\bigr].
\end{aligned}
```

- Numbers: `0` in `\alpha>0`; `1` in `(1-\alpha)` — six occurrences (2 in the first display, 4 in the aligned derivation).
- KaTeX: `aligned` is supported; the leading `&` on every row plus `&\quad` produces the hanging continuation lines — preserve the `&`/`\quad` pattern exactly or the derivation will re-align.
- Typos: none.

### Frame 7 — Independence in plain words: a Skyrim dungeon

```latex
\alpha L+(1-\alpha)N\succeq\alpha M+(1-\alpha)N
```
(inside the itemize, preceded in the source by `` :\ '' — colon, control space, then the math).

Inline math also present: `$1-\alpha$`, `$\alpha$`, `$L$`, `$M$`, `$N$`.

- Numbers:
  - ambush probability `1-\alpha` ("W.p. $1-\alpha$")
  - reach-treasure probability `\alpha`
  - chest `L`: **500 gold for sure**
  - chest `M`: **0 or 1200 gold, 50--50** (en dash between the two 50s)
- KaTeX: supported.
- Typos: none. `50--50` renders as "50–50" (en dash) — keep the source form.

### Frame 8 — St. Petersburg paradox: the villager's coin

```latex
\Pr(k)=2^{-k},\qquad
\mathbb{E}[\text{prize}]=\sum_{k=1}^{\infty}2^{-k}\cdot 2^{k}=1+1+1+\dots=\infty .
```

Inline math also present: `$2^k$`, `$k$`, `$\approx$`.

- Numbers:
  - prize on flip `k`: `2^k` emeralds (`2^k` written without braces in the source)
  - probability `2^{-k}`
  - series `1+1+1+\dots=\infty`
  - willingness to pay `$\approx$ 5--20 emeralds`
  - citation year `(Bernoulli, 1738)`
- KaTeX: supported. Note `2^k` (no braces) after `$` — copy as-is; KaTeX accepts it.
- Typos: none. "St.\ Petersburg" uses `\ ` to force the abbreviation space — do **not** drop it or it becomes "St.Petersburg".

### Frame 9 — Bernoulli's resolution: concave utility

```latex
\sum_{k=1}^{\infty}2^{-k}\ln\!\big(w+2^{k}-p\big)=\ln w .
```
```latex
\begin{tabular}{rr}
\toprule
Wealth $w$ & Price $p$ \\
\midrule
10 & 4.97\\
100 & 7.79\\
1\,000 & 10.95\\
1\,000\,000 & 20.87\\
\bottomrule
\end{tabular}
```
Inline math also present: `$u(x)=\ln x$`, `$u''<0$`, `$2^{20}\approx10^6$`, `$21$`, `$e^{2^k}$`, `$p$`, `$w$`.

- Numbers (table cells exactly as written):
  - `10` → `4.97`
  - `100` → `7.79`
  - `1\,000` → `10.95`
  - `1\,000\,000` → `20.87`
  - bankroll bound `2^{20}\approx10^6` emeralds
  - implied price `21` emeralds
  - exponents `k`, `2^{k}`
- KaTeX: **`\toprule`, `\midrule`, `\bottomrule` (booktabs) are NOT supported by KaTeX**, and `\begin{tabular}` is not a KaTeX environment (KaTeX has `{array}` with `\hline`). Convert to an HTML `<table>` with CSS rules rather than shipping this into `$$…$$`.
- Typos: none.

### Frame 10 — Allais paradox: a rare drop in OSRS (vote!)

No display math on this frame; inline math only: `$A$`, `$B$`, `$C$`, `$D$`.

- Numbers, exactly as written:
  - Question 1, option A: `2\,400k gp for sure` → renders "2 400k gp for sure"
  - Question 1, option B: `2\,500k gp w.p.\ 0.33`, `2\,400k w.p.\ 0.66`, "a player killer takes it w.p.\ 0.01"
  - Question 2, option C: `2\,500k gp w.p.\ 0.33`, `nothing w.p.\ 0.67`
  - Question 2, option D: `2\,400k gp w.p.\ 0.34`, `nothing w.p.\ 0.66`
  - Typical answers: `82\%` choose `$A$`, `83\%` choose `$C$`
  - citation year `1979`
- Units: `k gp` (thousands of gold pieces), and `gp` for the bare amounts.
- KaTeX: nothing beyond symbols; note `\%` appears **outside** math and needs no escaping in HTML text.
- Typos: none. Probabilities are internally consistent (0.33+0.66+0.01 = 1; 0.33+0.67 = 1; 0.34+0.66 = 1) — verified by hand.

### Frame 11 — Why $A\succ B$ and $C\succ D$ is inconsistent

```latex
\begin{align*}
A\succ B &\iff u(2400) > 0.33\,u(2500)+0.66\,u(2400)\\
         &\iff 0.34\,u(2400) > 0.33\,u(2500),\\[4pt]
C\succ D &\iff 0.33\,u(2500) > 0.34\,u(2400).
\end{align*}
```
```latex
0.34\,u(2400)>0.33\,u(2500)>0.34\,u(2400)\qquad \bot
```
Inline math also present: `$A\succ B$`, `$C\succ D$`, `$u(0)=0$`, `$C,D$`, `$A,B$`, `$A$`.

- Numbers:
  - `2400`, `2500` (plain, thousands of gp — no `\,` here, unlike frame 10)
  - probabilities `0.33`, `0.66`, `0.34`
  - `u(0)=0`
  - the block quote: ``` ``2\,400 w.p.\ 0.66'' ``` and ``` ``nothing w.p.\ 0.66'' ```
- KaTeX: `align*` is native in display mode; copy verbatim inside `$$…$$`. Do not rewrite to `aligned`. `\iff`, `\succ`, `\bot` and the optional row skip `\\[4pt]` are all supported.
- Typos: none. Note the arithmetic: A≻B ⇔ 0.34u(2400) > 0.33u(2500) follows from u(2400) > 0.33u(2500)+0.66u(2400) ✓.

### Frame 12 — The probability triangle (Marschak--Machina)

```latex
\begin{tikzpicture}[scale=3.9,>=Stealth]
  \draw[->] (0,0) -- (1.08,0) node[below] {\scriptsize $p_{0}$};
  \draw[->] (0,0) -- (0,1.08) node[left] {\scriptsize $p_{2500}$};
  \draw (1,0) -- (0,1);
  \node[below left] at (0,0) {\scriptsize 2400 sure};
  % EU indifference lines: parallel straight lines (illustrative slope)
  \begin{scope}
    \clip (0,0) -- (1,0) -- (0,1) -- cycle;
    \foreach \c in {-1.6,-1.2,-0.8,-0.4,0.0,0.4,0.8}{
      \draw[gray!70,dashed] (0,\c) -- (1,{\c+2.5});
    }
  \end{scope}
  \fill[blue] (0,0) circle (0.012) node[above right=-1pt] {\scriptsize $A$};
  \fill[blue] (0.01,0.33) circle (0.012) node[left] {\scriptsize $B$};
  \fill[red] (0.67,0.33) circle (0.012) node[right] {\scriptsize $C$};
  \fill[red] (0.66,0) circle (0.012) node[below] {\scriptsize $D$};
  \draw[blue,thick] (0,0) -- (0.01,0.33);
  \draw[red,thick] (0.66,0) -- (0.67,0.33);
\end{tikzpicture}
```
Inline math also present: `$\{0,2400,2500\}$`, `$AB \parallel DC$`, `$A\succ B \Leftrightarrow D\succ C$`, `$A$`, `$C$`, `$B$`, `$D$`.

- Numbers:
  - axis extent `1.08`
  - `scale=3.9`
  - dashed-line intercepts `-1.6`, `-1.2`, `-0.8`, `-0.4`, `0.0`, `0.4`, `0.8`; slope offset `2.5`
  - dot radius `0.012`; label offset `-1pt`
  - coordinates: `A`=(0,0), `B`=(0.01,0.33), `C`=(0.67,0.33), `D`=(0.66,0)
  - `2400 sure` at the origin; outcome set `\{0,2400,2500\}`
- KaTeX: **TikZ is not renderable by KaTeX at all** — this frame needs a hand-written inline SVG (or a `pdflatex` + `pdftocairo` export). The four points, two thick segments, dashed family and triangle are all reproducible in SVG from the coordinates above.
- Typos / quirks: `\node[above right=-1pt]` (negative dimension on a corner anchor) is legal but fragile; the dashed lines' slope is explicitly "illustrative" per the source comment. `\node[below left] at (0,0)` puts "2400 sure" outside the axis origin, so it collides with the y-axis caption depending on renderer.

### Frame 13 — Paradoxical pattern of choice

```latex
L_j=\{(x_i,p_{ij})\}_{i=1}^3,
\qquad
\sum_{i=1}^3p_{ij}=1.
```
```latex
\sum_{i=1}^3p_{i1}u(x_i)>
\sum_{i=1}^3p_{i2}u(x_i),
```
```latex
\sum_{i=1}^3p_{i4}u(x_i)>
\sum_{i=1}^3p_{i3}u(x_i).
```
Inline math also present: `$L_1,L_2,L_3,L_4 \in \mathcal{L}$`, `$x_1,x_2,x_3 \in \chi$`.

- Numbers: outcome count `3` (`i=1..3`); lottery indices `1`, `2`, `3`, `4` (and `j`); `\sum ... =1`.
- KaTeX: supported.
- Typos (flag, do not fix): `x_1,x_2,x_3 \in \chi` — `\chi` should almost certainly be `\mathcal{X}` (the outcome set defined on frame 3, and the unused macro `\X`). As written the slide renders a lower-case Greek chi, which reads as a different object. Also `\mathcal{L}` is introduced here for the lottery space and never defined; frames 3–12 use no set symbol for lotteries.

### Frame 14 — Independence and inconsistent preferences

```latex
L_1\succ L_2,\qquad L_4\succ L_3.
```
```latex
L_3=\alpha L_1+(1-\alpha)N,\qquad
L_4=\alpha L_2+(1-\alpha)N.
```
Inline math also present, all with `\(...\)`: `\( \alpha\in(0,1) \)`, `\(L_1\succ L_2\)`, `\(L_3\succ L_4\)`, `\(L_4\succ L_3\)`.

- Numbers: `0` and `1` in `\alpha\in(0,1)`; `1` in `(1-\alpha)` twice.
- KaTeX: supported. Reveal's KaTeX plugin does handle `\(...\)` by default, but this is the only frame using it — normalise to `$...$` and log it in `CONVERSION_NOTES.md`.
- Typos: the spaces inside `\( \alpha\in(0,1) \)` are inconsistent with the tight `\(L_1\succ L_2\)` right after; cosmetic only.

### Frame 15 — Generalized Allais paradox

```latex
\begin{aligned}
\mathcal{P}_A&=\delta_{x_M},&
\mathcal{P}_B&=p\delta_{x_H}+(1-p)\delta_{x_0},\\
\mathcal{P}_C&=q\delta_{x_M}+(1-q)\delta_{x_0},&
\mathcal{P}_D&=pq\delta_{x_H}+(1-pq)\delta_{x_0}.
\end{aligned}
```
```latex
\mathcal{P}_A\succ\mathcal{P}_B,
\qquad
\mathcal{P}_D\succ\mathcal{P}_C.
```
```latex
\begin{aligned}
u(x_M)&>p\,u(x_H),\\
pq\,u(x_H)&>q\,u(x_M)
\;\Longrightarrow\;
p\,u(x_H)>u(x_M).
\end{aligned}
```
```latex
\boxed{u(x_M)>p\,u(x_H)>u(x_M)}
\qquad\bot
```
Inline math also present: `$x_H>x_M>x_0$`, `$p,q\in(0,1)$`, `$u(x_0)=0$`, and the closing `$\text{Violation of independence} \;\Longrightarrow\; \text{no expected-utility representation.}$`.

- Numbers: `0` and `1` in `p,q\in(0,1)`; `1` in `(1-p)`, `(1-q)`, `(1-pq)`; `u(x_0)=0`.
- KaTeX: `aligned` ✓, `\boxed` ✓, `\bot` ✓, `\delta_{x_H}` ✓, `\text{}` ✓, `\;` ✓, `\succ` ✓. The double-`&` alignment (`&=&` pairs) puts four columns side by side — KaTeX renders `aligned` with only right/left pairs, so the second `&` sequence may not produce the two-column layout beamer gives. Verify visually.
- Typos: the final `\begin{alertblock}{}` has an **empty title** (renders as a bare blue bar). `\boxed` is the only use in the deck. `\mathcal{P}` vs the earlier `$P_A$`/`$P_B$` naming on frame 16 is an inconsistency that starts just past this range.

---

## Frame count and verification

- **Frames found in lines 1–433: 15.** Counted `\begin{frame}` in that range with `grep -c` → 15, and matched each to its source lines:
  - 1: 67–69 · 2: 72–74 · 3: 78–103 · 4: 105–120 · 5: 122–161 · 6: 163–193 · 7: 195–207 · 8: 211–227 · 9: 229–264 · 10: 268–287 · 11: 289–303 · 12: 305–340 · 13: 342–370 · 14: 372–392 · 15: 394–433
- Line range covered: **1–433** (preamble lines 1–63, `\begin{document}` on line 64, body 66–433). Line 434 is blank; frame 16 begins at line 435 and is excluded.
- **`\note{}` speaker notes: NO.** There is no `\note` anywhere in the whole `slides.tex` (checked the entire file, not just 1–433), so the deck currently has no speaker notes to carry over and reveal's `<aside class="notes">` blocks will all have to be authored fresh.
- Display-math count in the range: **20** display groups (19 `\[ … \]`, of which 3 wrap an `aligned` — frames 6 and 15 twice — plus 1 `align*` on frame 11). Inline math: **65** `$…$` segments plus **4** `\(…\)` segments (frame 14 only). Frames 7, 10 and 12 have only inline math (no display math).
- Fenced formula blocks written in this file: **24** (24 = frames 5 and 15 with four each, frame 13 with three, frames 6, 9, 11, 14 with two each, and frames 3, 4, 7, 8, 12 with one each; each display was kept in its own fence for line-by-line checking).

Checklist of what I verified by re-reading the source, line by line:

- [x] Frame count = 15, each `\begin{frame}` matched to a `\end{frame}` (no nested/unclosed frames in the range).
- [x] Titles transcribed character-for-character (including `St.\ `, `Marschak--Machina`, `(vote!)`, and the math in the title of frame 11).
- [x] Section assignment: frames 3–7 → "Expected utility: the benchmark"; 8–9 → "St. Petersburg paradox"; 10–15 → "Allais paradox"; 1–2 → no section.
- [x] Overlays: exactly two `\pause` commands in the whole range, both on frame 10 — one inside the `gameblock` (L276), one after it (L283). No `\only`, `\onslide`, `\uncover`, `\visible`, `\item<...>`, `\againframe` anywhere in 1–433.
- [x] All probabilities on frame 10 re-added by hand to confirm they sum to 1.
- [x] All four table cells on frame 9 re-read twice (10/4.97, 100/7.79, 1 000/10.95, 1 000 000/20.87) including the `\,` thin spaces.
- [x] Frame 12 coordinates, scale, foreach list and dot radius re-read twice.
- [x] `\boxed` (frame 15) is the only boxed formula in the range; `\bot` appears twice (frames 11 and 15).
- [x] Font switches: `\small` on 4, 6, 7, 8, 9, 11, 12, 14, 15; `\scriptsize` on 5 and 13; `\footnotesize` on 10 and on the frame-9 side note.
- [x] Custom macros `\X` unused; `gameblock` used on frames 4, 7, 8, 10.
- [x] No `\cite`, `\footnote`, `\label`, `\href`, `\framesubtitle`, or `\includegraphics` (other than the title logo) in the range.

---

## Handover to deck conversion (brief)

- **Frame 10 is the only overlayed frame**, with **two fragment steps**: Question 1 is visible from the start, `\pause` (L276) reveals Question 2 *inside* the green box, and `\pause` (L283, after `\end{gameblock}`) reveals the separate blue `block` "Typical answers" *outside* it. Build the green box once with two internal states and keep the "Typical answers" block as a sibling element after the green box, not a third state of it. Do not move the `82\% / 83\%` reveal earlier — it is the punchline.
- **Frame 12 cannot go through KaTeX.** TikZ must become a hand-authored inline `<svg>` (viewBox `0 0 1.08 1.08`, y flipped): triangle (0,0)-(1,0)-(0,1), points A(0,0), B(0.01,0.33), C(0.67,0.33), D(0.66,0), blue segment A–B, red segment D–C, and the 7 dashed grey parallels `(0,c) → (1, c+2.5)` for c ∈ {-1.6,-1.2,-0.8,-0.4,0,0.4,0.8} clipped to the triangle (all 7 intersect it). Keep the "2400 sure" / `p_0` / `p_{2500}` labels and distinguish blue from red by more than colour.
- **Frame 9's table is booktabs** (`\toprule/\midrule/\bottomrule` + `tabular`) — KaTeX will error on it. Render as an HTML table with three CSS rules, and keep the `4.97 / 7.79 / 10.95 / 20.87` values and the `{\footnotesize (numerical solution, see Appendix)}` caption verbatim.
- **Frames 9 and 12 use `columns`** (0.48/0.5 and 0.52/0.46) → CSS grid that stacks at ≤ 640 px; on phones the frame-12 figure should come first, then the four bullets. Frame 9's table needs its right column beside it on desktop only.
- **Font-size switches are load-bearing.** Frames 5 (`\scriptsize`) and 13 (`\scriptsize`) are dense; if the web deck uses a larger base size they will overflow. Map each beamer size to a per-frame CSS class instead of shrinking globally.
- **`\boxed` on frame 15** works in KaTeX, but the `aligned` block with the double `&` (P_A/P_B on the first row, P_C/P_D on the second) may not keep beamer's four-column layout — check it visually and fall back to two `aligned` pairs side by side in a grid if it collapses.
- **Frame 13 typo `\in \chi`**: transcribe as-is for now and raise it with the authors; the intended symbol is almost certainly `\mathcal{X}`.
- **Frame 2 has no auto-TOC in reveal.js**: hand-write all 8 numbered section entries (1 Expected utility: the benchmark · 2 St. Petersburg paradox · 3 Allais paradox · 4 Ellsberg paradox · 5 Framing and loss aversion · 6 Explaining the paradoxes · 7 Conclusion · 8 Appendix) and highlight the current section per slide. Frame 1 is a title slide with a logo (`resources/MIF.png`) and an injected supervisor line — decide once whether the supervisor line moves to the credits/QR slide.
