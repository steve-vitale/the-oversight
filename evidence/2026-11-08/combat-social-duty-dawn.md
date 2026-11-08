# Combat + social DUTY dawn offers (OVE-71 / Phase 6)

Trusted tip base: `8ad657540` (`origin/cursor/assigntask-dawn-commit-a0a7` / OVE-65).
Ancestor includes DUTY dawn pick `ddb7f90da` and #52 tip `c47d7df53`.

## Verdict

**Done.** Unassigned villagers get brain-offered `DUTY` candidates for
combat (`patrol` on heard danger, `hunt` on known prey / pantry protein)
and social (`teach` on teachable knowledge). Same `vbrainSrc:'duty'` shape
and `duty_top_score` pick/commit as survival forage/water. Align maps
hunt/patrol/teach onto real objectives. No `assignTask`. OVE-36
materialize≠commit preserved. gardenKeeper + assign_standing honored.

## Before

`dutyFeedCands` only advertised forage/cook/water from
`objResourceBelief`. Phase 6 census after DUTY pick (#53): combat/social
competence cells stayed 0 — hunt/patrol/teach never offered as DUTY.

## Fix

| Piece | Role |
|---|---|
| `dutyKnownPrey` / `dutyTeachOpportunity` | Believed opportunity reads (village.animals; plantsKnownBy + learner gap) |
| `objDangerBelief` → patrol | Heard raid/threat → DUTY patrol (independent of pantry unknown) |
| hunt / teach ads | Same DUTY cand shape; weights soft vs urgent survival |
| `vbrainAlignObjective` | DUTY hunt → HUNT; patrol/scout → EXPLORE; teach/tend/mend → haven chore |
| Seam `vbrainDisableCombatSocialDuty` | Failing control — survival DUTY still feeds |

Does **not** retune Muse policies / occupations / garden numbers, or
auto-write `assignTask`.

## Probe

`scripts/test-combat-social-duty-dawn.js` — **34/34** (seed `20261108`).

Includes feed/commit/align for patrol + teach, known-prey hunt feed,
`vbrainDisableCombatSocialDuty` failing control (survival forage intact),
gardenKeeper + standing assign suppression.

Regressions: `test-duty-dawn-candidates.js` 42/42;
`test-assign-dawn-commit.js` 30/30; `check-wired` villager-brain 0 unwired.

## Phone-frame

Mirrored #52 / OVE-65 recipe:

- Loopback `evidence/2026-10-19/serve-release-phone-r1.cjs`
- Chromium `channel=chrome`, CDP touch, `phone-frame-replay-r1.js` 16 stages
- Receipts: `evidence/2026-11-08/phone-ove71-frame-{736,844}-r1.json`
- `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `test-phone-frame-proof.js` → 12/12

## Balance / offline

- Fresh observer-neutral panel (seed 7 × capable/risk-aware/socialite/winseek,
  150d): `evidence/2026-11-08/neutral-ove71-combat-social-duty-panel.json.gz`
- `scripts/balance-proof-update.js`
- `node scripts/build-offline-assets.js` after brain change

## Files

- `src/js/villager-brain.js` — combat/social DUTY feed + align
- `scripts/test-combat-social-duty-dawn.js` + green-list `quick`
- `scripts/test-duty-dawn-candidates.js` — survival-only assertions under OVE-71
- phone-frame + balance proofs + receipts/panel above
- `docs/ONTOLOGY.md` — regenerated
