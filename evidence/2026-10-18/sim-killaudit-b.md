# sim-killaudit-b — kill-side audit on current master (2026-10-18)

Diagnostic arm, loop B food-economy axis, run fleshout-loop-b-20261018T0830Z.
Answers the fatpipe-b NAMED NEXT: **why do boar/bear never enter the
village's orbit** (trap species table, hunt-duty staffing, bear-hunt
feasibility)? Census of every kill channel on current master.

## Canon read (BEFORE sims)

- docs/CANON.md: ladder cleaned < cooked < smoked < rendered < pemmican;
  human skills ≠ alien abilities.
- docs/BEAR.md: separable fat bear 6 / boar 3 / javelina 2 slabs (~20% of
  gross); bear is a NON-MONSTER MONSTER FIGHT (bow > spear > knife > bare
  hands; maul 8-17 at range <= 2); render/pemmican are L4 deep knowledge.
- Trap species table (src/data/recipes.json): snare catches
  rabbit/squirrel/opossum; **pit_trap catches deer/deer/BOAR/raccoon/opossum**
  — the only trap that can take boar; NO trap catches javelina or
  black_bear (by canon the bear is a fight, not a trap target).
- Hunt duties resolve via Game.villagerHuntResolve — a REAL animal from a
  REAL tile's wildlife, huntAnimal's chance machinery with villager inputs.
- Regional fauna (src/data/regions.json): wild_boar in Eastern Woodlands
  pool; black_bear in Eastern Woodlands; javelina ONLY in na_arid
  (Southwest Drylands).

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- PRIMARY: >= 90% channel attribution — every kill on the sweep (and the
  boar/bear absence) traced to a kill channel + engagement outcome; plus a
  named, spec'd lever for the next loop: the file(s) it touches, its GO
  bar, its horizon, its metric, and the measured encounter rates it stands
  on. If instead a genuine wiring defect is found and fixed, the verdict
  is GO-on-fix with a before/after proof test.
- Channels: trap (checkTraps→foodCarcass 'trapped'), hunt
  (villagerHuntResolve — layer + task-lead paths), emergency
  (safetynets relief hunt, flat kcal), monster (tele death kind='monster'),
  scholar (huntAnimal).
- Cross-check: every CLEANED carcass (carcassToMeat/askSpecialist) must
  trace to a captured kill within its ~2d spoil window; leak share < 10%.
- SEEDS: 105101-105104 (fresh; checked against all evidence/ seed lists
  2026-10-16..18 — no collisions).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0
  EXPLICIT; HUNTSTAFF unset = OFF = default substrate).
- HORIZON: 180d death-aware (engine tail). 8 runs (4 seeds x 2 policies);
  extend to 16 only if attribution < 90%.
- INSTRUMENT: scripts/killaudit-census-b.js (new; all wraps read-only —
  counters + event lists, zero RNG draws, zero game-state writes; wildlife
  snapshot reads only tiles already carrying t.wildlife).
- INSTRUMENT HONESTY: scripts/test-killaudit-b.js — PART A RED fixture
  14/14 + RED exact, PART B det-gate 8/8 byte-identical 60d trajectories
  instrument-on vs off. Re-verified on current master before spend.
- COMPLETION GATES: 8/8 runs complete, schema-clean output, 0 instrument
  errors, >= 90% attribution.
- Sense-testing (law): sample hunt/trap narration from the beat corpus
  (2+ reads); judge hunters-as-people.
- §15 balanced panel: N/A — diagnostic census, single substrate, no
  lever, no before/after.

## Results

COMPLETION GATES: 8/8 runs complete, 0 instrument errors, 8/8
schema-clean per-seed JSONs (evidence/2026-10-18/perseed-killaudit/).
Proof: scripts/test-killaudit-b.js ALL GREEN on current master
(PART A 14/14 RED-verified, PART B det-gate 8/8 byte-identical 60d,
0 errors).

1,281 run-days (median survival 180d capped, max 180d).

### PRIMARY — 100% channel attribution (bar was 90%)

292 kills captured; every one lands in a channel with an outcome:

| Channel | Kills | Outcome mix |
|---|---|---|
| monster (villager field-fight kills) | 251 | kill × 251 |
| trap (snare catches) | 41 | kill × 41 |
| hunt (duty resolves) | **0** | — |
| emergency (safetynets relief) | **0** | — |
| scholar (huntAnimal) | **0** | — |

- 41/41 cleaned carcasses traced to captured kills (leak share 0%,
  unattributed 0).
- Trap catches by species: cottontail_rabbit 28, gray_squirrel 13 —
  ALL small game. pit_trap catches: 0.
- Monster kills by species: all alien, all with butcher.fat == null
  (hummice 23, hushwolf 22, giant_mosquito 11, mirrormoth 11, alien_tick
  10, … — 43 distinct alien species, 0 animals).
- **boar kills: 0. bear kills: 0.** Across 1,281 run-days, every kill
  channel, both policies.

### The boar/bear absence, fully explained (no mystery left)

1. **AVAILABILITY: they are everywhere.** 127 wildlife snapshots:
   wild_boar on the map 125/127, within 3 tiles of Haven 122/127
   (~2.8 near tiles per snap); black_bear on the map 127/127, near
   Haven 127/127 (~11.4 near tiles per snap). Javelina: 0/127 snaps —
   region-locked to na_arid (Southwest Drylands); games land in the
   Eastern Woodlands. By regional design, not a bug.
2. **TRAP CHANNEL: boar's trap is never armed; bear has no trap.**
   trapsSet over 8 runs: snare × 22, pit_trap × 0, all others × 0.
   The competent policy only ever crafts+sets the SNARE
   (competent.js:1621 `Game.craft('snare')`); pit_trap is in
   TRAPLINE_IDS (it would be set if held) but is never crafted — a
   policy-side staffing omission, exactly the class of the 2026-10-17
   huntduty finding. The data is honest: pit_trap's catches include
   wild_boar (fixture-proven: a pit on boar ground caught a wild_boar
   carcass, `meat_wild_boar:trapped`). NO recipe catches black_bear —
   per BEAR.md canon the bear is a FIGHT, not a trap target, so the
   intended bear channel is the hunt duty.
3. **HUNT CHANNEL: silent in this substrate.** huntResolves = 0,
   huntAssigns = 0, new hunt task-leads = 0 over 1,281 run-days.
   The machinery is wired (villagerHuntResolve's prey pick provably
   includes black_bear from real tile wildlife — fixture-verified;
   the huntstaff policy exists and is landed but DEFAULT-OFF).
   The hunter substrate exists (~0.6 hunter-competent villagers/seed
   per sim-huntroster-b) — it is simply never asked.
4. **EMERGENCY HUNT: 0 fired** (species-free flat kcal anyway — it
   could never produce a boar/bear).
5. **ENGAGEMENT RATE: unmeasurable — nothing ever engages.**
   0 boar engagements, 0 bear engagements, 0 kills, 0 escapes.
   Bear-hunt feasibility (canon: hard difficulty, maul 8-17) is
   untested in live sims because no hunt ever reaches the chance
   machinery.

VERDICT: **NO engine wiring defect found.** Both animal channels are
wired end-to-end when armed (pit_trap→boar fixture green;
bear-in-prey-list fixture green; the render ladder itself was proven
working by the fatpipe RED fixture). The absence is a staffing
omission on two layers: (a) policy never crafts pit_trap, (b) no
hunt-duty staffing in the default substrate. Diagnostic-complete —
no fix landed (no defect to fix), no §15 panel (no before/after).

### Reachability verdict

- Content reachable this corpus: national 6/8, table 7/8, wave-4 7/8,
  wave-5 0/8, exiled 0/8, wins 0/8.
- Boar/bear meat and the fat ladder remain UNREACHABLE — not gated,
  simply never supplied (third run confirming the supply-starved
  chain: huntduty-b → huntstaff-b4 → fatpipe-b → this audit).

### Death profile (kind-filtered per tooling caution #525)

119 deduped person/villager deaths: combat 54, monster 50, wound-chains
4, starvation 2, contest 2, misc 5. Consistent with prior corpora —
combat + monsters do the killing, not starvation. No 'villager combat'
person-death cause exists in this corpus (the b3 pollution class stays
clean).

## Village assessment (plain words)

The villages here are fortified rabbit-trappers under siege. The
trapline is the one honest food machine: the snare line catches 41
rabbits and squirrels over the corpus, and the narration reads like a
real line — catches named with kcal and rot warnings, shyness narrated
honestly ("This ground has learned your trap. Rest it, or move the
line."). Meanwhile boar root in the thickets three tiles from Haven
and bears amble through the grove — the wildlife snapshots show both
species within a day's walk, every day, all run — and nobody goes
after them. The hunter-substrate villagers (the Thornfield hunter who
joined in sim-huntduty-b's fiction and found no hunt) sit in the
roster with their word-list and nothing to do. The villages die the
way they lived: combat 54, monster 50. This is a village that has
forgotten — or never staffed — the verbs that would let it eat big
game. The blank is not in the fiction's heart; it's in the labor
ledger.

## Sense-test (SENSE-TESTING LAW)

Read 1 (belongfeast-105101 d18-d37): trap narration — VERDICT sensical.
Catches name species, gross kcal, and the rot clock; the shyness system
narrates its own decline honestly. It reads like a trapper's week, not
a probability table.
Read 2 (corpus-wide): hunt narration — VERDICT absent, and the absence
is the finding. 0 hunt duties fired in 1,281 run-days, so no hunt
fiction exists to judge; the fiction talks hunting (challenges,
duties, the tired hunter) but no villager ever holds the duty.
Read 3 (belongfeast-105101 d18-d22): trap shyness beats — VERDICT
sensical; the ground "learning" the trap reads as cause-and-effect a
player could plan around.
Hunters-as-people: unjudgeable — nobody hunts.

## Named lever spec for the next loop

Two policy-side arms (policy-side arms are always safe together —
no game-code interaction; both are staffing-only). This is the
mechanism the fatpipe-b blank needs: kill-side fat supply.

**ARM 1 — sim-pitstaff-b: pit-trap staffing**
- Files: scripts/policies/competent.js (workTrapline: craft pit_trap
  when lean-day + snare knowledge L1+), gated on env PITSTAFF=1
  (default OFF, mirror of HUNTSTAFF). ZERO src/js changes.
- Stands on: pit_trap catches wild_boar (data, fixture-proven this
  run); boar near-Haven 122/127 snaps (~2.8 tiles); traps already
  fire on 322/1,281 trap-days via the snare line.
- GO bar: >= 4 boar catches corpus-wide over 8 runs (4 seeds x 2
  policies) AND >= 12 fat slabs generated (boar 3/slab × 4).
- Horizon: 180d death-aware. Metric: boar kills + fat slabs generated
  (fatpipe Q2); guardrail: per-pair survival |Δ| <= 20d (noise-scaled).
- Seeds: 105101-105104 (this audit's corpus = the clean baseline).

**ARM 2 — sim-huntstaff-b5: hunt-duty staffing for bear/boar
engagement**
- Files: scripts/policies/huntstaff.js (already landed; HUNTSTAFF=1).
- Stands on: bear near-Haven 127/127 snaps (~11.4 tiles);
  villagerHuntResolve bear-eligible (fixture-proven); hard-difficulty
  engagement chance 0.15+mods (measured per-engagement: aids,
  kills, escapes).
- GO bar: >= 1 bear engagement AND >= 1 boar engagement corpus-wide
  (the bar is the mechanism firing, not a kill count — bear is hard);
  report engagement outcomes (kill/escape/empty) as the bear-hunt
  feasibility measurement.
- Horizon/metric/guardrails/seeds: same as ARM 1.
- Follows the b4 hunter-fate instrument (wound-chain attribution —
  findings #535).

## Metric review (mandatory)

- PRIMARY (>=90% channel attribution + named lever spec) MET as
  framed: 100% kill attribution (292/292), 0% carcass leaks (0/41),
  boar/bear absence explained with numbers (availability,
  engagement, outcome), named two-arm lever spec with files, GO
  bars, horizon, metric, and the measured encounter rates it stands
  on. No metric re-scored mid-run; no §14 event.
- §15 balanced panel: N/A (diagnostic census, single substrate, no
  lever — no before/after to compare).
- Instrument limitation (not a metric miss): kill attribution covers
  kill channels; garden/fish/forage food is out of scope by design
  (not kills). Hunt beats corpus is trap-only — hunt narration is
  unjudgeable while the duty never fires.
- Seeds 105101-105104 confirmed fresh against all evidence/ lists
  2026-10-16..18.
- TELEMETRY: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-10-18/perseed-killaudit/*.json' --metrics
  national,table,wins,exiled` returned 3 LOUD lines ("national/table/
  wins disappeared: baseline -> current 0"). NOT a game regression:
  my per-seed JSONs nest wall metrics under `wall` as
  {maxRank, table, exiled, ...} while the checker expects top-level
  `national`/`table`/`wins` booleans — a schema mismatch, self-caused.
  The corpus's actual wall numbers (computed from the files):
  national 6/8, table 7/8, wins 0/8, exiled 0/8, wave-4 7/8,
  wave-5 0/8. Next census run: emit top-level national/table booleans
  to match the checker contract.

## Findings backlog note

- [open] 2026-10-18 — food/kill-channels — KILL-SIDE AUDIT: BOAR/BEAR
  ABSENCE FULLY ATTRIBUTED TO STAFFING OMISSIONS, NO WIRING DEFECT
  (loop B sim-killaudit-b, run fleshout-loop-b-20261018T0830Z,
  evidence/2026-10-18/sim-killaudit-b.md, 8-run census 105101-105104
  x {leadfeast,belongfeast}, FEASTSCALE_R13=1/SEATDRIVE=0,
  HUNTSTAFF unset=OFF, master verified by probe, instrument-honest:
  det-gate 8/8 byte-identical 60d, RED fixture 14/14): 292 kills
  100%-attributed (monster 251 all alien no-fat, trap 41 all
  rabbit/squirrel, hunt 0, emergency 0, scholar 0); boar kills 0,
  bear kills 0 over 1,281 run-days. Boar/bear abundant in the
  village's orbit (wildlife snaps: boar near-Haven 122/127, bear
  127/127). Cause: competent policy only ever crafts+sets snare
  (pit_trap 0/8 runs — the only boar trap never armed); no hunt
  duties fire (huntstaff landed but default-OFF; 0 task-lead hunts);
  NO recipe catches black_bear (canon: bear is a fight, hunt-duty
  channel). Fixtures prove both channels wire end-to-end when armed
  (pit->boar carcass; bear eligible in villagerHuntResolve prey).
  Javelina 0/127 snaps: region-locked to na_arid, games land in
  Eastern Woodlands — by design. NAMED NEXT (unchanged, now spec'd):
  sim-pitstaff-b (pit-trap staffing, competent.js, PITSTAFF=1) +
  sim-huntstaff-b5 (bear/boar engagement measurement, HUNTSTAFF=1),
  both policy-side, seeds 105101-105104 as the clean baseline.
  Deaths: 119 deduped person (combat 54, monster 50, starvation 2).
