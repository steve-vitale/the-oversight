# Ammunition upgrade policy and maker coverage — 2026-10-15

The bowyer audit left a specific gap: a maker could know the arrow recipe,
hold materials and a bow, yet never craft ammunition. The shared gearing
policy only replenished a dry weapon when there was **no usable packed
weapon**. A weaker knife blocked a better bow. It also ignored better worn
gear when comparing pack candidates, so later calls could re-equip the knife.

## Change and limits

`competent.gearUp` now compares usable weapons across worn slots and pack,
using its existing base-bonus heuristic. It considers a funded, known ammo
recipe when it would make a stronger owned weapon usable. An unfunded
energy weapon cannot hide a funded bow upgrade. It also replenishes an
already worn dry bow, rather than looking only in the pack.

Crafting still uses the actual recipe, materials, risk and 32 ticks. After
crafting, candidates and indices are read again. A changed bearer or ended
game stops the old actor's gearing. No ammunition is crafted in combat.
Unknown recipes, missing supplies, zero-unit weapons and stronger usable
equipment do not cause wasteful ammunition work.

The game reads melee before ranged. To actually use its chosen stronger bow,
the bot uses the existing public Take off action for the weaker melee blocker,
keeping that weapon in the pack. The next gearing pass includes the worn bow
in its comparison and does not re-equip the weaker knife. Legacy weapon slots
participate too. No player UI, weapon statistic, recipe, reward or item power
changed. This is not a claim that base bonus is an optimal combat strategy.

## Prepared proof

`test-ammo-upgrade-policy-20261015.js`: **22 pass, zero fail**. Frozen parent
`53e9bbc3`: 5 pass / 17 fail. With explicit knowledge/material fixtures,
both bow and crossbow pay materials/time, become the active weapon, retain
the fallback, survive a repeated gearing pass, fire actual crafted ammunition
through the real strike path, and refill while worn. Other assertions retain
stronger worn/legacy gear, reject unknown/unfunded/zero-unit opportunities,
and prevent in-combat crafting. No forced combat victory is used as evidence.
Existing bowyer-route and crafted-ammunition proofs both pass (22 each).

## 64 matching seeds × capable and maker

Primary reports: `gear-usage-ammo-upgrade-{before,after}-64.{json,md}`.
Same standard driver, 64 seeds per policy, 150 days. Both frozen trees start
from the same archive; only `scripts/policies/competent.js` differs in their
complete source hash manifests. No prepared grants in these runs. The census
excludes starting gear and inheritance/corpses from noncombat reward counts.

| Measure | Capable before → after | Maker before → after |
|---|---:|---:|
| Table wins /64 | 45 → 46 | 19 → 20 |
| Seats /64 | 58 → 57 | 28 → 31 |
| Bearer deaths, including succession | 72 → 80 | 55 → 51 |
| Actual arrow/bolt crafts | 0 → 0 | 0 → 0 |
| Runs with arrow recipe L3 | 0 → 0 | 2 → 1 |
| Personally earned noncombat tier-3+ gear /64 | 64 → 64 | 64 → 64 |
| Observer errors | 0 → 0 | 0 → 0 |

The fix does **not** establish a survival or win-rate improvement. Capable's
additional deaths remain a watch item; one extra Table win is not evidence
of better overall balance. Makers retain actual contest/show/package/trade/
craft reward access without deliberate hunts, but these are not pacifists.
More correct gearing still does not make a natural ammunition career common.

The remaining after-maker L3 learner (seed 14) has no sampled material-ready
arrow/bolt moments. The old seed-50 learner had ten such samples, but its
new trajectory never learns the recipe. Read books, inventory and succession
change with the run; do not hold the old acquisition sequence fixed by fiat.

## Neutral natural-run diagnosis

`ammo-upgrade-natural-replay-50.json` uses the standard sweep driver and
read-only observations. Both final gameplay hashes match their corresponding
matrix rows. The old run knows arrows at L3 on days 50–52, carries a bow,
has 11–12 sticks, 2 stone and 1 fiber, yet its active weapon is the stone
knife. This reproduces the policy defect in natural play. The new run wins
on day 123 without learning that recipe. That changed course does not prove
natural ammunition use has been repaired.

An initial exploratory replay wrapper modified the policy object it was
trying to observe and failed the hash comparison. Its output was discarded.
The corrected wrapper clones the original policy before adding observations;
only verified replays are included in the evidence file.

## Verification

Quick: **122 scripts pass, zero fail (43 seconds)**. Final full suite:
**894 pass, zero fail (147 seconds)**. The first full run passed 893/894,
with an unrelated legacy creek test that stripped Swimming from old ability
arrays but left the migrated codex skill. Its fixture now explicitly inserts
and recognizes Swimming, strips both old arrays and codex skill, and asserts
the non-swimmer condition. All old travel assertions remain. The final
strengthened fixture passes 15 assertions separately; no travel runtime changed.

Reproduce the natural comparison:
`node scripts/gear-usage-audit.js --label ammo-upgrade-before-64 --n 64 --days 150 --par 4 --policies capable,maker --root .git/ammo-upgrade-before`
and the same command with `after` in both label and root. Hashes identify the
frozen bytes; a parent checkout HEAD alone is not a frozen-content identity.

## Next

Natural knowledge/material access and the maker's practical supply choices
remain open; do not add a magical crafting ladder to force an ammo count.
The earlier maker census already used preservation in four runs, while
pemmican/storage/armory/peer trade remained unvisited. Zero calls alone do
not establish weakness.

A separate public-API storage probe found a location gap: from map (0,0),
`playerAtHaven()` false, `expandStorage()` still spends 10 branch/6 stone/4
vine and raises Haven's tier 0→1 and cap 120,000→180,000. This is explicit
prepared-state API evidence, not proof the normal phone UI exposes remote
building. Repair/prove storage location and specialist knowledge behavior
before adding storage policy use, then continue preservation/pemmican and
the other roadmap playstyles/content.
