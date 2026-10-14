#!/usr/bin/env node
// scripts/sweep-buildfund-20261014.js — SCALE-WALL r19 ARM (buildfund).
//
// The wave-4 war rung is scholar-only in practice (r18 + 9067410c): the
// courtship scholar loses wave-3 attrition fights on capability, not
// motivation — the tribute/tend economy doesn't fund a mid build. This
// driver measures whether the BUILDFUND policy layer
// (scripts/policies/buildfund.js, gate BUILDFUND=1) funds a wave-3-capable
// scholar build on the courtship road: craft/equip the best honest weapon,
// seek armor, play wave-3 signature counterplay when the village knows it
// (non-lethal parity channel), and decline unwinnable attrition races.
//
// Arms (identical seeds, 180d death-aware):
//   BASELINE (gate off): leadcourt
//   ARMED (gate on):     buildfund-lead
//
// PRE-REGISTRATION (written before the pilot; MEASUREMENT.md §§9-12, 14):
//   Primary metric: seeds with >=3 wave-3 ledger points.
//   GO: >=2/8 seeds with >=3 pts AND median survival within ±10d of the
//       identical-seed baseline.
//   KILL: <2/8 seeds at >=3 pts, OR median survival outside ±10d.
//   Horizon: 180d death-aware (WIN-PATH HORIZON 180; dead villages stop).
//   Seeds: 11/22/33/44/55/66/77/88. 8-seed pilot only — no confirm spend
//   without GO.
//
// Reuses the r18 instruments (extend, don't reinvent): food-coupling,
// scale-repro, and sweep-tablerecon-20261013's table instrument.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//   OUT=evidence/2026-10-14/sim-buildfund.json \
//   node scripts/sweep-buildfund-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { buildfundLead } = require('./policies/buildfund');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const tr = require('./sweep-tablerecon-20261013');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const REGIONAL_PLUS = (r) => r === 'regional' || r === 'national' || r === 'global';
// courtship counters (preservation check) + build-funding counters
const SNAP_KEYS = ['proposedLead', 'tended', 'courtCounters', 'courtAccords',
  'bfSpearTries', 'bfSpearCrafts', 'bfHideTries', 'bfHideCrafts', 'bfEquipped',
  'bfAssessments', 'bfCommits', 'bfDeclines', 'bfSpoolWaits', 'bfChorusMoves',
  'bfBufferWaits', 'bfCloseEyes', 'bfStudies'];

async function runBF(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'buildfund-r19';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const arms = opts.arms || [
    { policy: leadcourt, gate: '0', arm: 'baseline' },
    { policy: buildfundLead, gate: '1', arm: 'armed' },
  ];
  const rows = [];
  for (const a of arms) {
    process.env.BUILDFUND = a.gate;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'buildfund-' + a.policy.id });
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
      let regionalHeldDays = 0, regionalFirstDay = null;
      try {
        for (const r of (m.scale.daily || [])) {
          if (REGIONAL_PLUS(r.rank)) {
            regionalHeldDays++;
            if (regionalFirstDay == null || r.day < regionalFirstDay) regionalFirstDay = r.day;
          }
        }
      } catch (e) {}
      // wave-3 ledger points + village trick knowledge (parity channel state)
      let w3pts = 0, tricksKnown = [];
      try { w3pts = (typeof Game.waveLedgerPoints === 'function' ? Game.waveLedgerPoints(3) : 0) | 0; } catch (e) {}
      try { tricksKnown = Object.keys(Game.state.villagerTricks || {}); } catch (e) {}
      const row = Object.assign(
        { label, arm: a.arm, policy: a.policy.id, gate: a.gate, seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tr.finalizeTable(Game, m),
        { regionalHeldDays, regionalFirstDay, snap, w3pts, tricksKnown }
      );
      row.go = row.w3pts >= 3 ? 1 : 0;
      rows.push(row);
      console.log(`  [${a.policy.id} s${seed}] d=${row.days} ${row.endReason} w3pts=${row.w3pts} ` +
        `regHeld=${row.regionalHeldDays}d GO=${row.go ? 'YES' : '-'} natFirst=${row.nationalFirstDay == null ? '-' : row.nationalFirstDay} ` +
        `seat=${row.seatBest} w45=[${(row.bestGW || []).slice(3).join(',')}] ` +
        `spear=${snap.bfSpearCrafts || 0}/${snap.bfSpearTries || 0} hide=${snap.bfHideCrafts || 0}/${snap.bfHideTries || 0} ` +
        `commit=${snap.bfCommits || 0} decline=${snap.bfDeclines || 0} ` +
        `tricks=[sp:${snap.bfSpoolWaits || 0},ch:${snap.bfChorusMoves || 0},bf:${snap.bfBufferWaits || 0},ce:${snap.bfCloseEyes || 0}] ` +
        `known=[${tricksKnown.join(',')}] prop=${snap.proposedLead || 0} tend=${snap.tended || 0}`);
    }
  }
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const byPolicy = {};
  for (const r of rows) {
    const p = byPolicy[r.policy] = byPolicy[r.policy] || { policy: r.policy, arm: r.arm, n: 0, go: 0, w3: [], reg: [], days: [], nat: 0, prop: [], tend: [] };
    p.n++; p.go += r.go; p.w3.push(r.w3pts); p.reg.push(r.regionalHeldDays); p.days.push(r.days);
    if (r.nationalFirstDay != null) p.nat++;
    p.prop.push(r.snap.proposedLead || 0);
    p.tend.push(r.snap.tended || 0);
  }
  const base = byPolicy.leadcourt || { days: [] };
  const armed = byPolicy['buildfund-lead'] || { days: [], go: 0, n: 0 };
  const baseMed = med(base.days), armedMed = med(armed.days);
  const goMet = armed.go >= 2;
  const survOk = Math.abs(armedMed - baseMed) <= 10;
  const summary = {
    label, seeds, days, runs: rows.length,
    perPolicy: Object.values(byPolicy).map(p => ({
      policy: p.policy, arm: p.arm, n: p.n,
      GO: `${p.go}/${p.n}`,
      w3ptsMed: med(p.w3), w3ptsMax: Math.max(...p.w3),
      regHeldMed: med(p.reg), regHeldMax: Math.max(...p.reg),
      national: `${p.nat}/${p.n}`,
      daysMed: med(p.days),
      propMed: med(p.prop), tendMed: med(p.tend),
    })),
    verdict: {
      goSeeds: `${armed.go}/${armed.n}`, goMet,
      medianDaysBase: baseMed, medianDaysArmed: armedMed,
      survivalWithin10d: survOk,
      GO: goMet && survOk,
    },
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
    const rep = await runBF({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    for (const p of s.perPolicy) {
      console.log(`  ${p.arm} ${p.policy}: GO ${p.GO} | w3pts med/max ${p.w3ptsMed}/${p.w3ptsMax} | regHeld med/max ${p.regHeldMed}/${p.regHeldMax}d | national ${p.national} | daysMed ${p.daysMed} | court prop/tend ${p.propMed}/${p.tendMed}`);
    }
    console.log(`VERDICT: GO-seeds ${s.verdict.goSeeds} (need >=2/8: ${s.verdict.goMet ? 'MET' : 'MISS'}) | medianDays base ${s.verdict.medianDaysBase} armed ${s.verdict.medianDaysArmed} (±10d: ${s.verdict.survivalWithin10d ? 'OK' : 'MISS'}) | ==> ${s.verdict.GO ? 'GO' : 'NO-GO'}`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4ever ${s.wave4ever}/${s.runs} wave5ever ${s.wave5ever}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays} vests ${s.vests} exiled ${s.exiled}/${s.runs} peopleDeaths ${s.peopleDeaths} starveDays ${s.starveDays}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runBF };
