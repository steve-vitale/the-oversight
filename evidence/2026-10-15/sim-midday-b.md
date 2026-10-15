# sim-midday-b — mid-day pack-meal layer (loop B ARM 2, 2026-10-15)

Claims sim-findings #314 (SCHOLAR DAILY DEFICIT).
Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 measured 1548/1594 hunger-days are the scholar's; 622
  are 'meal-served-still-starved' (full 2000+ bowl, trust>=30, still
  STARVING). The bank cap (2400) sits below an active day's total burn, so
  the evening meal alone cannot cover a full day — the scholar must eat
  mid-day. Courtship policies never do (competentEat's 0.85xcap=2040
  threshold sits BELOW the ~2200 overnight need and fires only after the
  bank is already low).
- **Lever**: scripts/policies/middaymeal.js (gate MIDDAYMEAL=1, default off),
  wrapping leadcourt/belongseek. At mid-day (dayPart==1), project the
  bedtime bank (kcal_now - EWMA[burn to bedtime]); if it cannot cover the
  engine's own overnight need (dailyNeed) + 100 margin, eat from the pack
  via the honest Game.eat() verb (engine refusals honored).
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.85x control (pooled).
- **GUARDRAILS**: median survival armed >= control-10d; national armed >=
  control-2/16; starvation deaths armed <= control; no new death mode (n>=3
  armed-only).
- **GO** -> commit the layer for landing. **MISS** -> layer deleted per kill
  protocol, evidence only.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**: 11/22/33/44/55/66/77/88
  x {leadcourt, belongseek} x {control, armed} = 32 runs, OWN control in the
  SAME sweep (never an inherited baseline).
- **Det-gate**: test-middaymeal PART C green before sweep spend.
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 mid-day meal episodes read in the
  transcripts — does the scholar eating mid-day read as a person managing
  hunger, not a robot?
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. All mechanics read
  from src/js as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-middaymeal-20261015.js — ALL GREEN:
- PART A (10/10): gate off returns base object itself; gate on wraps with
  new id, base untouched; fires when projection < need+margin (ate 900);
  silent when covered; empty-pack trigger is an honest no-op (counted, not
  hidden); silent on non-mid-day parts; burn EWMA learns/updates.
- PART B (live engine, REAL RED): at kcal=2100 (ABOVE competentEat's 2040
  line) with food in the pack, the layer eats (+300, voiced); the BASE
  policy's upkeep does NOT eat (kcal 2100->2090, threshold not met). The
  layer moves eating earlier on exactly the days the base waits. Silent
  when the projection covers (2400, burn 50).
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies,
  base+pack-emptier vs wrapped+pack-emptier). The trigger path fired 15-29x
  per run with zero meals (pack emptied) — the projection/log/EWMA
  machinery is trajectory-neutral; the ONLY lever effect is the honest
  Game.eat().
- SMOKE=1: proof smoke + sweep smoke green (policy.daily fired, audit log
  consistent, layer fired).

## RESULTS — sweep: 32 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/middaymeal-sweep.json. Per-seed:
evidence/2026-10-15/perseed-middaymeal/. Transcripts:
evidence/2026-10-15/middaymeal-transcripts/.

### Pooled (16 control / 16 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/16 | table | won | wave4 | wave5 | mmMeals | mmKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 1548 | 1594 | 16 | 147d | 8 | 1 | 0 | 4 | 0 | 0 | 0 |
| armed | 563 | 647 | 18 | 161d | 11 | 0 | 0 | 5 | 0 | 127 | 22,275 |

**PRIMARY: 563/1548 = 0.364 <= 0.85 → GO** (63.6% fewer scholar hunger-days).
13/16 seeds improved; 3 regressed (belongseek s11: 24→33; leadcourt s11:
29→50; leadcourt s33: 22→105).

**GUARDRAILS:**
- median survival 161d >= 137d (control-10) ✓
- national 11 >= 6 (control-2) ✓
- starvation deaths 18 <= 16 ✗ (FAIL by 2)
- new death mode: wound_fever 3 armed / 0 control ✗ (FAIL)

**VERDICT: NO-GO** (§14 — guardrails bind). The layer is deleted per kill
protocol; evidence retained.

Death causes (armed): combat 120, monster 23, villager combat 11, "a wound
that wouldn't close" 10, sickness 19, starvation 18, wound_fever 3 (NEW),
expedition 2, alien 2, contest 1, lockjaw 2, dehydration 1.
Death causes (control): combat 72, villager combat 22, monster 18,
"a wound that wouldn't close" 14, starvation 16, sickness 10, contest 7,
lockjaw 2, Nevermore 2, expedition 1.

### Wall numbers (standing directive)
national 11/16 (armed) vs 8/16 (control); table 0/16 vs 1/16; won 0/16 both;
wave4 5/16 vs 4/16; wave5 0/16 both; median survival 161d vs 147d. The scale
wall stands: national in ~2/3 of armed runs, the table once (control), no wins.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — leadcourt s44, d19–d27: the layer fires, the pack is thin.**
"The afternoon's work is ahead and the evening bowl won't cover it — you eat
from your pack now. (+296 kcal)" / "(+97)" / "(+317)" / "(+230)" / "(+160)" /
"(+94)" / "(+255)". The voice reads as a person managing hunger — proactive,
reasoned, names the why (the evening bowl won't cover it). Not robotic. But
the amounts are small (the pack holds little), and d23 still STARVEs after a
+317 mid-day meal. The layer moves eating earlier, but it cannot conjure food
the pack doesn't have.

**Episode 2 — belongseek s55, d1–d22: the empty-pack grind.**
d1: the layer eats (+210), but STARVING fires that night. d4–d22: STARVING
fires almost nightly, and the layer goes silent — not because the projection
passes, but because the pack is EMPTY (trigger fires, Game.eat() no-ops,
_mmNoGain). The scholar starves with the layer watching, unable to help. The
timing is right; the food isn't there. This is the sibling arm's territory
(pantry-draw), not mine.

**Verdict**: the voice passes (a person, not a robot). The mechanism is
honest but pack-limited: 127 meals / 22,275 kcal across 16 runs (~1.4k per
run) — enough to tip marginal nights, not enough to fix the deficit.

## What the village looked like (assessor's notes)

On the armed side the scholar is visibly less hungry (563 vs 1548
hunger-days), but the village itself looks the same: the pantry still feeds
villagers fine, the trust throttle still bites early, the table still waits.
The layer is a scholar-side timing tweak — it doesn't change what the
village looks like, only how often the scholar goes to bed starving. The
three regressed seeds (s11 both policies, leadcourt s33) are a warning: the
RNG diverges after the first eat, and some trajectories get worse. The
wound_fever cluster (leadcourt s22:2, s55:1) and the combat-death inflation
(120 vs 72) suggest the better-fed scholar's trajectory shifts the death
distribution — not necessarily caused by the layer, but not ruled out either.

## Metric review (§14)

NO-GO as pre-registered (guardrails bind; no re-scoring). Notes for the NEXT run:
1. The PRIMARY was a strong GO (0.364). The guardrail misses were narrow
   (starveDeaths +2, wound_fever 3v0) and plausibly RNG-divergence noise —
   but §14 does not permit noise discounts. A confirm run with 12–16 seeds
   on a refined layer could resolve whether the death-distribution shift is
   real.
2. "Starvation deaths <=" is a brittle guardrail for a lever that changes
   trajectories: the deaths are not directly comparable once the RNG
   diverges. Consider "starvation death SHARE <=" or a wider margin.
3. The pack-emptiness (Episode 2) is the binding constraint on this lever.
   The timing is proven; the food must come from the sibling's pantry-draw
   arm. A combined layer (timing + draw) is the natural next arm.
4. No metric changes mid-run were made; none needed.

## Convergence state

**killed-at-pilot** (NO-GO on guardrails). The scholar-daily-deficit finding
(#314) stays open: the mid-day timing lever is proven to move the primary
but not to land under the guardrails. The mechanism (projection-triggered
pack eating) is sound and the proof is green; it needs the pantry-draw side
to be effective, or a confirm run to clear the noise.
