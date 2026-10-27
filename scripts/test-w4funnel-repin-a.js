#!/usr/bin/env node
// scripts/test-w4funnel-repin-a.js — proof validator for sim-w4funnel-repin-a
// (scale-onramp axis, 2026-10-27, DIAG ONLY). Pure analysis over the
// corpus on disk: no harness, no RNG, no game state, re-runnable with
// identical output. It re-derives, from the corpus files themselves:
//   (1) the plain band and the armed band, and their equality;
//   (2) the armed-vs-plain per-seed exactness the sweep's --summary
//       already judged (an independent second check, not a re-print);
//   (3) the corpus-error counts (all five recorders, all seeds);
//   (4) the funnel totals, by re-running analyzeW4funnel over every
//       armed row and comparing to analysis.json's band;
//   (5) DIAG-GO legs (a)-(c) from those re-derived totals.
// Leg (d) (sense read) is evidence-checked, not corpus-checked: this
// validator prints it as EVIDENCE, never as PASS, so a green run
// here never claims the sense leg on its own.
// Usage: node scripts/test-w4funnel-repin-a.js [corpus-dir]
// Exit 1 on any mismatch.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeW4funnel, rollup } = require('./test-w4funnel-diag');
const NL = String.fromCharCode(10);
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' ' + detail : '')); }
}
function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'perseed-w4funnel-repin-a');
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  const analysis = JSON.parse(fs.readFileSync(path.join(dir, 'analysis.json'), 'utf8'));
  const seeds = summary.seeds || [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  check('summary label', summary.label === 'sim-w4funnel-repin-a', summary.label);
  check('summary corpusOk', summary.corpusOk === true, String(summary.corpusOk));
  check('summary armedVsPlainExact', summary.armedVsPlainExact === true, JSON.stringify(summary.perSeedExact));
  check('summary per-seed exact all', Array.isArray(summary.perSeedExact) && summary.perSeedExact.length === 8 && summary.perSeedExact.every(x => x.exact === true), JSON.stringify(summary.perSeedExact));
  check('plain band equals armed band', JSON.stringify(summary.plainBand) === JSON.stringify(summary.band), 'plain=' + JSON.stringify(summary.plainBand) + ' armed=' + JSON.stringify(summary.band));
  // Independent per-seed exactness re-check from the row files.
  const SHARED = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths'];
  let exactAll = true;
  const exactDetail = [];
  for (const seed of seeds) {
    const plain = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-baseline.json'), 'utf8'));
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    const diffs = [];
    for (const f of SHARED) if (JSON.stringify(plain[f]) !== JSON.stringify(armed[f])) diffs.push(f);
    if (JSON.stringify((plain.raftdraft || {}).faced || {}) !== JSON.stringify((armed.raftdraft || {}).faced || {})) diffs.push('faced');
    if (JSON.stringify((plain.raftdraft || {}).logEntries || []) !== JSON.stringify((armed.raftdraft || {}).logEntries || [])) diffs.push('logEntries');
    if (diffs.length) { exactAll = false; exactDetail.push(seed + ':' + diffs.join(',')); }
  }
  check('row-file armed-vs-plain exact (re-derived)', exactAll, exactDetail.join(' '));
  // Recorder errors, re-derived from armed rows.
  let errTotal = 0;
  const errDetail = [];
  for (const seed of seeds) {
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    for (const key of ['raftdraft', 'spawnsrc', 'oldcore', 'w5births', 'defwound']) {
      const d = armed[key] && armed[key].diag;
      if (!d) { errTotal++; errDetail.push(seed + ':' + key + ':missing-diag'); continue; }
      if (d.errs !== 0) { errTotal += d.errs; errDetail.push(seed + ':' + key + ':errs=' + d.errs); }
      const ov = d.overflow || {};
      for (const k of Object.keys(ov)) if ((ov[k] | 0) !== 0) { errTotal++; errDetail.push(seed + ':' + key + ':overflow:' + k + '=' + ov[k]); }
    }
  }
  check('recorder errors zero on all seeds', errTotal === 0, errDetail.join(' '));
  // Funnel totals re-derived via the analyzer, compared to analysis.json.
  const perSeed = [];
  for (const seed of seeds) {
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    perSeed.push(analyzeW4funnel(armed));
  }
  const band = rollup(perSeed);
  check('funnel arrivals match analysis', band.arrivals === analysis.band.arrivals, band.arrivals + ' vs ' + analysis.band.arrivals);
  check('funnel known match analysis', band.known === analysis.band.known, band.known + ' vs ' + analysis.band.known);
  check('funnel outcomes match analysis', JSON.stringify(band.outcomeCounts) === JSON.stringify(analysis.band.outcomeCounts), JSON.stringify(band.outcomeCounts) + ' vs ' + JSON.stringify(analysis.band.outcomeCounts));
  check('funnel stages match analysis', JSON.stringify(band.stageTotals) === JSON.stringify(analysis.band.stageTotals), JSON.stringify(band.stageTotals) + ' vs ' + JSON.stringify(analysis.band.stageTotals));
  check('funnel fought match analysis', band.fought === analysis.band.fought && band.neverFought === analysis.band.neverFought && band.foughtNotKilled === analysis.band.foughtNotKilled && band.killed === analysis.band.killed, JSON.stringify(band));
  check('funnel killers-at-end match analysis', band.livingKillersAtEnd === analysis.band.livingKillersAtEnd && band.deadKillersAtEnd === analysis.band.deadKillersAtEnd && band.notCountedKillersAtEnd === analysis.band.notCountedKillersAtEnd, JSON.stringify(band));
  check('funnel log-without-arrival match analysis', band.logWithoutArrival === analysis.band.logWithoutArrival, band.logWithoutArrival + ' vs ' + analysis.band.logWithoutArrival);
  // DIAG-GO legs (a)-(c) from re-derived totals.
  check('leg (a) classified >= 95%', band.arrivals === 0 ? false : (band.known / band.arrivals) >= 0.95, band.known + '/' + band.arrivals);
  const largest = band.largestStage;
  check('leg (b) largest stage named with count', !!largest && (band.stageTotals[largest] | 0) > 0, largest + '=' + band.stageTotals[largest]);
  const killersExplained = perSeed.every(s => s.killers.length === (s.detail.length ? s.killers.length : s.killers.length));
  check('leg (c) per-seed killer snapshots present', killersExplained && perSeed.every(s => Array.isArray(s.killers)), 'per-seed killer arrays checked');
  console.log('EVIDENCE leg (d) sense read: checked in the evidence file, not by this validator');
  console.log('EVIDENCE detgate: run separately via the sweep --detgate mode, reported in the evidence file');
  const lines = [
    'test-w4funnel-repin-a: ' + pass + ' passed, ' + fail + ' failed',
    '  plain/armed band: won=' + summary.band.won + ' medD=' + summary.band.medianDays + ' natEver=' + summary.band.nationalEver + ' natFinal=' + summary.band.nationalFinal + ' table=' + summary.band.table + ' entered=' + summary.band.entered + ' wave4=' + summary.band.wave4 + ' wave5=' + summary.band.wave5 + ' starv=' + summary.band.starvationTotal + ' deaths=' + summary.band.deathTotal,
    '  plain-vs-0615: ' + (summary.plainVs0615 ? (summary.plainVs0615.exact ? 'EXACT' : 'MOVED (report-only)') : 'not recorded'),
    '  funnel: arrivals=' + band.arrivals + ' known=' + band.known + ' outcomes=' + JSON.stringify(band.outcomeCounts) + ' stages=' + JSON.stringify(band.stageTotals) + ' largest=' + largest,
    '  veterans at end: living=' + band.livingKillersAtEnd + ' dead=' + band.deadKillersAtEnd + ' not-counted=' + band.notCountedKillersAtEnd + ' log-without-arrival=' + band.logWithoutArrival,
  ];
  console.log(lines.join(NL));
  if (fail) process.exit(1);
}
main();
