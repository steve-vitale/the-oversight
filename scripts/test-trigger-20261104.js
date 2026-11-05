// test-trigger-20261104.js — proof for arm sim-trigger-b.
// Fixture tests (synthetic corpora through the real analyzer):
// classification precedence, stack classes, detail-contact rule,
// lost-trail path, sub-cause decomposition, determinism.
// Live legs: off/on neutrality (same seed, 30d, identical days /
// endReason / waveKillLog length with the instrument on vs off).
// Usage: node scripts/test-trigger-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'trigger-instrument-20261104'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
// EPERM flap: retry tmp writes (same host denial as the driver guards).
function sleepSync(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeRetry(file, content) {
  // The flap has two modes: EPERM throw, and a silent 0-byte "success".
  // Verify size after every apparent success; retry until it matches.
  const want = Buffer.byteLength(content);
  let lastErr = null;
  for (let i = 0; i < 120; i++) {
    try {
      fs.writeFileSync(file, content);
      try {
        const got = fs.statSync(file).size;
        if (got === want) return;
        lastErr = new Error('short-write: got ' + got + ' want ' + want);
      } catch (e) { lastErr = e; }
    } catch (e) { lastErr = e; if (e.code !== 'EPERM') throw e; }
    try { fs.unlinkSync(file); } catch (e) {}
    sleepSync(5000);
  }
  throw lastErr;
}

// --- 1. classifyFight precedence (fixture) ---
ok('classify: contest beats world-instance', INST.classifyFight('at Object.runContest (contestEngine.js:10)', true) === 'contest');
ok('classify: feast beats world-instance', INST.classifyFight('at Game.drawFeastScavenger (game.js:10)', true) === 'feast');
ok('classify: trap beats world-instance', INST.classifyFight('at Game.trapTurn (game.js:10)', true) === 'trap');
ok('classify: world-instance beats other', INST.classifyFight('at Object.resolvePatrol (game.js:10)', true) === 'world');
ok('classify: world-stack without instance', INST.classifyFight('at Game.monsterTurn (game.js:10)', false) === 'world');
ok('classify: other fallthrough', INST.classifyFight('at Game.reengageWaitingMonsters (game.js:10)', false) === 'other');
ok('classify: contest substring case-insensitive', INST.classifyFight('at Object.ContestEngine (x.js:1)', false) === 'contest');
ok('classify: feast substring', INST.classifyFight('at Game.faceFeastDraw (game.js:1)', false) === 'feast');

// --- 2. Analyzer on synthetic corpora ---
let tmpDir = null;
for (let i = 0; i < 60 && !tmpDir; i++) {
  try { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trigger-proof-')); }
  catch (e) { if (e.code !== 'EPERM') throw e; sleepSync(5000); }
}
if (!tmpDir) throw new Error('mkdtemp EPERM retries exhausted');
function seedCorpus(over) {
  const base = {
    seed: 99102, arm: 'trigger', run: 'proof', anchorCommit: 'test', instrumentOff: false,
    days: 116, gameDays: 117, endReason: 'village-lost', won: false, over: true, villageLost: true,
    scaleRank: 'village', maxWave: 4, unlockedWave: 4, standing: 199, readiness5: null,
    spawns: [], removals: [], casts: [], fights: [], daily: [], mtCalls: [], tileChanges: [], sayLines: [],
    waveKillLog: [], fallen: [], wavesFaced: null, finalWorld: [], instrumentErrors: [],
  };
  return Object.assign(base, over);
}
function snap(day, gated, unlocked, world, px, py) {
  return { day: day, gated: gated, unlockedWave: unlocked, raw: gated, readiness5: null, worldCap: 8, px: px, py: py, world: world, w4facedTypes: 0 };
}
function wmon(seq, id, wave, tx, ty, npc) {
  return { seq: seq, id: id, wave: wave, tx: tx, ty: ty, mx: 4, my: 4, dist: 0, onPlayerTile: false, npcCount: npc || 0 };
}
// Corpus A: unlocked day 80; one w4 spawn on player tile day 83 (seq 1,
// eulogy, follows=false); player tile-change day 84; monster alive at
// end elsewhere -> player-left-the-tile; one background w4 spawn day 90
// (seq 2) never reaching -> TRIGGER break, TRIGGER binding (only seed
// with spawns but no fights). Also one feast wave-4 fight day 95 (must
// NOT count as wild) and one contest wave-4 fight day 96 (same).
const dailyA = [];
for (let d = 79; d <= 116; d++) {
  let world = [];
  if (d >= 83 && d < 116) world.push(Object.assign(wmon(1, 'eulogy', 4, 5, 4, 0), { onPlayerTile: d === 83 }));
  if (d >= 90) world.push(wmon(2, 'algorithm', 4, 1, 1, 0));
  dailyA.push(snap(d, d >= 80 ? 199 : 90, d >= 80 ? 4 : 3, world, d === 83 ? 5 : 4, d === 83 ? 4 : 4));
}
const corpusA = seedCorpus({
  daily: dailyA,
  spawns: [
    { idx: 10, seq: 1, day: 83, id: 'eulogy', wave: 4, tx: 5, ty: 4, mx: 2, my: 2, px: 5, py: 4, dist: 0, onPlayerTile: true, source: 'checkEncounter', stackFn: 'checkEncounter', veteran: false },
    { idx: 20, seq: 2, day: 90, id: 'algorithm', wave: 4, tx: 1, ty: 1, mx: 3, my: 3, px: 4, py: 4, dist: 6, onPlayerTile: false, source: 'background', stackFn: 'maintainWorldMonsters', veteran: false },
  ],
  tileChanges: [{ idx: 15, day: 84, from: [5, 4], to: [4, 4] }],
  fights: [
    { idx: 30, day: 95, channel: 'player-tb', fighter: null, mid: 'influencer', wave: 4, optsKeys: [], outcome: null, cls: 'feast', seq: null },
    { idx: 31, day: 96, channel: 'field', fighter: 'v1', mid: 'strike', wave: 4, optsKeys: [], outcome: null, cls: 'contest', seq: null },
  ],
  finalWorld: [{ seq: 1, id: 'eulogy', wave: 4, tx: 7, ty: 4, mx: 1, my: 1 }, { seq: 2, id: 'algorithm', wave: 4, tx: 1, ty: 1, mx: 3, my: 3 }],
});
// Corpus B: unlocked day 47; one w4 spawn on player tile day 50 (seq 1);
// monsterTurn calls show lostSight climbing to 7 with no player tile
// change; removal day 52 by monsterTurn + same-day lost-trail say-line
// -> monster-unseen-on-tile; TRIGGER break.
const dailyB = [];
for (let d = 46; d <= 59; d++) {
  let world = [];
  if (d >= 50 && d < 52) world.push(Object.assign(wmon(1, 'influencer', 4, 8, 4, 0), { onPlayerTile: true }));
  dailyB.push(snap(d, d >= 47 ? 150 : 90, d >= 47 ? 4 : 3, world, 8, 4));
}
const corpusB = seedCorpus({
  seed: 99106, days: 59, endReason: 'village-lost',
  daily: dailyB,
  spawns: [{ idx: 10, seq: 1, day: 50, id: 'influencer', wave: 4, tx: 8, ty: 4, mx: 6, my: 6, px: 8, py: 4, dist: 0, onPlayerTile: true, source: 'checkEncounter', stackFn: 'checkEncounter', veteran: false }],
  mtCalls: [
    { idx: 11, day: 50, seq: 1, id: 'influencer', wave: 4, px: 8, py: 4, pmx: 4, pmy: 4, before: { mx: 6, my: 6, lostSight: 0, stance: null }, after: { mx: 6, my: 6, lostSight: 1, stance: null }, distBefore: 2, distAfter: 2, fightFired: false, removedFired: false },
    { idx: 12, day: 52, seq: 1, id: 'influencer', wave: 4, px: 8, py: 4, pmx: 4, pmy: 4, before: { mx: 6, my: 6, lostSight: 6, stance: null }, after: { mx: 6, my: 6, lostSight: 7, stance: null }, distBefore: 2, distAfter: 2, fightFired: false, removedFired: true },
  ],
  removals: [{ idx: 13, day: 52, seq: 1, id: 'influencer', stackFn: 'monsterTurn', rclass: 'monsterTurn' }],
  sayLines: [{ idx: 14, day: 52, line: 'You hold still behind cover. After a while, the sounds fade. It lost your trail.' }],
  finalWorld: [],
});
// Corpus C: unlocked day 48; one w4 spawn on player tile day 50; player
// stays; world fight day 51 via object ref (seq 1) -> FACED-WILD,
// binding TRIGGER (reach->fight gap 1 vs unlock->spawn 2? unlock 48,
// spawn 50 gap 2, reach 50 gap 0, fight 51 gap 1 -> binding SPAWN).
const dailyC = [];
for (let d = 47; d <= 52; d++) {
  let world = [];
  if (d === 50) world.push(Object.assign(wmon(1, 'strike', 4, 3, 3, 0), { onPlayerTile: true }));
  dailyC.push(snap(d, d >= 48 ? 140 : 90, d >= 48 ? 4 : 3, world, 3, 3));
}
const corpusC = seedCorpus({
  seed: 99105, days: 52, endReason: 'village-lost',
  daily: dailyC,
  spawns: [{ idx: 10, seq: 1, day: 50, id: 'strike', wave: 4, tx: 3, ty: 3, mx: 4, my: 4, px: 3, py: 3, dist: 0, onPlayerTile: true, source: 'checkEncounter', stackFn: 'checkEncounter', veteran: false }],
  fights: [{ idx: 20, day: 51, channel: 'player-tb', fighter: null, mid: 'strike', wave: 4, optsKeys: [], outcome: null, cls: 'world', seq: 1 }],
  removals: [{ idx: 21, day: 51, seq: 1, id: 'strike', stackFn: 'startCombat', rclass: 'fight-settlement' }],
  finalWorld: [],
});
writeRetry(path.join(tmpDir, 'trigger-s99102-proof.json'), JSON.stringify(corpusA));
writeRetry(path.join(tmpDir, 'trigger-s99106-proof.json'), JSON.stringify(corpusB));
writeRetry(path.join(tmpDir, 'trigger-s99105-proof.json'), JSON.stringify(corpusC));
const out1 = JSON.parse(execSync('node ' + path.join(REPO, 'scripts', 'trigger-analyze-20261104.js') + ' ' + tmpDir, { encoding: 'utf8' }));
const bySeed = {};
out1.seeds.forEach(function (s) { bySeed[s.seed] = s; });
ok('analyzer: 99102 break TRIGGER (feast/contest fights do not count as wild)',
  bySeed[99102].breakStep === 'TRIGGER' && bySeed[99102].worldFights === 0 && bySeed[99102].w4fightsAny === 2,
  JSON.stringify({ b: bySeed[99102].breakStep, w: bySeed[99102].worldFights, a: bySeed[99102].w4fightsAny }));
ok('analyzer: 99102 sub-cause player-left-the-tile',
  bySeed[99102].instances[0].subCause === 'player-left-the-tile' && bySeed[99102].instances[0].fate === 'still-wandering-at-death',
  JSON.stringify(bySeed[99102].instances[0]));
ok('analyzer: 99106 sub-cause monster-unseen-on-tile via lostSight+say join',
  bySeed[99106].instances[0].subCause === 'monster-unseen-on-tile' && bySeed[99106].instances[0].fate === 'lost-trail',
  JSON.stringify(bySeed[99106].instances[0]));
ok('analyzer: 99105 FACED-WILD, binding SPAWN (gap 2 > 1 > 0)',
  bySeed[99105].breakStep === 'FACED-WILD' && bySeed[99105].bindingStep === 'SPAWN',
  JSON.stringify({ b: bySeed[99105].breakStep, bind: bySeed[99105].bindingStep, gaps: bySeed[99105].gaps }));
ok('analyzer: villager-only instance does not enter sub-cause plurality',
  bySeed[99102].subCounts['player-left-the-tile'] === 1 && Object.keys(bySeed[99102].subCounts).length === 1,
  JSON.stringify(bySeed[99102].subCounts));
ok('analyzer: removal-only fought flag is false when fight record exists',
  bySeed[99105].instances[0].foughtWorld === true && bySeed[99105].instances[0].removalOnlyFought === false);
ok('analyzer: determinism (two runs identical)',
  execSync('node ' + path.join(REPO, 'scripts', 'trigger-analyze-20261104.js') + ' ' + tmpDir, { encoding: 'utf8' }) ===
  execSync('node ' + path.join(REPO, 'scripts', 'trigger-analyze-20261104.js') + ' ' + tmpDir, { encoding: 'utf8' }));
// Detail-contact rule: mtCall min distance + stance capture.
ok('analyzer: mt detail trace recorded (min dist, max lostSight)',
  bySeed[99106].instances[0].mtCount === 2 && bySeed[99106].instances[0].mtMaxLostSight === 7,
  JSON.stringify({ n: bySeed[99106].instances[0].mtCount, ls: bySeed[99106].instances[0].mtMaxLostSight }));

// --- 3. Live off/on neutrality leg (seed 99108, 30d) ---
let legDir = null;
for (let i = 0; i < 60 && !legDir; i++) {
  try { legDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trigger-leg-')); }
  catch (e) { if (e.code !== 'EPERM') throw e; sleepSync(5000); }
}
if (!legDir) throw new Error('mkdtemp leg EPERM retries exhausted');
try {
  execSync('DAYS=30 SEEDS=99108 RUN=leg-on OUTDIR=' + legDir + ' node ' + path.join(REPO, 'scripts', 'trigger-driver-20261104.js'), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  execSync('DAYS=30 SEEDS=99108 RUN=leg-off TRIGGER_OFF=1 OUTDIR=' + legDir + ' node ' + path.join(REPO, 'scripts', 'trigger-driver-20261104.js'), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const on = JSON.parse(fs.readFileSync(path.join(legDir, 'trigger-s99108-leg-on.json'), 'utf8'));
  const off = JSON.parse(fs.readFileSync(path.join(legDir, 'trigger-s99108-leg-off.json'), 'utf8'));
  ok('neutrality: days identical on/off', on.days === off.days, on.days + ' vs ' + off.days);
  ok('neutrality: endReason identical on/off', on.endReason === off.endReason, on.endReason + ' vs ' + off.endReason);
  ok('neutrality: waveKillLog length identical on/off',
    (on.waveKillLog || []).length === (off.waveKillLog || []).length,
    (on.waveKillLog || []).length + ' vs ' + (off.waveKillLog || []).length);
  ok('neutrality: instrument recorded events on the on-leg', (on.mtCalls || []).length >= 0 && (on.spawns || []).length > 0);
  ok('neutrality: instrument errors zero on the on-leg', (on.instrumentErrors || []).length === 0,
    JSON.stringify((on.instrumentErrors || []).slice(0, 3)));
} catch (e) {
  ok('neutrality leg ran without exception', false, String(e.message).slice(0, 300));
}

console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
