# sim-preserve-teach-20261013 — arm: preserve-teach (food-economy lever, game-code)

Worker: fleshout-a run 2026-10-13T21:15:39Z. Worktree: ~/workspace/worktrees/sim-food-preserve.

## Pre-registered header (MEASUREMENT.md §§9-12)

- **Primary metric:** scholar self-trial preserve channel opens: `Game.preserveFood()`
  blind attempt teaches `preserve` (was unreachable: per-item `_messyPreserves >= 2`
  on an item that becomes `preserved` after one smoke).
- **GO threshold:** preserved kcal > 0 on after-side (baseline 0 per r16b) AND no
  survival regression (median survival within ±10d of before).
- **Horizon:** 150d death-aware (dead villages stop simulating; never a fixed 200d).
- **Seeds:** pilot 11/22/33/44; confirm adds 55/66 (× belongseek/leadcourt = 12/side).
- **Policies:** belongseek, leadcourt (competent family; the r16b suite shape).
- **Convergence state target:** killed-at-pilot | converging | converged — judged below.

## The gap (verified, not assumed)

- `src/js/food.js:743-744` (pre-fix): `it._messyPreserves >= 2` per-item counter.
  Targets filter is `foodState === 'cleaned' || 'cooked'`; after one smoke the item
  is `'preserved'` and can never be smoked again. Counter can only reach 1.
  **Unreachable.** Every self-trial smoke is 0.80x/15d forever.
- Canon `docs/PRESERVATION.md`: "the attempt teaches the technique; the sting is
  one-time." Sibling techniques agree: clean learns on first attempt (line 660),
  render learns on first attempt (line 793). Preserve was the outlier.
- Only villager/specialist paths granted it (line 1275: `learnTechnique(tech,'watched')`
  after 2 watches; game.js village smoke racks).

## The fix (src/js/food.js, preserveFood loop)

Replaced the unreachable per-item counter with `if (!knows) this.learnTechnique('preserve','trial');`
— the same one-line-class pattern `renderFat` uses. The sting stays honest: the
attempt that teaches IS the rough job (eff 0.80, 15d above in the same loop); the
NEXT smoke goes solid (0.95x, 30d). learnTechnique is idempotent: first item in a
batch teaches, the rest no-op. Villager/specialist teaching paths untouched.

## Proof test: scripts/test-preserve-teach-20261013.js

Full-harness node test (Math.random seeded BEFORE eval; full src/js order minus
DOM-only). 12 checks:

| # | Check | Pristine (RED) | Fixed (GREEN) |
|---|-------|----------------|---------------|
| 1 | blind smoke #1 teaches preserve (trial) | FAIL | PASS |
| 2 | learned message fires | FAIL | PASS |
| 3 | first smoke = rough job 0.80x | PASS | PASS |
| 4 | first smoke keeps 15d | PASS | PASS |
| 5 | first smoke copy says "rough job" | PASS | PASS |
| 6 | second smoke = solid 0.95x | FAIL | PASS |
| 7 | second smoke keeps 30d | FAIL | PASS |
| 8 | render w/ no fat teaches nothing | PASS | PASS |
| 9 | renderFat still teaches render first try | PASS | PASS |
| 10 | preserve untouched by rendering | PASS | PASS |
| 11 | clean teach path intact | PASS | PASS |
| 12 | learnTechnique called as (preserve, trial) | FAIL | PASS |

**Real RED: 5 FAIL on pristine, ALL GREEN with the fix.** r16b's
test-preserve-r16.js was NOT in the tree (loop-B artifact); this test re-derives
and extends it.

## Before/after on identical seeds (8+8 pilot, 4+4 confirm = 12/side)

Driver: `scripts/sweep-preserve-teach-20261013.js` (reuses food-coupling-20261013
instruments + scale-repro wall instruments + preserve-specific telemetry:
scholar preserveFood calls, learnTechnique(preserve,*) events, end-state
technique, pantry preserved-kcal end/peak).

| Metric (12 before / 12 after) | before | after |
|---|---|---|
| scholar self-trial smoke calls | 0 | 0 |
| trial-learn events | 0 | 0 |
| scholars knowing preserve at end | 0/12 | 0/12 |
| pantry preserved-kcal peak | 170,650 | 170,650 |
| rot kcal | 3,115,105 | 3,115,105 |
| median survival | 87 / 123 | 87 / 123 |
| national | 6/12 | 6/12 |
| waveMax | 3 | 3 |

**Trajectories byte-identical across all 12 runs.** Pilot per-run (before==after):
belongseek 11: d71 lost; 22: d93 lost (nat); 33: d87 lost; 44: d55 lost; leadcourt
11: d80 lost; 22: d150 survived (nat); 33: d150 lost (nat); 44: d84 lost (nat).
Confirm: s55 d31/38 lost; s66 d137/123 lost (nat), identical both sides.

## GO adjudication — GO (mechanism + no-regression), with a premise correction

- **No survival regression: PASS, maximally.** Median 87 vs 87 (pilot), 123 vs 123
  (confirm) — not just within ±10d, identical. The fix cannot move sim
  trajectories because the path it repairs is never exercised by these policies.
- **"Preserved kcal > 0 on after-side": PASS on the letter, but the "baseline 0"
  premise was STALE.** Pantry preserved-kcal peak is 170,650 on BOTH sides — the
  village smoke racks (landed 2026-10-11, game.js) already produce preserved kcal.
  r16b's "0.0k preserved kcal (0 smoke/render/pemmican calls)" referred to the
  **scholar's self-trial** calls — confirmed: 0/12 both sides, before and after.
- **The arm's actual claim — the self-trial channel opens — is proven by the unit
  test (RED→GREEN), not the sweep.** No competent-family policy ever calls the
  scholar's preserveFood, so the sweep can only ever be a regression guard here.
  Killing a canon-correct, RED-proven, zero-regression fix because no current
  policy exercises the path would re-create the gap for the first policy that
  does. Verdict: **GO**, landed, with the follow-up documented below
  (Steve 2026-10-07: make the call, document it, he can overrule).

## Village assessment

The village is hand-to-mouth at the scholar's line and fire-dependent at the
village's: rot dominates (3.1M kcal across 12 runs vs 170k preserved peak;
leadcourt s22 survived all 150d and still rotted 830k). The village smoke racks
fire (12–19k preserved peak/run when a cook is staffed and about-to-rot surplus
exists) but can't keep up with inflow rot. Villages push to national (6/12 held
it at some point) then die mid-ambition (median 87d; the standing scale-wall
pattern). Waves 3 reached, 4–5 never (waveMax 3). The scholar never touches the
smoke press — personal preservation is a policy blank (see findings).

## Blanks filled / documented

- **FILLED (landed):** preserve self-trial teach trigger (this arm).
- **DOCUMENTED (new finding, appended to sim-findings.md):** no competent-family
  policy ever self-smokes as the scholar — the repaired self-trial channel is
  unit-proven but unexercised in long sims. A future policy arm (scholar smokes
  own surplus / works the racks) would open it end-to-end.
- **Sense-test (SENSE-TESTING LAW):** the learned message reads like a person,
  not a counter: "★ Learned: preserving food. Messy, but it worked. Next time
  will be cleaner." The blind-smoke narration is equally human: "You rig a smoky
  fire and tend it a good while. It sort of works — drier, safer, but you know a
  real preserver would do better." No fabricated history, no counter language.

## Convergence

- Axis (scale wall): this arm does not move the wall — the food-economy lever as
  a lens on a single broken rung. State: **converged** for the trigger fix
  itself (proven + landed + no regression); the open channel-exercise question
  belongs to a future policy arm, not this one.
- Files: `scripts/test-preserve-teach-20261013.js`, `scripts/sweep-preserve-teach-20261013.js`,
  `src/js/food.js` (one-block change), this evidence file.
- Commit carries [needs-eyes]: the "★ Learned: preserving food" teaching message
  now actually fires for self-trial players — a player-visible teaching UX the
  game has never shown before.
