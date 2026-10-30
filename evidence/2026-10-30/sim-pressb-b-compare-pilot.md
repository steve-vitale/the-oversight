# sim-pressb-b — paired before/after (§15 compare)

§15 DEVIATION (stated on its face): the official balance-panel driver cannot express this arm — its policies are sweep-compare registry policies, not the nighttravel+woodcarry+woodwarm strand stack, and the 23-metric contract has no press/fire/banking metrics (same standing as sim-armorstock / sim-shellrevive-b). This compare pairs control (PRESSB=0) and variant (PRESSB=1) legs seed-by-seed on the pre-registered metrics, plus guardrail metrics (survival, death causes, wave reach). The panel is the instrument here in paired form; the pre-registered thresholds in the prereg are the judge.

Pairs: 8 seeds (identical seeds, 30 loop-days, same base). Control creek/still/rescued 15/10/5; variant 22/17/5.

## PRIMARY: fire rate (GO >= 0.80)

- denominator mornings (actionable stranded + field + live known kcal): 4
- fired: 4 — rate 1.000 — GO

## PRIMARY: banking ratio (GO >= 0.80, comparator coverage must be 100%)

- variant pressE over denominator mornings with comparator: 1440
- same-base proven E over corresponding control mornings: 1260
- ratio: 1.143 — coverage 0.500 — NO-GO

## SECONDARY (reported, no bar): naive depletion table

- control stranded field mornings: 9 (with comparator 9), proven total 2610 kcal
- variant total pressE (denominator mornings): 3240 kcal; off-target pressE: 0 kcal
- naive ratio (variant denominator total / control total): 1.241 — consecutive-east second mornings are SKIPs by depletion (patch harvested into dirt + day+2 regrow), not missed fires; see evidence file.

## GUARDRAILS: regression bars (all must hold)

- off-target fires: 0 (bar 0) — pass
- recorder/variant errors control/variant: 0/0 (bar 0) — pass
- stalls (non-contiguous evening loopDays): 0 (bar 0) — pass
- replay snap mismatches: 0 (bar 0) — pass
- regression fails (daysAlive loss > 10 or new death cause): 0 — pass
  - seed 15003: daysAlive 30 -> 30, end survived -> survived, waves 2 -> 2, bearer deaths [] -> [], all deaths n 6 -> 6
  - seed 15009: daysAlive 30 -> 30, end survived -> survived, waves 2 -> 2, bearer deaths ["contest"] -> ["contest"], all deaths n 8 -> 8
  - seed 15091: daysAlive 30 -> 30, end survived -> survived, waves 2 -> 2, bearer deaths ["the wild","the wild"] -> ["the wild","the wild"], all deaths n 15 -> 15
  - seed 15211: daysAlive 30 -> 30, end survived -> survived, waves 2 -> 2, bearer deaths [] -> [], all deaths n 13 -> 13
  - seed 15215: daysAlive 30 -> 30, end survived -> survived, waves 1 -> 2, bearer deaths ["the wild"] -> ["the wild"], all deaths n 8 -> 14
  - seed 15220: daysAlive 30 -> 30, end survived -> survived, waves 2 -> 2, bearer deaths [] -> [], all deaths n 15 -> 15
  - seed 15221: daysAlive 30 -> 30, end survived -> survived, waves 1 -> 1, bearer deaths ["the wild"] -> ["the wild"], all deaths n 8 -> 8
  - seed 15337: daysAlive 30 -> 30, end survived -> survived, waves 2 -> 2, bearer deaths [] -> [], all deaths n 8 -> 8

## VERDICT

NO-GO — at least one bar failed; see BARS above and the evidence file for the exact blocker.
