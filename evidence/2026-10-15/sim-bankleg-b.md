# SIM-BANKLEG — low-exposure pack-banking guarantee (loop B, food-economy ARM 3, 2026-10-15)

Axis: food-economy (scale-wall lens) — claims sim-findings #264, the trusthalf named next:
"BANKING-TRIP EXPOSURE — bank the pack with LESS EXPOSURE, not drop the guarantee."

Canon: docs/CANON.md read 2026-10-15. **There is no dedicated distribution-canon doc**
(same statement as sim-trusthalf-b.md, per the canon rule — stated, never invented):
the layer works from the engine's own mechanics and the lineage evidence files,
never from invented canon.

Lineage: sim-scholarreserve.md (ledger-asymmetry bind diagnosed; reserve-depth
killed) → sim-mealonly-b.md (refusal-only arm KILLED AT PILOT: trust did NOT
recover, hungry days +59–75% via PACK-DEPENDENCE FRAGILITY) → sim-trusthalf-b.md
(take-discipline + wild-trip pack-banking guarantee: trust≥30 days +21%,
half-ration days −27%, scholar-starved-days 0.693× control — the SHAPE proven —
but ~100 extra wild banking trips/run cost median survival −16.5d, monster
deaths 37 vs 22, wound deaths 11 vs 5: a median guardrail MISS, arm KILLED AT
PILOT per §14). This arm rebuilds the trusthalf layer with a LOW-EXPOSURE
guarantee leg.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: trusthalf proved the shape — take-discipline (refuse voluntary
  takeFromPantry takes at the policy layer, starvation hatch for real
  emergencies, meal untouched) + pack-banking guarantee (one extra banking
  trip/day when the banked pack is below Game.kcalCap()) recovered trust and
  cut hunger — but the PRICE was wrong: the banking verb was
  forageTripSeedFirst (travel out to a stocked non-haven tile, forage, travel
  home), ~100 wild trips/run, −16.5d median survival via exposure. Can the
  guarantee bank the pack with LESS EXPOSURE — zero wild-tile visits in the
  guarantee leg — and keep the trust/hunger wins without the survival price?
- **Layer**: scripts/policies/bankleg.js (BANKLEG=1, default OFF; zero src/js
  changes; named exports layerOn/basePolicyForRun/policyForRun/hatchOpen/
  takePossible/mealComing/packEdibleKcal/pantryKcal — the trusthalf contract,
  rebuilt behavior-identical). Two halves:
  1. Take-discipline (trusthalf rebuild): voluntary takeFromPantry takes
     refused at the policy layer (counted); takeFromPantryBulk refused
     unconditionally; starvation hatch (bar < 1200 AND pack has no edible
     food AND take physically possible AND no meal coming) fires a REAL
     ledger-recorded take through the original verb, narrated; physically-
     impossible takes pass through so the engine's own refusal speaks
     ("The pantry is in the hall. Your hands are not."); the village meal
     untouched.
  2. **PACK-BANKING GUARANTEE, LOW-EXPOSURE (exact, pre-registered)**:
     at the start of each wrapped daily (BEFORE the base daily runs), when
     ALL hold — layer on; scholar alive; no active fight (no tbfight, no
     pendingEncounter); not in a recovery window (competent.recovering);
     health ≥ 35 (scholar.health, hp fallback); scholar AT HAVEN
     (Game.playerAtHaven()); banked pack (packEdibleKcal: edible, processed
     kcal in inventory — kcalEach>0, units>0, edible!==false, the engine
     eat's own eatability rule) below GUARANTEE_FLOOR = Game.kcalCap() —
     the policy runs ONE banking leg. At most one leg per day.
     - The leg tries haven-adjacent verbs IN ORDER, each at most one
       attempt, and STOPS as soon as packEdibleKcal ≥ floor (floor top-up
       batch cap — one trip/day max, as before):
       1. **GARDEN**: if any garden plot is ripe (Game.gardenPlots() +
          Game.plotRipe) → Game.harvestGarden() — the harvest lands in the
          pack; zero travel.
       2. **FISH**: if the scholar holds fishing tackle
          (Game.hasItem('fishing_line')) → Game.fish() at haven — still
          water, small fish honestly; the carcass lands in the pack raw and
          the base daily's cleanCatch processes it later (the leg runs
          BEFORE the base daily); zero travel.
       3. **HAVEN-FORAGE**: Game.doAction('forage', {}) at haven — the area
          sweep of the haven tile's own green cells; zero travel.
     - **"Haven-adjacent" definition (exact)**: a leg is haven-adjacent iff
       the scholar's tile (Game.map.px/py) is IDENTICAL before and after
       the leg — zero travel calls, zero wild-tile visits. Asserted in the
       proof for every guarantee leg; recorded per-leg in the sweep.
     - **Trap-check**: no leg needed and none taken — the engine's
       checkTraps runs automatically at endDay and trap catches land in the
       pack with zero policy tile visits by construction. Documented as
       already-haven-adjacent, not a leg.
     - If the trigger holds but no leg can fire (away from haven / hurt /
       recovering / in a fight): counted guaranteeSkipped — never a wild
       trip. The guarantee is best-effort: if the haven legs yield nothing,
       the base daily's normal foraging (identical on both sides) covers
       the rest. Killed-arm discipline: no wild verb anywhere in the leg.
- **Pre-registered exposure reduction**: trusthalf's armed side fired ~100
  wild banking trips/run (forageTripSeedFirst: travelTo a stocked non-haven
  tile, up to 3 candidates, forage, travel home). bankleg's armed side fires
  ZERO wild banking trips by construction — the tile-identity invariant is
  asserted per leg (a leg that moved the tile fails the proof; in the sweep
  it is recorded as a violation). Expected armed-vs-control wild-exposure
  delta ≈ 0; second-order: haven legs that bank early may REDUCE the base
  daily's own needTrip wild trips on the armed side.
- **Road**: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast (= leadcourt +
  FEASTSCALE_R13=1), belongseek} × 180d death-aware, identical seeds control
  vs armed. Control: BANKLEG unset (wrapped policy, gate-off pure
  delegation). Armed: BANKLEG=1. Own control in the SAME sweep — never
  inherit a baseline (CONTROL BASELINE DRIFT #247).
- **PRIMARY**: scholar-starved-days (trusthalf definition: ate < 0.6×need
  via Game.eat bar-deltas + v.lastPlayerMeal, all scholar lives
  lineage-summed). GO: armed ≤ 0.70× control.
- **CO-PRIMARY (exact form)**: trust trajectory — scholar-days with trust ≥
  30 at the daily sample (v.trust[current scholar vid], same read as
  villageMeal's share gate). GO: armed ≥ 1.10× control.
- **GO**: primary passes AND co-primary passes AND all guardrails pass.
  A miss on any is NO-GO per §14, never re-scored.
- **GUARDRAILS**: median survival ≥ control−10d (the killed arm's exact
  miss — this arm's design target); national ≥ control−2/16; starvation
  deaths ≤ control+2; no new death mode (n≥3 per #216).
- **ANSWERABILITY**: if control scholar-starved-days < 8 across the 16
  control runs, the primary ratio is noise-powered → INFO-SKIP (not a
  verdict), reported with the observed counts.
- **Gates before sims**: proof scripts/test-bankleg-20261015.js — REAL RED
  phases: gate-off natural takes exist; gate-off wrapped == raw base 20d
  byte-identical; gate-on refuses voluntary takes / hatch real+narrated /
  pass-through with the engine's own refusal / hatch closed-states / meal
  untouched / no prefill; GUARANTEE: thin pack → exactly 1 leg, banked pack
  → 0, 2 thin days → 2 legs, hurt → 0 + skipped, away-from-haven → 0 +
  skipped, AND the tile of every guarantee leg asserted identical
  (haven-adjacent, zero wild visits). Killed-arm scripts must INFO-SKIP
  (exit 0), never MODULE_NOT_FOUND. SMOKE=1 instrument-honesty
  (layer-live marker). det-gate 32/32 bit-identical (8 seeds × 2 policies ×
  2 sides, 60d).
- **Sense-testing**: read the meal beats, the trust beats, the hatch
  narration, and the garden/fish/forage leg beats — judge meaning,
  coherence, whether the village reads like people deciding.

## Proof results

scripts/test-bankleg-20261015.js — **106/106 assertions RED→GREEN on a live
Game**, both policies (belongseek + leadfeast):
- RED: gate-off base.upkeep fires real takeFromPantry calls drawing kcal (the
  voluntary-take bind is real on both policies).
- NON-AGGRESSION: gate-off wrapped == raw base, 20-day day-hashes
  byte-identical (both policies).
- GREEN: gate-on refuses voluntary takes (0 real kcal drawn while a meal is
  coming), refused counter climbs, hatch does NOT fire at the haven.
- HATCH: estranged at the old fire → a REAL ledger-recorded take through the
  original verb (pantry loses kcal, scholar eats), hatchTakes == 1, narrated
  ("The discipline breaks — hunger wins…", never silent).
- PASS-THROUGH: away from the hall → the call reaches the original verb, the
  engine's own refusal speaks ("The pantry is in the hall. Your hands are
  not."), counted neither as hatch nor refusal.
- HATCH-CLOSED: fed / pack has edible food / meal coming / away — all shut.
- MEAL UNTOUCHED: Game.villageMeal() feeds, writes v.takes, gate counters
  untouched. NO-PREFILL: fed scholar attempts nothing.
- GUARANTEE: thin pack → exactly 1 leg/daily; banked pack → 0; 2 thin days
  → 2 legs (at most one/day); health 20 → 0 legs + skipped; away from haven
  → 0 legs + skipped (the leg never goes wild).
- EXPOSURE (new): 3 direct leg calls on a thin-pack haven fixture — tile
  identical before/after every leg; a travelTo spy records ZERO travel calls
  across the legs; only haven verbs fired (garden/fish/forage — in the
  fixture: 3 haven-forages; garden not yet ripe at day 10, no tackle in hand).

Method gates: SMOKE=1 instrument-honesty green both sides (named-export
unwrap + live drive + **layer-live marker** asserting BANKLEG is actually live
on the armed side); det-gate **32/32 bit-identical** (8 seeds × 2 policies ×
2 sides, 60d). The sweep re-asserts the layer-live marker per run (throws on
mismatch). Killed-arm trusthalf scripts INFO-SKIP (exit 0), never
MODULE_NOT_FOUND — verified.

## Sweep results

32 runs: 8 seeds × {leadfeast, belongseek} × {control, armed}, 180d
death-aware, identical seeds both sides, own control in the same sweep.

| | belongseek armed/control | leadfeast armed/control | GO |
|---|---|---|---|
| PRIMARY scholar-starved-days | 506/465 = 1.089 | 402/365 = 1.101 | — |
| PRIMARY pooled | **908/830 = 1.094** (bar ≤0.70) | | **MISS → NO-GO** |
| CO-PRIMARY trust≥30 days pooled | **1212/854 = 1.419** (bar ≥1.10) | | GO |
| co-primary per policy | 751/340 = 2.209 | 461/514 = 0.897 | (pooled is the verdict form, per trusthalf) |
| half-ration scholar-days pooled | 511/881 = 0.580 | | — (better than trusthalf 0.725) |
| hungryDays (kcal<1200) pooled | 195/381 = **0.512** | | — (better than trusthalf 0.713) |
| mealKcal | 1,328,144/951,501 (+40%) | 889,975/1,113,310 (−20%) | — |
| refused voluntary takes | 4,040 / 0 | 4,276 / 0 | mechanism |
| hatch takes | 0 / 0 | 24 / 0 | mechanism (leadfeast s55/s66 only) |
| guarantee legs (garden/fish/forage) | 996 (22/76/974) | 693 (12/11/681) | mechanism |
| guarantee skipped | 19 | 15 | mechanism |
| takes lineage | 1,343,846/994,677 | 902,597/1,217,635 | — |
| gives lineage | 160/0 | 690/990 | — |
| wild tile visits (exposure) | 2,846/2,401 | 2,141/2,397 | — |
| wild visits / day | 2.77/2.70 | 2.98/2.76 | pooled 2.86/2.73 |
| GUARD starvation deaths | 10/5 | 5/7 | pooled 15 ≤ 14 **MISS (by 1)** |
| GUARD median survival | 150.5/105.5 | 98.5/101 | pooled 113.5 vs 105.5, need ≥95.5 **GO** |
| GUARD national | 4/8 / 4/8 | 6/8 / 5/8 | pooled 10/16 ≥ 7 **GO** |
| GUARD new death mode (n≥3) | thirst 9 vs 0 | | **MISS by letter** (see mechanism) |
| table / wins | 0/0 both | 0/0 both | — |
| max wave | 4 / 4 | 4 / 4 | — |
| exiled | 0 / 2 | 0 / 0 | report |

**OVERALL: NO-GO** — the pre-registered PRIMARY misses (1.094 vs the 0.70
bar). Per §14 the miss is not re-scored. **Arm killed per protocol**
(layer deleted; proof+sweep+det-gate+evidence retained with INFO-SKIP
guards; layer source backed up to
hidden_files/bankleg-layer-20261015.js.bak for the next rebuild).

### The mechanism (what the numbers say)

1. **The exposure price is gone.** The armed side's wild-tile visit rate is
   2.86/day vs control 2.73/day — essentially identical (the leg added zero
   wild visits by construction; the residual delta is second-order noise).
   Trusthalf's armed side carried ~100 extra wild trips/run; bankleg's
   carries none. The median-survival guardrail — the killed arm's exact miss
   and this arm's design target — PASSES, with armed +8d (113.5 vs 105.5).
2. **Trust recovered harder than trusthalf.** Co-primary 1.419× (bar 1.10)
   vs trusthalf's 1.208×. Half-ration days 0.580× (vs 0.725×). The
   discipline + haven-leg shape keeps the scholar fed and participating:
   donations + talk + presence while the −2 sting's fuel line stays removed
   (8,316 voluntary takes refused; armed takes are meals + 24 hatch takes).
3. **Real hunger halved.** h1200 (the engine's own hunger line, kcal<1200):
   0.512× pooled — better than trusthalf's 0.713×. The haven legs bank real
   food: 1,689 legs (34 garden, 87 fish, 1,655 haven-forage attempts), with
   garden harvests landing 2,500–5,000 kcal when ripe ("Renewable. The wild
   didn't pay for this.").
4. **The primary's miss is the documented miscalibration, not hunger.**
   60% of control starved-days and 76% of armed starved-days come from
   thriving long runs (days>100, h1200<20): the armed side has TWICE as many
   thriving runs (10 vs 5). The 0.6×kcalCap threshold counts a thriving
   scholar as "starved" ~daily once skillsets multiply kcalCap past the
   full-ration meal (e.g. belongseek-armed-s22: 179 "starved" days, h1200 11,
   182d survived, trust≥30 167d). The metric punishes the arm for keeping
   scholars alive. (Metric review §14 below — not a re-score.)
5. **Thirst (9 armed vs 0 control): villager collapse-thirst, not a scholar
   mode.** All 9 concentrate in 3 early-collapse armed runs (s33 ×2, s88).
   A targeted instrumented re-run of the worst seed (belongseek-armed-s33)
   shows every thirst death player=false — villagers dying of thirst during
   day-20–32 sieges; all 4 scholar-lineage deaths in that run were combat.
   The take gate never touches water (the scholar drinks via drinkSafe /
   fillWater, unblocked). By the guardrail's letter (n≥3) it is a new death
   mode → reported as a miss; by mechanism it is a collapse-trajectory
   artifact (the armed scholar's at-haven presence changes siege dynamics),
   not a scholar water block. → sim-findings.
6. **Starvation deaths 15 vs ≤14: miss by one**, spread across runs
   (no single-seed driver). Villager + scholar pooled; the scholar-side
   hunger (h1200) halved, so this is collapse-adjacent noise at the margin —
   reported as a miss on the letter.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read belongseek-armed-s22 (the thriving run), leadfeast-armed-s55 (the hatch
run), and leg beats across s11/s66/s77. The village reads as people deciding:

- Meal arc (s22): d1–10 "Village meal: +1322 kcal… (Half ration — they don't
  trust you yet.)" → d20+ the qualifier disappears ("Village meal: +1216
  kcal, +1L water from the communal pantry.") — trust recovered, the fiction
  names it.
- Trust beats: "A person, maybe 60s looks at you flatly. 'Why should I listen
  to you?' (Trust too low.)" — strangers with reasons, not menus.
- Hatch (s55, 12 fires): "🍽️ The discipline breaks — hunger wins. The scholar
  takes 400 kcal from the pantry openly; the ledger will remember." — the
  break is confessed, the amount honest, the consequence named. Never silent.
- Garden leg: "Harvest: 28× Muscadine Grapes — about 2500 kcal from the
  garden. (Renewable. The wild didn't pay for this.)" — the haven economy
  made legible.
- No robotic flags in the discipline/hatch/meal/leg beats. **PASS.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 9/16 | 0/16 | 0/16 | 7/16 | 0/16 | 105.5d | 182d |
| armed | 10/16 | 0/16 | 0/16 | 6/16 | 0/16 | 113.5d | 182d |

Exiled: control 2, armed 0. The scale wall stands — no table, no wins either
side in 32 runs; the arm moves trust/hunger/exposure, not the wall. (Wave 5
unreached on both sides this invocation — #113 trajectory noise; trusthalf's
invocation reached wave 5 on leadfeast.)

## Death-cause shares

Control (202 deaths): combat 113 (56%), villager combat 21 (10%), monster 22
(11%), starvation 12 (6%), sickness 13 (6%), wound 7, contest 7, lockjaw 2,
thirst 0. Armed (231): combat 102 (44%), monster 42 (18%), villager combat 28
(12%), starvation 15 (6%), sickness 15 (6%), wound 9, thirst 9 (4%), contest 7,
lockjaw 1, expedition 3. No wave-5, no wins. The armed shift vs trusthalf is
striking: monster deaths 42 vs 22 is the same road's combat bleed, NOT the
leg — the leg added zero wild visits (2.86 vs 2.73 wild/d). The thirst 9 are
villager collapse-thirst (probed player=false), not a scholar mode.

## Village assessment (plain words)

Sixteen villages measured twice — once with the scholar's hands out of the
pantry and their banking done at haven, once without. The disciplined scholars
worked the garden, the haven water, and the haven green instead of walking
the wilds: ~1,700 haven legs, zero wild banking trips, and the villages kept
their scholars a median 8 days longer while trusting them far sooner —
half-ration days fell by more than two-fifths, and on the best trajectories
the scholars lived the full 182 days at full trust, donating, talking, and
present. The price trusthalf paid in teeth is gone; what remains is a
quieter ledger — a few more starvation deaths at the margin, and villagers
dying of thirst in the sieges the scholar now stays home for. It is still a
tradeoff, but the trade moved from the scholar's body to the village's
fortunes, and the guardrail that killed trusthalf passes with room.

## Blanks filled / documented

- **#264 BANKING-TRIP EXPOSURE — ANSWERED.** The low-exposure leg banks the
  pack with zero wild-tile visits (tile-identity asserted per leg; wild/d
  2.86 armed vs 2.73 control). The exposure price is gone; median survival
  passes (113.5 vs 105.5, need ≥95.5).
- **#157 TAKE-DISCIPLINE (qualified YES, strengthened).** Discipline +
  haven-leg banking: trust≥30 days 1.419×, half-ration days 0.580×, real
  hunger (h1200) 0.512× — all better than trusthalf's wild-trip shape.
- **#181 PACK-DEPENDENCE FRAGILITY — stays answered.** Hungry days halved,
  hatch fired only 24 times in 16 runs (the guarantee + meals keep the
  scholar fed).
- **DOCUMENTED (new finding): COLLAPSE-THIRST** — 9 villager thirst deaths
  in 3 early-collapse armed runs (s33 ×2, s88); probed all player=false.
  The armed scholar's at-haven presence (leg + meals keep them home) changes
  siege trajectories vs the foraging-away control. Not a scholar water
  block (take gate doesn't touch water). → sim-findings.
- **DOCUMENTED (metric): the 0.6×kcalCap primary is broken for thriving
  runs.** 76% of armed starved-days (60% control) come from long runs with
  h1200<20; the armed side's 10 thriving runs vs control's 5 drive the
  primary's miss. h1200 (engine's own hunger line) is the honest hunger
  primary — proposed for the NEXT run, not this one (§14). → sim-findings.
- **DOCUMENTED (process): telemetry-check boolean artifact, again.** The
  "national disappeared" LOUD is the known schema artifact (booleans
  aggregate as 0); numeric re-aggregation: national 10/16 armed, 9/16
  control — no deviation vs the sweep's own control.

## Metric review (§14)

1. **PRIMARY (starvedDays armed ≤ 0.70× control): MISS — 908/830 = 1.094.
   NO-GO.** Not re-scored. The miss is driven by the documented
   miscalibration: the 0.6×kcalCap threshold counts thriving scholars as
   "starved" daily once skillsets multiply the cap (76% of armed
   starved-days from thriving long runs; armed has 2× the thriving runs).
   The h1200 secondary (0.512×) corroborates the honest direction but does
   not convert the miss.
2. **CO-PRIMARY (trust≥30 days armed ≥ 1.10× control): GO — 1212/854 =
   1.419.** Per-policy split noted (belongseek 2.209×, leadfeast 0.897×);
   pooled is the verdict form per trusthalf.
3. **GUARDRAIL median survival: GO — 113.5 vs need ≥95.5** (armed +8d).
   The killed arm's exact miss is fixed by design.
4. **GUARDRAIL national: GO — 10/16 ≥ 7.**
5. **GUARDRAIL starvation deaths: MISS — 15 vs ≤14 (by one).**
6. **GUARDRAIL no-new-death-mode: MISS by letter** — thirst 9 vs 0 (n≥3);
   mechanism probed as villager collapse-thirst (all player=false), scholar
   death modes unchanged.
7. **INFO-SKIP rule (control < 8 starved-days) did not trigger** (830).
8. **Convergence report: arm NO-GO at pilot on the pre-registered primary.**
   Mechanism proven (discipline + haven-leg banking all fire as designed;
   trust recovers harder, real hunger halves, exposure price eliminated),
   but the binding primary missed and two guardrails miss on the letter. No
   confirm spend. Layer killed per protocol.

## Convergence state

food-economy: **NO-GO at pilot** (sim-bankleg). The #264 named next is
answered technically — zero-exposure pack-banking works (wild/d at control
level, trust 1.419×, h1200 0.512×, median survival +8d) — but the
pre-registered primary (0.6×kcalCap starved-days) missed at 1.094 on its
documented miscalibration, and the starvation-death and new-death-mode
guardrails miss on the letter (thirst = villager collapse-thirst, probed).
The axis's next work: re-run the bankleg shape with the h1200 hunger
primary (metric review proposal), and the trust-delta-by-source instrument
mealonly asked for. The penalty side of food-economy remains exhausted;
the gain side (feed-side trust gains, now 1.419×) is the live direction.
