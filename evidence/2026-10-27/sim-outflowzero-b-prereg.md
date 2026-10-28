# sim-outflowzero-b prereg — zero-record outflow paths (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T0330Z,
axis food-economy, arm sim-outflowzero-b (second arm; arm 1
sim-onceaday-b already landed as bcf137c40, not re-judged here).
Base: master bcf137c40. Date the file lands: 2026-10-27 (local;
2026-10-28Z). Committed BEFORE any judged probe or capture change.

## Backlog item

sim-findings line 1283 (2026-10-27, sim-stockdoors-b): ZERO-RECORD
OUTFLOW PATHS STILL UNPROVEN — alien pantry raids, Light Fingers
lifts, event takes, bulk takes, child pantry eats recorded zero
events on all 20 stockdoors seeds. UPDATE (sim-driedhunt-b):
alien raids are CLOSED (driedhunt `_removePantryKcal` capture
explains raid loot to the kcal on 9738/9735/9825) and are NOT
re-judged here. This arm judges ONLY the four remaining paths:
(1) Light Fingers lifts, (2) event takes, (3) bulk takes,
(4) child pantry eats.

## Canon

docs/CANON.md read first. NO canon doc covers pantry ledger /
outflow accounting: the manifest's docs cover food ladder
(PRESERVATION.md), waves, contests, diseases, etc., but none
defines ledger doors, capture points, or outflow accounting.
Stated, not invented: the firing conditions below are read from
src/js code (file:line cited per path), not from canon.

## Instrument (reused, not rebuilt)

scripts/stockdoors-capture.js `installStockdoorsCapture` — already
wraps all four paths (snapshot-diff around the enclosing method):
`useAbility` tagged by key (`thief.steal_pantry`),
`_evTakePantryKcal` (`event-take`), `takeFromPantryBulk`
(`player-take-bulk`), `npcTakeAction`/`npcChildAction`
(`npc-child-pantry`, depth-guarded so a child eat records once).
The driedhunt wrapper requirement is satisfied by reuse, not by
a new wrapper: the same installer folds the driedhunt
`_removePantryKcal` door in as the `remove-pantry-kcal` direct
path (shared wrapper, subscriber list, one wrap per Game object —
see stockdoors-capture.js header). This arm therefore installs
the driedhunt capture before judging, via the folded door, and
asserts in the fixture script that no `remove-pantry-kcal`
record contaminates any fixture take (fixtures never call
`_removePantryKcal`). No src/js change is planned; if a capture
gap is found, the fix is limited to the capture scripts (new
files only — sibling capture files are NOT modified).

## Firing conditions (read from code, before any probe)

1. LIGHT FINGERS (`thief.steal_pantry`, src/js/abilityActions.js
   ~1708; data src/data/abilities.json: thief, context `camp`,
   cost time_min 10). Player must hold the thief ability
   (`hasAbility('thief')`), haven stores access must not be
   `none`, pantry must hold a positive-kcal stack, and the player
   must have carry room for >= 1 unit (lift = up to 2 units of
   the largest-total-kcal stack, weight-limited). Outcome is
   random 50% caught (-20 trust) / 50% clean — either outcome is
   a fire; the kcal moved is identical. Unscripted expectation:
   competent policy never calls `useAbility` for thief (policy
   grep: only `takeFromPantry` calls), so zero unscripted lifts
   are expected with a mechanism, not a mystery.
2. EVENT TAKES (`_evTakePantryKcal`, src/js/game.js ~25292).
   Player-initiated river-trader event responses:
   `feedRiverTrader` (needs 600 kcal, pantry first, pack second)
   requires `s.riverTrader` set with `day == current day`
   (set by `evRiverTrader`); `tradeRiverTrader` (price 250/350/
   400) requires the same. Whole units only: returned kcal >=
   asked, over-removal is honest, caller reports actuals.
   Unscripted expectation: competent policy never calls either
   response, so zero unscripted event takes are expected with
   a mechanism.
3. BULK TAKES (`takeFromPantryBulk`, src/js/game.js ~15857).
   Player UI slider action: `selections {idx: qty}`, haven
   stores access not `none`, weight-limited, indexes handled
   descending. Unscripted expectation: competent policy calls
   only single `takeFromPantry`, never bulk, so zero unscripted
   bulk takes are expected with a mechanism.
4. CHILD PANTRY EATS (`npcChildAction` hunger branch, src/js/
   game.js ~20878; dispatched via `npcTakeAction` ~20651 for
   `npcAge < 15`). Child's turn, fear <= 70, hunger > 60,
   pantry holds a kcal>0 stack: eats exactly 1 unit of the FIRST
   such stack, hunger -30, announces "<name> eats from the
   pantry." Stockdoors corpora show `npc-child-pantry` calls ==
   0 (not merely records == 0) and `nestedChildCalls == 0` on
   all 20 seeds — i.e. `npcTakeAction` was never even called
   for a child. The unscripted band must therefore carry a
   roster census (children in roster? in positions?) to say
   whether the non-firing is "no children exist" or "children
   exist but never reach the hunger branch". A zero with no
   census is NOT a counted explanation.

## Fixtures (scripted, one per path; new script scripts/test-outflowzero-b.js)

All fixtures run on seeds 9820 (reused substrate, stated) and
9850 (fresh), after setupGame, with the stockdoors capture
installed. Each fixture snapshots the pantry independently of
the capture (its own before/after pantry snapshot), then calls
the real game method, then compares. Fixture manipulations are
stated per path and touch only the fixture's own game state:

1. Light Fingers: grant thief by pushing `{id:'thief',...}` onto
   `scholar.abilities` (the shape `hasAbility` reads); seed the
   pantry with a known stack (or use opening stock, recorded);
   empty the player inventory to guarantee carry room; call
   `Game.useAbility('thief','steal_pantry')`; assert it returns
   true. Repeat until one fire per seed (a refused call — e.g.
   access `none` — does not count as a fire).
2. Event takes: call `Game.evRiverTrader()` to set the trader
   state for today, then `Game.feedRiverTrader()` (600 kcal);
   separately `Game.tradeRiverTrader('rope')` (250 kcal) on a
   fresh fixture state. Pantry seeded rich so pack fallback is
   zero; assert `fromPantry` covers the need (feed: narration
   + trust path; trade: goods received).
3. Bulk takes: call `Game.takeFromPantryBulk({idxA: 1, idxB: 1})`
   on two known pantry stacks with an emptied inventory;
   assert a non-null pack result.
4. Child eats: pick a roster villager; set age < 15 via
   `rosterChars[rid].age` (the record `npcAge` reads) if no
   roster child exists — the manipulation is recorded, and the
   unscripted census says whether it was needed; ensure the
   child has a position on the player's node; set
   `npcNeeds(rid)` hunger 80, fear 0, not sick; call
   `Game.npcChildAction` directly with the H helpers the branch
   needs (depth-0 call, so the capture records it as
   `npc-child-pantry`); assert the announce fired and hunger
   dropped.

## Unscripted band (shared baseline, no lever)

Policy competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off), horizon 100d
death-aware (dead villages stop +10d tail max — in practice the
sweep's runDays horizon), pilot seeds 9850–9857 (8 fresh seeds;
9850 doubles as a fixture seed, stated — fixture manipulation
never touches band runs, which are separate processes).
New sweep script scripts/sweep-outflowzero-b.js reuses the
stockdoors capture UNCHANGED plus a roster/child census after
setupGame (roster size, children by npcAge<15, children with
positions). Per-seed payload: directCounters (calls /
callsWithDecrease / records per path), directRecords for the
four paths, census, wall fields (rank, national, table/win,
waveReach, daysAlive, deaths + causes). No balance-panel
comparison exists (measurement only, no lever, no game-code
change): the standing panel exception applies — corpus is
census rows with no panel-ingest mode, stated explicitly, no
panel faked. The det-gate is the fixture's independent pantry
snapshot vs the capture record (identical seeds, capture on,
independent read).

## Pre-registered GO bar (binds the run; a miss is NO-GO)

A path counts as CLOSED only if ALL of (F1)–(F3) hold; otherwise
it is STILL UNPROVEN with the exact gap named. No re-scoring
mid-run, no dropping a leg, no "zero events = closed".

- (F1) SCRIPTED FIRE: the fixture fires (method returns
  success and the pantry decreases) on BOTH fixture seeds
  (9820, 9850).
- (F2) CAPTURE EXACTNESS: on both fixture seeds, the capture
  record for the path satisfies, with ZERO kcal tolerance
  (snapshot-diff is exact by construction; any mismatch is a
  capture failure, not rounding):
  * recorded totalKcal == fixture's independent pantry
    decrease, item by item (name, kcalEach, units);
  * Light Fingers / bulk: player inventory gain == recorded
    units and kcal;
  * event-take: recorded sum == retTaken AND retMismatch ==
    false, with retTaken >= asked (whole-unit over-removal);
  * child: exactly 1 unit of the first kcal>0 stack, hunger
    drop == 30.
- (F3) UNSCRIPTED ACCOUNT: on the 8-seed band, EITHER (a) the
  path records >= 1 event, OR (b) a COUNTED non-firing
  explanation: calls == 0 for the path AND a named mechanism
  verified in this run (policy-call grep for thief/bulk/
  trader; roster census for children). For the child path,
  (b) additionally requires the census: if children exist in
  roster+positions on the band yet calls == 0, (b) FAILS — the
  path stays STILL UNPROVEN and the run must say what would be
  needed (a band where a child turn reaches hunger > 60).
  A path with zero scripted fires is NOT closed, whatever the
  band shows.

CONFIRM RULE: a confirm band (12 fresh seeds, same policy and
instrument) is spent ONLY for a path that records >= 1
unscripted event in the pilot band (to check recurrence). If
all four paths are unscripted-zero with counted explanations,
no confirm is spent — there is nothing to confirm, and the
fixture closure stands alone. Confirm spend never overrides a
pilot verdict.

## Sense requirement

At least one recorded outflow event gets a transcript read:
the game's own words for the event, what it cost, whether the
narration matches the ledger (units/kcal). Fixture say lines
are captured for this; a mismatch between narration and ledger
is reported as a finding, not smoothed over.

## Wall numbers (reported, not judged)

National / table / wins, wave reach 1–5, median survival, and
death-cause shares for the 8-seed unscripted band, plus the
telemetry-deviation check against the scale-wall baseline
(loop-B body step 10) with any LOUD line investigated same-run.

## Metric review (section 14 — filled at report time)

To be filled in the evidence file: whether the bar worked as
written, any definition that proved wrong (proposed revision
for the NEXT run only), and the panel-exception statement.
