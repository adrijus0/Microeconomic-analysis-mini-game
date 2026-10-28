/*
 * test_allais_verdicts.mjs — exhaustive check of AllaisGame.verdict().
 *
 * Run from the repository root:
 *   node tools/test_allais_verdicts.mjs
 *
 * No dependencies. Loads docs/config.js in a vm sandbox with `window = {}`,
 * then requires docs/js/games/allais.js through createRequire. If the
 * coordinator has not merged the games.allais entry into config.js yet, the
 * test falls back to the fixture below (identical numbers) and says so.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const configPath = resolve(root, "docs/config.js");
const gamePath = resolve(root, "docs/js/games/allais.js");

/* Fallback only: exactly the entry proposed for docs/config.js. */
const FIXTURE = {
  id: "allais",
  title: "The Caravan Lockboxes",
  paradox: "Allais paradox",
  slideRefs: [10, 11, 12, 13, 14, 15, 16, 22],
  rounds: [
    {
      id: "r1",
      prompt:
        "The caravan master offers payment in sealed lockboxes. The road through raider country decides what actually reaches the coast. Which do you carry?",
      options: [
        {
          id: "A",
          label: "Sealed strongbox",
          sprite: "allais_chest_a",
          lottery: [{ p: 1.0, x: 2400 }]
        },
        {
          id: "B",
          label: "Raider route crate",
          sprite: "allais_chest_b",
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
      prompt: "Two more lockboxes, two more trips. Which one do you take?",
      options: [
        {
          id: "C",
          label: "One-trip satchel",
          sprite: "allais_chest_c",
          lottery: [
            { p: 0.33, x: 2500 },
            { p: 0.67, x: 0 }
          ]
        },
        {
          id: "D",
          label: "Two-trip satchel",
          sprite: "allais_chest_d",
          lottery: [
            { p: 0.34, x: 2400 },
            { p: 0.66, x: 0 }
          ]
        }
      ]
    }
  ]
};

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(readFileSync(configPath, "utf8"), sandbox, {
  filename: configPath
});

const configGame = sandbox.window.CONFIG && sandbox.window.CONFIG.games
  ? sandbox.window.CONFIG.games.allais
  : undefined;

const usingFixture = !configGame;
const game = configGame || FIXTURE;

const require = createRequire(import.meta.url);
const AllaisGame = require(gamePath);

let failures = 0;
let checks = 0;

function pass(message) {
  checks += 1;
  console.log("PASS  " + message);
}

function fail(message, detail) {
  checks += 1;
  failures += 1;
  console.error("FAIL  " + message);
  if (detail) {
    console.error(detail);
  }
}

function firstDifference(actual, expected) {
  const limit = Math.min(actual.length, expected.length);
  let index = 0;
  while (index < limit && actual[index] === expected[index]) {
    index += 1;
  }
  return index;
}

function expectEqual(label, actual, expected) {
  if (actual === expected) {
    pass(label);
    return;
  }
  const index = firstDifference(actual, expected);
  fail(
    label,
    "  expected: " + JSON.stringify(expected) +
      "\n  actual:   " + JSON.stringify(actual) +
      "\n  first difference at index " + index +
      "\n  expected there: " + JSON.stringify(expected.slice(index, index + 24)) +
      "\n  actual there:   " + JSON.stringify(actual.slice(index, index + 24))
  );
}

function expectTrue(label, condition, detail) {
  if (condition) {
    pass(label);
    return;
  }
  fail(label, detail);
}

function expectNumber(label, actual, expected, tolerance = 1e-9) {
  if (typeof actual === "number" && Math.abs(actual - expected) <= tolerance) {
    pass(label + " = " + actual);
    return;
  }
  fail(
    label,
    "  expected: " + expected + " (±" + tolerance + ")" +
      "\n  actual:   " + String(actual)
  );
}

/* ------------------------------------------------------------------ setup */

if (usingFixture) {
  console.log(
    "NOTE  docs/config.js has no games.allais yet; using the identical local fixture."
  );
}
expectTrue(
  "docs/config.js loads and exposes window.CONFIG",
  sandbox.window.CONFIG && typeof sandbox.window.CONFIG === "object"
);
expectTrue(
  "AllaisGame.verdict is a function",
  AllaisGame && typeof AllaisGame.verdict === "function"
);

/* --------------------------------------------------------- the four paths */

const PATTERNS = [
  { r1: "A", r2: "C", pattern: "A + C", consistent: false, relation: "opposite", bot: true },
  { r1: "A", r2: "D", pattern: "A + D", consistent: true, relation: "same", bot: false },
  { r1: "B", r2: "C", pattern: "B + C", consistent: true, relation: "same", bot: false },
  { r1: "B", r2: "D", pattern: "B + D", consistent: false, relation: "opposite", bot: true }
];

const results = {};
PATTERNS.forEach((row) => {
  const result = AllaisGame.verdict({ r1: row.r1, r2: row.r2 }, game);
  results[row.pattern] = result;

  expectEqual("pattern " + row.pattern, result.pattern, row.pattern);
  expectTrue(
    row.pattern + " consistency is " + (row.consistent ? "Yes" : "No"),
    result.consistent === row.consistent,
    "  consistent: " + result.consistent
  );
  expectEqual(row.pattern + " relation", result.relation, row.relation);
  expectTrue(
    row.pattern + " algebraTex " + (row.bot ? "contains" : "does not contain") + " \\bot",
    result.algebraTex.includes("\\bot") === row.bot,
    "  algebraTex: " + JSON.stringify(result.algebraTex)
  );
  expectEqual(
    row.pattern + " verdictLabel",
    result.verdictLabel,
    row.consistent ? "Consistent with expected utility" : "Violates expected utility"
  );
  expectEqual(
    row.pattern + " verdictTitle",
    result.verdictTitle,
    row.consistent
      ? "An expected-utility representation exists"
      : "No expected-utility representation"
  );
});

/* ------------------------------------------------- consistency flag order */

expectEqual(
  "consistency flags in order A+C, A+D, B+C, B+D = No, Yes, Yes, No",
  PATTERNS.map((row) => (results[row.pattern].consistent ? "Yes" : "No")).join(", "),
  "No, Yes, Yes, No"
);

/* ------------------------------------------------------- exact inequalities */

expectEqual(
  "A+C round1.inequalityTex",
  results["A + C"].round1.inequalityTex,
  "0.34\\,u(2400) > 0.33\\,u(2500)"
);
expectEqual(
  "A+C round2.inequalityTex",
  results["A + C"].round2.inequalityTex,
  "0.33\\,u(2500) > 0.34\\,u(2400)"
);
expectEqual(
  "A+C round1.premiseTex",
  results["A + C"].round1.premiseTex,
  "A\\succ B"
);
expectEqual(
  "A+C round2.premiseTex",
  results["A + C"].round2.premiseTex,
  "C\\succ D"
);
expectEqual(
  "A+C algebraTex",
  results["A + C"].algebraTex,
  "0.34\\,u(2400) > 0.33\\,u(2500) > 0.34\\,u(2400)\\qquad \\bot"
);
expectEqual(
  "B+D algebraTex",
  results["B + D"].algebraTex,
  "0.33\\,u(2500) > 0.34\\,u(2400) > 0.33\\,u(2500)\\qquad \\bot"
);

["A + D", "B + C"].forEach((pattern) => {
  expectEqual(
    pattern + " round1.inequalityTex",
    results[pattern].round1.inequalityTex,
    pattern === "A + D"
      ? "0.34\\,u(2400) > 0.33\\,u(2500)"
      : "0.33\\,u(2500) > 0.34\\,u(2400)"
  );
  expectEqual(
    pattern + " round2.inequalityTex",
    results[pattern].round2.inequalityTex,
    pattern === "A + D"
      ? "0.34\\,u(2400) > 0.33\\,u(2500)"
      : "0.33\\,u(2500) > 0.34\\,u(2400)"
  );
  expectEqual(
    pattern + " algebraTex is the single shared inequality",
    results[pattern].algebraTex,
    results[pattern].round1.inequalityTex
  );
});

/* ------------------------------------------------------------- sign values */

expectEqual(
  "A+C signs (round1, round2)",
  results["A + C"].round1.sign + ", " + results["A + C"].round2.sign,
  "1, -1"
);
expectEqual(
  "A+D signs (round1, round2)",
  results["A + D"].round1.sign + ", " + results["A + D"].round2.sign,
  "1, 1"
);
expectEqual(
  "B+C signs (round1, round2)",
  results["B + C"].round1.sign + ", " + results["B + C"].round2.sign,
  "-1, -1"
);
expectEqual(
  "B+D signs (round1, round2)",
  results["B + D"].round1.sign + ", " + results["B + D"].round2.sign,
  "-1, 1"
);

/* --------------------------------------------------------------- benchmark */

const benchmark = results["A + C"].benchmarkNote;
expectTrue(
  "A+C benchmarkNote is a string",
  typeof benchmark === "string",
  "  benchmarkNote: " + String(benchmark)
);
expectTrue(
  "A+C benchmarkNote contains 82",
  typeof benchmark === "string" && benchmark.includes("82")
);
expectTrue(
  "A+C benchmarkNote contains 83",
  typeof benchmark === "string" && benchmark.includes("83")
);
expectTrue(
  "A+C benchmarkNote contains Kahneman",
  typeof benchmark === "string" && benchmark.includes("Kahneman")
);
expectTrue(
  "A+C benchmarkNote contains 'Most people choose like you'",
  typeof benchmark === "string" &&
    benchmark.includes("Most people choose like you"),
  "  benchmarkNote: " + String(benchmark)
);
["A + D", "B + C", "B + D"].forEach((pattern) => {
  expectEqual(
    pattern + " benchmarkNote is null",
    results[pattern].benchmarkNote,
    null
  );
});

/* ------------------------------------------------------- utilityNote rules */

expectEqual("A+C utilityNote is null", results["A + C"].utilityNote, null);
expectEqual(
  "A+D utilityNote",
  results["A + D"].utilityNote,
  "A concave utility function can produce this."
);
expectEqual(
  "B+C utilityNote",
  results["B + C"].utilityNote,
  "A near-linear utility function can produce this."
);
expectEqual("B+D utilityNote is null", results["B + D"].utilityNote, null);

/* ------------------------------------------------- plain-text safety */

PATTERNS.forEach((row) => {
  const verdict = results[row.pattern];
  expectTrue(
    row.pattern + " plainExplanation contains no backslash",
    typeof verdict.plainExplanation === "string" &&
      !verdict.plainExplanation.includes("\\"),
    "  plainExplanation: " + JSON.stringify(verdict.plainExplanation)
  );
});

expectTrue(
  "A+C plainExplanation names the certainty effect",
  results["A + C"].plainExplanation.includes("certainty effect"),
  "  plainExplanation: " + JSON.stringify(results["A + C"].plainExplanation)
);
expectTrue(
  "A+D plainExplanation uses Unicode math, not TeX",
  results["A + D"].plainExplanation.includes("0.34\u00b7u(2400) > 0.33\u00b7u(2500)"),
  "  plainExplanation: " + JSON.stringify(results["A + D"].plainExplanation)
);
expectTrue(
  "B+C plainExplanation uses Unicode math, not TeX",
  results["B + C"].plainExplanation.includes("0.33\u00b7u(2500) > 0.34\u00b7u(2400)"),
  "  plainExplanation: " + JSON.stringify(results["B + C"].plainExplanation)
);
expectTrue(
  "B+D plainExplanation uses Unicode math, not TeX",
  results["B + D"].plainExplanation.includes("0.33\u00b7u(2500) > 0.34\u00b7u(2400)"),
  "  plainExplanation: " + JSON.stringify(results["B + D"].plainExplanation)
);

/* --------------------------------------------------------------- EV */

const expectedEv = { A: 2400, B: 2409, C: 825, D: 816 };

Object.keys(expectedEv).forEach((id) => {
  Object.keys(results).forEach((pattern) => {
    expectNumber(pattern + " ev." + id, results[pattern].ev[id], expectedEv[id]);
  });
});

/* ------------------------------------- no ID pattern-matching (renamed ids) */

const renamed = JSON.parse(JSON.stringify(game));
const map = { A: "sure_thing", B: "raider_route", C: "one_trip", D: "two_trips" };
renamed.rounds.forEach((round) => {
  round.options.forEach((option) => {
    option.id = map[option.id];
  });
});

const renamedAC = AllaisGame.verdict({ r1: "sure_thing", r2: "one_trip" }, renamed);
expectTrue("renamed ids: A+C analogue is inconsistent", renamedAC.consistent === false);
expectEqual("renamed ids: A+C analogue relation", renamedAC.relation, "opposite");
expectEqual(
  "renamed ids: A+C analogue algebraTex unchanged",
  renamedAC.algebraTex,
  "0.34\\,u(2400) > 0.33\\,u(2500) > 0.34\\,u(2400)\\qquad \\bot"
);

const renamedAD = AllaisGame.verdict({ r1: "sure_thing", r2: "two_trips" }, renamed);
expectTrue("renamed ids: A+D analogue is consistent", renamedAD.consistent === true);
expectEqual(
  "renamed ids: A+D analogue algebraTex unchanged",
  renamedAD.algebraTex,
  "0.34\\,u(2400) > 0.33\\,u(2500)"
);

/* ----------------------------------- choices keyed by round.id (renamed) */

const renamedRounds = JSON.parse(JSON.stringify(game));
renamedRounds.rounds[0].id = "round_one";
renamedRounds.rounds[1].id = "round_two";

const roundKeyedAC = AllaisGame.verdict(
  { round_one: "A", round_two: "C" },
  renamedRounds
);
expectTrue(
  "renamed round ids: A+C analogue is inconsistent",
  roundKeyedAC.consistent === false
);
expectEqual(
  "renamed round ids: A+C algebraTex unchanged",
  roundKeyedAC.algebraTex,
  "0.34\\,u(2400) > 0.33\\,u(2500) > 0.34\\,u(2400)\\qquad \\bot"
);
expectEqual(
  "renamed round ids: output choices normalised to r1/r2",
  JSON.stringify(roundKeyedAC.choices),
  JSON.stringify({ r1: "A", r2: "C" })
);

const roundKeyedAD = AllaisGame.verdict(
  { round_one: "A", round_two: "D" },
  renamedRounds
);
expectTrue(
  "renamed round ids: A+D analogue is consistent",
  roundKeyedAD.consistent === true
);

const roundKeyedLegacy = AllaisGame.verdict({ r1: "A", r2: "C" }, renamedRounds);
expectTrue(
  "renamed round ids: literal r1/r2 fallback still works",
  roundKeyedLegacy.consistent === false
);

/* ------------------------------------------- per-round theory checkpoint */

const checkpointCases = [
  {
    round: 0,
    choice: "A",
    other: "B",
    premise: "A\\succ B",
    inequality: "0.34\\,u(2400) > 0.33\\,u(2500)",
    plain: "0.34\u00b7u(2400) > 0.33\u00b7u(2500)"
  },
  {
    round: 0,
    choice: "B",
    other: "A",
    premise: "B\\succ A",
    inequality: "0.33\\,u(2500) > 0.34\\,u(2400)",
    plain: "0.33\u00b7u(2500) > 0.34\u00b7u(2400)"
  },
  {
    round: 1,
    choice: "C",
    other: "D",
    premise: "C\\succ D",
    inequality: "0.33\\,u(2500) > 0.34\\,u(2400)",
    plain: "0.33\u00b7u(2500) > 0.34\u00b7u(2400)"
  },
  {
    round: 1,
    choice: "D",
    other: "C",
    premise: "D\\succ C",
    inequality: "0.34\\,u(2400) > 0.33\\,u(2500)",
    plain: "0.34\u00b7u(2400) > 0.33\u00b7u(2500)"
  }
];

expectTrue(
  "AllaisGame.checkpoint is a function",
  AllaisGame && typeof AllaisGame.checkpoint === "function"
);

checkpointCases.forEach((row) => {
  const round = game.rounds[row.round];
  const checkpoint = AllaisGame.checkpoint(round, row.choice, game);
  const label = "checkpoint " + row.choice + " over " + row.other;
  expectEqual(label + " chosen", checkpoint.chosen, row.choice);
  expectEqual(label + " other", checkpoint.other, row.other);
  expectEqual(label + " premiseTex", checkpoint.premiseTex, row.premise);
  expectEqual(label + " inequalityTex", checkpoint.inequalityTex, row.inequality);
  expectEqual(
    label + " equivalenceTex",
    checkpoint.equivalenceTex,
    row.premise + " \\iff " + row.inequality
  );
  expectEqual(label + " inequalityPlain", checkpoint.inequalityPlain, row.plain);
  expectTrue(
    label + " has option labels",
    checkpoint.chosenLabel === round.options.find((o) => o.id === row.choice).label &&
      checkpoint.otherLabel === round.options.find((o) => o.id === row.other).label
  );
});

const renamedCheckpoint = AllaisGame.checkpoint(
  renamed.rounds[0],
  "raider_route",
  renamed
);
expectEqual(
  "renamed ids: checkpoint derives B-over-A analogue",
  renamedCheckpoint.inequalityTex,
  "0.33\\,u(2500) > 0.34\\,u(2400)"
);

/* ------------------------------------------------------------------ report */

console.log("");
if (failures) {
  console.error(
    "FAILED  " + failures + " of " + checks + " checks."
  );
  process.exit(1);
}
console.log("PASSED  " + checks + " of " + checks + " checks.");
console.log("Consistency order: " + PATTERNS.map((row) => row.pattern + "=" + (results[row.pattern].consistent ? "Yes" : "No")).join(", "));
process.exit(0);
