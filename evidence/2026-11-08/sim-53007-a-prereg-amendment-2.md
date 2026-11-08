# sim-53007-a — Amendment 2 (written BEFORE any judged verdict)

**Date:** 2026-11-08 ~18:00Z. **Status:** band sweep complete (8/8 corpora, current master); no verdict written yet. The G3 bar from Amendment 1 is corrected a second time — this time by reading `scripts/sim-harness.js` `runDays`, not by re-scoring a result.

## Finding — `days` is loop iterations, `gameDays` is the scholar day

`runDays` returns `days: min(loop iterations, 150)` while the daily rows are keyed by the scholar day (`Game.state.scholar.day`). A loop iteration does not always advance the scholar day by exactly one (frozen days stall it; a sleep can push it twice). Measured on the band sweep:

- 53001: iterations 69, scholar day 70 (village lost during d70) — rows end d70 (dup).
- 53003 / 53008: iterations 150, scholar day 151 — rows end d151.
- 53006: iterations 150, scholar day **140** — ten iterations never advanced the day (time-freeze stalls); rows end d140 (dup). The village lived 140 scholar-days, not 150.
- 53007: iterations 150, scholar day 150 — rows end d150 (dup).

Amendment 1's "last daily == days" check therefore fails 4/8 corpora for a harness fact, not a recorder defect. **G3 revised (binding):** the last daily row must equal `gameDays` (the scholar day at end); the final scholar day may duplicate once (the closing snapshot); any other duplicate fails. First daily is d2. Gaps are enumerated, not failed (53002 skips d14→d16, the healed corpus skips d38 — mid-run skipped days are an instrument fact).

## Finding — joins mask the fallen/living check

53003: Hany dies d86 (monster) but living reads 7 on d84, d85, d86 and 8 on d87 — a join the same day masks the drop. The corpus carries no join log, so a death with no living drop cannot be distinguished from a phantom death. **G3 revised:** fallen/living mismatches are ENUMERATED as coverage notes, not failed. The check still runs and its output is attached.

## What does NOT change

- Everything else in the prereg + Amendment 1 stands: substrate, classification rule, G1/G2 bars, the #1..#17 method, DIAG-only.
- GO bar (1) restated once more, finally: 8/8 configs produce a daily corpus spanning d2..`gameDays` with an end snapshot (days/endReason/gameDays), diag on every row, 0 instrument errors.
