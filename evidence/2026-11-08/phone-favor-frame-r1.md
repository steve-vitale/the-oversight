# Phone-frame proof after favor thresholds (OVE-53)

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against tip `4594de6b5` (OVE-50 / #39 — `src/js/convo-wants.js` favor-need unify).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-favor-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed

Store note: Project `docs/phone-frame-after-favor-20261108.md`.
