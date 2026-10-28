# Phase 0 independent review — inventories and preamble

## Verdict

**PASS WITH FIXES** — coverage is complete (29/29 frames, 6/6 tables, 3/3 TikZ, 12/12 bibliography entries), but four inventory errors and one wrong attribution would propagate into `PLAN.md` / Phase 1 (wrong Outline, wrong overlay structure, wrong section metadata, wrong KaTeX guidance, wrong concept name).

---

## Must-fix

### 1. Frame 2 TOC is 8 entries, not 3
**`notes/phase0/frames-a.md:21` and `:376` — frame 2 (`Outline`).**

Exact wrong text:

> `\tableofcontents` only. Renders 3 entries (the three sections); …
>
> hand-write the three section entries (Expected utility: the benchmark · St. Petersburg paradox · Allais paradox)

**Wrong.** Beamer's `\tableofcontents` reads the `.toc` file and lists **every** numbered `\section` in the document, not only sections encountered so far. The deck has 8 numbered sections:

1. Expected utility: the benchmark
2. St. Petersburg paradox
3. Allais paradox
4. Ellsberg paradox
5. Framing and loss aversion
6. Explaining the paradoxes
7. Conclusion
8. Appendix

`References` is `\section*` (L708) and is correctly excluded. `preamble.md:246` already gets this right ("8 section titles"), so Phase 0 currently contradicts itself. **Correction:** change "3 entries" to "8 entries" and replace "three section entries" with the list above.

### 2. Frame 10: only one `\pause` is inside the `gameblock`; there are 2 fragments, not 3
**`notes/phase0/frames-a.md:29` and `:369` — frame 10 (`Allais paradox: a rare drop in OSRS (vote!)`).**

Exact wrong text:

> BOTH `\pause`s are **inside** the `gameblock` body (block must stay one box).

> both `\pause`s sit *inside* the `gameblock`. Build the green box once and place three fragments inside it (Question 1 → Question 2 → "Typical answers" block).

**Wrong.** Source L270–286:

- L270 `\begin{gameblock}{…}`
- L276 `\pause` → reveals Question 2 + its itemize (inside the green box)
- L282 `\end{gameblock}`
- L283 `\pause` → reveals the **separate blue `block`** "Typical answers (Kahneman & Tversky, 1979)" at L284–286

So the green box has **one** internal fragment (Q2); the "Typical answers" box is outside it and is a different environment (`block`, not `gameblock`), i.e. blue (`#262686`), not green. **Correction:** "The first `\pause` (L276) is inside the `gameblock`; the second (L283) is after `\end{gameblock}` (L282) and reveals a separate blue block. Two fragments, not three: Q1 initial → Q2 inside the green box → 'Typical answers' block outside." `preamble.md:289` already states this correctly, so the two notes contradict each other.

For completeness: frame 17 is recorded correctly (`frames-b.md:13`, `:474` — one `\pause` at L473, before the "Typical choice" block), and neither inventory invents any other fragment. The only overlay error is the frame-10 location/order description above.

### 3. Frame 16 belongs to section "Allais paradox", not "Expected utility: the benchmark"
**`notes/phase0/frames-b.md:12` — frame 16 (`Common ratio effect: a Minecraft expedition`).**

Exact wrong text in the `section` column:

> Expected utility: the benchmark

**Wrong.** `\section{Allais paradox}` is at L266 and the next section (`\section{Ellsberg paradox}`) is at L453. Frame 16 spans L435–451, so it is the **last Allais frame**, not an Expected-utility frame. **Correction:** change the cell to `Allais paradox`.

### 4. `align*` **is** supported by KaTeX 0.16.11 (display mode only)
**`notes/phase0/frames-a.md:233` — frame 11 (`Why $A\succ B$ and $C\succ D$ is inconsistent`); same construct on frames 18 and 28.**

Exact wrong text:

> `align*` is **not** a KaTeX environment — convert to `\begin{aligned}` inside `$$…$$` (that is the only change needed).

**Wrong.** I installed KaTeX 0.16.11 and rendered the exact frame-11 block:

```latex
\begin{align*}
A\succ B &\iff u(2400) > 0.33\,u(2500)+0.66\,u(2400)\\
         &\iff 0.34\,u(2400) > 0.33\,u(2500),\\[4pt]
C\succ D &\iff 0.33\,u(2500) > 0.34\,u(2400).
\end{align*}
```

It renders cleanly in display mode, including `\\[4pt]`. `align*` fails **only** if placed in inline `$…$` ("`align*` can be used only in display mode"). All three uses in the source are display constructs, so they can be copied inside `$$…$$` **verbatim**; conversion to `aligned` is unnecessary (and loses the source form). `preamble.md:204` and `:536` correctly list `align*` as native. **Correction:** "`align*` is native in KaTeX 0.16.11 in display mode; copy it inside `$$…$$`. `\\[4pt]` works. Do not rewrite to `aligned`."

### 5. Frame 21's weighting function is Tversky–Kahneman (1992), not Prelec
**`notes/phase0/frames-b.md:490` — frame 21 (`Prospect theory (Kahneman \& Tversky)`).**

Exact wrong text:

> … and the Prelec weighting function with nested `\big( … \big)^{1/\gamma}` …

**Wrong.** The formula at L541 and L688 is

\[
w(p)=\frac{p^{\gamma}}{\big(p^{\gamma}+(1-p)^{\gamma}\big)^{1/\gamma}},
\]

the one-parameter weighting function of **Tversky & Kahneman (1992)** (the deck's `tversky1992` entry). Prelec's function is \(w(p)=\exp\!\big(-(-\ln p)^{\alpha}\big)\), a different formula. **Correction:** "the Tversky–Kahneman (1992) one-parameter weighting function" (or "the TK weight function"). If Phase 1/games name it "Prelec", the attribution is wrong and there is no Prelec entry in `references.bib`.

---

## Should-fix

### S1. Frame 19's heading-size "inconsistency" is not real
**`notes/phase0/frames-b.md:15`, `:125`, `:497`; `notes/phase0/preamble.md:553` — frame 19 (`Framing: Whiterun under dragon attack`).**

See "Incorrect reviewer-flag candidate" below for the proof. **Correction:** delete the flag and the handover instruction; both headings render `\small`. Also fix `preamble.md:553` ("frames 10 … and 19 … entirely in `\footnotesize`"): frame 19's four plan lines are `\small`, only the gameblock title and the trailing block are `\footnotesize`.

### S2. Title-page logo is at the **bottom**, not above/left of the title
**`notes/phase0/preamble.md:154`.**

Exact wrong text:

> Title page composition to reproduce: logo (2 cm) above/left of the title, title on navy, subtitle, authors, supervisor, no date.

**Wrong.** Beamer's default `title page` template (`beamerinnerthemedefault.sty`, fetched and checked) emits, in order: title → author → institute → date → `\vskip0.5em` → `titlegraphic`. Madrid does **not** override the title page (`beamerthemeMadrid.sty` only selects colour/inner/outer themes). So `resources/MIF.png` is centred near the **bottom** of the title slide, after the supervisor line, not above/left. **Correction:** "logo centred at the bottom, after the author/supervisor/date block (default beamer title page; Madrid does not override it). A top-left logo on the web deck would be a deliberate deviation — log it."

### S3. `\vspace` frame list is missing frame 5, and the px conversions mix scales
**`notes/phase0/preamble.md:217`.**

Exact wrong text:

> text mode only: L87, 97, 148, 232, 536, 543, 577 … (values: −0.15 cm ≈ −4 px, 0.1 cm ≈ 3 px, 0.05 cm ≈ 1.4 px, −4 pt ≈ −5 px, −6 pt ≈ −8 px) | 3, 9, 21, 22

**Wrong twice.**

- L148 is `\vspace{0.05cm}` on **frame 5**; the affected-frame list must be **3, 5, 9, 21, 22**. (L87/L97 frame 3; L148 frame 5; L232 frame 9; L536/L543 frame 21; L577 frame 22.)
- The px values are not on the `1 cm = 100 px` scale used everywhere else (`preamble.md:35`, `:525`). At that scale: −0.15 cm = **−15 px**, 0.1 cm = **+10 px**, 0.05 cm = **+5 px**, −4 pt = **−14 px**, −6 pt = **−21 px**. The quoted 4/3/1.4/5/8 px look like 96-dpi CSS values, and even there −0.15 cm is 5.7 px, not 4. **Correction:** add frame 5 and either use canvas px at 1 cm = 100 px or write the CSS in `cm`/`pt` and stop converting; do not mix the two scales.

### S4. "display-math blocks 23" omits the 3 `align*` blocks
**`notes/phase0/preamble.md:12`.**

Exact wrong text:

> display-math blocks | **23** | count of `\]` = 23 …

The `\]` count is right, but there are also 3 `align*` displays (frames 11, 18, 28) that do not use `\[…\]`. Total display-math constructs = **26**. The row's label overstates completeness. **Correction:** "23 `\[…\]` blocks + 3 `align*` blocks (frames 11, 18, 28) = 26 display constructs", or relabel the row "`\[…\]` blocks".

### S5. `\tag` and `\vline` are supported by KaTeX
**`notes/phase0/preamble.md:536`.**

They are listed under "Unsupported ✘". In KaTeX 0.16.11: `\tag{1}` works in **display mode**; `\vline` works inside an `array`. Neither is used in the deck, so this is a documentation error only. **Correction:** remove `\tag` and `\vline` from the unsupported list (or add "display/array only"). `\cline`, `\textsc`, `\textbackslash`, `\ensuremath`, `\label`, `\intertext`, `\sfrac`, `\nicefrac` are correctly listed as unsupported.

### S6. "Frame 10 is the only math-bearing frame with no display math" is false
**`notes/phase0/frames-a.md:348`.**

Frames **7** (the inline `\alpha L+(1-\alpha)N\succeq\alpha M+(1-\alpha)N` chain, L202) and **12** (TikZ labels and the `\{0,2400,2500\}` bullet, L311–335) also have inline math and no display math. **Correction:** "Frames 7, 10 and 12 have only inline math."

### S7. All 7 dashed lines do cross the triangle
**`notes/phase0/frames-a.md:370`.**

Exact wrong text:

> … the 7 dashed grey parallels `(0,c) → (1, c+2.5)` for c ∈ {-1.6,-1.2,-0.8,-0.4,0,0.4,0.8} clipped to the triangle (not all 7 cross it).

**Wrong.** With \(y=c+2.5x\) and the triangle \(x\ge0,\ y\ge0,\ x+y\le1\), every line has a non-empty inside segment:

| c | x-range inside triangle |
|---|---|
| 0.8 | 0 … 0.057 |
| 0.4 | 0 … 0.171 |
| 0 | 0 … 0.286 |
| −0.4 | 0.16 … 0.4 |
| −0.8 | 0.32 … 0.514 |
| −1.2 | 0.48 … 0.629 |
| −1.6 | 0.64 … 0.743 |

**Correction:** drop "(not all 7 cross it)"; draw all 7, clipped.

### S8. Minor line/count slips
- `notes/phase0/frames-b.md:4` — "14th frame starts at line 394": L394 is the **15th** frame (L372 is the 14th).
- `notes/phase0/frames-b.md:474` — "lines 276 and 283, frames 10–11": both are on **frame 10**.
- `notes/phase0/frames-b.md:479` — "All 9 V values": there are **8** distinct V values (943.2, 806.5, 326.7, 320.1, 19.9, 15.6, 5.8, 6.7) plus the V(A)/V(C) repeats on frame 28.
- `notes/phase0/preamble.md:267` — `St.\ Petersburg` also occurs at **L649** (frame 25 bullet) and **L668** (frame 27 title), not only L209/211/611.
- `notes/phase0/preamble.md:266` — "the em-dash `---` is **not** used" is true for the LaTeX ligature, but there are literal U+2014 characters at **L449** and **L638**; preserve them as `—`, don't convert to `--`.
- `notes/phase0/preamble.md:208` — the row "`\%` inside math | L446 (text)" is self-contradictory; L446's `\%` is text-mode. Say "`\%` in text (also native in math)".
- `notes/phase0/preamble.md:438` — the Allais title is quoted as `devant le risque : critique` (space before colon); the .bib has `devant le risque: critique` (L3). If it is billed as the "full reference line", copy the .bib exactly.

### S9. Frame 1 and 2 are labelled "plain-frame" but neither is `[plain]`
**`notes/phase0/frames-a.md:20` and `:21`.**

Only frame 26 (`L661`) uses `\begin{frame}[plain]`. Frames 1 and 2 are ordinary frames (title page / TOC) and still carry the Madrid footline. The label could make Phase 1 suppress the footer on the first two slides. **Correction:** label them "title page" and "TOC"; reserve `plain` for frame 26.

### S10. `preamble.md` §6.1 calls style/decision items "real errors"
**`notes/phase0/preamble.md:478–496`.**

Only item 1 (`\chi`, L345) is an unambiguous source math error. Item 2 (frame 27's `\sum 1`) is mathematically correct (see below); item 3 (frame 11 "is inconsistent") is debatable; items 4–6 ("Assoc." abbreviation, title/brief mismatch, dead caption code) are style/content decisions, not errors. **Correction:** retitle the section "Source oddities and decisions", or move 2–6 out of "Real errors".

### S11. Frame 11's common-consequence mapping is order-ambiguous
**`Microeconomic_analysis__Copy_/slides.tex:301`, frame 11 — not flagged by either inventory.**

The block says "`C,D` are `A,B` with the common part `2 400 w.p. 0.66` replaced by `nothing w.p. 0.66`". Arithmetic: A = 2400@.34 + 2400@.66 → replace the .66 leg → **D** (2400@.34, 0@.66); B = 2500@.33 + 2400@.66 + 0@.01 → replace the .66 leg → **C** (2500@.33, 0@.67). So C comes from B and D from A, the reverse of the sentence's parallel order. It is a wording ambiguity, not a numeric error, but `PLAN.md`/`CONVERSION_NOTES.md` should log it rather than silently "fix" it.

---

## Incorrect reviewer-flag candidate

These were flagged by a builder but are actually fine (proof included). They should be removed from the handover, not "fixed" in Phase 1.

### Frame 19: both headings are `\small`; there is no size inconsistency
**Flagged at `frames-b.md:15`, `:125`, `:497` (and echoed at `preamble.md:553`).**

Source L499–511:

```latex
\footnotesize
\begin{gameblock}{A dragon will kill 600 citizens unless the Jarl acts}
\small\textbf{Frame 1 (lives saved):}
...
\textbf{Frame 2 (deaths):}
...
\end{gameblock}
```

`\small` is an **unscoped declaration**, not a command taking an argument. It takes effect at L501 and persists to the end of the enclosing `gameblock` group, i.e. through L511. Therefore "Frame 2 (deaths):" at L506 is also `\small`. The only `\footnotesize` text is the gameblock title (L500) and the block after L512. The "Frame 1 `\small`, Frame 2 `\footnotesize`" claim is false; the handover bullet `frames-b.md:497` should be deleted (or changed to "both headings `\small`; the missing explicit `\small` before Frame 2 is only latent fragility").

### `2^20 ≈ 10^6` is correct
**Flagged at `frames-a.md:375`, which groups it with `\chi` as a "mathematical slip".**

\(2^{20}=1{,}048{,}576\approx1.05\times10^6\). The slide (L257) and frame 27 (L681) are right; the inventory's "same for `2^20 ≈ 10^6` … reads as a mathematical slip" is wrong.

### `prizes $e^{2^k}$` (frame 9, L262) is correct, not dimensionally odd
**Flagged at `frames-a.md:197` and `:375`.**

With \(u(x)=\ln x\), a prize \(x=e^{2^k}\) has utility \(\ln(e^{2^k})=2^k\); the probability is \(2^{-k}\), so each term is \(2^{-k}\cdot2^k=1\) and the sum diverges. That is exactly the "log utility breaks again ⇒ \(u\) must be bounded" claim. `preamble.md:507` gets this right; `frames-a.md` should drop the "dimensionally odd / mathematical slip" language. (The source is unusual, but mathematically intentional.)

### Frame 27's `\sum_{k=1}^{n}1` is correct; "dropped payoff" is an overstatement
**`preamble.md` §6.1 item 2 says it is a real error and "worth fixing"; `frames-b.md:319` says it is correct.**

The intended term is \(2^{-k}2^k=1\), so \(\sum_{k=1}^n 1\) is an exact abbreviation, not a wrong sum. The tail is \(\sum_{k>n}2^{-k}2^n=2^n\cdot2^{-n}=1\), hence \(\mathbb{E}=n+1\). The only genuine notation nit is that `\mathbb{E}` has no argument (`\mathbb{E}[\cdot]`). **Correction:** do not rewrite the sum; at most add the missing expectation argument, and log that as a notation change.

### `W.p.` is correctly capitalised in frame 7
**Flagged at `frames-a.md:149` as "capitalised mid-sentence (frames 8–10 also use it)".**

Frame 7 L198 has **two sentence-initial** occurrences: "W.p.\ $1-\alpha$ a draugr ambush ends the run (lottery $N$). W.p.\ $\alpha$ you reach the treasure room…". Capital W is correct. Frames 8 and 9 contain no "w.p." at all; frame 10 uses lowercase `w.p.` mid-sentence (L274, 279, 280). So the claim "frames 8–10 also use it" is also wrong. Keep "W.p." verbatim; there is no typo.

### C≻D vs D≻C (frames 11/12/16) is not a contradiction
**`preamble.md` §6.2 correctly resolves this; no builder incorrectly flagged it as an error, and it should stay unflagged.**

Frame 11's title says the observed pair is "A≻B and C≻D"; frame 11 derives the EU implications; frame 12 says EU implies "A≻B ⇔ D≻C" (L335). Observed C≻D and EU-implied D≻C are supposed to clash — that is the paradox. Frame 16 is the same structure with P: observed P_D≻P_C (L446), EU implies P_C≻P_D. All three statements are consistent with each other. Do not "harmonise" the arrows.

### Frame 11 "Why A≻B and C≻D **is** inconsistent" is defensible
**Flagged at `preamble.md:489` as a grammar error ("a compound subject takes 'are'").**

The subject can be read as the single joint hypothesis "A≻B and C≻D", which is singular; "is inconsistent" is standard in this construction. At most a style preference, not a must-fix. If the team wants "are", treat it as an authorial edit, not a conversion fix.

### Flags that are correct (keep these)
For completeness, the following builder flags are **real** and should survive into `PLAN.md`/`CONVERSION_NOTES.md`:

- **`\chi` at L345 (frame 13):** real. The outcome set is `\mathcal{X}` at L84 and `\X` is defined at L44; `\chi` renders as a Greek chi with no KaTeX error. Fix only with the team's approval.
- **`\alpha` range difference, frames 5/6:** real. Frame 5 (L150–151) says `0<\alpha<1`; frame 6 (L171) says `\alpha>0` and omits the upper bound. Minor imprecision, correctly flagged; do not silently harmonise.
- **Empty `alertblock` title on frame 15 (L429):** real. It renders a bare title bar; the same happens on frame 16's `block` (L448). Both correctly flagged.
- **`\multirow` on frame 22 (L584, 586, 589, 591):** real; four `rowspan="2"` cells, with the Example column deliberately blank on continuation rows.
- **Duplicate `biblatex` (L14–18 and L25):** real dead code; no option clash today, but a trap if options are added at L25.
- **C≻D vs D≻C:** correctly **not** an error; `preamble.md` §6.2 is right (see above). Keep the arrows as written.

---

## Missing for PLAN.md

These are not necessarily inventory-subagent failures, but they are required by `BRIEF.md` §6 and are **not** derivable from the three files as they stand.

1. **Game mapping table (PLAN §6.5).** None of the three files maps a paradox to a §9 game, gives the exact game numbers, or proposes where the "Try it" slide goes. The raw numbers are present, but the mapping/recommendation is absent. Also missing: which §9 games have **no numeric basis in the deck** and therefore need invented numbers marked as such (`BRIEF.md` §1): Bounty Board (no CRRA ρ/CE beyond the log-utility WTP table), Armor or Vitality (no damage/variance numbers), Deep Mine (no level EVs), Two Quest Contracts (no P-bet/$-bet numbers), Hit Chance (only the \(w(p)\) formula, no hit-chance data). The two recommended first games are not proposed anywhere.
2. **"Try it" slide placement.** `BRIEF.md` §7 asks for a "Try it" button *before* the slide that explains each paradox. No file proposes placements (e.g. Allais before frame 10, Ellsberg before frame 17, St. Petersburg before frame 8, framing before frame 19).
3. **Final "Play the games" + QR slide.** The .tex has no such slide. Frame 26 is a bare `[plain]` "Thank you" (L661–664), and the actual final frame is **References** (frame 29, L710–713). `BRIEF.md` §7 requires a last slide with a QR code and short URL; neither inventory flags that this is **new content** nor says whether it goes after References or replaces the Thank-you.
4. **Total web-slide count with overlays.** The files give 29 frames and 3 `\pause` commands, but no single count. If reveal counts fragment states, frame 10 contributes 3 and frame 17 contributes 2 (29 + 2 + 1 = 32 states, or 33 with the References split); if it counts sections only, 29/30. `preamble.md:262` asserts `n / 29` or `n / 30` without resolving whether fragments count. PLAN needs one decision.
5. **Consolidated concept/figure/table index.** The slide inventory is split across two files and frame 16 is mis-sectioned (must-fix 3); frame 9's table appears only inside `frames-a.md`'s formula register, not in a tables register; frame 12's TikZ is in `frames-a.md`, frame 21's two plots in `frames-b.md`. PLAN §6.1/6.3/6.4 need one merged table.
6. **Speaker notes decision.** No `\note{}` exists anywhere (confirmed: `grep -c '\note'` = 0). Phase 1's "speaker notes on S" will be empty unless the team writes notes. The preamble notes the absence but the plan needs an explicit decision (author notes / leave empty).
7. **Questions for the team.** The notes surface the raw issues (`\chi`, title string "Choices" vs "Choice", "Assoc." supervisor line, 4:3 vs 16:9, References numeric vs author–year, frame 19/20 font sizes) but there is no consolidated "questions for us" list for PLAN §6.7.
8. **Offline/`file://` and QR-generation risks.** `preamble.md` §6/§7 covers content/toolchain risks, but not the `BRIEF.md` §4 hard constraints (no CDN, `file://` double-click, vendored KaTeX fonts, local QR generation, `.nojekyll`). These belong in PLAN §6.7.

---

## What I verified and how

### Counts (shell, from `Microeconomic_analysis__Copy_/slides.tex`)

| check | command | result |
|---|---|---|
| frames | `grep -c '\\begin{frame}'` | **29** |
| frame closes | `grep -c '\\end{frame}'` | **29** |
| `\pause` | `grep -n '\\pause'` | **3**: L276, L283 (frame 10), L473 (frame 17) |
| `\note` | `grep -c '\\note'` | **0** (no speaker notes) |
| `\item` | `grep -c '\\item'` | **46** |
| `tabular` | `grep -c '\\begin{tabular}'` | **6**: L240, 461, 580, 607, 629, 692 |
| TikZ pictures | `grep -n '\\begin{tikzpicture}'` | **3**: L310 (frame 12), L548, L561 (frame 21) |
| raster images | `grep -n '\\includegraphics'` | **1**: L59 (`resources/MIF.png`, frame 1) |
| `\]` | `grep -o '\\]' \| wc -l` | **23** |
| `\[` | `grep -o '\\[' \| wc -l` | **29** = 23 real + 6 `\\[4pt]`/`\\[3pt]` row skips (L294, 440, 611–614) |
| inline `$…$` in 1–433 | `awk 'NR<=433' \| grep -o '\$' \| wc -l` | **130** `$` = **65** segments |
| bib entries | `grep -c '^@' references.bib` | **12** |
| VUMIF lines | `wc -l VUMIF.sty` | 53 newlines, 54 lines (last line has no trailing newline) |

**Frame coverage:** frames 1–15 at L67, 72, 78, 105, 122, 163, 195, 211, 229, 268, 289, 305, 342, 372, 394 (15); frames 16–29 at L435, 455, 479, 498, 517, 534, 575, 603, 621, 644, 661, 668, 685, 710 (14). 15 + 14 = **29**, no duplicates, no gaps, all `\begin{frame}` matched to `\end{frame}`. The References frame is covered as frame 29; `[allowframebreaks]` is correctly identified as potentially producing multiple web slides.

**Tables/figures:** all 6 tables registered (frame 9 in `frames-a.md`; frames 17, 22, 23, 24, 28 as T1–T5 in `frames-b.md`); all 3 TikZ pictures registered (frame 12 in `frames-a.md`; frame 21 F1/F2 in `frames-b.md`); the one raster (`MIF.png`) is covered in `preamble.md` §4.1.

### Numeric fidelity — 35 spot checks, **0 mismatches**

I compared each value/formula character-by-character against the .tex, including the cases the brief lists:

| # | value/formula | .tex | inventory | result |
|---|---|---|---|---|
| 1 | 2.2 (EV of the Minecraft lottery) | L111 | `frames-a.md:72,82` | exact |
| 2 | 4.97 | L244 | `frames-a.md:179` | exact |
| 3 | 7.79 | L245 | `frames-a.md:180` | exact |
| 4 | 10.95 | L246 | `frames-a.md:181` | exact |
| 5 | 20.87 | L247 | `frames-a.md:182` | exact |
| 6 | 2^20 ≈ 10^6; E = 21 | L257 | `frames-a.md:193–194` | exact |
| 7 | 2 400k / 2 500k | L273–274 | `frames-a.md:204–205` | exact |
| 8 | 0.33 / 0.66 / 0.01 | L274 | `frames-a.md:205` | exact |
| 9 | 0.34 / 0.66 | L280 | `frames-a.md:207` | exact |
| 10 | 82% / 83% | L285 | `frames-a.md:208` | exact |
| 11 | 0.34u(2400) > 0.33u(2500) | L294 | `frames-a.md:219` | exact |
| 12 | 0.33u(2500) > 0.34u(2400) | L295 | `frames-a.md:220` | exact |
| 13 | A(0,0), B(.01,.33), C(.67,.33), D(.66,0) | L322–325 | `frames-a.md:266` | exact |
| 14 | `x_1,x_2,x_3 \in \chi` | L345 | `frames-a.md:290` | exact (source error correctly flagged) |
| 15 | p,q ∈ (0,1); u(x_0)=0 | L397, 414 | `frames-a.md:336` | exact |
| 16 | `\boxed{u(x_M)>p\,u(x_H)>u(x_M)}` | L425 | `frames-a.md:331` | exact |
| 17 | 30 / 40 / .8 / .2 / q=.25 / .20 | L439–446 | `frames-b.md:42–55` | exact |
| 18 | 90 / 30 / 60 / 100 | L457–469 | `frames-b.md:68–74` | exact |
| 19 | π_R=1/3; π_E+π_S=2/3 | L481 | `frames-b.md:94–95` | exact |
| 20 | 600 / 200 / 400 / 1/3 / 2/3 | L500–510 | `frames-b.md:111–121` | exact |
| 21 | 72% / 28% / 22% / 78% | L503–509 | `frames-b.md:115–121` | exact |
| 22 | 1 000 / 1 050 / +25 / 20 000 / 2.25 / −600 | L520–527 | `frames-b.md:140–150` | exact |
| 23 | α=β=.88, λ=2.25, γ=.61 | L544 | `frames-b.md:183–185` | exact |
| 24 | 5.0×3.7 cm; −100..100; −140..70; 60 samples | L549–553 | `frames-b.md:186–189` | exact |
| 25 | 0..1; .0005..9995; 120 samples | L562–566 | `frames-b.md:190–193` | exact |
| 26 | 943.2 / 806.5 / 326.7 / 320.1 | L584–587 | `frames-b.md:222–228` | exact |
| 27 | 19.9 / 15.6 / 5.8 / 6.7 | L589–592 | `frames-b.md:229–236` | exact |
| 28 | 2500,.33; 2400,.66; 2500,.33; 2400,.34 | L584–587 | `frames-b.md:223–227` | exact (no leading zeros) |
| 29 | 1982 / 1989 / λ>1 | L612–615 | `frames-b.md:254–256` | exact |
| 30 | 1/3, 0, 1/3, 2/3 (maxmin row) | L633 | `frames-b.md:278` | exact |
| 31 | K=200; 2^20→21; 2^30≈10^9→31; n+1 | L674–681 | `frames-b.md:306–317` | exact |
| 32 | w(p): .055/.261/.291/.334/.339/.509/.607/.912 | L695 | `frames-b.md:345–346` | exact |
| 33 | V(B)=806.5, V(C)=326.7, v(2400)=943.2, V(D)=320.1 | L700–701 | `frames-b.md:347–353` | exact |
| 34 | w(.66)+w(.33)=0.84 | L598 | `frames-b.md:237–239` | exact (.509+.334=.843) |
| 35 | λ=2.25, 0.5·1050−0.5·2.25·1000=−600 | L527 | `frames-b.md:146–150` | exact |

I also re-added the probabilities on frame 10 (0.33+0.66+0.01 = 1; 0.33+0.67 = 1; 0.34+0.66 = 1) and checked the frame-12 triangle coordinates against the lotteries (B=(.01,.33,.66), C=(.67,.33,0), D=(.66,0,.34), A=(0,0,1)). No numeric mismatch found. The only numeric-adjacent errors are the derived px values in `preamble.md:217` (S3) and the count errors in S4/S8.

### KaTeX claim — independently re-run

I installed `katex@0.16.11` in `/private/var/folders/9s/z_0b7_qj3zx7f42k6yqtkhjm0000gn/T/` (not in the project), confirmed `require('katex').version === '0.16.11'`, and ran targeted probes:

| construct | result |
|---|---|
| `\checkmark` | **OK** |
| `\boxed{…}` | **OK** |
| `\underbrace{a+b}_{c}` | **OK** |
| `\mathcal{X}` | **OK** |
| frame-21 `cases` block (exact source) | **OK** |
| frame-11 `align*` with `\\[4pt]` (exact source) | **OK in display mode**; **fails in inline mode** ("can be used only in display mode") |
| `\boxed{u(x_M)>p\,u(x_H)>u(x_M)}` | **OK** |
| `\chi` | **OK** (renders χ — the silent-error risk is real) |
| `\text{Violation of independence} \;\Longrightarrow\; \text{no expected-utility representation.}` | **OK** |
| `\tag{1}` | OK in display; fails inline |
| `\vline` | **OK** in `array` |
| `\textsc`, `\sfrac`, `\nicefrac`, `\cline`, `\textbackslash`, `\ensuremath`, `\label`, `\intertext` | **fail** (as claimed) |

I also wrote a small extractor over `\begin{document}…\end{document}` that skips comments and `\\[` row skips, then rendered every `$…$`, `\(…\)`, `\[…\]` and `align*` segment: **175 segments, 175 clean**. The preamble's "172 segments / 169 clean / 3 extractor artefacts" is therefore **plausible and substantively correct**; my count differs only because tokenisation differs (the three artefacts it names — L294, L440, L611 — are exactly the `\\[` false positives, which my first naive extractor reproduced). The exact number 172 should not be treated as canonical.

### Beamer/theme/PNG/bibliography checks

- **Paper size:** fetched `beamer.cls` from the beamer sources. L312–315 set `\beamer@paperwidth=12.80cm`, `\beamer@paperheight=9.60cm` regardless of the `12pt` option; the `12pt` option only selects `size12.clo` (L163). The preamble's "128 mm × 96 mm, 4:3, 12pt" is **correct**.
- **Madrid:** fetched `beamerthemeMadrid.sty`; it is `whale` + `orchid` + `rounded` + `infolines`, sets `headline[default]` (no section header) and does **not** redefine `title page`. This confirms the preamble's "no headline" claim and disproves its "logo above/left of the title" claim (S2).
- **Title page:** `beamerinnerthemedefault.sty` L73–90 emits title → author → institute → date → `titlegraphic` at the bottom. Confirmed.
- **PNG:** `file` + `sips` + Pillow: `resources/MIF.png`, 244×244, RGBA, 96 dpi, 90,584 bytes; alpha range 64–255; 59,049 of 59,536 pixels ≥200 alpha. All of the size/format/alpha claims check exactly; I did not independently re-derive the "mean luminance 166" or the colour-bucket counts, which are plausible but not load-bearing. `resources/` contains only `MIF.png`.
- **Bib:** 12 entries (`grep -c '^@'` = 12); keys at L1, 10, 20, 29, 38, 47, 56, 62, 71, 80, 89, 98; `sorting=ynt` order [1]–[12] is 1953, 1954, 1961, 1979, 1981, 1982, 1987, 1989, 1992, 1995, 2000, 2026; volume/number/pages spot-checked against the preamble's full lines (Allais 21(4) 503–546; Bernoulli 22(1) 23–36; Ellsberg 75(4) 643–669; Kahneman 47(2) 263–291; Tversky 1981 211(4481) 453–458; Quiggin 3(4) 323–343; Machina 1(1) 121–154; Gilboa 18(2) 141–153; Tversky 1992 5(4) 297–323; Rabin 68(5) 1281–1292).
- **Blocks:** 13 `block` in frames (14 `\begin{block}` including the one inside the `gameblock` definition at L43), 4 `alertblock` (L149, 204, 388, 429), 9 `gameblock` (L107, 197, 213, 270, 437, 457, 500, 519, 655), 0 `exampleblock`. The preamble's 13/4/9 is correct for frame bodies.
- **Sections:** 8 numbered (L76, 209, 266, 453, 496, 532, 642, 666) + `\section*{References}` (L708). Confirms the 8-entry TOC correction.

### What I could not verify

- No TeX distribution is installed, so I could not compile the PDF: the exact `allowframebreaks` page count, the rendered TOC (though beamer's `.toc` behaviour is standard), and the precise theme tints remain compile-dependent. I verified the theme definitions and computed the hex values instead.
- I did not re-run the builders' 172-segment harness exactly; I ran an independent 175-segment extractor with the same conclusion (all clean).
- I did not modify `slides.tex`, `VUMIF.sty`, `references.bib`, `frames-a.md`, `frames-b.md` or `preamble.md`.
