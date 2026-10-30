# sim-effdebt-b — PREREGISTRATION (written BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1928Z,
arm sim-effdebt-b, axis food-economy (forage effort debt below zero).
Worktree sim-effdebt-b. DIAG FIRST: census + mechanism + verdict.
A fix follows ONLY if the conditional below triggers; otherwise
DIAG ONLY, zero src/js changes, zero policy-default changes.
Sibling loop A trees, gapscomp-*/journey* trees, and the main
tree are never touched.

## The question (backlog #1552, sim-findings.md 2026-10-30)

Loop-B arm sim-wakeforage-b (evidence/2026-10-30/
sim-wakeforage-b.md) found a forage press at 0 kcal executes
and drives kcal to −60 (15215 ON days 10, 14), restored only
by eating afterwards. Open: is negative-kcal effort an
intended "effort debt", or a missing clamp? That question is
this arm. Nothing here re-judges wakeforage's yield verdicts.

## Canon (read before judging)

- docs/CANON.md read first, then docs/TIME-ECONOMY.md
  (forage 16 ticks + 60 kcal effort; metabolic burn ~2200
  kcal/day; eat 1 tick + 0 kcal), docs/BALANCING.md
  (scholar needs 2,200 kcal/day), docs/PRESERVATION.md
  (food ladder; not the cost path, read for the eat step
  that restores debt). No canon doc covers negative-kcal
  effort or a forage funds-check, so the mechanism below
  is a code read, stated, not invented canon.
- No-silent-actions (CANON.md standing rule): every action
  narrates honestly, including failures. Whether a negative
  press says anything about going negative is therefore
  itself a judged item, not decoration.
- Perception law (Steve 2026-10-28, binding): the census
  records only what the villager's own presses do and what
  its own say lines show. No roster, snapshot, or list-fed
  attribution is used for any number below.

## Engine facts (code reads, before any judged sweep)

- Forage cost path (src/js/game.js, doAction 'forage'
  branch): after a successful sweep, `scholar.kcal -=
  S.calories.ACTION_COSTS.forage` (60, src/js/engine/
  calories.js ACTION_COSTS). The line is UNCLAMPED: no
  Math.max(0, ...) floor, no pre-spend funds refusal, and
  the press narration never names the 60-kcal cost.
  Pre-spend refusals DO exist in the branch, but only for
  other gates: canForage-false ("Nothing left to take here
  today"), empty sweep ("worked out" / "Nothing within
  reach"), and pack-full ("Your pack is full..."). A
  kcal gate is not among them.
- Sibling cost paths, three families (to be tabulated in
  full in the evidence file from the judged code read):
  (a) PRE-SPEND REFUSAL (funds-check): ability kcal
  handler (src/js/abilityActions.js: kcal < amount blocks
  with "Not enough energy"); foodPower activateAbility
  (src/js/foodPower.js: kcal < kc refuses, nothing
  deducted); tradeKnowledge food price (src/js/game.js:
  kcal < 300 refuses 'poor'); a tend gate (kcal < 40
  returns ok:false). Ability/trade/tend are
  spend-to-buy-or-burn actions, not physical labor.
  (b) POST-SPEND CLAMP (spend, floor at 0): the doAction
  physical-labor family — rest (Math.max(0, before −
  40), with the spent amount named honestly), cutTree
  (−80), clearBrush (−40), blockage clearing (−60/−40/
  −80), scavenge-book (−100), boil, fire, tent, walk
  steps. Clamp is NOT a funds-check: the action still
  executes on empty; only the floor differs.
  (c) UNCLAMPED SPENDS (can go negative): forage (−60),
  scavenge-loot (−100), thorns (−20/−50), and the
  engine's own metabolism — resolveDay (src/js/engine/
  calories.js) deducts the full day need unclamped, takes
  starvation damage on a negative balance, and only then
  floors kcal at 0 ("Negative kcal/hp are display/logic
  noise — the spiral already did its damage above").
  So below-zero is NOT unique to forage in the codebase;
  whether it is the shared rule for effort is exactly
  what the census + downstream read must decide.
- Downstream channels to read per negative press:
  display (app.js HUD prints Math.round(kcal)/cap raw, so
  a negative value would show as e.g. "−60/3000 kcal");
  ability gating (foodPowerGate refuses every ability
  below 500 kcal — a negative balance gates identically
  to 0); rest healing (crisis at kcal <= 0 blocks healing
  — negative identical to 0); eat (adds kcal, capped at
  cap — negative just needs more food to climb out);
  death attribution (resolveDay damage on negative
  balance, killedBy 'starvation' only for a deficit >=
  500, else 'the night').

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time,
  full hash c1b310c9614fa3f7f006da5c38ada73833134178.
  The prereg commit adds ONLY this file, so the legs run
  on pinned-base game code verbatim. This base is NEWER
  than the wakeforage pin (7074478fb...), so NOTHING is
  quoted from wakeforage censuses as current-base
  behavior: guard AND ON trajectories are RE-DERIVED on
  the pinned base from fresh legs below, and the
  wakeforage strands are REPRODUCED (replay presses with
  the judged-morning equality gate) rather than assumed.
  Divergence from wakeforage values is DRIFT to report,
  never a failure to hide.
- Tracked diff guard: at evidence time, `git diff` of
  src/ and scripts/policies/ between pinned base and
  final tree must be EMPTY for a DIAG-only run. (If the
  conditional fix triggers, the diff is exactly the
  forage-cost-path clamp plus its proof script, and the
  guard is restated in the evidence file.)

## Definitions (the judged quantities)

- NEGATIVE PRESS: one doAction('forage') call in a judged
  trajectory whose kcalAfter < 0. Recorded per press:
  seed, leg (guard/ON), loopDay, game day, tile/cell,
  kcalBefore, kcalAfter, yield (known-edible E, unknown
  units, deadfall, outcome class as wakeforage), the say
  lines the press added (verbatim, for the silence read),
  and the restoration: the first later action that
  returns kcal to >= 0 (kind, kcalAfter) or "unrestored
  at day end / morning snap" with that snap's kcal.
- WOULD-BE-DEBT PRESS (secondary): a press with
  0 <= kcalBefore < 60 that does NOT go negative only
  because... it cannot — any yielding press at
  kcalBefore < 60 goes negative by construction (60
  deducted after harvest). Reported as the count of
  presses with kcalBefore < 60, split negative vs
  refused-before-harvest (pack-full / canForage-false /
  empty sweep, which spend nothing).
- DOWNSTREAM EFFECT (per negative press): display value
  (raw kcal as the HUD would print it), ability-gate
  state (kcal < 500, so gated — identical to 0 or a
  difference, stated), rest-crisis state (kcal <= 0,
  identical to 0 or a difference, stated), and whether
  the press's day ends in death attributed to starvation
  or anything else (from the leg's endReason/deaths).
- STRANDED FIELD MORNING (reproduction set): a morning
  snap on a fresh leg whose evening row is bucket creek
  + rescued false (woodday/wakeforage definition) and
  whose wake tile is NOT haven. Every such morning found
  on the fresh legs gets a replay press (control +
  press) via scripts/wakeforage-replay-b.js with the
  judged-morning equality gate (mismatch = UNMEASURED,
  never substituted).
- VILLAGER SAMPLE: day lines from the judged legs are
  read for goals, routines, dialogue, and reactions;
  anything robotic, static, or repeated is flagged in
  the evidence file, not chased.

## Implementation

- CENSUS DRIVER (this run's own measurement script):
  scripts/sweep-effdebt-b.js, adapted from
  scripts/wakeforage-trace-b.js with NO behavior change
  except a READ-ONLY tap: it wraps Game.doAction per
  instance to log, for EVERY doAction call, kind,
  kcalBefore/After, loopDay, and the say lines added
  (the wrapper calls the original verbatim and writes
  nothing to game state; it is driver code, not src/js).
  Same policy stack as wakeforage (nighttravel +
  woodcarry + woodwarm over competent), same morning/
  evening recording, same substrate env gates
  (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1).
  The tap log is the census: the analyzer counts
  presses, negative presses, would-be-debt presses, and
  restorations from it, never from sampled days.
- REPLAY LEGS: scripts/wakeforage-replay-b.js verbatim
  (already in-tree), control (WAKEFORAGE=0) + press
  (WAKEFORAGE=1) per fresh stranded field morning, with
  JUDGED_MORNING set to this run's own morning snap
  (wakeforage-compatible JSON), into
  evidence/2026-10-30/sim-effdebt-b-corpus-replay.
- ANALYZER: scripts/analyze-effdebt-b.js (pure reads
  over the census corpora + replay corpora: per-seed
  tables, strand reproduction table, restoration table,
  downstream table).
- PROOF (DIAG): scripts/test-effdebt-b.js asserts the
  census arithmetic (press counts, negative-press
  recomputation from tap kcalBefore/After, restoration
  recomputation, replay snap equality, determinism
  re-run byte-identical on one seed/leg). If the
  conditional fix triggers, the same script additionally
  carries the fix proof (see below) — never a second,
  post-hoc proof script.

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (8 seeds, first 8 of the wakeforage bank, so the
15215 strand seed is in-band): 15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337.
Horizon justification (30 loop-days, NOT a fixed 200d):
the question is stranded/early-game effort debt — the
wakeforage negatives sit on strand days 8–16, inside 30
loop-days, and the census question is "does a press go
negative in ordinary competent play", which a 30-day
window answers with 8 seeds x 2 legs of full press
streams. Longer horizons add late-game presses but no
new information about the stranded mechanism, and would
only dilute the early-game census. Death-aware: the
driver records daysAlive/endReason per seed and stops
at death; any leg death is reported per seed, never
averaged away. Seeds are nearly free; no leg below 8
seeds is judged.

- CENSUS legs (judged): sweep driver guard
  (WOODWARM=0) + ON (WOODWARM=1) on all 8 bank seeds,
  into evidence/2026-10-30/sim-effdebt-b-corpus-guard
  and -corpus-on.
- PILOT (instrument validation, before judging census
  legs): sweep driver ON on the first 8 bank seeds is
  itself the pilot — pilot checks: tap errs 0, every
  forage press in the tap log carries kcalBefore/After
  and say lines, morning snaps present on every loop
  day, no day-rollover. A pilot instrument failure stops
  the run (fix the instrument, never the bar). Pilot
  seeds are bank seeds, so pilot legs ARE judged census
  legs, not extra draws.
- REPLAY legs: for every stranded FIELD morning on the
  fresh census legs (ON primary + guard secondary),
  control + press as above.
- DETERMINISM re-runs: first bank seed (15003, sweep
  ON) re-run byte-identical; one replay press re-run
  byte-identical. A mismatch stops the run (instrument
  non-determinism, never re-scored).

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- DIAG-GO iff ALL hold on the fresh legs:
  (a) census complete: per-seed tables for all 8 seeds
  on both legs — total forage presses, negative presses
  (each with seed/day, kcal before/after, action/cost
  path, restoration, downstream effect), would-be-debt
  counts, refused-before-harvest counts;
  (b) mechanism named: the cost path (function + line
  family) and the sibling table (refusal / clamp /
  unclamped families with cited checks) are stated, and
  the verdict (intended vs missing clamp) is stated with
  its evidence;
  (c) sense read: one negative press read end to end
  (press say lines + the day's lines around it, judged
  for meaning — does the game show or tell anything
  about going negative? If silent, say so);
  (d) strand reproduction: the wakeforage 15215 strand
  either reproduces on this base (replay presses on the
  fresh stranded mornings, with the equality gate) or
  its non-reproduction is reported as drift with the
  fresh strand set named — a strand that does not exist
  on this base is NOT a failed bar, an unmeasured strand
  that does exist is;
  (e) tap errs == 0 on judged legs; determinism re-runs
  byte-identical; evidence file written with per-seed
  tables, mechanism, verdict, village assessment in
  plain words, villager-behavior sample, blanks filled
  or documented, and a "metric review" section.
  Otherwise DIAG-NO-GO, with the exact blocker named.
  Per the task brief, NO-GO applies ONLY if the
  instrument cannot observe kcal across presses at all;
  any other shortfall is a DIAG-GO with the shortfall
  named, or a DIAG-NO-GO with the blocker named —
  never a silent substitution.
- BANK-COMPOSITION CLAUSE (written before any judged
  leg): if the fresh bank strands fewer mornings than
  wakeforage (or none on some seeds), that is a bank
  property to name, not a bar to lower: 100% coverage
  of the stranded field mornings that exist satisfies
  (d)'s intent. If it strands MORE, those mornings are
  IN SCOPE.

## CONDITIONAL FIX (second step, separate proof, never silent)

The fix triggers ONLY if ALL of these hold on the judged
evidence: (1) the mechanism proves forage is missing a
funds-check that sibling actions HAVE — cited by file
and behavior, in the same action family (a pre-spend
refusal that blocks the action when kcal < cost, as the
ability kcal handler and foodPower gate do — a
post-spend clamp alone does NOT count, because clamp
and refusal are different semantics: clamp still
executes on empty); AND (2) below-zero is NOT the
engine's shared rule for effort (i.e. the census shows
forage as an outlier, not one of several unclamped
spends, and metabolism's own negative transit does not
already license it); AND (3) a pilot of the minimal
clamp in the forage-cost path ONLY (never policies,
never other cost paths) shows zero negative presses
with positive-kcal behavior identical per seed.
If ANY of (1)–(3) fails, or the mechanism is ambiguous,
NO fix — report DIAG only. An unjustified clamp on a
balance-sensitive economy is worse than the open
question. If the fix triggers, it lands with
scripts/test-effdebt-b.js green before/after, the pilot
above, and a balanced-panel before/after compare
(scripts/balance-panel.js, §15) attached. DIAG-only
needs no panel compare (pre-registered standing, like
wakeforage) but per-seed tables are required.

## Forbidden (violations void the run)

- Any src/js or scripts/policies/ change in a DIAG-only
  run; any policy file created, edited, or wired; any
  state edit from the tap (the tap calls the original
  doAction verbatim and logs only); any state edit
  outside engine verbs in a replay press; quoting
  wakeforage censuses as current-base behavior without
  the fresh re-derivation above; touching sibling loop
  A trees, claims, or branches; touching the main tree;
  writing census outputs to /tmp (worktree evidence/
  only); clamping any cost path without the conditional
  above triggering.

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether
  counting EVERY forage press (not just morning
  presses) is the right census unit for an effort-debt
  question (the debt mechanism is press-shaped, not
  morning-shaped — morning presses are the reproduction
  subset, the full press stream is the census); whether
  30 loop-days is the right horizon for a question whose
  known instances sit on days 8–16 (stated above; a
  longer horizon would answer a different question about
  late-game debt frequency); whether kcalBefore < 60 is
  the right would-be-debt cut (it is exact for a
  60-kcal deduction on a yielding press, and refused
  presses are split out so the count is never inflated
  by presses that spent nothing); whether the tap's
  say-line capture is the right silence instrument (the
  press narration is the player's only channel for the
  cost — if it never names kcal, the press is silent
  about debt by construction, and the evidence must say
  so rather than hunting for a HUD number the player
  may not be watching).
- If the verdict is DIAG-GO with no fix, the next step
  is a design answer (Steve-call if it needs his ruling:
  is effort debt intended, and should the press narrate
  it?), NOT another census of the same presses. If
  DIAG-NO-GO, the next run must name the blocker and
  fix the instrument, not re-ask the question on the
  same legs.
