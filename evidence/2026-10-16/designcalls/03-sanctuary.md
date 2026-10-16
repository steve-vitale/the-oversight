# Design call #3 — SANCTUARY SEMANTICS (2026-10-16)

Design call (Steve-approved): **Haven is sanctuary.** A monster/killer that was
waiting for a dead bearer must not re-engage the successor through the fire.
The killer waits at the treeline instead.

## Root cause

Three code facts combine into the bug:

1. **The door-flee stash is bearer-agnostic.** `tbPlayerMove`'s door-flee branch
   (src/js/game.js, ~L31753–31776) stashes live monsters in
   `state.doorFledMonsters` as `{id, mx, my, hp}` — no record of WHO fled.
   ("MONSTERS WAIT", Steve 2026-10-05: "if you fled through a door, they're
   still out here. They didn't leave. Going back out re-engages.")
2. **The re-engage is unconditional.** `exitBuilding()` (src/js/game.js,
   ~L10623–10658) re-engages the stash via `startCombat(first.id)` for
   WHOEVER exits the hall — including a successor who never fought it. The
   fight spawns on Haven grounds, by the fire. (`startCombat` even fires the
   'breach' crisis here — "the safe place isn't.")
3. **Death never clears or re-tags the stash.** `playerDeath()` (src/js/ledger.js,
   ~L622+) clears the sibling `pendingEncounter`/`pendingMonsterId` in its
   "DEATH ENDS THE CAMP" block ("no pending breach follows them to Haven")
   but never touches `state.doorFledMonsters`.

Result: bearer A flees a monster through the hall door → stash set → A dies
(any death: starvation in the hall, a later fight, the pit trap) → the mantle
passes, successor B wakes inside the hall → B steps out → "⚠️ They're still
here. Waiting." → A's killer re-engages B at Haven, through the fire.

This is the ONLY hostile-re-engagement path at Haven: `checkEncounter` refuses
safe tiles ("Safe in villages. Don't even roll."), the barrier-chase path ends
at the walls ("HAVEN IS SAFE (design): the chase ends at the walls — even the
relentless will not follow you through Haven's gate"), and world-monster
followers hold at the boundary ("It stops at the treeline — pacing, unwilling.
The walls end the argument."). The door-flee stash was the hole.

## The call

Sanctuary: Haven is unbreakable. The dead bearer's killer does NOT vanish
(Steve 2026-10-05 "monsters wait" stands) — it falls back to the treeline,
outside the walls, and holds there. It meets the new bearer when they leave
Haven, never at the hall door. The living bearer's own stash behavior is
untouched (same bearer exits → same re-engage, wounds honored per r6/r7).

## What changed (src/js/game.js, src/js/ledger.js)

1. **Stash write tags the bearer** (game.js, door-flee branch): entries are now
   `{id, mx, my, hp, bearer: this.villagerId}`.
2. **`exitBuilding()` partitions the stash**: entries tagged with the current
   bearer (or untagged legacy saves) re-engage as before via the factored
   `reengageWaitingMonsters()` helper (startCombat + the r6/r7 HP-claim,
   byte-identical logic). A dead bearer's entries stay stashed — no hostile
   re-engagement inside Haven.
3. **`playerDeath()` names the treeline wait** (ledger.js, "DEATH ENDS THE CAMP"
   block): legacy untagged entries are backfilled with the dead bearer's id,
   and one honest line is said — the killer paces the treeline beyond the
   walls, waiting for a dead bearer; it doesn't come in.
4. **Treeline ambush on leaving Haven** (game.js, `travelTo` + new
   `treelineAmbush()`): when the new bearer departs the haven node for a
   non-safe tile, with no live fight and no pending encounter, the dead
   bearer's stash re-engages at the treeline — same startCombat + wound
   claim. Departing onto another safe tile, or mid-combat crossings, leave it
   holding.

## Proof

scripts/test-sanctuary-20261016.js (seed 20261016, sim-harness: seeded RNG
before eval, full src/js list in index.html order minus DOM-only, real
Game.save). Two scenarios, same assertions both runs:

- Scenario 1 (living bearer — sanctioned MONSTERS WAIT, must not change):
  A door-flees (stash tagged A), exits the hall → killer re-engages A at the
  door, wounds honored (hp 37), stash consumed, "still here. Waiting." said.
- Scenario 2 (successor — the design call): A door-flees (stash in the OLD
  untagged shape, exactly the pre-fix write path) → A dies → B wakes in the
  hall → B exits: no combat, stash held → B travels haven→wild: the hushwolf
  re-engages OUTSIDE Haven, wounds honored (hp 37), stash consumed, treeline
  narrated at death and at the ambush.

RED (pre-fix, via patch-file revert): exit 1 — 19 pass, 4 fail. The failures
are exactly the design call: "NO hostile re-engagement at Haven — tbfight
live=true", "stash held, not consumed at the door — stash=null", "the fight
is NOT at Haven — at=(4,4) haven=(4,4)", no treeline line at death. Scenario 1
passes on old code too, proving only the successor path changed.

GREEN (fixed): exit 0 — 23/23 pass, both scenarios.

Regression: scripts/check.js --quick — 95 passed, 2 failed (567s). Both failures
verified byte-identical on pristine HEAD (patch-revert A/B): 
scripts/test-sprites-valid-20261014.js (cliffhanger calm==aggro sprite asset,
1556 passed / 216 failed both ways) and
scripts/test-table-trial-fire-20261012.js (Game.tableTrialResume is not a
function — sibling in-flight table work; exit 2 both ways). Pre-existing,
unrelated; this change introduces no new failures.

## Metric review

No pre-registered metric for this run; the bar is the design call itself:
no hostile re-engagement of a successor at Haven (RED→GREEN), living-bearer
door-flee behavior unchanged (regression: check.js --quick).
