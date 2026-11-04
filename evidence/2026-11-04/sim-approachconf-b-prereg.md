# Pre-registration — sim-approachconf-b (Loop B run fleshout-loop-b-20261104T1212Z)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
go under "metric review" in the evidence file, for the NEXT run.

This is the CONFIRM of the approachfall pilot (Loop B run
fleshout-loop-b-20261104T1030Z), which returned GO-THIN: both written bars
passed, but baseline carried ZERO loop fights and the armed fallback never
fired in a live sim, so the pilot could not distinguish "fallback works"
from "no loop exists here". Baseline blocked steps were all flee walks,
not approach steps. This confirm is designed so it CAN distinguish that.

## Evidence read before designing

- evidence/2026-11-04/sim-approachfall-b.md and
  sim-approachfall-b-prereg.md (pilot: GO-THIN, seeds 99801–99808).
- evidence/2026-11-04/sim-winnability-round-1030.md (approachfall
  section + metric review: the confirm needs a loop-producing band and a
  baseline-signal bar).
- evidence/2026-11-04/sim-fleerepair-confirm-a.md (Loop A 0820Z
  confirm, GO: the 5 approach-loop fights, 34 turns, were observed on
  its band — the reason band 99601–99612 is the screen's first
  candidate, see Stage 0).

## Canon (read first, verified in this worktree)

- docs/CANON.md: no canon doc covers TB approach steps (the pilot's
  finding, re-verified: grep for flee/barrier/approach returns no
  TB-approach doc). What covers it instead is in-code law: src/js/
  game.js tbPlayerMove ("No path there" when findPath returns null;
  "Too far" when terrain cost exceeds moveLeft) and findPath (BFS over
  non-blocking terrain, no corner-cutting, eviction walls block), plus
  Steve's 2026-11-02 ruling that monsters do NOT flee while players
  CAN. This arm is PLAYER-side policy only.
- No gate/price/deed/standing change. No src/js change. The variant
  already lives on master (scripts/policies/competent-approachfall-b.js)
  and is used VERBATIM: if it does not apply cleanly at this anchor,
  STOP and report drift — do not hand-edit it into shape. Verified at
  prereg time: `git diff HEAD` for competent.js and
  competent-approachfall-b.js is empty, and scripts/
  test-approachconf-20261104.js is green at this anchor, including
  the variant-gates-exact check.

## Instrument (the fix that makes this confirm distinguishable)

The pilot's analyzer classified failed-approach turns with the CLOSEST
monster's distance (tbfinish outOfRangeAtStart = minDist > range). The
approach branch in competent.js keys on the WEAKEST monster (lowest hp
alive), so that predicate misclassifies whenever a nearer monster is in
range while the weakest is out of range (and vice versa). The confirm
analyzer (scripts/approachconf-analyze-20261104.js, proven by scripts/
test-approachconf-20261104.js, including a fixture where the pilot
predicate scores 0 and the confirm predicate scores 1) classifies every
zero-tile move-only turn by the WEAKEST monster and splits blocked
steps into three reported classes:

- APPROACH-STEP: weakest monster OUT OF RANGE at turn start. The only
  class the CLOSE THE DISTANCE branch can produce (it runs only when
  Chebyshev distance to the weakest > weapon range). No adjacency
  requirement: the issued step may be an intermediate path step, not
  the final adjacent tile.
- FLEE-WALK: weakest monster IN RANGE at turn start AND the move
  target is NOT adjacent to the weakest monster. The approach branch
  cannot run while the weakest is in range (it would strike), so such
  a step is a flee-branch / edge walk, not an approach step. This is
  the pilot's reclassification, stated exactly and now implemented.
- OTHER-BLOCKED: weakest IN RANGE with an adjacent target, or weakest
  distance / weapon range unreadable (null). Reported separately,
  counted in NEITHER the approach nor the flee class.

APPROACH-LOOP FIGHT (unchanged from the pilot, weakest-based now):
exposure outcome 'fighter-died' AND strikesLanded == 0 AND max
same-step run >= 4, where a same-step run is consecutive APPROACH-STEP
turns with the same move target AND unchanged monster signature.
Threshold 4, not 3: the fallback tolerates 3 failed steps before it
fires, so a run of 4 proves it did not break the loop.

FALLBACK-FIRED COUNT (proxy, stated honestly): the instrument records
no policy fallback flag, so firings are counted as transcript-
consistent events — after a run of >= 3 same-target approach steps
(the mark point), a turn that waits (wait), moves to a different
target (repick-moved), or zero-tiles to a different target on
unchanged geometry (repick-attempt; the unblocked primary path is
deterministic, so it cannot change target on its own). A failed
re-pick that re-issues the same target, or a wait for an unrelated
reason, can blur this proxy in either direction. It is reported as
"fallback-consistent events", never as a direct policy counter.

## Design (staged; the screen gates the confirm)

- Horizon 140 days, death-aware (dead villages stop simulating, +10d
  tail max), same as the pilot. Policy: competent verbatim (baseline)
  vs scripts/policies/competent-approachfall-b.js (armed:
  COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, COMPETENT_APPROACH_FALLBACK=1, nothing
  else; DPS_RACE off). Driver: scripts/approachconf-driver-20261104.js
  (approachfall driver with the corpus moved to evidence/2026-11-04/
  perseed-approachconf-b/ and RUN tags 'baseline' / 'armed');
  summarizer scripts/approachconf-summarize-20261104.js (suffix
  filter on the run tag — the pilot's filter footgun, fixed: a filter
  of '-baseline' matches only files whose name ends in '-baseline').
  Proof scripts/test-approachconf-20261104.js ALL PASS before the
  screen; no code changes after the proof run except this prereg
  commit itself (evidence only).
- STAGE 0 — BAND SCREEN (baseline leg only, competent verbatim):
  screen candidate band 99601–99612 (the fleerepair confirm band,
  where approach loops were actually observed). The baseline leg run
  here is a NEW leg (verbatim competent, flee repair OFF) — it is not
  a re-judgement of the fleerepair confirm's corpus, which used
  different policies. BASELINE-SIGNAL BAR: the confirm proceeds ONLY
  if the screened band yields >= 1 baseline approach-loop fight.
  If 99601–99612 yields 0, screen ONE second band: 99901–99912.
  Freshness of 99901–99912, checked 2026-11-04 by the prior runs'
  standard: no evidence filename under evidence/2026-11-04/
  contains 9990x/9991x, and no dated evidence .md under
  evidence/2026-11-04/ mentions any of 99901–99912. (Full-text grep
  of the giant tracer .jsonl files hits digit substrings inside
  unrelated counters, so — as in prior preregs — the standard applied
  is filenames + dated .md, not tracer internals.) Justification for
  99901–99912 as the second band: it is fresh under that standard and
  uncollided with every named band in this run's brief (99801–99808
  pilot band, already known 0, NOT reused; 99701–99708, which collide
  with holdbeat-a, NOT reused). If BOTH bands yield 0, STOP: verdict
  is NO-SIGNAL (the fallback is unexercised on every band screened —
  NOT a kill of the fallback, NOT a GO), report the per-band loop
  counts, and do not run a confirm.
- STAGE 1 — CONFIRM (only if the signal bar passes): 12 seeds —
  the band that passed the screen — baseline vs armed on IDENTICAL
  seeds, same policy/horizon as the pilot. The screen's baseline legs
  ARE the confirm's baseline legs (no re-run: the screen already ran
  them under the confirm's exact policy/horizon); only the armed legs
  are added. If the second band is the one that passes, its 12
  baseline legs are likewise the confirm baseline.
- SINGLE-BASE JUDGING: all legs run on this run's anchor (HEAD at
  sweep time). The pilot's numbers are NEVER cited as this confirm's
  baseline (base drift).
- BALANCED PANEL (§15): scripts/balance-panel.js does NOT accept a
  two-corpus comparison — its `compare` subcommand takes two
  panel.json.gz files produced by its own run(), which runs its own
  sweep-compare registry children, and the approachfall variant is not
  a registry policy. Registering it would contaminate the baseline
  child (the variant file sets COMPETENT_* env gates at require time;
  sweep-compare loads the whole registry in every child process), the
  same reason the pilot and the fleerepair confirm documented. The
  comparison is therefore the pre-registered per-seed table +
  analyzer aggregates, with this reason stated — never a fabricated
  panel compare. A contamination-free registry route remains flagged
  to the coordinator as the missing piece for a true panel compare.

## Pre-registered metrics (confirm)

- PRIMARY: approach-loop fights per leg (definition above).
- SECONDARIES: approach-step turns, flee-walk turns, other-blocked
  turns, max same-step run, "No path there" lines, zero-tile-move
  turns, wait turns in fights with prior approach steps,
  fallback-consistent events + fights with >= 1 such event (armed
  leg; baseline leg reported for contrast, where the same transcript
  shapes can occur without the gate), strikes per fight (all TB
  exposures; lost fights only), median damage fraction dealt (ledger
  dealt / summed maxHp, tbfinish definition), barrier pushes, flee-
  attempt turns, escapes.
- COST BAR (copied exactly from the pilot prereg — do not loosen):
  (a) starvation deaths in the armed leg <= control total + 2, on
  totals AND on the arm-only reading. Arm-only is defined PRECISELY
  (pilot/confirm definition, kept): starvation deaths in the death
  tele whose record is flagged player=true. Both readings are
  reported regardless.
  (b) median survival (days) in the armed leg >= 0.8 x control median.
  Death-cause shares and median survival are reported for both legs
  regardless of the bar.
- WALL NUMBERS (both legs, REPORTED, not judged): wins, national
  reached, table reached (sat: progState tableDone at end-state),
  table invited (progState tableWaiting at end-state), wave-4 faced
  (TB + field), wave-4 kills, wave-5 UNLOCKED (maxWave >= 5 — the
  pilot/confirm honesty correction: the summarizer's "wave5faced"
  label is really unlocked, not faced; no wave-5 spawn is evidenced
  unless a killRow or exposure carries it), wave-5 kills, median
  survival, max/peak standing, arc reached. National/table are NEVER
  hard-coded 0; the driver saves scale/standing fields per leg.
  LIMITATION, disclosed (same as pilot): table is end-state only, so
  a sitting lost before end-state would be missed; scale sampling
  every 30d could in principle miss a transient rank excursion, but
  scale rank is a progression stage and the final rank is also
  captured.

## GO threshold (confirm, judge strictly)

GO iff ALL hold:

(a) armed approach-loop fights == 0 on the confirm band, AND
(b) baseline approach-loop fights >= 1 (the signal bar, restated for
    the confirm band), AND
(c) cost bar clean (both halves above).

A miss on ANY is NO-GO: kill cleanly — the lever does not land, and
the evidence records the kill (the variant file itself is the
coordinator's to revert/delete per the pilot's kill rule; this arm
does not rewrite master history).

FALLBACK-FIRING QUALIFIER (pre-registered, not a re-score): a GO
with 0 fallback-consistent events in live sims is GO-THIN, not GO —
the same vacuity the pilot suffered, stated in the verdict itself.
A GO with >= 1 fallback-consistent event AND a baseline loop fight
that the armed leg demonstrably breaks (same-seed trajectory or
aggregate shape) is GO. A GO where the armed leg shows 0 loops but
its fallback events never appear in a fight that would otherwise
loop is GO-THIN even with events elsewhere — say which.

NO-SIGNAL (Stage 0 outcome, not a kill): both screened bands yield 0
baseline approach-loop fights. The fallback is unexercised on every
band screened. No confirm is run, no kill is recorded, and the next
blank is a band that produces approach loops (or a stub-level proof
that the live geometry producing them no longer exists).

## Sense-test (pre-registered)

Read transcripts of at least one baseline loop fight (if any exists)
and one armed fight where the fallback fired (if any fires). Judge
meaning: does the fallback read as a person repositioning (trying
another way in, waiting for the beast to come), or a robot? Flag
anything robotic, static, or repeated. A repaired approach that reads
as a silent no-op loop is a sense NO-GO even if the numbers pass, and
will be reported as such. If no loop fight exists (NO-SIGNAL path),
read the most-blocked baseline fights instead and say so.
