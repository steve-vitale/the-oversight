#!/usr/bin/env node
// PRODTHROTTLE PROOF (fleshout-b, 2026-10-13).
//
// THE LEVER: village-scale fresh-rot overproduction. The village produces
// far more 3-day-shelf fresh food than 12 mouths eat in 3 days (expiry-r16
// measured: Foraged food 1595k / Garden harvest 1321k / Fish catch 546k
// pantry-side inflows; 94% of rot is pantry-side village inflows the
// scholar never touches). When the pantry's fresh days-on-hand exceeds a
// threshold (design call: 4 days at current draw — Steve 2026-10-13
// make-the-call, documented for overrule), duty forage/garden/fish stops
// routing fresh surplus into stockPantry: villagers leave the surplus
// standing and take up non-perishable work (wood/water/stone).
//
// RED PHASE: run this on the PRISTINE tree — the assertions marked [RED]
// must FAIL (no gate, no redirect). Apply the lever, rerun: all PASS.
//
// Harness: mulberry32, SEED env override (default 20261013), full src/js
// module list in index.html order minus DOM-only files and drama.js, window
// stubbed for eval then deleted, Math.random seeded BEFORE eval. Never
// stubs Game.save.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261013', 10);
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

const said = [];
const freshItem = (name, kcal, daysLeft) => ({
  name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true,
  spoilDay: Game.state.scholar.day + daysLeft,
});
const preservedItem = (name, kcal) => Object.assign(freshItem(name, kcal, 30), { foodState: 'preserved' });
const pantryKcal = () => (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);

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
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500]; // measured draw ~1.5k

  console.log('== 1. GATE: above threshold (>4 fresh-days) redirects [RED] ==');
  v.pantry = [freshItem('Foraged food', 15000, 3)]; // 10 days of fresh at 1.5k burn
  v.throttleRedirects = 0;
  said.length = 0;
  check('gate engages above threshold', typeof Game.prodThrottleEngaged === 'function' && Game.prodThrottleEngaged() === true,
    'freshDays=' + (Game.pantryFreshDays ? Game.pantryFreshDays().toFixed(1) : 'n/a'));
  const before = pantryKcal();
  const a = { task: 'forage' };
  Game.resolveOneAssignment(vid, a);
  check('redirected duty does not stock fresh surplus', pantryKcal() === before, `pantry ${before} -> ${pantryKcal()}`);
  check('redirected task is non-perishable work', ['wood', 'water', 'stone'].includes(a.task), 'a.task=' + a.task);
  check('redirect is narrated legibly', said.some(s => /leaves the forage standing/.test(s) && /pantry/.test(s) && /days of fresh/.test(s)),
    said.filter(s => /leaves/.test(s)).slice(0, 1).join(''));
  check('redirect counted on the village ledger', v.throttleRedirects === 1, 'redirects=' + v.throttleRedirects);

  console.log('== 2. GATE: below threshold routes normally [RED] ==');
  v.pantry = [freshItem('Foraged food', 3000, 3)]; // 2 days of fresh
  v.throttleRedirects = 0;
  said.length = 0;
  check('gate disengages below threshold', typeof Game.prodThrottleEngaged === 'function' && Game.prodThrottleEngaged() === false,
    'freshDays=' + (Game.pantryFreshDays ? Game.pantryFreshDays().toFixed(1) : 'n/a'));
  const b2 = pantryKcal();
  const a2 = { task: 'forage' };
  Game.resolveOneAssignment(vid, a2);
  check('normal routing still stocks the pantry', pantryKcal() > b2, `pantry ${b2} -> ${pantryKcal()}`);
  check('task unchanged below threshold', a2.task === 'forage', 'a.task=' + a2.task);
  check('no redirect counted', (v.throttleRedirects || 0) === 0, 'redirects=' + (v.throttleRedirects || 0));

  console.log('== 3. GARDEN and FISH also throttle [RED] ==');
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  v.throttleRedirects = 0;
  const g1 = pantryKcal();
  const ag = { task: 'garden' };
  Game.resolveOneAssignment(vid, ag);
  check('garden throttles above threshold', pantryKcal() === g1 && ['wood', 'water', 'stone'].includes(ag.task), 'a.task=' + ag.task);
  const f1 = pantryKcal();
  const af = { task: 'fish' };
  Game.resolveOneAssignment(vid, af);
  check('fish throttles above threshold', pantryKcal() === f1 && ['wood', 'water', 'stone'].includes(af.task), 'a.task=' + af.task);

  console.log('== 4. TRIBUTE obligations still flow when throttled [RED] ==');
  v.pantry = [freshItem('Foraged food', 20000, 3)]; // engaged
  check('still engaged', typeof Game.prodThrottleEngaged === 'function' && Game.prodThrottleEngaged() === true);
  const m = (Game.mshipState ? Game.mshipState() : null) || {};
  m.links = m.links || [];
  m.links.push({ id: 'trib-test', status: 'active', subordinate: 'haven', primary: 'other-village', tributeKcalPerWeek: 3000, tributePaidWeek: -1, trust: 50 });
  const p0 = pantryKcal();
  const paid = Game.payTribute('trib-test');
  check('tribute pays in full from the throttled pantry', paid === 3000 && pantryKcal() === p0 - 3000, `paid=${paid}, pantry ${p0} -> ${pantryKcal()}`);

  console.log('== 5. NO SPOILED-ITEM LAUNDERING [RED] ==');
  // a preserved-only mountain must NOT trip the fresh gate; redirected
  // duties never stock anything (no phantom items, no fresh re-labeling)
  v.pantry = [preservedItem('Fish catch (smoked)', 20000), freshItem('Foraged food', 3000, 3)];
  check('preserved stock excluded from the fresh count', typeof Game.prodThrottleEngaged === 'function' && Game.prodThrottleEngaged() === false,
    'freshDays=' + (Game.pantryFreshDays ? Game.pantryFreshDays().toFixed(1) : 'n/a'));
  check('pantryFreshKcal counts only spoil-risk food', Math.abs((Game.pantryFreshKcal ? Game.pantryFreshKcal() : -1) - 3000) < 501,
    'freshKcal=' + (Game.pantryFreshKcal ? Game.pantryFreshKcal() : 'n/a'));
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  const nItems = v.pantry.length;
  const a5 = { task: 'forage' };
  Game.resolveOneAssignment(vid, a5);
  check('redirect adds no items at all', v.pantry.length === nItems, 'items ' + nItems + ' -> ' + v.pantry.length);

  console.log('== 6. NEVER throttles into famine [RED] ==');
  v.pantry = [];
  v.burnHistory = [];
  check('empty pantry never engages (falls back, no false gate)', typeof Game.prodThrottleEngaged === 'function' && Game.prodThrottleEngaged() === false);
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500];
  v.pantry = [freshItem('Foraged food', 15000, 3)];
  v.throttleAltRot = 0;
  const alts = new Set();
  for (let i = 0; i < 6; i++) alts.add(Game.prodThrottleAltTask());
  check('redirect rotation covers wood/water/stone', alts.size === 3, [...alts].join(','));

  console.log('== 7. POLICY UNWRAP HONESTY (#69) ==');
  // The 2026-10-13 pilot SILENTLY RAN POLICY-LESS: Object.assign({},
  // require('./policies/leadcourt')) yields {leadcourt:{...}} — policy.daily
  // undefined. RED: the broken shape must be DETECTED; GREEN: the corrected
  // unwrap (named export) yields a runnable daily for BOTH policies, and the
  // measure script's registry must use the corrected form.
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

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join('; ')}` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
