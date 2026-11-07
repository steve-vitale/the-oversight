// test-trajfrag-20261107.js — proof for the trajectory-fragility
// instrument, driver, and analyzer (arm sim-trajfrag-b). Fixture tests
// (displacement shifts the seeded stream; CLASS taxonomy; first-
// divergence naming) + live determinism legs (driver subprocesses into
// /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-trajfrag-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const TRAJ = require(path.join(REPO, 'scripts', 'trajfrag-instrument-20261107'));
const { mulberry32 } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- unit: displacement shifts the seeded stream ----------
(function () {
  // The displacement is ONE EXTRA draw in the perturbed stream: at any
  // later point the perturbed stream is one draw ahead of the
  // unperturbed stream. Compare draw #1 of the plain stream against
  // draw #2 of the displaced stream — they must differ.
  const a = mulberry32(53004), b = mulberry32(53004);
  const displaced = b(); // the +1 draw
  check('displace-draw-consumed', typeof displaced === 'number' && displaced >= 0 && displaced < 1, 'value=' + displaced);
  check('displace-shifts-stream', a() !== b(), 'plain-draw1 vs displaced-draw2 were equal');
  // Ten draws on: plain draws #2..#11 vs displaced draws #3..#12 — the
  // streams stay offset (a 32-bit-state collision would be ~2^-32 each).
  let same = 0;
  for (let i = 0; i < 10; i++) { if (a() === b()) same++; }
  check('displace-stays-offset', same === 0, same + ' coincidences in 10 draws');
  // Same seed, no displacement: streams agree draw for draw.
  const c = mulberry32(53004), d = mulberry32(53004);
  let agree = true;
  for (let i = 0; i < 20; i++) { if (c() !== d()) agree = false; }
  check('same-seed-streams-agree', agree);
})();

// ---------- unit: CLASS taxonomy ----------
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
(function () {
  const survived = fakeRun({ endReason: 'survived', kills: [{ d: 78, mid: 'eulogy', w: 4 }], vets: 1 });
  const lost = fakeRun({ endReason: 'village-lost', kills: [], vets: 0 });
  const c1 = TRAJ.classify(survived);
  check('classify-survived', c1.survived === true && c1.w4kills === true && c1.veterans === true && c1.w4killCount === 1 && c1.endVeterans === 1);
  const c2 = TRAJ.classify(lost);
  check('classify-lost', c2.survived === false && c2.w4kills === false && c2.veterans === false);
  // Wave-3 kills do not count as wave-4 kills.
  const w3only = fakeRun({ kills: [{ d: 20, mid: 'deer', w: 3 }], vets: 0 });
  check('classify-w3-not-w4', TRAJ.classify(w3only).w4kills === false && TRAJ.classify(w3only).w4killCount === 0);
  // Won counts as survived.
  const won = fakeRun({ endReason: 'survived', won: true, kills: [], vets: 0 });
  check('classify-won-survived', TRAJ.classify(won).survived === true);
  // classDiff: one component at a time.
  check('classdiff-survival-only', (function () {
    const d = TRAJ.classDiff(fakeRun({ endReason: 'survived' }), fakeRun({ endReason: 'village-lost' }));
    return d.fragile === true && d.diffs.length === 1 && d.diffs[0] === 'survived';
  })());
  check('classdiff-kills-only', (function () {
    const d = TRAJ.classDiff(fakeRun({ kills: [{ d: 78, mid: 'eulogy', w: 4 }] }), fakeRun({ kills: [] }));
    return d.fragile === true && d.diffs.length === 1 && d.diffs[0] === 'w4kills';
  })());
  check('classdiff-veterans-only', (function () {
    const d = TRAJ.classDiff(fakeRun({ vets: 1 }), fakeRun({ vets: 0 }));
    return d.fragile === true && d.diffs.length === 1 && d.diffs[0] === 'veterans';
  })());
  check('classdiff-identical-stable', (function () {
    const d = TRAJ.classDiff(fakeRun({ endReason: 'survived', kills: [{ d: 78, mid: 'eulogy', w: 4 }], vets: 1 }),
      fakeRun({ endReason: 'survived', kills: [{ d: 78, mid: 'eulogy', w: 4 }], vets: 1 }));
    return d.fragile === false && d.diffs.length === 0;
  })());
})();

// ---------- unit: first divergence ----------
(function () {
  function daily(days, over) {
    const rows = [];
    for (let d = 1; d <= days; d++) {
      rows.push(Object.assign({ day: d, scholarId: 's1', living: 10, raw: 100, gated: 100, w4kills: 0, w4killers: 0, partySize: 1, scholarAtHaven: true, readiness5: { veterans: 0 } }, (over && over[d]) || {}));
    }
    return rows;
  }
  const base = { daily: daily(10), waveKillLog: [{ d: 8, mid: 'eulogy', w: 4 }], scholarDeaths: [{ day: 9, scholarId: 's1', causeArg: 'the wild' }] };
  // Scholar changes first (day 5), before any kill/death diff.
  const scholarFlip = { daily: daily(10, { 5: { scholarId: 's2' }, 6: { scholarId: 's2' }, 7: { scholarId: 's2' }, 8: { scholarId: 's2' }, 9: { scholarId: 's2' }, 10: { scholarId: 's2' } }), waveKillLog: [{ d: 8, mid: 'eulogy', w: 4 }], scholarDeaths: [{ day: 9, scholarId: 's1', causeArg: 'the wild' }] };
  const div1 = TRAJ.firstDivergence(base, scholarFlip);
  check('firstdiv-scholar-change', div1.first && div1.first.kind === 'daily-row' && div1.first.day === 5 && div1.first.field === 'scholarId', JSON.stringify(div1.first));
  // Kill day moves (8 -> 9); daily rows identical: the kill ledger names it.
  const killFlip = { daily: daily(10), waveKillLog: [{ d: 9, mid: 'eulogy', w: 4 }], scholarDeaths: [{ day: 9, scholarId: 's1', causeArg: 'the wild' }] };
  const div2 = TRAJ.firstDivergence(base, killFlip);
  check('firstdiv-kill-day', div2.first && div2.first.kind === 'kill-ledger' && div2.first.day === 8, JSON.stringify(div2.first));
  // Death cause changes; daily + kills identical: the death ledger names it.
  const deathFlip = { daily: daily(10), waveKillLog: [{ d: 8, mid: 'eulogy', w: 4 }], scholarDeaths: [{ day: 9, scholarId: 's1', causeArg: 'a stranger' }] };
  const div3 = TRAJ.firstDivergence(base, deathFlip);
  check('firstdiv-death-cause', div3.first && div3.first.kind === 'scholar-deaths' && div3.first.day === 9, JSON.stringify(div3.first));
  // Identical legs: every channel null.
  const div4 = TRAJ.firstDivergence(base, JSON.parse(JSON.stringify(base)));
  check('firstdiv-identical-null', div4.first == null && div4.daily == null && div4.kills == null && div4.deaths == null);
  // Veterans flip on the daily row is named by field.
  const vetFlip = { daily: daily(10, { 7: { readiness5: { veterans: 1 } }, 8: { readiness5: { veterans: 1 } }, 9: { readiness5: { veterans: 1 } }, 10: { readiness5: { veterans: 1 } } }), waveKillLog: [{ d: 8, mid: 'eulogy', w: 4 }], scholarDeaths: [{ day: 9, scholarId: 's1', causeArg: 'the wild' }] };
  const div5 = TRAJ.firstDivergence(base, vetFlip);
  check('firstdiv-veterans-field', div5.first && div5.first.day === 7 && div5.first.field === 'readiness5.veterans', JSON.stringify(div5.first));
})();

// ---------- live legs (unjudged Stage-0 verification, /tmp only) ----------
async function liveLegs() {
  const tmp = fs.mkdtempSync(path.join('/tmp', 'trajfrag-proof-'));
  function runLeg(sub, run, extraEnv) {
    const dir = path.join(tmp, sub);
    fs.mkdirSync(dir, { recursive: true });
    execSync('node scripts/trajfrag-driver-20261107.js', {
      cwd: REPO,
      env: Object.assign({}, process.env, { REPO: REPO, OUTDIR: dir, DAYS: '30', SEEDS: '53004', RUN: run }, extraEnv || {}),
      stdio: 'pipe', timeout: 600000,
    });
    return { dir: dir, file: path.join(dir, 'trajfrag-s53004-' + run + '.json') };
  }
  const t0 = Date.now();
  const leg1 = runLeg('u1', 'trajfrag-unperturbed', {});
  const leg2 = runLeg('u2', 'trajfrag-unperturbed', {});
  const leg3 = runLeg('p1', 'trajfrag-perturbed', { PERTURB: '1' });
  const j1 = JSON.parse(fs.readFileSync(leg1.file, 'utf8'));
  const j2 = JSON.parse(fs.readFileSync(leg2.file, 'utf8'));
  const j3 = JSON.parse(fs.readFileSync(leg3.file, 'utf8'));
  check('live-unperturbed-deterministic', fs.readFileSync(leg1.file, 'utf8') === fs.readFileSync(leg2.file, 'utf8'),
    'days ' + j1.days + ' vs ' + j2.days);
  check('live-unperturbed-headlines', j1.days === j2.days && j1.endReason === j2.endReason &&
    JSON.stringify(j1.waveKillLog) === JSON.stringify(j2.waveKillLog) && j1.daily.length === j2.daily.length);
  check('live-unperturbed-no-displacement', j1.displacedValue === null && j1.perturbed === false);
  check('live-unperturbed-no-errors', (j1.instrumentErrors || []).length === 0, JSON.stringify(j1.instrumentErrors));
  check('live-perturbed-records-draw', j3.perturbed === true && typeof j3.displacedValue === 'number' &&
    j3.displacedValue >= 0 && j3.displacedValue < 1, 'displacedValue=' + j3.displacedValue);
  check('live-perturbed-no-errors', (j3.instrumentErrors || []).length === 0, JSON.stringify(j3.instrumentErrors));
  check('live-perturbed-valid-run', j3.days > 0 && (j3.daily || []).length > 0 && j3.endReason != null);
  // Analyzer smoke on the 30d pair (leg1 + leg3 side by side).
  const anDir = path.join(tmp, 'an');
  fs.mkdirSync(anDir, { recursive: true });
  fs.copyFileSync(leg1.file, path.join(anDir, 'trajfrag-s53004-trajfrag-unperturbed.json'));
  fs.copyFileSync(leg3.file, path.join(anDir, 'trajfrag-s53004-trajfrag-perturbed.json'));
  const anOut = execSync('node scripts/trajfrag-analyze-20261107.js --corpus ' + anDir, { cwd: REPO, stdio: 'pipe', timeout: 60000 }).toString();
  const an = JSON.parse(anOut);
  check('analyzer-smoke-seed', an.seeds.length === 1 && an.seeds[0].seed === 53004 && typeof an.seeds[0].fragile === 'boolean');
  check('analyzer-smoke-fliprate', an.total === 1 && (an.flipRate === 0 || an.flipRate === 1));
  check('analyzer-smoke-wall', an.wall && an.wall.unperturbed && an.wall.perturbed && typeof an.wall.unperturbed.medianSurvival === 'number');
  console.log('live legs took ' + ((Date.now() - t0) / 1000).toFixed(1) + 's in ' + tmp);
  console.log('TESTS ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
