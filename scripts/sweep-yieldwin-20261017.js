#!/usr/bin/env node
// scripts/sweep-yieldwin-20261017.js — sim-yieldwin pilot sweep
// (flesh-out loop, 2026-10-17, run fleshout-20261017-044712, axis
// scale-onramp, arm sim-yieldwin: deepen the vetrel yield window).
//
// QUESTION: does the yieldwin deepener raise companion wave-3 kill volume
// vs the vetrel control on the pre-seat courtship substrate?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: vetrel-lead, vetrel-belong (VETREL=1)
//   armed:   yieldwin-lead, yieldwin-belong (VETREL=1, YIELDWIN=1)
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
//
// PRE-REGISTRATION (written before the pilot — see
// evidence/2026-10-17/sim-yieldwin.md):
//   Primary (binding): companion wave-3 kills (via='companion', w>=3):
//     armed >= 1.5x paired control AND armed >= 6 (vetrel baseline
//     ~0.45/run; the yield must move the needle, not just exist).
//   GO: both bars -> arm confirmed (lands).
//   KILL: miss -> delete scripts/policies/yieldwin.js zero-trace per kill
//     protocol; keep instruments + evidence.
//   GUARDRAILS: no new death mode (n>=3); median survival >= control-10d
//     (per policy pair); scholar deaths <= control; national >= control-2.
//   Secondary (report-only): vet=2-peak rate, wave-4 unlocks, yield
//     telemetry (ywYields, ywKillRangeHolds, ywStealRefusals, ywFirstBlood).
//   Seeds: 8 fresh (1251-1258; 0 filename/content hits across evidence/).
//   Horizon: 180d death-aware (+10d tail max via runDays).
//
// Usage:
//   SEEDS="1251,1252,1253,1254,1255,1256,1257,1258" DAYS=180 \
//   OUT=evidence/2026-10-17/sim-yieldwin-pilot.json \
//   PERSEED=evidence/2026-10-17/perseed-yieldwin \
//   node scripts/sweep-yieldwin-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP: the layer was deleted after the PRIMARY NO-GO
// (evidence/2026-10-17/sim-yieldwin.md). Without the layer the sweep is not
// applicable — exit green instead of FATAL-ing on the require below.
if (!fs.existsSync(path.join(__dirname, 'policies', 'yieldwin.js'))) {
  console.log('INFO-SKIP: yieldwin layer deleted per kill protocol (sim-yieldwin PRIMARY NO-GO) — sweep not applicable.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
const { yieldwinLead, yieldwinBelong } = require('./policies/yieldwin');

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

const YW_KEYS = ['ywFirstBlood', 'ywYields', 'ywKillRangeHolds', 'ywStealRefusals'];
const VET_KEYS = ['vetInvitesOk', 'vetHunts', 'vetHuntLegs', 'vetHuntEngaged', 'vetHuntFights', 'vetYields', 'vetBreakoffs', 'vetRescues'];

async function runOne(policy, gate, seed, days) {
  if (gate) { process.env.VETREL = '1'; process.env.YIELDWIN = '1'; }
  else { process.env.VETREL = '1'; delete process.env.YIELDWIN; }
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'yieldwin-' + policy.id });
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
        for (const k of YW_KEYS.concat(VET_KEYS)) {
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
  const seeds = (process.env.SEEDS || '1251,1252,1253,1254,1255,1256,1257,1258').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-17/sim-yieldwin-pilot.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: vetrelLead, gate: false },
    { policy: vetrelBelong, gate: false },
    { policy: yieldwinLead, gate: true },
    { policy: yieldwinBelong, gate: true },
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
        `vet2pk=${row.vet2peak} w3k=${row.w3kills} schD=${row.scholarDeaths} ` +
        `ywY=${row.snap.ywYields || 0} ywKR=${row.snap.ywKillRangeHolds || 0} ywSR=${row.snap.ywStealRefusals || 0} ywFB=${row.snap.ywFirstBlood || 0}`);
    }
  }
  // Summary.
  const sum = {};
  for (const r of rows) {
    const k = r.gate === '1' ? 'armed' : 'control';
    sum[k] = sum[k] || { n: 0, companionW3: 0, w4: 0, vet2peak: 0, national: 0, surv: [], scholarDeaths: 0, deaths: {}, yw: { firstBlood: 0, yields: 0, killRangeHolds: 0, stealRefusals: 0 } };
    sum[k].n++;
    sum[k].companionW3 += r.companionW3;
    sum[k].w4 += r.w4unlock;
    sum[k].vet2peak += r.vet2peak;
    sum[k].national += r.nationalFinal;
    sum[k].scholarDeaths += r.scholarDeaths;
    sum[k].surv.push(r.days);
    if (r.deathCause) sum[k].deaths[r.deathCause] = (sum[k].deaths[r.deathCause] || 0) + 1;
    for (const [sk, ck] of [['firstBlood', 'ywFirstBlood'], ['yields', 'ywYields'], ['killRangeHolds', 'ywKillRangeHolds'], ['stealRefusals', 'ywStealRefusals']]) {
      sum[k].yw[sk] += r.snap[ck] || 0;
    }
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  for (const k of Object.keys(sum)) sum[k].medianSurv = med(sum[k].surv);
  const ratio = sum.control.companionW3 > 0 ? sum.armed.companionW3 / sum.control.companionW3 : (sum.armed.companionW3 > 0 ? Infinity : NaN);
  const go = sum.armed.companionW3 >= 1.5 * sum.control.companionW3 && sum.armed.companionW3 >= 6;
  console.log('\nSUMMARY: ' + JSON.stringify(sum, null, 1));
  console.log(`PRIMARY: armed companionW3=${sum.armed.companionW3} control companionW3=${sum.control.companionW3} ` +
    `ratio=${Number.isFinite(ratio) ? ratio.toFixed(2) : ratio} bars(>=1.5x AND >=6) -> ${go ? 'GO' : 'NO-GO (KILL)'}`);
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ preRegistration: 'see evidence/2026-10-17/sim-yieldwin.md', summary: sum, ratio: Number.isFinite(ratio) ? ratio : String(ratio), go, rows }, null, 1));
    console.log('wrote ' + out);
  } catch (e) { console.error('write failed', e.message); }
  delete process.env.VETREL;
  delete process.env.YIELDWIN;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
