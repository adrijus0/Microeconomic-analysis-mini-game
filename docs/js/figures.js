/*
 * figures.js — shared inline SVG figures for the single-game site.
 *
 * Classic script (no modules, no fetch, no build step): works from file://.
 *
 * Exposes:
 *   window.Figures.triangleSVG()  -> self-contained <svg>…</svg> string
 *
 * The probability triangle is the TikZ picture of frame 12
 * (slides.tex L310-L328) redrawn with the exact source coordinates:
 *   A (0, 0), B (0.01, 0.33), C (0.67, 0.33), D (0.66, 0)
 *   seven dashed EU-indifference lines (0,c) -- (1,c+2.5),
 *   c in {-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8}, clipped to the triangle.
 *
 * Phase 3 re-colours the figure for the Pip-Boy CRT (monochrome green). The
 * two lottery pairs are still told apart by position, labels, line thickness
 * and solid-vs-dashed stroke, not colour alone.
 *
 * Geometry: origin (110, 440), 380 px per data unit, y flipped
 * (Y = 440 - 380*y), viewBox 0 0 540 480.
 */
(function () {
  "use strict";

  var ORIGIN_X = 110;
  var ORIGIN_Y = 440;
  var UNIT = 380; // px per probability unit

  var GREEN = "#12FF12";
  var GREEN_SOFT = "#8CFF8C";
  var GREEN_DIM = "#0B7A0B";

  var uid = 0; // makes clipPath/title ids unique per call

  function px(value) {
    // Keep the markup readable and stable: at most two decimals.
    return String(Math.round(value * 100) / 100);
  }

  function X(x) {
    return px(ORIGIN_X + UNIT * x);
  }

  function Y(y) {
    return px(ORIGIN_Y - UNIT * y);
  }

  var INDIFFERENCE_INTERCEPTS = [-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8];

  function triangleSVG() {
    uid += 1;
    var clipId = "tri-clip-" + uid;
    var titleId = "tri-title-" + uid;
    var aria =
      "Probability triangle with lotteries A, B, C and D: the segments AB and " +
      "DC are parallel, A and B sit on the left, C and D on the right, and " +
      "seven parallel dashed indifference lines cross the triangle";

    var out = [];
    out.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 480" ' +
        'role="img" aria-label="' + aria + '" aria-labelledby="' + titleId + '">'
    );
    out.push("<title id=\"" + titleId + "\">" + aria + "</title>");

    // Clip to the triangle (0,0)-(1,0)-(0,1).
    out.push("<defs>");
    out.push(
      '<clipPath id="' + clipId + '">' +
        '<path d="M ' + X(0) + " " + Y(0) +
        " L " + X(1) + " " + Y(0) +
        " L " + X(0) + " " + Y(1) + ' Z"/></clipPath>'
    );
    out.push("</defs>");

    // Seven dashed EU-indifference lines, clipped to the triangle.
    out.push(
      '<g clip-path="url(#' + clipId + ')" fill="none" stroke="' + GREEN_DIM +
        '" stroke-width="1.1" stroke-dasharray="5 4" opacity="0.9">'
    );
    for (var i = 0; i < INDIFFERENCE_INTERCEPTS.length; i += 1) {
      var c = INDIFFERENCE_INTERCEPTS[i];
      out.push(
        '<line x1="' + X(0) + '" y1="' + Y(c) +
          '" x2="' + X(1) + '" y2="' + Y(c + 2.5) + '"/>'
      );
    }
    out.push("</g>");

    // Axes (with arrowheads drawn as paths, so no marker ids are needed),
    // and the hypotenuse p_2400 = 0 from (1,0) to (0,1).
    out.push('<g fill="none" stroke="' + GREEN_DIM + '" stroke-width="1.4">');
    out.push(
      '<line x1="' + X(0) + '" y1="' + Y(0) +
        '" x2="' + px(ORIGIN_X + UNIT * 1.06) + '" y2="' + Y(0) + '"/>'
    );
    out.push(
      '<line x1="' + X(0) + '" y1="' + Y(0) +
        '" x2="' + X(0) + '" y2="' + px(Y(0) - UNIT * 1.06) + '"/>'
    );
    out.push(
      '<line x1="' + X(1) + '" y1="' + Y(0) +
        '" x2="' + X(0) + '" y2="' + Y(1) + '"/>'
    );
    out.push("</g>");
    out.push(
      '<path d="M ' + px(ORIGIN_X + UNIT * 1.08) + " " + Y(0) +
        " l -12 -4 l 0 8 Z\" fill=\"" + GREEN_DIM + "\"/>"
    );
    out.push(
      '<path d="M ' + X(0) + " " + px(Y(0) - UNIT * 1.08) +
        " l -4 12 l 8 0 Z\" fill=\"" + GREEN_DIM + "\"/>"
    );

    // Thick lottery pairs: A-B is solid bright green, D-C is dashed soft green.
    out.push('<g stroke-linecap="round">');
    out.push(
      '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(0.01) + '" y2="' + Y(0.33) +
        '" stroke="' + GREEN + '" stroke-width="3.2"/>'
    );
    out.push(
      '<line x1="' + X(0.66) + '" y1="' + Y(0) + '" x2="' + X(0.67) + '" y2="' + Y(0.33) +
        '" stroke="' + GREEN_SOFT + '" stroke-width="3.2" stroke-dasharray="7 4"/>'
    );
    out.push("</g>");

    // Lotteries: A and B bright green, C and D soft green.
    out.push(
      '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="4.8" fill="' + GREEN + '"/>'
    );
    out.push(
      '<circle cx="' + X(0.01) + '" cy="' + Y(0.33) + '" r="4.8" fill="' + GREEN + '"/>'
    );
    out.push(
      '<circle cx="' + X(0.67) + '" cy="' + Y(0.33) + '" r="4.8" fill="' + GREEN_SOFT + '"/>'
    );
    out.push(
      '<circle cx="' + X(0.66) + '" cy="' + Y(0) + '" r="4.8" fill="' + GREEN_SOFT + '"/>'
    );

    // Labels: A sits at the origin; B is placed left of its point and C right
    // of its point, so the two pairs are told apart by position as well as
    // colour. D sits below its point (as in the TikZ source).
    out.push('<g font-family="monospace" font-size="19" fill="' + GREEN_SOFT + '">');
    out.push(
      '<text x="498" y="466" text-anchor="middle">' +
        '<tspan font-style="italic">p</tspan>' +
        '<tspan font-size="13" dy="4">0</tspan></text>'
    );
    out.push(
      '<text x="102" y="45" text-anchor="end" dominant-baseline="middle">' +
        '<tspan font-style="italic">p</tspan>' +
        '<tspan font-size="13" dy="4">2500</tspan></text>'
    );
    out.push(
      '<text x="104" y="448" text-anchor="end" dominant-baseline="hanging" ' +
        'font-family="sans-serif" font-size="18">2400 sure</text>'
    );
    out.push('<text x="119" y="432" font-style="italic">A</text>');
    out.push('<text x="104" y="311" text-anchor="end" font-style="italic">B</text>');
    out.push('<text x="374" y="311" font-style="italic">C</text>');
    out.push('<text x="361" y="464" text-anchor="middle" font-style="italic">D</text>');
    out.push("</g>");

    out.push("</svg>");
    return out.join("\n");
  }

  window.Figures = window.Figures || {};
  window.Figures.triangleSVG = triangleSVG;
})();
