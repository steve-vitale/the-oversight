# sim-insideevening-b — CONFIRM ADDENDUM (committed BEFORE any confirm run)

Parent prereg: evidence/2026-10-28/sim-insideevening-b-prereg.md
(committed as d7980c5 BEFORE any judged run). This addendum
changes NOTHING about the instrument, the metrics, or the
bars — it only names the fresh confirm band and the
confirm bars, which the parent prereg already fixed in
shape (pilot 6/8 -> confirm 12/16).

## Pilot result (context, not a re-score)

Pilot band 10700–10707, 30 loop-days, same substrate
(COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1), proof PROOF-GREEN, pilot commit
86f54e3: M1 8/8 seeds pass (policy inside-evening rate
1.00 on every seed's at-haven evenings; control rates
0.07–0.09 — competent's only inside evenings are loop-days
1–2, the spawn-inside days), M2 7/8 (seed 10701 fails M2
because its 5 tap days were all away evenings at grove /
creek, never inside — an honest away failure, not a gate
failure), G1 holds (median days 30 vs 30), G2 holds
(policy starvation deaths 1 vs control 0, within
control+2; the one policy starvation death is a day-12
bearer death with succession continuing, not a
run-ending starvation). Pilot verdict: GO.

Two pilot observations carried into the confirm read
(neither changes any bar):

- By tap days (loop-days 26–30) most seeds have reached
  integration stage 3, so control taps read 'remote' and
  succeed remotely when the grant survives — the inside
  lever's marginal value is pre-stage-3, and late tap
  days are confounded by remote access. The confirm
  instrument is NOT moved to earlier tap days: moving
  the window post-pilot to chase a cleaner number would
  be re-scoring. The confirm judges the same late
  window, and the evidence file reports the remote
  confound alongside the verdict.
- Late grant loss is common on 30-day runs (successions
  replace the fixture bearer — e.g. pilot seed 10701's
  tap days all answer "You don't have that ability.").
  M2 counts access at tap time on an issued tap, not
  lift success, exactly as preregistered, so ownership
  loss does not launder into a gate result either way.

## Confirm band (freshness verified BEFORE judging)

- Seeds: 10710–10725 (16 seeds). Verified fresh
  2026-10-28: no dated evidence .md or corpus filename
  in evidence/ uses 10710–10725 as judged seeds (the
  107xx hits in the tree are kcal values, day numbers,
  and line numbers, not seed bands), and the heavily
  used recent B bands (10040–10065, 104xx) plus the
  pilot band (10700–10707) are avoided.
- Baseline (competent) and policy (insideevening) run
  on IDENTICAL seeds, same substrate, same 30-day
  horizon, same driver, same analyzer.
- Corpora: evidence/2026-10-28/
  sim-insideevening-b-confirm-corpus-competent/ and
  sim-insideevening-b-confirm-corpus-insideevening/;
  analysis: evidence/2026-10-28/
  sim-insideevening-b-confirm-analysis.json.

## Confirm verdict rule (judged ONLY against the parent prereg)

- GO: >= 12/16 seeds pass M1 (rate >= 0.5), >= 12/16
  seeds pass M2 (>= 1 tap day with access 'inside' at
  tap time on an issued tap), G1 (median days policy
  >= 0.8x control) and G2 (policy starvation deaths
  <= control + 2) both hold.
- NO-GO: any leg misses its bar, with the blocking
  step named per failing seed (away / walk-no-path /
  no-go-inside-button / entry-refused / button-refused /
  walk-interrupted-combat / game-over /
  zero-at-haven-evenings) — NOT re-scored against a
  friendlier metric.
- On a confirm NO-GO, the policy file is DELETED
  (killed arms leave no trace except evidence) and
  the report is NO-GO with numbers.
