# Veterans-encounter diag — PRE-REGISTRATION (arm sim-vetencounter-b)

Run: fleshout-loop-b-20261104T2125Z. Loop B re-point queue, veterans
track A (encounter opportunity). Committed BEFORE any judged sim.
INSTRUMENT ONLY, zero src/js. No default, gate, price, deed, or
readyDemand number changes. No balanced-panel comparison exists for a
pure diagnostic (§15) — stated, not fabricated, not omitted silently.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5:
  wave 4 unlocks at village standing >= 100 (the Mirror Draft);
  wave 5 needs standing >= 200 AND wave-4 faced. No canon invented.
- `docs/CONTESTS.md` read for the contest-cast caveat below: contest
  casts pick monsters through `castMonster` but contest fights are
  not wild encounters, so a contest-sourced wave-4 cast is NOT a wild
  encounter opportunity and is reported separately, never counted
  as a wild spawn.
- Code-read (not canon, stated with file/function names):
  `src/js/game.js` `monsterWavePool()` follows `unlockedWave()`;
  `spawnWaveTarget(pool)` draws the newest unlocked wave 60% of
  the time at top wave 4 (60/20/15/5). Wild wave-4 monsters reach
  the village through exactly three channels, all inside
  `checkEncounter()` / `worldTick()` (tile entry):
  (1) tile-entry spawn — `checkEncounter` rolls and calls
  `spawnWorldMonster` ON the player's tile;
  (2) wanderer contact — the roaming wanderer (cast by
  `castMonster` in `checkEncounter`) meets the player and is
  spawned ON the player's tile;
  (3) background spawn — `maintainWorldMonsters` (inside
  `worldTick`) tops the roaming population toward
  `worldMonsterCap()` (3/5/8) on a NON-player, NON-safe tile
  via `pickWorldTile`, after which `wanderWorldMonsters`
  drifts it one tile per world tick (35% move chance, never
  onto a safe or occupied tile) and `villagerMonsterTick`
  lets villagers standing on its tile fight it (50% per tick,
  via `resolveWildMonsterEncounter` → `fieldFight`).
  Player-tile monsters become player fights through
  `startCombat`; a player-tile monster can also wander OFF
  the player's tile (`wanderWorldMonsters` moves every world
  monster, including the player's). World monsters persist
  when the player leaves; nothing despawns them on a timer
  except fight/flee settlement and the water-watch rule.
  One monster per tile is enforced everywhere.

## Prior evidence read (not re-run)

- `evidence/2026-11-04/sim-vetprod-b.md` + prereg (arm
  sim-vetprod-b, anchor e98b7121e): gearbar band 99101–99108,
  competent verbatim, 150d death-aware. Vetprod's numbers are
  this arm's baseline observations, re-checked below as a sanity
  check where the instruments overlap: days 150 / 116 / 121 /
  150 / 52 / 59 / 72 / 48; peak gated standing 199 / 199 / 180 /
  199 / 140 / 150 / 50 / 20; wave-4 faced seeds 99101, 99103,
  99104, 99105; wave-4 unlocks 6/8; NEVER-FACED-WAVE4 4/8, of
  which unlocked-but-unmet 99102 (116d) and 99106 (59d) and
  never-unlocked 99107, 99108. The ONLY src change between
  vetprod's anchor and this run's HEAD is a 2-line table.js
  narration change (endgame r130); no seed reaches the table,
  so trajectories are expected to match vetprod exactly, and
  any drift is reported, not smoothed over.
- The track-A question (from vetprod's "Next blanks" #1): WHY
  do unlocked-but-unmet villages never meet wave 4? Spawn
  failure (no wave-4 monster ever spawns near them), reach
  failure (spawns but never comes within fighting reach), or
  dispatch/trigger failure (within reach but no fight opens)?

## Primary question

On the gearbar band seeds 99101–99108 under competent play
verbatim, for each seed's wave-4 chain — unlock → spawn →
reach → fight — at which step does the chain stop, and is one
step the dominant break?

## Definitions (fixed before any judged sim)

- UNLOCK DAY: first daily snapshot with `unlockedWave() >= 4`.
  Seeds with no such snapshot are NEVER-UNLOCKED; their break
  step is UNLOCK, which is none of the three judged steps.
- SPAWN: a `spawnWorldMonster` call whose monster wave == 4
  (the built `wave` field, base wave — a hardened older-wave
  monster-veteran counts at its base wave, never as wave 4).
  Spawn SOURCE from the call stack's first game frame:
  `checkEncounter` (tile-entry spawn or wanderer contact —
  both spawn ON the player tile, so they merge into one
  source class, stated here, not split by guesswork),
  `maintainWorldMonsters` (background), anything else
  (`other`: finale/network/titan/trap/flee-respawn paths).
  A `castMonster` return with a wave-4 pick is a CAST, not a
  spawn, and is reported separately by source (wanderer cast
  vs contest cast vs other).
- REACH: a spawned wave-4 instance ever occupies the player's
  tile (spawn tile == player tile at spawn time, OR any daily
  snapshot shows it on the player's tile), OR ever shares a
  tile with at least one roster villager at snapshot time
  (`npcsOnNode` count > 0 — the villager-fight precondition),
  OR a fight opens for its id while it is alive. Reach is
  instance-level; a seed reaches iff at least one of its
  wave-4 instances reaches.
- FIGHT: a `startCombat` (player-TB) or `fieldFight` event
  with monster wave >= 4, as in vetprod.
- BREAK STEP per seed (in chain order, first failing step):
  UNLOCK if never unlocked; SPAWN if unlocked but zero
  wave-4 spawns in [unlockDay, endDay]; REACH if spawns > 0
  but no instance reaches; TRIGGER if at least one instance
  reaches but zero wave-4 fights; FACED if fights > 0.
- BINDING STEP per seed (for the verdict count): the break
  step for unmet seeds; for faced seeds, the step with the
  largest day-gap in the chain unlock → first wave-4 spawn →
  first reach → first fight (ties broken toward the earlier
  step; a zero gap is not binding over a positive gap). This
  makes faced seeds' data bear on the same question — which
  step throttles the chain — instead of discarding half the
  band.
- POST-UNLOCK WINDOW: [unlockDay, endDay] inclusive. Spawns
  before unlock day are counted separately and must be zero
  for wave 4 by the pool gate; any nonzero count is an
  instrument/code anomaly, reported, not silently dropped.

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. All 8 seeds carry a break step per the definitions above
   (no seed left unclassified, no forced fit).
2. One step S in {SPAWN, REACH, TRIGGER} is the BINDING step
   on at least 6 of 8 seeds AND is the break step of BOTH
   unlocked-but-unmet seeds (99102 and 99106, as classified
   by this run — if this run reclassifies them, the clause
   applies to whichever seeds this run finds
   unlocked-but-unmet, and the reclassification is reported).
3. Instrument errors 0 on all judged seeds (wrap errors,
   snapshot errors, instance-tracking losses, and
   unresolvable spawn/fight correlations all count).
4. Sanity check: this run's unlocks (6/8) and faced (4/8)
   match vetprod's shared numbers; any mismatch is reported
   and, if it changes a seed's break step, clause 1 fails
   loudly rather than being papered over.
A miss on any clause is DIAG-NO-CANDIDATE, never re-scored
against a friendlier metric mid-run. INSUFFICIENT-DATA only if
more than 2 seeds carry instrument errors. Metric problems go
under "metric review" for the NEXT run.

Note on the 6/8 bar (stated before seeing data, so the bar
cannot drift): never-unlocked seeds bind at UNLOCK, never at
S, so 6/8 effectively requires S to break both target seeds
AND bind on all four faced seeds (or on faced seeds plus a
reclassified unlocked-but-unmet seed). That is demanding by
design: a step that only breaks the two target seeds but
throttles nothing elsewhere is a two-seed story, not a
dominant step, and the verdict must say so.

## Secondary metrics (reported, never substituted for the bar)

- Spawn counts per seed (post-unlock, by source; pre-unlock
  separately), cast counts per seed (wave-4 picks, by source).
- Median spawn-to-player-tile distance at spawn time, per
  seed and band-wide (background spawns only; player-tile
  spawns are distance 0 by construction).
- Encounter-opportunity counts per seed: instances reaching
  the player tile, instances reaching a villager tile, fights
  opened, fights per reaching instance.
- Instance fates: fought / wandered-off-unfought /
  still-alive-at-end / removed-by-other-path, with removal
  stack class where available.
- World-full pressure: post-unlock snapshots where
  worldMonsters.length >= worldMonsterCap(), and the wave
  mix of the occupying monsters (cap saturation by older
  waves is a named spawn-block mechanism to check, not assume).
- Tile-entry pressure: number of daily snapshots is NOT a
  tile-entry count (world ticks happen on tile entry, not
  daily) — this arm does NOT claim a tile-entry rate it did
  not measure; if entry counts are needed, the next arm must
  wrap checkEncounter itself.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — diag, not lever.
- Seeds: 99101–99108, the gearbar band re-run on CURRENT
  master (HEAD 46c16d215). Horizon: 150 days, death-aware
  (dead villages stop simulating; +10d tail max via the
  harness's runDays death handling). This diag IS the 8-seed
  pilot-scale run; no confirm follows in this run (per brief).
- Instrument (`scripts/vetencounter-instrument-20261104.js`,
  `scripts/vetencounter-driver-20261104.js`,
  `scripts/vetencounter-analyze-20261104.js`): pure-read
  wrappers plus daily snapshots, zero src/js, zero game-state
  writes, zero RNG draws. Wrappers never throw into game code:
  a recording failure is counted in instrumentErrors and the
  original call's result is returned untouched. Instance
  identity by object reference in a per-seed Map (no fields
  written onto game objects).
  - Spawn: wrap `Game.spawnWorldMonster` (record day, id,
    wave, tx/ty, player tile, Manhattan tile distance, stack
    source class, veteran flag; assign instance seq).
  - Removal: wrap `Game.removeWorldMonster` (record day,
    instance seq, stack class).
  - Casts: wrap `Game.castMonster` (record day, picked id,
    picked wave from data, veteran flag, stack source class).
  - Fights: wrap `Game.startCombat` (player-TB) and
    `Game.fieldFight` exactly as vetprod did (day, channel,
    fighter, mid, wave, opts keys, outcome).
  - Daily snapshots (policy.daily wrapper, same pattern as
    vetprod/standaccum): day, unlockedWave (daily call, same
    side-effect class as standaccum's daily standing calls —
    neutrality leg below proves no perturbation), gated +
    raw standing, readiness-5 vet bar, worldMonsterCap,
    player tile, and the full worldMonsters list (instance
    seq where known, id, wave, tx/ty, distance to player
    tile, on-player-tile flag, npcsOnNode count on that tile).
  - Finalize: post-run copies of waveKillLog, fallen, deed
    wavesFaced, scaleRank, unlockedWave, standing, readiness5.
  - Sense-test: fight/kill/wild-arrival say-lines sampled
    (cap 150/seed) for coherence against the numbers; the
    standing hold line quoted where captured.
  - Scale-wall numbers every run: national / table / wins,
    wave 4–5 unlocks and facings, median survival (scaleRank,
    unlockedWave, runDays result, won/over flags).
- Neutrality leg (proof test, NOT judged): one short off/on
  driver comparison (same seed, 30d) must show identical days,
  endReason, and waveKillLog length with the instrument on vs
  off — the wrappers are pure reads.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run), death-aware horizons, pre-registration
  (this file), metric binding (§14), balanced panel (§15 —
  inapplicable for a pure diagnostic; stated above).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the break/binding
  definitions held up; whether the checkEncounter source merge
  hid anything; whether daily snapshots missed intraday
  reach (a monster wandering onto the player tile and being
  fought between snapshots is still caught, because a fight
  event implies reach — but a monster wandering on and OFF
  the player tile between snapshots with no fight is missed
  by design, and is reported as a known blind spot, not a
  zero); whether the 6/8 bar was the right strength.
