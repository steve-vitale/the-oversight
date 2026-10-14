# Ability Theory Research — what makes roguelike ability systems coherent

Steve's directive (2026-10-14): *"Let's get way deeper on ability theory. Look to external sources for tested strategies."*
His critique: 108 abilities, 57 synergies, but no coherency — abilities feel like "after effects," nothing usefully synergizes, no gear specifically enhances abilities.

This brief distills tested patterns from the genre's best ability systems into actionable principles for a 6-slot, path-based ability system.

---

## The 7 tested patterns

### 1. Enabler → Payoff: every archetype needs both halves (Magic: The Gathering draft design)

The single most tested coherency pattern in game design. Since *Theros*, every MTG limited archetype is signaled by exactly two uncommon "signpost" cards: one **enabler** (supports the playstyle — e.g., creatures that put counters on things) and one **payoff** (rewards the playstyle — e.g., a card that gets huge when you have counters). The enabler is playable alone; the payoff is weak alone; together they define the draft archetype. Players discover the archetype *by reading two cards*, not a wiki.

**Why it works:** it separates the question "what do I collect?" (enablers — the verb) from "what makes it explosive?" (payoffs — the reward). A pile of enablers with no payoff is a slow deck; a payoff with no enablers is a dead card. Coherency = both halves present.

**For us:** audit every path (brawler, shieldbearer/tank, etc.) and sort its abilities into enablers vs. payoffs. Steve's "crap load of abilities but none usefully synergize" is the predictable result of 108 enablers and ~0 payoffs. A tank path needs enablers (taunts, blocks, positioning) AND payoffs (abilities that detonate when you've blocked X, or scale with damage absorbed). If a path has no payoff, it's not a path — it's a pile.

Source: https://mtg.wiki/page/Draft_archetype

### 2. Build-around rares: weak-alone cards that define runs (Slay the Spire)

Spire's archetypes (poison, shivs, strength-scaling, frost orbs) are never declared in-game — they emerge because specific rare cards are *build-arounds*: weak or useless alone, run-defining with support. Catalyst (doubles enemy poison) does nothing without poison application; with it, it ends fights. Accuracy (+4 damage per shiv) is blank without shiv generators. The design rule: **the most exciting cards should be the ones that demand a deck, not the ones that are good in every deck.**

Critically, Spire's card-reward algorithm is weighted toward cards that synergize with what you already hold — the game quietly steers you toward coherence without forcing it. And relics (gear) like Kunai ("when you play 3 attacks in a turn, gain energy") or Snecko Skull (poison applies +1) reward *archetype commitment*, not generic stats.

**Why it works:** build-arounds convert the draft from "pick the strongest card" (good-stuff pile) to "commit to a plan" (build). The reward weighting means coherence is the path of least resistance.

**For us:** designate 1–2 build-around abilities per path — abilities that are mediocre alone but explosive with 2+ same-path abilities. Weight ability offers toward the player's existing path picks (Spire's quiet steering). Gear should reward path commitment the way Snecko Skull rewards poison.

Sources:
- https://kotaku.com/slay-the-spire-2-tips-tricks-beginner-deckbuilding-2000680050
- https://www.pcgamesn.com/slay-the-spire-2/silent
- https://www.escapistmagazine.com/news-slay-the-spire-2-silent-deck-guides-shiv-poison-and-sly-builds/

### 3. Fixed slots make builds legible (Hades)

Hades' genius is structural: every run fills the *same six slots* — Attack, Special, Cast, Dash, Call (+ weapon). The build is never "which abilities do I have" but "which god fills each slot, and how do they interact." Duo boons (Zeus × Artemis, etc.) explicitly reward cross-slot god combinations, and Daedalus Hammers modify *how the weapon's moves behave* (gear changing verbs, not numbers). Because the slots are fixed and always visible, the player can read their build at a glance — coherence is a UI property, not just a math property.

Supergiant's process note is relevant: they iterated boons through Early Access data, repeatedly *moving* overpowered concepts to new homes (a boon cut from one god reappeared as a weapon Aspect) rather than deleting them — "not too precious about these things when they exist in service of a cohesive whole."

**Why it works:** fixed slots turn an open-ended collection problem into a fill-in-the-blanks composition problem. The player always knows what "complete" looks like.

**For us:** we already have 6 slots — but they're generic. Hades suggests *named* slots (or slot roles: opener, nuke, control, sustain, mobility, wildcard) so the player feels the shape of a complete build. Duo-boon equivalents: synergies that fire specifically from cross-path pairs in the 6 slots, named and celebrated when they happen ("Shieldbearer × Brawler: JUGGERNAUT").

Sources:
- https://gamerant.com/hades-best-duo-boons-guide/
- https://www.gamesradar.com/games/hades-2-guide/ (Kasavin on iterating boons; "find new homes")
- https://kotaku.com/tips-for-playing-hades-1845096466

### 4. Behavior-changing items, not stat sticks (Isaac / Diablo / Path of Exile)

The Binding of Isaac's 700+ items work because ~90% stack and the memorable ones *change behavior*: homing tears, piercing shots, orbitals, tear replacements. Nobody remembers "+1 damage"; everybody remembers the run where their tears became laser rings. Diablo's legendary affixes that "change how a skill works" and Path of Exile's support gems (socketed into active skills — Multiple Projectiles, Faster Projectiles) are the same pattern: **gear is interesting when it rewrites a verb.**

Steve's question — "do we have any gear that specifically enhances abilities?" — is the right one, and the genre answer is unanimous: the gear players remember modifies *what abilities do*, not how hard they hit. Spire relics like Mummified Hand ("whenever you play a Power, a random card in your hand costs 0") or Chemical X ("X-cost cards get +2 effects") change the rules of the turn.

**Why it works:** stat sticks are interchangeable; behavior changes create stories. "My fireball splits into three" is a build; "+20% fire damage" is a number.

**For us:** the weapon-ability synergies just added are the seed of this — but they should go further. Tier the gear-ability interactions: (a) gear that *triggers* abilities (block 30 → auto-cast), (b) gear that *rewrites* abilities (your Shove now pulls instead of pushes), (c) gear that *unlocks* new ability uses (this armor grants an extra slot for tank-path abilities only). Every tier-3+ weapon/armor should do one of these, not just add damage/armor.

Sources:
- https://www.polygon.com/features/2018/5/15/17345246/the-past-present-and-future-of-the-binding-of-isaac/
- https://deltiasgaming.com/everything-about-skill-gems-in-path-of-exile-2-explained/
- https://game-news24.com/2022/11/03/diablo-4s-unique-items-are-scaled-to-character-level-leading-to-debate-among-arpg-fans/

### 5. Color-code the archetype (Dead Cells)

Dead Cells communicates its three build archetypes (Brutality/red, Tactics/purple, Survival/green) through a single visual language: gear, mutations, and scrolls are all color-coded, and scaling follows color. A player never reads a guide to learn "red = melee aggression" — the color *is* the guide. Mutations (the closest analog to our 6-slot abilities: 3 fixed slots) are color-tagged, so a red weapon + red mutations + red scrolls is visibly, instantly a build.

**Why it works:** archetype discovery without text. The player pattern-matches color before they understand mechanics, and the mechanics then confirm the pattern.

**For us:** paths need a visual identity stronger than a tag in JSON. Color-code ability buttons, synergy announcements, and gear by path. When a synergy fires, name the path pair. The goal: a player should be able to say "I'm doing the red thing" before they can articulate what the red thing does.

### 6. Broken is the point — balance the floor, not the ceiling (Isaac / Spire / the roguelike roundtable)

Across every source: the genre's best games *allow* broken builds. Spire "throws balance out the window" because it's single-player — each run is "a miniature exercise in speccing out a deck for maximum combinations." The roguelike deckbuilder roundtable (Spellrogue, Astrea devs) is explicit: "the player is supposed to go hog wild every now and then… leave an opportunity for the player to go crazy. But it has to be earned." McMillen's core for Isaac was "replayability" via "organized chaos" — items deliberately combine into monstrous powerhouses.

The tested balance posture: **guarantee a competent floor** (any reasonable picks survive the early game) and **let the ceiling explode** (dedicated builds go infinite-ish). What gets nerfed is not power but *reliability* — the broken combo should require assembly, not be handed out.

**Why it works:** the fantasy of the genre is "I broke the game." Preventing that kills the genre's core pleasure; the skill is in *assembling* the break.

**For us:** Steve already holds "broken builds welcome (masterful combos can become nearly unfair along one dimension)." The operational rule: no synergy should be nerfed for being strong — only for being *free* (no setup, no path commitment, no knowledge required). Every nerf review should ask "did this require assembly?" If yes, leave it.

Sources:
- https://www.avclub.com/roguelike-deckbuilder-slay-the-spire-adds-depth-wi
- https://cms.ggrecon.com/articles/roguelike-deckbuilder-roundtable-interview/
- https://www.moddb.com/games/binding-of-isaac/news/raw-meat-game-design-tips-from-team-meats-edmund-mcmillen

### 7. Discoverability is diegetic or it doesn't happen (Isaac's regret)

McMillen's stated biggest regret about Isaac: *"it's not explaining what each item does on the HUD."* At 700+ items, "you can't play Isaac without a browser open on your phone" — the mystery that worked at 100 items collapsed under content bloat. The lesson for a 108-ability game is direct: **at our content scale, diegetic discovery isn't optional, it's load-bearing.** Every ability needs: what it does (visible), what it combos with (hinted — "likes: blocked damage"), and what path it belongs to (color-coded). The Codex should record *observed* synergies ("you saw Shove + Machete halve armor — recorded"), not just definitions.

Spire's quiet version of this: the card-reward screen *is* the teacher. By weighting offers toward your existing synergies, the game teaches archetypes through the choices it presents, no codex required.

**Why it works:** players learn builds by *doing*, and the game is the only teacher guaranteed to be present.

**For us:** (a) ability offers weighted toward held-path synergies; (b) synergy hints on ability cards ("combines with: control effects"); (c) Codex records witnessed synergies as player knowledge. No wiki needed, no wiki possible on mobile anyway.

Source: https://www.gamesradar.com/the-creator-of-one-of-the-most-popular-roguelikes-of-all-time-is-using-his-new-project-to-right-11-year-old-wrongs/

---

## Actionable principles for the 6-slot, path-based system

1. **Enabler/payoff audit per path.** For each path, label every ability E (enabler), P (payoff), or S (support: block/draw/sustain that lets the build survive assembly). Any path with zero payoffs is not a path — fix it before adding more abilities. Target ratio per path: ~40% enablers, ~25% payoffs, ~35% support.

2. **One build-around per path.** Design (or promote) one ability per path that is weak alone and run-defining with 2+ same-path abilities. These are the cards players tell stories about. They should be rare/high-investment, never common.

3. **Name the slots.** Give the 6 slots roles (e.g., Opener / Nuke / Control / Sustain / Mobility / Wildcard). A "complete" build is one where each role is filled; synergies that cross roles get named announcements. This makes build coherence *visible*.

4. **Weight offers toward coherence.** Ability/synergy offers should weight toward the player's existing path picks (Spire's quiet steering). The path of least resistance should be a build, not a pile.

5. **Gear rewrites verbs.** Every tier-3+ weapon/armor should modify *how* an ability behaves (trigger, rewrite, or unlock), not just add numbers. Audit: if a gear piece's removal changes nothing about *what you do*, it's a stat stick — rework or cut.

6. **Color-code paths end to end.** Ability buttons, synergy announcements, gear tags, Codex entries — one color per path. The player should feel the build before understanding it.

7. **Balance the floor, free the ceiling.** Nerf only synergies that are strong *without assembly*. Any combo requiring 2+ path abilities + a gear piece + knowledge is working as intended, no matter how explosive.

8. **Diegetic synergy discovery.** Ability cards hint at combos ("likes: control"), the Codex records witnessed synergies, offers teach archetypes. At 108 abilities, the game must be its own wiki.

## What "coherency" means operationally — and how to test it

**Operational definition:** a set of abilities is *coherent* if the whole is worth measurably more than the sum of its parts — i.e., there exist subsets whose combined win-rate / fight-flip-rate exceeds the sum of the individual abilities' marginal contributions. A "pile" is a set where value is additive; a "build" is a set where value is super-additive.

**Tests (all runnable in the sim harness):**

1. **Super-additivity test.** For each path, take the 3 most-picked abilities. Measure fight-win-rate with each alone (vs. a baseline), then all three together. Coherent iff `win(ABC) > win(A) + win(B) + win(C) − 2·win(baseline)` with margin. If no triple in a path passes, the path has no build — it's a pile.

2. **Build-around test.** For each designated build-around ability: win-rate with 0 same-path support vs. with 2+. Coherent iff the delta is large (the ability is weak alone, explosive supported). If it's equally good alone, it's good-stuff, not a build-around — move it or rework it.

3. **Offer-coherence test.** Simulate draft picks with current offer weighting: after 6 picks, what fraction of runs hold 3+ same-path abilities? If <40%, offers aren't steering toward builds (Spire's quiet steering is absent).

4. **Gear-verb test.** For each tier-3+ gear piece: does removing it change *which actions the player takes* (not just damage numbers)? Log action distributions with/without the piece across seeded fights. If the distribution is identical, it's a stat stick.

5. **Payoff-coverage test.** Every path must contain ≥1 payoff ability reachable by day 30 in sims. A path whose payoff never appears in winning runs is decorative.

6. **Player-legibility spot check.** Show a mid-run 6-slot loadout to a reader (Steve) with colors/names only — can they name the build? If not, the visual language is failing (Dead Cells bar).

---

## Sources

- MTG draft archetype / enabler-payoff signposts: https://mtg.wiki/page/Draft_archetype
- Slay the Spire 2 Silent archetypes (poison/shiv/sly): https://kotaku.com/slay-the-spire-2-tips-tricks-beginner-deckbuilding-2000680050
- Spire 2 Silent builds & relic synergies: https://www.pcgamesn.com/slay-the-spire-2/silent ; https://www.escapistmagazine.com/news-slay-the-spire-2-silent-deck-guides-shiv-poison-and-sly-builds/
- Hades duo boons & build guide: https://gamerant.com/hades-best-duo-boons-guide/ ; https://kotaku.com/tips-for-playing-hades-1845096466
- Supergiant on iterating boons / "new homes": https://www.gamesradar.com/games/hades-2-guide/ ; https://www.pcgamer.com/games/roguelike/hades-2-lead-says-they-didnt-nerf-the-games-most-popular-boons-but-rather-found-new-homes-for-them-during-early-access-development/
- Isaac postmortem & McMillen design philosophy: https://www.polygon.com/features/2018/5/15/17345246/the-past-present-and-future-of-the-binding-of-isaac/ ; https://www.moddb.com/games/binding-of-isaac/news/raw-meat-game-design-tips-from-team-meats-edmund-mcmillen ; https://www.gamesradar.com/the-creator-of-one-of-the-most-popular-roguelikes-of-all-time-is-using-his-new-project-to-right-11-year-old-wrongs/
- Roguelike deckbuilder dev roundtable (builds, broken-is-earned): https://cms.ggrecon.com/articles/roguelike-deckbuilder-roundtable-interview/
- Spire archetype depth (AV Club): https://www.avclub.com/roguelike-deckbuilder-slay-the-spire-adds-depth-wi
- PoE support gems (gear modifies abilities): https://deltiasgaming.com/everything-about-skill-gems-in-path-of-exile-2-explained/
- Diablo uniques changing skills: https://game-news24.com/2022/11/03/diablo-4s-unique-items-are-scaled-to-character-level-leading-to-debate-among-arpg-fans/
- Pool coherence / dilution (deck vs bag building): https://coopboardgames.com/blog/deck-building-vs-bag-building-why-the-same-draw-math-feels-completely-different/
