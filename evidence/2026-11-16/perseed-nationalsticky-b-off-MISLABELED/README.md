# MISLABELED corpus — do NOT use as the OFF leg

These 6 per-seed files (seeds 103011–103016, run nationalsticky-b) were
written by the previous worker's OFF-leg attempt, which ran with
`MODE=off` but WITHOUT `NATIONALSTICKY_RECORDER=off`. The driver defaults
the recorder ON unless the env flag is explicitly `off`
(`scripts/nationalsticky-driver-20261116.js:37`), so every file carries
`recorderOn: true` plus a full daily series and captured say lines —
they are recorder-ON corpora mislabeled as OFF-leg files, NOT the
prereg's OFF leg (the two legs differ ONLY by the
`NATIONALSTICKY_RECORDER` env flag).

Kept, not deleted, because they are valid recorder-ON corpora for
seeds 103011–103016 (trajectories identical to the ON leg if the
recorder is neutral — D2 — but they were NOT produced by the ON-leg
command, so they are not used as the ON leg either).

Moved here 2026-11-17 by the adoption worker (sim-nationalsticky-b);
the OFF leg was re-run properly with
`MODE=off NATIONALSTICKY_RECORDER=off` for all 8 seeds
103011–103018 into `perseed-nationalsticky-b-off/`.
