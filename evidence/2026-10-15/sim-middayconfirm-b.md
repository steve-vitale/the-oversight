# sim-middayconfirm-b — mid-day pack-meal layer CONFIRM (loop B, 2026-10-15)

Rebuild of the mid-day pack-meal arm (killed at pilot as sim-midday-b on
noise-scale guardrail misses: PRIMARY 0.364x GO, but starveDeaths 18 vs 16
and wound_fever 3 armed / 0 control on n=16). Sim-findings #314 claims this
confirm run "to clear the death-distribution noise."
Policy-side lever, zero src/js changes. The pilot's layer was deleted per
kill protocol; this run rebuilds scripts/policies/middaymeal.js (gate
MIDDAYMEAL=1, default OFF) from the killed arm's spec.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 (SCHOLAR DAILY DEFICIT): 1548/1594 pilot hunger-days are
  the scholar's; the bank cap (2400) sits below an active day's total burn,
  so the evening meal alone cannot cover a full day — the scholar must eat
  mid-day. Courtship policies never do (competentEat's 0.85xcap=2040
  threshold sits below the ~2200 overnight need and fires only after the
  bank is already low).
- **Lever**: rebuilt scripts/policies/middaymeal.js (gate MIDDAYMEAL=1,
  default off), wrapping leadcourt/belongseek. At mid-day (dayPart==1),
  project the bedtime bank (kcal_now - EWMA[burn to bedtime]); if it cannot
  cover the engine's own overnight need (Scattering.calories.dailyNeed, the
  same number the honest sleep button telegraphs) + 100 margin, eat from the
  pack via the honest Game.eat() verb (engine refusals honored). Empty pack
  is an honest counted no-op (_mmNoGain). Base policies untouched.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.85x control (pooled).
- **GUARDRAILS (noise-calibrated from the pilot)**:
  - starvation deaths armed <= control+2 (the pilot's 18 vs 16 on n=16);
  - a new death mode needs n>=3 armed-only (absent on control) to count
    (the pilot's wound_fever 3/0 was the boundary);
  - median survival armed >= control-10d;
  - national armed >= control-2.
- **GO** -> land the layer as its own commit. **MISS** -> layer deleted per
  kill protocol, evidence + instruments only. A second kill on noise-scale =
  the layer stays dead; the evidence records why.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**: 12
  (11/22/33/44/55/66/77/88/99/110/121/132) x {leadcourt, belongseek} x
  {control, armed} = 48 runs, OWN control in the SAME sweep (never an
  inherited baseline; #247 CONTROL BASELINE DRIFT).
- **Det-gate**: scripts/test-middayconfirm-20261015.js PART C green before
  any sweep spend. **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 mid-day meal episodes read in the
  transcripts — does the scholar eating mid-day read as a person managing
  hunger, not a robot?
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. All mechanics read
  from src/js as-is (cited in the layer header: Game.eat, dayPart,
  Scattering.calories.dailyNeed).

## PROOF (before measurement)

scripts/test-middayconfirm-20261015.js — ALL GREEN (run 2026-10-15 before
any sweep spend):
- PART A (10 fixtures): gate off returns the base object itself (A1) and
  the named export is the base leadcourt (A2); gate on wraps with id
  middaymeal-leadcourt (A3) leaving the base untouched (A4); fires when
  projection < need+margin — ate +900, voiced, audit row, burn anchor
  recorded (A5); silent when covered (A6); empty pack is an honest counted
  no-op, no voice (A7); silent on dayParts 0/2/3, no log rows (A8); EWMA
  seeds on first close, updates 0.7/0.3 (A9); margin boundary exact:
  projBed == need+100 silent, == need+99 fires (A10).
- PART B (live engine, REAL RED): at kcal=2100 (ABOVE competentEat's 2040
  line) the layer eats (2100 -> 2400, meals=1) and voices the person-line;
  the BASE policy's upkeep does NOT eat there (2100 -> 2090, threshold not
  met); silent when the projection covers (2400, burn 50).
- PART C (det-gate): 16/16 byte-identical (30d x 8 seeds x 2 policies,
  base+pack-emptier vs wrapped+pack-emptier; trigger path fired 14-27x per
  run with zero meals). The machinery is trajectory-neutral; the ONLY
  lever effect is the honest Game.eat().
- SMOKE=1 (both proof and sweep smoke gates): ALL GREEN.

## RESULTS — confirm sweep: 48 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/middayconfirm-sweep.json. Per-seed:
evidence/2026-10-15/perseed-middayconfirm/. Transcripts:
evidence/2026-10-15/middayconfirm-transcripts/.

### Pooled (24 control / 24 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/24 | table | won | wave4 | wave5 | mmMeals | mmKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 2153 | 2217 | 26 | 156d | 16 | 1 | 0 | 7 | 1 | 0 | 0 |
| armed | 611 | 686 | 13 | 124d | 15 | 0 | 0 | 9 | 0 | 157 | 31,642 |

**PRIMARY: 611/2153 = 0.284 <= 0.85 → GO** (71.6% fewer scholar hunger-days;
17/24 seeds improved, 6 regressed, 1 tie). The hunger effect is real and
consistent — it reproduced the pilot's direction at larger n (pilot: 0.364x).

**GUARDRAILS:**
- median survival 124d >= 146d (control-10) ✗ (FAIL by 22d)
- national 15 >= 14 (control-2) ✓
- starvation deaths 13 <= 28 (control+2) ✓ (armed starves HALF as much)
- new death mode: none — wound_fever 4 armed / 1 control (present on
  control, not a new mode); alien/The Big Thing/thirst all n=1 ✓

**VERDICT: NO-GO** (§14 — guardrails bind; a miss is a miss, never
re-scored). The layer is deleted per kill protocol; evidence + instruments
retained.

Death causes (armed): combat 144, monster 33, villager combat 31, sickness
27, "a wound that wouldn't close" 21, starvation 13, contest 10, wound_fever
4, lockjaw 1, alien 1, expedition 1, The Big Thing 1, thirst 1.
Death causes (control): combat 115, villager combat 39, monster 31,
starvation 26, "a wound that wouldn't close" 21, sickness 13, contest 12,
lockjaw 2, expedition 2, Nevermore 2, Speedbump 1, the night 1, wound_fever 1.

The pilot's noise IS cleared on the two questions this confirm was asked:
starvation deaths went the other way (13 vs 26 — armed starves less), and
the wound_fever cluster did not reproduce as an armed-only mode. But a new
median-survival miss appeared in its place.

### Wall numbers (standing directive)
national 15/24 (armed) vs 16/24 (control); table 0/24 vs 1/24; won 0/24
both; wave4 9/24 vs 7/24; wave5 0/24 vs 1/24; median survival 124d vs 156d.
The scale wall stands: national in ~2/3 of runs, the table once (control),
no wins either side.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — leadcourt s44 d1/d19.** d1: the layer fires (+210) while the
STARVING beat and a half-ration village meal land the same day — the
scholar tops up from the pack because the communal bowl won't cover. d19:
+296 mid-day, same framing. Reads as a person managing hunger: names the
why, proactive, in-context. Not robotic.

**Episode 2 — belongseek s55 d25–d40: the starvation-stretch grind.** The
layer fires 11 times (+90 to +321) across a two-week village starvation
(pantry empty, nightly STARVING beats, half rations). The scholar keeps the
bank from emptying while everyone else goes to bed hungry. The voice never
repeats mechanically — it reads as the scholar quietly looking after
themselves while the village frays. Small top-ups against a big deficit;
the pack cannot fix a village famine.

**Episode 3 — leadcourt s110 d1/d32.** d1 +210, then the run collapses into
a pantry crisis (empty pantry by d30, "choosing-who-eats" vote) and the
scholar dies d31. The layer's two meals are honest but irrelevant to the
outcome — the trajectory diverged on day 1 (deterministic per seed; the
control twin survived to 180).

**Verdict**: the voice passes twice over (a person, not a robot). The
mechanism is honest and the amounts are pack-limited — the same binding
constraint the pilot found.

## What the village looked like (assessor's notes)

On the armed side the scholar is visibly less hungry (611 vs 2153
hunger-days, starvation deaths halved), but the village looks the same: the
pantry still empties on the same schedule, the trust throttle still bites
early, the table still waits. The layer is a scholar-side timing tweak —
it changes how often the scholar goes to bed starving, not what the village
looks like. The median gap comes from the middle of the distribution: armed
losses cluster at 77–123d where control is more bimodal (early or 180d).
Per-seed sign on survival: armed-longer 9, control-longer 11, ties 4 — a
coin flip. The pilot on 8 of these same seeds showed the OPPOSITE median
direction (armed +14d). Same layer, same seeds, different master: the
median statistic is fragile to seed-set/master composition. No plausible
direct mechanism exists (det-gate: the ONLY effect is the honest eat; a
mid-day top-up cannot plausibly kill a scholar). This is
trajectory-divergence noise, not harm: the first mid-day eat changes the
scholar's kcal at a decision point, the RNG stream diverges, some
trajectories are worse. The combat/sickness inflation (144 vs 115, 27 vs
13) is downstream of that divergence, not of eating.

## Metric review (§14)

NO-GO as pre-registered (guardrails bind; no re-scoring). Notes for the
NEXT run:
1. This is the SECOND kill on noise-scale survival guardrails for this
   lever (pilot: starveDeaths 18 vs 16, wound_fever 3/0; confirm: median
   124 vs 156 with a 9-11-4 sign split and the pilot showing the opposite
   direction on the same seeds). Per the run brief, a second kill on
   noise-scale = the layer stays dead. It stays dead: re-running the same
   lever hoping for a friendly seed set would be p-hacking by another name.
2. The PRIMARY is not in doubt (0.284x, 17/24 seeds, det-gate clean). The
   survival guardrail is the wrong shape for a timing lever whose only
   effect is moving an honest eat earlier: median survival is fragile to
   trajectory divergence on fixed seed sets. A future arm wanting this
   mechanism should pre-register a survival-SHARE guardrail (starvation
   death share, or deaths-by-cause distribution distance) rather than a
   median-days bar — or run 2x seeds.
3. The binding constraint on the lever itself is still the pack (pilot
   Episode 2, confirm Episode 2): the timing is proven, the food must come
   from the sibling's pantry-draw arm. The natural next arm remains the
   combined timing+draw layer — but that is a NEW arm with its own
   pre-registration, not a third life for this one.
4. No metric changes mid-run were made; none needed.

## Convergence state

**killed-at-pilot** (second kill, on noise-scale — the layer stays dead).
Sim-findings #314 stays open: the scholar-daily-deficit is real (hunger
effect 0.284x twice), the mid-day timing mechanism is sound and
proven-neutral, but it cannot land under survival guardrails on fixed seed
sets because the honest eat perturbs trajectories. The pantry-draw side
(sibling territory) or a design-side answer (bank cap vs need) is where
#314 gets closed.

## RESULTS — confirm sweep: 48 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/middayconfirm-sweep.json. Per-seed:
evidence/2026-10-15/perseed-middayconfirm/. Transcripts:
evidence/2026-10-15/middayconfirm-transcripts/.

(results appended after the sweep)

## SENSE-TEST (Steve's law — transcripts read, not just counts)

(appended after the sweep)

## What the village looked like (assessor's notes)

(appended after the sweep)

## Metric review (§14)

(appended after the sweep)

## Convergence state

(appended after the sweep)
