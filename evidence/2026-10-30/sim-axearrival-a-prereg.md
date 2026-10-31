# sim-axearrival-a — PREREG (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, run fleshout-20261031T0415Z,
arm sim-axearrival-a, axis food-economy. Worktree
sim-axearrival-a. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing driver/analyzer/proof file.
New files only: scripts/axearrival-trace-a.js (recorder
driver), scripts/analyze-axearrival-a.js (analyzer),
scripts/test-axearrival-a.js (proof), this prereg, the
evidence file, the census JSON, and the corpora below.
Sibling worktrees never touched. Main tree never touched.
Nothing is merged by this worker (the coordinator merges);
report status: commit hashes + proof counts + verdict.

## Question (backlog #1587: AXE ARRIVAL UNRECORDED BETWEEN STRAND DAYS 15 AND 17)

On seed 15215's strand trajectory (sim-strandfix-morning-b,
variant ON leg), the villager's woodcut tier rises from
whittle (Stone knife, days 10-15 hint lines) to
fell-capable (day 17 fell succeeds, +5 wood) with no
recorded arrival mechanism: no bearer death in between, no
inventory record in that corpus. Prior arm sim-axeacq-b
found, on other trajectories: 0/26 vessels axe-tier by day
7; hatchet is the only fell-tier item in items.json, not
craftable (no recipe), not scavengeable (no pool entry),
not a contest grant; the only arrivals anywhere were
corpse loot (3 seeds) and succession (2). This arm asks
the narrower, strand-specific question: on the 15215
strandfix-variant trajectory itself, WHEN does the axe
arrive, and BY WHAT dated, event-traced mechanism?

## Trajectory under test (exact reproduction target)

The strandfix-morning-b VARIANT leg, not the warmed-only
stack: strandfix(warmed(woodcarry(nighttravel))) with
STRANDFIX=1, WOODWARM=1. The axeacq bank ON leg (warmed
only) never acquires on 15215, so the warmed-only stack
cannot answer this question — the arrival lives on the
variant trajectory (longer exile, days 7-17, more field
days). Substrate env, asserted FATAL by the driver:
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=1,
STRANDFIX=1, DAYS=30, seed 15215 (pilot + judged +
determinism). Bank check seeds (report only, never
judged): 15003, 15220, 15337, same env, DAYS=30.
A control leg (STRANDFIX=0, WOODWARM=1, seed 15215) is
run for contrast only (does the arrival happen on the
control trajectory, which returns day 17?) — it is NOT a
judged leg and its numbers never enter the verdict.

## Recorder (what is captured, per loop-day)

Adapted from scripts/strandfix-trace-b.js (variant stack
verbatim) + the axeSnap of scripts/axeacq-trace-b.js,
with these additions, all READ-ONLY except the variant
policy's own verbs (which are the trajectory, not the
recorder):

- MORNING snap (post-sleep, pre-daily, loop-days 2+):
  position, morning wood, inventory itemIds + names,
  equipped ids + names, Game.woodcutTier(), Game.cutInfo(
  'bigtree').canFell, vessel villagerId, and (vessel only,
  via getPerson(villagerId)) fullPool + stashed lists.
- EVENING snap (post-daily): the same axe fields
  (inventory, equipped, tier, canFell, villagerId), so
  every arrival brackets to one loop-day (morning->evening
  of one day) or one overnight (evening day N ->
  morning day N+1).
- FULL DAY LINES for every loop-day (uniform, no
  selection): the sense-read and the mechanism trace read
  the arrival day's lines in full, not a tail.
- AXE-EVENT TRACE: defensive wrappers (log only, return
  values and exceptions preserved exactly) around
  Game.lootCorpse, Game.equip, Game.unequip, and
  Game.alienLootGrant where they exist as functions.
  Each entry records loop-day, game day, method, argument
  summary, and hatchet presence + woodcut tier before and
  after the call. The wrappers never call state-editing
  verbs themselves.
- Spawn snap (axeSnap with pool) before loop-day 1.
- Recorder errs counted (axeSnap failures, wrap failures);
  any throw inside a recorder read is caught, counted,
  and never thrown into the engine.

The recorder NEVER calls microMove, cutTree, clearBrush,
forage, eat, travelTo, or any state-editing verb, and
never calls getPerson on NPCs (vessel only).

## Mechanism taxonomy (classification rule, fixed here)

First-axe morning = the first morning snap with
hasHatchet true OR cutInfo canFell true. The bracket is
the interval (previous snap, first-axe morning snap]:
if the previous EVENING snap already holds the axe, the
bracket is that loop-day; else it is the overnight into
the first-axe morning. The mechanism is assigned ONLY
from evidence inside the bracket:

- loot: a lootCorpse wrap entry, or a day line naming a
  hatchet taken from a named body ('You take ... hatchet
  ... from X', 'stripped' lines naming the hatchet).
- succession: vessel villagerId changes across the
  bracket AND a bearer-death record (runDays deaths) names
  the outgoing vessel on the bracket day.
- stash-equip: an equip wrap entry moving a hatchet from
  the vessel's own stashed list to carried/equipped, with
  the morning pool lists showing the shrink.
- grant: an alienLootGrant wrap entry, or a grant line
  naming a hatchet, inside the bracket.
- trade-gift: a day line naming a hatchet given/traded/
  gifted to the vessel inside the bracket.
- craft: named only if a craft line/entry names a hatchet
  (expected impossible: axeacq-b's static scan found no
  hatchet recipe; the proof re-checks it on this base).
- unknown: no bracket evidence names any channel above.
  'Day 17 fell succeeds' alone is NEVER a mechanism — it
  is the symptom that motivated this arm.

## Pre-registered verdict (judge exactly this, no re-scoring)

DIAG-GO iff ALL THREE hold:
(a) the recorder runs COMPLETE for days 7-20 on seed
    15215: a morning snap AND an evening snap exist for
    every loop-day whose game day falls in 7..20, every
    such snap carries a non-null axe read (tier +
    canFell), recorder errs total 0;
(b) the axe arrival is identified as a DATED,
    EVENT-TRACED mechanism: a first-axe day, a bracket,
    a taxonomy class from the list above (not 'unknown'),
    and a quoted day line or wrap entry inside the
    bracket naming that mechanism;
(c) a determinism re-run of the judged leg reproduces
    the SAME arrival day AND the same mechanism (the
    re-run corpus file is byte-identical to the judged
    corpus file).

DIAG-NO-GO otherwise — including the case where the
recorder runs complete but the mechanism stays 'unknown',
and the case where the arrival reproduces on a different
day or by a different mechanism. The bank-check seeds
(15003, 15220, 15337) are REPORTED (any axe-by-day-20
channel that fires there, with day + mechanism or
'none'), never judged and never pooled into the verdict:
n=1 judged + 3 check seeds cannot support a general
claim, and this evidence will not make one.

## What is NOT judged here

- The 0117Z strandfix corpus is NOT re-judged under any
  other metric. A light recorder-neutrality comparison
  (strand nights + 15215 evening classes on this base vs
  the morning-b variant ON corpus) is reported as a
  recorder check only: if the base moved, drift is
  reported honestly and the verdict still rests on (a)-
  (c) above, which are all measured inside this arm's
  own legs.
- No wall numbers are claimed: this is a 30-day
  pre-seat strand trajectory, the same structural window
  as the strand arms. National/table/wins are reported
  as the window's structural values, not a wall verdict.
- No game change is proposed, landed, or enabled by
  this arm. A GO verdict certifies the DIAGNOSIS (the
  arrival mechanism is now recorded), not a fix.

## Canon note (stated, not invented)

No canon doc covers axe/tool acquisition: axeacq-b read
CANON.md, BALANCING.md, TIME-ECONOMY.md, and DESIGN.md
and found no acquisition rule (BALANCING.md prices axe
work; it does not say who holds an axe). This arm reuses
that finding and does not invent one. Engine facts used
here (woodcut ladder, cutInfo gate, hatchet fell tag)
come from src/js/storage.js and src/data/items.json and
are re-checked by the proof's static part on this base.

## Legs (in order)

1. Pilot: SEEDS=15215, variant ON, into
   sim-axearrival-a-corpus-pilot. Gate: file present,
   errs 0, strand mornings recorded, axe reads present
   days 7-20. Pilot files are NEVER mixed into judged
   corpora.
2. Judged: SEEDS=15215, variant ON, into
   sim-axearrival-a-corpus-variant-on.
3. Control (contrast only): SEEDS=15215, STRANDFIX=0,
   WOODWARM=1, into sim-axearrival-a-corpus-control-on.
4. Determinism: SEEDS=15215, variant ON re-run, into
   sim-axearrival-a-corpus-determinism; byte-identical
   check vs the judged file.
5. Bank check: SEEDS=15003,15220,15337, variant ON,
   into sim-axearrival-a-corpus-bankcheck.
6. Analyzer + evidence + census + proof, then commit.
   Proof file scripts/test-axearrival-a.js: taxonomy
   fixture cases, bracket fixture cases, static ladder/
   recipe checks, and corpus checks (files present,
   errs 0, snap completeness days 7-20, determinism
   byte-identical, src/ diff empty, scripts/policies/
   diff empty).

## Pinned base

Worktree HEAD at prereg writing time (recorded in the
evidence file's proof section at closeout; prereg and
instrument commits add tooling/evidence only, so all legs
run on pinned-base game code verbatim — verified by the
proof's tracked-diff guard).
