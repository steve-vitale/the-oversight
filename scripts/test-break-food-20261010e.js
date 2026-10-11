#!/usr/bin/env node
// BREAK-IT: food economy, round 4 (2026-10-10). Hostile attacks on vectors the
// 2026-10-09 layers and today's r1/r2/r3 did NOT cover:
//
// W1. EXPLOIT/SOFTLOCK — kg convention split (the big one). The tree's canon
//     convention is kg PER-UNIT (packWeight/canCarry/dig-up/UI all compute
//     kg*units; the lump code documents it twice: "kg is PER-UNIT everywhere").
//     But the butchering block writes TOTAL-stack kg:
//       - carcassToMeat (self):      it.kg = gross*yfrac/1000        (2 sites)
//       - raw fat slabs:             kg = fatKcal*fatUnits/900       (2 sites)
//       - butcher materials:         kg = matKg*n                    (2 sites)
//       - renderFat:                 kg = per*units/900              (1 site)
//       - makePemmican:              kg = 0.3*bars                   (1 site)
//     A butchered deer (net 6000 kcal, 12 portions) writes kg=6 and the pack
//     counts 6*12 = 72 kg against a 20-kg carryCapacity. Butcher ONE deer and
//     canCarry() fails for EVERYTHING — loot, caches, quest items. Phantom
//     weight: the first big-game butcher bricks the pack. (Eating then sheds
//     phantom weight 8 kg a bite; the UI density line reads kg*units too.)
//     FIX: all 8 writers go per-unit (meat kg = kcalEach/1000, fat per/900,
//     materials matKg, pemmican 0.3/bar).
//
// Usage: node scripts/test-break-food-20261010e.js
//        BEFORE=1 node scripts/test-break-food-20261010e.js
//        SEED=99 node scripts/test-break-food-20261010e.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const BEFORE = !!process.env.BEFORE;
const SEED = parseInt(process.env.SEED || '20261010', 10);

// Files this run changes. BEFORE mode loads them from git HEAD.
const PRE = ['src/js/food.js'];
if (BEFORE) {
  for (const f of PRE) {
    execSync(`git show HEAD:${f} > /tmp/bf10e-before-${path.basename(f)}`, { cwd: ROOT });
  }
  console.log('MODE: BEFORE (pre-fix files from git HEAD)');
} else {
  console.log('MODE: AFTER (fixed worktree code)');
}
const srcOf = (f) => BEFORE && PRE.includes(f)
  ? fs.readFileSync(`/tmp/bf10e-before-${path.basename(f)}`, 'utf8')
  : fs.readFileSync(path.join(ROOT, f), 'utf8');

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 1; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture Math.random at load

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global; // equipment.js touches window at load (browser-only in prod)
// FULL script list in index.html order, minus DOM-only (app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js)
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const FILES = [...html.matchAll(/<script src="(src\/js\/[^"]+)\?/g)].map(m => m[1])
  .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
for (const f of FILES) {
  try { eval(srcOf(f)); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window; // drop the stub: runtime checks take the sync path without window
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const says = [];
function freshGame() {
  says.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  try { Game.state.scholar.insideHaven = true; } catch (e) {}
  return Game.state.scholar;
}
function butcherSelf(animalId, name, gross) {
  const s = Game.state.scholar;
  const day = s.day || 1;
  const carcass = Game.foodCarcass({ id: animalId, name }, gross, day, 'hunted');
  s.inventory.push(carcass);
  const wBefore = Game.packWeight();
  Game.carcassToMeat(s.inventory, s.inventory.indexOf(carcass), true);
  const wAfter = Game.packWeight();
  const meat = s.inventory.find(i => i.foodKind === 'meat' && i.foodState === 'cleaned');
  return { s, meat, wBefore, wAfter };
}

(async () => {
  await Game.init();
  const osay = Game.say.bind(Game);
  Game.say = (t) => { says.push(String(t)); return osay(t); };
  Game.drama = () => {};
  Game.audioEvent = () => {};
  console.log(`seed=${SEED}`);

// ---------- W1: butchered deer writes per-unit kg ----------
(function () {
  freshGame();
  const { s, meat, wBefore, wAfter } = butcherSelf('white_tailed_deer', 'White-tailed deer', 20000);
  ok('W1a meat stack exists', !!meat && (meat.units || 0) > 1, `units=${meat && meat.units}`);
  // Per-unit convention: 1000 kcal/kg meat -> kg/unit = kcalEach/1000.
  const expect = (meat.kcalEach || 0) / 1000;
  ok('W1b butcher kg is per-unit', Math.abs((meat.kg || 0) - expect) < 0.06,
    `kg=${meat.kg}, kcalEach=${meat.kcalEach}, want~${expect.toFixed(2)}`);
  const gained = wAfter - wBefore;
  // Honest accounting, derived INDEPENDENTLY of the written kg values: the
  // 20-kg carcass (kcal/1000, units=1) is consumed and replaced by products.
  // Meat weighs ~1000 kcal/kg; materials weigh their table rate. Butchering
  // sheds inedible mass (waste) — the pack gets LIGHTER, never units x
  // heavier. (BEFORE: gained=+60kg, pack bricked.)
  const matKg = { hide: 0.8, bone: 0.2, feather: 0.05, antler: 0.4, shell: 1.0, quill: 0.02, tusk: 0.3 };
  let honestProducts = (meat.units || 0) * (meat.kcalEach || 0) / 1000;
  for (const it of s.inventory) {
    if (it.material && matKg[it.material] != null) honestProducts += (it.units || 1) * matKg[it.material];
  }
  ok('W1c packWeight accounting is honest (carcass out, products in)',
    Math.abs(gained - (honestProducts - 20)) < 1.0,
    `gained=${gained.toFixed(1)}kg, honest products~${honestProducts.toFixed(1)}kg, carcass=20kg`);
})();

// ---------- W2: the haul softlock — canCarry survives one deer ----------
(function () {
  freshGame();
  const { meat } = butcherSelf('white_tailed_deer', 'White-tailed deer', 20000);
  ok('W2a deer butchered', !!meat);
  ok('W2b pack not bricked: canCarry(1) after one deer', Game.canCarry(1),
    `packWeight=${Game.packWeight().toFixed(1)}kg, cap=${Game.packCapacity()}kg`);
  ok('W2c packWeight under capacity', Game.packWeight() <= Game.packCapacity(),
    `packWeight=${Game.packWeight().toFixed(1)}kg`);
})();

// ---------- W3: raw fat slabs are per-slab ----------
(function () {
  freshGame();
  const { s, meat } = butcherSelf('black_bear', 'Black bear', 30000);
  ok('W3a bear butchered', !!meat);
  const fat = s.inventory.find(i => i.foodKind === 'fat' && i.foodState === 'raw');
  ok('W3b fat stack exists', !!fat && (fat.units || 0) === 6, `units=${fat && fat.units}`);
  // per-slab: 900 kcal/kg fat -> kg = hiddenKcal/900
  const expect = (fat.hiddenKcal || 0) / 900;
  ok('W3c raw fat kg is per-slab', Math.abs((fat.kg || 0) - expect) < 0.06,
    `kg=${fat.kg}, hiddenKcal=${fat.hiddenKcal}, want~${expect.toFixed(2)}`);
})();

// ---------- W4: butcher materials are per-item ----------
(function () {
  freshGame();
  const { s } = butcherSelf('black_bear', 'Black bear', 30000);
  const hide = s.inventory.find(i => i.material === 'hide');
  const bone = s.inventory.find(i => i.material === 'bone');
  ok('W4a hide/bone exist', !!hide && !!bone, `hide=${!!hide} bone=${!!bone}`);
  if (hide) ok('W4b hide kg is per-item (0.8)', Math.abs((hide.kg || 0) - 0.8) < 1e-9,
    `kg=${hide.kg}, units=${hide.units}`);
  if (bone) ok('W4c bone kg is per-item (0.2)', Math.abs((bone.kg || 0) - 0.2) < 1e-9,
    `kg=${bone.kg}, units=${bone.units}`);
})();

// ---------- W5: renderFat writes per-unit kg ----------
(function () {
  freshGame();
  const { s } = butcherSelf('black_bear', 'Black bear', 30000);
  const fat = s.inventory.find(i => i.foodKind === 'fat' && i.foodState === 'raw');
  ok('W5a raw fat to render', !!fat);
  const oNear = Game.nearFire, oKnows = Game.knowsTechnique;
  Game.nearFire = () => true;
  Game.knowsTechnique = (t) => t === 'render' ? true : oKnows.call(Game, t);
  Game.renderFat();
  Game.nearFire = oNear; Game.knowsTechnique = oKnows;
  const rendered = s.inventory.find(i => i.foodKind === 'fat' && i.foodState === 'rendered');
  ok('W5b rendered fat exists', !!rendered);
  if (rendered) {
    const per = Math.max(1, Math.round((rendered.hiddenKcal || 0)));
    const expect = per / 900;
    ok('W5c rendered kg is per-unit', Math.abs((rendered.kg || 0) - expect) < 0.06,
      `kg=${rendered.kg}, kcalEach=${rendered.kcalEach}, want~${expect.toFixed(2)}`);
  }
})();

// ---------- W6: pemmican bars weigh 0.3 each, not 0.3 x bars ----------
(function () {
  freshGame();
  const s = Game.state.scholar, day = s.day || 1;
  s.inventory.push(
    { name: 'Smoked venison', foodKind: 'meat', foodState: 'preserved', edible: true, units: 2, unit: 'portion', kcalEach: 500, kg: 0.5, spoilDay: day + 30, safe: true },
    { name: 'Bear fat (rendered)', foodKind: 'fat', foodState: 'rendered', edible: true, units: 1, unit: 'slab', kcalEach: 900, hiddenKcal: 900, kg: 1.0, spoilDay: day + 90, safe: true },
    { name: 'Blackberries', foodKind: 'plant', plantId: 'blackberries', edible: true, units: 2, unit: 'handful', kcalEach: 100, kg: 0.1, spoilDay: day + 3 },
  );
  const oKnows = Game.knowsTechnique;
  Game.knowsTechnique = (t) => t === 'render' ? true : oKnows.call(Game, t);
  const plan = Game.pemmicanPlan();
  ok('W6a one pemmican set planned', plan.length === 1, `sets=${plan.length}`);
  Game.makePemmican();
  Game.knowsTechnique = oKnows;
  const bars = s.inventory.find(i => i.itemId === 'pemmican');
  ok('W6b pemmican exists', !!bars && (bars.units || 0) >= 1, `bars=${bars && bars.units}`);
  if (bars) ok('W6c pemmican kg is per-bar (0.3)', Math.abs((bars.kg || 0) - 0.3) < 1e-9,
    `kg=${bars.kg}, bars=${bars.units}`);
})();

// ---------- W7: specialist butcher path (askSpecialist) is per-unit too ----------
(function () {
  freshGame();
  const s = Game.state.scholar, day = s.day || 1;
  const carcass = Game.foodCarcass({ id: 'white_tailed_deer', name: 'White-tailed deer' }, 20000, day, 'hunted');
  s.inventory.push(carcass);
  const oSH = Game.specialistsHere, oVP = Game.villagePeople;
  Game.specialistsHere = () => [{ id: 'sp1', name: 'Spec', skill: 2 }];
  Game.villagePeople = () => [{ id: 'sp1' }];
  try { Game.askSpecialist('sp1', s.inventory.indexOf(carcass), null, 'butcher'); } catch (e) { console.log('  note: askSpecialist threw: ' + e.message); }
  Game.specialistsHere = oSH; Game.villagePeople = oVP;
  const meat = s.inventory.find(i => i.foodKind === 'meat' && i.foodState === 'cleaned');
  ok('W7a specialist butchered', !!meat && (meat.units || 0) > 1, `units=${meat && meat.units}`);
  if (meat) {
    const expect = (meat.kcalEach || 0) / 1000;
    ok('W7b specialist butcher kg is per-unit', Math.abs((meat.kg || 0) - expect) < 0.06,
      `kg=${meat.kg}, kcalEach=${meat.kcalEach}, want~${expect.toFixed(2)}`);
  }
})();

// ---------- W8: eating sheds honest weight ----------
(function () {
  freshGame();
  const { s, meat } = butcherSelf('white_tailed_deer', 'White-tailed deer', 20000);
  const idx = s.inventory.indexOf(meat);
  s.kcal = 0;
  const wBefore = Game.packWeight();
  Game.eatOne(idx);
  const wAfter = Game.packWeight();
  const shed = wBefore - wAfter;
  ok('W8 eating one portion sheds one portion of weight',
    Math.abs(shed - (meat.kg || 0)) < 0.06 && shed < 1.5,
    `shed=${shed.toFixed(2)}kg, per-unit kg=${(meat.kg || 0).toFixed(2)}`);
})();

console.log(`\n${pass} passed, ${fail} failed (seed=${SEED}, ${BEFORE ? 'BEFORE' : 'AFTER'})`);
process.exit(fail ? 1 : 0);
})();
