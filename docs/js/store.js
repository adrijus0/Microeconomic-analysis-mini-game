/*
 * store.js — tiny progress store for the games hub.
 *
 * localStorage is used only inside try/catch. If it is unavailable (private
 * mode, file:// restrictions, a test that throws), everything falls back to an
 * in-memory object, so a game still completes and the Report Card still works
 * for the current page. No accounts, no network, no tracking.
 */
(function (root) {
  "use strict";

  var KEY = "poc.games.v1";
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
      if (Object.prototype.hasOwnProperty.call(data, key)) copy[key] = data[key];
    }
    return copy;
  }

  function clear() {
    memory = {};
    if (!storage) return;
    try {
      storage.removeItem(KEY);
    } catch (err) {
      /* Nothing to do: memory is already empty. */
    }
  }

  root.GameStore = {
    available: !!storage,
    get: get,
    all: all,
    setResult: setResult,
    isDone: isDone,
    clear: clear,
    key: KEY
  };
})(typeof window !== "undefined" ? window : globalThis);
