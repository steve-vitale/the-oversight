# Pre-registration addendum — sim-killconv-a calibration

Calibration run (unmodified tbfinish driver, seed 99107, 140d,
RUN=tbfinish-calib-kc, committed as
evidence/2026-11-03/perseed-tbfinish-a/tbfinish-s99107-tbfinish-calib-kc.json):

- 2315Z anchor for 99107: 38 days, village-lost, 0 wave-4 spawns,
  0 TB, 0 kills, maxWave 3.
- This anchor (HEAD f085d5df0 + prereg 712d6af43): 71 days,
  village-lost, 0 wave-4 spawns, 0 TB, 0 kills, 0 instrument
  errors.

Verdict: DIVERGED in survival length (38d -> 71d) with the wave-4
shape unchanged (still zero wave-4 contact on this seed). Per the
prereg, the judged baseline for this arm is whatever the pilot leg
measures on current master. tbfinish/ready5 numbers are NOT cited
as this arm's baseline; any comparison to them is descriptive,
anchor-move-aware, never a before/after claim. GO threshold,
seeds, policy, and horizon are unchanged by this addendum.
