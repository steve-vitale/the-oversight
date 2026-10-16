#!/usr/bin/env node
// scripts/sweep-arming-20261016.js — sim-arming pilot sweep (finding #427).
//
// QUESTION: is wave-4 readiness (waveCombatReadiness: 4x P>=15 armored,
// 5 armed, 3 counters, 2 veterans) satisfiable by ANY policy on the
// pre-seat courtship substrate, or structurally unreachable?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: leadfeast, belongfeast (ARMING unset)
//   armed:   arming-lead, arming-belong (ARMING=1)
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
//
// PRE-REGISTRATION (written before the pilot):
//   Primary metric: wave-4 unlocks (maxWave >= 4 at any point in the run).
//   GO: (armed unlocks) - (control unlocks) >= 4 across the 16-run pilot.
//   KILL: miss the GO bar. Verdict on miss: "structurally unreachable on
//         pre-seat" — the w4/5 trick game belongs to the winning substrate.
//   GUARDRAILS: no new death mode (n>=3); national >= control-2 (per 8);
//               median survival >= control-10d (per policy pair).
//   Horizon: 180d death-aware (dead villages stop; the scale wall needs the
//            full clock — wave 3 fires ~d25-75, Standing crosses 100 ~d60-120).
//   Seeds: 8 fresh seeds (drawn from the run's seed pool).
//   Policies: leadfeast/belongfeast x control/armed.
//   Substrate: SEATDRIVE=0, FEASTSCALE_R13=1.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//   OUT=evidence/2026-10-16/sim-arming-pilot.json \
//   PERSEED=evidence/2026-10-16/perseed-arming \
//   node scripts/sweep-arming-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { armingLead, armingBelong } = require('./policies/arming');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function readinessRow(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    const tot = Game.villageStandingTotal();
    const gated = (typeof tot === 'number') ? tot : ((tot && (tot.gated != null ? tot.gated : tot.total)) | 0);
    return {
      ready: !!r.ready, armored: r.armored | 0, armed: r.armed | 0,
      tricks: r.tricks | 0, veterans: r.veterans | 0,
      short: (r.short || []).join('|') || 'NONE',
      standingGated: gated | 0,
      maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    };
  } catch (e) { return { err: String(e && e.message).slice(0, 60) }; }
}

function deathCause(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return s.deathCause || s.causeOfDeath || 'unknown';
  } catch (e) { return 'unknown'; }
}

async function runOne(policy, gate, seed, days) {
  if (gate) process.env.ARMING = '1'; else delete process.env.ARMING;
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'arming-' + policy.id });
  await setupGame(Game);
  const trace = [];
  const snap = {};
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      const d = dayOf(G);
      if (d % 15 === 0 || d === 1) { try { trace.push(Object.assign({ d }, readinessRow(G))); } catch (e) {} }
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['armoryCrafted', 'armoryDonated', 'barkCrafted', 'tricksTaught', 'companionInvitesOk', 'vetHunts', 'vetHuntLegs', 'vetHuntFights', 'huntEngaged']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, sampleEvery: 15 }));
  const final = readinessRow(Game);
  const w3kills = ((Game.state.waveKillLog || []).filter(e => e && (e.w | 0) >= 3)).length;
  const w3by = {};
  for (const e of (Game.state.waveKillLog || [])) {
    if (e && (e.w | 0) >= 3) w3by[e.via || '?'] = (w3by[e.via || '?'] || 0) + 1;
  }
  // national reach: best scale rank seen
  let national = 0;
  try {
    const v = Game.state.village || {};
    const rank = v.scaleRank || v.rank || '';
    national = (rank === 'national' || rank === 'global') ? 1 : 0;
    // also check history via trace? keep it simple: final rank + a flag
  } catch (e) {}
  return {
    policy: policy.id, gate: gate ? '1' : '0', seed,
    days: result.days, endReason: result.endReason || 'alive',
    deathCause: result.endReason === 'alive' ? null : deathCause(Game),
    nationalFinal: national,
    w4unlock: (final.maxWave >= 4) ? 1 : 0,
    maxWave: final.maxWave,
    finalReadiness: final,
    w3kills, w3by,
    snap, trace,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-16/sim-arming-pilot.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: leadfeast, gate: false },
    { policy: belongfeast, gate: false },
    { policy: armingLead, gate: true },
    { policy: armingBelong, gate: true },
  ];
  const rows = [];
  for (const a of arms) {
    for (const seed of seeds) {
      const row = await runOne(a.policy, a.gate, seed, days);
      rows.push(row);
      if (perSeedDir) {
        try {
          fs.mkdirSync(perSeedDir, { recursive: true });
          fs.writeFileSync(path.join(perSeedDir, `${row.policy}-s${seed}.json`), JSON.stringify(row, null, 1));
        } catch (e) {}
      }
      console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} w4=${row.w4unlock} maxW=${row.maxWave} ` +
        `rd=${row.finalReadiness.armored}/${row.finalReadiness.armed}/${row.finalReadiness.tricks}/${row.finalReadiness.veterans} ` +
        `short=${row.finalReadiness.short} w3k=${row.w3kills} hunts=${row.snap.vetHunts || 0}`);
    }
  }
  // Summary.
  const sum = {};
  for (const r of rows) {
    const k = r.gate === '1' ? 'armed' : 'control';
    sum[k] = sum[k] || { n: 0, w4: 0, national: 0, surv: [], deaths: {} };
    sum[k].n++;
    sum[k].w4 += r.w4unlock;
    sum[k].national += r.nationalFinal;
    sum[k].surv.push(r.days);
    if (r.deathCause) sum[k].deaths[r.deathCause] = (sum[k].deaths[r.deathCause] || 0) + 1;
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  for (const k of Object.keys(sum)) sum[k].medianSurv = med(sum[k].surv);
  const go = (sum.armed.w4 - sum.control.w4) >= 4;
  console.log('\nSUMMARY: ' + JSON.stringify(sum, null, 1));
  console.log(`PRIMARY: armed w4=${sum.armed.w4} control w4=${sum.control.w4} diff=${sum.armed.w4 - sum.control.w4} bar>=4 -> ${go ? 'GO' : 'NO-GO (KILL)'}`);
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ preRegistration: 'see scripts/sweep-arming-20261016.js header', summary: sum, go, rows }, null, 1));
    console.log('wrote ' + out);
  } catch (e) { console.error('write failed', e.message); }
  delete process.env.ARMING;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
