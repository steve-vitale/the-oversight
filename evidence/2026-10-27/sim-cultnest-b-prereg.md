# sim-cultnest-b — PRE-REGISTRATION (written BEFORE any replay, 2026-10-27)

Run: oversight-flesh-out-loop-b, arm sim-cultnest-b. DIAG/measurement
ONLY: ZERO src/js changes, no default flips, no game-code lever, no
analyzer/ledger code change (the de-duplication rule is DOCUMENTED
here and in the evidence, not landed — landing it is a follow-up arm).
This arm does NOT re-judge the 9954perstack GO, the 9954trace
PARTIAL, or any standing verdict — their verdicts stand in their own
evidence. Its verdict is ONLY the nesting question below, judged
ONLY against this prereg. No verdict is claimed before the replay +
nest proof scripts run.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-9954perstack-b.md (GO, proof 117/117):
  the 9954 generic-remainder row is CLOSED by a single direct
  record, path green_whisper.cultivate, seq 124, day 36, villager
  player, spanning two stack keys: (Foraged food, spoilDay 34,
  200 kcal) 12u/2,400 + (Foraged food, spoilDay 36, 200 kcal)
  7u/1,400 = 3,800 generic (record totalKcal 3,820 including one
  Fish catch unit, 20 kcal, a different family, not counted in
  the generic residual). First-divergence iteration 35 (scholar
  days 34 -> 36), remainder 0 at the day-100 snapshot, all other
  intervals exactly 0. The walk alone proves ONE physical removal
  counted TWICE — once as meal draws, once as the useAbility
  diff — and argues (not proves) the cultivate diff is the
  phantom count: the meal draws are pantryDraw's own returned
  draw lists, and 3,820 is not a multiple of the 200-kcal/bed
  cultivate cost.
- The exact meal draws, from the committed perstack replay
  (evidence/2026-10-27/sim-9954perstack-b-replay/
  9954perstack-b-belongseek-nofeast-s9954.json):
  - pantryDraw seq 466, day 35, vDay 35, context player,
    mealSeq 465 (inside villageMeal), want 2,200, taken 2,200:
    Foraged food 200 kcal spoilDay 34, 11u/2,200.
  - pantryDraw seq 474, day 35, vDay 35, context other,
    mealSeq null (outside any meal context), want 1,468,
    taken 1,620: Foraged food 200 kcal spoilDay 34, 1u/200 +
    Fish catch 20 kcal spoilDay 36, 1u/20 + Foraged food
    200 kcal spoilDay 36, 7u/1,400.
  - Together, key-for-key and unit-for-unit, the cultivate
    record seq 124 (items above). The perstack arm's walk
    slices both draws AND the direct record into the same
    iteration interval (35), so interval co-location is
    already established; what is NOT established is span
    nesting (below).
- evidence/2026-10-27/sim-9954trace-b.md: day-100 timing
  excluded per key; snapshot series is PER-ITERATION, not
  per-day — so this arm judges nesting by monotonic event
  order inside the replay, never by day labels alone.
- Recorder fidelity warning (binding, from the perstack
  prereg): the ledger sweeps' death wrapper SUPPRESSES the
  original Game.registerDeath (records deaths into its own
  array, never calls oDie). Sweep corpora are
  suppressed-registerDeath trajectories, NOT plain-game
  trajectories. Any recorder that wants to reproduce a sweep
  corpus must replicate the suppression verbatim. A plain-mode
  run diverges and proves nothing about the corpus.
- Canon: docs/CANON.md read first; docs/PRESERVATION.md read
  for pantry/spoilage. No docs/ canon doc covers garden
  cultivate itself (CANON.md's manifest lists no garden doc);
  the operative design text is the module header of
  src/js/gardenCultivation.js (owned_magic: cultivation uses
  the holder's own abilities and food; per-bed daily limits)
  plus src/js/abilityActions.js useAbility (single entry
  point: precheck, pay cost, dispatch to impl). Nothing is
  invented from scratch here; the code read below is cited
  by file:line.

## The nesting question (precise)

Do the meal pantryDraw calls seq 466 + 474 (both dated day 35
in the perstack replay) execute INSIDE the useAbility span
whose snapshot-diff produces the cultivate direct record
seq 124 (dated day 36)? "Inside the span" means, in the
instrumented replay's single monotonic event order: the
pantryDraw call's entry event falls strictly between the
cultivate useAbility span's entry event and its exit event,
for the SAME span — the span whose exit creates direct
record seq 124 (identified by directRecords length going
123 -> 124 across that span's exit, and by the span's
ability.action being green_whisper.cultivate).

## The day-35 vs day-36 dating puzzle (stated explicitly)

The direct record is dated day 36 and the meal draws day 35,
yet both sit in walk interval 35 (scholar days 34 -> 36).
Two live hypotheses until the proof lands:
  (H1) SPAN CROSSES A DAY BOUNDARY: the meal draws execute
  inside the cultivate span, and scholar.day advances inside
  that same span (e.g. cultivateGarden's tickAction(16) runs
  batch turns / a day-part advance / endDay, or the wrapped
  save() path advances the clock) AFTER the draws but BEFORE
  the stockdoors wrapper reads dayOf() for the direct record.
  Under H1 the direct record's day-36 date is a post-span
  read, not the span's date, and nesting is TRUE despite the
  day labels differing.
  (H2) TWO SEPARATE REMOVALS: the meal draws execute OUTSIDE
  any cultivate useAbility span, and the cultivate diff
  records a second, separate pantry decrease dated day 36
  (which would require a replenishment mechanism for the
  spoilDay-34/36 stacks between the draws and the diff — a
  mechanism the perstack walk found no trace of: interval
  inflows/stockdoor create spoilDay 37/38/41 only,
  transforms 0, pantry sweeps 0). Under H2 nesting is FALSE
  and the fix target changes (see below), even though the
  row stays closed by the same duplication with remainder 0.
A third outcome, INCONCLUSIVE, is defined below and is not
a fallback for a weak result: it fires only on the stated
instrument failures.

## Method: faithful replay + span-event log (fixed before judging)

### Step 0 — vendor + fidelity gate (BEFORE any nesting is judged)

Re-run seed 9954 ONLY (no new seeds spent) as a FAITHFUL
sweep replication: scripts/sweep-9954cultnest-b.js, vendored
from scripts/sweep-9954perstack-b.js with NO capture changes
except ONE added read-only span logger (below). Same policy
(belongseek-nofeast), same env gates (COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13
off), same death suppression (copied verbatim, still not
delegating to oDie), same wrapped-policy daily snapshot
point. Output directory (NEW, never overwriting committed
corpora): evidence/2026-10-27/sim-9954cultnest-b-replay/
(file 9954cultnest-b-belongseek-nofeast-s9954.json).

The ONE added logger is READ-ONLY and consumes no RNG. It
wraps, AFTER all existing captures are installed (so it sits
OUTSIDE the stockdoors useAbility wrapper and OUTSIDE the
mealdraw pantryDraw wrapper):
  (a) Game.useAbility: on entry, push {evt, kind: spanEnter,
      ability, action, day: scholar.day, depth, directBefore:
      directRecords.length}; on exit, push {evt, kind: spanExit,
      ability, action, day: scholar.day, depth, directAfter:
      directRecords.length, result}. `evt` is a single
      monotonic counter shared by all logged events in this
      logger, incremented per event, so span/draw ordering is
      a total order, not a day-label inference. Depth counts
      re-entrant useAbility spans (cultivate's player path
      calls useAbility once from cultivateGarden, and the
      impl re-enters cultivateGarden with paidPlayerDispatch
      set — NOT a second useAbility span — but depth is
      logged, not assumed).
  (b) Game.pantryDraw: on entry, push {evt, kind: drawEnter,
      day: scholar.day, want, callerStack: top non-logger
      frames}; on exit, push {evt, kind: drawExit, day, taken,
      items: [{name, kcalEach, units, spoilDay}]} snapshotted
      from the returned draw list. The logger delegates with
      identical arguments, `this`, and return value; it writes
      ONLY to its own array (nestEvents, a new payload field).
No existing capture file is touched; no src/js is touched;
no recorder output field is renamed, so the fidelity
comparison below is field-for-field.

FIDELITY BAR (hard gate): the replay payload must match the
committed perstack replay
(evidence/2026-10-27/sim-9954perstack-b-replay/
9954perstack-b-belongseek-nofeast-s9954.json) on EVERY
shared field except `ms` and except the new nestEvents
field, with the 9954trace stackTop normalization (compare
normalized strings on their common length; all non-stackTop
raid fields deep-equal). It must ALSO match the committed
raidcallers corpus on every shared field except `ms`, the
perstack fields, and nestEvents, under the same
normalization. If fidelity fails, NO nesting verdict is
judged — the run is INCONCLUSIVE by instrument failure
(see thresholds).

### Step 1 — reproduction (before judging nesting)

From the NEW replay payload (proof re-derives, not via the
analyzer): direct record seq 124 exists exactly once
run-wide with path green_whisper.cultivate, day 36, items
exactly as in Context above; meal pantryDraw records seq
466 and 474 exist with items exactly as in Context above.
If either identity fails, the verdict is INCONCLUSIVE
(wrong corpus), not NOT-NESTED.

### Step 2 — code read (independent leg)

Read, with file:line citations in the evidence:
  (i) the stockdoors useAbility wrapper
      (scripts/stockdoors-capture-raidcallers.js): pre-snap,
      delegate, post-snap, diffDecreases, recordDecrease —
      and WHEN dayOf() is read (at record time, after the
      delegate returns) vs when the pantry decrease happens
      (anywhere inside the delegate). This leg predicts H1
      is mechanically possible: a day advance inside the
      delegate moves the record's date without moving the
      decrease.
  (ii) Game.useAbility (src/js/abilityActions.js) + the
      cultivate impl (src/js/gardenCultivation.js):
      payActionCost, dispatch, impl re-enters cultivateGarden
      with paidPlayerDispatch, garden work, tickAction(16),
      save() — and whether any step in that chain can call
      pantryDraw (directly, via tickAction batch/part/day
      machinery, or via save), plus the pantryDraw caller
      census (which game functions call pantryDraw at all).
  (iii) Game.tickAction (src/js/game.js): batch turns,
      advancePart, endDay on day-budget exhaustion — the
      concrete day-advance path available inside a span.
If the code read and the replay disagree, the REPLAY
judges (stated now, before either runs): the replay is
ground truth about what executed; the code read explains
or fails to explain it, and a disagreement is reported
LOUDLY as a code-read miss, not smoothed over.

### Step 3 — nesting judgment (from the replay's event order)

Correlate the two meal draws to nestEvents drawEnter/drawExit
pairs by exact (day, want, taken, items key-for-key) match
against mealDrawRecords seq 466 and 474 — both must match
uniquely; a non-unique or missing match is INCONCLUSIVE.
Correlate the cultivate span to direct record seq 124 by
directBefore 123 -> directAfter 124 across its spanExit
(and ability.action green_whisper.cultivate). Then read the
monotonic evt order.

## Pre-registered GO thresholds (judge ONLY these)

- NESTED (GO): fidelity PASS + reproduction PASS + BOTH
  drawEnter events fall strictly between the seq-124
  span's spanEnter evt and spanExit evt (same span, evt
  order), AND the span's exit creates exactly the seq-124
  record (directBefore 123, directAfter 124). The day-35
  vs day-36 labels are then explained as H1 (span crosses
  a day boundary): the evidence must also state the span's
  entry day, the draws' days, and the span's exit day from
  the event log, and name the day-advance step if the
  caller stacks / code read identify one (naming it is
  explanatory, not a threshold — an unnamed boundary
  crossing still counts as NESTED if the evt order holds).
  Fix target under NESTED: the stockdoors useAbility diff
  instrument (directRecords) is the phantom count; the
  de-duplication rule is scoped there (see evidence draft).
- NOT-NESTED (GO, opposite direction, same bar): fidelity
  PASS + reproduction PASS + NEITHER drawEnter falls inside
  the seq-124 span (both draws' evt ranges lie entirely
  outside it — before its spanEnter or after its spanExit),
  with the span's directBefore/directAfter still 123 -> 124
  (so the diff is a real second decrease in span terms, and
  the replenishment question under H2 is reopened as a
  documented follow-up, NOT silently closed). Fix target
  under NOT-NESTED: NOT the useAbility diff instrument
  alone — the evidence must name the alternative target
  (mealDrawRecords as phantom, or a third mechanism) and
  must NOT draft a de-duplication rule for the diff
  instrument.
- INCONCLUSIVE (no GO either way): fidelity FAIL, OR
  reproduction identity FAIL, OR either draw lacks a unique
  nestEvents match, OR the seq-124 span lacks a unique
  directBefore/directAfter 123 -> 124 match, OR exactly ONE
  of the two draws falls inside the span (split nesting —
  a partial overlap is not a verdict; it is a new question
  for a follow-up arm, reported as such), OR the code read
  and replay disagree AND the replay's event log is itself
  internally inconsistent (e.g. spanExit without spanEnter).
  INCONCLUSIVE claims no fix target and drafts no rule.
- PARTIAL is not a verdict in this arm: nesting is binary
  per span (both draws in, or both out). A split result is
  INCONCLUSIVE by the rule above, not PARTIAL.
- The 9954 row's closure is NOT re-judged: under NESTED or
  NOT-NESTED the row stays closed by the perstack GO (same
  duplication, remainder 0); only the fix target moves.
  No threshold in this arm re-scores the row.

## Fix-target settlement (documentation only)

Under NESTED, the evidence drafts the de-duplication rule
in words (no code change): which instrument must
de-duplicate (directRecords, mealDrawRecords, or the
ledger that sums them), the exact scope (ability-span
pantryDraw calls: draws whose drawEnter falls inside a
useAbility span), and the counting rule (a kcal recorded
both as a pantryDraw return list and as a useAbility diff
is counted once, under the meal-draw record, with the diff
record kept but flagged/excluded from summed draws). Under
NOT-NESTED or INCONCLUSIVE, no rule is drafted for the diff
instrument; the evidence states the open target instead.
In all cases: zero analyzer/ledger code changes in this arm.

## Proof (scripts/test-9954cultnest-b.js)

The proof asserts: fidelity (vs perstack replay + vs
raidcallers corpus, with the stackTop normalization);
reproduction (direct 124 unique, meal 466/474 exact);
unique nestEvents correlation for both draws and the
seq-124 span; the evt-order nesting judgment against the
thresholds above; and the code-read citations present in
the evidence (file:line strings asserted as present, not
re-verified by the proof). The proof exits 0 only for a
NESTED or NOT-NESTED verdict (both are GO outcomes in
opposite directions); it exits 1 for INCONCLUSIVE. The
nest analysis script (scripts/nest-9954cultnest-b.js)
prints the span/draw evt table for the evidence. No jest
(proofs are node, not jest). No [needs-eyes]: this lands a
measurement, not a player-visible change. No game-code
change: zero src/js files touched; files in this arm:
prereg, evidence, replay corpus (1 file), sweep script,
nest script, proof script.

## Metric review (carried, not judged here)

- The perstack prereg's "stack key" (singular) wording
  tightened by its own metric review to "exact stack identity
  (key or keys listed)" — adopted here (both keys listed in
  Context).
- Day labels are NOT ordering evidence in this arm: the
  9954trace arm proved the snapshot series is
  per-iteration, and branchDay reads scholar.day at record
  time — a record's day is when it was WRITTEN, not when
  its decrease happened. The prereg's evt-order rule exists
  precisely because day labels cannot settle nesting.
- The perstack direction argument (pantryDraw return lists
  vs inferred diff; 200-kcal/bed vs 3,820 diff) is evidence,
  not proof, and is NOT a threshold here: if the replay
  shows NOT-NESTED, the direction argument is reported as
  wrong, loudly, and the fix target moves — the row's
  closure does not.
- Balanced panel (MEASUREMENT.md §15): NO comparison
  exists — this arm changes no lever and no game code, so
  there is no before/after to panel. The fidelity gate
  (replay vs corpora) is the instrument before/after. Not
  forced, not faked.
