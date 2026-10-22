#!/usr/bin/env node
// sweep-rotsensor-b.js — fixed-phase rot sensor validation sweep + #819
// target re-run (instrument-only, ZERO src/js changes, ZERO policy edits).
//
// Runs (5, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0):
//   {66050 x lead, 66050 x belong}  — the 2 target seed-runs: the census
//      pair whose belong run holds the Somchai d135 / Ingrid d141 drawn=0
//      deaths (evidence/2026-10-22/sim-deathcause-b.md, #819).
//   {66049, 66051, 66052} x belong — sensor validation seeds.
//
// Intentional re-runs on the same substrate (NOT fresh seeds): the census
// corpus is evidence/2026-10-22/perseed-deathcause-b/. Each run carries the
// new fixed-phase rot sensor (scripts/rotsensor-b.js) PLUS the proven
// starvechan instrument (meal rows), so the new sensor data joins the
// existing corpus by (seed, policy, day) — verified by a meal-row digest
// comparison against the corpus. A digest MISMATCH is reported LOUD (the
// sick-stay-home substrate change, villager-agency.js, may diverge seeds)
// but does not stop the sweep: the sensor data stands on its own.
//
// Writes ONCE, on purpose, to evidence/2026-10-22/perseed-rotsensor-b/.
//
// Usage (ENV TRAP — read before running):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-rotsensor-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const RS = require(path.join(REPO, 'scripts', 'rotsensor-b'));
const SC = require(path.join(REPO, 'scripts', 'starvechan-instrument-b'));
const { leadfeast, belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

// SUBSTRATE guard (pinned env; nothing else).
if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required.'); process.exit(2); }
for (const k of ['SURPLUSFEED', 'UPKEEPGATE', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'VGEAR', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS']) {
  if (k in process.env) { console.error('SWEEP STOP: ' + k + ' must be unset (substrate is FEASTSCALE_R13=1/SEATDRIVE=0 only).'); process.exit(2); }
}

const RUNS = [
  { seed: 66050, pol: 'lead' }, { seed: 66050, pol: 'belong' },   // the 2 target seed-runs (#819)
  { seed: 66049, pol: 'belong' }, { seed: 66051, pol: 'belong' }, // sensor validation
  { seed: 66052, pol: 'belong' },
];
const POLICIES = { lead: leadfeast, belong: belongfeast };
const DAYS = 180;
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-rotsensor-b');
const CORPUS = path.join(REPO, 'evidence', '2026-10-22', 'perseed-deathcause-b');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function digest(o) {
  return crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 12);
}

function corpusMealDigest(seed, pol) {
  try {
    const fp = path.join(CORPUS, 'deathcause-' + pol + '-s' + seed + '.json');
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    return digest(d.starvechan.meals);
  } catch (e) { return null; }
}

async function oneRun(seed, pol) {
  const policy = POLICIES[pol];
  const { Game } = await loadGame({ seed: seed, mode: 'rotsensor-' + pol, fullTelemetry: false });
  const rs = RS.installRotSensor(Game);   // fixed phase (sweepSpoiled before-call)
  const sc = SC.install(Game);            // meal rows + legacy dawn scan (comparison)
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const RK = rs.K, SK = sc.K;
  let gameDays = 0;
  try { gameDays = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  const mealDig = digest(SK.meals);
  const cDig = corpusMealDigest(seed, pol);
  try { sc.uninstall(); } catch (e) {}
  try { rs.uninstall(); } catch (e) {}

  const sweeps = RK.sweeps || [];
  const totalSwept = sweeps.reduce(function (t, s) { return t + (s.spoiledKcal || 0); }, 0);
  const pantryVoiceDays = (RK.voice || []).filter(function (v) { return v.pantry; }).map(function (v) { return v.d; });
  const packVoiceDays = (RK.voice || []).filter(function (v) { return !v.pantry; }).map(function (v) { return v.d; });
  const oldNonzero = (SK.rotDays || []).filter(function (r) { return r.rotStock > 0; }).length;
  const sweepsByDay = {};
  sweeps.forEach(function (s) { sweepsByDay[s.d] = s; });
  const voiceHitDays = pantryVoiceDays.filter(function (d) {
    var s = sweepsByDay[d]; return s && s.spoiledKcal > 0;
  });

  const out = {
    seed: seed, policy: pol + 'feast', base: pol,
    instruments: ['rotsensor-b (fixed phase)', 'starvechan-instrument-b (meal rows + legacy scan)'],
    substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0, worktree commit (sick-stay-home landed)',
    anchorCommit: ANCHOR, censusAnchor: 'cd68e6dd3',
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    sensor: {
      sweeps: sweeps,
      voice: RK.voice || [],
      rotEaten: Math.round(RK.rotEaten || 0),
      errors: RK.errors || [],
    },
    sensorSummary: {
      sweepCount: sweeps.length,
      totalSweptKcal: Math.round(totalSwept),
      pantryVoiceDays: pantryVoiceDays,
      packVoiceDays: packVoiceDays,
      voiceHitDays: voiceHitDays,   // pantry-voice days with sensor>0 same day
      legacyScanNonzeroDays: oldNonzero, // the old phase, on this run: expect 0
    },
    mealDigest: mealDig,
    corpusMealDigest: cDig,
    reproduction: cDig ? (cDig === mealDig ? 'IDENTICAL' : 'DIVERGED') : 'NO-CORPUS',
    starvechan: {
      mealRowCount: (SK.meals || []).length,
      scholarMealCount: (SK.scholarMeals || []).length,
      rotEatenLegacy: Math.round(SK.rotEaten || 0),
      errors: (SK.errors || []).length,
    },
  };
  const fp = path.join(EVID, 'rotsensor-' + pol + '-s' + seed + '.json');
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const r of RUNS) {
    try {
      const o = await oneRun(r.seed, r.pol);
      rows.push(o);
      const ss = o.sensorSummary;
      console.log('done ' + o.policy + ' s' + r.seed + ': end=' + o.endReason + ' days=' + o.days +
        ' repro=' + o.reproduction + ' swept=' + ss.totalSweptKcal +
        ' pantryVoice=' + ss.pantryVoiceDays.length + ' hits=' + ss.voiceHitDays.length +
        ' legacyNonzero=' + ss.legacyScanNonzeroDays + ' rotEaten=' + o.sensor.rotEaten +
        ' errs=' + o.sensor.errors.length + '/' + o.starvechan.errors);
    } catch (e) {
      console.error('FAILED ' + r.pol + ' s' + r.seed + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
      process.exitCode = 1;
    }
  }
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(rows.map(function (o) {
    return { seed: o.seed, policy: o.policy, days: o.days, gameDays: o.gameDays,
      endReason: o.endReason, reproduction: o.reproduction, sensorSummary: o.sensorSummary,
      rotEaten: o.sensor.rotEaten };
  }), null, 1) + '\n');
  console.log('wrote ' + rows.length + ' per-seed JSONs to ' + EVID);
})().catch(function (e) { console.error('SWEEP CRASH: ' + (e && e.stack ? e.stack : e)); process.exit(1); });
