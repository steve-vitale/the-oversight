# Finished counter food can travel — 2026-10-16

The native Pack sheet exposed materials pickup but no finished-food pickup.
A player who staged an opaque harvest, sorted/shelled it on the counter and
wanted travel rations had to donate it and withdraw from the communal pantry.
That introduced contribution/access/return penalties into moving private food.
This is a real missing public route, distinct from the prior gift-credit repair.

`takePrepFood(index, quantity?)` now moves an actual finished, nonbonded batch
from the player's prep counter to their pack at camp. The native per-entry
button says **Pack food (2 ticks)**. Two ticks matches the existing material
pickup convention; one deliberate batch action, not repeated unit taps. Actual
capacity includes water and carry-weight modifiers. A requested quantity or
limited room leaves the remainder on the counter. Calories, source shares,
spoilage and risk metadata survive. This move creates no pantry stock, gifts,
withdrawals, trust, skill practice or harvest-consumption credit. Packing is
not eating; it does not extend shelf life or cure unsafe food.

Unknown/unfinished/inedible food, materials, bonded items, explicit empty or
nonfinite stocks, invalid requests, a full pack, wilderness, finished runs and
live combat cannot use the route. Camp access is the existing private counter
rule, not a new communal-store privilege. NPC personal production/diet models
are unchanged; the repair grants the player no new food or progression.

## Proof and measurement

Base `bd5e2570d24e7a65be3f8fc44f63d82ef3763d74`. The focused shared-kit test
was RED on that source:13 pass/13 fail, including the missing public method,
native renderer/handler, transfer, partial weight, save/load and actual shelling
route. It passes26/26 on the candidate and on an independent reconstructed
root. One shared Game per process; real Map localStorage and explicit save key.
The focused test also proves modified incremental carry weight with actual
Hollow Bones, rather than comparing against a different unmodified weight.

Native390x844 proof runs the real Pack renderer and its real handlers. A clearly
prepared saved expedition resumes with10 nuts on the counter, known identity
and an empty pack. **Shell them** spends4 ticks; **Pack food** spends2. The
normal HUD then shows1500 physical kcal/1kg carried, counter clear, pantry
10000 unchanged, gives/takes0 and trust20. True save/load returns true/true and
retains the actual shelled batch/provenance. The item's calorie label remains
unknown without calorie knowledge; the proof does not grant that knowledge.
Prepared harvest/day/knowledge is not evidence of natural acquisition or army
completion. The fixture is only setup and a readout: it does not replace the
native pickup control with a helper button.

Two210-entry source manifests differ only in food.js and app.js. The collector,
contract, harness, Node/flags and every policy remain identical. The baseline
is reused exactly from counter-gift-after-screen/holdout:328 prior workers,
not new experiments. Those immutable original report/jobs paths and hashes are
pinned in this unit's receipt. Candidate standard16 per four policies and
10001..10064 disjoint per-policy holdout run150 driver iterations with actual
observer-off controls. No policy invokes the new route in this unit; natural
policy uptake is a separate next experiment. Do not infer a survival benefit
from prepared access or replace the default strategy based on it.

The retained reports and scorecards include all23 metrics and actual censored
denominators. All320 before/after campaign rows, full observer payloads and
complete gameplay hashes match exactly. Both comparisons are no_material_signal;
this is observed equality for these policies/seeds, not a claim of universal
equivalence or natural route usage. No win-rate target, Table/army price,
exile, gift accounting, food yield or region/nomad tuning accompanies it.

Final validation: quick190/190, full962/962; ontology111 valid. Both public
renderer/handler callers are present. The food module's pre-existing unwired
villageHasSpecialty warning remains separate; the new method is wired.
Independent reconstructed caregiver7 matches its entire150-iteration balanced
row/state hash. Cached screen resume reuses all68 jobs without changing rows.

Two initial Windows check attempts failed legacy shell-dependent tests: first
`grep` was absent, then cmd.exe misparsed POSIX grep quoting/pipes. Those are
retained environment failures, not quarantined game tests. With Git's usr/bin
on the process PATH and ComSpec set to its bash.exe, the unchanged quick/full
suite passes. Two already-running full attempts were explicitly interrupted
before the corrected final run; their incomplete logs are not green receipts.
The individual legacy ability-evolution test also passes26 assertions under
that same shell setup. No runtime or assertion change was made for these errors.

## Reproduce / upkeep

```text
node evidence/2026-10-16/prep-food-reconstruct.cjs after <fresh-root>
node <fresh-root>/scripts/godpath/test-prep-food-pickup.js
node <fresh-root>/scripts/balance-panel.js --root <fresh-root> --n 16 --days 150 --par 4 --out <fresh-output>
node evidence/2026-10-16/prep-food-verify.cjs --current
```

Use the retained holdout's explicit seed list for its rerun. Re-running with the
same output directory resumes source-keyed jobs. `before` reconstruction
includes the same new focused fixture as validation tooling, and deliberately
fails its13 missing-route assertions. Keep that RED evidence; it is not a
supported finished implementation. The receipt verifies artifacts, exact
baseline reuse, caches, all23-metric comparisons, independent reconstruction
and native/save proof. Omit --current for historical verification on a later
source. check.js automatically discovers the new26-assertion test.

Next: make a separately named, public-action campaign preference that packs
finished counter food when building its known physical army reserve, measures
what actually remains carried after ordinary survival/donation, and preserves
community food needs. Compare it to unchanged campaigner-preparer with the
same observer and disjoint holdout. Do not claim zero campaign use is fixed
until actual calls/fights/completions occur. Natural Finale/Network, seven
fitting deeds and the pending Garden/reactor decisions remain open. Muse's
regional/nomad work is separate.
