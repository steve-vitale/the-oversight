# sim-eveningdetour-b — CONFIRM DECLARATION (written BEFORE any confirm after-leg)

Pilot verdict (see evidence/2026-10-29/sim-eveningdetour-b.md):
pilot GO — refused-evening rescue rate 15/15 = 1.000 among
refused evenings on refused-prone seeds, n = 15 >= 8, G1
30 vs 30, G2 4 vs 2 (at the +2 bound), G3 0 violations,
proof T1–T8 green. Per the pilot prereg
(sim-eveningdetour-b-prereg.md), confirm is therefore spent.

## Confirm band (declared now, 14 seeds, within the prereg's 12–16)

- Remaining refused seeds from the diag §5 episode table
  (all 10 not used at pilot): 11112, 11133, 11208, 11246,
  11251, 11273, 11349, 11365, 11408, 11435.
  (Diag refused-evening counts: 5, 1, 2, 3, 2, 2, 1, 3, 7,
  5 — 31 total in the verdict corpus.)
- Fresh refused-prone seeds from a new scan (gate-OFF
  nighttravel legs, seeds 11500–11519, same driver and
  substrate; scan corpus
  evidence/2026-10-29/sim-eveningdetour-b-confirm-scan/):
  qualifiers are seeds with >= 1 refused evening on the
  scan leg, in ascending seed order, capped so the band
  stays <= 16: 11500 (5 refused, washed_out), 11509 (2,
  creek), 11510 (1, washed_out), 11516 (4, creek).
- Pilot seeds are NOT re-used as confirm seeds.
- Confirm seed list (ascending): 11112, 11133, 11208,
  11246, 11251, 11273, 11349, 11365, 11408, 11435, 11500,
  11509, 11510, 11516.

## Judge (same as the pilot prereg, pooled over the confirm band only)

- Primary: refused-evening rescue rate among refused
  evenings on refused-prone seeds, GO bar >= 0.50 with
  minimum-n 8. The pilot rate is a staging diagnostic,
  never pooled into the confirm verdict.
- G1 median survival >= before-leg median - 2; G2
  starvation-cause deaths <= before leg + 2; G3 honesty
  zero-tolerance (0 teleport steps, 0 rescued-off-haven,
  0 combat-then-inside, 0 still-refused-moved).
- Before leg: fresh gate-OFF legs on all 14 confirm
  seeds (the scan legs serve only as selection, not as
  the before leg — the before leg is re-run fresh for
  every confirm seed, including scan qualifiers, so the
  judged before/after pair shares one driver run each).
- After leg: fresh gate-ON legs on the same 14 seeds,
  everything else identical.
- Corpora: evidence/2026-10-29/
  sim-eveningdetour-b-confirm-before/ and
  sim-eveningdetour-b-confirm-after/; analysis
  sim-eveningdetour-b-confirm-analysis.json.
- Watch item carried from the pilot (not a guard change):
  G2 passed exactly at its bound at pilot (4 vs 2, all 4
  on seed 11390, days 18–20, while that seed's total
  deaths fell 14 -> 10). The confirm band is watched
  for a replicated starvation uptick; a replicated
  uptick goes under "metric review" for the next run
  even if G2 passes again, and a G2 failure at confirm
  is a confirm NO-GO under the prereg.
