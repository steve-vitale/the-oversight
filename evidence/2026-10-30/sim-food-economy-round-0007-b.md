# Loop B round 0007Z — food-economy strand triptych, second sitting (coordinator)

Run: fleshout-loop-b-20261031T0007Z, axis food-economy (converging).
Loop A live on scale-onramp at run start (2215Z claim: sim-w4field-a,
sim-w4party-a, sim-linkgen-a, NOT touched; its claim retired during this
run as its closeout finished) -> B worked food-economy. Shared substrate
all arms: POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank 15003, 15009,
15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439. Base f52f08600.
Each arm re-derived its own strand set (no arm consumed a sibling's
output). All DIAG ONLY, zero src/js, zero policy-default flips, zero
game-code changes.

Arm 1 sim-sicktele-b (DIAG-NO-GO on its brief threshold, commit
79a77ec10, proof 18/18 on merged master): backlog #1514 re-run.
The 9983 elif gap does NOT reproduce at current head — seed 9983 now
runs a different trajectory (38 days / village-lost, 10 teles, 6 roster
exits, all tele-matched, 0 gaps); elif is alive on the final roster at
scatter. Fresh census seeds 10211-10218 (competent, 180d death-aware):
83 roster exits, 83 tele-matched, 0 gaps, 0 phantom lethal hurts;
pooled 89/89. The mechanism the prior run named (_cxKillContestant
never calling registerDeath) was landed over by arm sim-contestdeath-b
(commit 06b502d53, backlog #1541) and is verified live here: seed
10213, david_kim, day 126 contest death with registerDeath, contest
tele, and fallen entry. #1514 is therefore ANSWERED AND FIXED, not
merely unreproduced. No further tele-gap census is warranted unless
death plumbing is touched again. §15 declared non-applicable (DIAG
instrument). Evidence: evidence/2026-10-30/sim-sicktele-b-20261031T0007Z.md
(+ prereg).

Arm 2 sim-warmfuel-b (DIAG-GO as pre-registered, rebased tip
3e138a351, proof 103/103 on merged master): backlog #1568, warmth-fuel
question. Warmth fire consumed 4 bridge logs on 4 strand nights (ON
nights 9, 11, 12, 13) — night 12 newly confirmed, correcting
kcalshort's prose which named only 9/11/13. Protected-log
counterfactual (accounting, kcal/ticks held at observed values):
independently rescued nights = 2 (nights 10 and 14, the only wood-only
nights); sequential shortening = 7 nights (10 -> 3 still nights),
exactly restoring the guard-length strand. All 5 both-evenings stay
stranded even with all 4 logs preserved — logs alone never rescue a
0-kcal night. The warmth-fuel question is now measured: protecting
bridge logs undoes warmth's whole 3->10 extension, but only because
the fix lands early; after night 10 the binding problem is food, not
wood. Metric review (reported, not substituted): a literal both-legs
"majority" reading and an independent-rescued reading (2 < 3) would
flip the verdict; the judged GO follows the prereg as written, which
defined the judged set as warmth-live legs. §15 declared
non-applicable (DIAG instrument). Evidence:
evidence/2026-10-30/sim-warmfuel-b.md (+ prereg).

Arm 3 sim-tickbudget-b (DIAG-GO, rebased tip 981fdba52, proof 241/241
on merged master): backlog #1570, tick-budget census. 8 ticks-short
evenings, all on 15215, all still: alone 5, plus-wood 2, plus-both 1,
plus-kcal 0. Attribution: PRESS-DECISIVE 1 (guard-variant day 10,
the #1570 case reproduced: press 17 >= shortfall 3, counterpart
not-ticks-short at 110, routine totals equal 18==18); PRESS-CONTRIBUTING
2 (ON-variant days 18, 22 — wood gate fails regardless);
ROUTINE-ONLY 5 (day 7 alone on all 4 legs at 49 ticks short with
bridge wood in hand and no morning behavior fired, plus ON-variant
day 13, shortfall 1). Headline: press-decisive stranding is
single-leg; routine-attributed stranding is the replicated finding —
a design that budgets only the press still strands day 7 on every
leg. The GO bar's >=2-legs clause carries the verdict; distinct
seeds = 1 (15215 only), stated, not hidden. Press tick cost 17
whenever it fires (5/21 variant strand mornings); carry 2-tick cost
but 0/34 strand mornings acted. §15: official panel declared
non-applicable with reason, paired compare attached (same standing
as fedexile). Evidence: evidence/2026-10-30/sim-tickbudget-b.md
(+ prereg, census, morning table, compare).

Wall (30d pre-seat bands, structural): national/table/wins NOT
OBSERVABLE (0/10 each, no such content in the legs); median
survival 30d (ceiling); wave 1 in 10/10, wave 2 in 8/10, wave 3 in
1/10, waves 4-5 in 0/10. Overall wall UNCHANGED: full seat 0,
wave 5 reached 0 stands.

Telemetry deviation check on the tickbudget corpus (4 confirm legs,
--sweep-rows): 3 LOUD lines per leg (national/table/wins -> 0),
INVESTIGATED as regime artifacts (pre-seat substrate vs WINSEAT
baseline, whose own _regime note forbids the comparison); exiled
clean; baseline NOT rolled.

Infrastructure: master did not move under the run until closeout
(all three branches based f52f08600, merged in order sicktele ->
warmfuel -> tickbudget with clean rebases + proof re-runs after
each rebase and on merged master). Registration slow (~7 min first
tree) under Loop A closeout contention; no sibling work touched.
Safe-commit index clobber hit all three workers' commits
(worker-repaired per the documented recipe) and was checked after
the coordinator evidence commit. Worktrees released as merged,
branches deleted: sim-sicktele-b, sim-warmfuel-b,
sim-tickbudget-b. Claim retired to .DEAD; lock deleted. Evidence:
this file. Merged locally, pending ship.

food-economy stays converging (NOT converged): the strand is now
fully priced on three gates (food AND wood jointly, ticks as a
third gate, warmth as a log tax), but no strand fix has landed and
no food-economy default flipped. Next blanks in order: the two
Steve-call items (competent courtship drive; generation-dealt vs
earnable vests) still await rulings; then a strand-fix design that
reckons with the joint failure (warmth-fuel protection is now
measured, tick-budgeting must cover the routine day-7 hole, not
just the press), plus the warmth default itself, which still waits
on Steve. Scale-onramp untouched (sibling Loop A lane).
