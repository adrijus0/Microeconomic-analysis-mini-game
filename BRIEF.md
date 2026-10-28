# BRIEF — "Paradoxes of Choice Under Uncertainty": interactive deck + mini-games

> Put this file in the root of the Overleaf project folder (next to the `.tex`).
> Kick off any agent (Claude Code, OpenCode, …) with:
> **"Read BRIEF.md and do Phase 0 only, using subagents as described in §2. Stop when PLAN.md is ready."**

## Fill in (optional — otherwise infer from the .tex)

- GitHub user / repo name: `[ ]`
- Presentation date: `[ ]`
- Paradoxes we most want playable: `[ ]`
- Games to build first: `[ ]`

---

## 1. Working rules for the agent

- **Read first.** Before writing anything, read every `.tex` file (follow `\input`/`\include`), the preamble, any `.bib`, and list the figure files.
- **One phase at a time, only after our confirmation.** Every phase ends with a 🛑 STOP. Never start the next phase until we explicitly say so in chat. Approving one phase does not approve the next, and "looks good" about a detail is not a go-ahead for the phase.
- **Hand-off log.** Keep `NOTES.md` updated (status, decisions, open questions, next step, which subagents ran and what they returned). Two different tools may work on this; anyone must be able to resume from `NOTES.md` alone. Commit to git after each phase.
- **Don't touch the LaTeX sources.** All output goes into `docs/`.
- **Faithful math.** Every formula, probability and payoff shown anywhere comes from the slides. If a game needs a number the slides don't give, propose one in PLAN.md and mark it as invented.
- **Prototype over polish**, but nothing may be broken: no console errors, no un-rendered math.
- **Language:** use the language of the slides for all UI text.

## 2. Subagents and review

**Use multiple subagents.** You (the main agent) are the coordinator: you plan each phase, split it into independent tasks, give each subagent a self-contained brief (which files to read, exactly what to produce, which files it may edit, how to report back), then merge and check the results. Subagents never start a new phase and never decide anything that belongs to us.

**File ownership.** A subagent edits only the files assigned to it. Shared files — `config.js`, `js/engine.js`, `css/theme.css`, `deck.html` scaffolding — are edited only by you; subagents return the changes they need in their report and you merge them. If your tool supports isolated worktrees, use them for parallel work.

**Review loop — every phase, no exceptions:**

1. **Build** — subagents do the work in parallel where tasks are independent.
2. **Self-check** — each subagent tests its own output (opens the page, checks the console, compares against the source) and reports what it verified and what it didn't.
3. **Coordinator review** — you read every subagent's diff and report yourself; don't merge anything you haven't looked at.
4. **Independent review** — a fresh reviewer subagent that did *not* produce the work checks it against the `.tex`, `PLAN.md` and this brief, and lists concrete problems with file and line/frame. Fixes go back to the subagent that owns the files, then the reviewer re-checks.
5. **Report to us and 🛑 STOP** — a short summary per subagent (what it did, what the reviewer found, what was fixed, what's still open), how to view the result, and questions. Then wait for our explicit go-ahead.

**Suggested split per phase:**

| Phase | Builder subagents (parallel) | Reviewer subagent(s) |
|---|---|---|
| 0 — Inventory | One per group of `.tex` files/sections; one for the preamble and macros; one for figures; one for the `.bib`. You write `PLAN.md` from their reports. | Checks that every frame is counted and every number/formula is transcribed exactly. |
| 1 — Deck | First you set up the scaffold (vendored libs, `deck.html`, start screen). Then: one subagent per range of ~10 frames; one for figure conversion; one for the "Try it" overlay and QR slide. | **Math reviewer:** compares every formula on the web slides with the `.tex`, side by side. **Layout reviewer:** checks 375 px and 1280 px, fragments, speaker notes, offline. |
| 2 — Engine + first game | Keep this mostly with you or one subagent: the engine is the foundation. A second subagent can make the placeholder sprites. | Plays the game at phone and laptop widths; checks the verdict logic for every possible choice pattern and the reveal formulas against the slides. |
| 3 — Remaining games | One subagent per game, each owning only `js/games/<id>.js`, its CSS and its sprites; it returns its `config.js` entry for you to merge. | One reviewer per game (rules, numbers, verdict logic, mobile layout), then one reviewer for the hub and Report Card as a whole. |
| 4 — Deploy + QA | One subagent per browser/screen-size set from the QA checklist; one for `README.md`. | You collect all findings, assign fixes, and re-run the failed checks. |

## 3. What we're building

A team presentation on paradoxes of choice under uncertainty, delivered in two parts:

1. **Presentation** — presenter-driven, laptop → projector. The LaTeX deck converted to the web, with "Try it" slides that launch a mini-game live.
2. **Games** — after the talk, the audience opens the site on their phones (QR code on the last slide) and plays mini-games that make them *experience* each paradox: they make real choices first, then the game reveals what their choices imply and which axiom of expected utility they just violated (if any).

Start screen: pixel-art title with two big buttons — **▶ Presentation** and **🎮 Games**.

## 4. Stack and hard constraints

- **Plain HTML/CSS/JS. No React, no bundler, no build step, no server code.** (Teammates must be able to edit HTML directly; GitHub Pages serves it as-is.)
- **reveal.js** for the deck (keyboard + swipe, fragments, speaker notes on `S`, fullscreen on `F`), with its built-in **KaTeX math plugin**.
- **Vendor everything:** download pinned versions of reveal.js, KaTeX (including its fonts), any small libs, and the pixel font into `docs/vendor/`, and point reveal's KaTeX plugin at the local copy (its `local` option). **No CDN or external request at runtime** — lecture-hall Wi-Fi is unreliable.
- **Must work two ways:** (a) double-clicking `docs/index.html` (`file://`), and (b) on GitHub Pages under `/<repo>/`. Therefore: classic `<script>` tags only (no ES-module imports, no `fetch()` of local files), only relative paths, and add an empty `docs/.nojekyll`.
- **Responsive:** 360 px phone portrait up to a 1920 px projector. Games are mobile-first (tap targets ≥ 44 px); the deck is 16:9 and readable from the back of a room.
- **Storage:** `localStorage` only for progress, always wrapped in try/catch; everything must work without it.
- No analytics, no tracking, no accounts.
- Respect `prefers-reduced-motion`. Don't rely on color alone to convey meaning.

## 5. File layout

```
docs/
  index.html        start screen (Presentation / Games)
  deck.html         reveal.js deck converted from the .tex
  play.html         games hub + game runner (hash routes, e.g. play.html#allais)
  config.js         THE single place for anything a teammate may want to change
  css/              theme.css, deck.css, games.css, games/<id>.css
  js/               engine.js, rng.js, charts.js, games/<id>.js
  assets/
    sprites/        chest_gold.png, armor_heavy.png, potion_red.png, …
    ui/  figures/  audio/
  vendor/           reveal.js, katex, qr lib, fonts (pinned versions)
  .nojekyll
README.md           how to run, swap art, change numbers, add a game, deploy
```

### config.js (one file, plain `window.CONFIG = {…}`)

- `siteUrl` — used for the QR code on the last slide.
- `katexMacros` — the preamble's `\newcommand`s, shared by deck and games.
- `assets` — every image by key. Code refers to keys only, never to file paths, so swapping art means replacing a file and editing its entry here:
  ```js
  assets: {
    chest_gold: { file: "assets/sprites/chest_gold.png" },
  }
  ```
- `games` — all text, probabilities, payoffs and slide references, e.g.:
  ```js
  allais: {
    title: "The Merchant's Chests",      // never names the paradox before the reveal
    paradox: "Allais paradox", slideRefs: [12, 13],
    rounds: [
      { id: "r1", prompt: "…", options: [
        { id: "A", label: "Iron-bound chest", sprite: "chest_iron",
          lottery: [{ p: 1.00, x: 1000 }] },
        { id: "B", label: "Enchanted chest", sprite: "chest_gold",
          lottery: [{ p: 0.89, x: 1000 }, { p: 0.10, x: 5000 }, { p: 0.01, x: 0 }] } ] },
      { id: "r2", /* … */ }
    ],
    reveal: { formulasTex: ["…copied verbatim from the .tex…"] }
  }
  ```
  (Numbers above are the textbook Allais example scaled to gold — replace with the slides' numbers.)

## 6. Phase 0 — Inventory and plan → 🛑 STOP

Write `PLAN.md` containing:

1. **Slide inventory** — table: frame # · title · contains (math / figure / table / overlays / columns / TikZ / notes).
2. **Preamble** — custom macros → KaTeX `macros` map; packages that affect output; anything KaTeX can't do.
3. **Concepts and paradoxes** in the deck, each with the exact formulas, numbers and frame numbers.
4. **Figures** — format of each (PNG / PDF / TikZ) and conversion plan.
5. **Game mapping** — for each paradox, the game from §9 that fits (or a better idea), the exact numbers to use, and where its "Try it" slide goes. **Recommend the 2 games to build first.**
6. **Subagent plan** for Phase 1 — which tasks, which files each subagent owns.
7. Risks and questions for us.

**🛑 STOP:** run the review loop (§2), then wait for our go-ahead.

## 7. Phase 1 — Convert the deck → 🛑 STOP

- One `<section>` per frame; frame title → `<h2>`.
- `\pause`, `\only`, `\onslide`, `\uncover`, overlay itemize → reveal **fragments** in the same order.
- `columns` → CSS grid that stacks on phones; `block` / `alertblock` / `exampleblock` → styled boxes; `\note{}` → `<aside class="notes">`; tables → HTML tables; `\cite` → "(Author Year)" plus a References slide from the `.bib`.
- **Math:** copy the LaTeX verbatim into `$…$` / `$$…$$`. Inside HTML, write `<` and `>` in math as `&lt;` / `&gt;` (or `\lt` / `\gt`) so the browser doesn't eat them. If KaTeX can't render something, make the smallest faithful change and log it in `CONVERSION_NOTES.md` with the frame number — never change meaning silently.
- **Figures:** raster → copy to `assets/figures/`; PDF → SVG (`pdftocairo -svg` / `dvisvgm`) or PNG at 2×; TikZ/pgfplots → compile as standalone if a TeX install exists, otherwise list them and ask us to export from Overleaf.
- **"Try it" slides:** a pixel-art button that opens the matching game in a full-screen overlay (iframe of `play.html#<id>`), with a visible close button that returns to the same slide. Propose placing each one *before* the slide that explains the paradox, so the room chooses before it knows.
- **Last slide:** "Play the games" + QR code (generated locally from `CONFIG.siteUrl`) + the short URL.
- **Done when:** every frame is present; fragments step correctly; a dev check logs **0** `.katex-error` elements; no horizontal scroll at 375 px; speaker view shows notes; it works offline.

**🛑 STOP:** run the review loop (§2), then wait for our go-ahead.

## 8. Phase 2 — Game engine + first game (vertical slice) → 🛑 STOP

Build one reusable, data-driven engine; each game is mostly config plus a small `js/games/<id>.js` for its verdict logic.

**Flow of every game:**

1. **Scene** — pixel-art setting + 2–3 lines of flavor text.
2. **Choice** — big option cards: sprite, label, and the lottery shown both as numbers (probability → payoff) and as a simple bar/pie. Tap, or keys `1` / `2` / `3`.
3. **Lock in** — no take-backs; the choice is recorded.
4. **Resolve** — short animated draw (chest opening, wheel, dice) using a seeded PRNG; `?seed=42` in the URL makes demos reproducible.
5. **Simulate ×1000** — runs each option many times and draws a small canvas histogram + running average with mean, SD and P(worst outcome). This makes EV vs. variance tangible.
6. **Reveal** (only after all rounds of that game are locked) — concept name, a 2–4 sentence plain explanation, the formula(s) from the slides via KaTeX with "Slide N", and a **"You vs. expected utility"** panel: the player's choice pattern and whether *any* utility function could produce it; if not, show the short algebra of the contradiction.
7. Back to hub.

**Art for the prototype:** generate simple **original** pixel sprites programmatically (e.g. 32×32 PNGs via a small Python/Pillow or Node script) with descriptive file names, rendered with `image-rendering: pixelated` at integer scales. If an image file is missing, the engine shows a labeled colored box and logs a warning — it never breaks.

**Hub:** cards with thematic names (not paradox names), a "done" badge per game, and at the end a **"Paradox Report Card"**: which paradoxes the player exhibited, their certainty equivalent / risk-aversion estimate if measured, and a screenshot-friendly layout.

**First game:** the top recommendation from PLAN.md (default: the Allais chests, if Allais is in the deck).

**🛑 STOP:** run the review loop (§2), show it at phone and laptop widths, list everything that is tunable from config.js, then wait for our go-ahead.

## 9. Game catalog — pick what matches the deck

Commercial games are **inspiration only**: they may be mentioned in flavor text or explanations, but no logos, characters, screenshots, music or ripped assets.

| Game | Concept / paradox | Mechanic | Reveal |
|---|---|---|---|
| **The Merchant's Chests** | Allais (common consequence; common-ratio variant), certainty effect | Two chest decisions, separated by another game so the structure isn't obvious | Pattern A+D (or B+C) contradicts the independence axiom; show the two inequalities that can't both hold |
| **The Mystery Merchant's Gem Bags** | Ellsberg, ambiguity aversion | Bet on a gem color drawn from a bag with known 50/50 mix vs. a bag with unknown mix; then bet on the other color | Preferring the known bag both times implies subjective probabilities that sum to < 1 |
| **The Doubling Tavern** | St. Petersburg | Enter the most you'd pay to play (slider); play; then simulate 10,000 games — the running average keeps creeping up while the median stays tiny | Infinite expected value vs. what you bid; Bernoulli's log-utility resolution; a tavern's finite bankroll |
| **The Bounty Board** *(Witcher-inspired)* | Certainty equivalent, risk premium, CRRA | Fixed fee vs. risky bounty, adjusted by bisection over ~6 rounds | Your CE, risk premium = EV − CE, implied CRRA coefficient on a scale. Avoid zero payoffs (CRRA utility of 0 is undefined for ρ ≥ 1) — use a positive floor or initial wealth as the slides do |
| **Armor or Vitality** *(Skyrim-inspired)* | Variance, mean-preserving spread, risk aversion | Same expected damage, different spread; survive a gauntlet; simulate 1,000 fights | Survival probability differs when there's a threshold — why variance matters to a risk-averse agent |
| **The Deep Mine** *(Minecraft-inspired)* | Expected value, push-your-luck | Each level: cash out or dig deeper (better ore, lava risk) | EV per level, the optimal stopping point vs. where the player stopped |
| **Plague in the Village** | Framing / reflection effect (prospect theory) | Same decision framed as "saved" vs. "lost"; both frames asked at separate times | Prospect-theory value function: concave for gains, convex for losses |
| **Two Quest Contracts** | Preference reversal (P-bet vs. $-bet) | Choose one contract, later set a selling price for each | Choice and price disagree → violates procedure invariance |
| **Hit Chance** *(XCOM-inspired)* | Probability weighting, gambler's fallacy | Estimate the real odds after streaks; displayed vs. real hit chance | Probability weighting function π(p). Verify any claim about a specific game's RNG before putting it on a slide |

**Design principles for every game:**

- **Choose before you know** — never name the paradox, show EV, or hint at the "rational" answer until choices are locked.
- **Disguise** paired rounds: separate them and vary the skin.
- **No shaming** — the reveal says "most people choose like you; here's why that's interesting."
- Hypothetical stakes in gold; probabilities shown exactly.
- Each game ≤ 2 minutes on a phone.

## 10. Phase 3 — Remaining games and polish → 🛑 STOP

Build the remaining agreed games in parallel, one subagent per game (see §2 for file ownership); merge and commit each game separately. Add optional Web Audio blips (generated in code, no files), **muted by default** with a toggle.

**🛑 STOP:** run the review loop (§2), then wait for our go-ahead.

## 11. Phase 4 — Deploy and QA → 🛑 STOP

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / `/docs`. On a free GitHub plan the repo must be **public**, which also publishes the `.tex`. If that's not okay, push only the contents of `docs/` to a separate repo. **Ask us before pushing or changing any repository settings.**
- **README.md:** run locally, swap an image, change game numbers, add a game, deploy.
- **QA checklist:** Chrome, Firefox, Safari on iOS; 375×667, 768, 1280, 1920; airplane-mode test; keyboard-only run; reduced motion; zero console errors; zero KaTeX errors; QR code scans and opens the hub.

**🛑 STOP:** run the review loop (§2), report the QA results, then wait for our confirmation.

## 12. Optional — live class results (ask before starting)

Default: none; each player sees only their own results. If we want a "How the room chose" slide, propose 2–3 free-tier options (e.g. Supabase or Firebase) with trade-offs: anonymous inserts of `{game, round, choice}` only, no names, and the site must still work if the service is unreachable. **Don't add any of this without our approval.**

## 13. Out of scope

Accounts, analytics, frameworks or bundlers, server code, real money, and any copyrighted game assets.
