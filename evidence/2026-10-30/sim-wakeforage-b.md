# sim-wakeforage-b — wake-tile forage yield: the measured answer

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z,
arm sim-wakeforage-b, axis food-economy. Worktree sim-wakeforage-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
changes, no behavior probe built, run, or judged. The single
morning forage press in this arm is a measurement instrument
on a discarded replay instance (see below), never bot behavior
in a judged leg, never a landed change. Sibling loop A trees,
the held sim-warmthdisp-b branch, and any gapscomp-/journey*
tree were never touched. The main tree was never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-wakeforage-b-prereg.md (commit
36fd82596, plus pre-leg amendment e09f693b: the replay snap
additionally records nearest-cut walk steps via the engine's
pure findPath read, solely to re-derive the walktree
break-even Y* per fresh morning). Pinned base
7074478fb495c13e9c0b627b4bfec9eb5bf968f1 (worktree HEAD at
prereg time). Primary question (backlog #1513): on the
stranded bank, for every stranded field morning, what does
foraging on the wake tile itself yield — known-edible kcal,
unknown items, or nothing — and does any morning's
known-edible yield cover a day's need?
DIAG-GO bar: yield table complete for 100% of stranded
field mornings on the fresh legs (ON primary + guard
secondary), each row carrying known-edible kcal E, unknown
items, outcome class, say line, sense channel, and the four
verdicts (day-need / self-funding / bridge-covering /
walktree Y*); recorder behavior-neutral (fresh-baseline
equivalence); every replay snap licensed by equality with
its judged morning; determinism re-runs byte-identical;
evidence with sense-tested reads and a metric review.
No balanced-panel compare .md: zero src/js and zero policy
changes, so there is no game-root delta for a panel to
compare (same standing as the walktree prereg).

## Instruments (and two pre-judgment fixes, disclosed)

- Recorder: scripts/wakeforage-trace-b.js (walktree driver
  with walkAnalysis replaced by sweepAnalysis: the 3x3
  forage sweep around the wake cell — cell type, species
  ONLY where already assigned, the villager's own
  plantKnown flag, regrow/scorched flags; pure reads only,
  zero RNG draws, zero verbs). Analyzer:
  scripts/analyze-wakeforage-b.js. Proof:
  scripts/test-wakeforage-b.js (40/40, see below).
- Replay: scripts/wakeforage-replay-b.js (single-target:
  same policy stack and morning-snap code as the recorder,
  stops at the target morning; WAKEFORAGE=0 dumps a control
  snap, WAKEFORAGE=1 verifies the pre-press snap equals
  the judged morning — mismatch aborts loudly, never
  substitutes — then presses doAction('forage') ONCE,
  captures the say lines, inventory diff, and kcal, and
  exits; the instance is discarded). Why a press at all,
  rather than a pure read: a forage yield is RNG- and
  state-dependent (3–5 units per cell times live
  multipliers, species assignment, pack-full gate) and
  cannot be read off the grid — the press IS the
  measurement, on a trajectory proven identical up to the
  snap by the control equality below.
- Fix 1 (before any replay file existed): the replay
  driver's tryWrite passed the string 'recursive' to
  mkdirSync, so the first replay attempts wrote nothing
  (all exits 3, zero files). Fixed to { recursive: true },
  all replays re-run. No number from the failed attempts
  is quoted anywhere — there were no files to quote.
- Fix 2 (found during analysis, before any evidence was
  written): the replay totals counted only NEW inventory
  stacks, but the engine merges unknown lumps into an
  existing pack stack. On 15215 ON day 14 the berries
  (+5 into a 5-stack) were missed, undercounting unknowns
  6 vs the true 11 (the press narration says 6 shoots +
  5 berries). Fixed to count merged-stack unit deltas, and
  ALL press legs were re-run on the fixed driver; every
  number below is a fixed-driver number. The control legs
  were re-run on the same fixed driver version for
  uniformity (their output fields are untouched by the fix).

## Fresh baselines — DRIFT from the walktree base (reported, not hidden)

Woodday driver verbatim, OUTDIR override only, same env as
walktree (POLICY=nighttravel, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1,
DAYS=30, bank 15003, 15009, 15091, 15211, 15215, 15220,
15221, 15337, 15376, 15439; all 10 seeds survived 30 days
on every leg):

| leg | creek | still | rescued | warmth acted | log-spent |
|-----|-------|-------|---------|--------------|-----------|
| guard (fresh) | 12 | 3 | 9 | 0 | 0 |
| ON (fresh) | 18 | 10 | 8 | 6 | 4 |

Walktree's fresh baselines on its pin were guard 15/4/11
and ON 21/11/10. The drift is LOCALIZED, not general:
the 15215 strand is byte-identical in story (guard nights
7–9; ON nights 7–16; ON evening woods 4,4,4,3,3,2,1,0,0,0;
ON warmth 6 acted / 4 logs — all exactly as walktree).
What changed is elsewhere: 15009's still night is GONE
(its creek evening vanished entirely: 1 creek evening on
the walktree base, 0 on this base, both legs), and
rescued creek counts shuffled on 15211 (1→2), 15220
(1→0), 15221 (2→0), 15376 (1→2), 15439 (2→1). Net: −3
creek evenings per leg, all outside the strand. The
judged set below is therefore the fresh set, and the
15009 morning is NOT measured — because on this base it
does not exist, not because it was skipped (see bank
composition). The woodday analyzer run on the fresh
guard corpus independently agrees (12/3/9), so this is
base drift between pins (sibling landings since the
walktree pin), not an analyzer artifact. The recorder
legs reproduce these fresh baselines EXACTLY on every
per-seed creek/still/rescued count (EQUIVALENCE BAR:
MATCH on both legs), so the recorder is proven
behavior-neutral and every yield below is measured on
the true trajectory.

## Bank composition (pre-registered clause invoked, plainly)

On the fresh legs, only ONE seed strands at all: 15215
(ON strand days 7–16; guard days 7–9). The walktree
bank's second stranded seed (15009, one night) is gone
on this base (see drift above). Per the prereg's
bank-composition clause (written before any judged leg),
full coverage of 100% of the stranded field mornings
that exist satisfies the bar's intent, and the shortfall
is named here: the yield table covers 11 press
measurements — 9 distinct ON field mornings (15215 days
8–16) plus 2 guard-leg re-measurements of days 8–9,
which agree exactly with their ON counterparts (E 0/0
both legs). The haven morning (day 7, both legs) is
counted in the coverage accounting (ON stranded mornings
10 = 9 field + 1 haven; guard 3 = 2 field + 1 haven) but
excluded from the yield table, as pre-registered: it
woke at home with the pile at hand, and the wake-tile
forage question does not apply to it. Zero unmeasured
field mornings, zero recorder errors, zero snap
mismatches (11/11 controls and 11/11 pre-press snaps
equal their judged mornings on tile/cell/kcal/wood/grid).

## The wake tile's ground (pre-press sweep, recorder)

The 15215 field wake tile is the SAME tile (2,5, creek)
on all 9 ON field mornings, with the SAME grid (nothing
was felled or foraged there in the judged trajectory, so
no cell is regrowing on any stranded morning). The two
wake cells are its entry corners, alternating exactly as
walktree said. The sweep around each corner is fixed:

- WEST corner (0,0) — days 8, 9, 12, 13, 16 (5 mornings):
  (0,0) dirt, (1,0) grass, (0,1) water, (1,1) grass.
  ZERO forageable cells. Nothing green within reach.
- EAST corner (8,0) — days 10, 11, 14, 15 (4 mornings):
  (7,0) plant — muscadine, KNOWN; (8,0) plant — chickweed,
  unknown; (7,1) dirt; (8,1) plant — mayapple, unknown.
  THREE forageable cells, one known species, two unknown.
  No tree/bigtree cells in either sweep — so no deadfall
  and no wood from any press (deadfall 0 on all 11).

The villager's known set at stranded mornings is exactly
this: muscadine known on every east morning; chickweed
and mayapple unknown on every east morning, through day
15 — the daytime unknown forages elsewhere never teach
them, because unknowns need camp identification and the
strand days end at camp-less creek evenings. The
unassigned-species case never arose on a stranded
morning (every sweep plant cell was already assigned);
the recorder's unassigned flag exists but was not needed.

## 1. THE YIELD TABLE (judged presses, one per morning)

Day-need (primary, prereg-fixed): 2200 kcal — metabolic
burn ~2200 kcal/day (TIME-ECONOMY.md) and scholar needs
2,200 kcal/day (BALANCING.md). Secondary thresholds, all
pre-registered: SELF = E >= 60 (the press pays its own
60-kcal effort); BRIDGE = morningKcal − 60 + E >= 60
(after the press, the 60-kcal evening lashing is still
held); Y* = walkKcal + 80 fell + 60 bridge + 60 forage
effort − morningKcal (the walktree food-first break-even,
re-derived per fresh morning from the replay snap's
nearest-cut steps: west 3 steps × 2 kcal, east 2 × 2).
Verdicts assume the eat step follows the press (1 tick,
0 kcal, as in the walktree food-first variant) — the
press alone leaves kcal negative on 0-kcal mornings (see
below); eating the muscadine is what realizes E.

| morning (15215 ON) | wake | morn kcal | press yield: known-edible E | unknown | outcome | day-need 2200 | self | bridge | Y* | Y* cover |
|---|---|---|---|---|---|---|---|---|---|---|
| day 8 | (0,0) | 44 | 0 | 0 | NOTHING | no | no | no | 162 | no |
| day 9 | (0,0) | 0 | 0 | 0 | NOTHING | no | no | no | 206 | no |
| day 10 | (8,0) | 0 | 540 (6× Muscadine Grapes @90) | 13 (5 shoots, 8 berries) | KNOWN-EDIBLE | no | YES | YES | 204 | YES |
| day 11 | (8,0) | 31 | 720 (8× @90) | 11 (5 shoots, 6 berries) | KNOWN-EDIBLE | no | YES | YES | 173 | YES |
| day 12 | (0,0) | 0 | 0 | 0 | NOTHING | no | no | no | 206 | no |
| day 13 | (0,0) | 0 | 0 | 0 | NOTHING | no | no | no | 206 | no |
| day 14 | (8,0) | 0 | 720 (8× @90) | 11 (6 shoots, 5 berries) | KNOWN-EDIBLE | no | YES | YES | 204 | YES |
| day 15 | (8,0) | 52 | 630 (7× @90) | 18 (7 shoots, 11 berries) | KNOWN-EDIBLE | no | YES | YES | 152 | YES |
| day 16 | (0,0) | 0 | 0 | 0 | NOTHING | no | no | no | 206 | no |

Guard-leg re-measurements: day 8 (E 0, NOTHING, Y* 162)
and day 9 (E 0, NOTHING, Y* 206) — identical to ON.
Known-but-inedible hidden kcal: 0 on every press (no
in-shell nuts in either sweep). Press cost: 16 ticks on
every yielding press; the five NOTHING presses spend
nothing (empty sweep returns before deduction — kcal
unchanged, ticks unchanged). Yielding presses deduct 60
effort: kcal 0→−60 (days 10, 14), 31→−29 (day 11),
52→−8 (day 15) — the engine permits effort debt below
zero; the eat step restores it (0−60+540 = 480 after
eating on day 10, and so on).

Totals: day-need 0/9 ON field mornings (0/11
measurements); self-funding 4/9; bridge-covering 4/9;
Y*-covering 4/9 — in every case the same four east
mornings. Max measured E is 720, barely a third of a
day's 2200. No morning's single wake-tile press covers
a day's need. But the split is not "forage fails": on
east mornings the press is a real meal (540–720 edible
kcal, more than the day's observed Purslane meals of
150–240) that funds the whole walktree food-first
sequence (Y* covered on all four); on west mornings
there is literally nothing to press — the corner the
villager wakes in decides everything, and the villager
wakes west on 5 of 9 field mornings.

Two honesty notes on the numbers. First, E = 720 exceeds
TIME-ECONOMY.md's "~200–650 kcal" forage range on days
11 and 14. That range is a typical, not a cap: 8 units ×
90 kcal muscadine with live codex/thumb multipliers is
what the engine deals at this snap, measured, not tuned.
Second, day 15's Y* (152) falls below walktree's 162–206
range because the fresh morning kcal is 52, not
walktree's 25 (drift in the day's opening kcal, same
formula) — Y* is re-derived per fresh morning, never
copied from walktree.

## 2. DAY-NEED VERDICT (primary, literal)

NO stranded field morning's wake-tile forage covers a
day's need: 0/9 ON field mornings reach 2200 kcal (max
720, day 11/14), and 0/11 measurements including the
guard re-measurements. A single morning press on the
creek wake tile is not a day's food — it is, on east
mornings, a substantial meal that covers the press
itself, the evening bridge lashing, and the walktree
food-first sequence; on west mornings it is nothing at
all. Any food-first recovery design must therefore be
corner-aware: it works (on kcal) only on east-corner
mornings, and it never, on any morning, replaces a day
of foraging — the villager still needs the day's other
forages to reach 2200.

## 3. WHAT THE PRESS DOES NOT FIX

Forage yields no wood. Deadfall is 0 on all 11 presses
(no tree/bigtree cells in either sweep), so a morning
press alone rescues no stranded evening — including
day 10, whose evening fails on WOOD ("the pack holds 3
logs, and a bridge needs 4"), not kcal: the villager
ends day 10 with 240 kcal (Purslane eaten) and still
cannot lash. The press changes the kcal gate only. On
east mornings it funds a fell (kcal-wise) for the
walktree sequence — but the fell itself still needs
the axe (canFell false everywhere, walktree) and the
sense step (see below). On west mornings it funds
nothing. The food-first recovery is therefore a
necessary-but-insufficient middle: east-corner kcal,
plus axe, plus sense, plus walk, before any rescue.

## Sense channels (recorded beside every yield)

| channel | result | what it means |
|---------|--------|---------------|
| Forage sweep scope (engine: wake cell + 8 neighbours) | every harvested cell within Chebyshev <= 1 of the wake cell, on all 11 presses (proof-checked) | The press works exactly the 3x3 perceptionHints scans. No whole-tile read, no roster, no snapshot feed is used for any yield. |
| Villager's own knowledge (plantKnown at the snap) | muscadine known on all 4 east mornings; chickweed/mayapple unknown on all 4 | The E/unknown split IS the villager's knowledge state, not game truth. The press reveals unknowns only by handling (the engine's "handling teaches" rule) — the press is the sense act. |
| Whole-tile genDetail read | NOT used for any yield in this arm | Walktree's grid-presence column was explicitly not-perceived; here it is not even computed for the yield. A yield attributed to a whole-tile scan would be list-fed and NO-GO — none is. |

The perception consequence is the inverse of walktree's:
the villager does NOT need a new sense step to forage
its wake tile — the sweep is already its own 3x3, and
muscadine is already known. What is missing is the
BEHAVIOR (a morning press before competent.daily
travels away), not perception or knowledge. On east
mornings the villager wakes standing in known food and
walks away hungry; on west mornings it wakes standing
in dirt, grass, and water and no behavior could feed it
from that patch.

## Sense-test (law — read end to end, judged for meaning)

Fresh ON corpus, seed 15215, two stranded mornings:

- DAY 8 (west, NOTHING morning): wakes at (0,0) with 44
  kcal and 4 logs, insideTent null (no tent state — same
  as walktree). The day reads coherently as a hungry day
  that never finds food it can eat: it travels wetland,
  wetland, creek; its one daytime forage is "A shot in
  the dark — you take what's green: 5× unknown shoots,
  3× unknown berries, 5× unknown berries. Into the bag,
  unnamed. (Not food until identified — sort them at
  camp.)"; it gains Green Thumb (L1) mid-day and still
  ends at 0 kcal, refused honestly on kcal ("No bridge
  tonight — 0 kcal in hand, and the lashing takes 60"),
  the failed fire spending nothing ("Sparks, then
  nothing"). The replay press on this same morning says
  "This patch is worked out — step to another green
  patch and forage again." — the west patch is empty in
  the morning snap AND the day's own transcript carries
  the same line during the day (tile unlabeled in the
  transcript, so this is consistency, not a claim that
  the bot pressed the wake tile). The morning press
  would have added nothing to this day: the villager's
  problem on day 8 is not a missing press, it is that
  its wake patch holds no food and its day forages
  yield only unknowns.
- DAY 10 (east, KNOWN morning): wakes at (8,0) with 0
  kcal and 3 logs. The day reads as the contrast case:
  it works a wetland patch ("8× Purslane (240 kcal)"),
  EATS it ("You eat Purslane (240 kcal)"), and is then
  refused on wood, not kcal ("the pack holds 3 logs, and
  a bridge needs 4") — while the failed fire costs 70
  kcal (240→170) for "Nothing. Your arms ache." The
  replay press on this same morning yields "You work
  the patch: 6× Muscadine Grapes — and 5× unknown
  shoots, 8× unknown berries you can't name yet." (540
  edible kcal) — known food the villager stood in at
  waking and never pressed, because the day's routine
  travels to wetland first. The day-10 story is therefore
  not "no food" but "food in the wrong order": known
  muscadine at dawn, Purslane at midday, a wood-gated
  evening. A morning press would have left the evening
  still wood-gated (3 logs, press gives no wood) but
  would have put 540 kcal in hand before the fire
  attempt — the kcal gate would not have bound, the
  wood gate still would.
- Press side effects (discarded instances, noted not
  judged): day 14's press deepens Green Thumb to L2
  ("+100% yield"); day 15's press grows Perception and
  grants Trail Eyes (tier 1). Handling teaches — a real
  morning-press behavior would also teach, which is a
  benefit, not a cost, and is not counted in any verdict
  above.
- Pre-existing ambient wrinkle (same class as walktree,
  not a lie about food): "fragments by the fire" gossip
  lines continue on fireless nights. Noted, not chased.

PASS: both mornings read as coherent stories — a hungry
villager that forages unknowns and honestly cannot
cross, and a fed villager refused on wood — and the
press narrations slot into them without contradiction:
the west patch is empty, the east patch is known food
standing uneaten at dawn.

## Village assessment (plain words)

The banked villages are the same working villages
walktree saw: all 10 survived 30 days on every leg
(ceiling effect of the window + banking selection, not
a survival claim). The story this arm adds is about the
villager's feet, not its pantry: it wakes on a creek
tile that holds food, but only on one of its two
corners. Wake east and breakfast is standing there,
known, worth 540–720 kcal — more than any daytime
Purslane meal on this strand — and the villager walks
past it to forage unknowns in a wetland. Wake west and
there is nothing to eat within reach at all: dirt,
grass, and river water, and the engine says so honestly
("worked out — step to another green patch"). A
morning press would feed the villager on 4 of 9 field
mornings and change nothing on the other 5; it would
cover a day's need on none of them, and it would fix
no wood-gated evening on its own. The blank is a
morning behavior on east corners, not more food on
the tile and not more knowledge in the villager — the
knowledge is already there.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Waves 1–2 in 10/10
banked villages, waves 3–5 not reached in this 30-day
window (same window as walktree/woodday).

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field)
— reported, never zeros. No national, table, or win claim
is made or implied by this run.

## Proof

scripts/test-wakeforage-b.js: 40/40 checks pass,
including: census totals on all four legs; equivalence
MATCH (wakeforage == fresh woodday baselines per-seed on
both legs); guard warmth acted 0; recorder errors 0;
yield complete 100% field on both legs (2/2 guard, 9/9
ON); no press aborts; no control or press snap
mismatches; E and unknownUnits recomputed from the
inventory diff (added + merged-stack deltas) on every
press morning; verdict arithmetic recomputed (day-need /
self / bridge / Y* formula) on every press morning; all
sweep cells within the 3x3 of the wake cell; press
narration present on every press morning; determinism
re-runs byte-identical (15003 ON recorder census and
15215 ON day-8 press file); recorder source contains no
verb calls; replay source presses forage exactly once;
tracked diff guard: src/ and scripts/policies/ between
pinned base and final tree are EMPTY — the recorder,
replay, analyzer, and proof are measurement scripts only.
Instrument notes (disclosed above): the replay mkdir
bug (zero files, fixed before any judged replay) and
the merged-lump totals bug (day-14 unknowns 6→11,
all presses re-run on the fixed driver); the recorder
driver's final log line still says "walktree files"
(a cosmetic leftover in the copied driver, data
unaffected — the driver was not edited between legs).

## Metric review

- The single-press unit is the right "morning forage"
  unit, and the engine proves it: a press harvests its
  3x3 cells into dirt + day+2 regrow, so a second press
  on the same morning's sweep would find the cells
  already picked clean ("worked out") — the first press
  IS the morning's wake-tile yield, not a sample of it.
  A morning SESSION of presses on different patches
  would require walking to another patch (a different
  behavior, with its own ticks/kcal), and is out of scope
  for this question, stated as a limitation.
- The 2200-kcal day-need is literal and foregone as a
  single-press bar (canon forage is ~200–650 per press),
  but it is the question as asked ("covers a day's
  need"), and the secondary thresholds exist precisely
  so the design meaning is not hidden behind that NO:
  east mornings pass self/bridge/Y* unanimously, west
  mornings pass none. A future prereg that wants a
  "morning meal" bar should name it as such (e.g. the
  bridge threshold) rather than re-labeling 2200.
- plantKnown at the snap is the right knowledge channel
  for a bot-played scholar: it is the same channel
  app.js uses for the player, and the E/unknown split it
  produces matches the press narration species by
  species (muscadine named, chickweed/mayapple lumped).
  If a separate villager-bot knowledge split exists
  elsewhere in the code, it was not found on this
  trajectory and must be named by a future arm, not
  assumed here.
- The replay press's RNG draws are the draws at that
  exact deterministic snap: control-snap equality (11/11)
  is the license, press determinism (byte-identical
  re-run) is the proof. The one threat — that a press
  in the judged trajectory would draw different RNG
  because the day proceeds differently — does not apply:
  the press is measured AT the snap, before any
  divergence, and the snap equality proves the RNG state
  is the same.
- No metric revision is proposed for the yield split or
  the four verdicts: they separated the gates cleanly
  (known vs unknown vs nothing; day-need vs self vs
  bridge vs Y*), which is exactly why the verdict can say
  the press feeds east mornings, starves west mornings,
  and covers a day's need on none — instead of just "no."

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/wake-forage — EFFORT
  DEBT BELOW ZERO: a forage press at 0 kcal executes
  and drives kcal to −60 (days 10, 14), restored only by
  eating afterwards. Is negative kcal an intended
  "effort debt" or a missing clamp? The verdicts assume
  the eat step follows; a morning behavior that presses
  without eating would leave the villager negative. Needs
  an answer before any morning-press behavior is designed.
  (evidence: sim-wakeforage-b press files, days 10/14.)
- [open] 2026-10-30 — food-economy/wake-forage — MORNING
  PRESS BEHAVIOR MISSING: the bot never presses forage
  on its wake tile; competent.daily travels away first.
  On east mornings it walks past known muscadine worth
  540–720 kcal. Whether a morning press belongs in the
  bot's routine (and on which tiles) is a design call,
  not a measurement. (evidence: sim-wakeforage-b ON
  corpus, 15215 days 10/11/14/15.)
- [open] 2026-10-30 — food-economy/wake-forage — 15009
  STRAND LOST ON THE NEW BASE: the walktree bank's
  second stranded seed no longer strands (or even visits
  a creek evening) on base 7074478fb, and rescued creek
  counts shuffled on four other seeds, while the 15215
  strand is unchanged. Which landing between the
  walktree pin (56b4cbe7) and this pin moved travel/
  routing on those seeds is uninvestigated. Worth a
  drift watch: banks built on strand stories go stale
  when routing moves. (evidence: sim-wakeforage-b fresh
  baselines vs sim-walktree-b censuses.)

## Files

- Prereg: evidence/2026-10-30/sim-wakeforage-b-prereg.md
  (commits 36fd82596 + amendment e09f693b)
- Evidence (this file): evidence/2026-10-30/sim-wakeforage-b.md
- Recorder driver: scripts/wakeforage-trace-b.js;
  replay driver: scripts/wakeforage-replay-b.js; analyzer:
  scripts/analyze-wakeforage-b.js; proof:
  scripts/test-wakeforage-b.js
- Baselines (fresh woodday driver): evidence/2026-10-30/
  sim-wakeforage-b-corpus-base-guard, -base-on;
  censuses: sim-wakeforage-b-census-base-{guard,on}.json
- Judged recorder corpora: evidence/2026-10-30/
  sim-wakeforage-b-corpus-guard, -corpus-on;
  censuses: sim-wakeforage-b-census-{guard,on}.json
- Judged-morning extracts (replay license inputs):
  evidence/2026-10-30/sim-wakeforage-b-judged-mornings/
- Replay corpora: evidence/2026-10-30/
  sim-wakeforage-b-corpus-replay (22 files: 11 control +
  11 press)
- Determinism: evidence/2026-10-30/
  sim-wakeforage-b-corpus-determinism (15003 ON re-run)
  + census-determinism; sim-wakeforage-b-corpus-
  replay-determinism (15215 ON day-8 press re-run,
  byte-identical to the judged press file)
