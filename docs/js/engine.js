/*
 * engine.js — the data-driven encounter runner.
 *
 * One encounter = one entry in CONFIG.games. The engine renders
 *   scene → (choice → resolve → [beat]) × rounds → reveal
 * and leaves the paradox-specific maths to the module named in game.logic
 * (window.AllaisGame, …). A module may provide:
 *   init(rng, game, env)               -> per-run context (e.g. a hidden mix);
 *                                         env.wallet = caps brought to the deal
 *   resolve(round, option, ctx, rng)   -> { payoff, … } for the outcome draw
 *   resolveAll(rounds, choices, ctx, rng) -> one draw that settles every
 *                                         round (games with resolveAtEnd)
 *   reveal(choices, game, ctx)         -> the short reveal summary
 * Without resolve(), the option's lottery is sampled with the seeded RNG.
 * A game with `resolveAtEnd: true` shows no outcome until the last round,
 * so an early draw can never leak information into a later choice.
 *
 * Outcome animations are "props" (chest, …) registered in PROPS below.
 *
 * Caps wallet: each mount starts a GameStore run. An option's `fee` is paid
 * on lock-in and each resolved round's net (outcome.net, else
 * outcome.payoff) is staged; the reveal commits the run, replacing the deal's
 * old caps (no farming on replays). Leaving early drops the run.
 * Works from file:// and under a GitHub Pages sub-path. Classic script.
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};
  var FX = root.FX;
  var current = null;

  /* ------------------------------------------------------------------ */
  /* Small DOM helpers                                                   */
  /* ------------------------------------------------------------------ */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function intText(value) {
    var n = Math.round(Number(value) || 0);
    /* ASCII minus: Press Start 2P has no U+2212 glyph. */
    var sign = n < 0 ? "-" : "";
    return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function caps(value) {
    return intText(value) + " caps";
  }

  function pct(p) {
    var value = Math.round((Number(p) || 0) * 1000) / 10;
    return String(value).replace(/\.0$/, "") + "%";
  }

  /* 8-bit sound (sfx.js); silent unless the player turned it on. */
  function sfx(name) {
    if (root.SFX) root.SFX.play(name);
  }

  function setStatus(state, message) {
    if (!state || !state.status) return;
    state.status.textContent = message || "";
  }

  function focusHeading(state) {
    var heading = state.stageHost.querySelector("h1, h2");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    try {
      heading.focus({ preventScroll: true });
    } catch (err) {
      try {
        heading.focus();
      } catch (err2) {
        /* Non-fatal. */
      }
    }
  }

  /* A new stage starts at the top, otherwise a button tapped at the bottom of
     a long phone screen leaves the next heading off-screen. */
  function resetScroll() {
    try {
      if (root.scrollY > 0) {
        root.scrollTo({ top: 0, behavior: FX.reduced() ? "auto" : "smooth" });
      }
    } catch (err) {
      try {
        root.scrollTo(0, 0);
      } catch (err2) {
        /* Non-fatal. */
      }
    }
  }

  function logicFor(game) {
    var logic = game && game.logic ? root[game.logic] : null;
    return logic || null;
  }

  function roundRng(state, round, salt) {
    return root.RNG.create(
      state.seed + "|" + state.game.id + "|" + (round ? round.id : "run") + "|" + salt
    );
  }

  /* A panel that flickers on like an old CRT. */
  function panel(state, kind) {
    var node = el("section", "stage stage--" + kind);
    if (!FX.instant()) node.classList.add("flicker-in");
    return node;
  }

  /* Sticky bottom bar: the main action sits in the thumb zone on phones. */
  function actionbar() {
    return el("div", "actionbar");
  }

  function button(label, className, onClick) {
    var b = el("button", "btn " + (className || "btn--primary"), label);
    b.type = "button";
    if (onClick) b.addEventListener("click", onClick);
    return b;
  }

  /* ------------------------------------------------------------------ */
  /* Maths (KaTeX, rendered lazily)                                     */
  /* ------------------------------------------------------------------ */

  function math(host, tex, display) {
    if (!host) return;
    host.innerHTML = "";
    if (root.katex && typeof root.katex.render === "function") {
      try {
        root.katex.render(tex, host, {
          displayMode: !!display,
          throwOnError: false,
          strict: "ignore",
          macros: Object.assign({}, CONFIG.katexMacros || {})
        });
        return;
      } catch (err) {
        console.warn("[engine] KaTeX failed:", err);
      }
    }
    host.classList.add("math-raw");
    host.textContent = tex;
  }

  /*
   * KaTeX (about 80 KB plus fonts) is fetched only when a "Show the math"
   * box is first opened, so slow lecture-hall Wi-Fi never waits for it.
   * If it fails to load, formulas fall back to their raw TeX text.
   */
  var katexWaiters = null;

  function loadKatex(done) {
    if (root.katex) {
      done();
      return;
    }
    if (katexWaiters) {
      katexWaiters.push(done);
      return;
    }
    katexWaiters = [done];
    var base = "vendor/katex/dist/";
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = base + "katex.min.css";
    document.head.appendChild(css);
    var script = document.createElement("script");
    script.src = base + "katex.min.js";
    function flush() {
      var waiting = katexWaiters || [];
      katexWaiters = null;
      waiting.forEach(function (fn) {
        fn();
      });
    }
    script.onload = flush;
    script.onerror = flush;
    document.head.appendChild(script);
  }

  /* Formulas inside a closed <details> are typeset on first open only. */
  function lazyMath(details) {
    var done = false;
    function render() {
      if (done || !details.open) return;
      done = true;
      loadKatex(function () {
        Array.prototype.forEach.call(details.querySelectorAll("[data-tex]"), function (node) {
          math(node, node.getAttribute("data-tex"), true);
        });
      });
    }
    details.addEventListener("toggle", render);
  }

  /* ------------------------------------------------------------------ */
  /* Lottery presentation                                               */
  /* ------------------------------------------------------------------ */

  /* Bar segments for a cap lottery ({p, x}), coloured by payoff. A
     lottery that can lose shows signed amounts (+110 / −100). */
  function segmentsOf(state, option) {
    var lottery = option.lottery || [];
    var signed = lottery.some(function (part) {
      return Number(part.x) < 0;
    });
    return lottery.map(function (part) {
      var x = Number(part.x);
      var cls = x < 0
        ? "lot-seg--loss"
        : x === 0
        ? "lot-seg--zero"
        : x === state.maxPayoff
        ? "lot-seg--high"
        : "lot-seg--mid";
      return {
        p: Number(part.p),
        cls: cls,
        barText: pct(part.p),
        row: [pct(part.p), (signed && x > 0 ? "+" : "") + caps(x)]
      };
    });
  }

  function lotteryBar(state, option) {
    var bar = el("span", "lot-bar");
    bar.setAttribute("aria-hidden", "true");
    segmentsOf(state, option).forEach(function (seg) {
      if (!(seg.p > 0)) return;
      var node = el("span", "lot-bar__seg " + seg.cls + (seg.p < 0.06 ? " is-thin" : ""));
      node.style.width = seg.p * 100 + "%";
      if (seg.p >= 0.18) node.appendChild(el("span", "lot-bar__p", seg.barText));
      bar.appendChild(node);
    });
    return bar;
  }

  function lotteryList(state, option) {
    var list = el("span", "lot-list");
    segmentsOf(state, option).forEach(function (seg) {
      var row = el("span", "lot-list__row");
      row.appendChild(el("span", "lot-list__p", seg.row[0]));
      row.appendChild(el("span", "lot-list__arrow", "→"));
      row.appendChild(el("span", "lot-list__x", seg.row[1]));
      list.appendChild(row);
    });
    return list;
  }

  function optionCard(state, option) {
    var card = el("button", "option");
    card.type = "button";
    card.setAttribute("data-option", option.id);
    card.setAttribute("aria-pressed", "false");

    var head = el("span", "option__head");
    if (option.sprite) {
      var spriteWrap = el("span", "option__sprite");
      spriteWrap.appendChild(
        root.GameAssets.img(option.sprite, { className: "sprite sprite--option", alt: "" })
      );
      head.appendChild(spriteWrap);
    }
    var titles = el("span", "option__titles");
    titles.appendChild(el("span", "option__id", option.id));
    titles.appendChild(el("span", "option__name", option.label));
    if (option.note) titles.appendChild(el("span", "option__note", option.note));
    head.appendChild(titles);
    card.appendChild(head);

    /* A prop may draw its own picture of the odds (Festus's barrel). */
    var prop = PROPS[state.game.prop] || {};
    if (prop.optionVisual) {
      card.appendChild(prop.optionVisual(state, option));
    } else if (option.lottery) {
      card.appendChild(lotteryBar(state, option));
      card.appendChild(lotteryList(state, option));
    }

    card.addEventListener("click", function () {
      onPick(state, option.id);
    });
    return card;
  }

  /* Big tap targets for "name your price" style rounds. */
  function chipButton(state, option) {
    var chip = el("button", "option option--chip");
    chip.type = "button";
    chip.setAttribute("data-option", option.id);
    chip.setAttribute("aria-pressed", "false");
    chip.appendChild(el("span", "chip__value", option.label));
    if (option.note) chip.appendChild(el("span", "chip__unit", option.note));
    chip.addEventListener("click", function () {
      onPick(state, option.id);
    });
    return chip;
  }

  function onPick(state, optionId) {
    if (state.locked || state.stage !== "choice") return;
    if (state.selected === optionId) lockChoice(state);
    else selectOption(state, optionId);
  }

  /* ------------------------------------------------------------------ */
  /* Shell                                                              */
  /* ------------------------------------------------------------------ */

  function buildShell(state) {
    var game = state.game;
    var rootNode = el("div", "game game--" + game.id);
    rootNode.setAttribute("data-game", game.id);

    var bg = el("div", "scene-bg");
    bg.setAttribute("aria-hidden", "true");
    root.GameAssets.background(bg, game.scene && game.scene.background);
    rootNode.appendChild(bg);
    rootNode.appendChild(el("div", "scene-veil"));

    var shell = el("div", "game__shell");

    var bar = el("div", "game__bar");
    bar.appendChild(el("span", "game__title", game.title));
    shell.appendChild(bar);

    var steps = el("ol", "game__steps");
    steps.setAttribute("aria-hidden", "true");
    shell.appendChild(steps);

    var stage = el("div", "game__stage");
    stage.setAttribute("role", "region");
    stage.setAttribute("aria-label", game.title);
    shell.appendChild(stage);

    var status = el("p", "visually-hidden");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("role", "status");
    shell.appendChild(status);

    rootNode.appendChild(shell);
    state.host.appendChild(rootNode);

    state.rootNode = rootNode;
    state.stageHost = stage;
    state.stepsHost = steps;
    state.status = status;

    state.keyHandler = function (event) {
      onKeyDown(state, event);
    };
    document.addEventListener("keydown", state.keyHandler);
  }

  function buildSteps(state) {
    var steps = [{ key: "scene", label: "Intro" }];
    (state.game.rounds || []).forEach(function (round, index) {
      steps.push({ key: "round-" + index, label: round.stepLabel || "Deal " + (index + 1) });
    });
    steps.push({ key: "reveal", label: "Reveal" });
    state.steps = steps;

    clear(state.stepsHost);
    steps.forEach(function (step) {
      var item = el("li", "game__step");
      item.setAttribute("data-step", step.key);
      item.appendChild(el("span", "game__step-num"));
      item.appendChild(el("span", "game__step-label", step.label));
      state.stepsHost.appendChild(item);
    });
  }

  function setStep(state, key) {
    var index = -1;
    state.steps.forEach(function (step, i) {
      if (step.key === key) index = i;
    });
    Array.prototype.forEach.call(state.stepsHost.querySelectorAll(".game__step"), function (node, i) {
      node.classList.toggle("is-current", i === index);
      node.classList.toggle("is-done", i < index);
      var num = node.querySelector(".game__step-num");
      if (num) num.textContent = i < index ? "✓" : String(i + 1);
    });
  }

  function show(state, node, stepKey, statusText) {
    FX.guard(350);
    clear(state.stageHost);
    setStep(state, stepKey);
    state.stageHost.appendChild(node);
    setStatus(state, statusText);
    focusHeading(state);
    resetScroll();
  }

  /* ------------------------------------------------------------------ */
  /* Scene                                                              */
  /* ------------------------------------------------------------------ */

  function npcFigure(sprite, alt) {
    var figure = el("div", "npc");
    figure.appendChild(
      root.GameAssets.img(sprite, { className: "sprite sprite--hero", alt: alt || "" })
    );
    return figure;
  }

  function showScene(state) {
    state.stage = "scene";
    state.locked = false;
    state.selected = null;

    var game = state.game;
    var scene = game.scene || {};
    var node = panel(state, "scene");

    node.appendChild(npcFigure(scene.sprite, scene.spriteAlt));
    node.appendChild(el("p", "eyebrow", scene.kicker || game.location || ""));
    var heading = el("h1", "stage__title", scene.heading || game.title);
    FX.glitch(heading);
    node.appendChild(heading);

    var copy = el("div", "stage__copy dialogue");
    node.appendChild(copy);
    var typing = FX.typeLines(copy, scene.lines || [], { timers: state.timers });
    /* A prop may explain its setup before the first choice. */
    var prop = PROPS[game.prop] || {};
    if (prop.sceneExtra) prop.sceneExtra(state, node);
    node.addEventListener("click", function (event) {
      if (event.target.closest("button")) return;
      typing.finish();
    });

    var bar = actionbar();
    bar.appendChild(
      button((scene.cta || "Continue") + " ▶", "btn--primary", function () {
        typing.finish();
        startRound(state, 0);
      })
    );
    node.appendChild(bar);

    show(state, node, "scene", (scene.heading || game.title) + ". " + (scene.lines || []).join(" "));
  }

  /* ------------------------------------------------------------------ */
  /* Choice                                                             */
  /* ------------------------------------------------------------------ */

  function startRound(state, index) {
    state.roundIndex = index;
    state.selected = null;
    state.locked = false;
    state.stage = "choice";
    renderChoice(state);
  }

  function renderChoice(state) {
    var round = state.game.rounds[state.roundIndex];
    var prop = PROPS[state.game.prop] || {};
    var node = panel(state, "choice");
    node.setAttribute("data-round", round.id);

    node.appendChild(el("p", "eyebrow", fill(state, round.kicker || round.stepLabel || "")));
    node.appendChild(el("h2", "stage__title", fill(state, round.prompt)));
    if (state.spotted && state.roundIndex === 0 && state.game.stakeNote) {
      node.appendChild(el("p", "bet-memo", fill(state, state.game.stakeNote)));
    }
    if (round.intro) node.appendChild(el("p", "stage__lead", fill(state, round.intro)));
    if (prop.choiceHeader) prop.choiceHeader(state, node, round);

    var chips = round.layout === "chips";
    var group = el("div", chips ? "chips" : "options");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", round.prompt);
    (round.options || []).forEach(function (option) {
      group.appendChild(chips ? chipButton(state, option) : optionCard(state, option));
    });
    node.appendChild(group);

    var bar = actionbar();
    var lock = button("Pick one", "btn--primary btn--lock", function () {
      lockChoice(state);
    });
    lock.disabled = true;
    bar.appendChild(lock);
    node.appendChild(bar);
    state.lockButton = lock;

    show(state, node, "round-" + state.roundIndex, round.prompt);
  }

  /* "{wallet}" in round copy becomes the caps brought to this deal. */
  function fill(state, text) {
    return String(text == null ? "" : text).replace(/\{wallet\}/g, intText(state.wallet));
  }

  /* ------------------------------------------------------------------ */
  /* Caps wallet                                                        */
  /* ------------------------------------------------------------------ */

  function stageCaps(round, net, delay) {
    var store = root.GameStore;
    if (store && typeof store.runCaps === "function") store.runCaps(round.id, net, { delay: delay || 0 });
  }

  function walletText() {
    var store = root.GameStore;
    return store && typeof store.wallet === "function" ? " Wallet: " + caps(store.wallet()) + "." : "";
  }

  function optionById(round, id) {
    var found = null;
    (round.options || []).forEach(function (option) {
      if (option.id === id) found = option;
    });
    return found;
  }

  function selectOption(state, optionId) {
    if (state.locked) return;
    state.selected = optionId;
    sfx("select");
    Array.prototype.forEach.call(state.stageHost.querySelectorAll(".option"), function (node) {
      var on = node.getAttribute("data-option") === optionId;
      node.classList.toggle("is-selected", on);
      node.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var round = state.game.rounds[state.roundIndex];
    var option = optionById(round, optionId);
    var name = option ? option.lockLabel || option.id : optionId;
    if (state.lockButton) {
      state.lockButton.disabled = false;
      state.lockButton.textContent = "Lock in " + name + " ▶";
    }
    var described = option && !option.lockLabel ? ", " + option.label : "";
    setStatus(state, "Selected " + name + described + ". Tap again or press Lock in.");
  }

  function lockChoice(state) {
    if (state.locked || !state.selected) return;
    var round = state.game.rounds[state.roundIndex];
    var chosen = optionById(round, state.selected);
    if (!chosen) return;

    state.locked = true;
    state.choices[round.id] = chosen.id;
    FX.buzz(20);
    sfx("lock");
    /* Pay to play: the fee leaves the wallet before the outcome is known. */
    if (Number(chosen.fee) > 0) stageCaps(round, -Number(chosen.fee));

    var logic = logicFor(state.game);
    var last = state.roundIndex === state.game.rounds.length - 1;
    if (state.game.resolveAtEnd && !last) {
      setStatus(state, "Locked in " + (chosen.lockLabel || chosen.id) + ".");
      afterRound(state);
      return;
    }

    var rng = roundRng(state, round, "draw");
    var outcome;
    if (state.game.resolveAtEnd && logic && typeof logic.resolveAll === "function") {
      outcome = logic.resolveAll(state.game.rounds, state.choices, state.ctx, rng, state.game);
    } else if (logic && typeof logic.resolve === "function") {
      outcome = logic.resolve(round, chosen, state.ctx, rng, state.game);
    } else {
      outcome = { payoff: root.RNG.sample(rng, chosen.lottery || []) };
    }
    state.draws[round.id] = outcome;
    renderResolve(state, round, chosen, outcome);
  }

  /* ------------------------------------------------------------------ */
  /* Resolve                                                            */
  /* ------------------------------------------------------------------ */

  function renderResolve(state, round, option, outcome) {
    state.stage = "resolve";
    var game = state.game;
    var resolve = game.resolve || {};
    var node = panel(state, "resolve");

    node.appendChild(
      el("p", "eyebrow", game.resolveAtEnd ? "All bets locked" : "Locked in · " + (round.stepLabel || ""))
    );
    var heading = el("h2", "stage__title", resolve.heading || "Here goes…");
    node.appendChild(heading);

    var propHost = el("div", "prop");
    node.appendChild(propHost);

    var result = el("div", "result");
    result.hidden = true;
    var value = el("p", "result__value");
    value.appendChild(root.GameAssets.img("icon_caps", { className: "sprite sprite--caps", alt: "" }));
    var number = el("span", "result__num", caps(0));
    value.appendChild(number);
    result.appendChild(value);
    var line = el("p", "result__copy", outcome.copy || resolveCopy(state, outcome.payoff, option));
    result.appendChild(line);
    node.appendChild(result);

    var bar = actionbar();
    var next = button(nextLabel(state) + " ▶", "btn--primary", function () {
      afterRound(state);
    });
    next.disabled = true;
    bar.appendChild(next);
    node.appendChild(bar);

    show(state, node, "round-" + state.roundIndex, "Locked in " + (option.lockLabel || option.id) + ".");

    var prop = PROPS[game.prop] || PROPS.chest;
    prop.play(state, propHost, option, outcome, function () {
      if (state.destroyed) return;
      /* A net result (prize minus fee) decides the mood when there is one. */
      var won = outcome.net != null ? outcome.net >= 0 : Number(outcome.payoff) > 0;
      var after = outcome.heading || (won ? resolve.winHeading : resolve.loseHeading);
      if (after) heading.textContent = after;
      /* No jingle when nothing changed (walking away, breaking even). */
      if (outcome.net !== 0) sfx(won ? "win" : "lose");
      result.hidden = false;
      result.classList.toggle("is-lose", !won);
      if (!FX.instant()) result.classList.add("flicker-in");
      FX.countUp(number, 0, Number(outcome.payoff) || 0, {
        format: caps,
        timers: state.timers
      });
      /* Staged now; the wallet pill animates once this count-up lands. */
      stageCaps(round, outcome.net != null ? outcome.net : Number(outcome.payoff) || 0, FX.instant() ? 0 : 650);
      next.disabled = false;
      setStatus(state, "Outcome: " + caps(outcome.payoff) + ". " + line.textContent + walletText());
      try {
        next.focus({ preventScroll: true });
      } catch (err) {
        next.focus();
      }
      try {
        result.scrollIntoView({ block: "nearest", behavior: FX.reduced() ? "auto" : "smooth" });
      } catch (err) {
        /* Older browsers: the player can scroll. */
      }
    });
  }

  function resolveCopy(state, payoff, option) {
    var resolve = state.game.resolve || {};
    var template = Number(payoff) === 0
      ? resolve.lose || "Nothing this time."
      : resolve.win || "You get {x}.";
    return String(template).replace("{x}", caps(payoff));
  }

  function nextLabel(state) {
    var nextIndex = state.roundIndex + 1;
    if (nextIndex < state.game.rounds.length) return "Next";
    return "The reveal";
  }

  function afterRound(state) {
    var game = state.game;
    var round = game.rounds[state.roundIndex];
    var nextIndex = state.roundIndex + 1;
    if (nextIndex >= game.rounds.length) {
      showReveal(state);
      return;
    }
    if (game.beat && game.beat.afterRound === round.id && !FX.fast()) {
      showBeat(state, nextIndex);
      return;
    }
    startRound(state, nextIndex);
  }

  /* ------------------------------------------------------------------ */
  /* Beat: a few seconds of travel between rounds                       */
  /* ------------------------------------------------------------------ */

  function showBeat(state, nextIndex) {
    state.stage = "beat";
    var beat = state.game.beat;
    var node = panel(state, "beat");
    node.appendChild(el("p", "eyebrow", beat.kicker || "Meanwhile…"));
    var heading = el("h2", "visually-hidden", "Travel");
    node.appendChild(heading);
    var copy = el("div", "stage__copy dialogue");
    node.appendChild(copy);

    var seconds = Math.max(1, Number(beat.seconds) || 3);
    var track = el("div", "beat__track");
    var fill = el("div", "beat__fill");
    fill.style.animationDuration = seconds + "s";
    track.appendChild(fill);
    node.appendChild(track);

    var moved = false;
    function go() {
      if (moved || state.destroyed) return;
      moved = true;
      clearTimers(state);
      startRound(state, nextIndex);
    }
    var bar = actionbar();
    bar.appendChild(button(FX.reduced() ? "Continue ▶" : "Skip ▶", "btn--ghost", go));
    node.appendChild(bar);

    FX.typeLines(copy, beat.lines || [], { timers: state.timers, speed: 14 });
    show(state, node, "round-" + (nextIndex - 1), (beat.lines || []).join(" "));
    if (!FX.reduced()) {
      FX.later(state.timers, go, seconds * 1000 + 600);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Reveal                                                             */
  /* ------------------------------------------------------------------ */

  function summaryFor(state) {
    var logic = logicFor(state.game);
    if (!logic || typeof logic.reveal !== "function") {
      console.warn("[engine] no reveal logic for " + state.game.id);
      return null;
    }
    try {
      return logic.reveal(state.choices, state.game, state.ctx, state.draws);
    } catch (err) {
      console.warn("[engine] reveal failed:", err);
      return null;
    }
  }

  function figureSVG(name) {
    var F = root.Figures || {};
    if (name === "triangle" && F.triangleSVG) return F.triangleSVG();
    if (name === "weighting" && F.weightingSVG) return F.weightingSVG();
    return "";
  }

  var FIGURE_TITLES = {
    triangle: "The probability triangle",
    weighting: "Probability weighting"
  };

  function mathBox(state, reveal, summary) {
    var details = el("details", "mathbox");
    details.appendChild(el("summary", "mathbox__summary", "Show the math"));
    var body = el("div", "mathbox__body");

    ((summary && summary.math) || []).forEach(function (row) {
      var fig = el("figure", "formula");
      if (row.label) fig.appendChild(el("figcaption", "formula__label", row.label));
      var host = el("div", "formula__math");
      host.setAttribute("data-tex", row.tex);
      host.textContent = row.tex;
      fig.appendChild(host);
      body.appendChild(fig);
    });

    (reveal.figures || []).forEach(function (name) {
      var svg = figureSVG(name);
      if (!svg) return;
      var fig = el("figure", "figure");
      fig.appendChild(el("figcaption", "figure__title", FIGURE_TITLES[name] || ""));
      var host = el("div", "figure__host");
      host.innerHTML = svg;
      fig.appendChild(host);
      var text = name === "triangle" ? reveal.triangleCaption : reveal.weightingCaption;
      if (text) fig.appendChild(el("p", "figure__caption", text));
      body.appendChild(fig);
    });

    (reveal.notes || []).forEach(function (note) {
      body.appendChild(el("p", "mathbox__note", note.text));
    });

    if (reveal.crowdSource) {
      body.appendChild(el("p", "mathbox__source", "Study: " + reveal.crowdSource + "."));
    }

    details.appendChild(body);
    lazyMath(details);
    return details;
  }

  /* The perk a finished deal unlocks: one for choosing like most people,
     one for the rest (CONFIG.games.<id>.perks). */
  function perkOf(game, summary) {
    if (!game.perks || !summary || summary.crowdMatch == null) return null;
    return game.perks[summary.crowdMatch ? "crowd" : "other"] || null;
  }

  /* A Fallout-style perk card with the deal's NPC as its art. */
  function perkCard(game, perk, fresh) {
    var card = el("div", "perk" + (fresh && !FX.instant() ? " perk--new" : ""));
    var art = el("span", "perk__art");
    art.appendChild(root.GameAssets.img(game.scene && game.scene.sprite, { className: "sprite sprite--perk", alt: "" }));
    card.appendChild(art);
    var body = el("span", "perk__body");
    if (fresh) body.appendChild(el("span", "perk__kicker", "Perk unlocked"));
    body.appendChild(el("strong", "perk__name", perk.name));
    body.appendChild(el("span", "perk__text", perk.text));
    card.appendChild(body);
    return card;
  }

  function showReveal(state) {
    state.stage = "reveal";
    var game = state.game;
    var reveal = game.reveal || {};
    var summary = summaryFor(state);

    if (root.GameStore && typeof root.GameStore.setResult === "function") {
      root.GameStore.setResult(game.id, {
        you: summary ? summary.you : null,
        crowdMatch: summary ? !!summary.crowdMatch : null,
        consistent: summary ? summary.consistent : null,
        stamp: summary ? summary.stamp : null,
        choices: state.choices
      });
    }
    /* The result and its caps land together: the deal is done and paid. */
    if (root.GameStore && typeof root.GameStore.commitRun === "function") {
      root.GameStore.commitRun();
      state.committed = true;
    }

    var node = panel(state, "reveal");
    node.appendChild(el("p", "eyebrow", "Reveal"));
    var heading = el("h1", "stage__title reveal__name", reveal.name || game.paradox);
    FX.glitch(heading);
    node.appendChild(heading);
    if (reveal.kicker) node.appendChild(el("p", "reveal__kicker", reveal.kicker));

    if (summary && summary.stamp) {
      node.appendChild(FX.stamp(summary.stamp.text, summary.stamp.tone));
      /* The thud lands with the slam (300 ms delay + most of 520 ms). */
      FX.later(state.timers, function () { sfx("stamp"); }, FX.instant() ? 0 : 600);
    }

    var versus = el("dl", "versus");
    function vsRow(label, value, cls) {
      var row = el("div", "versus__row" + (cls ? " " + cls : ""));
      row.appendChild(el("dt", null, label));
      row.appendChild(el("dd", null, value));
      versus.appendChild(row);
    }
    vsRow("You", summary ? summary.you : "—", "is-you");
    /* From the experiments on the slides, not from other players. */
    vsRow("In studies", reveal.crowd || "—");
    node.appendChild(versus);

    if (summary && summary.line) node.appendChild(el("p", "reveal__line", summary.line));

    if (summary && summary.chain && summary.chain.length) {
      var chain = el("ol", "chain");
      summary.chain.forEach(function (step, i) {
        var li = el("li", "chain__step", step);
        li.style.animationDelay = FX.instant() ? "0s" : 0.35 + i * 0.6 + "s";
        chain.appendChild(li);
      });
      node.appendChild(chain);
      /* The punchline is the last step: make sure it is not under the bar. */
      if (!FX.instant()) {
        FX.later(state.timers, function () {
          try {
            chain.scrollIntoView({ block: "nearest", behavior: "smooth" });
          } catch (err) {
            /* Older browsers: the player can scroll. */
          }
        }, 350 + summary.chain.length * 600 + 300);
      }
    }

    if (summary && summary.tiles && summary.tiles.length) {
      var tiles = el("div", "tiles");
      summary.tiles.forEach(function (tile) {
        var t = el("div", "tile" + (tile.mine ? " is-mine" : ""));
        t.appendChild(el("span", "tile__label", tile.label));
        t.appendChild(el("strong", "tile__value", tile.value));
        if (tile.note) t.appendChild(el("span", "tile__note", tile.note));
        tiles.appendChild(t);
      });
      node.appendChild(tiles);
    }

    var prop = PROPS[game.prop] || {};
    if (prop.revealExtra) prop.revealExtra(state, node, summary);

    var perk = perkOf(game, summary);
    if (perk) {
      node.appendChild(perkCard(game, perk, true));
      FX.later(state.timers, function () { sfx("perk"); }, FX.instant() ? 300 : 1000);
    }

    if (reveal.takeaway) {
      var quote = el("blockquote", "takeaway");
      quote.appendChild(el("p", null, reveal.takeaway));
      node.appendChild(quote);
    }

    node.appendChild(mathBox(state, reveal, summary));

    var bar = actionbar();
    bar.classList.add("actionbar--row");
    var order = CONFIG.encounterOrder || [];
    var at = order.indexOf(game.id);
    var nextId = null;
    for (var i = 1; i <= order.length; i += 1) {
      var candidate = order[(at + i) % order.length];
      if (candidate !== game.id && !(root.GameStore && root.GameStore.isDone(candidate))) {
        nextId = candidate;
        break;
      }
    }
    var primary = el("a", "btn btn--primary");
    if (nextId) {
      primary.href = "#" + nextId;
      primary.textContent = "Next deal ▶";
    } else {
      primary.href = "#report";
      primary.textContent = "Report Card ▶";
    }
    bar.appendChild(primary);
    var mapLink = el("a", "btn btn--ghost", "Map");
    mapLink.href = "#map";
    bar.appendChild(mapLink);
    node.appendChild(bar);

    show(
      state,
      node,
      "reveal",
      (reveal.name || game.paradox) + ". " + (summary && summary.stamp ? summary.stamp.text + ". " : "") +
        (summary && summary.line ? summary.line : "")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Props: outcome animations                                          */
  /* ------------------------------------------------------------------ */

  var PROPS = {
    /* The original lockbox: shake, flash, open. */
    chest: {
      play: function (state, host, option, outcome, done) {
        var box = el("div", "prop__chest");
        box.appendChild(
          root.GameAssets.img(option.sprite, { className: "sprite sprite--resolve", alt: "" })
        );
        box.appendChild(el("span", "prop__flash"));
        host.appendChild(box);
        var card = el("div", "prop__card");
        card.appendChild(el("p", "prop__name", option.id + " — " + option.label));
        card.appendChild(lotteryBar(state, option));
        host.appendChild(card);
        if (FX.instant()) {
          done();
          return;
        }
        box.classList.add("is-resolving");
        FX.later(state.timers, function () {
          box.classList.remove("is-resolving");
          box.classList.add(Number(outcome.payoff) > 0 ? "is-win" : "is-lose");
          done();
        }, 900);
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Keyboard                                                           */
  /* ------------------------------------------------------------------ */

  function onKeyDown(state, event) {
    if (state.destroyed || event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    var tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    /* Enter on a real control keeps its native activation. */
    if (
      event.key === "Enter" &&
      event.target &&
      typeof event.target.closest === "function" &&
      event.target.closest("a, button, summary")
    ) {
      return;
    }

    if (state.stage === "choice") {
      var round = state.game.rounds[state.roundIndex];
      var index = parseInt(event.key, 10) - 1;
      if (index >= 0 && index < (round.options || []).length) {
        event.preventDefault();
        onPick(state, round.options[index].id);
        return;
      }
      if (event.key === "Enter" && state.selected) {
        event.preventDefault();
        lockChoice(state);
      }
      return;
    }

    if (event.key === "Enter" && state.stage === "scene") {
      event.preventDefault();
      startRound(state, 0);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  function clearTimers(state) {
    (state.timers || []).forEach(function (timer) {
      if (timer && typeof timer.cancel === "function") {
        timer.cancel();
        return;
      }
      root.clearTimeout(timer);
      root.clearInterval(timer);
    });
    state.timers = [];
  }

  function maxPayoffOf(game) {
    var max = 0;
    (game.rounds || []).forEach(function (round) {
      (round.options || []).forEach(function (option) {
        (option.lottery || []).forEach(function (part) {
          if (Number(part.x) > max) max = Number(part.x);
        });
      });
    });
    return max;
  }

  function mount(host, game) {
    stop();
    if (!host || !game) return null;

    var store = root.GameStore;
    var state = {
      host: host,
      game: game,
      seed: root.RNG.makeSeed(),
      /* Caps brought to this deal: the wallet without its own old result. */
      wallet: store && typeof store.walletExcept === "function"
        ? store.walletExcept(game.id)
        : (CONFIG.wallet && CONFIG.wallet.start) || 100,
      committed: false,
      choices: {},
      draws: {},
      ctx: {},
      roundIndex: 0,
      stage: "scene",
      selected: null,
      locked: false,
      destroyed: false,
      timers: [],
      maxPayoff: maxPayoffOf(game)
    };
    /* A deal you can lose caps in (game.stake) needs that many caps: a
       broke Courier is spotted the difference, so the wallet never goes
       below 0 and {wallet} is the same w the logic uses. */
    var stake = Number(game.stake) || 0;
    state.spotted = Math.max(0, stake - state.wallet);
    state.wallet += state.spotted;
    var logic = logicFor(game);
    if (logic && typeof logic.init === "function") {
      state.ctx = logic.init(roundRng(state, null, "init"), game, { wallet: state.wallet }) || {};
    }
    /* A replay sets the deal's old caps aside, so the pill shows {wallet}. */
    if (store && typeof store.beginRun === "function") {
      store.beginRun(game.id);
      if (state.spotted) store.runCaps("stake", state.spotted, { delay: 900 });
    }
    current = state;

    clear(host);
    buildShell(state);
    buildSteps(state);
    showScene(state);
    return state;
  }

  function stop() {
    if (!current) return;
    var state = current;
    state.destroyed = true;
    clearTimers(state);
    if (!state.committed && root.GameStore && typeof root.GameStore.cancelRun === "function") {
      root.GameStore.cancelRun();
    }
    if (state.keyHandler) document.removeEventListener("keydown", state.keyHandler);
    if (state.host) clear(state.host);
    current = null;
  }

  root.Engine = {
    mount: mount,
    stop: stop,
    props: PROPS,
    helpers: {
      el: el,
      clear: clear,
      caps: caps,
      intText: intText,
      perkOf: perkOf,
      perkCard: perkCard
    },
    get current() {
      return current;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
