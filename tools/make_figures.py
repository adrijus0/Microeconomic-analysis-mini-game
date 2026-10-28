#!/usr/bin/env python3
"""
make_figures.py — regenerate the two prospect-theory plots for the deck.

Source: Microeconomic_analysis__Copy_/slides.tex, frame 21 (L548-L568), two
pgfplots pictures, each 5.0 cm x 3.7 cm:

    left  : v(x) = x^0.88 (gains, blue) / -2.25(-x)^0.88 (losses, red),
            x in [-100, 100], y in [-140, 70], axis lines through the origin,
            no ticks, no frame.
    right : w(p) = p^0.61 / (p^0.61 + (1-p)^0.61)^(1/0.61), blue;
            dashed grey identity w(p) = p; x, y in [0, 1]; boxed axes;
            ticks every 0.2 with tiny labels.

Output (committed assets, loaded by <img> in the deck):
    docs/assets/figures/value-function.svg
    docs/assets/figures/probability-weighting.svg

Run from the repository root:   python3 tools/make_figures.py

Deterministic: no random data, no timestamps, stable SVG element ids
(svg.hashsalt). Text is converted to paths, so the SVGs carry no font or
image dependency and work offline / on file://.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # headless, no display needed

import matplotlib.pyplot as plt
import numpy as np

# --------------------------------------------------------------------------
# Geometry and palette (PLAN.md §4, preamble.md §4.2)
# --------------------------------------------------------------------------

CM = 1.0 / 2.54                      # cm -> inches
FIGSIZE = (5.0 * CM, 3.7 * CM)       # source: width=5.0cm height=3.7cm

BLUE = "#02487F"                     # VUMIF redefines xcolor blue to 2,72,127
RED = "#FF0000"                      # xcolor red, untouched
# The identity line is xcolor `gray` (100% grey = #808080), NOT gray!70.
# #A6A6A6 belongs only to the frame-12 triangle in docs/js/figures.js.
IDENTITY_GREY = "#808080"            # xcolor gray

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "assets" / "figures"

plt.rcParams.update({
    "svg.fonttype": "path",          # text becomes paths: no font dependency
    "svg.hashsalt": "paradoxes-deck",  # stable ids => byte-identical re-runs
    "mathtext.fontset": "cm",        # Computer Modern, matches KaTeX
    "font.family": "sans-serif",     # beamer prints titles/labels in text sans
    "font.size": 8.0,
    "axes.linewidth": 0.8,
    "lines.solid_capstyle": "round",
    "figure.facecolor": "none",
    "savefig.transparent": True,
})


# --------------------------------------------------------------------------
# The two figures
# --------------------------------------------------------------------------

def build_value_function():
    """pgfplots: axis lines=middle, xmin=-100 xmax=100 ymin=-140 ymax=70."""
    fig = plt.figure(figsize=FIGSIZE)
    # Leave room for the title (top) and the two end-placed axis labels.
    ax = fig.add_axes([0.145, 0.115, 0.815, 0.755])

    # Axis lines through the origin, no frame, no ticks, no arrowheads.
    ax.axhline(0.0, color="black", linewidth=0.8, zorder=1)
    ax.axvline(0.0, color="black", linewidth=0.8, zorder=1)

    x_gain = np.linspace(0.0, 100.0, 60)
    ax.plot(x_gain, x_gain ** 0.88, color=BLUE, linewidth=1.6, zorder=3)

    x_loss = np.linspace(-100.0, 0.0, 60)
    ax.plot(x_loss, -2.25 * (-x_loss) ** 0.88, color=RED, linewidth=1.6, zorder=3)

    ax.set_xlim(-100.0, 100.0)
    ax.set_ylim(-140.0, 70.0)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

    # pgfplots axis lines=middle: labels sit at the ends of the axes.
    ax.text(100.0, -5.0, r"$x$", fontsize=8, ha="right", va="top")
    ax.text(-18.0, 69.0, r"$v(x)$", fontsize=8, rotation=90,
            rotation_mode="anchor", ha="right", va="center", clip_on=False)

    fig.text(0.5, 0.985, "Value function", fontsize=8,
             ha="center", va="top")
    return fig


def build_probability_weighting():
    """pgfplots: boxed axes, x,y in [0,1], dashed identity, 120 samples."""
    fig = plt.figure(figsize=FIGSIZE)
    # Room for title, x label + ticks (bottom), y label (left).
    ax = fig.add_axes([0.165, 0.185, 0.800, 0.675])

    # Dashed grey identity w(p) = p, drawn first so the blue curve sits on top.
    ax.plot([0.0, 1.0], [0.0, 1.0], color=IDENTITY_GREY, linewidth=1.0,
            linestyle=(0, (3.5, 2.5)), zorder=2)

    gamma = 0.61
    p = np.linspace(0.0005, 0.9995, 120)
    p_g = p ** gamma
    w = p_g / (p_g + (1.0 - p) ** gamma) ** (1.0 / gamma)
    ax.plot(p, w, color=BLUE, linewidth=1.6, zorder=3)

    ax.set_xlim(0.0, 1.0)
    ax.set_ylim(0.0, 1.0)
    ticks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
    ax.set_xticks(ticks)
    ax.set_yticks(ticks)
    ax.set_xticklabels([f"{t:g}" for t in ticks], fontsize=6)
    ax.set_yticklabels([f"{t:g}" for t in ticks], fontsize=6)
    ax.tick_params(axis="both", which="major", direction="out",
                   length=2.0, width=0.6, pad=2.0)
    for spine in ax.spines.values():
        spine.set_visible(True)
        spine.set_color("black")
        spine.set_linewidth(0.8)

    ax.set_xlabel(r"$p$", fontsize=8, labelpad=1.5)
    ax.set_ylabel(r"$w(p)$", fontsize=8, labelpad=1.5)
    ax.set_title("Probability weighting", fontsize=8, pad=3.0)
    return fig


# --------------------------------------------------------------------------
# Writing
# --------------------------------------------------------------------------

def normalise_svg(text: str) -> str:
    """Exact palette casing, and assert the wrong greys never appear."""
    for lower, exact in (("#02487f", BLUE), ("#ff0000", RED)):
        text = text.replace(lower, exact)
    if "#595959" in text.lower():
        raise SystemExit("make_figures: #595959 leaked into the SVG palette")
    if "#a6a6a6" in text.lower():
        raise SystemExit(
            "make_figures: #A6A6A6 belongs to the triangle, not these plots"
        )
    return text


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    figures = (
        ("value-function.svg", build_value_function),
        ("probability-weighting.svg", build_probability_weighting),
    )
    for filename, builder in figures:
        fig = builder()
        path = OUT_DIR / filename
        # metadata={"Date": None} removes the <dc:date> timestamp.
        fig.savefig(path, format="svg", transparent=True,
                    metadata={"Date": None})
        plt.close(fig)
        path.write_text(normalise_svg(path.read_text(encoding="utf-8")),
                        encoding="utf-8")
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
