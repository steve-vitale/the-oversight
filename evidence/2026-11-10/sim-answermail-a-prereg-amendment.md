# sim-answermail-a — prereg amendment 1 (median definition)

Committed BEFORE any judged computation (the pilot legs are running
as data collection; no analyzer has run, no verdict has been drawn).
Amends evidence/2026-11-10/sim-answermail-a-prereg.md.

## Correction: the control median is 120.5, not 132

The prereg cites "control median 132d" from trustgrowth-b's evidence
text. The secondlink-a metric review (evidence/2026-11-10/
sim-secondlink-a.md, run fleshout-20261110T0415Z — read after the
prereg was committed) shows that number is a slip: trustgrowth-b's
own per-seed day list is 132/58/132/150/109/87/150/62, which sorts
to 58/62/87/109/132/132/150/150, standard median (average of the
two middle values, n=8) = (109+132)/2 = **120.5**. Secondlink-a
reproduced the same list and reported 120.5. The trustgrowth
analyzer's `medianSurvival` takes the UPPER median
(sorted[floor(n/2)] = 132), which is where the 132 comes from.

## What changes

- The cost bar's median leg is now: **armed median >= 0.8 x 120.5 =
  96.4 days**, where "median" means the standard median (average of
  the two middle values for n=8), computed from the per-seed day
  lists on current master.
- `scripts/answermail-analyze-20261110.js` is fixed to compute the
  standard median from the per-seed days (and to report the
  trustgrowth analyzer's upper-median figure alongside, for
  comparability with the older text — never as the bar).
- Nothing else changes: primary (>= 5/8 seasoned), starvation bar,
  fidelity gates, band, policies, horizon all stand as preregged.
  The bar moved DOWN by ~9 days (105.6 -> 96.4) because the cited
  control number was wrong, not because the lever looks weak — the
  correction is documented here, before judging, per §14.
