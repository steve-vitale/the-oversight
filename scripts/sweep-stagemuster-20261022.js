#!/usr/bin/env node
// sweep-stagemuster-20261022.js — sim-stagemuster PILOT sweep.
//
// 8 FRESH seeds (65531-65538, filename-verified 2026-10-22) x
// {leadfeast, belongfeast} x {control, stagemuster} = 32 configs,
// 180d death-aware, paired identical seeds, on the proven non-seat long
// substrate (the sim-armorydrive pilot/confirm substrate:
// FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1; VETREL/REPOSITION/VGEAR unset):
//
//   control    = AD.armedFor(base), ARMORYDRIVE=1 (weapons in hands +
//                fire-side staging — the proven baseline)
//   stagemuster = SM.stagedFor(base), ARMORYDRIVE=1 + STAGEMUSTER=1
//                (muster/patrol redesign outside the armorydrive stack)
//
// Composition honesty pinned by scripts/test-stagemuster-20261022.js
// (ALL GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (read-only per-source tbDamage attribution
// on wave-3+ monsters + daily readiness census + startCombat engagement
// census) + daily w5-readiness sample + stagemuster layer counters
// (SM.tele) + daily bearer <redacted> (kill-time attribution — the scholar
// is a role, not a person; sim-killtime MANDATORY) + per-fight staged-
// companion census (SM.stagedCompanionsOf in a startCombat after-hook —
// the splitkill engagedCompanions() logic, per wave-4 TB fight).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-stagemuster/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   ARM=control SEEDS=65531,65532 node scripts/sweep-stagemuster-20261022.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 STAGEMUSTER=1 \
//   ARM=stagemuster SEEDS=65531,65532 node scripts/sweep-stagemuster-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const SM = require(path.join(REPO, 'scripts', 'policies', 'stagemuster'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// NON-SEAT LONG SUBSTRATE guard (the sim-armorydrive substrate).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION', 'VGEAR']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'stagemuster') { console.error('SWEEP STOP: ARM must be control|stagemuster.'); process.exit(2); }
if (ARM === 'stagemuster' && !SM.stagemusterOn()) { console.error('SWEEP STOP: STAGEMUSTER=1 required for ARM=stagemuster.'); process.exit(2); }
if (ARM === 'control' && SM.stagemusterOn()) { console.error('SWEEP STOP: STAGEMUSTER must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65531, 65532, 65533, 65534, 65535, 65536, 65537, 65538]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-stagemuster');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`); process.exit(2);
}
function policyFor(base) {
  const nb = normBase(base);
  return ARM === 'stagemuster' ? SM.stagedFor(nb) : AD.armedFor(nb);
}
function policyTag(base) { return normBase(base) + (ARM === 'stagemuster' ? '-stagemuster' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function waveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'stagemuster-pilot', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Per-fight staged-companion census: wrap startCombat AFTER the killdisc
  // wrap (chained). After the call returns, Game.tbfight.fighters includes
  // the engine-joined companions — SM.stagedCompanionsOf reads them.
  const stagedFights = [];
  let uninstallStaged = null;
  try {
    const oSC = Game.startCombat ? Game.startCombat.bind(Game) : null;
    if (oSC) {
      Game.startCombat = function (...a) {
        const r = oSC(...a);
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const mid = a[0] || (Game.pendingMonsterId || 'bulldozer');
            const staged = SM.stagedCompanionsOf(Game);
            stagedFights.push({
              day: ((Game.state || {}).scholar || {}).day || 0,
              mid, wave: waveOf(Game, mid),
              nStaged: staged.length,
              stagedVids: staged.map(c => c.villagerId),
            });
          }
        } catch (e) { t.instrumentErrors.push('stagedCensus: ' + String((e && e.message) || e)); }
        return r;
      };
      uninstallStaged = () => { try { Game.startCombat = oSC; } catch (e) {} };
    }
  } catch (e) {}

  // Daily w5-readiness sample (call-through, pure reads).
  const w5census = [];
  let uninstallW5 = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          w5census.push({ day: ((Game.state || {}).scholar || {}).day || 0,
            veterans: r ? (r.veterans | 0) : null, short: r ? (r.short || []).slice() : null });
        } catch (e) { t.instrumentErrors.push('w5census: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallW5 = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  // Bearer-by-day for kill-time attribution + last policy ctx (sm counters).
  let lastCtx = null;
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  SM.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const smTele = SM.tele();
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
  try { if (uninstallStaged) uninstallStaged(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Kill-time + damage-majority attribution (sim-killtime MANDATORY):
  // villager kill = w=4, by != bearer-on-that-day, by != 'player'.
  // damage-majority = >=50% of the kill's fight damage from non-scholar sources.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  const w4villagersDmgMaj = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    const isScholar = (e.by === bearerAtKill || e.by === 'player');
    if (isScholar) w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  // KILLDISC-attributed wave-4 kills (damage by source).
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
      if (killTimeVillager && dmgMaj && k.by) w4villagersDmgMaj.add(k.by);
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        bearerAtKill, killTimeVillager: !!killTimeVillager,
        dmgScholar: sD, dmgCompanion: cD, dmgOther: oD,
        nonScholarShare: Math.round(nonScholarShare * 100) / 100, dmgMaj,
      });
    }
  } catch (e) {}

  // Scholar-fight mortality watch: scholar deaths with a combat cause.
  let scholarCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      if (dd.player && /combat|fight|monster|wound|bleed|titan/i.test(String(dd.cause || ''))) scholarCombatDeaths++;
    }
  } catch (e) {}

  // Wave-4 engagement events (killdisc v2 startCombat census) + the
  // per-fight staged-companion census (SM.stagedCompanionsOf).
  let w4EngageEvents = 0;
  try {
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4 || !g.started || (g.partySize | 0) < 1) continue;
      w4EngageEvents++;
    }
  } catch (e) {}
  const w4StagedFights = stagedFights.filter(f => (f.wave | 0) === 4 && (f.nStaged | 0) >= 1);
  const w4TbFights = stagedFights.filter(f => (f.wave | 0) === 4);

  let w5vetsEnd = 0;
  try { const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; w5vetsEnd = (r && r.veterans) | 0; } catch (e) {}
  let w5vetsMax = w5vetsEnd;
  try { for (const c of w5census) if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0; } catch (e) {}

  const deathCauses = {};
  let villagerCombatDeaths = 0, starvationDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (/starv/i.test(c)) starvationDeaths++;
      if (!dd.player && /combat|fight|monster|wound|bleed|titan/i.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  const smCtx = {};
  try {
    for (const k of Object.keys(lastCtx || {})) if (/^sm[A-Z]/.test(k)) smCtx[k] = lastCtx[k];
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+w5census+smtele+killtime-bearer+stagedcensus',
    substrate: 'non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1; VETREL/REPOSITION/VGEAR unset) + ARMORYDRIVE=1' + (ARM === 'stagemuster' ? ' + STAGEMUSTER=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    w4distinctVillagersDmgMaj: [...w4villagersDmgMaj].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4VillagersDmgMaj: w4villagersDmgMaj.size,
    w4scholarKills, scholarCombatDeaths,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, bearerAtKill: bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid })),
    w4killRows,
    w4EngageEvents,
    nW4TbFights: w4TbFights.length,
    nW4StagedFights: w4StagedFights.length,
    w4StagedRows: w4StagedFights.map(f => ({ day: f.day, mid: f.mid, nStaged: f.nStaged, staged: (f.stagedVids || []).map(v => nameOf(Game, v)) })),
    deathCauses, villagerCombatDeaths, starvationDeaths,
    smTele, smCtx,
    instrumentErrors: t.instrumentErrors,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out) + '\n');
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const r = await oneRun(seed, base);
      rows.push(r);
      console.log(`done ${r.policy} s${seed}: wave5=${r.wave5} w4=${r.w4kills} villW4=${r.nW4Villagers} villW4dm=${r.nW4VillagersDmgMaj} schW4=${r.w4scholarKills} schCombatDeaths=${r.scholarCombatDeaths} staged4=${r.nW4StagedFights}/${r.nW4TbFights} engage4=${r.w4EngageEvents} w5vets=${r.w5vetsEnd}/${r.w5vetsMax} errs=${r.instrumentErrors.length} end=${r.endReason} won=${r.won}`);
    }
  }
  const tot = k => rows.reduce((t, r) => t + ((r[k] | 0) || 0), 0);
  console.log(`ARM=${ARM} n=${rows.length} w4kills=${tot('w4kills')} staged4=${tot('nW4StagedFights')}/${tot('nW4TbFights')} villW4seeds=${rows.filter(r => r.nW4Villagers >= 1).length} won=${tot('won')} national=${tot('national')}`);
}

main().catch(e => { console.error('SWEEP FAIL:', e && e.stack || e); process.exit(1); });
