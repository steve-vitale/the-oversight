// scripts/test-journey-scale-r107-reggate-20261107.js — proof test for the
// r107 regional-gate wiring: the regionalstep recorder (require, not a copy)
// attached to the journey-scale driver. Fixture tests for classifyGate
// (every link in the regional chain + edge cases), driver-source wiring
// checks, and a live smoke leg that runs the r107 DRIVER itself on seed
// 97001 with DAYCAP=10 into /tmp and asserts the reggate corpus exists,
// every row carries a gate, and instrument errors are 0.
// PRE-REGISTER: evidence/2026-11-07/journey-scale-r107-prereg.md (Q1).
// Not on the green list (same precedent as the r102/r103/r104/r106 proof
// tests — do not add it).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { classifyGate } = require('./regionalstep-instrument-20261107');
const { classifyNatGate, summarizeNatGate } = require('./analyze-journey-scale-r107-20261107.js');

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}

// ---------- classifyGate fixtures (regional chain order) ----------
function row(over) {
  return Object.assign({
    day: 50, scale: 'village', networkLive: false, knownCount: 3, bestDet: 65,
    bestOffer: 'sub', bestVillageId: 'thornfield', proposeCalls: 0,
    acceptLinkRaiseCalls: 0, proposeCounter: 0, answerCounterCalls: 0,
    pendingCounter: null, activeLinks: 0, everLinks: 0, oldestActiveAge: null,
    firstLinkDay: null, accordUnanswered: false, regionalPending: false,
  }, over || {});
}
check('gate-regional-networkLive', classifyGate(row({ networkLive: true })).gate, 'regional');
check('gate-regional-scale', classifyGate(row({ scale: 'regional' })).gate, 'regional');
check('gate-no-known-village', classifyGate(row({ knownCount: 0 })).gate, 'no-known-village');
check('gate-known-no-courtship', classifyGate(row({ bestDet: 20 })).gate, 'known-no-courtship');
check('gate-known-no-courtship-null-det', classifyGate(row({ bestDet: null })).gate, 'known-no-courtship');
check('gate-courtship-no-attempt', classifyGate(row({})).gate, 'courtship-no-attempt');
check('gate-counter-unanswered-pending', classifyGate(row({ pendingCounter: { targetId: 'thornfield', day: 40 } })).gate, 'counter-unanswered');
check('gate-counter-unanswered-staged', classifyGate(row({ proposeCounter: 1, answerCounterCalls: 0 })).gate, 'counter-unanswered');
check('gate-attempted-no-link', classifyGate(row({ proposeCalls: 2 })).gate, 'attempted-no-link');
check('gate-attempted-no-link-raise', classifyGate(row({ acceptLinkRaiseCalls: 1 })).gate, 'attempted-no-link');
check('gate-link-young', classifyGate(row({ everLinks: 1, activeLinks: 1, oldestActiveAge: 5, oldestActiveId: 'link_1' })).gate, 'link-young');
check('gate-link-broken', classifyGate(row({ everLinks: 1, activeLinks: 0, firstLinkDay: 30 })).gate, 'link-broken');
check('gate-seasoned-no-dawn', classifyGate(row({ everLinks: 1, activeLinks: 1, oldestActiveAge: 25, oldestActiveId: 'link_1' })).gate, 'seasoned-no-dawn');
check('gate-link-beats-attempt-counters', classifyGate(row({ everLinks: 1, activeLinks: 1, oldestActiveAge: 5, proposeCalls: 0 })).gate, 'link-young');
check('gate-null-row', classifyGate(null).gate, 'no-known-village');

// ---------- natgate classifier still intact after the analyzer edit ----------
function natBase(over) {
  return Object.assign({
    day: 100, rank: 'regional', nationalLive: false, globalLive: false,
    networkLive: true, networkLiveDay: 60, rungReady: true,
    exiled: false, scaleRefused: false, pendingShape: null, pendingDay: null,
    leadActive: 1, leadSeasoned: 1, covActive: 0, covSeasoned: 0,
    tradeActive: 0, tradeSeasoned: 0, belong: null, foreignMax: 2,
    leadPolity: null, belongPolity: null, covPolity: null, tradePolity: null,
    defer: {}, viewership: 12,
  }, over || {});
}
check('nat-STAGED', classifyNatGate(natBase({ nationalLive: true })), 'STAGED');
check('nat-PENDING:lead', classifyNatGate(natBase({ pendingShape: 'lead', pendingDay: 98 })), 'PENDING:lead');
check('nat-RUNG', classifyNatGate(natBase({ rungReady: false })), 'RUNG');
check('nat-NO-SHAPE', classifyNatGate(natBase()), 'NO-SHAPE');
check('nat-STAGE-EXPECTED:lead', classifyNatGate(natBase({ leadPolity: { shape: 'lead', size: 4 } })), 'STAGE-EXPECTED:lead');
check('nat-summarize-rows', summarizeNatGate([natBase({ day: 90, rungReady: false }), natBase({ day: 91, leadPolity: { shape: 'lead', size: 4 } })]).rows, 2);

// ---------- driver wiring (source checks) ----------
const driverSrc = fs.readFileSync(path.join(__dirname, 'journey-scale-r107-20261107.js'), 'utf8');
check('driver requires regionalstep instrument', driverSrc.includes("require('./regionalstep-instrument-20261107')"), true);
check('driver installs recorder', driverSrc.includes('REGINST.install(Game)'), true);
check('driver snapshots daily', driverSrc.includes('regInst.snapshot()'), true);
check('driver finalizes recorder', driverSrc.includes('regInst.finalize()'), true);
check('driver uninstalls recorder', driverSrc.includes('regInst.uninstall()'), true);
check('driver writes reggate txt', driverSrc.includes('journey-scale-r107-reggate-${seed}.txt'), true);
check('driver writes regional JSON', driverSrc.includes('journey-scale-r107-regional-${seed}.json'), true);
check('driver seeds are the fresh band', driverSrc.includes('[97001, 97002, 97003, 97004]'), true);
check('driver policy unchanged (control)', driverSrc.includes("require('./policies/scalecourt-nogate-morntrace3')"), true);
check('driver EVIDIR is r107', driverSrc.includes("'2026-11-07', 'journey-scale-r107'"), true);
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-journey-scale-r107-20261107.js'), 'utf8');
check('analyzer requires recorder for classifyGate', analyzerSrc.includes("require('./regionalstep-instrument-20261107')"), true);
check('analyzer has REGGATE section', analyzerSrc.includes('Q1 REGGATE:'), true);
check('analyzer reads regional JSON', analyzerSrc.includes('-regional-${seed}.json'), true);

// ---------- live smoke leg: the r107 driver itself, seed 97001, DAYCAP=10 ----------
// Runs the driver as a child process into /tmp (writes nothing into the repo).
// Asserts the reggate corpus exists, every daily row carries a gate, and the
// instrument recorded zero errors.
(function smoke() {
  const outDir = '/tmp/r107-smoke';
  try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (e) {}
  fs.mkdirSync(outDir, { recursive: true });
  const env = Object.assign({}, process.env, { SEEDS: '97001', DAYCAP: '10', EVIDIR: outDir });
  let out = '';
  try {
    out = execSync('node scripts/journey-scale-r107-20261107.js', { cwd: path.join(__dirname, '..'), env: env, timeout: 300000, encoding: 'utf8' });
  } catch (e) {
    check('smoke-driver-exits-0', 'exit ' + (e.status || e.message), 0);
    console.log('smoke stdout tail:', String((e.stdout || '')).slice(-2000));
    console.log('smoke stderr tail:', String((e.stderr || '')).slice(-2000));
    console.log(`\nR107 reggate proof: ${pass} passed, ${fail} failed`);
    process.exit(1);
  }
  check('smoke-driver-exits-0', true, true);
  const regPath = path.join(outDir, 'journey-scale-r107-regional-97001.json');
  const txtPath = path.join(outDir, 'journey-scale-r107-reggate-97001.txt');
  check('smoke-regional-json-exists', fs.existsSync(regPath), true);
  check('smoke-reggate-txt-exists', fs.existsSync(txtPath), true);
  if (fs.existsSync(regPath)) {
    const corpus = JSON.parse(fs.readFileSync(regPath, 'utf8'));
    const daily = corpus.daily || [];
    check('smoke-rows-exist', daily.length > 0, true);
    const gated = daily.filter(d => d.gate != null).length;
    check('smoke-every-row-gated', gated, daily.length);
    check('smoke-no-instrument-errors', (corpus.instrumentErrors || []).length, 0);
    check('smoke-seed-field', corpus.seed, 97001);
    check('smoke-first-day-gate', (daily[0] || {}).gate != null, true);
    console.log('  smoke rows=' + daily.length + ' gates=' + JSON.stringify(daily.reduce((m, d) => { m[d.gate || '?'] = (m[d.gate || '?'] | 0) + 1; return m; }, {})) + ' propose=' + ((daily[daily.length - 1] || {}).proposeCalls | 0));
  }
  if (fs.existsSync(txtPath)) {
    const lines = fs.readFileSync(txtPath, 'utf8').split('\n').filter(Boolean);
    check('smoke-txt-rows-match', lines.length > 0, true);
  }
  console.log(`\nR107 reggate proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
