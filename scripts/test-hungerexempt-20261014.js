#!/usr/bin/env node
// HUNGER-EXEMPT THROTTLE PROOF (fleshout-b, 2026-10-14).
//
// THE ARM: the landed production-throttle lever (afb736e6) cut fresh-rot
// -41% but its confirm was NO-GO at guardrails (median survival -14d,
// starvation deaths +12). The pilot's metric review proposed the thinner-
// buffer-cost arm: exempt the redirect while any villager is actively
// hungry. This proof tests the exemption's mechanism.
//
// THE SIGNAL (engine-honest, not a proxy): progState().hungryStreak —
// anyStarving out of villageEats: some villager ate under 60% of
// (ration-adjusted) need, not fasting, not on voted half-rations. The same
// signal that fires the hunger-winter crisis. The empty-pantry clock
// v.hungryDays is MUTUALLY EXCLUSIVE with the throttle (an empty pantry
// never engages — pantryFreshDays()=0), so it cannot gate the exemption;
// this is asserted in §4.
//
// RED PHASE: `git diff src/js/game.js > /tmp/he.patch && git checkout
// HEAD -- src/js/game.js`, then MODE=red node this script — the exemption
// assertions must show INERT (redirect fires into hunger). Then
// `git apply /tmp/he.patch` and MODE=green: all pass.
//
// Harness: mulberry32, SEED env override (default 20261014), full src/js
// module list in index.html order minus DOM-only files and drama.js, window
// stubbed for eval then deleted, Math.random seeded BEFORE eval. Never
// stubs Game.save.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

// MODE=red: pristine tree — exemption inert. MODE=green: armed tree — exemption fires.
// HUNGEREXEMPT=0 (control side): exemption disabled — asserts the inert shape.
const MODE = process.env.MODE === 'red' ? 'red' : 'green';
const expectExempt = MODE === 'green' && process.env.HUNGEREXEMPT !== '0';
console.log(`MODE=${MODE} (exemption ${expectExempt ? 'armed — must fire' : 'absent — must be inert'})`);

const said = [];
const freshItem = (name, kcal, daysLeft) => ({
  name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true,
  spoilDay: Game.state.scholar.day + daysLeft,
});

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.nearFire = () => true;
  Game.state.scholar.day = 10;
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const v = Game.state.village;
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500];
  const pg = (typeof Game.progState === 'function') ? Game.progState() : {};

  console.log('== 1. LANDED BEHAVIOR PRESERVED: no hunger -> redirect fires (both modes) ==');
  v.pantry = [freshItem('Foraged food', 15000, 3)]; // ~10 fresh-days: engaged
  pg.hungryStreak = 0; // nobody hungry yesterday
  v.throttleRedirects = 0; v.throttleExemptHunger = 0;
  said.length = 0;
  const a1 = { task: 'forage' };
  Game.resolveOneAssignment(vid, a1);
  check('redirect fires when nobody is hungry', ['wood', 'water', 'stone'].includes(a1.task), 'a.task=' + a1.task);
  check('redirect narrated (the landed beat)', said.some(s => /leaves the forage standing/.test(s) && /days of fresh/.test(s)),
    said.filter(s => /pantry/.test(s)).slice(0, 1).join('').slice(0, 120));
  check('redirect counted', (v.throttleRedirects || 0) === 1, 'redirects=' + v.throttleRedirects);
  check('exemption NOT counted', (v.throttleExemptHunger || 0) === 0, 'exempt=' + (v.throttleExemptHunger || 0));

  console.log('== 2. ACTIVE HUNGER: hungryStreak>0 changes the redirect decision ==');
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  pg.hungryStreak = 3; // yesterday some villager genuinely under-ate
  v.throttleRedirects = 0; v.throttleExemptHunger = 0;
  said.length = 0;
  const a2 = { task: 'forage' };
  Game.resolveOneAssignment(vid, a2);
  if (expectExempt) {
    check('[GREEN] production continues — task NOT redirected', a2.task === 'forage', 'a.task=' + a2.task);
    check('[GREEN] no redirect counted', (v.throttleRedirects || 0) === 0, 'redirects=' + v.throttleRedirects);
    check('[GREEN] exemption counted on the village ledger', (v.throttleExemptHunger || 0) === 1, 'exempt=' + v.throttleExemptHunger);
    const beat = said.filter(s => /hungry/.test(s));
    check('[GREEN] the decision is narrated, not silent', beat.length >= 1, beat.slice(0, 1).join('').slice(0, 160));
    check('[GREEN] narration names what the villager keeps doing', beat.some(s => /keeps working the forage/.test(s)),
      beat.slice(0, 1).join('').slice(0, 160));
    check('[GREEN] narration is honest about the pantry state', beat.some(s => /days of fresh/.test(s)));
    check('[GREEN] the redirect beat does NOT fire', !said.some(s => /leaves the forage standing/.test(s)));
  } else {
    check('[RED] exemption inert: redirect still fires into hunger', ['wood', 'water', 'stone'].includes(a2.task), 'a.task=' + a2.task);
    check('[RED] no exemption ledger on pristine code', (v.throttleExemptHunger || 0) === 0, 'exempt=' + (v.throttleExemptHunger || 0));
  }

  console.log('== 3. HUNGEREXEMPT=0 disables the exemption (instrumentation control) ==');
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  pg.hungryStreak = 3;
  v.throttleRedirects = 0; v.throttleExemptHunger = 0;
  said.length = 0;
  const envWas = process.env.HUNGEREXEMPT; // save: §3 must restore the side's gate value
  process.env.HUNGEREXEMPT = '0';
  const a3 = { task: 'forage' };
  Game.resolveOneAssignment(vid, a3);
  if (envWas === undefined) delete process.env.HUNGEREXEMPT;
  else process.env.HUNGEREXEMPT = envWas;
  check('HUNGEREXEMPT=0: redirect fires despite hungryStreak', ['wood', 'water', 'stone'].includes(a3.task), 'a.task=' + a3.task);
  check('HUNGEREXEMPT=0: redirect counted, not exemption', (v.throttleRedirects || 0) === 1 && (v.throttleExemptHunger || 0) === 0,
    `redirects=${v.throttleRedirects} exempt=${v.throttleExemptHunger}`);

  console.log('== 4. MUTUAL EXCLUSIVITY: the empty-pantry clock cannot gate the exemption ==');
  v.pantry = []; // pantry empty
  v.burnHistory = [];
  v.hungryDays = 5; // village IS on the empty-pantry hunger clock
  check('empty pantry never engages, even on the hunger clock', Game.prodThrottleEngaged() === false,
    'freshDays=' + Game.pantryFreshDays().toFixed(1) + ' hungryDays=' + v.hungryDays);
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500];
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  check('engaged pantry implies a non-empty pantry (hungryDays resets)', Game.prodThrottleEngaged() === true);
  console.log('  (note: a v.hungryDays>0 gate would be a dead branch — it can never fire while the throttle engages)');

  console.log('== 5. EXEMPTION DOES NOT advance the wood/water/stone rotation ==');
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  pg.hungryStreak = 3;
  v.throttleAltRot = 7;
  v.throttleRedirects = 0; v.throttleExemptHunger = 0;
  const rotBefore = v.throttleAltRot;
  Game.resolveOneAssignment(vid, { task: 'garden' });
  if (expectExempt) {
    check('[GREEN] rotation untouched on the exempt path', (v.throttleAltRot || 0) === rotBefore, 'rot ' + rotBefore + ' -> ' + v.throttleAltRot);
  } else {
    check('[RED] rotation advances on the pristine redirect path', (v.throttleAltRot || 0) === rotBefore + 1, 'rot ' + rotBefore + ' -> ' + v.throttleAltRot);
  }
  check('garden also exempts', expectExempt ? (v.throttleExemptHunger || 0) === 1 : (v.throttleRedirects || 0) === 1,
    `redirects=${v.throttleRedirects} exempt=${v.throttleExemptHunger}`);

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join('; ')}` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
