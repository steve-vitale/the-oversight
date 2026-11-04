# Pre-registration — sim-fleerepair-confirm-a (Loop A run fleshout-20261104T0820Z, axis scale-onramp)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
go under "metric review" in the evidence file, for the NEXT run.

This is a CONFIRM of the adopted 8-seed pilot
(evidence/2026-11-04/sim-fleerepair-adopt-a.md), not a re-pilot and not a
redesign. The pilot's GO bars are restated verbatim below, adapted only for
seed count (12 fresh seeds). The pilot's stranded prereg
(evidence/2026-11-04/sim-fleerepair-a-prereg.md) binds this run except
where this file explicitly tightens a definition (escape corroboration,
arm-only starvation) — both tightenings are stated here BEFORE the sweep.

## Canon (read first, verified in this worktree)

- docs/CANON.md: grep for flee/barrier returns NOTHING (0 hits, verified
  2026-11-04 in this worktree) — no canon doc covers TB flee. What covers
  it instead: in-code law in src/js/game.js (tbBarrierExit) and Steve's
  2026-11-02 ruling that monsters do NOT flee while players CAN. This arm
  is PLAYER flee only: no monster-flee change, no gate/price/deed change,
  no default flip.
- Policy-side only: baseline = scripts/policies/competent.js VERBATIM
  (all gates at default); armed =
  scripts/policies/competent-fleerepair-a.js
  (COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, nothing else). The gated competent.js repair
  (directional branch only, legacy untouched, defaults untouched) is
  already in this worktree (commit c283f801c [needs-eyes]).

## Design (seeds, policy, horizon, instruments)

- Seeds 99601–99612, FRESH: verified 2026-11-04 — no evidence filename
  under evidence/2026-11-04/ contains 9960x, and no dated evidence .md
  under evidence/2026-11-04/ mentions any of 99601–99612. If a collision
  had been found the band would have moved and been stated; none was.
- Horizon 140 days, death-aware (dead villages stop simulating, +10d tail
  max, per the harness).
- Instruments (reused, not reinvented): scripts/fleerepair-driver-20261104.js
  (POLICY env), scripts/fleerepair-instrument-20261104.js,
  scripts/fleerepair-analyze-20261104.js,
  scripts/fleerepair-summarize-20261104.js, proof
  scripts/test-fleerepair-20261104.js. Corpus directory
  evidence/2026-11-04/perseed-fleerepair-a/ with NEW run tags
  (RUN=confirm-baseline / confirm-fleerepair) so no pilot file is ever
  overwritten (the driver refuses to overwrite).
- Driver/summarizer extension (the pilot-caveat fix, instrument-only):
  the driver saves per-seed scale/standing fields (see "Wall numbers"
  below) and the summarizer aggregates them instead of hard-coding 0.
  No src/js change, no new tooling, no policy change.
- SMOKE (not judged): a 2-seed smoke leg (99601, 99602, both legs) with
  the extended driver runs before the full sweep to prove the extension
  works. Smoke legs fold into the 12-seed corpus ONLY if no driver change
  follows them; if a fix is needed, the smoke outputs are deleted and
  re-run inside the full sweep. Nothing is judged from the smoke.
- SINGLE-BASE JUDGING: both legs run on this run's anchor (HEAD at sweep
  time). The pilot's numbers and the older tbfinish numbers are NEVER
  cited as this confirm's baseline (pilot caveat (b): base drift).
- BALANCED PANEL (§15): scripts/balance-panel.js does NOT accept a
  two-corpus comparison — it runs its own sweep-compare children, and
  its policies come from the sweep-compare registry. The fleerepair
  variant is not a registry policy, and registering it would contaminate
  the baseline child: the variant file sets COMPETENT_* env gates at
  require time, and sweep-compare loads the whole registry in every
  child process, so the baseline child would run armed. Per the stranded
  prereg's stated fallback, the comparison is therefore the pre-registered
  per-seed table + analyzer aggregates, with this reason stated — never
  a fabricated panel compare. Flagged to the coordinator: a true panel
  compare needs a contamination-free registry route, which is out of
  this arm's scope.

## Pre-registered metrics

- PRIMARY: escapes per TB exposure, and escapes per flee-triggered fight
  (a fight with >= 1 flee-attempt turn under the tbfinish classes).
  Escape = exposure end result 'fled' WITH transcript corroboration:
  the exposure's captured transcript must contain a barrier-crossing or
  escape say-line (e.g. "BARRIER CROSSED", "You escape"). A fled
  exposure with no such line is reported separately and does NOT count
  toward the >= 2 bar. (Tightening vs the pilot, stated before the
  sweep: the pilot's 2 escapes both carried such lines, and the pilot's
  own metric review asked the confirm to pre-register how a round-1
  escape is evidenced.)
- SECONDARIES: strikes per fight (all TB exposures; and lost fights
  only), median strikes in lost fights, median damage fraction dealt
  (ledger dealt / summed maxHp, tbfinish definition), barrier pushes per
  flee-triggered fight, zero-tile-move turns per fight, flee-attempt
  turns per flee-triggered fight.
- COST BAR (both halves must pass):
  (a) starvation deaths in the armed leg <= control total + 2, on totals
  AND on the arm-only reading. Arm-only is defined PRECISELY here
  (pilot metric review asked for this): starvation deaths in the death
  tele whose record is flagged player=true (the bearer whose flee
  behavior this arm changes). Both readings are reported regardless.
  (b) median survival (days) in the armed leg >= 0.8 x control median.
  Death-cause shares and median survival are reported for both legs
  regardless of the bar.
- AGGREGATE HARM: the prereg's harm tolerance IS cost-bar (b) (0.8x);
  the armed-vs-baseline median survival difference against a -10d line
  is additionally reported for transparency, but -10d is NOT a second
  hidden bar — the governing tolerance is the prereg's 0.8x.
- WALL NUMBERS (both legs, REPORTED, not judged — the confirm is too
  small to move them, as in the pilot): wins, national reached, table
  reached (sat: progState tableDone at end-state), table invited
  (progState tableWaiting at end-state), wave-4 faced (TB + field),
  wave-4 kills, wave-5 faced, median survival, max/peak standing.
  HONEST MEASUREMENT (pilot caveat (a) fixed): the driver saves
  scaleSamples (Game.scaleRank() every 30d, via runDays samples.scale)
  and standingSamples (Game.villageStanding().total, samples.standing),
  plus end-state rank/standing/arc/tableWaiting/tableDone and derived
  nationalReached (any sampled rank national/global, or final rank) and
  maxStanding. National/table are NEVER hard-coded 0. LIMITATION,
  disclosed: table is end-state only (this driver keeps no daily
  ever-entered history), so a sitting that was somehow lost before
  end-state would be missed; tableDone is sticky in practice, and any
  leg showing tableWaiting without tableEntered is reported as
  invited-not-sat. Scale sampling every 30d could in principle miss a
  transient rank excursion, but scale rank is a progression stage, not
  a transient flag; the final rank is also captured.

## GO threshold (confirm, judge strictly)

GO iff ALL THREE pilot bars still hold on the 12-seed confirm:

1. escapes >= 2 (across all TB exposures in the armed leg, corroborated
   per the definition above), AND
2. median strikes/fight (armed) >= median strikes/fight (baseline), AND
3. cost bar clean (both halves above).

A miss on ANY leg is NO-GO: kill cleanly — the lever does not land, the
competent.js gated change is reverted and the variant policy file
deleted per the pilot's kill rule (proof archived, not left dangling,
if it tests deleted code), and the evidence records the kill. If GO,
the arm is CONFIRMED; landing itself remains the coordinator's
--ff-only merge, pending ship.

## Sense-test (pre-registered)

Read transcripts of flee fights before and after (at least 2). Judge
meaning: does a repaired flee read as a person escaping, a person giving
up and fighting, or a robot? Flag anything robotic, static, or repeated.
A repaired flee that reads as a silent no-op loop is a sense NO-GO even
if the numbers pass, and will be reported as such.
