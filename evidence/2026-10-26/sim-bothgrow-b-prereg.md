# sim-bothgrow-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0049Z, axis
food-economy. Arm: the both-grow screen + the cattailband metric-review
revision. Measurement only: zero src/js changes, no default flips, no
lever. This arm does NOT re-judge the spoilvol DIAG-NO-GO, the
cattailband DIAG-NO-GO, or the lqpersist GO — its verdict is ONLY the
judgment defined below, against this prereg.

## Question (verbatim lineage)

2029 (sim-lqpersist-b): Lamb's Quarters persists (30,000–52,000 kcal)
while Cattail collapses, yet Cattail's net inflow-minus-draw
(+399,600 = 523,680 in − 107,040 meal-drawn − 17,040 other-drawn)
EXCEEDS LQ's (+273,500 = 396,750 − 105,750 − 17,500). Spoiled share
sits at 0.000 median for all channels: the sweep removes spoiled
stock between snapshots. The unmeasured sink was per-channel
spoil-removal volume. Spoilvol measured the sink but Cattail grew
on 0/8 fresh seeds; cattailband measured the Cattail sink on a
reuse band (336,480 kcal swept on 9761) but its pooled comparison
was barred by leg 3: Lamb's Quarters grew on only 1/8 reuse seeds
(9762), Cattail on 2/8 (9761, 9767). This arm resolves the barred
comparison one of the two ways the cattailband metric review
proposed — by screen first, then by exactly ONE chosen revision.

## Prior knowledge (what was known BEFORE this prereg — nothing more)

- sim-spoilvol-b + prereg and sim-cattailband-b + prereg
  (evidence/2026-10-26/), read before writing this prereg: the full
  code audit (bonus-aware isSpoiled boundary, sweepSpoiled as the
  sole pantry spoil path, pantryDraw skips spoiled), the
  (dried)-family ledger rule, and the bonus-aware horizon
  definitions are inherited unchanged.
- Cattailband's published supporting arithmetic (NOT judged here,
  recorded so this prereg's revision choice is transparent):
  pooled Cattail sweep 336,480 vs pooled LQ sweep 160,800 (ratio
  2.09); Cattail sweep share of Cattail (inflow − draws) 0.842.
  Per-seed: 9761 Cattail sweep 336,480 (64% of inflow 523,680;
  84% of inflow-minus-draws 399,600); 9762 LQ sweep 160,800 (41%
  of inflow 396,750; 59% of inflow-minus-draws 273,500).
- The case-study numbers above are ALREADY PUBLISHED. This arm's
  re-run (below) is a reproduction check, not a fresh measurement:
  the verdict is judged on THIS arm's own re-run numbers, and any
  difference from the published numbers is reported as base-move
  drift, never hidden. If this re-run's numbers differ, this
  re-run's numbers govern.

## Step 1 — the screen (done BEFORE this prereg, read-only, zero seeds)

Screen rule (fixed here): a band QUALIFIES iff, within ONE existing
committed corpus directory (one policy run), BOTH focal channels
grow on >= 2 seeds each, where "grows" = >= 1 inflow record on that
seed in that corpus's inflow records, counted with the recorder's
honesty rules (stock records only when kcal > 0; pantryAdd records
only when added === true). Corpus directories without an `inflows`
array carry no countable inflow picture and are excluded from the
screen (named below, not silently skipped).

Corpora screened (every evidence corpus directory carrying inflow
records at screen time; seed lists are the corpus's own seeds):

- sim-lqpersist-b-corpus (9760–9767, competent-nofeast):
  Cattail 2 [9761, 9767], LQ 1 [9762] — FAILS (LQ < 2).
- sim-lqpersist-b-corpus-confirm (9768–9779, competent-nofeast):
  Cattail 0, LQ 0 — FAILS.
- sim-spoilvol-b-corpus (9820–9827, competent-nofeast):
  Cattail 0, LQ 2 [9825, 9826] — FAILS (Cattail < 2).
- sim-cattailband-b-corpus (9760–9767 re-run, competent-nofeast):
  Cattail 2 [9761, 9767], LQ 1 [9762] — FAILS (same band as
  lqpersist pilot, re-observed; not an independent band).
- sim-gardenbar-b-corpus, sim-stock9762-b-corpus,
  sim-throttledays-b-corpus (all 9760–9767 re-observations,
  competent-nofeast): Cattail 2, LQ 1 each — FAIL.
- sim-driedpath-b-corpus (9820–9827 re-observation,
  competent-nofeast): Cattail 0, LQ 2 — FAIL.
- sim-inflow-b-corpus, sim-mealdraw-b-corpus,
  sim-mealdraw-reprereg-b-corpus, sim-mealdraw-reprereg-b-control-
  corpus, sim-preservesched-resid-b-corpus, sim-smoke-eq-b-corpus,
  sim-smoke-eq-b-control-corpus, sim-stockdoor-b-corpus (all
  9750–9757, competent-nofeast): Cattail 1 [9756], LQ 0 — FAIL.
- sim-gardenstate-b-corpus (9750–9757, competent-nofeast):
  Cattail 1 [9756], LQ 0 — FAIL.
- sim-smoke-eq-b-confirm-corpus,
  sim-smoke-eq-b-confirm-control-corpus (9780–9795,
  competent-nofeast): Cattail 0, LQ 4 [9786, 9788, 9792, 9794] —
  FAILS (Cattail < 2). Closest LQ picture anywhere; still no band.
- All other evidence corpus directories (2026-10-20/21/23/24/25
  corpora and the 2026-10-26 voice/pack/fish/racks corpora) carry
  no `inflows` array and are therefore not countable under this
  screen rule; none is claimed as a qualifying band.

SCREEN RESULT: NO qualifying both-grow band exists in any existing
committed corpus. The pooled comparison as originally barred has
no band to run on. Step 2 therefore applies the chosen revision
below. NO fresh band is screened and NO fresh seed is spent on
this arm, full stop — the screen above is the whole screen.

## Step 2 — the ONE revision chosen (and the one NOT chosen)

CHOSEN — revision (a) from the cattailband metric review: judge
the sink as a PAIRED SINGLE-SEED CASE STUDY — 9761 Cattail against
9762 LQ — with the single-seed caveat stated in the verdict
itself (CASE-DIAG, not pooled GO).

NOT CHOSEN — revision (b) (re-bar leg 3 as "each focal channel
grows on >= 1 seed with inflow >= 100,000 kcal" and judge leg 4 on
the pooled volumes): rejected because the pooled volumes would
still be a single-seed contrast in disguise — the LQ pool is one
seed (9762), and the Cattail pool is effectively one seed too
(9767 contributes 0 sweep on 2,880 inflow against 9761's 336,480
sweep). Re-barring the appearance leg without fixing the pooling
would re-label the same contrast, not repair it. The case-study
framing (a) names the limitation instead of lowering a bar past
it. Revision (b) is NOT judged here, in any form: no pooled ratio
or share is reported as a leg result in this arm's verdict (pooled
figures may appear only as clearly-labeled supporting arithmetic,
never as a pass).

## Substrate for the case study (reuse, not fresh)

- PAIRED REUSE of the lqpersist band 9760–9767, re-run with the
  spoilvol capture instrument into THIS arm's own corpus
  directory (evidence/2026-10-26/sim-bothgrow-b-corpus/). The
  re-run is a deterministic re-run of previously-run seed numbers
  under the same policy — no NEW seed number is spent. Neither the
  spoilvol corpus, the lqpersist corpus, nor the cattailband
  corpus is overwritten.
- Why re-run when cattailband already carries spoil records for
  this band: this arm's prereg requires appearance counts from
  ITS OWN re-run's inflow records (below), and an independent
  reproduction of the published sink numbers is the only check
  against base-move drift. The re-run costs 8 previously-run
  seeds; it spends zero fresh seeds.
- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Horizon: 100d, death-aware (run ends early if the village is
  lost; daysAlive reported per seed). Never a fixed 200d. Why
  100d: it matches spoilvol, lqpersist, and cattailband exactly,
  so the case-study volumes are comparable seed-for-seed with
  the published numbers.
- Base commit pinned: this worktree's HEAD before this prereg
  commit is e698421537c4123d5babc535fd04f7d4df81a71e (the
  cattailband coordinator evidence commit). The prereg commit
  hash is recorded by the proof; the sweep and det-gate run on
  the worktree's HEAD after the prereg commit, with no other
  commit in between. Any base move between prereg and sweep is
  reported, never hidden — a trajectory move is a finding, not
  a footnote.

## Instrument (DIAG only, no new capture code)

- Reuses UNCHANGED: scripts/sweep-spoilvol-b.js,
  scripts/spoilvol-capture.js, scripts/inflow-capture.js, and
  scripts/mealdraw-capture.js. No sibling capture file is
  modified. The sweep is invoked with SEEDS=9760..9767 and
  PERSEED_DIR=evidence/2026-10-26/sim-bothgrow-b-corpus.
- NEW scripts/analyze-bothgrow-b.js and scripts/test-bothgrow-b.js
  (proof). The analyzer prints: the screen table, determinism
  cross-check vs the cattailband corpus (per-seed per-channel
  inflow differences), the case-study legs, (dried)-family
  ledgers for the two case seeds, bonus statistics, violation
  totals, wall numbers, the sense block, and the 9761/9762
  day-by-day narratives. No game code is loaded by the analyzer;
  it is pure JSON arithmetic over the committed corpus.

## Definitions (fixed here, before judging — inherited from cattailband)

- Focal channels: Lamb's Quarters, Cattail, Burdock (item-name
  channels; names verbatim from records). All other channels are
  reported in the per-seed tables, not judged.
- Appearance (for the re-run's own records): a channel "grows"
  on a seed iff it has >= 1 inflow record (any door) on that seed
  IN THIS RE-RUN's records, counted with the honesty rules
  above. Appearance counts from this re-run are the arm's
  counts; any difference from the prior-knowledge inflow picture
  is reported as base-move drift, never hidden.
- Inflow / draws / sweep-removal: exactly as cattailband defined
  them (stock records only when kcal > 0; pantryAdd only when
  added === true; draws = units * kcalEach over pantryDraw
  records, meal vs 'other' contexts summed separately; sweep =
  pantry removed.byChannel kcal; pack/prep/corpse removals
  reported separately and NEVER added to pantry volume).
- Stock median snapshot basis (named explicitly, per the
  cattailband lesson): "median post-arrival day-end stock" =
  conventional median over day-end spoilDays snapshots with day
  >= first-inflow day of the channel on that seed. NEVER quote a
  stock median without this basis. The lqpersist "Cattail median
  3,600" is the POST-SWEEP FLOOR (the recurring standing pile
  after a big rot day), not the day-end median — the two are
  different statistics and are never interchanged in this arm.
- Bonus-aware horizons ONLY: a stack is spoiled iff
  spoilDay + spoilBonusDays() <= scholar day. A bar that
  measures raw spoilDay alone is FORBIDDEN. Judged ONLY on
  bonus-aware horizons.
- Case-study shares: share-of-inflow = sweep / inflow;
  share-of-uneaten = sweep / (inflow − draws), where draws =
  meal-drawn + other-drawn, all on the single case seed, base
  name only for the headline shares with the (dried)-family
  figures alongside (see below). The ledger is SUPPORTING, not
  a leg.

## CASE-DIAG metric (judged ONLY against this)

CASE-DIAG-SUPPORTS (the paired single-seed contrast supports the
sink hypothesis) iff ALL of:
  1. Neutrality / det-gate: a paired run of seed 9761 with
     SPOILVOL=0 vs SPOILVOL=1 produces identical inflow records,
     mealdraw records, death lists, and wall fields (spoilvol
     fields and `ms` excluded). Any mismatch is DIAG-NO-GO
     (instrument, not game).
  2. Sweep integrity: across all re-run sweeps, pantry
     removedNotSpoiledKcal == 0 AND pantry keptSpoiledKcal == 0.
     Any violation is DIAG-NO-GO, reported with counts, never
     re-scored as "close enough".
  3. Case-study contrast (9761 Cattail vs 9762 LQ, single seeds,
     from THIS re-run's records):
     (a) Cattail-9761 sweep share-of-uneaten exceeds LQ-9762
     sweep share-of-uneaten by >= 10 percentage points; AND
     (b) Cattail-9761 sweep kcal >= LQ-9762 sweep kcal.
  A miss on leg 3 is CASE-DIAG-NOT-SUPPORTS (measured, and the
  single-seed contrast does not support the sink hypothesis).
  A miss on leg 1 or 2 is DIAG-NO-GO (instrument failure, not a
  game verdict).
- The verdict is CASE-DIAG-SUPPORTS or CASE-DIAG-NOT-SUPPORTS or
  DIAG-NO-GO. It is NEVER a pooled GO, NEVER a NO-GO on the
  pooled bar, and it does NOT overturn, confirm, or replace the
  cattailband DIAG-NO-GO on the pooled bar, the spoilvol
  DIAG-NO-GO, or the lqpersist GO. The single-seed caveat is
  stated IN the verdict sentence itself.
- No re-scoring mid-run: no switching to revision (b), to
  pooled volumes as a leg, to Burdock-as-comparator, to means,
  to raw spoilDay, or to the published numbers if this re-run's
  numbers differ. Metric doubts go under "metric review" and
  propose the revision for the NEXT run.

## Confirm band: NONE

A case study is not a GO and takes no confirm. No confirm band
is spent, no fallback band is triggered, and no fresh seed is
spent under any outcome. The run ends with the case verdict.

## Secondary figures (reported, not judged)

- Per-seed per-channel tables for the re-run band (inflow,
  meal-drawn, other-drawn, sweep-removed, median post-arrival
  day-end stock with its basis named, first-appearance day).
- (Dried)-family ledgers for 9761 Cattail and 9762 LQ
  (base + ' (dried)'), alongside the base-name figures.
- Bonus distribution across re-run sweeps; bonus-saved standing
  piles as per-sweep median/max, never summed as volume.
- Pack/prep/corpse sweep-removal totals (secondary; never mixed
  into pantry volume) and the sweep-call count per seed.
- Wall numbers for the band (national / table / wins, wave 4/5
  reach, median survival, death-cause shares). Four-realm
  formation, Arc reach, trap acquisition, counter discovery/kill,
  young-link succession: reported ONLY if the corpus carries
  them; otherwise "not recorded in this corpus, not estimated".
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. Stated in the evidence file; the
  det-gate (leg 1) is the before/after comparison: identical
  records with the instrument off vs on.
- Determinism cross-check: per-seed per-channel inflow totals
  of this re-run vs the cattailband corpus (0 differing
  channels expected on all 8 seeds, per cattailband's own
  reproduction proof); any difference is base-move drift,
  reported with counts.

## Pilot gate

This 8-seed re-run IS the pilot (reuse, not fresh). No confirm
band is spent under any outcome. Never below 8 seeds for any
band.

## Sense (SENSE-TESTING LAW)

At least one spoil-voice sample quoted verbatim from THIS arm's
corpus (spoilSayLines: a real "threw out spoiled stores" line
with its day), judged in plain words. Plus per-channel
day-by-day narratives (arrived / eaten / rotted / standing) for
9761's Cattail and 9762's LQ, read from the inflow + draw +
sweep + day-end snapshot records together, so the case claim
reads as two village stories, not just two shares. If this
re-run's 9761 Cattail does not collapse as published, the
narrative reports what actually happened, never the published
story retold.

## Metric review

Every evidence file carries a "metric review" section
(MEASUREMENT.md section 14). If this metric proves wrong, the
revision is proposed there for the NEXT run — never re-scored
mid-run.
