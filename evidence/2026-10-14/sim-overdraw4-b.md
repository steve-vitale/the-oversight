# SIM-OVERDRAW4 — fresh-first drawdown, tribute timing untouched (ARM 1, loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-overdraw4
Axis: food-economy (scale-wall lens) — re-claims sim-findings #199 (DRAWDOWN VERBS MUST DRAW SOONEST-SPOILING FIRST).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-overdraw3 PROVED the fresh-first mechanism (0.517 absolute /
  0.567 per-day-alive rot, the first drawdown to pass both forms) but was
  KILLED per §14 because the TRIBUTE verb's early-payment timing starved 2
  belong-road villages (starvation 0→3, median 179→123d). The harm channel was
  the tribute verb's TIMING, not its ordering. This arm keeps fresh-first
  aid + feast and leaves tribute timing UNTOUCHED (base-discipline only).
  Does the drawdown still cut rot without the tribute verb — and without
  reproducing the belong-road harm?
- **Lever**: scripts/policies/overdraw4.js (OVERDRAW4=1, default OFF; wraps
  leadcourt/belongseek as overlead4/overbelong4). When pantry fresh-days > 4
  (the throttle's own overproduction signal) AND the siege-gate is clear,
  ONE drawdown verb per day, priority: (1) AID — tend a THIN subordinate
  link (tendLink, 1,500 kcal; thin = sub pantry < 5 days of the sub's need;
  skipped if already tended this week or their mourning); (2) FEAST —
  hostFeast under the r13 allowance gates (dusk, at haven, one-feast/day,
  7d/14d cadence, recentGives(7) + tribute/tend paid(7) ≥ 1500, plan.ok,
  1.5x affordability, fusion-reactor ceiling — candidate/floor conventions
  mirrored from allowgate2.js/feastscale.js), PLUS the overdraw floor:
  plan.cost ≤ maxDrawdownKcal. NO tribute verb: tribute runs on the base
  discipline's own timing, this arm never calls payTribute or arms early
  payment. Aid pantry drains route through pantryDraw's fresh-first ordering:
  the layer pre-draws the verb's nominal kcal, then answers the engine's
  _removePantryKcal from the already-drawn food (the engine accounting
  records actuals; the pantry is drained exactly once; rollback on tend
  refusal). The feast verb drains natively fresh-first (hostFeast already
  uses pantryDraw ordering). Floor: never push fresh-days below 2
  (maxDrawdownKcal = fresh − 2×burn; aid requires ≥ 1500 of it; feast cost
  capped by it). Hard-gate: all verbs OFF during lingerer / gorge threat /
  raid in trailing 7d (osGateHeld counted). Cause lines follow CONFIRMED
  verbs only (the R2 honesty bug stays fixed; pre-checked refusals never
  get a cause line). Policy-side only, zero src/js changes.
- **PRIMARY**: absolute fresh-rot kcal, armed ≤ 0.85× control (identical
  seeds, prodthrottle precedent) AND rot-per-villager-day armed ≤ control
  × 1.335 (r25b rotcal A/A noise calibration — the per-day-alive form the
  R2 review adopted; both bind).
- **GUARDRAILS**: national ≥ control−2; median ≥ control−10d; starvation
  (starve-death count) ≤ control+1; no new death mode.
- **SECONDARY**: drawdown events (aid/feast counts + kcal), fresh-days
  distribution, pantry peaks, overstock-cliff events (>10k/d), per-day-alive
  rot, table/national/wins, wave-4/5 unlocks, gorge nights.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: pilot 11/22/33/44 × leadcourt/belongseek = 8 runs/side (the
  overdraw3 seed set, for comparability), IDENTICAL seeds control vs armed.
  Control RE-MEASURED on current tip (never cite the old control). Confirm
  12–16 only on pilot GO (fresh seeds 55/66/77/88). Both sides on current
  master WITH the landed prodthrottle — the question is overdraw4's
  MARGINAL drawdown on top of it.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule);
  SMOKE=1 honesty gate proving the policy actually ran (proof verified
  RED→GREEN pre-sims, incl. the G10 fresh-first ordering check and the R3
  naive-RED foil).
- **Metric-review note (§14)**: sim-findings #223 documents a second instance
  where the median guardrail fired on trajectory perturbation, not harm
  (per-policy medians byte-identical, swings both directions, no
  starvation-spiral signature). That precedent concerns the MEDIAN
  guardrail. The STARVATION guardrail here is the harm guardrail — its
  breach binds on its own terms; the #223 perturbation exception does not
  transfer to it.

## Proof results (run BEFORE any sims, 2026-10-14)

RED (gate off): R1 gate-off byte-identical — overlead4 == leadcourt and
overbelong4 == belongseek per-day hashes, 40d × 2 seeds, IDENTICAL. R2: no
overdraw4 verb fires gate-off on the overstock fixture; the parent's own
tend discipline still fires. R3 (NAIVE RED foil): Game._removePantryKcal
on a 3-stack fixture (+2d/+10d/+30d) drains the +30d stack first —
documents the R2 failure mode and proves the G10 fixture discriminates.
G5 floor math: maxDrawdownKcal = fresh − 2×burn (2,143 at the unit fixture).

GREEN (OVERDRAW4=1): G1 AID — 1,500 kcal tended fresh-first (sub pantry
1,000→2,500, trust 30→38), cause line AFTER the confirmed engine beat
(tend@0 cause@1 — the honesty ordering is pinned), floor respected, one
verb/day. G2/G3/G4: lingerer / recent-raid / gorge-night fixtures all hold
every verb off (gate-hold counted). G5b: pre-draw rollback restores the
pantry unit-exact on refusal. G6 FEAST — 5,000 kcal real pantry draw, r13
contribution rule reused, cause after hostFeast confirmed, floor
respected. G7 TRIBUTE UNTOUCHED (the arm's negative assertion): with an
owed belong-side link on an overstock pantry, osTribute never set, no
early-tribute cause line, the aid verb tends the thin link not the owed
one; the base discipline paid on its own rhythm (tributePaidWeek=4 —
allowed). G8 priority aid > feast in BOTH call orders (the feast yields
when an aid channel exists — required because the harness runs the dusk
upkeep before the end-of-day daily). G9 armed determinism bit-identical.
G10 FRESH-FIRST ORDERING: on the 3-stack fixture the aid verb drained the
+2d stack (96→93, exactly 3×500) while +10d/+30d stayed at 96 — pantry
drained exactly once. A drawdown that did NOT drain the soonest-spoiling
end first would FAIL G10.
RESULT: all checks passed (RED and GREEN), independently re-run.
Det-gate 16/16 bit-identical BOTH sides (scripts/det-gate-overdraw4-20261014.js);
SMOKE=1 honesty gate green both sides.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, overlead4 seed 22, 120d: 84 drawdown beats (13 aids, 12
feasts, 35 gate-holds). The beats read as a village deciding — the cause
line gives the WHY after the engine beat gives the WHAT:

- "🌾 Haven sends 1,539 kcal of grain to Stonebridge's fire — not tribute,
  the other way around. Someone's grandmother over there will remember who
  fed her. (Trust +8.)" → "🌾 Haven's shelves hold ~24 days of fresh —
  more than the village eats before it turns. The surplus goes to
  Stonebridge's fire, not the rot."
- "🍖 FEAST 📺 — Walt opens the pantry wide: 6× Foraged food (dried), 2×
  Foraged food, 1× Snared meat. Carlos, Theo, Sigrun, Jorge and 1 more eat
  until the fire burns low..." → "🍖 The shelves groan — ~22 days of fresh
  on hand, and the rot is already circling. We eat the mountain tonight, or
  it eats itself."

Named villagers open feasts (Walt, Caitriona, Theo, Wolfgang); named
subordinates receive aid (Stonebridge, Thornfield, Emberhold); fresh-day
counts in the cause lines are honest (24→13 as the pantry thins). Aid
amounts vary honestly with the ceil (1,539/1,564/1,600/1,740 — real food
moved, sub credited actual). Bare tend beats without a cause line are the
parent's own discipline, not the layer's (one layer verb/day holds).
Nothing reads robotic.

**PASS.**

## Pilot results

8 runs/side, identical seeds (11/22/33/44), 180d death-aware. Det-gate
GREEN both sides before trusting comparisons (16/16 bit-identical each).

| metric | control (OVERDRAW4 unset) | armed (OVERDRAW4=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 1388.9k | **1163.8k** | **PASS** (≤ 1180.6k; ratio **0.838**) |
| preserved-rot kcal | 162.3k | 96.7k | — |
| fresh-rot share | 89.5pp | 92.3pp | — |
| rot/day-alive | 1277 | 1069 (ratio **0.837**) | **PASS** (≤ 1705) |
| median survival | 138d | 149d | **PASS** (≥ 128d) |
| national | 6/8 | 5/8 | ✓ (≥ 4) |
| table | 0/8 | **4/8** | — (LOUD, positive, 4th replication) |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 1/8 | 6/8 | — |
| wave-5 unlocks | 0/8 | 5/8 | — |
| hungryDays | 12 | 12 | report |
| starvation deaths | 5 | 6 | ✓ (≤ 6 — **exactly at the bound**) |
| exiled | 0 | 0 | unchanged ✓ |
| gorge nights | 0 | 10 (9+1) | report (instrumentation asymmetry: the gorge track is installed by the layer, so control reads 0 by construction — not comparable) |
| drawdown verbs | 0 | 56a/38f lead, 0a/48f armed-belong; 311k kcal; 0 tribute | mechanism fires; tribute untouched |
| siege-gate holds | 0 | 300 (186+114) | gate live, not dead code |
| overstock cliffs (>10k/d) | 29d / 378k | 27d / 335k | — |
| pantry peak | 102k | 116k | — |

Per-seed rot ratios (armed/control): 1.83, 1.73, 0.84, 1.75 (lead) /
0.25, 0.61, 0.38, 0.17 (belong). Perturbation-dominated per seed (the
overdraw3 R2 review's note stands); the aggregate passes both primary
forms.

**Pilot verdict: GO (primary + all guardrails pass), with the starvation
guardrail exactly at its bound (6 = 5+1) — the confirm must watch it.**

## Confirm results

8 fresh seeds/side (55/66/77/88), 180d death-aware, identical seeds.

| metric | control | armed | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 1811.2k | **910.4k** | **PASS** (≤ 1540.5k; ratio **0.503**) |
| rot/day-alive | 1945 | 978 (ratio **0.503**) | **PASS** (≤ 2597) |
| median survival | 111d | 102d | **PASS** (≥ 101d; lead 97→102, belong 134→169) |
| national | 5/8 | 5/8 | ✓ (≥ 3) |
| table | 0/8 | 2/8 | — |
| wave-4 unlocks | 3/8 | 5/8 | — |
| wave-5 unlocks | 0/8 | 3/8 | — |
| hungryDays | 16 | 16 | report |
| starvation deaths | 3 | **7** | **MISS** (≤ 4) |
| drawdown verbs | 0 | 31a/26f lead, 0a/17f belong; 0 tribute | — |

Per-seed: lead s55 93d/93d (0a/0f, no overstock to draw); s66 110d→180d
(table, wave 5); s77 97d→84d; s88 75d→102d. belong s55 134d→180d (table);
s66 111d→81d; s77 180d→169d; s88 131d→42d (violence-dominated death —
combat 5, sickness 2, starvation 2; the layer's verbs were gate-held
through the collapse: 1 early feast, 11 gate-holds).

**Verdict: KILLED AT CONFIRM per §14.** The primary passed decisively on
both forms in BOTH rounds (pilot 0.838/0.837, confirm 0.503/0.503 — the
strongest rot reduction in the whole overstock lineage), but the
starvation guardrail breached at confirm: 7 > control+1 = 4, after sitting
exactly at the bound in the pilot (5→6). The directional signal is
consistent across two independent seed sets, and the per-day-alive
starvation rate more than doubled in the confirm (3/931d = 0.32/100d →
7/931d = 0.75/100d — total days alive identical, so this is not a
longevity confound at the aggregate level).

## Why the guardrail breached (autopsy, not theory)

The starvation elevation (pilot 5→6, confirm 3→7) does NOT carry
overdraw3's signature — and that is precisely why it is dangerous to
dismiss:

- **No road concentration.** overdraw3's harm was belong-road-only
  (0→3). Here both roads moved: pilot lead 3→3 / belong 2→3; confirm
  lead 1→4 / belong 2→3.
- **No starvation-spiral mechanism visible.** The overdraw3 spiral was
  early-full tribute → feast ratchet → floor → collapse. This arm has no
  tribute verb; the feast is floor-capped (cost ≤ fresh − 2×burn); the
  siege-gate held verbs off through the one real collapse (belong s88:
  11 gate-holds, verbs silent while the pantry thinned).
- **The early deaths are violence-dominated.** belong s88 (the worst
  seed, 131d→42d) died of combat 5 + sickness 2 (+2 starvation in the
  wreckage); its control twin also died of violence at 131d. lead s88
  armed lived 27d LONGER than its control twin (102d vs 75d) with 3
  starvation deaths in a violence-dominated collapse (monster 3, combat
  2). lead s66 armed survived the full 180d with table + wave 5 (1
  starvation death in 180 days is background).
- **But the rate elevation is real.** 0.32→0.75 starvation deaths per 100
  village-days with identical total days alive (931 vs 931). The
  plausible residual channel: the feast verb can take the pantry DOWN TO
  the 2-day floor (cost ≤ fresh − 2×burn), and the layer's own aid tends
  arm the r13 contribution gate — aid → feast ratchets a fragile pantry
  to the floor, where the NEXT raid (the siege-gate holds future verbs,
  it doesn't undo the drain) tips the village into hunger. The 2-day
  floor is the exposure. This is a hypothesis, not a proven mechanism —
  the per-seed data can't isolate it at n=8.

Per §14, a guardrail breach is NO-GO — never re-scored against a
friendlier metric mid-run. The pre-registered #223 hedge (median
perturbation) does not transfer: the median guardrail PASSED on both
roads here; the breached guardrail is the harm guardrail, and it fired
with a consistent directional signal across two independent rounds.
**KILL stands.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| pilot control | 6/8 | 0/8 | 0/8 | 1/8 | 0/8 | 138d | 180d |
| pilot armed | 5/8 | 4/8 | 0/8 | 6/8 | 5/8 | 149d | 180d |
| confirm control | 5/8 | 0/8 | 0/8 | 3/8 | 0/8 | 111d | 180d |
| confirm armed | 5/8 | 2/8 | 0/8 | 5/8 | 3/8 | 102d | 180d |

Exiled: 0 everywhere. The scale wall is not broken by this arm, but the
table path opened 6× across the two rounds (4th and 5th replications of
the feast-as-table-door finding) and wave-5 unlocked on 8/16 armed runs
vs 0/16 control.

## Death-cause shares

Pilot — Control (78 deaths): combat 35 (45%), monster 10 (13%), sickness 9
(12%), villager combat 9 (12%), wound 6 (8%), starvation 5 (6%),
expedition 2, dehydration 1, contest 1. Armed (51): combat 31 (61%),
starvation 6 (12%), sickness 5 (10%), monster 4 (8%), wound 2, contest 2,
villager combat 1. Same families — no new death mode.
Confirm — Control (101): combat 56, monster 15, villager combat 13, wound
5, sickness 5, starvation 3 (3%), experiment 1, contest 1, alien 1,
expedition 1. Armed (62): combat 35, monster 15, starvation 7 (11%),
sickness 3, villager combat 1, contest 1. Same families — no new death
mode. The starvation share rose (3%→11%) while total deaths fell —
villages die of violence on both sides; the armed side adds hunger at the
margin.

## Village assessment (plain words)

Sixteen villages, and the pantry finally learned honesty at scale: the
fresh-first drawdown cut the rot pile nearly in half on the confirm
(0.503 — the strongest result in the whole overstock lineage), moving
311k kcal through real verbs — grain wagons to Stonebridge, Thornfield,
Emberhold, feasts when the shelves groaned, and not a single early
tribute. The lead road was the cleanest of all four overstock rounds:
villages lived longer, reached further (wave 5 on 8 of 16 armed runs vs
none on control), and four + two reached the table. But the hunger ledger
wouldn't balance: the pilot sat exactly on the starvation bound, and the
confirm broke it — 7 starved against 3, at more than double the
per-day-alive rate, with the same total days lived. The deaths don't look
like overdraw3's spiral — no tribute verb exists to blame, the early
collapses died of violence, the gate held its silence through the worst
of it — but the direction held across two independent seed sets, and a
harm guardrail doesn't need a named mechanism to bind. The feast can still
take a fragile pantry down to two days of fresh, and two days is a thin
place to meet a raid. The rot mechanism is proven; the floor is suspect.

## Blanks filled / documented

- **MEASURED, KILLED AT CONFIRM**: the tribute-free fresh-first drawdown —
  scripts/policies/overdraw4.js (OVERDRAW4=1, default OFF; DELETED per kill
  protocol — the file is removed, not committed), proof
  scripts/test-overdraw4-20261014.js (RED→GREEN incl. G5b pre-draw
  rollback, G7 tribute-untouched negative assertion, G8 priority in both
  call orders, G10 fresh-first ordering; independently re-run, kept as
  instrument), sweep scripts/measure-overdraw4-20261014.js (kept, incl.
  rot/day-alive + wave-4/5 per-side tallies + __od4Sink attribution),
  det-gate scripts/det-gate-overdraw4-20261014.js (16/16 both sides, kept),
  sense script scripts/sense-overdraw4-20261014.js (kept). Per-seed JSONs
  + logs under evidence/2026-10-14/perseed-overdraw4-{base,armed} and
  perseed-overdraw4-confirm-{base,armed}/, overdraw4-{baseline,armed,
  confirm-baseline,confirm-armed}.json/.log (kept). Zero src/js changes
  (policy-side only).
- **FILLED (instrument)**: the fresh-first pre-draw with rollback
  (preDraw + _removePantryKcal answered from drawn food, rollback on
  refusal); the feast-yields-to-aid priority (required by the harness's
  dusk-before-daily order); the G7 tribute-untouched negative assertion
  as a reusable arm pattern; the gorge-tracking minimal install.
- **DOCUMENTED** (for the coordinator's backlog): (a) the fresh-first rot
  mechanism is now 2× proven at increasing strength (overdraw3: 0.517 /
  0.567; overdraw4: pilot 0.838/0.837, confirm 0.503/0.503) — the R2
  diagnosis (best-food-first verbs can't drain the rot pool) is confirmed
  by repeated inversion; the mechanism is REAL and the strongest rot
  lever measured; (b) the starvation elevation is the open question —
  pilot at-bound (5→6), confirm breached (3→7), per-day-alive rate more
  than doubled with identical total days alive; the suspect is the 2-day
  floor (the feast can drain TO it; aid→feast ratchets toward it; the
  siege-gate can't undo a drain before a raid) — a future arm should test
  a 3-day floor or a fragility-gated feast before resurrecting this
  drawdown; (c) the feast-as-table-door secondary is now 5× replicated
  (pilot 0→4, confirm 0→2, plus overstock r32b 0→5, overdraw3 0→4,
  allowgate2 4→5) with wave-5 unlocks 0→8/16 — it needs its own arm
  measured on table/wave-5 reach, not rot (already claimed as #226);
  (d) the lead road (aid+feast, no tribute pressure) is the clean road —
  survival flat-to-better, rot down decisively; (e) control rot on this
  tip: pilot 1,388.9k, confirm 1,811.2k on the same policy pair — another
  #188 data point on control drift across seed sets.

## Metric review (§14)

1. **The starvation guardrail breached at confirm (7 vs the ≤4 bar) —
   KILL stands, no re-scoring.** The primary passed decisively on both
   forms in both rounds (pilot 0.838/0.837, confirm 0.503/0.503), but §14
   is explicit: a GO met with a guardrail breached is NO-GO. The pilot's
   at-bound starvation (6 = 5+1) was the warning; the confirm's breach
   (3→7) with a consistent directional signal across two independent
   seed sets is the verdict.
2. **The #223 perturbation hedge does not transfer.** It was written for
   the MEDIAN guardrail firing on trajectory perturbation. Here the
   median guardrail PASSED on both roads (lead 97→102, belong 134→169);
   the breached guardrail is the harm guardrail, and it fired with a
   doubled per-day-alive rate — not a trajectory artifact.
3. **The primary's two forms agreed in both rounds** (pilot 0.838/0.837,
   confirm 0.503/0.503). The dual registration keeps paying off: the
   effect is mechanism, not longevity confound. Keep it for future rot
   arms.
4. **The 2-day floor is the prime suspect for the next arm.** The feast
   verb can drain TO the floor and the layer's own aid tends arm the r13
   contribution gate — the ratchet the overdraw3 autopsy named, minus the
   tribute. A 3-day floor (or a fragility-gated feast) is the honest next
   experiment, pre-registered on starvation as the primary.
5. **Per-seed rot ratios remain perturbation-dominated** (pilot
   0.17–1.83, confirm 0.05–4.50) — the 8-seed pilot was the right size
   for the sniff test, and the confirm earned its keep: it caught the
   guardrail the pilot only warned about.

## Convergence state

food-economy: **killed-at-confirm** (overdraw4). The fresh-first rot
mechanism is now 2× proven and stronger than ever (confirm 0.503 absolute
/ 0.503 per-day-alive — the best rot reduction measured in this lineage),
but the starvation guardrail breached at confirm (3→7, per-day-alive rate
more than doubled) after sitting exactly at its bound in the pilot. Per
§14 a guardrail breach is NO-GO. The lever as built is dead; the open
question it leaves is the starvation channel (suspect: the 2-day floor +
aid→feast ratchet on fragile pantries). The village-scale rot bind
stands: prodthrottle (landed) remains the only landed rot lever. The
feast-as-table-door (5× replicated) is already claimed as its own arm
(#226).
