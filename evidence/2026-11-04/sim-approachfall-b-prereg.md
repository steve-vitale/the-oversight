# Pre-registration — sim-approachfall-b (Loop B run fleshout-loop-b-20261104T1030Z)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
go under "metric review" in the evidence file, for the NEXT run.

This is a BUILD arm, not a measurement arm: the fleerepair confirm (Loop A
0820Z) killed the flee-branch loop but proved the approach-path loop
remains (5 fights, 34 turns, fighters dying repeating "No path there"
every turn with no blocked-step fallback in the approach path). This arm
gives the approach path the same blocked-step treatment the flee branch
just got.

## Evidence read before designing (and one filename correction)

- evidence/2026-11-04/sim-fleerepair-confirm-a.md and
  sim-fleerepair-confirm-a-prereg.md (Loop A 0820Z confirm, GO).
- The brief names evidence/2026-11-04/sim-fleerepair-a.md; that file does
  NOT exist in this worktree. The pilot lives as
  evidence/2026-11-04/sim-fleerepair-adopt-a.md (adoption of the stranded
  0115Z arm) plus sim-fleerepair-a-prereg.md (stranded prereg). Those are
  what was read. Nothing was assumed about a missing file.
- Mechanism (confirm, "Mechanism gap"): after the flee repair marks a
  fight unfleeable, fight() falls through to CLOSE THE DISTANCE, which
  steps toward the tile adjacent to the weakest monster via findPath.
  That step fails on the same blocked geometry ("No path there"), the
  turn ends, and the next turn repeats it — 8–9 times, to death, with
  no strike-anyway, no wait, no re-pick of a different adjacent tile.
  The gap is PRE-EXISTING in baseline (baseline move-only zero-tile
  turns exist too); the arm did not introduce it.

## Canon (read first, verified in this worktree)

- docs/CANON.md: grep for flee/barrier/approach returns no TB-approach
  doc — no canon doc covers TB approach steps. What covers it instead
  is in-code law: src/js/game.js tbPlayerMove ("No path there" when
  findPath returns null; "Too far" when terrain cost exceeds moveLeft)
  and findPath (BFS over non-blocking terrain, no corner-cutting,
  eviction walls block), plus Steve's 2026-11-02 ruling that monsters
  do NOT flee while players CAN. This arm is PLAYER-side policy only.
- INTERPRETATION NOTE (stated so the coordinator can overrule): the
  brief says "minimal game-code fallback." The flee branch's treatment
  lives in scripts/policies/competent.js, not src/js — and the approach
  loop is a policy decision loop (the policy re-issues the same step).
  An engine-level fallback (e.g. tbPlayerMove auto-waiting) would change
  play for human players too and is NOT minimal. So this arm implements
  the fallback in competent.js, gated, mirroring the flee repair
  exactly: ZERO src/js changes, no gate/price/deed change, no default
  flip. If the coordinator reads "game-code" as src/js, this arm's
  placement is the thing to overrule, not its metric.

## The fix (gated, default off; gate COMPETENT_APPROACH_FALLBACK=1)

In scripts/policies/competent.js, CLOSE THE DISTANCE path only; the
gate-off path is byte-identical (proven by the gate-off control in
scripts/test-approachfall-20261104.js):

1. 3 consecutive zero-movement approach steps mark the fight
   approach-blocked (mirrors the flee repair's 3-stuck-turn mark).
2. A blocked fight first RE-PICKS a different adjacent tile with a
   real findPath route (tiles a step already failed on this geometry
   are blacklisted, so the "Too far" case cannot re-pick the same tile
   forever); a successful re-pick step clears the block.
3. With no reachable adjacent tile, the fight WAITS (tbPlayerWait,
   which auto-advances — never endTurn after it) so the monster's turn
   can change the geometry. After 5 frozen waits the step is re-probed
   once (a wall may have expired).
4. A monster-geometry change (live-monster positions) resets the
   state: fresh geometry = fresh attempts.
5. Strike-anyway is NOT a fallback: striking out of range is a
   documented no-op in the CLOSE THE DISTANCE comment ("striking out of
   range is a no-op that never advances the turn"). The fallbacks are
   re-pick, then wait — the two the confirm named as missing.

## Design (seeds, policy, horizon, instruments)

- Seeds 99801–99808, FRESH: verified 2026-11-04 — no evidence filename
  under evidence/2026-11-04/ contains 9980x, no dated evidence .md
  under evidence/2026-11-04/ mentions any of 99801–99808, and the same
  check against the main tree's evidence/2026-11-04/ is also clean.
  REJECTED band, stated so nobody re-uses it: 99701–99708 collides with
  sim-holdbeat-a.md / sim-holdbeat-a-prereg.md (every seed mentioned).
  If a collision had been found for 99801–99808 the band would have
  moved and been stated; none was.
- Horizon 140 days, death-aware (dead villages stop simulating, +10d
  tail max, per the harness) — the fleerepair confirm's substrate.
- Baseline = scripts/policies/competent.js VERBATIM (all gates at
  default). Armed = scripts/policies/competent-approachfall-b.js
  (COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, COMPETENT_APPROACH_FALLBACK=1, nothing
  else; DPS_RACE stays OFF). This is the confirm's substrate plus the
  new gate: the control is the verbatim policy, the armed leg is the
  confirm's armed leg plus the approach fallback. Attribution: the
  flee gates do not touch the approach path, so an approach-loop
  difference is attributable to the new gate; the confirm's armed legs
  are where the loops were observed, and the verbatim control is the
  conservative baseline (it shows fewer loops than a fleerepair-armed
  control would, since flee repair routes more fights into the
  approach fallthrough).
- Instruments (reused, not reinvented): the fleerepair instrument
  scripts/fleerepair-instrument-20261104.js verbatim (turn records
  with move-action pre/post positions, sayLines, hits); driver
  scripts/approachfall-driver-20261104.js (POLICY env, corpus
  evidence/2026-11-04/perseed-approachfall-b/, approachfall-s<seed>-
  <run>.json, refuses to overwrite); analyzer
  scripts/approachfall-analyze-20261104.js (loop definition below);
  summarizer scripts/approachfall-summarize-20261104.js; proof
  scripts/test-approachfall-20261104.js (ALL PASS before the sweep —
  re-run after any code change; no code changes after the proof run
  except the prereg commit itself, which touches no code).
- SMOKE (not judged): a 2-seed smoke leg (99801, 99802, both legs)
  runs before the full sweep to prove the driver works. Smoke legs
  fold into the 8-seed corpus ONLY if no driver change follows them;
  if a fix is needed, the smoke outputs are deleted and re-run inside
  the full sweep. Nothing is judged from the smoke.
- SINGLE-BASE JUDGING: both legs run on this run's anchor (HEAD at
  sweep time). The confirm's numbers are NEVER cited as this pilot's
  baseline (base drift, per the confirm's own caveat).
- BALANCED PANEL (§15): scripts/balance-panel.js does NOT accept a
  two-corpus comparison — its `compare` subcommand takes two
  panel.json.gz files produced by its own run(), which runs its own
  sweep-compare registry children, and the approachfall variant is not
  a registry policy. Registering it would contaminate the baseline
  child (the variant file sets COMPETENT_* env gates at require time;
  sweep-compare loads the whole registry in every child process), the
  same reason the confirm documented. Per the confirm's stated
  fallback, the comparison is therefore the pre-registered per-seed
  table + analyzer aggregates, with this reason stated — never a
  fabricated panel compare. Flagged to the coordinator: a true panel
  compare needs a contamination-free registry route, out of this arm's
  scope.

## Pre-registered metrics

- PRIMARY: approach-loop fights per leg. Definitions (fixed here,
  implemented in scripts/approachfall-analyze-20261104.js):
  - FAILED-APPROACH TURN: turn class 'move-only' (tbfinish analyzer)
    with >= 1 move action whose pre/post player pos is identical
    (zero-tile move), AND out-of-range at turn start. "No path there"
    say-lines are reported as corroboration, not required — the
    zero-displacement move action is the measurement.
  - MOVE TARGET: the first move action's args (tbPlayerMove cx, cy).
  - MONSTER SIGNATURE: turn.start.monsters key:mx,my,alive joined.
  - SAME-STEP RUN: maximal run of consecutive failed-approach turns
    with the same move target AND unchanged monster signature across
    the run. A re-pick (different tile), a wait turn, or a monster
    move breaks the run.
  - APPROACH-LOOP FIGHT: exposure outcome 'fighter-died' AND
    strikesLanded == 0 AND max same-step run >= 4. The threshold is 4,
    not 3: the fallback tolerates 3 failed steps before it fires, so
    a run of 4 proves the fallback did not break the loop. (A fight
    that dies on the monster turn after exactly 3 failed steps is a
    short fight, not a loop — the fallback never got its turn.)
- SECONDARIES: failed-approach turns per leg, max same-step run per
  leg, "No path there" lines per leg, zero-tile-move turns per leg,
  wait turns in fights with prior failed-approach turns, strikes per
  fight (all TB exposures; lost fights only), median damage fraction
  dealt (ledger dealt / summed maxHp, tbfinish definition), barrier
  pushes per leg, flee-attempt turns per leg, escapes per leg.
- COST BAR (both halves must pass):
  (a) starvation deaths in the armed leg <= control total + 2, on
  totals AND on the arm-only reading. Arm-only is defined PRECISELY
  (confirm's definition, kept): starvation deaths in the death tele
  whose record is flagged player=true. Both readings are reported
  regardless.
  (b) median survival (days) in the armed leg >= 0.8 x control median.
  Death-cause shares and median survival are reported for both legs
  regardless of the bar.
- WALL NUMBERS (both legs, REPORTED, not judged — the pilot is too
  small to move them, as in the confirm): wins, national reached,
  table reached (sat: progState tableDone at end-state), table invited
  (progState tableWaiting at end-state), wave-4 faced (TB + field),
  wave-4 kills, wave-5 UNLOCKED (maxWave >= 5 — the confirm's honesty
  correction: the summarizer's "wave5faced" label is really unlocked,
  not faced; no wave-5 spawn is evidenced unless a killRow or exposure
  carries it), wave-5 kills, median survival, max/peak standing, arc
  reached. The driver saves scale/standing fields per leg (confirm
  extension); national/table are NEVER hard-coded 0. LIMITATION,
  disclosed (same as confirm): table is end-state only, so a sitting
  lost before end-state would be missed; scale sampling every 30d
  could in principle miss a transient rank excursion, but scale rank
  is a progression stage and the final rank is also captured.

## GO threshold (pilot, judge strictly)

GO iff BOTH hold:

1. approach-loop fights == 0 in the armed leg, AND
2. cost bar clean (both halves above).

A miss on EITHER is NO-GO: kill cleanly — the lever does not land, the
competent.js gated change is reverted and the variant policy file
deleted per the confirm's kill rule (proof archived, not left dangling,
if it tests deleted code; the analyzer/driver/summarizer are
instrument scripts, not game code, and are archived with the evidence
either way), and the evidence records the kill. If GO, the arm is
PILOT-GO; landing itself remains the coordinator's --ff-only merge,
pending ship, and a confirm on fresh seeds is still owed before any
default flip is even proposed.

## Sense-test (pre-registered)

Read transcripts of loop fights before and after (at least 2 each if
available; if a leg has no loop fights, read the closest cases: fights
with failed-approach turns that ended by wait, re-pick, or death).
Judge meaning: does a repaired approach read as a person trying another
way in, waiting for the beast to come, or a robot? Flag anything
robotic, static, or repeated. A repaired approach that reads as a
silent no-op loop is a sense NO-GO even if the numbers pass, and will
be reported as such. This is the confirm's sense veto, applied here to
the approach path it was really about.
