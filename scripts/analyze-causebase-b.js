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
// Scope metadata + substrate guard (sim-causemeta-b, C6 fix 2026-10-25):
//   Pool mode EMITS a machine-readable `scope` object in its output:
//   policy, horizon, flags, kind-filter definition, corpus seed bands,
//   and headline counts — derived from the corpora themselves (policy /
//   flags from per-seed files, horizon days from sweep summary meta.days;
//   a conflict on any derived field across pooled corpora FAILS loudly,
//   exit 2). The horizon mode label ('death-aware') is documented
//   sweep-driver semantics per sim-causebase-b.md, not a corpus field;
//   it is 'death-aware' only for corpora carrying summary meta.days,
//   else null. A field absent from every corpus file is null, never
//   invented.
//   Compare mode ENFORCES scope: it derives the arm's substrate the same
//   way and compares it against baseline.scope. A differing declared
//   substrate (policy, any flag, horizon days) REFUSES with exit 2 and a
//   SCOPE-MISMATCH message naming both scopes — compare must never exit
//   0 silently on a different substrate (the exact C6 failure). An arm
//   field undeclared in the corpus files yields a loud SCOPE-PARTIAL
//   stderr warning and proceeds (unknown is not a mismatch). A baseline
//   with no scope yields a loud SCOPE-WARNING and proceeds, so legacy
//   baselines keep working but never silently again. Flags (new-label /
//   share-shift) remain data, not failures; only malformed input, a
//   substrate conflict, or a scope mismatch exits non-zero.
//
// Usage:
//   Pool mode:    node scripts/analyze-causebase-b.js <dir...> [--out <file>]
//   Compare mode: node scripts/analyze-causebase-b.js --baseline <json> [--new-threshold N] <dir...>
//     Compare emits, for the arm corpora, every label absent from the
//     baseline (flagged when count >= N) plus share comparison for labels
//     present in the baseline, plus a `scopeCheck` object. Output JSON
//     goes to stdout unless --out given. Exit code is 0 in both modes
//     (flags are data, not failures); only malformed input, a substrate
//     conflict, or a scope mismatch exits non-zero.
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

// Normalize a flag value: sweep summary meta.env carries flags as strings
// ("1"); per-seed files carry numbers (1). Both mean the same flag value.
function normFlag(v) {
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return v;
}

function uniqVals(arr) {
  const out = [];
  for (const v of arr) if (!out.includes(v)) out.push(v);
  return out;
}

// Derive one substrate from a set of analyzed corpora. A field is the
// single distinct observed value, or null when no corpus file declares it.
// conflicts lists every field with >1 distinct observed value (mixed
// substrate — the caller refuses rather than pooling it silently).
function deriveSubstrate(corpora) {
  const seen = { policies: [], plentydepri: [], depositgate: [], days: [] };
  for (const c of corpora) {
    const s = c.substrate || {};
    for (const k of Object.keys(seen)) {
      for (const v of (s[k] || [])) if (!seen[k].includes(v)) seen[k].push(v);
    }
  }
  const conflicts = [];
  const pick = (k) => {
    if (seen[k].length > 1) conflicts.push({ field: k, values: seen[k].slice() });
    return seen[k].length === 1 ? seen[k][0] : null;
  };
  return {
    policy: pick('policies'),
    plentydepri: pick('plentydepri'),
    depositgate: pick('depositgate'),
    days: pick('days'),
    conflicts,
  };
}

// Build the machine-readable scope object for pool-mode output. Everything
// except the horizon-mode label is derived from the corpora (see header).
function buildScope(corpora, derived, totals) {
  return {
    scopeVersion: 1,
    policy: derived.policy,
    horizon: { days: derived.days, mode: derived.days !== null ? 'death-aware' : null },
    flags: { PLENTYDEPRI: derived.plentydepri, DEPOSITGATE: derived.depositgate },
    kindFilter: {
      kinds: ['villager', 'person'],
      scholarExcluded: true,
      scholarFlagFields: { sweep: 'isPlayer', census: 'player' },
      description: 'kind in {villager, person} AND scholar flag false',
    },
    labels: { form: 'raw, unnormalized', truncationChars: 32 },
    corpora: corpora.map(c => ({
      dir: c.dir,
      seedFirst: c.seeds.length ? c.seeds[0] : null,
      seedLast: c.seeds.length ? c.seeds[c.seeds.length - 1] : null,
      seedCount: c.seeds.length,
      filesIngested: c.filesIngested.length,
    })),
    counts: {
      rowsTotal: totals.rowsTotal,
      excludedByKind: totals.excludedByKind,
      excludedScholar: totals.excludedScholar,
      villagerDeaths: totals.villagerDeaths,
      labelCount: Object.keys(totals.pooled).length,
    },
    derivation: {
      policy: 'uniform per-seed corpus policy field (a conflict fails loudly)',
      flags: 'uniform per-seed corpus plentydepri/depositgate fields (a conflict fails loudly)',
      horizonDays: 'uniform sweep summary meta.days (a conflict fails loudly; null when no summary meta present)',
      horizonMode: 'documented sweep-driver semantics per sim-causebase-b.md pre-registration (150d death-aware); mode is not a corpus field',
      corpora: 'per-corpus seed bands from ingested per-seed files; full seed lists in top-level corpora[].seeds',
    },
  };
}

function fmtScopeVal(v) {
  return (v === null || v === undefined) ? 'undeclared' : JSON.stringify(v);
}

// Compare-mode scope enforcement (see header). Returns the scopeCheck
// object for the output JSON. Mismatch FAILS (exit 2) via fail(); a
// scope-less baseline or an undeclared arm field warns on stderr and
// proceeds — unknown is warned about, never silently passed.
function checkScope(baseline, arm, baselinePath) {
  const scope = baseline.scope;
  const armOut = {
    policy: arm.policy,
    horizonDays: arm.days,
    flags: { PLENTYDEPRI: arm.plentydepri, DEPOSITGATE: arm.depositgate },
  };
  if (!scope || typeof scope !== 'object') {
    console.error('analyze-causebase-b: SCOPE-WARNING: baseline ' + baselinePath +
      ' carries no machine-readable scope metadata; comparability cannot be verified' +
      ' from the artifact — check the baseline\'s evidence prose before citing its flags.');
    return { status: 'unverifiable', baseline: null, arm: armOut, warnings: ['baseline scope absent'] };
  }
  const bPolicy = (scope.policy === undefined ? null : scope.policy);
  const bFlags = scope.flags || {};
  const bFlag = (name) => {
    if (Object.prototype.hasOwnProperty.call(bFlags, name)) return bFlags[name];
    if (Object.prototype.hasOwnProperty.call(bFlags, name.toLowerCase())) return bFlags[name.toLowerCase()];
    return null;
  };
  const bDays = (scope.horizon === undefined || scope.horizon === null) ? null
    : (typeof scope.horizon === 'number' ? scope.horizon : (scope.horizon.days === undefined ? null : scope.horizon.days));
  const bMode = (scope.horizon && typeof scope.horizon === 'object' && scope.horizon.mode) ? scope.horizon.mode : null;
  const baseOut = {
    policy: bPolicy,
    horizonDays: bDays,
    horizonMode: bMode,
    flags: { PLENTYDEPRI: bFlag('PLENTYDEPRI'), DEPOSITGATE: bFlag('DEPOSITGATE') },
  };
  const mismatches = [];
  if (bPolicy !== null && arm.policy !== null && bPolicy !== arm.policy) {
    mismatches.push('policy: baseline ' + JSON.stringify(bPolicy) + ' vs arm ' + JSON.stringify(arm.policy));
  }
  for (const f of ['PLENTYDEPRI', 'DEPOSITGATE']) {
    const bv = bFlag(f);
    const av = (f === 'PLENTYDEPRI') ? arm.plentydepri : arm.depositgate;
    if (bv !== null && av !== null && bv !== av) {
      mismatches.push('flag ' + f + ': baseline ' + bv + ' vs arm ' + av);
    }
  }
  if (bDays !== null && arm.days !== null && bDays !== arm.days) {
    mismatches.push('horizon days: baseline ' + bDays + ' vs arm ' + arm.days);
  }
  if (mismatches.length) {
    fail('SCOPE-MISMATCH: refusing compare — baseline scope (policy ' + fmtScopeVal(bPolicy) +
      ', flags PLENTYDEPRI=' + fmtScopeVal(bFlag('PLENTYDEPRI')) +
      ', DEPOSITGATE=' + fmtScopeVal(bFlag('DEPOSITGATE')) +
      ', horizon ' + fmtScopeVal(bDays) + 'd' + (bMode ? ' ' + bMode : '') +
      ') vs arm substrate (policy ' + fmtScopeVal(arm.policy) +
      ', flags PLENTYDEPRI=' + fmtScopeVal(arm.plentydepri) +
      ', DEPOSITGATE=' + fmtScopeVal(arm.depositgate) +
      ', horizon ' + fmtScopeVal(arm.days) + 'd): differing legs: ' + mismatches.join('; ') +
      '. An arm on a different substrate must not cite this baseline; build its own pooled list (see sim-causebase-audit-b.md).');
  }
  const warnings = [];
  if (bPolicy !== null && arm.policy === null) warnings.push('arm policy undeclared in corpus files; policy comparability unverified');
  if (bFlag('PLENTYDEPRI') !== null && arm.plentydepri === null) warnings.push('arm PLENTYDEPRI undeclared in corpus files; flag comparability unverified');
  if (bFlag('DEPOSITGATE') !== null && arm.depositgate === null) warnings.push('arm DEPOSITGATE undeclared in corpus files; flag comparability unverified');
  if (bDays !== null && arm.days === null) warnings.push('arm horizon days undeclared in corpus files; horizon comparability unverified');
  for (const w of warnings) console.error('analyze-causebase-b: SCOPE-PARTIAL: ' + w);
  return { status: warnings.length ? 'partial' : 'match', baseline: baseOut, arm: armOut, warnings };
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
    // Substrate observations for scope derivation (sim-causemeta-b).
    // Per-seed files declare policy/flags directly; skipped summary files
    // may declare policy/days/env in a `meta` object. Observed values are
    // collected, never asserted: a conflict across files is reported by
    // deriveSubstrate in main(), and absence stays null.
    substrate: { policies: [], plentydepri: [], depositgate: [], days: [] },
  };
  const observe = (kind, v) => {
    if (v === undefined || v === null) return;
    if (!per.substrate[kind].includes(v)) per.substrate[kind].push(v);
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
      if (j.meta && typeof j.meta === 'object') {
        if (typeof j.meta.policy === 'string') observe('policies', j.meta.policy);
        if (typeof j.meta.days === 'number') observe('days', j.meta.days);
        if (j.meta.env && typeof j.meta.env === 'object') {
          observe('plentydepri', normFlag(j.meta.env.PLENTYDEPRI));
          observe('depositgate', normFlag(j.meta.env.DEPOSITGATE));
        }
      }
      continue;
    }
    if (typeof j.policy === 'string') observe('policies', j.policy);
    observe('plentydepri', normFlag(j.plentydepri));
    observe('depositgate', normFlag(j.depositgate));
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

  // Substrate derivation (sim-causemeta-b): a pooled or compared set of
  // corpora must share one substrate. Mixed policy/flags/horizon across
  // the input dirs is a refusal, never a silent mixture.
  const derived = deriveSubstrate(corpora);
  if (derived.conflicts.length) {
    fail('substrate conflict across input corpora: ' + derived.conflicts.map(c =>
      c.field + ' has values ' + c.values.map(v => JSON.stringify(v)).join(', ')).join('; ') +
      ' — refusing to pool or compare mixed-substrate corpora');
  }

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
    // Scope guard (sim-causemeta-b): refuse a different-substrate compare
    // before any flag is computed, so a mismatch can never pass silently.
    const scopeCheck = checkScope(baseline, derived, baselinePath);
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
      scopeCheck,
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
    const scope = buildScope(corpora, derived, {
      rowsTotal, excludedByKind, excludedScholar, villagerDeaths, pooled,
    });
    out = {
      mode: 'pool',
      generatedBy: 'scripts/analyze-causebase-b.js',
      population: 'kind in {villager, person} AND scholar flag false; labels raw, unnormalized',
      scope,
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
