#!/usr/bin/env node
// compare-firenarr-deploy-b.js — pilot comparison for
// sim-firenarr-deploy-b. Reads an ON jsonl and an OFF jsonl
// (trace-firenarr-deploy-b.js output), and per shared seed
// reports: (a) predicted-vs-observed firenarr match on the ON
// leg (analyzer over the deploy-input series vs the lines the
// deploy actually spoke), (b) trajectory identity ON vs OFF
// (deploy-input series, deaths, endReason, daysAlive, alive
// count identical; say streams differ only by firenarr lines).
// Usage: node scripts/compare-firenarr-deploy-b.js <on.jsonl> <off.jsonl>
'use strict';
const fs = require('fs');
const { summarizeSeed } = require('./analyze-firenarr-deploy-b');

const [onPath, offPath] = process.argv.slice(2);
if (!onPath || !offPath) { console.error('usage: compare-firenarr-deploy-b.js <on.jsonl> <off.jsonl>'); process.exit(2); }
function load(path) {
  const m = new Map();
  for (const l of fs.readFileSync(path, 'utf8').split('\n').filter((x) => x.trim())) {
    const j = JSON.parse(l);
    m.set(j.seed, j);
  }
  return m;
}
const on = load(onPath);
const off = load(offPath);
let emitMatch = 0, emitTotal = 0, identMatch = 0, identTotal = 0, firingLegs = 0;
const firingKinds = [];
for (const seed of [...on.keys()].sort((a, b) => a - b)) {
  if (!off.has(seed)) { console.log(seed + ' SKIP (no OFF leg)'); continue; }
  const o = on.get(seed);
  const f = off.get(seed);
  const s = summarizeSeed(o);
  emitTotal++;
  if (s.match) emitMatch++;
  if (s.predicted.length) { firingLegs++; firingKinds.push(seed + ':' + s.predicted.map((e) => e.kind + (e.again ? ':again' : '')).join('+')); }
  const rowsEqual = JSON.stringify(o.rows) === JSON.stringify(f.rows);
  const deathsEqual = JSON.stringify(o.deaths) === JSON.stringify(f.deaths);
  const endEqual = o.endReason === f.endReason && o.daysAlive === f.daysAlive && o.alive === f.alive;
  const offSay = (f.sayLines || []).map((x) => x.line);
  const onExtra = (o.sayLines || []).map((x) => x.line).filter((l) => !offSay.includes(l));
  const sayOnlyFirenarr = onExtra.every((l) => (o.firenarrByNight || []).some((n) => n.line === l))
    && (o.firenarrByNight || []).every((n) => onExtra.includes(n.line));
  const ident = rowsEqual && deathsEqual && endEqual && sayOnlyFirenarr;
  identTotal++;
  if (ident) identMatch++;
  console.log(seed + ' emitMatch=' + s.match + ' predicted=' + s.predicted.map((e) => e.day + ':' + e.kind + (e.again ? ':again' : '')).join(',')
    + ' observed=' + s.observed.map((x) => x.day).join(',')
    + ' identity=' + ident + ' (rows=' + rowsEqual + ' deaths=' + deathsEqual + ' end=' + endEqual + ' sayOnlyFirenarr=' + sayOnlyFirenarr + ')'
    + ' daysAlive=' + o.daysAlive + ' ' + o.endReason);
}
console.log(`summary: emission ${emitMatch}/${emitTotal}, identity ${identMatch}/${identTotal}, firing legs ${firingLegs}`);
console.log('firing kinds: ' + firingKinds.join(' '));
