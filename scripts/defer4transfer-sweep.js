#!/usr/bin/env node
// defer4transfer-sweep.js — sim-defer4-transfer census (flesh-out loop arm
// sim-defer4-transfer, axis scale-onramp, run fleshout-20261023T2015Z).
//
// TRANSFER DIAG: does the landed VETFORMATION=1 layer (GO on the 68805-68814
// formation band: 10 vs 6 distinct wave-4+ killer vids) move the defer4
// veterans bar (1 living wave-3+ killer, NEVER released on 5/5 bound configs
// per sim-defer4gate) on the defer4-bound census band 65511-65522?
//
// 12 seeds x {leadfeast, belongfeast} x {control, formed} = 48 paired configs,
// 180d death-aware, pinned substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   control = AD.armedFor(base)   (VETFORMATION unset)
//   formed  = VF.formedFor(base), VETFORMATION=1 (the landed layer — DRIVEN,
//             not modified; its proof untouched)
//
// Instruments (all read-only, NEW namespace defer4transfer-*):
//   - scripts/w5gates-lib.js UNMODIFIED: G5.dailyGateTrace(G) on the daily
//     beat (w4Day, barRelease4), G5.gateVector(Game) + attribute() end-of-run.
//     The lib's header documents the DET gate (instrument-on vs
//     instrument-off byte-identical); the sweep is paired identical-seed.
//   - state.waveKillLog read DIRECTLY post-run (the source the veterans bar
//     reads — standing.js:278); dedup on (d,mid,by,via,trick) in the
//     analyzer per backlog #844.
//   - death rows from result.samples.deaths (lived-post-kill attribution).
//   - VF.tele() (formation engagement context).
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-defer4transfer/<arm>/s<seed>-<base>.json with
// sha256-after-write readback (the selective write-denial class is real).
// The per-seed anchorCommit field is the #793 check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   ARM=control SEEDS=65511,65512 node scripts/defer4transfer-sweep.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 \
//   ARM=formed SEEDS=65511,65512 node scripts/defer4transfer-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

// Pinned-substrate env guard (defer4transfer namespace). ONE DELTA ONLY:
// VETFORMATION=1 on the formed arm. The sibling arms' levers (ARMORVILLAGE,
// LINKFORM, FEASTDISC-*) are banned here.
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['VETREL', 'REPOSITION', 'VGEAR', 'FEASTDISC', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'ARMORVILLAGE', 'LINKFORM']) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, one delta only).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'control';
  if (ARM !== 'control' && ARM !== 'formed') { console.error('SWEEP STOP: ARM must be control|formed.'); process.exit(2); }
  if (ARM === 'formed' && process.env.VETFORMATION !== '1') { console.error('SWEEP STOP: VETFORMATION=1 required for ARM=formed.'); process.exit(2); }
  if (ARM === 'control' && process.env.VETFORMATION === '1') { console.error('SWEEP STOP: VETFORMATION must be unset for ARM=control.'); process.exit(2); }
  if (!VF.vfOn || typeof VF.vfOn !== 'function') { console.error('SWEEP STOP: VF.vfOn missing (vetformation layer not on master?).'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

// Seeds: the defer4-bound census band (sim-defer4gate corpus, 2026-10-23) —
// deliberate reuse: NEW policy×seed combo, formation never ran here.
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518, 65519, 65520, 65521, 65522]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-defer4transfer', ARM);
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}
function policyFor(base) {
  const nb = normBase(base);
  return ARM === 'formed' ? VF.formedFor(nb) : AD.armedFor(nb);
}
function policyTag(base) { return (base === 'belong' || base === 'belongfeast' ? 'belong' : 'lead') + (ARM === 'formed' ? '-vetformation' : ''); }
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}
function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'defer4transfer', fullTelemetry: false });
  const instrumentErrors = [];
  const gateTrace = [];
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = Object.assign({}, policy, {
    daily(G, ctx) {
      try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
      try { gateTrace.push(G5.dailyGateTrace(G)); } catch (e) { instrumentErrors.push('gateTrace: ' + String((e && e.message) || e)); }
      return oDaily(G, ctx);
    },
  });

  VF.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const vfTele = VF.tele();

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;

  // Wall numbers.
  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let winDay = null, winPath = null;
  try {
    if (Game.won) {
      winDay = gameDays;
      try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    }
  } catch (e) {}

  // Deaths (guardrails: starvation count, new death kinds; lived-post-kill
  // attribution via who/day).
  const deaths = {};
  let starvation = 0;
  const deathRows = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starvation++;
      deathRows.push({ day: d.day | 0, who: d.who || null, kind: d.kind || null, cause: k, player: !!d.player });
    }
  } catch (e) { instrumentErrors.push('deaths: ' + String((e && e.message) || e)); }

  // THE binding sensor: state.waveKillLog read DIRECTLY (the source the
  // veterans bar reads — standing.js:278). Raw entries; dedup on
  // (d,mid,by,via,trick) in the analyzer per backlog #844.
  let waveKillLog = [];
  let waveKillLogCapped = false;
  try {
    const log = (st.waveKillLog || []);
    waveKillLogCapped = log.length >= 1000;
    waveKillLog = log.map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, byName: nameOf(Game, e && e.by), via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  // w4 unlock day + defer4 bar release days from the daily trace.
  let w4Day = null;
  for (const t of gateTrace) { if (w4Day == null && (t.uw | 0) >= 4) w4Day = t.d | 0; }
  let demand4 = null;
  try {
    const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    demand4 = (sc && sc.readyDemand && sc.readyDemand[4]) || null;
  } catch (e) {}
  const barRelease4 = { armored: null, armed: null, tricks: null, veterans: null };
  if (demand4) {
    for (const t of gateTrace) {
      const b = t.r4 || {};
      if (barRelease4.armored == null && (b.armored | 0) >= (demand4.armored | 0)) barRelease4.armored = t.d | 0;
      if (barRelease4.armed == null && (b.armed | 0) >= (demand4.armed | 0)) barRelease4.armed = t.d | 0;
      if (barRelease4.tricks == null && (b.tricks | 0) >= (demand4.tricks | 0)) barRelease4.tricks = t.d | 0;
      if (barRelease4.veterans == null && (b.veterans | 0) >= (demand4.veterans | 0)) barRelease4.veterans = t.d | 0;
    }
  }

  // End-of-run gate vector + attribution (w5gates-lib UNMODIFIED).
  let gateVector = null, gateErr = null;
  try { gateVector = G5.gateVector(Game); } catch (e) { gateErr = String((e && e.message) || e); }

  const out = {
    seed, base: normBase(base), arm: ARM, policyId: tag,
    instrument: 'defer4transfer on w5gates-lib daily trace + direct waveKillLog read + VF tele',
    substrate: 'armorydrive pinned substrate — non-seat long substrate + ARMORYDRIVE=1 (BOTH arms); VETFORMATION=1 formed only (one delta)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1' + (ARM === 'formed' ? ' VETFORMATION=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, w4Day, barRelease4, demand4,
    national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, starvation, nDeathRows: deathRows.length, deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped, waveKillLog,
    nBearerDays: Object.keys(bearerByDay).length, bearerByDay,
    vfTele,
    nGateTraceDays: gateTrace.length, gateTrace,
    gateVector, gateErr,
    instrumentErrors,
  };
  const fn = path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`);
  const body = JSON.stringify(out, null, 1) + '\n';
  fs.writeFileSync(fn, body);
  // Hash-after-write readback (write-denial class): verify every write.
  const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
  const shaRead = crypto.createHash('sha256').update(fs.readFileSync(fn)).digest('hex');
  if (shaWrote !== shaRead) { console.error(`WRITE-DENIAL: hash mismatch after write for ${fn}`); process.exit(3); }
  const w3kills = waveKillLog.filter(e => e.w >= 3).length;
  const w3vids = new Set(waveKillLog.filter(e => e.w >= 3 && e.by).map(e => e.by)).size;
  return { seed, base: normBase(base), arm: ARM, w3kills, w3vids, w4Day, vetRelease: barRelease4.veterans, binding: (gateVector && gateVector.attr && gateVector.attr.binding) || null, days: result.days, gameDays, national, table, won };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const r = await oneRun(s, b);
      rows.push(r);
      console.log(JSON.stringify(r));
    }
  }
  console.log('DEFER4TRANSFER-SWEEP-DONE ' + JSON.stringify({ arm: ARM, seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
