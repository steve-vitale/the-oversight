# Balanced measurement plan

Steve, 2026-10-15: "Yes, let’s create a more balanced set of measuring telemetry we can optimize from. Don’t simply look at win rate, we need to make sure many key metrics aren’t regressing. Plan this out and make repeatable and scalable."

## Decision rule

Use a vector of outcomes, never one weighted score. Keep results separate
for capable, maker, merchant and caregiver. An aggregate improvement cannot
cancel a regression in one playstyle, food security, survival or gear access.
An intentional tradeoff needs a written reason and the affected metrics.
No automatic reward tuning or deployment follows a favorable report.

Measurement has three layers:

1. **Validity:** matched seeds, days, region/origin, policy flags, policy and
   harness sources; observer on/off neutrality; no source changes mid-panel;
   no missing rows, duplicate cases, swallowed observer errors or warnings.
2. **Guardrails:** first-bearer survival, community continuity, player deaths,
   sampled food/water/health distress, player and NPC progression, earned
   tier-three weapon/armor access by route, and Table access/outcomes.
3. **Diagnosis:** class/ending diversity, cause-specific deaths, succession,
   actual food/nourishment, recipe access and crafting successes, and feature
   calls. A call is reachability, not success or enjoyment. Unknown is null,
   never a fabricated zero. Missing measurement prevents an all-clear.

## Metric contracts

`scripts/balance-metrics.json` versions the practical regression thresholds,
units, direction and interpretation. These are starting **review thresholds**,
not game design quotas. Keep the same contract for a comparison; changes to
it require a reason. Review all policies and raw paired rows.

| Family | Measures | Important limits |
| --- | --- | --- |
| Survival | First bearer alive through days 30/60; player deaths/run and per 100 calendar days; bearer changes | Early termination without observing the milestone is censored, not death or survival. Winning sooner is not a survival regression. |
| Community | Village/population loss; daily living NPCs; hungry/injured NPC samples | Separate NPCs from monsters/hostile humans; do not infer all person deaths are villagers. Sampling is not continuous exposure. |
| Food and health | Sampled reserve below 500 kcal, hydration below 25%, HP below 25; actual consumed/nourishing calories and route breakdown | Fixed thresholds are explicit warning bands, not universal capacities. Useful intake is not the sole value of a social meal. Anonymous food has no invented producer. |
| Gear | Earned tier-three-or-better weapons/armor; contest/show, craft/trade and corpse routes; recipient role | Starting gear, pack inheritance and owned-item transfers are excluded. Packages have their own source; they are not proof of pacifist acquisition. Accessories/action value need separate evaluation. |
| Progression | Any named class; unique classes/gods by player/NPC role; national scale; Table invitation, entry, win | A named class is access, not proof every active/passive works. Report build and ending diversity as distributions, not a target to maximize blindly. |
| Feature use | Contests/shows finished, rewards, real craft successes; known/material-ready recipes; method coverage/errors | Distinguish unavailable, unreached, tried and rewarded. Bot nonuse is not a game defect. Scripted proofs are not natural campaign usage. |
| Integrity | Missing methods, warnings/errors, source identity, observer neutrality, sample coverage | Tool faults and incomparable runs invalidate the report before optimization. |

## Repeatable loop

1. Pin baseline and candidate runtime/policy/harness contents. Name one lever
   and the intended benefit plus plausible risks before running it.
2. Use identical four-policy seeds and 150-day ceiling. A 16-seed-per-policy
   screen finds large problems. Use at least 64 for a small effect; screen
   jobs are reusable because cache identity is per case, not panel size.
3. Prove observer neutrality against ordinary driver results before trusting
   new instrumentation. Keep full gameplay hashes (excluding only the three
   established wall-clock pacing diagnostics). Do not emit extra telemetry
   from an observer: it can advance the deterministic clock.
4. Compare paired per-seed differences for every metric/policy. Retain means,
   paired median/tails, better/worse/tied counts, coverage and deterministic
   bootstrap intervals. Intervals are exploratory and not adjusted for the
   many metrics; they do not prove significance. Practical deterioration is
   a review item even when its interval spans zero.
5. Investigate material regressions and outliers with real traces, then
   playtest the affected flow on mobile. For repeated tuning, reserve a
   disjoint seed set as confirmation; do not optimize endlessly against the
   same seeds. Add other regions/jobs as named cohorts, never mix them into
   one average. Keep model/policy changes separate from game-only levers.
6. Save raw cases, hashes, configuration, summaries and the tradeoff decision
   together. Require green checks before pushing. Keep failed panels and
   limitations; never silently overwrite an earlier baseline.

## Implementation and scaling

- **First:** one read-only observer on the standard shared driver, reusing
  the existing earned-gear observer; a pure comparator with versioned
  contracts and explicit missing-data handling. No gameplay changes.
- **Runner:** bounded worker processes, one harness per child, per-case
  checkpoint files, content-addressed resume, explicit seed lists/shards,
  start/end source manifests, and failure receipts. Larger panels reuse
  finished identical cases and only schedule missing work.
- **First benchmark:** pre/post host-feast nourishment. Report every guardrail,
  including the already-known negative win/death results. This is calibration
  of measurement, not another balance lever.
- **Then:** use the scorecard for Garden's real seven-day deed and later
  subclass/scale/gear changes. Extend outcomes only with observer-neutral
  proofs. The scorecard does not complete those roadmap features.
- **Remaining measurement work:** early/mid/late windows, conditional exposure
  funnels for contests/shows/abilities, opportunity costs and meaningful
  action effects, accessory/action gear quality, NPC verb success/cost parity,
  accessible human playtest rubrics, and region/job stratification. Preserve
  these blind spots explicitly rather than claiming the first version covers
  all gameplay quality. Instrumented totals never measure fun by themselves.

The four initial policies are mixed campaign strategies, not certified
pacifist challenges. Gear-source rates show actual routes to rewards;
they do not prove a whole campaign can avoid combat. Add explicit pacifist,
contest/show-focused and other named cohorts when testing those claims.

Steve's publication direction: "Get these live so muse can use it too for its
simulations. Make sure our internal workflows are clear and there are
instructions or hooks to keep things up to date."

The tools are shared on `codex/balanced-measurement`, based on the regional
`master` rather than the unrelated gameplay commits on `codex/resume-claude`.
Agent entry instructions live in AGENTS.md; check.js runs the contract/proof
maintenance hook in both quick and full mode. See SIMULATING.md for commands
and the update procedure. Existing cache identities prevent stale-case reuse.

## Use from Muse's working branch

Fetch and merge the tooling branch into your own working branch:

```text
git fetch origin codex/balanced-measurement
git merge origin/codex/balanced-measurement
node scripts/check.js --only balance
node scripts/check.js --only measurement-workflow
node scripts/balance-panel.js --n 16 --out <new-baseline-directory> --par 4
```

The branch is based on regional master 15614d03. It adds no src/ or index.html
changes. It preserves master's capable policy, adds the cookHaul helper needed
by maker/merchant, and includes the shared driver's regional selection and
pending-choice handling. Both comparison roots must contain these same tool
and policy revisions. Commit/freeze the baseline before changing gameplay,
then use the SIMULATING.md paired-root commands. Archive or retain each raw
panel, feature report and decision together. A new tool revision needs a fresh
baseline; never compare an old bot run with a new one as a game-only effect.

Master can lack metrics supported on Codex's gameplay branch (for example,
food-intake receipts). Unknown measurements are a review item, not a zero.
The calibration evidence describes its recorded runtime hashes, not regional
master. Use a fresh screen on the actual region/job you are developing.
