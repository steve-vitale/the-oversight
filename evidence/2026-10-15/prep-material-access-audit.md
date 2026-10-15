# Prep-counter materials: restore the deliberate crafting path

Steve's playstyle/unused-feature audit continues from the seed-5 counter trace.
This repairs a real access defect; it does not add recipes, grant knowledge,
change armor power or establish natural crafting viability.

## The broken connection

`carcassToMeat` deliberately leaves hide/bone/byproducts in the carcass's source
container. Homecoming stages unprocessed player hauls on `scholar.prepStash`;
cleaning them there correctly leaves their parts there. `craft` checks the
carried inventory. The counter offered no material pickup action, and "Put
away finished food" cannot move zero-calorie materials. Hides therefore sat on
the counter while the existing hide-armor recipe required two carried hides.
The current recipe list uses hide for hide armor; bone has no current recipe.
A pile of bone is not evidence for an advanced crafting ladder requirement.

## Repair and bounds

Public `takePrepMaterial(idx, qty)` deliberately moves a selected material batch
from the existing camp counter into the pack, spending **2 ticks**. It takes
only what fits the existing pack weight/capacity calculation, including water;
partial takes leave the exact remainder. Metadata is copied with the units,
rather than rebuilt through the narrower material-definition table (which does
not include every animal part). No ingredient disappears or appears for free.

It refuses ordinary wilderness access, combat, a finished run, nonmaterials,
bonded/keepsake items, empty/nonfinite stock and invalid requested quantities.
Legacy unit-less singleton stock becomes one real unit. The existing personal
camp counter also works. This is retrieval of selected counter stock, not a
communal deposit: it grants no contribution trust or stash ledger credit. The
separate public communal Stash action retains its existing rules. Butchering
still leaves parts on the counter until the player chooses to collect them.

The actual counter row says "crafting material — take to pack" and exposes
**Take to pack (2 ticks)**, with actual engine narration for success/refusal.
The maker's `make` routine can fetch only missing material units for one known
L2+ gear recipe whose other requirements are already funded by carried/counter
stock. It uses the public action, rebinds live indices after array changes,
keeps a meal/time reserve, stops on interruptions/bearer changes, and tries
collection at most once per day. It neither learns nor invents a recipe.

## Proof before claim

`test-prep-material-access-20261015.js`: **18 pass** on one seeded shared Game.
The identical final script on frozen pre-change source gives **9 pass / 9 fail**.
The missing method's no-op controls do not claim pre-change negative guards:
the positive pickup/craft/equip/UI/private-camp cases demonstrate the missing
connection, while the repaired runtime exercises both positive and refusal
paths. Actual generated animal definitions supply the butcher byproducts.

Explicit fixtures provide two carcasses, a knife, vine and L3 recipe knowledge.
Public cleaning produces the hides on the counter; two real pickups pay four
ticks; public craft consumes two hide + vine; public equip wears the result.
Other fixtures prove water-aware partial pickup, exact metadata, full-pack and
bad-stock refusal, legacy singleton handling, combat/finished-run bounds, and
the actual maker entry collecting exactly two needed units before crafting.
These fixtures prove access, not earned recipe knowledge or a played victory.

390×844 actual browser: real Pack counter controls **Clean it yourself** twice
(16 ticks), two hide-row **Take to pack** actions (4), known Hide armor **Make**
(32), **Wear**, then the actual You equipment view reports Hide armor in Torso.
Total **52 paid ticks**. The remaining meat/bone stays on the counter, hide and
vine are consumed by the existing recipe. `prep-material-phone.png` shows the
actual equip narration and paid route. No HP/enemy/win outcome was forced.

## Matched natural screen: knowledge still binds

`gear-usage-audit.js --n 64 --policies maker --days 150 --par 4`, same observer
on frozen before/after trees from HEAD `d70865f7`, exact unchanged competent
policy bytes. Source manifests differ only in app.js, food.js and livelihood.js.
The baseline is the post-armory/post-counter-preservation state, not an older
reward economy. The baseline observer's missing `takePrepMaterial` hook is the
expected absence of the not-yet-implemented public method, not a runtime error.

| Measure | Before | After |
|---|---:|---:|
| Table wins | 21/64 | 21/64 |
| Table seats | 31/64 | 31/64 |
| Hide-armor recipe known at L2+ | 0/64 | 0/64 |
| Hide armor successfully crafted | 0 | 0 |
| Public counter-material pickups | 0 | 0 |
| Observer errors | 0 | 0 |

**64/64 final gameplay hashes match**. Data:
`gear-usage-prep-material-{before,after}-64.{json,md}`. This establishes no
regression in these runs, not a survival gain or a naturally used crafting route.
All tested makers lack the recipe knowledge required by this particular use of
hides. Audit how basic gear recipes are actually seen, read and taught in play
before changing knowledge access; do not silently grant a recipe to make a bot
metric move. The broader roadmap, other sharing routes, class/job/region balance
and natural endgame campaigns remain open.

Validation: **128 quick scripts pass** (49 seconds), **900 full scripts pass**
(197 seconds), zero failures. `validate-ontology.js`: all **111 systems** validate,
including the new public method; its generated ontology document is included.
No recipe/stat/reward changes, remote push, service-worker bump or release.
