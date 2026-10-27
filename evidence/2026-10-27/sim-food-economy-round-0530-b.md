# sim-food-economy-round-0530-b — coordinator evidence (loop B, run fleshout-loop-b-20261027T0530Z)

Axis food-economy (converging). Two arms, both LANDED as measurement, merged
locally pending ship. Zero src/js changes in either arm's own commits; no
default flips; no game-code lever.

## Run-start: stale-lock recovery

The previous B run (fleshout-loop-b-20261027T0049Z) was dead at run start by
the guard's own rule: its lock was 4.6h old, its tree sim-stockdoors-b had a
heartbeat 61 min stale (04:28Z), and no B worker process was running. Its
lock was deleted and its claim retired to .DEAD. Sibling loop A was LIVE on
scale-onramp (0525Z claim: divergebase + nonworldkill, NOT touched) and
landed during this run (517998077); B worked food-economy throughout.
Main tree clean and disk 27% at pre-flight.

## Arm 1 — sim-stockdoors-b-land (coordinator adoption, stranded 0049Z arm)

The 0049Z run died before landing: its bothgrow arm (c8770e7f4) was already
on master, but its stockdoors branch tip (b55b484ec) was stranded with a
dirty worktree. Findings on adoption:
- The worktree held post-commit scratch written AFTER the 03:37Z evidence
  commit: a pilot-corpus rerun (03:48–04:12Z) and a 12-file confirm corpus
  (seeds 9768–9779, from 04:21Z) — although the committed evidence states
  the NO-GO pilot forbids confirm spend. That scratch was preserved
  out-of-repo (goal hidden_files/stranded-stockdoors-0049Z-postcommit/,
  12 + 8 files) and NOT committed or judged; the worktree was restored to
  HEAD. Future arms: seeds 9768–9779 are spent-but-unjudged for stockdoors
  purposes. The evidence's "confirm unspent" claim was true at its commit
  time and false afterwards; this note corrects the record.
- Landing was initially BLOCKED on proof: on branch-tip code the stockdoors
  proof fails its reproduction leg (det-gate 240/1247/3/155 vs committed
  corpus 255/1249/4/163; trajectories agree through day 42, fork day 43).
  All other legs passed, including independent residual recomputation.
- Root cause found this run (residualhunt step 0, then re-verified directly):
  the corpus is a valid measurement ON THE PRE-c04d4e0cb BASE. With
  src/js/game.js temporarily replaced by the e69842153 blob
  (b2ba423afdfbdce8c98751ef544f10805b46cfa6), the stockdoors proof passes
  every substantive leg including reproduction (255/1249/4/163), failing
  ONLY its two hygiene checks, both naming game.js itself — the swap
  artifact, not a modification. Game.js was restored (blob bfa36319…) and
  the tree verified clean after each swap. Timeline fits: corpus generated
  on pre-c04d4e0cb code, branch rebased onto c04d4e0cb (journey-scale r42
  bystander-hold fix, src/js/game.js +17/-2), evidence committed without
  re-running the proof.
- Landing: branch rebased onto master 17ad59919 clean (new tip d16fa62ee),
  pinned-base proof as above, merged --ff-only. The corpus is landed WITH
  THIS BASE PIN: its trajectories are pre-c04d4e0cb trajectories and must
  not be cited as current-base trajectories. Its verdict stands as judged:
  NO-GO on leg 3a (named-family rate 9/12 vs 80% bar; pooled named 0.245%,
  generic 0.198%, dried 0.70% all pass).

## Arm 2 — sim-residualhunt-b (worker, GO)

Worker branch rebased onto master 517998077 clean (new tip 17ad59919),
pinned-base proof re-run GREEN by the coordinator (det-gate reproduces
corpus 9820 counts 255/1249/4/163; independent residuals match the analyzer;
hygiene clean apart from the swap itself), merged --ff-only.
Verdict against its prereg: GO.
- Clause (a): reproducing base identified (pre-c04d4e0cb, counts quoted).
- Clause (b) via the ≥2 half: Muscadine 9824 (+1,800) and Burdock 9824
  (+1,800) are each exactly their day-100 meal draws, unreflected because
  the closing snapshot is taken before the day-100 meal draws settle — a
  closing-boundary artifact, not a missing door. The single-flow half is
  honestly NO (two draw sets, one artifact class, same meal shape).
- Lamb's Quarters 9825 (+1,130) decomposes as base +1,250 (day-100 base
  draws, exact) + dried −120.
- Reported-not-judged items close exactly too: generic 9822 (+3,177) = one
  day-101 spoil sweep; Fish 9825 (+2,016) = two day-101 sweeps (1,536 + 480)
  — which exonerates the direct recorder's portion rule; it was never
  over-explaining. The stockdoors NO-GO stands as judged; the
  boundary-aware ledger fix belongs to the NEXT run's prereg, not a
  re-score here.
- Left open (documented, not chased): LQ dried −800 (an 800-kcal dried-stock
  drop between day-81 and day-82 snapshots with no record in any of the six
  instruments); Muscadine 9825 (−864, passes at 0.39%, zero day-100 draws —
  a different small component for the next ledger pass); day-101 sweeps on
  other seeds mix with day-100 flows and are NOT claimed as explanations.
- Infrastructure note (worker-reported): the judged sweep took ~7 min wall
  for ~15 s of sim compute (~60 s gaps between file writes, cause not
  established, no EPERM flap observed). Safe-commit index clobber hit both
  worker commits (repaired via HEAD-blob cacheinfo, verified clean after
  each) and both coordinator steps were verified after commit.

## Wall numbers (both arms, competent-nofeast, seeds 9820–9827, 100d)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8 (wave 3 on 9822/9824/
9825, wave 2 on the rest). Median survival: 100d (all survived to horizon).
Deaths: 38 total — sickness 17, monster 5, ambush 4, wound 4, arena 3,
contest 2, sunback 1, alien 1, dehydration 1. The scale wall stands on this
band; these arms measure a pantry ledger, they do not move the wall numbers.

## Telemetry deviation check

On both merged corpora (residualhunt 2026-10-27 + stockdoors 2026-10-26):
3 LOUD lines each (national 12→0, table 16→0, wins 16→0) — the known
SEATDRIVE=0 regime artifact class (WINSEAT baseline vs pre-seat measurement
corpora). Baseline NOT rolled, no new investigation. No exiled LOUD line.

## Balanced panel (MEASUREMENT.md §15)

No before/after panel comparison exists: neither arm changes a lever or any
game code, so there is no before/after to panel. The before/after that DOES
exist is instrument before/after (driedpath ledgers without the new doors
vs stockdoors ledgers with them: pooled 90.42% → 0.245% named, 90.42% →
0.198% generic, dried 8.78% → 0.70%) and base before/after (pre- vs
post-c04d4e0cb trajectories, fork day 43) — both reported above, neither
re-scored.

## Metric review (MEASUREMENT.md §14)

- Stockdoors metric worked as written (NO-GO stands; see base pin above).
- Residualhunt metric worked as written (GO via the ≥2 half; the single-flow
  half honestly failed and was NOT re-scored). The next ledger arm's prereg
  must define the closing boundary explicitly (snapshot timing vs day-100
  meal draws and day-101 sweeps) before judging any family ledger closed
  again — that revision belongs to the next prereg, not to these verdicts.
- No jest run (proofs are node, not jest). No [needs-eyes]: both arms land
  measurements, not player-visible changes. No push, no version bump: the
  batch ship job owns deploys. Merged locally, pending ship.
