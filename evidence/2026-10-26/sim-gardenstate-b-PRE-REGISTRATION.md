# sim-gardenstate-b — PRE-REGISTRATION (written BEFORE sweeping, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1529Z, axis
food-economy. DIAG arm, measurement only, zero src/js changes, no default flips.

## Question (from brief sim-gardenstate-b-BRIEF.md)
Why does the garden never stock the pantry? Parent finding (loop B arm
sim-inflow-b, run 1345Z): zero 'Garden harvest' calls in 1,608 inflow
records across 8 seeds x 100d on the competent-nofeast band. The inflow-b
corpus carries NO garden plot state, so this arm runs a fresh sweep with a
plot-state capture.

## Band (identical to inflow-b for comparability)
- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Seeds: 9750-9757 (8 seeds; this band IS 8 seeds; never below 8).
- Horizon: 100d, death-aware (run ends early if the village is lost;
  daysAlive reported per seed).
- Instrument: DIAG only. Per-day plot-state capture (snapshot at each
  policy.daily call = end of that loop-day) — beds, planted count, ripe
  count (split ripe-safe / ripe-unsafe by plant edibility), unplanted
  count, dead count, gardenKeeper identity — PLUS event capture:
  assignTask('garden') events, gardenKeeperTurn events, garden
  resolutions (with a pure-read prodThrottleEngaged() flag), makePlot /
  sowPlot / villagerSowPlot events, setGardenKeeper events, and the
  inflow capture reused from inflow-b (all three pantry doors) extended
  with a gardenShares flag, so a garden harvest is caught by both
  instruments. Garden say-lines (marker lines) captured for sense
  transcripts, capped per seed.
- Canon read: docs/CANON.md + docs/GARDENS.md (cultivation IS covered by
  a canon doc; no canon invented). Code pointers read before designing:
  game.js garden harvest door (~7010), task 'garden' handling (~6269
  competence table; resolveOneAssignment garden branch), gardenKeeper
  skip rule (~6521), garden-task roster guard (~6720),
  prod-throttle gating (~6758/~6775), gardenCultivation.js plot states,
  scripts/policies/competent.js workGarden/counterPlay.

## PRIMARY bar (fixed here, judged ONLY against this)
For every observed seed-day (one daily snapshot per seed, up to 100),
classify it by this mutually-exclusive cascade, in order:
1. (d) garden-origin pantry inflow through a door OTHER than the named
   stockPantry 'Garden harvest' door (deposit/pantryAdd door carrying
   gardenShares, or a stock call carrying gardenShares under another
   name) — i.e. harvested through a door the inflow instrument did not
   see as 'Garden harvest'.
2. H (harvest success, not a mechanism): stockPantry 'Garden harvest'
   with kcal > 0 that day.
3. (e) NO garden-duty signal has ever been recorded in this seed up to
   and including this day: no assignTask('garden'), no gardenKeeperTurn,
   no garden resolution. (Policy never assigns garden duty.)
4. (a) planted count == 0 at snapshot (plots never planted).
5. (b) planted > 0 and ripe count == 0 (planted but never ripe in 100d).
6. (c) ripe count > 0 and no harvest that day (ripe but never
   harvested — no duty that day, keeper logic, throttle, or the
   safe-only edibility gate).

GO iff exactly ONE mechanism letter (a)-(e) covers >= 95% of ALL
observed seed-days (denominator = all seed-days, harvest days included,
so a mechanism must explain nearly the whole band, not just the
no-harvest days). Report all five counts plus H regardless.
Otherwise NO-GO (mechanism unclear) — never re-scored mid-run.

Reported alongside (not part of the bar): per-seed cascade counts,
non-cascade tallies (total garden assignments, keeper turns, garden
resolutions, throttle-engaged garden resolutions, beds made, player
sows, NPC sows, ripe-safe vs ripe-unsafe split, first-planted day,
first-ripe day, first-harvest day per seed), and the standard wall
numbers for the band (national / table / wins, wave 4/5 reach, median
survival) as band facts, not arm findings.

If the mechanism is (e), that is a POLICY finding, not a game-code
bug — say so and do NOT flip defaults.

## Sense (SENSE-TESTING LAW)
One garden-day transcript per mechanism claim: a planted day, a ripe
day if any exist, a harvest attempt if any exists, drawn from the
captured garden say-lines. Judge meaning, coherence, relevance —
never just counts.

## Metric review
Every evidence file carries a "metric review" section (MEASUREMENT.md
section 14). If this metric proves wrong, the revision is proposed
there for the NEXT run — never re-scored mid-run.
