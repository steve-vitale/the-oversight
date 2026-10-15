# sim-topupreactive-b — mid-day REACTIVE pantry top-up layer (loop B, run fleshout-b-20261015T1130Z, axis food-economy, 2026-10-15)

Claims sim-findings #314's named next ("the pantry-draw side").
Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 measured 1548/1594 hunger-days are the scholar's. The
  killed sim-midday-b arm proved projection timing (scholar hunger-days
  563/1548 = 0.364x control) but died pack-limited: 127 meals, the
  empty-pack grind — the trigger fired, Game.eat() no-op'd, the scholar
  starved with the layer watching. This arm disentangles the
  pack-availability bind from the projection-timing bind: same projection
  design, plus ONE reactive pantry draw when the pack is empty and the
  projection is uncovered.
- **Lever**: scripts/policies/middaytopup.js (gate TOPUP=1, default off),
  wrapping leadcourt/belongseek. At mid-day (dayPart==1), IF the pack holds
  no edible food (Game.eat() would be an honest no-op — same filter) AND
  the bedtime-bank projection (kcal_now − EWMA[burn to bedtime]) shows the
  evening meal cannot cover Scattering.calories.dailyNeed(scholar) + 100
  margin, THEN one reactive pantry draw (the honest Game.takeFromPantry,
  one unit, cap-bounded: must fit the room to the kcal cap + the engine's
  weight gate, beat-voiced) and eat from the pack via honest Game.eat().
  At most one take per day, hard. Takes stay REACTIVE per #169
  (PANTRY-PACK CROWDING): never pre-fill a fed pack, never fire when the
  projection covers — the takedisc pilot pre-filled and leadcourt
  starvation deaths tripled.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.85x control (pooled).
- **GUARDRAILS**: scholar starvation-deaths <= control+1; median survival
  armed >= control-10d; national armed >= control-2/16; no new death mode
  (n>=3 armed-only).
- **FREQUENCY GUARD (#169 boundary — the brief's "armed meals >= 2x control"
  clause, operationalized)**: armed tuTakes/run <= 16 (2x the killed
  middaymeal arm's 127 takes/16 runs ≈ 8/run). Exceed with no starvation
  gain → KILL as reactive-but-too-often (pre-fill by frequency). The
  brief's literal "2x control" is vacuous here (control tuTakes = 0 by
  construction); this operationalization is pre-registered, not rescored.
- **GO** → commit the layer for landing. **MISS** → layer deleted per kill
  protocol, evidence + instruments only.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**:
  11/22/33/44/55/66/77/88/99/110/121/132 x {leadcourt, belongseek} x
  {control, armed} = 48 runs, OWN control in the SAME sweep (never an
  inherited baseline — #247 CONTROL BASELINE DRIFT).
- **Det-gate**: test-topupreactive-20261015.js PART C green before sweep spend.
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 top-up episodes read in the transcripts
  — the reactive take must read as a person packing lunch, not a robot or
  a pantry raid.
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. All mechanics read
  from src/js as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-topupreactive-20261015.js — ALL GREEN:
- PART A (16/16): gate off returns base itself; gate on wraps with new id
  'topup-leadcourt', base untouched; fires on pack-empty + uncovered
  projection (one take, kcal 1500->1900, beat-voiced, audit row); silent
  when the pack has food (#169 pre-fill ban — pantry untouched); silent
  when covered; silent on dayParts 0/2/3; one take per day hard; weight
  refusal honored + counted; cap-bounded (no room -> skip; oversized unit
  skipped by the picker); pantry-empty honest no-op counted; scoring
  prefers cooked, never human meat, raw meat last; burn EWMA learns,
  0.7/0.3 updates, clamps negative burn to 0.
- PART B (live engine, REAL RED): kcal=2100 (ABOVE competentEat's 2040
  line), pack empty, pantry stocked, burnAvg 500 -> the layer takes ONE
  pantry unit (237->236) and eats (2100->2300, voiced "The pack's down to
  crumbs, and the evening bowl won't cover the night — you draw test acorn
  cake from the pantry stores and eat it on the trail. (+200 kcal)"); the
  BASE policy's upkeep does NOT eat (2100->2090). Silent with food in the
  pack; silent when covered; burn EWMA closes live at the dusk upkeep.
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies,
  base vs wrapped+pack-seeded-full). The projection/log/EWMA machinery ran
  hot (22-30 silent rows per run) with zero takes — the trigger machinery
  is trajectory-neutral; the ONLY lever effect is the honest take+eat.
- (Debug note: the first PART C run read ctx from a dead local — runDays
  builds its own ctx; fixed by capturing the live ctx in the wrapped
  closures, the middaymeal det-gate pattern.)

## RESULTS — sweep: 48 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/topupreactive-sweep.json. Per-seed:
evidence/2026-10-15/perseed-topupreactive/. Transcripts:
evidence/2026-10-15/topupreactive-transcripts/.

### Pooled (24 control / 24 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/24 | table | won | wave4 | wave5 | tuTakes | tuKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 2153 | 2217 | 26 | 156d | 16 | 1 | 0 | 7 | 1 | 0 | 0 |
| armed | 2041 | 2114 | 25 | 133d | 17 | 0 | 0 | 10 | 1 | 80 | 13,795 |

Armed audit: tuTriggers 606 fires, tuTakes 80, tuMeals 80 (all voiced),
tuNoGain 20, tuRefused 526, tuNoRoom 45.

**PRIMARY: 2041/2153 = 0.948 > 0.85 → MISS.**

**GUARDRAILS:**
- median survival 133d < 146d (control−10) ✗ (MISS by 13d)
- national 17 ≥ 14 (control−2) ✓
- scholar starvation-deaths 25 ≤ 27 (control+1) ✓
- new death mode: none (no armed-only cause at n≥3) ✓
- frequency guard: 80/24 = 3.3 takes/run ≤ 16 ✓ (reactive, not routine)

Per-policy: leadcourt armed scholarHunger 1060 vs 929 control (1.14x —
worse), starveDeaths 6 vs 11, median 148d vs 148d, 4/12 seeds improved;
belongseek armed 981 vs 1224 (0.80x), starveDeaths 19 vs 15, median 123d
vs 159d, 4/12 seeds improved. Only 8/24 seeds improved on the primary —
the effect is small and noisy, consistent with the layer rarely acting.

**VERDICT: NO-GO** (§14 — primary miss + median guardrail miss). The layer
is deleted per kill protocol; evidence + instruments retained.

### THE ACCESS WALL (mechanism autopsy)

The layer fired 606 times but completed only 80 takes. 526 takes (87%)
were refused — and a diagnostic (2 seeds × 25d, access recorded at each
refusal) showed 40/40 refusals at `havenStoresAccess() === 'none'` with
the scholar away from Haven. The engine's take verb refuses remotely:
"The pantry is in the hall. Your hands are not." At mid-day the scholar
is RANGING — not at Haven — so a mid-day pantry draw is structurally
impossible without integration stage ≥3 (remote access). The 80 takes
that succeeded are haven-days (or remote-access days). The layer's
premise had the right trigger and the wrong TIME: a pantry draw belongs
at DAWN (at Haven, packing lunch before ranging), not at mid-day.
Filed as a new open finding (the access wall); the #314 pantry-draw side
needs a dawn-timed or presence-gated variant.

The median-survival miss (−23d) is plausibly trajectory noise on 24 runs
(the effect size is tiny: 575 kcal/run), but §14 does not permit noise
discounts — the guardrail binds.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s99, d7–d22: the draw beside half-rations.**
"The pack's down to crumbs, and the evening bowl won't cover the night —
you draw Dried beans from the pantry stores and eat it on the trail.
(+150 kcal)" — then "Village meal: +1152 kcal (Half ration — they don't
trust you yet.)" and "⚠ STARVING: health and energy falling." The voice
reads as a person packing lunch: it names the why (the evening bowl won't
cover), it's one unit, it's on the trail. Not a robot, not a raid. But the
amounts are small (+99 to +200) and STARVING fires anyway — the scholar is
on half-rations ("they don't trust you yet") and a 150-kcal draw cannot
fix a trust-throttled evening meal.

**Episode 2 — leadcourt s22, d32–d60: the 9-take run.**
Nine draws across 28 days, each +100–135 kcal, each followed the same day
or next by STARVING. The repetition reads fine (a hungry person keeps
reaching for lunch) but the pattern is tragic: the layer treats the
symptom (empty pack at mid-day) while the disease (half-ration evenings +
no remote pantry access while ranging) continues.

**Episode 3 — the refused days (diagnostic):** on ranging days the engine
voices "The pantry is in the hall. Your hands are not." — the refusal is
honest and in-fiction (no silent action), but it means the layer watches
the scholar starve 87% of the time it wants to help.

**Verdict**: the voice passes. The mechanism is honest but tiny and
time-wrong: 80 takes / 13,795 kcal across 24 runs (~575 kcal/run) cannot
move the scholar's deficit, and mid-day is when the scholar is farthest
from the pantry.

## What the village looked like (assessor's notes)

The village looks the same on both sides: the pantry feeds villagers
fine, the trust throttle bites early (half-rations for the scholar deep
into the run), the table waits. The layer is a scholar-side timing tweak
that almost never gets to act — 3.3 takes per run — so it changes nothing
about how the village looks, only adds 80 small lunch beats to the
transcripts. The two policies diverge (belongseek gains hunger-days but
loses survival; leadcourt the reverse), which is what a near-zero effect
size plus trajectory noise looks like, not a real strategy interaction.
The honest story of this run: the scholar's deficit is not a mid-day
timing problem anymore (sim-midday-b proved that timing) and not a
mid-day availability problem either — it's a half-ration trust problem
plus a pantry-access problem. The food is at Haven; the scholar is not.

## Wall numbers (standing directive)

national 17/24 (armed) vs 16/24 (control); table 0/24 vs 1/24; won 0/24
both; wave4 10/24 vs 7/24; wave5 1/24 both; median survival 133d vs 156d.
The scale wall stands: national in ~2/3 of runs, the table once
(control), no wins.

TELEMETRY DEVIATION CHECK: `telemetry-check.js` vs the 2026-10-13
scale-wall baseline printed LOUD (national swung 313%: baseline 8 ->
current 33, n=48 files). INVESTIGATED — EXPLAINED, not a real swing:
(1) the baseline is a raw count (8) with no run denominator — 48 current
files vs an unknown-denominator baseline inflates the ratio; (2) the
binding within-sweep comparison (#247) shows national 17/24 armed vs
16/24 control — no movement at all; (3) the baseline is 2 days stale
across a hot tree (control baseline drift #247); today's tip measures
67-71% national on the courtship roads (middaymeal sweep: 8-11/16;
rechealth: 8/16). Baseline NOT rolled forward (killed-arm precedent).

## Metric review (§14)

NO-GO as pre-registered (primary miss 0.948 > 0.85; median guardrail miss
133d < 146d). No re-scoring. Notes for the NEXT run:
1. The frequency-guard operationalization ("2x the middaymeal arm's take
   rate") held easily (3.3/run ≤ 16) — the layer was reactive, not
   routine. The #169 boundary was never approached; the binding constraint
   was the access wall, not frequency.
2. "Starvation deaths <= control+1" passed but is a weak guardrail for a
   near-zero-effect lever — the deaths are trajectory noise once the RNG
   diverges. Consider "starvation death SHARE <=" for future food arms.
3. The next #314 pantry-draw variant must be DAWN-timed (pack lunch at
   Haven before ranging) or presence-gated (fire only when
   havenStoresAccess() !== 'none'), not mid-day. The projection timing
   from sim-midday-b still stands; only the draw's time/place was wrong.
4. No metric changes mid-run were made; none needed.

## Convergence state

**killed-at-pilot** (NO-GO on primary + median guardrail). The #314
pantry-draw side is not dead as a question — only this mid-day-timed
variant is. The access-wall finding is filed for the next arm.
