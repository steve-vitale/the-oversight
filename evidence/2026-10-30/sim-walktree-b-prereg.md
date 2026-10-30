# sim-walktree-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1030Z,
arm sim-walktree-b, axis food-economy (daytime wood recovery).
Worktree sim-walktree-b. DIAG ONLY: measurement, zero src/js
changes, no default flips, no behavior probe. Sibling loop A
trees (sim-sameday-a / sim-draftflag-a) are live — never touched.

## The question (backlog #1497, sim-findings.md 2026-10-30)

Loop-B arm sim-woodday-b (run fleshout-loop-b-20261030T0930Z,
evidence/2026-10-30/sim-woodday-b.md, verdict NO-GO) left one
open item, quoted here, not re-judged: 15215's wake tile holds
8 bigtrees on every stranded morning, none adjacent to either
wake cell (micro-positions alternate 0,0 and 8,0, the entry
corners). The adjacent-morning-cut probe is DEAD (acted 0/300
days) and is NOT re-tuned or re-tested here (no R1/R2 work).
Stranded mornings hold 0–44 kcal, below the lashing bridge cost
(60) and the felling cost (80). Whether micro-walking can reach
those bigtrees (detail-cell passability, creek cells) is NOT
established by that census. This arm establishes it, prices it,
and writes the design answer. It does NOT build the behavior.

## Canon (read before judging)

- docs/CANON.md read first, then docs/MAP.md (one map; creeks
  block travel; river + bridge is the water; no teleport),
  docs/TIME-ECONOMY.md (action clock; step / forage / fell /
  bridge costs), docs/PERCEPTION.md (perception hints: adjacent
  only). No canon doc covers daytime wood gathering, so the
  engine facts below are code reads, stated, not invented canon.
- Perception law (Steve 2026-10-28, binding): any proposed
  behavior must be grounded in what the villager itself
  perceives — trees it sees on its own tile, not a map roster
  or snapshot feed. A list-fed result is a no-go, not a finding.
  The sense channel is recorded alongside every measured result.

## Engine facts (code reads, verified before any judged leg)

- Detail grid: each map tile is a 9x9 detail grid (game.js
  genDetail). Creek tiles carry a continuous meandering river,
  2 cells wide, with exactly one 2-cell bridge; river override
  wins last (water blocks, bridge passable). Bigtrees arrive as
  2x2 clusters (0–2 clusters per tile: 0/4/8 cells), never on a
  bridge cell or the spawn cell (4,4).
- cellProps (game.js): water blocks:1; tree blocks:1;
  bigtree blocks:1; wall/tent/fire block. bush/plant/grass/
  dirt/bridge passable.
- cutTree(cx, cy) (game.js): target cell must be tree/bigtree
  AND Chebyshev <= 1 from the player's micro-position, else
  "Too far. Step closer." Costs 96 ticks + 80 kcal; bigtree
  yields 4–6 wood (x1.5 rounded up with woodlore). The cell
  becomes dirt permanently. storage.js WRAPS cutTree with a
  tool gate: cutInfo('bigtree').canFell false (no axe-tier
  tool) refuses the fell — 2 ticks, no wood, no 80 kcal spend.
  A walk-to-tree sequence that cannot fell is moot even if
  the walk is passable and affordable.
- clearBrush: adjacent bush only; tool-ladder ticks/kcal
  (axe 24/30, machete 16/20, hands 64/50); +1 wood. Recorded
  only as a bush fallback, not the priced sequence.
- microMove (game.js): one adjacent (Chebyshev <= 1) step,
  1 tick + walkStepKcal() (baseline 2 kcal; travel.cost_mult
  may lower it — the recorder reads the live walkStepKcal()
  at each snap, never assumes 2). Refuses into blocking cells.
- findPath (game.js): BFS, 8-directional, avoids blocking
  cells, no corner-cutting through blocked cells. This is the
  passability instrument: a cut-position is reachable iff
  findPath returns a path to it.
- buildBridge (game.js): 4 wood + 60 kcal + 96 ticks.
- doAction('forage'): 16 ticks + ACTION_COSTS.forage = 60 kcal
  effort (engine/calories.js); yield ~200–650 kcal typical
  (TIME-ECONOMY.md). Eating: 1 tick, 0 effort (TIME-ECONOMY.md).
- Day budget: TICKS_PER_DAY = 512 (TIME-ECONOMY.md).
- Perception channels (measured, not assumed):
  (a) perceptionHints() (perceive.js): scans ONLY the 3x3
  around the player (dx,dy in -1..1) — a bigtree is NOTICED
  only when adjacent. This is the game's own tree-noticing
  channel, tool-aware via cutInfo().
  (b) canSee() (game.js): Bresenham line of sight; blocked by
  intermediate tree/bigtree/wall/tent cells. Reported per
  bigtree as the line-of-sight channel (its home is monster
  vision; that scope is stated, not hidden).
  (c) Whole-tile genDetail read: what the map screen shows the
  PLAYER. For a villager bot, acting on a whole-tile scan with
  no perception step is the list-feed pattern and is reported
  as such — grid-presence is a fact about the tile, NOT a
  claim that the villager perceives the tree.
- Policy precedent: scripts/policies/woodwarm.js scans
  genDetail only in the self + 8 neighbours order (adjacent
  ground for a fire plot). No landed policy scans a whole tile
  to pick a target. A walk-to-tree behavior that needs a
  whole-tile target pick therefore needs a NEW sense step
  (or a Steve call) — it cannot ride the woodwarm precedent.

## Definitions (the judged quantities)

- STRANDED MORNING: the morning snap of a loop-day whose
  evening row is bucket creek + rescued false (still-refused
  creek evening), on the fresh walktree legs below. Strand
  membership (maximal consecutive run, woodday definition)
  is recorded per morning but every still-creek morning is
  measured — singletons included.
- WAKE CELL: the morning snap's (mx, my) micro-position on
  the wake tile (mapPx, mapPy). Wake tile type, kcal,
  morningWood, insideTent, ticksLeft, walkStepKcal, canFell,
  woodlore are recorded at the snap.
- CUT-POSITION: a detail cell adjacent (Chebyshev <= 1) to
  at least one bigtree cell, whose own cell does NOT block
  (cellProps.blocks false). The cut-position SET for a wake
  cell is all such cells.
- PASSABLE (per wake cell): for each bigtree CLUSTER (2x2
  block; single cells grouped by adjacency), the nearest
  reachable cut-position by findPath from the wake cell,
  with path length in steps. A cluster is REACHABLE iff at
  least one of its cut-positions has a findPath path. A wake
  cell is PASSABLE iff at least one cluster is reachable.
  Blocking cells on the shortest path are named (water?
  which river bank? bridge cells used?). A cluster across
  the river is reachable ONLY via the bridge cells — the
  recorder names bridge use explicitly.
- PERCEIVED (per wake cell, sense channels beside passability):
  adjacentBigtree = a bigtree cell within Chebyshev <= 1 of
  the wake cell (the perceptionHints rule); canSee per
  cluster = canSee(wake -> nearest cell of the cluster)
  ignoring nothing (engine's own LOS). Grid-presence (whole
  tile bigtree count) is reported separately and NEVER
  counted as perceived.
- COST LEDGER (per stranded morning, direct variant):
  walkTicks = shortest-path steps to the nearest reachable
  cut-position (1 tick/step); walkKcal = steps x live
  walkStepKcal(); fell = 96 ticks + 80 kcal; bridge = 96
  ticks + 60 kcal + 4 wood (evening, same day). Sequence
  ticks = walkTicks + 96; sequence kcal = walkKcal + 80.
  Yield if felled: bigtree 4–6 wood (6–9 with woodlore) —
  a single fell covers the 4-wood bridge iff yield >= 4
  (always, for bigtree) AND the morning pack + yield >= 4.
- FOOD-FIRST VARIANT (same morning): forage first (16 ticks
  + 60 kcal effort, yield Y into the pack), eat (1 tick,
  0 kcal), then walk + cut as above. Break-even yield
  Y* = walkKcal + 80 + 60 (bridge reserve) + 60 (forage
  effort) − morningKcal. Affordability is judged under
  yield cases Y in {200 (canon low), 425 (mid), 650 (high)}
  AND against the observed stranded-day forage yields
  extracted from the fresh corpus day lines (forage say
  lines naming kcal). The variant is MORNING-FUNDED: it
  prices the sequence against morning kcal + morning forage
  yield, holding the 60-kcal bridge reserve, before the
  day's other business. That scope is stated in the evidence
  file; the day's observed net (actual evening kcal) is
  reported alongside as context, never folded in silently.
- AFFORDABLE (direct): morningKcal >= walkKcal + 80 + 60
  AND canFell true AND at least one cluster reachable AND
  morningWood + bigtree yield >= 4. (The bridge reserve is
  held: a sequence that funds the fell but leaves the
  villager unable to lash at evening rescues nothing.)
  AFFORDABLE (food-first): same, with morningKcal replaced
  by morningKcal − 60 + Y for the yield case under judgment,
  and the forage tick cost added to sequence ticks.
  Tick check (both variants): sequence ticks + 96 (evening
  bridge) <= 512 day budget; the evening ticksLeft observed
  in the corpus is reported as the realistic slack check.
- RESCUE (what "rescues a stranded night" means): the
  sequence leaves the evening bridge attempt with wood >= 4
  AND kcal >= 60 AND ticks >= 96. Anything less is not a
  rescue, even if wood rises. (Warmth fires, which also spend
  logs, are out of scope for the ledger: the bridge is the
  rescue; a fire spend after a bridge build is a second
  night's problem, stated as a limitation.)

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash 56b4cbe74aca227a354cdb2db5440a3514253876. The
  prereg commit adds ONLY this file, so the legs run on
  pinned-base game code verbatim. This base is NEWER than
  the woodday pin (aa057320...), so NOTHING is quoted from
  the woodday censuses as current-base behavior: guard AND
  ON trajectories are RE-DERIVED on the pinned base from
  fresh legs below and judged against those fresh numbers.
  Divergence from woodday values is DRIFT to report and
  investigate (driver diff first, then base diff), never a
  failure to hide.
- Tracked diff guard: at evidence time, `git diff` of src/
  and scripts/policies/ between pinned base and final tree
  must be EMPTY. The recorder driver, analyzer, and proof
  are measurement scripts only; no policy file is created,
  edited, or wired.

## Implementation (measurement first, no behavior)

- MASTER DRIVER (verbatim, OUTDIR override only):
  scripts/woodday-trace-b.js (itself adapted from the
  woodwarm master driver), run WITHOUT WOODDAY (probe off)
  for the fresh baselines. Env asserted FATAL on every leg:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0|1 DAYS=30.
- RECORDER DRIVER (this run's own measurement script):
  scripts/walktree-trace-b.js, adapted from the woodday
  driver with READ-ONLY additions at the morning snap and
  NO behavior change:
  (a) full 9x9 detail-grid copy at the snap (rows copied,
  never edited);
  (b) per-snap passability analysis via the engine's own
  pure reads — findPath, canSee, cellProps, walkStepKcal,
  cutInfo, woodloreKnown — wrapped in try/catch, recorded,
  never acted on;
  (c) ticksLeft (512 − dayTicks), insideTent, canFell,
  woodlore, pack-wood, morning kcal at the snap.
  findPath/canSee/cellProps/walkStepKcal/cutInfo read
  genDetail (cached t.detail) and state; they mutate nothing.
  The driver performs NO microMove, NO cutTree, NO forage,
  NO state edit of any kind beyond what the master driver
  already does. Any recorder error is recorded as a null
  with the error string, never silently dropped.
  Analyzer: scripts/analyze-walktree-b.js (pure reads:
  stranded mornings, per-cluster passability, ledgers,
  affordability counts, observed forage yields from day
  lines, strand tables).
  EQUIVALENCE BAR: walktree guard + ON legs must reproduce
  the fresh woodday-driver guard + ON legs exactly on
  per-seed creek / still / rescued counts and on 15215's
  strand nights; any mismatch stops the run (driver diff
  first — the recorder must be behavior-neutral).
- NO balanced-panel compare .md is produced, as
  pre-registered: this is a DIAG measurement with zero
  src/js changes and zero policy changes, so there is no
  game-root delta for a panel to compare. The determinism
  re-run below is the instrument-perturbation proof, and
  the bars below are the judge. (Same standing as the
  woodday prereg.)

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, screen order): 15003, 15009, 15091, 15211,
15215, 15220, 15221, 15337, 15376, 15439. Horizon
justification (30 loop-days, reused from woodday, NOT a
fixed 200d): the strand cycle closes inside it (guard
rescue day 10, ON refill day 17 on the woodday base, both
< 30); longer horizons add no strand information on this
bank. Death-aware: the driver records daysAlive/endReason
per seed and stops at death; any leg death is reported per
seed, never averaged away. Seeds are nearly free; no leg
below 10 seeds is judged.

- BASELINE legs (BEFORE any recorder leg is judged):
  woodday driver guard (WOODWARM=0) + ON (WOODWARM=1) on
  all 10 bank seeds, into
  evidence/2026-10-30/sim-walktree-b-corpus-base-guard and
  -base-on.
- RECORDER legs (judged measurement): walktree driver
  guard + ON on all 10 bank seeds, into
  evidence/2026-10-30/sim-walktree-b-corpus-guard and
  -corpus-on. Judged against the EQUIVALENCE BAR above.
- PILOT (instrument validation, before judging recorder
  legs): walktree ON on the first 8 bank seeds; pilot
  checks: errs 0, morning grids present on every morning
  row, passability analysis present (non-null) on stranded
  mornings, no day-rollover. A pilot instrument failure
  stops the run (fix the instrument, never the bar).
  Pilot seeds are bank seeds, so pilot legs ARE judged
  recorder legs, not extra draws.
- DETERMINISM re-run: first bank seed (15003, walktree ON)
  re-run byte-identical (corpus re-run comparison in the
  proof script). A mismatch stops the run (instrument
  non-determinism, never re-scored).

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- DIAG-GO iff ALL hold on the fresh legs:
  (a) passability determined (reachable/unreachable + path
  length + blocking cells named, or a null with the exact
  blocker) for EVERY stranded wake cell on 15215;
  (b) passability determined the same way for every
  stranded wake cell on every OTHER seed that strands on
  the fresh legs, with the coverage expectation of >= 2
  other stranded seeds — BANK-COMPOSITION CLAUSE (written
  before any judged leg, so this is definition, not
  re-scoring): if the fresh bank strands fewer than 3
  seeds in total, full coverage of 100% of the stranded
  wake cells that exist satisfies (b)'s intent, and the
  verdict reports GO with the shortfall named in plain
  words ("only N seeds strand on this bank; the >= 2-other
  expectation is unmet by bank composition, not by
  measurement"). What would fail (b) is an UNMEASURED
  stranded wake cell, never a seed that does not strand;
  (c) full cost ledger (direct + food-first) for every
  stranded morning;
  (d) affordability verdict with counts for both variants;
  (e) design-answer brief written (behavior required, cost,
  whether ANY stranded night on this bank is rescued, what
  remains a Steve call vs measured fact).
  Otherwise DIAG-NO-GO, with the exact blocker named.
  In particular: if passability cannot be established from
  the harness (recorder failure, nulls without cause, or
  equivalence failure), that is DIAG-NO-GO — never guessed.
- SECONDARY (reported, NO bar): per-seed strand lengths
  (fresh guard vs ON); per-cluster river-bank / bridge-use
  breakdown; canFell counts at stranded mornings
  (axe gate); adjacent-perceived counts (perceptionHints
  rule); canSee counts; observed forage-yield distribution
  on stranded days; tick slack at evening.
- INSTRUMENT bars: recorder errs == 0 on judged legs;
  determinism re-run byte-identical; walktree == woodday
  baselines on per-seed creek/still/rescued (equivalence);
  guard legs 0 warmth acted (warmth is ON-leg only).
- SENSE-TEST: one full stranded day read end to end on the
  fresh ON corpus (a 15215 strand day: full day say lines +
  wood-short line + morning snap, judged for meaning and
  coherence, not just counts), plus the wake-tile grid
  read as the villager would meet it (what stands where,
  what blocks, what the river does).
- NO behavior probe is built, run, or judged in this arm.
  An opt-in measurement recorder is the only new script
  with engine contact, and it acts on nothing.

## Forbidden (violations void the run)

- Re-tuning or re-testing the adjacent-morning-cut probe
  (R1/R2); building any walk-to-tree behavior as a game or
  policy change; any microMove/cutTree/forage call from a
  measurement script; any state edit outside engine verbs
  (none are made at all); quoting woodday censuses as
  current-base behavior without the fresh re-derivation
  above; touching sibling loop A's trees, claims, or
  branches; touching the main tree; writing sweep outputs
  to /tmp (worktree evidence/ only).

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether the
  morning-funded ledger scope matches what "rescue" means
  for a villager whose day then proceeds through
  competent.daily (the ledger holds the bridge reserve but
  cannot price the day's unobserved business — the observed
  evening kcal is the check); whether findPath's BFS (with
  its no-corner-cutting rule) matches the steps a villager
  would actually walk (microMove steps one square at a
  time, same adjacency — stated, and any divergence is a
  finding); whether canSee is the right LOS channel for a
  villager noticing a tree (its home is monster vision —
  the evidence file must say so, and must not present LOS
  as the perceptionHints channel, which is adjacent-only);
  whether the >= 2-other-seeds coverage expectation fits a
  bank that strands on very few seeds (see the bank-
  composition clause above — the next prereg should set
  coverage as "every seed that strands" from the start).
- If the verdict is DIAG-GO, the next step is a Steve call
  on the behavior (sense step + walk + cut as a bot
  behavior, or warmth-rule change), NOT another measurement
  of the same mornings. If DIAG-NO-GO, the next run must
  name the blocker and fix the instrument, not re-ask the
  question on the same legs.
