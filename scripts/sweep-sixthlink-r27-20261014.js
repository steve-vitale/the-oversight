#!/usr/bin/env node
// scripts/sweep-sixthlink-r27-20261014.js — SIXTHLINK TEND-RACE SWEEP.
//
// Baseline (SIXTHLINK unset): the sixthlink module exports the current tip
// stack unchanged (FIFTHLINK=1 -> fifthlink-r26; unset -> fourthlink), so
// this measures the FOURTHLINK uncapped courtship + fifthlink tend-first
// layer on identical seeds (the pre-screen #129 asks for).
// Armed (FOURTHLINK=1 FIFTHLINK=1 SIXTHLINK=1): the 6th-link tend-first
// extension runs on top of the stack.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-sixthlink-r27.md, r27 — written
// BEFORE the layer was designed; GO clause fixed AFTER the pre-screen per
// sim-findings #129):
//   primary metric : seasoned conversion = (forming seeds where the 6th lead
//                    link SEASONS 30+d, trust 40+) / (forming seeds),
//                    identical seeds, with-layer vs without-layer
//   GO threshold   : fixed after the 16-seed baseline pre-screen — expressed
//                    as conversion-rate delta >= pre-screened baseline +
//                    noise floor (never a stale "~0%" premise)
//   KILL-AT-SCREENING: <4 forming seeds on the 16-seed baseline screen ->
//                    under-powered, KILL at screening, no conversion spend
//   guardrails     : exiled / national / wave-5 not regressed vs the
//                    identical-seed baseline side (per-seed, not median);
//                    median survival REPORT-ONLY (sharepol noise-floor finding)
//   horizon        : 180d death-aware (6th links form d80+, seasoning needs 30d)
//   seeds/policies : 11/22/33/44/55/66/77/88,101/202/303/404/505/606/707/808
//                    x leadcourt(+FOURTHLINK+FIFTHLINK) pre-screen; conversion
//                    on the forming subset x (baseline vs +SIXTHLINK)
//
// Usage (baseline pre-screen):
//   FOURTHLINK=1 FIFTHLINK=1 OUT=evidence/2026-10-14/sim-sixthlink-r27-screen.json \
//   node scripts/sweep-sixthlink-r27-20261014.js
// Usage (armed):
//   FOURTHLINK=1 FIFTHLINK=1 SIXTHLINK=1 OUT=evidence/2026-10-14/sim-sixthlink-r27-armed.json \
//   node scripts/sweep-sixthlink-r27-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { sixthlink } = require('./policies/sixthlink-r27');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const ARMED = process.env.SIXTHLINK === '1';
const POLICY_REGISTRY = { leadcourt: sixthlink };
const EXPECTED_ID = ARMED ? 'sixthlink-r27' : 'fifthlink-r26';

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

// 6th lead link by formation order, from the linkpipe lifecycle.
function sixthLeadLink(lp) {
  const leads = (lp.links || []).filter(l => l.dir === 'lead').sort((a, b) => a.day - b.day);
  const f = leads[5] || null;
  return f ? {
    formedDay: f.day, target: f.target,
    seasonedDay: f.seasonedDay, brokeWhy: f.brokeWhy,
    trustAt30: f.trustAt30, maxTrust: f.maxTrust, tendWeeks: f.tendWeeks, age: f.age,
  } : null;
}

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || (ARMED ? 'sixthlink-r27-armed' : 'sixthlink-r27-baseline');
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88,101,202,303,404,505,606,707,808').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    // SMOKE (POLICY_REGISTRY unwrap bug, sim-findings): verify the suite
    // actually runs under the intended policy before spending seeds.
    if (base.id !== EXPECTED_ID) throw new Error(`policy SMOKE FAIL: expected id ${EXPECTED_ID}, got ${base.id}`);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'sixthlink-' + pid });
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
      const fl = sixthLeadLink(row.linkpipe);
      const f5 = (function () { const l = (row.linkpipe.links || []).filter(x => x.dir === 'lead').sort((a, b) => a.day - b.day)[4]; return l ? `d${l.day}->${l.seasonedDay == null ? 'x' : 's' + l.seasonedDay}` : '-'; })();
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `6th=${fl ? `d${fl.formedDay}->${fl.seasonedDay == null ? 'x' : 's' + fl.seasonedDay}(t30:${fl.trustAt30},tw:${fl.tendWeeks})` : '-'} ` +
        `5th=${f5} leadN=${(row.linkpipe.links || []).filter(x => x.dir === 'lead').length} ` +
        `stand=${row.endStanding.total} nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} ` +
        `w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day} w5=${row.wave5Day == null ? '-' : 'd' + row.wave5Day}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const sixthSeasonedRows = rows.filter(r => { const f = sixthLeadLink(r.linkpipe); return f && f.seasonedDay != null; });
  const summary = {
    label, seeds, policies: policyIds, days, armed: ARMED, runs: rows.length,
    sixthSeasoned: sixthSeasonedRows.length,
    sixthSeeds: sixthSeasonedRows.map(r => r.policy + ' s' + r.seed),
    sixthFormed: agg(r => sixthLeadLink(r.linkpipe) ? 1 : 0),
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
    console.log(`PRIMARY 6th-link seasoned: ${s.sixthSeasoned}/${s.runs} [${s.sixthSeeds.join(' ') || '-'}] (6th formed on ${s.sixthFormed}/${s.runs})`);
    console.log(`guardrail: median survival ${s.medianDays}d`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4Unlock}/${s.runs} wave5 ${s.wave5Unlock}/${s.runs} maxStanding ${s.maxStanding} medianEnd ${s.medianEndStanding}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep, sixthLeadLink };
