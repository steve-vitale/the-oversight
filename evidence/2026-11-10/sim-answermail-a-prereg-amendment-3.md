# sim-answermail-a — prereg amendment 3 (confirm fidelity gate correction)

Committed BEFORE any confirm computation is judged (both confirm
legs have run as data collection; the confirm analyzer has NOT run,
no confirm verdict has been drawn). Amends
evidence/2026-11-10/sim-answermail-a-prereg-amendment-2.md.

## Correction: the confirm fidelity gate assumed 16 links; the band forms 15

Amendment 2 set the confirm fidelity gate "accord answers >= 16".
That assumed every confirm seed forms a link. The confirm CONTROL
leg (already run, unjudged data) shows the assumption is false:
seed 120116 dies at day 31 with 0 links and standing 0 on the
control leg — before the ladder stage-3 reward can grant a link —
and the armed leg reproduces that exactly (31 days, 0 links). No
accord is ever staged on 120116, on either leg, so there is no
accord to answer. The maximum answerable accords on this band is
15, not 16.

## What changes

- The confirm fidelity gate becomes: **accord answers ==
  links formed on the armed leg** (15 expected on this band:
  one per first link; more if a re-link restages the accord).
  The gate's INTENT is unchanged — every staged accord got
  answered — only the literal number is corrected to the
  band's link count, which the control leg establishes.
- Nothing else changes: primary (seasoned >= 10/16), cost
  bar, other fidelity gates (tends > 0, renegotiation
  silences 0, instrument errors 0, unattributed 0) all stand
  as preregged. The correction is documented here, before
  judging, per §14 — the same way amendment 1 corrected the
  median before judging.
