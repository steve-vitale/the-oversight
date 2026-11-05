# sim-bankadded-substrate-a — PREREG ADDENDUM (instrument fix)

Date: 2026-11-05. This addendum is written BEFORE the judged
full-band run, AFTER a 1-seed pilot (seed 17063) exposed a
pure instrument failure in the committed probe policy. The
fix is authorized by the prereg itself ("a pure instrument
fix in its own scripts (pre-registered here, proven
before/after on identical seeds)"). No game code is touched;
no metric, bar, band, or case definition changes. The pilot's
genuine event stands as judged data (see below); the pilot
corpus file is replaced by the fixed-instrument full-band run
(the pilot copy is kept at /tmp/probe-pilot-s17063.json for
the before/after proof — it is not evidence).

## The failure: honest waits cannot park the clock at 449

The committed probe staged a bank-band evening by waiting to
dayTicks >= 449 (Game.doAction('wait'), cap 12). The pilot
proved this mechanically impossible. Engine code
(src/js/game.js doAction): 'wait' ticks to the NEXT DAY-PART
boundary (128-tick parts), and 'forage' costs exactly 16
ticks. A wait from clock 275 lands at 384, the next wait
rolls the day (512) — the clock can never sit at 449 via
waits, because 449 is mid-part-4 (384–511) and no wait lands
there. Pilot evidence, seed 17063 loopDay 14 (underlying
'skip', clockBefore 275): 11 waits, clockAfter 128 — the day
rolled mid-waiting, skip 'wait-cap', nothing staged. The
wait-to-band mechanism is dead, not the substrate idea.

## The fix: rest (coarse) + forage press (fine) to the band

The advancer is replaced by the engine's own small-step
actions, both real player verbs, both recorded per event:

- 'rest': exactly +96 ticks, 40 kcal (src/js/game.js
  doAction + src/js/engine/calories.js ACTION_COSTS). Used
  while clock < 416 (a rest from >= 416 would roll the day:
  416 + 96 = 512).
- 'forage' press: exactly +16 ticks, 60 kcal, the evening's
  own work verb (the bank mode IS forage presses). Used in
  the 416–448 window where a rest would roll the day
  (at most 3 presses: 416 -> 432 -> 448 -> 464).
- Day-roll guard: if scholarDay changes during the
  advancer, stop at once (the night has begun without
  reaching the band) — skip 'day-rolled'. Also stop on
  gameOver / combat / press err / press null-return, and
  at the action cap (8 actions) — skip 'advancer-cap'.

Coverage from the screen's observed skip clocks (171–275,
n=8) and flip-after clocks (387–448): rests alone cover
171–415 in <= 4 rests (<= 160 kcal); the fine window needs
<= 3 presses (<= 180 kcal). The 8-action cap covers every
possible clock (worst case from 0: five rests to 480; a
clock in 416–448 needs <= 3 fine presses instead of a rest),
so 'advancer-cap' should not bind on any observed clock —
if it ever fires, it is an honest non-event, not a failure.

## New event kind: press-added

The presses are real evening work, so they can ADD food —
and if they do, that food is evening-added food in the bank
band, exactly the judged case. The probe record now carries
a kind:

- 'genuine': underlying bankfood evening was bank-mode with
  edible delta > 0. No probe work, no injection. (Unchanged.)
- 'press-added': the probe's advancer presses yielded edible
  delta > 0 after reaching the band. No injection. Provenance
  is the per-press records (Eknown per press).
- 'staged': presses yielded 0 edible after reaching the band,
  so the fixed haul was injected (720 kcal, as before).
  Provenance is the injected-stack identity check. (Unchanged.)

All three kinds are bank-band added events (clock >= 449 at
the end of the evening phase, edible delta > 0, stranded
evening) and all three count toward the pre-registered GO
bar (>= 3 distinct judged events, unanimous), with the kind
split reported. The injected-stack check applies to
'staged' only; 'press-added' carries press provenance;
'genuine' carries the forage-press provenance from the
underlying evening (as before).

## New skip: already-added

If the underlying bankfood evening already added edible food
in ANY mode (bank/flip delta > 0), the probe does no work and
injects nothing — record skip 'already-added'. Flip-added
events stay screen context only (never counted toward the
bar), as the prereg requires; injecting on top of them would
mix flip-added with injected food in one delta.

## Per-seed cap (clarified)

The cap (first 2 probe-produced events per seed) now counts
'staged' + 'press-added' (both probe-produced). 'genuine'
events involve no probe intervention and do not count toward
the cap.

## Before/after proof (on identical seed 17063)

Before (pilot, old instrument): genuine event loopDay 13,
+325 kcal, RETAINED; loopDay 14 skip 'wait-cap' (11 waits,
275 -> 128, day rolled). After (fixed instrument, same seed
+ env): the genuine loopDay-13 event MUST reproduce exactly
(same loopDay, delta, verdict) — the fix touches only the
probe's staging path for non-genuine evenings, never the
bankfood stack — and loopDay 14 MUST now stage (press-added
or staged, judged at the loopDay-15 morning). The comparison
is written into the evidence file; any divergence in the
genuine event fails the fix and stops the run.

## Files changed by this fix (own scripts only)

- scripts/policies/bankadded-probe-diag.js: wait loop replaced
  by the rest+forage advancer; staging decision gains
  'already-added'; record gains kind/rests/pressRecords/
  pressDelta/pressEknown/dayRolled.
- scripts/analyze-bankadded-probe.js: buildProbeEvents handles
  kind 'press-added' (verdict via classifyRetention,
  press provenance, no injected-stack check); kind split in
  totals.
- scripts/test-bankadded-probe-a.js: staging-decision tests
  for 'already-added'; press-added analyzer fixture; advancer
  cap/coverage cases on the decision helper.
- scripts/bankadded-probe-trace-b.js: UNCHANGED (the driver
  never waited; only the policy did).
