# H1 transplant — round 0740Z: family 14 LANDED, 12+14 still running (run fleshout-20261114T0740Z)

Run: fleshout-20261114T0740Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 14 in table order + family 12+14 combined
(the coordinator decision owed from the 0615Z closeout).
No adoption this run for 14 — the arm ran fresh in this run; the coordinator
ADOPTED its closeout because the host write flap blocked the worker's final
commit, re-ran both proofs, and landed it. Arm 12+14 outlives this run (its
step was still running at the 2h deadline); adoption owed to the next run.

Loop B live on the winnability chain throughout (0730Z claim: sim-fusionoffer-b
BUILD + sim-proofrefresh-b15 round 15) — NOT touched. Master moved twice
under the run from sibling lanes (journey-landing r131 63c051206 at spawn
tip e3a5a9053, then journey-establishment r137 2de44bad8); the family-14
branch rebased clean onto 2de44bad8, proofs re-run green after the rebase.

## Arm 1 sim-transplant14-a (LANDED 11875f939, rebased tip)

MEASURED NOT-CARRIER 4/8. Family 14 (PR #10 snippet-stage-direction-guard,
merge 7688cb7a4, STEP t14-7688cb7a4, subject 9f713657b). Per-seed days
86/144/150/43/150/87/150/150 — BYTE-IDENTICAL to the far-end endpoint days,
same four survivors (190393/190395/190397/190398), same median 150d.
Wave-5 2/8 (190393, 190397), wave-4 8/8, regional 7/8, national 0, table 0,
wins 0, standing 150–325, blooded 4/8, tribute-ready 1/8 (190397 only).
Deaths 629 (villager combat 267, combat 130, expedition 126, wild 74).
Mechanism: the guard NEVER FIRES on this band — 0 stage-direction /
resume-opener lines in all 8 per-seed files, 0/225 vetSays matching; the
guard itself is proven correct by direct extraction (stage directions
true, real speech false). NOT-CARRIER by inertness. Coordinator
re-verified before landing: corpus 8 files / 4 survived / days identical;
test-transplant14.js 109/109 in worktree AND on rebased tip;
test-culpritbisect-a.js 116/116 in worktree AND on rebased tip.
Prereg commit 75d4efb5f, evidence commit 11875f939 (adopted: the worker's
final commit was flap-blocked; the coordinator committed its files with
safe-commit.sh after the proofs re-ran green). Subject branch
transplant-14-subject left in place at 9f713657b. Corpus
evidence/2026-11-13/perseed-culpritbisect-a-t14-7688cb7a4 (driver dates
the corpus dir 2026-11-13; the step ran 2026-11-14 ~08:1xZ).

## Arm 2 sim-transplant12-14-a (STILL RUNNING at closeout — adoption owed)

Family 12+14 combined (merges ac119e4ed + 7688cb7a4, pick order 14 then 12,
STEP t12-14-combined). Prereg + stage-1 proof COMMITTED 2cc3edbe2
(100/100, both picks predicted clean); both picks applied clean onto the
far end (subject branch transplant-12-14-subject: ec6b03f42 + c8655548f on
203a32775). The step was still running at the run deadline (~09:15Z);
no corpus, no verdict yet. Worktree ~/workspace/worktrees/sim-transplant12-14-a
registered, heartbeat 08:04:41Z (heartbeat writes flap-blocked after that;
last coordinator retry 08:45Z EPERM). Next run: adopt the branch the same
way this run adopted family 14 — verify the corpus + proofs, commit with
safe-commit.sh, re-run proofs on the rebased tip, merge ff-only. Do NOT
re-run the step if a judged corpus already exists; do NOT re-attempt 12
alone (the combined arm IS the 12 measurement).

## Wall (this run's judged corpora)

Judged: 14 → survived 4/8, wave-5 2/8. Pooled judged corpora this run:
survived 4/8, national 0, table 0, wins 0, wave-5 2/8, median 150d.
Carried: far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
table 0, wins 0 on the collapse band. Measured families now eight:
2b AMBIGUOUS (2/8 twice, suspect list), 4b NOT-CARRIER (3/8), 5b
NOT-CARRIER (4/8), 9 NOT-CARRIER (4/8), 10b NOT-CARRIER (3/8), 11
NOT-CARRIER (5/8), 13 NOT-CARRIER (4/8), 14 NOT-CARRIER (4/8).
Unmeasured: 1, 2, 3, 6, 7, 8, 10, 12 (12 riding on 14 — the combined
arm in flight), 15, 16. No carrier identified.

## Sense-testing (SENSE-TESTING LAW — carried from arm 14)

225 villager utterances read: in character and in situation (Seo-ah
flagging a fruiting ground-elder patch; a scarred woman teaching the crow
trick in her own words; a low-trust stranger — "Why should I listen to
you?"; gossip admitting the retelling is better than the event). Veteran
kills called on camera; Blooded known. Nothing robotic, static, or
repeated beyond the game's own formulaic door-fight narration. The guard
changes none of it — it never fires here. One instrument note carried
(see Metric review): vetSays carries mostly system/event narration, not
villager-to-villager dialogue.

## Metric review (§14)

Pre-registered metrics judged arm 14 before this landing: 4/8 met its
NOT-CARRIER threshold outright with the strongest possible read
(seed-for-seed identity with the far end — no re-run leg applies). No
threshold change proposed. Arm 12+14's prereg is committed (2cc3edbe2)
and its thresholds are binding when it reports. Instrument note carried
for the NEXT run (from arm 14): a future dialogue-family transplant that
wants to judge the guard's effect on spoken dialogue needs a corpus
that records resume openers themselves, not just vetSays — this corpus
cannot show a resume quote being accepted or rejected, only that none
was offered.

## Telemetry

Deviation check attempted at coordinator level on the 14 perseed corpus
and REFUSED by the tool itself (recorder-corpus class): "refusing
recorder-corpus input: all 8 --current rows carry top-level anchorCommit,
so they are sweep recorder rows, not runs." Same refusal the arm
recorded. Baseline NOT rolled.

## Infrastructure

- Host write flap: ACTIVE through this run's closeout — first hit
  ~08:10Z (worker culpritbisect re-run crashed on a /tmp scratch write),
  cleared briefly ~08:32Z (worker re-ran proofs), re-struck and still
  failing at 08:44–08:58Z (watcher A/B/G/H FAIL; coordinator heartbeats,
  branch delete, and worktree-release all EPERM). Flap windows flicker:
  coordinator probe writes succeeded 08:46Z, proof re-runs went green
  08:50–08:52Z, then registry/refs writes failed again 08:53–08:58Z.
  No work lost: every file sha-verified; the only flap cost is
  closeout bookkeeping (see owed items below).
- Safe-commit index clobber struck the adopted evidence commit
  (34df4e3b9, later rebased to 11875f939): all 13 files staged-as-deleted
  + untracked after commit. Repaired with the documented
  `ls-tree -r` pipe; verified status empty, diff HEAD empty,
  hash-object == HEAD blob.
- Rebase stop-at-pick quirk did NOT strike (clean 2-pick rebase onto
  2de44bad8).
- Reaper: pre-flight `bash scripts/worktree-reap.sh` SKIPPED (registry
  lock held by another reaper run, consecutive skips: 2) — no cleanup
  this run. The reaper lock self-contention is still open (Steve
  approved fixing it; not done yet).
- Worktree registration slow under box load: ~13 min for tree 14,
  ~3 min more for tree 12-14 (git worktree add churn on the 96k-file
  tree while sibling panels loaded the box). Capacity at spawn: 12/16
  active → 14/16 with this run's two trees.
- check.js --quick NOT re-run: zero src/js, zero green-list files;
  both arm proofs + culpritbisect 116/116 green on merged master
  (re-run on the rebased tip before the merge).
- No pushes, no version bumps, no live verification (ship loop owns
  deploys).

## Owed items (for the next run / closeout)

1. Adopt sim-transplant12-14-a (branch + worktree in place, prereg
   2cc3edbe2 committed, step running at this run's deadline).
2. Delete branch sim-transplant14-a (merged at 11875f939; `git branch -d`
   EPERM-blocked twice at closeout) and retry
   `bash scripts/worktree-release.sh sim-transplant14-a merged`
   (registry write EPERM-blocked twice at closeout; tree already
   removed, registry entry still "active").
3. Family 15 next (grouping prereg written this run:
   hidden_files/family15-grouping-prereg-2026-11-14.md — 20 standalone
   commits in 6 groups 15A–15F, pick orders verified, 15F proof-refresh
   conflict warning recorded), then family 16 (js=0 merges, only if no
   carrier explains the collapse).
4. Proof refresh round 15 is Loop B's (0730Z claim, in flight) — not
   this loop's.

scale-onramp stays converging (NOT converged): one more family measured
NOT-CARRIER — the eighth, seed-for-seed identical to the far end — and
the twelfth family is finally being judged with its prerequisite in
place, but no carrier is identified and national/table/wins remain 0 on
the collapse band. food-economy stays converging (untouched; parked).
Rotation left at 4 (convergence work does not cycle it). Claim
fleshout-20261114T0740Z marked .DEAD with an adoption note at closeout
(12+14 still running); lock deleted.
Evidence: evidence/2026-11-14/sim-transplant-round-0740.md (this file).
