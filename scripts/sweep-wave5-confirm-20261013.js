#!/usr/bin/env node
// scripts/sweep-wave5-confirm-20261013.js — WAVE-5 REACHABILITY CONFIRM.
//
// MEASUREMENT ONLY. No game-code changes. Confirms whether the Standing bar
// (src/js/standing.js, landed e7c18b85, tuned e02c10a1) can ever open wave 5
// (T5=200 + wave-4 faced) in honest long-run sims.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12):
//   primary metric : wave-5 unlock rate (organic; no gates forced)
//   GO threshold   : DIAGNOSTIC — the suite completes (16/16 runs finish
//                    honestly) and T5 reachability is characterized with
//                    numbers. If 0/16 unlock: name the binding constraint
//                    with numbers — max Standing reached (per source), T4
//                    day, the day villages died, and which constraint binds
//                    (points vs survival).
//   horizon        : 180d death-aware (Steve's win-path horizon 180;
//                    runDays breaks on village-lost/pop-zero, so dead
//                    villages stop simulating; +10d tail inherent — no
//                    post-death projection)
//   seeds/policies : 11/22/33/44/55/66/77/88 x leadcourt + belongseek — the
//                    two high-standing roads from the tune sweep (6/8
//                    leadcourt T4 unlocks; belongseek max 59, closest hybrid)
//
// Usage:
//   OUT=evidence/2026-10-13/sim-wave5-b.json \
//   node scripts/sweep-wave5-confirm-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const tune = require('./sweep-standing-tune-20261013');

const POLICY_REGISTRY = { leadcourt, belongseek };

// death-cause shares from the harness's telemetry stream
function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

async function runConfirm(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'wave5-confirm';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'wave5-confirm-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      tune.attachStanding(Game, m);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      let w4faced = 0;
      try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
      let deeds = null;
      try { const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null; deeds = ds ? Object.keys(ds.wavesFaced || {}).length : 0; } catch (e) {}
      const row = Object.assign(
        { label, policy: pid, seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tune.finalizeStanding(Game, m),
        { w4faced, deedsFacedTypes: deeds, deathCauses: deathCauses(result) }
      );
      rows.push(row);
      const a = row.atT4;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `t4=${row.t4Day == null ? '-' : 'd' + row.t4Day} t5=${row.t5Day == null ? '-' : 'd' + row.t5Day} ` +
        `w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day} w5=${row.wave5Day == null ? '-' : 'd' + row.wave5Day} ` +
        `w4faced=${w4faced} driver=${row.driver} ` +
        (a ? `[w${a.warPts} l${a.links} f${a.feasts}]` : '') +
        ` end=${row.endStanding.total}(w${row.endStanding.war}/b${row.endStanding.diplomacy}/br${row.endStanding.plenty}) ` +
        `nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} table=${row.table ? 1 : 0} won=${row.won ? 1 : 0}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const t4days = rows.map(r => r.t4Day).filter(x => x != null);
  const t5days = rows.map(r => r.t5Day).filter(x => x != null);
  const ends = rows.map(r => r.endStanding.total);
  const endWar = rows.map(r => r.endStanding.war), endDip = rows.map(r => r.endStanding.diplomacy), endPl = rows.map(r => r.endStanding.plenty);
  const allCauses = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) allCauses[k] = (allCauses[k] || 0) + v;
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length,
    // PRIMARY: wave-5 unlock rate
    wave5Unlock: agg(r => r.wave5Day != null ? 1 : 0),
    wave5UnlockRate: +(agg(r => r.wave5Day != null ? 1 : 0) / rows.length).toFixed(3),
    t5Reached: agg(r => r.t5Day != null ? 1 : 0),
    earliestT5Day: t5days.length ? Math.min(...t5days) : null,
    // T4 context
    wave4Unlock: agg(r => r.wave4Day != null ? 1 : 0),
    earliestT4Day: t4days.length ? Math.min(...t4days) : null,
    medianT4Day: t4days.length ? med(t4days) : null,
    drivers: {},
    // binding-constraint numbers (which binds: points or survival?)
    maxStanding: Math.max(0, ...ends),
    medianEndStanding: med(ends),
    maxEndWar: Math.max(0, ...endWar), maxEndDiplomacy: Math.max(0, ...endDip), maxEndPlenty: Math.max(0, ...endPl),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(0, ...rows.map(r => r.days)),
    // wall numbers
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
    exiled: agg(r => r.exiledEver || 0),
    deathCauses: allCauses,
  };
  for (const r of rows) if (r.wave4Day != null) summary.drivers[r.driver] = (summary.drivers[r.driver] || 0) + 1;
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runConfirm({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`PRIMARY wave5 unlock rate: ${s.wave5UnlockRate} (${s.wave5Unlock}/${s.runs}) — T5 standing reached on ${s.t5Reached}/${s.runs} (earliest T5 d${s.earliestT5Day})`);
    console.log(`wave4 unlocks: ${s.wave4Unlock}/${s.runs} (earliest T4 d${s.earliestT4Day}, median d${s.medianT4Day}) drivers=${JSON.stringify(s.drivers)}`);
    console.log(`binding: maxStanding ${s.maxStanding} (war ${s.maxEndWar} / dip ${s.maxEndDiplomacy} / plenty ${s.maxEndPlenty}) vs T5=200; median survival ${s.medianDays}d (max ${s.maxDays}d)`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} exiled ${s.exiled}`);
    console.log(`deaths: ${JSON.stringify(s.deathCauses)}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runConfirm, deathCauses };
