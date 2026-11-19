// test-launchfunnel-b.js — proof for arm sim-launchfunnel-b (DIAG survey:
// screen fresh 8-seed bands for a launch-rich band; no game change).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the src/ diff vs the frozen base is 0 lines (DIAG,
// recorder wraps only), the survey substrate flags are env-gated on
// this base (VETREENGAGE + PARTYSIZE4 + SENSEEXPED + FLEEREPAIR2 +
// FIGHTALLY2) and the ALLYSLOT3 port is NOT applied (it gates only
// the fight engine's 4th slot, never launch formation), the copied
// driver differs from the launchfunnel-a driver only by the
// documented deltas (evidence date, arm name, companion3 recording),
// the survey counter (analyze-partyquads-b summarizeLeg, reused)
// counts launches/quads off v4departs exactly as the dmgshape floor
// does, the funnel taxonomy classifies a quad launch with 0 unknown,
// and the live recorder runs + is deterministic (D1) and neutral
// (D2) at 30d on a survey seed under the full survey substrate.
// Usage:
//   node scripts/test-launchfunnel-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
// Survey substrate (env-gated on master; read by game code at load).
process.env.VETREENGAGE = '1';
process.env.PARTYSIZE4 = '1';
process.env.SENSEEXPED = '1';
process.env.FLEEREPAIR2 = '1';
process.env.FIGHTALLY2 = '1';
const PQ = require(path.join(REPO, 'scripts', 'analyze-partyquads-b.js'));
const LF = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-a.js'));
const SURVEY = require(path.join(REPO, 'scripts', 'analyze-launchfunnel-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'launchfunnel-driver-20261119.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED this arm's prereg.
function frozenBase() {
  if (process.env.LAUNCHFUNNEL_B_BASE) return process.env.LAUNCHFUNNEL_B_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-19/sim-launchfunnel-b-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
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
check('no LAUNCHFUNNEL marker anywhere in src/js (win-plan.js untouched by this arm)',
  srcText.every(function (t) { return t.indexOf('LAUNCHFUNNEL') === -1; }));
check('survey substrate env gates present on this base (VETREENGAGE/PARTYSIZE4/SENSEEXPED/FLEEREPAIR2/FIGHTALLY2)',
  srcText[0].indexOf("process.env.VETREENGAGE === '1'") !== -1 &&
  srcText[2].indexOf("process.env.PARTYSIZE4 === '1'") !== -1 &&
  srcText[5].indexOf("process.env.SENSEEXPED === '1'") !== -1 &&
  srcText[4].indexOf("process.env.FIGHTALLY2 === '1'") !== -1 &&
  srcText[1].indexOf("process.env.FLEEREPAIR2 === '1'") !== -1);
check('ALLYSLOT3 port NOT applied: no ALLYSLOT3 gate anywhere in src/js',
  srcText.every(function (t) { return t.indexOf('ALLYSLOT3') === -1; }) &&
  !fs.readdirSync(path.join(REPO, 'src', 'js')).some(function (f) {
    return fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8').indexOf('ALLYSLOT3') !== -1;
  }));
const EXPECTED_SCRIPTS = [
  'scripts/launchfunnel-driver-20261119.js',
  'scripts/analyze-launchfunnel-b.js',
  'scripts/test-launchfunnel-b.js',
];
const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
check('scripts diff vs base + untracked is the launchfunnel-b instrument only (3 files)',
  JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
  'union=' + JSON.stringify(scriptsUnion));
check('launchfunnel-b instrument files exist',
  EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'launchfunnel-driver-20261119.js'), 'utf8');
check('new driver writes to the 2026-11-19 evidence dir by default (EVIDENCE_DATE override)',
  driverSrc.indexOf("process.env.EVIDENCE_DATE || '2026-11-19'") !== -1);
check('new driver arm is launchfunnel-b (out object + file names)',
  driverSrc.indexOf("arm: 'launchfunnel-b'") !== -1 &&
  driverSrc.indexOf("'launchfunnel-b-s' + seed") !== -1);
check('new driver records companion3 on brain depart rows (quad launches visible)',
  driverSrc.indexOf('companion3: commit.companion3 || null') !== -1 &&
  driverSrc.indexOf('companion3: commit ? (commit.companion3 || null) : null') !== -1);
check('new driver keeps the launchfunnel-a wraps (gate wave>=4, SEEDLAND hard-on, skip recorder mode on)',
  driverSrc.indexOf('if (w >= 4 && mdef && mdef.id) { // LAUNCHFUNNEL') !== -1 &&
  driverSrc.indexOf('const SEEDLAND = true;') !== -1 &&
  driverSrc.indexOf("installSkipRecorder(Game, 'on', errors, launchdefSkips)") !== -1);
check('new driver exports oneRun + classifySeedPath + poolReplica',
  typeof DRIVER.oneRun === 'function' && typeof DRIVER.classifySeedPath === 'function' &&
  typeof DRIVER.poolReplica === 'function');
check('survey analyzer exports bandOf + rankBands with the frozen floors (6 launches, 2 quads)',
  typeof SURVEY.bandOf === 'function' && typeof SURVEY.rankBands === 'function' &&
  SURVEY.GO_LAUNCHES === 6 && SURVEY.GO_QUADS === 2);

// ---------- 2. Survey counting fixtures ----------
console.log('== survey counting fixtures ==');
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lfb-count-'));
  const dir = path.join(tmp, 'band');
  fs.mkdirSync(dir);
  const seed = {
    seed: 106051, days: 150, gameDays: 150, instrumentErrors: [],
    winPlanStats: { partyTrios: 2, partyQuads: 1 },
    won: false, scaleRank: 'national', maxWave: 5, standing: 405,
    deaths: [], dawnbidScores: [], dawnbidDeparts: [],
    v4departs: [
      { day: 10, vid: 'h1', result: 'launch', source: 'brain', targetWave: 4, partySize: 4, companion: 'c1', companion2: 'c2', companion3: 'c3', party: ['c1', 'c2', 'c3'] },
      { day: 12, vid: 'h1', result: 'launch', source: 'brain', targetWave: 4, partySize: 3, companion: 'c1', companion2: 'c2', party: ['c1', 'c2'] },
      { day: 14, vid: 'h2', result: 'launch', source: 'brain', targetWave: 4, partySize: 2, companion: 'c1', party: ['c1'] },
      { day: 16, vid: 'h3', result: 'launch', source: 'brain', targetWave: 3, partySize: 4, companion: 'c1', companion2: 'c2', companion3: 'c3', party: ['c1', 'c2', 'c3'] },
      { day: 18, vid: 'h1', result: 'hold', source: 'brain', targetWave: 4, partySize: 2, companion: 'c1', party: ['c1'] },
    ],
  };
  fs.writeFileSync(path.join(dir, 's106051.json'), JSON.stringify(seed));
  const leg = PQ.summarizeLeg(dir);
  check('survey counts launches=3 off v4departs (quad+trio+pair; wave-3 and hold excluded)',
    leg.launches === 3, 'launches=' + leg.launches);
  check('survey counts quadLaunches=1 (partySize 4 with companion3)',
    leg.quadLaunches === 1, 'quadLaunches=' + leg.quadLaunches);
  check('survey counts trioLaunches=2 and partyQuads counter 1',
    leg.trioLaunches === 2 && leg.partyQuads === 1,
    'trios=' + leg.trioLaunches + ' partyQuads=' + leg.partyQuads);
  check('survey wall counts national 1, wave5 1, standing200 1',
    leg.wall.national === 1 && leg.wall.wave5 === 1 && leg.wall.standing200 === 1,
    JSON.stringify(leg.wall));
  // Ranker: a 3-launch band must NOT meet the frozen floors.
  const b = SURVEY.bandOf(dir);
  check('bandOf ranks a 3-launch/1-quad band below the GO floors (launches 3 < 6)',
    b.launches === 3 && b.quadLaunches === 1 && b.taxonomyComplete === false,
    'launches=' + b.launches + ' quads=' + b.quadLaunches + ' taxonomyComplete=' + b.taxonomyComplete);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
})();

// ---------- 3. Funnel taxonomy on a quad launch ----------
console.log('== funnel taxonomy fixture (quad launch) ==');
(function () {
  const j = {
    seed: 106051, days: 150, gameDays: 150, endReason: 'survived',
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
  check('quad launch records launchedSizes {4:1} for the survey tie-break',
    r.launchedSizes['4'] === 1, JSON.stringify(r.launchedSizes));
})();

// ---------- 4. Recorder: live in-memory run (shape, survey substrate) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'launchfunnel-driver-20261119.js'))];
  const driver = require(path.join(REPO, 'scripts', 'launchfunnel-driver-20261119.js'));
  check('live driver sees SEEDLAND hard-on', driver.SEEDLAND === true);
  const out = await driver.oneRun(106051);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run arm is launchfunnel-b', out.arm === 'launchfunnel-b' && out.run === 'launchfunnel-b', 'arm=' + out.arm);
  check('live run carries v4 + dawnbid + pool + skip arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.launchdefSkips));
  check('live run policy sha is the current competent verbatim (729af71ccddd; changed since launchfunnel-a df9b7dff4de4 by journey landings)',
    out.policySha === '729af71ccddd', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters, ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.v4gates || []).length + ' gate rows, ' +
    (out.companionPool || []).length + ' pool rows, ' + (out.launchdefSkips || []).length + ' skip rows');
}

// ---------- 5. Determinism legs D1/D2 (30d, survey seed, full substrate) ----------
console.log('== determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre',
    VETREENGAGE: '1', PARTYSIZE4: '1', SENSEEXPED: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/launchfunnel-driver-20261119.js');" +
    "d.oneRun(106051).then(function(o){" +
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
