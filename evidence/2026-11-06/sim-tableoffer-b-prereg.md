# sim-tableoffer-b prereg — the sticky table offer (Loop B, run fleshout-loop-b-20261106T1430Z)

## Ruling being implemented
Steve 2026-11-06 07:06 CST: once the table offers a seat, the offer does
NOT withdraw. The d90 withdrawal (seeds 99767, 89702) is a DEFECT to fix,
not a rule; the time after the offer is not "extra time to repair."
Evidence: finding #1795 in
hidden_files/sim-findings.md; evidence/2026-11-05/sim-trickoff-confirm-b.md
+ coordinator evidence/2026-11-06/sim-winnability-round-0630.md.

## Forensics (what the d90 withdrawal actually was — read before building)
- trickoff-99767's own JSON: `bestSeat: 'none'`, `firstLesserDay: null`,
  `surgeDay: null`, `announceDay: null`. The offer was NEVER made on that
  run: the bearer took the fusion pellet and never banked the feast surge,
  so the food-thesis deed was uncompletable and the seat never held. The
  d90 line quoted in the finding is the progression.js reactor beat (the
  pellet quote), not table.js's withdrawal beat — it says "the table will
  still be here" and clears no flag.
- vfull-99767 (same seed, control policy): `surgeDay: 54`,
  `firstLesserDay: 54`, announced d90, sat d110 lesser, won. Same seed,
  different bearer choices.
- The defect class this arm fixes is therefore the one the assignment
  names and the r19 test proves reachable: **offer made, then a bar
  drops, withdrawal fires**. The only regressable lesser-seat bar is
  integration stage (45 -> 39 via a favor refusal, r19 mechanism;
  waves/contests/crises/food-deeds are monotonic). The fix is scoped to
  src/js/table.js only: the withdrawal paths (tableWithdrawLine,
  tableScene's "No seat: withdraw aloud" branch, tableAnnounce's
  "lost the seat" branch). The pellet-never-offered case (99767 literal)
  is a separate question — the pellet blocks the food deed by design and
  the mantle-passing recovery is the designed out — and is NOT changed
  here: no win-price, deed-gate, or readyDemand change; no change to what
  earns the offer in the first place.

## Design (sticky offer)
- Once the table has been announced to the player (`pg.tableAnnounced` —
  set by arcBeat(4), the TABLE RE-FIRE, and tableAnnounce, all of which
  speak a "being set" line), a later dip of any bar NEVER withdraws it:
  tableAnnounce's dawn check and tableScene's no-seat branch both hold
  instead of withdrawing. `tableWaiting` and `tableAnnounced` stay true;
  no withdrawal line speaks.
- While dipped, the table waits: a holding line speaks ONCE per dip
  (flag `pg.tableHoldingTold`, cleared when the case is whole again),
  naming the missing bars honestly — the System keeps its word, it does
  not pretend the case is complete.
- When the case is complete again, the offer re-fires: the Haven preview
  returns (it already gates on `tableWaiting` + live seat) and
  tableAnnounce speaks a return line once (flag cleared).
- Sitting is still gated on the LIVE seat (tablePreview/tableTakeSeat
  unchanged): a dipped offer cannot be sat until the case is whole
  again. This is "re-fires when the case is complete", not a gate change.
- The pre-offer withdrawal beat is UNCHANGED: a village that never had
  the table announced still hears the withdrawal line at dawn and the
  TABLE RE-FIRE still re-extends aloud on re-earning (the r19 test's
  promise half, preserved).
- The player's decline/deny is preserved: nothing auto-sits, nothing
  removes the waiting state; the offer stands in Haven while the player
  chooses not to take it (the Easter-egg road — staying unseated through
  the Network campaign — is untouched; overtime keeps ticking while the
  seat is not taken, per overtime.js).

## Pre-registration (binding, MEASUREMENT.md §14)
- PRIMARY METRIC: the reproduction scenario (seeded, constructed d95
  lesser-seat profile per test-tablewithdraw-20261021.js: offer made,
  integration slips 45 -> 39, dawn tableAnnounce). GO iff post-fix the
  scenario keeps its offer through the withdrawal trigger: tableWaiting
  true, tableAnnounced true, no withdrawal copy spoken, holding line
  spoken once naming the integration slip; AND on recovery (integration
  back to 45) the preview returns and sitting succeeds; AND the pre-offer
  withdrawal still fires for a never-announced village.
- GO THRESHOLD (all must hold): (1) reproduction RED pre-fix (withdrawal
  fires on the offered-then-dipped seat — proves the defect is real in
  this build); (2) reproduction GREEN post-fix per the primary metric;
  (3) decline preserved: the offered village can hold the offer unseated
  across dawns (tableDone stays false, no auto-sit, preview returns the
  offer while the seat holds); (4) existing table tests green —
  test-tablewithdraw-20261021.js updated IN THE SAME COMMIT (its
  behavioral half asserts the old withdrawal-on-offered-seat, which this
  ruling supersedes; its voicing + re-fire halves are preserved) plus
  check.js --quick green.
- HORIZON: the scenario test is day-bounded (constructed d95 state, no
  long sim). Any sim sweep is a no-regression check only: 12 seeds
  99761–99772, competent/vfull policy, 180d death-aware horizon,
  compared against the recorded V-full column of
  evidence/2026-11-05/sim-trickoff-confirm-b.md (lesser 5/12, full 0/12,
  median 95d). A trajectory change on a seed is investigated, not
  auto-failed: the fix is SUPPOSED to change offered-then-dipped seeds.
- SEEDS / POLICIES: scenario seed 777001 (same construction seed as the
  r19 test); sweep seeds 99761–99772 (fresh winnability band) if run.
- NO-REPEAT RULE: no new measurement arm on an already-proven constraint;
  this is a BUILD arm (game code) on the winnability chain.

## Metric review (for the NEXT run, not this one)
- To be filled in the evidence file after judging: did the primary metric
  capture the ruling, or did "keeps its offer" need a sitting-while-dipped
  reading (Design B) instead of the re-fire reading (Design A) used here?
