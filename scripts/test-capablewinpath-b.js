// test-capablewinpath-b.js — proof test for the DIAG arm sim-capablewinpath-b
// (run fleshout-loop-b-20261114T1030Z). Finding #2321: capable wins 16/16
// by ~day 90 while competent wins 0/16 on identical seeds 98801-98816.
// This arm is INSTRUMENT-ONLY: the recorder (driver-side, in scripts/)
// decomposes the divergence; zero src/js changes.
// Run: node scripts/test-capablewinpath-b.js [--game]  (exit 0 = all green)
//   --game runs the recorder legs (§2, one 150d sim per policy on seed
//   98801): full daily series, 0 instrument errors, every seed classified,
//   capable-98801 won-table and competent-98801 not won (the finding, on
//   the smoke seed).
// RED->GREEN: on the prereg commit §1 fails (no driver/analyzer/test
// files, no G-bars to bind). On the instrument commit all legs pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const GAME = process.argv.indexOf('--game') !== -1;

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---------- §1 static ----------
const preregPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-capablewinpath-b-prereg.md');
const preregText = (function () { try { return fs.readFileSync(preregPath, 'utf8'); } catch (e) { return ''; } })();
t('prereg exists', preregText.length > 0);
t('prereg binds G1 instrument validity', preregText.indexOf('G1 INSTRUMENT VALIDITY') !== -1);
t('prereg binds G2 decomposition', preregText.indexOf('G2 DECOMPOSITION') !== -1);
t('prereg binds G3 instrument-only', preregText.indexOf('G3 INSTRUMENT-ONLY') !== -1);
t('prereg names the band 98801-98816', preregText.indexOf('98801') !== -1 && preregText.indexOf('98816') !== -1);
t('prereg names the classification taxonomy', preregText.indexOf('qualified-never-sat') !== -1 && preregText.indexOf('UNCLASSIFIED') !== -1);

const driverPath = path.join(REPO, 'scripts', 'capablewinpath-driver-20261114.js');
const driverText = (function () { try { return fs.readFileSync(driverPath, 'utf8'); } catch (e) { return ''; } })();
t('driver exists', driverText.length > 0);
t('driver wraps tableTakeSeat (log-on-change)', driverText.indexOf("Game.tableTakeSeat = function") !== -1);
t('driver wraps chooseTableOption', driverText.indexOf("Game.chooseTableOption = function") !== -1);
t('driver wraps unlockedWave log-on-change', driverText.indexOf("wrapLogChange('unlockedWave'") !== -1);
t('driver wraps villageStandingTotal log-on-change', driverText.indexOf("wrapLogChange('villageStandingTotal'") !== -1);
t('driver snapshots after policy.daily', driverText.indexOf("snap('daily')") !== -1);
t('driver exports oneRun', driverText.indexOf('module.exports = { oneRun: oneRun }') !== -1);

const analyzerPath = path.join(REPO, 'scripts', 'analyze-capablewinpath-b.js');
const analyzerText = (function () { try { return fs.readFileSync(analyzerPath, 'utf8'); } catch (e) { return ''; } })();
t('analyzer exists', analyzerText.length > 0);
t('analyzer exports classify + milestones', analyzerText.indexOf('module.exports = { classify: classify, milestones: milestones, analyze: analyze') !== -1);

// The gated reads must never be called by the recorder's snapshot: extract
// the snapshot() body and assert it contains neither gated name.
(function () {
  const m = /function snapshot\(Game, errors\) \{([\s\S]*?)\n\}\n/.exec(driverText);
  const body = m ? m[1] : null;
  t('snapshot() body is present', body != null);
  if (body) {
    t('snapshot() never calls villageStandingTotal (gated, side-effecting)', body.indexOf('villageStandingTotal') === -1);
    t('snapshot() never calls unlockedWave (gated, side-effecting)', body.indexOf('unlockedWave') === -1);
    t('snapshot() reads the pure raw breakdown villageStanding()', body.indexOf('Game.villageStanding()') !== -1);
    t('snapshot() reads deedGateReady() + tableSeat() (pure)', body.indexOf('Game.deedGateReady()') !== -1 && body.indexOf('Game.tableSeat()') !== -1);
  }
})();

// H1 grounding: competent.js carries no table-seat calls at all.
const compText = (function () { try { return fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'); } catch (e) { return ''; } })();
t('H1 grounding: competent.js has no tableTakeSeat', compText.indexOf('tableTakeSeat') === -1);
t('H1 grounding: competent.js has no tablePreview', compText.indexOf('tablePreview') === -1);
t('H1 grounding: competent.js has no tableSeat', compText.indexOf('tableSeat') === -1);
t('H1 grounding: competent.js has no deedGateReady', compText.indexOf('deedGateReady') === -1);

// G3 (static leg): zero src/js changes on this branch vs master.
(function () {
  let names = '';
  try { names = execSync('git diff --name-only master...HEAD -- src/js', { cwd: REPO }).toString().trim(); } catch (e) { names = 'GIT-ERROR'; }
  t('G3 static: no src/js files differ from master', names === '', names ? names.slice(0, 200) : '');
})();

// classify() unit legs on synthetic records.
(function () {
  let classify = null;
  try { classify = require(path.join(REPO, 'scripts', 'analyze-capablewinpath-b')).classify; } catch (e) { /* analyzer missing: RED */ }
  t('analyzer module loads', typeof classify === 'function');
  if (typeof classify !== 'function') return;
  const S = function (days) {
    return days.map(function (d) { return { d: d, seat: 'none', seatDetail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true, ladderPeakStage: 1 } }; });
  };
  t('classify: won-table', classify({ won: true, series: S([1, 2]), seatTakes: [{ day: 90 }], endReason: 'over-other', days: 90 }) === 'won-table');
  t('classify: qualified-never-sat', classify({ won: false, series: S([1, 2]).map(function (s, i) { return i ? Object.assign({}, s, { seat: 'lesser' }) : s; }), seatTakes: [], endReason: 'survived', days: 150 }) === 'qualified-never-sat');
  t('classify: died-before-90', classify({ won: false, series: S([1, 2]), seatTakes: [], endReason: 'village-lost', days: 86 }) === 'died-before-90');
  t('classify: survived-no-seat', classify({ won: false, series: S([1, 2]), seatTakes: [], endReason: 'survived', days: 150 }) === 'survived-no-seat');
  t('classify: never-qualified names the missing bar', (function () {
    const s = S([1, 2]); s[1].seatDetail.foodDeeds = false;
    return classify({ won: false, series: s, seatTakes: [], endReason: 'village-lost', days: 120 }).indexOf('never-qualified-') === 0;
  })());
  t('classify: seat-taken-but-not-won is UNCLASSIFIED (needs a look)', classify({ won: false, series: S([1, 2]).map(function (s, i) { return i ? Object.assign({}, s, { seat: 'lesser' }) : s; }), seatTakes: [{ day: 90 }], endReason: 'over-other', days: 95 }) === 'UNCLASSIFIED');
})();

console.log('§1 static: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
if (!GAME) { console.log('static green; re-run with --game for the recorder legs'); process.exit(0); }

// ---------- §2 game: recorder legs on seed 98801 ----------
async function gameLevel() {
  let gpass = 0, gfail = 0;
  function gt(name, cond, extra) {
    if (cond) { gpass++; console.log('PASS ' + name); }
    else { gfail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  const { oneRun } = require(path.join(REPO, 'scripts', 'capablewinpath-driver-20261114'));
  const { classify } = require(path.join(REPO, 'scripts', 'analyze-capablewinpath-b'));
  const REQUIRED = ['d', 'arc', 'scale', 'stRaw', 'war', 'dip', 'plenty', 'ladCounted', 'ladPeak', 'w1', 'w2', 'w3', 'cont', 'cris', 'stage', 'sent', 'surge', 'seat', 'gateOk', 'tableWaiting', 'tableDone', 'wk', 'vet4', 'vet5', 'pop', 'abilN', 'abil', 'tracks'];
  for (const pol of ['competent', 'capable']) {
    const r = await oneRun(98801, pol);
    gt(pol + ': series covers the run (' + r.series.length + ' days)', r.series.length >= 80, 'days=' + r.days);
    gt(pol + ': series days strictly increasing', r.series.every(function (s, i) { return i === 0 || s.d > r.series[i - 1].d; }));
    gt(pol + ': every snapshot carries the required fields', r.series.every(function (s) { return REQUIRED.every(function (k) { return s[k] !== undefined; }); }));
    gt(pol + ': 0 instrument errors', (r.instrumentErrors || []).length === 0, JSON.stringify(r.instrumentErrors).slice(0, 300));
    const cls = classify(r);
    gt(pol + ': classified (no UNCLASSIFIED)', cls !== 'UNCLASSIFIED', cls);
    gt(pol + ': anchorCommit recorded', typeof r.anchorCommit === 'string' && r.anchorCommit.length >= 7);
    if (pol === 'capable') {
      gt('capable-98801: won-table (the finding, smoke seed)', r.won === true && cls === 'won-table', 'won=' + r.won + ' cls=' + cls + ' end=' + r.endReason);
      gt('capable-98801: took the seat (seatTakes logged)', (r.seatTakes || []).length >= 1, 'takes=' + (r.seatTakes || []).length);
      gt('capable-98801: a table path was chosen', !!(r.tableState && r.tableState.path), JSON.stringify(r.tableState));
      gt('capable-98801: capSummary captured', !!r.capSummary && (r.capSummary.capSeatTaken | 0) >= 1, JSON.stringify(r.capSummary && r.capSummary.capSeatTaken));
    } else {
      gt('competent-98801: not won', r.won === false, 'won=' + r.won);
      gt('competent-98801: never took the seat', (r.seatTakes || []).length === 0, 'takes=' + (r.seatTakes || []).length);
    }
    console.log('  [' + pol + ' 98801] days=' + r.days + ' end=' + r.endReason + ' won=' + r.won + ' cls=' + cls + ' maxWave=' + r.maxWave + ' standing=' + r.standing + ' scale=' + r.scaleRank + ' villDeaths=' + r.villagerCombatDeaths);
  }
  console.log('§2 game: ' + gpass + ' passed, ' + gfail + ' failed');
  if (gfail) process.exit(1);
}

gameLevel().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
