#!/usr/bin/env node
// scripts/sweep-huntstaff-chan-b.js — lever sweep for the huntstaff-b arm
// (sim-huntstaff-b, food-economy axis, loop B, backlog #703).
//
// NAME NOTE: scripts/sweep-huntstaff-b.js is the OLD sim-huntstaff-b arm's
// kept instrument (killed at pilot c55959a17 — the kill protocol keeps
// instruments). This sweep is the channel-staffing arm's own.
//
// QUESTION (pre-registered, binding — see evidence/2026-10-21/sim-huntstaff-b.md):
// does additive hunt-duty staffing (HUNTSTAFF_B=1, up to N=2 free
// villagers/day at the START of policy.daily, occupation-preferred,
// deterministic) produce real village inflow on the competent substrate?
//
// DESIGN: 8 FRESH seeds 8901-8908 x {leadfeast, belongfeast} x
// {control, armed} x {rep 1 (measurement), rep 2 (det-gate pair)} = 64 runs,
// 180d death-aware, identical seeds, own paired control in the SAME sweep.
// control = HUNTSTAFF_B unset (pure leadfeast/belongfeast);
// armed   = HUNTSTAFF_B=1 (leadstaffhunt/belongstaffhunt).
// Substrate (asserted up front, LOUD STOP on mismatch): FEASTSCALE_R13=1,
// SEATDRIVE=0 explicit, SURPLUSFEED unset (the sim-glutprobe-b DIAG substrate).
//
// INSTRUMENT: scripts/probe-glut-instruments.js attachProbe — the DIAG's
// call-path channel attribution (13/13 GREEN + det-gate byte-identical):
// W.inflow['duty:hunt'] IS the PRIMARY metric (the DIAG measured it at 0);
// W.rotByChFast gives the fast-rot guardrail; W.deaths are kind-aware;
// W.laundered guards laundering. Instrument-honesty gate: unattributed < 1%
// of chokeTotal on every run (the DIAG's binding bar) — flagged loudly.
//
// Pre-registration summary (binding, MEASUREMENT.md §§9-12, 14-15):
//   PRIMARY: pooled armed duty:hunt kcal/day - pooled control duty:hunt
//     kcal/day >= +120 kcal/day. Derivation: control measured 0 in the
//     DIAG (no ratio-on-zero); duty:fish on the same substrate delivers
//     588 kcal/day lean mean (the reference staffed duty channel); +120 is
//     ~1/5 of the fish reference — a clear "real channel, not decoration"
//     signal that doesn't demand hunt beat the fish leg.
//   GUARDRAILS (all hard): starvation deaths armed <= control; matched
//     median survival >= control-10d; national >= control-2;
//     fast-rot pooled/100d armed <= 1.15x control; laundering == 0;
//     no new death mechanism (armed death kinds ⊆ control kinds ∪ known).
//   SECONDARY (report-only): duty:garden inflow (watch — the DIAG's other
//     zero channel); per-policy heterogeneity.
//   DET-GATE: 16/16 configs x 2 sides = 32 repeat-pairs bit-identical
//     (day-hash trajectories) before trusting numbers.
//   SENSE: staffing say lines + hunt resolve beats captured separately
//     (scripts/sense-huntstaff-b.js), read for honesty per SENSE-TESTING LAW.
//
// Horizon: 180d death-aware (runDays stops on village death +10d tail).
//
// Usage (READ THIS HEADER BEFORE EVERY RUN — the env trap):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-huntstaff-chan-b.js
// Targeted: SEEDS="8901,8902" ONLY="leadfeast" SIDES="armed" REPS="1" node ...
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---- substrate asserts (LOUD STOP — the env trap) ----
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required in the env (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required in the env (pre-seat substrate).'); process.exit(2); }
if (process.env.SURPLUSFEED) { console.error('SWEEP STOP: SURPLUSFEED must be unset (DIAG substrate).'); process.exit(2); }

const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadstaffhunt, belongstaffhunt } = require('./policies/huntstaff-b');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { attachProbe } = require('./probe-glut-instruments');

// ---- banned-seed check (coordinator's list; sweep STOPS on any hit) ----
const BANNED = new Set();
for (const spec of ['5201-5208', '5301-5308', '5401-5434', '5601-5608', '8001-8808']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [8901, 8902, 8903, 8904, 8905, 8906, 8907, 8908]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const POLICIES = process.env.ONLY ? [process.env.ONLY]
  : ['leadfeast', 'belongfeast'];
const SIDES = process.env.SIDES ? [process.env.SIDES] : ['control', 'armed'];
const REPS = process.env.REPS ? [parseInt(process.env.REPS, 10)] : [1, 2];
const DAYS = 180;
const DATE = '2026-10-21';
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-huntstaff-b');

function policyFor(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? leadstaffhunt : belongstaffhunt;
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

async function oneRun(seed, policyId, side, rep) {
  if (side === 'armed') process.env.HUNTSTAFF_B = '1'; else delete process.env.HUNTSTAFF_B;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `huntstaffb-${side}-${policyId}-r${rep}`, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const W = attachProbe(Game);
  const hashes = [];
  let runCtx = null;
  const pol = Object.assign({}, base);
  const oDaily = base.daily;
  pol.daily = (G, ctx) => {
    runCtx = ctx;
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  const t0 = Date.now();
  let r;
  await quietLog(async () => { r = await runDays(Game, pol, { days: DAYS, sampleEvery: 1 }); });
  const ms = Date.now() - t0;

  // wall numbers (the DIAG's top-level convention)
  let nationalLive = false, tableWaiting = false, rank = '?', maxWave = 1;
  try {
    nationalLive = !!((Game.state || {}).nationalLive);
    const ps = Game.progState ? Game.progState() : {};
    tableWaiting = !!(ps.tableWaiting);
    rank = Game.scaleRank ? Game.scaleRank() : '?';
    maxWave = Game.unlockedWave ? Game.unlockedWave() : 1;
  } catch (e) {}

  const inflow = W.inflow || {};
  const rotFast = W.rotByChFast || {};
  const fastRot = Object.values(rotFast).reduce((t, v) => t + (v || 0), 0);
  const deaths = W.deaths || [];
  const starvDeaths = deaths.filter(d => /starv/i.test(String(d.cause || ''))).length;
  const unatt = inflow.unattributed || 0;
  const unattShare = (W.chokeTotal || 0) > 0 ? unatt / W.chokeTotal : 0;
  const detHash = crypto.createHash('sha256').update(hashes.join('\n')).digest('hex');

  const end = {
    arm: 'sim-huntstaff-b', side, policy: base.id, seed, rep,
    days: r.days, endReason: r.endReason,
    won: !!Game.won, national: nationalLive, table: tableWaiting,
    rank, maxWave,
    huntKcal: Math.round(inflow['duty:hunt'] || 0),
    gardenKcal: Math.round(inflow['duty:garden'] || 0),
    fishKcal: Math.round(inflow['duty:fish'] || 0),
    chokeTotal: Math.round(W.chokeTotal || 0),
    unattributed: Math.round(unatt), unattShare: +unattShare.toFixed(4),
    fastRot: Math.round(fastRot),
    laundered: W.laundered || 0,
    starveDays: W.starveDays || 0, starvationDeaths: starvDeaths,
    deaths: deaths.map(d => ({ day: d.day, kind: d.kind, cause: d.cause, player: d.player, cls: d.cls })),
    staffed: (runCtx && runCtx._hsbStaffed) || 0,
    staffDays: (runCtx && runCtx._hsbStaffDays) || 0,
    assignLog: ((runCtx && runCtx._hsbAssignLog) || []).map(e => ({ day: e.day, vid: e.vid, name: e.name, occ: e.occ })),
    detHash, ms,
  };
  return end;
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      for (const side of SIDES) {
        for (const rep of REPS) {
          let end;
          try { end = await oneRun(seed, policyId, side, rep); }
          catch (e) { console.error(`RUN CRASH seed=${seed} ${policyId}/${side}/rep${rep}: ${e && e.stack || e}`); process.exit(2); }
          rows.push(end);
          const f = path.join(EVID, `${side}-${policyId}-s${seed}-rep${rep}.json`);
          fs.writeFileSync(f, JSON.stringify(end, null, 1));
          console.log(`done seed=${seed} ${policyId}/${side}/rep${rep} days=${end.days} end=${end.endReason} ` +
            `hunt=${Math.round(end.huntKcal / 1000)}k garden=${Math.round(end.gardenKcal / 1000)}k ` +
            `unatt=${(end.unattShare * 100).toFixed(2)}% fastRot=${Math.round(end.fastRot / 1000)}k ` +
            `starvD=${end.starvationDeaths} staffed=${end.staffed}/${end.staffDays}d (${end.ms}ms)`);
          if (end.unattShare >= 0.01) console.error(`  HONESTY FLAG: unattributed ${(end.unattShare * 100).toFixed(2)}% on ${f}`);
        }
      }
    }
  }
  // det-gate report (rep1 vs rep2)
  if (REPS.includes(1) && REPS.includes(2)) {
    let pairs = 0, okN = 0;
    const fails = [];
    for (const seed of SEEDS) for (const policyId of POLICIES) for (const side of SIDES) {
      pairs++;
      const want = side === 'armed' ? policyId.replace('feast', 'staffhunt') : policyId;
      const a = rows.find(r => r.seed === seed && r.policy === want && r.side === side && r.rep === 1);
      const b = rows.find(r => r.seed === seed && r.policy === want && r.side === side && r.rep === 2);
      if (a && b && a.detHash === b.detHash) okN++;
      else fails.push(`${seed}/${policyId}/${side}`);
    }
    console.log(`\nDET-GATE: ${okN}/${pairs} repeat-pairs bit-identical${fails.length ? ' — FAILED: ' + fails.join(', ') : ''}`);
    if (fails.length) process.exit(3);
  }
  delete process.env.HUNTSTAFF_B;
  console.log('sweep complete.');
}

main().catch(e => { console.error('SWEEP CRASH', e && e.stack || e); process.exit(2); });
