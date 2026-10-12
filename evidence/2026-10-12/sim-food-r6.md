# Long-run sim — food economy ROUND 6: the knife in the pack (2026-10-12)

Lever 0: **food economy** — round 6. Territory: THE KNIFE (materials-gathering
behavior for the trapline).
Follows sim-food-r5.md (r5 made the trapline run end to end: 0/0 → 20 sets →
56 catches — but catches were almost never cleaned: sim scholars start
knifeless, stone+vine never coincide in the pack).

## The blank (as assigned)

r5's cleanCatch knaps a stone knife when the pack holds stone + vine — but
the knap-first path fired in unit tests (15/15) and ~never in sims. Stone
comes only from rubble-clearing, which the forage pattern never does; vine
arrives via foraging but gets eaten by snare crafts first. A real player
prioritizing the line would gather the stone. The competent policy didn't.

## The lever (policy, then two provable src predicate fixes)

`scripts/policies/competent.js` (all behind `COMPETENT_KEEP_KNIFE`, gate=`0`
restores byte-identical old behavior):

1. **keepKnife** (camp ritual, before workTrapline): when the knife is needed
   — uncleaned carcasses in the pack, trap materials held (snare known), or
   actively traplining — and no cutting tool is held, knap the universal
   stone knife FIRST (everyone's L3, stone + vine, 85%, durable — the recipe
   the game's own knifeless message points at). Runs before workTrapline's
   snare crafts so the durable knife wins the pack's vine race.
2. **stoneRun** (daily, before the forage trip): when the knife needs its
   stone half — (a) clear rubble on known roads, (b) route the forage trip
   TO rubble-blocked tiles first (stone-first sort), (c) expedition: push
   the unknown frontier (honest walkTo, real travel + encounter risk) up to
   3 pushes/day, re-scanning at each new ground. Clearing is the blockage
   card's own path: a day-part, 40 kcal, 1–3 real stone. Walk home always.
3. **Honest travel fix**: the trip passed `pick.blocked` as travelTo's FORCE
   arg — blocked paths were crossed for free. Now travels honestly.
4. **Vine preference**: when vine is the knife's missing half, prefer
   revealed thickets/groves (player-visible knowledge; fog keeps secrets).
5. **cleanCatch sweeps the kitchen counter** (found mid-round by probe):
   the homecoming pooling moves unprocessed hauls — carcasses included —
   from the pack to the prep stash. The r5 policy only swept the pack, so
   trapped carcasses rotted on the counter untouched. cleanCatch now also
   calls `Game.cleanCarcass(undefined, stash)` for stash carcasses (the
   game's own stash-clean path, same action, same knife).

`src/js/food.js` — **two provable src fixes** (predicates, not numbers):

1. `hasCuttingTool()` now checks equipped slots. The policy knaps the knife,
   then gears up — `equip()` moves it to `scholar.equipped.melee` — and the
   game forgot the scholar was holding it. Seed 11 probe: 27 trap catches, 0
   cleaned, the Stone knife equipped as a melee weapon the entire catch
   season (the scholar was literally striking wolves with it). An equipped
   knife is a held cutting tool; proven by sim, not by argument.
2. `hasCuttingTool()` no longer counts bonded sentimental keepsakes by name.
   Seed-44 probe: a bonded **"Knife roll"** (class: sentimental — a roll
   that HOLDS knives, not a blade) matched `/knife/i`, and the game believed
   the scholar was armed for **105 days** — zero knap, zero carcasses
   cleaned, while real carcasses rotted. Bonded items now only count when
   their item def is a real blade (class weapon/tool): a bonded Chef's
   knife still cuts — it's a knife. A Knife roll doesn't.

Exact numbers: nothing in src/ changed numerically. The 85% knap, 40 kcal
/ 32-tick clearing cost, 1–3 stone yield, stone_knife materials (stone 1 +
vine 1) are the game's own. Ontology re-validated: 85 systems, release
permitted.

## Before/after (identical seeds × 200d, gate 0 vs policy+fix)

**12 seeds** (11,22,33,44,55,66,77,88,99,111,222,333), competent policy.
Diag: scripts/diag-food-r6-20261012.js. Sweep: scripts/sweep-completion.js.
Analyze: scripts/analyze-r6-20261012.js. Reach: scripts/diag-reach-r6-20261012.js.
(Raw JSONs were regenerated mid-round after /tmp was wiped; final numbers
below are from the final code, worktree-side JSONs, since deleted.)

| metric (12 seeds × 200d) | before (gate 0) | after (policy+fix) |
|---|---|---|
| stone knives knapped | 0 | 3 (seeds 11, 22×2) |
| knap failures | 0 | 0 |
| rubble cleared / stone from rubble | 0 / 0 | 4 / 7 |
| knife held (% sampled days) | 41.0% | 40.9% |
| traps set / recipe crafts | 22 / 22 | 10 / 10 |
| dawn catches | 50 | 31 |
| trapped catches cleaned | 27 | 23 |
| catch→cleaned conversion | 54.0% | 74.2% |
| all carcasses cleaned | 31 | 27 |
| stash (counter) cleanings | 0 | 27 |
| spoil kcal / run-day | 3,910 | 3,438 |
| hungry-day share | 15.7% | 17.9% |
| median / max survival | 95d / 200d | 84d / 176d |
| survived the horizon | 1/12 | 0/12 |
| wave reach (max) | 9×w3, 3×w2 | 9×w3, 3×w2 |
| arc reach (max) | 12×Arc 3 | 12×Arc 3 |
| national / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |

Death causes (12 seeds): before — combat 82, villager combat 26, monster
20, starvation 7, wounds 5, contests 4, ambush 1, sickness 2, Focus Group 1,
thirst 1. After — villager combat 40, combat 69, monster 23, starvation 6,
wounds 3, contests 2, Highbeam Deer 1, wound_fever 1, sickness 1, Focus
Group 1. Combat-led both sides; starvation flat (7→6).

Income by source (12 seeds): Garden 1.82M→1.86M, Fish 1.58M→1.33M, Foraged
0.51M→0.47M, Expedition 0.07M→0.08M, Snared meat ~0.01M→~0.00M. The garden
is the granary; the trapline is garnish — as the fiction says it should be.

Reading the table honestly:

- **The knife now exists.** 0→3 knaps, 4 rubble clearings, 7 honest stone.
  The 85% knap never failed in sims. Knife-held share is flat (41.0%→40.9%)
  because the bonded fix *removed* ~105 false-positive "armed" days per
  affected seed while knapping *added* real ones — the number is honest now.
- **The counter fix is the round's real catch.** Trapped conversion
  54%→74%, and 27 stash cleanings that were previously pure rot. Seed 11:
  27 catches → 23 cleaned (25 of the cleanings came off the kitchen
  counter). The r5 "catches rot" blank is closed for the policy's hands.
- **The lever has a cost.** Traps set 22→10, catches 50→31: stone-run
  days are days the trapline isn't walked. Hungry-day share ticked up
  (15.7%→17.9%) and median survival slipped (95d→84d). The death-cause
  shape didn't move (combat-led, starvation flat) — this reads as noise
  plus a real small time-tax, not a balance break. Twelve seeds can't
  separate the two; the mechanism (fewer sets) is real, the survival delta
  is within the band.
- **Reachability didn't move** (see verdict below) — expected: this lever
  is about the trapline's last mile, not the win chain.

## Proof tests

- scripts/test-knife-keep-20261012.js: **45/45** —
  gate-off legacy (force-through preserved, no roadwork), proactive
  knap-first, rubble stone run (40 kcal, 1–3 stone, blockage gone), held
  knife kept (no re-knap), vine preference (thicket over meadow,
  fog-honest), idle policy conjures nothing, dedicated stoneRun,
  expedition finds distant rubble and walks home, **equipped knife counts
  as a cutting tool and cleans a carcass** (T10, the src fix), **bonded
  Knife roll is NOT a cutting tool** (T11), **bonded real knife still
  cuts** (T12), **stash carcass cleaned via cleanCarcass(undefined,
  stash)** (T13), **a full daily cleans the counter's trapped carcass**
  (T14).
- Regressions: test-trapline-set-20261012 15/15, test-trapline-20261011
  29/29, test-aid-pipes-20261012 11/11 — all re-run on final code, green.
- Pre-existing failures (verified on base 5ae9a5f4, unrelated):
  test-hunter-knife.js 13/14 ("cleaning yields 4 portions"),
  test-meat-flow.js FATAL at line 112.

## Sense-testing

Transcript capture: scripts/sense-knife-r6-20261012.js (3 seeds × 200d,
every Game.say matching knife/knap/stone/rubble/carcass/clean/snare/trap).
Read in full. What it shows:

**The knife beat lands.** Day 1 opens with the game's own tutorial memory
— *"📖 Your hands remember: knap a Stone knife (stone + vine) — the oldest
tool there is. Find the stone."* — and on seed 11 the policy lives it:
d7 *"You clear the rubble, stone by stone. The path is clear."* →
*"You pocket 2 good throwing stones. (sling ammo)"* → *"You make a Stone
knife. flint knapped to an edge, bound with vine. cuts meat, wood, cord."*
→ *"Equipped Stone knife (melee)."*
Then d8: *"You STRIKE the heron for 23 (Stone knife)."*
The arc reads exactly like a player learning the line: the tutorial
promise, the roadwork, the knap, the weapon. The rubble narration and the
craft narration sit one line apart and agree with each other.

**The trapline has villagers in it.** Sujon is the village trapper:
*"A person, maybe 40s, with calloused knuckles heads out to check the
snares. 'Wire doesn't lie.'"* … *"🪤 Sujon is back. 'Snares were empty.
They'll keep.'"* … *"🪤 Lena is back from the snares: +114 kcal to the
pantry."* Teaching happens in public: *"🪤 Sujon catches you watching the
snares come off the line. '...Want to actually SEE one?' They show you —
the loop, the trigger stick, where the run narrows between the roots.
'Opossum trails. Check at dawn. Always.' Your hands don't know it yet.
Your eyes do."* The knowledge economy is visible: watching teaches
(Recipe: Snare L1), showing teaches (Emma↔Carmela, three tries).

**Repeats (documented, not fixed — lever 3's territory):** the trapper
beats are verbatim loops — *"Wire doesn't lie."* ×17, *"Snares were empty.
They'll keep."* ×several, *"X is showing Y how to tie a snare. Hands
patient. It takes three tries."* ×21. Good lines, but Sujon says the same
sentence on d1, d4, d5, d11, d12, d17. Dialogue variety is the agency
lever's blank; the lines themselves are coherent and in-character.

**Honest rot, honestly told.** Uncleaned carcasses rot in the open:
*"On the carcass nearby, White Noise (carcass) went bad — maggots, smell,
the whole sad story. Leaving it had a cost."* The cost-of-neglect moral
is stated every time, never silently. When the scholar takes a carcass
they can't clean, the game says so 20+ times a day — *"Nothing edible.
(Nevermore (carcass) — not food yet: A carcass. Clean it with a knife —
quickly. Spoils fast..)"* — honest, but the identical line 62 times
across three carcass-days is noise. Narration dedupe is a game-side
blank (not this lever).

**The seed-44 story (the bonded fix, proven in transcript):** scholar
starts with a bonded Knife roll (a keepsake: *"His. Eight knives, every
edge shaving-sharp — 'a dull knife is a tired cook.'"*). Pre-fix the
predicate counted it as a blade: 105 "armed" days, zero knap, carcasses
taken and left to rot while the game believed the scholar held a knife.
Post-fix the roll is a roll and the scholar is honestly knifeless. The
fiction even agrees — it's a roll that *holds* knives, and no system ever
lets you draw one.

## Reachability verdict

12 seeds × 200d, competent policy, after-code (sweep + diag-reach):

- **Waves:** 9/12 reached wave 3, 3/12 wave 2. **No wave 4/5 on any seed.**
  Wave 1→2→3 pacing is intact; waves 4–5 are unreachable at this horizon
  (same as r5's 24-seed batch: 0 wave 4+).
- **Arcs:** 12/12 reached Arc III. **No Arc IV.** The sweep's gateMiss
  names the blocker: among Arc-3 runs, the unmet Arc-IV gate is **feast**
  on 12/12 (breadth 0, stage 1, sentiment 0). The feast gate is the wall.
- **Scale:** all 12 runs stayed **village** rank the full horizon — never
  regional, never national. (Consistent with the alignment note: the
  scale on-ramp is the binding wall.)
- **Vests:** 2/12 seeds acquired a vest (military/swat) — reachable, rare.
- **Succession:** 2–7 bearer successions per run — young-link succession
  works; villages persist through scholar deaths.
- **Table / win:** 0 table seatings, 0 wins on 12/12.

Verdict: waves 1–3, Arc II/III, and vests are reachable and live. Wave
4–5, Arc IV, regional+, the table, and the win are **decoration at the
200-day competent-policy horizon** — the content exists (the endgame build
landed with proof tests) but no sim path reaches it. The binding
constraints are the feast gate (Arc IV) and the scale on-ramp (regional+),
both outside this lever's territory.

## Village assessment (plain words)

The village is a garden-and-fish commune with a trapline hobby. Across 12
seeds the pantry filled from gardens (1.86M kcal) and fish (1.33M), with
foraging (0.47M) as the third leg; the player's snare line contributed a
few thousand kcal total — dinner's garnish, exactly as the fiction frames
it. Spoilage runs ~3,400–3,900 kcal per run-day, ~95% of it fresh rot: the
bind is the glut rotting faster than the racks can smoke it, not the racks
overflowing. The scholar went hungry ~16–18% of sampled days.

Who thrived: Sujon-style villagers with real jobs — the trapper whose
snares put +114/+364 kcal into the pantry, the water crews, the teachers
(Emma showing Carmela the snare knot, three tries). Villagers teach,
learn, haul, and gossip; the knowledge economy is the village's circulatory
system. Who died: almost everyone, eventually, in combat — scholars and
villagers alike (combat + villager-combat + monster ≈ 85% of deaths).
Starvation killed 6–7 across 12 runs: a real pressure, not the reaper.
Villages persisted through 2–7 bearer successions per run — the village,
not the scholar, is the protagonist, and the sims play that way.

What was missing: a knife in the scholar's hand (filled — knapped 3×,
honest stone from real rubble), a predicate that knew an equipped blade
from an empty hand (filled), a predicate that knew a keepsake from a tool
(filled), and hands for the kitchen counter where the game's own homecoming
pooling stages carcasses (filled — 27 counter cleanings). What remains
missing is reachability, not food: no seed left the village rank, no seed
passed Arc III's feast gate. That's the next wall, and it's not a food
lever's wall.

## Blanks: filled / documented

**Filled this round:**
1. Materials-gathering behavior for the trapline (the assigned blank):
   keepKnife + stoneRun + honest travel + vine preference, all gated,
   proven 45/45.
2. Equipped knife forgotten by `hasCuttingTool()` (src predicate, proven
   by sim seed 11).
3. Bonded "Knife roll" counted as a cutting tool (src predicate, proven
   by sim seed 44: 105 false "armed" days → 0).
4. cleanCatch blind to the prep stash — the homecoming pooling moves
   carcasses to the kitchen counter; 27 counter cleanings recovered
   (trapped conversion 54%→74%).

**Documented (not this lever):**
1. Trapper dialogue repeats verbatim ("Wire doesn't lie." ×17, "It takes
   three tries." ×21) — lever 3 (villager agency) territory.
2. "Nothing edible" carcass spam ×62 across three days — game-side
   narration dedupe blank.
3. Seed 44's scholar never learned the snare recipe and never traplined —
   knifeNeeded's triggers are trapline-scoped by design; a weapon-knife
   mandate (knap for self-defense alone) would be a design call.
4. Seed 22 knapped twice in one life — the knife left the pack somehow
   between knaps (not investigated; unit test T5 covers the held case).
5. Reachability: wave 4–5, Arc IV (feast gate), regional+ (scale on-ramp),
   table, win — unreachable at 200d; documented with numbers above.
6. Pre-existing test failures: test-hunter-knife.js 13/14,
   test-meat-flow.js FATAL — verified present on base 5ae9a5f4.

## Design calls for Steve's overrule

Exact numbers, all the game's own except where noted:

1. **85% knap** on the universal stone knife (the game's recipe rate;
   blind L1 would be 35% — everyone starts at L3, so 85% always applied;
   0 failures in sims).
2. **40 kcal / 32-tick clearing** for rubble (the blockage card's own cost;
   yields **1–3 stone**, the card's own yield).
3. **Expedition cap: 3 pushes/day** when the knife needs stone (policy
   number — a real player wouldn't walk the whole map every day either).
4. **Vine race ordering**: keepKnife runs before workTrapline's snare
   crafts in daily(), so the durable knife wins the pack's vine (policy
   ordering, reversible).
5. **Bonded keepsakes don't cut** (src predicate): a bonded item counts as
   a cutting tool only if its item def is class weapon/tool AND matches the
   blade name pattern. A bonded Chef's knife still cuts; a Knife roll
   doesn't. If Steve wants keepsake knives to be usable blades, say so —
   the fiction ("eight knives, every edge shaving-sharp") could go either
   way, and the call is his.
6. **cleanCatch sweeps the prep stash** (policy): the counter is the
   game's own staging area for unprocessed hauls; cleaning there is the
   same action with the same knife. No src/ change needed — the game
   already supported `cleanCarcass(idx, stash)`.

No `[needs-eyes]`: no feel, combat, or UI changes — policy behavior plus
two predicate corrections. Nothing for Steve to playtest on his phone.
