#!/usr/bin/env node
// armory-sweep-20261019.js — sim-armory PILOT sweep.
//
// 8 fresh seeds (63511-63518, verified filename-unused in
// evidence/2026-10-19/perseed-*/ before the sweep) x {lead,belong} = 16
// runs per arm, 180d death-aware, on the pre-seat courtship substrate, with
// the KILLDISC read-only instrument (per-source tbDamage attribution on
// wave-3+ monsters — the pilot primary's mechanism metric).
//
// ARMS (ARM env):
//   control — TF.leadfeast / TF.belongfeast (pure tribfloor base, ARMORY unset)
//   armed   — AR.leadarmory / AR.belongarmory (ARMORY=1)
//
// LAYER TELEMETRY: call-through observation wrap on Game.donateWeapon
// (counts only, zero state writes, zero RNG draws — the killdisc-proven
// pattern), plus end-of-run armory level and a companion arming census
// (weaponBonusOf per living villager). NO assignTask wrap needed: the
// layer never calls it (proof A10), and any call would be a loud failure,
// not telemetry.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-19/perseed-armory-pilot/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   ARM=armed SEEDS=63511,63512 node scripts/armory-sweep-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
// KILL-PROTOCOL: the armory layer was deleted after the pilot NO-GO. The
// sweep requires the layer; without it there is nothing to sweep.
let AR = null;
try { AR = require(path.join(REPO, 'scripts', 'policies', 'armory')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/armory.js deleted per kill protocol (sim-armory NO-GO) — sweep not applicable.');
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
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
if (ARM === 'armed' && !AR.layerOn()) { console.error('SWEEP STOP: ARMORY=1 required for ARM=armed.'); process.exit(2); }
if (ARM === 'control' && AR.layerOn()) { console.error('SWEEP STOP: ARMORY must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63511, 63512, 63513, 63514, 63515, 63516, 63517, 63518]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-19', 'perseed-armory-pilot');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// writeFileFlap: the host flaps EPERM on node writes in ~10-15 min windows
// (AGENTS.md 2026-10-18; sim-armory 2026-10-19 lost 4 sweep runs to it).
// Retry EPERM-only with 60s backoff, up to 15 tries (~15 min); any other
// error throws immediately. This is environment hardening — it changes no
// data, only outlasts the flap.
function writeFileFlap(fp, data) {
  const t0 = Date.now();
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      const eperm = e && (e.code === 'EPERM' || /EPERM/.test(String(e.message)));
      if (!eperm || i >= 15) throw e;
      const waitMs = 60000;
      console.error(`FLAP: EPERM writing ${path.basename(fp)} (try ${i + 1}/15) — sleeping 60s`);
      execSync(`sleep ${waitMs / 1000}`, { stdio: 'ignore' });
    }
  }
}

function policyFor(base) {
  if (ARM === 'armed') return base === 'lead' ? AR.leadarmory : AR.belongarmory;
  return base === 'lead' ? TF.leadfeast : TF.belongfeast;
}
function policyTag(base) { return (ARM === 'armed' ? (base === 'lead' ? 'leadarmory' : 'belongarmory') : (base === 'lead' ? 'leadfeast' : 'belongfeast')); }

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
  const { Game } = await loadGame({ seed, mode: 'armory-pilot', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // LAYER TELEMETRY (call-through observation only — counts, no writes).
  const tele = { donations: 0 };
  let uninstallTele = null;
  try {
    const oDon = Game.donateWeapon ? Game.donateWeapon.bind(Game) : null;
    if (oDon) Game.donateWeapon = function (...a) { try { tele.donations++; } catch (e) {} return oDon(...a); };
    uninstallTele = () => { try { if (oDon) Game.donateWeapon = oDon; } catch (e) {} };
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
  let playerDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (dd && dd.kind === 'person') playerDeaths++;
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
    deathCauses, playerDeaths,
    // layer telemetry
    donations: tele.donations, armoryEnd,
    armingCensus: census,
    armedCompanions: census.filter(c => c.wbonus >= 12).length,
    medianCompanionWbonus: (() => {
      const ws = census.map(c => c.wbonus).sort((a, b) => a - b);
      return ws.length ? ws[Math.floor(ws.length / 2)] : 0;
    })(),
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`done ${r.policy} s${seed}: w3=${r.w3Kills} compK=${r.w3CompanionKills} don=${r.donations} armory=${r.armoryEnd} armedComp=${r.armedCompanions}/${r.armingCensus.length} medWb=${r.medianCompanionWbonus} errs=${r.instrumentErrors.length}`);
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
    livingVeterans: ok.reduce((a, r) => a + r.livingVeterans, 0),
    wave4: ok.filter(r => r.wave4).length,
    national: ok.filter(r => r.national).length,
  };
  writeFileFlap(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
