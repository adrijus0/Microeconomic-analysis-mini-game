# NOTES — hand-off log

Anyone (human or agent) should be able to resume from this file alone. Update it at the end of every phase.

---

## Status

- **Current phase:** Phase 2 (engine + The Caravan Lockboxes) **complete and committed locally**.
- **Next step:** 🛑 **waiting for explicit go-ahead for Phase 3** (Ellsberg, St. Petersburg, Framing). Do not start it.
- **Do not:** touch `Microeconomic_analysis__Copy_/` (the LaTeX sources), push to any remote, or change repository settings. Ask before changing `CONFIG.siteUrl` or any repo setting.
- **Open the result:** double-click `docs/index.html` → **🎮 Games** (`docs/play.html`) → **The Caravan Lockboxes**, or open `docs/play.html#allais` directly. `?seed=42` repeats the draws and simulation; `?fast=1` skips the 20 s interlude. The deck’s web slide 11 (Try-it Allais) opens the same game in its overlay.

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

## Decisions made so far

All in `PLAN.md` §0 (D1–D10). The ones likely to be revisited:

1. **16:9 at 1280 × 720**, though the source is 4:3 (128 × 96 mm). **Important correction to the plan's rationale:** at 1 cm = 100 px the web canvas is 12.8 × 7.2 cm — same scale and same absolute width, but **25 % less vertical room** than the source. 16:9 gives more width relative to height, not more absolute width. Several frames therefore auto-fit (0.93–0.98); frame 5 is 26.04 px. See `CONVERSION_NOTES.md` §1. If the team wants larger type, a taller canvas / smaller source scale is the lever, not a different column width.
2. **Four games** — Allais, Ellsberg, St. Petersburg, Framing — skinned as Fallout, Cyberpunk 2077, Witcher 3, Skyrim. Numbers stay the slides'.
3. **Allais first** (Phase 2), **Ellsberg second**.
4. **Original pixel art**, every sprite replaceable via `config.js`; manifest `ASSETS.md`.
5. **Four "Try it" slides** before frames 8, 10, 17, 19, plus the QR slide **after References** → **35 web slides** (36 if References paginates to 3).
6. **References split 6 + 6**, author–year.
7. **No speaker notes** in Phase 1 (source has none).
8. Git initialised locally, one commit per phase, nothing pushed.
9. **UI language English**, title string "Paradoxes of Choices under Uncertainty", supervisor "Assoc. Prof. Dmitrij Celov".
10. **Frame 13 typo fixed** (`\chi` → `\mathcal{X}`), logged in `CONVERSION_NOTES.md`.
11. **No external requests**: reveal.js/KaTeX/QR/pixel font vendored; the Try-it iframe loads `play.html#<id>` and every route has a real panel (Phase 2 replaced the placeholder).
12. **Allais display currency is caps at ×1/1000.** The slides say “2,400k gp”; the game shows `2,400 caps`. Same digits, deliberate display rescale; contradiction-invariant. Logged in `CONVERSION_NOTES.md` §8.
13. **Interlude:** 20 s default, visible countdown, Continue enabled immediately (non-blocking), `?fast=1` skips it for demos; no invented choices.
14. **B+D copy is truthful, not the task prompt’s “higher-EV every time”.** B 2,409 > A 2,400 but D 816 < C 825, so B+C is the EV-maximising pair; B+D is still a mirror violation. The UI says B is higher-EV in Round 1 and D lower-EV in Round 2; both choices impose opposite inequalities. The verdict table is unchanged.
15. **Allais does not measure a certainty equivalent or CRRA.** The Report Card says “Not measured in this game” for both.
16. **Original art only.** G2 generated every PNG; no downloaded or copyrighted game art. Sprites are 32×32 shown at 64/128 px (2×/4×), the cap icon at 32 px.

## Open questions for the team

Full list in `PLAN.md` §7. Still open after Phase 1:

- **`siteUrl` / GitHub repo** for the QR code: currently `https://example.github.io/paradoxes-of-choices/` (placeholder). The QR encodes it. Tell us the real URL before Phase 4 (or now) and we change one line in `config.js`.
- **Phone behaviour of the deck:** the fixed 16:9 canvas scales to 0.293 at 375 px (readable on a laptop/projector, small on a phone). The games will be mobile-first. Is that acceptable, or do you want a separate phone layout for the deck?
- **Title slide footer:** resolved after the layout re-check — the title slide now shows `1 / 35`, like beamer's infolines; only the `[plain]` Thank-you frame is bare. Confirm you are happy with that, or say if you prefer a clean title slide.
- **Speaker notes:** still empty by design. Do you want 2–4 bullets per slide authored as new content?
- **References page count:** the source uses `allowframebreaks` and was never compiled. We split 6 + 6; if the PDF paginates to 3 pages, the web count becomes 36. The footer follows the DOM automatically.
- **Residual accessibility nits:** focus ring on white is 2.08:1 (accepted), and the Try-it dialog does not trap Tab (`inert` not set). Fix now or in Phase 4 QA?
- **Phase 3 games:** only Allais is playable; `#ellsberg`, `#stp`, `#framing` are clean “Coming in Phase 3” panels. Confirm the order (Ellsberg, St. Petersburg, Framing) when you give the go-ahead.
- **Accepted Phase 2 residual nits:** the Report Card’s benchmark row is always labelled “Benchmark (A+C)” (correct but not the player’s pattern); the step bar discloses that there are two contracts (not the A/B–C/D pairing); the B+D “higher/lower EV” wording is tied to the shipped numbers, so any number change needs a copy review; in-memory progress is lost on a full reload when localStorage is blocked (hash navigation keeps it); the Report Card is a clean single card but ~1,000 px tall at 375 (not one screen); the Phase 1 deck overlay Close label wraps at 375; the first formula card has a 2 px internal scroll at 360 px (page itself never scrolls horizontally; 375 is clean).
- **`siteUrl`** is still the Phase 1 placeholder; do not change it or the QR without approval.

## Facts that are easy to get wrong (keep)

- **The web deck has 35 slides**, not 29. Order: 1, 2, 3–7, **Try-it StP**, 8, 9, **Try-it Allais**, 10–16, **Try-it Ellsberg**, 17, 18, **Try-it Framing**, 19–28, 29a, 29b, **QR**. Footers run 1–29 and 31–35; only the `[plain]` Thank-you frame (slide 30) has none.
- **3 `\pause` → 3 fragments:** two on frame 10 (Question 2 inside the gameblock; Typical answers outside) and one on frame 17 (Typical choice). No other frame has a fragment. Both use `fragment--collapse` so hidden content does not reserve space.
- **0 speaker notes**, **0 `.katex-error`**, **0 console errors**, **0 external requests**, **169 KaTeX nodes**.
- **The LaTeX source is untouched.** All output is in `docs/`; the conversion log is `CONVERSION_NOTES.md`.
- **`VUMIF.sty` redefines `blue` as `#02487F`**; the triangle's `gray!70` is **#A6A6A6**; the frame-21 weighting identity line is xcolor `gray` = **#808080**. Do not swap them.
- **Frame 9 table is `{rr}`** (both columns right-aligned); **frames 17/24/28 are `lccc`/`lcccc`/`lcccccccc`** (first column left, data centred); **frame 28 has no midrule** between p and w(p).
- **Frame 5 is the only auto-fit below 27 px:** 0.93 × 28 px = **26.04 px**. Frames 3, 6, 9, 10, 17 auto-fit to 0.94–0.98; all other frames are 1.00.
- **Frame 5 vs frame 6:** `0<α<1` vs `α>0` is a **source inconsistency**; both are preserved. Do not harmonise.
- **Frame 27** keeps `\sum_{k=1}^{n}1`; it is correct, not a typo.
- **Frame 15/16 empty block titles** were dropped; `block--untitled` has body only.
- **Frame 26** is `[plain]`: no `<h2>`, no footer, centred. The **title slide** has a `1 / 35` footer; only frame 26 is bare.
- **`play.html` is now the real hub + runner**, not a placeholder. Routes: bare = hub, `#allais`, `#stp`, `#ellsberg`, `#framing`, `#report`. The Try-it overlay is a true viewport dialog moved to `<body>`; the iframe is lazy and loads `play.html#allais` at 375×605 in testing.
- **Phase 2 verdict facts:** Allais A+C **No**, A+D **Yes**, B+C **Yes**, B+D **No**; A+C and B+D are mirror violations. EVs A 2,400 / B 2,409 / C 825 / D 816; P(0) 0 / .01 / .67 / .66. B+C — not B+D — is the higher-EV-every-time pair.
- **Display caps are ×1/1000 of the slides’ “2,400k gp”**, not a new payoff. The report card’s CE/CRRA fields say “Not measured in this game”.
- **The static `⊥` card is conditional** (`when:"inconsistent"`), so A+D/B+C do not show it above their “EU representation exists” verdict; the dynamic panel always shows the player’s actual inequalities.
- **Art:** nine original PNGs (`hub_allais`, `allais_bg`, seven sprites); `check_assets.py` passes 10 assets + 2 figures. Missing art falls back to a labelled box/banner + one `console.warn`.
- **Tests:** `node tools/test_allais_verdicts.mjs` = **105/105**; `python3 tools/check_assets.py` = exit 0.
- **Deck unaffected in content:** 35 sections, 0 `.katex-error`, 0 console/page errors after Phase 2; the only deck-shared code change is the triangle aria wording in `figures.js` (visual unchanged).
- **QR** encodes the placeholder `CONFIG.siteUrl`; margin 32 gives a 4-module quiet zone. It decodes in testing.
- **`docs/vendor/`** is pinned: reveal.js 4.6.1, KaTeX 0.16.11, qrcode-generator 1.4.4, Press Start 2P. No CDN, no `fetch()`, no ES modules.
