#!/usr/bin/env node
// scripts/sweep-fourthlink-20261014.js — FOURTHLINK PIPELINE SWEEP.
//
// Phase 1 (DIAGNOSE, FOURTHLINK unset): runs the link-pipeline instrument on
// UNMODIFIED courtship policies — names where the 4th link dies.
// Phase 2 (LEVER, FOURTHLINK=1): identical-seed before/after with the
// uncapped fourthlink policy on the leadcourt runs (belongseek unchanged —
// its single-link design is a design question, not the lever).
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-fourthlink.md):
//   primary metric : seeds where a 4th lead link SEASONS (30+d, trust 40+)
//   GO threshold   : >=2/8 pilot seeds vs 0/8 identical-seed baseline
//   guardrail      : median survival within +-10d of identical-seed
//                    baseline; wall metrics (national/table/wins, wave-4/5
//                    unlocks) no regression
//   horizon        : 180d death-aware
//   seeds/policies : 11/22/33/44/55/66/77/88 x leadcourt + belongseek
//
// Usage (baseline):
//   OUT=evidence/2026-10-14/sim-fourthlink-base.json \
//   node scripts/sweep-fourthlink-20261014.js
// Usage (lever):
//   FOURTHLINK=1 OUT=evidence/2026-10-14/sim-fourthlink-armed.json \
//   node scripts/sweep-fourthlink-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const ARMED = process.env.FOURTHLINK === '1';
let leadPolicy = leadcourt;
if (ARMED) leadPolicy = require('./policies/fourthlink').fourthlink;
const POLICY_REGISTRY = { leadcourt: leadPolicy, belongseek };

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || (ARMED ? 'fourthlink-armed' : 'fourthlink-baseline');
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'fourthlink-' + pid });
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
      const lp = row.linkpipe;
      const fl = lp.fourthLeadLink;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `prop=${lp.proposals.total}(a${lp.proposals.accept}/c${lp.proposals.counter}/n${lp.proposals.null}) ` +
        `win=${lp.windowOpenDays}d capBlocked=${lp.capBlockedDays}d ` +
        `formed=${lp.linksFormed} seasoned=${lp.linksSeasoned} ` +
        `4th=${fl ? `d${fl.formedDay}->${fl.seasonedDay == null ? 'x' : 's' + fl.seasonedDay}` : '-'} ` +
        `stand=${row.endStanding.total}(w${row.endStanding.war}/b${row.endStanding.diplomacy}/br${row.endStanding.plenty}) ` +
        `nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const byPol = (pid) => rows.filter(r => r.policy === pid);
  const summary = {
    label, seeds, policies: policyIds, days, armed: ARMED, runs: rows.length,
    // PRIMARY (lever phase): 4th lead link seasoned
    fourthSeasoned: agg(r => (r.linkpipe.fourthLeadLink && r.linkpipe.fourthLeadLink.seasonedDay != null) ? 1 : 0),
    fourthSeeds: rows.filter(r => r.linkpipe.fourthLeadLink && r.linkpipe.fourthLeadLink.seasonedDay != null).map(r => r.policy + ' s' + r.seed),
    fourthFormed: agg(r => r.linkpipe.fourthLeadLink ? 1 : 0),
    // pipeline diagnosis
    proposals: agg(r => r.linkpipe.proposals.total),
    accepts: agg(r => r.linkpipe.proposals.accept),
    counters: agg(r => r.linkpipe.proposals.counter),
    nulls: agg(r => r.linkpipe.proposals.null),
    capBlockedDays: agg(r => r.linkpipe.capBlockedDays),
    windowOpenDays: agg(r => r.linkpipe.windowOpenDays),
    linksFormed: agg(r => r.linkpipe.linksFormed),
    linksSeasoned: agg(r => r.linkpipe.linksSeasoned),
    tends: agg(r => r.linkpipe.tends),
    // guardrail: survival + wall
    medianDays: med(rows.map(r => r.days)),
    medianDaysByPolicy: Object.fromEntries(policyIds.map(pid => [pid, med(byPol(pid).map(r => r.days))])),
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
    console.log(`PRIMARY 4th-link seasoned: ${s.fourthSeasoned}/${s.runs} [${s.fourthSeeds.join(' ') || '-'}] (4th formed on ${s.fourthFormed}/${s.runs})`);
    console.log(`pipeline: proposals ${s.proposals} (a${s.accepts}/c${s.counters}/n${s.nulls}) windowOpen ${s.windowOpenDays}d capBlocked ${s.capBlockedDays}d formed ${s.linksFormed} seasoned ${s.linksSeasoned} tends ${s.tends}`);
    console.log(`guardrail: median survival ${s.medianDays}d byPolicy=${JSON.stringify(s.medianDaysByPolicy)}`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4Unlock}/${s.runs} wave5 ${s.wave5Unlock}/${s.runs} maxStanding ${s.maxStanding} medianEnd ${s.medianEndStanding}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep };
