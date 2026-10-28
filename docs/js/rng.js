/*
 * rng.js — seeded pseudo-random numbers for the mini-games.
 *
 * Classic script: works from file:// and under a GitHub Pages sub-path.
 * No external requests, no modules. Loadable in Node (module.exports).
 *
 * mulberry32 is a small, fast, deterministic 32-bit PRNG. Every stream is
 * created from a string seed, so `?seed=42` reproduces the single draw in
 * each round independently of which options the player picked.
 *
 * Usage:
 *   var rng = RNG.create("42|r1|draw");
 *   var u = rng.next();                 // [0, 1)
 *   var x = RNG.sample(rng, lottery);   // lottery = [{p, x}, ...]
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.RNG = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  /* FNV-1a, 32 bit: stable across browsers and Node. */
  function hashString(str) {
    var h = 0x811c9dc5;
    var s = String(str);
    for (var i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function create(seed) {
    var next = mulberry32(
      typeof seed === "number" ? seed >>> 0 : hashString(seed)
    );
    return {
      next: next,
      between: function (lo, hi) {
        return lo + (hi - lo) * next();
      },
      int: function (lo, hi) {
        return Math.floor(lo + (hi - lo + 1) * next());
      }
    };
  }

  /* Draw one payoff from a lottery. The lottery order is the cumulative order,
     so the same seed always gives the same outcome. */
  function sample(rng, lottery) {
    var u = rng.next();
    var cumulative = 0;
    for (var i = 0; i < lottery.length; i += 1) {
      cumulative += Number(lottery[i].p) || 0;
      if (u < cumulative) return Number(lottery[i].x) || 0;
    }
    /* Floating-point guard: return the last positive-probability payoff. */
    for (var j = lottery.length - 1; j >= 0; j -= 1) {
      if (Number(lottery[j].p) > 0) return Number(lottery[j].x) || 0;
    }
    return 0;
  }

  /* ?seed=42 wins. Otherwise a short random seed is generated and shown in
     the game header so a run can be repeated by copying it into the URL. */
  function seedFromUrl(search) {
    var params = null;
    try {
      params = new URLSearchParams(search || "");
    } catch (err) {
      params = null;
    }
    var value = params && params.get("seed");
    if (value && /^[A-Za-z0-9._-]{1,64}$/.test(value)) return value;
    return null;
  }

  function makeSeed() {
    var n = Math.floor(Math.random() * 0xffffffff) >>> 0;
    return n.toString(36);
  }

  return {
    hashString: hashString,
    mulberry32: mulberry32,
    create: create,
    sample: sample,
    seedFromUrl: seedFromUrl,
    makeSeed: makeSeed
  };
});
