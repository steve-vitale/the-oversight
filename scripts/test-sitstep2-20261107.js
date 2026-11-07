// test-sitstep2-20261107.js — proof for arm sim-sitstep2-b.
// (1) Fixture tests for the extended seat-day classifier
//     (scripts/sitstep2-analyze-20261107.js :: classifySeatDay) — every
//     gate in the sit chain plus edge cases.
// (2) A live 1-seed smoke leg: 53004 linkdrive, 150d, OUTDIR=/tmp,
//     asserting STRUCTURAL invariants only (no headline numbers — the
//     judged replay measures those). Green BEFORE the judged run.
// Usage: node scripts/test-sitstep2-20261107.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifySeatDay } = require(path.join(REPO, 'scripts', 'sitstep2-analyze-20261107'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra != null ? ' — ' + JSON.stringify(extra) : '')); }
}
function eq(name, got, want) { check(name, got === want, { got: got, want: want }); }

// --- (1) classifier fixtures ---
(function () {
  // sat: tableDone wins over everything.
  eq('sat', classifySeatDay({ tableDone: true, seat: 'lesser', preview: { ready: true } }, []).gate, 'sat');
  // no-seat: missing bars named from seatDetail.
  const ns = classifySeatDay({ seat: 'none', seatDetail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'village', stage: 3, foodDeeds: false }, sentimentTaught: true, feastSurgeUsed: false }, []);
  eq('no-seat gate', ns.gate, 'no-seat');
  check('no-seat names scale', ns.missing.some(function (m) { return /scale village/.test(m); }), ns.missing);
  check('no-seat names surge', ns.missing.some(function (m) { return /feast surge/.test(m); }), ns.missing);
  // floor-day90: seat earned, preview null, day < 90.
  const fl = classifySeatDay({ seat: 'lesser', preview: null, winDayFloorOk: false, tableWaiting: true, day: 64 }, []);
  eq('floor-day90 gate', fl.gate, 'floor-day90');
  // no-preview-waiting: seat earned, day >= 90, preview null, no wait.
  eq('no-preview-waiting', classifySeatDay({ seat: 'lesser', preview: null, winDayFloorOk: true, tableWaiting: false, day: 100 }, []).gate, 'no-preview-waiting');
  // no-preview-unknown: seat earned, day >= 90, preview null, waiting true.
  eq('no-preview-unknown', classifySeatDay({ seat: 'lesser', preview: null, winDayFloorOk: true, tableWaiting: true, day: 100 }, []).gate, 'no-preview-unknown');
  // entry-blocked: preview present, not ready, why carried.
  const eb = classifySeatDay({ seat: 'lesser', preview: { ready: false, why: 'Finish the current encounter before taking your seat.' }, winDayFloorOk: true, tableWaiting: true, day: 100 }, []);
  eq('entry-blocked gate', eb.gate, 'entry-blocked');
  check('entry-blocked why', eb.missing[0] === 'Finish the current encounter before taking your seat.', eb.missing);
  // offer-not-taken: preview ready, no calls.
  eq('offer-not-taken', classifySeatDay({ seat: 'lesser', preview: { ready: true, why: '' }, winDayFloorOk: true, tableWaiting: true, day: 100 }, []).gate, 'offer-not-taken');
  // sit-refused: a call today with ok false carries its msg.
  const sr = classifySeatDay({ seat: 'lesser', preview: { ready: true, why: '' }, winDayFloorOk: true, tableWaiting: true, day: 100 },
    [{ call: 'tableTakeSeat', ok: false, msg: 'Finish the current encounter before taking your seat.' }]);
  eq('sit-refused gate', sr.gate, 'sit-refused');
  check('sit-refused msg', sr.missing[0].indexOf('Finish the current encounter') >= 0, sr.missing);
  // sit-called: a call today with ok true, tableDone still false.
  eq('sit-called', classifySeatDay({ seat: 'lesser', preview: { ready: true, why: '' }, winDayFloorOk: true, tableWaiting: true, day: 100 },
    [{ call: 'tableTakeSeat', ok: true, msg: '' }]).gate, 'sit-called');
  // Edge: preview ready but scholar absent is STILL offer-not-taken
  // (scholar presence is recorded separately, not a gate of its own).
  eq('ready-absent-scholar still offer-not-taken',
    classifySeatDay({ seat: 'lesser', preview: { ready: true, why: '' }, winDayFloorOk: true, tableWaiting: true, day: 100, scholarAtHaven: false }, []).gate,
    'offer-not-taken');
  // Edge: full seat classifies the same way as lesser.
  eq('full-seat ready', classifySeatDay({ seat: 'full', preview: { ready: true, why: '' }, winDayFloorOk: true, tableWaiting: true, day: 120 }, []).gate, 'offer-not-taken');
  // Edge: seat none with no detail at all still names something.
  const ns2 = classifySeatDay({ seat: 'none', seatDetail: null }, []);
  eq('no-seat no-detail', ns2.gate, 'no-seat');
  check('no-seat no-detail missing non-empty', (ns2.missing || []).length > 0, ns2.missing);
})();

// --- (2) live 1-seed smoke leg: 53004 linkdrive, 150d, /tmp ---
(function () {
  const outDir = '/tmp/sitstep2-smoke';
  try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (e) {}
  fs.mkdirSync(outDir, { recursive: true });
  const env = Object.assign({}, process.env, { DAYS: '150', SEEDS: '53004', RUN: 'sitstep2-smoke', OUTDIR: outDir });
  let stdout = '';
  try {
    stdout = execFileSync('node', [path.join(REPO, 'scripts', 'sitstep2-driver-20261107.js')], { cwd: REPO, env: env, timeout: 600000, encoding: 'utf8' });
  } catch (e) {
    check('smoke driver exit 0', false, String((e && e.message) || e).slice(0, 300));
    console.log('smoke stdout: ' + String(e.stdout || '').slice(0, 2000));
    console.log('smoke stderr: ' + String(e.stderr || '').slice(0, 2000));
    finish();
    return;
  }
  console.log('smoke driver: ' + String(stdout).trim().slice(0, 600));
  const file = path.join(outDir, 'sitstep2-s53004-sitstep2-smoke.json');
  check('smoke file exists', fs.existsSync(file));
  if (!fs.existsSync(file)) { finish(); return; }
  const o = JSON.parse(fs.readFileSync(file, 'utf8'));
  eq('smoke seed', o.seed, 53004);
  eq('smoke policy', o.policy, 'linkdrive');
  check('smoke days > 0', (o.days | 0) > 0, o.days);
  const daily = o.daily || [];
  check('smoke daily rows present', daily.length > 0, daily.length);
  check('smoke instrument errors 0', (o.instrumentErrors || []).length === 0, o.instrumentErrors);
  check('smoke sitAttempts array', Array.isArray(o.sitAttempts), typeof o.sitAttempts);
  check('smoke sitVerbMsgs array', Array.isArray(o.sitVerbMsgs), typeof o.sitVerbMsgs);
  check('smoke linkdriveStats object', !!o.linkdriveStats && typeof o.linkdriveStats === 'object', o.linkdriveStats);
  let ordered = true, badPreview = 0, badScholar = 0, badGate = 0;
  for (let i = 0; i < daily.length; i++) {
    const r = daily[i];
    if (i > 0 && (r.day | 0) < (daily[i - 1].day | 0)) ordered = false;
    if (r.preview != null && (r.seat === 'none' || (r.day | 0) < 90)) badPreview++;
    if (typeof r.scholarAtHaven !== 'boolean') badScholar++;
    if (typeof r.gate !== 'string' || !r.gate) badGate++;
  }
  check('smoke daily rows day-ordered', ordered);
  eq('smoke preview ⇒ seat + day>=90 violations', badPreview, 0);
  eq('smoke scholarAtHaven boolean on all rows', badScholar, 0);
  eq('smoke instrument gate field on all rows', badGate, 0);
  finish();
})();

function finish() {
  console.log('test-sitstep2-20261107: ' + pass + ' passed, ' + fail + ' failed');
  process.exitCode = fail ? 1 : 0;
}
