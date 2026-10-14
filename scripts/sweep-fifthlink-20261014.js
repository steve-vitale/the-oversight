#!/usr/bin/env node
// scripts/sweep-fifthlink-20261014.js — FIFTHLINK TEND-RACE SWEEP.
//
// Baseline (FIFTHLINK unset): the fifthlink module exports fourthlink
// unchanged, so this measures the FOURTHLINK uncapped courtship on
// identical seeds (cross-checked byte-identical vs the fourthlink arm's
// armed rows).
// Armed (FOURTHLINK=1 FIFTHLINK=1): the tend-vs-decay layer runs —
// young-link grief answered, thin links tended first at the lower gate.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-fifthlink.md):
//   primary metric : seeds where a 5th lead link SEASONS (30+d, trust 40+)
//   GO threshold   : armed >=2/8 AND armed >= baseline+2 (identical seeds)
//   guardrails     : median survival within +-10d of identical-seed
//                    baseline; national not below baseline
//   horizon        : 180d death-aware
//   seeds/policies : 11/22/33/44/55/66/77/88 x leadcourt(+FOURTHLINK)
//
// Usage (baseline):
//   FOURTHLINK=1 OUT=evidence/2026-10-14/sim-fifthlink-base.json \
//   node scripts/sweep-fifthlink-20261014.js
// Usage (lever):
//   FOURTHLINK=1 FIFTHLINK=1 OUT=evidence/2026-10-14/sim-fifthlink-armed.json \
//   node scripts/sweep-fifthlink-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const ARMED = process.env.FIFTHLINK === '1';
const POLICY_REGISTRY = { leadcourt: fifthlink };

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

// 5th lead link by formation order, from the linkpipe lifecycle.
function fifthLeadLink(lp) {
  const leads = (lp.links || []).filter(l => l.dir === 'lead').sort((a, b) => a.day - b.day);
  const f = leads[4] || null;
  return f ? {
    formedDay: f.day, target: f.target,
    seasonedDay: f.seasonedDay, brokeWhy: f.brokeWhy,
    trustAt30: f.trustAt30, maxTrust: f.maxTrust, tendWeeks: f.tendWeeks, age: f.age,
  } : null;
}

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || (ARMED ? 'fifthlink-armed' : 'fifthlink-baseline');
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'fifthlink-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      tune.attachStanding(Game, m);
      attachLinkPipe(Game, m);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      const pp = m.linkpipe;
      policy.daily = (G, ctx) => {
        try { pp.snapshot(G, pid); } catch (e) {}
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      let w4faced = 0;
      try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
      const row = Object.assign(
        { label, policy: pid, seed, armed: ARMED },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tune.finalizeStanding(Game, m),
        { linkpipe: finalizeLinkPipe(Game, m), w4faced, deathCauses: deathCauses(result) }
      );
      rows.push(row);
      const fl = fifthLeadLink(row.linkpipe);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `5th=${fl ? `d${fl.formedDay}->${fl.seasonedDay == null ? 'x' : 's' + fl.seasonedDay}(t30:${fl.trustAt30},tw:${fl.tendWeeks})` : '-'} ` +
        `stand=${row.endStanding.total} nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} ` +
        `w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const fifthSeasonedRows = rows.filter(r => { const f = fifthLeadLink(r.linkpipe); return f && f.seasonedDay != null; });
  const summary = {
    label, seeds, policies: policyIds, days, armed: ARMED, runs: rows.length,
    fifthSeasoned: fifthSeasonedRows.length,
    fifthSeeds: fifthSeasonedRows.map(r => r.policy + ' s' + r.seed),
    fifthFormed: agg(r => fifthLeadLink(r.linkpipe) ? 1 : 0),
    medianDays: med(rows.map(r => r.days)),
    national: agg(r => (r.national ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
    wave4Unlock: agg(r => r.wave4Day != null ? 1 : 0),
    wave5Unlock: agg(r => r.wave5Day != null ? 1 : 0),
    maxStanding: Math.max(0, ...rows.map(r => r.endStanding.total)),
    medianEndStanding: med(rows.map(r => r.endStanding.total)),
  };
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runSweep({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`PRIMARY 5th-link seasoned: ${s.fifthSeasoned}/${s.runs} [${s.fifthSeeds.join(' ') || '-'}] (5th formed on ${s.fifthFormed}/${s.runs})`);
    console.log(`guardrail: median survival ${s.medianDays}d`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4Unlock}/${s.runs} wave5 ${s.wave5Unlock}/${s.runs} maxStanding ${s.maxStanding} medianEnd ${s.medianEndStanding}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep, fifthLeadLink };
