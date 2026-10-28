/*
 * test_paradoxes.mjs — checks for the St. Petersburg and Ellsberg logic and
 * for the shape of every encounter in docs/config.js.
 *
 * Run from the repository root:
 *   node tools/test_paradoxes.mjs
 *
 * No dependencies. Loads docs/config.js in a vm sandbox with `window = {}`
 * and requires the game modules through createRequire.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(import.meta.url);

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(readFileSync(resolve(root, "docs/config.js"), "utf8"), sandbox);
const CONFIG = sandbox.window.CONFIG;
const RNG = require(resolve(root, "docs/js/rng.js"));

let checks = 0;
let failures = 0;

function ok(label, condition, detail) {
  checks += 1;
  if (condition) {
    console.log("PASS  " + label);
  } else {
    failures += 1;
    console.error("FAIL  " + label + (detail ? "\n      " + detail : ""));
  }
}

function near(label, actual, expected, tolerance) {
  ok(
    label + " ≈ " + expected,
    Math.abs(actual - expected) <= tolerance,
    "actual " + actual
  );
}

/* ------------------------------------------------------- config sanity */

const order = CONFIG.encounterOrder || [];
ok("encounterOrder is non-empty", order.length > 0);
order.forEach((id) => {
  const game = CONFIG.games[id];
  ok(id + " exists in CONFIG.games", !!game);
  if (!game) return;
  ok(id + " has a reveal slide number", Number.isInteger(game.reveal && game.reveal.slide));
  ok(id + " names a logic module", typeof game.logic === "string");
  ok(id + " has report breaks/fix", !!(game.report && game.report.breaks && game.report.fix));

  const seen = new Set();
  (game.rounds || []).forEach((round) => {
    ok(id + "/" + round.id + " round id is unique", !seen.has(round.id));
    seen.add(round.id);
    const ids = new Set();
    (round.options || []).forEach((option) => {
      ok(id + "/" + round.id + "/" + option.id + " option id is unique", !ids.has(option.id));
      ids.add(option.id);
      if (option.lottery) {
        const total = option.lottery.reduce((sum, part) => sum + part.p, 0);
        near(id + "/" + option.id + " lottery sums to 1", total, 1, 1e-9);
      }
      if (option.segments) {
        const total = option.segments.reduce((sum, seg) => sum + seg.n, 0);
        ok(id + "/" + option.id + " segments cover 90 caps", total === 90, "total " + total);
      }
      if (option.sprite) {
        ok(id + "/" + option.id + " sprite is registered", !!CONFIG.assets[option.sprite]);
      }
    });
  });
  if (game.scene && game.scene.sprite) {
    ok(id + " scene sprite is registered", !!CONFIG.assets[game.scene.sprite]);
  }
});

Object.keys(CONFIG.assets).forEach((key) => {
  ok("asset " + key + " file exists", existsSync(resolve(root, "docs", CONFIG.assets[key].file)));
});

/* ---------------------------------------------------- St. Petersburg */

const stpPath = resolve(root, "docs/js/games/stpetersburg.js");
if (existsSync(stpPath)) {
  const S = require(stpPath);
  near("maxPrice(100) — slide 6", S.maxPrice(100), 7.79, 0.005);
  near("maxPrice(10^6) — slide 6", S.maxPrice(1e6), 20.87, 0.005);
  [5, 10, 25, 50, 100].forEach((fee) => {
    const w = S.wealthFor(fee);
    near("wealthFor(" + fee + ") round-trips", S.maxPrice(w), fee, 1e-3);
  });
  ok("wealthFor(2) is 0 (any wealth pays 2)", S.wealthFor(2) === 0);
  ok("wealthFor beyond its range is Infinity, not a wrong number", S.wealthFor(1000) === Infinity);
  ok("wealthFor(NaN) is NaN", Number.isNaN(S.wealthFor(NaN)));
  ok("maxPrice grows with wealth", S.maxPrice(1000) > S.maxPrice(100));

  /* Prize rule: tails on flip k pays 2^k. */
  for (let i = 0; i < 50; i += 1) {
    const g = S.play(RNG.create("test|" + i));
    const valid =
      g.flips.length === g.k &&
      g.flips[g.k - 1] === "T" &&
      g.flips.slice(0, -1).every((f) => f === "H") &&
      g.prize === 2 ** g.k;
    if (!valid) {
      ok("play() seed " + i + " follows the slide 6 rule", false, JSON.stringify(g));
      break;
    }
    if (i === 49) ok("play() follows the slide 6 rule on 50 seeds", true);
  }
  const a = S.play(RNG.create("same"));
  const b = S.play(RNG.create("same"));
  ok("play() is deterministic for a seed", JSON.stringify(a) === JSON.stringify(b));

  const game = CONFIG.games.stpetersburg;
  if (game) {
    const round = game.rounds[0];
    round.options.forEach((option) => {
      const r = S.reveal({ [round.id]: option.id }, game);
      const fee = Number(option.fee);
      ok(
        "fee " + fee + " stamp is " + (fee <= 7.79 ? "green" : "amber"),
        r.stamp.tone === (fee <= 7.79 ? "green" : "amber")
      );
      ok("fee " + fee + " crowdMatch is " + (fee <= 7.79), r.crowdMatch === (fee <= 7.79));
      ok("fee " + fee + " line has no TeX", !/\\/.test(r.line));
    });
  }
}

/* ------------------------------------------------------------ Ellsberg */

const ellPath = resolve(root, "docs/js/games/ellsberg.js");
if (existsSync(ellPath)) {
  const E = require(ellPath);
  /* The slide 11 bets, reskinned: red = Nuka, black = star, yellow = plain. */
  const BETS = {
    I: { id: "I", wins: ["nuka"] },
    II: { id: "II", wins: ["star"] },
    III: { id: "III", wins: ["nuka", "plain"] },
    IV: { id: "IV", wins: ["star", "plain"] }
  };
  const fixture = {
    rounds: [
      { id: "r1", options: [BETS.I, BETS.II] },
      { id: "r2", options: [BETS.III, BETS.IV] }
    ]
  };
  const game = CONFIG.games.ellsberg || fixture;

  ok("I ≻ II ⇔ fewer than 30 star caps", JSON.stringify(E.interval(BETS.I, BETS.II)) === '{"lo":0,"hi":30}');
  ok("IV ≻ III ⇔ more than 30 star caps", JSON.stringify(E.interval(BETS.IV, BETS.III)) === '{"lo":30,"hi":60}');

  const expected = {
    "I+IV": { consistent: false, kind: "ambiguity-averse", crowd: true },
    "II+III": { consistent: false, kind: "ambiguity-seeking", crowd: false },
    "I+III": { consistent: true, kind: "consistent", crowd: false },
    "II+IV": { consistent: true, kind: "consistent", crowd: false }
  };
  Object.keys(expected).forEach((pattern) => {
    const [a, b] = pattern.split("+");
    const choices = { [game.rounds[0].id]: a, [game.rounds[1].id]: b };
    const v = E.verdict(choices, game);
    const r = E.reveal(choices, game, { mix: { nuka: 30, star: 12, plain: 48 } });
    const want = expected[pattern];
    ok(pattern + " consistent = " + want.consistent, v.consistent === want.consistent);
    ok(pattern + " kind = " + want.kind, v.kind === want.kind, "got " + v.kind);
    ok(pattern + " crowdMatch = " + want.crowd, r.crowdMatch === want.crowd);
    ok(pattern + " stamp tone", r.stamp.tone === (want.consistent ? "green" : "red"));
    ok(pattern + " contradiction ⊥ only when inconsistent", r.math[2].tex.includes("\\bot") === !want.consistent);
    ok(pattern + " chain has 3 steps", r.chain.length === 3);
    ok(pattern + " chain ends right", want.consistent
      ? !r.chain[2].includes("No belief")
      : r.chain[2].includes("No belief fits both"), r.chain[2]);
  });

  {
    const r = E.reveal({ [game.rounds[0].id]: "I", [game.rounds[1].id]: "IV" }, game, null);
    ok("I+IV bet 1 needs π_N > π_S", r.math[0].tex === "\\pi_N > \\pi_S", r.math[0].tex);
    ok("I+IV bet 2 shows the slide 12 form",
      r.math[1].tex === "\\pi_S + \\pi_P > \\pi_N + \\pi_P \\Rightarrow \\pi_S > \\pi_N", r.math[1].tex);
    ok("I+IV step 3 compares over 60 with exactly 60",
      r.chain[2].includes("III (over 60)") && r.chain[2].includes("IV (exactly 60)"), r.chain[2]);
  }

  /* Renamed ids give the same verdicts: nothing matches on "I" or "IV". */
  const renamed = JSON.parse(JSON.stringify(game));
  renamed.rounds.forEach((round) => round.options.forEach((o) => { o.id = "x" + o.id; }));
  const rv = E.verdict({ [renamed.rounds[0].id]: "xI", [renamed.rounds[1].id]: "xIV" }, renamed);
  ok("renamed ids: I+IV is still ambiguity-averse", rv.kind === "ambiguity-averse");

  /* The hidden mix and the draw. */
  const ctx = E.init(RNG.create("mix"));
  ok("hidden mix sums to 90 with 30 Nuka caps",
    ctx.mix.nuka === 30 && ctx.mix.star + ctx.mix.plain === 60 && ctx.mix.star >= 0 && ctx.mix.star <= 60);
  const counts = { nuka: 0, star: 0, plain: 0 };
  const rng = RNG.create("draws");
  const mix = { nuka: 30, star: 0, plain: 60 };
  for (let i = 0; i < 900; i += 1) counts[E.drawCap(rng, mix)] += 1;
  ok("no star cap is drawn when the barrel has none", counts.star === 0);
  ok("Nuka draws ≈ 1/3 of 900", counts.nuka > 240 && counts.nuka < 360, JSON.stringify(counts));
  const out = E.resolve(fixture.rounds[0], BETS.I, { mix: { nuka: 90, star: 0, plain: 0 } }, RNG.create("x"));
  ok("resolve pays 100 caps on a winning cap", out.payoff === 100 && out.cap === "nuka");

  /* One cap settles both bets, drawn after both are placed. */
  const allNuka = { mix: { nuka: 90, star: 0, plain: 0 } };
  const both = E.resolveAll(fixture.rounds, { r1: "I", r2: "III" }, allNuka, RNG.create("y"));
  ok("resolveAll: a Nuka cap wins I and III (200 caps)", both.payoff === 200 && both.rows.every((r) => r.win));
  const split = E.resolveAll(fixture.rounds, { r1: "I", r2: "IV" }, allNuka, RNG.create("y"));
  ok("resolveAll: a Nuka cap wins I but not IV (100 caps)", split.payoff === 100 && split.rows[0].win && !split.rows[1].win);
  const ctxMissing = {};
  E.resolveAll(fixture.rounds, { r1: "I", r2: "IV" }, ctxMissing, RNG.create("z"));
  ok("resolveAll keeps one barrel on ctx when it was missing", !!ctxMissing.mix);
  ok("the game draws once, after bet 2", game.resolveAtEnd === true || game === fixture);
}

/* ----------------------------------------------------------- summary */

console.log("");
if (failures) {
  console.error("FAILED  " + failures + " of " + checks + " checks.");
  process.exit(1);
}
console.log("PASSED  " + checks + " of " + checks + " checks.");
