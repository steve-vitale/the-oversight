#!/usr/bin/env node
// Proof test: an alien playground kill records the victim in the village's
// memorial roll (journey-scale r126).
//
// THE GAP (found by r125's death census): apPlaygroundKill
// (alienPlayers.js) calls registerDeath + removeVillager but never pushes
// village.fallen — an alien-murdered villager is in telemetry and NOT in
// the memorial roll, while every other death path pushes both. The fix
// pushes the row with cause 'a stranger' (never 'alien': the memorial
// renders the cause verbatim in the Codex, and the canon says the death
// record says 'a stranger', never 'an alien' — docs/ALIEN-PLAYERS.md).
// The census already buckets 'a stranger' as alien
// (deathcensus-analyze-20261110.js ALIEN_CAUSES).
//
// BEFORE the fix this test fails on the fallen-row assertions (the
// telemetry assertions pass — the death IS registered, just never
// memorialized). AFTER the fix it passes end to end.
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 97904, mode: 'test-alien-fallen' });
  await setupGame(Game);

  const v = Game.state.village || {};
  const day = (Game.state.scholar || {}).day;
  const rosterBefore = (v.roster || []).slice();
  const fallenBefore = (v.fallen || []).length;
  ok(rosterBefore.length > 1, 'roster has villagers to kill (got ' + rosterBefore.length + ')');

  // Drive the kill directly: the playground tick only fires when aliens
  // are active late-game; the method under test is apPlaygroundKill.
  const killed = Game.apPlaygroundKill('vex_marlowe', 'villager');
  ok(killed === true, 'apPlaygroundKill returns true (a kill happened)');

  // The victim is picked at random from the roster — find them by diff.
  const rosterAfter = (v.roster || []).slice();
  const gone = rosterBefore.filter(id => !rosterAfter.includes(id));
  ok(gone.length === 1, 'exactly one villager left the roster, got ' + gone.length);
  const victim = gone[0] || null;

  if (victim) {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(victim) : null;
    ok(vp && vp.dead === true, 'victim is dead-marked');

    // Telemetry: the death IS registered (this passed before the fix).
    const tele = (Game.state.telemetry || []).filter(e => e && e.type === 'death' && e.who === victim);
    ok(tele.length >= 1, 'telemetry has a death row for the victim');
    ok(tele.some(e => e.cause === 'alien'), 'telemetry cause is alien, got ' + JSON.stringify(tele.map(e => e.cause)));

    // THE FIX: the memorial roll.
    const rows = (v.fallen || []).filter(f => f && f.villagerId === victim);
    ok(rows.length === 1, 'exactly one fallen row for the victim, got ' + rows.length);
    if (rows.length === 1) {
      ok(rows[0].cause === 'a stranger', "fallen cause is 'a stranger', got " + JSON.stringify(rows[0].cause));
      ok(rows[0].day === day, 'fallen day is the kill day (' + day + '), got ' + rows[0].day);
      ok(typeof rows[0].name === 'string' && rows[0].name.length > 0, 'fallen row carries a name');
    }
    ok((v.fallen || []).length === fallenBefore + 1, 'fallen grew by exactly one');

    // Player-facing surface: the Codex memorial roll shows the victim
    // with the village's wording, never 'alien'.
    const roll = (typeof Game.memorialRoll === 'function') ? Game.memorialRoll() : [];
    const inRoll = roll.filter(e => e && e.villagerId === victim);
    ok(inRoll.length === 1, 'memorialRoll shows the victim once, got ' + inRoll.length);
    if (inRoll.length === 1) {
      ok(inRoll[0].cause === 'a stranger', "memorialRoll cause is 'a stranger', got " + JSON.stringify(inRoll[0].cause));
    }
  }

  // Cooldown: a second kill the same day is refused — no second row.
  const killed2 = Game.apPlaygroundKill('countess_sable', 'villager');
  ok(killed2 === false, 'second kill same day refused by the 5-day cooldown');
  ok((v.fallen || []).length === fallenBefore + 1, 'no second fallen row after the refused kill');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
