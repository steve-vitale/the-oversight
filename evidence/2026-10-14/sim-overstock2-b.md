# SIM-OVERSTOCK-R2 — overstock drawdown policy, re-applied with harm-specific guardrails (ARM 1, loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-overstock2
Axis: food-economy (scale-wall lens) — sim-findings OVERSTOCK-ROT (#163 lineage).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the r32b overstock pilot (evidence/2026-10-14/sim-overstock-b.md)
  KILLED on the median-survival guardrail (−34d) while the PRIMARY passed
  decisively (0.638 ≤ 0.85) and every harm-specific metric held (starvation
  19→18, hungryDays 44→44, death shape unchanged, national 10→10, exiled 0).
  The r32b §14 metric review concluded the median guardrail fired on
  trajectory perturbation, not harm, and recommended harm-specific
  guardrails with median report-only. Does the same policy — rebuilt
  unchanged from the preserved spec (scripts/policies/overstock.js,
  OVERSTOCK=1 default OFF) — pass under the harm-specific guardrails?
- **Lever**: reconstructed scripts/policies/overstock.js, verbatim spec:
  pantry fresh-days > 4 AND siege-gate clear → one drawdown verb/day,
  priority AID (thin subordinate link via tendLink, subaid 1,500 kcal) >
  FEAST (hostFeast, r13 contribution accounting reused, 7d cadence armed,
  1.5x affordability) > TRIBUTE (week's tribute early, in full); floor never
  below 2 fresh-days; lingerer/gorge/raid-7d hard gate. Policy-side only,
  zero src/js changes.
- **PRIMARY**: absolute fresh-rot kcal, armed ≤ 0.85× control (identical seeds).
- **GUARDRAILS**: starvation deaths ≤ control+2; hungryDays ≤ control×1.1;
  no new death mode; national ≥ control−2. Median survival REPORT-ONLY —
  do NOT kill on median perturbation (r32b §14 metric review #2).
- **SECONDARY**: drawdown events (aid/feast/early-tribute counts + kcal),
  fresh-days distribution, pantry peaks, overstock-cliff events (>10k/d),
  per-day-alive rot, table/national/wins, wave reach.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side,
  IDENTICAL seeds control vs armed. Both sides on current master WITH the
  landed prodthrottle — the question is overstock's MARGINAL drawdown.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule);
  SMOKE=1 honesty gate proving the policy actually ran (proof verified
  RED→GREEN pre-sims).
- **Note**: r32b recorded the landed prodthrottle's effect attenuated on
  current master. This run measures the control's rotted kcal on THIS tip
  and notes it, but does not chase it (report, don't fix).

## Proof results (run BEFORE any sims, 2026-10-14)

RED (gate off): R1 gate-off byte-identical — overlead == leadcourt and
overbelong == belongseek per-day hashes, 40d × 2 seeds, IDENTICAL.
R2: no overstock verb fires gate-off on the overstock fixture; the
parent's own tend discipline still fires (the parent's behavior, not the
layer). G5 floor math: maxDraw = fresh − 2×burn (2,143 at the unit
fixture).

GREEN (OVERSTOCK=1): G1 AID — 1,500 kcal tended, sub pantry 1,000→2,500
(real food, subaid), trust 30→38, haven pantry lighter, cause line + engine
beat narrated, floor respected, one verb/day. G2/G3/G4: lingerer /
recent-raid / gorge-night fixtures all hold every verb off (gate-hold
counted). G6 FEAST — 5,000 kcal real pantry draw, r13 contribution rule
reused (tribHist), cause line narrated, floor respected. G7 TRIBUTE —
week's tribute paid early in full via the overstock verb (osTribute=1,
week current). G8 priority: aid wins over feast/tribute (one verb/day).
G9 armed determinism: overlead 40d bit-identical across runs.
RESULT: all checks passed (RED and GREEN). Det-gate 16/16 bit-identical
BOTH sides (scripts/det-gate-overstock2-20261014.js); SMOKE=1 honesty gate
green both sides.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, overlead seed 22, 120d (pilot's verb-heaviest seed:
20a/15f; sense run: 13a/10f, 47 gate-holds): 93 overstock beats read.
The beats read as a village deciding — the cause line gives the WHY, the
engine beat the WHAT:

- "🌾 Haven's shelves hold ~52 days of fresh — more than the village eats
  before it turns. The surplus goes to Thornfield's fire, not the rot."
  → "🌾 Haven sends 1,500 kcal of grain to Thornfield's fire — not
  tribute, the other way around. Someone's grandmother over there will
  remember who fed her. (Trust +8.)"
- "🍖 The shelves groan — ~52 days of fresh on hand, and the rot is already
  circling. We eat the mountain tonight, or it eats itself. Light the fire
  — everybody eats." → "🍖 FEAST 📺 — Casey opens the pantry wide: 12×
  Foraged food, 1× Muscadine Grapes. Zuri, Wolfgang, Walt, So-yoon and 1
  more eat until the fire burns low... (−2,490 kcal from the pantry)"

Named villagers open feasts (Casey, Caitriona, Carlos, Theo); named
subordinates receive aid (Stonebridge, Thornfield, Emberhold); the subaid
is reciprocal ("Aid from Stonebridge" appears in a feast menu). Nothing
reads robotic.

**Honesty bug found (documented, not fixed — the layer is killed):** the
aid cause line is said BEFORE tendLink, and tendLink can refuse (their
mourning) — on d56/d70/d71/d77–d79 the cause line promises grain to a
subordinate's fire and no grain goes (the refusal beat is the engine's,
not the layer's). Cause-before-verb ordering dangles on refusal; the
cause line should follow a confirmed verb. Filed as a backlog finding.

**PASS with the noted honesty bug.**

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate GREEN both
sides before trusting comparisons (16/16 bit-identical each; the A/A
noise floor is 0 on this tip with the deterministic harness clock).

| metric | control (OVERSTOCK unset) | armed (OVERSTOCK=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 2916.6k | 2852.3k | **MISS** (need ≤ 2479.1k; ratio **0.978**) |
| preserved-rot kcal | 248.0k | 304.2k | — |
| fresh-rot share | 92.2pp | 90.4pp | — |
| rot/day-alive | 1422 | 1616 (ratio **1.136**) | — |
| median survival | 151d | 107d | report-only |
| national | 10/16 | 12/16 | ≥ 8 ✓ |
| table | 0/16 | **5/16** | — (LOUD, positive, reproduced) |
| wins | 0/16 | 0/16 | — |
| max wave reach | 5 | 5 | — |
| hungryDays | 35 | 46 | **MISS** (≤ 38.5) |
| starvation deaths | 15 | 19 | **MISS** (≤ 17) |
| exiled | 0 | 0 | unchanged ✓ |
| gorge nights (armed only) | n/a (not instrumented) | 51 | report |
| drawdown verbs | 0 | 57a/91f/18t, 483k kcal | mechanism fires |
| siege-gate holds | 0 | 1373 | gate live, not dead code |
| overstock cliffs (>10k/d) | 80d / 1053k | 72d / 1020k | — |
| pantry peak | 116k | 116k | — |

Per-seed rot ratios (armed/control): 0.10, 0.57, 2.12, 0.29, 0.79, 0.68,
1.05, 1.00 (belong) / 4.49, 1.59, 1.00, 2.43, 0.70, 1.37, 0.65, 0.27
(lead). The effect is swamped by trajectory perturbation — ratios span
0.10× to 4.49×.

**Verdict: KILLED AT PILOT per §14.** The primary missed outright
(0.978 vs the 0.85 bar — not borderline), and two guardrails missed with
it (starvation 19 > 17, hungryDays 46 > 38.5). No confirm spend. A miss
is NO-GO, never re-scored.

## Why the primary missed (autopsy, not theory)

The verbs fired honestly (483k kcal drawn through real engine paths —
aid 57, feasts 91, early tributes 18; the siege-gate held 1,373 days), yet
absolute rot moved 64k and per-day-alive rot ROSE 13.6%. The lever does
not drain the ROT POOL:

- **Aid/tribute take the best food first.** Both verbs go through
  `Game._removePantryKcal`, which sorts the pantry ascending by spoilDay
  and draws from the LEAST-perishable end (whole units, honest
  over-removal). The 1,500-kcal aid and the early-full tribute remove the
  food least likely to rot and leave the about-to-rot food sitting. The
  rot pool is food nobody touches; removing the best food doesn't reach
  it. (The feast verb does draw soonest-spoiling-first via pantryDraw,
  but its ~5k draws are swamped by perturbation.)
- **The belongseek collapse reproduced — with a harm signal this time.**
  5/8 belongseek seeds died 52–81d earlier under the armed policy
  (r32b: 5/8, −49 to −61d, no harm signal). The early-full tribute
  systematically removes the week's food up to 6 days before the base
  discipline would pay it; the tribute payment itself arms the r13 feast
  gate (it counts as contribution), so tribute → feast ratchets fragile
  pantries down toward the 2-day floor, where any raid/gorge night tips
  the village into the starvation spiral. Starvation 15→19, hungryDays
  35→46 (+31%). This is no longer pure perturbation — the guardrails
  fired on a real channel.
- **r32b's 0.638 did not reproduce** because the effect was never in the
  verbs — it was in the trajectories. Same policy, same seeds, same
  harness: 0.638 → 0.978, per-day-alive 0.70 → 1.136. The drawdown
  mechanism as built cannot reliably move the rot pool; the r32b number
  was a favorable perturbation draw.

## The table LOUD, reproduced (secondary)

Table 0→5 again (leadcourt 3, belongseek 2), national 10→12. Same
mechanism as r32b: the overstock feast fires real feasts on the
courtship road, arming the table's lesser-seat food-deed rung
(sentimentTaught && feastSurgeUsed) that the courtship policies can't
otherwise reach. Two independent pilots, same secondary — the feast as
table-path opener (backlog #187) is now a replicated finding, worth its
own arm measured on table/wave-5 reach rather than rot.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | — | — | 151d | 180d |
| armed | 12/16 | 5/16 | 0/16 | — | — | 107d | 180d |

(maxWave reached: control lead 5 / belong 4; armed lead 5 / belong 4.
Wave-4/5 unlock counts per side not separately tallied this run —
maxWave recorded per run only; the wall's w4/w5 columns are partial.
Noted as a measurement gap for the next run.)
Exiled: 0 both. The scale wall is not broken by this arm; the table path
opened 5× again.

## Death-cause shares

Control (195 deaths): combat 106 (54%), monster 31 (16%), sickness 15
(8%), starvation 15 (8%), villager combat 13 (7%), wound 6 (3%), contest
5 (3%), lockjaw 2, dehydration 1, expedition 1.
Armed (205): combat 104 (51%), monster 35 (17%), starvation 19 (9%),
sickness 18 (9%), villager combat 9 (4%), wound 8 (4%), contest 7 (3%),
dehydration 2, expedition 1, the expedition 1, alien 1. Same shape —
villages die of violence, not hunger, on both sides; the two armed-only
singletons are label noise (r32b's armed side likewise had contest-only
deaths). No new death mode: PASS.

## Village assessment (plain words)

Sixteen villages, and the pantry never learned honesty. The armed
villages moved nearly half a million kcal out through the new verbs —
grain wagons to Stonebridge and Thornfield and Emberhold, feasts when
the shelves groaned, the week's tribute paid early — and the rot pile
barely noticed. The food that rots is the food nobody touches, and the
verbs kept taking the best food first: the aid wagon carries the
longest-lasting grain, the tribute walks out early and whole, and what's
left behind is exactly what was always going to turn. On the belong
road the early tribute proved actively harmful — five villages bled out
two months early, their pantries ratcheted to the floor by tribute-then-
feast one-two punches, starving in the gaps between raids. The lead
road fared better (two villages ran the full 180 days, the wagons
feeding real bonds), but "better" still rotted as much per day as
doing nothing. The five table-reaching villages are the one bright
thread, and it's the same thread as last time — the feast, meant as a
drain, is a door. The rot wall stands; the feast door is real.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the overstock drawdown policy, re-applied
  — scripts/policies/overstock.js (OVERSTOCK=1, default OFF; DELETED per
  kill protocol — the file is removed, not committed), proof
  scripts/test-overstock-20261014.js (RED→GREEN re-verified 23/23, kept as
  instrument), sweep scripts/measure-overstock-20261014.js (kept),
  det-gate scripts/det-gate-overstock2-20261014.js (16/16 both sides,
  kept), sense script scripts/sense-overstock2-20261014.js (kept).
  Zero src/js changes (policy-side only).
- **DOCUMENTED** (sim-findings.md): (a) r32b's 0.638 did not reproduce —
  the drawdown mechanism cannot reliably move the rot pool; the r32b
  number was a favorable perturbation draw (primary 0.978, per-day-alive
  +13.6%); (b) aid/tribute verbs drain the best food first
  (_removePantryKcal takes least-perishable) — future rot arms must draw
  from the soonest-spoiling end; (c) the belongseek early-tribute
  collapse reproduced WITH a harm signal (starvation 15→19, hungryDays
  +31%) — early-full tribute + tribute-armed feasts ratchet fragile
  pantries to the floor; (d) the aid cause-line dangles on tend refusal
  (cause-before-verb ordering) — an honesty bug in any future verb layer;
  (e) the table secondary replicated (0→5, two pilots) — feast as
  table-path opener stands as its own arm; (f) control on this tip:
  2,916.6k fresh-rot kcal with the throttle engaged (4,634 redirects) —
  the #188 re-measurement data point (r32b: 3,141.8k).

## Metric review (§14)

1. **The primary missed outright (0.978 vs 0.85) — KILL stands, no
   re-scoring.** The guardrail misses (starvation, hungryDays) reinforce
   but are not needed; the primary binds.
2. **The harm-specific guardrails worked as designed.** Where r32b's
   median guardrail fired on perturbation with no harm signal, this run's
   guardrails fired WITH a harm signal (starvation +4, hungryDays +31%)
   on the belong road — the instrument distinguishes correctly. The
   #186 recommendation is validated: keep harm-specific guardrails,
   median report-only.
3. **Absolute fresh-rot remains the right primary** for rot arms, but the
   per-seed ratio spread (0.10–4.49) shows the identical-seed design is
   perturbation-dominated at 16 seeds for verbs that consume RNG. Future
   rot arms should pre-register the per-day-alive form alongside the
   absolute (the r32b review's recommendation #3), and treat a primary
   that moves opposite on per-day-alive as a mechanism failure even when
   the absolute passes.
4. **The r32b 0.638 is superseded.** Same policy, same seeds, same
   harness, different tip: 0.978. The mechanism story (best-food-first
   verbs can't drain the rot pool) explains both. Do not cite the r32b
   primary as the lever's effect size.
5. **Wave-4/5 unlock counts were not tallied per side** (maxWave only) —
   a measurement gap for the next run's wall table.

## Convergence state

food-economy: **killed-at-pilot** (overstock R2). The village-scale rot
bind stands: prodthrottle (landed) is the only lever that has moved rot
reliably; pantry triage killed (substitution); preservedrive killed
(capacity); overstock killed twice — R1 on the median guardrail
(perturbation, no harm), R2 on the primary itself (0.978) plus
starvation/hungryDays guardrails (real harm on the belong road). The
remaining rot work: the throttle's magnitude on current master (#188),
and any future drawdown arm must draw from the soonest-spoiling end —
best-food-first verbs demonstrably cannot move the rot pool.
