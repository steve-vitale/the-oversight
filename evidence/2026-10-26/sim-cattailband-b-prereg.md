# sim-cattailband-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2309Z, axis
food-economy. Arm: the spoilvol sink-comparison blank — the
2026-10-26 spoilvol run (fleshout-loop-b-20261026T2130Z, arm
sim-spoilvol-b) ended DIAG-NO-GO because Cattail grew on 0/8 fresh-band
seeds (9820–9827, competent-nofeast, 100d), so its sink-ratio leg was
UNMEASURED. This arm runs that comparison on a Cattail-growing
substrate. Measurement only: zero src/js changes, no default flips, no
lever. This arm does NOT re-judge the spoilvol DIAG-NO-GO or the
lqpersist GO — its verdict is ONLY whether spoil-removal volume
explains the Cattail collapse, judged ONLY against this prereg.

## Question (verbatim from the spoilvol evidence + metric review)

2029 (sim-lqpersist-b): Lamb's Quarters persists (30,000–52,000 kcal)
while Cattail collapses, yet Cattail's net inflow-minus-draw
(+399,600 = 523,680 in − 107,040 meal-drawn − 17,040 other-drawn)
EXCEEDS LQ's (+273,500 = 396,750 − 105,750 − 17,500). Median stock:
Cattail ~3,600 (post-arrival) vs LQ 34,150. Spoiled share sits at
0.000 median for all channels, so spoiled stock never lingers long
enough to be snapshotted: the sweep removes it between snapshots.
The unmeasured sink is per-channel spoil-removal volume — kcal
leaving the pantry without a recorded draw. This arm measures it on
seeds where Cattail actually grows.

## Prior knowledge (what was known BEFORE this prereg — nothing more)

- The spoilvol prereg and evidence (evidence/2026-10-26/
  sim-spoilvol-b-prereg.md, sim-spoilvol-b.md), read before writing
  this prereg: the full code audit (bonus-aware isSpoiled boundary,
  sweepSpoiled as the sole pantry spoil path, pantryDraw skips
  spoiled), the (dried)-family ledger rule, and the bonus-aware
  horizon definitions are all inherited unchanged. Nothing in them
  is re-litigated here; the GO legs below are quoted verbatim.
- The lqpersist corpus (evidence/2026-10-26/
  sim-lqpersist-b-corpus/, seeds 9760–9767), inspected before writing
  this prereg — INFLOW records only, no spoil data:
  - Cattail inflow: 9761: 523,680 kcal (65 deposit records);
    9767: 2,880 kcal (6 deposit records); 0 on all other pilot seeds.
    Cattail appearance on the reuse band: 2/8 seeds.
  - Lamb's Quarters inflow: 9762: 396,750 kcal (129 deposit records);
    0 on all other pilot seeds. LQ appearance: 1/8 seeds.
  - This appearance picture is PRIOR KNOWLEDGE, not a result of this
    arm: the re-run below counts appearance from ITS OWN inflow
    records, and any difference from the lqpersist inflow picture is
    reported as a finding (base-move drift), never hidden.
  - The lqpersist confirm band 9768–9779 was also inspected
    (inflow records only): Cattail inflow 0 on all 12 seeds. It is
    therefore NOT a Cattail-growing substrate (see "Confirm" below).
- Corpus-gap verification (done before writing this prereg): the
  lqpersist corpus files carry NO spoilvol records — key inspection
  of sim-lqpersist-b-corpus/s9760 shows keys with no `spoilEvents`,
  no `spoilDays`, no spoilvol fields at all (the lqpersist sweep
  predates the spoilvol capture). The sink volumes for 9760–9767
  therefore do NOT already exist anywhere: this arm must re-run the
  spoilvol capture instrument on 9760–9767. That re-run is REUSE
  (same instrument, same substrate, deterministic re-run), not a
  fresh band — no new seed is spent on it.
- Seed-spend discipline carried from spoilvol: the spoilvol confirm
  reserve seeds 9828–9839 remain UNSPENT and are NOT this arm's to
  spend. This arm spends no fresh seed unless the fallback below
  triggers, and then at most one 8-seed screen band.

## Substrate decision (stated intent, per the spoilvol metric review)

- PRIMARY substrate: PAIRED REUSE of the lqpersist band 9760–9767.
  The spoilvol metric review's named option ("claim paired reuse of
  the lqpersist band 9760–9767 … with stated intent in the prereg")
  is claimed here, with this stated intent: the question is a
  channel-specific comparison, and a fresh band is the wrong
  substrate for it (spoilvol proved that at 0/8). The reuse band is
  where Cattail is known to grow, so the comparison can be run.
- FALLBACK: at most ONE fresh 8-seed screen band, and ONLY if the
  reuse re-run yields Cattail on fewer than 2 seeds (counted from
  the re-run's own inflow records). The fallback band, if triggered,
  must be verified fresh before its prereg amendment (0 .md hits,
  0 corpus files) and its seeds recorded in an amended prereg
  BEFORE its sweep — no band is swept on an unwritten prereg.
- STOP RULE: if neither substrate grows Cattail on >= 2 seeds, the
  verdict is DIAG-NO-GO, no further bands are spent, and the run
  ends. (Note: the fallback trigger is Cattail < 2; the verdict's
  appearance leg additionally requires LQ >= 2 — see leg 3. A band
  can pass the fallback trigger yet still fail leg 3 on LQ, and
  that failure is the verdict, not a reason to spend more bands.)

## Band (substrate identical to spoilvol/lqpersist)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9760–9767 (8 seeds; this re-run IS the pilot). Same
  instrument as spoilvol, run with PERSEED_DIR pointed at this
  arm's own corpus directory (see "Instrument") — the spoilvol
  corpus and the lqpersist corpus are NOT overwritten.
- Horizon: 100d, death-aware (run ends early if the village is
  lost; daysAlive reported per seed). Never a fixed 200d. Why 100d:
  it matches spoilvol and lqpersist exactly, so the sink volumes
  are comparable seed-for-seed with the prior knowledge numbers
  (Cattail 523,680 in on 9761, LQ 396,750 in on 9762) and with the
  spoilvol band's sink scale.
- Base commit pinned: this worktree's HEAD at prereg time is
  recorded by the proof (git rev-parse HEAD); if the base moves
  before the sweep, the sweep re-runs from the new HEAD and the
  evidence names the new HEAD — a trajectory move is reported,
  never hidden.

## Instrument (DIAG only, no new capture code)

- Reuses UNCHANGED: scripts/sweep-spoilvol-b.js,
  scripts/spoilvol-capture.js, scripts/inflow-capture.js, and
  scripts/mealdraw-capture.js (all committed by the spoilvol run).
  No sibling capture file is modified. The sweep is invoked with
  SEEDS=9760..9767 and PERSEED_DIR=
  evidence/2026-10-26/sim-cattailband-b-corpus.
- NEW scripts/analyze-cattailband-b.js and
  scripts/test-cattailband-b.js (proof). The analyzer prints:
  per-seed per-channel inflow, draws, sweep-removal, stock
  trajectory, the GO legs below, the ledger residuals (base-name
  and (dried)-family ledgers, per the spoilvol lesson), bonus
  statistics, violation totals, appearance counts, the sense
  block, and wall numbers. No game code is loaded by the analyzer;
  it is pure JSON arithmetic over the committed corpus.
- Median rule (named explicitly): conventional median — average of
  the two middle values for even n. "Median across sweeps" of a
  per-sweep statistic means the conventional median of that
  statistic's per-sweep values.

## Definitions (fixed here, before judging — inherited from spoilvol)

- Focal channels: Lamb's Quarters, Cattail, Burdock (item-name
  channels; names verbatim from records). All other channels are
  reported in the per-seed tables, not judged.
- Appearance: a channel "grows" on a seed iff it has >= 1 inflow
  record (any door) on that seed IN THIS RE-RUN's records.
  Appearance counts per channel are reported for all 8 pilot
  seeds. A channel that never appears is a FINDING, not a zero:
  its spoil-removal is unmeasured, and the appearance leg below
  handles it.
- Inflow of channel C on seed S: sum of kcal over inflow records
  with name == C, counting stock records only when kcal > 0 and
  pantryAdd records only when added === true (the recorder's own
  honesty rules). Direct-push pantry additions bypass the doors
  and are NOT in inflow (named limitation; they appear in the
  ledger residual, never silently in inflow).
- Draws of channel C on seed S: sum over mealdraw pantryDraw
  records' items with name == C of units * kcalEach (PHYSICAL
  stock removed, so the ledger is in one unit; effectiveKcal
  under village cooking is reported separately and is NOT the
  ledger unit). Meal contexts (context != 'other') and 'other'
  contexts are summed separately, then totaled.
- Sweep-removal of channel C on seed S: sum over spoilvol sweep
  records' pantry removed.byChannel entries with channel == C
  of kcal. Pack/prep/corpse removals are reported separately and
  NEVER added to pantry spoil volume.
- Stock trajectory of C on S: day-end spoilvol snapshots
  (freshKcal per channel). Median post-arrival stock = median
  over day-end snapshots with day >= first-inflow day of C on S
  of C freshKcal. First-appearance day = day of the first inflow
  record of C on S.
- Bonus statistics: spoilBonusDays() per sweep (distribution across
  pilot sweeps); bonus-saved kcal per channel (post-sweep stacks
  with raw horizon <= 0 but bonus-aware horizon > 0).
- Ledger residual of C on S: (last day-end C freshKcal − first
  day-end C freshKcal before its first inflow) − (inflow − draws
  − sweep-removal). A residual of 0 means inflow, draws, and the
  sweep fully explain the stock change; nonzero residuals are
  reported per seed and attributed only when a named cause fits
  (raid voice line, direct-push inflow, cap refusal). The ledger
  is SUPPORTING, not a GO leg (see below). The (dried)-family
  ledger (base + ' (dried)') is reported alongside the base-name
  ledger, per the spoilvol lesson.
- Bonus-aware horizons ONLY: a stack is spoiled iff
  spoilDay + spoilBonusDays() <= scholar day. A bar that measures
  raw spoilDay alone is FORBIDDEN by the 2029 metric review. This
  prereg judges ONLY on bonus-aware horizons.

## PRIMARY metric (judged ONLY against this — spoilvol legs, verbatim)

GO (the sink is identified: spoil-removal volume explains the
Cattail collapse) iff ALL of:
  1. Neutrality / det-gate: a paired run of one pilot seed with
     SPOILVOL=0 vs SPOILVOL=1 produces identical inflow records,
     mealdraw records, death lists, and wall fields (spoilvol
     fields and `ms` excluded from the comparison). Any mismatch
     is DIAG-NO-GO (instrument, not game).
  2. Sweep integrity: across all pilot sweeps, pantry
     removedNotSpoiledKcal == 0 AND pantry keptSpoiledKcal == 0.
     (The wrapper measures exactly the spoil sink: nothing
     removed that wasn't spoiled, nothing spoiled left standing.
     Any violation is DIAG-NO-GO, reported with counts, never
     re-scored as "close enough".)
  3. Appearance: each focal channel (Lamb's Quarters, Cattail)
     grows on >= 2 pilot seeds. If either grows on 0–1 seeds, the
     ratio leg is UNMEASURED and the verdict is DIAG-NO-GO with
     the appearance finding (a channel that never appears is a
     finding, not a zero, and never a GO).
  4. Sink bar (BOTH parts, pooled across pilot seeds):
     (a) RATIO: pooled Cattail sweep-removal >= 1.5x pooled Lamb's
     Quarters sweep-removal; AND
     (b) SHARE: pooled Cattail sweep-removal accounts for >= 50%
     of pooled Cattail (inflow − draws) — i.e. rot, not eating,
     is where most uneaten Cattail goes.
A miss on leg 4 is NO-GO (measured, and the sink does not explain
the collapse as barred) — never re-scored against a friendlier
metric mid-run (no switching to raw spoilDay, means, day-end
snapshots alone, or a single seed to rescue a failed leg). A miss
on leg 1 or 2 is DIAG-NO-GO (instrument failure, not a game
verdict). Metric doubts go under "metric review" and propose the
revision for the NEXT run. Pooled means pooled across the pilot
seeds in this re-run's corpus, not pooled with the spoilvol band
or the lqpersist band: the comparison is within this corpus.

## Confirm band (ONLY if the pilot verdict is GO)

If the pilot is NO-GO or DIAG-NO-GO, no confirm band is spent —
the run ends with that verdict. If the pilot is GO, a confirm
requires a SECOND Cattail-growing substrate, named here: NONE IS
ESTABLISHED. The lqpersist confirm band 9768–9779 was inspected
before this prereg and shows Cattail inflow 0 on all 12 seeds, so
it does not qualify; the 9760–9767 reuse band does not count as
both pilot and confirm. No fresh confirm band is named in this
prereg, and none may be swept without a prereg amendment naming
and freshness-verifying it first. If the pilot GOes with no
second substrate established, the run reports the pilot verdict
and stops — it does not manufacture a confirm. The confirm NEVER
overrides the pilot verdict: the verdict is the pilot's
GO/NO-GO/DIAG; the confirm is reported alongside.

## Secondary figures (reported, not judged)

- Per-seed per-channel tables: inflow, meal-drawn, other-drawn,
  sweep-removed, median post-arrival stock, first-appearance day,
  appearance flag — for Lamb's Quarters, Cattail, Burdock, and
  every other channel with inflow >= 10,000 kcal on that seed.
- Bonus distribution across pilot sweeps (median, min, max of
  spoilBonusDays()); bonus-saved kcal per focal channel.
- Pack/prep/corpse sweep-removal totals (secondary; never mixed
  into pantry volume) and the sweep-call count per seed.
- Ledger residuals per focal channel per seed (base-name and
  (dried)-family), with named causes where a voice line or door
  limitation fits.
- Wall numbers for the band (national / table / wins, wave 4/5
  reach, median survival, death-cause shares). Four-realm
  formation, Arc reach, trap acquisition, counter discovery/kill,
  young-link succession: reported ONLY if the corpus carries
  them; otherwise "not recorded in this corpus, not estimated".
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no
  before/after to panel. Stated in the evidence file; the
  det-gate (leg 1) is the before/after comparison: identical
  records with the instrument off vs on.

## Pilot gate

This 8-seed re-run IS the pilot. No confirm band is spent unless
the pilot verdict is GO AND a second Cattail-growing substrate is
established (see "Confirm band"). Never below 8 seeds for any band.

## Sense (SENSE-TESTING LAW)

At least one spoil-voice sample quoted verbatim from the corpus
(spoilSayLines: a real "threw out spoiled stores" line with its
day), judged in plain words. Plus one per-channel day-by-day
narrative (arrived / eaten / rotted / standing) for seed 9761's
Cattail collapse, read from the inflow + draw + sweep + day-end
snapshot records together, so the sink claim reads as a village
story, not just a ratio. If 9761's Cattail does not collapse in
this re-run (e.g. its stock trajectory differs from lqpersist's
picture), the narrative reports what actually happened on 9761,
never the lqpersist story retold.

## Metric review

Every evidence file carries a "metric review" section (MEASUREMENT.md
section 14). If this metric proves wrong, the revision is proposed
there for the NEXT run — never re-scored mid-run.
