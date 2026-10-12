#!/usr/bin/env node
// shareFood wiring proof (journey-endgame r3, 2026-10-11): the ledger's
// shareFood() was UNWIRED — donations built trust but never the moral
// ledger the table prices on (foodShared/foodStance). This run wires the
// deliberate gift paths: donateToPantry, giveFood (game.js base), and the
// carexplore.js giveFood override. The automatic homecoming pool split
// stays unwired by design (the standing custom, not generosity).
//
// Before: shareFood had zero callers (grep) — foodShared only moved via
// teaching. After: real gifts move it, crumbs don't, stance transitions
// narrate, moments don't flood.
//
// Run: node scripts/test-sharefood-wiring-20261011.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
Game.save = function () {};

function foodShared() { return (Game.ledger().foodShared || 0); }
function moments() { return ((Game.progState() || {}).moments || []).length; }

function givePlayerFood(kcalEach, units, name) {
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  s.inventory.push({ name: name || 'test food', kcalEach, units: units || 1, edible: true, foodState: 'cooked' });
  return s.inventory.length - 1;
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  console.log('— donateToPantry wires shareFood —');
  const base = foodShared();
  const idx = givePlayerFood(600, 4, 'feast bread'); // 2400 kcal
  Game.donateToPantry(idx);
  ok(foodShared() > base, 'pantry donation moves foodShared', `before ${base} after ${foodShared()}`);
  ok(foodShared() === base + 2, '2400 kcal = 2 points (1 per 1000, floored at 1)', `got ${foodShared() - base}`);

  console.log('— crumbs do not count —');
  const b2 = foodShared();
  const cidx = givePlayerFood(50, 1, 'crumb'); // 50 kcal < 200 bar
  Game.donateToPantry(cidx);
  ok(foodShared() === b2, '50-kcal crumb does not move foodShared', `before ${b2} after ${foodShared()}`);

  console.log('— giveFood (base) wires shareFood —');
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 0, 'a villager exists to receive a gift');
  const b3 = foodShared();
  const gidx = givePlayerFood(800, 2, 'gift stew'); // units>1: base giveFood gives 1 unit = 800 kcal
  // base giveFood takes the first edible stack; ensure ours is findable
  Game.giveFood(roster[0]);
  ok(foodShared() > b3, 'personal gift moves foodShared', `before ${b3} after ${foodShared()}`);

  console.log('— carexplore override wires shareFood —');
  const b4 = foodShared();
  givePlayerFood(500, 4, 'override meal');
  const r = Game.giveFood(roster[0], 'meal');
  ok(r && r.ok, 'override gift completes', JSON.stringify(r && { ok: r.ok, amount: r.amount }));
  ok(foodShared() > b4, 'override gift moves foodShared', `before ${b4} after ${foodShared()}`);

  console.log('— moments do not flood —');
  const m0 = moments();
  // several small deliberate gifts: ledger moves, moments stay quiet below the feast bar
  for (let i = 0; i < 3; i++) { givePlayerFood(300, 1, 'small gift ' + i); Game.donateToPantry(Game.state.scholar.inventory.length - 1); }
  const m1 = moments();
  ok(m1 === m0, 'sub-1000-kcal gifts write no moment (no viewership inflation)', `moments ${m0} -> ${m1}`);
  // a feast-scale gift DOES make the village memory
  givePlayerFood(600, 3, 'feast haunch'); // 1800 kcal
  Game.donateToPantry(Game.state.scholar.inventory.length - 1);
  ok(moments() === m1 + 1, '1800-kcal gift writes one moment', `moments ${m1} -> ${moments()}`);

  console.log('— stance resolves from real gifts —');
  const stance = Game.foodStance();
  ok(stance.key === 'sharer' || stance.key === 'even', 'stance reflects giving (not stuck at even-zero)',
    `stance ${stance.key} shared=${stance.shared} hoarded=${stance.hoarded}`);
  ok(stance.shared > 0, 'foodShared is positive after real gifts');

  console.log('— the table prices the gifts —');
  // food truth shared > hoarded reads light on the branch axis
  Game.ledgerAdd('foodHoarded', 0);
  const L = Game.ledger();
  ok((L.foodShared || 0) > (L.foodHoarded || 0), 'shared exceeds hoarded after generous play');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log(' - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
