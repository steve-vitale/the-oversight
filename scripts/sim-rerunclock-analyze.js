#!/usr/bin/env node
// sim-rerunclock-analyze.js — rerun-clock census + trajectory report for
// arm sim-rerunclock. Namespace sim-rerunclock-*.
// Reads evidence/2026-10-24/perseed-rerunclock/ and writes
// sim-rerunclock-attribution.json next to the corpus. Reports:
//   1. Census: per-config w4/w5 days, end, national/table/wins, maxWave.
//   2. Wall numbers: national / table / wins, wave 4-5 unlocks, median
//      survival, per the single competent policy.
//   3. Qualifying configs (national==1 OR door w5Day!=null): the FULL
//      overtime-tier trajectory (nationalDay, tableDay, tierFirst 1..6,
//      tierAtNational, tierAtDoor, tierAtEnd, daysAtTier) + rerun-fight
//      counts (all / w4 / w5 / post-national / post-door / post-window)
//      + killerClass. A qualifying config without a trajectory is
//      unattributed and fails the DIAG bar — the analyzer says so.
//   4. Census verdict (PRE-REGISTERED rule, not a judgement call):
//      'rerun-clock' iff a majority of LOST qualifying configs classify
//      rerun-clock; 'single-apex' iff a majority classify single-apex;
//      'mixed/other' otherwise; 'no lost qualifying configs' /
//      'no qualifying configs' when those populations are empty.
//   5. DIAG bar: censusComplete AND every qualifying config trajectory-
//      attributed AND verdict named (always named by the rule above when
//      the census is complete — the bar's bite is completeness, and the
//      verdict's honesty is the rule, not a re-score).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-rerunclock');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [73101, 73102, 73103, 73104, 73105, 73106, 73107, 73108]).filter(Number.isFinite);
const CONFIGS = [];
const missing = [];
for (const s of SEEDS) {
  const fn = path.join(EVID, `s${s}-competent.json`);
  if (!fs.existsSync(fn)) { missing.push(`s${s}-competent`); continue; }
  CONFIGS.push({ seed: s, cur: load(fn) });
}
function censusRow(c) {
  const C = c.cur, T = C.trajectory || {};
  return { config: `s${c.seed}-competent`, w4Day: C.unlock.w4Day, w5Day: C.unlock.w5Day,
    endDay: C.days, endReason: C.endReason, national: C.national, table: C.table, won: C.won,
    exiled: C.exiled, maxWave: C.maxWave, qualifying: !!T.qualifying,
    nationalDay: T.nationalDay, tierAtEnd: T.tierAtEnd, killerClass: T.killerClass,
    instrumentErrors: (C.instrumentErrors || []).length };
}
const census = CONFIGS.map(censusRow);
function wallNumbers(rows) {
  return { n: rows.length, national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length, wins: rows.filter(r => r.won).length,
    exiled: rows.filter(r => r.exiled).length,
    wave4: rows.filter(r => r.w4Day != null).length, wave5: rows.filter(r => r.w5Day != null).length,
    villageLost: rows.filter(r => r.endReason === 'village-lost').length,
    survived: rows.filter(r => r.endReason !== 'village-lost').length,
    medianSurvival: median(rows.map(r => r.endDay)),
    maxSurvival: rows.length ? Math.max.apply(null, rows.map(r => r.endDay)) : null };
}
const overall = wallNumbers(census);
function qualifyingDetail(c) {
  const C = c.cur, T = C.trajectory || {};
  return { config: `s${c.seed}-competent`, w4Day: C.unlock.w4Day, w5Day: C.unlock.w5Day,
    endDay: C.days, endReason: C.endReason, national: C.national, table: C.table, won: C.won,
    nationalDay: T.nationalDay, tableDay: T.tableDay, tierFirst: T.tierFirst,
    tierAtNational: T.tierAtNational, tierAtDoor: T.tierAtDoor, tierAtEnd: T.tierAtEnd,
    daysAtTier: T.daysAtTier, windowOpen: T.windowOpen,
    daysPostDoor: T.daysPostDoor, daysPostNational: T.daysPostNational,
    rerun: T.rerun, fights: T.fights, lastDeath: T.lastDeath,
    killerClass: T.killerClass, killerReason: T.killerReason,
    trajectoryComplete: !!T.trajectoryComplete };
}
const qualifying = CONFIGS.filter(c => (c.cur.trajectory || {}).qualifying).map(qualifyingDetail);
const lostQual = qualifying.filter(q => q.endReason === 'village-lost');
let verdict;
if (!qualifying.length) verdict = 'no qualifying configs';
else if (!lostQual.length) verdict = 'no lost qualifying configs';
else {
  const rc = lostQual.filter(q => q.killerClass === 'rerun-clock').length;
  const sa = lostQual.filter(q => q.killerClass === 'single-apex').length;
  if (rc > lostQual.length / 2) verdict = 'rerun-clock';
  else if (sa > lostQual.length / 2) verdict = 'single-apex';
  else verdict = 'mixed/other';
}
const bar = { censusComplete: missing.length === 0 && CONFIGS.length === SEEDS.length,
  qualifyingTotal: qualifying.length,
  qualifyingAttributed: qualifying.filter(q => q.trajectoryComplete).length,
  verdictNamed: typeof verdict === 'string' && verdict.length > 0,
  diagGo: missing.length === 0 && CONFIGS.length === SEEDS.length &&
    qualifying.every(q => q.trajectoryComplete) && typeof verdict === 'string' && verdict.length > 0 };
const out = { seeds: SEEDS, missing, census, wallNumbers: overall, qualifying, lostQualifying: lostQual.length,
  killerClassCounts: { 'rerun-clock': lostQual.filter(q => q.killerClass === 'rerun-clock').length,
    'single-apex': lostQual.filter(q => q.killerClass === 'single-apex').length,
    'mixed/other': lostQual.filter(q => q.killerClass === 'mixed/other').length,
    survived: qualifying.filter(q => q.endReason !== 'village-lost').length },
  verdict, bar };
const outPath = path.join(EVID, 'sim-rerunclock-attribution.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out, null, 1));
