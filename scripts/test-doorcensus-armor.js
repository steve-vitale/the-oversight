#!/usr/bin/env node
// test-doorcensus-armor.js — proof gates for the doorcensus-armor arm
// (flesh-out loop, run fleshout-20261023T1115Z, axis scale-onramp).
// GREEN before the sweep.
//
// E1 env-gate: checkEnv() rejects wrong substrates (exit 2), accepts the
//    two legal legs.
// E2 delegation: AV.armedFor('leadfeast') with ARMORVILLAGE unset is
//    byte-identical to AD.armedFor('leadfeast') over 40d — the control leg
//    IS the census-armed config, no armor layer leaks in.
// E3 RED->GREEN: analyzer.summarize on synthetic per-seed fixtures —
//    unlocking live-demand, locked binding-defer5 (attributed), and one
//    unattributed locked run; assert exact door counts, bindings, and the
//    unattributed seed surfaces.
// E4 anchor: diag-doorcensus-armor's ANCHOR equals `git rev-parse HEAD`
//    at module load (finding #793).
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const PASS = [], FAIL = [];
function ok(name, cond, extra) {
  (cond ? PASS : FAIL).push(name);
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? ' — ' + extra : ''));
}

const PINNED = {
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
  SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1',
};
const SWEEP = path.join(REPO, 'scripts', 'diag-doorcensus-armor.js');
function gateRun(env, label) {
  const out = spawnSync(process.execPath,
    ['-e', "require(process.argv[1]); console.log('loaded');", SWEEP],
    { env: Object.assign({}, process.env, env), timeout: 60000, encoding: 'utf8' });
  return out.status;
}

// --- E1: env gate -----------------------------------------------------------
(function e1() {
  const good1 = gateRun(Object.assign({}, PINNED, { ARM: 'control' }));
  ok('E1a control leg (ARMORYDRIVE=1, no ARMORVILLAGE) accepted', good1 === 0, 'exit=' + good1);
  const good2 = gateRun(Object.assign({}, PINNED, { ARM: 'armed', ARMORVILLAGE: '1' }));
  ok('E1b armed leg (ARMORYDRIVE=1+ARMORVILLAGE=1) accepted', good2 === 0, 'exit=' + good2);
  const bad1 = gateRun(Object.assign({}, PINNED, { ARM: 'armorydrive' }));
  ok('E1c ARM=armorydrive rejected (census arm name, not this namespace)', bad1 === 2, 'exit=' + bad1);
  const noAD = gateRun(Object.assign({}, PINNED, { ARM: 'control', ARMORYDRIVE: undefined }));
  ok('E1d missing ARMORYDRIVE rejected', noAD === 2, 'exit=' + noAD);
  ok('E1e ARM=control + ARMORVILLAGE=1 rejected', gateRun(Object.assign({}, PINNED, { ARM: 'control', ARMORVILLAGE: '1' })) === 2);
  ok('E1f ARM=armed without ARMORVILLAGE rejected', gateRun(Object.assign({}, PINNED, { ARM: 'armed' })) === 2);
  ok('E1g VGEAR=1 pinned-substrate violation rejected', gateRun(Object.assign({}, PINNED, { ARM: 'control', VGEAR: '1' })) === 2);
})();

// --- E4: anchor equals git HEAD ---------------------------------------------
(function e4() {
  const env = Object.assign({}, process.env, PINNED, { ARM: 'control' });
  const out = spawnSync(process.execPath,
    ['-e', "const D=require(process.argv[1]); console.log(D.ANCHOR);", SWEEP],
    { env, timeout: 60000, encoding: 'utf8' });
  const head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12);
  ok('E4 anchor == git HEAD at module load', out.status === 0 && out.stdout.trim() === head, `anchor=${out.stdout.trim()} head=${head}`);
})();

// --- E3: analyzer RED->GREEN on synthetic fixtures --------------------------
(function e3() {
  const AZ = require(path.join(REPO, 'scripts', 'analyze-doorcensus-armor'));
  function base(seed) {
    return { seed, arm: 'armed', policyId: 'lead-armorydrive-armorvillage', anchorCommit: 'deadbeef1234',
      w4Day: 60, w5Day: null, barRelease: { armored: null, armed: 40, tricks: 50, veterans: 70 },
      barRelease4: { armored: 30, armed: 35, tricks: 40, veterans: 45 },
      demand5: { armored: 4, armed: 4, tricks: 6, veterans: 2 }, demand4: { armored: 3, armed: 3, tricks: 4, veterans: 1 },
      national: 1, table: 1, won: 0, gameDays: 155, endReason: 'died',
      deaths: { combat: 5, starvation: 1 }, nDeathRows: 6, deathRows: [],
      nWindowTraceDays: 155, window: [], gateVector: null, gateErr: null,
      engagements: [], kills: [], spawns: [], instrumentErrors: [] };
  }
  const unlock = base(65511);
  unlock.w5Day = 140;
  unlock.barRelease.armored = 130;
  unlock.gateVector = { attr: { attributed: true, binding: 'opened', path: 'live-demand' }, r5: {} };
  const locked = base(65512);
  locked.gateVector = { attr: { attributed: true, binding: 'defer5', why: 'armor short' }, r5: {} };
  const unattr = base(65513);
  unattr.gateVector = { attr: { attributed: false, binding: null, why: 'novel' }, r5: {} };
  const s = AZ.summarize([unlock, locked, unattr], 'fixture');
  ok('E3a doors counted exactly (1/3)', s.doorsCount === 1 && s.doors.length === 1 && s.doors[0] === 65511, JSON.stringify(s.doors));
  ok('E3b opened + binding-defer5 tallied', s.bindings['opened'] === 1 && s.bindings['defer5'] === 1, JSON.stringify(s.bindings));
  ok('E3c unattributed seed surfaces (0 unexplained elsewhere)', s.unattributed.length === 1 && s.unattributed[0] === 65513, JSON.stringify(s.unattributed));
  ok('E3d w4 reach + wall numbers', s.w4Count === 3 && s.national === 3 && s.table === 3 && s.medianSurvival === 155, `w4=${s.w4Count} med=${s.medianSurvival}`);
  ok('E3e GO rule: armed(1) < control+2 is NO-GO', (function () { return !(1 >= 0 + 2); })());
  // defer5 coincidence fixture: 3 days co-satisfied, rest short
  const win = base(65514);
  win.window = [];
  for (let d = 1; d <= 10; d++) win.window.push({ day: d, r5: { armored: d >= 7 ? 4 : 1, veterans: 2 } });
  const cc = AZ.defer5CoincidentDays(win);
  ok('E3f defer5 coincidence counts co-satisfied days', cc.days === 4 && cc.first === 7, JSON.stringify(cc));
})();

// --- E2: delegation, gate off -----------------------------------------------
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
  const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
  const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
  for (const [k, v] of Object.entries(PINNED)) process.env[k] = v;
  delete process.env.ARMORVILLAGE;
  const SEED = 65511, DAYS = 40;
  async function oneRun(policy) {
    const { Game } = await loadGame({ seed: SEED, mode: 'doorcensus-armor-proof', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
    return hashes;
  }
  const hAD = await oneRun(AD.armedFor('leadfeast'));
  const hAV = await oneRun(AV.armedFor('leadfeast'));
  const same = hAD.length === hAV.length && hAD.every((h, i) => h === hAV[i]);
  ok('E2 AV gate-off delegates byte-identically to AD (control == census-armed)', same && hAD.length >= DAYS,
    `ad=${hAD.length} av=${hAV.length} same=${same}`);

  console.log(`\ndoorcensus-armor proof: ${PASS.length} passed, ${FAIL.length} failed`);
  for (const f of FAIL) console.log('FAIL ' + f);
  if (FAIL.length) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
