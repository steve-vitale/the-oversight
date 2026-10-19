# SIM-PORTIONWINDFALL-B3 — portion-scaled windfall feasts, SECOND REVIVAL (arm sim-pwindrev-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261019T0130Z · Worker tree: sim-pwindrev-b
Axis: food-economy (scale-wall lens) — NAMED NEXT from finding #571,
re-running the proven portion-windfall layer under revised guardrails.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14–15 — binding, written BEFORE sims)

- **Question**: sim-portionwindfall-b KILLED the portion-scaled windfall on
  two guardrails its metric review argued were miscalibrated (finding #571):
  (1) per-pair ABSOLUTE starvation — punished life extension; (2) strict
  new-death-mode — tripped on exposure-time deaths after the control twin
  died. The layer itself measured STRONG: primary rot/100d 0.774x PASS,
  477 fires, +20d median, dose-response r=+0.63 protective. The b2 revival
  (fresh seeds 6401-6408) re-ran under #571's revised guardrails and KILLED
  again — this time on the revised 1.15x per-pair starve-RATE bar (8/16
  pairs), with dose-response r=-0.58 ANTI-correlated with mechanism dose:
  the bar fired on trajectory noise, not lever harm. b2's metric review
  RETIRED the 1.15x per-pair ratio bar ("fired on noise twice in a row");
  the windfallrev run (#582) adopted the standing replacement: dose-aware
  starve-rate (fail iff pooled armed rate > control ×1.15 AND Pearson
  (windfall count, per-pair rate delta) > +0.3). Can the proven layer
  (same spec, rebuilt from the landed instruments) land under guardrails
  that measure harm, not noise?
- **Lever**: scripts/policies/portionwindfall.js (PORTIONWINDFALL=1, default
  OFF; FOODLEVER pattern; wraps leadfeast/belongfeast), rebuilt EXACTLY per
  the sim-portionwindfall-b evidence spec, proof-verified against the landed
  instrument scripts/test-portionwindfall-b.js: 300*roster doomed trigger,
  NO frequency cap, cost capped at 275*roster via the h most-trusted
  invitable guests (h = floor(275*roster/400) - 1, engine 400/head;
  tiny-roster fallback invites everyone), all feast gates kept (dusk,
  haven, one/day, plan.ok, affordability have>=scaledCost*1.5, contribution
  >=1500/7d via recentGives+recentTribute), doomed-fresh via the
  rot-accounting split (preserved/rendered/pemmican excluded;
  foodState-undefined stacks count — NOT a foodState==='fresh' filter,
  finding #546), draws urgency-first via the engine's own
  hostFeast({guests})/pantryDraw (fresh-first; spoiled skipped — no
  laundering). Cadence clock resets on a windfall. One honest voice line
  names the food, the caller, and the why. Named registry policies
  leadportionwindfall/belongportionwindfall (additive entries in
  scripts/sweep-compare.js, perfsurvive/helpcost convention — no behavior
  change to existing entries) for the §15 panel.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop.
  Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds 7201-7208 x {leadfeast, belongfeast} x
  {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep
  paired control. (Fresh seeds prescribed for this run; verified unused by
  any prior portionwindfall sweep.)
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.80x control (same bar as the killed run).
- **ENGAGEMENT** (kill-fast, counts CLUSTER-TAILS per #558's metric lesson):
  windfall tail-burn fires (a fire with another windfall fire <=2d earlier)
  >= 400 across the armed side (the #571 bar: the original arm measured 477).
  Cap-bit on every firing (pile > 275*roster at fire time — structural, the
  trigger sits above the cap). Mean fires reported, not gating.
- **Guardrail (a) — DOSE-AWARE RATE** (per #571's "rates not absolutes"
  intent + b2's metric review which RETIRED the 1.15x per-pair ratio as
  noise-firing + #582's standing adoption): per-pair starveDays/100d rates
  reported for every pair (both >30d, collapse-aware); the binding bar is
  FAIL iff pooled armed rate > pooled control rate ×1.15 AND Pearson
  (windfall-fire count, per-pair rate delta) > +0.3 — a rate guardrail that
  cannot fire on trajectory noise. The old 1.15x per-pair ratio table is
  reported as context only (metric review, not binding).
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
- **Guardrail (e)**: ate/person-day intact (pooled): pooled village ate
  kcal per person-day (Game.villagerMealDay {ate} / villager-days) —
  armed >= control × 0.98 (the windfall must not displace real meals).
- **Det-gate**: wrapped+PORTIONWINDFALL-unset byte-identical to base over
  40d (2 seeds); proof GREEN before any sims. Proof:
  scripts/test-portionwindfall-b.js; det-gate:
  scripts/detgate-portionwindfall-b.js.
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js
  on the named registry policies (leadportionwindfall,
  belongportionwindfall), same 8 seeds × 180d, gate-off vs
  PORTIONWINDFALL=1 (env FEASTSCALE_R13=1, SEATDRIVE=0 both builds). The
  panel is the instrument; the pre-registered primary/guards are the judge.
  The compare .md is attached. 8-seed pilot reports "screen only" per §15
  confirmation sizing.
- **Sense-testing**: read the windfall beats on the highest-engagement
  seed; prove they are sensical, not just functional.

## Proof results (scripts/test-portionwindfall-b.js — run BEFORE any sims)

PROOF GREEN (37/37 checks, 0 FAIL) on the rebuilt layer:
- RED gate-off: no fire, no voice, no telemetry, no fire-day bookkeeping.
- GREEN: doomed 9000 > 300*12=3600 → fires once; feastDay set; voice said
  once with no dev parenthetical; telemetry kcal/doomed set; cadence reset;
  fire day recorded.
- THE PORTION CAP: spent=3200 <= 275*12=3300; doomedEaten=3200 (~one
  portion); cap bit recorded; guest subset 7 of 11 (top-trust); glut tail
  survives (5800 > 3600 — burns tomorrow by construction).
- G2 floor / G2b proven-threshold band / G3 no frequency cap (fires with 2
  windfalls in the last 7d) / G4 one-per-day / G5b unaffordable at the
  scaled cost / G6 no contribution / G7 away from haven → no fire.
- G8/G8b (finding #546): foodState-undefined stacks count as the fresh
  sink; preserved excluded. G9 determinism. G10 portionHeads edge cases.
- (Note: b2's evidence prose said "38/38" — the script's actual check
  count is 37; 0 FAIL either way.)

Det-gate (scripts/detgate-portionwindfall-b.js): wrapped+unset == base
byte-identical over 40d, 2 seeds; wrapped==wrapped identical. GREEN.

## Sweep results

### Pilot (32 runs: 8 fresh seeds 7201-7208 x {leadfeast, belongfeast} x {control, armed})

All 32 runs completed, 0 errors, 180d death-aware. Env asserted up front
by the sweep (FEASTSCALE_R13=1, SEATDRIVE=0 both sides; PORTIONWINDFALL=1
armed / unset control — verified in the per-seed meta). Control wf=0 on all
16 runs (the gate-off delegation is real).

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 100,500k | 105,916k | **FAIL** (ratio 1.054 ≤ 0.80) |
| tail-burn fires (engagement) | 0 | 279 | **FAIL** (≥ 400) |
| mean fires (informative) | 0 | 326 | — |
| doomed-seen / doomed-eaten | — | 2514k / 516k | (info — 21% of seen doomed eaten) |
| median survival | 129d | 111d | **FAIL** (−18d ≥ −10d; unattributed r=+0.44; split rule unavailable) |
| starveDays/100d (pooled) | 21.0 | 18.0 | (info) |
| guardrail (a) dose-aware | — | — | **PASS** (pooled 18.0 ≤ 24.2; r=−0.48) |
| laundered | 0 | 0 | **PASS** |
| new death mode (b) | — | thirst:3 | **FAIL** (≥2, exposure-matched, absent from control) |
| ate/person-day pooled (e) | 1833 | 1843 | **PASS** (≥ 1796) |
| national | 8/16 | 9/16 | (info) |
| table | 11/16 | 10/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 10/16 | 12/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-portionwindfall-b3/sweep-*.json

Per-pair rot/100d ratios (armed/control): belongfeast 0.91/0.62/1.25/0.34/
0.31/0.08/1.00/0.58; leadfeast 0.46/1.37/1.23/0.56/1.08/0.57/1.00/1.81.
Median of the 16 ratios = 0.765 — the median pair cuts rot 23%. The pooled
miss is dominated by two long-lived armed twins: leadfeast s7208 (140d→180d,
ratio 1.81, wf=105; rot 283k→512k/100d) and belongfeast s7203 (111d→180d,
ratio 1.25, wf=56). Both entered a late high-rot regime the control twins
never reached (s7208: 5.1k/d vs 2.8k/d).

Per-pair survival deltas (armed−control): −67d (lead 7203, wf=12), −55d
(belong 7208, wf=3), −35d (lead 7206, wf=2), −28d (lead 7204, wf=22), −11d
(lead 7202, wf=19), −8d (belong 7205, wf=1), +0d ×3 (the two s7207
graveyards + belong 7204), +20d (lead 7205, wf=15), +36d (belong 7201,
wf=10), +36d (belong 7202, wf=30), +40d (lead 7208, wf=105), +45d (lead
7201, wf=40), +69d (belong 7203, wf=56), +77d (belong 7206, wf=3).
Dose-response Pearson(wf, survival delta) = +0.44 — the three worst losses
are all low-windfall runs; the four biggest gains are high-windfall runs.
Harm is unattributed to the mechanism (trajectory noise), but the −18d bar
miss binds as written.

**Pilot verdict: NO-GO** — four binding misses (primary, engagement,
survival guardrail, new-death-mode). Per §14, a miss is NO-GO, never
re-scored. The arm is KILLED: layer deleted zero-trace per kill protocol;
evidence + instruments landed.

### Balanced panel (§15 — the instrument, not the judge)

Built before/after through scripts/balance-panel.js on the named registry
policies (leadportionwindfall, belongportionwindfall), same 8 seeds × 180d,
gate-off vs PORTIONWINDFALL=1, env FEASTSCALE_R13=1 / SEATDRIVE=0 both
builds. Both panels valid (16 cases, neutrality proofs green, no validity
errors). Compare: evidence/2026-10-18/panel-portionwindfall-b3/compare.md
(panel.json.gz + compare.json alongside; cases/ caches not committed per
§15).

**Panel decision: review_required** (screen only, 8 pairs — exploratory
intervals, not verdicts). Investigation notes:
- leadportionwindfall: player deaths/100d +1.94 (**regression_signal**,
  interval 0.048–3.93, clear of 0); eligible NPC named-class access −0.052
  (**regression_signal**); national −0.25 (watch); community loss +0.25
  (watch); table invitation −0.125 (watch).
- belongportionwindfall: no regression_signals; national +0.125; player
  deaths/100d −0.26; reserve-below-500 +0.01.

Per §15 these never override the pre-registered verdict — but the lead-road
bearer-churn signal from b2 (+2.5 deaths/run there) reproduces on fresh
seeds (+1.94/100d here, interval clear of 0). The village-survives-while-
bearers-churn tension is now measured twice; it survives the arm.

### Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-portionwindfall-b3.js (new: reproduces the sweep's own
substrate, including its hook set, so the trajectory is the measured one —
the old sense script's mismatched harness mode produced a divergent
trajectory with 0 fires), seed 7208 leadfeast (wf=105), 180d:

d46: "🍖 The Foraged food won't keep till tomorrow — Theo calls a feast to
eat it before it turns." → "🍖 FEAST 📺 — Theo opens the pantry wide: 14×
Foraged food. Wanjiru, Omar, Patrick, Lucas eat until the fire burns low.
Somebody laughs so hard they cry. For one evening, nobody is surviving —
they're just together. (−2,800 kcal from the pantry) Priya stayed in their
tent, feverish; Aroha stayed in their tent, feverish."

The windfall line reads as a person making a sensible call (names the food,
the caller, the reason); the engine's feast report is coherent (menu,
eaters, sick-skipped, emotional register, real cost). **PASS with polish
blanks**: (1) the identical line fires 105× on this seed (d46, d47, d48,
d50…) — verbatim repetition, theater class; (2) the subset invitation is
still unexplained in-fiction (4–5 eat while the rest of the village isn't
mentioned — carried from #583); (3) the line names the trigger pile ("The
Foraged food") while the menu often serves other food (Muscadine Grapes,
dried goods) — the draw isn't purely doomed; (4) engine grammar slip: "Omar
eat until the fire burns low" (singular/plural).

## Wall numbers (every run)

Armed: national 9/16, table 10/16, wins 0/16, w4 12/16, w5 0/16, median
111d, max 180d. Control: national 8/16, table 11/16, wins 0/16, w4 10/16,
w5 0/16, median 129d, max 176d. The wall stands (zero wins, wave-4 ceiling,
pre-seat). The two longest-lived armed twins (lead 7208, belong 7203) both
reached 180d but the wave-5 door stayed shut.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins hold portion-scaled
windfall feasts — 326 across the pilot, 279 of them tail-burns, eating 516k
kcal of doomed food out of 2514k seen. On most seeds the layer does what it
says: belongfeast cuts rot on 6/8 pairs (as deep as 0.08×), leadfeast on
4/8. But the pooled books don't balance, because two armed twins lived
dramatically longer and rotted dramatically more per day: leadfeast s7208's
village feasted 105 times across 180 days, ate 161k of a 1022k doomed pile,
and rotted 512k/100d against its twin's 283k. The feast is burning the
pantry's keeps while the doomed pile — apparently slab-shaped, undrawable
by the engine's urgency-first draw — rots in place, and the trigger keeps
firing on the same unburnable pile.

Who thrives: villages that feast on drawable piles — belong 7206 (60d→137d,
rot 0.08×), belong 7204 (rot 0.34×), lead 7201 (+45d, rot 0.46×). Who dies:
the early collapses (s7207 both roads, 45d/77d — nothing to feast, nothing
to save) and the combat-heavy midgame (148 combat deaths armed vs 111
control — the feast is never the killer, but the village doesn't get safer
either). The hunger picture is the run's one clean win: pooled starvation
rate falls 21.0→18.0/100d, ate/person-day holds 1833→1843, and the rate
improvement is anti-correlated with mechanism dose (r=−0.48) — the windfall
doesn't starve anyone.

The uncomfortable notes: thirst killed 3 on the belong road (d40, d43, d100
— absent from the control cause set, tripping the new-mode bar with no
confirmed mechanism path; the feast's 48-tick evening cost is the only
candidate channel), and the §15 panel's lead-road bearer-churn signal
reproduces (+1.94 deaths/100d, interval clear of 0). The village eats; the
bearers churn.

## Blanks filled / documented

- **FILLED (finding)**: the dose-aware starve-rate guardrail works as
  designed — PASS with pooled 18.0 ≤ 24.2 and r=−0.48 anti-correlated with
  dose. The retired 1.15x per-pair ratio would have tripped exactly once
  (lead s7206, a rounding-hair 13.1 vs 12.9). The revision measures harm,
  not noise.
- **FILLED (finding)**: the pooled primary can punish life extension —
  median-pair rot ratio 0.765 (23% cut) vs pooled 1.054. The two seeds where
  the armed twin lived +40d/+69d longer entered a late high-rot regime
  (s7208: 5.1k/d vs 2.8k/d) the control twins never reached. Same pathology
  as the old absolute guardrails, now biting the primary.
- **DOCUMENTED (killed)**: the second revival is KILLED at pilot — primary
  1.054x (FAIL), engagement 279 tail-burns (FAIL vs 400), survival −18d
  (FAIL, unattributed), new-death-mode thirst:3 (FAIL). Guardrails (a)
  dose-aware PASS, (d) laundering 0 PASS, (e) ate/person-day PASS. Per §14
  the misses bind: NO-GO. Layer deleted zero-trace per kill protocol;
  instruments + evidence landed.
- **DOCUMENTED (instrument)**: the portionwindfall sweep line's
  registerDeath hook never calls through (inherited from b/b2 — the
  surplusfeed sweep does). Death bookkeeping (corpse/grief/gossip/tele) is
  neutered in these sweeps; roster removal still happens via the callers,
  so survival/death-count comparisons stand, but death-adjacent fiction is
  thinner. Next sweep copy should call through.
- **DOCUMENTED (rebuild fidelity)**: this rebuild used set-semantics for
  the cap bit (b2's used accumulate — proof-indistinguishable; the sweep's
  "cap-bit on every firing" check needs the accumulate form). Noted for the
  next rebuild.
- **DOCUMENTED (panel)**: §15 panel decision review_required — the
  lead-road bearer-churn signal reproduces on fresh seeds. Standing
  investigation note for the axis.
- **DOCUMENTED (polish)**: verbatim windfall line ×105 (theater class),
  subset invitation unexplained in-fiction (#583 carried), trigger-pile /
  menu divergence, "Omar eat" grammar slip.

## Metric review (§14)

- The primary (rot/100d ≤ 0.80x) FAILED (1.054). The metric is pooled and
  the miss binds — but the median-pair view (0.765) shows the pooled number
  is composition-driven: two long-lived armed twins dominate. Proposed for
  the NEXT run: report the median-pair ratio alongside pooled, and measure
  doomed-pile drawability (slab fraction of the doomed pile at fire time) —
  the unmeasured heterogeneity variable. On s7208 the feast ate 16% of the
  seen pile; if the pile is slab-shaped the trigger fires on an unburnable
  pile and the layer is decoration on that seed.
- The engagement bar (≥ 400 tail-burn fires) FAILED (279). The bar is
  seed-lottery: b 477, b2 295, b3 279. Proposed: calibrate the bar from a
  multi-seed baseline distribution, or gate on tail-burn FRACTION of fires
  (mechanism shape) rather than an absolute count.
- The survival guardrail (−18d) FAILED as written; the miss is unattributed
  (r=+0.44 — positive: more windfalls track better deltas; the three worst
  losses are low-wf runs). The #538 split rule was unavailable (|r|=0.44,
  primary 1.054). No re-score: the bar binds.
- Guardrail (a) (dose-aware rate) PASSED — the b2-retired 1.15x per-pair
  ratio is confirmed dead; the dose-aware form is the standing bar.
- Guardrail (b) (exposure-matched, ≥2 count floor) tripped on thirst:3 —
  the revision worked mechanically (3 exposure-matched belong-road thirst
  deaths, absent from control). Keep this revision; next run instruments
  the candidate mechanism (feast-evening tick cost vs NPC water routines).
- Guardrail (e) (ate/person-day pooled ≥ 0.98×) PASSED (1843 vs 1833) —
  keep this metric; the windfall doesn't displace meals.
- §15 panel: built and attached (compare.md). Decision review_required —
  the instrument did its job: the lead-road bearer-churn signal is now a
  twice-measured standing note, not a verdict override.
- **Named next for the axis**: the portion-windfall economics do NOT
  reproduce on fresh seeds (0.774x → 0.645x → 1.054x across three seed
  sets). The layer is killed, not parked. The axis's open questions are
  now: (1) doomed-pile drawability — is the windfall trigger firing on
  slab-shaped piles the engine can't burn? (2) the lead-road bearer-churn
  signal (twice measured); (3) the feast-evening tick cost and NPC water
  routines (thirst:3). The #558/#571 named-next chain is answered: the
  portion-scaled windfall is seed-fragile and killed.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-portionwindfall-b3/agg/agg-*.json' --metrics national,table,wins,exiled`:
1 LOUD: "wins disappeared: baseline 16 -> current 0". Explained by regime
mismatch — the baseline is labeled winseat-regime; this run is pre-seat
courtship (SEATDRIVE=0) where wins are structurally 0 (the exact spurious
LOUD the prior runs documented). Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on four binding items: primary 1.054x > 0.80,
engagement 279 < 400, survival −18d < −10d, new-death-mode thirst:3). The
food-economy axis is not converged. The portion-windfall line is dead on
this substrate — three seed sets, three different economics.
