#!/usr/bin/env node
// scripts/sweep-feastscale-20261013.js — scale-wall r13 measurement driver.
//
// Reuses scale-repro-20261013's scale telemetry (attachScale / scaleRow /
// finalizeScale) and food-coupling-20261013's food instruments, with an
// extended policy registry (belongfeast / leadfeast) and feast-chain
// telemetry (feasts hosted, armed feasts, buff grants, feastSurgeUsed).
//
// Baseline:  SEEDS="11,22,33,44" POLICIES="belongseek,leadcourt" DAYS=150 node scripts/sweep-feastscale-20261013.js
// Pilot:     FEASTSCALE_R13=1 SEEDS="11,22,33,44" POLICIES="belongfeast,leadfeast" DAYS=150 node scripts/sweep-feastscale-20261013.js
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const POLICY_REGISTRY = { belongseek, leadcourt, belongfeast, leadfeast };

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

function attachFeast(Game) {
  const ft = { feasts: 0, armedFeasts: 0, grants: 0 };
  const oh = Game.hostFeast, og = Game.grantFeastBuff;
  if (typeof oh === 'function') {
    Game.hostFeast = function (...a) {
      const r = oh.apply(this, a);
      try { if (r && r.ok) { ft.feasts++; if (r.surgeSpent > 0) ft.armedFeasts++; } } catch (e) {}
      return r;
    };
  }
  if (typeof og === 'function') {
    Game.grantFeastBuff = function (...a) {
      const r = og.apply(this, a);
      try { if (r && r.granted) ft.grants++; } catch (e) {}
      return r;
    };
  }
  return ft;
}

function finalizeFeast(Game, ft) {
  const out = { feasts: ft.feasts, armedFeasts: ft.armedFeasts, grants: ft.grants };
  try {
    const s = Game.state.scholar || {};
    out.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed);
    out.armedEver = !!((s.prog || {}).feastSurge) || out.grants > 0;
  } catch (e) { out.feastSurgeUsed = false; out.armedEver = false; }
  try { out.sentimentTaught = !!(Game.sentimentTaught && Game.sentimentTaught()); } catch (e) { out.sentimentTaught = false; }
  try { out.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : 0; } catch (e) { out.unlockedWave = 0; }
  return out;
}

async function main() {
  const label = process.env.LEVER || 'feastscale-r13';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'feastscale-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const ft = attachFeast(Game);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const row = Object.assign({ label, policy: pid, seed },
        fc.finalize(Game, m, result), finalizeScale(Game, m), finalizeFeast(Game, ft));
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} rank=${row.rank} natHeld=${row.nationalHeldDays} feast=${row.feasts}/${row.armedFeasts} grants=${row.grants} used=${row.feastSurgeUsed ? 1 : 0} taught=${row.sentimentTaught ? 1 : 0} wave=${row.unlockedWave} exiled=${row.exiledEver}${row.exileDay != null ? ('@' + row.exileDay) : ''} vests=${row.vests} tribOut=${row.tributePaidK.toFixed(0)}k`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const s = {
    label, runs: rows.length,
    national: agg(r => (r.nationalHeldDays > 0 ? 1 : 0)),
    table: agg(r => r.table),
    won: agg(r => r.won),
    wave4: agg(r => (r.unlockedWave >= 4 ? 1 : 0)),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    vests: agg(r => r.vests),
    exiledEver: agg(r => r.exiledEver),
    feasts: agg(r => r.feasts),
    armedFeasts: agg(r => r.armedFeasts),
    grants: agg(r => r.grants),
    feastSurgeUsed: agg(r => (r.feastSurgeUsed ? 1 : 0)),
    sentimentTaught: agg(r => (r.sentimentTaught ? 1 : 0)),
    ms: Date.now() - t0,
  };
  console.log(`\nwall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays} vests ${s.vests} exiledEver ${s.exiledEver}/${s.runs}`);
  console.log(`feast: feasts ${s.feasts} armed ${s.armedFeasts} grants ${s.grants} used ${s.feastSurgeUsed}/${s.runs} taught ${s.sentimentTaught}/${s.runs}`);
  const out = process.env.OUT;
  const rep = { summary: s, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(rep.summary));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { attachFeast, finalizeFeast };
