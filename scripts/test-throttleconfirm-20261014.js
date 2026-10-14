#!/usr/bin/env node
// THROTTLE-CONFIRM MEASUREMENT PROOF (fleshout-b, 2026-10-14).
//
// This is the §10-12 CONFIRM of the landed prodthrottle lever (afb736e6).
// It proves the MEASUREMENT, not the lever (the lever's own proof lives in
// scripts/test-prodthrottle-20261013.js). The confirm compares two sides on
// IDENTICAL seeds: side "on" = landed code, side "off" = prodThrottleEngaged()
// patched to `return false` in the worker's worktree (never committed).
//
// SIDE=on|off (declared side — the script asserts the tree matches it).
// Usage:
//   SIDE=on  node scripts/test-throttleconfirm-20261014.js          # landed side
//   SIDE=off node scripts/test-throttleconfirm-20261014.js          # patched side
//   SMOKE=1 node scripts/measure-prodthrottle-20261013.js           # instrument gate
//   node scripts/test-throttleconfirm-20261014.js --check-dirs <beforeDir> <armedDir>
//
// Harness: mulberry32, SEED env override (default 20261014), full src/js
// module list in index.html order minus DOM-only files and drama.js, window
// stubbed for eval then deleted, Math.random seeded BEFORE eval. Never
// stubs Game.save.
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261014', 10);
Math.random = mulberry32(SEED);
const ROOT = path.join(__dirname, '..');
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log(`LOAD FAIL ${f}: ${e.message}`); } });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

const SIDE = process.env.SIDE || 'on';

// --check-dirs: assert identical seed sets per policy between the two sides.
if (process.argv[2] === '--check-dirs') {
  const [beforeDir, armedDir] = process.argv.slice(3);
  const keys = (d) => fs.readdirSync(d).filter(f => f.endsWith('.json'))
    .map(f => { const m = f.match(/-(leadcourt|belongseek)-s(\d+)\.json$/); return m ? m[1] + ':' + m[2] : null; })
    .filter(Boolean).sort();
  const b = keys(beforeDir), a = keys(armedDir);
  check('same number of per-seed files', b.length === a.length, `${b.length} vs ${a.length}`);
  check('identical policy:seed sets both sides', JSON.stringify(b) === JSON.stringify(a),
    b.length ? `first ${b[0]}, last ${b[b.length - 1]}` : 'empty');
  const overlap = [101, 202, 303, 404, 505, 606, 707, 808, 909, 111, 222, 333].every(s => b.some(k => k.endsWith(':' + s)));
  check('confirm seeds are the 12 fresh seeds (101..333, not the pilot 11..88)', overlap);
  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nSEED IDENTITY GREEN');
  process.exit(fails.length ? 1 : 0);
}

const freshItem = (name, kcal, daysLeft) => ({
  name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true,
  spoilDay: Game.state.scholar.day + daysLeft,
});

(async () => {
  console.log('== 1. LEVER SHAPE matches declared side (' + SIDE + ') ==');
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  const m = gameSrc.match(/prodThrottleEngaged\(\)\s*\{([^}]*)\}/);
  check('prodThrottleEngaged found in game.js', !!m);
  const body = m ? m[1] : '';
  if (SIDE === 'on') {
    check('landed shape: pantryFreshDays() > 4', /pantryFreshDays\(\)\s*>\s*4/.test(body), body.trim());
    check('off-shape absent on the landed side', !/return\s+false/.test(body));
  } else {
    check('off-shape: unconditional false', /return\s+false/.test(body), body.trim());
  }

  console.log('== 2. FUNCTIONAL: engaged() honors the side ==');
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.feedback = function () {};
  Game.nearFire = () => true;
  Game.state.scholar.day = 10;
  const v = Game.state.village;
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500];
  v.pantry = [freshItem('Foraged food', 15000, 3)]; // ~10 fresh-days: engaged on landed side
  const expectEngaged = SIDE === 'on';
  check('engaged() === ' + expectEngaged + ' with a full pantry',
    Game.prodThrottleEngaged() === expectEngaged,
    'freshDays=' + Game.pantryFreshDays().toFixed(1));
  v.pantry = [];
  check('engaged() === false with an empty pantry (both sides)', Game.prodThrottleEngaged() === false);

  console.log('== 3. UNWRAP HONESTY (#69 — the policy-less bug shape) ==');
  const brokenMod = require('./policies/leadcourt');
  const pBroken = Object.assign({}, brokenMod);
  check('broken unwrap (raw module) leaves daily undefined — the #69 bug shape',
    typeof pBroken.daily === 'undefined', 'typeof=' + typeof pBroken.daily);
  const goodLead = require('./policies/leadcourt').leadcourt;
  const goodBelong = require('./policies/belongseek').belongseek;
  check('correct unwrap: leadcourt.daily is a function', goodLead && typeof goodLead.daily === 'function');
  check('correct unwrap: belongseek.daily is a function', goodBelong && typeof goodBelong.daily === 'function');
  const regSrc = fs.readFileSync(path.join(ROOT, 'scripts/measure-prodthrottle-20261013.js'), 'utf8');
  check('measure script unwraps the named export (both policies)',
    /require\('\.\/policies\/leadcourt'\)\.leadcourt/.test(regSrc) &&
    /require\('\.\/policies\/belongseek'\)\.belongseek/.test(regSrc));

  console.log('== 4. SMOKE GATE (instrument honesty) ==');
  try {
    execFileSync('node', [path.join(ROOT, 'scripts/measure-prodthrottle-20261013.js')],
      { cwd: ROOT, env: Object.assign({}, process.env, { SMOKE: '1' }), stdio: 'pipe', timeout: 240000 });
    check('SMOKE=1 gate passes — policies genuinely drive', true);
  } catch (e) {
    check('SMOKE=1 gate passes — policies genuinely drive', false, String(e.message).slice(0, 200));
  }

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join('; ')}` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
