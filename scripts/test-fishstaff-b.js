#!/usr/bin/env node
// test-fishstaff-b.js — validates the sim-fishstaff-b corpus (not the game).
// Checks, per instrumented per-seed JSON in the corpus dir:
//   1. call accounting closes: ok + refused + null + other == fishCalls
//      (assignTask verb only), and deal/appeal calls are counted separately.
//   2. classification completeness: every fishDays holder has a class in
//      {FRESH-OK, DEAL, APPEAL, STALE, GAP} and no holder is unclassified.
//   3. snapshot consistency: snapFishDays == fishDays.length, and every
//      STALE holder's assignedDay < its snapshot day OR it was present
//      pre-daily (checked against dailySnaps).
//   4. every FRESH-OK holder has a matching ok call that day for that vid.
//   5. neutrality files (if present) match instrumented daysAlive/win/wave.
// Usage: node scripts/test-fishstaff-b.js <corpus-dir>
// Exit 0 = all checks pass; nonzero + FAIL lines otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: test-fishstaff-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => f.startsWith('fishstaff-b-') && f.endsWith('.json')).sort();
let fails = 0;
const fail = (f, m) => { fails += 1; console.log(`FAIL ${f}: ${m}`); };
// MANIFEST (this arm): 9 instrumented per-seed files (band 9750-9757 pd0
// + 9754 pd1) and 2 neutral files (9754 pd0 + pd1). A missing file is a
// failure, never a silent skip — a vacuous pass on a partial corpus once
// hid three flap-lost runs in this arm's history.
const expected = ['fishstaff-b-pd0-dg1-leadfeast-s9750.json', 'fishstaff-b-pd0-dg1-leadfeast-s9751.json',
  'fishstaff-b-pd0-dg1-leadfeast-s9752.json', 'fishstaff-b-pd0-dg1-leadfeast-s9753.json',
  'fishstaff-b-pd0-dg1-leadfeast-s9754.json', 'fishstaff-b-pd0-dg1-leadfeast-s9755.json',
  'fishstaff-b-pd0-dg1-leadfeast-s9756.json', 'fishstaff-b-pd0-dg1-leadfeast-s9757.json',
  'fishstaff-b-pd1-dg1-leadfeast-s9754.json',
  'fishstaff-b-neutral-pd0-dg1-leadfeast-s9754.json', 'fishstaff-b-neutral-pd1-dg1-leadfeast-s9754.json'];
for (const e of expected) if (!files.includes(e)) fail(e, 'expected corpus file missing');
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
  catch (e) { fail(f, `unparseable corpus file (${e.message}) — flap placeholder or truncated write, not a game result`); continue; }
  const a = j.fishAgg;
  if (j.neutral) continue; // neutrality files checked in step 5 below
  const at = j.fishCalls.filter(c => c.verb === 'assignTask');
  const ok = at.filter(c => c.ret === 'ok').length;
  const ref = at.filter(c => c.ret === 'refused').length;
  const nul = at.filter(c => c.ret === 'null').length;
  const oth = at.length - ok - ref - nul;
  if (ok !== a.fishOk || ref !== a.fishRefused || nul !== a.fishNull || oth !== a.fishOther)
    fail(f, `call accounting: counted ok=${ok} ref=${ref} null=${nul} other=${oth} vs agg ok=${a.fishOk} ref=${a.fishRefused} null=${a.fishNull} other=${a.fishOther}`);
  if (a.fishCalls !== at.length) fail(f, `fishCalls ${a.fishCalls} != assignTask calls ${at.length}`);
  if (j.fishDays.length !== a.snapFishDays) fail(f, `snapFishDays ${a.snapFishDays} != fishDays ${j.fishDays.length}`);
  const allowed = new Set(['FRESH-OK', 'DEAL', 'APPEAL', 'STALE', 'GAP']);
  for (const fd of j.fishDays) {
    for (const h of fd.holders) {
      if (!allowed.has(h.class)) fail(f, `day ${fd.day} holder ${h.vid} bad class ${h.class}`);
      if (h.class === 'FRESH-OK' && !j.fishCalls.some(c => c.verb === 'assignTask' && c.vid === h.vid && c.day === fd.day && c.ret === 'ok'))
        fail(f, `day ${fd.day} FRESH-OK holder ${h.vid} has no ok call that day`);
      if (h.class === 'STALE') {
        const snap = j.dailySnaps.find(s => s.day === fd.day);
        const preHas = snap && snap.pre.some(p => p.vid === h.vid);
        if (!(h.assignedDay < fd.day || preHas)) fail(f, `day ${fd.day} STALE holder ${h.vid} assignedDay ${h.assignedDay} not earlier and not pre-daily`);
      }
    }
  }
}
// Neutrality: match daysAlive/win/waveRank fields vs instrumented same seed+side.
for (const f of files.filter(x => x.includes('neutral'))) {
  let n;
  try { n = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
  catch (e) { fail(f, `unparseable neutral file (${e.message})`); continue; }
  const mate = files.find(x => !x.includes('neutral') && x.endsWith(`-s${n.seed}.json`) && (x.includes(n.plentydepri === 1 ? '-pd1-' : '-pd0-')));
  if (!mate) { console.log(`NOTE ${f}: no instrumented mate found, neutrality unchecked`); continue; }
  const m = JSON.parse(fs.readFileSync(path.join(dir, mate), 'utf8'));
  if (n.daysAlive !== m.daysAlive || n.win !== m.win || n.waveReach !== m.waveReach || n.national !== m.national)
    fail(f, `neutrality mismatch vs ${mate}: neutral days=${n.daysAlive} win=${n.win} wave=${n.waveReach} national=${n.national} vs instrumented days=${m.daysAlive} win=${m.win} wave=${m.waveReach} national=${m.national}`);
  else console.log(`OK neutrality ${f} matches ${mate} (days=${n.daysAlive} win=${n.win} wave=${n.waveReach})`);
}
console.log(fails === 0 ? 'TEST PASS: all corpus checks green' : `TEST FAIL: ${fails} failure(s)`);
process.exit(fails === 0 ? 0 : 1);
