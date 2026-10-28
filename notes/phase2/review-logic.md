# Phase 2 — independent logic/math review

**Reviewer:** fresh reviewer (did not build Phase 2).
**Date:** 2026-10-28, review snapshot ~16:48 local.
**Scope:** `BRIEF.md` §2/§8/§9, `PLAN.md` §5.2 A/§5.4, `NOTES.md`, slides.tex
frames 10–16 and 22, `docs/config.js` (`games.allais`), `docs/js/games/allais.js`,
`docs/js/engine.js`, `docs/js/hub.js`, `docs/js/charts.js`, `docs/js/rng.js`,
`docs/play.html`, `docs/deck.html` (Try-it Allais + frame 12), `docs/js/figures.js`,
`tools/test_allais_verdicts.mjs`.

Product files were **not** edited. This is the only file written.

The builders changed files while this review was running (`config.js` 16:45,
`engine.js` 16:45, `allais.js` 16:47, test 16:47). All findings below were
re-checked against the final snapshot; the A+C benchmark copy and the 100/100
test were re-run last.

---

## 1. Test run

Command, from repo root:

```
node tools/test_allais_verdicts.mjs
```

Result:

```
PASSED  100 of 100 checks.
Consistency order: A + C=No, A + D=Yes, B + C=Yes, B + D=No
```

- The suite tested the **real** `docs/config.js` entry (no fixture NOTE printed).
- The verdict is genuinely derived from the lotteries: `allais.js` builds
  utility-coefficient vectors (`coefficients`), subtracts the non-chosen
  option (`difference`), and classifies the two resulting half-spaces with
  `scalarRelation` (`opposite` / `same`). It never compares an option id to
  `"A"`/`"C"`.
- The renamed-**option**-id cases (`sure_thing`, `raider_route`, `one_trip`,
  `two_trips`) pass: A+C analogue is inconsistent with the same `\bot`
  chain; A+D analogue is consistent with the same shared inequality.
- The new A+C benchmark assertion (`Most people choose like you`) is included
  and passes. A+C remains the only pattern with a benchmark.

**Test gap (nit, see F4):** the renamed-id cases rename option ids only.
`verdict()` still reads `choices.r1` / `choices.r2`, so renaming **round** ids
throws. This is not triggered by the shipped config.

---

## 2. Four-pattern browser matrix

Session: `AGENT_BROWSER_SESSION=phase2-r1`. URL:
`file:///.../docs/play.html?seed=42&fast=1#allais` (fresh cache-busting
`&n=…` per run). Viewports: 375×667 and 1280×800. Reduced motion on for speed;
the same stages were also walked with motion enabled.

| Pattern | Verdict title | Row 1 | Row 2 | Panel algebra | Benchmark | `.katex-error` |
|---|---|---|---|---|---|---|
| A + C | No expected-utility representation | `0.34u(2400) > 0.33u(2500)` | `0.33u(2500) > 0.34u(2400)` | `0.34u(2400) > 0.33u(2500) > 0.34u(2400) ⊥` | 82% A / 83% C + Kahneman & Tversky | 0 |
| A + D | An expected-utility representation exists | `0.34u(2400) > 0.33u(2500)` | same | same inequality (no `⊥`) | none | 0 |
| B + C | An expected-utility representation exists | `0.33u(2500) > 0.34u(2400)` | same | same inequality (no `⊥`) | none | 0 |
| B + D | No expected-utility representation | `0.33u(2500) > 0.34u(2400)` | `0.34u(2400) > 0.33u(2500)` | `0.33u(2500) > 0.34u(2400) > 0.33u(2500) ⊥` | none | 0 |

The two inequality rows and the dynamic panel are correct in every pattern.
The A+C benchmark copy is now:
`Most people choose like you — 82% chose A and 83% chose C (Kahneman & Tversky, 1979).`
It is truthful (joint A+C ≥ 82 + 83 − 100 = 65%, so “most” is guaranteed by
the two marginals) and is not shown for A+D/B+C/B+D.

**No raw LaTeX/backslashes** in visible prose or the Report Card: `.math-raw`
was 0 in all four reveals; `innerText` contained no `\`; the only TeX in the
DOM is KaTeX’s hidden MathML `<annotation>`, not visible text.

**Formulas / refs:** the Slide 11 formulas and the Slide 22 prospect-theory
values render; the triangle summary says `The probability triangle (Slide 12)`;
one SVG is injected. KaTeX is 0 errors on every pattern, at both widths.

**Deck spot-check:** at 1280, frames 10–16 and 22 each have 0 `.katex-error`
and render; no horizontal scroll (`scrollWidth == 1280`).

### Simulation / EV check (seed 42)

Exact values from the lotteries (`allais.js` `evOf` / `pWorstOf`, confirmed by
the 100/100 test):

| Option | Exact EV | Exact P(payoff = 0) | Displayed mean (1,000 runs) | Displayed SD | Displayed P(worst) |
|---|---|---|---|---|---|
| A | 2,400 | 0 | 2,400 | 0 | 0% |
| B | 2,409 | .01 | 2,409 | 258.4 | 1.1% |
| C | 825 | .67 | 765 | 1,152.1 | 69.4% |
| D | 816 | .66 | 840 | 1,144.7 | 65.0% |

- A’s `P(worst)` is **0%**, not 100% — the old “own minimum as game-wide
  worst” bug is fixed. `gameWorst()` returns 0 and `Charts.stats` counts
  samples equal to 0.
- Theoretical SDs (population): B ≈ 246.6, C ≈ 1,175.5, D ≈ 1,136.9.
  Displayed SDs are plausible given the same 1,000 draws.
- C’s sample mean 765 is 60 below the exact EV 825: SE ≈ 37, z ≈ −1.6;
  D’s 840 vs 816 is z ≈ +0.7. Both are plausible 1,000-run estimates. See
  F5 for the presentational nit (765 on screen next to “C is worth 825”).

---

## 3. Disguise before the reveal

Checked at **scene, round 1, resolve, simulation, interlude** (DOM `innerText`
and document title):

- `allais` / `Allais` — absent.
- `paradox` — absent.
- `common consequence` — absent.
- `certainty effect` — absent.
- `expected utility` / `expected value` — absent.
- The only visible title is `The Caravan Lockboxes`; the region label is
  `The Caravan Lockboxes game`; the step labels are `Scene`, `Contract 1`,
  `Weigh`, `Contract 2`, `Reveal`.

`Allais` first appears on the reveal heading; the Report Card (after
completion) also names it, which is allowed.

**Nit (F6):** the scene says `Two contracts, one road` / `Two sealed contracts
sit…` and the 1280 step bar shows `Contract 1 / Weigh / Contract 2` before the
first choice. This discloses the *number* of decisions, not the
common-consequence pairing. If “paired structure” is meant to include the
count, this is a should-fix; under the usual reading (the pairing, not the
count) it is a nit.

**Not counted:** the route slug is `#allais` and the deck iframe uses
`play.html#allais`, so the word is visible in the address bar/page source.
The user’s own URL uses that slug; it is not DOM/text. Flag only if the
disguise must include the URL.

---

## 4. Reveal copy, “You vs. expected utility”, Report Card

- A+C: 4 sentences, no shaming, names the common consequence and certainty
  effect only at reveal, 82/83 benchmark, `⊥` chain and algebra. Correct.
- A+D: 4 sentences, shared inequality, “A concave utility function can
  produce this.” Correct: `0.34u(2400) > 0.33u(2500)` is satisfied by a
  concave `u` with `u(0)=0` (e.g. `ln(1+x)`), and cannot be satisfied by a
  convex `u` (which would force `u(2400)/u(2500) ≤ 0.96`).
- B+C: 3 sentences, exact EVs `B 2,409 > A 2,400` and `C 825 > D 816`,
  “nearly linear utility”. Correct: linear `u` satisfies
  `0.33u(2500) > 0.34u(2400)`.
- B+D: 4 sentences, described as the mirror, “B is the higher-EV option in
  round 1 (2,409 vs 2,400 for A), while D is the lower-EV option in round 2
  (816 vs 825 for C), so this is not simply following expected value.”
  **Mathematically truthful.** No UI text anywhere claims B+D took the
  higher-EV option every time; a grep over `docs/` found only the truthful
  sentences above. The builder correctly refused the brief’s false sentence.
- “You vs. expected utility” panel: pattern badge, `Round 1 / Round 2`,
  both premises, both inequality rows, dynamic algebra, verdict title,
  explanation, utility note, A+C-only benchmark. All present and correct.
- Report Card: pattern, `A → C` etc., EU verdict, `Textbook benchmark (A+C)`,
  `Certainty equivalent: Not measured in this game`,
  `CRRA / risk aversion: Not measured in this game`,
  `Slide references: Slides 10–16, 22`. No backslashes; no KaTeX errors.
  Screenshot-friendly at 375 and 1280.
- Triangle: `Figures.triangleSVG()` is the only implementation
  (`figures.js`); `deck.js` injects it into the deck host and `engine.js`
  injects it into the reveal. Slide 12 is cited in the `<summary>`. Verified
  one SVG in the game and one in deck frame 12; no second copy of the figure
  code.

---

## 5. Findings

### F1 — MUST-FIX: the static Slide 11 block still shows the `⊥` chain on A+D and B+C

**Files:** `docs/config.js` L251–256 (formula 3, note “Both cannot hold”);
`docs/js/engine.js` L977–993 (renders every entry of `reveal.formulas`
unconditionally).

**What I did:** completed A+D and B+C at 1280 and read `.formula-grid` plus
the verdict panel.

**Expected:** `⊥` only for A+C/B+D; the shared inequality only for A+D/B+C
(the acceptance check in the review brief).

**Actual:** for A+D and B+C the top formula block contains
`0.34u(2400) > 0.33u(2500) > 0.34u(2400) ⊥` (“Both cannot hold”), while the
panel directly below says “An expected-utility representation exists” and
shows the single shared inequality. On B+C the block also shows the textbook
`A ≻ B` premise, which is the opposite of the player’s choice; on B+D the
block shows the A+C chain rather than the B+D chain (the panel is correct).
The formula block is labeled “Textbook pattern” on formulas 1–2, but formula
3 is not qualified, so the page reads as a contradiction on a consistent
pattern.

**Concrete fix (smallest):** remove the static contradiction formula from
`config.reveal.formulas` (the dynamic verdict panel already prints the
player’s chain), or add `when: "inconsistent"` to that entry and filter in
`engine.js` (`formulas.filter(...)`). If the block must stay for teaching,
wrap it in a heading “The textbook A+C derivation” and make the `⊥` note
“For A+C, both cannot hold.” The verdict panel itself needs no change.

### F2 — SHOULD-FIX: triangle caption/aria says the pairs lie on triangle edges

**Files:** `docs/config.js` L265–266 (`triangleCaption`);
`docs/js/figures.js` L51–54 (SVG `aria`/`<title>`).

**What I did:** compared the caption and aria text with the source
coordinates in `figures.js` and slides.tex L310–328.

**Expected:** the slide’s statement is `AB ∥ DC`; A(0,0), B(.01,.33),
C(.67,.33), D(.66,0). A is the origin; B is 0.01 inside the left edge; C is
on the hypotenuse; D is on the bottom edge. The two pairs are parallel
**segments**, not “one edge” and “the parallel opposite edge.”

**Actual:** caption: “A and B lie on one edge of the triangle, C and D on the
parallel opposite edge.” SVG aria: “A and B are joined on the left edge, C
and D on the right.” Both are geometrically false for B (and imprecise for
C/D). The figure itself is correct; the logic sentence (“EU lines are
parallel, so A≻B and C≻D cannot both hold”) is correct.

**Concrete fix:** replace with “The segments AB and DC are parallel: A and B
are one pair, C and D the other. EU indifference lines are parallel, so
A≻B and C≻D cannot both hold; the dashed lines would have to fan out.” Update
the aria/title to “A and B form one short segment, C and D a parallel segment
across the triangle” (or simply “the two pairs are joined by parallel
segments”).

### F3 — NIT: the Report Card always shows the A+C benchmark

**File:** `docs/js/hub.js` L327.

**What I did:** opened the Report Card after A+C, A+D, B+C and B+D.

**Expected/actual:** the reveal correctly shows 82/83 **only** for A+C. The
Report Card, however, always renders
`Textbook benchmark (A+C) | 82% chose A · 83% chose C · Kahneman & Tversky (1979)`
for every pattern. The `(A+C)` label is accurate, so this is not a false
claim; it is only potentially confusing to a B+D player. If the acceptance
check “others do not” is meant to include the Report Card, hide the field for
non-A+C or label it “Benchmark for the textbook A+C pattern.”

### F4 — NIT: `verdict()` hardcodes round keys `r1`/`r2`

**File:** `docs/js/games/allais.js` L484–485 (and L604).

**What I did:** built the same game with round ids `roundOne`/`roundTwo`
(options unchanged) and called
`verdict({roundOne:"A", roundTwo:"C"}, game)`.

**Expected:** the verdict should follow the round objects’ `id`, as
`roundById()`’s index fallback implies; the test’s renamed-id claim should
cover it.

**Actual:** `[AllaisGame] unknown choice undefined for r1`. Shipped config is
`r1`/`r2`, so this is not reproducible in the product; it only bites a
teammate who edits `rounds[].id` in `config.js`. The test only renames
**option** ids, so it does not catch this.

**Concrete fix:** `buildRound(round1, choices[round1.id], round1.id)` and the
same for round 2; return `{ [round1.id]: ..., [round2.id]: ... }` if the
contract allows. Add a renamed-round-id case to the test.

### F5 — NIT: mirror copy hardcodes the EV direction, and C’s sample mean is visibly below its EV

**Files:** `docs/js/games/allais.js` L342–358 (mirror copy);
`docs/js/engine.js` L685 (mean display); `docs/js/charts.js` L248–269.

**What I did:** checked the B+D copy against the EVs; ran seed 42.

**Expected/actual:** the B+D copy is **truthful for the shipped numbers**
(B 2,409 > A 2,400; D 816 < C 825). But the words “higher-EV”/“lower-EV” are
hardcoded, not derived; if a teammate changes the lotteries, the mirror copy
can become false. Likewise C’s 1,000-run mean is 765 (plausible, z ≈ −1.6)
while the B+C reveal says “C is worth 825”; a player may read 765 vs 825 as a
contradiction. This is a presentation nit, not a wrong number.

**Concrete fix:** derive the direction flags (`firstEv > firstOtherEv`,
`secondEv > secondOtherEv`) and choose the wording from them (or assert the
expected direction and fail loudly); label the sim card “Mean (1,000 runs)”
and/or use a seed whose C mean is closer to 825. Do not change the truthful
B+D sentence.

### F6 — NIT: two-contract count is visible before the first choice

**Files:** `docs/config.js` L131 (`Two contracts, one road`);
`docs/js/engine.js` L265–279 (step labels `Contract 1`, `Weigh`,
`Contract 2`).

As above: the common-consequence pairing is not revealed, only the number of
decisions. Count as a nit unless the disguise is meant to hide the count too.

---

## 6. Not reproducible / false alarms

- A single console line `[assets] missing: allais_trader
  (assets/sprites/allais/trader.png)` appeared in the buffer from an earlier
  run. The file exists (565 B, 32×32 RGBA) and the config path is correct.
  After `console --clear` and a fresh scene load, the image loaded
  (`naturalWidth: 32`, no `.asset-fallback`), and the console was empty.
  **Not reproducible; not a finding.**
- The `#allais` slug in the URL and the deck iframe’s
  `data-src="play.html#allais"` are visible outside the game’s DOM/text. Not
  counted as a pre-reveal name leak; noted under §3.
- No `Allais`/`paradox`/`common consequence`/`certainty`/`expected utility`
  text was found at any pre-reveal stage. I could not reproduce a leak.

---

## 7. Verdict

**PASS WITH FIXES.**

- **1 must-fix:** F1 (static `⊥` chain on A+D/B+C; the dynamic verdict panel
  is correct).
- **1 should-fix:** F2 (triangle caption/aria “edge” geometry).
- **4 nits:** F3–F6.

Re-checked after the builders’ last edits (config 16:45, engine 16:45,
`allais.js` 16:47, test 16:47):

1. `node tools/test_allais_verdicts.mjs` → **100/100**, order
   `A+C=No, A+D=Yes, B+C=Yes, B+D=No`.
2. A+C at 1280 → new benchmark copy, 0 `.katex-error`, `⊥` only in the A+C
   panel chain (F1 still present in the static block).
3. All four patterns at 375, A+C/B+C/A+D at 1280 → verdicts, rows, panel
   algebra, benchmark presence, 0 `.katex-error`, no visible backslash.
4. Simulation at seed 42 → A 2,400 / 0% , B 2,409 / 1.1%,
   C 765 / 69.4%, D 840 / 65.0%; exact EVs 2,400 / 2,409 / 825 / 816.
5. Scene/round 1/resolve/sim/interlude → no Allais, paradox, common
   consequence, certainty effect or expected utility.
6. Deck frame 12 and game reveal → one `Figures.triangleSVG()` each, Slide 12
   cited.
7. Report Card A+C/A+D/B+C/B+D → fields, CE/CRRA “Not measured in this game”,
   slide refs, no raw TeX.
8. Deck Try-it overlay at 1280 and 375 → iframe loads `play.html#allais`,
   full-viewport, Close 91.9×52.8 at 375, no errors.
9. Default interlude 20 s, Continue enabled early; `?fast=1` → 0 s and
   “Demo mode” note.

**Do not start Phase 3 from this review.** Fixes F1/F2, then re-check those
two screens only.
