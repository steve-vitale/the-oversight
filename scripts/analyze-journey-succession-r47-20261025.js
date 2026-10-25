#!/usr/bin/env node
// analyze-journey-succession-r47-20261025.js — verdict table for succession r47.
// Reads evidence/2026-10-25/journey-succession-r47-<seed>.stdout.json (5 seeds)
// and prints: V1 vouch verdicts, C1 call-scoped attribution coverage + mover
// concentration, W1 day-census continuity, M3v2b / M1 / M4 / MG2 / chain
// causes, and the transcript inventory for the people check. No game state
// is touched; this only reads run output.
// Usage: node scripts/analyze-journey-succession-r47-20261025.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-25');
const SEEDS = [26021, 26022, 26023, 26024, 26025];
const recs = [];
for (const s of SEEDS) {
  const f = path.join(EVID, `journey-succession-r47-${s}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
  recs.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
console.log('== V1 VOUCH SNAPSHOT ==');
for (const r of recs) {
  const v = r.vouch45 || {};
  console.log(`seed ${r.seed}: rule=${v.rule} verdict=${v.verdict} eligibleAtDeath=${JSON.stringify(v.eligibleAtDeath)} alivePostDeath=${JSON.stringify(v.alivePostDeath)} diedBetween=${JSON.stringify(v.diedBetween)} vouchLines=${v.vouchLines}`);
}
console.log('\n== C1 CALL-SCOPED OFFICE ATTRIBUTION ==');
for (const r of recs) {
  const cc = r.callCheck || {};
  const calls = r.officeCallMoves || [];
  const trustMoves = calls.filter(m => !m.bearerChanged);
  const chain = calls.filter(m => m.bearerChanged);
  const conc = trustMoves.filter(m => (m.movers || []).length === 1).length;
  const diffuse = trustMoves.filter(m => (m.movers || []).length >= 3).length;
  const soloOffice = trustMoves.filter(m => (m.movers || []).length === 0).length;
  const sum = (arr, k) => arr.reduce((a, m) => a + ((m.buckets || {})[k] || 0), 0);
  const tot = (arr) => ({ bearer: sum(arr, 'bearerN'), gift: sum(arr, 'giftN'), rumor: sum(arr, 'rumorN'), crisis: sum(arr, 'crisisN'), other: sum(arr, 'otherN') });
  const callLines = calls.reduce((a, m) => a + (m.totalLines || 0), 0);
  const withGift = trustMoves.filter(m => (m.buckets || {}).giftN > 0).length;
  const withRumor = trustMoves.filter(m => (m.buckets || {}).rumorN > 0).length;
  const withBearer = trustMoves.filter(m => (m.buckets || {}).bearerN > 0).length;
  console.log(`seed ${r.seed}: callCheck ok=${cc.ok} dailyMoveDays=${cc.dailyMoveDays} callMoveDays=${cc.callMoveDays} missing=${JSON.stringify(cc.missingDays)} callMoves=${calls.length} (trust=${trustMoves.length} chain=${chain.length}) callLines=${callLines}`);
  console.log(`  trust-move concentration: single-mover=${conc} diffuse(>=3)=${diffuse} solo-office(no movers)=${soloOffice}`);
  console.log(`  trust-move call buckets: ${JSON.stringify(tot(trustMoves))} | days carrying: bearer=${withBearer} gift=${withGift} rumor=${withRumor} (of ${trustMoves.length})`);
  for (const m of trustMoves.slice(0, 12)) {
    console.log(`    d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) movers=${JSON.stringify(m.movers)} lines=${m.totalLines} b=${m.buckets.bearerN} g=${m.buckets.giftN} r=${m.buckets.rumorN} c=${m.buckets.crisisN} o=${m.buckets.otherN}`);
  }
}
console.log('\n== W1 OFFICE MOVES (day census, continuity) ==');
let totMoves = 0, totCensus = 0;
for (const r of recs) {
  const moves = r.officeMoves || [];
  const up = moves.filter(m => m.delta > 0), down = moves.filter(m => m.delta < 0);
  const lines = moves.reduce((a, m) => a + (m.totalLines || 0), 0);
  totMoves += moves.length; totCensus += moves.filter(m => m.buckets).length;
  console.log(`seed ${r.seed}: moves=${moves.length} census=${moves.filter(m => m.buckets).length} up=${up.length} down=${down.length} totalLines=${lines}`);
  const withBearer = moves.filter(m => (m.buckets || {}).bearerN > 0).length;
  const withRumor = moves.filter(m => (m.buckets || {}).rumorN > 0).length;
  const withGift = moves.filter(m => (m.buckets || {}).giftN > 0).length;
  console.log(`  move days carrying: bearer=${withBearer} gift=${withGift} rumor=${withRumor} (of ${moves.length})`);
}
console.log(`TOTAL moves=${totMoves} census=${totCensus}`);
console.log('\n== S1 BEARER-OWN DELTA (r47) ==');
for (const r of recs) {
  const calls = r.officeCallMoves || [];
  const tm = calls.filter(m => !m.bearerChanged);
  const solo = tm.filter(m => m.soloOffice);
  const single = tm.filter(m => (m.movers || []).length === 1);
  const singleBearer = single.filter(m => m.bearerIsMover);
  const singleOther = single.filter(m => !m.bearerIsMover);
  const badSolo = solo.filter(m => Math.abs(m.delta) > 2);
  const missing = tm.filter(m => typeof m.bearerDeltaExact !== 'number');
  console.log(`seed ${r.seed}: scripted=${r.death && r.death.scripted} deathDay=${r.death && r.death.day} trustMoves=${tm.length} soloOffice=${solo.length} soloDeltas=${JSON.stringify(solo.map(m => m.delta))} soloBearerExact=${JSON.stringify(solo.map(m => m.bearerDeltaExact))} badSolo(|d|>2)=${badSolo.length} missingExact=${missing.length}`);
  console.log(`  single-mover: bearer=${singleBearer.length} other=${singleOther.length} (other-mover singles: ${JSON.stringify(singleOther.slice(0, 6).map(m => ({ day: m.day, delta: m.delta, movers: m.movers })))} )`);
}
console.log('\n== E1 EVENT-VS-DEED CROSS-TAB (r47) ==');
for (const r of recs) {
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const cls = (m) => {
    const n = (m.movers || []).length;
    if (n === 0) return 'solo';
    if (n === 1) return 'single';
    const tot = (m.movers || []).reduce((a, x) => a + Math.abs(x.delta), 0);
    const top = Math.max(...(m.movers || []).map(x => Math.abs(x.delta)));
    return (tot > 0 && top / tot >= 0.5) ? 'concentrated' : 'diffuse';
  };
  const tab = {};
  for (const m of tm) { const k = cls(m) + '|' + (m.eventClass || '?'); tab[k] = (tab[k] || 0) + 1; }
  console.log(`seed ${r.seed}: ${JSON.stringify(tab)}`);
  const diffuse = tm.filter(m => cls(m) === 'diffuse');
  console.log(`  diffuse moves: ${diffuse.length}, of which event-only=${diffuse.filter(m => m.eventClass === 'event-only').length} deed-only=${diffuse.filter(m => m.eventClass === 'deed-only').length} both=${diffuse.filter(m => m.eventClass === 'both').length} neither=${diffuse.filter(m => m.eventClass === 'neither').length}`);
  const conc = tm.filter(m => cls(m) === 'concentrated' || cls(m) === 'single');
  console.log(`  concentrated+single moves: ${conc.length}, of which event-only=${conc.filter(m => m.eventClass === 'event-only').length} deed-only=${conc.filter(m => m.eventClass === 'deed-only').length} both=${conc.filter(m => m.eventClass === 'both').length} neither=${conc.filter(m => m.eventClass === 'neither').length}`);
}
console.log('\n== BINDING METRICS ==');
for (const r of recs) {
  const f = r.funeral || {};
  console.log(`seed ${r.seed}: M3v2=${f.echoV2} M3v2b=${f.echoV2b} (bar >=2, excludedLoot=${f.echoV2bExcluded}) M1=${r.m1} M4=${r.m4} MG2=${r.mg2} (viol=${(r.mealGateViolations || []).length}) chainDeaths=${(r.chainDeaths || []).length} chainKnown=${(r.chainDeaths || []).filter(c => c.causeKnown).length} identityTrips=${(r.identityTrips || []).length} dayAdv=${r.dayAdv}`);
  if (f.echoV2bExcludedSample) console.log(`  loot-excluded sample: ${JSON.stringify(f.echoV2bExcludedSample)}`);
}
console.log('\n== TRANSCRIPTS (people check inventory) ==');
const tx = fs.readdirSync(EVID).filter(n => n.startsWith('journey-succession-r47-transcript-'));
console.log(`${tx.length} transcripts`);
for (const t of tx.sort()) console.log('  ' + t);
console.log('\n== VILLAGE END STATE ==');
for (const r of recs) {
  const last = (r.ledger || [])[(r.ledger || []).length - 1] || {};
  console.log(`seed ${r.seed}: ${r.death ? r.death.oldFirst + ' -> ' + r.death.newFirst : 'no death'} d${r.death ? r.death.day : '?'} trustMantle=${r.death ? r.death.newTrust : '?'} officeEnd=${r.trustVerdict ? r.trustVerdict.officeLast : '?'} villageMeanEnd=${r.trustVerdict ? r.trustVerdict.villageLast : '?'} pantryEnd=${r.pantryEnd} ledgerAlive=${last.alive} ledgerPantry=${last.pantryKcal}`);
}
