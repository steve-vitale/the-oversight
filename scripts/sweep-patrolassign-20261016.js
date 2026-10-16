#!/usr/bin/env node
'use strict';
// sweep-patrolassign-20261016.js — before/after sweep for the sim-patrolassign
// layer (scripts/policies/patrolassign.js), scale-onramp axis.
//
// Measures whether proactive patrol assignment (the engine's resolvePatrol
// router, currently 0x on the courtship road) moves the (b)-channel
// field-exposure villager combat death rate.
//
// TAGGING: reuses the fieldfightsrc read-only instrument
// (scripts/fieldfightsrc-20261016.js — its fight-stack wraps + death capture)
// with ONE honest extension: deaths routed through resolvePatrol
// (via === 'patrol') are carved into a PATROL channel instead of folding
// into EXPEDITION/WILD-ENCOUNTER (the diagnostic's srcOf folded them —
// fine at 0 patrol deaths, wrong once patrols fire). The (b)-channel is
// RAID + EXPEDITION + WILD-ENCOUNTER, exactly the diagnostic's population.
//
// ARMS: control = courtship base + FFS instrument, PATROLASSIGN unset.
//       armed   = patrol layer OUTSIDE the FFS instrument, PATROLASSIGN=1.
// Seeds identical both sides (paired). Substrate: pre-seat stack, matching
// fieldfightsrc exactly (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE/WAVE5REACH/W3DRIVE unset).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-patrolassign/
//   (numeric national/table/wins/exiled keys — schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/sweep-patrolassign-20261016.js
//   ... SEEDS="205" ONLY="leadfeast" ARM="armed" node scripts/sweep-patrolassign-20261016.js
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
// The layer was KILLED per protocol after the pilot (see
// evidence/2026-10-16/sim-patrolassign.md — PRIMARY NO-GO at 0.703 vs the
// 0.700 bar). The sweep is retained as the measurement instrument; the
// armed arm requires the layer and exits with a clear message without it.
let PA = null;
try { PA = require('./policies/patrolassign'); }
catch (e) { PA = null; }
const FF = require('./fieldfightsrc-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

// The diagnostic's seed set — deliberate re-use: the paired control should
// reproduce fieldfightsrc's baseline (same substrate, same seeds), and the
// GO threshold compares armed vs control on identical seeds.
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [205, 246, 321, 412, 523, 634, 745, 856]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const ARMS = process.env.ARM ? [process.env.ARM] : ['control', 'armed'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-patrolassign');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'patrolassign-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 300;
const PA_BEAT = /treeline watch|patrols\.|patrol combat|walks the perimeter|keeps watch/i;
// The FFS instrument's OD_BEAT (copied — it is not exported): deaths, kills,
// raids, invitations, mantle/succession. Needed for the sense-read.
const OD_BEAT = /OVERTIME|RERUN|Take your seat|take your seat|Nothing is final|Seven doors|THE TABLE is set|ring of pale|Herald|herald|invitation|died|funeral|Funeral|buried|bury |killed|slain|fallen|succession|mantle|exile|Exile|RAID|raiders|treeline/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// srcOfPatrol: the fieldfightsrc tagging + the PATROL channel carve-out.
// Patrol-router deaths are the lever's own mechanism — they must not pollute
// the (b)-channel the GO threshold measures.
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
    if (!PA) {
      console.error('SWEEP STOP: the patrolassign layer was deleted per the kill protocol (evidence/2026-10-16/sim-patrolassign.md). The armed arm cannot run without it.');
      process.exit(3);
    }
    return PA.withPatrolAssign(ffs, `${ffs.id}+pa`, `${ffs.desc} [PATROLASSIGN]`);
  }
  return ffs;
}

async function oneRun(seed, policyId, arm) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  if (arm === 'armed') process.env.PATROLASSIGN = '1';
  else delete process.env.PATROLASSIGN;
  const policy = policyForArm(policyId, arm);
  const { Game } = await loadGame({ seed, mode: 'patrolassign', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  // Exercise-gate counter: resolvePatrol fires (chains the FFS wrap).
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
  delete process.env.PATROLASSIGN;
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
  const famShare = {};
  for (const d of C.deaths) famShare[d.family || 'other'] = (famShare[d.family || 'other'] || 0) + 1;
  const out = {
    seed, policyId, arm, mode: 'patrolassign',
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
    patrolLeadEver,
    patrolAssigns: (runCtx && runCtx.patrolAssigns) || 0,
    patrolAssignDays: (runCtx && runCtx.patrolAssignDays) || 0,
    postInviteMonsterVerb: postInvite.length,
    postInviteSrcShare: srcShare,
    bChannel,
    famShare,
    attributionRate: postInvite.length ? (bChannel + (srcShare.PATROL || 0)) / postInvite.length : 1,
    travelDays: C.travelDays,
    beatsDropped: C.beatsDropped,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${arm}.json`), JSON.stringify(out, null, 1));
  try {
    // Full beat capture (the FFS instrument's OD_BEAT set: deaths, kills,
    // raids, invitations) + the patrol decision beats — the sense-read
    // needs patrol FIGHT beats, not just the watch-posting lines.
    const beats = (C.beats || []).filter(b => PA_BEAT.test(b.text || '') || OD_BEAT.test(b.text || ''));
    if (beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${arm}.json`), JSON.stringify(beats.slice(0, 800), null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed} ${arm}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} ` +
    `bChan=${bChannel} patrol=${srcShare.PATROL || 0} fires=${paFires} assigns=${out.patrolAssigns} nat=${out.national}`);
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
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-patrolassign/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { srcOfPatrol, policyForArm, oneRun };
