# Living Garden recipient and payment diagnosis

2026-10-16. **Diagnosis retained; runtime repair remains open.** Base
`b4f697e3c9f39f2fa6afc8b9daa743f3136db719`. No gameplay, policy, collector,
food amount, survival lever or ascension/deed changes. This advances the scale
audit's named recipient gap without silently adopting a food refill amount.

## Prepared mechanism observations

`garden-recipient-prepared.cjs` uses the shared seeded kit, real generated
people, real need stores, real public player action and actual NPC daily-verb
implementation. It grants gods and stores deliberately. Eight isolated scenarios
share one harness, seeded7; this is prepared Node mechanism proof, not a human
playtest or a naturally earned ascension. No DOM/campaign viability claim.

| Scenario | Actual observation |
| --- | --- |
| Player Garden, public action |1,200->1,000kcal; two distinct NPC recipients hunger->0; fed2. Own dinner is not supplied.|
| Living NPC Garden, daily verb |Caster hunger20->28 (existing200kcal/25); another NPC60->0; player300->300kcal; fed1.|
| Repeat daily hook, same day |No second payment, cast or changed recorded feeding state.|
| Stale dead holder still on roster |Dead holder still pays8 hunger and feeds the other NPC.|
| Duplicate other-person roster entry |One distinct other NPC is reported as fed2.|
| Only hungry caster remains on roster |Hunger60->68, fed0, but harvestDay becomes85.|
| Unaffordable caster hunger72 |No cast/payment/harvest marker; existing strict post-payment80 gate holds.|
| Departed holder removed from roster |No cast or harvest marker.|

The shared `feedMultitude(who)` explicitly excludes `Game.villagerId` for
every caster as well as `who`. Thus NPC self-payment is preserved but the
distinct player is omitted. Recipient lists are not deduplicated. NPC dawn
iteration checks roster membership and god ownership, but not the person's
living state. NPC payment precedes feeding and commits a harvest marker even
when fed0. Normal death cleanup may remove a holder before that stale-roster
case; this prepared proof does not establish natural ghost casts.

## Actual usage, source-bound

Input: immutable `table-entry-holdout-after-panel.json.gz`,64 disjoint seeds
per capable/maker/merchant/caregiver,150 standard iterations, Columbus/eastern
woodlands. Select **every case with sampled eligible NPC Living Garden** before
inspecting calls.105 of256 cases qualify. Player-only Garden cases are outside
this NPC-caster cohort; the remaining151 campaigns are not replayed here.

`garden-recipient-natural.cjs` uses the unchanged standard driver/policies and
same raw balanced collector. It passively records actual `god_verb` feeding
telemetry after settlement. It calls no game query from the observer and
does not advance clocks, spend RNG, settle scenes or grant a build. Each of105
new replays exactly matches the original row, full gameplay hash and all23
metrics, with zero warnings. Original collector-neutrality controls remain
in the pinned input panel. The additional snapshots are therefore neutral
against the same-case collector-only campaigns, not new independent worlds.

| Policy | Sampled NPC-Garden cases /64 | Cases with NPC casts | NPC casts | Player casts within selected cohort | NPC casts with player kcal<500 |
| --- | --- | --- | --- | --- | --- |
| capable |20|7|79|58|6|
| maker |24|12|84|195|1|
| merchant |24|3|53|73|0|
| caregiver |37|13|144|235|0|

Total921 recorded casts:360 NPC,561 player.35 campaigns have actual NPC casts.
No natural cast reports fed0 in this cohort. The zero-recipient, duplicate and
dead-holder observations remain prepared edge cases. A sampled god is not
proof of a usable daily opportunity:70 selected campaigns have no NPC cast;
holder ordering, duration, food, current membership and need remain separate
explanations to audit. A low raw player reserve is not a proven food deficit:
metabolism/reactor, capacity, location and access matter. Natural snapshots
occur after the cast; they do not directly measure a before/after player kcal
increment. The prepared pair and actual source establish the omission.

All23 original metrics are retained per replay rather than recomputed as a
new conditional balance score. No win-rate target, causal survival effect or
all-playstyle viability claim follows from this selected-holder usage census.

## Next repair and survival constraints

Canonical living actor/recipient selection must include a distinct eligible
bearer without feeding the caster. Keep200kcal and actual NPC belly payment,
refuse invalid casters and preserve real membership, save/load and dawn callers.
Deduplicate actual people and ensure the daily success/harvest marker has an
honest recipient/opportunity meaning. A zero-Haven-recipient cast may also
interact with the broader army promise; do not simply erase that distinction.

Resolve player fullness versus bank capacity explicitly: `fullLine()` is fed;
`kcalCap()` can include stored combat fuel. Preserve a stronger existing
reserve, reactor/metabolic constraints and the caster's need for dinner.
Do not manufacture physical plant harvest provenance, seven-day deed credit,
feast-use credit, an unlimited war chest or stronger damage merely because
the food path now reaches the player. Then test real dawn/load and native
feedback, and compare matched screens/disjoint holdouts with all23 metrics.
Garden's seven-day interpretation and the early-reactor food-use question
remain unanswered; this independent recipient audit does not resolve either.

## Repeat and verify

```powershell
node evidence/2026-10-16/garden-recipient-verify.cjs
node evidence/2026-10-16/garden-recipient-verify.cjs --current
node evidence/2026-10-16/garden-recipient-summarize.cjs
node evidence/2026-10-16/garden-recipient-reconstruct.cjs .git/garden-recipient-review
node evidence/2026-10-16/garden-recipient-prepared.cjs .git/garden-recipient-review > .git/garden-recipient-review-prepared.json
node evidence/2026-10-16/garden-recipient-natural.cjs .git/garden-recipient-review .git/garden-recipient-review capable 10003 .git/garden-recipient-review-natural.json.gz
```

The reconstructed prepared output and complete capable10003 natural trace
match their originals exactly and are retained. Use separate Node processes
for other cases in the fixed plan. The first argument to the natural probe is
the raw collector root, the second the game/policy root; both must preserve
their pinned identities. Reconstruction preserves CRLF collector bytes, since
normalizing them changes observer identity. Its source manifest is208 inputs.
Fresh output directory required. Historical evidence-dependent full suites
need their own prior fixtures; reconstruction claims these probes only.

Default verification checks raw hashes, exact105-case selection, row/hash/
23-metric neutrality and the eight recorded historical observations. These
are diagnostic observations, not tests declaring current bugs correct.
`--current` also requires unchanged live gameplay sources. After a repair,
keep this receipt immutable and publish a new before/after interpretation.
Quick182/182 and full954/954 pass; no runtime wiring or ontology change.
