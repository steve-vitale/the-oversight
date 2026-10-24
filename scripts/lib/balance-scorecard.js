'use strict';
const crypto = require('crypto');
const cohorts = require('./balance-cohorts');
const contract = require('../balance-metrics.json');
const contractDigest = crypto.createHash('sha256').update(require('./source-text').normalizeSource(require('fs').readFileSync(require('path').join(__dirname, '../balance-metrics.json'),'utf8'))).digest('hex');
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
  else if (spec.direction === 'neutral' && spec.reviewChanges && Math.abs(delta) > spec.tolerance) {
    status = (ci[0] > 0 || ci[1] < 0) ? 'change_signal' : 'change_watch';
  }
  else if (spec.direction !== 'neutral' && orientation * delta < -spec.tolerance) {
    status = (spec.direction === 'lower' ? ci[0] > 0 : ci[1] < 0) ? 'regression_signal' : 'regression_watch';
  }
  return { id: spec.id, label: spec.label, unit: spec.unit, direction: spec.direction, tolerance: spec.tolerance, reviewChanges: !!spec.reviewChanges, status, coverageChanged,
    totalPairs: before.length, eligibleBefore: before.filter(Number.isFinite).length, eligibleAfter: after.filter(Number.isFinite).length, pairs: pairs.length,
    before: mean(pairs.map(p => p[0])), after: mean(pairs.map(p => p[1])), delta, interval95: ci,
    pairedP10: quantile(diffs, 0.1), pairedMedian: quantile(diffs, 0.5), pairedP90: quantile(diffs, 0.9),
    increased: diffs.filter(d => d > 0).length, decreased: diffs.filter(d => d < 0).length,
    better: spec.direction === 'neutral' ? null : diffs.filter(d => d * orientation > 0).length,
    worse: spec.direction === 'neutral' ? null : diffs.filter(d => d * orientation < 0).length, tied: diffs.filter(d => d === 0).length };
}
const caseKey = r => r.row.policy + ':' + r.row.seed;
// ---- Per-seed sweep-corpus ingestion (gap-instruments B12, 2026-10-27) ----
// Workers kept feeding per-seed sweep corpora (flat rows:
// {policy, seed, won, entered, ...}, no .options) into the panel compare,
// which dereferenced undefined.options and threw TypeError at line 44.
// The strict panel path below is a safety property (digest/validity
// gates) and is NOT weakened: a sweep-shaped input is routed to a
// separately labeled comparison that pairs rows by policy+seed and
// reuses compareMetric, mapping ONLY the contract metrics whose
// sweep-row definition matches the panel definition exactly (see
// sweepMetric). Every other contract metric is null -> not_observed,
// never invented. A sweep-corpus report is never a balanced-panel
// verdict; its note says so.
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function asBinary(v) {
  if (v === true) return 1;
  if (v === false) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v ? 1 : 0;
  return null;
}
function playerDeathsOf(row) {
  const d = row.deaths;
  if (Array.isArray(d)) {
    if (!d.every(x => x && typeof x.player === 'boolean')) return null;
    return d.filter(x => x.player).length;
  }
  if (d && typeof d === 'object') {
    let n = 0;
    for (const [k, v] of Object.entries(d)) {
      if (!k.startsWith('player:')) continue;
      if (typeof v !== 'number' || !Number.isFinite(v)) return null;
      n += v;
    }
    return n;
  }
  return null;
}
function sweepMetric(row, id) {
  if (!row || typeof row !== 'object') return null;
  switch (id) {
    case 'won': return asBinary(row.won);
    case 'entered': return asBinary(row.entered);
    case 'table': return row.table != null ? asBinary(row.table) : asBinary(row.tableInvited);
    case 'national': {
      if (row.national != null) return asBinary(row.national);
      if (row.nationalEver != null) return asBinary(row.nationalEver);
      if (typeof row.maxRank === 'string') {
        const r = RANK_ORDER[row.maxRank];
        return r == null ? null : (r >= 2 ? 1 : 0);
      }
      return null;
    }
    case 'playerDeaths': return playerDeathsOf(row);
    default: return null;
  }
}
const policyOfSweepRow = r => (r.policy != null ? String(r.policy) : String(r.arm));
const sweepKey = r => policyOfSweepRow(r) + ':' + r.seed;
function isSweepRow(row) {
  return !!row && typeof row === 'object' && !row.row && !row.metrics
    && (row.policy != null || row.arm != null) && row.seed != null;
}
function rowsOfSweepDoc(doc) {
  if (Array.isArray(doc)) return doc;
  if (doc && Array.isArray(doc.rows)) return doc.rows;
  if (doc && (doc.policy != null || doc.arm != null) && doc.seed != null) return [doc];
  return null;
}
function isSweepCorpus(doc) {
  const rows = rowsOfSweepDoc(doc);
  return !!rows && rows.length > 0 && rows.every(isSweepRow);
}
function compareSweepCorpora(beforeDoc, afterDoc) {
  const bRows = rowsOfSweepDoc(beforeDoc), aRows = rowsOfSweepDoc(afterDoc);
  const bm = new Map(bRows.map(r => [sweepKey(r), r]));
  const policies = [...new Set(aRows.map(policyOfSweepRow))];
  const out = policies.map(policy => {
    const all = aRows.filter(r => policyOfSweepRow(r) === policy), rs = all.filter(r => bm.has(sweepKey(r)));
    const metrics = contract.metrics.map(m => compareMetric(rs.map(r => sweepMetric(bm.get(sweepKey(r)), m.id)), rs.map(r => sweepMetric(r, m.id)), m, policy + '/' + m.id));
    const review = metrics.filter(m => !['descriptive', 'no_material_signal'].includes(m.status));
    return { policy, cases: rs.length, confirmationSized: rs.length >= contract.confirmationSeeds, decision: review.length ? 'review_required' : 'no_material_signal', metrics };
  });
  return { schemaVersion: 1, source: 'sweep-corpus', decision: out.some(p => p.decision === 'review_required') ? 'review_required' : 'no_material_signal', errors: [], policies: out,
    note: 'Sweep-corpus comparison, NOT a balanced-panel verdict: rows paired by policy+seed; only won/entered/table/national/playerDeaths are carried by per-seed sweep rows, and every other contract metric is not_observed, never imputed. For a §15 panel verdict, build real panels with scripts/balance-panel.js.' };
}
function isPanelShape(p) {
  return !!p && typeof p === 'object' && !!p.options && Array.isArray(p.rows)
    && !!p.sources && typeof p.sources === 'object'
    && !!p.validity && Array.isArray(p.validity.neutrality);
}
function comparePanels(before, after, options) {
  if (isSweepCorpus(before) || isSweepCorpus(after)) {
    if (!isSweepCorpus(before) || !isSweepCorpus(after)) return { decision: 'invalid', errors: ['Cannot compare a sweep corpus against a balanced panel; convert both sides to the same shape'], policies: [] };
    return compareSweepCorpora(before, after);
  }
  if (!isPanelShape(before) || !isPanelShape(after)) return { decision: 'invalid', errors: ['Not a balanced panel (missing options/rows/sources/validity); per-seed sweep corpora are compared via the sweep-corpus path'], policies: [] };
  const errors = [];
  options = options || {};
  // 797 (Steve 2026-10-24): a run may DECLARE flags as its intervention (e.g.
  // an env-gated lever's own flag differing before/after). Declared flags are
  // exempted from the flags match — never inferred: only flags listed here
  // are exempted, and the exemption is recorded on the report. Any other
  // differing flag still invalidates the comparison.
  const rawFlags = Array.isArray(options.interventionFlags) ? options.interventionFlags : (options.interventionFlags == null ? [] : null);
  if (rawFlags === null || rawFlags.some(f => typeof f !== 'string' || !f)) errors.push('Invalid intervention flag declaration');
  const declared = [...new Set((rawFlags || []).filter(f => typeof f === 'string' && f))];
  const flagVal = (panel, f) => (panel.options.flags && Object.hasOwn(panel.options.flags, f)) ? panel.options.flags[f] : null;
  const intervention = declared.length ? { declared, before: Object.fromEntries(declared.map(f => [f, flagVal(before, f)])), after: Object.fromEntries(declared.map(f => [f, flagVal(after, f)])) } : null;
  const withIntervention = report => intervention ? { ...report, interventionFlags: intervention } : report;
  if (before.contractDigest !== contractDigest || after.contractDigest !== contractDigest) errors.push('Metric contract does not match this comparator');
  for (const field of ['schemaVersion', 'observerDigest', 'contractDigest']) if (before[field] !== after[field]) errors.push('Different ' + field);
  for (const field of ['days', 'policies', 'seeds', 'region', 'origin', 'occupation', 'flags', 'nodeVersion']) {
    if (field === 'flags' && declared.length) {
      const strip = o => Object.fromEntries(Object.entries(o || {}).filter(([k]) => !declared.includes(k)));
      if (JSON.stringify(strip(before.options.flags)) !== JSON.stringify(strip(after.options.flags))) errors.push('Unmatched flags');
    } else if (JSON.stringify(before.options[field]) !== JSON.stringify(after.options[field])) errors.push('Unmatched ' + field);
  }
  for (const f of new Set([...Object.keys(before.sources), ...Object.keys(after.sources)])) {
    if (f.startsWith('scripts/') && before.sources[f] !== after.sources[f]) errors.push('Policy/harness changed: ' + f);
  }
  const validate = panel => {
    errors.push(...cohorts.validate(panel));
    if (!panel.validity.sourcesStable) errors.push('Sources changed mid-panel');
    for (const r of panel.rows) if (r.warnings?.length || r.observerErrors?.length || r.gear?.errors?.length) errors.push('Observer/runtime warning or error: ' + caseKey(r));
  };
  validate(before); validate(after);
  const bm = new Map(before.rows.map(r => [caseKey(r), r]));
  if (!after.options.occupation && after.rows.some(r => !bm.has(caseKey(r)))) errors.push('Unmatched cases');
  if (errors.length) return withIntervention({ decision: 'invalid', errors: [...new Set(errors)], policies: [] });
  const policies = after.options.policies.map(policy => {
    const all = after.rows.filter(r => r.row.policy === policy), rs = all.filter(r => bm.has(caseKey(r)));
    const metrics = contract.metrics.map(m => compareMetric(rs.map(r => bm.get(caseKey(r)).metrics[m.id]), rs.map(r => r.metrics[m.id]), m, policy + '/' + m.id));
    const review = metrics.filter(m => !['descriptive', 'no_material_signal'].includes(m.status));
    const result = { policy, cases: rs.length, confirmationSized: rs.length >= contract.confirmationSeeds, decision: review.length ? 'review_required' : 'no_material_signal', metrics };
    if (after.options.occupation) {
      const beforeRows = before.rows.filter(r => r.row.policy === policy), am = new Set(all.map(caseKey));
      const unavailableBefore = all.filter(r => !bm.has(caseKey(r))).map(r => r.row.seed);
      const unavailableAfter = beforeRows.filter(r => !am.has(caseKey(r))).map(r => r.row.seed);
      const rosterChanged = rs.filter(r => r.row.selection.rosterHash !== bm.get(caseKey(r)).row.selection.rosterHash).map(r => r.row.seed);
      result.cohort = { occupation: after.options.occupation, before: cohorts.coverage(before, policy), after: cohorts.coverage(after, policy),
        pairedPlayed: rs.length, unavailableBefore, unavailableAfter, rosterChanged };
      if (unavailableBefore.length || unavailableAfter.length || rosterChanged.length || !rs.length) result.decision = 'review_required';
    }
    return result;
  });
  return withIntervention({ schemaVersion: 1, decision: policies.some(p => p.decision === 'review_required') ? 'review_required' : 'no_material_signal', errors: [], policies,
    note: 'No weighted score. Exploratory paired intervals are not adjusted for multiple metrics. No material signal is not proof of equivalence; review tradeoffs and holdout evidence. Win-rate movement prompts investigation in either direction, never an automatic regression or improvement judgment.' });
}
function markdown(report) {
  const lines = [(report.source === 'sweep-corpus' ? '# Sweep-corpus comparison (not a balanced-panel verdict)' : '# Balanced campaign comparison'), '', '**Decision: ' + report.decision + '**', '', ...(report.errors || []).map(e => '- ' + e)];
  if (report.interventionFlags) lines.push('', `Declared intervention flags exempted from the flags match: ${report.interventionFlags.declared.join(', ')} (before ${JSON.stringify(report.interventionFlags.before)}; after ${JSON.stringify(report.interventionFlags.after)}).`);
  for (const p of report.policies) {
    if (p.cohort) lines.push('', `Occupation ${p.cohort.occupation}: before ${p.cohort.before.played}/${p.cohort.before.attempted} played (${p.cohort.before.excluded} excluded); after ${p.cohort.after.played}/${p.cohort.after.attempted} played (${p.cohort.after.excluded} excluded). Only ${p.cohort.pairedPlayed} matched played cases enter metrics. Availability/roster changes: ${JSON.stringify({ unavailableBefore: p.cohort.unavailableBefore, unavailableAfter: p.cohort.unavailableAfter, rosterChanged: p.cohort.rosterChanged })}.`);
    lines.push('', '## ' + p.policy, '', `${p.cases} paired cases; ${p.confirmationSized ? 'confirmation-sized' : 'screen only'}; ${p.decision}.`, '', '| Metric | Before | After | Paired delta | 95% exploratory interval | Pairs | Status |', '| --- | ---: | ---: | ---: | --- | ---: | --- |');
    const fmt = n => n == null ? 'unknown' : Number(n.toFixed(4)).toString();
    for (const m of p.metrics) lines.push(`| ${m.label} | ${fmt(m.before)} | ${fmt(m.after)} | ${fmt(m.delta)} | ${m.interval95.map(fmt).join(' to ')} | ${m.pairs}/${m.totalPairs} | ${m.status} |`);
  }
  lines.push('', report.note || 'Invalid comparisons must be repaired before interpretation.', '');
  return lines.join('\n');
}
module.exports = { mean, quantile, interval, compareMetric, comparePanels, compareSweepCorpora, isSweepCorpus, sweepMetric, markdown, contract, contractDigest };
