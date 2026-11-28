# Balanced campaign comparison

**Decision: review_required**


## competent-sit

8 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0.375 | 0.375 | 0 to 0.75 | 8/8 | change_watch |
| Table entry rate | 0 | 0.375 | 0.375 | 0 to 0.75 | 8/8 | no_material_signal |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0 | 0.375 | 0.375 | 0.125 to 0.75 | 8/8 | no_material_signal |
| National scale access | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| First bearer survives through day 30 | 1 | 0.75 | -0.25 | -0.5 to 0 | 8/8 | regression_watch |
| First bearer survives through day 60 | 0.25 | 0.5 | 0.25 | -0.25 to 0.75 | 8/8 | no_material_signal |
| Player deaths per run (player-flagged character only) | 7.5 | 2 | -5.5 | -7.5 to -3.75 | 8/8 | no_material_signal |
| Player deaths per 100 calendar days (player-flagged character only) | 5.5341 | 1.4081 | -4.126 | -5.6872 to -2.8664 | 8/8 | no_material_signal |
| Village deaths per run | 86.875 | 42.625 | -44.25 | -58.125 to -32.75 | 8/8 | no_material_signal |
| Village deaths per 100 calendar days | 65.9227 | 29.5034 | -36.4193 | -54.04 to -21.7265 | 8/8 | no_material_signal |
| Community loss (engine loss or sustained empty roster) | 0.5 | 0 | -0.5 | -0.875 to -0.125 | 8/8 | no_material_signal |
| Mean sampled living NPCs | 7.5312 | 9.2184 | 1.6872 | 1.151 to 2.2658 | 8/8 | no_material_signal |
| Sampled reserve below 500 kcal | 0.0117 | 0.0008 | -0.0109 | -0.018 to -0.0042 | 8/8 | no_material_signal |
| Sampled hydration below 25% | 0.0988 | 0.0025 | -0.0963 | -0.1528 to -0.0481 | 8/8 | no_material_signal |
| Sampled HP below 25 | 0.0092 | 0.0117 | 0.0025 | -0.0049 to 0.0095 | 8/8 | no_material_signal |
| Sampled hungry NPCs (hunger at least 80) | 0.0112 | 0.0061 | -0.0051 | -0.0163 to 0.0021 | 8/8 | no_material_signal |
| Player named-class access | 1 | 0.75 | -0.25 | -0.625 to 0 | 8/8 | regression_watch |
| Eligible NPC named-class access | 0.2408 | 0.3382 | 0.0974 | 0.023 to 0.1778 | 8/8 | no_material_signal |
| Earned player tier-3+ weapon/armor access | 1 | 1 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player tier-3+ contest/show weapon/armor | 1 | 1 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player tier-3+ craft/trade weapon/armor | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player tier-3+ corpse weapon/armor | 0.875 | 0.625 | -0.25 | -0.5 to 0 | 8/8 | descriptive |
| Primary nourishment / physical food consumed on instrumented routes | 0.9331 | 0.9093 | -0.0238 | -0.0313 to -0.0153 | 8/8 | descriptive |
| Bearer changes | 7.375 | 2 | -5.375 | -7.25 to -3.75 | 8/8 | descriptive |
| Accepted player ability events | 64.25 | 53.25 | -11 | -51.125 to 30.75 | 8/8 | descriptive |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Trap luck percentile | 0.7888 | 0.9354 | 0.1466 | -0.0797 to 0.4687 | 5/8 | insufficient |
| Snare luck percentile | 0.92 | 0.824 | -0.096 | -0.192 to 0 | 2/8 | insufficient |
| Pit luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Combined run luck percentile | 0.7839 | 0.8895 | 0.1056 | -0.0882 to 0.3752 | 6/8 | insufficient |

Table reach (raw, display only — not the judged metric): invitations observed 8/8 before → 3/8 after; sittings (ruling 665) 0/8 → 3/8. The raw row.table flag is the invitation, not the sitting — a village can reach the table and never sit.

No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment. METHOD: column compare, not comparePanels — comparePanels refuses cross-policy panels (Unmatched policies/cases; see sitpolicy-panel.json, decision invalid) because it is built for source levers. This pairs the two single-policy panels by seed (before = competent column, after = competent-sit column) and runs the scorecard's own compareMetric over the same 23-metric contract; both panels share schemaVersion, observerDigest, contractDigest, seeds and days, and both pass neutrality with zero warnings. The pre-registered threshold (§14) remains the judge.
