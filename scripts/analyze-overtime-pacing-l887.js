#!/usr/bin/env node
// analyze-overtime-pacing-l887.js — judge the L887 overtime-pacing sweep
// against its pre-registration header (evidence/2026-10-24/
// l887-overtime-pacing-prereg.md). No re-scoring: the header's PRIMARY and
// guardrails decide GO/NO-GO. Usage:
//   node scripts/analyze-overtime-pacing-l887.js <control-dir> <armed-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
function loadDir(dir) {
  const out = [];
  for (const fn of fs.readdirSync(dir).sort()) {
    if (!fn.endsWith('.json')) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8')));
  }
  return out;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function maxTierAt(rows) {
  let m = 0;
  for (const r of rows || []) {
    const t = (r.overtime && r.overtime.tier != null) ? r.overtime.tier : r.overtimeTier;
    if (typeof t === 'number' && t > m) m = t;
  }
  return m;
}
function eulogyDeaths(rows) {
  return (rows || []).filter(r => /eulogy/i.test(String((r.oppMid || '') + ' ' + (r.cause || '')))).length;
}
function summarize(rows, label) {
  const doors = rows.filter(r => r.doorDay != null);
  const pd = doors.map(r => r.postDoor);
  const seats = rows.reduce((a, r) => a + r.seats, 0);
  const wins = rows.reduce((a, r) => a + r.won, 0);
  const nat = rows.reduce((a, r) => a + r.national, 0);
  const tab = rows.reduce((a, r) => a + r.table, 0);
  console.log(`--- ${label} ---`);
  console.log(`configs: ${rows.length}, doors: ${doors.length}, door seeds: ${[...new Set(doors.map(r => r.seed))].join(',') || 'none'}`);
  console.log(`post-door survivals (door configs): [${pd.join(', ')}] median=${median(pd)}`);
  console.log(`seats: ${seats}, wins: ${wins}, national: ${nat}/${rows.length}, table: ${tab}/${rows.length}`);
  for (const r of rows) {
    const ds = r.doorSnapshot || {};
    console.log(`  s${r.seed}-${r.base === 'belongfeast' ? 'belong' : 'lead'}: door=${r.doorDay} lost=${r.gameDays} postDoor=${r.postDoor} nat=${r.national} tab=${r.table} seats=${r.seats} won=${r.won} otDays=${r.otDays} maxDeathTier=${maxTierAt(r.postunlockDeaths)} maxFightTier=${maxTierAt(r.postunlockFights)} eulogyDeaths=${eulogyDeaths(r.postunlockDeaths)} doorVets=${ds.veterans != null ? JSON.stringify(ds.veterans) : 'n/a'} errs=${(r.instrumentErrors || []).length}`);
  }
  return { median: median(pd), seats, wins, nat, tab, n: rows.length, doors: doors.length };
}
const [cDir, aDir] = process.argv.slice(2);
if (!cDir || !aDir) { console.error('usage: node scripts/analyze-overtime-pacing-l887.js <control-dir> <armed-dir>'); process.exit(2); }
const c = summarize(loadDir(path.isAbsolute(cDir) ? cDir : path.join(REPO, cDir)), 'CONTROL');
const a = summarize(loadDir(path.isAbsolute(aDir) ? aDir : path.join(REPO, aDir)), 'ARMED');
console.log('--- PRIMARY (pre-registered) ---');
console.log(`armed median ${a.median} >= control median ${c.median} + 20 = ${(c.median == null ? 'n/a' : c.median + 20)} ? ${a.median != null && c.median != null && a.median >= c.median + 20}`);
console.log(`seats armed ${a.seats} >= seats control ${c.seats} ? ${a.seats >= c.seats}`);
console.log('--- GUARDRAILS ---');
console.log(`wins armed ${a.wins} >= wins control ${c.wins} ? ${a.wins >= c.wins}`);
console.log(`national armed ${a.nat}/${a.n} vs control ${c.nat}/${c.n} (not lower) ? ${a.nat >= c.nat}`);
console.log(`table armed ${a.tab}/${a.n} vs control ${c.tab}/${c.n} (not lower) ? ${a.tab >= c.tab}`);
const go = a.median != null && c.median != null && a.median >= c.median + 20 && a.seats >= c.seats && a.wins >= c.wins && a.nat >= c.nat && a.tab >= c.tab;
console.log(`VERDICT: ${go ? 'GO' : 'NO-GO'} (header as written; pilot stage prints GO, full band prints the confirm verdict — see evidence for which stage this is)`);
