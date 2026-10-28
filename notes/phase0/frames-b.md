# Phase 0 inventory — frames 16 to end (group B)

Source: `Microeconomic_analysis__Copy_/slides.tex`, lines **435–715**.
Frame numbering: 1-based, counting `\begin{frame}` in document order (frame 14 starts at line 372, frame 15 at line 394). Range starts at frame **16** (`Common ratio effect`) and ends at frame **29** (`References`).
Preamble facts used here: `\usepackage{multirow}`, `booktabs`, `tikz`, `pgfplots` (`compat=1.17`), `\usetikzlibrary{arrows.meta}`; `gameblock` is a custom environment defined in the preamble as a green `block` (`gamegreen` = RGB 46,125,50); `VUMIF.sty` **redefines `blue` as RGB 2,72,127** (so `blue` in pgfplots is not standard blue) and `burgundy` as RGB 123,0,63.
Nothing in this file was edited in the sources. Numbers/formulas below are transcribed verbatim.

## Frame-by-frame inventory (frames 16–end)

| frame | title (exact) | section | content types | overlay steps | notes |
|---|---|---|---|---|---|
| 16 | `Common ratio effect: a Minecraft expedition` | Allais paradox | gameblock, itemize, block, math (inline) | none | `\small` at frame top and a second `\small` inside the gameblock; `\\[3pt]` paragraph break inside gameblock; `\qquad` between the P_C and P_D clauses; `\begin{block}{}` with empty title; typographic quotes ``` ``sure thing!'' ```; em dash `—` in block |
| 17 | `Ellsberg paradox: the Khajiit's sack of gems` | Ellsberg paradox | gameblock, table, block, math (inline `\succ`) | 1 step: `\pause` (line 473) → reveals the whole `block` "Typical choice" (2 overlay states total) | `\small`; `booktabs` table inside `\begin{center}`; explicit `\ ` spaces around "and" in the block; `?` used as an unknown-count header |
| 18 | `Why no beliefs can explain it` | Ellsberg paradox | math (align*), itemize, block | none | `\small`; `align*` with `&\iff` alignment; `\emph{every}` twice; block title contains `vs.\` (escaped period); `\\` line break inside block |
| 19 | `Framing: Whiterun under dragon attack` | Framing and loss aversion | gameblock, itemize ×2, block | none | frame-level `\footnotesize`; `\small` at L501 is an **unscoped** declaration inside the gameblock body, so it governs both "Frame 1" and "Frame 2" headings (both render `\small`; the second heading silently relies on it — latent fragility only, not a visible defect); `\hfill [72\%]` right-aligned brackets ×4; `\&` in block title; `$\equiv$` |
| 20 | `Loss aversion and small bets: hardcore mode` | Framing and loss aversion | gameblock, itemize, block, math (inline) | none | `\small`; thin spaces `1\,000`, `1\,050`, `20\,000`; en dashes `50--50`; `\emph{every}`, `\emph{any}`; block contains `\\` and ends with a second sentence |
| 21 | `Prospect theory (Kahneman \& Tversky)` | Explaining the paradoxes | math (cases + fraction), columns, tikz/pgfplots ×2 | none | `\footnotesize`; `\vspace{-6pt}`; display math wrapped in `{\scriptsize \[ … \]}`; `\vspace{-4pt}`; `{\footnotesize …}` parameter sentence; `\begin{columns}[T]` with two `0.5\textwidth` columns, each `\centering`; two pgfplots axes 5.0cm × 3.7cm; captions `{\scriptsize …}` |
| 22 | `Prospect theory reproduces the paradoxes` | Explaining the paradoxes | table, multirow, itemize, math (inline) | none | `\small`; `\vspace{-4pt}`; `\begin{center}` + `\footnotesize` around table; `tabular{llrl}`; **4 × `\multirow{2}{*}{…}`** in the Prediction column; **4 × `\checkmark`**; itemize repeats `\small`; inline `$w(1)=1$`, `$w(.66)+w(.33)=0.84$` |
| 23 | `Map of paradoxes and fixes` | Explaining the paradoxes | table, math (inline `\lambda>1`) | none | `\small`; `\begin{center}` + `\footnotesize`; 3 fixed-width `p{…}` columns with `>{\raggedright\arraybackslash}` (2.2cm / 2.7cm / 4.8cm); `\\[3pt]` after each of the first four body rows; `St.\ Petersburg`, `vs.\`, `\&` |
| 24 | `Ambiguity aversion fixes the gem sack` | Explaining the paradoxes | math (inline `\tfrac`), itemize, table, block | none | `\small`; `\textbf{Maxmin expected utility}`; `\emph{set}`, `\emph{worst}`; explicit `\ ` spacing in item 1; `\tfrac13`, `\tfrac23`; `tabular{lcccc}` inside `\begin{center}`; block "Result" |
| 25 | `Conclusion` | Conclusion | itemize, gameblock | none | `\small` on frame **and** on itemize; six bullets with `\textbf`; closing green `gameblock` "In game terms" with plain text only |
| 26 | *(no title)* `\begin{frame}[plain]` | Conclusion | plain-frame | none | `[plain]` (no headline/footline/navigation); `\centering`; `{\Huge Thank you for your attention!}`; nothing else |
| 27 | `Appendix: St.\ Petersburg computation` | Appendix | itemize, math (display, 2×) | none | `\small`; `\ln\!\big( … \big)`; `\mathbb{E}`; `\min(2^k,B)`; `2^{30}\approx10^9`; `K=200` stated as truncation |
| 28 | `Appendix: prospect theory computations` | Appendix | math (display + align*), table | none | `\footnotesize`; `\begin{center}` + `\small`; **`\setlength{\tabcolsep}{3pt}` on the same source line as `\begin{tabular}{lcccccccc}`** (9 columns); `align*` with two lines; closing `{\footnotesize Note: …}` paragraph |
| 29 | `References` | References (`\section*`) | allowframebreaks, bibliography list | none (but `allowframebreaks` produces several web slides) | `[allowframebreaks]`; `\nocite{*}` + `\printbibliography`; numeric biblatex style, `sorting=ynt`; 12 entries → beamer titles them "References I", "References II", … |

## Formula and number register

### Frame 16 — Common ratio effect: a Minecraft expedition

```latex
$P_A$: villager trade, \textbf{30 diamonds for sure}.\\
$P_B$: deep cave, \textbf{40 diamonds} w.p.\ 0.8 (a creeper w.p.\ 0.2).\\[3pt]
Same plans, but you first need to find a stronghold (w.p.\ $q=0.25$):\\
$P_C$: 30 w.p.\ 0.25 \qquad $P_D$: 40 w.p.\ $0.25\times0.8=0.20$.
```
```latex
  \item $x_H=40$, $x_M=30$, $x_0=0$, $p=0.8$, $q=0.25$.
  \item Typical: $P_A\succ P_B$ (``sure thing!'') but $P_D\succ P_C$ (``20\% vs 25\%, go for 40'').
```

- 30 diamonds (P_A, "for sure", bold)
- 40 diamonds (P_B, bold)
- 0.8 — probability of 40 diamonds in P_B
- 0.2 — "a creeper w.p. 0.2"
- q = 0.25 — probability of finding a stronghold
- 0.25 — chance of 30 in P_C
- 0.25 × 0.8 = 0.20 — chance of 40 in P_D
- 40 — x_H
- 30 — x_M
- 0 — x_0
- p = 0.8 (restated in item 1)
- q = 0.25 (restated in item 1)
- 20% and 25% — in the quoted reaction ("20\% vs 25\%")
- 40 — "go for 40"

KaTeX notes: nothing unsupported; `\qquad` and `\times` are fine. `w.p.\ 0.8` is text-mode (`\ ` + trailing period), not math. No typo found (styling inconsistency only: `$P_C$: 30 w.p.\ 0.25` leaves the number in text mode while P_D's is in math — visual output identical; do not fix).

### Frame 17 — Ellsberg paradox: the Khajiit's sack of gems

```latex
30 \textbf{rubies}; 60 \textbf{emeralds} or \textbf{sapphires} in an \emph{unknown} mix. Draw one blindly; win 100 gold if your bet is right.
```
```latex
I $\succ$ II (``I know it is 1/3'') \ and \ IV $\succ$ III (``I know it is 2/3'').
```

- 90 — gems in the sack (gameblock title)
- 30 — rubies
- 60 — emeralds or sapphires
- 100 — gold prize for a correct bet
- 30 — in header "Ruby (30)"
- `?` — in headers "Emerald (?)" and "Sapphire (?)" (unknown mix)
- Table body: 100, 0, 0 (I); 0, 100, 0 (II); 100, 0, 100 (III); 0, 100, 100 (IV)
- 1/3 — "I know it is 1/3"
- 2/3 — "I know it is 2/3"

KaTeX notes: only `$\succ$` in math; safe. `\ ` and typographic quotes are text. No typo found.

### Frame 18 — Why no beliefs can explain it

```latex
Let $\pi_R=\tfrac13$, $\pi_E$, $\pi_S$ be the player's subjective probabilities, $\pi_E+\pi_S=\tfrac23$.
\begin{align*}
\text{I}\succ\text{II} &\iff \pi_R\,u(100) > \pi_E\,u(100) \iff \pi_R>\pi_E,\\
\text{IV}\succ\text{III} &\iff (\pi_E+\pi_S)\,u(100) > (\pi_R+\pi_S)\,u(100) \iff \pi_E>\pi_R .
\end{align*}
```
```latex
  \item Contradiction for \emph{every} belief and \emph{every} $u$.
  \item ``Sapphire'' is a common consequence $\Rightarrow$ Savage's \textbf{sure-thing principle} fails.
```

- 1/3 — π_R
- 2/3 — π_E + π_S
- 100 — inside `u(100)`, four occurrences (two per line)

KaTeX notes: `align*`, `\iff`, `\text{}`, `\tfrac`, `\,` all supported. The step `\pi_R u(100) > \pi_E u(100) \iff \pi_R > \pi_E` silently assumes `u(100) > 0` — flag for the game's algebra panel (not a source error, do not "fix" in the deck).

### Frame 19 — Framing: Whiterun under dragon attack

```latex
\small\textbf{Frame 1 (lives saved):}
  \item Plan A: 200 people will be saved. \hfill [72\%]
  \item Plan B: 1/3 chance 600 saved, 2/3 chance nobody saved. \hfill [28\%]
\textbf{Frame 2 (deaths):}
  \item Plan C: 400 people will die. \hfill [22\%]
  \item Plan D: 1/3 chance nobody dies, 2/3 chance 600 die. \hfill [78\%]
```

- 600 — citizens the dragon will kill (gameblock title and text)
- 200 — people saved by Plan A
- 1/3 — chance 600 are saved (Plan B)
- 2/3 — chance nobody is saved (Plan B)
- 72% — Plan A choice share (in `\hfill [72\%]`)
- 28% — Plan B choice share
- 400 — people who die under Plan C
- 1/3 — chance nobody dies (Plan D)
- 2/3 — chance 600 die (Plan D)
- 22% — Plan C choice share
- 78% — Plan D choice share
- 1981 — Tversky & Kahneman citation year in the block title
- 5 — "Lecture 5" in the block title

KaTeX notes: only `$\equiv$`; safe. Percentages are **text mode with escaped `%`** inside square brackets, not math — keep as text so the brackets stay right-aligned via flex/`margin-left:auto`. Note: `\small` at L501 is unscoped inside the `gameblock` group, so **both** headings ("Frame 1" and "Frame 2") are `\small` — no size inconsistency; only the latent dependency of the second heading on the first declaration (do not fix).

### Frame 20 — Loss aversion and small bets: hardcore mode

```latex
Lose 1\,000 emeralds or win 1\,050 emeralds. Do you accept?
```
```latex
  \item Most say \textbf{no}, although the expected value is $+25$.
  \item \textbf{Rabin (2000):} rejecting it at \emph{every} wealth level forces EU to reject a 50--50 bet: lose 20\,000 or win \emph{any} amount. Absurd.
```
```latex
With $\lambda\approx2.25$: $0.5\cdot1050-0.5\cdot2.25\cdot1000=-600<0$ $\Rightarrow$ reject.\\
```

- 50–50 — coin bet (gameblock title and bullet 2), en dash
- 1 000 — emeralds lost (`1\,000`)
- 1 050 — emeralds won (`1\,050`)
- +25 — expected value (`$+25$`)
- 2000 — Rabin citation year
- 20 000 — Rabin's large loss (`20\,000`)
- 2.25 — λ (`\lambda\approx2.25`)
- 0.5 — twice in the block formula
- 1050, 2.25, 1000 — factors inside `0.5\cdot1050-0.5\cdot2.25\cdot1000`
- −600 — result (`-600<0`)
- 0 — the `<0` bound
- "any amount" — *no number*, keep as text

KaTeX notes: `\approx`, `\cdot`, `\Rightarrow` supported. Numbers inside prose carry thin spaces (`\,`) — preserve them (do not let HTML collapse to "1 000" vs "1000"; keep the nbsp/thin space).

### Frame 21 — Prospect theory (Kahneman \& Tversky)

```latex
{\scriptsize
\[
V(L)=\sum_i w(p_i)\,v(x_i),\quad
v(x)=\begin{cases}x^{\alpha}, & x\ge0\\ -\lambda(-x)^{\beta}, & x<0\end{cases},\quad
w(p)=\frac{p^{\gamma}}{\big(p^{\gamma}+(1-p)^{\gamma}\big)^{1/\gamma}}
\]}
```
```latex
{\footnotesize $x$ = gain/loss vs.\ a \textbf{reference point}; $\alpha=\beta=0.88$, $\lambda=2.25$, $\gamma=0.61$.}
```
```latex
\begin{axis}[width=5.0cm,height=3.7cm,axis lines=middle,xmin=-100,xmax=100,ymin=-140,ymax=70,
  xtick=\empty,ytick=\empty,xlabel={\scriptsize $x$},ylabel={\scriptsize $v(x)$},
  title={\scriptsize Value function},every axis title/.style={at={(0.5,1.02)},anchor=south}]
\addplot[domain=0:100,samples=60,thick,blue] {x^0.88};
\addplot[domain=-100:0,samples=60,thick,red] {-2.25*(-x)^0.88};
```
```latex
\begin{axis}[width=5.0cm,height=3.7cm,xmin=0,xmax=1,ymin=0,ymax=1,
  xlabel={\scriptsize $p$},ylabel={\scriptsize $w(p)$},tick label style={font=\tiny},
  title={\scriptsize Probability weighting},every axis title/.style={at={(0.5,1.02)},anchor=south}]
\addplot[domain=0:1,gray,dashed] {x};
\addplot[domain=0.0005:0.9995,samples=120,thick,blue] {x^0.61/((x^0.61+(1-x)^0.61)^(1/0.61))};
```

- 0.88 — α and β (`\alpha=\beta=0.88`), also the plot exponent
- 2.25 — λ, also the loss-curve coefficient in the plot
- 0.61 — γ, also the weighting exponent
- 5.0cm × 3.7cm — both axis sizes
- −100, 100 — xmin/xmax of the value-function plot
- −140, 70 — ymin/ymax of the value-function plot
- 0:100 and −100:0 — plot domains, 60 samples each
- 0, 1 — xmin/xmax and ymin/ymax of the weighting plot
- 0:1 — identity-line domain
- 0.0005, 0.9995 — clipped domain of the w(p) curve
- 120 — samples for w(p)
- 0.5, 1.02 — axis-title anchor coordinates
- 0.5 — `0.5\textwidth` per column (twice)

KaTeX notes: `\begin{cases}` (with `&` alignment and `\\`), `\big(`, `\big)`, `^{1/\gamma}` all render in KaTeX. Not KaTeX: the `{\scriptsize \[ … \]}` wrapper (font-size switch) — reproduce with a CSS class on the math container. Not KaTeX at all: the two `tikzpicture`/`axis` blocks (see Figures register). No typo found; note the model uses α for gains and β for losses even though α = β. Attribution (corrected): `w(p)=p^{\gamma}/\big(p^{\gamma}+(1-p)^{\gamma}\big)^{1/\gamma}` is the **one-parameter Tversky–Kahneman (1992)** weighting function — *not* Prelec's `\exp\!\big(-(-\ln p)^{\alpha}\big)`.

### Frame 22 — Prospect theory reproduces the paradoxes

```latex
  \item \textbf{Certainty effect:} $w(1)=1$ but $w(.66)+w(.33)=0.84$.
  \item \textbf{Framing:} ``saved'' = gains $\Rightarrow$ safe plan; ``die'' = losses $\Rightarrow$ gamble.
```
```latex
\toprule
Example & Option & $V$ & Prediction\\
\midrule
Allais (OSRS drop) & $A$: 2400 sure & 943.2 & \multirow{2}{*}{$A\succ B$ \checkmark}\\
 & $B$: (2500,.33; 2400,.66) & 806.5 & \\
 & $C$: (2500,.33) & 326.7 & \multirow{2}{*}{$C\succ D$ \checkmark}\\
 & $D$: (2400,.34) & 320.1 & \\
\midrule
Common ratio (diamonds) & $P_A$: 30 sure & 19.9 & \multirow{2}{*}{$P_A\succ P_B$ \checkmark}\\
 & $P_B$: (40,.8) & 15.6 & \\
 & $P_C$: (30,.25) & 5.8 & \multirow{2}{*}{$P_D\succ P_C$ \checkmark}\\
 & $P_D$: (40,.20) & 6.7 & \\
\bottomrule
```

- 2400 — A's sure payoff
- 943.2 — V(A)
- 2500, .33, 2400, .66 — lottery B
- 806.5 — V(B)
- 2500, .33 — lottery C
- 326.7 — V(C)
- 2400, .34 — lottery D
- 320.1 — V(D)
- 30 — P_A sure amount
- 19.9 — V(P_A)
- 40, .8 — P_B lottery
- 15.6 — V(P_B)
- 30, .25 — P_C lottery
- 5.8 — V(P_C)
- 40, .20 — P_D lottery
- 6.7 — V(P_D)
- 1 — `w(1)=1`
- .66, .33 — in `w(.66)+w(.33)`
- 0.84 — the sum, written rounded
- 4 — `\checkmark` marks (not a numeric value, listed for the count)

KaTeX notes: `\checkmark` is supported in current KaTeX (0.16.x) — **verify against the vendored build**; fallback is a text `✓`. `\multirow` is a table construct, not math. Lottery triples like `(2500,.33; 2400,.66)` are plain text with no leading zeros — reproduce exactly (no `0.33`). No typo found.

### Frame 23 — Map of paradoxes and fixes

```latex
St.\ Petersburg & Expected value & Concave, bounded utility (Bernoulli)\\[3pt]
Allais / common ratio & Independence axiom & Probability weighting: prospect theory, rank-dependent utility (Quiggin, 1982)\\[3pt]
Ellsberg & Sure-thing principle, a single prior & Ambiguity aversion: maxmin EU over a set of priors (Gilboa \& Schmeidler, 1989)\\[3pt]
Framing & Invariance to description & Reference point, gains vs.\ losses (prospect theory)\\[3pt]
Small-bet risk aversion & EU over total wealth & Loss aversion $\lambda>1$\\
```

- 1982 — Quiggin citation year
- 1989 — Gilboa & Schmeidler citation year
- 1 — in `$\lambda>1$`
- Column widths 2.2cm / 2.7cm / 4.8cm (layout, listed in Tables register)

KaTeX notes: only `\lambda>1`; safe. `St.\ Petersburg`, `vs.\ losses` use escaped periods — keep the space.

### Frame 24 — Ambiguity aversion fixes the gem sack

```latex
\textbf{Maxmin expected utility} (Gilboa \& Schmeidler, 1989): the player considers a \emph{set} of possible beliefs and judges each bet by the \emph{worst} one.
  \item Possible beliefs: $\pi_R=\tfrac13$, \ $\pi_E\in[0,\tfrac23]$, \ $\pi_S=\tfrac23-\pi_E$.
  \item Worst-case winning chance of each bet:
```
```latex
Bet & I & II & III & IV\\
\midrule
Worst-case chance & $\tfrac13$ & $0$ & $\tfrac13$ & $\tfrac23$\\
```

- 1989 — citation year
- π_R = 1/3
- π_E ∈ [0, 2/3]
- π_S = 2/3 − π_E
- Table: 1/3 (I), 0 (II), 1/3 (III), 2/3 (IV)

KaTeX notes: `\tfrac`, `\in`, `[0,\tfrac23]` supported. The `\ ` after each comma in the item is text spacing — keep it (prevents "1/3,π_E" crowding). No typo found.

### Frame 25 — Conclusion

No math and no numbers on this frame (six qualitative bullets + green `gameblock` "In game terms").

### Frame 26 — (plain "Thank you" frame)

No math, no numbers, no title, no notes.

### Frame 27 — Appendix: St. Petersburg computation

```latex
  \item Payoff $2^k$ w.p.\ $2^{-k}$, $k=1,2,\dots$; utility $u(x)=\ln x$; wealth $w$.
  \item Willingness to pay $p$ is the root of
  \[
  f(p)=\sum_{k=1}^{K}2^{-k}\ln\!\big(w+2^k-p\big)-\ln w=0,
  \]
  truncated at $K=200$ (the tail is negligible), solved with Brent's method.
  \item Finite bankroll $B=2^{n}$: payoff $\min(2^k,B)$, so
  \[
  \mathbb{E}=\sum_{k=1}^{n}1+\sum_{k>n}2^{-k}2^{n}=n+1 .
  \]
  With $B=2^{20}$: $\mathbb{E}=21$; with $B=2^{30}\approx10^9$: $\mathbb{E}=31$.
```

- 2^k — payoff (k ≥ 1)
- 2^−k — probability of that payoff
- k = 1, 2, … — index start
- p — willingness to pay (variable; also the summation upper bound symbol K)
- K = 200 — truncation point
- 0 — right-hand side of f(p) = 0
- B = 2^n — finite bankroll
- min(2^k, B) — capped payoff
- n + 1 — expected value with bankroll 2^n
- B = 2^20 → E = 21
- B = 2^30 ≈ 10^9 → E = 31
- 9 — exponent in `10^9`

KaTeX notes: `\ln\!\big(`, `\big)`, `\mathbb{E}`, `\min`, `\dots`, `\approx` all supported. Flag (not a typo, unusual notation): `\sum_{k=1}^{n}1+\sum_{k>n}2^{-k}2^{n}` writes the constant-1 sum and leaves the tail unevaluated before `=n+1`; mathematically correct (the tail equals 1). Do not "simplify" it.

### Frame 28 — Appendix: prospect theory computations

```latex
\[
v(x)=x^{0.88},\qquad w(p)=\frac{p^{0.61}}{\big(p^{0.61}+(1-p)^{0.61}\big)^{1/0.61}}
\]
```
```latex
\setlength{\tabcolsep}{3pt}\begin{tabular}{lcccccccc}
\toprule
$p$ & 0.01 & 0.20 & 0.25 & 0.33 & 0.34 & 0.66 & 0.80 & 0.99\\
$w(p)$ & 0.055 & 0.261 & 0.291 & 0.334 & 0.339 & 0.509 & 0.607 & 0.912\\
\bottomrule
\end{tabular}
```
```latex
\begin{align*}
V(B)&=w(.33)\,v(2500)+w(.66)\,v(2400)=806.5 < v(2400)=943.2=V(A),\\
V(C)&=w(.33)\,v(2500)=326.7 > w(.34)\,v(2400)=320.1=V(D).
\end{align*}
```

- 0.88 — exponent of v(x)
- 0.61 — exponent of p and of (1−p), and `1/0.61` in the denominator
- p row: 0.01, 0.20, 0.25, 0.33, 0.34, 0.66, 0.80, 0.99
- w(p) row: 0.055, 0.261, 0.291, 0.334, 0.339, 0.509, 0.607, 0.912
- .33, 2500, .66, 2400 — V(B) terms
- 806.5 — V(B)
- 2400, 943.2 — v(2400) and V(A)
- .33, 2500 — V(C) term
- 326.7 — V(C)
- .34, 2400 — V(D) term
- 320.1 — V(D)
- 3pt — `\tabcolsep`
- 9 — number of columns in `lcccccccc`

KaTeX notes: all display math renders; `\setlength{\tabcolsep}{3pt}` must become CSS (`border-spacing`/padding). No typo found; note `.33`/`.34`/`.66` without leading zeros are intentional and match frame 22.

### Frame 29 — References

No math. Numbers appear only inside the bibliography (12 entries, years 1953, 1954, 1961, 1979, 1981, 1982, 1987, 1989, 1992, 1995, 2000, 2026; volume/number/page ranges). Derived order under `sorting=ynt`: allais1953, bernoulli1954, ellsberg1961, kahneman1979, tversky1981, quiggin1982, machina1987, gilboa1989, tversky1992, mascolell1995, rabin2000, celov2026 → labels [1]–[12]. **Derived, not compiled** — confirm on a real build.

## Tables register

### T1 — Frame 17, Ellsberg bets
`\begin{tabular}{lccc}` inside `\begin{center}`; `booktabs` rules: `\toprule`, `\midrule` (after header), `\midrule` (after row II), `\bottomrule`. No multirow/multicolumn.

```latex
\toprule
Bet & Ruby (30) & Emerald (?) & Sapphire (?)\\
\midrule
I & 100 & 0 & 0\\
II & 0 & 100 & 0\\
\midrule
III & 100 & 0 & 100\\
IV & 0 & 100 & 100\\
\bottomrule
```

| Bet | Ruby (30) | Emerald (?) | Sapphire (?) |
|---|---|---|---|
| I | 100 | 0 | 0 |
| II | 0 | 100 | 0 |
| III | 100 | 0 | 100 |
| IV | 0 | 100 | 100 |

Note the second `\midrule` visually splits "bets on one colour" (I, II) from "bets on two colours" (III, IV); reproduce it as a heavier border between rows II and III. Column 1 is left-aligned, columns 2–4 centred. No header row emphasis in source (booktabs only).

### T2 — Frame 22, prospect-theory predictions
`\begin{tabular}{llrl}` (Example left, Option left, V right-aligned, Prediction left), `\footnotesize`, inside `\begin{center}`.

| Example | Option | V | Prediction |
|---|---|---|---|
| Allais (OSRS drop) | A: 2400 sure | 943.2 | A ≻ B ✓ *(rowspan 2)* |
| *(empty)* | B: (2500,.33; 2400,.66) | 806.5 | *(covered by rowspan)* |
| *(empty)* | C: (2500,.33) | 326.7 | C ≻ D ✓ *(rowspan 2)* |
| *(empty)* | D: (2400,.34) | 320.1 | *(covered by rowspan)* |
| Common ratio (diamonds) | P_A: 30 sure | 19.9 | P_A ≻ P_B ✓ *(rowspan 2)* |
| *(empty)* | P_B: (40,.8) | 15.6 | *(covered by rowspan)* |
| *(empty)* | P_C: (30,.25) | 5.8 | P_D ≻ P_C ✓ *(rowspan 2)* |
| *(empty)* | P_D: (40,.20) | 6.7 | *(covered by rowspan)* |

Rowspan/colspan conversion:
- Prediction column: four `\multirow{2}{*}{…}` → `rowspan="2"` on rows 1, 3, 5, 7.
- Example column: blank on rows 2, 4, 6, 8 in the source (no `\multirow` there). Visually beamer leaves them blank, so either keep blanks or add `rowspan="4"` on rows 1 and 5 — **the source leaves them blank**, so blank cells are the faithful rendering; if using rowspan, note the deviation. Recommend: keep blank cells (exact) and rely on the `\midrule` before "Common ratio" as the group divider.
- No `\multicolumn` anywhere.
- `\checkmark` follows each `\succ` inside the multirow cell; the ✓ must be in the same cell, vertically centred.

### T3 — Frame 23, map of paradoxes
`\begin{tabular}{>{\raggedright\arraybackslash}p{2.2cm}>{\raggedright\arraybackslash}p{2.7cm}>{\raggedright\arraybackslash}p{4.8cm}}`, `\footnotesize`, `\begin{center}`, `booktabs`, `\\[3pt]` after rows 1–4.

| Paradox | What fails | Possible explanation |
|---|---|---|
| St. Petersburg | Expected value | Concave, bounded utility (Bernoulli) |
| Allais / common ratio | Independence axiom | Probability weighting: prospect theory, rank-dependent utility (Quiggin, 1982) |
| Ellsberg | Sure-thing principle, a single prior | Ambiguity aversion: maxmin EU over a set of priors (Gilboa & Schmeidler, 1989) |
| Framing | Invariance to description | Reference point, gains vs. losses (prospect theory) |
| Small-bet risk aversion | EU over total wealth | Loss aversion λ > 1 |

Every cell is left-aligned and ragged-right with fixed widths 2.2 / 2.7 / 4.8 cm (total 9.7cm + padding, fits 4:3 text width). Row 5 has no `\\[3pt]`, only `\\`. No multirow/multicolumn. `St.\ Petersburg` must render as "St. Petersburg" with the escaped period.

### T4 — Frame 24, worst-case chances
`\begin{tabular}{lcccc}`, inside `\begin{center}`, `booktabs`.

| Bet | I | II | III | IV |
|---|---|---|---|---|
| Worst-case chance | 1/3 | 0 | 1/3 | 2/3 |

Cells I–IV are `$\tfrac13$`, `$0$`, `$\tfrac13$`, `$\tfrac23$` — i.e. a one-row body; the "Bet" column holds the row label. No multirow/multicolumn.

### T5 — Frame 28, weighting-function values
`\setlength{\tabcolsep}{3pt}` then `\begin{tabular}{lcccccccc}` (9 columns), `\small`, inside `\begin{center}`, `booktabs`.

| p | 0.01 | 0.20 | 0.25 | 0.33 | 0.34 | 0.66 | 0.80 | 0.99 |
|---|---|---|---|---|---|---|---|---|
| w(p) | 0.055 | 0.261 | 0.291 | 0.334 | 0.339 | 0.509 | 0.607 | 0.912 |

Header cells are `$p$` and `$w(p)$` (math); the eight data columns are plain decimal text. `\tabcolsep=3pt` (tight) — needed to fit 9 columns at 12pt; in HTML use small cell padding (≈3pt ≈ 4px) and `white-space: nowrap`. No multirow/multicolumn.

## Figures register

No `\includegraphics` in lines 435–715 (the only one in the document is `resources/MIF.png` on the title slide, outside this range). Two `tikzpicture`s, both on frame 21, both pgfplots with `compat=1.17`, inside `\begin{columns}[T]`, one per `0.5\textwidth` column, each column `\centering`, caption text below each plot in `\scriptsize`.

### F1 — Frame 21 left: "Value function" (`v(x)`)
- Canvas: `width=5.0cm, height=3.7cm` (aspect ≈ 1.35:1); explicit `axis lines=middle`: axes cross at the origin (x-axis at y=0, y-axis at x=0) instead of a box frame; **no tick marks** (`xtick=\empty, ytick=\empty`).
- Ranges: x ∈ [−100, 100]; y ∈ [−140, 70].
- Axis labels: `x` at the right-hand end of the x-axis and `v(x)` at the top end of the y-axis, both `\scriptsize`.
- Title: "Value function", `\scriptsize`, positioned at `(0.5, 1.02)` of the axis box, anchor south (i.e. just above the plot, centred).
- Plot 1: y = x^0.88 on x ∈ [0, 100], 60 samples, `thick`, colour `blue` = **RGB(2,72,127)** because VUMIF redefines `blue`. Starts at (0,0), concave, ends at (100, 57.5).
- Plot 2: y = −2.25·(−x)^0.88 on x ∈ [−100, 0], 60 samples, `thick`, colour `red` (default RGB(255,0,0)). Starts at (0,0), steep convex decline, ends at (−100, −129.5) — inside ymin=−140 with ~10 units of headroom.
- Kink at the origin (no smoothing across 0; two separate `\addplot`s).
- Caption under the plot: `{\scriptsize concave for gains, convex and steeper for losses}` — plain `\scriptsize` text, no italic, no bold.
- Redraw: two polylines from a sampled function; origin-crossing axes with arrowheads optional (pgfplots `axis lines=middle` has no arrow tips by default — do **not** add arrowheads).

### F2 — Frame 21 right: "Probability weighting" (`w(p)`)
- Canvas: `width=5.0cm, height=3.7cm`; **default boxed axes** (no `axis lines=middle`), so a full rectangle frame with the y-axis on the left and x-axis at the bottom.
- Ranges: x ∈ [0, 1]; y ∈ [0, 1]; default ticks at 0.2 intervals with `tick label style={font=\tiny}`.
- Axis labels: `p` and `w(p)`, `\scriptsize`.
- Title: "Probability weighting", `\scriptsize`, at `(0.5, 1.02)`, anchor south.
- Plot 1: identity y = x on [0, 1], `gray`, `dashed`, default sample count (thin, 1 line width).
- Plot 2: y = x^0.61 / ((x^0.61 + (1−x)^0.61)^(1/0.61)) on x ∈ [0.0005, 0.9995] (endpoints clipped to avoid 0/1 singularities), `samples=120`, `thick`, `blue` = RGB(2,72,127). Fixes (0,0) and (1,1); above the diagonal for small p (w(0.01) ≈ 0.055) and below for large p (w(0.99) ≈ 0.912), crossing the diagonal near p ≈ 0.35.
- Caption under the plot: `{\scriptsize small $p$ overweighted, large $p$ underweighted}`.
- Redraw: SVG path from a 120-point sample of the formula; keep the dashed grey 45° reference line; the inverse-S shape must stay inside the unit square.

Both plots are 5.0cm wide inside 0.5\textwidth columns of a 4:3 beamer text block — in reveal.js they become a 2-column grid (stacked under 700px) with the captions directly under each canvas.

## Frame count and verification

- **Total frames found in range: 14** — frames 16–29.
- Line ranges: 16 → 435–451; 17 → 455–477; 18 → 479–494; 19 → 498–515; 20 → 517–530; 21 → 534–573; 22 → 575–601; 23 → 603–619; 24 → 621–640; 25 → 644–658; 26 → 661–664; 27 → 668–683; 28 → 685–704; 29 → 710–713. File ends at 715 (`\end{document}`). Covered lines 435–715.
- Count check: `grep -n "begin{frame}"` between 435 and 715 returns 14 matches (435, 455, 479, 498, 517, 534, 575, 603, 621, 644, 661, 668, 685, 710); the document has 29 frames total, so 16–29 is exactly "to the end".
- **References frame uses `[allowframebreaks]` → yes**, so it will become **multiple web slides** (beamer auto-titles them "References I", "References II", …). With 12 numeric entries at 12pt on a 4:3 slide, expect **2 slides, possibly 3** — the exact break count needs a real compile; treat as an estimate. Conversion: one `<section>` per printed chunk, with the continued title, or a single scrollable references slide (decide in PLAN.md).
- **`\note{}` speaker notes: NO.** `grep -n "\\note"` over the whole `slides.tex` returns nothing. There are no speaker notes anywhere in the deck; none to carry over for frames 16–29.
- Overlay inventory in range: exactly **one** `\pause`, at line 473 (frame 17). No `\only`, `\onslide`, `\uncover`, or `\item<…>` in this range (the only other `\pause`s in the document are lines 276 and 283, both on frame 10, outside scope).
- Checklist of what was verified:
  - [x] 14 frames counted, titles copied character-for-character (including `\&`, `St.\`, `Khajiit's`).
  - [x] Section boundaries checked: 76, 266, 453, 496, 532, 642, 666, 708 (frame 16 falls under `\section{Allais paradox}` at L266, whose next section is L453).
  - [x] All 5 tables (T1–T5) transcribed cell by cell, including the 4 `\multirow{2}{*}` groups and all `\checkmark`s.
  - [x] All **8 distinct** V values (943.2, 806.5, 326.7, 320.1, 19.9, 15.6, 5.8, 6.7; the V(A)/V(C) repeats appear on frame 28) and the 8 `w(p)` values checked against the source.
  - [x] Percentage set 72 / 28 / 22 / 78 verified as text-mode `[72\%]`-style brackets.
  - [x] Out-of-range numbers explicitly excluded (not missed): 20.87 is line 247 (frame 9 table) and 82% / 83% is line 285 (frame 10); both lie before line 435.
  - [x] λ = 2.25, γ = 0.61, α = β = 0.88, 21 / 31 / 2^20 / 2^30, K = 200 verified.
  - [x] Both pgfplots axes read option by option (ranges, domains, samples, colours, title anchors).
  - [x] `\note{}` absence and `\pause` count confirmed by grep.
  - [x] No `\includegraphics` in range.
  - [ ] Not verified by compilation: exact number of `allowframebreaks` pages, and the derived bibliography order/labels [1]–[12].

## Handover to deck conversion (brief)

- **Frame 21 is the hardest.** Three formulas in one display line (value function with `cases`, and the one-parameter Tversky–Kahneman (1992) weighting function `w(p)=p^{\gamma}/(p^{\gamma}+(1-p)^{\gamma})^{1/\gamma}` — **not** Prelec's exponential form) at `\scriptsize`, next to two live pgfplots. Build the math as one `$$…$$` block (KaTeX handles `cases`), and redraw both plots as SVG/Canvas from the formulas — do not try to rasterise the pgfplots. Remember `blue` is RGB(2,72,127) here, not standard blue.
- **Frame 22's table needs real `rowspan`.** Four `\multirow{2}{*}` cells each contain a relation plus `\checkmark`; the Example column is deliberately blank on continuation rows. Get the ✓ inside the same cell, vertically centred, or the table reads wrong.
- **Frames 19 and 20 are number-dense prose, not math.** The `[72\%]`/`[28\%]`/`[22\%]`/`[78\%]` brackets are right-aligned *text* (`\hfill`), so use flex + `margin-left:auto`; the thin spaces in `1\,000` / `20\,000` must survive. Also `10^9` and `2^{30}` in frame 27.
- **Frame 23 is a fixed-width 3-column `p{}` table** (2.2 / 2.7 / 4.8 cm, ragged right, 3pt row gaps). On a phone it must stack or scroll — do not let "Probability weighting: prospect theory, rank-dependent utility (Quiggin, 1982)" overflow.
- **Frame 17 has the only overlay in this range** — one `\pause` before the "Typical choice" block, giving exactly 2 fragment states. Do not add more.
- **Frame 26 is a `[plain]` untitled frame** ("Thank you") — no `<h2>`, no footer; keep it visually bare.
- **Frame 29 `allowframebreaks`** → most likely 2 web slides with continued titles "References I/II"; the source gives no manual break point, so the split must be chosen (or replaced with one scrollable list) and logged in `CONVERSION_NOTES.md`.
- **One flag, do not fix silently:** the `\sum_{k=1}^{n}1` notation in frame 27 (correct but unusual). Render it as-is and note it in `CONVERSION_NOTES.md`. (Frame 19's `\small` is unscoped but harmless — both headings render `\small`; no action.)
