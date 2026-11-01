# sim-gate2hunt-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-gate2hunt-b, run
fleshout-loop-b-20261101T0119Z, axis food-economy (tracker
next blank 2 from the 20261031T2343Z closeout: "a gate-2
hunt on FRESH BARE-stack seed bands until a second refusal
seed appears"). Worktree sim-gate2hunt-b, branch
sim-gate2hunt-b. DIAG ONLY (measurement): zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. New files only
(this prereg, a corrected analyzer, its pure proof test,
evidence, corpora, censuses). The hunt driver
scripts/refusedband-trace-b.js is REUSED VERBATIM from
the base (no edits) — it already carries the BARE stack
and the FATAL substrate assertions. This worker does NOT
push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across
the map; a creek tile is a place, not a bucket class).
No canon doc covers a travel-refused band or a gate-2
agreement rule — stated here instead of inventing canon,
as refusedband stated. Standing rules that bear on it:
perception law (Steve 2026-10-28: decisions from what
the villager senses) and "no silent actions" (the sense
test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-refusedband-b.md + prereg
  (HELD, base 24bf27d80): 10 cells / 80 legs / 2,855
  evenings; 37 travel-refused evenings ALL on a single
  seed (17606, creek tile (4,3), days 4-9 and 13-15, all
  four no-rescue stacks, block:creek + probe agreement
  37/37). Gate 2 stays UNTESTED as a band measurement,
  not failed. Single-seed leads are leads, never pooled
  into a band claim.
- Spent bands (never re-hunted as cells here):
  F1 17501-17508, F2 17511-17518 (strandred /
  buckettile / refusedband P1 cells), G1 17601-17608,
  G2 17611-17618 (refusedband hunt cells). The sibling
  strandwide arm runs a different stack (creek-seeking
  policy variant); its cells are stack-distinct from
  these BARE cells even where a seed number coincides.
- Why BARE only: on 17606 the four no-rescue stacks
  agreed EXACTLY (same 9 days), so trigger wrappers do
  not change refusal geometry; P1's bridge rescue
  collapses a refusal RUN to a single evening (9 -> 1),
  so a rescue stack is the wrong place to hunt bands;
  60d horizons on the buckettile bands added 0 refusals
  in 935 evenings, so horizon is not the lever — fresh
  seed bands on the run-preserving BARE stack are.
- Instrument fix carried from 2343Z metric review: the
  refusedband analyzer's evening-row gameOver flag
  misses overs that land in the sleep step (P1 60d F2
  leg 17518, village-lost day 35, flagged false while
  complete 35/35, errs 0). This arm's analyzer
  (scripts/analyze-gate2hunt-b.js, NEW file) accepts,
  in addition to the old predicate, any recorded
  harness endReason other than 'survived'
  ('village-lost' / 'over-other') as completing a leg.
  The old analyzer is NOT edited (other workers may
  share it). The fix is proved BEFORE any judged leg:
  the new analyzer run on the 17518 corpus leg must
  flag it complete with its day recorded, and refusal
  counts on its cell must be unchanged with/without
  that leg (0 either way); the pure test covers the
  predicate cases. All judged cells use the corrected
  gate; the old gate is reported alongside only as a
  cross-check on the 17518 leg.

## Base commit (pinned)

Base commit for every leg in this arm: ee159dbc3
(worktree HEAD at prereg writing time). `git diff
--stat HEAD -- src/js` is EMPTY at prereg time by
construction (this worktree holds only prior arms' DIAG
evidence/instruments plus this prereg; no game code is
touched by this arm — verified again by the diff guard
at evidence time). Every judged number below comes from
legs run under this prereg on this base, never from
reused corpora as judged evidence. The 17518 corpus is
used ONLY as instrument-proof input, never as a judged
leg of this hunt.

## Definitions (carried verbatim from refusedband prereg — not re-derived)

Travel-refused evening = evening row with
eveningOutcome === 'travel-refused' (nighttravel.js
nightStep: haven offered AND one honest Game.travelTo
hop attempted AND post-hop position not haven).
'out-of-reach' is NO attempt and never counts.
'travel-arrived-combat', 'travel-died', 'blocked-combat',
'blocked-tent', detour outcomes, 'policy-no-record'
never count. Gate-2 agreement = N/D over a found band's
refusals, D = refusals with hopReturnKind ===
'block:creek', N = those with bucket 'creek'
(creekremedy-diag classifyRefusedEvening + bucketOf,
source ctx._creekremedyLast on BARE). Non-creek
refusals never enter D. A band is ONE search cell (one
stack x one seed band x one horizon, 8 seeds).
Refusals scattered across cells do NOT pool into a band.

## Search grid (declared fully, run in this order, stop rule below)

Fresh BARE-stack bands (no overlap with F1/F2/G1/G2):
- H1: 17701, 17702, 17703, 17704, 17705, 17706, 17707, 17708
- H2: 17711, 17712, 17713, 17714, 17715, 17716, 17717, 17718
- H3: 17721, 17722, 17723, 17724, 17725, 17726, 17727, 17728
- H4: 17731, 17732, 17733, 17734, 17735, 17736, 17737, 17738
- H5: 17741, 17742, 17743, 17744, 17745, 17746, 17747, 17748
- H6: 17751, 17752, 17753, 17754, 17755, 17756, 17757, 17758

Cells (8 seeds each, BARE 30d unless stated; pilot gate
on EVERY cell — see below; order is the hunt order):

0. CONTROL: deed-seeking 30d H1 (instrument validation;
   not a hunt cell, run first so a broken instrument
   stops the run before any hunt spend). Expected:
   every evening 'policy-no-record', 0 refusals.
1. BARE 30d H1.  2. BARE 30d H2.  3. BARE 30d H3.
4. BARE 30d H4.  5. BARE 30d H5.  6. BARE 30d H6.

STOP RULE: cells run in order until EITHER (a) a cell
meets the band count bar (>= 5 travel-refused evenings
on >= 2 seeds inside that single cell) — then STOP
searching and measure gate 2 on THAT cell's corpus (no
further cells run; unrun cells are listed as unrun, not
as zero-find); OR (b) all 7 cells run with no cell
meeting the bar — then the verdict is HELD with the
full searched space stated. A cell that fails the
instrument gate stops the run (NO-GO by instrument
failure), never skipped-over. A control cell showing
any travel-refused evening stops the run (NO-GO by
instrument failure).

Substrate env asserted FATAL in the reused driver for
ALL legs: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, MORNINGCARRY/WINDOWCARRY/FEDEVENING/
COMPETENT_EVENING_DETOUR never 1; BARE requires
CREEKREMEDY_DIAG=1 and WOODCARRY/WOODWARM/STRANDFIX/
WAITSALIGN_ASKSKIP/SELECTTRIM unset/0; CONTROL requires
all levers unset/0. DAYS is 30 for every cell here.

PILOT / CONFIRM staging (MEASUREMENT §§9-10): the
first hunt cell (BARE 30d H1, 8 seeds) IS the pilot —
no confirm spend is made before it is judged. Each
further cell is an 8-seed hunt cell, not a confirm of a
prior cell (a band is a per-cell property; re-running a
spent cell's seeds is not a confirm). IF a cell meets
the band bar, gate 2 is measured on that cell's own
8-seed corpus and the sense test reads its refusal
evenings; no 12-16 seed confirm is run, because the
bar itself is defined per 8-seed cell and the brief's
confirm clause applies to lever comparisons, of which
this DIAG census has none (see §15 declaration). If a
cell shows >= 5 refusals on exactly ONE seed, that seed
is reported as a LEAD (as 17606 was), the hunt
continues to the next fresh cell, and no pooling
across cells is ever claimed.

INSTRUMENT GATE (pilot gate on every cell, corrected
predicate): every leg errs 0, decisions == evenings in
count, and complete, where complete = loop-days
complete (daysAlive === days) OR an evening row with
gameOver true OR a recorded harness endReason other
than 'survived' ('village-lost' / 'over-other'). If any
leg fails, STOP and report — no further cells on a
broken instrument.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d
tail max is the harness's own end handling). Never a
fixed 200d.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: per cell, travel-refused evenings
(count, seeds, days) + hopReturnKind split; on a found
band, gate-2 agreement N/D over its block:creek
evenings.

- GO requires ALL of: (a) instrument gate clean on
  every judged leg (corrected predicate); (b) a found
  band (one fresh BARE cell) with >= 5 travel-refused
  evenings on >= 2 seeds; (c) gate 2 measured on that
  band with agreement reported as an exact fraction N/D
  over its block:creek evenings, with D stated, AND
  D >= 1. Agreement value itself is not thresholded.
- BAND-FOUND-GATE-2-STILL-UNTESTABLE (not GO, not HELD-
  by-absence, not killed): a cell meets (b) but its band
  has D = 0 block:creek evenings. Reported with the
  numbers; gate 2 stays untested, and the next hunt's
  target is a creek-refusal band.
- HELD (not GO, not killed): the bounded search space
  is exhausted (all 7 cells run, or the stop rule's (b))
  with no cell meeting (b) — including the case where
  refusals still sit on one seed only. The arm is
  complete and gate 2 stays untested. The evidence must
  NOT call gate 2 "failed".
- NO-GO: instrument gate fails on any judged leg, OR
  the travel-refused definition proves unmeasurable
  from the code (state which, with the code evidence),
  OR the control cell shows a travel-refused evening
  (instrument broken). A definition failure is
  reported, not patched around by redefining mid-run.

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
- INSTRUMENTS: corrected analyzer + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs. Driver reused verbatim
  (no new driver file; no existing file edited).
- JUDGED LEGS: stdout-runner transport (one JSON line
  per seed to stdout; stdout -> file in evidence/ in a
  foreground exec; idle splitter splits into per-seed
  files; jsonl deleted after split). Judged corpora are
  NEVER staged in /tmp, and judged legs NEVER write
  files from a game-loaded process.
- SENSE TEST (law): IF a band is found, read refused
  evenings' transcripts/dayLines end to end and judge
  whether the refusals read as a person turned back
  from home (quote the lines). IF no band is found,
  the sense section states that plainly, plus a
  single-seed lead read if a lead seed exists,
  labeled as such (as refusedband did for 17606).
- EVIDENCE: evidence/2026-11-01/sim-gate2hunt-b.md —
  verdict judged against this prereg, hunt table with
  stacks/bands/horizons/seeds/evenings, gate-2 numbers
  or the held statement, sense-read or its absence
  stated, metric review, village assessment in plain
  words, wall numbers as LAST MEASURED (full seat 0 /
  wave 5 reached 0, Loop A lane) with the explicit note
  that this pre-seat census does not re-measure the
  wall — census numbers are never presented as wall
  numbers.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel /
creekremedy-diag stacks, a 30-day per-evening refusal
census, or a census with no variant — the same
declaration refusedband made. The comparison here is a
census across cells on identical seeds through the
census analyzers, never labeled a panel comparison. No
panel result is fabricated; the panel tool is not
invoked on this corpus. No lever comparison arises
(DIAG only).

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether agreement should be thresholded (e.g. >= 80%
  probe agreement for a gate-2 GO): NO under this prereg
  — the brief's GO bar asks for gate 2 MEASURED with an
  exact fraction, and adding a value threshold now would
  be a mid-run redefinition. If the measured fraction is
  low, the finding is "probe disagrees this often", and
  any threshold belongs to the NEXT run's prereg.
- Whether refusals pooled across cells could form a band:
  NO — a band is one cell by definition above, so a
  gate-2 measurement is on one coherent set of legs.
  Pooled refusal counts are reported for the hunt's
  completeness, never as a band.
- Whether 'travel-arrived-combat' evenings should count
  as refusals: NO — the hop was not refused; the vessel
  arrived. They are reported in their own outcome column.
- Whether the corrected gate predicate could mask a
  genuinely truncated leg: the predicate still requires
  errs 0 AND decisions == evenings, and only accepts an
  engine-recorded ending ('village-lost' /
  'over-other'); a leg that stops early with endReason
  'survived' and daysAlive < days still fails. The
  cross-check (old gate on the 17518 leg) is reported
  in the evidence so the change is auditable.
- Whether bucket and tile criteria should ever be merged:
  NO — carried from refusedband; this arm keeps refusal
  counts, bucket counts, and tile counts in separate
  columns throughout.
