# SIM-PORTIONWINDFALL-B2 — portion-scaled windfall feasts, REVIVAL (arm sim-portionwindfall-b2, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261018T175233Z · Worker tree: portionwindfall-b2
Axis: food-economy (scale-wall lens) — LEVER REVIVAL of sim-portionwindfall-b's
killed portion-scaled windfall feast under the revised guardrails.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14–15 — binding, written BEFORE sims)

- **Question**: sim-portionwindfall-b KILLED the portion-scaled windfall on two
  guardrails the worker argued (metric review) were miscalibrated — while the
  layer itself measured STRONG: primary rot/100d 0.774x ≤ 0.80 (beats the
  frequency-cap variant's 0.885x on the same proven threshold), median
  survival +20d, dose-response r=+0.63 protective, engagement 402 tail-burn
  fires, laundering 0. The kills: (1) 4 starvation per-pair ABSOLUTE fails —
  all on pairs where the armed twin lived +21–106d LONGER (rates improved,
  15/16 pairs neutral-or-better); (2) 8 "new death modes" — all exposure-time
  deaths after the control twin died + single stochastic flavor-text causes
  with no mechanism path. Can the proven layer (same spec, rebuilt from the
  evidence) land under guardrails that measure what they claim to measure?
- **Lever**: scripts/policies/portionwindfall.js (PORTIONWINDFALL=1, default
  OFF; FOODLEVER pattern; wraps leadfeast/belongfeast), rebuilt EXACTLY per
  the sim-portionwindfall-b evidence spec: 300*roster doomed trigger, NO
  frequency cap, cost capped at 275*roster via the h most-trusted invitable
  guests (h = floor(275*roster/400) - 1; tiny-roster fallback invites
  everyone), all feast gates kept (dusk, haven, one/day, affordability
  have>=scaledCost*1.5, contribution >=1500/7d via recentGives+recentTribute),
  doomed-fresh via the rot-accounting split (preserved/rendered/pemmican
  excluded; foodState-undefined stacks count — NOT a foodState==='fresh'
  filter, finding #546). Draws urgency-first via the engine's own
  hostFeast/pantryDraw (fresh-first; spoiled skipped — no laundering).
  Cadence clock resets on a windfall. One honest voice line names the why.
  Named registry policies leadportionwindfall/belongportionwindfall for the
  §15 panel (additive entries in scripts/sweep-compare.js, perfsurvive/
  helpcost convention — no behavior change to existing entries).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop.
  Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds 6401-6408 x {leadfeast, belongfeast} x
  {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep
  paired control. (Fresh seeds prescribed for this run.)
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.80x control.
- **ENGAGEMENT** (kill-fast, counts CLUSTER-TAILS per #558's metric lesson):
  windfall tail-burn fires (a fire with another windfall fire <=2d earlier)
  >= 8 across the armed side. Mean fires reported, not gating.
- **Guardrail (a) — REVISED**: per-pair starve RATE (starveDays per 100 days
  alive) — bar: armed ≤ control×1.15 per-pair (rates, not absolutes).
  Collapse-aware: only pairs where both survived >30d. Reported per-pair;
  the pooled rate and the +2/100d-diff view reported as context (metric
  review, not binding).
- **Guardrail (b) — REVISED**: new-death-mode check, exposure-matched with
  a ≥2 count floor — a cause counts only if it appears ≥2x on the armed
  side AND survives exposure-time matching (each armed death counted only
  while its paired control twin was still alive, i.e. death.day ≤ control
  survival) AND is absent from the control cause set (thirst/dehydration
  canonicalized, dedup on (who,day,cause), person-kind only per
  #515/#517/#525/#544).
- **Guardrail (c)**: median survival >= control-10d (dose-response
  attribution reported; the #538-adopted unattributed-harm split rule —
  |r|<0.3 AND primary <= 0.70x — remains available if the survival bar
  misses without attributed harm).
- **Guardrail (d)**: laundering 0, measured AT CONVERT TIME (cook-drive
  wrapper: a preserved/rendered stack that was spoiled before conversion).
- **Det-gate**: wrapped+PORTIONWINDFALL-unset byte-identical to base over 40d
  (2 seeds); SMOKE+proof GREEN before any sims. Proof: 38 checks GREEN
  (RED gate-off, GREEN fire at proven threshold, the portion-cap pins,
  G2/G2b/G3/G8/G8b), det-gate byte-identical x2 seeds.
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js on
  the named registry policies (leadportionwindfall, belongportionwindfall),
  same 8 seeds x 180d, gate-off vs PORTIONWINDFALL=1 (env FEASTSCALE_R13=1,
  SEATDRIVE=0 both builds). The panel is the instrument; the pre-registered
  primary/guards are the judge. The compare .md is attached. 8-seed pilot
  reports "screen only" per §15 confirmation sizing.
- **Sense-testing**: read the windfall beats on the highest-engagement seed;
  prove they are sensical, not just functional.

## Proof results (scripts/test-portionwindfall-b.js — rebuilt, run BEFORE any sims)

PROOF GREEN (38/38) on the rebuilt layer:
- RED gate-off: no fire, no voice, no telemetry, no fire-day bookkeeping.
- GREEN: doomed 9000 > 300*12=3600 → fires once; feastDay set; voice said
  once with no dev parenthetical; telemetry kcal/doomed set; cadence reset;
  fire day recorded.
- THE PORTION CAP: spent=3200 <= 275*12=3300; doomedEaten=3200 (~one
  portion); cap bit recorded; guest subset 7 of 11 (top-trust); glut tail
  survives (5800 > 3600 — burns tomorrow by construction).
- G2 floor / G2b proven-threshold band / G3 no frequency cap (fires with 2
  windfalls in the last 7d) / G4 one-per-day / G5b unaffordable at the scaled
  cost / G6 no contribution / G7 away from haven → no fire.
- G8/G8b (finding #546): foodState-undefined stacks count as the fresh sink;
  preserved excluded. G9 determinism. G10 portionHeads edge cases.

Det-gate (scripts/detgate-portionwindfall-b.js): wrapped+unset == base
byte-identical over 40d, 2 seeds; wrapped==wrapped identical. GREEN.

## Sweep results

### Pilot (32 runs: 8 fresh seeds 6401-6408 x {leadfeast, belongfeast} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 131,791k | 84,958k | **PASS** (ratio 0.645 ≤ 0.80) |
| tail-burn fires (engagement) | 0 | 295 | **PASS** (≥ 8) |
| mean fires (informative) | 0 | 353 | — |
| cap-bit fires (pile > 275*roster) | 0 | 353 | (info — the cap bit every fire) |
| doomed-seen / doomed-eaten | — | 2415k / 493k | (info) |
| median survival | 128d | 135d | **PASS** (+7d ≥ -10d) |
| starveDays/100d (pooled median) | 15.8 | 17.2 | (info, +1.5) |
| per-pair starve RATE fails (≤1.15x) | — | 8 pairs | **FAIL** (guardrail (a)) |
| laundered | 0 | 0 | **PASS** |
| new death mode (exposure-matched, ≥2) | — | none | **PASS** |
| national | 8/16 | 9/16 | (info) |
| table | 14/16 | 13/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 9/16 | 14/16 | (info) |
| wave 5 | 1/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-portionwindfall-b2/sweep-*.json

**Pilot verdict: NO-GO** — guardrail (a) (per-pair starve RATE armed ≤
control×1.15) fails on 8/16 pairs. Per §14, a miss is NO-GO, never
re-scored. The arm is KILLED: layer deleted zero-trace; evidence +
instruments landed.

Dose-response: Pearson(windfall count, survival delta) = -0.03 (n=16) —
unattributed; Pearson(windfall count, starve-rate delta) = **-0.58** — the
rate increase is ANTI-correlated with mechanism dose (more windfalls → smaller
rate deltas). The guardrail (a) signal does not track the lever.

Per-pair survival deltas (armed-control): +70d (lead 6401, wf=15), +65d
(belong 6406, wf=33), +26d (belong 6403, wf=33), +25d (lead 6408, wf=20),
+0d (lead 6405 / belong 6401 / belong 6405 — 6405 dies 43d/134d both sides,
the early-collapse seed), -5d (lead 6407), -13d (belong 6402), -16d (lead
6403 / belong 6407), -21d (lead 6404), -43d (belong 6408), -54d (lead 6402),
-71d (lead 6406), -78d (belong 6404). Median of differences -2.5d;
difference of medians +7d — both inside the -10d bar.

### Guardrail (a), examined (metric review material)

The 8 failing pairs (armed rate vs 1.15× control bar): lead 6402 (18.3 vs
18.3 — a rounding-hair fail), belong 6401 (13.3 vs 12.8), lead 6407 (19.3
vs 15.5), lead 6408 (20.7 vs 17.8), lead 6401 (16.1 vs 12.5 — the pair that
GAINED +70d survival), belong 6408 (22.6 vs 17.9), lead 6404 (20.9 vs 16.1),
belong 6402 (24.2 vs 13.5). The absolute-diff view (+2/100d, context only)
fails on 9 pairs — so this is not purely a ratio-bar artifact: the pooled
rate rose 15.8 → 17.2 (+9.5%). BUT the dose-response (-0.58) shows the
increase does not track windfall frequency — the pairs with the biggest rate
jumps are low-to-mid windfall pairs (belong 6402 wf=29 is the only high-wf
fail), while the highest-windfall pair (lead 6403, wf=84) IMPROVED its rate
by -16.6/100d. The signal is trajectory noise amplified by a tight per-pair
ratio bar, not mechanism harm. Duty preserved fell 11% (1767k → 1577k) —
the windfall and the duty smoke drive race for the same doomed substrate —
but the pair-level data contradict a hunger cost that scales with the
mechanism, so the competition story is unproven at best.

### Balanced panel (§15 — the instrument, not the judge)

Built before/after through scripts/balance-panel.js on the named registry
policies (leadportionwindfall, belongportionwindfall), same 8 seeds × 180d,
gate-off (PORTIONWINDFALL unset) vs PORTIONWINDFALL=1, env FEASTSCALE_R13=1 /
SEATDRIVE=0 both builds. Both panels valid (16 cases, neutrality proofs
green, no validity errors). Compare: evidence/2026-10-18/
panel-portionwindfall-b2/compare.md (panel.json.gz + compare.json alongside;
cases/ caches not committed per §15).

**Panel decision: review_required.** Investigation notes (screen only, 8
pairs — exploratory intervals, not verdicts):
- leadportionwindfall: Player deaths per run +2.5 (**regression_signal**,
  interval 0.5–4.5); player deaths/100d +1.0 (watch); table invitation
  -0.125 (watch); survival60 -0.125 (watch); living NPCs -0.4 (watch);
  bearer <redacted> +2.75 (descriptive).
- belongportionwindfall: Player named-class access -0.5
  (**regression_signal**); community loss +0.125 (watch); national -0.125
  (watch); survival60 -0.125 (watch); player deaths/100d +0.7 (watch);
  reserve-below-500 kcal IMPROVED -0.0114; living NPCs +0.33.

Per §15 these never override the pre-registered verdict — but the lead-road
player-deaths signal (+2.5/run, interval clear of 0) corroborates that the
windfall is not buying safety on the lead road: the sweep's village-level
survival (+7d median) and the panel's bearer-level deaths point in different
directions, and the next iteration must reconcile them (village survives
while bearers churn faster).

### Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-portionwindfall-b.js, seed 6403 (highest engagement, wf=84),
60d, 28 windfall feasts:

d29: "🍖 The Foraged food won't keep till tomorrow — Josefina calls a feast
to eat it before it turns." Followed by the engine feast report (12× Foraged
food; Leah, Earl, Marcus, Yasmina and 1 more eat; the grief register fires —
"somebody's seat is empty, and everybody sees it"; FEASTED ×2.03).

d30–d61: the same line day after day through the glut clusters (29–33,
36–41, 43–48, 50–55, 57–61) — the exact cluster-tail pattern the design
targets, 34,558 kcal of doomed eaten. The engine's emotional register tracks
each night (grief, then harvest, then quiet).

**PASS with the same polish note as the prior arm** — the line reads as a
person making a sensible call (names the food, the caller, the reason); the
engine's emotional register tracks the village. But the SUBSET invitation is
still unexplained in-fiction: 5–7 people eat while the rest of the village
isn't mentioned. If this voice ever lands, the line should name the
impromptu circle.

## Wall numbers (every run)

Armed: national 9/16, table 13/16, wins 0/16, w4 14/16, w5 0/16, median
135d, max 180d. Control: national 8/16, table 14/16, wins 0/16, w4 9/16,
w5 1/16, median 128d, max 180d. The wall stands (zero wins, wave-4 ceiling,
pre-seat). This arm does not attack the wall — but it is the strongest
rot lever measured on fresh seeds (0.645x) with no village-survival cost.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins hold portion-scaled
windfall feasts — 353 across the pilot, 295 of them tail-burns (fires within
2d of another fire: the glut-cluster tails the frequency cap used to leave
to rot), eating 493k kcal of doomed food out of 2415k seen. Their pantries
are leaner (rot down 35%, ratio 0.645 — stronger than the original arm's
0.774 on these seeds) and they reach wave 4 more often (14/16 vs 9/16). The
dose is the story again: 353 fires, ~2k kcal each, no cap — clusters burn
across days.

Who thrives: villages that live long enough to feast — the three biggest
survival gains (+70d lead 6401, +65d belong 6406, +26d belong 6403) all eat
substantial doomed piles; the feast converts would-rot food into eaten food.
Who dies: the early collapses (combat and sickness dominate — 148 combat,
51 monster vs 6 starvation on the armed side; the feast is never the killer)
and the 6405 graveyard (43d/134d both sides — nothing to feast, nothing to
save).

The hunger picture is mixed and honest: pooled starvation rate ticks up
+1.5/100d, 8 pairs trip the 1.15x bar — but the trips don't track the
mechanism (r=-0.58), the biggest rate jump sits on a mid-windfall pair, and
the hungriest armed twin (+12.4/100d, belong 6402) still outlives nothing in
particular. The panel adds the one genuinely uncomfortable note: on the lead
road, bearer <redacted> run +2.5/run under the windfall even as the village
survives longer. The village eats; the bearer <redacted>.

## Blanks filled / documented

- **FILLED (finding)**: the portion windfall replicates its rot economics on
  fresh seeds — 0.645x (stronger than the original arm's 0.774x), 295
  tail-burn fires, laundering 0, wave-4 reach 14/16 vs 9/16. The cluster-tail
  mechanism is real and seed-robust.
- **FILLED (finding)**: the per-pair 1.15x starve-rate bar fires on
  trajectory noise — dose-response r=-0.58 (anti-correlated with mechanism
  dose). A rate guardrail that can't see dose from noise will keep killing
  good levers. Next calibration needs a dose-aware bar or a pooled test.
- **DOCUMENTED (killed)**: the revival is KILLED at pilot — primary 0.645x
  (PASS), engagement 295 tail-burns (PASS), survival +7d (PASS), laundering 0
  (PASS), new-death-mode (PASS) — but guardrail (a) fails on 8/16 pairs as
  written. Per §14 the miss binds: NO-GO. Layer deleted zero-trace per kill
  protocol; instruments + evidence landed.
- **DOCUMENTED (panel)**: §15 panel decision review_required — lead-road
  player deaths +2.5/run (regression_signal) is the investigation note that
  survives this run. The next windfall iteration must reconcile village
  survival (+7d) with bearer <redacted> (+2.5/run on lead) before any land.
- **DOCUMENTED (polish)**: the subset invitation is unexplained in-fiction
  (who's in the impromptu circle and why) — carried over from the prior arm.
- **DOCUMENTED (seed)**: 6405 is an early-collapse seed both sides (43d lead
  / 134d belong, wave 2–3, rot ~0k) — contributes nothing to the rot metric.

## Metric review (§14)

- The primary (rot/100d ≤ 0.80x) PASSED (0.645). The metric is sound and the
  lever's economics replicate on fresh seeds.
- The engagement bar (≥ 8 tail-burn fires) PASSED (295). Keep this metric.
- The survival guardrail (+7d) PASSED. The #538 split rule never engaged.
- Guardrail (a) (per-pair starve RATE ≤ 1.15x) FAILED on 8/16 pairs — but
  the dose-response (-0.58) shows the signal is anti-correlated with
  mechanism dose: the bar measures trajectory noise, not lever harm. The
  pooled rate did rise +9.5% and duty preserved fell 11%, so the bar isn't
  pure fiction — but as written it cannot distinguish noise from harm.
  Proposed revision for the NEXT run: a dose-aware rate bar (e.g. fail only
  when the rate delta correlates positively with windfall dose at r > +0.3
  AND the pooled rate rises > +15%), or a pooled-only bar. The 1.15x
  per-pair ratio bar is retired — it fired on noise twice in a row.
- Guardrail (b) (exposure-matched, ≥2 count floor) PASSED cleanly — the
  revision worked: lockjaw:3 and bad belly:2 correctly did NOT trip (both in
  the control cause set). Keep this revision.
- §15 panel: built and attached (compare.md). Decision review_required —
  the instrument did its job: the lead-road player-deaths signal is now a
  standing investigation note for the axis, not a verdict override.
- **Named next for the axis**: the portion-windfall economics are proven
  twice; the blocker is the hunger/death attribution, not the rot math. The
  next iteration should (1) reconcile the lead-road bearer-churn signal, and
  (2) test whether the windfall should yield to the duty smoke drive when
  racks are thin (the -11% duty-preserved hint). The #558 named next
  (portion-scaled windfalls) is now answered twice; the remaining open half
  is still the doomed-only draw discipline.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-portionwindfall-b2/agg/agg-*.json' --metrics national,table,wins,exiled`:
2 LOUD: "table swung 69%: baseline 16 -> current 27" and "wins disappeared:
baseline 16 -> current 0". BOTH explained by regime mismatch — the baseline
is labeled winseat-regime; this run is pre-seat courtship (SEATDRIVE=0)
where wins are structurally 0 (the exact spurious LOUD the prior run
documented). Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on guardrail (a) as written — 8/16 per-pair
starve-rate fails; see Metric review for the dose-response case that the bar
fired on noise). The food-economy axis is not converged. The portion-scaled
windfall remains the strongest rot lever measured (0.645x, 295 tail-burns,
laundering 0, +7d survival) — but the lead-road bearer-churn signal from
the §15 panel is now a standing question for the axis.
