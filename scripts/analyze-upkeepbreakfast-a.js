#!/usr/bin/env node
// analyze-upkeepbreakfast-a.js — upkeep-breakfast morning-window analyzer.
// Usage: node scripts/analyze-upkeepbreakfast-a.js --dir <corpus-dir>
// Reads upkeepbreakfast-a-s<seed>.json files (see
// scripts/sweep-upkeepbreakfast-a.js) and, per seed, joins each daily
// event to its first-upkeep snapshot and its upkeep-call window via
// upkeepbreakfast-a-lib.js. Reports every morning window, every
// chain-qualifying upkeep meal with its narration verdict
// (NARRATED/SILENT, upkeep window only; daily eat lines quoted
// separately, never counted), and totals. Output: one JSON report
// on stdout. Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { morningWindows, summarizeMornings } = require('./upkeepbreakfast-a-lib');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
function main() {
  const a = args();
  if (!a.dir) { console.error('usage: --dir <corpus-dir>'); process.exit(2); }
  const files = fs.readdirSync(a.dir).filter((x) => /^upkeepbreakfast-a-s\d+\.json$/.test(x)).sort();
  const report = { dir: a.dir, seeds: {}, mornings: [], totals: {} };
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(a.dir, f), 'utf8'));
    const windows = morningWindows(inst);
    const summary = summarizeMornings(windows);
    report.seeds[inst.seed] = { daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked || null,
      bankfoodErrs: inst.bankfoodErrs || 0, sayTotal: inst.sayTotal || 0,
      windows: windows.length, summary };
    for (const w of windows) {
      report.mornings.push(Object.assign({ seed: inst.seed }, w));
    }
  }
  const q = report.mornings.filter((m) => m.chain && m.chain.qualifies);
  report.totals = {
    seeds: Object.keys(report.seeds).length,
    windows: report.mornings.length,
    qualifying: q.length,
    narrated: q.filter((m) => m.narration.verdict === 'NARRATED').length,
    silent: q.filter((m) => m.narration.verdict === 'SILENT').length,
    qualifyingAtHaven: q.filter((m) => m.wakeInsideHaven === true).length,
    qualifyingAway: q.filter((m) => m.wakeInsideHaven === false).length,
    qualifyingWakeUnknown: q.filter((m) => m.wakeInsideHaven !== true && m.wakeInsideHaven !== false).length,
    byReason: (() => { const r = {}; for (const m of report.mornings) { const k = (m.chain && m.chain.reason) || 'none'; r[k] = (r[k] || 0) + 1; } return r; })(),
  };
  console.log(JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { morningWindows, summarizeMornings };
