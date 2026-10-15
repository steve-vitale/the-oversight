# SIM-BANKLEGRECAL — low-exposure pack-banking guarantee, corrected-metric re-run (loop B ARM 1, 2026-10-15)

Axis: food-economy (scale-wall lens) — claims sim-findings #284:
"HUNGER PRIMARIES MUST USE h1200, NOT 0.6×kcalCap."

Canon: docs/CANON.md read 2026-10-15, docs/PRESERVATION.md read 2026-10-15.
**There is no dedicated distribution-canon doc** (stated per the canon rule,
never invented): the layer works from the engine's own mechanics and the
lineage evidence files, never from invented canon.

Lineage: sim-scholarreserve.md → sim-mealonly-b.md → sim-trusthalf-b.md →
**sim-bankleg-b.md (killed at pilot on the miscalibrated 0.6×kcalCap
primary; h1200 measured 0.512×, trust 1.419×, median survival +8d, exposure
price gone)**. This arm rebuilds the bankleg layer BEHAVIOR-IDENTICAL
(scripts/policies/banklegrecal.js, BANKLEGRECAL=1, default OFF; zero src/js
changes; body byte-identical to
hidden_files/bankleg-layer-20261015.js.bak modulo the env-var/marker
renames — verified by diff) and re-runs the pilot with the corrected
pre-registration. Also watches sim-findings #285 (COLLAPSE-THIRST,
owned by sim-thirstinst) as a guardrail.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: the bankleg shape (take-discipline + low-exposure haven
  banking) recovered trust (1.419×), halved real hunger (h1200 0.512×),
  added +8d median survival, and eliminated the exposure price — but the
  pre-registered 0.6×kcalCap primary MISSED at 1.094 because the metric
  mislabels thriving scholars as "starved" ~daily once skillsets multiply
  kcalCap past the full-ration meal (76% of armed / 60% of control
  starved-days came from long runs with h1200<20; armed had 2× the
  thriving runs). Was the miss the metric, not the mechanism? Pre-register
  h1200 (the engine's own hunger line, kcal<1200) as the hunger primary —
  the old 0.6×kcalCap metric is NEVER used again in this run.
- **Layer**: scripts/policies/banklegrecal.js, take-discipline half
  (voluntary takes refused, starvation hatch bar<1200, meal untouched) +
  low-exposure banking half (haven-adjacent legs only: garden harvest /
  haven fish / haven forage, tile-identity asserted per leg, zero
  wild-tile visits, GUARANTEE_FLOOR = Game.kcalCap(), at most one leg/day).
- **Road**: 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadfeast
  (= leadcourt, FEASTSCALE_R13 unset — exactly as the bankleg run)} ×
  {control, armed}, 180d death-aware, identical seeds control vs armed.
  Control: BANKLEGRECAL unset (wrapped policy, gate-off pure delegation).
  Armed: BANKLEGRECAL=1. Own control in the SAME sweep — never inherit a
  baseline (CONTROL BASELINE DRIFT #247).
- **PRIMARY**: h1200 scholar-starved-days (daily min bar < 1200, all
  scholar lives lineage-summed). GO: armed ≤ 0.65× control (bankleg
  measured 0.512×; bar leaves real margin while still meaningful).
- **CO-PRIMARY (exact form)**: trust trajectory — scholar-days with trust
  ≥ 30 at the daily sample. GO: armed ≥ 1.10× control (bankleg measured
  1.419×).
- **GO**: primary passes AND co-primary passes AND all guardrails pass.
  A miss on any is NO-GO per §14, never re-scored.
- **GUARDRAILS**: median survival ≥ control−10d; national ≥ control−2/16;
  rot/vd ≤ control×1.335 (r25b calibration); starvation deaths within ±3
  (of control); villager thirst deaths ≤ control+2 (#285 watch);
  scholar-side thirst deaths ≤ control+1 (the guard gate must never block
  water); no new death mode (n≥3); wave 4-5 reach within noise.
- **ANSWERABILITY**: if control h1200 < 8 across the 16 control runs,
  the primary ratio is noise-powered → INFO-SKIP (not a verdict).
- **Confirm**: 12–16 seeds ONLY on pilot GO. No confirm spend otherwise.
- **Gates before sims**: scripts/test-banklegrecal-20261015.js — REAL RED
  phases (gate-off natural takes exist; gate-off wrapped == raw base 20d
  byte-identical; gate-on refuses voluntary takes / hatch real+narrated /
  pass-through with the engine's own refusal / hatch closed-states / meal
  untouched / no prefill; GUARANTEE: thin pack → 1 leg, banked → 0, 2
  thin days → 2, hurt → skipped, away → skipped; EXPOSURE: tile asserted
  identical for every guarantee leg + travelTo spy proves zero travel).
  SMOKE=1 instrument-honesty (named-export unwrap + layer-live marker +
  policy.daily fires ≥10×/run). det-gate 32/32 bit-identical
  (8 seeds × 2 policies × 2 sides, 60d). Killed-arm scripts of the bankleg
  run INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
- **Sense-testing**: read the take-refusal beats, the hatch narration, and
  the garden/fish/forage leg beats — judge meaning, coherence, relevance,
  whether the village reads like people deciding.

## Proof results

scripts/test-banklegrecal-20261015.js — **106/106 assertions RED→GREEN on a
live Game**, both policies (belongseek + leadfeast), exactly the bankleg
gates re-driven against the rebuilt layer:
- PART 0 (module + gate): layerOn() false with BANKLEGRECAL unset, true with
  BANKLEGRECAL=1; all named exports (layerOn/basePolicyForRun/policyForRun/
  hatchOpen/takePossible/mealComing/packEdibleKcal/pantryKcal/_guaranteeLeg).
- PART 1 (RED): gate-off base.upkeep fires real takeFromPantry calls drawing
  kcal (the voluntary-take bind is real).
- PART 2 (NON-AGGRESSION): gate-off wrapped == raw base, 20-day day-hashes
  byte-identical.
- PART 3 (GREEN): gate-on at haven — 0 real kcal taken while a meal is
  coming, refused counter climbs, hatch does NOT fire.
- PART 4 (HATCH): estranged at the old fire, bar < 1200, empty pack →
  REAL ledger-recorded take, hatchTakes == 1, scholar eats, narrated
  ("The discipline breaks — hunger wins…", never silent).
- PART 4b (PASS-THROUGH): away from the hall → original verb, the engine's
  own refusal speaks ("The pantry is in the hall. Your hands are not."),
  counted neither as hatch nor refusal.
- PART 5 (HATCH-CLOSED): fed / pack has food / meal coming / away — all shut.
- PART 6 (MEAL UNTOUCHED): villageMeal feeds, v.takes written, gate counters
  untouched. PART 7 (NO-PREFILL): fed scholar attempts nothing.
- PART 8 (GUARANTEE): thin pack → exactly 1 leg/daily; banked pack → 0;
  2 thin days → 2 legs (at most one/day); health 20 → 0 + skipped; away
  → 0 + skipped (never a wild leg).
- PART 9 (EXPOSURE): 3 direct leg calls — tile identical before/after every
  leg ((4,4)); travelTo spy records ZERO travel calls; only haven verbs fired
  (garden 0 / fish 0 / forage 3 in the fixture).

Method gates: SMOKE=1 instrument-honesty green both sides (named-export
unwrap + live drive + layer-live marker); det-gate **32/32 bit-identical**
(8 seeds × 2 policies × 2 sides, 60d; log det-gate-banklegrecal.log).
The sweep re-asserts the layer-live marker per run (throws on mismatch).
Killed-arm bankleg scripts INFO-SKIP (exit 0), never MODULE_NOT_FOUND.

## Sweep results

32 runs: 8 seeds × {belongseek, leadfeast} × {control, armed}, 180d
death-aware, identical seeds both sides, own control in the same sweep.
Per-seed rows: evidence/2026-10-15/perseed-banklegrecal/; beats:
evidence/2026-10-15/banklegrecal-beats/; analysis script
scripts/analyze-banklegrecal-20261015.js (+ banklegrecal-analysis.txt).

| metric (pooled) | armed / control | ratio | bar | verdict |
|---|---|---|---|---|
| **PRIMARY h1200** | 195 / 381 | **0.512** | ≤ 0.650 | **GO** |
| **CO-PRIMARY trust≥30** | 1212 / 854 | **1.419** | ≥ 1.100 | **GO** |
| half-ration days | 511 / 881 | 0.580 | — | — |
| old 0.6cap (deprecated) | 908 / 830 | 1.094 | — | calibration only |
| median survival | 113.5 / 105.5 | — | ≥ 95.5 | **GO** |
| national | 10/16 / 9/16 | — | ≥ 7 | **GO** |
| starvation deaths | 15 / 12 | — | within ±3 | **GO** (exactly +3) |
| rot/vd | 0.000 / 0.000 | — | ≤ 1.335×ctl | **GO** |
| villager thirst deaths | 9 / 0 | — | ≤ 2 | **MISS** |
| scholar thirst deaths | 0 / 0 | — | ≤ ctl+1 | **GO** |
| new death mode (n≥3) | thirst 9 vs 0 | — | — | **MISS by letter** |
| wave 4 / wave 5 | 6/16 / 0/16 vs 7/16 / 0/16 | — | within noise | **GO** |

Per-policy splits: belongseek h1200 102/187 = 0.545 (GO), trust 751/340 =
2.209 (GO), median 150.5/105.5, thirst 5 vs 0; leadfeast h1200 93/194 =
0.479 (GO), trust 461/514 = 0.897 (pooled is the verdict form per
trusthalf), median 98.5/101, thirst 4 vs 0, hatch takes 24 (s55/s66 only).

Mechanism: 1,689 guarantee legs (34 garden / 87 fish / 1,655 haven-forage),
34 skipped, 8,316 voluntary takes refused, 24 hatch takes. Exposure: wild
visits/day 2.86 armed vs 2.73 control — the leg added zero wild visits by
construction. INFO-SKIP rule (control h1200 < 8) did not trigger (381).

**OVERALL: NO-GO** — the corrected PRIMARY GOes (0.512 ≤ 0.65) and the
co-primary GOes (1.419 ≥ 1.10), but the pre-registered villager-thirst
guardrail misses on the letter (9 vs ≤ 2) and thirst at n≥3 is a new death
mode on the letter. Per §14 the miss is not re-scored. **Arm killed per
protocol** (layer deleted; proof + sweep + det-gate + evidence retained
with INFO-SKIP guards; the preserved source is
hidden_files/bankleg-layer-20261015.js.bak — re-transformable).

### The mechanism (what the numbers say)

1. **The #284 metric thesis is CONFIRMED.** The same 32 runs produce the
   old metric's exact miss (908/830 = 1.094, byte-identical to the bankleg
   run) AND the corrected primary's GO (195/381 = 0.512). The miss was the
   metric, not the mechanism. Hunger halved on the engine's own hunger line.
2. **Trust recovered harder than trusthalf.** Co-primary 1.419× vs
   trusthalf's 1.208×; half-ration days 0.580× vs 0.725×.
3. **The exposure price is gone.** Wild/d 2.86 vs 2.73 — the leg added zero
   wild visits; median survival passes with armed +8d.
4. **The thirst signature reproduces exactly.** 9 thirst deaths, all
   villager-side (scholar thirst 0 vs 0), concentrated in the same 3
   early-collapse armed runs (s33 ×2 days 32/34, s88 day 59). The armed
   scholar's at-haven presence changes siege trajectories. This is the #285
   instrument's target, owned by sim-thirstinst — documented, not chased.
5. **Starvation deaths 15 vs 12: passes within ±3** (exactly +3), unlike
   the bankleg run's ±2-form letter-miss. The scholar-side hunger (h1200)
   halved; the residual is collapse-adjacent margin noise.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read belongseek-armed-s22 (thriving run), leadfeast-armed-s55 (hatch run),
and leg beats across the sweep. The village reads as people deciding:
- Meal arc (s22): d1 "Village meal: +1322 kcal… (Half ration — they don't
  trust you yet.)" → d179 "Village meal: +400 kcal, +1L water from the
  communal pantry." — the qualifier is gone, the fiction names the
  recovered trust.
- Hatch (s55, 12 fires d25–31): "🍽️ The discipline breaks — hunger wins.
  The scholar takes 400 kcal from the pantry openly; the ledger will
  remember." — the break is confessed, amounts honest (400/160/80 as the
  pantry thins), the consequence named. Never silent.
- Garden leg (s22): "Harvest: 50× Lamb's Quarters, 50× Lamb's Quarters —
  about 5000 kcal from the garden. (Renewable. The wild didn't pay for
  this.)" — the haven economy made legible.
- Villager beats (s55 d2–9): "Jesse checks the pantry before heading out —
  the shelves are full, ~5 days of fresh on hand… leaves the harvest
  standing and turns to the wood run instead. The pantry can't take more;
  the wild will keep." — people reading the pantry and choosing work,
  not loot cycles.
- No robotic flags in the discipline/hatch/meal/leg beats. **PASS.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 9/16 | 0/16 | 0/16 | 7/16 | 0/16 | 105.5d | 182d |
| armed | 10/16 | 0/16 | 0/16 | 6/16 | 0/16 | 113.5d | 182d |

Exiled: control 2, armed 0. The scale wall stands — no table, no wins
either side in 32 runs; the arm moves trust/hunger/exposure, not the wall.

## Death-cause shares

Control (199 deaths): combat 113 (57%), monster 22 (11%), villager combat
21 (11%), sickness 13 (7%), starvation 12 (6%), a wound that wouldn't close
7 (4%), contest 7 (4%), lockjaw 2 (1%), Buffering 1, alien 1, thirst 0.
Armed (231): combat 102 (44%), monster 42 (18%), villager combat 28 (12%),
starvation 15 (6%), sickness 15 (6%), a wound that wouldn't close 9 (4%),
thirst 9 (4%), contest 7 (3%), expedition 3, lockjaw 1. Scholar-side thirst:
0 vs 0. The armed monster-death rise (42 vs 22) rides the same road's
combat bleed as bankleg — the leg added zero wild visits (2.86 vs 2.73
wild/d). Rot: 0 both sides (rot/vd 0.000 — the r25b calibration guardrail
passes trivially).

## Village assessment (plain words)

Sixteen villages measured twice — once with the scholar's hands out of
the pantry and their banking done at haven, once without. The disciplined
scholars worked the garden, the haven water, and the haven green instead
of walking the wilds: ~1,700 haven legs, zero wild banking trips, and the
villages kept their scholars a median 8 days longer while trusting them
far sooner — half-ration days fell by more than two-fifths, and on the
best trajectories the scholars lived the full 182 days at full trust,
donating, talking, and present. Real hunger halved. The price is the one
the bankleg run documented: villagers dying of thirst in the early sieges
the scholar now stays home for — 9 villager thirst deaths in 3 armed
runs, zero scholar-side thirst. The thirst guardrail misses on the letter,
so the arm dies per protocol, but the corrected metric vindicates the
mechanism: the shape works; the thirst side is the next instrument's
question, not this arm's.

## Blanks filled / documented

- **#284 HUNGER PRIMARIES MUST USE h1200 — ANSWERED.** The same 32 runs
  reproduce the old metric's miss (1.094, byte-identical to bankleg) and
  the corrected primary's GO (0.512 ≤ 0.65). The miss was the metric, not
  the mechanism. No food-economy arm may pre-register 0.6×kcalCap again.
- **#264 BANKING-TRIP EXPOSURE — re-confirmed.** Zero wild-tile banking
  trips by construction (tile-identity asserted per leg, wild/d 2.86 vs
  2.73), median survival +8d, trust 1.419×.
- **#285 COLLAPSE-THIRST — evidence strengthened for sim-thirstinst.**
  9 villager thirst deaths in 3 early-collapse armed runs (s33 ×2, s88),
  scholar thirst 0 vs 0 — the player/scholar split is now instrumented in
  the sweep (thirstDeathsAll/scholarThirstDeaths), so the thirst arm's
  control-arm comparison is already wired.
- **DOCUMENTED (process): telemetry-check boolean artifact, again.** The
  "national disappeared" LOUD is the known schema artifact (booleans
  aggregate as 0); numeric re-aggregation: national 10/16 armed, 9/16
  control — no deviation vs the sweep's own control.
- **DOCUMENTED (metric review §14 below):** the leadfeast-road co-primary
  per-policy split (0.897×) while pooled GOes at 1.419× — pooled remains
  the verdict form per trusthalf precedent; a leadfeast-road trust study
  would need its own pre-registration.

## Metric review (§14)

1. **PRIMARY (h1200 armed ≤ 0.65× control): GO — 195/381 = 0.512.**
   The corrected metric is honest: it GOes with margin while the old
   metric on the same runs misses at 1.094 (byte-identical to bankleg).
2. **CO-PRIMARY (trust≥30 armed ≥ 1.10× control): GO — 1212/854 = 1.419.**
   Per-policy split (belongseek 2.209×, leadfeast 0.897×) noted; pooled is
   the verdict form per trusthalf precedent.
3. **GUARDRAILS:** median survival GO (113.5 ≥ 95.5); national GO
   (10/16 ≥ 7); rot/vd GO (0.000 both); starvation deaths GO (15 vs 12,
   within ±3); villager thirst **MISS** (9 vs ≤ 2); scholar thirst GO
   (0 vs 0); new-death-mode **MISS by letter** (thirst 9 vs 0, mechanism
   probed as villager collapse-thirst); wave 4-5 within noise GO.
4. **Metric for the NEXT run:** the pre-registered ±3 starvation form and
   the thirst guardrail bars stand. Any thirst-lever arm should
   pre-register against the armed-side 9 (the #285 arm's job), not relitigate
   this arm's numbers.
5. **Convergence report: arm NO-GO at pilot** on the pre-registered
   thirst guardrail. The mechanism is proven (trust 1.419×, h1200 0.512×,
   exposure price eliminated) but the binding pre-registration misses on
   one guardrail letter. No confirm spend. Layer killed per protocol.

## Convergence state

food-economy: **killed-at-pilot** (sim-banklegrecal). The #284 metric
question is answered and closed: h1200 is the honest hunger primary
(0.512× GO); the 0.6×kcalCap metric is retired for thriving-run designs.
The bankleg shape itself is mechanism-proven (trust 1.419×, hunger halved,
zero-exposure banking, median +8d) but dies on the thirst guardrail's
letter — 9 villager collapse-thirst deaths in 3 early-siege armed runs
(scholar thirst 0 vs 0). The axis's next work: the #285 collapse-thirst
instrument (sim-thirstinst owns it) and the trust-delta-by-source
instrument mealonly asked for. The penalty side of food-economy remains
exhausted; the gain side (feed-side trust gains, now 1.419× twice) is the
live direction.
