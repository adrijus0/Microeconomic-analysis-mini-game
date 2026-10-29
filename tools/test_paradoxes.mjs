/*
 * test_paradoxes.mjs — checks for the St. Petersburg and Ellsberg logic, the
 * caps wallet in docs/js/store.js, the shape of every encounter in
 * docs/config.js, and a copy budget that keeps phone screens short.
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
      if (option.wins) {
        const kinds = option.wins.filter((k) => ["nuka", "star", "plain"].includes(k));
        ok(id + "/" + option.id + " wins only on known cap kinds", kinds.length === option.wins.length && kinds.length > 0);
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

/* --------------------------------------------------------- copy budget */

/* Nobody reads much on a phone: these limits keep the game screens short.
   The "Show the math" notes are opt-in and not budgeted. */
const words = (text) => String(text || "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
function budget(label, text, max) {
  const n = words(text);
  ok(label + " ≤ " + max + " words", n <= max, n + " words: " + JSON.stringify(text));
}
budget("landing lead", CONFIG.landing.lead, 12);
order.forEach((id) => {
  const game = CONFIG.games[id];
  if (!game) return;
  budget(id + " hook", game.hook, 8);
  budget(id + " scene lines", (game.scene.lines || []).join(" "), 30);
  if (game.beat) budget(id + " beat", (game.beat.lines || []).join(" "), 12);
  budget(id + " takeaway", game.reveal.takeaway, 16);
  budget(id + " crowd", game.reveal.crowd, 8);
  (game.rounds || []).forEach((round) => {
    budget(id + "/" + round.id + " prompt", round.prompt, 10);
    (round.options || []).forEach((option) => {
      budget(id + "/" + option.id + " label", option.label, 4);
      if (option.note) budget(id + "/" + option.id + " note", option.note, 8);
    });
  });
});

/* ---------------------------------------------------------- caps wallet */

{
  const events = [];
  const win = {
    CONFIG,
    CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
    dispatchEvent: (e) => events.push(e)
  };
  const box = { window: win };
  vm.createContext(box);
  vm.runInContext(readFileSync(resolve(root, "docs/js/store.js"), "utf8"), box);
  const S = win.GameStore;
  const last = () => events[events.length - 1].detail;
  ok("wallet starts at CONFIG.wallet.start (100)", S.wallet() === 100 && CONFIG.wallet.start === 100);

  S.beginRun("stpetersburg");
  S.runCaps("fee", -10);
  ok("the fee leaves the wallet on lock-in", S.wallet() === 90 && last().to === 90 && !last().quiet);
  S.runCaps("fee", 8 - 10, { delay: 650 });
  ok("the prize replaces the fee with the net", S.wallet() === 98 && last().delay === 650);
  S.commitRun();
  ok("the reveal commits the run", S.wallet() === 98 && S.walletExcept("stpetersburg") === 100);

  S.beginRun("allais");
  S.runCaps("r1", 2400);
  S.runCaps("r2", 2500);
  S.commitRun();
  ok("Allais adds both jobs", S.wallet() === 98 + 4900);

  /* Replay: old caps set aside quietly, then the new run counts live. */
  const before = events.length;
  S.beginRun("allais");
  ok("a replay sets the old caps aside quietly", S.wallet() === 98 && last().quiet === true);
  S.runCaps("r1", 2400);
  ok("a replay win floats green, not red", last().to - last().from === 2400 && events.length === before + 2);
  S.cancelRun();
  ok("leaving a replay early restores the old caps", S.wallet() === 98 + 4900 && last().quiet === true);

  S.beginRun("allais");
  S.runCaps("r1", 0);
  S.runCaps("r2", 0);
  S.commitRun();
  ok("a finished replay replaces the deal's caps (no farming)", S.wallet() === 98);

  S.beginRun("ellsberg");
  S.runCaps("fee", -5);
  S.cancelRun();
  ok("an unfinished first run leaves the wallet as it was", S.wallet() === 98);
  ok("every change fires wallet:change", events.every((e) => e.type === "wallet:change"));
  ok("all() hides the wallet's reserved key", !Object.keys(S.all()).some((k) => k.charAt(0) === "_"));
  S.clear();
  ok("wiping the Pip-Boy resets the wallet to 100", S.wallet() === 100);
}

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
    /* Live wallet: with 2,500 caps Bernoulli's bound rises to ≈ 12.25. */
    near("init() takes w from the wallet", S.init(null, game, { wallet: 2500 }).wealth, 2500, 0);
    ok("init() falls back to slide 6's w = 100", S.init(null, game, {}).wealth === 100);
    near("maxPrice(2,500)", S.maxPrice(2500), 12.25, 0.01);
    const rich = S.reveal({ [round.id]: "f10" }, game, { wealth: 2500 });
    ok("10 caps is fair with 2,500 caps", rich.stamp.tone === "green" && rich.crowdMatch === true);
    ok("the reveal tile names the wallet", rich.tiles[1].note.includes("2,500") && rich.tiles[1].value.startsWith("12.2"));
    ok("the math keeps slide 6's numbers and adds yours",
      rich.math.length === 4 && rich.math[2].tex.includes("7.79") && rich.math[3].tex.includes("12.2"));
    const poor = S.reveal({ [round.id]: "f10" }, game, { wealth: 100 });
    ok("10 caps is a high roller with 100 caps", poor.stamp.tone === "amber" && poor.math.length === 3);
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
    ok(pattern + " chain tells bet 1, then bet 2", r.chain.length === 2 && r.chain[1].startsWith("Bet 2"));
    ok(pattern + " stayed/switched matches consistency", want.consistent
      ? r.chain[1].includes("You stayed with")
      : r.chain[1].includes("You switched to"), r.chain[1]);
  });

  {
    const r = E.reveal({ [game.rounds[0].id]: "I", [game.rounds[1].id]: "IV" }, game, null);
    ok("I+IV bet 1 needs π_R > π_S", r.math[0].tex === "\\pi_R > \\pi_S", r.math[0].tex);
    ok("I+IV bet 2 shows the slide 12 form",
      r.math[1].tex === "\\pi_S + \\pi_P > \\pi_R + \\pi_P \\Rightarrow \\pi_S > \\pi_R", r.math[1].tex);
    ok("I+IV says the known odds won like most people", r.line.includes("known odds") && r.line.includes("most people"), r.line);
  }

  ok("known(): I and IV have known odds, II and III do not",
    E.known(BETS.I) && !E.known(BETS.II) && !E.known(BETS.III) && E.known(BETS.IV));

  /* The cards' win chances come from `wins`: 33%, 0–67%, 33–100%, 67%. */
  const want = { I: [33, 33], II: [0, 67], III: [33, 100], IV: [67, 67] };
  Object.keys(BETS).forEach((id) => {
    const c = E.chance(BETS[id]);
    ok(id + " win chance is " + want[id].join("–") + "%", c.lo === want[id][0] && c.hi === want[id][1], JSON.stringify(c));
  });
  ok("bet 2 mirrors bet 1 plus plain yellow",
    game.rounds[1].options.every((o, i) =>
      o.wins.filter((k) => k !== "plain").join() === game.rounds[0].options[i].wins.join() && o.wins.includes("plain")));

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

/* ------------------------------------------------------ Loss aversion */

const laPath = resolve(root, "docs/js/games/lossaversion.js");
if (existsSync(laPath)) {
  const L = require(laPath);
  const game = CONFIG.games.lossaversion;
  const round = game.rounds[0];
  const flip = round.options.find((o) => o.id === "F");
  /* Slide 13: lose 100 or win 110, expected gain +5. */
  near("the flip's expected gain (slide 13)", L.ev(flip.lottery), 5, 1e-9);
  /* Slide 14: α = β = 0.88, λ = 2.25, γ = 0.61. */
  near("w(1/2) with γ = 0.61", L.w(0.5), 0.4206, 0.0005);
  near("prospect value of the flip", L.ptValue(flip.lottery), -28.14, 0.01);
  ok("v(−100) = −2.25 · 100^0.88", Math.abs(L.v(-100) + 2.25 * 100 ** 0.88) < 1e-9);
  const walk = L.reveal({ flip: "W" }, game);
  const took = L.reveal({ flip: "F" }, game);
  ok("walking away matches most people", walk.crowdMatch === true && walk.stamp.tone === "red");
  ok("flipping takes the edge", took.crowdMatch === false && took.stamp.tone === "green");
  ok("the reveal shows +5, 2.25× and the felt value", walk.tiles[0].value === "+5 caps" &&
    walk.tiles[1].value === "2.25×" && walk.tiles[2].value === "-28");
  for (let i = 0; i < 20; i += 1) {
    const o = L.resolve(round, flip, {}, RNG.create("la|" + i));
    const w = L.resolve(round, round.options.find((x) => x.id === "W"), {}, RNG.create("la|" + i));
    if (!((o.face === "H" ? o.payoff === 110 : o.payoff === -100) && w.payoff === 0 && w.face === o.face)) {
      ok("resolve seed " + i + " pays heads +110 / tails −100, walking pays 0", false, JSON.stringify([o, w]));
      break;
    }
    if (i === 19) ok("resolve pays heads +110 / tails −100, walking pays 0 (20 seeds)", true);
  }
}

/* -------------------------------------------------- stats and perks */

ok("one rank per possible match count (0 … " + order.length + ")", CONFIG.report.ranks.length === order.length + 1);
ok("the Report Card has an ending line", typeof CONFIG.report.ending === "string" && CONFIG.report.ending.length > 0);
order.forEach((id) => {
  const game = CONFIG.games[id];
  if (!game || !game.perks) return;
  ok(id + " perk names differ from its stamps",
    !["crowd", "other"].some((k) => /^(high roller|loss averse)$/i.test(game.perks[k].name)));
  const fees = game.rounds.flatMap((r) => r.options).map((o) => Math.max(Number(o.fee) || 0,
    -Math.min(0, ...(o.lottery || []).map((p) => p.x))));
  const worst = Math.max(0, ...fees);
  ok(id + " stakes cover its worst loss (" + worst + ")", worst === 0 || Number(game.stake) >= worst);
});

order.forEach((id) => {
  const game = CONFIG.games[id];
  if (!game) return;
  const ids = game.rounds.flatMap((r) => r.options.map((o) => o.id));
  ok(id + " gives every option S.P.E.C.I.A.L. points",
    !!game.special && ids.every((o) => Number.isFinite(game.special.points[o])));
  ok(id + " has both perks", !!(game.perks && game.perks.crowd && game.perks.other &&
    game.perks.crowd.name && game.perks.other.text));
});

/* ----------------------------------------------------------- summary */

console.log("");
if (failures) {
  console.error("FAILED  " + failures + " of " + checks + " checks.");
  process.exit(1);
}
console.log("PASSED  " + checks + " of " + checks + " checks.");
