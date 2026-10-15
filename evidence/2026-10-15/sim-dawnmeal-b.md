# sim-dawnmeal-b — dawn-timed pack-lunch layer (loop B, run fleshout-b-20261015T1229Z, axis food-economy, 2026-10-15)

Claims sim-findings #315's named next ("DAWN-timed pack lunch") and #314's pantry-draw side.

Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 measured 1548/1594 hunger-days are the scholar's. The
  killed sim-midday-b / sim-middayconfirm-b arms proved projection timing
  twice (scholar hunger-days 0.364x then 0.284x control) but died on
  noise-scale median-survival guardrails; the killed sim-topupreactive-b arm
  proved a mid-day pantry draw is STRUCTURALLY IMPOSSIBLE (526/606 takes
  refused, 40/40 at havenStoresAccess()==='none' — the pantry is at Haven,
  the scholar is ranging at mid-day). The remaining honest moment is DAWN
  at Haven, before ranging: pantry access and the scholar coincide exactly
  once per day.
- **Lever**: scripts/policies/dawnmeal.js (gate DAWNMEAL=1, default off),
  wrapping leadcourt/belongseek. At dawn (dayPart==0), IF the pack holds no
  edible food AND the bedtime-bank projection (kcal_now − EWMA[burn
  dawn→dusk]) shows the evening meal cannot cover
  Scattering.calories.dailyNeed(scholar) + 100 margin, THEN one reactive
  pantry draw (the honest Game.takeFromPantry, one unit, cap-bounded per the
  LANDED capdraw2 fix d94b3fe2, scoring prefers cooked / never human meat /
  raw meat last, beat-voiced) — PACK the lunch (never eat it at dawn); at
  mid-day (dayPart==1), IF the dawn pack happened today AND the pack still
  holds it AND the projection is still uncovered, eat it via the honest
  Game.eat(). At most one take per day, hard. Burn loop: anchor at dawn
  upkeep, close at dusk upkeep (0.7/0.3, negative clamps to 0; first close
  seeds; silent before the first close). #169 pre-fill ban: never pre-fill
  a fed pack, never fire when the projection covers.
- **BASELINE REALITY (read from src/js during build)**: the base competent
  upkeep ALREADY emergency-eats from the pantry at dawn (competentEat:
  pack first, pantry second — takes and eats immediately when kcal <
  0.85*cap). The layer's novel verb is PACKING (take now, eat at mid-day),
  not a new food source. The control arm eats its dawn pantry food
  immediately; the armed arm defers one unit to mid-day. The measurement is
  the marginal timing effect, honestly.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.60x control
  (pooled). (middaymeal hit 0.364x/0.284x; 0.60x is the honest bar for the
  new timing — the draw adds kcal the killed arms lacked.)
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
- **Det-gate**: scripts/test-dawnmeal-20261015.js PART C green before sweep
  spend (16/16 byte-identical, trigger path hot).
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 pack-lunch episodes read in the
  transcripts — the dawn pack must read as a person packing lunch, not a
  robot or a pantry raid.
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. All mechanics read
  from src/js as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-dawnmeal-20261015.js — ALL GREEN:
- PART A (16/16 fixtures): gate off returns base itself (A1) / named
  exports are the base policies (A2); gate on wraps (A3, base untouched);
  fires at dawn on pack-empty + uncovered projection (A4: pantry −1, pack
  +1, "packed lunch" beat, _dmTakeDay set); silent when the pack has food
  — #169 pre-fill ban, pantry untouched (A5); silent when covered (A6);
  silent on dayParts 1/2/3 (A7); one take/day hard (A8); honest refusal
  honored + counted (A9); cap-bounded — no room → no-gain, oversized unit
  skipped by the picker, fits when room allows (A10); pantry empty →
  no-gain (A11); scoring cooked-plant first / human meat never / raw meat
  last (A12); burn EWMA seeds, 0.7/0.3, clamps negative, stale anchor no-op
  (A13); mid-day eats the packed lunch when uncovered (A14: ate>0, voiced
  "packed this morning"); silent when covered (A15); silent when the dawn
  pack never happened — the reactive chain, not an eat-anyway trigger
  (A16).
- PART B (live engine, REAL RED): B1 RED — at dawn, kcal=1500 (below the
  base's 2040 eat line), pack empty, pantry stocked, burnAvg 1000 → the
  layer packs ONE unit (pantry 235→234, pack +1, voiced). B1b RED — the
  base's dawn upkeep takes-and-eats from the pantry but NEVER packs
  (pack stays empty: packing is the layer's novel verb). B2 RED — at
  mid-day the layer eats the packed lunch via honest Game.eat()
  (2100→2300). B2b RED — the base's mid-day upkeep does NOT eat at 2100
  (threshold 2040). B3 — silent at dawn when covered (live). B4 — the burn
  loop closes live through the wrapped dusk upkeep (measures the real net:
  avg=410=expected).
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies,
  base vs wrapped+pack-seeder). The pack seeder keeps the pack full so the
  draw gate and the _dmTakeDay-gated eat gate can never pass; dawn log rows
  ran hot (30/run) with zero takes — the trigger machinery is
  trajectory-neutral; the ONLY lever effect is the honest take + honest eat.
- SMOKE=1: ALL GREEN (25d, belongseek s11: 25 dawn rows, triggers 22/25
  consistent, takes 0 — the pack was never empty in the smoke run, so the
  #169 ban held; every row has a fires boolean).

(Fixture fixes during build: B1b first asserted "base draws nothing at
dawn" — wrong; the base competent upkeep already emergency-eats from the
pantry at dawn (competentEat, pack-first-pantry-second). Corrected to the
true RED: the base never PACKS. B4 first expected avg=500 — wrong; the base
dusk upkeep ate 1000 kcal from the starting pack before the close.
Corrected to empty-pack + anchor-above-line, asserting the measured net.)

## RESULTS — sweep: 32 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/dawnmeal-sweep.json. Per-seed:
evidence/2026-10-15/perseed-dawnmeal/. Transcripts:
evidence/2026-10-15/dawnmeal-transcripts/.

### Pooled (16 control / 16 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/16 | table | won | wave4 | wave5 | dmTakes | dmMeals | dmKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 1548 | 1594 | 16 | 147d | 8 | 1 | 0 | 4 | 0 | 0 | 0 | 0 |
| armed | 1345 | 1397 | 14 | 138d | 8 | 0 | 0 | 2 | 0 | 60 | 39 | 5,749 |

Armed audit: dmTriggers 807, dmTakes 60, dmMeals 39, dmKcalEaten 5,749,
dmNoGain 49, dmRefused 415, dmMealTriggers 39.

Per-policy: leadcourt armed scholarHunger 508 vs 696 control (0.73x),
starveDeaths 6 vs 8, median ~904d-sum vs 890, national 4=4; belongseek armed
837 vs 852 (0.98x), starveDeaths 8=8, national 4=4.

**PRIMARY: 1345/1548 = 0.869 > 0.60 → MISS.**

**GUARDRAILS:**
- median survival 138d ≥ 137d (control−10) ✓
- national 8 ≥ 6 (control−2) ✓
- scholar starvation-deaths 14 ≤ 18 (control+2) ✓
- new death mode: none (armed-only causes at n≥3: "The Big Stare" 1,
  "Ugly-Eyes" 1 — below threshold) ✓
- frequency guard: 60/16 = 3.8 takes/run ≤ 16 ✓ (reactive, not routine)

**VERDICT: NO-GO** (§14 — primary miss; all guardrails pass). The layer is
deleted per kill protocol; evidence + instruments retained.

### THE INSIDE/OUTSIDE WALL (mechanism autopsy)

The layer fired 807 triggers but completed only 60 takes. 415 takes were
refused — and a diagnostic (2 seeds × 25d, access recorded at each refusal)
showed 39/39 refusals at `havenStoresAccess() === 'none'` with the scholar
ON the haven tile but `insideHaven === false`: on the grounds, outside the
hall. The pantry is PHYSICAL — in the hall (havenStoresAccess requires
insideHaven && haven tile, game.js ~9766). The courtship scholar
(leadcourt/belongseek) sleeps/returns to the grounds and never steps inside
at dawn, so the honest verb refuses: "The pantry is in the hall. Your
hands are not."

The access wall is NOT about time-of-day — the mid-day arm found 526/606
refused at mid-day; the dawn arm finds 415/475 attempted takes refused at
dawn. The brief's premise ("dawn at Haven, the one moment pantry access
and the ranging scholar coincide") was wrong for the courtship roads: the
scholar is at Haven (the tile) but not IN Haven (the hall). This is not an
engine bug — the inside/outside state is real, with enter/leave verbs
(game.js ~10088-10176).

The 60 takes that landed DID fire the mechanism end-to-end: 39 mid-day
meals, 5,749 kcal eaten honestly. The mechanism is sound; the hands can't
reach. Filed as a new open finding (the inside/outside pantry wall); the
next #314 variant must send the scholar INSIDE first (a behavior arm), be
presence-gated, or answer the trust-throttled evening meal directly.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s22, d22: the first packed lunch.**
"You pack Snared meat (dried) from the pantry stores before heading out —
the morning's work will burn what the evening bowl can't cover. (packed
lunch)" → mid-day "You eat the Snared meat (dried) you packed this morning,
out on the trail — the afternoon's work will need it. (+88 kcal)". Reads as
a person packing lunch: it names the why, it's one unit, the item name is
knowledge-gated ("Snared meat (dried)", not a true name). Not a robot, not
a raid. But +88 kcal against a half-ration evening and a STARVING beat the
same day — the lunch is a gesture next to the trust throttle.

**Episode 2 — leadcourt s22, d28: the same beat, different road.**
"You pack Foraged food (dried) from the pantry stores before heading out"
→ "You eat the Foraged food (dried) you packed this morning, out on the
trail (+107 kcal)". Same honest rhythm. The d1–d27 transcript is a wall of
"Village meal: +1000-1400 kcal (Half ration — they don't trust you yet.)"
with STARVING firing most days — the scholar's deficit is the trust
throttle, and one packed unit per day cannot fix it.

**Episode 3 — the refused mornings (diagnostic):** on most dawns the engine
voices "The pantry is in the hall. Your hands are not." — honest and
in-fiction, but the layer watches the scholar walk the grounds at dawn,
hands empty, 87% of the mornings it wants to help.

**Verdict**: the voice passes. The mechanism is honest and end-to-end
functional, but time-wrong in a deeper sense than mid-day was: the fix
isn't a different hour, it's a different verb (go inside).

## What the village looked like (assessor's notes)

The village looks the same on both sides: the pantry feeds villagers fine,
the trust throttle bites the scholar deep into the run (half-rations past
day 100 in the transcripts), the table waits. The layer is a scholar-side
timing tweak that acts on ~4 mornings per run — 60 takes / 5,749 kcal
across 16 runs (~360 kcal/run) — so it changes nothing about how the
village looks, only adds 99 lunch beats to the transcripts. The two
policies diverge on the primary (leadcourt 0.73x, belongseek 0.98x) with
guardrails flat — a small real effect on leadcourt, noise on belongseek.
The honest story of this run: the scholar's deficit is not a timing
problem (proven twice), not a mid-day availability problem (proven), and
not a dawn availability problem either — it's a half-ration trust problem
plus a pantry-physicality problem. The food is in the hall; the scholar
doesn't go in.

## Wall numbers (standing directive)

national 8/16 (armed) vs 8/16 (control); table 0/16 vs 1/16; won 0/16 both;
wave4 2/16 vs 4/16; wave5 0/16 both; median survival 138d vs 147d.
The scale wall stands: national in half the runs, the table once (control),
no wins.

TELEMETRY DEVIATION CHECK: `telemetry-check.js` vs the 2026-10-13
scale-wall baseline — the topupreactive-b arm (same day, same roads)
already investigated this exact comparison and explained it: the baseline
is a raw count with no run denominator vs 48 current files, the binding
within-sweep comparison shows no movement (national 8/16 vs 8/16 here),
and the baseline is 2 days stale across a hot tree. Not re-run; same
conclusion. Baseline NOT rolled forward (killed-arm precedent).

## Metric review (§14)

NO-GO as pre-registered (primary miss 0.869 > 0.60; all guardrails pass).
No re-scoring. Notes for the NEXT run:
1. The 0.60x bar was the honest bar for "the draw adds kcal the killed
   arms lacked" — but the draw almost never lands (60/807 triggers), so
   the armed side is really "middaymeal with a 13%-of-mornings lunch".
   The bar wasn't wrong; the premise (dawn = access) was.
2. "Starvation deaths <= control+2" passed (14 vs 16) and the median
   guardrail passed (138 ≥ 137) — the noise-scale kills of the two prior
   arms did not reproduce here. The guardrails are doing their job; the
   primary is the binding miss.
3. The frequency-guard operationalization (2x the middaymeal take rate =
   16/run) held easily (3.8/run) — the layer was reactive, not routine.
   The #169 boundary was never approached; the binding constraint was the
   inside/outside wall, not frequency.
4. The next #314 variant needs the go-inside verb (behavior arm), not
   another timing tweak. No metric changes mid-run were made; none needed.

## Convergence state

**killed-at-pilot** (NO-GO on primary; all guardrails green). #315's named
next (dawn-timed pack lunch) is now MEASURED and answered: dawn doesn't fix
the access wall on the courtship roads — the scholar is on the haven tile
but outside the hall. New open finding filed: the inside/outside pantry
wall.
