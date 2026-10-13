#!/usr/bin/env node
// test-deathattr-20261013.js — proof test for scale-wall r17 arm 1
// (scholar-death attribution).
//
// Mechanism: playerDeath() must emit a tele 'death' record with player:true
// and the passed cause; ordinary villager deaths must NOT carry the flag;
// the corpse itself must stay kind 'villager' (gameplay-identical gates).
// No-behavior-change: identical seeds produce identical gameplay outcomes
// with the wiring in place (determinism check); the 'player' flag must not
// leak into game state (corpse record, save shape) — telemetry only.
//
// Usage: node scripts/test-deathattr-20261013.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  console.log('== mechanism: playerDeath emits player-kind death record ==');
  {
    const { Game } = await loadGame({ seed: 424242, mode: 'deathattr-mech', fullTelemetry: true });
    await setupGame(Game);
    const oldId = Game.villagerId;
    const teleBefore = (Game.state.telemetry || []).length;
    await quietLog(async () => { Game.playerDeath('combat'); });
    const evs = (Game.state.telemetry || []).slice(teleBefore).filter(e => e.type === 'death');
    check('exactly one death tele event', evs.length === 1, 'got ' + evs.length);
    const ev = evs[0] || {};
    check('player flag true', ev.player === true, JSON.stringify(ev));
    check('cause carried', ev.cause === 'combat', JSON.stringify(ev.cause));
    check('kind stays villager (gameplay-identical)', ev.kind === 'villager', JSON.stringify(ev.kind));
    check('who is the dead scholar', ev.who === oldId, JSON.stringify({ who: ev.who, oldId }));
    // The corpse: kind must stay 'villager' so corpseIsPerson/grief/funeral
    // gates behave exactly as before; no 'player' field leaks into game state.
    const corpse = (Game.state.corpses || []).find(c => c.villagerId === oldId);
    check('corpse registered', !!corpse);
    check('corpse kind villager', corpse && corpse.kind === 'villager');
    check('no player field on corpse (telemetry-only)', corpse && !('player' in corpse), corpse && Object.keys(corpse).filter(k => k === 'player').join(','));
    check('mantle passed (new bearer)', Game.villagerId !== oldId, JSON.stringify({ now: Game.villagerId, was: oldId }));
    console.log('  death record:', JSON.stringify({ day: ev.day, kind: ev.kind, who: String(ev.who).slice(0, 8), cause: ev.cause, player: ev.player }));
  }

  console.log('== mechanism: ordinary villager death has no player flag ==');
  {
    const { Game } = await loadGame({ seed: 424243, mode: 'deathattr-mech2', fullTelemetry: true });
    await setupGame(Game);
    const vid = ((Game.state.village || {}).roster || []).find(id => id !== Game.villagerId);
    const teleBefore = (Game.state.telemetry || []).length;
    await quietLog(async () => { Game.registerDeath({ kind: 'villager', villagerId: vid, name: 'Test Villager', cause: 'starvation' }); });
    const evs = (Game.state.telemetry || []).slice(teleBefore).filter(e => e.type === 'death');
    check('one death tele event', evs.length === 1, 'got ' + evs.length);
    check('player flag falsy', !evs[0] || evs[0].player !== true, JSON.stringify(evs[0] && evs[0].player));
    check('cause carried', evs[0] && evs[0].cause === 'starvation');
  }

  console.log('== no-behavior-change: identical seeds, identical outcomes ==');
  async function shortRun(seed) {
    const { Game } = await loadGame({ seed, mode: 'deathattr-det', fullTelemetry: true });
    await setupGame(Game);
    const result = await quietLog(() => runDays(Game, competent, { days: 60, sampleEvery: 10 }));
    // Gameplay outcomes only — strip the new telemetry-only player flag and
    // the volatile tele envelope (timestamps) before comparing.
    const deaths = (result.samples.deaths || []).map(d => ({ day: d.day, kind: d.kind, cause: d.cause }));
    return {
      days: result.days, endReason: result.endReason, gameDays: result.gameDays,
      won: !!Game.won,
      deaths,
      nDeaths: deaths.length,
    };
  }
  const a = await shortRun(777);
  const b = await shortRun(777);
  check('days identical', a.days === b.days, `${a.days} vs ${b.days}`);
  check('endReason identical', a.endReason === b.endReason, `${a.endReason} vs ${b.endReason}`);
  check('death count identical', a.nDeaths === b.nDeaths, `${a.nDeaths} vs ${b.nDeaths}`);
  check('death records identical', JSON.stringify(a.deaths) === JSON.stringify(b.deaths));
  // Sense-test: print the actual death records from one run.
  console.log('  sample death records (seed 777, 60d):');
  for (const d of a.deaths.slice(0, 12)) console.log('   ', JSON.stringify(d));
  if (!a.deaths.length) console.log('    (no deaths in 60d — clean run)');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
