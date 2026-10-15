# sim-wildtile — WILD-TILE tile-localization instrument (scale-onramp, diagnostic)

Instrument arm answering sim-findings #256: the sim-siegeroster diagnostic
measured channels (raid/wild) but never the TILE — the arm was built on the
untested assumption that post-unlock wild villager deaths happen at Haven
when the scholar is away. This instrument tile-localizes every post-unlock
villager (non-scholar, kind villager/person — NEVER monsters) combat death:
villager death tile, monster tile, scholar tile, Haven tile, all pairwise
chebyshev distances, channel (the diag's raid/wild/patrol/other classifier),
wave, day, seed.

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- SUBSTRATE: leadfeast + FEASTSCALE_R13=1 (the siegedef2r/siegeroster road).
  Single side — diagnostic instrument, no control/armed comparison.
- POLICY UNWRAP: named export `leadfeast` from scripts/policies/feastscale.js
  (sim-findings #69 — the SMOKE gate asserts leadfeast.daily is a function).
- POPULATION: post-unlock villager combat deaths (kind villager/person,
  !player, cause monster/combat — the siegeroster diagnostic's filter,
  byte-identical), day >= wave-5 unlock day.
- DIAGNOSTIC GO: >=80% of post-unlock wild-channel villager combat deaths
  tile-attributed, AND a channel x tile breakdown answering #256: do wild
  deaths happen on the Haven tile when the scholar is away, or on wild
  tiles where villagers work?
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead
  tail). WIN-PATH HORIZON 180 (Steve 2026-10-13).
- SEEDS: 11/22/33/44/55/66/77/88 (8, the siegeroster pilot set).
- A miss is NO-GO — land evidence-only; the blank stays open with measured
  coverage. Never re-scored against a friendlier metric mid-run (§14).

## Instrument design

scripts/wildtile-lib-20261015.js (pure, w5census-lib pattern — no Game
reads) + scripts/wildtile-20261015.js (harness-side wraps, zero game-code
changes) + scripts/sense-wildtile-20261015.js (transcript sense check).

Tile semantics (engine code, read 2026-10-15 — never invented):
- monsterTile: world-monster entity (tx, ty), snapshotted BEFORE the fight
  (mFlee re-tiles the monster mid-resolution).
- scholarTile: Game.map.px/py (the scholar's world tile).
- havenTile: state.village.px/py (default 4,4).
- villagerTile (DERIVED, documented): wild/patrol → the monster's node
  (villagerMonsterTick jumps npcsOnNode(m.tx,m.ty); resolvePatrol hunts the
  nearest world monster TO its tile — game.js); raid → Haven (havenRaidTick
  teleports raiders to Haven, m.tx=hx,m.ty=hy; defenders drafted AT Haven —
  havenGrowth.js); other → null (unknown is unknown, never a guess).

Pairing: each death finds its fatal fight by vid + |day diff|<=1 (nearest;
ties prefer the fight on/before the death day — a fatal fight starting
after the death is causally impossible). registerDeath's double-death guard
means one death per vid per run, so fights are consumed once. Deaths with
no fatal fight are carried as channel 'unpaired' — their channel is
unknowable by this instrument, never absorbed into a friendly bucket.

Honesty note (found during SMOKE): hurtVillager's lethal path registers
villager deaths WITHOUT the node override — registerDeath's `node` defaults
to the scholar's tile. The corpse `node` is NOT a valid death-tile source
for villager combat deaths; the fieldFight pre-fight snapshot is the only
honest localization. This is exactly the gap #256 named.

## Runs

### Proof (RED -> GREEN)
`node scripts/test-wildtile-20261015.js`: 64/64 PASS.
- RED: deaths with no matching fights → attribution 0, GO fails; fights
  with null tiles (broken wrap) → attribution 0, GO fails; empty wild
  population → #256 explicitly "unanswered". The instrument CAN fail.
- GREEN: cheb distances, tile derivation rules (wild/patrol→monster,
  raid→Haven, other→null), row flags, death filter, pairing (nearest, day
  window, fight consumed once, tie-break prefers fight on/before death
  day), attribution rollup, answer256 CONFIRMED/REFUTED/PARTIAL verdicts,
  driver fingerprint stability.

### SMOKE (instrument-honesty gate)
`SMOKE=1 node scripts/wildtile-20261015.js`: GREEN — named-export unwrap
real; a scripted REAL wild encounter (resolveWildMonsterEncounter on a
world monster at a wild tile, scholar tile moved away from Haven) captures
exactly one fight with channel 'wild', monsterTile = the wild tile,
villagerTile = monsterTile, havenTile = village tile, scholarTile = moved
tile, dVillagerHaven=2, scholarAwayFromHaven=true.

### Det-gate
`node scripts/det-gate-wildtile-20261015.js`: 2/2 seeds BIT-IDENTICAL
across subprocess reps (fingerprint covers days|endReason|deaths|pairs|
tiles|#256 verdict). The read-only wraps don't perturb the trajectory;
the harness's deterministic sim clock + stable person keys (r26/r27) hold.

### Sweep (8 seeds x 180d death-aware, leadfeast + FEASTSCALE_R13=1)

Per-seed: s11 33d/no-unlock, s22 83d/unlock-d82, s33 114d/unlock-d58,
s44 93d/unlock-d59, s55 153d/no-unlock, s66 75d/no-unlock, s77 180d/
unlock-d60/survived, s88 109d/unlock-d58. Unlockers 5/8. Output:
evidence/2026-10-15/wildtile.json.

## Tile-attribution table

| population | n | paired | unpaired | tile-attributed | rate |
|---|---|---|---|---|---|
| post-unlock villager combat deaths | 14 | 14 | 0 | 14 | 1.000 |
| …of which wild-channel | 11 | 11 | 0 | 11 | **1.000** |
| …of which raid-channel | 3 | 3 | 0 | 3 | 1.000 |

**DIAGNOSTIC GO: MET (100% >= 80%).** Zero unpaired deaths — every
post-unlock villager combat death on this substrate comes through a
fieldFight the instrument sees.

Channel x tile (attributed pairs only):

| channel | n | on Haven tile | on wild tile | scholar away | scholar home |
|---|---|---|---|---|---|
| wild | 11 | 3 | 8 | 8 | 3 |
| raid | 3 | 3 | 0 | 0 | 3 |

Wild deaths by wave: w5: 5, w4: 3, w3: 2, w1: 1.

## The #256 answer

**The siegeroster assumption is PARTIAL at best — mostly refuted.** Of 11
tile-attributed post-unlock wild-channel villager combat deaths:

|  | scholar away from Haven | scholar home |
|---|---|---|
| death on Haven tile | 3 | 0 |
| death on wild tile | 5 | 3 |

- shareOnHavenTile: 0.273 — only 3/11 wild deaths happen on the Haven tile.
- shareScholarAway: 0.727 — the scholar IS usually away, but the deaths are
  on wild tiles where villagers work, not at Haven.
- Verdict: `assumption PARTIAL: 3/11 wild deaths on Haven tile with scholar away`.

The holdHaven theory (a held Haven closes the wild channel) was aimed at
the wrong tile: 8/11 wild deaths happen on tiles adjacent to Haven —
(4,5), (3,3), (3,4), (6,4), (3,5), (5,5) around Haven (4,4) — where
villagers work and monsters wander, regardless of where the scholar stands.
The wild router skips the scholar's CURRENT tile, not Haven; a monster on
the Haven tile still jumps villagers there (s44 d86 herald, s88 d106
nevermore — the latter a wave-1 kill at Haven while the scholar was away).
Roster defense needs a verb that reaches the near-wild tiles (the open
steve-call in #255), not a scholar-positioning rule.

Per-death detail (seed, day, monster, wave, death tile, Haven, scholar):
- s33 d61 editor w5 @ (4,5) vs Haven (4,4), scholar (3,4) — wild, away
- s33 d79 editor w5 @ (3,3) vs Haven (4,4), scholar (5,7) — wild, away
- s33 d91 redactor w3 @ (4,5) vs Haven (4,4), scholar (5,4) — wild, away
- s33 d97 redactor w3 @ (3,4) vs Haven (4,4), scholar (4,5) — wild, away
- s33 d100 rerun w5 @ (4,4) vs Haven (4,4), scholar (3,4) — Haven, away
- s44 d74 herald w4 @ (4,3) vs Haven (4,4), scholar (4,4) — wild, home
- s44 d76 spoiler w5 @ (3,5) vs Haven (4,4), scholar (3,4) — wild, away
- s44 d77 reunion w4 @ (6,4) vs Haven (4,4), scholar (4,4) — wild, home
- s44 d86 herald w4 @ (4,4) vs Haven (4,4), scholar (3,4) — Haven, away
- s44 d93 rerun w5 @ (5,5) vs Haven (4,4), scholar (4,4) — wild, home
- s88 d106 nevermore w1 @ (4,4) vs Haven (4,4), scholar (3,4) — Haven, away

### Sense (SENSE-TESTING LAW)
The tile records describe a coherent world: villagers die on the tiles
they work (the ring around Haven), the scholar's tile shows real ranging
((3,4), (5,7), (5,4), (4,5)), and the three Haven-tile deaths all have the
scholar exactly one tile away — the router's skip-the-player's-tile rule
visible in the data. The s88 nevermore kill is the honest edge: a wave-1
monster wandered onto the Haven tile and killed while the scholar was away
— the exposure the siegeroster arm sensed, but on 1/11 of the deaths, not
the pattern.

## Metric review (§14)

GO met as pre-registered (100% wild-channel tile attribution >= 80%, plus
the channel x tile breakdown). No metric was moved; the diagnostic binds.

1. **Stale-baseline finding (same-run investigation, LOUD).** The committed
   siegeroster-control.json does NOT reproduce on current master: seed 11
   reads 145d there vs 33d on every current-tree run (instrumented sweep,
   uninstrumented one-shot, and the actual measure-roster control script —
   all three agree seed-for-seed: 33/83/114/93/153/75/180/109). Bisect
   (scratch clone, single-file swaps, verified checkouts) isolated the
   cause to aa898386 — a narration-only commit (conversation resume-opener
   memory quotes). Mechanism, proven in three steps:
   - The snippet appends quoted text to the resume opener → the composed
     line flows through `voiceLine`, whose RNG draw count is TEXT-DEPENDENT:
     `isQ = /\?\s*$/.test(inner)` gates a second `Math.random()` draw
     (`Math.random() < 0.45` for useOpen). The snippet flips `?`-ending
     openers to non-`?` → +1 draw per such line → the whole downstream RNG
     stream shifts (isQ-preserving render recovers 33d→134d).
   - Residual text-content sensitivity beyond isQ (134d vs 145d): empty
     append restores 145d; ending-preserving insert gives 134d. The
     no-repeat ledgers (`saidLines`/`convoRunLedger`) are keyed by line
     text and `convoSplitBeats` splits long lines into more beats —
     dialogue text content perturbs the stream through more paths than
     punctuation alone. Precise apportionment not established.
   - Det-gates still pass WITHIN a tree state — the sim is deterministic
     per commit and chaotic across narration edits.
   **Rule for the loops: committed sweep JSONs are perishable.** Same-tree,
   identical-seed, env-var-only comparisons (the standing discipline)
   remain valid — the siegeroster kill verdict stands (its control/armed
   were same-tree). Never reuse a committed baseline as a historical
   control after ANY commit lands; re-baseline on the current tree. Filed
   as sim-findings #257 (NARRATION→RNG COUPLING).
2. **The #256 population is small (11 wild deaths).** The attribution is
   100%, but the 3/11 vs 8/11 split has wide error bars. The instrument is
   kept (scripts/wildtile-*.js) — future siege arms should re-run it on
   their own tree state rather than citing these 11 deaths as settled.
3. **Instrument limitation (documented, not chased):** villagerTile for
   wild/patrol is derived from engine routing code (fight on the monster's
   node), not an independent per-villager position read. The #256 question
   is answered by direct reads (monsterTile vs havenTile, scholarTile vs
   havenTile); villagerTile corroborates.

## Village assessment

Post-unlock on the current tree, the village is a roster being ground down
on the tiles around Haven: 14 villager combat deaths across 5 unlockers
(2.8/unlocker, up from the stale 2.4 — same ballpark, different
trajectories), waves 3–5 doing the killing (10/11 wild deaths), scholars
dying at 5.0/unlocker (identical to the stale control — the scholar chain
is tree-stable, the roster draws the chaos). National 4/8, table 2/8, wins
0/8, wave-5 unlocks 5/8, median 109d. The wall is unchanged in shape: the
village reaches wave 5, then wave-4/5 monsters grind the roster on the near
wild tiles faster than it can replace people.

## Blanks filled / documented

- FILLED: sim-findings #256 — the tile-localization instrument the
  siegeroster kill prescribed. GO met; the #256 question answered
  (assumption partial/mostly refuted — wild deaths are a near-wild-tiles
  problem, not a Haven-tile problem).
- DOCUMENTED: hurtVillager's lethal path registers villager deaths without
  the node override — corpse `node` is the scholar's tile for these deaths.
  Any future instrument reading corpse nodes for villager combat deaths
  will localize them to the wrong tile.
- DOCUMENTED: sim-findings #257 — NARRATION→RNG COUPLING (voiceLine):
  dialogue text/punctuation changes RNG draw counts; narration commits
  silently invalidate committed baselines. Same-tree controls stay valid;
  historical committed JSONs do not.

## Wall numbers

national 4/8 · table 2/8 · wins 0/8 · wave-5 unlocks 5/8 · median 109d.
(Control recheck on the current tree agrees seed-for-seed; the stale
committed siegeroster-control.json read 3/8 · 1/8 · 0/8 · 5/8 · 86d.)
