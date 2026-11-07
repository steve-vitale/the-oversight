# sim-mealday-caller-a — DIAG: identify the second villagerMealDay caller (measurement only)

Run: oversight-flesh-out-loop, run fleshout-20261107T1615Z (Loop A), arm
sim-mealday-caller-a, axis food-economy. Worker tree:
~/workspace/worktrees/sim-mealday-caller-a, branch sim-mealday-caller-a.
DIAG ONLY: zero src/js game changes. No fix is built here; if the caller
turns out to be a real bug, the fix shape is documented in the evidence
file and the fix itself is a LATER run's arm with its own prereg.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder) and
docs/BALANCING.md (2,000 kcal/day adult need). The mechanism under test is
game code, not canon: villagerMealDay (src/js/game.js) feeds at-haven
villagers from the pantry (pantryDraw) and away villagers ONLY from their
pack (packMeal). No canon doc covers how many times a day a villager's
meal is computed, or a second meal caller — if the measurement names one,
it is a finding, not canon. No canon doc is invented here.

## Substrate note (recorded before sims)

This worktree's HEAD is 4ce3c0c1f ("measurement-proof refresh on
finish-instrument rebased tip"). `git log HEAD..master` is non-empty
(master has moved on since this branch was cut — e.g. journey-landing
r115 commits eac2bfc4d, 5b2dd06ed). Per the task, this worker does NOT
rebase and does NOT merge — the coordinator lands the work. The dedupe
phenomenon was measured on base c92a873f4 (awayconfirm-a measurement
base); this diag runs on 4ce3c0c1f, so fire counts may differ from the
corpus even with the recorder off — the neutrality proof below (trace-off
vs trace-on on THIS base) is what judges the recorder, and reproduction
of the phenomenon is judged on this base's own trace-off runs.

## The question (findings backlog, sim-awayconfirm-a)

The awayconfirm-a 100-seed corpus (seeds 98000–98099, competent, 150d)
recorded 141 meal-row dedupe fires: a second villagerMealDay caller
replaces (vid,day) meal rows, last call wins. The instrument handled it
and the analyzer audit passed, but the second caller is unidentified.
This arm names it, with call counts, and classifies each fire as benign
or a real bug.

Static facts established BEFORE sims (grep, src/js, this base — hypotheses
to test, not conclusions):
- Exactly ONE direct call site of villagerMealDay in all of src/js:
  src/js/game.js:32246, inside villageEats(), the per-villager loop
  `this.villagerMealDay(id, person, v, { cookId })`.
- Exactly ONE call site of villageEats() in all of src/js:
  src/js/game.js:33167, inside endDay().
- The safetynets.js rationing wrapper (safetynets.js:1493–1506) wraps
  villagerMealDay but calls through exactly once per call.
- endDay() runs villageEats() BEFORE `scholar.day += 1` (day increments
  later in endDay), so two endDay/villageEats executions with the same
  scholar.day value would produce same-(vid,day) duplicate calls.
- Prior runs already knew a second caller exists: game.js:30572–30575
  ("the second villagerMealDay caller found by pantrystarve/fullpantry")
  and the awayconfirm sweep header (23 dups / 8,685 rows in pantrystarve).

Hypotheses the recorder discriminates:
- H1 — villageEats runs twice for the same scholar.day (double endDay,
  or a second day-boundary path): the two calls carry DIFFERENT
  villageEats invocation ids.
- H2 — the same vid is hit twice inside ONE villageEats pass (roster
  duplicate): the two calls share ONE invocation id, different sequence
  numbers.
- H3 — anything else the stack shows (a call path the static grep missed,
  e.g. a re-entrant or aliased call): classified from the recorded stack.

## Seed selection — DEVIATION from the task brief, recorded with reason

The task brief suggests reusing seeds 98000–98007. Checked BEFORE sims
against the awayconfirm corpus summary
(evidence/2026-11-07/awayconfirm-a-corpus/sweep-competent.json): seeds
98000–98007 fired ZERO dedupes (0/141). The fires concentrate: 19/100
seeds fired, max 21 on one seed. Running 98000–98007 would measure
nothing. Pilot seeds are therefore the 8 HIGHEST-FIRE seeds from the
corpus — 98067 (21), 98052 (16), 98079 (10), 98062 (9), 98034 (8),
98095 (8), 98022 (7), 98028 (7) = 86 known fires on the measurement
base. This is a diag recorder, not a before/after lever: seed reuse is
the point (reproduce the same fires on the same substrate), selection on
the fire count is the correct design for identifying a caller, and no
lever claim rides on these seeds — so the band-freshness reservation rule
for fresh lever bands does not apply. Documented explicitly here per the
brief. Extension seeds (next 8 by fire count): 98051 (7), 98029 (6),
98065 (6), 98081 (6), 98092 (6), 98093 (6), 98099 (6), 98012 (5) = 50
fires. No other seeds are run.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-mealday-caller-a (HEAD 4ce3c0c1f, see substrate
  note). Policy: competent ONLY (scripts/policies/competent.js,
  UNMODIFIED). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1. Horizon: 150d death-aware cap (dead villages stop;
  runDays endReason recorded per seed; no fixed-200d run).
- Instrument: scripts/sweep-mealday-caller-a.js, derived from
  scripts/sweep-awayconfirm-a.js (same loadGame/setupGame/runDays,
  same death capture, same meal-row shape). Env-flagged recorder:
  MEALDAY_TRACE=1 arms the call-site recorder; MEALDAY_TRACE=0 (or
  unset) runs the awayconfirm-shaped meal wrapper only (neutrality
  baseline). The recorder wraps Game.villagerMealDay AND Game.villageEats
  (invocation counter) and, per call, records: stack-derived call site
  (first frame below the wrapper — caller function/file/line), day, vid,
  away flag, villageEats invocation id + sequence within the invocation,
  whether a (vid,day) row already existed (dedupe fire), and the call's
  result (ate, drawn, fasting) plus hunger/health before/after. The
  recorder READS ONLY: no Math.random, no state writes, no say/tele.
  Stack capture (new Error().stack) reads no RNG and writes no game
  state. The wrapper calls the original exactly once per call.
- Seeds: pilot P1 = 98067, 98052, 98079, 98062, 98034, 98095, 98022,
  98028 (8 seeds, 86 known fires). The sweep mechanically refuses any
  seed list other than exactly P1 or exactly P2 (extension, below);
  DAYS must be exactly 150; PLENTYDEPRI=1 and DEPOSITGATE=1 are
  FATAL-asserted. Each pilot seed runs TWICE: trace-off (baseline) then
  trace-on (recorder). The runner refuses to run once a line-start
  VERDICT-RENDERED line exists in the evidence file.
- NEUTRALITY GATE (judged before any fire is classified): trace-on vs
  trace-off trajectories must match EXACTLY on all 8 pilot seeds —
  daysAlive, death rows (day/who/cause), and meal rows (vid/day/away/
  ate/drawn/fasting) identical. Any mismatch = recorder NOT neutral =
  DIAG-NO-GO on instrument; stop, do not classify.
- EXTENSION RULE (fixed before sweeping): if the pilot reproduces < 4
  dedupe fires total on this base, run P2 once (same off/on pair).
  If pilot + extension together reproduce 0 fires, the verdict is
  DIAG-NO-GO on sample (phenomenon did not reproduce on this base;
  the recorder is still proven by the proof test's synthetic fires).
  No further seeds are run.
- DET-GATE (DIAG-GO iff ALL hold):
  1. Neutrality gate passes (exact match, all pilot seeds; extension
     seeds too if P2 ran).
  2. The recorder captures a call site on 100% of reproduced dedupe
     fires (zero fires with a missing/empty call site).
  3. Every reproduced fire is classified H1 / H2 / H3 with counts, and
     zero fires are UNCLASSIFIED.
  4. The named caller(s) and their per-seed fire counts are reported.
  5. Each fire is classified benign vs bug from its recorded first/second
     call data (see below), with the classification rule stated in the
     evidence file and at least one quoted fire per class that occurs.
- BENIGN vs BUG rule (fixed before sweeping): compare the second call
  against the first call's recorded end state for the same (vid,day).
  BENIGN iff the second call's observable end state equals the first's:
  same ate, same drawn, same hunger-after and health-after — a pure
  re-record with no state effect (last-wins rewrites identical data).
  BUG iff the second call changes anything that persists: drawn2 > 0
  (a second real pantry/pack draw — the villager ate twice), or
  hunger-after differs (the extra +25..40 hunger tick stuck), or
  ate2 != ate1 with the row overwritten (a meal lost or double-counted
  in the record the analyzer judges). villagerMealDay always adds
  hunger (+25 + floor(rand*15)) and usually draws, so the prior is
  BUG-leaning — but the recorded data decides, not the prior.
- SENSE (SENSE-TESTING LAW): for at least one fire per class that
  occurs, read the seed's transcript window and say in plain words what
  the villager did that day — did they eat twice, lose a meal, or
  nothing visible happen. Counts alone do not close this arm.
- §15 balanced panel: not applicable — this is a single-policy diag
  with no before/after comparison arm (same known failure class as
  awayconfirm-a: the panel ingests panel.json.gz before/after outputs).
  The neutrality off/on comparison table stands in its place.

## WATCH (not the verdict)

- The awayconfirm corpus on the old base showed away meal adequacy
  (0.996) EXCEEDING haven (0.984); if the second caller turns out to
  double-draw only for away villagers, that asymmetry is a lead, not a
  verdict — the fire classification decides.
- The safetynets rationing wrapper halves kcalPerDay during the call and
  restores it in a finally; if a dedupe fire coincides with rationing
  days, the recorded ctx (rationing state) is noted but does not change
  the benign/bug rule.

## Metric review (to fill post-run)

- (filled in the evidence file after the run; a miss is NO-GO, never
  re-scored against a friendlier gate.)
