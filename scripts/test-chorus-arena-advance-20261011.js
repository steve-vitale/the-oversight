#!/usr/bin/env node
// test-chorus-arena-advance-20261011.js — long-run sim lever 6, round 5
// (contests & shows): the Chorus Line must be able to reach the player.
//
// Found by sense-testing (Steve 2026-10-11 law): a contest-arena fight vs
// the Chorus Line (wave 3, territorial) stalled FOREVER — the player fled
// to the sealed edge (8,0) ("the barrier holds"), and the line's bespoke
// count-step clamped movement to tiles 1..7, so it could never follow:
// monster at (7,6), player at (8,0), kick range 3, distance 6 — permanent
// standoff, round 420+, the sim spinning for 8+ minutes. Canon: "Monsters
// were sent to fight; purposeless disengagement is not."
// Fix: the count-step rides the engine's tbStepToward over the full 0..8
// grid (code: chorusBeat, sigW3b.js).
//   A. monster at (7,6), player at sealed edge (8,0): repeated chorusBeat
//      calls close the distance to kick range (<=3) — the fight can end.
//   B. interior case unchanged: player at (4,4), monster still advances.
//   C. the step never lands on an occupied tile (uses real occupancy).
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval. Never stub Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok:', name); }
  else { fail++; console.log('  FAIL:', name, extra === undefined ? '' : extra); }
}
const cheb = (a, b, c, d) => Math.max(Math.abs(a - c), Math.abs(b - d));

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"'"'"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  Game.say = function () {};
  Game.sysSay = function () {};
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const hooks = globalThis.MonsterBehaviorHooks || (globalThis.Scattering && globalThis.Scattering.MonsterBehaviorHooks);
  ok(!!(hooks && hooks.chorusBeat), 'chorusBeat hook registered');
  const def = (Game.data.monsters || []).find(m => m.id === 'chorus_line');
  ok(!!def, 'chorus_line def exists');

  const mkFight = (mx, my, px, py) => {
    const m = { key: 'm_0', kind: 'monster', monsterId: 'chorus_line', mdef: def,
      mx, my, hp: 337, maxHp: 337, alive: true, fled: false, name: 'Chorus Line', clBeat: 0 };
    const p = { key: 'p', kind: 'player', mx: px, my: py, hp: 100, maxHp: 100, alive: true, fled: false, name: 'You' };
    Game.tbfight = { fighters: [p, m], over: false, round: 1, order: ['p', 'm_0'], turnIdx: 0 };
    return { m, p };
  };

  // ---- A. the sealed-edge standoff resolves ----
  console.log('A. sealed edge: the line reaches the player');
  let { m, p } = mkFight(7, 6, 8, 0);
  const d0 = cheb(m.mx, m.my, p.mx, p.my);
  ok(d0 === 6, 'standoff geometry reproduced (dist 6)', d0);
  for (let i = 0; i < 24; i++) {
    try { hooks.chorusBeat(Game, m); } catch (e) { ok(false, 'chorusBeat threw', e.message); break; }
    if (cheb(m.mx, m.my, p.mx, p.my) <= 3) break;
  }
  const d1 = cheb(m.mx, m.my, p.mx, p.my);
  ok(d1 <= 3, 'the line closed to kick range (<=3) — the fight can end', `dist ${d0} -> ${d1}`);
  ok(m.mx >= 0 && m.mx <= 8 && m.my >= 0 && m.my <= 8, 'monster stays on the grid');

  // ---- B. interior behavior unchanged ----
  console.log('B. interior: still advances');
  ({ m, p } = mkFight(2, 2, 5, 5));
  const e0 = cheb(m.mx, m.my, p.mx, p.my);
  for (let i = 0; i < 12; i++) { try { hooks.chorusBeat(Game, m); } catch (e) {} }
  const e1 = cheb(m.mx, m.my, p.mx, p.my);
  ok(e1 < e0, 'interior advance unchanged', `dist ${e0} -> ${e1}`);

  // ---- C. never steps onto the player's tile ----
  console.log('C. occupancy respected');
  ({ m, p } = mkFight(7, 1, 8, 0));
  for (let i = 0; i < 12; i++) { try { hooks.chorusBeat(Game, m); } catch (e) {} }
  ok(!(m.mx === p.mx && m.my === p.my), 'never lands on the player tile', `m=(${m.mx},${m.my}) p=(${p.mx},${p.my})`);

  Game.tbfight = null;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
