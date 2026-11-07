// analyze-frozenband-bisect-20261107.js — bisect flip-table analyzer
// (arm sim-frozenband-bisect-b, run fleshout-loop-b-20261107T2030Z).
// Reads two OUTDIRs of doorwalk-b baseline-leg per-seed JSONs (one per
// candidate SHA) and prints the per-seed flip table: days, end, seat/sat
// day, standing, max wave, wave-4 kills, scholar deaths, instrument
// errors — plus median survival and sits for each side and the
// HEALTHY / COLLAPSED / AMBIGUOUS classification from the prereg flip
// bars (HEALTHY: median >= 120d AND sits >= 4/8; COLLAPSED: median
// <= 90d AND sits <= 1/8; else AMBIGUOUS).
// Usage:
//   node scripts/analyze-frozenband-bisect-20261107.js <dirA> <dirB> [labelA] [labelB]
// Exit 0 on a classified comparison; exit 2 on missing/unreadable input.
'use strict';
const fs = require('fs');
const path = require('path');

function seedSummaries(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return null;
  fs.readdirSync(dir).filter(function (f) { return f.indexOf('doorwalk-b-s') === 0 && f.endsWith('.json'); }).forEach(function (f) {
    const m = f.match(/doorwalk-b-s(\d+)-/);
    if (!m) return;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const daily = j.daily || [];
    // Sit = the seat TAKEN (takeseatStats.seatDay/seatKind), NOT the
    // daily tableSeat() row: tableSeat() turns 'lesser' the day the
    // seat is EARNED (53003: d60) while the sit itself is d90. The
    // 1430Z record's "seat earned d55" (53008) is the same distinction.
    const ts = j.takeseatStats || {};
    const taken = (ts.seatTaken | 0) > 0;
    const sat = taken ? (ts.seatDay != null ? ts.seatDay : null) : null;
    const seat = taken ? (ts.seatKind || null) : null;
    const w4 = ((j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length;
    const w5 = ((j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); })).length;
    out[parseInt(m[1], 10)] = {
      seed: parseInt(m[1], 10),
      days: j.days, gameDays: j.gameDays, endReason: j.endReason, won: !!j.won,
      sat: sat,
      seat: seat,
      seatEarnedDay: (function () { const sd = daily.filter(function (d) { return d.seat && d.seat !== 'none'; }); return sd.length ? sd[0].day : null; })(),
      standing: (j.standing == null ? null : j.standing),
      maxWave: j.maxWave, w4kills: w4, w5kills: w5,
      scholarDeaths: j.scholarDeaths || 0,
      sitAttempts: (j.sitAttempts || []).length,
      errors: (j.instrumentErrors || []).length,
      anchor: j.anchorCommit || null,
    };
  });
  return out;
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  if (!n) return null;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function classify(summaries) {
  const seeds = Object.keys(summaries).map(Number).sort(function (a, b) { return a - b; });
  const days = seeds.map(function (s) { return summaries[s].days; });
  const sits = seeds.filter(function (s) { return summaries[s].sat != null; }).length;
  const med = median(days);
  let verdict = 'AMBIGUOUS';
  if (med != null && med >= 120 && sits >= 4) verdict = 'HEALTHY';
  else if (med != null && med <= 90 && sits <= 1) verdict = 'COLLAPSED';
  return { n: seeds.length, median: med, sits: sits, verdict: verdict };
}

function flipTable(a, b, labelA, labelB) {
  const seeds = Object.keys(a).map(Number).sort(function (x, y) { return x - y; });
  const lines = [];
  lines.push('| Seed | ' + labelA + ' days | ' + labelB + ' days | Δdays | ' + labelA + ' seat/sat | ' + labelB + ' seat/sat | ' + labelA + ' stand | ' + labelB + ' stand | ' + labelA + ' w4 | ' + labelB + ' w4 | end ' + labelA + ' → ' + labelB + ' |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|');
  seeds.forEach(function (s) {
    const x = a[s], y = b[s] || {};
    const d = (x.days != null && y.days != null) ? (y.days - x.days) : null;
    lines.push('| ' + s + ' | ' + x.days + ' | ' + (y.days == null ? '—' : y.days) + ' | ' + (d == null ? '—' : (d > 0 ? '+' : '') + d) + ' | ' +
      (x.seat ? x.seat + ' d' + x.sat : '—') + ' | ' + (y.seat ? y.seat + ' d' + y.sat : '—') + ' | ' +
      (x.standing == null ? '—' : x.standing) + ' | ' + (y.standing == null ? '—' : y.standing) + ' | ' +
      x.w4kills + ' | ' + (y.w4kills == null ? '—' : y.w4kills) + ' | ' + x.endReason + ' → ' + (y.endReason || '—') + ' |');
  });
  return lines.join('\n');
}

function main() {
  const dirA = process.argv[2], dirB = process.argv[3];
  const labelA = process.argv[4] || dirA, labelB = process.argv[5] || dirB;
  if (!dirA || !dirB) { console.error('USAGE: node analyze-frozenband-bisect-20261107.js <dirA> <dirB> [labelA] [labelB]'); process.exit(2); }
  const a = seedSummaries(dirA), b = seedSummaries(dirB);
  if (!a || !b || !Object.keys(a).length || !Object.keys(b).length) {
    console.error('BISECT-ANALYZE STOP: empty or missing input dir(s).'); process.exit(2);
  }
  const ca = classify(a), cb = classify(b);
  console.log('A ' + labelA + ': n=' + ca.n + ' median=' + ca.median + 'd sits=' + ca.sits + '/8 verdict=' + ca.verdict);
  console.log('B ' + labelB + ': n=' + cb.n + ' median=' + cb.median + 'd sits=' + cb.sits + '/8 verdict=' + cb.verdict);
  console.log(flipTable(a, b, labelA, labelB));
  const moved = Object.keys(a).filter(function (s) { return b[s] && b[s].days != null && a[s].days !== b[s].days; }).length;
  const errA = Object.keys(a).reduce(function (t, s) { return t + a[s].errors; }, 0);
  const errB = Object.keys(b).reduce(function (t, s) { return t + b[s].errors; }, 0);
  console.log('seeds with moved death day: ' + moved + '/' + Object.keys(a).length + '; instrument errors A=' + errA + ' B=' + errB);
  console.log(JSON.stringify({ a: ca, b: cb, movedSeeds: moved, errorsA: errA, errorsB: errB }));
}

if (require.main === module) main();
module.exports = { seedSummaries: seedSummaries, median: median, classify: classify, flipTable: flipTable };
