#!/usr/bin/env node
// analyze-journey-succession-r45-20261025.js — verdict table for succession r45.
// Reads evidence/2026-10-25/journey-succession-r45-<seed>.stdout.json (5 seeds)
// and prints: V1 vouch verdicts, W1 move-census coverage + bucket totals by
// direction, M3v2 / M1 / M4 / MG2 / chain causes, and the transcript inventory
// for the people check. No game state is touched; this only reads run output.
// Usage: node scripts/analyze-journey-succession-r45-20261025.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-25');
const SEEDS = [26001, 26002, 26003, 26004, 26005];
const recs = [];
for (const s of SEEDS) {
  const f = path.join(EVID, `journey-succession-r45-${s}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
  recs.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
console.log('== V1 VOUCH SNAPSHOT ==');
for (const r of recs) {
  const v = r.vouch45 || {};
  console.log(`seed ${r.seed}: rule=${v.rule} verdict=${v.verdict} eligibleAtDeath=${JSON.stringify(v.eligibleAtDeath)} alivePostDeath=${JSON.stringify(v.alivePostDeath)} diedBetween=${JSON.stringify(v.diedBetween)} vouchLines=${v.vouchLines}`);
}
console.log('\n== W1 OFFICE MOVES (census coverage + bucket totals) ==');
let totMoves = 0, totCensus = 0;
for (const r of recs) {
  const moves = r.officeMoves || [];
  const up = moves.filter(m => m.delta > 0), down = moves.filter(m => m.delta < 0);
  const sum = (arr, k) => arr.reduce((a, m) => a + ((m.buckets || {})[k] || 0), 0);
  const tot = (arr) => ({ bearer: sum(arr, 'bearerN'), gift: sum(arr, 'giftN'), rumor: sum(arr, 'rumorN'), crisis: sum(arr, 'crisisN'), other: sum(arr, 'otherN') });
  const lines = moves.reduce((a, m) => a + (m.totalLines || 0), 0);
  totMoves += moves.length; totCensus += moves.filter(m => m.buckets).length;
  console.log(`seed ${r.seed}: moves=${moves.length} census=${moves.filter(m => m.buckets).length} up=${up.length} down=${down.length} totalLines=${lines}`);
  console.log(`  up buckets:   ${JSON.stringify(tot(up))}`);
  console.log(`  down buckets: ${JSON.stringify(tot(down))}`);
  const withBearer = moves.filter(m => (m.buckets || {}).bearerN > 0).length;
  const withRumor = moves.filter(m => (m.buckets || {}).rumorN > 0).length;
  const withGift = moves.filter(m => (m.buckets || {}).giftN > 0).length;
  const withCrisis = moves.filter(m => (m.buckets || {}).crisisN > 0).length;
  console.log(`  move days carrying: bearer=${withBearer} gift=${withGift} rumor=${withRumor} crisis=${withCrisis} (of ${moves.length})`);
}
console.log(`TOTAL moves=${totMoves} census=${totCensus}`);
console.log('\n== BINDING METRICS ==');
for (const r of recs) {
  const f = r.funeral || {};
  console.log(`seed ${r.seed}: M3v2=${f.echoV2} (bar >=2) M1=${r.m1} M4=${r.m4} MG2=${r.mg2} (viol=${(r.mealGateViolations || []).length}) chainDeaths=${(r.chainDeaths || []).length} chainKnown=${(r.chainDeaths || []).filter(c => c.causeKnown).length} identityTrips=${(r.identityTrips || []).length} dayAdv=${r.dayAdv} aliveEnd=?`);
}
console.log('\n== TRANSCRIPTS (people check inventory) ==');
const tx = fs.readdirSync(EVID).filter(n => n.startsWith('journey-succession-r45-transcript-'));
console.log(`${tx.length} transcripts`);
for (const t of tx.sort()) console.log('  ' + t);
console.log('\n== VILLAGE END STATE ==');
for (const r of recs) {
  const last = (r.ledger || [])[(r.ledger || []).length - 1] || {};
  console.log(`seed ${r.seed}: ${r.death ? r.death.oldFirst + ' -> ' + r.death.newFirst : 'no death'} d${r.death ? r.death.day : '?'} trustMantle=${r.death ? r.death.newTrust : '?'} officeEnd=${r.trustVerdict ? r.trustVerdict.officeLast : '?'} villageMeanEnd=${r.trustVerdict ? r.trustVerdict.villageLast : '?'} pantryEnd=${r.pantryEnd} ledgerAlive=${last.alive} ledgerPantry=${last.pantryKcal}`);
}
