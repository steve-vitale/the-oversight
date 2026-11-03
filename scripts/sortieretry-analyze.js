#!/usr/bin/env node
// sortieretry-analyze.js — aggregate pilot/confirm per-seed JSONs into the
// pre-registered suppression + value + wall table.
// Usage: node scripts/sortieretry-analyze.js <per-seed-dir> <run-tag>
// Denominators explicit: answers (all calls), ok sorties, 'none' calls,
// 'no-fighters' calls. Multi-only agreement: ok sorties with
// raidersAtStart >= 2, first-fought key == passed argKey.
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
    multi: [], aimedMulti: [], fire: 0, matched: 0, wins: 0, national: 0,
    tableDone: 0, deaths: 0, attempts: 0, noneCalls: 0, noFighters: 0,
    invalidations: 0, errors: [] });
  a.seeds.push(row.seed);
  a.wins += row.won || 0; a.national += row.national || 0; a.tableDone += row.tableDone || 0;
  a.deaths += row.deaths || 0; a.attempts += row.answerCount || 0;
  a.invalidations += row.invalidations || 0;
  for (const e of (row.errors || [])) a.errors.push(`s${row.seed}: ${e}`);
  for (const c of (row.answerCalls || [])) {
    a.calls.push(c);
    if (c.why === 'none') a.noneCalls++;
    if (c.why === 'no-fighters') a.noFighters++;
    if (!c.ok) continue;
    a.okCalls.push(c);
    a.fire += (c.fought || []).length;
    if (c.targetMatched) a.matched++;
    const multi = (c.raidersAtStart || 0) >= 2;
    if (multi) a.multi.push(c);
    const pc = (row.policyCalls || []).find(p => p.day === c.day);
    const targetKey = c.argKey || (pc && (pc.headKey || pc.offerKey)) || null;
    if (targetKey && multi) {
      a.aimedMulti.push({ seed: row.seed, day: c.day, targetKey,
        foughtKeys: (c.fought || []).map(x => x.key),
        firstIsTarget: (c.fought || []).length > 0 && (c.fought[0].key === targetKey),
        targetFought: (c.fought || []).some(x => x.key === targetKey) });
    }
  }
}

const summary = {};
for (const [arm, a] of Object.entries(arms)) {
  const agree = arr => arr.length ? arr.filter(x => x.firstIsTarget).length + '/' + arr.length : 'n/a';
  summary[arm] = {
    seeds: a.seeds.length, seedList: a.seeds,
    answers: a.calls.length, okSorties: a.okCalls.length,
    noneCalls: a.noneCalls, noFightersCalls: a.noFighters,
    okPerAnswer: a.calls.length ? (a.okCalls.length / a.calls.length).toFixed(3) : 'n/a',
    nonePerAnswer: a.calls.length ? (a.noneCalls / a.calls.length).toFixed(3) : 'n/a',
    fireCount: a.fire, targetMatchedCalls: a.matched,
    multiOkSorties: a.multi.length,
    firstFoughtAgreement_aimedMultiOnly: agree(a.aimedMulti),
    invalidations: a.invalidations,
    wins: a.wins, national: a.national, tableDone: a.tableDone,
    deaths: a.deaths, errors: a.errors,
  };
}
console.log(JSON.stringify(summary, null, 2));
