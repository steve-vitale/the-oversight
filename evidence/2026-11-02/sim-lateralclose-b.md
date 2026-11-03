# sim-lateralclose-b — What closes a lateral?

Run: oversight-flesh-out-loop-b, arm sim-lateralclose-b
(coordinator brief 2026-11-02, run fleshout-loop-b-20261103T013651Z,
axis food-economy). Worktree sim-lateralclose-b, branch
sim-lateralclose-b. Prereg: evidence/2026-11-02/
sim-lateralclose-b-prereg.md (committed 634e866de BEFORE any
judged leg; amendment 8f5957bfd committed BEFORE any judged
leg, driven by smoke seed 69899 only). This worker does NOT
push, bump, verify live, merge, or rebase; the coordinator
lands the branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **GO — confirmed closing mechanisms, named and reproduced.**
  The GO bar was: >= 1 primary flip + single-class
  counterfactual reproduction + the same trigger class
  counterfactually confirmed on a DIFFERENT seed's flip.
  All three are met several times over, inside the pilot
  alone (no confirm extension was needed for GO):
  - 10 primary flips on 8 pilot seeds (4 seeds with flips,
    4 without), every one reproduced by the STOCK class
    alone in counterfactual replay (determinism True on
    all 10), and the stock class reproduced on all four
    flip seeds (69803, 69804, 69805, 69806).
  - Two named mechanisms inside the stock class, each
    proven down to sufficient single tiles / tile pairs
    (see "Named triggers"):
    - S-A STRIP: a lateral-chain link's stock is stripped
      to 0 (stripGround's taking-the-last signature:
      vigor -5, pressure +1), killing the leg.
    - S-B REGROWTH HIJACK: a regrown tile (0 -> 1) becomes
      the sim's new first-picked lateral candidate and
      leads the chain into the 4-leg cap.
- This answers the tracker's next question directly: what
  closes a lateral is the ground's own stock turning over
  under the village's hands — foraging strips links shut,
  and regrowth can strand a chain down a dead end. Both
  directions of the same stock cycle close laterals.

## What was built (new files ONLY, zero game-code change)

- scripts/lateralclose-b-probe.js — probe driver: one seed,
  one 12-day competent run under a wrapper policy that
  probes (full 81-tile E-map + full map snapshot) at each
  daily() entry plus a final probe; STOP_PROBE + APPLY_DIFF
  + EVAL_TILE counterfactual replay mode; SENSE=1 say-tee
  mode. Probe lines are buffered and flushed with writeSync
  + retry (EPERM-flap rule).
- scripts/lateralclose-b-analyze.js — flip finder, classified
  diff (stock / revealed / terrain / beyond / haven),
  counterfactual orchestration (one subprocess replay per
  class, with replay-determinism verification), and
  --check-sense.
- scripts/test-lateralclose-b.js — proof 10/10 (8 fixture
  groups + live probeAll structure + reused-files-
  unmodified).
- evidence/2026-11-02/sim-lateralclose-b-probe-<seed>.jsonl
  — one per pilot seed (69801-69808), 13 probes each.
- evidence/2026-11-02/sim-lateralclose-b-flips.txt — the
  --flips output over the pilot corpus (record, not a
  verdict by itself).
- UNCHANGED, verified by the proof test's git check: all of
  src/js, scripts/policies/ (including competent.js and
  competent-homewardstep-b.js), scripts/sim-harness.js, and
  every destfirst/atimescale instrument. Zero src/js
  changes, zero default flips, zero bundled fix.

## Procedure, honestly stated

Probes sit at daily() entries — MORNING states after endDay
regrow — plus a final probe after the run. One runDays(12)
call per seed under the probing wrapper (single persistent
policy ctx; no phase-boundary reset). P0 = the first probe
with gameDay >= 5 (probe index 4 on every pilot leg).
Primary tracked class: P0 A-LAT tiles (E ok true, directOk
false). A flip = a primary tile going ok true -> false
between consecutive probes. Counterfactuals replay the same
seed with the same procedure, stop at the pre-flip probe,
assert the replayed snapshot equals the judged pre-flip
snapshot, then apply ONE diff class's post-flip values and
re-run escapeCheck on the tile. Smoke seed 69899 (never
judged) verified probe labels (days 1..13), probe count
(13), and file shape before the pilot.

## Pilot ledger (8 seeds, 69801-69808, in order)

| Seed | Probes | P0 aLat | Flips | MaxWave | End |
| 69801 | 13 | 18 | 0 | 2 | survived, day 13 |
| 69802 | 13 | 7 | 0 | 1 | survived, day 13 |
| 69803 | 13 | 9 | 1 | 2 | survived, day 13 |
| 69804 | 13 | 19 | 1 | 2 | survived, day 13 |
| 69805 | 13 | 14 | 5 | 1 | survived, day 13 |
| 69806 | 13 | 5 | 3 | 2 | survived, day 12* |
| 69807 | 13 | 13 | 0 | 2 | survived, day 13 |
| 69808 | 13 | 14 | 0 | 2 | survived, day 13 |

99 primary tiles x 8 probe pairs = 792 primary tile-probes;
10 flips (1.3% per tile-probe). No leg lost the village, so
no replacement was needed. *69806: probes 11 and 12 both
read gameDay 12 — the 12th iteration's sleep did not advance
scholar.day (daysAlive 12, final gameDay 12, unlike the
other legs' 13). The pair 11->12 still spans one full
iteration (competent.daily ran); its flip is a real state
change between consecutive probes, recorded as days 12->12.

## Flip ledger (10 flips, all counterfactual-confirmed)

Pre = pre-flip E (via/legs); post reason from escapeCheck;
scholarAtTile = scholar woke at the tile at the pre-flip
probe (morning-position flag — false on all 10; see the
amendment: under plain competent play the scholar wakes at
haven every morning, so no flip is a witnessed camped
closing — the verdict is about the ground, not the camper).

| Seed | Tile | Probes | Days | Pre | Post reason | Stock trigger (see below) |
| 69803 | 6,5 | 11->12 | 12->13 | lateral/1 | no-lateral-candidate | 5,5 stripped 2->0 |
| 69804 | 4,7 | 5->6 | 6->7 | lateral/3 | lateral-cap | 3,5 regrew 0->1 (hijack) |
| 69805 | 1,6 | 4->5 | 5->6 | lateral/2 | lateral-cap | 0,5 + 1,6 stripped to 0 |
| 69805 | 0,7 | 4->5 | 5->6 | lateral/2 | lateral-cap | 0,5 + 1,6 stripped to 0 |
| 69805 | 1,7 | 4->5 | 5->6 | lateral/3 | lateral-cap | 0,5 + 1,6 stripped to 0 |
| 69805 | 0,8 | 4->5 | 5->6 | lateral/3 | lateral-cap | 0,5 + 1,6 stripped to 0 |
| 69805 | 5,8 | 10->11 | 11->12 | lateral/3 | lateral-cap | 4,6 stripped 1->0 |
| 69806 | 8,5 | 4->5 | 5->6 | lateral/1 | no-lateral-candidate | 7,5 + 8,5 stripped to 0 |
| 69806 | 8,6 | 4->5 | 5->6 | lateral/1 | no-lateral-candidate | 7,6 stripped 3->0 |
| 69806 | 8,5 | 11->12 | 12->12 | lateral/1 | no-lateral-candidate | 7,5 stripped 2->0 (again) |

Durations (from each tile's full trajectory): 69805's four
day-6 closings lasted exactly one probe — all four tiles
reopened at day 7 (0,5 and 1,6 regrew 0->1, vigor +1 on
rested ground); 69806's day-6 closings likewise reopened
day 7 (7,5 / 7,6 / 8,5 regrew 0->1). Persistent closings:
69804 4,7 stayed closed days 7-13 (the hijack held); 69805
5,8 stayed closed days 12-13; 69803 6,5 closed at the final
probe (duration beyond the window unknown); 69806 8,5
closed, reopened, and closed again at the final probe.
Transient vs persistent is a regrowth race: a stripped
link reopens in one morning unless it is re-stripped or
the chain stays hijacked.

## Named triggers (single-tile / pair sufficiency proofs)

Class-level counterfactuals (all 10 flips): stock alone
reproduces, revealed alone never reproduces (on the 5
flips with a revealed diff), all-classes reproduces,
replay determinism True on all 10. Then minimal
sufficiency replays (hand-built APPLY_DIFF, same driver):

- 69803/6,5: applying ONLY 5,5 stock 2->0 reproduces the
  flip EXACTLY (same post path 6,5->7,5->8,5->8,4, same
  no-lateral-candidate reason). The working lateral leg
  was a single hop to 5,5; picking 5,5 clean kills it, and
  the sim's wander (7,5->8,5->8,4) finds no other candidate.
- 69804/4,7: applying ONLY 3,5 stock 0->1 reproduces the
  flip (lateral-cap; dead-end path 3,5->2,5 instead of the
  full-diff path 3,5->3,4 — the pair {3,5->1, 3,4->1}
  reproduces the exact post path). Mechanism, precisely:
  at chain position 3,6, the regrown adjacent tile 3,5
  (d=1, always offered) sorts before the old link 2,6 on
  the row-major tie-break and commits the sim down a dead
  end. This is candidate C4 (reroute into a dead end) with
  a STOCK trigger (regrowth), not a reveal trigger.
- 69805/0,7: applying ONLY 0,5 stock 1->0 does NOT
  reproduce — the sim reroutes 0,7->0,6->1,6->2,6 and
  escapes. Applying the PAIR {0,5->0, 1,6->0} reproduces
  the flip (lateral-cap) for both 0,7 and 1,6. The 69805
  cluster is a two-link same-day strip: the shared chain
  through 0,5 and 1,6 dies together.
- Attribution limit, stated: the strip signature (vigor -5,
  pressure +1) is stripGround's, and stripGround has three
  callers — the scholar's forage sweep, NPC villager
  depletion (villagerDepleteTiles), and village/neighbor
  commons takes. The snapshot cannot say whose hands
  stripped a given tile. The mechanism (stock hits 0 via
  stripGround) is proven; the hand is not. The village's
  collective foraging closes laterals, not just the
  scholar's.

## Candidate-by-candidate results (prereg C1-C13)

- C1 SINGLE-TILE STRIP: CONFIRMED as sufficient in 69803
  (5,5 alone) and necessary in the 69805/69806 clusters.
  The atimescale mystery ("nothing kills the lateral in 4
  days of camping") is answered in part: camping scholars
  forage their own camp tiles, but the lateral link is
  often NOT the camp tile — it is a neighboring stocked
  tile, and it dies when any village hands strip it.
- C2 WHOLE-CHAIN STRIP: CONFIRMED in the multi-link cases
  (69805 cluster needs two links; 69806 8,5 needs its
  link tile plus itself). Single-link strips suffice only
  when the chain has one working leg.
- C3 REVEAL-DRIVEN GREEDY TRAP: NOT OBSERVED as a closer.
  Reveal events occurred (44 across the pilot) with zero
  flips attributable to reveal (revealed-alone replay: E
  still passes on all 5 flips that had a revealed diff).
  Not disproven as possible — excluded as observed.
- C4 REROUTE INTO A DEAD END: CONFIRMED, with a stock
  trigger (69804 regrowth hijack). The reveal-driven
  variant was not observed; the mechanism itself is real.
- C5 BRIDGE WASHOUT: 0 occurrences (0 bridges built, 0
  terrain changes of that kind). Code path exists, never
  armed in competent play. Excluded as observed.
- C6 NEW BLOCKAGE APPEARANCE: 0 occurrences (terrain
  changes: 2 total across the pilot, both rubble blockages
  CLEARED — 69802 tile 5,3 and 69808 tile 3,4, roadwork
  that opens, not closes; 0 bridges built). Code evidence
  stands: no runtime path adds a blockage except C5.
- C7 MONSTER PRESENCE: excluded as a direct closer on
  code evidence (travelBlockage / travelTargets ignore
  monsters); monsters act only through the scholar's
  trajectory, which the probe captures net.
- C8 PANTRY / VILLAGE EVENTS: excluded except through
  the foraging channels (C1/C2) — no map-state input to E
  otherwise. (Village events DO close laterals, but only
  by sending hands to the ground: villager depletion and
  commons takes are stripGround callers.)
- C9 HAVEN RELOCATION: 0 occurrences; haven (4,4) on
  every probe of every leg. Excluded as observed.
- C10 SWIMMER: 0 changes in the pilot (unlike smoke 69899,
  where a swimmer gain opened ~57 tiles in one pair).
  Direction confirmed on smoke: swimmer opens, never
  closes. No pilot flip is swimmer-confounded.
- C11 BEYOND-TILE GENERATION: 0 occurrences (no beyond
  tile generated in any pilot leg — competent play stays
  on the board). Excluded as observed.
- C12 TILE-TYPE CHANGE: 0 occurrences. Excluded.
- C13 VIGOR / PRESSURE AS SUSTAINER: CONFIRMED as the
  reopen clock — stripped tiles regrew 0->1 the next
  morning (vigor +1) and reopened every transient closing.
  Pressure never reached regrowth-blocking levels on any
  flip tile (pressures stayed 0-1), so no closing in this
  corpus was sustained by pressure >= 10 or vigor 0.

## Corpus occurrence counts (pilot, P0 onward)

From --flips SUMMARY: 792 primary tile-probes, 10 flips;
stock-0 events on lateral-path tiles 36; stock-0 events
anywhere 129; reveal events 44; terrain changes 2; bridges
built 0; beyond generated 0; haven moves 0; swimmer changes
0; type changes 0; lateralPath changes 54. Secondary
transitions (reported, never verdict): 13, including
pocket->lateral openings (69802, 69805 reopenings, 69806
reopenings, 69808) and direct<->lateral churn (69804 2,8,
69808). The board breathes in both directions; closings
are the minority direction (10 flips vs 13 secondary
openings/churns in the same window).

## Wall numbers (honestly limited, window-stated)

Probe legs, not natural play. 8/8 survived 12 days;
maxWaveUnlocked 2 on six seeds, 1 on 69802 and 69805;
national / table / wins 0 on every leg (no national/table/
win state exists in these 12-day probe records; 0 is the
context value, and no wall movement is shown or claimed).
Window-limited 12-day competent substrate — this arm's
window (game-days 5-13) cannot reach national/table/win
by construction.

## Balanced panel (§15, context never verdict)

VACUOUS, stated deliberately: a DIAG-ONLY probe of
map-state dynamics under one policy, not a before/after
lever comparison — no baseline/arm pair exists to panel,
and the panel expresses the guard policies, not the probe
instrument. No compare file is fabricated.

## Sense-testing (transcripts, not just counts)

Say-tee replay of 69803 (SENSE-CHECK PASS: all 13 probe
snapshots identical to the judged leg, so the transcript
is the judged trajectory). Day 12 — the flip day, when
tile 5,5 (a creek tile) was stripped 2->0 — reads as a
living village, not a mechanism: water runs, garden work,
foraging returns ("Brooklyn returns from foraging the
wilds: +202 kcal"), gossip by the fire, a Hushpuppy
trailing the scholar's night forage ("It followed you"),
and a Stonebridge runner complaining "Your foragers are
stripping our side of the southeast ground. Back off — or
we'll talk with teeth." The scholar's night forage works
patches to exhaustion ("This patch is worked out — step
to another green patch and forage again") before walking
home. Honest limits: the say stream never names tile 5,5
and never mentions the lateral — E(D) is a guard
instrument, not a game concept, so a closing has no
dialogue trace by construction; what the transcript proves
is that the hands doing the stripping belong to a
plausible night's work (scholar foraging + village crews
+ the commons complaint), not to an abstract counter.
The one strangeness is the same as atimescale's: the
scholar wakes at haven every morning even after a night
forage — under plain competent play, nobody sleeps out,
so a "camped closing" is not something competent legs
produce at all (the construct policy had to force camps).

## Village assessment (plain words)

Eight villages, watched morning by morning for eight days
each, and the sideways escape turns out to be mortal after
all — it just doesn't die the way the earlier runs looked
for it. Nobody's camp starves it out. What kills it is the
village's own daily work: hands stripping the ground bare.
One creek tile picked clean takes a whole way home with
it; two neighboring tiles stripped on the same day strand
four doorways at once; and sometimes the ground itself
plays the trick in reverse — a patch that grew back
overnight steps in front of the old path and leads the way
home into a dead end. Most closings last a single morning,
because the ground grows back one shoot overnight — but
three of the ten held to the end of the window, and one
doorway closed, reopened, and closed again. The wall did
not move: nobody got near national, the table, or a win in
twelve days, and that was never this run's question. What
is no longer missing is the closing itself — the trip that
walks out clean and finds the door shut is real, it is
common enough to see ten times in eight villages, and its
cause is the most ordinary thing in the game: people
eating the ground bare.

## Metric review (for the NEXT run, never this one)

- Morning probes undercount transient closings: a lateral
  that closes intraday and regrows overnight on an
  unvisited tile is invisible to morning-to-morning probes.
  Foraged-to-0 tiles persist (detailRegrow gate), so
  camper-relevant closings are captured, but a future run
  that wants day-END E needs a day-end probe point — which
  must NOT be built by wrapping Game.sleep (repo rule:
  Sleep stays inside the transaction chain). The honest
  route is a driver-level post-sleep probe, designed with
  the harness, not a sleep wrapper.
- The scholar-at-tile flag as defined (morning position)
  will ~never fire under competent play. A future A-story
  run that wants witnessed camped closings must use a
  camping policy (construct-style), not competent.daily —
  or redefine the flag as day-end position, which needs
  the probe point above.
- The 69806 duplicate-day-12 pair (probes 11->12, both
  gameDay 12) should be understood before reuse: one
  iteration's sleep did not advance scholar.day. It did
  not affect this verdict (flips are defined between
  consecutive probes), but a run that keys analysis to
  gameDay alone would mislabel that pair.
- The swimmer opening on smoke 69899 (~57 tiles in one
  pair) is a standing confound for any future E-window
  study: a swimmer gain mid-window masks closings by
  opening creek hops. Future probe preregs should record
  swimmer per probe (as this one did) and report
  pre/post-swimmer flip rates separately.
- No metric is revised mid-run; the GO threshold (>= 1
  confirmed mechanism) stands as met, not exceeded by
  re-definition.

## Findings backlog notes (for the coordinator to append to hidden_files/sim-findings.md — do NOT edit that file from this lane)

- [open] 2026-11-02 — lateral-close — what closes a lateral, ANSWERED (GO): stock turnover under the village's hands — strip-to-0 kills lateral legs (single-tile proof: 69803 5,5; pair proof: 69805 0,5+1,6) and regrowth hijacks chains into the leg cap (single-tile proof: 69804 3,5 0->1). 10 flips / 792 primary tile-probes across 8 pilot seeds, all stock-class counterfactual-confirmed (sim-lateralclose-b evidence).
- [open] 2026-11-02 — lateral-close — transient vs persistent closings: 6 of 10 flips reopened the next morning by regrowth +1; 3 held to window end; 1 closed twice. A closing's duration is a regrowth race, not a property of the tile (sim-lateralclose-b evidence).
- [open] 2026-11-02 — lateral-close — competent scholars never sleep out: every morning probe on every pilot leg showed the scholar at haven, so witnessed camped closings need a camping policy, not competent.daily; morning probes also miss intraday transient closings on unvisited tiles (sim-lateralclose-b sense test + metric review).
- [open] 2026-11-02 — lateral-close — 69806 duplicate-day anomaly: probes 11->12 both read gameDay 12 (one iteration's sleep did not advance scholar.day). Flips between consecutive probes are unaffected, but gameDay-keyed analysis would mislabel the pair (sim-lateralclose-b evidence).
