# Phase 0 — independent review of `PLAN.md` (and `ASSETS.md`)

Reviewer: fresh subagent; did not write `PLAN.md`, `ASSETS.md`, the inventories or the .tex.
Authority: `Microeconomic_analysis__Copy_/slides.tex` (715 lines), `VUMIF.sty`, `references.bib`.
Method: every count re-run with `grep`/`awk`, every number re-derived by hand (EVs, inequalities, probabilities, colour mixes), and the disputed KaTeX claims re-tested locally with KaTeX **0.16.11**.

**Summary:** coverage is complete and most of the transcription is exact, but **both game verdict tables are wrong in one row each, and one Allais inequality is reversed** — the games would tell a player who is violating expected utility that they are consistent. Everything else is fixable text.

---

## A. BRIEF §6 coverage

| # | Required item | Where | Status |
|---|---|---|---|
| 1 | Slide inventory | §1, `PLAN.md:27–63` | **partial** — 29 rows present, but no overlay/notes column; the legend (`:29`) has no `TOC` code, and its `P` ("plain frame") does not match frame 1, which is not `[plain]` (see B) |
| 2 | Preamble → KaTeX macros | §2, `PLAN.md:67–114` | present (macro, packages, unsupported list, typography); omits the four inert `\renewcommand`s at `slides.tex:7–10` (harmless, but "defines exactly one macro" at `PLAN.md:71` is literally false) |
| 3 | Concepts/paradoxes, exact formulas + frames | §3, `PLAN.md:118–171` | present and almost all exact (see C) |
| 4 | Figures + conversion plan | §4, `PLAN.md:175–185` | present |
| 5 | Game mapping + exact numbers + Try-it placement + **2 games first** | §5, `PLAN.md:189–255`; recommendation §5.3 `:246–251` | present; numbers exact, but the verdict logic is wrong (C) and §9 games with no numeric basis are silently dropped |
| 6 | Subagent plan for Phase 1 | §6, `PLAN.md:259–278` | present, but the file/merge contract cannot deliver the Try-it placement (F) |
| 7 | Risks and questions | §7, `PLAN.md:282–309` | present (R1–R9, Q1–Q10) |

**Required by the brief and still absent**

1. **Where the QR slide goes.** D6 (`PLAN.md:19`) and D7 (`:20`) assert "1 final QR slide" and "35", but never say whether it comes **after frame 29 (References)**, after frame 26 (Thank-you), or **replaces** the Thank-you frame. `notes/phase0/review.md:261` raised exactly this and it is still unresolved. The slide total depends on the answer (34 vs 35 vs 36).
2. **Why the other five §9 games were rejected.** Brief §6.5 asks for "the game from §9 that fits (or a better idea)"; `PLAN.md:193–199` picks five and never states that Bounty Board, Armor or Vitality, Deep Mine, Two Quest Contracts and Hit Chance have no numeric basis in the deck (the point `review.md:259` asked for). This is a partial, not a hard miss.
3. **Overlays as an inventory field.** Brief §6.1 lists "overlays … notes" among "contains". They appear only in prose in the last column (`PLAN.md:42` "2 fragment steps", `:49` "1 fragment"), not as codes, and there is no "notes" entry at all (correctly zero, but the legend does not carry the column).
4. Minor wording bug: D6 calls frames 8/10/17/19 the "explaining slide" of each paradox; they are the **stating** slides (explanations are 9, 11, 18; framing's own resolution is 19→20). The placement is defensible, the justification sentence is not.

---

## B. Frame inventory accuracy

**Rows.** `PLAN.md:33–61` contains **exactly 29 rows numbered 1–29 in order, no duplicates, no gaps** (verified by extracting the leading `| n` cells). Titles 1 and 26 are correctly marked as having no title argument.

**Titles vs `\begin{frame}{…}`.** All 29 match word-for-word. `\&`→`&` and `--`→`--` are fine. One alteration:

- **Frame 11, `PLAN.md:43`:** `| 11 | Why \`A≻B\` and \`C≻D\` is inconsistent |` — the source (`slides.tex:289`) is `\begin{frame}{Why $A\succ B$ and $C\succ D$ is inconsistent}`. Words are identical but the **math has been replaced by Unicode `≻` inside a code span**, so a Phase 1 builder copying this cell gets no `$…$` and the title is no longer "exact". Should be `Why $A\succ B$ and $C\succ D$ is inconsistent` (or state explicitly that the Unicode form is intended).

**Section column** (8 numbered sections at L76, 209, 266, 453, 496, 532, 642, 666; `\section*{References}` L708):

| frames | PLAN section | source | verdict |
|---|---|---|---|
| 1–2 | — | before L76 | correct |
| 3–7 | Expected utility | L76 "Expected utility: the benchmark" | correct (abbreviated name only) |
| 8–9 | St. Petersburg | L209 | correct |
| 10–16 | Allais | L266 | correct — frame 16 is the corrected case (`review.md` MF3) |
| 17–18 | Ellsberg | L453 | correct |
| 19–20 | Framing | L496 | correct |
| 21–24 | Explaining | L532 | correct |
| 25–26 | Conclusion | L642 | correct |
| 27–28 | Appendix | L666 | correct |
| 29 | `\section*` | L708 | correct |

**"Contains" codes.** All correct except:

- **Frame 23 (`PLAN.md:55`) is labelled `T, I`. It has no itemize.** `slides.tex:603–619` is `\begin{center}` + the fixed-width `tabular` + `\end{center}`, nothing else. Material: a builder would insert an empty list or invent bullets. Must be `T`.
- Frame 2 is coded `TOC`, which the legend (`PLAN.md:29`) does not define, and `T` already means *table*, so `TOC` reads as a table code. Frame 1 is coded `P` = "plain frame", but it is **not** `[plain]` (only frame 26 is, L661 — `review.md` S9); frame 1 is an ordinary title frame.
- Frames 7 and 24 carry `M` on the strength of inline math only, while frames 10, 16, 19, 20 and 22 (also inline-only) carry none. Cosmetic, but it should be one rule or the other.

**Totals line (`PLAN.md:63`) — every count verified, all correct:**

| claim | check |
|---|---|
| 29/29 frames, 29 `\end{frame}` | `grep -c` = 29 / 29 ✔ |
| 3 `\pause` at L276, L283, L473 | ✔ (frame 10 ×2, frame 17 ×1) |
| 0 `\note{}` | `grep -c '\\note'` = 0 ✔ |
| 6 tables | L240, 461, 580, 607, 629, 692 ✔ |
| 3 TikZ pictures | L310, 548, 561 ✔ |
| 1 raster | L59 only ✔ |
| 26 display constructs = 23 `\[…\]` + 3 `align*` | `\]` count = 23; `align*` at L292/482/699 ✔ |
| 12 bib entries | `grep -c '^@'` = 12 ✔ |

---

## C. Numbers and formulas

### C.1 §3 — spot-checked against the .tex

| PLAN | value | source | verdict |
|---|---|---|---|
| Lottery def. | `p_i≥0, Σp_i=1, x_i∈𝒳` | L82–84 | exact |
| Minecraft EV | `(2+2+3+4)/5 = 2.2`; 2/5,1/5,1/5,1/5 | L110–111 | exact |
| EU / VNM | `EU(L)=Σp_iu(x_i)`; `L⪰M ⟺ EU(L)≥EU(M)`; `0<α<1` (frame 5) vs `α>0` (frame 6) | L129, L134–136, L151, L171 | exact, inconsistency correctly flagged |
| Dungeon | 500 sure vs 0/1200 50–50 | L198 | exact |
| St. Petersburg | `Pr(k)=2^{-k}`, `2^k`, `1+1+…=∞` | L217–218 | exact |
| WTP | 5–20 emeralds | L222 | exact |
| Bernoulli eq. | `Σ2^{-k}ln(w+2^k−p)=ln w` | L234 | exact |
| Table | 10→4.97, 100→7.79, 1 000→10.95, 1 000 000→20.87 | L244–247 | exact |
| Bankroll | `B=2^n`, `E=n+1`, `2^20≈10^6→21`, `2^30≈10^9→31`, `K=200` | L674, L679, L681 | exact |
| Allais lotteries | A 2400 sure; B 2500/.33, 2400/.66, 0/.01; C 2500/.33, 0/.67; D 2400/.34, 0/.66 | L273–274, L279–280 | exact |
| Frequencies | 82% A, 83% C | L285 | exact |
| Inequalities | `0.34u(2400)>0.33u(2500)`; `0.33u(2500)>0.34u(2400)` | L294–295 | exact |
| Triangle | A(0,0), B(.01,.33), C(.67,.33), D(.66,0); slope 2.5 | L322–325, L319 | exact |
| Generalized | `P_A=δ_{x_M}`, `P_B=pδ_H+(1−p)δ_0`, `P_C=qδ_M+(1−q)δ_0`, `P_D=pqδ_H+(1−pq)δ_0`; `u(x_M)>pu(x_H)>u(x_M)` | L400–403, L425 | exact |
| Common ratio | 40/30/0, p=.8, q=.25, .20; the four lotteries | L439–446 | exact |
| Frame 22 V | 943.2 / 806.5 / 326.7 / 320.1 and 19.9 / 15.6 / 5.8 / 6.7 | L584–592 | exact |
| Ellsberg | 90 / 30 / 60 / 100; bets I–IV | L457–469 | exact |
| Beliefs | `π_R=1/3`, `π_E+π_S=2/3`; `I≻II⇔π_R>π_E`; `IV≻III⇔π_E>π_R` | L481, L483–484 | exact |
| Framing | 600 / 200 [72%] / 400 [22%] / 1/3,2/3 [28%,78%] | L500–510 | exact |
| Loss aversion | 1 000/1 050, EV +25, Rabin 20 000, `0.5·1050−0.5·2.25·1000 = −600` | L520–527 | exact (−600 confirmed: 525−1125) |
| Prospect theory | `v` cases, `w(p)=p^γ/(p^γ+(1−p)^γ)^{1/γ}`, α=β=.88, λ=2.25, γ=.61 | L539–544 | exact; correctly called Tversky–Kahneman (1992), not Prelec |
| `w(p)` row | .055/.261/.291/.334/.339/.509/.607/.912 for .01/.20/.25/.33/.34/.66/.80/.99 | L694–695 | exact |
| Certainty effect | `w(1)=1`, `w(.66)+w(.33)=0.84` | L598 | exact (.509+.334=.843) |

### C.2 §5.2 — Allais EVs recomputed

| option | PLAN | recomputation | verdict |
|---|---|---|---|
| A | 2 400 | 1.00·2400 | ✔ |
| B | 2 409 | .33·2500 + .66·2400 + .01·0 = 825+1584 = **2409** | ✔ |
| C | 825 | .33·2500 | ✔ |
| D | 816 | .34·2400 | ✔ |
| P(worst) A/B/C/D | 0 / .01 / .67 / .66 | ✔ (note: for A, "P(worst)" must be *defined* as P(payoff = 0); as "P(got the worst outcome)" it is 1) | ✔ |

### C.3 §5.2 — Allais verdict table (`PLAN.md:218–223`) — **one verdict wrong, one inequality reversed**

Source algebra (`slides.tex:293–295`):

- `A≻B ⟺ u(2400) > .33u(2500)+.66u(2400) ⟺ .34u(2400) > .33u(2500)`
- `C≻D ⟺ .33u(2500) > .34u(2400)`
- therefore `D≻C ⟺ .34u(2400) > .33u(2500)` and `B≻A ⟺ .33u(2500) > .34u(2400)`

| row | PLAN's verdict | correct verdict | PLAN's inequality | correct inequality |
|---|---|---|---|---|
| A+C | **No** ✔ | No | both directions quoted ✔ | ✔ |
| A+D | Yes ✔ | Yes | `0.34u(2400) < 0.33u(2500)` ✘ | `0.34u(2400) > 0.33u(2500)` (both A≻B and D≻C give the *same* inequality) |
| B+C | Yes ✔ | Yes | "same inequality as above" — after fixing A+D this pointer becomes wrong ✘ | `0.33u(2500) > 0.34u(2400)` |
| B+D | **Yes** ✘ | **No** | `0.34u(2400) < 0.33u(2500)` only | B≻A gives `0.33u(2500) > 0.34u(2400)`, D≻C gives `0.34u(2400) > 0.33u(2500)` ⇒ `⊥` |

Sanity check with linear `u`: B=2409 > A=2400 and C=825 > D=816, i.e. **B+C** is the risk-neutral pattern. With `u=√x`: A=48.99 > 0.33·50+0.66·48.99 → A≻B, and D≻C, i.e. **A+D** holds. Both consistent; **B+D is impossible for any `u`**, because it requires `u(2500)/u(2400)` to be simultaneously `>34/33` and `<34/33`.

### C.4 §5.2 — Ellsberg verdict table (`PLAN.md:233–238`) — **one verdict wrong**

Winning probabilities: I = π_R; II = π_E; III = π_R+π_S = 1−π_E; IV = π_E+π_S = 2/3. With L483–484:

| row | PLAN | correct | why |
|---|---|---|---|
| I+IV | **No** ✔ | No | π_R>π_E and π_E>π_R ⇒ ⊥ (classic Ellsberg) |
| I+III | Yes ✔ | Yes | I≻II gives π_R>π_E; III≻IV gives (π_R+π_S)>(π_E+π_S) ⇔ π_R>π_E — same |
| II+IV | Yes ✔ | Yes | II≻I gives π_E>π_R; IV≻III gives π_E>π_R — same |
| II+III | **Yes** ✘ | **No** | II≻I gives π_E>π_R; III≻IV gives π_R>π_E ⇒ `⊥`. PLAN quotes only `π_E > π_R` and misses the second inequality |

So in both games the plan treats only the textbook pattern as the violation and lets its **mirror image** through. This is the single most damaging class of error in the document: brief §8.6 requires the panel to say whether *any* utility function could produce the pattern, and R5 promises the Phase 2 reviewer will "recompute every EV and verdict" — but a reviewer working from this table would confirm the wrong answer.

### C.5 §2.2 palette — one wrong hex

`PLAN.md:95`: `` | TikZ `red` / `gray!70` | `#FF0000` / `#595959` | ``.
`#595959` is what you get by mixing 70 % gray with **30 % black**. xcolor's `gray!70` mixes with **white**: 0.7·127.5 + 0.3·255 = **165.75 → `#A6A6A6`**. The same colour table (`notes/phase0/preamble.md:73`) derives `blue!80!white` = `#356D99` with exactly that white-mix rule, so the gray row contradicts its own table. The triangle's dashed parallels would be planned ~2× too dark. (`notes/phase0/preamble.md:95` copies the same value, so this is a shared error, but PLAN is the authority.)

Everything else in §2 checks out: `\X` = `\mathcal{X}` (`slides.tex:44`, used nowhere — `grep` confirms 1 hit, the definition); `\checkmark`, `\boxed`, `\bot`, `\tfrac`, `align*`, `cases`, `\\[4pt]`, `aligned` native; `gameblock` correctly identified as an environment, not a macro; macro-copy-per-render advice correct; 12 pt ≈ 42 px at 1 cm = 100 px ✔; 34·0.78 = 26.5 px ✔ consistent with "nothing below 26 px".

---

## D. Internal consistency

- **8 TOC entries** — `PLAN.md:34` "8 numbered sections (References is starred, excluded)" ✔ matches `review.md:20–31`.
- **Frame 10 = 2 fragments** — `PLAN.md:42` "2 fragment steps" and `PLAN.md:276` "fragments (frames 10 and 17 only)" ✔ matches `review.md` MF2 and the corrected `frames-a.md:29`.
- **`align*` native** — `PLAN.md:80` ✔ matches `review.md` MF4.
- **Tversky–Kahneman (1992), not Prelec** — `PLAN.md:169` ✔ matches `review.md` MF5.
- **`\vline` unsupported** — `PLAN.md:108` says unsupported. I re-tested KaTeX 0.16.11: `a\vline b` and `\begin{array}{c} a \vline b \end{array}` both throw *"Undefined control sequence: \vline"*, while `{c|c}` parses. So **PLAN and `preamble.md:231` are right and `review.md:354` (S5) is wrong**; nothing to change in PLAN, but `review.md` still contains the false claim and should not be quoted in Phase 1.
- **No contradiction with `review.md`'s "Missing for PLAN.md" list** except item 3 (QR placement, still missing — MF5 below) and item 1's "which §9 games have no numeric basis" (A.2 above).

**Is 35 the right web-slide count?** Arithmetic: 29 + 4 Try-it + 1 QR + 1 extra References page = **35** ✔ — but three assumptions are unstated and two are unverified:

1. the "+1 References" assumes `allowframebreaks` (`slides.tex:710`) yields **exactly 2** pages. Nobody has compiled the PDF; `frames-b.md:472` itself says "2 slides, possibly 3". If 3 → 36.
2. the "+1 QR" assumes it is *added* after frame 29. If it replaces the Thank-you frame (`slides.tex:661`) → 34.
3. `PLAN.md:21` states "The PDF already paginates it via `allowframebreaks`" as fact. The source only *permits* breaking; the count is derived, not observed.

**Invented values.** Marked: Allais ×1/1000 display-unit rescale (`PLAN.md:214`) and StP starting wealth 100 (`:242`). No other *number* in §5 is invented — Ellsberg 90/30/60/100 and framing 200/400/72/28/22/78 all come from the slides. Two un-marked non-numeric inventions: the "20-second 'weigh the cargo' interlude" (`:205`), the "decrypt the manifest" step (`:227`), the game names and the "caps/eddies/crowns" skins — all clearly design, not data, so acceptable; worth one line in `CONVERSION_NOTES` rather than a must-fix.

**§8 acceptance over-claims.** `PLAN.md:316` "35 numeric spot-checks, 0 mismatches (independent reviewer)". True for the 35 values that were checked, but it is now read as "the numbers are verified". The three errors in C.3/C.4 are *derived* numbers that no reviewer checked, and R5 assumes Phase 2 will catch them. Reword to "35 transcribed values, 0 mismatches; derived game verdicts re-derivable".

---

## E. Asset manifest

**Key cross-check.** `PLAN.md` §5 names **no sprite/background/card keys at all** — the only asset paths in the whole plan are `docs/assets/ui/mif.png` (`:179`) and `docs/assets/figures/*.svg` (`:269`). So:

- Keys named in PLAN §5 that are missing from ASSETS: **none** — because §5 names none.
- Keys in ASSETS that PLAN never references: **all 45** unique keys (58 rows, 45 unique; 12 keys are repeated across the minimum-set and per-game tables, `icon_caps` three times).
- At **game level** the mapping is complete and exact: Caravan Lockboxes / Fixer's Crate / Doubling Contract / Jarl's Orders / Hardcore Run appear under the same names (`PLAN.md:195–199` vs `ASSETS.md:82, 96, 110, 123, 137`).
- The one genuine path mismatch: PLAN says the logo goes to `docs/assets/ui/mif.png`, while ASSETS' convention (`ASSETS.md:38`, "omit `file` → `assets/<kind>/<key>.png`") would place key `ui_mif` at `assets/ui/ui_mif.png`. Pin the `file` string in the manifest.

**Sizes/formats.** Coherent overall: background 1280×720 = the reveal canvas; card 640×360 = exactly ½ and 16:9 (readable at 160 px = 4× downscale); portrait 256×256 = 8× the 32 grid. Two defects:

1. **`ASSETS.md:13` vs `:166`.** Line 13: sprite canvas **64 × 64**, art on a 32 × 32 grid (each art pixel 2 × 2). Line 166: "I generate **32 × 32** pixel sprites with Pillow". The brief (§8:157) also says 32×32 PNGs. Pick one: the 32×32 native route is the only one where "64 or 96 CSS px" is meaningful, and it is the brief's own spec.
2. **`ASSETS.md:13` "displayed at 64 or 96 CSS px".** 96/64 = 1.5×, a non-integer scale, which contradicts brief §8 "rendered at integer scales" and will produce uneven pixels. Use 64/128 (or 96/192 on a 32×32 source).

**Is the "minimum set" (10 files) sufficient for the Allais game as described?** Missing:

| what the game does | art needed | in the set? |
|---|---|---|
| scene | `allais_bg`, `allais_trader`, `allais_raider` | ✔ |
| 2 rounds × 2 cards | `allais_chest_a…d`, `icon_caps` | ✔ |
| lock-in, hub card | `hub_allais` | ✔ |
| resolve: "animated draw (chest opening…)" (brief §8.4, `PLAN.md:255`) | a **resolved/open** state per chest — none exists; the animation has no final frame | ✘ |
| reveal: "reuse [the triangle] inside the Allais game reveal" (`PLAN.md:180`) | the triangle is planned as **inline SVG in `deck.html`** and is not a manifest key, so `play.html` cannot reuse it | ✘ |
| simulation ×1000 | canvas only | ✔ (no art) |

Also, the full manifest has **4 `hub_*` cards for 5 games** — the optional fifth game (The Hardcore Run, `ASSETS.md:137–143`) has a background (`loss_bg`) and two sprites but no card, contrary to §1's own "card (hub thumbnail)" rule and to every other game. And `ASSETS.md:158` promises `python3 tools/check_assets.py` ("Added in Phase 1") that no Phase 1 subagent owns (see F).

---

## F. Phase 1 subagent plan

**File assignments.** `PLAN.md:263–270`: S1 `part-1.html`, S2 `part-2.html`, S3 `part-3.html`, S4 `part-4.html`, S5 `tools/make_figures.py` + `docs/assets/figures/*.svg`, S6 `part-5.html` + `tryit.js`. No two builders write the same path ✔, and none writes a coordinator file (`deck.html`, `config.js`, `theme.css`, `deck.css`) ✔.

Two ownership problems:

1. **The Try-it slides cannot be delivered by `part-5.html` + concatenation.** The four slides must sit before frames 8, 10, 17 and 19 (`PLAN.md:19, 304`) — i.e. *inside* `part-1.html` (before 8), `part-2.html` (before 10) and `part-3.html` (before both 17 and 19). `PLAN.md:272` "I concatenate part-1…5 into `docs/deck.html`" would place all four after frame 29. Needs an explicit insertion contract (markers such as `<!-- tryit:stp -->` written by S1–S3, replaced by the coordinator; or S6 owns four fragment files with fixed slot names).
2. **The triangle SVG has two owners.** S5 writes it (`PLAN.md:269`, "triangle SVG handed to S2 as a snippet"); S2 inlines it into `part-2.html`. That is a dependency, not a path clash, but the hand-off format (raw `<svg>` string vs file) is unspecified, and `PLAN.md:180` also wants the same SVG inside the game — a third copy.

**Frame ranges.** 1–8, 9–15, 16–22, 23–29 = 8+7+7+7 = **29, each frame exactly once, no gaps, no overlaps** ✔.

**Reviewers.** Both are declared fresh ("did not build", `PLAN.md:274`) ✔ and are independent of the builders ✔. Coverage of brief §7's done-criteria (`BRIEF.md:139`):

| criterion | covered? |
|---|---|
| every frame present | only in "Done when" (`:278`), not assigned to either reviewer — add a count check |
| fragments step correctly | ✔ layout reviewer (`:276`) |
| 0 `.katex-error` | ✔ |
| no horizontal scroll at 375 px | ✔ (and 1280) |
| speaker view shows notes | **cannot pass**: D9 (`:22`) leaves notes empty. Change the check to "`S` opens, note panes render empty", or write notes |
| works offline | ✔ (`file://`, airplane mode) |
| (add) 0 console errors, QR resolves | ✔ both present |

Not assigned anywhere: who applies reviewer fixes and who re-checks them (brief §2.4). `PLAN.md:272` only says "delete nothing until the reviewer signs off".

---

## Verdict

**PASS WITH FIXES** — 8 must-fixes, all local edits; the plan's architecture, inventory and transcribed numbers are sound.

### Must-fix

1. **`PLAN.md:223` — Allais "B + D" is marked EU-consistent; it is a contradiction.**
   Wrong: `| B | D | Yes | 0.34u(2400) < 0.33u(2500); consistent. |`
   Correction: `| B | D | **No** — mirror of A+C | B≻A ⇔ 0.33u(2500) > 0.34u(2400) and D≻C ⇔ 0.34u(2400) > 0.33u(2500) ⇒ ⊥ |`

2. **`PLAN.md:238` — Ellsberg "II + III" is marked EU-consistent; it is a contradiction.**
   Wrong: `| II | III | Yes | π_E > π_R. |`
   Correction: `| II | III | **No** — mirror of I+IV | II≻I ⇔ π_E > π_R and III≻IV ⇔ π_R > π_E ⇒ ⊥ |`

3. **`PLAN.md:221–222` — reversed inequality, and a pointer that breaks once it is fixed.**
   Wrong (`:221`): `| A | D | Yes (risk averse) | 0.34u(2400) < 0.33u(2500); consistent with concave u. |`
   Correction: `| A | D | Yes (risk averse) | 0.34u(2400) > 0.33u(2500) — the same inequality as A≻B; concave u can satisfy it |`
   Wrong (`:222`): `| B | C | Yes | same inequality as above; risk-neutral-ish. |`
   Correction: `| B | C | Yes | 0.33u(2500) > 0.34u(2400); consistent with near-linear u (linear u gives EV(B)=2409>2400, EV(C)=825>816) |`

4. **`PLAN.md:55` — frame 23 has no itemize.**
   Wrong: `| 23 | Map of paradoxes and fixes | Explaining | T, I | …`
   Correction: `| 23 | Map of paradoxes and fixes | Explaining | T | …`

5. **`PLAN.md:19–20` — the QR slide's position is never stated, so "35" is not determined.**
   Wrong: `… plus 1 final QR slide` / `Web count: 35 (29 original + 4 try-it + 1 QR + 1 extra References page)`.
   Correction: state the order explicitly, e.g. `… + 1 QR slide appended after References (frame 29), keeping the Thank-you frame 26 in place`. If it replaces frame 26, the total is 34; if References needs 3 pages, 36. Also log that the References page count is an estimate (`allowframebreaks`, uncompiled).

6. **`PLAN.md:270, 272` — `part-5.html` + concatenation cannot put the Try-it slides before frames 8/10/17/19.**
   Wrong: `| S6 try-it + QR | notes/phase1/part-5.html … | 4 try-it slides …` and `I concatenate part-1…5 into docs/deck.html`.
   Correction: define slots — S1–S3 write `<!-- tryit:stp -->` before frame 8, `<!-- tryit:allais -->` before frame 10, `<!-- tryit:ellsberg -->` before 17, `<!-- tryit:framing -->` before 19; S6 produces `notes/phase1/tryit-<id>.html`; the coordinator substitutes the four slots during the merge.

7. **`ASSETS.md:13` vs `ASSETS.md:166` — the sprite canvas is specified twice, differently, and 96 px is a non-integer scale.**
   Wrong (`:13`): `**64 × 64 px**, art drawn on a 32 × 32 grid (each art pixel = 2 × 2) … displayed at 64 or 96 CSS px`.
   Wrong (`:166`): `I generate 32 × 32 pixel sprites with Pillow`.
   Correction: pick one canvas (the brief says 32 × 32 → use **32 × 32 sprites, integer display 64 or 128 px**; drop the 64-canvas-with-2×2-pixels wording and the 96 px option). If the 64 canvas is kept, delete `:166`'s "32 × 32" and change 96 → 128.

8. **`PLAN.md:95` — wrong hex for `gray!70`.**
   Wrong: `` | TikZ `red` / `gray!70` | `#FF0000` / `#595959` | ``
   Correction: `#FF0000` / **`#A6A6A6`** (xcolor `gray!70` = 70 % gray + 30 % white = 0.65·255; `#595959` = 0.35·255 is 70 % gray mixed with *black*, which is not what `gray!70` means). Same error in `preamble.md:95`.

### Should-fix

1. `PLAN.md:43` — frame 11's title math is a Unicode `≻` inside backticks; restore `$A\succ B$` / `$C\succ D$` or say the Unicode form is deliberate.
2. `PLAN.md:29, 34` — the legend has no `TOC` code (add one, or reuse `P` only for untitled/plain frames) and `T` already means *table*; stop coding frame 1 as `P` ("plain frame"), since only frame 26 is `[plain]` (`slides.tex:661`).
3. `PLAN.md:56` (and `:39`) — frames 7 and 24 are the only inline-math-only frames given `M`, while 10, 16, 19, 20 and 22 (also inline-only) get none. Either `M` means "math anywhere" (then add it to 10, 16, 19, 20, 22) or "display math" (then drop it from 7 and 24) — say which.
4. `PLAN.md:248` — "four-option verdict matrix" is wrong (it is 2 rounds × 2 options = 4 *patterns*); also "risk-neutral-ish" for B+C is fine but state the linear-u check (EV 2409 vs 2400, 825 vs 816).
5. `PLAN.md:19` — St. Petersburg's Try-it is placed *before* frame 8, which is the slide that first explains the coin rule; the game's own "Slide 8/9/27" reveal references then point forward. Consider between 8 and 9 (before the explaining slide, after the setup), and fix the "explaining slide" wording.
6. `PLAN.md:242` vs `:255` — StP says ×10 000 (brief §9) while the engine contract says ×1000 (brief §8). Either is fine, but say which applies where.
7. `PLAN.md:276, 278` — the layout reviewer cannot verify "speaker view shows notes" while D9 leaves notes empty; amend the criterion or the decision.
8. `PLAN.md:316` — reword "35 numeric spot-checks, 0 mismatches" so it does not imply the *derived* game verdicts were checked (they were not; three of them are wrong).
9. `PLAN.md:191–255` — §5 names no asset keys. Either name them (so ASSETS.md can be audited key-by-key) or state that ASSETS.md is the single registry and add one sentence mapping game id → key prefix.
10. `ASSETS.md:137–143` — the optional fifth game has no `hub_hardcore` card, contrary to §1/§2; add it or drop the game.
11. `ASSETS.md:158` — `tools/check_assets.py` has no Phase 1 owner; add it to S5 or to the coordinator's list (`PLAN.md:261`).
12. `ASSETS.md:14` — the `portrait` kind (256×256) is defined but used by no key; mark it "future" or delete.
13. `PLAN.md:265` — "§2.1–3.2 sections" is a stale reference; the range is title, TOC, Expected utility, St. Petersburg.
14. `PLAN.md:71` — "defines exactly one macro and one environment" ignores the four inert `\renewcommand`s (`slides.tex:7–10`); add one clause so a Phase 1 builder does not port them.

---

**Verdict: PASS WITH FIXES. Must-fix count: 8.**
**Most serious problem:** both game verdict tables mark one EU-inconsistent choice pattern as consistent (Allais **B+D**, `PLAN.md:223`; Ellsberg **II+III**, `PLAN.md:238`), so the Phase 2/3 "You vs. expected utility" panel would tell a player who violates independence that no violation occurred — and the plan's R5 ("Phase 2 reviewer recomputes every verdict") cannot catch it, because the reviewer would check against the same wrong table.

---

## Fix round — re-check

Re-verified against the current files (2026-10-28). Re-derivations below are mine, from the source, not from the plan.

**Allais (slides.tex:293–295).** `A≻B ⇔ u(2400) > .33u(2500)+.66u(2400) ⇔ .34u(2400) > .33u(2500)`; `C≻D ⇔ .33u(2500) > .34u(2400)`; hence `D≻C ⇔ .34u(2400) > .33u(2500)` and `B≻A ⇔ .33u(2500) > .34u(2400)`. So **A+C ⊥** and **B+D ⊥**; A+D and B+C are each a single consistent inequality. `PLAN.md:224–227` now matches this exactly (including the EV check 2 409 > 2 400 and 825 > 816), and `:229` "two of the four, mirror images" is true.

**Ellsberg (slides.tex:481–484).** `I≻II ⇔ π_R>π_E`; `IV≻III ⇔ π_E>π_R`; `III≻IV ⇔ π_R>π_E`; `II≻I ⇔ π_E>π_R`. So **I+IV ⊥** and **II+III ⊥**; I+III and II+IV consistent. `PLAN.md:241–244` matches.

**Slide arithmetic.** 29 originals (References = 1 page) + 4 try-it + 1 QR + 1 extra References page = **35**; with References at 3 pages: 28 + 3 + 4 + 1 = **36**. `PLAN.md:20` and `:290` state this correctly.

| # | Finding | Status | Evidence | Residual problem |
|---|---|---|---|---|
| M1 | Allais B+D must be "No" | **fixed** | `PLAN.md:227` | none |
| M2 | Ellsberg II+III must be "No" | **fixed** | `PLAN.md:244` | none |
| M3 | A+D `>`, B+C own inequality | **fixed** | `PLAN.md:225–226` | none |
| M4 | Frame 23 contains `T` only | **fixed as asked** | `PLAN.md:55` | now clashes with the new `M` definition (R3) |
| M5 | QR position explicit, 35/36 consistent | **fixed** | `PLAN.md:20` (order + 36 fallback), `:290` | Q5 `:316` still says only "n / 35"; §8 states no count (not a contradiction) |
| M6 | Try-it slot contract | **fixed** | markers `PLAN.md:273–275`; files + contract `:278–280`; merge `:282` | none — four slides now land before 8/10/17/19; `part-5.html` gone |
| M7 | One sprite spec, integer scales | **fixed** | `ASSETS.md:13` (32×32 native, 64/128, integer), all per-game rows 32×32, `:171` | `ASSETS.md:32` config sample still `w: 64, h: 64` — ambiguous for a 32 px asset (R7) |
| M8 | `gray!70` = `#A6A6A6` | **partially** | `PLAN.md:95` correct | `PLAN.md:185` still fixes the figures to `#595959` — the same must-fix survives one section later (R1) |
| S1 | Frame 11 title math | **fixed** | `PLAN.md:43` `Why $A\succ B$ and $C\succ D$ is inconsistent` | none |
| S2 | Legend defines every code | **fixed** | `PLAN.md:29` (M/I/B/A/G/T/C/F/TP/TOC/P/S) | frame 29's cell is the word `bibliography` (`:61`), not a legend code (nit) |
| S3 | Consistent `M` coding | **partially** | legend now says "display **or inline**" (`:29`) | M missing on frames **12, 16, 20, 22, 23**, all of which contain inline math (R3) |
| S4 | "four-option" / linear-u check | **fixed** | `PLAN.md:256` "four pattern outcomes"; `:226` EV check added | none |
| S5 | StP try-it placement/wording | **fixed (wording)** | `PLAN.md:19` "the slide that *states*"; `:197` unchanged placement | placement before frame 8 retained by choice — acceptable, no longer mislabelled |
| S6 | ×10 000 vs ×1000 | **fixed** | `PLAN.md:250` override explained | none |
| S7 | Speaker-view criterion | **fixed** | `PLAN.md:286` "S opens; note panes empty by design, D9" | none |
| S8 | §8 over-claim | **partially** | `PLAN.md:328` splits transcribed values from verdicts | "**all four** game verdict patterns" — there are eight (four per game) (R4) |
| S9 | Asset keys in §5 | **fixed** | `PLAN.md:203` prefix rule | list omits `badge_*`, which ASSETS defines 4× (R8) |
| S10 | `hub_hardcore` card | **fixed** | `ASSETS.md:145` | none |
| S11 | `check_assets.py` ownership | **fixed** | `ASSETS.md:163` + `PLAN.md:277` (S5) | none |
| S12 | `ui_mif` path pinned | **fixed** | `ASSETS.md:38` = `PLAN.md:179` | none |
| S13 | `portrait` marked reserved | **fixed** | `ASSETS.md:14` | none |
| S14 | Stale "§2.1–3.2" | **fixed** | `PLAN.md:273` | none |
| S15 | One-macro claim | **fixed** | `PLAN.md:71` (now names the four inert `\renewcommand`s) | none |

### Regression sweep

| # | New/residual problem | Evidence | Severity |
|---|---|---|---|
| R1 | `#595959` still prescribed for the figures, contradicting `#A6A6A6` two sections earlier | `PLAN.md:185` vs `:95` | **substantive** — S5 would draw the dashed parallels in the wrong grey |
| R2 | The two plots are "committed SVG files" in PLAN but "generated in code … not image assets and cannot go missing" in ASSETS | `PLAN.md:181–182, 277` vs `ASSETS.md:69` | **substantive** — S5 cannot tell whether to commit `*.svg` or generate at runtime; and a `fetch()` of a local SVG would break `file://` (R2 in PLAN) |
| R3 | `M` code does not follow its own new definition | `PLAN.md:29` vs `:44` (12: `C, F, I`), `:48` (16: `G, I, B`), `:52` (20: `G, I, B`), `:54` (22: `T, I`), `:55` (23: `T`) | minor/cosmetic — fix by defining `M` as *display* math (then drop it from 7/10/19/24) or adding it to those five frames |
| R4 | "all four game verdict patterns" | `PLAN.md:328` | minor — should be "all eight (four per game)" |
| R5 | D8 contradicts itself inside one row: "page count is an estimate (`allowframebreaks` was never compiled)" vs "the PDF already paginates it" | `PLAN.md:21` | minor |
| R6 | Q5 quotes only "n / 35" while D7/§6 now carry the 36 fallback | `PLAN.md:316` vs `:20, 290` | minor |
| R7 | `w: 64, h: 64` in the config sample for a 32×32 sprite; `w`/`h` are never defined as file- or CSS-size | `ASSETS.md:32` | minor — document as display px or set 32 |
| R8 | Prefix list omits `badge_*` (4 keys exist) | `PLAN.md:203` vs `ASSETS.md:80–83` | minor |
| R9 | "*The Bounty Board* (no CE/CRRA measurement)" is too strong: the deck does give a money equivalent under `u=ln x` (the max buying price 4.97/7.79/10.95/20.87 at four wealth levels, `slides.tex:244–247`); what is genuinely absent is a defined gamble's CE, a risk premium and CRRA ρ. Also "four paradoxes" ignores the deck's own fifth row (small-bet risk aversion, `slides.tex:615`), which is why the optional 5th game exists | `PLAN.md:205` | minor — the five named games are the right five |
| R10 | Frame 29's content type is the word `bibliography`, absent from the legend | `PLAN.md:61` vs `:29` | nit |
| R11 | R5's new safety net is a "brute-force grid of utility functions"; sampling `u` can confirm consistency but cannot prove inconsistency — the contradiction must be asserted from the inequality system (as §5.2 already does) | `PLAN.md:304` | nit |

**Nothing else regressed.** §3's formulas, the frame inventory (29 rows, sections, totals at `:63`), the `\vline`/`align*`/Tversky–Kahneman positions and the 8-section TOC are unchanged and still correct. The "five rejected §9 games" paragraph names exactly the right five (*Bounty Board, Armor or Vitality, Deep Mine, Two Quest Contracts, Hit Chance*), and *Plague in the Village* is correctly accounted for as the game replaced by *The Jarl's Orders*. No Try-it sentence says "explains" any more: D6 (`:19`) and Q5 (`:316`) both say "states"/"before frames …"; the only "explain" left is the frame-18 title.

Verdict: REMAINING: 11 (2 substantive — R1, R2; 9 minor/cosmetic — R3–R11)

---

## Final residual check

1. **`#595959`** — resolved: zero occurrences in both files; `#A6A6A6` at `PLAN.md:95` and `:187`.
2. **Figures split** — resolved: triangle = `Figures.triangleSVG()` injected into deck + Allais reveal (`PLAN.md:180, 187`); plots = committed SVGs from `tools/make_figures.py`, loaded with `<img>` (`PLAN.md:181–182, 187`); `ASSETS.md:69` states the same split.
3. **`M` rule** — resolved: `M` on all 24 frames that contain any math (3–24, 27, 28); absent only from 1, 2, 25, 26, 29, which have none — one consistent rule under the legend's "display or inline".
4. **§8** — resolved: "all eight game verdict patterns … (four per game)" (`PLAN.md:330`).
5. **D8** — resolved: page count is labelled an estimate (`PLAN.md:21`), no longer asserted as observed; "the PDF paginates it too" now reads as the effect of `allowframebreaks` (a source directive), not a compiled count.
6. **Q5** — resolved: "n / 35 (36 if References paginates to 3)" (`PLAN.md:318`).
7. **Config sample** — resolved: `w: 32, h: 32` (`ASSETS.md:32`).
8. **Prefix list** — resolved: `badge_*` included (`PLAN.md:205`).
9. **Bounty Board** — resolved: "no CRRA coefficient or risk-premium measurement — only the log-utility WTP table" (`PLAN.md:207`).
10. **Frame 29 code** — resolved: `BIB`, defined in the legend (`PLAN.md:29, 61`).
11. **R5 test** — resolved: inequalities derived symbolically; the utility grid is only a sanity-check on the "consistent" rows (`PLAN.md:306`).

**No regression in the game verdict tables** — Allais A+C No / A+D Yes / B+C Yes / B+D No (`PLAN.md:226–229`), Ellsberg I+IV No / I+III Yes / II+IV Yes / II+III No (`PLAN.md:243–246`), all still match `slides.tex:293–295` and `:481–484`. **Inventory still 29 rows, numbered 1–29 in order** (`PLAN.md:33–61`), and the totals line at `:63` is unchanged and still correct.

Verdict: CLEAN
