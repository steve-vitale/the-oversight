#!/usr/bin/env node
// sweep-armorydrive-20261022.js — sim-armorydrive PILOT sweep.
//
// 8 FRESH seeds (65461-65468) x {leadfeast, belongfeast} x {control,
// armorydrive} = 32 configs, 180d death-aware, paired identical seeds, on
// the NON-SEAT long substrate (finding #714b):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   (no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/
//   TWOVETS/VGEAR/WAVE4ENGAGE; KILLDISC=1 v2)
//
//   control     = AD.substrateFor(base):  the seatdrive prebuilt stack with
//                 SEATDRIVE=0 (pure delegation; ARMORYDRIVE unset)
//   armorydrive = AD.armedFor(base): ARMORYDRIVE=1 OUTSIDE the same substrate
//
// Composition honesty pinned by scripts/test-armorydrive-20261022.js (all
// gates GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (scripts/killdisc-instrument-20261021.js —
// read-only per-source tbDamage attribution on wave-3+ monsters + daily
// readiness census + startCombat engagement census) + a call-through daily
// w5-readiness sample + ad layer counters (counts only) + daily
// bearer census (kill-time attribution — the scholar is a role, not a
// person; sim-killtime MANDATORY) + wave-4 fight damage tables (the
// mechanism check: companion damage per wave-4 fight).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-armorydrive/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARM=control SEEDS=65461,65462 node scripts/sweep-armorydrive-20261022.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARM=armorydrive SEEDS=65461,65462 node scripts/sweep-armorydrive-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// NON-SEAT SUBSTRATE guard (the pinned substrate + KILLDISC v2).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (non-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armorydrive') { console.error('SWEEP STOP: ARM must be control|armorydrive.'); process.exit(2); }
if (ARM === 'armorydrive' && process.env.ARMORYDRIVE !== '1') { console.error('SWEEP STOP: ARMORYDRIVE=1 required for ARM=armorydrive.'); process.exit(2); }
if (ARM === 'control' && ('ARMORYDRIVE' in process.env)) { console.error('SWEEP STOP: ARMORYDRIVE must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65461, 65462, 65463, 65464, 65465, 65466, 65467, 65468]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorydrive');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = AD.normBase(base); return ARM === 'armorydrive' ? AD.armedFor(t) : AD.substrateFor(t); }
function policyTag(base) { return AD.normBase(base) + (ARM === 'armorydrive' ? '-armorydrive' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// EPERM-flap-hardened write (finding #621): node writeFileSync flaps EPERM
// in long windows; shell writes succeed. Retry EPERM-only with backoff.
function writeFileFlap(fp, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      last = e;
      if (!/EPERM/i.test(String((e && e.code) || '') + String((e && e.message) || ''))) throw e;
      execSync('sleep 20');
    }
  }
  throw last;
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'armorydrive', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  const w5census = [];
  let lastCtx = null;
  let uninstallW5 = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          const r4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
          w5census.push({ day: ((Game.state || {}).scholar || {}).day || 0,
            veterans: r ? (r.veterans | 0) : null, short: r ? (r.short || []).slice() : null,
            armored4: r4 ? (r4.armored | 0) : null });
        } catch (e) { t.instrumentErrors.push('w5census: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallW5 = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  const oDaily = policy.daily;
  const bearerByDay = {};
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  const tele = { donations: 0, invites: 0 };
  let uninstallTele = null;
  try {
    const oDon = Game.donateWeapon ? Game.donateWeapon.bind(Game) : null;
    const oInv = Game.inviteToParty ? Game.inviteToParty.bind(Game) : null;
    if (oDon) Game.donateWeapon = function (...a) { try { tele.donations++; } catch (e) {} return oDon(...a); };
    if (oInv) Game.inviteToParty = function (...a) { try { tele.invites++; } catch (e) {} return oInv(...a); };
    uninstallTele = () => {
      try { if (oDon) Game.donateWeapon = oDon; } catch (e) {}
      try { if (oInv) Game.inviteToParty = oInv; } catch (e) {}
    };
  } catch (e) {}

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}
  try { if (uninstallTele) uninstallTele(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0, winTrack = null;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    if (ek) winTrack = { path: ek.tablePath || null, moral: ek.moral || null, track: ek.track || null, seat: ek.seat || null };
  } catch (e) {}
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
  const bearerChanges = [];
  try {
    const days = Object.keys(bearerByDay).map(Number).sort((a, b) => a - b);
    let prev = null;
    for (const d of days) {
      if (bearerByDay[d] !== prev) { bearerChanges.push({ day: d, vid: bearerByDay[d] }); prev = bearerByDay[d]; }
    }
  } catch (e) {}

  // Wave-4 engagement events (arm-agnostic, measured identically both arms):
  // killdisc v2 startCombat census: wave==4, started, partySize>=1.
  let w4EngageEvents = 0;
  const w4EngageDetail = [];
  try {
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4 || !g.started || (g.partySize | 0) < 1) continue;
      w4EngageEvents++;
      w4EngageDetail.push({ day: g.day, mid: g.mid, partySize: g.partySize, fightId: g.fightId });
    }
  } catch (e) {}

  // MECHANISM CHECK: companion damage per wave-4 fight — join engagements
  // (wave==4, any partySize) with the per-source dmg tables by fightId.
  const w4FightDmg = [];
  try {
    const seen = new Set();
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4 || !g.fightId || seen.has(g.fightId)) continue;
      seen.add(g.fightId);
      const d = t.dmg[g.fightId];
      if (!d) continue;
      w4FightDmg.push({ fightId: g.fightId, day: g.day, mid: g.mid,
        scholar: Math.round(d.scholar || 0), companion: Math.round(d.companion || 0),
        other: Math.round(d.other || 0), byVid: d.byVid || {} });
    }
  } catch (e) {}

  const ad = {};
  try {
    for (const k of Object.keys(lastCtx || {})) if (/^ad/.test(k) && !/^_/.test(k)) ad[k] = lastCtx[k];
  } catch (e) {}

  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        dmgScholar: k.dmg ? Math.round(k.dmg.scholar || 0) : null,
        dmgCompanion: k.dmg ? Math.round(k.dmg.companion || 0) : null,
        dmgOther: k.dmg ? Math.round(k.dmg.other || 0) : null,
        byVid: k.dmg ? (k.dmg.byVid || {}) : {},
      });
    }
  } catch (e) {}

  let w5vetsEnd = 0, armored4End = 0;
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    w5vetsEnd = (r && r.veterans) | 0;
    const r4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
    armored4End = (r4 && r4.armored) | 0;
  } catch (e) {}
  let w5vetsMax = w5vetsEnd;
  try { for (const c of w5census) if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0; } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  let villagerCombatDeaths = 0, starvationDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || '');
      if (/starv/i.test(c)) starvationDeaths++;
      if (!dd.player && /combat|fight|monster|wound|bleed|titan/i.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  const census = [];
  try {
    const S = (globalThis.Scattering || {});
    const Seq = S.equipment || null;
    const items = Game.data.items || [];
    for (const rid of ((st.village || {}).roster || [])) {
      if (rid === scholarVid) continue;
      let p = null;
      try { p = Game.vpOf ? Game.vpOf(rid) : (Game.getPerson ? Game.getPerson(rid) : null); } catch (e) {}
      if (!p || p.dead) continue;
      let wb = 0, ar = 0;
      try {
        if (Seq && Seq.weaponBonusOf) wb = (Seq.weaponBonusOf(p, items, 'melee') || 0) + (Seq.weaponBonusOf(p, items, 'ranged') || 0);
        if (Seq && Seq.armorOf) ar = Seq.armorOf(p, items) || 0;
      } catch (e) {}
      census.push({ vid: rid, name: nameOf(Game, rid), wbonus: wb, armorP: ar });
    }
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+w5census+adcounters+killtime-bearer+w4fightdmg',
    substrate: 'non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/TWOVETS/VGEAR/WAVE4ENGAGE)' + (ARM === 'armorydrive' ? ' +ARMORYDRIVE=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled, winTrack,
    w5vetsEnd, w5vetsMax, armored4End,
    days: result.days, gameDays, endReason: result.endReason,
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    w4scholarKills,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, trick: e.trick || null, bearerAtKill: bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid })),
    bearerChanges,
    w4killRows,
    w4EngageEvents, w4EngageDetail,
    w4FightDmg,
    ad,
    donations: tele.donations, invites: tele.invites,
    partyEnd: (() => { try { return (Game.partyMembers ? Game.partyMembers() : []).length; } catch (e) { return 0; } })(),
    armedVillagers: census.filter(c => c.wbonus >= 12).length,
    armoredVillagersP10: census.filter(c => c.armorP >= 10).length,
    armoredVillagersP15: census.filter(c => c.armorP >= 15).length,
    instrumentErrors: t.instrumentErrors,
    deathCauses, villagerCombatDeaths, starvationDeaths,
    w5censusDays: w5census.length,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const fp = path.join(EVID, `${ARM}-${AD.normBase(base)}${ARM === 'armorydrive' ? '-armorydrive' : ''}-s${seed}.json`);
      if (fs.existsSync(fp)) { console.log(`SKIP (exists): ${path.basename(fp)}`); continue; }
      console.log(`RUN seed=${seed} base=${base} arm=${ARM}`);
      const t0 = Date.now();
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`  done: days=${r.days} maxWave=${r.maxWave} w4villagers=${r.nW4Villagers} w4scholar=${r.w4scholarKills} donated=${r.donations} invited=${r.invites} (${Math.round((Date.now() - t0) / 1000)}s)`);
      } catch (e) {
        console.log(`  ERROR seed=${seed} base=${base}: ${(e && e.message) || e}`);
      }
    }
  }
  const vk = rows.reduce((t, r) => t + (r.nW4Villagers || 0), 0);
  console.log(`SWEEP DONE arm=${ARM}: ${rows.length} runs, villager wave-4 kill configs=${vk}`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(1); });
