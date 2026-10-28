# PLAN — "Paradoxes of Choices under Uncertainty" web deck + mini-games

**Status:** Phase 0 complete. Awaiting go-ahead for Phase 1.
**Sources read:** `Microeconomic_analysis__Copy_/slides.tex` (715 lines, 29 frames), `VUMIF.sty`, `references.bib` (12 entries), `resources/MIF.png` (244×244 RGBA).
**Working notes:** `notes/phase0/frames-a.md`, `frames-b.md`, `preamble.md`, `review.md`.
**Asset catalogue:** `ASSETS.md` (what art to supply, in what format).

---

## 0. Decisions taken in this plan (✓ = needs your confirmation, see §7)

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Aspect ratio | **16:9, 1280×720 reveal canvas** | Brief §4 demands 16:9; the `.tex` is 4:3 (128×96 mm). 16:9 adds horizontal room, so no frame gets tighter, but projection geometry will not be pixel-identical to the PDF. |
| D2 | UI language | **English** | Language of the slides. |
| D3 | Games | **4**: Allais, Ellsberg, St. Petersburg, Framing | Exactly the four paradoxes the deck develops with numbers. |
| D4 | First two games | **Allais** (Phase 2), then **Ellsberg** (first of Phase 3) | Both are contradiction games sharing one verdict engine; together they fill the Report Card's two headline rows. St. Petersburg needs a slider widget (different UI), so it goes third. |
| D5 | Art | **Original pixel art**, every sprite replaceable by file + one `config.js` entry | Brief §9/§13 forbid ripped assets; your art can be dropped in later without touching code. |
| D6 | Try-it slides | **4 new slides**, one before the slide that *states* each paradox (before frames 8, 10, 17, 19); the room chooses before the formal statement | Brief §7: let the room choose before it knows the answer. |
| D7 | Slide numbering | **Web count: 35**, footer "n / 35". Order: 29 original frames → 4 try-it (before 8, 10, 17, 19) → **QR slide appended after References as the true last slide**. References is estimated at 2 pages; if it paginates to 3, the count is 36 and the footer follows. | Beamer says n/29; we add slides, so the denominator must change. The QR last means it stays on screen through Q&A. |
| D8 | References | **Two pages, 6 + 6 entries**, author–year style; the page count is an estimate (2; `allowframebreaks` is uncompiled) | 12 entries at projector size do not fit one 16:9 slide; the PDF paginates it too. |
| D9 | Speaker notes | **Leave empty in Phase 1; ask the team later** | The `.tex` contains zero `\note{}`; inventing notes would be new content, not conversion. |
| D10 | Git | `git init` at project root, commit after each phase | Brief §1 requires a commit per phase; no repo exists yet. Nothing is pushed. |

---

## 1. Slide inventory (29 frames)

Content types: **M** math (display or inline), **I** itemize, **B** block, **A** alertblock, **G** gameblock (green), **T** table, **C** columns, **F** TikZ/figure, **TP** title page, **TOC** contents, **P** `[plain]` frame, **S** incremental fragment step, **BIB** bibliography list. **Every frame has zero speaker notes** (the `.tex` contains no `\note{}`).

| # | Title (exact) | Section | Contains | Conversion notes |
|---|---|---|---|---|
| 1 | *(title page — no title)* | — | TP, figure | Title, subtitle "Microeconomic analysis", 3 authors, supervisor line, logo 2 cm at bottom; empty date |
| 2 | Outline | — | TOC | 8 numbered sections (References is starred, excluded) |
| 3 | Choices under uncertainty | Expected utility | M, I, B | Lottery definition, `L⪰M`, block "Expected value is not enough" |
| 4 | Example: a lottery in Minecraft | Expected utility | M, I, G | Fortune III: 1/2/3/4 diamonds at 2/5,1/5,1/5,1/5; EV 2.2; sure 2 offered |
| 5 | Expected utility | Expected utility | M, I, A | `EU(L)=Σp_i u(x_i)`; VNM axioms; independence `0<α<1`; whole frame `\scriptsize` |
| 6 | Independence axiom | Expected utility | M, B | Derivation `EU(αL+(1−α)N)−EU(αM+(1−α)N)=α[EU(L)−EU(M)]`; `α>0` |
| 7 | Independence in plain words: a Skyrim dungeon | Expected utility | M, I, G, A | α chance of treasure room; chest L 500 gold sure vs M 0/1200 50–50; ambush N |
| 8 | St. Petersburg paradox: the villager's coin | St. Petersburg | M, I, G, B | `Pr(k)=2^{-k}`, prize `2^k`; `E=1+1+…=∞`; WTP ≈5–20 emeralds |
| 9 | Bernoulli's resolution: concave utility | St. Petersburg | M, C, T, I, B | `Σ2^{-k}ln(w+2^k−p)=ln w`; table 10→4.97, 100→7.79, 1 000→10.95, 1 000 000→20.87; bankroll 2^20≈10^6 → EV 21 |
| 10 | Allais paradox: a rare drop in OSRS (vote!) | Allais | M, G, I, B, S | 2 fragment steps; A 2 400k sure; B 2 500k .33 / 2 400k .66 / 0 .01; C 2 500k .33 / 0 .67; D 2 400k .34 / 0 .66; 82% A, 83% C |
| 11 | Why $A\succ B$ and $C\succ D$ is inconsistent | Allais | M, B | `0.34u(2400)>0.33u(2500)` and `0.33u(2500)>0.34u(2400)`; contradiction `⊥`; common consequence |
| 12 | The probability triangle (Marschak--Machina) | Allais | M, C, F, I | TikZ: A(0,0), B(.01,.33), C(.67,.33), D(.66,0); 7 dashed parallels slope 2.5 |
| 13 | Paradoxical pattern of choice | Allais | M, B | Four lotteries over 3 outcomes; two inequalities; `\chi` typo (see §7 Q2) |
| 14 | Independence and inconsistent preferences | Allais | M, A | `L_3=αL_1+(1−α)N`, `L_4=αL_2+(1−α)N`; contradiction |
| 15 | Generalized Allais paradox | Allais | M, A | `P_A=δ_{x_M}`, `P_B=pδ_{x_H}+(1−p)δ_{x_0}`, `P_C=qδ_{x_M}+(1−q)δ_{x_0}`, `P_D=pqδ_{x_H}+(1−pq)δ_{x_0}`; boxed contradiction |
| 16 | Common ratio effect: a Minecraft expedition | Allais | M, G, I, B | 30 sure vs 40 w.p. .8; q=.25; 30 w.p. .25 vs 40 w.p. .20; `P_A≻P_B` but `P_D≻P_C` |
| 17 | Ellsberg paradox: the Khajiit's sack of gems | Ellsberg | M, G, T, B, S | 90 gems: 30 rubies, 60 E/S unknown; 100 gold; bets I–IV; 1 fragment (`\pause`) |
| 18 | Why no beliefs can explain it | Ellsberg | M, I, B | `π_R=1/3`, `π_E+π_S=2/3`; I≻II ⇔ `π_R>π_E`; IV≻III ⇔ `π_E>π_R` |
| 19 | Framing: Whiterun under dragon attack | Framing | M, G, I, B | 600 citizens; A 200 saved [72%], B 1/3·600 [28%]; C 400 die [22%], D 1/3 none [78%]; A≡C, B≡D |
| 20 | Loss aversion and small bets: hardcore mode | Framing | M, G, I, B | lose 1 000 / win 1 050, EV +25; Rabin 20 000; λ=2.25 ⇒ −600 |
| 21 | Prospect theory (Kahneman & Tversky) | Explaining | M, C, F | `V=Σw(p)v(x)`, `v` with cases, TK weight; α=β=.88, λ=2.25, γ=.61; 2 pgfplots |
| 22 | Prospect theory reproduces the paradoxes | Explaining | M, T, I | V: 943.2 / 806.5 / 326.7 / 320.1 and 19.9 / 15.6 / 5.8 / 6.7; 4 `\multirow`; `w(.66)+w(.33)=0.84` |
| 23 | Map of paradoxes and fixes | Explaining | M, T | 5-row summary, fixed widths 2.2/2.7/4.8 cm |
| 24 | Ambiguity aversion fixes the gem sack | Explaining | M, I, T, B | maxmin; worst-case chances 1/3, 0, 1/3, 2/3 |
| 25 | Conclusion | Conclusion | I, G | 6 bullets + green "In game terms" |
| 26 | *(none)* | Conclusion | P | `[plain]`, `\Huge` "Thank you for your attention!" |
| 27 | Appendix: St. Petersburg computation | Appendix | M, I | `f(p)` root, K=200, Brent; `E=n+1`; 2^20→21, 2^30≈10^9→31 |
| 28 | Appendix: prospect theory computations | Appendix | M, T | `v(x)=x^.88`, `w(p)`; w(p) row .055 .261 .291 .334 .339 .509 .607 .912; V(B)<V(A), V(C)>V(D) |
| 29 | References | `\section*` | BIB | 12 entries, `\nocite{*}`, `allowframebreaks` → 2 web pages |

**Totals checked independently:** 29/29 frames, 29 `\end{frame}`, 3 `\pause` (L276, L283, L473), 0 `\note{}`, 6 tables, 3 TikZ pictures, 1 raster image, 26 display-math constructs (23 `\[…\]` + 3 `align*`), 12 bib entries.

---

## 2. Preamble → KaTeX and CSS

### 2.1 Macros

The deck defines exactly **one** macro and one environment (plus four inert `\renewcommand`s at L7–L10 for figure/table naming, which never fire because there is no `\caption` — do **not** port them). KaTeX needs neither rewritten:

```js
// config.js
katexMacros: {
  "\\X": "\\mathcal{X}"      // slides.tex L44 — defined but never used in the deck
}
```

- `\checkmark`, `\boxed`, `\bot`, `\tfrac`, `\succeq`, `\succ`, `\mathbb`, `\mathcal`, `\text`, `\begin{aligned}`, `\begin{align*}`, `\begin{cases}`, `\\[4pt]` are **native** in KaTeX 0.16.11 (verified locally on the exact source strings).
- `gameblock` is a LaTeX *environment*; it is **not** a macro. Render it as HTML (`.block--game`) and keep its title text verbatim. `\X` is kept in `katexMacros` because the brief makes it the shared surface for deck *and* games.
- KaTeX mutates the macros object on `\gdef`, so pass a copy per render: `{ macros: Object.assign({}, CONFIG.katexMacros) }`.

### 2.2 Palette (from `VUMIF.sty` + Madrid/orchid)

| Element | Value |
|---|---|
| `blue` (redefined globally by VUMIF L4) | `#02487F` |
| `burgundy` (defined, unused) | `#7B003F` |
| `gamegreen` (gameblock) | `#2E7D32`, body `#2E7D32` at 8% → `#EEF5EF` |
| block title / body | `#262686` / `#E9E9F3` |
| alertblock title / body | `#143E5F` / `#E8ECEF` |
| item bullet (`structure`) | `#3333B3` |
| TikZ `blue` in figures | `#02487F`, **not** pure blue — critical when redrawing |
| TikZ `red` / `gray!70` | `#FF0000` / `#A6A6A6` (xcolor `gray!70` = 70% grey + 30% **white**, not black) |

### 2.3 What KaTeX cannot do, and the workaround

| Construct | Frames | Workaround |
|---|---|---|
| `tabular` + booktabs rules | 9, 17, 22, 23, 24, 28 | real `<table>`; rules via `border-top/bottom`; no vertical lines |
| `\multirow{2}{*}` | 22 | `rowspan="2"` |
| `columns` 0.48/0.5, 0.52/0.46, 0.5/0.5 | 9, 12, 21 | CSS grid `48fr 50fr` etc.; stack ≤ 700 px |
| `\pause` | 10 (×2), 17 | reveal `class="fragment"` on the exact next element (see §1) |
| `\vspace`, `\smallskip`, `\hfill` | 3, 5, 9, 19, 21, 22 | CSS margin; flex row with `margin-left:auto` for `[72%]` |
| `\setlength{\tabcolsep}{3pt}` | 28 | `td { padding: 0 .18em }` |
| `\tag` | not used | works in display mode only |
| `\vline` | not used | unsupported; use `{c\|c}` column spec or CSS border |

### 2.4 Typography

Source is 12 pt on a 128 mm canvas. Map to a 1280 px canvas at **1 cm = 100 px**: 12 pt ≈ 42 px, 10 pt ≈ 35 px, 8 pt ≈ 28 px. Recommendation: web base **34–36 px**, with `\small`→0.92, `\footnotesize`→0.85, `\scriptsize`→0.78 em; **nothing below 26 px**. Frames 5 and 13 (whole-frame `\scriptsize`) get a per-frame class rather than a global shrink.

No speaker notes exist; reveal's `S` view will show empty note panes until notes are written.

---

## 3. Concepts, exact formulas and numbers

### 3.1 Lotteries and expected utility (frames 3–7)

- Lottery: `L = {(x_1,p_1),…,(x_n,p_n)}`, `p_i ≥ 0`, `Σp_i = 1`, `x_i ∈ 𝒳` (frame 3).
- `EU(L) = Σ p_i u(x_i)`; `L ⪰ M ⟺ EU(L) ≥ EU(M)` (frame 5).
- VNM axioms: complete + transitive, continuous, **independence**:
  `L ⪰ M ⇒ αL + (1−α)N ⪰ αM + (1−α)N`, `0 < α < 1` (frame 5; frame 6 states `α > 0` — source inconsistency, do not harmonise silently).
- Proof of independence (frame 6): the `N` terms cancel, leaving `α[EU(L) − EU(M)]`; sign unchanged for `α > 0`.
- Worked example (frame 4): Minecraft Fortune III, EV `(2+2+3+4)/5 = 2.2` diamonds vs 2 for sure.
- Dungeon example (frame 7): with probability `α` reach the room — 500 gold sure (L) vs 0/1200 at 50–50 (M).

### 3.2 St. Petersburg (frames 8, 9, 27)

- `Pr(k) = 2^{-k}`, prize `2^k`, `E[prize] = Σ 2^{-k}·2^k = 1+1+1+… = ∞`.
- Observed willingness to pay ≈ **5–20** emeralds.
- Bernoulli, `u(x)=ln x`, wealth `w`: `Σ 2^{-k} ln(w + 2^k − p) = ln w`.
- Slide table: `w=10 → p=4.97`; `100 → 7.79`; `1 000 → 10.95`; `1 000 000 → 20.87`.
- Finite bankroll `B=2^n`: payoff `min(2^k,B)`, `E = n+1`; `2^20 ≈ 10^6 → 21`; `2^30 ≈ 10^9 → 31`.
- Appendix method: truncate at `K=200`, Brent's method.

### 3.3 Allais / common consequence / common ratio (frames 10–16)

- A: 2 400k gp sure. B: 2 500k w.p. .33, 2 400k w.p. .66, 0 w.p. .01.
- C: 2 500k w.p. .33, 0 w.p. .67. D: 2 400k w.p. .34, 0 w.p. .66.
- Typical: **82% A, 83% C** (Kahneman & Tversky 1979).
- `A≻B ⇔ 0.34u(2400) > 0.33u(2500)`; `C≻D ⇔ 0.33u(2500) > 0.34u(2400)`; both cannot hold.
- Probability triangle: A(0,0), B(.01,.33), C(.67,.33), D(.66,0); EU indifference lines parallel (slope 2.5, illustrative); AB ∥ DC ⇒ EU ranks both pairs alike.
- Generalized: `P_A=δ_{x_M}`, `P_B=pδ_{x_H}+(1−p)δ_{x_0}`, `P_C=qδ_{x_M}+(1−q)δ_{x_0}`, `P_D=pqδ_{x_H}+(1−pq)δ_{x_0}`; `P_A≻P_B` and `P_D≻P_C` give `u(x_M) > p u(x_H) > u(x_M)`.
- Common ratio (frame 16): `x_H=40`, `x_M=30`, `x_0=0`, `p=.8`, `q=.25`; P_A 30 sure, P_B 40 w.p. .8, P_C 30 w.p. .25, P_D 40 w.p. .20; typical `P_A≻P_B` but `P_D≻P_C`.
- Prospect-theory check (frame 22): V(A)=943.2, V(B)=806.5, V(C)=326.7, V(D)=320.1; P_A=19.9, P_B=15.6, P_C=5.8, P_D=6.7.

### 3.4 Ellsberg (frames 17, 18, 24)

- 90 gems: 30 rubies, 60 emeralds/sapphires in unknown mix; 100 gold prize.
- Bets: I ruby; II emerald; III ruby **or** sapphire; IV emerald **or** sapphire.
- Typical: I≻II ("I know it is 1/3") and IV≻III ("I know it is 2/3").
- `π_R=1/3`, `π_E+π_S=2/3`; I≻II ⇔ `π_R>π_E`; IV≻III ⇔ `π_E>π_R` ⇒ contradiction for every belief and every `u`.
- Maxmin (frame 24): worst-case chances I 1/3, II 0, III 1/3, IV 2/3 — reproduces I≻II and IV≻III.

### 3.5 Framing and loss aversion (frames 19, 20)

- 600 citizens; Frame 1 (saved): A 200 saved [72%], B 1/3·600 saved [28%]. Frame 2 (deaths): C 400 die [22%], D 1/3 none die [78%].
- A ≡ C, B ≡ D; only words change.
- Coin bet: lose 1 000 / win 1 050, EV **+25**; most reject.
- Rabin (2000): rejecting at every wealth level forces rejection of lose 20 000 / win any amount.
- λ ≈ 2.25: `0.5·1050 − 0.5·2.25·1000 = −600 < 0` ⇒ reject.

### 3.6 Prospect theory (frames 21, 22, 28)

- `V(L) = Σ w(p_i) v(x_i)`; `v(x) = x^α` for gains, `−λ(−x)^β` for losses; `w(p) = p^γ/((p^γ+(1−p)^γ)^{1/γ})`.
- Parameters `α=β=0.88`, `λ=2.25`, `γ=0.61` — the **Tversky–Kahneman (1992)** one-parameter weight, not Prelec's.
- `w(p)` row: p .01/.20/.25/.33/.34/.66/.80/.99 → w .055/.261/.291/.334/.339/.509/.607/.912.
- Certainty effect: `w(1)=1` but `w(.66)+w(.33)=0.84`.

---

## 4. Figures — format and conversion

| Figure | Frame | Source format | Plan |
|---|---|---|---|
| University logo | 1 | `resources/MIF.png`, 244×244 RGBA, white background (not a cut-out) | copy as-is to `docs/assets/ui/mif.png`; show at 200 px; keep on a light card, never on dark |
| Probability triangle | 12 | TikZ, all coordinates explicit | **inline SVG** built by `Figures.triangleSVG()` in `docs/js/figures.js` and injected into both `deck.html` and the Allais reveal (no request, works on `file://`) |
| Value function `v(x)` | 21 | pgfplots 5.0×3.7 cm, x∈[−100,100], y∈[−140,70], no ticks, `axis lines=middle` | **matplotlib → SVG** committed to `docs/assets/figures/value-function.svg` (500×370), script in `tools/make_figures.py` |
| Probability weighting `w(p)` | 21 | pgfplots 5.0×3.7 cm, x,y∈[0,1], dashed identity, boxed axes, 120 samples | `docs/assets/figures/probability-weighting.svg` |
| 6 tables | 9, 17, 22, 23, 24, 28 | LaTeX `tabular` + booktabs | HTML tables (see §2.3) |

**Why redraw rather than export:** there is no TeX, `pdftocairo`, `dvisvgm` or ImageMagick on this machine. Python 3.13 + matplotlib 3.10 + Pillow are available. If you prefer pixel-identical exports, you can compile in Overleaf — but the PDF would still need a PDF→SVG step, so the plan assumes our redraws.

**Split of responsibilities:** the **triangle** is generated in JS (`Figures.triangleSVG()`) because both the deck and the game need it; the **two plots** are committed SVG **files** produced once by `tools/make_figures.py` and loaded with `<img>` (so nothing is fetched at runtime). Colours are fixed at `#02487F` / `#FF0000` / `#A6A6A6` so the figures match the deck. Both SVG and inline SVG will be diffed against the formulas by the Phase 1 math reviewer.

---

## 5. Game mapping and the two games to build first

### 5.1 Mapping (numbers stay the slides'; skins follow your games)

| Paradox | Game | Skin | Why this skin | Try-it place | Slide refs |
|---|---|---|---|---|---|
| Allais / common consequence | **The Caravan Lockboxes** | *Fallout*: a caravan trader's caps, two routes through raider country | A "sure payout vs slightly better odds" decision is a trade route; caps are the deck's gold analogue | before frame 10 | 10–16, 22 |
| Ellsberg | **The Fixer's Crate** | *Cyberpunk 2077*: 90 chips, 30 marked, 60 of unknown split; bet 100 eddies | Unknown odds are the genre's whole economy; "known vs unknown crate" is a fixer's offer | before frame 17 | 17, 18, 24 |
| St. Petersburg | **The Doubling Contract** | *Witcher 3*: a tavern coin that doubles your crowns until it lands tails; the tavern's bankroll is finite | A tavern bet is period-correct and makes the infinite-EV absurdity physical | before frame 8 | 8, 9, 27 |
| Framing | **The Jarl's Orders** | *Skyrim*: Whiterun, 600 citizens, dragon inbound | The deck already uses this exact scenario, so the game and slide reinforce each other | before frame 19 | 19, 20 |
| *(optional 5th)* | **The Hardcore Run** | *Fallout* survival mode: lose 1 000 caps or win 1 050 | 60-second loss-aversion check using frame 20's exact bet | Phase 3, only if time | 20 |

**Styling rule:** the game never names the paradox before the reveal, never shows EV, and never says which answer is "rational" until all rounds are locked. Games are titled by their fiction ("The Caravan Lockboxes"), not by the paradox.

**Asset keys** follow the game prefix: `allais_*`, `ellsberg_*`, `stp_*`, `framing_*`, `loss_*`, plus shared `icon_*`, `hub_*`, `badge_*` and `ui_*`. Every key is registered in `ASSETS.md`; the engine resolves keys at runtime and never sees a path.

**Five §9 games are deliberately rejected** because the deck gives them no numbers: *The Bounty Board* (no CRRA coefficient or risk-premium measurement — only the log-utility WTP table), *Armor or Vitality* (no damage or variance data), *The Deep Mine* (no per-level EVs), *Two Quest Contracts* (no P-bet/$-bet values), *Hit Chance* (only the `w(p)` formula, no hit-chance data). Building any of them would require invented numbers, which the brief allows only if marked — not worth it when four games already match the deck's four paradoxes.

### 5.2 Numbers per game (verbatim from the deck)

**A. The Caravan Lockboxes (Allais)** — two rounds, deliberately separated by a 20-second unrelated "weigh the cargo" interlude so the paired structure is not obvious.

| Round | Option | Lottery (caps) |
|---|---|---|
| 1 | A — sealed strongbox | `{1.00 → 2 400}` |
| 1 | B — raider route | `{0.33 → 2 500, 0.66 → 2 400, 0.01 → 0}` |
| 2 | C — one trip | `{0.33 → 2 500, 0.67 → 0}` |
| 2 | D — two trips | `{0.34 → 2 400, 0.66 → 0}` |

*Unit note:* the slide says "2 400k gp" (thousands). The game shows the same digits in caps, i.e. a ×1/1000 rescale. The contradiction is invariant to any positive rescaling; this is flagged as an invented display unit, not an invented number.

Verdict logic — all four patterns, exhaustively:

| Round 1 | Round 2 | EU-consistent? | Reveal |
|---|---|---|---|
| A | C | **No** — violates independence (textbook pattern) | `0.34u(2400) > 0.33u(2500)` and `0.33u(2500) > 0.34u(2400)` ⇒ `⊥`. "Most people choose like you (82% / 83%)." |
| A | D | Yes | A≻B and D≻C both imply the **same** inequality `0.34u(2400) > 0.33u(2500)`; a concave `u` can satisfy it. |
| B | C | Yes | B≻A and C≻D both imply `0.33u(2500) > 0.34u(2400)`; near-linear `u` (EV: B 2 409 > A 2 400, C 825 > D 816). |
| B | D | **No** — mirror of A+C | B≻A ⇒ `0.33u(2500) > 0.34u(2400)`; D≻C ⇒ `0.34u(2400) > 0.33u(2500)` ⇒ `⊥`. |

**Two of the four patterns violate EU, and they are mirror images.** The verdict function must derive this from the two inequalities, never pattern-match "the textbook answer": a player who always picks the higher-EV option (B+D) is just as inconsistent as one who always picks the sure thing (A+C).

`P(payoff = 0)` shown during the simulation: A 0, B .01, C .67, D .66. Means: A 2 400, B 2 409, C 825, D 816.

**B. The Fixer's Crate (Ellsberg)** — two decisions, second separated by an unrelated "decrypt the manifest" step.

- Decision 1: bet on **ruby** (I) or **emerald** (II), 100 eddies.
- Decision 2: bet on **ruby or sapphire** (III) or **emerald or sapphire** (IV), 100 eddies.
- Ruby count is known: 30/90 = 1/3. Emerald + sapphire = 60, split unknown.

| D1 | D2 | EU-consistent? | Reveal |
|---|---|---|---|
| I | IV | **No** — textbook pattern | I≻II ⇒ `π_R > π_E`; IV≻III ⇒ `π_E > π_R` ⇒ `⊥`. "You priced the unknown twice, in opposite directions." |
| I | III | Yes | `π_R > π_E` from both choices. |
| II | IV | Yes | `π_E > π_R` from both choices. |
| II | III | **No** — mirror of I+IV | II≻I ⇒ `π_E > π_R`; III≻IV ⇒ `π_R > π_E` ⇒ `⊥`. |

Here too, **the two violating patterns are mirrors**; the verdict must be computed from the two beliefs, not from "did they pick the known bag".

Maxmin panel (from frame 24): worst-case chances I 1/3, II 0, III 1/3, IV 2/3.

**C. The Doubling Contract (St. Petersburg)** — slider "what would you pay?" then one resolve, then a **×10 000** simulation (the brief's §9 figure; the engine default is ×1000, and this game overrides it because the running average grows only like `log n` and needs more draws to be visible). Your bid is compared with the slide's log-utility values at wealth 10 / 100 / 1 000 / 1 000 000 (4.97 / 7.79 / 10.95 / 20.87) and with the finite-bankroll EV 21 for B = 2^20. *Assumption to mark as invented:* the player's starting wealth (recommend 100 emeralds → compare with 7.79).

**D. The Jarl's Orders (framing)** — same plan pair, asked twice under different wording, separated by an unrelated round. A/C and B/D are the same plan, so a switch is a framing reversal. Benchmark 72/28/22/78.

### 5.3 First two games (recommendation)

1. **Phase 2 — The Caravan Lockboxes (Allais).** Two choice rounds, four pattern outcomes, a clean contradiction, and it is the deck's longest-developed paradox (7 slides). It exercises every engine feature except the slider.
2. **Phase 3 start — The Fixer's Crate (Ellsberg).** Reuses the same engine with a different verdict function (subjective-probability contradiction instead of utility inequality) and gives the Report Card its "risk vs ambiguity" row. It is the cheapest second game to build and the strongest pairing on stage.

St. Petersburg goes third because it needs a slider + a running-average chart; Framing fourth.

### 5.4 Engine contract (Phase 2)

`config.js` holds all text/numbers per game; `js/games/<id>.js` only supplies `verdict(choices)`. Every round: scene → choice cards (sprite + label + lottery as numbers and a bar) → lock-in → seeded resolve (`?seed=42`) → ×1000 simulation (histogram + mean/SD/P(worst)) → reveal (concept name, plain explanation, KaTeX formulas with "Slide N", You-vs-EU panel) → hub. Progress in `localStorage` inside try/catch; missing asset → labelled placeholder + `console.warn`, never a crash.

---

## 6. Subagent plan for Phase 1 (deck)

**I build first (shared files, no subagent may touch them):** `docs/vendor/` (pinned reveal.js, KaTeX + fonts, QR lib, pixel font), `docs/config.js`, `docs/css/theme.css`, `docs/css/deck.css`, `docs/deck.html` skeleton, `docs/index.html` start screen, `.nojekyll`.

| Subagent | Owns (writes) | Produces |
|---|---|---|
| S1 frames 1–8 | `notes/phase1/part-1.html` | title, TOC, Expected utility, St. Petersburg; writes the slot marker `<!-- tryit:stp -->` immediately before frame 8 |
| S2 frames 9–15 | `notes/phase1/part-2.html` | Bernoulli, Allais entry, triangle slide, generalized Allais; marker `<!-- tryit:allais -->` before frame 10 |
| S3 frames 16–22 | `notes/phase1/part-3.html` | common ratio, Ellsberg, framing, loss aversion, prospect theory; markers `<!-- tryit:ellsberg -->` before 17 and `<!-- tryit:framing -->` before 19 |
| S4 frames 23–29 | `notes/phase1/part-4.html` | map, maxmin, conclusion, thank-you, appendix, references (2 pages) |
| S5 figures + asset check | `tools/make_figures.py`, `docs/js/figures.js`, `docs/assets/figures/*.svg`, `tools/check_assets.py` | 2 plot SVGs + logo copy; `figures.js` exposes `Figures.triangleSVG()` (used by the deck **and** the Allais reveal); asset checker |
| S6 try-it + QR | `notes/phase1/tryit-stp.html`, `tryit-allais.html`, `tryit-ellsberg.html`, `tryit-framing.html`, `notes/phase1/tryit.js`, `notes/phase1/qr.html` | four slide bodies (one per slot), iframe overlay with a visible close button, QR slide |

**Try-it insertion contract:** each slot marker is replaced during the merge by the matching `tryit-<id>.html` body, so the four slides land before frames 8, 10, 17 and 19 instead of at the end. S6 never edits S1–S3's files; S1–S3 never write the try-it markup.

**Merge:** I substitute the four markers, concatenate part-1…4 plus the QR slide, apply shared CSS/JS myself, and delete nothing until the reviewers sign off. Builders must not edit `deck.html`, `config.js`, `theme.css`, `deck.css`.

**Reviewers (fresh, did not build):**
- **Math reviewer** — every formula and number on every web slide vs the `.tex`, side by side; reports `frame → line` mismatches; also counts frames (29/29 present, each exactly once).
- **Layout reviewer** — 375 px and 1280 px, fragments (frames 10 and 17 only), speaker view (`S` opens; note panes empty by design, D9), `file://` double-click, airplane mode, 0 `.katex-error`, 0 console errors, no horizontal scroll.

**Fix loop:** each finding goes to the subagent that owns the file, that subagent fixes it in its own fragment, and the same reviewer re-checks the specific finding (brief §2.4). I do not silently patch a subagent's fragment.

**Done when:** 29 frames present + 4 try-it + QR, 35 web slides (36 if References paginates to 3), fragments step in source order, 0 KaTeX errors, offline works, QR resolves to `CONFIG.siteUrl`.

---

## 7. Risks and questions

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **4:3 source vs 16:9 brief** — geometry changes; a frame that fits in the PDF may reflow | 1 cm = 100 px mapping; per-frame overflow check at 1280×720; log every deviation |
| R2 | **`file://` + offline** — no ES modules, no `fetch`, no CDN | classic `<script>` tags, vendored libs, relative paths, empty `.nojekyll`, double-click test in Phase 1 |
| R3 | **KaTeX silently accepts wrong math** (`\chi` renders as χ) | 0-error check is not enough: math reviewer compares symbols, not just parse success |
| R4 | **Tables are the hard part** (6 tables, 4 rowspans, fixed widths, 9 columns) | dedicated conversion rules in §2.3; layout reviewer checks 375 px |
| R5 | **Game numbers or verdicts drifting from slides** | all numbers live in `config.js` with a `slideRefs` field; verdicts are computed from the two inequalities, never pattern-matched; Phase 2 includes a test that derives those inequalities symbolically, enumerates all four patterns and asserts the contradiction flag (a brute-force utility grid is used only to sanity-check the "consistent" rows) |
| R6 | **Copyright** — art from Fallout/Skyrim/Witcher/Cyberpunk | original pixel art now; registry makes replacement a one-line change; private use only, ask before publishing |
| R7 | **St. Petersburg simulation ≠ infinite EV** | truncate at K=200 as the appendix does, and show the truncation explicitly; finite-bankroll EV 21 alongside |
| R8 | **No speaker notes** in the source | `S` view works but empty; decide in Phase 1 whether to author them (new content) |
| R9 | **No TeX locally** | figures redrawn from exact coordinates/formulas; if the team wants PDFs, they compile in Overleaf and we still need a PDF→SVG step |

### Questions for you (answer any subset; defaults in brackets)

1. **Aspect ratio** — accept 16:9 at 1280×720, knowing the PDF you rehearsed with is 4:3? [yes]
2. **The `\chi` typo** (frame 13: `x_1,x_2,x_3 \in \chi`, should be `\mathcal{X}`) — may I fix it in the web deck and log it, or reproduce it faithfully? [fix + log]
3. **Title string** — the `.tex` says "Paradoxes of **Choices** under Uncertainty", the brief says "Paradoxes of **Choice** Under Uncertainty". Which one everywhere? [use the `.tex` string]
4. **Supervisor line** — "Supervisor: Assoc. Dmitrij Celov" is missing "Prof." and a full stop. Correct it on the web title slide? [yes → "Assoc. Prof. Dmitrij Celov"]
5. **Try-it slides** — 4 new slides (before frames 8, 10, 17, 19) plus the QR slide, footer "n / 35" (36 if References paginates to 3). Or only Allais + Ellsberg live? [all four, presenter may skip]
6. **References** — two pages, author–year (no `[1]…[12]` numbers), or keep numeric biblatex look? [author–year, 6 + 6]
7. **Speaker notes** — leave empty, or should I draft 2–4 bullet notes per slide as new content? [leave empty for now]
8. **`siteUrl`** — GitHub user/repo not filled in. Needed for the QR code. [placeholder + ask in Phase 1]
9. **Presentation date** — not in the `.tex`; needed only for the start screen / README, not the build. [leave blank]
10. **Git** — I will `git init` and commit each phase locally (no remote, no push). OK? [yes]

---

## 8. Phase 0 acceptance

- [x] Every frame counted: 29/29, one inventory row each, 0 duplicates, 0 gaps.
- [x] Every formula/table/TikZ registered; 35 transcribed values spot-checked with 0 mismatches (independent reviewer), and **all eight game verdict patterns re-derived by the second reviewer** (four per game), which found and fixed two mirror-pattern errors.
- [x] Independent review PASS WITH FIXES → 8 must-fixes and the accepted should-fixes applied → re-checked (see `notes/phase0/plan-review.md` and the fix round in `NOTES.md`).
- [x] Game mapping with exact numbers, invented values marked.
- [x] Asset manifest with formats/sizes (`ASSETS.md`).
- [x] Risks and questions listed.
- [ ] **Your go-ahead for Phase 1** ← next step.
