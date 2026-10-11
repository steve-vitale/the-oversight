#!/usr/bin/env node
// BREAK-IT: food economy, round 5 (2026-10-11). Hostile attacks on vectors the
// 2026-10-09/10 layers did NOT cover:
//
// W1. EXPLOIT — stockSurplus (villager shared surplus -> pantry):
//     (a) Math.ceil(give/200) minted up to +199 phantom kcal per surplus — a
//         1-kcal share deposited a whole 200-kcal unit, always upward
//         (measured ~+5000 over 50 small surpluses). Energy from nothing.
//     (b) stockSurplus pushed straight into v.pantry, bypassing the pantry
//         cap — pantryAdd was the only capped door (same class as the r3
//         putAwayFinished fix). FIX: Math.round (symmetric, no bias) + clamp
//         the deposit to cap room.
// W2. EXPLOIT/HONESTY — returnToVillage auto-haul (the third pantry writer):
//     (a) no spoilage gate — returning with today's-spoiled food pooled ROT
//         into the pantry (donateToPantry's wrapper and putAwayFinished both
//         refuse it; the auto-haul didn't). Inflates feastPlan "have".
//     (b) `spoilDay: item.spoilDay || 9999` laundered spoilDay 0 (genuinely
//         spoiled) into IMMORTAL stores — a falsy clock is not a missing one.
//     (c) no pantry-cap check. FIX: refuse spoiled (narrated), `?? 9999`,
//         whole-haul cap guard (checked before the keep/give split so a
//         held-back split copy can never strand units).
// W3. HONESTY — the counter bite (eatStashOne) and the pack bite (eatOne)
//     skipped healing the design promises: the L3 copy says "+5 health when
//     eaten" and MEDICINE says chewing medicinal plants heals (knowledgeable:
//     real healing; ignorant: a whisper). Only the bulk eat() path granted
//     them — and eatOne is the live path since the Eat button was removed.
//     FIX: both bites grant L3 +5 / animal deep-master +5 / medicinal +2.
// W4. DEAD-CODE/ROBUSTNESS — wiring audit of the food module (the Alien
//     Players lesson: prove it's reachable) + the villagerFoodPoisoning guard
//     read `v.sick[vid]` before v.sick was inited (threw on a fresh village)
//     + one dead variable (specialist-cook `mult`). FIX: guard, removal.
//
// Usage: node scripts/test-break-food-20261011.js
//        BEFORE=1 node scripts/test-break-food-20261011.js   (pre-fix, from git HEAD)
//        SEED=99 node scripts/test-break-food-20261011.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const BEFORE = !!process.env.BEFORE;
const SEED = parseInt(process.env.SEED || '20261011', 10);

// Files this run changes. BEFORE mode loads them from git HEAD.
const PRE = ['src/js/game.js', 'src/js/food.js'];
if (BEFORE) {
  for (const f of PRE) {
    execSync(`git show HEAD:${f} > /tmp/bf11-before-${path.basename(f)}`, { cwd: ROOT });
  }
  console.log('MODE: BEFORE (pre-fix files from git HEAD)');
} else {
  console.log('MODE: AFTER (fixed worktree code)');
}
const srcOf = (f) => BEFORE && PRE.includes(f)
  ? fs.readFileSync(`/tmp/bf11-before-${path.basename(f)}`, 'utf8')
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
const pantryKcalOf = (v) => (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);

(async () => {
  await Game.init();
  const osay = Game.say.bind(Game);
  Game.say = (t) => { says.push(String(t)); return osay(t); };
  Game.drama = () => {};
  Game.audioEvent = () => {};
  console.log(`seed=${SEED}`);

// ---------- W1a: stockSurplus rounding — no systematic phantom ----------
(function () {
  freshGame();
  const v = Game.state.village;
  v.pantry = [];
  let real = 0;
  for (let i = 0; i < 50; i++) {
    const g = 1 + ((i * 137) % 400); // deterministic varied gives, 1..400
    real += g;
    Game.stockSurplus(v, g);
  }
  const deposited = pantryKcalOf(v);
  const phantom = deposited - real;
  // BEFORE (ceil): bias always upward, ~+100/surplus -> ~+5000. AFTER (round):
  // symmetric error, |phantom| small.
  ok('W1a villager surplus creates no systematic phantom kcal',
    phantom < 1500, `real=${real}, deposited=${deposited}, phantom=${phantom}`);
})();

// ---------- W1b: stockSurplus respects the pantry cap ----------
(function () {
  freshGame();
  const v = Game.state.village;
  v.pantry = [];
  const cap = Game.pantryCapKcal();
  let guard = 0;
  while (Game.pantryKcal() + 10000 <= cap && guard++ < 50) {
    Game.pantryAdd({ name: 'Dried beans', kcalEach: 500, units: 20, spoilDay: 9999, safe: true, kg: 0.5 });
  }
  const before = Game.pantryKcal();
  Game.stockSurplus(v, 5000);
  const after = Game.pantryKcal();
  ok('W1b villager surplus respects the pantry cap',
    after <= cap + 1, `cap=${cap}, before=${before}, after=${after}`);
})();

// ---------- W2a/b: auto-haul refuses spoiled food, no spoilDay laundering ----------
(function () {
  freshGame();
  const s = Game.state.scholar;
  const v = Game.state.village;
  v.pantry = [];
  const day = s.day;
  s.inventory = [
    // 10 units x 450 = 4500 kcal: the 2000-kcal keep takes 4, the spoiled
    // remainder (6 units) must go through the give path — the attack surface.
    { name: 'Smoked venison (test)', plantId: 'meat_white_tailed_deer', foodKind: 'meat', foodState: 'preserved', edible: true, units: 10, unit: 'portion', kcalEach: 450, spoilDay: day - 1, safe: true, kg: 0.45 },
    { name: 'Trail mix (test)', plantId: 'trail_mix', foodKind: 'plant', foodState: 'ready', edible: true, units: 10, unit: 'handful', kcalEach: 30, spoilDay: day + 5, safe: true, kg: 0.1 },
  ];
  try { Game.returnToVillage(); } catch (e) { console.log('  (returnToVillage threw: ' + e.message + ')'); }
  const hasRot = (v.pantry || []).some(i => /Smoked venison \(test\)/.test(i.name));
  const immortalRot = (v.pantry || []).some(i => /Smoked venison \(test\)/.test(i.name) && i.spoilDay === 9999);
  ok('W2a auto-haul refuses spoiled food', !hasRot,
    'spoiled test meat reached the pantry: ' + hasRot);
  ok('W2b no spoilDay laundering to immortal (|| 9999 -> ?? 9999)', !immortalRot,
    'spoilDay=9999 stamped on ex-spoiled meat: ' + immortalRot);
  const freshIn = (v.pantry || []).some(i => /Trail mix \(test\)/.test(i.name));
  ok('W2c fresh haul still pooled honestly', freshIn,
    'fresh trail mix missing from pantry');
})();

// ---------- W2d: auto-haul respects a full pantry ----------
(function () {
  freshGame();
  const s = Game.state.scholar;
  const v = Game.state.village;
  v.pantry = [];
  const cap = Game.pantryCapKcal();
  let guard = 0;
  while (Game.pantryKcal() + 10000 <= cap && guard++ < 50) {
    Game.pantryAdd({ name: 'Dried beans', kcalEach: 500, units: 20, spoilDay: 9999, safe: true, kg: 0.5 });
  }
  const beforeKcal = Game.pantryKcal();
  const day = s.day;
  s.inventory = [
    // 100 units x 30 = 3000 kcal: keep takes 66 (1980), 34 must go to give —
    // the cap guard is what stops them.
    { name: 'Trail mix (test2)', plantId: 'trail_mix', foodKind: 'plant', foodState: 'ready', edible: true, units: 100, unit: 'handful', kcalEach: 30, spoilDay: day + 5, safe: true, kg: 0.1 },
  ];
  try { Game.returnToVillage(); } catch (e) { console.log('  (returnToVillage threw: ' + e.message + ')'); }
  const afterKcal = Game.pantryKcal();
  const stillPacked = (s.inventory || []).some(i => /\(test2\)/.test(i.name));
  ok('W2d full pantry leaves the haul in your pack',
    afterKcal <= cap + 1 && stillPacked,
    `cap=${cap}, before=${beforeKcal}, after=${afterKcal}, stillPacked=${stillPacked}`);
})();

// ---------- W2e (sibling sweep): pantryAdd keeps a real spoilDay 0 ----------
(function () {
  freshGame();
  const v = Game.state.village;
  v.pantry = [];
  // SIBLING of the auto-haul `|| 9999` laundering: pantryAdd stamped
  // spoilDay 0 (a real, rotten clock) as 9999 (immortal). `??` fills only
  // the truly absent.
  Game.pantryAdd({ name: 'Day-zero greens (test)', plantId: 'dandelion', kcalEach: 25, units: 2, spoilDay: 0, safe: true, kg: 0.1, foodKind: 'plant', foodState: 'ready', edible: true });
  const it = (v.pantry || []).find(i => /Day-zero/.test(i.name));
  ok('W2e pantryAdd keeps a real spoilDay 0 (no immortal laundering)',
    !!it && it.spoilDay === 0, `spoilDay=${it && it.spoilDay}`);
})();

// ---------- W3a: counter bite grants the promised L3 +5 ----------
(function () {
  freshGame();
  const s = Game.state.scholar;
  Game.state.codex.plants = Game.state.codex.plants || {};
  // dandelion L3: "Eat regularly for +5 health." (medicinal too — assert >= +5
  // so the L3 grant is proven without coupling to the herb hook)
  Game.state.codex.plants['dandelion'] = { level: 3, tastings: 9 };
  Game.prepStash().push({ name: 'Dandelion greens', plantId: 'dandelion', foodKind: 'plant', foodState: 'ready', edible: true, units: 2, unit: 'handful', kcalEach: 25, spoilDay: s.day + 2, safe: true, kg: 0.1 });
  s.health = 50; s.kcal = 0;
  Game.eatStashOne(0);
  ok('W3a counter bite grants the promised L3 +5 health', s.health >= 55,
    `health 50 -> ${s.health}`);
})();

// ---------- W3b: pack bite chews medicinal plants (+2) ----------
(function () {
  freshGame();
  const s = Game.state.scholar;
  Game.state.codex.plants = Game.state.codex.plants || {};
  Game.state.codex.plants['dandelion'] = { level: 2, tastings: 0 }; // L2: no L3 +5 — isolates the herb hook
  s.inventory.push({ name: 'Dandelion greens', plantId: 'dandelion', foodKind: 'plant', foodState: 'ready', edible: true, units: 2, unit: 'handful', kcalEach: 25, spoilDay: s.day + 2, safe: true, kg: 0.1 });
  s.health = 50; s.kcal = 0;
  Game.eatOne(s.inventory.length - 1);
  ok('W3b pack bite chews medicinal plants (+2 health)', s.health === 52,
    `health 50 -> ${s.health}`);
})();

// ---------- W3c: counter bite chews medicinal plants (+2) ----------
(function () {
  freshGame();
  const s = Game.state.scholar;
  Game.state.codex.plants = Game.state.codex.plants || {};
  Game.state.codex.plants['dandelion'] = { level: 2, tastings: 0 };
  Game.prepStash().push({ name: 'Dandelion greens', plantId: 'dandelion', foodKind: 'plant', foodState: 'ready', edible: true, units: 2, unit: 'handful', kcalEach: 25, spoilDay: s.day + 2, safe: true, kg: 0.1 });
  s.health = 50; s.kcal = 0;
  Game.eatStashOne(0);
  ok('W3c counter bite chews medicinal plants (+2 health)', s.health === 52,
    `health 50 -> ${s.health}`);
})();

// ---------- W4a: the food module is wired — no dead systems ----------
(function () {
  const fns = ['butcherYieldFrac', 'carcassToMeat', 'cleanCarcass', 'cookTransform',
    'cookOutcome', 'downgradeOutcome', 'preserveFood', 'renderFat', 'makePemmican',
    'pemmicanPlan', 'pemmicanPreview', 'pantryDraw', 'drawSpoiled', 'packMeal',
    'stockSurplus', 'sweepSpoiled', 'isSpoiled', 'spoilBonusDays', 'eatStashOne',
    'hostFeast', 'feastPlan', 'grantFeastBuff', 'putAwayFinished', 'stageForPrep',
    'stacksMatch', 'pantryAdd', 'donateToPantry', 'takeFromPantry',
    'takeFromPantryBulk', 'buryCache', 'digUpCache', 'takeFromCache',
    'mealQuality', 'blendKcalQuality', 'overnightBankBurn', 'kcalCap'];
  const missing = fns.filter(f => typeof Game[f] !== 'function');
  ok('W4a every food system is wired and reachable', missing.length === 0,
    'missing: ' + missing.join(', '));
})();

// ---------- W4b: villagerFoodPoisoning survives a fresh village (no v.sick yet) ----------
(function () {
  freshGame();
  const v = Game.state.village;
  delete v.sick;
  let threw = false, ret = 'n/a';
  try { ret = Game.villagerFoodPoisoning(v, 'nobody', Game.freshExposure()); }
  catch (e) { threw = true; ret = 'threw: ' + e.message; }
  ok('W4b no crash on missing v.sick map', !threw && ret === 0,
    threw ? String(ret) : `ret=${ret}`);
})();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
