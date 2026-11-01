# sim-h56-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-h56-b, run
fleshout-loop-b-20261101T0730Z, axis food-economy
(tracker next blank 6 from the 2026-11-01 0630Z Loop B
closeout, carried UNRUN through many runs: run the
gate2hunt H5 and H6 cells and close that carried
blank). Worktree sim-h56-b, branch sim-h56-b. DIAG
ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing
policy file or existing script. New files only (this
prereg, evidence, corpora, censuses). The hunt driver
scripts/refusedband-trace-b.js and the analyzer
scripts/analyze-gate2hunt-b.js are REUSED VERBATIM
from the base (no edits). This worker does NOT push,
bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run
across the map; a creek tile is a place, not a bucket
class; the (4,3) chokepoint note from gate2hunt is a
tile observation, not canon). No canon doc covers a
travel-refused band or a gate-2 agreement rule —
stated here instead of inventing canon, as gate2hunt
stated. Standing rules that bear on it: perception
law (Steve 2026-10-28: decisions from what the
villager senses) and "no silent actions" (the sense
test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-gate2hunt-b.md + prereg
  (GO, base ee159dbc3): BARE 30d hunt H1–H4 in order
  under a stop rule, STOPPED at H4 (band found: 13
  travel-refused evenings on 2 seeds, gate-2 agreement
  11/11). H5 and H6 were listed as UNRUN, not
  zero-find. Gate 2 as a band measurement is therefore
  already closed; this arm does NOT re-measure it as
  its verdict — it closes the carried UNRUN blank.
- Verified unrun before designing (this run, worktree
  at base 0f5822d7a): no H5/H6 corpus directory, no
  H5/H6 census file, and no filename carrying seeds
  17741–17748 or 17751–17758 exists under
  evidence/2026-11-01/; the gate2hunt censuses list
  judged seeds ending at H4 (17738). The gate2hunt
  prereg's listing of H5/H6 as fresh bands is the
  declaration; the file check above is the
  verification. No spent cell is re-hunted here.
- Spent bands (never re-hunted): F1 17501–17508, F2
  17511–17518, G1 17601–17608, G2 17611–17618,
  H1 17701–17708, H2 17711–17718, H3 17721–17728,
  H4 17731–17738. Sibling strandwide cells are
  stack-distinct from these BARE cells even where a
  seed number coincides (gate2hunt prereg).
- Instrument: the gate2hunt analyzer carries the
  corrected complete predicate (loop-days complete OR
  an evening row with gameOver true OR a recorded
  harness endReason other than 'survived'). Its pure
  proof (scripts/test-gate2hunt-b.js) was re-run on
  this base BEFORE any judged leg: 14/14. The
  analyzer is reused verbatim, so no new analyzer and
  no new proof test are written for this arm; the
  existing proof score is cited instead of duplicated.

## Base commit (pinned)

Base commit for every leg in this arm: 0f5822d7a
(worktree HEAD at prereg writing time, after the
brief's required fast-forward rebase onto master;
the rebase succeeded with no commits of this arm's
own to replay). `git diff --stat HEAD -- src/js` is
EMPTY at prereg time by construction (this worktree
holds only prior arms' DIAG evidence/instruments
plus this prereg; no game code is touched by this
arm — verified again by the diff guard at evidence
time). Every judged number below comes from legs run
under this prereg on this base, never from reused
corpora as judged evidence.

## Definitions (carried verbatim from gate2hunt prereg — not re-derived)

Travel-refused evening = evening row with
eveningOutcome === 'travel-refused' (nighttravel.js
nightStep: haven offered AND one honest Game.travelTo
hop attempted AND post-hop position not haven).
'out-of-reach' is NO attempt and never counts.
'travel-arrived-combat', 'travel-died', 'blocked-combat',
'blocked-tent', detour outcomes, 'policy-no-record'
never count. Gate-2 agreement = N/D over a found
band's refusals, D = refusals with hopReturnKind ===
'block:creek', N = those with bucket 'creek'
(creekremedy-diag classifyRefusedEvening + bucketOf,
source ctx._creekremedyLast on BARE). Non-creek
refusals never enter D. A band is ONE search cell
(one stack x one seed band x one horizon, 8 seeds).
Refusals scattered across cells do NOT pool into a
band.

## Search grid (declared fully, run in this order, no stop rule)

Fresh BARE-stack bands, the gate2hunt leftovers:
- H5: 17741, 17742, 17743, 17744, 17745, 17746, 17747, 17748
- H6: 17751, 17752, 17753, 17754, 17755, 17756, 17757, 17758

Cells (8 seeds each, BARE 30d; run in this order):

1. BARE 30d H5.  2. BARE 30d H6.

There is NO stop rule in this arm: unlike gate2hunt,
which stopped at its first band, this arm runs BOTH
cells whatever H5 shows, because the blank is the
pair of unrun cells, not the next band. A band found
in either cell is reported with its gate-2 fraction
as a bonus, not as a requirement. A cell that fails
the instrument gate stops the run (NO-GO by
instrument failure), never skipped-over.

Substrate env asserted FATAL in the reused driver for
ALL legs, exactly as gate2hunt: COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/FEDEVENING/
COMPETENT_EVENING_DETOUR never 1; BARE requires
CREEKREMEDY_DIAG=1 and WOODCARRY/WOODWARM/STRANDFIX/
WAITSALIGN_ASKSKIP/SELECTTRIM unset/0. DAYS is 30 for
every cell here.

PILOT / CONFIRM staging (MEASUREMENT §§9-10): the
first cell (BARE 30d H5, 8 seeds) IS the pilot — no
confirm spend is made before it is judged. H6 is the
second hunt cell, not a confirm of H5 (a band is a
per-cell property; re-running a spent cell's seeds is
not a confirm). No 12-16 seed confirm is run, because
the bar itself is defined per 8-seed cell and this
DIAG census has no lever comparison (see §15
declaration). If a cell shows >= 5 refusals on
exactly ONE seed, that seed is reported as a LEAD,
exactly as gate2hunt reported 17703 and 17724, and no
pooling across cells is ever claimed.

INSTRUMENT GATE (pilot gate on every cell, corrected
predicate): every leg errs 0, decisions == evenings in
count, and complete, where complete = loop-days
complete (daysAlive === days) OR an evening row with
gameOver true OR a recorded harness endReason other
than 'survived' ('village-lost' / 'over-other'). If
any leg fails, STOP and report — no further cells on
a broken instrument.

Horizons are death-aware (MEASUREMENT §10): the
harness stops at Game.over; dead villages stop
simulating (+10d tail max is the harness's own end
handling). Never a fixed 200d.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: per cell, travel-refused evenings
(count, seeds, days) + hopReturnKind split; on a found
band, gate-2 agreement N/D over its block:creek
evenings.

- GO requires ALL of: (a) instrument gate clean on
  every judged leg (corrected predicate); (b) BOTH
  cells H5 and H6 judged and reported with per-cell
  tables (evenings, refusals, refusal seeds, days,
  hopReturnKind split, gate-2 N/D if D >= 1). A band
  found in a cell (>= 5 travel-refused evenings on
  >= 2 seeds inside that single cell) is reported
  WITH its gate-2 fraction — a bonus, not a
  requirement, because this arm's blank is the UNRUN
  cells and gate 2 as a band measurement is already
  closed by gate2hunt (H4, 11/11).
- HELD-by-exhaustion (not GO, not killed, not a
  zero-find for anything else): the verdict when (a)
  holds and both cells are judged but no cell meets
  the band bar. The evidence must state the full
  searched space (both cells, 16 legs, 480 evenings)
  and must NOT call gate 2 failed, must NOT call
  refusals absent beyond these two cells, and must
  NOT pool the two cells into a band.
- NO-GO: instrument gate fails on any judged leg, OR
  the travel-refused definition proves unmeasurable
  from the code (state which, with the code
  evidence). A definition failure is reported, not
  patched around by redefining mid-run. No control
  cell is run (gate2hunt already validated the
  instrument on this stack; the brief directs no
  control re-run unless the instrument gate fails, in
  which case the run stops and reports as above).

Secondary reported counts (every cell, never pooled
across cells in verdict counts): evenings judged by
outcome, refusals by hopReturnKind, refusals by
seed/day with evening map + haven distance, block:creek
evenings, bucket split (creek / other-refused /
unclassified, by source), errs, game-overs, narration
presence (dayLines contain the engine's block line for
the refusal's blockType; creek: "The creek runs fast
here — no crossing without a bridge or a swim.").

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: driver + analyzer reused verbatim (no
  new instrument file; no existing file edited). The
  existing pure proof (scripts/test-gate2hunt-b.js,
  14/14 on this base) is cited; no duplicate proof
  test is written.
- JUDGED LEGS: stdout-runner transport (one JSON line
  per seed to stdout; stdout -> file in evidence/ in a
  foreground exec; idle splitter splits into per-seed
  files; jsonl deleted after split). Judged corpora are
  NEVER staged in /tmp, and judged legs NEVER write
  files from a game-loaded process.
- SENSE TEST (law): read dayLines for every refusal
  evening found (and a sample of non-refusal evenings
  on the same seeds); report whether the refusal reads
  as a person blocked by terrain or as an artifact,
  and whether the refusal is narrated honestly in the
  transcript. If no refusal evening is found in either
  cell, the sense section states that plainly, plus a
  sample non-refusal read on the judged seeds.
- EVIDENCE: evidence/2026-11-01/sim-h56-b.md —
  verdict judged against this prereg, per-cell tables,
  band report or the held-by-exhaustion statement,
  sense-read or its absence stated, metric review,
  village assessment in plain words, wall numbers as
  LAST MEASURED (full seat 0 / wave 5 reached 0, Loop
  A lane) with the explicit note that this pre-seat
  census does not re-measure the wall — census numbers
  are never presented as wall numbers.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel /
creekremedy-diag stacks, a 30-day per-evening refusal
census, or a census with no variant — the same
declaration gate2hunt made. The comparison here is a
census across cells on identical seeds through the
census analyzers, never labeled a panel comparison. No
panel result is fabricated; the panel tool is not
invoked on this corpus. No lever comparison arises
(DIAG only).

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a band found here should re-open gate 2:
  NO as a verdict matter — gate 2 as a band
  measurement is already closed (gate2hunt H4,
  11/11). A band here is reported with its fraction
  as corroboration, never as a re-verdict.
- Whether agreement should be thresholded: NO under
  this prereg — agreement is reported as an exact
  fraction, never thresholded, as gate2hunt did.
- Whether refusals pooled across H5+H6 could form a
  band: NO — a band is one cell by definition above.
  Pooled refusal counts are reported for the hunt's
  completeness, never as a band.
- Whether 'travel-arrived-combat' evenings should count
  as refusals: NO — the hop was not refused; the
  vessel arrived. They are reported in their own
  outcome column.
- Whether bucket and tile criteria should ever be merged:
  NO — carried from gate2hunt; this arm keeps refusal
  counts, bucket counts, and tile counts in separate
  columns throughout.
- Whether the corrected gate predicate could mask a
  genuinely truncated leg: carried from gate2hunt —
  the predicate still requires errs 0 AND decisions ==
  evenings, and only accepts an engine-recorded ending;
  a leg that stops early with endReason 'survived' and
  daysAlive < days still fails.
