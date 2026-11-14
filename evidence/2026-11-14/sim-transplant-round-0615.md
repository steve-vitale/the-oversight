# H1 transplant — round 0615Z: families 11, 12, 13 LANDED (run fleshout-20261114T0615Z)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, families 11–13 in table order (see §Arms).
No adoption this run; all three arms ran fresh in this run. Every verdict
below is the arm's worker verdict, re-verified by this coordinator (proofs
re-run on the rebased tip AND on merged master) before landing.

Loop B live on winnability chain throughout (0330Z claim,
rageprecheck-b arm) — NOT touched. Master moved once under the run
from a sibling lane (journey-landing r131 63c051206, HEED fix, zero
overlap); all three branches rebased clean onto it, proofs re-run
green after every rebase.

## Arms landed (all ff-only, proofs re-run on rebased tip + merged master)

Arm 1 sim-transplant11-a (LANDED 2d52f9e6c, rebased tip d0a230e37):
MEASURED NOT-CARRIER 5/8. Family 11 (PR #26 voice-line-decoration-stack,
merge 0f55a928c, STEP t11-0f55a928c, subject 3b8ba98b0). Per-seed days
95/150/150/150/150/150/137/140; survivors 190392/190393/190394/190395/
190396; wave-5 2/8, wave-4 8/8, regional 8/8, national 0, table 0,
wins 0, median 150d, deaths 736, standing 199–320, blooded 2/8,
tribute-ready 0/8 (all veterans-short). ABOVE the far end's 4/8 — the
first measured family to read above the far end. Trajectories move
both ways (190394 43→150d, 190396 87→150d, 190392 144→150d improved;
190397/190398 lost ground; two held) — the expected signature of a
live dialogue change whose downstream choices follow the lines heard,
netting upward, not toward the merge's 1/8. The family's own test on
the subject checkout: 11/11 PASS (authored questions stay
undecorated). Proof 116/116 in worktree, on rebased tip, and on merged
master; culpritbisect 116/116 throughout. Subject branch
transplant-11-subject left in place. Corpus
evidence/2026-11-13/perseed-culpritbisect-a-t11-0f55a928c (driver
dates the corpus dir 2026-11-13; the step ran 2026-11-14 ~06:4xZ).

Arm 2 sim-transplant12-a (LANDED 3f91b73d6, rebased tip 63f6672bd):
UNMEASURED (conflict-STOP). Family 12 (PR #25 dialog-residual-sampler,
merge ac119e4ed, STEP t12-ac119e4ed). The merge-tree pre-check predicted
the conflict exactly and the live pick reproduced it exactly — the
sixth consecutive exact prediction in this program. UU
src/js/conversation.js (1 hunk, anchor @@ -1725,8 +1725,40 @@; the far end
ends the convoSnippetIsRealBeat filter with a bare `return true; },`
while the family inserts the stage-direction call, the party-join
assent guard, and the whole new convoSnippetIsStageDirection method)
+ DU scripts/test-snippet-stage-direction.js (deleted in HEAD,
modified by the family). Pick aborted clean, no subject commit, no
judged sim. The guard the family extends is ORIGIN-ONLY:
convoSnippetIsStageDirection has 0 hits at the far end 203a32775 and
0 at the merge-base d229b58f5, 3 at the first parent aa5d9ef92 — the
guard is family 14 (PR #10 snippet-stage-direction-guard, merge
7688cb7a4), built on the origin line after divergence. Family 12
stays on the suspect list as UNMEASURED. Coordinator decision owed
(filed in sim-findings.md): family 14 is the prerequisite — judge
12+14 together under one prereg, not 12 alone. Proof 92/92 in
worktree and on rebased tip; on merged master 91/92 — the only
failure is the stage-1-commit branch-identity leg asserting the
ORIGINAL prereg commit d71157936 is an ancestor of HEAD; the rebase
rewrote it to 2434dd64b. Same class as the filed 0608Z finding
(rebase-hash branch-identity legs); all measurement legs pass.
Culpritbisect 116/116 throughout. Subject branch
transplant-12-subject left in place at the far end (0 commits ahead).

Arm 3 sim-transplant13-a (LANDED 7c78100b6, rebased tip 2e1887064):
MEASURED NOT-CARRIER 4/8. Family 13 (PR #3 brawler-ascension-deed,
merge a76333124, STEP t13-a76333124, subject e514ba0a5ae3). Per-seed
days 86/144/150/43/150/87/150/150 — BYTE-IDENTICAL to the far-end
endpoint days, same four survivors (190393/190395/190397/190398),
same median 150d, same death total (629). Wave-5 2/8, wave-4 8/8,
regional 7/8, national 0, table 0, wins 0, standing 150–325, blooded
4/8, tribute-ready 1/8 (190397 only). Mechanism: the new
outmatched_kill deed NEVER books — `outmatched` 0/8 per-seed files,
`one_person_army` 0 anywhere — while the deed system itself is live
(godpath_deed teleCounts 160; ascension 5). The competent bot never
fights a solo, bloodied, above-weight kill, so the wider ascension
gate is never walked through. NOT-CARRIER by inertness, the same
shape as family 9. No split owed under 2115 §3 (c) — the
merge-vs-deed-commit split triggers only on CARRIER. Proof 103/103
in worktree, on rebased tip, and on merged master; culpritbisect
116/116 throughout. Subject branch transplant-13-subject left in
place. Corpus evidence/2026-11-13/perseed-culpritbisect-a-t13-a76333124
(same driver date quirk as arm 1).

## Wall (this run's judged corpora)

Judged: 11 → survived 5/8, wave-5 2/8; 13 → survived 4/8, wave-5 2/8.
Pooled judged corpora: survived 9/16, national 0, table 0, wins 0,
wave-5 4/16, median 150d. Carried: far end 4/8, wave-5 2/8; merge
1/8, wave-5 0/8; national 0, table 0, wins 0 on the collapse band.
Measured families now seven: 2b AMBIGUOUS (2/8 twice, suspect list),
4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8), 9 NOT-CARRIER (4/8),
10b NOT-CARRIER (3/8), 11 NOT-CARRIER (5/8), 13 NOT-CARRIER (4/8).
Unmeasured: 1, 2, 3, 6, 7, 8, 10, 12 (10 measured via narrowed 10b;
12 blocked on family 14). No carrier identified.

## Sense-testing (SENSE-TESTING LAW — carried from the arms)

Arm 11's corpus (226 vetSays / 114,716 sayCount lines): defense lines
name who fought, who was hurt, who didn't come back ("Kayden didn't
come back"); veteran kills called on camera with names remembered;
zero stacked openers/fighting closers anywhere. Arm 13's corpus (225
vetSays): named door fights with hurt carried, veteran kills called
on camera, Chantal asking Raj about Cold-Blooded, Blooded voiced,
Arc IV firing; no brawler line anywhere — consistent with the
mechanism. Arm 12 ran no step — nothing to sense-test; its diff read,
in plain words: resume openers would stop quoting warm silence, recap
scaffolding, or party-join assent as if it were something the player
once said, while keeping the thread label. Nothing robotic, static,
or repeated beyond the game's own formulaic door-fight narration.

## Metric review (§14)

Pre-registered metrics judged every arm before this landing: 11 met
its NOT-CARRIER threshold outright (5/8 ≥ 3/8, no re-run leg
applies); 13 met its threshold outright (4/8, seed-for-seed
reproduction); 12 stopped on the binding conflict rule before any
judged sim (UNMEASURED is the verdict, not a metric miss). No
threshold change proposed. One metric-adjacent note carried for the
NEXT run: family 11's two-way trajectory movement vs family 9/13's
byte-identical reproduction shows the band can see a live dialogue
change (11) while a live-but-unfired deed (13) and a live-but-
unpressed coherence repair (9) leave no trace — survival alone
separates "live and moving" from "live and inert" only when the
change is actually exercised by the policy.

## Telemetry

Deviation check attempted at coordinator level on the 11 perseed
corpus and REFUSED by the tool itself (recorder-corpus class):
"refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs."
Same refusal the arms recorded for 11/13. Baseline NOT rolled.
Arm 12 has no corpus — nothing to check.

## Infrastructure

- Worktree registration slow under box load: ~7.4 min for tree 11,
  ~10.5 min for trees 12+13 together (git worktree add churn on the
  96k-file tree while sibling panels loaded the box; progressing,
  not stuck). Capacity at spawn: 12/16 active, 3 registered → 15/16.
- VM runtime restart ~07:07Z killed worker 13's first step attempt
  mid-driver (driver log 0 bytes, per-seed dir empty, no judged data
  lost). Recovered by verifying no driver alive, restoring native
  standing.js byte-identical, deleting tooling scratch, and re-running
  fresh (STEP-RC=0). The restart wiped /tmp, so the step-script copy
  was re-created from the arm branch.
- Safe-commit index clobber struck all three workers' commits
  (repaired with the documented ls-tree -r pipe each time, verified
  status/diff empty, hash-object == HEAD blob). No clobber on the
  coordinator evidence commit. No flap EPERM hit on any arm write
  this run.
- Rebase stop-at-pick quirk did NOT strike (3 clean rebases).
- Reaper: pre-flight `bash scripts/worktree-reap.sh` ran 77s, removed
  nothing (all 12 active trees carry uncommitted changes, which the
  reaper never auto-removes); no cleanup this run. A sibling tree
  (journey-establishment) appeared mid-run — not this run's.
- Master moved only by this run's three landings after the run-start
  tip ccfdc1ba1 plus the sibling journey-landing r131 63c051206.
  No pushes, no version bumps, no live verification (ship loop owns
  deploys).
- check.js --quick NOT re-run: zero src/js, zero green-list files;
  all arm proofs + culpritbisect 116/116 green on merged master
  (12: 91/92 on the one filed rebase-hash branch-identity leg only).

scale-onramp stays converging (NOT converged): two more families
measured NOT-CARRIER — including the first to read ABOVE the far end
— and the twelfth family decomposed to a named prerequisite, but no
carrier is identified and national/table/wins remain 0 on the
collapse band. Next blanks, in order: (1) family 14 (7688cb7a4, PR
#10 snippet-stage-direction-guard, js=1) in table order, then family
15 (standalone OVE commits, needs a grouping prereg) and 16 (js=0,
only if no carrier explains the collapse); (2) family 12+14 combined
arm — needs its own prereg + coordinator decision (12 rides on 14's
guard; do not re-attempt 12 alone); (3) narrowed 8b (clean-hunks
subset) — needs its own prereg + coordinator decision; (4) family 6b
+ narrowed 7b — proposed, each needs its own prereg + coordinator
decision; (5) family 2b AMBIGUOUS stays on the suspect list; (6)
proof refresh round 15 (Loop B, owed after the next manifest change
per the b14 closeout); (7) headcount-ceiling (Steve-call); (8)
Reunion mirror pack in the wild (Steve design call).
food-economy stays converging (untouched; parked). Rotation left at 4
(convergence work does not cycle it). Claim fleshout-20261114T0615Z
deleted at closeout; lock deleted.
Evidence: evidence/2026-11-14/sim-transplant-round-0615.md (this file).
