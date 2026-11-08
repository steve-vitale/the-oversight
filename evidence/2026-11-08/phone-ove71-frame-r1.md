# Phone-frame proof after OVE-71 combat/social DUTY

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against OVE-71 tip (combat/social DUTY offers in `villager-brain.js` on assignTask base `8ad657540`).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-ove71-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Stale inputs cleared: `src/js/villager-brain.js` (and boot graph) match live source hashes
