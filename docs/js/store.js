/*
 * store.js — tiny progress store for the map and the Report Card.
 *
 * localStorage is used only inside try/catch. If it is unavailable (private
 * mode, file:// restrictions, a test that throws), everything falls back to an
 * in-memory object, so a game still completes and the Report Card still works
 * for the current page. No accounts, no network, no tracking.
 *
 * The caps wallet lives in the same blob under the reserved CAPS key: one
 * net result per deal round ({ allais: { r1: 2400, r2: 0 }, … }), from the
 * deal's latest finished run. Wallet = CONFIG.wallet.start + every stored
 * net, so a replay replaces a deal's caps instead of adding to them. Every
 * change fires a `wallet:change` event.
 */
(function (root) {
  "use strict";

  var KEY = "wasteland-odds.v1";
  var CAPS = "_caps";
  var memory = {};
  var storage = null;

  try {
    var candidate = root.localStorage;
    var probe = "__poc_probe__";
    candidate.setItem(probe, "1");
    candidate.removeItem(probe);
    storage = candidate;
  } catch (err) {
    storage = null;
  }

  function read() {
    if (!storage) return memory;
    try {
      var raw = storage.getItem(KEY);
      if (!raw) return memory;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return memory;
      memory = parsed;
    } catch (err) {
      /* Corrupt or blocked storage: keep the in-memory copy. */
    }
    return memory;
  }

  function write() {
    if (!storage) return false;
    try {
      storage.setItem(KEY, JSON.stringify(memory));
      return true;
    } catch (err) {
      return false;
    }
  }

  function get(gameId) {
    var data = read();
    return data && data[gameId] ? data[gameId] : null;
  }

  function setResult(gameId, result) {
    read();
    var record = {
      done: true,
      playedAt: new Date().toISOString()
    };
    if (result && typeof result === "object") {
      for (var key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          record[key] = result[key];
        }
      }
    }
    memory[gameId] = record;
    write();
    return record;
  }

  function isDone(gameId) {
    var record = get(gameId);
    return !!(record && record.done);
  }

  function all() {
    var data = read();
    var copy = {};
    for (var key in data) {
      if (key !== CAPS && Object.prototype.hasOwnProperty.call(data, key)) copy[key] = data[key];
    }
    return copy;
  }

  /* ------------------------------------------------------------ wallet */

  /*
   * A deal's caps are staged in `run` (memory only) while it is played and
   * committed at its reveal, together with its result. While a run is live
   * the wallet leaves out that deal's old committed caps, so a replay
   * replaces them. A run left before its reveal is dropped: nothing changes.
   */
  var run = null;

  function start() {
    var wallet = root.CONFIG && root.CONFIG.wallet;
    var n = wallet ? Number(wallet.start) : NaN;
    return isFinite(n) ? n : 100;
  }

  function slots() {
    var data = read();
    var caps = data[CAPS];
    return caps && typeof caps === "object" ? caps : {};
  }

  function total(rounds) {
    var sum = 0;
    for (var roundId in rounds) {
      var n = Number(rounds[roundId]);
      if (Object.prototype.hasOwnProperty.call(rounds, roundId) && isFinite(n)) sum += n;
    }
    return sum;
  }

  /* The committed wallet without one deal's caps (skip may be null). */
  function walletExcept(skip) {
    var caps = slots();
    var sum = start();
    for (var gameId in caps) {
      if (gameId !== skip && Object.prototype.hasOwnProperty.call(caps, gameId)) {
        sum += total(caps[gameId] || {});
      }
    }
    return sum;
  }

  function wallet() {
    return run ? walletExcept(run.gameId) + total(run.rounds) : walletExcept(null);
  }

  /*
   * `delay` lets the pill wait for an on-screen count-up before it moves.
   * `quiet` changes (a replay setting its old caps aside, a dropped run)
   * update the number without a flash or a floating delta.
   */
  function announce(from, options) {
    options = options || {};
    var to = wallet();
    if (from === to || typeof root.dispatchEvent !== "function") return;
    try {
      root.dispatchEvent(
        new root.CustomEvent("wallet:change", {
          detail: { from: from, to: to, delay: options.delay || 0, quiet: !!options.quiet }
        })
      );
    } catch (err) {
      /* Old browsers: the pill catches up on the next render. */
    }
  }

  function beginRun(gameId) {
    var from = wallet();
    run = { gameId: gameId, rounds: {} };
    announce(from, { quiet: true });
  }

  function runCaps(roundId, net, options) {
    if (!run) return;
    var from = wallet();
    run.rounds[roundId] = Number(net) || 0;
    announce(from, options);
  }

  function commitRun() {
    if (!run) return;
    var caps = slots();
    memory[CAPS] = caps;
    caps[run.gameId] = run.rounds;
    run = null;
    write();
  }

  function cancelRun() {
    if (!run) return;
    var from = wallet();
    run = null;
    announce(from, { quiet: true });
  }

  function clear() {
    var from = wallet();
    memory = {};
    run = null;
    if (storage) {
      try {
        storage.removeItem(KEY);
      } catch (err) {
        /* Nothing to do: memory is already empty. */
      }
    }
    announce(from);
  }

  root.GameStore = {
    available: !!storage,
    get: get,
    all: all,
    setResult: setResult,
    isDone: isDone,
    clear: clear,
    wallet: wallet,
    walletExcept: walletExcept,
    beginRun: beginRun,
    runCaps: runCaps,
    commitRun: commitRun,
    cancelRun: cancelRun,
    key: KEY
  };
})(typeof window !== "undefined" ? window : globalThis);
