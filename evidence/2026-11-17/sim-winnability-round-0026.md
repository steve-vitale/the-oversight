# Loop B round — 2026-11-18 0026Z (axis: winnability chain)

Coordinator: fleshout-loop-b-20261118T0026Z. Pre-flight clean (main tree
clean, disk 49%, reaper run, no B lock at start). Loop A live at start
on scale-onramp (2315Z claim: selblock-a + homebodyvoice-a) — NOT
touched; A landed mid-run (3d0f5770c: selblock DIAG GO #2498 +
homebodyvoice BUILD GO #2499) and closed; a NEW Loop A run went live
during closeout (trees sim-handoff-diag-a, sim-notick-a) — NOT touched.
Master moved once under the run (3d0f5770c, Loop A landing; zero
overlap with my arms).

Re-point queue status at run start (per tracker 2230Z review): arm-2
toggle CLOSED 2026-11-06; flee-repair re-judgement is next blank #1;
partysize B2 re-judgement blocked (no band producing >=3 size-4 fought
meetings); SEEK-clause fix (#2503) is next blank #3. No new
food-economy arm (parked).

## Arm 1 — sim-fleerepair2-rejudge-b: NO-GO (B1 PASS, B2 FAIL), lever HELD, NOT merged

Branch sim-fleerepair2-b, tip now cf7ae127c (re-judgement evidence +
corpus; the gate commits unchanged: prereg adb03c4c2, fix + instruments
+ proof 26075585f, evidence 1725b9336). Worktree clean, heartbeated,
KEPT for the next re-judgement arm. Proof re-run by the coordinator on
the branch tip: 29/29 ALL PASS.

Panel (diagnosis band 103601–103608, 8 seeds/leg, 150d, competent,
substrate VETREENGAGE=1 PARTYSIZE4=1 both legs; ctl = diagnosis corpus,
armed = new FLEEREPAIR2=1 leg):

| Bar | Result | Numbers |
| --- | --- | --- |
| B1 launched Suburb meetings | PASS (non-vacuous: ctl 3 >= 1) | 3 -> 0; suburb launches 9 -> 0; gate blocked 15 seed calls |
| B2 wave-4 kills armed >= ctl | FAIL | 6 -> 5, whole gap on seed 103602 (2 -> 1) |
| B3 deaths guardrail | PASS | expedition 237 -> 227; total 744 -> 703 |
| B4 proof | PASS | 29/29 |
| Instrument | CLEAN | 8/8 files both legs, 0 errors, missingHp 0; recMismatch 1/1 diagnostic only, same both legs |
| B5 balanced panel | INVESTIGATED | review_required, zero regression_watch rows; village deaths/run 93 -> 87.875 |

Calibration verified from the raw per-seed files before the armed leg
ran: seed 103602 carries 9 suburb launches and 3 launched suburb
meetings (round-1-zero 2, wise leaves 3), exactly as the 2230Z evidence
expected — so B1's zero is real, not vacuous. Band reuse was deliberate
and authorized (103601–103608 named in the frozen fleerepair2-b prereg
as the diagnosis band; only the new armed leg was run).

Why B2 missed: trajectory divergence, not removed killing power. On
control 103602, Dmitri killed an Algorithm (day 127) while out on a
suburb hunt — the hunt delivered a wild-meeting kill en route — and
Ruby killed a Herald (day 98) in a wild meeting. On the armed leg
neither meeting ever happens; the village launches 2 Ad Break hunts
instead and its one kill is a contact finish on a 1-HP Herald (day
133). The gate takes away no fight or weapon; the chaotic encounter
stream dealt different hands. One kill on 8 seeds flips the verdict
while the same seed saves 10 expedition deaths. No re-scoring: the
frozen bar is absolute; the metric review proposes the next run judge
B2 on a larger band, launched-kill scope, or a one-kill tolerance —
pre-registered, not retrofitted.

Wall (identical both legs): national standing 2, national rank 0,
table 0, wins 0, wave 4 7/8, wave 5 2/8, median survival 151d;
villages survived 7/8 both legs (103608 lost day 45 on both).

Sense-test: the wise leave still fires on wild meetings, which the
gate doesn't touch ("Miles reads the sterile streets — you can't kill
a suburb. They walk out. (Navigation is victory.)" days 89, 113,
114). The round-1 leave doesn't pre-empt the monster's round-1 action
(HOA Fine / Property Tax still land after the leave line) — existing
engine behavior, untouched. The gate's refusal is still silent in
vetSays — no voice line anywhere; unchanged from 2230Z.

Coordinator decision — HOLD, not merge, not kill. B1 is now judged
PASS, but the conjunctive verdict fails on B2 by one kill, and kill
discipline says a one-kill miss on 8 seeds is not a kill of the lever.
The next arm re-judges B2 on a larger band (or launched-kill scope /
one-kill tolerance, pre-registered). The branch keeps its evidence
commit; the tree stays registered + heartbeated.

Infrastructure notes: no write flap this run (8/8 seeds first
attempt). Driver trap recorded: the driver hardcodes
path.join(REPO, 'evidence', '2026-11-17', OUTDIR), so OUTDIR must be
a bare dirname — the worker's full path nested output one level deep;
files were moved to the intended location after the run, contents
untouched, only the run log's file: fields cite the nested path.

## Arm 2 — sim-seekgate-b: NO-GO (B1 UNJUDGEABLE, M1 FAIL), lever HELD, NOT merged

Branch sim-seekgate-b, tip 58fe5bb07 (fix febbdb315 + evidence
58fe5bb07), based on the HELD fleerepair2 tip 1725b9336 — it can only
merge AFTER sim-fleerepair2-b lands. Worktree clean, heartbeated,
KEPT. Proof re-run by the coordinator on the branch tip: 48/48 ALL
PASS (coordinator re-counted ok lines: 48). Fleerepair2 proof re-run
on its tip: 29/29.

What was built: the SEEK gate in winPlanFightGate (src/js/win-plan.js)
— under default-OFF SEEKGATE=1, a SEEK that would return for a
leave-counter species returns null instead (ordinary encounter
proceeds, awareness intact). The leave-counter list is now one shared
helper, isLeaveCounterSpecies, used by both the seed gate and the SEEK
gate. Two new stats counters (seekLeaveWalks both legs; seekGateHolds
flag-on only). The 'leave' trick, seed-gate behavior, monster stats,
and launch gates are untouched. Proof: scripts/test-seekgate-b.js
48/48 (live SEEK reproduction + determinism + trick-unknown control;
live gate + non-leave control + neutrality + seed-gate independence;
analyzer on synthetic legs; driver exports). The fleerepair2 proof was
re-run ALL PASS, proving the shared-helper refactor didn't change
seed-gate behavior.

Panel (band 103601–103608, 150d, competent, substrate
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 both legs; armed adds
SEEKGATE=1): both legs rc=0, 8/8 files, instrument clean.

| Metric | ctl | armed |
| --- | --- | --- |
| Launches | 13 | 13 |
| Suburb seeds / blocked | 15 / 15 | 15 / 15 |
| Suburb-plan launches (B1) | 0 | 0 -> UNJUDGEABLE |
| SEEK walks into Suburb, v4gates (M1) | 0 | 0 -> FAIL |
| Road suburb meetings, any target (D1) | 1 | 1 (round-1-zero 1, wise leave 1) |
| Wave-4 kills (B2) | 5 | 5 -> PASS |
| Deaths total / expedition (B3) | 703 / 227 | 703 / 227 -> PASS |
| Balanced panel (B5) | review_required, every observed delta exactly 0, no regression_watch -> investigated |

Drift: 0 divergences; every per-seed number identical (gate never
fired -> identical trajectories).

Wall (both legs, identical): national standing 2, national rank 0,
table 0, wins 0, wave 4 7/8, wave 5 2/8, median survival 151d.

Why M1 fails — the informative result: the village DOES learn the
leave trick (3/8 seeds, by surviving maulings or once by talking a
Suburb down), but every post-learning Suburb meeting arrives by
world-tick or aid — paths that never consult winPlanFightGate. The
only expedition meetings happen pre-learning, while the trick-hold
withholds the SEEK. Deeper coupling: the seed gate starves
trick-learning, which starves the SEEK clause's trick-known
precondition. A re-judgement needs a band/lever where an expedition
Suburb meeting follows trick-learning, with the seek-walk count
promoted to B1 — noted in the evidence's metric review, not re-scored
here.

Coordinator decision — HOLD, not merge, not kill. The fix is built
and proven, but the panel never exercises it; per the frozen prereg
and the fleerepair2 precedent, an unjudged primary is held for
re-judgement, not landed. It also cannot merge before its base
(fleerepair2) lands. check.js --quick on the branch: 334 passed, 6
failed in 760s — byte-identical to the fleerepair2 run's 6 (proof
staleness x2, deed-attainment 120s timeouts x2, stale phone evidence,
ladder ambient-raid control). None references win-plan.js or sets
SEEKGATE. recMismatch 1/1 both legs, same row: seed 103604 day 95 vs
Congregation, 923 vs 932 — the known #2497 Pack Hunt hole, already
fixed on master (77a37fe91) but not in this held base; diagnostic
only, no verdict moves.

## Findings filed this run

- #2506 (open) fight-gate scope: aid/world-tick paths never consult
  winPlanFightGate — the SEEK gate's scope is expedition-only
  (seekgate-b).
- #2507 (open) SEEK-gate silence: 0 suburb/seek lines in 226 vetSays
  per leg — the gate, like the seed gate, is silent (seekgate-b).

## Telemetry deviation check

REFUSED recorder-corpus input (same documented refusal as
1729Z/2025Z/2030Z/2230Z): the fleerepair2-rejudge armed corpus rows
carry top-level anchorCommit — sweep recorder rows, not runs.
Baseline NOT rolled.

## Infrastructure

- Worktree registration took ~22 min (registry-lock contention + a
  slow 8.6G checkout; the register held REGISTRY.lock through `git
  worktree add`'s `reset --hard`). Completed clean, no retry. No EPERM
  flap. No rebase stop-at-pick quirk (no rebases this run — both
  branches stay held).
- Safe-commit index clobber struck worker commits on both arms —
  repaired via the ls-tree -r pipe each time, commits verified correct
  (coordinator re-ran both proof suites on final tips: 29/29 + 48/48).
- One read-only exec in the seekgate arm was interrupted by a service
  restart; re-ran clean, nothing lost.
- Master moved once under the run (Loop A landing 3d0f5770c, zero
  overlap). A new Loop A run went live during closeout (trees
  sim-handoff-diag-a, sim-notick-a) — NOT touched.

## Metric review

- The B1 calibration gate did its job twice more: the re-judgement's
  B1 zero is real because the ctl leg shows 3 (verified from raw files
  before the armed leg ran); the seekgate panel's 0/0 correctly reads
  UNJUDGEABLE, not GO. The gate stays.
- B2's one-kill sensitivity is now the binding measurement question
  for the fleerepair2 family: on 8 seeds, one kill flips the verdict
  while the same seed saves 10 expedition deaths. The next arm must
  pre-register a larger band, a launched-kill scope, or a one-kill
  tolerance — and say which before running.
- The seed gate and the SEEK gate are coupled through trick-learning:
  the seed gate starves the very learning the SEEK clause needs as its
  precondition. A SEEK re-judgement that only re-runs this band will
  repeat the 0/0; it needs a band/lever where an expedition Suburb
  meeting follows trick-learning.
- The B5 `review_required` label fired on both arms with zero
  regression rows (re-judgement) and exactly-zero deltas (seekgate) —
  the label is a prompt to look, not a verdict; both were investigated
  and cleared.

## Convergence state

Winnability chain stays converging (NOT converged): B1 for the
flee-repair seed gate is now JUDGED PASS (launched Suburb meetings
3->0), but the conjunctive verdict fails on B2 by one kill, so the
gate stays held; the SEEK gate is built and proven but never fires on
this band, so it stays held too. No launched party has killed a wave-4
beast on any band this run's panels judged (the B2 kills counted are
wild/contact kills, not launched-party kills — the distinction matters
for the chain), the table is unreached, wins are 0 everywhere.
Scale-onramp stays converging (untouched; Loop A live). Food-economy
stays converging (parked). Next blanks, in order: (1) fleerepair2 B2
re-judgement on a larger band (or launched-kill scope / one-kill
tolerance, pre-registered) — B1 is judged, only B2 blocks the merge;
(2) partysize B2 re-judgement on a band/lever producing >=3 size-4
fought meetings; (3) seekgate re-judgement on a band/lever where an
expedition Suburb meeting follows trick-learning, with the seek-walk
count promoted to B1; (4) fight-gate scope (#2506) — aid/world-tick
meeting paths; (5) selected-blocked is Loop A's blank — do NOT
duplicate. Claim deleted; lock deleted.
Evidence: this file. Nothing merged locally: arm 1 HELD on branch
sim-fleerepair2-b (tip cf7ae127c); arm 2 HELD on branch sim-seekgate-b
(tip 58fe5bb07).
