/*
 * engine.js — the reusable, data-driven game stage machine.
 *
 * One game = one entry in CONFIG.games. The engine renders:
 *   scene → choice → lock → resolve → theory checkpoint → [interlude] → reveal
 * and leaves all game-specific verdict logic to the module named in
 * game.logic (window.AllaisGame).
 *
 * Phase 3 removed the ×1,000 simulation stage. After each seeded draw the
 * player sees the expected-utility requirement their choice imposes, rendered
 * with KaTeX, and no statistics.
 *
 * Works from file:// and under a GitHub Pages sub-path. Classic script, no
 * modules, no fetch.
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};
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
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function caps(value) {
    return intText(value) + " caps";
  }

  function pct(p) {
    var value = Math.round((Number(p) || 0) * 1000) / 10;
    return String(value).replace(/\.0$/, "") + "%";
  }

  function prefersReduced() {
    try {
      return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (err) {
      return false;
    }
  }

  function isFast() {
    try {
      return new URLSearchParams(root.location.search || "").get("fast") === "1";
    } catch (err) {
      return false;
    }
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

  /* A new stage starts at the top of the game, otherwise a Continue clicked at
     the bottom of a long phone screen leaves the next heading off-screen. */
  function resetScroll(state) {
    try {
      if (root.scrollY > 0) {
        root.scrollTo({
          top: 0,
          behavior: prefersReduced() ? "auto" : "smooth"
        });
      }
    } catch (err) {
      try {
        root.scrollTo(0, 0);
      } catch (err2) {
        /* Non-fatal. */
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Maths                                                              */
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

  /* ------------------------------------------------------------------ */
  /* Lottery presentation                                               */
  /* ------------------------------------------------------------------ */

  function outcomeClass(value) {
    if (Number(value) === 0) return "lot-seg--zero";
    if (Number(value) === 2400) return "lot-seg--mid";
    if (Number(value) === 2500) return "lot-seg--high";
    return "lot-seg--other";
  }

  function lotteryBar(option) {
    var bar = el("span", "lot-bar");
    bar.setAttribute("aria-hidden", "true");
    (option.lottery || []).forEach(function (part) {
      var seg = el(
        "span",
        "lot-bar__seg " + outcomeClass(part.x) + (part.p < 0.06 ? " is-thin" : "")
      );
      seg.style.width = Number(part.p) * 100 + "%";
      if (part.p >= 0.18) {
        seg.appendChild(el("span", "lot-bar__p", pct(part.p)));
      }
      bar.appendChild(seg);
    });
    return bar;
  }

  function lotteryList(option) {
    var list = el("span", "lot-list");
    (option.lottery || []).forEach(function (part) {
      var row = el("span", "lot-list__row");
      row.appendChild(el("span", "lot-list__p", pct(part.p)));
      row.appendChild(el("span", "lot-list__arrow", "→"));
      row.appendChild(el("span", "lot-list__x", caps(part.x)));
      list.appendChild(row);
    });
    return list;
  }

  function optionCard(state, option) {
    var button = el("button", "option");
    button.type = "button";
    button.setAttribute("data-option", option.id);
    button.setAttribute("aria-pressed", "false");

    var head = el("span", "option__head");
    var spriteWrap = el("span", "option__sprite");
    spriteWrap.appendChild(
      root.GameAssets.img(option.sprite, {
        className: "sprite sprite--option",
        alt: ""
      })
    );
    var titles = el("span", "option__titles");
    titles.appendChild(el("span", "option__id", option.id));
    titles.appendChild(el("span", "option__name", option.label));
    if (option.note) titles.appendChild(el("span", "option__note", option.note));
    head.appendChild(spriteWrap);
    head.appendChild(titles);

    button.appendChild(head);
    button.appendChild(lotteryBar(option));
    button.appendChild(lotteryList(option));

    button.addEventListener("click", function () {
      if (state.locked) return;
      if (state.selected === option.id) {
        lockChoice(state);
      } else {
        selectOption(state, option.id);
      }
    });
    return button;
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
    var title = el("span", "game__title", game.title);
    var seed = el("span", "game__seed", "seed " + state.seed);
    seed.title = "Add ?seed=" + state.seed + " to the URL to repeat these draws";
    bar.appendChild(title);
    bar.appendChild(seed);
    shell.appendChild(bar);

    var steps = el("ol", "game__steps");
    steps.setAttribute("aria-hidden", "true");
    shell.appendChild(steps);

    var stage = el("div", "game__stage");
    stage.setAttribute("role", "region");
    stage.setAttribute("aria-label", game.title + " game");
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
    var game = state.game;
    var steps = [{ key: "scene", label: "Scene" }];
    (game.rounds || []).forEach(function (round, index) {
      steps.push({
        key: "round-" + index,
        label: round.stepLabel || "Contract " + (index + 1)
      });
      if (
        game.interlude &&
        (game.interlude.afterRound === round.id ||
          (!game.interlude.afterRound && index === 0))
      ) {
        steps.push({ key: "interlude", label: game.interlude.stepLabel || "Interlude" });
      }
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
    state.stepKey = key;
    var index = -1;
    (state.steps || []).forEach(function (step, i) {
      if (step.key === key) index = i;
    });
    Array.prototype.forEach.call(
      state.stepsHost.querySelectorAll(".game__step"),
      function (node, i) {
        node.classList.toggle("is-current", i === index);
        node.classList.toggle("is-done", i < index);
        var num = node.querySelector(".game__step-num");
        if (num) num.textContent = i < index ? "✓" : String(i + 1);
      }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Scene                                                              */
  /* ------------------------------------------------------------------ */

  function showScene(state) {
    state.stage = "scene";
    state.locked = false;
    state.selected = null;
    clear(state.stageHost);
    setStep(state, "scene");

    var game = state.game;
    var scene = game.scene || {};
    var panel = el("section", "stage stage--scene");

    var figure = el("div", "scene-figure");
    figure.appendChild(
      root.GameAssets.img(scene.sprite, {
        className: "sprite sprite--hero",
        alt: scene.spriteAlt || ""
      })
    );
    panel.appendChild(figure);

    panel.appendChild(el("p", "eyebrow", scene.kicker || "A caravan contract"));
    var heading = el("h1", "stage__title", scene.heading || game.title);
    panel.appendChild(heading);

    var copy = el("div", "stage__copy");
    (scene.lines || []).forEach(function (line) {
      copy.appendChild(el("p", null, line));
    });
    panel.appendChild(copy);

    var actions = el("div", "stage__actions");
    var start = el("button", "btn btn--primary", scene.cta || "Continue");
    start.type = "button";
    start.addEventListener("click", function () {
      startRound(state, 0);
    });
    actions.appendChild(start);
    panel.appendChild(actions);

    panel.appendChild(
      el(
        "p",
        "hint",
        "Your choices lock when you confirm them — no take-backs."
      )
    );

    state.stageHost.appendChild(panel);
    setStatus(state, scene.heading || game.title);
    focusHeading(state);
    resetScroll(state);
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
    clear(state.stageHost);
    setStep(state, "round-" + state.roundIndex);

    var panel = el("section", "stage stage--choice");
    panel.setAttribute("data-round", round.id);

    if (round.kicker) panel.appendChild(el("p", "eyebrow", round.kicker));
    var heading = el("h2", "stage__title", round.prompt);
    panel.appendChild(heading);
    if (round.intro) panel.appendChild(el("p", "stage__lead", round.intro));

    var group = el("div", "options");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Choose one contract");
    (round.options || []).forEach(function (option) {
      group.appendChild(optionCard(state, option));
    });
    panel.appendChild(group);

    var lockbar = el("div", "lockbar");
    var hint = el("p", "hint");
    hint.innerHTML =
      "Tap an option, then lock it in. Keys <kbd>1</kbd>–<kbd>" +
      (round.options || []).length +
      "</kbd> select · <kbd>Enter</kbd> locks.";
    var lock = el("button", "btn btn--primary btn--lock", "Lock in your choice");
    lock.type = "button";
    lock.disabled = true;
    lock.addEventListener("click", function () {
      lockChoice(state);
    });
    lockbar.appendChild(hint);
    lockbar.appendChild(lock);
    panel.appendChild(lockbar);

    state.stageHost.appendChild(panel);
    state.lockButton = lock;

    setStatus(state, round.prompt);
    focusHeading(state);
    resetScroll(state);
  }

  function selectOption(state, optionId) {
    if (state.locked) return;
    state.selected = optionId;
    Array.prototype.forEach.call(
      state.stageHost.querySelectorAll(".option"),
      function (node) {
        var on = node.getAttribute("data-option") === optionId;
        node.classList.toggle("is-selected", on);
        node.setAttribute("aria-pressed", on ? "true" : "false");
      }
    );
    var round = state.game.rounds[state.roundIndex];
    var option = null;
    (round.options || []).forEach(function (item) {
      if (item.id === optionId) option = item;
    });
    if (state.lockButton) {
      state.lockButton.disabled = false;
      state.lockButton.textContent = "Lock in " + optionId;
    }
    setStatus(
      state,
      "Selected " + optionId + (option ? ", " + option.label : "") + ". Press Enter or lock in."
    );
  }

  function lockChoice(state) {
    if (state.locked || !state.selected) return;
    var round = state.game.rounds[state.roundIndex];
    var chosen = null;
    (round.options || []).forEach(function (option) {
      if (option.id === state.selected) chosen = option;
    });
    if (!chosen) return;

    state.locked = true;
    state.choices[round.id] = chosen.id;

    var stream = root.RNG.create(state.seed + "|" + round.id + "|draw");
    var payoff = root.RNG.sample(stream, chosen.lottery);
    state.draws[round.id] = { choice: chosen.id, payoff: payoff };

    renderResolve(state, round, chosen, payoff);
  }

  /* ------------------------------------------------------------------ */
  /* Resolve                                                            */
  /* ------------------------------------------------------------------ */

  function renderResolve(state, round, option, payoff) {
    state.stage = "resolve";
    clear(state.stageHost);
    setStep(state, "round-" + state.roundIndex);

    var panel = el("section", "stage stage--resolve");
    panel.appendChild(el("p", "eyebrow", "Choice locked — " + round.stepLabel));
    var heading = el(
      "h2",
      "stage__title",
      (state.game.resolve && state.game.resolve.heading) || "The lock gives way…"
    );
    panel.appendChild(heading);

    var stageBox = el("div", "resolve");
    var chest = el("div", "resolve__chest");
    var sprite = root.GameAssets.img(option.sprite, {
      className: "sprite sprite--resolve",
      alt: ""
    });
    chest.appendChild(sprite);
    chest.appendChild(el("span", "resolve__flash"));
    stageBox.appendChild(chest);

    var summary = el("div", "resolve__card");
    var badge = el("span", "badge badge--locked", "Locked in");
    summary.appendChild(badge);
    summary.appendChild(el("h3", "resolve__name", option.id + " — " + option.label));
    summary.appendChild(lotteryBar(option));
    summary.appendChild(lotteryList(option));
    stageBox.appendChild(summary);
    panel.appendChild(stageBox);

    var outcome = el("div", "resolve__outcome");
    outcome.hidden = true;
    var value = el("p", "outcome__value");
    value.appendChild(
      root.GameAssets.img("icon_caps", {
        className: "sprite sprite--caps",
        alt: ""
      })
    );
    value.appendChild(document.createTextNode(caps(payoff)));
    outcome.appendChild(value);
    var line = el(
      "p",
      "outcome__copy",
      resolveCopy(state, payoff, option)
    );
    outcome.appendChild(line);
    var next = el(
      "button",
      "btn btn--primary",
      "Read the theory →"
    );
    next.type = "button";
    next.addEventListener("click", function () {
      showCheckpoint(state);
    });
    outcome.appendChild(next);
    panel.appendChild(outcome);

    state.stageHost.appendChild(panel);

    var reduce = prefersReduced();
    if (!reduce) {
      chest.classList.add("is-resolving");
    }
    var delay = reduce ? 0 : 900;
    state.timers.push(
      root.setTimeout(function () {
        if (state.destroyed) return;
        chest.classList.remove("is-resolving");
        heading.textContent = "The lock is open";
        outcome.hidden = false;
        try {
          outcome.scrollIntoView({
            block: "nearest",
            behavior: reduce ? "auto" : "smooth"
          });
        } catch (err) {
          /* Older browsers: the user can scroll normally. */
        }
        setStatus(state, "Outcome: " + caps(payoff) + ". " + line.textContent);
        var button = outcome.querySelector(".btn");
        if (button) {
          try {
            button.focus({ preventScroll: true });
          } catch (err) {
            button.focus();
          }
        }
      }, delay)
    );

    setStatus(state, "Choice locked: " + option.id + ". Opening the lockbox.");
    focusHeading(state);
    resetScroll(state);
  }

  function resolveCopy(state, payoff, option) {
    var resolve = state.game.resolve || {};
    var worst = Infinity;
    (option.lottery || []).forEach(function (part) {
      if (Number(part.p) > 0 && Number(part.x) < worst) worst = Number(part.x);
    });
    var isWorst = worst !== Infinity && Number(payoff) === worst && worst === 0;
    var template = isWorst
      ? resolve.lose || "Nothing. The route took it all."
      : resolve.win || "You count {x}.";
    return String(template).replace("{x}", caps(payoff));
  }

  /* ------------------------------------------------------------------ */
  /* Theory checkpoint (replaces the Phase 2 simulation)                */
  /* ------------------------------------------------------------------ */

  function roundOption(round, id) {
    var found = null;
    (round.options || []).forEach(function (option) {
      if (option.id === id) found = option;
    });
    return found;
  }

  function checkpointFor(state) {
    var game = state.game;
    var round = game.rounds[state.roundIndex];
    var choice = state.choices[round.id];
    var logic = game.logic ? root[game.logic] : null;
    if (!logic && root.GAMES) logic = root.GAMES[game.id];
    if (!logic || typeof logic.checkpoint !== "function") {
      console.warn("[engine] no checkpoint logic for " + game.id);
      return null;
    }
    try {
      return logic.checkpoint(round, choice, game);
    } catch (err) {
      console.warn("[engine] checkpoint failed:", err);
      return null;
    }
  }

  function showCheckpoint(state) {
    state.stage = "checkpoint";
    clear(state.stageHost);
    setStep(state, "round-" + state.roundIndex);

    var game = state.game;
    var round = game.rounds[state.roundIndex];
    var data = checkpointFor(state);
    var chosenId = state.choices[round.id];
    var chosen = data && data.chosenOption
      ? data.chosenOption
      : roundOption(round, chosenId);
    var otherId = data ? data.other : null;
    var other = data && data.otherOption
      ? data.otherOption
      : roundOption(round, otherId);

    var panel = el("section", "stage stage--checkpoint");
    panel.setAttribute("data-round", round.id);
    panel.appendChild(
      el(
        "p",
        "eyebrow",
        ((game.checkpoint && game.checkpoint.kicker) || "Theory checkpoint") +
          " · " +
          (round.stepLabel || "Contract")
      )
    );
    var heading = el("h2", "stage__title", "What this choice implies");
    panel.appendChild(heading);

    if (chosen && other) {
      var pair = el("div", "checkpoint__pair");
      var chosenSide = el("div", "checkpoint__side is-chosen");
      chosenSide.appendChild(
        el(
          "span",
          "checkpoint__side-label",
          (game.checkpoint && game.checkpoint.chosenLabel) || "Your choice"
        )
      );
      chosenSide.appendChild(
        el("strong", "checkpoint__side-name", chosen.id + " — " + chosen.label)
      );
      pair.appendChild(chosenSide);
      pair.appendChild(el("span", "checkpoint__vs", "≻"));
      var otherSide = el("div", "checkpoint__side");
      otherSide.appendChild(
        el(
          "span",
          "checkpoint__side-label",
          (game.checkpoint && game.checkpoint.otherLabel) || "The alternative"
        )
      );
      otherSide.appendChild(
        el("strong", "checkpoint__side-name", other.id + " — " + other.label)
      );
      pair.appendChild(otherSide);
      panel.appendChild(pair);
    }

    if (data) {
      var formula = el("figure", "checkpoint__formula");
      var host = el("div", "formula__math");
      math(host, data.equivalenceTex, true);
      formula.appendChild(host);
      var caption = el("figcaption", "formula__caption");
      caption.appendChild(el("span", "slide-ref", "Slide 11"));
      caption.appendChild(el("span", null, "u(0) = 0"));
      formula.appendChild(caption);
      panel.appendChild(formula);

      panel.appendChild(
        el(
          "p",
          "checkpoint__sentence",
          "Under expected utility, this choice means " +
            data.inequalityPlain +
            "."
        )
      );
    } else {
      panel.appendChild(
        el(
          "p",
          "checkpoint__sentence",
          "Your choice is locked. The theory panel could not load the algebra; reload the page or check the browser console."
        )
      );
    }

    panel.appendChild(
      el(
        "p",
        "hint",
        "This is the requirement your choice imposes on any utility function. No simulation is run."
      )
    );

    var actions = el("div", "stage__actions");
    var next = el("button", "btn btn--primary", nextLabel(state));
    next.type = "button";
    next.addEventListener("click", function () {
      afterRound(state);
    });
    actions.appendChild(next);
    panel.appendChild(actions);

    state.stageHost.appendChild(panel);
    setStatus(
      state,
      "Theory checkpoint. " +
        (data
          ? data.chosen + " over " + data.other + " requires " + data.inequalityPlain + "."
          : "Algebra unavailable.")
    );
    focusHeading(state);
    resetScroll(state);
  }

  function nextLabel(state) {
    var game = state.game;
    var nextIndex = state.roundIndex + 1;
    if (nextIndex < (game.rounds || []).length) {
      if (
        game.interlude &&
        (game.interlude.afterRound === game.rounds[state.roundIndex].id ||
          (!game.interlude.afterRound && state.roundIndex === 0))
      ) {
        return game.interlude.cta || "Continue";
      }
      return "Next contract →";
    }
    return "See what it all means →";
  }

  function afterRound(state) {
    var game = state.game;
    var round = game.rounds[state.roundIndex];
    var nextIndex = state.roundIndex + 1;
    if (
      game.interlude &&
      (game.interlude.afterRound === round.id ||
        (!game.interlude.afterRound && state.roundIndex === 0)) &&
      nextIndex < game.rounds.length
    ) {
      if (isFast()) {
        startRound(state, nextIndex);
        return;
      }
      showInterlude(state);
      return;
    }
    if (nextIndex < game.rounds.length) {
      startRound(state, nextIndex);
      return;
    }
    showReveal(state);
  }

  /* ------------------------------------------------------------------ */
  /* Interlude                                                          */
  /* ------------------------------------------------------------------ */

  function showInterlude(state) {
    state.stage = "interlude";
    state.locked = false;
    clear(state.stageHost);
    setStep(state, "interlude");

    var interlude = state.game.interlude;
    var panel = el("section", "stage stage--interlude");
    panel.appendChild(el("p", "eyebrow", interlude.kicker || "Interlude"));
    var heading = el("h2", "stage__title", interlude.heading || "Weigh the cargo");
    panel.appendChild(heading);

    var figure = el("div", "interlude__figure");
    figure.appendChild(
      root.GameAssets.img(interlude.sprite, {
        className: "sprite sprite--hero",
        alt: interlude.spriteAlt || ""
      })
    );
    panel.appendChild(figure);

    var copy = el("div", "stage__copy");
    (interlude.lines || []).forEach(function (line) {
      copy.appendChild(el("p", null, line));
    });
    panel.appendChild(copy);

    var seconds = isFast() ? 0 : Number(interlude.seconds) || 20;
    var clock = el("div", "countdown");
    var number = el("span", "countdown__num", String(seconds));
    var unit = el("span", "countdown__unit", seconds === 1 ? "second" : "seconds");
    clock.appendChild(number);
    clock.appendChild(unit);
    var track = el("div", "countdown__track");
    var fill = el("div", "countdown__fill");
    fill.style.width = "100%";
    track.appendChild(fill);
    clock.appendChild(track);
    panel.appendChild(clock);

    var actions = el("div", "stage__actions");
    var cont = el(
      "button",
      "btn btn--primary",
      interlude.cta || "Continue to the next contract"
    );
    cont.type = "button";
    cont.addEventListener("click", function () {
      clearTimers(state);
      startRound(state, state.roundIndex + 1);
    });
    actions.appendChild(cont);
    panel.appendChild(actions);
    panel.appendChild(
      el(
        "p",
        "hint",
        seconds === 0
          ? "Demo mode (?fast=1): the interlude is skipped."
          : "The countdown is for atmosphere; you can continue at any time."
      )
    );

    state.stageHost.appendChild(panel);

    if (seconds > 0) {
      var remaining = seconds;
      var total = seconds;
      state.timers.push(
        root.setInterval(function () {
          if (state.destroyed) return;
          remaining -= 1;
          if (remaining < 0) remaining = 0;
          number.textContent = String(remaining);
          unit.textContent = remaining === 1 ? "second" : "seconds";
          fill.style.width = (remaining / total) * 100 + "%";
          if (remaining === 0) {
            clearTimers(state);
            number.textContent = "0";
            setStatus(state, "Cargo weighed. Continue when you are ready.");
          }
        }, 1000)
      );
      setStatus(
        state,
        (interlude.heading || "Interlude") + ". " + seconds + " second countdown."
      );
    } else {
      setStatus(state, "Interlude skipped in demo mode.");
    }
    focusHeading(state);
    resetScroll(state);
  }

  /* ------------------------------------------------------------------ */
  /* Reveal                                                             */
  /* ------------------------------------------------------------------ */

  function showReveal(state) {
    state.stage = "reveal";
    clear(state.stageHost);
    setStep(state, "reveal");

    var game = state.game;
    var verdict = computeVerdict(state);

    if (root.GameStore && typeof root.GameStore.setResult === "function") {
      root.GameStore.setResult(game.id, {
        pattern: verdict ? verdict.pattern : null,
        choices: state.choices,
        consistent: verdict ? verdict.consistent : null,
        verdictLabel: verdict ? verdict.verdictLabel : null,
        algebraTex: verdict ? verdict.algebraTex : null,
        seed: state.seed,
        slideRefs: game.slideRefs || []
      });
    }

    var panel = el("section", "stage stage--reveal");
    panel.appendChild(el("p", "eyebrow", "Both contracts locked · the reveal"));
    var heading = el("h1", "stage__title", (game.reveal && game.reveal.name) || game.paradox);
    panel.appendChild(heading);
    if (game.reveal && game.reveal.kicker) {
      panel.appendChild(el("p", "reveal__kicker", game.reveal.kicker));
    }

    var intro = el("div", "reveal__intro");
    var paragraphs = (game.reveal && game.reveal.paragraphs) || [];
    if (!paragraphs.length && game.reveal && game.reveal.explanation) {
      paragraphs = [game.reveal.explanation];
    }
    paragraphs.forEach(function (text) {
      intro.appendChild(el("p", null, text));
    });
    panel.appendChild(intro);

    var formulas = (game.reveal && game.reveal.formulas) || [];
    if (
      !formulas.length &&
      game.reveal &&
      game.reveal.formulasTex &&
      game.reveal.formulasTex.length
    ) {
      formulas = game.reveal.formulasTex.map(function (tex) {
        return {
          tex: tex,
          ref: (game.slideRefs && game.slideRefs[0]) || null
        };
      });
    }
    if (verdict) {
      formulas = formulas.filter(function (formula) {
        if (formula.when === "inconsistent" && verdict.consistent) return false;
        if (formula.when === "consistent" && !verdict.consistent) return false;
        return true;
      });
    }
    if (formulas.length) {
      var formulaGrid = el("div", "formula-grid");
      formulas.forEach(function (formula) {
        var figure = el("figure", "formula");
        var host = el("div", "formula__math");
        math(host, formula.tex, true);
        figure.appendChild(host);
        var caption = el("figcaption", "formula__caption");
        if (formula.ref) {
          caption.appendChild(el("span", "slide-ref", "Slide " + formula.ref));
        }
        if (formula.note) caption.appendChild(el("span", null, formula.note));
        figure.appendChild(caption);
        formulaGrid.appendChild(figure);
      });
      panel.appendChild(formulaGrid);
    }

    panel.appendChild(verdictPanel(verdict));

    if (game.reveal && game.reveal.benchmarkNote) {
      panel.appendChild(
        el("p", "reveal__benchmark", game.reveal.benchmarkNote)
      );
    }

    if (game.reveal && game.reveal.showTriangle && root.Figures) {
      var details = el("details", "triangle");
      details.appendChild(el("summary", "triangle__summary", "The probability triangle (Slide 12)"));
      var triangleHost = el("div", "triangle__host");
      try {
        triangleHost.innerHTML = root.Figures.triangleSVG();
      } catch (err) {
        console.warn("[engine] could not draw the triangle:", err);
      }
      details.appendChild(triangleHost);
      if (game.reveal.triangleCaption) {
        details.appendChild(el("p", "triangle__caption", game.reveal.triangleCaption));
      }
      panel.appendChild(details);
    }

    var actions = el("div", "stage__actions stage__actions--reveal");
    var report = el("a", "btn btn--primary", "See your Report Card");
    report.href = "#report";
    var hub = el("a", "btn btn--ghost", "Back to entry screen");
    hub.href = "index.html";
    actions.appendChild(report);
    actions.appendChild(hub);
    panel.appendChild(actions);

    if (game.reveal && game.reveal.footnote) {
      panel.appendChild(el("p", "reveal__footnote", game.reveal.footnote));
    }

    state.stageHost.appendChild(panel);
    setStatus(
      state,
      "Reveal: " + ((game.reveal && game.reveal.name) || game.paradox) + ". " +
        (verdict ? verdict.verdictLabel : "")
    );
    focusHeading(state);
    resetScroll(state);
  }

  function computeVerdict(state) {
    var game = state.game;
    var logic = game.logic ? root[game.logic] : null;
    if (!logic && root.GAMES) logic = root.GAMES[game.id];
    if (!logic || typeof logic.verdict !== "function") {
      console.warn("[engine] no verdict logic for " + game.id);
      return null;
    }
    try {
      return logic.verdict(state.choices, game);
    } catch (err) {
      console.warn("[engine] verdict failed:", err);
      return null;
    }
  }

  function verdictPanel(verdict) {
    var panel = el("section", "verdict-panel");
    panel.setAttribute("aria-labelledby", "verdict-title");

    var head = el("header", "verdict-panel__head");
    head.appendChild(el("p", "eyebrow", "You vs. expected utility"));
    var title = el("h2", "verdict-panel__title", verdict
      ? verdict.verdictTitle
      : "Verdict unavailable");
    title.id = "verdict-title";
    head.appendChild(title);
    if (verdict) {
      var pattern = el("p", "verdict-panel__pattern");
      pattern.appendChild(el("span", "badge", "Pattern " + verdict.pattern));
      pattern.appendChild(
        el(
          "span",
          "verdict-panel__choice",
          "Round 1: " + verdict.choices.r1 + " · Round 2: " + verdict.choices.r2
        )
      );
      head.appendChild(pattern);
    }
    panel.appendChild(head);

    if (!verdict) {
      panel.appendChild(
        el(
          "p",
          "verdict-panel__copy",
          "The choice pattern was recorded, but the verdict module did not load. Reload the page or check the browser console."
        )
      );
      return panel;
    }

    var verdictClass = verdict.consistent ? "is-consistent" : "is-inconsistent";
    panel.classList.add(verdictClass);

    var ineq = el("div", "verdict-panel__ineq");
    [verdict.round1, verdict.round2].forEach(function (side) {
      if (!side) return;
      var row = el("div", "ineq-row");
      row.appendChild(
        el(
          "div",
          "ineq-row__premise",
          side.chosen + " ≻ " + side.other + " implies"
        )
      );
      var mathHost = el("div", "ineq-row__math");
      math(mathHost, side.inequalityTex, true);
      row.appendChild(mathHost);
      ineq.appendChild(row);
    });
    panel.appendChild(ineq);

    var algebra = el("div", "verdict-panel__algebra");
    math(algebra, verdict.algebraTex, true);
    panel.appendChild(algebra);

    panel.appendChild(el("p", "verdict-panel__copy", verdict.plainExplanation));
    if (verdict.utilityNote) {
      panel.appendChild(el("p", "verdict-panel__note", verdict.utilityNote));
    }

    var algebraWrap = el("details", "verdict-panel__details");
    algebraWrap.appendChild(
      el("summary", null, "How the two inequalities give the verdict")
    );
    var explain = el("div", "verdict-panel__algebra-explain");
    var chain = el("p", null, "Each choice is written as a comparison of expected utilities, with u(0) = 0. The two required inequalities point in opposite directions, so no utility function can satisfy both.");
    chain.hidden = verdict.consistent;
    explain.appendChild(chain);
    var same = el(
      "p",
      null,
      "Both choices reduce to the same inequality, so a single utility function can produce the pattern."
    );
    same.hidden = !verdict.consistent;
    explain.appendChild(same);
    algebraWrap.appendChild(explain);
    panel.appendChild(algebraWrap);

    return panel;
  }

  /* ------------------------------------------------------------------ */
  /* Keyboard                                                           */
  /* ------------------------------------------------------------------ */

  function onKeyDown(state, event) {
    if (state.destroyed) return;
    if (event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    var tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.target && event.target.isContentEditable) return;

    /* Enter on a real control must use its native activation. Otherwise a
       focused "← Hub" link would start or lock the game instead of leaving. */
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
        var option = round.options[index];
        if (state.selected === option.id) lockChoice(state);
        else selectOption(state, option.id);
        return;
      }
      if (event.key === "Enter" && state.selected) {
        event.preventDefault();
        lockChoice(state);
      }
      return;
    }

    if (event.key === "Enter") {
      var target = event.target;
      if (target && target.tagName === "BUTTON") return; /* let the button do it */
      if (state.stage === "scene") {
        event.preventDefault();
        startRound(state, 0);
      } else if (state.stage === "checkpoint") {
        event.preventDefault();
        afterRound(state);
      } else if (state.stage === "interlude") {
        event.preventDefault();
        clearTimers(state);
        startRound(state, state.roundIndex + 1);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  function clearTimers(state) {
    (state.timers || []).forEach(function (timer) {
      root.clearTimeout(timer);
      root.clearInterval(timer);
    });
    state.timers = [];
  }

  function mount(host, game) {
    stop();
    if (!host || !game) return null;

    var state = {
      host: host,
      game: game,
      seed: root.RNG.seedFromUrl(root.location.search) || root.RNG.makeSeed(),
      choices: {},
      draws: {},
      roundIndex: 0,
      stage: "scene",
      selected: null,
      locked: false,
      destroyed: false,
      timers: [],
      stepKey: "scene"
    };
    current = state;

    clear(host);
    buildShell(state);
    buildSteps(state);
    showScene(state);

    return {
      state: state,
      seed: state.seed,
      destroy: function () {
        stop();
      }
    };
  }

  function stop() {
    if (!current) return;
    var state = current;
    state.destroyed = true;
    clearTimers(state);
    if (state.keyHandler) {
      document.removeEventListener("keydown", state.keyHandler);
    }
    if (state.host) clear(state.host);
    current = null;
  }

  root.Engine = {
    mount: mount,
    stop: stop,
    get current() {
      return current;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
