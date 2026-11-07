# sim-preserverleg2-a — preregistration: the HAUL-THROUGHPUT vs ROT TRADEOFF

Run: oversight-flesh-out-loop, run fleshout-20261107T1205Z, arm
sim-preserverleg2-a, axis food-economy. Worktree
`~/workspace/worktrees/sim-preserverleg2-a`, branch sim-preserverleg2-a.
Master tip at start: 7100412b8 (Loop B's linkdrive GO merge).

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS live in
evidence/2026-11-07/sim-preserverleg2-a.md and are judged ONLY against
this header. Prior runs' numbers quoted in the background section are
quoted, not recomputed and not re-judged.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
  The preserver-widening commit 75fdd9258 widens
  SPECIALTIES.preserver from ghost occupations matching nothing to
  the real occupation pool — a hypothesis about preservation
  throughput, not a finding; this corpus tests one precise
  consequence of it.
- No canon doc covers the tradeoff instrument — stated, not
  invented. The efficiency quantity, the GO bar, and the guards
  below are measured instruments, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- leg2decide (seeds 9266-9281,
  evidence/2026-10-24/sim-leg2decide-b.md): deciding verdict STEP
  CONFIRMED, median step ratio 0.404x.
- rotdecide-govern (seeds 9310-9325,
  evidence/2026-10-24/sim-rotdecide-govern-b.md): governing verdict
  STEP (CONTESTED), governing step 0.645x.
- rotcompanion (evidence/2026-10-25/sim-rotcompanion-b.md, metric
  demonstration, NOT a verdict): the companion metric qualifies
  BOTH standing STEPs as DENOMINATOR-DRIVEN at corpus level
  (median pd1 abs ROSE on commit in both corpora).
- rotdecide2-b (seeds 9500-9515,
  evidence/2026-10-25/sim-rotdecide2-b.md): the last deciding
  corpus on this pair: NO-GO (G1+G2 fail; median abs pd1 rot ROSE
  7,380 -> 9,353, x1.267; genuine down-moves 0). Its verdict
  STANDS and is NOT re-judged here. Its one down-move, seed 9514,
  is now attributable: a FISHING BOOM — the no-depri village hauled
  3.3x more food (64,449 -> 211,791 kcal) and rotted 5.9x more,
  while its cooks were credited more, not less. A glut the village
  could not keep, not a preserve collapse.
- preserveact-b (evidence/2026-10-25/sim-preserveact-b.md):
  preserve-action counts as primary: PILOT NO-GO (pooled
  batches+attempts 113.5 -> 102.0, P1 fail). Its verdict STANDS;
  preserve-action counts are NOT primary here — they are carried
  as diagnostic columns only, exactly as in rotdecide2-b.
- Findings backlog #1048
  (`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`):
  the next arm must pre-register a NEW deciding question —
  haul-throughput vs rot tradeoff, preserve-action counts as
  primary, or a different widening shape — and must NOT re-judge
  these corpora and must NOT re-run the ratio as judge. This run
  takes the FIRST of the three named questions.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### The deciding question (NEW, per #1048)

The HAUL-THROUGHPUT vs ROT TRADEOFF. Does preserver widening let a
village haul MORE food while rotting a SMALLER share of what it
hauls — or does it buy less rot only by hauling less, or haul more
only by rotting more? The rotdecide2 corpus could not answer this:
it carried rot and haul side by side but never combined them into
one tradeoff quantity, so a seed like 9514 (haul up, rot up faster)
and a seed like 9504 (haul down, rot down faster) could not be told
apart as tradeoff outcomes. This corpus combines them.

### Definitions (fixed here, exact — no tolerance band anywhere)

Per cell, anchor A in {parent, commit}, side S in {pd0, pd1}, seed s:

- H(A,S,s) = invHaulKcal — kcal hauled into the home pantry under
  the INVERTED haul predicate (primary haul measure, adopted from
  sim-haulinvert-b: every pantry deposit except the exclusion list
  — System gifts, aid transfers, tribute grain, re-deposits,
  justice payments). The census-predicate haulKcal is carried as a
  CROSS-CHECK only, never averaged with invHaulKcal.
- R(A,S,s) = rotFreshKcal + rotPreservedKcal — total rotted kcal.
- E(A,S,s) = 1 - R/H when H > 0; UNDEFINED when H = 0. "Haul
  efficiency": the share of hauled kcal that did NOT rot. E can go
  NEGATIVE — the pantry also receives non-haul deposits and starting
  stock, so rot can exceed haul — and is reported honestly, never
  clamped. E is defined whenever H > 0. Because the sims are
  deterministic, exact equality is meaningful: "flat" means EXACT
  equality, "rises" / "falls" are exact comparisons.
- abs(A,S,s) = R / daysAlive * 100 — absolute rot per 100
  village-days (rotcompanion convention; daysAlive is the village's
  lived days, NOT the villageDays field). Used by the H3 guard.
- K(A,S,s) = H - R — "kept haul", kcal hauled minus kcal rotted
  (diagnostic).
- Fish split (NEW, diagnostic): fishHaulActions / fishHaulKcal =
  stockPantry deposits named exactly 'Fish catch' (stock path
  only; pieces-path fish, if any, is NOT split out — stated, not
  hidden). Answers the rotdecide2 metric-review proposal to report
  fish as a first-class haul split, so a future fishing-driven
  blowup is visible in the medians, not only in a trace sample.

PRIMARY SIDE: pd1 (the depri side). On the depri side the village
must choose between preserving, eating, and discarding surplus, so
the tradeoff bites there. pd0 is reported as a diagnostic, never a
verdict condition.

MEDIANS: medE medians are over seeds with E defined on BOTH anchors
(paired — the same seed set on both sides of the comparison).
medH medians (invHaulKcal) are over ALL 16 seeds per column (H is
defined whenever the file exists; H = 0 is a defined value).
medAbs medians are over ALL 16 seeds per column (abs is defined for
every cell with daysAlive > 0, rotcompanion convention).

### Per-seed tradeoff class (pd1 side; every seed gets exactly one)

- identical: H and R both exactly equal parent -> commit.
- throughput-win: E rises AND H does not fall (Hc >= Hp, Ec > Ep).
  The village hauled as much or more AND kept a bigger share of it.
- lean-win: E rises AND H falls. A bigger share kept by hauling
  less — efficiency bought by shrinking throughput.
- glut: H rises AND E falls. More hauled, a smaller share kept —
  the rotdecide2 seed-9514 shape.
- collapse: H falls AND E falls.
- flat-efficiency: E exactly equal with H moved. Neither a gain
  nor a loss; counted separately.
- degenerate: E undefined on either anchor (H = 0 on an anchor).
  Counted separately, never folded into any other class.
There is no "ambiguous" class and no seed voids the verdict: the
classes above cover every combination by construction. The classes
are descriptive; the GO rule below is median-based, so no count
can move it except through H2(b).

### VERDICT RULE (binding — ONE governing verdict; judge ONLY against this header)

GOVERN-VERDICT DISCIPLINE (scripts/govern-verdict.js): ONE
pre-registered governing verdict; diagnostics qualify only, never
replace. The governing verdict for THIS corpus is the tradeoff
rule below — NOT the ratio step. The ratio-step computation from
govern-verdict.js is run on THIS fresh corpus only, as a
DIAGNOSTIC (reported with its CONTESTED flag if any); it never
replaces the tradeoff verdict, never re-judges leg2decide,
rotdecide-govern, or rotdecide2, and is never the judge of this
corpus, per #1048.

GO holds if and only if ALL of H1, H2, H3, S1, S2 hold on the full
16-seed corpus:

- H1 (efficiency gain): median haul efficiency on pd1 rises by at
  least 5 percentage points: medE1c >= medE1p + 0.05. (E is a
  share, so the bar is a percentage-POINT difference, not a ratio.
  A gain smaller than 5 points is a wiggle, not an improvement.)
- H2 (throughput, two parts — BOTH must hold): (a) median
  invHaulKcal on pd1 does NOT fall: medH1c >= medH1p. The
  efficiency gain must not be bought by hauling less at the
  typical-seed level. (b) The split agrees: throughput-wins are at
  least as numerous as glut + collapse combined. (Lean-wins and
  flat-efficiency seeds count neither way: a lean-win is not a
  tradeoff failure, but it is not the widening working either.)
- H3 (absolute rot guard): median abs rot on pd1 rises at most
  10%: medAbs1c <= 1.10 * medAbs1p. An efficiency "gain" that
  rides on haul exploding faster than rot while absolute rot still
  blows up is not a win.
- S1 (survival guard): median daysAlive over all cells on commit
  is at least the parent median minus 5 days (per-anchor medians
  over 32 cells each).
- S2 (starvation guard): starvation deaths on commit are at most
  starvation deaths on parent + 5 (corpus totals across all 64
  cells, death-cause key 'starvation').

Otherwise the verdict is NO-GO, with the failed condition(s) named
(H1 / H2 / H3 / S1 / S2). A GO met with a guard breached is NO-GO
(§14: guardrails are metrics too). No re-scoring mid-run, no
friendlier metric, no friendlier band. A miss is NO-GO.

VALIDITY (preconditions, not verdict conditions): 64/64 per-seed
files, all parsing, all anchorCommit tags + seeds + contrast
matching; 16/16 seeds classified; E defined on >= 14/16 seeds per
pd1 column per anchor (paired-defined set >= 14 — if fewer, the
median is too blind to judge); fish fields present (non-null
integers) on every file; preserve fields present on every file;
bucket closure holds (the analyzer FATALs on any break). If
validity fails, there is NO verdict — the run fails loudly as an
instrument failure and does not claim GO or NO-GO.

HAUL / PRESERVE / FISH COLUMNS BESIDE THE TRADEOFF: median
invHaul actions/kcal, fish haul actions/kcal, and preserve totals
per side per anchor are reported beside the efficiency columns,
and the per-seed table carries them for every moved seed. The
preserve columns are DIAGNOSTIC ONLY (preserveact-b's NO-GO
stands; this run does not re-run that question). The fish columns
are DIAGNOSTIC ONLY. Neither can overturn GO/NO-GO.

### Pair, contrast, horizon, seeds

- Pair under test, ONLY pair: preserver widening, parent ->
  commit = 1f24a4ef04a857d33138fd0845cfa83df688285c ->
  75fdd92587ad9d83bb12f05da535cdfb49255835. Same pair as
  leg2decide / rotdecide-govern / rotragged / rotcompanion /
  rotdecide2-b / preserveact-b's historical reference. No other
  pair, no era anchor, no master anchor is run or judged.
- Anchor contrast (identical on both sides of the pair, identical
  on both anchors): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (all asserted FATAL by the
  driver), PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware
  horizon (dead villages stop; +10d tail max) — the rotdecide2
  horizon, matched deliberately so this corpus is comparable to
  the deciding corpora it follows. No header revision to the
  horizon is made after this line.
- Seeds, FRESH band: 96500-96515 (16 seeds). FRESHNESS CHECK (this
  run, before sweeping, per
  ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md):
  - Scope: all 603 dated preregs under evidence/*/sim-*-prereg.md;
    all 4,104 evidence .md files; a filename scan over
    evidence/*/; an exact-token search (word-bounded 96500-96515)
    over ALL evidence files including JSON corpora; plus the
    reserved/used bands named in the task (9266-9281, 9310-9325,
    9400-9407, 94801-94820, 9500-9515, 9600-9615, 96101-96124,
    96001-96008, 9750-9773, 9800-9815, 9201-9215, 99201-99208,
    99101-99108, 99601-99612, 53001-53008, 49001-49040, 48001-48008,
    98000-98099 — none of which is 96500-96515).
  - Result: ZERO hits naming seeds 96500-96515 as a band in any
    prereg, screen, forbidden/contaminated list, or corpus
    filename. The loose substring hits are all other numbers:
    99651-99658 (toggle-rescreen band), 99965-99980 (wildbucket
    confirm band), commit hashes (619652d9c, 7d9652174), line
    numbers (game.js:9127,9652), a decimal (0.9652), a kcal value
    (-965010). The exact-token hits for 96500-96515 anywhere in
    evidence/ are kcal QUANTITIES in unrelated JSON files, not
    seeds: totalInfluxK 96510 (carcasshaul-pilot.json),
    pantry 96505 (journey-deepening-r14-competent-8704.json),
    pantryKcal 96504 (perseed-glutprobe-b/leadfeast.json),
    tributeWaived 96500
    (easingchannels-b-pd1dg1-leadfeast-s9262.json),
    phantomGiveKcal 96508
    (perseed-phantomrerun/leadfeast-armed-s4411.json).
  - Backup slice 96520-96535: also verified fresh in .md
    (zero exact-token hits) and NOT used.
  - Conclusion: band 96500-96515 is FRESH. No collision, no
    backup needed.
- Configs: 16 seeds x {pd0, pd1} x {parent, commit} = 64 configs,
  all written to this worktree's
  evidence/2026-11-07/preserverleg2-a-corpus/ (a NEW corpus dir,
  never mixed into an older corpus).
- File names: preserverleg2-a-<anchor8>-<side>-dg1-leadfeast-s<seed>.json.
  Per-seed files are the analyzer's ONLY inputs; sweep-*.json
  summaries are NOT analyzer inputs.
- Anchor method: the driver (scripts/sweep-preserverleg2-a.js)
  runs from the git-archive-extracted tree of each anchor
  (<worktree>/bisect-scratch/<label>/ — never /tmp worktrees,
  never bare `git worktree add`, never a checkout of an old
  commit in the worktree), exactly as rotdecide2-b did. The driver
  is copied into each extracted tree; the extracted tree's own
  src/js is swept. No src/js file is modified at either anchor:
  all counting is runtime wrappers in the driver (see below).

### Instrument: what is new in this corpus, and what is reused

REUSED VERBATIM from the rotdecide2-b lineage (definitions
unchanged): the inverted haul predicate as PRIMARY haul measure
(census predicate as cross-check); the rotcompanion template
(absolute rot per 100 village-days, daysAlive denominator,
per-seed classification); haul + preserve columns beside rot;
the known anchor limit (Game._haulcount tap absent at both
anchors, so preserveVillagerBatches/Kcal read 0/0 BY
CONSTRUCTION — carried for schema completeness, NEVER read as
"villagers preserved nothing"; the LIVE villager preserve signal
at these anchors is preserveVillagerResolutions via the
creditDeed 'preserving' wrapper; scholar attempts are EXPECTED 0
under leadfeast). Instrument: scripts/sweep-preserverleg2-a.js,
derived verbatim from scripts/sweep-rotdecide2-b.js; analyzer
scripts/analyze-preserverleg2-a.js, derived from
scripts/analyze-rotdecide2-b.js; proof
scripts/test-preserverleg2-a.js, derived from
scripts/test-rotdecide2-b.js.

NEW IN THIS CORPUS (declared deltas, everything else identical):
1. THE TRADEOFF QUANTITY: haul efficiency E = 1 - R/H per cell,
   the per-seed tradeoff classes (identical / throughput-win /
   lean-win / glut / collapse / flat-efficiency / degenerate),
   and the binding H1+H2+H3+S1+S2 verdict rule above. The ratio
   r = abs(pd1)/abs(pd0) is computed ONLY as a diagnostic (the
   govern-verdict.js ratio-step on this fresh corpus); it is never
   the judge.
2. FISH SPLIT: fishHaulActions / fishHaulKcal per cell
   (stockPantry deposits named exactly 'Fish catch', stock path
   only). Diagnostic medians + per-seed column. Trace events
   already name fish deposits; the split makes them visible in
   the medians.
3. GOVERN-INPUT OUTPUT: the analyzer's --govern-out flag writes
   govern-input.json (records {seed, parent: {pd0: {rot, days},
   pd1: {rot, days}}, commit: {...}}) for the ratio diagnostic,
   so scripts/govern-verdict.js can run on this corpus without
   hand-built input. govern-input.json is NOT a per-seed file and
   is never an analyzer input (the loader ignores it, as in
   rotdecide2-b).

### Pilot gate (§9)

- Pilot: the first 8 seeds (96500-96507) run first, all 4 cells
  each (32 configs). The pilot is NOT a verdict: the verdict is
  judged ONLY on the full 16 seeds.
- PILOT PASS BAR (all must hold, else NO confirm spend and the
  run fails loudly as an instrument failure):
  - 32/32 pilot files present, parsing, anchor tags + seeds +
    contrast matching;
  - tradeoff quantities computable for 8/8 pilot seeds (E defined
    on all 32 pilot cells);
  - invHaulActions > 0 on ALL 32 pilot files (haul non-vacuous —
    the haulinvert pilot ranged 81-326 actions/file and
    rotdecide2's pilot was > 0 on all 32 cells, so a zero here
    means the wrapper did not attach);
  - fish fields present (non-null integers) on ALL 32 pilot files;
  - preserve fields present (non-null integers) on ALL 32 pilot
    files (values reported regardless: scholar attempts expected
    0 under leadfeast; villager batches expected 0/0 at anchors
    per the tap limit above; villager resolutions are the live
    signal and are reported as observed, zero or not);
  - 0 unclassified pilot seeds.
- On a pilot pass, run the remaining 8 seeds (96508-96515) to
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
  corpus (the known recorder-row ingestion class, TypeError
  reading 'days'), attach the analyzer's sweep-compare table
  instead and name the failure class. A tooling failure NEVER
  blocks or re-scores the verdict: the verdict is judged on the
  analyzer's paired rows (§15 fallback, as in leg2decide /
  rotragged / rotdecide2-b).
- If compare unexpectedly succeeds, its .md is attached and any
  disagreement with the GO rule is reported, not reconciled by
  re-scoring.

### Sense-testing, wall numbers, villager behavior

- SENSE-TESTING LAW: read per-seed stories for the moved seeds
  — meaning, coherence, consequences, not just counts. The
  per-seed table (efficiency, haul, rot, fish, preserve, depri,
  days, wave, national) IS the sense evidence for moved seeds,
  plus trace samples: after classification, re-run ONE moved seed
  per tradeoff class present with HAULCOUNT_TRACE=1 and quote haul
  / preserve event names from the traces in plain words. Trace
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
  files carry table = win flag (same convention as rotdecide2-b),
  and SEATDRIVE=0 makes the table unreachable by construction —
  table 0 here is a construction fact, not a scale-wall finding,
  and is reported as such.
- VILLAGER-BEHAVIOR SAMPLE: death-cause spread across the
  corpus, national/wave divergence by seed, and the haul/preserve
  event names from the trace samples. Anything robotic, static,
  or repeated is flagged; aggregate divergence tracking the food
  story is reported as people-like, not proven.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection in
  evidence/2026-11-07/sim-preserverleg2-a.md (filled after the
  verdict; the verdict above is NOT re-scored by it).

### Scope

Zero src/js game changes. Instruments + analyzer + proof test +
evidence only. No push, no version bump, no live verification —
ready to merge, pending coordinator landing.
