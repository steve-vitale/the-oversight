# sim-winnability-round-1730 — Loop B 1730Z adoption (trickteach NO-GO + 14cwatch D1-stop + 14cwatch2 NOT REPRODUCED)

Run: fleshout-loop-b-20261116T1730Z (Loop B), axis winnability chain. The run
timed out at 2h with two arms adopted from the dead 1530Z B run and one rerun
arm in flight; the adoption closed in the main session. All three arms LANDED,
merged locally, pending ship.

## sim-trickteach-b — PILOT NO-GO (lever killed, reverted)

LANDED `20f58d77c` (evidence) + `5a9e13719` (instrument). Lever: one
observation teaches a wave-4 trick (threshold 2→1, env-gated TRICKTEACH=1).
Bar 1 FAILED: the armed leg formed **0 launched fights** (control 5, 0
kills) — the judged population never formed. Mechanism DID move: trick
species learned 10→15, transitions 23→40, wild fights trick-known at
contact 42%→78%. Cost bars passed (starvation 7 vs 5 ≤ +2; median survival
149.5 vs 151). Wall: national-by-standing 3/8→4/8, by-rank 0/8, wave-5
3/8→4/8, wins 0. The lever is fully reverted (game.js back to base, blob
verified by the adoption arm). Evidence: evidence/2026-11-16/sim-trickteach-b.md.

## sim-14cwatch-b — STOPPED at determinism D1 (evidence-only)

LANDED `9946e5e58`. The §14c watch rerun attempt: band 102221–102228
verified fresh, NOT spent. D1 failed vs anchor `04b45a930` because 18
src/js commits landed since; true combat deaths re-derived 66 vs 36
(+83%). No judged sim — the rerun was re-attempted as sim-14cwatch2-b
below. Evidence: evidence/2026-11-16/sim-14cwatch-b.md.

## sim-14cwatch2-b — NOT REPRODUCED (the 0430Z trip was a per-seed outlier)

LANDED `cf0d44d5d` (rebased onto `5b6766308`, proof re-run 25/25 on the
rebased tip, ff-merge, tree released, branch deleted). Fresh 8-seed band
(102221–102228) with fresh baselines on the current tip: courtship does
NOT kill villagers in combat at a higher rate than the covenant control —
pooled combat deaths 546 armed vs 498 control (ratio **1.096**, inside the
frozen 0.8–1.2 NOT REPRODUCED band), per-1000-villager-day rates
effectively identical (46.54 armed vs 46.81 control, rate ratio **0.994**).
The 0430Z re-confirm's seed-100633 trip (66 vs 36, +83%) does not
reproduce as a band-wide effect; it reads as a per-seed outlier, as the
re-confirm's own band-wide pooled ratio (0.88) already suggested. Panel
`review_required` (national scale access 0 → 0.5). Wall: national by
scaleRank 0/8 → 4/8, by standing 2/8 → 4/8, table 0, wins 0, median
survival 161d → 200d. Evidence: evidence/2026-11-16/sim-14cwatch2-b.md +
prereg + 16 per-seed JSONs + panel + analysis.

## Wall numbers (this round)

- trickteach: national-by-standing 3/8→4/8, by-rank 0/8, wave-5 3/8→4/8,
  wins 0, median 149.5 vs 151d.
- 14cwatch2: national by-rank 0/8→4/8, by-standing 2/8→4/8, table 0,
  wins 0, median 161d→200d.
- Telemetry check REFUSED recorder-corpus input on the 14cwatch2-b
  per-seed corpora (same documented refusal as the 1631Z arms); baseline
  NOT rolled.

## Infrastructure

- The timeout report said arm 3's rebase+proof background job had not
  finished; the job in fact completed after the report was written — the
  adoption found the branch already rebased onto current master
  `5b6766308` with the evidence commit `cf0d44d5d` (proof 25/25 in the
  message). Verified proof 25/25 + clean tree before merging; the
  worker's stale "awaiting rebase" claim was not acted on.
- The 13:30 Loop B occurrence stood down correctly on the live adoption
  heartbeat. No other loop touched this run's arms.

## Blanks

- Tracker blank #6 second half (§14c watch rerun) CLOSED — NOT
  REPRODUCED. The 0430Z trip is closed as a per-seed outlier.
- Trickteach 2→1 threshold KILLED at pilot — the threshold treats the
  clock, not the gate; the taught channel never fires (tricklearn
  1515Z). The trick question stays OPEN: a stronger teaching lever
  than the threshold, or plan ignition (4/8 villages never start any
  plan in 150d), is the next lever.
- Seasoning gate G1 ruling stays OPEN (Loop B held, 4 unclassified
  staged-days). Profile-gate design call stays OPEN (Loop A — the
  shadow numbers are in, the decision is Steve's).
