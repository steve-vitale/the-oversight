// spawncensus-analyze-20261110.js — per-kind spawn census analyzer
// (arm sim-spawncensus-a, coverage program Tier 1 #5). Pure function over
// per-seed JSONs written by scripts/encounterprod-driver-20261105.js with
// the encounterprod instrument; no game reads, no re-scoring, no RNG.
//
// For every kind in src/data/monsters.json, per seed and aggregated:
//   spawns (spawnWorldMonster calls), casts (castMonster selections),
//   faced (startCombat/fieldFight rows naming the kind), kills
//   (waveKillLog rows, split by wave — W5 kills are NEVER folded into W4).
// Every roster kind gets a row (count possibly 0) or an explicit
// poolNote explaining why 0 is expected (campaignOnly / titan-omen).
// Wild-pool note: castMonster excludes titan ids and monsterWavePool is
// titan-filtered (titans.js wrap), so herald/nielsen/finale never enter
// the wild pool; campaignOnly kinds (finale_crew, finale_opening,
// network_tower, network_limb, network_heart) arrive only via campaign
// marches. Those paths still call spawnWorldMonster, so the instrument
// would record them if they fired — a 0 there is a real 0, not a blind spot.
// Arena/contest spawns are OUT of scope for this census (contest
// placement does not go through spawnWorldMonster); the census is wild
// spawns + casts + fights + kills.
//
// Usage:
//   node scripts/spawncensus-analyze-20261110.js <per-seed-dir> [run-filter] [--md <file>]
//   Prints a JSON summary to stdout. --md also writes the census table.
//   The module exports analyzeDir/analyzeSeed/loadRoster for tests.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');

function loadRoster() {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(raw) ? raw : (raw.monsters || []);
  let titans = {};
  try {
    const t = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'titans.json'), 'utf8'));
    Object.keys(t || {}).forEach(function (k) {
      if (k.charAt(0) === '_') return;
      titans[k] = true;
      if (t[k] && t[k].monster) titans[t[k].monster] = true;
    });
  } catch (e) { /* titans.json unreadable: titan notes degrade to null */ }
  return list.filter(function (m) { return m && m.id; }).map(function (m) {
    let note = 'wild';
    if (m.campaignOnly) note = 'campaignOnly';
    else if (titans[m.id]) note = 'titan-omen';
    return { id: m.id, wave: (m.wave | 0) || 1, campaignOnly: !!m.campaignOnly, titan: !!titans[m.id], poolNote: note };
  }).sort(function (a, b) { return (a.wave - b.wave) || (a.id < b.id ? -1 : 1); });
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

function analyzeSeed(row, roster) {
  const byId = {};
  roster.forEach(function (r) {
    byId[r.id] = { id: r.id, wave: r.wave, poolNote: r.poolNote, spawns: 0, spawnSources: {}, veteranSpawns: 0, firstSpawnDay: null, casts: 0, faced: 0, firstFacedDay: null, kills: 0, killsByWave: {}, firstKillDay: null };
  });
  function ensure(id, wave) {
    if (!id) return null;
    if (!byId[id]) byId[id] = { id: id, wave: (wave | 0) || null, poolNote: 'UNKNOWN-ID', spawns: 0, spawnSources: {}, veteranSpawns: 0, firstSpawnDay: null, casts: 0, faced: 0, firstFacedDay: null, kills: 0, killsByWave: {}, firstKillDay: null };
    return byId[id];
  }
  (row.spawns || []).forEach(function (s) {
    const c = ensure(s.id, s.wave); if (!c) return;
    c.spawns++;
    c.spawnSources[s.source || 'other'] = (c.spawnSources[s.source || 'other'] || 0) + 1;
    if (s.veteran) c.veteranSpawns++;
    if (c.firstSpawnDay == null || (s.day | 0) < c.firstSpawnDay) c.firstSpawnDay = (s.day | 0);
  });
  (row.casts || []).forEach(function (c2) {
    const c = ensure(c2.id, c2.wave); if (!c) return;
    c.casts++;
  });
  let unattributedFights = 0;
  (row.fights || []).forEach(function (f) {
    if (!f.mid) { unattributedFights++; return; }
    const c = ensure(f.mid, f.wave); if (!c) return;
    c.faced++;
    if (c.firstFacedDay == null || (f.day | 0) < c.firstFacedDay) c.firstFacedDay = (f.day | 0);
  });
  (row.waveKillLog || []).forEach(function (e) {
    const c = ensure(e.mid, e.w); if (!c) return;
    c.kills++;
    const w = (e.w | 0) || 0;
    c.killsByWave[w] = (c.killsByWave[w] || 0) + 1;
    if (c.firstKillDay == null || (e.d | 0) < c.firstKillDay) c.firstKillDay = (e.d | 0);
  });
  const spawnWaveTotals = {};
  (row.spawns || []).forEach(function (s) { const w = (s.wave | 0) || 0; spawnWaveTotals[w] = (spawnWaveTotals[w] || 0) + 1; });
  const killWaveTotals = {};
  (row.waveKillLog || []).forEach(function (e) { const w = (e.w | 0) || 0; killWaveTotals[w] = (killWaveTotals[w] || 0) + 1; });
  return {
    seed: row.seed, days: row.days, endReason: row.endReason, won: !!row.won,
    unlockedWave: row.unlockedWave, maxWave: row.maxWave, scaleRank: row.scaleRank,
    standing: row.standing, instrumentErrors: (row.instrumentErrors || []).length,
    errorList: (row.instrumentErrors || []).slice(),
    spawnsTotal: (row.spawns || []).length, castsTotal: (row.casts || []).length,
    fightsTotal: (row.fights || []).length, unattributedFights: unattributedFights,
    killsTotal: (row.waveKillLog || []).length,
    spawnWaveTotals: spawnWaveTotals, killWaveTotals: killWaveTotals,
    kinds: byId,
  };
}

function analyzeDir(dir, runFilter) {
  const roster = loadRoster();
  const files = fs.readdirSync(dir).filter(function (f) {
    return f.endsWith('.json') && (!runFilter || f.indexOf(runFilter) >= 0);
  }).sort();
  const seeds = files.map(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return analyzeSeed(row, roster);
  });
  // Aggregate across seeds.
  const agg = {};
  roster.forEach(function (r) {
    agg[r.id] = { id: r.id, wave: r.wave, poolNote: r.poolNote, spawns: 0, seedsSpawned: 0, casts: 0, seedsCast: 0, faced: 0, seedsFaced: 0, kills: 0, killsByWave: {}, seedsKilled: 0, firstSpawnDay: null, firstFacedDay: null, firstKillDay: null };
  });
  seeds.forEach(function (s) {
    Object.keys(s.kinds).forEach(function (id) {
      const k = s.kinds[id];
      if (!agg[id]) agg[id] = { id: id, wave: k.wave, poolNote: 'UNKNOWN-ID', spawns: 0, seedsSpawned: 0, casts: 0, seedsCast: 0, faced: 0, seedsFaced: 0, kills: 0, killsByWave: {}, seedsKilled: 0, firstSpawnDay: null, firstFacedDay: null, firstKillDay: null };
      const a = agg[id];
      a.spawns += k.spawns; if (k.spawns > 0) a.seedsSpawned++;
      a.casts += k.casts; if (k.casts > 0) a.seedsCast++;
      a.faced += k.faced; if (k.faced > 0) a.seedsFaced++;
      a.kills += k.kills; if (k.kills > 0) a.seedsKilled++;
      Object.keys(k.killsByWave).forEach(function (w) { a.killsByWave[w] = (a.killsByWave[w] || 0) + k.killsByWave[w]; });
      if (k.firstSpawnDay != null && (a.firstSpawnDay == null || k.firstSpawnDay < a.firstSpawnDay)) a.firstSpawnDay = k.firstSpawnDay;
      if (k.firstFacedDay != null && (a.firstFacedDay == null || k.firstFacedDay < a.firstFacedDay)) a.firstFacedDay = k.firstFacedDay;
      if (k.firstKillDay != null && (a.firstKillDay == null || k.firstKillDay < a.firstKillDay)) a.firstKillDay = k.firstKillDay;
    });
  });
  const rows = roster.map(function (r) { return agg[r.id]; });
  // Any UNKNOWN-ID rows (kinds seen in sims but not in the roster file).
  const unknown = Object.keys(agg).filter(function (id) { return agg[id].poolNote === 'UNKNOWN-ID'; }).map(function (id) { return agg[id]; });
  const totalErrors = seeds.reduce(function (n, s) { return n + s.instrumentErrors; }, 0);
  const spawnWaveTotals = {};
  seeds.forEach(function (s) { Object.keys(s.spawnWaveTotals).forEach(function (w) { spawnWaveTotals[w] = (spawnWaveTotals[w] || 0) + s.spawnWaveTotals[w]; }); });
  const killWaveTotals = {};
  seeds.forEach(function (s) { Object.keys(s.killWaveTotals).forEach(function (w) { killWaveTotals[w] = (killWaveTotals[w] || 0) + s.killWaveTotals[w]; }); });
  return {
    dir: dir, runFilter: runFilter || null, rosterSize: roster.length,
    rosterByWave: [1, 2, 3, 4, 5, 6].map(function (w) { return { wave: w, kinds: roster.filter(function (r) { return r.wave === w; }).length }; }),
    seeds: seeds.length, seedList: seeds.map(function (s) { return s.seed; }),
    medianDays: medianOf(seeds.map(function (s) { return s.days; })),
    won: seeds.filter(function (s) { return s.won; }).length,
    totalInstrumentErrors: totalErrors,
    spawnsTotal: seeds.reduce(function (n, s) { return n + s.spawnsTotal; }, 0),
    castsTotal: seeds.reduce(function (n, s) { return n + s.castsTotal; }, 0),
    fightsTotal: seeds.reduce(function (n, s) { return n + s.fightsTotal; }, 0),
    unattributedFights: seeds.reduce(function (n, s) { return n + s.unattributedFights; }, 0),
    killsTotal: seeds.reduce(function (n, s) { return n + s.killsTotal; }, 0),
    spawnWaveTotals: spawnWaveTotals, killWaveTotals: killWaveTotals,
    maxUnlockedWave: seeds.reduce(function (m, s) { return Math.max(m, (s.unlockedWave | 0) || 0); }, 0),
    kindsSpawned: rows.filter(function (r) { return r.spawns > 0; }).length,
    kindsFaced: rows.filter(function (r) { return r.faced > 0; }).length,
    kindsKilled: rows.filter(function (r) { return r.kills > 0; }).length,
    kindsNeverSpawned: rows.filter(function (r) { return r.spawns === 0; }).map(function (r) { return r.id; }),
    kindsNeverFaced: rows.filter(function (r) { return r.faced === 0; }).map(function (r) { return r.id; }),
    kindsNeverKilled: rows.filter(function (r) { return r.kills === 0; }).map(function (r) { return r.id; }),
    unknownIds: unknown,
    perSeed: seeds,
    census: rows,
  };
}

function mdTable(summary) {
  const lines = [];
  lines.push('| wave | kind | pool | spawns (seeds) | casts | faced (seeds) | kills (seeds) | kills by wave | first spawn |');
  lines.push('|---:|---|---|---:|---:|---:|---:|---|---|---:|');
  summary.census.forEach(function (r) {
    const kbw = Object.keys(r.killsByWave).sort().map(function (w) { return 'w' + w + ':' + r.killsByWave[w]; }).join(' ') || '—';
    lines.push('| ' + r.wave + ' | ' + r.id + ' | ' + r.poolNote + ' | ' + r.spawns + ' (' + r.seedsSpawned + ') | ' + r.casts + ' | ' + r.faced + ' (' + r.seedsFaced + ') | ' + r.kills + ' (' + r.seedsKilled + ') | ' + kbw + ' | ' + (r.firstSpawnDay == null ? '—' : 'd' + r.firstSpawnDay) + ' |');
  });
  return lines.join('\n');
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('USAGE: node scripts/spawncensus-analyze-20261110.js <per-seed-dir> [run-filter] [--md <file>]'); process.exit(2); }
  const args = process.argv.slice(3);
  const runFilter = (args[0] && args[0].indexOf('--') !== 0) ? args[0] : null;
  const mdIdx = args.indexOf('--md');
  const summary = analyzeDir(dir, runFilter);
  if (mdIdx >= 0 && args[mdIdx + 1]) fs.writeFileSync(args[mdIdx + 1], mdTable(summary) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

module.exports = { loadRoster: loadRoster, analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, mdTable: mdTable, medianOf: medianOf };
