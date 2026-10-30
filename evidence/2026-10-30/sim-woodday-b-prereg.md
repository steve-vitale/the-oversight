# sim-woodday-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0930Z,
arm sim-woodday-b, axis food-economy (daytime wood recovery).
Worktree sim-woodday-b. Sibling loop A is live on scale-onramp —
never touched: not its trees, claims, or branches.

## The question (named by the 0830Z run, not invented here)

The 0830Z run proved warmth restraints R1/R2 GUARD-EQUIVALENT on
the woodwarm bank: on this trajectory there is NO middle between
unconditional warmth (trap: seed 15215 strands days 7–16) and never
lighting (guard strands days 7–9). Its named next question — this
arm — is DAYTIME WOOD RECOVERY: the only named route to a warmth
middle. Prior facts adopted as the starting point (to be
RE-DERIVED below, not quoted as current-base behavior): seed 15215
warmth spends nights 9, 11, 12, 13 (pack 4→3→2→1→0); the window
closes day-17 morning with the haven carry refill 0→4. The woodwarm
prereg noted a post-spend creek evening that is NOT wood-short
needs an explanation: pack replenished (morning carry after
reaching haven, or wood cut/gathered during day N+1). This arm
tests the second branch of that explanation.

## Canon (read before judging)

- docs/CANON.md read first, then docs/TIME-ECONOMY.md (bridge
  costs, fell/clear costs), docs/MAP.md (creeks block travel,
  ~35% of creek tiles need a bridge or a swimmer), and
  docs/ABILITY-REFUSALS.md (refusals must be honest about why;
  the wood-short lacking line is the landed woodcarry.js line,
  NOT re-specified here).
- Engine wood facts (code reads, game.js, verified this run
  before any judged leg — no canon doc covers daytime wood
  gathering, so the code is stated here instead of inventing
  canon):
  - cutTree(cx, cy): adjacent (Chebyshev <= 1) tree/bigtree
    cell only; 96 ticks + 80 kcal; +2–4 wood (tree) or +4–6
    (bigtree), ×1.5 rounded up with woodlore; cell becomes dirt.
  - clearBrush(cx, cy): adjacent bush cell only; base 32 ticks
    + 40 kcal (storage.js tool ladder overrides: machete 16 /
    axe 24 / hands 64 ticks, 20/30/50 kcal); +1 wood (brushwood)
    +1–2 fiber; cell becomes grass.
  - clearBlockage(x, y) on a fallen_tree blockage: +2 wood,
    32 ticks + 60 kcal; the guarded side must be entered from
    (tile + blockFrom), so it is NOT an adjacent-cell verb.
  - takeWood(): haven woodpile only, up to 4 logs, 2 ticks —
    the morning-carry transaction, NOT a daytime field verb.
  - gatherTimber() (betrayal.js): exiled-founders only; NOT
    available to the banked bot, excluded from this arm.
  - doAction('forage'): harvests plants for food; yields NO wood
    (forage handler harvests bySpecies plants). Forage is NOT a
    wood channel.
  - Overnight, no engine verb adds pack wood: sleep advances the
    day and deducts metabolic kcal; wood changes only via the
    verbs above, bridge spends (evening step), and fire fuel
    spends (evening warmth step).
- Bot behavior facts (policy reads, verified this run before any
  judged leg): scripts/policies/competent.js + nighttravel.js
  NEVER call cutTree or clearBrush. competent.js calls
  clearBlockage only via clearRubbleForStone (rubble type only,
  for stone — yields stone, never wood). The bot's only pack-wood
  gains on this trajectory are the morning haven-pile carry
  (woodcarry.js, at-haven mornings only) and, in principle, the
  three field verbs above — which it never runs. So the census
  question is precise: does the pack EVER rise during a stranded
  day anyway (via a verb the survey missed, an NPC/villager
  channel, or any other route), and does a stranded wake site
  offer an adjacent wood source the bot walks past?

## Strand and delta definitions (the judged quantities)

- STRAND: a maximal run of still-refused creek evenings on
  CONSECUTIVE loop-days (corpus evening: bucket creek, rescued
  false; a gap, a rescued evening, or a non-creek evening breaks
  the run). Strand length = run length in nights.
- EVENING WOOD (pre-warmth) = woodcarry classification woodPlayer
  on that evening's row. POST-EVENING WOOD = warmth woodAfter if
  the warmth record acted (fireLit, logSpent >= 0 — a failed fire
  spends no fuel, so woodAfter == woodBefore), else the evening
  wood. (Bridge spends happen in the evening step BEFORE
  classification only on rescued evenings, which break strands,
  so they cannot contaminate a within-strand delta.)
- DAYTIME DELTA for adjacent strand evenings N → N+1 =
  evening-wood(N+1) − post-evening-wood(N). Overnight cannot raise
  wood (canon facts above), and morning carry acts only at haven
  (a haven morning breaks the strand — verified per pair via the
  morning carry record and morning position). So a POSITIVE delta
  inside a strand IS daytime recovery, whatever its verb; a zero
  delta is no net recovery (a gain exactly offset by a daytime
  spend would need a daytime spend verb — none exists on this
  trajectory — and is reported as a limitation, not assumed
  away); a negative delta inside a strand is an anomaly to
  investigate, never averaged away.
- MORNING WOOD (instrumented legs only) = Game.woodCount() read
  at the morning snap (post-sleep, pre-daily, pre-carry).
  DAYTIME DELTA (instrumented, cross-check) =
  evening-wood(N+1) − morning-post-carry-wood(N+1), where
  morning-post-carry-wood = carry woodAfter if the carry acted,
  else morning wood. The two delta definitions must agree on
  every strand pair; disagreement stops the run (instrument
  failure, never re-scored).
- DAY WOOD LINES (instrumented legs only): every say line of a
  loop-day matching /wood|cut|clear|lash|bridge|tree|brush/i,
  stored per day. SOURCE attribution for a positive delta =
  the day's wood lines naming the verb (cutTree crack line,
  clearBrush brushwood line, fallen-tree clear line, pile-take
  line) — or, if no line names it, the delta is reported as
  UNATTRIBUTED with the full day lines quoted, never guessed.
- ADJACENT SOURCES (instrumented legs only): at each stranded
  morning snap, the wake tile's detail grid is scanned in the
  warmth scan order (self + 8 neighbours) and the counts of
  tree / bigtree / bush cells recorded (pure reads via
  genDetail, the same call the warmth policy already makes).
  A WINDOW exists iff at least one stranded-sequence morning
  has >= 1 adjacent tree/bigtree/bush cell. The window is a
  property of the wake site, independent of whether the bot
  uses it.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full hash
  aa05732023cc2f7b760a64118c027afc1ca3940e.
  The prereg commit adds ONLY this file (no code, no policy, no
  driver change), so the legs run on pinned-base game code
  verbatim. This base is NEWER than the 0830Z pin (sibling
  landings since, including a journey-deepening commit on top
  of the 0830Z merges), so NOTHING is quoted from the 0830Z
  censuses as current-base behavior: guard AND unconditional-ON
  trajectories are RE-DERIVED on the pinned base from fresh
  legs below and judged against those fresh numbers. If the
  fresh numbers diverge from the 0830Z numbers, the divergence
  is reported under DRIFT and investigated (driver diff first,
  then base diff) before any probe is judged.
- Tracked diff guard: at evidence time, `git diff` of src/ and
  scripts/policies/ between pinned base and final tree must be
  EMPTY except the opt-in probe policy file (only if the probe
  is built, see below) — the instrumented driver and analyzer
  are measurement scripts, not game/policy changes.

## Implementation (measurement first, probe conditional)

- MASTER DRIVER (verbatim, OUTDIR override only):
  scripts/woodwarm-trace-b.js + scripts/analyze-woodwarm-b.js +
  scripts/policies/woodwarm.js + scripts/policies/woodcarry.js,
  UNCHANGED. Env asserted FATAL on every leg:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0|1 DAYS=30.
- INSTRUMENTED DRIVER (this run's own measurement script):
  scripts/woodday-trace-b.js, adapted from the master driver
  with READ-ONLY additions and NO behavior change:
  (a) morning snap gains Game.woodCount();
  (b) per-day wood-line scan (filter over the say lines the
  master driver already captures; no new say calls);
  (c) stranded-morning adjacent tree/bigtree/bush counts
  (genDetail reads, warmth scan order);
  (d) for still-refused creek evenings, the FULL day's say
  lines are stored on the row (stranded days are few; this is
  what the sense-read reads — not the 30-line tail alone);
  (e) optional WOODDAY=1 wiring (probe legs only, see below;
  default off = master-driver behavior).
  Analyzer: scripts/analyze-woodday-b.js (this run's own
  analyzer; pure reads: strand runs, both delta definitions,
  morning-carry flags inside strands, day-line source
  attribution, adjacent-source window scan, per-seed tables).
  EQUIVALENCE BAR: instrumented guard + ON legs must reproduce
  the fresh master-driver guard + ON legs exactly on per-seed
  creek / still / rescued counts and on 15215's strand nights;
  any mismatch stops the run (driver diff first).
- CENSUS A (re-analysis, NOT judged baseline): pure-read
  analysis of the 0830Z fresh corpora already in this worktree
  (sim-warmthrestr2-b-corpus-guard + -corpus-on) with the
  strand/delta definitions above, reported as a cross-check
  with its older base noted. Quoted only where the fresh
  legs reproduce it.
- PROBE (conditional, policy-side only — built ONLY if the
  census finds a window as defined above):
  scripts/policies/woodday.js, OPT-IN via WOODDAY=1 (default
  off; the master policy files are NOT edited). The probe wraps
  OUTSIDE the warmed stack, so it runs BEFORE woodcarry's
  morning carry each loop-day; the two never co-act (probe
  gate requires away-from-haven; carry gate requires at-haven).
  Probe rule (exact, no mid-run swaps):
  - Gates (all must hold): not game over; not in combat; NOT
    at haven (insideHaven false AND player tile not haven);
    pack wood < 4; morning kcal >= 80 (one cutTree's effort
    cost); ticksLeft >= 96 (one cutTree's tick cost; mornings
    start a fresh day budget, verified per act, never assumed).
  - Verbs (engine's own, in fixed scan order = warmth ground
    scan order, self + 8 neighbours): for each adjacent cell,
    if tree/bigtree AND fells-used < 2 AND pack < 4 → cutTree;
    else if bush AND pack < 4 → clearBrush; stop when pack
    >= 4, when adjacent wood sources are exhausted, when
    kcal < 80 (cutTree floor) or ticksLeft < 96, or after 2
    tree fells. NO state edits outside engine verbs; NO RNG
    drawn by the policy itself (cutTree's yield lottery is the
    engine's own, like warmth's friction lottery); NO weakening
    of the carry (pile untouched); NO hand top-ups; NO evening
    action (mornings only — the evening bridge attempt is
    unchanged and still judges the pack the probe leaves).
  - Record per loop-day: probe record { acted, verbs: [{verb,
    cell, woodBefore, woodAfter}], woodBefore, woodAfter,
    kcalBefore, ticksLeftBefore, sourcesExhausted, skip reason }
    on ctx._wdLast, stored on the evening row by the driver.
    A probe act that fells a tree permanently clears that cell
    (engine behavior, stated, not hidden).
  - If NO window exists (zero stranded-sequence mornings with
    an adjacent wood source on the instrumented legs), NO probe
    is built, NO game-code change is made, and the verdict is
    DIAG: the channel absence is documented and what a middle
    would require is stated as a finding for the next run. A
    probe built without a window would be testing a fiction.
  - If a window exists but the probe leg fails its GO bar, the
    verdict is NO-GO (probe killed, leaves no trace — the
    opt-in file is NOT committed on a NO-GO... correction, stated
    plainly: the probe file IS committed as measurement record
    with the NO-GO verdict, but the probe is never wired as a
    default and never merged as a behavior change; "leaves no
    trace" in the task body means no default/behavior trace,
    and this sentence is the binding reading).

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, screen order): 15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337, 15376, 15439. Horizon justification (30
loop-days, reused from woodwarm, NOT a fixed 200d): the strand
cycle closes inside it (guard rescue day 10, ON refill day 17,
both < 30); longer horizons add no strand information on this
bank. Death-aware: the driver records daysAlive/endReason per
seed and stops at death; any leg death is reported per seed,
never averaged away. Seeds are nearly free; no leg below 10
seeds is judged.

- BASELINE legs (BEFORE any probe leg): master driver guard
  (WOODWARM=0) + ON (WOODWARM=1) on all 10 bank seeds, into
  evidence/2026-10-30/sim-woodday-b-corpus-guard and
  -corpus-on. REPRODUCTION EXPECTATION (0830Z values, to be
  re-derived, NOT a bar to force): guard 15 creek / 4 still /
  11 rescued; ON 21 creek / 11 still / 10 rescued, warmth
  acted 6 / log-spent 4, 15215 guard strand days 7–9, ON strand
  days 7–16. Divergence from these values is DRIFT to report
  and investigate, NOT a failure to hide — judged bars below
  use the FRESH baseline numbers, whatever they are.
- CENSUS legs (judged measurement): instrumented driver guard
  + ON on all 10 bank seeds, into
  evidence/2026-10-30/sim-woodday-b-corpus-instr-guard and
  -instr-on. Judged against the EQUIVALENCE BAR above.
- PILOT (instrument validation, before judging census legs):
  instrumented ON on the first 8 bank seeds; pilot checks:
  errs 0, morning wood present on every morning row, day wood
  lines present, adjacent-source counts present on stranded
  mornings, no day-rollover (evening loopDay sequences intact).
  A pilot instrument failure stops the run (fix the instrument,
  never the bar). Pilot seeds are bank seeds, so pilot legs ARE
  judged census legs, not extra draws.
- PROBE legs (ONLY if the window condition holds): instrumented
  driver + WOODDAY=1 (which also implies WOODWARM=1 — the probe
  is judged against the warmth-ON baseline, since it exists to
  rescue warmth's trap, not to replace warmth) on all 10 bank
  seeds, into evidence/2026-10-30/sim-woodday-b-corpus-probe.
  No cap, no subset, no seed added after the probe legs run.

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- CENSUS QUESTION (primary, plain answer required): does pack
  wood EVER increase during daytime on a stranded sequence
  without the bot reaching haven? Answered by the strand-pair
  delta table (both definitions agreeing): count of positive
  deltas, with seed/day/verb attribution per positive delta, on
  ON legs AND on guard legs (control). The guard control must
  show the same daytime-delta pattern as ON (daytime recovery
  is warmth-independent); a guard/ON divergence in daytime
  deltas is an anomaly to investigate before any probe verdict.
- PROBE GO BAR (only if a probe is built): GO iff ALL hold on
  the 10-seed bank vs the FRESH warmth-ON baseline:
  (a) still-refused creek evenings (stranded evenings) fall by
  >= 3;
  (b) rescued creek crossings do NOT fall (probe rescued >=
  ON rescued);
  (c) NO narration lie appears in the sense-read tails (probe
  legs' 15215 strand tails + rescue tails: every wood count
  named matches the recorded pack at that evening, every
  bridge/fire line matches the recorded act).
  Otherwise NO-GO. Judge against this header exactly — a miss
  is NO-GO, never re-scored against a friendlier metric (e.g.
  strand-length-only, or 15215-only, or a post-hoc "but the
  pack rose" claim).
- SECONDARY (reported, NO bar): per-seed strand lengths
  (probe vs ON vs guard); probe acts / verbs / wood gained /
  sources-exhausted mornings; 15215 strand nights; log-spends
  retained vs ON 4; morning-carry refills inside strands
  (must be 0 — any nonzero is a sequence-definition bug to fix
  before judging).
- INSTRUMENT bars: recorder/classifier errs == 0 on judged legs;
  determinism re-run of the first bank seed (15003, instrumented
  ON) byte-identical; guard legs 0 warmth acted; both delta
  definitions agree on every strand pair.
- SENSE-TEST: at least one full stranded-sequence read end to
  end on the instrumented ON corpus (seed 15215's strand: every
  night's full day say lines + fire lines + wood-short line +
  carry lines, judged for meaning/coherence, not just counts).
  If a probe is built, the 15215 probe strand (or rescue) tails
  are read additionally for the no-lie bar (c).
- NO balanced-panel compare .md is produced, as pre-registered:
  this is a 30-day position measurement with zero src/js changes
  and (if built) one opt-in policy file that is never a default,
  so there is no game-root delta for a panel to compare, and the
  panel's registry policies do not include the nighttravel trace
  policy. The determinism re-run is the instrument-perturbation
  proof, and the bars above are the judge. (Same standing as the
  woodwarm and warmthrestr2 preregs.)

## Forbidden (violations void the run)

- Changing the probe rule, GO bar, strand definition, or delta
  definition after any judged leg starts; re-screening legs
  hoping for a better draw; quoting 0830Z censuses as
  current-base behavior without the fresh re-derivation above;
  staging via dropItem; any state edit outside engine verbs;
  any policy-drawn RNG; weakening the carry; hand top-ups;
  building a game-code change if no daytime channel exists;
  claiming a NO-GO probe as a middle; touching sibling loop A's
  trees, claims, or branches; touching the main tree.

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether the
  evening-to-evening delta definition separates daytime gain
  from overnight/carry effects cleanly on the fresh base;
  whether the morning probe's "away from haven at wake" gate
  matches what "daytime recovery" means for a stranded bot (the
  probe runs at day-start, before competent.daily travels —
  the only policy-side insertion point the stack offers, since
  inner.daily is atomic from the wrapper's view; stated here so
  the evidence file cannot silently re-label it as mid-day);
  whether the >= 3 stranded-evening GO bar is the right size
  for a 10-seed bank whose ON baseline holds 11 stranded
  evenings (a bar that a single-seed rescue swing could meet
  is too small; a bar demanding full rescue is a different
  claim than "a middle exists").
- If the verdict is DIAG (no window), the next run should NOT
  re-ask daytime recovery on this bank — it should carry the
  finding to the Steve-call (the middle would require either a
  new gathering behavior the bot does not have, or a different
  warmth rule) or take the wake-site question (are stranded
  sites systematically treeless by map generation?).
- If the verdict is NO-GO (window exists, probe fails), the
  next run should NOT re-tune the probe's verb order or caps on
  this bank — it should report the failure shape (no sources?
  sources but no rescue? rescue but lies?) as the finding.
