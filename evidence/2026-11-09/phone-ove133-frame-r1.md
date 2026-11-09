# OVE-133 phone-frame receipts

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against tip `337f41268` (PR #100 Apex scout-mark army lean; includes #98 phone + #97 All-Seeing council).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent` (OVE-129 recipe).
- Receipts: `phone-ove133-frame-{736,844}-r1.json` — both 16/16 stages, 0 softlocks
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- `node scripts/check.js --only phone-frame` → 1/1
