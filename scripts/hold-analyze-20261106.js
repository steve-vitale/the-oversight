// hold-analyze-20261106.js — HOLD probe analyzer (arm sim-hold-b).
// Reads the per-seed JSONs written by hold-driver-20261106.js and
// judges the prereg GO bar + guards, with wall numbers per leg.
// Prereg (evidence/2026-11-06/sim-hold-b-prereg.md): primary metric
// end-rank national+ (realm held to end of run) — GO iff armed
// end-rank national+ >= linkseek-baseline +2 seeds on the 8-seed
// pilot AND >=1 additional seed holds all 3 links seasoned to day
// 150 (end diplomacy 102) OR the realm persists >=30 days longer
// than baseline on the seeds where both form it. Guards: median
// survival armed >= 0.8x baseline; wave-4 ledger points armed >=
// 0.5x baseline total (POOLED counts); no new death mode.
// Usage:
//   RUN=hold-pilot node scripts/hold-analyze-20261106.js
//   RUN=hold-stage0 SEEDS=58001,58002,58003 node scripts/hold-analyze-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const RUN = process.env.RUN || 'hold-pilot';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : [58001, 58002, 58003, 58004, 58005, 58006, 58007, 58008]).filter(Number.isFinite);
const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-hold-b');

function load(seed, leg) {
  const f = path.join(dir, 'hold-s' + seed + '-' + leg + '-' + RUN + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function maxOf(daily, fn) {
  let m = null;
  for (const s of daily) { const v = fn(s); if (v != null && (m == null || v > m)) m = v; }
  return m;
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function analyzeSeed(seed) {
  const out = { seed: seed };
  for (const leg of ['linkseek', 'hold']) {
    const f = path.join(dir, 'hold-s' + seed + '-' + leg + '-' + RUN + '.json');
    if (!fs.existsSync(f)) { out[leg] = null; continue; }
    const rec = load(seed, leg);
    const d = rec.daily || [];
    const last = d[d.length - 1] || {};
    // Realm persistence: days with diplomacy > 0 (34 per seasoned
    // regional link; 102 = all three seasoned at once).
    let firstDiplo = null, lastDiplo = null, diploDays = 0, maxDiplo = 0;
    for (const s of d) {
      const dp = ((s.standing || {}).diplomacy || 0);
      if (dp > maxDiplo) maxDiplo = dp;
      if (dp > 0) { diploDays++; if (firstDiplo == null) firstDiplo = s.day; lastDiplo = s.day; }
    }
    const endDiplo = ((last.standing || {}).diplomacy || 0);
    const r5 = last.readiness5 || {};
    const w5faced = d.some(function (s) { return (s.peakWave || 0) >= 5; });
    const w4faced = d.some(function (s) { return !!s.w4faced; });
    out[leg] = {
      days: rec.days, endReason: rec.endReason, won: !!rec.won, over: !!rec.over,
      scaleRank: rec.scaleRank, maxWave: rec.maxWave, unlockedWave: rec.unlockedWave,
      endGated: last.gated, endRaw: (last.standing || {}).total,
      peakGated: maxOf(d, function (s) { return s.gated; }),
      peakDiplo: maxDiplo, endDiplo: endDiplo,
      holdsAll3ToEnd: endDiplo >= 102,
      realmFirstDay: firstDiplo, realmLastDay: lastDiplo,
      realmSpanDays: (firstDiplo != null && lastDiplo != null) ? (lastDiplo - firstDiplo) : 0,
      realmDiploDays: diploDays,
      readyDays: d.filter(function (s) { return s.readiness5 && s.readiness5.ready; }).length,
      endReady: r5.ready, endVets: (r5.veterans || {}).have,
      ledger4: (last.ledger || {})[4],
      ledger5: (last.ledger || {})[5],
      w4faced: w4faced, w5faced: w5faced,
      waveKillLogEntries: rec.waveKillLogEntries,
      snapshots: d.length, instrumentErrors: (rec.instrumentErrors || []).length,
    };
  }
  return out;
}

function main() {
  const rows = SEEDS.map(analyzeSeed).filter(function (r) { return r.linkseek || r.hold; });
  const both = rows.filter(function (r) { return r.linkseek && r.hold; });
  const endNat = function (r, leg) { return r[leg] && ['national', 'global', 'table'].indexOf(r[leg].scaleRank) !== -1; };
  const baseNat = both.filter(function (r) { return endNat(r, 'linkseek'); }).length;
  const armedNat = both.filter(function (r) { return endNat(r, 'hold'); }).length;
  const baseHold3 = both.filter(function (r) { return r.linkseek.holdsAll3ToEnd; }).length;
  const armedHold3 = both.filter(function (r) { return r.hold.holdsAll3ToEnd; }).length;
  // Realm persistence on seeds where BOTH legs formed the realm.
  const persistGains = both.filter(function (r) { return r.linkseek.realmDiploDays > 0 && r.hold.realmDiploDays > 0; })
    .map(function (r) { return { seed: r.seed, base: r.linkseek.realmSpanDays, armed: r.hold.realmSpanDays, gain: r.hold.realmSpanDays - r.linkseek.realmSpanDays }; });
  const persistGO = persistGains.some(function (p) { return p.gain >= 30; });
  const goClause1 = armedNat >= baseNat + 2;
  const goClause2 = (armedHold3 >= baseHold3 + 1) || persistGO;
  const baseDays = both.map(function (r) { return r.linkseek.days; });
  const armedDays = both.map(function (r) { return r.hold.days; });
  const baseLedger4 = both.reduce(function (t, r) { return t + (r.linkseek.ledger4 || 0); }, 0);
  const armedLedger4 = both.reduce(function (t, r) { return t + (r.hold.ledger4 || 0); }, 0);
  const guardSurvival = median(armedDays) >= 0.8 * median(baseDays);
  const guardKills = (baseLedger4 === 0) ? 'vacuous' : (armedLedger4 >= 0.5 * baseLedger4);
  const summary = {
    run: RUN,
    go: { clause1NationalPlus2: { base: baseNat, armed: armedNat, need: baseNat + 2, pass: goClause1 },
      clause2HoldOrPersist: { baseHold3: baseHold3, armedHold3: armedHold3, persistGains: persistGains, pass: goClause2 } },
    guards: {
      medianSurvivalBaseline: median(baseDays), medianSurvivalArmed: median(armedDays),
      survivalRatio: median(baseDays) ? +(median(armedDays) / median(baseDays)).toFixed(2) : null,
      pass: guardSurvival,
      ledger4BaselineTotal: baseLedger4, ledger4ArmedTotal: armedLedger4,
      killsGuard: guardKills,
    },
    verdict: (goClause1 && goClause2 && guardSurvival && guardKills !== false) ? 'GO' : 'NO-GO',
    wall: {},
    rows: rows,
  };
  for (const leg of ['linkseek', 'hold']) {
    const rs = both.filter(function (r) { return r[leg]; });
    summary.wall[leg] = {
      wins: rs.filter(function (r) { return r[leg].won; }).length,
      national: rs.filter(function (r) { return r[leg].scaleRank === 'national'; }).length,
      global: rs.filter(function (r) { return r[leg].scaleRank === 'global'; }).length,
      table: rs.filter(function (r) { return r[leg].scaleRank === 'table'; }).length,
      nationalPlusEnd: rs.filter(function (r) { return endNat(r, leg); }).length,
      wave4unlock: rs.filter(function (r) { return (r[leg].maxWave || 1) >= 4; }).length,
      wave4faced: rs.filter(function (r) { return r[leg].w4faced; }).length,
      wave5unlock: rs.filter(function (r) { return (r[leg].maxWave || 1) >= 5; }).length,
      wave5faced: rs.filter(function (r) { return r[leg].w5faced; }).length,
      medianDays: median(rs.map(function (r) { return r[leg].days; })),
      survivors: rs.filter(function (r) { return r[leg].days >= 150; }).length,
      ledger4Total: rs.reduce(function (t, r) { return t + (r[leg].ledger4 || 0); }, 0),
      readyDaysTotal: rs.reduce(function (t, r) { return t + (r[leg].readyDays || 0); }, 0),
    };
  }
  console.log('## per-seed');
  for (const r of rows) {
    console.log(JSON.stringify({
      seed: r.seed,
      linkseek: r.linkseek ? { days: r.linkseek.days, rank: r.linkseek.scaleRank, peakDiplo: r.linkseek.peakDiplo, endDiplo: r.linkseek.endDiplo, realmSpan: r.linkseek.realmSpanDays, realmDays: r.linkseek.realmDiploDays, ledger4: r.linkseek.ledger4, readyDays: r.linkseek.readyDays } : null,
      hold: r.hold ? { days: r.hold.days, rank: r.hold.scaleRank, peakDiplo: r.hold.peakDiplo, endDiplo: r.hold.endDiplo, realmSpan: r.hold.realmSpanDays, realmDays: r.hold.realmDiploDays, ledger4: r.hold.ledger4, readyDays: r.hold.readyDays } : null,
    }));
  }
  console.log('## verdict');
  console.log(JSON.stringify({ verdict: summary.verdict, go: summary.go, guards: summary.guards, wall: summary.wall }, null, 2));
  const sumFile = path.join(dir, 'hold-analysis-' + RUN + '.json');
  fs.writeFileSync(sumFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, sumFile));
}

if (require.main === module) main();
module.exports = { analyzeSeed: analyzeSeed, median: median };
