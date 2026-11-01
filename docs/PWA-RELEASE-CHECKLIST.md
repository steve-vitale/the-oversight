# Installed update and rollback

## Current source-bound witness (2026-10-24)

Current receipts are published-lifecycle-{736,844}-publicb3-native-r1.json.gz
under evidence/2026-10-21; the independent public pin is
evidence/2026-10-24/published-lifecycle-b3-baseline-r1.json.gz. Actual public
b3c5ea6e33b71359db62acd27fb2efbde9999743 is the installed starting/rollback
runtime. Both phone heights verify178 cached text inputs and both icons at
all five stages, full native-hook bytes, exact two-field legacy migration,
paid movement/pickup and stopped-server cold Continue. Focused gate25/0 passes.
See evidence/2026-10-24/publicb3-native-refresh-r1.md. Older witnesses below
retain their historical identities; they do not clear the current-source gate.

Maintenance from the runtime root, with bundled Playwright on NODE_PATH:

1. Freeze the actual published commit's runtime assets; compare the offline
   closure with its Git blobs, allowing only recorded text line endings and
   exact binary icons. Keep candidate code out of that archive.
2. Run `node evidence/2026-10-21/published-lifecycle-r1.cjs <public-runtime-root> <fresh-revision>`.
   This owns port8942 and closes it. Retain both complete JSON receipts,
   screenshots and uniquely named run log; losslessly gzip receipt bytes.
3. Run `node evidence/2026-10-21/published-lifecycle-pin-r1.cjs <public-runtime-root> <full-public-commit> <actual-736-receipt.json.gz> <fresh-pin.json.gz>`.
   This checks installed cache against archive and Git independently.
4. Update the explicit pin, revision and public commit in
   scripts/lib/installed-lifecycle-proof.js together. Run
   `node scripts/godpath/test-update-cache-safety.js`, quick and full checks.
   Unknown migration changes require investigation; preserve failed attempts.

These local unique update stamps are test fixtures, never a publication action.
Runtime owner review, balanced-measurement decisions, ship-loop publication
and physical iOS/Android validation remain separate.

## Historical evidence

Current lifecycle evidence is
../evidence/2026-10-21/mobile-opening-audit-r1.md, the mobile-opening review UI
on056e07a08 and actual published57ca baseline/rollback. Each stage verifies173 text inputs,
both icons, full loaded payload and correct stopped-origin cold build.
Discovery checks were explicitly invoked; foreground timing and physical
devices remain open. Oct19 release-final-pwa-audit-r2 (d0c62ff99), older
release-lifecycle-audit-r4 and installed-data-r3 receipts are historical.
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
2. Choose an actually installable historical main build. The shipped e6e0e376
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
## Actual published57 lifecycle witness (2026-10-21)

Current retained files are published-lifecycle-{736,844}-mobile-opening-r2,
replayed after the opening/grounds UI change. The original finalr5 below is
historical source456 evidence. The baseline pin and actual published57 code
remain unchanged; current candidate/rollback full payload and five cache panels
pass at both heights. The validator reads the new compressed files. Refer to
mobile-opening-audit-r1; do not reuse r5 as current UI evidence.

The retained finalr5 witness uses actual published57ca Game, candidate456 Game
and actual published57ca Game again under unique local update/rollback stamps.
Only the five stamp files are transformed in memory; HTTP caches stay warm.
At390x736/844 it covers18 trusted touches each, native old-build movement and
pickup, both real update buttons, exact final native-save bytes, full loaded
payload comparisons, candidate/rollback stopped-origin cold Continue, all173
text cache inputs and both icons at five stages. Only the two explicitly
declared corpse scene migration fields differ on candidate load.

This is an emulated local lifecycle witness, not a physical-device,
deployment, owner-review or rollback-mechanics-equivalence claim. Rolling back
restores old gameplay defects too. The old zero-coordinate loot refusal is
retained as a failure; the positive lifecycle fixture puts the body at2,2.

Maintenance: the existing scripts/godpath/test-update-cache-safety.js validates
the current runtime against compressed receipts through
scripts/lib/installed-lifecycle-proof.js. Any cached runtime/icon or recipe
change invalidates the retained witness. Regenerate instead of weakening it:

1. Export the pinned published57ca files with git archive into a separate root
   (src, assets, scripts, index.html, sw.js, version.json, manifest.json). Do not
   overwrite another agent's checkout. The published archive has CRLF text;
   independent Git comparison normalizes line endings and retains both hashes.
2. Use the shared kit recipe published-lifecycle-fixture-r1.cjs with arguments
   old-root and a new output filename. It seeds812 and prepares explicit
   geometry/legacy cargo; it does not claim natural campaign attainment.
3. From candidate root run node
   evidence/2026-10-21/published-lifecycle-r1.cjs old-root new-revision with
   Playwright available. It owns local8942; leave it free. Preserve failed
   pilots. Synthetic stamps never authorize publication. Both HTTP refusal
   and cold offline Continue must pass, with no player-payload rewrites.
4. Inspect screenshots/raw payload differences, compress accepted JSON, update
   the validator's two receipt paths, and regenerate the pinned baseline with
   published-lifecycle-pin-r1.cjs old-root if intentionally changing baseline.
   Update recipe/fixture references together if moving the retained recipe.
   Keep the exact published commit and independently verify all source hashes.
5. Run the focused update-safety test, quick and full checks. Retain the audit,
   failures, fixtures, cache/source hashes and explicit remaining release gates.

Full audit: evidence/2026-10-21/published-lifecycle-audit-r1.md. Real iOS/Android,
background/audio/safe-area and public-release decisions remain separately open.
