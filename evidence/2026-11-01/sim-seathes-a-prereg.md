# sim-seathes-a — PREREGISTRATION (written BEFORE any judged sims)

Run: fleshout-loop-a-20261101T1016Z. Worker: sim-seathes-a. Axis:
scale-onramp (converging, NOT converged). Sibling Loop B works
food-economy — NOT touched (no B axis, claims, or trees).

## Assignment (DIAG ONLY, zero src/js changes)

Seat-taking hesitation. Prior evidence (read before designing):
- evidence/2026-11-01/sim-scale-onramp-round-0615.md (fullseat-recheck:
  seed 78201 holds a priced lesser seat from day 165 through the 180d
  cap without sitting while overtime ticks to x2; day-180 beat docks
  standing -8 and says "Take your seat from Haven to stop the clock").
- evidence/2026-11-01/sim-rd5daily-a.md (weapons-short on 78201 is
  PERSISTENT not end-state decay; veterans-2 is the binding bar, 0
  living wave-4+ killers at closest approach on 8/8 seeds; rank decayed
  national->regional at closest; do NOT re-litigate weapons timing).
- evidence/2026-11-01/sim-fullseat-recheck-a.md and its sense transcript
  sim-fullseat-recheck-a-sense-78201.txt.

Question: WHY does the seat-taking leg not fire on a surviving
lesser-seat village? Is it a decision the policy never selects, a gate
that blocks sitting, a presence/location requirement (scholar must be
at Haven?), waiting for the full seat, or something else?

## Code facts fixed BEFORE the run (from reading, not from new sims)

These shape the instrument; they are not findings of this arm.

- Substrate scripts/policies/tableseat-nowait.js, reused UNMODIFIED:
  its daily runs the seat leg BEFORE the day's courtship work, and
  ONLY when `!pg.tableDone && scaleRank() >= national` (rank order
  >= 2). The leg is `tsDriveSeat`: `tablePreview()` non-null and
  `ready`, scholar alive, not exiled/joined, then `tableTakeSeat()`.
  There is NO wait leg (no Haven-ending while tableWaiting) and NO
  seat-kind filter — a ready lesser seat is taken exactly like a
  ready full seat. Counters on ctx: tsPreviewSeen, tsPreviewNotReady,
  tsSeatAttempts, tsSeatTaken, tsSeatDay, tsSeatKind, tsSeatFailed,
  tsGuardRefused, tsNationalDay.
- Game gate (src/js/table.js, read before designing): `tablePreview()`
  is null unless `pg.tableWaiting && !pg.tableDone`, seat != 'none',
  and day >= 90 (`winDayFloorOk`). `ready` = `tableEntryBlock()` empty.
  `tableEntryBlock()` blocks on: run over/won, active contest, in
  combat / scholar monster, or `havenStoresAccess() === 'none'`
  ("Return to Haven to take your seat"). `havenStoresAccess()` is
  'inside' iff scholar `insideHaven` on a haven tile, 'remote' iff
  integration stage >= 3 (and not exiled), else 'none'.
- Lesser seat (tableSeat()) needs regional+ scale, NOT national:
  waves 4/4/3, contests >= 2, crises >= 2, stage >= 2, food deeds.
  Full seat (deedGateReady().ok) additionally needs national/global.
  So a regional village CAN hold a priced lesser seat while the
  policy's national+ gate refuses to attempt it — a structural
  mismatch, to be confirmed or refuted at the decision moment.
- Existing corpora (already published, not new claims): recheck armed
  rows carry NO tsPreviewSeen/tsSeatAttempts on 78201 (only
  tsNationalDay 87) or 78208 (only tsNationalDay 77), while 78206
  carries exactly one attempt, taken day 90, kind lesser, path feared.
  Rd5daily post-day rows show national/lesser overlap ZERO on both
  lesser seeds (78201 national 87-154, lesser 165-180; 78208 national
  day 77 only, lesser 128-163; 78206 overlap 83-90, sat day 90).
  Post-day rows are NOT decision-moment rows: the seat leg runs
  before the day's work, so this arm measures the decision moment
  directly instead of inferring it from post-day rows.

## Hypotheses (prereg order; at least one must be falsified)

- H1 POLICY-GATE (leading): on every held day the policy's
  national+ gate blocks before any seat call, because rank at the
  decision moment is regional (decayed from national before the
  lesser seat priced). Falsified if ANY held day shows decision
  rank >= national.
- H2 GAME-GATE: the game itself blocks sitting (preview null or not
  ready) on held days even where the policy gate passes. Falsified
  if held days show preview non-null AND ready (then the game gate
  is not the blocker on those days).
- H3 PRESENCE: the scholar is not at Haven at the decision moment,
  so tableEntryBlock returns the Haven line. Falsified if held days
  show insideHaven + haven tile + access != 'none' at the decision
  moment (presence satisfied, yet no sit).
- H4 WAITING-FOR-FULL: the policy (or game) waits for a full seat
  and refuses lesser seats. Falsified by code reading (no seat-kind
  filter in tsDriveSeat) AND empirically by 78206 sitting a lesser
  seat on day 90 under this same substrate — the in-band positive
  control. If 78206's sit reproduces, H4 is falsified outright.
- H5 ATTEMPT-FAILS: attempts happen on held days but tableTakeSeat
  returns !ok (or the guard refuses). Falsified if per-day ctx
  counter diffs show zero attempts AND zero guard refusals on all
  held days.

## Instrument (new files only; existing recorders UNMODIFIED)

- scripts/seathes-a-sweep.js (sweep + analyzer + sense mode, rd5daily
  pattern): defines withSeatHesDiag, a pure-read wrapper OUTSIDE
  tableseat-nowait (composition: withSeatHesDiag(withVet2Diag(
  withFullseatDiag(tableseatNowait)))). Env: LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FULLSEAT=1, VET2=1, SEATHES=1. Horizon 180d
  death-aware (the recheck/rd5daily horizon; the question is about
  days 165-180 and 128-163, both inside it — no fixed-200d run).
- Decision-moment snapshot: BEFORE delegating inward each day (i.e.
  at exactly the point the substrate's seat leg evaluates), pure
  reads only, no game writes, no RNG: scholar day, rank
  (scaleRank), seat (tableSeat), deedGateReady ok, pg.tableWaiting,
  pg.tableDone, tablePreview() (seat, ready, why, overtime tier),
  tableEntryBlock(), havenStoresAccess(), scholar insideHaven,
  playerTile type + map px/py, scholar alive, exiled/joined,
  standing vs t4/t5 + holdKind + deed distances (snapFullSeat),
  ctx ts counters BEFORE. Post-day row: ctx ts counters AFTER,
  seat/rank/tableDone after, snapFullSeat after (continuity with
  the rd5daily series).
- Per-day seat-leg activity = AFTER-minus-BEFORE ctx counter diffs
  (attempts, taken, failed, guard refusals, preview-seen/not-ready).
  Reads used: tablePreview/tableEntryBlock/tableSeat/deedGateReady/
  havenStoresAccess/playerTile/scaleRank/snapFullSeat — all pure
  reads already exercised daily by the existing recorders or the
  game UI; tablePreview additionally calls tableEarnedPaths and
  overtimeStanding (pure reads: overtimeTier reads a stored counter).
- Recorder-neutrality leg: same stack with SEATHES unset vs set, on
  2 seeds (78201, 78208): end fields identical (days, gameDays, ts
  counters, starvationDeaths, endSnap dist/binding/seat, diag
  maxDist, vet end/max counts, waveReach, finalRank, maxRank,
  nationalEver, table, entered, won). Cross-corpus check: ON-run end
  fields vs rd5daily-a-perseed rows (expect identical; any diff is
  a neutrality failure to investigate, NOT a finding).
- Determinism leg: one seed (78201) ON-run re-run byte-identical
  (row + daily-series JSON, cmp clean; scratch deleted).
- No new policy files edited; no src/js; no gate threshold moved;
  no [needs-eyes] (measurement only).

## Seeds (INTENTIONAL REUSE — claims NO new wall numbers)

Seeds 78201-78208, REUSED from sim-fullseat-recheck-a / sim-rd5daily-a.
Reuse is intentional (same precedent as rd5daily) and claims NO new
wall numbers: wall numbers cited are the recheck's, reproduced as a
neutrality check only. NO fresh seeds are needed for any sit-decision
question: the question is about THESE lesser-holding seeds, and the
positive control (a sit under this substrate) is in-band (78206).
Freshness verification against corpus filenames and dated evidence
.md files was therefore done for the recheck band already and is not
re-done here; no new band is named. If a held day comes back
UNCLASSIFIED, the verdict is DIAG-NO-GO (see below) — no band-shopping
to escape it.

## Pilot gate

Pilot = the 8-seed band series complete (78201-78208). NO confirm
spend (no second band, no lever) unless the pilot itself fails its
GO bar — this is a DIAG census, not a lever comparison, so there is
no confirm leg to spend on. If the pilot shows zero UNCLASSIFIED held
days, the census is complete at pilot scale.

## Pre-registered GO bar (judge exactly against it, no re-scoring)

DIAG-GO iff ALL of:
1. A daily seat-state series for 78201 covering days 165-180 with,
   per day: seat priced (kind), overtime multiplier, standing vs
   bar, deed distances, scholar location/presence, and the
   seat-decision outcome.
2. A classified blocking condition for EVERY held day (held day =
   decision-moment seat lesser or full, table not done, run alive):
   ZERO UNCLASSIFIED held days, on 78201 AND 78208 AND any other
   lesser-holding seed in the band.
3. The same series for 78208 (plateau days 128-163) and any other
   lesser-holding seed in the 78201-78208 band (expected: 78206 is
   the sit control, not a held seed; any other seed whose
   decision-moment series shows a lesser/full seat held to end
   without sitting joins the held set).
4. A sense read of the endgame transcript (existing
   sim-fullseat-recheck-a-sense-78201.txt, days 177-181, plus a
   fresh sense replay ONLY if it is needed to read a held day
   outside the retained ring — fresh replays are NON-MEASURED and
   never enter the census).
5. At least one falsified alternative hypothesis from H1-H5 above
   (state which, with the falsifying observation).
6. Recorder-neutrality leg PASS (2 seeds, ON vs OFF identical end
   fields) and determinism leg PASS (78201 byte-identical re-run).
7. Proof test scripts/test-seathes-a.js GREEN (analyzer unit checks
   + corpus legs re-deriving every headline number from the judged
   corpora, independent of the sweep's printed verdict).

Series completeness definition (revised per rd5daily metric review,
NOT label-consecutiveness): one row per daily call + row-count
agreement with fullseat-diag days and vet2 rows + zero recorder
errs. Scholar-day labels may skip per the rd5daily diagnosis (the
substrate's daily hook settles the clock past some scholar-day
values); label skips are recorded, not treated as missing days.
Held-day classification uses row order + decision-moment contents,
never the label alone.

## Panel (MEASUREMENT.md §15)

NOT APPLICABLE for a single-base DIAG census — declared, not
fabricated. No before/after lever comparison exists in this arm.

## Classification scheme (per held day, priority order)

- RANK-GATE: decision rank order < 2 (policy gate stops the leg
  before any preview call). Secondary fields still recorded: would
  the preview have been ready, and would presence have blocked?
- PREVIEW-NULL: rank >= 2 but tablePreview() null (subclass:
  TABLEWAITING-FALSE / TABLEDONE / SEAT-NONE / DAY-LT-90).
- ENTRY-BLOCKED: rank >= 2, preview non-null, ready false
  (subclass by why: HAVEN / CONTEST / COMBAT / OTHER with the
  verbatim why string).
- GUARD: rank >= 2, preview ready, scholar dead or exiled/joined
  (ctx diff shows guard refusal, no attempt).
- ATTEMPTED-FAILED: ctx diff shows an attempt with failed outcome
  (takeSeat !ok) or a seat error.
- SAT: ctx diff shows tsSeatTaken (this day is a sit day, not held).
- UNCLASSIFIED: none of the above, or missing/null decision fields,
  or ambiguous counter diffs. ANY held day landing here fails GO
  bar item 2 outright.

## Evidence to write

evidence/2026-11-01/sim-seathes-a.md with: lever played (none —
DIAG), before/after numbers if any (none expected; say so),
reachability verdict for the seat-taking content, village
assessment in plain words, blanks filled or documented, and a
mandatory "metric review" section. Corpus:
evidence/2026-11-01/seathes-a-perseed/s<seed>.json +
s<seed>-daily.json + summary.json.
