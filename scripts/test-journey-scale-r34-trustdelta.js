// scripts/test-journey-scale-r34-trustdelta.js — proof for the r34 daily
// trust instrument. Extracts the driver's REAL linkOther + snapshotTrust
// functions (not a copy) and replays synthetic link histories through
// them; also asserts the driver wires the snapshot into policy.daily and
// carries trustWatch/trustEvents into the census. Run with an r33 driver
// path as argv[2] it must FAIL (RED: r33 has no snapshotTrust).
// Usage: node scripts/test-journey-scale-r34-trustdelta.js [driverPath]
'use strict';
const fs = require('fs');
const path = require('path');
const driverPath = process.argv[2] || path.join(__dirname, 'journey-scale-r34-20261025.js');
const src = fs.readFileSync(driverPath, 'utf8');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label); } }
// Static wiring assertions (fail on the r33 driver: no snapshotTrust anywhere).
ok(src.includes('function snapshotTrust()'), 'driver defines snapshotTrust');
ok(src.includes('snapshotTrust(); // R34'), 'policy.daily calls snapshotTrust');
ok(src.includes('trustWatch: trustWatch.slice()'), 'census carries trustWatch');
ok(src.includes('trustEvents: trustEvents.slice()'), 'census carries trustEvents');
ok(src.includes('prevHist'), 'driver keeps a prevHist diff set');
// Extract the real functions.
const loStart = src.indexOf('function linkOther');
const stStart = src.indexOf('function snapshotTrust');
const stEnd = src.indexOf('const CONVO_DAYS', stStart);
ok(loStart !== -1 && stStart !== -1 && stEnd !== -1, 'linkOther/snapshotTrust extractable from driver source');
if (loStart === -1 || stStart === -1 || stEnd === -1) { console.log(`trustdelta: ${pass} passed, ${fail} failed`); process.exit(1); }
const fnSrc = src.slice(loStart, stStart) + src.slice(stStart, stEnd);
// Stub the driver's globals: links() returns the current synthetic links,
// gday() returns the current synthetic day.
let testLinks = [], testDay = 0;
const links = () => testLinks;
const gday = () => testDay;
const trustWatch = [], trustEvents = [];
const prevHist = {};
const factory = new Function('links', 'gday', 'trustWatch', 'trustEvents', 'prevHist', fnSrc + '\nreturn { linkOther, snapshotTrust };');
const fns = factory(links, gday, trustWatch, trustEvents, prevHist);
// Day 10: one covenant link, formed, trust 30, one history entry.
testDay = 10;
testLinks = [{ id: 'l1', a: 'haven', b: 'vX', kind: 'covenant', status: 'active', trust: 30, day: 10, poolLive: false, history: [{ day: 10, kind: 'formed', note: 'vX joined the covenant.' }] }];
fns.snapshotTrust();
ok(trustWatch.length === 1 && trustWatch[0].trust === 30 && trustWatch[0].other === 'vX', 'day10 snapshot recorded (trust 30, other vX)');
ok(trustEvents.length === 1 && trustEvents[0].noteKind === 'formed', 'day10 formed history entry captured as event');
// Day 11: trust +1, one NEW history entry. Only the new entry is an event.
testDay = 11;
testLinks = [{ id: 'l1', a: 'haven', b: 'vX', kind: 'covenant', status: 'active', trust: 31, day: 10, poolLive: false, history: [{ day: 10, kind: 'formed', note: 'vX joined the covenant.' }, { day: 11, kind: 'pool', note: 'Pool week: Haven poured.' }] }];
fns.snapshotTrust();
ok(trustWatch.length === 2 && trustWatch[1].trust === 31, 'day11 snapshot recorded (trust 31)');
ok(trustEvents.length === 2 && trustEvents[1].noteKind === 'pool', 'day11 only the NEW entry became an event (no re-fire of formed)');
// Day 12: history capped (formed entry dropped), trust unchanged. No new event.
testDay = 12;
testLinks = [{ id: 'l1', a: 'haven', b: 'vX', kind: 'covenant', status: 'active', trust: 31, day: 10, poolLive: true, history: [{ day: 11, kind: 'pool', note: 'Pool week: Haven poured.' }] }];
fns.snapshotTrust();
ok(trustWatch.length === 3 && trustWatch[2].poolLive === true, 'day12 snapshot recorded poolLive flag');
ok(trustEvents.length === 2, 'day12 capped-history drop produced no phantom event');
// Inactive links are skipped.
testDay = 13;
testLinks = [{ id: 'l1', a: 'haven', b: 'vX', kind: 'covenant', status: 'broken', trust: 31, day: 10, poolLive: true, history: [] }];
fns.snapshotTrust();
ok(trustWatch.length === 3, 'inactive link produces no snapshot');
// Weekly-delta aggregation (the analyzer's logic, on synthetic points):
// +1/day for 7 days pre-pool, then flat post-pool, one -2 event week.
const pts = [];
for (let d = 10; d <= 16; d++) pts.push({ day: d, trust: 30 + (d - 10) });
for (let d = 17; d <= 23; d++) pts.push({ day: d, trust: 37 });
pts.push({ day: 24, trust: 35 });
const weekDelta = {};
for (let i = 1; i < pts.length; i++) { const d = pts[i].trust - pts[i - 1].trust; if (d !== 0) { const w = Math.floor(pts[i].day / 7); weekDelta[w] = (weekDelta[w] || 0) + d; } }
const poolDay = 17;
const pre = Object.keys(weekDelta).filter(w => (w * 7) < poolDay).reduce((s, w) => s + weekDelta[w], 0);
const post = Object.keys(weekDelta).filter(w => (w * 7) >= poolDay).reduce((s, w) => s + weekDelta[w], 0);
ok(pre === 7 && post === -2, `weekly delta split: pre-pool ${pre} (want 7), post-pool ${post} (want -2)`);
console.log(`trustdelta: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
