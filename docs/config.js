/*
 * config.js — the single place for anything a teammate may want to change.
 *
 * Loaded as a classic script (no modules, no build step) by index.html and
 * play.html. Works from file:// and from GitHub Pages under /<repo>/ because
 * every path below is relative.
 *
 * Wasteland Odds: one short Fallout: New Vegas encounter per paradox. The
 * story text is Fallout lore; every number, probability, crowd share and
 * takeaway comes from the slides (Microeconomic_analysis__Copy_-2.pdf, 19
 * pages). The `slide`/`slides` fields record the source slide for fact
 * checks; the game itself never shows slide numbers.
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
    lead: "Four deals. Trust your gut, then see what it broke.",
    cta: "Enter the Mojave"
  },

  /* The caps wallet in the top bar. It starts at slide 6's w = 100 and
     keeps the latest result of every deal round (a replay replaces it). */
  wallet: {
    start: 100
  },

  report: {
    kicker: "Vault-Tec Report Card",
    /* Indexed by how many deals you chose like most people (0 … all 4);
       scaled when the count of deals changes. */
    ranks: [
      "Lone Wanderer",
      "Sharp-eyed Courier",
      "Mojave Drifter",
      "Typical Wastelander",
      "Certified Vault Dweller"
    ],
    closing:
      "EU remains the normative benchmark; prospect theory and its relatives describe actual behaviour better.",
    /* Typed under the rank once every deal is done, then the ending tune. */
    ending: "Vault-Tec thanks you for your participation. Your journey ends here… for now."
  },

  map: {
    kicker: "Pip-Boy 3000 · Map",
    title: "The Mojave",
    reportCta: "Report Card",
    reportLocked: "Finish a deal to unlock the Report Card",
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
    },
    garret: {
      file: "assets/sprites/wasteland/garret.png",
      alt: "James Garret of the Atomic Wrangler, in a worn pre-War suit",
      kind: "sprite",
      w: 32,
      h: 32
    },
    wrangler_bg: {
      file: "assets/backgrounds/wrangler_bg.png",
      alt: "The Atomic Wrangler in Freeside at night, its neon hat sign glowing",
      kind: "background",
      w: 1280,
      h: 720
    },
    title_card: {
      file: "assets/cards/title_card.png",
      alt: "New Vegas at dusk with a distant mushroom cloud; a power armor helmet, a Pip-Boy and a Nuka-Cola bottle in the sand",
      kind: "card",
      w: 640,
      h: 360
    }
  },

  /* Map order (the slides' order). Only listed encounters are shown. */
  encounterOrder: ["stpetersburg", "allais", "ellsberg", "lossaversion"],

  /*
   * Report Card extras. `special`: one S.P.E.C.I.A.L.-style bar per deal,
   * the sum of the chosen options' points (clamped to 1–10). `perks`: the
   * card a deal unlocks, by whether you chose like most people.
   */

  games: {
    stpetersburg: {
      id: "stpetersburg",
      title: "Mr. House's Chip Toss",
      location: "Lucky 38 · The Strip",
      slides: "6",
      hook: "What would you pay for Victor's chip toss?",
      paradox: "St. Petersburg paradox",
      logic: "StPetersburgGame",
      prop: "chip",
      /* The fee can be up to 100: a Courier with less is spotted the rest. */
      stake: 100,
      stakeNote: "Mr. House spots you the caps for this one.",
      scene: {
        background: "strip_bg",
        sprite: "victor",
        spriteAlt: "Victor, a Securitron with a cowboy face on its screen",
        kicker: "Lucky 38 · The Strip",
        heading: "Mr. House has a wager",
        lines: [
          "“Pay a fee and Victor flips a chip, Courier.”",
          "“The pot starts at 2 caps. Heads doubles it. Tails ends the game: you take the pot.”"
        ],
        cta: "Name your price"
      },
      rounds: [
        {
          id: "fee",
          stepLabel: "Your fee",
          /* {wallet}: the caps you bring to this deal (slide 6's w). */
          kicker: "You have {wallet} caps",
          prompt: "What's the most you'd pay to play?",
          intro: "Your fee doesn't change the pot.",
          layout: "chips",
          options: [
            { id: "f2", label: "2", fee: 2, lockLabel: "2-cap fee" },
            { id: "f5", label: "5", fee: 5, lockLabel: "5-cap fee" },
            { id: "f10", label: "10", fee: 10, lockLabel: "10-cap fee" },
            { id: "f25", label: "25", fee: 25, lockLabel: "25-cap fee" },
            { id: "f50", label: "50", fee: 50, lockLabel: "50-cap fee" },
            { id: "f100", label: "100", fee: 100, lockLabel: "100-cap fee" }
          ]
        }
      ],
      resolve: {
        heading: "Victor flips…"
      },
      report: { breaks: "Expected value", fix: "Concave utility (Bernoulli)" },
      special: { label: "Risk appetite", points: { f2: 1, f5: 3, f10: 5, f25: 7, f50: 9, f100: 10 } },
      perks: {
        crowd: { name: "Bernoulli's Heir", text: "You paid no more than it's worth to you." },
        other: { name: "Big Spender", text: "You paid big for an endless average." }
      },
      reveal: {
        name: "St. Petersburg paradox",
        slide: 6,
        crowd: "Most people pay only a few caps",
        /* Slide 6's "expected value fails; EU with u″ < 0 works", in words. */
        takeaway: "Each extra cap matters less, so an infinite average is worth only a few caps.",
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
      slides: "7–9",
      hook: "Sign one of Alice's two contracts.",
      paradox: "Allais paradox",
      slideRefs: [7, 8, 9, 13],
      logic: "AllaisGame",
      prop: "chest",
      scene: {
        background: "allais_bg",
        sprite: "allais_trader",
        spriteAlt: "Alice McLafferty of the Crimson Caravan Company",
        kicker: "Crimson Caravan Company",
        heading: "Alice has a job",
        lines: ["“Cargo to Goodsprings, Courier. Pick a contract.”"],
        cta: "Read the contracts"
      },
      rounds: [
        {
          id: "r1",
          stepLabel: "Job 1",
          kicker: "Job 1 of 2",
          prompt: "Which contract do you sign?",
          options: [
            {
              id: "A",
              label: "Armored brahmin wagon",
              sprite: "allais_chest_a",
              spriteAlt: "A sealed steel strongbox",
              note: "Safe road. Guaranteed.",
              lottery: [{ p: 1.0, x: 2400 }]
            },
            {
              id: "B",
              label: "Quarry Junction shortcut",
              sprite: "allais_chest_b",
              spriteAlt: "A battered crate with a faint green glow",
              note: "Deathclaw country.",
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
          kicker: "Job 2 of 2",
          prompt: "Which do you sign?",
          options: [
            {
              id: "C",
              label: "One fast run",
              sprite: "allais_chest_c",
              spriteAlt: "A single canvas satchel",
              note: "Through Quarry Junction.",
              lottery: [
                { p: 0.33, x: 2500 },
                { p: 0.67, x: 0 }
              ]
            },
            {
              id: "D",
              label: "Two careful runs",
              sprite: "allais_chest_d",
              spriteAlt: "A double-strapped satchel with two tags",
              note: "Same Deathclaws.",
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
        lines: ["Two days later, Novac. Alice radios a new job."],
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
      special: { label: "Caution", points: { A: 6, B: 1, C: 0, D: 4 } },
      perks: {
        crowd: { name: "Certainty Effect", text: "Sure thing first, long shot second." },
        other: { name: "Lone Courier", text: "You broke from the usual pattern." }
      },
      reveal: {
        name: "Allais paradox",
        kicker: "The certainty effect",
        slide: 7,
        crowd: "82% pick A · 83% pick C",
        crowdSource: "Kahneman & Tversky (1979)",
        takeaway: "A 1% chance of getting nothing feels huge next to a sure thing.",
        figures: ["weighting"],
        notes: [
          {
            slide: 7,
            text:
              "Job 2 is job 1 with a shared “66% → 2,400” swapped for “66% → 0”. Independence says a shared part can't change your pick — yet most people switch from A to C."
          },
          {
            slide: 9,
            text:
              "Common ratio: 80% of people take 3,000 caps for sure over an 80% shot at 4,000. Divide both chances by 4 (25% → 3,000 vs 20% → 4,000) and 65% now take the 4,000. That should not change the choice — but it does."
          }
        ],
        weightingCaption:
          "Small chances are overweighted, big ones underweighted (γ = 0.61) — so going from 99% to 100% feels huge."
      }
    },

    ellsberg: {
      id: "ellsberg",
      title: "Festus's Cap Barrel",
      location: "Sunset Sarsaparilla HQ",
      slides: "10–11",
      hook: "How many star caps? Festus ain't sayin'.",
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
          "“My barrel: 30 red caps, 60 yellow.”",
          "“Some yellow ones may have a star. How many? Ain't sayin'.”",
          "“Bet twice, then I pull one cap. Each right bet pays 100.”"
        ],
        cta: "Place your bets"
      },
      /* Each card shows "pulled → you get" rows and the barrel with its
         winning caps lit. The win chance, the badge and the lit caps are all
         derived from `wins` (EllsbergGame.chance / known). Bet 2 mirrors
         bet 1 with plain yellow added to both sides (slide 11).
         Slide 10: red = Nuka cap, black = star cap, yellow = plain cap. */
      rounds: [
        {
          id: "r1",
          stepLabel: "Bet 1",
          kicker: "Bet 1 of 2 · 100 caps a win",
          prompt: "Which cap do you bet on?",
          options: [
            {
              id: "I",
              label: "Red",
              short: "red",
              lockLabel: "Red",
              when: "Red cap pulled",
              wins: ["nuka"]
            },
            {
              id: "II",
              label: "Star",
              short: "star",
              lockLabel: "Star",
              when: "Star cap pulled",
              wins: ["star"]
            }
          ]
        },
        {
          id: "r2",
          stepLabel: "Bet 2",
          kicker: "Bet 2 of 2 · same draw",
          prompt: "Which do you bet on?",
          intro: "Same two bets, but now plain yellow wins too, on both sides.",
          options: [
            {
              id: "III",
              label: "Red + plain yellow",
              short: "red + plain",
              lockLabel: "Red + plain",
              when: "Red or plain yellow pulled",
              wins: ["nuka", "plain"]
            },
            {
              id: "IV",
              label: "Star + plain yellow",
              short: "star + plain",
              lockLabel: "Star + plain",
              when: "Star or plain yellow pulled",
              wins: ["star", "plain"]
            }
          ]
        }
      ],
      beat: {
        afterRound: "r1",
        kicker: "Same barrel",
        lines: ["“Noted. Now your second bet, partner.”"],
        seconds: 3
      },
      resolve: {
        heading: "Festus digs in…"
      },
      report: { breaks: "Sure-thing principle, single prior", fix: "Ambiguity aversion (maxmin EU)" },
      special: { label: "Fear of the unknown", points: { I: 5, II: 0, III: 0, IV: 5 } },
      perks: {
        crowd: { name: "Known Devil", text: "You picked the odds you could see, twice." },
        other: { name: "Cold Reader", text: "Unknown odds didn't scare you off." }
      },
      reveal: {
        name: "Ellsberg paradox",
        kicker: "Ambiguity aversion",
        slide: 11,
        crowd: "Most pick I + IV: known odds",
        crowdSource: "Ellsberg (1961)",
        takeaway: "People dislike not knowing the odds.",
        notes: [
          {
            slide: 11,
            text:
              "Maxmin EU (Gilboa & Schmeidler, 1989): judge each bet by its worst possible mix. Worst case for II is 0 star caps; for III it is 60 star caps, so only the 30 red win. So I (30 of 90) beats II (0 of 90), and IV (60 of 90) beats III (30 of 90) — exactly what people pick."
          }
        ]
      }
    },

    lossaversion: {
      id: "lossaversion",
      title: "The Atomic Wrangler Flip",
      location: "Atomic Wrangler · Freeside",
      slides: "12–13",
      hook: "Lose 100 or win 110 on one flip?",
      paradox: "Loss aversion",
      logic: "LossAversionGame",
      prop: "capflip",
      stake: 100,
      stakeNote: "Garret spots you the caps for this one.",
      scene: {
        background: "wrangler_bg",
        sprite: "garret",
        spriteAlt: "James Garret of the Atomic Wrangler, in a worn pre-War suit",
        kicker: "Atomic Wrangler · Freeside",
        heading: "Garret's side bet",
        lines: [
          "“One cap flip, Courier. Heads, I pay you 110 caps.”",
          "“Tails, you pay me 100. In or out?”"
        ],
        cta: "See the bet"
      },
      rounds: [
        {
          id: "flip",
          stepLabel: "The flip",
          kicker: "You have {wallet} caps",
          prompt: "Do you take the flip?",
          options: [
            {
              id: "F",
              label: "Flip",
              note: "Your own caps on the line.",
              lockLabel: "the flip",
              lottery: [
                { p: 0.5, x: 110 },
                { p: 0.5, x: -100 }
              ]
            },
            {
              id: "W",
              label: "Walk away",
              note: "No change to your caps.",
              lockLabel: "walking away",
              lottery: [{ p: 1.0, x: 0 }]
            }
          ]
        }
      ],
      resolve: {
        heading: "Garret flips a cap…"
      },
      /* `name` follows slide 14's row title. */
      report: { name: "Small-bet risk aversion", breaks: "EU over total wealth", fix: "Loss aversion (λ > 1)" },
      special: { label: "Fear of losses", points: { F: 2, W: 9 } },
      perks: {
        crowd: { name: "Once Bitten", text: "A loss stings about twice as much as a win." },
        other: { name: "Edge Player", text: "You took the +5 edge." }
      },
      reveal: {
        name: "Loss aversion",
        kicker: "Losses hurt more",
        slide: 12,
        crowd: "Most people refuse",
        takeaway: "Losses hurt about twice as much as gains please.",
        notes: [
          {
            slide: 12,
            text:
              "Under expected utility, refusing this small +5 bet would mean refusing absurdly good large bets too (Rabin, 2000). Prospect theory's simpler answer: losses hurt about twice as much as gains please (λ = 2.25)."
          }
        ]
      }
    }
  }
};
