'use strict';
const S = require('./balance-scorecard');
function mergePanels(panels) {
  if (!panels.length) throw new Error('At least one shard is required');
  const base = panels[0], rows = [], seeds = [], seen = new Set();
  for (const p of panels) {
    if (S.comparePanels(p, p).decision === 'invalid') throw new Error('Invalid shard');
    for (const f of ['schemaVersion', 'sourceDigest', 'observerDigest', 'contractDigest']) if (p[f] !== base[f]) throw new Error('Different shard ' + f);
    for (const f of ['days', 'policies', 'region', 'origin', 'flags', 'nodeVersion']) if (JSON.stringify(p.options[f]) !== JSON.stringify(base.options[f])) throw new Error('Different shard option ' + f);
    for (const seed of p.options.seeds) { if (seen.has(seed)) throw new Error('Overlapping shard seed ' + seed); seen.add(seed); seeds.push(seed); }
    rows.push(...p.rows);
  }
  return { ...base, options: { ...base.options, seeds }, rows: rows.sort((a, b) => a.row.policy.localeCompare(b.row.policy) || a.row.seed - b.row.seed),
    reused: panels.reduce((n, p) => n + p.reused, 0), mergedFrom: panels.map(p => ({ sourceHeadStart: p.sourceHeadStart, sourceHeadEnd: p.sourceHeadEnd, seeds: p.options.seeds })),
    validity: { sourcesStable: true, neutrality: panels.flatMap(p => p.validity.neutrality) } };
}
module.exports = { mergePanels };
