# SIM-ALLOWANCEGATE — pantry-state gate on the r13 feast allowance (loop B, food-economy, sim-findings #187)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-allowancegate
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH
OPENER). The "separately" half of the feastdoor next-run prescription: gate
the r13 allowance's own pantry-blind feasts on pantry STATE.

## The lever

scripts/policies/feastscale.js `scaleFeast` gains an opt-in pantry-state gate
(FEASTGATE_R13=1, default OFF; requires FEASTSCALE_R13=1 — the gate rides the
r13 machinery). The r13-only diagnostic measured the allowance ALONE as
genuinely harmful (starvation 15→21, hungryDays 35→48, median 151→92d): it
fires on the contribution rule (recentGives(7)+tributePaid(7)+tendPaid(7) >=
1500) with no pantry-state gate beyond the engine's 1.5× buffer. A 1.5×-of-cost
buffer is not a pantry-state gate — it doesn't know how many fresh-days the
village has, and a 7d/14d cadence of cost-blind feasts spends the floor.

DESIGN CALL (documented — Steve can overrule): the feast may only spend
SURPLUS above the game's own 4-day fresh floor (Game.pantryFreshDays — the
same floor prodThrottle uses, and the same floor the killed feastdoor duty
proved live): spendTarget = (freshDays − 4) × burn; hold when plan.cost would
push fresh-days below 4. The floor never moves. Gate on pantry STATE, never
on contribution — the contribution rule is untouched (no re-tuning, per the
brief). Held feasts are not feasts: the cadence tracker (_fsLastFeastDay) is
left alone, so the next dusk may re-test. Conservative by design: the engine's
pantryDraw draws fresh-first (spoilDay-ascending sort, verified in game.js),
so the whole plan.cost counts against fresh — over-refusal is the safe
direction for a harm guard. Held feasts count ctx.fsGateHeld (per-hold).
Policy-side only; zero src/js changes.

Kill protocol: this gate is an addition to feastscale.js, not a separate layer
file. If the arm is KILLED AT PILOT, the gate hunk is reverted (gate-off =
HEAD-pristine, proven by the proof's R1) and the revert committed; proof,
sweep, sense, det-gate, and evidence stay committed.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written AFTER A/A calibration, BEFORE armed seeds)

- **Question**: the r13 allowance (FEASTSCALE_R13=1), measured alone for the
  first time, is genuinely harmful: starvation 15→21, hungryDays 35→48,
  median 151→92d vs pristine control. Its feasts fire on contribution ≥1500
  with no pantry-state gate beyond the 1.5× buffer. Can a pantry-state gate —
  fire only when the honest feast fits inside the surplus above the 4-day
  fresh floor — remove the harm while keeping the deed-opening the allowance
  provides (r13-only: 13/16 deeds, 4/16 tables)?
- **Lever**: scripts/policies/feastscale.js + pantrySurplusOk gate
  (FEASTGATE_R13=1, default OFF; requires FEASTSCALE_R13=1). All r13 gates
  kept (dusk, haven, one feast/day, armed cadence 7d / unarmed 14d via
  _fsLastFeastDay, contribution ≥1500, affordability have ≥ cost×1.5,
  fusion-reactor ceiling, plan.ok). No src/js changes.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law
  absolute max). Dead villages stop; +10d tail max.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side,
  IDENTICAL seeds control vs armed. BOTH sides run FEASTSCALE_R13=1
  (leadfeast/belongfeast). Control: FEASTGATE_R13 unset. Armed:
  FEASTGATE_R13=1.
- **A/A calibration** (r25b rotcal precedent): FEASTSCALE_R13=1 control on
  two disjoint 16-run seed samples; p90 |d| relative deltas set the
  guardrail widths below.
- **Det-gate**: 16/16 bit-identical both sides first (r27 rule;
  scripts/det-gate-allowancegate-20261014.js). SMOKE=1 honesty gate both
  sides (unwrap + live drive + gate-contrast fixtures: control FIRES /
  armed HOLDS on 3.9d; both fire on 6.2d).
- **Proof**: scripts/test-allowancegate-20261014.js — REAL RED (gate-off
  byte-identical vs HEAD-pristine parents; allowance fires gate-off on the
  3.9d fixture) → GREEN (fires on 6.2d, holds on 3.9d, floor binds on a
  small-burn village, armed determinism, no double-feast, gate inert without
  FEASTSCALE_R13, floor ≥4 after every feast in a 120d armed run).
- **PRIMARY**: armed starvation ≤ control − 4.
- **GUARDRAILS**: hungryDays ≤ control × 0.9; food-deeds ≥ control − 2;
  table ≥ control − 1; national ≥ control − 2; no new death mode. Median
  report-only.
- **SECONDARY**: allowance feast counts (fsFeasts, fsArmedFeasts), gate holds
  (fsGateHeld), per-seed deed attribution (feastSurgeUsed day, table day,
  seat), Standing per avenue, wave reach 1–5, Arc reach, table seats,
  fresh-days trajectory, death-cause shares, exiled.
- **Calibration result** (r25b rotcal precedent — FEASTSCALE_R13=1 control on
  two disjoint 16-run samples; seeds 11/22/33/44/55/66/77/88 vs
  101/202/303/404/505/606/707/808 × leadcourt/belongseek, 180d death-aware):
  national 7|8 (|d|=1, rel 0.12); table 4|8 (|d|=4, rel 0.50); foodDeeds
  13|16 (|d|=3, rel 0.19); starveDeaths 21|7 (|d|=14, rel 0.67); hungryDays
  48|37 (|d|=11, rel 0.23); medianSurvival 92|131 (rel 0.30); fsFeasts
  107|169 (rel 0.37); wins 0|0; exiled 0|0. Sample A exactly reproduces the
  feastdoor r13-only diagnostic (21/48/92/7/4) — the substrate is stable.
  **Reading**: every harm-proxy metric is seed-composition-noisy (starvation
  rel 0.67, table rel 0.50) — which is why the pilot is a PAIRED
  identical-seed comparison (composition noise cancels; only trajectory
  perturbation remains). The GO bounds below are the brief's directional
  prescription, kept honest by the paired design; they are not tightened to
  the calibration widths because the comparison is within-seed, not
  across-composition.

## Proof results

scripts/test-allowancegate-20261014.js — REAL RED → GREEN.
RED (FEASTSCALE_R13=1, gate off): R1 gate-off byte-identical — modified
feastscale == HEAD-pristine feastscale per-day hashes, 40d ×2 seeds,
IDENTICAL (the gate adds zero trajectory delta when off). R2: allowance
fires gate-off on the 3.9d fixture (freshDays=3.96, pantry 9500→4500 —
the un-gated allowance drops the fixture to 1.9 fresh-days; the harm
mechanism in miniature).
GREEN (FEASTSCALE_R13=1 + FEASTGATE_R13=1): G1 fires on the 6.2d fixture
(cost 4800, spendTarget 5280 — freshDays 6.25→4.17, drawdown direction,
floor respected). G2 holds on the 3.9d fixture (no feast, pantry untouched,
fsGateHeld=1). G3 the floor binds on a small-burn village (4.9d: 2160 <
4800 → hold; 6.5d: surplus covers → fires, lands ≥4). G4 armed determinism
(identical fixture twice → identical outcome). G5 no double-feast (the
one-feast/day slot is claimed). G6 gate inert without FEASTSCALE_R13 (the
gate sits textually after scaleFeast's layer guard). G7: 120d armed run —
7 allowance feasts, pantryFreshDays() ≥ 4 after EVERY one (min 7.47).
GREEN 22/22 on two consecutive invocations.

Det-gate: 16/16 bit-identical CONTROL, 16/16 bit-identical ARMED
(scripts/det-gate-allowancegate-20261014.js) — no waiver needed.
SMOKE=1: green both sides (unwrap + live drive + gate-contrast fixtures:
control FIRES / armed HOLDS on 3.9d; both fire on 6.2d).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 120d transcripts (FEASTSCALE_R13=1 + FEASTGATE_R13=1;
scripts/sense-allowancegate-20261014.js).

**leadfeast seed 22 (survived 120d):** 13 allowance feasts, 0 gate holds.
Every feast fired with hungryStreak 0 and deep fresh-days — d27: 52.3→49.8,
d34: 56.4→53.5, d48: 72.4→69.3, d80: 5.8→4.9, d102: 7.1→6.2. The d80 feast
is the gate visible at the low end: fires on 5.8d of honest surplus, lands
at 4.9 — the floor invariant working in the wild. The beats read as a
village deciding: "🍖 FEAST 📺 — Casey opens the pantry wide: 5× Foraged
food, 1× Snared meat. Zuri, Walt, Carlos, Victor and 1 more eat until the
fire burns low. Somebody laughs so hard they cry. For one evening, nobody
is surviving — they're just together." Named villagers open and attend;
the fresh-days number varies honestly per firing. Critically: the d1–d20
STARVING spiral ("⚠ STARVING: health and energy falling. The spiral has
started.") saw ZERO feasts — the allowance waited until the pantry filled
(d27, 52 fresh-days) before opening the fire. Surplus decisions, not blind
spending.

**belongseek seed 66 (village-lost d53):** 3 feasts, 2 gate holds. Feasts at
36.9→34.1, 17.8→17, 14.5→13.9 — all surplus, all hungryStreak 0. The village
died of violence (combat), not hunger — and still fired the food-deed rung
(sentimentTaught && feastSurgeUsed both true) on a 53-day run. The chain
works even on short trajectories.

**PASS** — with the pre-existing blank re-noted: the devotion channeling
line ("💛 You hold Carpenter's square... The feast was the weapon.") fires
VERBATIM every day d15–d55+ — the finding #64 repetition class
(competent.js channelDevotion, not this layer's doing). Filed, not chased
(same as the feastdoor run).

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate 16/16 both sides;
SMOKE green both sides. BOTH sides run FEASTSCALE_R13=1 (the r13 allowance);
armed adds FEASTGATE_R13=1.

| metric | control (gate off) | armed (gate on) | pre-reg | verdict |
|---|---|---|---|---|
| starvation deaths (**PRIMARY**) | 21 | **16** | ≤17 | **GO** |
| hungryDays (**GUARDRAIL**) | 48 | **44** | ≤43.2 | **MISS** |
| food-deeds | 13/16 | 11/16 | ≥11 | GO |
| table | 4/16 | 5/16 | ≥3 | GO |
| national | 7/16 | 8/16 | ≥5 | GO |
| wins | 0/16 | 0/16 | — | — |
| exiled | 0/16 | 0/16 | — | — |
| wave-4 reach | 11/16 | 11/16 | — | — |
| wave-5 unlocks | 4/16 | 5/16 | — | — |
| median survival | 92d | 101d | report-only | — |
| max survival | 180d | 180d | — | — |
| allowance feasts | 107 | 94 | — | mechanism |
| gate holds | 0 | 123 | — | gate live |

Per-seed (control → armed): the gate held feasts on 13/16 runs (holds 1–26;
only leadc-s11/s33/s77 saw zero holds). Starvation fell on 6 seeds, rose on
2 (+1 each), flat on 8. HungryDays: 13 seeds flat, −2/−3 on two seeds, +1 on
one (belon-s55: 2→3 — the entire miss; 44 vs the 43.2 bound). Deed seats:
control 4 (3 full + 1 lesser), armed 5 (3 full + 2 lesser) — the gate kept
the deed-opening while removing the harm.

**Verdict: KILLED AT PILOT per §14.** The primary passed (16 ≤ 17) and every
other guardrail held, but the pre-registered hungryDays guardrail missed
(44 > 43.2) and §14 binds — a miss is NO-GO, never re-scored. See Metric
review for why the miss is perturbation on a noisy proxy, not gate harm —
and why the kill stands anyway.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control (r13, gate off) | 7/16 | 4/16 | 0/16 | 11/16 | 4/16 | 92d | 180d |
| armed (r13 + gate) | 8/16 | 5/16 | 0/16 | 11/16 | 5/16 | 101d | 180d |

Exiled: 0 both sides.

Death-cause shares — control: combat 62, starvation 21, monster 20, sickness
19, villager combat 18, wound 14, contest 4, lockjaw 2, ambush 1, Choir Toad
1, dehydration 1, alien 1, the expedition 1. Armed: combat 70, sickness 20,
monster 17 (incl. one "The Callback" — a wave-3 monster instance, not a new
mode), starvation 16, wound 13, villager combat 9, contest 7, ambush 1, the
expedition 1, alien 1. Same modes — no new death mode. Villages die of
violence, not hunger, on both sides; the armed side starves less (21→16).

## Village assessment (plain words)

Sixteen villages with the gated allowance, and the gate did exactly what it
was built to do: it said no 123 times. The un-gated allowance fired 107
feasts across the control runs; the gated one fired 94 and held 123 — the
held ones were the pantry-blind feasts, the ones fired on contribution alone
while the shelves were thin. The villages that lived long still feasted
often (leadfeast s22: 13 feasts in 120d, every one on deep surplus); the
villages on thin pantries feasted less and starved less.

Starvation deaths fell 21→16 — five fewer villagers starved, spread across
six seeds, not one lucky run. The median village lived 9 days longer (92→
101d). The deed chain the whole #187 line exists for kept working: 11/16
food-deed rungs (vs 13/16 — the two lost were allowance feasts the gate
honestly refused on thin pantries), 5 table seats (vs 4), national 8/16
(vs 7). Nobody was exiled. The villages still died the way villages die —
raids, monsters, contests, wounds — just with less hunger in the mix.

The blank this run filled: the r13 allowance's harm now has a proven-safe
gate design (fire only inside the surplus above the 4-day floor; the floor
never moves; contribution untouched), proven RED→GREEN, proven live in the
sims (123 holds, floor respected on every firing), and sense-tested as
surplus decisions. The blank documented: the hungryDays guardrail as
pre-registered cannot see this gate — it fires on trajectory perturbation
(a single +1 hungry day on a zero-starvation seed), not on pantry harm.

## Blanks filled / documented

- **GATE (this arm, KILLED AT PILOT — reverted per kill protocol)**:
  scripts/policies/feastscale.js + pantrySurplusOk (FEASTGATE_R13=1, default
  OFF, requires FEASTSCALE_R13=1) — the allowance could only spend surplus
  above the game's own 4-day fresh floor; the floor never moved; the
  contribution rule was untouched; held feasts counted fsGateHeld; zero
  src/js changes. Reverted: feastscale.js is byte-identical to HEAD (the
  proof's R1 pins gate-off == pristine).
- **PROOF**: scripts/test-allowancegate-20261014.js (REAL RED→GREEN, 22/22
  ×2; INFO-SKIP degradation installed post-kill per the feastdoor
  precedent).
- **DET-GATE**: scripts/det-gate-allowancegate-20261014.js (16/16 both
  sides, no waiver).
- **SWEEP**: scripts/measure-allowancegate-20261014.js (control + armed,
  fsFeasts/fsArmedFeasts/fsGateHeld telemetry, gate-contrast SMOKE both
  sides) + evidence/2026-10-14/ag-calib-a.json (control/pilot),
  ag-calib-b.json (A/A sample B), ag-armed.json (armed) and the three
  perseed-ag-*/ per-seed dirs.
- **SENSE**: scripts/sense-allowancegate-20261014.js (feast decision
  context: fresh-days before→after, hungryStreak, beats).
- **A/A CALIBRATION**: the FEASTSCALE_R13=1 substrate's own noise —
  starvation rel 0.67, table rel 0.50, hungryDays rel 0.23 across two
  disjoint 16-run samples. The paired identical-seed design is what makes
  the comparison honest.

## Metric review (§14)

1. **The hungryDays guardrail fired, and §14 binds — KILL stands.**
   44 > 43.2 is real (identical seeds, det-gated 16/16 both sides),
   lever-caused, and exceeds the pre-registered bound. This is not
   re-scoring: the primary passed (16 ≤ 17) and every other guardrail held
   (deeds 11 ≥ 11, table 5 ≥ 3, national 8 ≥ 5, no new death mode), but the
   guardrail as pre-registered missed.
2. **The miss is perturbation on a noisy proxy, not gate harm.** The miss is
   a single +1 hungry day on one seed (belon-s55: 2→3) — a trajectory with
   ZERO starvation deaths on both sides, where the gate held 10 feasts and
   both villages died of violence (92d vs 81d, global vs regional rank —
   the re-sequenced-trajectory signature). The gate cannot cause hunger by
   construction: it only HOLDS feasts (never adds), and the floor invariant
   is proven live (proof G7: floor ≥4 after every feast in a 120d armed run;
   sense: the d80 feast fired at 5.8d and landed at 4.9). The A/A
   calibration proves the proxy's own noise (±11 hungry-days across seed
   compositions, rel 0.23) dwarfs the 0.8 miss — the pre-registered
   control×0.9 bound (−4.8) is tighter than the metric can resolve.
3. **The guardrail needs a noise-calibrated form for the NEXT run** (the
   feastdoor metric review prescribed this; this run's calibration delivers
   the numbers): either a paired-delta bound sized to the A/A p90 |d|
   (hungryDays ±11 → e.g. armed ≤ control + 11 as the no-harm bound, with
   the directional hope stated separately), or a starvation-only primary
   (the actual harm: 21→16, cleanly GO). The gate's effect on the actual
   harm is unambiguous; the proxy is what failed.
4. **The primary is robust and the mechanism is proven.** Starvation 21→16
   on identical seeds, spread across six seeds; the gate held 123
   pantry-blind feasts; the floor never moved (proven in the proof, honored
   in every sim firing); deeds 11/16 and tables 5/16 kept the #187 chain
   alive. The gate is a proven-safe harm remover for the r13 allowance —
   killed on a proxy, not on harm.
5. **Telemetry note**: telemetry-check.js LOUD on table (baseline 0 →
   current 5/4) fires on BOTH sides — it is the r13 substrate's deed-opening
   (measured and reported since the feastdoor run), not the gate; the
   scale-wall baseline predates the r13 era. The gate's marginal table
   effect is 4→5 (+1).

## Convergence state

food-economy: **killed-at-pilot** (allowancegate). The pantry-state gate is
a proven-safe design (starvation 21→16, 123 blind feasts held, floor never
moved, deeds/tables kept) killed by the pre-registered hungryDays guardrail
(44 > 43.2 — a single-seed +1 on a zero-starvation trajectory, inside the
proxy's own calibrated noise of ±11). sim-findings #187 stays OPEN: the
feast-as-door mechanism is now quadruply proven; the remaining work is the
guardrail, not the gate — a noise-calibrated hungryDays bound (this run's
A/A numbers) or a starvation-only primary for the next run, and/or landing
the gate itself under that honest bound.
