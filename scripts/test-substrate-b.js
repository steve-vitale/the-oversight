#!/usr/bin/env node
// test-substrate-b.js — fixture checks (T1, before sweep) + corpus
// assertions (T2, after sweep). Usage:
//   node scripts/test-substrate-b.js            # T1 only
//   node scripts/test-substrate-b.js --corpus   # T1 + T2
'use strict';
const fs = require('fs');
const path = require('path');
const { buildDayTable } = require('./substrate-days');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function cook(day, cookName, frame, racksFull, extra) {
  return Object.assign({ day, cook: cookName, frame, resIndex: 1,
    racksFull: !!racksFull, eligiblePresent: true, eligibleCount: 1,
    eligibleKcal: 1000, preservedKcal: 20000, rackCap: 16000,
    pantryKcal: 50000, freshDays: 6, throttleEngaged: true },
    extra || {});
}
function ev(day, kind, name, extra) {
  return Object.assign({ day, kind, name: name || null }, extra || {});
}

// ---- T1: day-classification fixtures (exhaustive over (F, R)) ----
(function t1() {
  // S-THROTTLED: racks-bound day, 2 redirects, 0 returns.
  let days = buildDayTable(
    [cook(10, 'Miguel', 'racksFull', true)],
    [ev(10, 'throttleRedirect', 'Grace', { fromTask: 'forage', altTask: 'wood run' }),
     ev(10, 'throttleRedirect', 'Paramjit', { fromTask: 'forage', altTask: 'water run' })]);
  check('T1 throttled class', days.length === 1 && days[0].class === 'S-THROTTLED', JSON.stringify(days));
  check('T1 throttled assigned=2', days[0] && days[0].assignedForageCount === 2, JSON.stringify(days[0]));
  // S-THROTTLED-PARTIAL: 1 return + 1 redirect.
  days = buildDayTable(
    [cook(11, 'Miguel', 'plain', true)],
    [ev(11, 'forageReturn', 'Grace', { kcal: 500 }),
     ev(11, 'throttleRedirect', 'Paramjit', { fromTask: 'forage', altTask: 'stone pile' })]);
  check('T1 partial class', days.length === 1 && days[0].class === 'S-THROTTLED-PARTIAL', JSON.stringify(days));
  check('T1 partial kcal', days[0] && days[0].forageKcal === 500, JSON.stringify(days[0]));
  // S-FORAGED: returns only.
  days = buildDayTable(
    [cook(12, 'Miguel', 'racksFull', true)],
    [ev(12, 'forageReturn', 'Grace', { kcal: 400 }), ev(12, 'forageReturn', 'Zoe', { kcal: 600 })]);
  check('T1 foraged class', days.length === 1 && days[0].class === 'S-FORAGED', JSON.stringify(days));
  check('T1 foraged assigned=2', days[0] && days[0].assignedForageCount === 2, JSON.stringify(days[0]));
  // S-NO-FORAGE-DUTY: racks-bound day, no forage events at all.
  days = buildDayTable([cook(13, 'Miguel', 'plain', true)], []);
  check('T1 no-duty class', days.length === 1 && days[0].class === 'S-NO-FORAGE-DUTY', JSON.stringify(days));
  // Garden/fish redirects do NOT count as forage redirects.
  days = buildDayTable(
    [cook(14, 'Miguel', 'racksFull', true)],
    [ev(14, 'throttleRedirect', 'Grace', { fromTask: 'fish nets', altTask: 'wood run' })]);
  check('T1 garden/fish redirect is not forage', days.length === 1 && days[0].class === 'S-NO-FORAGE-DUTY' && days[0].gardenFishRedirects === 1, JSON.stringify(days));
  // Non-racks-bound days never appear, even with forage events.
  days = buildDayTable(
    [cook(15, 'Miguel', 'plain', false), cook(15, 'Miguel', 'worked', false)],
    [ev(15, 'forageReturn', 'Grace', { kcal: 500 })]);
  check('T1 non-bound day excluded', days.length === 0, JSON.stringify(days));
  // Silenced plain racksFull marks a day bound; spoken + silenced counted.
  days = buildDayTable(
    [cook(16, 'Miguel', 'racksFull', true), cook(16, 'Grace', 'plain', true)],
    [ev(16, 'forageReturn', 'Grace', { kcal: 500 })]);
  check('T1 silenced marks bound', days.length === 1 && days[0].racksFullSpoken === 1 && days[0].silenced === 1, JSON.stringify(days));
  // Worked racksFull is an anomaly, not a bound marker.
  days = buildDayTable([cook(17, 'Miguel', 'worked', true)], []);
  check('T1 worked-racksFull anomaly not bound', days.length === 0, JSON.stringify(days));
  // Eligible-any + pantry snapshot first/last.
  days = buildDayTable(
    [cook(18, 'Miguel', 'racksFull', true, { pantryKcal: 40000, eligiblePresent: false }),
     cook(18, 'Grace', 'plain', true, { pantryKcal: 41000, eligiblePresent: true, eligibleKcal: 2400 })],
    []);
  check('T1 eligibleAny + pantry first/last', days.length === 1 && days[0].eligibleAny === true && days[0].pantryFirst === 40000 && days[0].pantryLast === 41000 && days[0].eligibleKcalMax === 2400, JSON.stringify(days));
  // Exempt + rest are attributes, never classes.
  days = buildDayTable(
    [cook(19, 'Miguel', 'racksFull', true)],
    [ev(19, 'throttleExempt', 'Grace', { fromTask: 'forage' }), ev(19, 'fitnessRest', 'Zoe')]);
  check('T1 exempt/rest attributes', days.length === 1 && days[0].class === 'S-NO-FORAGE-DUTY' && days[0].exemptLines === 1 && days[0].restLines === 1, JSON.stringify(days));
  // Same name returning twice counts once in assigned, twice in returns.
  days = buildDayTable(
    [cook(20, 'Miguel', 'racksFull', true)],
    [ev(20, 'forageReturn', 'Grace', { kcal: 300 }), ev(20, 'forageReturn', 'Grace', { kcal: 300 })]);
  check('T1 assigned dedup', days.length === 1 && days[0].forageReturns === 2 && days[0].assignedForageCount === 1, JSON.stringify(days));
})();

// ---- T2: corpus assertions ----
if (process.argv.includes('--corpus')) {
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-substrate-b-corpus');
  const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
  const bySeed = {};
  for (const seed of seeds) {
    for (const cap of [0, 1]) {
      const f = path.join(dir, `substrate-b-cap${cap}-pd0-dg1-competent-nofeast-s${seed}.json`);
      check('T2 file present ' + seed + ' cap' + cap, fs.existsSync(f), f);
      if (!fs.existsSync(f)) continue;
      let j;
      try { j = JSON.parse(fs.readFileSync(f, 'utf8')); }
      catch (e) { check('T2 parses ' + seed + ' cap' + cap, false, String(e)); continue; }
      check('T2 parses ' + seed + ' cap' + cap, true);
      bySeed[seed] = bySeed[seed] || {};
      bySeed[seed][cap] = j;
      check('T2 batches>=resolutions ' + seed + ' cap' + cap, j.preserveVillagerBatches >= j.preserveVillagerResolutions,
        'batches=' + j.preserveVillagerBatches + ' res=' + j.preserveVillagerResolutions);
      if (cap === 1) {
        check('T2 worked==resolutions ' + seed, j.workedLines === j.preserveVillagerResolutions,
          'worked=' + j.workedLines + ' res=' + j.preserveVillagerResolutions);
        check('T2 cook under cap ' + seed, j.sayTotal < 1000 && !j.cookTruncated, 'sayTotal=' + j.sayTotal);
        check('T2 events under cap ' + seed, !j.eventTruncated, 'eventSeen=' + j.eventSeen);
        // Day table recomputed from raw equals stored day table.
        const rebuilt = buildDayTable(j.cookLines, j.events);
        check('T2 day table rebuild matches ' + seed, JSON.stringify(rebuilt.map(d => d.class)) === JSON.stringify((j.dayTable || []).map(d => d.class))
          && rebuilt.length === (j.dayTable || []).length, 'rebuilt=' + rebuilt.length + ' stored=' + (j.dayTable || []).length);
        check('T2 every day has exactly one class ' + seed, (j.dayTable || []).every(d => ['S-THROTTLED', 'S-THROTTLED-PARTIAL', 'S-FORAGED', 'S-NO-FORAGE-DUTY'].includes(d.class)));
        check('T2 class counts sum to day count ' + seed, Object.values(j.classCounts || {}).reduce((a, b) => a + b, 0) === (j.dayTable || []).length);
        check('T2 racksBoundDays field matches ' + seed, j.racksBoundDays === (j.dayTable || []).length);
        // Every racks-bound day in raw cook lines appears in the table.
        const rawBoundDays = new Set();
        for (const c of (j.cookLines || [])) if (c.frame === 'racksFull' || (c.frame === 'plain' && c.racksFull)) rawBoundDays.add(c.day);
        const tableDays = new Set((j.dayTable || []).map(d => d.day));
        check('T2 no missing racks-bound day ' + seed, rawBoundDays.size === tableDays.size && [...rawBoundDays].every(d => tableDays.has(d)),
          'raw=' + rawBoundDays.size + ' table=' + tableDays.size);
      }
    }
  }
  // Neutrality: cap0 vs cap1 numeric fields identical on 8/8 seeds.
  const fields = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions',
    'deaths', 'national', 'table', 'win', 'rank', 'endReason'];
  for (const seed of seeds) {
    const a = bySeed[seed] && bySeed[seed][0], b = bySeed[seed] && bySeed[seed][1];
    if (!a || !b) { check('T2 neutrality pair present ' + seed, false); continue; }
    let ok = true, bad = '';
    for (const f of fields) if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) { ok = false; bad = f + ': ' + JSON.stringify(a[f]) + ' vs ' + JSON.stringify(b[f]); }
    if (JSON.stringify(a.waveReach) !== JSON.stringify(b.waveReach)) { ok = false; bad = 'waveReach'; }
    if (JSON.stringify(a.deathCauses) !== JSON.stringify(b.deathCauses)) { ok = false; bad = 'deathCauses'; }
    check('T2 neutrality ' + seed, ok, bad);
  }
}

console.log('test-substrate-b: ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
