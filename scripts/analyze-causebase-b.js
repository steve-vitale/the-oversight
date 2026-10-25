#!/usr/bin/env node
// analyze-causebase-b.js — pooled kind-filtered villager death-cause baseline.
//
// Reads per-seed sim corpora and emits the villager death-cause table that
// future arms use as their "new death mode" guardrail baseline.
//
// Population rule (binding, from sim-deathcensus-a's correction):
//   villager death = row with kind in {villager, person} AND scholar flag false.
//   kind 'monster'/'animal' rows are excluded (monster kills the village
//   should be proud of, not village blood). Scholar rows (isPlayer/player
//   true) are excluded (successions, not villager deaths). FALLEN counts
//   are never used: most death paths leave no fallen entry.
//
// Input formats (both accepted, per file):
//   - sweep format:   { seed, deathRows: [{ kind, isPlayer, cause, ... }] }
//   - census format:  { seed, deathcensus: { deaths: [{ kind, player, cause }] } }
// A file with a `seed` field but no per-death rows FAILS loudly (a per-seed
// file must carry its deaths). A file with neither seed nor rows is a
// summary file: it is listed in `skipped` (never silently dropped).
// Any unparseable file, any row missing kind / scholar flag / cause, and
// any duplicate seed within one corpus dir FAIL loudly (exit 2).
//
// Cause labels are reported RAW, exactly as recorded. No normalization:
// the known duplicate pair ('villager:combat' vs 'villager:villager combat')
// lives only in the sweep's aggregated killer:cause `deaths` dict, never in
// per-death rows, and monster-name causes ('choir toad', ...) are kept
// distinct from generic 'monster' (collapsing them would need a roster
// the corpora do not carry, and would hide which monster killed).
//
// Usage:
//   Pool mode:    node scripts/analyze-causebase-b.js <dir...> [--out <file>]
//   Compare mode: node scripts/analyze-causebase-b.js --baseline <json> [--new-threshold N] <dir...>
//     Compare emits, for the arm corpora, every label absent from the
//     baseline (flagged when count >= N) plus share comparison for labels
//     present in the baseline. Output JSON goes to stdout unless --out given.
//     Exit code is 0 in both modes (flags are data, not failures); only
//     malformed input exits non-zero.
'use strict';
const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error('analyze-causebase-b: FATAL: ' + msg);
  process.exit(2);
}

function sortLabels(counts) {
  return Object.keys(counts).sort((a, b) => {
    const d = counts[b] - counts[a];
    if (d !== 0) return d;
    return a < b ? -1 : (a > b ? 1 : 0);
  });
}

function analyzeDir(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    fail('corpus dir not found or not a directory: ' + dir);
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) fail('corpus dir has no .json files: ' + dir);
  const per = {
    dir,
    filesIngested: [],
    filesSkipped: [],
    seeds: [],
    rowsTotal: 0,
    excludedByKind: 0,
    excludedScholar: 0,
    villagerDeaths: 0,
    causes: {},
  };
  const seenSeeds = new Set();
  for (const file of files) {
    const full = path.join(dir, file);
    let j;
    try {
      j = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      fail('unparseable JSON in ' + full + ': ' + e.message);
    }
    let rows = null;
    let format = null;
    if (Array.isArray(j.deathRows)) { rows = j.deathRows; format = 'sweep'; }
    else if (j.deathcensus && Array.isArray(j.deathcensus.deaths)) { rows = j.deathcensus.deaths; format = 'census'; }
    if (rows === null) {
      if (j.seed !== undefined && j.seed !== null) {
        fail('per-seed file without per-death rows: ' + full);
      }
      per.filesSkipped.push({ file, reason: 'no per-death rows (summary file)' });
      continue;
    }
    const seed = j.seed;
    if (seed === undefined || seed === null) {
      fail('per-seed file without a seed field: ' + full);
    }
    if (seenSeeds.has(String(seed))) {
      fail('duplicate seed ' + seed + ' within corpus dir ' + dir + ' (file ' + file + ')');
    }
    seenSeeds.add(String(seed));
    per.filesIngested.push(file);
    per.seeds.push(seed);
    rows.forEach((r, i) => {
      if (!r || typeof r !== 'object') fail('non-object death row ' + i + ' in ' + full);
      if (typeof r.kind !== 'string' || r.kind === '') {
        fail('death row ' + i + ' missing kind in ' + full);
      }
      const scholar = (format === 'sweep') ? r.isPlayer : r.player;
      if (typeof scholar !== 'boolean') {
        fail('death row ' + i + ' missing scholar flag (' +
          (format === 'sweep' ? 'isPlayer' : 'player') + ') in ' + full);
      }
      if (typeof r.cause !== 'string' || r.cause === '') {
        fail('death row ' + i + ' missing cause in ' + full);
      }
      per.rowsTotal += 1;
      if (r.kind !== 'villager' && r.kind !== 'person') {
        per.excludedByKind += 1;
        return;
      }
      if (scholar) {
        per.excludedScholar += 1;
        return;
      }
      per.villagerDeaths += 1;
      per.causes[r.cause] = (per.causes[r.cause] || 0) + 1;
    });
  }
  per.seeds.sort((a, b) => a - b);
  return per;
}

function main() {
  const argv = process.argv.slice(2);
  let baselinePath = null;
  let outPath = null;
  let newThreshold = 3;
  const dirs = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--baseline') baselinePath = argv[++i];
    else if (argv[i] === '--out') outPath = argv[++i];
    else if (argv[i] === '--new-threshold') newThreshold = parseInt(argv[++i], 10);
    else if (argv[i].startsWith('--')) fail('unknown flag: ' + argv[i]);
    else dirs.push(argv[i]);
  }
  if (dirs.length === 0) {
    console.error('usage: analyze-causebase-b.js [--baseline <json>] [--new-threshold N] [--out <file>] <corpusDir...>');
    process.exit(2);
  }
  if (baselinePath && isNaN(newThreshold)) fail('--new-threshold must be an integer');
  const corpora = dirs.map(analyzeDir);

  // Cross-corpus seed overlap (reported, not fatal: different arms on one
  // seed are legitimate distinct runs, but a pooled baseline must disclose it).
  const seedOwners = {};
  for (const c of corpora) {
    for (const s of c.seeds) {
      (seedOwners[String(s)] = seedOwners[String(s)] || []).push(c.dir);
    }
  }
  const seedOverlap = Object.keys(seedOwners)
    .filter(s => seedOwners[s].length > 1)
    .sort((a, b) => a - b)
    .map(s => ({ seed: Number(s), dirs: seedOwners[s] }));

  const pooled = {};
  let rowsTotal = 0, excludedByKind = 0, excludedScholar = 0, villagerDeaths = 0;
  for (const c of corpora) {
    rowsTotal += c.rowsTotal;
    excludedByKind += c.excludedByKind;
    excludedScholar += c.excludedScholar;
    villagerDeaths += c.villagerDeaths;
    for (const [label, n] of Object.entries(c.causes)) {
      pooled[label] = (pooled[label] || 0) + n;
    }
  }

  const perCorpus = corpora.map(c => ({
    dir: c.dir,
    filesIngested: c.filesIngested,
    filesSkipped: c.filesSkipped,
    seeds: c.seeds,
    rowsTotal: c.rowsTotal,
    excludedByKind: c.excludedByKind,
    excludedScholar: c.excludedScholar,
    villagerDeaths: c.villagerDeaths,
    causes: c.causes,
  }));

  let out;
  if (baselinePath) {
    let baseline;
    try {
      baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    } catch (e) {
      fail('cannot read baseline JSON ' + baselinePath + ': ' + e.message);
    }
    const baseCauses = baseline.pooledCauses || baseline.causes || {};
    const baseTotal = baseline.villagerDeaths || 0;
    const newLabels = [];
    const present = [];
    for (const label of sortLabels(pooled)) {
      const n = pooled[label];
      const share = villagerDeaths ? n / villagerDeaths : 0;
      if (!Object.prototype.hasOwnProperty.call(baseCauses, label)) {
        newLabels.push({ label, count: n, share, flagged: n >= newThreshold });
      } else {
        const baseShare = baseTotal ? baseCauses[label] / baseTotal : 0;
        present.push({
          label, count: n, share, baselineCount: baseCauses[label],
          baselineShare: baseShare,
          shareRatio: baseShare ? share / baseShare : null,
          shareShiftFlagged: n >= 3 && baseShare > 0 && share >= 2 * baseShare,
        });
      }
    }
    out = {
      mode: 'compare',
      baseline: baselinePath,
      newThreshold,
      corpora: perCorpus,
      seedOverlap,
      rowsTotal, excludedByKind, excludedScholar, villagerDeaths,
      pooledCauses: pooled,
      newLabels,
      presentLabels: present,
    };
  } else {
    const table = sortLabels(pooled).map(label => ({
      label,
      count: pooled[label],
      share: villagerDeaths ? pooled[label] / villagerDeaths : 0,
    }));
    out = {
      mode: 'pool',
      generatedBy: 'scripts/analyze-causebase-b.js',
      population: 'kind in {villager, person} AND scholar flag false; labels raw, unnormalized',
      corpora: perCorpus,
      seedOverlap,
      rowsTotal, excludedByKind, excludedScholar, villagerDeaths,
      pooledCauses: pooled,
      pooledTable: table,
    };
  }
  const text = JSON.stringify(out, null, 2) + '\n';
  if (outPath) fs.writeFileSync(outPath, text);
  else process.stdout.write(text);
}

main();
