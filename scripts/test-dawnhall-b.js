#!/usr/bin/env node
// test-dawnhall-b.js — proof for the dawnhall tracer
// and measurement (sim-dawnhall-b).
//
// Usage:
//   node scripts/test-dawnhall-b.js --corpus <dir>
//     [--seeds 10710,...,10725]
// Legs:
//   T1 corpus completeness (one file per seed)
//   T2 evening + morning rows carry position (no gaps)
//   T3 interval coverage: every miss has an evening and a
//        morning checkpoint bracketing it, with >= 1 interval
//        record between them (post-sleep / upkeep checkpoints)
//   T4 trace completeness: every miss on the band is traced
//        (no untraced miss) — the prereg primary metric
//   T5 reproduction: the miss set on the reused 1930Z
//        confirm band equals the 1930Z set (10712/21,
//        10720/18, 10722/30); a mismatch FAILS here and must
//        be explained in metric review, not silently passed
//   T6 sense anchor: at least one completed evening's tail
//        contains 'You step into the Haven hall.'
//   T7 wall numbers present for every seed (daysAlive +
//        maxWaveUnlocked recorded, even when zero)
// Exits 0 with PROOF-GREEN iff every leg passes.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze } = require('./analyze-dawnhall-b');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const corpusDir = arg('corpus', null);
const seeds = arg('seeds', '10710,10711,10712,10713,10714,10715,10716,10717,10718,10719,10720,10721,10722,10723,10724,10725')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!corpusDir) { console.error('usage: --corpus <dir> [--seeds ...]'); process.exit(2); }

const fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}

let t1 = true;
const loaded = {};
for (const s of seeds) {
  const f = path.join(corpusDir, `dawnhall-b-insideevening-s${s}.json`);
  if (!fs.existsSync(f)) { t1 = false; console.log('  missing seed ' + s); continue; }
  loaded[s] = JSON.parse(fs.readFileSync(f, 'utf8'));
}
check('T1 corpus completeness', t1, seeds.length + ' seeds');

let t2 = true, t6 = false, t7 = true;
for (const s of seeds) {
  const j = loaded[s]; if (!j) continue;
  for (const e of (j.evenings || [])) {
    if (e.inside === null || e.inside === undefined || e.tile === null || e.tile === undefined || !e.eveningOutcome) t2 = false;
    if (e.eveningOutcome === 'completed' && (e.eveningSayTail || []).some((l) => /You step into the Haven hall\./.test(l))) t6 = true;
  }
  for (const m of (j.mornings || [])) {
    if (m.inside === null || m.inside === undefined || m.tile === null || m.tile === undefined) t2 = false;
  }
  if (j.daysAlive === undefined || j.maxWaveUnlocked === undefined) t7 = false;
}
check('T2 evening+morning rows carry position', t2);
check('T6 sense anchor (hall step line present)', t6);
check('T7 wall numbers present per seed', t7);

const a = analyze(corpusDir, seeds);
let t3 = true;
for (const m of a.missList) {
  if (m.intervalCount < 1) { t3 = false; console.log('  miss with no interval records: seed ' + m.seed + ' morning ' + m.morningLoopDay); }
}
check('T3 interval coverage (every miss bracketed)', t3, a.misses + ' misses, ' + a.missList.filter((m) => m.intervalCount >= 1).length + ' bracketed');
check('T4 trace completeness 100%', a.untraced === 0, `misses=${a.misses} traced=${a.traced} untraced=${a.untraced}`);
const expected = ['10712:21', '10720:18', '10722:30'];
const got = a.missList.map((m) => m.seed + ':' + m.morningLoopDay).sort();
const exp = [...expected].sort();
check('T5 reproduction of 1930Z confirm miss set', JSON.stringify(got) === JSON.stringify(exp), 'got=' + JSON.stringify(got) + ' expected=' + JSON.stringify(exp));
// T8: prereg primary metric — fight-origin completeness 100%
// on the reproduced 3 (fighter identity + provenance +
// pending route when applicable). T9: instrument presence —
// every corpus file carries fightOrigins, and every miss
// interval carries at least one fight-origin record.
check('T8 fight-origin completeness 100% on expected 3', a.expectedMisses === 3 && a.expectedOriginComplete === 3, `expected=${a.expectedMisses} complete=${a.expectedOriginComplete} overall=${a.originComplete}/${a.misses}`);
let t9 = true;
for (const s of seeds) {
  const j = loaded[s]; if (!j) continue;
  if (!Array.isArray(j.fightOrigins)) { t9 = false; console.log('  no fightOrigins array: seed ' + s); }
}
for (const m of a.missList) {
  if (!m.fightOrigin || m.fightOrigin.intervalOriginCount < 1) { t9 = false; console.log('  miss with no interval fight-origin records: seed ' + m.seed + ' morning ' + m.morningLoopDay); }
  if (m.fightOrigin && m.fightOrigin.incompleteReasons) for (const r of m.fightOrigin.incompleteReasons) console.log('  origin gap seed ' + m.seed + ':' + m.morningLoopDay + ' — ' + r);
}
check('T9 fight-origin records present per miss interval', t9);

if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
console.log('PROOF-GREEN');
