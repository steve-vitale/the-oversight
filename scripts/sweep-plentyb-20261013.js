#!/usr/bin/env node
// scripts/sweep-plentyb-20261013.js — plenty-stand arm driver (loop B, 2026-10-13).
//
// Measures the r13 feast instrument against the STANDING plenty feed:
// policies leadcourt (baseline) vs leadfeast (FEASTSCALE_R13=1), 8 seeds
// (11/22/33/44/55/66/77/88), 180d death-aware horizon (runDays stops on
// Game.over / pop zero).
//
// Pre-registered GO: plenty points >0 on >=4/8 runs AND median survival
// within ±10d of baseline AND no wall-metric regression.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { leadfeast } = require('./policies/feastscale');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');
const { attachFeast, finalizeFeast } = require('./sweep-feastscale-20261013');
const fc = require('./food-coupling-20261013');

const POLICY_REGISTRY = { leadcourt, leadfeast };

function standingRow(Game) {
  try {
    const s = Game.villageStanding();
    return {
      total: s.total | 0, war: s.war | 0, diplomacy: s.diplomacy | 0, plenty: s.plenty | 0,
      warPts: s.warPts | 0, links: s.links | 0, feasts: s.feasts | 0,
    };
  } catch (e) { return null; }
}

function wave4Faced(Game) {
  try { return (Game.waveEngaged && Game.waveEngaged(4) > 0) || false; } catch (e) { return false; }
}

async function main() {
  const label = process.env.LEVER || 'plentyb';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadcourt,leadfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    // the feast layer is opt-in per-policy: only leadfeast runs with it on
    if (pid === 'leadfeast') process.env.FEASTSCALE_R13 = '1';
    else delete process.env.FEASTSCALE_R13;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'plentyb-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const ft = attachFeast(Game);
      const st = { max: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 } };
      const origDaily = base.daily;
      const policy = Object.assign({}, base);
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        try {
          const r = standingRow(G);
          if (r) for (const k of Object.keys(st.max)) if (r[k] > st.max[k]) st.max[k] = r[k];
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const fin = standingRow(Game) || { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 };
      const feas = finalizeFeast(Game, ft);
      const row = Object.assign({ label, policy: pid, seed },
        fc.finalize(Game, m, result), finalizeScale(Game, m), finalizeFeast(Game, ft),
        {
          standingMax: st.max, standingFinal: fin,
          t4Ever: st.max.total >= 100, t5Ever: st.max.total >= 200,
          wave4Faced: wave4Faced(Game),
          arc: (Game.progState ? (Game.progState() || {}).arc : null) || null,
          deaths: (result.samples && result.samples.deaths) || [],
        });
      rows.push(row);
      const l = row.standingMax;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} stand=${l.total}(w${l.war}/b${l.diplomacy}/p${l.plenty}) finP=${fin.plenty} t4=${row.t4Ever?1:0} t5=${row.t5Ever?1:0} wave4=${feas.unlockedWave}${row.wave4Faced?'(f)':''} feast=${row.feasts}/${row.armedFeasts} nat=${row.nationalHeldDays>0?1:0} table=${row.table} won=${row.won} vests=${row.vests} arc=${row.arc}`);
    }
  }
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const per = (pid) => rows.filter(r => r.policy === pid);
  const sum = (rs, fn) => rs.reduce((t, r) => t + fn(r), 0);
  const causeTallies = {};
  for (const r of rows) for (const d of r.deaths) {
    const k = (d.kind || 'unknown') + '/' + (d.player ? 'player' : 'villager');
    causeTallies[k] = (causeTallies[k] || 0) + 1;
  }
  const agg = (pid) => {
    const rs = per(pid);
    return {
      policy: pid, runs: rs.length,
      plentyRuns: sum(rs, r => (r.standingMax.plenty > 0 ? 1 : 0)),
      medianStandingMax: med(rs.map(r => r.standingMax.total)),
      medianPlentyMax: med(rs.map(r => r.standingMax.plenty)),
      medianPlentyFinal: med(rs.map(r => r.standingFinal.plenty)),
      t4: sum(rs, r => (r.t4Ever ? 1 : 0)),
      t5: sum(rs, r => (r.t5Ever ? 1 : 0)),
      wave4unlock: sum(rs, r => (r.unlockedWave >= 4 ? 1 : 0)),
      wave4Faced: sum(rs, r => (r.wave4Faced ? 1 : 0)),
      feasts: sum(rs, r => r.feasts),
      grants: sum(rs, r => r.grants),
      national: sum(rs, r => (r.nationalHeldDays > 0 ? 1 : 0)),
      table: sum(rs, r => r.table),
      won: sum(rs, r => r.won),
      vests: sum(rs, r => r.vests),
      medianDays: med(rs.map(r => r.days)),
      maxDays: Math.max(...rs.map(r => r.days)),
      medianArc: med(rs.map(r => (r.arc || 1))),
    };
  };
  const s = {
    label, runs: rows.length, days, ms: Date.now() - t0,
    perPolicy: policyIds.map(agg), deathCauses: causeTallies,
  };
  console.log('\n== per-policy ==');
  for (const a of s.perPolicy) console.log(' ', JSON.stringify(a));
  console.log('deathCauses:', JSON.stringify(causeTallies));
  const out = process.env.OUT;
  const rep = { summary: s, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(s.perPolicy));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
