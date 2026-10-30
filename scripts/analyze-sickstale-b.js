#!/usr/bin/env node
// scripts/analyze-sickstale-b.js — aggregate trace-sickstale-b.js outputs
// into one pilot summary: per-seed staleHits / liveSickHits / days /
// endReason, plus pooled totals. No game code, reads JSON only.
// Usage: node scripts/analyze-sickstale-b.js <trace.json...> <summary-out.json>
'use strict';
const fs = require('fs');
const args = process.argv.slice(2);
if (args.length < 2) { console.error('usage: analyze-sickstale-b.js <trace.json...> <summary.json>'); process.exit(2); }
const out = args[args.length - 1];
const perSeed = args.slice(0, -1).map(f => {
  const t = JSON.parse(fs.readFileSync(f, 'utf8'));
  return { seed: t.seed, days: t.days, endReason: t.endReason, won: t.won,
    staleHits: t.staleHits, liveSickHits: t.liveSickHits,
    staleRows: t.staleRows || [], liveSickVids: t.liveSickVids || [] };
});
const summary = { perSeed,
  pooled: { seeds: perSeed.length,
    staleHits: perSeed.reduce((n, s) => n + s.staleHits, 0),
    liveSickHits: perSeed.reduce((n, s) => n + s.liveSickHits, 0) } };
fs.writeFileSync(out, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary.pooled));
