# The Oversight — Canon Manifest

Steve's designs, in his words, organized so nobody reinvents them from
scratch. **Read the relevant doc BEFORE building or changing anything in its
area.** If no doc covers your area, say so in your report instead of inventing
canon — inventing from scratch is how the disease roster got misclassified
twice in one day (2026-10-09).

## Design canon (read before building)

| Doc | Covers | Read it when touching |
|-----|--------|----------------------|
| docs/CORRUPTION.md | corruption, cannibalism slope, fear, psycho spawns | any corruption, cannibalism, fear, dark player content |
| docs/VISION.md | the game's thesis and tone | anything foundational |
| docs/DESIGN.md | systems design | new systems |
| docs/DIRECTIVES.md | Steve's standing orders (append-only) | always — it wins over inference |
| docs/DISEASES.md | disease roster: mundane vs alien pools, vectors, cures | any disease, vector, cure, diagnosis, monster-meat effect |
| docs/BEAR.md | the bear: the fight, butchering, fat, knowledge gating | bears, butchering yields, fat, trichinosis |
| docs/PRESERVATION.md | food ladder: cleaned→cooked→smoked→rendered→pemmican | smoking, rendering, pemmican, spoilage, food combining |
| docs/MONSTER-WAVES.md | wave law, escalation, tiers | monsters, waves, loot |
| docs/CONTESTS.md | the show: contests played not RNG | contests, challenges |
| docs/CONVERSATIONS.md | dialogue, talk, gossip | conversation UI, NPC talk |
| docs/PARTY.md | party dynamics, villagers | healer roles, villager treatment |
| docs/SYSTEMS.md | abilities, slots, deepening | abilities, synergies |
| docs/BALANCING.md | numbers, levers, targets | any balance change |
| docs/TIME-ECONOMY.md | ticks, day-parts, pacing | action costs, durations |
| docs/KIN.md | the Taking: half of adults taken at the Scattering, kids in stasis, return reserved for good table path | the taking, missing relatives, stasis kids, table kid-return |
| docs/MAP.md | one map: home board, beyond tiles, leg boards, macro map, region registry, way home | any map, travel, beyond-edge, leg-board, or way-home work |
| docs/FANS.md | the audience gets faces: named alien fan personas with arcs | fans, audience, care packages, fan clubs, table testimony |
| docs/ABILITY-REFUSALS.md | ability-action refusals (timing, button honesty, once-a-day day-roll) and pantry ledger accounting (closing, doors, span dedup, raid loot) | any ability refusal, button why, once-a-day gate, pantry number, ledger instrument |

## Standing rules that keep getting violated (read twice)

- **Two pools, never mix** (diseases): mundane = real diseases, alien = alien
  effects. See docs/DISEASES.md.
- **Human skills ≠ alien abilities** (Steve 2026-10-11): human skills are
  teachable earthly knowledge — occupations grant them as background, practice
  and discovery earn them, and they never take System slots. Alien abilities
  work like magic and come ONLY from the System (offers, trials, System
  milestones) into the 6 slots. Never confuse the lanes: no occupation teaches
  magic, no earthly skill is locked behind alien intervention. Canonical
  example: **purify** is magic — the System offers it (including a reactive
  offer when you're poisoned); no pharmacist teaches it. Canonical
  counter-example: **herbal_remedy** is a human skill — occupations grant it,
  the System doesn't need to.
- **Monster tiers ≠ loot tiers** (Steve 2026-10-07): separate concepts, never
  conflated in code, comments, or rules.
- **Monster encounters are fought, not rolled** (Steve 2026-10-08): blow-by-blow
  with real stats, never an outcome table.
- **Contests are played, not RNG** (Steve 2026-10-08): same class of rule.
- **Trust ≠ reputation** (break-it 2026-10-09): gossip/rumors move REP only,
  never trust.
- **"If you don't know, it doesn't show"**: knowledge gates every surface.
- **No silent actions.** Every action narrates honestly, including failures.
- **One mobile screen** (390×844): moment-to-moment play never scrolls.

## Change log

- 2026-10-09: manifest created after the disease roster was reinvented from
  scratch twice in one day. docs/DISEASES.md, docs/BEAR.md, docs/PRESERVATION.md
  registered as the first canon docs.
- 2026-10-11: docs/KIN.md — the Taking (Steve 2026-10-11): half of adults
  taken at the Scattering day zero, not after week one; taken half's kids in
  stasis; the System never confirms the taken dead or alive; kids' return
  reserved for the good galactic table path.
- 2026-10-28: docs/ABILITY-REFUSALS.md — refusal + pantry-ledger canon
  (sim-refusalcanon-b), grounded only in the 2026-10-27/28 refusal and
  ledger evidence arms plus landed code; closes tracker blank 5
  (no canon doc covered ability-action refusals or pantry ledger
  accounting). Still-open items live in the doc's §8, including the
  pantry-lift conversation line (Steve-call).
