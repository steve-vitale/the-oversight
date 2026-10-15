#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const { coverage, mealDemand } = require('./lib/garden-coverage');
function summarize(panel) {
  if (!panel.sourcesStable || !panel.rows?.length) throw new Error('A source-stable deed panel is required');
  const policies = [];
  for (const policy of panel.policies) {
    const runs = panel.rows.filter(r => r.row.policy === policy);
    if (runs.length !== panel.seeds.length || new Set(runs.map(r => r.row.seed)).size !== runs.length || runs.some(r => !panel.seeds.includes(r.row.seed))) throw new Error('Incomplete/duplicate cohort ' + policy);
    const totals = { runs: runs.length, closedDays: 0, unstableDays: 0, unknownDays: 0, eligibleDays: 0,
      demandKnownDays: 0, demandUnknownDays: 0, npcMealCount: 0, npcNeedKcal: 0, npcOwnKcal: 0, npcRequestedKcal: 0, npcDrawnKcal: 0, npcUnmetKcal: 0, npcFastingMeals: 0, npcZeroRequestMeals: 0, allNpcHaveRequestDays: 0, npcActualNeed: 0, npcRequested: 0,
      allAny: 0, all300: 0, all1000: 0, allNominal: 0, othersAny: 0, others300: 0, others1000: 0, othersNominal: 0 };
    let best = null, bestOthers = null;
    const people = new Map();
    for (const run of runs) {
      if (run.warnings.length || !run.gardenCoverage || run.gardenCoverage.errors.length) throw new Error('Invalid observation ' + policy + '/' + run.row.seed);
      if (!run.gardenCoverage.days.some(d => Object.keys(d.book).length)) throw new Error('No intake receipts observed; coverage is unknown for ' + policy + '/' + run.row.seed);
      for (const day of run.gardenCoverage.days) {
        if (!day.closed) continue;
        totals.closedDays++;
        const c = coverage(day.dawn, day.after, day.book, [day.before, ...(day.atMeal ? [day.atMeal] : [])]);
        if (!c.rosterStable) totals.unstableDays++;
        if (c.unknown.length) totals.unknownDays++;
        if (!c.rosterStable || c.unknown.length || c.required.length < 2) continue;
        totals.eligibleDays++;
        const demand = mealDemand(c.required, day.meals);
        if (!demand.known) totals.demandUnknownDays++;
        else {
          totals.demandKnownDays++; totals.npcMealCount += demand.people.length;
          for (const p of demand.people) {
            totals.npcNeedKcal += p.need; totals.npcOwnKcal += p.ownEat;
            totals.npcRequestedKcal += p.requested; totals.npcDrawnKcal += p.drawn;
            totals.npcUnmetKcal += p.unmet;
            if (p.fasting) totals.npcFastingMeals++;
            if (p.requested === 0) totals.npcZeroRequestMeals++;
          }
          const everyoneRequests = demand.people.every(p => p.requested > 0);
          if (everyoneRequests) totals.allNpcHaveRequestDays++;
          const reaches = (h, field) => demand.people.every(p => (h.portions.find(x => x.eater === p.eater)?.nourishment || 0) >= p[field]);
          if (c.harvesters.some(h => reaches(h, 'need'))) totals.npcActualNeed++;
          if (everyoneRequests && c.harvesters.some(h => reaches(h, 'requested'))) totals.npcRequested++;
        }
        for (const [key, predicate] of Object.entries({ allAny: h => h.minimumNourishment > 0, all300: h => h.minimumNourishment >= 300,
          all1000: h => h.minimumNourishment >= 1000, allNominal: h => h.minimumNominalFraction >= 1,
          othersAny: h => h.minimumOtherNourishment > 0, others300: h => h.minimumOtherNourishment >= 300,
          others1000: h => h.minimumOtherNourishment >= 1000, othersNominal: h => h.minimumOtherNominalFraction >= 1 })) {
          if (c.harvesters.some(predicate)) totals[key]++;
        }
        for (const h of c.harvesters) {
          const value = { seed: run.row.seed, day: day.day, owner: h.id, mouths: c.required.length, ...h };
          if (!best || h.minimumNominalFraction > best.minimumNominalFraction) best = value;
          if (!bestOthers || h.minimumOtherNominalFraction > bestOthers.minimumOtherNominalFraction) bestOthers = value;
          const id = run.row.seed + '/' + h.id;
          if (!people.has(id)) people.set(id, { seed: run.row.seed, owner: h.id, all300: [], allNominal: [], others300: [], othersNominal: [] });
          const p = people.get(id);
          if (h.minimumNourishment >= 300) p.all300.push(day.day);
          if (h.minimumNominalFraction >= 1) p.allNominal.push(day.day);
          if (h.minimumOtherNourishment >= 300) p.others300.push(day.day);
          if (h.minimumOtherNominalFraction >= 1) p.othersNominal.push(day.day);
        }
      }
    }
    policies.push({ policy, ...totals, best, bestOthers,
      sevenDayPeople: Object.fromEntries(['all300', 'allNominal', 'others300', 'othersNominal'].map(k => [k, [...people.values()].filter(p => new Set(p[k]).size >= 7)])) });
  }
  return { interpretation: 'Diagnostic sensitivity only. 300/1000 kcal are reference contributions, not authored deed thresholds. Nominal kcalPerDay is not the health/hearth-adjusted NPC need or the player activity budget. Actual demand comes only from one settled NPC meal per person/day; missing or duplicate settlements are unknown. Requested is the actual post-own-production request, zero during chosen fasts or at the small-request cutoff. NPC need/request views do not measure the bearer diet or author an ascension threshold. Includes all residents or only other residents separately. No ascension gate changes.',
    policies };
}
function markdown(report) {
  const lines = ['# Garden daily coverage diagnostic', '', report.interpretation, '',
    '| Policy | Runs | Closed days | Stable known multi-person days | Any to all | 300 to all | 1000 to all | Nominal diets to all | Any to others | 300 to others | Nominal diets to others |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|'];
  for (const p of report.policies) lines.push(`| ${p.policy} | ${p.runs} | ${p.closedDays} | ${p.eligibleDays} | ${p.allAny} | ${p.all300} | ${p.all1000} | ${p.allNominal} | ${p.othersAny} | ${p.others300} | ${p.othersNominal} |`);
  lines.push('', '| Policy | Days with exact NPC demand | Unknown demand days | NPC meals | Need kcal | Own-food kcal | Requested kcal | Drawn kcal | Unmet kcal | Fasts | No-request meals | Everyone requests days | Own harvest covers NPC needs days | Own harvest covers every positive request days |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const p of report.policies) lines.push(`| ${p.policy} | ${p.demandKnownDays} | ${p.demandUnknownDays} | ${p.npcMealCount} | ${Math.round(p.npcNeedKcal)} | ${Math.round(p.npcOwnKcal)} | ${Math.round(p.npcRequestedKcal)} | ${Math.round(p.npcDrawnKcal)} | ${Math.round(p.npcUnmetKcal)} | ${p.npcFastingMeals} | ${p.npcZeroRequestMeals} | ${p.allNpcHaveRequestDays} | ${p.npcActualNeed} | ${p.npcRequested} |`);
  lines.push('', 'Counts are days where one source reaches every required mouth, never pooled across harvesters. Deaths/departures remain in the raw denominator; changed rosters are reported separately and excluded from this stable-roster sensitivity table. Unclosed days and lone survivors do not establish a village deed.', '');
  return lines.join('\n');
}
if (require.main === module) {
  try {
    const file = process.argv[2], i = process.argv.indexOf('--out'), out = i >= 0 ? process.argv[i + 1] : null;
    if (!file || !out) throw new Error('Usage: node scripts/garden-coverage-report.js <deed-panel.json[.gz]> --out <prefix>');
    const bytes = fs.readFileSync(file), panel = JSON.parse(file.endsWith('.gz') ? zlib.gunzipSync(bytes) : bytes);
    const report = { reporterDigest: crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'), panelDigest: crypto.createHash('sha256').update(bytes).digest('hex'), analyzerDigest: crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, 'lib/garden-coverage.js'))).digest('hex'), ...summarize(panel) };
    fs.writeFileSync(out + '.json', JSON.stringify(report, null, 2) + '\n');
    fs.writeFileSync(out + '.md', markdown(report));
  } catch (e) { console.error(e); process.exitCode = 1; }
}
module.exports = { summarize, markdown };
