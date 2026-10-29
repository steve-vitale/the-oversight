#!/usr/bin/env node
// scripts/test-tilejoin-a-sense.js — corpus trace reading (SENSE-
// TESTING LAW). Prints, per leg, the first joined fight transcript
// (ON), else the first shouted fight, else the first tile-present
// hopeless flee (the attempted-join shape). Prints SENSE-OK when at
// least one transcript is printed; the JUDGMENT (does it read like
// people?) lives in the evidence file, never here.
// Usage: node scripts/test-tilejoin-a-sense.js [off|on] (default on).
// Reads evidence/2026-10-29/perseed-tilejoin-a/<leg>/ (EVID override).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function main() {
  const leg = process.argv[2] || 'on';
  const dir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-tilejoin-a', leg);
  let printed = 0;
  for (const seed of SEEDS) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const s = (row.tilejoin || {}).sense || {};
    for (const key of ['joined', 'shouted', 'tileHopelessFlee']) {
      const t = s[key];
      if (!t) continue;
      console.log(`=== ${leg} s${seed} sense:${key} day=${t.day} ${t.vid} vs ${t.mid} w${t.wave} ${t.caller} r${t.rounds} ${t.outcome} fed=${JSON.stringify(t.fedVids)} joined=${t.joinedAllyVid} dealt=${t.mDealt} taken=${t.vTaken} allyDealt=${t.allyDealt} allyTaken=${t.allyTaken} ===`);
      for (const line of (t.log || [])) console.log(line);
      console.log(`=== end ${key} ===`);
      printed++;
      break; // first sense slot per seed only; the first seed with one wins overall below
    }
    if (printed) break;
  }
  // Also count sense slots across the band for the evidence table.
  let counts = { joined: 0, shouted: 0, tileHopelessFlee: 0 };
  for (const seed of SEEDS) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const s = (row.tilejoin || {}).sense || {};
    for (const k of Object.keys(counts)) if (s[k]) counts[k]++;
  }
  console.log(`SENSE-SLOTS ${leg}: ${JSON.stringify(counts)}`);
  console.log(printed ? 'SENSE-OK' : 'SENSE-EMPTY');
  if (!printed) process.exit(1);
}
main();
