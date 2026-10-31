# sim-warmfuel-b — prereg (BINDING; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0007Z,
arm sim-warmfuel-b, axis food-economy. Worktree sim-warmfuel-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero new policy files, zero edits to any existing policy
file. Sibling trees never touched; main tree never touched.

Pinned base: f52f08600550b0da8159849ffcfd5665c75e04f0
(worktree HEAD at prereg time). If the coordinator merges
sibling work mid-run, this arm does NOT re-pin silently:
any re-pin is a new prereg amendment committed before the
affected leg, and numbers are never mixed across pins.

## Question (backlog #1568; tracker warmth-fuel question)

Backlog #1568 (kcalshort open finding, evidence/2026-10-30/
sim-kcalshort-b.md): WARMTH EXTENDS THE STRAND IT WARMS —
the warmth fire spends bridge logs (kcalshort ON nights 9,
11, 13 named in prose; strandbank post-evening woods imply
a fourth spend, night 12 — this arm settles the count from
the warmth record itself, not from prose), turning a
3-night food-only guard strand (rescued by a built bridge
on night 10) into a 10-night food-and-wood strand. The
tracker warmth-fuel question asks what that fuel costs in
strand nights. This arm answers it as pure accounting:
on strand nights, how many bridge logs does the warmth
fire consume, on how many nights — and if those logs had
been preserved for the bridge, how many strand nights
would shorten, counting ONLY nights where wood was the
sole failing gate (food-and-wood both-evenings do NOT
count as rescued, per the kcalshort finding that the
bridge refusal names wood-short while kcal is also 0 on
all 5 both-evenings).

Prior evidence read in full before designing anything:
evidence/2026-10-30/sim-kcalshort-b.md (failure-mode
census: ON strand 15215 nights 7–16, classes ticks-only
1 / kcal-only 2 / wood-only 2 / both 5; guard strand
nights 7–9, ticks-only 1 / kcal-only 2; 15009 does not
strand on current master), evidence/2026-10-30/
sim-fedexile-b.md (2230Z substrate: same bank, same env,
guard/ON legs, POLICY nighttravel, DAYS=30 pre-seat),
evidence/2026-10-30/sim-strandbank-b.md (strand-bank
re-derivation: only 15215 strands; ON 18/10/8, guard
12/3/9; post-evening woods ON 4,4,3,3,2,1,0,0,0,0).
Instruments reused, not reinvented: scripts/
kcalshort-trace-b.js as the recorder driver verbatim
(OUTDIR override only), scripts/woodday-trace-b.js as
the fresh-baseline driver verbatim (OUTDIR override
only), the kcalshort classification logic (raw gates,
never the bridge skip's first-failure reason) copied
into the new analyzer with attribution.

## Substrate (fixed, same strand band as kcalshort/fedexile/strandbank)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30,
bank seeds 15003, 15009, 15091, 15211, 15215, 15220,
15221, 15337, 15376, 15439. Two judged legs: guard
(WOODWARM=0) and ON (WOODWARM=1; the live substrate
leg, primary). All 10 seeds must survive 30 days on
every leg or the leg is re-run, never judged short.
Death-aware horizon: 30 days pre-seat is a CEILING,
not a survival claim — every banked seed survived it
on every prior arm in this band, and the strand cycle
(guard 7–9, ON 7–16 on prior bases) sits well inside
it. If a strand runs past day 30 on this base, the
horizon is revisited for the NEXT run, never stretched
mid-run; the strand is reported truncated, and the
counterfactual is judged on the observed nights only.

## Definitions (fixed before any leg)

- Strand evening: a still-refused creek evening
  (woodcarry bucket creek, rescued false) belonging to
  a strand: a maximal run of still-refused creek
  evenings on CONSECUTIVE loop-days (the woodday /
  kcalshort definition, including length-1 runs).
  "Strand set" = all strand evenings on the leg; the
  census is reported per leg (ON primary, guard
  secondary) and never pooled across legs for the GO
  judgment (guard days 7–9 repeat inside the ON
  strand; pooling would double-count them).
- Evening numbers (refusal-time, from the woodcarry
  classification already recorded on the row, NOT
  from the post-evening snapshot): logs =
  classification.woodPlayer; kcal =
  classification.kcalLive, falling back to
  classification.kcal only if kcalLive is null (the
  fallback, if used on any strand evening, is named
  in the census, per evening); ticks =
  classification.ticksToDayEnd.
- Gates (canon costs, TIME-ECONOMY.md + woodcarry.js):
  bridge needs 4 logs, 60 kcal, 96 ticks.
  Failure-mode class from RAW gates, never the bridge
  skip: kcal-only, wood-only, both (woodShort AND
  kcalShort, regardless of ticks), ticks-only,
  kcal+ticks, wood+ticks, all-three, neither/other.
  Any evening with logs, kcal, or ticks null is
  UNCLASSIFIED, counted separately, and fails bar
  (a) — never folded into a class, never dropped.
- Spend night: a strand evening whose warmth record
  has acted=true, fireLit=true, and logSpent>=1.
  Acted-but-failed fires (fireLit=false, logSpent=0)
  consume NO log and are counted separately, never as
  spends. Non-acted evenings (miss reasons ticks-
  short, no-wood, etc.) consume NO log.
- Warmth-log consumption (the first half of the
  question): total logs consumed = sum of logSpent
  over strand evenings of the leg; spend nights =
  count of spend nights. Ledger cross-checks (proof,
  not bars): on every strand evening with a warmth
  record, warmth.woodBefore must equal evening logs;
  on every spend night, woodBefore - woodAfter must
  equal logSpent; the spend-night list derived from
  warmth records must equal the spend-night list
  derived from the evening-wood walk (evening logs
  falling between consecutive strand evenings with
  no intervening haven refill — on a strand there is
  none, and any mismatch is named, never smoothed).
- Protected-log counterfactual (ACCOUNTING, not a
  re-simulation — no trajectory is re-run, no game
  state is re-played): for strand evenings in order
  within one strand, preservedBefore(e) = sum of
  logSpent on EARLIER strand evenings of the same
  strand; cfLogs(e) = logs(e) + preservedBefore(e).
  The same evening's own spend is EXCLUDED (the
  warmth step runs AFTER the bridge decision, so a
  night's own fire cannot fund that night's bridge).
  Kcal and ticks are held at their OBSERVED values:
  preserving a log does not restore any kcal a fire
  cost, and it does not move time — this is
  conservative (a real protected-log world could
  only do at least as well on kcal if the fire
  burned other fuel, never worse on logs). A
  counterfactual that also refunded fire kcal would
  be a different, friendlier claim and is NOT made.
- Rescued, independent count: a strand evening is
  independently rescued iff it is wood-only under raw
  gates AND cfLogs(e) >= 4 (kcal and ticks already
  pass on a wood-only evening by definition, but the
  full gate check is run, not assumed). Both-
  evenings, kcal-only, ticks-only, and mixed classes
  can NEVER be independently rescued, no matter how
  large cfLogs grows — this is the kcalshort rule,
  applied mechanically: a both-evening with cfLogs 4
  still fails on kcal and stays stranded.
- Sequential shortening (the strand-length delta):
  let firstRescue = the earliest independently rescued
  evening in the strand, if any. Counterfactual
  still-count = number of still evenings strictly
  BEFORE firstRescue (the bridge builds on the
  firstRescue night itself, so that night is not
  still, and later nights never occur). Shortening
  = observed still-count minus counterfactual
  still-count. Later nights avoided by an early
  build are NOT individually counted as rescued —
  they simply never occur, and a both-evening among
  them is never claimed as rescued. The shortening
  is an accounting upper bound in exactly one
  respect, stated here so it is never overstated:
  it assumes the villager's days up to firstRescue
  are unchanged (true by construction — preserved
  logs change only the pack count, not prior days'
  food, time, or route) and that the bridge builds
  on firstRescue night (true by definition — all
  three gates pass under the counterfactual).
  What it does NOT assume: anything about nights
  after firstRescue, which do not exist in the
  counterfactual world.

## GO threshold (used EXACTLY as tasked)

GO iff the protected-log counterfactual shortens the
15215 strand by >=3 nights on a majority of strand
legs AND warmth-log consumption is observed on >=3
strand nights.

Operationalization of "majority of strand legs",
declared here BEFORE any leg because the wording
needs it (this is a definition, not a mid-run
re-score, and the alternative reading is reported
in metric review, not hidden): the counterfactual's
antecedent — warmth consumed a bridge log — is
FALSE on the warmth-off guard leg by construction.
Guard shortening is therefore 0 vacuously: there
are no logs to protect, and the guard leg can
neither satisfy nor falsify a claim about warmth
fuel. The judged set for the shortening clause is
the warmth-live strand legs (ON). With one
warmth-live leg, "majority" means that leg must
shorten by >=3. The guard leg's shortening (0,
expected) is reported alongside, and the literal
both-legs reading is addressed in metric review:
under it the bar would be unsatisfiable by
construction on any run with a warmth-off control
leg, which is why the judged set is defined this
way here, before any number exists. The consumption
clause is judged on the ON leg's strand nights
(spend nights >= 3).

## Legs (in order; no judged leg before this prereg commits)

1. Pilot: recorder driver, ON leg, first 8 bank
   seeds (15003, 15009, 15091, 15211, 15215, 15220,
   15221, 15337). Pilot gate is INSTRUMENT validity
   only: 8/8 seeds survive 30 days, recorder errs 0,
   warmth records present with the full field set
   (acted, fireLit, logSpent, woodBefore/After,
   miss reason on non-acted), evening loopDay
   sequences intact. The pilot is a GATE pass only,
   not a judged corpus: the judged legs below re-run
   the full 10-seed bank (pilot seeds included) in a
   single run per leg, so no judged number ever
   comes from a pilot-plus-patchwork mix. A pilot
   instrument failure voids the run; a pilot strand
   shape is never a reason to change seeds,
   thresholds, or definitions.
2. Fresh master baselines: scripts/woodday-trace-b.js
   verbatim, OUTDIR override only, guard + ON, same
   env. These are the current-master baseline the
   recorder must reproduce (strand-bank drift rule:
   the strand set is re-derived here, never inherited
   from kcalshort/fedexile/strandbank).
3. Judged recorder legs: scripts/kcalshort-trace-b.js
   verbatim, OUTDIR override only, guard + ON, same
   env, OUTDIR evidence/2026-10-30/
   sim-warmfuel-b-corpus-{guard,on} (one complete
   single run per leg; the pilot files live in a
   separate pilot dir and are never mixed into the
   judged corpora).
4. Determinism: SEEDS=15215 ON recorder leg into
   evidence/2026-10-30/sim-warmfuel-b-corpus-
   determinism; the 15215 file must be byte-identical
   to the judged ON 15215 file.

## DIAG-GO bars (judged exactly as written; a miss is NO-GO)

(a) Warmth-fuel ledger complete for 100% of strand
    evenings on the current-master strand set (BOTH
    judged legs, each leg's own strand set): every
    strand evening classified with its gap numbers
    AND its warmth record (acted / fireLit /
    logSpent / woodBefore / woodAfter / miss
    reason), total logs consumed and spend nights
    stated per leg. Zero unclassified evenings,
    zero strand evenings missing from the table,
    zero warmth records missing on a strand evening.
(b) The counterfactual table complete: per strand
    evening, preservedBefore, cfLogs, independently-
    rescued yes/no with the gate check shown, plus
    firstRescue and sequential shortening per leg.
    Both-evenings explicitly shown as NOT rescued
    even where cfLogs reaches 4.
(c) The GO threshold judged as written above
    (shortening >=3 on the warmth-live strand leg
    set AND spend nights >=3), with the independent
    rescued count reported alongside but NOT
    substituted for the shortening clause.
(d) Determinism re-run byte-identical on at least
    one leg (the 15215 ON file above); proof suite
    scripts/test-warmfuel-b.js green.

Equivalence bar (recorder behavior-neutrality, must
hold or the judged legs are void): recorder guard and
ON legs reproduce the fresh master baselines EXACTLY
on every per-seed creek/still/rescued count, and on
every strand's nights and evening woods. Recorder
errors 0 on judged legs.

## §15 balanced panel — applicability declared

NO panel compare .md. This is a pure DIAG
accounting instrument: zero src/js changes and zero
policy-default changes, so there is no game-root
delta for the panel to compare (same standing as
the kcalshort, strandbank, and woodwarm preregs).
Guard-vs-ON is not a panel comparison: it is a
within-instrument policy toggle (warmth off vs on)
whose ON leg is the measured trajectory, and the
counterfactual itself is computed from that single
trajectory's own records, not from a second root.
The determinism re-run is the instrument-
perturbation proof, and the DIAG-GO bars above are
the judge. Fabricating a panel compare between
identical roots would be measurement theater and is
explicitly not done.

## §14 metric binding

Pre-registered metrics bind this run. The primary
metric is the protected-log counterfactual (sequential
shortening + independent rescued count, both reported;
the GO clause judges the shortening). A miss on any
DIAG-GO bar is DIAG-NO-GO, never re-scored against a
friendlier metric mid-run. If a metric proves wrong,
it goes under "metric review" in the evidence file
and the revision is proposed for the NEXT run. Every
evidence file carries a "metric review" section.

## Proof suite (scripts/test-warmfuel-b.js)

Counterfactual pure-function unit cases: the
kcalshort ON strand table as a fixture (spends on
nights 9/11/12/13 IF the current base reproduces it
— the fixture asserts the FUNCTION, with the table
as input, not the base: given that input, total logs
4, spend nights 4, cfLogs per night, independent
rescued = nights 10 and 14 only, firstRescue = night
10, shortening = 7); both-evening with cfLogs 4
never rescued; same-evening spend excluded from its
own cfLogs; failed fire spends nothing; ticks-only
and kcal-only evenings never rescued; empty strand
shortening 0; no-rescue strand shortening 0.
Corpus checks: census totals recomputed from the
corpora; 100% classified, 0 unclassified, 0 recorder
errors; equivalence recorder == fresh master
baselines per-seed; warmth ledger cross-checks
(woodBefore == evening logs on strand evenings;
woodBefore - woodAfter == logSpent on spend
nights); determinism byte-identical; tracked-diff
guard: src/ and scripts/policies/ between pinned
base and final tree EMPTY (analyzer and proof are
measurement scripts only; the recorder driver is
reused verbatim).

## Wall numbers

Reported from the corpora (daysAlive, maxWaveUnlocked,
deaths, median survival). National / table / wins are
NOT OBSERVABLE on this 30-day pre-seat band — reported
as not observable with the observed counts alongside,
never as a reachability claim in either direction.

## Sense-test (law)

Read at least one full stranded day end to end from
the judged ON corpus (fullDaySay on a still evening,
plus the evening's bridge + warmth lines) and judge
meaning/coherence: does the refusal line name the
census class's numbers, does the fire line agree
with the warmth record (spend vs failed vs missed),
does the day cohere as a person choosing warmth
against a bridge. Report at least one paragraph in
the evidence file. The first-rescue night (if any)
is the preferred read, since it is the night the
counterfactual turns on.
