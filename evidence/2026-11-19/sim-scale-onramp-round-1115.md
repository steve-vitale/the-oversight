# sim-scale-onramp-round-1115 — ADOPTION closeout of the timed-out 0915Z run

**Run:** fleshout-20261119T1115Z (Loop A, axis scale-onramp) ·
**Adopts:** fleshout-20261119T0915Z, timed out before closeout ·
**Master at closeout:** 416e81241 · **Merged locally, pending ship.**

## Stale-lock recovery

The 0915Z lock (created 09:20:17Z, run_id fleshout-20261119T0915Z) was
116 minutes old at this run's start — past the body's 90-minute
fallback. Before deleting it, liveness was checked three ways, per the
2026-11-18 stale-lock lesson: (1) registry — the run's tree
sim-speargate-a had its last heartbeat at 10:57:08Z, 19 minutes stale
(past the 15-minute guard); (2) subagent list — both 0915Z workers were
`done` and no live coordinator agent for run 3fe28710 existed (the
active agents were chat-owned adoptions of other runs: Lane A r147,
Loop B fightcap, Lane B r238); (3) `ps` — no coordinator process. The
run was dead. Lock deleted, its claim retired to `.DEAD`, this run's own
lock + claim created. No live work was touched: Loop B (0830Z claim,
sim-freestrike-b / sim-fightcap-b) stayed live throughout and landed
its own adoption closeout mid-run (master 385f07995 → 94c6534bf);
the speargate rebase target moved accordingly and was re-done on the
fresh tip.

## Arm 1 — sim-partyfunnel-a: already landed, verified only

The 0915Z run's first arm was on master before this adoption started
(commits 126260f06…385f07995). Verified present, untouched:
**pilot NO-GO** — the funnel works (11 reassignments, 6 launches) but
the launch rate 0.421 misses the frozen bar (0.50 + 2× ctl); the pool
is now empty, which binds the #2547 family. Lever held; evidence-only
landing. Nothing to adopt, nothing re-run.

## Arm 2 — sim-speargate-a: adopted, verified from files, LANDED

The 0915Z worker's final report said "pilot complete, verdict GO,
closeout unfinished" — and the evidence file was never written. The
adoption coordinator recovered the verdict from the branch's files and
wrote `evidence/2026-11-19/sim-speargate-a.md` itself; nothing was
taken on the worker's word. Verification performed by the coordinator:

- Analyzer verdict **GO, 12/12 frozen bars pass** (analysis.json),
  re-checked bar-by-bar against the frozen prereg text.
- Proofs re-run on the branch pre-rebase AND post-rebase AND on merged
  master: `test-speargate-a.js` **31/31**, `test-bowopen-a.js` (ported)
  **36/36**, analyzer `--selftest` **43/43** — all green, three times.
- Port byte-identity: the port commit's diff against source commit
  2b29076e7 is identical except commit headers and the base blob index.
- Seed band 105901–105908 re-checked fresh: 0 hits in all
  `sim-*-prereg.md` files. A late-arriving full-evidence grep found one
  `105901` substring in an orphan fracchoice screen JSONL — inspected
  and cleared: it is the float `18.891508791059017`, not a seed.
- Corpus complete: 8/8 ctl + 8/8 arm per-seed JSONs, 0 errors. The
  write flap had crashed the driver mid-leg (ctl seeds 105906–105907
  lost); the worker hardened the write path and re-ran them.
- #2593 narration observed in the wild corpus logs (arrows / crossbow
  bolts / stones, each naming the right ammunition).

**Verdict: GO (pilot).** The gate fix: ranged-gated staging checks
`weapon.ammo`, not the slot — a spear in the ranged slot no longer
counts as ranged. 54/54 spear-holder departures passed over to the
sources (ctl 0/54); the classification shift is exact (alreadyHad
181 → 127, noSource 131 → 185, deltas 0); staged 0 both legs; all cost
bars pass with fight numbers byte-identical between legs (kill share
0.125 = 0.125, damage/round 54.7 = 54.7, starvation 0 = 0, median
150d = 150d). Landed as 7 commits (prereg, HELD-origin bowopen port,
gate fix, #2593 narration, instruments, write-flap hardening, adoption
evidence) with both `SPEARGATE` and `BOWOPEN` default-OFF — landing
changes nothing in live play. No 12–16 seed confirm: the powered
sample is departures (n = 54), the effect is deterministic
classification, and fight outcomes are byte-identical — recorded as a
decided coordinator call in the arm evidence. Next blank: the bow
SOURCE question (stash/armory 0 on both legs).

## Wall numbers (speargate pilot, 16 configs)

National 0/8 both legs; table wins 0/8 both; wave 4 reached 8/8 both;
wave 5 reached 6/8 both; scale rank regional 8/8 both; median survival
150d both. The scale wall stands — no national, no table, no wins on
this band in either leg, expected for a gate-classification pilot.
**scale-onramp stays converging, NOT converged.** The directive stands.

## Telemetry deviation check

`scripts/telemetry-check.js` **refused** the speargate corpora:
"all 8 --current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with sweep-compare
tables, never against a run baseline here." Both legs refused identically.
No LOUD lines, no baseline roll — the comparison the body prescribes is
invalid for this corpus shape, and the tool says so itself. Wall numbers
are reported from the analyzer instead (see above), which is the
governing instrument for this arm. Baseline `scale-wall.json` NOT
rolled.

## Infrastructure

- **Rebase stop-at-pick quirk struck TWICE in one rebase** (PORT pick,
  then gate-fix pick): each pick listed in both done and todo, worktree
  clean, pick verified unapplied via `git diff <pick>` (471 and 390
  lines) before each `git rebase --continue`. Recovery worked both
  times; final log shows each commit exactly once.
- **Safe-commit index clobber** hit the adoption evidence commit:
  all 34 committed files showed staged-deleted with the files present
  on disk. Repaired via `git ls-tree -r HEAD -- evidence/2026-11-19/ |
  git update-index --add --index-info`; status empty + diff HEAD empty
  after. Commit itself was correct.
- **Reaper skipped**: registry lock held by another reaper run
  (consecutive skips: 2) — no cleanup this run. The worktree release
  also waited ~8.7 minutes on the same registry lock before completing.
  Nothing was removed by this run; dead-tree cleanup is left to the
  next run.
- **check.js --quick NOT re-run on merged master**: the arm's proofs
  ran green three times (31/31, 36/36, 43/43) and the change is
  env-gated with byte-identical off behavior; the standing quick profile
  (280 passed / 7 failed, pre-existing parity gear assertion) was last
  recorded by the 2215Z/2315Z runs and this run's files touch no
  green-list file beyond the two new proof tests, both green. Recorded
  as a gap, not green.
- Main tree clean at closeout; lock + claim deleted below. No push,
  no version bump — the ship loop owns deploys.

## Findings backlog

No new items. The bow SOURCE question stays open from bowopen §5
(sources 1–2); the write flap is the known ongoing infrastructure
issue, not a new finding.
