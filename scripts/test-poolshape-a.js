// test-poolshape-a.js — proof test, arm sim-poolshape-a.
// Covers: (1) classification-coverage leg — decomposePoolRows on
// synthetic pool rows (sole-blocker per reason code, co-occurrence,
// away-flag-vs-node disagreement, counterfactual relaxations,
// holder/stage splits, replication check); (2) recorder live shape
// (5d, seed 103411); (3) determinism legs D1/D2/D2b (60d, seed 103411,
// VETREENGAGE=1 and unset) via the poolshape driver wrapper.
// Usage: node scripts/test-poolshape-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'analyze-poolshape-a'));

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS: ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL: ' + name + (detail ? ' — ' + String(detail).slice(0, 400) : '')); }
}

// ---------- 1. Classification-coverage leg (synthetic pool rows) ----------
console.log('== classification coverage ==');
const HAVEN = { nx: 4, ny: 4 };
function mem(id, over) {
  return Object.assign({ id: id, profile: 'wanderer', trust: 50, trustRaw: 50,
    node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false, alive: true,
    firstFail: 'eligible' }, over || {});
}
function selfMem(id) {
  return { id: id, profile: null, trust: 10, trustRaw: null, node: null,
    away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' };
}
function row(day, vid, members, over) {
  const eligible = members.filter(function (m) { return m.firstFail === 'eligible'; }).map(function (m) { return m.id; });
  return Object.assign({ day: day, part: 0, vid: vid, target: 'eulogy', stage: 'party',
    holderProfile: 'wanderer', holderNode: { nx: 4, ny: 4 }, haven: HAVEN,
    rosterN: members.length, eligible: eligible, bidCompanion: null, agree: null,
    members: members }, over || {});
}
(function () { // C1: sole-blocker per condition — alone counts + relaxations
  const members = [
    selfMem('holder1'),
    mem('m_dead', { alive: false, firstFail: 'dead' }),
    mem('m_away', { away: true, node: { nx: 4, ny: 4 }, firstFail: 'away' }), // at Haven, away by flag alone
    mem('m_trust', { trust: 5, trustRaw: 5, firstFail: 'trustLow' }),
    mem('m_node', { node: { nx: 9, ny: 9 }, firstFail: 'notAtHaven' }),
    mem('m_eng', { engaged: true, firstFail: 'engaged' }),
    mem('m_prof', { profile: 'forager', firstFail: 'notRanger' }),
    mem('m_exped', { onExped: true, firstFail: 'onExped' }),
    mem('m_ok', {}),
  ];
  const d = AN.decomposePoolRows([row(10, 'holder1', members)]);
  check('C1: popB excludes self/scholar (8 living non-self)', d.popB === 8, 'popB=' + d.popB);
  check('C1: every condition marginal is 1', ['dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'].every(function (k) { return d.marginal[k] === 1; }), JSON.stringify(d.marginal));
  check('C1: every condition alone is 1', ['dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'].every(function (k) { return d.alone[k] === 1; }), JSON.stringify(d.alone));
  check('C1: one eligible member, dawn non-empty', d.poolRows === 1 && d.emptyRows === 0 && d.perDawn[0].eligibleN === 1);
  check('C1: relaxAway makes the away member eligible (mean 2)', d.relaxTable.relaxAway.meanEligiblePerDawn === 2, JSON.stringify(d.relaxTable.relaxAway));
  check('C1: relaxProfile makes the forager eligible (mean 2)', d.relaxTable.relaxProfile.meanEligiblePerDawn === 2);
  check('C1: relaxTrust makes the low-trust member eligible (mean 2)', d.relaxTable.relaxTrust.meanEligiblePerDawn === 2);
  check('C1: relaxNode makes the off-node member eligible (mean 2)', d.relaxTable.relaxNode.meanEligiblePerDawn === 2);
  check('C1: relaxEngaged makes the engaged member eligible (mean 2)', d.relaxTable.relaxEngaged.meanEligiblePerDawn === 2);
  check('C1: relaxOnExped makes the expedition member eligible (mean 2)', d.relaxTable.relaxOnExped.meanEligiblePerDawn === 2);
  check('C1: dominant marginal is a 7-way tie, all named', d.perDawn[0].dominantMarginal.length === 7 && d.perDawn[0].dominantMarginalN === 1, JSON.stringify(d.perDawn[0].dominantMarginal));
  check('C1: classification complete (codedShare 1, unknown 0, shapeBad 0)', d.codedShare === 1 && d.unknown === 0 && d.shapeBad === 0);
})();
(function () { // C2: co-occurrence — away+notRanger member in both marginals, neither alone
  const members = [
    selfMem('holder2'),
    mem('m_both', { away: true, node: { nx: 4, ny: 4 }, profile: 'homebody', firstFail: 'away' }),
    mem('m_prof', { profile: 'forager', firstFail: 'notRanger' }),
  ];
  const d = AN.decomposePoolRows([row(11, 'holder2', members)]);
  check('C2: away marginal 1, notRanger marginal 2', d.marginal.away === 1 && d.marginal.notRanger === 2, JSON.stringify(d.marginal));
  check('C2: away alone 0 (the away member is also a non-ranger)', d.alone.away === 0, JSON.stringify(d.alone));
  check('C2: notRanger alone 1, combo 1', d.alone.notRanger === 1 && d.combo.notRanger === 1, JSON.stringify(d.alone) + ' ' + JSON.stringify(d.combo));
  check('C2: dawn is empty (0 eligible)', d.emptyRows === 1 && d.emptyShare === 1);
  check('C2: dominant marginal is notRanger (2)', d.perDawn[0].dominantMarginal.length === 1 && d.perDawn[0].dominantMarginal[0] === 'notRanger', JSON.stringify(d.perDawn[0].dominantMarginal));
  check('C2: relaxProfileAway fills the dawn (2 eligible)', d.perDawn[0].relaxElig.relaxProfileAway === 2, JSON.stringify(d.perDawn[0].relaxElig));
  check('C2: relaxProfile alone fills it with 1 (the forager)', d.perDawn[0].relaxElig.relaxProfile === 1);
  check('C2: relaxAway alone fills it with 0 (away member is still a non-ranger)', d.perDawn[0].relaxElig.relaxAway === 0);
})();
(function () { // C3: away-flag-vs-node disagreement, counted separately
  const members = [
    selfMem('holder3'),
    mem('m_flag', { away: true, node: { nx: 4, ny: 4 }, firstFail: 'away' }), // flag says away, node says Haven
    mem('m_off', { node: { nx: 9, ny: 9 }, firstFail: 'notAtHaven' }), // off-node, flag clear
    mem('m_null', { node: null, firstFail: 'notAtHaven' }), // node unknown -> not at Haven
  ];
  const d = AN.decomposePoolRows([row(12, 'holder3', members)]);
  check('C3: awayNodeDisagree counts the flagged-at-Haven member (1)', d.awayNodeDisagree === 1, 'got ' + d.awayNodeDisagree);
  check('C3: nodeAwayDisagree counts off-node flag-clear members (2)', d.nodeAwayDisagree === 2, 'got ' + d.nodeAwayDisagree);
  check('C3: nodeNull counts the unreadable node (1)', d.nodeNull === 1, 'got ' + d.nodeNull);
  check('C3: relaxAway (node-read counterfactual) makes exactly the flagged-at-Haven member eligible', d.perDawn[0].relaxElig.relaxAway === 1, JSON.stringify(d.perDawn[0].relaxElig));
  check('C3: relaxNode alone makes 2 eligible (off-node member + node-null member)', d.perDawn[0].relaxElig.relaxNode === 2, JSON.stringify(d.perDawn[0].relaxElig));
  check('C3: per-dawn disagreement fields match the pooled counts', d.perDawn[0].awayNodeDisagree === 1 && d.perDawn[0].nodeAwayDisagree === 2);
})();
(function () { // C4: profile census + holder split + stage split + bid sanity
  const members = [
    selfMem('holder4'),
    mem('a', { profile: 'forager', firstFail: 'notRanger' }),
    mem('b', { profile: 'homebody', firstFail: 'notRanger' }),
    mem('c', { profile: 'craftsman', firstFail: 'notRanger' }),
    mem('d', { profile: null, firstFail: 'notRanger' }),
  ];
  const r = row(13, 'holder4', members, { holderProfile: 'forager', stage: 'gear' });
  const d = AN.decomposePoolRows([r]);
  check('C4: non-ranger profile census names forager/homebody/craftsman/null', d.nonRangerProfiles.forager === 1 && d.nonRangerProfiles.homebody === 1 && d.nonRangerProfiles.craftsman === 1 && d.nonRangerProfiles.null === 1, JSON.stringify(d.nonRangerProfiles));
  check('C4: non-ranger holder dawn counted in the holder split', d.holderSplit.nonRanger.dawns === 1 && d.holderSplit.nonRanger.empty === 1, JSON.stringify(d.holderSplit));
  check('C4: gear stage counted in the stage split', d.stageSplit.gear === 1, JSON.stringify(d.stageSplit));
  check('C4: empty dawn with no bid (bidOnEmpty 0)', d.bidOnEmpty === 0 && d.emptyRows === 1);
})();
(function () { // C5: eligible member passes condsOf/eligibleUnder with no relax
  const c = AN.condsOf(mem('ok'), HAVEN);
  check('C5: a clean member fails no condition', Object.keys(c).filter(function (k) { return ['dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'].indexOf(k) !== -1 && c[k]; }).length === 0, JSON.stringify(c));
  check('C5: eligibleUnder(null) true for a clean member', AN.eligibleUnder(c, null) === true);
  const c2 = AN.condsOf(mem('x', { profile: 'explorer' }), HAVEN);
  check('C5: explorer counts as ranger (notRanger false)', c2.notRanger === false);
  const c3 = AN.condsOf(mem('y', { trustRaw: undefined, trust: 10 }), HAVEN);
  check('C5: trust default 10 IS trustLow (code: undefined -> 10, floor 15)', c3.trustLow === true);
  const c4 = AN.condsOf(mem('z', { trust: 15, trustRaw: 15 }), HAVEN);
  check('C5: trust exactly 15 passes the floor', c4.trustLow === false);
})();
(function () { // C6: replicationCheck — matching corpora pass, mismatched fail
  function fakeCorpus(rowsBySeed) {
    const bySeed = {};
    for (const s of Object.keys(rowsBySeed)) {
      bySeed[s] = { companionPool: rowsBySeed[s].map(function (r) { return { day: r.day, vid: r.vid, eligible: r.elig ? [r.vid + 'x'] : [] }; }) };
    }
    return { bySeed: bySeed };
  }
  const a = fakeCorpus({ 103411: [{ day: 5, vid: 'h1', elig: true }], 103412: [{ day: 6, vid: 'h2', elig: false }] });
  const b = fakeCorpus({ 103411: [{ day: 5, vid: 'h1', elig: true }], 103412: [{ day: 6, vid: 'h2', elig: false }] });
  const c = fakeCorpus({ 103411: [{ day: 5, vid: 'h1', elig: true }], 103412: [{ day: 7, vid: 'h2', elig: false }] });
  const r1 = AN.replicationCheck(a, b);
  check('C6: identical corpora replicate (rowsMatch true)', r1.rowsMatch === true, JSON.stringify(r1.perSeed));
  const r2 = AN.replicationCheck(a, c);
  check('C6: a moved dawn breaks replication (rowsMatch false)', r2.rowsMatch === false);
})();

// ---------- 2. Recorder: live in-memory run (shape) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete process.env.VETREENGAGE;
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'poolshape-driver-20261117.js'))];
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117.js'))];
  const poolshape = require(path.join(REPO, 'scripts', 'poolshape-driver-20261117.js'));
  const driver = require(path.join(REPO, 'scripts', 'launchfunnel-driver-20261117.js'));
  check('live driver sees SEEDLAND hard-on (reused hook)', driver.SEEDLAND === true);
  check('poolshape wrapper maps MODE vre -> underlying vre', poolshape.LEG === 'vre');
  const out = await driver.oneRun(103411);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries v4 + dawnbid + pool + skip arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) &&
    Array.isArray(out.v4encounters) && Array.isArray(out.dawnbidScores) &&
    Array.isArray(out.companionPool) && Array.isArray(out.launchdefSkips));
  check('live run policy sha is the frozen competent verbatim (df9b7dff4de4)',
    out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  const badPool = (out.companionPool || []).find(function (r) { return !Array.isArray(r.members) || r.members.length !== r.rosterN; });
  check('every pool row carries a members array of length rosterN', !badPool, badPool ? JSON.stringify(badPool).slice(0, 300) : '');
  console.log('  info: live 5d run recorded ' + (out.companionPool || []).length + ' pool rows, ' +
    (out.dawnbidScores || []).length + ' dawnbid scores');
  return out;
}

// ---------- 3. Determinism legs D1/D2/D2b (60d, seed 103411) ----------
console.log('== determinism legs D1/D2/D2b ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), MODE: 'vre', VETREENGAGE: '1' }, envExtra || {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "require('./scripts/poolshape-driver-20261117.js');" +
    "const d=require('./scripts/launchfunnel-driver-20261117.js');" +
    "d.oneRun(103411).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, recorder ON twice, VETREENGAGE=1 (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { LAUNCHFUNNEL_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, VETREENGAGE=1 (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty recorder arrays (v4/dawnbid/pool/skips)',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4encounters || []).length === 0 && (off.full.launchdefSkips || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  // D2b: master default, recorder ON vs OFF (the off vs rec0 contrast).
  const envNoVre = Object.assign({}, process.env, { DAYS: '60', MODE: 'off' });
  delete envNoVre.VETREENGAGE;
  const script2 = "require('./scripts/poolshape-driver-20261117.js');" +
    "const d=require('./scripts/launchfunnel-driver-20261117.js');" +
    "d.oneRun(103411).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const run2 = function (extra) {
    const env = Object.assign({}, envNoVre, extra || {});
    for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
    const out = execFileSync('node', ['-e', script2], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(out.trim());
  };
  const c = run2({});
  const d0 = run2({ LAUNCHFUNNEL_RECORDER: 'off' });
  check('D2b wrap neutrality: identical trajectories, recorder ON vs OFF, master default (60d)',
    JSON.stringify(c.fp) === JSON.stringify(d0.fp));
  check('D2b recorder-off master run has 0 instrument errors', (d0.full.instrumentErrors || []).length === 0);
  console.log('  info: D1 60d run recorded ' + (a.full.v4encounters || []).length + ' encounters, ' +
    (a.full.companionPool || []).length + ' pool rows');
}

// ---------- 4. src/ untouched ----------
console.log('== src untouched ==');
(function () {
  let names = '';
  try { names = execSync('git status --porcelain -- src/', { cwd: REPO }).toString().trim(); } catch (e) { names = 'git-error'; }
  check('src/ tree is clean (recorder-only arm)', names === '', names.slice(0, 200));
})();

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
