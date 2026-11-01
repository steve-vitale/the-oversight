# Local search controller experiment

This is a simulation-method experiment on one unchanged Game. It adds
grid-capable-search, grid-maker-search, grid-merchant-search and
grid-caregiver-search. The existing eight stock/grid policies are unchanged;
none of the new profiles is promoted as a default or pacifist benchmark.

Before each existing upkeep routine, the experimental layer may search one
local body. It scans the same9x9 corpse cells as the renderer. Distant bodies
covered by a person, animal or monster sprite are excluded. Nearby bodies are
disclosed by the actual contextual Search strip. Targets are sorted by distance,
cell and ID; cargo, prices and remote death coordinates cannot select a target.
Knowing a death does not grant a location. It makes no off-node recovery trip.

If already adjacent, open/search is free until the existing native action charges
apply. Otherwise choose the same shortest adjacent cell/order as walkCloser;
a human can tap that visible square, then contextual Search. A direct tap on
the body itself walks onto its cell; the experiment does not claim that body
tapping automatically approaches it or opens a reader.

All actual movement uses beginPathWalk/pathStep. There is an experimental8-step
approach budget and3 per-item attempts per session, at most one begun session on
a given body per bearer/day. Failed path/budget planning can be checked again;
it does not begin a session. These are controller choices, not Game restrictions.
Contents are read only after the body remains canonical and in native range.
Human meat and deliberately left items are skipped. Native weight refusals,
trauma/disease, first-touch time, deterioration and NPC/ambient actions remain.
Transfers do not imply retained/equipped/useful gear or nourishment.

Stop the controller batch if the actor/state/run/day/room/node changes, an
encounter starts, the bearer dies or a landed step displaces the actor. Do not
then run the old actor's base upkeep. Busy-at-entry retains the original upkeep
behavior; the search layer does not replace encounter handling. Receipts retain
bounded256 entries per campaign and full counters, with any dropped count.

Repeat the prospective matched screen and separately identified extended cases:

```
node scripts/garden-longplay-audit.js --root . --policies grid-capable,grid-maker,grid-merchant,grid-caregiver,grid-capable-search,grid-maker-search,grid-merchant-search,grid-caregiver-search --days 600 --par 2 --out evidence/<date>/<fresh-prefix>
node scripts/summarize-local-search.js evidence/<date>/<fresh-prefix>.json.gz evidence/<date>/<fresh-summary>
```

The shared driver's name is historical; it retains the same current balanced
observer and food/NPC sidecars for every arm. Each arm gets screen seeds1–16
and extended seeds10003/10004, with one real off control. All144 observed
campaigns run to native endings within the600-iteration allowance or remain
explicit caps. Recovery/watchdog routes are never disguised as natural losses.
All23 are compared separately per policy with the current scorecard. The two
extended cases are not a64-seed confirmation holdout. Win changes in either
direction require investigation; extra loot/more wins cannot cancel warnings.

After policy/registry changes, collect a fresh source-bound neutral panel and
refresh balance-proof.json with the updater. The current twelve-cohort neutral
proof includes all eight unchanged originals and all four experiments. Never
compare a different policy/harness revision as if only Game balance changed.

Checks: scripts/godpath/test-local-search.js (native methods, guards, full-state
direct reference and exact phone fixture) and test-local-search-report.js
(all23, matched/extended separation, omitted/control/source rejection).
Actual phone recipe and failures are described in MOBILE-PLAYTEST.md and the
dated local-search-audit-r1. Read loaded-byte receipts; node tests alone do not
prove touch, scroll, saved bytes or Continue. No numerical calibration is cleared.
