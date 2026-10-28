#!/usr/bin/env node
// analyze-outflowzero-b.js — leg-F3 + wall-number reader for the
// sim-outflowzero-b unscripted band corpus. Prints, per seed and
// pooled: directCounters calls/callsWithDecrease/records for the four
// judged paths, the roster/child census, and wall fields. No judging
// lives here: verdicts are written in the evidence file against the
// prereg bar, from this output.
// Run: node scripts/analyze-outflowzero-b.js [corpus-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-outflowzero-b-corpus');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const JUDGED = ['thief.steal_pantry', 'event-take', 'player-take-bulk', 'npc-child-pantry'];
const pooled = { calls: {}, withDec: {}, records: 0, children: 0, roster: 0, days: [], deaths: 0, deathCauses: {}, waves: {}, national: 0, table: 0, wins: 0 };
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const c = j.directCounters || {};
  console.log(`${f} seed=${j.seed} days=${j.daysAlive} end=${j.endReason} rank=${j.rank} wave=${j.waveReach.length} deaths=${j.deaths} causes=${JSON.stringify(j.deathCauses)} roster=${j.census.rosterSize} children=${j.census.children.length} childPos=${j.census.childrenWithPositions} judgedRecords=${j.judgedRecordCount} removeKcal=${j.removePantryKcalRecords}`);
  console.log(`  calls=${JSON.stringify(c.calls)} withDec=${JSON.stringify(c.callsWithDecrease)} records=${c.records} nestedChild=${c.nestedChildCalls} missing=${JSON.stringify(j.missingPaths)}`);
  for (const p of JUDGED) {
    pooled.calls[p] = (pooled.calls[p] || 0) + ((c.calls || {})[p] || 0);
    pooled.withDec[p] = (pooled.withDec[p] || 0) + ((c.callsWithDecrease || {})[p] || 0);
  }
  pooled.records += j.judgedRecordCount || 0;
  pooled.children += (j.census.children || []).length;
  pooled.roster += j.census.rosterSize || 0;
  pooled.days.push(j.daysAlive);
  pooled.deaths += j.deaths || 0;
  for (const [k, v] of Object.entries(j.deathCauses || {})) pooled.deathCauses[k] = (pooled.deathCauses[k] || 0) + v;
  pooled.waves[j.waveReach.length] = (pooled.waves[j.waveReach.length] || 0) + 1;
  if (j.national) pooled.national++;
  if (j.table) pooled.table++;
  if (j.win) pooled.wins++;
}
pooled.days.sort((a, b) => a - b);
const med = pooled.days.length ? pooled.days[Math.floor(pooled.days.length / 2)] : null;
console.log('POOLED seeds=' + files.length + ' calls=' + JSON.stringify(pooled.calls) + ' withDec=' + JSON.stringify(pooled.withDec) + ' judgedRecords=' + pooled.records);
console.log('POOLED roster=' + pooled.roster + ' children=' + pooled.children + ' daysSorted=' + JSON.stringify(pooled.days) + ' medianDays=' + med + ' deaths=' + pooled.deaths + ' causes=' + JSON.stringify(pooled.deathCauses));
console.log('POOLED waves=' + JSON.stringify(pooled.waves) + ' national=' + pooled.national + ' table=' + pooled.table + ' wins=' + pooled.wins);
