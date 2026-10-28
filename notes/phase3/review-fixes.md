# Phase 3 — review findings and fixes

**Date:** 2026-10-28
**Role:** coordinator response to the two fresh reviews. Neither reviewer built
the rework; both reports are unchanged in this directory.

## Theory/content review

| Finding | Severity | Fix |
|---|---|---|
| Entry copy said “only after both are locked” while the checkpoint explains each choice after its own draw. | Must-fix | `docs/config.js` landing lead and `docs/index.html` fallback now say “the full pattern is revealed only after both are locked”. |
| Entry copy said “one seeded draw”; the game makes one per contract. | Must-fix | Landing hint is now “Two contracts · two seeded draws · offline”; both `meta` descriptions say two draws. |
| “Allais” appeared in the two HTML `meta name="description"` strings before any lock. | Must-fix | Removed from `docs/index.html` and `docs/play.html` metadata. |
| A persisted Report Card could be opened from the header during a new run, leaking the previous run's paradox/pattern. | Should-fix | Removed the header Report link; `play.js` captures the engine stage before routing and passes `allowSaved` to `hub.js`. Mid-run `#report` now shows “Finish both contracts in this run…”. |
| Round 1 checkpoint hint said “the next contract will test it…”, telegraphing the paired structure before the interlude. | Should-fix | Hint is now only “This is the requirement your choice imposes on any utility function. No simulation is run.” |
| B+D copy called B and D “the two gambles”. | Nit | Changed to “both risky contracts”. |
| Unused `pWorst` field in the verdict API. | Nit | Removed `pWorstOf`, the `pWorst` object and return field, and the 16 P(worst) test checks. Tests now 119/119. |
| Checkpoint formula had no slide ref. | Nit | Checkpoint caption now carries `Slide 11`. |

## Pip-Boy/layout review

| Finding | Severity | Fix |
|---|---|---|
| Primary link-buttons were `#8CFF8C` on `#12FF12` (1.09:1) because `.games-page a` outranked `.btn`. | Must-fix | Added `.games-page a.btn--primary { color: #021002; }` and `.games-page a.btn--ghost { color: #8CFF8C; }`. Measured at rest: `rgb(2, 16, 2)` on `rgb(18, 255, 18)`. |
| Triangle x-axis line and arrowhead were malformed by string concatenation (`"110" + 410.4`). | Should-fix | Both use `ORIGIN_X + UNIT * …`; SVG bbox is now ~496 px, arrowhead path starts at `M 520.4 440`. |
| Meaningful 10–11 px labels used `#0B7A0B` (3.52:1). | Should-fix | Moved meaningful labels, seed, step text, footnotes and captions to `#8CFF8C`; `#0B7A0B` is now rules/borders only. |
| Persisted Report Card leak (same root cause as theory should-fix). | Should-fix | Same gating fix above. |

## Post-fix checks

- `node tools/test_allais_verdicts.mjs` → **119/119**; order A+C No, A+D Yes,
  B+C Yes, B+D No.
- `python3 tools/check_assets.py` → **9/9**, exit 0.
- Browser at 375 and 1280: primary link-buttons now dark-on-green; empty and
  filled Report Card at 375 have `scrollWidth == innerWidth`; filled Report
  “Play again” is `rgb(2, 16, 2)`; empty “Enter the game” is `rgb(2, 16, 2)`.
- Mid-run `#report` after a saved A+C run shows the locked empty state; the
  Report link from the reveal still renders the saved card.
- `axe` WCAG 2 A/AA: **0 violations** on the checkpoint state and the filled
  Report Card (`incomplete` only for gradient backgrounds).
- Triangle `getBBox().width` ≈ 496 px (was ~110,379); x line ends at 490 and the
  arrowhead path starts at 520.4.
- Landing body/metadata contain no “Allais”; checkpoint body contains no
  “Allais”; checkpoint caption says Slide 11.
