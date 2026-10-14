# sim-scale-r33 — scale-onramp three-arm run (flesh-out loop A, 2026-10-14 ~11:25 CDT)

Standing directive: every run attacks the scale wall until scale-onramp reads converged.
Tracker state at run start: scale-onramp = converging. Sibling loop B live on food-economy (not claimed).

## Stale-lock recovery (this run, 16:20Z)
Lock held run_id `fleshout-a-2026-10-14-1506` (created 15:08:14Z). Registry heartbeat for its
tree sim-siegedef: 15:37:25Z — 43 min stale (> 15 min) → run DEAD per the concurrency guard.
Deleted the lock and the dead run's claim file (it never cleaned up; its claim named
scale-onramp and would have blocked this run). Left its tree sim-siegedef alone (active in
registry, stale heartbeat — not mine to release; the reaper handles >4h staleness).
Note: that run's sim-candwindow arm landed evidence (KILLED AT PILOT, sim-findings #205);
its sim-siegedef arm died with no evidence — arm restarted fresh this run as sim-siegedef2.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)

Axis: scale-onramp. Each arm: 8-seed pilot before any confirm; identical-seed before/after;
SMOKE=1 instrument honesty; det-gate; proof RED→GREEN. Killed arms leave no trace.
Metric binding (§14): a miss is NO-GO, never re-scored mid-run.

### ARM 1 — sim-proposelayer (policy-side, lever 8)
Verb gap from journey-scale r3: competent.js never calls proposeLink (0/8 links, rank never
leaves village); r10's harness propose driver seasoned links 4/8. Policy-side propose layer
(not harness assist) wrapping competent (pinned, gates OFF), driving the REAL proposeLink
verb on the proposal-window conditions.
- PRIMARY: links formed ≥ 2/8 AND ≥ 1 seed regional+ by d120 (or national ≥ 1/8).
- GUARDRAILS: median ≥ control−10d; starvation ≤ control+9 (A/A p90abs); hungryDays ≤
  control × 1.409; no new death mode; exiled ≤ control+1.
- Seeds 11/22/33/44/55/66/77/88; horizon 150d death-aware. Confirm 12–16 if GO.

### ARM 2 — sim-siegedef2 (policy-side, lever 1)
w5death blank: 84% of post-unlock scholar deaths are at-Haven siege combat, 50% wave-5
killers. Baseline = w5death audit suite RE-RUN on current tip (this morning's numbers were a
prior tip): leadfeast (FEASTSCALE_R13=1), seeds 11/22/33/44/55/66/77/88+303, 180d death-aware
(courtship/standing suite).
- PRIMARY: post-unlock scholar combat deaths per unlocker ≤ control × 0.70.
- GUARDRAILS: median ≥ control−5d; national ≥ control−4; table ≥ control−1;
  wave-5 unlocks ≥ control−1; no new death mode. Confirm 12–16 if GO.

### ARM 3 — sim-griefgrain2 (game-code: src/js/hierarchy.js ONLY; claims sim-findings #166)
Grief-grain gift aid-credit patch reverted byte-clean; the r32 kill was a mechanism-mismatched
metric (gift fires on young-link SUCCESSION beats, not the 6th-link tend race). Corrected
primary pre-registered AFTER the current-tip screen (lesson of #205: re-verify the motivating
event on the current tip before building); stack code-verified to fire the verb
(fifthlink-r26/winseek only, never leadcourt/belongseek).
- PRIMARY (worker pre-registers exact GO post-screen): young-link seasoning/survival post-gift.
- GUARDRAILS: starvation ≤ control+2; hungryDays ≤ control × 1.1; national ≥ control−2;
  no new death mode; exiled = 0. 16-seed fifthlink-r26 screen, 180d death-aware.

## Metric review
(filled at end of run)

## Results
(filled at landing)

## Village assessment
(filled at end of run)

## Blanks filled / documented
(filled at end of run)

## Wall numbers this run
national _/_ · table _/_ · wins _/_ · wave 4–5 unlocks _/_ · median survival _d

## Coordinator recovery note (flesh-out loop A, run fleshout-a-2026-10-14-1919, 2026-10-14 19:19Z)
Run fleshout-a-2026-10-14-1622 died mid-run (last heartbeat 18:14Z, lock 174m stale).
Recovered via stale-lock recovery: lock + dead run's claim file deleted; its trees
(sim-siegedef2, sim-griefgrain2) left untouched (not mine to release; reaper handles).
ARM 1 (sim-proposelayer) results landed in evidence/2026-10-14/sim-proposelayer-r33.md and
the sim-findings backlog ("diplomacy->wave-4 lethal" item). ARM 2 (sim-siegedef2) and ARM 3
(sim-griefgrain2) produced no evidence in this tree before the coordinator died; the w5death
blank they claimed remains OPEN (restarted fresh this run as sim-siegedef3, new slug/tree).
This file committed as orphaned-evidence recovery — the run-level audit trail.
