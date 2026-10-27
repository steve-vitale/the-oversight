# sim-driedhunt-b — PRE-REGISTRATION (written BEFORE any judged hunt, 2026-10-27)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2150Z, axis
food-economy. Arm: sim-driedhunt-b — the per-stack hunt of the generic
dried residuals left open by run 2030Z arm sim-stockdoors-b
(evidence/2026-10-27/sim-stockdoors-b.md + its prereg; backlog item
"GENERIC DRIED RESIDUALS STILL OPEN"). Measurement only: zero src/js,
zero default flips, no lever. This arm does NOT re-judge the stockdoors
GO/CONFIRM-GO — its verdict is ONLY whether the three named dried
residuals resolve per-stack under the bar below.

## Question (from the 2030Z evidence, quoted, not re-derived here)

Under the boundary-aware (post-run) closing, the generic-family dried
residuals are: pilot seed 9825 −1,021; confirm seeds 9735 −800 and
9738 −2,240. The 2030Z evidence states the entire nonzero dried
residual sits in the generic family on both bands, and that it is the
same small-dried-residual class residualhunt left open (a mid-run dried
drop with no record in any instrument). This arm hunts that class
per-stack.

## Hunt order (fixed here; stop rule below)

CONFIRM 9738 FIRST, then 9735, then pilot 9825. If the first seed
resists (does not meet the FOUND bar below and does not meet the
PARTIAL bar either — i.e. no accounting at all), STOP and report
honestly: a partial hunt with one seed fully explained beats three
seeds hand-waved. A seed reported OPEN is never force-fit.

## Corpus-first rule (fixed here)

Step 1 hunts ONLY the existing corpora
(evidence/2026-10-27/sim-stockdoors-b-corpus/ and
sim-stockdoors-b-confirm-corpus/) — they carry itemized per-stack
flows (driedEvents with before/after stacks; mealDraw pantryDraw
items; directRecords items; spoil sweep detail entries), so no
judged sweep is re-run for the accounting leg. The existing corpora
are NEVER overwritten; any new files go to a NEW directory
(evidence/2026-10-27/sim-driedhunt-b-corpus/).
Step 2 (mechanism attribution) re-runs ONLY the three named seeds
with an ADDED recorder (below) IF AND ONLY IF the accounting leg
leaves the mechanism unattributed. The re-run is a mechanism probe,
not a new band: it must pass the det-gate below, or nothing is
judged from it.

## Instrument (DIAG only)

- REUSED UNCHANGED: scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, scripts/spoilvol-capture.js,
  scripts/driedpath-capture.js, scripts/stockdoor-capture.js,
  scripts/stockdoors-capture.js, scripts/dedupspan-apply-b.js,
  scripts/analyze-stockdoors-b.js (perSeed), scripts/
  analyze-stockdoors-b-2030.js (perSeedBa), scripts/
  sweep-stockdoors-b.js (as the re-run template only — the original
  file is NOT modified).
- NEW scripts/analyze-driedhunt-b.js: per-stack identity accounting
  from the existing corpora (see Definitions). Prints, per seed, the
  headline residual (from the reused analyzers), the identity table,
  and the FOUND/PARTIAL/OPEN judgment inputs. No corpus file is
  modified.
- NEW scripts/test-driedhunt-b.js (proof): reproduces the published
  stockdoors headline numbers for the three seeds from the corpora
  (finalPantry fresh total, boundary-aware dried residual, and the
  headline counts); checks the identity-accounting identities; checks
  hygiene (0 src/js files modified, 0 sibling capture files
  modified, no modified tracked file outside this run's own files).
- NEW scripts/driedhunt-capture.js (mechanism probe ONLY, step 2):
  (a) a snapshot-diff wrapper on Game._removePantryKcal (the
  hierarchy.js pantry take used by payTribute, tendLink, linkTick
  arrears, accord gifts/sweeteners, betrayal and comms takes, and
  lingererSortie rations) recording day, amount, per-stack units
  lost, and the caller function name from the call stack; (b)
  per-stack day-end pantry snapshots (name, kcalEach, units,
  spoilDay, foodState) in the re-run's daily loop. Pure reads plus
  a delegating wrapper: no Game.state write, no RNG use, no say/log
  write. It does NOT wrap table-defiant's local tributeKcal: that
  take fires only in the Defiant endgame path (20,000-kcal tribute
  ships), which no seed on the stockdoors bands reaches (rank
  village on all 20 seeds, table 0/20) — excluded by reachability,
  stated here, not silently dropped.
- NEW scripts/sweep-driedhunt-b.js (step 2 only): the
  sweep-stockdoors-b.js oneRun plus the driedhunt capture, writing
  to evidence/2026-10-27/sim-driedhunt-b-corpus/ with filenames
  driedhunt-b-competent-nofeast-s<seed>.json. Same band, same env
  assertions, same seeds (9738, 9735, 9825 only), same 100d
  death-aware horizon.

## Definitions (fixed here, before judging)

- Stack identity: (kcalEach, spoilDay) of a 'Foraged food (dried)'
  stack. Identity accounting is over the generic family only; other
  families' dried stacks (e.g. "Winner's share (alien rations)
  (dried)") are excluded from the generic identity sums.
- Created: sum of driedEvents after-stacks with channel 'Foraged
  food (dried)', grouped by identity (kcalEach, spoilDay).
- Consumed: sum of pantryDraw items plus directRecords items with
  name 'Foraged food (dried)', grouped by identity, valued at
  units x kcalEach (the analyzer's pantry-side valuation; dried
  items were verified to have effectiveKcal == kcalEach in the
  stockdoors corpora, but the judged valuation is units x kcalEach
  regardless).
- Swept: sum of spoil sweep pantry detail entries with channel
  'Foraged food (dried)', grouped by identity.
- Predicted closing: created − consumed − swept, summed over
  identities. Actual closing: finalPantry channel 'Foraged food
  (dried)' freshKcal.
- Live identity: spoilDay > 100 (still unexpired at the 100d
  horizon; day-101 finalPantry basis). Expired identity: spoilDay
  <= 100. A live identity's positive remainder is ordinary closing
  stock, not a leak. An expired identity's positive remainder
  (created − consumed − swept > 0) is an UNACCOUNTED TAIL: units
  that left the pantry with no record in any instrument, or were
  never actually there.
- Headline residual (judged input, reused): the boundary-aware
  dried residual for the generic family from
  analyze-stockdoors-b-2030 (perSeedBa), which the proof
  reproduces independently.

## PRIMARY bar — what counts as "found" for a seed (judged ONLY against this)

A seed is FOUND iff ALL of:
  1. ACCOUNTING: the sum of its expired-identity tails accounts for
     >= 90% of |headline dried residual| for that seed (tails summed
     in kcal), AND the live identities' remainders sum to the
     actual closing freshKcal within rounding (<= 1 kcal per
     identity summed — i.e. the identity decomposition closes).
  2. MECHANISM: every tail accounting for >= 90% of the tail kcal
     is tied to a mechanism AND a code location: either (a) a
     re-run record naming the removing call (function + caller)
     and the day, or (b) a code-reading attribution naming the
     exact function and the exact reason the existing instruments
     miss it, corroborated by the re-run's per-stack snapshots
     (disappearance day + stack). A tail attributed only by
     elimination ("no other path exists") is NOT a mechanism.
  3. NO FORCE-FIT: no tail is assigned to a mechanism whose
     recorded amount, day window, or take order contradicts the
     corpus (e.g. a take that would also have removed whole
     stacks that demonstrably survived is not the mechanism for a
     tail unless the contradiction is resolved in the evidence).
A seed is PARTIAL iff bar 1 holds but bar 2 does not (accounting
without mechanism — reported as "accounted, mechanism open", never
as found). A seed is OPEN iff bar 1 does not hold: report it open
with the best partial accounting, never force a fit. The run verdict
is per-seed (FOUND / PARTIAL / OPEN for 9738, then 9735, then 9825
in order); there is no pooled verdict that rescues a single-seed
miss.

## Det-gate for the step-2 re-run (leg 0; a miss voids the re-run)

For each of the three seeds, the re-run payload must reproduce the
published stockdoors corpus payload EXACTLY on: finalPantry fresh
total, boundary-aware dried residual (recomputed via the reused
analyzers), and the headline counts (inflows seen, mealDraw
records, deaths, driedEvents, stockdoor records, direct records,
spoil sweeps, spoilDays length) — excluding `ms` and the new
driedhunt fields. Any mismatch is a neutrality failure: the re-run
is void, nothing is judged from it, and the mechanism leg falls
back to code-reading attribution only (bar 2b) or PARTIAL.

## Secondary figures (reported, not judged)

- Per-seed identity tables (all identities with nonzero remainder,
  with create days, consumed/swept splits, and live/expired class).
- Per-seed headline residuals (control + boundary-aware) from the
  reused analyzers, for the record.
- The re-run's per-stack disappearance days for each tail, if the
  re-run runs.
- Wall numbers: the re-run re-runs the SAME band/seeds, so its
  wall numbers are a reproduction check only; the band's wall
  numbers are quoted from stockdoors as inherited, not claimed as
  this arm's own (national / table / wins 0/20, wave 4-5 0/20 on
  the stockdoors bands).

## Sense (SENSE-TESTING LAW)

For the largest single stack flow found (largest single-identity
created/consumed/tail kcal on the first FOUND or PARTIAL seed),
read the surrounding days in plain words — what the village was
doing, what dried, what left — and say whether the flow reads as
real village behavior or a bookkeeping edge. Counts alone never
satisfy this section.

## Metric review

Every evidence file carries a "metric review" section
(MEASUREMENT.md section 14). If this bar proves wrong, the revision
is proposed there for the NEXT run — never re-scored mid-run.
Pre-registration note (honest scope statement, not a result): the
identity-accounting method was prototyped before this prereg to
design the instrument (it is what showed the corpora carry
itemized per-stack flows); the JUDGED numbers in the evidence file
come from the committed analyzer run AFTER this prereg commit, and
the FOUND/PARTIAL/OPEN verdicts are judged only against the bar
above. No verdict is stated in this prereg.
