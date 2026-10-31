# sim-buckettile-b — DIAG: bucket-vs-tile divergence mechanism ISOLATED (GO, definitional)

Run: oversight-flesh-out-loop-b, arm sim-buckettile-b, run
fleshout-loop-b-20261031T2230Z, axis food-economy (finding
#1659). Worktree sim-buckettile-b, branch sim-buckettile-b.
Base commit c9ac9183c493cc79fe1ee77c2f35cb339bc299b4 (worktree
HEAD at prereg writing time; descendant of strandred's base
b26777c16, `git diff --stat b26777c16..HEAD -- src/js` EMPTY).
DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy file
or existing script. New files only. This worker does NOT push,
bump, verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Verdict: GO (definitional) — judged exactly against the prereg bar

The binding prereg (evidence/2026-10-31/sim-buckettile-b-prereg.md,
commit 247250ae6, written BEFORE any judged leg) set the bar at:
the mechanism named with file + function + condition AND
reproduced on >= 1 named creek night in the pilot corpus, with
ZERO unexplained creek-tile evenings in the pilot. A
definitional GO is still a GO on the question asked (#1659 asks
WHY, and the why is the gate) — but it authorizes NO src/js
fix and NO criterion merge, and the evidence must say that
sentence explicitly. Here it is:

**The bucket is correct under its own definition, and the
divergence is definitional, not a bug. The bucket classifies
refused homeward hops; it does not classify sleeping places.
On the P1 creek nights no homeward hop is ever attempted or
refused, so there is nothing for the bucket to classify, and
its value is null by construction — not a failed creek
verdict.** No src/js fix follows from this arm, and the tile
and bucket criteria must never be merged into one "creek
evening" count.

Pilot result (P1 F2 30d, 8 legs): **7 creek-tile evenings, all
7 bucket-explained via gate 1, 0 unexplained** — reproducing
seed/day named: 17513 days 5, 6, 7, 8, 9, 10 (opening night day
5 genuine-class) and 17511 day 10, every one with bucket null
and eveningOutcome 'out-of-reach'. GO is met exactly, with no
re-scoring and no metric moved mid-run. The confirm ran as
declared (P1 F1 30d, 8 legs) and strengthens the verdict: 0
creek-tile evenings there (as strandred found), bucket 0
throughout, and — the stronger form of the same finding — 0
travel-refused evenings in ALL 480 judged evenings, so the
classification gate never fires on this stack on either band,
creek nights or not.

## THE MECHANISM (file + function + condition, in causal order)

1. **scripts/policies/nighttravel.js, nightStep()** — the
   gate that decides whether a homeward hop is even attempted.
   For an away vessel it computes
   `offered = Game.travelTargets().some(t => t.x === hx &&
   t.y === hy)` (haven node among the offered targets). If
   NOT offered, it sets `rec.outcome = 'out-of-reach'` and
   RETURNS — before any `Game.travelTo` call. There is no
   hopReturnKind, no block object, and no refusal record.
   The condition that fails is exactly this offer check:
   haven is not an offered target from a far creek camp.
2. **src/js/game.js, travelTargets()** — why the offer fails.
   It offers revealed tiles at Manhattan distance <= 3 (or
   adjacent unrevealed tiles). 17513's creek camp sits at map
   (1,1) against haven (4,4): distance 6, more than double
   the offer radius. A camp that far out can never be
   "offered" home at night step, so every one of its evenings
   is 'out-of-reach' by construction. (Caveat stated
   precisely: the corpus records the outcome, not the
   targets list — the distance reading is code-level
   corroboration from the snap positions, cited as such,
   never as a judged count.)
3. **scripts/policies/woodcarry.js, withWoodcarry() daily,
   evening block** — the gate that decides whether a bucket
   value exists at all. Classification runs ONLY when
   `ctx._ntLast.outcome === 'travel-refused'`. On every other
   evening `ctx._wcLast` stays null (it is reset to null at
   the start of each daily), and the store counter `records`
   is not incremented. The absencehunt analyzer's rawCreek
   (`wc.bucket === 'creek'`) is therefore false by ABSENCE
   of a record, not by a creek verdict.
4. **scripts/policies/creekremedy-diag.js,
   classifyRefusedEvening() + bucketOf()** — the second gate,
   never reached here. Even on a refused evening, bucket
   'creek' requires isCreek = hop type 'creek' AND probe
   agreement (directHopBlockage blockType === 'creek') AND no
   probe error; a creek hop failing agreement is
   'unclassified', a non-creek refusal 'other-refused'.
   On this arm's 480 evenings this gate is reached 0 times:
   store records/classified/unclassified/otherRefused are 0
   on all 16 legs.

So the exact condition that fails is NOT inside the creek
classifier — it is upstream of it: nighttravel's
travelTargets offer check fails (haven too far to be
offered), nightStep returns 'out-of-reach' before any hop,
and woodcarry's travel-refused gate therefore never fires.
There is no failing classification field to name (no
blockType, no probeAgrees, no probeError exists on these
nights) because no classification record exists. That absence
IS the mechanism, and it is definitional: the bucket's own
definition ("classify a refused homeward hop") has no input
on a night when no hop was attempted.

A misreading to close explicitly: the daytime lines "The
creek runs fast here — no crossing without a bridge or a
swim" (17513 days 5, 6, 10) are creek tiles blocking daytime
wandering steps, NOT homeward hop refusals. They do not feed
the bucket, and they must not be cited as bucket evidence in
either direction.

## THE CENSUS (judged) — 16 legs

Instrument gate: every leg errs 0, decisions == evenings in
count (30/30), loop-days complete (all 16 legs survived the
full window; no game-over). Gate passed on both cells, so the
confirm ran as declared. Horizons death-aware (harness stops
at Game.over). Evening-outcome distribution over all 480
judged evenings: already-inside 56, completed 402,
out-of-reach 21, blocked-combat 1, travel-refused 0. The zero
that matters most is the last one: the bucket's gate never
fires on this stack on either band.

Per-seed table — P1 F2 30d (pilot, judged for GO):
genAbs = genuine overnight absences (absencehunt primary);
crTile = creek-tile evenings; g1 = gate-1 evenings (null
bucket + 'out-of-reach'); unex = unexplained creek-tile
evenings; raw = raw bucket creek evenings; store rec =
woodcarry store records (classifications run).

| seed | genAbs | crTile | crDays | g1 | unex | raw | store rec |
|------|--------|--------|--------|----|------|-----|-----------|
| 17511 | 1 | 1 | 10 | 1 | 0 | 0 | 0 |
| 17512 | 0 | 0 | — | 0 | 0 | 0 | 0 |
| 17513 | 1 | 6 | 5,6,7,8,9,10 | 6 | 0 | 0 | 0 |
| 17514 | 0 | 0 | — | 0 | 0 | 0 | 0 |
| 17515 | 0 | 0 | — | 0 | 0 | 0 | 0 |
| 17516 | 0 | 0 | — | 0 | 0 | 0 | 0 |
| 17517 | 0 | 0 | — | 0 | 0 | 0 | 0 |
| 17518 | 0 | 0 | — | 0 | 0 | 0 | 0 |
| TOTAL | 2 | 7 | — | 7 | 0 | 0 | 0 |

17513 creek-evening detail (all map (1,1), all bucket null,
all outcome 'out-of-reach'): day 5 genuine, days 6-10
away-continuation. 17511's single creek evening (day 10,
creek (6,0), away-continuation) is the tail of a
forest_floor camp (days 8-13) — same gate, same null bucket.
Gate-2 columns are all zero on the pilot: gate2-creek 0,
gate2-other 0, gate2-unclassified 0. Pilot out-of-reach
evenings total 12: the 7 creek nights plus 5 forest_floor
nights (17511 days 8, 9, 11, 12, 13) — gate 1 is not
creek-specific; it is what every far-away evening looks
like on this stack.

Per-seed table — P1 F1 30d (confirm):

| seed | genAbs | crTile | g1 | unex | raw | store rec | note |
|------|--------|--------|----|------|-----|-----------|------|
| 17501-17506, 17508 | 0 | 0 | 0 | 0 | 0 | 0 | no creek nights |
| 17507 | 1 | 0 | 0 | 0 | 0 | 0 | genuine absence, forest_floor camp days 14-22 (9 out-of-reach evenings, all non-creek) |
| TOTAL | 1 | 0 | 0 | 0 | 0 | 0 | |

Confirm out-of-reach evenings total 9, all 17507's
forest_floor camp at (1,3). No unexplained evening exists
on either band: every away evening on these bands is either
out-of-reach (gate 1, bucket null) or at haven. No creek
night on either band carries a classification record of any
kind — the second gate is untested by this corpus, not
failed by it: a future arm that wants gate-2 evidence needs
a band where travel-refused evenings actually occur, which
neither P1 band on current master provides.

## Drift vs strandred (base b26777c16 -> c9ac9183c): ZERO on the compared cells

Every strandred P1 count re-derived here matches exactly,
seed for seed: P1 F2 30d genuine 2 (17511, 17513), creek-tile
7, bucket raw/checked 0; P1 F1 30d genuine 1 (17507 only),
creek-tile 0, bucket 0. The intervening landings between
b26777c16 and c9ac9183c did NOT move any P1 trajectory on
these bands. Strandred's tile counts and bucket-zero may be
quoted as current for P1 F1+F2.

## SENSE TEST (law) — PASS for the definitional reading

Read end to end from the pilot corpus: P1 17513 day 5
(departure), days 6 and 10 (creek nights), day 11 (return).
Judgement: the TILE's verdict matches what the villager
lived, and the bucket's non-verdict matches it too — because
no homeward hop was attempted or refused on any of these
nights.

- Day 5 reads as a person walking the creek line until home
  stops being reachable, exactly as strandred described:
  forest floor, glass-still water, crayfish, a kingfisher,
  Emberhold smoke on the horizon, the unbridged creek
  refusing twice in daytime wandering, a striped thing
  following her from tile to tile. The night itself IS
  narrated in the sleep step: "You camp wild tonight — no
  pantry meal. Eat from your pack." / "You settle into the
  cold ground. Sleep takes you." Day 6 dawns "You wake stiff
  and cold. (+5 health, energy restored... Exposed. You'll
  wake stiff.)" That is a night slept out, told as one.
- No line on any creek night attempts a homeward hop, refuses
  one, or names a blocked crossing homeward. The "no
  crossing" lines are daytime creek-tile movement, not a
  night-step refusal — the transcript contains no
  travel-refused beat for the bucket to classify. A bucket
  verdict of "creek" on these nights would have required a
  refused hop that never happened; its absence is the honest
  record, not a gap in it.
- Day 11 (return) confirms the shape: she walks home in
  ordinary daytime travel ("Travel 1 tile to Haven...
  Haven. 7 days. The palisade looks smaller than you
  remembered"), and the morning-carry line fires only once
  she is back at haven ("You take 4 logs from the woodpile
  for the road home. (50 left for the hearth.)") — wood is
  carried for a road already walked, not for a bridge that
  was never attempted. The while-you-were-gone beat (8
  things missed, Ivan mauled twice over, the sky splitting)
  reads as a village that lived without her, not a village
  that refused her.
- Texture notes carried, not hidden (same class as
  strandred's): "You catch fragments by the fire" gossip
  lines fire while camped at the creek on days 5, 6, 10
  (whose fire, out there?); the sleep step's "No watches
  tonight" line on day 6 sits oddly beside a solo camp.
  Neither contradicts the census — positions, outcomes,
  dawn lines, and day transcripts agree.

## Reachability verdict

Creek-tile nights ARE reached on the P1 stack (7 in the
pilot, all gate-1 explained). Woodcarry-bucket creek evenings
are NOT reached on any leg (0/16) — and this arm shows why
that zero is structural on these bands: the bucket's gate
never fires at all (0 travel-refused evenings in 480).
Any future strand arm that wants bucket-classified creek
nights must first find a band where travel-refused evenings
occur; on P1 F1/F2 the bucket criterion is empty by
construction, not by a classification failure. No wave-4/5
reach, no regional/national/table content is in scope of
this census, and none is claimed either way.

## Village assessment, in plain words

Picture the scholar on 17513. She walks out on day 5 along
the creek, past water cold enough to hurt her teeth and a
crossing she cannot make, and then she simply lives there:
six nights on cold ground, stiff dawns, berries she cannot
yet eat, something striped pacing her along the water. She
never once tries to walk home at night and gets refused —
home is just too far to be offered, six tiles away when the
game only offers three — so the night step shrugs, calls it
out of reach, and she sleeps where she stands. The bucket
that the old strand arms watched was never watching her
sleep. It was waiting for a very particular argument — a
walk home attempted and refused at a creek — and on this
whole stretch of country that argument never happens, not
once in 480 evenings. The vessel sleeps at the creek, and
the bucket says nothing, because nothing was asked of it.
The next strand arm does not need a better classifier. It
needs to decide which question it is asking: where did she
sleep (the tile, alive and full of campers), or what refused
her on the way home (the bucket, empty because nothing
refused her). Those are different questions, and only the
first one has an answer on this band.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported, never
fabricated. Observed survival on judged legs: 16 of 16 legs
survived their window. National 0, table 0, wins 0
(structurally unreachable in this band, not a wall
measurement); median survival is window-censored (all legs
survive the full window). Wave reach is not reported as a
wall number here because this census measures bucket-vs-tile
classification, not wave progression; maxWaveUnlocked per
leg is in the corpora, not summarized as reach.

## Blanks filled or documented

- Filled (this arm, measured): BUCKET-VS-TILE DIVERGENCE
  MECHANISM (#1659). Gate 1 isolated with file + function +
  condition and reproduced on named nights (17513 days
  5-10, 17511 day 10): nighttravel.js nightStep() offer
  check fails -> 'out-of-reach' before any hop ->
  woodcarry.js travel-refused gate never fires -> bucket
  null. The divergence is definitional; no fix follows.
- Filled (this arm, measured): the bucket gate never fires
  AT ALL on this stack on either band — 0 travel-refused
  evenings in 480, store records 0 on all 16 legs. A future
  gate-2 arm needs a different band, not a bigger sample
  of these bands.
- Filled (this arm, measured): ZERO DRIFT between
  b26777c16 and c9ac9183c on all P1 cells (genuine,
  creek-tile, bucket counts identical seed for seed).
- Documented (this arm, caveat for gate-2 work): the
  second gate (classifyRefusedEvening/bucketOf: hop
  block:creek + probe agreement) is UNTESTED by this
  corpus, not failed by it. No claim is made about what it
  would say on a refused creek evening, because none
  exists here.
- Documented (this arm, misreading closed): daytime "no
  crossing without a bridge or a swim" lines are daytime
  creek-tile movement blockers, not homeward hop refusals,
  and must not be cited as bucket evidence.
- Documented (this arm, texture): fire-gossip lines fire
  while camped at the creek; a "No watches tonight" line
  sits oddly beside a solo camp. Neither contradicts the
  census.
- NOT re-derived (this arm, stated): P3 tile counts are
  strandred's, not re-run here — P3 runs no woodcarry
  wrapper, so no bucket record exists for it, and this
  arm's question is a P1 question.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bar (mechanism named file+function+condition
  AND reproduced on >= 1 named creek night, ZERO
  unexplained pilot creek-tile evenings): MET EXACTLY (7/7
  gate-1, 0 unexplained, 17513 days 5-10 + 17511 day 10
  named). The bar did not need loosening, and no metric
  was re-scored mid-run. The grid ran exactly as declared
  (pilot 8 + confirm 8 = 16 legs; confirm unconditional on
  pilot results beyond the GO gate and the instrument
  gate, both of which passed).
- Label note (recorded so the verdict cannot be misread):
  this GO is definitional, per the prereg's own label rule
  — the question #1659 asks WHY, and the why is the gate.
  Under a narrow bug-hunt reading ("GO = a fixable
  classification failure found") this arm finds NO bug and
  authorizes NO fix. Both readings point the same way for
  the next arm: do not build a bucket fix on these bands;
  build on the tile criterion, or find a refused-hop band
  first.
- New doubt for the NEXT run: whether "bucket-explained"
  should also require the travelTargets distance to be
  recorded in the corpus (currently the analyzer judges
  from outcome + bucket + classification inputs, and the
  distance is code-level corroboration). A future
  instrument that snapshots _ntLast (offered flag,
  havenDistance) would turn the distance reading into a
  judged count.
- Carried doubt (from strandred, sized 0 here): the
  sleep/upkeep-window gap — unexplained away mornings are
  0 on all 16 legs here (away mornings all follow away
  evenings), so no window correction applies to this
  policy/band set.
- Whether bucket and tile criteria should ever be merged:
  NO — now with the mechanism named, not just as a rule:
  they measure a refused hop vs a slept place.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
stack, a 30-day per-evening bucket-vs-tile census, or a
census with no variant — the same declaration strandred
made. The comparison here is a census across bands on
identical seeds through the census analyzers, never labeled
a panel comparison. No panel result is fabricated; the
panel tool was not invoked on this corpus. No lever
comparison arose (DIAG only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-buckettile-b-census-p1-f2-30d.json --metrics
national,table,wins,exiled` prints LOUD "national/table/
wins disappeared: baseline 12/16/16 -> current 0 (n=1
files)". Investigated as a missing-field artifact, same
class as strandred's round: this census carries no
national/table/wins/exiled fields at all (keys: corpusDir,
policy, horizonDays, legs, seeds, totals, perSeed) — the
check ingests a census file where the baseline expects
per-seed sweep rows, so 0 means "field absent", not
"wall moved". No genuine LOUD signal. Baseline NOT
rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH pre-leg commits
   (prereg file, then both instrument files: committed
   files showing staged-as-deleted while byte-identical
   in the worktree). Repaired each time via
   `git update-index --add --cacheinfo` from HEAD blobs;
   `git status --short` empty + `git diff HEAD` empty
   verified after each repair. The commits themselves
   were never in doubt (blob hashes match). The
   coordinator should verify the same way after the
   final commit below.
2. No EPERM flap observed in this window: all stdout
   transports split first-try, all splitter writes
   landed first-try. The stdout transport rule was
   followed anyway (judged legs never wrote from a
   game-loaded process).
3. Judged corpora were never staged in /tmp (jsonl lived
   in evidence/ until split, then deleted, per the rule
   — no .jsonl leftovers at evidence time).
4. Diff guard at evidence time: `git diff --name-only
   c9ac9183c -- src/ scripts/policies/` is EMPTY — no
   game code, no policy file moved under measurement.
5. Finding #1658 was NOT found in hidden_files/
   sim-findings.md at prereg writing time (grep for
   "1658" returns nothing in the goal workspace copy);
   it was not answered, not pooled, and not re-filed.

## Proof

scripts/test-buckettile-b.js: pure 7/7 (gate-1 null-bucket +
out-of-reach, gate-2 creek/other/unclassified, unexplained
hypothesis-breaker case, non-creek exclusion, analyzeDir
wiring). Corpus checks: every leg errs 0, decisions ==
evenings (30/30), 16/16 legs complete (all survived).
Drift: strandred P1 cells re-derived exactly on the new
base. Diff guard: `git diff --name-only c9ac9183c -- src/
scripts/policies/` EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-buckettile-b-prereg.md
  (commit 247250ae6)
- Evidence (this file): evidence/2026-10-31/sim-buckettile-b.md
- Instruments: scripts/analyze-buckettile-b.js,
  scripts/test-buckettile-b.js (instruments commit
  042a1b68; absencehunt driver/analyzer/splitter reused
  verbatim from the base)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-buckettile-b-corpus-p1-f2-30d,
  sim-buckettile-b-corpus-p1-f1-30d
- Censuses (analyzer output, one per corpus):
  evidence/2026-10-31/sim-buckettile-b-census-p1-f2-30d.json,
  sim-buckettile-b-census-p1-f1-30d.json
- No compare .md exists (no paired lever comparison — this
  is a DIAG census, never labeled a panel comparison).
