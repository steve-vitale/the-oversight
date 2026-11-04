'use strict';
// analyze-hurthome-fix-b.js — pooled event-case comparison for
// sim-hurthome-fix-b. Reads the sweep summaries (or per-seed files)
// under evidence/2026-11-04/perseed-hurthome-fix-b/ and prints:
// trips vs walk-outs (never pooled), returned-hurt latency median
// (pooled case-level), died-while-away shares, hurt-return line
// counts, source split, guardrails, and the per-seed matched table.
// Usage: node scripts/analyze-hurthome-fix-b.js [perseed-dir]
const fs = require('fs');
const path = require('path');
const lib = require('./hurthome-b-lib');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-fix-b');
function loadCell(cell) {
  const f = path.join(DIR, 'sweep-' + cell + '.json');
  if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  return (j.rows || []).map((r) => r.perSeed);
}
function isWalkout(c) { return c.purpose === 'leave'; }
function summarize(perSeeds) {
  const all = perSeeds.flatMap((s) => (s.cases || []).map((c) => Object.assign({ _seed: s.seed }, c)));
  const trips = all.filter((c) => !isWalkout(c));
  const walks = all.filter(isWalkout);
  const rh = (xs) => xs.filter((c) => c.outcome === 'returned-hurt');
  const lat = (xs) => rh(xs).map((c) => c.latencyParts).filter((n) => typeof n === 'number');
  const died = (xs) => xs.filter((c) => c.outcome === 'died').length;
  const byOutcome = (xs) => {
    const o = {};
    for (const c of xs) o[c.outcome] = (o[c.outcome] || 0) + 1;
    return o;
  };
  const hurtLines = perSeeds.flatMap((s) => (s.transcript || [])
    .filter((t) => /returns from the wilds hurt/i.test(t.line))
    .map((t) => Object.assign({ seed: s.seed }, t)));
  const days = perSeeds.map((s) => s.daysAlive).sort((a, b) => a - b);
  const medDays = lib.median(days);
  const survived = perSeeds.filter((s) => s.daysAlive >= 100).length;
  const errors = perSeeds.flatMap((s) => (s.errors || []).map((e) => 's' + s.seed + ':' + e));
  const unclassified = all.filter((c) => !c.outcome || c.outcome === 'open').length;
  return { seeds: perSeeds.length, all, trips, walks,
    tripOutcomes: byOutcome(trips), walkOutcomes: byOutcome(walks),
    tripRH: rh(trips).length, tripRHLat: lat(trips),
    tripRHMedian: lib.median(lat(trips)),
    tripRHMean: lat(trips).length ? lat(trips).reduce((a, b) => a + b, 0) / lat(trips).length : null,
    walkRH: rh(walks).length, walkRHLat: lat(walks),
    tripDied: died(trips), tripDiedShare: trips.length ? died(trips) / trips.length : null,
    walkDied: died(walks),
    hurtLines, hurtLineCount: hurtLines.length,
    sourceSplit: (() => { const o = {}; for (const c of trips) o[c.source] = (o[c.source] || 0) + 1; return o; })(),
    finalScanReturns: trips.filter((c) => c.censorNote === 'finalScanReturn').length,
    returnedUnknown: trips.filter((c) => c.outcome === 'returned-unknown').length,
    medDays, survived,
    national: perSeeds.filter((s) => s.national).length,
    table: perSeeds.filter((s) => s.table).length,
    wins: perSeeds.filter((s) => s.win).length,
    maxWave: Math.max(0, ...perSeeds.map((s) => s.maxWave || 1)),
    totalDeaths: perSeeds.reduce((a, s) => a + ((s.deaths || []).length), 0),
    errors, unclassified };
}
function fmt(n, d) { return (typeof n === 'number' && typeof d === 'number' && d) ? n.toFixed(3) : String(n); }

const B = summarize(loadCell('baseline'));
const A = summarize(loadCell('armed'));
function show(label, S) {
  console.log(`\n== ${label} (${S.seeds} seeds) ==`);
  console.log(`trip cases: ${S.trips.length} outcomes=${JSON.stringify(S.tripOutcomes)}`);
  console.log(`trip returned-hurt: ${S.tripRH} latency median=${S.tripRHMedian} mean=${S.tripRHMean == null ? 'n/a' : S.tripRHMean.toFixed(2)} latencies=[${S.tripRHLat.join(',')}]`);
  console.log(`trip died: ${S.tripDied}/${S.trips.length} share=${fmt(S.tripDiedShare, S.trips.length)}`);
  console.log(`walk-out cases: ${S.walks.length} outcomes=${JSON.stringify(S.walkOutcomes)} returned-hurt=${S.walkRH} latencies=[${S.walkRHLat.join(',')}] died=${S.walkDied}`);
  console.log(`hurt-return lines: ${S.hurtLineCount} sourceSplit(trips)=${JSON.stringify(S.sourceSplit)} finalScanReturns(trips)=${S.finalScanReturns} returnedUnknown(trips)=${S.returnedUnknown}`);
  console.log(`guardrails: median daysAlive=${S.medDays} survived=${S.survived}/${S.seeds} national=${S.national} table=${S.table} wins=${S.wins} maxWave=${S.maxWave} totalDeaths=${S.totalDeaths}`);
  console.log(`instrument: errors=${S.errors.length} ${S.errors.slice(0, 10).join(' | ')} unclassified=${S.unclassified}`);
}
show('BASELINE', B);
show('ARMED', A);
console.log('\n== DELTAS (armed - baseline) ==');
console.log(`trip cases: ${A.trips.length - B.trips.length}; returned-hurt median latency: ${A.tripRHMedian} vs ${B.tripRHMedian}; died share: ${fmt(A.tripDiedShare, A.trips.length)} vs ${fmt(B.tripDiedShare, B.trips.length)}`);
console.log(`hurt lines: ${A.hurtLineCount} vs ${B.hurtLineCount}; median daysAlive: ${A.medDays} vs ${B.medDays}; survived: ${A.survived} vs ${B.survived}`);
console.log('\n== PER-SEED MATCHED TABLE ==');
console.log('seed | B days | B tripCases | B retHurt | A days | A tripCases | A retHurt | A hurtLines');
const bSeeds = loadCell('baseline'), aSeeds = loadCell('armed');
const bBy = new Map(bSeeds.map((s) => [s.seed, s]));
const aBy = new Map(aSeeds.map((s) => [s.seed, s]));
for (const seed of [...bBy.keys()].sort((a, b) => a - b)) {
  const b = bBy.get(seed), a = aBy.get(seed);
  if (!a) { console.log(seed + ' | (no armed row)'); continue; }
  const cnt = (s, pred) => (s.cases || []).filter((c) => c.purpose !== 'leave' && pred(c)).length;
  const hl = (s) => (s.transcript || []).filter((t) => /returns from the wilds hurt/i.test(t.line)).length;
  console.log(`${seed} | ${b.daysAlive} | ${cnt(b, () => true)} | ${cnt(b, (c) => c.outcome === 'returned-hurt')} | ${a.daysAlive} | ${cnt(a, () => true)} | ${cnt(a, (c) => c.outcome === 'returned-hurt')} | ${hl(a)}`);
}
console.log('\n== ARMED HURT-RETURN LINES ==');
for (const t of A.hurtLines) console.log(`s${t.seed} d${t.day} p${t.part}: ${t.line}`);
console.log('\n== ARMED WALK-OUT RETURNED-HURT CASES (exclusion check) ==');
for (const c of A.walks.filter((c) => c.outcome === 'returned-hurt')) {
  console.log(`s${c._seed} ${c.name || c.vid} purpose=${c.purpose} latency=${c.latencyParts} hpAtEvent=${c.hpAtEvent} returnPreHp=${c.returnPreHp}`);
}
