# Phase 3 — theory/content review

**Date:** 2026-10-28
**Reviewer:** Fresh theory/content reviewer (Phase 3). Did not build or edit the rework.
**Scope:** `docs/` game copy and logic against `slides.tex` frames 10–16/22,
`PLAN.md` §5.2 A and `notes/rework/REWORK_PROMPT.md`.
**Verdict:** **PASS WITH FIXES**

The mathematics, four verdicts, lotteries, slide formulas and Report Card
fields are correct. Two shipped-copy problems should be fixed before this is
called clean: the entry screen misstates the flow, and the paradox name is in
the HTML metadata before any lock. Neither changes the verdict algebra.

---

## Must-fix

1. **Entry-screen copy misstates the implemented flow.**
   - `docs/config.js:34` (mirrored in `docs/index.html:26–29`): “the terminal
     explains what your choices imply only after both are locked.”
   - `docs/config.js:36` (mirrored in `docs/index.html:43`): “Two contracts ·
     one seeded draw · offline.”
   - Evidence: the game explains the first choice **before** Contract 2, in the
     theory checkpoint (`docs/js/engine.js:611–734`, reached from the Round 1
     resolve at `docs/js/engine.js:524–526`). It also makes **two** seeded
     draws, one per contract (`docs/js/engine.js:457–459`), and the seed tooltip
     itself says “repeat these draws” (plural, `docs/js/engine.js:226`). The
     Phase 3 notes also say `?seed=42` repeats “the two draws” (`NOTES.md:10`).
   - Why it violates the prompt: Phase 3 requires a theory checkpoint **after
     each** seeded draw and only the reveal after both locks
     (`REWORK_PROMPT.md` §4 steps 4–8). The landing copy promises the opposite
     and gives the wrong draw count. This is visible copy, not a comment.
   - Fix: e.g. “the full pattern is revealed only after both are locked” and
     “one seed · two draws” (or “two seeded draws”). Update both the config
     values and the hard-coded fallbacks in `docs/index.html`.

2. **The paradox name is in shipped page metadata before any lock.**
   - `docs/index.html:8`: `content="A green CRT decision game about the Allais
     paradox: two contracts, one seeded draw, ..."`
   - `docs/play.html:8`: `content="One decision game: two Allais contracts, a
     seeded draw, ..."`
   - Evidence: these `meta name="description"` strings are part of the shipped
     entry and game pages. They are not rendered in the page body, but they are
     user-facing copy in link previews/search results and in page source, and
     both pages are reachable before either contract is locked.
   - Why it violates the prompt: `REWORK_PROMPT.md` §3 and the review brief
     require that “Allais”/the paradox name not appear before both locks in
     visible UI/copy; the reveal is the first permitted appearance
     (`docs/config.js:231–233`). This is the only pre-lock occurrence in the
     shipped pages other than the route/hash and asset names (see Nits).
   - Fix: remove “Allais” from both descriptions (e.g. “common-consequence
     choices”, “two contracts”). While editing, remove the false “one seeded
     draw” from the `index.html` description too.

---

## Should-fix

1. **The Report route can show the reveal before both current-run locks.**
   - `docs/play.html:20` always exposes a **Report** link. `docs/js/hub.js:80`
     reads the persisted `poc.games.v1` result and `docs/js/hub.js:110–113`
     renders `gameConfig.paradox + " · " + gameConfig.paradoxSub`
     (“Allais paradox · Common consequence · certainty effect”), plus the
     pattern, verdict and explanation.
   - On a first run the empty state is clean (`docs/js/hub.js:82–98`), so this
     is a repeat-run edge case. A returning player can open the game, lock
     nothing, click Report and see the paradox name and full verdict from the
     previous run.
   - Why it matters: it defeats the “name only after both locks” gate and the
     reveal timing for that session, even though the player has seen the reveal
     before. The prompt keeps `#report` as a game-end readout, so gating it while
     a run is in progress is the right fix rather than removing the route.
   - Fix: disable/hide the Report link until `Engine.current` is at the reveal,
     or render the empty state while a run is mounted.

2. **The Round 1 checkpoint telegraphs the paired structure before the interlude.**
   - `docs/js/engine.js:708–711`: “No simulation is run; the next contract will
     test it against your other choice.”
   - Why it matters: the interlude is kept specifically because it “disguises
     the paired structure” (`REWORK_PROMPT.md` §3), and `NOTES.md:244` claims the
     checkpoint strips the paired structure. This sentence tells the player,
     before the interlude and before Contract 2, that the contracts are paired.
     It does not name the paradox, so the strict “no Allais” rule is not broken.
   - Fix: use the neutral second clause for both rounds (“the reveal compares
     the two requirements”) or omit the clause after Round 1.

---

## Nits

- `docs/js/games/allais.js:369` — B+D copy says “the two gambles”, but C is also
  a gamble. It means “the two you picked”; say “both gamble contracts” or “the
  two risky contracts you picked”.
- `docs/js/games/allais.js:324–334` computes `pWorst` and `:655` returns it;
  the test asserts it (`tools/test_allais_verdicts.mjs:385,392–400`) but no
  shipped UI renders it. If “no P(worst)” is read literally, remove the dead
  field; otherwise it is harmless internal data.
- `docs/js/games/allais.js:627–635` builds a `benchmarkNote` (“Most people
  choose like you — 82%…”) that the reveal never renders; the reveal uses
  `config.reveal.benchmarkNote` via `docs/js/engine.js:957–961`. Two sources of
  truth for the same claim; one should go or they should be derived from one.
- `docs/config.js:242–275` keeps both `formulasTex` and `formulas` with the same
  TeX; `docs/js/engine.js:916–929` prefers `formulas`. They currently match, but
  this is easy to let drift.
- `docs/js/engine.js:677–681` labels the checkpoint formula “Expected utility”
  but not “Slide 11”; the reveal has the Slide 11 ref
  (`docs/config.js:250–260`), so the requirement is met, but adding the ref at
  the checkpoint would be clearer.
- `docs/js/hub.js:56–64` hard-codes “82% chose A · 83% chose C” for every
  pattern. It is labelled “Population benchmark” (`docs/js/hub.js:167`) and is
  correct as a population figure, but “regardless of your pattern” would remove
  the ambiguity for B+C/B+D players.
- The route hash `#allais` and asset/file names contain “allais”. The prompt
  explicitly requires `#allais` to work, and these are not rendered copy, so
  this is not a finding; the entry CTA uses bare `play.html` anyway.

---

## What was checked

| Area | Result |
|---|---|
| One game only; no `#stp`, `#ellsberg`, `#framing`; no four-card hub; no coming-soon copy | **Pass.** `docs/config.js:110` has only `allais`; `docs/js/play.js:50–75` routes game/report; `docs/index.html` has one CTA. Comments mention the removed deck/hub, not UI. |
| Four verdicts A+C No, A+D Yes, B+C Yes, B+D No, derived from lotteries | **Pass.** `docs/js/games/allais.js:451–657`; renamed-ID and renamed-round tests pass. |
| Exact lotteries A/B/C/D | **Pass.** `docs/config.js:155–199`: A `{1.00→2400}`, B `{.33→2500,.66→2400,.01→0}`, C `{.33→2500,.67→0}`, D `{.34→2400,.66→0}`. |
| Display caps ×1/1000 explained | **Pass.** `docs/config.js:281–282` reveal footnote explicitly rescales the slides’ “2,400k gp”; the rescale is payoff-invariant. |
| Frame 11 inequalities and conditional `⊥` | **Pass.** `docs/config.js:242–268`; `when:"inconsistent"` filtered at `docs/js/engine.js:930–936`. A+D/B+C show no static `⊥`; A+C/B+D do. Dynamic `algebraTex` has `\bot` only for opposite vectors (`docs/js/games/allais.js:550–557`). |
| Frame 22 values and Slide 11/12/22 refs | **Pass.** `V(A)=943.2, V(B)=806.5, V(C)=326.7, V(D)=320.1` at `docs/config.js:269–274`; refs 11 (`:254`, `:259`), 22 (`:272`), triangle “Slide 12” at `docs/js/engine.js:965`. |
| Benchmark 82/83 in reveal and Report Card | **Pass.** `docs/config.js:276–277`; `docs/js/hub.js:56–64,167`. Source is Kahneman & Tversky (1979), matching frame 10. |
| Checkpoints: chosen vs other, correct inequality, “Under expected utility, this choice means …” | **Pass.** `docs/js/engine.js:642–693`; `docs/js/games/allais.js:664–709`; exact strings verified by the test for A/B/C/D. |
| No mean/SD/P(worst)/histogram/running average/“1,000 runs”/CI/p-value/simulated data; no EV table at checkpoint | **Pass in UI.** Checkpoint is only the pair, the KaTeX inequality and the sentence; no EV table. Residual internal `pWorst` is a nit above. |
| Reveal only after both locks; “Allais”/paradox name not before both locks | **Pass in the normal rendered flow**; **fails** via the HTML metadata (must-fix 2) and repeat-run Report route (should-fix 1). |
| Report Card: pattern, EU verdict, benchmark, slide refs, CE/CRRA exactly “Not measured in this game” | **Pass.** `docs/js/hub.js:162–173`; CE and CRRA strings are exact; no invented CE/CRRA. |
| B+D copy truthful: B 2,409 > A 2,400, C 825 > D 816; B+C higher-EV pair; B+D mirror violation | **Pass.** `docs/js/games/allais.js:363–398`; no “higher EV every time” claim. Only the “two gambles” wording nit. |
| No deck/logo/university/Presentation links or references in shipped UI | **Pass.** `docs/` has no `deck.html`, `mif`, logo or Presentation link. Deck is in `archive/phase1-deck/` outside `docs/` and unlinked. |
| LaTeX untouched | **Pass.** `git status -- Microeconomic_analysis__Copy_` is empty. |
| Invented numbers/statistical claims/mismatch with slides/overclaiming | **Pass on the theory numbers** (2400/2500, 82/83, 943.2/806.5/326.7/320.1, 2,409/825/816 all trace to the slides or the lotteries); the entry-copy flow claims are the overclaiming exception (must-fix 1). |

No browser session was run; this was a static code/copy review plus the required
Node test. The layout/visual checks belong to the separate Pip-Boy reviewer.

---

## Test evidence

```
$ node tools/test_allais_verdicts.mjs
...
PASSED  135 of 135 checks.
Consistency order: A + C=No, A + D=Yes, B + C=Yes, B + D=No
exit 0
```

- Exact pass count: **135/135**.
- Exact order: **A + C = No → A + D = Yes → B + C = Yes → B + D = No**.
- The run used `docs/config.js`; the fixture-fallback note (“docs/config.js has
  no games.allais yet”) did **not** appear.
- Additional check: `python3 tools/check_assets.py` → exit 0, 9/9 assets OK.
- I also inspected the actual verdict/checkpoint output for all four patterns and
  the four single-round choices; the inequalities and plain-text sentences match
  the test expectations and frames 11/22.

No source, docs, tools, config or LaTeX files were modified by this review.
