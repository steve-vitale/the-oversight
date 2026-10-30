#!/usr/bin/env node
// analyze-stashfetch-b.js — per-seed FETCHED / EQUIPPED verdicts for
// sim-stashfetch-b, plus the band cost bar vs the hatchequip baseline.
// Reads the AFTER corpus dir (default evidence/2026-10-30/
// sim-stashfetch-b-corpus) and the BEFORE corpus
// (evidence/2026-10-30/sim-hatchequip-b-corpus).
// Acceptance windows (from the BASELINE corpus, prereg): the spawn
// vessel's scholar kit is shown through the morning BEFORE its first
// wholesale kit-change morning (succession): 16103 d16 -> window ends
// d15; 16106 d18 -> d17; 16110 d9 -> d8. A fetch for the spawn vessel can
// only appear in a morning snapshot with gameDay < kitChangeDay, because
// the recorder's person rows follow the spawn vessel while its scholar
// rows follow the CURRENT vessel.
// Verdicts per acceptance seed:
//   EQUIPPED — stash loses the hatchet AND scholar.equipped holds it,
//              both at gameDay < kitChangeDay
//   FETCHED  — stash loses it AND scholar kit (inv or eq) holds it,
//              both at gameDay < kitChangeDay, but never equipped
//   NO-GO    — otherwise
// Usage: node scripts/analyze-stashfetch-b.js [afterCorpusDir] [beforeCorpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const afterDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-stashfetch-b-corpus');
const beforeDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-hatchequip-b-corpus');
const ACCEPT = { 16103: 16, 16106: 18, 16110: 9 }; // seed -> kitChangeDay

function loadDir(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    try { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[d.seed] = d; }
    catch (e) { console.log('UNREADABLE ' + f + ': ' + e.message); }
  }
  return out;
}
function perSeed(d) {
  const spawnStash = ((d.spawnSnap || {}).pool || {}).stashed || [];
  const spawnHatchet = spawnStash.indexOf('hatchet') >= 0;
  const allSnaps = [{ gameDay: 0, scholar: d.spawnSnap.scholar, person: d.spawnSnap.person }];
  for (const m of (d.mornings || [])) allSnaps.push(m);
  let stashLostDay = null, firstKitDay = null, firstEqDay = null, prevHas = spawnHatchet;
  for (const s of allSnaps) {
    const st = ((s.person || {}).stash || []);
    const nowHas = st.indexOf('hatchet') >= 0;
    if (prevHas && !nowHas && stashLostDay === null) stashLostDay = s.gameDay;
    prevHas = nowHas;
    const sch = s.scholar || {};
    const kit = [].concat(sch.inv || [], sch.eq || []);
    if (firstKitDay === null && kit.indexOf('hatchet') >= 0) firstKitDay = s.gameDay;
    if (firstEqDay === null && (sch.eq || []).indexOf('hatchet') >= 0) firstEqDay = s.gameDay;
  }
  const hatchetLines = ((d.log || {}).hatchetLines || []).map((h) => 'd' + h.day + ': ' + h.line);
  return { seed: d.seed, end: d.endReason, daysAlive: d.daysAlive,
    spawnHatchet, stashLostDay, firstKitDay, firstEqDay,
    hatchetLines: hatchetLines.slice(0, 12), hatchetLineCount: hatchetLines.length,
    wrapErrors: ((d.log || {}).wrapErrors || []).length };
}
const after = loadDir(afterDir);
const before = loadDir(beforeDir);
const rows = Object.keys(after).map((s) => parseInt(s, 10)).sort((a, b) => a - b).map((s) => perSeed(after[s]));
for (const r of rows) console.log(JSON.stringify(r));
console.log('--- acceptance (window: gameDay < kitChangeDay) ---');
let equipped = 0, fetched = 0;
for (const seed of [16103, 16106, 16110]) {
  const r = rows.find((x) => x.seed === seed);
  const kc = ACCEPT[seed];
  if (!r) { console.log('seed ' + seed + ': MISSING'); continue; }
  const inWindow = (day) => day !== null && day < kc;
  let verdict = 'NO-GO';
  if (inWindow(r.stashLostDay) && inWindow(r.firstEqDay)) { verdict = 'EQUIPPED'; equipped++; }
  else if (inWindow(r.stashLostDay) && inWindow(r.firstKitDay)) { verdict = 'FETCHED'; fetched++; }
  console.log('seed ' + seed + ': kitChangeDay=' + kc + ' stashLostDay=' + r.stashLostDay +
    ' firstKitDay=' + r.firstKitDay + ' firstEqDay=' + r.firstEqDay + ' -> ' + verdict);
  if (r.hatchetLines.length) for (const l of r.hatchetLines.slice(0, 6)) console.log('    ' + l);
}
console.log('EQUIPPED ' + equipped + '/3, FETCHED ' + fetched + '/3');
console.log('GO (equipped>=2 OR (fetched>=2 AND cost bar holds)): ' +
  ((equipped >= 2 || fetched >= 2) ? 'CANDIDATE (check cost bar)' : 'NO'));
console.log('--- band cost bar (before hatchequip corpus vs after) ---');
function band(corpus) {
  const rs = Object.keys(corpus).map((s) => perSeed(corpus[s]));
  const lost = rs.filter((r) => r.end === 'village-lost').length;
  const days = rs.map((r) => r.daysAlive).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : null;
  return { n: rs.length, villageLost: lost, medianDaysAlive: median };
}
const bBefore = band(before), bAfter = band(after);
console.log('before: n=' + bBefore.n + ' villageLost=' + bBefore.villageLost + ' medianDaysAlive=' + bBefore.medianDaysAlive);
console.log('after:  n=' + bAfter.n + ' villageLost=' + bAfter.villageLost + ' medianDaysAlive=' + bAfter.medianDaysAlive);
console.log('cost bar: lost <= before+1 (' + (bAfter.villageLost <= bBefore.villageLost + 1) +
  ') AND median >= 0.8x before (' + (bAfter.medianDaysAlive >= 0.8 * bBefore.medianDaysAlive) + ')');
console.log('wrapErrors after total: ' + rows.reduce((t, r) => t + r.wrapErrors, 0));
