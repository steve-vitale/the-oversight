# sim-transplant-round-2015 — H1 transplant, 15E remaining routes (Loop A, fleshout-20261114T2015Z)

Run: fleshout-20261114T2015Z (Loop A), axis scale-onramp, H1 transplant
program. Program: "15E remaining routes (next blanks #1-2 from
round-1736Z; 1653Z options (b)/(c) as originally written)". Claim:
hidden_files/lever-claims/fleshout-20261114T2015Z.json — retired to
.DEAD at closeout (see the .DEAD.note beside it).

## Run open: the 1736Z adoption (separate evidence)

This run opened on a dead predecessor: the 1736Z Loop A run's
coordinator had died after its workers finished, leaving its p3conv
arm committed but unmerged and no round evidence. The adoption is
recorded in full in evidence/2026-11-14/sim-transplant-round-1736.md
(commit 59f78034c): p3conv rebased onto f0b64c672 clean, proof 152/152
re-verified by the coordinator on the rebased tip, merged ff-only
36f3be51c, tree released, branch deleted, 1736Z claim retired. All
three 1736Z arms (pick 1 alone, picks 1+2 on 14+12, narrowed pick-3
conversation-only) are NOT-CARRIER 4/8. Loop B live on winnability
chain throughout (1945Z answercourt + donatebank; its donatebank
evidence cb5d47031 and answercourt GO landed on master mid-run) —
NOT touched.

## The two arms (both measured, both NOT-CARRIER)

Shared band 190391–190398 (deliberate identical-seed reuse per the
transplant program protocol), 150d death-aware, competent verbatim
own-policy per step, far end 203a32775 (GOOD 4/8) with the roster-check
standing fix swapped in for every step. Thresholds (binding, 2115 §3):
≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id; ≥3/8
NOT-CARRIER.

Arm 1 sim-transplant15e-p2-a (15E pick 2, 7041e1bfb OVE-33, ALONE on
the 14+12 base; subject transplant-15e-p2-subject at acdbc793f07b, tree
35857b15 = predicted; STEP t15e-p2): NOT-CARRIER 4/8, per-seed days
86/144/150/43/150/87/150/150 — exactly the far-end endpoint days on
all 8 seeds. Deaths 629, wave-5 2/8, wave-4 8/8, median 150d,
tribute-ready 1/8 (190397). Proof scripts/test-transplant15e-p2-a.js
182 passed, 0 failed on the rebased tip (coordinator re-ran it);
scripts/test-culpritbisect-a.js 116/116. Merge-tree pre-check
predicted exactly the two tooling conflicts (balance-proof.json,
phone-frame-proof.json, both resolved --ours); conversation.js, the
snippet test, and sw.js auto-merged clean; the live pick reproduced
the prediction exactly. Evidence:
evidence/2026-11-14/sim-transplant15e-p2.md (commits eddb94aca +
a4566a435, rebased onto a998413cf clean, merged ff-only).
Sense-testing: 0 resume-opener matches in all 225 vetSays lines —
the pick never fires on this band under the competent policy,
consistent with the seed-for-seed identity.

Arm 2 sim-transplant15e-p23-a (15E picks 2+3 on the 14+12 base, pick 3
narrowed to conversation.js-only per the p3conv precedent, objectives
half dropped by coordinator decision; subject
transplant-15e-p23-subject at 1efa1c1ab502, tree 1c6c8954 = predicted;
STEP t15e-p23): NOT-CARRIER 4/8, per-seed days 86/144/150/43/150/87/
150/150 — exactly the far-end days, seed-for-seed, same four
survivors. Wave-5 2/8, wave-4 8/8, median 150d, deaths 629.
Proof scripts/test-transplant15e-p23-a.js 224 passed, 0 failed on the
rebased tip (coordinator re-ran it). Pick 2 landed at c6e64d524 (tree
35857b15 = predicted); pick 3's conversation.js hunk merged clean,
objectives half restored byte-identical to the base, both tooling
files --ours, OVE-57 evidence receipt removed; live picks reproduced
both merge-tree predictions exactly. Evidence:
evidence/2026-11-14/sim-transplant15e-p23.md (commits c43cc3f36 +
dc68581c6 + 86a3918a1, rebased onto a4566a435 clean, merged ff-only).
The corpus commit (86a3918a1) was made by an adoption worker: the arm
worker left its corpus files untracked at completion, and the
coordinator did not merge over the gap — the adoption verified all 8
per-seed JSONs parse with matching days, committed all 15 files, and
re-ran the proof 224/224. Sense-testing: both measured dialogue paths
went unexercised (0 trader mentions in 225 vetSays lines).

## Family 15E is now closed (every measurable combination)

Pick 1 alone, pick 2 alone, picks 1+2, narrowed pick-3
conversation-only alone, picks 2+3 narrowed — all NOT-CARRIER 4/8,
all seed-for-seed identical to the far end. The resume /
conversation-repair group does not carry (any of) the collapse, in
any buildable combination. The ONLY unmeasured piece left in family
15E is the pick-3 villager-objectives.js half (the rally-guard
lottery skip), which needs origin-line Phase 4 objectives content
landed first or a re-implementation against the far end's form — a
coordinator / Steve call, not an arm's. The group as a unit stays
recorded unmeasurable-by-conflict (pick 2 cannot land on the bare
far end; pick 3's objectives half cannot land), with every buildable
piece exonerated.

In plain words: saying Yes to "want to hear where it left off?" now
continues the old conversation, quoted speech stops being mistaken
for stage direction, and a trader about to introduce themselves
doesn't lose their turn — and no combination of those three repairs
changes whether villages live or die. The collapse is elsewhere.

## Wall (this run's judged corpora, 16 configs)

Survived 4/8 on both legs; national 0, table 0, wins 0; wave-5 2/8
per leg; median 150d. The collapse stands: the carrier is identified
and split (OVE-52 alone, family 15C), but no fix has landed and the
veteran bar still chokes every surviving seed.

## Metric review

Pre-registered metric (survived/8 with the ≤1 / 2 / ≥3 thresholds)
judged both arms; no re-scoring happened mid-run. Standing limit,
recorded in both arms' evidence and carried here: the measured
dialogue paths went UNEXERCISED on the survival band (0
resume-opener matches, 0 trader mentions), so these verdicts prove
survival-inertness, NOT the dialogue behavior itself — that behavior
rests on the picks' own origin-line unit tests. A survival band
cannot prove a dialogue repair fires correctly; it can only prove
the repair doesn't move survival. No metric revision is proposed:
the instrument discriminated (CARRIER 1/8 on 15C-js in the same
program) and the thresholds held.

## Telemetry deviation check

Recorder-corpus class — the deviation check REFUSES these corpora
(confirmed by the coordinator on the p23 corpus: "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit"). Baseline NOT rolled. No new sim-findings.md entries
from this run.

## Infrastructure

- Write flap (EPERM class, fresh-file writes refused) struck BOTH
  arms' STEPs in one window ~21:10–21:40Z: 4 per-seed writes refused
  (0-byte .tmp files), standing.js truncated to 0 bytes, analyzer
  INCOMPLETE, step exit 1. Both recovered without re-running judged
  sims from scratch: p2 extracted the 4 per-seed files from the
  driver's @@FALLBACK JSON blocks (parsed in-memory, key-set matched
  the good files, round-trip verified; analyzer re-run GOOD 4/8);
  p23 recovered via temp-file + rename (sha-verified) and a clean
  re-run that reproduced the first run's 8 result lines exactly and
  its 4 overlapping per-seed files byte-identically; flap1 records
  preserved. The flap is ongoing (see the flap-watch log); this run
  adds two more recovery precedents, not a root cause.
- REGISTRY.lock contention: worktree registration for the two arms
  took ~6.3 min queued; heartbeats queued up to ~8 min (the known
  reaper self-contention; fix still needs a Steve nod).
- Safe-commit index clobber struck the p2 commits, the p23 commits,
  the p23 adoption commit, and the 1736Z coordinator evidence commit
  — repaired via the ls-tree -r pipe each time, commits verified
  correct, trees clean. The p23 adoption worker also hit the
  safe-commit directory-paths refusal (passed two per-seed
  directories; script cannot add directories — expand to file lists
  first, per AGENTS.md).
- Master moved twice under the run (journey-scale r204 a998413cf,
  loop B donatebank cb5d47031), zero overlap either time; both arm
  branches rebased clean (p2: 2 commits, p23: 3 commits), proofs
  re-run green by the coordinator on the rebased tips and merged
  ff-only. No push, no version bump, no live verification — the ship
  loop owns deploys.
- check.js --quick NOT re-run (zero src/js, zero green-list files;
  both proof suites green on rebased tips; loop precedent).

scale-onramp stays converging (NOT converged): family 15E is now
fully measured and exonerated in every buildable combination, but no
fix has landed and national/table/wins remain 0 on every judged
corpus. food-economy stays converging (untouched; parked). Next
blanks, in order: (1) pick-3 objectives-half route — coordinator /
Steve call; (2) 15A third band calibrating the far end at ≥3/8; (3)
family 16; (4) narrowed 8b; (5) family 6b + narrowed 7b; (6) family
2b AMBIGUOUS stays on the suspect list; (7) proof refresh round 18
(Loop B, owed after the next manifest change); (8) headcount-ceiling
(Steve-call); (9) Reunion mirror pack in the wild (Steve design
call). Rotation left at 4 (convergence work does not cycle it).
Claim deleted; lock deleted. Evidence:
evidence/2026-11-14/sim-transplant-round-2015.md (this file).
