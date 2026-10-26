# sim-spoilvol-b — PRE-REGISTRATION (written BEFORE any new sweep, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2130Z, axis
food-economy. Arm: the 2029Z run's next blank (2) — per-channel
SPOIL-REMOVAL VOLUME via sweep-path capture. Measurement only: zero
src/js changes, no default flips, no lever. This arm does NOT re-judge
the 1930Z NO-GO or the 2029 post-arrival GO — its verdict is ONLY
whether spoil-removal volume explains the Cattail collapse. Judged
ONLY against this prereg.

## Question (verbatim from the 2029 evidence + metric review)

2029 (sim-lqpersist-b): Lamb's Quarters persists (30,000–52,000 kcal)
while Cattail collapses, yet Cattail's net inflow-minus-draw
(+399,600 = 523,680 in − 107,040 meal-drawn − 17,040 other-drawn)
EXCEEDS LQ's (+273,500 = 396,750 − 105,750 − 17,500). Median stock:
Cattail ~3,600 (post-arrival) vs LQ 34,150. Spoiled share sits at
0.000 median for all channels, so spoiled stock never lingers long
enough to be snapshotted: the sweep removes it between snapshots.
The unmeasured sink is per-channel spoil-removal volume — kcal
leaving the pantry without a recorded draw. This arm measures it.

## Prior knowledge (what was known BEFORE this prereg — nothing more)

- The 2029 numbers above, from evidence/2026-10-26/sim-lqpersist-b.md
  and its prereg (read before writing this prereg), plus
  evidence/2026-10-26/sim-stock9762-b.md if present (read: the
  stock9762 band is the same 9760–9767 band; no new numbers taken
  from it for this bar).
- Code facts read before writing this prereg (not new data):
  - BONUS-AWARE HORIZON (the boundary the game eats by):
    `Game.isSpoiled(it)` returns true iff
    `spoilDay + spoilBonusDays() <= scholar day`
    (src/js/food.js isSpoiled, lines ~2586–2589; spoilBonusDays,
    ~2594–2597, reads modTarget('food.spoilage_days', 0) — the
    preservation_instinct shelf-life bonus). The bonus-aware
    horizon of a stack is therefore
    `spoilDay + spoilBonusDays() - day`, and a stack is spoiled
    iff its bonus-aware horizon is <= 0. A bar that measures raw
    spoilDay alone is FORBIDDEN by the 2029 metric review: raw
    spoilDay is unmeasured, not refuted, because the game eats
    bonus-aware. This prereg judges ONLY on bonus-aware horizons.
    Note: spoilDay as recorded is post-granary (pantryAdd adds the
    granary shelving bonus into spoilDay, food.js pantryAdd) —
    the capture records spoilDay as stored, plus the sweep-time
    spoilBonusDays() separately, so the two bonuses are never
    conflated.
  - THE SWEEP PATH: `Game.sweepSpoiled()` (src/js/food.js,
    ~2668–2691) runs at dawn from endDay (src/js/game.js,
    ~31553). Its village-pantry branch splices every pantry stack
    for which isSpoiled is true and re-derives pantryKcal. It also
    sweeps the scholar pack, the prep counter, and corpse
    inventories (corpses with bonus 0 — "the earth doesn't grade
    on technique").
  - PANTRYDRAW SKIPS SPOILED: `Game.pantryDraw` (src/js/game.js,
    ~28630) filters candidates to `!isSpoiled(item)` and never
    removes a spoiled stack. So a spoiled pantry stack leaves ONLY
    via the sweep — the capture's identity checks (below) prove
    this per sweep instead of assuming it.
  - Code audit for OTHER removal paths (recorded here, before any
    sweep; negative results are results):
    - putAwayFinished (food.js): discards spoiled items on the
      PREP COUNTER, never pantry stock — not a pantry sink.
    - cleanCarcass / preserveFood dropRotten (food.js): scholar
      inventory / prep counter only — not a pantry sink.
    - pantryAdd (food.js): refuses only on cap overfill; removes
      nothing.
    - Non-spoil pantry removals (NOT counted in spoil volume, named
      as ledger-residual sources): alien pantry raids
      (alienPlayers.js pantry raid, takes real pieces, voiced),
      Light Fingers lifts (abilityActions.js, pack transfer),
      and pantryDraw consumption itself (recorded by mealdraw).
    - Direct pantry pushes (starting stock, tribute, raid spoils,
      favor repayments, league draws) bypass the three inflow
      doors (inflow-capture header) — a named limitation on the
      inflow side of the ledger, not on the sweep side.
    - No other `v.pantry.splice` spoil path exists in src/js
      (grep: only sweepSpoiled's pantry branch splices on
      spoilage; other splices are draw consumption or theft).
    - Conclusion of the audit: sweepSpoiled's pantry branch is the
      SOLE pantry spoil-removal path. The capture measures exactly
      it, and the per-sweep violation checks below verify it.

## Band (substrate identical to lqpersist, fresh seeds)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9820–9827 (8 seeds; this band IS the pilot).
- Confirm seeds (ONLY if the pilot verdict is GO, see below):
  9828–9839 (12 seeds).
- Horizon: 100d, death-aware (run ends early if the village is lost;
  daysAlive reported per seed). Never a fixed 200d.
- SEED FRESHNESS (verified before writing this prereg, recorded):
  - 9820–9827: 0 hits in evidence/2026-10-26/*.md, 0 files in any
    evidence/2026-10-26/*corpus*/ directory.
  - 9828–9839: 0 hits in evidence/2026-10-26/*.md, 0 files in any
    evidence/2026-10-26/*corpus*/ directory.
  - Other-date .md hits for 9820–9827 are non-seed numbers only
    (statistics, line counts, quoted dialogue) — no seed-band use
    on any other date.
  - 9780–9795 (reserved mealdraw confirm band) NOT spent: the
    mealdraw-reprereg pilot gate forbids its confirm spend, and no
    9780+ corpus file exists. This arm does not touch it.
  - The lqpersist bands 9760–9767 / 9768–9779 are NOT reused: this
    arm's question needs a fresh band (paired reuse is not claimed;
    the 2029 numbers above are the prior-knowledge comparator, not
    a paired control).
- Base commit pinned: this worktree's HEAD at prereg time is recorded
  by the proof (git rev-parse HEAD); if the base moves before the
  sweep, the sweep re-runs from the new HEAD and the evidence names
  the new HEAD — a trajectory move is reported, never hidden.

## Instrument (DIAG only, new files only)

- Reuses UNCHANGED: scripts/inflow-capture.js (three pantry doors:
  stock / deposit / pantryAdd; pantryAdd counts only when
  added===true; stock counts only kcal>0) and
  scripts/mealdraw-capture.js (pantryDraw records: context, items
  with name/kcalEach/units/effectiveKcal). No sibling capture file
  is modified.
- NEW scripts/spoilvol-capture.js, installed AFTER loadGame, BEFORE
  setupGame. It wraps Game.sweepSpoiled once: snapshots the pack,
  prep counter, village pantry, and corpse inventories BEFORE the
  call, delegates with identical arguments, `this`, and return
  value, snapshots AFTER, and records the delta. It reads state,
  writes ONLY to the caller's arrays. No Game.state write, no RNG
  consumption, no say/log write. Per sweep it records: day,
  spoilBonusDays(), per-container removed {totalKcal, stacks,
  byChannel, detail (channel, kcalEach, units, kcal, spoilDay,
  bonus, rawHorizon, bonusHorizon, spoiled, foodState, foodKind)},
  per-container violation checks {removedNotSpoiledKcal/stacks,
  keptSpoiledKcal/stacks}, per-container bonus-saved {totalKcal,
  stacks, byChannel} (post-sweep stacks with raw horizon <= 0 but
  bonus-aware horizon > 0 — food the raw clock calls rotten that
  the game still counts fresh), pre/post spoiled pantry kcal.
  Identity matching is exact: sweepSpoiled splices whole stacks,
  never partial units.
- NEW scripts/sweep-spoilvol-b.js (same band/env assertions,
  death/wall capture as sweep-lqpersist-b.js, plus inflow +
  mealdraw + spoilvol recorders, day-end spoilvol snapshots, and a
  spoil-voice say recorder gated by the same SPOILVOL flag so the
  det-gate compares the full instrument on/off). Corpus:
  evidence/2026-10-26/sim-spoilvol-b-corpus/ (per-seed JSONs;
  pilot 8, plus confirm 12 iff the pilot is GO).
- NEW scripts/analyze-spoilvol-b.js and scripts/test-spoilvol-b.js
  (proof). The analyzer prints: per-seed per-channel inflow,
  draws, sweep-removal, stock trajectory, the GO legs, the
  ledger residuals, bonus statistics, violation totals, appearance
  counts, the sense block, and wall numbers.
- Median rule (named explicitly): conventional median — average of
  the two middle values for even n. "Median across sweeps" of a
  per-sweep statistic means the conventional median of that
  statistic's per-sweep values.

## Definitions (fixed here, before judging)

- Focal channels: Lamb's Quarters, Cattail, Burdock (item-name
  channels; names verbatim from records). All other channels are
  reported in the per-seed tables, not judged.
- Appearance: a channel "grows" on a seed iff it has >= 1 inflow
  record (any door) on that seed. Appearance counts per channel
  are reported for all 8 pilot seeds. A channel that never appears
  is a FINDING, not a zero: its spoil-removal is unmeasured, and
  the appearance leg below handles it (see leg 3 note).
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
  is SUPPORTING, not a GO leg (see below).

## PRIMARY metric (judged ONLY against this)

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
revision for the NEXT run.

## Confirm band (ONLY if the pilot verdict is GO)

If the pilot is NO-GO or DIAG-NO-GO, no confirm band is spent —
the run ends with that verdict. If the pilot is GO, run seeds
9828–9839 (12 seeds) with the identical instrument and band, after
re-verifying that band fresh (0 .md hits, 0 corpus files) and
recording the re-check; then report the same legs on the confirm
band as CONFIRM-GO / CONFIRM-NO-GO / CONFIRM-DIAG. The confirm
NEVER overrides the pilot verdict: the verdict is the pilot's
GO/NO-GO/DIAG; the confirm is reported alongside.

## Secondary figures (reported, not judged)

- Per-seed per-channel tables: inflow, meal-drawn, other-drawn,
  sweep-removed, median post-arrival stock, first-appearance day,
  appearance flag — for Lamb's Quarters, Cattail, Burdock, and
  every other channel with inflow >= 10,000 kcal on that seed.
- Bonus distribution across pilot sweeps (median, min, max of
  spoilBonusDays()); bonus-saved kcal per focal channel; removed
  stacks' bonus-aware horizon distribution (all <= 0 by
  construction — violations counted in leg 2) and raw-horizon
  distribution (how many removed stacks the raw clock would ALSO
  have called rotten vs bonus-window stacks).
- Pack/prep/corpse sweep-removal totals (secondary; never mixed
  into pantry volume) and the sweep-call count per seed.
- Ledger residuals per focal channel per seed, with named causes
  where a voice line or door limitation fits.
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

This 8-seed band IS the pilot. No confirm band is spent unless the
pilot verdict is GO (see above). Never below 8 seeds for any band.

## Sense (SENSE-TESTING LAW)

At least one spoil-voice sample quoted verbatim from the corpus
(spoilSayLines: a real "threw out spoiled stores" line with its
day), judged in plain words: does the village's spoil behavior
read as people behavior (naming the loss, naming the fix, or
muttering about the smoke rack)? Plus one per-channel day-by-day
narrative (arrived / eaten / rotted / standing) for one seed
where a focal channel both arrives and rots, read from the
inflow + draw + sweep + day-end snapshot records together, so
the sink claim reads as a village story, not just a ratio.

## Metric review

Every evidence file carries a "metric review" section (MEASUREMENT.md
section 14). If this metric proves wrong, the revision is proposed
there for the NEXT run — never re-scored mid-run.
