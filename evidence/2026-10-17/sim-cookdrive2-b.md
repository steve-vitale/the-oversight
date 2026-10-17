# sim-cookdrive2-b — cook-drive duty-cadence lever (2026-10-17, loop B, food-economy axis)

Run: fleshout-b-20261017T1235Z, arm sim-cookdrive2-b.
Finding #462 named next (read as sim-findings line #462): the cook smoke drive
is ELIGIBILITY/DUTY-BOUND, NOT BUDGET-BOUND (smokes 0.5–2k kcal/day vs a 4000
kcal/resolution x ~3/day = 12k/day budget). "A future smoking lever should tune
the cook drive itself (duty cadence, reserve size), not the scholar's diet."
Constraints honored: the 250/person dinner reserve untouched (killed twice:
dinreserve 2026-10-13, dinreserve2 2026-10-14); the <=2 spoilDay window
untouched (cookwin-b killed 2026-10-17: draw-horizon theft, starvation);
the racks-full guard untouched; the evening pass not added (triage killed);
loop A's regions untouched (game.js tbEnd ledger, standing.js, policies/takeseat.js
— my only game.js touch was the resolveOneAssignment 'cook' branch, ~L6533-6591,
non-overlapping).

## Lever
src/js/game.js, duty-time cook drive (resolveOneAssignment 'cook'): under env
gate COOKDRIVE2_B=1 (default OFF; runtime process.env read, FOODLEVER_R5
pattern), the smoke pass runs ONCE per day (first cook-duty resolution) instead
of on every cook resolution (~3x/day per the code comment). The 2nd/3rd
same-day firings re-scan a pool whose 2-night reserve was already satisfied;
their only unique catch is intra-day short-shelf arrivals. Implementation:
`v._cookDrive2Day` flag; when the flag already equals today, `eligible.length
= 0` (smoke pass skipped, but cooking/credit/trust-beat unchanged).

## Pre-registration (binding, MEASUREMENT.md §§9-12, 14 — written BEFORE sims)
- PRIMARY: paired-median fresh waste-rate (WR instrument:
  pantryRotKcal / (pantryStartKcal + pantryInKcal)) armed vs control.
  GO: paired median of per-pair ratios <= 0.85.
- STARVATION VETO (cookwin-b lesson, metric review #1): armed starvation
  deaths must not exceed control. A waste-rate win that starves villages is
  NO-GO.
- MECHANISM-ENGAGEMENT (vacuous-pass protection): armed-side skipped
  same-day smoke passes (smokeSkips) > 0. If the mechanism never engages,
  the run is a KILL (invisible effect), not a GO.
- GUARDRAILS: national >= control-2; matched median survival >=
  control-10d; no new death mode; no crash; no laundering (spoiled never
  smoked — proof fixture b).
- FRESH-SINK ACCOUNTING (finding #463): the lever is a pure cadence change —
  it does not redirect the scholar's fresh-first villageMeal, nor any fresh
  pool. No fresh is redirected; the coverage gate (smoke delta >= 0.5x
  redirected kcal) is vacuous here. Documented: the knob draws from the
  drive's own eligible pool (spoilDay<=day+2 fresh beyond the 250/person
  reserve); the sink (cook-smoked kcal) does not move — only the timing of
  the pass changes.
- DET-GATE: gate-off trajectories byte-identical to the pristine baseline
  captured pre-edit (scripts/cookdrive2-det-baseline-20261017.json, 8 combos
  4801-4804 x {leadfeast,belongfeast}, 40d, all self-deterministic on pristine).
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 8 fresh 4801-4808 (coordinator banned-list checked — clean).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1 substrate; SEATDRIVE=0
  EXPLICIT, pre-seat courtship, food-economy). Own in-sweep control, identical
  seeds.
- PROOF: scripts/test-cookdrive2-b.js — (a) consolidation ONLY under
  COOKDRIVE2_B=1 (RED-verified on pristine: gate-on fixture failed pre-edit),
  (b) spoiled stacks still excluded gate-on (no laundering), (c) the
  once-per-day flag resets on a new day, (d) det-gate gate-off == pristine.

## Proof results (scripts/test-cookdrive2-b.js — run BEFORE any sims)
- RED (pristine, pre-edit): the gate-on fixture failed as required —
  the second same-day cook resolution SMOKED (consolidation code absent,
  COOKDRIVE2_B=1 had no effect). Genuine RED.
- GREEN (post-edit): gate-on 16/16 (first cook smokes, second same-day cook
  SKIPS, spoiled never smoked, new day's first cook smokes again); gate-off
  14/14 (both same-day cooks smoke — pristine behavior); det-gate 8/8
  byte-identical to the pristine baseline. Proof is a real RED→GREEN.
- check.js --quick: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (pre-existing sprite-asset failures,
  documented in the cookwin evidence; never reads the cook drive).

## Sweep results (32-run pilot STARTED, KILLED at 3/32 on mechanism-engagement)
Seeds 4801-4808 x {leadfeast,belongfeast} x {control,armed}, 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0, own in-sweep control. SMOKE gate green (drive
counter live, S0 recorded, conservation |rel|<=3% all 4 combos).

| run | days | end | waste-rate | cookRes | fires | skips | national | wave | starv |
|---|---|---|---|---|---|---|---|---|---|
| control leadfeast s4801 | 41 | village-lost | 0.00000 | 14 | 14 | 0 | 0 | 2 | 4 |
| armed leadfeast s4801 | 41 | village-lost | 0.00000 | 14 | 14 | 0 | 0 | 2 | 4 |
| control leadfeast s4802 | 182 | survived | 0.47761 | 163 | 163 | 0 | 1 | 3 | 0 |

MECHANISM-ENGAGEMENT: **0 skipped same-day smoke passes across 191 cook
resolutions** (177 control + 14 armed). The lever never engaged. Per the
pre-registered kill condition, the run is KILLED (invisible effect), not
scored on the primary. The sweep was stopped at 3/32; the remaining 29 runs
were not spent.

## Why the mechanism never engages (the actual cadence, measured)
The code comment says "the cook resolves 3x/day". The MEASURED cadence is
~0.3–0.9 cook resolutions per day (14/41d, 163/182d). The policy
(competent.js "STAFF THE SMOKE RACKS") staffs a cook per part ONLY when
freshKcal > 1500 (about-to-rot fresh, spoilDay-day<=3). After the first
cook of the day smokes the eligible surplus, freshKcal drops below the
1500 gate — so later parts don't staff a cook. The system is self-limiting:
the "3x/day" is the theoretical maximum if a cook were staffed each part;
in practice the drive already fires at most once per day.

Consolidating "3x/day → 1x/day" is therefore a NO-OP on the actual
substrate. There are no 2nd/3rd same-day firings to skip. The duty-cadence
knob, as framed in finding #462 ("duty cadence" as a binding constraint
alongside the eligible-surplus definition), was a misdiagnosis: the
~3/day figure is the per-resolution budget arithmetic (4000 x 3 = 12k/day),
not the measured firing rate. The real binding constraints are the
eligible-surplus definition (spoilDay<=day+2 beyond the 250/person reserve —
window widening killed, reserve cuts killed twice) and the racks-full guard
(18–406 binds/run in the rackschannel census; lifting it converts at only
0.46x).

A same-day second cook is not impossible in principle (the policy CAN
staff per part), but the freshKcal gate makes it rare-to-never when the
drive is working: the drive's own smoking removes the staffing trigger.
The cadence knob has no purchase.

## Wall numbers (partial — 3 runs, pilot killed)
| side | national | table | wins | w4 | w5 | median | max | starv |
|---|---|---|---|---|---|---|---|---|
| control (n=2) | 1/2 | — | 0/2 | 0/2 | 0/2 | — | 182d | 4 |
| armed (n=1) | 0/1 | — | 0/1 | 0/1 | 0/1 | — | 41d | 4 |
The s4801 pair (both sides) lost the village at d41 with 4 starvation deaths
each — identical trajectories (the lever never engaged, so armed==control
is expected, not a finding). No wall conclusions drawn from n=3.

## Village assessment (plain words)
Three villages, one twinned pair. The s4801 twins (leadfeast) starved
identically — 4 STARVATION deaths each, village lost at day 41, waste-rate
0.00000 both sides (nothing rotted because nothing was ever stockpiled;
the village ate hand-to-mouth and then died). The lever never fired, so the
armed twin is a byte-identical rerun of its control, not a treatment. The
s4802 control (leadfeast) survived the full 182 days, reached national,
wave 3, zero starvation — a competent village on the pre-seat substrate.
The cook worked the racks 163 times across those 182 days (~0.9/day),
each time the first and only cook of the day. Nothing about the drive
reads as broken — it simply doesn't fire 3x/day.

## Sense-testing (SENSE-TESTING LAW — read, not counted)
Beats were captured on the first armed run per policy (scripts instrument),
but the sweep was killed at 3/32 before the belongfeast-armed beat capture
ran. The leadfeast-armed s4801 beats (evidence/2026-10-17/cookdrive2-beats/)
contain the standard cook-duty lines ("cooked for the haven — meals
stretched", "worked the smoke racks too"). The consolidation lever adds no
new beats (it only skips the smoke pass silently on 2nd/3rd firings, which
never occur). No sense verdict is drawn — the lever never engaged, so there
is no behavior to judge. The proof fixtures confirm the skip is silent
(no beat, no trust-bump change — the trust bump 'kept the haven fed' still
fires, keeping the control/armed comparison clean on trust).

## Blanks filled / documented
- **FILLED (finding)**: the cook smoke drive's ACTUAL firing cadence is
  ~0.3–0.9/day, not ~3x/day. The "3x/day" in the game.js comment (and in
  finding #462's "~3/day" budget arithmetic) is the theoretical maximum
  (per-part staffing), not the measured rate. The policy's freshKcal>1500
  staffing gate + the drive's own smoking (which drops freshKcal below the
  gate) make the drive self-limiting to ~1/day. A "consolidate to 1x/day"
  lever is a no-op.
- **FILLED (finding)**: finding #462's "duty cadence" binding-constraint
  diagnosis was wrong. The drive is not cadence-bound (the cadence is
  already minimal); it is eligibility-bound (the <=2-day window beyond the
  250/person reserve) and guard-bound (racks-full). Both of those knobs
  have been killed (window, reserve x2, guard-lift via diet channel).
  The cook-drive tuning program on this axis is exhausted — the remaining
  rot is post-cook arrivals, death-tail, and trajectory noise (the triage
  lesson, #99).
- **DOCUMENTED (instrument)**: the drive counter
  (attachDriveCounter in scripts/sweep-cookdrive2-b.js) wraps
  resolveOneAssignment and counts cook resolutions vs same-day smoke-pass
  skips. Reusable for any future drive-cadence question. The proof
  (scripts/test-cookdrive2-b.js) is a real RED→GREEN for the
  once-per-day consolidation; the game-code layer was reverted zero-trace
  per the kill protocol.
- **DOCUMENTED (method)**: the sweep was killed at 3/32 on the
  pre-registered mechanism-engagement condition (skips > 0). The 29
  unspent runs are not a data gap — the engagement failure is structural
  (the staffing gate), not seed-dependent.

## Metric review (§14 — every evidence file carries this section)
1. The PRIMARY (paired-median waste-rate <= 0.85x) was never scored — the
   mechanism-engagement kill fired first. This is the correct ordering:
   scoring a primary on a non-engaged mechanism would be a vacuous pass/fail.
   The pre-registered engagement condition worked as designed.
2. The STARVATION VETO was not triggered (armed starvation == control on the
   one twinned pair, 4==4 — identical trajectories, lever never engaged).
3. The pilot seed count (8 seeds) was more than needed for an engagement
   kill — the structural argument (staffing gate self-limits to ~1/day)
   plus 191 resolutions with 0 skips is conclusive at n=3. Future
   engagement-kill pilots on this axis can stop at the first long run
   (s4802: 163 resolutions, 0 skips) rather than running the full seed set.
4. The waste-rate instrument's 0.00000 on the s4801 pair (village starved
   at d41, nothing stockpiled) is a reminder that waste-rate is undefined
   as a "goodness" measure on collapse trajectories — the cookwin-b metric
   review (starvation veto) already covers this, and it held here.

## Disposition
**NO-GO — KILLED at pilot on mechanism-engagement (0/191).** The
COOKDRIVE2_B game-code layer is reverted zero-trace (src/js/game.js ==
HEAD). Instruments kept: scripts/test-cookdrive2-b.js (RED→GREEN proof),
scripts/sweep-cookdrive2-b.js (pilot sweep, engagement counter),
scripts/cookdrive2-det-baseline-20261017.json (pristine 40d det baseline),
evidence/2026-10-17/cookdrive2-sweep.log (partial, 3/32),
evidence/2026-10-17/perseed-cookdrive2/ (3 per-seed JSONs),
evidence/2026-10-17/cookdrive2-beats/ (leadfeast-armed s4801 beats).
No game-code changes land. The cook-drive tuning program (cadence, reserve,
window, guard, evening pass) is exhausted on this axis.
