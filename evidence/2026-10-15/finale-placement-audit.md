# Reachable titan and Finale sites — 2026-10-15

The coalition probe reached actual later-node victories and exposed objectives
outside the 9×9 travel map. After opening credits, seed 1234 placed the heart
at (15,3), seed 777 at (14,4). Ordinary titan lairs used the same unbounded
`px + 3` arithmetic. These were game defects, not bot pathfinding failures.

## Change

`titanPlacementTile(offset)` is shared by ordinary lairs, the Finale crew,
opening credits and heart. It retains the intended eastward site when legal,
otherwise deterministically chooses the nearest free site inside the actual
nine-wide travel surface. It excludes the current tile, village safe tiles
and occupied monster tiles. Announcements name actual map coordinates.

The normal public titan self-action surface also repairs an existing invalid
lair/node location. It keeps the same world-monster object, HP, detail
coordinates, muster and campaign progress. Legal sites are left alone;
active fights and Network-owned node coordinates are left alone. No army,
food, combat, health, damage, survivor or progression numbers changed.

## Proof

- `test-finale-placement-20261015.js`: 15 pass; frozen parent `113d8d65`
  gives 6 pass / 9 fail. All 81 origins exercise real crew placement and
  both subsequent resolution callers. Synthetic win snapshots in these
  unit tests are explicitly fixtures, not played campaign victories.
- The same shared game runs actual dawn omen advancement for a Herald at
  the eastern edge, plus public self actions for an invalid saved heart.
  Tests retain the intended legal eastward site, avoid occupied sites,
  preserve repair state and check repeat-call/active-fight behavior.
- Existing `test-finale-epic.js`: 71 pass, zero failures.
- Quick: 119 scripts pass, zero failures, 29 seconds.
- Full: 891 scripts pass, zero failures, 137 seconds. One additional
  ordinary-titan dawn assertion was then added to the placement proof and
  passed; no runtime change followed the full check.
- Ontology: 111 systems, zero errors. Titan/finale callers: 43/36 functions,
  zero unwired.

## Prepared matched march

`finale-placement-prepared-16.json` captures the same sixteen seeds and
unchanged experimental guard tactic on frozen before/after source. It uses
the same explicit gear/relationships/food/initial arena fixtures as
`ally-reach-audit.md`, then real public combat/travel/resolution. Hashes
identify source contents. No later-node teleport, forced outcome or HP grant.

| Outcome | Before | After |
|---|---:|---:|
| Crew clears | 7 | 7 |
| Opening credits clears | 2 | 1 |
| Actual heart fights | 0 | 1 |
| Remaining out-of-map Finale objectives | 5 | 0 |
| Complete Finale campaigns | 0 | 0 |

The changed sites change travel and encounter trajectories. This is not a
probability/balance improvement claim. Seed 555 now actually clears the
opening and reaches the heart, then flees in round five at 34 HP with 19
allies alive. Some runs still stop on normal travel or health decisions;
the prepared tool makes at most three road attempts. The full campaign
and natural Network route remain unfinished.

## Phone playtest

A fresh local origin, 390×844 viewport, actual app scripts with the service
worker disabled. An explicitly labeled old-save fixture starts the bearer
at (8,3) and the heart at invalid (15,3), HP 123/456. The real self-bar
renderer repairs it to (8,2) and announces the corrected coordinates. After
the ordinary starter choice, actual War Council still refuses because the
fixture supplied no coalition. The repaired location/unchanged HP and
coalition refusal are visible in `finale-location-phone.png`.

The world map remains fogged in this fixture; this is not proof of a revealed
map marker or natural acquisition. No hidden-state browser evaluation was
used. The test tab was closed, viewport restored and temporary server stopped.

## Remaining

Continue public heart counters/crew-spoil usage and a six-slot late build,
then natural food/overtime logistics and the Network march. Reaching a legal
tile does not prove the bot can negotiate every blockage or survive the
fight. Livelihood materials, preservation/storage/peer trade and advertised
item powers remain separate playstyle coverage gaps.

## Natural matched screen

`finale-placement-natural-before.json` / `finale-placement-natural-after.json`:
16 identical seeds × two unchanged policy files × 240 days, standard driver,
no prepared state. The source manifest differs only in `titans.js` and
`finale-campaign.js`. Control Table wins 11→12/16; campaigner wins 9→10/16;
campaigner Herald kills 6→8/16, zero campaign-policy errors on either side.
Seven control state hashes match; all campaigner trajectories diverge.
These small shifts are coverage diagnostics, not established probability
improvements. No natural full Finale or Network completion is established.
