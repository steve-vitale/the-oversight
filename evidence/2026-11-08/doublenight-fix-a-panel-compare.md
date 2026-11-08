# Balanced campaign comparison

**Decision: review_required**


Registration-only harness churn tolerated (recorded, not silent): scripts/sweep-compare.js (registration-only: normalized harness digests agree); scripts/policies/cheaptend-a.js (added policy file, unused by either panel); scripts/policies/competent-darkwit-b.js (added policy file, unused by either panel); scripts/policies/competent-trialcombat-b.js (added policy file, unused by either panel).

## competent

8 paired cases; screen only; review_required.

| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0 | 0 | 0 | 0 to 0 | 8/8 | descriptive |
| Table entry rate | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Table sitting rate (seat taken, whether or not a waiting invitation was observed) | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| National scale access | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| First bearer survives through day 30 | 0.625 | 0.625 | 0 | 0 to 0 | 8/8 | no_material_signal |
| First bearer survives through day 60 | 0.125 | 0.125 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player deaths per run (player-flagged character only) | 11.375 | 10.625 | -0.75 | -2 to 0 | 8/8 | no_material_signal |
| Player deaths per 100 calendar days (player-flagged character only) | 13.1541 | 12.4767 | -0.6774 | -1.6656 to 0 | 8/8 | no_material_signal |
| Village deaths per run | 84.125 | 83.625 | -0.5 | -6.75 to 4.75 | 8/8 | no_material_signal |
| Village deaths per 100 calendar days | 99.9122 | 98.6979 | -1.2143 | -3.7035 to 0.0606 | 8/8 | no_material_signal |
| Community loss (engine loss or sustained empty roster) | 1 | 0.875 | -0.125 | -0.375 to 0 | 8/8 | no_material_signal |
| Mean sampled living NPCs | 8.3858 | 8.4906 | 0.1048 | -0.0259 to 0.3404 | 8/8 | no_material_signal |
| Sampled reserve below 500 kcal | 0.0095 | 0.0096 | 0.0001 | 0 to 0.0002 | 8/8 | no_material_signal |
| Sampled hydration below 25% | 0.0049 | 0.0034 | -0.0015 | -0.0046 to 0 | 8/8 | no_material_signal |
| Sampled HP below 25 | 0.0192 | 0.0151 | -0.0041 | -0.0093 to 0 | 8/8 | no_material_signal |
| Sampled hungry NPCs (hunger at least 80) | 0.0147 | 0.0147 | 0 | -0.0022 to 0.0023 | 8/8 | no_material_signal |
| Player named-class access | 0.75 | 0.75 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Eligible NPC named-class access | 0.1896 | 0.2101 | 0.0205 | 0 to 0.0562 | 8/8 | no_material_signal |
| Earned player tier-3+ weapon/armor access | 1 | 1 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player tier-3+ contest/show weapon/armor | 0.875 | 0.875 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player tier-3+ craft/trade weapon/armor | 0 | 0 | 0 | 0 to 0 | 8/8 | no_material_signal |
| Player tier-3+ corpse weapon/armor | 0.75 | 0.75 | 0 | 0 to 0 | 8/8 | descriptive |
| Primary nourishment / physical food consumed on instrumented routes | 0.9488 | 0.9463 | -0.0025 | -0.0071 to 0 | 8/8 | descriptive |
| Bearer changes | 10.75 | 10.125 | -0.625 | -1.75 to 0 | 8/8 | descriptive |
| Accepted player ability events | 89 | 82.25 | -6.75 | -26.25 to 6 | 8/8 | descriptive |
| Hunt luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Trap luck percentile | 0.7145 | 0.6618 | -0.0527 | -0.1919 to 0.0337 | 5/8 | insufficient |
| Snare luck percentile | 0.5159 | 0.5245 | 0.0086 | 0 to 0.0258 | 7/8 | insufficient |
| Pit luck percentile | 0.8085 | 0.8085 | 0 | 0 to 0 | 5/8 | insufficient |
| Fishing luck percentile | unknown | unknown | unknown | unknown to unknown | 0/8 | not_observed |
| Combined run luck percentile | 0.6762 | 0.6601 | -0.0161 | -0.1235 to 0.0752 | 8/8 | descriptive |

No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment.
