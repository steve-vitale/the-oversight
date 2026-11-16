# Loop A round 2115Z — adoption closeout (main session, stale-lock recovery)

Run: fleshout-20261115T2115Z, timed out at the 1h wall-clock. Adopted by the main
session 2026-11-15 ~18:10–18:30 CST. Coordinator evidence; arms below.

## What happened to the run

The 2115Z coordinator was killed by the day's 8th VM restart (boot 55adc5a7,
~23:08Z) mid-flight. Its lock file was already gone at adoption; its claim
(`fleshout-20261115T2115Z.json`) stayed live. All three arm worktrees were
intact with committed work; heartbeats were re-freshened by the adopter
(00:12Z, 00:25Z) and the 18:15 occurrence correctly stood down on them.

## Arm 1 — sim-alignstep-a: MERGED

Family-7 align-step ablation (redefined: remove the align call in
finishLottery, −5/+0), baseline-first on the matched band. Verdict
UNMEASURED-substrate: master-tip baseline 7/8, gate STOP, no subject leg.
Rebased onto cb00f9818 clean (4 commits, no quirk strike) → tip 4e58e1057.
Post-rebase proof test-alignstep-a.js: 49/50 — the single failure is the
stale-anchor branch-identity leg (it lists commits above the OLD base
ce0f28a46, which now include the post-base master landings); same class as
the 7redef matched-band adjudication. All 49 other legs green, including
"no src/js differs from HEAD" — evidence-only arm. Merged ff-only to master
4e58e1057. First merge attempt failed on a transient index.lock held by a
concurrent sibling operation; the failure was masked by a `| tail` pipe in
the adopter's own command (exit code of tail, not git) and caught only by
verifying HEAD afterward — retried without the pipe, clean. Lesson
re-learned: never pipe a merge through tail/head without PIPESTATUS.
Worktree released (branch deleted after merge; dir removed).

## Arm 2 — sim-grecorder-a: REBASED, MERGE PENDING PROOF

G-class recorder victim-identity fix (deaths rows gain vid/name/veteran/
w4kills/w5kills/maxWave from the final waveKillLog; v4 analyzer classifies
drops by veteran rows). Closes the vetattrition DIAG 90%-bar residue.
Proof 34/34 green pre-rebase. Rebased onto 4e58e1057 clean (5 commits, no
quirk strike) → tip 2c74e5a16. Post-rebase proof re-run (test-grecorder-a.js,
16-seed fresh G corpus) IN FLIGHT at closeout: on seed 1/16 after ~10 min
under load ~21 — the box is saturated post-restart and the test gets almost
no CPU. Merge ONLY after that proof goes green; do not merge on the
pre-rebase green alone (master moved under it: courtship-rework2 BFS +
producergate gate-link/revert landed between the arm base and the rebase
tip). Evidence: evidence/2026-11-15/sim-grecorder-a.md. Worktree retained.

## Arm 3 — sim-vetparty-a: LEVER COMMITTED, A/B OWED, NOT MERGED

Wave-4 re-engagement party lever (vetattrition §9 spec): the party persists
as a trio until the monster type is killed or a member dies; companion
launchability hoisted to a named `companionLaunchable` fn; partyTrios /
partyDissolved stats; gate-counts-plan-party.

Safe-commit mass-deletion guard: the lever commit was refused (52 src
deletions > 50). Resolved by the adopting coordinator, NOT by the worker:
the deletions were verified line-by-line to be a refactor, not a stale-tree
revert — 34 of 36 deleted code lines reappear verbatim as the hoisted
`companionLaunchable` function; the other 2 are the intended party-of-3
behavior change (single-companion `plan.party = [cid]` lines replaced).
`--force-delete` approved on that verification and recorded in the commit
message. Committed c53654f63 (node --check clean on all 4 files,
test-vetparty-a.js 40/40 "lever built"). The safe-commit index clobber
struck the commit (files showed staged-deleted / MM); repaired via the
ls-tree -r pipe, verified `git status` clean except one untracked log and
`git diff HEAD` empty.

NOT DONE — handed to the next Loop A run: rebase onto the post-grecorder
master tip, re-run proof, run the A/B (armed vs control legs; the 7 check
failures were never started and the armed leg was never run), run the check
gate, then merge or kill per the frozen bars. Branch sim-vetparty-a @
c53654f63, base d073bd656. Worktree retained, dirty only by the untracked
evidence/2026-11-15/vetparty-check-quick.log (stale; regenerate on the A/B
run). Claim file fleshout-20261115T2115Z.json stays live until vetparty
closes — the next run deletes it when the arm lands or is killed.

## Wall numbers (this round's arms only; no round aggregate — run died)

- alignstep matched band: baseline 7/8 survived, gate STOP (regime gone on
  master tip — consistent with the 7redef matched-band read).
- grecorder fresh G corpus (band 100541–100556, 16 seeds): GO 18/18 drops
  classified pre-rebase.
- vetparty Stage 0 control leg (8 seeds 100821–100828, 150d): 6/8 survived,
  0 instrument errors.

## Infrastructure notes

- VM restart #8 today (~23:08Z, boot 55adc5a7) killed the 2115Z run; flap
  watcher alive on the new boot (pid 3214), ALL-OK.
- Reaper: 3 consecutive skips + ALERT at 17:48 (holder verified live reaper
  PID 20774 mid-scan — guard working as designed, suppressed).
- `git gc` warning persists (too many unreachable loose objects) —
  housekeeping still owed; not attempted in this window.
- Ship 8c4db3ce2-20261115-232613 verified live on both endpoints 00:22:50Z
  (GitHub raw + Vercel). The 2115Z arms land in the NEXT ship, not this one.

## Next

- grecorder: merge on proof-green, release tree, delete claim when vetparty
  also closes.
- vetparty: A/B + gate + merge-or-kill (next Loop A run).
- family-7 program decision still open (alignstep UNMEASURED-substrate adds
  a third substrate read; guardablate-fresh CONFIRMED stands as the
  strongest attribution).
