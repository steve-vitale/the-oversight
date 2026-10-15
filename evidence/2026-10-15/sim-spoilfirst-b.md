# SIM-SPOILFIRST — game-code spoil-first drawdown ordering (ARM 2, loop B, food-economy #199)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-spoilfirst
Axis: food-economy (scale-wall lens) — claims sim-findings #199's named next
("Any future drawdown arm must draw from the soonest-spoiling end
(pantryDraw's ordering, which the feast verb uses) or it cannot move rot by
construction").

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the overstock2 kill proved aid/tribute verbs built on
  Game._removePantryKcal drain the LEAST-perishable food first (sorted
  ascending by spoilDay, drawn from the end — whole units, honest
  over-removal): 483k kcal drawn through real engine paths moved absolute
  rot 64k and per-day-alive rot ROSE 13.6% — the verbs took the best food
  and left the rot pool intact. overdraw4 then proved the fresh-first
  mechanism 2x (confirm 0.503/0.503, strongest in lineage) via a
  policy-side pre-draw workaround, but was KILLED at confirm on the
  starvation guardrail (3→7, 2-day floor suspect). This arm moves the
  mechanism into game code: does routing the drawdown verbs through
  pantryDraw's soonest-spoiling ordering cut absolute fresh-rot?
- **Lever (game code, src/js/hierarchy.js)**: `_removePantryKcal(kcal,
  opts)` gains a spoil-first variant — same ascending spoilDay sort, but
  iterated from the START (soonest-spoiling first, pantryDraw's ordering)
  instead of the END (least-perishable first). Already-spoiled stacks are
  skipped the way pantryDraw skips them (aid/tribute must not pay rot as
  grain). Whole-unit honesty unchanged. Env-gated: `_spoilFirstDrawdown()`
  reads SPOILFIRST=1, default OFF. Only the drawdown verbs opt in:
  `tendLink` (aid) and `payTribute` (tribute) pass `{spoilFirst:
  this._spoilFirstDrawdown()}`. Every other _removePantryKcal caller
  (diplomacy gifts, sweeteners, league pours, betrayal/comms takes) keeps
  the long-standing ordering — verified by proof G11. `hostFeast` already
  drains via pantryDraw — untouched. No village-meal or scholar-take path
  changed (narrow scope per brief).
  - Canon check: docs/CANON.md + docs/PRESERVATION.md read. Binding
    lines honored: "Rot can't be smoked back into food" (spoil-first
    skips already-spoiled stacks — G12 proves it); "No nonsensical
    calorie loss" (conservation asserted — G10 proves kcal in = kcal
    out). No canon doc covers draw ordering; the ordering follows
    pantryDraw's documented fresh-first rule (game.js:25918), not an
    invented one.
  - File note: the brief pointed at src/js/food.js, but the drain paths
    live in src/js/hierarchy.js (_removePantryKcal) and src/js/game.js
    (pantryDraw) — verified in code, both orderings confirmed current
    (finding #199's description is accurate: ascending sort, drawn from
    the end = least-perishable first).
- **Driver (instrument, scripts/policies/spoilfirst.js, SFDRIVER=1,
  default OFF)**: recreates the overdraw4 verb spec with HONEST engine
  calls (no pre-draw trick — the mechanism lives in game code now):
  fresh-days > 4 + siege-gate clear → ONE verb/day, priority AID
  (tendLink on a thin subordinate: sub pantry < 5d of need, untended this
  week, not mourning) > FEAST (hostFeast under the r13 allowance chain via
  allowgate2.feastCandidate + the overdraw floor cost ≤ fresh − 2×burn).
  NO tribute verb (overdraw4 G7: tribute TIMING was overdraw3's measured
  harm channel; tribute runs on the base discipline's own rhythm — the
  SPOILFIRST ordering covers payTribute when it fires). Floor: never
  below 2 fresh-days. Siege-gate: lingerer / gorge-night-trailing-7d /
  raid-7d hold all verbs off. Cause lines follow CONFIRMED verbs only
  ([needs-eyes] on the commit — new player-facing narration, inert
  unless SFDRIVER=1).
- **Conditions**: CONTROL = SFDRIVER=1 only (driver fires aid/feast with
  the CURRENT least-perishable-first aid ordering). ARMED = SFDRIVER=1 +
  SPOILFIRST=1 (same driver, spoil-first ordering). The measured delta is
  the ordering change and nothing else. The feast verb is
  ordering-identical on both sides (pantryDraw natively) — a built-in
  constant.
- **PRIMARY**: absolute fresh-rot kcal, armed ≤ 0.85 × control (identical
  seeds).
- **GUARDRAILS**: rot-per-villager-day ≤ control × 1.335 (r25b rotcal A/A
  noise calibration); starvation deaths ≤ control+2; hungryDays ≤
  control × 1.1; no new death mode (n≥3); national ≥ control−2; median
  report-only (r32b metric review: median-only guardrails cannot
  distinguish perturbation from harm).
- **SECONDARY**: drawdown events (aid/feast counts + kcal), per-day rot,
  fresh-days distribution, pantry peaks, overstock cliffs (>10k/d),
  table/national/wins, wave-4/5 unlocks, gorge nights, tribute kcal.
- **Horizon**: 180d death-aware (pacing-law max; dead villages stop —
  the rot measured is rot the village lived to produce, not death-tail
  artifact beyond the +10d tail).
- **Seeds**: pilot 11/22/33/44 × spoilLead/spoilBelong = 8 runs/side
  (the overdraw4 seed set, for comparability), IDENTICAL seeds control
  vs armed. Control RE-MEASURED in the SAME sweep (never inherit a
  baseline — #247). Confirm 12–16 only on pilot GO (fresh seeds
  55/66/77/88). Both sides on current master WITH the landed
  prodthrottle — the question is the ordering delta on top of it.
- **Det-gate**: 16/16 bit-identical per condition (32/32),
  scripts/det-gate-spoilfirst-20261015.js — before trusting any
  comparison. SMOKE=1 honesty gate before measuring (named-export
  unwrap — the prodthrottle lesson).
- **Metric-review note (§14)**: the starvation guardrail here is +2
  (wider than overdraw4's +1) because the ordering change does not touch
  the floor or the verb timing — the harm channel overdraw4 named (the
  2-day floor + aid→feast ratchet) is UNCHANGED by this arm, so the arm
  is not expected to fix it; the guardrail watches for ordering-specific
  harm (e.g. spoil-first aid systematically draining food the village
  would have eaten tonight). If the floor harm reproduces, the arm dies
  on the guardrail honestly — the floor question belongs to #200's
  lineage, already tested.

## Proof results (run BEFORE any sims)

RED (gates off) — real RED phases, all pass:
- R1 gate-off byte-identical: spoilLead == leadcourt (33/33 per-day
  hashes, seed 11 — village died d33, death-aware), spoilBelong ==
  belongseek (40/40, seed 22).
- R2 no verbs fire gate-off on the overstock fixture (6.3 fresh-days);
  the parent's own tend discipline still fires (pantry 150000→148500).
- R3 NAIVE RED (the foil): _removePantryKcal on the 3-stack fixture
  drains the +30d stack first (A=100 B=100 C=97) — documents the current
  engine behavior (the overstock2 failure mode), proves the fixture
  discriminates.
- R4 tendLink drains least-perishable first with SPOILFIRST unset
  (A=100 B=100 C=97); gate reads OFF.

MID (SFDRIVER=1 only — the control condition):
- M1 the driver fires aid via the honest tendLink verb (sfAid=1,
  1500 kcal); the aid drains least-perishable-first (A=100 B=100 C=97)
  — the control ordering is the current engine behavior.
- M2 game gate reads OFF; cause line narrated after the engine beat.

GREEN (SFDRIVER=1 + SPOILFIRST=1):
- G1 AID fires fresh-first via honest tendLink (no pre-draw): sfAid=1,
  1500 kcal; the +2d stack drained first (A=97 B=100 C=100); sub pantry
  1000→2500 (subaid channel, real food); trust 30→38; haven pantry
  lighter by exactly the aid (150000→148500); cause line AFTER the
  engine beat (tend@0 cause@1 — honesty ordering pinned); floor
  respected (6.2 fresh-days); one verb/day marked; gate reads ON.
- G2/G3/G4 siege-gate: lingerer / recent-raid (lastRaidDay=28, day=30)
  / gorge-night-trailing (day 29, day 30) all hold verbs off; hold
  counted (sfGateHeld=1).
- G5 floor math: maxDrawdownKcal = fresh − 2×burn (2143 at the unit
  fixture; ≥1500 on real overstock).
- G6 FEAST fires when no aid channel: sfFeasts=1, 5000 kcal real pantry
  draw (150000→145000), cause narrated, floor respected (6.1d). (First
  version honestly refused — the base's eveningFeast preempted the
  driver's feast in upkeep; fixed by running tryFeast BEFORE base.upkeep,
  same preemption doctrine as daily.)
- G7 DRIVER NEVER PAYS TRIBUTE (negative assertion): owed belong-side
  link on an overstock pantry — no sfTribute counter, no early-tribute
  cause line, tributePaidWeek untouched.
- G8 priority aid > feast: dusk upkeep yields the feast when an aid
  channel exists (sfFeasts undefined); the aid fires in daily (sfAid=1);
  exactly one verb/day.
- G9 payTribute drains soonest-spoiling first (A=97 B=100 C=100).
- G10 CONSERVATION: pantry 11000→9000, removed=2000 — kcal in = kcal
  out; whole units from the soonest stack (4×500, A.units 7→3); other
  stacks untouched. No creation, no destruction.
- G11 NARROWNESS: with SPOILFIRST=1, a bare _removePantryKcal (no opts
  — the diplomacy-verb call shape) still drains least-perishable-first
  (A=100 B=100 C=97). The gate does not leak to non-drawdown callers.
- G12 SPOILED SKIPPED: spoil-first never pays already-spoiled stacks
  (RotA=10 untouched, soonest-good B drained 10→7) — pantryDraw's
  honesty boundary.
- G13 armed determinism: spoilLead bit-identical across runs (33 rows).
RESULT: all checks passed (RED, MID, GREEN), independently re-run.
Det-gate 32/32 + SMOKE=1 below, before trusting comparisons.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, spoilLead seed 33, 120d: 123 drawdown beats. The aid
beats are the engine's own tend beats (named subordinates — Emberhold,
Stonebridge; honest varying amounts 1,500/1,600/1,890 from whole-unit
over-removal). The driver's cause lines fire after confirmed verbs:
- "🍖 The shelves groan — ~14 days of fresh on hand, and the rot is
  already circling. We eat the mountain tonight, or it eats itself."
  (d29, d68)
- "🌾 Haven's shelves hold ~7 days of fresh — more than the village
  eats before it turns. The surplus goes to Stonebridge's fire, not
  the rot." (d67; ~4d at d70 as the pantry thins — the count is
  post-draw, honest)
They read as a village deciding — the why after the what, thinning
counts, named recipients. Nothing robotic.
**PASS.**

## Pilot results

8 runs/side, identical seeds (11/22/33/44 × spoilLead/spoilBelong),
180d death-aware. Det-gate 32/32 + SMOKE green both sides before
trusting comparisons.

| metric | control (SFDRIVER=1) | armed (SFDRIVER=1 + SPOILFIRST=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 412.6k | **1418.6k** | **MISS** (need ≤ 350.7k; ratio **3.439**) |
| rot/villager-day | 69 | **165** | **MISS** (need ≤ 92; ratio **2.399**) |
| median survival | 93d | 179d | report-only |
| national | 3/8 | 5/8 | ✓ (≥ 1) |
| table | 2/8 | 4/8 | — |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 4/8 | 6/8 | — |
| wave-5 unlocks | 2/8 | 4/8 | — |
| hungryDays | 18 | 19 | ✓ (≤ 19.8) |
| starvation deaths | 4 | 5 | ✓ (≤ 6) |
| drawdown verbs | 30a/33f lead, 0a/10f belong | 52a/29f lead, 0a/25f belong | mechanism fires |
| siege-gate holds | 70 | 96 | gate live |

Per-policy rot/vd: lead 94→100 (near-neutral); belong 39→**232**
(the explosion is belong-road — the tribute verb, which never fires
as aid there). Per-seed belong rot: s22 43k→291k, s33 33k→195k, s44
29k→**492k**.

**Verdict: KILLED AT PILOT per §14.** The primary missed decisively
(3.44×, not ≤0.85×) and the rot/vd guardrail breached (2.40× vs the
1.335 band). No confirm spend — the pilot is not a sniff-test miss,
it is an inversion.

## Why the primary inverted (autopsy — mechanism measured, not theory)

The spoil-first TRIBUTE drains the fresh flow and leaves the preserved
savings to rot. Diagnostic on belong s44 (the worst seed):

- Pantry snapshots, control: 37k → 11k → 7k → 4k → 7k (lean; the
  least-perishable-first tribute drains the preserved stockpile).
- Pantry snapshots, armed: 37k → 62k → 70k → 51k → 36k — the
  preserved pile ACCUMULATES (22k/19k/19k/12k) while fresh piles up
  alongside it (39k/50k/32k/24k).
- What rotted, 100d: control 15k total (11k Foraged food); armed
  **423k "Foraged food" in 103 stacks + 56k "Foraged food (dried)"
  (preserved!) in 33 stacks**.

The village's food economy is a pipeline: fresh → (meals fresh-first)
→ surplus → (cook drive) → preserved savings. The village's meals eat
fresh-first, so preserved savings are eaten LAST — they are only
drawn by the tribute. Control's least-perishable-first tribute is a
tax on the savings: it drains the preserved stockpile the village
would never get to, keeping the pantry lean and the pipeline
flowing. Armed's soonest-spoiling-first tribute is a tax on the FLOW:
it takes the fresh food the meals and the cook drive were about to
use, the preserved savings accumulate untouched, and at 30d they rot
— 56k of preserved rot — while the displaced fresh piles up and rots
behind it (423k).

Finding #199's blanket prescription ("any future drawdown arm MUST
draw from the soonest-spoiling end") is REFUTED for the tribute verb.
The correct design is VERB-SPECIFIC:
- AID (tendLink): soonest-spoiling-first is CORRECT — it is
  humanitarian (feed the thin subordinate the food that needs eating
  now). overdraw4 proved it (0.503); this arm's lead road is neutral
  (94→100 rot/vd) with the aid firing 52×.
- TRIBUTE (payTribute): least-perishable-first is CORRECT — it is
  extractive (tax the stockpile savings, leave the flow). This arm's
  belong road proves the inversion (39→232 rot/vd).

The overstock2 finding misread the "rot pool": the preserved food
nobody touches is not waste to be drained by fresh-first verbs — it
is the savings, and the least-perishable-first tribute is what keeps
it from becoming rot. overdraw4's success is now re-explained: its
fresh-first AID worked AND its tribute stayed least-perishable-first
(base timing, current ordering). This arm changed the tribute too —
that is the entire delta.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| pilot control | 3/8 | 2/8 | 0/8 | 4/8 | 2/8 | 93d | 180d |
| pilot armed | 5/8 | 4/8 | 0/8 | 6/8 | 4/8 | 179d | 180d |

Exiled: 0 everywhere. The scale wall is not broken by this arm (and
the arm is killed). Note: the armed side's longer median (179d vs
93d) is the rot mechanism's shadow — villages live longer with
clogged pantries, then rot more.

## Death-cause shares

Control (70 deaths): combat 38, wound 6, villager combat 7, sickness
5, starvation 4 (6%), monster 4, contest 5, thirst 1.
Armed (65 deaths): combat 40, wound 4, villager combat 3, sickness 2,
starvation 5 (8%), contest 4, monster 11. Same families — no new
death mode. The armed side's deaths skew monster (11 vs 4) — longer
lives meet more monsters, not a lever harm signature; starvation is
flat (4→5, within the +2 guardrail).

## Village assessment (plain words)

Eight villages per side, and the pantry told the story before the
numbers did. On the control side the pantries stayed lean — the
tribute walked out with the oldest stores, the racks kept turning
fresh into preserved, and the rot pile stayed a rounding error. On
the armed side the pantries clogged: the tribute took the fresh food
off the top, the preserved savings piled up in the back, and then
the savings themselves rotted — 56k of smoked food, a month's work
at the racks, gone to the flies while fresh food rotted in front of
it. The villages lived longer (179d median) with full shelves and
died with full shelves. The lesson is architectural, not moral: a
drawdown verb is not a drawdown verb. Aid feeds the hungry — take
the food that's about to turn. Tribute taxes the stockpile — take
the savings, leave the flow. Finding #199 said "soonest-spoiling or
nothing"; the sims say the tribute was right all along, and the
finding needs the verb-specific correction.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the game-code spoil-first drawdown
  ordering — src/js/hierarchy.js `_removePantryKcal(kcal, {spoilFirst})`
  + `_spoilFirstDrawdown()` gate (SPOILFIRST=1, default OFF), tendLink +
  payTribute opt-in. REVERTED byte-clean via patch file (never stash);
  the driver scripts/policies/spoilfirst.js DELETED per kill protocol.
  Kept as instruments: scripts/test-spoilfirst-20261015.js (RED/MID/
  GREEN, all pass; INFO-SKIP when the driver is absent),
  scripts/det-gate-spoilfirst-20261015.js (32/32; INFO-SKIP),
  scripts/measure-spoilfirst-20261015.js (INFO-SKIP), this evidence
  file + per-seed JSONs/logs under evidence/2026-10-15/.
- **FILLED (instrument)**: the honest-engine-call drawdown driver
  pattern (driver-first preemption in daily/upkeep; the aid preempts
  the base's weekly tend via tendedWeek idempotency); the r13
  contribution pre-seed for feast fixtures; the 100-unit 3-stack
  fixture (overstock-scale + ordering-discriminating).
- **DOCUMENTED** (backlog): (a) finding #199's prescription is
  verb-specifically wrong — tribute must stay least-perishable-first
  (drains the preserved savings); aid should be soonest-spoiling-first
  (overdraw4's proof stands); (b) the "rot pool (food nobody touches)"
  from the overstock2 finding is the preserved SAVINGS, not waste —
  the least-perishable-first tribute is the drain that keeps it from
  rotting; (c) a future arm could test aid-only spoil-first (tribute
  pinned to default ordering) to isolate the aid effect cleanly —
  this arm's lead road (94→100 rot/vd, 52 aids) suggests near-neutral,
  not the overdraw4 0.503, so the aid-only question is still open.

## Metric review (§14)

1. **KILL stands — primary missed decisively (3.439 vs ≤0.85) and the
   rot/vd guardrail breached (2.399 vs ≤1.335).** No re-scoring. The
   pilot was the right size: the inversion is 4× the bar, not noise.
2. **The per-vd guardrail did its job.** Absolute rot alone (3.44×)
   could be dismissed as "longer lives rot more" (median 93→179d);
   the per-vd form (2.40×) proves the mechanism is real, not a
   longevity confound. The r25b calibration (1.335) is validated as
   a guardrail — the breach is 1.8× the noise band.
3. **The starvation guardrail (+2) was the right width.** The
   ordering change does not touch the floor or verb timing; the
   overdraw4 floor harm did not reproduce via ordering (starvation
   4→5, hungryDays 18→19). The +2 band absorbed trajectory noise
   without masking.
4. **The "own control in the SAME sweep" rule mattered.** The
   control here (driver ON, current ordering: 412.6k) is nothing
   like overdraw4's control (driver-equivalent OFF: 1388.9k) — the
   driver itself draws down hard. Inheriting a baseline would have
   wildly misread the delta.
5. **Finding #199 needs amendment, not deletion.** The finding's
   diagnosis (least-perishable-first verbs can't drain the rot pool)
   was correct for the AID verb in the overstock context; its
   prescription ("MUST draw soonest-spoiling") overgeneralized to the
   tribute. The backlog entry should carry the verb-specific
   correction.

## Convergence state

food-economy: **killed-at-pilot** (spoilfirst). The game-code
spoil-first drawdown ordering is dead as a blanket change: routing
aid AND tribute through soonest-spoiling-first multiplied absolute
fresh-rot 3.44× (412.6k→1418.6k) and per-villager-day rot 2.40×
(69→165), breaching the r25b guardrail. Mechanism measured: the
tribute must drain the preserved savings
(least-perishable-first); soonest-spoiling-first taxes the fresh
flow and leaves the savings to rot (56k preserved rot on the worst
seed). The verb-specific correction (aid fresh-first, tribute
least-perishable-first) is the open next arm — overdraw4's 0.503
stands as the aid-side proof. food-economy stays `converging`;
prodthrottle remains the only landed rot lever.
