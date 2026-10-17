# sim-shellrevive-b — before/after compare (pilot, 8 seeds x 2 policies x control/armed)

**Decision: NO-GO** (corrected §14 pre-registration)

Paired cases: 16. Light panels: control.json / armed.json in this directory.
The contract-overlapping metrics below use the scorecard compareMetric statistics;
pre-registered metrics are judged directly (see metric review in the evidence).

| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Table win rate | 0.000 | 0.000 | +0.000 | [0.000, 0.000] | 16 | descriptive |
| Table invitation | 0.938 | 0.938 | +0.000 | [0.000, 0.000] | 16 | no_material_signal |
| National scale | 0.813 | 0.813 | +0.000 | [0.000, 0.000] | 16 | no_material_signal |
| Survival to day 30 | 1.000 | 1.000 | +0.000 | [0.000, 0.000] | 16 | no_material_signal |
| Survival to day 60 | 1.000 | 1.000 | +0.000 | [0.000, 0.000] | 16 | no_material_signal |

## Pre-registered judgement
- PRIMARY(a) shelled-kcal on starvation days (armed): **0** (GO >= 1000); control **0** (GO = 0). **MISS**
- PRIMARY(b) paired pantry-draw displacement (control − armed): **+35321** kcal over 16 pairs (GO >= 0). **HOLD**
- GUARD starvation deaths: armed **7** vs control **7** (GO <= control+2 = 9); paired sign 0/0/16 (better/worse/tied). **HOLD**
- GUARD national: armed **13/16** vs control **13/16** (GO >= control−2). **HOLD**
- GUARD median survival: armed **157d** vs control **162d** (GO >= control−10d). **HOLD**
- GUARD new death modes: none.
- GUARD det-gate: from scripts/test-shelltask-b.js Part C (byte-identical gate-off).

**Overall: NO-GO**
