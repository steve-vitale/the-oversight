# sim-overtime-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp
(the blocking axis). Worker: sim-overtime-a.
Worktree: `~/workspace/worktrees/sim-overtime-a` (branch sim-overtime-a,
base 707c450e29f0 at prereg time).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: an
OVERTIME STANDING DOCKS census on a FRESH band. Nothing in game code
is fixed by this run.

## Canon read first

- docs/CANON.md, then docs/TABLE.md § "Overtime, the Network, and THE
  HOSTS" (2026-10-14): the clock starts the dawn the Table is
  announced (never before day 90), runs only while the seat is not
  taken, +1 tier per 7 unseated days, cap 6; a withdrawn seat
  pauses the clock, sitting stops it. Per tier: wave-4/5 fights
  become RERUNS, roaming cap up, raids sooner/more often, seat
  price = standing −4/tier −3 per Haven person lost, cap −40.
- docs/MONSTER-WAVES.md (wave law; wave 5 = standing >= 200 AND
  wave-4 faced, readiness demand 4/15/6/3/2 — as re-derived in the
  w5seq prereg) and docs/MEASUREMENT.md §§9–12 and 14–15 (pilot
  gate, death-aware horizons, pre-registration, convergence,
  metric binding, balanced panels).
- No canon invented. Where the assignment's wording ("standing
  docks") and the code differ, the code reading below governs the
  census and the difference is reported, not smoothed over.

## Prior evidence read first (this census builds on, not repeats)

- evidence/2026-10-27/sim-w5seq-a.md (+ prereg): the direct parent,
  run fleshout-20261027T1940Z, seeds 74401–74408, same substrate
  family (see below). SENSE-ONLY note, explicitly NOT a census
  claim: in a narration replay whose trajectory had shifted, the
  overtime clock fired on days 147/154 with the spoken dock
  amounts −16/−26 ("The table docks your standing −16/−26.
  Take your seat from Haven to stop the clock"). The replay
  proves wording and presence only, never entity identity or
  counts. This run is the census that note was not.
- evidence/2026-10-27/sim-w5twokey-a.md, sim-w5block-a.md: earlier
  bands of the same census family (74311–74318, 74301–74308).
- No re-scoring of 74401–74408, 74311–74318, 74301–74308, or any
  prior band, ever: the verdict below is judged ONLY on the fresh
  band. Prior bands appear below only as comparison columns.

## Overtime mechanics, re-derived from code BEFORE sweeping
(read in this worktree; this reading is part of the prereg, so a
later "discovery" that the dock works differently cannot move the
verdict)

From src/js/overtime.js + src/data/titans.json `_overtime` +
src/js/table.js (tableEarnedPaths, tablePreview) + src/js/
standing.js (villageStandingTotal):

- CLOCK (overtimeActive): true iff progState tableWaiting AND
  tableDone false AND tableAnnounced AND winDayFloorOk() (day
  >= 90, src/js/table.js) AND tableSeat().seat !== 'none'.
  overtimeTick() runs wrapped on endDay: the first active day
  only arms the clock (overtimeStarted = true, overtimeDays = 0,
  roster snapshot); each later active day adds 1 to overtimeDays
  and counts newly-gone roster members into overtimeLosses;
  tier = min(6, floor(overtimeDays / 7)). A tier rise speaks
  the dock line aloud and emits an `overtime_tier` telemetry
  event. Tier is monotonic; a withdrawn seat pauses, never
  resets; sitting (tableDone) stops the clock.
- "DOCK" AMOUNT (overtimeStanding): penalty = min(40,
  4 * tier + 3 * losses). At tier 1 with 4 losses: 16; at tier 2
  with 6 losses: 26 — exactly the w5seq replay's spoken numbers,
  which is consistent with a seat-price reading, not a ledger
  deduction.
- WHERE THE PENALTY LANDS (the distinction this census exists
  to make plain): the penalty is subtracted ONLY from earned
  path strengths in tableEarnedPaths() (strength =
  min(100, prereq strength + ascension bonus) − penalty, for
  earned paths only) and displayed as standingCost in
  tablePreview(). It is NEVER subtracted from villageStanding(),
  villageStandingTotal(), the gated standing total, the plenty
  cap, or any wave-unlock input. A grep of src/js for
  overtimeStanding / otPen / standingCost consumers finds only
  overtime.js itself, table.js tableEarnedPaths / tableScene /
  tablePreview, and the app.js display line. Standing totals
  therefore cannot move "because of a dock" through the penalty
  channel; they can move only through the OTHER overtime
  channels (RERUN fight scaling, raid knobs, monster cap) or
  through ordinary village life in the same window. The census
  measures the standing trajectory around firings AND checks
  the penalty channel directly (end-of-run overtimeStanding +
  tableEarnedPaths strengths), so a "no move" verdict is a
  measured fact, not an assumption from this reading. If the
  trajectory DOES move at a firing by the penalty amount, that
  contradicts this reading and is reported as such, with the
  firing day and amounts, before any explanation is offered.
- "PEAK STANDING" (operationalized, binding): all standing
  numbers below are the w5seq gated total (computed from pure
  reads by the same replication: raw, capped = war + diplomacy
  + min(plenty, 100), gated after the plenty cap, the rd4
  99-hold, the rd5 199-hold, and the peak-wave ratchet floor),
  with the engine's villageStandingTotal() called once at end
  and checked by the validator. Peak-before-dock and
  peak-after-dock are WINDOWED maxima, not running maxima:
  peakBefore = max daily gated on days strictly before the
  first firing day; peakAfter = max daily gated on days
  strictly after the first firing day (the firing day itself
  belongs to neither window, so a firing-day jump cannot flatter
  either side). peakAfter < peakBefore therefore means the
  village never climbed back to its pre-dock peak after the
  dock — the decay signature the assignment asks for — and is
  NOT a tautology, because a running max could never fall.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) —
  the w5block/w5twokey/w5seq substrate, so wall numbers compare
  in shape. The seat legs mean a village that can sit promptly
  does: overtime on this substrate can only fire on villages
  that are tableWaiting but unseated for 7+ days (invited but
  not seated, or seated-attempt failing), which is exactly the
  population the question is about.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-overtime-a-
  sweep.js (census sweep, adapted from test-w5seq-a-sweep.js
  with the daily overtime series + firing table added),
  scripts/test-overtime-a.js (proof validator, adapted from
  test-w5seq-a.js with OT checks added),
  scripts/test-overtime-a-sense.js (non-measured sense replay,
  adapted from test-w5seq-a-sense.js, firing-focused).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/
  runDays, full src/js list in index.html order minus DOM-only
  files (per the worker template). Math.random seeded BEFORE
  eval. Never stub Game.save. Per-seed rows written
  incrementally via the chunked writer subprocess
  (scripts/sim-postunlock2-b-writer.js, same pattern as w5seq),
  so a write flap cannot silently lose a row.

## Read discipline (same as w5seq, unchanged, plus overtime)

- The daily series uses ONLY pure reads: villageStanding(),
  standingPlentyCappedTotal(), waveCombatReadiness(4/5),
  waveEngaged(4), waveLedgerPoints(), deedGateReady(), state
  reads, PLUS the overtime pure reads: progState fields
  (tableWaiting, tableAnnounced, tableDone, overtimeStarted,
  overtimeDays, overtimeLosses, overtime), overtimeTier(),
  overtimeStanding(), overtimeActive(), winDayFloorOk(),
  tableSeat().seat. It NEVER calls villageStandingTotal() or
  unlockedWave() daily — the daily gated total and daily
  unlocked wave are computed from the pure reads by the w5seq
  replication. The engine's own numbers are called once at end
  and checked by the validator. overtimeTier() /
  overtimeStanding() read progState only and write nothing.
  tableEarnedPaths() is called ONCE at end (not daily) to
  record the penalty channel; tablePreview() is NOT called
  daily (its seat-audit path is not needed for the census and
  is not assumed pure).
- A firing is a daily point where overtimeTier() rises above
  its previous daily value. The firing record is: day, tier
  before -> tier after, overtimeDays, overtimeLosses, penalty
  (overtimeStanding().penalty, i.e. the spoken dock amount),
  gated/raw/capped that day and the day before. Firings are
  derived from the daily series in the validator, never
  hand-edited. The sense replay's spoken dock lines are NOT
  census data (see below).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the OVERTIME DOCKS census on this band.

Per seed, from the daily series, define:
- firings[] = every tier-rise point (day, tier, days, losses,
  penalty, gated, gatedPrevDay, raw, capped).
- firstFiring = firings[0] if any.
- peakBefore / peakAfter = windowed gated maxima as defined
  above (null if no firing).
- gatedBeforeFiring / gatedFiringDay = daily gated on the day
  before / of the first firing.
- dockDelta = gatedFiringDay − gatedBeforeFiring.
- thresholdCrossDown = whether the computed unlocked wave
  (uw) or the gated total falls across 200 or 100 in the
  firing-day step or in the 7 days after the first firing
  while no other gate input changed by more (reported per
  seed with the inputs, not asserted as causation).
- unlockChangedByDock = whether any seed's computed uw or
  engineUwEnd differs from the no-dock counterfactual in a
  way attributable to a firing. The counterfactual here is
  the code reading: the penalty channel touches no unlock
  input, so the check is (a) no firing-day gated drop equal
  to the penalty, AND (b) no uw drop across any firing that
  is not explained by ordinary standing inputs (raw/capped/
  readiness) recorded that day. A firing-day gated drop
  exactly equal to the penalty would FAIL (a) and be reported
  as a dock effect, whatever the code reading says.

CENSUS-GO (the census is complete and its verdict is reportable)
if and only if ALL of:
- G-C1: 8/8 seeds complete (days > 0, every gate + overtime
  field present on every daily point, no recorder errors).
- G-C2: every firing on every seed has a full day + amount
  record (day, tier, losses, penalty) in the corpus, and the
  validator's independent recount of firings from the daily
  series equals the sweep's firing table.
- G-C3: the substrate-activation gate passes (below).
- G-C4: the verdict sentence is stated (see verdict forms).

VERDICT FORMS (one must be stated, exactly as its conditions
say; no other verdict wording is permitted for the primary):

- "OVERTIME DOCKS MOVE PEAK STANDING" iff at least 1 seed has
  a firing-day gated drop with dockDelta <= −penalty (a drop
  at least the penalty, on the firing day), OR at least 1 seed
  has peakAfter < peakBefore AND its gated trajectory's fall
  from peakBefore begins on a firing day (firing-day gated
  < previous day's gated and gated never recovers to
  peakBefore afterwards). The seeds and amounts are named.
- "OVERTIME DOCKS DO NOT MOVE PEAK STANDING" iff firings
  exist on >= 1 seed AND no seed meets either move condition
  above AND no seed's unlock/threshold crossing is
  attributable to a firing under the check above. The count
  of seeds with peakAfter < peakBefore is still reported
  (a post-dock decay from ordinary causes is not a dock
  effect, and is named as such with its actual inputs).
- "OVERTIME DORMANT ON THIS BAND" iff G-C1/G-C2/G-C3 hold and
  firings = 0 on all 8 seeds. The eligibility breakdown is
  reported (seeds ever tableWaiting / announced / seat !=
  none / overtimeStarted) so "dormant" is distinguished from
  "never eligible". Dormant is a reported outcome, NOT a
  failure, and triggers NO second band.
- "INCONCLUSIVE — CLOCK NEVER ELIGIBLE" iff G-C1/G-C2 hold
  but G-C3 fails because zero seeds ever reach tableWaiting
  (the clock could never start on this band). This is the
  only inconclusive form, and it is still reported as
  measured, not re-banded.

CONFIRM-BAND RULE (binding): there is NO second judged band on
new wording in this run. If the verdict is DORMANT or
INCONCLUSIVE, the finding goes back to the coordinator with
the exact eligibility counts, not to another 8 seeds. Prior
bands are comparison-only, never re-scored.

Secondary quantities (reported, NOT the verdict, never promoted
into it mid-run):
- S1b, wall numbers every run needs: national / table / wins,
  wave 4-5 unlocks, median survival, death-cause shares, plus
  wave-4 kills, living wave-4 killers, full vs lesser seat
  split, Arc reach, and the w5seq comparison columns.
- S2b, per-seed overtime table: firings, max tier, max
  penalty, overtimeDays, overtimeLosses, clock start day
  (first overtimeStarted day), tableWaiting first day,
  announced first day, seat at first firing, seated day if
  any, tableDone day if any.
- S3b, the penalty channel at end: overtimeStanding() +
  tableEarnedPaths() strengths per earned path (penalty
  subtracted by construction) — reported as the seat-price
  effect, never as a standing effect.
- S4b, RERUN / raid side channels (descriptive only): whether
  any wave-4/5 fight in the post-first-firing window carries
  an RERUN label is NOT in the daily series (fights are not
  daily-sampled); the sense replay may note rerun lines, but
  they never enter counts.
- S5b, peak standing table per seed (peak gated, peak capped,
  peak raw, end gated) for the wall comparison.

## Substrate-activation gate (the rule3trial lesson: a delegation
gate cannot detect a missing courtship — so this gate checks the
substrate itself, not a downstream label)

The gate passes iff ALL of:
- A1 (policy ran): every row's ctx capture contains tableseat
  counters (tsPreviewSeen present — the policy's daily ran and
  previewed seats) OR leanlink courtship counters
  (courtCounters/courtAccords/proposedLead present). A row
  with neither is a substrate failure, not a census zero.
- A2 (daily overtime series live): every daily point on every
  seed carries non-null overtime fields (tier, days, losses,
  penalty, started, active). A null anywhere fails the gate.
- A3 (eligibility observed OR its absence explained): at least
  1 seed ever shows tableWaiting = true in its daily series,
  OR — if none does — the evidence reports tableWaiting 0/8
  as the inconclusive form above (gate fails in the
  "inconclusive" sense, which is still a complete report).
  A3 is what keeps "overtime never fired" from being
  misread as "overtime does not exist": the census must show
  whether the clock was ever eligible to run.
- A4 (overtime code live): the validator's live check loads a
  fresh game and confirms overtimeTier() / overtimeStanding()
  exist and overtimeStanding() returns penalty =
  min(40, 4*tier + 3*losses) on a synthetic progState — i.e.
  the functions the census reads are the functions the game
  uses, not stubs.

## Design

- PILOT GATE (MEASUREMENT.md §§9–12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test); no
  confirm band is pre-registered beyond this one band, per
  the confirm-band rule above.
- Seeds: 75001-75008 (fresh band). Freshness verified BEFORE
  sweeping: grep of committed evidence/2026-10-27/*.md for
  75001-75008 found ZERO hits (the band was assigned by the
  coordinator for this run; no prior run names it). Forbidden/
  used today and avoided: 74301-74308, 74311-74318,
  74401-74408, and all earlier 2026-10-27 bands named in the
  w5seq prereg.
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max) — NOT a fixed 180d. Why: matches the w5seq band
  in shape, so wall numbers compare; and the overtime clock
  cannot even start before day 90, so a shorter horizon
  would censor exactly the phenomenon under census (the
  w5seq firings were days 147/154).
- Per-seed daily tracking: gated standing, raw, capped, war/
  diplomacy/plenty, rd5 bars, rd4 bars, w4faced, unlockedWave
  (computed), rank, waveKillLog-derived wave-4 kill/killer
  counts, deedGateReady() per day, AND the overtime series
  (tier, days, losses, penalty, started, active, waiting,
  announced, done, seat). Peaks, first-firing days, and
  windowed peaks are derived from the daily series in the
  proof validator, never hand-edited.
- Proof gates (STOP, not verdict inputs):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate +
    overtime + deed field present, no recorder errors.
  - G2 veterans recompute (as w5seq V2).
  - G3 gated consistency (as w5seq V3).
  - G4 unlock consistency (as w5seq V4).
  - G5 demand vs live code (as w5seq V5).
  - G6 recount (as w5seq V6).
  - G7 daily series (as w5seq V7).
  - G8 deed agreement (as w5seq G4).
  - G9 twokey recount (as w5seq G5).
  - G10 OT recount: firing table recomputed from the daily
    series in the validator equals the summary's firing
    table; windowed peaks recomputed; penalty recomputed
    from tier/losses (min(40, 4t+3l)) equals recorded penalty
    on every firing; end overtimeStanding equals the last
    daily penalty.
  - G11 activation: A1-A4 above.
- SENSE TEST (SENSE-TESTING LAW): the seed with the most
  firings (ties: highest max tier, then highest max penalty,
  then lowest seed); if no firings, the seed nearest the
  clock (longest tableWaiting-unseated stretch, then lowest
  seed). Non-measured narration replay (say/sysSay taps,
  last 30 days, firing-focused) read for what the dock means
  in the village's story — a seat price the village pays
  for waiting, or a standing loss it feels — judged in plain
  words in the evidence. Replay text never enters any count,
  and a shifted replay trajectory is reported as shifted,
  never as census data.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (w5seq grep: 0
  hits for ingest/corpus; it builds before/after panels from
  two roots). A panel compare will be ATTEMPTED and reported
  honestly; no panel artifact will be faked. Same standing
  exception as the w5seq corpus if the attempt fails.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall baseline,
  metrics national,table,wins,exiled) and report LOUD lines
  with verdict; do NOT roll the baseline on an unexplained
  LOUD line.
- Stale-baseline rule: judged numbers cite ONLY this run's
  fresh corpus (75001-75008). Prior bands are comparison
  columns, never judged inputs.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
