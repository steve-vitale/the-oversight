#!/usr/bin/env node
// test-fishfallback-b.js — validates the sim-fishfallback-b corpus (not the
// game). Per instrumented per-seed JSON in the corpus dir:
//   1. call accounting closes: ok + refused + null + other == fishCalls
//      (assignTask verb only).
//   2. classification completeness: every fishDays holder has a class in
//      {FRESH-OK, DEAL, APPEAL, STALE, GAP} and no holder is unclassified;
//      every FRESH-OK holder has a matching ok call that day for that vid;
//      every STALE holder's assignedDay < snapshot day OR it was pre-daily.
//   3. snapshot consistency: snapFishDays == fishDays.length.
//   4. arm/head/digest fields present; baseline and armed files for the
//      same seed carry DIFFERENT competent digests (the lever changed the
//      policy file) — unless --baseline-only is passed.
//   5. neutrality files (if present) match instrumented daysAlive/win/wave
//      for the same arm+seed+side.
// Usage: node scripts/test-fishfallback-b.js <corpus-dir> [seeds-csv]
//   [--baseline-only]  (seeds default: pilot band 9750-9757)
// Exit 0 = all checks pass; nonzero + FAIL lines otherwise. A missing
// expected file is a failure, never a silent skip.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const baselineOnly = process.argv.includes('--baseline-only');
const seedsArg = process.argv.find(a => /^\d+(,\d+)*$/.test(a));
const seeds = seedsArg ? seedsArg.split(',').map(Number) : [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
if (!dir) { console.error('usage: test-fishfallback-b.js <corpus-dir> [seeds-csv] [--baseline-only]'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => f.startsWith('fishfallback-b-') && f.endsWith('.json')).sort();
let fails = 0;
const fail = (f, m) => { fails += 1; console.log(`FAIL ${f}: ${m}`); };
const expected = [];
for (const s of seeds) {
  expected.push(`fishfallback-b-baseline-pd0-dg1-leadfeast-s${s}.json`);
  if (!baselineOnly) expected.push(`fishfallback-b-armed-pd0-dg1-leadfeast-s${s}.json`);
}
expected.push('fishfallback-b-neutral-baseline-pd0-dg1-leadfeast-s9754.json');
if (!baselineOnly) expected.push('fishfallback-b-neutral-armed-pd0-dg1-leadfeast-s9754.json');
for (const e of expected) if (!files.includes(e)) fail(e, 'expected corpus file missing');
const readJ = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { fail(f, `unparseable (${e.message})`); return null; } };
for (const f of files.filter(x => !x.includes('neutral'))) {
  const j = readJ(f); if (!j) continue;
  if (!j.arm || !j.head || !j.competentDigest) fail(f, 'missing arm/head/competentDigest');
  if (j.neutral) continue;
  const a = j.fishAgg;
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
if (!baselineOnly) {
  for (const s of seeds) {
    const b = readJ(`fishfallback-b-baseline-pd0-dg1-leadfeast-s${s}.json`);
    const a = readJ(`fishfallback-b-armed-pd0-dg1-leadfeast-s${s}.json`);
    if (b && a && b.competentDigest === a.competentDigest) fail(`s${s}`, 'baseline and armed competent digests identical — the lever did not change the policy file (or arms were run on the same tree state)');
  }
}
for (const f of files.filter(x => x.includes('neutral'))) {
  const n = readJ(f); if (!n) continue;
  const mate = files.find(x => !x.includes('neutral') && x.endsWith(`-s${n.seed}.json`) && x.includes(`-${n.arm}-`) && (x.includes(n.plentydepri === 1 ? '-pd1-' : '-pd0-')));
  if (!mate) { console.log(`NOTE ${f}: no instrumented mate found, neutrality unchecked`); continue; }
  const m = readJ(mate); if (!m) continue;
  if (n.daysAlive !== m.daysAlive || n.win !== m.win || n.waveReach !== m.waveReach || n.national !== m.national)
    fail(f, `neutrality mismatch vs ${mate}: neutral days=${n.daysAlive} win=${n.win} wave=${n.waveReach} national=${n.national} vs instrumented days=${m.daysAlive} win=${m.win} wave=${m.waveReach} national=${m.national}`);
  else console.log(`OK neutrality ${f} matches ${mate} (days=${n.daysAlive} win=${n.win} wave=${n.waveReach})`);
}
console.log(fails === 0 ? 'TEST PASS: all corpus checks green' : `TEST FAIL: ${fails} failure(s)`);
process.exit(fails === 0 ? 0 : 1);
