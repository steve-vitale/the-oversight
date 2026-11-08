# Duty dawn pick/commit (Phase 6 follow-up / OVE-60 gap)

Trusted tip base: `18ed96788` (origin/master after #49 Phase 6 role census).

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

Does **not** call `assignTask` or bypass obedience. Assigned villagers
still get no DUTY ads (OVE-60 standing-order gate).

## Probe

`scripts/test-duty-dawn-candidates.js` — **37/37** (seed `20261108`).

Includes pick/commit/align assertions + `vbrainDisableDutyPick` failing
control (remove pick hook → DUTY never commits; restore returns).

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

## Quick check note

Leave tip-preexisting Muse occupation reds alone (`rail_conductor` fixture).
