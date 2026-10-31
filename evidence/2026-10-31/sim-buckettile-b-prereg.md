# sim-buckettile-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-buckettile-b, run
fleshout-loop-b-20261031T2230Z, axis food-economy (bucket-vs-tile
divergence, finding #1659). Worktree sim-buckettile-b, branch
sim-buckettile-b. DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing policy file
or existing script. New files only (this prereg, a bucket-vs-tile
analyzer, its pure proof test, evidence, corpora, censuses). This
worker does NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across the
map; ~35% of creek tiles need a bridge or a swimmer — a creek
tile is a place, not a bucket class). No canon doc covers a
creek-evening strand criterion — stated here instead of
inventing canon, as strandred stated. Standing rules that bear
on it: perception law (Steve 2026-10-28: decisions from what
the villager senses) and "no silent actions" (the sense test
reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-strandred-b.md + prereg (DIAG-GO,
  base b26777c16): creek-TILE substrate is live — 61 creek-tile
  evenings on P3 F1 30d — while the woodcarry-BUCKET criterion
  reads 0 raw / 0 haven-checked on all 16 P1 legs. Witness
  seed: P1 F2 17513 sleeps 6 nights at the creek (days 5-10,
  opening night genuine-class) on the woodcarry stack
  (withWoodwarm(withWoodcarry(nighttravel)), WOODWARM=1) and
  the bucket never says creek.
- evidence/2026-10-31/sim-absencehunt-b.md + prereg (the
  driver/analyzer reused verbatim here:
  scripts/absencehunt-trace-b.js,
  scripts/analyze-absencehunt-b.js,
  scripts/split-absencehunt-jsonl-b.js).
- hidden_files/sim-findings.md #1659 (this arm's question,
  quoted in full in the brief) — and #1658 was NOT found in
  that file at prereg writing time (grep for "1658" returns
  nothing in the goal workspace copy); the sibling arm's
  question is therefore not answered, not pooled, and not
  re-filed here. If #1658 appears later it belongs to its
  own arm, not this one.

## Base commit (pinned)

Base commit for every leg in this arm: c9ac9183c493cc79fe1ee77c2f35cb339bc299b4
(worktree HEAD at prereg writing time). It is a descendant of
strandred's base b26777c16; `git diff --stat b26777c16..HEAD
-- src/js` is EMPTY (the intervening commits are DIAG evidence,
instruments, and coordinator evidence only — no game code
moved). This census is a fresh measurement on THIS base, never
a reuse of strandred corpora as judged evidence: the strandred
17513 corpus was read during DESIGN only (to form the code
hypothesis below), and every judged number below comes from
legs run under this prereg.

## The question (#1659)

WHY does the woodcarry bucket never classify the P1 creek
nights as creek? Trace the bucket classification in code, then
prove the mechanism with an instrumented corpus: for each
creek-tile evening on the P1 band, record the bucket value AND
the inputs the classification reads, and name the exact
condition that fails — or the definitional gap, if the bucket
is correct under its own definition and the divergence is
definitional, not a bug.

## Code hypothesis (design-time trace, to be proved or refuted by the corpus)

Read in full before designing (not judged evidence — the
corpus below is):

1. scripts/policies/woodcarry.js, withWoodcarry evening block:
   classification runs ONLY when `ctx._ntLast.outcome ===
   'travel-refused'`. On every other evening `ctx._wcLast`
   stays null (it is reset to null at the start of each
   daily), so the absencehunt analyzer's rawCreek
   (`wc.bucket === 'creek'`) is false by absence, not by a
   creek verdict. The store counter `records` is incremented
   only inside that same gate.
2. scripts/policies/nighttravel.js, nightStep: an away vessel
   first checks whether haven is among `Game.travelTargets()`.
   If not offered, outcome is 'out-of-reach' and the function
   returns BEFORE any `Game.travelTo` hop — so there is no
   hopReturnKind, no block object, and nothing for a
   classifier to classify.
3. src/js/game.js, travelTargets(): offers revealed tiles at
   Manhattan distance <= 3 (or adjacent unrevealed). A creek
   camp 6 tiles from haven (17513's creek at map (1,1)
   against haven (4,4) in the strandred design corpus) can
   therefore never be "offered" home, so its evenings are
   'out-of-reach' by construction.
4. scripts/policies/creekremedy-diag.js, classifyRefusedEvening
   + bucketOf: even on a refused evening, bucket 'creek'
   requires isCreek = hop type 'creek' AND probe agreement
   (directHopBlockage blockType === 'creek') AND no probe
   error. A refused evening with no creek hop is
   'other-refused'; a creek hop that fails probe agreement
   is 'unclassified'. These are the SECOND gate — reached
   only if gate 1 fires at all.

Hypothesis to prove: on 17513's creek nights the failing
condition is gate 1 (nighttravel outcome 'out-of-reach', not
'travel-refused'), so woodcarry classification is never
invoked, bucket stays null, and the divergence is
DEFINITIONAL: the bucket classifies refused homeward hops,
not sleeping places. The corpus must show, per creek-tile
evening, the outcome + bucket + classification inputs — a
hypothesis confirmed only by the corpus counts, never by this
code read alone. If the corpus instead shows travel-refused
creek evenings with bucket 'other-refused'/'unclassified',
the failing condition is gate 2 and the verdict names its
exact field (blockType / probeAgrees / probeError /
hopReturnKind) instead.

## Creek-tile evening + bucket record (defined here, in one place)

Per loop-day from the absencehunt driver (morning snap at the
START of that day's daily() call, evening snap after daily(),
before the harness's sleep). atHaven is the absencehunt
haven-checked definition (insideHaven true OR tile 'haven' OR
map position equals the village (px, py) node). Absencehunt
class labels are reused unchanged.

- CREEK-TILE evening: evening snap tile 'creek' AND NOT
  atHaven AND NOT onRoad (roadActive/roadOnRoad false).
  Same definition as strandred.
- BUCKET RECORD for that evening (from the same evening row's
  `woodcarry` field, i.e. ctx._wcLast): bucket value
  ('creek' / 'other-refused' / 'unclassified' / null =
  classification never ran), eveningOutcome (nt outcome),
  and, when a classification exists, its inputs: hopReturnKind,
  classification.blockType, classification.probeAgrees,
  classification.probeError, classification.isCreek,
  blockedTile, and the bridge record. When bucket is null,
  the analyzer ALSO records the reason the gate did not fire
  as observed in the corpus: eveningOutcome (expected
  'out-of-reach' on creek nights) — the analyzer does not
  invent a reason beyond the recorded outcome.
- A creek-tile evening is "bucket-explained" when its bucket
  record + outcome together name the gate that decided it:
  null bucket + 'out-of-reach' outcome (gate 1), or a
  non-creek bucket with its classification inputs (gate 2).
  An evening with a creek tile, a null bucket, and an outcome
  OTHER than 'out-of-reach' is UNEXPLAINED and breaks the
  hypothesis — it must be reported as such, never folded
  into the gate-1 count.

What this arm does NOT claim: a bucket verdict is not a
sleeping-place verdict. If the corpus confirms gate 1, the
finding is that the two criteria measure different things
(a refused hop vs a slept place) and must never be merged
into one "creek evening" count — the same separation rule
strandred applied, now with the mechanism named.

## Policies (existing files only, no edits, no default flips)

- P1 nighttravel-stack ONLY (the only stack on which the
  bucket criterion is observable): withWoodwarm(withWoodcarry
  (nighttravel)), WOODWARM=1, WOODCARRY=1. No P3 legs: P3 runs
  no woodcarry wrapper, so no bucket record exists for it,
  and tile counts are NEVER cited as bucket counts.

Substrate env asserted FATAL in the driver for ALL legs:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0,
WOODCARRY=1, WOODWARM=1. Instruments are the absencehunt
driver/analyzer/splitter verbatim; the ONLY new instrument is
scripts/analyze-buckettile-b.js, which reads the same per-seed
corpora and adds the per-evening bucket record above without
redefining any absencehunt class or any strandred definition.
Its pure proof test (scripts/test-buckettile-b.js) must pass
before any judged leg runs.

## Search grid (declared fully, run exactly)

Seed bands (the absencehunt bands, reused deliberately):

- Band F2: 17511, 17512, 17513, 17514, 17515, 17516, 17517, 17518
- Band F1: 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508

PILOT (8 seeds before any confirm spend, MEASUREMENT §9):
P1 F2 x 30d = 8 legs. INSTRUMENT GATE before any confirm:
every leg errs 0, decisions == evenings in count, loop-days
complete or a game-over with its day recorded. If the gate
fails, STOP and report — no confirm spend on a broken
instrument.

CONFIRM (only on a pilot GO, MEASUREMENT §9 Stage 2):
P1 F1 x 30d = 8 legs (same stack, fresh band — tests whether
the gate-1/gate-2 split generalizes beyond F2). Confirm total
8 legs. No judged band is ever below 8 seeds. No other judged
legs are run; the 17513 deep trace is a READING of the pilot's
own 17513 leg (sense test below), not extra sims.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d tail
max is the harness's own end handling). Never a fixed 200d.

## Primary metric + verdict bar (judged exactly as written)

Primary metric: number of pilot (P1 F2 30d) creek-tile
evenings that are bucket-explained, split by gate, plus the
count of unexplained creek-tile evenings.

GO BAR (pre-registered exactly): the mechanism is named with
file + function + condition AND reproduced on >= 1 named
creek night in the pilot corpus — i.e. at least one pilot
creek-tile evening whose recorded bucket + outcome exhibit
the named condition (gate 1: null bucket + 'out-of-reach'
outcome on a named seed/day; or gate 2: a non-creek bucket
with its failing classification field on a named seed/day),
with ZERO unexplained creek-tile evenings in the pilot.
- GO: verdict = MECHANISM ISOLATED. The evidence names the
  file, function, and exact condition, the reproducing
  seed/day(s), and states whether the mechanism is a BUG
  (classification invoked but failing — gate 2) or
  DEFINITIONAL (classification never invoked because the
  bucket's own gate does not fire on these evenings —
  gate 1). A definitional GO is still a GO on the question
  asked (#1659 asks WHY, and the why is the gate) — but it
  authorizes NO src/js fix and NO criterion merge: the
  bucket is correct under its own definition, and the
  divergence is definitional. The evidence must say that
  sentence explicitly when gate 1 is the finding, so no
  reader mistakes a definitional GO for a bug found.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = MECHANISM NOT ISOLATED. This
  covers: no named condition reproduced on any pilot creek
  night; any unexplained creek-tile evening in the pilot
  (a creek night whose bucket + outcome name no gate);
  a definitional claim made WITHOUT the exact gate
  condition and corpus reproduction; or a gate-1 claim
  contradicted by travel-refused creek evenings in the
  pilot that the evidence does not separately explain.
  On NO-GO there is NO confirm spend, and the bucket
  question stays open (it is not re-filed as #1659 — that
  item is this arm's question, answered only by a GO or
  left open by a NO-GO).

Secondary reported counts (every leg, never pooled across
bands in verdict counts): creek-tile evenings, bucket-explained
split (gate 1 / gate 2-creek / gate 2-other / gate
2-unclassified), unexplained creek-tile evenings, raw +
haven-checked bucket creek evenings (absencehunt definitions,
for drift comparison vs strandred's 0), genuine overnight
absences (absencehunt primary, for drift comparison),
store counters (records/classified/unclassified/otherRefused),
errs, game-overs.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: buckettile analyzer + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs.
- JUDGED LEGS: stdout-runner transport (sim prints one
  JSON line per seed to stdout; stdout -> file in
  evidence/ in a foreground exec; idle splitter splits
  into per-seed files; jsonl deleted after split).
  Judged corpora are NEVER staged in /tmp, and judged
  legs NEVER write files from a game-loaded process.
- SENSE TEST (law): read at least one 17513 creek night
  end to end from the PILOT corpus (departure day 5,
  creek nights 5-10, following morning day 11): transcripts,
  dialogue, meaning/coherence. Judge whether the bucket's
  verdict (no verdict — classification never ran) or the
  tile's verdict (slept at the creek) matches what the
  villager lived. A night that reads as camping away, with
  no homeward hop attempted or refused, is a PASS for the
  definitional reading; a night that reads as a refused
  creek crossing would contradict gate 1 and must be
  reported as contradicting evidence, not smoothed over.
- EVIDENCE: evidence/2026-10-31/sim-buckettile-b.md —
  mechanism (or definitional gap) with file/function/
  condition, per-seed tile-vs-bucket table, GO/NO-GO
  verdict exactly as judged, wall numbers ONLY if the
  corpus measures them (otherwise 'not measured by this
  census'), metric review, §15 declaration.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
stack, a 30-day per-evening bucket-vs-tile census, or a
census with no variant — the same declaration strandred made.
The comparison here is a census across bands on identical
seeds through the census analyzers, never labeled a panel
comparison. No panel result is fabricated; the panel tool is
not invoked on this corpus. No lever comparison arises (DIAG
only).

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether "bucket-explained" should also require the
  travelTargets distance to be recorded: NO under this
  prereg — the corpus evening row carries no _ntLast
  distance field (only eveningOutcome), so the analyzer
  judges from outcome + bucket + classification inputs as
  recorded. The distance reading (creek (1,1) vs haven
  (4,4) = 6 > 3) is code-level corroboration from the
  design corpus, cited as such, never as a judged count.
- Whether a creek-tile evening on a travel-refused night
  with bucket 'creek' would count as bucket-explained:
  YES (gate 2-creek) — but strandred shows 0 such evenings
  on all 16 P1 legs, so none is expected; any that appears
  is reported in its own column, never pooled into gate 1.
- Whether the morning snap (after upkeep) undercounts creek
  nights that end in the sleep/upkeep window: carried from
  strandred/absencehunt metric review; on P1 the
  unexplained-morning diagnostic sizes the gap here too,
  reported separately from the bucket verdict.
- Whether bucket and tile criteria should ever be merged
  into one "creek evening" count: NO — they are different
  claims (a refused hop vs a slept place) and this arm
  keeps them in separate columns throughout, whichever
  gate wins.
