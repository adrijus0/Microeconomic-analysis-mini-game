# NOTES — hand-off log

Anyone (human or agent) should be able to resume from this file alone. Update it at the end of every phase.

---

## Status

- **Current phase:** Phase 3 (Pip-Boy single-game rework) **complete, reviewed and committed locally**. The site ships **one game only**: The Caravan Lockboxes (Allais / common consequence).
- **Open the result:** double-click `docs/index.html` → **Enter the game** (`docs/play.html`), or open `docs/play.html#allais` directly. `?seed=42` repeats the two draws; `?fast=1` skips the 20 s interlude. `docs/play.html#report` shows the Report Card.
- **Archived:** the Phase 1 reveal deck is in `archive/phase1-deck/` outside `docs/` and is not linked from the shipped site. It is history, not a maintained build.
- **Do not:** touch `Microeconomic_analysis__Copy_/` (the LaTeX sources), push to any remote, rebuild the other three paradox games, or change repository settings. Ask before changing `CONFIG.siteUrl` or any repo setting.
- **Palette:** the primary green is exactly `#12FF12` (RGB 18/255/18) on the entry screen, game, theory checkpoints, reveal and Report Card. Warning red `#FF3B2F` is reserved for violations/errors.

## Phase log

### Phase 0 — Inventory and plan (done)

| What | Where |
|---|---|
| Plan (inventory, macros, concepts, figures, game mapping, subagent plan, risks, questions) | `PLAN.md` |
| Art shopping list and asset-swap rules | `ASSETS.md` |
| Frame-by-frame inventory, frames 1–15 | `notes/phase0/frames-a.md` |
| Frame-by-frame inventory, frames 16–29 | `notes/phase0/frames-b.md` |
| Preamble / KaTeX / figures / bibliography audit | `notes/phase0/preamble.md` |
| Independent review + fixes | `notes/phase0/review.md`, `notes/phase0/plan-review.md` |

Phase 0 subagents: A (`ses_e7db81a10ffeTCGBkuPKPYRXLQ`), B (`ses_e7db81a0fffeLKHGdLiTTGDZOv`), C (`ses_e7db81a0fffdliGDuvQQu5ol1G`), R (`ses_e7dad5e99ffeJRUdHq2NX6aB86`), R2 (`ses_e7d97e77cffehvv2INWP7C6XfC`).

### Phase 1 — Deck conversion (done, 2026-10-28)

**Scaffold built by the coordinator** (before any builder ran):

- `docs/vendor/` — reveal.js **4.6.1** (reveal.css/js, math + notes plugins), KaTeX **0.16.11** (katex.min.js/css, auto-render, 60 font files), qrcode-generator **1.4.4**, Press Start 2P (TTF + OFL). No CDN.
- `docs/config.js` — title, subtitle, authors, supervisor, `katexMacros: { "\\X": "\\mathcal{X}" }`, `assets.ui_mif`, `siteUrl` placeholder, `games: {}`.
- `docs/css/theme.css`, `docs/css/deck.css` — palette from `VUMIF.sty` (`blue #02487F`, block `#262686`/`#E9E9F3`, alert `#143E5F`/`#E8ECEF`, game `#2E7D32`/`#EEF5EF`, bullets `#3333B3`), blocks, tables, columns, title slide, TOC, Try-it overlay, QR.
- `docs/deck.html` skeleton, `docs/index.html` start screen, `docs/js/deck.js` (footline `n / N`, figure injection, overflow safety net, fragment re-fit), `docs/play.html` Phase 1 placeholder, `docs/.nojekyll`.

**Builders (parallel; each owned only its files):**

| ID | Session | Task | Result |
|---|---|---|---|
| S1 | `ses_e7d7eeb2bffenEFP8HoAz6rom2` | Frames 1–8 → `notes/phase1/part-1.html` | 8 sections, title/TOC/EU/StP; marker `<!-- tryit:stp -->` before frame 8; `script` frame 5; verified 33 math segments, 0 KaTeX errors |
| S2 | `ses_e7d7eeb2affegcTSON1SWXVJdo` | Frames 9–15 → `part-2.html` | 7 sections; marker before frame 10; two frame-10 fragments; triangle host; approved `\mathcal{X}` fix; verified 12 display + 38 inline segments |
| S3 | `ses_e7d7eeb2affdPLRXrlNgCZf2JH` | Frames 16–22 → `part-3.html` | 7 sections; markers before 17 and 19; Ellsberg table, frame-21 plots, frame-22 rowspans; verified 55 math segments |
| S4 | `ses_e7d7eeb20ffeG4jJf8gNmAiDbp` | Frames 23–29 → `part-4.html` | 8 sections (References 6 + 6), frame-23 fixed table, frame-27 items, frame-28 table; verified 29 math segments, 0 errors |
| S5 | `ses_e7d7eeb1fffeazxG7Uq9d3bakI` | `tools/make_figures.py`, `docs/js/figures.js`, `docs/assets/figures/*.svg`, `docs/assets/ui/mif.png`, `tools/check_assets.py` | 2 plot SVGs (5.0 × 3.7 cm aspect), inline triangle SVG (7 dashed lines, exact coordinates), logo copied byte-for-byte; checker exits 0 |
| S6 | `ses_e7d7eeb1effeM4qktU6NP6EfN2` | Four `tryit-*.html`, `tryit.js`, `qr.html` | 4 Try-it sections + QR; true-viewport overlay, lazy `play.html#<id>` iframe, Close/Escape, QR from `CONFIG.siteUrl`; verified at 375/1280 |

**Merge:** the coordinator replaced the four part blocks and the four Try-it markers, copied `tryit.js` into `docs/js/`, and rebuilt `docs/deck.html`. 35 sections.

**Review loop (fresh reviewers, did not build):**

| ID | Session | Review | Verdict | Fixes |
|---|---|---|---|---|
| M | `ses_e7d692794ffe6gJXnyehU4dsMc` | Math: every formula/number/frame/reference vs the `.tex`, 29/29 frames, 35 slides | **PASS** — 0 must-fix, 0 should-fix, 6 nits | All 6 nits fixed/re-checked: frame 9 `{rr}` right-aligned; frame 17 `{lccc}` centred; frame 21 caption italic `$p$`; weighting identity `gray` = #808080; frame 28 extra midrule removed (source has none); 29b "References (cont.)" is the expected split marker. Re-check 6/6 PASS. |
| L | `ses_e7d692794ffdps0wF63G1x9D4L` | Layout: 1280/375, fragments, file://, airplane mode, 0 `.katex-error`, 0 console errors, no h-scroll, speaker view, overlay, QR | **PASS WITH FIXES** — 0 must-fix, 2 should-fix, 4 nits | Should-fix both fixed: (1) overlay moved to `<body>` and `position:fixed` so at 375 the dialog is 375×667, Close 93×52.8, iframe 375×605 (was 31×13 and 1280 wide); (2) focus the dialog, not Close, so Space no longer dismisses; hint promises only ✕ (Esc still works while focus is in the deck). Nits fixed: Thank-you exactly centred (cy 359.99), frame 9/17 alignment, QR quiet zone margin 32. Re-check 6/6 PASS; focus-ring contrast and focus trap accepted as residual nits. After the re-check the coordinator added the `1 / 35` footline to the title slide (beamer's infolines); only the `[plain]` Thank-you frame is now bare. |

**Final self-verification (coordinator):**

- **35 `<section>`s:** `1 … 28, 29a, 29b` + 4 Try-it + QR. 29/29 source frames exactly once; frame 29 split 6 + 6.
- **0 `.katex-error`**, **169 KaTeX nodes** rendered.
- **0 console messages / page errors** at 1280 and 375.
- **0 non-`file://` requests**; deck works with all `http(s)` blocked.
- **No horizontal scroll** at 1280 or 375 (`scrollWidth == innerWidth`); no slide overflow after all fragments.
- **Fragments:** exactly 2 on frame 10, 1 on frame 17; initial/revealed states correct; no other slide has fragments.
- **Overlay:** opens full viewport at 375 and 1280; iframe lazy; Close visible; Escape closes with focus in the deck; focus returns to the same slide/button; reveal does not advance behind it.
- **QR:** rendered 330 × 330 from the placeholder URL; decodes to `https://example.github.io/paradoxes-of-choices/`.
- **Speaker view:** `S` opens the speaker window with current/upcoming previews and empty note panes (D9).
- **Assets:** `python3 tools/check_assets.py` exits 0 (logo 244 × 244; both SVGs valid, aspect 1.351).
- **Screenshots:** 1280 for all 35 slides and 375 spot checks were inspected; no clipping.

**Commit:** `git log -1` → Phase 1 commit (local only, nothing pushed).

### Phase 2 — Engine + The Caravan Lockboxes (done, 2026-10-28)

**Scope:** one reusable, data-driven stage engine and the first game (Allais /
common consequence), skinned as a Fallout caravan. The deck and start screen
were not rewritten. `docs/play.html` is now the real hub + game runner.

**Built by the coordinator (shared files only):**

| File | What it does |
|---|---|
| `docs/play.html` | hub, game mount, coming-soon panel and Report Card routes; no inline styles |
| `docs/js/play.js` | hash router (`#allais`, `#stp`, `#ellsberg`, `#framing`, `#report`); hides the site bar inside the deck iframe |
| `docs/js/engine.js` | scene → choice → lock → resolve → simulate → interlude → reveal; keyboard 1/2/3 + Enter, touch, reduced motion, missing-art fallback, scroll reset |
| `docs/js/rng.js` | mulberry32, per-stream string seeds, `?seed=42` |
| `docs/js/charts.js` | canvas histogram + running-average line, mean/SD/P(worst) stats, no chart library |
| `docs/js/store.js` | localStorage progress inside try/catch, in-memory fallback |
| `docs/js/assets.js` | key → path, labelled missing-art fallback, one `console.warn` per key |
| `docs/js/hub.js` | four thematic cards, coming-soon panels, Paradox Report Card |
| `docs/css/games.css` | mobile-first hub/game/report layout |
| `docs/config.js` | `games.allais` + three coming-soon entries + nine asset keys + `gameOrder` |
| `docs/js/figures.js` | aria wording for the triangle corrected to “segments AB and DC are parallel” (visual unchanged) |

**Subagents (parallel; each owned only its files):**

| ID | Session | Task | Result |
|---|---|---|---|
| G1 | `ses_e7d2ce0a0ffeuK3FgEvnHs4XKg` | `docs/js/games/allais.js`, `docs/css/games/allais.css`, `tools/test_allais_verdicts.mjs`, report | pure lottery-derived `verdict(choices, game)`; all four patterns; **105/105** checks after fixes; no pattern-matching; round-id-safe |
| G2 | `ses_e7d2ce09fffeebyujgleyAw42Z` | `tools/make_sprites.py`, nine PNGs, report | seven 32×32 RGBA sprites, 640×360 card, 1280×720 background; deterministic byte-identical reruns; sizes match `config.js` |

**What was merged:** the coordinator wrote the config entry and engine, merged
G2’s asset entries, and used G1’s verdict module without editing it. G1’s
config proposal in its report is not authoritative; `docs/config.js` is.

**Review loop (fresh reviewers; did not build):**

| ID | Session | Review | Verdict | Fixes |
|---|---|---|---|---|
| R1 | `ses_e7d0e81b4ffeWyYUr6iUup8cPx` | logic/math: 4 patterns, inequalities, mirror, benchmark, EVs/P(worst), slide refs, reveal timing, KaTeX, all four patterns at 375 + three at 1280 | **PASS WITH FIXES → PASS** | F1 (must) static `⊥` card showed on A+D/B+C: added `when:"inconsistent"` + engine filter; A+D/B+C now 3 cards/no `⊥`, A+C/B+D keep it. F2 (should) triangle caption/aria wrongly called AB/DC triangle edges: corrected to parallel segments. F4 latent: `verdict()` now reads `choices[round.id]` with r1/r2 fallback + renamed-round test. F5 mean label is now “Mean (1,000)”. F3/F6 accepted residual nits (benchmark label/step count); see §“Accepted residual nits”. |
| R2 | `ses_e7d0e81b3ffeQUZ1rnR8e8VN1p` | layout/QA: 375/1280, deck overlay, touch/keyboard, file://, offline, localStorage blocked, missing sprite, reduced motion, h-scroll, tap targets, console/page errors, seed, hub/report screenshots | **PASS WITH FIXES → PASS** | F1 (must) option sprite squashed at ≤380: box 66×66 + `flex:none` (now 64×64); F2 (must) Enter on a focused link could start/lock: native activation restored for `a, button, summary`; F3 seed ellipsis: 96 px at ≤380; F4 `crisp-edges` overrode `pixelated`: order reversed; F5 `?fast=1` showed a 0 s interlude: now skips directly to Contract 2; F6 2 px formula inner scroll: KaTeX 0.85em; F8 fallback label wrapped mid-key: short key stem; F10 report grid/value wrap: 0.9fr/1.3fr + “Benchmark (A+C)”. F7 report taller than one 375 screen and F9 Phase 1 overlay Close wrap accepted as residual nits. Re-check PASS: 375/360/1280, 0 console/page/KaTeX errors, no page h-scroll. |

**Final self-verification (coordinator):**

- `node tools/test_allais_verdicts.mjs` → **105/105**, order **A+C No, A+D Yes, B+C Yes, B+D No**.
- `python3 tools/check_assets.py` → **10 assets + 2 figures OK**, exit 0.
- `?seed=42` reproduces the draw and the 1,000-run stats (B: mean 2,409, SD 258.4, P(worst) 1.1%; A: 2,400 / 0 / 0%). A’s P(worst) is **0%**, not its own minimum.
- `?fast=1` skips the interlude; default interlude is 20 s, ticks down (20 → 18 after 2.2 s) and Continue is enabled throughout.
- All four patterns at 375: 0 `.katex-error`, algebra fits (259/259 px), page `scrollWidth == 375`; A+D/B+C show no static `⊥`; A+C/B+D do.
- 375×667, 1280×800 and the deck’s 375×605 iframe: no horizontal page scroll; hub 4 cards; report card screenshot-friendly. R2 also checked 360 px; the page stays 360/360.
- R2 fixes verified after the report: option sprite 66×66 frame / 64×64 image at 375 and 360; computed `image-rendering: pixelated`; full random seed at 375; Enter on a focused link navigates instead of locking; `?fast=1` skips the interlude entirely; all four formula cards 275/275 at 375; fallback label `trader`; report grid 0.9fr/1.3fr.
- Missing background/sprite: labelled fallback + one `console.warn`, no crash; restored files afterwards.
- localStorage blocked: `GameStore.available === false`, game completes, hash route to `#report` uses the in-memory result.
- Deck: **35 sections, 0 `.katex-error`, 0 console/page errors**, overlay 375×605 opens/closes, close returns focus to the Try-it button.
- 0 `http(s)` requests with the network off; no fetch/XHR/ES modules.

**Commit:** `Phase 2: engine + The Caravan Lockboxes` (local only, nothing
pushed). See `git log -1` for the hash.

### Phase 3 — Pip-Boy single-game rework (done, 2026-10-28)

**Scope:** ship one game only (The Caravan Lockboxes / Allais), remove the deck,
logo, four-game hub and ×1,000 simulation, and restore the slide theory as a
per-round expected-utility checkpoint.

**Removed / archived:**

- `archive/phase1-deck/` now holds `deck.html`, `deck.css`, `deck.js`,
  `tryit.js`, `vendor/reveal/`, `vendor/qrcode/`, `assets/ui/mif.png` and the
  two Phase 1 plot SVGs. Nothing in `docs/` links to them. The LaTeX sources
  were not touched.
- `docs/js/charts.js` deleted; `simulations` removed from `docs/config.js`;
  histogram/running-average/mean/SD/P(worst) UI and code removed.
- Three coming-soon games (`#stp`, `#ellsberg`, `#framing`), the hub card grid,
  the university logo and the authors/supervisor block removed.
- `docs/js/tryit.js`, reveal.js and qrcode-generator are no longer shipped.

**Shipped:**

| File | Role |
|---|---|
| `docs/index.html` | one green CRT terminal, one **Enter the game** action, no logo/authors |
| `docs/play.html` | single-game mount + Report Card; no hub or coming-soon views |
| `docs/js/engine.js` | scene → choice → lock → resolve → **theory checkpoint** → interlude → reveal |
| `docs/js/games/allais.js` | `verdict()` plus new `checkpoint(round, choice, game)` derived from the lotteries |
| `docs/js/hub.js` | Report Card only; empty state points at the one game |
| `docs/js/play.js` | bare and `#allais` both mount the game; `#report` remains; unknown hashes fall back to the game |
| `docs/config.js` | one game; no `simulations`, logo, deck metadata or other games |
| `docs/css/theme.css`, `games.css`, `games/allais.css` | `#12FF12` CRT palette, scanlines, phosphor glow, monospace/pixel type |
| `docs/js/figures.js` | same triangle geometry, recoloured green; A–B solid, D–C dashed |
| `tools/check_assets.py` | checks the nine remaining PNGs; no Phase 1 figures |

**Theory flow, per contract:** the player sees the chosen option vs the
alternative, the lottery-derived inequality (`A≻B ⇔ 0.34u(2400) > 0.33u(2500)`,
etc.) rendered with KaTeX, and one sentence beginning “Under expected utility,
this choice means …”. There is no mean, SD, P(worst), histogram or simulated
data. The seeded single draw and `?seed=42` remain.

**Browser self-checks (coordinator):** 375 and 1280; landing/game/checkpoint/
reveal/report; no horizontal page scroll; 0 `.katex-error`; formulas fit
277/277 px at 375 (checkpoint) and 262/262 px (dynamic algebra); interlude
20 → 13 s ticks and `?fast=1` skips it; keyboard `1`/`2`/`Enter` completes both
contracts; A+C and B+D show `⊥`, A+D does not; triangle SVG uses only
`#12FF12`, `#8CFF8C` and `#0B7A0B`; missing-art fallback logs one warning;
all requests are `file://`; no console/page errors.

**Automated checks:** `node tools/test_allais_verdicts.mjs` → **119/119**
(all four patterns, lotteries, inequalities, benchmark, renamed ids and 30
checkpoint checks); `python3 tools/check_assets.py` → exit 0 with **9/9
assets**.

**Reviews:** fresh theory/content and Pip-Boy/layout reviews were run after the
rework (reports in `notes/phase3/`). Fixes after review: corrected the landing
copy (two draws, full pattern only after both locks), removed “Allais” from the
page metadata, hid the header Report link and gated a mid-run Report so a saved
card cannot leak the previous run, neutralised the Round 1 checkpoint hint,
fixed the primary link-button contrast (`#021002` on `#12FF12`), repaired the
triangle x-axis arrowhead, moved meaningful small labels from dim to secondary
green, and removed the unused P(worst) field. Commit `Phase 3: Pip-Boy
single-game rework` (local only, nothing pushed).

## Decisions made so far

All in `PLAN.md` §0 (D1–D10). The ones likely to be revisited:

1. **16:9 at 1280 × 720**, though the source is 4:3 (128 × 96 mm). **Important correction to the plan's rationale:** at 1 cm = 100 px the web canvas is 12.8 × 7.2 cm — same scale and same absolute width, but **25 % less vertical room** than the source. 16:9 gives more width relative to height, not more absolute width. Several frames therefore auto-fit (0.93–0.98); frame 5 is 26.04 px. See `CONVERSION_NOTES.md` §1. If the team wants larger type, a taller canvas / smaller source scale is the lever, not a different column width.
2. **One game only (Phase 3).** The Caravan Lockboxes (Allais / common consequence). The other three paradoxes are not built; the four-game hub and their coming-soon routes were removed.
3. **Allais first** (Phase 2), **Ellsberg second**.
4. **Original pixel art**, every sprite replaceable via `config.js`; manifest `ASSETS.md`.
5. **The Phase 1 deck is archived, not shipped.** `archive/phase1-deck/` keeps `deck.html`, deck CSS/JS, reveal.js, qrcode, the logo and the two Phase 1 plot SVGs. No page in `docs/` links to it.
6. **References split 6 + 6**, author–year.
7. **No speaker notes** in Phase 1 (source has none).
8. Git initialised locally, one commit per phase, nothing pushed.
9. **UI language English**, title string "Paradoxes of Choices under Uncertainty", supervisor "Assoc. Prof. Dmitrij Celov".
10. **Frame 13 typo fixed** (`\chi` → `\mathcal{X}`), logged in `CONVERSION_NOTES.md`.
11. **No external requests**: KaTeX and the pixel font are vendored; the game is a classic-script page with no fetch, no modules and no deck iframe.
12. **Allais display currency is caps at ×1/1000.** The slides say “2,400k gp”; the game shows `2,400 caps`. Same digits, deliberate display rescale; contradiction-invariant. Logged in `CONVERSION_NOTES.md` §8.
13. **Interlude:** 20 s default, visible countdown, Continue enabled immediately (non-blocking), `?fast=1` skips it for demos; no invented choices.
14. **B+D copy is truthful, not the task prompt’s “higher-EV every time”.** B 2,409 > A 2,400 but D 816 < C 825, so B+C is the EV-maximising pair; B+D is still a mirror violation. The UI says B is higher-EV in Round 1 and D lower-EV in Round 2; both choices impose opposite inequalities. The verdict table is unchanged.
15. **Allais does not measure a certainty equivalent or CRRA.** The Report Card says “Not measured in this game” for both.
16. **Original art only.** G2 generated every PNG; no downloaded or copyrighted game art. Sprites are 32×32 shown at 64/128 px (2×/4×), the cap icon at 32 px. The nine PNGs stay in `docs/assets/`; the desert colours are kept inside green CRT frames.
17. **Theory checkpoint instead of simulation (Phase 3).** After each seeded draw, `AllaisGame.checkpoint(round, choice, game)` derives the expected-utility inequality from the same lottery algebra as `verdict()`. No histogram, mean, SD, P(worst), “1,000 runs” or `simulations` config remains. The Report Card is still not a CE/CRRA measurement.
18. **Exact palette token.** `#12FF12` is the primary green on every shipped surface; `#8CFF8C` is secondary text, `#0B7A0B`/`#0A5A0A` are rules/panels, and `#FF3B2F` is reserved for violations and errors. Sprites keep their original colours inside green frames.

## Open questions for the team

The Phase 1/2 deck questions below are historical; the deck is archived and not
shipped. Current questions:

- **`siteUrl` / GitHub repo:** still the placeholder
  `https://example.github.io/paradoxes-of-choices/`. Nothing on the shipped game
  reads it now, but tell us the real URL before adding deployment metadata.
- **Report Card length at 375 px:** the green card is clean and screenshot-ready
  on desktop, but ~1,230 px tall at 375 (about two phone screens) because the
  plain-language explanation is included. Trim the explanation or keep it?
- **B+D copy is tied to the shipped numbers.** B 2,409 > A 2,400, C 825 > D 816,
  so B+C is the higher-EV pair and B+D is the mirror violation. Any number change
  needs a copy review.
- **localStorage blocked:** the in-memory fallback keeps a completed game and the
  Report Card for the current page, but a full reload loses it. Accept?
- **Residual Phase 2/3 nits:** the step bar discloses two contracts (not the
  A/B–C/D pairing); the benchmark row is labelled “Population benchmark”, not the
  player’s pattern. Both are accepted unless you want them changed.
- **Do not rebuild the other paradoxes.** The brief is one game; that was the
  Phase 3 default and remains the shipped state.

## Facts that are easy to get wrong (keep)

- **The shipped site is one game.** `docs/index.html` → `docs/play.html`; bare
  `play.html` and `#allais` both mount The Caravan Lockboxes; `#report` is the
  Report Card. `#stp`, `#ellsberg` and `#framing` no longer exist.
- **The deck is archived**, not shipped: `archive/phase1-deck/` (outside
  `docs/`). No `docs/` page links to `deck.html`, the logo or the Phase 1 plots.
- **The flow is** scene → choice → lock → seeded resolve → **theory checkpoint**
  → interlude (after r1) → round 2 → reveal. There is **no ×1,000 simulation**,
  no histogram, no mean/SD/P(worst), no `charts.js`, and no `simulations` config.
- **Theory checkpoint:** after each draw, the player sees the chosen option vs
  the other one, the lottery-derived inequality, and “Under expected utility,
  this choice means …”. The checkpoint strips “Allais” and the paired structure;
  the paradox name appears only in the reveal after both locks.
- **Phase 3 verdict facts:** Allais A+C **No**, A+D **Yes**, B+C **Yes**,
  B+D **No**; A+C and B+D are mirror violations. EVs A 2,400 / B 2,409 /
  C 825 / D 816; P(0) 0 / .01 / .67 / .66. B+C — not B+D — is the
  higher-EV-every-time pair.
- **The static `⊥` card is conditional** (`when:"inconsistent"`), so A+D/B+C do
  not show it above their “EU representation exists” verdict; the dynamic panel
  always shows the player’s actual inequalities.
- **Display caps are ×1/1000 of the slides’ “2,400k gp”**, not a new payoff. The
  Report Card’s CE/CRRA fields say “Not measured in this game”.
- **Exact palette:** `#12FF12` primary; `#8CFF8C` secondary text; `#0B7A0B` /
  `#0A5A0A` rules and panels; `#FF3B2F` only for violations/errors. The triangle
  uses only the greens and distinguishes A–B (solid) from D–C (dashed).
- **Art:** nine original PNGs (`hub_allais`, `allais_bg`, seven sprites);
  `check_assets.py` passes 9 assets. Missing art falls back to a labelled
  box/banner + one `console.warn`.
- **Tests:** `node tools/test_allais_verdicts.mjs` = **119/119** (all four
  patterns, lotteries, inequalities, benchmark, renamed ids and 30 checkpoint
  checks); `python3 tools/check_assets.py` = exit 0.
- **`docs/vendor/`** now ships KaTeX 0.16.11 and Press Start 2P only. reveal.js
  and qrcode-generator moved to the archive. No CDN, no `fetch()`, no ES modules,
  no external requests.

### Phase 1 historical facts (archived, not shipped)

- The Phase 1 web deck had **35 slides** and 169 KaTeX nodes; the LaTeX source
  (`Microeconomic_analysis__Copy_/`) was never touched.
- The archived deck preserves the VU palette, title slide, university logo,
  Try-it overlays and QR code exactly as they were at commit `58527b9`.
- `VUMIF.sty` redefined `blue` as `#02487F`; the triangle’s `gray!70` was
  `#A6A6A6`. Those colours apply **only** to the archived deck, not the game.
