# Duty dawn pick/commit (Phase 6 follow-up / OVE-60 gap)

Trusted tip base: `3339c0195` (origin/master after #49 census + #50 verify).

## Verdict

**Done.** DUTY ads from believed needs could score into the dawn log but
never became the commitment (`DUTY_picked=0` on #49 census). This slice
adds a `duty_top_score` override so a top-scoring DUTY wins the dawn
commit; `vbrainAlignObjective` maps forage/water/cook onto real
objectives. No `assignTask`. OVE-36 materialize≠commit honesty preserved.

## Before (ads-only)

Minimal probe on tip `206fe4931` (seed `20261108`, DUTY forage w=3.2 vs
core HAVEN_CHORE w=0.01):

| Field | Value |
|---|---|
| DUTY in feed/extras | yes (`forage`) |
| `vbrainScorePick` materialize | `HAVEN_CHORE` |
| log pick / override | `HAVEN_CHORE` / `null` |
| commit kind | `HAVEN_CHORE` |
| verdict | `DUTY_ADS_ONLY_NEVER_COMMITS` |

Census #49: capable 2484 DUTY_ad / 0 DUTY_picked; competent 2987 / 0.

Root cause: `vbrainScorePick` only materializes win-plan + EXPEDITION
overrides; DUTY extras were log-only.

## Fix

| Piece | Role |
|---|---|
| `duty_top_score` in `vbrainScorePick` | Best DUTY extra with `w >=` core pick becomes override (no Math.random) |
| `writeCommit.dutyTask` | Persist task on commitment |
| `vbrainAlignObjective` DUTY branch | forage→FORAGE, water→WATER, cook→HAVEN_CHORE/cook; hash facing outdoors |
| Seam `vbrainDisableDutyPick` | Failing control: ads still score, never commit |
| `gardenKeeper` honor | Standing caretaker: no DUTY ads / no `duty_top_score` |
| `workGarden` appoint-before-prep | Name caretaker before `makePlot` ticks so honor applies |

Does **not** call `assignTask` or bypass obedience. Assigned villagers
still get no DUTY ads (OVE-60 standing-order gate).

## Probe

`scripts/test-duty-dawn-candidates.js` — **42/42** (seed `20261108`).

Includes pick/commit/align assertions, `vbrainDisableDutyPick` failing
control, and gardenKeeper ad/pick suppression + clear-restore control.

`scripts/godpath/test-garden-cultivation.js` — **39/39** (DUTY no longer
steals caretakers during competent `workGarden` prepare).

Also: `check-wired` villager-brain (0 unwired), `validate-ontology` green.

## Phone-frame

Mirrored OVE-60/#48 recipe:

- Loopback `evidence/2026-10-19/serve-release-phone-r1.cjs`
- Chromium `channel=chrome`, CDP touch, `phone-frame-replay-r1.js` 16 stages
- Receipts: `evidence/2026-11-08/phone-duty-pick-frame-{736,844}-r1.json`
- `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `test-phone-frame-proof.js` → 12/12

## Balance / offline

- Fresh observer-neutral panel (seed 7 × capable/risk-aware/socialite/winseek,
  150d): `evidence/2026-11-08/neutral-ove-duty-pick-panel.json.gz`
- `scripts/balance-proof-update.js`
- `node scripts/build-offline-assets.js` after brain change

## Files

- `src/js/villager-brain.js` — DUTY pick override + align mapping
- `scripts/test-duty-dawn-candidates.js` — pick/commit + failing control
- phone-frame + balance proofs + receipts/panel above
- `docs/ONTOLOGY.md` — regenerated
- `sw.js` — offline asset regen (if changed)

## Person-trust baseline

Aimed DUTY→WATER/FORAGE mix moved the seed-84101 non-aimed errand panel
(WATER 136→187). Honest refresh in `test-person-trust-20261108.js` +
`person-trust-prereg.md` note — assertions (±25%) unchanged.

## Quick check note

Leave Muse residuals alone: occupation panels (`rail_conductor`). Tip
godpath flakes (alien-party-readiness, daily-voice, lunge-runtime)
unchanged. Garden cultivation is green after gardenKeeper honor.
