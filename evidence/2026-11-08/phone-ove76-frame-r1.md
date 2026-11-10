# Phone-frame proof after OVE-76 hunt DUTY dawn pick

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against OVE-76 tip (known-prey hunt DUTY weights can win `duty_top_score` in `villager-brain.js`).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-ove76-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Stale input cleared: `src/js/villager-brain.js` matches live source hash
