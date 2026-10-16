#!/usr/bin/env node
// DESIGN CALL #6 — batch verb scope (2026-10-16).
//
// RED→GREEN: batch verbs (process/cook/preserve-all) must see the container
// they're pointed at — especially the prepStash counter — and report honestly
// when there's nothing worth batching. Root cause: Game.cookAll() was
// hardcoded to the pack (its single-item sibling cookFood already took a
// container), and the counter UI never offered the batch forms.
//
// BEFORE=1 runs the same assertions against the pre-fix files from git HEAD
// (src/js/game.js, src/js/food.js): the container assertions fail (RED).
//
// Usage: node scripts/test-batch-20261016.js
//        BEFORE=1 node scripts/test-batch-20261016.js
//        SEED=99 node scripts/test-batch-20261016.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const BEFORE = !!process.env.BEFORE;
const SEED = parseInt(process.env.SEED || '20261016', 10);

// Files swapped for the RED run (pre-fix from git HEAD).
const PRE = ['src/js/game.js', 'src/js/food.js'];
if (BEFORE) {
  for (const f of PRE) {
    execSync(`git show HEAD:${f} > /tmp/batch-before-${path.basename(f)}`, { cwd: ROOT });
  }
  console.log('MODE: BEFORE (pre-fix files from git HEAD) — container assertions should FAIL');
} else {
  console.log('MODE: AFTER (fixed worktree code) — all assertions should PASS');
}
const srcOf = (f) => BEFORE && PRE.includes(f)
  ? fs.readFileSync(`/tmp/batch-before-${path.basename(f)}`, 'utf8')
  : fs.readFileSync(path.join(ROOT, f), 'utf8');

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture Math.random at load
Date.now = (() => { let n = 0; return () => 1760400000000 + (n++); })(); // deterministic clock

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global; // equipment.js touches window at load (browser-only in prod)
// FULL script list in index.html order, minus DOM-only (app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js)
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const order = [...html.matchAll(/<script src="(src\/js\/[^"]+)\?/g)].map(m => m[1])
  .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
const loadFails = [];
const gameIdx = order.indexOf('src/js/game.js');
// Block scope for the export shield: `const module` at file top level would
// collide with the CJS wrapper's `module` param (parse-time SyntaxError),
// and then node loads the file as ESM where `require` is undefined.
{
const module = { exports: {} }; // export shield: module guards write to a throwaway
const exports = module.exports;
const evalFile = (f) => {
  try { eval(srcOf(f) + '\n//# sourceURL=' + f); }
  catch (e) { loadFails.push(f + ': ' + e.message); }
};
for (const [i, f] of order.entries()) {
  if (gameIdx >= 0 && i >= gameIdx) continue;
  evalFile(f);
}
if (gameIdx >= 0) evalFile(order[gameIdx]);
global.Game = globalThis.Scattering.Game;
for (const [i, f] of order.entries()) {
  if (gameIdx < 0 || i <= gameIdx) continue;
  evalFile(f);
}
}
delete global.window; // drop the stub: runtime checks take the sync path without window
if (loadFails.length) { console.error('EVAL FAILURES:\n' + loadFails.join('\n')); process.exit(2); }

const Game = globalThis.Scattering.Game;
Game.audioEvent = () => {}; // headless: no audio

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
  Game.nearFire = () => true;
  Game.audioEvent = () => {};
  const s = Game.state.scholar;
  s.tools = s.tools || [];
  if (!s.tools.some(t => /knife/i.test(t.name || ''))) s.tools.push({ name: 'stone knife', recipeId: 'stone_knife', uses: 10 });
  s.inventory = [];
  s.prepStash = [];
  Game.state.fires = [];
  says.length = 0;
  Game.say = (m) => says.push(String(m)); // capture narration (never stub Game.save)
}
const day = () => Game.state.scholar.day;
const stashOf = () => Game.prepStash();

// Fixtures ---------------------------------------------------------------
const mkCarcass = () => ({ name: 'White-tailed deer (carcass)', plantId: 'meat_white_tailed_deer', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 4000, how: 'hunt', spoilDay: day() + 2, units: 1, kg: 20 });
const mkCleaned = (fresh = true) => ({ name: 'venison (cleaned)', plantId: 'meat_white_tailed_deer', foodKind: 'meat', foodState: 'cleaned', kcalEach: 400, units: 2, spoilDay: fresh ? day() + 2 : day() - 1, diseaseRisk: { type: 'raw_meat' }, kg: 0.8 });
const mkFat = () => ({ name: 'deer fat (raw)', plantId: 'fat_white_tailed_deer', foodKind: 'fat', foodState: 'raw', kcalEach: 0, hiddenKcal: 800, units: 2, spoilDay: day() + 3, kg: 1 });
const mkRaw = () => ({ name: 'raw fish', foodKind: 'meat', foodState: 'raw', rawKcal: 600, kcalEach: 400, spoilDay: day() + 3, units: 1, kg: 0.6 });

(async () => {
  await new Promise(r => setTimeout(r, 0)); // macrotask yield: deferred installers (harness parity)
  await Game.init();

  // T1 — cookAll sees the stash container (THE root-cause assertion).
  freshGame();
  {
    const stash = stashOf();
    const fish = mkRaw(), meat = mkCleaned();
    stash.push(fish, meat);
    Game.cookAll(stash);
    ok('T1 cookAll(stash) cooks the stash raw fish', fish.rawKcal == null, 'rawKcal=' + fish.rawKcal);
    ok('T1 cookAll(stash) cooks the stash cleaned meat', meat.foodState === 'cooked', 'foodState=' + meat.foodState);
    ok('T1 pack untouched by stash batch', Game.state.scholar.inventory.length === 0);
  }

  // T2 — clean/smoke/render batch act on the stash, leave the pack alone.
  freshGame();
  {
    const stash = stashOf();
    const packControl = mkCleaned();
    Game.state.scholar.inventory.push(packControl);
    stash.push(mkCarcass(), mkCleaned(), mkFat());
    Game.cleanCarcass(undefined, stash);
    ok('T2 batch clean: no carcasses left in stash', !stash.some(i => i.foodState === 'carcass'));
    ok('T2 batch clean: carcass became cleaned meat in the stash', stash.some(i => i.foodState === 'cleaned'));
    Game.preserveFood(undefined, stash);
    ok('T2 batch smoke: stash cleaned/cooked meat all preserved',
      !stash.some(i => i.foodKind === 'meat' && (i.foodState === 'cleaned' || i.foodState === 'cooked')));
    ok('T2 pack control meat NOT smoked by stash batch', packControl.foodState === 'cleaned', 'foodState=' + packControl.foodState);
    Game.renderFat(undefined, stash);
    ok('T2 batch render: no raw fat left in stash',
      !stash.some(i => i.foodKind === 'fat' && i.foodState === 'raw'));
    ok('T2 pack still exactly the control item', Game.state.scholar.inventory.length === 1);
  }

  // T3 — honest feedback on empty containers (no silent no-ops).
  freshGame();
  {
    Game.cookAll([]);
    ok('T3 empty cookAll says so', says.some(m => m.includes('Nothing raw to cook')), says.join(' | '));
    says.length = 0;
    Game.cleanCarcass(undefined, []);
    ok('T3 empty clean says so', says.some(m => m.includes('No carcasses to clean')), says.join(' | '));
    says.length = 0;
    Game.preserveFood(undefined, []);
    ok('T3 empty smoke says so', says.some(m => m.includes('Nothing to preserve')), says.join(' | '));
    says.length = 0;
    Game.renderFat(undefined, []);
    ok('T3 empty render says so', says.some(m => m.includes('No raw fat to render')), says.join(' | '));
  }

  // T4 — spoiled inputs are dropped honestly, never batched.
  freshGame();
  {
    const stash = stashOf();
    const fresh = mkCleaned(true), rotten = mkCleaned(false);
    stash.push(fresh, rotten);
    Game.preserveFood(undefined, stash);
    ok('T4 spoiled meat dropped, not smoked', stash.length === 1 && stash[0] === fresh,
      'stash len=' + stash.length);
    ok('T4 fresh meat smoked', fresh.foodState === 'preserved', 'foodState=' + fresh.foodState);
    ok('T4 drop narrated honestly', says.some(m => m.includes('went bad')), says.join(' | '));
  }

  // T5 — default container unchanged: cookAll() with no args cooks the pack.
  freshGame();
  {
    const packFish = mkRaw(), stashFish = mkRaw();
    Game.state.scholar.inventory.push(packFish);
    stashOf().push(stashFish);
    Game.cookAll();
    ok('T5 cookAll() still cooks the pack by default', packFish.rawKcal == null, 'rawKcal=' + packFish.rawKcal);
    ok('T5 cookAll() does not reach into the stash unasked', stashFish.rawKcal === 600, 'rawKcal=' + stashFish.rawKcal);
  }

  console.log(`\n${pass} passed, ${fail} failed (${BEFORE ? 'BEFORE' : 'AFTER'} mode, seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH: ' + (e && e.stack || e)); process.exit(2); });
