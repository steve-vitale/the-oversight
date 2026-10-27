# sim-9954perstack-b — PRE-REGISTRATION (written BEFORE any walk run, 2026-10-27)

Run: oversight-flesh-out-loop-b, arm sim-9954perstack-b. DIAG/measurement
ONLY: ZERO src/js changes, no default flips, no game-code lever. This
arm does NOT re-judge the raidcallers GO, the genericremainder
PARTIAL verdict, or the 9954trace PARTIAL verdict — their verdicts
stand in their own evidence. Its verdict is ONLY whether the single
pilot row below is closed, narrowed, or left standing by an
iteration-level per-stack walk, judged ONLY against this prereg.
No verdict is claimed before the replay + walk scripts run.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-9954trace-b.md + prereg (committed as
  40e88fa78 / 4ae73e39c in this lineage): pilot seed 9954, generic
  (Foraged food) family-seed row, PARTIAL verdict — day-100 snapshot
  timing EXCLUDED per stack key (window P day-100 start -> snapshot
  moment net 0 exactly across all 38 stack keys; window Q snapshot
  -> post-run fully recorded per key: draws -5,419, stockdoor
  +3,400, inflow +100 post-snapshot). The unexplained floor was
  raised from 300 to +3,700 (analyzer definition) / +3,800
  (correct alignment: snapshot minus flows recorded day < 100;
  the analyzer misattributes the +100 day-100 inflow as
  pre-snapshot). Fresh +5,719 NEW / +3,700 boundary; dried 0.
  Survived day 100, national, wave 4. Faithful 9954-only replay
  reproduces the committed corpus on every shared field. The
  snapshot series is PER-ITERATION, not per-day — day 36 has two
  snapshots — so per-day attribution manufactures phantom leaks.
  The 1230Z round evidence (sim-food-economy-round-1230-b.md)
  carries the next blank verbatim: "(2) iteration-level per-stack
  walk on 9954 only". This arm is that blank, and nothing else.
- evidence/2026-10-27/sim-raidcallers-b.md and
  sim-genericremainder-b.md as needed for the row's provenance.
  Corpus: evidence/2026-10-27/sim-raidcallers-b-corpus/
  raidcallers-b-belongseek-nofeast-s9954.json. 9954trace replay:
  evidence/2026-10-27/sim-9954trace-b-replay/
  9954trace-b-belongseek-nofeast-s9954.json.
- Recorder fidelity warning (from 9954trace prereg, still binding):
  the ledger sweeps' death wrapper SUPPRESSES the original
  Game.registerDeath (records deaths into its own array, never
  calls oDie). Sweep corpora are suppressed-registerDeath
  trajectories, NOT plain-game trajectories. Any recorder that
  wants to reproduce a sweep corpus must replicate the
  suppression verbatim. A plain-mode run diverges and proves
  nothing about the corpus. Changing the registerDeath wrapper
  changes every trajectory and is a coordinator/Steve call, NOT
  this arm's.

## Row to walk (verbatim from sim-9954trace-b.md)

- Pilot seed 9954, generic (Foraged food) family-seed row,
  caller-complete boundary residual +3,700 kcal (1.16% of inflow),
  FAIL. Survived to day 100, national rank, wave 4. Fresh +5,719
  NEW / +3,700 boundary; dried 0. Correct-alignment figure
  +3,800 kcal, stated alongside the analyzer figure, never
  conflated with it: the 100 kcal difference is the day-100
  inflow that the analyzer counts pre-snapshot and that the
  9954trace arm proved post-snapshot (absent at the snapshot
  moment, present post-run).

A positive residual means the closing stock exceeds what the
recorded flows predict: either an unrecorded inflow of that
size, or recorded draws/sweeps/losses overstated by that size,
or a boundary/snapshot timing artifact of that size. The
9954trace arm excluded timing. This arm localizes the remainder
to an iteration and a stack key, or reports that it cannot.

## Method: faithful replay + iteration-level per-stack walk (fixed before judging)

### Step 0 — vendor + fidelity gate (BEFORE any walk is judged)

Re-run seed 9954 ONLY (no new seeds are spent) as a FAITHFUL
sweep replication: scripts/sweep-9954perstack-b.js, vendored
from scripts/sweep-9954trace-b.js with NO capture changes
except ONE added read-only recorder (below). Same policy
(belongseek-nofeast), same env gates (COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off),
same death suppression (the sweep's registerDeath wrapper
copied verbatim, still not delegating to oDie), same
wrapped-policy daily snapshot point. Output directory (NEW,
never overwriting the committed corpora):
evidence/2026-10-27/sim-9954perstack-b-replay/
(file 9954perstack-b-belongseek-nofeast-s9954.json).

The ONE added recorder is READ-ONLY and consumes no RNG. At
every snapshot moment it records, alongside the existing
stack snapshot, the cumulative lengths of every flow array:
inflows, stockdoorRecords, mealDrawRecords, directRecords,
raidRecords, driedEvents, and spoilEvents sweeps. Because
flows are appended in chronological order, the slice of each
array between two consecutive snapshot moments is EXACTLY the
set of flows that fired in that iteration interval — no
record is modified, no capture file is touched, and no
per-record timestamp is needed. The recorder fires at:
  (a) opening: after setupGame, beside the existing
      openingStock snapshot — a full per-stack opening
      snapshot (stackSnap) plus flow counts, so the walk
      starts from a true per-key opening rather than from
      channel totals;
  (b) every wrappedPolicy.daily snapshot moment (lockstep
      with the existing stackDays/spoilDays entries);
  (c) the day-100 start moment (lockstep with the existing
      stackDay100Start, plus its flow counts);
  (d) post-run (lockstep with the existing stackPostRun,
      plus its flow counts).
All pre-existing output fields keep their names and meanings
so the fidelity comparison below is field-for-field. New
fields are named perstackOpening, perstackFlowCounts,
perstackDay100StartCounts, perstackPostRunCounts.

FIDELITY BAR (hard gate): the replay payload must match the
committed raidcallers corpus
(sim-raidcallers-b-corpus/raidcallers-b-belongseek-nofeast-s9954.json)
on EVERY shared field except `ms` and except the new
perstack fields, with the 9954trace stackTop normalization
(truncation window shifted by worktree-name length; compare
normalized strings on their common length, all non-stackTop
raid fields deep-equal). It must ALSO match the committed
9954trace replay on every shared field except `ms` and the
new perstack fields (including stackDays/stackDay100Start/
stackDay100Snap/stackPostRun). The proof script compares
these field by field and reports any mismatch by name.
- If the fidelity gate FAILS: the replay is NOT the corpus
  trajectory. The residual is NOT judged from it; the verdict
  is NO-GO on fidelity grounds, the divergence is reported by
  field, and no walk conclusion is drawn.
- Base-drift note, recorded before the run: current worktree
  HEAD descends from the raidcallers base with only
  trajectory-neutral differences (the 9954trace arm verified
  the same point for its base); expectation is not evidence —
  the fidelity gate above is what proves it.

### Step 1 — reproduction (independent recomputation)

scripts/test-9954perstack-b.js re-derives, from the NEW
replay payload (and cross-checks against the committed
corpus and the 9954trace replay), the genericremainder /
9954trace figures for 9954 by independent recomputation (not
by calling the analyzer's leg function): NEW residual +5,719
(fresh +5,719, dried 0); boundary bridge stock100 +3,400 −
meal100 −5,419 − cc100 0 = −2,019; analyzer boundary residual
+3,700; correct-alignment residual +3,800. If any figure
differs, the walk stops: the row under investigation is not
the row reproduced, and the verdict is NO-GO on reproduction
grounds.

### Step 2 — the walk (scripts/walk-9954perstack-b.js)

Iteration indexing (fixed): iter 0 = opening (perstackOpening
stack snapshot + flow counts). Iter i (1..100) = the snapshot
after wrappedPolicy.daily of loop-day i (lockstep with
stackDays[i-1] / spoilDays[i-1]; scholar day at the snapshot
is recorded but is NOT the index — same-day splits are
separate iterations). Iter 101 = post-run (perstackPostRun
+ counts). Interval i = (snapshot i-1 -> snapshot i) for
i >= 1, plus the post interval (snapshot 100 -> post-run).
The day-100 snapshot moment is the last iter-1..100 snapshot
(scholar day 100); the day-100 start moment (c) sits inside
the interval that ends at that snapshot and is used only to
re-verify the 9954trace window-P/Q split, not as a walk
iteration.

Stack key (fixed, same as 9954trace): (channel, spoilDay,
kcalEach, foodState). Units and kcal tracked per key. Walk
scope: generic family, fresh + dried keys (transforms link
fresh -> dried, so both sides must walk together).

Per interval, from the flow slices (array index ranges from
the perstack flow counts), the walk applies, in this fixed
order of accounting (sums are order-independent except for
the overdraw check, which is reported per door):
  - inflows: stock with kcal > 0, deposit, pantryAdd with
    added == true (same exclusions as the prior arms: stock
    <= 0 excluded, pantryAdd-unadded excluded). Inflow
    records carry NO spoilDay/kcalEach/units, so they enter
    the walk as FAMILY-CHANNEL TOTALS, not as keyed stacks:
    the walk never invents a spoilDay for an inflow.
  - stockdoor: kcal > 0 only (zero-kcal records are
    documented no-stores, not inflow). Same treatment as
    inflows: family-channel total, since the record's
    kcalEach for the created stack is not recorded.
  - meal draws: kinds pantryDraw + drawSpoiled ONLY
    (mealCall records carry NO items — a summary, not a
    door). Items keyed exactly (name, spoilDay, kcalEach,
    foodState) x units, subtracted.
  - direct draws: every directRecords item, keyed exactly,
    subtracted (paths reported per interval).
  - raid takes: every raidRecords item, keyed exactly,
    subtracted (callers reported per interval).
  - transforms: linked driedEvents only; pre key minus
    preKcal/pre-units, post key plus postKcal/post-units.
    Unlinked events listed individually (prior census: 0;
    any unlinked event in a slice is reported, never
    silently dropped).
  - sweeps: spoilEvents sweep removed.pantry.detail entries,
    keyed exactly (channel, spoilDay, kcalEach, foodState),
    subtracted. byChannel totals cross-checked against
    detail sums per sweep.
Predicted-vs-actual per interval: for each generic key,
predicted_k = previous actual_k + keyed net_k for the
interval; the family predicted total = previous actual total
+ keyed net total + inflow total + stockdoor total for the
interval. Two divergences are tracked separately and never
merged:
  (D-key) per-key divergence: actual_k − predicted_k for
      each key, where predicted_k uses keyed flows only
      (inflows/stockdoor NOT allocated to keys). A positive
      D-key on a key means that key gained more than keyed
      flows explain; a negative D-key means it lost more.
  (D-total) family divergence: actual family total −
      predicted family total (keyed + inflow + stockdoor).
      D-total is the walk's running residual: it starts at
      0 at iter 0 and must close at +3,800 (correct
      alignment) at the day-100 snapshot moment if the row
      reproduces.
First-divergence iteration (fixed definition): the smallest
interval i with D-total != 0, reported with the interval's
doors active (every door with at least one record in the
slice), the D-key table for that interval (every key with
D-key != 0, with amount), and whether the divergence
persists, grows, or reverses in later intervals (running
D-total series printed for every interval, not just the
first). A later interval that returns D-total to 0 is a
reversal, reported as such — never netted away silently.
Inflow-keying check (fixed): for any interval with D-key != 0
on a key, the walk reports whether that key's D-key kcal
equals (within ±1) any single inflow or stockdoor record's
kcal in the same interval (then the finding is "inflow
landed on this key but the record carries no spoilDay" —
a keying gap, door named) or matches no record (then the
finding is "unrecorded inflow / overcounted outflow on this
key" — door named only if a door's records cover it).
No key is ever matched to an inflow by assumption: a match
is reported only on an exact kcal equality in the same
interval, and a non-match is reported as a non-match.

Door-family re-verification (fixed, not assumed): every
door family the 9954trace census left open is re-verified
from the slices, not from day totals: stock/deposit/
pantryAdd inflows (counts + kcal per interval, summed to
the census totals), stockdoor give gaps (give sum − kcal
sum per interval, summed to the census gap), meal-draw
contexts (player / villager-home / villager-away / other,
with 'other' max want re-checked against the 1,500 feast
floor), raid records (callers per interval), direct records
(paths per interval). Slice sums must equal the corpus
totals for every door; any shortfall is a walk-instrument
failure, reported as such, and the walk does not proceed
past it.

### Step 3 — mechanism naming rule

A mechanism is named ONLY if its arithmetic closes the row:
mechanism kcal == the residual within ±1 kcal, with the
door, stack key, and iteration (or iteration range, with
the exact first-divergence iteration) listed, and the walk's
predicted-vs-actual remainder after applying it == 0 at the
day-100 snapshot moment. A mechanism that accounts for part
of the residual with door + key + iteration listed is a
named COMPONENT (size C), not a closure — it narrows the
remainder and is reported as such. Re-attributing an
already-excluded door (feast previews, alien raids,
stockdoor carry, cooking bonus, day-100 timing) without NEW
evidence from the walk is NOT a trace — it is reported as
re-scoring, and the row stays unexplained for that door.

## PRE-REGISTERED GO / PARTIAL / NO-GO (verbatim — judge ONLY against this)

- GO iff a single named door + stack key + iteration (or
  iteration range, with the exact first-divergence iteration
  stated) accounts for the FULL +3,700 analyzer residual
  (and the +3,800 correct-alignment figure is stated
  alongside, never conflated) with exact stack identity:
  mechanism kcal == 3,700 within ±1 kcal under analyzer
  accounting, OR mechanism kcal == 3,800 within ±1 kcal
  under correct-alignment accounting with the 100 kcal
  difference explicitly identified as the already-proved
  post-snapshot day-100 inflow definition gap (re-verified
  in this walk's day-100 interval) — in either case the
  walk's predicted-vs-actual remainder after applying the
  mechanism == 0 at the day-100 snapshot moment, the
  fidelity gate (Step 0) and reproduction (Step 1) both
  PASS, and the walk table sums to the residual with no
  remainder. Stated explicitly: the bar is the full 3,700
  (analyzer) / 3,800 (correct alignment), not the 300 floor
  and not the 5,719 NEW value.
- PARTIAL iff the fidelity gate and reproduction both PASS,
  and at least one of:
  (a) fidelity gate + reproduction PASS but no door closes
      (a narrowed floor is reported, not GO): the walk
      localizes the residual to a first-divergence
      iteration (or a bounded iteration range with the
      exact first-divergence iteration) and a stack key (or
      a bounded key set), with the running D-total series
      showing where the residual enters and whether it
      persists, grows, or reverses — but no single door
      accounts for the full residual. The narrowed floor
      (the D-total value at the day-100 snapshot moment,
      3,700 analyzer / 3,800 correct alignment, or the
      tighter bound the walk proves) is reported as a
      floor, never rounded up to GO; or
  (b) a door accounting for PART of the residual with the
      remainder bounded: a named door + key + iteration
      with mechanism kcal C, 0 < C < 3,700 (analyzer) /
      3,800 (correct alignment), ±1 kcal, is identified
      with records/stack keys listed, and the remaining
      unexplained amount (3,700 − C analyzer / 3,800 − C
      correct alignment) is stated as a number with the
      walk's running remainder after applying it.
  PARTIAL is NOT GO: a narrowed bound or a partial door,
  however tight, is not a closure, and it is reported as
  such — never rounded up.
- NO-GO iff the fidelity gate FAILS, or reproduction FAILS,
  or neither (a) nor (b) holds (no first-divergence iteration
  is localized and no partial door is named — e.g. the
  walk's D-total never departs from 0 yet the close still
  shows +3,700/+3,800, which would indict the walk
  instrument itself, or D-total departs with no key or
  door attributable at all). A NO-GO on fidelity/
  reproduction grounds says nothing about the residual
  itself and is reported that way.

## Horizon, policy, seeds (fixed before judging)

- Horizon: 100 days, death-aware. The boundary in question
  is the day-100 snapshot moment (the last iter-1..100
  snapshot, scholar day 100). 9954 survived, so no
  death-day adjustment applies; the walk states this rather
  than assuming it. Post-run (iter 101, scholar day 101)
  is walked as its own interval and must reproduce the
  9954trace window-Q numbers (draws -5,419, stockdoor
  +3,400, inflow +100, fresh generic net -1,919) or the
  walk reports the mismatch.
- Policy: belongseek-nofeast, to match the corpus the
  remainder came from (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off;
  POLICY=belongseek). No change is justified: a different
  policy would be a different trajectory, not a walk of
  this row.
- Seeds: seed 9954 ONLY, re-run as a faithful replay of a
  spent seed. NO new seeds are spent. This arm does NOT
  re-judge the raidcallers GO, the genericremainder PARTIAL,
  or the 9954trace PARTIAL verdicts.
- Base: current worktree HEAD. No pin; the fidelity gate is
  the base check.

## Sense (reported, not judged)

At least one captured line from the 9954 replay around the
first-divergence iteration's scholar days (smokeSayLines /
raidSayLines, the sweep's say recorders) read for meaning —
whether the village's recorded speech around those days is
coherent with the ledger flows — or an explicit statement
that the replay's captured lines do not cover those days.
Sense is reported, not judged, and never substitutes for
arithmetic. If no transcript surfaces from the walk (the say
recorders cover smoke-rack and treeline lines only), that
gap is recorded explicitly, not papered over.

## Metric review (MEASUREMENT.md section 14)

Pre-registered metrics bind this run: the GO / PARTIAL /
NO-GO above is the only verdict. If the ±1 kcal closure bar
proves wrong (e.g. a mechanism closes to within a few kcal
but a unit conversion rounds), that is written under "metric
review" and the row is still reported PARTIAL (at best)
under this prereg, with the near-miss mechanism and its gap
stated — never re-scored mid-run. If the stack-key
definition above proves wrong (e.g. a transform re-keys a
stack so identity matching fails on a legitimate carry, or
an inflow's missing spoilDay makes a legitimate inflow look
unkeyed), that is likewise metric review for the NEXT run,
and the walk reports both the key-matched result and the
family-total result for the row. If the fidelity gate fails,
the metric review records that the replay instrument — not
the residual — is what failed, and proposes the fix for the
NEXT run (e.g. pinning the exact raidcallers base). The
dual-figure (3,700 / 3,800) bar above is itself a metric
clarification carried from the 9954trace arm, not a
mid-run re-score: both figures are judged, separately,
from the start.

## Proof (scripts/test-9954perstack-b.js — new in this arm)

The proof (node, not jest) asserts, from the NEW replay
payload, the committed raidcallers corpus, and the committed
9954trace replay:
  (1) fidelity: every shared field matches except `ms` and
      the new perstack fields (mismatches listed by field
      name; stackTop compared normalized);
  (2) reproduction: NEW +5,719 (fresh +5,719, dried 0) and
      BOUNDARY +3,700 and CORRECT-ALIGNMENT +3,800
      re-derived independently, plus the bridge stock100
      +3,400 − meal100 −5,419 − cc100 0;
  (3) walk: slice sums equal corpus door totals; the
      running D-total series closes at +3,800 at the
      day-100 snapshot moment (correct alignment) and
      +3,700 under analyzer accounting; the first-
      divergence iteration and its D-key table match the
      walk script's output;
  (4) verdict check: the accounted total (sum of named
      mechanisms) == 3,700 within ±1 kcal (analyzer) or
      == 3,800 within ±1 kcal (correct alignment, with
      the 100 gap identified) — else the proof FAILS.
The proof FAILS (nonzero exit) on an unexplained +3,700 /
+3,800 — that failure IS the honest result for a PARTIAL /
NO-GO verdict, and the evidence reports which checks pass
and which fail rather than claiming a green run. The proof
PASSES (exit 0) only when the accounted total matches the
prereg bar, i.e. on a GO verdict.
Proof command (from the worktree root):
  node scripts/test-9954perstack-b.js
Walk command (from the worktree root):
  node scripts/walk-9954perstack-b.js
Sweep command (from the worktree root, env gates asserted
by the script itself):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=belongseek SEEDS=9954 DAYS=100
  node scripts/sweep-9954perstack-b.js
No jest (the proofs are node, not jest). No [needs-eyes]:
this lands a measurement, not a player-visible change.
Vendored script names (fixed): scripts/sweep-9954perstack-b.js,
scripts/walk-9954perstack-b.js, scripts/test-9954perstack-b.js.
Replay/walk output dir (fixed):
evidence/2026-10-27/sim-9954perstack-b-replay/
(walk output: evidence/2026-10-27/sim-9954perstack-b-replay/
9954perstack-b-walk.json, written by the walk script from
the replay payload — the walk itself writes no game state).
