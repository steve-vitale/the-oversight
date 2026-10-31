# sim-tickfell-a — prereg (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0643Z,
arm sim-tickfell-a, axis food-economy, tracker next-blank (1)
(strand-fix design reckoning: a near-minimal routine — fed +
axe mornings still need a day-part-cheap wood move), adjacent
to (NOT duplicating) Loop B's landed deadfall duty (a haven
staffing duty for sticks/fiber; this arm is a field-morning
fell by the stranded villager itself, no duty, no haven
staffing, no stick gathering).

Worktree sim-tickfell-a. POLICY PROTOTYPE ONLY: one new
policy file (scripts/policies/tickfell-diag.js), zero edits
to any existing policy file, zero src/js changes, zero
policy-default flips. New files only: this prereg, the
policy, the driver + analyzer + proof scripts named below,
the evidence file, and the corpora/censuses they produce.
Sibling trees never touched; main tree never touched. Do
NOT merge (coordinator merges); do NOT push, bump, or
verify live.

## Canon read first

docs/CANON.md read. No canon doc covers the bridge/fell
tick budget itself: docs/TIME-ECONOMY.md covers ticks and
day-parts (the 96-tick fell cost and the 96-tick bridge
cost both live there as engine constants, verified in code
below), docs/PRESERVATION.md covers food, not wood. The
strand-fix blank itself has no canon doc — stated here
instead of inventing canon. Standing rules that bear on
it: CANON.md's "no silent actions — every action
narrates honestly, including failures" and the perception
law (Steve 2026-10-28: a villager knows only what it
senses — its own tile, its own pack, its own clock).

## Prior evidence read in full before designing anything

- evidence/2026-10-30/sim-strandfix-morning-b.md (morning
  wood-seek NO-GO: no engine verb yields pack wood until
  an axe-tier tool arrives; the one morning a fell
  succeeded, its 96 ticks stranded that evening).
- evidence/2026-10-30/sim-strandfix-ticks-b.md (creek-wake
  hold: removing routine ticks rescues ticks-short
  evenings only, never wood-short ones).
- evidence/2026-10-31/sim-selecttrim-a.md (walk-preserving
  trim: saves 1-3 social ticks, cannot clear the 3-tick
  day-10 hole; trim day-10 evening 451 -> 448).
- evidence/2026-10-30/sim-tickbudget-b.md (tick anatomy:
  morning dayTicks 256/384 after harness waits, routine
  17-33 on field strand days, day-7 haven routine 81;
  bridge gates 4 logs / 60 kcal / 96 ticks, order wood,
  kcal, ticks).
- evidence/2026-10-30/sim-warmfuel-b.md (warmth eats 4
  bridge logs on strand nights; protecting them restores
  the 3-night guard strand, not the ON strand).
- evidence/2026-10-31/sim-lackingline-a.md (census
  method reused here: strand = maximal runs of still
  creek evenings on consecutive loop-days; bridge gates
  4 / 60 / 96; first-failure order wood, kcal, ticks;
  strand set on its base: 15215 only, guard 7-9, ON 7-16).
- evidence/2026-10-30/sim-axearrival-a.md (read in
  addition, because axe presence decides whether this
  arm can fire at all: on the strandfix-variant stack
  the axe arrives day 15 by corpse loot from Ethan and
  fells day 17 (fed, 2368 kcal) into a ticks-short
  evening (23 ticks left); on the warmed-only control
  stack the same seed NEVER holds an axe in 30 days on
  that base. Axe presence on THIS base and THIS stack
  is therefore RE-DERIVED by the pilot's morning axe
  snaps, never inherited — and the day-1 stash-fetch
  (15337, loopDay 1 evening) is a different seed/stack,
  cited only as the "automatic day-1 tool arrival" the
  brief names, not as 15215 evidence).

## The prototype (exact, no mid-run swaps)

Stack: tickfell(warmed(woodcarry(nighttravel))) — the
lackingline census stack, plus one new outer wrapper.
Env-gated: TICKFELL=1 arms it; TICKFELL=0 (or unset)
delegates to inner.daily untouched, so control legs run
the identical stack with the identical driver.

On a STRAND MORNING — the previous evening's woodcarry
record is outcome travel-refused, bucket creek, rescued
false; the villager wakes NOT at haven and NOT inside
haven; not game-over; not in combat — BEFORE
inner.daily, the wrapper may attempt AT MOST ONE fell:

1. PACK GATE: if pack wood >= 4, skip 'pack-ready'
   (no fell needed).
2. TARGET: BFS over non-blocking cells of the OCCUPIED
   tile's own 9x9 detail grid (the ground the villager
   stands on — perception law; no other tile, no
   roster) to a stance adjacent to the nearest
   tree/bigtree. Choice rule, as in strandfix-morning:
   smallest path, tie bigtree > tree, then row-major.
   No reachable tree/bigtree: skip 'no-target'.
3. TOOL GATE, CHECKED FIRST: read
   Game.cutInfo(targetCell).canFell BEFORE any cutTree
   call. If canFell is false, skip 'tool-gate' and make
   ZERO cutTree calls that morning — never a refused
   fell, never a re-attempt (backlog #1590 lesson: a
   person stops after the first refusal; here the check
   means there is not even a first refusal — the 2-tick
   hint cost in the engine's cutTree wrapper is never
   paid). If cutInfo is unavailable, skip
   'cutinfo-unknown', likewise with zero cutTree calls.
4. KCAL FLOOR: if morning kcal < 80 (the fell's own
   engine cost), skip 'kcal-floor'. No evening-kcal
   prediction is attempted: evening kcal depends on
   the day's routine forage, which the morning cannot
   know; morning kcal, post-fell kcal, and evening
   kcal are all recorded for audit.
5. TICK GATE (the judged gate): projected evening
   ticks = morningTicksLeft - walkSteps*1 - 96 -
   ROUTINE_ALLOWANCE, where morningTicksLeft =
   TICKS_PER_DAY - morningDayTicks (512 base, read
   from Game.TIME), walkSteps = BFS path length
   (microMove costs 1 tick per step, verified in
   game.js), 96 = the fell's engine tick cost
   (cutTree tickAction(96)), and ROUTINE_ALLOWANCE =
   40 ticks. The allowance is the ceiling of measured
   FIELD strand-day routines (17-33: selecttrim spy
   guard d9 19 / d10 18 / d11 17, ON d12 25 / d13 33;
   tickbudget anatomies agree), rounded up. The
   day-7 81-tick routine is EXPLICITLY excluded: it
   is a haven-departure day, never a strand morning,
   and budgeting it would forbid every fell. Fire
   iff projected >= 96 (the bridge gate itself).
   Otherwise skip 'ticks-gate' and skip wood-seeking
   ENTIRELY that morning (no brush, no second verb,
   no walk-and-see — the skip is the behavior).
6. ONE FELL: a single Game.cutTree call on the chosen
   target. After it, stop regardless of pack (a tree
   yields 2-4, a bigtree 4-6, lore x1.5 ceil — a
   0-pack villager may still sit short of 4 after one
   fell; that is the rule, and the next strand morning
   may fell again). If a walk step fails
   (microMove false), skip 'walk-blocked' and make no
   fell attempt from afar. Recorded per attempt:
   morning wood/kcal/dayTicks/ticksLeft, tool tier
   and toolName, target cell/kind, walk steps and
   their tick/kcal spend, projection inputs and
   result, post-fell wood/kcal/dayTicks, and the
   evening's woodcarry record + ticksLeft + kcal for
   audit of projection error (actual evening ticks
   minus projected).

Context, not gates: the 448 too-late-sleep threshold
(waitsalign: an evening ending at dayTicks <= 448
rolls the day in sleep and wakes at morning dayTicks
384 — 128 ticks left — while >= 449 wakes at 256 —
256 left) explains why a fell that lands its evening
at <= 448 tightens TOMORROW's morning; it is not a
gate in this prototype, because the gate already
reads the decision morning's ticksLeft, which
reflects the sleep roll and the harness waits. The
projection's audit (step 6) will show whether a
fired fell ever lands its evening at <= 448.

The wrapper draws NO RNG itself (BFS order and target
choice are fixed; cutTree's yield lottery is the
engine's own, exactly as in strandfix-morning). It
never calls travelTo and never writes game state
except through microMove and the single cutTree.
Every strand morning carries a record — attempt or
skip with reason — and every morning carries an axe
snap (woodcutTier tier/name + canFell), so a
never-fires pilot is provable, not asserted.

## Primary metric

The stranded-evening census on seed 15215, guard + ON
legs, extracted exactly as in lackingline: still =
woodcarry bucket creek + rescued false; rescued =
bucket creek + rescued true; strand = maximal run of
still evenings on consecutive loop-days. Reported per
leg: creek / still / rescued counts, strand runs,
per-evening (wood, kcal, ticksLeft) at refusal time,
and the tickfell attempt/skip record for the morning
following each still evening.

## GO threshold (use as tasked; judged exactly as written)

Definitions: a BOTH-EVENING is a loop-day whose
evening is still on BOTH control legs (guard-control
AND ON-control), re-derived on this base (on the
lackingline base these were loop-days 7, 8, 9). A
both-evening is RESCUED on a tickfell leg iff that
leg's woodcarry record for the same loop-day is
bucket creek + rescued true. STRAND LENGTH per leg
is BOTH its total still-evening count AND its
maximal still-run length. A DEATH MOVES EARLIER iff
a tickfell leg's first death day (any death in the
run's death record, or a game-over before day 30)
is earlier than its same-WOODWARM control leg's, or
the tickfell leg dies while its control survives
30 days.

GO iff ALL of: (a) >= 1 both-evening is rescued on
at least one tickfell leg; AND (b) strand length
does not increase on EITHER tickfell leg versus its
same-WOODWARM control leg (neither the total still
count nor the maximal run length may increase on
either leg); AND (c) no death moves earlier versus
the control legs. Otherwise NO-GO. A pilot with
zero tickfell attempts (no axe-tier strand morning,
or every axe morning ticks-gated) scores 0 rescues
and is NO-GO — the gate never reaching is a finding
about the substrate, not a pass.

## Staged method (docs/MEASUREMENT.md §§9-12, 14-15)

- PILOT (before any confirm spend): seed 15215 only,
  4 legs — control guard (TICKFELL=0, WOODWARM=0),
  control ON (TICKFELL=0, WOODWARM=1), tickfell guard
  (TICKFELL=1, WOODWARM=0), tickfell ON (TICKFELL=1,
  WOODWARM=1). Pilot passes the gate to confirm ONLY
  if the GO clauses above all hold on the pilot legs.
  If the pilot strand shape differs from the expected
  guard 7-9 / ON 7-16, the deviation is reported in
  full and the census covers what exists.
- CONFIRM (only if pilot GO): the 9-seed band from
  waitsalign (15003, 15009, 15091, 15211, 15220, 15221,
  15337, 15376, 15439) x 4 legs (same guard/ON x
  control/tickfell split). Prior arms show no seed
  but 15215 strands on this bank, so the confirm is
  a REGRESSION band, not a second rescue hunt:
  reported per seed are rescue counts, any
  lengthening, and any earlier death. Confirm
  overturns pilot GO ONLY if it shows a lengthening
  or an earlier death on any band leg; zero rescues
  outside 15215 do not overturn it, because there
  are no strands there to rescue.
- HORIZON: DAYS=30, death-aware (driver endReason;
  dead villages stop simulating; no fixed-200d).
- SUBSTRATE (env gates asserted FATAL by the driver;
  confirmed from lackingline/tickbudget/warmfuel, no
  deviation): POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  WOODCARRY=1, DAYS=30. Guard legs WOODWARM=0, ON
  legs WOODWARM=1. PRESSB unset/0 on all legs (no
  variant legs in this arm). Tickfell legs add
  TICKFELL=1 only. STRANDFIX is deliberately NOT in
  the stack: this arm tests the tick gate on the
  census stack, not on top of strandfix-morning.
- INSTRUMENTS (new, this arm): scripts/policies/
  tickfell-diag.js (the prototype above);
  scripts/tickfell-trace-a.js (driver adapted from
  scripts/kcalshort-trace-b.js: same warmed stack +
  tickfell wrapper, same evening/morning records,
  plus morning axe snaps and the tickfell store
  exported per file; OUTDIR override only, no
  behavior change to the stack when TICKFELL=0);
  scripts/analyze-tickfell-a.js (pure reads: strand
  extraction, both-evening overlap, rescue check,
  length comparison, death comparison, projection
  audit, axe-presence table); scripts/
  test-tickfell-a.js (proof).
- §15 PANEL: not applicable, declared here as in
  the prior strand DIAG arms. scripts/balance-panel.js
  runs sweep-compare registry policies on 150-day
  horizons with its own scorecard; it cannot express
  the nighttravel+woodcarry+woodwarm strand stack,
  the 30-day creek-evening census, or an env-gated
  single-mechanism probe, and a 150-day win/vest
  panel would measure a different question on a
  different substrate. The comparison here is
  control-vs-tickfell legs on identical seeds
  through the census analyzer, and is never labeled
  a panel comparison.
- METRIC BINDING (§14): the GO bar above binds. A
  miss is NO-GO, never re-scored against a friendlier
  metric mid-run (in particular: a fell that yields
  wood but does not rescue a both-evening is NOT a
  rescue; a strand that vanishes because the
  trajectory diverges away from the creek is NOT a
  rescue; a shorter strand bought by an earlier death
  fails clause (c)). Metric doubts go under "metric
  review" in the evidence file, and any revision
  applies to the NEXT run.
- SENSE-TEST (law): read the fullDaySay on still
  evenings and on any fell day end to end, and judge
  meaning: does the fell day read as a person
  choosing wood over the bridge, or as a verb fired
  into a void?

## Pinned base

Worktree HEAD at prereg writing time:
3c03d468bbd6f752a35da27aaa535601538a1d15 (branch
sim-tickfell-a). The prereg commit adds only this
file, so the legs run on pinned-base game/policy code
verbatim (plus the new files added after this commit,
which the proof's tracked-diff guard checks are new
files only, never edits).
