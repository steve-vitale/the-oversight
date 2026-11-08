# sim-53007-a — Amendment 1 (written + committed BEFORE any judged sweep)

**Date:** 2026-11-08 ~17:20Z. **Status of the arm when written:** prereg committed (`636d7ff2f`); recorder + driver + proof built; proof 14/14 green on fixtures; smoke only (53007 armed + unrecorded, /tmp). NO judged sweep has run. Nothing in the prereg's bars has been judged yet.

## Finding 1 — the premise moved: current-master 53007 SURVIVES

Smoke, recorder armed: 53007 runs 150d, **survived**, lesser seat d95, standing 584, maxWave 5, w4 kills 5, 0 instrument errors, 149 snapshots, diag on 149/149 rows. Unrecorded smoke on the same seed, same master: **identical headline** (150d, survived, 584, maxWave 5, lesser d95, w4 5). G2 neutrality on the smoke pair: PASS (see analyzer output in the evidence file). The survival is master movement, not the recorder.

The healed endpoint `c9fea16ee` dies 53007 at 50d; current master `6680d7924` does not. The question "what kills 53007" therefore has no current-master death to classify. The arm's scope is amended (below), not re-scored: the death is classified at the endpoint where it happened, and the current-master band sweep documents that it no longer occurs and shows why.

## Finding 2 — G3's "contiguous daily rows" bar is mis-specified

The smoke corpus has a daily gap d2→d4 and a duplicated final day (d150 twice). The committed corpora have the SAME shape: healed 53007 starts d2, skips d3, duplicates d50; collapsed 53007 the same; the healed corpus additionally skips d38 mid-run. This is the instrument's actual shape (snapshot on day-change inside policy.daily; day 1 never snapshot; the closing snapshot duplicates the final day), not a recorder defect. A "contiguous rows" bar would fail every corpus ever produced by this instrument, including the committed controls.

**G3 revised (binding):** a corpus passes integrity when (a) rows span d2..end day, (b) diag present on every row with pantryKcal/sickN non-null, (c) 0 instrument errors, (d) every fallen entry has a living drop on its day or the day after, (e) the end snapshot (days/endReason) is present. Gaps are ENUMERATED in the analyzer output, not failed — the d3 gap and final-day duplicate are the instrument's known shape; any other gap is listed as a coverage note in the evidence file. GO bar (1) is restated the same way: 8/8 configs produce a daily corpus spanning d2..end with an end snapshot.

## Scope amendment — one endpoint re-run (53007 only, at c9fea16ee)

The healed-endpoint death's preceding-7-day trajectory (pantry, sickness/wounds in camp) does not exist in any committed corpus — the healed daily rows carry no pantry or sick counts. To classify the death in full, this arm re-runs **53007 only, at the healed endpoint `c9fea16ee`, recorder armed**, by the extraction method (read-only `git archive` + frozen-instrument overlay, per the healerbisect control runs; the recorder + driver are overlaid the same way). Neutrality for the endpoint run is checked against the committed healed corpus itself (it IS the unrecorded control: headline + fallen + daily-without-diag must match exactly).

**GO bar (2) restated:** 53007's death is classified in full from the endpoint re-run corpus (cause, day, preceding-7-day trajectory, mechanism class per the prereg rule); the current-master band table shows the death no longer occurs (survival classified instead, with the trajectory evidence for why). **GO bar (3) extended:** the #1..#17 explanation stands as pre-registered; in addition, the post-endpoint landings (`c9fea16ee..6680d7924`) that could plausibly have removed the death are named as suspects with the trajectory evidence for each — NOT proven by construction. A bisect of the post-endpoint range is a next-run job; if a lever candidate emerges, name it with its prereg shape, do not build it.

## What does NOT change

- Substrate, seeds, horizon, policy, recorder design, classification rule, G1/G2 bars, the #1..#17 method, DIAG-only, no game-code change.
- The confound check from the prereg fires as written: current-master 53007 diverges from the healed-exact shape, and the pellet-boost landing was the prime suspect named there — but the smoke + the `c9fea16ee..6680d7924` src log now put **medic duty (b74dc3007, cure channels)** and the **double-night fix (ff252c1ac)** ahead of it as suspects, with the Standing ladder (seat bars) and preserver-XP pace (f2c892be3) also in the frame. Suspects are named from the log + the current-master trajectory, never from the smoke headline alone.
