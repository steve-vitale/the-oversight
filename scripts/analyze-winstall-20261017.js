#!/usr/bin/env node
// scripts/analyze-winstall-20261017.js — WINSTALL attribution analysis
// (flesh-out loop, 2026-10-17, sim-findings #446). No sims; reads the
// per-seed JSONs written by scripts/sweep-winstall-20261017.js and prints
// the stall attribution verdict.
//
// Usage: node scripts/analyze-winstall-20261017.js [--probe]
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-winstall');
const PROBE = process.argv.includes('--probe');

function loadAll() {
  const out = [];
  for (const f of fs.readdirSync(EVID)) {
    if (!/\.json$/.test(f)) continue;
    if (PROBE !== /^probe250-/.test(f)) continue;
    try { out.push(JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'))); }
    catch (e) { console.error('BAD JSON', f, String(e).slice(0, 80)); }
  }
  return out;
}

function main() {
  const recs = loadAll().sort((a, b) =>
    (a.policyId < b.policyId ? -1 : 1) || (a.seed - b.seed));
  console.log(`== winstall analysis (${PROBE ? 'probe250' : '180d'}): ${recs.length} runs ==\n`);
  const stalls = {};
  let sitting = 0, sittingAttributed = 0, unattributed = [];
  for (const r of recs) {
    stalls[r.stall] = (stalls[r.stall] || 0) + 1;
    if (r.sitN > 0) {
      sitting++;
      // Attributed = the stall bucket names the mechanism with evidence.
      if (r.stall && r.stall !== 'other' && r.stall !== 'classify-error') sittingAttributed++;
      else unattributed.push(`${r.policyId}-s${r.seed}`);
    }
  }
  console.log(`runs=${recs.length} wins=${recs.filter(r => r.wins).length} sitting=${sitting}`);
  console.log(`stall buckets: ${JSON.stringify(stalls)}`);
  console.log(`sitting runs attributed: ${sittingAttributed}/${sitting}` +
    (unattributed.length ? `  UNATTRIBUTED: ${unattributed.join(', ')}` : '  (all attributed)'));
  console.log('\n--- per-run stall inventory (sitting runs) ---');
  for (const r of recs.filter(r => r.sitN > 0)) {
    const sig = (r.modalSigEnd || '').slice(0, 60);
    console.log(`${r.policyId}-s${r.seed}: sit@${r.sitDay} seat=${r.seatKind} ` +
      `choose=${r.chooseCallsN} prog=${r.progOpsN} answers=${r.tableAnswers} ` +
      `defers=${r.deferN} finals=${r.finalN} phaseEnd=${r.phaseEnd} ` +
      `pathEnd=${r.pathEnd} weakened=${r.weakenedEnd} floorOk=${r.floorOkEnd} ` +
      `wonDay=${r.wonDay} stall=${r.stall} sig=${sig}`);
  }
  const nosit = recs.filter(r => !r.sitN);
  if (nosit.length) {
    console.log('\n--- non-sitting runs ---');
    for (const r of nosit) {
      console.log(`${r.policyId}-s${r.seed}: days=${r.gameDays} end=${r.endReason} national=${r.national} stall=${r.stall}`);
    }
  }
  // Answer-record check: was the modal ever answered on the drain-off substrate?
  const answeredRuns = recs.filter(r => r.chooseCallsN > 0);
  console.log(`\nmodal answered (chooseCalls>0) on ${answeredRuns.length}/${recs.length} runs`);
  const modalPendingEnd = recs.filter(r => r.modalSigEnd && !r.wins);
  console.log(`modal still pending at end on ${modalPendingEnd.length}/${recs.length} runs`);
  // PRIMARY verdict
  const go = sitting > 0 && sittingAttributed === sitting && !unattributed.length;
  console.log(`\nPRIMARY (100% of sitting runs attributed): ${go ? 'GO' : 'NO-GO — MISS'}`);
  if (!go) process.exitCode = 1;
}

main();
