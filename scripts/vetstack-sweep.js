#!/usr/bin/env node
// vetstack-sweep.js — sim-vetstack census (flesh-out loop arm sim-vetstack,
// axis scale-onramp, run fleshout-20261023T1515Z). The COMPOSITION arm:
// VETFORMATION=1 + VETRETENTION=1 stacked on the formation seed band.
//
// 8 seeds (68805,68806,68807,68808,68809,68810,68812,68814) x
// {leadfeast, belongfeast} x {control, stack} = 32 paired configs, 180d
// death-aware, pinned substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   control = AD.armedFor(base)            (gates unset)
//   stack   = VR.withVetRetention(VF.formedFor(base))   (VETFORMATION=1 +
//             VETRETENTION=1; retention OUTSIDE formation OUTSIDE
//             armorydrive; zero src/js)
//
// DEPENDENCY (sweep-only): scripts/policies/vetretention.js is copied from
// branch sim-vetretention for this sweep and deleted before any commit.
// This branch must contain ZERO policy edits (instrument/evidence only).
//
// Instruments (all read-only):
//   - KILLDISC v2 (scripts/killdisc-instrument-20261021)
//   - state.waveKillLog read DIRECTLY post-run (the SOURCE the veterans
//     bar reads — standing.js:278; the binding PRIMARY sensor, autopsy
//     method). living join against deathRows.who offline (the analyzer).
//   - daily bearer <redacted> (kill-time attribution — sim-killtime MANDATORY)
//   - ctx.vfW4FightRows (formation engagement trace) + ctx.vrTrace
//     (retention engagement trace)
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-vetstack/<arm>/s<seed>-<base>.json.
// The per-seed anchorCommit field is the #793 check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   ARM=control SEEDS=68805,68806 node scripts/vetstack-sweep.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 VETRETENTION=1 \
//   ARM=stack SEEDS=68805,68806 node scripts/vetstack-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
let VR = null;
try { VR = require(path.join(REPO, 'scripts', 'policies', 'vetretention')); }
catch (e) { /* dependency check below names the failure */ }
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// Pinned-substrate env guard (vetstack namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['VETREL', 'REPOSITION', 'VGEAR', 'FEASTDISC', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'VETSHAPE']) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'control';
  if (ARM !== 'control' && ARM !== 'stack') { console.error('SWEEP STOP: ARM must be control|stack.'); process.exit(2); }
  if (ARM === 'stack') {
    if (process.env.VETFORMATION !== '1') { console.error('SWEEP STOP: VETFORMATION=1 required for ARM=stack.'); process.exit(2); }
    if (process.env.VETRETENTION !== '1') { console.error('SWEEP STOP: VETRETENTION=1 required for ARM=stack.'); process.exit(2); }
    if (!VR) { console.error('SWEEP STOP: scripts/policies/vetretention.js missing — the sweep-only dependency (git show sim-vetretention:scripts/policies/vetretention.js). FAIL LOUDLY.'); process.exit(2); }
  }
  if (ARM === 'control' && (process.env.VETFORMATION === '1' || process.env.VETRETENTION === '1')) { console.error('SWEEP STOP: VETFORMATION/VETRETENTION must be unset for ARM=control.'); process.exit(2); }
  if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [68805, 68806, 68807, 68808, 68809, 68810, 68812, 68814]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetstack', ARM);
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}

// The composition: retention OUTSIDE formation OUTSIDE armorydrive.
function stackFor(base) {
  const nb = normBase(base);
  const tag = nb === 'leadfeast' ? 'lead' : 'belong';
  return VR.withVetRetention(VF.formedFor(nb),
    `${tag}-vetstack`,
    `${nb} + win-side layers, seat OFF (SEATDRIVE=0) + ARMORYDRIVE (ARMORYDRIVE=1) + VETFORMATION=1 (kill-formation, outside armorydrive) + VETRETENTION=1 (14d blooded protection, outside formation)`);
}
function controlFor(base) { return AD.armedFor(normBase(base)); }

function policyFor(base) {
  return ARM === 'stack' ? stackFor(base) : controlFor(base);
}
function policyTag(base) { return (base === 'belong' || base === 'belongfeast' ? 'belong' : 'lead') + (ARM === 'stack' ? '-vetstack' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'vetstack', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  let lastCtx = null;
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = Object.assign({}, policy, {
    daily(G, ctx) {
      lastCtx = ctx;
      try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
      return oDaily(G, ctx);
    },
  });

  VF.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const vfTele = VF.tele();
  try { uninstallKD(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
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
  } catch (e) {}

  // THE binding sensor: state.waveKillLog read DIRECTLY (the source the
  // veterans bar reads — standing.js:278), autopsy method. Living join
  // against deathRows.who happens offline in the analyzer.
  let waveKillLog = [];
  let waveKillLogCapped = false;
  try {
    const log = (st.waveKillLog || []);
    waveKillLogCapped = log.length >= 1000;
    waveKillLog = log.map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, byName: nameOf(Game, e && e.by), via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  // Damage-majority diagnosis (the feastdisc-confirm convention).
  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      const d = k.dmg || {};
      const sD = Math.round(d.scholar || 0), cD = Math.round(d.companion || 0), oD = Math.round(d.other || 0);
      const tot = sD + cD + oD;
      const nonScholarShare = tot > 0 ? (cD + oD) / tot : 0;
      const dmgMaj = nonScholarShare >= 0.5;
      const bearerAtKill = bearerByDay[k.day] != null ? bearerByDay[k.day] : scholarVid;
      const killTimeVillager = k.by && k.by !== bearerAtKill && k.by !== 'player';
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        bearerAtKill, killTimeVillager: !!killTimeVillager,
        dmgScholar: sD, dmgCompanion: cD, dmgOther: oD,
        nonScholarShare: Math.round(nonScholarShare * 100) / 100, dmgMaj,
      });
    }
  } catch (e) { t.instrumentErrors.push('w4killRows: ' + String((e && e.message) || e)); }

  // Engagement traces (formation fight trace + retention action trace).
  let vfW4FightRows = [], vrTrace = [];
  try { vfW4FightRows = ((lastCtx && lastCtx.vfW4FightRows) || []).map(r => Object.assign({}, r)); } catch (e) {}
  try { vrTrace = ((lastCtx && lastCtx.vrTrace) || []).map(r => Object.assign({}, r)); } catch (e) {}

  const out = {
    seed, base: normBase(base), arm: ARM, policyId: tag,
    instrument: 'vetstack on KILLDISC-v2 + bearer <redacted> + direct waveKillLog read + VF fight trace + VR retention trace',
    substrate: 'armorydrive pinned substrate — non-seat long substrate + ARMORYDRIVE=1 (BOTH arms); VETFORMATION=1 + VETRETENTION=1 (stack only; retention OUTSIDE formation OUTSIDE armorydrive)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1' + (ARM === 'stack' ? ' VETFORMATION=1 VETRETENTION=1' : ''),
    retentionDependency: 'scripts/policies/vetretention.js sweep-only from branch sim-vetretention (deleted before commit)',
    anchorCommit: ANCHOR,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, starvation, nDeathRows: deathRows.length, deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped, waveKillLog,
    nW4KillRows: w4killRows.length, w4killRows,
    nBearerDays: Object.keys(bearerByDay).length,
    vfTele,
    nVfW4FightRows: vfW4FightRows.length, vfW4FightRows,
    nVrTrace: vrTrace.length, vrTrace,
    instrumentErrors: t.instrumentErrors,
  };
  fs.writeFileSync(path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`), JSON.stringify(out, null, 1) + '\n');
  const w4kills = waveKillLog.filter(e => e.w >= 4).length;
  const w4vids = new Set(waveKillLog.filter(e => e.w >= 4 && e.by).map(e => e.by)).size;
  return { seed, base: normBase(base), arm: ARM, w4kills, w4vids, nVrTrace: vrTrace.length, days: result.days, gameDays, national, table, won };
}

if (require.main === module) {
(async () => {
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const r = await oneRun(s, b);
      rows.push(r);
      console.log(JSON.stringify(r));
    }
  }
  console.log('VETSTACK-SWEEP-DONE ' + JSON.stringify({ arm: ARM, seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}

module.exports = { stackFor, controlFor, normBase };
