# sim-abandonspeak-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-abandonspeak-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T153648Z).
Worktree sim-abandonspeak-b, branch sim-abandonspeak-b.
Sibling Loop A is live on scale-onramp — never touched.

## Blank

Next blank #1 from Loop B 1505Z (axis food-economy): the veto-budget
lever (confirmed GO, 1505Z) abandons a route after 3 silent vetoes
on the same step within a run (run-scoped, no dawn reset), but the
abandonment itself is NEVER spoken — sayLines were byte-identical
(5,295 lines) guard vs guard+budget on seed 67502, and a later pilot
showed 63 vetoes but only 6 spoken lines, silence through a kcal-0
stranding. Canon basis (docs/CANON.md, standing rules): "No silent
actions. Every action narrates honestly, including failures."

## Where the budget lives (found on current master before this prereg)

Policy-side ONLY, zero src/js: scripts/policies/competent-vetobudget-b.js
(installBudget wraps the guarded travelTo from
scripts/policies/competent-homewardstep-b.js; N=3, run-scoped
vetobudgetCounts / vetobudgetAbandoned in ctx, suppressions return
the veto block without invoking the guard). The guard's own veto
voice hook is Game.say("You don't walk there — you couldn't get
home from there.") on the FIRST veto of a destination; repeats are
silent by design. The budget therefore CAN speak through the exact
same hook: at the moment the Nth silent veto marks a step abandoned,
the budget wrapper calls Game.say once with the abandonment line.
This is the game's own narration channel (Game.say -> emit narration),
not a new channel and not a harness-only print: in a sim the driver
captures it in sayLines exactly as it captures the guard's veto line.

## The change (minimal, pre-declared)

In competent-vetobudget-b.js ONLY:
- Export one constant ABANDON_LINE, fixed text, second-person
  narration voice matching the guard's veto line, in-world wording,
  no programmer shorthand (no "veto", "budget", "abandon", "step",
  no coordinates, no counts):
  "You stop trying that way — it has turned you back again and
  again, and you will not spend another day on a road that will
  not open."
- At the single site where a step is added to vetobudgetAbandoned,
  call Game.say(ABANDON_LINE) once inside try/catch (narration must
  never break travel on failure).
- NOTHING else changes: N stays 3, no guard default flips, no new
  guard behavior, no suppression change, no budget reset change.
  Suppressed attempts stay silent (exactly one line per abandonment).

## Legs

- BASELINE (reused, not re-run): the 1505Z guard+budget-without-
  narration leg, evidence/2026-11-02/sim-vetobudget-qual-b-confirm-
  armed.jsonl, POLICY=competent-vetobudget-b, DAYS=60, same driver
  (scripts/vetobudget-confirm-b-driver.js), same env gates
  (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0).
  Verified before this prereg: 12 seeds 67501-67512, seed 67502
  carries exactly 1 abandonment (loopDay 51, step 4,4->4,1),
  29 suppressions, 5,295 sayLines. Re-running it would burn seeds
  for zero new information (the 1505Z reuse precedent); the pilot
  band below is its 67501-67508 subset.
- NARRATION (fresh, this arm): same driver, same env, same seeds,
  POLICY=competent-vetobudget-b after the change above. Only the
  policy file differs between legs.

## Pre-registered header (judge the run against this, never re-score)

- Primary metric: abandonment events with a spoken line / total
  abandonment events, on the pilot band. An event counts as spoken
  iff sayLines contains ABANDON_LINE with scholar day equal to the
  abandonment loopDay, and total spoken lines equal total
  abandonments (exactly one per event, no repeats).
- GO (all must hold):
  (a) Primary = 100% on the pilot band;
  (b) No-harm bars vs the reused baseline subset on identical
      seeds, each within 0.95x-1.05x: median survival, deaths
      (total), mean daily haul (successful-forage added kcal /
      loop days, same definition both legs), away day-ends,
      forageTrips (forage attempts). Away is a count, so its bar
      is ALSO stated absolutely: narration away <= baseline away + 2;
      the ratio bar governs where the count is non-trivial.
  (c) sayLines diff confined: the narration leg's sayLines sequence
      equals the baseline sequence with ONLY ABANDON_LINE insertions
      (no other line added, removed, or changed), verified per seed;
  (d) Identity: per-seed per-loopDay snapshots (pos, scholar kcal,
      pantry kcal, roster count + id set) show 0 divergent
      day-records vs baseline.
- Horizon: 60d, death-aware (dead villages stop, +10d tail max via
  the driver), never a fixed 200d.
- Seeds: pilot band 67501-67508 (8 seeds; abandonment known on
  67502). PILOT GATE: 8 seeds before any confirm spend.
- Policies: guard+budget (baseline, reused) vs guard+budget+narration.
- If the pilot shows 0 abandonments (band drift): STOP and report
  DIAG-NO-BAND — do not widen silently. Pre-declared single extra
  screening band, usable once: 67601-67608 (8 seeds, same driver /
  horizon / env). After that band, stop whatever it shows.
- Confirm spend: only if the pilot GO holds AND a confirm is
  warranted; the pilot band already carries the judged abandonment,
  so a 12-16 seed confirm is NOT pre-committed — the coordinator
  decides from the pilot result. Any confirm would reuse the same
  header and thresholds on fresh seeds.

## Instruments (this arm, committed with the results)

- scripts/test-abandonspeak-b.js: fake-Game proof of installBudget
  narration — exactly one ABANDON_LINE say per abandonment, zero
  on spoken/silent vetoes below N, zero on suppressions, zero on
  passthrough calls, narration failure never breaks travel, line
  text contains no veto/budget/abandon/step/coordinate wording.
- scripts/analyze-abandonspeak-b.js: reads baseline + narration
  JSONL, reports primary metric, no-harm bars, sayLines-diff
  confinement, and per-seed identity divergence. Exit 0 on parse;
  verdict in text.
- scripts/abandonspeak-b-driver.sh (thin wrapper, optional): runs
  the existing confirm driver for the narration leg with the fatal
  env gates, stdout -> JSONL (driver never writes files itself).

## Balanced panel (section 15, context only)

A combined panel campaign may be run as context, exactly as on the
1505Z arms. Panel rows must NEVER be pooled with driver bars (known
panel/driver substrate divergence class — report separately).

## Wall numbers (reported every run, in-window only)

national / table / wins, wave 4-5 unlocks, median survival — from
the judged driver, never pooled across arms.

## Metric review (section, filled in the results file)

Every evidence file carries a "metric review" section for the NEXT
run; a miss here is NO-GO, never re-scored mid-run.
