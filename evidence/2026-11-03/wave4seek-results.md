# Wave-4 seek pilot — results (arm sim-wave4encounter-lever, KILLED)

Run: fleshout-20261103T0115Z, axis scale-onramp. Base ee016ba16, branch
sim-wave4encounter-lever. Prereg: scripts/wave4seek-prereg-20261103.md
(committed 606211f73a BEFORE any judged sim). Pilot: 8 fresh seeds
98301-98308 (freshness verified: repo-wide substring hits were pantry
kcal values and float fragments, never a seed use; no s9830x filenames;
November hits were hash/count substrings), baseline vs variant on
IDENTICAL seeds, 180d death-aware cap, mode herald, closecommit stack
verbatim from scripts/fightoutcome-driver-20261102.js, env
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1. Driver scripts/wave4seek-driver-20261103.js,
analyzer scripts/wave4seek-analyze-20261103.js. Per-seed JSONs:
evidence/2026-11-03/perseed-wave4seek/. Full say transcripts in /tmp
only (not the repo) — quoted below before they age out.

## Verdict: KILLED (prereg GO missed, on the baseline leg)

Prereg GO: >= 2/8 variant seeds with >= 1 wave-4 fought AND baseline
0/8. Actual: baseline 4/8, variant 3/8. The GO fails on its baseline
condition before any variant comparison — and on the descriptive delta
too (total distinct wave-4 kinds: baseline 8, variant 7). No confirm
round: a confirm cannot rescue a GO whose baseline premise is false.
Per the kill rule the policy file (scripts/policies/wave4seek.js) and
its proof test are DELETED in the kill commit; the prereg, driver,
analyzer, per-seed JSONs, and this record remain as the measurement.

## Per-seed table (primary metric: distinct wave-4 fought, deed feed)

| seed | base w4 (unlock day) | variant w4 (patrols) | base days/end | variant days/end |
|------|----------------------|----------------------|---------------|------------------|
| 98301 | 1 [herald] (d80) | 0 [] (10 patrols) | 93/over-other | 90/over-other |
| 98302 | 0 [] (never unlocked) | 0 [] (0) | 33/village-lost | 33/village-lost |
| 98303 | 1 [reunion] (d56) | 3 [congregation, suburb, reunion] (21) | 81/village-lost | 86/village-lost |
| 98304 | 0 [] (never unlocked) | 0 [] (0) | 90/over-other | 90/over-other |
| 98305 | 0 [] (never unlocked) | 0 [] (0) | 97/village-lost | 97/village-lost |
| 98306 | 2 [eulogy, algorithm] (d58) | 2 [eulogy, algorithm] (17) | 84/village-lost | 75/village-lost |
| 98307 | 4 [strike, reunion, suburb, influencer] (d75) | 2 [reunion, suburb] (11) | 105/village-lost | 91/village-lost |
| 98308 | 0 [] (never unlocked) | 0 [] (never unlocked) | 25/village-lost | 25/village-lost |

Unlocked-wave-4 seeds: 4/8 both arms (98301, 98303, 98306, 98307).
Of unlocked seeds, baseline records w4 fought on 4/4, variant on 3/4.
Patrol trigger discipline: variant patrolled ONLY on unlocked seeds
(10/21/17/11 days) and never on locked seeds — the gate worked.
Descriptive wall numbers: national baseline 2/8, variant 0/8; table
baseline 4/8, variant 4/8; won baseline 2/8, variant 2/8; median
survival baseline 87d, variant 88d; wave-5 fought 0/16 runs both arms.

## What actually produces wave-4 deeds (the finding)

Wave-4 monsters COME TO THE VILLAGE without any seeking. Once wave 4
unlocks, the world spawner (60% newest wave) puts Mirror Draft monsters
on wild tiles within days, and they linger at Haven's treeline, gorge
from the stores, join pantry raids, and get fought at the door:

- 98306 baseline: Eulogy fought ON unlock day 58; Algorithm d77.
- 98307 baseline: Strike d78 (3 days after unlock d75), Reunion
  d87-89, Suburb d93, Influencer d102 — four distinct kinds, zero
  seeking, zero patrol.
- 98303 baseline: Reunion spawns d56 ("Something moves out there —
  The Reunion"), muster beat ("scouts report The Reunion hunting near
  Haven"), lingers gorging, joins a 3-Reunion pantry raid d77, fought
  d78-81 (player + party: "Tom strikes the Reunion", "Quinn strikes",
  "Quinn falls").

The 97339 zero is therefore SEED-SPECIFIC, not systemic: on this band
every unlocked seed converts without seeking. 97339's window
(unlock-to-table) or its path (no raid/titan fight landed) produced
zero; the band rate says seeking is not the missing ingredient.

## Sense-read (transcripts, not just counts)

- PASS, seek-success-without-seeking (98303 baseline d56-78): the
  Reunion's arc is coherent — spawn beat, muster warning, nightly
  gorging ("1,454 kcal gone from the stores"), raid at the door,
  party fight with a real casualty (Quinn falls). The village fights
  wave 4 because wave 4 moved into its life, not because anyone went
  hunting. Counts alone would have hidden that the deed path is the
  raid/treeline path, not the wild-encounter path.
- PASS with a cost, seek-failure (98301 variant): 10 patrol days after
  unlock d80, zero wave-4 fought — while the SAME seed's baseline
  fought the Herald d90 through the titan path. Patrol perturbed the
  trajectory away from the titan fight. Seeking is not free: it spends
  days and displaces the paths that were already converting.
- PASS, mechanism-works-but-rate-flat (98303 variant): patrol days DO
  generate wild wave-4 encounters coherently (Congregation d61 "It
  followed you", Suburb d63, Suburb raid d65, fights d66/68/70 — 3
  kinds vs baseline's 1). The mechanism is real; the band rate is
  flat because baseline converts through the same spawn system anyway
  (98307 variant drops 4→2 kinds while patrolling). More encounters
  do not mean more deeds when the deeds were already arriving.

## Metric review (§14 — for the NEXT run, never re-scored here)

1. The prereg's baseline assumption (0/8) was seed-97339-specific and
   false on this band. A future seek arm must pre-register a DELTA
   (variant minus baseline on identical seeds), not a zero baseline.
2. The deed-feed wave-4 count mixes three paths the arm did not set
   out to measure: titan fights (Herald is wave 4), raid/treeline
   fights, and wild patrol encounters. A future metric should split
   them (titan vs raid vs wild) or the arm will keep measuring the
   raid system while claiming to measure seeking.
3. The perception-law conclusion stands and is now evidence-backed:
   no in-game channel reports a wild monster's position (survey in
   prereg), and none is needed — the monsters arrive on their own.
   A targeted-travel seek remains impossible without a new game
   channel, and this pilot says such a channel would be redundant
   for wave-4 deeds. Do NOT build one for this purpose.
4. Panel compare (§15): not applicable — POLICY_REGISTRY in
   scripts/sweep-compare.js contains neither the closecommit stack
   nor the wave4seek wrapper; the judged comparison is the
   identical-seed driver table in wave4seek-compare.md. Stated in the
   prereg before any sim.

## Adoption items (named, not claimed)

- None from this arm: the lever is killed, the policy deleted. The
  open scale-onramp question this pilot sharpens is different: why
  did 97339 (national, unlocked, 92 days) see no wave-4 fight while
  4/4 unlocked seeds here did? Candidate: unlock day vs table day
  (window length) and raid/titan path presence. A diagnostic re-run
  of 97339 recording unlock day + raid/titan events would settle it
  — measurement only, no policy.
- Variant re-runs (if ever wanted) require restoring
  scripts/policies/wave4seek.js + scripts/test-wave4seek-20261103.js
  from commit 606211f73a; the driver references the policy file.

## Files

- Prereg + driver + analyzer: scripts/wave4seek-prereg-20261103.md,
  scripts/wave4seek-driver-20261103.js,
  scripts/wave4seek-analyze-20261103.js (commit 606211f73a).
- DELETED in kill commit: scripts/policies/wave4seek.js,
  scripts/test-wave4seek-20261103.js.
- Per-seed JSONs: evidence/2026-11-03/perseed-wave4seek/ (16 files).
- Compare table: evidence/2026-11-03/wave4seek-compare.md.
- Proof test (while it lived): 8/8 checks, incl. perception-law
  source ban (no worldMonsters/nearestWorldMonster/monsterAt reads).
- No game-code change anywhere in this arm. No push, no bump, no
  live verification — committed on branch, pending coordinator merge.
