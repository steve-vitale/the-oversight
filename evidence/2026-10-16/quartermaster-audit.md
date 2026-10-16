# Retained physical campaign rations — 2026-10-16

Retain `campaigner-quartermaster` as an explicitly named experimental strategy,
not a replacement default. It uses the newly published native counter pickup
for real processed food toward the current person's known, unfinished army
plan. The existing two-day nominal village reserve still governs retention;
ordinary survival, gift/take costs, paid processing, travel, kit, army upkeep
and Table rules stay fixed. This closes a measured usage gap and produces one
natural Herald victory, but does not establish balanced army funding or a
natural Finale/Network completion.

## What is measured

The published campaigner-preparer remains behaviorally unchanged. Its helper
accepts an optional retainKcal; absent that option it follows the existing
shell/stage/sort/shell/shelve route. The new strategy passes the inherited
campaign-rations reserve result, only for the current person's plan. It calls
`takePrepFood(index)` exactly as the native whole-batch button does, without
using the API's quantity argument. Once the target is reached, remaining safe
finished counter food goes to the pantry. Full-pack refusal creates no pickup;
unsafe bulk neighbors retain the old cautious refusal. Per-person/day work
budgets, low food/health/late-day/encounter guards and the public general-
knowledge sorter preference remain. Packing creates neither gift credit nor
consumption; later ordinary donations still use the existing reserve callback.

Base: abfc6d33deb184f0b0d04c40697a49b58a5b94d8. One frozen211-entry source
contains both strategies. Only campaign-preparer.js, new campaign-quartermaster.js
and sweep-compare.js differ from the base manifest. No Game/data/collector change.
No policy/source identity is relabeled to obtain a Game-only balance verdict.

Same-source240-driver-iteration cohorts:16 matched seeds per named strategy,
then disjoint10001..10064. Raw standard rows, all23 metrics, denominators,
observer-off/ordinary-driver controls and source/Node/flag identities remain.
There are168 new named cohort/control workers (36 screen,132 holdout), plus68
new standard compatibility workers:236 new retained executions in total.
Previously published reports are references for exact behavior compatibility,
not additional independent worlds or substituted new workers. All80 unchanged
preparer cases match their earlier rawRow, whole balanced payload, full gameplay
hash, counters and blockages; all64 standard-policy rows/observations/hashes
also match. Those source differences are explicit compatibility checks, not
same-Game balance comparisons across unrelated manifests.

## Results: preparer -> quartermaster

| Outcome |16-screen |64-disjoint |
| --- | ---: | ---: |
| Table wins |10 ->11 |49 ->46 |
| Table entries |11 ->11 |50 ->47 |
| Table invitations |15 ->15 |56 ->56 |
| National access |15 ->15 |53 ->53 |
| Player deaths |28 ->26 |105 ->104 |
| Community losses |5 ->5 |13 ->16 |
| Named-class access |11 ->12 |44 ->44 |
| Earned T3+ weapon/armor |16 ->16 |63 ->63 |
| Contest/show T3+ weapon/armor |16 ->16 |57 ->57 |
| New counter pickups |0 ->37 |0 ->56 |
| Physical kcal newly packed |0 ->59700 |0 ->84885 |
| Runs making a real call to arms |0 ->1 |0 ->1 |
| Recorded campaign fights/wins |0 ->0 |0 ->1/1 |

Both comparisons require review. Screen win gains cannot cancel holdout lost
Table access/community warnings; holdout fewer deaths does not cancel them
either. First-bearer survival, NPC access, food/water/HP distress, population
and actual censored pair counts are in the scorecards. Craft/trade T3+ access
remains zero sampled usage, not proof those routes are weak or impossible.
These are mixed strategies, not certified peaceful/pacifist viability.

Every changed full gameplay hash is replayed, regardless of metric direction:
six screen and15 holdout pairs. Plans retain14+32=46 source-matched diagnostic
receipts, including observer-on/off controls. They are conditional traces,
not new independent worlds. Actual full state and whole balanced payloads
match the original cases, with zero warnings/truncation. The first draft probe
sampled upkeep as well as daily, violating the original observer cadence; its
failed equality log is retained. The corrected probe samples only the original
daily cadence and passes full equality. The original collector was not changed.

## What the natural traces establish

**Seed2 screen:** on day65 the new route packs seven existing safe finished
counter batches, reaching12990kcal. The strategy calls against the Herald's
ten-blade minimum/12400kcal target, but17 real volunteers answer. Its target
then rises to19400. There is one sortie and no recorded campaign fight;
travel/ordinary encounters and the next dawn intervene. Day66 muster upkeep
takes the12990 pack to0. Later production/pickup is insufficient to sustain
that force. This is evidence of the bot budgeting the entry minimum before
learning its actual recruitment size, not a reason to lower1000kcal/blade/day
or waive food. Packed lifetime kcal is not simultaneous spendable reserve.

**Seed10062 holdout:** day90 real `startCombat('herald')` creates an882HP
Herald and18 named allied fighters. Actual `tbEnd('won')` occurs on round22;
the Herald has -1HP, one ally has died, another has1HP and another18HP.
The ordinary settlement records slain.herald=true and clears the fight mark.
An independent full source reconstruction reproduces the complete case.
This is a real natural coalition victory; prepared acquisition/HP/kit grants
were not used. It is not a full Finale/Network march or proof the strategy's
broader tradeoff is good.

**Telemetry interpretation:** the campaign CLI's `campaignFights` number sums
the policy's explicit-approach campaignFightsStarted counter, which is absent
when movement itself starts a fight. In10062 it prints0 while the report's
actual `fights` has the day90 Herald entry and `resolved` has its victory.
Use those actual runtime receipts, not the convenience counter, for coverage.
The raw collector correctly recorded the fight; neither a fake victory nor an
NPC solo kill is established. Keep this known summary limitation in workflow
instructions; do not silently rewrite the frozen collector or its identity.

The three lost holdout wins are10003/10042/10054. All end in community loss
without reaching the Table; their controls win Witness/Relay/Witness. Final
player deaths are combat on82/83/90, with body food2230/2219/2260kcal and
carried1975/1705/565kcal. First retained pickups are1200/900/900kcal on
days73/63/65, costing the stated2ticks and leaving pantry37388/88899/39590
unchanged at that action. No immediate phantom food, trust or direct starvation
defect appears there; later combat/succession histories diverge. This does not
prove why whole communities differ or that withholding production has no cost.
Preserve all three adverse traces and investigate continuity instead of
assuming the lower win count requires easier combat or Table gates.

## Native preparation and limits

Prepared390x844 proof uses exact P/R/Q preparation helper source isolated from
its campaign driver, real public stage/sort/shell/pickup verbs, an explicitly
prepared known12400kcal plan and stocked village. The first12-person prepared
village selects a broadly knowledgeable helper who cannot identify this bag:
sorting spends8ticks, leaves it unknown, and packs nothing. Keep that native
refusal. General knowledge breadth is not proof of bag-specific knowledge.
The policy remains unchanged in this experiment; a future preference can
inspect the actual public sorter choices rather than reading opaque species.

A separate disclosed single-worker positive control forces the helper to use
the player's prepared known identity. Stage/sort/shell/pickup takes14 ticks,
puts1500 physical kcal in the pack, clears the counter, leaves100000 pantry
kcal/trust20/gives0/takes0 unchanged, and survives real save/load(true/true).
That proves the paid preparation route, not natural acquisition, the two-day
reserve under normal population, or a full human campaign. The earlier native
prep-food audit proves the real Pack button/handler itself.

Focused16 actual-caller/compatibility assertions and independent rebuilt tests
pass. Quick191/191 and full963/963 pass. Initial focused/quick output retained
a fixture TypeError from assuming titan state already existed; the prepared
finished-plan fixture now creates that explicit state. No assertion was loosened
or quarantined. Cached named screen resume reuses36 workers unchanged.

The first independent Git-archive rebuild reproduced every other output field
but failed the raw compound observer digest: some collector files had different
line endings. That draft case and mismatch log are retained as invalid. The
source bundle now overlays all seven original raw collector/comparator files
(after checking their normalized code is identical), and a fresh independent
root reruns the case. No payload identity was rewritten to pass. This is
validation-tool transport repair, not a Game/strategy or collector revision.

## Reproduce and continue

```text
node evidence/2026-10-16/quartermaster-reconstruct.cjs <fresh-root>
node <fresh-root>/scripts/godpath/test-campaign-quartermaster.js
node <fresh-root>/scripts/campaign-audit.js --root <fresh-root> --n 16 --policies campaigner-preparer,campaigner-quartermaster --days 240 --jobs 4 --out <report.json.gz>
node <fresh-root>/scripts/campaign-scorecard.js --report <report.json.gz> --pairs campaigner-preparer:campaigner-quartermaster --out <prefix>
node evidence/2026-10-16/quartermaster-verify.cjs --current
```

Use the holdout's explicit seed list for reruns. Reusing the same cache resumes
exact source/config cases. The receipt pins artifact and compatibility-reference
bytes; verifier checks all23 metrics, jobs/controls, source identities, source-
matched full-state traces, rebuild, resume and phone readouts. check.js discovers
the new test automatically. Omit --current for historical receipt verification.

Next distinguish actual recruitment/upkeep financing, travel time/interruptions
and public sorter selection from army prices or game defects. Keep the current
strategy opt-in and preserve losing Table outcomes. Natural Finale/Network,
seven fitting god deeds, broad scale work and Muse's region/nomad lane remain
open; the Garden/reactor human questions remain pending, not waived.
