#!/usr/bin/env node
// compchan-analyze-20261018.js — corpus aggregation for the sim-compchan
// funnel census. Pure JSON reader (no harness, no layer dependency).
//
// Reads evidence/2026-10-18/perseed-compchan/*.json, prints the funnel
// table + shape breakdown + leak analysis, and writes the corpus summary
// to evidence/2026-10-18/perseed-compchan/_corpus.json.
//
// Usage: node scripts/compchan-analyze-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.env.EVID || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-compchan');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))).filter(r => !r.error);
console.log(`runs: ${runs.length} (${files.length} files)`);

const attribOK = runs.filter(r => r.attributionComplete);
console.log(`attribution complete: ${attribOK.length}/${runs.length}`);
for (const r of runs.filter(r => !r.attributionComplete)) {
  console.log(`  ATTRIB-FAIL ${r.policyId}-s${r.seed}: unknownShapes=${r.unknownShapes} reconcileDelta=${r.reconcileDelta} errs=${(r.instrumentErrors || []).length}`);
}

// --- corpus shape breakdown (companion kills) ---
const shapeComp = {}, shapeAll = {}, viaAll = {};
let compKills = 0, schKills = 0, misTags = 0, w3 = 0;
for (const r of runs) {
  w3 += r.w3Kills; compKills += r.w3CompanionKills; schKills += r.w3ScholarKills; misTags += r.misTagCount;
  for (const [k, v] of Object.entries(r.byShape || {})) shapeAll[k] = (shapeAll[k] || 0) + v;
  for (const [k, v] of Object.entries(r.byVia || {})) viaAll[k] = (viaAll[k] || 0) + v;
  for (const k of (r.kills || [])) {
    if (!k.companion) continue;
    shapeComp[k.shape] = (shapeComp[k.shape] || 0) + 1;
  }
}
console.log('\n== corpus: w3 kills by shape (all killers) ==');
for (const [k, v] of Object.entries(shapeAll).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log('== corpus: w3 kills by engine via channel ==');
for (const [k, v] of Object.entries(viaAll).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log('== corpus: COMPANION w3 kills by shape ==');
for (const [k, v] of Object.entries(shapeComp).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v} (${(100 * v / Math.max(1, compKills)).toFixed(1)}%)`);
console.log(`\nw3 kills: ${w3} — companion ${compKills} (${(100 * compKills / Math.max(1, w3)).toFixed(1)}%), scholar ${schKills} (${(100 * schKills / Math.max(1, w3)).toFixed(1)}%), mis-tagged via=player: ${misTags}`);

// --- party vs independent ---
let inPartyKills = 0, indepKills = 0;
const blooderRows = [];
for (const r of runs) {
  for (const k of (r.kills || [])) {
    if (!k.companion) continue;
    if (k.inParty) inPartyKills++; else indepKills++;
  }
  for (const c of (r.companions || [])) {
    blooderRows.push({ run: `${r.policyId}-s${r.seed}`, name: c.name, kills: c.kills, firstDay: c.firstDay, everInParty: c.everInParty, shapes: c.shapes.join('+'), tier: c.tier });
  }
}
console.log(`\ncompanion kills: in-party ${inPartyKills} (${(100 * inPartyKills / Math.max(1, compKills)).toFixed(1)}%) vs independent ${indepKills} (${(100 * indepKills / Math.max(1, compKills)).toFixed(1)}%)`);
console.log('\n== blooders (living w3+ killers at end of run) ==');
for (const b of blooderRows.sort((a, b) => b.kills - a.kills)) {
  console.log(`  ${b.run} ${b.name}: ${b.kills} kills, first d${b.firstDay}, ${b.everInParty ? 'EVER-IN-PARTY' : 'independent'}, shapes ${b.shapes}, tier ${b.tier}`);
}

// --- funnel: kills -> blooded -> release -> survival ---
let bloodedTotal = 0, scholarBloodedRuns = 0;
const firstVets = [];
let diedInWindow = 0, diedPostRelease = 0, survivedToEnd = 0, everVets = 0;
for (const r of runs) {
  bloodedTotal += r.bloodedLiving;
  if (r.scholarBlooded) scholarBloodedRuns++;
  if (r.firstVetDay != null) firstVets.push(r.firstVetDay);
  everVets += r.vetSurvival.everVeterans;
  diedInWindow += r.vetSurvival.diedInWindow;
  diedPostRelease += r.vetSurvival.diedPostRelease;
  survivedToEnd += r.vetSurvival.survivedToEnd;
}
firstVets.sort((a, b) => a - b);
const medFv = firstVets.length ? firstVets[Math.floor(firstVets.length / 2)] : null;
console.log('\n== funnel ==');
console.log(`  w3 kills: ${w3} (${compKills} companion / ${schKills} scholar)`);
console.log(`  distinct blooded companions (living at end): ${bloodedTotal} over ${runs.length} runs`);
console.log(`  scholar-blooded runs: ${scholarBloodedRuns}/${runs.length}`);
console.log(`  runs with firstVetDay: ${firstVets.length}/${runs.length} (median d${medFv})`);
console.log(`  ever-veterans: ${everVets} — died in-window ${diedInWindow}, died post-release ${diedPostRelease}, survived to end ${survivedToEnd}`);
console.log(`  conversion: companion w3 kills -> blooded companions: ${(bloodedTotal / Math.max(1, compKills) * 100).toFixed(1)} per kill; runs ever-veteran ${firstVets.length}/${runs.length}`);

// --- release window ---
let inWindow = 0, winOpen = 0;
for (const r of runs) {
  if (r.windowOpenDay != null) winOpen++;
  if (r.releaseInWindow) inWindow++;
}
console.log(`\nrelease window (standing>=100): opened ${winOpen}/${runs.length} runs; firstVetDay in-window ${inWindow}/${firstVets.length} releases`);

// --- per-run funnel rows ---
console.log('\n== per-run ==');
console.log('run                    w3  comp sch  blooded schB 1stVet win4 nat tab won attrib');
for (const r of runs.sort((a, b) => a.seed - b.seed || (a.policyId < b.policyId ? -1 : 1))) {
  const fv = r.firstVetDay == null ? ' --' : String(r.firstVetDay).padStart(4);
  console.log(`${(r.policyId + '-s' + r.seed).padEnd(22)} ${String(r.w3Kills).padStart(3)} ${String(r.w3CompanionKills).padStart(4)} ${String(r.w3ScholarKills).padStart(3)} ${String(r.bloodedLiving).padStart(7)} ${r.scholarBlooded ? 'Y' : '-'}  ${fv} ${r.wave4 ? 'Y' : '-'}   ${r.national ? 'Y' : '-'}  ${r.table ? 'Y' : '-'}  ${r.won ? 'Y' : '-'}  ${r.attributionComplete ? 'OK' : 'FAIL'}`);
}

const corpus = {
  instrument: 'compchan', runs: runs.length, attributionComplete: `${attribOK.length}/${runs.length}`,
  w3Kills: w3, companionKills: compKills, scholarKills: schKills, misTags,
  inPartyKills, indepKills,
  shapeAll, shapeCompanion: shapeComp, viaAll,
  bloodedCompanions: bloodedTotal, scholarBloodedRuns,
  everVeteranRuns: firstVets.length, medianFirstVetDay: medFv,
  everVeterans: everVets, diedInWindow, diedPostRelease, survivedToEnd,
  windowOpened: winOpen, releaseInWindow: inWindow,
};
fs.writeFileSync(path.join(DIR, '_corpus.json'), JSON.stringify(corpus, null, 1) + '\n');
console.log('\nwrote _corpus.json');
