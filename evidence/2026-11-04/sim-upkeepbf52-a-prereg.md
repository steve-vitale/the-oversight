# sim-upkeepbf52-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261105T0115Z, arm
sim-upkeepbf52-a, axis food-economy. Worktree sim-upkeepbf52-a.
Pinned base: c498e05ff (worktree HEAD at prereg writing time).
NO game-code change, NO policy change, NO gate/price/deed-bar/win-price
change in this arm — measurement only. Zero src/js expected.
Sibling trees never touched; main tree never touched; hidden_files
never touched (coordinator owns backlog/tracker/claims). Nothing
pushed, bumped, or live-verified by this worker (coordinator merges
via --ff-only); report 'merged locally, pending ship' readiness.

## The finding under adjudication

From Loop A arm sim-bankretain-substrate-a, run
fleshout-20261104T2230Z (evidence/2026-11-04/
sim-bankretain-substrate-a.md §2/§4 and its out-of-scope findings):

- Event 17021/52: stranded evening loop-day 52 (thicket 8,8, no-op
  flip), evening pack 3x Muscadine Grapes (90 kcal each, spoilDay
  56) = 270 kcal, carried (delta 0). First-upkeep scholarDay 53:
  grapes intact, all 3 units. Morning phase (daily-entry, loop-day
  53): packBefore edible 0, skip 'no-pack-food', kcalBefore 2310
  (first-upkeep kcal 128) — the 270 grapes were eaten in the
  upkeep window, mixed with pantry draws (gain 2182, of which
  270 pack + 1912 pantry).
- The finding's narration claim ("leaves no narration line") was
  read off bankfood-trace-b's capture, which records say lines
  only around daily() — the upkeep window where competentEat
  speaks was never recorded. CAUTION from the finding itself and
  from the 2115Z arm (evidence/2026-11-04/
  sim-upkeepbreakfast-a-verification-postmerge.md): the prior
  16505 instance closed as a capture artifact (engine meal beat
  speaks inside the upkeep window). This 17021/52 instance must
  be adjudicated with a full-transcript instrument before any
  hook work, not assumed a new silence.

Event-key vs morning mapping, stated to prevent misreading: the
event key names the stranded EVENING (loop-day 52); the
adjudicated morning is loop-day 53 / scholarDay 53 (first-upkeep
snapshot scholarDay 53 -> daily-entry loop-day 53).

## Instrument (adapted, not rebuilt blind)

Reuse the 2115Z full-transcript instrument (scripts/
upkeepbreakfast-a-lib.js, sweep-upkeepbreakfast-a.js, and their
proof), adapted as scripts/sweep-upkeepbf52-a.js (same policy
stack, same env gates, renamed corpus dirs/files) and scripts/
upkeepbf52-a-lib.js + analyze-upkeepbf52-a.js. ONE adaptation,
forced by the finding's own numbers and disclosed here before
any judged sim:

- The 2115Z lib's exact-chain qualification (pack drop == kcal
  gain) DISQUALIFIES this case by construction: pack drop 270
  != kcal gain 2182, because competentEat's pantry draws add
  1912 kcal inside the same upkeep window (the substrate arm's
  third backlog item: remote pantry draws while stranded away).
  Applying the exact-chain rule here would refuse to judge the
  very case this arm exists to adjudicate.
- Primary adjudication therefore uses a PACK-PINNED rule: the
  meal is pinned to the upkeep window by pack stacks alone
  (first-upkeep stacks -> daily-start stacks: Muscadine Grapes
  3 units / 270 kcal present, then gone; no other pack edible
  lost). The daily-entry morning phase runs AFTER the
  daily-start snapshot, so it cannot have eaten the grapes;
  the only window that can have removed them is upkeep.
- The exact-chain verdict is still computed and reported for
  every window (comparability with the 2115Z arm), but it does
  NOT gate the primary verdict. The pantry-draw mixture is
  reported as context, not hidden and not used to disqualify.

## Pre-registered metrics (binding)

Primary metric: adjudication of the 17021/52 case (morning
loop-day 53 / scholarDay 53), NARRATED vs SILENT, on the
guard leg AND the ON leg separately (both legs judged; a
leg split is reported as a split, never averaged away):
- NARRATED iff >= 1 upkeep-window eat line ("You eat ...")
  in that morning's upkeep calls; NAMED iff it names
  Muscadine Grapes. The exact quoted line and window are
  the evidence.
- SILENT iff no upkeep-window eat line in that morning's
  upkeep calls. Daily-call eat lines are quoted separately
  and NEVER counted toward the verdict.

Secondary metric: count of additional pack-pinned upkeep
meals (pack edible drop > 0 in the upkeep window) in the
same screened corpus (seed 17021, both legs, all morning
windows except the primary), each classified NARRATED vs
SILENT by the same upkeep-window rule, with the exact-chain
vs pantry-mixed split reported.

## Decision rule (either verdict completes the arm)

- NARRATED on the primary (either leg narrated; both legs
  reported) -> close the finding as a capture artifact in
  the evidence (quote the line). No hook, no src/js.
- SILENT on the primary (both legs silent, or a leg split
  with at least one silent leg characterized) -> write a
  SPEC-READY hook spec as text in the evidence (exact line,
  window, and trigger condition) and land NO src/js change
  in this arm — the hook itself is a follow-up arm.
- No gate, price, deed bar, or win price changes under any
  verdict.

## Staged measurement (§§9-12, 14-15)

- Horizon: 60 days, the substrate horizon of the case (seed
  17021 survived 60 days in the substrate arm; death-aware
  stop applies — dead villages stop, +10d tail max).
- Seeds: 17021 ONLY for the primary (this is a single-case
  adjudication, not a lever sweep). Legs: guard (WOODWARM=0)
  and ON (WOODWARM=1), the same two legs the substrate arm
  judged. Policy stack: nighttravel + woodcarry + woodwarm +
  bankfood, env gates identical to sweep-upkeepbreakfast-a.js
  (COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, BANKFOOD=1, DAYS=60).
- Pilot gate (§9): no lever exists to pilot, so no 8-seed
  pilot and no 12-16 confirm spend apply; the reproduction
  itself (17021 x 2 legs) IS the judged run, and either
  verdict completes the arm per the decision rule above.
  Running extra seeds would manufacture activity, not
  evidence, for a single-case verdict.
- Metric binding (§14): the pack-pinned primary above binds
  the run. A miss is NO-GO for the claimed verdict, never
  re-scored against a friendlier window (daily lines never
  count; a daily eat line does not rescue a silent upkeep).
  Any metric revision goes under "metric review" for the
  NEXT run.
- Balanced panel (§15): scripts/balance-panel.js cannot
  express the nighttravel+woodcarry+woodwarm strand stack,
  the 60-day morning-window census, or an env-gated
  single-case adjudication (same declaration as every prior
  strand arm). Comparison here is guard-vs-ON legs on
  identical seeds through the bf52 analyzer, never labeled
  a panel comparison. No game-code change was made, so no
  panel comparison is owed.
- Convergence state: n/a (adjudication, not tuning). Reported
  as: adjudication, not a lever.

## Proof (before any judged sim)

scripts/test-upkeepbf52-a.js: pure checks (pack-pinned meal
detection incl. the 17021/52 shape, narration verdict window
rules incl. daily-never-counts, exact-chain vs pack-pinned
split) must be green BEFORE the judged sweep runs. Corpus
checks (env-gated, same pattern as test-upkeepbreakfast-a.js)
run after the sweep and assert the verdict is COMPUTED, never
WHICH verdict — baking in NARRATED or SILENT would turn the
measurement into a tautology.
