# SIM-FRAGILITYFEAST — fragility-gated feast, 3-day floor (loop B, food-economy)

Date: 2026-10-19 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-fragilityfeast-b
Axis: food-economy (scale-wall lens) — the named next of sim-overdraw4-b /
sim-overdrawfloor-b (finding: the feast verb can drain TO the 2-day floor;
aid->feast ratchets fragile pantries to the floor, where the next raid tips
the village into hunger).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE sims)

- **Question**: overdraw4 PROVED the fresh-first rot mechanism (confirm
  0.503/0.503) but was KILLED AT CONFIRM on starvation (3→7 vs ≤4); the
  autopsy named the 2-day floor + aid→feast ratchet on fragile pantries.
  overdrawfloor raised the floor to 3 and added a fragility gate — but was
  KILLED AT PILOT (primary 0.884 > 0.85; starvation 1→8, belong-concentrated),
  leaving the open question: is the belong-road FEAST verb itself the harm
  channel? This arm isolates the feast verb on the STANDARD feast substrate
  (leadfeast/belongfeast + FEASTSCALE_R13=1, SEATDRIVE=0): the feast may not
  drain below a 3-day floor and may not fire at all on a fragile pantry. Does
  the fragility-gated feast avoid the starvation elevation?
- **Lever**: scripts/policies/fragilityfeast.js (FRAGFEAST=1, default OFF;
  requires FEASTSCALE_R13=1; wraps FS.leadfeast / FS.belongfeast as
  fragleadfeast / fragbelongfeast). Policy-side only, zero src/js changes.
  - FRAGILITY GATE (the feast verb itself gates): no feast when the pantry
    is fragile — fresh-days < 3, OR a raid in the trailing 7d, OR a gorge
    in the trailing 7d, OR a hungry day in the trailing 7d (trail recorded
    daily, pure read; gorge tracked by the overdrawfloor say-text pattern).
  - 3-DAY FLOOR: feast cost <= freshKcal - 3*burnAt (burnAt in allowgate2's
    engine convention: freshKcal/freshDays, fallback pop*2000).
  - CANDIDATE-ONLY HOLDS (the agGateHeld telemetry lesson from allowgate-b):
    holds counted ONLY when the full r13 candidacy chain passes (reuse
    allowgate2.feastCandidate — dusk, haven, one-feast/day, cadence,
    contribution >=1500, plan.ok, have >= cost*1.5) and ONLY the fragility
    or floor test fails. ctx.ffFragileHeld / ctx.ffFloorHeld. Held feasts are
    POSTPONED, never displaced: Game.hostFeast is refused for the held dusk
    only (finally-restored), cadence tracker not marked, next dusk re-tests.
- **PRIMARY**: starvation deaths, GO = armed <= control (paired, 8-seed pilot).
- **GUARDRAILS**: median survival >= control - 10d; national >= control - 2;
  no new death mode (death-cause compare); rot (pooled rot/100d) <= 1.15x control.
- **SECONDARY**: hold counts (fragile/floor), fsFeasts fired, wall numbers
  (national/table/wins/wave 1-5), fresh-days samples, gorge nights.
- **Horizon**: 180d death-aware (dead villages stop +10d tail).
- **Seeds**: pilot 11/22/33/44 x fragleadfeast/fragbelongfeast = 8 runs/side
  (paired, identical seeds; control RE-MEASURED on current tip — the
  substrate here is leadfeast/belongfeast + FEASTSCALE_R13=1 + SEATDRIVE=0,
  no allowgate2, so no inherited corpus applies). Confirm 8 fresh seeds only
  on pilot GO.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule);
  SMOKE=1 honesty gate (named-export unwrap + live drive check) both sides.
- **Panel (§15)**: balanced panels via scripts/balance-panel.js, before
  (FRAGFEAST unset) and after (FRAGFEAST=1), policies
  fragleadfeast,fragbelongfeast, seeds 11/22/33/44, 180d — the panel is the
  instrument, the pre-registered threshold is the judge. FRAGFEAST added to
  the panel's recorded flag list (otherwise the after panel would re-use the
  before panel's cache — identical identity).
- **Proof**: scripts/test-fragilityfeast-b.js — RED (R1 gate-off
  byte-identical, R2 no holds gate-off, R3 naive foil) + GREEN (G1 feast
  fires on a healthy pantry, G2-G5 fragility holds incl. not-a-kill-switch
  control, G6 3-day floor holds a deep feast, G7 determinism, G8
  candidate-only counting). All green pre-sims, independently re-run.

## (results below — to be filled after sims)

## Proof results (run BEFORE any sims, 2026-10-19)

RED (FRAGFEAST unset; FEASTSCALE_R13=1): R1 gate-off byte-identical
(fragleadfeast == leadfeast, fragbelongfeast == belongfeast, 40d x 2
seeds, per-day hashes identical); R2 no holds counted gate-off on a
healthy feast fixture (the r13 feast fires normally — the layer is
invisible); R3 naive foil (the native r13 feast FIRES on a raid-fragile
fixture — the raid reason is what the layer adds).
GREEN (FRAGFEAST=1): G1 feast fires on a healthy overstock pantry
(1,537-kcal... fixture: 150000→145000, engine feast beat narrated); G2
near-floor (2.5 fresh-days): no feast, ffFragileHeld=1, reason
'near-floor'; G3 raid 3d back: no feast, hold, reason 'raid'; old raid
(10d back) not fragile; G4 gorge beat tracked via the engine's "gorges
at the treeline" line: no feast, hold, reason 'gorge'; G5 hungry day 3d
back: no feast, hold, reason 'hunger'; G6 belong-road feast fires on a
sound pantry (the gate is not a kill switch); G7 the 3-day floor holds a
98,214-kcal feast the old 2-day floor would have allowed (ffFloorHeld=1,
not fragile-hold), while a normal feast on the same pantry fires; G8
armed determinism 40d x2; G9 candidate-only counting (fragile pantry on a
non-dusk and a no-contribution dusk: NO hold counted — the agGateHeld
lesson).
RESULT: all checks passed (RED and GREEN), independently re-run.
Det-gate 16/16 bit-identical BOTH sides; SMOKE=1 honesty gate green both
sides.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, fragbelongfeast seed 22, 120d: 4 feasts (3 armed), 26
fragile-holds, 0 floor-holds. The fired feasts read as a village
deciding: named villagers open them (Casey, Salvador, Piper, Theo), the
fire draws a scavenger to the haven's edge ("Extended Warranty is
circling the edge of the light"), grief sits at the fire ("somebody's
seat is empty, and everybody sees it"), gossip travels ("the story's
getting bigger than what happened"). One feast's buff was honestly
refused by the fusion-reactor ceiling (documented mechanic, not this
arm). The full d21 transcript slice is coherent — water hauling, Piper's
fetch task, the feast beat, the refusal line, gossip fragments. Nothing
reads robotic.
**PASS.** (Observation, engine-side, pre-existing: the item-hold keepsake
beats repeat one template daily — the wall-of-identical-text class from
the prior narration review. Filed, not chased.)

## Pilot results

8 runs/side, identical seeds (11/22/33/44), 180d death-aware. Det-gate
GREEN both sides before trusting comparisons (16/16 bit-identical each).

| metric | control (gate off) | armed (FRAGFEAST=1) | pre-reg |
|---|---|---|---|
| starvation deaths (**PRIMARY**) | 0 | **3** | **MISS** (≤ 0) |
| median survival | 144d | 161d | PASS (≥ 134d) |
| national | 7/8 | 5/8 | PASS (≥ 5 — exactly at the bound) |
| table | 6/8 | 5/8 | — |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 6/8 | 3/8 | — |
| wave-5 unlocks | 0/8 | 0/8 | — |
| hungryDays | 6 | 18 | report |
| rotFresh (absolute) | 2307.3k | 1829.3k | — |
| rot pooled /100d (**GUARDRAIL**) | 208,806 | 164,948 (0.79x) | PASS (≤ 1.15x) |
| exiled | 0 | 0 | unchanged |
| feasts fired | 79 (51 armed) | **32 (22 armed)** | mechanism taxed |
| fragile-holds | 0 | 264 | the gate bites hard |
| floor-holds | 0 | 2 | the floor almost never binds |
| overstock cliffs (>10k/d) | 28d / 361k | 26d / 364k | — |
| pantry peak | 94k | 102k | — |

Per-seed starvation: belong s22 (161d, 1 starvation in 51 deaths —
combat 21 + villager combat 11 + monster 12; 26 holds, 4 feasts fired),
belong s33 (122d, 2 starvation in 41 deaths — violence-dominated; 24
holds, 2 feasts fired). Lead road: 0→0. The belong-road concentration
repeats the overdrawfloor signature (1→7).

**Verdict: KILLED AT PILOT per §14 — fast kill, as designed.** The
primary missed on its binding form (armed 3 > control 0). The gate held
264 feast candidates and the 3-day floor fired twice, feasts collapsed
79→32 — the mitigations taxed the mechanism far more than the harm. The
starvation elevation persists on the belong road with the gate biting:
the harm channel is not the un-gated feast alone. Per §14 a miss is
NO-GO — never re-scored.

## Balanced panel (§15 — the instrument)

Built per the huntstaff/cookbulk pattern: identical substrate, identical
recorded flags (FRAGFEAST is the lever and is NOT in the panel's recorded
flag list — putting it there correctly invalidates as "Unmatched
flags"), identical policies (fragleadfeast/fragbelongfeast) and seeds;
the treatment is the before/after split (FRAGFEAST unset vs 1),
neutrality from the det-gate. Validity clean both panels
(sourcesStable, neutrality 2/2 matched, 0 warnings). Compare decision:
**review_required** (screen only, n=8 pairs) — evidence, not a judge; the
pre-registered verdict (primary MISS) binds. Compare .md attached:
evidence/2026-10-19/fragilityfeast-panel-compare.md.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| pilot control | 7/8 | 6/8 | 0/8 | 6/8 | 0/8 | 144d | 180d |
| pilot armed | 5/8 | 5/8 | 0/8 | 3/8 | 0/8 | 161d | 180d |

Exiled: 0 everywhere. The scale wall is not broken by this arm.

## Death-cause shares

Control (295 deaths): combat 179 (61%), villager combat 84 (28%),
monster 28 (10%), expedition 11, dehydration 2, contest 2, others 3.
Starvation: 0.
Armed (320 deaths): combat 149 (47%), villager combat 96 (30%), monster
42 (13%), starvation 3 (1%), expedition 12, others 18. Same families —
no new death mode (starvation is elevation of an established cause, not a
new one). Villages die of violence on both sides; the armed side adds
hunger at the margin, belong-concentrated.

## Village assessment (plain words)

Eight villages, and the feast learned to stay home. The fragility gate
stood the feast down 264 times — a real, biting gate — and the 3-day
floor held twice; feasts fell from 79 to 32, the rot pile shrank to
0.79x, and villages lived a little longer (median 161d vs 144d). But the
hunger ledger still wouldn't balance: two belong-road villages starved —
one death in a 161-day village that had stood down 26 feasts, two in a
122-day village that had stood down 24. The gates were working; the
hunger came anyway. The pattern now holds across three arms: overdraw4's
autopsy suspected the floor, overdrawfloor raised the floor and gated
fragility, this arm isolated the feast verb itself with both — and the
belong-road starvation elevation persists every time. The feast verb is
not the channel. Whatever is starving the belong road, it isn't the
feast draining to the floor.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the fragility-gated feast —
  scripts/policies/fragilityfeast.js (FRAGFEAST=1, default OFF, requires
  FEASTSCALE_R13=1; DELETED per kill protocol — the file is removed, not
  committed), proof scripts/test-fragilityfeast-b.js (RED→GREEN incl. the
  R3 naive foil, G2–G5 fragility reasons, G7 floor-behavioral hold, G9
  candidate-only counting; independently re-run, kept as instrument),
  sweep scripts/measure-fragilityfeast-b.js (kept, incl. pooled rot/100d
  guardrail form + death-cause shares), det-gate
  scripts/det-gate-fragilityfeast-b.js (16/16 both sides, kept), sense
  script scripts/sense-fragilityfeast-b.js (kept). Per-seed JSONs + logs
  under evidence/2026-10-19/perseed-fragilityfeast-{base,armed}/,
  fragilityfeast-{baseline,armed}.json/.log (kept). Balanced panels
  evidence/2026-10-19/panel-fragilityfeast-{before,after}/panel.json.gz +
  fragilityfeast-panel-compare.md/.json (kept; cases/ caches deleted per
  §15). Zero src/js changes (policy-side only).
- **FILLED (instrument)**: the feast-verb interception pattern (refuse
  Game.hostFeast on feast candidates only, finally-restored, postponed
  never displaced); the fragilityOf reason taxonomy
  (near-floor/raid/gorge/hunger) as a reusable arm pattern; the G9
  candidate-only hold-counting test; the §15 panel pattern for env-flag
  levers (lever flag NOT in the recorded flag list — the huntstaff
  "Unmatched flags" precedent; treatment = the before/after split).
- **DOCUMENTED** (for the coordinator's backlog): (a) the feast verb is
  NOT the starvation channel — 264 fragile-holds + 3-day floor and the
  belong-road elevation persists (0→3), the third arm to measure this;
  (b) the mitigations taxed the mechanism more than the harm every time
  (feasts 79→32 here; rot 0.79x while starvation rose); (c) the belong
  road's hunger needs its own instrumented arm on a non-feast channel —
  candidate: the tribute/tend outflow rhythm or the haul/donation economy
  on the belong road (the r13 contribution rule arms feasts off
  tribute/tend paid — the one inflow the gate never gated); (d) the
  engine's item-hold keepsake beats are a wall-of-identical-text instance
  (filed, not chased); (e) control rot on this tip: 2,307.3k absolute —
  another #188 data point.

## Metric review (§14)

1. **KILLED AT PILOT: the primary missed (starvation 0→3 vs the ≤0 bar).**
   Per §14 a miss is NO-GO — never re-scored against a friendlier metric
   mid-run. No confirm spend. Fast kills are throughput.
2. **The control's zero starvation made the bar absolute** — any armed
   starvation death was a miss. The bar was honest (paired identical
   seeds, control re-measured on current tip); the arm missed it.
3. **The panel's review_required is evidence, not a verdict** (§15): the
   pre-registered threshold is the judge. The panel is attached, not
   decisive.
4. **Median stayed directionally positive (144→161)** — the #224
   precedent holds; the binding harm signal is the starvation count,
   which fired.
5. **The pooled rot/100d guardrail form worked** — aggregate kcal per 100
   aggregate days alive (0.79x, well inside 1.15x). Keep it for future
   arms.

## Convergence state

food-economy: **killed-at-pilot** (fragilityfeast). The named next of the
killed overdraw4/overdrawfloor: the feast verb isolated on the standard
substrate with a fragility gate (264 holds) + 3-day floor (2 holds) —
starvation 0→3, belong-concentrated, primary missed. The fresh-first
drawdown lineage is now 4× measured and 3× killed on the starvation
guardrail; the feast verb is exonerated as the channel. prodthrottle
(landed) remains the only landed rot lever. The feast-as-table-door
secondary stays replicated (already claimed #226).

