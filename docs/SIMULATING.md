# Simulating The Oversight — how to measure a change

The simulator is the best tool we have for answering "what does this lever
actually do?" This page is the short manual. The audit behind it is
`evidence/2026-10-14/simulator-audit.md`.

## The one rule

**Compare, never eyeball.**
- Run the same seeds, days and policies **before** and **after** a change, and
  read the difference.
- One run is an anecdote. Use at least 8 seeds; use 16 when the effect is small.

## Policies (bots)

| Policy | Use it for |
|---|---|
| **`capable`** | **Default for lever work.** Flees for real, uses abilities, scores choices (no "always option 0"), takes the Table seat at day 90+, holds conversations, climbs the scale ladder |
| `competent` | Legacy baseline. Can't flee, never uses abilities, never answers the Table. Use only to compare against old evidence |
| `winseek`, `leadcourt`, `socialite`, `kind`, `oraclev2`… | Niche behaviours (see `scripts/policies/README.md`). Note: `kind` currently behaves like `competent` |
| `zero`, `mvc`, `leader` | Do-nothing baselines |

Policies draw randomness from their own seeded stream
(`global.__policyRandom`), so changing a bot doesn't change the game's luck.

## Commands

```bash
# The standard before/after table (8 seeds x 150 days)
SEEDS=7,42,99,1234,555,777,2026,31337 POLICIES=capable DAYS=150 \
  OUT=evidence/<date>/<label>.json node scripts/sweep-compare.js

# What silently fails, and what never runs (seeds x policies, about 1 min)
SEEDS=7,42,99,1234 POLICIES=capable,competent DAYS=150 LABEL=<label> \
  node scripts/sim-audit.js

# Any sim, with swallowed errors reported
SIM_CATCH=1 node <your-sim>.js
```

## Reading the sweep table

| Column | Means |
|---|---|
| `won` | Runs that won at the Table |
| `medD` / `maxD` | Days survived (median / max) |
| `maxWave` | Highest wave **unlocked** (not necessarily fought) |
| `nat%` | Reached national rank |
| `inv%` | Was **invited** to the Table (`tableWaiting`) |
| `sat%` | Actually **sat** at the Table |
| `delib/d` | Deliberate player actions per day |
| `deaths` | `player:<cause>` = the bearer died; `<kind>:<cause>` = everyone else. Captured live, never truncated |

## Telemetry you can count

Sims keep the **full** stream (`Game.state.telemetry`). The phone keeps only
300 events; that cap doesn't apply to sims.

**Milestones** (`src/js/telemetry-hooks.js`):
- Table: `table_entered`, `table_path`, `table_failed`, `table_won`
- Progress: `arc`, `scale_rank`, `ascension`, `village_lost`
- Builds: `ability_used`, `synergy_active`

**Also:** `death`, `combat_start`, `combat_end`, `contest_end`,
`ability_granted`, and the rest listed in the audit.

Count them in an `extraMetrics(Game)` hook passed to `runComparison` (see
`scripts/sweep-compare.js` header).

## Pitfalls (each one has bitten us)

- **Never run two games in one node process.** Use separate processes;
  `sim-audit.js` shows how.
- **Don't read the bearer's state *after* `tbEnd` / `endDay` / `playerDeath`**
  when a death could have happened inside. A successor has replaced them.
  Snapshot before the call.
- **Single-seed tests are fragile.** If a test needs a specific seed to reach
  some state, pin the state directly instead.
- **Stale green list?** Run `node scripts/check.js` before trusting a sim on
  changed code.
- **Big effects that were silently off are now on.** Forage yield, 23 relic
  perks, villager flank/War Cry, aid fights and more. Compare against
  post-2026-10-14 baselines only.

## Balanced scorecards (2026-10-15)

Win rate is neutral: material changes in either direction request investigation
(`change_watch` / `change_signal`), without labeling lower wins a regression
or higher wins an improvement. Winning should be difficult. Record causal
evidence, counterplay and accepted tradeoffs in `docs/SURVIVAL-LEVERS.md`.
Other directional warnings are review triggers, not automatic tuning orders.

Read `docs/MEASUREMENT-PLAN.md` before optimizing a lever. The scorecard has
23 separate metric contracts, not a weighted win score. A regression in one
policy is never canceled by another policy's improvement. Starting practical
thresholds are review triggers in `scripts/balance-metrics.json`, not quotas.

```text
node scripts/balance-panel.js --root <baseline-checkout> --n 16 --out <baseline-panel-dir> --par 4
node scripts/balance-panel.js --root <candidate-checkout> --n 16 --out <candidate-panel-dir> --par 4
node scripts/balance-panel.js compare --before <baseline-panel-dir>/panel.json.gz --after <candidate-panel-dir>/panel.json.gz --out <comparison-prefix>
node scripts/balance-features.js <candidate-panel-dir>/panel.json.gz --out <feature-prefix>
```

Run the current observer against both roots. The root controls game, policies
and shared harness; the caller controls the observer and contract. The full
source manifests normalize CRLF to LF and must stay stable throughout a panel.
Archives without their own `.git` report a null HEAD rather than inheriting
the enclosing checkout commit. Their content manifest remains authoritative.
The contract/observer fingerprints must match between paired panels. Different
policy/harness sources, flags, Node versions, regions or case lists invalidate
a game-only comparison. Separate named experiments are needed for bot changes.

Default: capable/maker/merchant/caregiver, 150 days, ordinary Columbus origin,
16 standard seeds. `--policies`, `--days`, `--origin`, `--region` and explicit
`--seeds 7,42,...` select other named cohorts. Clear legacy SEEDS/POLICIES/
DAYS/REGION/ORIGIN environment overrides. Gameplay flags are recorded. The
first selected seed is run with observation enabled/disabled for every policy;
`--proof-seeds` selects more cases. A passing sampled neutrality check is
required; it is not proof for every possible seed.

Finished cases are checkpointed under the output directory with content and
result digests. Repeat the same command after interruption; completed valid
cases are reused. Expanding `--n 16` to `--n 64` in the **same output directory**
reuses matching cases because panel size is not in the case identity. A changed
observer, contract, source or case input produces a different identity. Errors
retain per-case failure receipts. Do not run simultaneous writers in one output
directory; use separate shard directories instead.

For disjoint shards, use identical runtime, observer, policies and options,
different explicit seed lists, and distinct output directories. Merge in the
same seed-list order for baseline and candidate:

```text
node scripts/balance-merge.js <shard-a>/panel.json.gz <shard-b>/panel.json.gz --out <merged.json.gz>
```

The merger rejects overlapping seeds, mixed source contents and invalid
shards. It preserves per-case data and the original shard provenance.

Comparison output includes paired means, differences, median/tails, direction
counts, coverage and deterministic bootstrap intervals. Exit 2 means a report
requires review or is invalid; inspect its decision field. A runner error exits
1 and retains diagnostic data. A valid collection or a comparison with no
material signal exits 0. No-material-signal is not equivalence or release approval.
Intervals are exploratory, unadjusted for multiple metrics. Screens below 64
seeds/policy are labeled; use confirmation/holdout seeds before small-effect claims.

Daily state samples are taken immediately after the existing policy.daily call
and once at the end. Multiple observations of one calendar day replace the
same-day sample. These are **point samples**, not continuous exposure: a low-food
sample fraction of zero can coexist with overnight starvation. Death causes,
community loss and first-bearer survival therefore remain separate guardrails.
Early termination before a survival milestone is censored rather than scored
as survival or death. Mean NPC population also depends on observed run length;
use the retained daily samples for time-window diagnosis before attributing a
population difference to one cause. Opportunity funnels and fixed early/mid/late
windows are explicit follow-up work in the plan.

## Maintaining measurement

The shared quick/full check discovers `scripts/godpath/test-measurement-workflow.js`.
It checks contract structure, actual metric coverage, source fingerprints and
sampled observer neutrality in a retained real panel. It does not rerun costly
campaigns on every edit or require historical game sources to match today's game.
Text source fingerprints normalize CRLF to LF so different checkouts can use
the same proof; the actual runner still requires exact observer/contract bytes
between paired panels.

When changing balance-panel.js, gear-usage-audit.js, balance-scorecard.js or the
metric contract, rerun all four default policies with `--seeds 7` in a new output
directory (on/off controls are automatic). Inspect warnings, raw cases and
neutrality. Retain the resulting panel under evidence and update balance-proof.json:
set panel to its relative path, panelDigest to its raw SHA-256, and normalizedSources
to SHA-256 of each listed source with CRLF replaced by LF. Keep the old proof and
reports as historical evidence. Update focused assertions and the plan for changed
metric meanings; never just refresh fingerprints to bypass a failed neutrality
proof. Any changed collector/contract starts a new measurement lineage: rerun both
baseline and candidate, without mixing old case caches into the comparison.

For a gameplay-only change, retain the existing collector proof, run matched
baseline/candidate panels, inspect every policy and the feature census, then record
the decision and limitations. A 16-seed screen is diagnostic; no-material-signal is
not proof of equality. Before pushing, run the quick and full checks from AGENTS.md.
For a new feature, document its opportunity denominator and what its success event
means; update observed-method registration when adding a new public verb. Availability,
attempt, accepted call, landed effect and useful reward are different observations.


## Fixed calendar windows and competing endings

After a valid game-only comparison, run:

```text
node scripts/balance-windows.js <before.json.gz> <after.json.gz> <windows.json>
```

This read-only report uses the same strict contract, policies, flags, harness,
Node and case identity checks as the scorecard. It does not change collector
lineage or require recollecting an otherwise valid panel. Default windows are
calendar days 2-30, 31-60, 61-90, 91-120, 121-150 (the usual first sample is day 2).
Each metric includes only cases with every day observed in both arms and valid
values on every such day. Missing dates are listed by case; unknown metric
pairs remain explicit. Means are per-case daily means, then equally weighted
across eligible pairs. These are conditional complete-window diagnostics, not
unbiased full-cohort survival estimates or a replacement balance verdict.

Boundary counts include actual community loss, won, other terminal, observed
at the boundary, and unobserved at the boundary. A Table ending competes with
later observation; it never supplies hypothetical village survival or death.
Driver caps can stop before calendar day 150 and remain unobserved there.
Do not dismiss community warnings because a selected surviving subset looks
healthy. Keep raw panels, input hashes and all exclusions beside the scorecard.
`test-balance-windows.js` runs automatically in quick/full checks and tests
unequal horizons, terminal outcomes, holes, unknown values and identity failure.

### Passive build-choice evidence (shared with Codex)

`const observation = require('./scripts/lib/build-choice-observer').install(Game)` wraps only actual existing buildScore/buildDecide/chooseAbility/keepAbilities calls; inspect observation.decisions and observation.dropped, then observation.restore(). It does not evaluate extra abilities, ask knowledge questions, draw random numbers, read the clock or emit game telemetry. That matters because extra NPC scoring can plan a target and consume luck. Primary codex/resume-claude integrates it into deed-screen --choices1; this shared branch keeps the helper standalone and does not import primary game/region alternatives.

Retain helper/driver source hashes, flags and an observer-off control; require identical result rows and full gameplay hashes before using traces. Count distinct actual calls as NPC buildDecide plus player chooseAbility/keepAbilities; exclude duplicate player buildDecide records. Pick is an intention, not a delivery receipt. Returned null is normal for some real choices. Scores tagged onSheet=false include nested target-planning evaluations; later unscored sheets do not inherit earlier scores. Logs cap at5000 per run with explicit dropped: nonzero means incomplete evidence. Run node scripts/godpath/test-build-choice-observer.js; no game tuning or measurement-core revision is implied.

Source and 16/64-seed rejected Miser-access evidence: primary commit e928d576, evidence/2026-10-15/miser-access-audit.md. The offer-only candidate was not retained; test a knowledge-bound deliberate Miser strategy separately from generic build preference.
