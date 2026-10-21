#!/usr/bin/env node
// test-w5drift-20261021.js — proof gates for the sim-w5drift drift bisect.
// All gates GREEN before the bisect sims.
//   E0: instrument export shape (WS.install + t contract)
//   E1: instrument non-perturbing (on vs off, 2 seeds x 60d, dayHash byte-identical)
//   E2: substrate env-gate asserted (7 vars = 1)
//   E3: E0 repro on current master — s64858/belongfeast census matches the
//       windowstay-r2 E0 drift anatomy within tolerance:
//       6 wave-3+ spawns / 0 cast-path w3+ / 0 scholar-TB-above-w2 / no w5 unlock
//   D2: full-horizon run completes + deterministic re-run (byte-identical census)
// Usage: node scripts/test-w5drift-20261021.js [GATES=E0,E1,E2,E3,D2]
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));

const GATES = (process.env.GATES || 'E0,E1,E2,E3,D2').split(',').map(s => s.trim());
const ENV_VARS = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC'];
const results = {};
let failures = 0;
function gate(name, ok, detail) {
  results[name] = ok ? 'GREEN' : 'RED';
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}
function blankT() {
  return {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
    deathRecs: [], fightStarts: [],
  };
}
async function runCensus(seed, policyId, days, withInstrument, hashOut) {
  const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
  const { Game } = await loadGame({ seed, mode: 'w5drift', fullTelemetry: false });
  const t = blankT();
  let uninstall = null;
  if (withInstrument) uninstall = WS.install(Game, t);
  await setupGame(Game);
  const policy = VCE.armedFor(policyId);
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      if (hashOut) hashOut.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 30 }));
  if (uninstall) try { uninstall(); } catch (e) {}
  const w3 = a => (a || []).filter(r => (r.wave | 0) >= 3);
  const spawns3 = w3(t.spawns);
  const eng3 = w3((t.engagements || []).filter(e => e.started));
  let w5day = null;
  for (const w of (t.window || [])) if (w.unlocked === 5 && w5day == null) w5day = w.day;
  return {
    census: {
      spawnsW3: spawns3.length,
      spawnsW3cast: spawns3.filter(s => s.src === 'cast').length,
      scholarTBW3: eng3.length,
      w5unlockDay: w5day,
      gameDays: result.gameDays, endReason: result.endReason,
      instrumentErrors: (t.instrumentErrors || []).length,
    },
    t,
  };
}

async function gateE0() {
  const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
  const keys = ['instrumentOn', 'install', 'installDeathCapture', 'classifyDeath', 'isPersonDeath', 'diedForReal', 'monsterNameSet', 'stateSnap', 'waveOf', 'gday'];
  const missing = keys.filter(k => typeof WS[k] !== 'function');
  const t = blankT();
  const tKeys = ['kills', 'engagements', 'fieldFights', 'spawns', 'tbOutcomes', 'census', 'dmg', 'instrumentErrors', 'window', 'deathRecs', 'fightStarts'];
  const tMissing = tKeys.filter(k => !(k in t));
  gate('E0', missing.length === 0 && tMissing.length === 0,
    `exports missing=[${missing.join(',')}] t-contract missing=[${tMissing.join(',')}]`);
}

async function gateE1() {
  // non-perturbing: instrument-on vs off, 2 seeds x 60d, dayHash byte-identical
  const seeds = [64858, 64703];
  let okAll = true, detail = [];
  for (const seed of seeds) {
    const hOn = [], hOff = [];
    await runCensus(seed, 'belongfeast', 60, true, hOn);
    await runCensus(seed, 'belongfeast', 60, false, hOff);
    const same = hOn.length === hOff.length && hOn.every((h, i) => h === hOff[i]);
    detail.push(`s${seed}:${same ? 'identical' : 'DIVERGED'}(${hOn.length}d)`);
    if (!same) okAll = false;
  }
  gate('E1', okAll, detail.join(' '));
}

async function gateE2() {
  const bad = ENV_VARS.filter(v => process.env[v] !== '1');
  gate('E2', bad.length === 0, bad.length ? 'missing=' + bad.join(',') : ENV_VARS.map(v => v + '=1').join(' '));
}

async function gateE3() {
  // reproduce the windowstay-r2 E0 drift-anatomy numbers on current master
  const { census } = await runCensus(64858, 'belongfeast', 180, true, null);
  const checks = [
    ['spawnsW3plus==6±1', Math.abs(census.spawnsW3 - 6) <= 1, census.spawnsW3],
    ['castW3plus==0', census.spawnsW3cast === 0, census.spawnsW3cast],
    ['scholarTBW3plus==0', census.scholarTBW3 === 0, census.scholarTBW3],
    ['no w5 unlock', census.w5unlockDay == null, census.w5unlockDay],
    ['0 instrumentErrors', census.instrumentErrors === 0, census.instrumentErrors],
  ];
  const bad = checks.filter(c => !c[1]);
  gate('E3', bad.length === 0, checks.map(c => `${c[0]}:${c[2]}`).join(' '));
}

async function gateD2() {
  const a = await runCensus(64858, 'belongfeast', 180, true, null);
  const b = await runCensus(64858, 'belongfeast', 180, true, null);
  const same = JSON.stringify(a.census) === JSON.stringify(b.census);
  gate('D2', same && a.census.gameDays > 90,
    `runs ${a.census.gameDays}d/${b.census.gameDays}d ${same ? 'byte-identical' : 'DIVERGED'}`);
}

async function main() {
  for (const g of ['E0', 'E1', 'E2', 'E3', 'D2']) {
    if (!GATES.includes(g)) { console.log('SKIP ' + g); continue; }
    if (g === 'E0') await gateE0();
    if (g === 'E1') await gateE1();
    if (g === 'E2') await gateE2();
    if (g === 'E3') await gateE3();
    if (g === 'D2') await gateD2();
  }
  console.log(failures === 0 ? 'ALL GATES GREEN' : `${failures} GATE(S) RED`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(2); });
