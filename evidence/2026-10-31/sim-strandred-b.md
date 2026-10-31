# sim-strandred-b — DIAG: creek-tile substrate RE-DERIVED on current master (GO); woodcarry-bucket creek evenings still 0 everywhere

Run: oversight-flesh-out-loop-b, arm sim-strandred-b, run
fleshout-loop-b-20261031T2130Z, axis food-economy (strand substrate).
Worktree sim-strandred-b, branch sim-strandred-b. Base commit
b26777c16 (worktree HEAD at prereg writing time). DIAG ONLY
(measurement): zero src/js changes, zero policy-default flips,
zero edits to any existing policy file or existing script. New
files only. This worker does NOT push, bump, verify live, or
merge into master; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bar

The binding prereg (evidence/2026-10-31/sim-strandred-b-prereg.md,
commit e54d76e5d, written BEFORE any judged leg) set the bar at
>= 2 seeds in the P3 F1 30d pilot with >= 1 genuine creek-tile
evening (creek-tile evening = evening tile 'creek', NOT atHaven,
NOT onRoad; genuine = absencehunt class 'genuine' or
'genuine-end-of-run', i.e. the following morning is also away
or the run ended that night).

Pilot result (P3 deed-seeking, F1 17501-17508, 30d, 8 legs):
**2 seeds qualify — 17505 (4 genuine creek-tile evenings:
days 5, 10, 17, 24) and 17506 (5: days 5, 8, 15, 24, 29).**
GO is met exactly, with no re-scoring and no metric moved
mid-run. The confirm ran as declared (16 legs) and strengthens
the verdict rather than qualifying it:

- P3 F1 60d (8 legs): the same 2 seeds still qualify;
  17506 adds genuine creek days 38, 43, 50, 57 (9 total);
  17505 adds none past day 30 (its creek life is a 30-day
  phenomenon on this trajectory — genuine absences still
  rise 4 -> 9, but at non-creek tiles after day 30).
- P1 F2 30d (8 legs, nighttravel stack): 17513 shows a
  genuine creek-tile camp, days 5-10 (opening night day 5
  genuine) — the creek-tile substrate exists on the
  ORIGINAL stack too, on a fresh band.
- Woodcarry-bucket creek evenings (the OLD strand
  criterion): **0 on all 16 P1 legs** (F1 8 diagnostic +
  F2 8 confirm) and 0 trivially on P3 (no woodcarry
  wrapper). The tile and
  bucket criteria DIVERGE on current master: the vessel
  sleeps at creek tiles, but the woodcarry bucket never
  classifies a night as creek. A future strand arm must
  choose its criterion knowing this: tile substrate is
  live, bucket substrate is still empty.

So the answer to the brief's question is split, and both
halves are measured: **a live creek-evening substrate
exists on current master in the tile criterion (GO), and
does NOT exist in the bucket criterion (still 0).** No
parked strand design is revived by this arm under either
half — fedevening branch-fire and axefirst joint proof
stay PARKED until a strand arm with its own new prereg
judges on a band named here.

## Drift vs absencehunt (base a3e57bfc1 -> b26777c16): ZERO on the compared cells

Every absencehunt count re-derived here matches its
a3e57bfc1 value exactly, seed for seed:

- P3 F1 30d: genuine absences 41 (8/8 seeds), day trips 39,
  multi-hop 0, road 0, sleep-returns 5, unexplained away
  mornings 0 — identical to absencehunt's P3 F1 30d cell.
- P3 F1 60d: genuine absences 80 (8/8 seeds) — identical
  to absencehunt's P3 F1 60d cell. 60d-prefix determinism
  re-checked here: first-30-day evening records
  (tile / inside / outcome) of the 60d legs vs the 30d
  legs — 240 evenings compared, 0 mismatches.
- P1 F1 30d: genuine 1 (17507 only), day trips 204 — 
  identical to absencehunt's P1 F1 30d cell.
- P1 F2 30d: genuine 2 (17511, 17513) — identical to
  absencehunt's P1 F2 30d cell.

The intervening landings between a3e57bfc1 and b26777c16
did NOT move any absence/creek trajectory on these bands.
Absencehunt's 100 creek-tile evenings across the two 30d
P3 bands are therefore still current as a tile count —
and this arm's pilot re-derives the F1 half of it (61
creek-tile evenings) on the new base directly, rather
than citing the old corpus.

## THE CENSUS (judged) — 32 legs

Instrument gate: every leg errs 0, decisions == evenings
in count (30/30 or 60/60), loop-days complete or a
game-over with its day recorded. Gate passed on all four
cells, so the confirm ran as declared. Horizons
death-aware (harness stops at Game.over).

Per-seed table — P3 F1 30d (pilot, judged for GO):
genAbs = genuine overnight absences (absencehunt primary);
crTile = creek-tile evenings; genCr = genuine creek-tile
evenings; crDays = creek-tile evening days;
camps = creek camps (runs of >= 2 consecutive creek-tile
evenings; G = opening night genuine-class).

| seed | genAbs | crTile | genCr | crDays | camps |
|------|--------|--------|-------|--------|-------|
| 17501 | 8 | 0 | 0 | — | — |
| 17502 | 5 | 0 | 0 | — | — |
| 17503 | 5 | 0 | 0 | — | — |
| 17504 | 4 | 16 | 0 | 11-16, 19-28 | 11-16, 19-28 |
| 17505 | 4 | 25 | 4 | 5-22, 24-30 | 5-22G, 24-30G |
| 17506 | 5 | 16 | 5 | 5,6,8-12,15-18,22,24,25,29,30 | 5-6G, 8-12G, 15-18G, 24-25G, 29-30G |
| 17507 | 6 | 0 | 0 | — | — |
| 17508 | 4 | 4 | 0 | 24,25,29,30 | 24-25, 29-30 |
| TOTAL | 41 | 61 | 9 | — | 11 camps, 7 genuine |

Sleep-return creek evenings in the pilot: 1 (17506 —
one creek evening followed by a haven morning, excluded
from the primary by definition, reported here, not hidden).
Unexplained away mornings: 0 on all P3 F1 30d legs (no
P4-class sleep/upkeep-window gap on this policy/band).

Per-seed table — P3 F1 60d (confirm):

| seed | genAbs | crTile | genCr | crDays (31-60 additions) |
|------|--------|--------|-------|--------------------------|
| 17501 | 13 | 14 | 0 | 31, 36-39, 47-50, 54-58 |
| 17502 | 10 | 0 | 0 | — |
| 17503 | 11 | 1 | 0 | 37 |
| 17504 | 7 | 36 | 0 | 31-44, 51-54, 59, 60 |
| 17505 | 9 | 25 | 4 | none past day 30 |
| 17506 | 9 | 33 | 9 | 31-39, 43, 44, 50, 51, 54-57 |
| 17507 | 12 | 0 | 0 | — |
| 17508 | 9 | 11 | 0 | 33-35, 45, 46, 59, 60 |
| TOTAL | 80 | 120 | 13 | 23 camps, 9 genuine |

Game-over in the 60d cell: 17506 ends village-lost day 57
(the only non-surviving leg in the whole arm) — while
camped at the creek (evenings 55, 56, 57 all creek).
Its death ledger is attrition across the run (wild /
sickness / combat deaths on days 3-57), not a single
creek-night event; no cause is claimed beyond that.

Per-seed table — P1 nighttravel-stack (bucket criterion):

| cell | seed | genAbs | crTile | genCr | rawBucket | checkedBucket |
|------|------|--------|--------|-------|-----------|---------------|
| F1 30d (diagnostic) | 17507 | 1 | 0 | 0 | 0 | 0 |
| F1 30d (diagnostic) | all others | 0 | 0 | 0 | 0 | 0 |
| F2 30d (confirm) | 17511 | 1 | 1 | 0 | 0 | 0 |
| F2 30d (confirm) | 17513 | 1 | 6 | 1 | 0 | 0 |
| F2 30d (confirm) | all others | 0 | 0 | 0 | 0 | 0 |
| TOTAL (16 legs) | | 3 | 7 | 1 | 0 | 0 |

17511's single creek-tile evening (day 10) is an
away-continuation, not genuine-class; 17513's camp
(days 5-10, opening night genuine) is the P1 tile
substrate in its purest form — and its bucket count is
still 0, which is the divergence in one seed: the vessel
sleeps six nights at the creek on the woodcarry stack
and the bucket never says creek.

## The honest caveat on the primary metric (stated, not used to re-score)

The prereg's genuine-class criterion counts DEPARTURE
nights only: a creek evening counts only if the vessel
left haven that same day. Camp CONTINUATION nights are
real nights slept at the creek, confirmed by the
following away morning, but they are class
'away-continuation', not 'genuine' — so they do not count
toward the GO bar as written. The effect is large and
must not be hidden behind the GO headline:

- 17504 lives at the creek for 16 evenings in 30d (36 in
  60d) with ZERO genuine-class creek evenings — every
  one is a continuation of an absence that departed at a
  non-creek tile. Its camps are real creek camps; the
  bar just does not count their opening nights because
  the departure happened elsewhere.
- Pilot-wide: 61 creek-tile evenings, 1 sleep-return,
  so 60 CONFIRMED creek nights (evening at creek +
  following morning away) — of which only 9 are
  departure-class. The GO verdict (2 seeds) is judged on
  the 9, as written; the substrate a future arm inherits
  is the 60, and the next prereg should argue explicitly
  whether "confirmed creek night" (genuine + continuation)
  replaces "genuine creek night" as the unit. That
  argument belongs to the next prereg, not to a
  re-scoring of this one — and under EITHER unit this
  arm's verdict would be GO (4 pilot seeds show
  creek-tile evenings: 17504, 17505, 17506, 17508).

## SENSE TEST (law) — PASS, with one correction to absencehunt

Read end to end: P1 17513 days 5, 6, 10 (genuine creek
camp, original stack) and P3 17505 days 5-6 (patrol creek
camp). Judgement:

- PASS on the creek night itself, and this arm corrects
  absencehunt's texture note. Absencehunt reported "NO
  line narrates the night out itself." On P1 17513 the
  night IS narrated, in the sleep step: day 5 ends
  "You camp wild tonight — no pantry meal. Eat from
  your pack." / "You settle into the cold ground. Sleep
  takes you." and day 6 dawns "You wake stiff and cold.
  (+5 health, energy restored... Exposed. You'll wake
  stiff.)" plus "The pantry is in the hall. Your hands
  are not." That is a night slept out, told as one —
  cold ground, stiff dawn, pantry out of reach. The
  absencehunt note stands only for the within-daily()
  transcript (the evening snap itself carries no say
  line); the sleep-step narration covers the night.
- Day 5 itself reads as a person wandering too far, not
  a counter: forest floor, glass-still water, crayfish,
  a kingfisher, Emberhold smoke on the horizon, the
  unbridged creek refusing twice ("no crossing without
  a bridge or a swim"), a striped thing following her
  from tile to tile and stopping at a boundary. The
  out-of-reach outcome matches the wandering: she walked
  the creek line until home stopped being reachable.
  Day 6 from the creek is a working day — drink
  upstream, forage, the striped thing still following.
- Gaps stated, not hidden: (a) "You catch fragments by
  the fire" gossip lines fire while camped at the creek
  (absencehunt's fourth-sighting note, recurring here) —
  ambient narration that reads slightly off out there
  (whose fire?). (b) A pantry line fires on the wild
  night itself ("Priya taps the pantry door — full to
  bursting — and keeps the day's share in hand") while
  the vessel is away — the same class of texture slip:
  the village's dinner beat does not know the scholar
  is not there to eat it. Neither overturns the census —
  positions, outcomes, dawn lines, and day transcripts
  agree — but both are live texture notes for any arm
  that narrates creek nights.
- P3 17505 day 5 (patrol departure, outcome
  policy-no-record) and day 6 (morning at creek) confirm
  the patrol shape absencehunt described: the vessel
  patrols out to the creek and then lives there. No
  contradiction found.

## Reachability verdict

Creek-tile nights ARE reached on current master: 61 in
the 30d P3 pilot, 120 in the 60d confirm, 7 on the P1
stack (F2). Creek camps (2+ consecutive creek evenings)
are reached on both policies. Woodcarry-bucket creek
evenings are NOT reached on any leg (0/16 P1 legs) — the
old strand criterion remains empty, and any strand arm
that wants it must either re-derive the bucket
classification itself or define its strand on the tile
criterion. No wave-4/5 reach, no regional/national/table
content is in scope of this census, and none is claimed
either way.

## Village assessment, in plain words

Picture two kinds of village that sleeps out. On the
patrol villages, the scholar walks far ground looking
for deeds, and the creek becomes her address: one
woman on 17505 spends most of her first month at the
creek — out on day 5, back for a night or two, out
again, twenty-five creek evenings in thirty days — and
on 17504 her neighbour does the same without ever
leaving home that same morning, which is why the strict
count misses her entirely: she departs from somewhere
else and then simply lives at the creek, camp after
camp, thirty-six evenings by day 60. On the old
nighttravel villages, thirteen of sixteen never sleep
at a creek at all — but one scholar, on 17513, walks
the creek line on day 5 past Emberhold's smoke and an
unbridged crossing she cannot make, and then she is
there for six nights, cold ground and stiff dawns,
followed along the water by something striped that
stops at a boundary. The bucket that the old strand
arms watched never once says "creek" for any of them —
the vessel sleeps at the creek, and the bucket looks
elsewhere. The next strand arm does not need to go
looking for a night away anymore. It needs to decide
which "creek night" it means — the place, which is
alive and full of campers, or the bucket label, which
is still empty — and then build on the place.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported,
never fabricated. Observed survival on judged legs: 31
of 32 legs survived their window; the single
village-lost leg is P3 17506 60d (day 57, listed above).
National 0, table 0, wins 0 (structurally unreachable
in this band, not a wall measurement); median survival
is window-censored (most legs survive the full window).
Wave reach is not reported as a wall number here
because this census measures creek evenings, not wave
progression; maxWaveUnlocked per leg is in the corpora,
not summarized as reach.

## Blanks filled or documented

- Filled (this arm, measured): CREEK-TILE SUBSTRATE
  RE-DERIVED ON CURRENT MASTER (base b26777c16). GO bar
  met exactly in the pilot (17505, 17506) and held in
  the confirm (same seeds at 60d; plus P1 17513's
  days 5-10 camp). Named bands for the next strand arm:
  P3 F1 17501-17508 (17505 and 17506 first for genuine
  creek nights; 17504 first for long creek camps under
  a confirmed-night unit) or P1 F2 17513 (original
  stack, genuine creek camp days 5-10). The next arm
  still needs its own prereg; this arm judges no strand
  fix.
- Filled (this arm, measured): ZERO DRIFT on these bands
  between a3e57bfc1 and b26777c16 — every absencehunt
  cell re-derived here matches exactly. Absencehunt's
  tile counts may be quoted as current for P3 F1 / P1
  F1+F2; the bucket-zero half is re-derived too.
- Filled (this arm, measured): TILE vs BUCKET DIVERGENCE.
  17513 sleeps six nights at the creek on the woodcarry
  stack with bucket 0 throughout. The two criteria are
  different claims and must never be merged into one
  "creek evening" count (prereg rule, now with a
  named witness seed).
- Documented (this arm, metric-review item for the NEXT
  run): the genuine-class unit undercounts creek nights
  lived — 60 confirmed creek nights vs 9 departure-class
  in the pilot; 17504's 36-evening 60d creek life counts
  0 under the strict unit. The next prereg should argue
  confirmed-night vs departure-night explicitly.
- Documented (this arm, sense correction): the night out
  IS narrated in the sleep step (camp-wild line +
  cold-ground settle + stiff/cold dawn) on P1 17513,
  qualifying absencehunt's "no line narrates the night
  out" note to the within-daily() transcript only.
- Documented (this arm, texture): fire-gossip lines fire
  while camped away; a pantry dinner line fires on a
  wild night while the vessel is away. Neither is a
  contradiction; both are narration gaps for creek-night
  work.
- Documented (this arm, residue): 17505's creek life
  ends by day 30 on its trajectory (no creek evenings
  days 31-60 despite 5 more genuine absences) — a
  strand arm wanting long creek camps past 30d should
  prefer 17504/17506, not 17505.
- NOT re-derived (this arm, stated): woodcarry-bucket
  creek evenings remain 0 everywhere (0/16 P1 legs).
  Carried, NOT re-judged: fedevening branch-fire and
  axefirst joint proof stay PARKED pending a strand arm
  with its own new prereg on a band named here.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bar (>= 2 pilot seeds with >= 1 genuine
  creek-tile evening): MET EXACTLY (17505, 17506). The
  bar did not need loosening, and no metric was
  re-scored mid-run. The grid ran exactly as declared
  (pilot 8 + diagnostic 8 + confirm 16 = 32 legs;
  confirm unconditional on pilot results beyond the
  GO gate and the instrument gate, both of which passed).
- New doubt for the NEXT run (argued above, not resolved
  here): whether the unit should be "confirmed creek
  night" (creek-tile evening + following away morning,
  i.e. genuine + continuation) rather than
  "genuine-class creek night" (departure night only).
  Under the confirmed-night unit the pilot counts 4
  qualifying seeds (17504, 17505, 17506, 17508) and 60
  nights; under the departure unit, 2 seeds and 9
  nights. The next prereg must pick one and say why.
- Carried doubt (from absencehunt, sized 0 here): the
  sleep/upkeep-window gap — unexplained away mornings
  are 0 on all 32 legs here, so no window correction
  applies to this policy/band set.
- Whether a creek camp should require its opening night
  to be genuine-class: NO under this prereg (camps are
  reported as runs with a genuine flag); 17504's camps
  are the standing counterexample to a genuine-only
  camp rule.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the deed-seeking far patrol,
the nighttravel+woodcarry+woodwarm stack, a 30/60-day
per-day creek census, or a census with no variant — the
same declaration every prior strand arm made. The
comparison here is a census across policies on identical
seeds through the census analyzers, never labeled a panel
comparison. No panel result is fabricated; the panel tool
was not invoked on this corpus. No lever comparison arose
(DIAG only).

## Telemetry deviation check (step 10 — investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-strandred-b-census-p3-f1-30d.json --metrics
national,table,wins,exiled` prints LOUD "national/table/
wins disappeared: baseline 12/16/16 -> current 0 (n=1
files)". Investigated as a missing-field artifact, same
class as absencehunt's round: this census carries no
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
   b26777c16 -- src/ scripts/policies/` is EMPTY — no
   game code, no policy file moved under measurement.

## Proof

scripts/test-strandred-b.js: pure 5/5 (genuine creek-tile
counting, camp runs + genuine flag, road exclusion,
classifySeed -> classifyCreek wiring, analyzeDir wiring).
Corpus checks: every leg errs 0, decisions == evenings
(30/30 or 60/60), 32/32 legs complete or game-over with
its day recorded.
60d-prefix determinism: 240 evenings compared, 0 mismatches.
Diff guard: `git diff --name-only b26777c16 -- src/
scripts/policies/` EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-strandred-b-prereg.md
  (commit e54d76e5d)
- Evidence (this file): evidence/2026-10-31/sim-strandred-b.md
- Instruments: scripts/analyze-strandred-b.js,
  scripts/test-strandred-b.js (instruments commit
  65121f21f; absencehunt driver/analyzer/splitter reused
  verbatim from the base)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-strandred-b-corpus-p3-f1-30d,
  sim-strandred-b-corpus-p1-f1-30d,
  sim-strandred-b-corpus-p3-f1-60d,
  sim-strandred-b-corpus-p1-f2-30d
- Censuses (analyzer output, one per corpus):
  evidence/2026-10-31/sim-strandred-b-census-p3-f1-30d.json,
  sim-strandred-b-census-p1-f1-30d.json,
  sim-strandred-b-census-p3-f1-60d.json,
  sim-strandred-b-census-p1-f2-30d.json
- No compare .md exists (no paired lever comparison — this
  is a DIAG census, never labeled a panel comparison).
