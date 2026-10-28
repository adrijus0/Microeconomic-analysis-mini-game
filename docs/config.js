/*
 * config.js — the single place for anything a teammate may want to change.
 *
 * Loaded as a classic script (no modules, no build step) by index.html and
 * play.html. Works from file:// and from GitHub Pages under /<repo>/ because
 * every path below is relative.
 *
 * Wasteland Odds: one short Fallout: New Vegas encounter per paradox. The
 * story text is Fallout lore; every number, probability, crowd share and
 * takeaway comes from the slides (Microeconomic_analysis__Copy_.pdf, 19
 * pages — `slide` fields use that numbering).
 */
window.CONFIG = {
  siteUrl: "https://adrijus0.github.io/Microeconomic-analysis-mini-game/",

  title: "Wasteland Odds",
  subtitle: "Paradoxes of Choices under Uncertainty",

  /* Passed to KaTeX as a copy on every render (KaTeX mutates it on \gdef). */
  katexMacros: {
    "\\X": "\\mathcal{X}"
  },

  landing: {
    boot: [
      "ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL",
      "VAULT-TEC EXPERIMENT LOG v2.077",
      "LOADING PARADOXES ... OK"
    ],
    motto: "War never changes. Neither do your biases.",
    title: "Wasteland Odds",
    subtitle: "Paradoxes of Choices under Uncertainty",
    lead: "Three deals in the Mojave. Trust your gut — then see the theory your gut just broke.",
    cta: "Enter the Mojave",
    disclaimer: "Fan-made class project · not affiliated with Bethesda"
  },

  report: {
    kicker: "Vault-Tec Report Card",
    /* Indexed by how many times you chose like the crowd (0 … all). */
    ranks: [
      "Lone Wanderer",
      "Sharp-eyed Courier",
      "Typical Wastelander",
      "Certified Vault Dweller"
    ],
    closing:
      "EU remains the normative benchmark; prospect theory and its relatives describe actual behaviour better."
  },

  map: {
    kicker: "Pip-Boy 3000 · Map",
    title: "The Mojave",
    lead: "Pick a deal. Each takes about a minute.",
    reportCta: "Your Report Card",
    reportLocked: "Finish a deal to unlock your Report Card",
    reset: "Wipe Pip-Boy memory"
  },

  /* Every image is referred to by key, never by path. Missing art never
     crashes: a labelled placeholder is drawn instead. */
  assets: {
    hub_allais: {
      file: "assets/cards/hub_allais.png",
      alt: "A steel strongbox on a Mojave highway, with a watchtower behind",
      kind: "card",
      w: 640,
      h: 360
    },
    strip_bg: {
      file: "assets/backgrounds/strip_bg.png",
      alt: "The New Vegas Strip at night, with the Lucky 38 tower in the middle",
      kind: "background",
      w: 1280,
      h: 720
    },
    sunset_bg: {
      file: "assets/backgrounds/sunset_bg.png",
      alt: "Sunset Sarsaparilla HQ at dusk, with its round sun sign",
      kind: "background",
      w: 1280,
      h: 720
    },
    allais_bg: {
      file: "assets/backgrounds/allais_bg.png",
      alt: "A caravan camp at dusk on a broken Mojave highway",
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
      alt: "A Crimson Caravan trader in a duster coat",
      kind: "sprite",
      w: 32,
      h: 32
    },
    allais_raider: {
      file: "assets/sprites/allais/raider.png",
      alt: "A raider silhouette with a varmint rifle",
      kind: "sprite",
      w: 32,
      h: 32
    },
    icon_caps: {
      file: "assets/sprites/allais/icon_caps.png",
      alt: "A bottle cap",
      kind: "sprite",
      w: 32,
      h: 32
    },
    victor: {
      file: "assets/sprites/wasteland/victor.png",
      alt: "Victor, a Securitron with a cowboy face on its screen",
      kind: "sprite",
      w: 32,
      h: 32
    },
    chip_heads: {
      file: "assets/sprites/wasteland/chip_heads.png",
      alt: "A Lucky 38 chip showing the tower",
      kind: "sprite",
      w: 32,
      h: 32
    },
    chip_tails: {
      file: "assets/sprites/wasteland/chip_tails.png",
      alt: "A Lucky 38 chip showing a horseshoe",
      kind: "sprite",
      w: 32,
      h: 32
    },
    festus: {
      file: "assets/sprites/wasteland/festus.png",
      alt: "Festus, the animatronic cowboy of Sunset Sarsaparilla",
      kind: "sprite",
      w: 32,
      h: 32
    },
    cap_barrel: {
      file: "assets/sprites/wasteland/cap_barrel.png",
      alt: "A rusty barrel full of bottle caps",
      kind: "sprite",
      w: 32,
      h: 32
    }
  },

  /* Map order (the slides' order). Only listed encounters are shown. */
  encounterOrder: ["stpetersburg", "allais", "ellsberg"],

  games: {
    stpetersburg: {
      id: "stpetersburg",
      title: "Mr. House's Chip Toss",
      location: "Lucky 38 · The Strip",
      slides: "6",
      hook: "Victor flips a chip. What will you pay to play?",
      paradox: "St. Petersburg paradox",
      logic: "StPetersburgGame",
      prop: "chip",
      scene: {
        background: "strip_bg",
        sprite: "victor",
        spriteAlt: "Victor, a Securitron with a cowboy face on its screen",
        kicker: "Lucky 38 · The Strip",
        heading: "Mr. House has a wager",
        lines: [
          "“Victor will flip a Lucky 38 chip until it lands tails, Courier.”",
          "“Tails on flip 1 pays 2 caps. Flip 2 pays 4, flip 3 pays 8… it doubles every time.”"
        ],
        cta: "Name your price"
      },
      rounds: [
        {
          id: "fee",
          stepLabel: "Your fee",
          kicker: "You have 100 caps",
          prompt: "What's the most you'd pay to play once?",
          layout: "chips",
          options: [
            { id: "f2", label: "2", note: "caps", fee: 2, lockLabel: "2 caps" },
            { id: "f5", label: "5", note: "caps", fee: 5, lockLabel: "5 caps" },
            { id: "f10", label: "10", note: "caps", fee: 10, lockLabel: "10 caps" },
            { id: "f25", label: "25", note: "caps", fee: 25, lockLabel: "25 caps" },
            { id: "f50", label: "50", note: "caps", fee: 50, lockLabel: "50 caps" },
            { id: "f100", label: "100", note: "all in", fee: 100, lockLabel: "100 caps" }
          ]
        }
      ],
      resolve: {
        heading: "Victor flips…"
      },
      report: { breaks: "Expected value", fix: "Concave utility (Bernoulli)" },
      reveal: {
        name: "St. Petersburg paradox",
        slide: 6,
        crowd: "Almost nobody pays more than a few caps",
        takeaway: "Expected value fails; expected utility with u″ < 0 works.",
        notes: [
          {
            slide: 6,
            text:
              "Bernoulli (1738): with u(x) = ln x each extra cap adds less utility (u″ < 0). Doubling a prize adds at most ln 2 of utility while its chance halves, so the sum converges: an infinite expected prize is worth only a few caps."
          }
        ]
      }
    },

    allais: {
      id: "allais",
      title: "The Crimson Caravan Contracts",
      location: "Crimson Caravan Co.",
      slides: "7–10",
      hook: "Alice McLafferty has two contracts. Sign fast.",
      paradox: "Allais paradox",
      slideRefs: [7, 8, 10, 14],
      logic: "AllaisGame",
      prop: "chest",
      scene: {
        background: "allais_bg",
        sprite: "allais_trader",
        spriteAlt: "Alice McLafferty of the Crimson Caravan Company",
        kicker: "Crimson Caravan Company",
        heading: "Alice has a job",
        lines: [
          "“Courier. I need cargo hauled to Goodsprings, paid in caps.”",
          "“Two contracts. Sign one — Crimson Caravan doesn't wait.”"
        ],
        cta: "Read the contracts"
      },
      rounds: [
        {
          id: "r1",
          stepLabel: "Job 1",
          kicker: "Job one",
          prompt: "Which contract do you sign?",
          options: [
            {
              id: "A",
              label: "Armored brahmin wagon",
              sprite: "allais_chest_a",
              spriteAlt: "A sealed steel strongbox",
              note: "The long way round, via Novac. Guaranteed.",
              lottery: [{ p: 1.0, x: 2400 }]
            },
            {
              id: "B",
              label: "Quarry Junction shortcut",
              sprite: "allais_chest_b",
              spriteAlt: "A battered crate with a faint green glow",
              note: "Faster. Deathclaw country.",
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
          stepLabel: "Job 2",
          kicker: "Job two",
          prompt: "New job. Which do you sign?",
          options: [
            {
              id: "C",
              label: "One fast run",
              sprite: "allais_chest_c",
              spriteAlt: "A single canvas satchel",
              note: "Straight through Quarry Junction.",
              lottery: [
                { p: 0.33, x: 2500 },
                { p: 0.67, x: 0 }
              ]
            },
            {
              id: "D",
              label: "Two cautious runs",
              sprite: "allais_chest_d",
              spriteAlt: "A double-strapped satchel with two tags",
              note: "Smaller loads, same Deathclaws.",
              lottery: [
                { p: 0.34, x: 2400 },
                { p: 0.66, x: 0 }
              ]
            }
          ]
        }
      ],
      /* A short travel beat instead of the old 20-second interlude. */
      beat: {
        afterRound: "r1",
        lines: [
          "Two days later. Novac, under Dinky the T-Rex.",
          "Alice radios a new job. The roads got worse."
        ],
        seconds: 3
      },
      resolve: {
        heading: "Alice checks the manifest…",
        winHeading: "Delivered!",
        loseHeading: "Deathclaws!",
        win: "Cargo delivered. Alice pays {x}.",
        lose: "The cargo's gone. Alice pays nothing."
      },
      report: { breaks: "Independence axiom", fix: "Probability weighting (prospect theory)" },
      reveal: {
        name: "Allais paradox",
        kicker: "The certainty effect",
        slide: 7,
        crowd: "82% pick A · 83% pick C",
        crowdSource: "Kahneman & Tversky (1979)",
        takeaway:
          "Job 2 is job 1 with a shared “66% → 2,400” swapped for “66% → 0”. Independence says that can't matter — but a 1% chance of nothing feels huge next to a sure thing.",
        figures: ["triangle", "weighting"],
        notes: [
          {
            slide: 10,
            text:
              "Common ratio: 80% of people take 3,000 caps for sure over an 80% shot at 4,000. Divide both chances by 4 (25% → 3,000 vs 20% → 4,000) and 65% now take the 4,000. That should not change the choice — but it does."
          }
        ],
        weightingCaption:
          "Small chances are overweighted, big ones underweighted (γ = 0.61) — so going from 99% to 100% feels huge.",
        triangleCaption:
          "EU indifference lines are straight and parallel, and AB ∥ DC, so EU ranks both pairs alike: A ≻ B ⇔ D ≻ C. Choosing A and C needs lines that fan out."
      }
    },

    ellsberg: {
      id: "ellsberg",
      title: "Festus's Cap Barrel",
      location: "Sunset Sarsaparilla HQ",
      slides: "11–12",
      hook: "How many star caps are in the barrel? Festus ain't sayin'.",
      paradox: "Ellsberg paradox",
      logic: "EllsbergGame",
      prop: "barrel",
      /* Both bets first, then one cap: an early draw would leak the mix. */
      resolveAtEnd: true,
      scene: {
        background: "sunset_bg",
        sprite: "festus",
        spriteAlt: "Festus, the animatronic cowboy of Sunset Sarsaparilla",
        kicker: "Sunset Sarsaparilla HQ",
        heading: "Howdy, partner!",
        lines: [
          "“My barrel's got 90 caps: 30 Nuka-Cola, 60 Sunset Sarsaparilla.”",
          "“Some Sunset caps hide a blue star; the rest are plain. How many stars? I ain't sayin'. Make two calls, then I pull one cap: 100 caps per call it matches.”"
        ],
        cta: "Place your bet"
      },
      rounds: [
        {
          id: "r1",
          stepLabel: "Bet 1",
          kicker: "Bet one",
          prompt: "Which cap do you bet on?",
          options: [
            {
              id: "I",
              label: "A Nuka-Cola cap",
              short: "a Nuka cap",
              note: "30 of 90. You know the odds.",
              wins: ["nuka"],
              segments: [
                { n: 30, kind: "win", text: "win 100 caps" },
                { n: 60, kind: "lose", text: "nothing" }
              ]
            },
            {
              id: "II",
              label: "A star cap",
              short: "a star cap",
              note: "0 to 60 of 90. Nobody knows.",
              wins: ["star"],
              segments: [
                { n: 60, kind: "unknown", text: "win 100 caps (star count unknown)" },
                { n: 30, kind: "lose", range: "30–90", text: "nothing" }
              ]
            }
          ]
        },
        {
          id: "r2",
          stepLabel: "Bet 2",
          kicker: "Bet two",
          prompt: "Second bet. Which do you call?",
          intro: "Same barrel, same cap: one draw settles both bets.",
          options: [
            {
              id: "III",
              label: "A Nuka-Cola or plain Sunset cap",
              short: "Nuka-or-plain",
              note: "30 to 90 of 90. Nobody knows.",
              wins: ["nuka", "plain"],
              segments: [
                { n: 30, kind: "win", text: "win 100 caps" },
                { n: 60, kind: "unknown", text: "win 100 caps (plain count unknown)" },
                { n: 0, kind: "lose", range: "0–60", text: "nothing" }
              ]
            },
            {
              id: "IV",
              label: "Any Sunset cap (star or plain)",
              short: "any Sunset cap",
              note: "60 of 90. You know the odds.",
              wins: ["star", "plain"],
              segments: [
                { n: 60, kind: "win", text: "win 100 caps" },
                { n: 30, kind: "lose", text: "nothing" }
              ]
            }
          ]
        }
      ],
      beat: {
        afterRound: "r1",
        kicker: "Same barrel",
        lines: ["“Bet noted. One cap settles both bets, partner. Make your second call.”"],
        seconds: 3
      },
      resolve: {
        heading: "Festus digs in…"
      },
      report: { breaks: "Sure-thing principle, single prior", fix: "Ambiguity aversion (maxmin EU)" },
      reveal: {
        name: "Ellsberg paradox",
        kicker: "Ambiguity aversion",
        slide: 12,
        crowd: "Most pick I and IV: the known odds",
        crowdSource: "Ellsberg (1961)",
        takeaway: "People dislike not knowing the odds.",
        notes: [
          {
            slide: 12,
            text:
              "Maxmin EU (Gilboa & Schmeidler, 1989): judge each bet by its worst possible mix. Worst case for II is 0 star caps; for III it is 60 star caps, so only the 30 Nuka win. So I (30 of 90) beats II (0 of 90), and IV (60 of 90) beats III (30 of 90) — exactly what people pick."
          }
        ]
      }
    }
  }
};
