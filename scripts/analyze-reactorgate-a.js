#!/usr/bin/env node
// analyze-reactorgate-a.js — pure reads over the reactorgate
// corpora: day-13 bridge-decision gate inputs + reactor state,
// day 14+ persistence on still evenings, narration verbatim.
// Usage: node scripts/analyze-reactorgate-a.js <corpus-dir...> 
// Prints a JSON report to stdout. Never writes, never draws RNG.
'use strict';
const fs = require('fs');
const path = require('path');

function loadLeg(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  if (files.length !== 1) throw new Error(dir + ': expected 1 seed file, got ' + files.length);
  const inst = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));
  if (inst.seed !== 15215) throw new Error(dir + ': expected seed 15215, got ' + inst.seed);
  return inst;
}

function stillEvenings(inst) {
  return (inst.evenings || []).filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued);
}

function rowOf(inst, loopDay) {
  return (inst.evenings || []).find((e) => e.loopDay === loopDay) || null;
}

function gateRow(e) {
  const cls = (e.woodcarry || {}).classification || {};
  const bridge = (e.woodcarry || {}).bridge || {};
  return {
    loopDay: e.loopDay,
    woodPlayer: cls.woodPlayer === undefined ? null : cls.woodPlayer,
    kcal: cls.kcal === undefined ? null : cls.kcal,
    kcalLive: cls.kcalLive === undefined ? null : cls.kcalLive,
    kcalRow: (e.reactor || {}).kcalRow === undefined ? null : e.reactor.kcalRow,
    ticksToDayEnd: cls.ticksToDayEnd === undefined ? null : cls.ticksToDayEnd,
    skip: bridge.skip === undefined ? null : bridge.skip,
    attempted: bridge.attempted === undefined ? null : bridge.attempted,
    narration: (e.woodcarry || {}).narration || null,
    reactor: e.reactor || null,
    reactorInstallLine: !!e.reactorInstallLine,
    fullDaySay: e.fullDaySay || null,
  };
}

function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('usage: analyze-reactorgate-a.js <corpus-dir...>'); process.exit(2); }
  const legs = {};
  for (const dir of dirs) {
    const inst = loadLeg(dir);
    const still = stillEvenings(inst);
    const day13 = rowOf(inst, 13);
    const after = still.filter((e) => e.loopDay > 13).map(gateRow);
    const installDays = (inst.evenings || []).filter((e) => e.reactorInstallLine).map((e) => e.loopDay);
    legs[path.basename(dir)] = {
      seed: inst.seed, endReason: inst.endReason, daysAlive: inst.daysAlive,
      errs: { wc: inst.woodcarryStore.errs, ww: inst.warmthStore.errs, pb: inst.pressbStore.errs },
      stillDays: still.map((e) => e.loopDay),
      installDays,
      day13: day13 ? gateRow(day13) : null,
      day13Present: !!day13,
      day13Still: day13 ? !!(day13.woodcarry && day13.woodcarry.bucket === 'creek' && !day13.woodcarry.rescued) : false,
      after13: after,
    };
  }
  console.log(JSON.stringify({ legs }, null, 2));
}
main();
