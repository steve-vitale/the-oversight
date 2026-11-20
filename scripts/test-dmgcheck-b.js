// test-dmgcheck-b.js — proof for arm sim-dmgcheck-b (DIAG survey:
// screen fresh 8-seed bands for launched first-fights against the
// launch target; no game change).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the src/ diff vs the frozen base is 0 lines (DIAG,
// recorder wraps only), the survey substrate flags are env-gated on
// this base (VETREENGAGE + PARTYSIZE4 + SENSEEXPED + FLEEREPAIR2 +
// FIGHTALLY2 + LAUNCHSURVIVE) and the ALLYSLOT3 port is NOT applied
// (the env flag is set but unread — the driver records
// allyslot3InSrc:false on every corpus), the copied driver differs
// from the launchfunnel-b driver only by the documented deltas
// (evidence date, arm name, substrate self-description + CLI
// assertions, driver-filename strings), the first-fight counter
// (analyze-dmgshape-rerun-b.js launchesOf/firstFight, reused)
// counts launched first-fights exactly as the dmgshape floor does,
// the funnel taxonomy classifies a quad launch with 0 unknown, and
// the live recorder runs + is deterministic (D1) and neutral (D2)
// at 30d on a survey seed under the full survey substrate.
// Usage:
//   node scripts/test-dmgcheck-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
// Survey substrate (env-gated on master; read by game code at load,
// except ALLYSLOT3 which is set but unread — see the prereg).
process.env.VETREENGAGE = '1';
process.env.PARTYSIZE4 = '1';
process.env.SENSEEXPED = '1';
process.env.FLEEREPAIR2 = '1';
process.env.FIGHTALLY2 = '1';
process.env.ALLYSLOT3 = '1';
process.env.LAUNCHSURVIVE = '1';
const PQ = require(path.join(REPO, 'scripts', 'analyze-partyquads-b.js'));
const LF = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-a.js'));
const DSR = require(path.join(REPO, 'scripts', 'analyze-dmgshape-rerun-b.js'));
const SURVEY = require(path.join(REPO, 'scripts', 'analyze-dmgcheck-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'dmgcheck-driver-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED this arm's prereg.
function frozenBase() {
  if (process.env.DMGCHECK_B_BASE) return process.env.DMGCHECK_B_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-20/sim-dmgcheck-b-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  return null;
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitStatusNames(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim().slice(3); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
check('frozen base resolves (parent of the prereg-adding commit)', !!BASE);
const srcNames = BASE ? gitDiffNames(BASE, 'src/') : ['NO-BASE'];
const srcStatus = gitStatusNames('src/');
check('src/ diff vs base is 0 lines AND worktree src/ is clean (DIAG, recorder wraps only)',
  srcNames.length === 0 && srcStatus.length === 0,
  'diff=' + JSON.stringify(srcNames) + ' status=' + JSON.stringify(srcStatus));
const srcText = ['game.js', 'win-plan.js', 'villager-brain.js', 'villager-agency.js', 'fieldFights.js', 'party-wiring.js'].map(function (f) {
  return fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8');
});
check('no DMGCHECK marker anywhere in src/js (win-plan.js untouched by this arm)',
  srcText.every(function (t) { return t.indexOf('DMGCHECK') === -1; }));
check('survey substrate env gates present on this base (VETREENGAGE/PARTYSIZE4/SENSEEXPED/FLEEREPAIR2/FIGHTALLY2)',
  srcText[0].indexOf("process.env.VETREENGAGE === '1'") !== -1 &&
  srcText[2].indexOf("process.env.PARTYSIZE4 === '1'") !== -1 &&
  srcText[5].indexOf("process.env.SENSEEXPED === '1'") !== -1 &&
  srcText[4].indexOf("process.env.FIGHTALLY2 === '1'") !== -1 &&
  srcText[1].indexOf("process.env.FLEEREPAIR2 === '1'") !== -1);
check('ALLYSLOT3 port NOT applied: no ALLYSLOT3 gate anywhere in src/js (prereg discrepancy — env set, src absent)',
  srcText.every(function (t) { return t.indexOf('ALLYSLOT3') === -1; }) &&
  !fs.readdirSync(path.join(REPO, 'src', 'js')).some(function (f) {
    const p = path.join(REPO, 'src', 'js', f);
    try { if (!fs.statSync(p).isFile() || !/\.js$/.test(f)) return false; } catch (e) { return false; }
    return fs.readFileSync(p, 'utf8').indexOf('ALLYSLOT3') !== -1;
  }));
const EXPECTED_SCRIPTS = [
  'scripts/dmgcheck-driver-b.js',
  'scripts/analyze-dmgcheck-b.js',
  'scripts/test-dmgcheck-b.js',
];
const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
check('scripts diff vs base + untracked is the dmgcheck-b instrument only (3 files)',
  JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
  'union=' + JSON.stringify(scriptsUnion));
check('dmgcheck-b instrument files exist',
  EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'dmgcheck-driver-b.js'), 'utf8');
check('new driver writes to the 2026-11-20 evidence dir by default (EVIDENCE_DATE override)',
  driverSrc.indexOf("process.env.EVIDENCE_DATE || '2026-11-20'") !== -1);
check('new driver arm is dmgcheck-b (out object + file names)',
  driverSrc.indexOf("arm: 'dmgcheck-b'") !== -1 &&
  driverSrc.indexOf("'dmgcheck-b-s' + seed") !== -1);
check('new driver records substrate self-description on every corpus (flags + allyslot3InSrc)',
  driverSrc.indexOf('allyslot3InSrc: ALLYSLOT3_IN_SRC') !== -1 &&
  driverSrc.indexOf("allyslot3Flag: process.env.ALLYSLOT3 || null") !== -1 &&
  driverSrc.indexOf("launchsurviveFlag: process.env.LAUNCHSURVIVE || null") !== -1);
check('new driver asserts the frozen substrate env flags at the CLI (incl. ALLYSLOT3 env, never src presence)',
  driverSrc.indexOf("for (const f of ['SENSEEXPED', 'PARTYSIZE4', 'VETREENGAGE', 'FLEEREPAIR2', 'FIGHTALLY2', 'LAUNCHSURVIVE', 'ALLYSLOT3'])") !== -1 &&
  driverSrc.indexOf('ALLYSLOT3 unexpectedly present in src/js') !== -1);
check('new driver skips its own stack frames (dmgcheck-driver-b.js + dmgcheck-caller)',
  driverSrc.indexOf("line.indexOf('dmgcheck-driver-b.js')") !== -1 &&
  driverSrc.indexOf("(new Error('dmgcheck-caller'))") !== -1);
check('new driver keeps the launchfunnel-b wraps (gate wave>=4, SEEDLAND hard-on, skip recorder mode on)',
  driverSrc.indexOf('if (w >= 4 && mdef && mdef.id) { // LAUNCHFUNNEL') !== -1 &&
  driverSrc.indexOf('const SEEDLAND = true;') !== -1 &&
  driverSrc.indexOf("installSkipRecorder(Game, 'on', errors, launchdefSkips)") !== -1);
check('new driver exports oneRun + classifySeedPath + poolReplica',
  typeof DRIVER.oneRun === 'function' && typeof DRIVER.classifySeedPath === 'function' &&
  typeof DRIVER.poolReplica === 'function');
check('survey analyzer exports bandOf + rankBands + judge with the frozen floor (6 first-fights) + dmgcheckVerdict',
  typeof SURVEY.bandOf === 'function' && typeof SURVEY.rankBands === 'function' &&
  typeof SURVEY.judge === 'function' && SURVEY.GO_FIRST_FIGHTS === 6 &&
  typeof SURVEY.dmgcheckVerdict === 'function' &&
  SURVEY.dmgcheckVerdict({ launches: 16, firstFights: 9 }).verdict === 'BAND VARIANCE' &&
  SURVEY.dmgcheckVerdict({ launches: 6, firstFights: 2 }).verdict === 'BASE REGRESSION' &&
  SURVEY.dmgcheckVerdict({ launches: 10, firstFights: 5 }).verdict === 'INCONCLUSIVE');
check('survey analyzer selftest is green (first-fight counting + ranking + judge fixtures)',
  SURVEY.selftest() === true);

// ---------- 2. First-fight counting fixtures ----------
console.log('== first-fight counting fixtures ==');
(function () {
  const d = {
    seed: 106181, days: 150, gameDays: 150, instrumentErrors: [],
    v4departs: [
      { day: 10, vid: 'h1', result: 'launch', target: 'eater', targetWave: 4, party: ['c1', 'c2'], partySize: 3, source: 'brain' },
      { day: 20, vid: 'h2', result: 'launch', target: 'audit', targetWave: 4, party: ['c1'], partySize: 2, source: 'brain' },
      { day: 30, vid: 'h3', result: 'launch', target: 'herald', targetWave: 4, party: ['c1', 'c2'], partySize: 3, source: 'brain' },
      { day: 40, vid: 'h4', result: 'launch', target: 'reunion', targetWave: 4, party: ['c1', 'c2', 'c3'], partySize: 4, source: 'brain' },
      { day: 42, vid: 'h5', result: 'launch', target: 'reunion', targetWave: 4, party: ['c1'], partySize: 2, source: 'brain' },
      { day: 50, vid: 'h6', result: 'launch', target: 'eulogy', targetWave: 4, party: ['c1', 'c2'], partySize: 3, source: 'brain' },
      { day: 18, vid: 'h1', result: 'hold', target: 'eater', targetWave: 4, party: ['c1'], partySize: 2, source: 'brain' },
    ],
    v4encounters: [
      { day: 9, vid: 'h1', mid: 'eater', wave: 4, origin: 'world-tick', outcome: 'vFlee', rounds: 2, mDealt: 30 },
      { day: 10, vid: 'x1', mid: 'eater', wave: 4, origin: 'world-tick', outcome: 'vFlee', rounds: 3, mDealt: 95 },
      { day: 25, vid: 'h2', mid: 'audit', wave: 4, origin: 'aid', outcome: 'vKill', rounds: 6, mDealt: 400 },
      { day: 45, vid: 'h4', mid: 'reunion', wave: 4, origin: 'expedition', outcome: 'vFlee', rounds: 5, mDealt: 200 },
      { day: 52, vid: 'h6', mid: 'eulogy', wave: 4, origin: 'world-tick', outcome: 'vFlee', rounds: 0, mDealt: 0 },
      { day: 55, vid: 'h6', mid: 'eulogy', wave: 4, origin: 'aid', outcome: 'vFlee', rounds: 1, mDealt: 0 },
    ],
  };
  const launches = DSR.launchesOf(d);
  check('first-fight counter counts launches=6 off v4departs (hold excluded)',
    launches.length === 6, 'launches=' + launches.length);
  const ff = {};
  for (const l of launches) ff[l.vid] = DSR.firstFight(d, l);
  check('h1: same-day world-tick fight by another party is the first fight',
    !!ff.h1 && ff.h1.day === 10 && ff.h1.origin === 'world-tick', ff.h1);
  check('h2: aid kill on d25 is the first fight',
    !!ff.h2 && ff.h2.day === 25 && ff.h2.outcome === 'vKill', ff.h2);
  check('h3: no herald fight in window, no first fight', ff.h3 === null, ff.h3);
  check('h4+h5 share one first fight (d45 reunion)',
    !!ff.h4 && !!ff.h5 && ff.h4 === ff.h5 && ff.h4.day === 45,
    { h4: ff.h4 && ff.h4.day, h5: ff.h5 && ff.h5.day });
  check('h6: no-contact evade skipped, 0-damage aid fight on d55 is the first fight',
    !!ff.h6 && ff.h6.day === 55 && ff.h6.mDealt === 0, ff.h6);
  const counted = launches.filter(function (l) { return !!DSR.firstFight(d, l); }).length;
  check('band first-fight count is 5 of 6 launches (h3 starved)',
    counted === 5, 'counted=' + counted);
})();

// ---------- 3. Funnel taxonomy on a quad launch ----------
console.log('== funnel taxonomy fixture (quad launch) ==');
(function () {
  const j = {
    seed: 106181, days: 150, gameDays: 150, endReason: 'survived',
    standing: 405, scaleRank: 'national', won: false, maxWave: 5, villageLost: false,
    instrumentErrors: [], daily: [], deaths: [],
    v4seeds: [{ day: 10, vid: 'v1', mid: 'strike', wave: 4, outcome: 'fled', path: 'world-tick', caller: 'test', stageAfter: 'party', target: 'strike', node: null }],
    dawnbidScores: [{ day: 20, part: 0, vid: 'v1',
      cands: [{ kind: 'winplan', w: 10, winPlanAction: 'party_launch', companion: 'c1' }],
      pick: { kind: 'winplan', winPlanAction: 'party_launch' },
      logCands: [{ kind: 'winplan', score: 10, winPlanAction: 'party_launch' }],
      commit: { kind: 'winplan', winPlanAction: 'party_launch', companion: 'c1' },
      plan: { stage: 'party', target: 'strike', needWave: 4, party: ['c1', 'c2', 'c3'] },
      holderGear: { armed: true, armored: true } }],
    dawnbidDeparts: [{ seq: 1, day: 20, vid: 'v1', source: 'brain', result: 'launch',
      winPlanAction: 'party_launch', commitKind: 'dawn', commitPart: 0,
      companion: 'c1', companion3: 'c3', vidExped: true, companionExped: true,
      vidBlock: null, companionBlock: null, stage: 'party', target: 'strike',
      party: ['c1', 'c2', 'c3'] }],
    v4departs: [{ day: 20, vid: 'v1', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
      companion: 'c1', companion2: 'c2', companion3: 'c3', stage: 'party', target: 'strike',
      party: ['c1', 'c2', 'c3'], partySize: 4, partyKillers: 0, partyArmed: 3, targetWave: 4 }],
    v4encounters: [{ day: 25, vid: 'v1', mid: 'strike', wave: 4, alliesN: 3, allyVids: ['c1'],
      allyFromStart: true, gate: null, outcome: 'vFlee', rounds: 3, vTaken: 20, mDealt: 100,
      calledHelp: false, allyVid: null, fleeHpFrac: null, trickBefore: false, trickAfter: false,
      lines: [], log: [], origin: 'expedition' }],
    v4gates: [], dawnbidCensus: [], dawnbidStarts: [], launchdefSkips: [], companionPool: [],
  };
  const r = LF.funnelForSeed(j);
  const inst = r.instances[0];
  check('quad launch classifies launched-fought-no-kill with party size 4 and 0 unknown',
    inst.funnelBucket === 'launched-fought-no-kill' && inst.launchPartySize === 4 && r.byFunnel.unknown === 0,
    'bucket=' + inst.funnelBucket + ' size=' + inst.launchPartySize + ' unknown=' + r.byFunnel.unknown);
})();

// ---------- 4. Recorder: live in-memory run (shape, survey substrate) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'dmgcheck-driver-b.js'))];
  const driver = require(path.join(REPO, 'scripts', 'dmgcheck-driver-b.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(106181);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run arm is dmgcheck-b', out.arm === 'dmgcheck-b' && out.run === 'dmgcheck-b', 'arm=' + out.arm);
  check('live run carries v4 + dawnbid + pool + skip arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.launchdefSkips));
  check('live run self-describes the substrate (all seven flags 1, allyslot3InSrc false, launchTrackOn true)',
    out.senseexpedFlag === '1' && out.partysize4Flag === '1' && out.vetreengageFlag === '1' &&
    out.fleerepair2Flag === '1' && out.fightally2Flag === '1' && out.allyslot3Flag === '1' &&
    out.launchsurviveFlag === '1' && out.allyslot3InSrc === false && out.launchTrackOn === true,
    JSON.stringify({ se: out.senseexpedFlag, p4: out.partysize4Flag, vr: out.vetreengageFlag,
      fr: out.fleerepair2Flag, fa: out.fightally2Flag, a3: out.allyslot3Flag,
      ls: out.launchsurviveFlag, a3src: out.allyslot3InSrc, lt: out.launchTrackOn }));
  check('live run policy sha is the current competent verbatim (1884c8852d38)',
    out.policySha === '1884c8852d38', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters, ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.v4gates || []).length + ' gate rows, ' +
    (out.companionPool || []).length + ' pool rows, ' + (out.launchdefSkips || []).length + ' skip rows');
}

// ---------- 5. Determinism legs D1/D2 (30d, survey seed, full substrate) ----------
console.log('== determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre',
    VETREENGAGE: '1', PARTYSIZE4: '1', SENSEEXPED: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    ALLYSLOT3: '1', LAUNCHSURVIVE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/dmgcheck-driver-b.js');" +
    "d.oneRun(106181).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childRun(30, {});
  const b = childRun(30, {});
  check('D1 repeatability: identical full corpus, recorder ON twice, survey substrate (30d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(30, { LAUNCHFUNNEL_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, survey substrate (30d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty recorder arrays (v4/dawnbid/pool/skips)',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4encounters || []).length === 0 && (off.full.launchdefSkips || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  console.log('  info: D1 30d run recorded ' + (a.full.v4encounters || []).length + ' encounters, ' +
    (a.full.v4seeds || []).length + ' seed rows, ' + (a.full.v4gates || []).length + ' gate rows');
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
