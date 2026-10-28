# sim-morningpersist-b — PRE-REGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-morningpersist-b
(run fleshout-loop-b-20261028T2126Z, axis food-economy).
MEASUREMENT ONLY: zero game-code change, zero policy change.
The only new files are the tracer driver, the analyzer, the
proof test, this prereg, and the evidence file + corpora.

## The open item being traced

sim-insideevening-b (run 1930Z) measured morning persistence
of inside evenings: a morning after an inside evening that
reads outside. Pilot: 1/207 (seed 10701, morning 14, evening
loop-day 13 'completed', evening position (4,7) inside,
morning position (4,5) outside, haven tile). Confirm: 3/411
(seed 10712 morning 21, (4,5); seed 10720 morning 18,
(5,6); seed 10722 morning 30, (4,5)). All four known misses
land on the haven tile at/near the lodge doorstep — the
havenDoorLanding neighbourhood (exitBuilding's landing,
sorted by distance to (4,5)) — not on a distant node.
The 1930Z evidence names the plausible class only: "an
upkeep verb that travels during the 3 pre-daily upkeeps
(e.g. feastFightRoad patrolling while feasted)". The
mechanism was never traced per miss. This arm traces it.

Boundary under test, stated exactly (from scripts/
sim-harness.js runDays): per loop-day, the harness runs
3x [policy.upkeep, driveFights, driveContests,
doAction('wait'), driveFights, driveContests], then
policy.daily (competent.daily + the insideevening evening
step), then Game.sleep(). The insideevening driver's
evening snapshot is post-daily, pre-sleep; its morning
snapshot is at the START of the next loop-day's daily
wrapper — i.e. AFTER sleep AND after that loop-day's
3 upkeep cycles + waits + fight/contest drives, but
BEFORE that day's competent.daily. So the interval a
miss can move in is: sleep + 3 upkeep cycles + 3 waits
+ fight/contest drives. The tracer partitions exactly
that interval (post-sleep checkpoint, per-upkeep
pre/post, per-verb position-change records, doAction /
fight / contest wrappers, villagerId on every snapshot
to catch succession) so a mover is named, not guessed.

## Instrument

Driver: scripts/morningpersist-trace-b.js — a copy of
scripts/insideevening-trace-b.js's day loop (same
substrate, same POLICY=insideevening, same DAYS=30,
same TAPDAYS=5 tap code, same grant fixture) PLUS
read-only tracing layers that must not move game state:
position snapshots at evening / post-sleep / pre- and
post-each-upkeep / morning; wrappers around the
position-moving verbs (travelTo, beginPathWalk,
pathStep, microMove, exitBuilding, enterBuilding,
doAction, useAbility, activateAbility, faceFeastDraw,
tbPlayerMove, tbBarrierExit, tbEnd, standGround,
answerDefenseCall, sleep) recording before/after
position + phase (sleep / upkeep-N / daily / fight /
harness) + feasted state + combat flags + the say lines
since the previous record. A verb record is kept only
when the position (inside / mx / my / tile / map node /
villagerId / insideTent) changes, plus exit/enter/
travel calls regardless of outcome. Snapshot reads
are the same reads the 1930Z driver already made
(playerTile, havenStoresAccess, integrationStage) —
no new Game writes, no RNG consumption by the tracer
itself (wrappers call the original verb once).
Analyzer: scripts/analyze-morningpersist-b.js.
Proof: scripts/test-morningpersist-b.js.

## Bands, staging, expansion rule (all fixed up front)

- Reused band: the 1930Z CONFIRM band, seeds
  10710–10725 (16 seeds), so misses are comparable
  seed-for-seed with 3/411.
- Pilot first: seeds 10710–10717 (8 seeds). The pilot
  judges INSTRUMENT sanity only (driver completes,
  corpora complete, the known sub-band miss — 10712
  morning 21 — reproduces or its absence is explained
  in metric review). The pilot does NOT judge trace
  completeness: misses are ~0.7% of mornings, so an
  8-seed pilot may legitimately hold 0 or 1 misses.
- Confirm: the full 16 seeds 10710–10725.
- Expansion rule (pre-registered, not a rescue): if
  the 16-seed confirm band yields ZERO misses, run
  the 1930Z pilot band 10700–10707 next (known 1 miss
  there), and if that also yields zero, a fresh band
  10726–10741 (16 seeds). Stop at the first band with
  >= 1 miss, or after both expansions with zero misses
  — the verdict then is DIAG with a zero-miss report,
  NOT a victory claim ("no misses observed" is not
  "mechanism traced"). Expansion bands are judged by
  the same trace-completeness bar.
- Substrate (identical to 1930Z, gates FATAL):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, POLICY=insideevening, DAYS=30,
  TAPDAYS=5. Corpora: evidence/2026-10-28/
  sim-morningpersist-b-corpus/ (pilot and confirm
  share the band; pilot files are the first 8 of the
  confirm corpus, re-run as the full band — the
  confirm run is the judged run, the pilot run is
  instrument sanity).

## Primary metric and GO threshold (judged ONLY against this)

- Primary metric: TRACE COMPLETENESS = (morning-after-
  inside-evening misses with a NAMED mover + mechanism)
  / (all such misses on the judged band). A named
  mover means: the exact verb call (or, if no verb
  moved the player, the exact checkpoint interval +
  the game-code path evidenced by the say window /
  state delta, e.g. succession with a villagerId
  change) that first moved the position from inside
  (4,7) to outside, with the phase (sleep / upkeep-N /
  wait / fight / contest) and the caller's purpose
  (e.g. feastFightRoad patrol, garden exit, flee-by-
  door, succession spawn) identified from the verb
  + phase + say window. A checkpoint-interval-only
  record with no verb and no evidenced path is
  UNTRACED, not traced.
- GO: trace completeness = 100% on the judged band
  (every miss named), AND the reproduction check
  passes or its mismatch is explained: the miss set
  on the reused band should be the 1930Z set
  (10712/21, 10720/18, 10722/30); a different miss
  set is NOT a failure of the bar by itself, but
  every miss on the run band must still be traced,
  and any divergence from 1930Z is reported in
  metric review (tracer read-only layers are the
  prime suspect for divergence, and must be named
  as such before any game-code explanation).
- NO-GO: any miss on the judged band is untraced
  (checkpoint-interval-only, or a verb record that
  does not explain the move). An untraced miss is a
  failed trace, not a shrug.
- KILLED at pilot: tracer crashes, corpora
  incomplete, or the pilot miss reproduction fails
  in a way that shows the instrument itself moves
  the game (e.g. verb wrappers changing outcomes) —
  stop, diagnose, do not spend confirm seeds.
- This arm lands NO game change whatever it finds:
  a mover worth changing is documented as a named
  next arm with its own prereg sketch, and the arm
  stops. Do NOT chase walk-quote kcal variance
  (separate open item) except to note it if it
  appears in a trace.

## Secondary observations (reported, never judged)

- Miss rate on the judged band vs 1930Z (3/411
  confirm, 1/207 pilot) on identical / labelled bands.
- Wall numbers for the judged corpora (national /
  table / wins, wave 4–5 reach, median survival) —
  expected zero on 30-day instances; reported as
  zero / not-observable, not omitted.
- Sense read: the say transcript around each miss —
  does the overnight move read as something a player
  would understand (a walked exit, a flee, a
  succession) or as teleportation?
- Village assessment in plain words (what the
  village looked like, who thrived/died and why,
  what knowledge was missing, which blank was
  filled or documented).

## Guards

- G1: median days alive on the judged band >= 0.8x
  the 1930Z confirm policy median (30) — i.e. >= 24.
  A tracer that kills villages is a broken instrument.
- G2: no src/js file modified in this arm's commits
  (additions under scripts/ + evidence/ only).
  Violation = stop and report.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review: whether
the prereg metric proved right, what diverged (miss
set vs 1930Z, tracer-induced divergence, zero-miss
expansion if triggered), and any revision proposed
for the NEXT run — never a mid-run re-score.
