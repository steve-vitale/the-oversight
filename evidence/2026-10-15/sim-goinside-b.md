# sim-goinside-b — dawn go-inside pack-lunch layer (loop B, axis food-economy, 2026-10-15)

Claims sim-findings #328's named next (a): "dawn pack-lunch with a REAL go-inside verb before the draw."
Claims #314's pantry-draw side and #315's dawn-timed side (both answered by the killed sim-dawnmeal-b arm).

Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 measured 1548/1594 hunger-days are the scholar's. The
  killed sim-dawnmeal-b arm proved the pack-lunch mechanism sound (60 takes
  landed → 39 mid-day meals, 5,749 kcal eaten) but KILLED AT PILOT at
  0.869x vs the 0.60x bar: 415/475 dawn takes refused at
  `havenStoresAccess()==='none'` — the courtship scholar is ON the haven
  tile but OUTSIDE the hall at dawn; the pantry is physical, in the hall.
  The remaining honest fix is the verb, not the timing: step inside first.
- **Lever**: scripts/policies/goinside.js (gate GOINSIDE=1, default off),
  wrapping leadcourt/belongseek. At dawn (dayPart==0), IF the pack holds no
  edible food (#169 pre-fill ban) AND the bedtime-bank projection
  (kcal_now − EWMA[burn dawn→dusk]) shows the evening meal cannot cover
  Scattering.calories.dailyNeed(scholar) + 100 margin, THEN: FIRST the
  go-inside verb — if Game.havenStoresAccess()==='none' and the scholar is
  on the haven tile, call the REAL Game.enterBuilding() (its engine guards
  — not mid-fight, must be on the haven node, already-inside no-op, tent
  rooms refuse — are all honored; ranging needs no exit-after-draw because
  travelTo clears insideHaven on arrival, "traveling means you're outside") —
  THEN one reactive pantry draw (the honest Game.takeFromPantry, one unit,
  cap-bounded per the LANDED capdraw2 fix d94b3fe2, scoring prefers cooked /
  never human meat / raw meat last, beat-voiced) — PACK the lunch (never
  eat it at dawn); at mid-day (dayPart==1), IF the dawn pack happened today
  AND the projection is still uncovered, eat it via the honest Game.eat().
  At most one take per day, hard. Burn loop: anchor at dawn upkeep, close
  at dusk upkeep (0.7/0.3, negative clamps to 0; first close seeds; silent
  before the first close). #169 pre-fill ban: never pre-fill a fed pack,
  never fire when the projection covers.
- **BASELINE REALITY (read from src/js during build)**: the base competent
  upkeep ALREADY emergency-eats from the pantry at dawn (competentEat:
  pack first, pantry second — takes and eats immediately when kcal <
  0.85*cap). The layer's novel verb chain is ENTER → PACK (take now, eat
  at mid-day), not a new food source. The control arm cannot even draw
  outside the hall (its pantry fallback goes through the same honest verb);
  the armed arm steps inside and defers one unit to mid-day. The
  measurement is the marginal timing+access effect, honestly.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.60x control
  (pooled). (This arm exists to beat the dawnmeal arm's 0.869x kill.)
- **GUARDRAILS**: median survival armed >= control-10d; national armed >=
  control-2/16; scholar starveDeaths <= control+2; no new death mode (n>=3
  armed-only).
- **FREQUENCY GUARD (#169 boundary)**: <=1 take/day (hard, in the layer);
  armed takes/run <= 16 (2x the killed middaymeal arm's rate). Exceed with
  no starvation gain → KILL as reactive-but-too-often.
- **GO** → commit the layer for landing. **MISS** → layer deleted per kill
  protocol, evidence + instruments only.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**:
  11/22/33/44/55/66/77/88 x {leadcourt, belongseek} x {control, armed} =
  32 runs, OWN control in the SAME sweep (never an inherited baseline —
  #247 CONTROL BASELINE DRIFT). This is the PILOT (8 seeds); a confirm
  (12–16) only follows a GO.
- **Det-gate**: scripts/test-goinside-20261015.js PART C green before sweep
  spend (16/16 byte-identical, trigger path hot, enters 0).
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 pack-lunch episodes read in the
  transcripts — the enter + pack must read as a person ducking into the
  hall to pack lunch, not a robot or a pantry raid.
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. All mechanics read
  from src/js as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-goinside-20261015.js — ALL GREEN:
- PART A (18 fixtures): gate off returns base itself (A1) / named exports
  are the base policies (A2); gate on wraps (A3, base untouched); fires at
  dawn outside → ENTERS via honest enterBuilding (A4: insideHaven true,
  _giEnters 1, pantry −1, pack +1, "packed lunch" beat, _giTakeDay set);
  no double-enter when already inside (A4b); silent when the pack has food
  — #169 pre-fill ban, pantry untouched, no enter (A5); silent when covered
  (A6); silent on dayParts 1/2/3 (A7); one take/day hard (A8); honest
  refusal honored + counted, never retried (A9); cap-bounded — no room →
  no-gain, oversized unit skipped by the picker, fits when room allows
  (A10); pantry empty → no-gain (A11); scoring cooked-plant first / human
  meat never / raw meat last (A12); burn EWMA seeds, 0.7/0.3, clamps
  negative, stale anchor no-op (A13); mid-day eats the packed lunch when
  uncovered (A14: ate>0, voiced "packed this morning"); silent when covered
  (A15); silent when the dawn pack never happened — the reactive chain,
  not an eat-anyway trigger (A16); off the haven tile → no enter, honest
  refusal counted (A17); mid-fight → the engine guard is honored, no enter,
  counted (A18).
- PART B (live engine, REAL RED): B1 RED — the base's honest takeFromPantry
  at dawn, scholar outside on the haven tile → "The pantry is in the hall.
  Your hands are not." (the dawnmeal kill, reproduced live). B2 RED — the
  layer at the same state → enterBuilding fires (insideHaven true,
  'Inside...' voiced), then ONE unit lands (pantry −1, pack +1, _giTakes
  1, _giEnters 1). B2b RED — the base's dawn upkeep OUTSIDE draws nothing
  (the access wall bites the base too) and never packs. B2c RED — the
  base's dawn upkeep INSIDE takes-and-eats (pantry −1, pack stays empty):
  PACKING is the layer's novel verb. B3 RED — at mid-day the layer eats
  the packed lunch via honest Game.eat() (2100→2300); the base's mid-day
  upkeep does NOT eat at 2100. B4 — silent at dawn when covered (live).
  B5 — the burn loop closes live through the wrapped dusk upkeep
  (measures the real net: avg=410=expected).
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies,
  base vs wrapped+pack-seeder). The pack seeder keeps the pack full so the
  draw gate — and with it the enter gate, which sits behind the draw
  gates — can never pass; dawn log rows ran hot (23–45/run) with zero
  takes and zero enters — the trigger machinery is trajectory-neutral;
  the ONLY lever effect is honest enter + honest take + honest eat.
- SMOKE=1 (proof): ALL GREEN — 25d belongseek s11: 25 dawn rows, 9
  triggers, 9 takes, 8 enters, every take/enter beat-voiced, 3 mid-day
  meals voiced.
- SMOKE=1 (sweep): ALL GREEN — 180d belongseek s11 armed: 180 dawn rows,
  84 triggers, 34 takes, 8 enters, 13 meals, 767 kcal; audit consistent.

(Fixture corrections during build, all honest: A6/A15 asserted the wrong
fires semantics — fires=false when the projection covers, matching the
dawnmeal spec; A13 first ran closeBurnLoop with dayPart=0 against a
dayPart-2 check — the close owns no dayPart check (the wrap gates the
timing), matching the dawnmeal spec; B2b first expected the base to draw
outside — wrong; the access wall bites the base too (pantry unchanged),
split into B2b (outside: nothing) and B2c (inside: takes-and-eats, never
packs).)

## RESULTS — sweep: 32 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/goinside-sweep.json. Per-seed:
evidence/2026-10-15/perseed-goinside/. Transcripts:
evidence/2026-10-15/goinside-transcripts/.

### Pooled (16 control / 16 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/16 | table | won | wave4 | wave5 | giTakes | giEnters | giMeals | giKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 873 | 914 | 10 | 144d | 11 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| armed | 1011 | 1052 | 6 | 182d | 13 | 0 | 0 | 7 | 0 | 420 | 248 | 208 | 15,286 |

Armed audit: giTriggers 998, giEnters 248, giTakes 420, giMeals 208,
giKcalEaten 15,286, giNoGain 98, giRefused 66.

Per-policy: leadcourt armed scholarHunger 507 vs 436 control (1.16x),
starveDeaths 4 vs 3, median 176d vs 129d, national 7/8 vs 5/8, wave4 7 vs
5, takes 214 (26.8/run); belongseek armed 504 vs 437 (1.15x), starveDeaths
2 vs 7, median 182d vs 173d, national 6/8 = 6/8, wave4 0 vs 2, takes 206
(25.8/run).

**PRIMARY: 1011/873 = 1.158 > 0.60 → MISS.**

**GUARDRAILS:**
- median survival 182d ≥ 134d (control−10) ✓ (armed +38d)
- national 13 ≥ 9 (control−2) ✓ (armed +2/16)
- scholar starvation-deaths 6 ≤ 12 (control+2) ✓ (armed −4)
- new death mode: none (armed-only causes at n≥3: none — "The Algorithm",
  "The Union Rep", "The Suburb", "Night Court", "Buffering", "Rut King"
  all n=1) ✓
- frequency guard: 26.3 takes/run > 16 — EXCEEDS the bound, but the guard
  kills only on "exceed with no starvation gain": starvation gain is real
  (starveDeaths 6 vs 10). Not a kill by the letter; flagged in metric
  review as routine-not-reactive drift (a lunch every ~4 days).

**VERDICT: NO-GO** (§14 — primary miss; all guardrails pass). The layer is
deleted per kill protocol; evidence + instruments retained.

### MECHANISM AUTOPSY — why 15,286 kcal moved hunger the wrong way

The go-inside verb WORKED — the access wall is answered. 248 enters fired
honestly, 420 takes landed (vs the dawnmeal arm's 60), 208 mid-day meals,
15,286 kcal eaten. The scholar starves less (6 vs 10), lives longer
(median 182d vs 144d), and reaches national more (13/16 vs 11/16). And
yet scholar hunger-days ROSE 1.158x.

The resolution is in the rates: per day alive, the armed scholar is LESS
hungry (0.388 vs 0.420 hunger-days/day). The pooled primary is confounded
by survival — the arm keeps the scholar alive 25% longer (2603 vs 2080
game-days), and a longer life under chronic half-rations accumulates more
total hunger-days. The lunches treat the mid-day symptom while the disease
— the trust throttle — persists: armed transcripts show 957 "Half ration"
beats vs 664 control, and the engine's take ledger is honest ("THEY
NOTICE. Taking without giving lowers trust"): 420 takes × ~100–400 kcal
each flow into v.takes[vid], and net < −5000 drops trust — the very
throttle the lunches are compensating for. The layer feeds the scholar
while taxing the trust that would end the hunger. A person packing lunch
every dawn from a pantry whose keepers don't trust them is not a
solution; it's a habit the village watches.

Voice wart found (filed for the next variant, not chased here): the
wrapped upkeep runs the base upkeep BEFORE middayStep, so on low-kcal
mid-days competentEat already ate the packed lunch from the pack — then
middayStep voices "You eat the X you packed this morning… (+0 kcal)" and
counts a meal it didn't eat. Kcal accounting is honest (giKcalEaten
measures the real delta); the beat over-claims. Next variant: voice/count
only when ate > 0.

### SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s11, d4–d16: the daily habit.**
"You duck into the hall for the stores — pack a lunch before the day
starts." → "You pack Dried beans from the pantry stores before heading out
— the morning's work will burn what the evening bowl can't cover. (packed
lunch)". Reads as a person, not a robot or a raid: it names the why, it's
one unit, the item name is knowledge-gated. But it fires almost every dawn
against an unbroken wall of "Village meal: +1000-1400 kcal (Half ration —
they don't trust you yet.)" — the habit forms inside the distrust it feeds.

**Episode 2 — belongseek s11, d10/d14/d19/d28: the mid-day meal.**
"You eat the Dried beans you packed this morning, out on the trail — the
afternoon's work will need it. (+0 kcal)" → "⚠ STARVING: health and energy
falling." the same day. The beat is honest about the trail; the +0 is the
voice wart above (the base already ate the lunch). The +28/+80/+151 kcal
meals on other days are real mid-day calories — and still STARVING fires,
because one unit cannot cover a half-ration day.

**Episode 3 — leadcourt s55, d4–d7: the same rhythm, different road.**
Identical enter→pack cadence on the LEAD road. The verb is road-agnostic;
the trust wall is not.

**Verdict**: the voice passes — enter, pack, and eat all read as one
person's morning. The behavior is the honest signature of the finding:
a daily pantry habit under a trust deficit.

## What the village looked like (assessor's notes)

The village looks healthier on the armed side by every measure except the
primary: fewer starvation deaths (6 vs 10), longer median survival (182d
vs 144d), more national reach (13/16 vs 11/16), wave4 parity (7/16). Death
is still combat-shaped (combat 300, villager combat 143, monster 57 armed —
the same profile as control). Nobody thrives distinctively; the courtship
roads diverge as before (leadcourt reaches wave4/national more; belongseek
survives longer). The blank this run fills: the inside/outside pantry wall
is ANSWERED — a real enterBuilding verb before the draw lands 420 takes
where 415 refused. The blank it documents: the wall was never the binding
constraint. The binding constraint is the trust throttle — the scholar's
hunger is a half-ration regime, and pantry takes without gives tax the
trust that would lift it. No lever aimed at the scholar's pack can fix a
village that doesn't trust them; the next #314 variant must answer the
trust ledger (give-first? tribute relief? the evening meal itself), not
the pantry door.

## Wall numbers (standing directive)

national 13/16 (armed) vs 11/16 (control); table 0/16 both; won 0/16 both;
wave4 7/16 both; wave5 0/16 both; median survival 182d vs 144d.
The scale wall stands: national in most runs, the table never, no wins —
but the armed side's national reach (13/16) is the strongest courtship
showing in the #314 series.

TELEMETRY DEVIATION CHECK: not run by this worker (coordinator step per
the loop body); per-seed evidence glob
evidence/2026-10-15/perseed-goinside/ is in place for it.

## Metric review (§14)

NO-GO as pre-registered (primary miss 1.158 > 0.60; all guardrails pass).
No re-scoring. Notes for the NEXT run:
1. The primary (pooled scholar hunger-days) is confounded by survival: an
   arm that keeps the scholar alive 25% longer accumulates more
   hunger-days even as hunger-days/day-alive FALLS (0.388 vs 0.420). The
   0.60x bar assumed the arm's effect would be visible in totals; for
   life-extending arms the honest primary is hunger-days per day alive, or
   starvation deaths (which did move: 6 vs 10). Propose for the next run:
   primary = scholar hunger-days per 100 days alive, GO ≤ 0.85x, with
   starvation deaths as co-primary. This run is judged as pre-registered —
   NO-GO stands.
2. The frequency guard (16 takes/run) was calibrated on the dawnmeal arm's
   3.8/run. With the wall answered, the honest reactive rate is ~26/run —
   a lunch every ~4 days, each gated on pack-empty + uncovered projection.
   The guard's letter ("exceed with no starvation gain → KILL") held: gain
   was real, so no kill. But the SPIRIT (#169: reactive, not routine)
   deserves a re-think — 26/run is a habit, and the habit taxes trust.
   Next run should pre-register a trust-ledger guard (e.g. takes-ledger
   net vs gives) alongside the frequency bound.
3. The mid-day +0 kcal voice wart (base eats the lunch before middayStep)
   should gate the voice/count on ate > 0 in the next variant.
4. Guardrails all passed with margin — the noise-scale kills of the
   middaymeal arms did not reproduce; the arm is safe, just not sufficient.

## Convergence state

**killed-at-pilot** (NO-GO on primary 1.158x vs 0.60x bar; all guardrails
green). #328's named next (a) is now MEASURED and answered: the real
go-inside verb answers the inside/outside pantry wall (420 takes where 415
refused), but the wall was not the binding constraint — the trust
throttle is. The scholar's deficit is a half-ration regime, and pantry
takes without gives feed the ledger that keeps it. Next #314 work must
answer the trust ledger, not the pantry door.

## Findings filed (not chased — out-of-axis notes for the backlog)

- [open] 2026-10-15 — food-economy — the go-inside arm's takes ledger vs
  trust: 420 pantry takes flow into v.takes[vid] and net < −5000 drops
  trust, so a take-heavy scholar-side lever taxes the trust throttle it
  compensates for. Any future pantry-draw lever needs a trust-ledger
  guard (sim-goinside-b evidence).
- [open] 2026-10-15 — food-economy — mid-day meal voice over-claims: the
  wrapped upkeep runs base upkeep before the layer's middayStep, so
  competentEat can eat the packed lunch first and the layer still voices
  "you eat the X you packed this morning (+0 kcal)". Gate voice/count on
  ate > 0 (sim-goinside-b evidence).
