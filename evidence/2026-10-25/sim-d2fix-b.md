# sim-d2fix-b — the D2 causal-order metric fix (tooling/measurement only, zero src/js)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T0130Z, arm
sim-d2fix-b, axis food-economy.
Worktree: `~/workspace/worktrees/sim-d2fix-b`, branch sim-d2fix-b.
DIAG/METRIC FIX ONLY — zero src/js changes, no game-code lever, no
re-judgement of the 9754 zero, no rot verdict re-run, no staffing game
code (sibling arm sim-stafffallback-b owns staffing). Loop A trees,
scale-onramp, and every other lane's tree are NOT touched.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any code in this run was changed. The RESULTS section
at the end is appended after the proof test runs and is judged ONLY
against this header.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- No canon doc covers the D2 instrument — stated, not invented. The
  chain below (cook-duty order, reserve rule, racks-full guard) is
  read from the game.js cook-duty smoke-rack branch (the code
  itself), not from canon. Guard semantics verified in code before
  this header: `racksFull = preservedKcal >= rackCap` for the
  resolving cook's own shelf; when it fires, `toPreserve` stays
  empty so n = 0 and no preserving deed is credited — BUT the
  cooking deed is credited unconditionally at the end of the
  resolution. A guard-blocked cook therefore still counts as
  villagerCooking > 0 while batches stay 0. That asymmetry is load-
  bearing for the fixed inhibitor rule below.

## Background (quoted from the 0030Z round, NOT re-judged here)

- sim-onzero9754-b (evidence/2026-10-25/sim-onzero9754-b.md, corpus
  sim-onzero9754-b-corpus/, seed 9754, leadfeast/dg1/100d): OFF
  batches 59/60, resolutions 27/22; ON batches 0/0, resolutions
  0/0. Villager cooking deeds OFF 88/75 -> ON 0/0. Day-1 skilled
  pool OFF 0 -> ON 1 (Rosa Mendez, line cook, skill 0 -> 2, the
  sole day-1 pool change). Eligible days OFF 90/92 -> ON 91/91.
  After-reserve days OFF 61/43 -> ON 50/55. Racks-full skill-0
  days OFF 7/2 -> ON 0/0. Preserved kcal ON = 0 on all 100
  snapshot days, both sides.
- The assign-call second phase proved the mechanism causally: ON
  cook calls 60 (pd0) / 67 (pd1), ALL to Rosa, ALL refused, 0 ok;
  OFF 40 ok / 0 refused (pd0), 38 ok / 25 refused (pd1, all 25
  refusals also Rosa). The staffing pick captures on the single
  highest-preserver free villager with no fallback on refusal.
- D2 AS WRITTEN failed (DIAG NO-GO): its scan found TWO steps
  meeting "ON == 0 both sides, OFF > 0 at least one side" —
  villagerCooking and racksFullSkill0 days — while the header
  required exactly one. The verdict stands as written; this run
  fixes the bar for the NEXT staffing diag, it does not re-score
  the onzero run.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### D2's current assertion (the defective bar, quoted)

D2 (single named step): exactly one decomposition step (1-5: cook
duty runs; preserver pool; eligible pantry; reserve; racks-full
guard) is zero under ON on BOTH sides while non-zero under OFF
on at least one side, at trace/event level: the step's ON count
is 0 and its OFF count is > 0, with the step's own instrument
as proof. Steps zero on both arms, or non-zero on both arms,
cannot be the named step. If two steps both meet this pattern,
D2 FAILS as ambiguous. Implemented in
scripts/test-onzero9754-b.js (the D2 step scan over
villagerCooking, poolSkilled, eligibleDays, afterReserveDays,
racksFullSkill0-3).

### The causal-order defect, in plain words

The old bar treats every step's zero as an independent rival
cause. In a chain, it is not. Two defects, both visible on the
onzero shape:

1. DOWNSTREAM SHADOWS (causal entailment). When the zero sits at
   the top of the chain, every step below it is zero too BY
   ENTAILMENT, not by rivalry. No cook duty resolves -> no
   conversion -> no preserved stock -> the racks-full guard can
   never fire (its condition, preserved stock at/above a
   positive cap, is false on every day). The racks-full zero is
   the cook zero's shadow: it is caused BY the named step, so
   counting it as a second candidate makes D2 unpassable on
   exactly the top-of-chain zeros it most needs to name. The
   same entailment holds inside the pantry leg: no eligible
   pantry -> no after-reserve surplus (after-reserve is computed
   FROM the eligible pile), so an eligible zero entails an
   after-reserve zero.
2. INHIBITOR DIRECTION (reversed). The racks-full guard is an
   inhibitor, not a throughput step. A throughput step causes a
   zero by BEING ABSENT (no cook, no eligible food). An
   inhibitor causes a zero by FIRING (guard shut while a cook
   resolves and surplus waits). Counting raw guard days in the
   throughput direction — "guard days went to zero, so the
   guard is a candidate" — has it backwards: a guard that never
   fires cannot block anything, and its zero is precisely what
   a top-of-chain zero predicts. The guard is a candidate only
   when it fires under ON on days where a cook resolves and
   after-reserve surplus exists, yet nothing is preserved.

The pool is not a throughput step at all: it is a STATE, and the
widening direction is an INCREASE (0 -> 1 skilled). A pool
increase cannot meet a "zero under ON" pattern, and the old
scan already handled it that way; the fix keeps that handling
explicit and reports the pool as a state change, never as a
candidate.

### The fixed assertion (D2 v2 — what the new scanner implements)

Chain order, upstream to downstream (cook-duty order):

- STAFFING/COOK DUTY (throughput): villagerCooking deeds
  (excluding 'player'), from cookingByVid.
- PANTRY PRECONDITIONS (throughput, independent of the cook):
  eligibleDays, then afterReserveDays (after-reserve is
  computed from the eligible pile, so eligible entails
  after-reserve).
- CONVERSION (outcome, not a candidate): batches/resolutions.
  A conversion zero is entailed by any throughput zero above
  it and is never itself named.
- RACKS-FULL GUARD (inhibitor, reversed direction): blocking
  days, computed from raw snapshots — a day counts as blocking
  iff racksFull is true for at least one skill level AND
  afterReserveKcal > 0 AND a cook is staffed that day
  (snapshot cooks non-empty). Labelled LOOSE: the snapshot
  does not carry the staffed cook's skill, so a day where only
  a low-skill cap is exceeded may be counted though a
  high-skill cook would not have been blocked. The candidacy
  conjunction (below) plus the cooking-skill distribution
  bound this risk; the limitation is stated, not hidden.
  Raw racksFullDays per skill are reported for transparency
  but are NEVER candidates.

D2 v2 verdict rules, applied in order:

- T (throughput candidates) = steps among {villagerCooking,
  eligibleDays, afterReserveDays} with ON == 0 on BOTH sides
  AND OFF > 0 on at least one side.
- ENTAILMENT PRUNING: drop any T member entailed by another T
  member. Edges: eligibleDays -> afterReserveDays (no eligible
  pile -> no after-reserve surplus). villagerCooking entails
  conversion and racks-full, neither of which is in T, so it
  prunes nothing in T and is pruned by nothing in T.
  villagerCooking and eligibleDays are causally independent
  (a cook resolution credits cooking whether or not anything
  is preserved; eligible pantry exists whether or not a cook
  is staffed) — if both survive pruning, that is genuine
  ambiguity, not a shadow.
- I (inhibitor candidate) exists iff racksFullBlocking days
  under ON are > 0 on at least one side AND batches == 0 on
  that side AND villagerCooking > 0 on that side (a cook
  resolved, surplus waited, the guard fired, nothing was
  preserved). A blocking count of 0 under ON is the absence
  of inhibition and is never a candidate, whatever the OFF
  blocking count is.
- D2 v2 PASSES iff exactly one of the following holds:
  (a) pruned T has exactly one member and no I exists — name
  that T member; or (b) pruned T is empty and I exists — name
  racksFullBlocking. Otherwise D2 v2 FAILS: no step (empty T,
  no I), or ambiguous (pruned T size > 1, or T non-empty with
  I present — two independent causes, both named, never pick
  the prettier one).
- STEP-1 SUB-PROOF (assign-call instrument, standard for any
  future staffing question): when the named step is
  villagerCooking AND an assign corpus for the same seed /
  contrast / horizon is present, the sub-proof must separate
  "never asked" from "always refused": ON cook calls == 0 ->
  never-asked; ON cook calls > 0 with ok == 0 and refused ==
  calls -> refusal capture (report the target vid(s) and
  share); any other split -> reported as mixed, and the
  sub-proof is marked UNRESOLVED (it does not re-score D2 v2,
  it qualifies how far the mechanism is traced). When no
  assign corpus is present, the sub-proof is N/A, stated as
  such — D2 v2 itself still stands or falls on the scan.

### Calibration cases (all must label as the fixed order dictates)

Real corpus (existing material, no new sweep — see pilot gate):
- R1 (the previously-failing shape): onzero9754 main corpus,
  4 cells. Old scan must still find TWO syntactic zero steps
  (villagerCooking, racksFullSkill0) and FAIL D2 as written;
  new scan must find pruned T = {villagerCooking} only,
  I absent (ON blocking 0/0, ON villagerCooking 0/0), and
  PASS D2 v2 naming villagerCooking. D1 and D3 on the same
  corpus must still PASS exactly as before (no leg weakened).
  Assign sub-proof must read refusal capture: ON 60/67 calls,
  0 ok, all to rosa_mendez.

Synthetic quads (built in the proof test from the same field
shapes as the real corpus, so the scanner, not hand-waving,
labels them):
- S1 guard-blocked: cook resolves (villagerCooking > 0), eligible
  > 0, afterReserve > 0, blocking days ON > 0 with batches 0
  -> D2 v2 PASSES naming racksFullBlocking. (Tests the
  reversed inhibitor direction: the guard is named ONLY when
  it fires.)
- S2 eligible-zero with after-reserve shadow: eligible ON 0/0,
  afterReserve ON 0/0 (entailed), cook resolves, batches 0 ->
  D2 v2 PASSES naming eligibleDays, afterReserveDays reported
  as shadow, not a candidate. (Tests entailment pruning.)
- S3 after-reserve-only zero: eligible > 0 both arms,
  afterReserve ON 0/0, cook resolves, batches 0 -> D2 v2
  PASSES naming afterReserveDays. (Tests that pruning does
  not swallow a genuine reserve swallow.)
- S4 genuinely ambiguous throughput pair: villagerCooking ON
  0/0 AND eligibleDays ON 0/0 (independent causes) -> D2 v2
  FAILS ambiguous, both named. (Tests no-weakening: the fix
  does not force a single answer where two causes exist.)
- S5 throughput + inhibitor both present: eligible ON 0/0
  AND blocking ON > 0 with cook resolving and batches 0 ->
  D2 v2 FAILS ambiguous, both named.
- S6 guard-shadow variant: cook zero, raw racksFullSkill0 days
  OFF > 0 / ON 0 (the onzero shape, restated synthetically),
  blocking ON 0 -> racks-full is NOT named, D2 v2 PASSES
  naming villagerCooking. (Tests that raw guard days alone
  never re-enter as candidates.)
- N1 null-pair dry-run (no change): OFF cells copied as ON
  cells (identical pair, batches > 0) -> T empty (ON == 0
  implies OFF == 0, failing the OFF > 0 leg), I absent
  (batches > 0), verdict NO-STEP / uncontested, NOT a named
  step and NOT a failure. A second null-pair on the ON-shape
  cells (batches 0, cook 0) likewise yields NO-STEP, since
  OFF > 0 fails everywhere.

### Pilot gate

Prove the fix on EXISTING calibration material before any new
sweep: the onzero main + assign corpora already contain the
exact previously-failing shape, and the synthetic quads cover
the shapes the real corpus does not contain (guard-blocked,
eligible-zero, reserve-only, ambiguous pairs). NO new sweep is
run unless a calibration case proves unconstructible from
existing material — in that case, and only then, run 8 seeds
before/after on identical seeds with death-aware horizons,
never a fixed 200d, and judge against this header. No such
case is expected: every synthetic field shape is already
present in the real corpus files.

### GO bar (binding — judge ONLY against this header)

GO holds iff ALL of the following hold:

- G1: every calibration case (R1, S1-S6, N1 both null-pairs)
  labels exactly as its case definition above dictates.
- G2: the previously-failing D2 shape (R1) now PASSES under
  D2 v2 without weakening any other leg: D1 PASS and D3 PASS
  on the same corpus, the old scan still FAILS on the same
  corpus (proving the change is the fix, not a loosened bar),
  and the ambiguous synthetic cases (S4, S5) still FAIL.
- G3: the null-pair dry-run (N1) stays NO-STEP / uncontested.
- G4: the assign-call sub-proof on R1 reads refusal capture
  (ON calls > 0, ok == 0, single target rosa_mendez).

Otherwise the verdict is DIAG-NO-GO with the failed condition
(s) named, the defect documented, and NO weakened bar. A
DIAG-NO-GO here does NOT re-score the onzero run (its verdict
stands as written) and does NOT touch staffing game code.

### Balanced panel (§15)

This is a metric/tooling fix, not a before/after game pair, so
no panel compare is attempted: there is no OFF->ON game pair
to compare, and the panel ingests panel-driver cases, not
recorder corpora (the known recorder-row ingestion class from
the onzero and preserveact runs). The comparison of record is
the old-scan vs new-scan table on the identical corpus in
RESULTS below. A tooling gap never blocks or re-scores the
verdict.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/d2scan-b.js (the fixed D2 v2 scanner, reusable by the
next staffing diag), scripts/test-d2fix-b.js (proof test:
real-corpus scan + old-scan contrast + synthetic calibration
+ null-pair + assign sub-proof),
evidence/2026-10-25/sim-d2fix-b.md (this file). No push, no
version bump, no live verification — ready to land, by the
coordinator; the coordinator merges, never this worker.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus and cases named there)

CORPUS: evidence/2026-10-25/sim-onzero9754-b-corpus/ (main 4 cells +
assign 4 cells, seed 9754, leadfeast/dg1/100d) — EXISTING material
only. NO new sweep was run: every calibration case proved
constructible from existing material, so the pilot-gate contingency
(8 seeds before/after) was not triggered. Synthetic quads are
scanner-logic probes built from the real corpus's field shapes,
not simulated villages; S5's after-reserve value is set
independently of its eligible value to isolate the inhibitor leg,
which is a logic-probe simplification, stated here, not a village
claim.

### The fix, in plain words

D2 used to ask "which steps went to zero?" and got two answers
for one cause, because a zero at the top of the chain drags every
step below it to zero with it. The fix asks the chain in order:
a step only counts if its zero is NOT explained by a zero above
it, and the smoke-rack guard — which stops work by shutting, not
by vanishing — only counts when it is actually shut while a cook
is working and food is waiting. On the 9754 shape that leaves
exactly one answer: no cook ever resolved. The guard's silence is
filed as what it is, a shadow of the missing cook, not a second
suspect.

### Calibration table (proof: scripts/test-d2fix-b.js, 16 PASS / 0 FAIL)

Real corpus, per-cell scan fields (villagerCooking / eligibleDays /
afterReserveDays / batches / resolutions / blockingDays /
racksFullDays):

- OFF pd0: 88 / 90 / 61 / 59 / 27 / 6 / {0: 7}
- OFF pd1: 75 / 92 / 43 / 60 / 22 / 0 / {0: 2}
- ON pd0: 0 / 91 / 50 / 0 / 0 / 0 / {0: 0}
- ON pd1: 0 / 91 / 55 / 0 / 0 / 0 / {0: 0}

Note the OFF pd0 blocking count of 6: on 6 snapshot days the
guard fired for skill 0 while a cook was staffed and surplus
waited — real guard blocking inside a healthy OFF village, which
still preserved 59 batches on other days. Blocking counts are
used ONLY on the ON side for candidacy (see the header), so this
OFF value does not disturb the verdict; it is reported because
it proves the blocking conjunction actually fires on real data
rather than being a vacuous definition.

Case results (each judged against its pre-registered definition):

- R1 (previously-failing shape): old scan FAILS, zero steps
  villagerCooking + racksFullSkill0 (unchanged — the original
  proof scripts/test-onzero9754-b.js re-run here still reports
  12 PASS / 1 FAIL, D1 PASS, D2 FAIL, D3 PASS, so the contrast
  is real and no old file was touched). New scan PASSES naming
  villagerCooking; inhibitor absent (ON blocking 0/0, ON
  villagerCooking 0/0). D1 PASS (OFF 59/60, ON 0/0), D3 PASS
  (all 4 cells). Assign sub-proof: ON pd0 60 calls / 0 ok /
  60 refused, all rosa_mendez; ON pd1 67 / 0 / 67, all
  rosa_mendez — refusal capture, as pre-registered.
- S1 guard-blocked: PASSES naming racksFullBlocking.
- S2 eligible-zero: PASSES naming eligibleDays, afterReserveDays
  reported as shadow (pruned by entailment).
- S3 after-reserve-only: PASSES naming afterReserveDays.
- S4 ambiguous throughput pair: FAILS ambiguous, naming
  villagerCooking + eligibleDays — the fix does not force a
  single answer where two independent causes exist.
- S5 throughput + inhibitor: FAILS ambiguous, naming
  eligibleDays + racksFullBlocking.
- S6 guard-shadow (synthetic restatement of the onzero shape):
  PASSES naming villagerCooking; raw racksFullSkill0 days
  (OFF 7 / ON 0) are ignored as candidates.
- N1 null-pairs (healthy shape, ON shape, and real OFF cells as
  both arms): all three NO-STEP / uncontested.

GO bar, judged case by case: G1 HOLDS (all cases label as
defined); G2 HOLDS (R1 passes under D2 v2, D1 + D3 still pass,
old scan still fails, S4 + S5 still fail); G3 HOLDS (all N1
pairs NO-STEP); G4 HOLDS (assign sub-proof reads refusal
capture, single target rosa_mendez, both sides).

VERDICT: GO. D2 v2 is proven clean on the calibration material
and is ready for the next staffing diag to reuse via
scripts/d2scan-b.js (scanPair) — a future staffing diag should
run the scanner on its own corpus and cite this evidence file
for the bar's definition, not re-derive it.

### Wall numbers

Not a game pair, so no wall numbers are claimed from this run:
the corpus reused here is the onzero corpus, whose wall numbers
(national 4/4, table 0 by SEATDRIVE=0 construction, wins 0,
median survival 100d) are already reported in
evidence/2026-10-25/sim-onzero9754-b.md and are NOT re-judged
here.

### Sense-testing

The 9754 food story reads the same under the fixed bar as it
did under the old one — the only change is which label the
instrument puts on it. No cook resolves, so nothing is smoked,
so the guard never fires: that sentence was true before the
fix and is now also the verdict, instead of a verdict plus a
spurious second suspect. The OFF village's 6 blocking days are
the honest counterpoint: the guard DOES shut sometimes in a
working kitchen, on days a skill-0 cook is staffed and the
racks are full — and the village preserves anyway on other
days. A future guard-blocked zero (cook resolving, batches 0,
blocking days > 0) is now a shape the instrument can name
instead of mistaking for a missing cook.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- LOOSE blocking, stated limit: the snapshot does not carry the
  staffed cook's skill, so a blocking day where only a
  low-skill cap is exceeded may be counted though a
  high-skill cook would not have been blocked. The candidacy
  conjunction (blocking ON > 0 AND batches 0 AND cook
  resolving on that side) bounds this: a village with a
  resolving cook and zero batches has no working cook to be
  misread, and a village with batches > 0 never names the
  guard at all. A future diag that needs skill-exact blocking
  should join snapshot cooks to the snapshot poolList (present
  only on some snapshots in this corpus) or to
  cookingSkillDist — not silently tighten this definition
  mid-run.
- Entailment edges are currently two: eligibleDays ->
  afterReserveDays, and (outside T) villagerCooking ->
  conversion -> preserved stock -> racks-full. If a future
  chain adds a step (e.g. a budget cap inside conversion),
  its entailment edge must be added to d2scan-b.js BEFORE
  that run's sweep, with its own calibration case — the
  scanner's ENTAILS table is the place, and a run that
  discovers a missing edge mid-sweep must report it under
  metric review, not patch it into the verdict.
- The null-pair rule (identical OFF/ON -> NO-STEP) is a
  contrast rule, not a health claim: an ON-shape null-pair
  (batches 0, cook 0 on both arms) is NO-STEP because there
  is no arm difference to attribute, NOT because the village
  is fine. A diag that finds an ON-shape null-pair where it
  expected a contrast has a substrate problem, and should say
  so separately.
- The onzero run's verdict stands as written (DIAG NO-GO on
  D2's letter). This fix does not retroactively pass it; it
  gives the next run a bar that can pass on the same shape.

### Scope / files

Zero src/js game changes in this worktree. New files only:
scripts/d2scan-b.js, scripts/test-d2fix-b.js,
evidence/2026-10-25/sim-d2fix-b.md (this file). No push, no
version bump, no live verification — ready to land, by the
coordinator; the coordinator merges, never this worker.

### Proof tests

- scripts/test-d2fix-b.js: 16 PASS / 0 FAIL, exit 0 (R1 old-scan
  contrast + new scan + D1/D3 + assign sub-proof both sides +
  S1-S6 + N1 three null-pairs).
- scripts/d2scan-b.js (CLI on the real corpus): D2 v2 PASS
  naming villagerCooking; old D2 FAIL (villagerCooking,
  racksFullSkill0) — same numbers as the proof test.
- scripts/test-onzero9754-b.js (unchanged, re-run as regression):
  12 PASS / 1 FAIL, D1 PASS / D2 FAIL / D3 PASS — identical to
  its published result, confirming no old file was touched and
  the contrast is genuine.

