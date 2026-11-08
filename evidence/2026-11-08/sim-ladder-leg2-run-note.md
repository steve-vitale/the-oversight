# Leg 2 run note — Standing ladder: seat surgery + feast bundle

- Prereg: `evidence/2026-11-08/sim-ladder-leg2-prereg.md` (bars L2-1–L2-8, all binding)
- Base: master `32c47d41eb9832e08b5c8050ce0d1ff29e42591d` (leg 1 on master);
  rebased onto master `246ce6dc22f13181c0167c861b4caae403192a9f` (sim-binddiag-b
  landing, 10 commits past the base), then onto master
  `d229b58f595430e2a24c399820061b39c5b689ca` (batch ship version bump, 4
  commits past that — evidence-only + the version bump) before merging.
  Each rebase struck the documented stop-at-pick quirk once (the pick
  appearing in both done and todo; verified unapplied with `git diff
  <pick>` + clean tree, then `git rebase --continue` sailed through the
  remaining picks). The branch diff is content-identical across both
  rebases (only hunk line numbers moved). Post-rebase proof suites re-run
  green (see below); the neutral proof was refreshed after each rebase
  (see below).
- Branch: `build-ladder-leg2` (worktree `~/workspace/worktrees/build-ladder-leg2`)
- Builder: leg-2 attempt #2 (attempt #1 died at startup 2026-11-08 09:27Z, produced nothing)

## What was built

### progression.js — foodDeeds is sentimentTaught alone (brief §b.4)
- `deedGateReady()`: `foodDeeds` is now `!!pg.sentimentTaught`. `feastSurgeUsed`
  is dropped from the full seat. Every other bar untouched (waves 5/5/4/3/2,
  contests ≥ 3, crises ≥ 3, national/global scale, integration stage ≥ 2).
- `checkArc` reactor + seat-waiting miss lists now say "the food-thesis deed
  (the keepsake lesson, not yet taught)" (singular) and name the ladder when
  the village never reached Village Standing.
- Consequence: a pellet bearer who has been taught the keepsake lesson is no
  longer blocked on food deeds — the pellet no longer blocks the seat that way.

### table.js — seat surgery
- `tableSeat()`: the lesser seat needs `foodDeeds` (sentimentTaught alone) AND
  ladder stage ≥ Village (12 counted points, read as PEAK — see the live-vs-peak
  decision below). The full seat needs `deedGateReady().ok` AND ladder peak ≥
  National (40 counted points) AND a capstone deed delivered.
- `tableSeatLine()` / `fullSeatShortfall()`: voice the ladder via `ladderLine()`
  (Q10 — the cap is never silent, missing pieces named); the feast surge is no
  longer named anywhere in the seat surfaces.
- `tablePreview()`: new `ladder` block `{stage, peakStage, stageName, counted,
  nextThreshold, nextStageName, shortfall, capped, tracks, countedTracks,
  capstone, line}` for leg 3 to render in panelHaven.
- Sanctity hook: `tableActive()` gains one clause — a delivered capstone
  (`pg.ladderCapstone`) makes the table active until the finale resolves
  (phase `'done'`). This is the single predicate every ambient router gates on
  (monsterTurn ambient contact, `overtimeScaleFight`, havenGrowth, npc-triggers,
  favor-outing, win-plan), so delivery starts the mercy window. overtime.js
  is NOT touched (leg 3 owns it) — its `overtimeScaleFight` is a consumer of
  the hook, not a hook. A village that delivers and never sits stays under
  sanctity, but the overtime clock still docks the seat's standing while it
  waits, so waiting is not free.
- `ladderDeliverCapstone(kind)` (wired-exempt: leg-3 Haven entry point):
  guards (already delivered → `delivered`; re-checks `ladderCapstoneReady`),
  records `pg.ladderCapstone` + `pg.ladderCapstoneDay` + `pg.ladderCapstoneDetail`,
  says the delivery beat + mercy line, saves. Delivery is irreversible.
  - military tribute: 2 living wave-4 veterans EXCLUDING the scholar, picked
    in waveKillLog order, removed via the one removal choke point
    `removeVillager(vid, 'tribute')` (betrayal.js) — filters the roster,
    records in `v.exiles` with how `'tribute'`, cleans positions/sick/heat/
    allies. Delivery verifies both are off the roster afterward, else returns
    `tribute-failed` and records nothing.
  - trade charter: no price (the sealed charter IS the deed); records which
    chartered trade link was sealed.
  - feast embassy: no price (the bundle already done); reads the feast log's
    `bundle` flag + ladder stage.

### game.js — feast bundle + buy-out + data load
- `init()` adds `ladder-capstones.json` to the data list (leg-1 owed item —
  the browser otherwise reads only the fallback mirror). Verified:
  `Game.data.ladderCapstones` has `_doc` and `Game.ladderCapstones()` returns
  the 3 defs from the JSON, not the mirror.
- `feastBundleDefs()` / `feastBundleCheck(servedItems, ctx)`: the bundle sheet.
  Any 6 distinct contributions complete the bundle. One served item fills at
  most ONE slot (first match wins, specific-before-general order). Pantry cost
  stays real (each contribution drawn from the pantry like today's menu draw);
  the quality formula still runs on what was served. Feast cost floor (1500),
  guest rules, one-per-day, exile rule, quality formula, pantry draw untouched.
- `hostFeast()` computes the final bundle from the real draw (`drawn.items`) +
  `{star, surge}`; on completion the feast-log entry gains `bundle: true` +
  `bundleStage` (live ladder stage) + `bundleContributions`, and a bundle beat
  is said. `feastPlan()` previews the bundle from the preview draw.
- `feastBundleBuyOut()` (wired-exempt: leg-3 Haven entry point): pays 8000 kcal
  via a real `pantryDraw`, no feast, no guests. Writes a feast-log entry
  `{day, quality: 0, bundle: true, bundleStage, buyout: true}`. Quality 0
  means Standing's bread source (counts quality ≥ 1) never mints from a
  buy-out. Refuses honestly when the pantry holds under 8000 kcal, when the
  stage already banked its bonus, when exiled, away from Haven, or over.
  A buy-out completed at National stage satisfies the feast embassy like a
  feast bundle does (the bundle counts as complete either way).
- The +4 bundle bonus: +4 per distinct `bundleStage` on bundle feast-log
  entries, read inside `villageLadder()` AFTER the per-track cap (added to
  `counted`/`total`), with `detail.bundleBonus` / `detail.bundleStages`
  exposed; `ladderLine()` names the bonus when banked. The record lives on
  the feast-log entries themselves (`bundle: true` + `bundleStage`) — no new
  counter/store; once per stage by construction (the same stage's second
  bundle entry adds no new distinct stage).

### ladder.js — flagged minimal amendment
- `villageLadder()` reads the +4-per-stage bundle bonus (see above);
  `ladderLine()` names it; header rule `ladder_bundle_bonus` added.
- This is the ONE ladder.js change in the leg, flagged for coordinator review
  (ladder.js was otherwise read-only for leg 2; the bonus has to be read in
  `villageLadder()` for the seat to ever see it). If the coordinator rejects
  it, the fallback is the bundle flag alone (the embassy reads it) with the
  +4 unimplemented — and prereg bar L2-2 fails honestly rather than silently.

## The final 12 bundle contributions (all verified against real ids/deeds)

| # | id | resolves to (real) |
|---|----|--------------------|
| 1 | `hunted_meat` | served meat, plantId `meat_<animal id>`, foodKind `meat`, foodState carcass/cleaned/raw (`foodCarcass`, food.js; animal ids in animals.json) |
| 2 | `cooked_meat` | served meat, foodState cooked/smoked/roasted/dried (the quality formula's own centrepiece check) |
| 3 | `foraged_feast` | served plant/nut with plantId in plants.json (187 real ids) |
| 4 | `crafted_centrepiece` | served item with itemId `pemmican` (pemmican bars, food.js: crafted from dried/smoked meat + rendered fat + berries) |
| 5 | `monster_meat` | served meat with plantId `meat_<monster id>` for a real monster id (the tested-and-cooked monster meat of Steve's 2026-10-27 ruling 4) |
| 6 | `guest_of_honor` | the feast's star guest (highest-trust showed villager — hostFeast's own `star` computation, "the table has its heart", quality formula +1) |
| 7 | `explorers_rare` | served plant with idDifficulty 4 (8 real ids: mayapple, pokeweed, american_ginseng, wild_carrot, cow_parsley, giant_puffball, autumn_crocus, death_cap) |
| 8 | `preserved_food` | served item with foodState `preserved` (smoked, food.js) or `rendered` (food.js preservation ladder) |
| 9 | `medicine_brewed` | served plant with `medicinal: true` (34 real plants) AND foodState `cooked` (brewed = cooked medicinal plant; brew action game.js) |
| 10 | `garden_harvest` | served item carrying non-empty `gardenShares` (food.js `blendGardenShares`/`mergeHarvestShares`; gardening.json has 9 plants) |
| 11 | `kept_recipe` | state fact: `state.codex.recipes` holds ≥ 1 entry with level ≥ 1 (36 real recipe ids in recipes.json) |
| 12 | `keepsake_channel` | state fact: a keepsake channel is armed at feast time (`s.prog.feastSurge`; progression.js arming; hostFeast already reads it as `surgeSpent`) |

Two swaps from the brief's starting list (documented in the prereg):
- "traded delicacy" → `monster_meat`: NO trade provenance marker exists on any
  pantry item (grep for traded/fromTrade/tradeGood in food.js, storage.js:
  nothing), so a traded contribution cannot be read honestly.
- "a talker's song" → `guest_of_honor`: NO song exists anywhere (grep for
  song/sing over src/data/*.json finds only flavor text); no song deed/action/
  contest.

## Live vs peak stage for the seat gate: PEAK (decision)

`tableSeat()` requires the PEAK stage (`ladderPeakStage()`), not the live stage.
Reasoning: (1) capstone delivery is recorded and irreversible, so a seat it
opens must not be revocable by later deaths; (2) Steve's 2026-11-06 standing-
offer ruling — once offered, the offer does not withdraw; peak is the offered-
stage memory; (3) the mercy rule's point is that the win cannot be stolen
between delivery and sitting — a live-stage gate would let deaths steal it
anyway; (4) brief §a: the lesser seat "is priced on what the village did,
not on one dinner" (peak = what the village DID). The ladder bar/line still
show the LIVE stage; `tableSeat()` detail carries both live and peak so
voicing can name a dip honestly. Other bars stay live (waves faced are
monotonic deeds; scale and integration can still dip and hold the seat).
Proven by the L2-7 test: reach National via two villagers' field XP, record
the peak with a real `ladderTick()`, kill both villagers → live stage drops
to 0, peak stays 3, seat stays 'full'.

## Proof results

### New unit proofs (both green)
- `scripts/test-ladder-seat-20261108.js`: **38 passed, 0 failed** — deedGateReady
  without feastSurgeUsed (both directions); lesser opens at Village peak with
  sentimentTaught and no feast; lesser refuses below Village; full needs
  National + capstone (each of the three, refuses with none, refuses below
  National, refuses when another bar fails, shortfall empty when earned);
  seat lines voice the ladder (and the old line is byte-identical without
  ladder detail); tablePreview carries the ladder block; L2-5 data load
  (JSON, not the mirror); L2-7 live-vs-peak (seat stays priced after the
  village thins).
- `scripts/test-ladder-bundle-20261108.js`: **79 passed, 0 failed** — all 12
  contributions resolve in isolation + 5 priority checks (one item, one slot)
  + duplicates/<6/6-distinct; a real feast completes the bundle with a
  non-hunt mixture (6 food slots, no hunted meat) and grants +4 once per
  stage; buy-out (success, exact 8000 kcal, no Standing bread, refusals:
  short pantry / exile / already banked); tribute removes exactly 2 veterans
  (scholar stays, delivery recorded, sanctity on, second delivery refused);
  scholar-veteran edge (readiness ready, delivery refuses `veterans-short`,
  nothing recorded); charter + embassy delivery and refusals; mercy (200
  monster turns after delivery fire NO ambient raid; `overtimeScaleFight`
  refuses under a delivered capstone; control without delivery fires).

### Updated existing tests (design-change updates, same commit as the change)
- `test-fullseat-shortfall-20261102.js` — ALL GREEN. Rigs National + delivered
  capstone in `applyProfile` so cases isolate the named bars; the surge case
  now asserts surge:false alone → ready, seat 'full' (surge is not a bar);
  'food both short' names only the lesson.
- `test-deed-gate-20261010.js` — NO CHANGE NEEDED. Ran first: 69 passed, 0
  failed. Scenario D's re-fire goes through `deedGateReady`, not `tableSeat`,
  so the ladder rigging it was predicted to need is not needed.
- `test-tableaudit-20261021.js` — NO CHANGE NEEDED. Ran first: 15 passed,
  0 failed.
- `test-scalegate-a.js` — GREEN (22 passed, 0 failed). Rigs National +
  delivered capstone in setup so it isolates the scale term.
- `test-tableoffer-20261106.js` — GREEN. Rigs Village standing in
  `buildLesserProfile` so the lesser seat prices; the slip still regresses
  the seat to 'none' and the holding line still names integration (peak
  stays 1, no ladder entry in the holding line).
- `test-choiceprice-a.js` — GREEN (179 passed, 0 failed). The two static
  source checks track the new strings (singular 'the food-thesis deed';
  `const foodDeeds = !!(pg && pg.sentimentTaught)`).
- `test-table-reactor-seat-honesty-20261017.js` — GREEN (L2-8). Premise
  updated: foodDeeds is true with sentimentTaught alone (surge unspent);
  the blocker in its rig is the scale (village rank), the ladder is already
  met (peak 1); the beat still fires for a reactor bearer at arc 3 with no
  seat, and its miss list names the true bar (the pellet quote is the "what
  it banked stands" variant since foodDeeds is true).

### Wiring + syntax
- `node scripts/check-wired.js` on progression.js / table.js / game.js /
  ladder.js: 20 unwired listed, NONE of them mine. My leg added exactly 5
  functions — `feastBundleDefs`, `feastBundleCheck`, `feastBundleBuyOut`
  (wired-exempt, leg-3 entry point), `_ladderSeatRead`,
  `ladderDeliverCapstone` (wired-exempt, leg-3 entry point) — all wired or
  exempt. The 20 listed are pre-existing.
- `node --check` clean on all four edited modules.
- Green-list entries added for both new tests (`quick`).

### check.js --quick
- First run (branch tip e73643c2a, before the test-update round): **283 passed,
  11 failed in 369s**. Second run (full output captured): same 283/11.
- Attribution, verified by running every suspect test on the BASE commit
  (32c47d41e) in a separate worktree (`build-ladder-leg2-basecheck`, checked
  out at the base): **6 failures are pre-existing** (they fail identically
  on base) and **5 were caused by this leg**. The arithmetic closes: 6 + 5 = 11.
  - Pre-existing (fail on base AND on this branch — NOT touched, left as-is):
    `test-mobile-combat-cadence.js` (2 failed), `test-occupation-panels.js`
    (1 failed), `test-establishment-r20-fixes-20261020.js` (1 failed — the
    known "next day voices once more" failure),
    `test-phone-frame-proof.js` (3 failed — stale browser receipts, owed to
    a browser-capable agent, do not hand-edit proof hashes),
    `test-measurement-proof-update.js` + `test-measurement-workflow.js`
    (the retained neutral proof was ALREADY stale at the base — "Proof
    source inputs are not current" fires on base too; see the refresh below).
  - Caused by this leg, ALL FIXED (each passes on base, failed on the
    branch, green after a design-change test update):
    `test-fullseat-superset-20261014.js` (rig National + capstone; the
    surge case now asserts the gate stays ok),
    `scripts/godpath/test-boot-data-version.js` (43 → 44 JSON requests —
    ladder-capstones.json joined the boot data list),
    `scripts/godpath/test-table-sheet-handoff.js` (rig National + capstone),
    `scripts/godpath/test-table-entry.js` (rig Village standing; the
    keepsake lesson, not the surge, gates entry),
    `scripts/test-table-trial-fire-20261012.js` (rig Village standing —
    the fixture's fresh-game starting XP lands the ladder at 11–14
    counted, right on the Village threshold, so the seat flipped
    lesser/none between setup() calls and the trial fired only when the
    dice favoured it; probed directly before fixing).
  - Two tests the prereg predicted would break did NOT need changes:
    `test-deed-gate-20261010.js` (69 passed — scenario D's re-fire goes
    through `deedGateReady`, not `tableSeat`) and
    `test-tableaudit-20261021.js` (15 passed).
- Measurement-proof refresh: the pair was ALREADY red at the base (see
  above), so the refresh covers both the pre-existing staleness and this
  leg's changes. Ran a fresh neutral panel the leg-1 way (seed 7 ×
  capable / risk-aware / socialite / winseek × 150d, same shape as r153;
  4 cases, sourcesStable true, neutrality match on all 4 policies with 0
  warnings — the ladder does not break observer neutrality), retained as
  `evidence/2026-11-08/neutral-ladder-leg2-20261108.json.gz`, and refreshed
  `scripts/balance-proof.json` with `scripts/balance-proof-update.js`.
  Both tests green standalone after the refresh (9/9 each).
  - Post-rebase refresh (required — the rebase's 10 master commits changed
    the Game/controller/harness inputs again, so the pair went red a
    second time): re-ran the same panel shape against the new base, same
    result (4 cases, sourcesStable true, neutrality 4/4, 0 warnings),
    refreshed the proof again. Both tests green standalone (9/9 each).
    This is the leg-1 pattern (refresh after every rebase).
- Post-rebase proof suites (all 16 scripts re-run after EACH rebase):
  after the 246ce6dc2 rebase — seat 38/38, bundle 79/79,
  fullseat-shortfall ALL GREEN, scalegate 22/22, tableoffer GREEN,
  choiceprice 179/179, reactor PASS, deed-gate 69/69, tableaudit 15/15,
  fullseat-superset 9/9, boot-data-version 6/6, sheet-handoff 5/5,
  table-entry 43/43, trial-fire 18/18, measurement pair 9/9 + 9/9
  (after the post-rebase refresh above). After the d229b58f5 rebase —
  the same 16, all green again (measurement pair 9/9 + 9/9 after the
  third refresh below).
  - Third refresh (after the d229b58f5 rebase): the pair went red again
    because the batch-ship version bump moved the build tag (the leg-1
    pattern — a rebase that moves the tag invalidates the proof). Same
    panel shape, same result (4 cases, sourcesStable true, neutrality
    4/4, 0 warnings), proof refreshed a third time. Both tests green
    standalone (9/9 each).
- Final gate run: `node scripts/check.js --quick` on the final branch
  (tip 60a0a26d5, after the d229b58f5 rebase + third refresh) came back
  **283 passed, 11 failed in 1608s** — but the run was DEGRADED by a
  post-restart thundering herd (the VM had rebooted 28 minutes earlier;
  load average 13–24 through the run; two sibling gates re-ran
  concurrently with `--timeout 300`). Its 11 failures break down as:
  - 4 pre-existing (the same four as every run): mobile-combat-cadence,
    occupation-panels, establishment-r20, phone-frame-proof.
  - 7 load artifacts, EACH verified individually afterward:
    trust-observer-neutrality 6/6 standalone; measurement-cache-flags
    fails 0/4 on the BASE too (its 30s spawn timeout cannot complete
    CLI panel runs at load 18+ — not this leg); solo-campaign-endings
    15/15; synergy-stall exit 0; throttlefeast 17/17; capable-bot 42/42;
    table-endings 61/61. (The five timeouts all hit the check.js 120s
    cap at 120.1–120.2s; all five passed in both light-load runs.)
  - True final state: **290 passed, 4 failed (pre-existing only)**.
    No further full re-run was attempted — the box stayed at load 24
    with sibling gates running, and another full run would only have
    produced more timeout noise.

## Known gaps / flagged for coordinator review
1. **ladder.js amendment** (above): the +4 bundle bonus is read in
   `villageLadder()`. Flagged; fallback is the bundle flag alone.
2. **Tribute scholar-readiness gap** (leg-1 follow-up owed): leg-1
   `ladderCapstoneReady('military_tribute')` counts the scholar as a payable
   veteran, so scholar-veteran + 1 villager reads ready but delivery refuses
   honestly with `veterans-short` and records nothing. Proven in the bundle
   test (both directions). In real runs the scholar is very often a wave-4
   killer, so this edge is likely, not rare.
3. **Feast embassy reading adopted** (leg 1's): bundle completed at ANY stage +
   currently National (live stage) = ready. The data form
   (`ladder-capstones.json` requires {feastBundle: true, ladderStage: 3}) is a
   conjunction, not a temporal constraint. Enforcing "bundleStage === 3" at
   delivery would contradict readiness.

## What leg 3 needs from this leg
- Entry points (both wired-exempt, waiting on app.js panelHaven):
  - `Game.feastBundleBuyOut()` — no args. Returns `{ok, why?, spent, bundleStage,
    cost: 8000, day}`. Pays 8000 kcal from the pantry, no feast, no guests;
    bundle counts as complete (+4, once-per-stage rule applies).
  - `Game.ladderDeliverCapstone(kind)` — kind is `'military_tribute'` |
    `'trade_charter'` | `'feast_embassy'`. Returns `{ok, kind, reason?, ...}`
    (reasons: `delivered`, `veterans-short`, `no-sealed-charter`,
    `scale-short`, `no-bundle-feast`, `stage-short`, `tribute-failed`,
    `unknown-capstone`). Readiness first via `Game.ladderCapstoneReady(kind)`
    (reasons: `veterans-short`, `no-sealed-charter`, `scale-short`,
    `no-bundle-feast`, `stage-short`, `delivered`, `unknown-capstone`).
- Rendering: `tablePreview().ladder` block (see the table.js section above);
  `tableSeatLine()` already voices the ladder; `fullSeatShortfall()` names
  ladder + capstone gaps.
- Sanctity: delivery starts the mercy window via `tableActive()` (see above);
  overtime.js is untouched by this leg — leg 3 owns it.
- The phone-frame-proof test stays red until a browser-capable agent refreshes
  receipts (known owed item from leg 1 — do not hand-edit proof hashes).

## Commits on branch build-ladder-leg2 (final SHAs; base d229b58f5)
- `e285c1cea` prereg
- `2b1049e35` progression.js: foodDeeds is sentimentTaught alone
- `f7b8bbb40` ladder.js: +4-per-stage bundle bonus read (flagged amendment)
- `d733b9f34` table.js seat surgery [needs-eyes]
- `c1fd6b507` game.js feast bundle + buy-out + init data list [needs-eyes]
- `fdee5c3aa` game.js: centrepiece contribution id `crafted_centrepiece`
  (prereg name, not the item id `pemmican`)
- `b87225bf0` new seat + bundle unit proofs (38 + 79 green)
- `0d4f08f5e` fullseat-shortfall test rigs National + capstone; surge no
  longer a named bar
- `bd42134cb` scalegate test rigs National + capstone
- `4d7cef89d` tableoffer test rigs Village standing
- `2ebe07f7f` choiceprice static checks track the singular food-thesis deed
  + sentimentTaught-alone foodDeeds
- `c3c33e393` reactor seat-honesty test premise updated
- `a7a9dabd9` green-list entries for the two new proof tests
- `67fc50bc5` fullseat-superset test rigs National + capstone; surge case
  now asserts the gate stays ok
- `b0ea66a2e` boot-data-version expects 44 JSON requests
  (ladder-capstones.json joined the boot data list)
- `4e623e420` table-sheet-handoff fixture rigs National + capstone
- `572cf7150` table-entry fixture rigs Village standing; lesson (not surge)
  gates entry
- `67ef7e09a` table-trial-fire setup rigs Village standing (fixture sat on
  the threshold and flipped lesser/none)
- `d4f4af645` refresh neutral proof (fresh panel seed 7 x 4 policies x 150d,
  neutrality 4/4, 0 warnings)
- `e3dd68a91` run note (seat surgery + feast bundle, proofs, check.js
  attribution, neutral-proof refresh)
- `9f062fe8f` refresh neutral proof after rebase onto 246ce6dc2 (panel
  seed 7 x 4 policies x 150d, neutrality 4/4)
- `5f1e19d5a` run note update (rebase onto 246ce6dc2, post-rebase proof
  suite + proof refresh)
- `60a0a26d5` refresh neutral proof after rebase onto d229b58f5 (panel
  seed 7 x 4 policies x 150d, neutrality 4/4)
- `docs/ONTOLOGY.md` (generated update, harvested by validate-ontology
  during check.js from this leg's source comments: the new
  `ladder_bundle_bonus` rule + the `arc4_deed_gate` wording noting
  feastSurgeUsed was dropped) — committed with the run note.
- (final run-note commit below; merge to follow)
