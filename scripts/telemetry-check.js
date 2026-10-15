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
//
// Metric paths: dot-separated into the JSON. Arrays count as their length.
// Missing paths count as 0.
//
// Deviation rules (tuned for small-n sim runs, not analytics-grade stats):
//   - baseline >= 3  and current == 0        -> LOUD (disappearance)
//   - baseline == 0  and current >= 3        -> LOUD (new appearance)
//   - baseline >= 5  and |rel change| >= 0.6 -> LOUD (large swing)
// Otherwise quiet. Exit 1 when any LOUD line fired, 0 when quiet.
'use strict';
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('usage: node scripts/telemetry-check.js --baseline B.json --current GLOB_OR_JSON --metrics a.b,c [--update-baseline OUT.json]');
  process.exit(2);
}

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--baseline') a.baseline = argv[++i];
    else if (k === '--current') a.current = argv[++i];
    else if (k === '--metrics') a.metrics = argv[++i];
    else if (k === '--update-baseline') a.updateBaseline = argv[++i];
    else usage();
  }
  if (!a.baseline || !a.current || !a.metrics) usage();
  return a;
}

function getPath(obj, dot) {
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
  const agg = {};
  for (const m of metrics) agg[m] = 0;
  for (const f of files) {
    let obj;
    try { obj = JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { console.log('LOUD: telemetry-check could not parse ' + f + ': ' + e.message); process.exit(1); }
    for (const m of metrics) agg[m] += metricValue(obj, m);
  }
  if (args.updateBaseline) {
    fs.writeFileSync(args.updateBaseline, JSON.stringify(agg, null, 2) + '\n');
  }
  const loud = [];
  for (const m of metrics) {
    const b = baseline[m] == null ? 0 : baseline[m];
    const c = agg[m];
    if (b >= 3 && c === 0) {
      loud.push(`LOUD: ${m} disappeared: baseline ${b} -> current ${c} (n=${files.length} files)`);
    } else if (b === 0 && c >= 3) {
      loud.push(`LOUD: ${m} newly appeared: baseline ${b} -> current ${c} (n=${files.length} files)`);
    } else if (b >= 5 && Math.abs(c - b) / b >= 0.6) {
      const pct = Math.round(((c - b) / b) * 100);
      loud.push(`LOUD: ${m} swung ${pct}%: baseline ${b} -> current ${c} (n=${files.length} files)`);
    }
  }
  for (const l of loud) console.log(l);
  if (!loud.length) console.log(`telemetry-check: quiet (${files.length} files, ${metrics.length} metrics, no large deviations)`);
  process.exit(loud.length ? 1 : 0);
}

main();
