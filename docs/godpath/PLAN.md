# God-Path Plan (current state, 2026-10-14)

Read `docs/godpath/STEVE-ANSWERS.md` first (it outranks this file), then
`docs/COHERENCE-SPINE.md`. The old phased plan (conditions, trials, god
abilities transforming in the slot) was retired by the unified design below.
Proof note: `evidence/2026-10-14/godpath-unified.md`.

## The design (built)

Job -> track -> **class** -> **god** -> Table.

| Piece | Where | State |
|---|---|---|
| 10 paths x 2 subclasses, one god per path (one verb, weakness, scale) | `src/data/godpaths.json` | built; godhood.json retired, Farstrider folded into cartographer |
| `path` + `subclass` (+ rare `alsoPath`) on every magic ability | `src/data/abilities.json` | built (94 magic) |
| Subclass verbs (walls, pulls, pushes, swaps, blink, heals, pins, bribes, broadcast, command, stoke, guard, feed camp) | `src/js/godpath.js` (`do` on a data action) | built, 27 new abilities |
| Class recognition, player + villager, one function | `godpath.js recognizeClass` | built; sheet line in `app.js` |
| Offers lean to the path | `godpath.js shapeOffers` (player, villager, gift sheets); `villager-build.js buildPathLean` | built |
| Ascension = class + payoff + 4 path + deed (day 80 + path synergy) | `godhood.js` (derived) + dawn check | built; gates are data levers |
| Table never reads godhood | `scripts/godpath/ladder.js` | enforced |

## Checks

- `node scripts/godpath/validate.js` (data contract)
- `node scripts/godpath/ladder.js` (runtime contract)
- `node scripts/test-godpath-unified-20261014.js` (every verb, through the game)
- `scripts/godpath/phase.json` is vestigial (no phased checks remain).

## What's left

1. **Steve: ascension gates.** All on, the capable bot ascends 0/16 runs
   (before: 6 player / 12 villager). Levers in `godpaths.json rules.capstone`.
2. Villagers can't use the new active verbs (tbVillagerAbility is id-based);
   new passive hooks read the player only.
3. Early kit entries decide which paths appear (6 of 20 subclasses in sims).
   Kit order is a lever.
4. god.scale (party/titan/contest/army) is design text; wire per god.
5. Table endings by class/god x light/dark (COHERENCE-SPINE build order).
