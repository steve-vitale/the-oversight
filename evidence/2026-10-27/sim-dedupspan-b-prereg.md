# sim-dedupspan-b — prereg: ability-span de-duplication rule in the summing ledger

Run: oversight-flesh-out-loop-b, arm sim-dedupspan-b, axis food-economy.
Measurement/instrument arm ONLY. ZERO src/js changes. The rule lives in
ledger/analyzer code (new module `scripts/dedupspan-ledger-b.js`), not in
game code. If the rule could only live in game code, this arm stops and
reports that as a finding instead of changing src/js.

## Background (inputs, not re-judged)

- `sim-cultnest-b.md` (verdict NESTED, stands): meal pantryDraw seq 466 +
  474 execute INSIDE the green_whisper.cultivate useAbility span
  evt 241 -> 246, and direct record seq 124 (day 36, 3,820 kcal) is the
  same removal counted twice. Span entry day 35, span exit day 36: the
  span crosses the day boundary via tickAction -> endDay; the record's
  day-36 date is a post-span read, not the span's date.
- `sim-9954perstack-b.md` (verdict GO, stands): the 9954 generic row is
  closed by that duplication. Correct-alignment residual +3,800 kcal,
  analyzer boundary residual +3,700 kcal — two figures, never conflated;
  the 100 kcal difference is the day-100 inflow the analyzer counts
  pre-snapshot and the 9954trace arm proved post-snapshot.
- Summing site (found, not assumed): `scripts/analyze-raidcallers-b.js`
  `perSeed()` sums, per family, `newDraws` = meal pantryDraw items +
  drawSpoiled items + directRecord items. That sum is where the double
  count lives: the meal draws and the useAbility diff both enter
  `newDraws`. Existing analyzers are LEFT UNTOUCHED in this arm, so
  every published figure stands; the new module is the dedup-aware
  ledger that future ledger runs should use, and it reports its
  adjustment against the old sum instead of silently replacing it.

## Corpus for this arm (stated before any run)

The rule needs span membership, and span membership is NOT recoverable
from day labels (cultnest proved day labels mislead: draws day 35,
record day 36, same span). The bare raidcallers corpus carries no span
log, so it cannot be the rule's input. The rule's input is the 9954
cultnest replay
(`evidence/2026-10-27/sim-9954cultnest-b-replay/9954cultnest-b-belongseek-nofeast-s9954.json`),
which the cultnest arm proved faithful to the raidcallers corpus on
every shared field (97/97 proof) plus the read-only span log
(`nestEvents`, 464 events: 206 drawEnter/drawExit pairs = exactly the
206 pantryDraw records, 26 useAbility spans). "9954 corpus" below means
that faithful 9954 replay. The bare raidcallers corpus is used ONLY for
the no-span-data guard (GO4): with no `nestEvents`, the rule must change
nothing.

## The rule (general, span-keyed, item-matched, record-retaining)

1. Span pairing: walk `nestEvents` in monotonic evt order. Pair
   spanEnter/spanExit on a stack by (ability, action, depth); pair each
   drawEnter with the next drawExit. A draw is span-internal iff its
   drawEnter evt falls strictly between its enclosing span's entry and
   exit evts (innermost open span at drawEnter time). Never by day
   label, never by ability name.
2. Created record: a spanExit with directAfter == directBefore + 1
   created one directRecord. Identify it by seq == directAfter when
   seqs are present (falling back to 1-based ordinal directAfter);
   if seq and ordinal disagree, the span is ambiguous and excludes
   NOTHING (fail-closed).
3. Exclusion: for each span-internal draw, in evt order, match its
   drawExit items against the created record's remaining items on the
   key (name, kcalEach, spoilDay), consuming units up to the remaining
   units for that key. Only matched units are excluded; unmatched
   record items stay counted (they are the ability's own pantry
   effect); unmatched draw items stay counted under the meal draw.
   No amount-matching, ever: a draw is excluded only item-for-item.
   LIMITATION, stated honestly: nest drawExit items carry
   (name, kcalEach, units, spoilDay) only — no foodState, no
   granaryDays — so the match key here is those four fields, not the
   cultnest draft's five-field key. For seq 124 this is exact (all
   its items have foodState null), and the module documents that a
   future span logger should carry foodState to complete the key.
4. Retention + flagging: an excluded-from record is RETAINED in the
   corpus output with summed kcal reduced by exactly the excluded
   amount, flagged `span-duplicate`, with its span identity
   (ability.action, span entry evt, span exit evt) preserved for
   audit. Nothing is deleted from any record list.
5. Meal-draw linkage (audit only, not the exclusion condition): each
   drawExit is linked, in evt order, to the next unmatched pantryDraw
   record with the same (want, taken, items key). Linkage failure
   does not change the exclusion, but it is reported; for 9954 the
   proof asserts all 206 link.
6. No-span-data guard: a payload with no `nestEvents` (or empty)
   yields zero exclusions and byte-identical summed kcal for every
   record. The rule never falls back to day-label matching.

## Pre-registered GO thresholds (judge ONLY against these)

- GO1: seq 124 excluded generic kcal == 3,800 exactly; seq 124 summed
  generic kcal == 0; seq 124 retained and flagged span-duplicate with
  span identity green_whisper.cultivate, enter evt 241, exit evt 246.
  (Total excluded kcal from seq 124, all families, is reported
  alongside: expected 3,820 including the 20 kcal Fish catch unit —
  the judged figure is the generic 3,800.)
- GO2: no other direct record changed: all other 261 direct records
  have excluded kcal == 0 and summed kcal == original totalKcal.
- GO3: deduped correct-alignment generic residual == 0, computed as
  (perstack closed correct-alignment residual 3,800, an input figure,
  NOT re-judged) minus (total excluded generic kcal across all direct
  records). AND the analyzer-style boundary residual shifts by exactly
  minus the total excluded generic kcal (reported via
  `analyze-raidcallers-b.js` `perSeed()` old vs deduped newDraws for
  family 'Foraged food'). The boundary remainder after dedup is
  expected to be -100: that is the already-proven day-100 inflow
  timing gap (correct = boundary + 100), NOT a new residual and NOT
  a failure. Any other boundary remainder is NO-GO.
- GO4: no-span-data guard: applying the rule to the bare raidcallers
  corpus file (no `nestEvents`) yields 0 exclusions and 0 changed
  records.
- GO5 (generality, synthetic payloads in the proof, no corpus): all
  of — (a) partial match leaves the unmatched remainder counted;
  (b) a span that creates no direct record excludes nothing;
  (c) a draw outside any span excludes nothing;
  (d) a span-internal draw whose items match no record item excludes
  nothing; (e) two independent spans exclude independently.
- Verdict rule: GO requires GO1 + GO2 + GO3 + GO4 + GO5 all met.
  Any miss is NO-GO — never re-scored against a friendlier metric
  mid-run. A miss goes under "metric review" in the evidence file
  with a revision proposed for the NEXT run.

## What is NOT judged here

- No new seeds, no new sim band, no re-judgment of the cultnest
  NESTED verdict, the perstack GO, or any standing verdict.
- No game-code behavior: this rule changes no pantry state, no meal,
  no ability. It changes only how a summing ledger counts records
  it was already given.
- Balanced panel (MEASUREMENT.md §15): no before/after game
  comparison exists — this arm changes no lever and no game code.
  The before/after here is old sum vs deduped sum on identical
  inputs, judged by the thresholds above. Not forced, not faked.

## Proof

`scripts/test-dedupspan-b.js` (exit 0 = GO, exit 1 = NO-GO), runnable
by the coordinator after rebase from the worktree root:
`node scripts/test-dedupspan-b.js`. It asserts the fidelity inputs
(cultnest replay direct124/meal466/meal474 identities), GO1–GO5, and
prints the old vs deduped sums. Implementation:
`scripts/dedupspan-ledger-b.js` (exports `applySpanDedup` for reuse;
CLI mode prints the 9954 dedup summary). No jest (proofs are node,
not jest). No [needs-eyes]: measurement, not a player-visible change.

## Sense-testing

This arm has NO narration surface: it touches only a summing ledger
over already-recorded corpora. No villager transcript or dialogue
sample is claimed as a sense check for this rule. (The cultnest and
perstack arms already reported that say lines around days 34–36 do not
name cultivate or the double-count — a recorder-scope gap, not a
sense verdict for this rule — and that reporting is not reused here
as a substitute sense check.)
