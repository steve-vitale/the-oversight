#!/usr/bin/env node
// sim-titanghost-b2-snap-analyze.js — B2 bar-2 checker for snapshot-diff
// twin JSONs (sim-titanghost-b2-snap.js outputs), plus timeline-identity
// checks against the trustbleed replay twins.
// Usage: node scripts/sim-titanghost-b2-snap-analyze.js \
//   <snapBeforeJson> <snapAfterJson> <replayBeforeJson> <replayAfterJson>
// Judges: (a) snap timelines reproduce the replay twins (trust series
// stripped of history, end fields, hunger days); (b) after-run
// muster-hunger entries: exactly one per active link per hunger day,
// amount -2, none on non-hunger days, none before (before-run entries
// must be 0); (c) price line on every hunger day (after).
'use strict';
const fs = require('fs');
const [sbPath, saPath, rbPath, raPath] = process.argv.slice(2);
if (!sbPath || !saPath || !rbPath || !raPath) {
  console.error('usage: sim-titanghost-b2-snap-analyze.js <snapBefore> <snapAfter> <replayBefore> <replayAfter>'); process.exit(2);
}
const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8')).snap;
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8')).snap;
const rb = JSON.parse(fs.readFileSync(rbPath, 'utf8')).trustbleed;
const ra = JSON.parse(fs.readFileSync(raPath, 'utf8')).trustbleed;
const PRICE = 'trust −2 per fire per day';
function stripSeries(series) {
  return (series || []).map(r => ({ day: r.day, links: (r.links || []).map(lk => ({ id: lk.id, villageId: lk.villageId, status: lk.status, trust: lk.trust })) }));
}
const snapBeforeSeries = JSON.stringify(stripSeries(sb.series));
const snapAfterSeries = JSON.stringify(stripSeries(sa.series));
const replayBeforeSeries = JSON.stringify(stripSeries(rb.series));
const replayAfterSeries = JSON.stringify(stripSeries(ra.series));
console.log('timeline: snap-before == replay-before trust series: ' + (snapBeforeSeries === replayBeforeSeries ? 'PASS' : 'FAIL'));
console.log('timeline: snap-after == replay-after trust series: ' + (snapAfterSeries === replayAfterSeries ? 'PASS' : 'FAIL'));
console.log('timeline: snap-before == snap-after trust series: ' + (snapBeforeSeries === snapAfterSeries ? 'PASS' : 'FAIL'));
console.log('timeline: end fields snap-after vs replay-after: ' +
  ((sa.endReason === ra.endReason && sa.gameDays === ra.gameDays && sa.endScaleRank === ra.endScaleRank) ? 'PASS' : 'FAIL') +
  ' (' + sa.endReason + ' day ' + sa.gameDays + ' rank ' + sa.endScaleRank + ')');
const hungerDays = (snap) => {
  const s = new Set();
  for (const l of (snap.hungerLines || [])) s.add(l.day);
  return s;
};
const hb = hungerDays(sb), ha = hungerDays(sa);
console.log('hunger days identical before/after: ' + (hb.size === ha.size && [...hb].every(d => ha.has(d)) ? 'PASS' : 'FAIL') + ' (' + hb.size + ' days)');
function entriesByDay(snap) {
  const m = {};
  for (const e of (snap.newEntries || [])) if (e.kind === 'muster-hunger') m[e.day] = (m[e.day] || 0) + 1;
  return m;
}
function activeByDay(snap) {
  const m = {};
  for (const r of (snap.series || [])) m[r.day] = (r.links || []).filter(lk => lk.status === 'active').length;
  return m;
}
const eb = entriesByDay(sb), ea = entriesByDay(sa), act = activeByDay(sa);
const beforeTotal = Object.values(eb).reduce((a, b) => a + b, 0);
const afterTotal = Object.values(ea).reduce((a, b) => a + b, 0);
console.log('muster-hunger entries before: ' + beforeTotal + ' (expect 0)');
console.log('muster-hunger entries after: ' + afterTotal);
let bar2 = beforeTotal === 0, detail = [];
for (const d of [...ha].sort((a, b) => a - b)) {
  const got = ea[d] || 0, want = act[d] || 0;
  if (got !== want) { bar2 = false; detail.push('day ' + d + ': entries ' + got + ' != active links ' + want); }
}
const nonHunger = Object.keys(ea).filter(d => !ha.has(parseInt(d, 10)));
if (nonHunger.length) { bar2 = false; detail.push('entries on non-hunger days: ' + nonHunger.join(',')); }
const badAmount = (sa.newEntries || []).filter(e => e.kind === 'muster-hunger' && e.amount !== -2);
if (badAmount.length) { bar2 = false; detail.push('entries with amount != -2: ' + badAmount.length); }
console.log('BAR2 one -2 entry per charged link per hunger day: ' + (bar2 ? 'PASS' : 'FAIL') + (detail.length ? ' — ' + detail.join('; ') : ''));
const priced = (sa.hungerLines || []).filter(l => l.line.indexOf(PRICE) >= 0).length;
console.log('BAR3 price line: ' + priced + '/' + (sa.hungerLines || []).length + (priced === (sa.hungerLines || []).length ? ' PASS' : ' FAIL'));
const go = snapBeforeSeries === replayBeforeSeries && snapAfterSeries === replayAfterSeries &&
  snapBeforeSeries === snapAfterSeries && bar2 && priced === (sa.hungerLines || []).length;
console.log('B2 (snap instrument): ' + (go ? 'GO' : 'NO-GO'));
