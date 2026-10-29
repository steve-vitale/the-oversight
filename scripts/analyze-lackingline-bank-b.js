#!/usr/bin/env node
// analyze-lackingline-bank-b.js — OFF-leg banking census for
// sim-lackingline2-b (prereg: evidence/2026-10-29/
// sim-lackingline2-b-prereg.md).
//
// Reads woodcarry3-trace-b.js OFF corpora (WOODCARRY=0, one
// per seed) and reports, per seed: OFF creek evenings
// (woodcarry record outcome travel-refused, bucket creek),
// creek episodes (maximal runs of consecutive loop-days with
// a creek evening), errs, unclassified, outcome distribution.
// A seed QUALIFIES for the bank iff creekEvenings >= 1.
// Pure reads over JSON; draws no RNG, writes no game state.
// Output: a census JSON (stdout when no --out, else that
// file) plus a human summary on stderr. The --bank N option
// also prints the first N qualifiers in screen order.
'use strict';
const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  const dir = args[0];
  let out = null, bankN = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--out') out = args[++i];
    else if (args[i] === '--bank') bankN = parseInt(args[++i], 10);
  }
  if (!dir) { console.error('usage: node scripts/analyze-lackingline-bank-b.js <corpus-dir> [--out <file>] [--bank N]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) => {
    const sa = parseInt((a.match(/s(\d+)\.json$/) || [])[1] || '0', 10);
    const sb = parseInt((b.match(/s(\d+)\.json$/) || [])[1] || '0', 10);
    return sa - sb;
  });
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const creekDays = [];
    const outcomeDist = {};
    let travelRefused = 0;
    for (const e of (inst.evenings || [])) {
      outcomeDist[e.eveningOutcome] = (outcomeDist[e.eveningOutcome] || 0) + 1;
      const wc = e.woodcarry;
      if (wc && wc.outcome === 'travel-refused') travelRefused++;
      if (wc && wc.outcome === 'travel-refused' && wc.bucket === 'creek') creekDays.push(e.loopDay);
    }
    // Episodes: maximal consecutive-day runs of creek evenings.
    const episodes = [];
    for (const d of creekDays) {
      const last = episodes[episodes.length - 1];
      if (last && d === last.end + 1) last.end = d;
      else episodes.push({ start: d, end: d });
    }
    const epStr = episodes.map((ep) => (ep.start === ep.end ? String(ep.start) : ep.start + '-' + ep.end));
    perSeed.push({
      seed: inst.seed, endReason: inst.endReason, daysAlive: inst.daysAlive,
      errs: inst.woodcarryStore ? inst.woodcarryStore.errs : null,
      unclassified: inst.woodcarryStore ? inst.woodcarryStore.unclassified : null,
      outcomeDist, travelRefused,
      creekEvenings: creekDays.length, creekDays,
      episodes: epStr, episodeCount: episodes.length,
      qualifier: creekDays.length >= 1,
    });
  }
  const qualifiers = perSeed.filter((s) => s.qualifier).map((s) => s.seed);
  const census = {
    seedsScreened: perSeed.length,
    seedRange: perSeed.length ? [perSeed[0].seed, perSeed[perSeed.length - 1].seed] : null,
    totalCreekEvenings: perSeed.reduce((a, s) => a + s.creekEvenings, 0),
    totalEpisodes: perSeed.reduce((a, s) => a + s.episodeCount, 0),
    qualifierCount: qualifiers.length,
    qualifiers,
    bank: bankN ? qualifiers.slice(0, bankN) : qualifiers,
    perSeed,
  };
  const text = JSON.stringify(census, null, 2);
  if (out) fs.writeFileSync(out, text + '\n');
  else process.stdout.write(text + '\n');
  for (const s of perSeed) {
    console.error(`seed ${s.seed}: end=${s.endReason} days=${s.daysAlive} creek=${s.creekEvenings} episodes=[${s.episodes.join(',')}] errs=${s.errs} unclassified=${s.unclassified} qualifier=${s.qualifier}`);
  }
  console.error(`TOTAL: seeds=${census.seedsScreened} creekEvenings=${census.totalCreekEvenings} episodes=${census.totalEpisodes} qualifiers=${census.qualifierCount} bank=[${census.bank.join(',')}]`);
}
main();
