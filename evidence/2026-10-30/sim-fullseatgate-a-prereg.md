# sim-fullseatgate-a — PREREGISTRATION (binding, committed BEFORE any judged sweep)

Run: flesh-out loop, run fleshout-20261030T1427Z, worker
sim-fullseatgate-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Sibling loop B live on food-economy — NOT touched:
no loop-B trees, claims, or axis.

Decomposition question (from run fleshout-20261030T1315Z,
evidence/2026-10-30/sim-scale-onramp-round-1315.md): on the
dissolveprobe pilot band (seeds 75101–75108) the table was reached
on 7/8 seeds yet the FULL seat was won on 0/8; on the fleepolicy
band table was 5/8 with full seat 0/8. The table is reached but
the full seat never follows. WHY?

DIAG / MEASUREMENT ONLY. Zero src/js changes, zero gate moves,
zero deed-bar moves, zero default flips. The recorder is
harness/policy-side instrumentation only (a new sweep script +
analyzer, layering on the untouched tableseat-nowait policy).
If implementing the recorder would change game behavior, STOP
and report that instead of landing a behavior change. No
[needs-eyes]: this arm changes no feel, combat, or UI — it only
records.

## Canon read first

docs/CANON.md, then docs/TABLE.md (the seat contract: full seat =
deedGateReady — national/global scale, all wave bars 5/5/4/3/2
distinct fought, 3+ contests survived, 3+ crises, stage >= 2,
food-thesis deeds sentimentTaught + feastSurgeUsed; lesser seat =
waves 4/4/3, 2+ contests, 2+ crises, regional+, stage >= 2, same
food-thesis deeds) and docs/SCALE.md for the scale ladder. Steve's
2026-10-27 ruling (TABLE.md + progression.js deedGateReady):
national standing IS required for the full seat and IS enforced
in `ok`. The leadership vector, wave progress, integration
stage, coalition scale, audience, knowledge, and moral ledger
are read from the real functions (tableSeat, deedGateReady,
ledger, scaleRank, integrationStage, havenViewership,
codexBreadth, tableEarnedPaths, villageStanding) — never
recomputed from a private formula, except where a function is
documented to fire beats in the day loop (villageStandingTotal:
called only at capture moments and at end-of-run, never inside
the daily snapshot loop, following the wave5gate precedent).

## Substrate (verbatim, comparable to the prior run)

- Policy: scripts/policies/tableseat-nowait.js, verbatim
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1; seat legs only, no wait
  leg) — the same substrate as the dissolveprobe pilot band, so
  pilot table counts are comparable to the prior run's 7/8.
- Horizon: 180d death-aware (runDays stops on village death;
  dead villages stop simulating, no fixed-200d tail beyond the
  harness's own end). Why: the prior band used 180d death-aware;
  reusing it keeps the decomposition on the same horizon that
  produced the 7/8-vs-0/8 shape. A longer horizon would answer
  a different question (late full seats) and is out of scope.
- Pilot seeds: 75101–75108 (the dissolveprobe pilot band,
  verbatim). Do NOT mix bands in one verdict.
- Confirm band (pre-specified, fresh, no overlap): 75111–75118
  (8 seeds), same policy, same horizon. Named here so confirm
  seeds cannot be cherry-picked after the pilot.

## Recorder: what "at table time" means

For every seed, the daily hook runs the base policy FIRST, then
takes a pure-read snapshot. The AT-TABLE vector is captured the
first day post-base on which progState.tableWaiting is true
(table announced / waiting) AND, if the seat is taken during the
run, a second vector at the first day post-base on which
progState.tableDone is true with a sitting recorded. If a seed
reaches the table only via a seat the base policy takes inside
base.daily (tableDone set before any post-base snapshot sees
tableWaiting), the at-table vector is the first post-base
snapshot with tableDone true, flagged `tableSeenViaDone`.
A seed with neither flag has no at-table vector and counts as
a recorder miss if the prior run's corpus says it reached the
table — misses are reported, never silently dropped.

Vector fields (all from real game functions, each with its
own error capture so one failed read cannot blank the vector):
seat + detail from tableSeat(); full breakdown from
deedGateReady() (ok, waves, contests, crises, scale, stageOk,
foodDeeds, stage, w1–w5, contestsN, crisesN, rank); lesser-seat
components recomputed from the same detail (w1>=4, w2>=4,
w3>=3, contests>=2, crises>=2, regional+ scale, stage>=2,
foodDeeds) for the lesser-vs-full gap; leadership/moral ledger
from ledger() (protected, killed, brokerage, might,
showmanship, exposed, embrace, defiance, foodShared,
foodHoarded, unified, fractured, betrayed where present);
wave progress (unlockedWave, wavesFaced counts per wave,
waveEngaged per wave); integrationStage(); scaleRank();
villageStanding() breakdown; codexBreadth(); havenViewership();
tableEarnedPaths() earned-door names; sysBond / grounding /
relayLean where readable; sentimentTaught and feastSurgeUsed
separately; arc; day; table flags; won + ending path if any.
Transcript capture: Game.say lines containing TABLE / seat /
audit / priced, with day, for the sense-read (read-only wrap,
no RNG, no inputs).

## Primary metric (binding)

For each table-reaching pilot seed, the full-seat gate vector
AT TABLE TIME. The judged unit is the deedGateReady component
set: {waves, contests, crises, scale, stageOk, foodDeeds} plus
the per-wave bars (w1–w5 vs 5/5/4/3/2). Counts are over
table-reaching seeds only (seeds that never reach the table
cannot answer "why does the full seat never follow the
table" and are reported in wall numbers, not in gate counts).

## GO thresholds (honest, fixed here)

- PILOT GATE (must pass before any confirm spend): (a) >=5/8
  pilot seeds reach the table (prior run: 7/8; 5 is the floor
  for a decomposition corpus, not a re-confirmation of 7/8),
  AND (b) an at-table vector is captured for >=90% of
  table-reaching pilot seeds (i.e. at most one miss on a 7- or
  8-seed table corpus; a miss rate above that is an
  instrument failure, not a finding). If either leg fails,
  STOP per the pilot gate: no confirm sweep, verdict reported
  as PILOT-FAILED with the leg that failed.
- GO (single dominant failing gate): one deedGateReady
  component fails on EVERY table-reaching pilot seed with a
  captured vector, and no other component fails on more than
  half of them — i.e. the decomposition has one answer, with
  counts. The confirm band must then reproduce it: the same
  component fails on >=7/8 confirm table-reaching seeds (or on
  every confirm table-reaching seed if fewer than 8 reach).
- DIAG-GO (ranked blocker list, NO dominant gate): no single
  component meets the GO bar, BUT the pilot + confirm corpora
  together yield a complete ranked blocker list: every
  component's fail count over table-reaching seeds, the
  per-wave bar shortfalls (w1–w5 vs bars), and the
  lesser-vs-full gap per seed (which lesser components already
  pass, which full-only components fail). DIAG-GO is the
  verdict when the shape is "several gates, each blocking a
  different subset" — it is NOT a GO, and it must never be
  upgraded to GO mid-run. A DIAG-GO still requires the pilot
  gate to have passed and the confirm band to have run.
- NO-GO: pilot gate fails, OR the recorder cannot capture
  vectors (instrument failure), OR the confirm band
  contradicts the pilot's dominant gate (different component
  dominant, or pilot-dominant component fails on <50% of
  confirm table-reaching seeds). Contradiction is reported
  as NO-GO with both bands' counts, never averaged away.

## Wall numbers (every band)

national ever / national final, table reached, table entered
(seat taken), wins split lesser vs full seat, wave 1–5 reach,
median survival (days), death-cause shares where the harness
reports them. Balanced panel (scripts/balance-panel.js,
MEASUREMENT.md §15): NOT APPLICABLE to this arm — there is no
before/after pair (no game change, no arm/baseline split); the
pilot band is a measurement of the current master, not a
comparison. Running a panel of the pilot against itself or
against the prior run's different-instrument corpus would be
a false comparison, so no compare .md is attached; this
decision is stated here so it is not read as an omission.

## Sense-read (SENSE-TESTING LAW)

Read at least one full table sequence from the corpus
end to end (audit lines + seat line + path choice + outcome):
does the table read as a priced decision, and does the
full-seat denial read as legible — i.e. could a player
understand, from the table's own words, what the full seat
would have taken? A denial the fiction never names is a
finding, not a footnote.

## Metric review

Doubts about the metric go here at evidence time, never as a
mid-run re-score. Known pre-run doubt: "at table time" is the
first waiting day, but the full-seat bars could in principle
be met LATER in the same run (after sitting a lesser seat,
or after the table waits) — the at-table vector answers
"why is the seat lesser when the table arrives", not "could
the full seat ever be earned in this run". The end-of-run
vector is therefore also captured per seed, and any seed
whose end vector meets the full gate while its at-table
vector did not is reported as a separate line (late-full),
never folded into the at-table counts.
