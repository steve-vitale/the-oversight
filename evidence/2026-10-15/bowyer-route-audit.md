# Fletching knowledge and maker playstyle audit

Continuation of Steve's noncombat-gear/feature-use audit. The broader
roadmap remains active. No remote push, release or version bump.

## What changed

- **A real knowledge source.** The Bowyer's Trail Notebook teaches the
  existing bow, crossbow, arrow and bolt recipes. It enters the ordinary
  book pool and the themed wild-ruin field shelf. First-search book chance
  stays 30%; the themed branch stays 50% on eligible wild ruins. There are
  now five field books. Reading consumes the physical book and two ticks;
  crafting still spends real materials, 32 ticks on success, and its usual
  risk. No weapon stats, recipe costs, yields or magic powers changed.
- **Correct ammunition decisions.** The shared gearing routine previously
  tried arrows for every dry weapon, including crossbows and energy weapons.
  It now uses the matching known/funded recipe. Consuming materials can shift
  the weapon's index; the policy now rebinds the pack and locates it again.
  Armor crafting also rebinds rather than copying into a stale pack array.
- **A maker that looks for knowledge.** It reads held books, seeks known
  ruins, then explores nearby unknown destinations without inspecting their
  biome. It uses actual travel/search/reading, every three days at most,
  early in the day, with at least 1800 kcal and 50 health. Blocked routes
  get a nine-day backoff; danger interrupts the trip. It remains the capable
  survival brain without deliberate hunts or feast fights, and still fights
  unavoidable encounters. This is not a pacifist proof.

Reasoning: another material/gear ladder would add complexity before repairing
the existing knowledge route. A found notebook fits Steve's stated knowledge
game and books-as-treasure direction. Its rarity is now measured, not assumed
to make the whole maker playstyle viable. The content choice is marked
`[needs-eyes]` for feel.

## Matched measurements

Primary: `gear-usage-bowyer-final-{before,after}-64.{json,md}`, 64 identical
seeds × 150 days, maker policy, four child processes per arm. The runtime
hash manifest differs only in `src/data/books.json` and `src/js/game.js`
(the shelf's new book ID). Policy bytes are identical. Frozen sources:
`.git/bowyer-final-before` / `.git/bowyer-final-after`. Source hashes describe
the code; a parent repository HEAD alone cannot identify frozen content.

```text
node scripts/gear-usage-audit.js --label bowyer-final-before-64 --n 64 --days 150 --par 4 --policies maker --root .git/bowyer-final-before
node scripts/gear-usage-audit.js --label bowyer-final-after-64 --n 64 --days 150 --par 4 --policies maker --root .git/bowyer-final-after
```

| Measure | Before | After |
|---|---:|---:|
| Table wins | 23/64 | 22/64 |
| Took a seat | 31/64 | 32/64 |
| Bearer deaths, including succession | 76 | 68 |
| Read books | 58 | 58 |
| Knowledge trips completed | 711 | 694 |
| Ruin search actions | 47 | 47 |
| Runs with arrow recipe L3 | 0 | 2 |
| Actual ammunition crafts | 0 | 0 |
| Runs earning personal tier-3+ gear through noncombat sources | 64 | 64 |
| Observer / recorded livelihood errors | 0 | 0 |

Noncombat sources here mean contest, show, fan package, trade or craft.
Starting gear, corpse inheritance and monster drops do not count. This is
source-of-acquisition evidence, not proof that combat never contributed to
the run's fame, defence or progression.

**No overall balance gain is established.** One extra/lost win at this
sample is not a reason to tune the economy. The notebook gives a real rare
knowledge route; it does not settle material supply or ranged policy quality.
The previous 16-seed final screen was 7 wins/11 seats in both arms and zero
notebook learners; its raw files are retained alongside the 64-seed matrix.

Earlier exploration exposed bot gaps: with no reading behavior, both bots
read zero books. A maker restricted to already-known nearby ruins read seven
books but searched only twice across 16 seeds. Those intermediate reports
are kept locally under `.git/bowyer-exploration`; they are not the final
policy comparison. Frozen intermediate policy sources remain in their
`.git/bowyer-*` directories. Do not combine their rows with the primary arm.

## Natural-run replays

`bowyer-natural-replays.json` records the two learners and matches every
recorded matrix observation except the old raw state hash (see below).

- **Seed 14:** read the notebook on day 28. No sampled arrow-material-ready
  moment. Ended with Worldbreaker Maul, earned from a contest on day 54.
- **Seed 50:** read it on day 50. Ten sampled material-ready moments, but no
  ammunition craft. Ended with Phase Blade; fan packages awarded it on days
  54 and 92.

Final gear is not proof that every earlier choice was optimal. The bot
replenishes a dry weapon only when no usable carried weapon was selected;
it can prefer a usable melee fallback instead of supplying a stronger dry
ranged weapon. A prepared test proves it can make the correct ammo and equip
after indices shift; broader ranged decision quality remains an audit item.
The two natural recipes were recorded as `via: read` with the notebook's
name, rather than inferred from an arbitrary knowledge gain.

## Proof, browser and verification

- `scripts/test-bowyer-route-20261015.js`: 22 assertions through the shared
  harness. Real wild-ruin search yields the book under a controlled shelf
  roll; first-search gate and 64 ticks hold. Maker reads it for two ticks,
  all four recipes become L3, book leaves pack, unknown crafting refuses.
  The real gearing policy crafts both ammunition types, pays materials,
  equips after indices shift, avoids unknown/unfunded/energy-arrow attempts,
  explores fog without selecting its hidden ruin and prioritizes known ruins.
  The test also validates unique book IDs and all four recipe references.
- Phone browser (390×844): prepared a physical notebook/material pack with
  those four recipes unknown. The real Pack showed Read but no corresponding
  recipes. Clicking Read consumed it, spent two ticks and revealed all four
  Make rows. Clicking Make for bolts produced five bolts and spent 32 ticks.
  `bowyer-recipes-phone.png` shows the actual recipe rows. Browser acquisition
  was prepared; ordinary acquisition is supported separately by the public
  ruin-search proof and two natural 150-day simulations.
- Temporary local server stopped, test tab closed and viewport restored.
- Legacy `test-social-pool-expansion.js` once missed the cautious justice
  line in sixteen random samples. The fixture now sweeps quantile rolls
  over the eligible pool; all 32 assertions remain, with no runtime change.

Final commands/counts and hashes are in `bowyer-route-validation.json`.

## Audit hash correction

Replaying the two natural cases reproduced all recorded outcomes, knowledge
samples, acquisitions and errors, but the old raw state hashes differed.
Inspection found wall-clock diagnostics: the old hash excluded `lastTs`
but retained real minutes-per-day and their total. Machine load can change
those independently of game decisions.

Hash normalization version 2 now excludes exactly `pacing.lastTs`,
`pacing.dayMinutes` and `pacing.totalMin`. Gameplay and telemetry remain;
unknown/future pacing fields remain. Four new assertions plus the existing
100-day observer-on/off proof verify this contract (14 assertions total).
Repeated seed-14 replay snapshots match under the normalized hash.

The primary matrices above were captured **before** this tooling correction.
Their raw hashes are legacy diagnostics, not proof of full-state replay
identity or gameplay divergence. Their matching source manifests, observed
outcomes and actual acquisitions remain separate evidence. The two replay
records retain this caveat; no old hash was rewritten or presented as equal.

## What remains

1. Material acquisition and better ranged choices: knowledge alone did not
   cause natural ammo production. Do not remove knowledge gates or raise
   success rates to hide a bot behavior gap.
2. Maker/knowledge-focused advanced rewards and the underused preservation,
   pemmican, storage, armory, peer trade, party and titan/Network routes.
   All 64 makers got noncombat good gear, but that does not prove each
   system contributes distinct useful play.
3. Broader roadmap recheck: `validate-regions.js` still reports one playable
   region out of twenty (zero schema errors); `validate-table-endings.js
   --todo` reports 6/70 codas filled, leaving 64. God-verb recovery is now
   acknowledged in the roadmap; every promised scale effect is not yet proven.
4. The existing general `validate-data.js` issue remains on the roadmap.
   The new book's identities and recipe references are covered by the
   dedicated proof; this does not claim the broken general validator passed.
