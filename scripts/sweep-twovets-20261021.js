#!/usr/bin/env node
// sweep-twovets-20261021.js — sim-twovets-r2 PILOT sweep.
//
// 8 FRESH seeds (64841-64848) x {leadfeast, belongfeast} x {control, twovets}
// = 32 configs, 180d death-aware, paired identical seeds, on the pinned
// winning substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
// SEATDRIVE=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS):
//
//   control = VCE.armedFor(base):  the VGEAR=1 stack (TWOVETS unset)
//   twovets = TV.armedFor(base):   TWOVETS=1 OUTSIDE the same stack (VGEAR=1)
//
// Composition honesty pinned by scripts/test-twovets-20261021.js (all
// gates GREEN) BEFORE this sweep ran.
//
// Instruments: KILLDISC=1 v2 (scripts/killdisc-instrument-20261021.js —
// read-only per-source tbDamage attribution on wave-3+ monsters + daily
// readiness census) + a call-through daily w5-readiness sample + tv layer
// counters (counts only). Same instrument package as the arm's proof.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-twovets/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   ARM=control SEEDS=64841,64842 node scripts/sweep-twovets-20261021.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   TWOVETS=1 ARM=twovets SEEDS=64841,64842 node scripts/sweep-twovets-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL INFO-SKIP: if the composition is deleted (TWOVETS_KILLED=1
// set by the coordinator after a killed arm), this sweep exits green with an
// INFO-SKIP instead of FATAL-ing.
let TV = null, VCE = null;
try {
  TV = require(path.join(REPO, 'scripts', 'policies', 'twovets'));
  VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
} catch (e) {
  if (process.env.TWOVETS_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/twovets.js deleted per kill protocol (sim-twovets-r2 NO-GO) — sweep not applicable.');
    process.exit(0);
  }
  throw e;
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// WINNING-SUBSTRATE guard (the pinned substrate + VGEAR; KILLDISC v2).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate + VGEAR).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'twovets') { console.error('SWEEP STOP: ARM must be control|twovets.'); process.exit(2); }
if (ARM === 'twovets' && process.env.TWOVETS !== '1') { console.error('SWEEP STOP: TWOVETS=1 required for ARM=twovets.'); process.exit(2); }
if (ARM === 'control' && ('TWOVETS' in process.env)) { console.error('SWEEP STOP: TWOVETS must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64841, 64842, 64843, 64844, 64845, 64846, 64847, 64848]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-twovets');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// Paired composition: control = the VGEAR=1 stack; armed = TWOVETS=1
// OUTSIDE the same stack. TWOVETS is the only switch.
function policyFor(base) { const t = TV.normBase(base); return ARM === 'twovets' ? TV.armedFor(t) : VCE.armedFor(t); }
function policyTag(base) { return TV.normBase(base) + (ARM === 'twovets' ? '-twovets' : ''); }

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
  const { Game } = await loadGame({ seed, mode: 'twovets', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Daily w5-readiness sample (call-through, pure reads) + tv counters.
  const w5census = [];
  let lastCtx = null;
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

  // Wrap the policy's daily to capture the harness ctx (tv counters live
  // there; counts only, zero state writes, zero RNG draws) and to sample
  // the bearer (scholar vid) per day — wave-4 kills are attributed
  // KILL-TIME (bearer on the kill's day), not end-of-run: succession
  // churn would otherwise misattribute villager kills as scholar kills
  // (diag-bearer: s64712 d74 "scholar" kill was a companion; the killer
  // only became scholar at d87).
  const oDaily = policy.daily;
  const bearerByDay = {};
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  // Layer telemetry: call-through observation on the layer's verbs (counts
  // only).
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

  // Terminal waveKillLog — the PRIMARY judge line (brief), attributed
  // KILL-TIME: villager kill = w=4, by != bearer-on-that-day, by !=
  // 'player'; scholar kill = by == bearer-on-that-day or by == 'player'.
  // End-of-run vid would misattribute under succession churn (diag-bearer).
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

  // tv layer counters from the captured ctx.
  const tv = {};
  try {
    for (const k of Object.keys(lastCtx || {})) if (/^tv/.test(k)) tv[k] = lastCtx[k];
  } catch (e) {}

  // KILLDISC-attributed wave-4 kills (damage by source at kill time).
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

  // w5 veterans bar: end-of-run + max over the daily census.
  let w5vetsEnd = 0;
  try { const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; w5vetsEnd = (r && r.veterans) | 0; } catch (e) {}
  let w5vetsMax = w5vetsEnd;
  try { for (const c of w5census) if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0; } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  // Villager combat deaths (guardrail): deaths with player=false and a
  // combat-ish cause.
  let villagerCombatDeaths = 0, starvationDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || '');
      if (/starv/i.test(c)) starvationDeaths++;
      if (!dd.player && /combat|fight|monster|wound|bleed|titan/i.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  // Arming census: weapon bonus + armor P per living villager.
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
    instrument: 'killdisc-v2+w5census+tvcounters',
    substrate: 'winning substrate + VGEAR (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS)' + (ARM === 'twovets' ? ' +TWOVETS=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled, winTrack,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    // PRIMARY judge line (brief): distinct villagers with wave-4 kills,
    // scholar wave-4 kills.
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    w4scholarKills,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, trick: e.trick || null, bearerAtKill: bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid })),
    bearerChanges,
    w4killRows,
    // mechanism
    tv,
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
        console.log(`done ${r.policy} s${seed}: wave5=${r.wave5} w4=${r.w4kills} villW4=${r.nW4Villagers} schW4=${r.w4scholarKills} w5vets=${r.w5vetsEnd}/${r.w5vetsMax} tv=${JSON.stringify(r.tv)} errs=${r.instrumentErrors.length} end=${r.endReason} won=${r.won}`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, exiled: r.exiled,
    w4kills: r.w4kills, nW4Villagers: r.nW4Villagers, w4scholarKills: r.w4scholarKills, w5vetsEnd: r.w5vetsEnd, w5vetsMax: r.w5vetsMax,
    gameDays: r.gameDays, endReason: r.endReason, donations: r.donations, invites: r.invites,
    tv: r.tv, villagerCombatDeaths: r.villagerCombatDeaths, starvationDeaths: r.starvationDeaths,
    deathCauses: r.deathCauses, winTrack: r.winTrack, bearerChanges: r.bearerChanges,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
