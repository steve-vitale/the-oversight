#!/usr/bin/env node
// scripts/sweep-courtkill-r18-20261013.js — SCALE-WALL r18 ARM 1 (courtkill).
//
// The wave-4 gate is a two-rung bind (r17 tablerecon): (1) 4 wave-3 ledger
// kill points, (2) regional+ scale. The courtship road holds rung 2 but
// scores 0/8 on rung 1 — it flees every wave-3 fight. This driver measures
// whether the COURTKILL hunting layer (scripts/policies/courtkill.js,
// gate COURTKILL=1) lets the courtship road produce BOTH.
//
// Arms (identical seeds, 150d death-aware):
//   BASELINE (gate off): leadcourt, belongseek
//   ARMED (gate on):     courtkill-lead, courtkill-belong
//
// PRE-REGISTRATION (written before the pilot):
//   Primary metric: seeds meeting GO per policy.
//   GO: >=3 wave-3 ledger kill points AND regional+ held >=5d.
//   KILL: <2/8 GO on both armed policies, OR courtship regression
//         (proposals+tends+tributes down >30% vs baseline), OR median
//         survival down >15d vs baseline.
//   Horizon: 150d death-aware (dead villages stop; matches r16/r17).
//   Seeds: 11/22/33/44/55/66/77/88. No confirm spend without a GO pilot.
//
// Reuses r17's instruments (extend, don't reinvent): food-coupling,
// scale-repro, and sweep-tablerecon-20261013's table instrument
// (attachTable/tableRow/trackBest/finalizeTable/namedGaps).
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=150 \
//   OUT=evidence/2026-10-13/sim-scale-wall-r18-courtkill.json \
//   node scripts/sweep-courtkill-r18-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const { courtkillLead, courtkillBelong } = require('./policies/courtkill');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const tr = require('./sweep-tablerecon-20261013');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const REGIONAL_PLUS = (r) => r === 'regional' || r === 'national' || r === 'global';
// courtship + hunt counters snapshotted from ctx each day (preservation check)
const SNAP_KEYS = ['proposedLead', 'tended', 'courtCounters', 'courtAccords',
  'belongProposed', 'belongTribute', 'belongDemands', 'belongCountersAccepted',
  'hunts', 'huntLegs', 'huntSteps', 'huntEngaged', 'huntFights'];

async function runCK(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'courtkill-r18';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const arms = opts.arms || [
    { policy: leadcourt, gate: '0', arm: 'baseline' },
    { policy: belongseek, gate: '0', arm: 'baseline' },
    { policy: courtkillLead, gate: '1', arm: 'armed' },
    { policy: courtkillBelong, gate: '1', arm: 'armed' },
  ];
  const rows = [];
  for (const a of arms) {
    process.env.COURTKILL = a.gate;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'courtkill-' + a.policy.id });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      const t = tr.attachTable(Game, m);
      const snap = {};
      const base = a.policy;
      const origDaily = base.daily;
      const policy = Object.assign({}, base, {
        daily(G, ctx) {
          try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
          try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
          try {
            const d = dayOf(G);
            if (d % 5 === 0) { const r = tr.tableRow(G); t.rows.push(r); tr.trackBest(t, r); }
          } catch (e) {}
          if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
          try { for (const k of SNAP_KEYS) if (ctx[k] != null) snap[k] = ctx[k]; } catch (e) {}
        },
      });
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      try { const rf = tr.tableRow(Game); t.rows.push(rf); tr.trackBest(t, rf); } catch (e) {}
      // regional+ held: from the daily scale rows
      let regionalHeldDays = 0, regionalFirstDay = null;
      try {
        for (const r of (m.scale.daily || [])) {
          if (REGIONAL_PLUS(r.rank)) {
            regionalHeldDays++;
            if (regionalFirstDay == null || r.day < regionalFirstDay) regionalFirstDay = r.day;
          }
        }
      } catch (e) {}
      const row = Object.assign(
        { label, arm: a.arm, policy: a.policy.id, gate: a.gate, seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tr.finalizeTable(Game, m),
        { regionalHeldDays, regionalFirstDay, snap }
      );
      row.w3pts = (row.bestWP || [0, 0, 0, 0])[2] | 0;
      row.go = (row.w3pts >= 3 && row.regionalHeldDays >= 5) ? 1 : 0;
      rows.push(row);
      console.log(`  [${a.policy.id} s${seed}] d=${row.days} ${row.endReason} w3pts=${row.w3pts} ` +
        `regHeld=${row.regionalHeldDays}d${row.regionalFirstDay != null ? '@' + row.regionalFirstDay : ''} ` +
        `GO=${row.go ? 'YES' : '-'} natFirst=${row.nationalFirstDay == null ? '-' : row.nationalFirstDay} ` +
        `seat=${row.seatBest} w45=[${(row.bestGW || []).slice(3).join(',')}] ` +
        `hunts=${snap.hunts || 0} hEng=${snap.huntEngaged || 0} hFights=${snap.huntFights || 0} ` +
        `prop=${snap.proposedLead || snap.belongProposed || 0} tend=${snap.tended || 0} trib=${snap.belongTribute || 0}`);
    }
  }
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const byPolicy = {};
  for (const r of rows) {
    const p = byPolicy[r.policy] = byPolicy[r.policy] || { policy: r.policy, arm: r.arm, n: 0, go: 0, w3: [], reg: [], days: [], nat: 0, prop: [], tend: [], trib: [], hunts: [], hEng: [], hFights: [] };
    p.n++; p.go += r.go; p.w3.push(r.w3pts); p.reg.push(r.regionalHeldDays); p.days.push(r.days);
    if (r.nationalFirstDay != null) p.nat++;
    p.prop.push(r.snap.proposedLead || r.snap.belongProposed || 0);
    p.tend.push(r.snap.tended || 0); p.trib.push(r.snap.belongTribute || 0);
    p.hunts.push(r.snap.hunts || 0); p.hEng.push(r.snap.huntEngaged || 0); p.hFights.push(r.snap.huntFights || 0);
  }
  const summary = {
    label, seeds, days, runs: rows.length,
    perPolicy: Object.values(byPolicy).map(p => ({
      policy: p.policy, arm: p.arm, n: p.n,
      GO: `${p.go}/${p.n}`,
      w3ptsMed: med(p.w3), w3ptsMax: Math.max(...p.w3),
      regHeldMed: med(p.reg), regHeldMax: Math.max(...p.reg),
      national: `${p.nat}/${p.n}`,
      daysMed: med(p.days),
      propMed: med(p.prop), tendMed: med(p.tend), tribMed: med(p.trib),
      huntsMed: med(p.hunts), huntEngMed: med(p.hEng), huntFightsMed: med(p.hFights),
    })),
    // wall numbers (all runs)
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
    wave4ever: agg(r => ((r.bestGW || [])[3] || 0) > 0 ? 1 : 0),
    wave5ever: agg(r => ((r.bestGW || [])[4] || 0) > 0 ? 1 : 0),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(0, ...rows.map(r => r.days)),
    vests: agg(r => r.vests), exiled: agg(r => r.exiledEver || 0),
    peopleDeaths: agg(r => r.peopleDeaths || 0),
    starveDays: agg(r => r.starveDays || 0),
  };
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runCK({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    for (const p of s.perPolicy) {
      console.log(`  ${p.arm} ${p.policy}: GO ${p.GO} | w3pts med/max ${p.w3ptsMed}/${p.w3ptsMax} | regHeld med/max ${p.regHeldMed}/${p.regHeldMax}d | national ${p.national} | daysMed ${p.daysMed} | court prop/tend/trib ${p.propMed}/${p.tendMed}/${p.tribMed} | hunts/eng/fights ${p.huntsMed}/${p.huntEngMed}/${p.huntFightsMed}`);
    }
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4ever ${s.wave4ever}/${s.runs} wave5ever ${s.wave5ever}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays} vests ${s.vests} exiled ${s.exiled}/${s.runs} peopleDeaths ${s.peopleDeaths} starveDays ${s.starveDays}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runCK };
