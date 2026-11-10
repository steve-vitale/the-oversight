# Phone-frame proof after OVE-68 quickcheck residuals

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against tip `ddb7f90da` (#51 gardenKeeper + DUTY pick) + OVE-68 `game.js` rallied AI-flee hold.

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-ove68-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Stale inputs cleared: `src/js/game.js` on combined #51 tip
