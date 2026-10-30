// analyze-journey-social-r73-outing-20261030.js -- r73 outing-bottleneck
// analyzer. Reads worktree evidence/2026-10-30/r73/journey-social-r73-s*.json
// (driver output) and prints: pooled start-block decomposition (adjFail +
// status reason), dawn-position census, per-favor timelines with
// kept-without-start flip days, forage-barren classification, and the
// dry guardrail numbers from the driver's own verdicts file when present.
// Usage: node scripts/analyze-journey-social-r73-outing-20261030.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-30', 'r73');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-r73-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const count = (rows, key) => { const o = {}; for (const r of rows) { const k = key(r); o[k] = (o[k] || 0) + 1; } return o; };
let attempts = [], blocked = [], starts = [], waits = [], nodeBarren = [], cellBlocked = [];
const favorRows = [];
for (const s of seeds) {
  const log = s.outingLog || [];
  attempts.push(...log.filter(r => r.step === 'start' || r.step === 'start-blocked'));
  blocked.push(...log.filter(r => r.step === 'start-blocked'));
  starts.push(...log.filter(r => r.step === 'start'));
  waits.push(...log.filter(r => r.step === 'wait'));
  nodeBarren.push(...log.filter(r => r.step === 'forage-node-barren'));
  cellBlocked.push(...log.filter(r => r.step === 'forage-cell-blocked'));
  const ends = {};
  for (const es of (s.favorEndStates || [])) ends[es.favorId] = es;
  const byFavor = {};
  for (const r of log) { (byFavor[r.favorId] = byFavor[r.favorId] || []).push(r); }
  for (const a of (s.favorAccepts || []).filter(x => x.accepted)) {
    const rows = (byFavor[a.favorId] || []).slice().sort((x, y) => x.day - y.day);
    const es = ends[a.favorId] || null;
    const firstKept = rows.find(r => r.diag && r.diag.promiseKept === true) ||
      (s.outingLog || []).filter(r => r.favorId === a.favorId && r.promiseKept === true).sort((x, y) => x.day - y.day)[0] || null;
    favorRows.push({ seed: s.seed || '?', vidName: a.vidName, favorId: a.favorId,
      acceptDay: a.day, meetDay: a.meetDay, attempts: rows.filter(r => r.step === 'start' || r.step === 'start-blocked').length,
      startDay: (rows.find(r => r.step === 'start') || {}).day || null,
      forages: rows.filter(r => r.step === 'forage').length,
      nodeBarren: rows.filter(r => r.step === 'forage-node-barren').length,
      delivers: rows.filter(r => r.step === 'deliver').length,
      endState: es ? es.state : null, promiseKept: es ? es.promiseKept : null,
      startedDay: es ? es.startedDay : null, deliveredKcal: es ? es.deliveredKcal : null,
      firstKeptDay: firstKept ? firstKept.day : null,
      firstKeptStep: firstKept ? firstKept.step : null,
      adjFails: count(rows.filter(r => r.step === 'start-blocked'), r => (r.diag && r.diag.adjFail) || 'NO-DIAG') });
  }
}
console.log('SEEDS: ' + seeds.map(s => (s.seed || '?') + ' ' + (s.days || s.endState && '') + 'd').join(', '));
for (const s of seeds) console.log('  funnel seed ' + (s.seed || '?') + ': ' + JSON.stringify(s.favorFunnel || {}));
console.log('\nDAWN ATTEMPTS pooled: ' + attempts.length + ' (starts ' + starts.length + ', blocked ' + blocked.length + ', waits ' + waits.length + ')');
console.log('BLOCKED by adjFail: ' + JSON.stringify(count(blocked, r => (r.diag && r.diag.adjFail) || 'NO-DIAG')));
console.log('BLOCKED by status reason: ' + JSON.stringify(count(blocked, r => (r.status && r.status.reason) || 'no-status')));
console.log('BLOCKED with NO diag: ' + blocked.filter(r => !r.diag).length + ' / ' + blocked.length);
const att = attempts.filter(r => r.diag && !r.diag.error);
console.log('DAWN CENSUS over ' + att.length + ' diag-carrying attempts:');
console.log('  playerAtHome: ' + att.filter(r => r.diag.playerAtHome).length);
console.log('  partnerNodeAtHome: ' + att.filter(r => r.diag.partnerNodeAtHome).length);
console.log('  insideMatch (partnerInside===playerInside): ' + att.filter(r => r.diag.partnerInside === r.diag.playerInside).length);
console.log('  partnerAway: ' + att.filter(r => r.diag.partnerAway).length);
console.log('  partnerPos null: ' + att.filter(r => r.diag.partnerPos === null).length);
console.log('  partnerNode defaulted (no nodePos): ' + att.filter(r => r.diag.partnerNode && r.diag.partnerNode.defaulted).length);
console.log('\nFORAGE-NODE-BARREN pooled: ' + nodeBarren.length);
console.log('  by targetCanForage: ' + JSON.stringify(count(nodeBarren, r => String(r.targetCanForage))));
console.log('FORAGE-CELL-BLOCKED pooled: ' + cellBlocked.length);
console.log('  by status reason: ' + JSON.stringify(count(cellBlocked, r => (r.status && r.status.reason) || 'no-status')));
console.log('\nPER-FAVOR TIMELINES (accepted forage favors):');
for (const fr of favorRows) console.log('  ' + JSON.stringify(fr));
const keptNoStart = favorRows.filter(fr => fr.promiseKept === true && !fr.startDay);
console.log('\nKEPT-WITHOUT-START: ' + keptNoStart.length);
for (const fr of keptNoStart) console.log('  ' + JSON.stringify(fr));
const verdictsPath = path.join(DIR, 'r73-verdicts.json');
if (fs.existsSync(verdictsPath)) {
  try { const v = JSON.parse(fs.readFileSync(verdictsPath, 'utf8')); console.log('\nDRIVER VERDICTS FILE: ' + JSON.stringify(v).slice(0, 2000)); }
  catch (e) { console.log('\nverdicts file unreadable: ' + e.message); }
}
