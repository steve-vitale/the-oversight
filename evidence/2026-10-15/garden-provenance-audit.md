# Living Garden: establish who actually fed whom

The next authored deed is the roadmap's Living Garden outcome: feed the
whole village from your own harvest for seven days. This audit identifies
the missing receipts before replacing its current synergy/class-age proxy.
No gate, yield, food cost, ability or reward changed in this audit.

## Real resource-path probe

`node scripts/godpath/probe-garden-provenance.js` uses the shared seeded
game harness. It prepares a ripe known plot, empty stores and a hungry
wounded diner, then executes actual `harvestGarden`, `donateToPantry`, NPC
`resolveOneAssignment(..., {task: 'garden'})`, `pantryDraw` and
`villagerMealDay`. Production, cooking, meal rhythms, spoilage and physical
food deductions remain enabled. Two independent seed-7 runs match exactly.
Source/probe SHA-256 hashes and full receipts are in `garden-provenance.json`.
These are prepared path diagnostics, not natural access or seven-day proof.

- The player harvest produces 167 dandelion portions at 45 kcal: 7,515 kcal.
  The donation preserves that stack. A real floor-rounded pantry draw
  consumes 22 portions, 990 kcal, rather than manufacturing 1,000 kcal.
- The NPC garden duty produces 4,200 kcal as physical 500-kcal pieces plus
  a 200-kcal remainder. Its 1,000-kcal request consumes only 700 kcal:
  200 plus 500, then the floor-rounded draw leaves the next whole piece.
- A subsequent actual NPC meal draws another 1,000 kcal and includes
  340.0478565 kcal from the diner's own daily work. Hunger goes 60 -> 33.
  The full 1,340.0478565 kcal cannot be credited to the pantry harvester.
- Neither actual player nor NPC harvest stack identifies its harvester.
  Donation's `v.gives` records contributions, not their source or who ate
  them. It cannot prove this deed.

## Implementation boundaries established by the audit

The resource path has to retain canonical-person harvest provenance before
the god gate can read it. Player `harvestGarden` and NPC garden duty are
different producers: the former makes plant stacks in the pack; the latter
calls `stockPantry(kcal, 'Garden harvest')`. Both need truthful receipts.
Generic stocking, trade, aid, hunting and donations of untraced legacy food
cannot be inferred to be that person's harvest.
The crop probe is not the whole Forager path: reconcile real wild-plant
foraging (`foodForageItem` and the NPC forage-duty stocking caller) as well.
Preserve identity when an initially unknown harvest becomes known edible
food. Do not silently make the Feaster depend exclusively on garden duty.

`pantryDraw` already returns physical `{item, units, effectiveKcal, cooked}`
receipts, but does not know the eater. Counting the draw alone would also
miscount pack withdrawals, transfers or feast payments as meals. Eater
credit belongs at actual meal resolution: `villageMeal` for the player,
`villagerMealDay` for NPCs, with away/personal meals reconciled rather than
silently treating every roster member as a Haven diner. Personal gifts
through the live `carexplore.js` override also need consumption/source
accounting; a hunger reduction alone cannot prove a whole day's food.
`villagerMealDay`
also includes separate personal production; its aggregate `ate` cannot
substitute for consumed harvest receipts.

`food.js`'s fungibility gate compares food/safety/spoilage properties and
currently has no producer comparison. Adding provenance without reconciling
stack merging would lose or launder ownership. Preserve that source through
cooking/preservation, whole-unit moves, donation/take-back and succession;
do not credit a cook with someone else's harvest. Check mixed ingredients
and changed effective calories explicitly. Avoid changing which food the
meal selects merely to make a measurement easier.

Seven days must be distinct actual feeding days, with the living village's
real mouths and food requirements measured at those meals. Repeated taps,
donation/take-back, healthy Long Table uses, gardening XP and merely holding
a class cannot advance the outcome. State survives save/load and follows
the person when the bearer changes. Keep the known-class objective and
player/NPC gate the same. Test failed/partial days and a changing roster,
then compare natural matched 16/64-seed campaigns against the current
`alien-party-after-64.json.gz` baseline. The prepared probe does not establish
the intended seven-day target's attainability; measure food production,
storage and consumption before tuning it.

The nine remaining authored deeds, including this one, remain unfinished.

Validation: sequential quick **149/149** and full **921/921** pass. Initial
overlapping suite runs each failed the nested food-power ontology check
(148/149 and 920/921); direct ontology and food-power checks then passed,
followed by the clean sequential suites. No assertion was weakened or
quarantined. The initial failure's cause was not established. There is no
generated ontology diff. The new probe also passes its nonempty actual-path
guards and produces identical evidence on two independent runs. No runtime
change, balance panel, browser UI change, deployment or service-worker bump.
