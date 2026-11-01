# sim-refusewin-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-refusewin-b, run
fleshout-loop-b-20261101T0330Z, axis food-economy (tracker
next blank 2 from the 0249Z closeout, and sim-findings
"REFUSAL RUNS UNRESOLVED AT THE HORIZON; H5/H6 UNRUN",
loop-B 0119Z gate2hunt arm: "a 30d window cuts stranded
stories off mid-run — 17724 (creek, 7 nights) and 17737
(fallen_tree, 2 nights) end refused at day 30. A longer
window on a refusal band would show whether they resolve
by daytime walking, as 17734's and 17606's did").
Worktree sim-refusewin-b, branch sim-refusewin-b. DIAG
ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only (this prereg,
an episode analyzer, its pure proof test, evidence,
corpora, censuses). The refusedband driver
scripts/refusedband-trace-b.js and the gate2hunt
analyzer scripts/analyze-gate2hunt-b.js are REUSED
VERBATIM from the base (no edits). This worker does NOT
push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run
across the map; a creek tile is a place, not a bucket
class; the way home runs through the same travelTo
pipeline as walking out). No canon doc covers a
travel-refused episode window or a resolution rule —
stated here instead of inventing canon, as gate2hunt
stated. Standing rules that bear on it: perception law
(Steve 2026-10-28: decisions from what the villager
senses) and "no silent actions" (the sense test reads
transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-gate2hunt-b.md + prereg
  (GO, base ee159dbc3): BARE 30d H4 band — 17734, 11
  creek refusals days 10-16 at wetland camp (5,3),
  blocked tile (4,3), resolved days 17-25 by daytime
  walk around the creek (routeAroundPath
  [[5,3],[5,4],[4,4]] on the refusal evenings; day 17
  evening 'completed' at haven (4,4) with dayLines
  "Travel 1 tile to Haven." / "You walk back into
  Haven."); days 26-29 refused again at the same camp;
  day 30 at haven ('completed') again. 17737, 2
  fallen_tree refusals days 29-30, camp forest_floor
  (4,2), blocked tile (4,3), unresolved at horizon.
  Gate-2 agreement 11/11 on H4. Travel-refused
  definition: haven offered AND one honest
  Game.travelTo hop attempted AND post-hop position
  not haven; 'out-of-reach' is NO attempt and never
  counts. Corrected sleep-step gameOver predicate for
  the instrument gate (complete = days-complete OR an
  evening row with gameOver true OR a recorded harness
  endReason other than 'survived').
- evidence/2026-10-31/sim-refusedband-b.md + prereg
  (17606: 37 travel-refused evenings, resolved by
  daytime walking on day 19 — the resolution pattern
  this arm tests for).
- evidence/2026-11-01/sim-strandwide-b.md (strand
  program context; this arm does NOT re-judge
  strandwide's verdict).
- Base-pinning note (sim-findings: SEEDED TRAJECTORIES
  ARE BASE-PINNED): judged legs here are fresh
  measurements on THIS arm's base regardless of prior
  arms' numbers, and any move is reported with new
  names, never silently substituted.

## Base commit (pinned)

Base commit for every leg in this arm: 6409c1312
(worktree HEAD at prereg writing time). `git diff
--stat HEAD -- src/js` is EMPTY at prereg time, and
`git diff ee159dbc3 HEAD -- src/js` is EMPTY (no game
code moved between the gate2hunt base and this base;
the only scripts/policies delta is the strandwide arm's
new creekseek policy file, which no leg in this arm
loads — the BARE driver asserts its levers unset).
Every judged number below comes from legs run under
this prereg on this base, never from reused corpora as
judged evidence. Gate2hunt corpora are used ONLY as
design reference (episode shapes, resolution-day
fields), never as judged legs of this arm.

## Definitions (carried verbatim from gate2hunt — not re-derived)

Travel-refused evening = evening row with
eveningOutcome === 'travel-refused'. 'out-of-reach' is
NO attempt and never counts. Episode = a maximal run
of consecutive loopDays with eveningOutcome
'travel-refused' on one seed leg. Every refusal
episode in the window gets exactly one end
classification:

- resolved-by-daytime-walk: the first evening AFTER
  the run has eveningOutcome 'completed' AND evening
  tile haven (map == haven coords, inside true). The
  route is reported as: camp tile (refusal evenings'
  eveningMap), blocked tile (creekremedy blockedTile
  or ntTravel intermediate), routeAroundPath when the
  creekremedy record carries one, and the resolution
  day's dayLines travel lines ("Travel 1 tile to
  Haven." / "You walk back into Haven."). Daytime vs
  night hop is distinguished by the outcome itself:
  the night hop refused (that is the episode); the
  return that ends it is a daytime walk (completed
  evening at haven, no night hop involved).
- still-refused-at-60d: the episode includes the leg's
  last evening day and the leg's endReason is
  'survived' (the window, not the story, cuts off).
- ended-other: the episode ends because the leg ended
  (endReason other than 'survived', day recorded) OR
  the first evening after the run has an outcome other
  than 'completed'-at-haven (e.g. 'out-of-reach' after
  wandering, 'blocked-tent', combat outcomes) — with
  that outcome and day recorded. A moved camp that
  later refuses again opens a NEW episode; episodes
  are never merged across a non-refused evening.
- UNCLASSIFIED: none of the above applies. This is
  INSTRUMENT FAILURE only, never a verdict category:
  any UNCLASSIFIED episode fails GO bar (b).

The (4,3) chokepoint question is a tile observation
about refusals (blocked tile == (4,3)), never a merged
criterion: refusal counts, bucket counts, and tile
counts stay in separate columns throughout.

## Legs (declared fully, run in this order)

Substrate env asserted FATAL in the reused driver for
ALL legs: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, MORNINGCARRY/WINDOWCARRY/FEDEVENING/
COMPETENT_EVENING_DETOUR never 1; BARE requires
CREEKREMEDY_DIAG=1 and WOODCARRY/WOODWARM/STRANDFIX/
WAITSALIGN_ASKSKIP/SELECTTRIM unset/0. Transport:
stdout-runner (one JSON line per seed to stdout;
stdout -> file in evidence/ in a foreground exec;
idle splitter splits into per-seed files; jsonl
deleted after split). Judged corpora are NEVER staged
in /tmp, and judged legs NEVER write files from a
game-loaded process.

0. CONTROL-DRIVER (pilot part 1, instrument
   validation on THIS base): BARE 30d, seeds 17734,
   17737 (the H4 band seeds only — not a cell, not a
   band re-measurement). Expected if trajectories are
   base-stable: 17734 shows 11 refusals (days 10-16,
   26-29) and 17737 shows 2 (days 29-30), matching
   gate2hunt's 30d numbers exactly. Any deviation is
   reported as a base move with new numbers, never
   silently substituted, and the judged 60d legs are
   still fresh measurements on this base regardless.
   Analyzed with the gate2hunt analyzer VERBATIM.
1. JUDGED LEG 17734, BARE 60d (single-seed leg).
2. JUDGED LEG 17737, BARE 60d (single-seed leg).
3. JUDGED LEG 17724, BARE 60d (single-seed leg; the H3
   unresolved creek case).

Each seed is its own leg — NEVER pooled into a band
claim. No band bar is defined by this prereg, so no
band claim can arise from these legs. Fresh H5/H6
cells are OUT of scope for the judged legs: no stop
rule in this prereg admits them, and they are
reported as UNRUN, not zero, if unrun (as gate2hunt
left them).

PILOT GATE (MEASUREMENT §§9-10): the pilot is the
30d control-driver reproduction (leg 0) plus the
first 60d legs. No 12-16-seed confirm is run: the
question is per-seed (did THESE seeds resolve), each
seed is its own leg, and the brief's confirm clause
applies to lever comparisons, of which this DIAG
census has none (see §15 declaration). If the control
reproduction fails outright (driver error, gate
failure), STOP before judged legs and report — no
judged leg on a broken instrument.

Horizons are death-aware (MEASUREMENT §10): the
harness stops at Game.over; dead villages stop
simulating (+10d tail max is the harness's own end
handling). Never a fixed 200d. Horizon here is 60d:
double the 30d that cut stories mid-run, so a
resolution has room to appear. A 60d leg that ends
early by game-over is judged with its day recorded,
not extended.

INSTRUMENT GATE (pilot gate on every leg, corrected
predicate): every leg errs 0, decisions == evenings
in count, and complete, where complete = loop-days
complete (daysAlive === days) OR an evening row with
gameOver true OR a recorded harness endReason other
than 'survived' ('village-lost' / 'over-other'). If
any leg fails, STOP and report — no further legs on a
broken instrument.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: per seed leg, refusal episodes
(count, days, camp tile, blocked tile, bucket split)
with exactly one end classification each; plus the
gate-2 fraction on the leg's block:creek evenings as
a cross-check (reported, not thresholded).

- GO requires ALL of: (a) instrument gate clean on
  every judged leg (control 2 + judged 3 = 5 legs,
  corrected predicate); (b) 100% episode
  classification — zero UNCLASSIFIED episodes across
  all judged legs (episodes are few; a 95% bar would
  hide one); (c) the question answered per seed: did
  17724 and 17737 resolve, and by what route, with
  17734's known resolution re-confirmed or corrected
  at 60d — each seed's episodes classified with
  routes/days stated; (d) sense pass: at least one
  resolution transcript read end to end (does the
  walk-home read as a person finding a way, or a
  silent snap?), plus the (4,3) chokepoint verdict at
  60d (still binds / no longer binds, with tile
  counts) and any NEW refusal episodes past day 30 on
  these seeds, listed by seed and day.
- HELD (not GO, not killed): the legs ran clean and
  episodes are 100% classified, but the per-seed
  question cannot be answered because a leg ended
  early (game-over) before its episode could resolve
  or recur — the episode is classified ended-other
  with its day, and the seed's question is reported
  unanswered-by-ending, not as a resolution.
- NO-GO: instrument gate fails on any leg, OR any
  episode is UNCLASSIFIED (instrument failure), OR
  the control-driver reproduction fails outright
  (driver/gate failure, not a count move — a count
  move is reported, and judged legs still run, since
  they are fresh measurements on this base).

Secondary reported counts (every leg, never pooled
into a band verdict): evenings judged by outcome,
refusals by hopReturnKind, refusals by seed/day with
evening map + haven distance, block:creek evenings,
bucket split (creek / other-refused / unclassified,
by source), errs, game-overs, narration presence
(dayLines contain the engine's block line for the
refusal's blockType).

## Instruments (proved BEFORE any judged leg)

- Episode analyzer (NEW file
  scripts/analyze-refusewin-b.js): reads one corpus
  dir of per-seed JSON files, groups consecutive
  travel-refused evenings into episodes, classifies
  each episode per the definitions above (route fields
  from the refusal evenings' creekremedy/ntTravel
  records, resolution-day dayLines travel lines),
  and reports the corrected instrument gate per leg.
  It does NOT re-derive refusal counts: the gate2hunt
  analyzer VERBATIM is run on every corpus as the
  census cross-check, and episode counts must agree
  with its totalRefusals per leg (any disagreement
  stops the run).
- Pure proof test (NEW file scripts/test-refusewin-b.js):
  synthetic-leg cases for every classification —
  resolved-by-daytime-walk (completed-at-haven next
  evening), still-refused-at-horizon (run to last day,
  survived), ended-other by game-over (day recorded),
  ended-other by moved (out-of-reach next evening),
  episode splitting across a non-refused evening,
  and the instrument-gate cases. Must pass before any
  judged leg runs.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- CONTROL-DRIVER: run after prereg commit, before
  judged legs, with the verbatim gate2hunt analyzer.
- INSTRUMENTS: episode analyzer + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs.
- JUDGED LEGS: stdout-runner transport as above.
- SENSE TEST (law): read at least one resolution
  transcript end to end (the resolution day's full
  dayLines, not just its travel lines) and judge
  whether the walk-home reads as a person finding a
  way or a silent snap; quote the lines. Also sample
  villager behavior out of the sims (goals, routines,
  dialogue, reactions) and flag anything robotic,
  static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-refusewin-b.md —
  verdict judged against this prereg, per-seed
  episode tables with routes/days, sense-read, metric
  review, village assessment in plain words, wall
  numbers as LAST MEASURED (full seat 0 / wave 5
  reached 0, Loop A lane) with the explicit note that
  this pre-seat census does not re-measure the wall.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard
and observer contract. It cannot express the
nighttravel / creekremedy-diag stacks, a 60-day
per-evening refusal census, or a census with no
variant — the same declaration gate2hunt made. The
comparison here is a census across legs on identical
seeds through the census analyzers, never labeled a
panel comparison. No panel result is fabricated; the
panel tool is not invoked on this corpus. No lever
comparison arises (DIAG only).

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a 60d window is long enough: 60d doubles
  the window that cut stories off, but a seed whose
  episode starts at day 55 could still end refused at
  60d. That outcome is classified still-refused-at-60d
  and reported, not extended mid-run; a longer window
  belongs to the NEXT run's prereg.
- Whether 'completed'-at-haven the morning after a
  refusal run could ever be a night-hop arrival rather
  than a daytime walk: NO under this instrument — the
  night hop is what refused (that is the episode);
  the evening row's 'completed' outcome with tile
  haven records the day's end at haven, and the
  resolution day's dayLines travel lines ("Travel 1
  tile to Haven.") are the daytime-walk evidence. If
  a resolution day's lines show no travel line, the
  evidence says so rather than asserting a walk.
- Whether bucket and tile criteria should ever be
  merged: NO — carried from gate2hunt; this arm keeps
  refusal counts, bucket counts, and tile counts in
  separate columns throughout.
- Whether episodes separated by a single 'completed'
  evening at a NON-haven tile should merge: NO — any
  non-refused evening splits episodes, per the
  definition above; the split is visible in the
  episode table.
