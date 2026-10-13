# Party wiring — villagers fight together (2026-10-12)

Steve's directive (2026-10-12): "make sure they actually utilize the party system
among themselves."

## The gap (measured)

The villager-depth probe (531 villager field fights, 8 seeds × 150d) found:
- `calledHelp` fired **0 times**. The "shout for help" branch was unreachable.
- allies present in **0/531 fights**.
- Root cause 1: the main fight path (`expeditionMonster`, villager-agency.js)
  never passed allies — `fieldFight(vid, m, null, { awareness: true })`.
- Root cause 2: the patrol/wild paths pass `_outdoorCrew`, snapshotted in
  `resolveAssignments` — always empty when fights actually happen (expedition
  fights run in the agency loop, a different phase; most villagers never hold
  assignments anyway).

The machinery worked — it was just never fed.

## The fix

New module `src/js/party-wiring.js` (self-attaching mixin, @ontology):
- **`villagerFightAllies(vid)`** → up to 2 villager ids, who'd answer the shout.
  Sources: (1) the outdoor crew — live-read from `v.assignments` plus the
  `_outdoorCrew` snapshot as backup, since assignments delete as they resolve;
  (2) villagers on/adjacent grid nodes (in earshot, Chebyshev ≤ 1).
  Ordered by village trust, crew first — **the trusted step up first, never
  random**. Trust < 15 doesn't answer (stranger territory; default is 10).
  The fighter never answers their own call; the player is excluded (their
  own party system is separate).

Wiring:
- `expeditionMonster` now passes `{ allies, allyVids }` from the helper —
  the main path that produced the 0/531.
- Patrol (`resolvePatrol`) and wild (`resolveWildMonsterEncounter`) paths:
  crew vids trust-ordered (count semantics for the hold-bonus unchanged).
- `fieldFight` rec now carries `allyVid` (both ally branches) so callers can
  name the rescuer honestly.
- The "— alone —" kill deed is now honest: "with X charging in when it turned".
- **Gossip beat**: a rescue seeds `seedGossip('rescue', { who: ally, for: fighter })`
  — "Did you hear? Mara ran into the treeline when they heard James scream.
  Didn't hesitate." Rendering + journal note added; `gossipActionDims` maps it
  to `{ brave: 10 }` (canon: gossip moves REP, never trust).

Tuning kept as designed: one ally answers per fight, allied parties at the
door join from round 1, the ally is off-balance/exposed (no armor) — and the
ally's wounds persist via the existing `hurtVillager(allyVid, 30)` path.

## Design calls (documented, Steve can overrule)

- Trust floor 15: strangers (default 10) don't sprint into the treeline.
- Trust direction uses the village-global map (`v.trust[candidate]` = "the
  village trusts Mara; trusted people run toward screams"). There is no
  pairwise friendship map to read the fighter→candidate direction from.
- Patrols stay crew-only (not proximity): a patrol at Haven with the whole
  village "in earshot" would trivialize perimeter defense.

## Proof

`scripts/test-party-wiring-20261012.js` — **10/10 PASS** (seed 12, full
src/js harness in index.html order, Math.random seeded before eval,
Game.save never stubbed):
(a) crew nearby → ≥1 ally; (b) highest-trust answers first, stranger doesn't
jump the queue; (c) expeditionMonster passes allyVids (the trusted one);
(d) calledHelp fires when hopeless with help near — the fight log shows
"X is losing — shouts for help! Y charges in!"; (e) truly alone → 0 allies.
**RED-verified**: with the fix neutralized, (0)/(a)/(b)/(c) fail; restored →
all green.

Regressions: `test-rumor-flow.js` and `test-combat-feel-20261009.js` fail
identically on pristine master (pre-existing, unrelated).

## Out of scope (Steve still designing)

Party-bond meter, RPG role functions, village-scale bond path — wiring only.
