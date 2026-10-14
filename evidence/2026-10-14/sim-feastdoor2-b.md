# SIM-FEASTDOOR2 — surplus-only feast duty vs r13-only control (loop B, food-economy, sim-findings #187)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-feastdoor2
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH
OPENER). Follow-up to sim-feastdoor-b.md (KILLED AT PILOT), executing that
run's §14 metric-review prescription exactly: test the duty against an
R13-ONLY CONTROL (isolating the duty's marginal effect), with noise-calibrated
hungryDays bounds (r25b rotcal precedent, docs/MEASUREMENT.md).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the first pilot (sim-feastdoor-b.md) proved the surplus-only
  feast duty opens the table's food-deed rung (11/16 deeds, 2 full tables,
  4 duty-attributed end-to-end) but was KILLED AT PILOT per §14: the
  hungryDays guardrail missed (40 vs the hand-set ≤38.5 bound vs a PRISTINE
  control). The run's r13-only diagnostic proved the miss was
  substrate+perturbation, not duty harm: the r13 allowance ALONE drives
  starvation 15→21 / hungryDays 35→48; the duty's MARGINAL effect vs
  r13-only is harm-REDUCING (starvation 21→11, hungry 48→40, national
  7→9, median 92→108d, deeds 13→11, table 4→2). This run isolates that
  marginal effect against the r13-only control, with A/A-noise-calibrated
  bounds instead of hand-set ones.
- **Lever**: scripts/policies/feastdoor.js (FEASTDOOR=1, default OFF;
  requires FEASTSCALE_R13=1; wraps leadfeast/belongfeast). Rebuilt from the
  sim-feastdoor-b.md spec after the kill-protocol deletion: fire ONLY when
  fresh-days > 6 (strictly); spend toward 4; floor NEVER below 4 (spendTarget
  = freshKcal − 4×burn must cover feastPlan cost). All r13 gates kept
  (dusk, haven, one feast/day, armed cadence 7d / unarmed 14d shared via
  _fsLastFeastDay with the allowance, contribution
  recentGives(7)+tributePaid(7)+tendPaid(7) >= 1500, affordability
  have >= cost×1.5, fusion-reactor ceiling, plan.ok). Siege-gate (loop A
  boundary): no lingerer, no gorge night in trailing 7d (predation
  instrument), no raid in trailing 7d — holds counted per cause. #201:
  duty cause line fires only AFTER hostFeast confirms (rep.ok). The duty
  fires BEFORE the allowance's scaleFeast in upkeep, claiming the
  one-feast/day slot (no double-feast; shared cadence displaces allowance
  feasts). Policy-side only; zero src/js changes.
- **CONTROL**: FEASTSCALE_R13=1, FEASTDOOR unset (leadfeast/belongfeast —
  the r13 allowance alone). **ARMED**: FEASTSCALE_R13=1 + FEASTDOOR=1
  (doorlead/doorbelong). Identical seeds both sides.
- **PRIMARY (marginal harm-proxy)**: armed hungryDays <= r13-only ×
  (1+p90rel) — the noise-calibrated bound (§14 direction).
- **GUARDRAILS**: starvation <= r13-only + p90abs (A/A absolute noise);
  food-deeds >= r13-only − 2; table >= r13-only − 1; national >=
  r13-only − 2; no new death mode. Median survival report-only.
- **SECONDARY**: duty feast counts+kcal, siege-gate holds per cause,
  per-seed deed attribution, Standing per avenue, wave reach 1–5, Arc
  reach, table seats, fresh-days distribution, death-cause shares, exiled.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law
  absolute max). Dead villages stop; +10d tail max.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side,
  IDENTICAL seeds control vs armed.
- **A/A calibration** (r25b rotcal precedent): the r13-only substrate on
  two DISJOINT seed sets (A: 11/22/33/44/55/66/77/88 × 2 policies;
  B: 12/23/34/45/56/67/78/89 × 2 policies), 180d. Set A doubles as the
  pilot's r13-only control (identical runs, no extra spend — the bound is
  calibrated on r13-only data alone, no circularity with the armed side);
  set B is the disjoint comparison. Per metric, |d| observations
  per-policy + pooled; p90 per rotcal convention
  (sorted[min(n−1, floor(0.9n))]). One-sided hungryDays multiplier =
  1 + p90rel. The armed side's 16 runs are the only pilot spend beyond
  calibration.
- **Det-gate**: 16/16 bit-identical BOTH sides first (r27 rule;
  scripts/det-gate-feastdoor-20261014.js — control side updated to the
  r13-only substrate). SMOKE=1 honesty gate both sides.
- **Proof**: scripts/test-feastdoor-20261014.js — REAL RED (gate-off
  byte-identical vs parents; no duty fires gate-off) → GREEN (fires only
  on fresh-days>6; 5.9d holds; floor binds; siege holds; no double-feast
  with allowance; armed determinism; inert without FEASTSCALE_R13).

## Calibrated bounds (filled AFTER calibration, BEFORE pilot spend)

A/A: r13-only on set A (11/22/33/44/55/66/77/88 × 2 policies) vs set B
(12/23/34/45/56/67/78/89 × 2 policies), 180d each. Set A reproduces the
first pilot's r13-only diagnostic exactly (starvation 21, hungryDays 48,
deeds 13, table 4, national 7, wave4 11, wave5 4 — deterministic).

| metric | A | B | p90 abs |Δ| | p90 rel |Δ| | GO bound (armed vs r13-only) |
|---|---|---|---|---|---|
| hungryDays | 48 | 34 | 14 | **0.409** | armed ≤ 48 × 1.409 = **67.6** |
| starvation deaths | 21 | 12 | **9** | 0.8 | armed ≤ 21 + 9 = **30** |
| food-deeds | 13 | TBD | — | — | armed ≥ 13 − 2 = **11** |
| table | 4 | 7 | — | — | armed ≥ 4 − 1 = **3** |
| national | 7 | 11 | — | — | armed ≥ 7 − 2 = **5** |
| death modes | — | — | — | — | no new mode |

Per-group |Δ| (lead/belong/pooled): hungryDays [9, 5, 14]; starvation
[8, 1, 9]; table [1, 2, 3]. The seed-set swing on hungryDays (48 vs 34,
rel 0.409) is the perturbation-sensitivity the first pilot's metric
review predicted — the hand-set 1.1× was ~4× tighter than the suite's
own noise. Starvation swings 21→12 across seed sets: the A/A absolute
noise (9) is the honest bound, not a hand-set +2.

## Proof results

scripts/test-feastdoor-20261014.js — REAL RED → GREEN, rebuilt layer
against the first pilot's spec (the kill-protocol deletion was clean;
the spec in evidence/sim-feastdoor-b.md + the kept instruments sufficed
for a byte-faithful reconstruction — proof green on first invocation).

RED (gates off): R1 gate-off byte-identical — doorlead == leadfeast and
doorbelong == belongfeast per-day hashes, 40d x2 seeds, IDENTICAL (the
predation instrument's read-only wraps add no trajectory delta). R2: no
duty fires gate-off on the 6.25d fixture; pantry untouched; no duty
cause line.

GREEN (FEASTDOOR=1 + FEASTSCALE_R13=1), 23/23 checks ×2 invocations:
G1 duty fires on the 6.25d fixture — 5,000 kcal real pantry draw, engine
🍖 FEAST beat, then the duty cause line ("The shelves groaned — ~6 days
of fresh on hand, and the rot was already circling. We ate the mountain
tonight, before it ate itself.") narrated AFTER the verb confirms
(beat@0 cause@2 — the #201 fix), fresh-days 6.25→6.04 (drawdown
direction, floor respected). G2: 5.9d holds (fires ONLY on >6). G3: the
floor is LIVE — on a small-burn fixture (2000 kcal/d) the duty refuses
when the honest feast would breach 4d (spendTarget 4500 < cost 4800)
and fires when the surplus covers it, landing at 4.00d (toward 4, never
below). G4: lingerer/raid-7d/gorge-7d fixtures all hold the duty off
(holds counted per cause). G5: contribution <1500 holds off; >=1500
fires. G6: armed determinism — identical fixture twice, identical
outcome. G7: the duty feast carries the armed prog.feastSurge into
grantFeastBuff (buff granted, arming NOT spent by the feast); a real
combat use (inCombat stubbed true) marks feastSurgeUsed. G8:
FEASTSCALE_R13 unset mid-run → duty inert (rides the r13 machinery). G9:
the duty claims the one-feast/day slot — s.feastDay set, the r13
allowance does not double-fire (fsFeasts=0).

## Det-gate

16/16 bit-identical CONTROL (r13-only substrate, FEASTSCALE_R13=1,
FEASTDOOR unset — the det-gate's control registry was updated to
leadfeast/belongfeast per this run's prescription), 16/16 bit-identical
ARMED (duty) — no waiver needed. SMOKE=1 green both sides (policies
drive; the duty fired on the 6.25d fixture, fdFeasts=1).

## A/A calibration

The r13-only substrate on two DISJOINT seed sets (A:
11/22/33/44/55/66/77/88 × 2 policies; B: 12/23/34/45/56/67/78/89 × 2
policies), 180d. scripts/aa-calibrate-feastdoor-20261014.js; |d|
observations per-policy (lead/belong) + pooled (16); p90 per rotcal
convention (sorted[min(n−1, floor(0.9n))]).

- hungryDays: A=48, B=34; per-group |d| = [9, 5, 14]; p90 rel |d| =
  **0.409** → one-sided bound r13-only × 1.409.
- starvation: A=21, B=12; per-group |d| = [8, 1, 9]; p90 abs |d| = **9**
  → bound r13-only + 9.
- national: A=7, B=11; p90 abs |d| = 4.
- table: A=4, B=7; per-group |d| = [1, 2, 3].

The seed-set swing on hungryDays (48 vs 34) confirms the first pilot's
metric review: hungryDays is perturbation-sensitive, and the hand-set
1.1× was ~4× tighter than the suite's own noise. Starvation swings
21→12 across seed sets — the A/A absolute noise (9) is the honest
bound, not a hand-set +2. Set A reproduced the first pilot's r13-only
diagnostic EXACTLY (21/48/13/4/7, wave4 11, wave5 4, maxArc 4) —
deterministic, and set A doubles as this pilot's control.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

120d armed runs, doorlead seeds 22 (4 duty feasts, 11,204 kcal, 6 gate
holds: linger 2 / gorge 2 / raid 2) and 55 (5 duty feasts, 10,630 kcal,
2 gate holds: raid 2). The beats read as a village deciding — the
engine beat gives the WHAT, the duty's cause line (post-verb, past
tense) the WHY:

- "[d27] 🍖 FEAST 📺 — Casey opens the pantry wide: 5× Foraged food, 1×
  Snared meat. Zuri, Walt, Carlos, Victor and 1 more eat until the fire
  burns low. Somebody laughs so hard they cry. For one evening, nobody
  is surviving — they're just together. (−2,740 kcal from the pantry)"
  → "🍖 The shelves groaned — ~52 days of fresh on hand, and the rot was
  already circling. We ate the mountain tonight, before it ate itself."
  → "🍖 FEASTED ×2.03 until tomorrow's dawn... Strikes and abilities hit
  with the feast behind them."

Named villagers open feasts (Casey, Violet); named attendees; the
fresh-days number varies honestly per firing (~52, ~57, ~60 / ~38, ~45);
the menus are honest (foraged food, snared meat, trial feast). The r13
allowance fills the days the duty leaves — its feasts carry the engine
beat but NO duty line (correct: d41 on both seeds is allowance-only, 7d
after a duty feast — the shared cadence working as designed).

**PASS** — with the pre-existing blank re-noted: the devotion channeling
line ("💛 You hold Carpenter's square... The feast was the weapon.")
fires VERBATIM every day d15–d55+ — the finding #64 repetition class
(competent.js channelDevotion, not this layer's doing). Filed, not
chased.

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Control = r13-only
substrate (FEASTSCALE_R13=1, FEASTDOOR unset); armed = duty+r13.
Det-gate 16/16 both sides; SMOKE green both sides.

| metric | r13-only control | armed (duty+r13) | pre-reg bound | verdict |
|---|---|---|---|---|
| hungryDays (**PRIMARY**) | 48 | **40** | ≤ 67.6 | **GO** |
| starvation deaths | 21 | **11** | ≤ 30 | **GO** |
| food-deed rung | 13/16 | **11/16** | ≥ 11 | **GO** (exact) |
| duty-attributed end-to-end | 0/16 | 4/16 | — | mechanism live |
| table | 4/16 | **2/16** | ≥ 3 | **MISS → NO-GO** |
| wins | 0/16 | 0/16 | — | — |
| national | 7/16 | **9/16** | ≥ 5 | **GO** |
| death modes | 13 observed (control) | 10 observed, no new | no new | **GO** |
| exiled | 0 | 0 | unchanged | ✓ |
| median survival | 92d | 108d | report-only | +16d |
| max wave reach | 5 | 5 | — | — |
| wave-4 reach | 11/16 | 13/16 | — | — |
| wave-5 unlocks | 4/16 | 7/16 | — | — |
| max Arc | 4 | 4 | — | — |
| duty feasts | 0 | 42 (109.7k kcal) | mechanism fires | ✓ |
| siege-gate holds | 0 | 41 (linger 3, gorge 2, raid 36) | gate live | ✓ |
| standing median | 134 (w0/d0/p120) | 187 (w0/d0/p120) | — | — |
| standing max | 487 | 322 | — | — |

Per-seed attribution (armed): 4 duty-attributed end-to-end (lead s22,
belo s11, belo s44, belo s66 — surge-use ordered at/after the first
duty feast); 7 more fired the rung via the r13 allowance (surge-use
ordered earlier — including BOTH full table seats: lead s55, belo s22);
5 never fired the rung. The duty is the marginal opener on drowning
pantries; the allowance remains the broader opener.

**Verdict: KILLED AT PILOT per §14.** The PRIMARY passed (40 ≤ 67.6),
starvation passed (11 ≤ 30), deeds passed exactly (11 ≥ 11), national
passed (9 ≥ 5), death modes unchanged — but the table guardrail missed:
2 < 3. A GO met with a guardrail breached is NO-GO. The duty's marginal
effect vs its own substrate costs 2 table seats (4→2) — the displacement
mechanism (safer scheduler, slightly less aggressive on deeds) now has a
calibrated price tag. See Metric review.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| r13-only control | 7/16 | 4/16 | 0/16 | 11/16 | 4/16 | 92d | 180d |
| armed (duty+r13) | 9/16 | 2/16 | 0/16 | 13/16 | 7/16 | 108d | 180d |

Exiled: 0 both sides.

## Death-cause shares

r13-only control: combat 62, monster 20, villager combat 18, sickness
19, starvation 21, wound 14, contest 4, lockjaw 2, Choir Toad 1,
dehydration 1, alien 1, ambush 1, the expedition 1.
Armed: combat 96, monster 35, sickness 21, wound 15, villager combat 12,
starvation 11, contest 4, ambush 1, expedition 1, the expedition 1.
Same modes — "ambush" is a monster/combat instance, "the expedition" an
expedition instance (the first pilot made the same call). No new death
mode. Villages die of violence, not hunger, on both sides; the armed
side starves LESS (21→11).

## Village assessment (plain words)

Sixteen villages on each side, identical seeds — the only difference is
the surplus-only duty riding the r13 allowance. The armed story is the
same as the first pilot's, now measured against the right control: the
pantry fills past 6 fresh-days, the village eats the mountain — a major
feast every week or two, the shelves groaning, Casey or Violet opening
the pantry wide — and the devotion lane arms, the surge gets used in
real fights, the food-deed rung fills. On four seeds the rung fired
through the duty's own feasts; on seven more the r13 allowance got
there first. Two villages took the FULL table seat (both allowance-
opened), where the r13 control took four.

The duty fired 42 feasts across 16 runs (109.7k kcal) and never once
touched the 4-day buffer — the floor invariant held on every firing
(proven in the proof, honored in the sims). The siege-gate held 41
times (36 of them raid-7d holds — the villages are under siege often
enough that the gate earns its keep). Starvation deaths fell 21→11.
The villages lived longer on average (median 108d vs 92d) and reached
further (wave-4 13 vs 11, wave-5 7 vs 4, national 9 vs 7).

But the villages opened FEWER tables (2 vs 4). The mechanism insight
from the first pilot stands with a calibrated price: the duty
DISPLACES allowance feasts via the shared cadence tracker — it replaces
the allowance's riskiest feasts with surplus-only ones, and in doing so
costs ~1–2 deed/table opens per 16 runs. The r13 allowance, measured
alone, is genuinely harmful (starvation 21, hungryDays 48); the duty
halves that harm while keeping most — but not all — of the openings.

Who thrived: the long-lived villages (lead s55 180d full table,
belo s22 108d full table) — both allowance-opened, both plenty-driven
standing (w0/d0/p120 median). Who died: wave-2/4 short runs (lead s33
32d, belo s88 41d) — violence and wounds, same as the control; the duty
fired 0 feasts on those seeds because the pantry never drowned. The
duty is a long-village mechanism: it only matters where the pantry
overflows.

## Blanks filled / documented

- **REBUILT, MEASURED, KILLED AT PILOT**: the feastdoor policy —
  scripts/policies/feastdoor.js (FEASTDOOR=1, default OFF, requires
  FEASTSCALE_R13=1; reconstructed byte-faithfully from the
  sim-feastdoor-b.md spec after the kill-protocol deletion; DELETED
  again per kill protocol — the file is removed, not committed),
  proof scripts/test-feastdoor-20261014.js (REAL RED→GREEN 23/23 ×2,
  kept as instrument with INFO-SKIP degradation),
  sweep scripts/measure-feastdoor-20261014.js (kept),
  r13-only diagnostic scripts/measure-feastdoor-r13only-20261014.js
  (kept), A/A calibrator scripts/aa-calibrate-feastdoor-20261014.js
  (kept), sense scripts/sense-feastdoor-20261014.js (kept),
  det-gate scripts/det-gate-feastdoor-20261014.js (control side updated
  to the r13-only substrate; kept). Zero src/js changes (policy-side
  only).
- **FILLED (instrument)**: the r13-only control prescription executed —
  the duty's marginal effect is now isolated and calibrated:
  starvation 21→11, hungry 48→40, national 7→9, median 92→108d, deeds
  13→11, table 4→2; A/A noise published (hungryDays p90rel 0.409,
  starvation p90abs 9, table per-group |d| [1,2,3]).
- **DOCUMENTED** (sim-findings.md): (a) the duty's calibrated price —
  displacement costs ~1–2 deed/table opens per 16 runs (4→2 seats); a
  future arm needs a mechanism that keeps the allowance's openings
  while shedding its pantry-blind harm (e.g. a pantry-state gate on
  the allowance itself, or a duty that fires only when the allowance
  wouldn't); (b) the r13 allowance's own harm profile, confirmed
  deterministic (21 starvation, 48 hungryDays, identical across runs);
  (c) the devotion channeling line repeats verbatim daily (finding
  #64 class, competent.js — filed, not chased).

## Metric review (§14)

1. **The table guardrail fired, and §14 binds — KILL stands.** 2 < 3 is
   real (identical seeds, det-gated), lever-caused, and misses the
   pre-registered bound. This is not re-scoring: the primary passed
   (40 ≤ 67.6) and four guardrails held (starvation 11 ≤ 30, deeds
   11 ≥ 11, national 9 ≥ 5, no new death mode), but the table
   guardrail as pre-registered missed.
2. **The miss is the displacement mechanism's price, not a bug.** The
   duty shares _fsLastFeastDay with the allowance — when it fires on
   deep surplus it displaces an allowance feast that would have fired
   on contribution alone. The allowance's feasts open more deeds
   (13 vs 11) and tables (4 vs 2) because it fires on thinner pantries
   too; the duty is a safer scheduler, slightly less aggressive. Both
   table seats on the armed side were allowance-opened; the duty
   contributed 4 end-to-end attributions but no seats.
3. **The bound did its job.** The coordinator's −1 tolerance was the
   stress test for exactly this trade: the duty may not cost more
   than one seat vs its substrate. It cost two. The calibration was
   the other half of the story — hungryDays p90rel 0.409 and starvation
   p90abs 9 are now published noise floors for every future feast
   arm; the hand-set 1.1× era is over.
4. **Metric doubt (filed for the NEXT run, not this one):** the table
   guardrail measures openings, not harm — against a harm-reducing
   duty it acts as a price ceiling, which is what the coordinator
   intended, but the price (2 seats) vs the gain (−10 starvation,
   −8 hungry, +2 national, +16d median) is a genuine design trade
   Steve may want to price differently. Proposed for the next run:
   keep the table guardrail but pair it with a harm-reduction primary
   (starvation ≤ r13-only − 5), so the trade is measured on both
   sides. Not applied here — §14 forbids mid-run re-scoring.
5. **The primary is robust.** hungryDays 40 ≤ 67.6 with real margin —
   the noise-calibrated bound vindicates the first pilot's metric
   review: the hand-set 38.5 would have killed this run too (40 >
   38.5), and it would have been just as wrong. The duty is
   harm-reducing against its substrate on every harm metric; it fails
   only the openings price.

## Convergence state

food-economy: **killed-at-pilot** (feastdoor vs r13-only). The surplus-
only duty is proven harm-reducing against its substrate (starvation
21→11, hungry 48→40, national 7→9, median 92→108d) with calibrated
noise bounds (hungryDays p90rel 0.409, starvation p90abs 9), but it
costs deed/table openings (13→11, 4→2) via the displacement mechanism
and missed the pre-registered table guardrail (2 < 3) — §14 binds.
sim-findings #187 stays OPEN: the feast-as-door mechanism is triply
proven; the remaining work is a mechanism that keeps the allowance's
openings while shedding its pantry-blind harm (a pantry-state gate on
the allowance, or a duty that fires only when the allowance wouldn't),
with the table guardrail kept as the price ceiling.
