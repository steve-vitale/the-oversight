#!/usr/bin/env node
'use strict';
// Read retained primary panels only. These diagnostics never replace metrics
// or turn a change in population/role exposure into a causal explanation.
const fs = require('fs'), z = require('zlib'), assert = require('assert/strict');
const score = require('./lib/balance-scorecard');
const read = file => JSON.parse(file.endsWith('.gz') ? z.gunzipSync(fs.readFileSync(file)) : fs.readFileSync(file, 'utf8'));
function exposure(row) {
  const e = row.npcExposure;
  assert(e?.schemaVersion === 1 && e.days.length && e.identityRule === 'known-living-resident-not-current-bearer', 'Retained actual NPC identity/day coverage required');
  const days = [...e.days].sort((a, b) => a.day - b.day), first = days[0];
  const founders = new Set(first.eligible), classes = new Set(e.classIdentities);
  const people = new Map();
  function person(id) { if (!people.has(id)) people.set(id, { npcDays: 0, bearerDays: 0, firstNpcDay: null, lastNpcDay: null }); return people.get(id); }
  for (const d of days) {
    for (const id of d.eligible) {
      const p = person(id); p.npcDays++; p.firstNpcDay ??= d.day; p.lastNpcDay = d.day;
    }
    if (d.bearer) person(d.bearer).bearerDays++;
  }
  return { founders, classes, people, unknown: e.unknownIdentities,
    firstObservedDay: first.day, lastObservedDay: days.at(-1).day,
    laterObservedIdentities: e.sampledIdentities.filter(id => !founders.has(id)).length };
}
function review(before, after) {
  const comparison = score.comparePanels(before, after);
  assert.deepEqual(comparison.errors, [], 'Panels must share the actual collector, contract and controller inputs');
  const pairs = after.rows.map(a => {
    const b = before.rows.find(b => b.row.policy === a.row.policy && b.row.seed === a.row.seed); assert(b, 'Matched case required');
    const old = exposure(b), now = exposure(a);
    const common = [...old.founders].filter(id => now.founders.has(id));
    const lost = common.filter(id => old.classes.has(id) && !now.classes.has(id)).map(id => ({ id,
      before: old.people.get(id), after: now.people.get(id) || { npcDays: 0, bearerDays: 0, firstNpcDay: null, lastNpcDay: null } }));
    const side = (r, e) => ({ endReason: r.row.endReason, won: r.row.won, gameDays: r.row.gameDays,
      classPeople: r.npcExposure.classIdentities.length, sampledPeople: r.npcExposure.sampledIdentities.length,
      laterObservedIdentities: e.laterObservedIdentities, unknown: e.unknown,
      firstObservedDay: e.firstObservedDay, lastObservedDay: e.lastObservedDay,
      commonInitialNpcClasses: common.filter(id => e.classes.has(id)).length });
    return { policy: a.row.policy, seed: a.row.seed, commonInitialNpcs: common.length,
      before: side(b, old), after: side(a, now), missingFormerNpcClasses: lost };
  });
  function deathSummary(panel, policy) {
    const rows = panel.rows.filter(r => r.row.policy === policy), prefixes = {}; let humanRate = 0;
    for (const r of rows) {
      let human = 0;
      for (const [key, n] of Object.entries(r.row.deaths)) {
        const prefix = key.split(':')[0]; prefixes[prefix] = (prefixes[prefix] || 0) + n;
        if (['villager', 'person', 'player'].includes(prefix)) human += n;
      }
      assert(r.row.gameDays > 0, 'Actual positive calendar exposure required');
      humanRate += 100 * human / r.row.gameDays;
    }
    return { prefixes, meanHumanDeaths100Days: humanRate / rows.length,
      meanGameDays: rows.reduce((n, r) => n + r.row.gameDays, 0) / rows.length,
      cappedCases: rows.filter(r => r.row.endReason === 'survived').length };
  }
  const policies = after.options.policies.map(policy => {
    const rows = pairs.filter(r => r.policy === policy), missing = rows.flatMap(r => r.missingFormerNpcClasses);
    return { policy, before: deathSummary(before, policy), after: deathSummary(after, policy),
      missingCommonInitialNpcClassCases: missing.length,
      ofThoseObservedAsBearer: missing.filter(p => p.after.bearerDays > 0).length,
      ofThoseWithFewerThan30NpcSamples: missing.filter(p => p.after.npcDays < 30).length,
      beforeLaterObservedIdentities: rows.reduce((n, r) => n + r.before.laterObservedIdentities, 0),
      afterLaterObservedIdentities: rows.reduce((n, r) => n + r.after.laterObservedIdentities, 0) };
  });
  return { schemaVersion: 1, beforeSource: before.sourceDigest, afterSource: after.sourceDigest,
    observer: after.observerDigest, decision: comparison.decision, policies, pairs,
    scope: 'Offline screen diagnostics from actual retained rows. Missing NPC class observations are not lost classes. First-sample cohorts are not birth/join records; bearer-days and eligible-days are coverage, not proof of power use. Capped cases are not endings. Death prefixes distinguish recorded monsters from humans. No causal attribution, imputation, metric replacement or compensation decision.' };
}
module.exports = { review };
if (require.main === module) {
  try {
    const [before, after, out] = process.argv.slice(2);
    assert(before && after && out, 'Usage: node scripts/review-npc-progression.js <before-panel> <after-panel> <new-output.json>');
    assert(!fs.existsSync(out), 'Preserve previous diagnostics');
    const result = review(read(before), read(after)); fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ decision: result.decision, policies: result.policies }));
  } catch (error) { console.error(error.stack); process.exitCode = 1; }
}
