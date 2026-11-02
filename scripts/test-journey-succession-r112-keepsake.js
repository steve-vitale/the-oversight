#!/usr/bin/env node
// test-journey-succession-r112-keepsake.js — proof test for the r112
// KEEPSAKE BURIAL narration line (src/js/ledger.js playerDeath).
// The death-pack rule buries sentimentals with the body, but no line ever
// told the player — a bonded keepsake vanished silently. The fix says so,
// only when the bearer actually carried keepsakes.
//   keepsake case (default): scholar carries trail_compass (sentimental
//     class) + torch (tool). After playerDeath: the keepsake line fires,
//     the corpse carries the torch, and the compass is NOT on the corpse.
//   control case (`node <this> control`): scholar carries only the torch.
//     After playerDeath: NO keepsake line, corpse still carries the torch.
// The default run executes the keepsake case in-process, then spawns
// itself with 'control' (separate process — never two harnesses in one
// process) and requires the child to pass.
// Usage: node scripts/test-journey-succession-r112-keepsake.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

async function runCase(mode) {
  const keepsake = mode !== 'control';
  const seed = keepsake ? 4242 : 4243;
  const { Game } = await loadGame({ seed, mode: 'succession-r112-keepsake-proof', fullTelemetry: true });
  await setupGame(Game);
  const s = Game.state.scholar;
  const said = [];
  const _say = Game.say;
  Game.say = function (t) { said.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
  s.inventory = keepsake
    ? [{ itemId: 'trail_compass', name: 'Trail Compass', units: 1, kg: 0.3 },
       { itemId: 'torch', name: 'Pitch torch', units: 1, kg: 0.5 }]
    : [{ itemId: 'torch', name: 'Pitch torch', units: 1, kg: 0.5 }];
  s.equipped = {};
  const before = Game.villagerId;
  Game.playerDeath('test cause');
  check(`${mode}: handoff happens (successor, not village-lost)`,
    Game.villagerId !== before && !Game.over, `before=${before} after=${Game.villagerId} over=${Game.over}`);
  check(`${mode}: death line narrated`,
    said.some(t => /is dead/.test(t)), `lines=${said.length}`);
  const line = said.find(t => /keepsakes are buried/.test(t));
  if (keepsake) {
    check('keepsake: burial line fires', !!line, line || 'no matching line');
  } else {
    check('control: no burial line without keepsakes', !line, line || 'clean');
  }
  const corpses = (typeof Game.corpses === 'function' ? Game.corpses() : []);
  const mine = corpses.find(c => c.villagerId === before);
  check(`${mode}: bearer corpse found`, !!mine, `corpses=${corpses.length}`);
  const ids = mine ? (mine.items || []).map(i => i.itemId || i.id) : [];
  check(`${mode}: death pack carries the torch`, ids.includes('torch'), `corpse=${JSON.stringify(ids)}`);
  if (keepsake) {
    check('keepsake: compass NOT on the corpse (buried, not lootable)', !ids.includes('trail_compass'), `corpse=${JSON.stringify(ids)}`);
  }
}

async function main() {
  const mode = process.argv[2] || 'keepsake';
  if (mode === 'control') {
    await runCase('control');
  } else {
    await runCase('keepsake');
    try {
      const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r112-keepsake.js'), 'control'],
        { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
      console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
      check('control child run passes', /ALL GREEN/.test(out), out.split('\n').filter(l => l.startsWith('FAIL')).join('; '));
    } catch (e) {
      check('control child run passes', false, String((e.stdout || e.message || e)).slice(0, 300));
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.log('FAIL harness threw — ' + String(e && e.stack || e).slice(0, 500)); process.exit(1); });
