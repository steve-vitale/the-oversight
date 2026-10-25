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

- (to be filled after results)

### Scope

Zero src/js game changes. Instruments + analyzer + proof test +
evidence only. No push, no version bump, no live verification —
merged locally, pending ship, by the coordinator.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the fresh 9500-9515 corpus)

(to be filled after the sweep)
