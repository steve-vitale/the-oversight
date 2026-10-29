#!/usr/bin/env node
// analyze-lackingline-screen-b.js — screen census for
// sim-lackingline-b (prereg: evidence/2026-10-29/
// sim-lackingline-b-prereg.md).
//
// Reads woodcarry3-trace-b.js corpus JSONs (one per seed)
// and reports, per seed: ON creek evenings (woodcarry
// records with bucket creek), still-refused ON creek
// evenings (bucket creek AND a lacking-line narration AND
// rescued === false), skip-reason breakdown, and the live
// gate numbers (woodPlayer / kcalLive / ticksToDayEnd)
// on each creek evening. Pure reads over JSON; draws no
// RNG, writes no game state. Output: a census JSON
// (stdout when no --out, else that file) plus a human
// summary on stderr.
'use strict';
const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  const dir = args[0];
  const out = (args[1] === '--out' && args[2]) ? args[2] : null;
  if (!dir) { console.error('usage: node scripts/analyze-lackingline-screen-b.js <corpus-dir> [--out <file>]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const creek = [];
    const still = [];
    const skips = {};
    const outcomeDist = {};
    let travelRefused = 0;
    for (const e of (inst.evenings || [])) {
      outcomeDist[e.eveningOutcome] = (outcomeDist[e.eveningOutcome] || 0) + 1;
      if (e.woodcarry && e.woodcarry.outcome === 'travel-refused') travelRefused++;
    }
    for (const e of (inst.evenings || [])) {
      const wc = e.woodcarry;
      if (!wc || wc.outcome !== 'travel-refused' || wc.bucket !== 'creek') continue;
      const cls = wc.classification || {};
      const kcalLive = (cls.kcalLive === null || cls.kcalLive === undefined) ? cls.kcal : cls.kcalLive;
      const rec = {
        loopDay: e.loopDay,
        skip: wc.bridge ? (wc.bridge.attempted ? (wc.bridge.built ? 'retry?' : 'build-refused') : wc.bridge.skip) : null,
        bridgeAttempted: wc.bridge ? !!wc.bridge.attempted : null,
        bridgeBuilt: wc.bridge ? wc.bridge.built : null,
        retryArrived: wc.retry ? wc.retry.arrived : null,
        rescued: wc.rescued,
        narration: wc.narration || null,
        woodPlayer: cls.woodPlayer === undefined ? null : cls.woodPlayer,
        kcalLive,
        ticksToDayEnd: cls.ticksToDayEnd === undefined ? null : cls.ticksToDayEnd,
        carrySkip: e.woodcarryCarry ? e.woodcarryCarry.skip : null,
        carryActed: e.woodcarryCarry ? !!e.woodcarryCarry.acted : null,
        inside: e.inside, tile: e.tile, mapPx: e.mapPx, mapPy: e.mapPy,
        eveningOutcome: e.eveningOutcome,
      };
      // The lever's own skip reason for a non-attempt is
      // bridge.skip; for an attempted build that failed it
      // is build-refused; for a built bridge with a failed
      // retry it is retry-refused. Recover the narration's
      // skip from the record shape, not from the string.
      // A rescued evening has NO skip — the lever did not
      // refuse — so its skip is null, never a placeholder.
      if (wc.rescued) rec.skip = null;
      else if (wc.bridge && wc.bridge.attempted && wc.bridge.built && wc.retry && !wc.retry.arrived) rec.skip = 'retry-refused';
      else if (wc.bridge && wc.bridge.attempted && !wc.bridge.built) rec.skip = 'build-refused';
      creek.push(rec);
      if (wc.narration && wc.rescued === false) {
        still.push(rec);
        skips[rec.skip || 'unknown'] = (skips[rec.skip || 'unknown'] || 0) + 1;
      }
    }
    perSeed.push({
      seed: inst.seed, endReason: inst.endReason, daysAlive: inst.daysAlive,
      errs: inst.woodcarryStore ? inst.woodcarryStore.errs : null,
      unclassified: inst.woodcarryStore ? inst.woodcarryStore.unclassified : null,
      outcomeDist, travelRefused,
      creekEvenings: creek.length, stillRefused: still.length,
      skips, creek, still,
    });
  }
  const census = {
    seedsScreened: perSeed.length,
    totalCreekEvenings: perSeed.reduce((a, s) => a + s.creekEvenings, 0),
    totalStillRefused: perSeed.reduce((a, s) => a + s.stillRefused, 0),
    perSeed,
  };
  const text = JSON.stringify(census, null, 2);
  if (out) fs.writeFileSync(out, text + '\n');
  else process.stdout.write(text + '\n');
  for (const s of perSeed) {
    console.error(`seed ${s.seed}: end=${s.endReason} days=${s.daysAlive} creek=${s.creekEvenings} still=${s.stillRefused} skips=${JSON.stringify(s.skips)} errs=${s.errs} unclassified=${s.unclassified}`);
  }
  console.error(`TOTAL: seeds=${census.seedsScreened} creek=${census.totalCreekEvenings} still=${census.totalStillRefused}`);
}
main();
