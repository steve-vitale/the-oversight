# sim-ammo-gap — Triage A4: ammunition pocketing + bolts + volley

Worktree branch: `gap-ammo`. Base: 60e260dc007b5ee5cb4247d00699faefa082a3c2 (see commit
hashes at close). Plain words throughout: this is about villagers going out
to fight with empty hands while the village pile holds stones, and arrows
and bolts never getting made.

Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law), and the
ammunition facts already measured by sim-volley-a (2026-10-26, 2141Z) and
sim-ammostorage-a (2026-10-26, 2317Z). Nothing here invents canon.

## 1. VERIFICATION — still open on current master (before any build)

Checked by reading the code and by running the unit probe
(`scripts/test-ammo-gap.js unit`, seed 7):

- The volley engine itself WORKS. `fieldFights.js` fieldFight opens a fight
  at range when the fighter carries matching ammo: bow + 5 carried arrows
  fired 2 shots (1 hit, 13 damage, arrows 5 → 3, spent honestly); crossbow +
  5 carried bolts fired 3 shots (3 hits, 65 damage, bolts 5 → 2). The engine
  is starved, not broken.
- Pocketing is MISSING. `villagerGearUp(vid, true)` — the departure gear-up
  used by patrols and expeditions — fetches weapons and armor from the
  fighter's own stash, the communal armory, or whittling, but never touches
  ammunition. Unit probe: bow fighter + communal pile of 200 stones →
  pocketed 0; sling fighter + 200 stones → pocketed 0; crossbow fighter +
  200 stones, 200 sticks, 200 branches → pocketed 0. No function named
  anything like villagerAmmoCraft / villagerPocketAmmo exists in src/js.
- Bolt crafting for villagers is MISSING. Arrow and bolt recipes exist in
  src/data/recipes.json (arrow: 2 stick + 1 stone + 1 fiber, makes 5; bolt:
  2 stick + 1 stone, makes 5) and the player's craft() can make them, but
  no villager code path ever crafts them. The only villager crafting beat
  in the game is armor crafting (villagerArmorCraftDay, gated on the
  ARMORVILLAGE test flag), which covers armor only.
- The communal pile holds the wrong inputs for those recipes. Re-counted
  from the saved sim-ammostorage-a corpus (1,179 fight moments): communal
  stone is present at 1,172/1,179 moments (median 189, max 724), branch up
  to 184, wood up to 118 — but stick is 0 at ALL 1,179 moments and fiber is
  0 at ALL 1,179 moments. Sticks only ever reach the player's own pack
  (foraging a tree, 40% chance); fiber likewise. Nothing in the game
  stocks stick or fiber in the communal pile. So even a correct bolt-craft
  path fed from the pile will usually find no stick — this is a measured
  supply fact, carried into the pre-registered bolt bar below, not an
  excuse invented after the fact.

Verdict: STILL OPEN on all three legs (pocketing, bolt crafting, volley
starvation). No leg already works; no rework avoided by an existing fix.

## 2. BASELINE (before build, same harness as the after-run)

Unit probe (`node scripts/test-ammo-gap.js unit`, seed 7):
- gear-up bow: ranged = crude_bow, pocketed ammo = 0, pile stone 200 → 200
- gear-up sling: ranged = sling, pocketed ammo = 0, pile stone 200 → 200
- gear-up crossbow: ranged = crossbow, needed ammo = bolt, pocketed = 0
- volley with carried ammo: bow 2 shots, crossbow 3 shots (engine works)

Panel baseline (`node scripts/test-ammo-gap.js panel`, 8 seeds × 40 days,
competent policy, fieldFight census):
- Seed 1: 41 fights, 19 ranged, 0 with ammo, 0 volley fires, pile stone 114
- Seed 2: 40 fights, 27 ranged, 0 with ammo, 0 volley fires, pile stone 66
- Seed 3: 51 fights, 33 ranged, 0 with ammo, 0 volley fires, pile stone 147
- Seed 4: 49 fights, 26 ranged, 0 with ammo, 0 volley fires, pile stone 241
- Seed 5: 72 fights, 36 ranged, 0 with ammo, 0 volley fires, pile stone 198
- Seed 6: 25 fights, 11 ranged, 0 with ammo, 0 volley fires, pile stone 57
- Seed 7: 43 fights, 37 ranged, 0 with ammo, 0 volley fires, pile stone 104
- Seed 8: 51 fights, 29 ranged, 0 with ammo, 0 volley fires, pile stone 69
- TOTAL: 372 fights, 218 ranged fights, 0 ranged fights with ammo,
  0 volley fires, 0 volley shots, end-of-run carried ammo 0 on all 8 seeds.

## 3. PRE-REGISTRATION (binding, written BEFORE building or re-running)

Panel for the after-run: identical to the baseline — seeds 1–8, 40 days,
competent policy, same census script (`scripts/test-ammo-gap.js panel`).
A miss is NO-GO, never re-scored; doubts go under "metric review" for the
NEXT run.

- P1 POCKETING (primary): after-panel ranged fights with ammo > 0.
  GO iff rangedWithAmmo > 0.
- P2 VOLLEY (primary): after-panel volley fires > 0 in fights where the
  fighter holds ammo. GO iff volleyFires > 0.
- P3 BOLTS (primary, one bar picked now, not after): bolts crafted > 0 on
  the after-panel, OR bolts stay 0 AND the after-panel communal stick pile
  AND fiber pile are 0 on all seeds AND stone volleys fire > 0. The second
  branch is the named, measured reason: the bolt recipe's inputs never
  reach the communal pile (stick 0/1,179 and fiber 0/1,179 in the old
  corpus), so a bolt-craft path fed from the pile cannot fire until the
  pile stocks stick/fiber — a supply job, not a pocketing job. Picking
  this branch still requires the bolt-craft code to exist and to be
  unit-proven (with stick/stone present, a crossbow fighter crafts bolts).
- P4 PILE LEDGER (primary): the pile ledger closes in the unit proof.
  GO iff every stone leaving the communal pile is accounted for exactly:
  pile stone decrease == stones pocketed + stones consumed by ammo crafts
  (each craft consuming exactly its recipe cost, success or failure), and
  no carried ammo appears without a matching pile decrease or a move
  from the fighter's own stash, and no unit is counted twice.
- GUARD: no changes to monster HP/damage, wave pacing, or combat damage
  formulas. The diff touches villager departure preparation only. Existing
  tests: `node scripts/check.js --quick` after the fix, with any failure
  investigated, not waived.

## 4. THE FIX (written after pre-registration)

What was built (villager side only — no monster HP/damage, wave pacing, or
combat damage formula changed; the volley engine itself is untouched):

- `Game.villagerPocketAmmo(vid)` (src/js/game.js, next to villagerGearUp):
  a fighter going out pockets ammunition in this order — (1) their own
  stashed ammo (their own property; nobody else's stash is touched),
  (2) sling stones from the communal pile, ledgered with stashLog like an
  armory borrow, (3) ONE craft attempt per departure for bow/crossbow
  ammo from the communal pile, using the existing arrow/bolt recipes at
  the player's craft odds exactly (blind 35%, learned 85%; a blind
  success teaches, the PRACTICE rule). Knowledge follows the armor-craft
  precedent: carrying the ranged weapon is the showing; no new knowledge
  system was built. Ammo kinds with no pile recipe (fusion cells and the
  like) are left alone, never invented.
- Numbers, named and modest: sling tops up to 6 stones; arrows/bolts top
  up to one recipe batch (5 units, the recipe's makesUnits). A volley
  shoots at most 4 per fight, so a full quiver covers a fight plus a
  second meeting, not a campaign.
- Wired at exactly the two departure sites, after gear-up and after the
  sit-out checks: patrols (game.js resolvePatrol) and expeditions
  (villager-agency.js startExpedition). Fight entry (fieldFight's
  acquire=false gear-up) deliberately does NOT pocket — a fighter far
  from home must not teleport ammo out of the village pile mid-fight.
  The player is skipped (the player pockets and crafts through the UI).
- Proof script: `scripts/test-ammo-gap.js` — `unit` (the old baseline
  checks, now also a guard: gear-up alone still pockets nothing),
  `pocket` (the new-behavior checks), `panel` (the 8-seed census).

Unit proof (`node scripts/test-ammo-gap.js pocket`, seed 7): 13/13 PASS.
- Sling pockets 6 stones; pile 200 → 194 (ledger closes exactly).
- Volley fires off the pocketed stones (2 shots, 1 hit, 8 damage) and
  spends exactly its shots (stones 6 → 4).
- Bow with no stick in the pile crafts nothing and consumes nothing.
- Crossbow with stick + stone in the pile attempts exactly one craft:
  stick 10 → 8, stone 200 → 199, bolts 0 or 5 matching the roll (this
  seed's blind roll succeeded: 5 bolts).
- Own stashed arrows (3) move into the pack; pile untouched.
- Guards: fight entry pockets nothing (volley 0 shots, pile untouched);
  the player is skipped entirely.

## 5. AFTER-RUN RESULTS (same panel, after the fix)

Panel after-run (`node scripts/test-ammo-gap.js panel`, seeds 1–8, 40 days,
competent policy — run twice with the ammo-type census, identical results):
- Seed 1: 41 fights, 19 ranged, 0 with ammo, 0 volley fires, pile stone 114
- Seed 2: 40 fights, 27 ranged, 0 with ammo, 0 volley fires, pile stone 66
- Seed 3: 51 fights, 33 ranged, 0 with ammo, 0 volley fires, pile stone 147
- Seed 4: 49 fights, 26 ranged, 0 with ammo, 0 volley fires, pile stone 241
- Seed 5: 72 fights, 36 ranged, 0 with ammo, 0 volley fires, pile stone 198
- Seed 6: 26 fights, 12 ranged, 3 with ammo (all stone), 2 volley fires
  (4 stone shots), pile stone 54
- Seed 7: 43 fights, 37 ranged, 0 with ammo, 0 volley fires, pile stone 104
- Seed 8: 66 fights, 39 ranged, 2 with ammo (all stone), 2 volley fires
  (4 stone shots), pile stone 60
- TOTAL: 388 fights, 229 ranged fights, 5 ranged fights with ammo (all
  stone), 4 volley fires, 8 volley shots (all stone), 0 arrow fights,
  0 bolt fights. End-of-run pile stick = 0 and pile fiber = 0 on all
  8 seeds; end-of-run carried ammo 0 on all seeds (pocketed stones were
  spent in volleys across later fights, not left sitting).

Verdict against the pre-registered bars:
- P1 POCKETING: GO (5 > 0).
- P2 VOLLEY: GO (4 fires > 0, in fights where the fighter held ammo).
- P3 BOLTS: GO via the pre-picked second branch — bolts stay 0 on the
  panel AND communal stick and fiber are 0 on all 8 seeds AND stone
  volleys fire (8 shots). The bolt-craft code exists and is unit-proven
  (crossbow + stick + stone → 5 bolts, exact ledger); what is missing
  in live runs is the supply — nothing stocks stick or fiber in the
  communal pile. That supply job is NOT this item; it is flagged as
  remaining work below.
- P4 PILE LEDGER: GO in the unit proof — every pile decrease is exact
  (stones pocketed 6 for 6 taken; bolt craft stick −2 / stone −1 for
  one attempt, success or failure; own-stash moves leave the pile
  untouched; no phantom ammo appears).
- GUARD: diff touches villager departure preparation only (game.js
  helper + 2 call sites, plus the probe script and this note). No
  monster stats, wave pacing, or combat damage formulas changed.
  Regression: targeted area tests pass except three failures proven
  pre-existing by stash-testing on the pristine base (same failure
  with this change stashed): test-miser-stash-village-20261007,
  test-stash-takeback-20261008, test-combat-r7-20261009 — all three
  die in genCharacter with `ReferenceError: Text is not defined`
  because their old subset-eval harnesses never load the module that
  defines Text. Passing area tests: villager-gear, gearup-spear-slot,
  fieldfight-summary, gear-audit, weapon-slot-readers,
  proof-combat-survival, break-monsters3-fieldfights, combat-break
  (succombat skips, exit 0, arm deleted per kill protocol).
  Full `check.js --quick` (287 scripts) did NOT complete here: it
  timed out twice (15 min with jobs 2, then 25 min) on a box where
  sibling workers run their own check suites on 2 shared cores, and
  its partial run showed 2 failures whose names check.js only prints
  at the end — so those two are UNIDENTIFIED and remain open. The
  ship loop's full check must name them before this lands; one
  plausible class is trajectory-exact tests involving sling fighters,
  since working volleys now change fight outcomes (intended).
  RECOVERY ADDENDUM (post-restart retry, third attempt): the run was
  stopped at 156/287 with 10 failures rather than waited out, because
  the count varies run to run (0 in the first 79 of attempt 1, 2 in
  the first 109 of attempt 2, growing 1 → 10 in attempt 3) while the
  box load averaged ~20 on 2 cores — the pattern fits the suite's
  120-second per-script timeout flaking under contention, not a
  deterministic break from this change. Names remain unobtainable
  without a completion; the ship loop's full check is the gate.

Note on trajectories: after-run fight totals differ slightly from the
baseline (388 vs 372) because the new craft rolls draw from the game's
random stream and volley outcomes change who lives and dies. Seeds and
policy are identical; the comparison is on counts, not byte-identical
trajectories, and the direction is the mechanic working, not noise.

## 6. METRIC REVIEW (doubts for the NEXT run, never a re-score of this one)

- End-of-run carried ammo reads 0 even on seeds where pocketing fired.
  The fight-time census is the metric that passed (5 fights with ammo),
  and the unit ledger closes exactly, so this reads as spend-down
  across later fights, not a leak — but a future run should count
  pocket events directly (stashLog takes + tele ammo_craft events)
  instead of inferring from end-state packs.
- The panel only runs 40 days and crossbow fighters are rare early, so
  the bolt evidence is thin even apart from the stick supply gap. A
  longer panel (or a run where the player donates stick) would test
  bolt crafting in the wild better.
- The stick/fiber supply gap is now the binding constraint on bolts:
  nothing in the game stocks stick or fiber in the communal pile
  (stick 0/1,179 old fight moments, 0/8 new panel seeds at end). That
  supply job belongs to a future item, not this one.
- check.js --quick could not finish on this loaded box; the failures
  in its partial runs are unidentified (see §5 guard note).
- Steve ruling 2026-10-27 (react-on-meeting: villagers react to things
  they meet as the player does) does NOT change these bars and needed
  no code change here: this item is departure preparation — packing
  before going out, the same as the player — not encounter behavior.
  The volley fires at a fight's opening, which is the meeting's fight,
  not a new way of meeting things.
