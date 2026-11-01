# sim-refusedband-b — DIAG: travel-refused band hunt HELD (no band met the bar; gate 2 stays untested as a band measurement)

Run: oversight-flesh-out-loop-b, arm sim-refusedband-b, run
fleshout-loop-b-20261031T2343Z, axis food-economy (tracker
next blank (4): "gate-2 test on a travel-refused band").
Worktree sim-refusedband-b, branch sim-refusedband-b.
Base commit 24bf27d80 (worktree HEAD at prereg writing
time — the batch ship's version bump on top of
journey-deepening r77 and Loop A's 2156 round). DIAG ONLY
(measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing
script. New files only. This worker does NOT push, bump,
verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending
coordinator merge.

## Verdict: HELD — judged exactly against the prereg bars

The binding prereg (evidence/2026-10-31/
sim-refusedband-b-prereg.md, commit d51826c63, written
BEFORE any judged leg) set GO as ALL of: (a) instrument
gate clean on every judged leg; (b) a found band — ONE
cell (one stack x one seed band x one horizon) with >= 5
travel-refused evenings on >= 2 seeds; (c) gate 2 measured
on that band with agreement reported as an exact fraction
N/D over its block:creek evenings, with D >= 1.

What the hunt found: travel-refused evenings DO exist on
current master — 37 of them across 2,855 judged evenings —
but every one sits on a SINGLE seed (17606), so NO cell
meets (b). The bounded search space (all 10 prereg cells)
is exhausted without a band. The verdict is therefore
HELD: gate 2 remains untested as a band measurement, not
failed. The evidence must not call gate 2 "failed" — and
it does not: the single-seed refusal runs below show the
probe agreeing every time, which is a lead for the next
hunt, not a verdict.

The one qualification, stated plainly rather than hidden:
cell P1 60d F2's census gate flag reads false on one leg
(17518, village-lost day 35). The instrument is NOT
broken — see "Instrument gate" below: the leg is complete
(35/35, errs 0) and the run ended by a recorded engine
ending (Game.over true, villageLost true); only the
analyzer's evening-row gameOver flag misses overs that
land in the sleep step. The cell's evenings are judged,
its refusal count is 0 with or without that leg, and the
verdict does not hinge on it. The predicate gap is filed
under metric review for the next run.

## THE HUNT (judged) — 10 cells, 80 legs, 2,855 evenings

Travel-refused evening = eveningOutcome ===
'travel-refused' (nighttravel.js nightStep: haven offered
AND one honest Game.travelTo hop attempted AND post-hop
position not haven). 'out-of-reach' is NO attempt and
never counts. Gate-2 agreement = N/D where D = refusals
with hopReturnKind 'block:creek' and N = those with
bucket 'creek' (creekremedy-diag classifyRefusedEvening +
bucketOf: hop says creek AND probe agrees AND no probe
error). Classification source per evening: woodcarry
_ctx._wcLast on P1, creekremedy _creekremedyLast on the
other hunt stacks (same pure functions).

Per-cell table (ev = evenings judged; ref = travel-refused
evenings; refSeeds = seeds carrying refusals; D =
block:creek denominator; gate2 = N/D):

| cell (stack x band x horizon) | ev | ref | refSeeds | D | gate2 | gate |
|---|---|---|---|---|---|---|
| CONTROL deed-seeking 30d G1 | 240 | 0 | — | 0 | — | pass |
| BARE 30d G1 | 240 | 9 | 17606 | 9 | 9/9 | pass |
| BARE 30d G2 | 240 | 0 | — | 0 | — | pass |
| STRANDFIX 30d G1 | 240 | 9 | 17606 | 9 | 9/9 | pass |
| WAITSALIGN 30d G1 | 240 | 9 | 17606 | 9 | 9/9 | pass |
| SELECTTRIM 30d G1 | 240 | 9 | 17606 | 9 | 9/9 | pass |
| P1 30d G1 | 240 | 1 | 17606 | 1 | 1/1 | pass |
| P1 30d G2 | 240 | 0 | — | 0 | — | pass |
| P1 60d F2 | 455 | 0 | — | 0 | — | flag* |
| P1 60d F1 | 480 | 0 | — | 0 | — | pass |
| TOTAL | 2855 | 37 | 17606 only | 37 | 37/37 pooled | — |

* P1 60d F2 gate flag: see "Instrument gate" — one leg's
predicate technicality, not a broken instrument, verdict
invariant to it.

Pooled numbers (reported for hunt completeness, NEVER a
band): 37 refusals, all hopReturnKind 'block:creek', all
bucket 'creek', probeAgrees true on all 37, probeError
null on all 37, narrated 37/37 (the engine's creek line
in that evening's dayLines). No refusal of any other
block type (no fallen_tree, rubble, washed_out) appears
anywhere in the 2,855 evenings. No cell pools into a band:
the prereg forbids cross-cell pooling, and even pooled,
the refusals sit on one seed.

## THE SINGLE-SEED FINDING (a lead, NOT a band, NOT a GO)

Seed 17606 is the only refusal seed in the entire search,
and it refuses identically on all four no-rescue stacks:
BARE, STRANDFIX, WAITSALIGN, SELECTTRIM each show the
same 9 evenings (days 4, 5, 6, 7, 8, 9, 13, 14, 15) —
the trigger wrappers never change this trajectory, so the
refusal run is a property of the competent daytime path
plus the single-hop night step, not of the trigger
wrappers. The geometry, from the corpus:

- Days 1-3 at haven. Day 4 the vessel forages out to
  meadow (3,3), two tiles Manhattan from haven (4,4),
  and the night hop home refuses at intermediate creek
  tile (4,3) (blockedTile (4,3), leg 'intermediate').
  A route-around EXISTS (length 2 via (3,4)) — but the
  night step takes one direct hop only (detour gate off),
  so it refuses anyway.
- Days 5-9: same meadow camp, same refusal nightly. The
  vessel does not wander off — with no rescue, it simply
  stays and re-attempts.
- Days 10-12, 16-18: forest_floor (2,2), 'out-of-reach'
  (distance 4 > 3, haven not offered) — she wanders
  further out, then comes back to the meadow camp.
- Days 13-15: meadow camp again, refusal again.
- Day 19 onward: at haven, 'completed' — she walks home
  in daytime (daytime walking takes path steps around
  the creek; only the single night hop refuses).

On P1 (with bridge rescue), the same seed refuses only
ONCE — day 4 — because woodcarry's evening bridge
attempt succeeds that night (wood 4, kcal 2232, 111
ticks to day-end >= 96, blocked tile needsBridge true,
unbridged): bridge built, retry hop arrives, vessel
rescued to haven, and the trajectory diverges — days
5-9 and 13-15 never refuse. P1's rescue is why the
buckettile bands showed 0 refusals: on a rescue stack,
a creek refusal is a one-night event, not a run. The
next hunt's missing piece is a SECOND refusal seed, not
a better classifier: 17606 proves the mechanism and the
probe (agreement 9/9 per no-rescue cell, 1/1 on P1),
but one seed cannot carry a band bar.

Why other bands show nothing: on P1 F1/F2 at 60d, and on
G2 everywhere, vessels end their days either at haven
('completed', the large majority) or too far out for
haven to be offered ('out-of-reach') — the refusal
window (ends the day within distance 3 of haven, across
an unbridged creek, without a swimmer) is narrow, and
only 17606's path threads it. Longer horizons did not
help: 60d on the buckettile bands adds 935 evenings and
0 refusals (plus one village-lost ending, below).

## Instrument gate (per-leg, prereg §9)

Every leg: errs 0, decisions == evenings in count. Every
cell passes except the P1 60d F2 flag on 17518, explained
here rather than smoothed over:

- 17518 (P1 60d F2): 35 decisions, 35 evenings, errs 0 —
  but the analyzer's `complete` predicate (daysAlive ===
  days OR an evening row with gameOver true) fails it,
  because Game.over lands in the sleep step AFTER the
  evening snap: the day-35 evening row still reads
  gameOver false, while the harness stop record shows
  engineOver true, villageLost true, endReason
  'village-lost', gameDay recorded. The leg is complete
  and honest (a village that died out on day 35, not a
  truncation or crash); the predicate is narrower than
  the harness's end semantics. The census gatePass flag
  for this cell is left as computed (false) and NOT
  rewritten; the evidence judges the cell's 455 evenings
  (0 refusals) with this leg included, and notes the
  count is 0 either way. Next run's predicate should
  accept any recorded harness endReason other than
  'survived' (see metric review).
- All other 79 legs pass the gate as written. The
  control cell behaved exactly as predicted (240/240
  'policy-no-record', 0 refusals): the driver does not
  invent refusals where no walk-home step exists.

## SENSE TEST (law) — single-seed read, labeled as such

No band was found, so there is no band sense test to
report — that absence is stated plainly, per the brief.
What follows is a read of a single-seed refusal evening
(17606, BARE G1, day 4), offered as texture for the next
hunt, not as band evidence:

- The day reads as a person foraging outward until home
  stops being crossable: forest floor, an owl, fire
  gossip, a worked-out patch, then "Travel 1 tile to
  meadow", head-high grass, unknown berries pocketed
  unnamed, and the creek line twice at the day's end:
  "The creek runs fast here — no crossing without a
  bridge or a swim." The refusal IS narrated — twice,
  in fact (the second line's source is not separated in
  the dayLines; it may be a daytime trip-home attempt
  plus the night hop, both honestly refused at the same
  creek). Nothing in the transcript contradicts the
  census: no line claims she crossed, no line claims
  she chose to camp, and the following days show her
  still at the meadow, still refused, until daytime
  walking carries her around the creek on day 19.
- Texture notes carried, not hidden (same class as
  buckettile's): "You catch fragments by the fire"
  gossip lines fire while she is out at the meadow
  (whose fire, out there?); the double creek line on day
  4 is honest but redundant — a reader sees the same
  refusal twice with no distinction between the
  attempts. Neither contradicts the census — positions,
  outcomes, and day transcripts agree.
- The refusal reads as a person turned back from home:
  she ends the day two tiles from the palisade with a
  creek between, tries the direct way, and is told why
  it fails. What it does NOT read as is a decision to
  stay — she never chooses the meadow; the hop refuses
  her. That distinction (refused vs chose) is exactly
  what the bucket measures, and this transcript honors
  it.

## Narration note (counted, not designed — brief item 6)

Refused evenings narrated anywhere: 37/37 (every
refusal's dayLines contain the engine's block line for
its blockType, all 'creek' here). The wording question
— whether the double line on 17606 day 4 should be
deduplicated, and whether a refused evening should say
more than the block line — belongs to the design owner.
Nothing about narration is landed here.

## Reachability verdict

Travel-refused evenings ARE reachable on current master
— 37 of them, all at a creek, all on one seed — but a
travel-refused BAND (the prereg's unit: >= 5 refusals on
>= 2 seeds in one cell) is NOT reached by this search.
Gate 2 (block:creek + probe agreement) is therefore
still untested AS A BAND MEASUREMENT, even though its
single-seed numbers are perfect (37/37 agreement, 0
probe errors, 0 disagreements). Any future gate-2 claim
must either find a second refusal seed or explicitly
re-scope the bar — this arm does not re-scope it
mid-run, and does not present the single-seed 37/37 as a
band result.

## Village assessment, in plain words

Picture the scholar on 17606. She walks out on day 4 to a
meadow two tiles from home, gathers berries she cannot
yet name, and when evening comes she tries the short way
back — and the creek says no. Not once, but night after
night: six nights at the meadow, a wander further out
where home stops being offered at all, three more nights
back at the meadow being refused again, and then, on day
19, she simply walks home in daylight around the creek
the night hop could never cross. The night step only
knows one jump, straight home; the daytime walk knows
the path around. On the stack with a bridge in her pack,
that first refusal is also the last — she lashes four
logs across the gap the same night and walks home over
her own bridge. So the village has two honest stories
about the same creek: without rescue, a week and a half
of refused nights; with it, one refused night and a
bridge. What the village does NOT have, anywhere in
2,855 evenings across ten cells, is a second seed that
lives this story — 17606 stands alone, and a band needs
company. The next hunt does not need a better probe.
It needs another villager, on another seed, ending her
day two tiles from home with a creek between.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported, never
fabricated. As LAST MEASURED (Loop A lane): full seat 0
/ wave 5 reached 0. This census does not re-measure the
wall: it measures refusal evenings, not wave
progression, national reach, or the table. Observed
survival on judged legs: 79 of 80 legs survived their
window; one leg (P1 60d F2, seed 17518) ended day 35 by
village-lost (Game.over, villageLost true). National 0,
table 0, wins 0 in this census are structural (a
pre-seat refusal census cannot reach them), not wall
measurements; maxWaveUnlocked per leg is in the corpora,
not summarized as reach.

## Blanks filled or documented

- Documented (this arm, measured): TRAVEL-REFUSED
  EVENINGS EXIST on current master — 37 in 2,855
  evenings, all block:creek, all bucket 'creek', all
  probe-agreeing, all narrated — but only on seed 17606.
  The "no refusals anywhere" picture from buckettile
  (P1 F1/F2, 480 evenings) does not generalize: fresh
  bands + no-rescue stacks find them.
- Documented (this arm, measured): P1's bridge rescue
  collapses a refusal RUN to a single evening (17606:
  9 refusals on bare stacks, 1 on P1, with the bridge
  built and the retry arrived on day 4). A rescue stack
  is the wrong place to hunt for refusal bands.
- Documented (this arm, measured): the four no-rescue
  stacks agree EXACTLY on G1 (same seed, same 9 days) —
  trigger wrappers (strandfix/waitsalign/selecttrim)
  do not change refusal geometry on this band; the
  refusal run is a competent-trajectory property.
- Documented (this arm, measured): 60d horizons on the
  buckettile bands add 0 refusals (935 evenings) — the
  refusal window is a path property, not a horizon
  property. Longer windows do not find bands.
- HELD (this arm, per prereg): NO BAND met the bar
  (>= 5 refusals on >= 2 seeds in one cell). Gate 2
  stays untested as a band measurement. The next hunt's
  target is a second refusal seed — fresh bands on the
  BARE stack (the stack that preserves refusal runs)
  are the named next cells, not bigger samples of P1.
- NOT re-scoped (this arm, stated): the single-seed
  37/37 agreement is NOT presented as a band result and
  does NOT meet GO. Any future arm that wants to claim
  gate 2 from single-seed runs must re-scope the bar in
  ITS prereg, before its legs — not by re-reading this
  evidence.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bar (instrument clean + band >= 5 on >= 2
  seeds + gate-2 fraction with D >= 1): NOT MET, on the
  band leg (b) only. No metric was re-scored mid-run:
  the single-seed 37/37 was not promoted to a band, the
  P1 60d F2 gate flag was not rewritten, and no cell
  was pooled into a band. The grid ran exactly as
  declared (10 cells in order; the stop rule's (b) —
  all cells run — is what ended the search, since no
  cell met the bar).
- Instrument-gate predicate gap (found this run, filed
  for the NEXT run): the gate's `complete` predicate
  accepts loop-days-complete OR an evening row with
  gameOver true, but Game.over can land in the sleep
  step after the evening snap (17518: village-lost day
  35, stop record engineOver true, evening row gameOver
  false). Next run's predicate should accept any
  recorded harness endReason other than 'survived'
  (village-lost / over-other), in addition to the
  evening-row flag. This run judged the leg on its
  merits (35/35, errs 0, end recorded) and left the
  computed flag untouched — the gap is documented, not
  papered over.
- Agreement threshold question (carried from prereg):
  gate-2 agreement was reported, not thresholded, per
  the prereg. The measured single-seed agreement is
  37/37; whether a future band GO should ALSO require
  an agreement value (e.g. >= 80%) is a question for
  that run's prereg, now with a concrete prior (a probe
  that agreed 37/37 on one seed).
- Whether 'travel-arrived-combat' should count as a
  refusal: NO — carried; none appeared in the hunt
  cells' refusal columns (it appears nowhere in the
  outcome totals except as its own outcome where
  present — 0 here; 'walk-interrupted-combat' on P1
  60d F1 is a different daytime outcome, not an evening
  refusal).
- Whether bucket and tile criteria should ever be merged:
  NO — carried from buckettile; this arm keeps refusal
  counts, bucket counts, and tile counts separate
  throughout (tile counts are not re-derived here —
  this arm's unit is the refusal, and no creek-tile
  claim is made from these corpora).

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel /
woodcarry / woodwarm / trigger-day stacks, a 30/60-day
per-evening refusal census, or a census with no variant
— the same declaration buckettile made. The comparison
here is a census across cells on identical seeds through
the census analyzers, never labeled a panel comparison.
No panel result is fabricated; the panel tool was not
invoked on this corpus. No lever comparison arose (DIAG
only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-refusedband-b-census-bare-g1.json --metrics
national,table,wins,exiled` prints LOUD "national/table/
wins disappeared: baseline 12/16/16 -> current 0 (n=1
files)". Investigated as a missing-field artifact, same
class as buckettile's round: this census carries no
national/table/wins/exiled fields at all (keys: corpusDir,
policy, horizonDays, legs, seeds, eveningsJudged,
outcomeTotals, totalRefusals, ...) — the check ingests a
census file where the baseline expects per-seed sweep
rows, so 0 means "field absent", not "wall moved". No
genuine LOUD signal. Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. No EPERM flap observed in this window: all stdout
   transports split first-try, all splitter writes
   landed first-try, heartbeats landed (worktree
   sim-refusedband-b). The stdout transport rule was
   followed throughout (judged legs never wrote from a
   game-loaded process; judged corpora never staged in
   /tmp — jsonl lived in evidence/ until split, then
   deleted; no .jsonl leftovers at evidence time).
2. No safe-commit index clobber on this arm's three
   commits (prereg, instruments, evidence — verified by
   commit stat at each step; the coordinator should
   still verify the same way after the final commit).
3. Diff guard at evidence time: `git diff --name-only
   24bf27d80 -- src/ scripts/policies/` is EMPTY — no
   game code, no policy file moved under measurement
   (to be re-verified by the coordinator at merge; the
   claim here is the worktree state at evidence writing).
4. Leg timing (for the next hunt's planning): 30d cells
   ~45-100s for 8 legs; 60d cells ~90s for 8 legs.
   BARE-stack fresh bands are the cheap next hunt.

## Proof

scripts/test-refusedband-b.js: pure 39/39 (refusal
counting incl. every non-refusal outcome, hop parsing,
bucket sources woodcarry-first/creekremedy-fallback,
gate-2 fraction incl. D=0, instrument-gate cases incl.
early game-over, narration detection, band bar, control
cell). Corpus checks: 79/80 legs pass the instrument
gate as written; the 80th (17518) is complete on its
merits with the predicate gap documented above, not
hidden. Control cell: 240/240 policy-no-record, 0
refusals, as predicted. Drift note: P1 60d F2/F1 are new
horizons on the buckettile bands, not re-derivations of
its 30d cells — no 30d P1 count is re-claimed here.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-refusedband-b-prereg.md
  (commit d51826c63)
- Evidence (this file): evidence/2026-10-31/sim-refusedband-b.md
- Instruments: scripts/refusedband-trace-b.js,
  scripts/analyze-refusedband-b.js,
  scripts/test-refusedband-b.js (instruments commit
  a949bafa7; absencehunt splitter reused verbatim from
  the base)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-refusedband-b-corpus-control,
  sim-refusedband-b-corpus-bare-g1,
  sim-refusedband-b-corpus-bare-g2,
  sim-refusedband-b-corpus-strandfix-g1,
  sim-refusedband-b-corpus-waitsalign-g1,
  sim-refusedband-b-corpus-selecttrim-g1,
  sim-refusedband-b-corpus-p1-g1,
  sim-refusedband-b-corpus-p1-g2,
  sim-refusedband-b-corpus-p1-f2-60d,
  sim-refusedband-b-corpus-p1-f1-60d
- Censuses (analyzer output, one per corpus):
  evidence/2026-10-31/sim-refusedband-b-census-control.json,
  sim-refusedband-b-census-bare-g1.json,
  sim-refusedband-b-census-bare-g2.json,
  sim-refusedband-b-census-strandfix-g1.json,
  sim-refusedband-b-census-waitsalign-g1.json,
  sim-refusedband-b-census-selecttrim-g1.json,
  sim-refusedband-b-census-p1-g1.json,
  sim-refusedband-b-census-p1-g2.json,
  sim-refusedband-b-census-p1-f2-60d.json,
  sim-refusedband-b-census-p1-f1-60d.json
- No compare .md exists (no paired lever comparison — this
  is a DIAG census, never labeled a panel comparison).
