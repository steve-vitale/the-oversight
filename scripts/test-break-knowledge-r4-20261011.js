#!/usr/bin/env node
// BREAK-IT knowledge r4 (2026-10-11): the guided-sow identify machine.
//
// CATCH (fix): sowPlot() granted INSTANT L1 identification ('experiment', no
// teacher, no gates) for any plant a garden-duty villager knew — an
// identify-anything machine that bypassed teachPlant's entire teaching model
// (teacher-must-know, language barrier, trust/occupation quality,
// wrong-knowledge counterplay) plus one free integrate(3,'discovery') per
// plant. The sow sheet showed the TRUE name of guided-but-unlearned plants
// while its empty-copy promised "KNOWN", and villagerSowPlot narrated the
// true name of plants the player never learned. Sibling catch: the
// knowledge stores were split — villagerKnowsPlants read ONLY
// v.plantKnowledge (occupation background) while conversation's plantKnownBy
// read ONLY v.familiar/v.taught (region background + in-run) — so a botanist
// could sort your bag and guide your sowing by a plant they "couldn't teach
// you" in conversation, and a region-familiar local could teach in talk but
// not sort or guide.
//
// FIX: sowPlot routes guided learning through the real teachPlant primitive
// (guide from guideForPlant); the sow sheet shows the honest descriptor for
// unlearned guided plants; villagerSowPlot narrates via plantCalledName;
// plantKnownBy/plantsKnownBy/villagerKnowsPlants all read the full union.
//
// ATTACKS (all four classes):
//   EXPLOIT  (BROKE->fixed): free L1 + integrate per guided sow, no teacher.
//   EXPLOIT  (held): integrate one-shot — identifyPlant refuses repeats.
//   HONESTY  (BROKE->fixed): sow sheet + villager-sow narration true-name leaks.
//   HONESTY  (BROKE->fixed): store split made two contradictory villagers.
//   SOFTLOCK (held): partial lessons accumulate encounters toward the
//            field-click; naming/death flows untouched by this fix.
//   DEAD-CODE(held): every src/js file on disk is loaded in index.html.
//
// Usage: node scripts/test-break-knowledge-r4-20261011.js
//        BEFORE=1 node scripts/test-break-knowledge-r4-20261011.js (pre-fix HEAD: exploit tests must FAIL)
//        SEED=99 node scripts/test-break-knowledge-r4-20261011.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const BEFORE = !!process.env.BEFORE;
const SEED = parseInt(process.env.SEED || '20261011', 10);

// game.js, food.js, app.js changed this pass. BEFORE mode evals pre-fix HEAD copies.
const PRE = ['src/js/game.js', 'src/js/food.js'];
if (BEFORE) {
  for (const f of PRE) {
    execSync(`git show HEAD:${f} > /tmp/bkr4-before-${path.basename(f)}`, { cwd: ROOT });
  }
  console.log('MODE: BEFORE (pre-fix files from git HEAD)');
} else {
  console.log('MODE: AFTER (fixed worktree code)');
}
const srcOf = (f) => BEFORE && PRE.includes(f)
  ? fs.readFileSync(`/tmp/bkr4-before-${path.basename(f)}`, 'utf8')
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

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
}

// A gardenable plant the player does NOT know.
function pickUnknownGardenable() {
  const known = (pid) => Game.plantKnown(pid);
  const p = (Game.data.plants || []).find(p =>
    ['shoots', 'berries', 'roots'].includes(p.form) && !known(p.id) && p.name && p.description);
  if (!p) throw new Error('no unknown gardenable plant');
  return p;
}
// First non-player roster villager; ensure they have background knowledge of pid
// (the occupation-background store food.js seeds) and garden duty.
function rigGuide(pid) {
  const v = Game.state.village;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no npc');
  v.plantKnowledge = v.plantKnowledge || {};
  v.plantKnowledge[vid] = [pid]; // occupation background: the botanist knows it
  v.assignments = v.assignments || {};
  v.assignments[vid] = { task: 'garden' };
  return vid;
}
function giveSeeds(pid, units) {
  Game.state.scholar.inventory.push({ plantId: pid, units: units || 3 });
}
function makePlot() {
  // Sowing is outdoor work: use the real Haven grounds and retain playerTile.
  Game.exitBuilding();
  Game.state.scholar.kcal = 3000;
  Game.state.scholar.energy = 100;
  Game.makePlot();

}
const said = [];
const _say = Game.say.bind(Game);
Game.say = (...a) => { said.push(a.join(' ')); };

(async () => {
await Game.init();
Game.drama = () => {};
Game.audioEvent = () => {};
console.log(`seed=${SEED}`);

console.log('T1. EXPLOIT: guided sow must not mint free L1 identification');
{
  freshGame(); said.length = 0;
  const p = pickUnknownGardenable();
  const vid = rigGuide(p.id);
  giveSeeds(p.id, 3);
  makePlot();
  const opts = Game.sowOptions();
  const opt = opts.find(o => o.pid === p.id);
  ok('guided-unlearned plant is sowable', !!opt, 'opts=' + opts.map(o => o.pid).join(','));
  Game.sowPlot(p.id);
  const e = (Game.state.codex.plants || {})[p.id] || {};
  // FIXED: no anonymous grant. Either still unknown (partial lesson ->
  // encounters) or taught BY the guide through the real primitive. The old
  // code's 'experiment' grant lands via='discovery'/by='discovery' with no
  // teacher (see _grantPlant's idSource mapping).
  const freeGrant = (e.level || 0) >= 1 && !e.learnedFrom &&
    (e.via === 'experiment' || (e.by === 'discovery' && e.via === 'discovery'));
  ok('no free experiment-grant L1', !freeGrant, 'entry=' + JSON.stringify(e));
  if ((e.level || 0) >= 1) {
    ok('L1 arrived via a real teacher', e.via === 'taught' && !!e.learnedFrom,
      'entry=' + JSON.stringify(e));
  } else {
    ok('partial lesson built familiarity instead', ((Game.state.codex.encounters || {})[p.id] || 0) > 0,
      'encounters=' + JSON.stringify(Game.state.codex.encounters[p.id]));
  }
}

console.log('T2. HONESTY: sow sheet must not show the true name of an unlearned plant');
{
  freshGame();
  const p = pickUnknownGardenable();
  rigGuide(p.id);
  giveSeeds(p.id, 3);
  const opt = (Game.sowOptions() || []).find(o => o.pid === p.id);
  ok('guided opt listed', !!opt);
  if (opt) {
    ok('sheet name is NOT the true name', opt.name !== p.name,
      'shown=' + JSON.stringify(opt.name) + ' true=' + JSON.stringify(p.name));
    ok('sheet marks it guided', opt.guided === true);
    ok('kcal not exposed pre-learning', opt.kcalEach == null, 'kcalEach=' + opt.kcalEach);
  }
}

console.log('T3. STORE SPLIT: background knowledge visible to every reader');
{
  freshGame();
  const p = pickUnknownGardenable();
  const vid = rigGuide(p.id); // plantKnowledge[vid] = [pid] only
  ok('plantKnownBy sees occupation-background knowledge', Game.plantKnownBy(vid, p.id) === true);
  ok('plantsKnownBy lists it', Game.plantsKnownBy(vid).indexOf(p.id) !== -1);
  // the other direction: region-familiar (v.familiar) readable by the sorter/guide reader
  const p2 = (Game.data.plants || []).find(x => x.id !== p.id && !Game.plantKnown(x.id) && x.name);
  Game.state.village.familiar[vid] = [p2.id];
  ok('villagerKnowsPlants sees region familiarity', Game.villagerKnowsPlants(vid).indexOf(p2.id) !== -1,
    'got=' + JSON.stringify(Game.villagerKnowsPlants(vid)));
}

console.log('T4. HONESTY: villager sowing narrates no true name for unlearned plants');
{
  freshGame(); said.length = 0;
  const p = pickUnknownGardenable();
  const vid = rigGuide(p.id);
  // green-hands occupation so villagerSowPlot picks this gardener up
  const vp = (Game.data.villagers || []).find(x => x.id === vid);
  if (vp) vp.formerOccupation = 'gardener';
  makePlot();
  const line = Game.villagerSowPlot(vid) || '';
  const trueName = p.name;
  ok('narration avoids the true name', line.indexOf(trueName) === -1,
    'line=' + JSON.stringify(line));
}

console.log('T5. EXPLOIT held: integrate is one-shot per plant (no re-farm)');
{
  freshGame();
  const p = pickUnknownGardenable();
  const first = Game.identifyPlant(p.id, 'observation');
  const e1 = (Game.state.codex.plants || {})[p.id] || {};
  const second = Game.identifyPlant(p.id, 'observation');
  const g2 = Game.grantKnowledge('plant', p.id, 1, { type: 'experiment', by: null });
  ok('first identify grants', first === true && (e1.level || 0) >= 1);
  ok('second identify refuses', second === false);
  ok('repeat grant refuses', g2 === false);
}

console.log('T6. HONESTY: a wrong guide teaches you WRONG through the sow, not the truth');
{
  freshGame(); said.length = 0;
  const p = pickUnknownGardenable();
  const vid = rigGuide(p.id);
  // the guide is honestly mistaken about this plant
  const other = (Game.data.plants || []).find(x => x.id !== p.id && ['shoots', 'berries', 'roots'].includes(x.form) && x.name);
  const v = Game.state.village;
  v.wrongAbout = v.wrongAbout || {};
  v.wrongAbout[vid] = { [p.id]: { wrongPid: other.id, deliberate: false } };
  // force the honest-teacher path off: comm stub so teachPlant runs cleanly
  const _comm = Game.commLevel;
  Game.commLevel = () => ({ level: 'full', mult: 1, lang: 'english' });
  // make them a good teacher so the lesson lands (trust + cook occupation)
  const vp = (Game.data.villagers || []).find(x => x.id === vid);
  if (vp) vp.formerOccupation = 'cook';
  v.trust = v.trust || {}; v.trust[vid] = 60;
  giveSeeds(p.id, 3);
  makePlot();
  Game.sowPlot(p.id);
  Game.commLevel = _comm;
  const e = (Game.state.codex.plants || {})[p.id] || {};
  const believedWrong = (e.level || 0) >= 1 && !!e.wrongAs;
  ok('wrong guide -> believed-wrong entry, never the true name', believedWrong,
    'entry=' + JSON.stringify({ level: e.level, wrongAs: e.wrongAs, via: e.via }));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
})();
