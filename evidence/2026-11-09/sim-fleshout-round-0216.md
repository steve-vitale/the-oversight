# sim-fleshout-round-0216 — Loop A coordinator evidence (adoption + 2 fresh arms)

Run: oversight-flesh-out-loop, run fleshout-20261110T0216Z (Loop A).
Axis: food-economy (converging, NOT converged). Master at closeout:
6642e6fc0. All four arms merged locally, pending ship. No push, no bump,
no live verification (ship loop owns deploys).

## Run-start: stale-lock recovery + adoption

STALE-LOCK RECOVERY: deleted the 2315Z lock (created 23:31:00Z, ~2h45m
old; its tree sim-wallbase-a heartbeat 00:07:16Z, 2h+ stale; zero live
processes in either 2315Z tree; zero writes since 01:45Z). Pre-flight:
main tree clean, disk 34%, worktree-reap ran (10/16 active; other
owners' dirty trees NOT touched). Loop B live on scale-onramp the whole
run (claim fleshout-loop-b-20261110T0122Z, arms trustgrowth + wave5face
+ approachretest) — NOT touched. Loop B landed its own arms mid-run
(its trees are gone from `git worktree list` at closeout).

Adoption of the dead 2315Z Loop A run (claim fleshout-20261109T2315Z,
retired to .DEAD at closeout): both its arms were complete-but-unlanded
and are landed by this run. Held orphans NOT taken: sim-wideduty-a +
sim-sametick-a (Loop A trees, heartbeats 15:00Z 2026-11-09, uncommitted
evidence — deferred to a future adoption run; the reaper never removes
them while they hold uncommitted changes, so they are safe where they
are). sim-ctraj-b locked + dirty — NOT touched (standing precedent).

## Arm 1 — sim-medheadcount-confirm-a (ADOPT, landed 6823cf106)

The held medic-headcount confirm: 16-seed before/after corpora + panel
already committed by the dead run (e2131fd6e). Coordinator verified the
evidence, rebased onto explicit master 74debf969 (clean), re-ran the
proof (4/7 by design on the reverted tree) and re-ran the analyzer
(VERDICT: NO-GO reproduced exactly), merged --ff-only, released.
Verdict stands: **NO-GO** — G1 PASS (share 77.7%, 0/16 zero-medic), G2
numeric PASS but G2 NEW-MODES FAIL ("the redactor":2), G3
review_required / no regression_signal, G4 proof 7/7 on the levered
tree. Lever + 10 test fixes stay reverted. Evidence:
evidence/2026-11-09/sim-medheadcount-confirm-a.md.

## Arm 2 — sim-wallbase-a (ADOPT, landed 1fc09bbe3)

Fresh scale-wall baseline: the dead run's sweep had finished (16/16
competent + 16/16 beats, 308.7s) but no evidence or commit existed.
Coordinator verified the corpus (32/32 parse; analyzer re-run
reproduces wallbase-a-summary.json byte-identical), sampled the beats
for the sense read, wrote the evidence, and committed it in two commits
(evidence + instruments 6518707b0; corpus 6d82c5c9b — safe-commit index
clobber struck both, repaired via the ls-tree -r pipe, blobs verified).
Rebased onto explicit master 6823cf106, analyzer re-verified, merged
--ff-only, released. Wall: **national 0/16, table invited 14/16,
entered 0/16, wins 0/16, wave 5 on 2/16, Arc 4 on 14/16, four-realm
0/16 (maxFires 0 everywhere), median survival 119d**. Deaths are
combat-dominated (997/1213 monster combat); starvation nearly absent
(6). Evidence: evidence/2026-11-09/sim-wallbase-a.md.

## Arm 3 — sim-medheadcount-metricfix-a (fresh, landed 6642e6fc0)

Re-pointed mid-run (see § Stale-brief catch). The metric revision from
the confirm's metric review is PROVEN: `causeMode` now collapses any
death-cause label matching the monster roster (src/data/monsters.json
name/shortName/id, case-insensitive) to 'fight'. Pilot corpora still
read "none" + GO; L7 replays the committed confirm corpora as "none" +
GO; the old analyzer still fails the replay (sensitivity proven); a
synthetic non-roster cause is still flagged honestly. Both confirm-band
legs reproduce the confirm run's legs exactly on current master.
Verdict: **NO-GO** — G1 PASS (77.7%, 0/16 zero-medic), G2 PASS (median
115d, starvation 5, new-modes none under the revised classification),
G3 PASS (panel review_required, zero regression_signal, compare
byte-identical to the confirm run), G4 FAIL — the full gate on the
moved base caught 2 new lever-attributed failures the confirm's gate
missed (test-contest-win-credit.js "Missing public choice Refuse to
answer"; test-main67-titan-standdown.js "standdown refuses a live real
fight without releasing its army"). Both are the same fixture-drift
class as the original 10 (tests that memorized the old starting cast).
Lever + 10 fixes reverted again; analyzer revision + proof L7 stay as
instruments. Proof on the reverted tree 5/8 by design (L0/L1/L3 fail,
L7 passes); coordinator re-ran proof + analyzer on the rebased tree
and merged --ff-only onto explicit master 632ed6e23. Wall: national
0/16, table 0, wins 0 on both legs — the lever fixes the medic gap but
does not move the scale wall. Evidence:
evidence/2026-11-09/sim-medheadcount-metricfix-a.md (commits b6c7233c8
prereg + 8836bf977, rebased to 3e6e5d377 + 6642e6fc0).

Next arm's work order (from the worker, endorsed): (1) fix the 2 gate
failures, each with its own investigation (fixture drift vs real
behavior break), seed search or repair, and a fresh full gate on the
landing base — a prior run's gate number does not transfer across a
base move; (2) measurement-proof refresh at landing; (3) follow-up
lever idea: a guarantee that doesn't consume the roster lottery draw,
plus a medic-RETENTION measure alongside spawn.

## Arm 4 — sim-pair-b98e3ef-a (fresh, landed 465802a90)

Stability re-confirm of the bandfreeze b98ac0730/e3ef2b612 pairs on
current master. Verdicts: **b98ac0730 MOVER CONFIRMED (exact)** — 5/8
with, 0 against, per-seed verdicts and first divergences identical to
bandfreeze; band kills 12 → 33. **e3ef2b612 INERT CONFIRMED (exact)** —
0/8 move on any field, daily rows byte-identical. Freeze STABLE — F0
reproduces F0 exactly on all 8 seeds; post-freeze src changes
(conversation.js, convo-dialogue.js, convo-wants.js, contests.js) are
inert on the doorwalk baseline band. No re-freeze needed. Proof
189/189, re-run by the coordinator on the rebased tree; merged
--ff-only onto explicit master 344d7b8d7 (first rebase attempt hit a
transient "could not detach HEAD" lock error; the retry sailed through
clean — no lock file remained). Evidence:
evidence/2026-11-09/sim-pair-b98e3ef-a.md (commits 05d51b8bc prereg +
0b524ac72, rebased to afe1edebe + 465802a90).

CORRECTION OWED (§14, flagged by this arm, not a verdict item):
bandfreeze evidence text reports band standing totals L3 1,955 → L4
3,036, but the committed corpora sum to 1,884 / 2,881; the per-seed
tables are correct. This note is the correction — the bandfreeze record
itself was not edited.

## Wall numbers (this run's judged corpora)

- Wallbase (fresh, competent, 16 seeds): national 0, table invited 14,
  entered 0, wins 0, wave 5 on 2, median 119d.
- Medheadcount confirm + metricfix re-run (16 seeds): national 0,
  table 0, wins 0 on both legs of both runs; median 102d before →
  115d after; starvation 16 → 5.
- Pair re-confirm (frozen band, 8 seeds/leg): national 0/8, lesser
  seats 6/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 4/8,
  wave-5-ready 0/8, median 150d, kill link 27/37 faced.

## Telemetry deviation check

- Wallbase corpus: 2 LOUD lines (national 12→0, wins 16→0).
- Metricfix after-corpus: 3 LOUD lines (national 12→0, table 16→0,
  wins 16→0).
All EXPLAINED, not bugs, baseline NOT rolled: the scale-wall baseline
is the WINSEAT regime (full win-side win stack) and its own `_regime`
note forbids comparing pre-seat substrates against it; competent-only
and pre-seat corpora have wins structurally ~0. The identical LOUD
lines fire on the BEFORE legs too, so the deviation cannot be
lever-attributed. (The pair arm's recorder corpora are refused by
telemetry-check by design — same precedent as grind-a / finishersize-a /
adopt-a.)

## Infrastructure

- Worktree registration slow (~8 min/tree: `git worktree add` runs a
  `git reset --hard` that is CPU-bound on this box, not hung — verified
  live before waiting it out).
- Safe-commit index clobber struck the wallbase commits twice and the
  metricfix commit once (D and MM forms) — repaired via the documented
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` pipe each time; commits always correct, blobs verified.
- Safe-commit.sh does NOT accept directory paths (fatal "Unable to add
  <dir> to database") — expand globs to file lists first (re-hit of the
  documented lesson).
- Master moved 4 times under the run (doorwalk-feared-b 344d7b8d7,
  journey-deepening r124 632ed6e23, plus the two adoption landings);
  every branch rebased onto an explicit SHA with proofs re-run after.
- check.js --quick NOT re-run on merged master: zero src/js in all
  four landings, and the doorwalk-feared-b landing (344d7b8d7) + the
  journey-deepening r124 landing (632ed6e23) each record a 296/4 GO
  gate on their own bases. Arm proof tests re-run on merged master:
  test-medheadcount-a.js 5/8 by design (reverted tree), test-pair-
  b98e3ef-a.js 189/189, wallbase analyzer reproduces the summary.
- No EPERM flap this run.

## Stale-brief catch (coordinator correction, mid-run)

Both fresh arms were first briefed from a stale tracker blank. Before
either worker committed a prereg or ran a judged sim, a subagent-list
read showed Loop B had already landed the work: bandfreeze-b
(52e8caec0) froze the band and re-asked fightblend on it (MIXED), and
fightblend-reask-b (a81cb2d07) retired the single-seed attribution
route; the b98ac0730/e3ef2b612 pairs were already run once by
bandfreeze-b. Both workers were interrupted and re-briefed: fightblend
→ medheadcount metric-fix re-run (live, prescribed by the just-landed
confirm); pairs → stability re-confirm on current master (not a first
run). Lesson for the next run: the tracker's "next blanks" lines go
stale when a sibling loop lands the named work between reviews — check
`git log master` for the named arm before spawning, not just the
tracker. The claim file was corrected to match.

## Findings filed (sim-findings.md)

- maxFires 0/16 — no polity formation under competent play (wallbase).
- Ambient template repetition on the wallbase band (same line twice
  for one villager in one day).
- G2 new-modes clause trips on monster proper names (the redactor) —
  now answered by the metricfix arm's proven revision; the finding
  stays open until the lever lands (the gate failures are the blocker).

## Village assessment in plain words

Sixteen fresh villages played carefully live a good while, reach the
high waves, and get invited to the Table — but none becomes a nation,
none sits, none wins, and none ever builds a second fire. The medicine
guarantee fixes a real, specific gap (three villages in sixteen never
had anyone who knew medicine, and died young for it; with the
guarantee they live much longer) — but it does not move the scale wall
at all, and the gate keeps catching the same cost: forcing a medic
into the starting group reshuffles who else shows up, and the tests
that memorized the old starting cast break. The frozen-band verdicts
from November hold exactly on today's master — the old fixes still do
what they did, and the old non-fix still does nothing. The wall is
unchanged; the instruments for measuring it got sharper.

## Convergence state

- food-economy: CONVERGING, NOT converged. The medic-headcount lever
  is now twice NO-GO (first on the metric, now on the gate); the
  metric revision is proven and landed as an instrument. No
  food-economy default flipped, no balance change landed.
- scale-onramp: CONVERGING, NOT converged (untouched; sibling Loop B
  live on it — its trustgrowth + wave5face arms completed during this
  run, to be landed by Loop B). The standing directive stands until
  the tracker records scale-onramp converged on measured evidence.

Next blanks, in order: (1) the 2 metricfix gate failures
(contest-win-credit, main67-titan-standdown) — fix + fresh full gate;
(2) measurement-proof refresh at the metricfix landing; (3) a
medic guarantee that doesn't consume the roster lottery draw +
medic-RETENTION measure; (4) the rot deciding corpus under the
governing verdict system (still owed since 2026-10-24); (5) the
wideduty + sametick orphan adoption; (6) flee-repair build (Steve
call, still held); (7) sit-becomes-win (Steve-call); (8) sweep table
contract (Steve-call); (9) capstone readiness; (10) trial-by-combat
staging (Steve-call); (11) Binding-never-fires follow-up; (12)
gating leg-4 recalibration (decision owed).

## Files

- Coordinator evidence (this file):
  evidence/2026-11-09/sim-fleshout-round-0216.md
- Arm evidence: evidence/2026-11-09/sim-medheadcount-confirm-a.md,
  sim-wallbase-a.md, sim-medheadcount-metricfix-a.md,
  sim-pair-b98e3ef-a.md (+ preregs)
- Claim: hidden_files/lever-claims/fleshout-20261110T0216Z.json
  (deleted at closeout; 2315Z claim retired to .DEAD)
