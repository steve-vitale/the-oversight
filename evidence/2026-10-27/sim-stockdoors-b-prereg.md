# sim-stockdoors-b (2030Z) — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-27)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2030Z, axis
food-economy. Arm: the stockSurplus + direct-pantry-consumption ledger,
re-judged with the boundary-aware closing the 0530Z round explicitly
called for. Measurement only: zero src/js changes, no default flips, no
lever. This arm does NOT re-judge the 0049Z stockdoors NO-GO against its
own prereg — its verdict is ONLY whether the family ledgers close under
the boundary-aware closing defined here, on current master, with the
recorded doors. Judged ONLY against this prereg.

## Stale-premise disclosure (read before judging this arm's scope)

The coordinator brief for this arm says "build recorders for the
stockSurplus door and each bypass outflow." Those recorders ALREADY
EXIST, committed on this branch and landed at 0530Z:

- scripts/stockdoor-capture.js (stockSurplus recorder, from
  sim-stockdoor-b) + scripts/stockdoors-capture.js (direct-consumption
  snapshot-diff wrappers: npcTakeAction, npcChildAction depth-guarded,
  apPlaygroundRaid, useAbility, _evTakePantryKcal, takeFromPantry,
  takeFromPantryBulk), reused here UNCHANGED.
- scripts/sweep-stockdoors-b.js, scripts/analyze-stockdoors-b.js,
  scripts/test-stockdoors-b.js (0049Z arm, evidence/2026-10-26/
  sim-stockdoors-b.md, NO-GO on leg 3a: named-family rate 9/12 vs the
  80% bar; pooled named 0.245%, generic 0.198%, dried 0.70% all pass).

Rebuilding them would duplicate committed instrument code for no
measurement gain. This arm's NEW work is: (1) the boundary-aware
re-judgment the 0530Z metric review ordered ("the next ledger arm's
prereg must define the closing boundary explicitly ... before judging
any family ledger closed again"), via ONE pre-registered sweep addition
(a post-run final pantry snapshot, below); (2) a new boundary-aware
analyzer + proof; (3) the day-82/83 ~5,900 kcal non-draw-removal case
diagnostic (below). If the coordinator wanted a from-scratch rebuild,
that is a different arm; this prereg records the reuse decision openly
so it is judged, not hidden.

## Question (from the 0530Z round + backlog 1181/1182 + mealdraw-b)

- 0049Z stockdoors NO-GO stands as judged: leg 3a failed 9/12 vs 80%.
- 0530Z residualhunt GO established the failures are CLOSING-BOUNDARY
  artifacts, not missing doors: Muscadine 9824 (+1,800) and Burdock
  9824 (+1,800) are each exactly their day-100 meal draws, unreflected
  because the closing snapshot is taken before the day-100 meal draws
  settle; generic 9822 (+3,177) is one day-101 spoil sweep; Fish 9825
  (+2,016) is two day-101 sweeps. Its unified boundary model: residual
  = flows recorded after the closing snapshot. Its metric review
  orders the next arm to pre-register the boundary fix and re-judge.
- Mealdraw-b's open observation (the day-82/83 ~5,900 kcal case):
  ~5,900 kcal of spoilDay-81 fresh stacks vanish between the day-82
  and day-83 first-cook snapshots with only 555 kcal of recorded draws
  (candidates named there: the overnight spoil sweep under a stricter
  boundary than the meal's, or a non-pantryDraw removal path such as
  _evTakePantryKcal). That case lives on the mealdraw/stockdoor band
  (seed 9750 trajectory); it is a DIAGNOSTIC here, not the judged
  verdict (see "Case diagnostics" below).

## Calibration quoted from 0049Z stockdoors + 0530Z residualhunt

- Named focal family-seeds (inflow >= 10,000 kcal): 12 counted, 9 pass
  within 1% under the last-day-end closing; pooled residual 4,136 on
  pooled inflow 1,687,320 (0.245%). The 3 failures: Muscadine 9824
  +1,800 (1.29%), Burdock 9824 +1,800 (1.54%), Lamb's Quarters 9825
  +1,130 (2.32%, decomposed by residualhunt as base +1,250 day-100
  draws + dried −120, the −120 holding an −800 mid-run dried drop
  with no record in any of six instruments).
- Generic family-seeds: 8 counted, 7 pass; pooled 4,412 on 2,225,865
  (0.198%). Dried channel: pooled −5,456 on transformed post 774,536
  (0.70% vs the 2% bar).
- Boundary expectation (residualhunt's, NOT this run's verdict):
  once the boundary is accounted for, the 9824 pair flips and the
  rate goes 9/12 -> 11/12, with LQ 9825 at −120 net. This prereg does
  NOT assume that outcome on current master — the base has moved
  since 0049Z (c04d4e0cb and later), so trajectories differ and the
  legs are re-derived from scratch on this head.

## Band (substrate identical to 0049Z stockdoors, reused seeds as substrate)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9820–9827 REUSED as substrate (the driedpath /
  stockdoors pilot band — this arm re-runs the identical band with
  the boundary-aware closing added, so new-closing ledgers pair with
  the known doors; determinism on this head is checked by the
  det-gate, NOT by reproduction of the 0049Z corpus, because the base
  has moved). Reuse is stated, not hidden: these seeds are NOT fresh,
  and no freshness claim is made for them.
- Confirm seeds (ONLY if the pilot verdict is GO, see below):
  9730–9741 (12 seeds). Collision check done before this prereg
  (2026-10-27, `find evidence -name '*sNNNN*'` for each seed): NO
  evidence file for any of 9730–9741 exists in this worktree. That
  check covers filename collisions only; the prereg claims no
  broader freshness (other runs' out-of-repo scratch is not
  visible here). NOTE: the 0049Z confirm band 9768–9779 is NOT reused
  here — the 0530Z round records it as spent-but-unjudged for
  stockdoors purposes, so it is unavailable as a fresh confirm band.
- Horizon: 100d, death-aware (run ends early if the village is lost;
  daysAlive reported per seed). Never a fixed 200d.
- Base commit pinned: this worktree's HEAD at prereg-commit time is
  recorded by the proof (git rev-parse HEAD). The judged sweep runs
  on the prereg commit (tooling-only: prereg + the one sweep addition
  + new analyzer/proof, zero src/js); any base move between prereg
  and sweep is reported, never hidden.

## Instrument (DIAG only; reuse + one addition + new analysis)

- Reuses UNCHANGED: scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, scripts/spoilvol-capture.js,
  scripts/driedpath-capture.js, scripts/stockdoor-capture.js,
  scripts/stockdoors-capture.js, scripts/dedupspan-apply-b.js (the
  span-dedup wiring the current analyze-stockdoors-b.js already
  applies). No sibling capture file is modified.
- ONE addition to scripts/sweep-stockdoors-b.js (pre-registered
  here, committed with this prereg, before any judged sweep): after
  runDays returns, oneRun takes a post-run pantry snapshot via the
  already-installed spoilvol snapshotPantry() (a pure read: pantry
  stacks + isSpoiled checks, no Game.state write, no RNG use, no
  say/log write) and records it as `finalPantry` on the per-seed
  payload, alongside the existing openingStock and spoilDays. This
  is residualhunt's option A ("take the closing snapshot after the
  final day's flows settle"). The det-gate (leg 1) includes
  finalPantry in its comparison: it is present in BOTH the
  STOCKDOORS=0 and STOCKDOORS=1 runs, so any difference is a
  neutrality failure, not a free field.
- NEW scripts/analyze-stockdoors-b-2030.js: loads the judged corpus
  itself, calls the reused perSeed() from scripts/
  analyze-stockdoors-b.js for the NEW-definition components (inflow
  incl. stockSurplus, draws incl. drawSpoiled + direct with span
  dedup, sweep, transform loss, opening, last-day-end closing), then
  recomputes every residual against the FINAL closing:
  newResidual_ba = newResidual + (closingFinal − closingLastDayEnd)
  per family, and newDriedResidual_ba = newDriedResidual +
  (closingDriedFinal − closingDriedLastDayEnd) per family, where
  closingFinal sums finalPantry channels' freshKcal per family
  (dried names for the dried side). Algebra: this is exactly the
  residual with closing = post-run state and ALL recorded flows
  counted — no flow is excluded, no snapshot is re-timed. The
  analyzer ALSO prints the control legs under the last-day-end
  closing (the 0049Z definition) so the boundary effect is visible
  as a difference, never as a silent substitution.
- NEW scripts/test-stockdoors-b-2030.js (proof): det-gate
  byte-identical incl. finalPantry; corpus validity (8 files,
  policy fields, no truncation); independent recomputation of the
  boundary-aware legs from the corpus (not via the analyzer's
  printed numbers); verdict follows from legs; hygiene (0 src/js
  files modified, 0 sibling capture files modified, no modified
  tracked file outside this run's own files).
- Corpus: evidence/2026-10-27/sim-stockdoors-b-corpus/ (per-seed
  JSONs; pilot 8, plus confirm 12 iff the pilot is GO). The sweep
  is run with PERSEED_DIR set to this directory — its default
  (evidence/2026-10-26/sim-stockdoors-b-corpus/) MUST NOT be used,
  or it would overwrite the 0049Z corpus. The diagnostic seed-9750
  corpus goes to a SEPARATE directory (evidence/2026-10-27/
  sim-stockdoors-b-diag9750/) and is never mixed into the judged
  corpus.

## Snapshot basis (backlog 1179 — named for every stock figure)

- Opening stock: post-setupGame, pre-first-policy-day snapshot
  (spoilvol snapshotPantry). Basis: opening.
- Day-end stock: spoilDays entries, one per policy daily AFTER
  competent.daily (the 0049Z day-end basis). Basis: day-end.
- Closing stock (JUDGED): finalPantry, post-runDays snapshot.
  Basis: post-run. Control closing: last spoilDays entry. Basis:
  last day-end. These two bases are DIFFERENT numbers by design;
  every residual in this run names which closing it uses.
- All stock figures are FRESH kcal only (channels' freshKcal).
  Spoiled stock is excluded from opening/closing in both
  definitions: spoiled stock leaves via the spoil sweep, which is
  itself a counted ledger flow. Stock medians, if any are reported,
  use the conventional median (average of the two middle values
  for even n) over one named basis only, never mixed.

## Definitions (fixed here, before judging; inherited from 0049Z unless stated)

- Family of a channel name: strip a trailing ' (dried)' or
  ' (smoked)' once. ' (dried)' and ' (smoked)' variants of one
  base belong to ONE family.
- Focal families: Lamb's Quarters, Burdock, Muscadine Grapes,
  Purslane (NAMED set), and Foraged food (GENERIC set, judged
  separately). A focal family counts on a seed iff its family
  inflow (NEW definition) >= 10,000 kcal on that seed.
- NEW definition (inherited): inflow = three doors (stock,
  deposit, pantryAdd with their honesty rules) PLUS stockSurplus
  records (kcal > 0 only, family 'Foraged food'); draws =
  pantryDraw records PLUS drawSpoiled records PLUS direct-
  consumption records (all paths, span-dedup applied by the
  reused perSeed); sweep = spoilvol pantry removed byChannel;
  transform loss = driedpath loss (portion rule: in-place preKcal
  = post.units x pre.kcalEach).
- Family residual (either closing): (closing − opening) −
  (inflow − draws − sweep − transformLoss). Boundary-aware
  residual uses closing = finalPantry; control residual uses
  closing = last day-end snapshot.
- Dried-channel residual (either closing): (closingDried −
  openingDried) − (transformedPost + driedInflow − driedDraws −
  driedSweep), with driedDraws under the NEW definition (direct
  records on dried names + drawSpoiled items on dried names
  included).
- Family residual share: |residual| / family inflow (NEW
  definition; boundary-aware closing for judged legs).
- Per-family-seed pass: a counted focal family-seed passes iff
  its |boundary-aware residual| is within 1% of its family inflow.

## PRIMARY metric (judged ONLY against this)

GO (the recorded doors close the family ledgers once the closing
boundary is defined as post-run) iff ALL of:
  1. Neutrality / det-gate: a paired run of one pilot seed with
     STOCKDOORS=0 vs STOCKDOORS=1 produces identical inflow
     records, mealdraw records, spoilvol records, driedpath
     records, finalPantry, death lists, and wall fields
     (stockdoors fields and `ms` excluded from the comparison).
     Any mismatch is DIAG-NO-GO (instrument, not game).
  2. Coverage: (a) stockSurplus records with kcal > 0 appear on
     >= 7/8 pilot seeds; (b) the direct recorder's per-path
     call counts and record counts are reported for EVERY
     wrapped path — a path with zero records is reported as
     zero, and NO path is claimed that is not in wrappedPaths;
     (c) the reused driedpath instrument still sees its path on
     this head: transformation events on >= 7/8 pilot seeds and
     linked transformed post-kcal >= 95% of total transformed
     post-kcal pooled. Any failure of (a) or (c), or any
     claimed-but-unwrapped path, is DIAG-NO-GO.
  3. Named-family closure (BOUNDARY-AWARE): (a) per-family-seed
     pass RATE over NAMED focal family-seeds >= 80% (each
     counted family-seed within 1% of its family inflow under
     the post-run closing), AND (b) pooled |boundary-aware
     named family residual| within 1% of pooled named focal
     family inflow. A miss is NO-GO.
  4. Generic-family closure (BOUNDARY-AWARE, judged SEPARATELY,
     never folded into leg 3 and never dropped): (a) pass RATE
     over GENERIC focal family-seeds >= 80% within 1% under the
     post-run closing, AND (b) pooled |boundary-aware generic
     family residual| within 1% of pooled generic focal family
     inflow. A miss is NO-GO.
  5. Dried-channel closure (BOUNDARY-AWARE): pooled
     |boundary-aware dried-channel residual| across all focal
     family-seeds (named + generic) within 2% of pooled
     transformed post-kcal. A miss is NO-GO alongside legs 3–4,
     reported separately.
A miss on leg 1 or 2 is DIAG-NO-GO (instrument failure, not a
game verdict). A miss on leg 3, 4, or 5 is NO-GO (measured, and
the ledgers do not close as barred) — never re-scored against a
friendlier metric mid-run (no dropping the generic family, no
switching to last-day-end residuals, no single-seed rescue, no
ignoring unlinked events, no reverting to the OLD draw
definition, no excluding day-100/day-101 flows from the
boundary-aware ledger — the post-run closing counts them by
construction). Metric doubts go under "metric review" and propose
the revision for the NEXT run.

## Case diagnostics (reported, NOT judged — they cannot change the verdict)

- (a) Analogue procedure (on the judged band): for each pilot
  seed, for each record-day, sum the non-draw removals dated
  that day (spoil sweep pantry kcal + direct-consumption kcal,
  all paths) and report the seed's largest such day with its
  door split (sweep vs each direct path) and its largest
  single-family component. The band's largest such day is the
  day-82/83 ~5,900 kcal case's analogue on this band, named by
  this procedure in advance — not by picking a seed after
  seeing the numbers. Attribution is door-by-door from records
  alone; an unattributed remainder is reported as unattributed,
  never assigned to a candidate door by elimination alone.
- (b) Seed-9750 diagnostic (single seed, same instrument,
  SEPARATE corpus dir, never judged): run seed 9750 on current
  master and report, for days 82–83, the non-draw removals by
  door (spoil sweep, event-take, other direct paths) and the
  recorded draws, plus whether a ~5,900-scale removal appears.
  Caveats stated up front: the mealdraw window was
  first-cook-snapshot to first-cook-snapshot, while this
  instrument's windows are day-end snapshots + record days, so
  exact reproduction of the old window is NOT expected; and the
  9750 trajectory has moved since the mealdraw era (journey r53
  moved 9750 wave 3→2 per backlog 1156), so a non-reproduction
  is a base fact, not a failure. The diagnostic answers which
  door, if any, carries ~5,900-scale non-draw removals on days
  82–83 on current master — nothing more.

## Confirm band (ONLY if the pilot verdict is GO)

If the pilot is NO-GO or DIAG-NO-GO, no confirm band is spent —
the run ends with that verdict. If the pilot is GO, run seeds
9730–9741 (12 seeds) with the identical instrument and band
(including the finalPantry addition), then report the same
legs on the confirm band as CONFIRM-GO / CONFIRM-NO-GO /
CONFIRM-DIAG. The confirm NEVER overrides the pilot verdict:
the verdict is the pilot's GO/NO-GO/DIAG; the confirm is
reported alongside.

## Secondary figures (reported, not judged)

- Per-seed per-family tables under BOTH closings: opening,
  inflow (3-door / stockdoor split), draws (pantryDraw /
  drawSpoiled / direct-by-path split), sweep, transformed
  pre/post/loss, closing (last-day-end and post-run), residual
  (both closings), residual share — for focal families and
  every other family with inflow >= 10,000 kcal.
- Direct-consumption census: per-path call counts, record
  counts, total kcal, by family; event-take retMismatch count
  (must be 0 — any mismatch is a finding, reported not judged);
  useAbility keys that moved the pantry, each separately.
- StockSurplus totals per seed: calls, give, stored, cap
  refusals (kcal 0 records), final remainder bound (< 200 kcal,
  reported as a bound, never as a flow).
- Dried-channel ledgers under both closings.
- Opening stock per seed (total + staple split, as driedpath:
  Rice 13,000, Dried beans 12,000, Dried meat 8,800, Canned soup
  7,500, Peanuts 5,950 = 47,250 on the old band — re-derived on
  this head, never assumed).
- Wall numbers for the band (national / table / wins, wave 4/5
  reach, median survival, death-cause shares). Four-realm
  formation, Arc reach, trap acquisition, counter discovery/kill,
  young-link succession: reported ONLY if the corpus carries
  them; otherwise "not recorded in this corpus, not estimated".
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. Stated in the evidence file; the
  det-gate (leg 1) is the before/after comparison: identical
  records with the instrument off vs on. The before/after that
  DOES exist is instrument before/after: 0049Z last-day-end
  ledgers vs this run's post-run-closing ledgers — reported via
  the control ledger.

## Pilot gate

This 8-seed band IS the pilot. No confirm band is spent unless
the pilot verdict is GO (see above). Never below 8 seeds for
any band.

## Sense (SENSE-TESTING LAW)

At least one direct-consumption event quoted narratively from
the corpus (one pantry eat / raid / lift, or if the band
records none of the three named paths, one stockSurplus night
traced gross-to-surviving-pile) — what the village did, what
the record shows, judged in plain words: does the flow read as
people behavior (a named eater, a named reason, a named
consequence)? Plus one stockSurplus night quoted with its
give/stored split, and one smoke-rack say line quoted verbatim.

## Metric review

Every evidence file carries a "metric review" section
(MEASUREMENT.md section 14). If this metric proves wrong, the
revision is proposed there for the NEXT run — never re-scored
mid-run.
