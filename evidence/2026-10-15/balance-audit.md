# Balanced measurement v1

2026-10-15. Steve requested a balanced set of telemetry to optimize from,
with many key metrics protected rather than just wins. The verbatim directive
is in `docs/godpath/STEVE-ANSWERS.md`; the implementation plan and decision
rules are in `docs/MEASUREMENT-PLAN.md`.

## Delivered

- **23 separate metric contracts**, with units, direction and practical review
  thresholds. Survival, community continuity, food/water/health distress,
  earned weapon/armor routes, player/NPC class access, national scale and
  Table outcomes remain separate. Neutral diagnostics are not labeled better
  or worse. No weighted score can cancel one playstyle's regression.
- **One standard-driver collector:** one shared harness per child, existing
  gear instrumentation reused, no extra game telemetry/RNG/clock calls. Raw
  daily samples, source-specific actual acquisitions, food intake, class/god
  distributions and ending events are retained for diagnosis.
- **Matched comparator:** policy/harness/flags/Node/region/case identity
  checks, complete declared cases, sampled observer neutrality, warnings and
  source stability gates. Missing data is not zero. Censored survival is not
  counted as a death or a success. Per-policy paired deltas, median/tails,
  direction counts, coverage and deterministic exploratory intervals remain
  visible. Material deterioration is flagged even when its interval spans zero.
- **Scaling:** bounded workers, per-case content/result digests, restartable
  checkpoints, explicit seeds and disjoint shard merging. Mid-panel source or
  observer changes invalidate the panel. A larger panel reuses unchanged
  cases; panel size is not in case identity.
- **Feature report:** actual craft successes and sampled recipe access are
  separate from calls/truthy returns. The final collector retains its complete
  observed method registry, so zero-call routes do not disappear. Unavailable,
  unreached, ready-unused and attempted-without-success are different leads.

Tooling commits: initial collector `03ab118e`, complete registry/identity and
feature follow-up `5dccc96e`. No game or policy behavior changes in this work.

## First calibration: the existing feast correction

Frozen baseline runtime `ddfbd5d0`; candidate runtime `f8e633c5`. Standard
16 seeds × four policies on each side: **64 matched pairs / 128 observed
campaigns**, 150-day ceiling. The only differing normalized runtime/policy/
harness source is game.js. All 128 standard rows **and final gameplay hashes**
match their independently saved historical deed-screen results.

Initial collector `03ab118e` produced these panels. Its method registry was
not retained, so its feature report explicitly labels method coverage partial.
The final collector adds that denominator and stronger cache/case checks.
Four final-collector cases reproduce the original rows, final hashes and all
23 metric values; their on/off pairs also match. Different observer digests
are never pooled into one matched scorecard.

The calibration comparator returns **review_required for every policy**.
This is deliberately broader than reporting 38 → 31 wins:

| Policy | Additional material screen findings beyond wins |
| --- | --- |
| capable | First-bearer survival through day 60: −12.5 percentage points |
| maker | Player deaths/run +0.25; community loss +6.25 points; sampled living NPCs −0.286; Table access also declines |
| merchant | Player deaths/run +0.625; deaths per 100 calendar days +0.557; survival through 60 −6.25 points; community loss +6.25 points; Table access declines |
| caregiver | Table invitation and entry −6.25 points each |

The merchant death measures have exploratory intervals above zero; the other
listed deterioration is a practical review watch in this screen. None is a
multiple-testing-adjusted significance claim or a confirmation-sized result.
The full `balance-feast-comparison.md` shows **all** metrics, including those
without a material signal, by policy. JSON retains paired tails and coverage.
No metric is dropped because its result is inconvenient.

These observations do not establish a direct causal chain from a serving to
each later death. Nor does a population average over different run lengths
isolate a population effect. The prior `feast-outcome-audit.md` retains the
actual four-case divergence traces. Keep these interpretation limits visible.

## Repeatability and integrity evidence

- **12 sampled neutral pairs / 24 retained proof jobs:** four policy/seed-7
  pairs on each calibration side and four final-collector pairs. Full standard
  rows and final gameplay hashes match on/off. The hash excludes only the
  three established wall-clock pacing diagnostics. Every retained case key
  and result digest is reverified using Node's original JSON serialization.
- **Resume:** an identical final-collector invocation reuses all eight jobs
  (four observed cases and four off controls), with no new simulation.
- **Expansion:** seed 7 → seeds 7,42 reuses eight jobs and adds four observed
  cases. **Merge:** independent disjoint shards reproduce every one of those
  eight rows and the same options. These operational proofs precede the final
  addition of the complete method registry; the scheduling/merger logic is
  unchanged, and final-collector resume is separately verified.
- **Corruption:** a deliberately altered copy of one checkpoint is rejected
  with exit 1; the valid cache is untouched. Unit proofs also reject overlapping
  shards, mixed source contents, policy/flag mismatches, wrong declared seeds,
  duplicates, missing neutrality and observer failures.
- **Guardrail behavior:** tests prove that better wins cannot cancel poorer
  food security or hide one playstyle's loss behind another's gain; unknown
  survival remains unknown, and descriptive movement is not called better.
- **Validation:** 23 focused assertions; quick **153/153 (34s)**; full
  **925/925 (136s)**. Exact logs, source/contract fingerprints, raw panels,
  observer proofs and artifact hashes are retained. No quarantine or weakened
  game assertion. Comparator exit 2 is an intentional review/invalid result,
  not a crashed experiment.

## Feature-use leads and limits

The 16-seed recipe census identifies known/material-ready recipes with no
attempts, such as maker's sharpened stick and spring snare. This is a lead,
not proof of a defect: replacing stronger owned gear may be a bad choice.
The final collector's single-seed-per-policy census proves that zero-call
routes such as league calls, medicine donation and some food processing stay
visible. Its small sample is not a broad dead-spot conclusion.

The four profiles are mixed strategies, not pure pacifist challenges.
Tier-three weapon/armor acquisition is one useful gear measure; accessories
and action-granting items need their own quality assessment. A call/truthy
return is not a universal success or a measure of fun. Recipe readiness is
sampled, so absence of a sample does not prove materials never existed.

Daily point samples can miss overnight starvation; death causes remain a
separate guardrail. Metrics and review thresholds must not become quotas or
incentives for food spam, class switching, unnecessary chores or inheritance
gaming. Any intentional tradeoff needs its measured cost and reason recorded.

## Next measurement work

1. Expand the pinned collector to matched **64 seeds per policy** for small
   effects, and reserve disjoint holdout seeds before repeated optimization.
   This first screen does not claim to complete that confirmation.
2. Derive fixed early/mid/late and common-risk-set comparisons from retained
   daily samples; distinguish population changes from longer exposure.
3. Add opportunity-conditioned contest/show/ability funnels and landed
   effects/costs, NPC verb parity, and action/accessory gear evaluation.
4. Add named pure noncombat, contest/show-focused, region and job cohorts.
   Keep their results separate, then pair the relevant flows with mobile
   playtesting and an explicit human quality rubric.
5. Use the scorecard for Garden and subsequent roadmap changes; those game
   features remain unfinished. No deploy or service-worker bump.

Reproduction, resume, shard and comparison commands are maintained in
`docs/SIMULATING.md`. `balance-validation.json` maps the exact artifacts and
records the operational proofs and remaining limits.
