# SIM-FEASTDRAWDOWN — feast-as-drawdown (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-feastdrawdown
Axis: food-economy (scale-wall lens) — the named next from sim-aiddrain-b.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-aiddrain-b (KILLED AT PILOT, clean null 1.014x) proved
  the aid half of the aidspoil driver contributes NOTHING to that driver's
  4x rot reduction (driver-ON 799k vs pristine 3,144k, identical
  seeds/master). The remaining candidate is the FEAST half (47 aids/97k +
  22 feasts/58k in the driver control). This arm isolates the feast verb
  as a rot drawdown with its OWN pristine control in the SAME sweep
  (never inherit — #247).
- **Lever** (policy-side, scripts/policies/feastdrawdown.js, FEASTDRAWDOWN=1,
  default OFF — ZERO src/js changes): wraps leadfeast (the r13 road,
  FEASTSCALE_R13=1) as feastDrawdown. Mirrors the aidspoil driver's FEAST
  spec but WITHOUT any aid and WITHOUT any tribute:
  - fresh-days > 4 (the overstock trigger) + siege-gate clear (no
    lingerer / gorge-night-trailing-7d / raid-7d) → ONE hostFeast/day.
  - The feast runs under the r13 allowance chain (allowgate2.feastCandidate:
    dusk, at haven, one-feast/day, shared cadence 7d armed / 14d unarmed,
    contribution recentGives(7)+tribute/tend(7) >= 1500, plan.ok,
    have >= cost*1.5, fusion-reactor ceiling).
  - Floor NEVER below 3 fresh-days (maxDrawdownKcal = freshKcal − 3×burn;
    plan.cost must fit). DEVIATION DOCUMENTED: the aidspoil driver used a
    2-day floor; this arm uses the 3-day floor that the aiddrain metric
    review validated as the hunger-safe floor for drawdown verbs
    (overdraw4's 2-day floor is the suspect in that lineage's starvation
    elevation; overdrawfloor kept the elevation even at 3d, so the floor
    is necessary but not sufficient — the guardrails watch it).
  - No double-feast: the driver's feast runs in the dusk upkeep BEFORE the
    base upkeep; when it fires, the engine's s.feastDay is set, so the
    r13 allowance (running after) stands down. If the allowance already
    fired today (s.feastDay === day), feastCandidate returns
    candidate:false and the driver stands down. The driver's feast marks
    its OWN cadence tracker (_fdLastFeastDay), never the shared
    _fsLastFeastDay — the allowance's cadence is not displaced (dutyalone
    G4 pattern; the feastdoor shared-cadence displacement is not
    repeated). The driver's feasts are ADDITIVE drawdown on overstock
    days, which is why wave-5 is a guardrail (dutyalone lesson: extra
    feasts accelerate Standing → wave-5 unlocks → lethal).
  - The feast verb natively draws soonest-spoiling-first (pantryDraw
    ordering) — the rot mechanism under test. No pre-draw trick (the
    aidspoil driver used honest engine calls; the pre-draw belonged to
    the aid verb's _removePantryKcal path, not the feast).
  - Cause lines only after CONFIRMED verbs (overstock2 lesson, #201).
  - Canon check: docs/CANON.md + docs/PRESERVATION.md read. "Rot can't be
    smoked back into food" (the feast serves only good food; the engine
    never serves spoiled stacks); "No nonsensical calorie loss" (the
    feast's own conservation); human-skills≠alien-abilities untouched.
- **Conditions**: CONTROL = pristine leadfeast (FEASTDRAWDOWN unset — the
  RED proof asserts the wrapper is byte-identical to the parent with the
  gate off). ARMED = feastDrawdown + FEASTDRAWDOWN=1. IDENTICAL seeds.
  Control RE-MEASURED in the SAME sweep (never inherit — #247). Both
  sides on current master WITH the landed prodthrottle.
  FEASTSCALE_R13=1 (the leadfeast road as briefed).
- **PRIMARY**: absolute fresh-rot kcal, armed ≤ 0.85 × control (identical
  seeds). Report aggregate AND ex-near-zero range (aiddrain lesson:
  near-zero denominators lie).
- **GUARDRAILS** (harm-specific per #197, median report-only):
  starvation deaths ≤ control+2; hungryDays ≤ control × 1.409;
  rot/villager-day ≤ control × 1.335; no new death mode (n≥3);
  national ≥ control−2; wave-5 unlocks ≤ control+2 (dutyalone lesson).
- **SECONDARY**: feast counts + kcal drawn (driver vs allowance),
  fresh-days distribution, pantry peaks, table/national/wins, wave reach
  1–5, Arc reach, death-cause shares, exiled, wall numbers.
- **Horizon**: 180d death-aware (pacing-law max; dead villages stop — the
  rot measured is rot the village lived to produce, not death-tail
  artifact beyond the +10d tail).
- **Seeds**: pilot 11/22/33/44/55/66/77/88 × (leadfeast / feastDrawdown),
  IDENTICAL seeds control vs armed. Confirm 12–16 only on pilot GO
  (fresh seeds).
- **Det-gate**: 16/16 bit-identical both sides (8/8 per condition);
  scripts/det-gate-feastdrawdown-20261015.js — before trusting any
  comparison. SMOKE=1 honesty gate before measuring.
- **Metric-review note (§14)**: the hungryDays guardrail here is ×1.409
  (#208) rather than ×1.1, because the harm channel under test is the
  driver's own drawdown on overstock pantries (the feast can take a
  pantry down toward the 3-day floor; hunger dynamics are the watch
  item). The wave-5 guardrail (≤ control+2) is new for this arm —
  dutyalone proved extra feasts accelerate Standing → wave-5 unlocks →
  lethal combat, and this driver's feasts are additive by design. If
  wave-5 breaches, the arm dies on the guardrail honestly even if rot
  falls.

## Proof results (run BEFORE any sims)

scripts/test-feastdrawdown-20261015.js — REAL RED → GREEN, all green,
independently re-run.

RED (FEASTDRAWDOWN unset):
- R1 gate-off byte-identical: feastDrawdown == leadfeast per-day hashes,
  40d × 2 seeds (n=40/40 both).
- R2 no verbs fire gate-off on the 6.25d overstock fixture; pantry
  untouched (150000→150000); no driver cause line.

ARMED (FEASTDRAWDOWN=1 + FEASTSCALE_R13=1):
- A1 feast fires on the 6.25d fixture via honest hostFeast: fdFeasts=1,
  4800 kcal real pantry draw (150000→145000), engine 🍖 FEAST beat fired,
  driver cause line ("The shelves groan — ~6 days of fresh on hand, and
  the rot is already circling. We eat the mountain tonight, or it eats
  itself.") narrated AFTER the verb confirms (beat@0 cause@2 — the #201
  fix), floor respected (6.3→6.0 fresh-days, ≥3), drawdown direction,
  one feast/day marked (_fdFired=30), own cadence marked
  (_fdLastFeastDay=30), shared cadence UNTOUCHED
  (_fsLastFeastDay=undefined — no displacement), engine feastDay set
  (the allowance stands down after).
- A2 trigger strictly > 4: 3.9d holds the feast off.
- A3 floor math: maxDrawdownKcal = fresh − 3×burn (78000 at the unit
  fixture); on a small-burn village (burn 2000) the floor binds at 5.0d
  (cost 4800 > allowance 4000 — feast refused) and allows at 6.0d
  (allowance 6000 — feast fires).
- A4/A5/A6 siege-gate: lingerer / recent-raid (lastRaidDay=28, day=30) /
  gorge-night-trailing-7d (gorge day=24, day=30) all hold the feast off;
  hold counted (fdGateHeld=1). A6b: an 8d-old gorge night does NOT hold
  (the 7d window is real).
- A7 no double-feast: s.feastDay === day (allowance already fired) → the
  driver stands down (fdFeasts undefined).
- A8 no displacement pinned: the driver's feast does NOT mark the shared
  _fsLastFeastDay (allowance cadence untouched by design).
- A9 armed determinism: FEASTDRAWDOWN=1 bit-identical across runs (40 rows).
- A10 inert without FEASTSCALE_R13: FEASTDRAWDOWN=1 but r13 unset → the
  driver's feast does not fire.

Det-gate 16/16 (8/8 control pristine leadfeast + 8/8 armed feastDrawdown)
+ SMOKE=1 honesty gate green both sides before trusting comparisons.
RESULT: all checks passed (RED, ARMED), independently re-run.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, feastDrawdown seed 33, 120d: 11 feast beats (10
allowance + 1 driver). The beats read as a village eating — the engine's
feast beats give the WHAT (named villagers open: Esteban, Irving, Batyr,
Sam; named attendees; varying menus), the driver's cause line gives the
WHY after the confirmed verb:
- "🍖 FEAST 📺 — Esteban opens the pantry wide: 10× Foraged food. Irving,
  Batyr, Catalina, Sam and 2 more eat until the fire burns low. Somebody
  laughs so hard they cry. For one evening, nobody is surviving — they're
  just together." (d27, allowance)
- "🍖 FEAST 📺 — Esteban opens the pantry wide: 6× Foraged food, 1×
  Foraged food. Batyr, Catalina, Brian eat until the fire burns low..."
  → "🍖 The shelves groan — ~54 days of fresh on hand, and the rot is
  already circling. We eat the mountain tonight, or it eats itself."
  (d34, driver — the cause line follows the beat, the count is honest)
The driver's feast is rare on this seed (1 in 120d — the overstock +
siege + floor gates are selective), but when it fires it reads as a
village deciding to eat the mountain, not a robot. The allowance's
feasts (no driver line) fill the other days correctly.
**PASS** (with the observation that driver-feast rarity is expected —
the pilot quantifies it).

## Pilot results

8 runs/side, identical seeds (11/22/33/44/55/66/77/88 × leadfeast/feastDrawdown),
180d death-aware, FEASTSCALE_R13=1. Det-gate 16/16 + SMOKE green both sides
before trusting comparisons. (Note: the control JSON's byPolicy rot/vd
carries a pre-fix aggregation bug — 2300 vs the correct 339; the rows and
the overall aggregate are correct. The armed JSON was written post-fix.)

| metric | control (pristine leadfeast) | armed (feastDrawdown) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 3143.8k | **3501.3k** | **MISS** (need ≤ 2672.2k; ratio **1.114**) |
| fresh-rot ex-s88 (near-zero) | 3139.3k | 3461.2k | ratio 1.103 |
| rot/villager-day | 339 | **392** | ✓ (need ≤ 452.5; ratio 1.156) |
| hungryDays | 17 | 15 | ✓ (need ≤ 24.0) |
| starvation deaths | 1 | 0 | ✓ (need ≤ 3) |
| national | 6/8 | 7/8 | ✓ (need ≥ 4) |
| table | 8/8 | 7/8 | report-only |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 8/8 | 8/8 | — |
| wave-5 unlocks | 6/8 | 4/8 | ✓ (need ≤ 8) |
| median survival | 141d | 130d | report-only |
| driver feasts | 0 | 22 (53k kcal) | mechanism fires |
| allowance feasts | 76 | 62 | −14 (partial displacement) |
| siege-gate holds | 0 | 37 | gate live |
| gorge nights (tracked) | 0 | 66 | — |

Per-seed armed/control fresh-rot ratios: s11 2.10, s22 1.22, s33 0.59,
s44 0.19, s55 1.05, s66 0.84, s77 1.18, s88 8.91 (4k→40k — the control
seed was near-zero; the ex-near-zero aggregate is 1.103×). The direction
flips by seed (0.19–2.10 ex-s88) — seed-noise dominance, not a
directional signal. The pre-registered primary is aggregate, and it
missed: 1.114×, not ≤0.85×.

**Verdict: KILLED AT PILOT per §14.** The primary missed (1.114× vs the
0.85 bar). All guardrails held — this is a clean null, not a harm kill:
rot/vd 1.156× (inside the 1.335 band), starvation 1→0, hungryDays 15 vs
17 (inside the 1.409 band), national 6→7, wave-5 6→4 (inside the +2
band). No confirm spend — 22 honest feast verbs / 53k kcal of drawdown
moved aggregate fresh-rot by +11.4%, the wrong direction. The feast verb
is not a rot lever at this scale.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | exiled | maxArc |
|---|---|---|---|---|---|---|---|---|---|
| pilot control | 6/8 | 8/8 | 0/8 | 8/8 | 6/8 | 141d | 180d | 0 | 4 |
| pilot armed | 7/8 | 7/8 | 0/8 | 8/8 | 4/8 | 130d | 180d | 0 | 4 |

Exiled: 0 everywhere. No wins on either side — the scale wall stands
(the table seats, 15/16 combined, but nobody wins).

## Death-cause shares

Control (314 deaths): combat 178 (57%), villager combat 71 (23%),
monster 46 (15%), expedition 6, wound 3, dehydration 3, contest 3,
ambush 2, starvation 1, The Reunion 1.
Armed (269): combat 149 (55%), villager combat 65 (24%), monster 43
(16%), contest 4, expedition 3, ambush 2, dehydration 2, The Landlord 1,
sickness 1. Same families — no new death mode (the n=1 'The Landlord'
and 'sickness' do not meet the n≥3 threshold). Villages die of
violence, not hunger, on both sides; the armed side starves LESS (1→0).

## Village assessment (plain words)

Eight villages per side on the leadfeast road, and the feast verb fired
22 times across the armed runs — 53k kcal of honest pantry drawdown,
each one narrated after the fact with a thinning count — and the rot
pile grew. The control rotted 3,144k; the armed rotted 3,501k. The
feast is a teaspoon next to a pantry that peaks at 149k and rots in
hundred-kilo lots on its own weather, and the teaspoon even points the
wrong way.

The mechanism fired as designed: 22 driver feasts (remarkably, exactly
the aidspoil driver's 22), 53k kcal (vs the driver's 58k), 37
siege-gate holds, the 3-day floor honored on every firing. The
allowance's feasts fell 76→62 — the driver's feasts partially displaced
the allowance's (14 fewer), for a net +8 feasts. But the rot did not
notice the drawdown; it noticed the seed weather.

Who thrived: the villages that reached national (6→7) did it on the
same road with or without the driver's feasts. Who died: the same
combat/monster/raider deaths both sides, starvation 1→0. The blank
this run fills is the one the task named: the aidspoil driver's feast
half, isolated, is NOT the 4× rot lever. The aid half was already
proven null (aiddrain, 1.014×). The 799k vs 3,144k delta in the
aidspoil driver is not explained by either verb alone — it must be an
aid×feast interaction, the 2-day floor (vs this arm's 3-day), or a
driver-level trajectory effect, not the feast verb as a drawdown.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: feast-as-drawdown — the feast-only
  policy driver (scripts/policies/feastdrawdown.js, FEASTDRAWDOWN=1,
  default OFF; zero src/js changes) wrapping leadfeast as feastDrawdown:
  fresh-days > 4 + siege-gate clear → ONE hostFeast/day under the r13
  allowance chain (allowgate2.feastCandidate), floor NEVER below 3
  fresh-days (maxDrawdownKcal = fresh − 3×burn; the documented deviation
  from the driver's 2-day floor), no double-feast (driver runs before
  the base upkeep; s.feastDay blocks the allowance after), no
  displacement (own _fdLastFeastDay, never the shared _fsLastFeastDay),
  no aid, no tribute, cause lines after confirmed verbs. DELETED per
  kill protocol (the layer never touched game code, so there is nothing
  to revert — byte-clean by construction). Kept as instruments:
  scripts/test-feastdrawdown-20261015.js (RED/ARMED, all pass;
  INFO-SKIP when the driver is absent),
  scripts/det-gate-feastdrawdown-20261015.js (16/16; INFO-SKIP),
  scripts/measure-feastdrawdown-20261015.js (INFO-SKIP),
  scripts/sense-feastdrawdown-20261015.js (INFO-SKIP), this evidence
  file + feastdrawdown-pilot-{control,armed}.json + per-seed JSONs under
  evidence/2026-10-15/.
- **DOCUMENTED** (design): the aidspoil driver's 4× rot reduction
  (799k vs 3,144k) is NOT the feast verb alone. Aid-alone: 1.014×
  (aiddrain, killed). Feast-alone (3-day floor): 1.114× (this arm,
  killed). The remaining candidates for the driver's effect: (a) the
  2-day floor (this arm used 3-day; overdraw4's 2-day floor cut rot
  0.503× but was killed on starvation), (b) an aid×feast interaction,
  (c) a driver-level trajectory effect. The next arm on this lineage
  should test the 2-day floor feast-only (isolating the floor), not
  re-test the feast verb.
- **DOCUMENTED** (instrument): the measure script's byPolicy
  rotPerVillagerDay had a reduce bug (`(t, r) => r.villagerDays`
  instead of `(t, r) => t + r.villagerDays`) — fixed mid-run; the
  control JSON's byPolicy value (2300) is stale, the rows and overall
  (339) are correct.

## Metric review (§14)

1. **KILL stands — primary missed (1.114 vs ≤0.85).** No re-scoring.
   The pilot was the right size: 22 verbs fired, the mechanism ran,
   and the aggregate moved 11.4% the wrong way. This is a clean null,
   not an underpowered sniff test.
2. **All guardrails held, so this is a null kill, not a harm kill.**
   rot/vd 1.156× (inside the 1.335 band), starvation 1→0, hungryDays
   15 vs 17 (inside the 1.409 band), national 6→7, wave-5 4 vs 6
   (inside the +2 band). The 3-day floor did its job; the additive
   feasts did not accelerate wave-5 (4 vs 6 — the dutyalone trap did
   not reproduce at this feast rate).
3. **The per-seed heterogeneity (0.19–2.10 ex-s88, 8.91 on the
   near-zero s88) is mechanism analysis, not a friendlier metric.**
   The pre-registered primary is aggregate. The s88 near-zero seed
   (4k→40k) is the aiddrain lesson restated: near-zero denominators
   lie; the ex-near-zero aggregate (1.103×) confirms the miss.
4. **The "own control in the SAME sweep" rule mattered.** This arm's
   pristine control (3,143.8k) exactly reproduces the aiddrain
   control (3,143.8k) on the same seeds — the baseline is stable,
   and the 1.114× is a real null, not baseline drift.
5. **The 22-feast reproduction is a design validation, not a result.**
   The driver's feast fired exactly 22 times (the aidspoil driver's
   22) drawing 53k (vs 58k) — the isolation is faithful. The null
   result therefore closes the "feast verb alone" hypothesis cleanly.

## Convergence state

food-economy: **killed-at-pilot** (feastdrawdown). Feast-as-drawdown is
dead as a rot lever: 22 honest hostFeast verbs (53k kcal) on overstock
pantries moved aggregate absolute fresh-rot 1.114× vs pristine
(3,144k→3,501k), per-villager-day rot 1.156× — noise, with the effect
direction flipping by seed. The feast verb is a social verb (like the
aid), not a drawdown verb at rot scale. Layer deleted per kill
protocol; instruments kept as INFO-SKIP. The live question the pilot
isolates is the aidspoil driver's unexplained 4× (799k vs 3,144k):
neither the aid (1.014×) nor the feast (1.114×) alone explains it —
the next arm should test the 2-day floor feast-only or an aid×feast
interaction. food-economy stays `converging`; prodthrottle remains the
only landed rot lever.
