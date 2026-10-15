# Hide handling, earned recipe discovery and maker experimentation

Continuation of Steve's playstyle-viability audit. This connects an existing
earned knowledge path to real material handling, then measures a maker using
it. It adds no recipe, mastery grant, armor power, reward or success-odds buff.

## Existing rule and missing connections

The current `noteHideHandled` rule already teaches hide armor **L1** when a hide
reaches your hands. L1 is an outline: its ingredient list stays hidden and a
blind attempt has base 35% success. A real successful blind `craft` teaches L2;
L2 knows the materials and has the ordinary 85% base chance. These rules remain.

The handling hook recognized only `plantId: animal_hide`, the corpse-loot shape.
Butcher byproducts are `material: hide` and ordinary counter pickup never called
the hook. Correctly leaving parts on a counter therefore broke their discovery
path. The hook now accepts positive finite actual hide in either representation,
and is invoked for real counter pickup, direct pack butchering (self or actual
specialist), and ordinary `addMaterial` acquisitions such as a communal take.
Untouched counter stock grants nothing. Repeated handling does not promote
knowledge or rewrite an already learned outline. Empty/nonfinite hides and
unrelated parts grant nothing.

The stricter positive-stock rule initially exposed a handoff defect: corpse loot
zeroes/decrements its source before calling the lesson. Both current stack and
legacy one-unit loot now report the quantity **actually transferred**, retaining
the old earned discovery. Legacy unit-less one-unit loot also now decrements
from one to zero instead of becoming NaN and remaining repeatable. The current
range, carry, trauma, ownership and loot rules are otherwise unchanged.

## Maker fieldwork, without a hidden-ingredient lookup

The maker may handle up to two spare visible hides at the existing camp counter,
using the real paid pickup. It can attempt the actually earned L1 outline with
visible lashing supplies, at most once every three days, with meal/time reserves
and interruption/bearer-change guards. "Two panels plus lashing" is an explicit
bot guess; lashing can be vine, fiber or cloth. The L1 branch never reads the
hidden recipe.materials. A wrong guess gets the same blind refusal as a human,
keeps its stock and does not reveal the missing ingredient list. Once L2 is
actually earned, the prior known-recipe routine can use known requirements.

This is a bounded strategy under test, not a new game rule or evidence that
blind crafting maximizes wins. The strategy's cadence/guess quality is marked
needs-eyes. Real failed funded crafts risk materials; missing-material probes
and funded risky rolls are not the same thing. This pass does not change the
existing craft failure/time rules.

## Public runtime proofs

`test-hide-discovery-20261015.js`: **23 pass**, one seeded shared Game. The exact
final script against frozen source gives **11 pass / 12 fail**. It covers actual
counter pickup, communal withdrawal, self/specialist pack butchering, actual
per-stack and batch corpse APIs plus the older one-unit API, idempotence,
empty/nonfinite/irrelevant stock, legacy singleton conservation, L1 trial
consumption/conditional L2 learning, and real maker wrong-guess/cooldown behavior.
No success roll is replaced. Independent fixtures prevent an earlier invalid
lesson from making a later handling test pass accidentally.

The first full suite caught the corpse-handoff regression; it was repaired
before accepting the comparison. The original `proof-armor-recruit-20261013.js`
now passes **51/51** unchanged assertions, including both old hide-loot lessons.
Intermediate source screens containing the broken handoff are superseded by
the final frozen-source reports linked below.

390×844 actual phone, explicit prepared carcasses, knife, vine and cleaning
competence, **no hide-armor recipe grant**:
1. Clean both carcasses at the counter: 16 ticks, hides still on the counter,
   recipe L0.
2. Pick up hides: 4 ticks. Actual handling narration teaches L1. The real Craft
   row says "materials unknown — bring your best guess" / "Try blind (35%)".
3. The first actual blind trial succeeds without rerolls or changed odds: 32
   ticks, real hides/vine consumed, real armor produced, recipe L2. The row now
   lists known requirements and Try (85%).
4. Wear the real armor; You shows Hide armor in Torso. Total 52 ticks. See
   `hide-discovery-phone.png`, with actual equipment/narration and L2 proof.

This is a prepared action/learning playtest, not naturally acquired carcasses
or a victory. The single successful phone roll is not a success-rate estimate.

## Matched natural evidence

64 maker seeds × 150 days per arm, standard `gear-usage-audit` driver on frozen
source from HEAD `c8185050`. Final manifests differ only in corpses.js, food.js,
storage.js and livelihood.js; competent policy bytes are unchanged. The arms
combine the runtime handling repair and the new maker behavior, so their
aggregate effect is not attributable to one callback alone.

| Measure | Before | After |
|---|---:|---:|
| Runs reaching hide armor L1+ | 3/64 | 42/64 |
| Runs reaching L2+ | 0/64 | 13/64 |
| Successful hide armor crafts | 0 | 18 |
| Public hide-armor craft calls | 0 | 90 |
| Maker L1 trial calls / successes | 0 / 0 | 85 / 13 |
| Counter pickup calls | 0 | 245 |
| Counter hide units actually collected for fieldwork | 0 | 117 |
| Earned personal noncombat tier-3+ gear runs | 64/64 | 64/64 |
| Table seats | 31/64 | 32/64 |
| Table wins | 21/64 | 19/64 |
| Bearer deaths | 53 | 56 |
| Observer / livelihood errors | 0 / 0 | 0 / 0 |

Calls include missing-material guesses and refused pickups; they are not all
successful transfers or funded craft rolls. Knowledge samples include successor
bearers and can miss transitions between samples. **24/64 final state hashes
match**. Real crafting/learning now occurs, but these results establish **no
survival improvement**. Ordinary defence and unavoidable combat remain; these
are non-hunting livelihoods, not pacifist or crafting-only wins.

A separate unchanged-capable 16-seed control on each source shows L1 discovery
0→9 runs, no hide crafts/L2, and unchanged wins/seats **14/16**, bearer deaths
**20** each arm. Seven final hashes match; the others include new knowledge.
Its maker-only strategy code is not invoked, so this control exposes the runtime
handling bridge without introducing the maker experiment to the capable policy.
It is a small control screen, not a global balance guarantee.

Data: `gear-usage-hide-discovery-{before,after}-64.{json,md}` and
`gear-usage-hide-control-{before,after}-16.{json,md}`. Next audit strategy/use
rather than granting mastery or increasing gear stats to hit a target. Existing
ammo knowledge/material sparsity, other underused routes and the remaining
roadmap are still open.

Validation: **129 quick scripts pass** (41 seconds), **901 full scripts pass**
(179 seconds), zero failures. No remote push, release or service-worker bump.
