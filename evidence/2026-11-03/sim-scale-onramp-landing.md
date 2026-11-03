# sim-scale-onramp-landing — stale-lock recovery + landing of sim-sortietarget-a (Loop A, axis scale-onramp)

Run: fleshout-20261103T121834Z. This run did no fresh sims of its own: it
recovered the dead 0940Z run and landed that run's GO arm. Nothing here
re-scores the arm — the arm was judged under its own prereg (below).

## Stale-lock recovery (guard outcome)

- Lock at run start: fleshout-20261103T0940Z, created 2026-11-03T09:42:29Z.
- Its claim (lever-claims/fleshout-20261103T0940Z.json): axis scale-onramp,
  arms sim-sortietarget-a + sim-w5faced-diag-a.
- Registry heartbeat for sim-sortietarget-a: 2026-11-03T11:12:13Z — 63 min
  stale at this run's 12:18Z start, no processes for the arm, last worktree
  write 11:39Z (panel cases dir). Previous run DEAD by the guard rule.
  Stale lock deleted, own lock + claim written before any other work.
- Pre-flight at start: main tree briefly dirty (1 untracked file,
  evidence/2026-11-02/arrears-clearing-verb.md, written 12:16Z by the live
  gap-arrears sibling) — re-checked minutes later and CLEAN: the sibling
  landed it as fce4cd986 (now master tip at rebase time). No file was
  touched, moved, or committed by this run to clear it. Disk 26%.
- worktree-reap.sh: 9/16 active, nothing removed; all dirty trees
  (including the adopted sortietarget tree) left alone, as designed.

## The arm landed: sim-sortietarget-a (0815Z next blank 1, Q2 sortie aiming)

Worker evidence: evidence/2026-11-03/sim-sortietarget-a.md (committed in
this landing). Prereg: scripts/sortietarget-prereg-20261103.md, committed
first as 35773c3a4 (rebased here to 697e5c33b). Arm commit (this run,
from the dead worker's uncommitted state, after re-verification):
7882f6965 — "sim-sortietarget-a: sortie target-agreement (match-first)
+ per-lingerer beats buttons [needs-eyes]".

What it does, in plain words: when beasts linger at the treeline gorging
every night, the village could answer with a sortie — but the sortie
fought beasts in whatever order they happened to stand in, so the beast
whose name was announced was often never fought at all (baseline: in
15 of 17 confirm multi-sorties, the offered name was never fought).
Now each lingering beast gets its own button naming it, and the sortie
fights the named beast FIRST, then the rest in order. If no name matches,
order is unchanged. Aiming repairs the promise, not the danger: the
paired read (seed 98402) still loses Chloe on day 79 — to the beast
that was actually answered.

## Re-verification by this run (before committing anything)

- Diff read: exactly the change the worker evidence describes —
  havenGrowth.js (+67/−14: lingerKeyFor stable token, offer record,
  match-first loop, attribution fought[]), app.js (per-lingerer buttons
  + handler passes spec[2]), docs/ONTOLOGY.md (provides line only).
- Proof test re-run (pre-rebase AND post-rebase): ALL GREEN both times,
  identical numbers to the worker's claim (20 multi-sorties, 74 fought
  entries, 100% first-fought agreement).
- Adjacent suites re-run post-rebase: test-lingerer-20261016 36/36,
  test-gaps-ghost 9/9, test-oldcore-classify 19/19.
- validate-ontology.js: 130 systems validated, "Ontology matches code"
  (its rewrite of ONTOLOGY.md was a no-op; diff stayed 1 line).
- check.js --quick NOT re-run in full: the worker's first run gave
  276 passed / 14 failed in 1337s with the failure list uncaptured
  (one visible failure in an unrelated voice-gating test) and its
  re-run was killed by a service restart. The 14 are NOT claimed as
  pre-existing. The landing rests on the proof + adjacent suites +
  narrow diff; the full-check caveat is carried, not buried.
- UI leg is static-only (app.js is DOM-only, excluded from node
  loads): the ship loop's phone check owns browser proof of the new
  buttons. Hence [needs-eyes] on the arm commit.

## Pilot + confirm (worker's pre-registered bars, judged as registered)

- G1 fixture 100% (n=20) — PASS. G2 field: pilot aimed 20/20
  target-fought, multi first-fought agreement 13/13; confirm aimed
  27/27, multi agreement 10/10; zero crashes/errors in all 40 runs —
  PASS. G3 no-regression: pilot deaths 386 vs baseline 395, wins 3
  vs 3; confirm deaths 598 vs 605, wins 3 vs baseline 5 − 2 = 3
  (exactly at bar) — PASS. VERDICT: GO (both stages).
- Wall context (wiring arm, NOT wall movement): pilot national 3 → 2,
  tableDone 3 → 3, wins 3 → 3; confirm national 1 → 1, tableDone
  5 → 3, wins 5 → 3; wave-5 0 in both stages, both arms. The
  wins/tableDone dip is trajectory divergence after the first aimed
  sortie lands, not a targeting defect (deaths nearly identical).
- §15 balanced panel: INAPPLICABLE as declared in the arm prereg
  (registry policies never answer lingerers, so no panel run can
  observe a sortie); the identical-seed driver table is the
  before/after instrument (sortie-b precedent). No compare file
  fabricated. A stray panel case file the worker left behind
  (evidence/2026-11-03/sim-sortietarget-panel/cases/c167a87f….json,
  60d, written 11:40Z) was NOT committed: it has no compare output
  and is not cited by the arm evidence. It is discarded with the
  worktree; its key is recorded here so the decision is retraceable.

## Telemetry deviation check (body step 10)

Attempted: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<perseed-sortietarget-a glob>' --metrics national,table,wins,exiled.
Result: REFUSED, no LOUD lines — "all 40 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." This is an input-shape refusal, not a
deviation, and differs from the prior runs' jsonl complaint. Baseline
NOT rolled (no --update-baseline, no --allow-recorder-corpus).

## Metric review

- No metric re-scored mid-run by this run; the arm's bars were judged
  by its worker under its prereg and are reported as reported.
- For the retry arm (see Next blanks): judge field agreement on
  multi-sorties only (single-lingerer agreement is trivially 100%
  in both arms and inflates pooled rates), and pre-register the
  denominator (answers vs ok sorties) explicitly — both lessons are
  in the arm evidence's metric-review section and are carried here
  so the retry does not re-learn them.

## Village assessment / sense-testing (from the arm evidence)

Paired read, seed 98402, same village/party/rations: baseline day 77
answers (latest offer: The Influencer) but fights the Big Beast then
The Eater, Chloe dies to The Eater, The Influencer gorges again —
the village paid its leader's life for a fight with a beast it was
not answering. Variant fights The Influencer FIRST every day
(vFlee, vFlee, vDie, vFlee); Chloe still dies day 79. No new robotic
behavior: sorties still read as mustered villagers walking out with
real rations and coming back changed. Pre-existing wrinkle, not
introduced here: after a leader dies mid-sortie the bench is often
bare ('no-fighters'), so the village endures by default while the
gorge continues — the muster gate working as designed.

## Landing mechanics (this run)

- Arm commit a90497b79 (pre-rebase) hit the known safe-commit index
  clobber: all 49 committed files showed staged-as-deleted in the
  worktree index while worktree bytes matched HEAD. Repaired per the
  standing lesson (update-index --add --cacheinfo from HEAD blobs,
  all 49 files); verified git status clean except the panel stray,
  git diff HEAD empty, sample hashes byte-identical. Commit itself
  was correct throughout.
- Rebase onto current master fce4cd986: clean 2/2, no quirk, no
  conflicts. Origin check: freshly fetched origin/master (80b5ff25,
  batch ship 112500) is an ANCESTOR of local master, local 13 ahead
  — no divergence, no stale-base hazard; the rebased branch contains
  origin's tip.
- Merge to local master via --ff-only (this run's closeout step),
  worktree released + removed, branch deleted, final reap, main
  tree verified clean. Merged locally, pending ship — no push, no
  version bump (ship loop owns both).

## Convergence state

scale-onramp: converging (NOT converged). The Q2 game-code blank is
now filled AND landed: a sortie CAN aim at its offered name, in
fixture and in the wild, with no wall regression. The full seat is
still unwon in these runs and wave 5 still unfought in normal play;
this arm never claimed otherwise.

## Next blanks (in order)

1. Sortie RETRY (unblocked by this landing): Q1 invalidation rule +
   aiming together, measuring sortie VALUE (not wiring) — needs its
   own prereg with wall bars of its own, multi-only agreement, and
   an explicit answers-vs-ok denominator.
2. Wave-5 wall: the 0940Z claim's second arm (sim-w5faced-diag-a)
   has NO tree and never ran — BUT its blank (0815Z blank 3) is
   nevertheless answered on master by w5faced-competent (e534dc00f,
   shipped in batch 112500): 20-seed competent corpus, 1/20 unlock,
   1/20 faced, 0/20 killed; readiness-5 release is the wall. The
   next wave-5 work starts from that finding, not from a fresh
   diagnostic.
3. Sibling Loop B's 0856Z run is closed (claim retired .DEAD):
   sensorconfirm3 INSUFFICIENT-DATA at calibration gate +
   guardcasc DIAG-COINCIDENCE; food-economy stays converging.

## Files

- Arm: src/js/havenGrowth.js, src/js/app.js, docs/ONTOLOGY.md.
- Arm tooling/proof: scripts/policies/sortietarget.js,
  scripts/sortietarget-analyze.js,
  scripts/sortietarget-driver-20261103.js,
  scripts/sortietarget-fixture.js, scripts/test-sortietarget-a.js.
- Arm evidence + per-seed JSONs (40): evidence/2026-11-03/
  sim-sortietarget-a.md, perseed-sortietarget-a/.
- This run's evidence: evidence/2026-11-03/sim-scale-onramp-landing.md
  (this file).
