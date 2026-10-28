# G1 — Allais verdict logic, test, CSS, config entry (Phase 2)

**Status:** complete; 105/105 assertions pass. `docs/config.js` was **not** edited — the entry below is for the coordinator to merge.

**Files written (only these):**

- `docs/js/games/allais.js` — `window.AllaisGame` + `module.exports`, classic script
- `tools/test_allais_verdicts.mjs` — Node 24, no dependencies
- `docs/css/games/allais.css` — scoped `.game--allais` accents
- `notes/phase2/g1-report.md` — this file

---

## 1. Proposed `games.allais` config entry

Paste inside `games: { … }` in `docs/config.js`. It follows the **actual** schema now used by `docs/js/engine.js` and `docs/js/hub.js` (read while they landed): `game.logic`, `game.scene`, `rounds[].kicker/intro/stepLabel`, `interlude.afterRound/seconds/lines`, `reveal.name/paragraphs/formulas/showTriangle`, and `game.benchmark` for the hub report card.

Numbers are the slides' (frame 10), in caps as agreed in PLAN §5.2 (×1/1000 display rescale; the contradiction is invariant). All copy is new UI text; no new numbers except the slide's own 82/83 and frame-22 V values.

```js
allais: {
  id: "allais",
  title: "The Caravan Lockboxes",
  tagline: "Two lockboxes, two roads through raider country. Choose before the road decides.",
  paradox: "Allais paradox",
  paradoxSub: "Common consequence · certainty effect",
  logic: "AllaisGame",
  card: "hub_allais",
  cardAlt: "A strongbox on a desert caravan road",
  slideRefs: [10, 11, 12, 13, 14, 15, 16, 22],
  benchmark: { r1: 82, r2: 83, source: "Kahneman & Tversky, 1979" },
  scene: {
    background: "allais_bg",
    sprite: "allais_trader",
    spriteAlt: "The caravan trader",
    kicker: "A caravan contract",
    heading: "The Caravan Lockboxes",
    lines: [
      "The caravan halts at dusk, one day short of the coast.",
      "The master cannot pay in caps until the goods arrive, so he offers a lockbox instead — sealed, heavy, and yours the moment you choose.",
      "The road through raider country decides what is actually inside."
    ],
    cta: "Consider the first offer"
  },
  rounds: [
    {
      id: "r1",
      kicker: "Contract 1 of 2",
      stepLabel: "Contract 1",
      prompt: "Which lockbox do you carry?",
      intro:
        "One box is opened here at the halt. The other is opened at the coast — if it gets there.",
      options: [
        {
          id: "A",
          label: "Sealed strongbox",
          sprite: "allais_chest_a",
          spriteAlt: "A sealed steel strongbox",
          lottery: [{ p: 1.0, x: 2400 }]
        },
        {
          id: "B",
          label: "Raider route crate",
          sprite: "allais_chest_b",
          spriteAlt: "A battered crate with a faint glow",
          lottery: [
            { p: 0.33, x: 2500 },
            { p: 0.66, x: 2400 },
            { p: 0.01, x: 0 }
          ]
        }
      ]
    },
    {
      id: "r2",
      kicker: "Contract 2 of 2",
      stepLabel: "Contract 2",
      prompt: "The second offer: which one do you take?",
      intro:
        "A second pair of lockboxes, later at the waystation. Same two roads, different odds.",
      options: [
        {
          id: "C",
          label: "One-trip satchel",
          sprite: "allais_chest_c",
          spriteAlt: "A single canvas satchel",
          lottery: [
            { p: 0.33, x: 2500 },
            { p: 0.67, x: 0 }
          ]
        },
        {
          id: "D",
          label: "Two-trip satchel",
          sprite: "allais_chest_d",
          spriteAlt: "A double-strapped satchel",
          lottery: [
            { p: 0.34, x: 2400 },
            { p: 0.66, x: 0 }
          ]
        }
      ]
    }
  ],
  interlude: {
    afterRound: "r1",
    kicker: "Interlude",
    heading: "Weigh the cargo",
    sprite: "allais_raider",
    spriteAlt: "A raider watching the caravan",
    lines: [
      "While the boxes are secured, the trader asks you to guess which of two sacks is heavier. Nothing rides on the answer — it only keeps the two contracts apart."
    ],
    seconds: 20,
    cta: "Continue to the second contract"
  },
  resolve: {
    win: "The seal breaks and you count {x}.",
    lose: "The road took it all. Nothing."
  },
  simulations: 1000,
  reveal: {
    name: "The Allais paradox",
    kicker: "Independence, not arithmetic",
    paragraphs: [
      "C and D are A and B with the common part “2 400 w.p. 0.66” replaced by “nothing w.p. 0.66”. Independence says that replacement cannot matter; people react because A is certain.",
      "Prospect theory reproduces the same two choices: V(A)=943.2, V(B)=806.5, V(C)=326.7, V(D)=320.1 (Slide 22)."
    ],
    formulas: [
      {
        tex: "A\\succ B \\iff u(2400) > 0.33\\,u(2500)+0.66\\,u(2400)",
        ref: 11
      },
      {
        tex: "A\\succ B \\iff 0.34\\,u(2400) > 0.33\\,u(2500)",
        ref: 11
      },
      {
        tex: "C\\succ D \\iff 0.33\\,u(2500) > 0.34\\,u(2400)",
        ref: 11
      },
      {
        tex: "0.34\\,u(2400)>0.33\\,u(2500)>0.34\\,u(2400)\\qquad \\bot",
        ref: 11
      }
    ],
    showTriangle: true,
    triangleCaption:
      "AB ∥ DC: expected utility ranks both pairs the same way; A and C together need indifference curves that fan out.",
    footnote:
      "Amounts are thousands of gp on the slides, shown here in caps at 1/1000 scale. The contradiction is invariant to the rescale."
  }
}
```

`logic: "AllaisGame"` is required: `engine.js` resolves `root[game.logic]`. Without it (and without `root.GAMES`) the verdict panel says "did not load". `game.benchmark` feeds `hub.js`'s report card, not the verdict.

---

## 2. Verdict implementation

`AllaisGame.verdict(choices, game)` derives everything from the lotteries:

1. Collects every payoff in both rounds and sorts ascending.
2. Builds each option's EU coefficient vector with `u(0) = 0` (the 0-payoff term is dropped; zero coefficients are dropped).
3. Subtracts the non-chosen vector from the chosen one; `c·u > 0` is the implied preference.
4. Tests whether `c2` is a scalar multiple of `c1`: negative ⇒ `opposite` ⇒ inconsistent; positive ⇒ `same` ⇒ consistent. **No option ID is ever compared to a string**; a renamed-ID test in the suite proves this.
5. Builds the inequality as `<positive terms> > <negative terms>`, payoffs ascending, coefficients `toFixed(2)`, no thousands separators — e.g. `0.34\,u(2400) > 0.33\,u(2500)`. A parallel plain-text form (`0.34·u(2400) > 0.33·u(2500)`) is used inside `plainExplanation`, because the engine and the Report Card print that string as text, not KaTeX. TeX stays only in `inequalityTex` / `algebraTex`.
6. Copy selection is structural: a certain first-round choice selects the certainty-effect text; otherwise an inconsistent pattern uses the mirror text; consistent cases split on whether the first-round choice had the lower EV (concave) or the higher EV (near-linear).
7. `ev` and `pWorst` come from the same lotteries. `pWorst` = probability of the game-wide worst payoff (0), i.e. the slides' `P(payoff = 0)`.

`sign` is the sign of the first non-zero coefficient of the chosen-minus-other vector (payoffs ascending), i.e. the `u(2400)` coefficient here: A+C `+1/−1`, A+D `+1/+1`, B+C `−1/−1`, B+D `−1/+1`.

Returned round objects are exactly `{chosen, other, sign, premiseTex, inequalityTex}`; the internal coefficient vectors/options are not leaked. Every field in the brief is present.

**Choice keys follow the config, not the literal strings.** The engine keys `state.choices` by `round.id`, so `verdict()` resolves the two round objects first and reads `choices[round1.id]` / `choices[round2.id]`, with a literal `choices.r1` / `choices.r2` fallback so direct callers keep working. The returned `choices` object is always normalized to `{r1, r2}` because the engine's verdict panel prints `verdict.choices.r1/.r2`. A test renames the round ids to `round_one`/`round_two` and passes choices keyed that way.

---

## 3. Verification

Command, from the repository root:

```
node tools/test_allais_verdicts.mjs
```

Key output (tail):

```
NOTE  docs/config.js has no games.allais yet; using the identical local fixture.
PASS  docs/config.js loads and exposes window.CONFIG
PASS  AllaisGame.verdict is a function
PASS  pattern A + C
PASS  A + C consistency is No
PASS  A + C relation
PASS  A + C algebraTex contains \bot
...
PASS  consistency flags in order A+C, A+D, B+C, B+D = No, Yes, Yes, No
PASS  A+C round1.inequalityTex
PASS  A+C round2.inequalityTex
PASS  A+C algebraTex
PASS  B+D algebraTex
PASS  A + C plainExplanation contains no backslash
PASS  A + D plainExplanation contains no backslash
PASS  B + C plainExplanation contains no backslash
PASS  B + D plainExplanation contains no backslash
PASS  A+C plainExplanation names the certainty effect
PASS  A+D plainExplanation uses Unicode math, not TeX
PASS  B+C plainExplanation uses Unicode math, not TeX
PASS  B+D plainExplanation uses Unicode math, not TeX
PASS  A+C benchmarkNote contains 82
PASS  A+C benchmarkNote contains 83
PASS  A+C benchmarkNote contains Kahneman
PASS  A+C benchmarkNote contains 'Most people choose like you'
PASS  A + D benchmarkNote is null
PASS  B + C benchmarkNote is null
PASS  B + D benchmarkNote is null
PASS  A+C ev.B = 2409
PASS  A+C pWorst.C = 0.67
PASS  renamed ids: A+C analogue is inconsistent
PASS  renamed ids: A+D analogue is consistent
PASS  renamed round ids: A+C analogue is inconsistent
PASS  renamed round ids: A+C algebraTex unchanged
PASS  renamed round ids: output choices normalised to r1/r2
PASS  renamed round ids: A+D analogue is consistent
PASS  renamed round ids: literal r1/r2 fallback still works

PASSED  105 of 105 checks.
Consistency order: A + C=No, A + D=Yes, B + C=Yes, B + D=No
```

Also checked:

- Browser-style load (vm sandbox with only `window`, no `module`): `window.AllaisGame.verdict` is a function.
- No `document`, `fetch`, `XMLHttpRequest`, `require(` or `import` in `allais.js` (only one comment mentions `require`).
- A+C algebra exactly `0.34\,u(2400) > 0.33\,u(2500) > 0.34\,u(2400)\qquad \bot`; B+D exactly the mirror.
- All four `plainExplanation` strings contain **zero backslashes**; the consistent cases carry Unicode math (`0.34·u(2400) > 0.33·u(2500)`), so the Report Card never prints raw TeX.
- EVs A 2 400, B 2 409, C 825, D 816; `pWorst` A 0, B 0.01, C 0.67, D 0.66.
- The fenced config block above re-parses (`vm.runInNewContext`), and its four lotteries each sum to 1.
- Integration fields read from `engine.js`: `verdict.round1/2.premiseTex + " \iff " + inequalityTex`, `algebraTex`, `plainExplanation`, `utilityNote`, `benchmarkNote`, `pattern`, `choices`, `verdictTitle`, `consistent` — all present. `engine.js` calls `logic.verdict(state.choices, game)`, and `state.choices` is keyed by round id (`r1`/`r2`), matching my lookup by round id with an index fallback.

**Not verified:** this revision was not re-checked in a real browser — only `node --check`, the vm browser-style load and the Node suite above. The coordinator's browser integration found the raw-LaTeX-in-plain-text and inert-CSS issues fixed here; KaTeX rendering of `algebraTex`, the reveal's triangle injection and the visual result now need a short coordinator re-check.

---

## 4. Risks / notes for the coordinator

1. **B+D copy is intentionally truthful (accepted).** The brief said B+D's explanation should say the player "took the higher-EV option every time", but the numbers do not support it: B (2 409) > A (2 400), while D (816) < C (825). **This is intentional and mathematically correct** — B is the higher-EV option in round 1, D is the lower-EV option in round 2, "so this is not simply following expected value". The copy opens with "B and D, the two gambles" to make the mirror-of-A+C reading obvious, and it still says the pattern violates independence. The coordinator confirmed this wording ships; do not change it to the brief's incorrect line.
2. **Config not merged yet.** `docs/config.js` still has `games: {}`. The test falls back to an identical local fixture and prints a NOTE; once the entry is merged it tests the real config automatically. Do not remove the fallback before the merge, or the suite fails for the wrong reason.
3. **`relation` fallback.** The contract enum is `opposite|same`. For two non-proportional inequality vectors (impossible with this config) the module returns `consistent: true` and `relation: "independent"` rather than lying. If the engine validates the enum, ask me to coerce it.
4. **`u(0)=0` normalization drops the 0-payoff term.** Correct for this game. A future game whose worst payoff is not 0 needs an explicit baseline; otherwise its worst-payoff coefficient would be silently dropped.
5. **`pWorst` is the probability of the game-wide worst payoff** (0), matching the slides. For A this is 0, not `P(payoff = min of A) = 1`; do not "fix" it to a per-option minimum.
6. **CSS is now tokens only.** `docs/css/games/allais.css` defines `--allais-sand`, `--allais-sand-deep`, `--allais-rust`, `--allais-steel`, `--allais-line` and a scoped `accent-color` under `.game--allais`, and nothing else. No panel background, border, layout, card, button, canvas or typography rules; no global variables; `--game-ink`/`--game-panel` are untouched. The previous `.stage__panel`/`.reveal-panel` rules were inert against the landed engine and were removed rather than rewritten, so the file is safe but visually subtle by design.
7. **Config fields beyond the brief** (`tagline`, `card`, `scene`, `resolve`, `benchmark`, `reveal.showTriangle`) are there because the landed engine/hub read them. `interlude.durationSec` was replaced by the engine's `seconds`.
