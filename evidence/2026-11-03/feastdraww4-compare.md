# feastdraww4 compare — pilot band 98601–98608 (identical seeds)

Arm: closecommit baseline vs closecommit + feastdraww4 cadence layer.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap. Driver:
scripts/feastdraww4-driver-20261103.js. Per-seed JSONs:
evidence/2026-11-03/perseed-feastdraww4-a/s-{baseline,variant}-s9860x-fdrawpilot.json.

Primary metric: distinct wave-4 monsters fought per seed
(`deedState().wavesFaced` wave 4 at run end). Judged quantity:
seeds with >= 1 wave-4 fought, variant minus baseline.

| seed | base w4 | variant w4 | base starv | var starv | base days | var days | var fdFeasts | var fdDraws | var fdW4 |
|------|---------|------------|------------|-----------|-----------|----------|--------------|-------------|----------|
| 98601 | 1 (reunion) | 5 (audit,influencer,reunion,suburb,eulogy) | 0 | 0 | 90 | 91 | 4 | 4 | 1 |
| 98602 | 0 | 0 | 1 | 1 | 82 | 82 | 0 | 0 | 0 |
| 98603 | 0 | 3 (algorithm,reunion,eulogy) | 0 | 0 | 54 | 40 | 2 | 2 | 0 |
| 98604 | 7 (eater,strike,influencer,reunion,herald,audit,suburb) | 1 (eater) | 0 | 0 | 114 | 90 | 4 | 4 | 1 |
| 98605 | 0 | 3 (strike,congregation,algorithm) | 0 | 0 | 90 | 90 | 3 | 3 | 1 |
| 98606 | 3 (eater,eulogy,herald) | 6 (reunion,eater,eulogy,congregation,audit,herald) | 0 | 0 | 90 | 92 | 2 | 2 | 0 |
| 98607 | 0 | 0 | 1 | 1 | 38 | 38 | 0 | 0 | 0 |
| 98608 | 0 | 0 | 0 | 0 | 58 | 58 | 0 | 0 | 0 |
| **TOTAL / MEDIAN** | **3/8 seeds** | **5/8 seeds** | **2** | **2** | **median 86** | **median 86** | **15** | **15** | **3** |

Legs as recomputed from the JSONs (wrap-based b2 first, then substance):
- (a) seeds>=1w4: 3 -> 5, delta +2 — exactly the GO bar. PASS.
- (b1) starvation deaths: 2 -> 2, bar baseline+2 = 4. PASS.
- (b2) fighter-attributed arm deaths, wrap count: 0 -> 0, bar <= 2.
  PASS on the wrap — BUT the wrap is structurally incapable of firing
  (post-return `tbfight.id` after synchronous combat; fdArmFightCount
  = 0 across all 15 layer draws). Fight-sequence attribution finds
  THREE scholar deaths inside layer-draw fights (see evidence):
  98601 day 70 Audit (Amina), 98604 day 62 Eater (Carolina),
  98606 day 44 Callback (Emilio). True b2 = 3 > 2. FAIL in substance.
- (b3) median survival: 86d -> 86d, bar 0.8x = 68.8d. PASS.

Verdict: KILLED (cost leg b2 fails in substance). The wrap-based
"all four legs pass" claim in the prereg's confirm-band addendum is
superseded by the prereg's CORRECTION section.

Confirm band 98701–98712: NOT run to verdict. The sweep was stopped
during its baseline leg once the pilot kill was established; its two
partial baseline outputs were deleted as unjudged. No confirm numbers
judge anything, and the band remains fresh.

Comparison-instrument note (pre-registered): the balanced panel
(scripts/balance-panel.js) is NOT applicable — POLICY_REGISTRY
contains neither the closecommit stack nor the feastdraww4 wrapper,
and editing the observer mid-comparison would change the instrument.
The judged comparison is this identical-seed driver table.
