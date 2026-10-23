#!/usr/bin/env node
// vetrestage-sweep.js — POST-KILL RETENTION lever census (flesh-out loop
// arm sim-vetrestage, axis scale-onramp, run fleshout-20261023T1215Z).
// Policy-side, ZERO src/js changes. Namespace vetrestage.
//
// THE SURFACE (sim-vetkill-autopsy DIAG): the defer5 bar demands 2 LIVING
// wave-4+ killers; the killers EXIST then DIE — 8/10 killer vids died 1–8d
// AFTER their kills (mean ~6d) in attritional combat (5 aid-crisis raids,
// 2 haven fights), 0 in the wave-4 fight. This arm attacks post-kill
// attrition with a 14-day named-veteran protection window (shelter when
// hurt, triage priority, escort pairing) via scripts/policies/
// vetrestage.js (VETRESTAGE=1, default-off).
//
// Design: 8 seeds (65511–65518) x {lead, belong} x {control, armed} = 32
// configs, 180d death-aware, paired identical seeds. Pinned substrate on
// BOTH arms (the autopsy corpus — comparable):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   control = VS.substrateFor (armorydrive stack, VETRESTAGE unset)
//   armed   = VS.armedFor (same stack + VETRESTAGE=1)
//
// Sensors (retained per seed):
//   (1) state.waveKillLog read DIRECTLY post-run (the SOURCE the veterans
//       bar reads — standing.js; the killdisc t.kills wrapper missed these
//       in w5door-b, so the direct read is the method, per the autopsy).
//   (2) per-villager death rows via the windowstay death-capture layer
//       (lesson #760 shape) — killer vid -> death cause/day is a direct
//       join on vid.
//   (3) the retention trace (ctx.vsTrace) + counters — the engagement
//       instrument proving retention actions fired (shelter/heal/shield/
//       escort within 14d post-kill).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-vetrestage/<arm>-<policytag>-s<seed>.json.
// The per-seed anchorCommit field is the #793 check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 \
//   VSRET=1 POLICY=lead SEEDS=65511,65512 node scripts/vetrestage-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VS = require(path.join(REPO, 'scripts', 'policies', 'vetrestage'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

// Pinned-substrate env guard (vetrestage namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE', 'VETBENCH', 'SCHOLARDIST']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const POLICY = process.env.POLICY || 'lead';
  if (POLICY !== 'lead' && POLICY !== 'belong') { console.error('SWEEP STOP: POLICY must be lead|belong.'); process.exit(2); }
  const VSRET = process.env.VSRET || '0';
  if (VSRET !== '0' && VSRET !== '1') { console.error('SWEEP STOP: VSRET must be 0|1.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return { POLICY, VSRET };
}
const { POLICY, VSRET } = checkEnv();
process.env.VETRESTAGE = VSRET; // the lever's own gate, set by the sweep

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetrestage');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const ARM = VSRET === '1' ? 'armed' : 'control';
function policyFor() {
  const base = POLICY === 'belong' ? 'belongfeast' : 'leadfeast';
  return VSRET === '1' ? VS.armedFor(base) : VS.substrateFor(base);
}
function fileTag() {
  const tag = POLICY === 'belong' ? 'belongfeast' : 'leadfeast';
  return `${ARM}-${tag}${VSRET === '1' ? '-vetrestage' : ''}`;
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'vetrestage', fullTelemetry: false });
  const t = { window: [], deathRecs: [], fightStarts: [], instrumentErrors: [] };
  const uninstall = WS.install(Game, t);

  await setupGame(Game);
  const hashes = [];
  let capturedCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      capturedCtx = ctx;
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  let winDay = null, winPath = null;
  try {
    if (Game.won) {
      winDay = gday(Game);
      try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    }
  } catch (e) {}
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};

  // (1) waveKillLog read DIRECTLY — the autopsy method.
  let waveKillLog = [];
  let waveKillLogCapped = false;
  try {
    const log = (st.waveKillLog || []);
    waveKillLogCapped = log.length >= 1000;
    waveKillLog = log.map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}

  // (2) Death rows (lesson #760 autopsy grade).
  let liveDeaths = [];
  try { liveDeaths = (result.samples && result.samples.deaths) || []; } catch (e) {}
  const liveByKey = {};
  for (const d of liveDeaths) {
    const k = [(d.day | 0), String(d.who || ''), String(d.cause || '')].join('|');
    if (!(k in liveByKey)) liveByKey[k] = !!d.player;
  }
  const deathRows = t.deathRecs.map(rec => {
    let real = null;
    try { real = WS.diedForReal(Game, rec.who); } catch (e) {}
    const k = [(rec.day | 0), String(rec.who || ''), String(rec.cause || '')].join('|');
    const repaired = (k in liveByKey) ? liveByKey[k] : null;
    let channel = 'other', why = '';
    try {
      const monsterNames = WS.monsterNameSet(Game);
      const cls = WS.classifyDeath(rec.cause, rec.ctx, monsterNames);
      channel = cls[0]; why = cls[1];
    } catch (e) {}
    return {
      day: rec.day, who: rec.who, kind: rec.kind, cause: rec.cause,
      player: rec.player, playerRepaired: repaired, real,
      channel, channelWhy: why, wave: rec.wave,
    };
  });

  // (3) The retention trace + counters (the engagement instrument).
  let vsTrace = [], vsCounters = {};
  try {
    vsTrace = (capturedCtx && capturedCtx.vsTrace) || [];
    for (const k of ['vsShelters', 'vsHeals', 'vsShielded', 'vsEscorts']) {
      vsCounters[k] = (capturedCtx && capturedCtx[k]) || 0;
    }
  } catch (e) { t.instrumentErrors.push('vsTrace.read: ' + String((e && e.message) || e)); }

  // Wall numbers.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const out = {
    seed, arm: ARM, policyId: fileTag(),
    instrument: 'windowstay-window-layer+death-capture + direct waveKillLog read + vetrestage trace',
    substrate: (VSRET === '1' ? 'VS.armedFor' : 'VS.substrateFor') + '(' + (POLICY === 'belong' ? 'belongfeast' : 'leadfeast') + ') — non-seat long substrate + ARMORYDRIVE=1',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1' + (VSRET === '1' ? ' VETRESTAGE=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, nDeathRows: deathRows.length,
    deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped,
    waveKillLog,
    vsTrace, vsCounters,
    nWindowTraceDays: t.window.length,
    window: t.window,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  fs.writeFileSync(path.join(EVID, `${fileTag()}-s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return {
    seed, arm: ARM, policy: POLICY,
    w4kills: waveKillLog.filter(e => e.w >= 4).length,
    vsActions: vsTrace.length, deaths: deathRows.length, days: result.days,
  };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    const r = await oneRun(s);
    rows.push(r);
    console.log(JSON.stringify(r));
  }
  console.log('VETRESTAGE-SWEEP-DONE ' + JSON.stringify({ arm: ARM, policy: POLICY, seeds: SEEDS, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
