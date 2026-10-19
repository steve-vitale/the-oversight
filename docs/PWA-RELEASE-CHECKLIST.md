# Installed update and rollback

Current lifecycle evidence is
../evidence/2026-10-19/release-opening-lifecycle-audit-r2.md, runtime4fdc897c7.
The actually shipped007c4feb worker upgrades to this candidate; both candidate
and rollback launch with the server stopped, with the same existing save.
`scripts/release-lifecycle-smoke.cjs` repeats this on exact Git commits using
fresh disposable output/origin and unique immutable test stamps. See that audit
for the command, retained raw receipts and the warm HTTP-cache/foreground limits.
The older release-final-pwa-audit-r2.md (runtime d0c62ff99) is historical.
Candidate and compatibility rollback each verify167 text inputs, both icons,
full saved payload and correct stopped-origin cold build. Discovery checks
were explicitly invoked; foreground timing and physical devices remain open.
Older release-lifecycle-audit-r4 and installed-data-r3 receipts are historical.
The rollback must retain the versioned data loader AND update-control repairs:
removing destructive page cleanup alone left a waiting worker serving the wrong
build offline. Register the running build's worker URL and activate only that
installed matching worker. Never treat an online label as cold-launch proof.
See RELEASE-SMOKE.md for the integrated journey and feedback checklist.

October19 parent-candidate progress is recorded in
../evidence/2026-10-19/release-update-guidance-audit-r1.md: stopped-origin
candidate and compatibility-rollback launches verify167 text files and both
icons. Those receipts precede the safer update-failure copy and do not clear
the final-source gate; the r2 audit above repeats it on the final source.
Observe all three native save events (beforeunload,
pagehide and hidden visibilitychange); a pagehide-only sample can precede
another legitimate save. Compare the full committed run without normalizing
saveSeq; explain any save-index-only lastPlayed delta separately.
Repeated failures must offer connection/retry guidance and preserve the app.

Use this alongside MOBILE-PLAYTEST.md. A successful cold fresh install is not
evidence that an existing installation can safely update. A new cache name is
not evidence of fresh contents. The October18 warm-cache experiment loaded new
scripts with22 old JSON definitions until boot and offline data keys were
versioned together.

## Prepare without touching player storage

1. Freeze the runtime roots and record commits, dirty source hashes, build
   stamps and included repairs. Use a disposable same-origin HTTP fixture with
   real service workers. Keep each artifact immutable. Never change bytes under
   an already used stamp. Do not serve the retained working stamp to players.
2. Choose an actually installable shipped build. Current007c4feb is verified.
   The older shipped e6e0e376
   worker fails installation because its manifest includes three archived JSON
   files. That is failure evidence, not a valid installed-worker baseline.
   d3fab299 is the verified older main fixture. Record this historical gap.
3. Play an old-build expedition or explicitly import an unedited save captured
   from actual old-build play. Keep origin, bearer, roster, knowledge, health,
   inventory, equipment and full saved payload. Preserve custom item metadata.
   Back up operator test storage; there is no player Export Save UI to claim.
4. Prime both CacheStorage and a warm HTTP cache with old data, using long cache
   lifetimes on static assets. Confirm an active controlling old worker. Do not
   clear caches, unregister workers or empty storage as a test shortcut.

## Actual phone update

1. Switch the fixture to the candidate, with a unique later stamp consistent in
   index, worker, build.js, manifest and version.json. Use the real update banner
   through trusted touch. Observe any failed request or missing control.
2. Capture the committed run at normal pagehide and compare the full saved JSON
   after reload. Index lastPlayed or saveSeq changes must be explained explicitly;
   they cannot conceal changes to the payload. Continue normally and compare
   all owned items, including automatic equipment migration, roster and Codex.
3. Collect every cached text input and the actual boot data request URLs after
   Continue using the passive function in scripts/browser-cache-receipt.js
   (Playwright page.evaluate), retaining its JSON output.
   Run:

   `node scripts/verify-installed-cache.js <receipt.json> <frozen-runtime-root> <served-build>`

   Require matching content hashes, full expected input coverage and exact
   versioned JSON keys. A running build label alone does not clear this gate.
   The optional served-build argument is for an explicitly restamped immutable
   fixture; it rewrites only the five release stamp files during verification.
4. Stop the HTTP server. Leave to a blank page, cold reopen, Continue and move
   with real touch. Check the same saved survivor, state and reachable controls.
   An offline checkbox alone does not prove a stopped-origin boot.

## Roll back code, preserve the run

1. Freeze the intended prior gameplay with required cache/data-loader repairs
   retained. Label such backports; do not claim a byte-exact historical runtime.
   Give it a unique stamp with a later timestamp so update discovery offers it.
2. Restore the server, switch the artifact and use the actual update banner.
   Repeat payload comparison, Continue, every cached input hash, stopped-server
   cold boot and touch movement. Do not restore an older save just to roll code
   back. If compatibility fails, stop and retain the failure before recovery.
3. Retain receipts, fixture request log, served roots and hashes, screenshots,
   exact differences and failures. The fixture server and r2 repaired receipts
   are in evidence/2026-10-18/installed-update-server-r4.cjs and
   installed-data-*-r3.json. The earlier repaired r2 receipts precede a legacy
   test-adapter compatibility adjustment; r3 repeats on the final source.
   installed-update-*-r1 receipts are the stale-data failure.

Local fixture stamps are synthetic and never deployment authority. Release
stamping and public deployment remain Steve's explicit shipping decision.
Physical iOS and Android installation, background recovery, safe areas and
audio need separately recorded checks. Chromium emulation does not clear them.
