#!/usr/bin/env node
// test-inflow-b.js — proof for the inflow attribution instrument.
//
// T1 (fixtures, runs BEFORE the sweep; gates it): classifyInflow
// mapping samples + buildAttributionTable cases (dominant, tie
// break, zero-inflow prior-stock reason, pantryAdd refusal,
// other-stock verbatim, donated-pack).
// T2 (corpus, runs after): 16/16 files, cap0 vs cap1 neutrality
// 8/8, bound-day reproduction vs the substrate corpus, worked ==
// resolutions, no cap hit, attribution rows exactly once per bound
// day, stored attribution == rebuild from raw inflows + day table,
// dominant class on every attributed row matches its byClass max.
//
//   node scripts/test-inflow-b.js
//   node scripts/test-inflow-b.js --corpus evidence/2026-10-26/sim-inflow-b-corpus
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyInflow, buildAttributionTable } = require('./inflow-days');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const fails = [];
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}
function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

// ---- T1: classification mapping ----
const mapCases = [
  [{ door: 'stock', name: 'Garden harvest' }, 'garden'],
  [{ door: 'stock', name: 'Fish catch' }, 'fish'],
  [{ door: 'stock', name: 'Foraged food' }, 'forage'],
  [{ door: 'stock', name: 'Game meat' }, 'hunt'],
  [{ door: 'stock', name: 'Snared meat' }, 'hunt'],
  [{ door: 'stock', name: 'Pit meat (rabbit)' }, 'hunt'],
  [{ door: 'stock', name: 'Expedition meat' }, 'hunt'],
  [{ door: 'stock', name: 'Emergency hunt meat' }, 'hunt'],
  [{ door: 'stock', name: 'Expedition haul' }, 'expedition'],
  [{ door: 'stock', name: 'Aid from Riverton' }, 'trade-aid'],
  [{ door: 'stock', name: 'Aid crew haul' }, 'trade-aid'],
  [{ door: 'stock', name: 'Remedy stores from Riverton' }, 'trade-aid'],
  [{ door: 'stock', name: 'Restitution' }, 'trade-aid'],
  [{ door: 'stock', name: 'Weregild' }, 'trade-aid'],
  [{ door: 'stock', name: 'Refunded trade goods' }, 'trade-aid'],
  [{ door: 'stock', name: 'Ration returned' }, 'trade-aid'],
  [{ door: 'stock', name: 'Trial feast' }, 'system-feast'],
  [{ door: 'stock', name: 'System-replicated stew' }, 'system-feast'],
  [{ door: 'stock', name: 'Genesis fruit' }, 'system-feast'],
  [{ door: 'stock', name: "Hoarder's interest" }, 'system-feast'],
  [{ door: 'stock', name: 'Meal leftovers' }, 'system-feast'],
  [{ door: 'deposit', name: 'Roasted rabbit' }, 'donated-pack'],
  [{ door: 'deposit', name: 'Tribute grain from Riverton' }, 'donated-pack'],
  [{ door: 'pantryAdd', name: 'Cooked stew', added: true }, 'finished-putaway'],
  [{ door: 'pantryAdd', name: 'Cooked stew', added: false }, null],
  [{ door: 'stock', name: 'Something entirely new' }, 'other-stock'],
  [{ door: 'stock', name: null }, 'other-stock'],
];
for (const [rec, want] of mapCases) {
  check('T1 classify ' + rec.door + ':' + rec.name, classifyInflow(rec) === want, 'got ' + classifyInflow(rec) + ' want ' + want);
}

// ---- T1: attribution cases ----
const dayTable = [
  { day: 10, pantryFirst: 40000, preservedFirst: 15000, freshFirst: 20, pantryLast: 41000 },
  { day: 11, pantryFirst: 42000, preservedFirst: 15000, freshFirst: 22, pantryLast: 42000 },
  { day: 12, pantryFirst: 43000, preservedFirst: 15000, freshFirst: 25, pantryLast: 43000 },
  { day: 13, pantryFirst: 44000, preservedFirst: 15000, freshFirst: 26, pantryLast: 44000 },
];
const inflows = [
  { seq: 1, day: 10, door: 'stock', name: 'Garden harvest', kcal: 800 },
  { seq: 2, day: 10, door: 'stock', name: 'Fish catch', kcal: 500 },
  { seq: 3, day: 10, door: 'stock', name: 'Foraged food', kcal: 300 },
  // day 11: tie garden/fish at 600 — earliest arrival (garden seq 4) wins
  { seq: 4, day: 11, door: 'stock', name: 'Garden harvest', kcal: 600 },
  { seq: 5, day: 11, door: 'stock', name: 'Fish catch', kcal: 600 },
  // day 12: no inflow at all -> prior-stock reason
  // day 13: pantryAdd refused (0) + a real deposit -> donated-pack
  { seq: 6, day: 13, door: 'pantryAdd', name: 'Cooked stew', kcal: 900, added: false },
  { seq: 7, day: 13, door: 'deposit', name: 'Roasted rabbit', kcal: 400 },
  { seq: 8, day: 13, door: 'stock', name: 'Mystery ration', kcal: 100 },
];
const rows = buildAttributionTable(dayTable, inflows);
check('T1 rows == bound days', rows.length === 4, 'got ' + rows.length);
const r10 = rows.find(r => r.day === 10);
check('T1 d10 dominant garden', r10 && r10.dominantClass === 'garden' && r10.dominantKcal === 800 && r10.totalInflowKcal === 1600 && r10.attributed, JSON.stringify(r10));
check('T1 d10 dominant share', r10 && Math.abs(r10.dominantShare - 0.5) < 1e-9, String(r10 && r10.dominantShare));
const r11 = rows.find(r => r.day === 11);
check('T1 d11 tie -> earliest garden', r11 && r11.dominantClass === 'garden', JSON.stringify(r11));
const r12 = rows.find(r => r.day === 12);
check('T1 d12 unattributed + prior-stock reason', r12 && !r12.attributed && r12.dominantClass === null && typeof r12.reason === 'string' && r12.reason.indexOf('prior-stock') === 0 && r12.reason.indexOf('43000') >= 0, JSON.stringify(r12));
const r13 = rows.find(r => r.day === 13);
check('T1 d13 refused ignored, donated-pack dominant', r13 && r13.dominantClass === 'donated-pack' && r13.totalInflowKcal === 500 && r13.refusedPantryAdd === 1, JSON.stringify(r13));
check('T1 d13 other-stock verbatim kept', r13 && r13.namesByClass['other-stock'] && r13.namesByClass['other-stock']['Mystery ration'] === 100, JSON.stringify(r13.namesByClass));

// ---- T1: wrapper hygiene (static) ----
const capSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'inflow-capture.js'), 'utf8');
check('T1 inflow-capture delegates stock', /origStock\.apply\(this, arguments\)/.test(capSrc), '');
check('T1 inflow-capture delegates deposit', /origDeposit\.apply\(this, arguments\)/.test(capSrc), '');
check('T1 inflow-capture delegates pantryAdd', /origPantryAdd\.apply\(this, arguments\)/.test(capSrc), '');
check('T1 inflow-capture writes no Game.state', !/Game\.state\s*=|state\.village\s*=|state\.pantry/.test(capSrc), '');
check('T1 inflow-capture consumes no RNG', !/Math\.random/.test(capSrc), '');
check('T1 substrate-capture reused unchanged (no inflow edits)', !/inflow/.test(fs.readFileSync(path.join(ROOT, 'scripts', 'substrate-capture.js'), 'utf8')), '');
check('T1 substrate-days reused unchanged (no inflow edits)', !/inflow/.test(fs.readFileSync(path.join(ROOT, 'scripts', 'substrate-days.js'), 'utf8')), '');

// ---- T2: corpus ----
const corpusArg = getArg('--corpus');
if (corpusArg) {
  const corpusDir = path.isAbsolute(corpusArg) ? corpusArg : path.join(ROOT, corpusArg);
  const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
  const load = (cap, seed) => JSON.parse(fs.readFileSync(path.join(corpusDir, `inflow-b-cap${cap}-pd0-dg1-competent-nofeast-s${seed}.json`), 'utf8'));
  let filesOk = true;
  const caps = {};
  for (const cap of [0, 1]) {
    caps[cap] = {};
    for (const s of seeds) {
      try { caps[cap][s] = load(cap, s); }
      catch (e) { filesOk = false; console.log('FAIL T2 missing/unparsable cap' + cap + ' s' + s + ' :: ' + e.message); }
    }
  }
  check('T2 16/16 files present and parsing', filesOk, '');
  if (filesOk) {
    const numFields = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions', 'deaths', 'national', 'table', 'win', 'endReason'];
    for (const s of seeds) {
      const a = caps[0][s], b = caps[1][s];
      const same = numFields.every(f => JSON.stringify(a[f]) === JSON.stringify(b[f])) &&
        JSON.stringify(a.deathCauses) === JSON.stringify(b.deathCauses) &&
        JSON.stringify(a.waveReach) === JSON.stringify(b.waveReach) && a.rank === b.rank;
      check('T2 neutrality s' + s, same, 'cap0=' + JSON.stringify(numFields.map(f => a[f])) + ' cap1=' + JSON.stringify(numFields.map(f => b[f])));
      check('T2 worked == resolutions s' + s, b.workedLines === b.preserveVillagerResolutions, 'worked=' + b.workedLines + ' res=' + b.preserveVillagerResolutions);
      check('T2 no cap hit s' + s, !b.cookTruncated && !b.eventTruncated && !b.inflowTruncated, 'cookT=' + b.cookTruncated + ' evT=' + b.eventTruncated + ' inT=' + b.inflowTruncated);
      check('T2 batches >= resolutions s' + s, b.preserveVillagerBatches >= b.preserveVillagerResolutions, '');
      // attribution rebuild equality
      const rebuilt = buildAttributionTable(b.dayTable, b.inflows);
      check('T2 attribution rebuild == stored s' + s, JSON.stringify(rebuilt) === JSON.stringify(b.attributionTable), '');
      check('T2 attribution rows == bound days s' + s, b.attributionTable.length === b.racksBoundDays, rebuilt.length + ' vs ' + b.racksBoundDays);
      for (const r of b.attributionTable) {
        if (!r.attributed) {
          check('T2 unattributed row has prior-stock reason s' + s + ' d' + r.day, typeof r.reason === 'string' && r.reason.indexOf('prior-stock') === 0, JSON.stringify(r));
        } else {
          const mx = Math.max.apply(null, Object.keys(r.byClass).map(k => r.byClass[k]));
          check('T2 dominant == byClass max s' + s + ' d' + r.day, r.dominantKcal === mx && r.byClass[r.dominantClass] === mx, JSON.stringify(r));
        }
      }
    }
    // bound-day reproduction vs substrate corpus
    const subDir = path.join(ROOT, 'evidence', '2026-10-26', 'sim-substrate-b-corpus');
    let subOk = true, subTotal = 0, newTotal = 0;
    for (const s of seeds) {
      try {
        const sub = JSON.parse(fs.readFileSync(path.join(subDir, `substrate-b-cap1-pd0-dg1-competent-nofeast-s${s}.json`), 'utf8'));
        const subDays = (sub.dayTable || []).map(d => d.day);
        const newDays = (caps[1][s].dayTable || []).map(d => d.day);
        subTotal += subDays.length; newTotal += newDays.length;
        if (JSON.stringify(subDays) !== JSON.stringify(newDays)) { subOk = false; console.log('NOTE T2 bound-day drift s' + s + ': substrate=' + subDays.length + ' inflow=' + newDays.length); }
      } catch (e) { subOk = false; console.log('FAIL T2 substrate corpus read s' + s + ' :: ' + e.message); }
    }
    console.log('T2 bound-day totals: substrate=' + subTotal + ' inflow=' + newTotal);
    check('T2 bound-day reproduction totals', subTotal === newTotal, 'substrate ' + subTotal + ' inflow ' + newTotal);
    if (!subOk) console.log('T2 bound-day day-lists differ on some seed (see NOTE lines above; verdict must name the drift)');
  }
}

console.log('test-inflow-b: ' + pass + ' PASS / ' + fail + ' FAIL');
if (fail) { console.log('FAILURES:'); for (const f of fails) console.log(' - ' + f); }
process.exit(fail ? 1 : 0);
