/*
 * config.js — the single place for anything a teammate may want to change.
 *
 * Loaded as a classic script (no modules, no build step) by index.html,
 * deck.html and (from Phase 2) play.html. Works from file:// and from
 * GitHub Pages under /<repo>/ because every path below is relative.
 */
window.CONFIG = {
  /* Used by the QR code on the last deck slide and by the start screen.
     PLACEHOLDER until the GitHub user/repo is confirmed. Ask before changing. */
  siteUrl: "https://example.github.io/paradoxes-of-choices/",

  /* Strings shared by the start screen and the title slide. */
  title: "Paradoxes of Choices under Uncertainty",
  subtitle: "Microeconomic analysis",
  authors: [
    "Gedas Beržinskas",
    "Adrijus Skuodas",
    "Jokūbas Žitkevičius"
  ],
  supervisor: "Assoc. Prof. Dmitrij Celov",

  /* The preamble's user macros (slides.tex L44). Passed to KaTeX as a copy
     on every render because KaTeX mutates the object on \gdef. Only \X is
     user-defined; everything else the deck uses is native to KaTeX 0.16.11. */
  katexMacros: {
    "\\X": "\\mathcal{X}"
  },

  /* Every image is referred to by key, never by path. Phase 1 needs the
     university logo; the game sprites are registered in Phase 2 and listed
     in ASSETS.md. */
  assets: {
    ui_mif: {
      file: "assets/ui/mif.png",
      alt: "Vilnius University Faculty of Mathematics and Informatics",
      kind: "ui",
      w: 244,
      h: 244
    }
  },

  /* Game text, numbers and lotteries. Filled in Phase 2; the Try-it slides
     already link to play.html#<id> so the routes stay stable. */
  games: {}
};
