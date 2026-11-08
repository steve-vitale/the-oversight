# Prereg: sim-pelletpass — the pellet passes to hungrier hands

Date: 2026-11-07. Build worker: pellet pass (BUILD 3).
Steve's ruling (2026-11-07 17:55 CST): the pellet PASSES to hungrier hands.

## The trap (code read, before any change)

- The pellet is installed on the scholar (player character) as the
  `fusion_reactor` ability + `scholar.fusionReactor = {installed, online}`
  (`src/js/game.js` install path; `state.fusionReactorHolder =
  {who:'player', vid, day}`). A villager can also hold it
  (`npcGrantAbility`, `state.fusionReactorHolder = {who:'villager', vid, day}`).
- "Never hungers" in code: `engine/calories.js dailyNeed()` returns 0 for
  an installed online reactor, so the bearer needs no food. The feast block
  is in `feastBuff.js grantFeastBuff()`: it REFUSES while
  `fusionReactorOnline()` is true ("the engine that never hungers never
  feasts"), so `feastSurgeUsed` can never be marked, so the food-thesis deed
  (`sentimentTaught + feastSurgeUsed`) never completes, so `tableSeat()`
  stays `'none'` and Arc IV never fires. `progression.js checkArc()` already
  says the honest out aloud: "The mantle may pass to hungrier hands."
- Seed 99767 shape (from the ruling): 3 wave-5 kills, standing 422,
  181 days, bearer pellet-fed, no seat ever priced.

## (a) The EXACT pass trigger (pinned before implementation)

Hook: `progDaily()` in `src/js/progression.js` — the once-per-day dawn tick
(called from the `endDay` wrapper). No new system, no new tick.

At each dawn, the pellet passes when ALL of these hold:

1. **The System has arrived** (`state.systemArrived`) — the pellet is the
   System's surgery; it only moves once the System is here.
2. **A bearer is actually pellet-fed.** `state.fusionReactorHolder` exists
   AND the holder is alive and fed:
   - `who:'player'`: `fusionReactorOnline()` is true (current scholar holds
     the installed reactor + ability).
   - `who:'villager'`: the villager is alive (`getPerson(vid)` not dead)
     AND `npcHasAbility(vid, 'fusion_reactor')`.
   - A stale holder (bearer dead, successor holds no reactor) counts as NOT
     fed — nobody is fed by the pellet, the trap already self-resolved, no
     pass. The streak resets.
3. **The village hungers, measured on the game's own hunger meter.**
   Count living roster villagers excluding the bearer, present (not in
   `state.village.away`), whose `state.village.needs[vid].hunger > 70`.
   70 is the game's own "hungry" line (`dominantNeed` returns 'hunger'
   above 70; the haven panel counts hungry the same way). The scholar's own
   hunger is kcal-based, not this meter, so the count is NPC villagers only.
4. **N = 3 hungry villagers** on the same dawn.
5. **D = 3 consecutive dawns** at or above N (mirrors the hunger-winter
   crisis clock: 3 days running, `villageEats`). One hungry dawn is noise;
   three is a pattern. The streak is kept in world state,
   `state.pelletPass = { hungryDays, lastPassDay }` (survives the mantle,
   because the pellet belongs to the world, not the scholar). A dawn below
   N resets the streak to 0.
6. **Cooldown: 30 days between passes.** After a pass, no new pass until
   `day - lastPassDay >= 30`. This stops the pellet hot-potatoing down the
   hunger list dawn after dawn.

When the trigger fires, the pellet passes to **the hungriest living
present non-bearer villager** (highest `needs.hunger`; roster order breaks
ties). Transfer, in order: strip the old bearer (scholar: remove
`fusion_reactor` from `scholar.abilities` and delete
`scholar.fusionReactor`; villager: remove it from
`village.npcAbilities[vid]`), clear `state.fusionReactorHolder`, then
`npcGrantAbility(newVid, 'fusion_reactor')` — which re-sets the holder to
`{who:'villager', vid, day}`. The singularity is preserved: the holder is
never left null, so no new reactor offer can arise and the old bearer can
never reinstall. The new bearer's `needs.hunger` is set to 0 (the pellet
feeds them now — the feast code already treats a reactor villager as not
eating). `lastPassDay` is set, the streak resets to 0.

Voice (plain words, no unexplained "mantle"): a `say()` beat naming the old
bearer and the new bearer, saying plainly that the little star inside the
old bearer went quiet and woke up inside the new one, because the old
bearer never got hungry while the village did — and that the old bearer is
hungry again. Plus `tele('pellet_pass', {from, to, day})` so panels can
count passes without parsing prose.

NOT in scope (stays open): the exile Q4 — whether a villager's
feast-surge spend counts when the scholar can never feast. The pass itself
is orthogonal to exile and does not touch it.

## (b) GO bar (pinned before seeing results)

Panel: 8 matched constructed 99767-shape states, seeds
99767, 7, 42, 99, 1234, 555, 777, 2026. Each constructed state:

- day 181, `systemArrived`, scholar pellet-installed
  (`fusionReactor` + `fusion_reactor` ability), `integration` 80 (stage 3),
  `state.nationalLive = true` (national rank; standing 422 is the reported
  figure, the gate reads the rank flag), `wavesFaced` giving w1=5 w2=5 w3=4
  w4=3 w5=3 distinct faced, `contestsSurvived` 3, `crises` 3 distinct,
  `sentimentTaught` true, `prog.feastSurge = 1.5` armed, 8 living villagers,
  6 with `needs.hunger` 95 and 2 with 30, pantry THIN (villagers under-eat,
  so hunger persists across dawns — the faithful 99767 shape: the village
  hungers).
- Arms: ARMED (the pass live) vs BASELINE (same states, `maybePassPellet`
  stubbed to a no-op in the driver — no game-code kill switch).
- Phase A: run 10 dawns (`Game.endDay()` loop), record the dawn the pass
  fires (telemetry `pellet_pass` + holder change).
- Phase B (armed arm only, after a pass): the driver restocks the pantry
  as an explicit fixture step (isolating the unblock question: can a feast
  now carry the surge?), hosts a feast (`hostFeast()`), checks the buff was
  granted, then drives one real combat strike and checks
  `prog.feastSurgeUsed`, then reads `tableSeat()`.
- Fed-village control: the same shape but all 8 villagers at hunger 20 and
  a stocked pantry — run 10 dawns, expect no pass.

GO requires ALL of:

1. Pass fires within 3 dawns on >= 7/8 armed hungry-village seeds.
2. After the pass, feast grants + combat spends (`feastSurgeUsed` true) +
   `tableSeat()` returns a seat (`lesser` or `full`) on >= 7/8 armed seeds.
3. Fed control: 0 passes in 10 dawns on 8/8 seeds.
4. Baseline arm: 0 passes and 0 seats on 8/8 seeds (the trap, as today).

Anything less is NO-GO. The trigger numbers (N=3, D=3, cooldown 30) and
this bar do NOT change after results are seen.

## (c) Panel design

- Proof test (unit): `scripts/test-pellet-pass-20261107.js` — constructs the
  99767-shape state directly (per SIMULATING.md: pin state, don't hunt for a
  seed that reaches it). Asserts: pass fires under the trigger; no pass when
  the village is fed; new bearer is a hungrier villager and the old bearer
  loses the pellet (no reactor, no ability, holder moved); the pass is
  voiced (beat text names the new bearer in plain words); no pass on a
  stale holder (dead bearer); no second pass inside the 30-day cooldown.
- Panel: `scripts/panel-pellet-pass-20261107.js` (driver, one child process
  per seed x arm) + `scripts/analyze-pellet-pass-20261107.js` (aggregate to
  the GO bar). Writes `evidence/2026-11-07/sim-pelletpass.md` with the
  verdict. Matched seeds, identical constructed states, baseline vs armed.
- Gate: `node scripts/check.js --quick` in this worktree only, after
  checking no other gate is running; logged to
  `evidence/2026-11-07/pellet-pass-gate.log`.
