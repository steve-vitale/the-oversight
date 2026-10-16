# Relay daily upkeep and exposure diagnostics

2026-10-15. Base `04c8e855876cb7d9ad6c28dc6aaf3e36bb741c67`
(dead-office lifetime already fixed), branch `codex/resume-claude`.

Steve: "Winning shouldn’t be easy. A reduction in win rate is cause for investigation and consideration not automatically assuming it’s a regression. Keep documentation on our levers that impact survival."

## Lever and decision

Retain the documented daily Relay clock; balance remains unresolved. Four real
communications ticks on calendar day 85 previously charged grounding 100 -> 96
and advanced four service days. `relayTick` now charges/progresses once per actual
person/calendar day. Communications still run every part. This slows ability
unlocks and three/seven-day story opportunities as well as reducing upkeep;
it is not a price-only change. No policy, enemy, food or reward price was tuned.

The saved receipt lives in scholar.relay.upkeepDayByPerson. It is installed
before addGrounding's save, survives load and same-day release/reclaim, and
allows a different bearer their own charge. NPC-held offices do not charge the
bearer; this does not introduce NPC grounding. Legacy progress and abilities
remain, without inferred past dates, divided counters or refunds. The existing
shared service counter is retained; this patch does not author personal
ascension credit or complete the broader parity work.

## Reproducible experiment

Use the current collector against both roots: 150 driver days, default
capable/maker/merchant/caregiver, default origin Columbus, Ohio, flags unset,
Node v24.13.0. Exact policies, seeds, flags, observer and contract are in the
raw panels. Source files for both arms are retained in relay-clock-sources.json.gz.
The before archive has no Git metadata; its source identity is content, not
an inherited enclosing checkout HEAD. The candidate source digest is likewise
the tested content; the eventual evidence commit is not substituted for it.

The 16-seed screen is followed by 64 matched seeds per policy. Both are valid,
source-stable comparisons with passing on/off neutrality controls for every
policy. All 512 confirmation rows match their verified case-cache result
digests. Retained observer-proofs contains 16 seed-7 control jobs (four policies,
two arms, observer on/off); full rows and gameplay hashes agree within each pair.
No runtime/observer warnings or errors. Bootstrap intervals are exploratory,
unadjusted across metrics; no independent holdout has been collected.

| Policy (64 each) | Wins | Table entries | Player deaths | Communities lost | Tier-3+ gear runs | Contest/show gear runs | Craft/trade gear runs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| capable | 41 -> 55 | 51 -> 57 | 85 -> 90 | 12 -> 8 | 64 -> 64 | 64 -> 62 | 0 -> 0 |
| maker | 21 -> 21 | 24 -> 22 | 71 -> 59 | 25 -> 19 | 64 -> 64 | 63 -> 63 | 0 -> 0 |
| merchant | 25 -> 23 | 27 -> 23 | 57 -> 46 | 18 -> 14 | 64 -> 64 | 64 -> 64 | 0 -> 0 |
| caregiver | 28 -> 23 | 32 -> 25 | 36 -> 45 | 9 -> 18 | 64 -> 64 | 64 -> 64 | 0 -> 0 |

The full 23-metric per-policy report is relay-clock-confirmation.json/.md;
its decision is review_required. Capable win movement +0.21875 has an exploratory
95% interval [0.109375, 0.34375]. That is a challenge review, not a benefit claim.
Caregiver community loss +0.140625 has interval [0.03125, 0.25]; mean sampled
living population declines about 0.260 people with interval [-0.4583, -0.0715].
Its win change -0.078125 has interval [-0.21875, 0.0625]. Class/progression,
Table and contest reward watches also remain in the complete report. More
capable wins cannot cancel caregiver warnings. Universal good gear in mixed
bots does not establish pacifist viability; zero craft/trade runs remains an
opportunity/strategy audit item, not proof that the feature has no value.

relay-clock-combined-office compares the authored-deed arm before the lifetime
repair with this daily-clock arm. That is a two-change context comparison,
not an estimate of either individual lever. Historical deed/lifetime evidence
and interpretations remain intact.

## Trace the adverse and favorable cases

All 26 replay rows and full gameplay hashes match the saved confirmation panels
without the scorecard observer. The probe records actual calls plus grounding,
accumulated service, receipt day and pending System conversation snapshots;
probe hashes are retained. These are read-only snapshots, not new runtime
telemetry or eligibility receipts.

New caregiver community losses: seeds 1,3,7,8,9,17,29,30,34,46,2026.
Before, six had already ended at the Table (3,8,9,17,30,34; five wins and one
other terminal), and five reached their observation cap. Candidate seed 17
loses the community on day 106 before its baseline Table victory on day 112;
thus differing later exposure cannot explain every warning. The other five
baseline Table endings precede their candidate loss. Day-capped baselines
still do not establish indefinite survival. Seeds 20 and 33 move from community
loss to Table victory on days 97 and 90; those wins likewise do not establish
future village survival. Exact endpoints, claims and counters are retained in
relay-clock-caregiver-summary.json; full calls/snapshots in caregiver-probes.

## Repeatable calendar-window diagnostics

`node scripts/balance-windows.js <before> <after> <out.json>` validates the same
strict comparison identity, then reads saved samples only. Default windows
are 2-30,31-60,61-90,91-120,121-150. Reported metric pairs require every day in
both arms and finite values throughout; resource thresholds and units are
explicit. Missing dates, unknown metric pairs and exact case exclusions stay
visible. Boundary counts cover all cases: actual community loss, won, other
terminal, observed at boundary, or unobserved there. No carrying observations
forward, zero filling, or hypothetical post-Table survival.

Caregiver complete paired windows contain 57,62,59,25,5 cases. Population delta
is exactly zero in the first two, +0.00395 on days 61-90, -0.124 on 91-120,
and +0.31333 among just five late complete pairs. This selected subset cannot
clear the full-population/community warning. By day 120 actual community
losses are 6 -> 8, wins 22 -> 20, other terminal 4 -> 1; by day 150 losses
9 -> 18. The report preserves all missing-day details and input file digests.
Thirteen counterexample assertions cover unequal horizons, early wins, actual
losses, interior holes, invalid/duplicate days, nonfinite data, unknown roster,
identity mismatch and no mutation. It is diagnostic only, with no new score
or automatic balance approval. Tests run automatically in quick/full checks.

## Real caller and phone proof

Shared-harness upkeep tests: current 18/18, frozen base 5 pass / 13 fail.
They exercise actual commsTick and advancePart, automatic save receipt plus
save/load, same-day reclaim, real death/mantle/new holder, NPC/unoccupied office,
day zero, three/seven-day beats and preserved legacy unlocks. Ontology: 111 valid.

The retained prepared phone generator sets a visible day-85 clock case without
a class/kit grant. Through public Continue -> Claim it yourself -> Wait, three
part advances leave day 85 grounding 99 and service 1 (same-day.png); the next
Wait reaches day 86 grounding 98 and service 2 (next-dawn.png). The public Wait
advances to the next part, so this proof follows actual displayed game days.
This is a prepared clock proof, not a naturally earned long campaign. The
local server and test tab were closed; no release/SW version was changed.

## Follow-up

Retain calendar correctness while reviewing higher capable wins, slower Relay
opportunities and caregiver late community losses. Next: a separately named
role-strategy experiment with fixed policy baselines, affected cohorts and
independent holdouts; inspect actionable costs/earned preparation and human
counterplay before tuning. Policy changes cannot pass as a game-only comparison.
Eight other authored deeds and the broader roadmap remain open. This commit
does not claim balance completion, regional validation or a deployment.

Validation counts and artifact hashes are in relay-clock-validation.json.
Text hashes canonicalize CRLF to LF; gzip/PNG hashes use exact bytes. Packaging
uses explicit UTF-8 and verifies replay rows/control result digests in Node.
