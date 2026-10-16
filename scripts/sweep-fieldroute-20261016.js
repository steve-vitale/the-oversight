#!/usr/bin/env node
'use strict';
// sweep-fieldroute-20261016.js — paired control/armed sweep for the
// fieldroute layer (sim-fieldroute, 2026-10-16, scale-onramp axis).
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14 — BINDING):
//   PRIMARY GO: field-exposure (non-raid, post-invite) monster-verb
//     villager death sum, armed <= 0.70x control on identical seeds.
//     Field-exposure = FFS src EXPEDITION + WILD-ENCOUNTER (the fork's 72%).
//   GUARDRAILS (all must hold): national >= control-2; table >= control-2;
//     median survival >= control-10d; starvation <= control+2; no new death
//     mode; wave-4 unlock count >= control-1.
//   A miss on primary or any guardrail = KILL (kill protocol: the policy
//   file scripts/policies/fieldroute.js is deleted; instruments + evidence
//   land; no trace of the lever).
// PILOT: 8 FRESH seeds [391,402,415,518,629,733,844,955] (verified 0
//   -s<seed>.json hits across evidence/ 2026-10-16) x {leadfeast,
//   belongfeast} x {control, armed} = 32 runs, 180d death-aware, one sweep.
//   Confirm (12-16 seeds) ONLY if pilot passes every gate.
// SUBSTRATE: FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 +
//   WINPURSUIT=1 + WINDEFER=1, SEATDRIVE=0 explicit (pre-seat substrate),
//   WAVE5REACH/W3DRIVE off. FIELDROUTE=1 is the ONLY armed-side switch —
//   control and armed share the same composed objects; both sides carry
//   the FFS instrument (read-only, proven by its own det-gate).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/sweep-fieldroute-20261016.js
//   ... SEEDS="391" ONLY="leadfeast;armed" node scripts/sweep-fieldroute-20261016.js
const fs = require('fs');
const path = require('path');
// KILL PROTOCOL (2026-10-16: pilot NO-GO): the layer file is deleted —
// there is nothing to sweep. Exit 0 with the reason (INFO-SKIP).
try { require.resolve('./policies/fieldroute'); }
catch (e) { console.log('SKIP sweep-fieldroute-20261016 (layer deleted per kill protocol — scripts/policies/fieldroute absent)'); process.exit(0); }
const TF = require('./policies/tribfloor');
const FR = require('./policies/fieldroute');
const FFS = require('./fieldfightsrc-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

// --- substrate gates (the pre-seat stack the fork measured) ---
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate, explicit).'); process.exit(2); }
for (const k of ['WAVE5REACH', 'W3DRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must not be 1 (sibling lever).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [391, 402, 415, 518, 629, 733, 844, 955]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['leadfeast', 'belongfeast'];
const SIDES = ['control', 'armed'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldroute');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function waveAt(Game) { try { return Game.unlockedWave ? (Game.unlockedWave() | 0) : 0; } catch (e) { return 0; } }
function nationalAt(Game) {
  try { const r = typeof Game.scaleRank === 'function' ? Game.scaleRank() : null; return (r === 'national' || r === 'global') ? 1 : 0; }
  catch (e) { return 0; }
}
function scholarExiled(Game) { try { return !!((Game.state || {}).scholar || {}).exiled; } catch (e) { return false; } }

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }
function policyFor(policyId, side) {
  const b = FFS.withFieldFightSrc(baseFor(policyId), policyId + '-ffs', policyId + ' [FFS]');
  if (side === 'armed') return FR.withFieldRoute(b, b.id + '-fr', b.desc + ' [FR]');
  return b;
}

async function oneRun(seed, policyId, side) {
  if (side === 'armed') process.env.FIELDROUTE = '1'; else delete process.env.FIELDROUTE;
  const policy = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: 'fr-sweep', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup ? oSetup(G, ctx) : undefined; };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.FIELDROUTE;
  const C = (runCtx && runCtx._ffs) || FFS.newRec();
  const isVillager = (d) => /person|villager/i.test(d.kind || '') || d.player === true;
  const postInvite = C.deaths.filter(d => C.inviteDay != null && d.day >= C.inviteDay && isVillager(d) && d.family === 'monster');
  const srcShare = { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0, nontarget: 0 };
  for (const d of postInvite) srcShare[d.src] = (srcShare[d.src] || 0) + 1;
  const fieldExposure = (srcShare.EXPEDITION || 0) + (srcShare['WILD-ENCOUNTER'] || 0);
  const wv = waveAt(Game);
  let travelDays = 0;
  try { for (const d of Object.keys(C.travelDays || {})) travelDays += C.travelDays[d] | 0; } catch (e) {}
  const fams = {};
  for (const d of (C.deaths || [])) fams[d.family || 'other-named'] = (fams[d.family || 'other-named'] | 0) + 1;
  const out = {
    seed, policyId, side, mode: 'fieldroute',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    finalEngineDay: gday(Game),
    won: Game.won ? 1 : 0, wins: Game.won ? 1 : 0,
    national: nationalAt(Game), table: C.inviteDay != null ? 1 : 0,
    wave4: wv >= 4 ? 1 : 0, wave5: wv >= 5 ? 1 : 0, maxWave: wv,
    exiled: scholarExiled(Game) ? 1 : 0,
    inviteDay: C.inviteDay != null ? C.inviteDay : null,
    nDeaths: (C.deaths || []).length,
    starvationDeaths: (C.deaths || []).filter(d => d.family === 'starvation').length,
    deathFamilies: fams,
    postInviteMonsterVerb: postInvite.length,
    postInviteFieldExposure: fieldExposure,
    postInviteRaid: srcShare.RAID || 0,
    postInviteSrcShare: srcShare,
    travelDays,
    frDiverted: (runCtx && runCtx.frDiverted) | 0,
    frPantryBlock: (runCtx && runCtx.frPantryBlock) | 0,
    frNoAlt: (runCtx && runCtx.frNoAlt) | 0,
    frSightings: (runCtx && runCtx.frSightings) | 0,
    frApexEngagements: (runCtx && runCtx.frApexEngagements) | 0,
    frApexFieldEngagements: (runCtx && runCtx.frApexFieldEngagements) | 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${policyId} ${side} s${seed}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} ` +
    `fieldExp=${fieldExposure} (R:${srcShare.RAID}/E:${srcShare.EXPEDITION}/W:${srcShare['WILD-ENCOUNTER']}) ` +
    `nat=${out.national} w4=${out.wave4} div=${out.frDiverted} sight=${out.frSightings} apexF=${out.frApexFieldEngagements}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) { const p = part.trim(); if (p) only[p] = true; }
  }
  let n = 0;
  for (const policyId of POLICIES) {
    for (const side of SIDES) {
      for (const seed of SEEDS) {
        if (only && !(only[policyId] || only[side] || only[`${policyId};${side}`])) continue;
        n++;
        await oneRun(seed, policyId, side);
      }
    }
  }
  console.log(`\nSWEEP DONE — ${n} runs. Per-seed JSONs in evidence/2026-10-16/perseed-fieldroute/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { policyFor, baseFor, SEEDS, DAYS };
