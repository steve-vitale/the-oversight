# sim-raidcapture-b — prereg (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2352Z, axis
food-economy. Worker: sim-raidcapture-b. Assignment: next blank (2) from
the 2026-10-27 2150Z loop-B review — fold the driedhunt
`_removePantryKcal` capture into the standing stockdoors ledger
instrument, so future ledger bands automatically count raid / tribute /
gift takes. Instrument only: ZERO src/js changes, ZERO default flips,
no game lever. Judged ONLY against this prereg.

## What is being folded, and why it is safe to fold

evidence/2026-10-27/sim-driedhunt-b.md proved the generic dried residuals
(-2,240 on seed 9738, -800 on 9735, -1,021 on 9825) are unanswered-raid
loot via `Game._removePantryKcal` (villageAgencyDaily,
src/js/villageAgency.js:203), the ONE pantry-removal method no capture
wrapped. scripts/driedhunt-capture.js holds that wrapper (snapshot-diff
on `Game._removePantryKcal` + caller-stack capture + snapshotStacks);
scripts/stockdoors-capture.js is the standing instrument it must be
folded into (it already wraps npcTakeAction, npcChildAction,
apPlaygroundRaid, useAbility, _evTakePantryKcal, takeFromPantry,
takeFromPantryBulk, pantryDraw, drawSpoiled, sweepSpoiled — via the
reused instruments — and asserts disjointness).

Fold design (committed with this run, not in this prereg file's diff):
stockdoors-capture.js gains the `_removePantryKcal` door as a
directRecord path `remove-pantry-kcal`, reusing its own snapshot-diff
machinery (pantrySnap / diffDecreases) plus the driedhunt caller-stack
capture (caller function name + full frames + asked + returned amount).
driedhunt-capture.js is reworked to reuse the folded code (a shared
installer exported from stockdoors-capture.js); its proof
scripts/test-driedhunt-b.js must still pass, or be updated in the
same commit with a stated reason. The folded door is ON by default
(future bands count raid/tribute/gift takes automatically) with an
opt-out (opts flag / RAIDCAPTURE=0 in the new sweep) used ONLY for
the det-gate control — never for a judged band.

Disjointness basis (read before the prereg, not invented):
`_removePantryKcal` (src/js/hierarchy.js:867) mutates the pantry inline
(sort + whole-unit decrements + splice) and calls NO other wrapped
method; none of the previously wrapped methods' files (game.js,
abilityActions.js, alienPlayers.js) calls `_removePantryKcal`; none of
the previously wrapped methods IS `_removePantryKcal`. The method sets
are therefore disjoint by construction, and the proof asserts it
(see leg (c)).

## Primary metric

Ledger closure by the folded records, per seed and per family:
NEW residual = OLD residual + folded-family kcal, where OLD residual is
the boundary-aware (post-run finalPantry) family residual computed with
the folded records EXCLUDED (the old instrument's ledger), and
folded-family kcal is the sum of the folded `remove-pantry-kcal`
records' items for that family. A closed ledger has NEW residual 0.

## Pre-registered GO thresholds (BINDING — no re-scoring mid-run)

(a) INSTRUMENT PURITY / det-gate. (i) A folded-on vs folded-off run
(RAIDCAPTURE=1 vs 0, same seed 9820, same band, stdout-JSON mode)
is byte-identical excluding the folded fields and `ms` — i.e. the
folded instrument moves no game number. (ii) Re-running the pilot
seeds with the folded capture reproduces every published stockdoors
headline number exactly (same det-gate standard driedhunt used):
finalPantry fresh totals (27,628 / 70,900 / 25,380), BA dried residuals
(-2,240 / -800 / -1,021), and all headline counts (inflows, mealDraw,
deaths, driedEvents, stockdoor, direct-minus-remove, sweeps,
spoilDays). Any mismatch voids the run.

(b) LEDGER CLOSURE — pilot first (8-seed max pilot rule; pilot here is
the three known-residual seeds 9738 / 9735 / 9825, no separate driedhunt
step — the folded records are read straight from the new sweep's
directRecords). For EACH pilot seed, for EACH of the two judged
families (generic-family DRIED channel, and Canned soup):
|NEW residual| <= 10% of |OLD residual| (target 0, i.e. 100%
coverage; the 90% floor from the task brief, expressed symmetrically
so over-accounting past 110% also fails instead of passing as
"more coverage"). Pilot GO requires all six (3 seeds x 2 families)
legs to pass. Confirm (wider stockdoors band, 8 seeds 9820–9827,
identical instrument and band) runs ONLY if the pilot is GO, and is
judged by the same bar: for every confirm seed, for both families,
|NEW residual| <= 10% of |OLD residual| wherever |OLD residual| > 0,
and folded kcal == 0 wherever OLD residual == 0 (a nonzero folded
take on a zero-residual seed is an anomaly, not a pass — it would
mean an offsetting uncounted flow). Confirm does not override the
pilot verdict.

(c) DISJOINTNESS. The proof asserts: (i) `_removePantryKcal` appears
in the folded run's wrappedPaths and in NO pre-existing instrument's
wrapped method set; (ii) folded-on vs folded-off payloads differ ONLY
in directRecords / directCounters (+ `ms`); (iii) the ledger delta
(with-folded minus without-folded, per family-seed) equals exactly
the folded sums — no other record changes. A kcal recorded by both
the folded wrapper and any pre-existing instrument fails this leg.

Verdict vocabulary: GO (pilot) + CONFIRM-GO / NO-GO per leg, never
re-scored. A missed bar is reported as NO-GO with its leg named.

## Horizon + why

100 days, death-aware (same as the stockdoors / driedhunt bands):
the judged residuals live on 100-day competent-nofeast trajectories,
and every pilot seed survives to day 100 on the published band, so a
shorter horizon would truncate the raid takes and a longer one would
add nothing the question asks. Dead villages stop simulating (+10d
tail max, per the harness); no fixed-200d horizon is used.

## Seeds and policies (exact literals)

- Pilot: SEEDS="9738,9735,9825", POLICY competent-nofeast
  (COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 off), DAYS=100, SAYCAP=300, INFLOWCAP=50000,
  MEALDRAWCAP=50000.
- Confirm (only on pilot GO): SEEDS="9820,9821,9822,9823,9824,9825,
  9826,9827", same policy and horizon.
- Det-gate: seed 9820, same band, RAIDCAPTURE=1 vs 0.
- New sweep: scripts/sweep-raidcapture-b.js (sweep-stockdoors-b.js
  + the folded capture, no other behavior change), writing ONLY to
  evidence/2026-10-27/sim-raidcapture-b-corpus/ — the stockdoors and
  driedhunt corpora are never overwritten.
- New analyzer: scripts/analyze-raidcapture-b.js (reuses
  analyze-stockdoors-b-2030.js perSeedBa on a folded-records-excluded
  copy for OLD residuals; folded sums straight from directRecords).
- New proof: scripts/test-raidcapture-b.js. Existing proofs
  scripts/test-stockdoors-b.js and scripts/test-driedhunt-b.js must
  stay green (run after commit; their hygiene checks read the
  working tree, so a green run on a committed tree is the honest
  signal, and any failure is reported, not waived).

## Balanced panel (MEASUREMENT.md section 15) — standing exception

This is instrument-only work: no lever, no game-code change, no
before/after game state to panel. scripts/balance-panel.js still has
no corpus-ingest mode for these per-seed ledger corpora, as prior
rounds recorded — stated here as the standing exception, not waived
silently. The det-gate (leg (a)) IS the before/after comparison:
identical records with the folded instrument off vs on, plus
headline reproduction against the published stockdoors corpora.

## Sense test (SENSE-TESTING LAW)

At least one raid-take transcript / stack story is read end-to-end
(caller chain, day, stacks taken, what the village did next) and
judged for meaning in plain words in the evidence file — not just
counted.

## Metric review (MEASUREMENT.md section 14)

Every evidence file from this run carries a "metric review" section,
even if it says "none — metrics held." Doubts about the bars above
go there for the NEXT run; they never re-score this run.

## Reachability exclusion (carried from driedhunt)

table-defiant's local tributeKcal fires only in the Defiant endgame
path, which this band never reaches (rank stays village on all
band seeds); it is excluded by reachability, as driedhunt did.
