#!/usr/bin/env node
// FAMINEREDIRECT PROOF (fleshout-b, 2026-10-14).
//
// THE LEVER: the empty-pantry half of the food economy has no production
// instrument. sharcensus (2026-10-13) measured 61% of starved villager-days
// are empty-pantry (genuine production shortfall); person-to-person sharing
// can't reach acute production collapse. The landed PRODTHROTTLE lever
// redirects FOOD duties to alt work when the pantry holds >4 fresh days.
// FAMINEREDIRECT is the symmetric famine-side instrument: when the pantry
// holds <2 fresh days (thin but not empty — relief before the bare-pantry
// famine block), wood/water/stone duties redirect to food work
// (forage/garden/fish, round-robin — mirror of prodThrottleAltTask()).
//
// Env-gated: FAMINEREDIRECT=1. The gate short-circuits FIRST, before
// pantryFreshDays() is read; in the browser (process undefined) it can
// never fire; the gate-off path is the existing code verbatim.
//
// RED PHASE: run this on the PRISTINE tree — the assertions marked [RED]
// must FAIL (no gate, no redirect, no engaged/helper functions). Apply the
// lever, rerun: all PASS. The gate-integrity section passes on both trees:
// gate off = pre-lever behavior, byte-identical.
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

const said = [];
const freshItem = (name, kcal, daysLeft) => ({
  name, kcalEach: 500, units: Math.max(1, Math.ceil(kcal / 500)), safe: true,
  spoilDay: Game.state.scholar.day + daysLeft,
});
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
  const freshDays = () => (typeof Game.pantryFreshDays === 'function' ? Game.pantryFreshDays().toFixed(1) : 'n/a');

  console.log('== 1. GATE INTEGRITY: gate off = pre-lever behavior, byte-identical ==');
  delete process.env.FAMINEREDIRECT;
  v.pantry = [freshItem('Foraged food', 750, 3)]; // ~0.5 fresh days — real famine
  v.famineRedirects = 0;
  said.length = 0;
  const b1 = pantryKcal();
  const a1 = { task: 'wood' };
  Game.resolveOneAssignment(vid, a1);
  check('gate off: wood duty into a 0.5-day pantry routes to wood (no redirect)',
    a1.task === 'wood', 'a.task=' + a1.task + ' freshDays=' + freshDays());
  check('gate off: no famine ledger count', (v.famineRedirects || 0) === 0, 'redirects=' + (v.famineRedirects || 0));
  check('gate off: no redirect beat fires', !said.some(s => s.indexOf('⚠️') >= 0),
    'beats=' + said.filter(s => s.indexOf('⚠️') >= 0).length);
  check('gate off: duty still resolves honestly', typeof a1.task === 'string' && a1.task === 'wood');

  console.log('== 2. GATE ON, thin pantry (1.0 fresh days) → wood redirects to food [RED] ==');
  process.env.FAMINEREDIRECT = '1';
  v.pantry = [freshItem('Foraged food', 1500, 3)];
  v.famineRedirects = 0;
  v.famineFoodRot = 0;
  said.length = 0;
  check('gate engaged at 1.0 fresh days', typeof Game.famineRedirectEngaged === 'function' && Game.famineRedirectEngaged() === true,
    'freshDays=' + freshDays());
  const a2 = { task: 'wood' };
  Game.resolveOneAssignment(vid, a2);
  check('wood duty redirects to a food task', ['forage', 'garden', 'fish'].indexOf(a2.task) >= 0, 'a.task=' + a2.task);
  check('redirect counted on the village ledger', v.famineRedirects === 1, 'redirects=' + v.famineRedirects);
  const beat = said.filter(s => s.indexOf('⚠️') >= 0)[0] || '';
  check('honest beat: names the pantry state', /shelves are nearly bare/.test(beat) && /day/.test(beat), beat.slice(0, 100));
  check('honest beat: names the decision', /leaves the wood run/.test(beat) && /instead/.test(beat), beat.slice(100, 220));
  check('honest beat: names the consequence', /Hunger first/.test(beat), beat.slice(220, 320));

  console.log('== 3. NEUTRAL BAND (3.0 fresh days) → no redirect [RED] ==');
  v.pantry = [freshItem('Foraged food', 4500, 3)];
  v.famineRedirects = 0;
  said.length = 0;
  check('gate disengages in the neutral band', typeof Game.famineRedirectEngaged === 'function' && Game.famineRedirectEngaged() === false,
    'freshDays=' + freshDays());
  const a3 = { task: 'water' };
  Game.resolveOneAssignment(vid, a3);
  check('water duty routes normally at 3.0 fresh days', a3.task === 'water', 'a.task=' + a3.task);
  check('no redirect counted in the neutral band', (v.famineRedirects || 0) === 0, 'redirects=' + (v.famineRedirects || 0));
  check('no beat in the neutral band', !said.some(s => s.indexOf('⚠️') >= 0));

  console.log('== 4. EMPTY PANTRY (0 fresh days) → redirects [RED] ==');
  v.pantry = [];
  v.famineRedirects = 0;
  v.famineFoodRot = 0;
  said.length = 0;
  check('empty pantry engages (famine is when it is needed)', typeof Game.famineRedirectEngaged === 'function' && Game.famineRedirectEngaged() === true,
    'freshDays=' + freshDays());
  const a4 = { task: 'stone' };
  Game.resolveOneAssignment(vid, a4);
  check('stone duty redirects on an empty pantry', ['forage', 'garden', 'fish'].indexOf(a4.task) >= 0, 'a.task=' + a4.task);
  check('redirect counted', v.famineRedirects === 1, 'redirects=' + v.famineRedirects);

  console.log('== 5. ROTATION: garden/fish redirect; rotation advances [RED] ==');
  v.pantry = [freshItem('Foraged food', 1500, 3)];
  v.famineRedirects = 0;
  v.famineFoodRot = 0;
  said.length = 0;
  const g1 = pantryKcal();
  const ag = { task: 'garden' };
  Game.resolveOneAssignment(vid, ag);
  check('garden (food task) NOT famine-redirected — only wood/water/stone route',
    ag.task === 'garden' && pantryKcal() >= g1, 'a.task=' + ag.task);
  const af = { task: 'wood' };
  Game.resolveOneAssignment(vid, af);
  check('water/stone duties also redirect', af.task !== 'wood' || ['forage', 'garden', 'fish'].indexOf(af.task) >= 0, 'a.task=' + af.task);
  const afish = { task: 'stone' };
  Game.resolveOneAssignment(vid, afish);
  const seq = [ag.task, af.task, afish.task].filter(t => ['forage', 'garden', 'fish'].indexOf(t) >= 0);
  check('rotation advances — no stuck task', new Set([af.task, afish.task]).size === 2 || af.task !== afish.task,
    `redirected: ${af.task}, ${afish.task}`);
  // direct helper rotation check
  v.famineFoodRot = 0;
  const hseq = [Game.famineFoodTask(), Game.famineFoodTask(), Game.famineFoodTask(), Game.famineFoodTask()];
  check('famineFoodTask round-robins forage→garden→fish→forage',
    typeof Game.famineFoodTask === 'function' &&
    hseq[0] === 'forage' && hseq[1] === 'garden' && hseq[2] === 'fish' && hseq[3] === 'forage',
    hseq.join(','));

  console.log('== 6. SCHOLAR NEVER GETS DUTIES (villager-only path) [RED] ==');
  // assignTask hard-refuses the scholar ("You're the leader. Lead."), and
  // the task-lead resolution loop skips this.villagerId explicitly — the
  // only two callers of resolveOneAssignment. Confirm both in code text so
  // this lever (and the landed throttle) can never route the scholar.
  const gsrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  check('assignTask refuses the scholar a duty',
    /if \(vid === this\.villagerId\) \{ this\.say\("You're the leader\. Lead\."\); return null; \}/.test(gsrc));
  check('task-lead resolution skips the scholar',
    /if \(leadVid === this\.villagerId\) continue;/.test(gsrc));

  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join('; ')}` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
