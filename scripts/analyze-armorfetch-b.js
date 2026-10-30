#!/usr/bin/env node
// analyze-armorfetch-b.js — acceptance verdicts + cost bar for
// sim-armorfetch-b (prereg: evidence/2026-10-30/sim-armorfetch-b-prereg.md).
// Before corpus: evidence/2026-10-30/sim-stashfetch-b-corpus (pre-armor
// code, identical substrate). After corpus:
// evidence/2026-10-30/sim-armorfetch-b-corpus (or argv[2]).
// Verdict per acceptance seed, window first 7 game days:
//   WORN    — stashed armor leaves the spawn vessel's stash AND reaches
//             scholar equipped within the window.
//   FETCHED — leaves the stash AND reaches scholar inventory-or-equipped.
//   NO-GO   — anything else (including no spawn stash entry).
// Usage: node scripts/analyze-armorfetch-b.js [afterCorpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const ACCEPT = { 16103: 'swat_vest', 16101: 'bark_armor', 16109: 'farstrider_boots' };
const afterDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-armorfetch-b-corpus');
const beforeDir = path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-stashfetch-b-corpus');
function load(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    try { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[d.seed] = d; } catch (e) {}
  }
  return out;
}
function verdict(d, item) {
  const spawnHas = (((d.spawnSnap || {}).pool || {}).stashed || []).indexOf(item) >= 0;
  if (!spawnHas) return 'NO-SPAWN';
  let stashLost = null, firstKit = null, firstEq = null, prev = true;
  const snaps = [{ gameDay: 0, scholar: d.spawnSnap.scholar, person: d.spawnSnap.person }].concat(d.mornings || []);
  for (const s of snaps) {
    if (s.gameDay > 7) continue;
    const has = ((s.person || {}).stash || []).indexOf(item) >= 0;
    if (prev && !has && stashLost === null) stashLost = s.gameDay;
    prev = has;
    const sch = s.scholar || {};
    if (firstKit === null && [].concat(sch.inv || [], sch.eq || []).indexOf(item) >= 0) firstKit = s.gameDay;
    if (firstEq === null && (sch.eq || []).indexOf(item) >= 0) firstEq = s.gameDay;
  }
  const det = { stashLost, firstKit, firstEq };
  if (stashLost !== null && firstEq !== null) return 'WORN ' + JSON.stringify(det);
  if (stashLost !== null && firstKit !== null) return 'FETCHED ' + JSON.stringify(det);
  return 'NO-GO ' + JSON.stringify(det);
}
function band(corpus) {
  const rs = Object.keys(corpus).map((s) => corpus[s]);
  const lost = rs.filter((r) => r.endReason === 'village-lost').length;
  const days = rs.map((r) => r.daysAlive).sort((a, b) => a - b);
  const waves = rs.map((r) => r.maxWaveUnlocked || 0);
  return { n: rs.length, lost, median: days.length ? days[Math.floor(days.length / 2)] : null,
    maxWave: waves.length ? Math.max(...waves) : null };
}
const bef = load(beforeDir), aft = load(afterDir);
let ok = 0;
for (const seed of [16103, 16101, 16109]) {
  const v = aft[seed] ? verdict(aft[seed], ACCEPT[seed]) : 'MISSING';
  const bv = bef[seed] ? verdict(bef[seed], ACCEPT[seed]) : 'MISSING';
  if (v.startsWith('WORN') || v.startsWith('FETCHED')) ok++;
  console.log('seed ' + seed + ' ' + ACCEPT[seed] + ' before=' + bv + ' after=' + v);
}
const bb = band(bef), ba = band(aft);
console.log('cost before=' + JSON.stringify(bb) + ' after=' + JSON.stringify(ba));
console.log('ACCEPTANCE ' + ok + '/3 (GO needs >=2)');
console.log('COST lost<=before+1: ' + (ba.lost <= bb.lost + 1) + ' median>=0.8x: ' + (ba.median >= 0.8 * bb.median));
