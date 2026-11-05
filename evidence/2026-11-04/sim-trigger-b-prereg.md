# Trigger-mechanism diag — PRE-REGISTRATION (arm sim-trigger-b)

Run: fleshout-loop-b-20261104T2330Z. Loop B re-point queue, winnability
chain, veterans track A follow-up. Committed BEFORE any judged sim.
INSTRUMENT ONLY, zero src/js. No default, gate, price, deed, or
readyDemand number changes. No balanced-panel comparison exists for a
pure diagnostic (§15) — stated, not fabricated, not omitted silently.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5:
  wave 4 unlocks at village standing >= 100 (the Mirror Draft);
  wave 5 needs standing >= 200 AND wave-4 faced. No canon invented.
- `docs/CONTESTS.md` read for the fight-classification below: contest
  fights are played, not RNG, but a contest-sourced wave-4 fight is
  NOT a wild encounter — reported separately, never counted as
  wild-chain evidence. Same for feast draws and trap fights: real
  facings for the wave-5 gate, not wild-encounter evidence.

## Prior evidence read (not re-run)

- `evidence/2026-11-04/sim-vetencounter-b.md` + prereg (arm
  sim-vetencounter-b, run fleshout-loop-b-20261104T2125Z, pilot
  commit fefd74807): gearbar band 99101–99108, competent verbatim,
  150d death-aware. Vetencounter's verdict was DIAG-NO-CANDIDATE:
  TRIGGER binding 5/8, one short of its 6/8 bar, because 99101's
  binding was SPAWN under its any-class fight definition — its
  first two wave-4 "fights" (day 66 field evade, day 69 feast
  draw) precede its first wave-4 world spawn and cannot be wild
  fights. Its sensitivity recount (wild-only first fight day
  101) puts 99101 at TRIGGER and the count at 6/8. THIS arm is
  that recount, done properly: stack-classified fights, judged
  on world fights only, plus detail-coord tracking and the
  `monsterTurn` contact/lost-trail path, to decompose TRIGGER
  itself. This arm does NOT re-score vetencounter's verdict —
  it runs its own prereg on its own corpus.
- Code-read (not canon, stated with file/function names):
  `src/js/game.js` `monsterTurn()` acts ONLY on `playerMonster()`
  (the monster on the player's tile). A world monster carries
  detail coords `mx/my` from spawn (`spawnWorldMonster` fills
  random 0..8 when opts omit them; tile-entry spawns pass
  `placeSpawnMonster` spots; wanderer contact passes a spot at
  distance >= 4; background spawns get random coords; every
  `wanderWorldMonsters` tile step re-rolls random coords).
  When the player leaves the tile, a non-`follows` monster
  stays behind and `monsterTurn` stops touching it; a
  `follows` monster chases through the boundary onto the new
  tile ONLY if that tile is neither claimed nor safe — the
  competent player going home (safe tile) leaves even
  followers holding at the treeline. `monsterTurn` contact
  paths: line-of-sight failure increments `lostSight` and
  removes the monster past 6 ("It lost your trail"); the
  stance machine (`ambush`/`curious`/`territorial`/`grazing`/
  `hungry`/`cautious`/`fearful`) steps detail coords and
  calls `startCombat` on contact (`m.mx === px && m.my ===
  py`, or warn-then-commit for territorial/ambush). A
  `fearful` monster at a detail edge flees across the
  boundary into `fledMonsters` and is removed. `worldTick`
  (tile entry only) runs `maintainWorldMonsters` /
  `wanderWorldMonsters` / `villagerMonsterTick`; the
  villager path fights via `resolveWildMonsterEncounter` →
  `fieldFight` at 50% per tick for a villager sharing the
  monster's tile. Wave-4 `follows` roster (src/data):
  congregation, influencer, reunion, algorithm, eater,
  herald; non-followers: strike, audit, suburb, eulogy.
- Trajectory-reproduction expectation: the ONLY src/js change
  between vetencounter's run base and this run's HEAD
  (7086b11f2) is the ship version bump's `src/js/build.js`
  stamp (one line, display only). Gameplay code is identical.
  Trajectories are therefore expected to match vetencounter
  exactly on every shared number, and any drift is reported,
  not smoothed over.

## Primary question

On the gearbar band seeds 99101–99108 under competent play
verbatim, with fights stack-classified and the wild chain
judged on WORLD fights only: (a) does TRIGGER bind on >= 6/8
seeds (vetencounter's sensitivity recount, now the verdict);
and (b) what single sub-cause explains why tile co-location
never becomes a fight on the unlocked-but-unmet seeds 99102
and 99106 — player-left-the-tile vs monster-unseen-on-tile
vs player-present-never-engaged?

## Definitions (fixed before any judged sim)

- UNLOCK DAY: first daily snapshot with `unlockedWave() >= 4`.
  Seeds with no such snapshot are NEVER-UNLOCKED; their break
  step is UNLOCK.
- SPAWN: a `spawnWorldMonster` call whose monster wave == 4
  (built `wave` field, base wave — a hardened older-wave
  monster-veteran counts at its base wave, never as wave 4).
  Spawn SOURCE from the call stack's first game frame:
  `checkEncounter` (tile-entry spawn or wanderer contact —
  both spawn ON the player tile, merged as in vetencounter),
  `maintainWorldMonsters` (background), anything else
  (`other`).
- FIGHT CLASS (stack-classified, precedence fixed here —
  first match wins; the classifier is fixture-tested):
  1. `contest` — the call stack names a contest path
     (substring `contest`, case-insensitive).
  2. `feast` — the stack names a feast path (`feast`, incl.
     `drawFeastScavenger`).
  3. `trap` — the stack names a trap path (`trap`).
  4. `world` — the fight's monster IS a live world-monster
     instance (player-TB: `state.scholar.monster` at call
     time is in the instance map; villager field: the `m`
     argument is in the instance map), OR the stack names a
     wild path (`monsterTurn`, `resolveWildMonsterEncounter`,
     `villagerMonsterTick`, `checkEncounter`, `worldTick`).
  5. `other` — everything else (door-flee re-engage,
     treeline ambush, alien-player, corruption, table trial,
     and any fight whose monster is not a world instance).
  A fight event that matches no class is impossible by
  construction (class 5 is the fallthrough); a wave-4 fight
  recorded with class `other` is reported, never dropped.
- WORLD FIGHT: a fight event with class `world` and monster
  wave >= 4. The wild chain is judged on world fights only.
  Contest/feast/trap/other wave-4 fights are reported
  separately per seed (they are real facings for the wave-5
  gate, but not wild-encounter evidence).
- REACH (unchanged from vetencounter, plus the detail
  trace): a spawned wave-4 instance ever occupies the
  player's tile (spawn tile == player tile at spawn time,
  OR any daily snapshot shows it on the player's tile, OR
  any `monsterTurn` record names it as the player monster),
  OR ever shares a tile with at least one roster villager
  at snapshot time (`npcsOnNode` count > 0). Reach is
  instance-level; a seed reaches iff at least one of its
  wave-4 instances reaches. PLAYER-REACH is the subset
  whose instance reached the player's tile; VILLAGER-ONLY
  reach (villager tile, never player tile) is reported
  separately and does NOT enter the trigger sub-cause
  plurality (its mechanism is the villager tick, not the
  player contact path — see below).
- BREAK STEP per seed (in chain order, first failing step,
  wild-only fights): UNLOCK if never unlocked; SPAWN if
  unlocked but zero wave-4 spawns in [unlockDay, endDay];
  REACH if spawns > 0 but no instance reaches; TRIGGER if
  at least one instance reaches but zero WORLD wave-4
  fights; FACED-WILD if world fights > 0. A seed with
  non-world wave-4 fights but zero world fights is TRIGGER
  (its non-world fights are listed, not counted).
- BINDING STEP per seed (for the verdict count): the break
  step for unmet seeds; for faced-wild seeds, the step with
  the largest day-gap in unlock → first wave-4 spawn →
  first reach → first WORLD fight (ties toward the earlier
  step; a zero gap is not binding over a positive gap).
- TRIGGER SUB-CAUSE (per PLAYER-reaching, unfought wave-4
  instance — i.e. instances that reached the player tile
  and never fought a world fight): classified by the end of
  its FIRST co-location episode. A co-location episode is a
  maximal run of records (spawn-on-player-tile, snapshot
  on-player-tile, `monsterTurn` call as player monster)
  naming the instance on the player's tile. Episode ends:
  - `player-left-the-tile`: the player's tile changes
    (tile-change marker or snapshot player-tile sequence)
    while the instance is alive, before any fight or
    removal for that instance. The monster may wander
    afterwards; the cause is still the departure.
  - `monster-unseen-on-tile`: the instance is removed by
    the lost-trail path while the player is still on its
    tile — removal stack names `monsterTurn`, the
    instance's last `monsterTurn` record shows
    `lostSight >= 7` (or the removal is joined to a
    same-day "lost your trail" say-line), and no player
    tile change precedes the removal.
  - `player-present-never-engaged`: the episode ends
    WITHOUT player departure and WITHOUT lost-trail
    removal — i.e. the run ends while the instance is
    still co-located with the player, or the instance is
    removed by another path (fearful flee-across-boundary,
    nightlight fade, other) while the player is still on
    its tile. The episode's `monsterTurn` call count and
    minimum Chebyshev distance are reported alongside:
    presence with turns but no combat is the substance
    of this class, and a 0-call episode ending at run end
    is flagged as such, not silently merged.
  - `unclassified`: none of the above can be established
    from the records (e.g. the instance vanishes from
    snapshots with no removal record and no tile change
    — an instrument gap, counted as an instrument error
    for that seed if it affects the plurality).
  Terminal fate (a second, independent dimension per
  instance, correlated by REMOVAL events, never by monster
  id): `fought` (a world fight names the instance by
  object reference, or its removal carries a
  fight-settlement stack), `lost-trail`, `fled-boundary`,
  `other-removal` (stack class recorded), `alive-at-end`
  (in `finalWorld`). Alive-at-end subdivides into
  `village-died-first` (still on the player's tile at run
  end) vs `still-wandering-at-death` (elsewhere at run
  end). A single instance can be `player-left-the-tile`
  (episode) AND `still-wandering-at-death` (fate); both
  are reported, and the plurality verdict uses the
  episode sub-cause only.
- POST-UNLOCK WINDOW: [unlockDay, endDay] inclusive. Spawns
  before unlock day are counted separately and must be zero
  for wave 4 by the pool gate; any nonzero count is an
  instrument/code anomaly, reported, not silently dropped.

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. All 8 seeds carry a break step per the definitions above
   (no seed left unclassified, no forced fit).
2. TRIGGER is the BINDING step on >= 6/8 seeds under the
   wild-only fight definition (the bar stays 6/8 — it is
   NOT lowered to 5/8 after seeing vetencounter's 5/8).
3. A single dominant trigger sub-cause accounts for BOTH
   unlocked-but-unmet seeds (99102, 99106, as classified
   by this run — if this run reclassifies them, the clause
   applies to whichever seeds this run finds
   unlocked-but-unmet, and the reclassification is
   reported) AND is the plurality sub-cause band-wide
   (over all player-reaching unfought wave-4 instances on
   all 8 seeds; ties do not satisfy the clause).
4. Instrument errors 0 on all judged seeds (wrap errors,
   snapshot errors, instance-tracking losses, and
   unresolvable spawn/fight correlations all count).
5. Sanity check: this run's unlocks (6/8) and any-class
   faced pattern (4/8: 99101, 99103, 99104, 99105) match
   vetencounter exactly on all 8 seeds, and per-seed
   days / peak gated standing / any-class wave-4 fights /
   wave-4 kills match vetencounter exactly; any mismatch
   is reported and, if it changes a seed's break step,
   clause 1 fails loudly rather than being papered over.
A miss on any clause is DIAG-NO-CANDIDATE, never re-scored
against a friendlier metric mid-run. INSUFFICIENT-DATA only
if more than 2 seeds carry instrument errors. Metric
problems go under "metric review" for the NEXT run.
Balanced panel (§15): INAPPLICABLE for a pure diagnostic —
stated, not fabricated.

## Secondary metrics (reported, never substituted for the bar)

- Spawn counts per seed (post-unlock, by source; pre-unlock
  separately), cast counts per seed (wave-4 picks, by
  source), fight counts per seed by class (world / contest /
  feast / trap / other).
- `monsterTurn` detail traces per player-reaching wave-4
  instance: call count, first/last detail coords, minimum
  Chebyshev distance to the player, stance sequence,
  lostSight progression, fight-fired flag.
- Episode table per player-reaching unfought instance:
  first co-location day, episode-end class, turns present,
  terminal fate, days from first co-location to run end.
- Villager-only reaching instances: exposure days (daily
  snapshots with npcCount > 0), whether a world field
  fight ever named them, terminal fate.
- World-full pressure and background-spawn distances (as
  in vetencounter, for continuity — not re-judged here).
- Scale-wall numbers every run: wins, national, table,
  wave 4–5 unlocks/faced/kills, median survival.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — diag, not lever.
- Seeds: 99101–99108, the gearbar band re-run on CURRENT
  master (HEAD 7086b11f2). Horizon: 150 days, death-aware
  (dead villages stop simulating; +10d tail max via the
  harness's runDays death handling). This diag IS the 8-seed
  pilot-scale run; no confirm follows in this run (per brief).
- Instrument (`scripts/trigger-instrument-20261104.js`,
  `scripts/trigger-driver-20261104.js`,
  `scripts/trigger-analyze-20261104.js`): vetencounter's
  instrument plus: (a) fight stack classes per the
  precedence above, with object-reference fight→instance
  correlation (player-TB via `state.scholar.monster` at
  call time; field via the `m` argument) and removal-event
  fate correlation; (b) a `monsterTurn` wrapper recording
  detail coords (monster mx/my vs player mx/my), Chebyshev
  distance, lostSight, stance, player tile, and whether a
  fight or removal fired inside the call — recorded ONLY
  when the player monster is wave-4 (plus a global
  player-tile-change marker on every call, so departures
  are visible even when the next tile has no wave-4
  monster); (c) spawn/snapshot records extended with
  monster mx/my; (d) a `say` wrapper capturing only
  trail/contact pattern lines ("lost your trail",
  "followed you", "stops at the treeline/boundary",
  "Something moves/pads into", "Something big is HERE")
  with a global event index shared by all records, so
  removals join to say-lines deterministically. Pure-read
  wrappers plus daily snapshots, zero src/js, zero
  game-state writes, zero RNG draws. Wrappers never throw
  into game code: a recording failure is counted in
  instrumentErrors and the original call's result is
  returned untouched. Instance identity by object reference
  in a per-seed Map (no fields written onto game objects).
- Neutrality leg (proof test, NOT judged): one short off/on
  driver comparison (same seed, 30d) must show identical
  days, endReason, and waveKillLog length with the
  instrument on vs off — the wrappers are pure reads.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run), death-aware horizons, pre-registration
  (this file), metric binding (§14), balanced panel (§15 —
  inapplicable for a pure diagnostic; stated above).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the stack classes
  separated cleanly (any wave-4 fight landing in `other`
  that should have been `world`, or vice versa); whether
  the first-episode rule fairly represents instances that
  re-reach after departing; whether daily snapshots plus
  tile-change markers missed any intraday departure (a
  departure and return between markers is invisible, and
  is reported as a known blind spot, not a zero); whether
  the plurality rule over instances (not seeds) fairly
  weights the two target seeds against the faced seeds'
  many unfought instances; whether the 6/8 bar plus the
  plurality clause together were the right strength.
