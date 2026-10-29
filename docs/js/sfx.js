/*
 * sfx.js — tiny 8-bit sound effects, synthesised with Web Audio (no files).
 *
 * On by default; the ♪ button (title screen and top bar) turns it off, and
 * the choice is remembered on this device (localStorage inside try/catch).
 * Browsers only allow audio after a tap. Arriving from a tap on this site
 * (title page → game) counts, so audio starts at once; a page opened cold
 * shows the same "Tap to power on" screen on every page (powerGate), and
 * that tap starts audio before any text is typed. Every call is a no-op
 * while sound is off, locked or missing, so callers never need to check.
 *
 *   SFX.play("lock")   select, lock, type, flip, land, clink, coin, loss,
 *                      win, lose, stamp, perk, power, glitch, ending
 */
(function (root) {
  "use strict";

  var KEY = "wasteland-odds.sound";
  var on = true;
  var ctx = null;
  var master = null;
  var lastType = 0;
  var listeners = [];

  try {
    on = root.localStorage.getItem(KEY) !== "off";
  } catch (err) {
    on = true;
  }

  /* May audio start without a new tap? Yes after a tap that led here
     (userActivation), or if the browser says so (Firefox's policy API). */
  function allowedNow() {
    try {
      var nav = root.navigator;
      if (nav && nav.userActivation && nav.userActivation.hasBeenActive) return true;
      return !!(nav && typeof nav.getAutoplayPolicy === "function" &&
        nav.getAutoplayPolicy("audiocontext") === "allowed");
    } catch (err) {
      return false;
    }
  }

  /* iPhones mute web audio with the silent switch unless the page plays
     as "playback" (Safari 17+). Sound here is the game's own switch. */
  function playbackSession() {
    try {
      var session = root.navigator && root.navigator.audioSession;
      if (session && session.type !== "playback") session.type = "playback";
    } catch (err) {
      /* Older browsers: they follow the silent switch. */
    }
  }

  function audio() {
    if (ctx) return ctx;
    var Ctor = root.AudioContext || root.webkitAudioContext;
    if (!Ctor) return null;
    playbackSession();
    try {
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch (err) {
      ctx = null;
    }
    return ctx;
  }

  /* Only called from a tap (the toggle, the power-on screen or the first
     tap of a visit). `done` runs once audio is actually running. */
  function wake(done) {
    var c = audio();
    var finish = function () {
      if (done) done();
    };
    if (!c) {
      finish();
      return;
    }
    /* iOS unlocks audio only if something plays inside the tap itself. */
    try {
      var blip = c.createBufferSource();
      blip.buffer = c.createBuffer(1, 1, c.sampleRate);
      blip.connect(c.destination);
      blip.start(0);
    } catch (err) {
      /* Not needed outside iOS. */
    }
    /* "suspended" before the first tap; "interrupted" on iOS after the
       screen locks or another app plays sound. Both resume on a tap. */
    if (c.state !== "running" && typeof c.resume === "function") {
      var resumed = c.resume();
      if (resumed && typeof resumed.then === "function") resumed.then(finish, finish);
      else finish();
      return;
    }
    finish();
  }

  function ready() {
    return !!(ctx && ctx.state === "running");
  }

  /* One square/triangle note, optionally sliding to another pitch. */
  function tone(freq, ms, options) {
    options = options || {};
    var c = ctx;
    var t = c.currentTime + (options.at || 0) / 1000;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = options.type || "square";
    osc.frequency.setValueAtTime(freq, t);
    if (options.to) osc.frequency.exponentialRampToValueAtTime(options.to, t + ms / 1000);
    gain.gain.setValueAtTime(options.vol || 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.02);
  }

  /* A burst of white noise through a low-pass filter (thuds, chip landings). */
  function noise(ms, options) {
    options = options || {};
    var c = ctx;
    var t = c.currentTime + (options.at || 0) / 1000;
    var length = Math.max(1, Math.floor(c.sampleRate * ms / 1000));
    var buffer = c.createBuffer(1, length, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource();
    src.buffer = buffer;
    var filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = options.cutoff || 1200;
    var gain = c.createGain();
    gain.gain.setValueAtTime(options.vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t);
  }

  function arpeggio(notes, step, options) {
    notes.forEach(function (freq, i) {
      tone(freq, step * 1.6, Object.assign({}, options, { at: i * step }));
    });
  }

  var SOUNDS = {
    select: function () { tone(660, 50, { vol: 0.05 }); },
    lock: function () { tone(523, 60); tone(784, 90, { at: 60 }); },
    /* Terminal key click: a short square tick with a puff of noise. */
    type: function () { tone(1050, 12, { vol: 0.035 }); noise(10, { cutoff: 3200, vol: 0.025 }); },
    flip: function () { tone(600, 120, { type: "triangle", to: 1300, vol: 0.06 }); },
    land: function () { noise(60, { cutoff: 900, vol: 0.1 }); tone(220, 80, { vol: 0.05 }); },
    clink: function () { tone(1568, 60, { type: "triangle", vol: 0.07 }); tone(2093, 90, { type: "triangle", at: 50, vol: 0.06 }); },
    coin: function () { tone(988, 60, { vol: 0.05 }); tone(1319, 120, { at: 60, vol: 0.05 }); },
    loss: function () { tone(330, 260, { to: 140, vol: 0.06 }); },
    win: function () { arpeggio([523, 659, 784, 1047], 80, { vol: 0.05 }); },
    lose: function () { tone(392, 150, { vol: 0.05 }); tone(262, 220, { at: 150, vol: 0.05 }); },
    stamp: function () { noise(90, { cutoff: 380, vol: 0.25 }); tone(90, 140, { type: "sine", vol: 0.25 }); },
    power: function () {
      tone(55, 420, { type: "sawtooth", to: 110, vol: 0.05 });
      noise(120, { cutoff: 2400, vol: 0.06, at: 40 });
      tone(880, 60, { vol: 0.04, at: 380 });
    },
    glitch: function () { noise(40, { cutoff: 5000, vol: 0.05 }); noise(30, { cutoff: 3000, vol: 0.04, at: 70 }); },
    /* The Report Card's ending (~2.2 s): a wistful western phrase in A minor
       over a triangle bass, resolving into a rising C-major fanfare, a held
       chord and a sparkle. Bittersweet "for now", then "well done". */
    ending: function () {
      var step = 170;
      [440, 523, 659, 587, 523, 440, 392].forEach(function (freq, i) {
        tone(freq, step * 1.4, { at: i * step, vol: 0.045 });
      });
      [[110, 0], [87, 3], [98, 6]].forEach(function (b) {
        tone(b[0], step * 3, { type: "triangle", at: b[1] * step, vol: 0.09 });
      });
      var fanfare = 7 * step;
      [523, 659, 784, 1047].forEach(function (freq, i) {
        tone(freq, 140, { at: fanfare + i * 90, vol: 0.05 });
      });
      var chord = fanfare + 360;
      [523, 659, 784].forEach(function (freq) {
        tone(freq, 650, { type: "triangle", at: chord, vol: 0.05 });
      });
      tone(131, 650, { type: "triangle", at: chord, vol: 0.09 });
      [2093, 2637, 3136].forEach(function (freq, i) {
        tone(freq, 70, { at: chord + 80 + i * 70, vol: 0.025 });
      });
    },
    perk: function () { arpeggio([784, 988, 1175, 1568], 90, { type: "triangle", vol: 0.06 }); }
  };

  function play(name) {
    /* Nothing is queued on a context that isn't running yet, so the first
       tap can't release a burst of stored blips. */
    if (!on || !SOUNDS[name] || !ctx || ctx.state !== "running") return;
    /* Typewriter ticks are throttled so long lines don't buzz. */
    if (name === "type") {
      var now = Date.now();
      if (now - lastType < 50) return;
      lastType = now;
    }
    try {
      SOUNDS[name]();
    } catch (err) {
      /* Sound is a bonus; never break the game over it. */
    }
  }

  function save() {
    try {
      root.localStorage.setItem(KEY, on ? "on" : "off");
    } catch (err) {
      /* Private mode: the choice lasts for this page only. */
    }
  }

  /* The switch always says its state in words: "♪ Sound on" / "♪ Sound off". */
  function paint(button) {
    button.classList.toggle("is-on", on);
    button.textContent = on ? "♪ Sound on" : "♪ Sound off";
  }

  function mountToggle(button) {
    if (!button) return;
    paint(button);
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      on = !on;
      save();
      paint(button);
      if (on) {
        wake(function () { play("coin"); });
      }
      listeners.forEach(function (fn) {
        fn(on);
      });
    });
  }

  /*
   * "Tap to power on": the same screen on every page while sound is on but
   * audio is still locked. The tap starts audio (with a power-on hum), then
   * calls start(); switching sound off starts straight away instead.
   */
  var gate = null;

  function closeGate() {
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    gate = null;
  }

  function powerGate(host, start, extraClass) {
    var go = function () {
      closeGate();
      start();
    };
    if (!host || !on || ready() || !(root.AudioContext || root.webkitAudioContext)) {
      start();
      return;
    }
    gate = document.createElement("button");
    gate.type = "button";
    gate.className = "power-gate" + (extraClass ? " " + extraClass : "");
    var icon = document.createElement("span");
    icon.className = "power-gate__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⏻";
    var label = document.createElement("span");
    label.textContent = "Tap to power on";
    var hint = document.createElement("span");
    hint.className = "power-gate__hint";
    hint.textContent = "Sound is on · the Sound button turns it off";
    gate.appendChild(icon);
    gate.appendChild(label);
    gate.appendChild(hint);
    gate.addEventListener("click", function (event) {
      event.stopPropagation();
      wake(function () {
        play("power");
      });
      go();
    });
    listeners.push(function (soundOn) {
      if (!soundOn && gate) go();
    });
    host.appendChild(gate);
  }

  /* After a tap that led here, sound works before any new tap. */
  if (on && allowedNow()) audio();

  /* Any tap starts audio if it isn't running: the first tap of a page
     without the power-on screen, or after iOS paused it (screen lock,
     another app). A touch pointerdown doesn't count as a tap, so the tap
     events are watched too. Cheap when audio is already running. */
  if (typeof document !== "undefined") {
    var TAPS = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
    var unlock = function () {
      if (on && !ready()) wake();
    };
    TAPS.forEach(function (type) {
      document.addEventListener(type, unlock, true);
    });
  }

  root.SFX = {
    play: play,
    mountToggle: mountToggle,
    /* From a tap: start audio, then call done (e.g. play a sound). */
    unlock: wake,
    ready: ready,
    powerGate: powerGate,
    closeGate: closeGate,
    isOn: function () {
      return on;
    },
    onToggle: function (fn) {
      listeners.push(fn);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
