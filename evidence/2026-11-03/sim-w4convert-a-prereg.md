# Wave-4 kill-conversion split — prereg (Loop A, run fleshout-20261103T1819Z, arm sim-w4convert-a)

Committed BEFORE any judged sim. DIAG-ONLY arm: zero src/js, zero
game-code change. This arm SPLITS the vetbar conversion failure; it
does not fix it, because any conversion fix touches the
win-fielddmg lane's damage/staying territory and the win-allyjoin
lane's party territory — coordinate with them by measurement, do
not duplicate them by code.

## Grounding (read, not assumed)

- `evidence/2026-11-03/sim-vetbar-a.md` (pilot + census, seeds
  99101–99108, competent, 140d): wave-4 beasts are NOT scarce — 71
  spawns, 70 fight exposures (37 turn-based starts + 33 field
  fights), only 5 kills (~1 per 14 exposures) — and 4 of 5 killers
  dead by end, so the village almost never banks 2 living veterans.
  Vetbar verdict was CLEAN KILL (no counting bug): class 5 = 0.
- Vetbar metric review proposed this arm: judge conversion per
  exposure and killer survival as two separate failures.
- Canon: `docs/CANON.md` + `docs/MONSTER-WAVES.md` (readiness
  section: veterans = living roster members with a wave-(w-1)+
  kill; wave-5 demand veterans 2). No canon doc covers a
  conversion split; the split definitions below are this arm's
  measurement definitions, not canon.
- Method: `docs/MEASUREMENT.md` §§9–12 (pilot gate, death-aware
  horizons, pre-registration, convergence) and §14 (metric
  binding). §15 balanced panel: INAPPLICABLE to a pure diagnostic
  with no before/after change — there is no candidate arm to
  compare, so no comparison is fabricated. The binding check is
  the census reconciliation in §"Reconciliation" below.

## Policy, seeds, horizon (fixed now)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
  default env. No policy variant: this arm describes the vetbar
  band's exposures, it does not test a policy.
- Seeds: 99101–99108 — the SAME band as the vetbar pilot/census,
  so the split describes the SAME exposures.
- Horizon: 140 days, death-aware (dead villages stop simulating;
  never a fixed 200d). Same horizon as vetbar, for the same reason
  (w5faced median survival 110.5d, release window covered).

## Instrument (scripts only)

`scripts/w4convert-instrument-20261103.js` + driver
`scripts/w4convert-driver-20261103.js` + analyzer
`scripts/w4convert-analyze-20261103.js`. Wraps are RNG-neutral
(no Math.random use) and call-through.

Attribution-wrap caution (2026-11-03 sensor/findings backlog):
fight identity is captured at fight START, never reconstructed at
fight end. For turn-based fights the identity (monster id, day,
scholar, formal party) is captured in the `startCombat` PRE-call
hook and the fighter snapshot is taken POST-call from the live
`tbfight`; for field fights the identity (vid, monster id, offered
allies) is captured in the `fieldFight` PRE-call hook. Kill linkage
is exact, not day-joined: while a field fight is on the stack, or
while a turn-based fight is open, a `recordWaveKill` /
`recordPyrrhicKill` row stamps the open exposure's sequence
number. A kill row with no open exposure is reported as
`unlinked` with its via, never force-joined to a same-day fight.
The proof test proves the wrap fires on a known fight (fixture
TB start + field fight + kill) before any judged leg uses it, and
the driver reports wrap fire counts alongside any zero.

Per wave-4+ fight exposure, record:
- fight type: `tb` (turn-based) vs `field`;
- party size at fight start: TB = human fighters at start
  (scholar fighter + kind villager/ally fighters); field =
  `opts.allies + 1` at start, plus final `rec.partySize` and
  `allyVid`/`calledHelp` at end. Solo = party size 1;
  +ally = party size >= 2 (ally count also recorded);
- fighter gear at fight start: LEAD fighter (TB: scholar;
  field: vid) — raw armorP, armed boolean (weapon to hand:
  equipped melee/ranged, or a weapon item carried, same rule as
  `waveCombatReadiness`), weapon label where readable. Gear is
  READ, never changed (sibling gearbar territory: no
  equipment/armor/weapon wearing code).
- outcome (see classes below) and, for kills, killer id + via.
- spawns: `spawnWorldMonster` wave-4 count (census reconciliation
  only; spawn identity is not an exposure).

Killer-death split: daily snapshots of every wave-4+ killer's
liveness under the gate's own rule (scholar-now = living,
otherwise `vpOf` not dead — same rule as the vetbar instrument).
- `same-fight`: killer dead at fight end (TB: fighter dead at
  `tbEnd` pre-call snapshot, or scholar dead; field: outcome
  `vDie` for the killer) OR not alive in the end-of-kill-day
  snapshot.
- `later`: alive at end of kill day, dead by horizon end.
- `alive`: alive at horizon end.
- Cause: the engine-recorded cause where the engine records one;
  where it records none, the cause field is `UNRECORDED`, never
  guessed. Splits the engine does NOT record — including
  mandatory vs voluntary arena participation (proven unrecorded
  by the arenadeath diag) — are labeled `UNRECORDED`, never
  guessed.

## Exposure outcome classes (mutually exclusive, fixed now)

Turn-based (`tbEnd` result verbatim + pre-call monster snapshot):
- `kill`: a wave-4 monster fighter is dead at `tbEnd` pre-call
  AND a kill row links to this exposure.
- `died`: `tbEnd` result `lost` (or scholar/lead dead at end)
  with no linked kill.
- `fled`: `tbEnd` result `fled` with no linked kill.
- `routed`: `tbEnd` result `routed` with no linked kill
  (monster fled, village did not kill).
- `tb-other`: any other `tbEnd` result verbatim, no linked kill.
- `tb-unended`: a started fight with no `tbEnd` observed by
  horizon end (dissolved / abandoned) — named, counted, explained.

Field (`fieldFight` `rec.outcome` verbatim):
- `kill`: `vKill` (must also carry a linked kill row; a `vKill`
  with no kill row is reported as `kill-unlinked` and counts
  against reconciliation, not silently re-classed).
- `died`: `vDie`.
- `fled`: `vFlee`.
- `monster-fled`: `mFlee`.
- `evaded`: `evade` (no fight joined).
- `already-dead`: `alreadyDead`.
- `field-unresolved`: any other / null outcome — named, counted,
  explained; it is a classification, not an unclassified bucket.

No `UNCLASSIFIED` bucket exists: an exposure whose outcome
cannot be read is an instrument error, reported as such, and
breaks DIAG-GO (see verdict).

## Primary metrics (pre-registered, judge the arm on these)

1. Kills per exposure overall (linked kills / exposures).
2. Kills per exposure split by fight type (tb vs field).
3. Kills per exposure split by party size (solo vs +ally, with
   ally count; TB and field reported separately as well as pooled).
4. Kills per exposure split by lead-fighter gear class:
   (a) armed vs unarmed; (b) armored (armorP > 0) vs unarmored;
   (c) readiness-geared (armorP >= 15 AND armed — the wave-5
   readiness armorP demand, used here only as a measurement
   bucket, NOT a gate change) vs not. Raw armorP and armed are
   recorded per exposure so the buckets are auditable.
5. Killer survival: same-fight vs later vs alive counts, days
   from kill to death (snapshot cadence: death day is the first
   snapshot day the killer reads dead; class is terminal and
   unambiguous), and cause where recorded else UNRECORDED.
6. Secondary (proposed by vetbar metric review, judged here as
   the arm's own secondary, never used to re-score vetbar):
   conversion per exposure and killer survival reported as two
   separate failures, each with its own split table.

No rate threshold is pre-registered as GO/NO-GO on the rates
themselves: this is a diagnostic, and inventing a "good"
conversion rate after seeing the data would violate §14. The
verdict below judges the DIAGNOSTIC, not the village.

## Reconciliation (calibration check, fixed now)

Totals must reconcile to the vetbar census: 71 spawns, 37
turn-based starts, 33 field fights, 5 kills. Definitions differ
in exactly one known place: the census counted `startCombat`
CALLS with a wave-4 identity, while this arm counts STARTED
fights (a `tbfight` actually open post-call) as exposures. The
driver therefore reports BOTH numbers per seed: `tbCalls` (census
definition) and `tbStarted` (exposure definition). If totals
diverge beyond that definitional gap, the evidence reports the
divergence with its cause — never silently adjusted to match.
Trajectory identity vs the vetbar per-seed files (days,
endReason, kill rows) is also reported per seed; a DIVERGED seed
is explained, not hidden.

## Verdict classes

- DIAG-GO iff: 0 instrument errors; census reconciliation
  explained (exact, or diverged-with-cause including the known
  tbCalls-vs-tbStarted definitional gap); every exposure
  classified into the classes above (no unclassified remainder);
  every killer classified into same-fight / later / alive; and
  the proof test passes (see below).
- DIAG-NO-GO otherwise: the evidence names the failing leg
  (instrument, reconciliation, or classification) and the run
  does not claim a split it did not prove.
- No fix, no confirm, no game-code change in this run. The
  evidence names the next fix arm precisely: which split, which
  lever, which lane owns it (win-fielddmg for damage/staying,
  win-allyjoin for party, gearbar for wearing — or a new arm
  where no lane owns it).

## Proof test

`scripts/test-w4convert-20261103.js` proves, on fixtures plus a
live-harness smoke: (1) the instrument fires on a known TB fight
and a known field fight (wrap fire counts > 0, identity
captured at start); (2) a kill row stamps the open exposure's
sequence (exact linkage, no day-join); (3) census reconciliation
logic (tbCalls vs tbStarted gap, spawn/start/field/kill totals);
(4) classification completeness on fixtures (every fixture
exposure lands in exactly one class, every fixture killer in
exactly one survival class); (5) gear reading (armed/armorP)
matches the `waveCombatReadiness` rule on fixtures; (6) an
unlinked kill row is reported unlinked, never force-joined.

## Hard limits (binding, honored)

- NO src/js changes at all. NO readyDemand, t4/t5, or plentyCap
  change. NO win-price or deed-gate change. NO wild-router
  ally-join code. NO field-fight damage/staying code. NO
  national-standing code. NO veteran-counting code. NO Loop B
  food-economy code. NO equipment/armor/weapon wearing code
  (read gear state only). No `[needs-eyes]` commit (diag only,
  no feel/combat/UI change).

## Metric review (pre-run doubts, for the NEXT run)

- A TB fight can contain several wave-4 monsters (pack); the
  exposure unit is the FIGHT, and a fight with 2 dead wave-4
  monsters and 2 linked kill rows counts as ONE killing exposure
  with 2 kills — kills-per-exposure and kill-rows are both
  reported so the distinction is auditable.
- Field `evade` exposures are exposures in the census sense
  (a fieldFight call happened) but no fight was joined; the
  split reports kills-per-exposure both including and excluding
  evaded/already-dead exposures, so the denominator choice is
  visible, not buried.
- Death-day dating is snapshot-cadence approximate; death CLASS
  is terminal and is what the verdict judges.
