#!/usr/bin/env node
'use strict';
const fs = require('fs'), zlib = require('zlib');
function summarize(panel) {
  return panel.options.policies.map(policy => {
    const rows = panel.rows.filter(r => r.row.policy === policy), features = [], recipes = [], sources = {};
    const completeMethodCoverage = rows.every(r => Array.isArray(r.gear.observedMethods));
    const names = new Set(rows.flatMap(r => r.gear.observedMethods || [...Object.keys(r.gear.calls), ...r.gear.missing]));
    for (const name of [...names].sort()) {
      const available = rows.filter(r => !r.gear.missing.includes(name));
      const calls = available.reduce((n, r) => n + (r.gear.calls[name] || 0), 0);
      features.push({ name, availableRuns: available.length, reachedRuns: available.filter(r => r.gear.calls[name] > 0).length, calls,
        returnedTruthy: available.reduce((n, r) => n + (r.gear.effects[name] || 0), 0), status: !available.length ? 'unavailable' : !calls ? 'not_reached' : 'reached' });
    }
    const ids = new Set(rows.flatMap(r => [...Object.keys(r.gear.recipeAccess), ...Object.keys(r.gear.crafts)]));
    for (const id of [...ids].sort()) {
      const knownRuns = rows.filter(r => r.gear.recipeAccess[id]?.knownSamples > 0).length;
      const readyRuns = rows.filter(r => r.gear.recipeAccess[id]?.materialsReadySamples > 0).length;
      const attempts = rows.reduce((n, r) => n + (r.gear.crafts[id]?.attempts || 0), 0), successes = rows.reduce((n, r) => n + (r.gear.crafts[id]?.successes || 0), 0);
      recipes.push({ id, knownRuns, readyRuns, attempts, successes, status: successes ? 'produced' : attempts ? 'attempted_no_success' : readyRuns ? 'ready_unused' : knownRuns ? 'known_no_material_sample' : 'unobserved_access' });
    }
    for (const r of rows) for (const g of r.gear.grants) {
      const key = (g.who === 'player' ? 'player/' : 'npc/') + g.source;
      const s = sources[key] || (sources[key] = { units: 0, tier3WeaponArmor: 0 });
      s.units += g.n; if (g.gear && g.tier >= 3) s.tier3WeaponArmor += g.n;
    }
    const distributions = { playerClasses: {}, npcClasses: {}, playerGods: {}, npcGods: {}, winningEndings: {} };
    const add = (name, key) => { distributions[name][key] = (distributions[name][key] || 0) + 1; };
    for (const r of rows) {
      for (const role of ['player', 'npc']) { for (const id of r.classes[role]) add(role + 'Classes', id); for (const id of r.gods[role]) add(role + 'Gods', id); }
      for (const key of new Set(r.endings.filter(e => e.type === 'table_won').map(e => [e.path || 'unknown', e.godpath || 'none', e.subclass || 'none', e.moral || 'unknown'].join('/')))) add('winningEndings', key);
    }
    return { policy, runs: rows.length, completeMethodCoverage, features, recipes, sources, distributions };
  });
}
function markdown(report) {
  const lines = ['# Feature and build census', '', 'Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.', ''];
  for (const p of report) {
    lines.push('## ' + p.policy, '', p.completeMethodCoverage ? 'The complete observed method registry is retained, including zero-call routes.' : 'Legacy panel: method registry was not retained. This list is partial; absent methods are unknown, not unused.', '', '### Feature use', '', '| Method | Available runs | Reached runs | Calls | Truthy returns | Status |', '| --- | ---: | ---: | ---: | ---: | --- |');
    for (const f of p.features) lines.push(`| ${f.name} | ${f.availableRuns}/${p.runs} | ${f.reachedRuns} | ${f.calls} | ${f.returnedTruthy} | ${f.status} |`);
    lines.push('', '### Observed recipe funnel', '', '| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |', '| --- | ---: | ---: | ---: | ---: | --- |');
    for (const r of p.recipes) lines.push(`| ${r.id} | ${r.knownRuns} | ${r.readyRuns} | ${r.attempts} | ${r.successes} | ${r.status} |`);
    lines.push('', '### Earned rewards by recipient/source', '', '| Source | Units | Tier-3+ weapon/armor units |', '| --- | ---: | ---: |');
    for (const [key, s] of Object.entries(p.sources).sort()) lines.push(`| ${key} | ${s.units} | ${s.tier3WeaponArmor} |`);
    lines.push('', 'Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.', '', '```json', JSON.stringify(p.distributions, null, 2), '```', '');
  }
  return lines.join('\n');
}
if (require.main === module) {
  const a = process.argv.slice(2); if (a.length !== 3 || a[1] !== '--out') throw new Error('node scripts/balance-features.js <panel.json.gz> --out <prefix>');
  const panel = JSON.parse(zlib.gunzipSync(fs.readFileSync(a[0]))), report = summarize(panel);
  fs.writeFileSync(a[2] + '.json', JSON.stringify(report, null, 2) + '\n'); fs.writeFileSync(a[2] + '.md', markdown(report));
}
module.exports = { summarize, markdown };
