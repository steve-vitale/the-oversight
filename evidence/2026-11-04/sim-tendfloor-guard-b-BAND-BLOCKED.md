# Floored tend-through CONFIRM — BLOCKED: confirm band not fresh (Loop B, arm sim-tendfloor-guard-b)

## Verdict: NOT RUN — FAIL LOUDLY at step 1 (band freshness)

No prereg was written, no judged sim was run, no band was substituted.
The pre-stated confirm band 99009–99024 (from
`evidence/2026-11-04/sim-tendfloor-b-prereg.md`, restated in
`evidence/2026-11-04/sim-winnability-round-1330.md` as "stays fresh
for a future run with a drop-guard addendum") is NOT fresh as of
this run's check (2026-11-04 ~14:43Z). Per the worker brief, a
non-fresh band means stop, not a silent replacement band.

## Freshness check (as specified in the brief)

- Forbidden list: 99009–99024 absent from it (99401–99412,
  99601–99612, 99701–99708, 99801–99808, 98701–98716, 99101,
  89701–89707, 83601–83800, 16101–16116) — PASS on this leg.
- Dated evidence .md naming confirm-band seeds: FAIL.
  `evidence/2026-11-04/sim-belongzombie-a.md` names and reports
  outcomes for 99009, 99013, 99016, 99017, 99023 (census band
  table + end-state scaleRank); `evidence/2026-11-04/sim-scale-onramp-round-1326.md`
  repeats the same census list. (The tendfloor prereg/evidence
  and the 1330Z round note name the band only as a pre-statement,
  not as run seeds — those mentions are not counted as use.)
- Per-seed corpus filenames carrying confirm-band seeds: FAIL.
  `evidence/2026-11-04/perseed-belongzombie-a/` holds judged
  census JSONs for five confirm-band seeds:
  belongzombie-s99009, -s99013, -s99016, -s99017, -s99023.

## What contaminated the band (Loop A arm sim-belongzombie-a)

- Screen: fresh seeds 99001–99024, leadcourt verbatim, 300d
  death-aware (its prereg, commit 74d1ea7cb, 13:51Z, verified
  0 hits for the range before the screen — true at that moment,
  because the tendfloor pre-statement is a naming, not a run).
  Published survival distribution, median 86.5d, max 213d.
- Census (commit 82feb7fa4, 14:00Z): survival-ranked top 8 of
  that screen, run through the diplo instrument with judged
  legs: 99023 (213d), 99008 (163d), 99006 (135d), 99004 (132d),
  99013 (132d), 99016 (127d), 99009 (121d), 99017 (116d).
  Five of the eight census seeds sit inside the tendfloor
  confirm band, with published survival days and diplo
  outcomes (e.g. 99009 holds-to-death/global, 99023
  collapses/regional, 99013 collapses/national).
- Timing note: the 1330Z coordinator note (commit fa12aef05,
  14:08Z) stating the band "stays fresh" was written AFTER the
  belongzombie census commit (14:00Z) — the staleness was
  already true when the note was written, and this worker's
  step-1 re-verification is what caught it.

## Why this blocks the confirm (not a technicality)

The fresh-band rule exists so a confirm runs on seeds whose
behavior is not already known. Here 5/16 confirm seeds have
published diplo-instrument outcomes under leadcourt, and all
16 have published screen survival (leadcourt). A confirm on
this band would no longer be an unbiased fresh-band confirm:
seed selection knowledge (which seeds live long, which
collapse) is exactly what the rule guards against. Running
the remaining 11 seeds only would be silently picking another
band, which the brief forbids.

## What the coordinator needs to decide (not decided here)

1. Assign a NEW genuinely fresh band for the guard-addendum
   confirm (freshness re-verified against all of today's
   evidence + corpus at assignment time, not at 1330Z).
2. Or rule explicitly that belongzombie's leadcourt screen +
   census does not contaminate a tendthrough-baseline confirm
   — this worker does NOT make that ruling unilaterally, since
   the brief's freshness test is policy-agnostic and fails on
   its face.
3. Note for the guard addendum itself (carried, not judged):
   the pilot's proposed guard (armed drops <= baseline drops
   + 1) is untouched by this block; it still needs a
   prereg committed before any sim on whatever band is
   assigned next.

## State left behind

- Worktree `~/workspace/worktrees/sim-tendfloor-guard-b`,
  branch `sim-tendfloor-guard-b`: this note is its only new
  file, committed below. No policy file touched
  (`git diff HEAD` empty for
  scripts/policies/leadcourt-tendfloor-b.js and
  scripts/policies/leadcourt-tendthrough.js, verified before
  stopping). No sims run, so there are NO wall numbers to
  report for this run — none are fabricated here.
- No Loop A tree/branch/claim/lock touched. No claim or lock
  file was created or deleted by this worker.
- Out-of-arm findings: none observed (no sims run).
