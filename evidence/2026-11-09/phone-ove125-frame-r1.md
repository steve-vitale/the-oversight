# Phone-frame proof after OPA blood lean (#94)

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against tip `f656b2ff8` (PR #94 One-Person Army blood contest lean; includes #92 phone + #91 Market army).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent` (OVE-121 recipe).
- Receipts: `phone-ove125-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Softlocks (zero primary controls): 0 / 0
- Stale inputs cleared for OPA blood sources: `src/data/godpaths.json`, `src/js/contestEngine.js`, `src/js/godverbs.js`
