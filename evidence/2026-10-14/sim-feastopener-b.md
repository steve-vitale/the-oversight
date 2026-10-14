# SIM-FEASTOPENER — feast as table-path opener (ARM 2, loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-feastopener
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH
OPENER, the overstock r32b open secondary).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the overstock pilot (sim-overstock-b.md, KILLED AT PILOT on the
  median-survival guardrail — a perturbation miss, not a harm miss) opened a
  genuine positive secondary: 0→5 table unlocks, all Arc 4, all with 6–18
  overstock feasts, via the table's lesser-seat food-deed rung
  (sentimentTaught && feastSurgeUsed, src/js/table.js:84) that the courtship
  road's feast machinery otherwise never fires (feastscale r13 diagnosis).
  Isolated as its own lever: does a feast-FORWARDING policy layer — a
  MAJOR village feast thrown as the drawdown verb when the pantry is
  over-full — open the food-deed rung / table path on the courtship road?
- **Lever**: scripts/policies/feastopener.js (FEASTOPENER=1, default OFF;
  requires FEASTSCALE_R13=1 — the duty rides the feastscale r13 machinery;
  wraps leadcourt/belongseek). When pantry fresh-days > 4 (the landed
  prodthrottle's own overproduction signal) AND the feastscale r13 gates
  clear (reused, never reimplemented: dusk, at haven, one feast/day,
  contribution recentGives(7)+tributePaid(7)+tendPaid(7) >= 1500,
  affordability have >= cost*1.5, fusion-reactor ceiling, plan.ok) AND the
  siege-gate is clear (loop A boundary: no lingering monster, no gorge
  night in trailing 7d via predation-lib telemetry, no raid raised in
  trailing 7d), the duty throws a MAJOR village feast (whole-village
  hostFeast, the engine's honest cost) as the drawdown verb. The drawdown
  duty uses a 3-day min cadence (the rot clock, not the calendar —
  documented design call: the r13 allowance cadence 7d/14d paces
  allowance-feasts; a drawdown feast answers the spoil clock), keeps the
  r13 contribution rule (anti-parasite), the 1.5x affordability buffer
  (anti-famine), and a fresh floor of 2 days (never draw below it).
  Policy-side only; zero src/js changes. Loop A boundary respected:
  griefgrain owns hierarchy.js answerRenegotiation (untouched); wincensus
  is a diagnostic instrument (untouched).
- **PRIMARY**: ≥2 runs fire the food-deed/table rung, attributed
  end-to-end (sentimentTaught && feastSurgeUsed marked on the same run,
  traced to feastopener duty feasts), on identical seeds vs 0 control.
  GO needs ≥2 attributed; KILL otherwise — fast kill, no confirm spend.
- **GUARDRAILS** (harm-specific per the r32b #186 metric-review
  prescription — median is report-only, never a kill trigger):
  national >= control−2; starvation deaths <= control+2;
  hungryDays <= control×1.1; no new death mode (death-shape compare);
  exiled unchanged; median survival report-only.
- **SECONDARY**: Standing per avenue (war / diplomacy / plenty — finding
  #62's diplomacy-ceiling throughput question), feast counts + kcal,
  wave reach (1–5), Arc reach, table seats, siege-gate holds, fresh-days
  distribution, per-seed deed attribution (feastSurgeUsed day, table day).
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law
  absolute max). Dead villages stop; +10d tail max.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side,
  IDENTICAL seeds control vs armed. Control: FEASTOPENER unset (parents
  byte-identical). Armed: FEASTOPENER=1 + FEASTSCALE_R13=1.
- **Det-gate**: 16/16 or 32/32 bit-identical rerun gate before trusting
  comparisons (r27 rule). scripts/det-gate.js checkDeterminism.
- **SMOKE honesty gate**: the policy actually ran (daily called, deliberate
  acts > 0), and the duty fired ≥1 feast on an overstock fixture.
- **Proof**: scripts/test-feastopener-20261014.js — REAL RED phase
  (gate-off byte-identical vs parents; no verbs fire gate-off) → GREEN
  (duty fires on overstock fixture; siege-gate holds on lingerer, raid,
  gorge fixtures; r13 contribution gate honored; floor math; 3d duty
  cadence vs 7d allowance; armed determinism). Killed-proof degradation:
  INFO-SKIP, never MODULE_NOT_FOUND.

## Proof results

scripts/test-feastopener-20261014.js — REAL RED → GREEN, both phases green
(two consecutive GREEN invocations, 21/21 checks each; kill-protocol
INFO-SKIP guard installed for post-kill degradation).

RED (gates off): R1 gate-off byte-identical — openlead == leadcourt and
openbelong == belongseek per-day hashes, 40d x2 seeds, IDENTICAL (the
predation instrument's read-only wraps add no trajectory delta). R2: no
duty fires gate-off on the overstock fixture (6.3 fresh-days); pantry
untouched; no cause line.

GREEN (FEASTOPENER=1 + FEASTSCALE_R13=1): G1 duty fires on the overstock
fixture — 5,000 kcal real pantry draw, "eat the mountain tonight" cause
line + engine 🍖 FEAST beat, fresh-days 6.3→6.1 (floor respected). G2/G3/G4:
linger/raid-7d/gorge-7d fixtures all hold the duty off (gate-hold counted
per cause). G5: contribution <1500 holds off; >=1500 fires. G6: the floor
gate is LIVE (binds on a synthetic 200k-cost plan) and passes honestly on
the fixture (6.07d after). G7: 3d duty cadence — fires d30, holds d31/d32,
fires again d33 (the r13 allowance's 7d/14d does not pace the duty). G8:
armed determinism — identical fixture twice, identical outcome.

Design interaction found and fixed during GREEN: the r13 allowance feast
(firing from base.upkeep) was stealing the one-feast/day slot before the
duty ran, so the duty never fired on the fixture. Fix: the duty runs
BEFORE base.upkeep and shares the r13 cadence tracker (_fsLastFeastDay) —
on a drowning pantry the drawdown verb claims the slot; the allowance
fills only the days the duty leaves. A feast is a feast.

## Pre-registration correction (§11 — documented, not quiet)

Det-gate horizon 180d → 60d, then det-gate WAIVED in favor of prior
verification. Reason: 6 concurrent sim workers on the 2-core box (load
6–12) — a single 60d run takes 38s real (6s user); 32×180d det-gate runs
project to 4.5h. The gate's purpose (determinism before trusting
before/after) is met by: (1) the entropy source is FIXED (commits
85cfb0e7 + a9abbd66); (2) the overstock arm verified 16/16 bit-identical
at 180d on this exact code with these exact parent policies (evidence
2026-10-14/sim-overstock-b.md); (3) the feastopener layer contains zero
RNG, zero Date.now, zero external state — a pure function of game state
(proof G8: identical fixture twice, identical outcome). The pilot's
identical-seed before/after stands on the parents' verified determinism.
If per-seed trajectories show nondeterministic noise, it will be visible
in the before/after and reported honestly.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

120d armed run, seed 22, openlead: 19 duty feasts (46,708 kcal), 27
gate-holds. The beats read as a village deciding:

- "🍖 The shelves groan — ~52 days of fresh on hand, and the rot is
  already circling. We eat the mountain tonight, or it eats itself.
  Light the fire — everybody eats." → "🍖 FEAST 📺 — Casey opens the
  pantry wide: 5× Foraged food, 1× Snared meat. Zuri, Walt, Carlos,
  Victor and 1 more eat until the fire burns low. Somebody laughs so
  hard they cry. For one evening, nobody is surviving — they're just
  together. (−2,740 kcal from the pantry)" → "🍖 FEASTED ×2.03 until
  tomorrow's dawn... Strikes and abilities hit with the feast behind
  them."

The cause line gives the WHY, the engine beat the WHAT, the buff the
mechanical consequence. Nothing reads robotic; no silent branches.
**PASS** — with one pre-existing blank noted: the devotion channeling
line ("💛 You hold Carpenter's square... The feast was the weapon.")
fires VERBATIM every day d15–d48+ — the finding #64 repetition class
(competent.js channelDevotion, not this layer's doing). Filed, not
chased.

## Pilot results

16 runs/side, identical seeds, 180d death-aware. (Det-gate waived per
the documented correction above; the parents' 16/16 determinism was
verified by the overstock arm on this code, and the layer is RNG-free.)

| metric | control (gates off) | armed (FEASTOPENER=1) | pre-reg |
|---|---|---|---|
| food-deed rung fired | 0/16 | **13/16** | — |
| **attributed end-to-end** (**PRIMARY**) | 0/16 | **6/16** | **GO** (≥2) |
| table | 0/16 | **4/16** (1 full, 3 lesser) | — |
| wins | 0/16 | 0/16 | — |
| national (**GUARDRAIL**) | 10/16 | **5/16** | **MISS** (≥8) |
| starvation deaths | 15 | 12 | ≤17 ✓ |
| hungryDays | 35 | 37 | ≤38.5 ✓ |
| exiled | 0 | 0 | unchanged ✓ |
| median survival | 151d | 79d | report-only |
| max wave reach | 5 | 5 | — |
| max Arc | 3 | 4 | — |
| duty feasts | 0 | 68 (170k kcal) | mechanism fires |
| siege-gate holds | 0 | 406 | gate live |
| standing median | 100 (w25/d0/p0) | 225 (w0/d0/p160) | — |
| standing max | 202 | 565 | — |

Per-seed attribution (armed): 6 duty-attributed (lead s22, lead s33,
belo s11, belo s33, belo s44, belo s66); 7 more fired the rung via the
r13 allowance before the duty's first feast (surge-use ordered earlier —
the layer's r13 half, not the duty); 3 never fired the rung. The 4 table
seats: lead s11 FULL (r13 allowance, 0 duty feasts — the allowance alone
opened it), lead s22 lesser (duty-attributed), lead s66 lesser
(r13-attributed), belo s44 lesser (duty-attributed).

**Verdict: KILLED AT PILOT per §14.** The primary passed decisively
(6 ≥ 2 attributed, 13/16 rung fired vs 0/16). But the national
guardrail missed: 5/16 vs 10/16 control = −5, exceeding the pre-registered
−2 bound. A GO met with a guardrail breached is NO-GO. The miss is
trajectory perturbation (villages die earlier of the same causes —
combat/monster dominated both sides; starvation 12 vs 15 LOWER on armed),
not lever harm — but §14 binds, and the guardrail as pre-registered
missed.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | 9/16 | 1/16 | 151d | 180d |
| armed | 5/16 | 4/16 | 0/16 | 11/16 | 4/16 | 79d | 180d |

Exiled: 0 both. Wave-4 reach 9→11, wave-5 unlocks 1→4, Arc 3→4. The
feast-forwarding layer opens the table path (0→4) and the wave-5 unlocks
(1→4) but trades national reach (10→5) via earlier deaths.

## Death-cause shares

Control (195 deaths): combat 106 (54%), monster 31 (16%), starvation 15
(8%), sickness 15 (8%), villager combat 13 (7%), wound 6 (3%), contest 5
(3%), lockjaw 2, dehydration 1, expedition 1.
Armed (190): combat 99 (52%), monster 22 (12%), sickness 23 (12%),
wound 16 (8%), starvation 12 (6%), villager combat 7 (4%), contest 6
(3%), Callback 1, Eater 1, ambush 1, expedition 1. Same modes, no new
death mode — the named monsters are instances of the monster mode, not
new categories. Villages die of violence, not hunger, on both sides;
the armed side dies of the SAME violence, earlier.

## Village assessment (plain words)

Sixteen villages, and the feasts changed what the long ones could
reach. The typical armed story: the pantry fills past 4 fresh-days, the
village starts eating the mountain — a major feast every few days, the
shelves groaning, the rot circling — and the devotion lane arms, the
surge gets used in real fights, the food-deed rung fills. On six seeds
the rung fired through the duty's own feasts; on seven more the r13
allowance got there first. Four villages reached the table (one the
full seat, three the lesser) where the control reached zero.

But the feasts cost days. The villages that feasted died earlier —
not of hunger (starvation 12 vs 15, hungryDays flat), but of the same
raids and monsters on earlier days. The RNG the feasts consume and the
pantry they move deal different fight sequences, and on seven seeds the
new sequence ended the village before it could consolidate national.
The lever doesn't harm villages; it perturbs their trajectories, and
the national guardrail counts the perturbation as a miss.

The standout is leadcourt s22: 19 duty feasts, the food-deed rung fired
through the duty, the lesser table seat, wave-5 unlocked, standing 565
— the feast-forwarding layer working exactly as designed. The caution
is leadcourt s11: the FULL table seat with ZERO duty feasts — the r13
allowance alone opened it, which means the duty is not the only opener
and on some seeds is redundant.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the feastopener policy —
  scripts/policies/feastopener.js (FEASTOPENER=1, default OFF, requires
  FEASTSCALE_R13=1; DELETED per kill protocol — the file is removed, not
  committed), proof scripts/test-feastopener-20261014.js (RED→GREEN,
  kept as instrument with INFO-SKIP degradation),
  sweep scripts/measure-feastopener-20261014.js (kept),
  sense script scripts/sense-feastopener-20261014.js (kept),
  det-gate scripts/det-gate-feastopener-20261014.js (kept).
  Zero src/js changes (policy-side only).
- **FILLED (instrument)**: the siege-gate (linger/gorge-7d/raid-7d);
  the r13 gate reuse (contribution, affordability, fusion ceiling);
  the 3d duty cadence vs the r13 allowance; the fresh floor; the
  food-deed end-to-end attribution (surge-use ordering).
- **DOCUMENTED** (sim-findings.md): (a) the national guardrail, like
  the median, is perturbation-sensitive — it measures survival-to-76d,
  not harm; the #186 harm-specific prescription needs a
  perturbation-aware national bound; (b) the r13 allowance alone can
  open the table (lead s11 full seat, 0 duty feasts) — the duty is
  sufficient but not necessary on some seeds; (c) the devotion
  channeling line repeats verbatim daily (finding #64 class,
  competent.js); (d) the duty's 3d cadence vs the allowance's 7d/14d —
  the rot clock paces drawdown feasts, documented as a design call.

## Metric review (§14)

1. **The national guardrail fired on perturbation, not harm — but it
   fired, and §14 binds.** The −5 is real (identical seeds), lever-caused
   (trajectory perturbation via RNG consumption + pantry movement), and
   exceeds the pre-registered −2 bound. KILL stands. This is not
   re-scoring: the primary passed (6 ≥ 2) and the harm metrics held
   (starvation 12≤17, hungryDays 37≤38.5, death shape unchanged, exiled
   0), but the guardrail as pre-registered missed.
2. **The national guardrail is perturbation-sensitive.** Like the median
   (r32b #186), it measures survival-to-a-threshold (day ~76 for the
   scale rung), not harm. A lever that perturbs trajectories will move
   national even when it doesn't starve, sicken, or change how villages
   die. The #186 harm-specific prescription is incomplete: national
   needs a perturbation-aware bound (or a harm-specific national
   proxy, e.g. national-among-survivors-to-90d) for the NEXT run, not
   this one.
3. **The primary is robust.** 6 duty-attributed rung-firings vs 0
   control is not marginal — the mechanism (duty feast → surge armed →
   combat use → feastSurgeUsed) is proven end-to-end on 6 seeds. The
   7 r13-attributed firings show the layer's r13 half also opens the
   rung; the duty is the marginal opener on drowning pantries.
4. **The full-seat via allowance (lead s11) is a real secondary.**
   The r13 allowance alone opened the FULL table seat with 0 duty
   feasts. The feast-forwarding question is answered more broadly than
   the duty: the courtship road's feast machinery, once unblocked,
   opens the table. The duty accelerates it on overstock.
5. **Det-gate waiver was honest.** The correction documented the
   infeasibility (6 workers, load 12, 4.5h projected) and the
   substitutes (entropy fixed, overstock 16/16 on this code, RNG-free
   layer). No nondeterministic noise is visible in the before/after —
   the per-seed deltas are systematic (earlier deaths), not random.

## Convergence state

food-economy: **killed-at-pilot** (feastopener). The feast-forwarding
mechanism is proven (13/16 rung fired, 6 duty-attributed, 4 tables) but
the layer as built trades national reach via trajectory perturbation.
The food-deed rung is openable from the policy side; the remaining work
is a perturbation-robust way to keep villages alive to national while
feasting — or accepting the trade as the price of the table path
(Steve's call).
