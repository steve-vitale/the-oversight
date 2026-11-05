#!/usr/bin/env node
// analyze-upkeepbf52-a.js — pack-pinned upkeep-meal analyzer.
// Usage: node scripts/analyze-upkeepbf52-a.js --dir <corpus-dir>
// Reads upkeepbf52-a-s<seed>.json files (see
// scripts/sweep-upkeepbf52-a.js) and, per seed, joins each daily
// event to its first-upkeep snapshot and its upkeep-call window via
// upkeepbf52-a-lib.js. Reports every morning window, every
// pack-pinned upkeep meal with its narration verdict (NARRATED/
// SILENT, upkeep window only; daily eat lines quoted separately,
// never counted), and totals. Output: one JSON report on stdout.
// Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { packWindows, summarizePackMeals } = require('./upkeepbf52-a-lib');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
function main() {
  const a = args();
  if (!a.dir) { console.error('usage: --dir <corpus-dir>'); process.exit(2); }
  const files = fs.readdirSync(a.dir).filter((x) => /^upkeepbf52-a-s\d+\.json$/.test(x)).sort();
  const report = { dir: a.dir, seeds: {}, mornings: [], totals: {} };
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(a.dir, f), 'utf8'));
    const windows = packWindows(inst);
    const summary = summarizePackMeals(windows);
    report.seeds[inst.seed] = { daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked || null,
      bankfoodErrs: inst.bankfoodErrs || 0, sayTotal: inst.sayTotal || 0,
      windows: windows.length, summary };
    for (const w of windows) {
      report.mornings.push(Object.assign({ seed: inst.seed }, w));
    }
  }
  const m = report.mornings.filter((x) => x.packMeal && x.packMeal.dropKcal > 0);
  report.totals = {
    seeds: Object.keys(report.seeds).length,
    windows: report.mornings.length,
    packMeals: m.length,
    narrated: m.filter((x) => x.packNarration && x.packNarration.verdict === 'NARRATED').length,
    silent: m.filter((x) => x.packNarration && x.packNarration.verdict === 'SILENT').length,
    exactChain: m.filter((x) => x.chain && x.chain.qualifies).length,
    pantryMixed: m.filter((x) => x.chain && x.chain.reason === 'kcal-chain-inexact').length,
    byChainReason: (() => { const r = {}; for (const x of report.mornings) { const k = (x.chain && x.chain.reason) || 'none'; r[k] = (r[k] || 0) + 1; } return r; })(),
  };
  console.log(JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { packWindows, summarizePackMeals };
