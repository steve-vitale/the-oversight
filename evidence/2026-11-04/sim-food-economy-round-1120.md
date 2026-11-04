# sim-food-economy-round-1120 — coordinator evidence (Loop A, run fleshout-20261104T1120Z)

Axis: food-economy (converging, NOT converged). Sibling Loop B live on
scale-onramp throughout (1030Z claim: approachfall / holdbeatfix /
recoverylong; its landings moved master mid-run, NOT touched) — so Loop A
worked food-economy per the convergence rule (topmost axis not converged
and not named in a live claim). No gate/price/deed/readyDemand changes.
Zero net game-code change landed (arm 1 fix reverted after judging;
arm 2 test-only).

## Arm 1 — sim-hurthome-fix-b: NO-GO (judged, fix reverted)
The named next arm from 1015Z sim-hurthome-fix-a (INSUFFICIENT-DATA).
Worker evidence: evidence/2026-11-04/sim-hurthome-fix-b.md +
prereg evidence/2026-11-04/sim-hurthome-fix-b-prereg.md; corpus
evidence/2026-11-04/perseed-hurthome-fix-b/ (32 per-seed JSONs + summaries).
Fix commit 299d94403 re-applied by cherry-pick; proof 10/10 green before
any judged sim. Instrument rebuilt event-based (scripts/hurthome-b-lib.js,
sweep-hurthome-fix-b.js, analyze-hurthome-fix-b.js; instrument proof
scripts/test-hurthome-b.js 20/20 green, stays on master).

Cells: fresh band 97601–97616, competent, 100d death-aware cap,
PLENTYDEPRI=1, DEPOSITGATE=1, both legs fresh on current master.
Judged census met (trip cases 25 baseline / 24 armed, bar ≥16 each;
returned-hurt trip cases 11 / 22, bar ≥8 each); pilot passed both cells;
instrument errors 0, unclassified 0.
- PRIMARY MET: median return latency (parts, returned-hurt trips)
  armed 0 vs baseline 2 (armed ≤ 2 and armed < baseline; mean 0.41 vs 2.18).
- Secondary: died-while-away share 0.042 (1/24) vs 0.240 (6/25);
  hurt-return lines 24 vs 0. Walk-out exclusion holds (0 armed walk-out
  returned-hurt cases; no hurt line names a walk-out villager).
  Narration audit passes (2 quoted lines judged TRUE; ~8% line/case
  undercount from departed-hurt and heal-then-rehurt cases, median unaffected).
- GUARDRAILS — BOTH BREACHED, and §14 binds: median daysAlive 84.5 vs 100
  (delta −15.5, tolerance −10); survived seeds 6 vs 9 (delta −3,
  tolerance −2); total deaths 230 vs 201. Per-seed flips run both ways
  (97611 died d63 → survived 100d; 97601 survived → died d81), so
  cascade noise vs systematic cost is undecidable on 16 seeds — but a
  hard-guardrail breach voids GO even with the primary met. No re-scoring.
Verdict: NO-GO. Fix reverted in-branch before landing (revert a2868d196
after rebase; original revert 3db0dc65f); fix commit stays in history for
re-application. Named next arm: sim-hurthome-fix-c — guardrail-focused,
fresh larger band (per worker evidence).
Wall (100d corpus, not a scale panel): national/table/wins 0/16 both
cells; maxWave 4 both cells.

## Arm 2 — sim-armorfetch-c-a: GO (test-only, backlog #1693 fixed)
Worker evidence: evidence/2026-11-04/sim-armorfetch-c-a.md.
Part C of scripts/test-armorfetch-b.js made item-agnostic: each seed's
spawn armor is derived at run time from that seed's corpus spawn snapshot
(filtered by src/data/items.json armor defs, same derivation as
scripts/analyze-stasharmor-a.js); no hard-coded item per seed remains in
Part C; no-spawn seeds report untestable, not misses. Parts A/B and
C2/C3 behavior-untouched.
- Spawn re-probe on current master before confirm: NO new drift since
  1015Z (16103 bloodplate, 16109 none, all 16 seeds match the 1015Z corpus).
- Confirm: node scripts/test-armorfetch-b.js
  evidence/2026-11-04/sim-stasharmor-a-corpus → 41/41 GREEN (Parts A+B
  38/38; new Part C 3/3). Baseline before the fix reproduced 40/41 with
  C1 FAIL on the stale map. Bar strengthened pre-confirm (every spawned
  armor on all 16 seeds, not ≥2/3 on 3 hard-coded seeds) and passed 15/15.
- Agreement: Part C vs independent item-agnostic analyzer 16/16, zero
  disagreements (15 WORN, 1 NO-SPAWN at 16109).
Backlog: #1693 → fixed on landing; #1694 updated (no new drift; current
state remains 16103 swat_vest→bloodplate, 16109 farstrider_boots→none);
#1695 tier-3+ watch left open (no panel run here). [needs-eyes] omitted
(test-only; the landed armor commit already carried the flag).

## Landing
- Arm 2 merged --ff-only as d6d91a32a (test 8118df5ef + evidence),
  re-proven 41/41 on merged master, tree released done-merged, branch deleted.
- Arm 1 branch rebased onto current master (Loop B landings + arm 2 merge
  in between): the documented rebase stop-at-pick quirk hit the revert pick
  (pick in both done and todo lists, worktree clean, revert unapplied) —
  recovered with `git rebase --continue` per AGENTS.md, all 3 commits
  replayed exactly once, no conflict, no force. Re-proven on the rebased
  tip (test-hurthome-b 20/20; armorfetch Parts A+B 38/38 in the worktree,
  full 41/41 on merged master). Merged --ff-only as a2868d196; tree
  released done-merged, branch deleted.
- check.js --quick NOT re-run in full (zero net src/js change on master
  from this run; arm proofs green on merged master — same precedent as
  the 1015Z closeout).
- Main tree after closeout: only Loop B's 2 untracked coordinator files
  (evidence/2026-11-04/sim-winnability-round-1030.md + .log) remain —
  NOT mine, NOT committed, NOT deleted. Everything else clean.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-04/perseed-hurthome-fix-b/*.json'
--metrics national,table,wins,exiled` → LOUD national/table/wins
baseline -> 0 (n=34 files). EXPLAINED: 100d hurt-episode diag corpus,
zero net game-code change — same class as the 1015Z hurthome corpus.
Baseline NOT rolled.

## Metric review
- The event-based instrument works: it judged what the dawn census could
  not (census bars met in both cells, primary with headroom). The
  latency metric is now the proven instrument for any future turn-home arm.
- The guardrail breach is the finding, not a measurement artifact to
  explain away: faster hurt returns did not buy survival on this band.
  The next arm must be guardrail-focused (larger band, cost decomposition),
  not another latency re-measure.
- Part C's run-time derivation (not a refreshed literal map) is what
  prevents #1693 from recurring on the next drift.

## Backlog / next blanks (food-economy)
1. sim-hurthome-fix-c (guardrail-focused, fresh larger band).
2. (v**) deploy fraction still undecided — Loop B's orphaned
   sim-fracchoice-b tree holds that question; NOT duplicated here.
3. #1695 armor-fetch panel tier-3+ watch still un-rechecked (needs a panel).
4. #1699 exphurt disconnect: hurt-aware return line exists (the reverted
   fix's line) but the write-back / return-line carrier question stays
   open for a future arm now that the turn-home rule itself is NO-GO.

food-economy stays converging (NOT converged): stash-armor instrument
now drift-proof and re-confirmed, hurt turn-home rule JUDGED NO-GO on
guardrails (not unjudged anymore), deploy fraction still undecided.
Claim deleted; lock deleted.
Merged locally, pending ship (armorfetch-c 8118df5ef + d6d91a32a;
hurthome-fix-b 5cf217912-cherry-pick/8e930f3d3 + f8d940aa3 + a2868d196;
coordinator evidence this file).
