# assignTask dawn commitment (OVE-65 / Phase 6)

Trusted tip base: `c47d7df53` (OVE-68 #52 on local master; ancestor includes
`ddb7f90da` DUTY dawn pick / gardenKeeper honor).

## Verdict

**Done.** Player/conversation `assignTask` standing orders feed as `ASSIGN`
extras and win the dawn commitment (`assign_standing`). Align maps the
assigned task onto a real objective. OVE-36 materialize≠commit preserved.
Obedience gate unchanged (orders already cleared it at write). gardenKeeper
DUTY honor intact; garden assign commits as haven chore.

## Before (parallel / ignored)

Standing assignTask suppressed competing DUTY ads (OVE-60) but never became
the dawn commitment — the life brain could lottery-pick against the order.

## Fix

| Piece | Role |
|---|---|
| `assignFeedCand` / `assignFeedCandFor` | Standing non-rest assignment → one ASSIGN extra (`vbrainSrc: 'assign'`) |
| `assign_standing` in `vbrainScorePick` | Binding override after win-plan, before DUTY/expedition (no Math.random) |
| `writeCommit.assignTask` | Persist task on commitment |
| `vbrainAlignObjective` ASSIGN branch | forage/water/cook/hunt/scout/patrol/haven/gather map onto real kinds |
| Seam `vbrainDisableAssignPick` | Failing control: ASSIGN still scores, never commits |

Does **not** rewrite `assignTask`, re-check obedience, or retune Muse
occupation/garden/region lanes.

## Probe

`scripts/test-assign-dawn-commit.js` — **30/30** (seed `20261108`).

Includes feed/commit/align, `vbrainDisableAssignPick` failing control,
no-order/rest empty feed, and gardenKeeper+garden assign (haven commit,
no DUTY steal).

`scripts/test-duty-dawn-candidates.js` — **42/42** (regression).

Also: `check-wired` villager-brain (0 unwired), `validate-ontology` green.

## Phone-frame

Mirrored #51/#52 recipe:

- Loopback `evidence/2026-10-19/serve-release-phone-r1.cjs`
- Chromium `channel=chrome`, CDP touch, `phone-frame-replay-r1.js` 16 stages
- Receipts: `evidence/2026-11-08/phone-ove65-frame-{736,844}-r1.json`
- `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `test-phone-frame-proof.js` → 12/12

## Balance / offline

- Fresh observer-neutral panel (seed 7 × capable/risk-aware/socialite/winseek,
  150d): `evidence/2026-11-08/neutral-ove65-assign-dawn-panel.json.gz`
- `scripts/balance-proof-update.js`
- `node scripts/build-offline-assets.js` after brain change

## Behavior-preservation note

ASSIGN is binding inertia for already-obeyed standing orders only. Unassigned
errand mix / DUTY top-score path unchanged. Errand mix movement, if any, is
limited to people with a live assignment — the intended Phase 6 close of the
parallel-decider gap.

## Files

- `src/js/villager-brain.js` — ASSIGN feed + pick + align
- `scripts/test-assign-dawn-commit.js` + green-list `quick`
- phone-frame + balance proofs + receipts/panel above
- `docs/ONTOLOGY.md` — regenerated
- `sw.js` — offline asset regen (if changed)
