# sim-lateralclose-b — PREREG (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-lateralclose-b
(coordinator brief 2026-11-02, run fleshout-loop-b-20261103T013651Z,
axis food-economy). Worktree sim-lateralclose-b, branch
sim-lateralclose-b. This worker does NOT push, bump, verify live,
merge, or rebase; the coordinator lands the branch. Status to
coordinator: committed in worktree, pending coordinator merge.

## Predecessors (read, never re-judged)

- evidence/2026-11-02/sim-destfirst-b.md + prereg (1730Z):
  DIAG-NO-BAND; 0/40 stage-2 A setups on the day-5 day-end alone;
  14 clean-entry trips kept their lateral escape to day-end.
- evidence/2026-11-02/sim-atimescale-b.md + prereg (2030Z):
  NO-GO, 0/40 confirmed multi-day A setups days 5-8; lateral
  escape survives 4 days of camping in both through-camp cases;
  camp duration (12/14 clean camps end by day 8) caps the
  closing window. Metric review prescribes this run: the next
  question is NOT "longer" but "what closes a lateral".
- evidence/2026-11-02/sim-cband-b.md, sim-falseclose-b.md:
  lateral-escape model E(D) and its false-close history.
- docs/CANON.md read first; docs/MAP.md (one map: way home
  travels through the same travelTo pipeline; home tiles regrow;
  beyond tiles generate deterministically). No canon doc covers
  the pocket guard itself: it is a policy-side sim instrument,
  not a game system, so there is no canon to invent from.

## Question

What closes a lateral? A fresh prereg, NOT a longer window:
under ordinary competent play, does any day-5-start A-LAT
tile's lateral escape E(D) ever flip from passing to failing
between consecutive probes — and if so, what map-state change
triggered it? The scholar need NOT camp at the tile: E(D) is a
pure function of map state (stock, revealed, blockages, haven,
beyond generation), so the probe measures whether the ground
itself ever takes the sideways escape away, on any tile, on
any day. A flip on a tile where the scholar happens to stand
at the pre-flip probe is flagged as a full A-story closing.

## The escape model E(D) (what a lateral is, from code)

From scripts/policies/competent-homewardstep-b.js (read, not
re-derived): E(D) passes iff EITHER the direct walkTo-faithful
sim succeeds (greedy minimum-Manhattan offer each hop, hop
feasibility = game.js travelTo intermediate-blockage scan,
10-hop cap) OR a lateral chain succeeds (up to 4 legs: from
the current sim position, re-run direct; else hop once to a
stocked forage candidate — travelTargets offer, stock > 0,
not haven/ruin, sorted unblocked-first then distance then
offer order — mark it picked-clean in sim stock, repeat).
One roadwork credit (single-tile all-rubble hop) is shared
across the whole evaluation. A lateral escape (legs >= 1,
directOk false) is exactly: direct fails, but one stocked
forage hop leads to ground from which direct succeeds.

## Candidate closers, enumerated from code BEFORE judging

E(D) depends ONLY on: haven position; tile types (haven/ruin
exclusion; creek + needsBridge rule); tile stock (candidate
gate); tile revealed (offer set); blockFrom / bridged /
needsBridge / bridgeFrom (hop feasibility); the scholar's
swimmer ability (creek hops); beyond-tile existence and
fields (tileAt); and E's own greedy/commit-first structure
(deterministic given the above). Candidates:

- C1 STOCK DEPLETION (single tile): the working lateral
  tile's stock hits 0 (scholar forage via stripGround, or
  cutTree / clearBrush on that tile). Reversed by regrow
  (+1/2 days, slower under pressure, none at pressure >= 10
  or vigor 0 — game.js regrowTiles). Fires only if no other
  candidate reroutes the chain; reroutes are visible as
  lateralPath changes without a flip.
- C2 STOCK DEPLETION (whole chain): every lateral chain
  from D loses its candidates to 0 stock at the same probe.
  (C1 with no reroute; distinguished in the ledger by
  whether any candidate remained stocked.)
- C3 REVEAL-DRIVEN GREEDY TRAP: a newly revealed tile offers
  a closer-to-haven but blocked hop that the no-backtrack
  greedy direct sim picks first, failing a previously passing
  direct leg (from D or from a lateral tile). Reveal only
  grows (walk / scout / reveal(); no un-reveal path found).
- C4 LATERAL REROUTE INTO A DEAD END: a newly revealed or
  regrown stocked tile sorts before the working lateral tile
  and commits the sim (first passing candidate only) to a
  position with no onward candidate / leg cap, where the old
  tile would have worked.
- C5 BRIDGE WASHOUT (storm smashBridge): the ONLY runtime
  path that re-adds a blockage — a player-built bridge on a
  creek tile is destroyed by a storm (game.js:26544), or a
  washed-out path regains its blockFrom from bridgeFrom.
  INOPERATIVE in unmodified competent play unless a bridge
  was built: competent.js contains no buildBridge call, and
  NPC villagers do not build bridges. Expected occurrences: 0.
- C6 NEW BLOCKAGE APPEARANCE: NO runtime path exists —
  blockFrom is set only at gen (game.js:10863, 11487) and
  restored only by C5; clearing only removes. Expected
  occurrences: 0 (clears may occur; clears OPEN escapes).
- C7 MONSTER PRESENCE: travelBlockage and travelTargets
  ignore monsters; E has no monster input. Monsters affect
  real walks only indirectly via the scholar's trajectory,
  which the probe captures net. Excluded as a direct closer
  on code evidence.
- C8 PANTRY / VILLAGE EVENTS (feasts, teaching, deaths,
  arrivals, contests): no map-state input to E except via
  the scholar's foraging / revealing (C1/C3/C4 channels).
  Excluded except through those channels.
- C9 HAVEN RELOCATION: no runtime assignment to village
  px/py found. Expected occurrences: 0; haven is snapshotted
  at every probe to confirm.
- C10 SWIMMER GAIN/LOSS: gaining swimmer OPENS creek hops
  (wrong direction for a closer); no ability-loss path in
  competent play. Recorded per probe. DIRECTION NOTE
  (amendment, see below): a swimmer gain biases AGAINST
  flips — it can only open creek hops — so a flip observed
  in a swimmer-gain pair is NOT explained by the swimmer,
  and a single-class counterfactual reproduction in such a
  pair still attributes the flip to that class (with the
  co-occurrence noted). The same logic holds for reveal
  events, bridge builds, and blockage clears: all bias
  toward opening, never toward closing.
- C11 BEYOND-TILE GENERATION: a generated beyond tile can
  (a) become a new lateral candidate (opens), (b) change the
  greedy direct path (C3 variant), or (c) turn an
  optimistically-passing ungenerated-beyond hop into a
  really-blocked hop (generated tile carries blockage /
  needsBridge — note gen beyond tiles carry no entry
  blockage and no hard-creek rule yet per game.js beyondTile
  comment, so (c) is expected to be weak; the probe tests it
  rather than assuming it).
- C12 TILE-TYPE CHANGE: no runtime path changes home-board
  tile.type (gen only; detail cells change, tile types do
  not). Expected occurrences: 0; type is snapshotted.
- C13 VIGOR / PRESSURE EROSION as a sustainer, not a
  trigger: pressure >= 10 or vigor 0 stops regrowth, which
  can PRESERVE a C1 closing across days but cannot cause
  one. A flip lasting one probe (regrowth reopens) still
  counts as a closing for that probe pair; flip duration is
  reported per flip.

## DIAG-ONLY discipline (zero game change)

Zero src/js changes, zero edits to scripts/policies/
competent.js, zero edits to any reused script/policy, zero
policy-default flips, zero bundled fix. New files only:
this prereg, a probe driver (scripts/lateralclose-b-probe.js),
an analyzer (scripts/lateralclose-b-analyze.js), a proof test
(scripts/test-lateralclose-b.js), the evidence file, and
per-seed probe files (sim-lateralclose-b-probe-<seed>.jsonl,
one JSON line per probe). Probing is read-only: escapeCheck
simulates against live state and mutates nothing (as at
destfirst); the probe driver never calls genDetail, never
installs the guard, never vetoes. The competent trajectory
is ordinary competent.daily throughout.

## AMENDMENT (before any judged leg; driven by smoke only)

Smoke seed 69899 (never judged) showed two facts that
correct the prereg's reading, not its verdict rule:

1. SWIMMER DIRECTION: the scholar gained swimmer between
   probes 6->7 and ~57 tiles flipped pocket/lateral ->
   direct in that one pair (mass opening). C10's "flagged
   swimmer-confounded, NOT attributed alone" clause is
   therefore replaced by the direction note in C10 above:
   openings cannot explain closings. A flip in a swimmer-
   gain pair is attributable via single-class counterfactual
   like any other flip, with the co-occurrence noted.
2. MORNING PROBES: probes sit at daily() entries, i.e.
   morning states after endDay regrow. Scholar position at
   every smoke probe was haven (4,4): under plain competent
   play the scholar wakes at home each morning (unlike the
   construct-policy campers at atimescale). Consequences,
   recorded not re-scored: (a) the scholar-at-tile flag
   means "scholar woke at the tile" — a stricter condition
   than "camped at day-end" — and will rarely fire; flips
   elsewhere still answer the prereg's map-state question.
   (b) A closing that forms intraday and regrows overnight
   on an unvisited tile would not be captured; foraged-to-0
   tiles persist to morning (the detailRegrow gate blocks
   the abstract overnight top-up on visited tiles), so
   camper-relevant closings are captured. Morning-to-morning
   flips remain the measured quantity.
3. DETAIL RECONCILIATION: smoke pair 6->7 also showed a
   board-wide stock/maxStock 3->2 shift on unvisited tiles:
   first genDetail visit reconciles abstract stock to the
   detail count ("the world is the truth"). Stock-class
   diffs therefore include reconciliation drops, not only
   foraging depletion; only drops TO 0 can close a lateral,
   and the ledger's stockZero counts already use that rule.
   When a flip's trigger is a stock drop, the evidence
   names whether the tile was foraged-to-0 or reconciled.

No judged leg has run at this amendment's commit; the GO /
DIAG / PARTIAL rules below are unchanged.

## Procedure (fixed here, before any judged leg)

1. SMOKE (not judged): one throwaway seed (69899) runs the
   full probe procedure to verify probe labels (observed
   scholar.day per probe), probe count, and file shape. Smoke
   results are never judged and never pooled.
2. PILOT (judged): seeds 69801-69808, in order. Per seed:
   load + setup, then ONE runDays(12) call under a wrapper
   policy that probes (full 81-tile E-map + full map
   snapshot) at each daily() entry and then runs
   competent.daily untouched, plus a final probe after
   runDays returns. Single-call design is deliberate: it
   keeps one persistent policy ctx for all 12 days (no
   phase-boundary ctx reset). Probes are labeled by OBSERVED
   scholar.day at probe time (expected daily-entry sequence
   1..12 plus a final probe at 13; the observed sequence is
   recorded, and flips are defined between consecutive
   recorded probes whatever the count). P0 = the first probe
   with observed gameDay >= 5 (the day-5 start, matching
   destfirst's after-4-days state); probes before P0 are
   context. Tracked primary class: tiles with P0 E = ok true,
   directOk false (A-LAT at day-5 start). All 81 tiles'
   E values are recorded at every probe (secondary
   transitions reported, never promoted to the verdict).
   A leg that loses the village during the probe window
   still yields its completed probe pairs; only a leg that
   dies BEFORE P0 is replaced, from the confirm band in
   order, and the replacement is recorded (never silently).
3. FLIP FINDING (judged): a flip = a primary tracked tile
   with E ok true at probe k and ok false at probe k+1.
   For each flip the analyzer reports: seed, tile, probe
   pair (game-days), pre/post E (via/directOk/legs/
   lateralPath), scholar position at the pre-flip probe
   (scholar-at-tile flag = full A-story closing), and the
   full map diff between the two probes, classified into
   classes: stock (board stock values), revealed (board
   revealed flags), terrain (type / blockFrom / bridged /
   needsBridge / bridgeFrom), beyond (map.beyond entries),
   haven (village px/py). Swimmer is reported per probe.
4. COUNTERFACTUAL ATTRIBUTION (experiment, not a judged
   leg): for each flip, replay the SAME seed with the SAME
   procedure, stopping at probe k (STOP_PROBE mode); assert
   the replayed pre-flip snapshot equals the judged pre-flip
   snapshot (determinism check — a mismatch voids that
   flip's attribution and is reported, never papered over).
   Then, in separate replay invocations, apply ONLY one
   diff class's post-flip values to the replayed state and
   re-run escapeCheck on the tile. A class reproduces the
   flip iff E goes false under that class alone. Sanity:
   applying ALL classes must reproduce the flip; if it does
   not, the replay diverged and the flip is void pending
   investigation. Pairs are tried only if no single class
   reproduces. Result per flip: single-class trigger
   (named with exact tile + field changes), multi-class
   trigger set, compound (pairs), or unattributed.
5. CONFIRM (judged legs + experiments):
   - If the pilot yields >= 1 counterfactual-confirmed flip:
     the trigger class is REPRODUCED iff a DIFFERENT seed's
     flip (from the pilot's other seeds first, else fresh
     confirm seeds 69809-69816 in order, max 8) is confirmed
     by counterfactual replay with the SAME trigger class.
     Confirm legs run the identical probe procedure.
   - If the pilot yields 0 flips: run confirm seeds
     69809-69816 (8 fresh legs, identical procedure) and
     then judge on the pooled 16 seeds.
   - If flips exist but no same-class reproduction is found
     within budget: verdict is PARTIAL (see below), never
     upgraded to GO and never downgraded to DIAG.
6. SENSE-TEST (transcript, not counts): re-run ONE judged
   seed with say-tee mode (Game.say wrapped to log lines
   with game-day; the wrapper calls no RNG and changes no
   trajectory — verified by diffing its probe file against
   the judged probe file; any E difference voids the
   transcript). Read the transcript for the flip day if a
   flip exists (else the seed with the most lateralPath
   churn across probes) and judge whether the open/closed
   state reads sensibly for a person in the world.

## Primary metric + GO threshold (binds the run, §14)

CONFIRMED closing mechanism = ALL of:
- a primary flip (P0 A-LAT tile, ok true -> false between
  consecutive probes) on a judged leg; AND
- a single-class counterfactual reproduction of that flip
  (step 4); AND
- the same trigger class counterfactually confirmed on a
  DIFFERENT seed's flip (step 5).
GO: >= 1 confirmed closing mechanism, named with its trigger
(exact tile/field change class + trigger event) and its
reproduction seed.
DIAG-NO-CANDIDATE: 0 flips across 16 judged seeds (pilot +
confirm extension), PLUS the per-candidate occurrence table
(each candidate's firing condition counted across the corpus:
stock-0 events on lateral-path tiles, reveal events, blockage
changes, bridges built, beyond generations, haven moves,
swimmer changes, type changes) — a candidate is excluded
either because its firing condition never occurred (C5/C6/
C9/C12, with the code evidence above) or because it
occurred without any flip (C1/C3/C4/C11, with counts).
PARTIAL: >= 1 counterfactual-confirmed flip but no same-
class reproduction within budget. PARTIAL is a pre-registered
branch, not a re-score: it names the mechanism and reports
the reproduction budget as exhausted.
A miss is never re-scored mid-run against a friendlier
metric (e.g. counting secondary transitions, broken-camp
failures, walk-out-E failures, or pocketed-at-entry tiles
as closings).

## Horizon (death-aware, never fixed 200d)

One 12-day run with probes at every daily entry plus a
final probe (game-days ~1-13; judged window P0..final,
~game-days 5-13). Legs that lose the village stop probing
at loss (+0 tail: the last recorded probe is the last
record; no post-loss probes are fabricated). Window
rationale: 8 days of competent foraging after day-5 start
gives the board real turnover (stock regrow cycle is 2
days; the scholar roams the whole board, unlike the
atimescale camper) while matching the atimescale window
for comparability. No leg is extended past its final probe
for the verdict.

## Seeds / policies

Pilot: 69801-69808. Confirm: 69809-69816 (plus replacements
/ extension in order as §procedure steps 2/5 define; every
consumed seed is listed in the evidence ledger, none dropped
silently). Smoke: 69899 (never judged). Sense replay: a
judged seed (no new seed). Policy: plain competent.daily
throughout (wrapper probes only; no guard, no vetoes, no
construct policy, no packcomp flags). No policy-default
flips anywhere.

## Balanced panel (§15)

VACUOUS, stated deliberately: this is a DIAG-ONLY probe of
map-state dynamics under one policy, not a before/after
lever comparison — there is no baseline/arm pair to panel,
and the panel expresses the guard policies, not the probe
instrument. No compare file is fabricated.

## Sense-testing

At least one transcript is read for human sense (see step
6): a flip day if one exists, else the highest-churn seed.
Report what the scholar and village actually do/say, and
whether the lateral's open/closed state reads sensibly.

## Wall numbers (honestly limited)

Reported from this arm's corpus only, window-limited:
daysAlive, maxWaveUnlocked, national / table / wins (0
expected — 12-day competent probe legs are not natural-play
win attempts; reported as in-window values, never as rates).
