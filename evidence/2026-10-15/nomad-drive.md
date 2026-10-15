# nomad-drive — road driver + UI for The Long Way Home (2026-10-15)

## What was built
`src/js/nomad-drive.js` (new, `Game.nomadDrive`), loaded after nomad-scenes.js.
Closes the last mile of the nomad ending: the engine existed (leave gating,
party, legs, upkeep, trails, reunions, ending scenes) but nothing drove it —
no itinerary, no reunion trigger, no fate determination, no UI to leave/settle,
and `playEnding` had no callers.

- **Departure planning**: wraps `nomad.start()` — one leg per living scattered
  kin whose region is known. `syncItinerary()` runs in the daily tick so newly
  sharpened trails join mid-road.
- **Reunion trigger**: `maybeReunion()` fires one reunion per leg per day after
  3+ days living there. Never a prompt.
- **Fates**: `fateFor(name, moves)` = FNV hash of kinName + worldSeed + moves,
  alive .5 / changed .2 / dead .15 / moved .15; 'moved' excluded after 2 moves.
- **Outcomes**: 'joined' → companion (`kin:` id in `road.companions`, eats/dies
  like anyone, never bears the Codex); 'grave'/'choice' → recorded;
  'trail-continues' → `moveKinOn` relocates the kin to a new deterministic
  region (never the leg's, never the landing), trail resets to vague.
- **Multi-kin legs**: `addLeg` now appends to a pending leg for the same region
  (`leg.kinNames[]`) instead of refusing — with 6 playable regions, kin sharing
  a region is common. Reunions resolve across successive days.
- **All-found**: `checkAllFound()` closes the road 'all-found' when every
  scattered kin resolves alive/changed/dead. Kin whose region is never learned
  don't block it — settling is always available.
- **Run closure** (ported from the parent's uncommitted main-tree edit, which
  this branch now carries): `endRoad` plays the ending scene, sets
  over/won, records the legend. Wiped = loss; settled/all-found = won.
- **Bearer death on the road**: `Game.playerDeath` wrapped (guarded, wrap-once;
  ledger.js untouched per brief) → routes through `nomadKill`. Mantle stays in
  the party. If no villagers remain but companions do, the kin settle where
  they stand ('settled'); empty party → 'wiped'.
- **UI**: Haven lodge tap → 'Leave the village' (knowledge-gated, only renders
  when `canLeave().ok`); two-tap confirm with honest cost. Lower menu on the
  road: '🚶 Move on' (depart + enter next pending + travel beat) and
  '🏠 Settle' (two-tap → `endRoad('settled')`). Map button rests on the road;
  the itinerary is the map now. 8→7 flex buttons; labels short for 390px.

## Proofs (seeded node harness, full script list minus DOM-only)
- `test-nomaddrive-driver.js` 21/21: itinerary planning, fate determinism +
  weights, moved excluded after 2, reunion timing (none before day 3, fires day 3),
  moved-on relocation + trail reset, itinerary sync, all-found → over/won.
- `test-nomaddrive-ui.js` 13/13 + 4/4 death-routing: gating (no option
  pre-global / without known kin; appears when eligible), leave two-tap,
  move-on walks the itinerary, settle two-tap → over/won, bearer death →
  mantle inside party, road continues.
- RED: driver test fails to load with nomad-drive.js removed (module absent).
- Regression: all 11 nomad suites green (core 4, wild 4, scenes 3, integration),
  ontology 111/111 → now includes nomad-drive.

## Fixes to landed code (in this branch)
- `nomad.js`: `addLeg` appends kin to a shared regional leg; `vname`
  resolves companions; `nomadKill` passes the Codex only to real villagers;
  `endRoad` plays the ending + closes the run (ported from parent's
  uncommitted edit so the branch carries it).
- `nomad-wild.js`: `travelEvent`'s stranger now sharpens with source
  'survivor' (was undefined → 'bad-source', silently dropped).
- `test-nomad-legs-20261015.js`: locates test legs by region (itinerary
  pre-plans); duplicate-region assertion updated to shared-leg behavior.
- `test-nomad-integration-20261015.js`: found-kin assertion relaxed to >= 1
  (the driver auto-resolves before the manual mark).

## Known deferrals (not in this stream)
- 'changed' reunion choices (ask/leave/fight) have no choice UI yet — the
  scene narrates the situation honestly and the road default is to walk on.
  A choice sheet is a clean follow-up.
- Party members' own scattered kin don't get legs (itinerary is player-kin
  only); their found kin appear in the epilogue per spec but the reunions
  aren't driven yet.
- The lower-menu road buttons were syntax-checked (`node --check`) but not
  rendered — app.js is DOM-only, excluded from the node harness. Needs eyes
  on a phone ([needs-eyes]).

## Lane
Untouched: godpaths.json, table-endings.json, scripts/godpath/, godpath.js,
godhood.js. No push/bump/verify-live.
