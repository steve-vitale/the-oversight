#!/usr/bin/env node
// analyze-scholaraway-b.js — scholar-presence census analyzer (DIAG ONLY).
// (sim-scholaraway-b; prereg: evidence/2026-11-01/sim-scholaraway-b-prereg.md,
// committed BEFORE any judged sim.)
//
// Reads one corpus dir of per-seed JSON files (as written by
// scripts/split-absencehunt-jsonl-b.js for the scholaraway trace driver)
// and writes a census JSON to <outFile>. Presence counts use ONLY the
// scholar's own snapshot fields (onTile = scholar tile IS haven tile;
// atHaven = playerAtHaven() distance <= 1, adjacent included).
//
// Verdict rule (prereg, fixed before judging): STRUCTURAL iff
// homecomings = 0 on >= 7/8 seeds AND unload = 0 on 8/8 AND
// haven-evenings <= 2 on every seed AND a named mechanism is supplied
// (the mechanism itself is a code-read claim in the evidence file, not
// something this analyzer invents — the analyzer reports the counts
// the rule consumes). Anything else = VARIANCE.
//
// Usage: node scripts/analyze-scholaraway-b.js <corpusDir> <outFile>
//   With out.json: writes the census JSON there. Without: prints it.
//   Exit 0 with the census; exit 2 on unreadable corpus dir.
'use strict';
const fs = require('fs');
const path = require('path');

const BUCKETS = [
  ['forage', /forag|gather|work the green|haul/i],
  ['teach', /teach|lesson|show us|fireside/i],
  ['travel', /travel|you walk|walk back|path is clear/i],
  ['campWild', /camp wild/i],
  ['hunger', /Hunger gnaws/i],
  ['combat', /\bfight\b|strike|beast|monster|attack/i],
];

function classifyDayLines(lines) {
  const hits = {};
  for (const [name] of BUCKETS) hits[name] = 0;
  let other = 0;
  for (const line of (lines || [])) {
    let matched = false;
    for (const [name, re] of BUCKETS) {
      if (re.test(line)) { hits[name]++; matched = true; }
    }
    if (!matched) other++;
  }
  hits.other = other;
  return hits;
}

function longestRun(evenings, pred) {
  let best = 0, cur = 0;
  for (const ev of evenings) {
    if (pred(ev)) { cur++; if (cur > best) best = cur; } else cur = 0;
  }
  return best;
}

function analyzeSeed(inst) {
  const evenings = inst.evenings || [];
  const mornings = inst.mornings || [];
  const homecomings = inst.homecomings || [];
  const deposits = inst.deposits || [];
  const sayLines = inst.sayLines || [];
  let havenEvenings = 0, atHavenEvenings = 0, adjacentEvenings = 0, complete = true;
  for (const ev of evenings) {
    const s = ev.snap;
    if (!s || s.px == null || s.py == null || s.hx == null || s.hy == null || s.atHaven == null) { complete = false; continue; }
    if (s.onTile) havenEvenings++;
    if (s.atHaven) atHavenEvenings++;
    if (s.atHaven && !s.onTile) adjacentEvenings++;
  }
  const liveReturns = homecomings.filter((h) => !h.overAtEntry);
  const deathReturns = homecomings.filter((h) => h.overAtEntry);
  // Unload = union over deposits: inside a returnToVillage call OR stack
  // names returnToVillage (supplyleg's rule). Each deposit counted once.
  let unloadKcal = 0, unloadEvents = 0, donateKcal = 0;
  for (const d of deposits) {
    if (d.inReturn || /returnToVillage/.test(d.stack || '')) { unloadKcal += d.kcal || 0; unloadEvents++; }
    else if (/donateToPantry/.test(d.stack || '')) donateKcal += d.kcal || 0;
  }
  const liveUnloadKcal = liveReturns.reduce((t, h) => t + (h.unloadKcal || 0), 0);
  const awayEvenings = evenings.filter((ev) => ev.snap && !ev.snap.onTile);
  const awayBuckets = { forage: 0, teach: 0, travel: 0, campWild: 0, hunger: 0, combat: 0, other: 0 };
  for (const ev of awayEvenings) {
    const hits = classifyDayLines(ev.dayLines || []);
    for (const k of Object.keys(awayBuckets)) awayBuckets[k] += hits[k];
  }
  const hungerLines = sayLines.filter((x) => /Hunger gnaws/.test(x.line || '')).length;
  const campWildLines = sayLines.filter((x) => /camp wild/i.test(x.line || '')).length;
  const unloadSayLines = sayLines.filter((x) => /unload .* kcal into Haven's pantry/.test(x.line || '')).length;
  const morningOnTile = mornings.filter((m) => m.snap && m.snap.onTile).length;
  return {
    seed: inst.seed, daysAlive: inst.daysAlive, endReason: inst.endReason,
    maxWaveUnlocked: inst.maxWaveUnlocked, waveKills: inst.waveKills,
    evenings: evenings.length, completeCapture: complete,
    havenEvenings, atHavenEvenings, adjacentEvenings,
    awayEvenings: awayEvenings.length, morningOnTile,
    longestWildStretch: longestRun(evenings, (ev) => ev.snap && !ev.snap.onTile),
    homecomingsLive: liveReturns.length, homecomingsDeathPath: deathReturns.length,
    unloadKcal, unloadEvents, liveUnloadKcal, donateKcal, unloadSayLines,
    awayBuckets, hungerLines, campWildLines,
    eveningDistances: evenings.map((ev) => (ev.snap ? ev.snap.dist : null)),
  };
}

// Prereg verdict rule over a seed band. `mechanismNamed` is supplied by
// the caller (evidence code-read); the analyzer never invents it.
function structuralVerdict(seedAnalyses, mechanismNamed) {
  const n = seedAnalyses.length;
  const zeroHome = seedAnalyses.filter((s) => s.homecomingsLive === 0).length;
  const zeroUnload = seedAnalyses.filter((s) => s.unloadKcal === 0).length;
  const lowHaven = seedAnalyses.filter((s) => s.havenEvenings <= 2).length;
  const structural = n > 0 && zeroHome >= n - 1 && zeroUnload === n && lowHaven === n && !!mechanismNamed;
  return { verdict: structural ? 'STRUCTURAL' : 'VARIANCE', n,
    zeroHomeSeeds: zeroHome, zeroUnloadSeeds: zeroUnload, lowHavenSeeds: lowHaven,
    mechanismNamed: !!mechanismNamed };
}

function main() {
  const dir = process.argv[2];
  const outFile = process.argv[3];
  if (!dir) { console.error('usage: analyze-scholaraway-b.js <corpusDir> [outFile]'); process.exit(2); }
  let files;
  try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort(); }
  catch (e) { console.error('cannot read corpus dir ' + dir); process.exit(2); }
  const seeds = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(inst));
  }
  const census = { seeds, verdictCounts: null };
  census.verdictCounts = {
    zeroHomeSeeds: seeds.filter((s) => s.homecomingsLive === 0).length,
    zeroUnloadSeeds: seeds.filter((s) => s.unloadKcal === 0).length,
    lowHavenSeeds: seeds.filter((s) => s.havenEvenings <= 2).length,
    totalSeeds: seeds.length,
  };
  const text = JSON.stringify(census, null, 2);
  if (outFile) fs.writeFileSync(outFile, text + '\n');
  else process.stdout.write(text + '\n');
  return census;
}

if (require.main === module) main();

module.exports = { classifyDayLines, analyzeSeed, structuralVerdict, longestRun };
