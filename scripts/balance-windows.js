#!/usr/bin/env node
'use strict';
// Read saved observations only. Complete paired windows are conditional samples,
// never estimates of what an already-ended campaign would have done afterward.
const fs = require('fs'), zlib = require('zlib'), crypto = require('crypto');
const score = require('./lib/balance-scorecard');
const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const key = r => r.row.policy + ':' + r.row.seed;
const defaults = [[2, 30], [31, 60], [61, 90], [91, 120], [121, 150]];
const fields = {
  livingNpcs: s => s.unknownRosterPeople === 0 && Number.isFinite(s.livingNpcs) ? s.livingNpcs : null,
  lowFood: s => Number.isFinite(s.kcal) ? Number(s.kcal < 500) : null,
  lowWater: s => Number.isFinite(s.hydration) ? Number(s.hydration < 25) : null,
  lowHealth: s => Number.isFinite(s.health) ? Number(s.health < 25) : null,
  hungryNpcFraction: s => s.unknownRosterPeople === 0 && Number.isFinite(s.knownNeeds) && s.knownNeeds > 0 && Number.isFinite(s.hungryNpcs) ? s.hungryNpcs / s.knownNeeds : null
};
function indexSamples(r) {
  if (!Array.isArray(r.samples)) throw Error('Missing samples: ' + key(r));
  const m = new Map();
  for (const s of r.samples) {
    if (!Number.isInteger(s.day) || s.day < 0 || m.has(s.day)) throw Error('Invalid or duplicate sample day: ' + key(r));
    m.set(s.day, s);
  }
  return m;
}
function terminalAt(r, samples, day) {
  const end = r.row.endReason, last = r.row.gameDays;
  if (Number.isFinite(last) && last <= day && end && end !== 'survived') {
    if (end === 'village-lost' || end === 'village-dead') return 'community_loss';
    if (r.row.won === 1) return 'won';
    return 'other_terminal';
  }
  return samples.has(day) ? 'observed_at_boundary' : 'unobserved_at_boundary';
}
function summarize(before, after, windows = defaults) {
  const validity = score.comparePanels(before, after);
  return summarizeValidated(before, after, windows, validity);
}
function summarizeHarnessRevision(before, after, declaration, windows = defaults) {
  return summarizeValidated(before, after, windows, require('./lib/harness-comparison').compareHarnessRevision(before, after, declaration));
}
function summarizePolicyRevision(before, after, declaration, windows = defaults) {
  return summarizeValidated(before, after, windows, require('./lib/policy-comparison').comparePolicyRevision(before, after, declaration));
}
function summarizeValidated(before, after, windows, validity) {
  if (validity.decision === 'invalid') throw Error(validity.errors.join('; '));
  for (const w of windows) if (w.length !== 2 || !w.every(Number.isInteger) || w[0] < 0 || w[1] < w[0]) throw Error('Invalid calendar window');
  const bm = new Map(before.rows.map(r => [key(r), r]));
  // Validate every sample, including observations outside requested windows.
  const indexes = new Map([...before.rows, ...after.rows].map(r => [r, indexSamples(r)]));
  return { schemaVersion: 1, interpretation: 'Conditional complete paired calendar windows; diagnostic only. No imputation, survival extrapolation, or balance verdict.',
    scorecardDecision: validity.decision, beforeSource: before.sourceDigest, afterSource: after.sourceDigest,
    ...(validity.comparisonKind ? { comparisonKind: validity.comparisonKind, methodologyReason: validity.reason, changedSources: validity.changedSources } : {}),
    units: { livingNpcs: 'people', lowFood: 'fraction of sampled days below 500 kcal', lowWater: 'fraction below 25 hydration', lowHealth: 'fraction below 25 health', hungryNpcFraction: 'mean daily fraction of NPCs with known needs hungry' },
    policies: after.options.policies.map(policy => {
      const pairs = after.rows.filter(r => r.row.policy === policy).map(a => ({ b: bm.get(key(a)), a }));
      return { policy, totalPairs: pairs.length, windows: windows.map(([start, end]) => {
        const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const counts = { before: {}, after: {} }, excluded = [], complete = [];
        for (const { b, a } of pairs) {
          const bi = indexes.get(b), ai = indexes.get(a);
          for (const [side, r, m] of [['before', b, bi], ['after', a, ai]]) {
            const state = terminalAt(r, m, end); counts[side][state] = (counts[side][state] || 0) + 1;
          }
          const missingBefore = days.filter(d => !bi.has(d)), missingAfter = days.filter(d => !ai.has(d));
          if (missingBefore.length || missingAfter.length) excluded.push({ case: key(a), missingBefore, missingAfter });
          else complete.push({ b: days.map(d => bi.get(d)), a: days.map(d => ai.get(d)) });
        }
        const metrics = Object.fromEntries(Object.entries(fields).map(([name, read]) => {
          const eligible = complete.map(p => ({ b: p.b.map(read), a: p.a.map(read) })).filter(p => [...p.b, ...p.a].every(Number.isFinite));
          const b = eligible.map(p => mean(p.b)), a = eligible.map(p => mean(p.a));
          return [name, { pairs: eligible.length, unknownPairs: complete.length - eligible.length, before: mean(b), after: mean(a), delta: mean(b.map((x, i) => a[i] - x)) }];
        }));
        return { start, end, completePairs: complete.length, coverage: pairs.length ? complete.length / pairs.length : null, boundaryStates: counts, excluded, metrics };
      }) };
    }) };
}
function load(file) { const b = fs.readFileSync(file); return JSON.parse(file.endsWith('.gz') ? zlib.gunzipSync(b) : b.toString('utf8')); }
if (require.main === module) {
  try {
    const [before, after, out] = process.argv.slice(2);
    if (!before || !after || !out) throw Error('Usage: node scripts/balance-windows.js before.json[.gz] after.json[.gz] out.json');
    const result = summarize(load(before), load(after));
    result.inputs = [before, after].map(file => ({ file, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }));
    fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ out, policies: result.policies.map(p => ({ policy: p.policy, completePairs: p.windows.map(w => w.completePairs) })) }));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { summarize, summarizeHarnessRevision, summarizePolicyRevision, terminalAt };
