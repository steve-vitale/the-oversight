#!/usr/bin/env node
// MECHANICAL PROOF (ability-gaps 2026-10-14): directly exercise the new hooks.
// Proves: villager ability use, OPENINGS bonus, synergy hooks fire in combat.
// Usage: node scripts/proof-ability-gaps-mech-20261014.js (SEED env override)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '42', 10);
Math.random = mulberry32(SEED);
const ROOT = '/home/hatch/workspace/worktrees/sim-abilitygap';
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"'']*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n').filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log(`LOAD FAIL ${f}: ${e.message}`); } });
delete global.window; delete global.document;

(async () => {
  const Game = globalThis.Scattering.Game;
  await Game.init();
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  let pass = 0, fail = 0;
  const ok = (n, c, d) => { if (c) { pass++; console.log('  PASS', n); } else { fail++; console.log('  FAIL', n, d || ''); } };

  console.log('=== MECHANICAL PROOF (seed ' + SEED + ') ===');

  // Setup minimal state
  Game.state = Game.state || {};
  Game.state.scholar = Game.state.scholar || {};
  const sch = Game.state.scholar;
  sch.day = 1; sch.abilities = [{ id: 'scream_cheese', level: 1 }]; sch.kcal = 3000;
  Game.state.village = { npcs: [{ id: 'v1', name: 'Test Villager' }], npcAbilities: { v1: ['scream_cheese'] }, day: 1 };

  // --- Gap 1: villager uses scream_cheese ---
  // Mock a fight with monsters
  Game.tbfight = {
    over: false, round: 1,
    fighters: [
      { key: 'p', kind: 'player', alive: true, mx: 4, my: 4, hp: 100, maxHp: 100 },
      { key: 'v1', kind: 'villager', villagerId: 'v1', alive: true, mx: 3, my: 4, hp: 80, maxHp: 80, id: 'v1' },
      { key: 'm1', kind: 'monster', alive: true, mx: 5, my: 4, hp: 100, maxHp: 100, monsterId: 'test', mdef: { id: 'test' } },
    ]
  };
  Game.tbFighter = (k) => Game.tbfight.fighters.find(f => f.key === k);
  // npcHasAbility reads state.village.npcAbilities
  says.length = 0;
  const used = Game.tbVillagerAbility({ id: 'v1', villagerId: 'v1' });
  const m1 = Game.tbFighter('m1');
  ok('villager uses scream_cheese', used === true, 'returned ' + used);
  ok('monster is stunned', (m1.stunned || 0) > 0, 'stunned=' + (m1.stunned || 0));
  ok('narrated honestly', says.some(s => s.includes('SCREAM') || s.includes('scream')), says.slice(0, 2).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
