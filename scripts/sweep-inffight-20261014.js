#!/usr/bin/env node
// sweep-inffight-20261014.js — REGRESSION for finding #102's fix.
// 8-seed courtship-policy suite (leadcourt/belongseek, 150d death-aware),
// before/after on identical seeds. The fix must not touch honest fights.
//
// Side is controlled by env: FOCUSGROUP_CLOSE=0 => BEFORE (fix off),
// default => AFTER (fix on). OUT=path writes the JSON report.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-inffight.md):
//   primary metric : wall metrics within noise of baseline
//   GO threshold   : national/table/wave-reach/median/exiled within noise;
//                    death-cause shares unchanged
//   horizon        : 150d death-aware
//   seeds/policies : 11/22/33/44/55/66/77/88 x leadcourt,belongseek
//
// Usage:
//   FOCUSGROUP_CLOSE=0 OUT=evidence/2026-10-14/inffight-reg-before.json node scripts/sweep-inffight-20261014.js
//   OUT=evidence/2026-10-14/inffight-reg-after.json node scripts/sweep-inffight-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const sr = require('./scale-repro-20261013');

const FIX_ON = process.env.FOCUSGROUP_CLOSE !== '0';
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
const POLICIES = { leadcourt, belongseek };
const PIDS = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(s => POLICIES[s]);
const DAYS = parseInt(process.env.DAYS || '150', 10);

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

(async () => {
  const t0 = Date.now();
  const rows = [];
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'inffight-reg-' + pid });
      await setupGame(Game);
      const m = {};
      sr.attachScale(Game, m);
      const policy = Object.assign({}, POLICIES[pid]);
      const origDaily = POLICIES[pid].daily;
      policy.daily = (G, ctx) => {
        try { sr.scaleRow(G, m); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      let result;
      try {
        result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
      } catch (e) {
        console.log(`  [${pid} s${seed}] THREW: ${e.message}`);
        continue;
      }
      const sc = sr.finalizeScale(Game, m);
      // table: the endgame deed gate needs national + wave 5 faced; report the
      // raw components honestly — table itself is out of reach on this suite.
      let maxRank = 'village';
      try {
        const ranks = (result.samples.scale || []).map(r => r[1]);
        const order = ['village', 'local', 'regional', 'national', 'global'];
        for (const r of ranks) if (order.indexOf(r) > order.indexOf(maxRank)) maxRank = r;
      } catch (e) {}
      const row = {
        policy: pid, seed, fixOn: FIX_ON,
        days: result.days, endReason: result.endReason,
        maxWave: result.maxWaveUnlocked, waveKills: result.waveKills,
        maxRank, national: sc.nationalHeldDays > 0 ? 1 : 0,
        nationalHeldDays: sc.nationalHeldDays,
        exiled: sc.exiledEver || 0,
        deathCauses: deathCauses(result),
        ms: result.ms,
      };
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} wave=${row.maxWave} rank=${row.maxRank} nat=${row.national} exiled=${row.exiled} (${(row.ms / 1000).toFixed(0)}s)`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const allCauses = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses)) allCauses[k] = (allCauses[k] || 0) + v;
  const summary = {
    label: 'inffight-regression', fixOn: FIX_ON, seeds: SEEDS, policies: PIDS, days: DAYS,
    runs: rows.length,
    medianDays: med(rows.map(r => r.days)),
    national: agg(r => r.national),
    maxWaveEver: Math.max(0, ...rows.map(r => r.maxWave || 0)),
    wave5: agg(r => (r.maxWave || 0) >= 5 ? 1 : 0),
    exiled: agg(r => r.exiled),
    deathCauses: allCauses,
    ms: Date.now() - t0,
  };
  console.log(`\n=== inffight-regression fixOn=${FIX_ON} === ${rows.length} runs (${(summary.ms / 1000).toFixed(0)}s)`);
  console.log(`wall: national ${summary.national}/${summary.runs} wave5 ${summary.wave5}/${summary.runs} maxWave ${summary.maxWaveEver} medianDays ${summary.medianDays} exiled ${summary.exiled}/${summary.runs}`);
  console.log(`deathCauses: ${JSON.stringify(allCauses)}`);
  const out = { summary, rows };
  if (process.env.OUT) { fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1)); console.error('wrote ' + process.env.OUT); }
  else console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
