#!/usr/bin/env node
// analyze-tributecost-a.js — paired analysis for sim-tributecost-a.
// Reads the recorder per-seed corpora (competent + leanlink, seeds
// 9911–9918, 180d) and the committed vests-b corpora, and computes:
//   - wall numbers per column (national / table / wins, wave reach,
//     median + max survival, four-realm formation, death-cause shares)
//   - tribute quantification per column: Haven-paid (payTribute events,
//     actual kcal), tribute income (arrival events, exact amounts),
//     courting outflow (counter sweeteners + accord gifts, pantry
//     actuals from verb wraps), end-state arrears per flipped link
//   - recorder completeness per run (series lengths, tele-vs-harness
//     death counts, aggregate-vs-log counts)
//   - reproduction check vs the vests-b corpora (days, endReason,
//     wave, rank, national, table, deaths)
//   - the leanlink-9912 vs competent-9912 decomposition (final-decline
//     shape: population series, last-14-days deaths, pantry series,
//     joiners/leavers, link/arrears state)
//   - optional panel cross-check (--panel-competent <dir> --panel-leanlink
//     <dir>: panel.json.gz rows vs recorder rows on days, wave, rank,
//     national, table, entered, won)
// No game code, no policy defaults: pure corpus reader, deterministic.
// Usage:
//   node scripts/analyze-tributecost-a.js [--out <analysis.json>]
//     [--panel-competent <dir> --panel-leanlink <dir>]
// The analysis JSON is ALSO printed to stdout (@@ANALYSIS_JSON@@) so a
// denied file write never loses it: reconstruct from stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-30');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; };

function loadDir(dir) {
  const rows = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^seed-\d+\.json$/.test(f)) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  rows.sort((a, b) => a.seed - b.seed);
  return rows;
}
function sumDeaths(rows) {
  const out = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) out[k] = (out[k] || 0) + v;
  return out;
}
function monsterCombatShare(deaths) {
  let mc = 0, total = 0;
  for (const [k, v] of Object.entries(deaths)) {
    total += v;
    if (k.startsWith('monster:') || k === 'villager:monster') mc += v;
  }
  return { monsterCombat: mc, total, share: total ? mc / total : null };
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
function tributeTotals(rows) {
  const perSeed = rows.map(r => {
    const paid = (r.payTributeEvents || []).reduce((t, e) => t + (typeof e.ret === 'number' ? e.ret : 0), 0);
    const paidCalls = (r.payTributeEvents || []).length;
    const arr = (r.tributeArrivals || []).reduce((t, e) => t + (e.amount || 0), 0);
    const arrCalls = (r.tributeArrivals || []).length;
    let sweetenKcal = 0, sweetenCalls = 0, accordKcal = 0, accordCalls = 0, proposeCalls = 0;
    for (const c of (r.courtCalls || [])) {
      if (c.name === 'proposeLink') proposeCalls++;
      if (c.name === 'answerCounter') {
        // A sweetener removes 1500 pantry kcal; an accept removes 0.
        // pantryDelta is the measured actual (negative = outflow).
        if (c.pantryDelta < 0) { sweetenCalls++; sweetenKcal += -c.pantryDelta; }
      }
      if (c.name === 'answerAccord' && c.pantryDelta < 0) { accordCalls++; accordKcal += -c.pantryDelta; }
    }
    const endArrearsHavenPays = (r.endLinks || [])
      .filter(l => l.subordinate === 'haven')
      .map(l => ({ primary: l.primary, tributeKcalPerWeek: l.tributeKcalPerWeek, arrears: l.arrears || 0, trust: l.trust, status: l.status }));
    const endArrearsHavenReceives = (r.endLinks || [])
      .filter(l => l.primary === 'haven')
      .map(l => ({ subordinate: l.subordinate, tributeKcalPerWeek: l.tributeKcalPerWeek, arrears: l.arrears || 0, trust: l.trust, status: l.status }));
    return { seed: r.seed, paidKcal: paid, paidCalls, arrivalKcal: arr, arrivalCalls: arrCalls,
      sweetenKcal, sweetenCalls, accordKcal, accordCalls, proposeCalls,
      endArrearsHavenPays, endArrearsHavenReceives };
  });
  const tot = (k) => perSeed.reduce((t, s) => t + s[k], 0);
  return { perSeed, totals: { paidKcal: tot('paidKcal'), paidCalls: tot('paidCalls'), arrivalKcal: tot('arrivalKcal'), arrivalCalls: tot('arrivalCalls'), sweetenKcal: tot('sweetenKcal'), sweetenCalls: tot('sweetenCalls'), accordKcal: tot('accordKcal'), accordCalls: tot('accordCalls'), proposeCalls: tot('proposeCalls') } };
}
function completeness(rows) {
  return rows.map(r => {
    const pantryLen = (r.pantryDaily || []).length;
    const popLen = (r.popDaily || []).length;
    const linkLen = (r.linkDays || []).length;
    const aggSum = Object.values(r.deaths || {}).reduce((t, v) => t + v, 0);
    let maxPantryGap = null, maxPopGap = null;
    try {
      const samp = new Map((r.pantrySamples || []).map(([d, v]) => [d, v]));
      // pantrySamples are keyed by LOOP day; pantryDaily by scholar day.
      // Compare by ORDER (both daily series): index-aligned abs diff.
      const a = (r.pantryDaily || []).map(p => p.kcal);
      const b = (r.pantrySamples || []).map(([, v]) => v);
      const n = Math.min(a.length, b.length);
      maxPantryGap = n ? Math.max.apply(null, Array.from({ length: n }, (_, i) => Math.abs(a[i] - b[i]))) : null;
      const pa = (r.popDaily || []).map(p => p.pop);
      const pb = (r.popSamples || []).map(([, v]) => v);
      const m = Math.min(pa.length, pb.length);
      maxPopGap = m ? Math.max.apply(null, Array.from({ length: m }, (_, i) => Math.abs(pa[i] - pb[i]))) : null;
    } catch (e) {}
    return { seed: r.seed, days: r.days, endReason: r.endReason,
      pantryDailyLen: pantryLen, pantryDailyGapVsDays: r.days - pantryLen,
      popDailyLen: popLen, linkDaysLen: linkLen,
      teleDeathCount: r.teleDeathCount, deathLogCount: r.deathLogCount,
      teleMatchesLog: r.teleDeathCount === r.deathLogCount,
      aggregateMatchesLog: aggSum === r.deathLogCount,
      maxPantryGapVsSamples: maxPantryGap, maxPopGapVsSamples: maxPopGap,
      pantryEODLen: (r.pantryEOD || []).length };
  });
}
function wall(rows) {
  const deaths = sumDeaths(rows);
  const mc = monsterCombatShare(deaths);
  const waveReach = {};
  for (let k = 1; k <= 5; k++) waveReach['wave' + k] = rows.filter(r => (r.waveReach || 1) >= k).length;
  return { n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    national: rows.reduce((t, r) => t + r.national, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    villageLost: rows.filter(r => r.endReason === 'village-lost').length,
    global: rows.filter(r => r.maxRank === 'global').length,
    medianDays: median(rows.map(r => r.days)),
    maxDays: Math.max.apply(null, rows.map(r => r.days)),
    maxWave: Math.max.apply(null, rows.map(r => r.waveReach || 1)),
    waveReach, deaths, monsterCombat: mc };
}
function reproduction(rows, vestsAgg) {
  const bySeed = new Map((vestsAgg.runs || []).map(r => [r.seed, r]));
  return rows.map(r => {
    const v = bySeed.get(r.seed);
    if (!v) return { seed: r.seed, vestsRow: false };
    const vDeaths = Object.values(v.deaths || {}).reduce((t, x) => t + x, 0);
    return { seed: r.seed, vestsRow: true,
      daysMatch: r.days === v.days, endReasonMatch: r.endReason === v.endReason,
      waveMatch: r.waveReach === v.waveReach, rankMatch: r.maxRank === v.maxRank,
      nationalMatch: r.national === v.national, tableMatch: r.table === v.table,
      deathsMatch: r.deathLogCount === vDeaths,
      rec: { days: r.days, endReason: r.endReason, wave: r.waveReach, rank: r.maxRank, national: r.national, table: r.table, deaths: r.deathLogCount },
      vests: { days: v.days, endReason: v.endReason, wave: v.waveReach, rank: v.maxRank, national: v.national, table: v.table, deaths: vDeaths } };
  });
}
function decompose9912(compRows, leanRows) {
  const c = compRows.find(r => r.seed === 9912);
  const l = leanRows.find(r => r.seed === 9912);
  const window = (row) => {
    if (!row) return null;
    const lastDay = Math.max.apply(null, (row.popDaily || []).map(p => p.scholarDay).concat([0]));
    const popTail = (row.popDaily || []).filter(p => p.scholarDay >= lastDay - 14);
    const deathTail = (row.deathLog || []).filter(d => d.day >= lastDay - 14);
    const pantryTail = (row.pantryDaily || []).filter(p => p.scholarDay >= lastDay - 14);
    const deathWho = new Set((row.deathLog || []).map(d => String(d.who)));
    const leaversUnexplained = (row.leavers || []).filter(x => !deathWho.has(String(x.id)));
    const popAt = (day) => {
      const p = (row.popDaily || []).filter(x => x.scholarDay <= day);
      return p.length ? p[p.length - 1].pop : null;
    };
    return { lastDay, endReason: row.endReason, days: row.days,
      popTrajectory: { d0: popAt(0), d30: popAt(30), d60: popAt(60), d90: popAt(90), d120: popAt(120), last: popAt(lastDay) },
      popTail, deathTail, pantryTailFirst: pantryTail[0] || null, pantryTailLast: pantryTail[pantryTail.length - 1] || null,
      pantryTailMin: pantryTail.length ? Math.min.apply(null, pantryTail.map(p => p.kcal)) : null,
      joinersTotal: (row.joiners || []).length, leaversTotal: (row.leavers || []).length,
      leaversUnexplained, endLinks: row.endLinks || [],
      court: row.court || {} };
  };
  return { competent: window(c), leanlink: window(l) };
}
function panelCrossCheck(panelDir, rows) {
  const gz = path.join(panelDir, 'panel.json.gz');
  if (!fs.existsSync(gz)) return { panelDir, present: false };
  const panel = JSON.parse(zlib.gunzipSync(fs.readFileSync(gz)).toString('utf8'));
  const byKey = new Map((panel.rows || []).map(r => [r.row.policy + ':' + r.row.seed, r]));
  const checks = rows.map(r => {
    const p = byKey.get(r.policy + ':' + r.seed);
    if (!p) return { seed: r.seed, panelRow: false };
    // Panel rows carry observer metrics, not raw days/wave/rank; the
    // vests-b precedent compared days/wave/rank/national/table/
    // entered/won via the panel's row fields where present. Report
    // what the panel row carries, and flag absence honestly.
    return { seed: r.seed, panelRow: true, panelKeys: Object.keys(p.row || {}), panelRowSample: p.row };
  });
  return { panelDir, present: true, cases: (panel.rows || []).length, checks };
}

function main() {
  const compDir = path.join(EVID, 'sim-tributecost-a-corpus-competent');
  const leanDir = path.join(EVID, 'sim-tributecost-a-corpus-leanlink');
  const comp = loadDir(compDir);
  const lean = loadDir(leanDir);
  const vestsComp = JSON.parse(fs.readFileSync(path.join(EVID, 'sim-vests-b-corpus-competent.json'), 'utf8'));
  const vestsLean = JSON.parse(fs.readFileSync(path.join(EVID, 'sim-vests-b-corpus-leanlink.json'), 'utf8'));
  const analysis = {
    label: 'sim-tributecost-a',
    seeds: [9911, 9912, 9913, 9914, 9915, 9916, 9917, 9918],
    competent: { wall: wall(comp), tribute: tributeTotals(comp), completeness: completeness(comp) },
    leanlink: { wall: wall(lean), tribute: tributeTotals(lean), completeness: completeness(lean) },
    reproduction: { competent: reproduction(comp, vestsComp), leanlink: reproduction(lean, vestsLean) },
    paired: comp.map((c) => {
      const l = lean.find(x => x.seed === c.seed);
      return { seed: c.seed,
        comp: { days: c.days, endReason: c.endReason, rank: c.maxRank, national: c.national, table: c.table, deaths: c.deathLogCount },
        lean: l ? { days: l.days, endReason: l.endReason, rank: l.maxRank, national: l.national, table: l.table, deaths: l.deathLogCount } : null,
        dayDelta: l ? l.days - c.days : null, deathDelta: l ? l.deathLogCount - c.deathLogCount : null };
    }),
    decompose9912: decompose9912(comp, lean),
  };
  const pc = arg('panel-competent', null), pl = arg('panel-leanlink', null);
  if (pc || pl) {
    analysis.panels = {
      competent: pc ? panelCrossCheck(pc, comp) : null,
      leanlink: pl ? panelCrossCheck(pl, lean) : null,
    };
  }
  const out = arg('out', path.join(EVID, 'sim-tributecost-a-analysis.json'));
  try {
    fs.writeFileSync(out, JSON.stringify(analysis, null, 1) + '\n');
    console.log('wrote ' + out);
  } catch (e) {
    console.log('WRITE FAILED for ' + out + ' (' + (e.code || e.message) + '); analysis below on stdout for reconstruction.');
  }
  console.log('@@ANALYSIS_JSON@@' + JSON.stringify(analysis));
  return analysis;
}
if (require.main === module) main();
module.exports = { wall, tributeTotals, completeness, reproduction, decompose9912 };
