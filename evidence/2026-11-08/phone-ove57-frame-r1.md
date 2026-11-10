# Phone-frame proof after OVE-57 tip rebase

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against rebased tip `134a3d0ab` + OVE-57 conversation/rally fixes (`conversation.js`, `villager-objectives.js`).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-ove57-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- Stale inputs cleared: `conversation.js`, `villager-objectives.js` (and tip #45 companionScore inputs already on base)
