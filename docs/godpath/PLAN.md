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

## What's left (reconciled 2026-10-15)

1. **Fitting ascension deeds and current gate measurements.** The historical
   all-on 0/16 result predates the class-held-for-10-days bridge and wider
   offers. Current rules still use that placeholder; replace it with fitting
   deeds and measure the full gates with 64 matched seeds. See ROADMAP item 3.
2. **Finish the parity audit.** Ten god verbs now have player/villager callers
   and paid runtime proofs (`test-god-verbs-wired-20261015.js`). Reconcile all
   subclass active verbs and passive hooks too; the old blanket claim that
   villagers cannot use any new verb is no longer the current state.
3. **Subclass access and job balance.** Initial 6/20 coverage rose to 10/20
   after the documented job lean and offer window. Measure the remaining
   classes and jobs before another lever; survival targets are flexible.
4. **Finish god.scale reconciliation.** Party/titan effects are partly wired;
   compare every promised contest/army/party/titan effect with actual callers
   and prove remaining gaps. Do not treat all design text as already working.
5. **Done: Table build codas.** All 70 light/dark codas are authored and
   reachable; the Table sheet handoff and final-screen rendering are wired.
   Prepared 595-case/70-choice proofs, actual mobile play and matched natural
   screens are in `evidence/2026-10-15/coda-audit.md`. Optional bespoke path
   beats/overrides remain optional; narrative feel needs Steve's eyes.
