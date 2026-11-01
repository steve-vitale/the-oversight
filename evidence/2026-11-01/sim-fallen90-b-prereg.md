# sim-fallen90-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-fallen90-b, run
fleshout-loop-b-20261101T0435Z, axis food-economy, the
0330Z run's next blank (1): the 90-day follow-up on
seed 17724's day-60 fallen_tree refusal episode.
Worktree sim-fallen90-b, branch sim-fallen90-b. DIAG
ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing
policy file or existing script. New files only (this
prereg, a 90d driver variant, its pure proof test,
evidence, corpora, censuses). The episode analyzer
scripts/analyze-refusewin-b.js and the gate2hunt
analyzer scripts/analyze-gate2hunt-b.js are REUSED
VERBATIM from the base (no edits). This worker does
NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-refusewin-b.md + prereg
  (GO, base 6409c1312): BARE 60d judged legs. 17724:
  12-night creek episode days 24-35 (camp creek
  (5,6), blocked (4,5)) resolved day 36 by daytime
  walk via [[5,6],[5,5],[5,4],[4,4]], PLUS a NEW
  single night on day 60 (fallen_tree, camp wetland
  (3,5), blocked (4,5), still-refused-at-horizon).
  17734: days 10-16 resolved day 17, days 26-29
  resolved day 30, no new episode past day 30.
  17737: days 29-38 resolved day 39, days 41-46
  resolved day 47, both fallen_tree at (4,3). Totals:
  180 evenings, 40 refusals (17724: 13, 17734: 11,
  17737: 16), gate clean on all 5 legs, 6/6 episodes
  classified, 0 UNCLASSIFIED. The 60d window itself
  cuts 17724's newest story off one night in — that
  is this arm's question.
- The question this arm answers, per seed, at 90d:
  17724's day-60 episode — resolved-by-daytime-walk
  (with route) / still-refused-at-90d / ended-other;
  plus 17734/17737 re-checked at 90d (any new episode
  past day 60 listed, never hidden).

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (the way home
runs through the same travelTo pipeline as walking
out; a creek tile is a place, not a bucket class)
and docs/ABILITY-REFUSALS.md (ability-action
refusals — a DIFFERENT refusal class from
night-travel refusals; its precheck rules do not
govern this census and are not imported here). No
canon doc covers a travel-refused episode window or
a resolution rule — stated here instead of inventing
canon, as refusewin stated. Standing rules that bear
on it: perception law (Steve 2026-10-28: decisions
from what the villager senses) and "no silent
actions" (the sense test reads transcripts end to
end).

## Base commit (pinned) + base-move note

Base commit for every leg in this arm: 7612f9ee3
(worktree HEAD at prereg writing time). NOTE:
`git diff 6409c1312 HEAD -- src/js` is NOT empty on
this base — exactly one file moved: src/js/
betrayal.js, +12 lines (no other src/js delta, no
scripts/policies delta on the judged path). That is
why the control leg below is a hard gate, not a
formality: if BARE 60d on 17724 does not reproduce
refusewin exactly, the base has drifted under this
seed's trajectory and NO judged leg is run. Every
judged number below comes from legs run under this
prereg on this base, never from reused corpora as
judged evidence. Refusewin corpora are used ONLY as
design reference (episode shapes, resolution-day
fields), never as judged legs of this arm.

## Definitions (carried verbatim from refusewin, horizon generalized)

Travel-refused evening = evening row with
eveningOutcome === 'travel-refused'. 'out-of-reach'
is NO attempt and never counts. Episode = a maximal
run of consecutive loopDays with eveningOutcome
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
- still-refused-at-90d: the episode includes the
  leg's last evening day (day 90) and the leg's
  endReason is 'survived' (the window, not the
  story, cuts off). The verbatim analyzer reports
  this as 'still-refused-at-horizon' with
  horizonDay = leg.days (= 90 here); the two names
  denote the same classification.
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
  any UNCLASSIFIED episode fails GO bar (c).

## The 90d driver problem, solved by a NEW file only

The verbatim refusedband driver
scripts/refusedband-trace-b.js asserts DAYS in
{30, 60} and exits FATAL otherwise, so it CANNOT
run a 90d leg verbatim. Editing it is forbidden by
this brief (zero edits to any existing script), so
the 90d legs run under a NEW file,
scripts/refusedband-trace-90d-b.js, created by
copying the verbatim driver and changing ONLY its
header comment and its DAYS gate to {30, 60, 90}.
The original file is untouched (verified by the diff
guard at evidence time: `git diff` on the original
must be empty, and the new file must differ from it
only in the header + DAYS gate). The control leg
below uses the VERBATIM driver (DAYS=60, allowed),
so the control does not depend on the new file. If
the new driver differs from the original in any
other line, STOP and report — no judged leg on a
diverged instrument. This extension-by-new-file is
the brief's own fallback ("if you must extend,
write a NEW analyzer file and say so"), applied to
the driver, and it is said here, in the prereg,
before any judged leg.

## Legs (declared fully, run in this order)

Substrate env asserted FATAL in both drivers for ALL
legs: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
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

0. CONTROL (instrument + base-stability gate, on
   THIS base, VERBATIM driver): BARE 60d, seed 17724
   ONLY. Expected if trajectories are base-stable:
   EXACTLY refusewin's 17724 leg — 13 refusals, days
   24-35 and 60, hop split block:creek 12 /
   block:fallen_tree 1, gate-2 cross-check 12/12
   (creek denominator 12, bucket creek 12), gate
   clean (errs 0, decisions == evenings, complete).
   If it does NOT reproduce exactly, STOP and report
   base drift — do NOT judge, do NOT run judged legs.
   A count move is not silently substituted and is
   not "close enough". (Driver/gate failure also
   stops the run, same as refusewin.)
1. JUDGED LEG 17724, BARE 90d (single-seed leg; the
   day-60 episode's follow-up). NEW 90d driver.
2. JUDGED LEG 17734, BARE 90d (single-seed leg;
   re-check past day 60). NEW 90d driver.
3. JUDGED LEG 17737, BARE 90d (single-seed leg;
   re-check past day 60). NEW 90d driver.

Each seed is its own leg — NEVER pooled into a band
claim. No band bar is defined by this prereg, so no
band claim can arise from these legs. Fresh H5/H6
cells are OUT of scope for the judged legs: no stop
rule in this prereg admits them, and they are
reported as UNRUN, not zero, if unrun (as refusewin
left them).

CONTEXT LEGS (NOT judged, reported separately,
never pooled into the primary verdict): BARE 90d on
5 supplementary fresh seeds — 17801, 17802, 17803,
17804, 17805 — verified fresh before running:
none appears in any evidence/ filename, corpus dir,
or 2026-11-01 census seed list (2026-11-01 census
seeds run 17511-17566 and 17701-17738; the refusal
stack's corpus filenames run 17611-17618 and
17701-17738; 17801-17805 appear nowhere). Their
purpose is CONTEXT ONLY for the new-episode census
past day 60 (how often a fresh seed grows a
post-60d episode at all). They are analyzed with
the same analyzers and reported in their own table;
no GO bar reads them.

PILOT GATE (MEASUREMENT §§9-10): the pilot is the
60d control reproduction (leg 0) plus the proof
tests (below). No 12-16-seed confirm is run: the
question is per-seed (what happened to THESE
episodes), each seed is its own leg, and the brief's
confirm clause applies to lever comparisons, of
which this DIAG census has none (see §15
declaration). If the control reproduction fails
outright (driver error, gate failure, count move),
STOP before judged legs and report — no judged leg
on a broken or drifted instrument.

Horizons are death-aware (MEASUREMENT §10): the
harness stops at Game.over; dead villages stop
simulating (+10d tail max is the harness's own end
handling). Never a fixed 200d. Horizon here is 90d:
50% longer than the 60d that cut 17724's story off
one night in, so a resolution has room to appear. A
90d leg that ends early by game-over is judged with
its day recorded, not extended.

INSTRUMENT GATE (pilot gate on every leg, corrected
predicate carried from refusewin): every leg errs 0,
decisions == evenings in count, and complete, where
complete = loop-days complete (daysAlive === days)
OR an evening row with gameOver true OR a recorded
harness endReason other than 'survived'
('village-lost' / 'over-other'). If any leg fails,
STOP and report — no further legs on a broken
instrument.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: per seed leg, refusal episodes
(count, days, camp tile, blocked tile, bucket split)
with exactly one end classification each; plus the
gate-2 fraction on the leg's block:creek evenings as
a cross-check (reported, not thresholded).

- GO requires ALL of: (a) control leg reproduces
  refusewin exactly (13 refusals, same days,
  gate-2/census agreement as above) — else STOP, no
  verdict; (b) instrument gate clean on every judged
  leg (control 1 + judged 3 + context 5 = 9 legs,
  corrected predicate); (c) 100% episode
  classification — zero UNCLASSIFIED episodes across
  all judged legs (episodes are few; a 95% bar would
  hide one); (d) the per-seed answer — above all
  17724's day-60 episode classified as
  resolved-by-daytime-walk (with route) /
  still-refused-at-90d / ended-other — plus
  17734/17737 re-checked at 90d (any new episode
  past day 60 listed, never hidden); (e) sense pass:
  at least one resolution transcript read end to end
  if 17724's episode resolves, else the day-90
  refused night read end to end.
- HELD (not GO, not killed): the legs ran clean and
  episodes are 100% classified, but the per-seed
  question cannot be answered because a leg ended
  early (game-over) before its episode could resolve
  or recur — the episode is classified ended-other
  with its day, and the seed's question is reported
  unanswered-by-ending, not as a resolution.
- NO-GO: control reproduction fails (base drift),
  instrument gate fails on any leg, OR any episode
  is UNCLASSIFIED (instrument failure). A miss is
  NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review"
  in the evidence file and propose revisions for the
  NEXT run.

Secondary reported counts (every leg, never pooled
into a band verdict): evenings judged by outcome,
refusals by hopReturnKind, refusals by seed/day with
evening map + haven distance, block:creek evenings,
bucket split (creek / other-refused / unclassified,
by source), errs, game-overs, narration presence
(dayLines contain the engine's block line for the
refusal's blockType).

## Instruments (proved BEFORE any judged leg)

- Episode analyzer (REUSED VERBATIM):
  scripts/analyze-refusewin-b.js. Its
  still-refused-at-horizon classification is horizon
  -generic (horizonDay = leg.days); at 90d it reads
  still-refused-at-90d. It does NOT re-derive refusal
  counts: the gate2hunt analyzer VERBATIM is run on
  every corpus as the census cross-check, and episode
  counts must agree with its totalRefusals per leg
  (any disagreement stops the run).
- 90d driver (NEW file scripts/refusedband-trace-90d-b.js):
  verbatim copy of scripts/refusedband-trace-b.js
  with ONLY the header comment and the DAYS gate
  changed to {30, 60, 90}. Original untouched.
- Pure proof test (NEW file scripts/test-fallen90-b.js):
  synthetic-leg cases for 90d-horizon classification
  via the verbatim analyzer — a 90d episode resolved
  by daytime walk, a 90d episode still-refused at
  day 90 (horizonDay 90), a 90d episode ended-other by
  leg ending, episode splitting across a non-refused
  evening at 90d scale — PLUS a static guard: the
  original driver file is byte-identical to base
  (no diff) and the new driver differs from it only
  in the header + DAYS gate lines. Must pass before
  any judged leg runs. The pre-existing
  scripts/test-refusewin-b.js (10/10 on refusewin)
  is re-run as well.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: 90d driver + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs.
- CONTROL: run after prereg + instruments commits,
  before judged legs, with the verbatim driver and
  the verbatim gate2hunt analyzer. Exact reproduction
  required; else STOP.
- JUDGED LEGS: stdout-runner transport as above,
  NEW 90d driver.
- CONTEXT LEGS: same transport, NEW 90d driver,
  reported separately.
- SENSE TEST (law): read at least one resolution
  transcript end to end if 17724's episode resolves
  (the resolution day's full dayLines, not just its
  travel lines), else the day-90 refused night end to
  end, and judge whether the walk-home reads as a
  person finding a way or a silent snap (or, for a
  still-refused night, whether the refusal reads as
  a person blocked, not a silent skip); quote the
  lines. Also sample villager behavior out of the
  sims (goals, routines, dialogue, reactions) and
  flag anything robotic, static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-fallen90-b.md —
  verdict judged against this prereg, per-seed
  episode tables with routes/days, 60d vs 90d
  before/after numbers, sense-read, metric review,
  village assessment in plain words, wall numbers as
  LAST MEASURED (full seat 0 / wave 5 reached 0,
  Loop A lane) with the explicit note that this
  pre-seat census does not re-measure the wall.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard
and observer contract. It cannot express the
nighttravel / creekremedy-diag stacks, a 90-day
per-evening refusal census, or a census with no
variant — the same declaration refusewin made. The
comparison here is a census across legs on identical
seeds through the census analyzers, never labeled a
panel comparison. No panel result is fabricated; the
panel tool is not invoked on this corpus. No lever
comparison arises (DIAG only).

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a 90d window is long enough: 90d extends
  the window that cut 17724's story off one night in,
  but an episode starting at day 88 could still end
  refused at 90d. That outcome is classified
  still-refused-at-90d and reported, not extended
  mid-run; a longer window belongs to the NEXT run's
  prereg.
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
  merged: NO — carried from refusewin; this arm keeps
  refusal counts, bucket counts, and tile counts in
  separate columns throughout.
- Whether episodes separated by a single 'completed'
  evening at a NON-haven tile should merge: NO — any
  non-refused evening splits episodes, per the
  definition above; the split is visible in the
  episode table.
- H5/H6 stay UNRUN unless a prereg admits them —
  this prereg does NOT admit them, and no stop rule
  is invented mid-run.
