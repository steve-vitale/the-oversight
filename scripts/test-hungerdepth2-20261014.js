#!/usr/bin/env node
// HUNGER-DEPTH EXEMPTION r2 PROOF (fleshout-b ARM 1, 2026-10-14).
//
// THE ARM: the landed production-throttle lever (afb736e6) cut fresh-rot
// -41% but its confirm was NO-GO at guardrails (median survival -14d,
// starvation deaths +12). The r23b any-hunger exemption (hungryStreak > 0)
// was KILLED AT PILOT: it backfired (starve/100vd 1.241->1.853, +49%)
// because a streak-1 gate fires constantly (183 exemptions on one seed) and
// forfeits the redirect's trust-carrying wood/water/stone work.
// sim-findings #115 names the next design: gate on hunger DEPTH (streak>=3),
// the engine's own chronic-hunger threshold — the same signal that fires the
// hunger-winter crisis.
//
// THE SIGNAL (engine-honest, not a proxy): progState().hungryStreak —
// anyStarving out of villageEats: some villager ate under 60% of
// (ration-adjusted) need, not fasting, not on voted half-rations. The
// empty-pantry clock v.hungryDays is MUTUALLY EXCLUSIVE with the throttle
// (an empty pantry never engages — pantryFreshDays()=0), so it cannot gate
// the exemption; asserted in §4.
//
// RED PHASE: `git diff src/js/game.js > /tmp/hd2.patch && git checkout
// HEAD -- src/js/game.js`, then MODE=red node this script — the exemption
// assertions must show INERT (redirect fires into chronic hunger). Then
// `git apply /tmp/hd2.patch` and MODE=green HUNGERDEPTH=1: all pass.
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
// HUNGERDEPTH=0 (control side): exemption disabled — asserts the inert shape.
const MODE = process.env.MODE === 'red' ? 'red' : 'green';
const expectExempt = MODE === 'green' && process.env.HUNGERDEPTH !== '0';
console.log(`MODE=${MODE} (depth exemption ${expectExempt ? 'armed — must fire at streak>=3 only' : 'absent — must be inert'})`);

const said = [];
const freshItem = (name, kcal, daysLeft) => ({
  name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true,
  spoilDay: Game.state.scholar.day + daysLeft,
});

// one duty decision with an engaged pantry; returns the decision shape
function dutyDecision(Game, vid, v, pg, streak, task) {
  v.pantry = [freshItem('Foraged food', 15000, 3)]; // ~10 fresh-days: engaged
  pg.hungryStreak = streak;
  v.throttleRedirects = 0; v.throttleExemptDepth = 0;
  v.throttleAltRot = 7;
  said.length = 0;
  const a = { task };
  Game.resolveOneAssignment(vid, a);
  return {
    task: a.task,
    redirected: ['wood', 'water', 'stone'].includes(a.task),
    redirects: v.throttleRedirects || 0,
    exempt: v.throttleExemptDepth || 0,
    rotAfter: v.throttleAltRot,
    said: said.slice(),
  };
}

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

  console.log('== 1. LANDED BEHAVIOR PRESERVED: streak 0 -> redirect fires (both modes) ==');
  const d0 = dutyDecision(Game, vid, v, pg, 0, 'forage');
  check('redirect fires when nobody is hungry', d0.redirected, 'a.task=' + d0.task);
  check('redirect narrated (the landed beat)', d0.said.some(s => /leaves the forage standing/.test(s) && /days of fresh/.test(s)));
  check('redirect counted', d0.redirects === 1, 'redirects=' + d0.redirects);
  check('exemption NOT counted', d0.exempt === 0, 'exempt=' + d0.exempt);
  check('rotation advances on the landed path', d0.rotAfter === 8, 'rot=' + d0.rotAfter);

  console.log('== 2. THE DEPTH GATE: streak 1/2 do NOT exempt; streak 3/4 DO ==');
  for (const streak of [1, 2]) {
    const d = dutyDecision(Game, vid, v, pg, streak, 'forage');
    check(`streak ${streak}: transient hunger — redirect fires (no exemption)`, d.redirected && d.exempt === 0,
      `task=${d.task} redirects=${d.redirects} exempt=${d.exempt}`);
    check(`streak ${streak}: redirect beat fires, exemption beat silent`,
      d.said.some(s => /leaves the forage standing/.test(s)) && !d.said.some(s => /hungry eat first/.test(s)));
  }
  for (const streak of [3, 4]) {
    const d = dutyDecision(Game, vid, v, pg, streak, 'forage');
    if (expectExempt) {
      check(`[GREEN] streak ${streak}: chronic hunger — production continues (no redirect)`, !d.redirected && d.task === 'forage', 'a.task=' + d.task);
      check(`[GREEN] streak ${streak}: exemption counted on the village ledger`, d.exempt === 1, 'exempt=' + d.exempt);
      check(`[GREEN] streak ${streak}: no redirect counted`, d.redirects === 0, 'redirects=' + d.redirects);
      check(`[GREEN] streak ${streak}: rotation untouched`, d.rotAfter === 7, 'rot=' + d.rotAfter);
      const beat = d.said.filter(s => /hungry/.test(s));
      check(`[GREEN] streak ${streak}: the decision is narrated, not silent`, beat.length >= 1);
      check(`[GREEN] streak ${streak}: narration names what the villager keeps doing`, beat.some(s => /keeps working the forage/.test(s)));
      check(`[GREEN] streak ${streak}: narration is honest about the pantry state`, beat.some(s => /days of fresh/.test(s)));
      check(`[GREEN] streak ${streak}: narration is honest about the depth (three days running)`, beat.some(s => /three days running/.test(s)));
      check(`[GREEN] streak ${streak}: the redirect beat does NOT fire`, !d.said.some(s => /leaves the forage standing/.test(s)));
    } else {
      check(`[RED] streak ${streak}: exemption inert — redirect still fires into chronic hunger`, d.redirected && d.exempt === 0,
        `task=${d.task} exempt=${d.exempt}`);
    }
  }

  console.log('== 2b. DEPTH COUNTS: the engine walks its own streak 1->2->3 through real villageEats ==');
  // Synthetic famine fixture: the village produces nothing (fixture
  // control, restored after), the pantry holds a meager 3000 kcal — most
  // villagers genuinely under-eat (<60% of need) through the real meal
  // path, and the engine's own anyStarving->hungryStreak counter does the
  // counting. The hunger-winter crisis is pre-marked fired so the fixture
  // exercises the streak, not the crisis UI.
  const origProd = Game.villagerDayProduction;
  Game.villagerDayProduction = () => 0;
  // burnHistory restore: each famine meal appends a gorge/zero burn day
  // (meal #1 eats the whole 3000-kcal fixture and logs it), which would
  // skew the throttle's burn denominator and disengage it mid-fixture.
  // The fixture tests the streak counter, not the burn average.
  const origBurn = v.burnHistory.slice();
  pg.crises = pg.crises || {}; pg.crises['hunger-winter'] = true;
  pg.hungryStreak = 0;
  const boundary = [];
  for (let day = 1; day <= 3; day++) {
    v.pantry = [freshItem('Famine stores', 3000, 3)];
    Game.villageEats();
    check(`famine day ${day}: engine counts hungryStreak=${day}`, pg.hungryStreak === day, 'streak=' + pg.hungryStreak);
    v.burnHistory = origBurn.slice(); // keep the throttle denominator pristine for the decision
    const d = dutyDecision(Game, vid, v, pg, pg.hungryStreak, 'forage');
    boundary.push(`${day}:${d.exempt > 0 ? 'EXEMPT' : 'redirect'}`);
    if (expectExempt) {
      check(`famine day ${day}: decision follows the depth boundary`, (day >= 3) === (d.exempt > 0),
        `streak=${pg.hungryStreak} exempt=${d.exempt} redirects=${d.redirects}`);
    }
  }
  if (expectExempt) check('[GREEN] the boundary flips exactly at the 2->3 transition', boundary.join(' ') === '1:redirect 2:redirect 3:EXEMPT', boundary.join(' '));
  // a fed day resets the counter — it is a consecutive-day streak, not a flag
  v.pantry = [freshItem('Full stores', 20000, 5)];
  Game.villageEats();
  check('a fed day resets the streak to 0 (consecutive-day counter)', pg.hungryStreak === 0, 'streak=' + pg.hungryStreak);
  v.burnHistory = origBurn.slice(); // the fed-day meal also appends a burn day; restore for the decision
  const dFed = dutyDecision(Game, vid, v, pg, pg.hungryStreak, 'forage');
  check('after the reset the throttle redirects again', dFed.redirected, 'task=' + dFed.task);
  Game.villagerDayProduction = origProd;

  console.log('== 3. HUNGERDEPTH=0 disables the exemption (instrumentation control) ==');
  const d3 = (() => {
    const envWas = process.env.HUNGERDEPTH; // save: §3 must restore the side's gate value
    process.env.HUNGERDEPTH = '0';
    const d = dutyDecision(Game, vid, v, pg, 3, 'forage');
    if (envWas === undefined) delete process.env.HUNGERDEPTH;
    else process.env.HUNGERDEPTH = envWas;
    return d;
  })();
  check('HUNGERDEPTH=0: redirect fires despite streak=3', d3.redirected && d3.exempt === 0,
    `task=${d3.task} redirects=${d3.redirects} exempt=${d3.exempt}`);
  check('HUNGERDEPTH=0: rotation advances (landed shape)', d3.rotAfter === 8, 'rot=' + d3.rotAfter);

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

  console.log('== 5. GARDEN/FISH duties obey the same depth gate ==');
  for (const task of ['garden', 'fish']) {
    const dg = dutyDecision(Game, vid, v, pg, 2, task);
    check(`${task} streak 2: redirect fires`, dg.redirected && dg.exempt === 0);
    const dg3 = dutyDecision(Game, vid, v, pg, 3, task);
    if (expectExempt) check(`[GREEN] ${task} streak 3: exempt`, !dg3.redirected && dg3.exempt === 1, `task=${dg3.task}`);
    else check(`[RED] ${task} streak 3: inert — redirect fires`, dg3.redirected && dg3.exempt === 0);
  }

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join('; ')}` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
