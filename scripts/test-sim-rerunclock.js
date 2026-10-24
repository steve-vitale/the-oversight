#!/usr/bin/env node
// test-sim-rerunclock.js — proof test for the sim-rerunclock DIAG arm.
// The arm makes NO game change, so the proof proves the INSTRUMENT:
//   E1 deriveTrajectory: tier first-hit days, rerun counts by window.
//   E2 killer-class rules: rerun-clock / single-apex / survived / mixed.
//   E3 live instrument: daily trace fills, days monotonic, no errors.
//   E4 determinism: the same pinned config twice gives the same trace.
//   E5 census bar: the analyzer's DIAG-GO gate on a synthetic corpus.
// Live runs use a SHORT horizon (30d) — they prove the instrument, not
// the census; the census itself is the sweep's 180d output. Test
// fixtures for E5 live under os.tmpdir() (ephemeral test data, never a
// sweep output) and are removed in a finally block.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const RI = require(path.join(REPO, 'scripts', 'sim-rerunclock-instrument'));
const SWEEP = require(path.join(REPO, 'scripts', 'sim-rerunclock-sweep'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`PASS ${name}`); }
  else { failed++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function sha(s) { return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16); }

function synthTrace() {
  // Days 80..140: national from d100, tier 0 until d107, then +1/7d
  // (tier 1 d107, 2 d114, 3 d121, 4 d128, 5 d135), table waiting d100.
  const trace = [];
  for (let d = 80; d <= 140; d++) {
    const tier = d < 107 ? 0 : Math.min(6, Math.floor((d - 100) / 7));
    trace.push({ day: d, rank: d >= 100 ? 'national' : 'village', tier, wave: d >= 90 ? 5 : 4,
      tableWaiting: d >= 100, tableDone: false, seat: 'full', roster: 10, standing: 100 });
  }
  return trace;
}

async function main() {
  // E1: trajectory derivation on synthetic data.
  const trace = synthTrace();
  const fights = [
    { day: 95, wave: 5, rerun: false }, { day: 110, wave: 4, rerun: true },
    { day: 120, wave: 5, rerun: true }, { day: 130, wave: 5, rerun: true },
    { day: 138, wave: 4, rerun: true },
  ];
  const deaths = [{ person: true, day: 139, whoName: 'Test', cause: 'combat', oppMid: 'eulogy', oppWave: 4 }];
  const T = RI.deriveTrajectory(trace, fights, deaths, { w4Day: 85, w5Day: 90 }, { endReason: 'village-lost', days: 140, national: 1 });
  check('E1 nationalDay=100', T.nationalDay === 100, `got ${T.nationalDay}`);
  check('E1 tierFirst 1=107, 4=128', T.tierFirst[1] === 107 && T.tierFirst[4] === 128, JSON.stringify(T.tierFirst));
  check('E1 tierAtNational=0, tierAtDoor=0, tierAtEnd=5', T.tierAtNational === 0 && T.tierAtDoor === 0 && T.tierAtEnd === 5,
    `${T.tierAtNational}/${T.tierAtDoor}/${T.tierAtEnd}`);
  check('E1 rerun all=4 w5=2 postWindow=4 (window opens d90)', T.rerun.all === 4 && T.rerun.w5 === 2 && T.rerun.postWindow === 4, JSON.stringify(T.rerun));
  check('E1 rerun postNational=4 postDoor=4', T.rerun.postNational === 4 && T.rerun.postDoor === 4, JSON.stringify(T.rerun));
  check('E1 killerClass rerun-clock (tier>=4, >=4 rerun in window)', T.killerClass === 'rerun-clock', T.killerClass);
  check('E1 qualifying + trajectoryComplete', T.qualifying === true && T.trajectoryComplete === true);

  // E2: killer-class rules on the other branches.
  const apex = RI.deriveTrajectory(trace.slice(0, 31), [{ day: 105, wave: 5, rerun: false }],
    [{ person: true, day: 106, whoName: 'A', cause: 'combat', oppMid: 'finale', oppWave: 5 }],
    { w5Day: 90 }, { endReason: 'village-lost', days: 110, national: 1 });
  check('E2 single-apex (death <=3d after one w5 fight, <4 reruns)', apex.killerClass === 'single-apex', apex.killerClass);
  const surv = RI.deriveTrajectory(trace, fights, deaths, { w5Day: 90 }, { endReason: 'survived', days: 140, national: 1 });
  check('E2 survived (not lost)', surv.killerClass === 'survived', surv.killerClass);
  const mixed = RI.deriveTrajectory(trace.slice(0, 41), [{ day: 105, wave: 4, rerun: true }],
    [{ person: true, day: 130, whoName: 'B', cause: 'starvation', oppMid: null, oppWave: null }],
    { w5Day: 90 }, { endReason: 'village-lost', days: 140, national: 1 });
  // tierAtEnd here is 2 (<4) and rerun window is 1 (<4), last death is not
  // near a w5 fight -> mixed/other.
  check('E2 mixed/other (neither rule fires)', mixed.killerClass === 'mixed/other', mixed.killerClass);

  // E3 + E4: live instrument on a pinned config, short horizon.
  const a = await SWEEP.oneRun(73101, { write: false, days: 30 });
  check('E3 live trace fills (30d horizon)', Array.isArray(a.rerunclockDaily) && a.rerunclockDaily.length >= 25,
    `len=${(a.rerunclockDaily || []).length}`);
  const days = (a.rerunclockDaily || []).map(r => r.day);
  check('E3 live days monotonic', days.every((d, i) => i === 0 || d >= days[i - 1]), days.join(','));
  check('E3 live tiers >= 0, no instrument errors', (a.rerunclockDaily || []).every(r => (r.tier | 0) >= 0) && (a.instrumentErrors || []).length === 0,
    JSON.stringify(a.instrumentErrors));
  check('E3 live anchor + seed + unlock keys', a.seed === 73101 && a.anchorCommit && a.unlock && ('w5Day' in a.unlock));
  const b = await SWEEP.oneRun(73101, { write: false, days: 30 });
  check('E4 determinism: identical daily trace hash on re-run',
    sha(JSON.stringify(a.rerunclockDaily)) === sha(JSON.stringify(b.rerunclockDaily)),
    `${sha(JSON.stringify(a.rerunclockDaily))} vs ${sha(JSON.stringify(b.rerunclockDaily))}`);
  check('E4 determinism: identical trajectory hash on re-run',
    sha(JSON.stringify(a.trajectory)) === sha(JSON.stringify(b.trajectory)));

  // E5: analyzer DIAG-GO gate on a synthetic corpus.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rerunclock-test-'));
  try {
    const mk = (seed, traj, endReason, national) => {
      const doc = { seed, base: 'competent', anchorCommit: 'test', unlock: { w4Day: 80, w5Day: 90 },
        maxWave: 5, national, table: 1, won: 0, exiled: 0, days: 140, endReason, trajectory: traj,
        rerunclockDaily: [], postunlockDeaths: [], postunlockFights: [], instrumentErrors: [] };
      fs.writeFileSync(path.join(tmp, `s${seed}-competent.json`), JSON.stringify(doc));
    };
    mk(73101, Object.assign({}, T, { trajectoryComplete: true }), 'village-lost', 1);
    const t2 = RI.deriveTrajectory(trace, fights, deaths, { w5Day: 90 }, { endReason: 'survived', days: 140, national: 1 });
    mk(73102, Object.assign({}, t2, { trajectoryComplete: true }), 'survived', 1);
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sim-rerunclock-analyze.js')],
      { env: Object.assign({}, process.env, { EVID: tmp, SEEDS: '73101,73102' }), encoding: 'utf8' });
    let attr = null;
    try { attr = JSON.parse(fs.readFileSync(path.join(tmp, 'sim-rerunclock-attribution.json'), 'utf8')); } catch (e) {}
    check('E5 analyzer diagGo on synthetic qualifying corpus', !!(attr && attr.bar && attr.bar.diagGo),
      `status=${r.status} out=${(r.stdout || '').slice(0, 200)} err=${(r.stderr || '').slice(0, 200)}`);
    check('E5 analyzer verdict rerun-clock (1 lost qualifying, rerun-clock)', !!(attr && attr.verdict === 'rerun-clock'),
      attr ? attr.verdict : 'no attribution file');
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }

  console.log(`\nTEST-SIM-RERUNCLOCK: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}
main().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
