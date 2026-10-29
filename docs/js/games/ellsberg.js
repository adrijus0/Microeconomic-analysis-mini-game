/*
 * ellsberg.js — logic for "Festus's Cap Barrel" (Ellsberg paradox).
 *
 * Classic script: no DOM access at load time, so it can be <script>-tagged
 * from file:// and require()d by Node for tests.
 *
 * Slide 11's urn, reskinned: 90 caps = 30 red Nuka-Cola caps (the known red)
 * + 60 yellow Sunset Sarsaparilla caps, of which an unknown number s carry a
 * blue star (the slide's black) and 60 − s are plain (the slide's yellow).
 *
 * The verdict is DERIVED from each option's `wins` list, not from ids. A bet
 * wins on a + b·s caps (linear in the unknown s), so "chosen ≻ other" holds
 * exactly for the s in an interval of [0, 60]. Two choices are consistent
 * with a single belief iff their intervals overlap (slide 12).
 *
 * Public API:
 *   EllsbergGame.init(rng)                      -> { mix: {nuka, star, plain} }
 *   EllsbergGame.resolve(round, option, ctx, rng) -> one bet, one cap
 *   EllsbergGame.resolveAll(rounds, choices, ctx, rng) -> one cap settles
 *                                               both bets (used by the game)
 *   EllsbergGame.known(option)                  -> true if its odds are known
 *   EllsbergGame.verdict(choices, game)         -> belief intervals + kind
 *   EllsbergGame.reveal(choices, game, ctx)     -> short reveal summary
 */
(function (root, factory) {
  "use strict";

  var api = factory();

  if (root) {
    root.EllsbergGame = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var NUKA = 30;
  var SUNSET = 60;
  var PRIZE = 100;

  var CAP_NAMES = {
    nuka: "a red cap",
    star: "a star cap",
    plain: "a plain yellow cap"
  };
  /* Red as on slide 12 (π_R); S and P for the star and plain caps. */
  var PI = { nuka: "\\pi_R", star: "\\pi_S", plain: "\\pi_P" };

  function fail(message) {
    throw new Error("[EllsbergGame] " + message);
  }

  /* Winning caps of a bet as a + b·s, where s = number of star caps. */
  function linear(option) {
    var wins = option.wins || [];
    var a = 0;
    var b = 0;
    if (wins.indexOf("nuka") !== -1) a += NUKA;
    if (wins.indexOf("star") !== -1) b += 1;
    if (wins.indexOf("plain") !== -1) {
      a += SUNSET;
      b -= 1;
    }
    return { a: a, b: b };
  }

  /* The s in [0, 60] for which `chosen` wins on more caps than `other`. */
  function interval(chosen, other) {
    var c = linear(chosen);
    var o = linear(other);
    var a = c.a - o.a;
    var b = c.b - o.b;
    if (b === 0) return a > 0 ? { lo: 0, hi: SUNSET } : null;
    var root = -a / b;
    var lo = b > 0 ? Math.max(0, root) : 0;
    var hi = b > 0 ? SUNSET : Math.min(SUNSET, root);
    return lo < hi ? { lo: lo, hi: hi } : null;
  }

  function overlap(x, y) {
    if (!x || !y) return null;
    var lo = Math.max(x.lo, y.lo);
    var hi = Math.min(x.hi, y.hi);
    return lo < hi ? { lo: lo, hi: hi } : null;
  }

  /*
   * A bet's win chance as the cards show it, in whole percent of the 90 caps:
   * { lo, hi } over every possible star count (lo === hi: known odds).
   */
  function chance(option) {
    var lin = linear(option);
    var ends = [lin.a, lin.a + lin.b * SUNSET].map(function (caps) {
      return Math.round((caps / (NUKA + SUNSET)) * 100);
    });
    return { lo: Math.min(ends[0], ends[1]), hi: Math.max(ends[0], ends[1]) };
  }

  function pick(round, choices) {
    var id = choices[round.id];
    var chosen = null;
    var other = null;
    (round.options || []).forEach(function (option) {
      if (option.id === id) chosen = option;
      else if (!other) other = option;
    });
    if (!chosen) fail("unknown choice " + JSON.stringify(id) + " for " + round.id);
    if (!other) fail(round.id + " needs two options");
    return { chosen: chosen, other: other, range: interval(chosen, other) };
  }

  /* Known odds: the number of winning caps does not depend on s. */
  function known(option) {
    return linear(option).b === 0;
  }

  function verdict(choices, game) {
    var rounds = game.rounds || [];
    if (rounds.length < 2) fail("game needs two rounds");
    var first = pick(rounds[0], choices);
    var second = pick(rounds[1], choices);
    var shared = overlap(first.range, second.range);
    var kind = "consistent";
    if (!shared) {
      if (known(first.chosen) && known(second.chosen)) kind = "ambiguity-averse";
      else if (!known(first.chosen) && !known(second.chosen)) kind = "ambiguity-seeking";
      else kind = "inconsistent";
    }
    return {
      first: first,
      second: second,
      consistent: !!shared,
      belief: shared,
      kind: kind
    };
  }

  /* ---------------------------------------------------------------- draws */

  function init(rng) {
    var star = rng.int(0, SUNSET);
    return { mix: { nuka: NUKA, star: star, plain: SUNSET - star } };
  }

  function drawCap(rng, mix) {
    var i = rng.int(0, mix.nuka + mix.star + mix.plain - 1);
    if (i < mix.nuka) return "nuka";
    if (i < mix.nuka + mix.star) return "star";
    return "plain";
  }

  /* One barrel per run: a missing mix is drawn once and kept on ctx. */
  function mixOf(ctx, rng) {
    if (ctx && ctx.mix) return ctx.mix;
    var mix = init(rng).mix;
    if (ctx) ctx.mix = mix;
    return mix;
  }

  function resolve(round, option, ctx, rng) {
    var mix = mixOf(ctx, rng);
    var cap = drawCap(rng, mix);
    var win = (option.wins || []).indexOf(cap) !== -1;
    return {
      payoff: win ? PRIZE : 0,
      cap: cap,
      heading: win ? "Yeehaw!" : "Shucks.",
      copy: "Festus pulls out " + CAP_NAMES[cap] + ". " + (win ? "You win 100 caps!" : "Not your cap, partner.")
    };
  }

  /*
   * Ellsberg's bets are settled together: both are placed before a single
   * cap is drawn, so seeing a cap can never inform the second bet.
   */
  function resolveAll(rounds, choices, ctx, rng) {
    var mix = mixOf(ctx, rng);
    var cap = drawCap(rng, mix);
    var wins = 0;
    var rows = rounds.map(function (round, i) {
      var option = null;
      (round.options || []).forEach(function (o) {
        if (o.id === choices[round.id]) option = o;
      });
      if (!option) fail("missing choice for " + round.id);
      var win = (option.wins || []).indexOf(cap) !== -1;
      if (win) wins += 1;
      return { label: "Bet " + (i + 1) + " · " + option.label, win: win };
    });
    var payoff = wins * PRIZE;
    return {
      payoff: payoff,
      cap: cap,
      rows: rows,
      heading: wins === 2 ? "Double yeehaw!" : wins === 1 ? "Yeehaw!" : "Shucks.",
      /* The prop card already names the drawn cap. */
      copy: wins === 2 ? "Both bets win!" : wins === 1 ? "One bet wins." : "Neither bet wins, partner."
    };
  }

  /* --------------------------------------------------------------- reveal */

  function piSide(wins, cancel) {
    var terms = ["nuka", "star", "plain"].filter(function (k) {
      return wins.indexOf(k) !== -1 && cancel.indexOf(k) === -1;
    }).map(function (k) {
      return PI[k];
    });
    return terms.length ? terms.join(" + ") : "0";
  }

  /* "chosen ≻ other" in subjective probabilities, common terms cancelled. */
  function needTex(side) {
    var c = side.chosen.wins || [];
    var o = side.other.wins || [];
    var common = c.filter(function (k) {
      return o.indexOf(k) !== -1;
    });
    return piSide(c, common) + " > " + piSide(o, common);
  }

  /* The full slide-12 form when something cancels: π_S+π_P > π_N+π_P ⇒ … */
  function fullTex(side) {
    var c = side.chosen.wins || [];
    var o = side.other.wins || [];
    var cancelled = needTex(side);
    var full = piSide(c, []) + " > " + piSide(o, []);
    return full === cancelled ? cancelled : full + " \\Rightarrow " + cancelled;
  }

  function short(option) {
    return String(option.short || option.label || option.id);
  }

  /* Bet 2's options minus what they share (the plain caps) are bet 1's. */
  function base(side) {
    var common = (side.other.wins || []);
    return (side.chosen.wins || []).filter(function (k) {
      return common.indexOf(k) === -1;
    }).sort().join("+");
  }

  function reveal(choices, game, ctx) {
    var v = verdict(choices, game);
    var f = v.first;
    var s = v.second;

    /* Bet 2 is bet 1 with plain yellow added to both sides (slide 12), so
       the story is simply: did the same extra caps switch your pick? */
    var stayed = base(s) === (f.chosen.wins || []).slice().sort().join("+");
    var chain = [
      "Bet 1: " + short(f.chosen) + " over " + short(f.other) + ".",
      "Bet 2: the same bets, plus plain yellow on both sides. " +
        (stayed ? "You stayed with " + short(f.chosen) + ". ✓" : "You switched to " + short(s.chosen) + ".")
    ];

    var line;
    if (v.kind === "ambiguity-averse") {
      line = "Like most people, you chose known odds twice. But plain yellow pays both sides alike, so it shouldn't flip red vs star.";
    } else if (v.kind === "ambiguity-seeking") {
      line = "You chose unknown odds twice, unlike most people. But plain yellow pays both sides alike, so it shouldn't flip star vs red.";
    } else if (v.consistent) {
      line = "The same added caps didn't switch your pick: one belief fits both bets.";
    } else {
      line = "The same added caps switched your pick: no single belief fits both bets.";
    }

    var firstTex = needTex(f);
    var secondTex = fullTex(s);
    var together;
    if (v.consistent) {
      together = { label: "Same belief twice: consistent", tex: firstTex };
    } else {
      var parts = needTex(f).split(" > ");
      together = { label: "Together: a contradiction", tex: parts[0] + " > " + parts[1] + " > " + parts[0] + "\\; \\bot" };
    }

    return {
      you: f.chosen.id + " → " + s.chosen.id,
      crowdMatch: v.kind === "ambiguity-averse",
      consistent: v.consistent,
      /* No objective odds here: what breaks is subjective EU (the
         sure-thing principle with a single prior). */
      stamp: v.consistent
        ? { text: "EU-consistent", tone: "green" }
        : { text: "Broke subjective EU", tone: "red" },
      line: line,
      chain: chain,
      math: [
        { label: f.chosen.id + " ≻ " + f.other.id + " needs", tex: firstTex },
        { label: s.chosen.id + " ≻ " + s.other.id + " needs (plain caps cancel)", tex: secondTex },
        together
      ]
    };
  }

  return {
    init: init,
    known: known,
    chance: chance,
    drawCap: drawCap,
    resolve: resolve,
    resolveAll: resolveAll,
    interval: interval,
    verdict: verdict,
    reveal: reveal
  };
});
