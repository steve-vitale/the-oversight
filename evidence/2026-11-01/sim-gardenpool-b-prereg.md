# sim-gardenpool-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T0330Z,
axis food-economy, arm sim-gardenpool-b (next blank #1 from the
0047Z round: garden-pooling timing). Worktree sim-gardenpool-b,
branch sim-gardenpool-b. This worker does NOT push, bump, verify
live, or merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge — or
NO-GO / held, per the verdict below.

## Canon (read before writing anything)

docs/CANON.md read first. NO canon doc covers pack capacity, carry
weight, or garden-harvest pooling: the CANON manifest lists no
pack/forage doc, docs/BALANCING.md sets no carry number,
docs/PRESERVATION.md covers the food ladder, not the bag. The
20 kg carry base below is therefore reported as CODE, not canon
— nothing here invents a canon ruling for it. (Measured 0047Z,
same note.)

What the code does establish (read, not invented):

- `carryCapacity()` (src/js/game.js, base `let cap = 20`, +5
  pack_rat, +10 hoarder, +item carryBonus, +2/kg per STR above 5);
  `packCapacity()` aliases it; `canCarry(kg)` is
  packWeight + kg <= packCapacity. The forage sweep already
  gates on it (estKg = harvestedCells * 4 * 0.1, max 3.6 kg).
- `harvestGarden()` (src/js/game.js) pushes every ripe plot's
  produce (90–150 units/plot via gardenHarvestUnits, 0.1 kg/unit
  = 9–15 kg/plot) STRAIGHT into scholar.inventory with NO
  canCarry check. It runs in competent daily's counterPlay ->
  workGarden AFTER the trip and its return pooling, so the
  produce sits in the pack overnight and blocks the next day's
  foraging until the scholar walks home and pooling runs.
- `returnToVillage()` pooling is the established home-pooling
  path: finished food only (kcalEach > 0 AND NOT isUnprocessed),
  keep 2,000 kcal road food (DEPOSITGATE=0), the rest deposited
  through `depositPantryPieces()` (500-kcal pieces); unprocessed
  food stays in the pack by design (it needs identification /
  preparation, and depositPantryPieces returns 0 for kcalEach<=0).
- Villager garden duty (game.js ~7040) already pools to the
  pantry: ripe harvests go to the pantry via stockPantry at 0.8
  efficiency with a narrated line. Garden-produce-to-pantry is
  therefore an established pattern for villagers; this arm
  extends the same destination to the player's own harvest when
  the pack cannot take it.
- No-silent-actions law (CANON standing rules): every action
  narrates honestly, including failures. takeFromPantry's
  refusal prints kg — that is the honesty bar for any new
  refusal / reroute line in this arm.

## The change (what this pilot judges)

QUESTION: does making garden harvest respect the pack gate —
instead of a bigger cap number — cut pack-full failures without
losing food or stranding the scholar?

MECHANISM (decided from the code, frozen here): harvestGarden
is called at Haven (gardenWorkGate requires the haven tile,
px=4, py=4, outside the hall) — the garden is "behind the
hall", so the pantry is steps away, not a trip away. Per ripe
plot, in order:

1. If `canCarry(plotKg)` (units * 0.1 kg): into the pack, as today.
2. Else if the item is FINISHED food (kcalEach > 0 AND NOT
   isUnprocessed, the exact return-pooling definition) AND the
   pantry has room (pantryCapKcal - pantryKcal > 0, the return
   pooling room check): deposit the whole plot through
   `depositPantryPieces()` with the same field contract as
   return pooling, and narrate it naming the load and the
   destination (units x name, kg, "pantry").
3. Else (unprocessed food — depositPantryPieces cannot take it
   — or a full pantry): DEFER the plot: do NOT push it, do NOT
   call gardenHarvestTaken (the plot stays ripe for a later
   day), and narrate the deferral naming the load, the pack
   state (kg of cap), and the reason (pack full / pantry full).

Food NEVER vanishes silently: every plot ends packed, pooled,
or still growing on its plot. Nothing is dropped, discarded,
or written to a counter without a destination.

EXPLICIT NON-GOALS (frozen): carryCapacity base stays 20 —
the 20 -> 40 landing-value decision is SEPARATE and belongs
to the confirm path of this arm (see below), not to this
change. No gate, price, or deed-bar change. No policy-file
edit (competent-entrywindow-b is read-only). No other game.js
function changes: the diff is harvestGarden() only, plus its
narration lines.

## Substrate (identical seeds, both legs, rotation-ON)

The regime where the pack binds (packcap pilot: baseline
pack-full 18 on band 60301-60308, rotation-ON). Driver +
analyzer reused VERBATIM from the entrywindow arm
(scripts/entrywindow-b-driver.js,
scripts/analyze-entrywindow-b.js): day-start packKg, forage
attempts with packKgBefore + failReason, homecomings,
deposits (kind unload/donate/other — garden pooling lands as
'other'), sayLines, deaths, maxWave.

- POLICY=competent-entrywindow-b, DAYS=30,
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0,
  and the driver's ten must-NOT-be-1 flags (env-fatal if
  violated).
- BASELINE leg: policy on BASE code (this branch before the
  garden change is applied).
- ARMED leg: same policy on GARDENPOOL code (harvestGarden
  change only, base cap still 20).
- Pilot band (FRESH): 74001-74008. Spent bands, never reused
  as fresh evidence: 60201-60212, 60301-60308, 52201-52212,
  73001-73008. Collapsing seed 51608 is reference only.
- Horizon: 30d competent pre-seat windows, death-aware (dead
  villages stop simulating; the harness reports daysAlive).
  Why 30d and not longer: the pack binds within days (garden
  matures ~7–12d, regrows every 3d, so 30d covers several
  garden cycles), and longer windows add seat-drive confounds
  without changing the pack mechanism. Never a fixed 200d.
- If pilot GO: confirm on a FRESH band 74101-74112 (12 seeds),
  same bars, same substrate. The confirm also states the
  landing-value capacity recommendation explicitly (land a
  value, or defer it with a reason — the capacity decision
  belongs to this confirm path).

## Primary metric

Pack-full band total: sum over seeds of analyzer
failByReason.pack_full (forage attempts refused with
"Your pack is full" / "Still full").

## GO thresholds (judged exactly against this header)

GO requires ALL of:

- (0) REGIME GUARD: baseline pack_full band total >= 4.
  If the pack does not bind on the fresh band, the pilot
  cannot show a reduction — report as regime-not-reproduced,
  not as a lever verdict, and do not re-pick bands until one
  binds (band shopping is not measurement).
- (1) pack_full band total: armed <= 0.5 x baseline
  (>= 50% drop).
- (2) DAY-START OVERLOAD days down: days whose day-start
  packKg >= that day's packCap, band total armed < baseline.
  Reported alongside: mean and max day-start packKg per leg.
- (3) mean daily haul (analyzer meanDailyHaul, band
  mean-of-means): armed >= baseline (no food loss).
- (4) away day-ends (analyzer awayDayEnds): band total
  armed <= baseline, AND the per-seed away table is reported
  with the SHAPE VETO: no seed with armed awayE >= 10 AND
  armed >= baseline + 10 (a 60307-shaped asymmetric stranding
  must not pass on a total, and must not fail an away total
  on a rotation artifact either — the veto fires only on a
  new-or-worsened stranding; a pre-existing stranding
  unchanged on both legs is reported, not vetoed).
- (5) starvation deaths (analyzer starvationDeaths): band
  total armed <= baseline.
- (6) MECHANISM GATE: armed leg shows at least one garden
  pooled event (deposits kind='other' with garden produce,
  or a pooled-harvest narration line) or deferred event.
  If the change never fires, the pilot is NO-GO regardless
  of the other bars (an effect without a mechanism is not
  this lever).

A miss on any bar is NO-GO — never re-scored against a
friendlier metric mid-run (never re-scored on pack-full
share alone, on haul alone, on a rotation-OFF leg, or on a
lower drop threshold). If a metric proves wrong, it goes
under "metric review" and the revision applies to the NEXT
run, never to this one.

Pilot GO -> 12-seed confirm on fresh band 74101-74112, same
bars. Pilot NO-GO -> stop, document, leave the branch held.

## Landing-value capacity recommendation (confirm path)

The confirm evidence states explicitly, one of:

- LAND base 20: garden-pooling closes the bypass, so the
  standing-load pack-full remainder (if any) is small enough
  that no cap change is needed; CAP40 stays held/dead.
- LAND a stated new base (with the number justified by the
  confirm's residual pack-full composition: garden vs
  standing load), or
- DEFER with a reason (e.g. residual pack-full is still
  garden-shaped, or the confirm band does not reproduce the
  regime).

The pilot alone never lands a capacity value.

## Sense-testing (SENSE-TESTING LAW)

Read the armed corpus's harvest narration lines (packed /
pooled / deferred) and at least one full pack-full day's
transcript per affected seed. Judge: does the line name the
load and the destination (honesty bar)? Does a deferred plot
read as a decision, not a disappearance? Does the scholar's
next day make sense (forage unblocked, or a legible reason
it is not)? Counts never substitute for this read.

## Metric review (for the NEXT run, never this one)

- The away shape veto above is adopted from the 0047Z
  pocket-aware metric review (new-or-worsened clause).
- The day-start overload bar (2) is new to this arm: if the
  armed leg's overload days do not fall while pack-full does
  (e.g. standing load, not garden load, sets the day-start
  number), the next prereg should judge overload days as a
  diagnostic, not a bar, and judge pack-full + haul only.
- Panel decision strings are not bars (0047Z redeploy
  lesson): the balanced panel is context; the driver bars
  above are the judge.

## Evidence to commit

- evidence/2026-11-01/sim-gardenpool-b.md (verdict, tables,
  sense slice, wall numbers, metric review section)
- evidence/2026-11-01/sim-gardenpool-b-baseline.jsonl +
  sim-gardenpool-b-armed.jsonl (pilot corpora)
- evidence/2026-11-01/sim-gardenpool-b-baseline-analysis.json
  + sim-gardenpool-b-armed-analysis.json (analyzer output)
- evidence/2026-11-01/sim-gardenpool-b-panel-summary.md
  (+ panel .json.gz; panel runs its own substrate and
  compares policies, not code variants — context only)
- scripts/test-gardenpool-b.js (proof test: packed / pooled /
  deferred / no-loss cases) + scripts/analyze-gardenpool-b.js
  (garden diagnostics: day-start overload, pooled kcal,
  per-seed away table)
