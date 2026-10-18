# sim-shellharm-b — before/after compare (diagnostic, 8 seeds x 2 policies x control/shell/perturb)

**Harm-model diagnostic verdict: HARM NOT REPRODUCED (no positive control->shell starvation delta on this base; see evidence)**

Paired cases: 16. Light panels: control.json / shell.json / perturb.json in this directory.
The contract-overlapping metrics below use the scorecard compareMetric statistics;
pre-registered metrics are judged directly (see evidence/2026-10-17/sim-shellharm-b.md).

## control -> shell

| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Win rate | 0.000 | 0.000 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Table invitation | 0.875 | 1.000 | +0.125 | [0.000, 0.313] | 16 | descriptive |
| National scale | 0.875 | 0.938 | +0.063 | [0.000, 0.188] | 16 | descriptive |
| Starvation deaths (pooled) | 0.250 | 0.125 | -0.125 | [-0.313, 0.000] | 16 | descriptive |
| Villager starvation deaths | 0.188 | 0.063 | -0.125 | [-0.313, 0.000] | 16 | descriptive |
| Survival days | 156.375 | 163.688 | +7.313 | [-8.438, 24.438] | 16 | descriptive |

## control -> perturb

| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Win rate | 0.000 | 0.000 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Table invitation | 0.875 | 0.875 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| National scale | 0.875 | 0.875 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Starvation deaths (pooled) | 0.250 | 0.250 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Villager starvation deaths | 0.188 | 0.188 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Survival days | 156.375 | 156.375 | +0.000 | [0.000, 0.000] | 16 | descriptive |

## Pre-registered judgement (diagnostic)

- PRIMARY attribution share: **n/a (degenerate: 0 excess deaths to attribute)** (GO >= 80%): timing-attributed 0 of 0 excess villager-starvation deaths; residual 0.
- Villager-only starvation: control 3 -> shell 1 -> perturb 3.
