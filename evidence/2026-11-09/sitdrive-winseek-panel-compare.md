# Balanced campaign comparison

**Decision: review_required**


Declared intervention flags exempted from the flags match: SITDRIVE_B (before {"SITDRIVE_B":null}; after {"SITDRIVE_B":"1"}).

## winseek-sitdrive-b

16 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0.1875 | 0.1875 | 0 to 0.375 | 16/16 | change_watch |
| Table entry rate | 0 | 0.1875 | 0.1875 | 0 to 0.375 | 16/16 | no_material_signal |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0 | 0.1875 | 0.1875 | 0 to 0.375 | 16/16 | no_material_signal |
| National scale access | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| First bearer survives through day 30 | 0.3125 | 0.3125 | 0 | 0 to 0 | 16/16 | no_material_signal |
| First bearer survives through day 60 | 0.0625 | 0.0625 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player deaths per run (player-flagged character only) | 10.5 | 9.3125 | -1.1875 | -2.6875 to 0 | 16/16 | no_material_signal |
| Player deaths per 100 calendar days (player-flagged character only) | 14.5796 | 14.0469 | -0.5327 | -1.1956 to 0 | 16/16 | no_material_signal |
| Village deaths per run | 70.125 | 67.875 | -2.25 | -5.6875 to -0.1875 | 16/16 | no_material_signal |
| Village deaths per 100 calendar days | 101.2373 | 103.6969 | 2.4597 | 0 to 5.8147 | 16/16 | regression_watch |
| Community loss (engine loss or sustained empty roster) | 1 | 0.8125 | -0.1875 | -0.4375 to 0 | 16/16 | no_material_signal |
| Mean sampled living NPCs | 7.8333 | 8.0951 | 0.2619 | 0 to 0.561 | 16/16 | no_material_signal |
| Sampled reserve below 500 kcal | 0.0317 | 0.0303 | -0.0014 | -0.0052 to 0.001 | 16/16 | no_material_signal |
| Sampled hydration below 25% | 0.0193 | 0.0156 | -0.0037 | -0.0094 to 0 | 16/16 | no_material_signal |
| Sampled HP below 25 | 0.0122 | 0.0126 | 0.0004 | 0 to 0.0011 | 16/16 | no_material_signal |
| Sampled hungry NPCs (hunger at least 80) | 0.046 | 0.0435 | -0.0026 | -0.0065 to -0.0003 | 16/16 | no_material_signal |
| Player named-class access | 0.625 | 0.625 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Eligible NPC named-class access | 0.1113 | 0.1184 | 0.0071 | 0 to 0.0187 | 16/16 | no_material_signal |
| Earned player tier-3+ weapon/armor access | 0.9375 | 0.9375 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ contest/show weapon/armor | 0.9375 | 0.9375 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ craft/trade weapon/armor | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ corpse weapon/armor | 0.6875 | 0.6875 | 0 | 0 to 0 | 16/16 | descriptive |
| Primary nourishment / physical food consumed on instrumented routes | 0.9639 | 0.9625 | -0.0013 | -0.0034 to 0 | 16/16 | descriptive |
| Bearer changes | 10.3125 | 9.1875 | -1.125 | -2.4375 to 0 | 16/16 | descriptive |
| Accepted player ability events | 26.125 | 24.125 | -2 | -5.0625 to 0 | 16/16 | descriptive |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/16 | not_observed |
| Trap luck percentile | 0.68 | 0.6902 | 0.0102 | 0 to 0.0305 | 10/16 | coverage_changed |
| Snare luck percentile | 0.635 | 0.6434 | 0.0083 | 0 to 0.0201 | 13/16 | descriptive |
| Pit luck percentile | 0.7555 | 0.757 | 0.0015 | 0 to 0.0044 | 5/16 | insufficient |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/16 | not_observed |
| Combined run luck percentile | 0.7494 | 0.779 | 0.0296 | -0.0088 to 0.1006 | 14/16 | descriptive |

Table reach (raw, display only — not the judged metric): invitations observed 15/16 before → 15/16 after; sittings (ruling 665) 0/16 → 3/16. The raw row.table flag is the invitation, not the sitting — a village can reach the table and never sit.

No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment.
