#!/usr/bin/env node
// sortietarget-analyze.js — aggregate pilot/confirm per-seed JSONs into the
// pre-registered agreement + regression table.
// Usage: node scripts/sortietarget-analyze.js <per-seed-dir> <run-tag>
// Prints a JSON summary to stdout. Agreement definitions (prereg):
// - aimed sortie: an answer call with argKey (variant) — or, for the
//   baseline gap leg, any ok sortie (its "target" is the latest offer,
//   which the baseline cannot pass; the gap leg compares fought[0] to
//   the offer the policy WOULD have aimed at, recorded in policyCalls).
// - multi-sortie: raidersAtStart >= 2. first-fought agreement:
//   fought[0].key == target key. target-fought: key appears in fought.
// - fire count: total fought entries; reported with every number.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const run = process.argv[3] || '';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && (!run || f.includes(run))).sort();

const arms = {};
for (const f of files) {
  const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const a = (arms[row.arm] = arms[row.arm] || { seeds: [], calls: [], okCalls: [],
    multi: [], aimed: [], aimedMulti: [], fire: 0, matched: 0, wins: 0, national: 0,
    tableDone: 0, deaths: 0, attempts: 0, policyCalls: 0, errors: [] });
  a.seeds.push(row.seed);
  a.wins += row.won || 0; a.national += row.national || 0; a.tableDone += row.tableDone || 0;
  a.deaths += row.deaths || 0; a.attempts += row.answerCount || 0; a.policyCalls += row.policyCallCount || 0;
  for (const e of (row.errors || [])) a.errors.push(`s${row.seed}: ${e}`);
  for (const c of (row.answerCalls || [])) {
    a.calls.push(c);
    if (!c.ok) continue;
    a.okCalls.push(c);
    a.fire += (c.fought || []).length;
    if (c.targetMatched) a.matched++;
    const multi = (c.raidersAtStart || 0) >= 2;
    if (multi) a.multi.push(c);
    // Aimed = variant call carrying a key, or any call whose policy record
    // names an offer key (baseline policyCalls carry offerKey too).
    // One answer per day max, so day uniquely joins driver + policy records.
    const pc = (row.policyCalls || []).find(p => p.day === c.day);
    const targetKey = c.argKey || (pc && pc.offerKey) || null;
    if (targetKey) {
      const rec = { seed: row.seed, day: c.day, targetKey, multi,
        foughtKeys: (c.fought || []).map(x => x.key),
        firstIsTarget: (c.fought || []).length > 0 && (c.fought[0].key === targetKey),
        targetFought: (c.fought || []).some(x => x.key === targetKey),
        targetMatched: !!c.targetMatched, raidersAtStart: c.raidersAtStart || 0 };
      a.aimed.push(rec);
      if (multi) a.aimedMulti.push(rec);
    }
  }
}

const summary = {};
for (const [arm, a] of Object.entries(arms)) {
  const agree = arr => arr.length ? arr.filter(x => x.firstIsTarget).length + '/' + arr.length : 'n/a';
  const fought = arr => arr.length ? arr.filter(x => x.targetFought).length + '/' + arr.length : 'n/a';
  summary[arm] = {
    seeds: a.seeds.length, seedList: a.seeds,
    answerCalls: a.calls.length, okCalls: a.okCalls.length,
    fireCount: a.fire, targetMatchedCalls: a.matched,
    aimedSorties: a.aimed.length, aimedMulti: a.aimedMulti.length,
    firstFoughtAgreement_aimedMulti: agree(a.aimedMulti),
    firstFoughtAgreement_aimedAll: agree(a.aimed),
    targetFought_aimedAll: fought(a.aimed),
    targetFought_aimedMulti: fought(a.aimedMulti),
    multiOkSorties: a.multi.length,
    wins: a.wins, national: a.national, tableDone: a.tableDone,
    deaths: a.deaths, errors: a.errors,
  };
}
console.log(JSON.stringify(summary, null, 2));
