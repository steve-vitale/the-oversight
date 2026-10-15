'use strict';
const crypto = require('crypto');
const contract = require('../balance-metrics.json');
const contractDigest = crypto.createHash('sha256').update(require('fs').readFileSync(require('path').join(__dirname, '../balance-metrics.json'))).digest('hex');
const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const quantile = (xs, p) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) * p)] : null; };
function interval(xs, key, count = contract.bootstrapSamples) {
  if (!xs.length) return [null, null];
  let seed = crypto.createHash('sha256').update(key).digest().readUInt32LE(0);
  const random = () => { seed += 0x6D2B79F5; let t = seed; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const means = [];
  for (let i = 0; i < count; i++) { let sum = 0; for (let j = 0; j < xs.length; j++) sum += xs[Math.floor(random() * xs.length)]; means.push(sum / xs.length); }
  return [quantile(means, 0.025), quantile(means, 0.975)];
}
function compareMetric(before, after, spec, key) {
  const pairs = before.map((b, i) => [b, after[i]]).filter(p => p.every(Number.isFinite));
  const diffs = pairs.map(([b, a]) => a - b), delta = mean(diffs);
  const ci = interval(diffs, key), orientation = spec.direction === 'lower' ? -1 : 1;
  let status = spec.direction === 'neutral' ? 'descriptive' : 'no_material_signal';
  const coverageChanged = before.some((x, i) => Number.isFinite(x) !== Number.isFinite(after[i]));
  if (!pairs.length) status = 'not_observed';
  else if (pairs.length < contract.minimumPairs) status = 'insufficient';
  else if (coverageChanged) status = 'coverage_changed';
  else if (spec.direction !== 'neutral' && orientation * delta < -spec.tolerance) {
    status = (spec.direction === 'lower' ? ci[0] > 0 : ci[1] < 0) ? 'regression_signal' : 'regression_watch';
  }
  return { id: spec.id, label: spec.label, unit: spec.unit, direction: spec.direction, tolerance: spec.tolerance, status, coverageChanged,
    totalPairs: before.length, eligibleBefore: before.filter(Number.isFinite).length, eligibleAfter: after.filter(Number.isFinite).length, pairs: pairs.length,
    before: mean(pairs.map(p => p[0])), after: mean(pairs.map(p => p[1])), delta, interval95: ci,
    pairedP10: quantile(diffs, 0.1), pairedMedian: quantile(diffs, 0.5), pairedP90: quantile(diffs, 0.9),
    increased: diffs.filter(d => d > 0).length, decreased: diffs.filter(d => d < 0).length,
    better: spec.direction === 'neutral' ? null : diffs.filter(d => d * orientation > 0).length,
    worse: spec.direction === 'neutral' ? null : diffs.filter(d => d * orientation < 0).length, tied: diffs.filter(d => d === 0).length };
}
const caseKey = r => r.row.policy + ':' + r.row.seed;
function comparePanels(before, after) {
  const errors = [];
  if (before.contractDigest !== contractDigest || after.contractDigest !== contractDigest) errors.push('Metric contract does not match this comparator');
  for (const field of ['schemaVersion', 'observerDigest', 'contractDigest']) if (before[field] !== after[field]) errors.push('Different ' + field);
  for (const field of ['days', 'policies', 'seeds', 'region', 'origin', 'flags', 'nodeVersion']) if (JSON.stringify(before.options[field]) !== JSON.stringify(after.options[field])) errors.push('Unmatched ' + field);
  for (const f of new Set([...Object.keys(before.sources), ...Object.keys(after.sources)])) {
    if (f.startsWith('scripts/') && before.sources[f] !== after.sources[f]) errors.push('Policy/harness changed: ' + f);
  }
  const validate = panel => {
    const keys = panel.rows.map(caseKey);
    const expected = new Set(panel.options.policies.flatMap(p => panel.options.seeds.map(s => p + ':' + s)));
    if (keys.some(k => !expected.has(k))) errors.push('Case does not belong to declared panel');
    if (new Set(keys).size !== keys.length) errors.push('Duplicate cases');
    if (keys.length !== panel.options.seeds.length * panel.options.policies.length) errors.push('Incomplete panel');
    if (!panel.validity.sourcesStable) errors.push('Sources changed mid-panel');
    for (const policy of panel.options.policies) if (!panel.validity.neutrality.some(p => p.policy === policy && p.match && !p.warnings)) errors.push('Missing passing neutrality proof: ' + policy);
    for (const r of panel.rows) if (r.warnings.length || r.observerErrors.length || r.gear.errors.length) errors.push('Observer/runtime warning or error: ' + caseKey(r));
  };
  validate(before); validate(after);
  const bm = new Map(before.rows.map(r => [caseKey(r), r]));
  if (after.rows.some(r => !bm.has(caseKey(r)))) errors.push('Unmatched cases');
  if (errors.length) return { decision: 'invalid', errors: [...new Set(errors)], policies: [] };
  const policies = after.options.policies.map(policy => {
    const rs = after.rows.filter(r => r.row.policy === policy);
    const metrics = contract.metrics.map(m => compareMetric(rs.map(r => bm.get(caseKey(r)).metrics[m.id]), rs.map(r => r.metrics[m.id]), m, policy + '/' + m.id));
    const review = metrics.filter(m => !['descriptive', 'no_material_signal'].includes(m.status));
    return { policy, cases: rs.length, confirmationSized: rs.length >= contract.confirmationSeeds, decision: review.length ? 'review_required' : 'no_material_signal', metrics };
  });
  return { schemaVersion: 1, decision: policies.some(p => p.decision === 'review_required') ? 'review_required' : 'no_material_signal', errors: [], policies,
    note: 'No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence.' };
}
function markdown(report) {
  const lines = ['# Balanced campaign comparison', '', '**Decision: ' + report.decision + '**', '', ...(report.errors || []).map(e => '- ' + e)];
  for (const p of report.policies) {
    lines.push('', '## ' + p.policy, '', `${p.cases} paired cases; ${p.confirmationSized ? 'confirmation-sized' : 'screen only'}; ${p.decision}.`, '', '| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |', '| --- | ---: | ---: | ---: | --- | ---: | --- |');
    const fmt = n => n == null ? 'unknown' : Number(n.toFixed(4)).toString();
    for (const m of p.metrics) lines.push(`| ${m.label} | ${fmt(m.before)} | ${fmt(m.after)} | ${fmt(m.delta)} | ${m.interval95.map(fmt).join(' to ')} | ${m.pairs}/${m.totalPairs} | ${m.status} |`);
  }
  lines.push('', report.note || 'Invalid comparisons must be repaired before interpretation.', '');
  return lines.join('\n');
}
module.exports = { mean, quantile, interval, compareMetric, comparePanels, markdown, contract, contractDigest };
