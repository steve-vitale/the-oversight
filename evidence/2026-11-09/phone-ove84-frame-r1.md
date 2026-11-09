# Phone-frame proof after OVE-81 scout DUTY dawn offers

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against OVE-81 tip (`dutyScoutOpportunity` / scout DUTY feed in `villager-brain.js`).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent` (OVE-79 recipe).
- Receipts: `phone-ove84-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- Balance: `neutral-ove84-scout-duty-panel.json.gz` via `scripts/balance-proof-update.js`
- Stale input cleared: `src/js/villager-brain.js` matches live source hash
