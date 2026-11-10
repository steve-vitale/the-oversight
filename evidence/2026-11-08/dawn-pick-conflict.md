# Dawn pick conflict probe (OVE-34)

Date: 2026-11-08  
SHA: `aa5d9ef92d6f` (`origin/master` tip at probe)  
Script: `node scripts/probe-dawn-pick-conflict-20261108.js`  
Seed: `20261108`

## Claim

On one seeded fixture, the three legacy dawn voices still recommend
contradictory lead actions. Phase-1 `villager-brain.js` (PR #7) already
owns the live pick; this note measures residual conflict and the
materialize≠commit honesty seam. No IAUS curve arithmetic shipped.

## Fixture

- Living villager forced `explorer` range profile
- Win-plan stage forced `gear`, equipped cleared (unarmed + unarmored)
- Pantry stocked ~2500 kcal

## Results

| Voice | Pick |
|---|---|
| Goals / obj lottery (extras off) | `HAVEN_CHORE` (vgoal top `gear_up`) |
| Win-plan shadow | `hold` (`gear_hold`) |
| Agency shadow | `EXPEDITION` (chance 0.09) |
| Live brain | commit `HAVEN_CHORE` / override `win_plan:gear_hold`; materialize `VISIT` |

Legacy contradictions reported by the probe:

- `goals_vs_agency` — HAVEN_CHORE vs EXPEDITION
- `winplan_vs_agency` — hold vs EXPEDITION

Live residual:

- `materialize_vs_commit` — VISIT vs HAVEN_CHORE under win-plan override
  (phase-1 RNG-stability design: core lottery materializes; commitment
  carries the aimed override for `vbrainExecuteDepart`)

`contradictoryPicksShown: true`. Feed extras included both `gear_hold`
(w=6) and agency-range `EXPEDITION` (w=0.55). Agency source still contains
the chance-roll fallback; with `vbrainOwnsDawn()` live it is not taken.

## Next

See store doc `dawn-scoring-entry.md` (OVE-34): preferred next product
slice is materialize/commit honesty under pre-registered ±0.08 core-kind
tolerance. Curves stay for Steve review.
