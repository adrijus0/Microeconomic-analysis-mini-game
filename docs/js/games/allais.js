/*
 * allais.js — verdict logic for "The Crimson Caravan Contracts" (Allais).
 *
 * Classic script: no ES modules, no fetch, no DOM access at load time, so it
 * can be <script>-tagged from file:// and also require()d by Node for tests.
 *
 * The verdict is DERIVED from the lottery numbers. Nothing here looks for
 * "A", "C" or the string "A + C": rename the options and the same algebra
 * comes out. Two expected-utility inequalities are built (chosen minus
 * non-chosen coefficients, with u(0) = 0) and compared:
 *
 *   c1 · u > 0   and   c2 · u > 0
 *
 *   c2 = k · c1 with k < 0  ->  the requirements are opposite  ->  ⊥
 *   c2 = k · c1 with k > 0  ->  the same requirement           ->  consistent
 *
 * Public API:
 *   AllaisGame.verdict(choices, game)          -> full verdict object
 *   AllaisGame.checkpoint(round, choice, game) -> one-round EU requirement
 *   AllaisGame.reveal(choices, game)           -> short reveal summary
 */
(function (root, factory) {
  "use strict";

  var api = factory();

  if (root) {
    root.AllaisGame = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var EPS = 1e-9;
  var ROUND = 1e6;

  /* ---------------------------------------------------------------- maths */

  function round6(value) {
    return Math.round(value * ROUND) / ROUND;
  }

  function isZero(value) {
    return Math.abs(value) < EPS;
  }

  function lotteryOf(option) {
    return (option && option.lottery) || [];
  }

  /* Every payoff used anywhere in the game, ascending, de-duplicated. */
  function collectOutcomes(game) {
    var seen = {};
    var out = [];
    (game.rounds || []).forEach(function (round) {
      (round.options || []).forEach(function (option) {
        lotteryOf(option).forEach(function (entry) {
          var x = Number(entry.x);
          if (!isFinite(x)) {
            return;
          }
          var key = String(round6(x));
          if (!seen[key]) {
            seen[key] = true;
            out.push(x);
          }
        });
      });
    });
    out.sort(function (a, b) {
      return a - b;
    });
    return out;
  }

  /*
   * Expected-utility coefficients of one option over `outcomes`.
   * u(0) = 0 is the normalization, so the payoff 0 is left out of the vector:
   * its term contributes nothing whatever u(0) would otherwise be.
   */
  function coefficients(option, outcomes) {
    var vector = {};
    lotteryOf(option).forEach(function (entry) {
      var x = Number(entry.x);
      var p = Number(entry.p);
      if (!isFinite(x) || !isFinite(p)) {
        return;
      }
      var key = String(round6(x));
      vector[key] = (vector[key] || 0) + p;
    });
    outcomes.forEach(function (x) {
      var key = String(round6(x));
      if (!(key in vector)) {
        vector[key] = 0;
      }
    });
    return vector;
  }

  /* Ascending outcomes with a non-zero coefficient, u(0) removed. */
  function activeTerms(vector, outcomes) {
    return outcomes
      .map(function (x) {
        return { x: x, c: vector[String(round6(x))] || 0 };
      })
      .filter(function (term) {
        return !isZero(term.x) && !isZero(term.c);
      });
  }

  /* chosen(vector) minus other(vector). */
  function difference(chosenVector, otherVector, outcomes) {
    var out = {};
    outcomes.forEach(function (x) {
      var key = String(round6(x));
      out[key] = (chosenVector[key] || 0) - (otherVector[key] || 0);
    });
    return out;
  }

  /* Is b a scalar multiple of a? Returns {scalar, multiple}. */
  function scalarRelation(a, b) {
    var pivot = null;
    Object.keys(a).forEach(function (key) {
      if (pivot === null || Math.abs(a[key]) > Math.abs(a[pivot])) {
        pivot = key;
      }
    });

    if (pivot === null || isZero(a[pivot])) {
      var bZero = Object.keys(b).every(function (key) {
        return isZero(b[key]);
      });
      return { multiple: bZero, scalar: bZero ? 1 : null };
    }

    var scalar = b[pivot] / a[pivot];
    var multiple = Object.keys(a).every(function (key) {
      var scale = Math.max(1, Math.abs(a[key]), Math.abs(b[key]));
      return Math.abs(b[key] - scalar * a[key]) <= 1e-9 * scale;
    });

    return { multiple: multiple, scalar: scalar };
  }

  /* ------------------------------------------------------------ formatting */

  function fmtNumber(value) {
    if (Math.round(value) === value) {
      return String(Math.round(value));
    }
    return String(Math.round(value * 100) / 100);
  }

  /* Plain prose: 2400 -> "2,400", 0.666 -> "0.67". */
  function fmtPlain(value) {
    var n = Math.round(value * 100) / 100;
    var parts = String(Math.abs(n)).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (n < 0 ? "-" : "") + parts.join(".");
  }

  function fmtProbability(value) {
    return Number(value).toFixed(2);
  }

  function lotteryProse(option) {
    return lotteryOf(option)
      .map(function (entry) {
        return fmtPlain(Number(entry.x)) + " w.p. " + fmtProbability(Number(entry.p));
      })
      .join(", ");
  }

  function fmtTerm(term) {
    // Slides' style: 0.34\,u(2400), two decimals, no thousands separators.
    return round6(Math.abs(term.c)).toFixed(2) + "\\,u(" + fmtNumber(term.x) + ")";
  }

  /*
   * c · u > 0 written as  <positive terms> > <negative terms>.
   * Terms keep the ascending payoff order, so `u(2400)` precedes `u(2500)`
   * exactly as on the slides.
   */
  function fmtPlainTerm(term) {
    // Plain prose for the Report Card (no KaTeX): 0.34·u(2400).
    return round6(Math.abs(term.c)).toFixed(2) + "\u00b7u(" + fmtNumber(term.x) + ")";
  }

  function sidesOf(vector, outcomes, formatter) {
    var terms = activeTerms(vector, outcomes);
    var positives = terms.filter(function (term) {
      return term.c > 0;
    });
    var negatives = terms.filter(function (term) {
      return term.c < 0;
    });

    var lhs = positives.map(formatter).join(" + ");
    var rhs = negatives.map(formatter).join(" + ");

    if (!lhs) {
      lhs = "0";
    }
    if (!rhs) {
      rhs = "0";
    }
    return lhs + " > " + rhs;
  }

  function inequalityTex(vector, outcomes) {
    return sidesOf(vector, outcomes, fmtTerm);
  }

  /* The same inequality with Unicode ×/· and no TeX, for plain-text hosts
     such as the Report Card in docs/js/hub.js. */
  function inequalityPlain(vector, outcomes) {
    return sidesOf(vector, outcomes, fmtPlainTerm);
  }

  function signOf(vector, outcomes) {
    var terms = activeTerms(vector, outcomes);
    if (!terms.length || isZero(terms[0].c)) {
      return 1;
    }
    return terms[0].c > 0 ? 1 : -1;
  }

  /* -------------------------------------------------------------- helpers */

  function fail(message) {
    throw new Error("[AllaisGame] " + message);
  }

  function roundById(game, key, index) {
    var rounds = (game && game.rounds) || [];
    for (var i = 0; i < rounds.length; i += 1) {
      if (rounds[i] && rounds[i].id === key) {
        return rounds[i];
      }
    }
    if (!rounds[index]) {
      fail("game.rounds[" + index + "] is missing");
    }
    return rounds[index];
  }

  /*
   * The engine keys `state.choices` by round.id, so read the round's own id
   * first. The literal r1/r2 fallback keeps direct callers (and older tests)
   * working when the config still uses those ids; it costs one lookup.
   */
  function pickChoice(choices, round, fallbackKey) {
    var key = round && round.id;
    if (key != null && choices[key] != null) {
      return choices[key];
    }
    if (choices[fallbackKey] != null) {
      return choices[fallbackKey];
    }
    fail(
      "missing choice for round " +
        JSON.stringify(key != null ? key : fallbackKey) +
        " (expected choices[" +
        JSON.stringify(key != null ? key : fallbackKey) +
        "] or choices[" +
        JSON.stringify(fallbackKey) +
        "]; got keys " +
        JSON.stringify(Object.keys(choices)) +
        ")"
    );
  }

  function optionById(round, choice, roundKey) {
    var options = (round && round.options) || [];
    for (var i = 0; i < options.length; i += 1) {
      if (options[i] && options[i].id === choice) {
        return options[i];
      }
    }
    fail(
      "unknown choice " +
        JSON.stringify(choice) +
        " for " +
        roundKey +
        " (options: " +
        options
          .map(function (option) {
            return JSON.stringify(option.id);
          })
          .join(", ") +
        ")"
    );
  }

  function isCertain(option) {
    var total = 0;
    var payoffs = {};
    lotteryOf(option).forEach(function (entry) {
      var p = Number(entry.p);
      var x = Number(entry.x);
      if (isFinite(p) && p > EPS) {
        total += p;
        payoffs[String(round6(x))] = true;
      }
    });
    return Math.abs(total - 1) < 1e-6 && Object.keys(payoffs).length === 1;
  }

  function evOf(option) {
    var ev = 0;
    lotteryOf(option).forEach(function (entry) {
      var p = Number(entry.p);
      var x = Number(entry.x);
      if (isFinite(p) && isFinite(x)) {
        ev += p * x;
      }
    });
    return round6(ev);
  }

  /* ---------------------------------------------------------------- copy */

  /* One short sentence for the reveal screen. The algebra lives behind
     "Show the math", so none of it appears here. */
  function plainExplanationFor(kind, data) {
    var you = data.first + " then " + data.second;
    if (kind === "certainty-effect") {
      return you + ", like most people: the sure thing, then the bigger prize.";
    }
    if (kind === "mirror") {
      return you + ": the gamble first, the safer bet second. No single utility function fits both.";
    }
    if (kind === "concave") {
      return you + ": careful both times. One risk-averse utility fits. No paradox here.";
    }
    if (kind === "near-linear") {
      return you + ": the higher expected value both times. A near-linear utility fits. No paradox here.";
    }
    return "";
  }

  /* --------------------------------------------------------------- public */

  function verdict(choices, game) {
    if (!choices || typeof choices !== "object") {
      fail("choices must be { r1: <option id>, r2: <option id> }");
    }
    if (!game || typeof game !== "object") {
      fail("game config object is required");
    }

    var outcomes = collectOutcomes(game);
    if (!outcomes.length) {
      fail("game.rounds[].options[].lottery is empty");
    }

    var round1 = roundById(game, "r1", 0);
    var round2 = roundById(game, "r2", 1);

    var options = {};
    var ev = {};
    (game.rounds || []).forEach(function (round) {
      (round.options || []).forEach(function (option) {
        options[option.id] = option;
        ev[option.id] = evOf(option);
      });
    });

    var worst = Math.min.apply(null, outcomes);

    function buildRound(round, choice, key) {
      var chosen = optionById(round, choice, key);
      var other = null;
      (round.options || []).forEach(function (option) {
        if (option.id !== chosen.id) {
          other = other || option;
        }
      });
      if (!other) {
        fail(key + " needs two options");
      }

      var chosenVector = coefficients(chosen, outcomes);
      var otherVector = coefficients(other, outcomes);
      var vector = difference(chosenVector, otherVector, outcomes);

      return {
        chosen: chosen.id,
        other: other.id,
        sign: signOf(vector, outcomes),
        premiseTex: chosen.id + "\\succ " + other.id,
        inequalityTex: inequalityTex(vector, outcomes),
        inequalityPlain: inequalityPlain(vector, outcomes),
        vector: vector,
        chosenOption: chosen,
        otherOption: other
      };
    }

    var first = buildRound(
      round1,
      pickChoice(choices, round1, "r1"),
      round1.id != null ? round1.id : "r1"
    );
    var second = buildRound(
      round2,
      pickChoice(choices, round2, "r2"),
      round2.id != null ? round2.id : "r2"
    );

    var relation = scalarRelation(first.vector, second.vector);
    var opposite = relation.multiple && relation.scalar !== null && relation.scalar < 0;
    var proportional = relation.multiple && relation.scalar !== null;
    var consistent = !opposite;

    var round1Out = {
      chosen: first.chosen,
      other: first.other,
      sign: first.sign,
      premiseTex: first.premiseTex,
      inequalityTex: first.inequalityTex
    };
    var round2Out = {
      chosen: second.chosen,
      other: second.other,
      sign: second.sign,
      premiseTex: second.premiseTex,
      inequalityTex: second.inequalityTex
    };

    var firstEv = ev[first.chosen];
    var firstOtherEv = ev[first.other];
    var secondEv = ev[second.chosen];
    var secondOtherEv = ev[second.other];

    var sharedInequality = first.inequalityTex;
    var algebraTex;

    if (opposite) {
      // lhs1 > rhs1 > lhs1, the two ends equal: the contradiction.
      var firstLhs = first.inequalityTex.split(" > ")[0];
      var firstRhs = first.inequalityTex.split(" > ")[1];
      algebraTex = firstLhs + " > " + firstRhs + " > " + firstLhs + "\\qquad \\bot";
    } else {
      algebraTex = sharedInequality;
    }

    var kind = "";
    if (!consistent) {
      kind =
        isCertain(first.chosenOption) && !isCertain(first.otherOption)
          ? "certainty-effect"
          : "mirror";
    } else if (firstEv < firstOtherEv) {
      kind = "concave";
    } else {
      kind = "near-linear";
    }

    var certainPayoff = 0;
    lotteryOf(first.chosenOption).forEach(function (entry) {
      var p = Number(entry.p);
      var x = Number(entry.x);
      if (isFinite(p) && p > 0) {
        certainPayoff = x;
      }
    });

    // The common consequence: the middle payoff of the risky option
    // (2400 at 0.66 in the slides' B).
    var commonEntry = null;
    lotteryOf(first.otherOption)
      .map(function (entry) {
        return { p: Number(entry.p), x: Number(entry.x) };
      })
      .sort(function (a, b) {
        return a.x - b.x;
      })
      .forEach(function (entry, index, all) {
        if (all.length >= 3 && index === 1) {
          commonEntry = entry;
        }
      });
    if (!commonEntry) {
      commonEntry = { p: 0.66, x: certainPayoff };
    }

    var explanation = plainExplanationFor(kind, {
      first: first.chosen,
      second: second.chosen,
      firstOther: first.other,
      secondOther: second.other,
      firstEv: fmtPlain(firstEv),
      firstOtherEv: fmtPlain(firstOtherEv),
      secondEv: fmtPlain(secondEv),
      secondOtherEv: fmtPlain(secondOtherEv),
      sharedInequality: sharedInequality,
      sharedInequalityPlain: first.inequalityPlain,
      firstInequalityPlain: first.inequalityPlain,
      firstOtherLottery: lotteryProse(first.otherOption),
      certainPayoff: fmtPlain(certainPayoff),
      commonPayoff: fmtPlain(commonEntry.x),
      commonProb: fmtProbability(commonEntry.p),
      worstPayoff: fmtPlain(worst),
      highPayoff: fmtPlain(Math.max.apply(null, outcomes))
    });

    var utilityNote = null;
    if (consistent) {
      utilityNote =
        kind === "near-linear"
          ? "A near-linear utility function can produce this."
          : "A concave utility function can produce this.";
    }

    var benchmarkNote = null;
    if (!consistent && kind === "certainty-effect") {
      benchmarkNote =
        "Most people choose like you \u2014 82% chose " +
        first.chosen +
        " and 83% chose " +
        second.chosen +
        " (Kahneman & Tversky, 1979).";
    }

    return {
      pattern: first.chosen + " + " + second.chosen,
      choices: { r1: first.chosen, r2: second.chosen },
      consistent: consistent,
      relation: opposite ? "opposite" : proportional ? "same" : "independent",
      round1: round1Out,
      round2: round2Out,
      algebraTex: algebraTex,
      verdictLabel: consistent
        ? "Consistent with expected utility"
        : "Violates expected utility",
      verdictTitle: consistent
        ? "An expected-utility representation exists"
        : "No expected-utility representation",
      plainExplanation: explanation,
      utilityNote: utilityNote,
      benchmarkNote: benchmarkNote,
      kind: kind,
      ev: ev
    };
  }

  /* "a > b > a \qquad \bot" -> an aligned two-line chain. */
  function stacked(tex) {
    var parts = tex.replace("\\qquad", "\\quad").split(" > ");
    if (parts.length !== 3) return tex;
    return "\\begin{aligned} &" + parts[0] + " > " + parts[1] + "\\\\ &> " + parts[2] + " \\end{aligned}";
  }

  /*
   * Engine-facing summary for the short reveal screen. It is built on
   * verdict(), so the stamp and the algebra still come from the lotteries.
   * The crowd's pattern is the certainty effect (the sure thing first, the
   * long shot second).
   */
  function reveal(choices, game) {
    var v = verdict(choices, game);
    return {
      you: v.choices.r1 + " \u2192 " + v.choices.r2,
      crowdMatch: v.kind === "certainty-effect",
      consistent: v.consistent,
      stamp: v.consistent
        ? { text: "EU-consistent", tone: "green" }
        : { text: "Broke expected utility", tone: "red" },
      line: v.plainExplanation,
      math: [
        { label: v.round1.chosen + " \u227b " + v.round1.other + " needs", tex: v.round1.inequalityTex },
        { label: v.round2.chosen + " \u227b " + v.round2.other + " needs", tex: v.round2.inequalityTex },
        {
          label: v.consistent ? "Same inequality twice: one u(x) fits" : "Together: a contradiction",
          /* Two lines on the reveal, so the ⊥ stays on a phone screen. */
          tex: stacked(v.algebraTex)
        }
      ],
      report: {
        what: "Independence axiom",
        fix: "Probability weighting"
      }
    };
  }

  /*
   * One-round theory checkpoint, used after a contract is resolved. It applies
   * exactly the same lottery-derived algebra as verdict(), but only to the two
   * options in this round. Nothing here reads an option id or a round id.
   */
  function checkpoint(round, choice, game) {
    if (!round || typeof round !== "object") {
      fail("round config object is required");
    }
    if (!game || typeof game !== "object") {
      fail("game config object is required");
    }

    var outcomes = collectOutcomes(game);
    if (!outcomes.length) {
      fail("game.rounds[].options[].lottery is empty");
    }

    var key = round.id != null ? round.id : "round";
    var chosen = optionById(round, choice, key);
    var other = null;
    (round.options || []).forEach(function (option) {
      if (option.id !== chosen.id) other = other || option;
    });
    if (!other) {
      fail(key + " needs two options");
    }

    var vector = difference(
      coefficients(chosen, outcomes),
      coefficients(other, outcomes),
      outcomes
    );

    return {
      round: key,
      chosen: chosen.id,
      other: other.id,
      chosenLabel: chosen.label,
      otherLabel: other.label,
      premiseTex: chosen.id + "\\succ " + other.id,
      equivalenceTex:
        chosen.id + "\\succ " + other.id + " \\iff " + inequalityTex(vector, outcomes),
      inequalityTex: inequalityTex(vector, outcomes),
      inequalityPlain: inequalityPlain(vector, outcomes),
      sign: signOf(vector, outcomes),
      vector: vector,
      chosenOption: chosen,
      otherOption: other
    };
  }

  return { verdict: verdict, checkpoint: checkpoint, reveal: reveal };
});
