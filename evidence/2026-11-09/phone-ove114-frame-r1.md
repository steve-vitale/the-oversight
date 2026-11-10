# Phone-frame proof after Market lean (#86)

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against tip `e8a7463bc` (PR #86 Market sponsor contest lean; includes #85 phone + #84 All-Seeing).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent` (OVE-106/109/111 recipe).
- Receipts: `phone-ove114-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Softlocks (zero primary controls): 0 / 0
- Stale inputs cleared for Market sources: `src/data/godpaths.json`, `src/js/contestEngine.js`, `src/js/godverbs.js`
