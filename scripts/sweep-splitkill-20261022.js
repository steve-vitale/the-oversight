#!/usr/bin/env node
// sweep-splitkill-20261022.js — sim-splitkill PILOT sweep.
//
// 8 FRESH seeds (65501-65508) x {leadfeast, belongfeast} x {control,
// splitkill} = 32 configs, 180d death-aware, paired identical seeds, on
// the proven pre-seat substrate (the sim-villagergear pilot substrate:
// FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
// WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1; VETREL/REPOSITION/
// VGEAR unset — the substrate where the veteran channel was proven
// 3/8 vs 0/8, and where finding #714 says the bar must be attacked):
//
//   control   = stackFor(base): the w5doormeasure stack (vetrel/
//               reposition inert via env, seatdrive pure delegation)
//   splitkill = SK.withSplitkill(stackFor(base)): SPLITKILL=1 OUTSIDE
//               the same stack
//
// Composition honesty pinned by scripts/test-splitkill-20261022.js (all
// gates GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (scripts/killdisc-instrument-20261021.js —
// read-only per-source tbDamage attribution on wave-3+ monsters + daily
// readiness census + startCombat engagement census) + a call-through
// daily w5-readiness sample + splitkill layer counters (SK.tele) +
// daily bearer <redacted> (kill-time attribution — the scholar is a role,
// not a person; sim-killtime MANDATORY).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-splitkill/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   ARM=control SEEDS=65501,65502 node scripts/sweep-splitkill-20261022.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   SPLITKILL=1 ARM=splitkill SEEDS=65501,65502 node scripts/sweep-splitkill-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const SK = require(path.join(REPO, 'scripts', 'policies', 'splitkill'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// PRE-SEAT SUBSTRATE guard (the sim-villagergear pilot substrate; KILLDISC v2).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pre-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION', 'VGEAR']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pre-seat substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'splitkill') { console.error('SWEEP STOP: ARM must be control|splitkill.'); process.exit(2); }
if (ARM === 'splitkill' && !SK.splitkillOn()) { console.error('SWEEP STOP: SPLITKILL=1 required for ARM=splitkill.'); process.exit(2); }
if (ARM === 'control' && SK.splitkillOn()) { console.error('SWEEP STOP: SPLITKILL must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65501, 65502, 65503, 65504, 65505, 65506, 65507, 65508]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-splitkill');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-seatdrive', tag + ' seatdrive');
  if (ARM === 'splitkill') return SK.withSplitkill(s, tag + '-splitkill', tag + ' + splitkill');
  return s;
}
function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`); process.exit(2);
}
function policyFor(base) { const t = normBase(base); return stackFor(t === 'leadfeast' ? TF.leadfeast : TF.belongfeast, t); }
function policyTag(base) { return normBase(base) + (ARM === 'splitkill' ? '-splitkill' : ''); }

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
  const { Game } = await loadGame({ seed, mode: 'splitkill-pilot', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

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

  // Bearer-by-day for kill-time attribution + last policy ctx (sk counters).
  let lastCtx = null;
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  SK.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const skTele = SK.tele();
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
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

  // PRIMARY judge line, KILL-TIME attributed (sim-killtime MANDATORY):
  // villager kill = w=4, by != bearer-on-that-day, by != 'player';
  // scholar kill = by == bearer-on-that-day or by == 'player'.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    if (e.by === bearerAtKill || e.by === 'player') w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  // Scholar-fight mortality watch: scholar deaths with a combat cause.
  let scholarCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      if (dd.player && /combat|fight|monster|wound|bleed|titan/i.test(String(dd.cause || ''))) scholarCombatDeaths++;
    }
  } catch (e) {}

  // Wave-4 engagement events (killdisc v2 startCombat census, titan-split
  // per #749: herald solo entries never start a TB fight; count only
  // started engagements with staged companions).
  let w4EngageEvents = 0;
  try {
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4 || !g.started || (g.partySize | 0) < 1) continue;
      w4EngageEvents++;
    }
  } catch (e) {}

  // KILLDISC-attributed wave-4 kills (damage by source).
  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        dmgScholar: k.dmg ? Math.round(k.dmg.scholar || 0) : null,
        dmgCompanion: k.dmg ? Math.round(k.dmg.companion || 0) : null,
        dmgOther: k.dmg ? Math.round(k.dmg.other || 0) : null,
      });
    }
  } catch (e) {}

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

  const skCtx = {};
  try {
    for (const k of Object.keys(lastCtx || {})) if (/^sk[A-Z]/.test(k)) skCtx[k] = lastCtx[k];
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+w5census+sktele+killtime-bearer',
    substrate: 'pre-seat substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1; VETREL/REPOSITION/VGEAR unset)' + (ARM === 'splitkill' ? ' +SPLITKILL=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    w4scholarKills, scholarCombatDeaths,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, bearerAtKill: bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid })),
    w4killRows,
    w4EngageEvents,
    deathCauses, villagerCombatDeaths, starvationDeaths,
    skTele, skCtx,
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
      console.log(`done ${r.policy} s${seed}: wave5=${r.wave5} w4=${r.w4kills} villW4=${r.nW4Villagers} schW4=${r.w4scholarKills} schCombatDeaths=${r.scholarCombatDeaths} engage4=${r.w4EngageEvents} w5vets=${r.w5vetsEnd}/${r.w5vetsMax} skHolds=${(r.skTele || {}).holds | 0} errs=${r.instrumentErrors.length} end=${r.endReason} won=${r.won}`);
    }
  }
  const tot = k => rows.reduce((t, r) => t + ((r[k] | 0) || 0), 0);
  console.log(`ARM=${ARM} n=${rows.length} w4kills=${tot('w4kills')} villW4seeds=${rows.filter(r => r.nW4Villagers >= 1).length} won=${tot('won')} national=${tot('national')}`);
}

main().catch(e => { console.error('SWEEP FAIL:', e && e.stack || e); process.exit(1); });
