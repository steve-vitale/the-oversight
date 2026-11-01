# sim-refusedband-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-refusedband-b, run
fleshout-loop-b-20261031T2343Z, axis food-economy (tracker
next blank (4): "gate-2 test on a travel-refused band").
Worktree sim-refusedband-b, branch sim-refusedband-b. DIAG
ONLY (measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing
script. New files only (this prereg, a hunt driver, a hunt
analyzer, its pure proof test, evidence, corpora, censuses).
This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across the
map; ~35% of creek tiles need a bridge or a swimmer — a creek
tile is a place, not a bucket class). No canon doc covers a
travel-refused band or a gate-2 agreement rule — stated here
instead of inventing canon, as buckettile stated for the
creek-evening criterion. Standing rules that bear on it:
perception law (Steve 2026-10-28: decisions from what the
villager senses) and "no silent actions" (the sense test
reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-buckettile-b.md + prereg (DIAG-GO,
  definitional, base c9ac9183c): on the P1 stack
  (withWoodwarm(withWoodcarry(nighttravel)), WOODCARRY=1,
  WOODWARM=1), 0 travel-refused evenings in ALL 480 judged
  evenings (pilot P1 F2 30d + confirm P1 F1 30d), so gate 2
  (block:creek + probe agreement) is UNTESTED, not failed.
  Gate 1 (bucket-explained creek-tile evenings) passed 7/7
  on P1 F2 30d.
- evidence/2026-10-31/sim-confirmednight-b.md: P3
  deed-seeking is 149/149 NO-ATTEMPT (that policy has no
  evening walk-home step, so it cannot produce
  travel-refused evenings — it is this arm's negative
  control, not a hunt cell).
- The tile and bucket criteria must NEVER be merged into one
  creek-evening count. This arm measures gate 2 only, on a
  travel-refused band if one is found.

## Base commit (pinned)

Base commit for every leg in this arm: 24bf27d80 (worktree
HEAD at prereg writing time — the batch ship's version bump
on top of journey-deepening r77 and Loop A's 2156 round).
`git diff --stat HEAD -- src/js` is EMPTY at prereg time by
construction (this worktree holds only prior arms' DIAG
evidence/instruments plus this prereg; no game code is
touched by this arm — verified again by the diff guard at
evidence time). Every judged number below comes from legs
run under this prereg on this base, never from reused
corpora as judged evidence.

## Definitions (verified against code BEFORE any judged leg — not shorthand)

### Travel-refused evening (the hunted unit)

An evening where a homeward hop was ATTEMPTED and refused.
Exact code path, read in full before designing:

1. scripts/policies/nighttravel.js, nightStep(): for an away
   vessel (not already-inside haven, not on the haven tile,
   not blocked-combat, not blocked-tent), it computes
   havenCoords (state.village.px/py, engine default 4,4,
   verified type 'haven' at runtime) and checks
   `offered = Game.travelTargets().some(t => t.x === hx &&
   t.y === hy)`. If NOT offered, outcome is 'out-of-reach'
   and nightStep RETURNS before any hop — that is NO
   ATTEMPT, and it is NOT counted here (it is buckettile's
   gate 1, a different thing).
2. If offered, nightStep calls `Game.travelTo(hx, hy)` once
   (no force, no route-around, no clearing) and snapshots
   the position after the hop. If the post-hop position is
   NOT the haven node, outcome is 'travel-refused' (unless
   the hop killed the player: 'travel-died', or a fight is
   live after the hop: 'travel-arrived-combat' — neither
   counts as a refusal).
3. The record carries `rec.travel.hopReturnKind`: for an
   object return, `'block:' + (hopRet.blockType ||
   hopRet.kind || '?')`. src/js/game.js travelTo() returns
   a block object `{kind: 'blockage', blockType}` when the
   destination or any intermediate tile on a shortest path
   is blocked — blockType 'creek' when a creek tile on the
   path needs a bridge and is unbridged and the vessel is
   not a swimmer (travelBlockage(); destination-first,
   then intermediates). A hopReturnKind of 'block:creek'
   therefore means the engine refused the homeward hop at
   a creek.

COUNT RULE (exact, one place): a travel-refused evening is
an evening row with `eveningOutcome === 'travel-refused'`
— i.e. ctx._ntLast.outcome as recorded by nightStep (or by
a trigger-day wrapper that replicates nightStep's ctx
bookkeeping: strandfix-ticks, waitsalign, selecttrim — see
the stack survey). No other outcome counts, including
'out-of-reach', 'blocked-combat', 'travel-arrived-combat',
'travel-died', detour outcomes, and 'policy-no-record'.
hopReturnKind is recorded alongside every refusal; it does
not gate the refusal count, it classifies it.

### Gate 2: block:creek + probe agreement (the measurement, if a band exists)

Classification source, in priority order, per refused
evening: (i) the P1 woodcarry record ctx._wcLast
(scripts/policies/woodcarry.js evening block: on a
travel-refused evening ONLY, it calls creekremedy-diag's
classifyRefusedEvening and records bucket via bucketOf);
(ii) otherwise the creekremedy-diag record
ctx._creekremedyLast (scripts/policies/creekremedy-diag.js
withCreekremedyDiag: same classifyRefusedEvening, pure
reads, on refused evenings only). Both sources use the
SAME pure functions, so a bucket from either source means
the same thing; the analyzer records which source supplied
it, and never mixes the two on one evening.

classifyRefusedEvening (creekremedy-diag.js) + bucketOf:
- hopType = the suffix of hopReturnKind after 'block:'.
- directHopBlockage (scripts/creekpath-probe-b.js, pure
  reads, mirrored from travelTo's refusal scan) gives
  blockType + blockedTile.
- probeAgrees = blockType && hopType && blockType ===
  hopType (type agreement; the probe's tile is
  authoritative for the record).
- isCreek = hopType === 'creek' AND probeAgrees AND
  blockType === 'creek' AND no probeError.
- bucketOf: 'creek' iff isCreek && !probeError; a hop that
  says creek but is not isCreek is 'unclassified'; any
  other refusal is 'other-refused'.

AGREEMENT RULE (exact, fixed before measuring): over a
found band's travel-refused evenings, let D = the number
with hopReturnKind === 'block:creek' (hop says creek),
and N = the number among those D with bucket 'creek'
(probe agrees, no error). Gate-2 agreement = N/D, reported
as an exact fraction with D stated. The remaining D - N
evenings are itemized per evening as 'unclassified' with
their failing field (probeAgrees false, probeError, or
blockType mismatch). Non-creek refusals
(hopReturnKind !== 'block:creek') are reported in their
own column and NEVER enter D. Agreement is REPORTED, not
thresholded: no agreement value is a GO bar (see below) —
a low fraction is a finding about the probe, not a miss
to re-score.

### Band

A band is ONE search cell (one stack x one seed band x one
horizon, 8 seeds). Refusals scattered across cells do NOT
pool into a band: the count bar must be met inside a
single cell, so the gate-2 measurement is on one coherent
set of legs.

## Policy survey (read, not guessed — which stacks have an evening walk-home step)

WALK-HOME STEP = a daily() that, on an away evening, runs
nighttravel's nightStep (offered-check + one honest hop
home) or delegates to a policy that does. Surveyed by
reading every scripts/policies/*.js require/import and
daily():

- HAS the step (walk-home via nighttravel):
  nighttravel.js itself (the step); woodcarry.js (wraps an
  inner that runs it; adds morning carry + evening bridge
  attempt on refused evenings only); woodwarm.js (wraps
  woodcarry; adds a stranded-night warmth fire);
  campfire.js (wraps woodcarry; acts only on already-
  refused creek nights — post-refusal, never refusal-
  creating); fedevening-diag.js (sits inside woodwarm;
  acts only on still-creek refused evenings —
  post-refusal); pressb-diag.js (wraps the woodcarry
  stack; acts on stranded field mornings — post-refusal);
  strandfix-morning-diag.js (wraps the stack; morning
  recovery on stranded field mornings — post-refusal);
  axefirst-diag.js (wraps the nighttravel+woodcarry+
  woodwarm stack; adds a deliberate ruin run that day —
  daytime geometry, not an evening step);
  strandfix-ticks-diag.js (own daily; on creek-wake short
  days skips the competent routine and runs ONLY
  nightStep from camp, with nighttravel's ctx
  bookkeeping); waitsalign-diag.js (own daily; on
  creek-wake short days runs nightStep from camp);
  selecttrim-diag.js (own daily; on trim days runs
  nightStep from camp).
- NO walk-home step (cannot produce travel-refused
  evenings, never hunt cells): competent.js (no evening
  step at all); deed-seeking.js (competent-based, no
  evening step — confirmednight's 149/149 NO-ATTEMPT);
  nomadseek.js (daytime road policy, no night step);
  insideevening.js (eveningStep handles ONLY
  already-at-haven evenings: lodge walk + 'Go inside' —
  it never calls travelTo home, so it is NOT a walk-home
  step); every other competent-based policy (seeker,
  winseek, kind, meatseek, etc. — competent daily with no
  nightStep call).

HUNT STACKS RUN (refusal-geometry-distinct, not every
wrapper — post-refusal actors cannot create a refusal,
so running them as hunt cells would re-run P1's geometry
under a different label):
- P1: withWoodwarm(withWoodcarry(nighttravel)),
  WOODCARRY=1, WOODWARM=1. The buckettile stack; re-run
  here on fresh bands + longer horizons.
- BARE: withCreekremedyDiag(nighttravel),
  CREEKREMEDY_DIAG=1, no woodcarry/woodwarm. No bridge
  rescue, no warmth fire: a refused vessel stays away
  the next morning, so a near-haven creek camp can refuse
  night after night — the best repeat-refusal geometry.
  Classification comes from ctx._creekremedyLast.
- STRANDFIX: withCreekremedyDiag(withStrandfix
  (nighttravel)), STRANDFIX=1, CREEKREMEDY_DIAG=1. Hold
  days skip the competent routine and re-run nightStep
  from the same camp — a camped vessel re-attempts home
  nightly instead of wandering off.
- WAITSALIGN: withCreekremedyDiag(withWaitsalign
  (nighttravel)), WAITSALIGN_ASKSKIP=1,
  CREEKREMEDY_DIAG=1. Same trigger class as strandfix
  (creek-wake short days -> nightStep from camp).
- SELECTTRIM: withCreekremedyDiag(withSelecttrim
  (nighttravel)), SELECTTRIM=1, CREEKREMEDY_DIAG=1. Same
  trigger class (trim days -> nightStep from camp).
- CONTROL (negative, not a hunt cell): deed-seeking
  (P3), no evening step. Expected: every evening
  'policy-no-record', 0 refusals. If the control shows
  any 'travel-refused' evening, the instrument is broken
  and the run stops (NO-GO by instrument failure).

Post-refusal wrappers NOT run as hunt cells (reason
stated, not silent): campfire, fedevening-diag,
pressb-diag, strandfix-morning-diag, axefirst-diag — each
acts only after a refusal (or on daytime geometry that
does not include an evening hop), so none can create the
first refusal on a band where P1/BARE find none. They are
named here as the NEXT hunt's cells if this search holds
and a refusal-adjacent geometry is later wanted.

## Search grid (declared fully, run in this order, stop rule below)

Seed bands (fresh bands G1/G2 are new; F1/F2 are the
strandred/confirmednight bands, reused only for the
longer-horizon cells):
- F1: 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508
- F2: 17511, 17512, 17513, 17514, 17515, 17516, 17517, 17518
- G1: 17601, 17602, 17603, 17604, 17605, 17606, 17607, 17608
- G2: 17611, 17612, 17613, 17614, 17615, 17616, 17617, 17618

Cells (8 seeds each; pilot gate on EVERY cell — see
below; order is the hunt order, most refusal-prone
geometry first):

1. CONTROL: deed-seeking 30d G1 (instrument validation;
   not a hunt cell, run first so a broken instrument
   stops the run before any hunt spend).
2. BARE 30d G1.
3. BARE 30d G2.
4. STRANDFIX 30d G1.
5. WAITSALIGN 30d G1.
6. SELECTTRIM 30d G1.
7. P1 30d G1.
8. P1 30d G2.
9. P1 60d F2.
10. P1 60d F1.

STOP RULE: cells run in order until EITHER (a) a cell
meets the band count bar (≥ 5 travel-refused evenings on
≥ 2 seeds inside that single cell) — then STOP searching
and measure gate 2 on THAT cell's corpus (no further
cells run; unrun cells are listed as unrun, not as
zero-find); OR (b) all 10 cells run with no cell meeting
the bar — then the verdict is HELD with the full
searched space stated. A cell that fails the instrument
gate stops the run (NO-GO by instrument failure), never
skipped-over.

Substrate env asserted FATAL in the driver for ALL legs:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, MORNINGCARRY/WINDOWCARRY/FEDEVENING unset/0
except as the cell's own stack requires (FEDEVENING is
never 1 in this arm; the fedevening-diag wrapper is not
run). Per-cell gates asserted FATAL: P1 requires
WOODCARRY=1 + WOODWARM=1; BARE/STRANDFIX/WAITSALIGN/
SELECTTRIM require CREEKREMEDY_DIAG=1 and WOODCARRY/
WOODWARM unset/0 plus their own lever =1; CONTROL
requires all of WOODCARRY/WOODWARM/CREEKREMEDY_DIAG/
STRANDFIX/WAITSALIGN_ASKSKIP/SELECTTRIM unset/0.
COMPETENT_EVENING_DETOUR is never 1 (the detour gate
would convert refusals into detour outcomes and hide the
hunted unit).

Instruments: a NEW hunt driver (scripts/refusedband-
trace-b.js — stdout transport, one JSON line per seed,
same morning/evening snap shape as absencehunt, plus
_ctx._creekremedyLast on the evening row) and a NEW
analyzer (scripts/analyze-refusedband-b.js — per-seed
refusal lists with hopReturnKind + classification source
+ bucket + probe fields, per-cell totals, gate-2
fraction, instrument-gate checks). The absencehunt
driver/analyzer/splitter are reused verbatim ONLY as
reference for the snap shape; no existing file is
edited. A NEW pure proof test
(scripts/test-refusedband-b.js) must pass BEFORE any
judged leg runs.

INSTRUMENT GATE (pilot gate on every cell, MEASUREMENT
§9): every leg errs 0, decisions == evenings in count,
loop-days complete or a game-over with its day recorded.
If any leg fails, STOP and report — no further cells on
a broken instrument.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d
tail max is the harness's own end handling). Never a
fixed 200d.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: per cell, travel-refused evenings (count,
seeds, days) + hopReturnKind split; on a found band,
gate-2 agreement N/D over its block:creek evenings.

- GO requires ALL of: (a) instrument gate clean on every
  judged leg; (b) a found band (one cell) with >= 5
  travel-refused evenings on >= 2 seeds; (c) gate 2
  measured on that band with agreement reported as an
  exact fraction N/D over its block:creek evenings, with
  D stated, AND D >= 1 (a band with refusals but 0
  block:creek evenings does NOT meet GO — see below).
  Agreement value itself is not thresholded.
- BAND-FOUND-GATE-2-STILL-UNTESTABLE (not GO, not HELD-
  by-absence, not killed): a cell meets (b) but its band
  has D = 0 block:creek evenings (refusals exist, none at
  a creek). Reported with the numbers; gate 2 stays
  untested, and the next hunt's target is a creek-
  refusal band, not a refusal band in general.
- HELD (not GO, not killed): the bounded search space is
  exhausted (all 10 cells run, or the stop rule's (b))
  with no cell meeting (b). The arm is complete and
  gate 2 stays untested. The evidence must NOT call gate
  2 "failed".
- NO-GO: instrument gate fails on any judged leg, OR the
  travel-refused definition proves unmeasurable from the
  code (state which, with the code evidence), OR the
  control cell shows a travel-refused evening (instrument
  broken). A definition failure is reported, not patched
  around by redefining mid-run.

Secondary reported counts (every cell, never pooled
across cells in verdict counts): evenings judged by
outcome (already-inside / completed / out-of-reach /
travel-refused / blocked-combat / blocked-tent /
travel-arrived-combat / travel-died / game-over /
policy-no-record), refusals by hopReturnKind, refusals
by seed/day with evening map + haven distance, block:
creek evenings, bucket split (creek / other-refused /
unclassified, by source), store counters, errs,
game-overs, narration presence (see below).

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: hunt driver + analyzer + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs.
- JUDGED LEGS: stdout-runner transport (one JSON line
  per seed to stdout; stdout -> file in evidence/ in a
  foreground exec; idle splitter splits into per-seed
  files; jsonl deleted after split). Judged corpora are
  NEVER staged in /tmp, and judged legs NEVER write
  files from a game-loaded process.
- SENSE TEST (law): IF a band is found, read one refused
  evening's transcript/dayLines end to end and judge
  whether the refusal reads as a person turned back from
  home (quote the lines). IF no band is found, the sense
  section states that plainly instead of inventing one.
- NARRATION NOTE (brief item 6, counted not designed):
  for each refused evening (if any), record whether its
  dayLines contain the engine's block line for its
  blockType (creek: "The creek runs fast here — no
  crossing without a bridge or a swim."). Report the
  count. Wording decisions belong to the design owner;
  nothing about narration is landed here.
- EVIDENCE: evidence/2026-10-31/sim-refusedband-b.md —
  verdict judged against this prereg, search-space table
  with stacks/bands/horizons/seeds/evenings, gate-2
  numbers or the held statement, sense-read or its
  absence stated, metric review, village assessment in
  plain words, wall numbers as LAST MEASURED (full seat
  0 / wave 5 reached 0, Loop A lane) with the explicit
  note that this pre-seat census does not re-measure the
  wall — census numbers are never presented as wall
  numbers.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel /
woodcarry / woodwarm / trigger-day stacks, a 30/60-day
per-evening refusal census, or a census with no variant
— the same declaration buckettile made. The comparison
here is a census across cells on identical seeds through
the census analyzers, never labeled a panel comparison.
No panel result is fabricated; the panel tool is not
invoked on this corpus. No lever comparison arises (DIAG
only).

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
- Whether 'travel-arrived-combat' evenings (hop
  succeeded, fight live on arrival) should count as
  refusals: NO — the hop was not refused; the vessel
  arrived. They are reported in their own outcome column.
- Whether the morning snap (after upkeep) undercounts
  refusal nights that end in the sleep/upkeep window:
  carried from buckettile/strandred metric review; the
  analyzer judges from evening rows (post-daily, pre-
  sleep), not morning snaps, so the window does not
  apply to refusal counts here.
- Whether bucket and tile criteria should ever be merged:
  NO — carried from buckettile; this arm keeps refusal
  counts, bucket counts, and tile counts in separate
  columns throughout.
