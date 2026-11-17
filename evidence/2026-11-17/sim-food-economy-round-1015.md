# sim-food-economy-round-1015 — Loop A, axis food-economy (2 adoptions MOOT-but-verified + 1 tooling GO, merged locally pending ship)

Run: oversight-flesh-out-loop, run fleshout-20261117T1015Z (scheduled 04:15:39 CST). Axis
food-economy (converging, parked). Master 9be3676d8 -> 546823138. Claim
`hidden_files/lever-claims/fleshout-20261117T1015Z.json` written before any sims; lock
created 11:14Z, deleted at closeout.

## Guard / collisions

- No fleshout-loop.lock at run start. Loop A 0915Z run had already closed (evidence
  9be3676d8 on master). Loop B live the whole run on winnability chain — first its
  1030Z deathcleanup adoption closeout (proof tests running 11:09Z, coordinator evidence
  written 11:12Z, landed 1e74e1078 mid-run), then its 1130Z planignite-fix CONFIRM
  registration (sim-planignconfirm-b, 12:09Z) — NOT touched, no axis overlap (this run
  worked food-economy only).
- Pre-flight: main tree clean, disk 45%, worktree-reap ran (11/16 active, no live/dirty
  tree removed). Orphan trees heartbeated before the reap so the reaper could not touch
  them.

## Pre-registration (summary — binding header is the claim file)

- Axis food-economy, topmost axis not converged and not named in any live claim
  (winnability chain was claimed by Loop B). Three arms, each with its own GO bar:
  (1) adopt sim-wideduty-a, (2) adopt sim-sametick-a, (3) fresh full gate +
  measurement-proof refresh (sim-gateproof-a).
- Stale-blank corrections made BEFORE spawning (checked against master, not just the
  tracker — the 2026-11-10 entry warned its blanks go stale): tracker blank #4 (rot
  deciding corpus under govern-verdict) is CLOSED — rotdecide-govern ran it (STEP
  CONTESTED 0.645x, seeds 9310-9325) and sim-preserverleg2-a (2026-11-07, d9fa3b74d)
  took findings #1048's next question (haul-throughput vs rot tradeoff) and answered
  NO-GO CONCEPT-DEAD on fresh band 96500-96515. Do not re-run the ratio as judge.
  Tracker blank #1's two gate failures verified non-reproducing on tip 9be3676d8
  (test-contest-win-credit.js 21/21, test-main67-titan-standdown.js 22/22, both in
  scripts/godpath/).

## Arm 1 — sim-wideduty-a adoption (GO as measured; already landed)

Worker: adoption of the dead 2026-11-09 widen-medic-duty confirm. Verdict vs the frozen
prereg (seeds 96301-96308 pilot, 96901-96912 confirm, competent only, 150d,
PLENTYDEPRI=1/DEPOSITGATE=1): G1 PRIMARY PASS (confirm duty-held 1271/1439 = 88.3%,
bar >=60%, before 61.0%; zero-duty seeds 0/12, bar <=2; trained holders 746/1439 =
51.8% of duty days, before 0); G2 guardrails PASS (median 122d, bar >=100; starvation
1, bar <=4; no new death-cause mode >=2); G3 panel PASS (review_required, no
regression_signal); G4 proof PASS (test-wideduty-a.js 7/7 on the unlevered tree).
Wall: national 0/12, table 0, wins 0, wave-5 reach 5/12 -> 4/12, median 125d -> 122d.
Duty cures 97 -> 142 (ability); medicine cures still 0 everywhere (Haven pharmacy empty
— seeded-stash run still owed, a known medicine-supply item).

LOUD FINDING: the Nov 9 work had ALREADY LANDED on master — orphaned commits
48c93b22b (lever + evidence) and 4c44e35de (gate adjudication) are ancestors of master
and game.js carries isMedicDutyEligible (6 hits). The branch could not be merged as-is
(92/100 files byte-identical to master). Coordinator action (verified, not trusted):
cherry-picked only the novel deltas as coordinator commit ed55adddd — adapted proof
test (L0-L3 lever-guarded, new L7-L10 measurement legs) + adoption-verification
sections in the evidence and prereg — blob-identical to the worker's versions, proof
11/11 on master with the lever present. Branch released as done-abandoned, tree removed,
branch deleted. The lever needs no re-port; it is live.

## Arm 2 — sim-sametick-a adoption (GO on all three bars; already landed)

Worker: adoption of the dead 2026-11-09 same-tick duty-cure recorder fix. Verdict vs the
evidence's frozen bars: PRIMARY GO (43/43 duty cures captured, bar >=42), NEUTRALITY GO
(G2 PASS all 8 seeds), SECONDARY GO (analyzer agreement 43/43 after the adoption fix).
G3 FAIL stands as documented (pre-existing scholar radiation_sickness onset gap, out of
scope). Contamination check CLEAN: all three modified shared files
(analyze-feveranat-a.js, analyze-medicduty-a.js, sweep-feveranat-a.js) are sametick-owned.
Proofs re-run on the tree: test-sametick-a.js 6/6, test-feveranat-a.js 11/11,
test-medicduty-a.js 13/13 (pre-L7 version).

LOUD FINDING: this adoption was also unnecessary — the work landed 2026-11-09 as
9aeb78712 (main-session 1315Z adoption), verified ancestor of master. The worker made
no commit. Its independent L6 re-derivation is the keeper: the synthesized 0-day
episode omitted onsetDay/endDay, so the defensive 'explained' check read its window as
(-1, +inf) and swallowed repeat same-tick cures (s96301: 9 distinct patient+disease
pairs vs 17 events, 8 repeats lost); the landed commit contains the identical fix plus
an L7 leg in test-medicduty-a.js testing exactly that case. Coordinator action: ported
only the 36-line adoption addendum onto master's evidence file (the worktree's copy was
the pre-landing text with "TBD — running" notes; a wholesale copy would have regressed
the 1315Z adoption's edits) as coordinator commit 3cb0782e5 (36 insertions, 0
deletions). Branch released as done-abandoned, tree removed, branch deleted.

## Arm 3 — sim-gateproof-a (GO; merged 546823138)

Worker, fresh tree, tooling/measurement only, zero game-code change. Pre-registered
before running; one spec deviation recorded in the prereg before the sweep: the brief's
capable/seed 7/30d spec and 01ab3e346 proof pointer were stale — the proof had since
been re-pointed (b20, then r211 --n 1, 4-row/150d). The worker regenerated at the
CURRENT proof's spec to preserve coverage exactly; regenerating capable-only/30d would
have shrunk the maintained proof from 4 cohorts to 1. Coordinator accepts the deviation.

- Part A (fresh full gate, run once): `check.js --quick`, 338 passed, 2 failed,
  0 attributable. Both failures pre-existing (verbatim in the r211 gate on tip
  5453f710e; this arm changed no src/, no index.html, no existing test):
  test-phone-frame-proof.js (stale phone receipt — index.html moved in the batch-ship
  version bump; receipt refresh owed by the phone-frame owner) and
  test-ladder-bundle-20261108.js (ambient-raid control fires 0 in 200 monster turns).
  Standing-profile classes ABSENT: the measurement-proof staleness pair is gone by
  design (proof test 9/9 + workflow 9/9 inside the gate), and the parity-gear assertion
  is gone too — all parity tests green standalone (60/0, 2/0, 5/0) and in the gate; no
  game code changed in this arm, so the fix came from a landing between the
  standing-profile runs and this tip.
- Part B (measurement-proof refresh): before, test-measurement-proof-update.js FAILED
  exit 1 ("Proof source inputs are not current"); owed-check: r211 panel stale by 14
  keys (planignite-fix + r213 + version bump); b20/b19/b18/b13/b12 all fail validate.
  After: fresh neutral panel regenerated (--n 1, seed 7 x 4 policies x 150d), 0 stale
  keys, neutrality 4/4, tuple identical to r211 and b20. Proof test 9/9, workflow 9/9,
  test-gateproof-a.js 13/13 (incl. stale-input negatives: r211, b20, and this round's
  first panel all fail validate on the new tip). Panel sha 5250a90d..., proof re-pointed
  at evidence/2026-11-17/neutral-gateproof-a-rebased.json.gz. Cache-flags 0/4 in the
  owed-check was the load artifact again (58.7s wall vs 30s spawn timeout); 4/4 twice
  after with no code change.
- Master moved mid-run (9be3676d8 -> 3cb0782e5, 6 manifest files); the first panel went
  stale per the prereg, so the branch rebased (stop-at-pick quirk on pick 3, verified
  unapplied, continued cleanly) and the panel regenerated on the new tip. Row movement
  3/4 headline rows vs r211, 2/4 between this round's two panels — verified as game
  movement (determinism proven: capable/seed 7 twice byte-identical, same stateHash),
  neutrality tuple exact. Aggregates unchanged (won/national/table 1/4, wave-5 2/4).
- Landing: ff-merge unpiped (7 files, +790/-2), proof re-verified on merged master
  (test-measurement-proof-update.js 9/9, test-gateproof-a.js 13/13). Tree released
  done-merged, branch deleted, main tree clean at tip 546823138.

## Wall numbers (this run's judged corpora — re-verified Nov 9 corpora; no new sims)

- wideduty confirm (12 seeds, competent, 150d): national 0/12, table 0, wins 0,
  wave-4 12/12, wave-5 4/12, median survival 122d, deaths 74 capable / 82 risk-aware.
- sametick fresh run (8 seeds, competent, 150d): all eight villages village-lost
  (75-143d, median 89d), national 0/8, table 0, wave-5 2/8; duty cures 43/43 captured.
- No new sim corpus was run this round; the wall is unchanged from the Nov 9 record.

## Telemetry deviation check

Ran on the wideduty confirm-after corpus (the one judged per-seed corpus this run
re-verified): 3 LOUD lines — national 12 -> 0, table 16 -> 0, wins 16 -> 0 (n=13
files). Verdict: REGIME artifacts, same as every prior run's identical lines. The
corpus is competent-only, pre-seat (no courtship/seat instruments); national/table/wins
are structurally 0 in that regime, and the WINSEAT baseline's own regime note forbids
the comparison. The corpus is Nov 9, re-verified byte-for-byte, not re-run — no new
signal. Baseline NOT rolled.

## Metric review

- Pre-registered metrics bound the run: wideduty/sametick judged only vs their frozen
  Nov 9 preregs (reproduced, not re-scored); gateproof judged vs its own prereg (gate
  0 attributable failures beyond the standing profile; proof-update green after
  refresh). No metric was re-scored mid-run. The gateproof spec deviation (current
  proof spec vs the brief's stale 30d spec) was recorded in the prereg BEFORE running
  and is accepted above — the alternative would have shrunk maintained coverage.
- Metric note for the next run: the standing gate profile should carry last-seen tip
  per failure (the parity-gear failure it names no longer recurs; the proof-staleness
  pair is gone by design). The row-stability check should be scoped to rounds whose
  intervening changes are panel-invisible (gateproof follow-ups, in its evidence).
- Convergence state: food-economy stays converging (NOT converged). The two medic
  levers are now verified live on master with their proofs green; the measurement proof
  is current again. No food-economy default flipped this run (the wideduty lever was
  already live; the sametick fix is an instrument). Scale-onramp / winnability chain
  stays converging (untouched; Loop B live on it).

## Infrastructure

- Service restart during the first worktree-register (sim-rotdecide-a): branch created,
  registration did not complete; branch deleted, re-registered clean as sim-gateproof-a
  after the arm re-brief (registration itself ~10 min, CPU-bound git reset --hard).
- Registry-lock serialization: the sametick release queued ~9 min behind Loop B's
  sim-planignconfirm-b registration (12:09Z) and the journey-scale release; no work
  lost, no lock surgery.
- Safe-commit index clobber struck the wideduty worker commit, the sametick coordinator
  commit (MM variant), and all four gateproof worker commits — repaired via the
  ls-tree -r pipe each time, blobs verified, commits always correct. A stale Nov 13
  index.lock blocked one repair; removed (no live process held it).
- Ship version bump e390dff60 landed mid-run; master moved twice under the run
  (journey r233, deathcleanup addendum 1e74e1078); every landing rebased onto the
  explicit tip with proofs re-run after.
- check.js --quick NOT re-run on merged master beyond the gateproof worker's own gate
  (338/2, 0 attributable) — zero src/js in all three landings.

## Next blanks (food-economy, in order)

1. Medic guarantee that doesn't consume the roster lottery draw + medic-RETENTION
   measure (old blank #3 — now unblocked: the wideduty lever is live on master).
2. The gateproof follow-ups: phone-frame receipt refresh (owner), ladder-bundle
   ambient-raid control 0/200 (owner), row-stability check scoping, standing gate
   profile last-seen-tip per failure.
3. Flee-repair build (Steve-call, still held); sit-becomes-win, sweep table contract,
   capstone readiness, trial-by-combat staging, Binding-never-fires follow-up, gating
   leg-4 recalibration (Steve-calls / decisions owed).
4. The rot family is CLOSED (see pre-registration note above) — do not re-open without
   a new mechanism or a new question.
5. Orphan-adoption process note (filed as a findings-backlog line this run): a
   "stranded" tree can be a stale snapshot of already-landed work — adoption must
   check merge-base BEFORE assuming stranded.

Claim deleted; lock deleted. Evidence commits: ed55adddd (wideduty deltas),
3cb0782e5 (sametick addendum), 546823138 (gateproof merge).
