# Toggle-confirm adoption round 0630 — gearoff + trickoff landed, toggle family closed (Loop B, 2026-11-06)

Run: fleshout-loop-b-20261106T0630Z, axis scale-onramp / winnability chain.
Adoption run per the 0130Z tracker entry and Loop A's live 0615Z claim note
("stranded for adoption by NEXT B RUN"). Loop A live on scale-onramp
throughout (0615Z claim, arms sim-stageally-a + sim-finishprobe-a) — NOT
touched. No new sims were run by this run: both arms' Stage 1 verdicts were
completed by their stranded workers after the 0130Z closeout messages, and
this run verified, rebased, and landed them. No game-code change is committed
or landed by this run. Branch holds evidence/scripts only, both arms.

## Outcome: 2 arms LANDED, toggle-confirm family closed
- sim-gearoff-confirm-b — ALREADY ON MASTER at run start as 3e8b3024d
  (Stage 1: GO, signal 6/12, S1 flips 3 gross, S3 4). Verified on master by
  this run (proof re-run, see below), NOT re-landed. Orphan worktree
  directory + merged branch cleaned up by this run (see infrastructure).
- sim-trickoff-confirm-b — LANDED as a0749eb9e (rebased onto beb2a2f0f
  clean, proof re-run green on the rebased tip). Verdict: CONFIRM GO.
- With sigoff NO-GO (978d7fda9, 0130Z), all three toggle confirms from the
  0030Z rescreen now have verdicts on fresh 12-seed bands: sigoff NO-GO,
  gearoff GO, trickoff GO.

## Arm 1 — gearoff confirm: GO (verified on master, not re-landed)
Evidence: evidence/2026-11-05/sim-gearoff-confirm-b.md (+ prereg
beafc5018, corpus perseed-toggle-confirm-gearoff-b/, proof
scripts/test-toggle-confirm-gearoff-b-20261106.js). Pinned base ff1725835,
26 probe runs (2 DET + 12 V-full + 12 gearoff), all .err files empty.
- Coordinator verification on master (this run, no re-sim): integrity
  12/12 on both prefixes; confirm mode reproduces the verdict exactly —
  GO (signal seeds 6/12, S1 flips 3, S2 1, S3 4). Bar: GO iff S1-or-S3
  fires on >=2/12; S2 descriptive; net wins never the judge.
- Verdict as committed: the rescreen signal reproduces on fresh seeds at
  the same order of magnitude (screen: 1 flip + S3 on 4/8; confirm: 3
  flips + S3 on 4/12). Ally gear parity is a live lever: it moves whole
  villages, in both directions (2 losses, 1 rescue).
- V-full (12): lesser 5, full 0, wave-4 7/12, wave-5 0/12, median 90.5d.
  Gearoff (12): lesser 4, full 0, wave-5 0/12, median 90.5d. This block
  never even reaches the wave-5 door in either variant.

## Arm 2 — trickoff confirm: CONFIRM GO (adopted + landed)
Evidence: evidence/2026-11-05/sim-trickoff-confirm-b.md (+ prereg
916ec290c, corpus perseed-toggle-confirm-trickoff-b/, proof
scripts/test-toggle-confirm-trickoff-b-20261105.js). Pinned base ff1725835,
26 probe runs (2 DET + 12 V-full + 12 trickoff), all .err files empty.
- Adoption verification (worker, in the stranded worktree): worktree clean
  at start; `git diff HEAD -- src/ index.html` empty (pinned checkout
  restored); proof re-run on the stranded tip reproduced the verdict
  exactly (integrity 12/12 both prefixes; GO, signal 9/12, S1 5, S3 8,
  S2 1 descriptive); heartbeat refreshed. Rebased onto master 3e8b3024d
  clean (6/6 commits, zero conflicts); adoption commit 9a1990a92
  (preserve rescreen stage1 log, rename confirm logs, verification note).
- Coordinator rebase + verification: master had moved twice under the run
  (journey-deepening r107 run notes 0a25ab9f7 + beb2a2f0f, zero overlap),
  so the branch was rebased a second time onto beb2a2f0f clean (6/6) as
  a0749eb9e; proof re-run green on the rebased tip (integrity 12/12 both
  prefixes; CONFIRM GO, signal 9/12, S1 flips 5, S3 8, S2 1 descriptive).
  `git fetch origin master` first: origin/master is de065b4c6 (batch ship
  052413Z), local master contains it — no stale-base risk. Merged
  --ff-only; tree released done-merged, branch deleted, main tree clean.
- Verdict as committed: the rescreen signal reproduces on fresh seeds,
  stronger (screen: 3/8 flips, S3 5/8; confirm: 5/12 flips, S3 8/12).
  Gross flips 2 losses, 3 rescues; net wins alone (−1 lesser) would
  misread the lever entirely. The known-trick hold is a live wire, not a
  knob — direction is seed-dependent.
- V-full (12): lesser 5, full 0, survived 0, wave-4 8/12, wave-5 1/12
  (99761), median 95d. Trickoff (12): lesser 4, survived 1, full 0,
  wave-4 7/12, wave-5 1/12 (99767 — a different seed, with THREE wave-5
  kills, the block's only wave-5 kills), median 94d. Trickoff-99767 ends
  with 2 living veterans and standing 422 — and never sits, because the
  table withdrew on d90 (see metric review).

## Wall (judged corpora, all three confirm blocks pooled, 72 configs)
- V-full baselines (36): full 1/36 (99785, sigoff block), lesser 13/36,
  survived 0/36, wave-5 reached 3/36, wave-5 kills 1/36 (99790 Editor d78).
- Variants (36): full 0/36, lesser 12/36, survived 1/36 (99767 trickoff),
  wave-5 reached 2/36, wave-5 kills 3/36 (all trickoff-99767).
- Pooled (72): full 1/72, lesser 25/72, survived 1/72, wave-5 reached
  5/72, wave-5 kills 4/72, no seed banks 2 living wave-4 killers AND sits
  (the one pair that forms, trickoff-99767, never sits).
- In plain words: the toggle family is now fully measured. Two of the
  three levers are real (gear parity and the known-trick hold both move
  whole villages on fresh seeds; signature damage does not reproduce).
  But none of them moves the wall: the full seat appears exactly once in
  72 villages, wave-5 kills happen on four, and the one village that
  banks a living veteran pair and kills wave-5 monsters never gets a seat
  at all. The binding constraint is unchanged: living veteran killers who
  survive to sit, and a seat that answers a village that proves itself
  after a withdrawal.

## Telemetry deviation check
Declared INAPPLICABLE, not run — same reason as the rescreen and the
0130Z round: the corpora are matched-seed classification, and the
endgame baseline is the same stale, regime-unrecorded file r118 already
flagged (its own text forbids pre-seat comparisons). Running the check
would manufacture LOUD lines against a baseline that does not describe
this regime. No compare is fabricated. §15 balanced panels do not apply
to this diagnostic: the instrument is the matched-seed classification
itself, and the prereg staged design governs.

## Infrastructure
- Pre-flight: main tree clean, disk 25%, reaper ran (active 6/16, removed
  nothing sibling-owned). B lock created 06:40Z; claim written before any
  landing work. Loop A live throughout (0615Z); its trees and arms were
  never touched.
- Registry-lock contention all run: the reaper, Loop A's registrations,
  and sibling releases queued on REGISTRY.lock for minutes at a time
  (reaper blocked ~6 min at run start behind A's stageally registration;
  the gearoff release waited ~10 min behind a 06:48 reaper + sibling
  releases). Nothing failed; every queued operation eventually landed.
  The lock is a throughput tax under concurrent lanes, not a correctness
  problem — but a run that needs the registry should budget for it.
- Gearoff orphan: the 0130Z gearoff worktree directory survived on disk
  with its `.git` pointer file missing (detached from `git worktree
  list`), while its branch was fully merged to master and its commits
  were HEAD. Verified before removal: evidence/2026-11-05 diff vs master
  byte-identical; proof scripts run from master; `git log
  master..sim-gearoff-confirm-b` empty; the 14 apparent orphan-only
  files are a Unicode-normalization artifact (accented journey
  transcripts, all tracked in master). Removed the directory, deleted
  the merged branch, released the registry entry as done-merged. The
  reaper had flagged it LOUD (uncommitted changes) because its git-status
  check fails on a non-repo directory — a detached directory is not a
  dirty tree, and the reaper cannot clear this class on its own.
- Safe-commit index clobber: hit the adoption worker's commit (repaired
  via HEAD-blob cacheinfo, commit verified correct). No clobber on the
  coordinator merge (merge, not commit) or the coordinator evidence
  commit — verify at closeout.
- Master moved 4 times under the run (ship bump lineage + journey
  r107 ×2 + gearoff already at HEAD at start); trickoff rebased twice,
  proofs green after every rebase and on merged master. check.js --quick
  NOT re-run: zero src/js on master from this run; standing 284/6 profile
  recorded by the 1830Z run 2026-11-05.

## Metric review (for the NEXT run, not this one)
- The gross-flip judge earned its keep a third time: gearoff nets −1
  lesser with 3 gross flips; trickoff nets −1 lesser + 1 survived with 5
  gross flips including the block's only wave-5 kills. A net-wins judge
  would have killed both levers twice (screen and confirm). Keep the
  gross-flip judge for any future toggle-style confirm.
- The confirm family is closed: sigoff NO-GO (inert 11/12), gearoff GO,
  trickoff GO. No further toggle confirm is owed. The next work is a
  BUILD arm on the wall itself, not another measurement of these levers.
- Open design question, carried from the trickoff metric review (NOT
  chased here): the d90 table withdrawal on 99767 — a village at
  standing 422 with three wave-5 kills never gets its table back after a
  withdrawal. Is a withdrawn table permanently gone, or should a village
  that then proves itself in wave 5 earn the offer again? That is a
  Steve/design question. Appended to hidden_files/sim-findings.md as
  steve-call by this run.
- The survived class earned its naming again: 99767's survived-to-horizon
  is the most informative outcome in the family (standing 422, three
  wave-5 kills, table withdrawn) and would have been invisible as
  "other." Keep the vocabulary.
- The zero-fight census trap stands (rescreen + trickoff metric reviews):
  0 census fights on 99762/99763/99765 trickoff means "died before wave
  4," not "refused to fight." A low-wave fight census is still unbuilt.

## Village assessment (plain words)
Thirty-six fresh villages, three levers, one full seat. The villages
that sit do so on the pinned game with or without the levers; the levers
decide WHICH villages sit and which scatter, not whether sitting happens
at all. The strongest village in the family never sits: it fights wave 5,
kills three of its monsters, stands at 422 — and the table, once
withdrawn for want of food-thesis deeds, does not come back. That is the
wall in miniature from the other side: the seat is a separate negotiation
from the fighting, and a village can win the fighting and still lose the
negotiation. What is missing is not wave access — wave 4 unlocks on
22 of 36 baselines — it is living veteran killers who survive to sit,
and a seat that answers proof offered late.

scale-onramp stays converging (NOT converged): the toggle family is fully
measured and closed (sigoff inert, gearoff + trickoff live wires), but
wins are still lesser-only outside a single fragile full seat, wave-5
kills still number four in seventy-two villages, and no seed banks two
living wave-4 killers and sits. Next blanks, in order: (1) a lever on the
wild death channel for first killers; (2) the withdrawn-table question —
Steve call (see metric review); (3) flee-repair game-code port — STEVE
CALL on scope. food-economy stays converging (NOT converged): untouched
by this run. Claim deleted; lock deleted.
Evidence: evidence/2026-11-06/sim-winnability-round-0630.md (this file).
