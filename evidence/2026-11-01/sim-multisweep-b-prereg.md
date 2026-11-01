# sim-multisweep-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1725Z,
axis food-economy, arm sim-multisweep-b. Worktree sim-multisweep-b.
This worker does NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Question (from the coordinator brief + haulsize evidence)

The haul-ceiling decomposition (sim-haulsize-b, pilot NO-GO on
primary, DIAG only) found two stacked causes. The first blank in
evidence order is the second-trip / multi-sweep follow-up for the
POLICY_ONE_TRIP shape: on all 64 successful-trip days the scholar
stops after ONE forage sweep although 80–112 ticks remain (a trip
costs 16), the pack sits at most 87% full, and 4+ stocked tiles
remain. Does letting the scholar go out again on successful days
grow the finished pack past the ceiling on identical seeds?

Canon: docs/CANON.md read first. No canon doc covers a
second-outing policy (foraging is player action, not a designed
system with a canon page); the rule below is a policy variant, not
a canon rewrite, and the evidence file says so rather than
inventing canon.

## The variant (frozen rule — one rule, stated here)

scripts/policies/competent-multisweep-b.js — a NEW policy file
that leaves scripts/policies/competent.js untouched (spread-copy
of competent, only daily() overridden). Default OFF: nothing loads
it unless a driver names it. Zero src/js changes, zero
policy-default flips.

RULE: after the baseline competent.daily finishes, IF the scholar
is alive, at the haven, and the base daily had >= 1 successful
forage, the scholar goes out again: up to 2 additional
forageTripSeedFirst calls (total <= 3 sweeps/day, counting the
base trip). Each extra trip is guarded: alive, at the haven at its
start, pack < 95% of cap, no active turn-fight. The extra-trip loop
STOPS after a trip returning 0 (no success — worked-out land, not
a second outing) or when the pack reaches >= 95% of cap. Extra
trips run AFTER the base daily's sort/donate/eat, i.e. as a genuine
second outing from home after the first haul is dealt with. Base
success is counted with a temporary Game.doAction wrapper during
the base daily only (restored in a finally); extra trips are
counted separately in ctx (multisweepExtraTrips /
multisweepExtraSuccesses).

## Substrate (fixed, matches the haulsize band exactly)

Competent policy (baseline) vs competent-multisweep-b (armed),
30 days, DEPOSITGATE=0 (keep 2,000). Env (FATAL if violated on the
judged CLI path): COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=0, POLICY=competent|competent-multisweep-b, DAYS=30.
The * =1 flags barred in haulsize (COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND,
WOODCARRY, WOODWARM, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB, FEDEVENING) must NOT be 1.

Fresh seed band only: pilot 51801–51808, confirm (if pilot GO)
51821–51832. Never reuse 511xx/512xx/513xx/514xx/515xx. Freshness
verified before this prereg: no 51801–51808 / 51821–51832 filename
or mention in evidence/2026-11-01/*.md, and no 5180x/5182x in
scripts seed lists (51711 was found in older Oct files, so the
517 band was abandoned for the clean 518 band). Live control on
non-judged seed 51809 (instrument proof + determinism), never
counted in any judged band.

## Instrument

scripts/multisweep-b-driver.js (haulsize driver shape, POLICY
dispatch added): per loopDay day-start snapshot, every travelTo +
doAction('forage') call, trip-end snapshot on haven landing after
a successful forage, every returnToVillage call (packcomp rule:
live = Game.over false at entry), and per-day multisweep ctx
deltas. The driver NEVER moves the scholar: wrappers count only.
scripts/analyze-multisweep-b.js reuses scripts/analyze-haulsize-b.js
(analyzeSeed + returnValue) so the finished-pack definition is
identical on both arms.

## Primary metric + GO threshold (judge exactly against this — verbatim bar)

PRIMARY = mean finished-pack value on successful-trip days, armed
vs baseline on identical seeds. Operationally: a successful-trip
day is a loopDay with >= 1 successful forage. For such a day, take
the day's FINAL live return (the last returnToVillage with
overAtEntry false and loopDay == that day) and read its finished
kcal (packcomp finished definition: kcalEach > 0 AND foodState NOT
in_shell/unprocessed; lump items contribute 0 to finished). A
successful-trip day with NO live return that day (ended away) is
EXCLUDED from the primary and counted separately
(noReturnTripDays). The band primary is the POOLED mean over all
included successful-trip days in the band. Mean-of-seed-means is
reported as a sensitivity only, never judged.

GO requires armed >= 1.25x baseline AND the cost bar clean
(starvation deaths <= baseline+1, median survival >= 0.8x
baseline).

COST BAR DEFINITIONS (frozen here): starvation deaths = entries
in the driver's deaths array matching /starv|hunger/i on any
string field (shape verified on the control run; if the control
shows a different deaths shape, an amendment BEFORE the pilot
names the corrected matcher — the bars themselves do not move).
Median survival = median daysAlive over the band's seeds
(daysAlive caps at 30 on this horizon).

EDGE CASE, STATED NOW (not decided after seeing results): if the
baseline pooled primary mean is 0, the ratio is undefined and the
primary is NO-GO (1.25x of nothing is not a claim). If the
baseline mean is > 0 but < 100, the ratio still rules — no
absolute-value rescue is added mid-run.

PILOT GO (to confirm): pilot GO as above on 51801–51808. Then
CONFIRM on 12 fresh seeds (51821–51832) under the same rule;
CONFIRM GO requires the same bar (armed >= 1.25x baseline AND
cost bar clean) on the confirm band.

PILOT NO-GO: stop. Killed arms leave no trace beyond the evidence
+ proof. No confirm spend, no re-score against a friendlier
metric (combined pack, daily haul, and multi-sweep share are
secondaries and never overturn a primary miss).

## Secondaries (diagnostic only, never overturning)

FAILED_WORKED_OUT day share, POLICY_ONE_TRIP share (successful
days with exactly 1 success / all successful days — should fall),
multi-sweep day share (successful days with >= 2 successes),
unload count (total unload kcal over live returns), mean daily
haul (mean over loopDays of edibleKcal + shelledKcal from the day
rows), extra-trip days / extra-success days (driver ctx deltas),
noReturnTripDays. Report in-window wall numbers (survival, wave
max, collapses; national / table / wins are not measurable in a
30d pre-seat window and are reported as in-window zeros, not wall
claims).

## Horizon + why

30d, competent, DEPOSITGATE=0 exactly as haulsize, because the
question is haulsize's own next blank on its own substrate: the
comparison must be identical-seed, identical-substrate, or the
1.25x ratio measures substrate drift, not the second outing.
Death-aware horizons (never a fixed 200d) are honored inside the
window: dead villages stop simulating (daysAlive < 30) and the
cost bar (median survival) is the judge of that, not a longer
horizon. A 120d window is NOT run: no new horizon-cut episode
motivates it (1543Z blank list item 12).

## Balanced panel (section 15)

Before/after comparison runs through the balanced panel
(scripts/balance-panel.js) — the panel is the instrument, the
pre-registered threshold above is the judge. Panel registration
for the variant is additive only (one try{} registry line in
scripts/sweep-compare.js, same precedent as leanlink/spearfund;
no existing entry changes behavior). The panel compare .md is
attached to the evidence file. If the panel tool refuses the
input format, that limitation is recorded honestly with the exact
error — no panel result is fabricated. Note the panel's own
compare decision is NOT the judge: the prereg bar above is.

## Sense test (SENSE-TESTING LAW)

At least one armed multi-sweep day's transcript slice (forage +
return lines for the second outing) read for meaning in the
evidence file: does the second outing read as a person going back
out, or as a ledger event? Note anything robotic.

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No metric,
threshold, seed, or classification rule may change mid-run; doubts
go there for the NEXT run. Amendments after the control but
BEFORE the pilot (haulsize v2 precedent) are allowed only for
measurement completeness, never for moving a bar.

## Commit order (this file + skeletons BEFORE any judged sim)

This prereg, scripts/policies/competent-multisweep-b.js,
scripts/multisweep-b-driver.js, scripts/analyze-multisweep-b.js,
scripts/test-multisweep-b.js (pure checks + live-control/det
paths), and the one additive panel-registry line in
scripts/sweep-compare.js are committed FIRST. The pilot
(51801–51808) runs only after that commit lands. The live control
(51809) runs after the prereg commit too — it is instrument proof,
not a judged seed, and its numbers never enter a judged band.
