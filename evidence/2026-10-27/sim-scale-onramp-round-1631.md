# sim-scale-onramp-round-1631 — ADOPTION RUN (dead 1430Z A round completed, merged locally pending ship)

Coordinator: run fleshout-20261027T1631Z, axis scale-onramp (topmost
non-converged axis; no live claim at work time after the stale-lock
recovery below). No new arms were designed: this run completed the dead
1430Z A run's two arms exactly as pre-registered, judged them against
their own preregs, and merged them. Nothing was re-swept, re-scored,
or re-designed by the adoption.

## Stale-lock recovery (guard, per the loop body)

Run-start state: lock fleshout-20261027T1430Z (created 14:30:52Z, age
121 min at 16:31Z) + live claim fleshout-20261027T1430Z.json (arms
sim-fallbackfeared-a, sim-fullseatfixture-a). That run's worktree
heartbeats were 14:57:10Z and 14:55:51Z — 95+ min stale, far past the
15-min live threshold, and past the 90-min lock fallback. Verdict:
DEAD. The lock was deleted, the claim retired to .DEAD, and this run's
own lock + claim (fleshout-20261027T1631Z, same two arms suffixed
-adopt) were created. No live loop was touched: gap-closure trees
were heartbeating within minutes throughout and were never entered;
B-loop trees were left alone (B's 1430Z round had already closed).
The adopted trees were heartbeated immediately after claiming.

## Arm 1 — sim-fullseatfixture-a (1315Z next blank 4): TRAP-CONFIRMED + fixed

Branch sim-fullseatfixture-a, 3 commits, all by the dead worker:
prereg 306819128, fix 9e1bcf1a7, evidence 93990c420. The adoption
rebased it clean onto master 12622061f inside its own worktree
(new tip da6c115bd) and re-ran every proof on the rebased branch
and again on merged master — all green:
- test-fullseatfixture-a: 20/20 (the evidence's "21st" check was the
  pre-rebase trap demonstration, which correctly skips once HEAD
  holds the fixed text — the dead worker's own evidence says so;
  this is agreement, not a discrepancy).
- test-fullseat-diag-20261021.js: 10/10 with FULLSEAT=1 (9/10 without
  is the test's own env gate, pre-existing shape, documented in arm
  evidence); superset 9/9; scalegate 22/22.
Scope: test/mock-fixture only — the fullseat-diag mock's ok now
includes the national/global scale term per Steve's 2026-10-27
ruling, plus comment fixes in fullseat-diag.js. Zero src/js, zero
behavior change, no default flipped. [needs-eyes] does NOT apply
(test-only scope, per arm evidence). Merged ff-only first.

## Arm 2 — sim-fallbackfeared-a (1315Z next blank 2): PILOT-INCONCLUSIVE

Branch sim-fallbackfeared-a. The dead worker left: prereg commit
f404dbf31, an untracked 8-seed pilot corpus (16 rows + summary.json),
and an untracked proof script — but no evidence and no verdict.
The adoption judged the corpus as found against the binding prereg
(it did NOT re-sweep: a re-sweep on the moved base would be a
different corpus, not a verification of this one), wrote the
evidence, and committed corpus + proof + evidence (eb7c0a9d5,
then addendum 6560051d3 with the post-rebase proof note).
Rebased clean onto master twice (first onto 12622061f, then onto
da6c115bd after the first merge correctly refused ff-only —
no force, no merge commits), proofs re-run after each rebase,
merged ff-only second (tip ae7c81275).

Verdict (binding prereg, no re-score, no second band):
PILOT-INCONCLUSIVE. Fallback-feared seatings entered: 0/8, wins 0.
Defiance was offered on every seated seed (defiance 6–11), so rule
(1) pre-empted rule (3) on all 6 seated seeds; the 2 non-entering
seeds reached national at Arc 3 and never saw an offer. Baseline
feared 6/6 won; armed defiant 6/6 won; every other headline
identical per seed (days, deaths 236=236, starvation 0=0, median
132=132, national ever/final 8/8=8/8). Cost bar passes but cannot
rescue or sink an inconclusive primary.
Proof gates: G1 det-gate PASSES in both forms post-rebase
(unit + full-sim --detgate seed 74201: 137=137 days, dp={});
G2 leak PASSES (non-entering seeds 180/181 both legs);
G3 corpus PASSES 16/16. Full proof script: ALL APPLICABLE PROOFS
PASS on the rebased branch and on merged master.
Sense: no fallback-feared seating occurred, so none is claimed.
Arm evidence: evidence/2026-10-27/sim-fallbackfeared-a.md.

## Wall (this run's judged material)

- fullseatfixture: no sim band (fixture scope) — gate honesty
  proven, not reachability.
- fallbackfeared band (16 configs): national ever 8/8 both legs,
  entered 6/8 both, wins 6/8 both (feared baseline / defiant
  armed), all seats lesser, full seat 0/16, wave-5 0/16, wave-4
  4/8, median 132d.
- Standing picture unchanged: wins still come only through
  default-OFF instruments and the lesser seat; the full seat is
  still unreached; wave 5 is still 0 on every judged band of
  this run. scale-onramp stays converging, NOT converged.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../scale-wall.json
--current 'evidence/2026-10-27/perseed-fallbackfeared-a/*.json'
--metrics national,table,wins,exiled` → 2 LOUD lines
(national 12->0, wins 16->0, n=17 files). Both are the KNOWN
regime + field-shape artifact class: the WINSEAT baseline's own
regime note forbids this comparison, and per-seed rows carry
nationalEver/entered/won, not top-level national/wins paths
(summary.json is the 17th file). No exiled LOUD line. Baseline
NOT rolled, no new investigation. Fullseatfixture has no sim
corpus, so no telemetry run applies to it.

## Infrastructure (all disclosed, none hidden)

- Safe-commit index clobber hit both adoption commits in the
  fallback worktree (staged-deletion variant on the first,
  MM variant on the addendum) — repaired via HEAD-blob cacheinfo
  each time, commits verified correct (status empty + diff HEAD
  empty + hash match after repair). The fullseatfixture branch
  needed no repair.
- First fallback merge correctly refused ff-only after the
  fullseat merge moved master; rebased in the arm worktree and
  merged clean — the same pattern as every recent round.
- Det-gate full-sim took ~9 min wall time (sibling I/O
  contention with live gap-closure trees); verdict exact.
- Pre-flight reaper: nothing removed — all 16 trees dirty or
  active at cap (16/16); adopted trees heartbeated fresh before
  the reaper ran. Final sweep: adopted trees released as
  done-merged, worktrees removed, branches deleted; main tree
  clean at closeout (ae7c81275, status empty).
- check.js --quick NOT re-run: zero src/js in either arm, arm
  proofs are the attributable verification (1016Z/1121Z/1215Z/
  1315Z precedent). No push, no version bump, no live
  verification — ship loop owns pushes.
- Rotation file left untouched (convergence-directed work, not
  the lever rotation; the tracker is the plan).

## Next blanks, in order (from this run + 1315Z, unchanged)

1. The full seat itself — wave-5 unlocking is still the binding
   block (0 everywhere judged here).
2. A live rule-(3) firing needs a band where defiance is NOT
   offered (screen for unearned defiance first) — a future arm's
   prereg, not a re-score of the 74201–74208 corpus.
3. TABLE.md stage >= 3 vs code stage >= 2 — Steve call (carried).
4. Mock seat fallback ('none' vs 'lesser' when no f.seat) — a
   future arm's judged quantity if seat agreement is ever wanted.

scale-onramp stays converging (NOT converged). food-economy stays
converging (untouched; sibling loop B). Claim deleted; lock deleted.
Evidence: this file (coordinator) + sim-fullseatfixture-a.md +
sim-fallbackfeared-a.md + preregs + corpora. Merged locally,
pending ship.
