'use strict';
// analyze-hurthome-fix-c.js — pooled event-case comparison for
// sim-hurthome-fix-b. Reads the sweep summaries (or per-seed files)
// under evidence/2026-11-04/perseed-hurthome-fix-c/ and prints:
// trips vs walk-outs (never pooled), returned-hurt latency median
// (pooled case-level), died-while-away shares, hurt-return line
// counts, source split, guardrails, and the per-seed matched table.
// Usage: node scripts/analyze-hurthome-fix-c.js [perseed-dir]
const fs = require('fs');
const path = require('path');
const lib = require('./hurthome-b-lib');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-fix-c');
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
    retroCases: trips.filter((c) => c.source === 'retro-line').length,
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
// D2 death decomposition (pre-registered, fix-c): per cell, split total
// deaths into (i) deaths of villagers with a qualifying prior case and
// (ii) all other deaths. Armed qualifying case = a TRIP returned-hurt
// case with closeDay <= death day. Baseline qualifying case = ANY trip
// case with eventDay <= death day. Same-day hits are broken out so the
// reader can see the sensitivity of the <= rule.
function decompose(perSeeds, armed) {
  let tot = 0, qual = 0, qualSameDay = 0;
  for (const s of perSeeds) {
    const trips = (s.cases || []).filter((c) => c.purpose !== 'leave');
    for (const d of (s.deaths || [])) {
      tot += 1;
      const hit = armed
        ? trips.filter((c) => c.vid === d.who && c.outcome === 'returned-hurt' && c.closeDay != null && c.closeDay <= d.day)
        : trips.filter((c) => c.vid === d.who && c.eventDay != null && c.eventDay <= d.day);
      if (hit.length) {
        qual += 1;
        const same = armed
          ? hit.some((c) => c.closeDay === d.day)
          : hit.some((c) => c.eventDay === d.day);
        if (same) qualSameDay += 1;
      }
    }
  }
  return { total: tot, qual, qualSameDay, other: tot - qual,
    qualShare: tot ? qual / tot : null };
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
  console.log(`hurt-return lines: ${S.hurtLineCount} retroCases(trips)=${S.retroCases} sourceSplit(trips)=${JSON.stringify(S.sourceSplit)} finalScanReturns(trips)=${S.finalScanReturns} returnedUnknown(trips)=${S.returnedUnknown}`);
  console.log(`coverage: hurtReturnLines=${S.hurtLineCount} vs trip returned-hurt cases=${S.tripRH} (gap=${S.hurtLineCount - S.tripRH})`);
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
console.log('\n== ARMED HURT-RETURN LINES NAMING A WALK-OUT VILLAGER (exclusion check) ==');
{
  const walkNamesBySeed = new Map();
  for (const c of A.walks) {
    if (!walkNamesBySeed.has(c._seed)) walkNamesBySeed.set(c._seed, new Set());
    if (c.name) walkNamesBySeed.get(c._seed).add(c.name);
  }
  let flags = 0;
  for (const t of A.hurtLines) {
    const nm = t.line.match(/🧭\s+(\S+)/);
    if (nm && (walkNamesBySeed.get(t.seed) || new Set()).has(nm[1])) {
      console.log(`FLAG s${t.seed} d${t.day} p${t.part}: ${t.line}`); flags += 1;
    }
  }
  console.log(flags ? `EXCLUSION FLAGS: ${flags}` : 'none — no armed hurt-return line names a walk-out villager');
}
console.log('\n== D1 PER-SEED FLIP DIRECTIONS (armed daysAlive vs baseline) ==');
{
  let out = 0, under = 0, tie = 0;
  for (const seed of [...bBy.keys()].sort((a, b) => a - b)) {
    const b = bBy.get(seed), a = aBy.get(seed);
    if (!a) continue;
    const d = a.daysAlive - b.daysAlive;
    if (d > 0) { out += 1; console.log(`${seed}: armed OUTLIVES by ${d}d (${b.daysAlive} -> ${a.daysAlive})`); }
    else if (d < 0) { under += 1; console.log(`${seed}: armed UNDERLIVES by ${-d}d (${b.daysAlive} -> ${a.daysAlive})`); }
    else { tie += 1; console.log(`${seed}: tie (${b.daysAlive})`); }
  }
  console.log(`flips: outlives=${out} underlives=${under} ties=${tie} (predominantly one-way = underlives >= 2x outlives: ${under >= 2 * out})`);
}
console.log('\n== D2 DEATH DECOMPOSITION ==');
{
  const dB = decompose(bSeeds, false), dA = decompose(aSeeds, true);
  console.log(`BASELINE (hurt-episode villagers): total=${dB.total} qual=${dB.qual} (same-day subset=${dB.qualSameDay}) other=${dB.other} qualShare=${dB.qualShare == null ? 'n/a' : dB.qualShare.toFixed(3)}`);
  console.log(`ARMED (returned-hurt villagers): total=${dA.total} qual=${dA.qual} (same-day subset=${dA.qualSameDay}) other=${dA.other} qualShare=${dA.qualShare == null ? 'n/a' : dA.qualShare.toFixed(3)}`);
  console.log(`returned-villager death excess (armed qual - baseline qual): ${dA.qual - dB.qual}`);
}
