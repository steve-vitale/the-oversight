# sim-walktree-b — walk-to-tree middle: the design answer, measured

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1030Z,
arm sim-walktree-b, axis food-economy. Worktree sim-walktree-b.
DIAG ONLY: measurement, zero src/js changes, no default flips,
no behavior probe built, run, or judged. Sibling loop A trees
never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-walktree-b-prereg.md (commit c97a7099d).
Pinned base 56b4cbe74aca227a354cdb2db5440a3514253876 (worktree
HEAD at prereg time). Primary question: on the woodwarm bank,
can a villager micro-walk from a stranded wake cell to a
bigtree on the same tile, what does the full walk-to-tree-and-
cut sequence cost, and does it rescue ANY stranded night?
DIAG-GO bar: passability determined for all stranded wake
cells on 15215 + every other seed that strands (coverage
expectation >= 2 other stranded seeds, with the pre-registered
bank-composition clause — see below); full cost ledger;
affordability verdict with counts, both variants; design-
answer brief written. If passability cannot be established
from the harness, DIAG-NO-GO with the exact blocker named —
never guessed. No balanced-panel compare .md: zero src/js and
zero policy changes, so there is no game-root delta for a
panel to compare (same standing as the woodday prereg).

## Fresh baselines — NO DRIFT (re-derived on the pinned base)

Woodday driver verbatim, OUTDIR override only, same env as
woodday (POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank 15003,
15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439;
all 10 seeds survived 30 days on every leg):

| leg | creek | still | rescued | warmth acted | log-spent |
|-----|-------|-------|---------|--------------|-----------|
| guard (fresh) | 15 | 4 | 11 | 0 | 0 |
| ON (fresh) | 21 | 11 | 10 | 6 | 4 |

These reproduce the woodday numbers exactly (guard 15/4/11,
ON 21/11/10, warmth 6/4, 15215 guard strand days 7–9, ON strand
days 7–16, same evening woods). The woodday censuses are
therefore consistent with current-base behavior, but every
judged number below is fresh — nothing is quoted from them
as the measurement. The recorder legs reproduce these fresh
baselines exactly on every per-seed creek/still/rescued count
(EQUIVALENCE BAR: MATCH on both legs), so the recorder is
proven behavior-neutral and every passability number below
is measured on the true trajectory, not a perturbed one.

## Bank composition (pre-registered clause invoked, plainly)

On the fresh legs, only TWO seeds strand at all: 15215 (ON
strand days 7–16; guard days 7–9) and 15009 (single still
evening day 13, both legs). The task's ">= 2 other stranded
seeds" expectation is therefore UNMET BY BANK COMPOSITION,
not by measurement: there is no third stranded seed on this
bank to measure. Per the prereg's bank-composition clause
(written before any judged leg), full coverage of 100% of
the stranded wake cells that exist satisfies the bar's
intent. What is measured: 11 stranded mornings (10 field +
1 haven morning, see below), 19 bigtree clusters, zero
unmeasured wake cells, zero recorder errors. The shortfall
is named here, not hidden, and it is a property of the bank
(the strand is a 15215 story plus one 15009 night), not a
gap in the measurement.

## Stranded mornings (what was measured)

A stranded morning = the morning snap of a loop-day whose
evening is bucket creek + rescued false. ON leg: 11 mornings.

| seed | loopDay | wake tile | wake cell | morning kcal | morning wood |
|------|---------|-----------|-----------|--------------|--------------|
| 15215 | 7 | 4,4 haven | (4,7) | 2364 | 4 |
| 15215 | 8 | 2,5 creek | (0,0) | 44 | 4 |
| 15215 | 9 | 2,5 creek | (0,0) | 0 | 4 |
| 15215 | 10 | 2,5 creek | (8,0) | 0 | 3 |
| 15215 | 11 | 2,5 creek | (8,0) | 31 | 3 |
| 15215 | 12 | 2,5 creek | (0,0) | 0 | 2 |
| 15215 | 13 | 2,5 creek | (0,0) | 0 | 1 |
| 15215 | 14 | 2,5 creek | (8,0) | 0 | 0 |
| 15215 | 15 | 2,5 creek | (8,0) | 25 | 0 |
| 15215 | 16 | 2,5 creek | (0,0) | 0 | 0 |
| 15009 | 13 | 0,2 forest_floor | (8,0) | 34 | 4 |

Day 7 is a HAVEN morning (the bot woke at home, traveled out,
and was refused ticks-short that evening) — it is counted in
the 11 because its evening is still-refused, but it is NOT a
field wake: it holds 0 bigtrees, the pile stands at home,
and the walk-to-tree question does not apply to it. The
field mornings are the other 10. All field mornings wake
with insideTent reading null at the snap (no tent state —
no tent-exit step stands between waking and walking).
The 15215 field wake tile is the SAME tile (2,5, creek) on
all 9 mornings, with the SAME grid (nothing was felled, so
the grid never changed) — the two wake cells are its entry
corners, alternating (0,0) / (8,0) exactly as woodday said.

## 1. PASSABILITY — the measured answer

Instrument: the engine's own findPath (BFS, 8-directional,
no corner-cutting through blocked cells) from the wake cell
to every cut-position (a non-blocking cell Chebyshev <= 1
from a bigtree cell). A cluster is reachable iff at least
one of its cut-positions has a path. Blocking cells are
cellProps.blocks: water, tree, bigtree, wall, tent, fire.

### The wake tile's grid (15215, tile 2,5, creek — identical all 9 field mornings)

Rows y=0..8, cols x=0..8 (BT = bigtree, ~~ = water, == = bridge):

```
y\x 0     1      2      3      4      5      6      7      8
0   dirt  grass  plant  plant  BT     BT     plant  plant  plant
1   ~~    grass  grass  dirt   BT     BT     plant  dirt   plant
2   ~~    ==     dirt   grass  dirt   dirt   ~~     dirt   plant
3   grass ==     ~~     ~~     dirt   ~~     ~~     grass  dirt
4   grass grass  ~~     ~~     grass  ~~     dirt   ~~     ~~
5   dirt  plant  plant  plant  ~~     dirt   dirt   ~~     ~~
6   grass grass  dirt   dirt   grass  grass  dirt   plant  grass
7   BT    BT     grass  dirt   grass  grass  plant  grass  grass
8   BT    BT     dirt   grass  dirt   plant  grass  dirt   dirt
```

Two bigtree stands: NORTH (4,0),(5,0),(4,1),(5,1) and SOUTH
(0,7),(1,7),(0,8),(1,8). One bridge: (1,2),(1,3). The river
snakes from the north-west corner down to the east edge —
a continuous water barrier — and the north stand seals the
top rows. That geometry decides everything below.

### Per-wake-cell verdict (field mornings)

| wake cell | mornings | north stand | south stand |
|-----------|----------|-------------|-------------|
| (0,0) west corner | 15215 days 8, 9, 12, 13, 16 (5) | REACHABLE, 3 steps, cut (3,0), no bridge | REACHABLE, 7 steps, cut (0,6), VIA BRIDGE (1,2),(1,3) |
| (8,0) east corner | 15215 days 10, 11, 14, 15 (4) | REACHABLE, 2 steps, cut (6,0), no bridge | UNREACHABLE — no path to any cut-position |
| (8,0) forest_floor | 15009 day 13 (1) | (single 8-cell stand (5,0)–(6,3)) REACHABLE, 1 step, cut (7,0), no bridge | — |

Totals: 10/10 field mornings passable (at least one stand
reachable); 15/19 clusters reachable (10 same-bank, 5
across-river, all 5 via the bridge); 4/19 unreachable — all
four are the south stand as seen from the east corner.

### Why the south stand is unreachable from (8,0) — the exact seal

From (8,0) the villager stands in a sealed north-east pocket.
Every way south or west is closed by a named blocking cell:
rows 0–1 are sealed by the north stand itself — (4,0),(5,0),
(4,1),(5,1); row 2 is sealed by water at (6,2); row 3 by
water at (5,3),(6,3); the east column is sealed by water at
(7,4),(8,4),(7,5),(8,5). The bridge (1,2),(1,3) lies OUTSIDE
the pocket — findPath from (8,0) to the bridge itself
returns null (proven live in the proof script), so the
bridge cannot rescue the crossing. The pocket's only exits
would be through a bigtree or through water, and microMove
refuses both. This is not a pathfinding quirk: the river +
north stand form a continuous cut across the tile, and the
single bridge sits on the far side of it. From the west
corner the same south stand is reachable precisely because
the west column walks straight down to the bridge: (0,0) →
(1,0) → (1,1) → (1,2)[bridge] → (1,3)[bridge] → (1,4) →
(1,5) → (0,6), 7 steps.

### Sense channels (recorded beside every passability result)

| channel | result | what it means |
|---------|--------|---------------|
| perceptionHints() rule (the game's own tree-noticing channel, perceive.js: scans ONLY the 3x3 around the player) | 0/11 mornings have a bigtree adjacent to the wake cell | The villager does NOT notice any bigtree on any stranded morning. The perception line is silent. |
| canSee() line of sight (Bresenham; blocked by intermediate tree/bigtree/wall/tent; water does NOT block sight) | 19/19 clusters LOS-visible from their wake cell | The trees are in sight-line — but LOS is monster-vision code, not the noticing channel, and it must not be quoted as "the villager perceives the tree." |
| whole-tile genDetail read (what the map screen shows the PLAYER) | 8 bigtrees on every 15215 field morning | A fact about the tile, NOT a claim about the villager. For a bot, acting on a whole-tile scan with no perception step is the list-feed pattern — reported as such, never counted as perceived. |

The perception consequence is sharp: the ONLY built channel
that would actually tell this villager "there is a fellable
tree here" is silent on every stranded morning. A walk-to-
tree behavior needs a NEW sense step (a deliberate survey
action, a wider noticing radius, or a Steve ruling that
own-tile trees are known) — it cannot ride the woodwarm
precedent, which scans only self + 8 neighbours for a fire
plot, never a whole tile for a target. No landed policy
scans a whole tile to pick a target.

## 2. COST LEDGER — priced from code, not estimated

Per-step walk: 1 tick + walkStepKcal() = 2 kcal at every
stranded morning (live read, not assumed). Fell: 96 ticks +
80 kcal (cutTree). Bridge: 96 ticks + 60 kcal + 4 wood
(buildBridge). Forage: 16 ticks + 60 kcal effort
(ACTION_COSTS.forage). Eat: 1 tick + 0 kcal. Day budget:
512 ticks (TIME-ECONOMY.md).

### Direct variant (walk → cut, morning-funded, bridge reserve held)

| morning(s) | walk steps | walk kcal | fell | sequence ticks | sequence kcal | bridge reserve | total kcal needed |
|------------|-----------|-----------|------|----------------|---------------|----------------|-------------------|
| (0,0) wakes (5) | 3 | 6 | 96t + 80 | 99 | 86 | 60 | 146 |
| (8,0) wakes, 15215 (4) | 2 | 4 | 96t + 80 | 98 | 84 | 60 | 144 |
| 15009 day 13 | 1 | 2 | 96t + 80 | 97 | 82 | 60 | 142 |

Yield if felled: bigtree 4–6 wood (no woodlore on any
stranded morning — woodloreKnown false everywhere, so no
x1.5). Morning wood + 4 >= 4 on EVERY field morning (even
the 0-wood mornings: 0 + 4 = 4) — wood is NOT the binding
constraint. Ticks are NOT binding either: sequence + bridge
= 193–195 ticks of the 512 budget, and observed evening
ticksLeft on field mornings is 109–239 (always >= the 96
the bridge needs). The binding constraints are kcal and
the axe (below).

### Food-first variant (forage → eat → walk → cut)

Same as direct, plus 16 forage ticks + 60 forage effort +
1 eat tick. Break-even edible yield Y* = walkKcal + 80 + 60
+ 60 − morningKcal (the forage must fund itself, the fell,
and the bridge reserve). Y* across field mornings: 162–206
(15009: 168; 15215 (0,0) mornings: 162 at 44 kcal, 206 at
0 kcal; (8,0) mornings: 173–204). Canon forage yield is
~200–650 kcal (TIME-ECONOMY.md) — so the arithmetic says a
good forage COULD fund it, and the ledger judges exactly
that under Y in {200, 425, 650} below. But the eat step
carries a knowledge gate the arithmetic cannot see (see
§3 and the sense-test): on 7 of 9 15215 field strand days,
the day's forage yields ONLY unknown plants — "Not food
until identified — sort them at camp" — and no meal is
eaten at all. A morning forage on the creek wake tile has
no measured edible yield; the Y cases are ceilings, not
promises.

## 3. AFFORDABILITY VERDICT — counts, both variants

Full affordability = kcal check AND axe gate AND passable
AND wood check (prereg definition). Kcal-only counts are
reported alongside so the ledger shows which gate binds.

| variant | full affordable | kcal-only affordable |
|---------|----------------|----------------------|
| Direct (walk → cut) | 0 / 10 field mornings | 0 / 10 |
| Food-first, Y=200 | 0 / 10 | 4 / 10 |
| Food-first, Y=425 | 0 / 10 | 10 / 10 |
| Food-first, Y=650 | 0 / 10 | 10 / 10 |

Rescued stranded nights (either variant, full definition):
0 / 10 field mornings. The haven morning (day 7) is excluded
from these counts — it woke at home with 2364 kcal and the
pile at hand, and its evening failed ticks-short, not on
any ledger in this arm.

Why the full count is zero even where kcal-only passes:
THE AXE GATE. cutInfo('bigtree').canFell is FALSE on all
11 stranded mornings (both legs, both seeds). Live replay
proof: at the 15215 day-8 and day-10 mornings the bot
carries a Stone knife (tier whittle) and a harmonica — no
axe-tier tool at all. storage.js wraps cutTree: without an
axe-tier tool the fell REFUSES (2 ticks, no wood, no 80
kcal spend, "You need an axe to fell this giant"). The
walk can be perfect, the kcal can be funded, the wood math
can work — and the tree still stands, because the bot has
nothing to fell it with. This is a THIRD independent gate
the woodday probe never reached (it gated on pack/kcal/
ticks, never on tools): any future cut behavior on this
trajectory must first solve axe acquisition — craft it,
find it, or take it — which is itself an unbuilt behavior
on this trajectory, not a tuning knob.

Direct kcal alone fails everywhere (morning kcal 0–44 vs
142–146 needed). Food-first kcal passes at Y=425/650 on all
10 field mornings and at Y=200 on 4/10 — but only if the
morning forage yields EDIBLE kcal, which the observed
strand days mostly do not (see sense-test), and the axe
gate still kills every one of them.

### Secondary observation (not a judged bar, labeled as such)

The two most favorable observed evenings — 15215 day 10
(evening kcal 240, ticksLeft 238) and day 14 (150 kcal, 238)
— are "everything but the axe": an evening walk + fell +
bridge would fit their kcal and ticks, and their morning
wood + fell yield covers the bridge. They still fail on the
axe gate alone. An evening-cut insertion point does not
exist in any policy (the evening step attempts the bridge
with the pack as-is), so this is a note for the design
answer, not a second arm: changing WHEN the cut happens
does not change WHAT blocks it.

## 4. DESIGN-ANSWER BRIEF

### What behavior would have to exist

In order, each one a real build, none a tuning:

1. A SENSE STEP. The villager must be able to notice or
   target a bigtree it is not standing next to. Today the
   only tree-noticing channel (perceptionHints) is adjacent-
   only and silent on every stranded morning, and whole-tile
   scanning for a bot is the list-feed pattern. Options are
   a deliberate survey action, a wider noticing radius, or a
   ruling that own-tile trees are known — all Steve calls
   under the perception law, none available by reusing the
   woodwarm adjacent scan.
2. A WALK STEP. Micro-walk within the tile to a cut-position
   along the engine's findPath (which already computes the
   route, bridge included). The walk itself is cheap (2–3
   steps, 4–6 kcal, to the near stand) and the routing
   primitive exists — but the bot has no behavior that
   walks within a tile toward a target, and the far stand
   is reachable only from the west corner via the bridge,
   never from the east corner at all.
3. AN AXE IN HAND. The bot must acquire and carry an
   axe-tier tool. On this trajectory it carries a Stone
   knife (whittle) — the fell refuses outright. Until axe
   acquisition exists on this trajectory, steps 1–2 are
   moot: the sequence cannot complete even once.
4. FOOD FIRST, KNOWLEDGE-GATED. The morning forage must
   yield plants the bot KNOWS are edible (or the bot must
   carry edible food). Observed strand days yield known
   food on only 2 of 10 field mornings; the rest yield
   unknowns that cannot be eaten until identified at camp.
5. AN INSERTION POINT. Morning pre-daily (the only
   policy-side insertion point the stack offers, same as
   the woodday probe) — the walk + cut happen before
   competent.daily's travel, and the evening bridge attempt
   judges the pack the sequence leaves.

### What it costs (when every gate passes)

Direct: 1–3 walk ticks + 2–6 walk kcal + 96 fell ticks +
80 fell kcal + 96 bridge ticks + 60 bridge kcal + 4 wood
(the fell yields 4–6, covering the bridge). Food-first
adds 16 forage ticks + 60 forage effort + 1 eat tick and
needs 162–206 kcal of EDIBLE forage yield. Total day cost
~193–195 ticks (direct) — comfortable inside the 512
budget, with evening ticksLeft to spare.

### Does it rescue ANY stranded night on this bank?

NO. Zero of 10 field mornings are rescued by either
variant under the full definition — not because the trees
are unreachable (they are reachable, cheaply, on every
field morning), but because the sequence is gated three
deep: no axe (all mornings), no morning kcal (all mornings
for the direct variant), and no perceived tree (all
mornings). Even granting the kcal (food-first at Y=425+)
and granting the walk, the axe gate alone still leaves the
rescue count at zero. The walk-to-tree middle, as a
morning behavior on this bank, rescues nothing until the
axe and the sense step exist first. The trees were never
the binding constraint — the villager's hands and eyes
were.

### What remains a Steve design call vs measured fact

MEASURED FACT (this arm, proof 36/36): passability per
wake cell and stand (near stand always reachable in 2–3
steps; far stand bridge-only from the west, sealed from
the east); the exact blocking cells (river waters +
north stand); walk/fell/bridge/forage costs; morning kcal
0–44; axe absence (Stone knife, whittle tier); perception
silence (0/11 adjacent); ticks slack (109–239 evening
ticksLeft); wood sufficiency (bigtree yield covers the
bridge on every field morning); zero rescues.
STEVE CALLS (not measured, not decided here): (a) whether
a villager may notice/target a non-adjacent tree on its
own tile, and by what sense step; (b) whether the bot
should walk-to-cut at all, versus a warmth-rule change
(the woodday finding's fork — this arm does not pick a
side); (c) whether the bot is SUPPOSED to hold an axe by
day 7 on this trajectory, or whether axe-less-ness is
intended (if intended, the walk-to-tree middle is dead
until the trajectory itself changes); (d) whether an
evening-cut insertion point belongs in the design
vocabulary at all. The next step after this arm is a
ruling on (a)–(c), not another measurement of these
mornings.

## Sense-test (law — read end to end, judged for meaning)

Fresh ON corpus, seed 15215, loop-day 8 (first field strand
day), full day lines + grid read as the villager would meet
it:

- Morning: wakes at (0,0) on the creek tile with 44 kcal and
  4 logs. The grid around the bed: dirt underfoot, grass
  and plants east, the north bigtree stand at (4,0)–(5,1)
  three steps away, the river's water at (0,1) hard by the
  west edge, the bridge at (1,2)–(1,3) just south. Nothing
  in the day's lines ever mentions a tree. The villager
  walks the day as the bot always does: wetland, wetland,
  creek — it never stays on the wake tile, never looks at
  a trunk, never lifts an axe it does not own.
- The day's forage is honest about knowledge: "A shot in
  the dark — you take what's green: 5× unknown shoots, 3×
  unknown berries, 5× unknown berries. Into the bag,
  unnamed. (Not food until identified — sort them at
  camp.)" The bot gathers, but it cannot eat what it
  cannot name — which is why the evening ends at 0 kcal
  despite a day of foraging. The food-first variant's eat
  step would meet exactly this wall on 7 of 9 strand days.
- The refusal is honest: "The creek runs fast here — no
  crossing without a bridge or a swim. No bridge tonight —
  0 kcal in hand, and the lashing takes 60." The failed
  fire ("Sparks, then nothing") spends nothing. No wood
  count, bridge line, or fire line contradicts its record.
- The two known-food days read differently and prove the
  contrast: day 10 ("You work the patch with practiced
  hands: 8× Purslane (240 kcal). You eat Purslane (240
  kcal).") and day 14 (5× Purslane, 150 kcal) — the bot
  eats when it KNOWS. Knowledge, not availability, is what
  turns a forage into a meal. That is the same law as the
  tree: the world offers, the villager can only use what
  it perceives and knows.
- Pre-existing ambient wrinkle (same class as woodday,
  not a lie about wood): "fragments by the fire" gossip
  lines continue on this fireless night. Noted, not chased.

PASS: the stranded day reads as a coherent story — a hungry
villager that forages unknowns, learns a little (Green
Thumb gained this very day), and honestly cannot cross —
and the grid read explains WHY the tree is not the answer:
it stands three steps away, unnoticed, un-fellable with a
stone knife, on a morning the villager cannot afford to
swing anything anyway.

## Village assessment (plain words)

The banked villages are the same working villages woodday
saw: all 10 survived 30 days on every leg (ceiling effect
of the window + banking selection, not a survival claim).
The story this arm adds is about the villager's hands and
eyes, not the ground: the stranded villager wakes beside a
creek tile that holds eight big trees, walks to within
three steps of one without ever noticing it, carries a
stone knife that cannot fell it, and holds 0–44 kcal on a
morning that needs 142–146. The middle is not missing
because the trees are far — they are close, cheap to reach,
and LOS-visible. It is missing because noticing, tooling,
and food each fail independently, and all three must pass
for one rescue. Fix one and the count stays zero; that is
why the design answer has to be a ruling about what the
villager is allowed to perceive and carry, not a tuning of
walk costs.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Waves 1–2 in 10/10 banked
villages, waves 3–5 not reached in this 30-day window
(same window as woodday).

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field)
— reported, never zeros. No national, table, or win claim
is made or implied by this run.

## Proof

scripts/test-walktree-b.js: 36/36 checks pass, including:
census totals on both legs; equivalence MATCH (walktree ==
fresh woodday baselines per-seed on both legs); guard warmth
acted 0; recorder errors 0; break-even arithmetic on real
rows (day-8 Y* = 162); live replay of seed 15215 to the
day-8 and day-10 mornings verifying wake cells, Stone-knife
/ whittle tier, canFell false, findPath lengths (3 / 7-via-
bridge / 2), bridge unreachable from (8,0), south cut-
position unreachable from (8,0), and replay grids byte-
equal to census grids; determinism re-run of 15003 ON
byte-identical. Instrument note (disclosed): the pilot
(first 8 seeds, ON) validated trajectory/equivalence, but
its same-bank flag used a BFS without findPath's no-corner-
cutting rule, which leaked diagonally past water corners
and mislabeled the across-river stand as same-bank. The
flag was fixed (corner rule mirrored from findPath), the
pilot corpus was discarded, and ALL judged legs were run
on the single fixed driver version — the judged censuses
above are the fixed-driver numbers, and the proof's live
replay independently confirms the corrected classification
(south stand sameBank false, reachable only via bridge).
Tracked diff guard: src/ and scripts/policies/ between
pinned base and final tree are EMPTY — the recorder driver,
analyzer, and proof are measurement scripts only.

## Metric review

- The morning-funded ledger scope is the right question
  for a morning behavior, but it is a scope, not the whole
  day: the day's own business sometimes nets kcal (day 10
  ends at 240, day 14 at 150), and an evening-cut variant
  would face a different ledger. The evidence file states
  the scope wherever the verdict is quoted; the next
  prereg must not silently re-label a morning ledger as a
  whole-day verdict. The evening observation (both favorable
  evenings still fail on the axe alone) bounds how much
  the scope choice matters here: it does not change the
  rescue count.
- findPath's BFS (with no-corner-cutting) is the correct
  passability instrument for a microMove-walking villager:
  microMove steps one square at a time under the same
  adjacency, and the proof's live replay confirms the
  census paths step-for-step. The pilot's corner-cutting
  leak is the cautionary tale for any future BFS reuse:
  mirror the movement rules exactly, or the bank labels
  lie while the paths stay true.
- canSee is reported as LOS, never as perception: its home
  is monster vision, and the evidence file says so wherever
  the 19/19 figure appears. The perceptionHints channel
  (adjacent-only) is the noticing claim, and it reads 0/11.
  A future prereg that needs a "villager notices X" metric
  must name its channel up front — LOS and noticing are
  different claims and this run keeps them apart.
- The >= 2-other-seeds coverage expectation does not fit
  a bank that strands on two seeds. The bank-composition
  clause handled it cleanly here (full coverage + named
  shortfall), but the next prereg should set coverage as
  "every seed that strands" from the start, with the
  multi-seed expectation stated as a bank property to
  check, not a bar to meet.
- The food-first Y cases (200/425/650) are canon bounds,
  not observed wake-tile yields: observed stranded-day
  edible yields are n=2 (150, 240), both Purslane from
  daytime wetland tiles, not morning creek-tile forages.
  The ledger is honest about this — Y is a ceiling test —
  but a future food-first claim needs a measured morning-
  forage yield on the wake tile itself, not a canon range.
- No metric revision is proposed for the passability or
  affordability definitions: both separated the gates
  cleanly (walk / axe / kcal / ticks / wood each counted
  on its own), which is exactly why the verdict can say
  WHICH gate binds instead of just "no."

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — daytime wood recovery — AXE ACQUISITION
  ON THIS TRAJECTORY: the banked bot carries a Stone knife
  (whittle tier) and no axe-tier tool at any stranded
  morning, so ANY cut behavior (morning or evening) refuses
  before it starts. Is axe acquisition broken, unbuilt, or
  simply later than day 7 on this trajectory? Needs an
  answer before any cut behavior is designed. (evidence:
  sim-walktree-b live replay, 15215 days 8/10.)
- [open] 2026-10-30 — daytime wood recovery — EVENING-CUT
  INSERTION POINT: the two most favorable observed evenings
  (15215 days 10/14) fit an evening walk + fell + bridge on
  kcal and ticks and fail on the axe alone. No policy has
  an evening cut step; whether one belongs in the design
  vocabulary is a Steve call, not a measurement. (evidence:
  sim-walktree-b ON census, 15215 days 10/14.)
- [open] 2026-10-30 — daytime wood recovery — WAKE-TILE
  FORAGE KNOWLEDGE: stranded-day forages yield known food
  on only 2 of 10 field mornings (Purslane, days 10/14); the
  rest yield unknowns that cannot be eaten until identified
  at camp. A food-first recovery needs a measured edible
  yield on the creek wake tile itself, not a canon range.
  (evidence: sim-walktree-b ON corpus full day lines.)

## Files

- Prereg: evidence/2026-10-30/sim-walktree-b-prereg.md
- Evidence (this file): evidence/2026-10-30/sim-walktree-b.md
- Recorder driver: scripts/walktree-trace-b.js; analyzer:
  scripts/analyze-walktree-b.js; proof:
  scripts/test-walktree-b.js
- Baselines (fresh woodday driver): evidence/2026-10-30/
  sim-walktree-b-corpus-base-guard, -base-on;
  censuses: sim-walktree-b-census-base-{guard,on}.json
- Judged recorder corpora: evidence/2026-10-30/
  sim-walktree-b-corpus-guard, -corpus-on;
  censuses: sim-walktree-b-census-{guard,on}.json
- Determinism: evidence/2026-10-30/
  sim-walktree-b-corpus-determinism (15003 ON re-run,
  byte-identical to the judged ON file)
