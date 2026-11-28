// Column compare for a POLICY lever (sim-sitpolicy-a, 2026-11-28).
//
// `balance-panel.js compare` (scorecard comparePanels) only compares
// panels with IDENTICAL options.policies — it is built for SOURCE
// levers (same policies, two game roots). A policy lever IS the policy
// column, so comparePanels refuses the two single-policy panels with
// "Unmatched policies" / "Unmatched cases" (see
// evidence/2026-11-28/sitpolicy-panel.json, decision invalid).
//
// This script is the honest equivalent, and forges nothing: it pairs
// the two panels' rows BY SEED (the lever is the policy, so the policy
// name is the thing that differs), and runs the scorecard's OWN
// compareMetric over the SAME 23-metric contract (same tolerances,
// directions, minimumPairs) on panels that share schemaVersion,
// observerDigest, contractDigest, seeds and days, and both pass
// neutrality with zero warnings. The tableReach display block is
// copied from comparePanels (sim-sitmetric-b). The pre-registered
// threshold (§14) remains the judge; this panel is the instrument.
//
// Usage: node scripts/compare-sitpolicy-panels.js
// Writes evidence/2026-11-28/sitpolicy-panel-compare.json/.md
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const score = require('./lib/balance-scorecard');

const ROOT = path.resolve(__dirname, '..');
const read = p => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, p))).toString('utf8'));
const before = read('evidence/2026-11-28/sitpolicy-panel-before/panel.json.gz');
const after = read('evidence/2026-11-28/sitpolicy-panel-after/panel.json.gz');

const fail = msg => { console.error('COLUMN COMPARE FAILED: ' + msg); process.exit(1); };
// Guards: the two panels must be the same instrument, differing only
// in the policy column. Any mismatch here fails loudly, never silently.
for (const f of ['schemaVersion', 'observerDigest', 'contractDigest'])
  if (before[f] !== after[f]) fail('Different ' + f + ': ' + before[f] + ' vs ' + after[f]);
if (JSON.stringify(before.options.seeds) !== JSON.stringify(after.options.seeds)) fail('Unmatched seeds');
if (before.options.days !== after.options.days) fail('Unmatched days');
if (!before.validity.sourcesStable || !after.validity.sourcesStable) fail('Sources changed mid-panel');
for (const [name, p] of [['before', before], ['after', after]])
  for (const n of p.validity.neutrality)
    if (!n.match || (n.warnings | 0) !== 0) fail(name + ' neutrality proof failed: ' + JSON.stringify(n));
if (before.rows.length !== after.rows.length) fail('Row counts differ');
const seeds = before.rows.map(r => r.row.seed).sort((a, b) => a - b);
const bBySeed = new Map(before.rows.map(r => [r.row.seed, r]));
const aBySeed = new Map(after.rows.map(r => [r.row.seed, r]));
for (const s of seeds) if (!bBySeed.has(s) || !aBySeed.has(s)) fail('Seed missing from a panel: ' + s);
if (before.rows.some(r => r.row.policy !== 'competent')) fail('Before panel is not the competent column');
if (after.rows.some(r => r.row.policy !== 'competent-sit')) fail('After panel is not the competent-sit column');
for (const r of before.rows.concat(after.rows))
  if (!r.metrics || typeof r.metrics !== 'object') fail('Row without contract metrics: ' + r.row.policy + ':' + r.row.seed);

const rs = seeds.map(s => aBySeed.get(s));
const metrics = score.contract.metrics.map(m => score.compareMetric(
  rs.map(r => bBySeed.get(r.row.seed).metrics[m.id]),
  rs.map(r => r.metrics[m.id]),
  m, 'competent-sit/' + m.id));
const review = metrics.filter(m => !['descriptive', 'no_material_signal'].includes(m.status));
// Table reach, display only — copied from comparePanels (sim-sitmetric-b):
// the judged `table` metric is sittings by ruling 665 (row.entered), so
// the raw invitation flag (row.table) is surfaced alongside.
const countFlag = (rows, key) => rows.filter(r => r.row && r.row[key]).length;
const beforeRows = rs.map(r => bBySeed.get(r.row.seed));
const reachObserved = beforeRows.concat(rs).some(r => r.row && r.row.table != null);
const tableReach = reachObserved ? {
  invitedBefore: countFlag(beforeRows, 'table'),
  invitedAfter: countFlag(rs, 'table'),
  sittingsBefore: countFlag(beforeRows, 'entered'),
  sittingsAfter: countFlag(rs, 'entered'),
  cases: rs.length,
  note: 'Raw row.table (table invitation ever observed) alongside ruling-665 sittings (row.entered). Display only; never a judged metric and never part of the decision.',
} : null;
const decision = review.length ? 'review_required' : 'no_material_signal';
const report = {
  schemaVersion: 1,
  decision,
  errors: [],
  policies: [{
    policy: 'competent-sit',
    cases: rs.length,
    confirmationSized: rs.length >= score.contract.confirmationSeeds,
    decision,
    metrics,
    tableReach,
  }],
  note: 'No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment. '
    + 'METHOD: column compare, not comparePanels — comparePanels refuses cross-policy panels (Unmatched policies/cases; see sitpolicy-panel.json, decision invalid) because it is built for source levers. This pairs the two single-policy panels by seed (before = competent column, after = competent-sit column) and runs the scorecard\'s own compareMetric over the same 23-metric contract; both panels share schemaVersion, observerDigest, contractDigest, seeds and days, and both pass neutrality with zero warnings. The pre-registered threshold (§14) remains the judge.',
};
fs.writeFileSync(path.join(ROOT, 'evidence/2026-11-28/sitpolicy-panel-compare.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'evidence/2026-11-28/sitpolicy-panel-compare.md'), score.markdown(report));
console.log(score.markdown(report));
