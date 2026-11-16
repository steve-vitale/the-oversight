// test-trickteach-b.js — proof for arm sim-trickteach-b (LEVER: one
// survived observation teaches a wave-4 trick, TRICKTEACH=1 flips the
// learning threshold 2 → 1).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the lever is env-gated (the flag is read in exactly one
// place, trickLearnThreshold(); off mode = the 2-observation path),
// the threshold flip teaches after exactly 1 observation on all
// three channels (villager, scholar, witness) and the control still
// needs 2, the narration never prints a stale "twice" or "/2" under
// the armed threshold, the gate/fight readers see the trick as known
// after the single armed observation, the driver records the
// trickteach rows (trickBefore/trickAfter, trickKnownEnd,
// trickObsEnd), and the determinism legs D1 (repeatability) + D2
// (wrap neutrality) are green at 150d on seed 102211 under
// TRICKTEACH=1, LEG=competent.
// Usage:
//   node scripts/test-trickteach-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-trickteach-b'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitOut(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
  catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcDiff = gitOut('diff master...HEAD -- src/');
const srcFiles = gitOut('diff master...HEAD --name-only -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
check('src diff is game.js only (the lever)', srcFiles.length === 1 && srcFiles[0] === 'src/js/game.js',
  'got ' + JSON.stringify(srcFiles));
check('src diff mentions TRICKTEACH (the lever flag)', srcDiff.indexOf('TRICKTEACH') !== -1);
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const flagReads = (gameSrc.match(/process\.env\.TRICKTEACH/g) || []).length;
check('flag is read in exactly one place (trickLearnThreshold)', flagReads === 1, 'got ' + flagReads);
const thSites = (gameSrc.match(/obs\[mid\] < _th/g) || []).length;
check('three threshold sites, all threshold-aware (obs[mid] < _th)', thSites === 3, 'got ' + thSites);
check('no stale hardcoded obs[mid] < 2 remains', gameSrc.indexOf('obs[mid] < 2') === -1);
check('no stale "/2" observation denominator remains in the trick code',
  (gameSrc.match(/\/2 — one more survived encounter/g) || []).length === 0 &&
  gameSrc.indexOf('Sighting ${obs[mid]}/2') === -1 &&
  gameSrc.indexOf('Witnessed kill ${obs[mid]}/2') === -1);
const winPlanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('gate reads villageKnowsTrick (anchor: trickHolds branch)', winPlanSrc.indexOf('villageKnowsTrick') !== -1);
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('field-fight AI reads villageKnowsTrick (anchor)', ffSrc.indexOf('villageKnowsTrick') !== -1);
check('killfail analyzer unmodified by this arm',
  gitOut('diff master...HEAD -- scripts/analyze-killfail-a.js') === '');
check('killfail driver unmodified by this arm',
  gitOut('diff master...HEAD -- scripts/killfail-driver-20261116.js') === '');
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'trickteach-driver-20261116.js'), 'utf8');
check('driver has TRICKTEACH_RECORDER off-switch', driverSrc.indexOf('TRICKTEACH_RECORDER') !== -1);
check('driver defaults LEG to competent', driverSrc.indexOf("process.env.LEG || 'competent'") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records BEFORE/AFTER trick state (trickBefore + trickAfter)',
  driverSrc.indexOf('trickBefore') !== -1 && driverSrc.indexOf('trickAfter') !== -1);
check('driver records trickKnownEnd + trickObsEnd snapshots',
  driverSrc.indexOf('trickKnownEnd') !== -1 && driverSrc.indexOf('trickObsEnd') !== -1);
check('driver records the lever state per run (trickTeach + trickTeachThreshold)',
  driverSrc.indexOf('trickTeach:') !== -1 && driverSrc.indexOf('trickTeachThreshold:') !== -1);
// Wave-4/5 id sets match the data (10 + 10).
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const mlist = monsters.monsters || monsters;
const w4live = mlist.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const w5live = mlist.filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
check('wave-4 ids are 10 and match the data', w4live.length === 10 && JSON.stringify(w4live) === JSON.stringify(ANALYZE_SEEDS_W4()),
  'got ' + JSON.stringify(w4live));
check('wave-5 ids are 10 and match the data', w5live.length === 10 && JSON.stringify(w5live) === JSON.stringify(ANALYZE_SEEDS_W5()),
  'got ' + JSON.stringify(w5live));
function ANALYZE_SEEDS_W4() { return require(path.join(REPO, 'scripts', 'analyze-killfail-a')).W4.slice().sort(); }
function ANALYZE_SEEDS_W5() { return require(path.join(REPO, 'scripts', 'analyze-killfail-a')).W5.slice().sort(); }

// ---------- 2. Unit: threshold flip, live loadGame (child processes) ----------
// Each child loads the game fresh with TRICKTEACH set or unset, then
// drives the three observation channels directly and reports the
// observation counts, known-state, and captured narration as JSON.
// The parent asserts the threshold behavior; the child never judges.
console.log('== unit: threshold flip ==');
function thresholdChild(envExtra) {
  const env = Object.assign({}, process.env, envExtra || {});
  delete env.TRICKTEACH_RECORDER;
  const script = [
    "const { loadGame, setupGame } = require('./scripts/sim-harness');",
    "(async function () {",
    "  const { Game } = await loadGame({ seed: 102211, mode: 'trickteach-proof', fullTelemetry: false });",
    "  const said = [];",
    "  const origSay = Game.say ? Game.say.bind(Game) : null;",
    "  Game.say = function (s) { said.push(String(s)); try { if (origSay) return origSay(s); } catch (e) {} };",
    // Full new-game setup: bare loadGame leaves state undefined and a
    // hand-rolled {} state lacks codex, so monsterDisplayName throws
    // inside the learn-beat template (swallowed by the function's
    // try/catch — knowledge lands, narration is lost). setupGame
    // builds the real state; obs/tricks are reset after it so the
    // depart cannot pollute the counts.
    "  await setupGame(Game);",
    "  Game.state.villageCounterObs = {};",
    "  Game.state.villagerTricks = {};",
    "  said.length = 0;",
    "  const roster = ((Game.state.village || {}).roster || []).slice();",
    "  if (roster.length < 3) { console.log(JSON.stringify({ error: 'roster<3', roster: roster })); return; }",
    "  const w1 = roster[0], w2 = roster[1], dead1 = roster[2];",
    "  const out = { threshold: null, villager: {}, scholar: {}, witness: {} };",
    "  try { out.threshold = Game.trickLearnThreshold(); } catch (e) { out.threshold = 'ERR:' + e.message; }",
    "  out.villager.knownBefore = Game.villageKnowsTrick('algorithm');",
    "  Game.noteVillagerTrickObservation(w1, 'algorithm');",
    "  out.villager.obsAfter1 = (Game.state.villageCounterObs || {}).algorithm || 0;",
    "  out.villager.knownAfter1 = Game.villageKnowsTrick('algorithm');",
    "  Game.noteVillagerTrickObservation(w2, 'algorithm');",
    "  out.villager.obsAfter2 = (Game.state.villageCounterObs || {}).algorithm || 0;",
    "  out.villager.knownAfter2 = Game.villageKnowsTrick('algorithm');",
    "  out.scholar.knownBefore = Game.villageKnowsTrick('eater');",
    "  Game.noteScholarTrickObservation('eater');",
    "  out.scholar.obsAfter1 = (Game.state.villageCounterObs || {}).eater || 0;",
    "  out.scholar.knownAfter1 = Game.villageKnowsTrick('eater');",
    "  Game.noteScholarTrickObservation('eater');",
    "  out.scholar.obsAfter2 = (Game.state.villageCounterObs || {}).eater || 0;",
    "  out.scholar.knownAfter2 = Game.villageKnowsTrick('eater');",
    "  out.witness.knownBefore = Game.villageKnowsTrick('reunion');",
    "  Game.noteNodeWitnessKill(dead1, 'reunion', [w1]);",
    "  out.witness.obsAfter1 = (Game.state.villageCounterObs || {}).reunion || 0;",
    "  out.witness.knownAfter1 = Game.villageKnowsTrick('reunion');",
    "  Game.noteNodeWitnessKill(dead1, 'reunion', [w2]);",
    "  out.witness.obsAfter2 = (Game.state.villageCounterObs || {}).reunion || 0;",
    "  out.witness.knownAfter2 = Game.villageKnowsTrick('reunion');",
    "  out.said = said;",
    "  console.log(JSON.stringify(out));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const res = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(res.trim().split('\n').pop());
}
const armedU = thresholdChild({ TRICKTEACH: '1' });
const controlU = thresholdChild({});
check('armed threshold is 1', armedU.threshold === 1, 'got ' + JSON.stringify(armedU.threshold));
check('control threshold is 2', controlU.threshold === 2, 'got ' + JSON.stringify(controlU.threshold));
check('armed: one villager observation teaches (algorithm)',
  armedU.villager.knownBefore === false && armedU.villager.obsAfter1 === 1 && armedU.villager.knownAfter1 === true,
  JSON.stringify(armedU.villager));
check('control: one villager observation does NOT teach (algorithm)',
  controlU.villager.knownBefore === false && controlU.villager.obsAfter1 === 1 && controlU.villager.knownAfter1 === false,
  JSON.stringify(controlU.villager));
check('control: the second villager observation teaches (algorithm)',
  controlU.villager.obsAfter2 === 2 && controlU.villager.knownAfter2 === true,
  JSON.stringify(controlU.villager));
check('armed: one scholar observation teaches (eater)',
  armedU.scholar.obsAfter1 === 1 && armedU.scholar.knownAfter1 === true, JSON.stringify(armedU.scholar));
check('control: one scholar observation does NOT teach (eater)',
  controlU.scholar.obsAfter1 === 1 && controlU.scholar.knownAfter1 === false, JSON.stringify(controlU.scholar));
check('control: the second scholar observation teaches (eater)',
  controlU.scholar.obsAfter2 === 2 && controlU.scholar.knownAfter2 === true, JSON.stringify(controlU.scholar));
check('armed: one witnessed kill teaches (reunion)',
  armedU.witness.obsAfter1 === 1 && armedU.witness.knownAfter1 === true, JSON.stringify(armedU.witness));
check('control: one witnessed kill does NOT teach (reunion)',
  controlU.witness.obsAfter1 === 1 && controlU.witness.knownAfter1 === false, JSON.stringify(controlU.witness));
check('control: the second witnessed kill teaches (reunion)',
  controlU.witness.obsAfter2 === 2 && controlU.witness.knownAfter2 === true, JSON.stringify(controlU.witness));
const armedLearned = armedU.said.filter(function (s) { return s.indexOf('COUNTER LEARNED') !== -1; });
const controlLearned = controlU.said.filter(function (s) { return s.indexOf('COUNTER LEARNED') !== -1; });
check('armed learn beats exist (3 channels, 3 species)', armedLearned.length === 3, 'got ' + armedLearned.length);
check('control learn beats exist (3 channels, 3 species)', controlLearned.length === 3, 'got ' + controlLearned.length);
check('armed learn beats never say "twice"', armedLearned.every(function (s) { return s.indexOf('twice') === -1; }),
  JSON.stringify(armedLearned).slice(0, 400));
// The villager + scholar learn beats carry the count language
// ("twice" at threshold 2, "one sighting was enough" at 1); the
// witness beat never did — it is framed second-hand ("watched it
// take …"), so it is asserted on its own wording, not on "twice".
const armedCounted = armedLearned.filter(function (s) { return s.indexOf('one sighting was enough') !== -1; });
const controlCounted = controlLearned.filter(function (s) { return s.indexOf('twice') !== -1; });
check('armed villager+scholar learn beats say "one sighting was enough" (2 of 3)',
  armedCounted.length === 2, 'got ' + armedCounted.length + ' of ' + armedLearned.length);
check('control villager+scholar learn beats say "twice" (2 of 3)',
  controlCounted.length === 2, 'got ' + controlCounted.length + ' of ' + controlLearned.length);
check('armed + control witness learn beats are framed second-hand ("watched it take")',
  armedLearned.some(function (s) { return s.indexOf('watched it take') !== -1; }) &&
  controlLearned.some(function (s) { return s.indexOf('watched it take') !== -1; }),
  JSON.stringify(armedLearned.concat(controlLearned)).slice(0, 400));
check('armed: no stale "(1/2" first-sighting line prints',
  armedU.said.every(function (s) { return s.indexOf('(1/2') === -1; }),
  JSON.stringify(armedU.said.filter(function (s) { return s.indexOf('/2') !== -1; })).slice(0, 300));
check('control: the scholar first-sighting line prints "(1/2"',
  controlU.said.some(function (s) { return s.indexOf('(1/2') !== -1; }));

// ---------- 3. Recorder: live in-memory runs (shape + both flag states) ----------
console.log('== recorder live ==');
function loadDriverFresh(days, trickTeach) {
  const driverPath = path.join(REPO, 'scripts', 'trickteach-driver-20261116.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.LEG = 'competent';
  process.env.DAYS = String(days);
  delete process.env.TABLESEATNOWAIT;
  delete process.env.LEANLINKRESCUE;
  if (trickTeach) process.env.TRICKTEACH = '1';
  else delete process.env.TRICKTEACH;
  return require(driverPath);
}
async function liveRuns() {
  const dControl = loadDriverFresh(5, false);
  const outControl = await dControl.oneRun(102211);
  check('live control run completes with 0 instrument errors', outControl.instrumentErrors.length === 0,
    JSON.stringify(outControl.instrumentErrors.slice(0, 3)));
  check('live control run policy is competent, sha 74a890f0844e',
    outControl.policy === 'competent' && outControl.policySha === '74a890f0844e',
    'got ' + outControl.policy + '/' + outControl.policySha);
  check('control run records trickTeach false + threshold 2',
    outControl.trickTeach === false && outControl.trickTeachThreshold === 2,
    'got trickTeach=' + outControl.trickTeach + ' threshold=' + outControl.trickTeachThreshold);
  check('control run carries trickKnownEnd + trickObsEnd',
    outControl.trickKnownEnd && Array.isArray(outControl.trickKnownEnd.wave12) &&
    Array.isArray(outControl.trickKnownEnd.wave345) && outControl.trickObsEnd != null,
    JSON.stringify(outControl.trickKnownEnd));
  const dArmed = loadDriverFresh(150, true);
  const outLong = await dArmed.oneRun(102211);
  check('live 150d armed run completes with 0 instrument errors', outLong.instrumentErrors.length === 0,
    JSON.stringify(outLong.instrumentErrors.slice(0, 3)));
  check('armed run records trickTeach true + threshold 1',
    outLong.trickTeach === true && outLong.trickTeachThreshold === 1,
    'got trickTeach=' + outLong.trickTeach + ' threshold=' + outLong.trickTeachThreshold);
  check('armed run carries killfailFights array', Array.isArray(outLong.killfailFights));
  // Row shape is the ANALYZER's classifiability on the JUDGED
  // population (launched fights): a wild row may carry a null
  // fighter.hpEntry (a visitor/joiner with no village health
  // record and no getPerson hit — hpAtEntry's fallbacks all miss),
  // and the analyzer tolerates wild rows. A launched row must
  // classify: the killfail bar is >=90% classified among launched.
  const KA = require(path.join(REPO, 'scripts', 'analyze-killfail-a'));
  const cls = KA.classifySeed(outLong);
  check('live 150d armed run: every launched fight classifies (0 unclassified)',
    cls.unclassified.length === 0,
    JSON.stringify(cls.unclassified.map(function (r) { return { day: r.fight.day, mid: r.fight.mid, missing: r.classification.missingFields }; })));
  check('live 150d armed run: launched classification share is 100%',
    cls.launchedTotal === 0 || cls.launchedClassified === cls.launchedTotal,
    'got ' + cls.launchedClassified + '/' + cls.launchedTotal);
  const badKf = (cls.launched || []).map(function (r) { return r.fight; }).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.mid && (r.wave === 4 || r.wave === 5) &&
      r.fighter && typeof r.fighter.class === 'string' && typeof r.fighter.armorP === 'number' &&
      typeof r.fighter.hpEntry === 'number' && typeof r.trickBefore === 'boolean' &&
      typeof r.outcome === 'string' && typeof r.rounds === 'number' && typeof r.mDealt === 'number' &&
      KA.effectiveMhp(r).method !== 'none' && Array.isArray(r.log) && Array.isArray(r.allies));
  });
  check('launched killfail rows have their full shape (before + after + entry HP by some method)', !badKf,
    badKf ? JSON.stringify(badKf).slice(0, 300) : '');
  check('armed run carries trickKnownEnd wave12/wave345 arrays',
    Array.isArray(outLong.trickKnownEnd.wave12) && Array.isArray(outLong.trickKnownEnd.wave345),
    JSON.stringify(outLong.trickKnownEnd));
}

// ---------- 4. Determinism legs D1 + D2 (150d, seed 102211, TRICKTEACH=1, LEG=competent) ----------
console.log('== determinism legs D1/D2 ==');
function childRun(envExtra, tag) {
  const env = Object.assign({}, process.env, { DAYS: '150', LEG: 'competent', TRICKTEACH: '1' }, envExtra || {});
  const outFile = '/tmp/trickteach-proof-' + tag + '.json';
  const script = "const fs=require('fs');const d=require('./scripts/trickteach-driver-20261116.js');"
    + "d.oneRun(102211).then(function(o){"
    + "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};"
    + "fs.writeFileSync(" + JSON.stringify(outFile) + ", JSON.stringify({fp:fp,full:o}));"
    + "console.log('WROTE " + outFile + "');"
    + "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(fs.readFileSync(outFile, 'utf8'));
}
async function determinism() {
  const a = childRun({}, 'd1a');
  const b = childRun({}, 'd1b');
  check('D1 repeatability: identical full corpus, recorder ON twice (150d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun({ TRICKTEACH_RECORDER: 'off' }, 'd2off');
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (150d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp));
  check('D2 recorder-off run carries empty killfail/rumorplan/seedattach/v4/dawnbid arrays',
    (off.full.killfailFights || []).length === 0 && (off.full.rumorplanLaunches || []).length === 0 &&
    (off.full.rumorplanTargetDiffs || []).length === 0 &&
    (off.full.seedattachBounces || []).length === 0 && (off.full.seedattachCensus || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
}

(async function () {
  try {
    await liveRuns();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
