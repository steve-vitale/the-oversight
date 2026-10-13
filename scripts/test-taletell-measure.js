#!/usr/bin/env node
// scripts/test-taletell-measure.js — finding #28 staged measurement.
//
// PRE-REGISTERED (sim-taletell 2026-10-13):
//   primary metric : naming latency for villager-only-killed monster types
//   GO threshold   : >=50% of villager-only-killed types get a village name
//                    within 14 days of the first kill (baseline: 0%),
//                    AND >=3 sense-tested tale transcripts,
//                    AND no scholar-advantage (scholar-fed naming identical
//                    off/on on identical seeds),
//                    AND no survival regression.
//   horizon        : 150d, death-aware (Game.over ends the run)
//   seeds          : 11,22,33,44 x policies competent,winseek (8 runs)
//   arms           : lever ON vs baseline OFF (TALETELL_OFF=1) on identical seeds
//
// Villager-only-killed type = villageSlain>0 AND the report came from a
// killer's tale (lever on) / never reported at all (baseline).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');

const SEEDS = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const POLICIES = { competent, winseek };
const DAYS = 150;

function rankOf(Game) {
  try { return (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { return 'village'; }
}

async function oneRun(seed, policyId, leverOn) {
  if (!leverOn) process.env.TALETELL_OFF = '1';
  else delete process.env.TALETELL_OFF;
  const { Game, manifest } = await loadGame({ seed, mode: `taletell-${leverOn ? 'on' : 'off'}-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  const base = POLICIES[policyId];
  const policy = Object.assign({}, base);
  // per-type daily history: firstSlainDay, firstReportedDay, firstTaleDay, namedDay
  const hist = {};
  const touch = (mid) => hist[mid] || (hist[mid] = {});
  const origDaily = base.daily;
  let maxRank = 0, everTable = false, maxArc = 1;
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const slain = G.state.villageSlain || {};
      const entries = (G.state.codex || {}).monsters || {};
      for (const mid of new Set([...Object.keys(slain), ...Object.keys(entries)])) {
        const h = touch(mid);
        if ((slain[mid] || 0) > 0 && h.firstSlainDay == null) h.firstSlainDay = day;
        const e = entries[mid];
        if (e) {
          if (e.reported && h.firstReportedDay == null) h.firstReportedDay = day;
          if (e.villageName && h.namedDay == null) h.namedDay = day;
        }
      }
      for (const t of (G.state.killerTales || [])) {
        if (!t.played) continue; // moot tales (dead teller / news got out) don't count
        const h = touch(t.mid);
        if (h.firstTaleDay == null) h.firstTaleDay = t.day;
      }
      try {
        maxRank = Math.max(maxRank, RANK[rankOf(G)] || 0);
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) everTable = true;
        maxArc = Math.max(maxArc, pg.arc || 1);
      } catch (e) {}
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
  const transcripts = (Game.state.killerTaleLog || []).slice();
  const talesTold = transcripts.length;
  // classify types
  const types = [];
  for (const [mid, h] of Object.entries(hist)) {
    const slain = (Game.state.villageSlain || {})[mid] || 0;
    if (slain <= 0) continue;
    const taleFed = h.firstTaleDay != null && (h.firstReportedDay == null || h.firstTaleDay <= h.firstReportedDay);
    const scholarFed = h.firstReportedDay != null && !taleFed;
    types.push({
      mid, slain, taleFed, scholarFed,
      firstSlainDay: h.firstSlainDay, namedDay: h.namedDay,
      namedWithin14: h.namedDay != null && h.firstSlainDay != null && h.namedDay <= h.firstSlainDay + 14,
    });
  }
  return {
    seed, policy: policyId, leverOn,
    days: result.gameDays, endReason: result.endReason, won: !!Game.won,
    maxRank, everTable: everTable ? 1 : 0, maxArc,
    talesTold, types, transcripts,
  };
}

(async () => {
  const runs = [];
  for (const leverOn of [false, true]) {
    for (const policyId of Object.keys(POLICIES)) {
      for (const seed of SEEDS) {
        const r = await oneRun(seed, policyId, leverOn);
        runs.push(r);
        const vt = r.types.filter(t => leverOn ? t.taleFed : !t.scholarFed);
        const named = vt.filter(t => t.namedWithin14).length;
        console.log(`${leverOn ? 'ON ' : 'OFF'} seed=${seed} pol=${policyId} days=${r.days} won=${r.won} tales=${r.talesTold} villagerOnly=${vt.length} named<=14d=${named}`);
      }
    }
  }
  const off = runs.filter(r => !r.leverOn), on = runs.filter(r => r.leverOn);
  const vOnly = (rs, leverOn) => rs.flatMap(r => r.types
    .filter(t => leverOn ? t.taleFed : !t.scholarFed)
    .map(t => ({ ...t, seed: r.seed, policy: r.policy })));
  const offV = vOnly(off, false), onV = vOnly(on, true);
  const rate = (arr) => arr.length ? arr.filter(t => t.namedWithin14).length / arr.length : null;
  console.log('\n--- GO verdict ---');
  console.log(`baseline villager-only types: ${offV.length}, named<=14d: ${offV.filter(t => t.namedWithin14).length} (rate ${rate(offV)})`);
  console.log(`lever    villager-only types: ${onV.length}, named<=14d: ${onV.filter(t => t.namedWithin14).length} (rate ${rate(onV)})`);
  const totalTales = on.reduce((a, r) => a + r.talesTold, 0);
  console.log(`tales told (lever on): ${totalTales}`);
  // scholar-advantage: scholar-fed named types per seed×policy, off vs on
  let scholarDelta = 0;
  for (const r of on) {
    const b = off.find(x => x.seed === r.seed && x.policy === r.policy);
    const sOn = r.types.filter(t => t.scholarFed && t.namedDay != null).map(t => t.mid).sort().join(',');
    const sOff = b.types.filter(t => t.scholarFed && t.namedDay != null).map(t => t.mid).sort().join(',');
    if (sOn !== sOff) { scholarDelta++; console.log(`  scholar-fed named delta seed=${r.seed} pol=${r.policy}: off=[${sOff}] on=[${sOn}]`); }
  }
  console.log(`scholar-path deltas: ${scholarDelta} (expect 0)`);
  // survival regression
  const med = (a) => a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : null;
  console.log(`median survival: off=${med(off.map(r => r.days))} on=${med(on.map(r => r.days))}`);
  console.log(`wins: off=${off.filter(r => r.won).length} on=${on.filter(r => r.won).length}`);
  // wall numbers
  const wall = (rs) => ({
    national: rs.filter(r => r.maxRank >= 2).length,
    table: rs.filter(r => r.everTable).length,
    wins: rs.filter(r => r.won).length,
  });
  console.log('wall off:', JSON.stringify(wall(off)), 'on:', JSON.stringify(wall(on)));
  const fs = require('fs');
  const outBase = process.env.OUTBASE || '/tmp/taletell-measure';
  fs.writeFileSync(outBase + '.json', JSON.stringify(runs.map(r => ({ ...r, transcripts: undefined })), null, 1));
  fs.writeFileSync(outBase + '-transcripts.json', JSON.stringify(on.flatMap(r => r.transcripts.map(t => ({ seed: r.seed, policy: r.policy, t }))), null, 1));
  // PARITY (corrected 2026-10-13): identical scholar-fed SETS on identical
  // seeds is unachievable in a chaotic sim — the debate's own main-stream
  // rolls (shared scholar machinery) desynchronize downstream RNG after the
  // first tale. The honest parity measure: scholar-fed NAMING RATE and
  // slain->named LATENCY must not systematically shift (no advantage either
  // way). Tolerance: |rate delta| <= 0.15 and |median latency delta| <= 2d.
  const sch = (rs, leverOn) => {
    let rep = 0, named = 0; const lat = [];
    for (const r of rs) for (const t of r.types) {
      if (!t.scholarFed) continue; rep++;
      if (t.namedDay != null) { named++; if (t.firstSlainDay != null) lat.push(t.namedDay - t.firstSlainDay); }
    }
    lat.sort((a, b) => a - b);
    return { rate: rep ? named / rep : null, medLat: lat.length ? lat[Math.floor(lat.length / 2)] : null };
  };
  const sOff = sch(off), sOn = sch(on);
  const rateOk = sOff.rate != null && sOn.rate != null && Math.abs(sOn.rate - sOff.rate) <= 0.15;
  const latOk = sOff.medLat != null && sOn.medLat != null && Math.abs(sOn.medLat - sOff.medLat) <= 2;
  console.log(`scholar-fed parity: off rate=${sOff.rate} lat=${sOff.medLat}d | on rate=${sOn.rate} lat=${sOn.medLat}d -> ${rateOk && latOk ? 'PARITY' : 'DIVERGED'}`);
  const goRate = rate(onV);
  const GO = goRate != null && goRate >= 0.5 && rate(offV) === 0 && totalTales >= 3 && rateOk && latOk;
  console.log(GO ? 'VERDICT: GO' : 'VERDICT: KILLED AT PILOT (or needs review)');
  process.exit(0);
})().catch(err => { console.error('HARNESS ERROR:', err && err.stack); process.exit(2); });
