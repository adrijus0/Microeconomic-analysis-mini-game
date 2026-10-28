# Phase 2 — independent layout / QA review (Allais vertical slice)

**Reviewer:** independent (did not build Phase 2).
**Date:** 2026-10-28.
**Method:** Chromium via `agent-browser` (named session `phase2-r2`; a second session `phase2-r2-ls` with a `localStorage`-blocking init script), at **375 × 667** and **1280 × 800**, from `file://` and from a simulated GitHub-Pages sub-path (`http://localhost:8765/testrepo/docs/…`). Console and page-error buffers cleared before each measured run. Product files were not edited; the two missing-asset tests renamed a file and restored it immediately (hashes below).

**Verdict: PASS WITH FIXES.** Two must-fix defects (one 375 px image-rendering bug, one keyboard bug that can commit an irreversible choice), two should-fix issues, the rest nits. Every checklist item was exercised.

---

## 1. Checklist results

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | 375/1280 hub, game, report, coming-soon; no h-scroll; ≥44 px targets | **PASS** | `documentElement.scrollWidth == innerWidth` on every view (375: hub 375, game stages 375, report 375, `#stp/#ellsberg/#framing` 375; 1280: 1280 everywhere). Smallest interactive boxes: skip-link 171×44, bar links 72/108×44, game back 60×44, buttons 48 high, summaries 44/54 high, hub cards 347×327. Four cards and three coming-soon routes present at both widths. |
| 2 | Deck integration | **PASS** | `deck.html#/10`: 35 sections, 0 `.katex-error`, 169 KaTeX nodes. Overlay at 375 = `[0,0,375,667]`, iframe `[0,62,375,605]`; at 1280 overlay `[0,0,1280,800]`, iframe `[0,62,1280,738]`. Clicking "▶ Play on this device" loaded the game and advanced it to the choice stage inside the iframe. ✕ closed it, slide index stayed `h = 10`, focus returned to the `[data-game="allais"]` button. Also verified under `/testrepo/docs/`: frame URL `…/testrepo/docs/play.html#allais`. |
| 3 | Keyboard and touch | **FAIL (one defect)** | `1` selects A, `1` again locks; `Enter` locks; `Enter` on resolve → sim, on sim → interlude, on interlude → round 2; clicking an option then clicking it again also locks; `3` is a no-op with two options. **But** Enter on a focused link is hijacked (finding **F2**). No Tab trap found. |
| 4 | Seeded reproducibility and `?fast=1` | **PASS** | `?seed=42` renders `seed 42`. Run 1 A draw 2 400 caps; B simulation mean 2 409, SD 258.4, P(worst) 1.1 %. After reload the draw and all three stats were identical. Run 2 D draw 2 400; C 765 / 1152.1 / 69.4 %, D 840 / 1144.7 / 65 %; identical after reload. `?fast=1` → countdown 0, hint "Demo mode (?fast=1): the interlude is skipped", Continue enabled. Without it → 20 visible and Continue enabled. |
| 5 | Offline / no external requests | **PASS** | `set offline on`, reloaded hub, game and deck: every captured request was `file://`, `network requests --filter http` → "No requests captured", console empty, page errors empty, deck still 35 sections / 0 KaTeX errors. |
| 6 | `localStorage` disabled/throwing | **PASS** | Init script makes `window.localStorage` throw `SecurityError`; `GameStore.available === false`. A+C game completed, hash navigation to `#report` (no reload) showed the in-memory A+C card, 0 console / 0 page errors. |
| 7 | Missing sprite / background | **PASS** | Renamed `trader.png` → `.bak`, reloaded: one `console.warn("[assets] missing: allais_trader (assets/sprites/allais/trader.png)")`, striped labelled box with `allais_trader`, no errors, rest of scene intact. Renamed `allais_bg.png` → `.bak`: one warn, striped scene fallback, `Missing background: allais_bg` visible at 375 (10, 632) and 1280 (10, 765), no crash. Both restored: trader `5b14cd59…`, bg `0ed4d763…` (match G2's report). |
| 8 | Reduced motion | **PASS** | `set media dark reduced-motion`; `prefers-reduced-motion` true. Lock → 0 `.is-resolving`, computed `animation-name: none`, outcome visible within 150 ms, heading already "The lock is open". Outcome meaning is text, not animation. |
| 9 | 0 KaTeX / console / page errors; formula fit | **PASS** | Full A+C runs at 375 and 1280 + report: 0 `.katex-error`, 0 console, 0 page errors, `scrollWidth == innerWidth`. Algebra/verdict panel readable at 375; the only internal overflow is 2 px in the first formula card (finding **F6**). |
| 10 | Hub / Report Card | **PASS** | Four thematic cards: The Caravan Lockboxes, The Fixer's Crate, The Doubling Contract, The Jarl's Orders; one playable, three "Coming in Phase 3"; after a run the Allais card shows "✓ PLAYED" and "PLAY AGAIN". Report shows pattern, EU verdict ("Violates expected utility / independence axiom"), textbook benchmark (82 % A · 83 % C · Kahneman & Tversky 1979), slide refs ("Slides 10–16, 22"), and "Not measured in this game" for certainty equivalent and CRRA at 375 and 1280. |
| 11 | Assets / checker | **FAIL (one defect)** | `python3 tools/check_assets.py` exits 0 (10 assets + 2 figures). Sprites are now 64 px (option, hero at 375), 128 px (resolve, hero at 1280), 32 px (caps) — integer scales. **But at 375 the option sprite is 56 × 64 in a 58 × 58 frame** (F1); computed `image-rendering` is `crisp-edges`, not `pixelated` (F4). Card and background render correctly and look intentional. |

---

## 2. Findings

### F1 — must-fix — option sprites are squashed to 56 × 64 at 375 px

- **File/lines:** `docs/css/games.css:1874-1877` (`.option__sprite { width:58px; height:58px }` inside `@media (max-width: 380px)`) against `docs/css/games.css:959-962` (`.sprite--option { width:64px; height:64px }`) and `docs/css/games.css:1023-1030` (68 × 68 flex box; the image has no `flex:none`).
- **Viewport:** 375 × 667 (also 360 px and anything ≤ 380). Not present at 1280 (64 × 64 in 68 × 68).
- **Steps:** open `play.html?seed=42#allais` at 375 → "Look at the contracts" → measure `.option__sprite` and its `img`.
- **Expected:** 32 × 32 art at 64 × 64 (2×) with `image-rendering: pixelated`.
- **Actual:** `.option__sprite` is 58 × 58 (content 56 × 58); the image is `56 × 64`, i.e. 0.875 aspect instead of 1.0, and overflows the frame by 3 px top and bottom (frame `[51, 351.171875, 58, 58]`, image `[52, 348.171875, 56, 64]`). The strongbox/satchel silhouettes look slightly stretched; the `image-rendering` rule cannot fix non-integer scaling.
- **Fix:** in the `max-width: 380px` block set `.option__sprite { width: 66px; height: 66px; }` (content box 64) — or delete that override — and add `.option__sprite img { flex: none; }` so the image can never shrink. Keep 64 × 64.

### F2 — must-fix — Enter on a focused link runs the game action (can lock an irreversible choice)

- **File/lines:** `docs/js/engine.js:1158-1173` (only `INPUT/TEXTAREA/SELECT` are exempted) and the choice branch at `1155-1173`; the Enter branch at `1178-1190` also ignores that the target may be a link.
- **Viewport:** any (tested 375).
- **Steps:** open `play.html?seed=42#allais`. (a) focus `← Hub` and press Enter at the scene. (b) start the game, press `1` (select A), focus `← Hub`, press Enter.
- **Expected:** Enter activates the focused link (hub / start / presentation) and leaves the game; no choice is recorded.
- **Actual:** (a) stage advances from scene to `stage--choice` instead of navigating. (b) choice is **locked** and the draw resolves (A, 2 400 caps) while the URL stays `#allais`; the player never gets the "no take-backs" confirmation and cannot undo. The same applies to the "← Start"/"Presentation" links while the game is mounted. This is an irreversible action fired from a focused link.
- **Fix:** only hijack Enter when the focused element is not an interactive control. At the top of `onKeyDown`, before the choice branch, add e.g.
  `if (event.key === "Enter" && event.target.closest && event.target.closest("a, button, summary")) return;`
  (native activation then handles links, the lock button and <summary>). Keep the numeric-key branch as-is if number keys on buttons are wanted.

### F3 — should-fix — random seed is ellipsised at 375 px

- **File/lines:** `docs/css/games.css:1887-1889` (`.game__seed { max-width: 74px }` at ≤ 380) with `docs/css/games.css:806-818`.
- **Viewport:** 375 × 667 with a random seed (no `?seed=`). `?seed=42` fits.
- **Steps:** open `play.html#allais` at 375; read the chip.
- **Expected:** the full seed, because the UI tells the player to "Add ?seed=… to the URL to repeat these draws".
- **Actual:** painted as `seed 1we…`; `clientWidth 72` vs `scrollWidth 86`, full value only in the `title` tooltip (no hover on touch). Screenshot `seed 1we…`.
- **Fix:** at ≤ 380 use `max-width: 96px` (the title already ellipsises) or `font-size: 9px`; or move the seed to its own row under the step dots.

### F4 — should-fix — computed `image-rendering` is `crisp-edges`, not `pixelated`

- **File/lines:** `docs/css/games.css:949-951`: `image-rendering: pixelated;` followed by `image-rendering: crisp-edges;`; the later declaration wins.
- **Viewport:** all.
- **Expected (checklist):** `image-rendering: pixelated`.
- **Actual:** `getComputedStyle(img).imageRendering === "crisp-edges"` on hero, option and resolve sprites. Chromium still renders nearest-neighbour (screenshots look sharp), so this is a spec/literal mismatch rather than a visual break.
- **Fix:** reverse the order (`crisp-edges` first, `pixelated` last) or drop `crisp-edges`.

### F5 — nit — `?fast=1` shows the interlude screen with 0 s but says it is "skipped"

- **File/lines:** `docs/js/engine.js:854-916` (seconds 0 still renders the panel and a Continue button) and the hint at `881-887`.
- **Steps:** `play.html?seed=42&fast=1#allais` → round 1 → sim → continue.
- **Expected:** either no interlude at all in demo mode, or copy that says the countdown is skipped.
- **Actual:** interlude panel with "0 SECONDS", "Demo mode (?fast=1): the interlude is skipped", and a Continue button. No 20 s wait, so the functional requirement (skip the 20 s delay) is met.
- **Fix:** in fast mode call `afterRound` directly, or change the hint to "Demo mode: the 20-second countdown is skipped."

### F6 — nit — first formula card scrolls 2 px internally at 375

- **File/lines:** `docs/js/engine.js` first reveal formula (`0.34 u(2400)…`), measured in `docs/css/games.css:1432-1438` `.formula__math { overflow-x:auto }`.
- **Evidence:** `clientWidth 275`, `scrollWidth 277` at 375. The page itself is 375/375 and the line is fully legible in the screenshot.
- **Fix:** set `.formula__math .katex { font-size: 0.85em }` under `max-width: 420px`, or allow 1–2 px more panel width.

### F7 — nit — 375 report card is 1 021 px tall

- **Evidence:** `.report-card` height 1 021.1 px at 375 (viewport 667). It is a single, self-contained card and reads well; a one-screen phone screenshot cannot contain all of it.
- **Fix (only if "screenshot-friendly" means one screen):** a compact print/share variant, or reduce the benchmark/CE/CRRA row padding at ≤ 480.

### F8 — nit — missing-sprite key wraps mid-word in the 64 px fallback

- **Evidence:** labelled fallback shows `allais_tra` / `der` because `overflow-wrap:anywhere` at `docs/css/games.css:1694-1701` in a 64 px box.
- **Fix:** show a short key stem (`trader`) or reduce the label font to 8 px; behaviour (warn + labelled box + no crash) is correct.

### F9 — nit — deck overlay Close label wraps to two lines at 375

- **Evidence:** "✕ / CLOSE" in a ~100 × 48 button at 375; tap target is compliant and the ✕ is visible.
- **Fix:** `white-space: nowrap` with a slightly wider button, or an icon-only ✕ with an `aria-label`.

### F10 — nit — report-card value columns wrap awkwardly at 1280

- **Evidence:** "TEXTBOOK BENCHMARK (A+C)" takes 3 label lines and its value 2; "Not measured in this game" wraps in the right column at 1280. No overlap/clipping.
- **Fix:** widen the value column (`grid-template-columns: minmax(0,0.9fr) minmax(0,1.3fr)` for the 2-column layout) or shorten the label.

---

## 3. Checks not completed / limitations

- **Browsers:** Chromium only (`agent-browser`); no Firefox, Safari or real iOS device.
- **Screen readers:** no VoiceOver/NVDA pass (alt text was inspected but not heard).
- **GitHub Pages:** verified under `/testrepo/docs/` on a local HTTP server, not on an actual Pages deployment.
- **20 s countdown completion:** confirmed 20 s is visible and Continue is enabled; did not wait the full 20 s for the final status message.
- **`#report` empty state** (no result yet) was not exercised.
- **Deck speaker view / 1920 px projector / 360 px** are outside this Phase 2 pass (Phase 1 covered the deck at 375/1280).
- The deck's own "▶ Play on this device" button is scaled with the fixed 1280 × 720 canvas (~0.29 at 375), so it is physically below 44 px on a phone; that is the known deck-on-phone trade-off from Phase 1, not a Phase 2 hub/game control.

---

## 4. Restore log (missing-asset tests)

1. `mv docs/assets/sprites/allais/trader.png docs/assets/sprites/allais/trader.png.bak` → reload → inspect → `mv …trader.png.bak …trader.png`.
2. `mv docs/assets/backgrounds/allais_bg.png docs/assets/backgrounds/allais_bg.png.bak` → reload (375 and 1280) → inspect → `mv …allais_bg.png.bak …allais_bg.png`.
3. Hashes after restore: `trader.png 5b14cd59a9b3bfdffbf855a94a980188053abebfd00fca979a905ae042eb5f2f`, `allais_bg.png 0ed4d763475bbad2e99f0ae7a7a613ec4da4590634aeab402054cf7874a79626` (both match the builders' values). `python3 tools/check_assets.py` exits 0. No product file changed by this review.
