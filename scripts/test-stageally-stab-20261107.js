// test-stageally-stab-20261107.js — proof for the staged-trajectory
// stability instrument, driver, analyzer, and bisection variants (arm
// sim-stageally-stab-b). Fixture tests (draw counter, hook attribution,
// variant shapes, CLASS/D-metric reuse, analyzer on a fake corpus) +
// live determinism legs (driver subprocesses into /tmp, never into
// evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-stageally-stab-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const STAB = require(path.join(REPO, 'scripts', 'stab-instrument-20261107'));
const TRAJ = require(path.join(REPO, 'scripts', 'trajfrag-instrument-20261107'));
const TRAJDIST = require(path.join(REPO, 'scripts', 'stageally-trajdist-20261107'));
const ANALYZE = require(path.join(REPO, 'scripts', 'stab-analyze-20261107'));
const { mulberry32 } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const NORALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-norally-b'));
const NOINVITES = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-noinvites-b'));
const NOPENDING = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-nopending-b'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- unit: draw counter delegates values in order ----------
(function () {
  const native = Math.random;
  const a = mulberry32(53006);
  Math.random = mulberry32(53006);
  const st = STAB.installDrawCounter(10);
  let agree = true;
  for (let i = 0; i < 50; i++) { if (Math.random() !== a()) agree = false; }
  check('counter-delegates-in-order', agree && st.total === 50, 'total=' + st.total);
  check('counter-samples', st.sampled === 5, 'sampled=' + st.sampled);
  check('counter-samples-have-buckets', Object.keys(st.samples).length >= 1, JSON.stringify(st.samples));
  st.uninstall();
  // Uninstall must restore the exact function object installed before.
  const before = Math.random;
  const st2 = STAB.installDrawCounter(100);
  st2.uninstall();
  check('counter-uninstall-exact', Math.random === before);
  Math.random = native;
})();

// ---------- unit: hook attribution ----------
(function () {
  const native = Math.random;
  Math.random = mulberry32(7);
  const st = STAB.installDrawCounter(1000000);
  STAB.hookDelta(st, 'dailyStage', function () { Math.random(); Math.random(); Math.random(); });
  STAB.hookDelta(st, 'dailyBase', function () { Math.random(); });
  check('hookdelta-attributes', st.hooks.dailyStage === 3 && st.hooks.dailyBase === 1 && st.total === 4,
    JSON.stringify(st.hooks));
  check('hookdelta-total', STAB.hookDrawsTotal(st) === 4);
  check('hookdelta-calls', st.hookCalls.dailyStage === 1 && st.hookCalls.dailyBase === 1);
  st.uninstall();
  Math.random = native;
})();

// ---------- unit: variant shapes ----------
(function () {
  check('norally-fight-is-base', NORALLY.policy.fight === competent.fight,
    'norally fight must be the base competent fight (rally removed)');
  check('noinvites-fight-is-rally', NOINVITES.policy.fight === RALLY.rallyPolicy.fight,
    'noinvites fight must be the rally fight (rally kept)');
  check('nopending-pending-false', NOPENDING.policy.pending(null, {}) === false);
  check('nopending-keeps-rally-fight', NOPENDING.policy.fight === RALLY.rallyPolicy.fight);
  check('norally-keeps-staging-daily', typeof NORALLY.policy.daily === 'function');
  check('staged-exports-stageparty', typeof STAGED.stageParty === 'function');
  check('staged-exports-pending', typeof STAGED.stagedPolicy.pending === 'function');
  // Driver-split equivalence, pinned to source: the staged policy's
  // daily body must be exactly competent.daily then stageParty, in
  // that order — the driver replicates that sequence so the two parts
  // can be bracketed separately.
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a.js'), 'utf8');
  const block = src.slice(src.indexOf('const stagedPolicy'));
  const dailyIdx = block.indexOf('daily(Game, ctx)');
  const baseIdx = block.indexOf('competent.daily(Game, ctx)', dailyIdx);
  const stageIdx = block.indexOf('stageParty(Game, ctx)', dailyIdx);
  check('staged-daily-split-shape', dailyIdx >= 0 && baseIdx > dailyIdx && stageIdx > baseIdx,
    'dailyIdx=' + dailyIdx + ' baseIdx=' + baseIdx + ' stageIdx=' + stageIdx);
  const norallySrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-stageally-norally-b.js'), 'utf8');
  check('norally-daily-calls-stageparty', norallySrc.indexOf('STAGED.stageParty(Game, ctx)') >= 0);
  const noinvSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-stageally-noinvites-b.js'), 'utf8');
  // Match the CALL form stageParty( — the file's header comment names
  // the function in prose ("no stageParty call"), which is not a call.
  check('noinvites-daily-no-stageparty', noinvSrc.indexOf('stageParty(') < 0,
    'noinvites must never call stageParty');
  check('noinvites-daily-calls-base', noinvSrc.indexOf('competent.daily(Game, ctx)') >= 0);
})();

// ---------- unit: CLASS + D metric reuse ----------
(function () {
  function fakeRun(o) {
    return {
      endReason: o.endReason || 'village-lost', won: !!o.won,
      days: o.days || 100, standing: o.standing || 100, maxWave: o.maxWave || 4,
      unlockedWave: o.unlockedWave || 4,
      waveKillLog: o.kills || [],
      daily: (o.vets != null) ? [{ day: 1, readiness5: { veterans: o.vets } }] : [],
      readiness5: { veterans: o.vets != null ? o.vets : 0 },
    };
  }
  const d = TRAJ.classDiff(
    fakeRun({ endReason: 'survived', kills: [{ d: 52, mid: 'x', w: 4 }], vets: 2 }),
    fakeRun({ endReason: 'village-lost', kills: [], vets: 0 }));
  check('classdiff-reuse', d.fragile === true && d.diffs.length === 3, JSON.stringify(d.diffs));
  const dist = TRAJDIST.distance(
    fakeRun({ endReason: 'survived', kills: [{ d: 52, mid: 'x', w: 4 }], vets: 2, standing: 440, days: 150, maxWave: 5 }),
    fakeRun({ endReason: 'village-lost', kills: [], vets: 0, standing: 195, days: 73, maxWave: 4 }));
  // kills 1, standing 2.45, wave 1, days 0.513, pair 1 => 5.963
  check('trajdist-reuse', Math.abs(dist.composite - 5.963) < 0.001, 'composite=' + dist.composite);
})();

// ---------- unit: analyzer on a fake corpus ----------
(function () {
  const dir = '/tmp/stab-proof-fakecorpus';
  fs.mkdirSync(dir, { recursive: true });
  fs.readdirSync(dir).forEach(function (f) { fs.unlinkSync(path.join(dir, f)); });
  function fakeRow(policy, perturbed, o) {
    return {
      seed: 53006, arm: 'stageally-stab', run: 'stab-' + policy + (perturbed ? '-perturbed' : '-unperturbed'),
      policy: policy, anchorCommit: 'proof', perturbed: perturbed, displacedValue: perturbed ? 0.5 : null,
      days: o.days, endReason: o.endReason, won: false, villageLost: o.endReason !== 'survived',
      scaleRank: 'village', maxWave: o.maxWave, unlockedWave: o.maxWave, standing: o.standing,
      readiness5: { veterans: o.vets },
      daily: [{ day: 1, readiness5: { veterans: o.vets } }],
      waveKillLog: o.kills || [], instrumentErrors: [],
      rngDraws: { total: 1000, setup: 100, hooks: { dailyBase: 500, dailyStage: 100, fight: 200, rallyVerb: 10, pending: 0 },
        hookCalls: {}, engine: 100, sampled: 10, sampleEvery: 100, samples: { 'game.js': 10 }, perDay: [{ day: 1, totalDraws: 1000, hookDraws: 800 }] },
      stageallyStats: { invites: 5, accepted: 3 }, bankkillerStats: { rallyFires: 2 },
    };
  }
  const rows = [
    fakeRow('staged', false, { days: 150, endReason: 'survived', standing: 440, maxWave: 5, vets: 2, kills: [{ d: 52, mid: 'x', w: 4 }] }),
    fakeRow('staged', true, { days: 73, endReason: 'village-lost', standing: 195, maxWave: 4, vets: 0, kills: [] }),
    fakeRow('baseline', false, { days: 125, endReason: 'village-lost', standing: 199, maxWave: 4, vets: 0, kills: [{ d: 60, mid: 'y', w: 4 }] }),
    fakeRow('baseline', true, { days: 125, endReason: 'village-lost', standing: 199, maxWave: 4, vets: 0, kills: [{ d: 60, mid: 'y', w: 4 }] }),
  ];
  rows.forEach(function (r, i) { fs.writeFileSync(path.join(dir, 'stab-s53006-' + r.run + '.json'), JSON.stringify(r)); });
  const res = ANALYZE.analyze(dir);
  check('analyzer-staged-flip', res.perPolicy.staged.flips === 1 && res.perPolicy.staged.n === 1,
    JSON.stringify(res.perPolicy.staged));
  check('analyzer-baseline-stable', res.perPolicy.baseline.flips === 0,
    JSON.stringify(res.perPolicy.baseline));
  check('analyzer-gap-fields', res.gap.stagedFlips === 1 && res.gap.baselineFlips === 0 && res.gap.gapSeeds === 1);
  check('analyzer-gap-bar-false-on-n1', res.gap.bar1 === false, 'bar1 needs >=3 staged flips');
  check('analyzer-census', res.census['staged-unperturbed'] && res.census['staged-unperturbed'].meanTotalDraws === 1000);
  check('analyzer-walls', res.walls['staged-unperturbed'].wave5unlock === 1 && res.walls['staged-perturbed'].wave5unlock === 0);
})();

// ---------- live: driver legs into /tmp ----------
function runDriver(env, label) {
  const res = spawnSync('node', [path.join(REPO, 'scripts', 'stab-driver-20261107.js')], {
    cwd: REPO, env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 600000,
  });
  if (res.status !== 0) {
    console.log('--- driver ' + label + ' stdout tail ---');
    console.log(String(res.stdout || '').split('\n').slice(-8).join('\n'));
    console.log('--- driver ' + label + ' stderr tail ---');
    console.log(String(res.stderr || '').split('\n').slice(-8).join('\n'));
  }
  return res;
}
function readLeg(outdir, seed, run) {
  return JSON.parse(fs.readFileSync(path.join(outdir, 'stab-s' + seed + '-' + run + '.json'), 'utf8'));
}
function w4kills(row) { return ((row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length; }
function endVets(row) {
  const daily = row.daily || [];
  const last = daily[daily.length - 1] || {};
  return (last.readiness5 && last.readiness5.veterans != null) ? (last.readiness5.veterans | 0) : null;
}

(function () {
  const outdir = '/tmp/stab-proof-legs';
  fs.mkdirSync(outdir, { recursive: true });
  // Clean slate for the proof legs (refuse-overwrite guard needs it).
  fs.readdirSync(outdir).forEach(function (f) { fs.unlinkSync(path.join(outdir, f)); });

  // 53006 staged unperturbed must reproduce the CURRENT master's
  // trajectory deterministically: 150d survived, standing 415, 8 wave-4+
  // kills, maxWave 5, 2 end vets. RE-PINNED 2026-11-07 (closeout): the
  // confirm2 corpus pinned 440 / 11 kills on master b690777cc, but the
  // vetkilltale fireside tale (ad665d5e5, landed between b690777cc and
  // f043aa772) shifts this leg to 415 / 8 — verified by re-running the
  // same leg with VETKILLTALE_OFF=1 on f043aa772, which reproduces the
  // old 440 / 11 exactly, so the shift is the game change, not the
  // instrument. This ALSO proves the counting wrapper + the driver's
  // split daily do not change the trajectory (confirm2 used
  // policy.daily directly).
  let r = runDriver({ SEEDS: '53006', DAYS: '150', RUN: 'stab-staged-unperturbed', POLICY: 'staged', OUTDIR: outdir }, 'staged-unperturbed-53006');
  check('live-staged-unperturbed-runs', r.status === 0, 'exit=' + r.status);
  if (r.status === 0) {
    const row = readLeg(outdir, 53006, 'stab-staged-unperturbed');
    check('live-staged-53006-matches-current-master', row.days === 150 && row.endReason === 'survived' && row.standing === 415 && w4kills(row) === 8 && row.maxWave === 5 && endVets(row) === 2,
      JSON.stringify({ days: row.days, endReason: row.endReason, standing: row.standing, w4kills: w4kills(row), maxWave: row.maxWave, endVets: endVets(row) }));
    check('live-counter-counts', (row.rngDraws || {}).total > 0, 'total=' + ((row.rngDraws || {}).total || 0));
    check('live-samples-attribute-to-game', (function () {
      const s = (row.rngDraws || {}).samples || {};
      const gameKeys = Object.keys(s).filter(function (k) { return /\.js$/.test(k); });
      const driverShare = (s.driver || 0) / Math.max(1, (row.rngDraws || {}).sampled || 1);
      return gameKeys.length >= 1 && driverShare < 0.5;
    })(), 'samples=' + JSON.stringify((row.rngDraws || {}).samples || {}).slice(0, 300));
    check('live-dailystage-draws', ((row.rngDraws || {}).hooks || {}).dailyStage > 0,
      'dailyStage=' + (((row.rngDraws || {}).hooks || {}).dailyStage || 0));
    check('live-pending-draws-zero', ((row.rngDraws || {}).hooks || {}).pending === 0,
      'pending=' + (((row.rngDraws || {}).hooks || {}).pending || 0));
    check('live-no-instrument-errors', (row.instrumentErrors || []).length === 0, JSON.stringify(row.instrumentErrors || []));
  }

  // 53006 staged perturbed must reproduce the trajfrag perturbed leg:
  // 73d lost, standing 195, 1 wave-4 kill, maxWave 4, 0 end vets.
  r = runDriver({ SEEDS: '53006', DAYS: '150', RUN: 'stab-staged-perturbed', POLICY: 'staged', PERTURB: '1', OUTDIR: outdir }, 'staged-perturbed-53006');
  check('live-staged-perturbed-runs', r.status === 0, 'exit=' + r.status);
  if (r.status === 0) {
    const row = readLeg(outdir, 53006, 'stab-staged-perturbed');
    check('live-staged-perturbed-53006-matches-trajfrag', row.days === 73 && row.endReason === 'village-lost' && row.standing === 195 && w4kills(row) === 1 && row.maxWave === 4 && endVets(row) === 0,
      JSON.stringify({ days: row.days, endReason: row.endReason, standing: row.standing, w4kills: w4kills(row), maxWave: row.maxWave, endVets: endVets(row) }));
    check('live-displaced-value-recorded', typeof row.displacedValue === 'number' && row.displacedValue >= 0 && row.displacedValue < 1,
      'displacedValue=' + row.displacedValue);
  }

  // Variant smoke: norally fires no rally but still invites; noinvites
  // invites never (rally may still fire).
  r = runDriver({ SEEDS: '53006', DAYS: '150', RUN: 'stab-norally-unperturbed', POLICY: 'norally', OUTDIR: outdir }, 'norally-53006');
  check('live-norally-runs', r.status === 0, 'exit=' + r.status);
  if (r.status === 0) {
    const row = readLeg(outdir, 53006, 'stab-norally-unperturbed');
    check('live-norally-no-rally', (row.bankkillerStats || {}).rallyFires === 0,
      'rallyFires=' + ((row.bankkillerStats || {}).rallyFires || 0));
    check('live-norally-still-invites', (row.stageallyStats || {}).invites > 0,
      'invites=' + ((row.stageallyStats || {}).invites || 0));
  }
  r = runDriver({ SEEDS: '53006', DAYS: '150', RUN: 'stab-noinvites-unperturbed', POLICY: 'noinvites', OUTDIR: outdir }, 'noinvites-53006');
  check('live-noinvites-runs', r.status === 0, 'exit=' + r.status);
  if (r.status === 0) {
    const row = readLeg(outdir, 53006, 'stab-noinvites-unperturbed');
    check('live-noinvites-zero-invites', (row.stageallyStats || {}).invites === 0,
      'invites=' + ((row.stageallyStats || {}).invites || 0));
  }

  // Overwrite refusal: re-running an existing leg must exit non-zero
  // without touching the file (cheap 5-day leg on a fresh seed file).
  r = runDriver({ SEEDS: '53001', DAYS: '5', RUN: 'stab-staged-unperturbed', POLICY: 'staged', OUTDIR: outdir }, 'overwrite-first');
  check('live-overwrite-first-runs', r.status === 0, 'exit=' + r.status);
  r = runDriver({ SEEDS: '53001', DAYS: '5', RUN: 'stab-staged-unperturbed', POLICY: 'staged', OUTDIR: outdir }, 'overwrite-second');
  check('live-overwrite-refused', r.status !== 0, 'exit=' + r.status);
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exitCode = fail ? 1 : 0;
