# Break-it: persistence (save/load) — run 11, 2026-10-11

Target 8. No dedicated save/load persistence canon doc exists (docs/STORAGE.md
is about ITEM STORAGE — stashes/caches — not save/load; noted per the standing
rule, worked from docs/CANON.md + code). Prior ten passes hardened the save
engine; this run attacked the FRESH surface from the five commits landed
within ~24h: survivalist r7 (a7f6b5ee), socialite rebuild (d39d6473),
contests r15 (2937b425), camps alien burn (74d7ebc7), counters r16 (dc2386ba).

## Attacks attempted (all four classes)

- **EXPLOIT / counter firstStrike re-arm** → **K1 (kill, below)**. Mid-fight
  save+load reset `_counterStrikes` on the fight object → union_rep's
  `strike_first` ("first blood on the rep") counter became discoverable
  WITHOUT actual first blood. Save-scum discovery of a knowledge gate.
- **EXPLOIT / contest bet double-pay**: bet deduct (`s.kcal -= amt`) and
  `ac.bet = {amount}` are adjacent synchronous statements (contests.js:3793);
  the payout runs inside the synchronous `_contestVerdict`, which nulls
  `state.activeContest` at its end. `ac.bet` rides the blob; the `!ac.bet`
  placement gate reads it live. No window, no double stake, no double payout.
  HELD (proven: bet round-trips, re-bet refused, 48/48).
- **EXPLOIT / trauma double-apply**: `s.trauma` is a plain persisted number;
  all r15 applications (+4 win / +6 lose in `_contestEnd`, +12 in
  `_contestDie` behind `_dieLanded`) run in synchronous end paths. Save
  mid-path is impossible (single-threaded); the flags ride the blob. A live
  re-entrant `_contestDie` on a loaded ac early-returns with zero trauma
  delta. HELD.
- **EXPLOIT / fire-fuel / water duplication**: the burn purge splices
  `state.fires` synchronously inside the burn loop (no save window);
  `drinkWater` splices the bottle BEFORE the tick/grant (fail-safe order).
  Purged fires stay purged across load; `playerFireAt` (derived, with
  sweepDeadFires) agrees — no phantom "Feed the fire". Bottles round-trip;
  post-load drink consumes clean-first and hydrates honestly. HELD.
- **EXPLOIT / repay-seed farming**: the socialite rebuild's seed chain
  (plant in `convoResolveWant`, consume in `convoOpening`) is fully
  synchronous — plant/consume can never straddle a save. Seeds persist by
  design (7-day expiry) and consume-once (delete is synchronous with
  resolve). The `repay` want is fiction-only: no items/trust/kcal payload
  to duplicate. HELD.
- **SOFTLOCK / mid-conversation load**: `state.village.conv[vid]` persists
  `active=true`, so this was a real historical softlock — closed by the r9
  STALE CONVERSATIONS settle (load() runs substantive convos through
  `endConvo('left')`, quietly clears 0-exchange ones). The rebuild's new
  winddown fields (`windingDown/winddownQueued/winddownSpurns/heldBeats`)
  are never read by `endConvo` — a mid-winddown save settles cleanly, no
  throw, never stranded active. The winddown forced-end itself is
  synchronous (`endConvo(vid,'natural')` inline). HELD (proven).
- **SOFTLOCK / mid-show / mid-contest load**: `state.activeContest` rides
  the blob whole — phase, bet, cheer, and all r15 idempotency flags
  (`_showEnded/_showVillagerEnded/_dieLanded/_prizeGranted`; underscore keys
  survive JSON — the only field filter in the pipeline is the fighter
  snapshot's mdef/function drop). A live `_showEnd` on a loaded ac lands,
  sets the flag, and re-entry early-returns. HELD.
- **SOFTLOCK / drone chain post-load**: `_counterLastMoveRound/Dir` reset
  made review_drone's `vary` gate unqualifiable for the rest of the fight —
  the trick performed but silently never counted (honesty, strict
  direction). Fixed with K1.
- **HONESTY / creek Drink after load**: r7's `drinkFromCell` writes NO cell
  state (the creek is infinite by design) and never touches bottles —
  verified post-load: bottles untouched, +50 hydration. The pack Drink
  button (`doAction('drink')` → `drinkWater`) reads `scholar.water` live.
  HELD.
- **HONESTY / loaded conversation copy vs state**: the settle path prints
  the honest "(You closed the game mid-conversation…)" line; no winddown
  beat leaks into the transcript. HELD by inspection.
- **DEAD CODE / fresh-surface key pairing**: every new key is read —
  `c.pastDeflected` (conversation.js:1929, journal.js:1087),
  `c.heldAsk` (winddown gate), `c.winddown*` (convoMaybeWinddown),
  `ac._showEnded/_showVillagerEnded/_dieLanded` (guards),
  `f._counterLastMoveDir` (27206), `_counterStrikes` (27815),
  `_counterLastMoveRound` (27205). tbfight save payload carries exactly
  the known 25-field list, no strays. No dead keys.

## Kills (1)

### K1. Counter fight-object gates dropped by the save boundary (EXPLOIT/HONESTY — medium)
`syncRun`'s tbSave and `load()`'s restore enumerate fight fields explicitly.
The r6 sweep (2026-10-09) covered beamCooldown/shouts/humStacks/… but the
counter engine (2026-10-10) postdates it, and r16 added
`_counterLastMoveDir` without touching the boundary. A mid-fight save+load
silently reset three per-fight gates:
- `_counterStrikes` → `firstStrike` re-armed → union_rep's `strike_first`
  counter ("Kill the rep first — first blood on the rep, every time")
  discovered WITHOUT first blood. Demonstrated pre-fix: strike another
  monster, save, load, strike the rep → discovered.
- `_counterLastMoveRound/_counterLastMoveDir` → review_drone's `move_x2`
  `vary` chain could never qualify post-load (the `=== round-1` check
  fails on undefined; `_dirVaries` needs the stored dir). The trick became
  silently undiscoverable that fight.
Fix (`src/js/game.js`): persist all three in tbSave
(`counterStrikes`, `counterLastMoveRound` keeping its null/number
distinction — a 0 would read as "moved in round 1" to the `=== round-1`
check, `counterLastMoveDir`) and restore verbatim in `load()` (pre-gate
saves restore `_counterLastMoveRound` as undefined = never moved, matching
the old in-memory shape). Same save-scum-gate class as r6; ontology ledger
extended (`fight_gate_counter_sweep`), ONTOLOGY.md regenerated (63/63).
Proof: `scripts/test-persist-r11-20261011.js` — BEFORE=1 on unfixed code:
3 DEMO checks pass (vulnerability demonstrated); AFTER: 48/48 × 3 seeds.
Sibling sweep: fighter-level counter state was already safe — understudy
`usSeen` and target `_counterDischarged` ride the fighter JSON snapshot
(verified round-trip in the same proof); `state.monsterCounters`
(discovery ledger) is plain state. `tbfight._fresh` (narration cycling) is
cosmetic, not a gate — left unpersisted deliberately.

## Held — real attacks that resisted (and why)
- Contest bet/idempotency/trauma: all r15 state lives on
  `state.activeContest` (plain JSON, no stripping) or `scholar.trauma`
  (plain number); every grant/end path is synchronous with the flag set
  before-or-with the effect. The load boundary can only ever see a
  fully-landed or never-started end path.
- Camps burn purge: synchronous splice inside the burn loop — there is no
  "between burn and purge" for a save to land in. Post-purge state
  round-trips honestly (derived `playerFireAt` agrees).
- Socialite seeds/repay/winddown: plant/consume/delete are synchronous;
  seeds persist by design with expiry; repay is fiction-only; winddown end
  is synchronous; the r9 stale-convo settle is unaffected by the new
  winddown fields.
- Survivalist r7: no new persisted keys; the cell drink writes no cell
  state; bottles are plain state with fail-safe splice-before-grant order.

## Regression
- New `scripts/test-persist-r11-20261011.js`: 48/48 × 3 seeds
  (SEED=1234567, 7, 424242); BEFORE=1 demo green on unfixed code.
- `test-break-counters-20261011.js`: 47/47 (touched game.js counter paths).
- `test-structural-counters-20261011.js`: 52/52.
- `test-persist-alien-r10.js`: 23/23 (touched syncRun/load).
- Ontology: 63/63 validated, ONTOLOGY.md regenerated.

## Files
- `scripts/test-persist-r11-20261011.js` — proof probe (48 checks, BEFORE=1 demo mode).
- `src/js/game.js` — tbSave: +3 counter gate fields; load(): verbatim restore; ontology header: `fight_gate_counter_sweep`.
- `docs/ONTOLOGY.md` — regenerated (+1 line).
- `evidence/2026-10-11/break-persistence-11.md` — this file.
