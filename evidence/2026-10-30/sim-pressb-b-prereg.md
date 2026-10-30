# sim-pressb-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1928Z,
arm sim-pressb-b, axis food-economy (morning-press behavior).
Worktree sim-pressb-b. POLICY-SIDE ARM ONLY: one NEW policy file
(scripts/policies/pressb-diag.js, env-gated, default off), zero
src/js changes, zero edits to scripts/policies/competent.js, no
competent-default flip in this arm — on GO the verdict is LAND
CANDIDATE for the coordinator, never a self-flipped default.
Sibling trees (loop A sim-*-a, gapscomp-*, journey*), sibling
loop-B trees (sim-effdebt-b, sim-tier3watch-b), claims, and
branches are never touched. The main tree is never touched.

## The question (backlog #1553, claimed by this run)

Loop-B arm sim-wakeforage-b (run fleshout-loop-b-20261030T1730Z,
evidence/2026-10-30/sim-wakeforage-b.md) proved the YIELD and left
the BEHAVIOR open: on stranded field mornings a single forage
press on the wake tile yields 540–720 known muscadine kcal on
east-corner (8,0) mornings and nothing on west-corner (0,0)
mornings, deadfall 0 on all presses — but the bot travels away
first, walking past known muscadine. This arm builds the missing
behavior as a competent-policy variant and measures whether it
fires where the food is and banks the proven yield, without
breaking the morning routine.

## Canon (read before judging)

- docs/CANON.md read first, then docs/TIME-ECONOMY.md (forage:
  16 ticks + 60 kcal effort, yield ~200–650 kcal typical, not a
  cap; eat 1 tick + 0 kcal; metabolic burn ~2200 kcal/day),
  docs/MAP.md (one map; creeks block travel; no teleport),
  docs/PERCEPTION.md (perceptionHints scans adjacent only),
  docs/PRESERVATION.md (food ladder; unknown food is not food
  until identified at camp). No canon doc covers morning-press
  behavior or wake-tile forage yields — the engine facts below
  are code reads, stated, not invented canon, and no behavior
  is invented from scratch: the variant uses only the engine's
  own forage verb and eat verb, in the order a person would
  (gather, then eat).
- Perception law (Steve 2026-10-28, binding): villagers know
  only through their own senses. The variant's fire gate reads
  ONLY the wake cell + its 8 neighbours (the exact 3x3 the
  forage sweep works and perceptionHints scans), ONLY species
  already assigned on the tile map (never the backfilling
  cellPlantSpecies call, which draws RNG), and ONLY the
  villager's own plantKnown flag. No whole-tile scan, no
  roster, no snapshot feed is used for any firing decision.
  A list-fed fire is NO-GO, not a finding.
- Effort-debt hazard (backlog #1552, sibling arm sim-effdebt-b
  measuring it): a forage press at 0 kcal drives kcal to −60
  (wakeforage days 10, 14). The variant therefore presses AND
  eats in the same morning step: press-then-eat is one morning
  behavior, and a press without the eat would leave the debt
  standing. The eat uses the engine's own Game.eat() (eats pack
  food most-perishable-first until full; skips unknown and
  inedible items by engine rule), so no unknown is ever eaten
  by this behavior.

## Definitions (the judged quantities)

- WAKEFORAGE STRANDED MORNING (as measured): the analyzer of
  sim-wakeforage-b pairs a morning snap with the SAME loop-day's
  evening row (bucket creek + rescued false); a field morning
  is one whose wake tile type is not 'haven'. Its 15215 ON set
  is days 8–16 (9 field mornings; day 7 haven excluded).
- ACTIONABLE STRANDED FIELD MORNING (this arm's live gate — the
  only form a policy can act on, since a policy cannot see the
  future evening): ALL of (a) the PREVIOUS loop-day's woodcarry
  evening record has bucket 'creek' AND rescued false (read
  from ctx._wcLast at daily entry, before woodcarry's own
  daily resets it — the record the engine's own evening step
  just wrote); (b) the current wake tile type is not 'haven'
  AND the scholar is not insideHaven; (c) the live pre-press
  sweep (see below) contains at least one forageable cell with
  an assigned species the villager knows (plantKnown true).
  On a consecutive strand the two definitions agree on every
  interior morning: wakeforage's days 8–16 are all actionable
  mornings (each follows a still evening). They differ ONLY at
  strand boundaries: the first strand morning wakes at haven
  (excluded by both definitions), and the morning AFTER the
  last still evening wakes stranded on a field tile but its
  day ends rescued (included by the actionable definition,
  excluded by wakeforage's pairing). A boundary morning of
  that kind, if it occurs, IS in this arm's denominator when
  (c) holds, and is reported as a boundary row, never hidden
  and never silently dropped.
- PRE-PRESS SWEEP (live gate, pure reads, zero RNG draws, zero
  state edits): the wake cell + 8 neighbours, clipped to the
  9x9 grid, from genDetail + the tile's plantSpecies /
  bushSpecies maps where already assigned + plantKnown +
  detailRegrow + cellScorched — the wakeforage sweepAnalysis
  logic, reused verbatim in concept (copied into the policy
  file as a small pure function, not imported from the
  recorder, so the policy stands alone). A cell counts as
  KNOWN-KCAL-CAPABLE iff forageable (plant/bush/tree/bigtree,
  not regrowing, not scorched) AND species assigned AND
  plantKnown true. Tree/bigtree cells give deadfall, never
  food (wakeforage: deadfall 0 on the creek tile; no
  tree/bigtree cells in either sweep) — they never satisfy (c)
  on their own, because the gate needs a known FOOD species;
  the gate does not resolve tree-nut species (same limitation
  as wakeforage's recorder, stated).
- PRESS ATTEMPT / FIRE: one doAction('forage') call by the
  variant at daily entry (before inner.daily, i.e. before any
  travel), followed by one Game.eat() call, on a morning
  satisfying the gate above, with game-over false, combat
  false, and ticksLeft >= 17 (16 press + 1 eat). At most one
  attempt per loop-day. A morning satisfying (a)+(b) but not
  (c) is a SKIP (reason 'no-known-kcal'), not a fire and not
  a miss. A morning satisfying (a)+(b)+(c) on which the press
  is attempted counts as FIRED even if the engine refuses it
  (pack-full or canForage-false); the refusal reason and E=0
  are recorded and count against banking, never hidden.
- PRESS E (banked yield of one attempt): known-edible kcal
  added to the pack by the press, computed from the inventory
  diff exactly as wakeforage's replay totals did (new stacks
  plus positive unit deltas on merged stacks; known edible
  items only — unknown lumps and deadfall reported separately,
  never folded into E). REALIZED NET = kcal after press+eat
  minus kcal before press (includes the −60 effort and the
  eat; reported per attempt, never substituted for E).
- PROVEN E (same-base comparator): for each variant denominator
  morning (same seed, same loopDay), the press yield measured
  on the CONTROL trajectory by the wakeforage replay driver
  (scripts/wakeforage-replay-b.js, unmodified, WAKEFORAGE=1)
  run on THIS base, with its pre-press snap equality-gated
  against the fresh control recorder morning (mismatch aborts
  that comparator, never substitutes a neighbouring morning).
  Wakeforage's old-base yields are NEVER quoted as current
  (drift warning #1554: strands move between bases; this base
  is newer than wakeforage's pin 7074478fb).
- DEPLETION (pre-registered mechanism, not a surprise): a press
  harvests its 3x3 cells into dirt + day+2 regrow (wakeforage
  engine fact), so a SECOND consecutive morning on the same
  corner finds the patch picked clean and fails gate (c) —
  it is a SKIP, not a missed fire. The evidence therefore
  reports TWO banking numbers: the PRIMARY ratio (below) over
  denominator mornings only, and a SECONDARY naive table
  (variant total pressE vs control-replay total over ALL
  control stranded field mornings, consecutive-east second
  mornings included) so the depletion cost is visible, not
  hidden behind the primary definition. The naive ratio is
  reported, never judged.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full hash
  c1b310c9614fa3f7f006da5c38ada73833134178. The prereg commit
  adds ONLY this file, so the variant, driver, analyzer, and
  proof are built on pinned-base game code verbatim. This base
  is NEWER than wakeforage's pin, so NOTHING is quoted from
  wakeforage's censuses or yields as current-base behavior:
  control legs, variant legs, and replay comparators are ALL
  re-derived on the pinned base and judged against those fresh
  numbers. Divergence from wakeforage values is DRIFT to
  report (driver diff first, then base diff), never a failure
  to hide.
- Tracked diff guard: at evidence time, `git diff` of src/
  between pinned base and final tree must be EMPTY, and
  scripts/policies/ must contain exactly ONE addition
  (pressb-diag.js) with competent.js byte-identical to base.
  The driver, analyzer, and proof are measurement scripts only.

## Implementation

- VARIANT POLICY (this run's own new file):
  scripts/policies/pressb-diag.js, exports withPressb(inner,
  store) + newStore() + the pure pressDecision gate (unit-tested
  by scripts/test-pressb-b.js). Env PRESSB=1 arms it; PRESSB
  unset/0 delegates to inner.daily untouched (the control leg
  runs the SAME driver with PRESSB=0, so wrapper overhead is
  identical on both sides). The wrapper reads ctx._wcLast at
  daily entry (previous evening), computes the pre-press sweep
  by pure reads, decides via pressDecision, and on FIRE
  snapshots pack/kcal/say-count, calls doAction('forage') once,
  calls Game.eat() once, and records the attempt (loopDay,
  prevEvening loopDay/bucket/rescued, wake tile/cell, morning
  kcal, known-capable cells, press say lines, E, unknown units,
  deadfall, kcal after press, kcal after eat, ticks spent,
  refusal/error strings). Recording errors never throw into
  the engine (counted in store.errs). The wrapper NEVER calls
  microMove, cutTree, clearBrush, travelTo, or any other verb
  besides forage + eat, and NEVER writes game state except
  through those two engine verbs.
- SWEEP DRIVER (this run's own measurement script):
  scripts/pressb-trace-b.js, adapted from
  scripts/wakeforage-trace-b.js with NO behavior change except
  the policy stack gains the pressb wrapper OUTSIDE the warmed
  stack (pressb(warmed(woodcarry(nighttravel)))) and the
  recorder additionally captures, per morning, the pressb
  store delta for that loop-day and the full day say lines on
  pressed mornings (for the sense read) as well as on
  still-refused creek evenings (as wakeforage did). Same env
  gates as wakeforage (COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1
  WOODWARM=0|1 DAYS=30), plus PRESSB=0|1 (required, explicit).
  OUTDIR default evidence/2026-10-30/sim-pressb-b-corpus-
  <control|variant> (WOODWARM=1 ON legs are the judged legs;
  WOODWARM=0 guard legs run only for the band-reproduction
  report, see below).
- ANALYZER: scripts/analyze-pressb-b.js (pure reads): per-seed
  creek/still/rescued census on control and variant legs;
  denominator mornings + fire rate + banking ratio + naive
  depletion table; per-seed daysAlive / endReason / death-cause
  pairing; off-target fire check (every attempt's prevEvening
  must be creek+still); stall check (evening row per loopDay);
  guardrail metrics (wave reach, survival); and the §15 paired
  compare .md (see Panel section).
- REPLAY COMPARATORS: scripts/wakeforage-replay-b.js
  UNMODIFIED, WAKEFORAGE=1, one per variant denominator morning
  (same seed, same loopDay, WOODWARM=1), JUDGED_MORNING set to
  the fresh control recorder morning row, into
  evidence/2026-10-30/sim-pressb-b-corpus-replay. A comparator
  whose pre-press snap mismatches its control morning is
  UNMEASURED (counts against the banking denominator's
  coverage, never replaced).
- PROOF: scripts/test-pressb-b.js — pure-gate unit tests
  (pressDecision on stub Games: stranded+known fires,
  west-corner no-known skips, haven skips, non-stranded skips,
  combat/game-over skips, ticks-short skips) PLUS corpus checks
  (control/variant pairing, fire rate, banking ratio,
  off-target 0, determinism re-run equality, src/ diff empty,
  competent.js identical to base, policy file is the only
  policies/ addition). Proof runs on the judged corpora; the
  pure-gate tests run standalone on any tree.

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, wakeforage order): 15003, 15009, 15091, 15211,
15215, 15220, 15221, 15337, 15376, 15439. Horizon justification
(30 loop-days, reused from woodday/walktree/wakeforage, NOT a
fixed 200d): the strand cycle closes inside it (wakeforage ON
strand days 7–16, both < 30); longer horizons add no strand
information on this bank. Death-aware: the driver records
daysAlive / endReason per seed and stops at death; any leg
death is reported per seed, never averaged away. Seeds are
nearly free; no judged leg below 8 seeds.

- BAND-REPRODUCTION REPORT (not a bar): control legs
  (PRESSB=0) guard + ON on all 10 bank seeds, census compared
  per-seed to wakeforage's fresh censuses. Base moved since
  wakeforage's pin, so drift is EXPECTED (see #1554); the
  report names it. The judged set is the FRESH control strand
  set, whatever it is (bank-composition clause, same standing
  as wakeforage's prereg: full coverage of the stranded field
  mornings that exist satisfies the bar's intent; a seed that
  does not strand is a bank property, never a bar to lower).
- PILOT (8 seeds, before any confirm spend): control ON +
  variant ON on the first 8 bank seeds (15003, 15009, 15091,
  15211, 15215, 15220, 15221, 15337), plus replay comparators
  for every pilot variant denominator morning. Pilot checks:
  driver errs 0, press records present on fired mornings,
  denominator mornings identified on both legs, no day
  rollover, replay snap equality on all comparators. A pilot
  instrument failure stops the run (fix the instrument, never
  the bar). Pilot legs ARE judged legs (bank seeds), not extra
  draws.
- CONFIRM (16 seeds, only on pilot GO): control ON + variant ON
  on the full 10-seed bank PLUS 6 fixed extension seeds chosen
  HERE, before any leg: 15600, 15601, 15602, 15603, 15604,
  15605 (not cherry-picked for stranding; they are regression
  + opportunistic strand data — if they do not strand, their
  trajectories must be byte-identical control-vs-variant, which
  is itself the gate-leakage check). Plus replay comparators
  for every confirm variant denominator morning. Confirm bars
  are the same as pilot bars, judged on the confirm set (pilot
  seeds included — the confirm set is a superset, not a fresh
  draw, stated so the N is honest).
- DETERMINISM re-runs: 15215 variant ON leg re-run
  byte-identical; one replay comparator re-run byte-identical.
  A mismatch stops the run (instrument non-determinism, never
  re-scored).

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- PILOT-GO iff ALL hold on the pilot 8 seeds:
  (a) FIRE RATE >= 80%: attempts / denominator mornings, where
  denominator = variant-leg mornings satisfying the actionable
  gate (a)+(b)+(c) above (live pre-press sweep, not the control
  leg's mornings — a morning the variant already harvested the
  day before is a SKIP, not a denominator morning);
  (b) BANKING RATIO >= 80%: sum of variant pressE over
  denominator mornings / sum of same-base replay PROVEN E over
  the corresponding control mornings (same seed, same loopDay),
  over denominator mornings whose comparator exists (an
  UNMEASURED comparator removes that morning from BOTH sums
  and is reported; if comparators cover < 100% of denominator
  mornings, the ratio is reported with the coverage shortfall
  named, and GO requires coverage 100% — a missing comparator
  is NO-GO, never guessed);
  (c) NO MORNING-ROUTINE REGRESSION: no seed loses > 10 days
  of daysAlive variant-vs-control; no variant death-cause or
  endReason absent from that seed's control leg (any variant
  death while its control survives 30 days fails (c) outright,
  regardless of the 10-day bar); variant errs == 0; every
  variant leg has an evening row for every loopDay up to its
  daysAlive (no stall, no skipped day); OFF-TARGET FIRES == 0
  (every attempt's prevEvening is creek+still and its wake tile
  is not haven — a fire on any other morning fails (c)).
  (d) determinism re-runs byte-identical (variant leg + one
  comparator); proof test green on the pilot corpora.
  Otherwise PILOT-NO-GO: KILL the lever (no default change;
  instrument scripts + evidence commit as a measurement record
  labeled KILLED). A press that fires but banks ~0 fails (b)
  and is a KILL, not a tweak-and-rejudge.
- CONFIRM-GO iff (a)–(d) hold on the 16-seed confirm set with
  the same thresholds. On CONFIRM-GO the verdict is LAND
  CANDIDATE — reported to the coordinator with branch, commits,
  and evidence; competent defaults are NOT flipped by this
  arm. On CONFIRM-NO-GO the verdict is KILLED, same handling
  as pilot.
- REGRESSION NOISE BAR (stated honestly, part of (c)): the
  30-day window has an all-survive ceiling on the wakeforage
  base (10/10 survived 30 days on every leg), so daysAlive
  differences of 0 are expected and the >10-day bar is
  deliberately loose — the binding regression signals are any
  variant death, any stall, and any off-target fire, which
  fail (c) on their own. No seed is judged on a single-day
  wobble: a 1–2 day daysAlive difference with identical
  endReason and no death is reported as noise, not a fail.
- SECONDARY (reported, NO bar): per-seed creek/still/rescued
  variant-vs-control (does morning kcal change any evening
  outcome? day-10-type evenings are expected to stay wood-
  gated — a rescue change is reported, never assumed); naive
  depletion table (variant total vs control total over ALL
  control stranded field mornings); realized net kcal per
  attempt; unknown units + deadfall per attempt; wave reach
  (1–5) and wall numbers (national / table / wins — NOT
  OBSERVABLE on 30-day evening legs, reported as such, never
  zeros); villager-behavior sample (below).
- SENSE-TEST: one pressed morning read end to end on the
  variant corpus (full day say lines from waking through the
  evening, plus the press + eat narration, judged for meaning:
  does it read as a person eating what they know is there,
  not a robot farming?) plus a villager-behavior sample out
  of the sims (goals, routines, dialogue, reactions to events;
  anything robotic, static, or repeated is flagged, not chased
  mid-run — appended to sim-findings.md per the loop rules).
- PANEL (§15): the official balance-panel driver cannot express
  this arm — its policies are sweep-compare registry policies,
  not the nighttravel+woodcarry+woodwarm strand stack, and the
  23-metric contract has no press/fire/banking metrics (same
  standing as sim-armorstock / sim-shellrevive-b, whose
  analyzers document the deviation). The §15 compare attached
  to the evidence is therefore the paired compare .md written
  by scripts/analyze-pressb-b.js (per-seed paired control-vs-
  variant on the pre-registered metrics + guardrail metrics:
  survival, death causes, wave reach), with this deviation
  stated on its face. Running the official driver on a
  different stack/horizon would measure a different question
  and is NOT done as a substitute.

## Forbidden (violations void the run)

- Any src/js change; any edit to scripts/policies/competent.js
  or any other existing policy file; flipping a competent
  default; a pressb fire outside the gate above (in
  particular: no fire on haven mornings, no fire without a
  previous still-creek evening, no fire without a live known
  cell); any verb besides forage + eat from the variant;
  quoting wakeforage's old-base yields as current without the
  fresh same-base replay comparators above; touching sibling
  trees, claims, branches, or the main tree; writing sweep
  outputs to /tmp (worktree evidence/ only).

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether the live
  pre-press sweep (assigned species + plantKnown) is the right
  "has known kcal" test, versus the press itself as the only
  honest revealer (the gate must decide BEFORE pressing, so
  some pre-press test is unavoidable; the sweep test is the
  villager-looking-at-its-feet test, and the evidence must say
  whether any fired press found its known cell empty or any
  skipped morning's press would have yielded — the latter is
  checkable only via replay comparators on skipped mornings,
  which are NOT run here and are named as a follow-up, not
  assumed); whether press+eat (vs press-only) is the right
  behavior unit (press-only would leave the #1552 effort debt
  standing and would not read as eating; the eat step's own
  side effects — eating pre-existing pack food first by
  perishability — must be reported per attempt via realized
  net, not hidden inside E); whether the actionable
  (previous-evening) definition vs wakeforage's (same-day
  evening) definition changes any verdict (boundary mornings
  are reported as their own rows so the reader can re-judge
  under either definition); whether 2200 kcal day-need has any
  bearing here (it does not — this arm's question is the
  morning meal, not the day; day-need is cited only to refuse
  overclaiming, as wakeforage did).
- If the verdict is LAND CANDIDATE, the next step is the
  coordinator's landing decision (plus the design question of
  whether the behavior belongs in competent defaults at all),
  NOT another measurement of the same mornings. If KILLED, the
  next run must name the bar that failed and fix the behavior
  or the instrument, not re-ask the question on the same legs.
