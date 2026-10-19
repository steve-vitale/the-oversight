# SIM-DOOMEDDRAW-B — the doomed-only draw discipline (arm sim-doomeddraw-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261019T0130Z · Worker tree: ~/workspace/worktrees/sim-doomeddraw-b
Axis: food-economy (scale-wall lens) — #558's remaining open half: the doomed-only draw discipline.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE sims)

- **Question**: the windfall line (racksanswer → windfallfeast2 → windfallcap → portionwindfall → windfallrev)
  proved a doomed-glut draw cuts rot but every variant died on meal-displacement or guardrail
  calibration; feastdraw-b's nightly seconds (0.864x, killed) could not reproduce its perverse
  dose-response in the prodrebound replay (0.501x on fresh seeds, NO rebound — the original's
  backfire is unrecoverable); sim-doomdraw-b's targeting discipline (doomed-first + 2-fresh-days
  reserve floor) died at pilot (0.929x, rot untracked by dose r=+0.03). Can a NIGHTLY draw
  DISCIPLINE — eating ONLY stock that will rot regardless, never displacing the nightly meal —
  cut rot without the volume levers' costs?
- **#570 injunction — RESOLVED, documented**: the injunction ("investigate the production rebound
  before any further draw/supply lever") is satisfied. sim-prodrebound-b DIAG-NO-GO mapped the
  mechanism: share_surplus is 84–88% of inflow and UNGOVERNED (structural, no pantry feedback),
  PRODTHROTTLE governs only the minor duty channels (saturated on glut); the feastdraw backfire
  did not reproduce (fidelity gate failed — replay 0.501x, dose-response +0.118 vs +0.73).
  sim-surplusfeed-b GO landed the inflow-side governor (surplusFeedGovernor, default-OFF,
  0.459x rot at confirm). This arm is a draw-DISCIPLINE, not another draw-side supply lever:
  it changes WHICH doomed stock is drawn and WHEN, adds no supply, and runs with the governor
  at its landed default (OFF both sides) so the comparison isolates the discipline.
- **Lever**: scripts/policies/doomeddraw.js (DOOMEDDRAW=1, default OFF; wraps leadfeast/belongfeast
  as leaddoomeddraw/belongdoomeddraw). After the normal nightly loop (wrapped Game.villageEats),
  the cook serves seconds from the ~2-day doomed window ONLY:
  P1 = bonus-inclusive (spoilDay+bonus)==day+1 — rots at tomorrow's dawn, before any meal or
  smoke duty can touch it (feastdraw-b canon pin: sweepSpoiled at dawn). No future sink.
  P2 = bonus-inclusive (spoilDay+bonus)==day+2 — drawn ONLY as measured excess beyond
  demonstrated sink clearance: p2excess = max(0, p2 − mealClear7 − smokeClear7), trailing-7d
  measured daily meal fresh-draw and cook smoke kcal (policy-side wraps); <3d history →
  p2excess = 0. Fresh sink per the rot-accounting split (finding #546): preserved/rendered/
  pemmican/bonded/spoiled excluded; foodState fresh/undefined/cleaned/cooked/smoked/dried all
  count — the pile matches what the primary counts as rot:fresh.
  Trigger: (p1+p2excess) > 200*roster (feastdraw's proven trigger). Cap: 400*roster/night.
  NO feast machinery: no feastDay, no buffs, no cadence reset, no trust/social effects.
  Engine's own pantryDraw (cook:true, exposure-rolled per villager — no laundering); hunger
  eased with the meal's own math; takes ledgers kept (v.takes + recordTakeHist); pantryKcal
  re-synced. EATING CODE UNTOUCHED. One honest voice line per fire night names the cook and
  the food — never the lever name.
- **Never-displace structural case**: (1) post-meal timing — the meal drew first, oldest-first;
  (2) P1 has no future sink by engine law; (3) P2 only as measured excess — food that will rot
  regardless; (4) hunger-eased portions self-limit; (5) ledgers kept, no feast buffs/politics
  (the trig6 enrich-confounds and the feast-side PRODTHROTTLE path are designed out).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); SURPLUSFEED unset
  (landed default OFF) both sides; base courtship policies only. 180d death-aware; dead villages
  stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **HORIZON WHY (§10)**: 180d — rot accumulates across the run; the reachability half (waves 4–5,
  national, table) needs the long window. Death-aware: dead villages stop.
- **SEEDS**: pilot 8 FRESH seeds 6561–6568 x {leaddoomeddraw, belongdoomeddraw} x {control, armed}
  = 32 runs, IDENTICAL seeds both sides, own in-sweep paired control. Freshness verified
  2026-10-18: no hits in scripts/sweep-*.js, scripts/test-*.js, evidence/2026-10-1[678]/sim-*.md.
  Used/banned before this run: 4201–4208, 4301–4308, 4401–4408, 4501–4508, 4601–4608,
  17011–17018, 4801–4808, 4811–4822, 4901–4908, 5111–5118, 5101–5108, 5601–5608, 6101–6108,
  6201–6208, 6301–6308, 6401–6408, 6551–6558, 6606, 6808, 7001–7008, 7101–7108, 7601–7608,
  9292–9295, 99101–99108, 9921–9928, 105101–105104.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days alive — pooled —
  armed <= 0.85x control (the axis standard bar).
- **ENGAGEMENT** (kill-fast): fires on >= 50% of doomed-glut nights (armed side; glut night =
  raw ~2-day doomed pile > 200*roster post-meal, counted whether or not the discipline fires —
  the discipline may correctly stand down when sinks clear the pile). Fires == 0 → mechanism
  invisible → KILL at pilot.
- **Guardrail (a) — eating intact**: pooled ate/person-day (villagerMealDay {ate} / calls)
  armed >= 0.99x control (pooled, not rate-gamed — the eating code is untouched; seconds add).
- **Guardrail (b) — dose-aware starvation rate** (the b2 revision; the 1.15x absolute bar is
  RETIRED): per-pair starveDays/100d RATE armed <= control x1.15, pairs with both alive >30d;
  0/0 passes; control-0/armed->0 counts as a fail (documented, not re-scored).
- **Guardrail (c) — median survival** >= control−10d.
- **Guardrail (d) — no new death mode** (the b2 revision): exposure-matched, ≥2 count floor —
  a cause counts only if ≥2 armed deaths AND each counted death occurred while its paired
  control twin was alive AND the cause is absent from the control cause set (thirst/dehydration
  canonicalized, dedup on (who,day,cause), person-kind only per #515/#517/#525/#544).
- **Guardrail (e) — laundering 0**, measured AT CONVERT TIME.
- **Det-gate**: wrapped+DOOMEDDRAW-unset byte-identical to base over 40d (2 seeds x 2 policies);
  wrapped==wrapped identical. PROOF GREEN before any sims (scripts/test-doomeddraw-b.js).
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js
  (scripts/build-doomeddraw-panels.js, cookbulk pattern: panels from the sweep's own per-seed
  JSONs), same 8 seeds x 180d, gate-off vs DOOMEDDRAW=1. Panel = instrument, thresholds = judge.
  Compare .md attached.
- **Diagnostics (not guardrails)**: PRODTHROTTLE engagement delta (no disengagement expected);
  share_surplus inflow delta (no rebound expected — governor OFF both sides, replay precedent);
  dose-responses Pearson(fires, survival delta) and Pearson(fires, log rot-ratio).
- **Telemetry**: node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall-preseat.json --current '<per-seed-glob>' --metrics
  national,table,wins,exiled. Investigate every LOUD (the winseat-regime artifact is documented).
- **Sense-testing**: read the seconds beats on the highest-engagement seed; prove sensical
  (SENSE-TESTING LAW); sample villager behavior — flag anything robotic.

## §14b pre-pilot substrate checklist (checked BEFORE the sweep)

1. **Contact**: the discipline fires iff (p1+p2excess) > 200*roster post-meal — i.e. glut nights.
   The engagement gate (>= 50% of glut nights) IS the contact probe; fires==0 kills as invisible.
2. **Pool sizing**: control rot/100d on this substrate ≈ 130–139k (prior arms). The 0.85x bar needs
   ≈ 20k/100d saved. P1 piles on glut nights run 5–10k; the replay-proven P1 shape saved ~50%
   on fresh seeds. The bar is the axis standard; the miss binds either way.
3. **Verb existence**: the discipline rides the engine's own pantryDraw + villageEats — both
   exist; the layer only offers doomed seconds post-meal.
4. **Horizon fit**: 180d death-aware contains the full rot accumulation and the reachability window.

## Instruments

- scripts/policies/doomeddraw.js — the layer (DOOMEDDRAW=1, default OFF).
- scripts/test-doomeddraw-b.js — proof (see Proof results).
- scripts/detgate-doomeddraw-b.js — gate-off byte-identity (see Det-gate).
- scripts/sweep-doomeddraw-b.js — 32 runs: rot:fresh vs rot:preserved (item-identity dedupe in
  sweepSpoiled), duty-time cook throughput + laundering at convert time, kind-aware deaths,
  starveDays (npcNeeds hunger>70), villagerMealDay {ate} (pooled ateSum/vdays), stockSurplus
  inflow, PRODTHROTTLE engagement, doomeddraw telemetry (ctx._dd*: nights/kcal/glutNights/rawSeen/p1/p2x).
- scripts/analyze-doomeddraw-b.js — aggregator with the pre-registered verdict.
- scripts/sense-doomeddraw-b.js — SENSE-TESTING LAW: top-engagement armed seed, seconds beats +
  talk sample + roster sample.
- scripts/build-doomeddraw-panels.js — §15 balanced-panel compare.

## Infrastructure note

- 2026-10-19 ~02:15 UTC: VM service restart mid-sweep wiped /tmp (killing all 4 first-launch
  sweep processes at ~15% completion) — the known /tmp-wipe failure mode. All work files live
  in ~/workspace and survived intact. Sweeps relaunched writing to
  ~/workspace/sweep-tmp/sim-doomeddraw-b/ (restart-safe); the first-launch partial logs are
  discarded, no partial JSONs were written (the sweep writes once at completion).

## Proof results (scripts/test-doomeddraw-b.js — run BEFORE any sims)

PROOF GREEN (45 checks, exit 0):
- RED gate-off: layer off; no villageEats wrap installed; no install marker;
  no `_dd*` ctx writes (base policy's own `knownAtStart` ctx key untouched);
  serveSeconds returns 0; no voice; no telemetry; villageEats delegates and
  still eats the doomed pile first (engine law intact).
- GREEN: trigger/cap constants pinned (200/400); P1 pile 12000 > trigger fires,
  draw ~= min(pile, 400*roster) within ceil-rounding slack, capped; voice said
  once naming the food, no lever-name leak; telemetry nights/kcal/glutNights/p1
  set; glut night counted.
- G2: pile below trigger → no fire, no voice, no glut-night count.
- G3 (the discipline): P2 10000 with demonstrated meal+smoke clearance 11000/d
  → STANDS DOWN (no fire) while the glut night is still counted.
- G4: P2 10000 with clearance 2500/d → fires on the excess, p2excess recorded.
- G5: <3d absorption history → P2 inert (P1 only) — the estimate is withheld,
  not guessed.
- G6: hunger eased with the meal's own math (never negative); v.takes ledger
  kept; recordTakeHist called; villagerFoodPoisoning exposure rolled per villager.
- G7 (finding #546): foodState-undefined stack counts in the fresh sink and is
  drawn — no laundering, real food.
- G8 determinism (identical fixtures → identical draw); G9 idempotent install
  (double setup wraps once).

## Det-gate (scripts/detgate-doomeddraw-b.js)

DET-GATE GREEN: 2 seeds (6561, 6562) x 2 policies (leaddoomeddraw,
belongdoomeddraw) x 40d — wrapped+DOOMEDDRAW-unset == base byte-identical on
all four, wrapped==wrapped identical. The env read draws no RNG and the
gate-off path installs zero wraps and writes zero ctx keys.

## Sweep results

### Pilot (32 runs: 8 seeds 6561–6568 x {leaddoomeddraw, belongdoomeddraw} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**, pooled) | 110,363k | 62,733k | **PASS** (ratio 0.568 ≤ 0.85) |
| fires / doomed-glut nights (engagement) | 0 / — | 663 / 749 | **PASS** (0.89 ≥ 0.50; fires ≫ 0) |
| doomed kcal eaten | — | 2,149k | (info; raw doomed-seen 6,868k) |
| P1 / P2-excess drawn | — | 2,276k / 3,650k | (info — the P2 discipline engaged) |
| median survival | 113d | 113d | **PASS** (−1d ≥ −10d) |
| ate/person-day (pooled) | 1885.9 | 1900.3 | **PASS** (1.008 ≥ 0.99) |
| per-pair starveDays/100d rate ≤ control×1.15 | — | 14/16 | **FAIL** (2 pairs) |
| laundered | 0 | 0 | **PASS** |
| new death mode (exposure-matched, ≥2 floor) | — | none | **PASS** |
| national | 9/16 | 6/16 | (info) |
| table | 11/16 | 12/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 12/16 | 9/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-doomeddraw-b/sweep-*.json

**Pilot verdict: NO-GO** (guardrail (b) — per-pair starveDays/100d rate — fails on 2/16 pairs
as pre-registered). Per §14, a miss is NO-GO, never re-scored. The arm is KILLED: layer deleted
zero-trace; evidence + instruments landed.

Dose-responses (the attribution autopsy):
- Pearson(fires, survival delta) = **+0.45** (n=16) — more fires associate with BETTER survival
  deltas (protective, same direction as portionwindfall's +0.63).
- Pearson(fires, log rot-ratio) = **+0.34** — modest perverse tilt on rot; driven by the
  highest-dose pair (lead 6564: 120 fires, rot 190k→435k = 2.29x, survival +60d).
- Pearson(fires, starve-rate delta) = **−0.18** — the hunger-rate deltas do NOT track mechanism
  dose. The two guardrail fails are unattributed to the mechanism.

Per-pair rot ratios (same-seed control vs armed):

| pair | rot C→A | ratio | fires | surv C→A | note |
|---|---|---|---|---|---|
| belong 6567 | 166k→8k | 0.05 | 23 | 180→102 | best rot; armed died combat d102 |
| belong 6565 | — | 0.06 | 46 | 179→120 | |
| belong 6562 | 3k→1k | 0.18 | 27 | 65→179 | rate FAIL (lifespan confound) |
| lead 6561 | — | 0.19 | 11 | 112→54 | |
| lead 6566 | — | 0.18 | 51 | 120→107 | |
| belong 6568 | — | 0.17 | 56 | 159→180 | |
| belong 6561 | — | 0.32 | 44 | 87→118 | |
| lead 6568 | — | 0.33 | 44 | 113→88 | |
| lead 6567 | — | 0.41 | 6 | 113→100 | |
| belong 6566 | — | 0.61 | 64 | 89→172 | |
| lead 6565 | — | 0.72 | 67 | 142→130 | |
| belong 6564 | — | 0.90 | 103 | 126→175 | |
| lead 6563 | 0→0 | 1.00 | 0 | 41→41 | early collapse both sides |
| belong 6563 | 0→0 | 1.00 | 0 | 35→35 | early collapse both sides |
| lead 6562 | — | 0.00 | 1 | 94→47 | rot ~0 both sides |
| lead 6564 | 190k→435k | 2.29 | 120 | 117→177 | backfire-shape: highest dose |

### The two guardrail misses, examined (metric review material)

**belong 6562** (rate 43.1→68.2): the control twin DIED at 65d (village-lost; deaths: monster,
wounds, sickness, one starvation d61); the armed twin lived to 179d (village-lost; deaths:
monster, sickness, wound, one starvation d53, then combat d84/85/107). The armed village lived
114 days longer through a combat-attrition era the control never reached. Neither twin's death
story is starvation — both died of violence/sickness. The rate compares a 65d collapse window
against a 179d full-life window: a lifespan confound, not meal displacement (pooled
ate/person-day ROSE; the village ate 59k doomed kcal as seconds).

**belong 6567** (rate 9.4→12.7): the control twin SURVIVED 180d (17 hunger-days); the armed twin
died in COMBAT at 102d (8 combat/ambush deaths, ZERO starvation deaths, 13 hunger-days).
The 3.3-point rate uptick is noise on a combat-death trajectory — the village that "failed"
the hunger guardrail never went hungry enough to lose anyone to hunger, while its rot fell
166k→8k (0.05x, the best pair).

Pooled starveDays/100d: control 18.1, armed 18.0 — identical. Median 18.2→13.0. The pooled
rate did not move; the dose correlation is −0.18 (unattributed). This is the portionwindfall
pattern one level down: the guardrail as written punishes lifespan/trajectory divergence,
not the displacement mechanism it was built to catch.

### The real side-effect (diagnostic, not a guardrail)

share_surplus inflow: control 5,521k → armed 6,591k (**+19% pooled**). PRODTHROTTLE engagement
is identical (0.748 → 0.746 — no disengagement). The discipline feeds villagers doomed seconds;
better-fed villagers produce more (villagerDayProduction scales with health); the ungoverned
share_surplus channel carries the extra inflow. On most seeds the direct rot-saving dominates
(pooled 0.568x), but the highest-dose pair (lead 6564, 120 fires) shows the shape: rot 2.29x
worse while survival improves +60d — the village out-produces the drain. This is the #570
production-response wearing a new hat: the landed surplusfeed governor (default-OFF) is the
inflow-side answer, and any future draw-discipline revival should compose it (or measure
share_surplus per villager-day to separate mechanism from trajectory composition).

### §15 balanced-panel compare

evidence/2026-10-18/doomeddraw-panel.{json,md} (+ -before/-after .json.gz). Decision:
**review_required** — driven by lead-side national/survival60 regression_watch (delta −0.25,
CI [−0.625, 0]) and small playerDeaths upticks. Small-sample wobble (n=8/policy), the same
pattern as the feastdraw and prodrebound panels. The panel is the instrument; the
pre-registered thresholds are the judge (primary GO 0.568; guardrail (b) NO-GO).

## Wall numbers (every run)

Armed: national 6/16, table 12/16, wins 0/16, w4 9/16, w5 0/16, median 113d, max 180d.
Control: national 9/16, table 11/16, wins 0/16, w4 12/16, w5 0/16, median 113d, max 180d.
The wall stands (zero wins, wave-4 ceiling, pre-seat). This arm does not attack the wall —
but it is the strongest rot cut measured on the draw side (0.568x pooled, vs feastdraw's
0.864x killed and the replay's 0.501x unregistered diagnostic).

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins serve doomed-only seconds at the fire —
663 fires across 749 glut nights (89% — the discipline fires when the pile is real and stands
down when the sinks can clear it), eating 2,149k kcal of doomed food: 2,276k of P1 (rots at
dawn, no future sink) and 3,650k of P2-excess (beyond demonstrated meal+smoke clearance).
Their pantries rot far less (0.568x pooled) and they eat slightly more per person-day (1.008x)
— the seconds are additive, not displacing, on every pooled measure.

Who thrives: villages that live long enough to meet their gluts — belong 6566 (+83d, 64 fires),
lead 6564 (+60d, 120 fires), belong 6564 (+49d, 103 fires). Who dies: the early collapses
(6563 both policies: 35-41d both sides, rot 0k — the mechanism never engages; the seeds
contribute nothing) and the combat seeds (6567: the armed twin dies in combat at 102d while
its rot falls 20x — the discipline worked, the spears didn't care).

Seed 6564 is the showcase of both the promise and the cost: leadfeast fires 120 doomed-draws,
the village lives 60 days longer — and rots 2.29x MORE (190k→435k), because the better-fed
village produces more surplus through the ungoverned share_surplus channel. The discipline
treats the symptom; the inflow answers. That is the honest boundary of the draw side.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-doomeddraw-b.js, seed 6564 (top engagement: 120 fires on lead), 60d:

d6: "🍽️ Owen sees the Foraged food won't keep — seconds all round at the fire, before it turns."
d11–d20: the same line nightly (Willie, Paisley, Luis, Diana rotate as the named cook) —
the glut cluster, the exact pattern the design targets. "Snared meat", "Expedition haul"
rotate in as the named food.

**PASS** — the line reads as a person making a sensible call (names the cook, the food, the
reason); the nightly repetition is honest (the glut persists across nights). No dev
parenthetical, no lever-name leak. The cook-name rotation (whoever is on duty) avoids the
portionwindfall subset-invitation fiction problem — the whole village is at the fire.

## Blanks filled / documented

- **FILLED (finding)**: the doomed-only draw discipline is the strongest ROT cut measured on
  the draw side — 0.568x pooled vs the 0.85x bar, with 663/749 engagement. The P2-excess
  machinery provably engaged (3,650k of P2-excess pile seen across fire nights alongside
  2,276k of P1 — the ~2-day window is real substrate, not decoration).
- **FILLED (finding)**: the discipline's never-displace structural case holds on every pooled
  measure — ate/person-day 1.008x, pooled starveDays/100d 18.1→18.0, median survival −1d,
  laundering 0, no new death mode. The nightly seconds are additive.
- **FILLED (finding)**: the production-response side-effect is real and measured — share_surplus
  +19% pooled with no throttle disengagement (0.748→0.746); the highest-dose pair shows rot
  2.29x worse alongside +60d survival. Any future draw-side work must compose the landed
  surplusfeed governor or measure per-villager-day production.
- **DOCUMENTED (killed)**: the arm is KILLED at pilot per §14 — primary 0.568x (PASS),
  engagement 0.89 (PASS), ate 1.008x (PASS), survival −1d (PASS), laundering 0 (PASS),
  new-mode none (PASS) — but guardrail (b) fails on 2/16 per-pair rates as written
  (belong 6562: lifespan confound 65d→179d; belong 6567: combat-trajectory noise, 0 starvation
  deaths). The misses are dose-unattributed (r=−0.18) and pooled-flat (18.1→18.0). Layer
  deleted zero-trace per kill protocol; instruments + evidence landed.
- **DOCUMENTED (metric)**: the per-pair starve-rate guardrail as written punishes
  lifespan/trajectory divergence, not displacement — see Metric review.
- **DOCUMENTED (infra)**: VM service restart ~02:15 UTC wiped /tmp mid-sweep (first launch
  killed at ~15%); sweeps relaunched to ~/workspace/sweep-tmp/sim-doomeddraw-b/ (restart-safe).

## Metric review (§14)

- The primary (pooled rot/100d ≤ 0.85x) PASSED strongly (0.568). The bar is sound; the
  discipline is the best-measured draw-side rot cut.
- The engagement bar (fires ≥ 50% of glut nights) PASSED (0.89). Counting glut nights whether
  or not the discipline fires correctly credits stand-downs — 86 stand-down nights where the
  pile was sink-clearable.
- The ate/person-day guardrail (pooled ≥ 0.99x) PASSED (1.008). Pooled, not rate-gamed — sound.
- The survival guardrail (−1d ≥ −10d) PASSED with dose-response +0.45 protective. Sound.
- The per-pair starveDays/100d RATE guardrail (≤ control ×1.15) FAILED on 2 pairs — but both
  fails are lifespan/trajectory artifacts with dose-correlation −0.18 and a pooled rate that
  did not move (18.1→18.0). Proposed revision for the NEXT run: gate the rate comparison on
  lifespan-similar pairs (|survival delta| ≤ 30d), or require dose-attribution
  (Pearson(fires, rate-delta) > +0.3) before a pair fail trips the guardrail, or judge
  starvation DEATHS per pair (the actual harm) instead of hunger-days (the noisy proxy).
  The revision is for the next run, not this one.
- The new-death-mode guardrail (exposure-matched, ≥2 floor) PASSED (none). The b2 revision
  is validated — no flavor-text trips this run.
- §15 panel: built (review_required on small-sample wobble); the panel is the instrument,
  the pre-registered thresholds the judge.
- **Named next for the axis**: the draw side is now 0-for-6 at pilot (feastdraw, windfall ×4
  variants counting portionwindfall's calibration kill, doomdraw targeting, doomeddraw
  discipline) — but this arm's 0.568x with a clean pooled profile suggests the side is not
  exhausted, only the guardrail calibration. A revival should (a) use the revised rate
  guardrail, (b) compose the landed surplusfeed governor to cap the +19% share_surplus
  response, and (c) pre-register the production-response as a diagnostic with a bar.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall-preseat.json
--current '~/workspace/sweep-tmp/sim-doomeddraw-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
2 LOUD: "national swung 67%: baseline 9 -> current 15" and "table swung 64%: baseline 14 -> current 23".
Both are the file-summing artifact: the check sums control+armed (32 runs) against the 16-run
baseline. Regime check on the control side alone: national 9/16 = baseline 9/16 exact;
table 11/16 vs 14/16 (small-sample wobble). No drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on pre-registered guardrail (b) — 2/16 per-pair starve-rate fails as
written; dose-unattributed, pooled-flat — see Metric review). The food-economy axis is not
converged. The doomed-only draw discipline is the strongest draw-side rot cut measured
(0.568x pooled, 663 fires, clean pooled profile) — killed on guardrail calibration, not on
the lever's economics; the metric review proposes the revision for its next run.
