# sim-tableoffer-b — the sticky table offer (Loop B, run fleshout-loop-b-20261106T1430Z)

## Lever played
BUILD (game code, src/js/table.js only): the table offer is sticky once
made. Steve 2026-11-06 07:06 CST: once the table offers a seat, the offer
does NOT withdraw; the d90 withdrawal is a DEFECT, not a rule; the time
after the offer is not "extra time to repair."

What changed (3 edits, all in src/js/table.js):
- `tableMissingBars(seat)` extracted from `tableWithdrawLine` (byte-identical
  naming) — the single source of truth for naming what the case lacks.
  New beats sharing it: `tableHoldingLine(seat)` (the offer holds, once
  per dip, naming the real loss) and `tableReturnLine()` (the case is whole
  again, the held offer re-fires).
- `tableAnnounce()` (the dawn driver path) and `tableScene()`'s no-seat
  branch: when `pg.tableAnnounced` is true (the table has been announced
  to the player — via arcBeat(4), the TABLE RE-FIRE, or tableAnnounce),
  a dipped bar HOLDS instead of withdrawing. `tableWaiting` and
  `tableAnnounced` stay true; the holding line speaks once per dip
  (`pg.tableHoldingTold`, cleared on recovery or on sitting). Only a
  table that was NEVER announced still withdraws aloud (the pre-offer
  "does not come" path, re-extended by the TABLE RE-FIRE on re-earning).
- Sitting stays gated on the LIVE seat (tablePreview/tableTakeSeat
  untouched): a dipped offer cannot be sat until the case is whole
  again. No win-price, deed-gate, or readyDemand change; no change to
  what earns the offer. The player's decline/deny is preserved: nothing
  auto-sits, nothing clears the wait — the offer stands in Haven while
  the player chooses not to take it (the Easter-egg road, staying
  unseated through the Network campaign, is untouched; overtime keeps
  ticking while the seat is not taken).

## Forensics — what the d90 withdrawal actually was (read first)
- trickoff-99767's own JSON: `bestSeat: 'none'`, `firstLesserDay: null`,
  `surgeDay: null`, `announceDay: null`. The offer was NEVER made on that
  run: the bearer took the fusion pellet and never banked the feast surge,
  so the food-thesis deed was uncompletable and the seat never held. The
  d90 line quoted in finding #1795 is the progression.js reactor beat
  (the pellet quote), not table.js's withdrawal beat — it says "the table
  will still be here" and clears no flag. The transcript's only table
  line is that d90 pellet beat (header annotation "# withdrawal d90").
- vfull-99767 (same seed, control policy): `surgeDay: 54`,
  `firstLesserDay: 54`, announced d90, sat d110 lesser, won. Same seed,
  different bearer choices.
- The defect class this arm fixes is therefore the one the assignment
  names and the r19 test proves reachable: offer made, then a bar drops,
  withdrawal fires. The only regressable lesser-seat bar is integration
  stage (45 -> 39 via a favor refusal). The pellet-never-offered case
  (99767 literal) is a SEPARATE question — the pellet blocks the food
  deed by design and mantle-passing is the designed out — and is NOT
  changed here. Seed 89702 (named in the ruling alongside 99767) was
  not located in the cited evidence (only unrelated journey-endgame-r110
  armory hits); not chased.
- Implication, stated plainly: this fix does NOT change trickoff-99767's
  outcome (that village never earned the offer). It fixes the
  offered-then-dipped class, which is the defect Steve ruled on.

## Pre-registration
See evidence/2026-11-06/sim-tableoffer-b-prereg.md (committed 3e34bef6c
BEFORE any judged sim). Primary metric: the reproduction scenario keeps
its offer through the withdrawal trigger post-fix. GO iff (1) reproduction
RED pre-fix, (2) GREEN post-fix (holds once, re-fires on recovery, sits),
(3) decline preserved, (4) existing table tests green
(test-tablewithdraw-20261021.js updated in the same commit — its
behavioral half asserted the superseded withdrawal-on-offered-seat; its
voicing + unit halves are unchanged).

## Before / after (identical seeds — the reproduction scenario)
Scenario: seeded construction, d95 lesser-seat profile (same as the r19
test), offer made, integration slips 45 -> 39, dawn tableAnnounce.
- BEFORE (pre-fix, scripts/test-tableoffer-20261106.js): FAIL — withdrawal
  fired on the offered seat ("...the ring of pale light flickers... and
  does not come... WE WILL... RESCHEDULE."), tableWaiting=false,
  tableAnnounced=false; recovery re-announced but the preview stayed
  null (tableWaiting cleared — only checkArc's re-fire could restore it);
  8 failures. Parts B (pre-offer withdrawal) and C (decline) already
  passed pre-fix; Part D voicing passed except the not-yet-existing
  tableMissingBars helper. The defect is reproduced.
- AFTER (post-fix, same script, same seed): GREEN — no withdrawal copy;
  holding line speaks once ("the ring of pale light holds its place...
  BUT THE TABLE DOES NOT TAKE BACK WHAT IT SET. IT WAITS — COME WHEN
  THE CASE IS WHOLE."), naming "integration too shallow (stage 1)";
  tableWaiting + tableAnnounced stay true; second dipped dawn does not
  repeat the line; on recovery the return line speaks once ("the ring
  steadies... THE SEAT THE TABLE OFFERED IS STILL YOURS"), the Haven
  preview returns the lesser seat, and tableScene sits (audit + paths).
  While dipped the preview is null — sitting stays gated on the live seat.
- test-tablewithdraw-20261021.js (rewritten to the ruling, same
  construction): GREEN post-fix.

## No-regression sim check (sweep-winpath.js, competent, seeds 99761–99772, 180d)
- PRE-FIX: arc>=4 0/12, wave>=4 8/12, wave>=5 0/12, regional 0, national
  0, global 0, lesser 0, full 0, table fired 0, won 0, median 84d,
  max 179d. (Note: this sweep's villages all die at arc 3 — the
  competent policy through THIS driver never reaches the table, unlike
  the trickoff confirm's own driver which reached lesser on 5/12 V-full.
  So this sweep can only prove "no change where the table never fires",
  not cover the offer path; the scenario tests are the offer proof.)
- POST-FIX: byte-identical. diff of /tmp/wp-tableoffer-prefix.json vs
  /tmp/wp-tableoffer-postfix.json is empty (same 12 runs, same outcomes:
  arc>=4 0/12, lesser 0, full 0, table fired 0, won 0, wave-5 0/12,
  median 84d, max 179d). No trajectory moved — as expected on a band
  where the table never fires. (The JSONs live in /tmp; the funnel lines
  above are the record.)

## Scale-wall numbers (this run's sims)
- Pre-fix sweep (12 seeds, competent, 180d): national-or-better 0/12,
  table fired 0/12, wins 0/12, wave-4 unlocked 8/12, wave-5 reached
  0/12, median survival 84d, max 179d. Death causes dominated by
  villager combat (349), expedition (112), combat (91), the wild (76),
  monster (60). The wall is unchanged by this arm — as designed: the
  fix changes what happens AFTER the offer, not who earns one.

## Existing tests
- node scripts/test-tableoffer-20261106.js: GREEN (post-fix; RED pre-fix)
- node scripts/test-tablewithdraw-20261021.js: GREEN (rewritten)
- node scripts/check.js --only table: 10 passed, 0 failed
- node scripts/check.js --quick (run on the pre-header-fix checkout):
  282 passed, 8 failed in 656s. Attribution, verified by stash
  comparison (each failing test run on the stashed base + on the branch):
  7 fail IDENTICALLY on the base (pre-existing, unrelated to this arm —
  godpath/test-measurement-proof-update.js, test-measurement-workflow.js,
  test-mobile-combat-cadence.js, test-occupation-panels.js,
  test-phone-frame-proof.js, test-capable-bot-20261014.js,
  test-establishment-r20-fixes-20261020.js). The 8th,
  test-foodpower-20261014.js, failed ONLY on the branch: the ontology
  validator rejected my first provides-comment edit (a multi-line
  parenthetical inside the provides block ends the header parse — the
  generator then truncated the table entry and wiped Consumes in the
  regenerated ONTOLOGY.md). Fixed by using bare one-method-per-line
  entries; validate-ontology.js now clean ("All 132 systems validated"),
  foodpower 30/30, and the regenerated ONTOLOGY.md diff is exactly the
  3 added methods. The full quick suite is re-run on the rebased tip
  before this arm is reported merge-ready (see below); the final count
  is recorded there.

## Sense-test (read aloud)
- Holding: "The ring of pale light holds its place, and does not come
  tonight. 'THE CASE IS NOT COMPLETE. integration too shallow (stage 1).
  BUT THE TABLE DOES NOT TAKE BACK WHAT IT SET. IT WAITS — COME WHEN THE
  CASE IS WHOLE.'" Reads like the System keeping its word: it names the
  real loss, refuses to reschedule what it already set, and waits.
- Return: "The ring steadies, and the light comes back. 'THE CASE IS
  WHOLE. THE SEAT THE TABLE OFFERED IS STILL YOURS. TAKE IT FROM HAVEN
  WHEN YOU ARE READY.'" Reads like a kept promise, not a menu.
- The pre-offer withdrawal line is unchanged and still reads as the
  table not coming yet — correctly, since no offer was ever made there.

## Village assessment (plain words)
No village was played end-to-end by this arm — the measurement is a
constructed scenario plus a 12-seed no-regression sweep. What the work
shows: the table used to take back its word the morning after giving it,
whenever a single bar slipped — the one bar that can slip, the depth of
the village's tie to the System, is exactly the kind of thing that
wobbles while a village is fighting for its life. Now the table keeps
its word: it waits, says what is missing, and the seat is still there
when the case is whole again. A village still has to earn the offer, and
still has to sit down and play the doors to win — nothing about the
price changed. What changed is that earning it once means something.

## Blanks filled / documented
- FILLED (landed in this run): the sticky offer — offered seats no
  longer withdraw on a dipped bar (table.js only).
- DOCUMENTED, not chased: (1) the literal 99767 outcome is a pellet
  story, not a withdrawal story — a pellet bearer can never bank the
  feast surge, so the seat never holds and the mantle-passing recovery
  is the only out; whether that is the right design is a Steve question,
  carried as a sim-findings append below. (2) seed 89702's d90
  withdrawal was not located in the cited evidence. (3) arcBeat(4) in
  progression.js announces "a lesser seat" even when the seat is 'none'
  (day >= 90) — a pre-existing voicing wart outside this arm's table.js
  scope; the sticky fix treats that announcement as an offer (the
  holding line covers it honestly), but the line itself still overclaims.

## Metric review (for the NEXT run, not this one)
- The primary metric ("keeps its offer through the withdrawal trigger")
  captured the ruling as written (Design A: re-fires when the case is
  complete). The alternative reading — the offer stays TAKEABLE while
  dipped (Design B) — would have changed the effective sitting gate and
  was deliberately NOT built: no win-price/deed-gate change was allowed.
  If Steve wants sitting-while-dipped, that is a new ruling, not a
  measurement correction.
- The sweep-winpath.js competent driver never reaches the table on this
  band (0/12 arc 4), so it cannot regress-test the offer path. Any
  future offer-path regression check needs the trickoff confirm's own
  driver (which reached lesser on 5/12 V-full), not this sweep.
- The reproduction scenario's "offer made" flag is pg.tableAnnounced,
  which arcBeat(4) also sets when the seat is 'none' — the flag means
  "announced to the player", not "a seat was live". The holding line's
  wording was chosen to stay honest in both cases.

## Convergence state
scale-onramp: converging (NOT converged). This arm is a BUILD on the
winnability chain (offer stickiness), not a measurement of a proven
constraint. No axis verdict changes: the wall numbers are flat because
the fix acts after the offer, not before it.
