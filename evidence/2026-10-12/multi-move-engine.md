# Multi-Move Monster Engine + System Knowledge-Aggregator/HUD Progression

**Date:** 2026-10-12
**Branch:** multi-move-engine (worktree `~/workspace/worktrees/multi-move-engine`)
**Directive:** Steve — "We want the system to both be knowledge aggregator and the HUD that keeps turning this from horror story to feeling like a video game."
**Refinement:** Use ALL methods (a)–(f) PER MONSTER, not uniformly. No two wave-1 fights feel the same.

## The core finding

`src/data/monsters.json` documented 2–4 moves per monster in `codexStages.slain` ("Moves: ..."), but the engine only implemented the single `attack` field. All 55 monsters were codex-multi-move but engine-single-move. The gallowdeer promised "Ocular Discharge" + "Antler Sweep (close range)" — only the beam existed.

## What was built

### 1. Multi-move engine (`src/js/game.js`)

- **Data:** monsters get an `attacks` array; `attack` stays as `attacks[0]` for back-compat. Schema updated (`src/data/schemas.json`).
- **Move selection:** `tbChooseMove(m, foe)` — filters by conditions (minRange/maxRange/hpBelow/hpAbove/firstTurn/cooldownTurns/requiresFlag/forbidFlag/flagGte/flagLt/flagEq), weighted pick with random tiebreak. Sets `m.moveAtk` + `m.moveOdds`.
- **Commitment:** `tbEnsureMove(m, foe)` — idempotent; the telegraph IS the commitment. Declare helpers (`encDeclareDirect`, `encDeclareBeam`) read via `encAtk(m)`.
- **Tactics:** non-damaging moves (`tactic: reposition/bunker/withdraw/recover/model/claim/rally/summon/walkout/chargeup`) execute behaviors via `tbMonsterTactic`, not telegraphs.
- **Odds → exact:** `tbTelegraphCue` appends `tbMoveOddsCue` (System odds at stage 2+, unlearned) or the exact move coaching (learned). `tbLearnPattern` learns the telegraphed move by name.
- **Tile rule:** beam/burst/charge/line patterns get windup ≥ 2 (data-enforced, proof-checked).
- **Learning:** `encTelegraphKnown` true if ANY kit pattern learned.

### 2. Knowledge aggregator (`src/js/game.js` `canShow`, `src/js/fieldFights.js`)

- At `integrationStage() >= 2`, the System gossips village-earned intel:
  - `state.villagePatterns[monsterId][attackName]` (recorded in fieldFights when a villager survives the monster's attack) → unlocks `mechanics` aspect → player ⚠/badges.
  - `state.villageSlain[monsterId]` (any villager's kill) → unlocks `stats` aspect.
- Canon: the aliens forgot Earth monsters, so the System shares move NAMES (its catalog) but never stats it didn't earn. Villager gossip is the vector.
- Wired through `canShow('monster', ...)` so every surface respects it. `tbPatternKnown` routes through canShow.

### 3. Horror→video-game HUD (`src/js/app.js` `panelCombat`, `src/css/main.css`)

- **Stage 0 (horror):** descriptor, fraction HP bar. No numbers, no odds, no names.
- **Stage 1 (named):** System true name + ⚠ for learned patterns.
- **Stage 2 (overlay):** exact HP numbers (`42/60`) + System move-odds (`🎯 Ocular Discharge 60% / Antler Sweep 40%`).
- **Stage 3 (neural):** damage preview on telegraphs (`💥20–30`) + codex intel line (`🧠 CODEX: <trick> — <hint>`).
- Each stage is a genre shift, not just more text.

## Per-monster method palettes (Steve's a–f)

**Wave 1:**

| Monster | Moves | Methods | Why |
|---|---|---|---|
| bulldozer | China-Shop Charge, Retreat | (a) multi-move, (b) windup 2, (c) bloodied | The charge is the identity; below 25% it stops fighting and retreats (codex). Bloodied = self-preservation, not rage. |
| hushwolf | Silent Rush, Harass | (a) multi-move, (d) pack | Rush is first-turn ambush; Harass is the pack circling. The pack IS the mechanic. |
| gallowdeer | Ocular Discharge, Antler Sweep | (a) multi-move, (b) windup 2, (e) stance | Beam at range (minRange 2), sweep adjacent (maxRange 1). The stance machine (graze→freeze) is the tell. |
| mirrormoth | Wing Flash, Drift | (a) multi-move, (b) windup 2, (d) facing, (f) counter | Flash is the burst; Drift is the bespoke light-seeking reposition. Hit it while it folds. |
| belltoad | Resonant Croak, Lunge | (a) multi-move, (b) windup 2, (d) chorus | Croak is the sonic burst; Lunge is short-range clumsy. The chorus is the signature. |
| lockpick_raccoon | Disassemble, Bite | (a) multi-move, (f) steal | Disassemble steals; Bite only if cornered (hpBelow 0.6). The steal is the wacky. |
| white_noise_heron | Spearfish Strike, Stalk | (b) windup 3, (d) statue | The 3-beat windup IS the fight — the statue stillness, then the strike. Stalk repositions unseen. |
| hummice | Swarm Hum, Nibble Tide | (a) multi-move, (b) windup 2, (d) swarm | Hum is the stacking burst; Nibble is close-range. The swarm stacks are the signature. |
| speedbump_turtle | Snap Decision, Bunker | (a) multi-move, (c) bloodied, (f) flip | Snap is the ambush; below 60% it Bunkers (sealed, x0.15 damage). Flip it. |
| nightlight_catfish | Lure and Grasp, Barb Lash | (a) multi-move, (d) lure | Lure is first-turn ambush; Barb Lash is close-range. Fully bespoke turn; data documents. |
| ducks_in_a_row | March, Nip | (a) multi-move, (d) snake | March advances the line (contact burns); Nip is the coordinated bite. Bespoke snake; data documents. |
| glasswing | Skyfall Dive, Grounded | (a) multi-move, (b) windup 2, (d) grounded | Dive is the aerial nuke; Grounded is the vulnerable recovery (tactic). Kill it when it lands. |
| sunbasker | Sun-Charged Bite, Bask | (a) multi-move, (d) bask | Bask builds charge (tactic); Bite spends it. Bespoke charge cycle; data documents. |
| nevermore | The Unkind Cut, Perch | (a) multi-move, (b) windup 2, (d) altitude | Cut is the 3-lane strafing dive; Perch is the high circle (tactic). Bespoke altitude; data documents. |
| nightcourt | Adjournment, Second Hearing | (a) multi-move, (d) re-aim | Adjournment is the silent dive; Second Hearing re-aims a miss. Bespoke; data documents. |

**Wave 2:**

| Monster | Moves | Methods | Why |
|---|---|---|---|
| voice_mimic_radio | Distress Call, Voice Drop Rush | (a) multi-move, (d) mimic | Distress Call locks on (your voice); dropping the act it RUSHES with no telegraph. |
| mirror_stag | Confrontation, Wheel | (a) multi-move, (b) windup 2, (f) mirror | 6-tile charge showing your face; dodge it and it WHEELS (second charge, cooldown). |
| review_drone | Scored Assessment, Desk Rejection | (a) odds, (b) 3-beat windup | The 3-beat beam IS the fight (line pre-drawn); Desk Rejection is the close-range dismissal. EXT: Desk Rejection. |
| bright_idea | Eureka, Half-Baked Notion | (a) multi-move, (b) windup 2 | Eureka is the biggest burst so far; Half-Baked is the smaller faster one. EXT: Half-Baked Notion. |
| memory_projector | Home Movies, Blooper Reel | (a) multi-move, (b) windup 2, (d) gaze | Home Movies follows your gaze (beam); Blooper Reel is close-range embarrassment. EXT: Blooper Reel. |
| warranty_caller | The Pitch, Robocall Barrage | (a) multi-move, (f) ring | The Pitch rushes on first turn (RING is the tell); Barrage is the ongoing calls. EXT: Robocall Barrage. |
| understudy | Mirror Strike, Opening Steal, Desperate Improv | (a) multi-move, (c) bloodied, (d) copy | Copies your weapon; steals your opener (cooldown); below 30% chains your moves frantically. |
| landlord | Serve Notice, Collect Rent, Jurisdiction Spread | (a) multi-move, (d) claim | Serve Notice claims ground (burst); Rent drains on claimed ground; Spread grows the claim (tactic). |
| heckler | Vicious Mockery, Pile-On, Compulsion | (a) multi-move, (d) shame, (f) words | Mockery stacks SHAME; Pile-On doubles it when ashamed; Compulsion punishes answering. |
| paparazzo | Flash Photography, Prediction, Widening Shot | (a) multi-move, (b) windup 2, (d) model | Flash freezes; Prediction refines the model (tactic); at 3+ prediction the burst widens. |
| union_rep | Solidarity Speech, Call to Action, WALKOUT | (a) multi-move, (d) organize | Speech buffs allies (rally); Call summons a picket; below 50% WALKOUT (untargetable + buffs). |
| moderator | Content Noted, Removal Notice, Deplatform | (a) multi-move, (c) bloodied, (d) mute | Noted chips while reviewing; Removal once muting; at half HP Deplatform (3-beat windup nuke). |
| statickite | The Broadcast, the Dip | (a) multi-move, (b) windup 2, (d) broadcast | Broadcast marks the 3x3 (mercy); the Dip descends — melee-vulnerable, +50% damage window. Bespoke; data documents. |
| giant_mosquito | Circle, Dive, Drink, Heavy | (a) multi-move, (d) hunt cycle, (f) mosquito | Circle closes; Dive telegraphs; Drink bites (disease); Heavy is engorged — the punish window (vuln +50%). |
| alien_tick | Quest, Latch, Feed, Engorged | (a) multi-move, (d) feed cycle | Quest waits; Latch attaches adjacent; Feed drains; Engorged drops off — the kill window (vuln +50%). |

EXT = fiction-fitting design extension (codex documents 1 move; second move invented to meet the ≥2 kit requirement).

## Before/after

**Before:** Every monster had 1 attack. The deer only beamed. The codex lied ("Moves: ..." documented attacks that didn't exist). The System HUD was static. Villager fights taught the player nothing.

**After:** 30 monsters (waves 1+2) have 2–4 move kits with range/condition AI. Telegraphs show System odds when unlearned, exact moves when learned. Tile attacks telegraph with windup ≥ 2. The HUD transforms across 4 integration stages. Villager-earned intel unlocks player warnings at stage 2+.

## Proof

`scripts/test-multi-move-20261012.js` — 139 checks, green across 3 seeds (20261012, 777, 424242):
- (a) all 30 wave-1/2 monsters have ≥2 attacks; codex moves in kits
- (b) odds when unlearned (stage 2), exact when learned; telegraph commits the chosen move
- (c) all tile patterns windup ≥ 2
- (d) HUD predicates strictly increase by stage (odds at 2, damage preview + intel at 3)
- (e) villagePatterns/villageSlain unlock mechanics/stats at stage 2+, locked at stage 1
- Move legality: deer range gates, boar bloodied, moderator bloodied, turtle bunker
- Wave-2 tactics: recover (vuln), model (prediction), walkout (untargetable)

Regressions: `test-titan-class` 31/31, `test-combat-break-20261010` 19/19.

## Follow-up (waves 3–5)

Waves 3–5 monsters have signature mechanics (the "second trick") but no `attacks` kits yet. Same splice pattern applies. Their bespoke mechanics stay bespoke; kits document.

## Landing

Merged locally via `--ff-only`, pending ship. **Merged locally, pending ship.**

**Headline:** 30 monsters (waves 1+2) now have 2–4 move kits with honest telegraphs (odds → exact); 4-stage horror→video-game HUD; village-earned intel aggregates through the System at stage 2+.
