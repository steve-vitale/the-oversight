# Duty dawn candidates (OVE-60 / VILLAGER-BRAIN Phase 6 slice)

Trusted tip base: `74a16306c` (origin/master, #47 person-trust baseline).

## Verdict

**Done.** Unassigned villagers get `DUTY` ads in the dawn extras feed from
believed village needs (`objResourceBelief` → forage/cook when pantry low;
water when cistern days low). Player/conversation `assignTask` remains a
binding commitment: assigned villagers get no competing duty ads. No
auto-`assignTask`, no IAUS curve invent, Muse lanes untouched.

## Probe

`scripts/test-duty-dawn-candidates.js` (seed `20261108`) — **21/21**.

| Case | Result |
|---|---|
| Believed-low pantry (force-stale) | `DUTY` forage + cook in `dutyFeedCands`, `vbrainFeedExtras`, dawn log (`vbrainSrc: 'duty'`) |
| Believed-full pantry | no DUTY ads |
| Standing assignment | no DUTY ads; clears → ads return |
| Failing control `vbrainDutyIgnoreBelief` | strips belief hook → no DUTY even when pantry low; restore returns ads |

Also: `check-wired` villager-brain (0 unwired), `validate-ontology` green.

## Phone-frame

`villager-brain.js` change stale'd the boot-input witness. Refreshed in-PR:

- Receipts: `evidence/2026-11-08/phone-duty-frame-{736,844}-r1.json`
- Method: loopback `serve-release-phone-r1.cjs`, Chromium `channel=chrome`,
  CDP touch, `phone-frame-replay-r1.js` 16 stages
- `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `test-phone-frame-proof.js` → 12/12

## Balance / offline

- Fresh observer-neutral panel (seed 7 × capable/risk-aware/socialite/winseek,
  150d): `evidence/2026-11-08/neutral-ove60-duty-dawn-panel.json.gz`
- `scripts/balance-proof-update.js` → measurement-workflow + proof-update green
- `node scripts/build-offline-assets.js` (sw.js ASSETS) after brain change

## Files

- `src/js/villager-brain.js` — `dutyFeedCands` / belief-need ads into `vbrainFeedExtras`
- `scripts/test-duty-dawn-candidates.js` + green-list `quick`
- `docs/ONTOLOGY.md` — regenerated
- phone-frame + balance proofs + receipts/panel above
- `sw.js` — offline asset regen

## Quick check note

Tip-preexisting Muse red left alone: occupation panels (`rail_conductor`
fixture). Person-trust baseline refreshed on #47. Other tip godpath flakes
(alien-party-readiness, daily-voice, lunge-runtime) unchanged by this slice.
