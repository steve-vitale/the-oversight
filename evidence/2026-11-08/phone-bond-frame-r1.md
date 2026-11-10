# Phone-frame proof after bond dawn (OVE-56)

Trusted-touch 16-stage `phone-frame-replay-r1.js` receipts at 390×736 and 390×844 against tip `1c1b23482` (includes OVE-51 / #41 bond dawn and OVE-52 / #42 fighterState wiring).

- Method: disposable loopback `evidence/2026-10-19/serve-release-phone-r1.cjs` (SW disabled, `Cache-Control: no-store`), Chromium `channel=chrome`, CDP `Input.dispatchTouchEvent`.
- Receipts: `phone-bond-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `node scripts/phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → 12 passed, 0 failed
- Stale inputs cleared: `bond-initiation.js`, `villager-brain.js`, plus #42 boot inputs `game.js`, `fieldFights.js`, `engine/combat.js`, `villager-agency.js`

Store note: Project `docs/phone-frame-after-bond-20261108.md`.
