# sim-shellcounter-b — before/after compare (pilot, 8 seeds x 2 policies x control/armed)

**Decision: NO-GO** (guardrail miss — starvation deaths armed 22 vs control 7, bound <= control+2)

Paired cases: 16. Light panels: control.json / armed.json in this directory.
The contract-overlapping metrics below use the scorecard compareMetric statistics;
pre-registered metrics are judged directly (see metric review in the evidence).

| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0.000 | 0.000 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Table invitation | 0.813 | 0.875 | +0.063 | [-0.063, +0.188] | 16 | no_material_signal |
| National scale | 0.750 | 0.750 | +0.000 | [0.000, 0.000] | 16 | no_material_signal |
| Survival to day 30 | 1.000 | 1.000 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Survival to day 60 | 0.938 | 0.938 | +0.000 | [0.000, 0.000] | 16 | no_material_signal |

## Pre-registered judgement
- PRIMARY counter-nut kcal shelled on LEAN days (armed): **671,458** (GO >= 2,000); control **0** (zero baseline). **GO**
- PRIMARY day-type split — FED days (armed): **0** (layer fires lean-only by design). **as designed**
- GUARD starvation deaths: armed **22** vs control **7** (GO <= control+2 = 9); paired sign 1/6/9 (better/worse/tied); player starvation 4 vs 2. **MISS**
- GUARD national: armed **12/16** vs control **12/16** (GO >= control−2). **HOLD**
- GUARD median survival: armed **174d** vs control **182d** (GO >= control−10d). **HOLD**
- GUARD new death modes: none (armed-only strings are procedural monster names + a rare pre-existing cold-exposure attribution).
- GUARD pantry displacement (control − armed scholar takes): **+298,220** kcal (GO >= 0). **HOLD**
- GUARD det-gate: from scripts/test-shellcounter-b.js Part C (16/16 byte-identical gate-off).

**Overall: NO-GO (guardrail miss) — layer killed zero-trace per kill protocol.**
