#!/usr/bin/env node
// scripts/sweep-killroad-r18-20261013.js — scale-onramp r18 ARM 2 (killroad).
//
// EXTENDS scripts/sweep-tablerecon-20261013.js (r17 ARM 2 instrument): same
// table-approach telemetry (tableSeat/deedGateReady rows, waveLedgerPoints
// sampling, national-scale tribute/proposals/tends, structured deaths,
// bounded story capture) via its exported functions — not reinvented.
//
// Arms (identical seeds, 150d death-aware):
//   baseline: killroad policy, KILLROAD_COURT unset (gate OFF) — proven
//             byte-identical to competent by test-killroad-r18-20261013.js
//   after:    killroad policy, KILLROAD_COURT=1 (gate ON) — the courtship
//             layer: late (d35+), from strength, as primary; walk from
//             subordinate counters; weekly tendLink.
//
// GO (pre-registered): >=2/8 seeds with regional+ AND >=3 wave-3 kill points
// on the after arm. Kill fast if missed.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=150 \
//   OUT=evidence/2026-10-13/sim-killroad-r18-b.json \
//   node scripts/sweep-killroad-r18-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { killroad } = require('./policies/killroad');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const { attachTable, tableRow, trackBest, finalizeTable } = require('./sweep-tablerecon-20261013');

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || 'killroad-r18';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const arms = [
    { id: 'baseline', gate: '0' },
    { id: 'after', gate: '1' },
  ];
  const rows = [];
  for (const arm of arms) {
    process.env.KILLROAD_COURT = arm.gate;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'killroad-' + arm.id });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      const t = attachTable(Game, m);
      const base = killroad;
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try {
          const d = day(G);
          if (d % 5 === 0) { const r = tableRow(G); t.rows.push(r); trackBest(t, r); }
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      try { const rf = tableRow(Game); t.rows.push(rf); trackBest(t, rf); } catch (e) {}
      const row = Object.assign(
        { label, arm: arm.id, gate: arm.gate, policy: 'killroad', seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        finalizeTable(Game, m)
      );
      rows.push(row);
      console.log(`  [${arm.id} s${seed}] d=${row.days} ${row.endReason} rank=${row.bestRank} ` +
        `natFirst=${row.nationalFirstDay == null ? '-' : row.nationalFirstDay} ` +
        `prop=${row.linksProposed} acc=${row.linksAccepted} seas=${row.linksSeasonedEver} tends=${row.tends} ` +
        `w3pts=${(row.bestWP || [0,0,0,0])[2]} seat=${row.seatBest} ` +
        `ppl=${row.peopleDeaths} starv=${row.starveDays}`);
    }
  }
  delete process.env.KILLROAD_COURT;

  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const goRow = (r) => ((r.bestRank === 'regional' || r.bestRank === 'national' || r.bestRank === 'global') ? 1 : 0) &&
    ((r.bestWP || [0,0,0,0])[2] >= 3 ? 1 : 0);
  const summary = {
    label, seeds, days, runs: rows.length,
    baseline: {}, after: {},
  };
  for (const arm of arms) {
    const rs = rows.filter(r => r.arm === arm.id);
    summary[arm.id] = {
      runs: rs.length,
      national: agg(r => (r.arm === arm.id && r.nationalFirstDay != null ? 1 : 0)),
      regionalPlus: agg(r => (r.arm === arm.id && ['regional','national','global'].includes(r.bestRank) ? 1 : 0)),
      go: agg(r => (r.arm === arm.id ? goRow(r) : 0)),
      goSeeds: rs.filter(r => goRow(r)).map(r => r.seed),
      medianDays: med(rs.map(r => r.days)),
      maxDays: Math.max(0, ...rs.map(r => r.days)),
      wave45Ever: agg(r => (r.arm === arm.id && ((r.bestGW[3] || 0) > 0 || (r.bestGW[4] || 0) > 0) ? 1 : 0)),
      tableWaitingEver: agg(r => (r.arm === arm.id && r.waitingDay != null ? 1 : 0)),
      won: agg(r => (r.arm === arm.id ? (r.won || 0) : 0)),
      vests: agg(r => (r.arm === arm.id ? (r.vests || 0) : 0)),
      exiled: agg(r => (r.arm === arm.id ? (r.exiledEver || 0) : 0)),
      peopleDeaths: agg(r => (r.arm === arm.id ? (r.peopleDeaths || 0) : 0)),
      starveDays: agg(r => (r.arm === arm.id ? (r.starveDays || 0) : 0)),
      linksProposed: agg(r => (r.arm === arm.id ? (r.linksProposed || 0) : 0)),
      linksAccepted: agg(r => (r.arm === arm.id ? (r.linksAccepted || 0) : 0)),
      linksSeasonedEver: agg(r => (r.arm === arm.id ? (r.linksSeasonedEver || 0) : 0)),
      tends: agg(r => (r.arm === arm.id ? (r.tends || 0) : 0)),
      tributeOutK: +agg(r => (r.arm === arm.id ? (r.tributePaidK || 0) : 0)).toFixed(1),
      w3ptsMax: Math.max(0, ...rs.map(r => (r.bestWP || [0,0,0,0])[2])),
      w3ptsMed: med(rs.map(r => (r.bestWP || [0,0,0,0])[2])),
    };
  }
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runSweep({});
    const s = rep.summary;
    const line = (a) => `national ${a.national}/${a.runs} regional+ ${a.regionalPlus}/${a.runs} GO ${a.go}/${a.runs} (seeds ${a.goSeeds.join(',') || '-'}) medianDays ${a.medianDays} maxDays ${a.maxDays} w3pts med/max ${a.w3ptsMed}/${a.w3ptsMax} wave45 ${a.wave45Ever}/${a.runs} tableWait ${a.tableWaitingEver}/${a.runs} won ${a.won}/${a.runs} vests ${a.vests} exiled ${a.exiled}/${a.runs} pplDeaths ${a.peopleDeaths} starv ${a.starveDays} prop/acc/seas ${a.linksProposed}/${a.linksAccepted}/${a.linksSeasonedEver} tends ${a.tends} tribOut ${a.tributeOutK}k`;
    console.log(`\n=== ${s.label} === seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log('baseline: ' + line(s.baseline));
    console.log('after:    ' + line(s.after));
    console.log(`GO threshold: >=2/8 after-seeds with regional+ AND >=3 wave-3 kill points → ${s.after.go >= 2 ? 'GO' : 'KILL'}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep };
