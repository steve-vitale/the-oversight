# Natural campaigns now use the balanced measurements

2026-10-16. **Retain the measurement tooling; campaign strategy needs review.**
Game/policy base `c3eaf74cd2afca035f5ff42063bfeb7e15b7120d`.
No runtime, policy choice, recruitment/food price, enemy, Table or release
change is included. This advances the outstanding natural titan/Network
coverage requirement and supplies a current baseline for the next experiment.

## Repeatable tools

campaign-audit.js now installs the same balanced observer at the same setup/
daily boundaries as balance-panel.js. `rawRow` retains the complete standard
driver output, including daily pacing; the older flat display keeps its
compact pacing field. A shallow-copy mistake discovered during development
would have trimmed both objects; exact standard-row tests catch that error.
The report keeps all23 metrics, census/eligibility/errors, actual marked
campaign fights/resolutions, policy counters and maximum overtime.

Each blockage keeps its complete count and bounded first/last raw snapshots:
target, position, stored Haven coordinates, equipped/packed goods, pantry,
roster, progression, existing titan state and links. These read state without
calling game helpers or providing information back to the policy. Missing
stored Haven coordinates remain missing; the current runtime resolves them
to4,4. Nominal food totals are not spendable nourishment or access evidence.

Source208 manifest, exact raw compound collector/contract identity, Node,
region/origin, named policies, seeds, iteration horizon and simulation flags
are pinned. Each selected proof seed runs observer-off and the ordinary
balanced child; both must match the observed full row/hash, and the ordinary
child's23 metrics must also match. Warnings/errors fail the retained report.

`--seeds` supports disjoint shards, `--jobs` bounds concurrency and `--cache`
resumes exact-identity cases. Cache keys include source, observer, flags,
Node, scenario, policy, seed and control kind; result digests and case identity
are checked. Corrupt results fail. campaign-scorecard.js verifies the compound
collector/contract before adapting rows to the existing named-policy strategy
comparator. It never labels different policy choices as a game-only change.
Historical reports need their reconstructed collector, not a renamed digest.

## Current natural screen and its limits

16 standard seeds, two existing named policies,240 driver iterations,
Columbus/eastern woodlands; no prepared state. The control and campaigner
share the same existing cautious late-game waiting. A preliminary collector
and final position/equipment diagnostics retain36 long-run workers each:
32 observed cases plus2 observer-off and2 ordinary-balanced controls.
All32 complete rows, hashes, balanced observations and campaign outcomes
are identical across those collector revisions. Their raw source bytes are
retained separately. These are72 retained workers, not72 independent worlds.
Both source-stability and neutrality checks pass. A complete final rerun
reuses all36 cached cases and produces identical rows/controls.

| Screen result,16 per strategy | control | campaigner |
| --- | ---: | ---: |
| Table wins / entries |13 /13|9 /9|
| Player deaths |21|24|
| Community losses |3|6|
| National access |15|14|
| Named player class access |11|14|
| Earned T3+ weapon/armor |16|16|
| Contest/show T3+ weapon/armor |16|16|
| Craft/trade T3+ weapon/armor |0|0|
| Runs using a council / call |0 /0|14 /13|
| Actual marked campaign fights |0|7|
| Herald kills |0|5|
| Finale / Network starts |0 /0|0 /0|
| Maximum overtime |4|6|

Seven actual Herald resolutions are five wins and two routs. The policy's
explicit fight-start counter is only five; fights that start while approaching
must be counted through the real marked encounter wrapper. Fourteen runs
hit the policy's food check; the highest sampled force reaches20. Neither
a20-blade maximum nor overtime6 proves a legal ready Network route.

The complete23-metric strategy scorecard is `review_required`. Low-food
exposure increases .0071->.0387; entry/national/death/community warnings stay
beside greater class coverage. Early-bearer survival30/60 is unchanged.
The four lost wins are seeds1,2,4,42. Candidates1/4/42 lose their communities
on109/202/107; candidate2 remains alive at the238-day cutoff. These are
different tails. They are not proof that the game needs easier enemies or
free food, and a16-seed screen is not a confirmation. The existing campaign
policy is unchanged. Natural Finale and full Network completion remain open.
Both cohorts obtain noncombat contest/show equipment, but these mixed
combat strategies do not establish pacifist viability.

## A food block is not automatically a food shortage

First/last snapshots often show substantial pantry stock while carried
reserves are low and the bearer is outside the hall. That alone cannot
establish a bad access gate: full integration can provide legal remote
access, and exile overrides it. A separate source-bound seed4 trace wraps
only actual public withdrawals, captures their real messages and caller
scope, and forwards every call. Observer-on/off each match the screen's
complete row, full hash and entire balanced observation.

In that run, ordinary survival attempts receive1,100 hall-access refusals
between4 and17. Those are not campaign provisioning calls. Campaign
provisioning later makes461 real successful withdrawals, first61 and last72,
with integration100. After exile closes the pantry, it makes503 campaign
attempts with no transfer, first73 and last199. Ordinary survival makes7,620
further no-transfer attempts; the real messages say the pantry is closed.
The first campaign refusal retains6170 nominal carried kcal alongside100545
nominal pantry kcal, exiled=true. Pantry abundance does not confer access.

Do not collapse these into "enter the hall" or "raise the80-take limit."
The observed trace does not establish that every refusal or every exile has
the same cause. Next: inspect the policy's access, contribution/standing,
carrying budget and real ration funding before calling/replenishing an army;
stop unchanged refused actions from becoming hundreds of blind retries.
Test a separately named strategy through paid public actions, preserve dinner
and village reserves, and compare all metrics with disjoint holdouts before
adopting a policy lever. Do not waive exile, add pantry access, manufacture
food or weaken the Network's20/5/10 gates from this evidence.

## Verification and reuse

17 workflow assertions prove observer-off/ordinary-driver identity, all23
metrics, full raw pacing, read-only detached snapshots, parent controls,
eight-case resume, corrupt-cache refusal and stale/mixed-source scorecard
rejection. Quick186/186 and full958/958 pass. An independently reconstructed
240-iteration seed4 case matches its entire retained row, hash, balanced
data, counters and diagnostics. The two richer pantry runs are separate
from the72 cohort workers; short test workers are verification, not cohorts.

```powershell
node scripts/campaign-audit.js --n 16 --days 240 --jobs 8 --out .git/campaign.json.gz
node scripts/campaign-scorecard.js --report .git/campaign.json.gz --out .git/campaign-score
# Resume the same cases (the default cache is <out>.cases):
node scripts/campaign-audit.js --n 16 --days 240 --jobs 8 --out .git/campaign.json.gz
# Explicit disjoint shards; their proof seeds must belong to their own shard:
node scripts/campaign-audit.js --seeds 10001,10002 --proof-seeds 10001 --days 240 --jobs 4 --out .git/campaign-shard.json.gz
node evidence/2026-10-16/campaign-balanced-verify.cjs --current
node evidence/2026-10-16/campaign-balanced-reconstruct.cjs final .git/campaign-fresh
node evidence/2026-10-16/campaign-balanced-verify.cjs --recompute .git/campaign-fresh
```

Use a fresh reconstruction directory. `draft` restores the preliminary
collector; final campaign/scorecard bytes reproduce the current report.
The raw-byte attribute on campaign-audit.js preserves collector identity
across Git checkouts. Normal quick/full discovery runs the workflow proof.
Keep counts, bounded blockage context, neutrality, cache identity and the
shared metric contract together when extending this workflow for Muse.
