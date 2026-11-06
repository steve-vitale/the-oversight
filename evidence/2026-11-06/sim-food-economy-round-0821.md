# Loop A food-economy round 0821Z — coordinator closeout evidence (2026-11-06)

Run: fleshout-20261106T0821Z, axis food-economy. Arms: sim-lingergorge-a
+ sim-mootsummon-a (both follow-ups to the 0028Z sim-findings entries:
nightly lingerer-gorge line firing in stranded windows; moot-turns-to-you
summons reaching stranded scholars). The coordinator timed out during
closeout; this file was written by the main session from the arms'
committed evidence. Both arms merged to master (tip `7f69b4eba`); zero
src/js in either arm.

## sim-mootsummon-a — DIAG-GO (evidence `sim-mootsummon-a.md`)

The summons DOES reach a stranded scholar, and it reads wrong. Trial
moots turn to a stranded scholar in 1/22 stranded sleep windows (4.5%)
vs 43/2,185 non-stranded (2.0%). The one hit is a live trial moot
turning to a scholar asleep on a forest floor, starving, miles from the
fire, with no way to answer. The engine carries no position gate
anywhere in the trial-moot path (tallyVotes names the scholar a voter
without ever asking where they are). All 56 summonses are trial moots;
the petition moot never summons in sims (0/56). No scholar's vote was
ever cast (0/56); 52/56 resolved via the 2-day backstop. Power bar
MET (22 windows, 6 stranding seeds). Fix NAMED, not built: gate the
trial moot's convening on the scholar being at Haven — do not call the
moot while the scholar is away; hold convening until return
(npcMootTick / playerCaseTick skip while scholar not inside Haven).
Census/diag only.

## sim-lingergorge-a — DIAG-NO-GO (evidence `sim-lingergorge-a.md`)

The powered census finds ZERO gorge lines in stranded sleep windows
(0/49 windows, 8 stranding seeds) — the pre-registered primary metric
does not confirm the defect, so no fix is built, no after leg is run,
no panel compared. Power bar passed (49 >= 20 windows, 8 >= 4 seeds):
a verdict, not INSUFFICIENT-DATA. The defect class is nevertheless
REAL and observed in the same census outside the metric: 3 gorge lines
reached scholars on combat-blocked wild nights, delivered in the
harness phase the morning after — outside both the stranded definition
and the sleep window. That is the follow-up arm's starting point, with
a revised metric (harness-phase away deliveries, not stranded-sleep
windows). The drift-off beat is unmeasurable on this substrate: 0
drift-off lines fired anywhere in 40 seeds. Regression controls hold
(FRAGMENTS, PANTRY-deposit, RAID-CALL/LINE/AFTERMATH, OVERHEAR/TALE/
BURST/SETTLE/WITNESS all 0 in stranded windows — parent fixes hold).

## Telemetry deviation check

Scale-wall telemetry check run against the mootsummon corpus
(`sim-mootsummon-a-corpus/*.json`, n=40): LOUD national 12→0, table
16→0, wins 16→0. EXPLAINED aggregation artifact — the corpus JSONs
carry no national/table/wins fields (narration censuses: maxWaveUnlocked,
evenings, transcript); the baseline comes from actual scale-wall runs.
Baseline NOT rolled.

## Convergence

Food-economy stays converging, NOT converged: two narration defects from
the 0028Z findings are now measured (one confirmed with a named fix,
one not confirmed in-metric with the real defect located outside it).
The moot gate fix and the lingerer-gorge follow-up (revised metric)
are the next food-economy arms.
