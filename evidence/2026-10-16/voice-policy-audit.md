# Voice preparation: opt-in strategy experiment

Base: `1086fae8875d763beaaec40abdf7a5558d3ea28f`. Four opt-in `*-voice-ready`
cohorts preserve the capable, maker, merchant and caregiver controllers and
prepare Be Heard before their existing visible hunt/raid actions. The ordinary
daily social cast now requires a real living recipient whose trust can improve.
The original four policies remain default. No gameplay, NPC brain, region,
telemetry contract, ending gate or reward change belongs to this experiment.

## Fixed rules and reproducible comparison

[The plan](voice-policy-plan.json) was retained at 12:09:21 UTC before the first
screen. Rules were frozen before results: immediately after the shown word price,
keep at least max(500 kcal, 40% of capacity) and 75 own grounding. Use only the
actual available public action. Do not initiate another encounter or cast during
an active contest/fight. Social need excludes self, dead/phantom people and trust
at the progressive-gain ceiling. Other gods' daily actions remain unchanged.
These are policy parameters, not proposed game difficulty targets. Later travel,
Rally Cry and other actions can consume the retained resources.

The [screen report](voice-policy-screen-score.md) covers 16 standard seeds and
128 observed cases. All 64 original control rows, final gameplay hashes and
23 metrics exactly match the preceding immutable daily-Voice panel. The
[holdout report](voice-policy-holdout-score.md) covers 64 disjoint seeds
10001..10064, fixed before screening, and 512 observed cases. A separate four-case
seed-10 panel supports named diagnostic replays only. Retained job records total
664: 644 observed and 20 observer-off checks. Every policy passes neutrality;
all panels have stable source manifests and zero runtime/observer/gear errors.

`scripts/policy-scorecard.js` compares explicit strategy pairs within one panel,
using the existing 23-metric contract and exploratory paired intervals. It rejects
incomplete/duplicate cases, missing neutrality, unstable sources, invalid metrics
and runtime errors. The game-change comparator remains unchanged. Win rate stays
descriptive; a lower rate prompts investigation. Neither higher wins nor a
`no_material_signal` result establishes a better strategy or equivalence.

## Holdout tradeoffs

Counts below are control → prepared, each over 64 cases.

| Strategy | Wins | Table entries | Player deaths | Community losses |
| --- | ---: | ---: | ---: | ---: |
| capable | 51 → 50 | 51 → 50 | 86 → 84 | 12 → 13 |
| maker | 20 → 23 | 21 → 23 | 83 → 82 | 26 → 25 |
| merchant | 26 → 27 | 26 → 27 | 59 → 59 | 27 → 25 |
| caregiver | 31 → 33 | 32 → 33 | 41 → 36 | 19 → 18 |

First-bearer survival through day 60, named-class access, earned tier-3+ gear
access and contest/show participation are unchanged within every pair. Survival
estimates retain censoring: merchant has 62 eligible pairs and caregiver 63,
not 64. Low-food exposure decreases slightly in all four cohorts. Caregiver
low-HP exposure moves adversely, .0023 → .0024. Keep all 23 metrics and their
denominators in the linked report; do not optimize the aggregate 128 → 133 wins.
The screen separately loses capable seed1234 and gains one merchant win; it is not
the confirmation panel.

Both lost holdout wins, capable and caregiver seed10036, expose the existing
reactor/food-use question. Controls die, pass the mantle to a successor and reach
the Table. Prepared cohorts retain the original reactor-bearing character but
remain at arc3 without `feastSurgeUsed`; capable later loses the village and
caregiver reaches the horizon. This is a progression/survival conflict to review,
not permission to force a death, waive a deed or retune the policy. Raw saved
reactor objects can outlive held ability ownership; do not infer actual online
status from the object alone. Maker seed10025 provides a gain example with a
surviving bearer and a witness ending. These are compound strategy trajectories,
not isolated causal estimates for one rally or resource threshold.

The screen loss seed1234 also demonstrates preparation before a real selected
deed hunt on day80, a successful paid word and three initial player rally turns.
The following real Rally Cry still crosses below75: the guard protects the word's
immediate payment, not the entire later action chain. Downstream deaths and
ending access diverge. A separate stack replay locates capable seed7's late
fight in `capableContest → contestChoose`; active-contest preparation is
intentionally outside these hooks.

## Costs, public action and limits

Eight named natural-holder traces (capable7, maker10, merchant4, caregiver10,
each paired) reduce accepted daily casts from102 to13, paid food15300 →1950
and actual raw grounding erosion266 →65. These samples still contain zero fight
starts receiving that day's word. Across the intersection of observed Voice
snapshots on days80..89, 37 common case-days have37 →10 casts. This is not a
continuous per-person holder-day census or a population estimate. Body identity
is absent from the original simple snapshots. The separate screen-loss replay
proves that the encounter hook can produce an actual recipient.

Phone playtest at390×844 uses the real native action:1110 kcal/80 grounding
becomes960/75, then a real player constructor receives3 rally. At1110/79 the
same native action yields960/74 (fraying). Guests at90 trust stay90 because the
ordinary progressive gain cannot improve that value. [Funded screenshot](voice-policy-funded.jpg)
and [fraying screenshot](voice-policy-fraying.jpg) retain full accessibility
snapshots. The prepared cost labels are diagnostic fixture readouts. This does
not prove exact numeric humanity/trust visibility in the native HUD, nor run the
Node policy inside the browser; audit that parity separately before human-play
claims about these exact thresholds.

A separate real-runtime diagnostic finds that crossing into fraying calls
`bumpTrust(null,-2)`: actual roster trust is unchanged and `trust.null` becomes8.
The average-trust reader includes that phantom entry. No repair is bundled here.
Audit intended social cost and old-save cleanup in a separate compatibility unit.

## Reproduce and maintain

See [SIMULATING](../../docs/SIMULATING.md), the policy README and
[survival levers](../../docs/SURVIVAL-LEVERS.md). Register new opt-in cohorts in
the comparison registry, retain original controls, fix disjoint holdouts before
screening and compare explicit policy pairs. Changes to policy parameters need a
new source manifest and experiment, not edits to this evidence. Muse can run the
same comparator on any complete same-contract panel without importing gameplay.

From repository root:

```text
node evidence/2026-10-16/voice-policy-verify.cjs
node evidence/2026-10-16/voice-policy-verify.cjs --current
node evidence/2026-10-16/voice-policy-reconstruct.cjs before <fresh-directory>
node evidence/2026-10-16/voice-policy-reconstruct.cjs after <another-fresh-directory>
node evidence/2026-10-16/voice-policy-verify.cjs --recompute <after-directory>
```

The default verifier checks historical artifacts without importing today's
comparator. Reconstruction pins the parent commit, both source arms and the test
fixture. `--current` additionally checks current source bytes and runs the22
policy and15 comparator checks. Quick suite179/179; full suite951/951. The17
retained replay files are neutral against their exact panel rows/hashes/metrics
(16 distinct policy/seed combinations plus a repeated stack case). Public probes
accept a reconstructed root; raw reports, jobs, logs, phone fixture/server and
source bundle are bound by `voice-policy-receipt.json`.

Both reconstructed manifests match exactly (207 before,208 after). The rebuilt
after root passes22 policy and15 comparator checks; both score reports recompute
exactly. Replaying capable-voice-ready seed7 from that rebuilt root reproduces
every retained trace field, not just its ending.

Decision: publish as opt-in measuring tools, keep original defaults and hard
ending gates, investigate named survival/progression conflicts and social-cost
coverage before changing gameplay or claiming human viability.
