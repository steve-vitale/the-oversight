# sim-winnability-round-0030 — Loop B adoption closeout (axis scale-onramp / winnability chain)

Run: `fleshout-loop-b-20261106T0030Z` (adoption coordinator). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5
release → wave-5 facing → full seat). This file closes out the dead run
`fleshout-loop-b-20261105T2330Z` and lands its orphaned arm. No new sims were
run for the adoption itself; the arm's verdict is the worker's own, verified
here, not re-judged.

## Stale-lock recovery

- Dead lock read before deletion: `fleshout-loop-b-20261105T2330Z`, created
  2026-11-05T23:34:05Z (56 min old at recovery).
- Dead claim retired to `.DEAD` with a `.note` (axis scale-onramp, arms
  sim-tbretreat-refind-confirm-b-land, sim-bankkiller-b-summary,
  sim-toggle-rescreen-b).
- Registry check (trees list, per the 2026-11-03 closeout rule): the dead
  run's only registered tree, `sim-toggle-rescreen-b`, last heartbeated
  2026-11-06T00:09:57Z — 22 min stale at recovery (>15-min guard).
- "Other hand" check (per the 2115Z lesson — a stale heartbeat proves the
  coordinator is gone, not that the work stopped): the dead run's only
  worker shows `failed`/`errored` in the subagent listing with a null final
  response (transport sqlx pool timeout); no live processes; no active
  subagents; last file write 00:10:10Z, last commit 00:10:43Z (prereg
  3be4c27a0); worktree clean. No live worker was disturbed.
- Landed work verified on master BEFORE retirement: 5194acd46 (2330Z adoption
  closeout) + b7f34fbbb (refind-confirm GO) both ancestors of HEAD.
- Loop A live on food-economy throughout (0028Z claim, arms
  sim-awaynaming-rereg-a + sim-enddaybeats-fix-a, workers running) — NOT
  touched.

## Arm — sim-toggle-rescreen-b: ALL THREE TOGGLES GO-CANDIDATE (landed by adoption)

Adoption of the orphaned 2330Z arm, continued from its committed prereg
(3be4c27a0, band 99651–99658 verified fresh, NOT re-picked). 42 probe runs
on pinned base ff1725835 (2 DET + 16 V-full + 24 Stage 1), all .err files
empty. Evidence: `evidence/2026-11-05/sim-toggle-rescreen-b.md` (+ prereg,
80-file corpus `perseed-toggle-rescreen-b/`, proof
`scripts/test-toggle-rescreen-b-20261105.js`).

| Toggle | S1 flips | S2 sat Δ ≥9 | S3 fight/kill swing | Verdict |
|---|---|---|---|---|
| sigoff (SIGDMG) | 0/8 | 0/8 | 1/8 (99653 fights 9→13) | GO-CANDIDATE (S3) |
| gearoff (GEAR) | 1/8 (99651 won lesser d118 → scattered d66) | 0/8 | 4/8 | GO-CANDIDATE (S1+S3) |
| trickoff (TRICKHOLD) | 3/8 (99651 loss w/ wave-5; 99652 scattered→survived d181; 99653 scattered→won lesser d96) | 0/8 | 5/8 | GO-CANDIDATE (S1+S3) |

The 0445Z fast kills do NOT reproduce on fresh seeds: all three
"non-attributed" singles move whole villages on this block, and two flip
outcome classes. Stage 0 gate PASS (DET byte-identical; V-full pass 1 vs
pass 2 byte-identical on all 8 seeds). Confirm owed for each toggle, next
run (12–16 seeds, fresh band); the confirm prereg must pre-register whether
it judges class flips, trajectory movement, or both — no quiet re-scoring.
Sense-tests all PASS (mechanism-traced: sigoff/99653 Maya fork; gearoff/99651
beam Stranger; trickoff/99653 rescue sit read end to end).

Staging deviation, documented not hidden: variants ran after pass 1 and
before pass 2 closed the gate (window-fit); no judging until pass 2
confirmed determinism. Next run should budget pass 2 first or record the
same deviation explicitly.

Landing verification (adoption coordinator, not the worker):
- Branch rebased onto master tip a98dd9165 clean (no conflicts; pure
  evidence/scripts additions). Rebased tip d247708fa, 5 commits.
- Proof re-run on the rebased tip: integrity 8/8 on all five prefixes
  (vfull-, vfull2-, sigoff-, gearoff-, trickoff-); screen sigoff
  GO-CANDIDATE (S1=0 S2=0 S3=1), gearoff GO-CANDIDATE (S1=1 S2=0 S3=4),
  trickoff GO-CANDIDATE (S1=3 S2=0 S3=5); repeat PASS byte-identical.
  All verdicts reproduce the worker's exactly.
- Merged --ff-only as d247708fa (97 files, 818,570 insertions — the
  80-file per-seed corpus dominates). Proof spot-check on merged master:
  integrity vfull- 8/8, screen trickoff- GO-CANDIDATE — green.
- No game-code change is committed or landed by this arm (evidence/scripts
  only; `git diff HEAD -- src/ index.html` empty at every stage).
- No jest suite run (no game code committed or landed by this diagnostic
  arm; the variant code was restored before closeout). check.js --quick
  NOT re-run: zero src/js on master from this run; standing 284/6 profile
  recorded by the 1830Z run the same day.

## Wall (judged corpora, 8 seeds each, plain words)

- V-full: lesser 2/8, full 0/8, national-or-better at end 2/8, wave-4
  unlocked 6/8, wave-5 reached 1/8 (99658, still lost), median survival 81d.
- Sigoff: lesser 2/8, wave-5 1/8, median 93d. Gearoff: lesser 1/8,
  wave-5 0/8 (the block's only door closes), median 64.5d. Trickoff:
  lesser 2/8 + survived-to-horizon 1/8, wave-5 1/8 (99651, a different
  seed), median 93.5d.
- Pooled across the four 8-seed blocks (32 configs): wins (lesser) 7, full
  seat 0, wave-5 reached 3, wave-5 kills 0, no seed banks 2 living wave-4
  killers. The binding constraint on this block is still everything
  downstream of sitting lesser: standing, veterans, and wave-5 facing.

## Telemetry deviation check

3 LOUD lines (national 12→0, table 16→0, wins 16→0, n=40 files). Same
class as the 1955Z/2115Z/2215Z/2315Z runs: regime + field-shape artifacts,
NOT a measured disappearance — the per-seed classifier JSONs carry no
national/table/wins fields (fields are seed/class/satDay/wave5/uw/
gameDays/alive/fights/kills/vDie/endReason/scale), so "0" is a missing-field
artifact against the stale WINSEAT baseline, whose own text forbids
pre-seat comparisons. Baseline NOT rolled, no investigation item.

## Infrastructure

- Safe-commit index clobber hit the worker 3 times (committed files showing
  staged-as-deleted); repaired via HEAD-blob cacheinfo each time, all
  commits verified correct. No clobber on the coordinator commit.
- EPERM flap: none observed this run (one backgrounded exec took ~19s on
  the reaper, completed clean).
- `git gc` warning on merge (unreachable loose objects / gc.log) is
  pre-existing repo housekeeping; left alone, not pruned mid-run.
- Master moved twice under the run (journey-endgame r143 a7dfc4a45,
  journey-landing r108 a98dd9165); branch rebased once, proof re-run green
  after. Loop A live on food-economy (0028Z) — NOT touched; its two trees
  showed uncommitted changes at the reaper sweep and were left alone.
- Reaper at closeout: active 5/16, removed nothing sibling-owned.

## Metric review (for the NEXT run, not this one)

Carried from the arm evidence: S2 never fired (largest |sat-day Δ| is 2);
S3 did the work on all three toggles — the confirm prereg should weigh
whether S2's threshold (9) is still the right tripwire. The confirm's judge
must be gross flips + mechanism per flip, not net wins (trickoff nets 0
wins with 2 rescues − 1 loss; sigoff nets 0 with a real lever effect). The
wave-4-only census is blind to the fights that flipped seeds here (the
gearoff-99651 stranger fight: 0 census fights on both sides) — a future
morale/staying/signature arm needs a low-wave field-fight census and
day-stamped fight records.

scale-onramp stays converging (NOT converged): the 0445Z open item (a) is
answered — all three toggles move fresh-seed outcomes — but wins are still
lesser-only, wave-5 kills still 0, and no seed banks 2 living wave-4
killers. Next blanks, in order: (1) a 12–16-seed confirm per toggle on its
own fresh band (judge pre-registered: class flips, trajectory, or both);
(2) a lever on the wild death channel for first killers; (3) flee-repair
game-code port — STEVE CALL on scope. food-economy stays converging
(NOT converged): untouched by this run. Claim deleted; lock deleted.
Evidence: evidence/2026-11-05/sim-toggle-rescreen-b.md (arm) +
evidence/2026-11-05/sim-winnability-round-0030.md (this file).
