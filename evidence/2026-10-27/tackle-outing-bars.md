# Joint foraging outing — pre-registered bars (tackle-outing, 2026-10-27)

Plain words: a villager asks you to forage with them tomorrow to rebuild the
pantry. Until now that ask had no playable action behind it — the game said
"There is no playable joint foraging outing yet. Giving food does not perform
the promised outing." This workstream builds the outing itself: you set out
together, forage the same ground together, split what you find, talk on the
way, and bring the haul home together. Nothing here changes any gate: no
deedGateReady, scale, stage, readiness-bar, or table-price change (see B5).

## Before state (read before measuring, not re-scored after)

- `src/js/convo-wants.js` lists `forage_help` in the `unavailable` map with
  `unsupported: true`, so `convoFavorCommit` refuses it and no outing can
  start through the favour path.
- Companion departures already exist for villagers on their own
  (`villager-objectives.js` `objAskCompanion` marks a GUARD companion and
  `objDepart` walks them out together), but that is villagers walking on
  their own errands — it is not the player's promised pantry outing, it
  carries no joint forage, no split haul, and no outing conversation.
- Solo foraging already exists and is the reused rule: one press works the
  patch around you, costs food-energy and time, and leaves the patch picked
  clean for a few days (`game.js` `doAction('forage')`). The outing reuses
  that exact press — it does not invent a second, freer forage.

## Bars (fixed before the proof test ran; a miss is NO-GO, never re-scored)

- B1 OUTINGS HAPPEN ON THE REAL PATH: through the public favour path only
  (`convoFavorAction` / `convoPerformFavor`, never a test-only setter), a
  promised `forage_help` favour goes start → forage together → deliver at
  Haven → favour fulfilled and promise kept, on each of seeds 42 and 7.
  At least one complete outing per seed. The start requires dawn at Haven
  next to the partner, matching the favour's own "first light" wording.
- B2 HAUL IS SHARED, NOT SOLO-CREDITED: after one joint forage, the
  partner's share is greater than zero, the player's kept share is greater
  than zero, and the two shares add up to exactly the sweep's edible haul.
  After delivery at Haven, the pantry gain equals that same total — no
  double count, and no share in the pantry before delivery (the haul rides
  in transit, not in the pantry, until both are home).
- B3 CONVERSATION DURING THE OUTING: at least one partner line is spoken
  while the outing is under way (a forage line naming what was found, plus
  a trail-talk line), the outing records that talking happened, and the
  transcript lines name the partner and the haul. Talking is not a
  promise-keeper by itself — it rides along with the work.
- B4 RISK IS REAL, NOT A FREE HAUL: (a) the joint forage spends the same
  food-energy and time a solo forage spends; (b) the patch it worked is
  marked picked-clean, and repeated foraging on the same patch runs dry;
  (c) asking to end the outing away from Haven does not deliver anything;
  (d) the partner travels on the player's own node (so the pair stands
  where monsters and animals actually move — the existing encounter
  machinery, not a new dice roll — can reach them). No new monster
  outcome table is invented: encounters stay fought, not rolled.
- B5 NO GATE CHANGE: the diff touches no `deedGateReady`, scale, stage,
  readiness-bar, or table-price code. Checked by grepping the diff.
- B6 NO REGRESSION: `node scripts/check.js --quick` stays green, and the
  existing favour tests still pass. If a green-list test breaks because
  the design changed on purpose, the test is updated in the same commit
  and the change is named here — not silently loosened.

## What counts as the outing, in plain words

- Start: dawn, at Haven, standing next to the partner, within the favour's
  deadline. The partner then travels with you (the same travelling
  machinery as a party companion).
- Forage together: one real solo-rule forage press on green ground. The
  edible haul is split about half and half: your half stays in your pack,
  your partner carries theirs. Plants nobody knows yet stay lumped in your
  bag (they are not food until identified — the knowledge rule holds), and
  wood and crafting bits stay with you; neither is split as food.
- Talk: foraging together always draws a partner line, and you can also
  stop and talk on the trail while the outing is under way.
- Deliver: back at Haven together, both shares go into the pantry as real
  items, and only then does the promise count as kept. Ending the outing
  early at Haven unloads what you have but breaks the promise, exactly
  like the creek trip does. If nothing edible was ever gathered, delivery
  refuses — an empty walk home is not a kept pantry promise.

## Kill discipline

A missed bar above is HELD with its root cause, not a reason to delete the
outing. The outing is only ever removed if the root cause shows the lever
itself — shared travel plus a split solo-rule forage — is wrong, and that
finding is written down first.
