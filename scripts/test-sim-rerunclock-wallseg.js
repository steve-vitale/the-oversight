#!/usr/bin/env node
// test-sim-rerunclock-wallseg.js — proof test for the sim-rerunclock-
// wallseg DIAG arm. The arm makes NO game change, so the proof proves
// the INSTRUMENT and the ANALYZER GATE:
//   E1 diagGo requires a qualifying config (backlog #894 fix): a census
//     with zero qualifying configs must NOT report diagGo — the
//     sim-rerunclock vacuous-true bug, fixed here, not repeated.
//   E2 fixture attribution: the REAL postunlock2-b door windows
//     (s70811-lead, s70814-lead fights+deaths) classify rerun-clock
//     under the pre-registered rule, with the real Eulogy cascade
//     counted (70811: 7). Only the tier trace is stubbed (tier 6 by the
//     last death, matching the real death rows' overtime tier 6);
//     the fights, deaths, unlock days, and end days are the real corpus.
//   E3 live instrument on the wallseg policy (30d pinned config):
//     daily tier trace + door-bar snapshots fill, days monotonic,
//     no instrument errors.
//   E4 determinism: the same pinned config twice gives identical
//     daily-trace and trajectory hashes.
//   E5 analyzer GO gate on a synthetic qualifying corpus: 4 door
//     configs, all rerun-clock, lost -> diagGo true, verdict
//     rerun-clock, goBar.go true.
//   E6 resume payloadComplete: saved base is normBase(base) — the
//     secondary sweep's re-run of s70201-lead proved the raw-base
//     comparison never skipped; normalized comparison skips, wrong
//     anchor / incomplete trajectory do not.
// Live runs use a SHORT horizon (30d) — they prove the instrument, not
// the census; the census itself is the sweep's 180d output. Test
// fixtures for E1/E5 live under os.tmpdir() (ephemeral test data, never
// a sweep output) and are removed in a finally block.
//
// RUN WITH the pinned wallseg env (the sweep module's checkEnv gate
// runs on require and stops without it):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 \
//   node scripts/test-sim-rerunclock-wallseg.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const RI = require(path.join(REPO, 'scripts', 'sim-rerunclock-instrument'));
const WI = require(path.join(REPO, 'scripts', 'sim-rerunclock-wallseg-instrument'));
const SWEEP = require(path.join(REPO, 'scripts', 'sim-rerunclock-wallseg-sweep'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log(`PASS ${name}`); }
  else { failed++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function sha(s) { return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16); }

function synthTrace(startDay, endDay, nationalFrom, tier6By) {
  const trace = [];
  for (let d = startDay; d <= endDay; d++) {
    let tier = 0;
    if (d >= tier6By) tier = 6;
    else if (d >= tier6By - 35) tier = Math.min(5, 1 + Math.floor((d - (tier6By - 35)) / 7));
    trace.push({ day: d, rank: d >= nationalFrom ? 'national' : 'village', tier,
      wave: 5, tableWaiting: d >= nationalFrom, tableDone: false, seat: 'full', roster: 10, standing: 200 });
  }
  return trace;
}

function runAnalyzer(tmp, seeds, policies) {
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sim-rerunclock-wallseg-analyze.js')],
    { env: Object.assign({}, process.env, { EVID: tmp, SEEDS: seeds, POLICIES: policies }), encoding: 'utf8' });
  let attr = null;
  try { attr = JSON.parse(fs.readFileSync(path.join(tmp, 'sim-rerunclock-wallseg-attribution.json'), 'utf8')); } catch (e) {}
  return { r, attr };
}

async function main() {
  // E1: empty qualifying population must NOT be diagGo (backlog #894).
  const tmp1 = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-wallseg-e1-'));
  try {
    for (const seed of [73201, 73202]) {
      for (const base of ['lead', 'belong']) {
        const doc = { seed, base, anchorCommit: 'test', unlock: { w4Day: 80, w5Day: null },
          maxWave: 4, national: 0, table: 0, won: 0, exiled: 0, days: 180, endReason: 'survived',
          trajectory: { qualifying: false, nationalDay: null, tableDay: null, windowOpen: null,
            tierFirst: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
            tierAtNational: null, tierAtDoor: null, tierAtEnd: 0, daysAtTier: { 0: 180 },
            daysPostDoor: null, daysPostNational: null,
            rerun: { all: 0, w4: 0, w5: 0, postNational: 0, postDoor: 0, postWindow: 0 },
            fights: { all: 0, w4: 0, w5: 0, postWindow: 0 }, lastDeath: null,
            killerClass: 'survived', killerReason: 'village not lost by cap', trajectoryComplete: true },
          doorSnapshot: { atOrBefore: null, atOrAfter: null }, eulogyCascadePostWindow: 0,
          postunlockDeaths: [], postunlockFights: [], instrumentErrors: [] };
        fs.writeFileSync(path.join(tmp1, `s${seed}-${base}.json`), JSON.stringify(doc));
      }
    }
    const { r, attr } = runAnalyzer(tmp1, '73201,73202', 'lead,belong');
    check('E1 diagGo false on empty qualifying population (#894)', !!(attr && attr.bar && attr.bar.diagGo === false),
      `status=${r.status} bar=${attr ? JSON.stringify(attr.bar) : 'no attr'} err=${(r.stderr || '').slice(0, 200)}`);
    check('E1 verdict is "no door configs" (not a named verdict)', !!(attr && attr.verdict === 'no door configs'), attr ? attr.verdict : 'no attr');
    check('E1 goBar.go false on empty population', !!(attr && attr.goBar && attr.goBar.go === false), attr ? JSON.stringify(attr.goBar) : 'no attr');
  } finally {
    try { fs.rmSync(tmp1, { recursive: true, force: true }); } catch (e) {}
  }

  // E2: real postunlock2-b door windows classify rerun-clock.
  for (const [file, w5, expRerunMin, expEulogy] of [
    ['s70811-lead.json', 93, 14, 7],
    ['s70814-lead.json', 83, 11, 1],
  ]) {
    const real = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock2-b', file), 'utf8'));
    const trace = synthTrace(70, real.days, 100, real.days - 6);
    const T = RI.deriveTrajectory(trace, real.postunlockFights, real.postunlockDeaths, real.unlock,
      { endReason: real.endReason, days: real.days, national: real.national });
    check(`E2 ${file} killerClass rerun-clock`, T.killerClass === 'rerun-clock', T.killerClass);
    check(`E2 ${file} rerun postWindow >= ${expRerunMin}`, T.rerun.postWindow >= expRerunMin, JSON.stringify(T.rerun));
    check(`E2 ${file} windowOpen = w5Day ${w5}`, T.windowOpen === w5, `got ${T.windowOpen}`);
    const casc = WI.eulogyCascadeCount(real.postunlockDeaths, T.windowOpen);
    check(`E2 ${file} Eulogy cascade = ${expEulogy}`, casc === expEulogy, `got ${casc}`);
    const lastVd = real.postunlockDeaths.filter(d => d.person).slice(-1)[0];
    check(`E2 ${file} last-death overtime tier 6 (real row)`, lastVd && lastVd.overtime && lastVd.overtime.tier === 6,
      lastVd ? JSON.stringify(lastVd.overtime) : 'no villager deaths');
  }

  // E3 + E4: live wallseg instrument, short horizon.
  const a = await SWEEP.oneRun(73201, 'lead', { write: false, days: 30 });
  check('E3 live tier trace fills (30d horizon)', Array.isArray(a.rerunclockDaily) && a.rerunclockDaily.length >= 25,
    `len=${(a.rerunclockDaily || []).length}`);
  const days = (a.rerunclockDaily || []).map(r => r.day);
  check('E3 live days monotonic', days.every((d, i) => i === 0 || d >= days[i - 1]), days.join(','));
  check('E3 live tiers >= 0, no instrument errors', (a.rerunclockDaily || []).every(r => (r.tier | 0) >= 0) && (a.instrumentErrors || []).length === 0,
    JSON.stringify(a.instrumentErrors));
  check('E3 live door bars fill with named fields', Array.isArray(a.doorBars) && a.doorBars.length >= 25 &&
    a.doorBars.every(r => ['armored', 'armed', 'tricks', 'veterans'].every(k => typeof r[k] === 'number')),
    `len=${(a.doorBars || []).length}`);
  check('E3 live anchor + seed + unlock keys', a.seed === 73201 && a.anchorCommit && a.unlock && ('w5Day' in a.unlock));
  const b = await SWEEP.oneRun(73201, 'lead', { write: false, days: 30 });
  check('E4 determinism: identical daily trace hash on re-run',
    sha(JSON.stringify(a.rerunclockDaily)) === sha(JSON.stringify(b.rerunclockDaily)),
    `${sha(JSON.stringify(a.rerunclockDaily))} vs ${sha(JSON.stringify(b.rerunclockDaily))}`);
  check('E4 determinism: identical trajectory hash on re-run',
    sha(JSON.stringify(a.trajectory)) === sha(JSON.stringify(b.trajectory)));
  check('E4 determinism: identical door-bar hash on re-run',
    sha(JSON.stringify(a.doorBars)) === sha(JSON.stringify(b.doorBars)));

  // E5: analyzer GO gate on a synthetic qualifying corpus.
  const tmp5 = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-wallseg-e5-'));
  try {
    for (const seed of [73201, 73202]) {
      for (const base of ['lead', 'belong']) {
        const doc = { seed, base, anchorCommit: 'test', unlock: { w4Day: 70, w5Day: 85 },
          maxWave: 5, national: 1, table: 1, won: 0, exiled: 0, days: 140, endReason: 'village-lost',
          trajectory: { qualifying: true, nationalDay: 80, tableDay: 80, windowOpen: 80,
            tierFirst: { 1: 90, 2: 97, 3: 104, 4: 111, 5: 118, 6: 125 },
            tierAtNational: 0, tierAtDoor: 0, tierAtEnd: 6, daysAtTier: { 0: 20, 1: 7, 2: 7, 3: 7, 4: 7, 5: 7, 6: 15 },
            daysPostDoor: 55, daysPostNational: 60,
            rerun: { all: 8, w4: 5, w5: 3, postNational: 8, postDoor: 8, postWindow: 8 },
            fights: { all: 12, w4: 7, w5: 5, postWindow: 12 },
            lastDeath: { day: 139, who: 'Test', cause: 'combat', opp: 'eulogy', wave: 4 },
            killerClass: 'rerun-clock', killerReason: 'end tier>=4 and >=4 rerun fights in post-window', trajectoryComplete: true },
          doorSnapshot: { atOrBefore: { day: 85, armored: 2, armed: 4, tricks: 10, veterans: 1, roster: 12 },
            atOrAfter: { day: 86, armored: 2, armed: 4, tricks: 10, veterans: 1, roster: 12 } },
          eulogyCascadePostWindow: 3, postunlockDeaths: [], postunlockFights: [], instrumentErrors: [] };
        fs.writeFileSync(path.join(tmp5, `s${seed}-${base}.json`), JSON.stringify(doc));
      }
    }
    const { r, attr } = runAnalyzer(tmp5, '73201,73202', 'lead,belong');
    check('E5 analyzer diagGo on synthetic qualifying corpus', !!(attr && attr.bar && attr.bar.diagGo),
      `status=${r.status} bar=${attr ? JSON.stringify(attr.bar) : 'no attr'} err=${(r.stderr || '').slice(0, 200)}`);
    check('E5 analyzer verdict rerun-clock (4 lost door, rerun-clock)', !!(attr && attr.verdict === 'rerun-clock'), attr ? attr.verdict : 'no attr');
    check('E5 goBar.go true (>=2 doors attributed + verdict named)', !!(attr && attr.goBar && attr.goBar.go), attr ? JSON.stringify(attr.goBar) : 'no attr');
  } finally {
    try { fs.rmSync(tmp5, { recursive: true, force: true }); } catch (e) {}
  }

  // E6: resume payloadComplete normalizes the policy base (resume bug
  // found during this run: saved files carry normBase(base)
  // ('leadfeast'), while seedFile()/main use the raw base ('lead') —
  // comparing raw-to-saved made resume NEVER skip, and the secondary
  // sweep re-ran s70201-lead after its first run's exec was aborted).
  check('E6 payloadComplete accepts normBase-saved base', SWEEP.payloadComplete(
    { seed: 70201, base: 'leadfeast', anchorCommit: 'test-anchor',
      rerunclockDaily: [{ day: 1 }], doorBars: [{ day: 1 }],
      postunlockDeaths: [], postunlockFights: [],
      unlock: { w4Day: null, w5Day: null },
      trajectory: { trajectoryComplete: true } },
    70201, 'lead', 'test-anchor') === true);
  check('E6 payloadComplete rejects wrong anchor', SWEEP.payloadComplete(
    { seed: 70201, base: 'leadfeast', anchorCommit: 'test-anchor',
      rerunclockDaily: [{ day: 1 }], doorBars: [{ day: 1 }],
      postunlockDeaths: [], postunlockFights: [],
      unlock: { w4Day: null, w5Day: null },
      trajectory: { trajectoryComplete: true } },
    70201, 'lead', 'other-anchor') === false);
  check('E6 payloadComplete rejects incomplete trajectory', SWEEP.payloadComplete(
    { seed: 70201, base: 'leadfeast', anchorCommit: 'test-anchor',
      rerunclockDaily: [{ day: 1 }], doorBars: [{ day: 1 }],
      postunlockDeaths: [], postunlockFights: [],
      unlock: { w4Day: null, w5Day: null },
      trajectory: { trajectoryComplete: false } },
    70201, 'lead', 'test-anchor') === false);

  console.log(`\nTEST-SIM-RERUNCLOCK-WALLSEG: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}
main().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
