# SIM-OVERDRAW3 — soonest-spoiling-first overstock drawdown (ARM 2, loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-overdraw3
Axis: food-economy (scale-wall lens) — sim-findings #199 (OVERSTOCK-ROT lineage).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the overstock R2 drawdown was KILLED at pilot because its
  aid/tribute verbs drained through `Game._removePantryKcal`, which sorts
  the pantry ascending by spoilDay and draws from the LEAST-perishable end
  — 483k kcal of drawdown moved rot only 64k and per-day-alive rot ROSE
  13.6%. The rot pool (food nobody touches) survived. This arm rebuilds the
  drawdown so EVERY verb draws SOONEST-SPOILING FIRST, using pantryDraw's
  ordering (the ordering the feast verb already uses): does the drawdown now
  cut absolute fresh-rot kcal without starving the village or breaking the
  scale road?
- **Lever**: scripts/policies/overdraw3.js (OVERDRAW3=1, default OFF; wraps
  leadcourt/belongseek as overlead/overbelong). When pantry fresh-days > 4
  (the throttle's own overproduction signal) AND the siege-gate is clear,
  one drawdown verb per day, priority: (1) AID — tend a thin subordinate
  link (tendLink; subaid 1,500 kcal); (2) FEAST — hostFeast under the r13
  contribution gates (reused via recentGives+recentTribute, 7d cadence,
  1.5x affordability); (3) TRIBUTE — pay the week's tribute early, in full
  (floor-capped). Aid/tribute pantry drains route through pantryDraw's
  fresh-first ordering: the layer pre-draws the verb's nominal kcal, then
  answers the engine's _removePantryKcal from the already-drawn food (the
  engine accounting records actuals; the pantry is drained exactly once).
  Floor: never push fresh-days below 2 (pre-draw capped at
  maxDrawdownKcal = fresh − 2×burn). Hard-gate: all verbs OFF during
  lingerer/gorge threats or raid in trailing 7d. Cause lines follow
  CONFIRMED verbs (the R2 aid honesty bug — cause before verb dangling on
  tend refusal — is fixed in this layer). Policy-side only, zero src/js
  changes.
- **PRIMARY**: absolute fresh-rot kcal, armed ≤ 0.85× control (identical
  seeds, prodthrottle precedent).
- **GUARDRAILS**: armed rot-per-villager-day ≤ control × 1.335 (r25b rotcal
  A/A noise calibration); national ≥ control−2; median ≥ control−10d; no
  new death mode.
- **SECONDARY**: drawdown events (aid/feast/early-tribute counts + kcal),
  fresh-days distribution, pantry peaks, overstock-cliff events (>10k/d),
  per-day-alive rot, table/national/wins, wave-4/5 unlocks, gorge nights.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: pilot 11/22/33/44 × leadcourt/belongseek = 8 runs/side
  (subset of the overstock2 seed set, for comparability), IDENTICAL seeds
  control vs armed. Confirm 12–16 only on pilot GO. Both sides on current
  master WITH the landed prodthrottle — the question is overdraw3's
  MARGINAL drawdown.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule);
  SMOKE=1 honesty gate proving the policy actually ran (proof verified
  RED→GREEN pre-sims, incl. the G10 fresh-first ordering check and the R3
  naive-RED foil).
- **Note**: the per-seed ratio spread in R2 (0.10–4.49) showed the
  identical-seed design is perturbation-dominated for verbs that consume
  RNG; the 0.85 bar is the sniff test. The R2 §14 metric review's
  recommendation (pre-register the per-day-alive form alongside the
  absolute) is adopted as a guardrail here (1.335 cap).

## Proof results (run BEFORE any sims, 2026-10-14)

RED (gate off): R1 gate-off byte-identical — overlead == leadcourt and
overbelong == belongseek per-day hashes, 40d × 2 seeds, IDENTICAL. R2: no
overdraw3 verb fires gate-off on the overstock fixture; the parent's own
tend discipline still fires (the parent's behavior, not the layer). R3
(NAIVE RED foil): Game._removePantryKcal(1500) on a 3-stack fixture
(+2d/+10d/+30d) drains the +30d stack first — documents the R2 failure
mode and proves the G10 fixture discriminates. G5 floor math:
maxDrawdownKcal = fresh − 2×burn (2,143 at the unit fixture).

GREEN (OVERDRAW3=1): G1 AID — 1,500 kcal tended fresh-first, sub pantry
1,000→2,500 (subaid), trust 30→38, haven pantry lighter, cause line AFTER
the confirmed verb + engine beat narrated, floor respected, one verb/day.
G2/G3/G4: lingerer / recent-raid / gorge-night fixtures all hold every
verb off (gate-hold counted). G6 FEAST — 5,000 kcal real pantry draw, r13
contribution rule reused (tribHist), cause line narrated after hostFeast
confirmed, floor respected. G7 TRIBUTE — week's tribute paid early in
full via the layer verb (osTribute=1, week current), cause line after
confirmation. G8 priority: aid wins over feast/tribute (one verb/day).
G9 armed determinism: overlead 40d bit-identical across runs. G10
FRESH-FIRST ORDERING (the arm's mechanism): on the 3-stack fixture the
aid verb drained the +2d stack (96→93 units, exactly 3×500) while the
+10d/+30d stacks stayed at 96 — and the tribute verb did the same
(+2d 96→88 for its 4,000 draw, others untouched). A drawdown that did NOT
drain the soonest-spoiling end first would FAIL G10 — this is the RED
failure the task required.
RESULT: all checks passed (RED and GREEN), independently re-run.
Det-gate 16/16 bit-identical BOTH sides (scripts/det-gate-overdraw3-20261014.js);
SMOKE=1 honesty gate green both sides.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, overlead seed 22, 120d: 85 drawdown beats (14 aids, 13
feasts, 32 gate-holds). The beats read as a village deciding — the cause
line gives the WHY, the engine beat the WHAT, and the cause now FOLLOWS
the confirmed verb (the R2 honesty bug is fixed; no cause line dangles
before a refusal — refusals are pre-checked):

- "🌾 Haven sends 1,500 kcal of grain to Stonebridge's fire — not tribute,
  the other way around. Someone's grandmother over there will remember who
  fed her. (Trust +8.)" → "🌾 Haven's shelves hold ~56 days of fresh —
  more than the village eats before it turns. The surplus goes to
  Stonebridge's fire, not the rot."
- "🍖 FEAST 📺 — Casey opens the pantry wide: 7× Foraged food, 1× Snared
  meat. Zuri, Wolfgang, Walt, Caitriona and 4 more eat until the fire burns
  low..." → "🍖 The shelves groan — ~50 days of fresh on hand, and the rot
  is already circling. We eat the mountain tonight, or it eats itself."

Named villagers open feasts (Casey, Caitriona, So-yoon, Victor, Sigrun);
named subordinates receive aid (Stonebridge, Thornfield, Emberhold); the
subaid is reciprocal ("Aid from Stonebridge" appears in a feast menu).
Fresh-day counts in the cause lines are honest (56→12 as the pantry
thins). Nothing reads robotic.

**PASS.**

## Pilot results

8 runs/side, identical seeds, 180d death-aware. Det-gate GREEN both
sides before trusting comparisons (16/16 bit-identical each; the A/A
noise floor is 0 on this tip with the deterministic harness clock).

| metric | control (OVERDRAW3 unset) | armed (OVERDRAW3=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 1741.9k | **900.0k** | **PASS** (≤ 1481.1k; ratio **0.517**) |
| preserved-rot kcal | 170.0k | 89.4k | — |
| fresh-rot share | 91.1pp | 91.0pp | — |
| rot/day-alive | 1543 | 875 (ratio **0.567**) | **PASS** (≤ 2060) |
| median survival | 179d | 123d | **MISS** (≥ 169d) |
| national | 5/8 | 5/8 | ≥ 3 ✓ |
| table | 0/8 | **4/8** | — (LOUD, positive, 3rd replication) |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 3/8 | 6/8 | — |
| wave-5 unlocks | 0/8 | 5/8 | — |
| hungryDays | 11 | 17 | report |
| starvation deaths | 5 | 4 | report |
| exiled | 0 | 0 | unchanged ✓ |
| gorge nights | 0 | 12 (9+3) | report |
| drawdown verbs | 0 | 38a/69f/49t, 499k kcal | mechanism fires |
| siege-gate holds | 0 | 593 | gate live, not dead code |
| overstock cliffs (>10k/d) | 47d / 625k | 11d / 160k | — |
| pantry peak | 116k | 114k | — |

Per-seed rot ratios (armed/control): 0.02, 0.52, 0.14, 1.62 (belong) /
2.02, 0.65, 2.38, 0.52 (lead). The mechanism moves the rot pool on 6/8
seeds; the two rises are trajectory perturbation (lead s11: 86→115d
longer life; lead s33: 37→159d much longer life — both armed seeds lived
LONGER).

**Verdict: KILLED AT PILOT per §14.** The primary passed decisively
(0.517, and 0.567 per-day-alive — the fresh-first mechanism genuinely
drains the rot pool), but the median-survival guardrail missed: 123d vs
the pre-registered 169d bar (−56d). Per §14, a GO met with a guardrail
breached is NO-GO — never re-scored. No confirm spend.

## Why the guardrail missed (autopsy, not theory)

The −56d is concentrated on the belong road, and this time it carries a
harm signal — not pure perturbation:

- **Belong twins**: control 180/136/180/180 → armed 58/123/92/180. Two
  armed belong villages collapsed 88–122 days early. The lead road went the
  OTHER way (control 86/151/37/179 → armed 115/180/159/122 — three of four
  armed lead seeds lived longer).
- **Starvation on the belong road**: control-belong 0 starvation deaths →
  armed-belong 3 (belo-s11: 2 starve deaths in 58d after 1 early tribute +
  2 feasts; belo-s33: 1 starve death in 92d after 3 tributes + 4 feasts).
  Their control twins lived the full 180d with zero starvation.
- **The channel is the tribute verb's TIMING, not its ordering.** The
  fresh-first routing fixed what the verbs take (soonest-spoiling first —
  the primary proves it), but the tribute verb still pays the week's food
  up to 6 days EARLY. The floor (2 fresh-days at draw time) can't protect
  against what happens after: the tribute payment arms the r13 feast gate
  (it counts as contribution), so tribute → feast ratchets fragile
  belong-road pantries down toward the floor, where any raid/gorge night
  tips the village into the starvation spiral. This is R2's harm channel
  reproducing with fresh-first ordering — the ordering fixed the rot
  mechanism; the early-payment timing is the remaining harm.
- **The lead road is clean**: 38 aids + 37 feasts, 152k kcal moved, zero
  tribute verbs (no belong-side links on the lead road), survival flat to
  better, starvation 5→1 on the lead side. The aid and feast verbs show no
  harm channel.

## The table LOUD, replicated a third time (telemetry-check, investigated same-run)

`LOUD: table newly appeared: baseline 0 -> current 4`. R1: 0→5, R2:
0→5, R3: 0→4 — three independent pilots, same secondary. Mechanism
(unchanged): the overstock feast fires real feasts on the courtship road,
arming the table's lesser-seat food-deed rung (sentimentTaught &&
feastSurgeUsed) that the courtship policies can't otherwise reach. The
feast as table-path opener (backlog #187) is now a 3× replicated finding
and stands as its own future arm, measured on table/wave-5 reach rather
than rot. Wave-5 unlocks 0→5 this run (control 0/8, armed 5/8) — the
scale road moved with the feasts.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 5/8 | 0/8 | 0/8 | 3/8 | 0/8 | 179d | 180d |
| armed | 5/8 | 4/8 | 0/8 | 6/8 | 5/8 | 123d | 180d |

Exiled: 0 both. The scale wall is not broken by this arm, but the table
path opened 4× (3rd replication) and wave-5 unlocked on 5/8 armed runs vs
0/8 control.

## Death-cause shares

Control (101 deaths): combat 67 (66%), monster 12 (12%), sickness 6 (6%),
villager combat 5 (5%), starvation 5 (5%), contest 3 (3%), dehydration 1,
expedition 1, lockjaw 1.
Armed (80): combat 43 (54%), monster 9 (11%), sickness 7 (9%), villager
combat 6 (8%), starvation 4 (5%), wound ("a wound that wouldn't close") 5
(6%), contest 3 (4%), alien 2 (3%), dehydration 1. Same shape — villages
die of violence, not hunger, on both sides. The armed-only "wound" (5)
and "alien" (2) labels are low-count singletons in combat-adjacent
categories; per the R2 precedent they read as label noise, not a new
death mode. The BELONG-road starvation (0→3) is the harm signal, caught
by the median guardrail.

## Village assessment (plain words)

Eight villages, and this time the pantry learned honesty — the rot pile
nearly halved while the mechanism fired 499k kcal through real verbs:
grain wagons to Stonebridge and Thornfield and Emberhold, feasts when the
shelves groaned, the week's tribute paid early. The food that rotted
before was the food nobody touched, and now the verbs take the
soonest-spoiling end first — the rot pool finally moved, on both the
absolute (0.517) and the per-day-alive (0.567) forms. But the belong road
told the other half of the story: two villages paid their tribute early,
feasted on the back of it, and starved in the gaps — 58 and 92 days,
their twins living the full 180. The tribute's timing is the poison, not
its ordering. The lead road, with no tribute verb to fire, lived longer
and rotted less — the cleanest villages of the three overstock rounds.
And the feast kept opening its door: four villages reached the table,
five unlocked wave 5, none of it on the control side.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the soonest-spoiling-first overstock
  drawdown — scripts/policies/overdraw3.js (OVERDRAW3=1, default OFF;
  DELETED per kill protocol — the file is removed, not committed), proof
  scripts/test-overdraw3-20261014.js (RED→GREEN incl. the G10 fresh-first
  ordering check and R3 naive-RED foil, independently re-run, kept as
  instrument), sweep scripts/measure-overdraw3-20261014.js (kept, incl.
  rot/day-alive + wave-4/5 per-side tallies closing R2's measurement gap),
  det-gate scripts/det-gate-overdraw3-20261014.js (16/16 both sides, kept),
  sense script scripts/sense-overdraw3-20261014.js (kept). Per-seed JSONs
  + logs under evidence/2026-10-14/perseed-overdraw3-{base,armed}/,
  overdraw3-{baseline,armed}.json/.log (kept). Zero src/js changes
  (policy-side only).
- **FILLED (instrument)**: the fresh-first verb routing (pre-draw via
  pantryDraw + _removePantryKcal answered from the drawn food); the
  cause-after-confirmed-verb ordering (fixes R2's aid honesty bug); the
  G10 ordering proof as a reusable mechanism check.
- **DOCUMENTED** (for the coordinator's backlog): (a) the fresh-first
  rot mechanism is PROVEN — 0.517 absolute / 0.567 per-day-alive, the
  first drawdown to pass the primary on both forms; the R2 diagnosis
  (best-food-first verbs can't drain the rot pool) is confirmed by
  inversion; (b) the tribute verb's EARLY-payment timing is a real harm
  channel (belong-road starvation 0→3, two villages dead 88–122d early)
  independent of draw ordering — a future arm should keep fresh-first
  aid+feast and drop or re-time the early tribute (pay at week's end,
  not up to 6 days early); (c) the feast-as-table-door secondary is now
  3× replicated (0→5, 0→5, 0→4) with wave-5 unlocks 0→5 — worth its own
  arm measured on table/wave-5 reach; (d) the lead road (aid+feast only,
  no tribute) is clean: survival flat-to-better, starvation down, rot
  down — the harm is tribute-specific; (e) control on this tip:
  1,741.9k fresh-rot kcal with the throttle engaged — another #188 data
  point (r32b: 3,141.8k; R2: 2,916.6k; R3: 1,741.9k — the control is
  drifting down across runs on the same 8-seed subset as the tip moves).

## Metric review (§14)

1. **The median guardrail missed (123d vs the 169d bar) — KILL stands,
   no re-scoring.** The primary passed decisively (0.517), but §14 is
   explicit: a GO met with a guardrail breached is NO-GO. The guardrail
   fired WITH a harm signal (belong-road starvation 0→3, two villages
   dead 88–122d early), so this is not the r32b perturbation case — the
   instrument distinguished correctly again.
2. **The primary's two forms agreed (0.517 absolute, 0.567 per-day-alive).**
   The R2 review's recommendation to pre-register the per-day-alive form
   alongside the absolute paid off: both pass, so the effect is mechanism,
   not longevity confound. Keep this dual registration for future rot
   arms.
3. **The median guardrail keeps firing on the belong road's tribute
   channel.** Two of three overstock rounds killed on belong-road harm
   from the early-full tribute (R1: median-perturbation kill, no harm;
   R2: primary+starvation/hungryDays kill, real harm; R3: median kill,
   real harm). The tribute verb as designed (early, in full) is the
   problem child of this lever family. Next rot arm: drop the tribute
   verb or pay at week's end; keep fresh-first aid+feast.
4. **Per-seed ratio spread (0.02–2.38) remains perturbation-dominated**,
   but the two rises are both longer-life armed seeds — the mechanism
   signal survives the noise. The 8-seed pilot was the right size for the
   sniff test; no confirm was spent.
5. **The table secondary (0→4, 3rd replication) and wave-5 unlocks
   (0→5) are now the strongest scale-road signal in this axis's pilots.**
   They belong to the feast verb, not the rot mechanism — measure them
   as their own arm.

## Convergence state

food-economy: **killed-at-pilot** (overdraw3). The rot MECHANISM is
proven — soonest-spoiling-first drawdown cuts absolute fresh-rot to
0.517× control (0.567 per-day-alive), the first drawdown to pass the
primary on both forms. But the tribute verb's early-payment timing is a
real harm channel (belong-road starvation, median 179→123d), and per
§14 a guardrail breach is NO-GO. The lever as built is dead; its proven
parts (fresh-first aid+feast, no early tribute) are the starting point
for the next arm. The village-scale rot bind stands: prodthrottle
(landed) remains the only landed rot lever; pantry triage killed;
preservedrive killed; overstock killed three times (R1 median-perturbation,
R2 primary+harm, R3 median-harm). The feast-as-table-door (3× replicated)
graduates to its own arm.
