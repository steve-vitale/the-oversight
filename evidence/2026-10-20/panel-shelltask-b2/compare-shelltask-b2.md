# sim-shelltask-b2 — before/after compare (revival pilot, 8 seeds x 2 policies x control/armed)

Frozen base: 09123a854. Paired cases: 16. Light panels: control.json / armed.json in this directory.
The contract-overlapping metrics below are descriptive; pre-registered metrics are judged directly (see evidence/2026-10-20/sim-shelltask-b2.md).

## control -> armed

| Metric | Before | After | Paired delta | Pairs |
| --- | ---: | ---: | ---: | ---: |
| National scale | 0.875 | 0.875 | 0 | 16 |
| Table invitation | 0.875 | 0.875 | 0 | 16 |
| Starvation deaths (pooled) | 5 | 8 | 3 | 16 |
| Player starvation deaths | 2 | 6 | 4 | 16 |
| Pantry displacement (control-armed, kcal) | — | — | 6586 | 16 |
| Survival days (median) | 158 | 173 | 15 | 16 |
| Shelled kcal (armed total) | 0 | 19360 | +19360 | 16 |
| Shelled kcal on starvation days (armed) | 0 | 0 | +0 | 16 |

## Pre-registered judgement (revival)

- PRIMARY(a) engagement: **19360 kcal armed vs 0 control** (need armed>0, control=0) — MET.
- PRIMARY(b) shelled-and-eaten on starvation days: **0 kcal armed** (need >= 1000) — MISS.
- STARVATION guardrail: armed 8 vs control 5 (bound <= 7) — BREACH; player starvation 6 vs 2.
- DISPLACEMENT guardrail: 6586 >= 0 — HOLD (armed scholar pantry draws must not exceed control).
- national 14 vs 14 (need >= 12) — HOLD.
- median survival 173d vs 158d (need >= 148d) — HOLD.
