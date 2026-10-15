# SIM-AIDDRAIN — aid-as-drawdown (ARM 1, loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-aidspoil2
Axis: food-economy (scale-wall lens).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the sim-aidspoil arm (KILLED AT PILOT this morning) proved
  the aid-ORDERING question dead: game-code aid-only spoil-first drawdown
  moved aggregate absolute fresh-rot 1.32x the wrong way (798.5k→1055.0k).
  The remaining honest question is aid-AS-DRAWDOWN: do honest tendLink aid
  verbs on overstock pantries cut absolute fresh-rot vs PRISTINE? The
  spoilfirst control (driver ON, 412.6k) vs overdraw4's control (driver
  OFF, 1388.9k) hints the DRIVER itself is the effect — but those were
  different sweeps, and the baseline-drift rule forbids inheriting a
  baseline (#247). This arm re-measures with its OWN control in the SAME
  sweep: pristine leadfeast vs leadfeast + the aid driver.
- **Lever (policy-side, scripts/policies/aiddrain.js — ZERO src/js
  changes)**: the AIDDRIVER spec (fresh-days > 4 + siege-gate → ONE
  aid/day via honest tendLink on a thin subordinate: sub pantry < 5d of
  need, untended this week, not mourning; floor NEVER below 3
  fresh-days; NO feast verb; cause lines after confirmed verbs only)
  wrapping leadfeast (the r13 road, aid-dominant) as aidDrain.
  Env-gated: AIDDRAIN=1 (default OFF; browser-safe). The aid is the
  engine's own tendLink — whole units, honest over-removal, real sub
  pantry credit, +8 trust; no pre-draw trick, no spoil-first reorder
  (the ordering question is DEAD and is not retested). The aid
  preempts the base's weekly tend via tendedWeek idempotency (the
  engine dedups: tending is a rhythm, not a purchase). Siege-gate:
  lingerer / gorge-night-trailing-7d / raid-7d hold all verbs off;
  holds counted (adGateHeld). NO tribute verb. [needs-eyes] on the
  commit — new player-facing narration, inert unless AIDDRAIN=1.
  - Canon check: docs/CANON.md + docs/PRESERVATION.md read. Binding
    lines honored: "Rot can't be smoked back into food" (aid moves
    only good food through the honest engine verb — the engine never
    pays spoiled stacks); "No nonsensical calorie loss" (the verb's
    own conservation, proved by G10); human-skills≠alien-abilities
    untouched (tending is a social verb, not an ability).
- **Conditions**: CONTROL = pristine leadfeast (AIDDRAIN unset — the
  RED proof asserts the wrapper is byte-identical to the parent with
  the gate off, so pristine IS the gate-off wrapper). ARMED = aidDrain
  with AIDDRAIN=1 (driver fires aid on overstock days). The measured
  delta is the aid driver's drawdown on overstock pantries and nothing
  else. Control RE-MEASURED in the SAME sweep (never inherit a
  baseline — #247). Both sides on current master WITH the landed
  prodthrottle.
- **PRIMARY**: absolute fresh-rot kcal, armed ≤ 0.75 × control
  (identical seeds). (A 0.85 bar was the ordering arm's; the drawdown
  question inherits overdraw4's 2x proof — 0.75 is the honest bar for
  a drawdown claim.)
- **GUARDRAILS**: rot/villager-day ≤ control × 1.335 (r25b
  calibration); starvation deaths ≤ control+2; hungryDays ≤ control ×
  1.409 (#208); national ≥ control−2; table report-only; no new death
  mode (n≥3 per #216).
- **SECONDARY**: drawdown events (aid counts + kcal), per-day rot,
  fresh-days distribution, pantry peaks, overstock cliffs (>10k/d),
  table/national/wins, wave-4/5 unlocks, gorge nights, tribute kcal,
  four-realm formation, trap acquisition by source, counter
  discovery/counter-kill rate, young-link succession survival, tier-2
  and wave-3 reach.
- **Horizon**: 180d death-aware (pacing-law max; dead villages stop —
  the rot measured is rot the village lived to produce, not death-tail
  artifact beyond the +10d tail).
- **Seeds**: pilot 11/22/33/44/55/66/77/88 × (leadfeast / aidDrain),
  IDENTICAL seeds control vs armed. Confirm 12–16 only on pilot GO
  (fresh seeds). FEASTSCALE_R13=1 (the leadfeast road as briefed).
- **Det-gate**: 8/8 bit-identical per condition (16/16 per side),
  scripts/det-gate-aiddrain-20261015.js — before trusting any
  comparison. SMOKE=1 honesty gate before measuring.
- **Metric-review note (§14)**: the hungryDays guardrail here is
  ×1.409 (#208) rather than the spoilfirst arm's ×1.1, because the
  harm channel under test is the driver's own drawdown (a 3-day floor
  is HIGHER than overdraw4's suspect 2-day floor, but the aid moves
  food out of the haven on a DAILY trigger — hunger dynamics are the
  watch item, not a rounding band). If hungryDays reproduces
  overdraw4's elevation, the arm dies on the guardrail honestly and
  the floor question goes back to #200's lineage.

## Proof results (run BEFORE any sims)

RED (AIDDRAIN unset) — real RED phases, all pass:
- R1 gate-off byte-identical: aidDrain == leadfeast (40/40 per-day
  hashes, seeds 11 and 22).
- R2 no verbs fire gate-off on the overstock fixture (6.3 fresh-days);
  the parent's own tend discipline still fires (pantry 150000→148500,
  tendedWeek stamped).
ARMED (AIDDRAIN=1) — all pass:
- A1 the driver fires aid via the honest tendLink verb (adAid=1, 1500
  kcal): sub pantry 1000→2500 (subaid channel, real food); trust
  30→38; haven pantry lighter by exactly the aid (150000→148500);
  cause line AFTER the engine beat (tend@0 cause@1 — honesty ordering
  pinned); floor respected (6.3→6.2 fresh-days); one verb/day marked;
  the aid went to the thin channel (event recorded, sub=thinval).
- A2 thin-channel negative: a FAT subordinate (500000 kcal = 25d of
  need) gets no aid.
- A3 mourning link gets no aid (grief is not bought off).
- A4/A5/A6 siege-gate: lingerer / recent-raid (lastRaidDay=28, day=30)
  / gorge-night-trailing-7d (gorge day=24, day=30) all hold verbs off;
  hold counted (adGateHeld=1). A6b: an 8d-old gorge night does NOT hold
  (the 7d window is real).
- A7 floor math: maxDrawdownKcal = fresh − 3×burn (0 on the 2.08d
  fixture — aid refused; 78214 on real overstock — aid affordable).
- A8 DRIVER NEVER PAYS TRIBUTE (negative assertion): an owed
  belong-side link on the overstock fixture — no adTribute counter,
  tributePaidWeek untouched, the aid went to the thin channel.
- A9 CONSERVATION: pantry 150000→148500, paid=1500 — kcal in = kcal
  out; whole units (300→297 × 500); no emptied stacks linger.
- A10 one verb/day: a second daily the same day fires nothing new.
- A11 armed determinism: AIDDRAIN=1 bit-identical across runs (40 rows).
Det-gate 16/16 (8/8 control pristine leadfeast + 8/8 armed aidDrain) +
SMOKE=1 honesty gate green both sides before trusting comparisons.
RESULT: all checks passed (RED, ARMED), independently re-run.
Post-kill: the driver is DELETED per kill protocol; all four
instruments INFO-SKIP when it is absent (verified).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, aidDrain seed 33, 120d: 35 aid beats. The aids are the
engine's own tend beats (named subordinates — Thornfield, Emberhold,
The Bloodied; honest varying amounts 1,500/1,550/1,600/4,000/4,600 from
whole-unit over-removal on big-unit stacks) interleaved with the
driver's cause lines, fired after confirmed verbs:
- "🌾 Haven's shelves hold ~66 days of fresh — more than the village
  eats before it turns. The surplus goes to Thornfield's fire, not
  the rot." (d35; the count is post-draw, honest — and 66 fresh-days
  shows how small the 1,500-kcal tap is next to the pantry)
- "🌾 Haven sends 1,600 kcal of grain to Emberhold's fire — not
  tribute, the other way around. Someone's grandmother over there
  will remember who fed her. (Trust +8.)" (d38)
The aid beats read as a village deciding — the why after the what,
thinning counts, named recipients. Nothing robotic in the driver's
lines.
**Documented blank (out of arm, pre-existing)**: the engine's own
tend beat ("Someone's grandmother over there will remember who fed
her. (Trust +8.)") repeats byte-identically on every tend — the
voice-repetition blank the aidspoil arm already filed. Not chased
this run.
**PASS** (with the documented blank).

## Pilot results

8 runs/side, identical seeds (11/22/33/44/55/66/77/88 ×
leadfeast/aidDrain), 180d death-aware, FEASTSCALE_R13=1. Det-gate
16/16 + SMOKE green both sides before trusting comparisons.

| metric | control (pristine leadfeast) | armed (aidDrain) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 3143.8k | **3187.9k** | **MISS** (need ≤ 2357.9k; ratio **1.014**) |
| rot/villager-day | 339 | **320** | ✓ (need ≤ 452.6) |
| hungryDays | 17 | 20 | ✓ (need ≤ 23.95) |
| starvation deaths | 1 | 1 | ✓ (need ≤ 3) |
| national | 6/8 | 6/8 | ✓ (need ≥ 4) |
| table | 8/8 | 7/8 | report-only |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 8/8 | 7/8 | — |
| wave-5 unlocks | 6/8 | 3/8 | — |
| median survival | 141d | 152d | report-only |
| drawdown verbs | 0a (pristine) | 63a (152k) | mechanism fires |
| siege-gate holds | 0 | 552 | gate live |
| gorge nights (tracked) | 0 | 118 | — |

Per-seed armed/control fresh-rot ratios: s11 1.00, s22 1.28, s33
1.00, s44 0.82, s55 2.59, s66 0.85, s77 0.66, s88 23.5 (4k→105k —
the control seed was a near-zero-rot seed; the armed twin diverged
into a fat-pantry trajectory, peak 60k, fresh-days samples hitting
116). Excluding the s88 artifact the direction FLIPS by seed
(0.66–2.59) — seed-noise dominance, not a directional signal. The
pre-registered primary is aggregate, and it missed: 1.014×, not
≤0.75×.

**Verdict: KILLED AT PILOT per §14.** The primary missed (1.014× vs
the 0.75 bar). All guardrails held — this is a clean null, not a
harm kill: rot/vd 0.94× (well inside the 1.335 band), starvation
flat at 1, hungryDays 1.18× (inside the 1.409 band), national flat
at 6/8. No confirm spend — 63 honest aid verbs / 152k kcal of
drawdown moved aggregate fresh-rot by +1.4%, which is noise. The
aid verb is not a rot lever at this scale: it is a 1,500-kcal tap
next to a pantry that swings 36k–134k at peak and rots 3.1M on its
own weather.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | exiled | maxArc |
|---|---|---|---|---|---|---|---|---|---|
| pilot control | 6/8 | 8/8 | 0/8 | 8/8 | 6/8 | 141d | 180d | 0 | 4 |
| pilot armed | 6/8 | 7/8 | 0/8 | 7/8 | 3/8 | 152d | 180d | 0 | 4 |

Exiled: 0 everywhere. No wins on either side — the scale wall stands
(the table seats, 15/16 combined, but nobody wins). The armed side's
fewer wave-5 unlocks (3 vs 6) is seed noise, not a guardrail — the
wave-5 seeds diverged on survival days, not on lever action. The
telemetry-check LOUD line from the aidspoil arm (national 8→3 vs the
scale-wall baseline) is not reproduced here: both sides sit at 6/8
national, inside the guardrail.

## Death-cause shares

The per-seed JSONs' `result.samples.deaths` came back empty on both
sides — the instrument gap the aidspoil arm already documented (the
measure instrument's death-share capture fails silently on this
harness path). What is measured: starvation deaths 1→1 (guardrail
≤3, PASS — via the cause-regex count). No death mode reached n≥3 on
either side in the captured data, so no new-mode verdict can be
drawn beyond the flat starvation count. The next food-economy arm
should fix the instrument or drop the per-cause secondary.

## Village assessment (plain words)

Eight villages per side on the leadfeast road, and the story is
scale, not mechanism. On both sides the pantries behaved the same
way — the aid verb fired 63 times across the armed runs, 152k kcal
in honest 1,500-kcal tends to Thornfield, Emberhold, and The
Bloodied, each one narrated after the fact with a thinning count —
and the rot pile did not notice. The control rotted 3,144k; the
armed rotted 3,188k. The aid is a teaspoon next to a pantry that
peaks at 134k and rots in hundred-kilo lots on its own weather. On
seed 88 the teaspoon even looked harmful (4k→105k), but that is the
seed-noise signature this whole lineage keeps showing: the control
twin was a near-zero-rot seed, the armed twin diverged into a
fat-pantry trajectory (fresh-days samples hitting 116), and the
aid's 30k of drawdown was along for the ride, not driving.

Who thrived: the villages that reached national (6/8 both sides) did
it on the same road with or without the aid — the aid changed no
trajectory. Who died: the same combat/monster/raider deaths both
sides, starvation flat at 1. The aid fed thin subordinates real
grain (+8 trust a tend, 63 tends) — the social ledger moved, the rot
ledger didn't. The blank this run fills is the honest one the task
named: the aidspoil control (driver ON: 47 aids + 22 feasts) rotted
799k on these exact seeds and this exact master while pristine
rotted 3,144k. The aid half of that driver is now measured at zero.
Whatever moves rot in that driver is the FEAST half — and that is a
different arm, not a re-score of this one.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: aid-as-drawdown — the aid-only
  policy driver (scripts/policies/aiddrain.js, AIDDRAIN=1, default
  OFF; zero src/js changes) wrapping leadfeast as aidDrain:
  fresh-days > 4 + siege-gate → ONE honest tendLink aid/day on a thin
  subordinate (< 5d of need, untended this week, not mourning), 3-day
  floor, no feast, no tribute, cause lines after confirmed verbs.
  DELETED per kill protocol (the layer never touched game code, so
  there is nothing to revert — byte-clean by construction). Kept as
  instruments: scripts/test-aiddrain-20261015.js (RED/ARMED, all
  pass; INFO-SKIP when the driver is absent),
  scripts/det-gate-aiddrain-20261015.js (16/16; INFO-SKIP),
  scripts/measure-aiddrain-20261015.js (INFO-SKIP),
  scripts/sense-aiddrain-20261015.js (INFO-SKIP), this evidence file
  + aiddrain-pilot-{control,armed}.json + per-seed JSONs under
  evidence/2026-10-15/.
- **DOCUMENTED** (backlog — the named next arm): "feast-as-drawdown".
  The aidspoil control (driver ON: 47 aids/97k + 22 feasts/58k)
  rotted 799k on the IDENTICAL seeds and master where pristine
  leadfeast rotted 3,144k (per-seed: s44 181k→590k at equal 180d —
  the effect is not a longevity confound; rot/vd 115 vs 339). This
  arm proves the aid half contributes NOTHING (63 aids/152k → 1.014×).
  The remaining candidate is the feast verb (pantryDraw-native
  fresh-first, "eat the mountain tonight") — it needs its own arm
  with its own control, same sweep. Do NOT retest aid ordering (dead)
  or aid-as-drawdown (dead as of this arm).
- **DOCUMENTED** (instrument): the measure instrument's per-cause
  death shares came back empty again (result.samples.deaths) — the
  aidspoil arm already filed this; the next food-economy arm should
  fix the capture or drop the per-cause secondary to
  starvation-only.
- **DOCUMENTED** (pre-existing, out of arm): the engine's tend beat
  repeats byte-identically on every tend — the voice-repetition
  blank, already filed by the aidspoil arm.

## Metric review (§14)

1. **KILL stands — primary missed (1.014 vs ≤0.75).** No re-scoring.
   The pilot was the right size: 63 verbs fired, the mechanism ran,
   and the aggregate moved 1.4%. This is a clean null, not an
   underpowered sniff test.
2. **All guardrails held, so this is a null kill, not a harm kill.**
   rot/vd 0.94× (inside the 1.335 band — the mechanism is not even
   directionally real), starvation flat at 1, hungryDays 1.18×
   (inside the 1.409 band), national flat at 6/8. The 3-day floor did
   its job: no overdraw4-style hunger elevation.
3. **The "own control in the SAME sweep" rule mattered again, in the
   other direction.** This arm's pristine control (3,144k) is
   nothing like the aidspoil control (driver ON: 799k) — the DRIVER
   moves the baseline 4×, not the lever. Inheriting the aidspoil
   control would have read the aid-only arm as a 4× win. The honest
   read is 1.014× — noise.
4. **The hungryDays ×1.409 band (#208) was the right width.** The
   arm's watch item was hunger dynamics from daily-triggered
   drawdown; 20 vs 17 sits inside the band without masking. The 3-day
   floor (vs overdraw4's suspect 2-day floor) is validated as the
   hunger-safe floor for drawdown verbs.
5. **The s88 seed (23.5× ratio on a 4k control seed) is a metric
   lesson, not a lever signal.** Near-zero denominators make ratios
   lie; the aggregate primary is robust to it (excluding s88 the
   aggregate is 0.99× — still a miss), and the per-seed flip pattern
   (0.66–2.59) is the noise signature. Future arms: report the
   aggregate AND the ex-near-zero range.

## Convergence state

food-economy: **killed-at-pilot** (aiddrain). Aid-as-drawdown is dead
as a rot lever: 63 honest tendLink aids (152k kcal) on overstock
pantries moved aggregate absolute fresh-rot 1.014× vs pristine
(3,144k→3,188k), per-villager-day rot 0.94× — noise, with the effect
direction flipping by seed. The aid verb is a social verb (trust,
thin-subordinate feeding), not a drawdown verb at rot scale. Layer
deleted per kill protocol; instruments kept as INFO-SKIP. The live
question the pilot isolates is **feast-as-drawdown** (backlog): the
aidspoil driver's feast verb is the only remaining candidate for
that driver's 4× rot reduction (799k vs 3,144k, same seeds/master).
food-economy stays `converging`; prodthrottle remains the only
landed rot lever.
