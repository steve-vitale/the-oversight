// telemetry-check.js — auto-fire on large telemetry deviations (Steve 2026-10-13).
//
// The deepening r9 run showed wave-3 fights drop 6 -> 0 with nobody noticing
// until a human read the chat summary. This script diffs a run's aggregate
// metrics against a baseline and prints LOUD lines for large deviations.
//
// Usage:
//   node scripts/telemetry-check.js --baseline base.json \
//        --current 'evidence/2026-10-13/journey-deepening-r9-*.json' \
//        --metrics w3fights,fightsByWave.3,engaged.w3
//   --current also accepts a single JSON file (treated as one run) or a
//   flat aggregate JSON (used directly, no glob).
//   --update-baseline out.json  writes the current aggregates as the new baseline.
//   --allow-recorder-corpus  permits a recorder-corpus --current (see below).
//   --sweep-rows (sim-teleingest-a, 2026-10-28): schema-aligned ingest for
//   per-seed sweep-row corpora. Only files whose JSON is an object with a
//   finite numeric `seed` property count as seed rows; corpus summary /
//   analysis files (which carry a `seeds` array, no scalar `seed`) are
//   skipped and reported, so n is seeds, not files. Bare wall metrics are
//   aliased to row fields (national -> nationalEver, wins -> won; table
//   and entered are already row fields). Without this flag, behavior is
//   exactly the old behavior: every glob-matched file counts, bare names
//   are read literally. In --sweep-rows mode the recorder-corpus guard
//   below runs on the filtered seed rows (tbovertime rows carry numeric
//   seed and no anchorCommit, so the guard cannot refuse them).
//
// Glob quirk: --current supports a single * in the BASENAME only
// (path.dirname + basename * -> .*). No **, no * in directory parts.
//
// Recorder-corpus exclusion rule (measurement audit 2026-10-25): sweep
// recorder corpora (flat per-seed rows stamped with top-level anchorCommit,
// e.g. rotdecide2/haulcount/tableseat outputs) are NEVER compared against
// run baselines here. Their per-file boolean sums scale with corpus size,
// so a cross-size or cross-regime compare prints false LOUD lines (the
// known 1937Z class: national 12 -> 44 across 80 files vs a 16-file
// winseat baseline). Recorder corpora are compared with sweep-compare
// tables, not with this tool. When every --current file carries
// anchorCommit, this tool REFUSES (exit 2, not a LOUD line) unless
// --allow-recorder-corpus or --update-baseline is given. Death-list
// corpora (policy/side/substrate per-seed files, e.g. deathrow) are also
// excluded by this rule; they are compared with pooled-list analysis.
// Baselines written by --update-baseline keep the previous baseline's
// underscore-prefixed metadata blocks (e.g. _regime): rolling a baseline
// forward no longer silently drops its regime label. Re-label only when
// the regime itself changes.
//
// Metric paths: dot-separated into the JSON. Arrays count as their length.
// Missing paths count as 0.
//
// Deviation rules (tuned for small-n sim runs, not analytics-grade stats):
//   - baseline >= 3  and current == 0        -> LOUD (disappearance)
//   - baseline == 0  and current >= 3        -> LOUD (new appearance)
//   - baseline >= 5  and |rel change| >= 0.6 -> LOUD (large swing)
// Otherwise quiet. Exit 1 when any LOUD line fired, 0 when quiet,
// 2 on usage errors and recorder-corpus refusals.
'use strict';
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('usage: node scripts/telemetry-check.js --baseline B.json --current GLOB_OR_JSON --metrics a.b,c [--update-baseline OUT.json] [--sweep-rows]');
  console.error('  --sweep-rows: per-seed sweep-row ingest — count only files with a numeric `seed` field; alias national->nationalEver, wins->won');
  process.exit(2);
}

function parseArgs(argv) {
  const a = { sweepRows: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--baseline') a.baseline = argv[++i];
    else if (k === '--current') a.current = argv[++i];
    else if (k === '--metrics') a.metrics = argv[++i];
    else if (k === '--update-baseline') a.updateBaseline = argv[++i];
    else if (k === '--allow-recorder-corpus') a.allowRecorderCorpus = true;
    else if (k === '--sweep-rows') a.sweepRows = true;
    else usage();
  }
  if (!a.baseline || !a.current || !a.metrics) usage();
  return a;
}

// Sweep-row wall aliases (sim-teleingest-a). Bare coordinator names map to
// the fields sweep rows actually carry; a row that lacks the alias target
// falls back to the literal requested name (old-schema rows keep working).
const SWEEP_ALIASES = {
  national: 'nationalEver',
  wins: 'won',
};
const WALL_FIELDS = ['nationalEver', 'nationalFinal', 'table', 'entered', 'won'];
const WALL_REQUESTS = new Set(['national', 'nationalEver', 'nationalFinal', 'table', 'entered', 'wins', 'won']);

function isSeedRow(obj) {
  return obj != null && typeof obj === 'object' && !Array.isArray(obj)
    && typeof obj.seed === 'number' && Number.isFinite(obj.seed);
}

function sweepValue(obj, dot) {
  const target = SWEEP_ALIASES[dot];
  if (target && Object.prototype.hasOwnProperty.call(obj, target)) return metricValue(obj, target);
  return metricValue(obj, dot);
}

function getPath(obj, dot) {
  if (obj == null) return undefined;
  // Baselines are written by --update-baseline as flat dotted keys
  // ({"qa.askedTotal": 784}); the literal key wins so a baseline
  // round-trips. Otherwise fall through to nested-path lookup.
  if (Object.prototype.hasOwnProperty.call(obj, dot)) return obj[dot];
  let cur = obj;
  for (const part of dot.split('.')) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function metricValue(obj, dot) {
  const v = getPath(obj, dot);
  if (v == null) return 0;
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0; // #267: per-seed booleans (e.g. "national": true) count, not vanish
  if (typeof v === 'object') {
    // sum numeric leaves (e.g. fightsByWave.3 handled by exact path; this is a fallback)
    return Object.values(v).reduce((t, x) => t + (typeof x === 'number' ? x : 0), 0);
  }
  return 0;
}

function expandGlob(pattern) {
  // minimal glob: supports a single * in the basename
  if (!pattern.includes('*')) return [pattern];
  const dir = path.dirname(pattern);
  const base = path.basename(pattern).replace(/\*/g, '.*');
  const re = new RegExp('^' + base + '$');
  return fs.readdirSync(dir).filter(f => re.test(f)).map(f => path.join(dir, f)).sort();
}

function main() {
  const args = parseArgs(process.argv);
  const baseline = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
  const metrics = args.metrics.split(',').map(s => s.trim()).filter(Boolean);
  const files = expandGlob(args.current);
  if (!files.length) {
    console.log('LOUD: telemetry-check found no files for --current pattern: ' + args.current);
    process.exit(1);
  }
  // Parse every matched file first (a malformed file is still a loud failure,
  // in either mode), then filter to seed rows only in --sweep-rows mode.
  const objs = [];
  for (const f of files) {
    let obj;
    try { obj = JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { console.log('LOUD: telemetry-check could not parse ' + f + ': ' + e.message); process.exit(1); }
    objs.push(obj);
  }
  let rows = objs;
  let skipped = 0;
  if (args.sweepRows) {
    rows = objs.filter(isSeedRow);
    skipped = objs.length - rows.length;
    if (!rows.length) {
      console.log('LOUD: telemetry-check --sweep-rows found no seed rows for --current pattern: ' + args.current);
      process.exit(1);
    }
    const distinct = new Set(rows.map(r => r.seed)).size;
    if (distinct !== rows.length) {
      console.log(`telemetry-check: warning: ${rows.length} seed rows but only ${distinct} distinct seed values`);
    }
  }
  // Recorder-corpus guard (see header): every compared row stamped with
  // top-level anchorCommit is a sweep recorder row, not a run. Refuse the
  // compare rather than print false LOUD lines; --allow-recorder-corpus
  // (same-shape recorder-vs-recorder compares) or --update-baseline
  // (reseeding a baseline) bypasses the refusal. In --sweep-rows mode the
  // guard runs on the filtered seed rows.
  if (!args.updateBaseline && !args.allowRecorderCorpus && rows.length > 0
      && rows.every(o => o != null && typeof o === 'object'
        && Object.prototype.hasOwnProperty.call(o, 'anchorCommit'))) {
    console.log('telemetry-check: refusing recorder-corpus input: all ' + rows.length
      + ' --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs.'
      + ' Recorder corpora are compared with sweep-compare tables, never against a run baseline here.'
      + ' Pass --allow-recorder-corpus for a same-shape recorder-vs-recorder compare,'
      + ' or --update-baseline to reseed a baseline from these files.');
    process.exit(2);
  }
  const nLabel = args.sweepRows ? `${rows.length} seed rows` : `${files.length} files`;
  const agg = {};
  for (const m of metrics) agg[m] = 0;
  for (const obj of rows) {
    for (const m of metrics) agg[m] += args.sweepRows ? sweepValue(obj, m) : metricValue(obj, m);
  }
  if (args.updateBaseline) {
    // Preserve the previous baseline's underscore-prefixed metadata blocks
    // (e.g. _regime): rolling forward must not silently drop the regime label.
    const meta = {};
    for (const [k, v] of Object.entries(baseline)) if (k.startsWith('_')) meta[k] = v;
    fs.writeFileSync(args.updateBaseline, JSON.stringify({ ...meta, ...agg }, null, 2) + '\n');
  }
  // Wall line (sweep-rows only): the full wall picture from the same rows,
  // so a coordinator run reproduces the worker wall numbers in one place.
  if (args.sweepRows && metrics.some(m => WALL_REQUESTS.has(m))) {
    const parts = [];
    for (const w of WALL_FIELDS) {
      if (rows.some(r => Object.prototype.hasOwnProperty.call(r, w))) {
        const sum = rows.reduce((t, r) => t + metricValue(r, w), 0);
        parts.push(`${w}=${sum}/${rows.length}`);
      }
    }
    if (parts.length) console.log(`wall: ${parts.join(' ')} (${rows.length} seeds, ${skipped} non-row files skipped)`);
  }
  const loud = [];
  for (const m of metrics) {
    const b = baseline[m] == null ? 0 : baseline[m];
    const c = agg[m];
    if (b >= 3 && c === 0) {
      loud.push(`LOUD: ${m} disappeared: baseline ${b} -> current ${c} (n=${nLabel})`);
    } else if (b === 0 && c >= 3) {
      loud.push(`LOUD: ${m} newly appeared: baseline ${b} -> current ${c} (n=${nLabel})`);
    } else if (b >= 5 && Math.abs(c - b) / b >= 0.6) {
      const pct = Math.round(((c - b) / b) * 100);
      loud.push(`LOUD: ${m} swung ${pct}%: baseline ${b} -> current ${c} (n=${nLabel})`);
    }
  }
  for (const l of loud) console.log(l);
  if (!loud.length) {
    if (args.sweepRows) console.log(`telemetry-check: quiet (${rows.length} seed rows, ${skipped} non-row files skipped, ${metrics.length} metrics, no large deviations)`);
    else console.log(`telemetry-check: quiet (${files.length} files, ${metrics.length} metrics, no large deviations)`);
  }
  process.exit(loud.length ? 1 : 0);
}

main();
