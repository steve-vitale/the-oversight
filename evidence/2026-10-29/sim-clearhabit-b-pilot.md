# sim-clearhabit-b — PILOT SEED DECLARATION (written BEFORE any after-leg)

Prereg: evidence/2026-10-29/sim-clearhabit-b-prereg.md
(committed before any judged after-leg). This declaration is
committed BEFORE any pilot after-leg is run. The scan legs are
selection data only, never judged legs; the judged before legs
are re-run fresh on the pilot seeds below.

## Scan history (disclosed in full — the prereg's scan range grew)

- Prereg scan range 11600–11639 (40 gate-OFF legs, corpus
  evidence/2026-10-29/sim-clearhabit-b-scan/): only 3
  qualifiers (>= 1 refused evening) — 11636:10 creek,
  11626:5 washed_out, 11639:5 rubble. Refusals are rare in
  unenriched seeds: 20 refused evenings in 1195
  non-game-over scan evenings (1.7%).
- Extension 1, 11640–11719 (80 gate-OFF legs, corpus
  sim-clearhabit-b-scan2/): 4 more qualifiers — 11707:6
  creek, 11654:5 washed_out, 11697:3 fallen_tree, 11714:3
  washed_out. Pooled after 120 seeds: 7 qualifiers.
- Extension 2, 11720–11737 (18 gate-OFF legs, corpus
  sim-clearhabit-b-scan3/, PARTIAL): 1 more qualifier —
  11728:3 fallen_tree. The scan was stopped here for
  throughput once the 8th qualifier appeared (scan3 pace
  had fallen to ~50s/seed under sibling load; seeds
  11738–11819 were never scanned). The 8 seeds below are
  the highest-refusal qualifiers WITHIN the completed
  pool of 138 scanned seeds (ties: ascending seed
  order). This is a selection-pool disclosure, not a
  metric change: the judged primary metric, GO bar,
  minimum-n, and guards are exactly the prereg's, and no
  after-leg has run.
- Freshness: no seed below appears in any prior arm's
  corpus or evidence (blockedpath 18, detour scan
  11500–11519, adjacenttile 10772, creekpath 10752 all
  excluded; the 11600+ ranges are new). All four
  blockage types are covered in the pilot band.

## Pilot seeds (declared now, exact 8)

Ascending: 11626, 11636, 11639, 11654, 11697, 11707,
11714, 11728.

| Seed | Scan refused | Blockage type(s) | Scan days | Scan end |
|---|---|---|---|---|
| 11626 | 5 | washed_out | 30 | survived |
| 11636 | 10 | creek | 30 | survived |
| 11639 | 5 | rubble | 30 | survived |
| 11654 | 5 | washed_out | 30 | survived |
| 11697 | 3 | fallen_tree | 30 | survived |
| 11707 | 6 | creek | 30 | survived |
| 11714 | 3 | washed_out | 30 | survived |
| 11728 | 3 | fallen_tree | 30 | survived |
| Total | 40 | creek 16 / washed_out 13 / rubble 5 / fallen_tree 6 | | |

## Judged legs (same driver, same substrate, identical seeds)

- Before leg: POLICY=nighttravel, COMPETENT_HOMEWARD_CLEAR=0,
  fresh run into
  evidence/2026-10-29/sim-clearhabit-b-corpus-before/.
- After leg: POLICY=nighttravel, COMPETENT_HOMEWARD_CLEAR=1,
  everything else identical, fresh run into
  evidence/2026-10-29/sim-clearhabit-b-corpus-after/.
- Substrate (asserted FATAL in the driver):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1; COMPETENT_EVENING_DETOUR,
  COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
  COMPETENT_TRIPHOME_ROUTE_AROUND all unset/0;
  DAYS=30 TAPDAYS=5.
- Judge (prereg, unchanged): opportunity rescue rate on
  the after leg, GO >= 0.50 with opportunity n >= 8;
  G1 median survival >= before - 2; G2 starvation <=
  before + 2; G2c causal-window player starvation <= 2;
  G3 zero-tolerance. Opportunity n < 8 means
  INSUFFICIENT-DATA. Rate < 0.50 with n >= 8, or any G3
  violation, KILLS the lever at pilot.
- Confirm (only if pilot GO and time remains): 12–16
  seeds declared in a separate confirm declaration
  BEFORE any confirm after-leg; never pilot seeds.
