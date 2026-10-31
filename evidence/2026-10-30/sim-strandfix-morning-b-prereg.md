# sim-strandfix-morning-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
arm sim-strandfix-morning-b, axis food-economy (strand-fix morning
recovery, DESIGN measurement). Worktree sim-strandfix-morning-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file, ONE new default-OFF
policy file (scripts/policies/strandfix-morning-diag.js, env-gated
STRANDFIX=1/0). No default is flipped by this arm; a GO verdict
certifies the DESIGN measurement for the coordinator / Steve, it
does not land or enable the behavior. Sibling trees, claims,
branches, and Loop A work (sim-w4join-a, sim-ammo-a) are never
touched. The main tree is never touched. The strand set is
re-derived by THIS arm's own legs on the pinned base; no sibling
arm's output is used as input (prior evidence files were read in
full for design grounding only).

## The question (next step after the priced strand)

Prior evidence, read in full before designing anything:
sim-kcalshort-b.md (strand evenings fail on food AND wood
jointly: ON 9/13 kcal-short, 7/13 wood-short, 5 both-evenings;
every kcal-short evening at exactly 0 kcal; pack food 0 on all
13 evenings while the home pantry holds 21,968–30,581 kcal),
sim-fedexile-b.md (fed mornings convert to wood-seeking days
0/4 — the routine has NO wood move on the wake tile at all:
0 adjacent sources, 8 whole-tile bigtrees, no walk, no verb,
no gain), sim-warmfuel-b.md (warmth spends 4 bridge logs on
ON nights 9, 11, 12, 13; protected-log counterfactual shortens
the strand 7 nights sequentially but rescues only 2 evenings
independently, because late evenings are kcal-bound too),
sim-tickbudget-b.md (8 ticks-short evenings; press-decisive
stranding is 1 evening, routine-attributed stranding is the
replicated one — day 7 on all 4 legs), sim-strandbank-b.md
(strand set 15215 only, guard 7–9, ON 7–16, on its base).
The strand is already fully priced. This arm is the next step
the task orders: a strand-fix DESIGN measurement — a morning
recovery lever that tries a JOINT food+wood recovery on strand
mornings, with every cost priced, instead of a default flip or
a single-gate lever (which kcalshort already proves cannot
move the both-evenings).

## Canon (read before judging)

- docs/CANON.md read first, then docs/PRESERVATION.md (food
  ladder; unknown food is not food until identified) and
  docs/TIME-ECONOMY.md (forage 16 ticks + 60 kcal effort;
  fell a tree 96 ticks + 80 kcal; clear brush 32 ticks +
  40 kcal; eat 1 tick; microMove 1 tick + walkStepKcal
  per step, base 2 kcal; bridge needs 4 logs, 60 kcal,
  96 ticks). No canon doc covers strand-morning recovery —
  the engine facts below are code reads, stated, not
  invented canon.
- Perception law (Steve 2026-10-28, binding): the food gate
  reads ONLY the wake 3x3 via pressb-diag's prePressSweep
  (species only where already assigned, only the villager's
  own plantKnown flag — the exact pressb gate, reused
  without editing pressb-diag.js). The wood scan reads ONLY
  the occupied tile's own 9x9 detail grid (the ground the
  villager stands on, the same tile the player sees) — no
  other tile, no roster, no snapshot feed, no whole-map
  scan. The walk stays inside the occupied tile. No
  policy-drawn RNG: BFS order and verb order are fixed;
  forage yield and cutTree yield lotteries are the
  engine's own, exactly as in woodday/pressb.

## Definitions (the judged quantities)

- STILL EVENING: an evening row whose woodcarry record has
  bucket 'creek' AND rescued false. STRAND: a maximal run
  of consecutive loop-days whose evening rows are all still
  evenings. STRAND LENGTH = count of still evenings.
- STRAND MORNING: the morning (loopDay) opening a day that
  ends still, PLUS the boundary morning after the last
  still evening (pressb's actionable form: a live policy
  can only see the PREVIOUS evening, so the gate below
  fires on mornings after a still evening, including the
  boundary morning — boundary rows are flagged, never
  hidden).
- STRANDED-MORNING GATE (policy, exact): previous loop-day's
  woodcarry record (ctx._wcLast, read at daily entry before
  woodcarry's own daily resets it) has outcome
  'travel-refused', bucket 'creek', rescued false; current
  wake tile type is not 'haven' and scholar is not
  insideHaven; not game-over; not in combat. If the gate
  fails, the policy records a skip and delegates untouched.
- RAW-GATE CLASSIFICATION (per evening, never the bridge
  skip alone): from the woodcarry classification at refusal
  time — woodPlayer vs 4 logs, kcalLive (fallback kcal,
  named if used) vs 60, ticksToDayEnd vs 96. Classes:
  ticks-only, kcal-only, wood-only, both (wood+kcal),
  ticks-plus-wood, ticks-plus-both, ticks-plus-kcal,
  neither/other (reported, never assumed absent). This is
  kcalshort's classification logic, copied with attribution
  into scripts/analyze-strandfix-morning-b.js.
- RECOVERY ATTEMPT: one strandfix morning on which the gate
  fires and at least one phase acts (food forage/eat and/or
  walk/verb). Every attempt carries its full price (see
  Implementation): kcal and ticks per phase, wood delta,
  stop reason. A morning on which the gate fires but every
  phase skips is a SKIP, not an attempt, with its skip
  reasons recorded.
- WOOD DELTA (per attempt): woodAfter minus woodBefore
  across the whole morning recovery (food phase changes no
  wood; walk+fell/brush change it). DAYTIME WOOD DELTA
  (secondary cross-check): evening woodPlayer minus that
  morning's morningWood.
- DEATH-DELAY (per seed): variant bearer-death day minus
  control bearer-death day where both legs have a bearer
  death (deaths-stream entry with player true); CENSORED
  where either leg has none. EndReason pairing per seed.
- WALL NUMBERS: national / table / wins, wave reach (1–5),
  median survival, per seed. Expected: structural zeros on
  national/table/wins — the 30-day evening legs contain no
  national/table/win content (pre-seat, no field) —
  reported as the window's structural value with that
  reason, not as a game verdict.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash 7917b1d19cd9b898e54c168a5cf4f201ff02f53c. The
  prereg commit adds ONLY this file, so all legs run on
  pinned-base game code verbatim. Nothing is quoted from
  any prior arm's censuses, strand days, or death-days as
  current-base behavior: fresh baselines, control legs,
  OFF legs, and variant legs are all re-derived on this
  pin and judged against those fresh numbers. Divergence
  from prior values is DRIFT to report (driver diff first,
  then base diff), never a failure to hide.
- Tracked diff guard: at evidence time, `git diff` of src/
  between pinned base and final tree must be EMPTY, and
  scripts/policies/ must differ from base by EXACTLY the
  one new file (scripts/policies/strandfix-morning-diag.js).
  New files are otherwise measurement scripts only
  (scripts/strandfix-trace-b.js, scripts/analyze-
  strandfix-morning-b.js, scripts/test-strandfix-morning-b.js)
  plus evidence files.

## Implementation (reuse, no reinvention; exact behavior, no mid-run swaps)

- NEW POLICY (one file): scripts/policies/strandfix-morning-diag.js.
  Env gate: STRANDFIX=1 arms it; unset/0 delegates to
  inner.daily untouched (the OFF leg runs the same stack
  with STRANDFIX=0). It wraps OUTSIDE the warmed stack:
  strandfix(warmed(woodcarry(nighttravel))) — same position
  as pressb, so the previous-evening record is readable at
  entry and the morning carry (at-haven only) never co-acts
  with a strand morning (away only). It NEVER stacks with
  pressb: variant legs run STRANDFIX=1 with PRESSB unset/0,
  so the food phase below is the arm's own press, not a
  double forage. It NEVER calls travelTo, never writes
  game state except through the engine verbs named below
  (forage, eat, microMove, cutTree, clearBrush), never
  draws RNG itself. At most one attempt per loop-day.
  Recording errors are counted in store.errs and never
  thrown into the engine.
- PHASE 1 — SECURE KCAL (priced, first, always before wood):
  morningKcal and ticksLeft snapshotted at entry.
  (a) If morningKcal >= 80: foodPhase 'already-fed', no
  verb (80 = one fell's effort cost; the villager can
  already afford wood). (b) Else if the wake 3x3 sweep
  (pressb prePressSweep, reused verbatim via require, no
  edit) holds >= 1 known-food cell AND ticksLeft >= 17:
  Game.doAction('forage') then Game.eat(), recording
  kcalAfterPress, E (pressTotals, reused verbatim via
  require), kcalAfterEat, realizedNet = kcalAfterEat -
  morningKcal, ticksSpent. (c) Else if pack food kcal > 0
  (sum over scholar.inventory of kcalEach * units for
  kcalEach > 0): Game.eat() only, foodPhase 'eat-only',
  realizedNet recorded. (d) Else foodPhase skip:
  'no-known-kcal' (or 'ticks-short' if ticksLeft < 17).
  The food phase NEVER claims wood: its wood delta is 0
  by construction and is recorded as such.
- PHASE 2 — WOOD-SEEK (only after phase 1; priced, never
  assumed): proceeds only if pack wood < 4. Target scan:
  snapshot the occupied tile's genDetail grid; collect
  tree/bigtree/bush cells. BFS over non-blocking cells
  (Game.cellProps(cell).blocks, guarded; fallback blocking
  set tree/bigtree/water/wall/tent/fire) from the wake
  cell to a STANCE cell — a non-blocking cell with
  Chebyshev distance <= 1 to a target cell (trees block,
  so the stance is adjacent, never on the tree; bushes do
  not block, so a bush cell is its own stance). Target
  choice: smallest BFS path length; tie-break bigtree >
  tree > bush, then warmth scan order (self + 8 neighbours
  order extended row-major). Walk: microMove step by
  step along the BFS path, recording each step's result;
  stop on a false return ('walk-blocked'), on combat, or
  on game-over. Verb loop at the stance, in scan order
  over adjacent wood cells (target first): while pack < 4
  and fells < 2: adjacent tree/bigtree with kcal >= 80
  and ticksLeft >= 96 -> Game.cutTree; adjacent bush
  with kcal >= 40 and ticksLeft >= 32 -> Game.clearBrush;
  else stop with reason ('kcal-floor', 'ticks-floor',
  'fell-cap', 'sources-exhausted', 'pack-ready'). Every
  verb records woodBefore/woodAfter, kcal/ticks
  snapshots, and any engine error. Wood-phase price:
  kcalSpentWood = kcalAfterFood - kcalAfterWood (walk
  2 kcal/step base via walkStepKcal, fell 80, brush 40 —
  recorded as spent, never assumed from the table),
  ticksSpentWood, woodDelta, stopReason.
  CONSTRAINTS RESPECTED, NOT ASSUMED AWAY: (1) strand
  mornings hold 0–44 kcal on the woodday finding, below
  both the bridge cost (60) and the felling cost (80) —
  so a wood attempt WITHOUT a successful food phase is
  expected to stop at 'kcal-floor' on most mornings, and
  the evidence reports the kcal floor as the binding
  reason per morning rather than treating wood alone as
  the lever; brush (+1 wood, 40 kcal) is the only wood
  verb affordable below 80 kcal and is reported as such
  wherever it fires. (2) The routine has NO wood move on
  the wake tile (fedexile 0/4) — so CONVERSION is the
  measured quantity (attempts with woodDelta > 0 /
  attempts; mornings reaching pack >= 4 / strand
  mornings), never an assumed walk-to-tree behavior:
  if the BFS finds no target, or every walk fails, or
  every verb stops at a floor, that is the finding.
  (3) Ticks are a third gate (tickbudget): every phase
  records ticksLeft before/after, and every evening
  reports ticksToDayEnd + its raw-gate class, so a
  morning spend that strands by time is visible as a
  ticks-short evening, not hidden inside a wood story.
- DRIVERS (reuse where possible, disclosed adaptation
  where no verbatim driver exists): (i) FRESH BASELINES:
  scripts/woodday-trace-b.js VERBATIM (WOODDAY=0),
  OUTDIR override only, guard + ON. (ii) CONTROL LEGS:
  scripts/kcalshort-trace-b.js VERBATIM, OUTDIR override
  only, guard + ON (its stack is identical to the OFF
  leg's stack; its pantry/pack snapshots are recorded
  but are not judged fields here). (iii) VARIANT + OFF
  (det-gate) LEGS: scripts/strandfix-trace-b.js, adapted
  from scripts/pressb-trace-b.js with ONLY these changes:
  the pressb wrapper swapped for the strandfix wrapper,
  the strandfix store attached to each evening row as
  row.strandfixAttempt / row.strandfixSkip (same loopDay
  mapping as pressb's), fullDaySay stored on still
  evenings AND on strandfix-attempt mornings, file
  naming strandfix-b-*, log wording strandfix. Every
  other line (stack, recording, write transport, env
  gates) is unchanged; the diff vs pressb-trace-b.js is
  verified to contain only those changes. No existing
  driver file is edited. All drivers share the substrate
  env (asserted FATAL): POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank order below.
- ANALYZER: scripts/analyze-strandfix-morning-b.js (new,
  pure reads): fresh-baseline census, det-gate comparison
  (OFF vs fresh, per-seed), control/variant strand
  extraction + pairing by WOODWARM leg, per-evening
  raw-gate table for the strand set (both legs), attempt
  table (price per attempt: food E/realizedNet/ticks,
  wood delta/kcalSpent/ticks/stopReason), conversion
  rates, death-delay + endReason pairing, guardrail
  census, wave reach, wall numbers, and the §15 paired
  compare .md (see Panel section).
- PROOF: scripts/test-strandfix-morning-b.js — pure unit
  tests (BFS target choice incl. tie-breaks and blocked
  stance; verb-loop floor logic incl. brush-only below
  80 and fell-cap; raw-gate classification for all eight
  classes + kcalLive fallback; strand extraction; det-gate
  comparison function) PLUS corpus checks (corpora
  present for all 10 bank seeds on all judged legs;
  errs 0; attempt/skip tables cover 100% of strand
  mornings on variant legs; determinism byte-identical;
  src/ diff empty; policies/ diff exactly the one new
  file). Proof runs on the judged corpora; pure tests
  run standalone.

## Legs (all on pinned base, 30 loop-days, bank order)

Bank (10 seeds, strand-bank order): 15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337, 15376, 15439.
Horizon justification (30 loop-days, reused from the
strand substrate, NOT a fixed 200d): the strand cycle
closes inside it on every prior base (guard 7–9, ON
7–16, both < 30); longer horizons add no strand
information on this bank. Death-aware: the driver
records daysAlive / endReason per seed and stops at
death; the +10d tail rule from MEASUREMENT does NOT
extend this strand substrate (task order). Any leg
death is reported per seed, never averaged away.
- PILOT GATE (before any confirm spend): first 8 bank
  seeds, ON-variant leg only (STRANDFIX=1, WOODWARM=1),
  into evidence/2026-10-30/sim-strandfix-morning-b-corpus-pilot-on-variant.
  SNIFF TEST (instrument-function, NOT outcome): all 8
  files present, errs 0, the strand seed (15215, 5th in
  bank order) present with strand mornings recorded, and
  the strandfix gate reached on its strand mornings (at
  least one attempt OR skip row for a 15215 strand
  morning). If the strand is lost on this base (15215
  strands nowhere) the pilot FAILS and the run stops
  with NO-GO at pilot — no confirm spend. If the
  instrument crashes or errs > 0, the pilot FAILS and
  the run stops. Pilot files are NEVER mixed into judged
  corpora (separate OUTDIR, quoted only as gate numbers).
  A pilot with zero wood conversions does NOT fail the
  sniff test — conversion is the judged outcome, and
  prejudging it at pilot would void the prereg.
- FRESH BASELINES (not judged legs, det-gate reference):
  woodday driver, guard + ON, all 10 seeds, into
  evidence/2026-10-30/sim-strandfix-morning-b-corpus-base-guard
  and -base-on.
- JUDGED LEGS (confirm, all 10 seeds each): control
  (kcalshort driver) guard + ON; OFF det-gate (strandfix
  driver, STRANDFIX=0) guard + ON; variant (strandfix
  driver, STRANDFIX=1) guard + ON. Corpora:
  evidence/2026-10-30/sim-strandfix-morning-b-corpus-control-guard,
  -control-on, -off-guard, -off-on, -variant-guard,
  -variant-on.
- DET-GATE (binding, before any GO judgment): the OFF
  legs must reproduce the fresh baselines EXACTLY on
  per-seed creek/still/rescued counts, strand nights,
  and evening woods (woodcarry classification woodPlayer
  per still evening). Any mismatch stops the run: the
  instrument is non-neutral and no GO judgment is made.
  (The OFF legs also cross-check the kcalshort control
  legs: identical stacks must give identical censuses;
  any OFF-vs-control mismatch is reported as a driver
  difference and investigated before judging.)
- DETERMINISM re-run: 15215 variant ON leg re-run
  (SEEDS=15215, same env) into
  evidence/2026-10-30/sim-strandfix-morning-b-corpus-determinism,
  byte-compared to the judged 15215 variant ON file. A
  mismatch stops the run (instrument non-determinism,
  never re-scored).

## Bars (GO, judged exactly as written; a miss is NO-GO, never re-scored)

Primary metric: stranded nights (still-evening count) on
the strand seed(s) vs control, across guard + ON legs.
- GO iff BOTH: (a) strand nights fall by >= 3 on a
  strict majority of strand legs, where a strand leg is
  a variant leg (guard-variant, ON-variant) on which a
  strand exists, compared against its same-WOODWARM
  control leg (control strand length minus variant
  strand length, still evenings; variant legs with no
  strand do not enter the denominator, and a variant
  leg with no strand where its control strands counts
  as a fall equal to the full control length — the
  strand was eliminated, which exceeds the >= 3 bar
  only if the control length was >= 3); AND (b) at
  least 1 both-evening is converted to rescued /
  bridge-built, where CONVERTED means: a variant-leg
  evening row with rescued true (woodcarry bridge
  attempted + built, or retry arrived at haven) on a
  loop-day that is a still evening on the same-WOODWARM
  control leg, AND whose variant morning carries a
  strandfix attempt (food and/or wood phase acted).
  The warmfuel distinction is reported alongside, never
  substituted: sequential shortening (first-rescue day
  and still evenings avoided after it) AND independent
  per-evening rescue (evenings whose own raw gates pass
  on the variant leg) are both tabulated, so a shortening
  achieved only by avoiding later both-evenings is not
  misread as converting them.
- Control for the comparison is the kcalshort control
  leg (cross-checked by the OFF leg per the det-gate).
  If control and OFF censuses differ, the GO judgment
  is suspended pending investigation — the run reports
  NO-GO (instrument disagreement) rather than picking
  the friendlier control.
- Otherwise NO-GO: the arm reports NO-GO with the exact
  bar that failed (a, b, det-gate, determinism, or
  proof); instrument scripts + evidence commit as a
  measurement record labeled NO-GO. On GO the verdict is
  a DESIGN-MEASUREMENT verdict only: it certifies that
  the morning-recovery design moves the strand under the
  bars above; it does NOT flip STRANDFIX on, land any
  behavior, or change any default — the landing decision
  stays with the coordinator / Steve.
- SECONDARY (reported, NO bar): per-evening raw-gate
  tables for the strand set on control + variant legs
  (every strand evening classified, zero unclassified or
  the run reports the gap); kcal cost of EVERY recovery
  attempt (food phase realizedNet + ticks; wood phase
  kcalSpent + ticks; totals per attempt and per strand);
  wood delta per attempt and conversion rates (attempts
  with woodDelta > 0 / attempts; mornings reaching pack
  >= 4 / strand mornings; fed mornings reaching pack
  >= 4); death-delay + endReason pairing per seed;
  wave reach (1–5) and wall numbers; villager-behavior
  sample + one sense-read strand story (below).
- SENSE-TEST: one strand story read end to end on the
  variant corpus (a converted or best-attempt strand
  morning's full day lines from waking through the
  evening, plus the recovery narration, judged for
  meaning: does it read as a person securing food and
  working toward wood, or as verbs firing without
  sense?) plus a villager-behavior sample out of the
  sims (goals, routines, dialogue, reactions; anything
  robotic, static, or repeated is flagged, not chased
  mid-run — appended to sim-findings.md per loop rules).
- PANEL (§15): the official balance-panel driver cannot
  express this arm — its policies are sweep-compare
  registry policies, not the nighttravel+woodcarry+
  woodwarm strand stack, and the 23-metric contract has
  no strand-length / recovery-cost / conversion metrics
  (same standing as sim-fedexile-b and sim-tickbudget-b).
  The §15 compare attached to the evidence is therefore
  the paired compare .md written by
  scripts/analyze-strandfix-morning-b.js (per-seed
  paired control-vs-variant on the pre-registered
  metrics + guardrail metrics: survival, death causes,
  wave reach), with this deviation stated on its face.
  Running the official driver on a different stack /
  horizon would measure a different question and is NOT
  done as a substitute. The compare .md is never
  presented as an official panel run.

## Forbidden (violations void the run)

- Any src/js change; any edit to scripts/policies/* or
  any other existing policy file (require-only reuse of
  pressb-diag.js helpers is not an edit); flipping any
  default (STRANDFIX ships default-OFF and stays OFF);
  quoting any prior arm's strand days, death-days, or
  wave reach as current without the fresh legs above;
  using any sibling arm's output as this arm's strand
  set; touching sibling trees, claims, branches, or the
  main tree; writing sweep outputs to /tmp (worktree
  evidence/ only); stacking pressb with strandfix.

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether strand
  length in still evenings (vs days-to-return incl. the
  rescue day) is the right "exile days" unit (still
  evenings are the nights spent stuck; the return day is
  reported alongside so the reader can re-judge under
  either unit); whether "majority of strand legs" over
  two variant legs (guard, ON) is satisfiable without
  the warmfuel literal-reading trap (here the denominator
  is variant legs only, stated in the bar, so a
  warmth-off guard leg with no strand does not veto a
  warmth-live ON result — and the per-leg falls are
  tabulated so any reader can re-judge under a
  both-legs reading); whether the converted-both-evening
  bar's control-day mapping is right (a variant rescue
  on a control-still day is conversion only if the
  variant morning attempted recovery — a rescue with no
  attempt on that morning is reported as a non-attempt
  rescue, not counted toward bar (b)); whether the
  same-day conversion window misses next-day effects
  (the evidence reports the variant strand's full
  day-range against the control's, so a rescue landing
  one day later is visible in the shortening, not
  hidden); whether the line-scan / numeric-delta
  cross-check misses a walk that never acts (a walk
  toward a tree that never verbs leaves microMove say
  lines? microMove itself says nothing — the evidence
  states this limitation plainly: walk steps are
  recorded in the policy store, not in say lines, so
  the store is the walk instrument and the day lines
  are the sense instrument, and a store-recorded walk
  with no verb is reported as walk-without-verb, never
  as conversion).
- If the verdict is GO, the next step is the
  coordinator's / Steve's landing decision on the
  morning-recovery design (default flip, rework, or
  hold), NOT another measurement of the same mornings.
  If NO-GO, the next run must name the bar that failed
  and fix the design or the instrument, not re-ask the
  question on the same legs.
