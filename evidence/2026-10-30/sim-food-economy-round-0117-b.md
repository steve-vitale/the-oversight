# Loop B round 0117Z — food-economy strand-fix design (3 arms, all NO-GO)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
axis food-economy. Loop A live on scale-onramp throughout at run start
(claim fleshout-20261031T0016Z, arms sim-w4join-a + sim-ammo-a, NOT
touched; w4join landed mid-run as 7917b1d19, ammo landed mid-run as
1c1a507ed). B worked food-economy (converging), the second
non-converged axis. All arms DIAG ONLY: new default-OFF policy
instruments, zero src/js changes, zero policy-default flips, zero
edits to existing policy files. Shared substrate all arms:
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank 15003, 15009, 15091, 15211,
15215, 15220, 15221, 15337, 15376, 15439. Strand set re-derived by
each arm on its own pinned base: 15215 ONLY on every base (fifth
consecutive base); 15009 has 0 creek evenings on both legs.

## Arm 1 — sim-strandfix-morning-b: NO-GO (rebased tip 9424344c3)

Joint food+wood morning recovery (kcal-first press, then sensed
wood-seek). Prereg committed before judged legs (b13a5825e +
addendum 3e4a9692c); proof 26/26 on its pinned base.
Verdict judged exactly as written: strand nights fall >=3 on a
majority of legs AND >=1 both-evening converted. Actual: guard
3 -> 4, ON 10 -> 11 (both strands LENGTHEN by 1); both-evenings
converted 0/2 legs. Det-gate PASS, determinism PASS (15215 ON
re-run byte-identical). New finding, a FOURTH gate: the TOOL gate.
On 5/8 ON attempts the fell is refused ("Your Stone knife can't
fell a giant... You need an axe"); wake tile holds 0 bushes;
prune/gather yield branch material, not pack wood. WoodDelta>0 on
1/8 attempts; pack>=4 on 1/8 mornings. The one morning everything
works (day 17: fell 0 -> 5 wood, 80 kcal, 96 ticks) still strands
ticks-only (5 logs, 2278 kcal, 23 ticks). Food phase works when
known food is in the wake 3x3 (E 1,530 total, nets +1,410) and
narrows 3 both-evenings to wood-only, but converts none.
Evidence: evidence/2026-10-30/sim-strandfix-morning-b.md (+ prereg,
addendum, census, paired compare).

## Arm 2 — sim-strandfix-ticks-b: NO-GO (rebased tip beaf87342)

Creek-wake hold-day tick preservation (skip competent routine on
>=384-tick mornings, run only the night step). Prereg committed
before judged legs (e80aec29); proof 295/295 on its pinned base.
Verdict judged exactly as written: ticks-short evenings fall >=2
AND >=1 bridge-built conversion. Actual: 6 -> 2 (fall 4, clause
PASS) but conversions 0 (clause FAIL) -> NO-GO, no re-scoring.
Every hold evening ends at 128 ticks (ticks gate clears every
time), but the hold freezes micro-position at the foodless west
corner, so the morning press NEVER fires on either instrument leg
(0 attempts vs control 1 guard / 4 ON): the d9 routine walk to
the east muscadine patch is what makes the next morning's press
fire. Guard d10 clears ticks but strands on kcal (0 vs 60); ON
d13 clears ticks but strands on wood + kcal (1 log, 0 kcal).
Guard d11's control rescue is LOST (instrument still 0 kcal);
guard strand rises 4 -> 7. Bearer deaths move forward both legs
(guard none -> day 13; ON day 23 -> day 17). Day 7 NOT moved on
either leg (haven wake, byte-identical transcript), as
pre-registered. Det-gate 0 mismatches; pilot == confirm
byte-identical on all 32 overlapping files.
Evidence: evidence/2026-10-30/sim-strandfix-ticks-b.md (+ prereg,
census, hold table, paired compare).

## Arm 3 — sim-strandfix-combined-b: NO-GO (rebased tip 602d2bf3a)

Combined prototype: morning recovery + tick preservation +
protected bridge logs (live woodwarm restraint R1). Prereg
committed before judged legs (3c8f7a627); proof 292/292 on its
pinned base and 292/292 re-run by the coordinator on the rebased
tree (full leg set incl. det). Verdict judged exactly as written:
ON strand fall >=4 AND >=1 control-both evening converted
same-day. Actual: (a) HOLDS, ON 10 -> 3 (fall 7, bridge night 10);
(b) FAILS, 0 both-evenings converted same-day. The sole conversion
is day-10 wood-only, by protection alone; all 5 both-evenings
(nights 11, 12, 13, 15, 16) are prevented-early-rescue, which the
prereg explicitly does NOT count. Under a prevention-counts
reading the verdict would be GO — recorded in metric review as a
next-run revision proposal, NOT substituted here.
Component attribution: protection is the whole FULL story
(FULL-ON == PROT-ON exactly on every per-seed count, gate, and
warmth record; live R1 reproduces warmfuel's counterfactual
exactly: 3 still nights, bridge night 10). Morning is inert on
FULL (0 ticks spent on strand mornings) and harmful alone
(MORN-ON extends the strand 10 -> 21 nights, bearer death
17 -> 28, wave reach 15215: 1 -> 2): presses work (E 540/720/810
days 10/12/14) and turn both-evenings wood-only, but no fell ever
succeeds (axe-class tool required; creek tile has 0 bushes).
Tick preservation is guardrail-only (defers every 128-tick
morning, rescues nothing, day 7 untouched).
Evidence: evidence/2026-10-30/sim-strandfix-combined-b.md (+ prereg,
paired compare).

## Coordinator adjudications (landing, not re-judgment)

1. Morning post-rebase proof 25/26: the 1 failure is its
base-pinned "src/ diff empty" guard flagging exactly
src/js/progression.js + src/js/villager-objectives.js, which
master itself changed between the arm's pinned base (7917b1d19)
and the rebase target (journey-endgame r74, 52df7e732). The arm
touches zero src files (verified: diff vs new master, src/
empty). Named-cause, same class as the 1928Z pressb C6
adjudication. Verdict stands as measured on its base.
2. Ticks post-rebase proof 294/295: the 1 failure is its
base-pinned "no pre-existing policy/script modified" guard
flagging files master landed between its pinned base (52df7e732)
and the rebase target (morning/ammo/journey files). The arm
touches only its 4 new scripts (verified). Named-cause.
Verdict stands as measured on its base.
3. Combined pilot-gate call (disclosed by the worker):
sniff (iii) (morning gain) failed on the FULL pilot leg because
protection's day-10 rescue pre-empts the mornings where gains
occur; the worker ran one additional gate-only pilot leg
(morning-only, protection off) instead of killing the prototype,
with no code change between pilot and confirm. Coordinator
ruling: the call does NOT change the judged verdict — the
prototype fails bar (b) on the confirm corpora either way, and
the strict-kill alternative would only have ended the arm
earlier, not changed any number. The call is recorded here so a
later run can decide the pilot-gate rule explicitly; it is not
a precedent for skipping pilot gates silently.
4. Combined worker's "merged locally, pending ship" phrasing in
its handoff is corrected: nothing was merged until the
coordinator merged it below. The ship job owns pushes and live
verification.

## Wall (30d pre-seat bands, structural)

national/table/wins NOT OBSERVABLE (0/10 each, all legs, all
arms — no such content in the legs); median survival 30d
(ceiling); wave 1 in 10/10, wave 2 in 8-9/10, wave 3 in 1/10
(15439; ticks control-variant guard additionally 15215), waves
4-5 in 0/10. Overall wall UNCHANGED: full seat 0, wave 5 reached
0 stands (as context; this round measured no scale content).

## Telemetry deviation check

On the combined FULL-ON corpus and the ticks instrument-ON
corpus: 3 LOUD lines each (national 12 -> 0, table 16 -> 0,
wins 16 -> 0), INVESTIGATED as the known regime artifact
(30d pre-seat substrate vs the WINSEAT baseline, whose own
_regime note forbids the comparison); exiled clean; baseline
NOT rolled.

## Infrastructure

Master moved 3 times under the run (Loop A w4join 7917b1d19,
journey r73/r74, Loop A ammo 1c1a507ed); all branches rebased
clean in their own worktrees (morning once, ticks once,
combined once), proofs re-run green-or-adjudicated after every
rebase and on merged master (combined 292/292 full). Safe-commit
index clobber hit the combined worker's commits (worker-repaired
via HEAD-blob cacheinfo, commits verified correct); no clobber
on the coordinator merges. Registration slow (~5 min each,
reap contending with sibling git-status processes) — no sibling
work touched. check.js --quick NOT re-run (zero src/js, zero
policy-default flips, sibling Loop A live during the run).
Worktrees released as merged, branches deleted:
sim-strandfix-morning-b, sim-strandfix-ticks-b,
sim-strandfix-combined-b. Claim retired to .DEAD; lock deleted.

## Metric review

- Combined prevention-vs-conversion: the prereg's conversion
bar is the stricter, honest bar for "the fix works"; prevention
(protection stopping the strand before both-evenings form) is
real but is protection's effect, already measured by warmfuel.
A next run that wants a prevention verdict must pre-register
it as primary BEFORE any leg, with its own bar — this corpus
must not be re-judged under it.
- Morning/ticks base-pinned diff guards cannot pass on a newer
base by construction: they flag master-landed files, not arm
changes. Future arms should pin guards to the arm's own file
list (new files only), or the coordinator adjudication above
must be repeated every landing.

## Findings appended this run (hidden_files/sim-findings.md)

Morning arm (3): tool gate (axe in hand); fell tick cost on
day 17; axe arrival unrecorded days 15 -> 17. Ticks arm (2):
selective-trim next design; ON wave-2 vs unfed wave-1
observation. Combined arm (1): refused-fell line repeats 3x per
morning (narration dedup / canFell pre-check). Loop A ammo
finding also landed in the file mid-run by its own worker
(dry fighters never departed) — not this run's.

## Next blanks, in order

1. Prevention-counts pre-registration for the combined
prototype (decide the bar before any leg; do NOT re-judge this
corpus).
2. The axe/tool gate: a cutInfo + inventory-per-morning
recorder, and how an axe-class tool arrives on the 15215
trajectory (days 15 -> 17 unrecorded). Morning wood-seek cannot
work until this is answered — it now binds before kcal/ticks.
3. Selective trim (ticks next design): skip expensive routine
beats but keep the within-tile walk to the green patch.
4. The two Steve-call items (competent courtship drive;
generation-dealt vs earnable vests) and the warmth default
still await rulings; a strand-fix design that reckons with the
joint failure now also reckons with the tool gate.

food-economy stays converging (NOT converged): the strand-fix
design space is now measured three ways and all three fail
their conversion bars — protection prevents, mornings and
holds do not convert, and the tool gate blocks wood-seek
entirely. No food-economy default flipped, no balance change
landed. scale-onramp untouched (sibling Loop A lane).
