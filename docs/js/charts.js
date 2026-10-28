/*
 * charts.js — tiny canvas charts for the simulation stage.
 *
 * No chart library, no external request. Two drawings:
 *   Charts.histogram(canvas, samples, opts)  frequency of each payoff
 *   Charts.running(canvas, samples, opts)    cumulative mean after each draw
 *
 * Every canvas also gets an aria-label that carries the same facts in text,
 * so nothing depends on seeing the chart. Colours are supplied by the caller
 * from CSS variables; the bars also carry value labels and counts.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.Charts = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var DPR = (typeof window !== "undefined" && window.devicePixelRatio) || 1;

  function cssVar(name, fallback) {
    try {
      var value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return value || fallback;
    } catch (err) {
      return fallback;
    }
  }

  function setup(canvas) {
    if (!canvas || !canvas.getContext) return null;
    var rect = canvas.getBoundingClientRect();
    var width = Math.max(220, Math.round(rect.width || canvas.clientWidth || 320));
    var height = Math.max(80, Math.round(rect.height || canvas.clientHeight || 150));
    var dpr = Math.min(3, DPR || 1);
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx: ctx, w: width, h: height };
  }

  function fmt(n, digits) {
    var value = Number(n) || 0;
    var text = value.toFixed(digits == null ? 1 : digits);
    return text.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  }

  function compact(n) {
    var value = Number(n) || 0;
    if (Math.abs(value) >= 1000) {
      var k = value / 1000;
      return (Math.round(k * 10) / 10).toString().replace(/\.0$/, "") + "k";
    }
    return String(Math.round(value));
  }

  function counts(samples) {
    var map = Object.create(null);
    var values = [];
    for (var i = 0; i < samples.length; i += 1) {
      var key = String(samples[i]);
      if (!(key in map)) {
        map[key] = 0;
        values.push(Number(samples[i]));
      }
      map[key] += 1;
    }
    values.sort(function (a, b) {
      return a - b;
    });
    return values.map(function (value) {
      return { value: value, count: map[String(value)] };
    });
  }

  function histogram(canvas, samples, opts) {
    opts = opts || {};
    var frame = setup(canvas);
    if (!frame || !samples || !samples.length) return;
    var ctx = frame.ctx;
    var w = frame.w;
    var h = frame.h;
    var color = opts.color || cssVar("--game-accent", "#e0a64b");
    var ink = opts.ink || cssVar("--game-ink", "#f4ead8");
    var muted = opts.muted || cssVar("--game-muted", "#b7a98f");
    var line = opts.line || cssVar("--game-line", "rgba(244,234,216,.2)");

    var bins = counts(samples);
    var total = samples.length;
    var maxCount = 1;
    bins.forEach(function (bin) {
      if (bin.count > maxCount) maxCount = bin.count;
    });

    var pad = { l: 8, r: 8, t: 22, b: 27 };
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;
    var slot = plotW / bins.length;
    var barW = Math.max(18, Math.min(72, slot * 0.62));

    ctx.save();
    ctx.font =
      "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    /* Baseline */
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t + plotH + 0.5);
    ctx.lineTo(w - pad.r, pad.t + plotH + 0.5);
    ctx.stroke();

    bins.forEach(function (bin, i) {
      var cx = pad.l + slot * (i + 0.5);
      var barH = Math.max(2, (bin.count / maxCount) * plotH);
      var x = cx - barW / 2;
      var y = pad.t + plotH - barH;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.88;
      ctx.fillRect(x, y, barW, barH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, barW - 1, barH - 1);

      /* Count above the bar, payoff below it. Both are text, not colour. */
      var pct = Math.round((bin.count / total) * 100);
      ctx.fillStyle = ink;
      ctx.fillText(pct + "%", cx, Math.max(10, y - 9));
      ctx.fillStyle = muted;
      ctx.fillText(compact(bin.value), cx, pad.t + plotH + 14);
    });
    ctx.restore();

    canvas.setAttribute(
      "aria-label",
      (opts.label || "Histogram") +
        ": " +
        bins
          .map(function (bin) {
            return (
              bin.value +
              (opts.unit ? " " + opts.unit : "") +
              " " +
              bin.count +
              " times"
            );
          })
          .join("; ") +
        "."
    );
  }

  function running(canvas, samples, opts) {
    opts = opts || {};
    var frame = setup(canvas);
    if (!frame || !samples || !samples.length) return;
    var ctx = frame.ctx;
    var w = frame.w;
    var h = frame.h;
    var color = opts.color || cssVar("--game-accent", "#e0a64b");
    var ink = opts.ink || cssVar("--game-ink", "#f4ead8");
    var line = opts.line || cssVar("--game-line", "rgba(244,234,216,.2)");

    var means = [];
    var sum = 0;
    var lo = Infinity;
    var hi = -Infinity;
    for (var i = 0; i < samples.length; i += 1) {
      sum += samples[i];
      var m = sum / (i + 1);
      means.push(m);
      if (m < lo) lo = m;
      if (m > hi) hi = m;
    }
    if (!isFinite(lo) || !isFinite(hi)) return;
    if (hi - lo < 1e-9) {
      lo -= 1;
      hi += 1;
    }
    var span = hi - lo;
    lo -= span * 0.12;
    hi += span * 0.12;

    var pad = { l: 8, r: 44, t: 10, b: 18 };
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;
    function X(index) {
      return pad.l + (plotW * index) / Math.max(1, means.length - 1);
    }
    function Y(value) {
      return pad.t + plotH - ((value - lo) / (hi - lo)) * plotH;
    }

    ctx.save();
    /* Dashed line at the final mean. */
    var finalMean = means[means.length - 1];
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, Y(finalMean));
    ctx.lineTo(w - pad.r + 4, Y(finalMean));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (var j = 0; j < means.length; j += 1) {
      if (j === 0) ctx.moveTo(X(j), Y(means[j]));
      else ctx.lineTo(X(j), Y(means[j]));
    }
    ctx.stroke();

    ctx.fillStyle = ink;
    ctx.font =
      "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(compact(finalMean), w - 2, Y(finalMean));
    ctx.restore();

    canvas.setAttribute(
      "aria-label",
      (opts.label || "Running average") +
        " over " +
        samples.length +
        " draws, ending at " +
        fmt(finalMean, 0) +
        (opts.unit ? " " + opts.unit : "") +
        "."
    );
  }

  function stats(samples, worstValue) {
    var n = samples.length || 1;
    var sum = 0;
    var worst = 0;
    for (var i = 0; i < samples.length; i += 1) {
      sum += samples[i];
      if (samples[i] === worstValue) worst += 1;
    }
    var mean = sum / n;
    var variance = 0;
    for (var j = 0; j < samples.length; j += 1) {
      var d = samples[j] - mean;
      variance += d * d;
    }
    return {
      n: samples.length,
      mean: mean,
      sd: Math.sqrt(variance / n),
      pWorst: worst / n,
      worstCount: worst
    };
  }

  return {
    histogram: histogram,
    running: running,
    stats: stats,
    fmt: fmt
  };
});
