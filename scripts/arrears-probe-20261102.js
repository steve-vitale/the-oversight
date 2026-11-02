#!/usr/bin/env node
// arrears-probe-20261102.js — sim-arrears-a TRANSCRIPT PROBE (labelled
// probe, NOT part of the trace). One seed, run to first-failure day + a
// small buffer, with a SINGLE forced sound at the first refused Herald
// attempt that carries an arrears link, capturing the exact spoken
// refusal lines. Its timeline is DISCARDED for every measured claim:
// sounding charges refusing links -8 trust and perturbs everything
// after it, which is exactly why the trace runs never sound. This
// script exists only so the sense-test quotes a real spoken refusal
// line, not a code template.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   DAYS=110 SEEDS=95447 node scripts/arrears-probe-20261102.js
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '110', 10) || 110;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);
  const probe = { sounded: false, day: null, refusalLines: [], snapshotLinks: null, errors: [] };
  let capturing = false;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (capturing && typeof arg === 'string') probe.refusalLines.push(String(arg).slice(0, 500));
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { probe.errors.push('say-wrap: ' + String(e.message)); }
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const curDay = ((Game.state || {}).scholar || {}).day || 0;
      const hatt = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; });
      const lastAtt = hatt.length ? hatt[hatt.length - 1] : null;
      const refusedHere = lastAtt && lastAtt.day === curDay && lastAtt.cls === 'REFUSED';
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      const arrearsSnap = last && last.day === curDay && (last.links || []).some(function (l) { return (l.arrears || 0) > 0; });
      if (!probe.sounded && refusedHere && arrearsSnap) {
        probe.snapshotLinks = (last.links || []).map(function (l) { return { villageId: l.villageId, name: l.name, trust: l.trust, opinion: l.opinion, arrears: l.arrears }; });
        probe.day = curDay;
        capturing = true;
        try { Game.soundTitanCall('herald'); } catch (e) { probe.errors.push('sound: ' + String(e.message)); }
        capturing = false;
        probe.sounded = true;
      }
    } catch (e) { probe.errors.push(String(e.message)); }
    return r;
  };
  await setupGame(Game);
  let result;
  const wrapped = Object.assign({}, policy, { daily(Gm, ctx) { return policy.daily(Gm, ctx); } });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  console.log(JSON.stringify({ seed: seed, anchorCommit: ANCHOR, probe: probe, instrumentErrors: (t.instrumentErrors || []).length, musterErrs: (mstore.errs || 0) }));
}
(async function () { for (const seed of SEEDS) { await oneRun(seed); } })().catch(function (e) { console.error('PROBE FATAL: ' + String((e && e.stack) || e)); process.exit(1); });
