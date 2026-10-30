# sim-kcalshort-b — prereg (BINDING; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-kcalshort-b, axis
food-economy. Worktree sim-kcalshort-b. DIAG ONLY: zero
src/js changes, zero policy-default flips, no behavior probe
built, run, or judged. Sibling trees never touched; main
tree never touched.

Pinned base: 18d27c4c20a7ce42cb5d655e047396d8a6377cd2
(worktree HEAD at prereg time). If the coordinator merges
sibling work mid-run, this arm does NOT re-pin silently:
any re-pin is a new prereg amendment committed before the
affected leg, and numbers are never mixed across pins.

## Question (backlog #1499, 2026-10-30, loop-B arm sim-woodday-b)

On the woodday base, seed 15009's single still evening
(day 13) held 4 logs and failed kcal-short (24 kcal): a
FOOD failure wood levers cannot move. Question for this
arm, re-derived on current master: for EVERY strand
evening in the current-master strand set, what is the
evening's failure mode — kcal-short, wood-short, both,
or neither/other — with gap numbers, so the #1499
question is answered on current data, not on the
woodday base's story.

Prior evidence read in full before designing anything:
evidence/2026-10-30/sim-woodday-b.md (strand census,
15009 day-13 kcal-short 24 kcal; 15215 ON strand days
7–16), evidence/2026-10-30/sim-wakeforage-b.md (strand
bank, yield table, #1554 note: 15009's strand is GONE
on the wakeforage base), evidence/2026-10-30/
sim-pressb-b.md (bank reproduction: only 15215 strands
on the pressb base). Instruments reused, not reinvented:
scripts/woodday-trace-b.js and scripts/wakeforage-trace-b.js
as the master-driver pattern; the new recorder below is
a read-only extension of the woodday driver.

## Substrate (fixed, same strand band as woodday/wakeforage/pressb)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30,
bank seeds 15003, 15009, 15091, 15211, 15215, 15220,
15221, 15337, 15376, 15439. Two judged legs: guard
(WOODWARM=0) and ON (WOODWARM=1; the live substrate leg,
primary). All 10 seeds must survive 30 days on every leg
or the leg is re-run, never judged short.

## Definitions (fixed before any leg)

- Strand evening: a still-refused creek evening
  (woodcarry bucket creek, rescued false) belonging to a
  strand: a maximal run of still-refused creek evenings
  on CONSECUTIVE loop-days (the woodday analyzer's
  definition, including length-1 runs). "Strand set" =
  all strand evenings on the leg; the census is reported
  per leg (ON primary, guard secondary) and pooled.
- Evening numbers (refusal-time, from the woodcarry
  classification already recorded on the row, NOT from
  the post-evening row snapshot):
  - logs = classification.woodPlayer
  - kcal = classification.kcalLive, falling back to
    classification.kcal only if kcalLive is null (the
    fallback, if used on any evening, is named in the
    census, per evening)
  - ticks = classification.ticksToDayEnd
  - bridge.skip + narration line, recorded as-is.
- Gates (canon costs, TIME-ECONOMY.md + woodcarry.js):
  bridge needs 4 logs, 60 kcal, 96 ticks.
  - woodShort: logs < 4. woodDeficit = 4 - logs.
  - kcalShort: kcal < 60. kcalGap = 60 - kcal.
  - ticksShort: ticks < 96. ticksGap = 96 - ticks.
- Failure-mode class (RAW gates, never the bridge
  decision's first-failure skip — the skip names only
  the first gate in wood, kcal, ticks order, so it
  cannot express "both"):
  - kcal-only, wood-only, both (woodShort AND kcalShort,
    regardless of ticks), ticks-only, kcal+ticks,
    wood+ticks, all-three, neither/other (no gate
    short but still refused — bridge.skip and narration
    must explain it, e.g. build-refused; a neither/
    other evening with no explaining skip is an
    analyzer error, not a class).
  - Any evening with logs, kcal, or ticks null is
    UNCLASSIFIED, counted separately, and fails bar
    (a) — never folded into a class, never dropped.
- Pricing numbers (post-evening row snapshot, after
  the warmth step — warmth spends a log and possibly
  kcal, never food items or pantry stock, so pack and
  pantry snapshots are unaffected by it; the row's
  post-evening scholar kcal is reported separately
  from refusal-time kcal and the two are never mixed):
  - eveningPackFoodKcal = sum over scholar.inventory
    of kcalEach * units (pure read).
  - eveningPantryKcal = Game.pantryKcal() (pure read
    of the home village pantry).
  - morning kcal is already on the morning row.
- Median kcal gap: median of kcalGap over ALL
  kcal-short evenings (kcal-only + both + kcal+ticks
  + all-three) on the leg; pooled median reported
  alongside. Median wood deficit likewise over
  wood-short evenings. Medians over an empty set are
  reported as "n/a (0 evenings)", never 0.

## Recorder (new measurement script, read-only additions only)

scripts/kcalshort-trace-b.js = scripts/woodday-trace-b.js
with WOODDAY probe wiring REMOVED (DIAG: no probe leg)
and exactly two read-only additions in the wrapper,
after dayPolicy.daily returns: eveningPantryKcal and
eveningPackFoodKcal (both try/catch, null on error,
counted as recorder errors if null on a strand
evening). No verb calls, no state writes, no RNG
draws, no policy-stack change: base =
withWoodcarry(nighttravel), warmed =
withWoodwarm(base), dayPolicy = warmed — identical
to the woodday driver at WOODDAY=0. Behavior-
neutrality is PROVEN, not asserted, by the
equivalence bar below.

Analyzer: scripts/analyze-kcalshort-b.js (pure reads
over the recorder corpora; strand definition and
evening-wood helpers identical to
scripts/analyze-woodday-b.js).

## Legs (in order; no judged leg before this prereg commits)

1. Fresh master baselines: scripts/woodday-trace-b.js
   verbatim, OUTDIR override only, guard + ON, same
   env. These are the current-master baseline the
   recorder must reproduce.
2. Judged recorder legs: scripts/kcalshort-trace-b.js,
   guard + ON, same env, OUTDIR
   evidence/2026-10-30/sim-kcalshort-b-corpus-{guard,on}.
3. Determinism: SEEDS=15003 ON recorder leg into
   evidence/2026-10-30/sim-kcalshort-b-corpus-
   determinism; the 15003 file must be byte-identical
   to the judged ON 15003 file.

## DIAG-GO bars (judged exactly as written; a miss is NO-GO)

(a) Failure-mode table complete for 100% of strand
    evenings on the current-master strand set (BOTH
    judged legs, each leg's own strand set): every
    strand evening classified with its gap numbers
    (logs, kcal, kcalGap where kcal-short, woodDeficit
    where wood-short, ticks, pantry + pack kcal). Zero
    unclassified evenings, zero strand evenings
    missing from the table.
(b) The #1499 question answered on current data:
    whether the strand evenings' binding failure is
    food, wood, or both — stated per evening class
    with counts (per leg and pooled), and the 15009
    day-13 case explicitly addressed: if 15009 does
    not strand on current master, say so and answer
    on the current strand set instead of assuming it.
    A verdict that quotes the woodday base's 15009
    story as current-master fact fails this bar.
(c) Determinism re-run byte-identical on at least one
    leg (the 15003 ON file above); proof suite
    scripts/test-kcalshort-b.js green.

Equivalence bar (recorder behavior-neutrality, must
hold or the judged legs are void): recorder guard and
ON legs reproduce the fresh master baselines EXACTLY
on every per-seed creek/still/rescued count, and on
every strand's nights and evening woods. Recorder
errors 0 on judged legs.

## §15 balanced panel — applicability declared

NO panel compare .md. This is a pure DIAG census:
zero src/js changes and zero policy-default changes,
so there is no game-root delta for the panel to
compare (same standing as the walktree and wakeforage
preregs). The instrument is the recorder + analyzer;
the judge is the DIAG-GO bars above. Fabricating a
panel compare between two identical roots would be
measurement theater and is explicitly not done.

## §14 metric binding

Pre-registered metrics bind this run. The primary
metric is the failure-mode census (kcal-short share,
wood-short share, median kcal gap on kcal-short
evenings). A miss on any DIAG-GO bar is DIAG-NO-GO,
never re-scored against a friendlier metric mid-run.
If a metric proves wrong, it goes under "metric
review" in the evidence file and the revision is
proposed for the NEXT run. Every evidence file carries
a "metric review" section.

## Proof suite (scripts/test-kcalshort-b.js)

Classification pure-function unit cases (all eight
classes + null → unclassified + kcalLive fallback);
census totals recomputed from the corpora (strand
evenings, per-class counts, medians); equivalence
(recorder == fresh master baselines per-seed);
100% classified, 0 unclassified, 0 recorder errors;
determinism byte-identical; tracked-diff guard:
src/ and scripts/policies/ between pinned base and
final tree EMPTY (recorder, analyzer, proof are
measurement scripts only).

## Wall numbers

Reported from the corpora (daysAlive, maxWaveUnlocked,
deaths, median survival). National / table / wins are
NOT OBSERVABLE on this 30-day pre-seat band — reported
as not observable with the observed counts alongside,
never as a reachability claim in either direction.

## Sense-test (law)

Read at least one full stranded day end to end from
the judged ON corpus (fullDaySay on a still evening)
and judge meaning/coherence: does the refusal line
name the census class's numbers, does the fire line
agree with the warmth record, does the day cohere.
Report one paragraph in the evidence file.
