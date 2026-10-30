# sim-bedroll-b — PRE-REGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-bedroll-b
(axis: food-economy/narration; findings item 2026-10-28:
"EYES ON YOUR BEDROLL" FIRES FOR NEVER-SLEPT PLAYERS,
from loop-B arm sim-dawnhall-b,
evidence/2026-10-28/sim-dawnhall-b.md).

## Pinned base

- Base commit: c795e7e2535921c21fd0c27d5cd180f34d0fb40a
  (worktree branch sim-bedroll-b tip at prereg time).
- Base drift is real on this repo: the dawnhall census
  (3 misses on 10712/21, 10720/18, 10722/30) is NOT quoted
  as current-master behavior. The baseline leg below
  re-derives the bedroll-line census on the pinned base;
  the verdict is judged against that baseline leg, never
  against the old census.

## The gap, stated

On seeds 10712/10720 (dawnhall evidence), sleep was
REFUSED ("Dawn's an hour off — too late for real sleep")
and the player waited awake in the hall, but the
no-palisade raid player line still said "eyes on your
bedroll" (src/js/havenGrowth.js havenRaidTick). The line
is true about place (inside the haven) and false about
state (not in bed). This arm fixes ONLY that line's
condition. It does NOT resolve browser ordering of the
raid line (the raidname [needs-eyes] item), does NOT
touch the hall-shelter question (whether the hall
should stop the raid pending slot — a steve-call), and
does NOT touch spawn, damage, crisis, or economy values.

## Slept signal (read from code BEFORE judging)

- `Game._sleeping` (src/js/game.js sleep()): set to
  { quality } when real sleep starts (line ~20824),
  cleared unconditionally after the sleep loop
  (line ~20851). It is the game's own "player is
  currently asleep" flag, transient, never saved.
- havenRaidTick runs via the progDaily wrap, which
  endDay calls (havenGrowth.js ~901, progression.js
  endDay wrap). endDay fires inside tickAction during
  the sleep loop (slept: _sleeping set) or during a
  wait/rest tick crossing midnight (awake: _sleeping
  null). No other code sets _sleeping.
- Therefore _sleeping read at the moment the player
  line is said IS the slept signal: true = the player
  is asleep in this raid's night; false = awake.
  If the baseline leg shows this signal disagreeing
  with the transcript markers (settle line vs refusal
  line in the same night), the verdict is DIAG (see
  below) and NO game change ships.

## Instrument

- Driver: scripts/bedroll-trace-b.js — a copy of
  scripts/dawnhall-trace-b.js (same day loop, same
  substrate, same grant fixture, same tap code) PLUS
  a filtered say log: every say line matching the
  night/raid pattern set, each entry carrying the live
  `!!Game._sleeping` flag, the driver's phase, and the
  callIdx (night key: the night after evening N has
  callIdx N; its morning is loopDay N+1). The added
  layers are read-only (record only, no game writes,
  no RNG consumption). Corpora: evidence/2026-10-30/
  sim-bedroll-b-corpus-before/ (baseline leg) and
  sim-bedroll-b-corpus-after/ (post-fix leg).
- Analyzer: scripts/analyze-bedroll-b.js — groups the
  filtered say log by (seed, callIdx night) and reports,
  per night: bedroll-line count, awake-line count,
  sleeping flag on each player line, settle/refusal
  marker presence, and the raid-night transcript window.
- Proof: scripts/test-bedroll-b.js — green before GO.

## Bands, staging (all fixed up front)

- Band: seeds 10710–10725 (16 seeds), the dawnhall
  confirm band, so nights are comparable seed-for-seed.
- Pilot first: seeds 10710–10717 (8 seeds), judged on
  INSTRUMENT sanity only (driver completes, corpora
  complete, at least one never-slept bedroll case
  present on the pilot sub-band or its absence is
  explained in metric review). The pilot does NOT judge
  the fix.
- Confirm: the full 16 seeds, run as the BASELINE leg
  on the pinned base, then re-run as the AFTER leg
  after the fix, on identical seeds and substrate.
  The baseline leg is the judged baseline; the pilot
  corpora are the first 8 of the baseline corpus only
  if the pilot run and the baseline run are the same
  invocation — otherwise the baseline leg re-runs the
  full band as the judged run (pilot corpora kept
  separately, never mixed into the judged corpus).
- Substrate (gates FATAL, identical to dawnhall):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, POLICY=insideevening, DAYS=30,
  TAPDAYS=5, thief grant fixture as in dawnhall.

## Primary metric and GO threshold (judged ONLY against this)

- Primary metric: BEDROLL-LIE COUNT = number of
  (seed, night) groups on the band where the player
  never slept that night (sleeping flag false on the
  player line AND the night carries the sleep-refusal
  marker with no settle marker) AND the "eyes on your
  bedroll" line fired.
- GO: ALL of:
  (a) baseline leg reproduces >= 1 never-slept
      bedroll-line case (the finding is real on the
      pinned base, not a stale-census ghost);
  (b) after leg: BEDROLL-LIE COUNT = 0, AND every
      baseline never-slept case has the awake line
      ("inside the haven, eyes on you") in its place;
  (c) slept mornings unchanged: every baseline
      (seed, night) where the player slept (sleeping
      flag true) still carries the byte-identical
      bedroll line after the fix;
  (d) NEUTRALITY GATE: before/after corpora deep-equal
      on all 16 seeds after normalizing ONLY the two
      player-line variants to one placeholder — fight
      sequences, moves, checkpoints, deaths, wave kills,
      and all non-affected raid lines identical;
  (e) at least one full post-fix tail sense-read passes
      (a never-slept night AND a slept night read
      end-to-end for meaning: the awake line reads true
      for an awake player, the bedroll line still reads
      true for a sleeper, nothing else in the night
      changed meaning).
- NO-GO: baseline reproduces zero never-slept cases
  (finding not reproduced on pinned base — report, do
  not move seeds), OR any GO clause fails.
- DIAG (no game change ships): no reliable slept
  signal exists in code — i.e. the _sleeping flag at
  player-line time disagrees with the transcript
  markers, or no flag distinguishes the cases. In that
  case document the exact gap, name the signal that
  would be needed, and ship NO src/js change. Never
  ship a guessed condition.
- KILLED at pilot: driver crashes, corpora incomplete,
  or the tracer layers move the game (move counts
  diverging from the dawnhall corpus on the same
  seeds) — stop, diagnose, do not spend confirm seeds.

## Secondary observations (reported, never judged)

- Total bedroll-line nights and awake-line nights per
  leg; slept vs never-slept split of all player lines.
- Wall numbers for the judged corpora — reported as
  NOT OBSERVABLE on 30-day legs (never as zeros):
  national / table / wins, wave 4–5 reach, median
  survival.
- Village assessment in plain words (what the village
  looked like, who thrived/died and why, what
  knowledge was missing, which blank was filled or
  documented).
- Out-of-scope lines considered and left: the
  "nothing reached your bedroll" else-branch (bedroll
  as a physical object, still true when awake) and the
  palisade branch ("You sleep through the worst of it
  — or would have", already hedged with "or would
  have"). Neither is touched.

## The fix (narration honesty only)

- In havenRaidTick's no-palisade player branch only:
  if `!!this._sleeping`, say the byte-identical
  bedroll line; else say the same sentence with
  "eyes on you" in place of "eyes on your bedroll".
  No spawn, draft, damage, crisis, pantry, or economy
  value is touched; the pendingEncounter assignment
  and everything after it are unchanged.
- The game-code commit (if any) carries [needs-eyes]:
  a narration change needing Steve's phone eyes.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review: whether
the prereg metric proved right, what diverged
(baseline vs dawnhall census, signal agreement, pilot
vs confirm), and any revision proposed for the NEXT
run — never a mid-run re-score.
