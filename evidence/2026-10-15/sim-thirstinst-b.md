# sim-thirstinst-b — COLLAPSE-THIRST instrument (ARM 2, loop B 2026-10-15)

**Run:** fleshout-b-20261015T064103Z · ARM 2 of 3 · sim-findings **#286** (claims #286; COLLAPSE-THIRST — instrument-only diagnostic)
**Date:** 2026-10-15 · repo `~/workspace/the-scattering`, worktree `~/workspace/worktrees/sim-thirstinst`

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** — per the canon rule this is stated, not invented. All water mechanics observed here (cistern liters, villager 2L/day draw, health −5/day when unmet, `registerDeath` cause `'thirst'` through the real pipeline in `villageDrinks`, hearth boiling 6L/wood, villager task `'water'` hauling creek water into the dirty side, cistern cap 40L) are read from `src/js/game.js` as-is.

## Pre-registration (§11 — written before sims ran)

- **Primary metric:** attribution coverage = (early-siege villager thirst deaths fully attributed) / (early-siege villager thirst deaths). "Early-siege" = day ≤ 40 (the finding's day-20–32 window, bounded); "villager" = `player=false` (`vid !== Game.villagerId`); "fully attributed" = every covariate slot present in the instrument's record: scholar presence at death + d-7..d-1 at-haven share · water-duty state (assignees on `'water'`, victim's own task, 7d cistern trajectory) · siege presence/intensity (lingering count, world-monster count, combat deaths in 7d, attack say-beats in 7d) · trust deltas in the 7d window (net + by-reason, from the `tele('trust')` channel) · pantry water/food state at death (kcal, `pantryFreshDays`, cistern clean/dirty, wood) · cause-split placement.
- **GO threshold (DIAGNOSTIC GO):** coverage **≥ 80%** AND named separating factors between thirst deaths and siege survivors (or honestly named **unconcentrated** per the pre-registered separation rule below). GO → land the instrument as this arm's commit (scripts + evidence only). MISS → evidence-only; the blank stays open with measured coverage.
- **Horizon + why:** 180 days, death-aware (§10 — reachability-style diagnostic; the finding's deaths sit in the early window but the separation analysis needs the full collapse trajectories; dead villages stop simulating, +10d tail max).
- **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 — exact literals, identical on both sides.
- **Policies:** `leadcourt` + `belongseek` (competent-player family; the bankleg finding was measured on leadfeast/belongseek).
- **A/A sanity (binding):** armed = instrument wraps ON; control = pristine. Per-day state hashes armed-vs-control must be **byte-identical** on every seed before any attribution is trusted (wraps are call-through; a divergence invalidates the attribution).
- **SMOKE=1 gate (instrument-honesty):** `policy.daily` fires ≥ 10× per run; at least one death-attribution observed somewhere in the suite (fixture or sweep), or the instrument is measuring nothing.
- **Separation rule (pre-registered):** compare the per-death covariate rows of early thirst deaths vs other early death modes and vs run-level siege-survivor context (the A/A sweep's own control side). A factor "separates" if it concentrates on thirst deaths and not on survivors (e.g. dry-clean share = 1 on all thirst deaths vs <1 on survivors). If no factor concentrates, report **unconcentrated** — do not invent a story.

## What was built (instrument only — zero src/js changes)

- `scripts/thirst-lib-20261015.js` — `installThirst(Game)` / `finalizeThirst(Game, track)` / `armedStateHash(Game)`. Wraps: `Game.registerDeath` (covariates at the exact death beat), `Game.say` (water/combat/death beats verbatim for sense-testing), `Game.tele` (the `'trust'` channel: `{who, delta, reason}` with day), plus `track.sampleDay()` for the per-day cistern/wood/pantry/water-duty/monster/haven/roster snapshot. Follows the predation-lib call-through pattern; every wrap is try/catch-guarded observation.
- `scripts/test-thirst-20261015.js` — fixture proof (Part A: forced thirst deaths ×2 + one combat death on seeds 11/22/33 — attribution exactly-once, water-duty victim marked, no attribution on the combat death, death beats narrate honestly; Part B: det-gate armed-vs-pristine byte-identical on seeds 11/22, 60d; Part C: SMOKE gates). All green.
- `scripts/sweep-thirst-b-20261015.js` — sweeps both policies, 8 seeds × {armed, control} = 32 runs at 180d, with the A/A byte-identicality gate, SMOKE gate, wall numbers, and death-cause shares. Raw JSON → `evidence/2026-10-15/thirst-b-<policy>.json`.

## Results

### Proof tests (scripts/test-thirst-20261015.js) — GREEN
- **Part A (fixture, seeds 11/22/33):** forced 2 thirst deaths + 1 combat death per seed. Attributed **exactly twice per seed** (6/6), each fully attributed across the covariate set; the water-duty victim correctly marked `victimTask='water'`; the combat death produced **no** attribution (cause split keeps `combat` separate); death beats narrate honestly ("💀 A person, maybe 50s died of thirst. There was nothing to drink." — matching the dry cistern); zero instrument errors. All checks green on all 3 seeds.
- **Part B (det-gate):** armed-vs-pristine **byte-identical** per-day state hashes on seeds 11/22 (60d belongseek) — the wraps perturb nothing.
- **Part C (SMOKE):** `policy.daily` fired ≥ 10×/run; death-attributions observed in the fixture suite (6).

### Sweeps (8 seeds × {armed, control} × 180d death-aware)
- **leadcourt** (`evidence/2026-10-15/thirst-b-leadcourt.json`): A/A **8/8 byte-identical** (instrument is trajectory-neutral). **0 early-siege (d≤40) villager thirst deaths** on either side.
- **belongseek** (`evidence/2026-10-15/thirst-b-belongseek.json`): A/A **8/8 byte-identical**. **0 early-siege villager thirst deaths** on either side.

### The phenomenon does not reproduce on current master
#286's 9 deaths were produced by the **bankleg layer's** at-haven scholar trajectory (killed at pilot 2026-10-15, layer deleted per protocol). On current master, across 16 armed runs × 180d on the two competent-family policies, the early-siege villager thirst mode is **absent on both sides**. This is itself the diagnostic's headline: collapse-thirst was a deleted-lever trajectory artifact, not a standing game behavior. The instrument stands proven in fixture (6/6) and neutral in the det-gate, ready for the next water/siege lever — but it has not attributed a single real-run death, because there were none.

### Coverage (pre-registered primary)
**unmeasurable — 0/0.** No early-siege villager thirst deaths in 16 armed runs. Per the pre-registered GO (≥80% coverage AND named separating factors), the GO is **not met** → **MISS** → evidence-only, blank stays open. (The instrument's function is separately proven: 6/6 fixture attributions, 8/8 det-gate byte-identical.)

### Separating factors
Not evaluable — the pre-registered separation rule needs thirst deaths vs survivors, and the cohort produced zero thirst deaths. Recorded honestly as **unconcentrated/unmeasurable**, not as a story.

### What the sweeps DID find (thirst-adjacent)
- **Two thirst-adjacent death modes exist, and they are different things.** (1) `cause: 'thirst'` — villager cistern deaths via `villageDrinks` (the finding's mode). (2) `cause: 'dehydration'` — the **scholar's own** overnight metabolic death via `engine/calories.js` `resolveDay` (hydration ≤ 0 → −12 health/night). Each policy saw exactly 1 dehydration death across 8 seeds (leadcourt-s55, belongseek seed TBD in JSON).
- **Probed: leadcourt-s55 dehydration.** Day 12, scholar-side (Violet Pang), scholar **away from haven**, haven cistern **0/0 clean/dirty**, wood 15, pantry **39,194 kcal / 32.66 fresh days** (food abundant), 6 world monsters (0 lingering), 12-person roster. The scholar ranged with food abundant and died of thirst — a scholar water-management death (didn't carry/drink enough), NOT the villager collapse-thirst mode and NOT a scholar water block (the take gate still never touches water; the scholar's own bottles are the failure point).
- **Sense-read (SENSE-TESTING LAW):** the succession aftermath on day 13 reads as people, not bookkeeping — "That night, they bring Violet home. Nobody asks you to help carry; nobody has to. By morning the grave is dug by the fire, and the body is laid out beside it." The mantle passes (Elena offered a trial). The telegraph rule held: "⚠ DEHYDRATED: find and treat water today." warned before the death. The death beat is honest about the cause.

### Wall numbers (the standing scale-wall report)
| policy | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| leadcourt (armed, 8 seeds) | 5/8 | 0 | 0 | 6/8 | 0/8 | 108d | 182d |
| belongseek (armed, 8 seeds) | 4/8 | 0 | 0 | 3/8 | 0/8 | 107d | 182d |
Control sides identical by construction (A/A 8/8 byte-identical both policies). No table, no wins — the wall stands.

### Death-cause shares (armed; both sides identical)
- leadcourt: combat 121, villager combat 50, monster 39, expedition 14+3, sickness 12, starvation 7, "a wound that wouldn't close" 9, contest 3, dehydration 1, lockjaw 1, alien 1, ambush 1, "a dog-shaped silence at the treeline" 1. **Zero `thirst`.**
- belongseek: combat 127, villager combat 57, expedition 18+1, monster 22, sickness 18, contest 9, starvation 5, "a wound that wouldn't close" 8, dehydration 1, lockjaw 1, "The Static Kite" 1, "Buffering" 1, ambush 1, "a dog-shaped silence at the treeline" 1. **Zero `thirst`.**

## Village assessment (plain words)

Sixteen villages lived twice — once with the instrument watching, once pristine — and the two lives were byte-identical, which is the point: the instrument sees without touching. No village in this cohort died of thirst. The villages died the usual competent-policy deaths: combat first (scholars and villagers both), then monster and expedition bleed. One scholar per policy died of dehydration while ranging — Violet Pang on leadcourt-s55, day 12, food abundant, water mismanaged. The village that lost her carried her home and dug her grave by the fire without being asked. The thirst instrument's headline is an absence: the early-siege villager collapse-thirst of #286 belonged to a trajectory (the bankleg layer's at-haven scholar) that no longer exists. The cistern mechanics are intact and the scholar's water remains a genuine survival axis — the dehydration death proves the axis is live — but the specific collapse-thirst cluster is a deleted-lever artifact.

## Blanks filled / documented

- **DOCUMENTED (finding): COLLAPSE-THIRST was a deleted-lever artifact.** 0 early-siege villager thirst deaths in 16 × 180d runs on leadcourt/belongseek (A/A 8/8 both). The bankleg layer (killed at pilot, deleted per protocol) was the necessary condition for the 9 deaths. Any future lever that keeps the scholar at-haven through early sieges should re-run this instrument before judging thirst guardrails. → sim-findings #286 stays **open**; the instrument spec is recorded here for rebuild.
- **DOCUMENTED (taxonomy): two thirst-adjacent death modes.** `thirst` (villager, cistern, via `villageDrinks`) vs `dehydration` (scholar, overnight, via `engine/calories.js`). The instrument attributes both through the same `registerDeath` wrap; the evidence's cause tables now name both. Future thirst work must pre-register which mode is in play.
- **FILLED (tooling): the trust-delta/water-side instrument spec.** `installThirst`/`finalizeThirst` proven in fixture (6/6 attributions, water-duty marking, trust-7d windows, siege windows, cistern trajectories) and det-gated 8/8 byte-identical. Per the pre-registered MISS protocol the scripts are **not landed this run** (evidence-only); the spec above is the rebuild recipe.

## Metric review (§14 — mandatory)

1. **The GO's denominator assumed the phenomenon would reproduce.** It didn't — the bankleg layer was killed between the finding and this arm. A diagnostic GO that requires N deaths cannot be judged when the lever that produced them is gone. Next run: pre-register a **phenomenon-presence gate** (≥3 early-siege thirst deaths in the cohort) BEFORE the coverage GO; if the gate fails, the verdict is "phenomenon absent" (a finding, not a miss-on-the-merits).
2. **The SMOKE gate as coded is sweep-local; as pre-registered it is suite-wide.** The sweep script exited 1 ("zero death-attributions") while the fixture suite observed 6. The gate's intent (instrument-honesty) was satisfied by the fixture. Next run: make the sweep's SMOKE gate accept the fixture proof as the honesty evidence, or run the fixture inside the sweep.
3. **Metrics held otherwise.** A/A byte-identicality, identical-seeds, death-aware horizons, pre-registered coverage — all honored; the miss is reported as a miss, not re-scored.

## Convergence state
**parked** — the diagnostic did not meet GO (coverage unmeasurable on a phenomenon-absent cohort); blank #286 stays open. The instrument spec is validated in fixture and parked until a lever reproduces early-siege thirst. The axis's next work, per the finding: re-run this instrument against any lever that changes the scholar's at-haven presence or water duties.
