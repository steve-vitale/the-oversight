#!/usr/bin/env node
// scripts/compare-unlockbeat-20261015.js — PRIMARY + guardrail verdicts for
// the Standing-path unlock announcement fix (sim-unlockbeat, 2026-10-15).
//   node scripts/compare-unlockbeat-20261015.js <sweep-out.json>
// Exit 0 = GO (primary met + all guardrails hold); non-zero = NO-GO.
'use strict';
const fs = require('fs');
const p = process.argv[2];
if (!p) { console.error('usage: compare-unlockbeat-20261015.js <sweep-out.json>'); process.exit(2); }
const O = JSON.parse(fs.readFileSync(p, 'utf8'));
const A = O.agg.armed, C = O.agg.control;
if (!A || !C) { console.error('FATAL: need agg.armed + agg.control (identical seeds, same sweep)'); process.exit(2); }

let fails = 0;
const verdict = (name, ok, detail) => {
  console.log(`${ok ? 'GO  ' : 'NO-GO'} ${name} — ${detail}`);
  if (!ok) fails++;
};

console.log(`=== unlockbeat === seeds=[${O.seeds.join(',')}] policies=[${O.policies.join(',')}] days=${O.days}`);
console.log(`armed:   unlocks=${A.unlockEvents} beats=${A.beatObserved} lag<=1d=${A.lagWithin1}/${A.unlockEvents} PRIMARY=${A.primaryShare == null ? 'n/a' : (A.primaryShare * 100).toFixed(1) + '%'} lagdist=[${A.lagDist.join(',')}]`);
console.log(`control: unlocks=${C.unlockEvents} beats=${C.beatObserved} lag<=1d=${C.lagWithin1}/${C.unlockEvents} PRIMARY=${C.primaryShare == null ? 'n/a' : (C.primaryShare * 100).toFixed(1) + '%'} lagdist=[${C.lagDist.join(',')}] (kill-gated baseline)`);
console.log(`armed:   medD=${A.medianDays} nat=${A.national} tab=${A.table} endReasons=${JSON.stringify(A.endReasons)}`);
console.log(`control: medD=${C.medianDays} nat=${C.national} tab=${C.table} endReasons=${JSON.stringify(C.endReasons)}`);

console.log('\n— PRIMARY (mechanism) —');
verdict('primary: >=80% of Standing-path w4/5 unlocks announced within 1d',
  A.primaryShare != null && A.primaryShare >= 0.80,
  `armed ${(A.primaryShare * 100).toFixed(1)}% (${A.lagWithin1}/${A.unlockEvents})`);

console.log('\n— GUARDRAILS —');
verdict('median survival >= control-10d', A.medianDays >= C.medianDays - 10,
  `armed ${A.medianDays}d vs control ${C.medianDays}d`);
verdict('national >= control-2', A.national >= C.national - 2,
  `armed ${A.national} vs control ${C.national} (n=${A.n} per side)`);
const newModes = Object.keys(A.deaths || {}).filter(f => (A.deaths[f] || 0) >= 3 && !(C.deaths || {})[f]);
verdict('no new death mode at cause-family level (armed-only, n>=3)', newModes.length === 0,
  newModes.length ? 'armed-only families: ' + newModes.map(f => `${f}:${A.deaths[f]}`).join(', ') : 'none');
const early = (A.lagEarly || 0);
verdict('no early beats (never precedes the unlock)', early === 0, `armed early beats=${early}`);

console.log('\n— SECONDARIES (reported, non-binding) —');
for (const side of ['armed', 'control']) {
  const outs = O.unlocks.filter(u => u.side === side && !u.coincident);
  const split = outs.reduce((m, u) => { m[u.outcome30] = (m[u.outcome30] || 0) + 1; return m; }, {});
  console.log(`${side}: 30d post-unlock split ${JSON.stringify(split)}`);
}

console.log(fails ? `\nVERDICT: NO-GO (${fails} failed)` : '\nVERDICT: GO');
process.exit(fails ? 1 : 0);
