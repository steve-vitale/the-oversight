# sim-creekremedy-b — DIAG-GO: creek remedy feasible 0/11, wood binds 11/11

Run: oversight-flesh-out-loop-b, arm sim-creekremedy-b, axis
food-economy. Worktree sim-creekremedy-b. DIAG ONLY,
measurement-only: zero src/js changes, zero policy
lever built, zero default flips. This worker does NOT
merge to master — coordinator merges.

Prereg: evidence/2026-10-29/sim-creekremedy-b-prereg.md
(committed before any judged leg). Judge (prereg,
unchanged): DIAG-GO = the question answered with
creek n >= 8, unclassified == 0, recorder errs == 0,
OFF-vs-ON deep-equal zero diffs, determinism re-run
byte-identical. DIAG-GO is NOT a rescue bar and NOT
a lever adoption — it means the feasibility share +
binding constraint are measured on a clean
instrument.

## Verdict: DIAG-GO — the question is answered, and the answer is 0

| Check | Result | Bar |
|---|---|---|
| Creek evenings (ON leg) | 11 | n >= 8 |
| Bridge-feasible share | 0 / 11 = 0.000 (Wilson 95%: 0.000–0.259) | reported |
| Floor-feasible share (kcal-60 >= 200) | 0 / 11 | reported |
| Unclassified | 0 | == 0 |
| Recorder errors | 0 | == 0 |
| OFF-vs-ON deep-equal | 0 diffs, 3 files | == 0 |
| Determinism re-run (seed 11636, ON) | byte-identical | identical |
| Proof | scripts/test-creekremedy-b.js PROOF-GREEN (T1–T6) | green |

## Canon + code finding (step 1, before any leg)

- BRIDGE EXISTS: Game.buildBridge(x, y) — 4 wood from
  the PLAYER's inventory, 60 kcal, 96 ticks, no
  knowledge gate, no skill gate, no occupation gate.
  Permanent until a storm smashes it. The only
  crossing options the engine offers a non-swimmer
  are bridge / swim / go around.
- SWIM is the swimmer SKILL (learnable via
  background/teach), not a System-slot ability.
  A non-swimmer cannot swim a hard creek at any
  cost.
- FORD: MECHANIC ABSENT. No ford verb, cost, or
  tile state anywhere in src/js/game.js or
  src/js/app.js (the only "ford" hit is the village
  name "Stonebridge"). No ford share is reported
  anywhere in this run, because reporting one would
  invent it. A future lever's options are therefore
  bridge or swimmer-teaching — not a ford — unless
  Steve rules a ford into existence.

## Per-seed ON leg (creek / feasible / blocked tile)

| Seed | Creek | Feasible | Blocked tile | Route-around (context) |
|---|---|---|---|---|
| 11636 | 6 | 0 | (5,4), departure (5,5) | 2 steps, all 6 |
| 11707 | 5 | 0 | (4,3), departure (5,3) | 2 steps, all 5 |
| 12027 | 0 | 0 | — | — |

All 11 blocked tiles carry needsBridge true and
bridged null (never bridged). All 11 players are
non-swimmers (expected — a swimmer would not
refuse). All 11 have a 2-step BFS route-around —
context only: the detour lever already covers
route-around-able evenings, and route existence is
never pooled into feasibility here.

## Binding constraint: wood, and only wood

- Wood on hand at refusal: 0 on ALL 11 evenings
  (median 0, max 0). The binding class is wood-short
  on 11/11. A direct Game.woodCount() read on a
  debug re-run of seed 11636 confirms it: the
  refused player's inventory holds no wood item at
  all (spare socks and unidentified goods only).
- Village pile at refusal: 21–69 logs (median 25).
  The wood EXISTS — at haven, where the refused
  villager cannot reach it that evening. The gap is
  "wood not carried," not "wood not existing."
- Kcal at refusal: 6/11 pay the 60-kcal cost in
  full (2300, 668, 100, 2377, 730, 69); 5/11 are
  also kcal-short (0, 0, 0, 0, 0) but wood binds
  first under the prereg order, and wood is the
  ONLY precondition failing on the 6 well-fed
  evenings. Fix kcal alone: 0/11 become feasible.
  Fix wood alone: 6/11 become feasible. Kcal is
  secondary, never sole.
- Time: ticks-to-day-end at refusal 107–255 on
  all 11; a 96-tick build fits inside the remaining
  day budget every time (rollsDay 0/11). Time does
  NOT bind — a bridge habit at the clearhabit
  insertion point (after competent.daily, before
  nightStep) would have the ticks. This closes the
  prereg's open time question on the measured side.
- Floor-feasible (kcal-60 >= 200): 0/11 — 4
  evenings hold kcal >= 260 but still carry 0 wood.

## What this means for the next lever (reported, not built)

A bridge-at-the-refused-evening lever is infeasible
on 11/11 as the game stands, for exactly one reason:
villagers do not carry wood. The precondition a
future lever must create is daytime wood-carrying
(take up to 4 logs from the haven pile before
leaving in the morning, or cut-and-carry during the
day) — that lever needs its own prereg, and this
DIAG is its sizing input: carried-wood >= 4 would
have made 6/11 evenings feasible outright (the
kcal-paying ones) and 5/11 feasible modulo the
kcal floor question. A ford needs a Steve ruling
first; it does not exist to be measured.

## Cross-check vs prior evidence: DIVERGED, explained (not hidden)

Prior counts predicted 17 creek evenings (11636: 10,
11707: 6, 12027: 1). This run's gate-OFF legs yield
11 (6, 5, 0). The divergence is NOT the deleted
habit (on creek evenings the habit took no action
and its probe draws no RNG) and NOT this
instrument (OFF-vs-ON deep-equal holds). The
mechanism, traced end to end on seed 11636:

- The creek episode ends by SUCCESSION, not by
  rescue: the starving player (Rocco Vogel) dies in
  the wild on the night of loop-day 9 ("You go
  down" — Mountain Lord encounter during sleep's
  monster turns), and the mantle passes to Fernanda
  Xavier, who wakes at haven with fresh kcal. The
  clearhabit legs' longer episode (10 evenings)
  ended the same way, later (player death day 13,
  successor home day 14). Death timing differs
  across bases — night-encounter RNG — so episode
  length differs; the refusal mechanism itself
  (creek, same tiles, same departure) reproduces.
- Seed 11707 likewise ends by succession (player
  death by sickness, loop-day 12; 5 evenings).
- Seed 12027 yields 0 refusals here: on current
  master the player is inside at haven on loop-days
  9–11 and only goes away on loop-days 22–30,
  never refused. The blocktype scan's day-9 refusal
  does not reproduce on this base.

The prereg's fallback (extend with remaining
clearhabit pilot seeds) was NOT needed: n = 11
already clears min-n 8. The prior counts are
superseded for this question by these legs, which
are the judged data; the older corpora remain
valid as their own run's record, not as controls
for this one.

## Sense-testing (read end to end, judged for meaning)

- 11636 loop-day 9 (kcal 0, dies that night): the
  day forages, the Mountain Lord follows ("It
  followed you. The Mountain Lord is here."), and
  the tail ends "The creek runs fast here — no
  crossing without a bridge or a swim." Honest
  about the block; silent about the missing wood,
  silent about bedding down, silent about the
  death coming that night (no line can know it).
- 11707 loop-day 8 (kcal 2377, well fed): the
  same refusal line appears TWICE in the tail
  (hop refusal, then repeated) — the engine says
  "bridge or swim" to a villager carrying 0 wood
  and never says "Need 4 wood." A well-fed
  villager with a full belly and empty hands gets
  no actionable next step.
- 11707 loop-day 12 (kcal 0, dies of sickness):
  same refusal line as the last line; the day's
  foraging, gossip, and monster meetings read as a
  normal played day, and the refusal is the honest
  last line.

Judgment: the player understands WHY home is
unreachable (fast creek, bridge-or-swim) but is
never told WHAT THEY LACK (4 logs) or that the
haven pile holds 21–69 logs. The missing line is
not a ford line — it is a wood line: "Need 4 wood
to build a bridge" fires only when buildBridge is
actually attempted, and nobody ever attempts it
from a refused evening. That is a narration gap
for the future lever's prereg to consider, not a
guard issue here (no dishonest line was found).

## Village assessment (plain words)

Three villages, thirty days in, all alive at the
end — but the people inside them turn over. On
11636, Rocco Vogel spends six evenings camped on
a creek bank at (5,5), starving from 2300 kcal to
0 across the episode, and dies in the wild on
night 9; Fernanda Xavier inherits the mantle and
wakes at haven. On 11707, the player starves
across five creek evenings (2377 down to 0) and
dies of sickness on day 12; the successor's later
away evenings (days 14–18) all end home. On
12027, nobody is ever refused — the player is
home on the nights that matter and away only late,
safely. What was missing on every refused night
was the same small thing: four logs in the pack.
The pile at home held them all along. The blank
this run fills is the measurement of that gap
(0/11 feasible, wood binds 11/11); the blank it
documents but does not fill is the carry habit
itself, which needs its own prereg.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30-day evening legs
  (pre-seat, no field).
- Table: NOT OBSERVABLE in 30-day evening legs.
- Wins: NOT OBSERVABLE in 30-day evening legs;
  0 win flags present.
- Wave 4–5 unlocks: 0/3 seeds (maxWaveUnlocked 2
  on all three; wave kills wave-1/2 only).
- Median survival: 30 days (3/3 villages survived
  30 days; player deaths are succession events,
  not village deaths — the village lives on).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position DIAG of a POLICY-SIDE recorder — zero
src/js changes, so there is no game-root delta for
a panel to compare, and the panel's registry
policies do not include the nighttravel trace
policy. The OFF-vs-ON deep-equal check is the
instrument-perturbation proof, and the
pre-registered DIAG bar above is the judge. If a
future bridge lever becomes a game change, a panel
compare is run at that point.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- Time-as-gate: RESOLVED on the measured side —
  rollsDay 0/11, ticks-to-day-end always >= 107
  against a 96-tick build. The future lever prereg
  need not move the habit earlier in the day for
  tick reasons. (If a future base changes day-end
  tick budgets, re-measure; do not assume.)
- Wood scope: HELD as defined — feasibility reads
  PLAYER-carried wood only, because buildBridge
  spends from scholar inventory. The pile numbers
  (21–69) size the carry-habit question but do not
  change this DIAG's denominator. A future lever
  prereg that counts pile wood as feasible would be
  measuring a different lever (carry + build), and
  must say so explicitly.
- Prior-count cross-check: the prereg expected
  gate-OFF legs to differ from clearhabit
  after-legs "by the deleted habit's clearings."
  That explanation is WRONG for creek evenings
  (the habit never acts on creek) and is replaced
  here by the traced mechanism: succession timing
  + base drift in night-encounter RNG. Next runs
  should treat prior-run counts as same-base-only
  controls and re-derive expected counts on the
  current base before judging a divergence as an
  instrument problem.
- Binding order (wood before kcal): kept. It
  correctly identifies wood as the sole binder on
  the 6 kcal-paying evenings; the 5 dual-short
  evenings are honestly wood-short-first, with
  their kcal shortfall reported alongside, never
  hidden.

## Evidence files

- Prereg: evidence/2026-10-29/sim-creekremedy-b-prereg.md
  (commit a7479596, before any judged leg)
- This file: evidence/2026-10-29/sim-creekremedy-b.md
- Analysis: evidence/2026-10-29/sim-creekremedy-b-analysis.json
- Corpora: evidence/2026-10-29/sim-creekremedy-b-corpus-off/
  (3 files, recorder OFF), sim-creekremedy-b-corpus-on/
  (3 files, recorder ON)
- Instruments: scripts/policies/creekremedy-diag.js,
  scripts/creekremedy-trace-b.js,
  scripts/analyze-creekremedy-b.js
- Proof: scripts/test-creekremedy-b.js (T1–T6
  PROOF-GREEN on the judged corpora; determinism
  re-run of seed 11636 ON compared byte-identical
  and its scratch dir was removed after the proof
  — the proof output line is the record, not a
  duplicate corpus file)

## Landing note for the coordinator

DIAG-GO, measurement-only landing: the PROOF-GREEN
default-OFF recorder instrument (creekremedy-diag.js
+ trace/analyzer/proof), the OFF/ON corpora, the
analysis JSON, prereg + this evidence file. NO
src/js change, NO policy lever, NO default flip,
NO game-code trace of any remedy build. The next
lever (daytime wood-carry + bridge) needs its own
prereg; the ford question is closed as "mechanic
absent" pending a Steve ruling. This worker does
NOT merge to master — coordinator merges. Report:
'committed, pending coordinator merge'.
