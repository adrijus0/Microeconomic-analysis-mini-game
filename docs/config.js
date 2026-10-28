/*
 * config.js — the single place for anything a teammate may want to change.
 *
 * Loaded as a classic script (no modules, no build step) by index.html and
 * play.html. Works from file:// and from GitHub Pages under /<repo>/ because
 * every path below is relative.
 *
 * Phase 3: one game only. The Caravan Lockboxes (Allais / common consequence).
 * The Phase 1 deck is archived outside docs/ and is not shipped.
 */
window.CONFIG = {
  /* Kept for future deployment notes. PLACEHOLDER until the GitHub user/repo is
     confirmed. Ask before changing. Nothing on the shipped game reads it. */
  siteUrl: "https://example.github.io/paradoxes-of-choices/",

  /* Strings shared by the entry screen and the game shell. */
  title: "Paradoxes of Choices under Uncertainty",
  subtitle: "Microeconomic analysis",

  /* The preamble's user macros (slides.tex L44). Passed to KaTeX as a copy
     on every render because KaTeX mutates the object on \gdef. Only \X is
     user-defined; everything else the game uses is native to KaTeX 0.16.11. */
  katexMacros: {
    "\\X": "\\mathcal{X}"
  },

  /* The single-game terminal entry screen. No authors, supervisor or logo:
     this is a game terminal, not a title slide. The paradox name is withheld
     until both contracts are locked. */
  landing: {
    kicker: "Caravan termlink // online",
    title: "The Caravan Lockboxes",
    subtitle: "Paradoxes of Choices under Uncertainty",
    lead: "A caravan halt. Two sealed contracts. Choose first — the full pattern is revealed only after both are locked.",
    cta: "Enter the game",
    hint: "Two contracts · two seeded draws · offline",
    status: "ONE GAME · TWO CONTRACTS · NO SECOND CHANCES"
  },

  /* Every image is referred to by key, never by path. Registering a key here
     is enough for the engine to use it; swapping art means editing this entry
     (or replacing the file with the same name). Missing art never crashes. */
  assets: {
    hub_allais: {
      file: "assets/cards/hub_allais.png",
      alt: "A steel strongbox on a desert road, with a watchtower behind",
      kind: "card",
      w: 640,
      h: 360
    },
    allais_bg: {
      file: "assets/backgrounds/allais_bg.png",
      alt: "A caravan halt at dusk on a broken highway",
      kind: "background",
      w: 1280,
      h: 720
    },
    allais_chest_a: {
      file: "assets/sprites/allais/chest_a.png",
      alt: "A sealed steel strongbox",
      kind: "sprite",
      w: 32,
      h: 32
    },
    allais_chest_b: {
      file: "assets/sprites/allais/chest_b.png",
      alt: "A battered wooden crate with a faint glow in one seam",
      kind: "sprite",
      w: 32,
      h: 32
    },
    allais_chest_c: {
      file: "assets/sprites/allais/chest_c.png",
      alt: "A single canvas satchel with one strap",
      kind: "sprite",
      w: 32,
      h: 32
    },
    allais_chest_d: {
      file: "assets/sprites/allais/chest_d.png",
      alt: "A double-strapped satchel with two tags",
      kind: "sprite",
      w: 32,
      h: 32
    },
    allais_trader: {
      file: "assets/sprites/allais/trader.png",
      alt: "A caravan trader in a duster coat and headwrap",
      kind: "sprite",
      w: 32,
      h: 32
    },
    allais_raider: {
      file: "assets/sprites/allais/raider.png",
      alt: "A raider silhouette with a pipe rifle",
      kind: "sprite",
      w: 32,
      h: 32
    },
    icon_caps: {
      file: "assets/sprites/allais/icon_caps.png",
      alt: "A bottle-cap currency coin",
      kind: "sprite",
      w: 32,
      h: 32
    }
  },

  /* One game only. Thematic name first; the paradox name appears in the reveal. */
  gameOrder: ["allais"],

  /* Game text, numbers and lotteries. Every probability/payoff comes from
     slides.tex frames 10–16 and 22 (PLAN.md §5.2 A). Allais displays the
     slides' "2,400k gp" digits as caps at a deliberate ×1/1000 rescale. */
  games: {
    allais: {
      id: "allais",
      status: "playable",
      title: "The Caravan Lockboxes",
      tagline: "Sign one contract. The caravan pays in caps — if the route holds.",
      paradox: "Allais paradox",
      paradoxSub: "Common consequence · certainty effect",
      slideRefs: [10, 11, 12, 13, 14, 15, 16, 22],
      logic: "AllaisGame",
      card: "hub_allais",
      cardAlt: "A steel strongbox on a desert road",
      benchmark: { r1: 82, r2: 83, source: "Kahneman & Tversky (1979)" },
      scene: {
        background: "allais_bg",
        sprite: "allais_trader",
        spriteAlt: "A caravan trader in a duster coat",
        kicker: "The caravan halt",
        heading: "Two contracts, one road",
        lines: [
          "The trader has been waiting since noon. A dead highway stretches west, and the watchtower on the ridge has been quiet for too long.",
          "Two sealed contracts sit on the cargo crate. Both pay in caps. Both routes leave at dusk.",
          "The trader taps the first page. “Choose. The caravan does not wait for second thoughts.”"
        ],
        cta: "Look at the contracts"
      },
      rounds: [
        {
          id: "r1",
          stepLabel: "Contract 1",
          kicker: "Contract one",
          prompt: "Which contract do you sign?",
          intro: "The first page offers a clean handover or a faster road through raider country.",
          options: [
            {
              id: "A",
              label: "Sealed strongbox",
              sprite: "allais_chest_a",
              spriteAlt: "A sealed steel strongbox",
              note: "Handover at the next settlement.",
              lottery: [{ p: 1.0, x: 2400 }]
            },
            {
              id: "B",
              label: "Raider route",
              sprite: "allais_chest_b",
              spriteAlt: "A battered crate with a faint green glow",
              note: "Faster, but the pass is watched.",
              lottery: [
                { p: 0.33, x: 2500 },
                { p: 0.66, x: 2400 },
                { p: 0.01, x: 0 }
              ]
            }
          ]
        },
        {
          id: "r2",
          stepLabel: "Contract 2",
          kicker: "Contract two",
          prompt: "The second page. Which contract do you sign?",
          intro: "The cargo is lighter now. The trader has redrawn both routes in charcoal.",
          options: [
            {
              id: "C",
              label: "One trip",
              sprite: "allais_chest_c",
              spriteAlt: "A single canvas satchel",
              note: "One run through the pass.",
              lottery: [
                { p: 0.33, x: 2500 },
                { p: 0.67, x: 0 }
              ]
            },
            {
              id: "D",
              label: "Two trips",
              sprite: "allais_chest_d",
              spriteAlt: "A double-strapped satchel with two tags",
              note: "Two smaller runs, same window.",
              lottery: [
                { p: 0.34, x: 2400 },
                { p: 0.66, x: 0 }
              ]
            }
          ]
        }
      ],
      interlude: {
        afterRound: "r1",
        stepLabel: "Weigh",
        kicker: "Interlude",
        heading: "Weigh the cargo",
        lines: [
          "The trader hauls the scales off the tailgate and sets them in the dust. The manifest has to balance before the second page is signed.",
          "Caps go in the pan. The needle swings, settles, swings again. Nothing here changes the contracts — the caravan just needs the weight on paper."
        ],
        sprite: "allais_raider",
        spriteAlt: "A raider silhouette watching from the ridge",
        seconds: 20,
        cta: "Continue to the second contract"
      },
      resolve: {
        heading: "The lock gives way",
        win: "You count {x}.",
        lose: "Empty. The raiders got there first."
      },
      /* Per-round theory checkpoint: no simulation or statistical output.
         allais.js derives the inequality from the chosen lottery. */
      checkpoint: {
        stepLabel: "Theory check",
        kicker: "Theory checkpoint",
        chosenLabel: "Your choice",
        otherLabel: "The alternative",
        cta: "Read the theory"
      },
      reveal: {
        name: "Allais paradox",
        kicker: "Common consequence · certainty effect",
        paragraphs: [
          "You faced two pairs of lotteries that differ only by a common consequence: Round 1 attaches “2,400 caps with probability 0.66” to both A and B, and Round 2 replaces that same part with “nothing with probability 0.66” in both C and D.",
          "Expected utility says the common consequence cannot reverse the ranking, yet most people take the sure 2,400 in Round 1 and the 2,500 gamble in Round 2 — the certainty effect.",
          "The panel below checks whether a single utility function could produce your two choices, and shows the short algebra if it could not."
        ],
        /* `formulasTex` + `explanation` are the contract-level fields named in
           PLAN §5.4; `formulas` carries the per-formula Slide N mapping the
           engine renders. Keep both in sync when changing a formula. */
        formulasTex: [
          "\\begin{aligned} &A\\succ B\\\\ &\\iff u(2400) > 0.33\\,u(2500)+0.66\\,u(2400)\\\\ &\\iff 0.34\\,u(2400) > 0.33\\,u(2500) \\end{aligned}",
          "\\begin{aligned} C\\succ D &\\iff 0.33\\,u(2500) > 0.34\\,u(2400) \\end{aligned}",
          "\\begin{aligned} 0.34\\,u(2400) &> 0.33\\,u(2500)\\\\ &> 0.34\\,u(2400)\\qquad \\bot \\end{aligned}",
          "\\begin{aligned} V(A)&=943.2,\\quad V(B)=806.5,\\\\ V(C)&=326.7,\\quad V(D)=320.1 \\end{aligned}"
        ],
        explanation:
          "You faced two pairs of lotteries that differ only by a common consequence: Round 1 attaches “2,400 caps with probability 0.66” to both A and B, and Round 2 replaces that same part with “nothing with probability 0.66” in both C and D. Expected utility says the common consequence cannot reverse the ranking, yet most people take the sure 2,400 in Round 1 and the 2,500 gamble in Round 2 — the certainty effect. The panel below checks whether a single utility function could produce your two choices, and shows the short algebra if it could not.",
        formulas: [
          {
            tex:
              "\\begin{aligned} &A\\succ B\\\\ &\\iff u(2400) > 0.33\\,u(2500)+0.66\\,u(2400)\\\\ &\\iff 0.34\\,u(2400) > 0.33\\,u(2500) \\end{aligned}",
            ref: 11,
            note: "Textbook pattern: A over B."
          },
          {
            tex: "\\begin{aligned} C\\succ D &\\iff 0.33\\,u(2500) > 0.34\\,u(2400) \\end{aligned}",
            ref: 11,
            note: "Textbook pattern: C over D."
          },
          {
            tex:
              "\\begin{aligned} 0.34\\,u(2400) &> 0.33\\,u(2500)\\\\ &> 0.34\\,u(2400)\\qquad \\bot \\end{aligned}",
            ref: 11,
            note: "Both cannot hold.",
            when: "inconsistent"
          },
          {
            tex:
              "\\begin{aligned} V(A)&=943.2,\\quad V(B)=806.5,\\\\ V(C)&=326.7,\\quad V(D)=320.1 \\end{aligned}",
            ref: 22,
            note: "Prospect theory reproduces the usual pattern."
          }
        ],
        benchmarkNote:
          "Population benchmark: 82% chose A and 83% chose C (Kahneman & Tversky, 1979).",
        showTriangle: true,
        triangleCaption:
          "The segments AB and DC are parallel — A and B sit on the left, C and D on the right. Expected-utility indifference lines are parallel, so A≻B and C≻D cannot both hold; the dashed lines would have to fan out.",
        footnote:
          "Numbers from the Allais source frames; displayed in caps at a ×1/1000 rescale of the slides’ “2,400k gp”."
      }
    }
  }
};
