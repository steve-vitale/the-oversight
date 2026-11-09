# OVE-74: DUTY objective completion accrues practice

## Problem

OVE-71 made teach/patrol/hunt DUTY picks live, but `villagerPractice` only
fired from `resolveOneAssignment`. DUTY never writes `assignTask`, so
competence cells for those tasks stayed 0 after real objective work.

## Fix

- DUTY align stamps `o.practiceTask` (ASSIGN does not — keeps practice on
  `resolveOneAssignment`).
- `objAccrueDutyPractice(vid, task)` — one rep, no `assignTask`, honors
  `objDisableDutyPractice` failing control; skips when a standing assignment
  is present (no double-count).
- Seams:
  - teach: `objOnTeachLesson` after `lesson.taught` (HAVEN_CHORE teach)
  - patrol/scout: `objOnExploreReturn` on EXPLORE away-return
  - hunt: `objOnHuntReturn` on purpose=`hunt` return; empty-tile quarry drop
    sets `huntEmptyDrop` and does **not** practice

## Proof

| Check | Result |
|---|---|
| `scripts/test-duty-objective-practice.js` | 31/31 |
| `scripts/test-combat-social-duty-dawn.js` | 34/34 |
| `scripts/test-duty-dawn-candidates.js` | 42/42 |
| `scripts/test-assign-dawn-commit.js` | 30/30 |
| `check-wired` villager-objectives + villager-brain | 0 unwired |
| phone-frame (`phone-ove74-frame-{736,844}-r1.json`) | 12/12 |
| balance panel seed7 × 4 policies / 150d + proof-update | green |

## Files

- `src/js/villager-objectives.js` — practice helpers + teach/empty-hunt seams
- `src/js/villager-brain.js` — DUTY `practiceTask` stamp
- `src/js/game.js` — explore/hunt return hooks
- `scripts/test-duty-objective-practice.js` (+ green-list quick)
- phone/balance proofs + ontology regen
