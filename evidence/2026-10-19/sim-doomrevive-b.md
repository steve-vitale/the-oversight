# SIM-DOOMREVIVE-B — the doomed-only draw discipline, REVIVED with the surplusfeed governor (arm sim-doomrevive-b, loop B, food-economy)

Date: 2026-10-19 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261019T0317Z · Worker tree: ~/workspace/worktrees/sim-doomrevive-b
Axis: food-economy (scale-wall lens) — the doomeddraw-b revival (findings backlog, 2026-10-18: "the doomed-only draw discipline that eats doomed without displacing the nightly meal").

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14–15 — binding, written BEFORE sims)

- **Question**: sim-doomeddraw-b (2026-10-18) proved the doomed-only draw discipline cuts rot to 0.568x pooled with a clean pooled profile, but was KILLED-AT-PILOT on the old per-pair starve-rate bar (2/16 fails as written, dose-unattributed, pooled-flat). Its metric review named the revival: (a) use the revised rate guardrail, (b) compose the landed surplusfeed governor to cap the +19% share_surplus response, (c) pre-register the production response as a diagnostic with a bar. Does the discipline, composed with the governor (SURPLUSFEED=1 in BOTH arms of every pair), cut rot without the production response, under the revised guardrails?
- **#570 injunction — RESOLVED, documented**: satisfied by sim-prodrebound-b (DIAG-NO-GO mapped the mechanism) and sim-surplusfeed-b (GO, landed). This arm is the composed revival the doomeddraw-b metric review named.
- **Lever**: scripts/policies/doomeddraw.js (DOOMEDDRAW=1, default OFF; wraps leadfeast/belongfeast as leaddoomeddraw/belongdoomeddraw) — REBUILT from the sim-doomeddraw-b spec (the layer was deleted zero-trace per kill protocol; the instruments survived). Rebuild verified behavior-identical in fixtures: scripts/test-doomrevive-b.js PROOF GREEN (45 checks), scripts/detgate-doomrevive-b.js DET-GATE GREEN (wrapped+unset == base byte-identical, 2 seeds x 2 policies, with SURPLUSFEED=1 on all sides). Discipline: after the normal nightly loop (wrapped Game.villageEats), the cook serves seconds from the ~2-day doomed window ONLY: P1 = bonus-inclusive (spoilDay+bonus)==day+1 (rots at tomorrow's dawn, no future sink); P2 = bonus-inclusive (spoilDay+bonus)==day+2 drawn ONLY as measured excess beyond demonstrated sink clearance (p2excess = max(0, p2 − mealClear7 − smokeClear7), trailing-7d measured daily meal fresh-draw and cook smoke kcal via policy-side wraps; <3d history → p2excess = 0). Trigger: (p1+p2excess) > 200*roster. Cap: 400*roster/night. NO feast machinery. Engine's own pantryDraw (cook:true, exposure-rolled per villager); hunger eased with the meal's own math; takes ledgers kept; pantryKcal re-synced. EATING CODE UNTOUCHED. One honest voice line per fire night names the cook and the food.
- **Composition**: the landed surplusfeed governor (src/js/game.js: surplusFeedGovernor, env-gated SURPLUSFEED=1, default OFF) is ACTIVE in BOTH arms of every pair — the comparison isolates the discipline; the inflow side is governed on both sides.
- **Never-displace structural case**: (1) post-meal timing; (2) P1 has no future sink by engine law; (3) P2 only as measured excess; (4) hunger-eased portions self-limit; (5) ledgers kept, no feast buffs/politics.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); SURPLUSFEED=1 EXPLICIT both sides (the composition); base courtship policies only. 180d death-aware; dead villages stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **HORIZON WHY (§10)**: 180d — rot accumulates across the run; the reachability half (waves 4–5, national, table) needs the long window. Death-aware: dead villages stop.
- **SEEDS**: pilot 8 FRESH seeds 7401–7408 x {leaddoomeddraw, belongdoomeddraw} x {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep paired control. Freshness verified 2026-10-19: no hits in scripts/sweep-*.js, scripts/test-*.js, evidence/2026-10-18/sim-*.md. NOTE: the assigned seeds 6601–6608 were consumed by sim-pitknowledge-b (scripts/sweep-pitknowledge-b.js) after the task was drafted — 7401–7408 substituted, documented here. Used/banned before this run: 4201–4208, 4301–4308, 4401–4408, 4501–4508, 4601–4608, 17011–17018, 4801–4808, 4811–4822, 4901–4908, 5111–5118, 5101–5108, 5601–5608, 6101–6108, 6201–6208, 6301–6308, 6401–6408, 6551–6558, 6561–6568, 6601–6609, 6606, 6701–6708, 6801–6808, 6808, 7001–7008, 7101–7108, 7201–7208, 7601–7608, 9292–9295, 99101–99108, 9921–9928, 105101–105104.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days alive — pooled — armed <= 0.80x control.
- **ENGAGEMENT** (kill-fast): fires on >= 50% of doomed-glut nights (armed side; glut night = raw ~2-day doomed pile > 200*roster post-meal, counted whether or not the discipline fires — the discipline may correctly stand down when sinks clear the pile). Fires == 0 → mechanism invisible → KILL at pilot.
- **Guardrail (a) — eating intact**: pooled ate/person-day armed >= 0.98x control.
- **Guardrail (b) — DOSE-AWARE starvation rate** (the standing revision from sim-windfallrev-b — the 1.15x per-pair bar is RETIRED): FAIL iff Pearson(fires, per-pair starve-rate delta) > +0.3 AND the pooled starve-rate rises > +15%.
- **Guardrail (c) — median survival** >= control−10d (dose-response reported).
- **Guardrail (d) — no new death mode** (exposure-matched, ≥2 count floor).
- **Guardrail (e) — laundering 0**, measured AT CONVERT TIME.
- **Guardrail (f) — PRODUCTION RESPONSE** (pre-registered, GATES the arm): pooled share_surplus inflow armed <= 1.15x control. The governor caps the inflow side on both arms; a bigger delta means the draw drives ungoverned production (the doomeddraw-b +19% wore this hat).
- **Det-gate**: wrapped+DOOMEDDRAW-unset byte-identical to base over 40d (2 seeds x 2 policies), SURPLUSFEED=1 all sides; wrapped==wrapped identical. PROOF GREEN before any sims.
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js (scripts/build-doomrevive-panels.js), same 8 seeds x 180d, gate-off vs DOOMEDDRAW=1, SURPLUSFEED=1 both builds. Panel = instrument, thresholds = judge. Compare .md attached (evidence/2026-10-19/doomrevive-panel-primary.md).
- **Diagnostics (not guardrails)**: PRODTHROTTLE engagement delta; dose-responses Pearson(fires, survival delta) and Pearson(fires, log rot-ratio).
- **Telemetry**: node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall-preseat.json --current '<per-seed-glob>' --metrics national,table,wins,exiled. Investigate every LOUD.
- **Sense-testing**: read the seconds beats on the highest-engagement seed; prove sensical (SENSE-TESTING LAW).

## §14b pre-pilot substrate checklist (checked BEFORE the sweep)

1. **Contact**: the discipline fires iff (p1+p2excess) > 200*roster post-meal. The engagement gate (>= 50% of glut nights) IS the contact probe.
2. **Pool sizing**: with the governor active both arms, control rot/100d is suppressed vs the ungoverned substrate — the 0.80x bar must be earned ON TOP of the governor. The bar is the axis standard; the miss binds either way.
3. **Verb existence**: the discipline rides the engine's own pantryDraw + villageEats — both exist; the layer only offers doomed seconds post-meal.
4. **Horizon fit**: 180d death-aware contains the full rot accumulation and the reachability window.

## Instruments

- scripts/policies/doomeddraw.js — the layer, REBUILT (DOOMEDDRAW=1, default OFF). PARKED — see verdict.
- scripts/test-doomrevive-b.js — proof (45 checks, PROOF GREEN).
- scripts/detgate-doomrevive-b.js — gate-off byte-identity with SURPLUSFEED=1 (DET-GATE GREEN).
- scripts/sweep-doomrevive-b.js — 32 runs: rot:fresh vs rot:preserved (item-identity dedupe), duty-time cook throughput + laundering at convert time, kind-aware deaths, starveDays, villagerMealDay {ate}, stockSurplus inflow, PRODTHROTTLE engagement, doomeddraw telemetry. SURPLUSFEED=1 asserted both arms; sweep STOPS on env mismatch. Writes to ~/workspace/sweep-tmp/sim-doomrevive-b/ (restart-safe).
- scripts/analyze-doomrevive-b.js — aggregator with the pre-registered verdict (dose-aware rate, production-response gate).
- scripts/sense-doomrevive-b.js — SENSE-TESTING LAW.
- scripts/build-doomrevive-panels.js — §15 balanced-panel compare.

## Proof results (scripts/test-doomrevive-b.js — run BEFORE any sims)

PROOF GREEN (45 checks, exit 0) — identical pins to the b spec: RED gate-off (no wraps, no ctx writes, no seconds, no voice, no telemetry, villageEats delegates and still eats doomed first); GREEN trigger/cap pinned, P1 fires, P2 stands down on demonstrated clearance / fires on excess / inert with <3d history, hunger eased with the meal's own math, ledgers kept, exposure rolled per villager, foodState-undefined counts (finding #546), voice once naming cook+food with no lever-name leak, deterministic, idempotent install.

## Det-gate (scripts/detgate-doomrevive-b.js)

DET-GATE GREEN: 2 seeds (7401, 7402) x 2 policies x 40d — wrapped+DOOMEDDRAW-unset == base byte-identical on all four, wrapped==wrapped identical, with SURPLUSFEED=1 on all sides. The env reads draw no RNG; the gate-off path installs zero wraps and writes zero ctx keys.

## Sweep results

### Pilot (32 runs: 8 seeds 7401–7408 x {leaddoomeddraw, belongdoomeddraw} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**, pooled) | 25,191k | 16,075k | **PASS** (ratio 0.638 ≤ 0.80) |
| fires / doomed-glut nights (engagement) | 0 / — | 239 / 482 | **MISS** (0.496 < 0.50; fires ≫ 0) |
| doomed kcal eaten | — | 689k | (info; raw doomed-seen 2,223k) |
| P1 pile / P2-excess seen | — | 770k / 492k | (info) |
| median survival | 154d | 180d | **PASS** (+26d ≥ −10d) |
| ate/person-day (pooled) | 1889.4 | 1899.4 | **PASS** (1.005 ≥ 0.98) |
| dose-aware starve-rate | r=+0.05, pooled +5.5% | — | **PASS** (not r>+0.3 with >+15%) |
| pooled starveDays/100d | 17.4 | 18.4 | (info) |
| production response (pooled shareSurplus) | 5,227k | 5,825k | **PASS** (1.114 ≤ 1.15) |
| PRODTHROTTLE engagement | 0.693 | 0.698 | (info — no disengagement) |
| laundered | 0 | 0 | **PASS** |
| new death mode (exposure-matched, ≥2 floor) | — | none | **PASS** |
| national | 7/16 | 9/16 | (info) |
| table | 11/16 | 11/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 11/16 | 11/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: ~/workspace/sweep-tmp/sim-doomrevive-b/sweep-*.json

**Pilot verdict: PARKED with metric review** (see Metric review). The engagement bar (>= 50%) misses by 0.4pp (239/482 = 0.4959; 2 more fires would pass). Per §14 the miss cannot be re-scored as GO — but the miss is a calibration question on a kill-fast gate whose purpose (mechanism visibility) is satisfied 239 times over, not a mechanism failure. The layer is preserved in the branch, NOT landed to master. Instruments + evidence landed.

Dose-responses (attribution):
- Pearson(fires, survival delta) = **+0.40** (n=16) — more fires associate with BETTER survival (protective; same direction as doomeddraw-b's +0.45).
- Pearson(fires, log rot-ratio) = **+0.15** — mild perverse tilt, less than half of doomeddraw-b's +0.34; the governor damps the backfire shape.
- Pearson(fires, starve-rate delta) = **+0.05** — the hunger-rate deltas do NOT track mechanism dose.

Per-pair rot ratios (same-seed control vs armed):

| pair | rot C→A | ratio | fires | surv C→A | note |
|---|---|---|---|---|---|
| belong 7408 | — | 0.04 | 4 | 180→180 | best rot |
| lead 7406 | — | 0.03 | 12 | 149→131 | |
| lead 7407 | — | 0.29 | 8 | 134→180 | +46d |
| belong 7402 | — | 0.30 | 2 | 152→142 | |
| lead 7404 | — | 0.61 | 9 | 156→180 | +24d |
| belong 7403 | — | 0.63 | 2 | 113→86 | |
| lead 7401 | — | 0.91 | 101 | 144→180 | highest dose, +36d |
| belong 7404 | — | 1.15 | 6 | 156→180 | +24d, mild backfire |
| lead 7403 | — | 1.98 | 26 | 180→180 | backfire shape |
| lead 7402 | — | 2.13 | 5 | 121→139 | backfire shape, +18d |
| lead 7408 | — | 2.25 | 5 | 180→180 | backfire shape |
| belong 7407 | — | 3.13 | 33 | 174→180 | backfire shape, +6d |
| belong 7401 | — | 0.52 | 26 | 180→180 | |
| belong 7405 | — | 1.00 | 0 | 45→45 | early collapse both sides |
| lead 7405 | — | 1.00 | 0 | 45→45 | early collapse both sides |
| belong 7406 | — | 1.00 | 0 | 180→180 | no glut nights |

### The engagement miss, examined (metric review material)

239 fires / 482 glut nights = 0.4959 < 0.50 — a miss by 2 fires. The mechanism is not invisible: 239 fires across 16 runs (15/run), 689k doomed kcal eaten, the P2-excess machinery engaged (492k of measured excess seen). The 50% bar was calibrated on the doomeddraw-b pilot (0.89 fire rate, governor OFF both arms). The governor — active in both arms by design in this revival — mechanically increases legitimate stand-downs: it trims share_surplus inflow when pantryFreshDays > 4, shrinking doomed piles, so p2excess = max(0, p2 − mealClear7 − smokeClear7) zeroes more often and (p1+p2excess) clears the trigger less often. The stand-downs are the discipline working as designed (G3: stands down when sinks clear the pile), not mechanism failure. The bar measures fire-rate; the gate's kill-fast purpose measures visibility. On the visibility reading the gate passes 239 times over; on the letter it misses by 0.4pp.

### The production response (guardrail (f) — the composition question)

Pooled share_surplus: control 5,227k → armed 5,825k = **1.114x ≤ 1.15 — PASS**. The doomeddraw-b +19% (unguarded) is now +11.4% with the governor active both arms. The composition works: the inflow side is governed, the draw side cuts rot 36% on top. PRODTHROTTLE engagement is identical (0.693 → 0.698 — no disengagement). Per-pair backfire shapes persist (4 pairs with rot ratio >1.5, all with survival flat or better) — the production response is damped, not eliminated; the dose-response on rot (+0.15) is less than half the ungoverned +0.34.

### §15 balanced-panel compare

evidence/2026-10-19/doomrevive-panel-primary.{json,md} (+ -before/-after .json.gz). Decision: **review_required** — small-sample wobble on both policies (community loss rate down on armed both roads; player deaths down; national up on lead). The panel is the instrument; the pre-registered thresholds are the judge (primary GO 0.638; engagement MISS 0.496).

## Wall numbers (every run)

Armed: national 9/16, table 11/16, wins 0/16, w4 11/16, w5 0/16, median 180d, max 180d.
Control: national 7/16, table 11/16, wins 0/16, w4 11/16, w5 0/16, median 154d, max 180d.
The wall stands (zero wins, wave-4 ceiling, pre-seat). This arm does not attack the wall — but the discipline is protective (+26d median survival) while cutting rot 36% on top of the governor.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned, all with the surplus governor watching the inflow on both sides. The armed twins serve doomed-only seconds at the fire — 239 fires across 482 glut nights, eating 689k kcal of food that would otherwise have rotted at dawn: 770k of P1 (no future sink) and 492k of measured P2-excess crossed the fire. Their pantries rot 36% less than their governed twins' (0.638x pooled) and they eat slightly more per person-day (1.005x) — the seconds are additive, not displacing, on every pooled measure. They live longer (median 180d vs 154d) and lose fewer villages to the long attrition.

Who thrives: villages that live long enough to meet their gluts and fire often — lead 7401 (101 fires, +36d, rot 0.91x), lead 7407 (+46d, rot 0.29x). Who dies: the early collapses (7405 both policies: 45d both sides, rot 0 — the mechanism never engages) and the seeds where the governor already keeps the pantry lean (belong 7406: 180d both sides, 0 glut nights — nothing doomed to eat).

Seed 7407 is the honest boundary: belong fires 33 times and rots 3.13x MORE than its twin while living 6 days longer — the better-fed village out-produces the drain through the share channel even with the governor trimming. The discipline treats the symptom; the governor treats the inflow; together they hold the line pooled (1.114x) but the per-pair backfire shape survives. That is the documented limit of the draw side.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-doomrevive-b.js, seed 7401 (top engagement: 101 fires on lead), 60d:

d47: "🍽️ Hector sees the Foraged food won't keep — seconds all round at the fire, before it turns."
d48: "🍽️ Hector sees the Aid from Thornfield won't keep — seconds all round at the fire, before it turns."

**PASS** — the line reads as a person making a sensible call (names the cook, the food, the reason); the repetition across the glut cluster is honest. No dev parenthetical, no lever-name leak. The cook-name rotation (whoever is on duty) keeps the whole village at the fire.

## Blanks filled / documented

- **FILLED (finding)**: the governor composition works — pooled share_surplus 1.114x ≤ 1.15 with the governor active both arms (vs +19% unguarded in doomeddraw-b). The production response is governed; the draw side keeps its rot cut (0.638x) on top.
- **FILLED (finding)**: the dose-aware starve-rate guardrail holds a second time (r=+0.05, pooled +5.5%) — the standing revision is validated on a second arm.
- **FILLED (finding)**: the discipline is protective at the median (+26d survival, dose-response +0.40) with eating intact (1.005x), laundering 0, no new death mode.
- **DOCUMENTED (parked)**: the arm is PARKED at pilot per §14 — primary 0.638x (PASS), ate 1.005x (PASS), dose-aware rate (PASS), survival +26d (PASS), production response 1.114x (PASS), laundering 0 (PASS), new-mode none (PASS) — but engagement misses 0.496 < 0.50 by 2 fires. The layer is preserved in the branch (scripts/policies/doomeddraw.js, separate PARKED commit) and NOT landed to master. Instruments + evidence landed.
- **DOCUMENTED (metric)**: the 50% engagement bar was calibrated on pre-governor fire rates; the governor mechanically increases legitimate stand-downs. See Metric review.
- **DOCUMENTED (infra)**: launcher-shell `&&`/`&` precedence race — `mkdir -p A && cd B && CMD > log &` backgrounds the whole chain, so sibling `CMD > log &` jobs raced the mkdir and 3 of 4 first-launch sweeps died on redirect. Relaunched individually with absolute paths; all 32 runs completed. (Lesson for the runbook: never chain `&&` into a `&` background job when siblings depend on the setup.)

## Metric review (§14)

- The primary (pooled rot/100d ≤ 0.80x) PASSED strongly (0.638) — and on top of the governor, which already suppresses the control baseline. The bar is sound.
- The engagement bar (fires ≥ 50% of glut nights) MISSED (0.4959). The gate's kill-fast purpose (mechanism visibility) is satisfied — 239 fires — but the letter misses by 2 fires. Proposed revision for the NEXT run: recalibrate for the governor-composed substrate (the governor shrinks piles → more legitimate stand-downs), or reframe the gate as visibility (fires > 0 with a minimum per-run count) rather than a fire-rate. The revision is for the next run, not this one.
- The ate/person-day guardrail (pooled ≥ 0.98x) PASSED (1.005). Sound.
- The dose-aware starve-rate guardrail PASSED (r=+0.05, pooled +5.5%). The standing revision is validated twice now — keep it.
- The production-response guardrail (pooled shareSurplus ≤ 1.15x) PASSED (1.114). The bar is sound; the composition is the finding.
- The survival guardrail (+26d ≥ −10d) PASSED with dose-response +0.40 protective. Sound.
- The new-death-mode guardrail (exposure-matched, ≥2 floor) PASSED (none). Sound.
- The laundering guardrail PASSED (0). Sound.
- §15 panel: built (review_required on small-sample wobble); the panel is the instrument, the pre-registered thresholds the judge.
- **Named next for the axis**: re-run the composed discipline under a recalibrated engagement bar (metric review revision), or accept the visibility reading. The layer is parked in the branch, proof-green and det-gate-green, awaiting the calibration call.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall-preseat.json --current '$HOME/workspace/sweep-tmp/sim-doomrevive-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
1 LOUD: "national swung 78%: baseline 9 -> current 16". The file-summing artifact (documented in sim-doomeddraw-b): the check sums control+armed (7+9=16 across 32 runs) against the 16-run baseline (9). Within-regime: control 7/16 vs baseline 9/16 (small-sample wobble); table control 11/16 vs 14/16 (wobble). No drift, not a bug.

## Convergence state

**parked with metric review** (NO-GO on the pre-registered engagement bar as written — 0.496 < 0.50 by 2 fires; the miss is calibration, not mechanism — see Metric review). The food-economy axis is not converged. The doomed-only draw discipline composed with the surplusfeed governor cuts rot 36% on top of the governor (0.638x pooled) with every guardrail green — the strongest composed result on the draw side.
