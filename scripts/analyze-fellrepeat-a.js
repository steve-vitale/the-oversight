#!/usr/bin/env node
// analyze-fellrepeat-a.js — pure reads over fellrepeat-trace-a corpora.
// Extracts the strand set (maximal runs of still creek evenings on
// consecutive loop-days), builds the per-morning refusal-count table
// for seed 15215 (every strand morning + loop-days 10/12/14 explicitly),
// and summarizes refusal counts across all seeds/days. Never writes
// into a corpus dir; output JSON goes to stdout or a given path.
'use strict';
const fs = require('fs');
const path = require('path');

function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[inst.seed] = inst;
  }
  return out;
}

function strandRuns(evenings) {
  const still = evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued)
    .map((e) => e.loopDay).sort((a, b) => a - b);
  const runs = [];
  for (const d of still) {
    const last = runs[runs.length - 1];
    if (last && d === last[last.length - 1] + 1) last.push(d);
    else runs.push([d]);
  }
  return { still, runs };
}

function analyzeLeg(dir) {
  const corpus = loadCorpus(dir);
  const seeds = {};
  for (const [seed, inst] of Object.entries(corpus)) {
    const { still, runs } = strandRuns(inst.evenings);
    const creek = inst.evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek').length;
    const rescued = inst.evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && e.woodcarry.rescued).length;
    const maxRef = Math.max(0, ...inst.evenings.map((e) => e.fellRefusalCount || 0));
    const daysGe2 = inst.evenings.filter((e) => (e.fellRefusalCount || 0) >= 2).map((e) => e.loopDay);
    const daysGe1 = inst.evenings.filter((e) => (e.fellRefusalCount || 0) >= 1).map((e) => e.loopDay);
    const totalRef = inst.evenings.reduce((a, e) => a + (e.fellRefusalCount || 0), 0);
    const totalSucc = inst.evenings.reduce((a, e) => a + (e.fellSuccessCount || 0), 0);
    const errs = (inst.woodcarryStore && inst.woodcarryStore.errs) || 0;
    seeds[seed] = {
      daysAlive: inst.daysAlive, endReason: inst.endReason,
      creek, still: still.length, rescued, strandRuns: runs,
      totalRefusals: totalRef, totalSuccesses: totalSucc, maxPerDay: maxRef,
      daysGe1, daysGe2, errs,
    };
  }
  return { dir, seeds };
}

// Per-morning table for one seed on one leg: every loop-day whose
// previous evening is a still creek evening, PLUS loop-days 10/12/14.
function morningTable(inst) {
  const rows = [];
  for (const e of inst.evenings) {
    const isStrandMorning = !!e.prevEveningStillCreek;
    const isNamed = e.loopDay === 10 || e.loopDay === 12 || e.loopDay === 14;
    if (!isStrandMorning && !isNamed) continue;
    const m = (inst.mornings || []).find((x) => x.loopDay === e.loopDay) || null;
    rows.push({
      loopDay: e.loopDay, strandMorning: isStrandMorning, namedDay: isNamed,
      prevEveningWoodcarry: null,
      morningWood: m ? m.morningWood : null,
      morningCut: m ? (m.morningCut || null) : null,
      fellRefusalCount: e.fellRefusalCount || 0,
      fellSuccessCount: e.fellSuccessCount || 0,
      fellRefusalLines: e.fellRefusalLines || [],
      transcriptStored: !!e.fullDaySay,
      eveningBucket: e.woodcarry ? e.woodcarry.bucket : null,
      eveningRescued: e.woodcarry ? !!e.woodcarry.rescued : null,
    });
  }
  // Previous-evening class: the evening row of loopDay-1.
  for (const r of rows) {
    const prev = inst.evenings.find((e) => e.loopDay === r.loopDay - 1);
    r.prevEvening = prev && prev.woodcarry
      ? { bucket: prev.woodcarry.bucket, rescued: !!prev.woodcarry.rescued } : null;
  }
  return rows;
}

function main() {
  const args = process.argv.slice(2);
  const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
  const dirs = args.filter((a) => !a.startsWith('--') && a !== outPath);
  const result = { legs: {}, morningTables: {} };
  for (const dir of dirs) {
    const leg = analyzeLeg(dir);
    result.legs[dir] = leg;
    const inst15215 = loadCorpus(dir)['15215'];
    if (inst15215) result.morningTables[dir] = morningTable(inst15215);
  }
  const text = JSON.stringify(result, null, 2);
  if (outPath) fs.writeFileSync(outPath, text);
  else process.stdout.write(text + '\n');
}
if (require.main === module) main();
module.exports = { loadCorpus, strandRuns, analyzeLeg, morningTable };
