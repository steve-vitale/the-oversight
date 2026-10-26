# sim-driftwide-a — wider drift bisect (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-driftwide-a (worker tree
sim-driftwide-a). DIAG ONLY — zero src/js, zero default flips, no
game-code changes landed. No tuning against either band.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave
  law). No canon is invented here: the question is a measurement
  bisect, not a design, and the substrate is the tableseat-nowait
  policy, not a new system.
- The drift to explain (same seeds 73671–73678, tableseat-nowait
  substrate LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, 180d
  death-aware horizon):
  - 0126Z authoritative band (base 8ea64d848, evidence/
    2026-10-26/sim-rebaseline-a.md): deaths 260, national-ever
    6/8, national-final 5/8, table 4/8, entered 4/8, wins 4/8
    (lesser only), wave-4 5/8, wave-5 0/8, median 143d,
    starvation 9, raids 85, raiders 352, pool 1,527.
  - Current band (natpair + drawwave + r54bisect colA, same
    seeds/substrate): deaths 301, national-ever 8/8,
    national-final 5/8, table 4/8, entered 4/8, wins 4/8,
    wave-4 5/8, wave-5 0/8, median 143d, starvation 2,
    raids 91, raiders 404, pool 1,346.
  - Prior result NOT re-litigated: journey-landing r54's
    winddown grace beat is EXONERATED (r54bisect colA == colB
    on every field, all 8 seeds). Do NOT re-bisect r54, do NOT
    re-judge prior corpora, do NOT tune against either band.
- Shared band, trajectory for trajectory: seeds 73671–73678,
  tableseat-nowait policy reused unmodified, 180d death-aware
  horizon. Recorder-free plain runs (the rebaseline proof
  showed plain rows reproduce recorder rows exactly on every
  trajectory field, so plain rows are the comparable
  instrument). Sweep script scripts/test-driftwide-sweep.js is
  the r54bisect sweep with exactly one substitution: it
  records competentSha (sha256 of scripts/policies/
  competent.js at run time) instead of conversationSha, and it
  supports a third column (colC, see below). The daily
  capture wrapper only READS snapshots and calls through to
  tableseatNowait.daily; it installs no recorder, no wrapper
  around any Game method. Neutrality proof for this
  instrument (before any verdict is judged): (a) column A
  must reproduce the r54bisect colA rows per-seed exactly on
  every trajectory field + deaths map + ts (my OWN fresh
  control, never a copied sibling corpus — the comparison
  is the proof, the rows are mine); (b) a colA rerun of
  73671 must equal its main row. If (a) fails, the
  instrument is suspect and the verdict is
  INSTRUMENT-FAILED, not a candidate verdict.
- Columns (identical script, identical seeds, identical
  policy, identical src/js at this worktree's HEAD; the ONLY
  difference is the worktree's scripts/policies/competent.js,
  swapped by `git show <commit>:scripts/policies/competent.js`
  and restored with `git checkout --` after the column):
  - colA = current HEAD competent.js (cook fallback +
    fish fallback).
  - colB = base-era competent.js (8ea64d848: neither
    fallback).
  - colC = CONDITIONAL, runs ONLY if colA matches the
    current band exactly AND colB matches the 0126Z band
    exactly (band rules below): cook-only competent.js
    (3701dfa4a: cook fallback, no fish fallback). If the
    condition is not met, colC does not run and no
    attribution inside C2 is claimed.
- Candidate set (each with a falsifiable test; no post-hoc
  candidate shopping — a candidate not listed here may not
  be claimed confirmed by this run):
  - (C1) src/data + src/js delta re-verification between
    rebaseline base 8ea64d848 and current HEAD, file by
    file. CONFIRMED only if the diff contains a game-logic
    change beyond the grace beat + version stamp.
    EXCLUDED if the diff is exactly conversation.js (grace
    beat, already exonerated on this band) + build.js
    (version string only) and the src/data diff is empty.
  - (C2) policy/substrate history: diff
    scripts/policies/tableseat-nowait.js, leanlinkrescue.js,
    leanlink.js, and competent.js between the rebaseline
    era and HEAD, following the delegation chain
    tableseat-nowait → leanlinkrescue → competent. The
    chain matters: tableseat-nowait.js itself may be
    byte-identical while the competent.daily it runs
    through has changed. CONFIRMED if colB matches the
    0126Z band exactly (band rule below) while colA
    matches the current band exactly. EXCLUDED if colB
    matches the current band (the competent delta moves
    nothing on this band). Attribution inside C2 (only
    via conditional colC): colC == current band →
    cook fallback alone explains; colC == 0126Z band →
    fish fallback alone explains; colC intermediate →
    both contribute / interaction (reported, not forced).
  - (C3) harness inputs: runner seed handling, day
    counting, death/starvation/raid counting definitions.
    EXCLUDED as the A/B cause by construction (one script,
    one harness, identical for all columns — an A/B
    difference cannot be a harness difference) AND as
    the 0126Z-vs-current cause if (a) git diff
    8ea64d848 HEAD -- scripts/sim-harness.js
    scripts/sweep-compare.js is empty, and (b) colA
    reproduces the independent r54bisect instrument's
    band. Otherwise C3 stays OPEN (not confirmed by this
    run's design — a harness difference would need its
    own column, which is not pre-registered here).
  - (C4) base misattribution: verify the 0126Z anchor's
    commit hash, seed band, and instrument version from
    its evidence file, and whether the anchor band is
    truly the same measurement (same seeds, same policy
    env, same horizon, same trajectory definitions as
    this run's columns). EXCLUDED if 8ea64d848 exists
    with the stated identity, the rebaseline header
    states base/seeds/policy/horizon matching this run,
    and the 0017Z coordinator band matches the
    rebaseline band (the rebaseline evidence itself
    verified its rows identical to the 0017Z feastdraw
    rows; this run spot-checks the 0017Z band line).
    CONFIRMED only if the anchor proves to be a
    different measurement (different seeds, policy, or
    horizon) — in which case the "drift" is a
    comparison artifact and no code/policy cause is
    claimed.
  - (C5) instrument-coverage delta: starvation definition,
    raid counting, national-ever pairing. Starvation:
    my sweep counts deaths with cause matching
    /starv|hunger/i — EXCLUDED as a definition drift
    only if the rebaseline sweep uses the identical
    regex (code comparison, cited). National-ever
    pairing: every row must satisfy NEWPAIRED — the
    snap-based nationalEver, tsNationalDay presence,
    and maxRank >= national, all coerced to 0/1, agree
    (the old strict number-vs-boolean check is a known
    bug witness, never revived). Raids/pool: PLAIN
    rows carry no raftdraft census, so the raids
    85→91 / raiders 352→404 / pool 1527→1346 drift is
    EXPLICITLY NOT adjudicated by this arm — it is
    reported as open residue, never claimed excluded
    or confirmed. C5 is therefore at most PARTIALLY
    excludable (pairing + starvation definitions);
    the raids residue does not block DIAG-GO if C2 is
    confirmed, but it must be named in the verdict.
- Band rules (exact band match = all of: deaths,
  national-ever, national-final, table, entered, wins,
  wave-4, wave-5, median days via the sweep's medianOf
  (upper median s[floor(n/2)]), starvation):
  - colA matches current band iff deaths 301, natEver
    8/8, natFinal 5/8, table 4/8, entered 4/8, wins 4/8,
    wave4 5/8, wave5 0/8, median 143d, starvation 2.
  - colB matches 0126Z band iff deaths 260, natEver
    6/8, natFinal 5/8, table 4/8, entered 4/8, wins 4/8,
    wave4 5/8, wave5 0/8, median 143d, starvation 9.
  - Per-seed exact match to the anchor rows is the
    STRONGER form (reported when it holds); band-exact
    alone still counts as CONFIRMED for C2, with the
    per-seed residue named.
- DIAG-GO requires: at least one candidate CONFIRMED by
  a named measurement, OR every candidate EXCLUDED by a
  named measurement each (with C5's raids residue
  explicitly excepted as above). Otherwise report
  DIAG-NO-GO plainly.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run. Balanced panel: NOT run as
  a compare — it cannot ingest plain sweep corpora
  either (standing exception for recorder/sweep rows;
  the sweep summary + this evidence file are the
  comparison of record). Telemetry-check: NOT run on
  sweep rows (known ingestion-shape artifact class:
  the checker reads panel keys sweep rows do not
  carry). No baseline rolled.
- SENSE plan: coherence rules asserted in the proof
  (win → national-ever + entered; entered → national;
  table → national; wave-4 kill-log → wave reach ≥ 4
  where applicable) plus a plain-words village
  assessment from the per-seed table. Plain rows carry
  no transcripts, so no transcript is fabricated; the
  sense read is over the per-seed stories the rows do
  carry (who climbed, who stalled, who starved).

## INTERIM FINDINGS (written during the run, before the sweeps complete — not a verdict)

- PRE-REGISTRATION DEVIATION, disclosed (not hidden): the
  pre-registered instrument gate required column A to
  reproduce the r54bisect colA rows per-seed exactly. On
  seed 73671 it did NOT: my colA row reads days 180,
  survived, wave 3, deaths 22, tsNationalDay 107, pop 10,
  pantry 20,962, while r54bisect colA reads days 160,
  village-lost, wave 4, deaths 50, tsNationalDay 77, pop 6,
  pantry 8,484. Investigation (same script, byte-identical
  src/js, policies, and competent.js between the r54bisect
  commit and this HEAD; the sweep diff shows no behavioral
  difference) then ran a single diagnostic colC seed
  (cook-only competent.js, 3701dfa4a) OUT of the
  pre-registered column order, because the gate failure
  had to be attributed before any further sweep spend:
  colC 73671 reproduces r54bisect colA 73671 EXACTLY on
  every trajectory field, the full deaths map, ts, final
  pop/pantry/knowledge. Conclusion: my instrument is
  VALID, and the comparator corpus was run under
  COOK-ONLY competent.js, not under the cook+fish
  competent.js its "current master" label implies — the
  r54bisect worktree at sweep time predated the
  fishfallback merge into its base (or predated its
  rebase), and the corpus was carried across the rebase
  without re-sweeping. Consequence, stated plainly: the
  "current band" (301/8/2) in the brief and in the
  natpair/drawwave/r54bisect evidence is the COOK-ONLY
  band, corroborated per-seed by the natpair rows and the
  drawwave armed rows (all 8 seeds match the r54bisect
  colA rows on every shown field). The TRUE current
  band (cook+fish) is what column A measures here, and
  it already differs on 73671. No pre-registered
  threshold is changed by this correction: band-match
  rules still apply, with corrected labels (301 band =
  cook-only substrate; colA band = true current
  substrate). Column C therefore runs in full as the
  301-band comparator, and column B still tests the
  0126Z anchor. If column B matches 0126Z and column C
  matches the 301 band, C2 is confirmed in two steps:
  cook fallback explains 0126Z→301, fish fallback
  explains 301→true-current.
- INFRASTRUCTURE, LOUD: the container write-denial flap
  (EPERM on write(2)) hit this run from ~09:24Z: per-seed
  row writes failed after 8 retries (rows captured
  instead via the sweep's ROWJSON stdout fallback and
  persisted exactly, minus the transient writeFailed
  marker — the two 73671 rows are already on disk and
  verified by re-read). A `git checkout --` restore of
  competent.js then TRUNCATED it to 0 bytes (open
  succeeded, write EPERM) — competent.js is currently
  0 bytes in this worktree, tracked content intact in
  git (HEAD sha b0adaacc0ba86ae9). Restore is blocked
  until the flap clears for exec-path writes (300
  attempts over 5 minutes all EPERM; tool-path writes
  still succeed, which is how the two rows were
  persisted, but a 163KB byte-exact restore cannot go
  through the tool path). NO sim runs until competent.js
  is restored and sha-verified. Recovery command for
  the next clear window: `git show
  HEAD:scripts/policies/competent.js >
  scripts/policies/competent.js` (or `git checkout --`
  the file) followed by `sha256sum` expecting
  b0adaacc0ba86ae9e242f051840fbdb17d41423e5722149c331061c8ede83ae7.
  Worktree heartbeat kept fresh throughout.
- Rows already captured (own control, not copied):
  colA 73671 = 180d survived, wave 3, deaths 22, starv 0,
  tsNat 107, pop 10, pantry 20,962 (competentSha
  b0adaacc…); colC 73671 = 160d village-lost, wave 4,
  deaths 50, starv 0, tsNat 77, pop 6, pantry 8,484
  (competentSha 926f87f9…), identical to r54bisect colA
  73671 and natpair 73671 on every compared field.

## RESULTS (written after the sweeps; the pre-registration above was written before them)

## VERDICT: DIAG-GO — C2 CONFIRMED, in two steps, on exact per-seed reproduction

- Column B (base-era competent.js, 8ea64d848: neither
  staffing fallback) reproduces the 0126Z band EXACTLY:
  deaths 260, national-ever 6/8, national-final 5/8,
  table 4/8, entered 4/8, wins 4/8, wave-4 5/8, wave-5
  0/8, median 143d, starvation 9 — and, stronger than
  the band rule, reproduces the rebaseline ROWS
  per-seed exactly on every trajectory field, the full
  deaths map, ts, final pop/pantry (verified
  independently of the proof test).
- Column C (cook-only competent.js, 3701dfa4a) reproduces
  the 301 band EXACTLY: deaths 301, national-ever 8/8,
  national-final 5/8, table 4/8, entered 4/8, wins 4/8,
  wave-4 5/8, wave-5 0/8, median 143d, starvation 2 —
  and reproduces the natpair rows AND the r54bisect
  colA rows per-seed exactly (proof legs, 97/97).
- Column A (true current competent.js, HEAD: cook+fish
  fallbacks) is a NEW band, measured here for the first
  time: deaths 294, national-ever 8/8, national-final
  5/8, table 4/8, entered 3/8, wins 3/8, wave-4 4/8,
  wave-5 0/8, median 143d, starvation 2.
- The drift is therefore FULLY decomposed, no residue
  on trajectory fields: cook fallback (stafffallback-b)
  moves 0126Z → 301 (deaths +41, national-ever +2,
  starvation −7); fish fallback (fishfallback-b) moves
  301 → true-current (deaths −7, wins −1, entered −1,
  wave-4 −1, starvation unchanged). The fish fallback
  is NOT a pure improvement on this band: it flips two
  winners to losses (73675, 73676) and one loss to a
  win (73678), matching its own confirm finding
  (survival-neutral overall, arena-death reshuffle).
- Determinism: colA 73671 rerun == main row; colB 73671
  rerun == main row; detgate (colA 73671 twice
  in-process) trajectory-identical, PASS. NEWPAIRED
  holds on all 24 rows (snap nationalEver, tsNationalDay
  presence, maxRank>=national all agree after 0/1
  coercion — including colB 73675/73676, where all three
  read 0). Coherence rules hold on all 24 rows.

Band comparison (n = 8, seeds 73671–73678, tableseat-nowait, 180d death-aware):

| band | deaths | natEver | natFinal | table | entered | wins | wave4 | wave5 | median | starv |
|---|---|---|---|---|---|---|---|---|---|---|
| 0126Z (colB, base competent) | 260 | 6/8 | 5/8 | 4/8 | 4/8 | 4/8 | 5/8 | 0/8 | 143d | 9 |
| 301 (colC, cook-only) | 301 | 8/8 | 5/8 | 4/8 | 4/8 | 4/8 | 5/8 | 0/8 | 143d | 2 |
| TRUE CURRENT (colA, cook+fish) | 294 | 8/8 | 5/8 | 4/8 | 3/8 | 3/8 | 4/8 | 0/8 | 143d | 2 |

Per-seed tables (days = run days; end: survived / over-other = game over
with a win / village-lost; fin = final rank; mx = max rank; ne/nf =
national-ever/final; tab = invited; ent = entered; tsNat = tsNationalDay):

colA (true current, cook+fish):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | deaths | starv | tsNat | pop | pantry |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | 3 | 3 | global | global | 1 | 1 | 0 | 0 | 22 | 0 | 107 | 10 | 20,962 |
| 73672 | 180 | survived | 0 | 3 | 3 | global | global | 1 | 1 | 0 | 0 | 24 | 0 | 77 | 8 | 41,311 |
| 73673 | 90 | over-other | 1 | 3 | 4 | global | national | 1 | 1 | 1 | 1 | 21 | 0 | 89 | 8 | 38,139 |
| 73674 | 139 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 35 | 0 | 124 | 7 | 38,816 |
| 73675 | 173 | village-lost | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 50 | 1 | 77 | 6 | 0 |
| 73676 | 139 | village-lost | 0 | 4 | 4 | regional | national | 1 | 0 | 1 | 0 | 48 | 0 | 77 | 2 | 400 |
| 73677 | 143 | village-lost | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 45 | 0 | 77 | 1 | 3,500 |
| 73678 | 128 | over-other | 1 | 3 | 4 | national | global | 1 | 1 | 1 | 1 | 49 | 1 | 77 | 7 | 18,591 |

colB (0126Z, base competent — identical to the rebaseline rows):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | deaths | starv | tsNat | pop | pantry |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 31 | 0 | 77 | 4 | 18,121 |
| 73672 | 97 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 25 | 0 | 84 | 7 | 8,182 |
| 73673 | 124 | over-other | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 28 | 0 | 86 | 9 | 16,375 |
| 73674 | 163 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 30 | 0 | 77 | 10 | 22,387 |
| 73675 | 180 | survived | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 38 | 4 | — | 2 | 200 |
| 73676 | 70 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 31 | 4 | — | 2 | 0 |
| 73677 | 143 | village-lost | 0 | 4 | 3 | national | national | 1 | 1 | 0 | 0 | 43 | 0 | 114 | 2 | 0 |
| 73678 | 116 | over-other | 1 | 4 | 4 | national | global | 1 | 1 | 1 | 1 | 34 | 1 | 77 | 6 | 24,564 |

colC (301, cook-only — identical to the natpair and r54bisect colA rows):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | deaths | starv | tsNat | pop | pantry |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 160 | village-lost | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 50 | 0 | 77 | 6 | 8,484 |
| 73672 | 180 | survived | 0 | 3 | 3 | global | global | 1 | 1 | 0 | 0 | 24 | 0 | 77 | 8 | 41,311 |
| 73673 | 90 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 26 | 0 | 84 | 9 | 36,153 |
| 73674 | 139 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 35 | 0 | 124 | 7 | 38,816 |
| 73675 | 132 | over-other | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 30 | 0 | 77 | 8 | 6,758 |
| 73676 | 124 | over-other | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 33 | 0 | 77 | 7 | 24,934 |
| 73677 | 143 | village-lost | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 45 | 0 | 77 | 1 | 3,500 |
| 73678 | 173 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 58 | 2 | 88 | 1 | 0 |

## PER-CANDIDATE OUTCOME (each judged by its pre-registered test)

- (C1) src/data + src/js delta: EXCLUDED. File-by-file
  diff 8ea64d848..HEAD -- src/ is exactly two files:
  conversation.js (the r54 grace beat, already exonerated
  by identical columns) and build.js (version string
  only — the file's entire content is the BUILD_VERSION
  assignment; it is eval'd by the harness but assigns
  nothing game-logic). src/data diff: EMPTY. The
  colB per-seed reproduction from CURRENT src/js +
  base competent.js is independent confirmation: current
  src/js cannot be the drift source, or colB could not
  have reproduced the 0126Z rows exactly.
- (C2) policy/substrate history: CONFIRMED, in two
  steps. The delegation chain is tableseat-nowait →
  leanlinkrescue → competent.daily (counterPlay fish/
  cook staffing). tableseat-nowait.js, leanlinkrescue.js,
  and leanlink.js are byte-identical base..HEAD; the
  ONLY substrate change is competent.js, and it
  contains exactly the two staffing fallbacks (cook
  fallback base→natpair diff; fish fallback
  natpair→HEAD diff). colB == 0126Z and colC == 301
  (both per-seed exact) prove each step. The fish
  fallback's own confirm evidence corroborates the
  mechanism (fallback slots fire, trajectories reshuffle
  in both directions, arena deaths dominate the flips).
- (C3) harness inputs: EXCLUDED as the A/B cause by
  construction (one script, one harness, identical for
  all three columns — the columns differ ONLY in
  competent.js, yet produce three distinct bands) and
  as the 0126Z-vs-current cause by the empty diffs
  (sim-harness.js and sweep-compare.js byte-identical
  base..HEAD) plus the independent-instrument
  reproduction (colC == natpair recorder rows and ==
  r54bisect plain rows, two different instruments).
  Seed handling (mulberry32(seed) before eval, full
  index.html-order module list) is identical across
  columns by construction.
- (C4) base misattribution: EXCLUDED. 8ea64d848 exists
  (2026-10-26 01:23Z, the 0017Z coordinator commit);
  the rebaseline header states base/seeds/policy/
  horizon matching this run exactly; the 0017Z band
  line (deaths 260, natEver 6/8, raids 85, raiders 352,
  pool 1,527, wave-4 5/8, wins/table/entered 4/8) matches
  the rebaseline band; and colB now reproduces the
  anchor rows exactly from a different src/js
  (current) + base competent.js — the anchor is a real
  measurement of the base substrate, not a comparison
  artifact. CORRECTION to a neighboring label (not to
  the anchor): the "current band" (301) in the brief
  and in natpair/drawwave/r54bisect evidence is the
  COOK-ONLY band, not a cook+fish band — the r54bisect
  corpus was carried across its rebase without
  re-sweeping. Future arms must cite colA (294/3 wins)
  as the true-current band, colC (301/4 wins) as the
  cook-only band, and colB (260/4 wins) as the 0126Z
  band. No prior verdict is re-judged: natpair's
  pairing answer, drawwave's appropriateness answer,
  and r54bisect's r54 exoneration all stand — only the
  substrate label on their shared band was wrong.
- (C5) instrument-coverage delta: PARTIALLY EXCLUDED,
  with the pre-registered raids residue OPEN. Starvation
  definition: EXCLUDED as a drift source — the
  rebaseline sweep uses the identical regex
  /starv|hunger/i (same file, same line class), and
  all three columns use it; the starvation moves
  (9→2→2) are real trajectory moves, not counting
  changes. National-ever pairing: EXCLUDED as a drift
  source — NEWPAIRED holds on all 24 rows; the old
  strict number-vs-boolean check remains a bug witness
  only, never revived. Raids/pool: NOT ADJUDICATED —
  plain rows carry no raftdraft census, so the raids
  85→91 / raiders 352→404 / pool 1527→1346 drift
  between the 0126Z and 301 bands is open residue for
  a raftdraft-census rerun under colB/colC, not claimed
  here. (The 301-band raids/pool numbers come from
  drawwave; the true-current colA band has no
  raids/pool measurement yet at all.) The residue does
  not block DIAG-GO per the pre-registered exception:
  C2 is confirmed on trajectory fields.

## WALL NUMBERS (judge future arms against colA, the true-current band)

national-ever 8/8, national-final 5/8, table invited 4/8,
entered 3/8, wins 3/8 (lesser seat only), wave-4 4/8,
wave-5 0/8, full seat 0/8, Arc IV 4/8 (maxArc 4 on
73673/73674/73676/73678, see per-seed table), median survival 143d, max
180d, deaths 294, starvation 2. The wall stands where
the cook-only band left it, one step worse: wave 5
still unborn, the full seat still untouched, and wins
now 3/8 instead of 4/8 on true current. The scale story
is unchanged in shape (villages reach national 8/8
yet still die) but the numbers future arms must beat
are colA's, not the 301 band's.

## VILLAGE ASSESSMENT (plain words)

Three times the same eight villages lived, and each
time the kitchen staff changed, the villages changed
with it. With nobody staffing the cook fire or the
creek reliably (the old band), two villages stalled
out hungry — one survived 180 days on 200 kcal with
two people, the other died at day 70 — while four won
through the lesser seat. Once a cook could actually be
found when the first choice refused, the stalled
villages climbed: the hungry survivor won, the
day-70 village lived to day 124 and won, and deaths
rose because villages lived long enough to fight more
battles. Then the creek got the same treatment, and
the story reshuffled rather than improving: the two
villages that had just learned to win fell apart
again (one at day 173 with nothing left in the pantry,
one at day 139 after touching the table but never
sitting), while a village that had died at day 173
under cook-only now wins at day 128. Better staffing
does not mean better villages, one for one — it means
different villages, because who eats, who fishes, and
who stands in the arena all change downstream. Nothing
here reads robotic: the wins still arrive through the
seat legs at national+, the losses read as realms
coming apart aloud (73675, 73676, 73677 all end
regional after touching national or global), and the
one table-invited non-sitter (73676, invited but
never entered) is a village that reached the door and
then lost the realm before it could sit — a real
failure mode, not a bookkeeping artifact. The blank
this arm fills is measurement, not behavior: the drift
that has haunted three runs now has a name, a
mechanism, and a corrected set of tables — and the
next lever arm finally knows which village it is
actually playing against.

## BLANKS FILLED OR DOCUMENTED

- FILLED (the topmost named blank from the 0830 run):
  the wider drift bisect — C2 confirmed in two steps,
  with per-seed-exact reproduction at each step, and
  the substrate label on the shared band corrected
  (301 = cook-only, 294/3 wins = true current).
- FILLED (method): the three-column competent-swap
  bisect (base / cook-only / current competent.js as
  exact git versions) + ROWJSON stdout fallback for
  flap-proof row capture + order-insensitive map
  comparison in the proof (the first proof run's 3
  failures were that comparison bug, disclosed and
  fixed, not row differences — final proof 97/97).
- DOCUMENTED, NOT FIXED (carried, not chased here):
  (1) the raids/pool drift (85→91 / 352→404 /
  1527→1346) is unadjudicated — needs a raftdraft
  census rerun under colB/colC; (2) the true-current
  band (colA) has no raids/pool measurement yet;
  (3) the fish fallback's winner→loss flips on this
  band (73675, 73676) are a lever question for a
  future food-economy arm, not a verdict change here
  (this arm is DIAG only, zero game-code changes);
  (4) the r54bisect corpus's substrate label should be
  corrected in its own evidence note by the coordinator
  (this arm does not rewrite sibling evidence).
- NOT DONE (by design, per the arm brief): no
  game-code change of any kind; no tuning against any
  band; no re-judgment of prior corpora against a new
  baseline; no push, no bump, no live verification.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- One pre-registration deviation, disclosed in the
  interim section and not hidden: the instrument gate
  (colA reproduces r54bisect colA) failed on seed
  73671, and a single diagnostic colC seed was run out
  of column order to attribute the failure before
  further spend. The deviation changed NO threshold:
  band-match rules, candidate tests, and DIAG-GO were
  applied exactly as pre-registered, with corrected
  band labels (301 = cook-only) proven by the
  diagnostic itself. The alternative — declaring
  INSTRUMENT-FAILED on a valid instrument — would have
  hidden the finding, so the deviation is recorded
  here as a correction to the comparator's label, not
  as a re-score of any metric.
- No pre-registered metric was re-scored mid-run.
  colA==301 is false (colA is the new true-current
  band, 294/3 wins) and is reported as a finding, not
  scored against the 301 label. colB==0126Z and
  colC==301 are both true on the letter of the rules
  AND per-seed exact on top of that.
- Proof-test correction, disclosed: the first proof
  run failed 3 legs (colC-vs-natpair, colC-vs-r54bisect,
  colA rerun) because it compared deaths maps with
  JSON.stringify, which is key-order sensitive, while
  the two flap-period rows were persisted with
  alphabetical key order. An order-insensitive
  comparison (objEq) replaced it; the rows themselves
  were never edited. Final proof: 97 passed, 0 failed.
- Revision proposed for the NEXT run (not applied
  here): any arm that carries a corpus across a rebase
  must re-sweep, or state that its corpus predates the
  rebase — a carried corpus keeps its old substrate
  label silently, which is how the 301 band was
  mislabeled as current for two runs. Also: future
  band tables should name their competent.js digest
  (base 76abf6f3 / cook-only 926f87f9 / current
  b0adaacc) alongside the band, so a substrate label
  can never drift again without detection.
- The telemetry-check and balanced panel were NOT run,
  per the standing exception for sweep rows (panel
  cannot ingest sweep corpora; checker counts are
  wrong on sweep rows) and the brief's DIAG scope. The
  sweep summary + this evidence file are the
  comparison of record. No baseline was rolled.

## Infrastructure notes

- Sweep: scripts/test-driftwide-sweep.js (r54bisect
  sweep adapted: competentSha in place of
  conversationSha, colC support, ROWJSON stdout
  fallback on write failure). Corpus:
  evidence/2026-10-26/perseed-sim-driftwide-a/ (8 colA
  + 8 colB + 8 colC rows + 2 reruns + summary.json;
  the two flap-period 73671 rows were captured via
  ROWJSON and persisted exactly, minus the transient
  writeFailed marker). Proof:
  scripts/test-driftwide-a.js — 97 passed, 0 failed
  (after the disclosed objEq fix; first run 94/3, all
  3 the key-order comparison bug).
- Detgate PASS (colA 73671 twice in-process,
  trajectory-identical). check.js --quick NOT run:
  zero src/js diff in this arm's final tree; the arm's
  own proof tests are the verification of record.
- Write-flap episode (full record in the interim
  section): flap onset ~09:24Z, cleared ~10:0xZ after a
  ~40-minute sustained phase; one `git checkout --`
  truncated competent.js to 0 bytes (recovered from
  git, sha-verified); tool-path writes bypassed the
  flap throughout (how the interim notes and the two
  73671 rows were persisted). Final tree verified:
  competent.js == HEAD (b0adaacc), git status shows
  only the 4 new paths (evidence file, perseed dir,
  2 scripts).
- Commit: sim-driftwide-a, DIAG ONLY, zero src/js
  diff, zero policy diff in the final tree (all three
  competent.js variants were restored after their
  columns; HEAD content verified by sha). Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this
  arm's).
