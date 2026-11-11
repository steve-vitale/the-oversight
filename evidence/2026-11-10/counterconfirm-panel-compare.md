# Balanced campaign comparison

**Decision: review_required**


Declared intervention flags exempted from the flags match: COUNTER_ANSWER (before {"COUNTER_ANSWER":null}; after {"COUNTER_ANSWER":"1"}).

## competent

16 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0 | 0 | 0 to 0 | 16/16 | descriptive |
| Table entry rate | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| National scale access | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| First bearer survives through day 30 | 0.875 | 0.875 | 0 | 0 to 0 | 16/16 | no_material_signal |
| First bearer survives through day 60 | 0.4375 | 0.25 | -0.1875 | -0.375 to 0 | 16/16 | regression_watch |
| Player deaths per run (player-flagged character only) | 6.0625 | 7.0625 | 1 | -0.0625 to 2.6875 | 16/16 | regression_watch |
| Player deaths per 100 calendar days (player-flagged character only) | 5.3159 | 6.0663 | 0.7504 | -0.0829 to 2.1621 | 16/16 | regression_watch |
| Village deaths per run | 97.75 | 100.9375 | 3.1875 | 0 to 7.5625 | 16/16 | regression_watch |
| Village deaths per 100 calendar days | 75.7588 | 78.3825 | 2.6238 | -0.065 to 5.5201 | 16/16 | regression_watch |
| Community loss (engine loss or sustained empty roster) | 0.5625 | 0.5625 | 0 | -0.1875 to 0.1875 | 16/16 | no_material_signal |
| Mean sampled living NPCs | 8.0362 | 8.016 | -0.0201 | -0.1596 to 0.1004 | 16/16 | no_material_signal |
| Sampled reserve below 500 kcal | 0.0069 | 0.0069 | 0 | -0.0001 to 0 | 16/16 | no_material_signal |
| Sampled hydration below 25% | 0.0336 | 0.0328 | -0.0008 | -0.0053 to 0.0019 | 16/16 | no_material_signal |
| Sampled HP below 25 | 0.0249 | 0.0229 | -0.002 | -0.0052 to 0.0004 | 16/16 | no_material_signal |
| Sampled hungry NPCs (hunger at least 80) | 0.0416 | 0.0464 | 0.0048 | -0.0002 to 0.0108 | 16/16 | no_material_signal |
| Player named-class access | 0.8125 | 0.8125 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Eligible NPC named-class access | 0.2341 | 0.2384 | 0.0043 | -0.0025 to 0.0138 | 16/16 | no_material_signal |
| Earned player tier-3+ weapon/armor access | 1 | 1 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ contest/show weapon/armor | 1 | 1 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ craft/trade weapon/armor | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ corpse weapon/armor | 0.6875 | 0.625 | -0.0625 | -0.1875 to 0 | 16/16 | descriptive |
| Primary nourishment / physical food consumed on instrumented routes | 0.9122 | 0.9176 | 0.0055 | -0.0007 to 0.0146 | 16/16 | descriptive |
| Bearer changes | 5.5625 | 6.5625 | 1 | 0 to 2.5625 | 16/16 | descriptive |
| Accepted player ability events | 141.75 | 172.5 | 30.75 | 2.3125 to 67.5625 | 16/16 | descriptive |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/16 | not_observed |
| Trap luck percentile | 0.6392 | 0.5925 | -0.0466 | -0.122 to 0 | 11/16 | coverage_changed |
| Snare luck percentile | 0.5284 | 0.4923 | -0.0361 | -0.1539 to 0.0457 | 13/16 | coverage_changed |
| Pit luck percentile | 0.6791 | 0.8073 | 0.1282 | 0 to 0.2864 | 7/16 | insufficient |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/16 | not_observed |
| Combined run luck percentile | 0.6228 | 0.6292 | 0.0065 | -0.0003 to 0.0197 | 13/16 | coverage_changed |

Table reach (raw, display only — not the judged metric): invitations observed 16/16 before → 16/16 after; sittings (ruling 665) 0/16 → 0/16. The raw row.table flag is the invitation, not the sitting — a village can reach the table and never sit.

No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment.
