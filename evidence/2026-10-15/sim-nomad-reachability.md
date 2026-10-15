# sim-nomad-reachability — 2026-10-15 (confirm)

Forced-nomad reachability for The Long Way Home: can a capable player
actually reach eligibility, choose Leave, and walk the road to an ending?

## Pre-registration (bound both phases; docs/MEASUREMENT.md §§9-12, 14)
- primary metric: seeds reaching a Long Way Home ending (over && won, road ended)
- pilot GO (8 seeds): >=2 departures (Leave taken organically — proves both gates fire)
- confirm GO (16 seeds): >=4 endings
- horizon: death-aware, cap 200d; policy: scripts/policies/nomadseek.js
  (capable + answer the Watchers with 'feast' + leave when eligible + drive
  the road; on-road the village-side capable.daily is skipped on purpose —
  the bearer <redacted> physically away)
- A miss is NO-GO, never re-scored mid-run.

## Headline
- PILOT: 8 seeds — 4 departed, 0 endings. **GO** (bar: >=2 departures).
- CONFIRM: 16 seeds — 9 departed, **2 endings (1 all-found, 1 settled)**.
  **NO-GO** (bar: >=4 endings).
- **Reachability is PROVEN**: seed 5 organically reached global rank,
  departed day 86, reunited with both kin (one dead, one alive), and closed
  the road all-found — a genuine Long Way Home win. But 7/9 road parties
  wiped: the road is reachable, not yet reliably survivable.

## The seed-5 win (the proof)
- Day 86: left Haven with Helga Fan, Miles Pillai, Mykola Fedoryshyn,
  Yara Haddad; **Raj Patel holds the village** (leader-draft fix verified —
  the leader is not in the party).
- Leg 1 (Southeast Asia): found Ibrahim Frimpong dead — the grave beat.
- Leg 2 (The Pacific Rainforest and the North): found Teresa Nolan alive.
- Day 91: all-found. Won. 28,360 kcal still in the packs, zero fallen.

## Gate measurements (confirm, 16 seeds)
- pendingGlobal seen: 15; globalLive: 14; maxRank global 14/16, national 2/16.
  The Watchers beat fires ~day 78 (viewership >= 32) and the policy answers it.
- Gate-day histogram: rank 1349, no_known_kin 97. The rank gate dominates;
  once global hits, the knowledge gate is the remaining blocker.
- knownKin@day1: most seeds 0-2 of 1-3 scattered kin (origin-region overlap).
  Mid-run, mantle succession re-seeds the bearer's kin — the effective
  knowledge pool is larger than day 1 suggests.
- 7 seeds never departed; 6 of those still won the normal way (Table path),
  1 lost the village. The nomad ending is a real alternative, not the only
  road.

## Bugs found and fixed (all genuine "can't happen", all with proofs)
1. **Village leader drafted into the road party** (86a76c3e): start()
   appointed the leader from all non-bearer <redacted> THEN mustered the party
   from the same pool — 7/19 seeds sent the "village holder" to starve on
   the road while the epilogue praised them. Fix: muster first, choose the
   leader from stayers. Proof: scripts/test-nomad-leader-stays.js (5/5;
   RED 7/19 -> GREEN 0/19). One existing test encoded the old expectation
   and was updated in the same commit.
2. **Leg villages never generated** (0ba81eb1): genLegVillage existed and
   was unit-tested but had zero game-code callers — no leg ever had its
   village, so trade/join/fight never fired. Fix: the driver's enterLeg
   wrap generates the village (guarded). Proof:
   scripts/test-nomad-legvillage.js (7/7; RED 3/7).
3. **Keepsake trail dead pre-road** (343298d6): WORLD-REGIONS.md §6 spec'd
   "a worn keepsake of that person at L2+ names the region"; sharpenTrail
   implemented the 'keepsake' source but nothing called it outside tests.
   Fix: keepsakeTrailCheck on equipAccessory and on bond growth past L2
   (guarded). Proof: scripts/test-nomad-keepsake-trail.js (5/5; RED 3/5).

## steve-call: the road food economy (tuning/design, NOT chased)
Even with villages wired and the policy resting at friendly fires (1-7
joins per run), 7/9 confirm road parties starved. The math: 4 mouths burn
8,000 kcal/day; stranger forage yields ~1,600-1,900/day for the whole
party (~4,800 at full knowledge — still short); 30% of pantry carried
~26k (~4 days); each foreign village pantry is 12-20k and trade is
kcal-for-kcal (no net creation). Joining extends life (seed 42 survived
33 road days on 4 rests) but village pantries run dry and legs keep
coming. Questions for Steve:
- Should a 4-person party be able to live off the land indefinitely once
  it learns a region (forage >= burn at high knowledge), or is the road
  MEANT to be a race against the packs (in which case the itinerary must
  be short — few legs, fast reunions)?
- Should the party be smaller (2-3 mouths), the carried share larger, or
  foreign villages richer?
- Until ruled: the road kills ~78% of parties that walk it. The ending is
  reachable but the journey is a starvation timer, not the "days or weeks
  per leg" the spec promises.

## Metric review
- The pilot bar (departures) was the right gate question and it passed
  honestly. The confirm bar (4/16 endings) assumed a survivable road; the
  measurement falsified that assumption — the NO-GO is informative, not a
  broken metric.
- Next run (after Steve rules on the economy): keep the same bar; the
  policy already rests at villages, so re-measure directly.
- Accounting fix made mid-stream: eligibleDay now counts departures whose
  eligibility first became true inside the policy tick (was: eligible 1 /
  departed 4 in the pilot; now consistent).
- Note: scholar-day and harness loop-days can diverge slightly (frozen
  day clock); per-seed "days" are loop-days.

## Confirm per-seed
- seed 7: 82d, end=village-lost, rank=national, elig@null, departed=false, won=false
- seed 42: 117d, rank=global, elig@78, departed=true@78, roadDays=33, joins=4, foundKin=2, ending=false(wiped), won=false
- seed 99: 94d, rank=global, departed=false, won=true (normal path)
- seed 1234: 93d, rank=global, departed=false, won=true (normal path)
- seed 555: 88d, rank=global, elig@78, departed=true@78, roadDays=4, joins=2, foundKin=2, ending=true(settled), won=true
- seed 777: 111d, rank=national, departed=false, won=true (normal path)
- seed 2026: 158d, rank=global, elig@111, departed=true@111, roadDays=39, joins=3, foundKin=1, ending=false(wiped), won=false
- seed 31337: 99d, rank=global, elig@78, departed=true@78, roadDays=15, joins=3, foundKin=1, ending=false(wiped), won=false
- seed 1: 94d, rank=global, departed=false, won=true (normal path)
- seed 2: 97d, rank=global, elig@83, departed=true@83, roadDays=11, joins=4, foundKin=1, ending=false(wiped), won=false
- seed 3: 91d, rank=global, departed=false, won=true (normal path)
- seed 4: 97d, rank=global, departed=false, won=true (normal path)
- seed 5: 99d, rank=global, elig@86, departed=true@86, roadDays=12, joins=2, foundKin=2, ending=true(all-found), won=true
- seed 6: 105d, rank=global, elig@78, departed=true@78, roadDays=22, joins=7, foundKin=1, ending=false(wiped), won=false
- seed 8: 82d, rank=global, elig@78, departed=true@78, roadDays=5, joins=2, foundKin=1, ending=false(wiped), won=false
- seed 9: 85d, rank=global, elig@78, departed=true@78, roadDays=3, joins=1, foundKin=1, ending=false(wiped), won=false

## Pilot per-seed (pre-fix, for the record)
- 8 seeds: eligible 4 (after accounting fix), departed 4, endings 0.
- All 4 road parties wiped by starvation in 12-22 road days; the leg-village
  and keepsake fixes plus the join policy are what moved the confirm to 2
  endings. Pilot evidence was overwritten by the confirm rerun by design
  (same pre-registered measurement).
