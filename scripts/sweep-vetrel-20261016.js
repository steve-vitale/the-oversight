#!/usr/bin/env node
// scripts/sweep-vetrel-20261016.js — sim-vetrel pilot sweep (finding #427's
// named next: make the companion-veteran channel RELIABLE).
//
// QUESTION: does the vetrel driver raise companion wave-3 kill volume vs
// control on the pre-seat courtship substrate?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: leadfeast, belongfeast (VETREL unset)
//   armed:   vetrel-lead, vetrel-belong (VETREL=1)
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
//
// PRE-REGISTRATION (written before the pilot — see
// evidence/2026-10-16/sim-vetrel.md):
//   Primary (binding): companion wave-3 kills (via='companion', w>=3)
//     armed - control >= 3 across the 16-run pilot.
//   GO: diff >= 3 -> confirm on 12-16 fresh seeds.
//   KILL: miss -> delete scripts/policies/vetrel.js zero-trace.
//   GUARDRAILS: no new death mode (n>=3); median survival >= control-10d
//     (per policy pair); scholar deaths <= control+2; national >= control-2.
//   Secondary (report-only): vet=2-peak rate, wave-4 unlocks.
//   Seeds: 8 fresh (1221-1228). Horizon: 180d death-aware.
//
// Usage:
//   SEEDS="1221,1222,1223,1224,1225,1226,1227,1228" DAYS=180 \
//   OUT=evidence/2026-10-16/sim-vetrel-pilot.json \
//   PERSEED=evidence/2026-10-16/perseed-vetrel \
//   node scripts/sweep-vetrel-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');

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
  if (gate) process.env.VETREL = '1'; else delete process.env.VETREL;
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'vetrel-' + policy.id });
  await setupGame(Game);
  const trace = [];
  const snap = {};
  const base = policy;
  const origDaily = base.daily;
  let lastBearer = null, scholarDeaths = 0, vet2peak = 0;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      const d = dayOf(G);
      try {
        const b = G.villagerId;
        if (lastBearer !== null && b !== lastBearer) scholarDeaths++;
        lastBearer = b;
      } catch (e) {}
      if (d % 15 === 0 || d === 1) {
        try {
          const rr = readinessRow(G);
          trace.push(Object.assign({ d }, rr));
          if ((rr.veterans | 0) >= 2) vet2peak = 1;
        } catch (e) {}
      }
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['vetInvitesOk', 'vetHunts', 'vetHuntLegs', 'vetHuntEngaged', 'vetHuntFights', 'vetYields', 'vetBreakoffs', 'vetRescues']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, sampleEvery: 15 }));
  const final = readinessRow(Game);
  const log = Game.state.waveKillLog || [];
  const w3kills = log.filter(e => e && (e.w | 0) >= 3).length;
  const w3by = {};
  for (const e of log) {
    if (e && (e.w | 0) >= 3) w3by[e.via || '?'] = (w3by[e.via || '?'] || 0) + 1;
  }
  const companionW3 = log.filter(e => e && (e.w | 0) >= 3 && e.via === 'companion').length;
  let national = 0;
  try {
    const v = Game.state.village || {};
    const rank = v.scaleRank || v.rank || '';
    national = (rank === 'national' || rank === 'global') ? 1 : 0;
  } catch (e) {}
  return {
    policy: policy.id, gate: gate ? '1' : '0', seed,
    days: result.days, endReason: result.endReason || 'alive',
    deathCause: result.endReason === 'alive' ? null : deathCause(Game),
    scholarDeaths, vet2peak, nationalFinal: national,
    w4unlock: (final.maxWave >= 4) ? 1 : 0,
    maxWave: final.maxWave,
    finalReadiness: final,
    w3kills, w3by, companionW3,
    snap, trace,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '1221,1222,1223,1224,1225,1226,1227,1228').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-16/sim-vetrel-pilot.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: leadfeast, gate: false },
    { policy: belongfeast, gate: false },
    { policy: vetrelLead, gate: true },
    { policy: vetrelBelong, gate: true },
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
      console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} compW3=${row.companionW3} w4=${row.w4unlock} ` +
        `vet2pk=${row.vet2peak} rd=${row.finalReadiness.armored}/${row.finalReadiness.armed}/${row.finalReadiness.tricks}/${row.finalReadiness.veterans} ` +
        `w3k=${row.w3kills} schD=${row.scholarDeaths} hunts=${row.snap.vetHunts || 0} yields=${row.snap.vetYields || 0} brk=${row.snap.vetBreakoffs || 0}`);
    }
  }
  // Summary.
  const sum = {};
  for (const r of rows) {
    const k = r.gate === '1' ? 'armed' : 'control';
    sum[k] = sum[k] || { n: 0, companionW3: 0, w4: 0, vet2peak: 0, national: 0, surv: [], scholarDeaths: 0, deaths: {} };
    sum[k].n++;
    sum[k].companionW3 += r.companionW3;
    sum[k].w4 += r.w4unlock;
    sum[k].vet2peak += r.vet2peak;
    sum[k].national += r.nationalFinal;
    sum[k].scholarDeaths += r.scholarDeaths;
    sum[k].surv.push(r.days);
    if (r.deathCause) sum[k].deaths[r.deathCause] = (sum[k].deaths[r.deathCause] || 0) + 1;
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  for (const k of Object.keys(sum)) sum[k].medianSurv = med(sum[k].surv);
  const diff = sum.armed.companionW3 - sum.control.companionW3;
  const go = diff >= 3;
  console.log('\nSUMMARY: ' + JSON.stringify(sum, null, 1));
  console.log(`PRIMARY: armed companionW3=${sum.armed.companionW3} control companionW3=${sum.control.companionW3} diff=${diff} bar>=3 -> ${go ? 'GO' : 'NO-GO (KILL)'}`);
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ preRegistration: 'see evidence/2026-10-16/sim-vetrel.md', summary: sum, diff, go, rows }, null, 1));
    console.log('wrote ' + out);
  } catch (e) { console.error('write failed', e.message); }
  delete process.env.VETREL;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
