/*
 * figures.js — shared inline SVG figures for the reveal screens.
 *
 * Classic script (no modules, no fetch, no build step): works from file://.
 *
 * Exposes:
 *   window.Figures.weightingSVG()  -> slide 13 probability weighting curve
 *
 * The weighting curve is slide 13's w(p) = p^g / (p^g + (1-p)^g)^(1/g) with
 * g = 0.61, against the dashed 45-degree line w(p) = p, in Pip-Boy green.
 */
(function () {
  "use strict";

  var GREEN = "#12FF12";
  var GREEN_SOFT = "#8CFF8C";
  var GREEN_DIM = "#0B7A0B";

  var uid = 0; // makes clipPath/title ids unique per call

  function px(value) {
    // Keep the markup readable and stable: at most two decimals.
    return String(Math.round(value * 100) / 100);
  }

  var GAMMA = 0.61;

  function weight(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    var a = Math.pow(p, GAMMA);
    return a / Math.pow(a + Math.pow(1 - p, GAMMA), 1 / GAMMA);
  }

  function weightingSVG() {
    uid += 1;
    var titleId = "w-title-" + uid;
    var x0 = 48;
    var y0 = 262;
    var size = 240;
    function WX(p) {
      return px(x0 + size * p);
    }
    function WY(w) {
      return px(y0 - size * w);
    }
    var aria =
      "Probability weighting curve w(p) with gamma 0.61: it lies above the " +
      "diagonal for small probabilities and below it for large ones";

    var points = [];
    for (var i = 0; i <= 100; i += 1) {
      var p = i / 100;
      points.push((i ? "L " : "M ") + WX(p) + " " + WY(weight(p)));
    }

    var out = [];
    out.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 300" role="img" ' +
        'aria-labelledby="' + titleId + '">'
    );
    out.push('<title id="' + titleId + '">' + aria + "</title>");
    out.push('<g fill="none" stroke="' + GREEN_DIM + '" stroke-width="1.4">');
    out.push('<rect x="' + x0 + '" y="' + WY(1) + '" width="' + size + '" height="' + size + '"/>');
    out.push(
      '<line x1="' + WX(0) + '" y1="' + WY(0) + '" x2="' + WX(1) + '" y2="' + WY(1) +
        '" stroke-dasharray="5 4"/>'
    );
    out.push("</g>");
    out.push(
      '<path d="' + points.join(" ") + '" fill="none" stroke="' + GREEN +
        '" stroke-width="3" stroke-linejoin="round"/>'
    );
    out.push('<g font-family="monospace" font-size="13" fill="' + GREEN_SOFT + '">');
    out.push('<text x="' + WX(0.5) + '" y="292" text-anchor="middle">p</text>');
    out.push('<text x="16" y="' + WY(0.5) + '" text-anchor="middle">w(p)</text>');
    out.push('<text x="' + WX(0) + '" y="280" text-anchor="middle">0</text>');
    out.push('<text x="' + WX(1) + '" y="280" text-anchor="middle">1</text>');
    /* Labels sit in the empty corners so they never cross the curve. */
    out.push('<text x="' + WX(0.04) + '" y="' + WY(0.9) + '">small p: overweighted</text>');
    out.push(
      '<text x="' + WX(0.96) + '" y="' + WY(0.06) + '" text-anchor="end">large p: underweighted</text>'
    );
    out.push("</g>");
    out.push("</svg>");
    return out.join("\n");
  }

  window.Figures = window.Figures || {};
  window.Figures.weightingSVG = weightingSVG;
  window.Figures.weight = weight;
})();
