#!/usr/bin/env node
// probe-gossip-anchor-a.js — find a current-substrate seed/day whose
// sleep window holds a 'Word gets around the haven' gossip line, to
// re-pin the stale 15003 loop-day-7 anchor shared by
// test-mootsummon-a.js and test-mootgate-a.js.
//
// The anchor is a mechanism check for the shared sleep-window
// machinery: the re-pin candidate must satisfy BOTH proof checks —
// (1) the loop-day's sleep window holds a 'word' gossip line, and
// (2) that hit's fire-time position is inside Haven.
//
// Two modes (no judged sims are produced; this is instrument work):
//   --corpus <dir>   scan committed per-seed JSON corpora on disk
//                    (fast, no sims; candidates still need live
//                    verification on the current tip before use).
//   --seeds 48001,48006,...  run oneInstance per seed on the current
//                    tip (substrate env gates required, same as the
//                    proofs) and scan the live transcripts.
// Usage: node scripts/probe-gossip-anchor-a.js --corpus evidence/2026-11-07/sim-mootsummon-a-repin-corpus
//        COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 \
//          node scripts/probe-gossip-anchor-a.js --seeds 48001,48006
'use strict';
const fs = require('fs');
const path = require('path');
const sn = require('./policies/strandnarr-diag');
const gc = require('./policies/gossipcensus-diag');
const { oneInstance, sleepPair } = require('./mootsummon-trace-a');

// Scan one instance's transcript: every loop-day sleep window, every
// gossip 'word' hit inside it. Returns candidate rows.
function scanInstance(seed, transcript, days) {
  const rows = [];
  const allWord = [];
  const wordPhaseCounts = {};
  for (const l of transcript.lines || []) {
    if (gc.isGossipWordLine && gc.isGossipWordLine(l.text)) {
      allWord.push(l);
      wordPhaseCounts[l.phase || '?'] = (wordPhaseCounts[l.phase || '?'] || 0) + 1;
    }
  }
  for (let ld = 1; ld <= (days || 60); ld++) {
    const pair = sleepPair(transcript.markers, ld);
    if (!pair) continue;
    const wlines = sn.windowLines(transcript, pair.start, pair.end);
    if (!wlines) continue;
    const gw = gc.classifyGossipWindow(wlines, transcript.markers);
    for (const h of (gw.hits || [])) {
      if (h.kind !== 'word') continue;
      rows.push({ seed, loopDay: ld, inside: !!(h.position && h.position.inside),
        tile: h.position && h.position.tile, text: h.text });
    }
  }
  return { rows, wordLinesTotal: allWord.length, wordPhaseCounts,
    wordLoopDays: [...new Set(allWord.map((l) => l.loopDay))].sort((a, b) => a - b) };
}

async function main() {
  const args = process.argv.slice(2);
  const ci = args.indexOf('--corpus');
  const si = args.indexOf('--seeds');
  if (ci >= 0) {
    const dir = args[ci + 1];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    for (const f of files) {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const { rows, wordLinesTotal, wordLoopDays } = scanInstance(d.seed, d.transcript, d.daysAlive);
      console.log('seed ' + d.seed + ': word lines total=' + wordLinesTotal
        + ' on loop-days [' + wordLoopDays.join(',') + ']'
        + ' | in-sleep-window word hits=' + rows.length
        + ' (trimmed corpus: say-tail lines not in transcript, see evidence)');
      for (const r of rows) {
        console.log('  CANDIDATE seed=' + r.seed + ' loopDay=' + r.loopDay
          + ' inside=' + r.inside + ' tile=' + r.tile + ' :: ' + r.text);
      }
    }
    return;
  }
  if (si >= 0) {
    for (const g of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI']) {
      if (process.env[g] !== '0') { console.log('SKIP: ' + g + '=0 required'); process.exit(2); }
    }
    if (process.env.DEPOSITGATE !== '1' || process.env.POLICY !== 'nighttravel'
      || process.env.WOODCARRY !== '1' || process.env.WOODWARM !== '0' || process.env.BANKFOOD !== '1') {
      console.log('SKIP: substrate gates not set (see header)'); process.exit(2);
    }
    process.env.STRANDNARR = '1';
    for (const s of args[si + 1].split(',')) {
      const seed = parseInt(s, 10);
      const inst = await oneInstance(seed, { days: 60 });
      const { rows, wordLinesTotal, wordPhaseCounts, wordLoopDays } = scanInstance(seed, inst.transcript, inst.daysAlive);
      console.log('seed ' + seed + ': daysAlive=' + inst.daysAlive + ' end=' + inst.endReason
        + ' word lines total=' + wordLinesTotal + ' on loop-days [' + wordLoopDays.join(',') + ']'
        + ' phases=' + JSON.stringify(wordPhaseCounts)
        + ' | in-sleep-window word hits=' + rows.length);
      for (const r of rows) {
        console.log('  CANDIDATE seed=' + r.seed + ' loopDay=' + r.loopDay
          + ' inside=' + r.inside + ' tile=' + r.tile + ' :: ' + r.text);
      }
    }
    return;
  }
  console.log('usage: --corpus <dir> | --seeds <csv>');
  process.exit(2);
}
main().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
