#!/usr/bin/env node
// sweep-villagergear-20261020.js — sim-villagergear PILOT sweep.
//
// 8 seeds (64001-64008) x {leadfeast, belongfeast} x {control, vgear} = 32
// runs, 180d death-aware, on the exact w5doormeasure pre-seat+windefer
// substrate:
//
//   policy = withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (VETREL/REPOSITION unset ->
//        inert; SEATDRIVE=0 -> seatdrive pure delegation)
//   vgear arm = VG.withVillagerGear(<stack>, ...) OUTSIDE the stack, VGEAR=1
//
// The sweep FAILS LOUD unless the env matches exactly.
//
// Instruments: KILLDISC=1 (read-only per-source tbDamage attribution on
// wave-3+ monsters + daily readiness census — proven non-perturbing) plus a
// call-through daily w5-readiness sample (waveCombatReadiness(5): veterans,
// short — pure reads).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-20/perseed-villagergear-pilot/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   ARM=control SEEDS=64001,64002 node scripts/sweep-villagergear-20261020.js
//   VGEAR=1 ARM=vgear SEEDS=64001,64002 node scripts/sweep-villagergear-20261020.js
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
let VG = null;
try { VG = require(path.join(REPO, 'scripts', 'policies', 'villagergear')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/villagergear.js deleted per kill protocol (sim-villagergear NO-GO) — sweep not applicable.');
  process.exit(0);
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
if (RP.layerOn()) { console.error('SWEEP STOP: REPOSITION must be unset (inert) for the wall baseline.'); process.exit(2); }
if (VR.vetrelOn()) { console.error('SWEEP STOP: VETREL must be unset (inert) for the wall baseline.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'vgear') { console.error('SWEEP STOP: ARM must be control|vgear.'); process.exit(2); }
if (ARM === 'vgear' && !VG.vgearOn()) { console.error('SWEEP STOP: VGEAR=1 required for ARM=vgear.'); process.exit(2); }
if (ARM === 'control' && VG.vgearOn()) { console.error('SWEEP STOP: VGEAR must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-20', 'perseed-villagergear-pilot');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// The exact w5doormeasure stack (vetrel/reposition inert via env).
function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-windefer', tag + '-windefer + seatdrive');
  if (ARM === 'vgear') return VG.withVillagerGear(s, tag + '-vgear', tag + ' + villagergear');
  return s;
}
function policyFor(base) { return stackFor(base === 'lead' ? TF.leadfeast : TF.belongfeast, base === 'lead' ? 'leadfeast' : 'belongfeast'); }
function policyTag(base) { return (base === 'lead' ? 'leadfeast' : 'belongfeast') + (ARM === 'vgear' ? '-vgear' : ''); }

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
  const { Game } = await loadGame({ seed, mode: 'villagergear-pilot', fullTelemetry: false });
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
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
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
    substrate: 'w5doormeasure pre-seat+windefer (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1; VETREL/REPOSITION inert)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    // PRIMARY: wave-4 kills by a villager (by != scholar, via in villager set)
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
        console.log(`done ${r.policy} s${seed}: w4=${r.w4kills} villW4=${r.w4villagerKills} compW4=${r.w4companionKills} w5vets=${r.w5vetsEnd}/${r.w5vetsMax} don=${r.donations} inv=${r.invites} party=${r.partyEnd} errs=${r.instrumentErrors.length} end=${r.endReason}`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won,
    w4kills: r.w4kills, w4villagerKills: r.w4villagerKills, w5vetsEnd: r.w5vetsEnd, w5vetsMax: r.w5vetsMax,
    gameDays: r.gameDays, endReason: r.endReason, donations: r.donations, invites: r.invites,
    deathCauses: r.deathCauses,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
