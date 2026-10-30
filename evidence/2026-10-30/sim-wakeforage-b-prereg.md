# sim-wakeforage-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z,
arm sim-wakeforage-b, axis food-economy (wake-tile forage yield).
Worktree sim-wakeforage-b. DIAG ONLY: measurement, zero src/js
changes, zero policy-default changes, no behavior probe built,
run, or judged. Sibling loop A trees (sim-refusalsay-a,
sim-tributecost-a), the held sim-warmthdisp-b branch, and any
gapscomp-*/journey* tree are never touched. The main tree is
never touched.

## The question (backlog #1513, sim-findings.md 2026-10-30)

Loop-B arm sim-walktree-b (run fleshout-loop-b-20261030T1030Z,
evidence/2026-10-30/sim-walktree-b.md, verdict: walk-to-tree
rescues 0/10 field mornings) left one open item, quoted here,
not re-judged: stranded-day forages yield known food on only
2 of 10 field mornings (Purslane, days 10/14); the rest yield
unknowns uneatable until identified at camp. A food-first
recovery needs a MEASURED edible yield on the creek wake tile
itself, not a canon range. This arm measures exactly that:
on the stranded bank, for every stranded field morning, what
does foraging on the wake tile itself yield — known-edible
kcal, unknown items, or nothing — and does any morning's
known-edible yield cover a day's need?

## PRE-LEG AMENDMENT (committed before any judged leg; no leg has run)

The Y* verdict below needs walk steps, which the sweep
recorder deliberately does not compute (its neutrality bar
is creek/still/rescued only). Amendment: the REPLAY snap
additionally records nearest-cut walk steps via the
engine's own pure reads (findPath + cellProps — the
walktree passability instrument, no verbs, no state
edits), solely to re-derive Y* per fresh morning. The
recorder driver is unchanged; the replay press, the
control-snap equality gate, and every bar below are
unchanged. This amendment is part of the binding prereg
because it precedes all judged legs.

## Canon (read before judging)

- docs/CANON.md read first, then docs/MAP.md (one map; creeks
  block travel; river + bridge is the water; no teleport),
  docs/TIME-ECONOMY.md (action clock; forage 16 ticks + 60
  kcal effort, yield ~200–650 kcal; metabolic burn ~2200
  kcal/day; eat 1 tick + 0 kcal), docs/PERCEPTION.md
  (perceptionHints: adjacent only), docs/BALANCING.md
  (scholar needs 2,200 kcal/day). No canon doc covers wake-
  tile forage yields, so the engine facts below are code
  reads, stated, not invented canon.
- Perception law (Steve 2026-10-28, binding): villagers
  know only through their own senses. Every yield reported
  here carries its sense channel (see below). A list-fed
  result — a yield attributed to a whole-tile scan, a roster,
  or a snapshot feed — is a NO-GO, not a finding.

## Engine facts (code reads, verified before any judged leg)

- doAction('forage') (game.js) is an AREA SWEEP, not a tile
  action: one press works the patch around the villager —
  its cell + the 8 around it (Chebyshev <= 1). Only cells
  whose type is plant/bush/tree/bigtree, not scorched, and
  not flagged regrowing (t.detailRegrow[dk]) are harvested.
  Harvested plant/bush cells become dirt and regrow at
  day+2; tree/bigtree cells with no food species give
  deadfall (branches, bark, sometimes fiber), never food.
- Yield per harvested food cell: 3–5 units, times codex-
  level, green_thumb, multitool, forage.yield / luck.global
  and cornucopia multipliers (all live reads at press time;
  the recorder never assumes them). Known species pack as
  named items; unknown species pack into the unknown lump
  ("Not food until identified — sort them at camp").
  Known-but-in-shell nuts pack edible:false with 0 kcal now
  (hiddenKcal only) — they are NOT known-edible kcal.
- The press costs 16 ticks + 60 kcal effort
  (ACTION_COSTS.forage); a pack-full press refuses before
  harvesting ("too heavy" path); a tile with no forageable
  patch says "Nothing left to take here today" (canForage
  false) or "Nothing within reach" (empty sweep) and spends
  nothing. Eating is 1 tick + 0 kcal.
- Knowledge gate (game.js/food.js): foodForageItem(plant,
  isKnown, ...) — isKnown is the scholar's own plantKnown
  (the foraging villager IS the bot-played scholar in these
  legs). The yield split below is therefore the villager's
  own knowledge state at the press, not the game's truth.
- Species truth: cellPlantSpecies(t, cx, cy, cell) is game
  truth, but for plant/bush cells it BACKFILLS with
  Math.random() when unassigned — calling it in a judged
  recorder would consume RNG and perturb the trajectory.
  The recorder therefore reads species ONLY where
  t.plantSpecies / t.bushSpecies already holds the key
  (pure map read, zero RNG draws); unassigned cells are
  recorded species:null ("unassigned — revealed only by a
  press"). In the replay leg, species are revealed by the
  press itself (handling teaches, per the engine comment)
  — the press is the sense act, not a list read.
- The villager's own noticing channel is perceptionHints()
  (perceive.js: scans ONLY the 3x3 around the player). The
  forage sweep covers EXACTLY that 3x3. No whole-tile scan
  is used for any yield in this arm — unlike walktree's
  grid-presence column, which was explicitly NOT counted
  as perceived.

## Definitions (the judged quantities)

- STRANDED MORNING: the morning snap of a loop-day whose
  evening row is bucket creek + rescued false (still-
  refused creek evening), on the fresh legs below. Strand
  membership (maximal consecutive run, woodday definition)
  is recorded per morning but every still-creek morning is
  measured — singletons included.
- FIELD MORNING: a stranded morning whose wake tile is NOT
  haven (the walktree day-7 haven morning woke at home with
  the pile at hand; the wake-tile forage question does not
  apply to it). Haven stranded mornings are counted in the
  coverage accounting but excluded from the yield table,
  with the exclusion stated wherever the table is quoted.
- WAKE TILE / WAKE CELL: the morning snap's tile
  (mapPx, mapPy) and micro-position (mx, my). Wake tile
  type, morning kcal, morning wood, insideTent, ticksLeft,
  and the 3x3 sweep inventory are recorded at the snap.
- SWEEP INVENTORY (recorder, read-only, per stranded
  morning): for each of the <= 9 sweep cells (wake cell +
  8 neighbours, clipped to the 9x9 grid): cell type,
  species if already assigned else null, plantKnown at the
  snap if species present else null, regrow flag
  (t.detailRegrow[dk] present), scorched flag. This is the
  pre-press ground truth the villager stands in.
- FORAGE PRESS (replay leg only, see Implementation): ONE
  doAction('forage') press at the morning snap, in a
  discarded replay instance whose trajectory is identical
  to the judged leg up to that snap. The press is the
  measurement instrument — it is NOT a behavior in the
  judged legs, which contain zero forage presses by any
  recorder. Measured per press:
  - knownEdibleKcal E = sum over packed named items with
    edible true of units x kcalEach (== the engine's
    totalKcalKnown / tele kcal; both are recorded and must
    agree — disagreement stops the run);
  - knownButInedibleHiddenKcal = sum of hiddenKcal over
    known in-shell nut items (reported separately, NEVER
    folded into E);
  - unknownItems = lump units by lump form name (kcal now:
    0 — unknowns are not food until identified at camp);
  - deadfall = branches / bark / fiber units (non-food side
    yield, reported separately, never counted as food);
  - outcome class: KNOWN-EDIBLE (E > 0) / UNKNOWN-ONLY
    (E == 0, unknown units > 0) / NOTHING (no harvested
    food cells; the engine's say line is quoted) /
    REFUSED (pack-full or canForage-false, reason quoted);
  - say line (the engine's single forage narration,
    verbatim), kcalBefore / kcalAfter, ticks cost (16),
    and the full inventory diff (new items only).
- DAY-NEED (primary, fixed here, never mid-run): 2200 kcal
  — TIME-ECONOMY.md ("just being alive costs ~2200
  kcal/day, deducted in endDay()") and BALANCING.md
  ("Scholar needs: 2,200 kcal/day"). The primary verdict
  per morning is E >= 2200. Canon forage yield is ~200–
  650 kcal per press (TIME-ECONOMY.md), so a single press
  covering 2200 is NOT expected by canon — the verdict is
  measured, not tuned, and the secondary thresholds below
  carry the design meaning:
  - SELF-FUNDING: E >= 60 (the press pays its own 60-kcal
    effort; net edible gain E − 60 >= 0);
  - BRIDGE-COVERING: morningKcal − 60 + E >= 60, i.e.
    E >= 120 − morningKcal (after the press, the villager
    still holds the 60-kcal evening bridge lashing);
  - WALKTREE BREAK-EVEN Y*: the food-first break-even from
    sim-walktree-b (walkKcal + 80 fell + 60 bridge + 60
    forage effort − morningKcal, per morning; 162–206 on
    the walktree mornings, re-derived per fresh morning
    here) — E >= Y* means the morning forage funds the
    whole walktree food-first sequence, not just itself.
  All four verdicts are reported per morning; the evidence
  file must never quote a secondary pass as a day-need
  pass.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash 7074478fb495c13e9c0b627b4bfec9eb5bf968f1. The
  prereg commit adds ONLY this file, so the legs run on
  pinned-base game code verbatim. This base is NEWER than
  the walktree pin (56b4cbe7...), so NOTHING is quoted
  from the walktree censuses as current-base behavior:
  guard AND ON trajectories are RE-DERIVED on the pinned
  base from fresh legs below and judged against those
  fresh numbers. Divergence from walktree values is DRIFT
  to report and investigate (driver diff first, then base
  diff), never a failure to hide.
- Tracked diff guard: at evidence time, `git diff` of src/
  and scripts/policies/ between pinned base and final tree
  must be EMPTY. The recorder driver, replay driver,
  analyzer, and proof are measurement scripts only; no
  policy file is created, edited, or wired.

## Implementation (measurement first, no behavior)

- MASTER DRIVER (verbatim, OUTDIR override only):
  scripts/woodday-trace-b.js, run WITHOUT WOODDAY (probe
  off; WOODDAY unset or 0) for the fresh baselines. Env
  asserted FATAL on every leg: COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0|1 DAYS=30.
- RECORDER DRIVER (this run's own measurement script):
  scripts/wakeforage-trace-b.js, adapted from the
  walktree driver with walkAnalysis REPLACED by
  sweepAnalysis (above) and NO other behavior change:
  same policy stack (woodcarry + woodwarm over
  nighttravel), same morning/evening recording, same
  full-day say lines on still-refused creek evenings.
  sweepAnalysis performs ONLY pure reads (genDetail copy,
  plantSpecies/bushSpecies map reads, plantKnown,
  detailRegrow, cellScorched, woodCount, walkStepKcal) —
  zero Math.random draws, zero state edits, zero verbs.
  Any recorder error is recorded as a null with the error
  string, never silently dropped.
  Analyzer: scripts/analyze-wakeforage-b.js (pure reads:
  stranded mornings, sweep tables, per-seed counts).
- REPLAY DRIVER (this run's own instrument):
  scripts/wakeforage-replay-b.js, single-target via env:
  TARGET_SEED, TARGET_DAY (loopDay), WOODWARM (0|1),
  WAKEFORAGE=0|1, OUTDIR. It runs the SAME policy stack
  and the SAME morning-snap code as the recorder, and at
  the target morning snap:
  - WAKEFORAGE=0 (control): dumps the snap (tile, cell,
    kcal, wood, grid, sweep inventory) and exits WITHOUT
    pressing. The control snap must EQUAL the judged
    recorder morning on tile/cell/kcal/wood/grid — this
    equality is what licenses the forage leg to speak for
    the judged trajectory.
  - WAKEFORAGE=1 (judged press): verifies the pre-press
    snap equals the judged morning (same fields; mismatch
    aborts that target with a loud error, never a silent
    substitution), snapshots the pack, presses
    doAction('forage') ONCE, captures the say lines added
    by the press, the inventory diff, kcalBefore/After,
    and the tele-equivalent totals, then writes the yield
    JSON and exits. The replay instance is then discarded;
    nothing from it enters any judged corpus.
  Replay legs run ONLY for stranded field mornings found
  on the fresh recorder legs (plus their controls) — the
  target list is derived from fresh data, never copied
  from the walktree evidence file.
- NO balanced-panel compare .md is produced, as
  pre-registered: this is a DIAG measurement with zero
  src/js changes and zero policy changes, so there is no
  game-root delta for a panel to compare. The determinism
  re-runs below are the instrument-perturbation proof, and
  the bars below are the judge. (Same standing as the
  walktree prereg.)

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, screen order): 15003, 15009, 15091, 15211,
15215, 15220, 15221, 15337, 15376, 15439. Horizon
justification (30 loop-days, reused from woodday/walktree,
NOT a fixed 200d): the strand cycle closes inside it
(walktree: guard strand days 7–9, ON strand days 7–16,
both < 30); longer horizons add no strand information on
this bank. Death-aware: the driver records daysAlive/
endReason per seed and stops at death; any leg death is
reported per seed, never averaged away. Seeds are nearly
free; no leg below 10 seeds is judged.

- BASELINE legs (BEFORE any recorder leg is judged):
  woodday driver guard (WOODWARM=0) + ON (WOODWARM=1) on
  all 10 bank seeds, into
  evidence/2026-10-30/sim-wakeforage-b-corpus-base-guard
  and -base-on.
- RECORDER legs (judged measurement): wakeforage driver
  guard + ON on all 10 bank seeds, into
  evidence/2026-10-30/sim-wakeforage-b-corpus-guard and
  -corpus-on. Judged against the EQUIVALENCE BAR below.
- PILOT (instrument validation, before judging recorder
  legs): wakeforage ON on the first 8 bank seeds; pilot
  checks: errs 0, morning sweeps present (non-null) on
  every morning row, sweep species/known fields present
  (null only where unassigned, with the flag), no
  day-rollover. A pilot instrument failure stops the run
  (fix the instrument, never the bar). Pilot seeds are
  bank seeds, so pilot legs ARE judged recorder legs, not
  extra draws.
- REPLAY legs: for every stranded FIELD morning on the
  fresh recorder legs — primary set = ON leg, secondary
  set = guard leg — one control (WAKEFORAGE=0) + one
  press (WAKEFORAGE=1) per morning, into
  evidence/2026-10-30/sim-wakeforage-b-corpus-replay.
  A morning whose control snap mismatches its judged
  morning is UNMEASURED (counted against bar (a)), never
  replaced by a neighbouring morning's yield.
- DETERMINISM re-runs: first bank seed (15003, wakeforage
  ON recorder) re-run byte-identical; one press replay
  (15215 ON, first stranded field morning on the fresh
  legs) re-run byte-identical. A mismatch stops the run
  (instrument non-determinism, never re-scored).

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- DIAG-GO iff ALL hold on the fresh legs:
  (a) yield table complete for 100% of stranded FIELD
  mornings on the fresh recorder legs (ON primary +
  guard secondary), each row carrying E, unknown items,
  outcome class, say line, sense channel, and the four
  verdicts (day-need / self-funding / bridge-covering /
  walktree Y*);
  (b) recorder behavior-neutral: wakeforage guard + ON
  reproduce the fresh woodday-driver guard + ON legs
  exactly on per-seed creek / still / rescued counts
  (EQUIVALENCE BAR); guard warmth acted 0; recorder
  errs == 0 on judged legs;
  (c) replay licensed: every press target's pre-press snap
  equals its judged morning (tile/cell/kcal/wood/grid)
  and every control snap equals its judged morning;
  (d) determinism re-runs byte-identical (recorder +
  one press replay);
  (e) evidence file written with the per-morning yield
  table, the day-need verdict, reachability context,
  village assessment in plain words, sense-tested
  transcript reads of at least two stranded mornings,
  blanks filled or documented, and a "metric review"
  section.
  Otherwise DIAG-NO-GO, with the exact blocker named.
  In particular: an unmeasured stranded field morning, a
  replay snap mismatch, or an equivalence failure is
  DIAG-NO-GO — never guessed, never substituted.
- BANK-COMPOSITION CLAUSE (written before any judged leg,
  so this is definition, not re-scoring): the walktree
  bank stranded on only 2 seeds (15215 + one 15009 night).
  If the fresh bank strands fewer mornings than walktree,
  that is a bank property to name, not a bar to lower:
  100% coverage of the stranded field mornings that exist
  satisfies (a)'s intent, and the verdict reports GO with
  the shortfall named in plain words. If the fresh bank
  strands MORE mornings (new seeds or longer strands),
  those mornings are IN SCOPE — the table must cover them
  too. What would fail (a) is an UNMEASURED stranded field
  morning, never a seed that does not strand.
- SECONDARY (reported, NO bar): per-seed strand lengths
  (fresh guard vs ON); sweep-cell composition per wake
  cell (which cells hold food, which are empty/water);
  known-species inventory at stranded mornings (what the
  villager knows by then); deadfall side yields; observed
  stranded-day forage yields from full day lines (the
  daytime-tile contrast to the wake-tile press).
- INSTRUMENT bars: recorder errs == 0 on judged legs;
  determinism re-runs byte-identical; guard legs 0 warmth
  acted (warmth is ON-leg only).
- SENSE-TEST: two full stranded mornings read end to end
  on the fresh ON corpus (a 15215 field strand morning:
  full day say lines + wood-short line + morning snap +
  sweep read as the villager would meet it, judged for
  meaning and coherence, not just counts), plus the
  replay press narration read as the villager's own
  morning forage (what it knew, what it took, what it
  could eat).
- NO behavior probe is built, run, or judged in this arm.
  The replay press is a measurement instrument on a
  discarded instance, disclosed as such — it changes no
  judged trajectory, lands no behavior, and is never
  quoted as "the bot foraged in the morning" without the
  replay qualifier.

## Forbidden (violations void the run)

- Any src/js or scripts/policies/ change; any policy file
  created, edited, or wired; any forage/microMove/cutTree
  call from the recorder driver (the replay driver presses
  forage exactly once per target, in a discarded instance,
  and nowhere else); any state edit outside engine verbs
  in the replay press itself; quoting walktree censuses as
  current-base behavior without the fresh re-derivation
  above; touching sibling loop A's trees, claims, or
  branches; touching the main tree; writing sweep outputs
  to /tmp (worktree evidence/ only).

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether a single
  press is the right "morning forage" unit (the bot's
  daytime forages press repeatedly on richer tiles — a
  morning session of N presses would deplete the 3x3
  sweep and face regrow, so the first-press yield is the
  honest unit, but the evidence must say what repeat
  presses would meet: the sweep inventory shows it);
  whether 2200 kcal is the right day-need for a stranded
  villager whose evening ledger is really the 60-kcal
  bridge (the primary verdict is kept literal, and the
  secondary thresholds exist precisely so the design
  meaning is not hidden behind a foregone NO);
  whether plantKnown at the snap is the right knowledge
  channel for a bot-played scholar (it is the pack/UI
  channel app.js uses for the player; a villager-bot
  knowledge split, if one exists, must be named if found);
  whether the replay press's RNG draws are the draws the
  villager "would" have drawn (they are the draws at that
  exact deterministic snap — the control-snap equality is
  the license, and the determinism re-run is the proof).
- If the verdict is DIAG-GO, the next step is a design
  answer on food-first recovery (does the morning forage
  fund anything at all, and if not, what does), NOT
  another measurement of the same mornings. If
  DIAG-NO-GO, the next run must name the blocker and fix
  the instrument, not re-ask the question on the same legs.
