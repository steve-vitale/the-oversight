# SIM-OVERSTOCK — overstock drawdown policy (ARM 2, loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-overstock
Axis: food-economy (scale-wall lens) — sim-findings OVERSTOCK-ROT (#163 lineage).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: on top of the landed prodthrottle (which stops NEW fresh
  surplus inflows at >4 fresh-days), does drawing down the STOCK already
  accumulated — through real outflow verbs — cut village-scale absolute
  fresh-rot kcal without starving the village or breaking the scale road?
- **Lever**: scripts/policies/overstock.js (OVERSTOCK=1, default OFF; wraps
  leadcourt/belongseek). When pantry fresh-days > 4 (the throttle's own
  overproduction signal) AND the siege-gate is clear, one drawdown verb per
  day, priority: (1) AID — tend a thin subordinate link (tendLink; the
  subaid mechanic: real 1,500 kcal aid credit to their pantry);
  (2) FEAST — hostFeast under the feastscale r13 gates (contribution
  accounting reused via recentGives+recentTribute, never reimplemented;
  7-day min cadence; 1.5x affordability); (3) TRIBUTE — pay the week's
  tribute early, in full. Cap: never push fresh-days below 2.
  HARD-GATE (loop A boundary): all verbs OFF when any lingerer/gorge threat
  is active or any raid was raised in the trailing 7 days — no
  siege-rationing, no raid-attractant instrumentation, no trust-gain
  mechanics. Policy-side only; zero src/js changes.
- **PRIMARY**: absolute fresh-rot kcal, armed <= 85% of control (identical
  seeds). GO needs the cut; KILL otherwise — fast kill, no confirm spend.
- **GUARDRAILS**: median survival regression-only (kill on >10d regression;
  improvements don't fire — prodthrottle-b2 metric review); national >=
  control-2; starvation deaths report; exiled unchanged; gorge nights report
  (drawdown should REDUCE raid attraction; if it doesn't, say so honestly —
  no claim on A's mechanism).
- **SECONDARY**: drawdown events (aid/feast/early-tribute counts + kcal),
  fresh-days distribution, pantry peaks, overstock-cliff events
  (>10k fresh-rot kcal in a single day).
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: 11/22/33/44/55/66/77/88 x leadcourt/belongseek = 16 runs/side,
  IDENTICAL seeds control vs armed. Both sides run on current master WITH
  the landed prodthrottle — the question is overstock's MARGINAL drawdown.
- **Det-gate**: bit-identical rerun gate before trusting comparisons
  (scripts/det-gate-overstock-20261014.js: armed policies 2x per seed).
- **Proof**: scripts/test-overstock-20261014.js — REAL RED phase (gate-off
  byte-identical vs parent policies; no verbs fire gate-off) → GREEN
  (verbs fire on the overstock fixture; siege-gate holds on lingerer,
  raid, and gorge fixtures; floor math; feast under r13 gates; tribute
  early-in-full; priority aid>feast>tribute; armed determinism).

## Proof results

RED (gate off): R1 gate-off byte-identical — overlead == leadcourt and
overbelong == belongseek per-day hashes, 40d x2 seeds, IDENTICAL (the
predation instrument's read-only wraps add no trajectory delta). R2: no
overstock verb fires gate-off on the overstock fixture; the parent's own
tend discipline still fires (that's the parent's behavior, not the layer).
G5 floor math: maxDraw = fresh - 2*burn verified (unit).

GREEN (OVERSTOCK=1): G1 AID fires — 1,500 kcal tended, sub pantry
1,000→2,500 (subaid channel, real food), trust 30→38, haven pantry lighter,
cause line + engine beat narrated, floor respected, one verb/day. G2/G3/G4:
linger
gerer / recent-raid / gorge-night fixtures all hold every verb off
(gate-hold counted). G6 FEAST fires when no aid channel — 5,000 kcal real
pantry draw, r13 contribution rule reused (tribHist), cause line narrated,
floor respected. G7 TRIBUTE fires — week's tribute paid early in full via
the overstock verb (osTribute=1, not just the base discipline). G8
priority: aid wins over feast/tribute (one verb/day). G9 armed
determinism: overlead 40d bit-identical across runs.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

120d armed run, seed 44, overlead: 16 cause lines, 8 aids (22.7k kcal),
8 feasts (23.0k kcal), 0 tribute (lead road — no belong-side links),
gate held 23 days. The beats read as a village deciding:

- "🍖 The shelves groan — ~15 days of fresh on hand, and the rot is already
  circling. We eat the mountain tonight, or it eats itself. Light the fire
  — everybody eats." → "🍖 FEAST 📺 — Howard opens the pantry wide...
  Divya, Leandro, Konrad, Carlos and 1 more eat until the fire burns low."
- "🌾 Haven's shelves hold ~7 days of fresh — more than the village eats
  before it turns. The surplus goes to Stonebridge's fire, not the rot."
  → "🌾 Haven sends 4,480 kcal of grain to Stonebridge's fire — not
  tribute, the other way around. Someone's grandmother over there will
  remember who fed her. (Trust +8.)"

The cause line gives the WHY, the engine beat the WHAT; the tend beat's
fiction is engine-true (subaid). Aid amounts vary (1,512–4,480 kcal) via
the engine's honest whole-unit over-removal — the floor check
(maxDraw ≥ 1500) is against the nominal 1,500; on real overstock maxDraw is
50k+ so the over-removal can't threaten the 2-day floor, but the check is
nominal, not exact (named here, not hidden). The 7-day feast cadence holds
(8 feasts in 120d). Nothing reads robotic; no silent branches. **PASS.**

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate GREEN both
sides before trusting comparisons (armed 8/8 bit-identical;
control 8/8 bit-identical — the A/A noise floor is 0, so the #150
report-only escape does not apply).

| metric | control (OVERSTOCK unset) | armed (OVERSTOCK=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 3141.8k | **2003.5k** | **GO** (≤0.85× = 2670.5k; ratio **0.638**) |
| preserved-rot kcal | 277.8k | 169.8k | — |
| fresh-rot share | 91.9pp | 92.2pp | — |
| rot/day-alive | 1641 | 1150 (ratio 0.70) | — |
| median survival | 137d | **103d** | **MISS** (≥127d) |
| mean survival | 119.6d | 108.9d | — |
| national | 10/16 | 10/16 | ≥8 ✓ |
| table | 0/16 | **5/16** | — (LOUD, positive) |
| wins | 0/16 | 0/16 | — |
| max wave reach | 5 | 5 | — |
| wave-5 unlocks | 1/16 | 4/16 | — |
| hungryDays | 44 | 44 (identical) | report ✓ |
| starvation deaths | 19 | 18 | report ✓ |
| exiled | 0 | 0 | unchanged ✓ |
| gorge nights (armed only) | n/a (not instrumented) | 43 | report |
| drawdown verbs | 0 | 22a/94f/13t, 379k kcal | mechanism fires |
| siege-gate holds | 0 | 450 | gate live, not dead code |
| overstock cliffs (>10k/d) | 89d / 1184k | 43d / 612k | — |
| pantry peak | 116k | 118k | — |

Per-seed: rot fell on 13/16 seeds (absolute) and 12/16 (per-day-alive).
The 3 absolute rises are longer-life seeds (lead s22: 151→166d;
lead s66: 178→180d; lead s77: 88→77d but per-day rose).

**Verdict: KILLED AT PILOT per §14.** The primary passed decisively
(0.638 ≤ 0.85, and 0.70 per-day-alive — the effect is not just
"shorter lives rot less"). But the median-survival guardrail missed:
103d vs 137d control = −34d, exceeding the pre-registered 10d
regression bound. Both sides are deterministic (A/A noise floor 0), so
the −34d is a real lever-caused delta on these 16 seeds and the #150
report-only escape does not apply. A miss is NO-GO, never re-scored.

## Why the median moved (autopsy, not theory)

The −34d is concentrated on belongseek (5/8 seeds −49 to −61d;
leadcourt deltas: +17, +15, 0, +29, −2, +2, −11, −15 — flat). There is
NO dose-response (belo s55: 8 feasts → +32d; s77: 3 tributes → +25d)
and NO harm mechanism:

- **Starvation**: starveDeaths 19→18, hungryDays 44→44 IDENTICAL. The
  lever does not starve villages. The floor (never below 2 fresh-days)
  held on every verb (proof G1/G6).
- **Death shape**: combat 92→77, monster 32→32, sickness 15→15,
  starvation 19→18 — no new death mode, no shape change.
- **Scale road**: national 10→10, table 0→5 UP, wave-5 1→4 UP.
- **Autopsy** (belo s11 armed, deterministic re-run): the village died
  d131 of a 20-day HUMAN-raid grind (The Bloodied/Thornfield/Emberhold
  stripping 600–1800 kcal/night) plus monster kills (The Reunion took
  Nina, Elif, Darius; The Congregation took Hana, Meera), with a
  tribute-arrears spiral (11,250 → grief-leveraged 16,875/wk). The
  lever's ~30k kcal of drawdown is a footnote in the siege. The death
  is the mortality wall (violence), not the lever.

The survival delta is TRAJECTORY PERTURBATION: the verbs consume RNG
and move the pantry, dealing different fight/raid sequences. On these
16 seeds the perturbation shortened 5 belongseek runs. The
harm-specific metrics (starvation, hungryDays, death shape, national,
exiled) — the guardrail's actual purpose — all held.

## The table LOUD (telemetry-check, investigated same-run)

`table newly appeared: baseline 0 → current 5`. All 5 table seeds had
overstock feasts (6–18 each) and reached Arc 4. Mechanism: the
courtship road's feast machinery never fires (feastscale r13
diagnosis), so the table's lesser-seat food-deed rung
(sentimentTaught && feastSurgeUsed) is unreachable — the overstock
FEAST verb fires real feasts, which can arm the surge path and open
the table. A genuine positive secondary: the drawdown feast is also a
scale-road verb. (Not claimed as primary; named here for the next
run.)

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | 9/16 | 1/16 | 137d | 180d |
| armed | 10/16 | 5/16 | 0/16 | 11/16 | 4/16 | 103d | 180d |

Exiled: 0 both. The scale wall is not broken by this arm, but the
table path opened 5× — the first table unlocks on the courtship road
in this axis's pilots.

## Death-cause shares

Control (187 deaths): combat 92 (49%), monster 32 (17%), starvation 19
(10%), sickness 15 (8%), villager combat 14 (7%), wound 9 (5%).
Armed (168): combat 77 (46%), monster 32 (19%), starvation 18 (11%),
sickness 15 (9%), villager combat 11 (7%), wound 9 (5%), contest 6
(4%). Same shape, no new mode — villages die of violence, not hunger,
on both sides.

## Village assessment (plain words)

Sixteen villages, no survivors on the armed side past 180 except
belo s55 (the one 180d armed survivor, national, wave-5, table —
the overstock verbs fired 8 feasts + 1 tribute and the village
reached further than its control twin). The typical armed story: the
pantry fills, the village starts moving the surplus — grain wagons to
a thin subordinate's fire, a feast when the shelves groan, the week's
tribute paid early — and the rot pile shrinks by a third. Then the
wall comes: human raids, wave-2/3 monsters, the same violence that
takes every village. The lever doesn't save villages; it makes their
pantries honest while they live. The five table-reaching villages are
the surprise — the feast, meant as a drain, turned out to be a door.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the overstock drawdown policy —
  scripts/policies/overstock.js (OVERSTOCK=1, default OFF; DELETED per
  kill protocol — the file is removed, not committed), proof
  scripts/test-overstock-20261014.js (RED→GREEN, kept as instrument),
  sweep scripts/measure-overstock-20261014.js (kept), det-gates +
  smoke gate (kept). Zero src/js changes (policy-side only).
- **FILLED (instrument)**: the siege-gate via predation-lib
  (linger/gorge/raid-7d hard gate); the r13 contribution accounting
  reuse; the 2-fresh-day floor.
- **DOCUMENTED** (sim-findings.md): (a) the median-survival guardrail
  cannot distinguish trajectory perturbation from harm — it fired on a
  −34d perturbation with all harm metrics held; next rot-lever runs
  should use harm-specific guardrails (starvation deaths, hungryDays,
  death-shape, national) with median as report-only; (b) the overstock
  FEAST as a table-path opener (5 table unlocks via the food-deed
  rung) — a scale-road secondary worth its own arm; (c) master drift:
  the landed prodthrottle's measured effect attenuated on current
  master (control fresh-rot 3141.8k with throttle active vs b2-armed
  986.1k on the earlier master — the food-abilities commit landed
  between; the throttle still engages, 4,685 redirects); (d) gorge
  telemetry must be installed on BOTH sides (the control's parent
  policies don't install predation — armed gorge nights are
  report-only, uncompared).

## Metric review (§14)

1. **The median guardrail fired on perturbation, not harm — but it
   fired, and §14 binds.** The −34d is real (both sides
   deterministic), lever-caused (RNG/trajectory perturbation), and
   exceeds the pre-registered 10d bound. The #150 report-only escape
   requires A/A noise; the noise floor is 0. KILL stands. This is not
   re-scoring: the primary passed and the harm metrics held, but the
   guardrail as pre-registered missed.
2. **The guardrail is the wrong instrument for perturbation-driven
   survival shifts.** Its purpose (prodthrottle-b2 review) is catching
   starvation/regression-harm. Here starvation deaths (19→18),
   hungryDays (44→44), death shape, national (10→10), and exiled (0)
   all held — the village was not harmed by any channel the lever
   controls. A median-only guardrail will keep firing on combat
   perturbation. Next run on this axis: pre-register harm-specific
   guardrails (starvation deaths ≤ control+2, hungryDays ≤ control×1.1,
   no new death mode, national ≥ control−2) with median as
   report-only, per the #125 recommendation.
3. **The primary survived the longevity confound.** Absolute fresh-rot
   (−36%) partly reflects shorter lives; per-day-alive (−30%) confirms
   the mechanism. Future rot primaries should pre-register the
   per-day-alive form (the hungerdepth lesson in reverse).
4. **Absolute fresh-rot was the right primary** (the share barely moved:
   91.9→92.2pp — the prodthrottle lesson holds again).
5. **The table LOUD is a real secondary**, not noise: 5/5 table seeds
   had overstock feasts and hit Arc 4 via the food-deed rung the
   courtship road couldn't otherwise reach. It does not rescue the
   guardrail miss, but it promotes the feast verb to its own future
   arm.

## Convergence state

food-economy: **killed-at-pilot** (overstock). The village-scale rot
bind stands: prodthrottle (landed, −74% on its master) is attenuated
on current master; pantry triage killed (substitution); overstock
killed (median guardrail on perturbation). The remaining rot work:
re-measure the throttle on current master, and re-apply overstock with
harm-specific guardrails — the mechanism is proven (36% rot cut, no
starvation, table path opened) and preserved in evidence for
re-application.
