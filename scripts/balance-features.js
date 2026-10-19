#!/usr/bin/env node
'use strict';
const fs = require('fs'), zlib = require('zlib');
const cohorts = require('./lib/balance-cohorts');
function summarize(panel) {
  if (panel.options.occupation) { const errors = cohorts.validate(panel); if (errors.length) throw Error('Invalid cohort: ' + errors.join('; ')); }
  return panel.options.policies.map(policy => {
    const rows = panel.rows.filter(r => r.row.policy === policy), features = [], recipes = [], sources = {};
    const completeMethodCoverage = rows.length > 0 && rows.every(r => Array.isArray(r.gear.observedMethods));
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
    const observed = rows.filter(r => r.npcExposure?.schemaVersion === 1 && Array.isArray(r.npcExposure.sampledIdentities) && Array.isArray(r.npcExposure.unknownIdentities)), holderDays = { classes: {}, gods: {} }, excluded = { classes: {}, gods: {} };
    let eligiblePersonDays = 0, unknownPersonDays = 0, duplicateRosterEntries = 0;
    for (const r of observed) {
      const perRun = { classes: new Map(), gods: new Map() };
      for (const d of r.npcExposure.days) {
        eligiblePersonDays += d.eligible.length; unknownPersonDays += d.unknown.length; duplicateRosterEntries += d.duplicateRosterEntries;
        for (const type of ['classes', 'gods']) {
          for (const [reason, n] of Object.entries(d.excludedBuildRecords[type])) excluded[type][reason] = (excluded[type][reason] || 0) + n;
          for (const h of d[type]) {
            if (!perRun[type].has(h.build)) perRun[type].set(h.build, { days: new Set(), people: new Set() });
            const b = perRun[type].get(h.build); b.days.add(d.day + '\0' + h.who); b.people.add(h.who);
          }
        }
      }
      for (const type of ['classes', 'gods']) for (const [id, b] of perRun[type]) {
        const total = holderDays[type][id] || (holderDays[type][id] = { runs: 0, holderDays: 0, holderIdentitiesAcrossRuns: 0 });
        total.runs++; total.holderDays += b.days.size; total.holderIdentitiesAcrossRuns += b.people.size;
      }
    }
    const npcExposure = { measuredRuns: observed.length, missingRuns: rows.length - observed.length,
      sampledIdentitiesAcrossRuns: observed.length ? observed.reduce((n, r) => n + r.npcExposure.sampledIdentities.length, 0) : null,
      unknownIdentitiesAcrossRuns: observed.length ? observed.reduce((n, r) => n + r.npcExposure.unknownIdentities.length, 0) : null,
      eligiblePersonDays: observed.length ? eligiblePersonDays : null, unknownPersonDays: observed.length ? unknownPersonDays : null,
      duplicateRosterEntries: observed.length ? duplicateRosterEntries : null, excludedBuildRecordSamples: observed.length ? excluded : null,
      holderDays: observed.length ? holderDays : null };
    const diagnosticRows = rows.map(r => r.row.policyDiagnostics).filter(d => d && d.version === 1);
    const errorRows = diagnosticRows.filter(d => Array.isArray(d.errors));
    const blockRows = diagnosticRows.filter(d => d.blocked && typeof d.blocked === 'object' && !Array.isArray(d.blocked));
    const capturedErrorReasons = Object.create(null), blocks = Object.create(null), counters = Object.create(null);
    for (const d of errorRows) for (const message of d.errors) capturedErrorReasons[message] = (capturedErrorReasons[message] || 0) + 1;
    for (const d of blockRows) for (const [name, reason] of Object.entries(d.blocked)) {
      const key = JSON.stringify([name, reason]);
      const b = blocks[key] || (blocks[key] = { name, reason, runs: 0 }); b.runs++;
    }
    for (const d of diagnosticRows) for (const [name, value] of Object.entries(d.counters || {})) {
      if (!Number.isFinite(value)) continue;
      const c = counters[name] || (counters[name] = { sum: 0, reportedRuns: 0 }); c.sum += value; c.reportedRuns++;
    }
    const controllerDiagnostics = { version: 1, measuredRuns: diagnosticRows.length, missingRuns: rows.length - diagnosticRows.length,
      errorKnownRuns: errorRows.length, errorRuns: errorRows.length ? errorRows.filter(d => d.errors.length).length : null,
      capturedErrorReasons, blockKnownRuns: blockRows.length,
      blockedRuns: blockRows.length ? blockRows.filter(d => Object.keys(d.blocked).length).length : null,
      blocks: Object.values(blocks), counters };
    return { policy, runs: rows.length, ...(panel.options.occupation ? { cohort: cohorts.coverage(panel, policy) } : {}), completeMethodCoverage, features, recipes, sources, distributions, npcExposure, controllerDiagnostics };
  });
}
function markdown(report) {
  const lines = ['# Feature and build census', '', 'Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.', ''];
  for (const p of report) {
    if (p.cohort) lines.push('', `Occupation coverage: ${p.cohort.played}/${p.cohort.attempted} campaigns played; ${p.cohort.excluded} excluded. ${JSON.stringify(p.cohort.reasons)}. Excluded offers are not unused features or NPC exposure.`, '');
    lines.push('## ' + p.policy + ' controller coverage', '',
      'Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.', '',
      '```json', JSON.stringify(p.controllerDiagnostics, null, 2), '```', '');
    lines.push('## ' + p.policy, '', p.completeMethodCoverage ? 'The complete observed method registry is retained, including zero-call routes.' : 'Legacy panel: method registry was not retained. This list is partial; absent methods are unknown, not unused.', '', '### Feature use', '', '| Method | Available runs | Reached runs | Calls | Truthy returns | Status |', '| --- | ---: | ---: | ---: | ---: | --- |');
    for (const f of p.features) lines.push(`| ${f.name} | ${f.availableRuns}/${p.runs} | ${f.reachedRuns} | ${f.calls} | ${f.returnedTruthy} | ${f.status} |`);
    lines.push('', '### Observed recipe funnel', '', '| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |', '| --- | ---: | ---: | ---: | ---: | --- |');
    for (const r of p.recipes) lines.push(`| ${r.id} | ${r.knownRuns} | ${r.readyRuns} | ${r.attempts} | ${r.successes} | ${r.status} |`);
    lines.push('', '### Earned rewards by recipient/source', '', '| Source | Units | Tier-3+ weapon/armor units |', '| --- | ---: | ---: |');
    for (const [key, s] of Object.entries(p.sources).sort()) lines.push(`| ${key} | ${s.units} | ${s.tier3WeaponArmor} |`);
    lines.push('', '### NPC eligibility and sampled build exposure', '',
      `${p.npcExposure.measuredRuns}/${p.runs} runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.`, '', '```json', JSON.stringify(p.npcExposure, null, 2), '```', '',
      'Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.', '', '```json', JSON.stringify(p.distributions, null, 2), '```', '');
  }
  return lines.join('\n');
}
if (require.main === module) {
  const a = process.argv.slice(2); if (a.length !== 3 || a[1] !== '--out') throw new Error('node scripts/balance-features.js <panel.json.gz> --out <prefix>');
  const panel = JSON.parse(zlib.gunzipSync(fs.readFileSync(a[0]))), report = summarize(panel);
  fs.writeFileSync(a[2] + '.json', JSON.stringify(report, null, 2) + '\n'); fs.writeFileSync(a[2] + '.md', markdown(report));
}
module.exports = { summarize, markdown };
