# sim-rotdecide-govern-b — FIRST deciding rot corpus judged ONLY by govern-verdict.js

Run: oversight-flesh-out-loop-b-20261025T0335Z, arm sim-rotdecide-govern-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-rotdecide-govern-b`,
branch sim-rotdecide-govern-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was written
BEFORE any sweep in this run was executed. The verdict section at the end is
judged ONLY against this header, and ONLY by scripts/govern-verdict.js.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food ladder:
  cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d; smoking
  16 ticks; blind penalties teach once). The preserver-widening commit
  75fdd9258 is canon-adjacent (it widens SPECIALTIES.preserver from ghost
  occupations matching nothing to the real occupation pool) — a hypothesis
  about preservation throughput, not a finding; this corpus tests it under
  one governing system.
- No canon doc covers metric hierarchies — this arm is tooling/measurement
  only, it invents no game canon and changes zero `src/js` game code.

## The rot question (backlog, NOT re-judged here)

The leg-2 rot step at preserver widening 75fdd9258, measured as paired
parent-vs-commit rot ratios (pd0/pd1) at 100d. The 2230Z governverdict arm
built the governing system (scripts/govern-verdict.js, sim-governverdict-b.md)
and the 2130Z leg2decide arm judged STEP CONFIRMED on its own deciding
metric (median step ratio 0.404x on seeds 9266-9281). Those two verdicts
came from two different systems, so the drift story was left carrying two
labels. This run settles it under ONE system: a FRESH deciding corpus
judged ONLY by govern-verdict.js. No existing corpus (leg2decide,
leg2drift, governverdict dry-run, or any earlier corpus) is re-judged
here — every number in the verdict section comes from the fresh corpus
below.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- SOLE JUDGE: scripts/govern-verdict.js is the SOLE judge. Its printed
  verdict label (governing class + CONTESTED flag, exactly as printed)
  IS the verdict of this run. Per-seed median step governs; aggregate
  sum step, ratio-of-medians step, and median-per-seed-step are
  diagnostics that qualify via CONTESTED but NEVER overturn.
- Bands (from govern-verdict.js, fixed): STEP if step < 0.80, NO-STEP if
  step >= 0.90, INCONCLUSIVE between. Banding on full-precision floats.
- PRIMARY METRIC: governing per-seed median step G = M(commit) / M(parent),
  where M(A) = median over seeds of r(A, s), r(A, s) = rot100d(A, pd1, s) /
  rot100d(A, pd0, s), rot100d = (rotFreshKcal + rotPreservedKcal) /
  daysAlive * 100.
- GO THRESHOLD / HYPOTHESIS (declared before sweeping): STEP. On the
  leg2decide deciding metric this pair stepped (0.404x), so the hypothesis
  under test is that the governing system also returns STEP (with or
  without the CONTESTED qualifier — the qualifier is part of the printed
  label, not a pass/fail modifier). If the tool prints NO-STEP or
  INCONCLUSIVE (contested or not), the hypothesis is NOT met and the
  verdict stands as printed; it is never re-scored against a friendlier
  summary.
- Pair under test, ONLY pair: preserver widening, parent -> commit =
  1f24a4ef04a857d33138fd0845cfa83df688285c ->
  75fdd92587ad9d83bb12f05da535cdfb49255835. No other pair, no era
  anchor, no master anchor is run or judged in this run. (Same pair as
  leg2decide, per sim-leg2decide-b.md + scripts/sweep-leg2drift-b.js.)
- Anchor contrast (identical on both sides of the pair, identical on
  both anchors): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (both asserted FATAL by the driver),
  PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware horizon (dead
  villages stop; +10d tail max), instrument scripts/sweep-leg2drift-b.js
  run from the git-archive-extracted tree of each anchor
  (<worktree>/bisect-scratch/<sha>/ — never /tmp worktrees, never bare
  `git worktree add`, never a checkout of an old commit in the worktree).
- Seeds, FRESH band: 9310-9325 (16 seeds). Verified fresh before sweeping:
  no `931x`/`932x` seed-band filename in any evidence/2026-10-24 corpus
  dir, and no dated .md file names a 9310-9325 seed band (grep over
  evidence/2026-10-24/*.md returned no seed-band hits for 9310-9325).
  This band overlaps NEITHER the leg2decide corpus (9266-9281) NOR the
  leg2drift corpus (9250-9257) NOR the governverdict dry-run (9300-9307).
  Configs: 16 seeds x {pd0, pd1} x {parent, commit} = 64 configs, all
  written to this worktree's evidence/2026-10-24/rotdecide-govern-b-corpus/
  (a NEW corpus dir, never mixed into leg2decide-b-corpus or any other).
- Pilot gate: the first 8 seeds (9310-9317) run first as a smoke check
  that the instrument runs on the fresh band (files parse, anchor tags
  match, both PD sides present per anchor). The pilot is NOT a verdict:
  the verdict is judged ONLY on the full 16 seeds. A pilot instrument
  failure is a loud failure, not a verdict of any kind.
- Conversion to govern input: scripts/convert-rotdecide-govern-b.js
  (new, this run) reads ONLY the fresh corpus per-seed files and emits
  the {records: [...]} input govern-verdict.js expects (seed, parent/commit
  x pd0/pd1 x {rot, days}). No other corpus file is read by the converter.
- Proof: scripts/test-rotdecide-govern-b.js (new, this run) asserts:
  (T1) converter builds exactly the govern input from synthetic corpus
  files and refuses a mixed-anchor/foreign-seed file; (T2) govern-verdict.js
  on the fresh corpus exits 0 and its printed label matches an independent
  recomputation of the governing step from the raw per-seed files;
  (T3) corpus completeness 64/64, anchorCommit tags + seeds matching,
  both PD sides per anchor per seed.
- Balanced panel (§15): this is a measurement DIAG on one pair, not a
  before/after lever landing — no panel compare is built, because the
  panel driver cannot run env-gated cross-tree anchor sweeps (the
  documented #797 "Unmatched flags" invalidity, as in pddrift /
  leg2drift / leg2decide); the verdict is judged on the govern tool's
  output on the fresh corpus (§15 fallback). One line, as required:
  panel inapplicable.
- SENSE-TESTING LAW: the evidence MUST show the per-seed ratio
  distribution (every seed's r(parent, s) and r(commit, s), sorted, plus
  the govern tool's sensitivity counts), and MUST read one seed's
  rot/preservation trajectory as a village story (sensible or not),
  not just numbers. Per-seed files carry aggregates, not transcripts,
  so the story reading is from the rot/fresh/preserved/death fields
  across the seed's four cells.
- DIAG scope: zero src/js game changes. Instruments + converter +
  evidence only.

## Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- The governing system held without re-scoring: the pre-registered
  hypothesis was STEP, the tool printed STEP (CONTESTED), and the
  verdict stands exactly as printed. No diagnostic was promoted to
  overturn it, and no band was moved after seeing the numbers.
- The CONTESTED qualifier did real work here, exactly as the
  governverdict arm predicted: all three diagnostics disagree with
  the governing band (aggregate NO-STEP 1.166x, ratio-of-medians
  INCONCLUSIVE 0.818x, median-per-seed-step NO-STEP 1.000x). A reader
  who saw only "STEP" would over-read it; the label refuses that.
- Sensitivity note for the NEXT run (not a revision to this verdict):
  the governing step is carried by the middle of the distribution
  moving (parent median 0.298 -> commit median 0.192), while the
  per-seed steps are split (5 identical, 4 down, 3 up, 2 degenerate)
  and the aggregate actually moves the OTHER way (0.765x -> 0.892x).
  The median-per-seed step of exactly 1.000x is again the
  identical-seed saturation shape from leg2decide (5/14 included
  seeds byte-identical). A future pre-reg that wants a breadth
  requirement (e.g. a minimum share of seeds moving the governing
  way) must say so before sweeping — this tool does not add one.
- Zero-denominator handling behaved as designed: seeds 9310 and 9312
  have pd0 rot 0 on BOTH anchors, so their ratios are excluded and
  counted (4 exclusions = 2 seeds x 2 anchors), not imputed. Their
  pd1 rot values (25,439 and 185,645) are real rot that the ratio
  simply cannot express — a known blind spot of the ratio instrument,
  recorded here, not patched mid-run.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the fresh 9310-9325 corpus)

### Corpus completeness

- 64/64 per-seed files, 0 zero-byte files, all parsing, all
  anchorCommit tags equal to the pre-registered pair, all filename
  seeds matching file seeds, both PD sides per anchor per seed.
- Pilot (9310-9317) passed its smoke check before the extension
  (9318-9325) ran: files parsed, tags matched, both sides present.
- Incident during the run (recorded, no data lost): the first
  extension attempt died with its session after landing only seed
  9318 parent pd0 (no sweep process remained). The extension was
  re-run in full from the same instrument; the re-run reproduced
  seed 9318 parent pd0 byte-identically (179k rot, same days/rank/
  wave), confirming the sim is deterministic and the re-run did
  not silently change any cell.
- Anchor instrument reproduced cleanly (no FAIL LOUDLY needed):
  `git archive <sha> | tar -x` into worktree-local bisect-scratch/
  per anchor, driver scripts/sweep-leg2drift-b.js copied into each
  extracted tree (the documented P4 method from
  scripts/test-leg2drift-b.js — the driver postdates both anchors,
  so it does not exist in either extracted tree on its own).
  Bisect-scratch was deleted after the run.

### GOVERNING VERDICT (scripts/govern-verdict.js, exactly as printed)

- **Verdict: STEP (CONTESTED)**
- Governing step G = 0.645x (M(parent) = 0.298x, M(commit) = 0.192x).
- The pre-registered hypothesis (STEP) is MET: 0.645x < 0.80x. The
  CONTESTED qualifier is part of the printed label, not a pass/fail
  modifier — the verdict is STEP, qualified, not clean.
- This settles the drift story under ONE system: the leg2decide
  deciding verdict (STEP CONFIRMED on its own metric) and the
  govern-system verdict (STEP (CONTESTED)) now agree on DIRECTION
  on a fresh corpus, where the old corpus carried opposite labels
  across systems. The disagreement that remains is the honest one:
  the summaries still do not agree with each other (see below).

### DIAGNOSTICS (printed in full; they qualify, they never overturn)

- Aggregate sum step: 1.166x (NO-STEP). Parent aggregate ratio
  0.765x -> commit 0.892x. The aggregate moves the OTHER way from
  the governing median — driven by the huge-rot seeds (9324 parent
  pd0 505,650; 9323 parent pd0 236,993), the exact failure mode
  the governing median exists to guard against.
- Ratio-of-medians step: 0.818x (INCONCLUSIVE). Parent 0.754x ->
  commit 0.616x.
- Median per-seed step: 1.000x (NO-STEP). 12 defined steps: 5
  identical, 4 down, 3 up; 2 degenerate steps excluded and counted
  (seeds 9321, 9325 — both ratios 0, pd1 rot 0 on both anchors).
- Sensitivity counts (from the tool): 16 seeds, 14 included ratio
  seeds per median, 4 zero-denominator exclusions (seeds 9310,
  9312), 0 undefined cells, 2 degenerate per-seed steps, 5
  identical-ratio seeds, 4 moved down (1 denominator-driven, 1
  numerator-driven, 2 mixed), 3 moved up.
- Why CONTESTED: every defined diagnostic sits in a different band
  from the governing STEP band, so the CONTESTED rule fires. The
  verdict claims the governing direction and refuses to present
  it as clean.

### Per-seed ratio distribution (the sense evidence — every seed, numerically sorted)

Seed | r(parent) | r(commit) | per-seed step | reading
9310 | n/a (pd0 rot 0) | n/a (pd0 rot 0) | n/a | excluded, counted; pd1 rot 25,439 both anchors, identical
9311 | 6.281 | 6.281 | 1.000 | identical; extreme ratio both anchors (pd0 78,160 vs pd1 490,939)
9312 | n/a (pd0 rot 0) | n/a (pd0 rot 0) | n/a | excluded, counted; village lost d42 on pd0 both anchors
9313 | 2.441 | 2.015 | 0.825 | moved down mildly; commit village lived longer (pd1 d89 -> d97)
9314 | 0.046 | 0.046 | 1.000 | identical
9315 | 0.323 | 0.312 | 0.968 | moved down slightly; BOTH sides' rot rose on commit (pd0 14,431 -> 47,812; pd1 4,656 -> 14,928)
9316 | 39.717 | 0.000 | 0.000 | moved down sharply, numerator-driven (commit pd1 rot 0 vs parent 23,830; commit pd0 rot 600 -> 10,186)
9317 | 2.518 | 0.111 | 0.044 | moved down sharply, denominator-driven (commit pd0 rot 19,418 -> 206,166; see sense story below)
9318 | 0.085 | 0.085 | 1.000 | identical
9319 | 0.016 | 0.016 | 1.000 | identical
9320 | 0.721 | 4.112 | 5.703 | moved UP sharply, mixed (commit pd0 rot fell 26,439 -> 13,625 AND village lost d97; commit pd1 rot rose 19,060 -> 57,754)
9321 | 0.000 | 0.000 | n/a (degenerate) | pd1 rot 0 both anchors; excluded, counted
9322 | 0.009 | 2.837 | 317.025 | moved UP enormously, mixed (commit pd0 rot collapsed 134,087 -> 16,160; commit pd1 rot rose 1,200 -> 45,849)
9323 | 1.007 | 1.860 | 1.846 | moved up (commit pd1 rot 238,760 -> 344,730; pd0 rot fell 236,993 -> 185,384)
9324 | 0.274 | 0.274 | 1.000 | identical; largest absolute rot in the corpus (pd0 505,650 both anchors)
9325 | 0.000 | 0.000 | n/a (degenerate) | pd1 rot 0 both anchors; excluded, counted; commit pd0 rot halved (239,692 -> 115,767) but invisible to the ratio

Numerically sorted parent ratios (14 included): 0.000, 0.000, 0.009,
0.016, 0.046, 0.085, 0.274, 0.323, 0.721, 1.007, 2.441, 2.518, 6.281,
39.717 (median 0.298 = mean of 0.274/0.323).
Numerically sorted commit ratios (14 included): 0.000, 0.000,
0.000, 0.016, 0.046, 0.085, 0.111, 0.274, 0.312, 1.860, 2.015,
2.837, 4.112, 6.281 (median 0.192 = mean of 0.111/0.274).
Numerically sorted per-seed steps (12 defined): 0.000, 0.044,
0.825, 0.968, 1.000 (x5), 1.846, 5.703, 317.025 (median 1.000).

Sense reading: the step is CONCENTRATED and CONTESTED, not broad.
Five seeds did not move at all, three moved up (one by 317x), four
moved down. The governing median moved because the middle of the
distribution moved (parent middle pair 0.274/0.323 -> commit
0.111/0.274), not because most seeds moved. The aggregate moving
the other way is the huge-rot seeds (9324, 9323) dominating sums.
A reader who only saw "STEP" would over-read it; the distribution
above is the honest picture, and the verdict is still STEP
(CONTESTED) because that is what the pre-registered governing
system prints.

### SENSE-TESTING LAW — one seed's rot/preservation story (seed 9317)

Read across its four cells, seed 9317 tells a sensible village
story, not just a ratio move. On the parent, the no-depri village
lived 100 days, reached national, fought to wave 4, and rotted
only 19,418 kcal (16,935 fresh + 2,483 preserved). On the commit,
the same village with real preservers lived the same 100 days and
stayed national — but rotted 206,166 kcal, ALL of it fresh, zero
preserved rot, and stalled at wave 2 with no combat deaths at all:
a village that hauled in a mountain of fresh food, never got it
preserved, and watched it spoil while staying home. Its depri
sibling on the commit tells the other half: deprioritized food
jumped from 71,601 to 168,227 kcal, rot fell to 22,796, but the
village slipped off national standing — the plenty-depri behavior
threw away far more rather than let it rot, and the village paid
for it in standing. That is a coherent food-handling story:
preserver widening changed what the village DOES with food
(hoard-and-rot vs throw-away-early), and the ratio step is the
shadow of that behavior change, not a bookkeeping artifact. The
one wrinkle a reader should hold: commit pd0's zero preserved rot
sits oddly beside 206k fresh rot — either nothing survived long
enough to count as preserved rot, or preserved stores were eaten
first. The per-seed files cannot distinguish those; they do not
contradict the story, they bound it.

### Wall numbers (from this corpus only)

- Configs 64, national 55/64 (86%), table 0/64, wins 0/64.
- Max wave reach: wave 4 in 31 configs, wave 3 max in 26, wave 2
  max in 7; no config reached wave 5.
- Median daysAlive 100 (the 100d horizon cap; 9 configs ended
  early: parent pd0 s9312 42d, s9313 83d; parent pd1 s9312 95d,
  s9313 89d; commit pd0 s9312 42d, s9313 83d, s9320 97d; commit
  pd1 s9312 95d, s9313 97d — the paired early endings on both anchors show
  the horizon is death-aware, not a fixed run length; s9320 is
  the one commit-only early ending).
- Death-cause shares across the corpus: 533 deaths; combat 55.2%,
  monster 18.0%, sickness 7.5%, starvation 4.9%, ambush 3.8%,
  "a wound that wouldn't close" 2.8%, contest 2.3%, dehydration
  1.5%, rest scattered (named-monster and event causes <1% each).
- No win flag, no table reach in this DIAG corpus — expected:
  this is a 100d measurement DIAG on one pair, not a win-seeking
  run, and it does not move the scale-wall numbers by itself.

### Regime note (what substrate this corpus ran on)

- Substrate: leadfeast policy, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0 (seat/table drive OFF — the corpus cannot reach
  the table by construction, so table 0/64 is a substrate fact,
  not a finding), 100d death-aware horizon, instrument
  scripts/sweep-leg2drift-b.js run from git-archive-extracted
  trees of the two anchors (game code AT each anchor, not current
  master — the preserver widening is the ONLY game-code delta
  between the two extracted trees' relevant systems by
  construction of the pair).
- Anchor code is OLD (October 2026-10-24 early lineage, parent
  1f24a4ef0 / commit 75fdd9258), not current master. The verdict
  is about that pair on that lineage, not about today's master.

### Village assessment (in plain words)

The villages in this corpus looked like ordinary mid-game
villages on a 100-day clock: most reached national standing,
none reached the galactic table, none won, none got past wave 4.
That is the familiar scale wall in miniature — villages survive
and climb to national, then stop. What changed between the two
anchors is not survival or standing in aggregate but food
handling: on the commit, some villages hoarded fresh food and
rotted spectacularly (9317: 206k), others threw away far more
under plenty-depri (9317 commit pd1: 168k deprioritized), and a
few flipped which side rotted entirely (9322). The step the
governing system reports is real but ragged — a behavior change
with winners and losers by seed, not a uniform improvement.
Nothing here reads robotic: deaths spread across combat, monster,
sickness, starvation, wounds, and named causes, and villages
diverged in rank, wave, and lifespan in ways that track their
food story.

### Proof

- node scripts/test-rotdecide-govern-b.js => 11 PASS, 0 FAIL
  (T1 converter incl. foreign-anchor + missing-cell refusals,
  T2 governing step matches independent recomputation to 3dp,
  T3 64/64 corpus completeness + tags + seeds + sides).
- node scripts/govern-verdict.js --input
  evidence/2026-10-24/rotdecide-govern-b-corpus/govern-input.json
  => verdict "STEP (CONTESTED)", governing step 0.645, M(parent)
  0.298, M(commit) 0.192, aggregate step 1.166, ratio-of-medians
  step 0.818, median per-seed step 1.000.
- node scripts/convert-rotdecide-govern-b.js => 16 records from
  the fresh corpus only (foreign anchors refused by construction).

### Balanced panel (§15)

Panel inapplicable: measurement DIAG on one pair; panel driver
cannot run env-gated cross-tree anchor sweeps (documented #797
invalidity). The verdict is judged on the govern tool's output on
the fresh corpus (§15 fallback, as in leg2drift/leg2decide).
