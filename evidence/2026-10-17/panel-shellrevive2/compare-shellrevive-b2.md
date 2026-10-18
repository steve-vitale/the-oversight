# sim-shellrevive-b2 — before/after compare (revival, 8 seeds x 2 policies x control/armed)

Frozen base: 95ecbb07. Paired cases: 16. Light panels: control.json / armed.json in this directory.
The contract-overlapping metrics below use the scorecard compareMetric statistics;
pre-registered metrics are judged directly (see evidence/2026-10-17/sim-shellrevive-b2.md).

## control -> armed

| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Win rate | 0.000 | 0.000 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Table invitation | 0.875 | 1.000 | +0.125 | [0.000, 0.313] | 16 | descriptive |
| National scale | 0.875 | 0.938 | +0.063 | [0.000, 0.188] | 16 | descriptive |
| Starvation deaths (pooled) | 0.250 | 0.125 | -0.125 | [-0.313, 0.000] | 16 | descriptive |
| Villager starvation deaths | 0.188 | 0.063 | -0.125 | [-0.313, 0.000] | 16 | descriptive |
| Villager starvation (pre-collapse) | 0.125 | 0.063 | -0.063 | [-0.188, 0.000] | 16 | descriptive |
| Survival days | 156.4 | 163.7 | +7.313 | [-7.438, 24.1] | 16 | descriptive |

## Pre-registered judgement (revival)

- PRIMARY engagement: **821,128 kcal on lean days** (GO >= 2,000) — MET; 8/8 seeds engaged (GO >= 4) — MET. Control 0.
- Guardrail 1 (villager starvation, pre-collapse): control 2 -> armed 1 (bound <= 4) — HOLD. Tail: 1 -> 0. Paired sign 1/0/15.
- Guardrail 2 (no new death mode, mode level): HOLD — 5 armed-only strings, all mapped to modes present in control.
- Guardrail 3 (national): 14 -> 15 (bound >= 12) — HOLD.
- Guardrail 4 (median survival): 172d -> 175.5d (bound >= 152d) — HOLD.
