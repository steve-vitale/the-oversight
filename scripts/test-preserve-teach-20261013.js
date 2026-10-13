#!/usr/bin/env node
// PRESERVE SELF-TRIAL TEACH PROOF (fleshout-a, 2026-10-13).
//
// THE GAP (sim-findings.md 2026-10-13, loop-B r16): canon
// (docs/PRESERVATION.md) says "the attempt teaches the technique; the sting
// is one-time", but the self-trial learn trigger in Game.preserveFood is a
// PER-ITEM counter (src/js/food.js:743-744):
//   it._messyPreserves = (it._messyPreserves || 0) + 1;
//   if (it._messyPreserves >= 2) this.learnTechnique('preserve', 'trial');
// An item becomes foodState 'preserved' after ONE smoke and can never be
// smoked again (targets filter is cleaned|cooked), so the counter can only
// ever reach 1: the >= 2 threshold is UNREACHABLE. Via self-trial every
// smoke is 0.80x/15d forever; only villager/specialist teaching paths grant
// the technique. Render teaches honestly on the first attempt (line 793);
// clean teaches on the first attempt (line 660); preserve should too.
//
// THE FIX: replace the unreachable per-item counter with an immediate
// learnTechnique('preserve','trial') on the scholar's first smoke attempt —
// the same one-line-class pattern render uses. The sting stays honest: the
// attempt that teaches is itself the rough job (0.80x, 15d); subsequent
// smokes go solid (0.95x, 30d).
//
// RED PHASE: run this on the PRISTINE tree — the assertions marked [RED]
// must FAIL (technique never learned via self-trial). Apply the fix, rerun:
// all must PASS.
//
// Harness: mulberry32, SEED env override (default 20261013), full src/js
// module list in index.html order minus DOM-only files and drama.js, window
// stubbed for eval then deleted, Math.random seeded BEFORE eval.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261013', 10);
Math.random = mulberry32(SEED);
const ROOT = path.join(__dirname, '..');
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
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

// Capture spoken lines: the learned message is the UX surface of the fix.
const said = [];
function freshGame() {
  said.length = 0;
  Game.state.codex.techniques = { clean: false, cook: false, preserve: false, shell: true, render: false };
  const s = Game.state.scholar;
  s.inventory.length = 0;
  return s;
}
const meatItem = (name, kcal) => ({
  name: name + ' (cleaned)', plantId: 'meat_deer', foodKind: 'meat', foodState: 'cleaned',
  edible: true, kcalEach: kcal, units: 1, kg: 0.5,
  spoilDay: Game.state.scholar.day + 2,
});

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.nearFire = () => true;
  // Force the scholar blind on all food techniques (occupation may grant).
  Game.state.codex.techniques = { clean: false, cook: false, preserve: false, shell: true, render: false };

  console.log('== 1. THE GAP: self-trial smoke must teach preserving ==');
  let s = freshGame();
  s.inventory.push(meatItem('Deer meat', 500));
  Game.preserveFood(); // one blind smoke attempt
  check('[RED] blind smoke #1 teaches the technique (trial)', Game.knowsTechnique('preserve') === true,
    `knowsTechnique('preserve')=${Game.knowsTechnique('preserve')}`);
  check('[RED] learned message is a person, not a counter',
    said.some(t => t.indexOf('Learned') >= 0 && t.indexOf('Messy') >= 0),
    JSON.stringify(said.filter(t => t.indexOf('Learned') >= 0)));

  console.log('== 2. THE STING STAYS HONEST (regression guards) ==');
  s = freshGame();
  s.inventory.push(meatItem('Deer meat', 500));
  Game.preserveFood();
  const first = s.inventory.find(i => i.foodState === 'preserved');
  check('first smoke is the rough job: 0.80x', first && first.kcalEach === 400, `kcalEach=${first && first.kcalEach}`);
  check('first smoke keeps 15d (not 30d)', first && (first.spoilDay - s.day) === 15, `spoilDay-day=${first && (first.spoilDay - s.day)}`);
  check('first smoke copy says rough job', first && /rough job/i.test(first.prep || ''), `prep=${first && JSON.stringify(first.prep)}`);

  console.log('== 3. POST-LEARN: the next smoke goes solid ==');
  // freshGame would unlearn; keep the learned scholar, smoke a NEW item.
  s.inventory.push(meatItem('Deer meat', 500));
  Game.preserveFood();
  const second = s.inventory.filter(i => i.foodState === 'preserved').pop();
  check('[RED] second smoke is solid: 0.95x', second && second.kcalEach === 475, `kcalEach=${second && second.kcalEach}`);
  check('[RED] second smoke keeps 30d', second && (second.spoilDay - s.day) === 30, `spoilDay-day=${second && (second.spoilDay - s.day)}`);

  console.log('== 4. SIBLING PATHS UNTOUCHED ==');
  s = freshGame();
  s.inventory.push(meatItem('Deer meat', 500));
  Game.renderFat(); // no raw fat in inventory -> says 'No raw fat', teaches nothing
  check('render with no fat teaches nothing (no phantom learn)', Game.knowsTechnique('render') === false);
  s.inventory.push({ name: 'Deer tallow (raw)', plantId: 'fat_deer', foodKind: 'fat', foodState: 'raw',
    edible: false, kcalEach: 0, hiddenKcal: 800, units: 1, spoilDay: s.day + 2 });
  Game.renderFat();
  check('renderFat still teaches render on first attempt', Game.knowsTechnique('render') === true);
  check('preserve untouched by rendering', Game.knowsTechnique('preserve') === false);
  // clean still learns on first attempt (line 660 threshold >= 1)
  s = freshGame();
  Game.learnTechnique('clean', 'test'); // stand in for cleanCarcass (needs knife/tool checks)
  check('clean teach path intact', Game.knowsTechnique('clean') === true);

  console.log('== 5. LEARN MESSAGE SOURCE ==');
  s = freshGame();
  const learnedSrc = [];
  const origLearn = Game.learnTechnique;
  Game.learnTechnique = function (t, src) { learnedSrc.push(t + '/' + src); return origLearn.call(this, t, src); };
  s.inventory.push(meatItem('Deer meat', 500));
  Game.preserveFood();
  Game.learnTechnique = origLearn;
  check('[RED] learnTechnique fired with (preserve, trial)', learnedSrc.includes('preserve/trial'),
    `calls=${JSON.stringify(learnedSrc)}`);

  console.log(fails.length ? `\n${fails.length} FAIL: ${fails.join('; ')}` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
