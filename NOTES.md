# NOTES — hand-off log

Anyone (human or agent) should be able to resume from this file alone. Update it at the end of every phase.

---

## Status

- **Current phase:** Phase 0 complete; 🛑 **waiting for explicit go-ahead for Phase 1**.
- **Next step:** on approval, Phase 1 (deck) — vendor reveal.js + KaTeX locally, scaffold `docs/`, then run the six builder subagents in `PLAN.md` §6.
- **Do not:** touch `Microeconomic_analysis__Copy_/` (the LaTeX sources), start Phase 2, or push to any remote.

## Phase log

### Phase 0 — Inventory and plan (done)

| What | Where |
|---|---|
| Plan (inventory, macros, concepts, figures, game mapping, subagent plan, risks, questions) | `PLAN.md` |
| Art shopping list and asset-swap rules | `ASSETS.md` |
| Frame-by-frame inventory, frames 1–15 | `notes/phase0/frames-a.md` |
| Frame-by-frame inventory, frames 16–29 | `notes/phase0/frames-b.md` |
| Preamble / KaTeX / figures / bibliography audit | `notes/phase0/preamble.md` |
| Independent review + fixes | `notes/phase0/review.md` |

**Subagents that ran in Phase 0**

| ID | Session | Task | Result |
|---|---|---|---|
| A | `ses_e7db81a10ffeTCGBkuPKPYRXLQ` | Inventory frames 1–15 | 15/15 frames, 20 display groups, 69 inline exprs; 2 `\pause`s located; no notes |
| B | `ses_e7db81a0fffeLKHGdLiTTGDZOv` | Inventory frames 16–29 | 14/14 frames, 5 tables cell-by-cell, 2 pgfplots option-by-option |
| C | `ses_e7db81a0fffdliGDuvQQu5ol1G` | Preamble, macros, figures, bib | KaTeX 0.16.11 installed and used: 172 segments, 169 clean, 3 extractor artefacts; only `\X` needs a macro; 12 bib entries; 3 TikZ + 1 raster |
| R | `ses_e7dad5e99ffeJRUdHq2NX6aB86` | Independent review | PASS WITH FIXES: 5 must-fix, 11 should-fix; 35 numeric spot-checks, **0 mismatches**; 29/29 frames, 6/6 tables, 3/3 TikZ, 12/12 bib |

**Fix round (after review):** must-fixes and accepted should-fixes were sent back to A, B and C, each editing only its own file.

- A fixed: TOC = 8 sections (not 3); frame 10 overlay = 2 fragments with only the first inside `gameblock`; `align*` is native in display mode; "only frame 10 has inline-only math" → frames 7, 10, 12; all 7 dashed lines cross the triangle; frames 1–2 are not `[plain]`; removed three false flags (`e^{2^k}`, `2^{20}≈10^6`, `W.p.` capitalisation).
- B fixed: frame 16 section = Allais; Prelec → Tversky–Kahneman (1992); frame 19 heading sizes are both `\small`; three count/line slips.
- C fixed: title-page logo is bottom-centred; `\vspace` list + px scale; 26 display constructs; `\tag` supported in display mode; frame 19 font-size claim; several line references; §6 retitled so only `\chi` is called an error.
- C pushed back, correctly: `\vline` is **not** supported by KaTeX 0.16.11 (verified: 0 occurrences in the bundle, 4 failed parses). The plan follows C's evidence, not the reviewer's claim.

## Decisions made so far

All in `PLAN.md` §0 (D1–D10). The ones likely to be revisited:

1. **16:9 at 1280 × 720**, though the source is 4:3 (128 × 96 mm). 1 cm = 100 px mapping.
2. **Four games** — Allais, Ellsberg, St. Petersburg, Framing — skinned as Fallout, Cyberpunk 2077, Witcher 3, Skyrim. Numbers stay the slides'.
3. **Allais first** (Phase 2), **Ellsberg second**.
4. **Original pixel art**, every sprite replaceable via `config.js`; the manifest is `ASSETS.md`.
5. **Four "Try it" slides** before frames 8, 10, 17, 19 + a final QR slide → 35 web slides.
6. **References split 6 + 6**, author–year.
7. **No speaker notes** in Phase 1 (source has none).
8. Git initialised locally, one commit per phase, nothing pushed.

## Open questions for the team

Full list in `PLAN.md` §7. Blocking before/at Phase 1:

- Aspect ratio 16:9 confirmed? (affects every layout choice)
- May we fix the `\chi` typo on frame 13?
- Which title string: "Choices" (`.tex`) or "Choice" (brief)?
- Correct the supervisor line to "Assoc. Prof. Dmitrij Celov"?
- All four Try-it slides, or only Allais + Ellsberg live?
- `siteUrl` / GitHub repo for the QR code (not filled in the brief).

## Facts that are easy to get wrong (keep)

- The deck has **3 `\pause`** total: two on frame 10 (L276, L283), one on frame 17 (L473). Only the first frame-10 pause is inside the `gameblock`.
- **0 `\note{}`**, **6 tables**, **3 TikZ**, **1 raster**, **26 display-math constructs**, **12 bib entries**.
- `VUMIF.sty` **redefines `blue`** as `#02487F`; TikZ `blue` is navy, not pure blue.
- `\checkmark`, `\boxed`, `align*`, `cases`, `\\[4pt]` are **native** in KaTeX 0.16.11. `\vline`, `tabular`, `\multirow`, `\vspace`, `\hfill` are not.
- Beamer's `\tableofcontents` lists **all 8** numbered sections, not the ones encountered so far.
- The `C≻D` / `D≻C` wording across frames 11–12–16 is **consistent** (observed vs EU-implied); do not "fix" it.
- `2^{20} ≈ 10^6` and prizes `e^{2^k}` on frame 9 are **correct** (with `u=ln`, `ln(e^{2^k}) = 2^k`), not typos.
