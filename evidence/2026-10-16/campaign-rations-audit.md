# Campaign rations: retain the experiment, reject the success claim

2026-10-16. **Keep the new named cohort opt-in; keep the original default.**
This strategy does not fund a natural army. Its higher Table win rate is
insufficient reason to adopt it. No game rule, enemy, reward, army upkeep,
exile, contribution cost, Table gate, Muse region/nomad file or release changes.
Base commit: `2eb4d5df39d1716aba51ab307724d2f427cdcdab`.

## Hypothesis and implementation

The preceding campaign-balanced audit separated ordinary hall refusals from
successful remote campaign withdrawals and later exile refusals. Test a
different public-action quartermaster preference, without changing that
baseline or treating nominal pantry calories as access:

- Keep a known announced campaign's physical ration in the current bearer's
  own haul, through both ordinary donation paths, while the village has two
  nominal days of food. A successor does not inherit the predecessor's plan.
- Respect exile, actual hall/remote access, real transfer weight including
  water, finished unspoiled unbonded food, and whole-unit payment. When funded
  but outside access, use ordinary travel/entry rather than teleporting.
- Spend only positive cumulative contribution credit, leaving at least one
  kcal of credit. Limit additional campaign withdrawals to the remainder of
  the ordinary fed line after all voluntary takes that day. Repeated hooks
  cannot reset that budget. Prefer useful calorie density and stop on an
  actual refused transfer.

These are deliberately conservative **policy preferences**, not new legal
requirements imposed on players. Ordinary survival withdrawals retain the
base behavior. A good contribution balance alone cannot guarantee good
standing. Village reserves are nominal physical stock, not a claim that every
unit will nourish every recipient. Own carried food never becomes free food.
Army upkeep still spends1000 pack kcal/blade/day, including at Haven.

`campaigner-rations` is separately registered; campaigner/control remain
unchanged. The optional `ctx.foodReserveKcal` hook in competent raises the
donation reserve only when supplied by a policy. No callback means the
original path, including no new game-helper calls. The callback reports
unexpected errors through console warnings; retained panels reject warnings.
Provisioning also records `campaignRation*` counters. They diagnose decisions;
they are not successful payment, survival or campaign receipts.

## Natural results and tradeoffs

240 driver iterations, Columbus/eastern woodlands, identical game and policy
sources for each named strategy. Standard16-seed screen and disjoint64 seeds
10001..10064 stay separate. Both23-metric scorecards require review.

| Outcome | Screen original | Screen rations | Holdout original | Holdout rations |
| --- | ---: | ---: | ---: | ---: |
| Table wins/entries |9|12|37|48|
| Invitations |15|14|56|57|
| Player deaths |24|24|108|96|
| Community losses |6|4|26|16|
| Named player class access |14|11|40|40|
| Earned T3+ weapon/armor |16|16|64|64|
| Contest/show T3+ weapon/armor |16|16|57|58|
| Craft/trade T3+ weapon/armor |0|0|0|0|
| Runs making a campaign call |13|0|48|0|
| Actual marked campaign fights |7|0|32|0|
| Herald kills |5|0|19|0|
| Finale starts |0|0|1|0|
| Network starts |0|0|0|0|

First-bearer day30/day60 survival is unchanged in both cohorts. Mean sampled
low-food exposure falls .0387->.0081 in the screen and .0408->.0221 in the
holdout; this does not erase the screen's player/NPC class warnings. Holdout
player class access is equal, while eligible NPC class access remains slightly
lower (.1017->.0936). All metrics retain their own denominators/unknowns and
exploratory intervals; no weighted score or win quota is used.

The candidate draws only143 campaign kcal across the screen and2 across the
holdout, despite3329/11691 budget-blocked hooks. Holdout access-blocked hooks
also number2277. These are repeated observations, not distinct people or
opportunities. There are no actual campaign transfer refusals; the policy
mostly refuses before calling the verb. Natural supply trips/hall entries
are zero; the prepared checks establish those callers, not natural exposure.

Seed4's exact replay reaches its first war council at day60 with zero
contributed kcal,88155 prior voluntary takes,1600 taken that day and no food
in the pack. This strategy has no credit to spend and never funds a campaign;
it later wins at99 after succession. The original makes461 successful campaign
withdrawals (184276kcal), then503 campaign no-transfer attempts after exile;
its village ends at202. Ordinary survival refusals are still present in both
strategies and are not claimed repaired by this army policy. Do not infer
that withdrawals alone cause every exile or every changed outcome.

The original holdout10046 legally kills Herald at89 with18 allied fighters,
starts the Finale crew encounter at92 with21, and loses it in round5.
That is a real natural start and a meaningful loss, not a completion or a
softlock. The candidate never reaches that fight. Explicit policy start
counters miss some approach-triggered fights; use the actual encounter marks.

**Decision:** retain the opt-in strategy and its evidence as a failed funding
experiment. Higher wins coincide with removing campaign exposure. Do not
describe it as a better campaign bot or use its wins to ease enemies. Next
test a deliberately productive public-action strategy that earns physical
food/contribution, measures generation, spoilage, donations, standing and
daily army spending, and actually attempts the road. Natural Finale/Network
completion, craft/trade gear viability, strict noncombat cohorts and seven
authored god deeds remain open.

## Verification and reproducibility

- 17 focused actual-verb checks, quick187/187, full959/959. The initial
 density assertion wrongly prohibited small units after dense units exhausted
 the available allowance; the corrected assertion verifies the first actual
 paid unit instead. No game assertion or green-list entry was weakened.
- 254 retained cohort/control workers:54 campaign screen,132 campaign holdout,
 68 standard compatibility (64 observed plus4 observer-off). Campaign controls
 compare observer-on/off and the ordinary balanced driver, including exact
 rows, full gameplay hashes and all23 metrics. Source stability/errors pass.
- All32 prior campaign/control cases match the published campaign-balanced
 final rows, hashes and entire balanced observations. The64 standard capable/
 maker/merchant/caregiver cases match apex-party's final screen rows, hashes
 and23 metrics. These are compatibility checks across an opt-in policy
 revision, not falsely relabelled game-only comparisons.
- A second screen invocation reuses all54 cached jobs and matches complete
 rows/controls. Bundle209 normalized source entries and exact raw collectors,
 Node/flags/origin/horizon, raw reports, job digests and both scorecards.
- Every pair changing any of13 predeclared discrete outcomes is replayed in
 both strategies:11 screen and46 holdout cases.116 planned diagnostic runs
 include one extra observer-off candidate per cohort. Two preliminary seed4
 on-probes are also retained separately:118 diagnostic runs total, not new
 independent worlds. Each matches its original entire row/balanced object and
 full state hash; full end states and bounded transfers/daily transitions stay.
- An independent rebuilt candidate root reruns seed4 for240 iterations; the
 entire campaign output matches. No Git HEAD is inherited from the enclosing
 checkout and no source digest is rewritten to bypass policy identity checks.

At390x844, the exact policy module runs in a browser fixture through real game
verbs. The fixture explicitly prepares day85, stock and credit. It enters the
hall, transfers2000kcal (pantry100000->98000; pack0->2000; takes0->2000), refuses
additional whole500kcal units under the2400 daily line, and a prepared exile
then blocks the call without changing stock. Screenshots/AX states retain
this limited contract proof; it is not natural campaign acquisition evidence.

Rebuild into a fresh directory:

```text
node evidence/2026-10-16/campaign-rations-reconstruct.cjs <fresh-root>
node <fresh-root>/scripts/campaign-audit.js --root <fresh-root> --n 16 --policies campaigner-control,campaigner,campaigner-rations --days 240 --jobs 4 --out <fresh-report.json.gz>
node <fresh-root>/scripts/campaign-scorecard.js --report <fresh-report.json.gz> --pairs campaigner:campaigner-rations --out <score-prefix>
node evidence/2026-10-16/campaign-rations-verify.cjs --current
```

Use the holdout report's explicit seeds for its rerun. The receipt hashes every
artifact except itself. The verifier checks cached-job integrity, complete
case selection, scores, raw rows/whole states, prior compatibility and rebuilt
output. Source reconstruction is mandatory for future historical reruns.
Run the dated phone-fixture generator from its matching root and serve a fresh
loopback origin with `?debug=1`; no player-facing service-worker bump is needed.
Internal workflow hooks remain ordinary quick/full test discovery, source-keyed
cache invalidation and the shared23-metric collector/contract tests.
