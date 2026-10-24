# sim-governverdict-b — ONE governing verdict system for paired rot-ratio summaries

Run: oversight-flesh-out-loop-b-20261024T2230Z, arm sim-governverdict-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-governverdict-b`.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE the governing tool was run on any corpus (calibration or
dry-run). Results appended after the header are judged ONLY against it.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food ladder).
  No canon doc covers metric hierarchies — this arm is tooling/measurement
  only, it invents no game canon and changes zero `src/js` game code.
- `docs/MEASUREMENT.md` §§14–15 (metric binding; balanced panels). This
  arm is a measurement instrument, not a before/after lever landing, so
  §15 panel compare is inapplicable in the same way as the leg-2 DIAGs
  (the panel driver cannot run env-gated cross-tree anchor sweeps;
  documented #797 "Unmatched flags" invalidity). The verdict here is
  judged on the tool's own proof tests (§15 fallback: manual paired
  rows + proof script).
- Prior evidence read: `evidence/2026-10-24/sim-leg2decide-b.md` (the
  deciding run) and `evidence/2026-10-24/sim-leg2drift-adopt-b.md`
  (the contested bisection). The 2130Z open item they leave is this
  arm's whole job: pre-register ONE governing system or tie-break
  BEFORE the next deciding corpus.

## The blank (not re-judged here)

The leg-2 rot-drift work ended carrying two opposite verdicts on one
corpus: the deciding per-seed median step said STEP CONFIRMED at
preserver widening 75fdd9258, while aggregate-sum and ratio-of-medians
diagnostics said the opposite direction (INCONCLUSIVE bands), and the
median per-seed step said no step at all (1.000x). This arm does NOT
re-judge that corpus and does NOT change the leg2decide deciding
verdict, which stands as written. It BUILDS the governing system the
next deciding run will use, and proves it on calibration corpora plus
a fresh dry-run pair. Any leg2decide numbers appearing below are
CALIBRATION INPUTS ONLY: they test whether the tool labels a known
shape correctly. They are not a new verdict on the rot question.

## PRE-REGISTRATION (bound per §§9–12, 14–15)

### Tool

- `scripts/govern-verdict.js` (name checked non-colliding before
  writing; no `scripts/govern*` file existed). Pure measurement:
  reads per-seed paired rot records, prints exactly ONE governing
  verdict label plus all four summary steps and a sensitivity view.
  Zero `src/js` changes. Proof: `scripts/test-governverdict-b.js`.

### Inputs and the four summaries (fixed here)

Each input record is one seed on BOTH anchors and BOTH sides:
`{seed, parent: {pd0: {rot, days}, pd1: {rot, days}},
commit: {pd0: {rot, days}, pd1: {rot, days}}}`, where `rot` is
rotFreshKcal + rotPreservedKcal and `days` is daysAlive for that
seed/side/anchor. Per-cell rot100d = rot / days * 100 (days > 0;
a days == 0 cell is undefined and excluded, counted).

- Per-seed ratio r(A, s) = rot100d(A, pd1, s) / rot100d(A, pd0, s).
  EXCLUDED (counted, never imputed) when the pd0 cell is undefined
  or its rot100d is 0 (zero denominator). A pd1 rot100d of 0 gives
  r = 0, which is a valid value.
- M(A) = median of r(A, s) over included seeds. Even-n median =
  mean of the two middle values after a NUMERIC sort (never a
  string sort — the leg2decide analyzer's display-sort bug class
  is explicitly rejected here).
- GOVERNING step G = M(commit) / M(parent).
- Aggregate step: per anchor, aggRatio(A) = (sum rot pd1 /
  sum days pd1 * 100) / (sum rot pd0 / sum days pd0 * 100), sums
  over defined cells; aggregate step = aggRatio(commit) /
  aggRatio(parent). Undefined when either side's aggregate
  denominator is 0.
- Ratio-of-medians step: per anchor, romRatio(A) =
  median(rot100d pd1) / median(rot100d pd0) over defined cells;
  step = romRatio(commit) / romRatio(parent). Undefined when
  the median pd0 rot100d is 0.
- Median per-seed step: median over seeds of
  r(commit, s) / r(parent, s), over seeds where both ratios are
  defined AND r(parent, s) > 0. EXCLUDED (counted, never imputed
  as 0 or 1) when both ratios are 0 (degenerate) or when
  r(parent, s) == 0 and r(commit, s) > 0 (infinite step). This
  rejects the leg2decide analyzer's 0.000 artifact for seed 9268.

### The hierarchy (fixed here — the whole point of this arm)

1. The GOVERNING summary is the per-seed median step G. Why it
   governs, on measurement grounds fixed before any run: it is
   paired within seed (the same seed on both sides and both
   anchors, so seed heterogeneity cancels); it is median-robust
   (a single high-rot seed cannot set it, the documented failure
   mode of the aggregate); and it answers the "typical seed"
   question a step claim is actually about.
2. The other three summaries — aggregate step, ratio-of-medians
   step, median per-seed step — are DIAGNOSTICS ONLY. They are
   printed in every report, and they may NEVER overturn, replace,
   or re-band the governing verdict.
3. The tool returns exactly ONE governing verdict label (see
   "Verdict labels" below). Diagnostics appear as a separate
   `diagnostics` block, never as competing verdicts.

### Bands (fixed here, reused from leg2decide for continuity)

Applied identically to the governing step and to each diagnostic:
STEP if step < 0.80; NO-STEP if step >= 0.90; INCONCLUSIVE if
0.80 <= step < 0.90. No rounding before banding: banding uses
full-precision floats; printing to 3 decimals is display only.

### Verdict labels and the CONTESTED rule (fixed here)

- Governing class = band of G. Label = the class name, with
  " (CONTESTED)" appended iff the CONTESTED rule fires.
- CONTESTED rule: the verdict is CONTESTED iff ANY defined
  diagnostic's band differs from the governing class's band.
  (INCONCLUSIVE vs STEP, STEP vs NO-STEP, and NO-STEP vs
  INCONCLUSIVE all count as disagreement — with pre-registered
  bands, any band disagreement means the summaries do not agree
  on the claim, and the run must not present a clean verdict.)
- CONTESTED annotates; it never replaces. "STEP (CONTESTED)"
  still claims the governing direction — it refuses to present
  that claim as clean. That is how diagnostics disagree without
  overturning: they qualify the verdict, they do not veto it.
- If G itself is undefined (M(parent) == 0, or zero included
  seeds), the verdict is INSUFFICIENT-DATA, uncontested, with
  the reason printed. No step is claimed from a zero median.
- Sensitivity view (report-only, never affects the verdict):
  included/excluded/degenerate counts, identical-ratio seed
  count (r(parent) == r(commit)), moved-down / moved-up /
  identical counts, and denominator-driven vs numerator-driven
  counts among down-moved seeds (denominator-driven = pd0
  rot100d rose while pd1 rot100d did not fall; numerator-driven
  = pd1 rot100d fell while pd0 rot100d did not rise; else mixed).

### Tie-breaks (fixed here)

1. An UNDEFINED diagnostic never contests. It is reported as
   UNDEFINED with its reason, and the contest check skips it.
2. Boundary values are exact: G == 0.80 is INCONCLUSIVE (STEP
   is strict < 0.80); G == 0.90 is NO-STEP (>= 0.90).
3. Degenerate per-seed steps are excluded and counted, never
   imputed (see the median-per-seed-step definition above).
4. Even-n medians use the mean of the two middle values.
5. Small n is not a verdict change: n >= 1 included seeds gives
   a defined median; n is always printed so a 1-seed verdict
   reads as what it is.

### Primary metric and GO threshold (fixed here)

- PRIMARY METRIC: governing-verdict correctness on calibration
  cases — the tool's label for each pre-registered calibration
  case must equal the label the hierarchy above dictates.
- GO THRESHOLD: 100% of calibration cases labelled as the
  hierarchy dictates, including CONTESTED where diagnostics
  disagree, INSUFFICIENT-DATA where the governing median is
  zero, and the exact boundary labels. Any miss is NO-GO for
  the tool (not a re-score: the hierarchy above does not move).
- Seeds/policies for the dry-run (see "Dry-run" below): 8 seeds,
  leadfeast/dg1, FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware
  horizon — the leg2drift reduced contrast, reused unchanged.
  The dry-run pair is HEAD vs HEAD~1 on current master lineage
  (a genuine pair, chosen because it exists on current master;
  NOT a rot-question pair — see "Dry-run" below).
- Horizon/why: 100d matches the leg2 corpora so the dry-run
  exercises the same instrument shape; death-aware (dead
  villages stop, +10d tail max) per the leg2 driver.

### Calibration cases (fixed here, before running)

- C1 leg2decide-published shape: M(parent) 0.487x -> M(commit)
  0.196x (G 0.404x, STEP), aggregate step 0.817x
  (INCONCLUSIVE), ratio-of-medians step 0.876x (INCONCLUSIVE),
  median per-seed step 1.000x (NO-STEP). Hierarchy dictates:
  STEP (CONTESTED). Proven by feeding the tool the real
  leg2decide-b-corpus per-seed files and checking it reproduces
  all four published summaries to 3 decimals AND labels
  STEP (CONTESTED). CALIBRATION ONLY — not a re-verdict.
- C2 clean STEP (broad shift): every seed's ratio roughly
  halves on the commit; all four steps < 0.80. Dictates: STEP.
- C3 clean NO-STEP (no shift): commit identical to parent on
  every seed; all steps 1.000x. Dictates: NO-STEP.
- C4 clean INCONCLUSIVE (uniform 0.85x scaling): every seed's
  ratio scales by exactly 0.85; all four steps 0.85x. Dictates:
  INCONCLUSIVE.
- C5 single-seed-dominated: one huge-rot seed drives the
  aggregate step below 0.80 while the typical seed does not move
  (G >= 0.90). Dictates: NO-STEP (CONTESTED) — the aggregate
  must not overturn the governing median.
- C6 identical-seed saturation (leg2decide shape, synthetic):
  most seeds byte-identical across anchors so the median
  per-seed step is 1.000x (NO-STEP) while G is STEP. Dictates:
  STEP (CONTESTED).
- C7 contested NO-STEP (mirror of C6): G is NO-STEP while a
  diagnostic is STEP. Dictates: NO-STEP (CONTESTED).
- C8 degenerate-zero: every pd0 rot is 0, so no ratio is
  defined. Dictates: INSUFFICIENT-DATA.
- C9 mixed degenerate: some seeds degenerate-excluded, the
  rest clean STEP. Dictates: STEP (from included seeds only),
  with the degenerate count printed.
- C10 boundary 0.80: uniform scaling giving G exactly 0.80.
  Dictates: INCONCLUSIVE (STEP is strict).
- C11 boundary 0.90: uniform scaling giving G exactly 0.90.
  Dictates: NO-STEP.
- C12 undefined diagnostic never contests: governing STEP,
  one diagnostic undefined (zero aggregate denominator), other
  diagnostics STEP. Dictates: STEP (uncontested).

### Dry-run (fixed here)

- If `scripts/sweep-leg2drift-b.js` runs cleanly on current
  master (1-seed smoke first), run a fresh 8-seed pilot pair
  (HEAD vs HEAD~1, leadfeast/dg1, 100d) and feed its per-seed
  files to the tool. The output is reported EXPLICITLY as a
  SYSTEM DRY-RUN — it exercises the tool end to end on live
  sim output and is NEVER a deciding verdict on the rot
  question (that question already has its deciding verdict in
  sim-leg2decide-b.md, unchanged by this run).
- If no instrument runs cleanly, calibration + proof tests are
  the deliverable and the dry-run is documented as deferred —
  no new sim driver is built mid-run to force it.

### SENSE-TESTING LAW, method scope

This is a pure measurement/tooling arm: per-seed files carry
aggregates, not transcripts, so no villager dialogue is sampled
here (same scope note as leg2drift/leg2decide). The sense
evidence is the per-case distribution tables (every seed's
ratios and steps, plus the sensitivity view), read for
concentration vs breadth — the exact failure mode this tool
exists to surface.

## Metric review (filled after results — revisions apply to the NEXT run, this arm is NOT re-scored)

- Metrics held. The hierarchy, bands, CONTESTED rule, and all five
  tie-breaks were fixed in the header before any run and were NOT
  moved after seeing results: the two initial proof failures (C10/C11
  boundary cases) were test-data float artifacts, fixed by choosing
  exactly-representable boundary corpora in the TEST, not by moving
  any band or tie-break in the tool.
- One calibration observation for the NEXT run's consideration (not
  a revision to this arm): the strict CONTESTED rule (ANY band
  disagreement contests) will mark most real corpora CONTESTED,
  because the four summaries rarely land in the same band. That is
  the intended behavior — a clean verdict should require summary
  consensus — but the next deciding run should expect its verdict
  to read "STEP (CONTESTED)" far more often than "STEP", and should
  present the sensitivity view alongside, not instead of, the label.
- Boundary semantics note (for the next run's pre-reg): "exactly
  0.80" means the float nearest 0.80, which is >= the 0.80 literal,
  so a computed step of that float is INCONCLUSIVE, not STEP. A
  future pre-reg that wants a different boundary treatment must say
  so explicitly (e.g. an epsilon band) — this tool does not add one
  silently.

## RESULTS (appended after the pre-registration above; judged ONLY against the header)

### Deliverable

- `scripts/govern-verdict.js` (new, tooling only; zero `src/js`
  changes): given per-seed paired rot records for two anchors, it
  computes the per-seed median step (GOVERNING), the aggregate sum
  step, the ratio-of-medians step, and the median per-seed step, and
  returns exactly ONE governing verdict label. Diagnostics are
  printed in full but can never overturn the governing verdict —
  they qualify it via the CONTESTED flag only.
- `scripts/test-governverdict-b.js` (new): proof for the tool.
- Dry-run corpus: `evidence/2026-10-24/governverdict-dryrun-b/`
  (32 per-seed files + 4 sweep summaries + `govern-input.json`,
  the exact tool input, so the dry-run verdict is reproducible).

### Calibration verdict: GO (100% of cases labelled as the hierarchy dictates)

`node scripts/test-governverdict-b.js` => **55 PASS, 0 FAIL.**
Every pre-registered case C1–C12 labelled exactly as the header
dictates, including the contested and boundary labels:

| Case | Shape | Dictated label | Tool label |
|---|---|---|---|
| C1 leg2decide-published (real corpus files) | G 0.404 STEP; agg 0.817 INCONC.; rom 0.876 INCONC.; med-per-seed 1.000 NO-STEP | STEP (CONTESTED) | STEP (CONTESTED) |
| C2 broad shift (all seeds halve) | all four steps 0.5 | STEP | STEP |
| C3 no shift | all four steps 1.000 | NO-STEP | NO-STEP |
| C4 uniform 0.85x | all four steps 0.85 | INCONCLUSIVE | INCONCLUSIVE |
| C5 single-seed-dominated | governing 1.000 NO-STEP; aggregate STEP | NO-STEP (CONTESTED) | NO-STEP (CONTESTED) |
| C6 identical-seed saturation (synthetic leg2decide shape) | G 0.100 STEP; med-per-seed 1.000 NO-STEP; 9 identical seeds | STEP (CONTESTED) | STEP (CONTESTED) |
| C7 contested NO-STEP (mirror) | G 1.000 NO-STEP; med-per-seed 0.500 STEP | NO-STEP (CONTESTED) | NO-STEP (CONTESTED) |
| C8 degenerate-zero (all pd0 rot 0) | no ratio defined | INSUFFICIENT-DATA | INSUFFICIENT-DATA |
| C9 mixed degenerate | 2 both-zero seeds excluded; rest clean STEP | STEP | STEP |
| C10 boundary exactly 0.80 | all steps on the boundary float | INCONCLUSIVE | INCONCLUSIVE |
| C11 boundary exactly 0.90 | all steps on the boundary float | NO-STEP | NO-STEP |
| C12 undefined diagnostic never contests | rom UNDEFINED; others STEP | STEP (uncontested) | STEP (uncontested) |

C1 reproduction detail (calibration only, NOT a re-verdict): from
the real `leg2decide-b-corpus` per-seed files the tool reproduces
M(parent) 0.487, M(commit) 0.196, governing step 0.404, aggregate
step 0.817, ratio-of-medians step 0.876, median per-seed step 1.000
(all to 3 decimals), degenerate count 1 (seed 9268, both ratios 0 —
excluded, never imputed as the old analyzer's 0.000 artifact),
identical count 9, zero-denominator exclusions 0. The leg2decide
deciding verdict (STEP CONFIRMED at preserver widening) stands
unchanged: this calibration does not re-judge that corpus, it
proves the new tool labels its shape as the hierarchy dictates
(STEP, qualified CONTESTED because every diagnostic disagrees
on band).

CLI contract proven in the same run: valid input exits 0 with the
verdict JSON; malformed JSON and missing `--input` both exit 2
FATAL. Median unit checks prove the numeric sort (14.960 vs 2.977
order correctly) and the even-n mean-of-middle rule.

### SYSTEM DRY-RUN on current master (explicitly NOT a deciding verdict)

- Pair: parent = HEAD~1 `a7aaa3b99` (tablepaths coordinator evidence)
  vs commit = HEAD `47426505e` (journey-endgame r48 tooling+evidence).
  The two anchors differ in ZERO `src/` files (verified by diff),
  so this is a genuine NULL pair: it exercises the full pipeline
  (extract → sweep → convert → govern) and the expected verdict
  is NO-STEP, not a claim about rot.
- Corpus: fresh seeds 9300–9307 (no overlap with leg2 bands),
  leadfeast/dg1, FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware
  horizon, instrument `scripts/sweep-leg2drift-b.js` run from the
  git-archive-extracted tree of each anchor (worktree-local
  `bisect-scratch/`, deleted after the run). 32/32 per-seed files
  valid; 4/4 sweep summaries 8 rows each. Smoke (1 seed) ran clean
  before the full pilot.
- Tool output on the dry-run corpus: **verdict NO-STEP,
  uncontested; governing step 1.000, aggregate step 1.000,
  ratio-of-medians step 1.000, median per-seed step 1.000.**
  M(parent) = M(commit) = 0.526, aggregate 0.435 both anchors,
  ratio-of-medians 0.278 both anchors. Counts: 8 seeds, 0
  exclusions, 1 degenerate per-seed step (seed 9304, both ratios
  0 — excluded and counted), 7 identical-ratio seeds, 0 moved
  down, 0 moved up.
- Cross-check: all 16 anchor-pair per-seed files are identical
  except the `anchorCommit` tag (verified field-by-field). The
  null pair really is null, and the tool correctly reads it as
  such instead of hallucinating a step from tag differences.
- This dry-run verdict says NOTHING about the rot question and
  must never be quoted as one: the rot question already has its
  deciding verdict in sim-leg2decide-b.md, and a null pair on
  tooling-only commits cannot confirm or refute it.

### Per-seed dry-run distribution (the sense evidence)

Seed | r(parent) | r(commit) | per-seed step | reading
9300 | 0.427 | 0.427 | 1.000 | identical
9301 | 0.594 | 0.594 | 1.000 | identical
9302 | 1.736 | 1.736 | 1.000 | identical
9303 | 0.458 | 0.458 | 1.000 | identical
9304 | 0.000 | 0.000 | n/a (degenerate) | pd1 rot 0 on both anchors; excluded, counted
9305 | 1.372 | 1.372 | 1.000 | identical
9306 | 0.018 | 0.018 | 1.000 | identical
9307 | 0.743 | 0.743 | 1.000 | identical

Sense reading: the distribution is a flat line — no concentration,
no breadth, no movement of any kind. That is exactly what a null
pair should look like, and the tool's NO-STEP (uncontested) label
matches the picture a reader sees, not just the number. Contrast
with C6/C1, where the same label machinery correctly refuses a
clean label when the distribution is concentrated or disputed.

### Wall numbers (from the dry-run corpus only)

- Configs 32, national 30/32 (94%), table 0/32, wins 0/32.
- Max wave: wave 4 in 22 configs, wave 3 max in 8, wave 2 max in 2;
  no config reached wave 5.
- Median daysAlive 100 (the 100d horizon cap; the smoke seed 9300
  pd0 on HEAD ended at 91d village-lost — the horizon is
  death-aware, not a fixed run length).
- No win flag, no table reach in this dry-run corpus — expected:
  this is a null-pair tooling dry-run on a pre-seat substrate
  (SEATDRIVE=0), not a win-seeking run, and it does not move the
  scale-wall numbers by itself.

### Village assessment (in plain words)

The dry-run villages looked like ordinary mid-game villages on a
100-day clock: almost all of them reached national standing, none
reached the galactic table, none won, and none got past wave 4.
That is the familiar scale wall in miniature — villages survive
and climb to national, then stop. Because the two anchors in this
pair change no game code at all, every village on both sides lived
the exact same life, down to the last rotten calorie; the tool
reading that as "no step" is the tool doing its job, not the game
standing still. The one seed worth noticing is 9304, where no
food rotted on either side of the plenty-depri contrast at all —
a village that either preserved everything or had nothing to rot,
which the tool correctly refuses to turn into a step number.

### Balanced panel (§15)

Panel inapplicable: measurement tooling, not a before/after lever
landing; the panel driver cannot run env-gated cross-tree anchor
sweeps (documented #797 invalidity). The verdict is judged on the
tool's proof tests (55/55) plus the dry-run corpus rows (§15
fallback, as in leg2drift/leg2decide).

## Blanks filled / documented

- FILLED (tooling): the 2130Z open item is closed — the next
  deciding run now has ONE pre-registered governing verdict system
  with a hierarchy, a CONTESTED rule, and five tie-breaks, proven
  on 12 calibration cases and a live 32-config dry-run. No future
  run needs to carry two opposite verdicts on one corpus; it
  carries one label, qualified CONTESTED when the summaries
  disagree.
- FILLED (measurement hygiene): the tool rejects two artifact
  classes from the leg2 analyzers by construction — string-sorted
  "sorted" lists (numeric sort enforced and unit-tested) and the
  0.000 imputed step for both-zero seeds (degenerate steps are
  excluded and counted).
- DOCUMENTED (for the next deciding run, not chased here): the
  strict CONTESTED rule means most real corpora will read
  "(CONTESTED)" — that is intended, but the next run's evidence
  should lead with the sensitivity view (concentration vs breadth,
  denominator- vs numerator-driven moves) so a contested label
  still tells Steve what actually happened.
- DOCUMENTED (scope): this arm built no game lever and ran no
  win-seeking sims; the scale-wall numbers above are dry-run
  context only and do not advance national/table/win reach.

## Findings for the coordinator to append to hidden_files/sim-findings.md (NOT appended by this worker)

- [open] 2026-10-24 — governing-verdict system built and proven — scripts/govern-verdict.js returns exactly one verdict (per-seed median step governs; aggregate, ratio-of-medians, median-per-seed-step are diagnostics that qualify via CONTESTED but never overturn); 55/55 proof checks incl. all 12 pre-registered calibration cases and a 32-config null-pair dry-run on current master (NO-STEP, uncontested); next deciding run should pre-register this system (or its successor) before sweeping (sim-governverdict-b).
- [open] 2026-10-24 — strict CONTESTED rule will mark most real corpora contested — any band disagreement across the four summaries contests the verdict by design, so future deciding evidence should lead with the sensitivity view (concentration vs breadth, denominator- vs numerator-driven moves) alongside the label (sim-governverdict-b).
