# Coordinator evidence — Loop A run fleshout-20261104T0415Z (axis scale-onramp)

## Run header (pre-registered per arm; this file judges nothing new)
- Axis: scale-onramp (topmost non-converged; Loop B 0130Z live on food-economy
  throughout, NOT touched; Loop B's 0330Z toggle-b round landed mid-run, NOT
  touched; goals/gap/journey/ability-use lanes NOT touched).
- Arms: sim-fleerepair-adopt-a (0215Z next-blank 1: finish the orphaned 0115Z
  fleerepair pilot, judge vs its 0115Z prereg GO) and sim-tbobsfeed-a (0215Z
  next-blank 2: TB-observation-feed lever, prereg committed before any judged
  sweep). Policies/horizon: competent verbatim, 140d death-aware, pilot seeds
  99101–99108, confirm 99109–99116 where the prereg requires it. Balanced
  panel: N/A with stated reasons (fleerepair: pre-registered per-seed table +
  analyzer aggregates; tbobsfeed: panel requires panel-runner corpora and
  carries no TB-exposure metric) — the pre-registered thresholds are the
  judges, not the panel.
- Pre-flight: main tree clean at run start (0 files), disk 30%, reaper run
  (13/16 active, fleerepair-a tree preserved — uncommitted corpus — all other
  live lanes untouched). No lock existed for this loop at run start; lock +
  claim created 04:13–04:15Z. Registration slow both times (registry flock
  congestion, ~2.5–5 min each), as on 0215Z/0046Z.

## Arm 1 — sim-fleerepair-adopt-a: PILOT GO (confirm still owed, NOT a landing claim)
- Branch merged: sim-fleerepair-adopt-a, tip 172f01311 after coordinator
  rebase onto current master (worker tip 7e2ce5d13, rebased from 18beb0c6c).
  Proof scripts/test-fleerepair-20261104.js ALL PASS post-rebase and on
  merged master. Evidence: evidence/2026-11-04/sim-fleerepair-adopt-a.md,
  corpus evidence/2026-11-04/perseed-fleerepair-a/ (16 files).
- Adoption done right: branch reset to stranded tip 0018227b2; all 11 orphan
  files copied from hidden_files/orphan-fleerepair-20261104/ md5-verified;
  armed legs 99104–99108 run on the branch AS-IS (no rebase before judging —
  game.js drifted +103 lines since branch base and 0215Z proved identical
  seeds diverge across bases). Drift check: the +103 lines are firenarr
  evening narration + a teaching/journal note; grep over the diff for
  tbBarrierExit/tbfight/tbPlayerMove/tbEnd/flee/Barrier returns nothing —
  drift does NOT touch flee/TB paths. competent.js byte-identical between
  branch base dbfeb63eb and master; the branch change is the gated
  COMPETENT_FLEE_REPAIR policy change only (directional branch, defaults
  untouched, player flee only, no monster-flee change).
- Judged table (8-seed pilot, strict 0115Z prereg — GO iff ALL hold):
  escapes armed 2 (baseline 0) vs bar ≥ 2 — PASS, exactly at threshold;
  median strikes/fight armed 4 vs baseline 2 — PASS (lost-fight median also
  4 vs 2); cost bar (a) starvation armed 2 total (0 fight-attributable) vs
  control 5 — PASS on totals and arm-only readings; cost bar (b) median
  survival armed 120.5d vs control 107d (bar 85.6d) — PASS.
- Mechanism: barrier pushes baseline 0 on all 8 seeds vs armed 6;
  flee-attempt turns 34 → 2; zero-tile-move turns in W4 exposures 32 → 0.
  The old walk-to-edge loop class is gone from W4 exposures. Baseline: 26
  exposures (4 kills, 22 fighter-died, 0 fled); armed: 47 exposures (10
  kills, 35 died, 2 fled). Exposure-count divergence is chaotic trajectory
  divergence under the different flee policy — totals judging per prereg is
  the honest route, shown plainly in the arm evidence.
- Sense-test PASS: both escapes read as people escaping (99103 day 85
  creek barrier-crossing; day 129 Haven-barrier escape with allies mauled
  meanwhile), not silent no-op loops. Before: 99105 exp#2, 25 turns, 11
  flee attempts, 0 pushes ever, death.
- Caveats carried forward (do NOT soften): calibration gate FAILED vs
  tbfinish (baseline 26 exposures, not 51; days diverge on every seed) —
  re-baselined to the orphan baseline leg, single-base judging only;
  tbfinish numbers are never cited as baseline. Escapes are thin: exactly
  2, both on 99103, both round-1 endings with 0 bracketed turns (the pending
  buffer misses fights ending fled in the opening pass; escapes live in
  transcript say-lines only). Repair-specific counters (consumed-push,
  stuck-resolution) are not captured — mechanism firing is inferred from
  aggregate shape, not counted. National/table NOT MEASURED, not 0 — the
  per-seed JSON carries no standing/scale field and the summarizer
  hard-codes 0; reporting them as measured 0 would be fabrication.
- Prereg confirm requirement, stated loudly: the 0115Z prereg requires a
  12–16-seed confirm before ANY landing claim. This merge banks the pilot
  evidence + default-OFF code (no default behavior changed, scripts/ and
  evidence/ excluded from deploy) so the work cannot orphan again — it is
  NOT a GO/landing claim. The confirm is next run's first job.
- Wall numbers (this arm's pilot, reported NOT judged): wins 0/0; wave-4
  faced 46 baseline vs 88 armed; wave-4 kills 5 vs 10; wave-5 faced 0/0;
  median survival 107d vs 120.5d. Scale wall unchanged by a pilot-sized
  arm, as expected.

## Arm 2 — sim-tbobsfeed-a: pilot GO, confirm NO-GO → LEVER KILLED, reverted
- Branch merged as documentation + instruments ONLY: sim-tbobsfeed-a, tip
  b22891eb8 after coordinator rebase onto current master (worker tip
  0c882322e). Net src/ diff vs branch base is ZERO (lever commit
  6fad3dd45 reverted in aad555fba); archived proof
  evidence/2026-11-04/tbobsfeed-proof-archived-20261104.js syntax-checked
  after rebase; no dangling test left in scripts/. Evidence:
  evidence/2026-11-04/sim-tbobsfeed-a.md, prereg
  evidence/2026-11-04/sim-tbobsfeed-a-prereg.md, corpus
  evidence/2026-11-04/perseed-tbobsfeed-a/ (32 files). Nothing playable
  depends on this branch.
- The lever (while armed): in Game.tbEnd's Scholar Trick Observation block,
  'won' joined 'fled'/'routed'/'calmed' under the same scholar-alive guard,
  feeding every distinct monster kind fought (alive or dead — a won fight's
  monsters are dead, so the old alive filter would have fed nothing). Same
  bar, same threshold 2, same first-person narration, same tele events; no
  gate/price/deed/standing change; no monster-flee change. Proof while
  armed: 14/14 (won feeds 0→1, threshold stays 2, second won completes 2/2
  with COUNTER LEARNED narration, lost feeds nothing in scholar-alive and
  scholar-dead shapes, 2 dead of one kind feed 1 not 2, already-known feeds
  nothing, fled channel unchanged).
- Judged numbers (competent verbatim, 140d, prereg committed before any
  judged sweep): pilot 99101–99108 GO, all legs pass — feed rate 3/3
  (100%) ≥ 80%; knowledge: eulogy gained on 99103 (TB won fight day 74 fed
  obs 1 + villager field observation day 83 completed 2/2; baseline ended
  eulogy at obs 1, unknown) and 3 fed observations total; cost bar:
  starvation 6 vs baseline 5 (≤ +2), arm-only village losses 0, median
  survival 118 vs 118. Confirm 99109–99116, judged on its own baseline,
  NO-GO — feed rate 1/1 passes, but leg 2 FAILS (0 kinds gained, 1 fed
  observation < 3 — the band held exactly 1 won TB fight) and leg 3b FAILS
  (99110 survived in baseline, lost day 134 armed). Legs 3a (starvation
  3 vs 2) and 3c (median 98 vs 94) pass. Per §14 the miss is NO-GO, never
  re-scored; pooled numbers (4/4 fed across bands) are descriptive only
  and do not rescue the verdict.
- Wall numbers (all legs): wins 0, national 0, table 0, wave-5 faced 0.
  Knowledge alone moved nothing on the wall, as pre-registered (no verb
  change). The trickcensus verdict stands: knowledge without a verb is
  decoration, and the playable wave-4 signature verb is still the missing
  half.
- Sense-test PASSES: fed lines read as people learning ("You lived to tell
  it — The Eulogy's moves are burned into your memory. (1/2 — one more
  survived encounter and you'll have its trick.)" — 99101 d134, 99103
  d74, 99105 congregation d90). The sense-test is not what failed.
- 99110's loss investigated, not hand-waved: mixed terminal week
  (dehydration, unclosing wound, monster kill, starvation, contest death),
  no single feed-caused kill, no wave-4 knowledge at end — trajectory
  divergence with a worse draw, not demonstrated feed toxicity. 99114 cuts
  the other way (armed lived 101 vs 70 days, 1 wave-4 kill vs 0).
- Metric review (carried to the NEXT prereg, not re-judged here): paired
  trajectories diverge from the first won fight of ANY wave (verified:
  armed 99105 re-ran bit-identical except the run tag) — low-wave won feeds
  change knowledge state, which changes behavior through existing
  teaching/trick channels (99110 armed learned 7 wave-3 signatures yet met
  zero wave-4 TB fights; baseline met 5). A 0-tolerance paired-loss bar
  and an absolute fed-count bar misfit behavior-changing levers; the next
  arm's prereg should use aggregate harm bars and opportunity-scaled
  knowledge legs.

## Wall numbers (this run's panels, NOT wall movement)
- Pooled: national not measured (fleerepair) / 0 (tbobsfeed), table 0,
  wins 0, wave-5 faced 0, wave-5 kills 0, full seat 0. Median survival:
  fleerepair pilot 107d baseline / 120.5d armed; tbobsfeed pilot 118/118,
  confirm 94 baseline / 98 armed. The wall is still two precise mechanisms
  with named next steps: staying (flee repair pilot-GO, confirm owed, plus
  in-fight recovery still unbuilt) and the playable wave-4 signature verb
  (feed-only killed at confirm).

## Telemetry deviation check
- REFUSAL (recorder-corpus shape), same refusal class as prior runs — NOT
  a metric deviation. Both corpora refused: fleerepair 16 rows and
  tbobsfeed 32 rows all carry top-level anchorCommit, so telemetry-check
  refuses them as recorder corpora ("compared with sweep-compare tables,
  never against a run baseline here"). No LOUD lines, no deviation to
  investigate. Baseline NOT rolled (fleerepair is default-OFF policy code;
  tbobsfeed net src/ diff is zero — no wall metric could have moved).

## Metric review
- Both preregs held: fleerepair judged strictly on the 0115Z GO (pilot
  only — confirm explicitly still owed); tbobsfeed judged strictly on its
  own prereg (confirm miss = NO-GO, no pooled rescue). One metric note for
  the NEXT run, from tbobsfeed: do not reuse a 0-tolerance paired-loss bar
  or an absolute fed-count bar for a behavior-changing lever — use
  aggregate harm bars and opportunity-scaled knowledge legs. From
  fleerepair: the "arm-only deaths" phrasing is ambiguous (interpreted both
  ways, both pass); the driver needs a scale field before any future wall
  claim from this instrument.

## Findings appended
Four items appended to hidden_files/sim-findings.md (copy-temp-verify-rename,
never in-place edit): tbobsfeed confirm NO-GO (feed-only killed, verb half
still open); paired-trajectory divergence + confirm-bar misfit; fleerepair
pilot GO with confirm owed + thin escapes + round-1 fled endings missed by
the pending buffer; fleerepair mechanism (walk-to-edge loop gone from W4
exposures) + national/table unmeasured (driver needs scale field).

## Infrastructure
- Registration slow both arm trees + coordinator tree (registry flock
  congestion, ~2.5–5 min each); all trees heartbeated immediately after
  registration and verified by readback.
- Rebase stop-at-pick quirk hit the tbobsfeed coordinator rebase (kill
  commit listed in todo, worktree clean, pick unapplied) — recovered with
  git rebase --continue per the house lesson; all 6 commits replayed, src/
  diff zero after. Fleerepair coordinator rebase clean (5/5).
- Safe-commit index clobber hit the fleerepair worker commit (repaired via
  HEAD-blob cacheinfo, verified) and all five tbobsfeed worker commits
  (same repair each time); coordinator commits clean. No EPERM flap blocked
  this run. check.js --quick NOT re-run on merged master (fleerepair proof
  green on merged master; tbobsfeed net src/ diff zero; tbobsfeed worker's
  --quick attempt stalled under concurrent sibling test load and was
  killed — the revert's verification is byte-identical restoration of the
  pre-feed game.js blob, hash-verified, plus node --check and the 14/14
  proof while armed, stated plainly in the arm evidence).
- Master moved under the run (Loop B 0330Z toggle-b round, journey
  establishment r84, firenarr-deploy-b); both branches rebased clean in
  their own worktrees / by the coordinator, proofs green after every
  rebase. Loop B 0130Z claim + trees NOT touched (food-economy untouched).
- Final reap NOT run at closeout (sibling lanes active; the reap at
  run start already swept). Worktrees released done-merged, branches
  deleted, main tree clean at closeout.

## Next blanks, in order
1. Fleerepair confirm (12–16 seeds, prereg requirement before any GO claim
   — pilot GO only; run on the merged default-OFF policy, fresh band or
   99109–99116, judged against the same GO legs).
2. Playable wave-4 signature verb (the missing half — feed-only killed at
   confirm; knowledge without a verb is decoration. Pair any future feed
   re-test with at least one playable verb, or pre-register the verb as
   the judged lever with the feed as its enabler).
3. STAYING arm, second half: in-fight recovery (flee repair is pilot-GO;
   staying = flee repair + recovery, and recovery is still unbuilt).
4. Rage once-per-fight gate + pocket_sand flee-order fix (smaller, after
   2–3).
5. Hold-beat veteran timing check + veteran-kill narration vs mop-up
   (99110 two-veteran window door/standing still uninstrumented).
6. Readiness-5 release-after-ready test, owed once any village reaches
   ready days.

scale-onramp stays converging (NOT converged): full seat still unwon,
wave-5 kill still 0 in normal play, but flee repair is now pilot-GO with
its mechanism proven (walk-to-edge loop gone), and the observation-feed
question is settled as feed-only: killed at confirm, verb still owed.

Claim deleted; lock deleted.
Merged locally, pending ship (fleerepair-adopt 172f01311; tbobsfeed
b22891eb8; coordinator evidence this file).
