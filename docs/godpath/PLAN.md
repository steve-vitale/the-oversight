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
| Ascension = class + payoff + 4 path + deed, day 80+ (authored outcome for Unkillable; legacy proxies for nine remaining gods) | `godhood.js` (derived) + dawn check | built; gates are data levers |
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
   Current 64-seed/four-policy screen and the repaired shared Relay office
   deed are in `evidence/2026-10-15/deed-audit.md`. First authored outcome
   deed: Unkillable requires a real self-refusal of a fatal blow, then a
   later dawn alive. Canonical-person receipts survive save/load and
   succession without inheriting the predecessor's work. Nine replacements
   remain open; see `survivalist-deed-audit.md`. No Miser subclass appeared
   even in merchant runs.
2. **Finish the parity audit.** Ten god verbs now have player/villager callers
   and paid runtime proofs (`test-god-verbs-wired-20261015.js`). Reconcile all
   subclass active verbs and passive hooks too; the old blanket claim that
   villagers cannot use any new verb is no longer the current state.
   NPC Second Wind/Molt automatic activation now covers tactical, field and
   actual world damage, with personal cooldowns and truthful field survivor
   HP settlement (`survivalist-passive-audit.md`). Full active/passive and
   headless player field-contest parity audits remain open.
   Earlier panel: zero Second Wind/Molt receipts, then at Strange-kit
   positions 10/11. The offer observer confirms zero appearances in 26,733
   player/NPC kit offer appearances. The public Table-stakes policy repair
   recovers caregiver wins 15 -> 20/64 (all policies 91 -> 113/256), without
   changing entries, deaths or median game days. The earlier seed 12 was blocked
   solely by combat-only feast-use credit despite global rank and a real
   feast. Landed noncombat feast healing now earns that deed through paid,
   learned wound care, proved in runtime and phone play. The caregiver policy
   now treats visible wounds; comparisons separate that policy from the game
   rule. See `feast-healing-audit.md` for corrected 16/64-seed evidence and the
   rejected clock-confounded panel. A focused ability-access lever and broader
   NPC feast/active/passive parity remain next.
   One-entry access lever now moves Second Wind to Strange position 6.
   Natural 64 x four: 46 player / 2 NPC offer appearances, three player
   held runs, one actual fatal refusal. Wins 114 -> 115/256, deaths 252 ->
   254; Molt and Undying class remain unsampled. Audit real NPC Strange-deed
   callers next (alien-fight/integration credit gaps), not passive strength.
   See `undying-access-audit.md` for source-isolated evidence and phone choice.
   Tactical party deed credit now covers real surviving NPC actors, with
   death/absence/flee/replay/succession guards and real level-up thresholds.
   Matched 64 x four: wins 115 -> 109, deaths 254 -> 232; caregiver 22 ->
   26/64, other policies decline. Class samples 15 -> 14 (Bulwark absent).
   See `party-deeds-audit.md`; this is not blanket balance completion.
   Next verified actor gap: the real alien builder gives a 77-HP companion
   fixed 30 HP and no gear bonus fields. Fix that contract before another
   ability-strength lever. NPC integration's separate random daily counter
   still needs reconciliation, without awarding XP for presumed deeds.
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
