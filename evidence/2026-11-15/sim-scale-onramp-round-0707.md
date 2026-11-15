# Scale-onramp round 0707 — narrowed families 6b + 7b (transplant program)

Run: fleshout-20261115T0707Z (Loop A), axis scale-onramp (survival collapse).
Claim: hidden_files/lever-claims/fleshout-20261115T0707Z.json (deleted at closeout).
Lock: fleshout-loop.lock (deleted at closeout).
Master at run start: 96c139d75 (the 0547Z coordinator evidence).
Master at closeout: 3a0046dcb + coordinator evidence commit (this file).

Loop B live on winnability chain throughout — first the 0621Z run
(successorcaution-b + proofrefresh-b20), which landed mid-run as
8b77f0f40 (funeral-mend GO adoption, successor-caution PILOT-NO-GO,
proof refresh round 20 GO), then fresh Loop B trees (sim-cascade-b,
sim-gap3-b) appeared at closeout — NOT touched. Master moved once
under this run (8b77f0f40); both arms rebased clean onto it, zero
file overlap with B's work, proofs green after every rebase. This
run takes the 0547Z next blank (1): family 6b + narrowed 7b.

## Coordinator decision — band (made before any 6b/7b number existed)

The matched band 190391–190398 is REUSED BY DESIGN for both arms.
It is the transplant program's defining baseline band, where the far
end 203a32775 reads 4/8 (reproduced twice: masterregress, then 8b
with identical per-seed days). It is NOT claimed fresh — each arm's
prereg records the freshness search and the reuse rationale. The
fresh-band baseline gate has now burned two arms on band health
rather than the family (8c: 1/8 on 190541–190548; ove48-freshband:
1/8 on 190561–190568); neither family in this run had ever been
measured on any band, so choosing the matched band is not
outcome-driven band selection for these families. The baseline gate
(≥3/8 to proceed) still applies unchanged on the matched band.

## Arm 1 — sim-transplant6b-a: UNMEASURED (conflict-STOP)

Branch sim-transplant6b-a, tip 3a0046dcb (rebased onto 6534b07f2 at
landing; commits f03aa37c5 prereg+proof, 9e111d3b7 evidence, 3a0046dcb
record-only tip). Proof scripts/test-transplant6b.js 137/137 +
scripts/test-culpritbisect-a.js 116/116, re-run green after the
landing rebase. Evidence: evidence/2026-11-15/sim-transplant6b.md
(+ prereg evidence/2026-11-15/sim-transplant6b-prereg.md).

Verdict: UNMEASURED. Plain `git apply` of the mechanically
extracted villager-objectives.js hunks (merge f843fab1c, PR #33)
onto the far end fails: `patch failed:
src/js/villager-objectives.js:5`. Per-hunk check: hunks 2–6 (all
five code hunks — the new methods, perception marks, all three
call-site switches) apply cleanly; only hunks 0–1 (@@ -5,6 +5,8 @@,
@@ -15,6 +17,7 @@, the header-comment hunks) fail. Root cause:
the far end's copy differs from the first parent's by 81+/97− —
the local line stripped the brain-module references from the header
comment (objDangerBelief line removed, objRallyFreshRaid(vid) → (),
danger_heard_filtered rule removed), and the family's comment edits
anchor on exactly those names. The conflict is confined to inert
comment text, but the prereg forbids dropping a conflicting hunk,
so the STOP stands. No subject commit, no baseline/subject leg, no
corpus. The baseline gate never fired. Reference points unchanged:
far end 4/8, merge 1/8 on the matched band.

Method lesson (arm evidence): a marker-free merge-tree does NOT
imply clean `git apply` — the 3-way merge reconciles context edits
the 2-way patch cannot. Next narrowed arm should `git apply
--check` the filtered patch before committing a MEASURABLE
prediction.

Diagnostic (not used): `git apply --3way --check` is clean.

Family-test leg (far-end control only):
test-transplant6b-refresh.js pick mode exit 0, refresh mode exit 1
(method missing — the pre-registered control). The merge's own
proof on the far-end extract: exit 2, skip "mid-day refresh API
missing" (expected skip, not a regression).

## Arm 2 — sim-transplant7b-a: NOT-CARRIER (4/8, identical to baseline)

Branch sim-transplant7b-a, commits 5c21f538e (prereg + stage-1 proof
87/87), 94b57c3a9 (prereg correction: green-list union anchor — the
brain-dawn line is absent at the far end, union inserted after the
smoke line instead; honesty-test blob corrected sha256 9104f237 →
git blob 77f50489), 6534b07f2 (evidence + judged corpora). Proof
scripts/test-transplant7b.js 126/126 on the arm branch (125/126 on
merged master — the single failing leg is the "on arm branch"
guard, stale by design once merged, same class as the 0547Z run;
all content checks pass on master) +
scripts/test-culpritbisect-a.js 116/116 (re-run twice). Evidence:
evidence/2026-11-15/sim-transplant7b.md (+ prereg
evidence/2026-11-15/sim-transplant7b-prereg.md).

Verdict: NOT-CARRIER. The objectives-side half of PR #30 alone
(villager-objectives.js 19/7, 5 hunks byte-identical to the merge's
hunks, + honesty test file + green-list union line) reads survived
4/8 on the matched band, identical to the baseline leg on every
judged field — per-seed days 86/144/150/43/150/87/150/150, wall
(wins 0, national 0, table 0, regional 7/8, wave5 2/8, wave4 8/8,
median 150d, deaths 629), death-cause shares, standing, tribute,
all 225 vetSays lines. This is the exact expected NOT-CARRIER form
(identity) the prereg predicted: finishLottery calls
vbrainAlignObjective only when loaded, and the align function does
not exist on far-end substrate.

Judged numbers:
- Baseline leg ep-far-7b (far end 203a32775, fix standing
  f8fda4295a99 swapped in): 4/8, GOOD, REGIONAL_INTACT, median
  150d, 0 instrument errors — settled read reproduced exactly,
  gate passed.
- Subject leg t7b-23245d5d6 (subject 2a9d93654): 4/8, GOOD,
  REGIONAL_INTACT, median 150d, 0 instrument errors — per-seed
  identical to baseline.
- Family-test leg: finishlottery script exit 0 on both trees with
  identical picks (alignType undefined); honesty test exits 2
  (skip, "villager-brain align API missing") on both trees.
  Hold-narration path never fires in the corpus (0 "EXPEDITION" /
  "dawn hold" lines).

Subject branch transplant-7b-subject left in place at
2a9d936548c3ace6b86fcc0b7fd86accab141332 (one commit on the far
end; diff exactly +1 green-list, +214 test, +19/−7 objectives).
Subject branch transplant-6b-subject left at the far end
203a32775 (no subject commit).

## Wall (this run's judged corpora)

7b subject + baseline, 16 configs on the matched band: national
0/16, table 0/16, wins 0/16, wave-5 2/16, wave-4 16/16, median
150d. The scale wall stands exactly where the far end left it.
6b contributed no judged corpus (conflict-STOP before any leg).

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the t7b per-seed corpus, metrics
national,table,wins,exiled): REFUSED — "recorder-corpus input:
all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs" (exit 0). Recorded, not waived;
baseline NOT rolled. Same refusal class as all prior bisect /
transplant arms. 6b has no corpus (ENOENT).

## Coordinator decisions

1. **6b follow-up AUTHORIZED** (this run's decision, execution
   deferred to a fresh prereg + arm): a follow-up 6b arm may use
   `git apply --3way` for the filtered objectives patch, now that
   the diagnostic shows the 3-way application is clean. The fresh
   prereg MUST pre-register: the 5 code hunks byte-identical to the
   merge's hunks; the 2 comment hunks expected to 3-way-merge (the
   far-end stripped comment vs the family comment edits) and
   therefore NOT byte-identical — accepted only as inert-text-only,
   diff reviewed and recorded; same band, thresholds, and baseline
   gate as 6b. `git apply --check` (plain) before committing the
   MEASURABLE prediction, per the method lesson above.
2. **7b brain-side NOT decided here.** The carrier question for
   family 7 now rests entirely on the brain-side align function
   (vbrainAlignObjective), which cannot be transplanted onto the
   far end by any mechanical route (missing-substrate wall — the
   module never existed there). Measuring it needs a different
   substrate and a fresh prereg, not a transplant arm. Named as a
   next blank for the program, not decided in this run.

## Landing deviation (recorded, verified harmless)

The 7b worker merged its own branch into local master itself
(ff-only, linear ancestry 8b77f0f40 → 5c21f538e → 94b57c3a9 →
6534b07f2), deleted its branch, and released/removed its worktree
before reporting. That is the coordinator's job, not the worker's —
the worker brief's "merge your work to local master via --ff-only"
line (carried from the body template) was read as permission to do
the landing itself. Verified before accepting: ancestry is linear
with no merge commit, the three commits are the worker's own
attributed work, proofs re-verified on merged master (7b proof
125/126, only the stale branch guard failing; all content legs
pass), main tree clean. Outcome is exactly what the coordinator
landing would have produced; no undo attempted. The 6b landing
was done by the coordinator in the normal way (rebase onto
6534b07f2, proofs re-run, ff-only merge, release, worktree
removed, branch deleted).

## Infrastructure

- Registration slow (~10 min for two trees + heartbeats):
  registry-lock contention (same class as the 0547Z run's ~8-min
  heartbeats; the reaper holds REGISTRY.lock during long scans).
  No action taken; trees registered clean.
- Rebase stop-at-pick quirk hit TWICE on the 6b landing rebase
  (picks 553c44b8b, then b415e56a4, each in both done and todo):
  recovered with `git rebase --continue` after verifying tree
  clean + pick unapplied with the definitive `git diff <pick> --
  <files>` check (14 changed lines on the second pick, all the
  pick's own record-only text). Commits byte-identical after
  rebase; final tip 3a0046dcb.
- Safe-commit index clobber struck on worker commits (both arms)
  — repaired with the documented `ls-tree -r HEAD |
  git update-index --add --index-info` pipe each time, hashes
  verified byte-identical. No clobber on the coordinator commit.
- The 6b record-only tip commit's text names pre-rebase hashes
  (it records the worker's closeout tip); cosmetic, the proof
  re-run after rebase is the verification.
- Final `worktree-reap.sh` SKIPPED (registry lock held by another
  reaper run, consecutive skips 1) — no cleanup needed; my trees
  were already removed, sibling trees untouched.
- `check.js --quick` NOT re-run (zero src/js on either arm branch;
  loop precedent). Green-list check: neither arm branch touched
  green-list.txt or the dawn test files — the two dawn test files
  and their green-list lines (812–813) arrived on master through
  the merges' own history (713c96f12, a038cf151), not through this
  run. The finishlottery script's master-run "failure"
  (vbrainAlignObjective present, expected absent) is a
  wrong-substrate diagnostic: it asserts a far-end property on a
  master that has the brain module. Not a regression, nothing to
  fix.
- No EPERM flap this run.

## Metric review (§14)

- 7b primary metric (survived/8, ≤1 CARRIER / 2 AMBIGUOUS / ≥3
  NOT-CARRIER) judged cleanly: 4/8 subject vs 4/8 baseline, the
  identity form the prereg predicted. No re-scoring.
- 6b primary metric never got a subject to judge: the transplant
  METHOD failed at the mechanical step (plain `git apply` on
  comment-anchored hunks), not the metric. No re-score, no
  threshold change proposed. The method lesson (apply --check
  before committing MEASURABLE; 3-way route authorized for the
  follow-up) is recorded above.
- No metric revision proposed for the next run.

## Sense-testing (coordinator read)

7b corpus: 225 vetSays lines identical across legs; nothing
robotic beyond the shared event grammar. 6b: no corpus exists.
Nothing new to file; the 0547Z transcript findings (Blooded-beat
vs flag reverse case, narration/speech mixing) stand as filed.

scale-onramp stays converging (NOT converged): the objectives
halves of both families are now measured (7b NOT-CARRIER on the
identity form; 6b UNMEASURED on a comment-hunk conflict), but
wins remain 0 on every judged corpus, national/table remain 0,
and the carrier question for family 7 has moved to the
untransplantable brain side. food-economy stays converging
(untouched; parked). winnability chain stays converging
(untouched; sibling loop B). Next blanks, in order: (1) 6b
--3way follow-up (AUTHORIZED above, fresh prereg); (2) family 7
brain-side measurement on a non-transplant substrate (coordinator
call); (3) family 2b AMBIGUOUS stays on the suspect list; (4) the
four conflicted PR #22 hunks as a family; (5) headcount-ceiling
(Steve-call); (6) Reunion mirror pack in the wild (Steve design
call). Claim deleted; lock deleted. Evidence: this file.
