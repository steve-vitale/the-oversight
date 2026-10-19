# Settings Done: title and expedition phone verification

Steve reported that Done did not close Settings. Reproduced on the actual title
screen at 390x736: the overlay existed, Done had no onclick handler, and tapping
it left the overlay open. openSettings read Game.dpadSide before wiring Done;
that method reads state.settings, but there is no expedition state on the title.
The title opener swallowed the exception. This also prevented later audio wiring.
The existing Settings test always supplied a successful dpadSide stub and missed
this state boundary. Node simulations exclude app.js and cannot cover this UI.

Wire Done/backdrop immediately after mounting. Guard the expedition-only pad
selector when no run exists. Keep title audio controls usable. The current
expedition still permits changing the pad and refreshing the board. No gameplay,
reward, difficulty, save format or simulation policy change.

Native touch browser replays at 390x736 and 390x844 each prove title Done closes,
volume persists across reopening, expedition Done closes after changing pad,
placement persists, ticks/kcal do not change, and Menu closes back to the board.
No page errors. The title page itself remains taller than one viewport; this
change does not claim that separate layout issue is resolved. Expedition layout
stays one viewport. Shared 16-stage field/Deer replays bind all 162 boot inputs
at both sizes. CDP reported some duplicate response-body retrieval failures,
but each required input was captured and checked against current source; no
missing input is replaced with a disk hash. These are local browser proofs,
not physical iOS/Android or installed-service-worker clearance.

Observer-neutral maintenance retains four one-day profiles, seed7, observed/off
in eight separate jobs with249 normalized source blobs. This only refreshes the
current-input contract; it makes no balance or natural viability claim. The
first maintenance attempt lacked Git Bash on PATH and failed before simulation;
it is retained separately. Initial quick checks correctly rejected stale proof
manifests; the refreshed quick run passed257/0. Full result follows in the log.

Shared candidate and live production remain distinct. See RELEASE-CANDIDATE.md;
there is no new hosted-preview or production claim for this fix.

Final checks: quick257/0 (54s), full1029/0 (210s). Existing foreign
sweep-B.log content hash is unchanged; it is excluded from this commit.
