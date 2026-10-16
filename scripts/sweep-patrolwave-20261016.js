#!/usr/bin/env node
'use strict';
// sweep-patrolwave-20261016.js — before/after sweep for the sim-patrolwave
// layer (scripts/policies/patrolwave.js), scale-onramp axis.
//
// Measures whether WAVE-GATED patrols move the NET post-invite monster-verb
// villager combat death rate: (b)-channel (RAID+EXPEDITION+WILD-ENCOUNTER) +
// PATROL channel, on identical seeds.
//
// TAGGING: reuses the fieldfightsrc read-only instrument
// (scripts/fieldfightsrc-20261016.js — its fight-stack wraps + death capture)
// with the PATROL channel carve-out (deaths routed through resolvePatrol
// via === 'patrol' are carved into PATROL instead of folding into
// EXPEDITION/WILD-ENCOUNTER).
//
// ARMS: control = courtship base + FFS instrument, PATROLWAVE unset.
//       armed   = patrolwave layer OUTSIDE the FFS instrument, PATROLWAVE=1.
// Seeds identical both sides (paired). Substrate: pre-seat stack
// (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
// WINDEFER=1, SEATDRIVE=0 EXPLICIT — finding #389: c004b9dd flipped the seat
// default ON; pre-seat runs MUST set SEATDRIVE=0 explicitly or they silently
// run a different substrate).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-patrolwave/
//   (numeric national/table/wins/exiled keys — schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 node scripts/sweep-patrolwave-20261016.js
//   ... SEEDS="917" ONLY="leadfeast" ARM="armed" node scripts/sweep-patrolwave-20261016.js
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
// The layer may be DELETED per the kill protocol (evidence/2026-10-16/
// sim-patrolwave.md). The sweep is the measurement instrument; the armed
// arm requires the layer and exits with a clear message without it.
let PW = null;
try { PW = require('./policies/patrolwave'); }
catch (e) { PW = null; }
const FF = require('./fieldfightsrc-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
// SEATDRIVE=0 EXPLICIT (finding #389): unset is not enough — c004b9dd made
// the seat driver default-ON, so a pre-seat sweep must opt out explicitly.
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required explicitly (pre-seat substrate, finding #389).'); process.exit(2); }
for (const k of ['WAVE5REACH', 'W3DRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

// Pilot: 8 FRESH seeds (not the sim-patrolassign set — a clean read for the
// noise-aware bar). Confirm (if pilot GO): CONFSEEDS.
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [917, 928, 939, 104, 215, 326, 437, 548]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const ARMS = process.env.ARM ? [process.env.ARM] : ['control', 'armed'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-patrolwave');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'patrolwave-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 300;
const PA_BEAT = /treeline watch|patrols\.|patrol combat|walks the perimeter|keeps watch|stands down|stand down|🛡️/i;
// The FFS instrument's OD_BEAT (copied — it is not exported): deaths, kills,
// raids, invitations, mantle/succession. Needed for the sense-read.
const OD_BEAT = /OVERTIME|RERUN|Take your seat|take your seat|Nothing is final|Seven doors|THE TABLE is set|ring of pale|Herald|herald|invitation|died|funeral|Funeral|buried|bury |killed|slain|fallen|succession|mantle|exile|Exile|RAID|raiders|treeline/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// srcOfPatrol: the fieldfightsrc tagging + the PATROL channel carve-out.
// Patrol-router deaths are the lever's own mechanism — carved out so the
// (b)-channel stays the diagnostic's population; the PRIMARY sums both.
function srcOfPatrol(c) {
  if (!c || c.day == null || c.cause == null) return 'unattributed';
  if (c.family !== 'monster') return 'nontarget';
  if (c.via === 'patrol' && !c.raid) return 'PATROL';
  return FF.srcOf(c);
}

function baseFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

function policyForArm(policyId, arm) {
  const ffs = FF.withFieldFightSrc(baseFor(policyId), `${policyId}-ffs`, `${policyId} [FFS]`);
  if (arm === 'armed') {
    if (!PW) {
      console.error('SWEEP STOP: the patrolwave layer was deleted per the kill protocol (evidence/2026-10-16/sim-patrolwave.md). The armed arm cannot run without it.');
      process.exit(3);
    }
    return PW.withPatrolWave(ffs, `${ffs.id}+pw`, `${ffs.desc} [PATROLWAVE]`);
  }
  return ffs;
}

async function oneRun(seed, policyId, arm) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '0';
  if (arm === 'armed') process.env.PATROLWAVE = '1';
  else delete process.env.PATROLWAVE;
  const policy = policyForArm(policyId, arm);
  const { Game } = await loadGame({ seed, mode: 'patrolwave', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  // Exercise-gate counter: resolvePatrol fires (chains the layer's wrap on
  // armed — the layer installs its wave-gate wrap in setup; this counter
  // sits OUTSIDE it and counts every patrol resolution).
  let paFires = 0;
  const _origSetup = policy.setup;
  policy.setup = (G, ctx) => {
    const r = _origSetup(G, ctx);
    try {
      const prev = Game.resolvePatrol.bind(Game);
      Game.resolvePatrol = function () { paFires++; return prev.apply(this, arguments); };
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.PATROLWAVE;
  const C = (runCtx && runCtx._ffs) || FF.newRec();
  const finalEngineDay = gday(Game);
  let patrolLeadEver = 0;
  try { if (Game.state.village && Game.state.village.taskLeads && Game.state.village.taskLeads.patrol) patrolLeadEver = 1; } catch (e) {}
  const isVillager = (d) => /person|villager/i.test(d.kind || '') || d.player === true;
  const postInvite = C.deaths.filter(d => C.inviteDay != null && d.day >= C.inviteDay && isVillager(d) && d.family === 'monster');
  const srcShare = { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, PATROL: 0, unattributed: 0 };
  for (const d of postInvite) {
    const s = srcOfPatrol(d);
    d.srcPa = s;
    srcShare[s] = (srcShare[s] || 0) + 1;
  }
  const bChannel = (srcShare.RAID || 0) + (srcShare.EXPEDITION || 0) + (srcShare['WILD-ENCOUNTER'] || 0);
  const patrolChan = srcShare.PATROL || 0;
  const netDeaths = bChannel + patrolChan; // PRIMARY population
  const famShare = {};
  for (const d of C.deaths) famShare[d.family || 'other'] = (famShare[d.family || 'other'] || 0) + 1;
  const out = {
    seed, policyId, arm, mode: 'patrolwave',
    days: result.days, gameDays: result.gameDays, finalEngineDay,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: C.inviteDay, seatAtInvite: C.seatAtInvite, sittings: C.sittings,
    maxWave: Math.max(1, ...C.dayTiers.map(r => r.wave || 1)),
    national: C.dayTiers.some(r => r.scale === 'national' || r.scale === 'global') ? 1 : 0,
    table: C.inviteDay != null ? 1 : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    nDeaths: C.deaths.length,
    patrolFires: paFires,
    patrolStanddowns: (runCtx && runCtx.pwStanddowns) || 0,
    patrolGateFires: (runCtx && runCtx.pwPatrolFires) || 0,
    patrolLeadEver,
    patrolAssigns: (runCtx && runCtx.patrolWaveAssigns) || 0,
    patrolAssignDays: (runCtx && runCtx.patrolWaveAssignDays) || 0,
    postInviteMonsterVerb: postInvite.length,
    postInviteSrcShare: srcShare,
    bChannel,
    patrolChan,
    netDeaths,
    famShare,
    attributionRate: postInvite.length ? (bChannel + patrolChan) / postInvite.length : 1,
    travelDays: C.travelDays,
    beatsDropped: C.beatsDropped,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${arm}.json`), JSON.stringify(out, null, 1));
  try {
    // Full beat capture (the FFS instrument's OD_BEAT set) + the patrol
    // decision/stand-down beats — the sense-read needs patrol FIGHT beats
    // and stand-down beats, not just the watch-posting lines.
    const beats = (C.beats || []).filter(b => PA_BEAT.test(b.text || '') || OD_BEAT.test(b.text || ''));
    if (beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${arm}.json`), JSON.stringify(beats.slice(0, 800), null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed} ${arm}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} ` +
    `net=${netDeaths} (b=${bChannel} p=${patrolChan}) fires=${paFires} standdowns=${out.patrolStanddowns} nat=${out.national}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) { const p = part.trim(); if (p) only[p] = true; }
  }
  for (const policyId of POLICIES) {
    if (only && !only[policyId]) continue;
    for (const seed of SEEDS) {
      for (const arm of ARMS) {
        await oneRun(seed, policyId, arm);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-patrolwave/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { srcOfPatrol, policyForArm, oneRun };
