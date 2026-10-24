# sim-leg2decide-b — DECIDING-metric DIAG for the contested leg-2 preserver step

Run: oversight-flesh-out-loop-b-20261024T1830Z, arm sim-leg2decide-b.
Worktree: `~/workspace/worktrees/sim-leg2decide-b`, branch sim-leg2decide-b,
base c70a140cc (includes loop A's just-landed scalemetric DIAG,
evidence/2026-10-24/sim-scalemetric.md — read: it settles the deciding-cost-bar
question for scale arms as median + starvation binding, death counts
diagnostic; that bar is NOT this run's question and is not re-litigated here).

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was written
BEFORE any sim in this run was executed. The verdict section at the end was
appended after the sweep completed and is judged ONLY against the header.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food ladder:
  cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d; smoking
  16 ticks; blind penalties teach once). The preserver-widening commit
  75fdd9258 is canon-adjacent (it widens SPECIALTIES.preserver from ghost
  occupations matching nothing to the real occupation pool) — a hypothesis
  about preservation throughput, not a finding; this DIAG tests it.
- No canon doc covers plentydepri's tradeoff — the tradeoff is a measured
  property of the landed lever, not a designed value (same note as
  sim-pddrift-b / sim-leg2drift-adopt-b).

## The contested question (backlog #908 + #891, NOT re-judged here)

The 1630Z leg-2 bisection (evidence/2026-10-24/sim-leg2drift-adopt-b.md,
run fleshout-loop-b-20261024T1630Z) is CONTESTED and ends DIAG-NO-GO:

- Aggregate sum ratio localizes the OLD rot regime to preserver widening
  75fdd9258 (0.881x -> 0.545x, leadfeast/dg1 reduced contrast, seeds
  9250-9257, 100d death-aware horizons).
- Per-seed-median ratio (the 1630Z secondary, ratio of per-side medians)
  refuses it (1.029x -> 0.979x, NEW -> NEW); 7/12 anchors DISAGREE,
  including the master anchor and the era-NEW reference.
- The 1630Z run's explicit instruction binds this run: pre-register ONE
  deciding metric BEFORE re-running, and do NOT re-judge the 1630Z corpus.
  This run therefore runs a FRESH corpus and judges ONLY that corpus.
  No number in the verdict section below is computed from the 1630Z files.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- Pair under test, ONLY pair: preserver widening, parent ->
  commit = 1f24a4ef04a857d33138fd0845cfa83df688285c ->
  75fdd92587ad9d83bb12f05da535cdfb49255835. No other pair, no era
  anchor, no master anchor is run or judged in this run. (The pair is
  the 1630Z pair-3, derived from sim-leg2drift-adopt-b.md +
  scripts/sweep-leg2drift-b.js + scripts/analyze-leg2drift-b.js.)
- Anchor contrast (identical on both sides of the pair, identical on
  both anchors): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (both asserted FATAL by the driver),
  PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware horizon (dead
  villages stop; +10d tail max), instrument scripts/sweep-leg2drift-b.js
  run from the git-archive-extracted tree of each anchor
  (<worktree>/bisect-scratch/<sha>/ — never /tmp worktrees, never bare
  `git worktree add`, never a checkout of an old commit in the worktree).
- Seeds, FRESH band: 9266-9281 (16 seeds). This band overlaps NEITHER
  the 1630Z corpus seeds (9250-9257) NOR the leg2drift pilot seeds
  (9250-9265 family) — verified by filename search before sweeping.
  Configs: 16 seeds x {pd0, pd1} x {parent, commit} = 64 configs, all
  written to this worktree's evidence/2026-10-24/leg2decide-b-corpus/
  (a NEW corpus dir, never mixed into leg2drift-b-corpus/).
- Pilot gate: the first 8 seeds (9266-9273) run first as a smoke check
  that the instrument runs on the fresh band (files parse, anchor tags
  match, both PD sides present per anchor). The pilot is NOT a verdict:
  the verdict is judged ONLY on the full 16 seeds. A pilot instrument
  failure is a loud failure, not a verdict of any kind.
- DECIDING METRIC (one metric, fixed here): for seed s and anchor A,
  rot100d(A, side, s) = (rotFreshKcal + rotPreservedKcal) / daysAlive
  * 100 from that seed's per-seed file. Per-seed ratio
  r(A, s) = rot100d(A, pd1, s) / rot100d(A, pd0, s) (seeds with a zero
  pd0 rot100d are reported and excluded from the median, with the
  exclusion counted — a zero denominator is an instrument datum, not
  a silent drop). M(A) = median of r(A, s) across the 16 seeds.
  MEDIAN STEP RATIO = M(75fdd9258) / M(1f24a4ef0).
- VERDICT RULE (fixed in advance, no re-scoring, no friendlier band):
  median step ratio < 0.80x = STEP CONFIRMED at preserver;
  >= 0.90x = STEP REFUTED; 0.80-0.90x = INCONCLUSIVE (reported as
  such, not re-judged, not re-run on a friendlier band).
- DIAGNOSTIC ONLY (reported for transparency, can NEVER overturn the
  deciding verdict): the aggregate sum ratio (sum rot / sum daysAlive
  * 100 per side, pd1/pd0) on the same fresh corpus; the adopt-style
  ratio-of-medians (med pd1 rot100d / med pd0 rot100d) per anchor;
  the median of per-seed step ratios (median over s of
  r(commit, s) / r(parent, s)); per-anchor M(A) levels. If any
  diagnostic disagrees with the deciding verdict, the evidence says
  so and the deciding verdict still stands.
- Second deliverable (backlog #909, folded into this arm): fix
  scripts/analyze-leg2drift-b.js so it prints the pre-reg-adjusted
  verdict (median-dispute rule) ALONGSIDE the aggregate-only
  EXONERATED/STEP labels. The adjusted verdict for a pair is:
  DISPUTED when the aggregate and median disagree on family at
  either anchor or on the step direction; otherwise it repeats the
  aggregate label. Proven by scripts/test-leg2decide-b.js feeding
  the analyzer a synthetic disputed case and asserting BOTH labels
  appear (aggregate STEP + adjusted DISPUTED, and aggregate
  EXONERATED + adjusted DISPUTED for the social-style case).
- Balanced panel (§15): this is a measurement DIAG on one pair, not a
  before/after lever landing — no panel compare is built, because the
  panel driver cannot run env-gated cross-tree anchor sweeps (the
  documented #797 "Unmatched flags" invalidity, as in pddrift /
  leg2drift); the verdict is judged on the analyzer's manual paired
  rows (§15 fallback). One line, as required: panel inapplicable.
- DIAG scope: zero src/js game changes. Instruments + analyzer +
  evidence only.

## Method notes (fixed before sweeping)

- Per-seed files are the analyzer's only inputs; sweep summaries are
  not analyzer inputs (same as leg2drift). Corpus completeness is
  asserted by the proof test (64/64 files, anchorCommit tag + seed
  match, both PD sides per anchor per seed).
- SENSE-TESTING LAW, method scope: the evidence MUST show the per-seed
  ratio distribution (every seed's r(parent, s) and r(commit, s),
  sorted, plus quartiles), not just the median number, so a reader
  can SEE the skew the median is guarding against. This is a pure
  measurement arm — per-seed files carry aggregates, not transcripts,
  so no villager dialogue is sampled here (same scope note as
  leg2drift); the distribution table IS the sense evidence for a
  skew question.

## Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- The deciding metric and the aggregate-family system point opposite ways on this corpus (deciding: STEP CONFIRMED; aggregate-family on the same corpus: EXONERATED, undisputed on family — both anchors OLD, 0.489x -> 0.399x). They are different verdict systems, and this run had no pre-registered tie-break between them. PROPOSED FOR THE NEXT RUN: pre-register ONE governing verdict system before sweeping, or a tie-break rule (e.g. deciding metric governs, family label reported as diagnostic only), so a future run never has to carry two opposite verdicts.
- PROPOSED FOR THE NEXT RUN (diagnostic only, never a replacement for the deciding metric): report a sensitivity view that separates denominator-driven moves (commit pd0 rot100d rising) from numerator-driven moves (pd1 rot100d falling), and that flags degenerate zero-zero seeds and identical-ratio seeds. On this corpus the median-of-per-seed-steps diagnostic is 1.000x precisely because 9/16 seeds are byte-identical — a sensitivity view would have shown that concentration up front.
- DISPLAY BUG NOTED, NOT CHANGED (proof passed, so per the adoption brief the analyzer was left as delivered): scripts/analyze-leg2decide-b.js prints its "sorted" ratio lists with a default string sort, so 14.960 appears before 2.977 in its output. Its medians and quartiles are computed with a numeric sort and were independently recomputed from the raw per-seed files to identical values, so the verdict is unaffected. PROPOSED: fix the display sort comparator on the next analyzer touch.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the fresh 9266-9281 corpus)

### Adoption fill (this run, 2026-10-24 ~21:30Z loop-B adoption)

The 1830Z run died with 17 of 64 corpus cells 0-byte (container write-block artifacts, 19:01Z): parent pd1 s9281 and commit pd0+pd1 s9274-s9281. This adoption run filled ONLY those 17 cells with the same instrument (scripts/sweep-leg2drift-b.js from the bisect-scratch anchor extracts, same env: leadfeast/dg1, FEASTSCALE_R13=1, SEATDRIVE=0, 100d), via leg2decide-capture4.sh (fresh session, probe OK, every cell landed on writer attempt 1). No valid file was overwritten (skip-valid check on every cell). Corpus now 64/64 per-seed files, all parsing, all anchorCommit tags + seeds matching. Analyzer exits 0; proof test 19/19 (see below).

### DECIDING VERDICT (pre-registered bands, judged ONLY on the fresh 9266-9281 corpus)

- M(parent) = 0.487x | M(commit) = 0.196x | MEDIAN STEP RATIO = 0.404x
- 0.404x < 0.80x, so the verdict is: **STEP CONFIRMED at preserver widening (75fdd9258)**.
- Zero-pd0 exclusions: NONE. All 16 seeds enter both medians (no seed had a zero pd0 rot100d denominator).
- Independent recomputation from the raw per-seed files (separate script, not the analyzer) reproduces M(parent) = 0.487, M(commit) = 0.196, step = 0.404 to three decimals.

### DIAGNOSTICS — stated plainly, they disagree, and they do NOT overturn the verdict

- Aggregate sum ratio: parent 0.489x (pd0 100201, pd1 48986) -> commit 0.399x (pd0 123376, pd1 49249); aggregate step 0.817x. On the deciding bands 0.817x would be INCONCLUSIVE, not CONFIRMED — it disagrees with the deciding verdict.
- Ratio-of-medians (1630Z secondary style): parent 0.257x -> commit 0.225x; step 0.876x. Also INCONCLUSIVE on the deciding bands — disagrees with the deciding verdict.
- Median of per-seed step ratios: 1.000x. No step at all by that measure — disagrees outright with the deciding verdict.
- Drift-analyzer family system on this same corpus (scripts/analyze-leg2drift-b.js, #909 labels): preserver pair 0.489x (OLD) -> 0.399x (OLD) : EXONERATED | pre-reg-adjusted: EXONERATED (undisputed on family). That system answers a different question (family classification) and its EXONERATED label is NOT the deciding verdict; the deciding verdict above stands per the binding pre-registration.
- The deciding verdict stands as STEP CONFIRMED. The disagreement is the finding: the median-step rule and every other summary disagree on this corpus, which is why the metric-review section above proposes a single governing system for the next run.

### Per-seed ratio distribution (the sense evidence — every seed, sorted numerically)

Seed | r(parent) | r(commit) | per-seed step | reading
9266 | 1.258 | 0.069 | 0.055 | moved down sharply (pd1 rot100d 7303 -> 400, pd0 unchanged)
9267 | 0.020 | 0.020 | 1.000 | identical
9268 | 0.000 | 0.000 | n/a* | degenerate: pd1 rot = 0 on BOTH anchors (pd0 rot nonzero); analyzer prints step 0.000, which is an artifact of its rp=0 fallback, not a measured step
9269 | 0.062 | 0.028 | 0.450 | moved down (pd1 rot100d 9162 -> 4120)
9270 | 1.427 | 1.427 | 1.000 | identical
9271 | 2.977 | 2.977 | 1.000 | identical
9272 | 0.225 | 0.225 | 1.000 | identical
9273 | 0.203 | 0.203 | 1.000 | identical
9274 | 0.738 | 0.190 | 0.257 | moved down, DENOMINATOR-driven (pd0 rot100d 22598 -> 125990; pd1 rot100d also rose 16688 -> 23949)
9275 | 1.053 | 0.378 | 0.359 | moved down, DENOMINATOR-driven (pd0 rot100d 41541 -> 115793; pd1 rot100d identical 43743)
9276 | 1.379 | 1.379 | 1.000 | identical
9277 | 0.370 | 0.112 | 0.302 | moved down, DENOMINATOR-driven (pd0 rot100d 60432 -> 252977; pd1 rot100d also rose 22361 -> 28303)
9278 | 0.175 | 0.175 | 1.000 | identical
9279 | 0.603 | 0.603 | 1.000 | identical
9280 | 14.960 | 14.960 | 1.000 | identical; extreme outlier on both anchors (pd0 rot100d only 1928 vs pd1 28838) — the skew the median guards against
9281 | 0.047 | 0.050 | 1.064 | moved up slightly (pd1 rot100d 22850 -> 24309, pd1 daysAlive 100 -> 94)

Numerically sorted parent ratios: 0.000, 0.020, 0.047, 0.062, 0.175, 0.203, 0.225, 0.370, 0.603, 0.738, 1.053, 1.258, 1.379, 1.427, 2.977, 14.960 (Q1 0.175, median 0.487, Q3 1.379).
Numerically sorted commit ratios: 0.000, 0.020, 0.028, 0.050, 0.069, 0.112, 0.175, 0.190, 0.203, 0.225, 0.378, 0.603, 1.379, 1.427, 2.977, 14.960 (Q1 0.069, median 0.196, Q3 1.379).
Numerically sorted per-seed steps (excluding degenerate 9268): 0.055, 0.257, 0.302, 0.359, 0.450, 1.000 (x9), 1.064 (Q1 0.359, median 1.000, Q3 1.000).

Sense reading: the step is CONCENTRATED, not broad. 9 of 16 seeds have byte-identical ratios (the preserver change had zero effect on those seeds' rot ratios); 5 seeds moved down sharply and 1 moved up slightly. The median moved because the middle of the distribution moved (parent middle pair 0.370/0.603 -> commit 0.190/0.203), not because most seeds moved. Three of the five down-moves are denominator-driven (commit pd0 rot100d far higher), so "the step" here is not a uniform fall in pd1 rot. A reader who only saw "STEP CONFIRMED 0.404x" would over-read it; the distribution above is the honest picture, and the deciding verdict is still STEP CONFIRMED because that is what the pre-registered rule says.

### Wall numbers (from this corpus only)

- Configs 64, national 59/64 (92%), table 0/64, wins 0/64.
- Max wave reach: wave 4 in 37 configs, wave 3 max in 21, wave 2 max in 6; no config reached wave 5.
- Median daysAlive 100 (the 100d horizon cap; 8 configs ended early: parent pd0 s9269 92d, s9273 54d, s9275 73d, s9280 83d; commit pd0 s9269 92d, s9273 54d, s9280 83d; commit pd1 s9281 94d — the paired early endings on both anchors show the horizon is death-aware, not a fixed run length).
- Death-cause shares across the corpus (drift analyzer, report-only): 492 deaths; combat 60.8%, monster 15.9%, starvation 4.7%, ambush 4.3%, sickness 3.9%, contest 2.8%, rest scattered.
- No win flag, no table reach in this DIAG corpus — expected: this is a 100d measurement DIAG on one pair, not a win-seeking run, and it does not move the scale-wall numbers by itself.

### Second deliverable (#909 analyzer labels) + proof

- scripts/analyze-leg2drift-b.js now prints BOTH the aggregate-only label and the pre-reg-adjusted verdict on every pair line (24 insertions, verified diff; no other analyzer logic changed). On this corpus it prints the preserver pair as EXONERATED | pre-reg-adjusted: EXONERATED (see diagnostics note above — different system from the deciding verdict).
- Proof: node scripts/test-leg2decide-b.js => 19 PASS, 0 FAIL (T1 analyzer labels incl. synthetic disputed cases, T2 decide math incl. CONFIRMED/REFUTED/INCONCLUSIVE bands, T3 64/64 corpus completeness + analyzer exit 0 + verdict line, T4 empty-corpus FATAL). Analyzer run on the real corpus exits 0 with the verdict line above.
- Analyzer display note: the analyzer's printed "sorted" lists use a string sort (14.960 listed before 2.977 in its raw output); the sorted lists in this evidence file are numerically sorted, and the medians/quartiles (computed numerically, independently recomputed) are unaffected.

### Balanced panel (§15)

Panel inapplicable: measurement DIAG on one pair; panel driver cannot run env-gated cross-tree anchor sweeps (documented #797 invalidity).
