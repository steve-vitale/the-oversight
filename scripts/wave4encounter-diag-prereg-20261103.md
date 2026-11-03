# Wave-4 encounter-opportunity diagnostic — pre-registration (run fleshout-20261103T0115Z)

Committed BEFORE any judged sim. Measurement only: zero game-code change,
zero policy change, zero recorder change. New files only.

## Question

Seed 97339 reaches NATIONAL, unlocks wave 4 (standing 199 vs the wave-5
bar 200), yet records ZERO wave-4 monsters fought in 92 days, so the full
seat is never offered (`deedGateReady` binding list `["w4","w5"]`,
evidence/2026-11-02/sim-scale-onramp-round-0011.md). Which stage of the
encounter pipeline is empty?

## Stages (counted per seed, on identical seeds/policies)

0. **Gate**: days with `unlockedWave() >= 4`; standing total and
   `waveCombatReadiness(4)` bars at first unlock and daily after.
   (Wave 4 is standing-gated; readiness may HOLD the gated total — the
   instrument reads the hold, it does not bypass it.)
1. **Pool / target**: `monsterWavePool()` wave-4 entries (non-titan: 9 of
   the 10 wave-4 defs; the Herald is a titan and excluded from casts) and
   `spawnWaveTarget()` calls returning 4.
2. **Placed**: `spawnWorldMonster()` calls with a wave-4 id, with tile,
   distance from the player tile and from the home tile
   (`state.village.px/py`), and caller attribution from the call stack
   (background `maintainWorldMonsters`, tile-entry `checkEncounter`,
   wanderer contact, other).
3. **Offered**: `castMonster()` returns of wave-4 ids (wanderer casts),
   `triggerEncounter()` wave-4 calls, and wanderer state (wave-4 wanderer
   alive, its tile, distance to the player tile).
4. **Fought / ended**: `startCombat()` wave-4 starts (player TB fights),
   `fieldFight()` wave-4 rows by outcome (`vKill`/`mFlee`/`vFlee`/`vDie`/
   `alreadyDead`/`evade`), and the authoritative deed count —
   `deedState().wavesFaced` distinct wave-4 types at run end.
5. **Removed without a fight**: `removeWorldMonster()` wave-4 rows
   classified by caller (fight-start removal, field-fight removal,
   lost-sight despawn, other), with HP at removal and days alive.

## Primary metric

Per-stage counts per seed, aggregated over the pilot, with the bottleneck
stage named: the first stage (in pipeline order) whose count is zero while
an earlier stage is non-zero, or — if no stage is zero — the stage whose
count collapses most sharply relative to its predecessor, named with its
binding mechanism (e.g. cap, safe-tile exclusion, wanderer-contact
geometry, policy travel pattern, readiness hold).

## GO threshold (diagnostic success)

The pilot SEPARATES the bottleneck stage: per-stage counts are reported
for every seed, and at least one stage is shown empty while an earlier
stage is non-empty, OR all stages are quantified with a named binding
mechanism explaining the zero. A bare "0 fought" restatement is NOT a
pass. If the pilot cannot separate stages, the verdict is BLOCKED with
exactly what instrument is missing.

## Horizon, seeds, policies

- Horizon: 180 days, death-aware (runDays ends on death/win; 180d cap to
  match the prior herald bands). The anchor won at 92d, inside the cap.
- Anchor seed 97339 MUST be in the pilot (reproduction first, then
  diagnosis from the reproduced run).
- Other pilot seeds 98201–98207: REUSED from the heraldband-widen band
  (evidence/2026-11-02/sim-scale-onramp-round-0011.md: wave-4 unlocks
  7/8 on that band). Named here as reused, never presented as fresh.
- Policy stack verbatim from scripts/fightoutcome-driver-20261102.js
  (closecommit: titanroute + musterclose + mustergap over lead-fullseat);
  env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 HERALD=1; mode `herald`; one process per seed.
- Wall numbers are descriptive only (national / table-latch / wins,
  wave 4–5 unlocks AND fought, median survival): they are not judged
  against a GO threshold in this diagnostic arm.

## Sense-testing

At least one wave-4 near-miss or no-contact stretch is read from the
captured say transcript and judged for meaning/coherence, not just
counts; the sense verdict is reported with the counts.

## Metric review (filled at closeout)

- (to be filled: whether the staged counts bound the run fairly, and any
  revision proposed for the NEXT run only.)
