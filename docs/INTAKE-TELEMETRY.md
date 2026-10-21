# Food intake receipts

## Cultivated origins (2026-10-21 candidate)

New actual crop harvests also carry `gardenShares`, independently of producer
identity. Classes are ordinary, assisted, legacy and legacyAssisted. Assistance
means growth/yield magic applied to that harvested cycle; it does not identify
an intentional build or prove the magic's incremental benefit. A legacy crop
retains its actual old cycle. Current holdings and food labels never identify
the origin of already stored food. Unclassified includes other food and unknown
old origins; it must not be renamed non-garden food.

Player harvest tags actual delivered species food before the plot resets.
NPC harvest blends origins using each crop's actual rounded delivery calories.
`mergeHarvestShares` now preserves both producer and cultivated-origin maps;
partial transfers, processing, mixed recipes, carried rations and real returns
retain weighted origins and their unclassified remainder. Recipe weights are
ingredient calories, rather than item counts. Transfers are not meals.

`village.gardenIntakeTotals` version1 begins at the first new recorded meal,
without reconstructing older history. It retains cumulative physical kcal,
primary nourishment, origin classes, unclassified amounts and player/NPC roles.
The existing private eater frame and settled portions supply it through
`recordHarvestIntake`; the existing all-food totals/23 metric semantics stay
unchanged. Partial source credit follows partial consumption, refund settlement
and real bank clipping. Failed/unsupported origin versions remain unknown.

The browser's common Pack/prep action handler saves a newly completed physical
meal after its full callback returns. This includes food units, benefits,
clock/action costs and both receipt books. Refused actions do not get an
invented meal receipt. Real write failures use the existing bounded feedback
area; they do not claim durable success. Native touch tests verify stored bytes
before unload, quota failure/recovery and Continue at both phone sizes.

`scripts/lib/garden-accounting.js` reads and validates these records without
hydrating people, invoking permission/production helpers or drawing RNG.
It checks source/role conservation, preserves unknowns and reports nominal
stocks separately from edible security. The shared campaign workflow is in
GARDENS.md. Cultivated intake is a lower bound, not a whole-diet origin audit.
Its diagnostic residual is not classified waste or a complete profit estimate.

Current before/after controls strip only `**.gardenShares` and
`village.gardenIntakeTotals`, plus the existing three wall-clock fields used by
gameplayHash. Preserve old producer/intake data and every other state field.
The transport proof rejects damaged payloads/cache identities. These exclusions
do not permit hiding an unrelated game or save change.

Receipts measure **physical food eaten and primary nourishment**, not diet
quality, healing, skill knowledge, or every change to the reserve bar.
They are an instrumentation prerequisite for the unfinished Forager deed;
they do not activate that deed or tune meals. See MEASUREMENT-PLAN.md and
the dated intake-port evidence before interpreting a scorecard.

## Meaning and coverage

`usefulIntake` is cumulative nourishment divided by cumulative physical food
kcal on instrumented routes. It is a neutral **ratio**, not a target to
maximize and not bounded by 1: existing absorption modifiers can exceed 1.
A full-body meal can consume food with zero useful nourishment. A refused
meal creates no receipt. Unknown history remains unknown.

Player primary nourishment is the actual primary calorie credit after
absorption and the bank cap. The receipt excludes secondary knowledge/L3
bonuses, healing, quality changes, photosynthesis, metabolism refunds,
reserve restoration, contest wager payouts and unclassified contest deltas.
Those are not evidence that more physical food was eaten. These exclusions
mean intake is not a reconstruction of total reserve gain.

NPC daily meals use the existing health/hearth-adjusted daily food need;
personal production is eaten first, then pantry or carried rations.
Nourishment is capped at remaining need. Desperation and CAPDOOR-refused
surplus consumption are distinct routes. Generic personal production and
surplus stay anonymous: their abstraction includes more than plant harvest.
Away `packMeal` records its actual portion once; packing and `packSpend`
alone record nothing. The daily meal does not count that ration again.

Personal gifts use actual portions, rather than the fixed hunger-relief
button amount. Their useful equivalent is bounded by both consumed kcal
and the actual hunger relieved, at the existing 25 kcal/hunger convention.
This route equivalent is not an NPC reserve that the game does not have.

The feast serves equal shares of the paid draw across invited people who
showed up plus the host. Dead or fusion-cold seats receive no consumption
credit. NPC usefulness uses the existing 30-point relief and the same
25 kcal/hunger convention. **The current feast grants the host no reserve**;
the receipt reports zero host nourishment. Changing that is a separate
gameplay decision. Unconsumed cold-seat portions are not silently reassigned.

Abstract food explicitly eaten from joined/probation/visiting village pots,
alien snack/supply packages and drifting food receives anonymous receipts.
An unknown-lump experiment records only the quarter-unit swallowed; a spit
records no intake. Source fractions do not establish an entire diet's origin.

## Settlement and identities

`captureIntakeEater` reads canonical person data without hydrating people or
drawing RNG. It checks living health, and freezes original actor, role and
day before consequences or time can change the bearer. Its private WeakMap
binds it to the current state. Forged and prior-run frames cannot write.
Death after consumption does not transfer food to a successor.

The outer ration wrapper defers communal receipts until the actual refund
settles. CAPDRAW2 leftovers and ration returns retain weighted original
sources. Transfers and re-withdrawal are not another meal; eating the returned
portion is. A clipped meal may refund more than it banked: usefulness floors
at zero, without changing the existing reserve outcome. Deferred state is
transient and cleaned in `finally`.

New explicit wild/garden harvests and Genesis planting carry `harvestShares`.
Stocking, splitting, processing, donation, withdrawals and ration theft retain
weighted shares. Unknown old-save origins stay anonymous. Fungible mixed
stacks retain the anonymous fraction as well as known owners; transferring
food cannot create producer credit. Known dead producers keep their stored
food's provenance.

## Storage and observer

`village.harvestIntake` retains eight dated days of actor/source/route detail.
`village.harvestIntakeTotals` version 1 retains cumulative physical kcal,
nourishment, receipt count, first recorded day, actors, roles and routes.
The cumulative book survives delayed sampling and time skips that exceed
the diagnostic ring. It begins at the first recorded meal, not at a guessed
save creation date. Save/load retains both books.

The collector only reads these records. `intakeCoverage` reports the versioned
scope and totals, or a reason for unknown. Absent, unsupported, malformed or
inconsistent totals yield null usefulness. An unversioned historical ring
alone does not establish the metric. Historical reports retain their original
observer and unknown values; rerun both roots under the same current observer
and contract for comparisons.

## Keeping it current

For a new eating path, record actual consumed portions with an original eater
frame at settlement. Do not infer a meal from a reserve delta or record a
transfer. Use `recordHarvestIntake` or `recordHarvestDraw`; preserve source
fractions on transformations and refunds. Specify the route's nourishment
meaning here and add a real shared-harness test, including refusal/overflow
and identity behavior as applicable.

Search calorie credits and food-unit consumption when changing a meal. Classify
new credits as food, secondary bonuses, reserve transfer, non-food energy, or
unknown. An unnamed abstract grant does not acquire a food origin by default.
Current repeated proofs are `test-harvest-source.js`, `test-harvest-intake.js`
and `test-intake-contract.js`; check.js runs them automatically.

Collector/contract changes require a fresh retained neutral proof and
`balance-proof-update.js`, as described in SIMULATING.md. Paired instrumentation
controls may strip only the declared new `harvestShares`,
`village.harvestIntake` and `village.harvestIntakeTotals` fields, alongside
the existing wall-clock-only hash exclusions. Retain all other state,
outcomes and the other 22 metric values. A changed game outcome must be
investigated even when the intent was only to measure it.
