#!/usr/bin/env node
// sim-titanghost-b2-analyze.js — B2 bar checker for trustbleed twin JSONs.
// Usage: node scripts/sim-titanghost-b2-analyze.js <beforeJson> <afterJson>
// Both JSONs are trustbleed-replay-20261101.js outputs (MODE=intervene).
// LIMIT (stated, not hidden): the replay copies history entries as
// {day, kind, note} only — it strips the live amount field. So this
// analyzer verifies kind + day + note('−2') coverage from the stream;
// the amount === -2 itself is proven by scripts/test-titanghost-a.js
// B2 cases, which read live link.history objects. Bars 1-4 of the
// prereg; bar 5 is the unit test.
'use strict';
const fs = require('fs');
const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) { console.error('usage: sim-titanghost-b2-analyze.js <beforeJson> <afterJson>'); process.exit(2); }
const before = JSON.parse(fs.readFileSync(beforePath, 'utf8')).trustbleed;
const after = JSON.parse(fs.readFileSync(afterPath, 'utf8')).trustbleed;
const PRICE = 'trust −2 per fire per day';
const hungerDays = (tb) => {
  const s = new Set();
  for (const l of (tb.trustLines || [])) if (/muster is hungry/i.test(l.line)) s.add(l.day);
  return s;
};
const hb = hungerDays(before), ha = hungerDays(after);
const sameDays = hb.size === ha.size && [...hb].every(d => ha.has(d));
console.log('hunger days before: ' + [...hb].sort((a, b) => a - b).join(','));
console.log('hunger days after:  ' + [...ha].sort((a, b) => a - b).join(','));
console.log('BAR1 hunger-day set identical: ' + (sameDays ? 'PASS' : 'FAIL'));
// Entries per day (after), and per-day active-link counts.
function entriesByDay(tb) {
  const m = {};
  for (const r of (tb.series || [])) for (const lk of (r.links || [])) for (const h of (lk.historyNew || [])) {
    if (h.kind === 'muster-hunger') { m[h.day] = (m[h.day] || 0) + 1; }
  }
  return m;
}
function activeByDay(tb) {
  const m = {};
  for (const r of (tb.series || [])) {
    m[r.day] = (r.links || []).filter(lk => lk.status === 'active').length;
  }
  return m;
}
const eb = entriesByDay(before), ea = entriesByDay(after), act = activeByDay(after);
const beforeTotal = Object.values(eb).reduce((a, b) => a + b, 0);
const afterTotal = Object.values(ea).reduce((a, b) => a + b, 0);
console.log('muster-hunger entries before: ' + beforeTotal + ' (expect 0)');
console.log('muster-hunger entries after:  ' + afterTotal);
let bar2 = beforeTotal === 0, detail = [];
for (const d of [...ha].sort((a, b) => a - b)) {
  const got = ea[d] || 0, want = act[d] || 0;
  // Charged links = active links on a hunger day (the muster's villages
  // are all active until the day-103 break; after the break no link is
  // charged, so want = 0 there). Entries must equal active links.
  if (got !== want) { bar2 = false; detail.push('day ' + d + ': entries ' + got + ' != active links ' + want); }
}
console.log('BAR2 one entry per charged link per hunger day: ' + (bar2 ? 'PASS' : 'FAIL') + (detail.length ? ' — ' + detail.join('; ') : ''));
// Price line on every hunger day (after).
const afterHungerLines = (after.trustLines || []).filter(l => /muster is hungry/i.test(l.line));
const priced = afterHungerLines.filter(l => l.line.indexOf(PRICE) >= 0).length;
console.log('BAR3 price line on hunger days: ' + priced + '/' + afterHungerLines.length + (priced === afterHungerLines.length ? ' PASS' : ' FAIL'));
// Trust series identical (historyNew stripped — it is SUPPOSED to differ).
function stripSeries(tb) {
  return (tb.series || []).map(r => ({ day: r.day, links: (r.links || []).map(lk => ({ id: lk.id, villageId: lk.villageId, status: lk.status, trust: lk.trust, opinion: lk.opinion, arrears: lk.arrears })) }));
}
const seriesSame = JSON.stringify(stripSeries(before)) === JSON.stringify(stripSeries(after));
const endKeys = ['endReason', 'days', 'gameDays', 'endScaleRank', 'national', 'table', 'won', 'maxWave', 'wave4', 'wave5'];
const endDiffs = endKeys.filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
console.log('BAR4 trust series identical (history stripped): ' + (seriesSame ? 'PASS' : 'FAIL'));
console.log('BAR4 end fields identical: ' + (endDiffs.length ? 'FAIL (' + endDiffs.map(k => k + ':' + before[k] + '!=' + after[k]).join(', ') + ')' : 'PASS') +
  ' (end ' + after.endReason + ' day ' + after.days + ', rank ' + after.endScaleRank + ')');
// Say lines: after must equal before except hunger lines gain the price clause.
function norm(line) { return String(line).split(' (' + PRICE)[0]; }
const bl = (before.trustLines || []).map(l => l.day + '|' + l.line);
const al = (after.trustLines || []).map(l => l.day + '|' + norm(l.line));
const linesSame = JSON.stringify(bl) === JSON.stringify(al);
console.log('say lines identical except price clause: ' + (linesSame ? 'PASS' : 'FAIL') + ' (' + bl.length + ' vs ' + al.length + ' lines)');
const go = sameDays && bar2 && priced === afterHungerLines.length && seriesSame && !endDiffs.length && linesSame;
console.log('B2: ' + (go ? 'GO (bars 1-4; bar 5 = unit test)' : 'NO-GO'));
