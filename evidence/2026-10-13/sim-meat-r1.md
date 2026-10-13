# sim-meat-r1 — monster-meat discovery audit (2026-10-13)

Long-run sim loop, scale-wall r10. Lever 0 (food economy) AS A LENS on the scale wall.
Policy work only — no game-code changes. No [needs-eyes] (no feel/combat/UI change).

## Pre-registration (MEASUREMENT.md §11 — written BEFORE running)

- **Primary metric:** monster-meat kcal as share of village food inflow —
  `meatPotentialK / totalInfluxK` (net harvested potential at standard 40%
  butcher yield, over stockPantry + Player-donation influx). Secondary:
  player-eaten monster-meat share, discovery count by path, sickness cost.
- **GO threshold (pilot gate):** after-side (meatseek) meat share ≥ 5% AND
  ≥ 4 species discoveries across the 4 pilot seeds — obvious in the raw
  numbers, no statistics. (Baseline expected ~0: r5 measured 55 kcal/kill
  avg because competent never cautious-tests.)
- **Horizon:** 150 days, death-aware (dead villages stop simulating). §10:
  reachability-scale lens — national needs the ~day-76+ rung gate; recent
  baselines show median survival 51–69d, so 150 covers the ambition window
  without ticking dead villages to fill time.
- **Seeds:** 11, 22, 33, 44 (identical seeds before/after).
- **Policies:** competent (baseline) vs meatseek (competent + one cautious
  flesh-test/day via Game.testMonsterMeat — the designed 32-tick cost,
  toxic flesh pays -30 energy; villager fireside experiment + Codex paths
  stay engine-driven and are instrumented, not faked).
- **Convergence state:** pilot → GO means confirm spend (12 seeds); pilot
  miss means killed-at-pilot.

## Canon read

- docs/CANON.md + docs/PRESERVATION.md (cleaned→cooked→smoked ladder,
  blind penalties, portion law) + docs/BEAR.md (carcass/cleaning canon,
  trichinosis). DISEASES.md noted: the cautious meat test's designed cost
  is -30 energy on toxic flesh, not a disease roll (disease comes from
  EATING raw/untested flesh — RISK.rawMeat — which neither policy does).
- Monster edibility roster (src/data/monsters.json): 17/59 edible-positive
  (median 1000 kcal, max 4500 "The Eater" wave 4); 42 zero-calorie "do not
  eat". Mechanic chain verified in code: kill → corpse holds
  monsterMeatEntry (foodState 'carcass', edible:false, hiddenKcal) → loot as
  action → cleanCarcass → cleaned unknown flesh (edible:false, kcalEach:0)
  → testMonsterMeat (player) / villagerExperimentBeat (NPC, once/day at
  haven when present, plant-lumps first) / Codex → markMonsterFoodSafe
  reveals pack+stash (edible:true, honest kcal). Cook skips unknown flesh
  (cookFood: `if (isMon && !monsterFoodSafe) continue`) — discovery is the
  full gate, by design.

## The lever (policy-side, scripts/policies/meatseek.js)

One unknown flesh type per day via Game.testMonsterMeat, run after the
day's work. Honest: 32 ticks, toxic → -30 energy + codex POISON (never
food again). Discovery is per-species — one test feeds the village forever.
Proof: scripts/test-meatseek-r1.js (5/5 green).

## Results (pilot, 4 seeds x 2 policies, 150d death-aware, seeds 11/22/33/44)

**GO/NO-GO: KILLED AT PILOT.** Pre-registered GO needed meat share ≥ 5%
AND ≥ 4 discoveries. Discoveries met (5 vs 2 baseline); share missed by
two orders of magnitude (0.01% vs 0%). Per §9 kill rule: no confirm spend.

| arm | medD | nat | tab | won | exiled | maxWave | wave45 | meat share | eaten share | discoveries (npc) | player tests |
|---|---|---|---|---|---|---|---|---|---|---|---|
| competent | 82 | 0/4 | 0/4 | 0 | 0 | 3 | 0/4 | 0% | 0.01% | 2 (2) | 0 |
| meatseek | 74 | 0/4 | 0/4 | 0 | 0 | 3 | 0/4 | 0.01% | 0.02% | 5 (1) | 4 |

### (a) Share of village food from monster meat: ~0% either way

The discovery lever moved discovery, not food. The binding constraint is
UPSTREAM of discovery: the kill→carcass→cleaning pipeline.

- Edible kills happened: 64 carcasses (gross 42.6k kcal) on competent,
  71 (gross 44.0k) on meatseek — ~70% of all kills were edible-positive
  monsters (13 species: 52 hummice, 21 hushwolf, 15 mirrormoth, 12
  nightlight_catfish, 8 belltoad, 7 lockpick_raccoon, 4 bulldozer @3200,
  4 sunbasker, 4 nevermore, 3 nightcourt, 2 gallowdeer @2800, ...).
- **97% of it rotted on corpses**: corpseRot 41.5k / 42.6k kcal.
  Mechanic: the carcass sits on the corpse (loot-as-action, by design),
  spoils in 3 days (sweepSpoiled runs on corpse inventories), and
  corpseTakeItem is RANGE-gated (`_corpseCheckRange`) — the policy loots
  at day-end from haven, but the kills happened on wild tiles (villager
  field fights, patrol kills "out there"). The meat dies where it fell.
- What reached the village: potential harvested 0.0–0.1k, revealed
  0.2–0.5k (hummice 75, nightcourt 90, lockpick_raccoon 90,
  nightlight_catfish 100, hushwolf 140), eaten 0.1–0.2k.
- Steve's correction is vindicated in CODE (the discovery chain works
  end to end) but not in OUTCOME: under any policy that doesn't haul
  carcasses from the field, monster kills are still not a food source —
  not for lack of discovery, for lack of logistics.

### (b) Discovery happens — with or without the player testing

- Baseline competent (NEVER tests): 2 species discovered, both by the
  NPC fireside experiment beat (villagerExperimentBeat, once/day at
  haven when present, unknown plant lumps first then unknown flesh).
- meatseek: 5 species (4 player cautious-tests + 1 NPC). First
  discoveries at days 44–47; the chain waits for (1) an edible kill,
  (2) the carcass to be looted in range and cleaned before rotting,
  (3) a test day. Discoverer on seed 44: Carlos (Loud-Eyes flesh) via
  the NPC beat; the player tested Old Gavel, Nightlight, hushwolf flesh.
- **Cost: zero disease.** All 3 sickness events across 8 runs were
  wound-related (lockjaw "a dirty cut", wound fever "a cut gone wrong"),
  identical across arms. The test chain's designed cost is energy-only
  (-30 on toxic flesh; no toxic tests fired — all 8 belltoad carcasses
  rotted on corpses, which is arguably the design working).
- Per-species permanence held: one test revealed the species for the
  whole village (pack + prepStash reveal via markMonsterFoodSafe).

### (c) Scale-wall numbers: unmoved

national 0/4, table 0/4, wins 0, wave 4–5 unlocks 0, median survival
82d → 74d, exiled 0 both arms. The food lever cannot touch the wall
while the carcass logistics gap eats 97% of the meat before discovery
even matters.

## Sense-test (transcripts — SENSE-TESTING LAW)

The discovery events read as village feeding moments, not number ticks:
- Player test: "You set aside time with the Old Gavel flesh. Look, smell,
  touch — then the smallest taste, and wait... It sits fine. The Old
  Gavel is food. You know it in your gut, literally." Knowledge-gated
  descriptor names (Old Gavel, Loud-Eyes, Nightlight), never true names.
- NPC test: 'Carlos sets aside time with the Loud-Eyes flesh... "It's
  food," Carlos tells the fire. "You know it in your gut. Literally."'
  Named villager, attributed in the Codex (foodTestedBy).
- Kill site: "Edible but lean. The old taboo itches; hunger doesn't care.
  It's dead. The carcass is there on the ground — search the body if you
  want the meat. But you don't know this flesh. Clean it, test it
  cautiously, or ask someone who knows. And don't leave it long: meat
  rots where it lies." — diegetically honest; the last sentence is the
  whole audit in one line.
- Minor blank (documented, not fixed): the belltoad kill line says "Legs
  are fine" while the cautious test marks it POISON (toxicFlesh special
  case). The test is the designed source of truth; whether the kill note
  over-hints is Steve's call.

## Blanks filled / documented

- FILLED: the open blank from the tracker — monster-meat discovery audit
  with the cautious-test chain exercised. Answer: discovery works (NPC
  experiments discover organically; player tests add speed), costs are
  energy-only, but it moves ~0% of village food because 97% of edible
  kills rot on corpses unlooted.
- FILLED (instrument, r10b): two measurement bugs caught and fixed —
  (1) byNPC attribution read foodTestedBy before the NPC beat set it
  (now deferred to finalize via the codex); (2) the specialist's butcher
  path bypassed the carcassToMeat wrap, undercounting harvest potential
  (now wrapped). Corpse-side rot was un-instrumented; now measured.
- OPEN BLANK for a future run: the carcass-haul gap. Fixes live at two
  levels — policy: loot corpses in range immediately after fights
  (different lever than this run's discovery chain; not attempted here
  per lever discipline); design: a haul-the-carcass verb or longer
  corpse spoil window. Until one lands, "monster kills are a food
  source" is true in code and false in outcome.
- Telemetry deviation check: quiet (no LOUD lines vs scale-wall baseline).

## Convergence

**killed-at-pilot.** The discovery lever's mechanism works but its
primary metric is invisible — the binding constraint is carcass
logistics, not discovery. No confirm spend. Scripts + evidence landed;
no game-code changes; no [needs-eyes].
