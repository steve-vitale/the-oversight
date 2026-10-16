# Counter gifts, conditional practice and return costs — 2026-10-16

Retain the actual-transfer parity repair and the once-per-unsettled-gift return
receipt on `codex/resume-claude`, for review. This is a contribution/accounting
correction, not a win-rate target or a claim that natural army funding works.
The all23-metric reports retain adverse signals. No Table, army upkeep, exile,
food-production, reward-tier, policy, regional or nomad tuning accompanies it.

## What changed and why

The native harvest preparation audit produced1500kcal with12 real ticks but
zero contribution credit. `putAwayFinished` successfully called `pantryAdd`
without the deliberate-gift settlement already used by Pack donation. Both
actual transfers now call `_creditPantryGift` after storage succeeds. It credits
the transferring bearer, actual positive calories, dated history, conditional
trust/practice and the existing sharing observations. Empty, unfinished,
spoiled, inaccessible, over-cap and bonded batches cannot earn that credit.
Automatic production and NPC contest prizes still use `pantryAdd` without
pretending the current player donated them. Harvest ownership/risk, access,
capacity and granary metadata retain their own semantics.

Conditional Generous practice now finds the current Codex skill lane as well
as old ability slots. It records the promotion-causing gift before XP mutation;
revocation crosses the actual6/12-use thresholds, preserving earlier legitimate
practice. Donation/take cycles cannot print skill mastery. This does not erase
historical sharing stories, moral observations or every progression effect.

The first candidate exposed the existing return cost repeating on later meals:
`lifetime gives >0 && net <=0` persisted after conditional rewards were settled.
Two prepared actual-caller tests failed on both withdrawal routes. A first
attempt to gate the cost only on positive conditional ledgers was rejected:
a new gift at capped rewards could avoid its first return charge. Its partial
cohorts were deliberately stopped, not promoted as a complete experiment.

The retained version sets `v.givePending[person]` only for an actual new gift,
and clears it on return settlement. It preserves the five-trust first return
cost even if that gift earned no conditional trust/practice. It also recognizes
positive old conditional ledgers without backfilling a pending charge from
lifetime gives. Ordinary borrowing penalties and net/stealing rules remain.
This boolean represents an unsettled gift stream, not one fee per batch.

## Experimental arms and provenance

Base commit: `9da5d56060838297b661b2654f88d71ba8fd518a`.
`counter-gift-sources.json.gz` reconstructs four explicit arms:

| Arm | Meaning |
| --- | --- |
| before | Published preparer source; no counter gift settlement |
| draft | Counter gift/modern skill repair, old repeated return cost |
| intermediate | Rejected reward-ledger-only cost guard; capped-gift contract fails |
| after | Retained explicit pending-gift receipt |

Only `game.js` and `food.js` differ in the main210-entry before/after manifest;
only `game.js` differs between draft and after. Policies, harness, collector
raw bytes, contract, Node version and flags are fixed. Dated validation tools
are ancillary, not a silent change to the balanced driver. The source bundle
preserves exact bytes separately from normalized manifest hashes.

There are1236 retained main cohort workers:412 per complete arm, including
1152 new executions and84 exact-source named baseline workers reused from the
published preparer evidence. Reuse validates full source/observer/configuration
identity and retains original report/jobs hashes; it is not another experiment.
Each arm has68 standard screen jobs,260 standard holdout jobs,18 named screen
jobs and66 named holdout jobs. Standard cases run150 driver iterations; named
campaigner-preparer runs240. These are not guaranteed calendar-day horizons.
Do not pool the horizons, policies or seed blocks. Rejected intermediate caches
are separately labeled partial (154 completed jobs:68/4/18/64) and counted in worker-counts.json; they are not
included in1236 or used as a valid balanced comparison.

All three contrasts (before/draft, before/after, draft/after) retain all23
metrics, exploratory paired intervals and actual denominators. The named
64-seed block is disjoint10001..10064. Win changes require investigation,
not automatic improvement/regression. All final comparisons require review.

## Final outcomes

Standard150-iteration cohorts, before -> after:

| Policy/cohort | Wins | Player deaths | Community losses |
| --- | ---: | ---: | ---: |
| capable16 |12 ->12 |18 ->18 |2 ->2 |
| maker16 |5 ->4 |16 ->18 |3 ->4 |
| merchant16 |4 ->4 |17 ->18 |6 ->6 |
| caregiver16 |9 ->9 |10 ->10 |4 ->4 |
| capable64 |48 ->48 |88 ->88 |13 ->13 |
| maker64 |18 ->20 |87 ->82 |24 ->21 |
| merchant64 |24 ->23 |55 ->56 |28 ->28 |
| caregiver64 |33 ->34 |44 ->45 |16 ->15 |

Every standard policy's first-bearer day60 survival, national access, earned
T3+ gear and contest/show T3+ gear rates remain unchanged in the disjoint64.
Unknown/censored denominators remain explicit (merchant62 and caregiver63
observable day60 pairs). Craft/trade T3+ remains zero sampled access; mixed
policies do not prove pacifist viability or prove those routes are useless.

Named240-iteration preparer, before -> after:

| Outcome |16-screen |64-disjoint |
| --- | ---: | ---: |
| Wins |15 ->10 |47 ->49 |
| Table entries |15 ->11 |48 ->50 |
| Table invitations |16 ->15 |53 ->56 |
| National scale access |14 ->15 |55 ->53 |
| Player deaths |24 ->28 |101 ->105 |
| Community losses |1 ->5 |16 ->13 |
| Named-class access |9 ->11 |42 ->44 |
| Earned T3+ weapon/armor |16 ->16 |62 ->63 |
| Contest/show T3+ weapon/armor |15 ->16 |57 ->57 |

The screen's reduced Table entry and population are real review signals,
not canceled by the holdout's higher wins. Holdout national access drops and
day60 pair coverage changes; retain those warnings. Both blocks still have
zero campaign starts/fights and zero craft/trade T3+ access. Contribution
credit alone did not establish the earned-army-supply hypothesis. Do not lower
army costs, waive exile or soften Table losses to manufacture success.

## Diagnosis, controls and limits

Every changed complete gameplay hash is selected for source-matched replay:
initial comparison2/7 standard and14/48 named changes; final11/19 standard
and14/49 named changes. The plans retain150 initial and194 final diagnostic
receipts, with exact-source earlier baseline replays reused where available.
These conditional traces, observer-off controls and cached resumes are not
independent worlds. Raw final states are retained; `givePending` is not stripped
to force hash equality. Rebuilds independently match full seed2 named outputs.

Seed2's day11 trust7->0 despite owed trust/practice0 originally suggested an
extra charge. The explicit pending probe corrects that inference: a fresh
unsettled gift is present, so that first return is legitimate and remains in
the final version. Zero reward ledgers alone do not establish a duplicate
charge. Prepared repeat-without-new-gift tests establish the actual duplicate
bug; the final native unrelated-meal check demonstrates the correction.
The pending probe separately records154 successful withdrawals with cleared
receipts in this source-bound run. Do not equate that count with154 avoided
trust losses (trust can already be zero and ordinary costs still apply).

The standard maker1234 loss is a third combat death at74 after shared deaths
at51/67; the baseline reaches and wins Witness at90. Named1234 reaches the
Table earlier at94 with13HP, a Relay god frame, then fails Relay and Feared
(terror2); baseline enters111 and wins Assimilated after failing Feared.
A god frame still loses: preserve that meaningful outcome. Named42 still wins
but takes five deaths instead of two and enters115 instead of91; a binary
win conceals that cost. Full Table states and death snapshots are retained.

Trust-census caller attribution sees through the shared settlement helper and
separates Pack versus counter unload. Existing28 census assertions pass.
Its proxy can be replaced during succession/load; absence of aggregate rows
is not proof of absent trust activity. Raw per-call before/after snapshots and
proxy-attached flags are the diagnostic evidence. No reproxy mechanism or
random-consuming diagnostic query was added to the simulation.

Native390x844 proof uses clearly prepared harvest/knowledge/practice and the
exact public preparation helper isolated from its campaign driver. It is not
proof of natural acquisition or a full human campaign.1500kcal costs12ticks,
credits1500, promotes L1xp5 toL2, and survives actual save/load(true/true).
Returning only that gift restores L1xp5, clears conditional ledgers and pending
receipt, and leaves trust15. A later unrelated500kcal meal leaves trust15.

Known pre-existing cap quirk: the100-trust/L3 native1500kcal gift records a
nominal1 conditional trust even though visible trust is clamped100. Return
therefore leaves94 (nominal1 revoked plus first-return5), and the later meal
stays94. The focused1000kcal capped fixture has zero nominal grant and returns
95 once. This is not evidence of a repeated fee. Keep this small cap-accounting
follow-up visible rather than claiming every capped gift returns exactly95.

Final checks:25 focused actual-caller assertions; quick189/189; full961/961.
No assertions were loosened/quarantined. Retained failure logs include the
old census attribution break, repeated-charge RED and rejected cap-guard RED;
resolved fixture/API mistakes are not hidden. Ontology validates111 systems;
the new helper has both actual callers (25 older unwired items remain).

## Reproduce and maintain

```text
node evidence/2026-10-16/counter-gift-reconstruct.cjs after <fresh-root>
node <fresh-root>/scripts/godpath/test-counter-gift.js
node <fresh-root>/scripts/balance-panel.js --root <fresh-root> --n 16 --days 150 --par 4 --out <fresh-output>
node <fresh-root>/scripts/campaign-audit.js --root <fresh-root> --n 16 --policies campaigner-preparer --days 240 --jobs 4 --out <fresh-report.json.gz>
node evidence/2026-10-16/counter-gift-verify.cjs --current
```

Use the retained reports' exact explicit seed lists for holdout reruns. Preserve
source identity and compound campaign observer identity. Compare Game-only
arms with counter-gift-compare.cjs; use the named-strategy comparator only when
strategy is the changed axis. `before`, `draft` and `intermediate` reconstruction
are historical diagnostics; intermediate's cap test is intentionally RED.
Automatic check.js discovery runs the new focused test. Source-keyed caches
invalidate changed inputs; ordinary pantryAdd callers must not earn player
gift credit. New deliberate transfer routes need actual paid-transfer,
refusal/no-repeat, save/load and single/bulk take-back proofs.

Next: earned physical army funding and feature opportunities remain open;
seven fitting god deeds remain. The Garden feeding-day and early reactor/deed
questions remain pending. Muse's world/region/nomad lane stays separate.
