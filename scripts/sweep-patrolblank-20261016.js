#!/usr/bin/env node
'use strict';
// sweep-patrolblank-20261016.js — the sim-patrolblank measurement sweep.
//
// READ-ONLY diagnostic: runs the patrolblank instrument (zero src/js,
// zero policy changes) on the pre-seat courtship substrate and attributes
// 100% of patrol-resolution outcomes: FIRED vs REFUSED:<gate> vs
// NEVER-SCHEDULED (no assigner exists).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 NODEWITNESS=1 node scripts/sweep-patrolblank-20261016.js
//   ... SEEDS="301" ONLY="leadfeast" node scripts/sweep-patrolblank-20261016.js
//
// Per-seed JSONs: evidence/2026-10-16/perseed-patrolblank/
// Patrol beats:    evidence/2026-10-16/patrolblank-beats/ (sense-read material)
const fs = require('fs');
const path = require('path');
const PB = require('./patrolblank-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (substrate).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

// 8 FRESH seeds (fresh relative to the patrol work: patrolassign used
// [205..856], patrolwave used [917..548]) x 2 roads = 16 runs.
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [301, 302, 303, 304, 305, 306, 307, 308]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = ['leadfeast', 'belongfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-patrolblank');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'patrolblank-beats');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const policyFor = (id) => id === 'leadfeast' ? TF.leadfeast : TF.belongfeast;

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'patrolblank', fullTelemetry: false });
  await setupGame(Game);
  const ctx = PB.attachPatrolBlank(Game);
  // Daily threat probe (read-only, RNG-free): hook the day loop via the
  // policy's existing daily entry — simplest honest hook: wrap setupGame's
  // Game.afterDay? Not all policies expose it. Instead probe from within
  // resolveAssignments? No — daily cadence: wrap Game.say is part-gated.
  // Honest minimal hook: wrap Game.endDay if present, else Game.newDay.
  try {
    const hook = Game.endDay ? 'endDay' : (Game.newDay ? 'newDay' : null);
    if (hook) {
      const _orig = Game[hook].bind(Game);
      Game[hook] = function () { const r = _orig.apply(this, arguments); ctx.probeThreat(); return r; };
    }
  } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const finalEngineDay = gday(Game);
  const run = { seed, policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    finalEngineDay, ctx,
    national: (() => { try { return (result.samples.scale || []).some(r => /national|global/.test(String(r && r[1]))) ? 1 : 0; } catch (e) { return 0; } })(),
    table: 0, wins: result && Game.won ? 1 : 0, exiled: 0 };
  // table: invite observed? read from telemetry like sibling sweeps do via C.inviteDay;
  // here: any 'TABLE'/'invitation' tele record — best-effort read-only scan.
  try {
    const tel = result.telemetry || [];
    run.table = tel.some(t => /invitation|seven doors|THE TABLE is set/i.test(JSON.stringify(t))) ? 1 : 0;
  } catch (e) {}
  const out = PB.summarize(run);
  out.dayTiersScale = (() => { try { return (result.samples.scale || []).slice(-1); } catch (e) { return []; } })();
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (ctx.sayBeats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(ctx.sayBeats.slice(0, 300), null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} fires=${out.fires} attempts=${out.attempts} resolves=${out.resolutions} dirWrites=${out.directWrites} leads=${out.patrolLeads} chall=${out.patrolChallenges} threat=${out.threatPresent}/${out.threatDays} near=${out.threatNear} nat=${out.national} tbl=${out.table} win=${out.wins}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  let only = null;
  if (process.env.ONLY) { only = {}; for (const part of process.env.ONLY.split(';')) { const p = part.trim(); if (p) only[p] = true; } }
  for (const policyId of POLICIES) {
    if (only && !only[policyId]) continue;
    for (const seed of SEEDS) await oneRun(seed, policyId);
  }
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-patrolblank/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun };
