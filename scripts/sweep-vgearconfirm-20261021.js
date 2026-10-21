#!/usr/bin/env node
// sweep-vgearconfirm-20261021.js — sim-vgearconfirm CONFIRM sweep.
//
// 16 FRESH seeds (64701-64716) x {leadfeast, belongfeast} x {control, vgear}
// = 64 runs, 180d death-aware, paired identical seeds, on the SEATDRIVE=1
// WINNING substrate (the sim-fullseat corpus substrate: FEASTSCALE_R13=1
// TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1; NO SUCCGRACE/RAIDDENSITY/
// NODEWITNESS — the winning substrate pins exactly this):
//
//   control = seatStackFor(base):  seatdrive's prebuilt leadseat/belongseat
//             (withSeatDrive(withWinDefer(TF leadfeast/belongfeast)); VGEAR unset)
//   vgear   = armedFor(base):      withVillagerGear OUTSIDE the same stack
//             (VGEAR=1)
// Both share scripts/policies/vgearconfirm.js; composition honesty pinned by
// scripts/test-vgearconfirm-20261021.js (15/15) BEFORE this sweep ran.
//
// Instruments: KILLDISC=1 (read-only per-source tbDamage attribution on
// wave-3+ monsters + daily readiness census — proven non-perturbing) plus a
// call-through daily w5-readiness sample (waveCombatReadiness(5): veterans,
// short — pure reads). Same instrument package as the vgear pilot.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-vgearconfirm/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1 \
//   ARM=control SEEDS=64701,64702 node scripts/sweep-vgearconfirm-20261021.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1 \
//   VGEAR=1 ARM=vgear SEEDS=64701,64702 node scripts/sweep-vgearconfirm-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL INFO-SKIP: if the composition is deleted (VGEARCONFIRM_KILLED=1
// set by the coordinator after a killed arm), this sweep exits green with an
// INFO-SKIP instead of FATAL-ing.
let VCE = null;
try { VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm')); }
catch (e) {
  if (process.env.VGEARCONFIRM_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/vgearconfirm.js deleted per kill protocol (sim-vgearconfirm NO-GO) — sweep not applicable.');
    process.exit(0);
  }
  throw e;
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

// WINNING-SUBSTRATE guard (sim-fullseat corpus env, minus the FULLSEAT diag).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'vgear') { console.error('SWEEP STOP: ARM must be control|vgear.'); process.exit(2); }
if (ARM === 'vgear' && process.env.VGEAR !== '1') { console.error('SWEEP STOP: VGEAR=1 required for ARM=vgear.'); process.exit(2); }
if (ARM === 'control' && ('VGEAR' in process.env)) { console.error('SWEEP STOP: VGEAR must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64701, 64702, 64703, 64704, 64705, 64706, 64707, 64708, 64709, 64710, 64711, 64712, 64713, 64714, 64715, 64716]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-vgearconfirm');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// Paired composition: control = the winning seat stack; armed = VILLAGERGEAR
// OUTSIDE the same stack. VGEAR is the only switch.
function policyFor(base) { const t = VCE.normBase(base); return ARM === 'vgear' ? VCE.armedFor(t) : VCE.seatStackFor(t); }
function policyTag(base) { return VCE.normBase(base) + (ARM === 'vgear' ? '-vgear' : ''); }

// via values that mean "a villager (not the scholar) landed the blow"
const VILLAGER_VIA = new Set(['companion', 'patrol', 'wild', 'aid-crisis', 'contest', 'agency', 'sortie']);

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
  const { Game } = await loadGame({ seed, mode: 'vgearconfirm', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Daily w5-readiness sample (call-through, pure reads, zero writes/RNG).
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

  // Layer telemetry: call-through observation on the layer's verbs (counts
  // only, zero state writes, zero RNG draws).
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
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // Uninstall in reverse order of installation (w5census wraps KD's sleep).
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

  // Terminal waveKillLog — the honest kill ledger (with via).
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villager = w4.filter(e => e.by && e.by !== scholarVid && e.by !== 'player' && VILLAGER_VIA.has(e.via));
  const w4companion = w4.filter(e => e.via === 'companion');

  // KILLDISC-attributed wave-4 fights (damage by source).
  let w4fights = 0, w4compDmg = 0, w4totDmg = 0;
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      w4fights++;
      if (k.dmg) { w4compDmg += (k.dmg.companion || 0); w4totDmg += ((k.dmg.scholar || 0) + (k.dmg.companion || 0) + (k.dmg.other || 0)); }
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
    instrument: 'killdisc+w5census',
    substrate: 'SEATDRIVE=1 winning substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled, winTrack,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    // MECHANISM (the vgear pilot's proven metric — report, don't judge):
    // wave-4 kills by a villager (by != scholar, via in villager set)
    w4kills: w4.length,
    w4villagerKills: w4villager.length,
    w4companionKills: w4companion.length,
    hasVillagerW4Kill: w4villager.length > 0 ? 1 : 0,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, trick: e.trick || null })),
    // mechanism
    w4fights, w4compDmgShare: w4totDmg > 0 ? +(w4compDmg / w4totDmg).toFixed(4) : null,
    donations: tele.donations, invites: tele.invites,
    armoryEnd: (() => { try { const s2 = Game.stashState ? Game.stashState() : null; return ((s2 && s2.weapons) || []).reduce((a, e) => a + ((e && e.units) || 1), 0); } catch (e) { return 0; } })(),
    partyEnd: (() => { try { return (Game.partyMembers ? Game.partyMembers() : []).length; } catch (e) { return 0; } })(),
    armingCensus: census,
    armedVillagers: census.filter(c => c.wbonus >= 12).length,
    armoredVillagersP10: census.filter(c => c.armorP >= 10).length,
    armoredVillagersP15: census.filter(c => c.armorP >= 15).length,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
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
        console.log(`done ${r.policy} s${seed}: wave5=${r.wave5} w4=${r.w4kills} villW4=${r.w4villagerKills} compW4=${r.w4companionKills} w5vets=${r.w5vetsEnd}/${r.w5vetsMax} don=${r.donations} inv=${r.invites} errs=${r.instrumentErrors.length} end=${r.endReason} won=${r.won}`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, exiled: r.exiled,
    w4kills: r.w4kills, w4villagerKills: r.w4villagerKills, w5vetsEnd: r.w5vetsEnd, w5vetsMax: r.w5vetsMax,
    gameDays: r.gameDays, endReason: r.endReason, donations: r.donations, invites: r.invites,
    deathCauses: r.deathCauses, winTrack: r.winTrack,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
