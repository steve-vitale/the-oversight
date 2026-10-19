#!/usr/bin/env node
// vetarm-sweep-20261019.js — sim-vetarm PILOT sweep.
//
// 8 fresh seeds (63501-63508) x {lead,belong} = 16 runs per arm, 180d
// death-aware, on the pre-seat courtship substrate, with the KILLDISC
// read-only instrument (per-source tbDamage attribution on wave-3+
// monsters — the pilot primary's mechanism metric).
//
// ARMS (ARM env):
//   control — TF.leadfeast / TF.belongfeast (pure tribfloor base, VETARM unset)
//   vetarm  — VA.leadvetarm / VA.belongvetarm (VETARM=1)
//
// LAYER TELEMETRY: call-through observation wraps on Game.donateWeapon and
// Game.assignTask (counts only, zero state writes, zero RNG draws — the
// killdisc-proven pattern), plus end-of-run armory level and a companion
// arming census (weaponBonusOf per living villager).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-19/perseed-vetarm-pilot/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   ARM=vetarm SEEDS=63501,63502 node scripts/vetarm-sweep-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const FS = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));
// KILL-PROTOCOL: the vetarm layer was deleted after the pilot NO-GO. The
// sweep requires the layer; without it there is nothing to sweep.
let VA = null;
try { VA = require(path.join(REPO, 'scripts', 'policies', 'vetarm')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/vetarm.js deleted per kill protocol (sim-vetarm NO-GO) — sweep not applicable.');
  process.exit(0);
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'vetarm') { console.error('SWEEP STOP: ARM must be control|vetarm.'); process.exit(2); }
if (ARM === 'vetarm' && !VA.layerOn()) { console.error('SWEEP STOP: VETARM=1 required for ARM=vetarm.'); process.exit(2); }
if (ARM === 'control' && VA.layerOn()) { console.error('SWEEP STOP: VETARM must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63501, 63502, 63503, 63504, 63505, 63506, 63507, 63508]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-19', 'perseed-vetarm-pilot');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) {
  if (ARM === 'vetarm') return base === 'lead' ? VA.leadvetarm : VA.belongvetarm;
  return base === 'lead' ? FS.leadfeast : FS.belongfeast;
}
function policyTag(base) { return (ARM === 'vetarm' ? (base === 'lead' ? 'leadvetarm' : 'belongvetarm') : (base === 'lead' ? 'leadfeast' : 'belongfeast')); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// companion arming census: weaponBonusOf per living villager at end of run.
function armingCensus(Game) {
  const out = [];
  try {
    const g = (typeof globalThis !== 'undefined' ? globalThis : {}) || {};
    const Seq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
    if (!Seq || typeof Seq.weaponBonusOf !== 'function') return out;
    const v = Game.state.village || {};
    for (const rid of (v.roster || [])) {
      if (rid === Game.villagerId) continue;
      let p = null;
      try { p = Game.getPerson(rid); } catch (e) {}
      if (!p || p.dead) continue;
      let wb = 0;
      try { wb = Seq.weaponBonusOf(p, Game.data.items) || 0; } catch (e) {}
      out.push({ vid: rid, name: nameOf(Game, rid), wbonus: wb });
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'vetarm-pilot', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // LAYER TELEMETRY (call-through observation only — counts, no writes).
  const tele = { donations: 0, patrolAssigns: 0 };
  let uninstallTele = null;
  try {
    const oDon = Game.donateWeapon ? Game.donateWeapon.bind(Game) : null;
    const oAsg = Game.assignTask ? Game.assignTask.bind(Game) : null;
    if (oDon) Game.donateWeapon = function (...a) { try { tele.donations++; } catch (e) {} return oDon(...a); };
    if (oAsg) Game.assignTask = function (vid, task, opts) {
      try { if (task === 'patrol') tele.patrolAssigns++; } catch (e) {}
      return oAsg(vid, task, opts);
    };
    uninstallTele = () => {
      try { if (oDon) Game.donateWeapon = oDon; } catch (e) {}
      try { if (oAsg) Game.assignTask = oAsg; } catch (e) {}
    };
  } catch (e) {}

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstallKD(); } catch (e) {}
  try { if (uninstallTele) uninstallTele(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let armoryEnd = 0;
  try {
    const stw = Game.stashState ? Game.stashState() : null;
    armoryEnd = ((stw && stw.weapons) || []).reduce((tt, e) => tt + ((e && e.units) || 1), 0);
  } catch (e) {}

  // --- wave-3+ kills with damage tables (the pilot primary's mechanism) ---
  const kills3 = [];
  let dmgAttached = 0;
  for (const k of t.kills) {
    if ((k.wave | 0) < 3) continue;
    const shape = KD.classifyKill(k, k.ctx);
    const companion = !!(k.by && k.ctx && k.by !== k.ctx.scholarVid);
    if (k.dmg) dmgAttached++;
    const d = k.dmg || null;
    const tot = d ? (d.scholar + d.companion + d.other) : 0;
    kills3.push({
      d: k.day, mid: k.mid, w: k.wave, by: k.by, byName: nameOf(Game, k.by),
      via: k.via, pyrrhic: !!k.pyrrhic, shape, companion,
      dmg: d ? {
        scholar: d.scholar, companion: d.companion, other: d.other,
        compShare: tot > 0 ? +(d.companion / tot).toFixed(4) : null,
      } : null,
    });
  }
  kills3.sort((a, b) => a.d - b.d);

  // living veterans at end of run (confirm primary, reported for context)
  let livingVeterans = 0;
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
    livingVeterans = (r && r.veterans) | 0;
  } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  const census = armingCensus(Game);
  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc',
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, livingVeterans,
    days: result.days, gameDays, endReason: result.endReason,
    w3Kills: kills3.length,
    w3CompanionKills: kills3.filter(k => k.companion).length,
    dmgAttached,
    kills: kills3,
    engagements: t.engagements.length,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
    // layer telemetry
    donations: tele.donations, patrolAssigns: tele.patrolAssigns, armoryEnd,
    armingCensus: census,
    armedCompanions: census.filter(c => c.wbonus >= 12).length,
    medianCompanionWbonus: (() => {
      const ws = census.map(c => c.wbonus).sort((a, b) => a - b);
      return ws.length ? ws[Math.floor(ws.length / 2)] : 0;
    })(),
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`done ${r.policy} s${seed}: w3=${r.w3Kills} compK=${r.w3CompanionKills} don=${r.donations} patrol=${r.patrolAssigns} armory=${r.armoryEnd} armedComp=${r.armedCompanions}/${r.armingCensus.length} medWb=${r.medianCompanionWbonus} errs=${r.instrumentErrors.length}`);
      } catch (e) {
        console.error(`ERROR ${base} s${seed}: ${e && e.message}`);
        rows.push({ seed, policy: policyTag(base), arm: ARM, error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const summary = {
    arm: ARM, n: ok.length, errors: rows.length - ok.length,
    totalW3Kills: ok.reduce((a, r) => a + r.w3Kills, 0),
    totalCompanionKills: ok.reduce((a, r) => a + r.w3CompanionKills, 0),
    dmgAttached: ok.reduce((a, r) => a + r.dmgAttached, 0),
    donations: ok.reduce((a, r) => a + r.donations, 0),
    patrolAssigns: ok.reduce((a, r) => a + r.patrolAssigns, 0),
    livingVeterans: ok.reduce((a, r) => a + r.livingVeterans, 0),
    wave4: ok.filter(r => r.wave4).length,
    national: ok.filter(r => r.national).length,
  };
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
