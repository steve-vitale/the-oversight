# OVE-76: Hunt DUTY ads win dawn picks

Base tip: `11a8d2582` (`origin/cursor/duty-objective-practice-b2fe` / OVE-74).
Branch: `cursor/hunt-duty-dawn-pick-d17a`.

## Problem

OVE-75 census: hunt DUTY ads fire, but **0** top-score-first picks → no hunt
objective completion → no hunt practice. OVE-71 offered hunt; scoring made it
unable to win `duty_top_score`.

## Root cause (failing control)

In `dutyFeedCandsFor` (`src/js/villager-brain.js`):

| Condition | Prior huntW | Competitor | Result |
|---|---:|---|---|
| pantryLow + known prey | 1.8–2.0 | forage 2.2–3.2 | forage always wins |
| known prey only | 2.0 | teach 2.4 | teach always wins |
| pantryLow, no prey | 1.8–2.0 | forage 2.2–3.2 | forage wins (intended soft) |

Census ad mix (capable): forage = cook = hunt = 202 — hunt ads co-fired with
forage via `huntFromNeed`, so the dominated weight path ran every time.

Failing control shape retained: without known prey, soft `pantry_protein`
hunt stays under forage and dawn-commits forage, not hunt.

## Fix

Known-prey hunt weights (protein path) can honestly top-score:

- pantryVeryLow + prey → 3.4 (> forage 3.2)
- pantryLow + prey → 2.5 (> forage 2.2, > teach 2.4)
- prey only → 2.55 (> teach 2.4; soft vs fresh-raid patrol 3.0)
- pantryLow, no prey → still 1.8–2.0 under forage

Preserved: gardenKeeper skip, assign_standing override, OVE-36
materialize≠commit, no `assignTask`, `vbrainDisableCombatSocialDuty`.

## Proof

| Check | Result |
|---|---|
| `scripts/test-combat-social-duty-dawn.js` | **48/48** (was 34; +hunt weight/pick/align + soft control) |
| `scripts/test-duty-dawn-candidates.js` | 42/42 |
| `check-wired` villager-brain | 0 unwired |
| phone-frame (`phone-ove76-frame-{736,844}-r1.json`) | 12/12 |
| balance panel seed7 × 4 policies / 150d + proof-update | green |
| `check.js --quick` | pending after commit; tip-preexisting occupation/capable-bot reds unchanged |

## Files

- `src/js/villager-brain.js` — known-prey hunt weight ladder
- `scripts/test-combat-social-duty-dawn.js` — pantry+prey top-score proof
- phone/balance proofs + offline asset regen
