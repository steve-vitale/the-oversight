#!/usr/bin/env node
// analyze-journey-establishment-meatchannel-20261027.js — panel verdicts
// for the Triage A3 meat-channel fix. Reads EVID/journey-establishment-
// meatchannel-seed*.json (SEEDS env, default the r48 seeds) and prints the
// pre-registered bars P1 (player tests + cooked stacks) and P2 (no stale
// 0-kcal stack at panel end). Run after the meatchannel driver.
// Usage: EVID=/tmp/meatpanel node scripts/analyze-journey-establishment-meatchannel-20261027.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.env.EVID || '/tmp/meatpanel';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [209, 228, 238, 239]);
const load = (s) => JSON.parse(fs.readFileSync(`${EVID}/journey-establishment-meatchannel-seed${s}.json`, 'utf8'));
const monIds = new Set((() => {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    return (Array.isArray(m) ? m : m.monsters).map(x => x.id);
  } catch (e) { return []; }
})());
const isMon = (pid) => {
  const mid = String(pid || '').replace(/^meat_/, '');
  return monIds.has(mid) || mid === 'belltoad_legs';
};

let totTests = 0, totCookRows = 0, p2fail = 0;
for (const s of SEEDS) {
  const d = load(s);
  const tr = d.meatTrace || [];
  const stacks = [];
  for (const r of tr) for (const loc of ['pantry', 'pack', 'prep']) for (const it of (r[loc] || [])) stacks.push({ day: r.day, loc, ...it });
  const cookedRows = stacks.filter(x => isMon(x.plantId) && ['cooked', 'smoked', 'rendered', 'pemmican', 'dried'].includes(x.foodState || '')).length;
  const tests = (d.meatTestCalls || []).length;
  totTests += tests; totCookRows += cookedRows;
  const endDay = tr.length ? tr[tr.length - 1].day : 0;
  const firstSeen = {};
  for (const x of stacks) {
    const k = `${x.loc}:${x.plantId}`;
    if (firstSeen[k] === undefined) firstSeen[k] = x.day;
  }
  const endStacks = [];
  for (const loc of ['pantry', 'pack', 'prep']) for (const it of ((d.meatEnd || {})[loc] || [])) endStacks.push({ loc, ...it });
  const staleZero = endStacks.filter(it => isMon(it.plantId) && (it.kcalEach || 0) <= 0 && (firstSeen[`${it.loc}:${it.plantId}`] || 0) <= endDay - 2);
  if (staleZero.length) p2fail += staleZero.length;
  const g = d.guardrails || {};
  console.log(`  ${s}: policy=${d.policy} tests=${tests} cookedRows=${cookedRows} endDay=${endDay} staleZeroEnd=${staleZero.length} deaths=${g.deaths} popAlive=${g.popAlive}`);
  console.log(`    end stacks: [${endStacks.map(it => `${it.loc}:${it.plantId}x${it.units}@${it.kcalEach}/${it.foodState}/spoil${it.spoilDay}`).join(', ')}]`);
  console.log(`    codex: ${JSON.stringify((d.meatEnd || {}).codexTested || [])}`);
  console.log(`    testCalls: ${JSON.stringify((d.meatTestCalls || []).map(c => `${c.day}:${c.container}`))}`);
}
console.log(`PANEL: playerTests=${totTests} (bar >0) cookedRows=${totCookRows} (bar >0) staleZeroEndStacks=${p2fail} (bar 0)`);
console.log(`P1 ${totTests > 0 && totCookRows > 0 ? 'GO' : 'NO-GO'} | P2 ${p2fail === 0 ? 'GO' : 'NO-GO'}`);
