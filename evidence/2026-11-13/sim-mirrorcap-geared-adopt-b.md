# sim-mirrorcap-geared-adopt-b — adoption of the reaped panel-3 tree (Loop B 2030Z)

## Run

- Run: fleshout-loop-b-20261113T2030Z (scheduled 1430 CST), axis winnability chain.
- Orphan: tree sim-mirrorcap-geared-b reaped by the cron reaper at 14:30 CST
  (heartbeat 4.0h stale); branch sim-mirrorcap-geared-b KEPT, 6 commits ahead
  of master, no work lost. The panel worker (d2907e0d) never closed out; this
  adoption recovers its committed work. Loop A live on scale-onramp the whole
  run (2015Z claim, culpritbisect-c s05/s06) — NOT touched.
- The re-point queue is fully disposed before this run (arm-2 toggle CLOSED
  0630Z Nov 6; flee-repair is a Steve-call, held branch sim-fleerepair-a;
  standing accumulation answered) — recorded here so the next run does not
  re-take a stale queue item from the body text.

## Adoption — sim-mirrorcap-geared-b: EVIDENCE LANDED, cap NOT landed

Branch tip 696aa197e (panel 3 evidence: NO-GO on M2). Verified by the adoption
coordinator from the corpora, not from worker claims:

- All 32 corpora parse as JSON (24 panel rows + 8 census rows), 0 bad files.
- Analyzer re-run (branch script, read-only, against the extracted corpora):
  reproduces the evidence EXACTLY — armed n=12, 7 reached Reunion, mirrors
  1x7, rounds mean 8.6, damage mean 0.341 (max 0.574), won 0; baseline n=12,
  7 reached, mirrors 3x7, rounds mean 3.9, damage mean 0.163, won 0.
  M1 PASS (cap fires 7/7), M2 FAIL (0 wins vs bar >= 1), M3 PASS per the
  branch gate (proof 29/29, arena 57/57).
- Gate log landed as evidence: check.js --quick 335 passed, 5 failed in 712s
  on the branch; 3 stale-proof failures verified pre-existing on pristine
  master at 42024a8de (measurement-proof-update, measurement-workflow,
  phone-frame-proof — the proof-refresh blank this run's second arm takes),
  2x 120s load timeouts re-ran clean standalone (living-garden 8/8,
  one-person-army 7/7). 0 failures touch the cap, partyTactics, arena, or
  mirror code.

Landing set (panel-2 precedent fdff404dd: evidence only, zero scripts/src):
cherry-picked -n 2fce47b47 + 48234add2 + 2e00d8430 + 696aa197e, scripts
dropped (geared-census, panel3 driver, analyzer stay on the branch with the
cap). 35 files: panel evidence .md + prereg .md (incl. base correction
4c4df500e -> 42024a8de) + gate log + 24 panel corpora + 8 census corpora.
Zero src/js, zero scripts. The cap commit 417f5ef5a (game.js +7,
partyTactics.js +32) and the test-assertion update stay on branch
sim-mirrorcap-geared-b, which is KEPT, unmerged — per the evidence file's own
ruling and Steve's 2026-11-13 decision: do NOT land the cap on a NO-GO
verdict, do NOT kill it either (mechanism proven, failure is lethality).
The scaling call (soften the Reunion itself in the arena, or leave it
unwinnable as staged) is with Steve; MEMORY.md already carries it.

Proof legs NOT re-run on the merged tip: the proof tests are branch-only
(they assert cap behavior) and game.js moved under the panel base
(combatdedup), so a re-run here would test a different configuration than
the panel ran. The verdict is judged on the frozen corpora, reproduced
above; the gate log is the record of the branch gate. No check.js --quick
for this evidence-only landing (no code changes).

## Wall numbers

Fixture numbers, NOT scale-wall numbers (Gauntlet arena chains, not village
sims): Reunion-wave wins 0/7 armed, 0/7 baseline; chain wins 0/12 both arms;
deaths 12/12 chains both arms. Do NOT present these as national/table/wins.
Winnability relevance, narrow and stated: the arena Reunion draw at cap 1 is
still unwinnable for a geared scholar with a party of three at the
measured-average loadout — mirror count is not the binding constraint.

## Telemetry deviation check

Attempted on the panel corpus: ran, 3 LOUD lines (national 12 -> 0, table
16 -> 0, wins 16 -> 0, n=24 files) — all REGIME artifacts: the corpus is a
Gauntlet fixture (arena chains), not a village sim; its rows carry no
national/table/wins paths. Same class as all prior bisect/panel arms.
Baseline NOT rolled, no investigation item.

## Infrastructure

- Registration of the adoption tree took ~2.8 min (fast for once; lock free).
- Safe-commit index clobber: watch for it after the commit; repair with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` pipe and verify status/diff empty before merging.
- No EPERM flap during the adoption. Flap-watch ALL-OK at adoption time.

## Metric review (MEASUREMENT.md §14)

- The frozen metrics bound the panel (M1/M2/M3 as preregged); the adoption
  re-judged nothing and re-scored nothing. The 4 fixture failures (party
  never formed) are recorded in the evidence, not hidden; M2 is a count bar
  so 0/7 fails under any panel-size reading.
- Metric lesson carried forward (from the panel evidence): a future panel
  needing a larger valid n should over-recruit chains up front rather than
  replacing failed seeds post-hoc.
