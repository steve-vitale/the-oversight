# Gardening — first numbers — PRE-REGISTRATION
(arm sim-garden-b, run fleshout-loop-b-20261111T0025Z, Loop B; Coverage
Program Tier 2 #2, Steve order 2026-11-10 11:11 CST "Measure all so we
can improve on all gaps")

## What this arm is
A MEASUREMENT arm, not a lever arm. It captures the FIRST NUMBERS for
gardening on the standard panel: gardening events by crop/action, yield
(kcal) by crop, who gardens, gardening skill/teaching moments, garden
stock over time, and garden-vs-forage kcal share. Zero src/js. Gates,
prices, deeds, and the production throttle untouched. Earlier garden
work measured the POLICY-side controller (garden-longplay-audit,
garden-cultivation-natural-r1: crop intake, harvest/storage decisions)
and the plot-state/throttle mechanism (sim-gardenstate-b: ripe counts,
89.3% of NPC garden work throttled) — this arm measures the base
game's everyday gardening under the plain competent policy: who sows,
tends, harvests, and eats what the beds give, crop by crop.

## Canon grounding (read before the judged pilot, not assumed)
- docs/CANON.md read first; docs/GARDENS.md read for the garden canon:
  Haven tiers unlock 2/4/6/9 beds; new beds cost 120 kcal paid work;
  ordinary shoots establish in 30 days and regrow in 28, roots
  generally take 90 days and must be replanted, berries and woody
  plants take much longer (named overrides for strawberries, grapes,
  tropical roots); plant knowledge improves husbandry yield by
  25%/level, never accelerates time; Green Thumb / Green Whisper grant
  a Garden-only Cultivate action costing 200 kcal (growth +4/8/12
  days, Thumb yield x1.5/2/2.5, Cornucopia x1.25/1.5/1.75, Whisper
  synergy +2/4/8 days, one cast per bed/day); a standing caretaker
  consumes one real daily garden assignment; a full pantry defers
  collection/magic but keeps living crops maintained; dead beds can be
  reclaimed for 40 kcal and replanted; sowing needs two real units
  and knowledge or a real teaching guide. Maintenance is separate
  from harvesting surplus; six weedy days kill a crop.
- NO canon doc covers the gardening act itself (who gardens, outcomes,
  teaching) as a system beyond GARDENS.md's contract. Mechanics below
  are grounded in code and stated as code facts, not canon.
- Code facts verified by reading/grep before this prereg:
  - Crop profiles live in `src/data/gardening.json` (capacityByTier
    [2,4,6,9]; shoots 30d/28d/24u, roots 90d/single/30u, berries
    180d/45d/40u, woody 730d/60d/40u; per-plant overrides e.g.
    muscadine 365d, sweet_cassava 270d/single). Legacy planted crops
    keep old cycles (shoots 7d, berries 12d, roots 14d; regrow 3d;
    5000 kcal base) until replanted (gardenCultivation.js
    gardenCropProfile / gardenPlant).
  - Player verbs (game.js:22489+): `makePlot` (120 kcal, 64 ticks,
    Haven tier capacity); `sowPlot(pid)` (2 units of a known L1+
    gardenable plant from the pack, 16 ticks; guided sowing teaches
    through the real teaching primitive `teachPlant`); `tendGarden`
    (40 kcal, 16 ticks, tends every live plot); `harvestGarden`
    (16 ticks; per plot: pack it if it fits, else pool finished
    food straight to the pantry via depositPantryPieces, else
    DEFER — the plot stays ripe, food never vanishes);
    `reclaimGarden` (40 kcal, 32 ticks, clears one dead bed);
    `cultivateGarden` via useAbility Green Thumb/Whisper
    (gardenCultivation.js; NPCs pay hunger +cost/25, max 80).
  - `gardenHarvestTaken(plot, day)` is the SINGLE choke point for
    every harvest (player harvestGarden AND the NPC duty): it stamps
    lastHarvest, resets magic, and clears single-harvest crops.
    `plotYieldKcal` is nominal yield; `gardenHarvestUnits` is
    units (knowledge level 1+0.25*(level-1), weeds>=3 halves,
    magicYield multiplies). `gardenHarvestOrigin` classifies
    ordinary / assisted / legacy / legacyAssisted.
  - NPC garden duty (`resolveOneAssignment`, game.js:7146+): tends
    every live plot (`gardenMaintain`), casts cultivation magic if
    the worker holds it, sows via `villagerSowPlot` (green-hands
    occupations ONLY — farmer/gardener/botanist/herbalist/forager —
    only plants THEY know, safe, kcal>0, best kcal/day; seed is
    gathered as part of the duty, no pantry stock needed), harvests
    ripe SAFE crops only at 0.8 x worker efficiency, delivers via
    `stockPantry(kcal, 'Garden harvest', {gardenShares})`,
    credits a 'gardening' deed, +1 trust. Empty plots: tries
    villagerSowPlot, else reclaims if all dead and no empty plot.
    Caution crops (e.g. lamb's-quarters, edibility != safe) are
    NEVER harvested by the duty — they stand.
  - Throttle (game.js:6898+): when the pantry holds >4 fresh days
    (`prodThrottleEngaged`), garden duty is redirected to an alt
    task (wood/water/stone) AFTER `gardenMaintain` runs; a
    hunger-exempt (someone hungry 3 days running) keeps working.
    `v.throttleRedirects` counts redirects. sim-gardenstate-b
    measured 89.3% of NPC garden work throttled (616/690).
  - Keeper: `setGardenKeeper` (16 ticks + save); `gardenKeeperTurn`
    runs the keeper's daily garden turn (one real assignment).
    Competent scores keeper candidates by known-plants count +
    magic (10 if they hold a garden-magic plan).
  - Skill: `villagerPractice(vid, 'garden')` — 1 rep per resolved
    garden assignment; practice steps at 8/20/36 cumulative reps
    (game.js:6405). NO foodXp['gardener'] task exists (foodXp tasks
    are butcher/preserver via askSpecialist + the racks; SPECIALTIES
    in food.js:97 has no gardener task — 'spotter' covers plant ID).
    Scholar plant knowledge lives in `state.codex.plants` levels;
    garden yield reads the level. Guided sowing teaches via
    `teachPlant` (can teach WRONG — wrongTeaching — or be waved
    off as redundant).
  - Competent policy (`workGarden`, policies/competent.js:1088):
    harvest + prepareGardenFood first; make beds to
    min(4, capacity); set a keeper if none ready; reclaim dead
    beds if scholar kcal >= 800; trySow (fastest-maturing option
    first); cultivate if kcal >= 1000; harvest again; assign a
    garden duty if no keeper. `prepareGardenFood` shells nuts /
    cooks must-cook garden food at a fire (max 6 attempts/day).
  - Eating: village meal draws via `pantryDraw` (cookfirst pattern);
    garden-origin pantry pieces carry `gardenShares`; scholar pack
    items from harvestGarden carry `gardenShares`. Forage share:
    `stockPantry(kcal, 'Foraged food')` vs `'Garden harvest'`.

## Definitions (binding for this arm)
- **Gardening event:** one action, classified by action + actor:
  make (player breaks ground), sow-player (sowPlot, pid + guided?),
  sow-npc (villagerSowPlot, vid + pid), tend-player (tendGarden),
  tend-npc (gardenMaintain, vid + plots changed), harvest (per plot
  via gardenHarvestTaken, pid + path player-harvest / npc-duty),
  reclaim (vid or player), cultivate (vid + source ability +
  growth/yield), keeper-set, keeper-turn, duty-resolution (vid +
  throttled?), duty-assign. 'other' is a failure, not a class.
  Caller path for harvests comes from the stack: harvestGarden ->
  player-harvest; resolveOneAssignment -> npc-duty.
- **Yield (kcal) by crop:** per gardenHarvestTaken record, BEFORE
  the call resets the plot: `plotYieldKcal` (nominal), units,
  origin shares, weeds, legacy flag, path. Pooled by crop (pid) and
  by path. Nominal-vs-deposited caveat: the player's packed item
  kcal can differ from nominal by a few kcal on legacy plots (units
  rounding) — the analyzer labels the harvest-taken figure NOMINAL
  and reconciles against the pantry-door garden inflows.
- **Who gardens:** the duty-holder (id, occupation, practice
  reps/steps, known-plants count), the keeper (id, occupation),
  the sower (player vs vid), the tender, the cultivator (vid +
  ability held), the scholar's own garden actions. Green-hands
  occupation share of NPC sowers.
- **Gardening skill gains:** scholar codex plant levels for
  gardenable pids (first vs last snapshot); villagerPractice
  'garden' reps + steps per gardener (snapshot practice map);
  villager known-plants counts (villagerKnowsPlants) first vs last;
  Green Thumb / Green Whisper casts + ability levels (scholar +
  NPC holders, snapshot).
- **Teaching moments:** teachPlant calls (teacher vid, plant, outcome
  null/true/wrong, caller path: sowPlot -> guided-sow, else first
  frame); guided sow options (sowPlot with guide). Villager ->
  villager garden teaching has NO code path besides teachPlant to
  the SCHOLAR — recorded as UNMEASURABLE-BY-DESIGN if the pilot
  shows no villager-villager path (finding, not a gap).
- **Garden stock over time:** daily snapshot — pantry kcal carrying
  gardenShares, pack kcal carrying gardenShares, plot states
  (beds/planted/ripe/ripeSafe/ripeUnsafe/unplanted/dead) from the
  garden-capture snapshot, keeper identity, garden assignments.
- **Garden-vs-forage kcal share:** pantry inflow by name from the
  inflow capture (stock door 'Garden harvest' vs 'Foraged food'
  vs 'Game meat' vs 'Fish catch' vs other; deposit door with
  gardenShares counted as garden). Share = garden pantry inflow /
  total pantry inflow. Player-packed garden harvests (never
  entering the pantry) are reported separately, NOT folded into
  the share. Garden kcal eaten: pantryDraw gardenShares kcal
  (village meal) + scholar eat gardenShares kcal (pack).
- **Wall numbers:** wins / national / table / wave-4 / wave-5
  unlocks, median survival, standing totals, scaleRank at end.

## Primary metrics (per seed)
1. Gardening events by crop/action: makes / sow-player (by pid,
   guided?) / sow-npc (by vid + pid) / tend-player / tend-npc /
   harvests (by pid + path) / reclaims / cultivates (by vid +
   source) / keeper sets + turns / duty resolutions (throttled vs
   not) / duty assigns.
2. Yield: nominal kcal by crop (pid) and by path (player-harvest
   vs npc-duty); units by crop; origin shares (ordinary/assisted/
   legacy/legacyAssisted); NPC 'Garden harvest' stock kcal vs
   player packed/pooled kcal; weeds-halved harvests.
3. Who gardens: duty holders (vid/occ/days), keeper identity +
   days, sowers, tenders, cultivators; practice reps/steps per
   gardener; green-hands share of NPC sowers.
4. Skill gains + teaching: scholar codex plant levels (gardenable
   pids, first vs last); villager practice 'garden' reps/steps +
   rung gains; known-plants counts first vs last; teachPlant calls
   (teacher/plant/outcome/path); Green Thumb/Whisper casts + levels.
5. Garden stock over time: daily pantry gardenShares kcal, pack
   gardenShares kcal, plot-state series (beds/planted/ripe/dead).
6. Garden-vs-forage share: pantry inflow by name; garden share of
   total inflow; garden kcal drawn by the village meal
   (pantryDraw gardenShares) + eaten by the scholar (eat
   gardenShares); tele('eat') reconciliation.
7. Wall numbers: wins / national / table / wave-4 / wave-5 unlocks,
   median survival, standing totals, scaleRank at end.

## GO threshold (instrument validity + complete first-numbers capture)
This is a measurement arm: GO means the instrument works and the first
numbers are captured cleanly. GO iff ALL of:
1. Every garden harvest classified by crop + caller path; none
   'other', none forced. (gardenHarvestTaken wrap is the choke
   point: if a caller-path wrap is dead, the harvest is still
   counted and its path recorded from the stack.)
2. Every wrapped method's call path verified live in the proof
   miniature or marked dead in the evidence; a wrap with no live
   call observed is dead and its zero is never treated as evidence.
3. Neutrality — the instrument does not perturb the game: the
   no-instrument leg matches the instrumented leg exactly on
   per-seed days AND end pantry kcal AND death count (8/8 each).
   (Pattern from secondlink-a / diplo-a / cookfirst-a; the OFF leg
   is a re-run with the instrument uninstalled.)
4. Instrument errors 0 on all seeds, all legs.
5. Complete first-numbers capture: per-seed tables covering metrics
   1–7 above, with the sense-test scenes quoted. Every metric
   counted or explicitly marked unmeasurable (see below).
A GO verdict makes NO landing claim and spends NO confirm band: there
is no lever here to land. A confirm band is reserved only if a later
build arm needs one.

## Horizon + why
150d, death-aware (runDays ends on village death / win; +10d tail max).
Matches the cookfirst-a band so numbers compare directly. Shoots
mature at 30d and regrow at 28d, so 150d covers 3–4 shoot cycles;
roots mature at 90d, so one root cycle is observable. Berries
(180d) and woody plants (365–730d) CANNOT first-harvest inside the
horizon — a stated horizon limitation, not a miss: their first
harvest is beyond a village's median life (~137d on the cookfirst
band). A shorter horizon would cut even the root cycle; a longer one
adds nothing at ~3–4s/seed-run cost.

## Seeds
Band: **180217–180224** (8 seeds, pilot). Seed-band freshness verified
at spawn per the local_seed_band_freshness skill: FULL search —
`grep -rn "180217|180218|180219|180220|180221|180222|180223|180224"
evidence/ --include="*.md"` names the band ONLY in
evidence/2026-11-10/sim-coverage-tier2-round-2115.md, which RESERVES
it for this gardening arm (coordinator record); `grep -rn "180217|
18022[0-4]" evidence/ --include="*prereg*"` returns NOTHING (exit 1)
— no earlier prereg names any seed 180217–180224; `grep -rln
"forbidden band|contaminated band" evidence/ docs/ hidden_files/`
returns NOTHING — no forbidden/contaminated band list exists to
collide with. Recent bands in use and avoided: 180201–180208
(cookfirst-a), 180209–180216 (RESERVED for preservation sim-preserve-a
— Loop A live, do NOT spend), 170201–170208 (diplo-a),
150201–150208 (talkturn/raiserseat/tendexact/scholarcount),
150209–150216 (RESERVED for the talkturn re-judge), 160201–160208
(roleform-b), 140201–140208 (vetcount), 99101–99108
(secondlink/trustgrowth), 110001–110016 (wallbase).
Confirm band (if a later build arm needs one): NOT spent by this
measurement arm; a later arm picks a fresh band with its own
freshness search.

## Policies (TWO legs on identical seeds)
- **control:** competent verbatim, default env. The single judged leg.
- **neutral:** control policy, instrument OFF (no wraps, no snapshots;
  end-of-run wall numbers + days + end pantry kcal + deaths only),
  same seeds — must match the instrumented control leg exactly on
  days + end pantry kcal + death count (8/8).
No other policy change. No src/js change.

## Instrument (new, scripts only)
- NEW scripts/gardenb-instrument-20261110.js (wraps only, record-only):
  REUSES scripts/inflow-capture.js (all three pantry doors, for the
  garden-vs-forage share) and scripts/garden-capture.js
  (gardenstate-b: assigns / keeperTurns / resolutions with throttle
  flag / makes / sows / npcSows / keeperSets / gardenInflows /
  sayLines / snapshotGarden — plot-state snapshots), installed in
  that order; then adds its own wraps:
  `gardenHarvestTaken` (the kcal choke point: pid, nominal kcal,
  units, origin shares, weeds, legacy flag, caller path from the
  stack), `harvestGarden` (ripe-before count, took flag),
  `tendGarden`, `makePlot` (beds before/after), `sowPlot` (pid,
  guided?, guide vid), `cultivateGarden` (vid, plan source/cost/
  growth/yield, beds affected), `reclaimGarden` (vid, dead-before),
  `gardenMaintain` (vid, plots changed, throttle flag at entry),
  `teachPlant` (teacher, plant, outcome, caller path),
  `cookFood` + `shellNuts` (garden-prep only: calls on items
  carrying gardenShares), `eatOne` + `eat` (gardenShares
  attribution via object-identity pre/post diff),
  `pantryDraw` (cook flag + taken + garden kcal drawn from drawn
  items' gardenShares), `tele` ('eat' reconciliation),
  `noteDeed` + `creditDeed` ('gardening' deeds only).
  All wraps call the original, return its value unchanged, never
  alter state, never consume RNG, never throw into the game
  (record-path failures logged to instrumentErrors, never thrown).
- Daily snapshot: garden-capture snapshotGarden + pantry
  gardenShares kcal + pack gardenShares kcal (by origin class) +
  scholar codex plant levels (gardenable pids) + villager practice
  'garden' reps/steps + known-plants counts per roster villager +
  Green Thumb/Whisper levels (scholar + NPC holders) + foodXp map
  (to show the gardener-task absence) + cumulative inflow by name.
- NEW scripts/gardenb-driver-20261110.js (control + neutral legs;
  per-seed JSON to evidence/2026-11-10/perseed-garden-b/; refuses
  to overwrite), scripts/gardenb-analyze-20261110.js (per-seed +
  pooled tables, reconciliation, neutrality check; writes
  evidence/2026-11-10/garden-summary-garden-pilot.json), and
  scripts/test-garden-b.js proving the instrument.
- Say-sample filter: /garden|beds?\b|sow|harvest|tend|weed|cultivat|
  green thumb|green whisper|keeper|planted|ripe/i (garden voice;
  cap 200 lines per seed, day-stamped).

## Proof (scripts/test-garden-b.js, RED->GREEN where a behavior is asserted)
- gardenHarvestTaken wrap records pid + nominal kcal + origin on
  fixtures (ordinary shoot, assisted, legacy); caller-path
  classification covers player-harvest / npc-duty and 'other' fails.
- teachPlant wrap records teacher + plant + outcome + path;
  cultivateGarden wrap records vid + plan + beds affected;
  sowPlot wrap records pid + guided flag; tendGarden /
  reclaimGarden / gardenMaintain wraps record counts.
- eat wrap attributes kcal by gardenShares (object-identity diff);
  pantryDraw wrap records garden kcal drawn + cook flag.
- Analyzer fixtures: a per-crop yield split; a garden-vs-forage
  share; a practice-rung gain; neutrality comparison (identical
  days+pantry+deaths passes, differing fails).
- Live legs: a short determinism miniature (same seed twice,
  byte-identical garden counters), and a neutrality miniature (ON vs
  OFF on a short horizon, days + pantry kcal + deaths identical).
- Live install/shape: every wrapped method exists on the loaded
  Game; gardenHarvestTaken fires in the miniature.
- KNOWN WRAP RISK (from secondlink-a / diplo-a / cookfirst-a): a wrap
  records nothing if the engine calls the closure instead of the
  Game method. The proof must verify EACH wrapped method's call path
  is live (a live call observed in the miniature, or the wrap is
  marked dead in the evidence and its zero is never treated as
  evidence). gardenHarvestTaken is the backstop for yield
  provenance: if the harvestGarden / duty wraps are dead, the kcal
  are still counted from the choke point's stack.

## Unmeasurable (explicit, not hidden)
- Per-villager eaten garden kcal: the village meal draws from the
  pantry as an aggregate (pantryDraw returns kcal, not who ate
  what). The instrument measures the meal's garden-kcal draw, not
  individual villagers' plates.
- Villager -> villager garden teaching: no code path exists besides
  teachPlant TO THE SCHOLAR (guided sow, fireside, word of mouth
  all teach the scholar or a villager learning a PLANT, not garden
  craft). Recorded as a finding if the pilot confirms it, not an
  instrument gap.
- Garden-stock spoilage: the engine purges spoiled pantry items at
  meal/draw time without a tele event; the instrument infers
  garden-stock loss from daily snapshot diffs and labels it
  INFERRED, never exact.
- Berries / woody first harvest: outside the 150d horizon (180d /
  365–730d maturity). Horizon limitation, stated above.

## Sense-testing (SENSE-TESTING LAW)
Read transcripts / dialogue around gardening — judge meaning and
coherence, not just counts. Quote: the first sow scene per leg
where one exists; one keeper scene (if any); one harvest scene
(player and NPC, if any); one throttle-redirect scene (if any);
one weed-death scene (if any); one cultivate-magic scene (if any).
Flag template repetition (the same "works the garden — watered,
weeded, turned" line shape on every seed is EXPECTED — it is a
report line, not dialogue; judge the surrounding voice) and any
robotic/static/repeated villager behavior around the beds.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)
Every evidence file carries one. Known candidates going in: the
talkturn-a cost bar is already known-wrong; this arm carries NO cost
bar and does not re-judge it; the nominal-vs-deposited harvest yield
gap (legacy plot rounding) is a candidate for recording the packed
item's actual kcal alongside the nominal figure; the garden-vs-forage
share as defined counts pantry inflow only — a later run should
decide whether player-packed garden harvests belong in the share
denominator; the berries/woody horizon gap needs a longer-horizon
arm (or a prepared-scene proof) before any berry/woody verdict.

## Findings discipline
Do NOT chase findings outside this arm mid-run. List them under
"Findings for backlog" in the evidence file; the coordinator appends
them to
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md
in its format: `- [open] YYYY-MM-DD — area — observation (your run/evidence).`

## Base + landing
Base at spawn: master 6d7212cda (Loop A landed sim-knowfood-a mid-run;
this worktree fast-forwarded onto it before the prereg was written).
If master moves before the run ends, rebase onto the explicit master
SHA read immediately before rebasing and re-run proof green. Commit
the prereg FIRST (this file), then the instrument + proof, then the
corpus + evidence. Do NOT push, do NOT bump versions, do NOT verify
live. Do NOT merge — the coordinator merges with --ff-only. Leave
branch + worktree clean and committed.
