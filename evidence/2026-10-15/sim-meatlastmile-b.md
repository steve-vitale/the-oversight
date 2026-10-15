# sim-meatlastmile-b.md — Cook→eat last-mile meat pipeline diagnostic (loop B, 2026-10-15)

ARM: sim-meatlastmile (diagnostic, instrument-only, ZERO src/js changes)
Finding: sim-findings #17 (open, 2026-10-13) — Cook→eat last mile: revealed
monster meat rots uneaten (player-eaten 0 across all arms); scholars satiated
by fish/garden, succession wipes packs, blind cooking burns 60% (r12 kitchen).

## PRE-REGISTRATION (written before any sims, 2026-10-15 ~00:00 CDT)

**Diagnostic GO:** ≥80% of killed-monster meat kcal stage-attributed across
the pipeline, AND a stage-by-stage breakdown that names the binding stage
(or honestly names the stages as unconcentrated).

**Horizon:** 180 days death-aware (dead villages stop simulating; matches the
scale-wall suite cadence; long enough for multi-carcass lifetimes + rot
cycles + successions; 180d is the pacing-law absolute max, not a target).

**Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 (the standard courtship-road pilot
seed set; 8 seeds — a diagnostic, no confirm spend).

**Policies:** leadcourt, belongseek — the competent-family courtship road
(same substrate as the r18 courtkill baseline and today's sim-carcasshaul
pilot; arms share one identical-seed baseline per MEASUREMENT §11).

**Instrument:** scripts/meatlastmile-lib-20261015.js — harness-side wraps
(call-through, before/after observation; predation-lib pattern). Stages:
killed → corpse-rot → hauled → cleaned (self + specialist) → cooked/smoked/
rendered/pemmican → eaten (player, by foodState; villager, via pantry
ledger) → rotted (pack/stash/pantry) → succession-lost → leftover.
Belltoad legs vs body attributed separately (plantId meat_belltoad_legs vs
meat_belltoad; Steve 2026-10-13: legs 2/3 of gross, safe; body poisonous).

**Gates before attributed numbers:**
- SMOKE=1 instrument-honesty gate (policy.daily fires ≥10×/run; per-day
  state hash sanity; at least one carcass-stage transition observed
  somewhere in the suite, else the instrument is measuring nothing).
- det-gate: instrument-armed vs pristine trajectories byte-identical on
  2 seeds (the r27 instrument-honesty pattern — SMOKE proves honesty).
- test-meatlastmile: fixture proof — forced kill/clean/cook/eat/rot events
  attribute to the right stage, each exactly once.

**Metric review (the run writes here, never mid-run re-scores):**
Coverage redefined once during the run — honestly, in the instrument, before
the attributed sweep: the first definition (1 − (|grossUnattr| + |netResidual|)
/ killed) double-counted because the net-side lacked its opening balance and
the reveal is a value step. Final definition: coverage = 1 − |grossUnattr| /
killed (the pipeline attribution), with the pack-side identity
(hauled + revealDelta + cookGain = cleanLossVal + cookLoss + eaten + rots +
donated + succession + leftover + pemmicanIn + carcass outflows) required to
close to ~0 as a cross-check. It closed EXACTLY (packResidual = 0). No metric
was re-scored after seeing numbers; the GO threshold (≥0.80) never moved.

## RESULTS

**DIAGNOSTIC GO: MET** — coverage 0.953 ≥ 0.80 (per-run median 1.000, min
0.659 on two short village-lost runs where corpses were mid-rot-clock at
game over; 16/16 runs instrumented, 0 instrument errors).

Instrument: scripts/meatlastmile-lib-20261015.js (harness-side wraps,
call-through, zero src/js changes). Proof: scripts/test-meatlastmile-20261015.js
33/33 GREEN — fixture conservation coverage=1.0 (kill→rot→haul→clean→cook→
eat→rot→succession each attributed exactly once; belltoad legs = 2/3 of gross
attributed separately), det-gate byte-identical armed-vs-pristine on seeds
11/22 × 60d (SMOKE=1 instrument-honesty gate).

### Where does the meat die? (16 runs, 141,950 gross kcal killed)

| Stage | kcal | % of killed | verdict |
|---|---|---|---|
| Rotted on corpse, unlooted | 113,130 | **79.7%** | THE BIND — dominant, un-concentrated elsewhere |
| Hauled to pack (player) | 23,520 | 16.6% | the only live onward path |
| Villager-hauled to pantry | 0 | 0% | mapmem haul never fired (MAPMEM unset = control substrate) |
| Unattributed (corpses mid-clock at game over) | 5,300 | 3.7% | honest residual, short runs |

**The bind is unconcentrated nowhere — corpse-rot IS the single dominant
stage at 79.7%.** The cook→eat "last mile" barely exists because meat almost
never leaves the corpse.

### Pack-side: what happens to the 23,520 hauled kcal

- **Reveal step: −20,043** (22 reveals) — `markMonsterFoodSafe` grants flat
  40%-of-gross kcalEach to pack/stash meat; the instrument values undiscovered
  potential at hiddenKcal, so discovery is a real −60% value step. (Engine
  convention, not a bug — but it means the "potential" was never realizable.)
- **Butcher's cut (physical): 6,078** lost at the knife (10 self-cleans,
  0 specialist cleans — the specialist butcher path never fired).
- **Rotted on the kitchen counter (prepStash): 4,604** — the second-biggest
  sink. Cleaned meat is carried to the counter and forgotten; the dawn sweep
  takes it. (E.g. white_noise_heron: 1,100 net cleaned → 1,210 rotted on the
  counter, reveal-valued.)
- **Eaten by the player: 800** (0.6% of killed) — and ALL of it **raw off the
  carcass** (foodState 'carcass' at eat time), never cleaned, never cooked.
  Cause found: the reveal grants kcalEach+edible to carcass-state items, so a
  discovered carcass is directly edible at 10%-of-gross per bite. 5/16 runs ate
  any monster meat at all.
- **Cooked: 0. Smoked: 0. Rendered: 0. Pemmican: 0.** The entire
  clean→cook→smoke ladder saw ZERO monster meat in 16 runs. The last mile
  isn't broken — it's untraveled.
- **Succession: 0 lost across 92 successions** — packs held no monster meat
  at any death. The "succession wipes packs" mechanism is real (verified in
  fixtures: death pack zeroes kcalEach), but there was never any meat to wipe.
- **Donated to pantry: 0. Leftover: 0.**
- Pack-side identity closes exactly: in 3,477 = out 3,477 (residual 0).

### Belltoad (the legs/body split)
Body 1,400 gross (1,300 rotted, 100 unattr); legs 2,800 gross (2,600 rotted,
200 unattr). **Zero hauled, zero eaten.** The safe legs — 2/3 of the gross,
Steve's design point — rotted on the corpse like everything else. The
discovery chain (test → legs safe) never starts because the meat never
leaves the kill site.

### Killer split
Player kills: 77,440 gross (55%). Villager kills: 64,510 (45%) — these die on
other nodes, unaddressable by the player under loot-as-action. Even perfect
player-side hauling caps at ~55% of the gross.

### Wall numbers (standing directive)
national 9/16, table 0/16, wins 0/16, wave45 9/16 (maxWave 4), median
survival 106d (13 village-lost, 3 survived). No wave-5 unlocks. Telemetry
deviation check vs scale-wall baseline: QUIET (no large deviations).

## CONVERGENCE STATE

converging — the diagnostic answered its question (the bind is corpse-rot at
79.7%, not the cook stage), but the finding it refines (#17) stays open: the
fix is upstream of cooking (haul incentives / corpse-side discovery), not in
the kitchen.

## VILLAGE ASSESSMENT

The village on the courtship road is a competent forager that treats monster
kills as battlefield events, not food events. Kills happen (217 carcasses /
16 runs, hushwolf alone 42k gross), the kill beat is honest ("search the body
if you want the meat"), and then the village walks away — 4 out of 5 kcal
rot where they fell. The few carcasses hauled (24 haul events) mostly sit on
the kitchen counter until the dawn sweep takes them; the policy cleans
occasionally (10 self-cleans, never via specialist) but never cooks. Scholars
eat fish, garden food, and trail mix; monster meat is not on the mental menu
— undiscovered flesh stays "unknown," and even discovered carcasses are eaten
raw in tiny amounts (800 kcal total) rather than processed. 92 successions
moved the mantle without a single kcal of monster meat changing hands. The
village is not starving for lack of meat — it is blind to meat it already
killed.

## BLANKS

1. **Documented (evidence, not chased): the corpse-rot bind.** 79.7% of
   killed-monster gross rots unlooted. The last-mile instruments (cook/smoke/
   render/pemmican) measured ZERO throughput — not because they're broken,
   but because meat never arrives. Any future arm on #17 must work the
   kill→haul transition (haul incentives, corpse-side discovery prompts,
   villager haul on the control substrate), not the kitchen.
2. **Documented: the reveal makes raw carcasses edible.** `markMonsterFoodSafe`
   grants kcalEach+edible to carcass-state items (40%/4 portions), so the only
   monster meat ever eaten was raw carcass. Whether Steve wants discovered
   carcasses directly edible at 10%-of-gross/bite (vs. forcing the clean step)
   is a design question for the backlog.
3. **Documented: the counter is the second sink.** 4.6k of 23.5k hauled rotted
   on the prepStash. Cleaned meat with a 2-day clock and no cook-through is a
   rot pipeline, not a food pipeline.
4. **Documented: villager haul measured 0** — MAPMEM was unset (control
   substrate, matching the carcasshaul control). The villager-haul path
   exists but didn't fire here; the carcasshaul armed pilot covers it.
5. Minor sense note (not chased): "Fresh food keeps days, not weeks. Smoke it
   over a fire to make it last." repeats every dawn until preserve is learned
   (leadcourt/s11 d3–d6) — legible, but the repetition reads robotic.

## SENSE-TESTING

Read, as a person: kill beats are honest and in-fiction ("It's dead. The
carcass is there on the ground — search the body if you want the meat. But
you don't know this flesh."). Haul beats are terse and true ("Taken: Sinew
cord x2, White Noise (carcass) x1."). Corpse-rot beats land with consequence
("On the carcass nearby, Hummice (carcass) went bad — maggots, smell, the
whole sad story. Leaving it had a cost.") — but only when the player is on
the same node; distant rot is silent, which is correct fog-of-war. The
pipeline's narration is good; the pipeline's throughput is the problem. No
monster-meat cook/eat beats exist because the events don't happen — the
silence is the finding, and it reads as a village that doesn't think of
kills as food, which is exactly what the numbers say.

## TELEMETRY DEVIATION CHECK

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current evidence/2026-10-15/meatlastmile-rows.json --metrics national,table,wins,exiled` → **quiet** (1 file, 4 metrics, no large deviations). Per-seed rows written to evidence/2026-10-15/meatlastmile-rows.json; aggregate ledger to evidence/2026-10-15/meatlastmile-summary.json.

## STALE-LOCK / INFRA NOTES

None — lock/claim protocol not used by arm workers (coordinator-owned).
