# Phone-frame proof after companionScore (OVE-54)

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against branch tip based on `6e53adc62` (#43), after adding `src/js/companion-score.js` and wiring door/party/favor-company callers.

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-companion-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Stale inputs cleared: `index.html`, `companion-score.js`, `favor-company.js`, `villager-brain.js`, `villager-objectives.js`, `win-plan.js`
