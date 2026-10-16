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

### Gear and feature-use audit

`node scripts/gear-usage-audit.js --label <name> --n 16 --days 150 --par 4`
records actual acquisitions by source (contest, show, package, trade, craft,
and each corpse kind), including tier, armor/weapon fields and beam resistance.
Use `--region eu_temperate --origin "Berlin, Germany"` for an explicit
regional landing on the same standard driver. Invalid/unplayable regions
fail instead of silently falling back. Omit these flags for ordinary origin
routing. Reports record the actual region/origin; comparisons across regions
include their different maps, ecology, familiarity and RNG histories, so do
not attribute an outcome difference to one isolated lever. `sweep-compare`
also accepts `region`/`origin` options or `REGION`/`ORIGIN` environment values.

Use `--policies merchant,maker,caregiver` for livelihood probes and `--n 64`
for balance comparisons. `--root <frozen-checkout>` runs identical current
observer code against frozen game/policy sources; reports include hashes.

Starting gear, equipping/transferring an owned item and taking a successor's
pack are not earned prizes. The observer excludes those transfers; corpses
remain separate from monster drops. Method calls are reachability evidence,
not universal success counts. Inspect policy counters/errors and pair this
with `sim-audit.js` coverage. Use the real `Game._fullStatus` when proving UI
inventory behavior: the default simulator intentionally slims `status()`.

The census also records `crafts` (attempts and actual successes per recipe)
and `recipeAccess` (highest knowledge, known samples, materials-ready samples).
Knowledge samples include succession; readiness can be missed between samples.
These fields distinguish an unused output from unknown recipes or missing
materials. They do not classify each failed attempt. The observer's 100-day
on/off state-hash proof covers this additional sampling.

`stateHashVersion: 2` excludes only the three known wall-clock diagnostics
`pacing.lastTs`, `pacing.dayMinutes` and `pacing.totalMin`. The earlier hash
omitted only `lastTs`; machine load can change the other two. Do not use
old raw hash mismatches as evidence of gameplay divergence or compare hashes
across normalization versions. Gameplay fields, telemetry and any other
pacing fields remain covered. Observed outcomes and source manifests in
older matrices remain useful separately from that raw hash.

`node scripts/coalition-audit.js --label <name> --n 16 --root <frozen-root>`
is a **prepared relationship capacity probe**. It generates actual villagers,
prepares ordinary/strong alliances, uses public call/commit/dawn verbs, and
records distinct recruits, duplicate inflation, gate readiness and upkeep.
Its prepared food and relationships do not establish natural alliance
formation, food affordability, campaign survival or ending probability.

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

## Campaign coverage

`campaigner` and `campaigner-control` share capable survival and cautious
late-game waiting. The seeker uses public coalition actions and actual
food/gear transfers, never prepared progression or relationships. Use:

```powershell
node scripts/campaign-audit.js --n 16 --days 240 --jobs 4 --out .git/campaign-natural.json
node scripts/campaign-audit.js --root C:/path/to/frozen-checkout --n 16 --days 240 --out .git/campaign-baseline.json
node scripts/campaign-prepared.js --seed 7 --titan finale --loadout advanced
```

The last command is explicitly **prepared**: strong relations, large food
and gear stock, and nearby arena placement. It uses real recruitment and
combat but does not establish acquisition, affordability or natural odds.
Later campaign branches remain incompletely covered. See the dated
`campaign-usage-audit.md` before interpreting a policy counter as a victory.
Actual battle starts can occur during approach: the audit observes the
public start/end methods and verifies observer-on/off gameplay hashes.

## Table and ability-access observer

`scripts/godpath/deed-screen.js` records actual kit offer appearances, daily
held-ability samples, Table decisions, deeds, actual feast-power receipts and a gameplay hash. Its on/off
parity proof checks that observation does not change the campaign. Repeated
sheet presentations count repeatedly; daily samples are not an exhaustive
acquisition census. Prepared fixtures are separate from natural campaigns.

```powershell
node scripts/godpath/deed-screen.js --n 64 --par 4 --out .git/deed-panel.json
node scripts/godpath/deed-screen.js --seeds 99,2,12,24 --policies caregiver --out .git/deed-traces.json
node scripts/godpath/deed-screen.js --root C:/path/to/archive --source-head <full-40-character-commit> --n 16 --out .git/archive-panel.json
```

Do not emit extra Game.tele events merely to observe a route: its Date.now
read advances the harness's counter-based clock and can change later IDs.
The feast-use observer wraps the existing spend call and reads its canonical
receipt instead. Compare observer-on/off hashes and standard rows, and use
an unaffected policy as a control for cross-version measurement.

On success, `creditDeed` returns the resulting track total, not the earned
increment. Compare actual before/after XP when proving a reward amount;
observe successful calls separately when counting credited events. Defeat
can also earn family-death and mantle XP, so isolate the deed under test.

An archive without its own `.git` reports a null source HEAD unless supplied
an immutable `--source-head`; it never inherits the enclosing checkout's
HEAD. Compare file hashes too. Earlier archive reports can contain a parent
checkout's HEAD, so that field alone is insufficient provenance.

The default capable/livelihood Table reader uses the meter in the public
italic prompt and the requirement in the choice label. Missing readings
remain unknown. `CAPABLE_READ_STAKES=0` reproduces historical word-only
selection; `=1` retains the legacy private-meter diagnostic fallback when
the prompt lacks a reading. It is not the default public-information policy.
`CAPABLE_GREEDY` remains a separate opt-in diagnostic. Record policy flags
when comparing panels. See `evidence/2026-10-15/table-access-audit.md`.

## Windows checkout

The shared harness reads script order from `index.html` without a shell. Some
older proof scripts still use `grep`/`head`; run the complete legacy net with
the installed Git for Windows tools in the current PowerShell process:

```powershell
$env:ComSpec = 'C:\Program Files\Git\bin\bash.exe'
$env:PATH = 'C:\Program Files\Git\usr\bin;' + $env:PATH
node scripts/check.js --jobs 4
```

`.gitattributes` keeps source and fixture text in LF: several legacy audio
and UI tests extract actual functions by newline boundaries. Syntax-check
probes use `execFileSync` where Windows paths must be passed as arguments.

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

## Player-controlled command turns

Run `node scripts/godpath/test-player-command-turns.js` for NPC Voice/Crowd
Moves support. The shared-kit proof covers actual paid NPC callers, both
steppers, real player Strike, save/load, spent cast limits, stale callbacks,
status loss, ordinary-turn preservation, broadcast and actual-entry Rally Aura.
It is automatically discovered by quick/full checks. Keep it current whenever
changing commands, combat turn order, status ticks or fight serialization.

Support code uses `tbOtherAllies(actor)` for distinct living recipients.
For a player recipient, queue `tbCommandPlayer(actor, label)` and let the
driver hand over after the caster returns and settles its food/use gate.
Never call `tbVillagerTurn(player)` or enter a player turn inside an unfinished
NPC cast. The bonus uses the normal player choices and status/action costs;
finish it through the normal action/Wait path. Do not replace the normal
player turn or advance foes while a human is choosing. Persist the queue,
return cursor and spent casts together. Async callbacks must retain both the
original fight identity and generation. If load repairs the order after
dropping an obsolete fighter, an active bonus must still select the player
by key; slot0 can belong to a faster foe.

The dated player-command audit includes a passive replay tool:

```text
node evidence/2026-10-16/player-command-probe.cjs <root> <policy> <seed> <out.json.gz>
```

One process loads one shared harness. Compare its row, full final-state hash
and23 metrics with the corresponding panel before using its call receipts.
Raw state includes known pacing diagnostics excluded by the standard hash;
do not mistake those timestamps for gameplay effects. Calls trace that named
replay, not every run in a panel. Prepared bonus turns and unchanged campaign
metrics cannot prove natural NPC acquisition, usefulness or complete Voice
cost parity. That dated audit predates the personal grounding follow-up;
the daily Voice follow-up covers player turn entry; full NPC feast/social
parity remains open.

## Maintaining measurement

Strategy experiments on one source: use `scripts/policy-scorecard.js` with
explicit control:candidate pairs. It keeps the23 existing metric contracts,
requires complete same-source panels, passing neutrality and no warnings,
and labels results as strategies. Do not relabel a policy choice as a game-only
balance change or weaken balance-panel's policy/harness mismatch guard.

```text
node scripts/policy-scorecard.js --panel <panel.json.gz> --pairs capable:capable-voice-ready,maker:maker-voice-ready,merchant:merchant-voice-ready,caregiver:caregiver-voice-ready --out <report-prefix>
```

The voice-ready cohorts retain their base's work/offer/encounter choices.
Their explicit preference keeps at least max(500kcal,40% of bank) and75 own
grounding immediately after Be Heard. It does not promise those reserves
after subsequent combat, travel or other abilities. Social casts need a known
living other member below the progressive ceiling (ordinary+2 stops at90).
Callbacks run only at already chosen visible hunt/raid actions; contest
interruptions are not forecast or bypassed. Meter/trust inputs are game API
state, not proof that native HUD exposes every exact value. Keep defaults
as controls and use disjoint holdouts; the dated voice-policy audit records
the fixed plan, source, warnings, opportunity windows and named losses.

Quick/full discovers test-voice-preparation.js and test-policy-scorecard.js.
Maintain actual paid action/recipient proof, resource boundaries, real raid
caller, inherited playstyle handlers and invalid strategy-panel guards together.

Daily Voice upkeep: `scripts/godpath/test-daily-voice.js` runs automatically
in quick/full. Preserve actual paid action → real constructor/turn entry →
damage/expiry → save/reload, plus late/dead/fled/hostile/self-alias cases.
The existing `_gvVoiced` fighter receipt survives saves; bonus turns consume
duration rather than refresh it. Natural-holder traces must count paid casts
separately from same-day fight opportunities: `godDay` in daily can follow
upkeep encounters. See the daily-voice audit before interpreting zero effects.

Grounding upkeep: `node scripts/godpath/test-grounding-person.js` is discovered
by quick/full checks. Keep legacy/current-bearer storage, per-person history,
zero, village replacement, actual succession, paid Voice saves, finite lessons
and real feast/retry paths covered together. Do not reset an NPC to100 when
they become the bearer or infer full NPC feast/social parity from a counter.
Receipt-only telemetry must not advance the harness clock: Date.now also
supplies generated IDs. Grounding reuses the last recorded timestamp with
current day/part; its focused test rejects an added clock read. Preserve
diagnostic arms when discovering a confound, then rerun corrected panels.
Historical source-bound verification and reconstruction are documented in
`evidence/2026-10-16/grounding-audit.md`. Compare all contracted metrics by
playstyle; a win decline requests investigation and judgment, not a buff.

NPC eligibility revision (2026-10-16): new panels correlate NPC classes/gods
with a distinct, known living roster resident who is not the current bearer
at the observation. Definitions resolve villagers, saved rosterChars, then
background survivors; roster IDs are deduplicated. Class events are filtered
at their real event time, so a genuine earlier NPC class survives succession
as historical access, but a later player-only build does not become NPC access.
The NPC-class fraction uses identities observed at daily/terminal samples.
Unknown identity history is retained for the whole run, even if a later
same-day snapshot overwrites the earlier daily detail; any such unknown
history makes that fraction null. The living-NPC mean is null if a retained
per-day population sample has an unknown definition. A zero-HP record alone is not declared dead: canonical person.dead is
the life flag, matching the resident definition. Known-needs hunger keeps its
explicit partial denominator, counting each person once per sample.

`npcExposure` retains per-day eligible/unknown/dead IDs, real class/god holders,
duplicate roster counts and excluded map-record reasons. It keeps the last
daily/terminal snapshot for a calendar day, not continuous exposure. Class
recognition events may establish historical access between snapshots; they do
not invent holder-days. `balance-features.js` reports coverage and sampled
holder-days, labeling legacy exposure unknown. Old NPC map scans can include
self/dead/departed records. Keep those reports historical and rerun both roots
with the same current observer/contract before interpreting a change. This
revision changes measurement, not NPC builds or gameplay difficulty.

Source-bound results, reconstruction and the shared branch's disclosed
validation limits: `evidence/2026-10-16/npc-measurement-audit.md`.

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

## Garden coverage diagnosis

On the Codex godpath branch, the deed screen also captures initial, pre-closure,
meal and post-closure resident snapshots plus actual per-eater intake. This
observer is not a runtime deed gate. It never pools different harvesters.

```text
node scripts/godpath/deed-screen.js --n 16 --out <panel.json> --par 4
node scripts/garden-coverage-report.js <panel.json> --out <report-prefix>
node evidence/2026-10-15/garden-coverage-neutrality.cjs --seeds 7 --out <proof.json.gz>
```

The panel pins the full game/policy/harness source manifest at start and end;
changed sources reject the run. The report accepts JSON or gzip. Unknown
residents/budgets, changing rosters, lone survivors and unclosed days stay
separate. No observed intake fails as unknown rather than reporting zero
coverage on a source without the intake feature. Fixed 300/1000-kcal references
and nominal person budgets are sensitivity measures, not authored thresholds;
they do not replace actual adjusted daily needs. Feeding oneself and feeding
other residents are measured separately. Snapshot sampling can miss a person
who joins and leaves between observations; runtime membership accounting is
still required before these observations can become an ascension deed.

Compare standard rows and full gameplay hashes to the matched balanced panel.
The neutral-proof script runs separate observer-on/off children for every
selected policy/seed; the default is all four policies and seed 7. Keep raw
panels, the actual observer sources and proof jobs with the report. See the
2026-10-15 garden-coverage evidence for the first 16-seed screen and its limits.

## Deliberate village feeding

`--policies garden-feeder` selects the named caregiver-based feeding strategy.
It creates/sows/tends/harvests normal plots and gives full gifts to nearby
residents at the gift card's visible hunger threshold. Food/kit/XP are never
granted. It keeps 2,000 carried kcal plus a conservative full gift and one
whole-unit rounding before giving; real survivals, contested harvests and
limited opportunities still matter. This mixed policy is not a pacifist test.

The ordinary four-policy baseline remains unchanged. Use the same feeder file
and registry on both roots when comparing a game lever, then run matched
16-seed screens and 64-seed confirmation where effects are small. Keep every
metric, including ending movements and community warnings. A correct calorie debit is
not evidence that a feeding strategy is balanced or that Garden is complete.

To inspect a policy's own counters and actual gift transactions while replaying
a saved case without the scorecard observer:

```text
node scripts/godpath/probe-feeder-policy.js --panel <panel.json.gz> --seed 7 --out <probe.json>
```

Use `--root <frozen-root>` for a baseline. The probe checks source/flag/Node
identity before and after, and rejects a different standard row or gameplay
hash. Policy counters are diagnostic, not ascension receipts. For prepared
phone care controls, run the dated garden-gift-phone-fixture.cjs generator and
serve its .git page with ?debug=1 on a fresh loopback origin. The PWA's offline
cache can retain old scripts on reload; verify the displayed gift description
before testing a change. Do not bump the release/SW version for a local test.

## Garden actual meal demand

`deed-screen.js` observes the detached `villagerMealDay().demand` result at the
actual call. `garden-coverage-report.js` separates physiological NPC meal need,
personal-work food, communal request, actual draw, fasting and no-request meals.
`nominalKcal` in that return is the effective basis inside the ration wrapper;
the person record is restored afterward. The request is zero on a chosen fast
or when the post-production gap is at most 50 kcal, matching the existing draw
rule. `unmet` compares need with the meal's `ate` result, including any spoiled
food that settlement counts; it is not a separate nutrient-quality measure.
Source-attributed nourishment remains distinct from food physically consumed.

Missing or duplicate NPC settlements are unknown, not zero need. NPC demand
excludes the bearer, whose activity/food bank needs a separate denominator.
The report requires positive requests from every NPC before counting coverage
of every request, so a no-request village cannot pass by vacuous truth. This
view describes an opportunity and does not author an ascension threshold.
Dawn/pre/meal/post membership snapshots still cannot prove continuous presence.

Run the existing deed-screen/report commands with a named policy cohort; retain
observer-off controls and match standard rows/full gameplay hashes against the
balanced panel. The runtime demand return is additive metadata, not saved state
or new telemetry. Never infer new demand fields from historical nominal diets.
See `evidence/2026-10-15/garden-demand-audit.md`.

## Relay service and the authored deed

The Voice's fitting deed is current Relay office service by that actual person.
Class age and synergies do not substitute for it. The same read-only deed API
serves player and NPC; office removal/transfer revokes pre-ceremony eligibility.
Already recognized gods remain recognized. No past service ledger is invented
from an absent office, nor an appointment date invented for a legacy live one.

Replay a saved case without the scorecard observer to inspect actual role calls
and bearer/class changes:

```text
node scripts/godpath/probe-relay-service.js --root <root> --panel <saved-panel.json.gz> --policy merchant --seed 7 --out <probe.json>
```

The probe preserves original calls/returns, checks source/flags/Node, and must
match the saved standard row and complete gameplay hash. Availability calls
are not unique opportunities; the output keeps their count and distinct days
separate. Policy counters are diagnosis, not ascension receipts. See
`evidence/2026-10-15/relay-deed-audit.md` for the 16/64-seed experiment and
separate dead-office follow-up. Use the current neutral win interpretation.

The Relay lifetime fix settles a canonical dead holder at registerDeath,
successful load, and the communications tick. Its death book includes day zero;
older memorial/dead flags also count. It calls the existing removeSwitchboard
path, leaving the network live and reopening the ordinary appointment UI.
Pure switchboard/availability reads remain pure. Injury or a successful death
refusal does not vacate an occupied living post. The mantle does not appoint
its next bearer. Probe snapshots include holderDeathDay/holderFallen so a
claimed-but-dead post cannot be mistaken for a bot ignoring a live opportunity.
The lifetime comparison uses the authored-deed candidate as its baseline;
do not collapse it with the prior class-age-to-office change. See
`evidence/2026-10-15/relay-office-audit.md`.


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

The Relay service probe also records raw grounding, accumulated service,
per-person charged day and pending System conversation at actual snapshots.
These fields diagnose clock/opportunity changes; they are not a new progress
receipt or a substitute for matching the original campaign row and state hash.


## Prepared Market guard cohort

When standard campaigns do not sample a Market God, isolate the protection
contract without claiming full-build viability:

```text
node scripts/godpath/probe-market-guard.js --root <root> --panel <matching-standard-panel.json.gz> --n 64 --par 4 --out <guard.json.gz>
```

The panel binds root source, Node, flags and default Columbus origin. Each
seed/monster gets one separate shared harness and private combat RNG. The NPC
has prepared godhood, 100 HP, 10 hunger, no abilities/skills and ordinary
generated equipment; real monster data rolls a fresh full-health body. Retain
both roots' reports, probe/shared-kit sources and initial-state hashes. Reject
nonfinite fight outcomes or mismatched starting states. Compare drone and
physical wolf outcomes, HP, wounds, guard depletion and food, not a single
win rate. `mFlee`, `vFlee`, `vDie` and `vKill` are distinct field outcomes.

The result precedes the normal caller's later wound settlement and is not
campaign survival. Historical market-beam arms permit a learn-first withdrawal
despite `opts.noFlee=true`; the separate sealed-learning correction prevents
that exit. Retain old results under their original source. A vFlee result at
the fifteen-round cap with judges=true is a legitimate judged loss, not an
escape. Never relabel old withdrawals as deaths or victories.
The probe checks root/probe stability and fails on stderr. See the dated
market-beam audit for exact inputs and these limits.

Commerce contract checks: run `node scripts/godpath/test-haggle-commerce.js`
for actual cart and resident-conversation quotes/payment, tab-first rollback,
fully credited paid practice, free gifts, receipts and the existing river
discount. New routes using finished-food payment should share the effective
buyer quote with their display/receipt and credit the whole settled value,
including earned store credit. Preserve whole-food-unit payment semantics.
Run matched panels before making the ability more available; prepared slotted
Haggle proves a caller, not naturally earned class viability.

### Observe actual build choices

`node scripts/godpath/deed-screen.js --root <root> --n 16 --policies merchant --choices 1 --par 4 --out <json>` adds the passive `scripts/lib/build-choice-observer.js`. It records only evaluations and decisions the shared brain already makes; it never asks for another score, knowledge query, random draw, clock tick or game telemetry event. Extra NPC scoring can itself plan a target and consume RNG, so do not use it as an observer. Retain the current observer against both roots and a matching `--observe 0` control; match result rows and full gameplay hashes to the balanced panel. The source manifest includes the helper.

`buildDecide` records both player/NPC plans. Player `chooseAbility`/`keepAbilities` records the public choice call, including actual offered scores when that same sheet was evaluated. For distinct choice counts use NPC buildDecide plus player choose/keep, excluding duplicate player buildDecide records. `result.pick` is a decision, not proof of delivery; returned null can be normal. Compare actual held samples/callers separately. Nested target-planning evaluations are tagged onSheet=false. Unscored choices have no inferred scores; prior sheets/days do not lend scores to them. Logs cap at5000 per run and expose dropped; nonzero truncation is incomplete evidence.

Miser intent cohorts: merchant-hoarder / merchant-dealer declare on-sheet ability preference while retaining the same merchant survival/actions. Run them alongside merchant control and the four standard policies, with identical policies on each game root. Their names are preferences, not proof of the final subclass or independent populations. Keep the locked ending frame, current bearer and ever-class separate: a former Miser's successor can win as an ordinary track, or continue a Miser frame priced before the mantle passed. No XP, slots, recipes, gear or god gates are granted. See scripts/policies/README.md and the retained miser-intent audit for ranking and swap costs.

A read-only natural checkpoint can be replayed in the browser without calling save/syncRun during the sim (these can consume clock-derived identifiers). Retain a matching complete result/fullstatehash first; reconstruct save serialization into a copy. Explicitly label imports and any presentation flags suppressed for browser inspection. Use a fresh local origin and check the actual save result instead of bypassing stale-save protection. The current capable policy leaves the introductory knack unanswered, and the Node run leaves arrival presentation unacknowledged; a phone replay is not proof of identical human early-game setup.

Introductory-choice audit: ../evidence/2026-10-15/knack-policy-audit.md retains an experimental public-choice correction,13 passing prepared assertions and a128-campaign policy screen. It is not adopted: the existing food-deed test fails when both test seeds acquire the feast-blocking reactor early. Keep that failure visible and resolve the progression tradeoff before changing the default. setupGame must leave choices to policies, including idle controls. A policy revision is a separate experimental axis; the game-only comparator correctly rejects it. Do not rewrite source identities or cache keys to obtain a game-balance verdict.
