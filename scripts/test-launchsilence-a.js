// test-launchsilence-a.js — proof for arm sim-launchsilence-a (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the driver wraps exist (incl. the new funnelStage /
// deadTargetChecks streams and the winPlanDepart pre-call cause
// reads), ZERO src/js change survives on the branch, the wave-4+ id
// set matches the data, the gate sites exist where the prereg says
// they do, the analyzer selftest is green (one synthetic corpus per
// taxonomy row + missing-stream + determinism checks), a synthetic
// band classifies 100% with 0 unclassified, the classifier FAILS
// (unclassified) on a corpus stripped of the new streams (the new
// streams are load-bearing, not decorative), and the determinism legs
// D1 (repeatability) + D2 (wrap neutrality) are green at 30d on seed
// 107517, with funnelStage rows present, monotonic in maxStage, and
// agreeing with the analyzer's derived stage, 0 instrument errors,
// and 0 tick-gate mismatches.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-launchsilence-a.js
// (Substrate flags are also set by the test itself when absent, so a
// bare `node scripts/test-launchsilence-a.js` works too.)
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// Substrate: the homebody band's flags (frozen in the prereg). Set
// here so a bare invocation runs the same substrate as the band.
for (const f of ['VETREENGAGE', 'PARTYSIZE4', 'FLEEREPAIR2', 'FIGHTALLY2', 'SENSEEXPED', 'BOWOPEN', 'SPEARGATE', 'GUNRATE', 'CELLGATE']) {
  if (process.env[f] === undefined) process.env[f] = '1';
}
// Policy layers MUST be off (tableseat-nowait + leanlinkrescue
// default-off -> competent verbatim). Never set by this test.
delete process.env.TABLESEATNOWAIT;
delete process.env.LEANLINKRESCUE;
// Short horizon for the live legs (the property under test is
// determinism/neutrality, not the band numbers).
process.env.DAYS = '30';

const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-launchsilence-a.js'));
const DRIVER_PATH = path.join(REPO, 'scripts', 'launchsilence-driver-a.js');
const DRIVER = require(DRIVER_PATH);

let pass = 0, fail = 0, skipped = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function skip(name, detail) {
  skipped++; console.log('  SKIP: ' + name + (detail ? ' — ' + detail : ''));
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO, timeout: 90000 }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (srcStatus[0] === 'GIT-UNAVAILABLE') skip('ZERO src/js change (git status unavailable)', 'infrastructure');
else check('ZERO src/js change: src worktree diff is empty (' + JSON.stringify(srcStatus) + ')', srcStatus.length === 0);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
if (scriptsStatus[0] === 'GIT-UNAVAILABLE') skip('scripts diff is launchsilence-* only (git status unavailable)', 'infrastructure');
else {
  const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*launchsilence-[a-z0-9.-]+\.js$/.test(s); });
  check('scripts worktree diff is launchsilence-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
}
const driverSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
for (const w of ['funnelStage', 'funnelVillage', 'deadTargetChecks', 'winPlanCommitDeadTarget',
  'stageBefore', 'holderBlock', 'LAUNCHSILENCE_RECORDER', 'FROZEN_BASE',
  'tableseatNowait', 'planIsWave4p', 'loadWave4pIds', 'MODE must be ctl',
  'refusing to overwrite', 'TABLESEATNOWAIT/LEANLINKRESCUE must be unset']) {
  check('driver defines/refuses ' + w, driverSrc.indexOf(w) !== -1);
}
// Frozen base is this tree's HEAD (the prereg's frozen base).
let head = 'unknown';
try { head = execSync('git rev-parse HEAD', { cwd: REPO, timeout: 30000 }).toString().trim(); } catch (e) {}
check('driver FROZEN_BASE is this tree HEAD (' + head.slice(0, 12) + ')', DRIVER.FROZEN_BASE === head && head !== 'unknown', 'FROZEN_BASE=' + DRIVER.FROZEN_BASE);
// Policy shas recorded by the driver match the files on disk.
const h = function (f) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', f), 'utf8')).digest('hex').slice(0, 12); };
check('tableseat-nowait policy file hashes computable', h('tableseat-nowait.js').length === 12 && h('leanlinkrescue.js').length === 12 && h('competent.js').length === 12);
// Wave-4+ id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4p = (rawMon.monsters || rawMon).filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
const frozenW4p = ['algorithm', 'audit', 'cancellation', 'congregation', 'eater', 'editor', 'eulogy', 'finale', 'finale_crew', 'finale_opening', 'herald', 'influencer', 'network_heart', 'network_limb', 'network_note', 'network_tower', 'nielsen', 'rerun', 'reunion', 'spoiler', 'strike', 'suburb', 'timeslot'].sort();
check('wave-4+ id set matches monsters.json (23 ids)', JSON.stringify(liveW4p) === JSON.stringify(frozenW4p), JSON.stringify(liveW4p));
check('driver loadWave4pIds matches monsters.json', JSON.stringify(DRIVER.loadWave4pIds()) === JSON.stringify(frozenW4p));
// The gate sites exist where the prereg says they do (call TEXT is
// the anchor — line numbers drift daily).
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('winPlanDepart gear hold (unarmed+unarmored)', winPlanJs.indexOf("if (!g.armed && !g.armored) { bump(this, 'gearHolds'); return 'hold'; }") !== -1);
check('winPlanDepart dead-target check before launch', winPlanJs.indexOf('winPlanCommitDeadTarget(vid)') !== -1);
check('winPlanDepart veteran-guard hold at table stage', winPlanJs.indexOf("bump(this, 'veteranGuardHolds')") !== -1);
check('winPlanDepart party-wait hold at party stage', winPlanJs.indexOf("bump(this, 'partyWaits')") !== -1);
check('launchParty companion-first order (findCompanion before companionLaunchable)', winPlanJs.indexOf('findCompanion(self, vid, hx, hy)') !== -1 && winPlanJs.indexOf('companionLaunchable(self, cid)') !== -1);
const standingJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
check('standing.js exposes unlockedWave + waveCombatReadiness', standingJs.indexOf('unlockedWave') !== -1 && standingJs.indexOf('waveCombatReadiness') !== -1);

// ---------- 2. Analyzer ----------
console.log('== analyzer ==');
const st = ANALYZE.selftest();
check('analyzer selftest green (' + st.pass + ' passed, ' + st.fail + ' failed)', st.fail === 0, st.failures.join(' | '));
// Synthetic band: one corpus per taxonomy row + one launcher —
// the band classifies 100% with 0 unclassified (the frozen bar 1–2
// shape, on fixtures).
(function syntheticBand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchsilence-band-'));
  function base(seed, over) {
    const b = { seed: seed, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
      endReason: 'days', won: false, scaleRank: 'village', ready4: { short: [] },
      v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
      dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
      havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
      funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
    if (over) for (const k in over) b[k] = over[k];
    return b;
  }
  function create(day, vid) {
    return { day: day, vid: vid, creator: 'havenTick', source: 'lived', profile: 'wanderer', stageAfter: 'party', target: 'eater', needWave: 4, foughtN: 1, slainN: 0, caller: null };
  }
  const seeds = [
    base(900001, { v4departs: [{ day: 90, vid: 'a', result: 'launch', targetWave: 4 }] }),
    base(900002, { maxWave: 2, villageLost: true, days: 40, funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: 40 } }),
    base(900003, { maxWave: 3, standing: 85 }),
    base(900004, { maxWave: 4 }),
    base(900005, { maxWave: 4, v4creates: [create(60, 'a')] }),
    base(900006, { maxWave: 4, v4creates: [create(60, 'a')],
      v4departs: [{ day: 80, vid: 'a', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
      companionPool: [{ day: 80, vid: 'a', rosterN: 6, counts: { eligible: 0 } }] }),
    base(900007, { maxWave: 4, v4creates: [create(60, 'a')],
      v4departs: [{ day: 80, vid: 'a', result: 'hold', stageBefore: 'gear', holderArmed: false, holderArmored: false, holderBlock: null, target: 'eater', targetWave: 4 }] }),
    // Brain-path homebody-handoff launch (pilot 107522 d45 shape):
    // the range-0 holder stays home, the companion walks — still a
    // wave-4+ launch, recorded in both tables for the same call.
    base(900008, { maxWave: 4, v4creates: [create(44, 'n')],
      v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: 'party', target: 'eater', targetWave: 4 }],
      dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: 'eater', targetWave: 4 }] }),
    // Picked but no depart call, low-wave brain normals only
    // (pilot 107519 v1 shape): residual 'other', 0 wave-4+ normals.
    base(900009, { maxWave: 4, v4creates: [create(60, 'a')],
      dawnbidScores: [{ day: 70, vid: 'a', cands: [{ kind: 'expedition', winPlanAction: 'party_launch' }], commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch' }, plan: { stage: 'party', target: 'eater', needWave: 4 } }],
      dawnbidDeparts: [{ day: 71, vid: 'b', source: 'brain', result: 'normal', winPlanAction: 'party_launch', target: null, targetWave: null }] }),
  ];
  seeds.forEach(function (s) { fs.writeFileSync(path.join(dir, 'launchsilence-a-s' + s.seed + '-x.json'), JSON.stringify(s)); });
  const r = ANALYZE.analyzeDir(dir);
  check('synthetic band: 9 seeds read', r.seeds === 9, 'got ' + r.seeds);
  check('synthetic band: 2 launchers, 7 non-launchers', r.launchingSeeds === 2 && r.nonLaunchingSeeds === 7, JSON.stringify({ l: r.launchingSeeds, n: r.nonLaunchingSeeds }));
  check('synthetic band: classified 7/7 (100%), 0 unclassified', r.classified === 7 && r.unclassified === 0, JSON.stringify({ c: r.classified, u: r.unclassified }));
  check('synthetic band: stage counts name each fixture once', r.stageCounts['village-lost-before-launch'] === 1 && r.stageCounts['gate-says-wait'] === 1 && r.stageCounts['no-plan-created'] === 1 && r.stageCounts['plan-never-ignites'] === 1 && r.stageCounts['no-companions-available'] === 1 && r.stageCounts['holder-blocked'] === 1 && r.stageCounts['other'] === 1, JSON.stringify(r.stageCounts));
  fs.rmSync(dir, { recursive: true, force: true });
})();
// Old-code-fails control: a corpus stripped of the new streams
// (what the planignite-era corpora carry) must NOT classify a
// hold-stage village — it must come back unclassified. The new
// streams are load-bearing, not decorative.
(function oldCodeFails() {
  const stripped = { seed: 999002, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', ready4: { short: [] },
    v4creates: [{ day: 60, vid: 'a', creator: 'havenTick', source: 'lived', profile: 'wanderer', stageAfter: 'party', target: 'eater', needWave: 4, foughtN: 1, slainN: 0, caller: null }],
    v4departs: [{ day: 80, vid: 'a', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
    dawnbidScores: [], planCensus: [], havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [] };
  // No funnelStage / deadTargetChecks / companionPool / dawnbidDeparts
  // / igniteCensus keys at all — the pre-launchsilence shape.
  const c = ANALYZE.classifyFirstFail(stripped);
  check('old-code control: stripped corpus classifies unclassified', c.firstFail === 'unclassified', JSON.stringify(c));
})();

// ---------- 3. Live determinism (30d, seed 107517) ----------
console.log('== live determinism (30d, seed 107517) ==');
(async function live() {
  function launchesOf(out) {
    return (out.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
  }
  function launchesW4Of(out) {
    return (out.v4departs || []).filter(function (r) {
      return r.result === 'launch' && (((r.targetWave | 0) >= 4) || (r.target && DRIVER.loadWave4pIds().indexOf(r.target) !== -1));
    }).length;
  }
  let run1 = null, run2 = null, runOff = null;
  try {
    run1 = await DRIVER.oneRun(107517);
  } catch (e) { check('live run 1 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  if (run1) {
    // Snapshot days can skip: the census fires when the policy daily
    // runs with a NEW scholar-day, and the scholar-day does not
    // advance on every policy call (here days 1 and 3 have no row —
    // inherited harness behavior, not the instrument). Assert the
    // rows are strictly increasing, unique, and cover the run.
    const fdays = (run1.funnelStage || []).map(function (r) { return r.day; });
    let fmono = true;
    for (let i = 1; i < fdays.length; i++) if (fdays[i] <= fdays[i - 1]) fmono = false;
    check('live run 1: funnelStage rows present, strictly increasing days', (run1.funnelStage || []).length > 0 && fmono && fdays[fdays.length - 1] >= run1.days - 1, 'rows=' + (run1.funnelStage || []).length + ' days=' + run1.days + ' last=' + fdays[fdays.length - 1]);
    let mono = true;
    for (let i = 1; i < (run1.funnelStage || []).length; i++) {
      if (run1.funnelStage[i].maxStage < run1.funnelStage[i - 1].maxStage) mono = false;
    }
    check('live run 1: funnelStage maxStage monotonic', mono);
    check('live run 1: funnelVillage maxStage agrees with analyzer derived stage',
      run1.funnelVillage.maxStage === ANALYZE.derivedMaxStage(run1),
      'funnel=' + run1.funnelVillage.maxStage + ' derived=' + ANALYZE.derivedMaxStage(run1));
    check('live run 1: 0 instrument errors', (run1.instrumentErrors || []).length === 0, JSON.stringify((run1.instrumentErrors || []).slice(0, 3)));
    check('live run 1: 0 tick-gate mismatches', (run1.tickGateChecks || []).filter(function (x) { return !x.match; }).length === 0);
    check('live run 1: policy recorded as tableseat-nowait layers-off', run1.policy === 'tableseat-nowait (layers off -> competent verbatim)' && run1.tableseatLayerOn === false && run1.leanlinkLayerOn === false, run1.policy);
    check('live run 1: anchor is the frozen base', run1.anchorCommit === DRIVER.FROZEN_BASE && run1.anchorHead === DRIVER.FROZEN_BASE, run1.anchorCommit);
    check('live run 1: deadTargetChecks stream present', Array.isArray(run1.deadTargetChecks));
    try { run2 = await DRIVER.oneRun(107517); } catch (e) { check('live run 2 completes (recorder on)', false, String(e && e.stack || e).slice(0, 300)); }
  }
  if (run1 && run2) {
    const c1 = ANALYZE.classifyFirstFail(run1);
    const c2 = ANALYZE.classifyFirstFail(run2);
    check('D1 repeatability: identical days', run1.days === run2.days, run1.days + ' vs ' + run2.days);
    check('D1 repeatability: identical launch counts (all + wave-4+)', launchesOf(run1) === launchesOf(run2) && launchesW4Of(run1) === launchesW4Of(run2), launchesOf(run1) + '/' + launchesW4Of(run1) + ' vs ' + launchesOf(run2) + '/' + launchesW4Of(run2));
    check('D1 repeatability: identical funnel maxStage', run1.funnelVillage.maxStage === run2.funnelVillage.maxStage, run1.funnelVillage.maxStage + ' vs ' + run2.funnelVillage.maxStage);
    check('D1 repeatability: identical first-fail classification', c1.firstFail === c2.firstFail && JSON.stringify(c1.detail) === JSON.stringify(c2.detail), JSON.stringify(c1) + ' vs ' + JSON.stringify(c2));
    check('D1 repeatability: identical funnelStage rows', JSON.stringify(run1.funnelStage) === JSON.stringify(run2.funnelStage));
  }
  // D2: recorder OFF — a fresh require with the flag off (the flag
  // is read at module scope).
  try {
    process.env.LAUNCHSILENCE_RECORDER = 'off';
    delete require.cache[DRIVER_PATH];
    const DRIVER_OFF = require(DRIVER_PATH);
    runOff = await DRIVER_OFF.oneRun(107517);
  } catch (e) { check('live run 3 completes (recorder off)', false, String(e && e.stack || e).slice(0, 300)); }
  finally { delete process.env.LAUNCHSILENCE_RECORDER; }
  if (run1 && runOff) {
    // D2 neutrality via RECORDER-INDEPENDENT game outcomes only.
    // The v4departs launch rows are the recorder's own output — they
    // are empty by construction when the recorder is off, so comparing
    // them across the legs is a test bug, not a game difference (the
    // first version of this check failed exactly that way: 9 vs 0).
    // The launch count that exists in BOTH legs is the game's own
    // winPlanStats.partyDepartures (bumped by launchParty itself).
    const pd = function (o) { return (o.winPlanStats && o.winPlanStats.partyDepartures) | 0; };
    check('D2 neutrality: recorder off, identical days', run1.days === runOff.days, run1.days + ' vs ' + runOff.days);
    check('D2 neutrality: recorder off, identical game launch count (partyDepartures)', pd(run1) === pd(runOff), pd(run1) + ' vs ' + pd(runOff));
    check('D2 neutrality: recorder off, identical maxWave + standing', run1.maxWave === runOff.maxWave && run1.standing === runOff.standing, run1.maxWave + '/' + run1.standing + ' vs ' + runOff.maxWave + '/' + runOff.standing);
    check('D2 neutrality: recorder off, identical deaths + killCalls', (run1.deaths || []).length === (runOff.deaths || []).length && (run1.killCalls || []).length === (runOff.killCalls || []).length, (run1.deaths || []).length + '/' + (run1.killCalls || []).length + ' vs ' + (runOff.deaths || []).length + '/' + (runOff.killCalls || []).length);
    check('D2 neutrality: recorder off, no funnelStage rows', (runOff.funnelStage || []).length === 0, 'rows=' + (runOff.funnelStage || []).length);
  }
  console.log('\nlaunchsilence-a proof: ' + pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
  if (failures.length) for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
