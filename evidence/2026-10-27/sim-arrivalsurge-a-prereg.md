# sim-arrivalsurge-a — PRE-REGISTRATION (binding, written BEFORE the evidence verdict)

Run: fleshout loop A, run fleshout-loop-a-20261027T0840Z, axis scale-onramp.
Arm: sim-arrivalsurge-a — DIAG ONLY, code archaeology. Zero src/js changes,
zero default flips, no game lever, no lever proposal, no lever sweep.
The deliverable is the ANSWER, not a fix: do not change spawn behavior.

## QUESTION (fixed before concluding)

Why did wave-4 arrivals triple from 11 (October 25 census,
evidence/2026-10-25/sim-w4funnel-a.md) to 31 (October 27 re-pin,
evidence/2026-10-27/sim-w4funnel-repin-a.md: tile-entry 28,
scripted-titan 3, median arrival day 133 vs 139, median days available
27 vs 7) while every band headline stayed identical (wins 4/8,
national-ever 7/8, national-final 5/8, table invited 5/8, entered 4/8,
wave-4 5/8, wave-5 0/8, median 130d, deaths 284, starvation 2;
seeds 73671-73678, tableseat-nowait policy, 180d death-aware horizon)?

## BASE PIN (established FIRST, not assumed)

- October 25 base = 120ea4d3a (parent of the w4funnel-a evidence commit
  2d1d35df2; the w4funnel worktree's branch tip at commit time).
  Cross-check: zero src/js + src/data diff between the w5chain-a worktree
  base (d5d28d44, parent of 353bede41) and 120ea4d3a — the October 25
  census's game tree is identical to the w5chain band's game tree, which
  is why the October 25 control gate reproduced that band exactly.
- Re-pin base = fc57dd0bd (journey-scale r43 note). The surge window is
  120ea4d3a..5c3c80013 (the 0615Z coordinator base); the r43 window
  5c3c80013..fc57dd0bd is checked separately and is NOT presumed
  neutral — the re-pin evidence's "master movement since 0615Z is ONLY
  r43" claim is tested against git history, not repeated.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 = The
  Mirror Draft, standing >= 100; wave 5 = The Producers, standing >= 200
  AND wave-4 faced; readiness gates in src/js/standing.js
  waveCombatReadiness()). Context read first:
  evidence/2026-10-25/sim-w4funnel-a.md,
  evidence/2026-10-27/sim-w4funnel-repin-a.md + its prereg,
  evidence/2026-10-27/sim-scale-onramp-round-0755.md.

## METHOD (fixed before concluding)

1. Full-window diff: `git diff 120ea4d3a..5c3c80013 -- src/js src/data`
   (every hunk read, not sampled) + per-commit attribution for every
   touched game file.
2. Symbol search: `git log -S` over the window for spawnWaveTarget,
   waveCombatReadiness, villageStandingTotal, readyDemand,
   monsterWavePool, scripted-titan, tile-entry (src/js scope) — every hit
   examined; a zero-hit result is reported as zero, not presumed.
3. Substrate identity checks: `git diff` for the five census recorders
   (spawnsrc-diag, oldcore-diag, raftdraft-diag, w5births-diag,
   defwound-diag), the tableseat-nowait policy, leanlinkrescue, the
   sim harness and sweep-compare — any difference is a candidate, not
   background.
4. Spawn-path reads at the current tip: monsterWavePool,
   spawnWaveTarget, maintainWorldMonsters (cap rule), the tile-entry
   spawn site (occupancy rule), and the bystander-hold code — the
   mechanism story must survive these reads.
5. No sims, no lever sweeps: any mechanism that cannot be settled from
   code/history alone is named as unsettled WITH the exact confirming
   measurement a future arm would run. Pulling a lever to settle it
   inside this archaeology arm is out of scope by assignment.

## DIAG-GO RULE (binding; judged only against this)

DIAG-GO requires ONE of:
  (a) a NAMED COMMIT that explains the surge (commit hash + the
      mechanism in plain words + why headlines could stay identical
      while arrivals tripled), with file-level evidence; OR
  (b) a NAMED "NO SINGLE COMMIT" verdict with EVERY plausible candidate
      commit disposed of individually — explains / contributes /
      ruled out — each with file-level evidence (commit + file +
      what the diff does + why that disposition follows).
A vague "something changed" is DIAG-NO-GO, never re-scored mid-run.
A verdict that names a spawn/standing-code change MUST survive check
(2): if the symbol search is empty, no such verdict is available.

## METRIC REVIEW (docs/MEASUREMENT.md §14 — mandatory section in evidence)

Pre-registered metrics bind this run: the verdict above is the only
metric. No re-scoring against a friendlier verdict mid-run. If the
method proves the question wrong (e.g. the October 25 base pin fails),
that is written under metric review and the verdict follows the pin,
not the wish.

## SCRIPT NOTE

A proof script (scripts/test-arrivalsurge-a.js) is warranted ONLY as a
read-only git-history check: it re-runs the window queries above
(zero -S hits, recorder/policy/harness identity, r43 window shape,
fallback commits in-window) and prints PASS/FAIL. It proves the
negative claims mechanically. It runs no sims and changes no game code.
If it cannot be made green honestly, the evidence says so instead of
inventing one.

## NO [needs-eyes] FLAG

Code archaeology, not a feel/combat/UI change. No flag applies.
No push, no version bump, no live verification — report 'merged
locally, pending ship' readiness (the coordinator merges).
