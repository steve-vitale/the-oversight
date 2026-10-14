#!/usr/bin/env node
// scripts/sweep-trustdeltas-20261014.js — TRUST-DELTAS-BY-SOURCE sweep
// (longsim scale-onramp r32, sim-trustdeltas diagnostic arm, 2026-10-14).
//
// ZERO game-code changes. Installs the deltas instrument
// (scripts/trustdeltas-20261014.js, which reuses the r31 census) on current
// master and runs the courtship road: 8 seeds (11/22/33/44/55/66/77/88) x
// leadcourt/belongseek, 180d death-aware, identical-seed.
//
// PRE-REGISTERED (evidence/2026-10-14/sim-trustdeltas.md header, §§9-12, 14):
//   PRIMARY: trust deltas attributed to sources across the full suite — a
//     complete taxonomy (every source named, its share of positive and
//     negative deltas, per 100 village-days); the NON-PENALTY drivers of
//     trust<30 named WITH NUMBERS (which sources hold it down, how much
//     each contributes); ledgers successor-aware (strict per-day lineage).
//   GO: complete taxonomy + named non-penalty drivers with numbers.
//     DIAGNOSTIC arm — verdict = the taxonomy + the answer to #182.
//   DET-GATE: --invocations=2 runs the det-gate style A/A per combo
//     (16/16 identical required; the instrument must not perturb).
//   HORIZON: 180d death-aware (dead villages stop, +10d tail max).
//   SMOKE=1: instrument-honesty gate before spend (policy drives, deltas
//     instrument installs, writes captured, tenures + ablation computable).
// A miss on taxonomy completeness is NO-GO per §14 — never re-scored.
//
// Usage:
//   SMOKE=1 node scripts/sweep-trustdeltas-20261014.js
//   node scripts/sweep-trustdeltas-20261014.js --invocations=2   # det-gate
//   OUT=evidence/2026-10-14/trustdeltas.json PERSEED_DIR=evidence/2026-10-14/trustdeltas-perseed \
//     node scripts/sweep-trustdeltas-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const td = require('./trustdeltas-20261014');

const POLICY_REGISTRY = {
  // NAMED-export unwrap: never Object.assign({}, require(...)).
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const INVOC_ARG = process.argv.find(a => a.startsWith('--invocations='));
const INVOC = INVOC_ARG ? (parseInt(INVOC_ARG.split('=')[1], 10) || 1) : 1;

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function runCombo(pid, seed, inv) {
  const base = POLICY_REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: `trustdeltas-${pid}-s${seed}-i${inv}` });
  await setupGame(Game);
  const census = td.installTrustCensus(Game);
  const hashes = [];
  let maxRank = 0, maxArc = 1, everTable = false, won = false, everExiled = false;
  const policy = Object.assign({}, base);
  const origSetup = base.setup, origDaily = base.daily;
  policy.setup = (G, ctx) => { try { census.reproxy(); } catch (e) {} if (origSetup) { try { return origSetup(G, ctx); } catch (e) {} } };
  policy.daily = (G, ctx) => {
    try {
      census.reproxy(); // game code may reassign state.village.trust; re-wrap
      census.sampleDay();
      hashes.push(((G.state.scholar || {}).day || 0) + ':' + dayHash(G));
      const s = stdSnapshot(G);
      maxRank = Math.max(maxRank, RANK_ORDER[s.rank] || 0);
      maxArc = Math.max(maxArc, s.arc || 1);
      if (s.tableWaiting) everTable = true;
      if (s.won) won = true;
      if ((G.state.scholar || {}).exiled) everExiled = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, policy, { days: 180 }); });
  census.sampleDay();

  // delta-layer analysis
  const scholarDayMap = new Map(census.daySamples.map(s => [s.day, String(s.vid)]));
  const villageDays = census.daySamples.reduce((t, s) => t + (s.roster || 0), 0);
  const successions = td.decomposeSuccessions(census);
  const tenures = td.buildTenures(census, successions);
  const deltas = td.rankDeltas(census, scholarDayMap, villageDays);
  const periodic = td.huntPeriodicDrains(census, scholarDayMap);
  const progThresh = td.progressiveAtThreshold(census, scholarDayMap);
  const ablations = tenures.map(t => Object.assign({ vid: t.vid, days: t.days.length,
    startTrust: t.startTrust, endTrust: t.endTrust, belowClass: t.belowClass,
    daysBelow30: t.daysBelow30, inherit: t.inherit }, td.ablateSting(t)));

  // sense-test sample: for the top sitting-scholar drain and gain channels,
  // grab say lines from hit days spread across the run (early/mid/late).
  const senseBeats = [];
  const topDrain = deltas.filter(x => x.sNeg < 0).sort((a, b) => a.sNeg - b.sNeg)[0];
  const topGain = deltas.filter(x => x.sPos > 0).sort((a, b) => b.sPos - a.sPos)[0];
  for (const top of [topDrain, topGain].filter(Boolean)) {
    const hitDays = [...new Set(census.writes
      .filter(w => td.classifyDelta(w) === top.channel && scholarDayMap.get(w.day) === String(w.vid))
      .map(w => w.day))].sort((a, b) => a - b);
    const pick = hitDays.length <= 3 ? hitDays : [hitDays[0], hitDays[Math.floor(hitDays.length / 2)], hitDays[hitDays.length - 1]];
    const beats = [];
    for (const d of pick) for (const m of (census.daySays[d] || []).slice(0, 4)) beats.push(`d${d}: ${m.slice(0, 150)}`);
    senseBeats.push({ channel: top.channel, scope: 'sitting-scholar', beats: beats.slice(0, 12) });
  }

  const end = stdSnapshot(Game);
  const last = census.daySamples[census.daySamples.length - 1] || {};
  return {
    policy: pid, seed, invocation: inv,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    waveReach: r.maxWaveUnlocked || 1, maxArc,
    national: maxRank >= 2 ? 1 : 0, table: (everTable || end.tableWaiting) ? 1 : 0,
    wins: (won || end.won) ? 1 : 0, exiled: everExiled ? 1 : 0,
    villageDays,
    scholarTrustEnd: last.scholarTrust != null ? last.scholarTrust : null,
    successions: successions.length,
    deltas, periodic, progThresh, ablations,
    successionsDetail: successions,
    tenures: tenures.map(t => ({ vid: t.vid, days: t.days.length, startTrust: t.startTrust,
      endTrust: t.endTrust, maxTrust: t.maxTrust, minTrust: t.minTrust,
      daysBelow30: t.daysBelow30, daysAtOrAbove30: t.daysAtOrAbove30,
      belowClass: t.belowClass, drainTotal: +t.drainTotal.toFixed(1), gainTotal: +t.gainTotal.toFixed(1),
      setTotal: +t.setTotal.toFixed(1), drainByChannel: t.drainByChannel, gainByChannel: t.gainByChannel,
      inherit: t.inherit })),
    senseBeats,
    unclassified: deltas.filter(x => x.channel.indexOf('other:') === 0 && x.channel !== 'other:delete')
      .map(x => x.channel + ' x' + x.fires),
    hashes,
    writes: census.writes, // kept for the analyzer; stripped from the OUT summary
    trajectory: census.daySamples.map(s => ({ day: s.day, vid: s.vid, trust: s.scholarTrust, roster: s.roster })),
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`, base && typeof base.daily === 'function');
  }
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failures.'); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    const { Game } = await loadGame({ seed: 11, mode: 'trustdeltas-smoke-' + pid });
    await setupGame(Game);
    let census = null;
    try { census = td.installTrustCensus(Game); check(`[${pid}] census installed`, !!census && typeof census.reproxy === 'function'); }
    catch (e) { check(`[${pid}] census installed`, false, e.message); }
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    let dailyCalls = 0;
    policy.daily = (G, ctx) => { dailyCalls++; try { census.reproxy(); census.sampleDay(); } catch (e) {} if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15 }); });
    check(`[${pid}] policy.daily drove (${dailyCalls} calls)`, dailyCalls > 0);
    check(`[${pid}] census captured writes (${census.writes.length})`, census.writes.length > 0);
    const scholarDayMap = new Map(census.daySamples.map(s => [s.day, String(s.vid)]));
    let tenOk = false, ablOk = false;
    try {
      const ten = td.buildTenures(census, td.decomposeSuccessions(census));
      tenOk = ten.length > 0 && ten.every(t => !!t.belowClass);
      const ab = ten.map(t => td.ablateSting(t));
      ablOk = ab.every(a => a.replayError === 0);
    } catch (e) { console.log(`  (delta layer threw: ${e.message})`); }
    check(`[${pid}] delta layer: tenures built`, tenOk);
    check(`[${pid}] delta layer: ablation replay faithful`, ablOk);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: instrument honest, policies drive, delta layer computes — safe to measure.');
}

function summarize(rows) {
  const agg = {};
  let villageDays = 0;
  for (const r of rows) {
    villageDays += r.villageDays;
    for (const d of r.deltas) {
      const e = agg[d.channel] || (agg[d.channel] = { channel: d.channel, fires: 0, pos: 0, neg: 0, sPos: 0, sNeg: 0, sFires: 0, combos: 0 });
      e.fires += d.fires; e.pos += d.pos; e.neg += d.neg;
      e.sPos += d.sPos; e.sNeg += d.sNeg; e.sFires += d.sFires;
      if (d.fires > 0) e.combos++;
    }
  }
  const vd = villageDays > 0 ? villageDays : 1;
  const ranked = Object.values(agg).map(e => Object.assign(e, {
    per100vd_pos: +(e.pos / vd * 100).toFixed(2), per100vd_neg: +(e.neg / vd * 100).toFixed(2),
    per100vd_sPos: +(e.sPos / vd * 100).toFixed(2), per100vd_sNeg: +(e.sNeg / vd * 100).toFixed(2),
  })).sort((a, b) => (b.pos - a.pos) || (a.neg - b.neg));
  // below-30 attribution across tenures
  const below = {};
  let belowDays = 0, aboveDays = 0, ablGained = 0, ablActualAbove = 0, ablAblatedAbove = 0;
  for (const r of rows) {
    for (const t of r.tenures) {
      below[t.belowClass] = (below[t.belowClass] || 0) + t.daysBelow30;
      belowDays += t.daysBelow30; aboveDays += t.daysAtOrAbove30;
    }
    for (const a of r.ablations) { ablGained += a.gained; ablActualAbove += a.actualDaysAbove; ablAblatedAbove += a.ablatedDaysAbove; }
  }
  const n = rows.length;
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  return {
    combos: n, villageDays,
    ranked,
    below30: { classes: below, belowDays, aboveDays,
      share: +((belowDays / Math.max(1, belowDays + aboveDays)).toFixed(4)) },
    ablation: { actualDaysAbove: ablActualAbove, ablatedDaysAbove: ablAblatedAbove, gained: ablGained },
    wall: {
      national: rows.reduce((t, r) => t + r.national, 0) + '/' + n,
      table: rows.reduce((t, r) => t + r.table, 0) + '/' + n,
      wins: rows.reduce((t, r) => t + r.wins, 0) + '/' + n,
      exiled: rows.reduce((t, r) => t + r.exiled, 0) + '/' + n,
      maxWave: Math.max.apply(null, rows.map(r => r.waveReach).concat([1])),
      medianDays: med(rows.map(r => r.gameDays)),
      scholarTrustEndMedian: med(rows.map(r => r.scholarTrustEnd == null ? 0 : r.scholarTrustEnd)),
    },
  };
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir && !fs.existsSync(perSeedDir)) fs.mkdirSync(perSeedDir, { recursive: true });
  const rows = [];
  const gate = [];
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    for (const seed of SEEDS) {
      const a = await runCombo(pid, seed, 1);
      rows.push(a);
      console.log(`  [${pid} s${seed} i1] days=${a.days}/${a.endReason} wave=${a.waveReach} nat=${a.national} vd=${a.villageDays} writes=${a.writes.length} trustEnd=${a.scholarTrustEnd} unclass=${a.unclassified.length}`);
      if (perSeedDir) fs.writeFileSync(path.join(perSeedDir, `${pid}-s${seed}.json`), JSON.stringify(a, null, 1));
      if (INVOC >= 2) {
        const b = await runCombo(pid, seed, 2);
        const ha = a.hashes.join('|'), hb = b.hashes.join('|');
        const identical = ha === hb && a.hashes.length === b.hashes.length && a.hashes.length > 0;
        gate.push({ pid, seed, identical, daysA: a.days, daysB: b.days });
        console.log(`    A/A: ${identical ? 'IDENTICAL' : 'DIVERGED'} (${a.hashes.length} day-hashes)`);
        if (perSeedDir) fs.writeFileSync(path.join(perSeedDir, `${pid}-s${seed}-i2.json`),
          JSON.stringify(Object.assign({}, b, { hashes: undefined, writes: undefined }), null, 1));
      }
    }
  }
  const summary = summarize(rows);
  console.log('\n=== DELTA TAXONOMY: sitting-scholar drains (per 100 village-days) ===');
  for (const c of summary.ranked.filter(c => c.sNeg < 0).sort((x, y) => x.sNeg - y.sNeg).slice(0, 12)) {
    console.log(`  ${c.channel}: ${c.per100vd_sNeg}/100vd (total ${c.sNeg.toFixed(0)}) x${c.sFires} (${c.combos}/${rows.length} combos)`);
  }
  console.log('=== DELTA TAXONOMY: sitting-scholar gains ===');
  for (const c of summary.ranked.filter(c => c.sPos > 0).sort((x, y) => y.sPos - x.sPos).slice(0, 12)) {
    console.log(`  ${c.channel}: +${c.per100vd_sPos}/100vd (total ${c.sPos.toFixed(0)}) x${c.sFires} (${c.combos}/${rows.length} combos)`);
  }
  console.log('=== BELOW-30 ATTRIBUTION ===', JSON.stringify(summary.below30));
  console.log('=== STING ABLATION (in-silico) ===', JSON.stringify(summary.ablation));
  console.log('=== WALL ===', JSON.stringify(summary.wall));
  if (INVOC >= 2) {
    const bad = gate.filter(g => !g.identical);
    console.log(`=== DET-GATE: ${gate.length - bad.length}/${gate.length} identical ===`);
    if (bad.length) { console.log('DIVERGED: ' + bad.map(g => `${g.pid}-s${g.seed}`).join(', ')); process.exitCode = 2; }
  }
  const unclass = rows.filter(r => r.unclassified.length);
  if (unclass.length) console.log('UNCLASSIFIED WRITES in: ' + unclass.map(r => `${r.policy}-s${r.seed}: ${r.unclassified.join(',')}`).join(' '));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify({ summary,
    rows: rows.map(r => Object.assign({}, r, { hashes: undefined, writes: undefined })) }, null, 1));
}

main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(1); });
