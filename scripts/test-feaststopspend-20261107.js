// test-feaststopspend-20261107.js — proof for the stop-after-spend
// wrapper (arm sim-feaststopspend-b). Fixture tests for the deedDone
// helper (the engine's own food-deed definition) and the wrapper's
// stats, source-level checks that the policy never calls the shared
// hostFeast verb itself and never reads the kill log, and live legs
// via the driver in /tmp (structural invariants only, per the
// prereg): a neutrality leg (feastdrive vs feaststopspend on one
// seed — daily rows exact through the baseline spend day, i.e. the
// wrapper delegates identically before the deed) and an armed leg
// (0 instrument errors; if a spend day is set, no drive feast /
// donate-down event after it). Exit non-zero on any failure. The
// live legs write nothing into the repo.
// Usage: node scripts/test-feaststopspend-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const REPO = path.join(__dirname, '..');
const FSS = require(path.join(REPO, 'scripts', 'policies', 'competent-feaststopspend-b'));
const ANALYZE = require(path.join(REPO, 'scripts', 'feaststopspend-analyze-20261107'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- deedDone fixtures ----------
(function () {
  const mk = function (prog) { return { state: { scholar: { day: 20, prog: prog } } }; };
  check('deeddone-both-true', FSS.deedDone(mk({ sentimentTaught: true, feastSurgeUsed: true })) === true, 'deed needs both halves');
  check('deeddone-taught-only', FSS.deedDone(mk({ sentimentTaught: true, feastSurgeUsed: false })) === false, 'spend half missing');
  check('deeddone-spent-only', FSS.deedDone(mk({ sentimentTaught: false, feastSurgeUsed: true })) === false, 'taught half missing');
  check('deeddone-neither', FSS.deedDone(mk({})) === false, 'empty prog');
  check('deeddone-no-prog', FSS.deedDone({ state: { scholar: { day: 20 } } }) === false, 'no prog object');
  check('deeddone-no-state', FSS.deedDone({}) === false, 'no state at all');
  check('deeddone-null', FSS.deedDone(null) === false, 'null Game never throws');
  // A poisoned kill log cannot change the deed read (it never reads it).
  const poisoned = mk({ sentimentTaught: true, feastSurgeUsed: true });
  poisoned.state.waveKillLog = [{ by: 'scholar', w: 4, d: 1 }, { by: 'scholar', w: 4, d: 2 }];
  check('deeddone-poisoned-log-inert', FSS.deedDone(poisoned) === true, 'deed reads only scholar prog');
})();

// ---------- wrapper stats fixtures ----------
(function () {
  FSS.resetFeaststopspendStats();
  const s0 = FSS.feaststopspendStats();
  check('stopstats-reset', s0.deedDoneDays === 0 && s0.deedDoneDonateSkips === 0 &&
    s0.deedDoneFeastSkips === 0 && s0.firstDeedDoneDay === null && s0.errors === 0 &&
    Array.isArray(s0.events) && s0.events.length === 0, JSON.stringify(s0));
  // Stats are a copy — mutating the return does not move the module state.
  s0.deedDoneDays = 99;
  check('stopstats-copy', FSS.feaststopspendStats().deedDoneDays === 0, 'stats getter returns a copy');
})();

// ---------- source-level checks ----------
(function () {
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent-feaststopspend-b.js'), 'utf8');
  check('policy-no-hostfeast-call', !/Game\.hostFeast\s*\(/.test(src), 'the wrapper must never call the shared verb itself');
  check('policy-no-killlog-ref', src.indexOf('waveKillLog') === -1, 'waveKillLog appears in the policy source');
  check('policy-delegates-both', src.indexOf('feastdrive.daily') !== -1 && src.indexOf('staged.daily') !== -1 &&
    src.indexOf('feastdrive.upkeep') !== -1 && src.indexOf('staged.upkeep') !== -1,
    'wrapper must delegate daily/upkeep to both layers');
  check('policy-deed-read', src.indexOf('sentimentTaught') !== -1 && src.indexOf('feastSurgeUsed') !== -1,
    'deed read must name both halves');
})();

// ---------- analyzer guardRows fixtures ----------
(function () {
  const rows = function (days) { return days.map(function (d) { return { day: d, spent: d >= 5, feasts: d >= 3 ? 1 : 0 }; }); };
  const g1 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]), rows([1, 2, 3, 4, 5, 6]), 5);
  check('guard-identical-through-spend', g1.pass === true && g1.firstDiffDay == null, JSON.stringify(g1));
  const g2 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]), [{ day: 1, spent: false, feasts: 0 }, { day: 2, spent: false, feasts: 0 }, { day: 3, spent: false, feasts: 1 }, { day: 4, spent: false, feasts: 1 }, { day: 5, spent: true, feasts: 1 }, { day: 6, spent: true, feasts: 5 }], 5);
  check('guard-post-spend-divergence-ignored', g2.pass === true, JSON.stringify(g2));
  const g3 = ANALYZE.guardRows(rows([1, 2, 3, 4, 5, 6]), [{ day: 1, spent: false, feasts: 0 }, { day: 2, spent: false, feasts: 0 }, { day: 3, spent: false, feasts: 1 }, { day: 4, spent: false, feasts: 9 }, { day: 5, spent: true, feasts: 1 }, { day: 6, spent: true, feasts: 1 }], 5);
  check('guard-pre-spend-divergence-caught', g3.pass === false && g3.firstDiffDay === 4 && /d4\.feasts/.test(g3.diffs[0] || ''), JSON.stringify(g3));
  const g4 = ANALYZE.guardRows(rows([1, 2, 3]), rows([1, 2, 3]), null);
  check('guard-no-spend-whole-run', g4.pass === true, JSON.stringify(g4));
  const g5 = ANALYZE.guardRows([], [], null);
  check('guard-empty-rows', g5.pass === true, JSON.stringify(g5));
})();

// ---------- live legs via the driver (in /tmp) ----------
async function liveLegs() {
  const tmpBase = '/tmp/feaststopspend-proof-baseline';
  const tmpArmed = '/tmp/feaststopspend-proof-armed';
  const tmpArmed6 = '/tmp/feaststopspend-proof-armed6';
  [tmpBase, tmpArmed, tmpArmed6].forEach(function (d) { try { cp.execSync('rm -rf ' + d); } catch (e) {} });
  function runDriver(outdir, run, policy, seeds) {
    const env = Object.assign({}, process.env, { DAYS: '150', SEEDS: seeds, RUN: run, POLICY: policy, OUTDIR: outdir });
    cp.execSync('node scripts/feaststopspend-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 900000 });
  }
  // Neutrality leg: 53001 feastdrive vs feaststopspend — daily rows
  // exact through the baseline spend day (whole run if no spend).
  try {
    runDriver(tmpBase, 'feaststopspend-proof-baseline', 'feastdrive', '53001');
    runDriver(tmpArmed, 'feaststopspend-proof-armed', 'feaststopspend', '53001');
  } catch (e) {
    check('live-neutrality-runs', false, 'driver failed: ' + String((e && e.stdout) || (e && e.message) || e).slice(0, 400));
  }
  try {
    const b = JSON.parse(fs.readFileSync(tmpBase + '/feaststopspend-s53001-feaststopspend-proof-baseline.json', 'utf8'));
    const a = JSON.parse(fs.readFileSync(tmpArmed + '/feaststopspend-s53001-feaststopspend-proof-armed.json', 'utf8'));
    check('live-neutrality-runs', b.days > 0 && a.days > 0 && (b.instrumentErrors || []).length === 0 &&
      (a.instrumentErrors || []).length === 0,
      'days=' + b.days + '/' + a.days + ' errs=' + JSON.stringify(b.instrumentErrors) + '/' + JSON.stringify(a.instrumentErrors));
    const g = ANALYZE.guardRows(b.daily || [], a.daily || [], b.firstSpendDay);
    check('live-neutrality-prebind-exact', g.pass === true,
      'firstDiffDay=' + g.firstDiffDay + ' diffs=' + JSON.stringify(g.diffs) + ' spendDay=' + b.firstSpendDay);
    check('live-neutrality-same-anchor', b.anchorCommit === a.anchorCommit && b.anchorCommit !== 'unknown',
      'anchors ' + b.anchorCommit + ' / ' + a.anchorCommit);
  } catch (e) {
    check('live-neutrality-reads', false, 'neutrality corpus unreadable: ' + String((e && e.message) || e).slice(0, 200));
  }
  // Armed leg: 53006 feaststopspend — 0 instrument errors; if the
  // deed is spent, no drive feast / donate-down event after the spend
  // day and the stop counters moved.
  try {
    runDriver(tmpArmed6, 'feaststopspend-proof-armed6', 'feaststopspend', '53006');
  } catch (e) {
    check('live-armed-runs', false, 'driver failed: ' + String((e && e.stdout) || (e && e.message) || e).slice(0, 400));
  }
  try {
    const a6 = JSON.parse(fs.readFileSync(tmpArmed6 + '/feaststopspend-s53006-feaststopspend-proof-armed6.json', 'utf8'));
    const last6 = (a6.daily || [])[(a6.daily || []).length - 1] || {};
    check('live-armed-runs', a6.days > 0 && (a6.daily || []).length >= 40 && (a6.instrumentErrors || []).length === 0,
      'days=' + a6.days + ' snaps=' + (a6.daily || []).length + ' errs=' + JSON.stringify(a6.instrumentErrors));
    if (a6.firstSpendDay != null) {
      const fds = a6.feastdriveStats || {};
      const lateFeasts = (fds.events || []).filter(function (ev) { return ev.what === 'feast' && (ev.day | 0) > (a6.firstSpendDay | 0); }).length;
      const lateDonates = (fds.events || []).filter(function (ev) { return ev.what === 'donate-down' && (ev.day | 0) > (a6.firstSpendDay | 0); }).length;
      const fss = a6.feaststopspendStats || {};
      check('live-armed-stop-binds', lateFeasts === 0 && lateDonates === 0 && (fss.deedDoneDays | 0) > 0,
        JSON.stringify({ spendDay: a6.firstSpendDay, lateFeasts: lateFeasts, lateDonates: lateDonates, stopDays: fss.deedDoneDays, stopDonate: fss.deedDoneDonateSkips, stopFeast: fss.deedDoneFeastSkips }));
    } else {
      check('live-armed-stop-binds', (a6.feaststopspendStats || {}).deedDoneDays === 0,
        'no spend on 53006 this master — stop correctly never bound (spent=' + last6.spent + ')');
    }
    check('live-armed-structural', typeof last6.spent === 'boolean' && typeof last6.surgeResonance === 'number' &&
      typeof last6.feasts === 'number' && typeof last6.draws === 'number',
      'spent=' + last6.spent + ' resonance=' + last6.surgeResonance);
  } catch (e) {
    check('live-armed-reads', false, 'armed corpus unreadable: ' + String((e && e.message) || e).slice(0, 200));
  }

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
