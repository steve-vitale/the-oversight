# Current-runtime upgrade, stopped-origin offline and rollback

Candidate runtime4fdc897c7f632d87f2d1279f0d8ad181229d353b is archived from
Git, together with actually shipped007c4febca00986aae5bc36bcd4d6966a08c7c04.
The latter installs successfully, unlike the older historical broken worker.
The same disposable origin and touch browser context install the shipped worker
and import the unedited previously captured campaign once. Subsequent phases
never clear storage, restore that fixture or manually unregister a worker.
The actual game's Update banner owns its cache/worker update behavior.

Five completed phases: shipped installation; candidate Update/Continue;
candidate cold offline boot/Continue/east step; rollback Update/Continue;
rollback cold offline boot/Continue/west step. The server is actually closed,
all its connections closed and a new host-side fetch required to fail before
each cold phase. The page leaves to about:blank and returns to the origin.
No browser-offline toggle substitutes for stopping the origin.

Every phase independently verifies all167 cached text input hashes against its
immutable runtime, both cached icon hashes, controller identity and trusted
touch events. Each update/cold phase compares the complete committed saved-run
string with the title's stored payload, including saveSeq. Only bounded
save-index lastPlayed differences are permitted and individually recorded.
Continue additionally preserves inventory, equipment, health, kcal, day,
roster and Codex. The native movement then advances exactly one cell.
Pagehide, beforeunload and actual hidden-visibility handlers are observed;
there is no test-side save helper or gameplay action helper.

Synthetic immutable served versions are6c15cb72f-20261019-205801 for the
candidate ande9f8a538b-20261019-205801 for rollback. They are local fixtures,
not production versions. Rollback is the actual shipped007 runtime with a new
test stamp; that shipped source already contains the compatible versioned data
loader and update/worker fixes. This is not rollback to an incompatible old SW.

Raw receipts/config/result are losslessly retained in
release-opening-lifecycle-raw-r2.json.gz. The summary retains archive hashes,
phase verdicts and three selected screenshot hashes. Candidate cold render was
inspected. Exploratory r1 also passed, but r2 exercises the final smoke command's
unique per-output stamps. Source gameplay is unchanged between them.

Repeat: set NODE_PATH to the host's bundled Playwright dependency directory;
run node scripts/release-lifecycle-smoke.cjs --candidate <exact-40-char-commit>
--shipped <exact-40-char-commit> --port <unused-loopback-port> --out <fresh-dir>.
Use scratch inside the common Git directory; keep its archived roots immutable.
The command refuses an existing output directory, creates unique test stamps,
closes its own browser/server and writes a failure file on error. For this run,
port8864 and .git/release-opening-lifecycle-r2 were used.

Limits: this is Edge touch emulation with a controlling installed SW cache,
not actual iOS Home Screen installation or Android lifecycle behavior. Update
discovery is explicitly invoked; this run does not claim foreground polling
timing or OS background suspension. The server uses no-store headers, so this
run proves old-worker CacheStorage upgrade, not a separate warm HTTP-cache stress
experiment. The historical warm-cache data regression remains covered by the
versioned-URL checks and prior retained experiment. No deployment/launch clearance.
