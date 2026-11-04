# Loop B run fleshout-loop-b-20261104T0930Z — coordinator evidence
Axis: scale-onramp (winnability-chain re-point, tracker next blank 1 from 0830Z).
Arms: sim-recovery-tend-b + sim-recovery-zombie-b. Merged locally, pending ship.
Net src/js diff vs Loop A tip: ZERO (both levers NO-GO; no default behavior changed).

## Run context
- Loop A 0820Z live at run start (claim fleshout-20261104T0820Z: askplus,
  fleerepair-confirm, holdbeat; fleerepair-confirm worker heartbeat 10 min
  old) — NOT touched. Loop A closed out mid-run (claim deleted by its own
  closeout; master moved to 2106108b8: askplus NO-GO, fleerepair-confirm GO
  on 12 fresh seeds, holdbeat DIAG-GO). Both B branches rebased onto
  2106108b8 clean, proofs re-run, then merged --ff-only, no conflicts.
- Arm choice: the re-point queue's item (1), the arm-2 toggle, already has
  its verdict from today's 0330Z/0445Z/0550Z runs (MORALE credited, GEAR
  credited, SIGDMG/TRICKHOLD non-attributed), so this run took the latest
  tracker next blank: the recovery arm, testing tend-through vs.
  zombie-clearing separately, never bundled. Queue item (2) flee-repair
  stayed Loop A's (its confirm landed GO); queue item (3) standing
  accumulation was covered by the 0550Z standacc arm.
- Pre-flight: main tree clean, disk 30%, reaper removed nothing
  sibling-owned (12/16 active; dirty trees refused, including Loop A's live
  fleerepair-confirm tree and the orphaned fracchoice tree, left alone).
  B lock + claim written before any sims.

## Arm 1 — sim-recovery-tend-b: NO-GO, split verdict (pilot, 8 seeds)
Worker branch sim-recovery-tend-b, commits 1ac94717a (prereg), d02c72d1b
(instruments + proof 32/32), 1d7aa6814 (pilot + evidence). Zero src/js.
Policy: NEW opt-in file scripts/policies/leadcourt-tendthrough.js =
leadcourt with ONLY the pantry > 20,000 tend gate removed (weekly cadence,
Haven-primary only, 1,500 kcal cost, proposal gate unchanged).
leadcourt.js untouched. The policy lands as a measurement tool only; no
default policy changed, so no player-facing behavior changed.
Seeds 99401–99404 + 99409–99412, 300d death-aware, baseline cited from
sim-polityfrag-b.md (not re-run).
- GO leg (a) PASS 3/3: all three baseline-collapsed seeds (99402, 99403,
  99411) hold to village death, hold-share 1.000, 0 drops (bar >= 2).
- GO leg (b) FAIL: 99409 (C→D, 111→82d) and 99410 (C→D, 107→95d) regress
  a survival band (bar <= 1). Overall NO-GO, not re-scored.
- Pooled: baseline 5 diplomacy seeds, 274/343 = 0.799, 3 drops, 0
  recoveries → tend-through 6 seeds, 375 diplo days, hold-share 1.000,
  0 drops, 0 recoveries. Total tends 143 → 703, 611 (87%) at snapshot
  pantry <= 20,000 kcal — the lever fired. 0 instrument errors, 8/8
  classified.
- Prevention, not recovery: every success is a hold; no seed drops, so
  post-drop recovery is exercised zero times. 99404 flips never →
  holds-to-death, faces wave 5, 16 ready days, final standing 502.
  99401's BELONG link still breaks (d91), still never tended; its
  re-proposal (d93) forms ANOTHER untended BELONG link (d94), so
  regional+ never fires. Cost hypothesis (not proven causation): the two
  regressors are former holders that needed the lever least (99409: 73
  tends vs 27 baseline; 99410: 72 vs 42) — grain-spend on villages that
  did not need it. A future floored-tend variant should pre-register
  death-day deltas plus a wave-facing guard.
- Sense: zero cooling-warning / "realm came apart" lines across 8 seeds —
  the absence is the finding, consistent with zero drops. Capture limit:
  the instrument's SAY_RE misses tendLink's own grain lines, so tending
  is proven by event counts (703), not quoted lines.
- Full report: evidence/2026-11-04/sim-recovery-tend-b.md.

## Arm 2 — sim-recovery-zombie-b: NO-GO (pilot, 8 seeds)
Worker branch sim-recovery-zombie-b, commits 5887e8e2e (prereg),
c42730d4d (engine rule + proof 34/34), bae37420f (pilot + evidence).
DISPOSITION (coordinator decision, per killed-arms-leave-no-trace): the
engine rule did NOT land on master. What landed is the landing branch
sim-recovery-zombie-landing (a84e869fd prereg, 753137364 pilot +
evidence, 429909422 driver + analyzer): prereg, evidence, per-seed
corpus, driver, analyzer. The src/js rule (hierarchy.js 'faded' clear)
and its proof script stay on branch sim-recovery-zombie-b, HELD for a
future recovery arm — not merged, not deleted. No default behavior
changed.
Rule (held on branch): at the weekly linkTick boundary, a Haven-primary,
non-conquered, active link at trust <= 0 is said aloud and broken as
'faded'. Code verification found the real blockers are the active-count
proposal gate + linkWith's active-only duplicate guard (the neglect snap
is succession-only, never weekly, so it was never the blocker). Trust
math, tribute, seasoned bars, polity size, gates, prices untouched.
Seeds, horizon, policy (leadcourt verbatim), and instruments as arm 1;
baseline cited from sim-polityfrag-b.md.
- The clear works in the wild: 99402, exactly where diagnosed —
  pre-clear determinism exact over 131 snapshots <= d133, 0 mismatches;
  Thornfield faded line d140, broken snapshot d141. But the village died
  d141, one day after the clear, with a 1,000-kcal pantry — far below
  leadcourt's 12,000-kcal proposal gate and ~35 days short of the
  re-seasoning a fresh link needs. Re-proposals 0, re-links 0,
  diplomacy recoveries 0 on all 8 seeds.
- The other collapsed seeds never reach trust 0 in life (99403 dies a
  day after its drop; 99411's weakest link only decays to 31). 99401's
  BELONG zombie reproduces exactly (trust 0 d85, broken d97) and is
  correctly NOT cleared by this rule (Haven-primary scope guard).
- No seed regressed, no hold broke: zero measured cost of the rule.
  Recommendation (worker + coordinator): keep the rule HELD, and judge
  recovery on longer-lived seeds or alongside the tend-through result;
  do not re-run this pilot expecting a different recovery outcome. No
  12–16 confirm on either arm by worker authority.
- Full report: evidence/2026-11-04/sim-recovery-zombie-b.md.

## Scale-wall numbers (both arms, 8-seed pilots)
- Tend-through: wins 0/8, lost 8/8, survived-to-horizon 0/8. End
  scaleRank: global 6/8, regional 1/8, village 1/8, national 0/8 at end
  (table not instrumented). Wave-5 unlocks 2/8 (baseline 1/8), wave-5
  faced 2/8 (99402, 99404), wave-4 faced 7/8 (baseline 8/8). Ready days
  43 total (99402: 27 unchanged, 99404: 16 new). Median survival 114.5d
  (baseline 109), max 153d (baseline 146). Deaths 529, combat share 62%.
- Zombie-clearing: wins 0/8, lost 8/8. End scaleRank: global 2/8,
  regional 5/8, village 1/8 (identical to baseline). Wave-5 unlocks 1/8,
  wave-5 faced 1/8 (99402), wave-4 faced 8/8. Readiness-5 days 27 (99402
  only). Median survival 109d, max 146d. Deaths 543, combat 323/543 (59%).
- In plain words: villages still win lesser seats nowhere here and never
  the full seat; tending without a pantry gate keeps realms from
  collapsing but costs two villages their lives, and clearing a dead bond
  does not by itself bring a realm back — the village must live long
  enough and hold enough grain to court a replacement.

## Coordinator verification (independent of the workers' reports)
- Tend branch rebased onto 2106108b8 clean; proof re-run 32/32 on the
  rebased tip and again on merged master (32 pass, 0 fail).
- Zombie landing branch built from master (prereg + pilot cherry-picks,
  driver + analyzer checked out from the engine commit, committed as
  44d3ce453 then rebased to 429909422); `git diff master -- src/` empty
  at every step; hierarchy.js `node --check` clean; merged master vs
  Loop A tip: src diff 0 lines.
- Main tree clean after all merges (status empty). Tend worktree
  released as merged, removed, branch deleted. Zombie worktree + branch
  left in place, HELD (rule + proof on branch, evidence landed) —
  precedent: the fracchoice orphan; the reaper's stale auto-removal
  handles the tree, the branch is kept.
- Telemetry deviation check: attempted by both workers AND the
  coordinator on both corpora — REFUSED by the tool itself both times
  ("recorder-corpus input: all 8 rows carry top-level anchorCommit, so
  they are sweep recorder rows, not runs"). No compare fabricated, no
  --allow-recorder-corpus workaround used, baseline NOT rolled.
- Zombie worker note: repo-wide check.js --quick did not complete in
  ~8.5 min under sibling contention, so it was stopped rather than
  claimed; arm proofs (32/32 tend, 34/34 zombie on its branch), syntax
  checks, and 8-seed legs with 0 instrument errors all passed.
  Coordinator did not claim a green-list result.

## Next blanks, in order
1. A recovery arm on longer-lived seeds (or tend-through + zombie-clear
   COMBINED only after each leg's separate verdict is recorded — this
   run's separation rule is satisfied) — a village must survive the
   clear by 35+ days with pantry above the 12,000 proposal gate for a
   re-link to be testable at all.
2. A floored tend-through variant (tend below 20,000 only while pantry
   stays above a floor, or tend-through only for links below the
   seasoned bar) with death-day deltas + a wave-facing guard
   pre-registered, to test whether the polity gain can be kept without
   the survival cost.
3. The BELONG-tending gap (blank 2 from 0830Z, still open): a belongseek
   panel with a policy that tends subordinate links, to measure BELONG
   holding/diplomacy for real — tend-through does not fix it (99401
   re-proposes another untended BELONG link).
4. Peer-link corpus for LEAGUE shape (zero observed); SAY_RE instrument
   fix (first-word anchoring + dedicated proposal/counter channel).
NO gate/price/deed arm follows.

scale-onramp stays converging (NOT converged): the full seat is still
unwon, wave-5 kills still 0 in normal play, and polity recovery itself
is still unproven — prevention works, post-drop recovery does not yet.
food-economy stays converging (untouched; sibling Loop A).
Claim deleted; lock deleted.
Merged locally, pending ship (tend 1ac94717a + d02c72d1b + 1d7aa6814;
zombie landing a84e869fd + 753137364 + 429909422; zombie rule + proof
HELD on branch sim-recovery-zombie-b, unmerged).
