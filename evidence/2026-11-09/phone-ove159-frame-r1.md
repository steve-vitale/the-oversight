# Phone-frame proof refresh after #118 (conversation.js stale)

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against `origin/master` tip `1ec04e167` (Merge PR #118 land-all).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP trusted touch (same recipe as OVE-106/153).
- Receipts: `phone-ove159-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- `node scripts/check.js --only phone-frame-proof` → 1/1
- Softlocks (zero primary controls): 0 / 0 at both heights
- Stale input cleared: `src/js/conversation.js`
- Screenshots: store media `ove-159-phone-refresh/phone-frame-{chat,deer,exit}-final-{736,844}.png`
