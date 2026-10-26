# sim-driedpath-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T2309Z, axis
food-economy. Arm: the (dried) transformation-path blank named in the
spoilvol metric review. Measurement only: zero src/js changes, no
default flips, no lever. This arm does NOT re-judge the spoilvol
DIAG-NO-GO — its verdict is ONLY whether the (dried) transformation
path, once instrumented, closes the family ledgers. Judged ONLY
against this prereg.

## Question (verbatim from the spoilvol evidence + metric review)

Spoilvol (evidence/2026-10-26/sim-spoilvol-b.md, read before writing
this prereg) found every "(dried)" variant holds real pantry stock
with ZERO inflow-door records: family ledgers (base + ' (dried)')
close to 0.1% on one family-seed (9826 Lamb's Quarters: 410 kcal
residual on 359,700 inflow) but the transformation itself —
whatever renames or re-states pantry stacks into dried variants
(preservation/racks) — has no door record. Its metric review names
the next arm: instrument the (dried) transformation path, plus
opening stock for generic channels, before judging any family
ledger closed. This arm is that arm.

## Calibration quoted from spoilvol (the bar must beat this)

- 9826 Lamb's Quarters family: inflow 359,700, draws 53,010, sweep
  276,880, net 29,810, last stocks 3,600 + 25,800, family residual
  −410 kcal = 0.11% of inflow — WITHOUT the transformation path
  captured and WITHOUT opening stock (LQ first-appearance day >= 10
  on that seed, so opening stock is not its explanation).
- Burdock family (9822): residual −7,101 on 159,030 inflow (4.5%),
  Muscadine Grapes family (9821): +10,207 on 151,830 (6.7%) — same
  missing-path shape, larger, in both directions.
- Generic "Foraged food" does NOT close for a different named
  reason: it holds the village's STARTING pantry stock (a direct
  push bypassing all three inflow doors) and is drawn far beyond
  recorded inflow on every seed (residuals +52,960 to +287,658).

## Prior knowledge: the transformation path in code (read before writing this prereg, not new data)

- THE COOK'S SMOKE RACKS (src/js/game.js, villager task 'cook'
  inside resolveOneAssignment, ~line 7070): the cook's haven duty
  actually works the racks. Eligible pantry stacks are fresh,
  unbonded, not already preserved/rendered, not pemmican, not
  keepsake, with a finite spoilDay no more than 2 days out and
  not already spoiled at the raw (bonus=0) boundary. A dinner
  reserve (~250 kcal x roster) of soonest-spoiling stock stays
  fresh; the excess beyond the reserve, up to a ~4,000 kcal
  budget per cook resolution, is converted IN PLACE: kcalEach
  scaled by 0.80 (blind) or 0.95+0.02*skill capped 1.0 (preserver),
  foodState set to 'preserved', spoilDay reset to day+shelf
  (15 blind / 30+5*skill), name suffixed ' (dried)' — or
  ' (smoked)' when the name contains 'fish'. Partial stacks are
  SPLIT (a copy keeps the fresh share; the remainder converts),
  and budget-limited stacks are split the same way. A racks-full
  guard (preserved stock >= 125 x roster x (shelf−2)) shuts the
  racks unless FOODLEVER_R5=1 (off on this band). The cook's say
  line names the work ("worked the smoke racks too — N batches
  preserved (~K kcal...)").
- THE PLAYER'S preserveFood (src/js/food.js ~870): smoking/drying
  on the scholar's own inventory (meat only, cleaned/cooked):
  foodState 'preserved', spoilDay day+30/15, name suffixed
  ' (smoked)' — this path touches the pack/prep, NOT the village
  pantry directly, so a pantry (dried) stock with no inflow door
  cannot come from it unless the scholar first deposits the
  preserved stack (which the deposit door WOULD record). The
  recorder wraps it anyway as a completeness check: any
  player-preserved stack later deposited must appear as a dried
  inflow record, and the analyzer counts such records.
- CANON: docs/CANON.md + docs/PRESERVATION.md (ladder cleaned 2d
  < cooked 5d < smoked 30d < rendered 90d < pemmican 120d;
  "rot can't be smoked back into food" — the racks skip already-
  spoiled stacks, matching the code's raw-boundary skip).
  Nothing invented: the racks path above is the code, quoted.

## Reproduction (on the committed spoilvol corpus, before this prereg — NOT a judged sweep)

Recomputed from evidence/2026-10-26/sim-spoilvol-b-corpus/ (8
files, seeds 9820–9827) before writing this prereg: on ALL 8
seeds, zero inflow records carry a ' (dried)' or ' (smoked)'
name, while every seed holds real dried/smoked day-end stock
(e.g. 9826 last day: Lamb's Quarters (dried) 25,800, Foraged
food (dried) 18,339; 9827: Purslane (dried) 25,470; 9821:
Muscadine Grapes (dried) 21,360). The phenomenon is there;
the instrument is warranted. If it had not reproduced, this
arm would have stopped here.

## Band (substrate identical to spoilvol, reused seeds as substrate)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9820–9827 REUSED as substrate (the spoilvol pilot
  band — this arm re-runs the identical band with the new
  recorder added, so transformation events pair with the known
  ledgers; determinism means inflow/draw/sweep records must
  reproduce the spoilvol corpus counts, checked by the proof).
  Reuse is stated, not hidden: these seeds are NOT fresh, and
  no freshness claim is made for them.
- Confirm seeds (ONLY if the pilot verdict is GO, see below):
  9768–9779 (12 seeds, the lqpersist confirm band — the natural
  second substrate, in the same lqpersist family as 9760–9767
  where Lamb's Quarters and Cattail both grew; stated here, not
  chosen after the pilot).
- Horizon: 100d, death-aware (run ends early if the village is
  lost; daysAlive reported per seed). Matches spoilvol; never a
  fixed 200d.
- Base commit pinned: this worktree's HEAD at prereg-commit
  time is recorded by the proof (git rev-parse HEAD); if the
  base moves before the sweep, the sweep re-runs from the new
  HEAD and the evidence names the new HEAD — a trajectory move
  is reported, never hidden.

## Instrument (DIAG only, new files only)

- Reuses UNCHANGED: scripts/inflow-capture.js, scripts/mealdraw-
  capture.js, scripts/spoilvol-capture.js (day-end snapshots +
  sweep removals, same as spoilvol). No sibling capture file is
  modified.
- NEW scripts/driedpath-capture.js, installed AFTER loadGame,
  BEFORE setupGame. It wraps Game.resolveOneAssignment once and
  Game.preserveFood once. Each wrapper snapshots the village
  pantry (resolveOneAssignment) or the pack/prep/pantry
  (preserveFood) BEFORE the call, delegates with identical
  arguments, `this`, and return value, snapshots AFTER, and
  records the delta. It reads state, writes ONLY to the caller's
  arrays. No Game.state write, no RNG consumption, no say/log
  write. Per transformation event it records: day, path
  ('cook-racks' | 'cook-racks-split' | 'player-preserve' |
  'other-task'), villager id + display name (cook-racks) or
  'player', before {name, kcalEach, units, kcal, foodState,
  spoilDay}, after {same}, preKcal, postKcal, lossKcal
  (pre − post), and for split-created stacks the linked source
  (pre stack with the same base name whose units fell by the
  split amount; 'unlinked' when no such source exists, counted
  separately). A transformation is: same live stack whose name
  gains ' (dried)'/' (smoked)' or whose foodState becomes
  'preserved', OR a new live stack with foodState 'preserved'
  and a dried/smoked name. Fresh-share split copies (base name,
  not preserved) are NOT events. The recorder also exports
  snapshotPantry() for the sweep's OPENING stock snapshot
  (taken after setupGame, before the first policy day) and a
  smoke-rack say recorder (Game.say lines mentioning 'smoke
  racks', gated by the same DRIEDPATH flag so the det-gate
  compares the full instrument on/off).
- NEW scripts/sweep-driedpath-b.js (same band/env assertions,
  death/wall capture as sweep-spoilvol-b.js, plus inflow +
  mealdraw + spoilvol + driedpath recorders, day-end snapshots,
  opening-stock snapshot, smoke-rack say lines). Corpus:
  evidence/2026-10-26/sim-driedpath-b-corpus/ (per-seed JSONs;
  pilot 8, plus confirm 12 iff the pilot is GO).
- NEW scripts/analyze-driedpath-b.js and scripts/test-driedpath-b.js
  (proof). The analyzer prints: per-seed per-family ledgers
  (base-only residual AND family residual with transformation
  loss + opening stock), dried-channel ledgers, transformation
  event totals + linked/unlinked shares, opening stock, GO legs,
  wall numbers, and the sense block.
- Median rule (named explicitly): conventional median — average
  of the two middle values for even n.

## Definitions (fixed here, before judging)

- Family of a channel name: strip a trailing ' (dried)' or
  ' (smoked)' once; the base name is the family. ' (dried)' and
  ' (smoked)' variants of one base belong to ONE family (the
  cook's verb follows the food; the rung is one — code comment
  at the racks).
- Focal families: Lamb's Quarters, Burdock, Muscadine Grapes,
  Purslane, Foraged food (generic, opening-stock test). A
  focal family counts on a seed iff its family inflow >= 10,000
  kcal on that seed (same 10k reporting floor as spoilvol).
- Inflow / draws / sweep-removal: exactly spoilvol's
  definitions (inflow doors with their honesty rules; draws =
  physical units x kcalEach over mealdraw items, meal + other
  summed; sweep = spoilvol pantry removed byChannel). Dried
  inflow records (if any) belong to their family and to the
  dried-channel ledger.
- Transformed pre/post/loss of family F on seed S: sum over
  driedpath events whose before-name family is F of preKcal /
  postKcal / lossKcal. Split-created events count their new
  stack's postKcal with preKcal = postKcal / mult? NO — split
  events record preKcal as the source stack's pre-conversion
  kcal for the split units (units x source kcalEach before
  conversion), recovered from the linked source; unlinked split
  events record preKcal = null and are EXCLUDED from loss sums
  but INCLUDED in transformed-post sums, with their share
  reported (see leg 2).
- Opening stock of family F on S: the opening-snapshot pantry
  kcal summed over base + dried/smoked names of F (fresh only;
  spoiled opening stock is reported separately and never in
  the ledger — spoiled stock leaves via the sweep, which is
  already counted).
- Closing stock of family F on S: the LAST day-end snapshot's
  freshKcal summed over base + dried/smoked names of F.
- Family residual of F on S: (closing − opening) − (inflow −
  draws − sweep − transformLoss). Zero means inflow, draws,
  sweep, transformation loss, and opening stock fully explain
  the stock change. Nonzero residuals are reported per
  family-seed and attributed only when a named cause fits
  (raid voice line, direct-push inflow, cap refusal).
- Dried-channel residual of F on S: (closingDried − openingDried)
  − (transformedPost + driedInflow − driedDraws − driedSweep).
  Zero means the recorder's transformation events fully explain
  the dried stock.
- Family residual share: |residual| / family inflow (inflow 0
  with stock movement is reported as a finding, never a share).

## PRIMARY metric (judged ONLY against this)

GO (the transformation path is captured and the family ledgers
close) iff ALL of:
  1. Neutrality / det-gate: a paired run of one pilot seed with
     DRIEDPATH=0 vs DRIEDPATH=1 produces identical inflow
     records, mealdraw records, death lists, and wall fields
     (driedpath fields and `ms` excluded from the comparison;
     spoilvol fields present in both runs and identical too).
     Any mismatch is DIAG-NO-GO (instrument, not game).
  2. Coverage: (a) transformation events are recorded on >= 7/8
     pilot seeds; (b) NO seed holds dried/smoked day-end stock
     while recording zero transformation events; (c) linked
     transformed post-kcal is >= 95% of total transformed
     post-kcal pooled across the pilot (unlinked splits are a
     gap, not a rounding). Any failure is DIAG-NO-GO (the
     instrument does not see the path it claims to measure).
  3. Family closure — STRICTER THAN THE SPOILVOL CALIBRATION
     IN TWO STATED WAYS: (a) BREADTH: the 0.11% single
     family-seed close (9826 LQ, without the path) must now
     hold as a per-family-seed bar — |family residual| within
     1% of family inflow on at least 6/8 pilot seeds, where a
     seed counts iff it has at least one focal family with
     inflow >= 10,000 kcal and that family's residual is
     within 1% (seeds are counted per their focal families:
     a seed passes iff ALL its focal families with inflow
     >= 10k close within 1%; the bar is per-family-seed, and
     the 6/8 count is over seeds); AND (b) POOLED STRICTNESS
     WITH THE PATH ACCOUNTED: pooled |family residual| across
     all focal family-seeds within 1% of pooled focal family
     inflow, WITH transformation loss and opening stock in the
     ledger (the spoilvol 0.11% was achieved WITHOUT either —
     matching or beating a 1% pooled bar WITH both accounted
     is a stronger claim because the loss term is now measured,
     not absorbed into the residual). A miss on leg 3 is NO-GO
     (measured, and the ledgers do not close as barred) — never
     re-scored against a friendlier metric mid-run (no dropping
     the generic family, no switching to base-only residuals,
     no single-seed rescue, no ignoring unlinked events).
  4. Dried-channel closure: pooled |dried-channel residual|
     across all focal family-seeds within 2% of pooled
     transformed post-kcal. (The dried channel has no inflow
     door at all, so 2% — looser than leg 3's 1% — is the
     honest bar for a channel explained ONLY by the new
     recorder; a miss is NO-GO alongside leg 3, reported
     separately.)
A miss on leg 1 or 2 is DIAG-NO-GO (instrument failure, not a
game verdict). Metric doubts go under "metric review" and
propose the revision for the NEXT run.

## Confirm band (ONLY if the pilot verdict is GO)

If the pilot is NO-GO or DIAG-NO-GO, no confirm band is spent —
the run ends with that verdict. If the pilot is GO, run seeds
9768–9779 (12 seeds) with the identical instrument and band,
after recording that band's reuse status (it is a REUSED
lqpersist-substrate band, not fresh — stated, not hidden);
then report the same legs on the confirm band as CONFIRM-GO /
CONFIRM-NO-GO / CONFIRM-DIAG. The confirm NEVER overrides the
pilot verdict: the verdict is the pilot's GO/NO-GO/DIAG; the
confirm is reported alongside.

## Secondary figures (reported, not judged)

- Per-seed per-family tables: opening, inflow, draws (meal /
  other), sweep, transformed pre/post/loss, closing, base-only
  residual, family residual, dried-channel residual — for focal
  families and every other family with inflow >= 10,000 kcal.
- Transformation event census: count and kcal by path
  (cook-racks in-place / cook-racks-split / player-preserve /
  other-task), by cook (named villagers), blind vs preserver
  rate implied by pre/post ratio (reported as observed ratio,
  never as a skill claim unless the cook's skill is recorded),
  racks-full days (eligible-but-unconverted? NOT recorded —
  the recorder sees conversions only; a racks-full count is
  NOT claimed from this instrument).
- Opening stock per seed (total + generic Foraged food share).
- Dried inflow records: count and kcal (expected 0; any record
  is listed and enters the dried ledger).
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

## Pilot gate

This 8-seed band IS the pilot. No confirm band is spent unless
the pilot verdict is GO (see above). Never below 8 seeds for
any band.

## Sense (SENSE-TESTING LAW)

At least one transformation quoted narratively from the corpus:
one stack becoming (dried) — what the village did (named cook,
day, batch), what the record shows (before/after kcal, spoilDay
reset) — plus one smoke-rack say line quoted verbatim, judged
in plain words: does the village's preservation read as people
behavior (a named cook doing named work for a named reason)?

## Metric review

Every evidence file carries a "metric review" section
(MEASUREMENT.md section 14). If this metric proves wrong, the
revision is proposed there for the NEXT run — never re-scored
mid-run.
