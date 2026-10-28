# Phase 3 — Pip-Boy / layout / QA review

**Date:** 2026-10-28
**Reviewer:** Fresh Pip-Boy/layout/QA reviewer (Phase 3). Did not build or edit the rework. No code, docs, tools, config or LaTeX were changed; the only write is this report.
**Scope:** `docs/index.html`, `docs/play.html`, `docs/config.js`, `docs/css/*`, `docs/js/engine.js`, `docs/js/hub.js`, `docs/js/play.js`, measured in the browser at 375×667 and 1280×800 from `file://`.
**Verdict:** **PASS WITH FIXES** — 1 must-fix (one root cause, three CTA surfaces), 3 should-fix, 5 nits. The green CRT re-skin, single-game flow, offline/`file://` behaviour, reveal gating and Report Card are otherwise sound.

> Cross-reference: the separate theory/content review covers the landing copy (“only after both are locked” / “one seeded draw”) and the pre-lock “Allais” in the HTML `meta` descriptions. Those are content issues, not repeated here; this report only notes the persisted-Report leak as a QA behaviour (should-fix 3).

---

## Must-fix

1. **Primary link-buttons render pale green on bright green (1.09:1), so the main CTAs are barely readable.**
   - **Where:** Reveal → **See your Report Card**; Report Card filled → **Play again**; Report Card empty → **Enter the game**. Both 375×667 and 1280×800.
   - **Evidence:**
     - Computed style at rest: `color: rgb(140, 255, 140)` (#8CFF8C) on `background-color: rgb(18, 255, 18)` (#12FF12). Contrast = **1.09–1.1:1**.
     - `agent-browser a11y --tags wcag2a,wcag2aa --json` reports a WCAG 2 AA `color-contrast` violation (serious, expected 4.5:1):
       - empty Report Card: `.btn` “Enter the game”, 1.09:1;
       - filled Report Card: `.btn--primary` “Play again”, 1.09:1;
       - reveal: `.btn--primary` “See your Report Card”, 1.09:1.
     - Screenshots: `report-empty-375.png`, `report-empty-1280.png`, `report-filled-375.png`, `report-filled-1280.png`, `reveal-ac-375.png`, `reveal-ac-1280.png`. The pale label is visible in every one.
     - Root cause: `docs/css/games.css:19` `.games-page a { color: var(--pip-green-soft); }` has specificity (0,1,1) and beats `.btn` / `.btn--primary` (0,1,0) at `docs/css/games.css:89` and `:133`. On `:hover` / `:focus`, `.btn:hover` (0,2,0) restores `#021002`, which masks the bug for a mouse but not for touch, an untouched page, or a screenshot.
   - **Why it violates acceptance:** the review brief requires all Report Card/reveal text readable and “green contrast”; `REWORK_PROMPT.md` §6 requires high text contrast and the same green CRT style everywhere. A 1.09:1 label on the primary action is a hard readability/accessibility failure, not a cosmetic one.
   - **Fix (actionable):** scope the link colour so it does not hit `.btn`, e.g. `.games-page a:not(.btn) { ... }`, or add `.games-page a.btn--primary { color: #021002; }` / `.games-page a.btn { color: #021002; }` while keeping `.btn--ghost` soft green. Re-check the three anchors at rest (not only hover) at 375 and 1280.

---

## Should-fix

1. **Triangle x-axis arrowhead is lost to a malformed SVG path.**
   - `docs/js/figures.js:107` builds the right-axis arrowhead with `px(X(0) + UNIT * 1.08)`. `X()` returns a **string**, so `"110" + 410.4` becomes `"110410.4"`. The emitted path is
     `d="M 110410.4 440 l -12 -4 l 0 8 Z"` instead of `M 520.4 440 …`.
   - Result: the right-hand arrowhead is drawn off-canvas and is invisible (the y-axis arrowhead is present); the SVG content bbox balloons to **86,298 px** wide. The SVG clips it, so `document.documentElement.scrollWidth` stays 375/1280, but the geometry is wrong and a future `overflow: visible` would break the page.
   - Seen in `triangle-1280.png` / `triangle-375.png`: x-axis ends without an arrowhead. The triangle itself opens, is legible and uses only `#12FF12`, `#8CFF8C`, `#0B7A0B`.
   - Fix: use `ORIGIN_X + UNIT * 1.08` (or `Number(X(0)) + UNIT * 1.08`).

2. **Dim-green text is 3.52:1 at 10–11 px (below WCAG AA 4.5:1).**
   - Measured against the report panel composite (`#041004`): `.report-card__field dt` 11 px bold = **3.52:1**; `.report-card__verdict-label` 10 px bold = 3.52:1; `.report-card__foot` 11 px = 3.52:1. Same token `#0B7A0B` is used for the landing status line, game seed and step labels.
   - These labels are meaningful (Certainty equivalent, CRRA, verdict label), not decorative rules. `REWORK_PROMPT.md` §3 reserves `#0B7A0B`/`#0A5A0A` for rules/panels and names `#8CFF8C` as secondary text. They are legible in screenshots but fail AA.
   - Fix: use `#8CFF8C` (15.5:1 on the panel) or a larger/bolder treatment for these labels; keep `#0B7A0B` for rules.

3. **A returning player can open the previous run’s Report Card before locking anything in the current run.**
   - Repro: complete a game (seed 42, A+C), then open `play.html?fast=1&seed=99` (fresh scene). Click the header **Report**: the persisted card shows “Allais paradox · Common consequence · certainty effect”, pattern **A + C**, footer **seed 42**, while the current run is still at the scene.
   - This does not show the reveal stage (that remains gated correctly), but it leaks the paradox name/pattern before any current-run lock, defeating the “name only after both locks” gate for returning sessions. Already raised as should-fix by the theory review; confirmed independently here.
   - Fix: while a run is mounted, render the empty state (or disable the header Report link) until `Engine.current.stage === "reveal"`.

---

## Nits

- **Landing needs a small vertical scroll at 1280×800:** document height **836** vs 800 (CTA is still above the fold, bottom 669). At 375 the page is 818 vs 667; the CTA is fully visible (top 582, bottom 638). Cosmetic only; no horizontal scroll.
- **Report Card is ~2 phone screens at 375:** card **347×1,014 px**, page **1,174 px**. Full-page screenshot is clean; the “trim the explanation?” question in `NOTES.md` is still open. Not a failure of the stated checks.
- **Step bar wording:** “Scene / Contract 1 / Weigh / Contract 2 / Reveal” discloses that there are two contracts (accepted Phase 2 residual; it does not disclose A/B–C/D pairing).
- **Checkpoint separator:** the “≻” between “Your choice” and “The alternative” is a 12 px pixel glyph between two large cards; visible but small.
- **Triangle labels at 375:** the SVG renders 273×243, so `p2500` / `p0` / `2400 sure` are roughly 7–10 px effective. Legible in `triangle-375.png`, but a larger label size would read better on phones.

---

## What was checked (measured)

**Viewports:** 375×667 and 1280×800; browser session `phase3-review-layout`; all navigation `file://`.

**Landing (`docs/index.html`)**
- One terminal: `main.terminal` ×1, `.terminal__frame` ×1; one `h1` “The Caravan Lockboxes”; one CTA `#terminal-cta` → `play.html` (253.9×56 at 1280; 327×56 at 375).
- No logo/university/authors/supervisor/deck: body text and a docs-wide grep found none (`docs/assets/ui/mif.png` gone; only a code comment mentions “supervisor”).
- Links on the page: skip link + `play.html` only; no `deck.html`, no Presentation link, no `#stp/#ellsberg/#framing`.
- `scrollWidth === innerWidth`: 1280/1280 and 375/375. Document heights 836 / 818 (nit above).
- Computed colours: title `rgb(18, 255, 18)`, eyebrow `rgb(18, 255, 18)`, CTA background `rgb(18, 255, 18)` with `#021002` text; all element colours on the page are green-family (13 distinct values; no VU blue/gold/burgundy).
- 0 console messages, 0 page errors; all requests `file://` (HTML/CSS/config/PNG/TTF).

**Game routes**
- `play.html` and `play.html#allais` both mount the same game: `.stage--scene`, `h1` “Two contracts, one road”, steps “Scene, Contract 1, Weigh, Contract 2, Reveal”, 0 hub cards, 0 `#stp`/`#ellsberg`/`#framing` panels, 0 `canvas`/histogram/mean/SD.
- `#stp`, `#ellsberg`, `#framing`, `#nonsense-route` all fall back cleanly to the scene; no “coming soon” text; 0 console/errors.
- `#report` exists and is the Report Card; header links “← Entry” (index.html) and “Report” (#report) are 44 px high; reveal actions “See your Report Card” → `#report` and “Back to entry screen” → `index.html` both work.

**Flow (`?fast=1&seed=42`)** — scene → choice → lock → resolve → theory checkpoint → round 2 → checkpoint → reveal:
- Stage classes observed in order: `stage--scene`, `stage--choice` (r1), `stage--resolve`, `stage--checkpoint` (r1), `stage--choice` (r2), `stage--resolve`, `stage--checkpoint` (r2), `stage--reveal`. `?fast=1` skips the interlude.
- Keyboard-only run succeeded: Enter (scene) → 1 → Enter (lock) → Enter (focused “Read the theory →”) → Enter (checkpoint) → 2 → Enter → Enter → Enter → reveal. `1` selects, `Enter` locks, `Enter` on the focused report link navigates to `#report` instead of acting on the game.
- `scrollWidth === innerWidth` at **every** stage at both widths: scene, choice, resolve, checkpoint, interlude, reveal, report filled, report empty (all pairs 1280/1280 and 375/375).
- 0 `.katex-error` at both checkpoints and the reveal, for **all four patterns** (A+C, A+D, B+C, B+D).
- Checkpoint formula internal scroll at 375: **277/277 px** (client/scroll width), dynamic algebra **262/262**, reveal ineq rows **262/262**, algebra **262/262**, reveal formula cards **277/277**. At 1280 the checkpoint formula is **968/968**, reveal cards **804/804**.
- No visible element with `right > innerWidth` in any stage (`clipped = 0`); only hidden MathML/SVG internals exceed the viewport.
- A+C and B+D show **4** formula cards including the static `⊥` (“Both cannot hold.”); A+D and B+C show **3** formula cards and no `⊥`. Verdict panel classes `is-inconsistent` / `is-consistent` correlate correctly.
- “Allais”/“paradox” absent from the stage text at scene and both checkpoints; first appears at the reveal after both locks.

**Interlude without `fast` (from `?seed=42`)**
- After the Round 1 checkpoint, Continue shows the interlude: `stage--interlude`, countdown **20 seconds**, progress fill 100%, “Continue to the second contract” **enabled** at 20 and still enabled while ticking (observed 20 → 12, fill 60%).
- `scrollWidth === innerWidth`: 375/375 and 1280/1280; visible target 299×66 (375) / 320×48 (1280); focus moves to the heading.

**Reveal / triangle / report link**
- Reveal appears only after the Round 2 checkpoint (no reveal DOM before that). Report link works from the reveal (`#report`, persisted card rendered).
- Triangle `<details>` opens; SVG 420×373 at 1280 and 273×243 at 375; `role="img"` + complete `aria-label`; colours only `#12FF12`, `#8CFF8C`, `#0B7A0B`; caption and labels legible. X-axis arrowhead missing (should-fix 1).
- Report Card link target works from the reveal; Report route title “Paradox Report Card — Paradoxes of Choices under Uncertainty”.

**Report Card**
- Empty state after `localStorage.clear()` + `#report`: `.report-empty` 347×294 at 375 and 660×254.8 at 1280; “No card yet”, CTA “Enter the game” → `#allais` (works); green CRT panel; `scrollWidth === innerWidth` at both.
- Filled state after completed games: A+D and A+C patterns at both widths; card 347×1,014 at 375 and 780×679.5 at 1280 (A+D); border `rgb(18, 255, 18)`, title `rgb(18, 255, 18)`; pattern “A + D”/“A + C”, benchmark “82% chose A · 83% chose C · Kahneman & Tversky (1979)”, `Certainty equivalent` and `CRRA / risk aversion` both “Not measured in this game”, “Slides 10–16, 22”; verdict text/red border correct for violation vs consistent; no h-scroll.
- Screenshot-friendly: full-page captures at 375 and 1280 inspected; no clipping/overlap; all body/secondary text 15.5–16.7:1. The only contrast failure is the primary link-button (must-fix 1); dim 10–11 px labels are 3.52:1 (should-fix 2).

**Style**
- Exact primary green `rgb(18, 255, 18)` verified on: landing title/eyebrow/CTA background, scene/choice/checkpoint/reveal headings, current step, report border and title, empty-state title.
- Palette scan of every visible element on landing, choice, reveal and report: only green-family values plus `rgb(255, 59, 47)` (warning red, used only on the inconsistent verdict border/text). No `#02487F`/`#262686`/`#E9E9F3`/`#143E5F`/`#E8ECEF`/`#2E7D32`/`#EEF5EF`/`#3333B3`/`#A6A6A6` in any computed colour; CSS hex scan of `docs/` matches (greens + `#FF3B2F` only).
- Scanline/vignette overlays are `pointer-events: none` at z-index 9998/9999; `document.elementFromPoint()` on an option returns the option (mouse click selected A); body text contrast 16.7:1 and screenshots show it readable through the 1 px/4 px scanline band.
- Error/empty styling is the same CRT language: report-empty is a green panel; missing-art fallback is a green striped box/banner with a dashed warning-red border, labelled “trader” (asset test below).

**Accessibility / behaviour**
- Keyboard `1`/`2` + Enter works, full run above; pressing a number while an option is focused selects, Enter locks; Enter on a focused link uses native navigation.
- Focus visible: options get `outline: solid 3px rgb(140, 255, 140)` with 3 px offset; checked via Tab navigation (`:focus-visible` true on both option buttons). Headings receive programmatic focus without an outline (non-interactive).
- Target sizes ≥44 px at 375: options **171 px** high (299 wide), lock/buttons **48 px**, header links **44 px**, reveal actions **48 px**, report actions **48 px**, `<details>` summaries **50 px**; no interactive element under 44 px was found. At 1280 options are 194 px high.
- Reduced motion (`agent-browser set media dark reduced-motion`): resolve shows **0** running animations, no `is-resolving` class, chest flash `animation-name: none`, outcome revealed immediately; transitions are 0.001 ms.
- Missing art (temporarily pointed `CONFIG.assets.allais_trader.file` and `allais_bg.file` at bad paths, hash-remounted, then reloaded — no files edited): labelled 64×64 `asset-fallback` “trader”, `.scene-bg--missing`, warning “Missing background: allais_bg”, 2 console warnings (one per key, by design), 0 page errors, no h-scroll.
- Unknown hashes above: clean scene fallback, 0 console/errors.
- Offline (`agent-browser set offline on`): landing and game scene still load from `file://`; KaTeX available; no external request.

**Network/errors**
- `agent-browser network requests --filter http` → no HTTP(S) requests at any point. Request list is all `file://` (HTML, CSS, config, PNGs, KaTeX woff2, Press Start 2P TTF).
- 0 console messages and 0 page errors on landing, the full fast game, the reveal and the filled Report Card; the only console output was the intentional 2 missing-art warnings.

**Shipped-surface grep**
- `docs/` (excluding `vendor/`): no `deck.html`, `mif.png`, `#stp`, `ellsberg`, `framing`, `presentation`, university/supervisor UI strings. Only a code comment mentions “No authors, supervisor or logo”.
- `docs/vendor/` now contains only `fonts/PressStart2P-Regular.ttf` + OFL and KaTeX (fonts/css/js); no reveal.js, qrcode, auto-render. `docs/assets/` has the 9 Allais PNGs only.

---

## Screenshot / command evidence

Session: `export AGENT_BROWSER_SESSION=phase3-review-layout`; screenshots under
`/private/var/folders/9s/z_0b7_qj3zx7f42k6yqtkhjm0000gn/T/opencode/p3shots/`.

- Landing: `landing-375.png`, `landing-1280.png`.
- Choice: `choice-r1-1280.png`, `choice-r2-375.png`.
- Checkpoint: `checkpoint-r1-375.png`, `checkpoint-r1-1280.png`, `checkpoint-r2-1280.png`.
- Interlude: `interlude-375.png`, `interlude-1280.png`.
- Resolve: `resolve-r1-1280.png`; fallback: `fallback-375.png`.
- Reveal: `reveal-ac-375.png`, `reveal-ac-1280.png`, `reveal-ad-375.png`; triangle: `triangle-375.png`, `triangle-1280.png`.
- Report: `report-filled-375.png`, `report-filled-1280.png`, `report-empty-375.png`, `report-empty-1280.png`.

Representative commands (all run from the repo, no server):

```bash
agent-browser set viewport 375 667
agent-browser open "file:///.../docs/play.html?fast=1&seed=42"
agent-browser click "button.btn--primary"; agent-browser press 1; agent-browser press Enter
agent-browser screenshot --full .../checkpoint-r1-375.png

# measured in-page:
document.documentElement.scrollWidth === innerWidth            # true at every state
document.querySelector('.checkpoint__formula .formula__math')  # clientWidth 277 / scrollWidth 277
document.querySelectorAll('.katex-error').length               # 0
getComputedStyle(document.querySelector('.btn--primary')).color # rgb(140,255,140) on rgb(18,255,18)

agent-browser a11y --tags wcag2a,wcag2aa --json
agent-browser set media dark reduced-motion
agent-browser console; agent-browser errors
agent-browser network requests --filter http
```

**Bottom line:** one root-cause must-fix (primary link-button contrast, three surfaces). With that fixed and the triangle path corrected, the Phase 3 layout should be clean at both required viewports.
