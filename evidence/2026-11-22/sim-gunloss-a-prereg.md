# sim-gunloss-a — PREREG (omar gun-loss TRACER, DIAG, instrument-only)

**Arm:** sim-gunloss-a · **Loop A run:** fleshout-20261122T1415Z
**Axis:** scale-onramp (converging, NOT converged) · **Type:** DIAG / instrument-only
**Question:** on seed 107369, omar_farouk held a searcaster + 2 cells;
between census days 133–134 the gun + cells vanished from his pack with
no recorded cause. Name the EXACT call that took them.
**Frozen corpus:** `evidence/2026-11-22/perseed-cellcheck-a-diag/`
(cellcheck-a, anchor `84dbeb8a6`), seed 107369 only.
**Base:** worktree `~/workspace/worktrees/sim-gunloss-a`, branch
`sim-gunloss-a`, rebased onto current master `d9d98bf8f` (Loop B
leaderhpgate-b merge) BEFORE any judged run. No src/js behavior change
in this arm: recorder wraps only, env-gated like the cellcheck driver.

## 0. What the frozen corpus already proves (read first)

- `sim-cellcheck-a.md` §4.3: omar granted searcaster + 2 cells day 103
  (contest pit prize, bundle +2); held gun + 2 cells 31 cell-days;
  departed day 128 on expedition (planWave4 false); away days 128–135;
  died day 136 "the wild" (player:true — died as the scholar).
- Census: day 133 searcaster equipped, 2 cells, away, exped false;
  day 134 ranged null, 0 cells, away. No grant, trade, corpse-take, or
  contest prize on days 130–140 accounts for it. No other villager
  gains a searcaster/cells days 133–136; scholar series 0 cells every
  day; pile 0. (Verified again from the frozen file in this prereg's
  preparation; see §6.)
- Daily scholar series: scholar is gen_e478zbq days 125–133,
  **omar_farouk days 134–135**, app_mgpspkqa957 day 136+. gen_e478zbq
  died day 134 "the arena" (player:true). So omar took the mantle on
  day 134 — the SAME day the gun vanished. Succession is the prime
  suspect BY TIMING, but the cellcheck refutation stands on the code
  as written: `mantleBecome` (villager-build.js) moves the successor's
  own `person.items`/`equipped`/`stashed` onto `scholar.*` (pool +
  worn-slot transfer, then wipes the villager record) — the gun + cells
  SHOULD have appeared in the scholar inventory. They did not.
- Omar killed anaconda_empress day 130 via agency (expedition) and his
  cells still read 2 on days 130–133, so no firing spent them.
  Day-134 fights: dustboar + callback killed BY gen_e478zbq (player),
  eulogy wave-4 — omar in none of them.

## 1. Code census — every path that can remove a searcaster / cells from a living holder's pack (this base)

Read before building the recorder. "Removes" = the item leaves
`person.items`/`equipped`/`stashed` or `scholar.inventory`/`equipped`
without arriving in another census-visible container.

| # | Path | File / function | Can it take the gun + 2 cells? |
|---|---|---|---|
| 1 | Succession transfer + villager wipe | villager-build.js `mantleBecome` (pool → `s.equipped`/`s.inventory`, then `person.items=[]; equipped={}; stashed=[]`); called from ledger.js `playerDeath` after the dead bearer's gear is packed on the corpse and `s.inventory=[]; s.equipped={}` | PRIME SUSPECT (day-134 timing). Transfer is designed to preserve; the recorder must show whether the pool held the gun at call time and where each piece landed — or whether the call threw mid-transfer (whole body is try/caught, returns false). |
| 2 | Death pack (dead bearer only) | ledger.js `playerDeath` (dead scholar's `s.inventory`/`s.equipped` → corpse via `registerDeath`; then empties both) | Cannot take omar's gear: it packs the DEAD bearer's gear, before the mantle. Wrapped to prove order (pack-then-mantle, not mantle-then-wipe). |
| 3 | Keepsake migration (post-mantle) | keepsakes.js `migrateKeepsakes` (runs immediately after `mantleBecome` in `playerDeath`; only `isKeepsake` items, `equipAccessory` on keepsake indices) | Cannot take gun/cells by its filter — but it runs in the same breath as the mantle, so it is wrapped to prove it. |
| 4 | Firing the gun (cells only) | fieldFights.js volley spend (~1090: ammo units decrement + splice at 0) via `fieldFight` | Cells only; gun stays equipped. Omar in no fight days 128–136 per frozen corpus. Wrapped to prove zero spend in the window. |
| 5 | Expedition return | villager-agency.js `expeditionReturn` (food/meat → pantry, deeds, trust — NO pack touch in code) | No removal in code. Wrapped to prove it. (Omar's exped flag went false day 132; return ran before the loss window.) |
| 6 | NPC death refusal — molt | godpath.js `npcDeathRefusal` → `shedNpcGear` (removes WORN gear from `person.items`, clears `person.equipped`) | Gun only (worn), NOT cells. Omar did not die day 134. Wrapped via `Scattering.Godpath.npcDeathRefusal` to prove non-fire. |
| 7 | Corpse pack move (betrayal-fight death) | party.js (~1476: dead villager's `vp.items` → corpse, `vp.items=[]`) | Only when a villager DIES in a betrayal fight. Omar alive day 134. Wrapped via the tripwire backstop (no named Game method to wrap cleanly). |
| 8 | Craft material takes | villager-build.js `villagerWeaponCraftDay`/`villagerAmmoCraftDay`, game.js pocket-ammo craft (~7995) | Materials only; take predicates exclude weapons/armor (`isMatEntry`, `isMat` weapon/armor exclusion). A searcaster/fusion_cell is never a recipe material. Wrapped (pocketAmmo/ammoCraftDay) to prove it. |
| 9 | Food spend | fieldFights.js `villagerSpendFood`/`villagerSpendSpoiledFood` (~432/455) | Food only (`kcalEach>0`). Cannot take gun/cells. Covered by the tripwire backstop. |
| 10 | Hostile-visitor steal | betrayal.js `hostileVisitorTick` (~4252: "take from pantry" — a line + `recordCrime`; NO item removal code) | No pack removal in code. Wrapped to prove it. |
| 11 | Trade / gift (villager pack) | No villager-pack trade/gift remover found in code: `alienLootGrant` ADDS; `_cxItemPrize` ADDS (+2 bundle); gift-armor is player→villager (ADDS); trader paths are scholar-UI. No `giveItem`/`takeItem` remover for a villager's pack exists in src/js. | Nothing to wrap by name — the tripwire backstop is what rules this family in or out. If the tripwire fires with a trade/gift stack, it names it. |
| 12 | Corpse-cap cull | corpses.js cap cull (only remover of a CORPSE from the world; vanishtile-a precedent) | Cannot take a LIVING holder's pack. Omar alive day 134. Not wrapped; ruled out by liveness. |
| 13 | Stash fetches | villager-build.js `vesselStashFetch`/`vesselArmorFetch` (stash → scholar inventory, bearer only) | ADD to scholar, never remove from a villager. Wrapped to prove it (they run for the bearer post-mantle). |
| 14 | Scholar equip/unequip | game.js `equip`/`unequip` (scholar inventory ↔ equipped) | Moves within scholar gear, never destroys. Wrapped: the policy bot plays the new scholar (omar) days 134–135. |
| 15 | autoEquip rebuild | equipment.js `autoEquip` (`v.equipped = equipped`, re-derived from `v.items`) | Re-derives equipped FROM items; cannot remove the gun from items. Wrapped to prove it. |

CANON: no canon doc covers pack-removal paths, trade, theft, or
succession gear transfer (CANON.md manifest checked: DISEASES, BEAR,
PRESERVATION, MONSTER-WAVES, CONTESTS, CONVERSATIONS, PARTY, SYSTEMS,
BALANCING, TIME-ECONOMY, KIN, MAP, FANS, ABILITY-REFUSALS,
ALIEN-PLAYERS — none covers this area). The governing text is code
comments: villager-build.js header ("the successor keeps THEIR OWN
gear"), ledger.js death-pack rule ("the body keeps what it carried").
Nothing is invented here; the recorder names what the code does.

## 2. Instrument (scripts/gunloss-driver-a.js + scripts/analyze-gunloss-a.js + scripts/test-gunloss-a.js)

Copy of the cellcheck driver (same substrate, policy, harness, output
shape for recorder-independent counters) + the GUNLOSS recorder:

- **Named wraps** (pre/post full gear snapshots of the target holder
  omar_farouk AND of `scholar.*`, every call, days 0–150):
  `mantleBecome`, `playerDeath`, `migrateKeepsakes`, `fieldFight`,
  `expeditionMonster`, `expeditionReturn`, `npcDeathRefusal`
  (`Scattering.Godpath`), `autoEquip` (`Scattering.equipment`),
  `equip`, `unequip`, `hostileVisitorTick`, `villagerPocketAmmo`,
  `villagerAmmoCraftDay`, `registerDeath`. Each wrap records day,
  function, file (from stack), and the gear delta (searcaster in
  items/equipped/stashed? cells in items/stashed? scholar gun/cells?).
  All wraps are pure reads + driver-local writes; every game function
  runs exactly once, untouched. No src/js change.
- **Splice tripwire (backstop):** while the recorder is on,
  `Array.prototype.splice` is patched (original restored after the
  run): any splice on an array holding a searcaster/fusion_cell entry
  records day + stack + before/after counts. Catches every in-place
  removal whatever named it — including paths §1 rows 7/9/11 that have
  no clean Game method to wrap. Pure logging; no RNG; no state writes.
- **Reassignment watch (backstop):** `Object.defineProperty` setters
  on omar's person record (`items`/`equipped`/`stashed`, stable object
  via `getPerson` on `data.villagers`) and on `state.scholar`
  (`inventory`/`equipped`), logging reference changes with stack.
  Catches `person.items = []` (mantle wipe), `s.inventory = []`
  (death pack), `shedNpcGear`'s flatMap reassignment, and any other
  whole-array replacement. Re-asserted daily (a replaced record
  re-gets its watch). Same-array no-op assignments are not logged.
- **Daily gun census:** every day, omar's full gear (item ids +
  units in items, equipped slots, stashed) + scholar inventory/equipped
  gun+cell counts + scholarId. Brackets the loss to the day and shows
  the destination (or its absence) the morning after.
- **Window:** full run days 0–150 (death-aware; frozen corpus ran
  145d, village lost). The judged window is days 128–136; the full run
  exists so the loss is reached by the same deterministic path as the
  frozen corpus, not by a staged shortcut.
- **Substrate (identical to cellcheck-a):** `VETREENGAGE=1
  PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1
  SPEARGATE=1 GUNRATE=1 CELLGATE=1`; KILLBUNDLE unset; competent
  verbatim policy; seed 107369 only.
- **src/js drift since the frozen corpus:** between the cellcheck base
  (bda6ff495) and this base (d9d98bf8f), src/js changed in exactly two
  places: convo-beats.js grief-bridge pool 2→6 lines (data-only; the
  pick cycle may draw RNG, so a grief-bridge pick before day 134 could
  in principle shift the stream) and villager-agency.js LEADERHPGATE
  block (env-gated, OFF under this substrate — byte-identical when
  off, no RNG drawn). Reproduction (§4 bar 2) is the check that
  decides whether the drift mattered.

## 3. Proof test (scripts/test-gunloss-a.js, BEFORE any judged run)

- Tripwire catches a staged pack removal: give a test holder a
  searcaster + 2 cells, remove via a named helper's direct splice;
  assert exactly 1 tripwire event naming that helper + file in stack.
- Reassignment watch catches `person.items = []` with a stack naming
  the stager.
- Mantle transfer preserves gear live: stage a holder with searcaster
  equipped + 2 cells, call `Game.mantleBecome` (current scholar →
  holder); assert the gun lands in `scholar.equipped.ranged` and the
  cells in `scholar.inventory`, and the villager record is wiped.
  (If the live transfer does NOT preserve, that IS the finding — the
  test asserts what the code claims; a failure names the transfer bug
  and the arm re-scopes to it.)
- Neutrality: installing + uninstalling the recorder restores
  `Game` methods and `Array.prototype.splice` to the originals
  (identity checks); a recorder-off run produces no gunloss rows.
- Analyzer selftest: fixtures for single-call attribution, multi-call
  (two candidate removals same day → NOT single → UNATTRIBUTED with
  gap), no-event (→ UNATTRIBUTED), and reproduction-mismatch fixtures.

## 4. Frozen bars

| # | Bar | Threshold | How judged |
|---|---|---|---|
| 1 | Instrument validity | proof test green; analyzer `--selftest` green; 0 instrument errors on the judged run | test + selftest output; `instrumentErrors` empty |
| 2 | Reproduction | the re-run reproduces the frozen corpus on seed 107369: omar census rows days 103–134 identical (rangedId/cells/away/exped per day), scholarId series days 125–136 identical, scholar cells 0 every day, deaths days 130–136 identical | analyzer diffs the new corpus against `perseed-cellcheck-a-diag/cellcheck-a-s107369-cellcheck-a-diag.json`; any mismatch is listed. If reproduction FAILS, the verdict is REPRODUCTION-FAILED and the arm re-scopes to a live single-seed re-run of 107369 only (fresh run, same substrate) — no frozen rows are invented or edited. |
| 3 | Attribution | the day-134 loss names a SINGLE call path (file + function + day), with the gear delta (gun + cells, before → after) shown at that call | analyzer joins tripwire/watch/wrap events in the loss window (first event where omar's gear loses the searcaster or the cells hit 0). If no single call accounts for BOTH the gun and the 2 cells, the verdict is UNATTRIBUTED with the exact gap named (which piece, which container, which calls were seen). Never fake an attribution. |
| 4 | Det-gate | recorder-on vs recorder-off identical on recorder-independent counters (days, survived, maxWave, standing, deaths, killCalls, fights, casts, spawns, daily) on seed 107369 | two legs (GUNLOSS on/off), same seed/substrate; analyzer diffs. (Per cellcheck-a §8, recorder-owned rows are excluded from the comparison by construction.) |
| 5 | Wall numbers | wins / national / table / wave 4–5 unlocks / median survival for the re-run window reported | evidence §5 (single-seed re-run: reported as a window, not a band verdict) |

**GO = bars 1–4 pass AND bar 3 names a single call (ATTRIBUTED) → DIAG-GO.**
If bar 3 is UNATTRIBUTED with the gap named, the verdict is
DIAG-GO-UNATTRIBUTED (instrument valid, question answered honestly).
If bar 2 fails, verdict is REPRODUCTION-FAILED (no attribution judged).

## 5. Runs (order frozen)

1. Prereg commit (this file) — BEFORE any judged re-run.
2. Instrument commit (driver + analyzer + proof test) — anchor recorded
   in the judged corpus.
3. Proof test green + analyzer selftest green (pre-flight, not judged).
4. Det-gate: seed 107369, recorder on vs off (2 legs).
5. Judged re-run: seed 107369, recorder on, full 150d death-aware.
6. Analysis: `node scripts/analyze-gunloss-a.js --dir
   evidence/2026-11-22/perseed-gunloss-a-diag --frozen
   evidence/2026-11-22/perseed-cellcheck-a-diag/cellcheck-a-s107369-cellcheck-a-diag.json
   --out evidence/2026-11-22/gunloss-a-analysis.json`.
7. Evidence file `evidence/2026-11-22/sim-gunloss-a.md` with a
   "metric review" section; report wall numbers for the re-run window.
   SENSE-TESTING LAW: read transcripts around the loss (days 133–136
   say lines / fight logs); judge meaning, not just counts.

## 6. Frozen-corpus re-verification (done during prereg preparation, read-only)

From `perseed-cellcheck-a-diag/cellcheck-a-s107369-cellcheck-a-diag.json`
(anchor `84dbeb8a6`, recorderOn true, days 145, gameDays 145):
omar census days 125–133 gun + 2 cells (away from 128, exped 128–131,
exped false 132–133); day 134–135 ranged null, 0 cells, away.
Scholar: gen_e478zbq → omar_farouk on day 134 → app_mgpspkqa957 day
136. Scholar cells 0 all days 128–140; pile 0. Deaths 130–136:
anaconda_empress (expedition, day 130, killed BY omar via agency),
warranty_caller + hushwolf (expedition, day 131), visjoin_128 +
somchai_prasert + app_mgpsphtj838 (monster, 131/133),
dustboar + callback (combat, day 134, killed BY gen_e478zbq via
player), gen_e478zbq (arena, day 134, player:true), suburb (combat,
day 136), omar_farouk (the wild, day 136, player:true). Grants days
128–136: scar_tissue_wraps (128, scholar), harvest_scythe (134,
gen_aodls5u), menders_apron (136, scholar) — none is a gun/cell.
mantle_become tele count: 8 on the seed. No `fights` row names omar
days 128–136.
