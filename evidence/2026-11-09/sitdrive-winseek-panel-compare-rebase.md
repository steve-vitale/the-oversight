# Balanced campaign comparison

**Decision: review_required**


Declared intervention flags exempted from the flags match: SITDRIVE_B (before {"SITDRIVE_B":null}; after {"SITDRIVE_B":"1"}).

## winseek-sitdrive-b

16 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0.125 | 0.125 | 0 to 0.3125 | 16/16 | change_watch |
| Table entry rate | 0 | 0.125 | 0.125 | 0 to 0.3125 | 16/16 | no_material_signal |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0 | 0.125 | 0.125 | 0 to 0.3125 | 16/16 | no_material_signal |
| National scale access | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| First bearer survives through day 30 | 0.3125 | 0.3125 | 0 | 0 to 0 | 16/16 | no_material_signal |
| First bearer survives through day 60 | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player deaths per run (player-flagged character only) | 10.5 | 9.9375 | -0.5625 | -1.5625 to 0 | 16/16 | no_material_signal |
| Player deaths per 100 calendar days (player-flagged character only) | 15.0971 | 15.0153 | -0.0818 | -0.3297 to 0.0036 | 16/16 | no_material_signal |
| Village deaths per run | 70.0625 | 68.5 | -1.5625 | -4.75 to 0 | 16/16 | no_material_signal |
| Village deaths per 100 calendar days | 102.201 | 104.1003 | 1.8993 | 0 to 4.6337 | 16/16 | regression_watch |
| Community loss (engine loss or sustained empty roster) | 1 | 0.875 | -0.125 | -0.3125 to 0 | 16/16 | no_material_signal |
| Mean sampled living NPCs | 8.0206 | 8.2082 | 0.1875 | 0 to 0.5105 | 16/16 | no_material_signal |
| Sampled reserve below 500 kcal | 0.0271 | 0.0264 | -0.0007 | -0.0019 to 0 | 16/16 | no_material_signal |
| Sampled hydration below 25% | 0.0102 | 0.0079 | -0.0024 | -0.0064 to 0 | 16/16 | no_material_signal |
| Sampled HP below 25 | 0.0116 | 0.012 | 0.0004 | 0 to 0.001 | 16/16 | no_material_signal |
| Sampled hungry NPCs (hunger at least 80) | 0.0458 | 0.0445 | -0.0013 | -0.0034 to 0 | 16/16 | no_material_signal |
| Player named-class access | 0.6875 | 0.625 | -0.0625 | -0.1875 to 0 | 16/16 | regression_watch |
| Eligible NPC named-class access | 0.1099 | 0.112 | 0.002 | 0 to 0.0052 | 16/16 | no_material_signal |
| Earned player tier-3+ weapon/armor access | 0.875 | 0.875 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ contest/show weapon/armor | 0.875 | 0.875 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ craft/trade weapon/armor | 0 | 0 | 0 | 0 to 0 | 16/16 | no_material_signal |
| Player tier-3+ corpse weapon/armor | 0.625 | 0.625 | 0 | 0 to 0 | 16/16 | descriptive |
| Primary nourishment / physical food consumed on instrumented routes | 0.9633 | 0.9628 | -0.0005 | -0.0012 to 0 | 16/16 | descriptive |
| Bearer changes | 10.0625 | 9.5 | -0.5625 | -1.5625 to 0 | 16/16 | descriptive |
| Accepted player ability events | 27.5 | 25.9375 | -1.5625 | -4.625 to 0 | 16/16 | descriptive |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/16 | not_observed |
| Trap luck percentile | 0.6139 | 0.6121 | -0.0018 | -0.0054 to 0 | 7/16 | insufficient |
| Snare luck percentile | 0.6886 | 0.6919 | 0.0033 | 0 to 0.0099 | 12/16 | descriptive |
| Pit luck percentile | 0.8037 | 0.8037 | 0 | 0 to 0 | 4/16 | insufficient |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/16 | not_observed |
| Combined run luck percentile | 0.7432 | 0.7511 | 0.0079 | -0.0027 to 0.0276 | 12/16 | descriptive |

Table reach (raw, display only — not the judged metric): invitations observed 15/16 before → 15/16 after; sittings (ruling 665) 0/16 → 2/16. The raw row.table flag is the invitation, not the sitting — a village can reach the table and never sit.

No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment.
