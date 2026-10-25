# sim-rotdecide2-b — the NEXT DECIDING rot corpus for the preserver-widening pair

Run: oversight-flesh-out-loop-b-20261025T1937Z, arm sim-rotdecide2-b,
axis food-economy (tracker next blank 1). Worktree:
`~/workspace/worktrees/sim-rotdecide2-b`, branch sim-rotdecide2-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end was appended after the sweep completed and is judged ONLY
against the header. Prior runs' numbers quoted in the background
section are quoted, not recomputed and not re-judged.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
  The preserver-widening commit 75fdd9258 widens
  SPECIALTIES.preserver from ghost occupations matching nothing to
  the real occupation pool — a hypothesis about preservation
  throughput, not a finding; this corpus tests it.
- No canon doc covers the rot-ratio instrument — stated, not
  invented. The ratio, the companion metric, and the haul predicate
  below are measured instruments, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- leg2decide (seeds 9266-9281,
  evidence/2026-10-24/sim-leg2decide-b.md): deciding verdict STEP
  CONFIRMED, median step ratio 0.404x (M(parent) 0.487,
  M(commit) 0.196). Distribution note: 9/16 seeds byte-identical,
  5 moved down, 1 moved up slightly; 3 of the 5 down-moves
  denominator-driven.
- rotdecide-govern (seeds 9310-9325,
  evidence/2026-10-24/sim-rotdecide-govern-b.md): governing verdict
  STEP (CONTESTED), governing step 0.645x (M(parent) 0.298,
  M(commit) 0.192). Sensitivity note: 5 identical, 4 down, 3 up,
  2 degenerate.
- rotragged (evidence/2026-10-25/sim-rotragged-b.md, DIAG, not a
  verdict): the step is real but ragged. Primary down-moves split
  into 2 numerator-driven and 3 denominator-driven; cross-check
  adds a 10.6x pd0 blowup (9317) and a "both" seed. Across all 9
  down-moves, pd0 rot rises in 6, stays flat in 3, falls in 0.
  The ratio alone REWARDS a denominator blowup.
- rotcompanion (evidence/2026-10-25/sim-rotcompanion-b.md,
  metric demonstration, NOT a verdict): the companion metric —
  absolute rot per 100 village-days beside the ratio, per-seed
  classification (genuine / denominator-driven / mixed /
  identical / up / degenerate) — qualifies BOTH standing STEPs as
  DENOMINATOR-DRIVEN at corpus level (median pd1 abs ROSE on
  commit in both corpora: primary x1.152, cross-check x1.125).
  The companion qualifies; it does not overturn either verdict.
  Its metric-review also established the gap this corpus closes:
  the per-seed files carried NO haul amounts and NO preservation
  action counts, so a pd0 blowup could not be attributed to
  "hauled far more fresh food" vs "preserved less".
- haulinvert (evidence/2026-10-25/sim-haulinvert-b.md,
  instrument GO): the INVERTED haul predicate — every pantry
  deposit counts as a haul EXCEPT the small stable exclusion list
  (System gifts, aid transfers, tribute grain, re-deposits,
  justice payments; derived from every stockPantry call site) —
  reproduced the census predicate EXACTLY on its pilot
  (delta +0/+0 on all 16 files, seeds 9400-9407). The inversion's
  value is forward-looking: it cannot silently miss the NEXT haul
  name. Its new haul classes (Expedition meat, Buried cache,
  Genesis fruit, custom haulLabels) are CODE-PROVEN, not
  pilot-proven — no pilot event exercised them.
- NEITHER standing verdict is re-judged here. This run is the
  NEXT DECIDING corpus the rotcompanion template was built for:
  fresh seeds, the same pair, the companion metric, PLUS haul
  and preserve action counts beside the rot columns.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Pair, contrast, horizon, seeds

- Pair under test, ONLY pair: preserver widening, parent ->
  commit = 1f24a4ef04a857d33138fd0845cfa83df688285c ->
  75fdd92587ad9d83bb12f05da535cdfb49255835. Same pair as
  leg2decide / rotdecide-govern / rotragged / rotcompanion. No
  other pair, no era anchor, no master anchor is run or judged.
- Anchor contrast (identical on both sides of the pair, identical
  on both anchors): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (all asserted FATAL by the
  driver), PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware
  horizon (dead villages stop; +10d tail max) — the leg2decide
  horizon, matched deliberately so this corpus is comparable to
  the deciding corpora it follows. No header revision to the
  horizon is made after this line.
- Seeds, FRESH band: 9500-9515 (16 seeds). This band overlaps
  NONE of the taken bands — 9266-9281 (leg2decide), 9310-9325
  (govern), 9250-9265 family (leg2drift pilot), 9400-9407
  (haulcount/haulinvert pilots), 73701-73818 (deathext bands) —
  verified by corpus-filename search before sweeping.
  Configs: 16 seeds x {pd0, pd1} x {parent, commit} = 64 configs,
  all written to this worktree's
  evidence/2026-10-25/rotdecide2-b-corpus/ (a NEW corpus dir,
  never mixed into an older corpus).
- File names: rotdecide2-b-<anchor8>-<side>-dg1-leadfeast-s<seed>.json.
  Per-seed files are the analyzer's ONLY inputs; sweep-*.json
  summaries are NOT analyzer inputs.
- Anchor method: the driver (scripts/sweep-rotdecide2-b.js) runs
  from the git-archive-extracted tree of each anchor
  (<worktree>/bisect-scratch/<label>/ — never /tmp worktrees,
  never bare `git worktree add`, never a checkout of an old
  commit in the worktree), exactly as leg2decide did. The driver
  is copied into each extracted tree; the extracted tree's own
  src/js is swept. No src/js file is modified at either anchor:
  all counting is runtime wrappers in the driver (see below).

### Instrument: what is new in this corpus, and why it decides

Three things are new, and all three are required for this corpus
to decide what the old corpora could not:

1. PRIMARY HAUL MEASURE, ADOPTED EXPLICITLY: the INVERTED haul
   predicate from sim-haulinvert-b is the PRIMARY haul measure
   in this corpus. Per-seed haul columns are invHaulActions /
   invHaulKcal (every pantry deposit except the haulinvert
   exclusion list: System gifts, aid transfers, tribute grain,
   re-deposits, justice payments). The census-predicate columns
   (haulActions / haulKcal) are carried alongside as a CROSS-CHECK
   only — they are never the reported haul measure, and a
   disagreement between the predicates is reported, not averaged.
   Buckets close on every file: pantryDeposit = invHaul +
   stockExcluded + piecesHomeExcluded + piecesForeign (actions
   and kcal alike).
2. ROTCOMPANION TEMPLATE, ADOPTED VERBATIM: absolute rot per 100
   village-days (daysAlive denominator, NOT villageDays) +
   per-seed classification (identical / down / up / degenerate,
   with down split genuine / denominator-driven / mixed) +
   numerator- vs denominator-driven attribution for every moved
   seed (see definitions below). Instrument:
   scripts/analyze-rotdecide2-b.js, built on
   scripts/analyze-rotcompanion-b.js with haul/preserve columns
   added (definitions unchanged).
3. HAUL AND PRESERVE ACTION COUNTS BESIDE THE ROT COLUMNS: every
   per-seed file carries invHaulActions/invHaulKcal,
   pantryDepositActions/pantryDepositKcal, preserveAttempts,
   preserveSuccessItems (scholar smoked + rendered units),
   preservePemmicanSets/preservePemmicanBars, and villager
   preserve signals (preserveVillagerResolutions via the
   creditDeed 'preserving' wrapper; preserveVillagerBatches/Kcal
   via the Game._haulcount tap). A future reader can therefore
   see whether villages actually hauled/preserved more, not just
   whether they rotted less.

- KNOWN ANCHOR LIMIT, STATED BEFORE SWEEPING: the Game._haulcount
  tap (cook-duty smoke racks) does NOT exist at either anchor
  (verified: 0 hits in both anchors' src/js/game.js) — it was
  added later by sim-haulcount-b. So preserveVillagerBatches/Kcal
  will read 0/0 at BOTH anchors BY CONSTRUCTION, not by
  measurement. They are carried for schema completeness and are
  NEVER read as "villagers preserved nothing". The LIVE villager
  preserve signal at these anchors is preserveVillagerResolutions
  (creditDeed 'preserving' wrapper — the call site exists at both
  anchors). Scholar preserve verbs are wrapped at runtime
  (preserveFood / renderFat / makePemmican item-state deltas);
  under leadfeast the policy never preserves, so scholar attempts
  are EXPECTED to be 0 — read villager columns alongside, exactly
  as haulinvert requires. If the pilot shows preserve fields
  missing (not merely zero), that is an instrument failure, not a
  finding.

### Metric definitions (fixed here, rotcompanion template verbatim)

Per-seed files carry (same fields as leg2decide, PLUS the haul /
preserve fields above): seed, policy, plentydepri (0 = pd0, the
no-depri side; 1 = pd1, the depri side), depositgate, daysAlive,
villageDays, rotFreshKcal, rotPreservedKcal, depriKcal,
deathCauses, national, table, win, waveReach, anchorCommit.

For anchor A, side S, seed s:

- rot(A, S, s) = rotFreshKcal + rotPreservedKcal (total rotted
  kcal, fresh + preserved combined).
- abs(A, S, s) = rot(A, S, s) / daysAlive * 100 — absolute rot
  per 100 village-days. "Village-days" here means days of village
  life (daysAlive is the village's lived days on that cell), NOT
  the villageDays field: villageDays is a different quantity (the
  sum of villager-days) and is NOT the denominator. This matches
  the rotcompanion convention exactly.
- r(A, s) = abs(A, pd1, s) / abs(A, pd0, s), undefined when
  abs(A, pd0, s) = 0.
- step(s) = r(commit, s) / r(parent, s) when both ratios are
  defined and r(parent, s) != 0.
- Medians: abs medians are over ALL 16 seeds per column (abs is
  defined for every cell with daysAlive > 0, so degenerate seeds
  contribute their real abs values). Ratio medians exclude
  degenerate seeds, per govern-verdict. Ratio medians are
  reported as a reproduction/diagnostic only — the GO rule below
  uses abs medians only, so degenerate handling cannot move it.
- Because the sims are deterministic (prior runs reproduced cells
  byte-identically on re-run), exact equality is meaningful: NO
  tolerance band is used. "Flat" means EXACT equality of the abs
  rate. A daysAlive change parent->commit can move the rate even
  when raw rot is unchanged, so the analyzer flags every
  daysChanged seed, and the evidence reports raw rot alongside
  the rate for every moved seed. Classification is on the RATE,
  never on raw kcal. DAYS-CHANGED RULE (rotcompanion template
  item 6): a rate move on a daysChanged seed whose raw rot did
  NOT move the same way is reported as a LIFESPAN move, not a rot
  move, and does not count toward the split's story — the seed
  keeps its computed class, but the evidence must say so.

### Classification rule (fixed here, applied identically to all 16 seeds)

For one seed, let Np = abs(parent, pd1), Nc = abs(commit, pd1),
Dp = abs(parent, pd0), Dc = abs(commit, pd0).

- degenerate: (a) a ratio undefined on either anchor because
  abs pd0 = 0; OR (b) pd1 rot = 0 on BOTH anchors, so both ratios
  are 0 and carry no step information. Step undefined; counted
  separately, never folded into identical/down/up. The
  degenerate REASON is reported per seed.
- identical: both ratios defined and r(commit, s) ==
  r(parent, s) exactly. Reported with a cells-identical flag (all
  four cells' rot/depri/days/national/wave fields equal
  parent->commit) so ratio-identical-but-moved seeds stay visible.
- up: step > 1, including up-from-zero (r(parent) = 0,
  r(commit) > 0, not degenerate case (b)): step undefined,
  reported as "up from zero", counted as up.
- down (step < 1, including down-to-zero where r(commit) = 0):
  split three ways by the absolute moves:
  - genuine: Nc < Np AND Dc <= Dp. The depri side genuinely
    rotted less, and the no-depri side did not rise to help the
    ratio fall. This is the ONLY down class that counts as an
    improvement.
  - denominator-driven: Dc > Dp AND Nc >= Np. The no-depri
    side rotted more, and the depri side did not fall. The
    ratio fell because the denominator blew up, not because
    the depri side improved.
  - mixed: Nc < Np AND Dc > Dp. Both sides pushed the ratio
    down. Mixed is reported distinctly and NEVER folded into
    genuine (that would credit the blowup) or into
    denominator-driven (that would hide the real pd1 fall).
  - Any other down combination = "ambiguous" with raw numbers,
    never forced. An ambiguous seed voids the verdict (see
    validity below) — it is an instrument defect, not a lever
    outcome.

### VERDICT RULE (binding — judge ONLY against this header)

STRUCTURAL RULE, ENCODED FIRST: a denominator-driven step
(pd0 rot rising while pd1 is flat or falls less) does NOT count
as GO. GO requires a genuine pd1-side absolute-rot improvement
WITH the denominator guard. No re-scoring mid-run, no friendlier
metric, no friendlier band. A miss is NO-GO.

GO holds if and only if ALL of G1, G2, G3 hold on the full
16-seed corpus:

- G1 (genuine pd1 improvement): median abs pd1 FALLS on commit
  by at least 5%: medPd1Commit <= 0.95 * medPd1Parent. (A fall
  smaller than 5% is a wiggle, not an improvement; the prior
  corpora had median pd1 abs RISING — x1.152 primary, x1.125
  cross-check — so G1 is a real bar, not a formality.)
- G2 (split agrees): genuine down-moves are at least as numerous
  as denominator-driven + mixed down-moves combined. (The
  companion GENUINE split condition: the down-moves must be
  predominantly clean improvements, not blowups.)
- G3 (denominator guard): median abs pd0 rises at most 10%:
  medPd0Commit <= 1.10 * medPd0Parent. (The prior corpora's pd0
  medians rose x1.315 and x1.376 — both would FAIL G3 outright.
  A guard failure means the ratio step, whatever it says, was
  carried by the denominator at the typical-seed level.)

Otherwise the verdict is NO-GO, with the failed condition(s)
named (G1 / G2 / G3). The companion verdict word (GENUINE /
DENOMINATOR-DRIVEN / MIXED per rotcompanion, given a governing
STEP) is reported alongside but does NOT override this GO rule:
the GO rule already embeds the companion's logic plus a fall
threshold plus the guard, so the two cannot disagree without the
evidence saying so.

VALIDITY (preconditions, not verdict conditions): 64/64
per-seed files, all parsing, all anchorCommit tags + seeds +
contrast matching; 16/16 seeds classified; 0 ambiguous seeds.
If validity fails, there is NO verdict — the run fails loudly
as an instrument failure and does not claim GO or NO-GO.

HAUL / PRESERVE COLUMNS ARE DIAGNOSTIC ONLY: median invHaul
actions/kcal and preserve totals per side per anchor are
reported beside the rot columns, and the per-seed table carries
them for every moved seed. They can NEVER overturn GO/NO-GO:
a haul/preserve rise does not rescue a failed G1/G2/G3, and a
haul/preserve fall does not veto a passed G1/G2/G3. Their job is
attribution for the NEXT run ("did villages haul/preserve more
where rot moved?"), not adjudication for this one.

### Pilot gate (§9)

- Pilot: the first 8 seeds (9500-9507) run first, all 4 cells
  each (32 configs). The pilot is NOT a verdict: the verdict is
  judged ONLY on the full 16 seeds.
- PILOT PASS BAR (all must hold, else NO confirm spend and the
  run fails loudly as an instrument failure):
  - 32/32 pilot files present, parsing, anchor tags + seeds +
    contrast matching;
  - classifications computable for 8/8 pilot seeds (0 ambiguous);
  - invHaulActions > 0 on ALL 32 pilot files (haul non-vacuous —
    the haulinvert pilot ranged 81-326 actions/file, so a zero
    here means the wrapper did not attach);
  - preserve fields present (non-null integers) on ALL 32 pilot
    files (values reported regardless: scholar attempts expected
    0 under leadfeast; villager batches expected 0/0 at anchors
    per the tap limit above; villager resolutions are the live
    signal and are reported as observed, zero or not).
- On a pilot pass, run the remaining 8 seeds (9508-9515) to
  complete the 64-config corpus. Pilot seeds are NOT re-run for
  the full corpus (deterministic re-runs would reproduce them
  byte-identically); one pilot config is re-run once as a
  determinism spot check and must byte-compare.

### Balanced panel (§15)

- This IS a before/after pair (parent -> commit), so ATTEMPT
  scripts/balance-panel.js compare and attach the compare .md.
- EXPECTED FAILURE CLASS, STATED BEFORE ATTEMPTING: the panel
  compare ingests panel.json.gz cases built by the panel driver
  from sweep-compare policies — NOT env-gated anchor-contrast
  recorder rows. If compare fails on ingesting the recorder
  corpus (the known recorder-row ingestion class), attach the
  analyzer's sweep-compare table instead and name the failure
  class. A tooling failure NEVER blocks or re-scores the verdict:
  the verdict is judged on the analyzer's paired rows (§15
  fallback, as in leg2decide / rotragged).
- If compare unexpectedly succeeds, its .md is attached and any
  disagreement with the GO rule is reported, not reconciled by
  re-scoring.

### Sense-testing, wall numbers, villager behavior

- SENSE-TESTING LAW: read per-seed stories for the moved seeds
  — meaning, coherence, consequences, not just counts. The
  per-seed table (rot, abs, haul, preserve, depri, days, wave,
  national) IS the sense evidence for moved seeds, plus trace
  samples: after classification, re-run ONE genuine seed and ONE
  denominator-driven seed (if both classes exist; otherwise the
  classes that exist) with HAULCOUNT_TRACE=1 and quote haul /
  preserve event names from the traces in plain words. Trace
  re-runs must byte-compare their per-seed files to the corpus
  files (determinism check).
- LIMIT, STATED NOT HIDDEN: per-seed files and traces carry
  aggregates and deposit/preserve EVENTS, not villager dialogue,
  goals, or routines. No claim is made here about dialogue
  quality beyond the event-level behavior the traces show (what
  villagers hauled, what they preserved, what they were credited
  for). A transcript-capture instrument is a separate arm, not
  smuggled into this one.
- WALL NUMBERS on this corpus: national / table / wins, wave
  1-5 reach, median survival (median daysAlive). NOTE: these
  files carry table = win flag (same convention as leg2decide),
  and SEATDRIVE=0 makes the table unreachable by construction —
  table 0 here is a construction fact, not a scale-wall finding,
  and is reported as such.
- VILLAGER-BEHAVIOR SAMPLE: death-cause spread across the
  corpus, national/wave divergence by seed, and the haul/preserve
  event names from the trace samples. Anything robotic, static,
  or repeated is flagged; aggregate divergence tracking the food
  story is reported as people-like, not proven.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below (filled
  after the verdict; the verdict above is NOT re-scored by it).

### Scope

Zero src/js game changes. Instruments + analyzer + proof test +
evidence only. No push, no version bump, no live verification —
merged locally, pending ship, by the coordinator.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the fresh 9500-9515 corpus)

### Corpus completeness

- 64/64 per-seed files (16 seeds x {pd0, pd1} x {parent, commit}),
  all parsing, all anchorCommit tags + seeds + contrast matching.
  Analyzer exits 0; proof test in corpus mode: 33 PASS, 0 FAIL
  (25 synthetic + 8 corpus checks: rows, fatal-empty, counts sum,
  no ambiguous, GO computable, wall configs, haul medians, wrappers
  present on every cell). Pilot mode earlier: 34 PASS (the extra
  check is the pilot invHaul > 0 bar).
- Corpus dir also holds 4 sweep summaries (one per anchor/side),
  8 trace files (seeds 9514 + 9504, all 4 cells each, from
  HAULCOUNT_TRACE=1 re-runs) and 4 trace sweep summaries. Trace
  re-runs' per-seed files byte-compare to the corpus files
  (md5-verified 8/8) — the traces are deterministic re-reads,
  not new runs.
- Validity preconditions all hold: 64/64 files, 16/16 seeds
  classified, 0 ambiguous. There IS a verdict, and it is below.

### DECIDING VERDICT (binding G1+G2+G3, judged ONLY on 9500-9515)

- Median abs pd1: 7,380 -> 9,353 (x1.267 — the typical depri-side
  village rotted MORE on commit, not less).
- Median abs pd0: 33,089 -> 24,264 (x0.733 — the typical no-depri
  village rotted LESS on commit).
- Down-move split: genuine 0, denominator-driven 1, mixed 0.
- G1: FAIL (9,353 > 0.95 x 7,380 = 7,011). G2: FAIL (genuine 0 <
  denominator-driven + mixed = 1). G3: HOLD (24,264 <= 1.10 x
  33,089 = 36,398).
- VERDICT: **NO-GO, failed=G1,G2.** The denominator guard held
  and the split failed cleanly — this is not a borderline call:
  there is not one genuine down-move in the corpus, and the
  typical depri-side village rotted 27% more, not less.
- The structural rule fires on the only down-move: seed 9514's
  step is denominator-driven (below), so it does NOT count as GO
  under any reading of the header.

### Diagnostics (reported, never re-scored)

- Ratio medians (diagnostic only): M(parent) = 0.297,
  M(commit) = 0.171, median step 0.574. The ratio steps DOWN on
  this corpus — and the verdict is still NO-GO, because the GO
  rule judges absolute rot, not the ratio. A reader who only saw
  "ratio 0.574x" would call this a win; the absolutes refuse it.
  That refusal is the instrument working as designed.
- Companion word (governing=STEP supplied, diagnostic only):
  DENOMINATOR-DRIVEN — median pd1 abs rose, same rule as
  rotcompanion, same word as on both prior corpora. It agrees
  with the G1 failure; it does not override the GO rule.
- Ratio medians exclude the 6 degenerate seeds (govern
  convention); abs medians include all 16 seeds per column
  (companion convention). The GO rule uses abs medians only, so
  the heavy degenerate count (6/16) cannot move the verdict —
  but it does blind the ratio diagnostic on more than a third
  of the corpus (see metric review).

### Per-seed classification table — every seed (9500-9515)

r = abs(pd1)/abs(pd0). abs = rot per 100 village-days.
"Cells ident." = all four cells equal parent->commit.

Seed | class | step | r(parent) | r(commit) | pd0 abs p->c | pd1 abs p->c | cells ident. | daysChanged
9500 | identical | 1.000 | 1.261 | 1.261 | 9,921->9,921 | 12,512->12,512 | yes | no
9501 | identical | 1.000 | 0.101 | 0.101 | 34,360->34,360 | 3,462->3,462 | no (depri/haul wiggle only) | no
9502 | identical | 1.000 | 0.297 | 0.297 | 31,817->31,817 | 9,455->9,455 | yes | no
9503 | up mild | 1.212 | 0.627 | 0.759 | 279,175->179,734 | 174,961->136,492 | no | no
9504 | up sharp | 5.664 | 0.042 | 0.237 | 78,748->16,710 | 3,300->3,966 | no | no
9505 | degenerate (undefined-ratio) | n/a | 1.854 | n/a | 24,258->0 | 44,966->39,522 | no | YES (pd0 99->100)
9506 | identical | 1.000 | 0.019 | 0.019 | 94,120->94,120 | 1,751->1,751 | yes | no
9507 | identical | 1.000 | 0.050 | 0.050 | 172,724->172,724 | 8,646->8,646 | yes | no
9508 | degenerate (undefined-ratio) | n/a | n/a | n/a | 0->0 | 0->0 | no | YES (pd0 27->40)
9509 | degenerate (undefined-ratio) | n/a | 16.507 | n/a | 6,413->0 | 105,853->37,011 | no | YES (both sides lived longer)
9510 | degenerate (undefined-ratio) | n/a | n/a | n/a | 0->0 | 2,100->2,100 | yes | no
9511 | up (up-from-zero) | n/a | 0.000 | 0.100 | 17,955->92,839 | 0->9,251 | no | no
9512 | identical | 1.000 | 0.993 | 0.993 | 52,478->52,478 | 52,124->52,124 | yes | no
9513 | degenerate (undefined-ratio) | n/a | 0.090 | n/a | 67,752->0 | 6,113->15,871 | no | YES (pd0 77->39, pd1 100->79)
9514 | denominator-driven sharp | 0.240 | 0.434 | 0.104 | 67,894->402,985 | 29,474->41,924 | no | no
9515 | degenerate (undefined-ratio) | n/a | n/a | n/a | 0->0 | 0->0 | yes | no

Counts: identical 6, up 3 (1 mild, 1 sharp, 1 up-from-zero),
degenerate 6 (all undefined-ratio by the classifier's precedence
— see note), denominator-driven 1, genuine 0, mixed 0.
DEGENERATE NOTE: the classifier checks undefined-ratio before
pd1-zero-both, so seeds 9508 and 9515 (pd1 rot 0 on BOTH anchors
AND pd0 rot 0 on an anchor) are reported as undefined-ratio;
they would also qualify as pd1-zero-both. The reason order is
the rotcompanion code's order, not a new judgment.

### Per-seed HAUL/PRESERVE table — PRIMARY invHaul (every seed)

invHaulKcal pd0 p->c | pd1 p->c ; villager resolutions pd1 p->c ;
depri pd1 p->c. Scholar attempts/successes are 0->0 on every cell
in this corpus (leadfeast never preserves — expected, not a
finding); villager batches are 0->0 on every cell (tap absent at
both anchors — pre-registered, never read as "nothing preserved").

Seed | class | invHaulKcal pd0 | invHaulKcal pd1 | villRes pd1 | depri pd1
9500 | identical | 67,470->67,470 | 107,206->107,206 | 44->44 | 88,696->88,696
9501 | identical | 141,832->141,832 | 113,976->111,827 | 34->31 | 113,429->111,380
9502 | identical | 94,348->94,348 | 105,019->105,019 | 29->29 | 138,900->138,900
9503 | up | 148,252->50,785 | 338,023->291,978 | 40->39 | 411,592->418,565
9504 | up | 213,454->123,318 | 131,371->78,098 | 46->32 | 62,192->105,575
9505 | degenerate | 74,318->61,619 | 56,732->41,883 | 64->56 | 349,646->279,005
9506 | identical | 34,464->34,464 | 80,092->80,092 | 38->38 | 122,894->122,894
9507 | identical | 93,127->93,127 | 74,238->74,238 | 33->33 | 249,863->249,863
9508 | degenerate | 31,717->58,071 | 28,339->28,339 | 0->0 | 43,914->43,914
9509 | degenerate | 97,051->92,428 | 147,055->263,414 | 26->44 | 280,991->233,533
9510 | degenerate | 109,981->109,981 | 145,989->145,989 | 24->24 | 168,100->168,100
9511 | up | 201,318->91,894 | 257,542->97,629 | 24->28 | 2,360->137,762
9512 | identical | 64,828->64,828 | 92,686->92,686 | 45->45 | 357,297->357,297
9513 | degenerate | 52,247->49,513 | 80,041->76,891 | 39->25 | 362,863->197,456
9514 | denominator-driven | 64,449->211,791 | 100,584->111,916 | 41->64 | 371,127->357,905
9515 | degenerate | 187,082->187,082 | 42,122->42,122 | 0->0 | 14,137->14,137

### Haul/preserve medians (diagnostic only — never overturn the verdict)

- PRIMARY invHaul actions: pd0 217->211, pd1 200->200.
  invHaul kcal: pd0 93,738->92,161, pd1 102,802->95,158.
  The typical village hauled slightly LESS on commit, on both
  sides — the corpus-level haul story is flat-to-down, not a
  haul boom. The boom lives in one seed (9514), not the median.
- Census cross-check: census haul medians are IDENTICAL to
  invHaul medians, and census == invHaul on ALL 64 files
  (0 mismatches, actions and kcal). The inversion's delta is
  +0/+0 on this corpus too — same as the haulinvert pilot. The
  code-proven new haul classes (Expedition meat, Buried cache,
  Genesis fruit, custom haulLabels) fired in NO traced event
  (0 predicate disagreements across all 8 traces). They remain
  code-proven, not event-proven.
- Scholar preserve medians: attempts 0->0, success items 0->0
  on both sides (leadfeast policy, expected).
- Villager resolutions medians: pd0 39->35, pd1 36->33 — the
  typical village's cooks were credited slightly FEWER times on
  commit. Villager batches 0->0 (tap absent, pre-registered).
- Bucket closure holds on all 64 files (analyzer FATALs on any
  break; none). Foreign bucket 0 on all 8 traces (no non-home
  pieces deposit fired). Stock-excluded names are the justified
  aid/System names; home-excluded is tribute grain throughout
  (9514 commit pd0 alone: 13 actions / 50,600 kcal of tribute
  grain — the deposit gap on that file is tribute, not aid).

### The attribution answer (what the new columns bought)

The one down-move, 9514, is now attributable instead of merely
classified. The commit's no-depri village hauled 3.3x more food
(64,449 -> 211,791 kcal) and rotted 5.9x more (67,894 -> 402,985
abs; raw fresh rot 65,894 -> 381,553, fresh share 0.97 -> 0.95),
while its depri sibling hauled slightly more (100,584 ->
111,916) and rotted more too (29,474 -> 41,924), and its cooks
were credited MORE on the depri side (41 -> 64 resolutions).
The trace names the surge: Fish catch events on the no-depri
side go 2 -> 118, Snared meat 14 -> 44, while Foraged food falls
153 -> 110. This is a FISHING BOOM the village could not keep:
an enormous fresh catch rotting, not a preserve collapse — the
cooks preserved more, the village hauled far more than it could
keep. That answers rotcompanion's open question for this seed,
on the "hauled far more fresh food" side, with event names.
- The mirror, 9504 (up sharp): the no-depri village's rot
  COLLAPSED (78,748 -> 16,710) while its haul fell (213,454 ->
  123,318) and its cooks were credited less (48 -> 35). The
  ratio "worsened" 5.664x because the no-depri village improved
  dramatically — a good village scored as an up-move. Ratio
  direction is not village welfare, in either direction.
- 9503 (up mild): both sides rotted less (pd0 279,175 ->
  179,734; pd1 174,961 -> 136,492) and hauled less (pd0 148,252
  -> 50,785; pd1 338,023 -> 291,978), but the no-depri side fell
  faster, so the ratio rose. Again: a better village, an "up".
- 9511 (up-from-zero): the parent depri village rotted NOTHING
  while hauling 257,542 kcal and deprioritizing only 2,360 —
  it ate or kept everything it hauled. On commit it hauled far
  less (97,629), deprioritized 137,762, and rotted 9,251, while
  its no-depri sibling's rot exploded (17,955 -> 92,839) and its
  national standing fell true -> false on both sides. The
  parent's zero-rot cell is the corpus's strangest village, and
  it is a parent cell, not a commit effect.
- 9509 (degenerate, hidden improvement): the ratio is undefined
  on commit because the no-depri village's rot hit ZERO (5,579
  -> 0, living 87 -> 100 days) — but the depri village hauled far
  more (147,055 -> 263,414) and rotted far less (105,853 ->
  37,011 abs; raw 95,268 -> 37,011). A genuine depri-side
  improvement sits inside a degenerate seed, invisible to the
  ratio. The abs columns show it; the GO rule's medians already
  count it (it pulls the pd1 median down, not up — and the
  median still rose, which is how decisive the rest of the
  corpus is).
- 9508 / 9515 (zero-rot curiosities): 9508 rotted nothing on any
  of its four cells — villages that died at 26-40 days, before
  food could spoil (hauled 28k-58k, deprioritized 43,914 on the
  depri side). 9515's no-depri village lived all 100 days,
  hauled 187,082 kcal, and rotted nothing on either anchor —
  everything hauled was eaten or kept, with no rot to measure.
  Neither is a capture failure (sibling seeds show large rot
  through the same instrument); both are villages with nothing
  to spoil or nothing left to spoil.
- 9510 (degenerate AND untouched): every cell byte-identical
  parent->commit (pd0: 66 days, 0 rot, 109,981 haul; pd1: 100
  days, 2,100 rot, 145,989 haul) yet classified degenerate
  because pd0 rot is 0 on both anchors. Untouched-ness and
  degenerate-ness are independent properties; this seed is both.

### Wall numbers (from this corpus only)

- Configs 64, national 44/64 (69%), table 0/64, wins 0/64.
  Per side: parent pd0 national 10/16, parent pd1 12/16; commit
  pd0 national 10/16, commit pd1 12/16 — the commit moved NO
  village across the national line in either direction.
- Wave max: wave 4 in 24, wave 3 in 26, wave 2 in 12, wave 1 in 2;
  no config reached wave 5. (Per-cell wave max distribution;
  waveReach lists run 1..max.)
- Median daysAlive 100 (the 100d horizon cap); 18 cells ended
  early: parent pd0 9505 (99d), 9506 (95d), 9508 (27d), 9509
  (87d), 9510 (66d), 9513 (77d); parent pd1 9502 (91d), 9508
  (26d), 9509 (90d), 9515 (23d); commit pd0 9506 (95d), 9508
  (40d), 9510 (66d), 9513 (39d); commit pd1 9502 (91d), 9508
  (26d), 9513 (79d), 9515 (23d). The paired early endings on
  both anchors (9506, 9508, 9510, 9515) show the horizon is
  death-aware, not a fixed run length.
- Death causes, 534 deaths: combat 234 (43.8%), sickness 83
  (15.5%), monster 71 (13.3%), starvation 39 (7.3%), a wound that
  wouldn't close 33 (6.2%), ambush 23, contest 14, dehydration
  13, named monsters and oddities scattered (choir toad 6,
  cliffhanger 2, inspiration 2, a moth the size of a dinner
  plate 2, lockjaw 2, ugly-eyes 2, white noise 1, the loud beast
  1, the understudy 1, alien 3, the eater 1, the landlord 1).
  Table 0 is a construction fact (SEATDRIVE=0), not a
  scale-wall finding — the table is unreachable by design in
  this contrast, exactly as in leg2decide.

### SENSE-TESTING: per-seed stories in plain words

- 9514, the only down-move (denominator-driven). The no-depri
  village on the commit is drowning in fish: 118 fish deposits
  where the parent had 2, 44 snare returns, 279 hauls totalling
  211,791 kcal — and 402,985 kcal of rot, nearly all fresh.
  Its cooks worked (56 resolutions, same as the parent's 58)
  and its depri sibling's cooks worked harder (41 -> 64), but
  no cook crew keeps up with a catch that big. The village
  also lost ground: no-depri wave 4 -> 3, depri wave 4 -> 2,
  while staying national. The ratio calls this a step down;
  the village would call it a glut it could not keep.
- 9504, up sharp (the mirror). The no-depri village on the
  parent rotted 78,748 and never reached national; on the commit
  it rotted 16,710, reached national, and fought to wave 4 —
  hauling less (213,454 -> 123,318) and cooking less (48 -> 35
  resolutions). It got better by handling less food better.
  The ratio calls this 5.664x worse because the denominator
  collapsed. The village disagrees.
- 9511, up-from-zero (the strange parent). The parent depri
  village hauled 257,542 kcal — the largest haul in the corpus
  — rotted nothing, and threw away only 2,360 to depri. It ate
  its mountain. On the commit the same village hauled 97,629,
  threw away 137,762, rotted 9,251, and fell out of national
  standing on both sides while sickness deaths piled up (9 on
  the depri side). Whatever the parent village did with its
  mountain, the commit village does not do it.
- 9500 / 9502 / 9506 / 9507 / 9512, identical (the untouched).
  Five villages where the preserver widening changed literally
  nothing in any of the four cells — same rot, same haul, same
  lifespan, same standing, same waves. Together with 9501's
  ratio-identical-but-wiggled cells, 6 of 16 seeds never felt
  the change. The widening binds rarely, and when it binds it
  binds through fish.
- Villager behavior sample (from fields + traces, not dialogue):
  deaths spread across combat, sickness, monster, starvation,
  wounds, ambush, contest, dehydration, and named monsters in
  both anchors; villages diverge in rank, wave, and lifespan in
  ways that track their food story (9514's glut village loses
  waves; 9504's leaner village gains national). Traces show
  foragers, fishers, snare-keepers, and pit trappers by name
  (Foraged food, Fish catch, Snared meat, Pit meat (Raccoon /
  Virginia Opossum / Wild Boar / White-tailed Deer), Expedition
  haul), homecomings unloading named plants (Blackberry,
  Burdock, Pawpaw, Muscadine Grapes, Spicebush, Staghorn Sumac,
  Wild Strawberry, Wood Sorrel, Wild Onion), aid arriving from
  named villages (Thornfield, Emberhold, The Red Table), and
  tribute grain leaving for named villages (Emberhold,
  Stonebridge, Thornfield, The Red Table, The Hungry Road).
  Nothing reads robotic: the same village fishes, traps, and
  trades differently on the two anchors because its food story
  changed, not because a script repeated. LIMIT RESTATED:
  no dialogue, goals, or routines are captured by this
  instrument — the behavior sample is event-level, and a
  transcript-capture arm remains a separate instrument.

### Balanced panel (§15)

- ATTEMPTED, FAILED IN THE PRE-REGISTERED CLASS: `node
  scripts/balance-panel.js compare --before <parent per-seed
  row> --after <commit per-seed row> --out /tmp/rotdecide2-panel-attempt`
  exits with `TypeError: Cannot read properties of undefined
  (reading 'days')` at `scripts/lib/balance-scorecard.js
  comparePanels` (balance-panel.js:279). The scorer expects
  panel cases (with options/days structure from the panel
  driver); a per-seed recorder row has no such structure, so
  ingestion fails before any comparison is computed. No compare
  .md was produced. FAILURE CLASS: recorder-row ingestion, as
  pre-registered. The analyzer's paired tables in this file ARE
  the attached sweep-compare table (§15 fallback, as in
  leg2decide / rotragged). The tooling failure does not block
  or re-score the verdict: NO-GO stands on the analyzer rows.
- No panel.json.gz exists for either anchor (the panel driver
  runs sweep-compare policies, not the leadfeast/dg1 anchor
  contrast), so a panel compare cannot be built from this
  corpus without running a different experiment. That is a
  scope statement, not a gap to fill mid-run.

### Village assessment, in plain words

The villages in this corpus look like ordinary mid-game villages
on a 100-day clock: most reach national standing, none reach
the table, none win, none get past wave 4 — the familiar scale
wall in miniature, unchanged by the commit (national 10/12 on
both sides, both anchors). What preserver widening changed is
not survival or standing in aggregate but food handling, and it
changed it unevenly: most villages noticed nothing (6 identical,
6 degenerate — the degenerate ones mostly because some village
rotted nothing at all), three villages' ratios rose while their
villages mostly improved, and exactly one village's ratio fell
because its no-depri side drowned in fish it could not keep.
The honest summary is not "villages preserve better now" and
not "villages preserve worse now" but "on fresh seeds, the
preserver widening did not make the typical depri-side village
rot less — it rotted 27% more at the median, with zero clean
improvements — and the one place it moved the ratio down, it
did so by hauling far more fish than the village could keep."
The blank this run filled is the attribution blank rotcompanion
left open: for this corpus's down-move, the cause is haul
surge (fishing), not preserve collapse — proven by haul counts
and event names, not inferred from rot alone.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- THE GO RULE WORKED AS WRITTEN, NO MID-RUN REPAIR. G1, G2, and
  G3 separated cleanly: G3 held (pd0 median fell) while G1 and
  G2 failed outright (pd1 median rose 27%, genuine 0). The rule
  can therefore pass a guard while failing the improvement —
  it is not a single-threshold rubber stamp, and it decided
  this corpus without ambiguity. No threshold was moved, no
  metric re-scored, no band re-cut.
- DEGENERATE-HEAVY CORPORA BLIND THE RATIO (6/16 here, vs 1/16
  primary and 4/16 cross-check before). The ratio diagnostic
  loses more than a third of the corpus whenever a no-depri
  village rots zero — and zero-rot villages are common (short
  lives, eat-everything villages, keep-everything villages).
  PROPOSED FOR THE NEXT RUN: keep the GO rule on abs medians
  (it is immune to this by construction), and pre-register a
  degenerate-handling note for any ratio diagnostic — e.g. a
  minimum non-degenerate seed count below which the ratio
  medians are reported as "not computable at corpus level"
  rather than printed as if they covered the corpus. This run's
  ratio medians (0.297 -> 0.171) cover only the 10
  non-degenerate seeds, and the evidence should have said so
  next to the numbers, not three sections later.
- HAUL COLUMNS EARNED THEIR KEEP; KEEP THEM MANDATORY. The
  9514 attribution (fish boom, not preserve collapse) is
  exactly the question the old corpora could not answer, and
  it came from haul counts + event names, not from rot. A
  future deciding corpus without haul columns would be a
  step backward. PROPOSED: the next rot pre-registration
  should require invHaul medians beside the rot medians as a
  validity condition (like the 64/64 file condition), not as
  an optional diagnostic.
- FISH IS THE SWING HAUL. The largest haul moves in this corpus
  are fishing moves (9514 pd0 Fish catch 2 -> 118 events;
  9504 pd1 Fish catch 102 -> 44). PROPOSED FOR THE NEXT RUN:
  report Fish catch event counts (and, if the instrument can
  carry it, fish kcal) as a first-class haul split, so a future
  fishing-driven blowup is visible in the medians, not only in
  a trace sample.
- VILLAGER BATCHES STAY BLIND AT OLD ANCHORS. Batches read 0/0
  by construction (tap absent at both anchors) — resolutions
  are the live signal, and they moved informatively here
  (9514 pd1 41 -> 64). PROPOSED: a future corpus on anchors
  that POSTDATE the tap should read batches as the primary
  villager signal and resolutions as the cross-check; until
  then, never print batches without the tap-absent caveat.
- SCHOLAR PRESERVE PATH UNTESTED BY THIS CONTRAST. Scholar
  attempts are 0 under leadfeast by policy, so the scholar
  preserve verbs (smoke/render/pemmican item-state deltas)
  were wrapped but never exercised. PROPOSED: a future run
  that wants the scholar path needs a preserving policy, not
  more leadfeast seeds.
- DAYS-CHANGED RULE HELD (9513): a degenerate seed where the
  commit village died much earlier (pd0 77 -> 39 days, pd1 100
  -> 79) with rot moving on lifespan as well as handling. The
  seed kept its computed class with the lifespan note attached,
  per the template — no reclassification, no hidden adjustment.
- WHAT THIS VERDICT DOES NOT DO: it does not overturn
  leg2decide's STEP CONFIRMED (0.404x) or rotdecide-govern's
  STEP (CONTESTED) (0.645x). Those verdicts are ratio verdicts
  on their own corpora, and they stand. What this corpus adds
  is a fresh-seed, abs-judged verdict on the same pair: NO-GO
  (G1+G2 failed). Read together, the three corpora say: the
  ratio steps on old seeds, the companion qualifies those steps
  as denominator-driven, and on fresh seeds the absolute
  improvement is absent. The next run that wants to overturn
  anything must say which verdict system it is overturning,
  on which corpus, before sweeping — not after.

### Proof

- node scripts/test-rotdecide2-b.js => 25 PASS, 0 FAIL
  (synthetic, before the sweep: T1 classification incl. all
  classes and both degenerate reasons, T2 GO rule incl. the
  prior-corpus shape that must NO-GO on all three conditions,
  T3 abs/median/closure arithmetic).
- node scripts/test-rotdecide2-b.js --corpus
  evidence/2026-10-25/rotdecide2-b-corpus --seeds 9500-9507
  --pilot => 34 PASS, 0 FAIL (pilot bar: 32/32 files, tags,
  8/8 classifications, 0 ambiguous, invHaul > 0 on all 32 cells,
  wrappers present).
- node scripts/test-rotdecide2-b.js --corpus
  evidence/2026-10-25/rotdecide2-b-corpus --seeds 9500-9515
  => 33 PASS, 0 FAIL (full corpus: 64/64 files, 16/16 seeds,
  0 ambiguous, GO computable, wall configs, haul medians,
  wrappers present, bucket closure via the loader).
- node scripts/analyze-rotdecide2-b.js --corpus
  evidence/2026-10-25/rotdecide2-b-corpus --seeds 9500-9515
  => exit 0, 16 seeds, GO VERDICT NO-GO failed=G1,G2 (see above).
- Determinism: 8/8 trace re-run per-seed files byte-identical
  to the corpus files (md5-verified); trace totals reproduce
  the per-seed totals exactly (trace files carry the same
  totals block as the per-seed files).
- Node harness: the sweep uses scripts/sim-harness.js
  (loadGame/setupGame/runDays) exactly as leg2drift/haulinvert
  do; Math.random is seeded before eval by the harness. No
  Game.save stub. No jest run (no jest suites touch this
  instrument; the proof test is the designated suite).
- Standing verdicts re-judged: NONE. leg2decide STEP CONFIRMED
  0.404x, rotdecide-govern STEP (CONTESTED) 0.645x, rotcompanion
  DENOMINATOR-DRIVEN qualifiers, haulinvert instrument GO —
  all stand. This corpus's NO-GO is a new verdict on fresh
  seeds under a new (abs-judged) rule, not a re-judgment of any
  of them.

### Scope compliance

Zero src/js game changes. New files only: scripts/sweep-rotdecide2-b.js,
scripts/analyze-rotdecide2-b.js, scripts/test-rotdecide2-b.js,
scripts/sweep-one-rotdecide2-anchor.sh,
scripts/sweep-one-rotdecide2-trace.sh,
evidence/2026-10-25/rotdecide2-b-corpus/ (64 per-seed files,
4 sweep summaries, 8 trace files, 4 trace summaries),
evidence/2026-10-25/sim-rotdecide2-b.md (this file).
Instrument commit 969e97f9e8a403fa2a9e96aa42bda68abd461b22
(pre-registration + instruments, committed BEFORE the sweep).
No push, no version bump, no live verification. Merged locally,
pending ship, by the coordinator.

