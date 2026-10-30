#!/usr/bin/env node
// test-recorderfix-a.js — proof for sim-recorderfix-a (instrument fix
// for the round-1639 loss-day snapshot gap, sim-tributecost-a bar 2).
//   F1 (fixtures): endRunSnapshot() reads scholar day, pantry kcal
//     (kcalEach*units sum, rounded), and roster length from pure
//     reads, and tolerates missing state.
//   F2 (live, leanlink, 180d, seed 9913, LEANLINK=1): the run must
//     end village-lost (the tributecost pilot loss seed), the daily
//     series must be days or days-1 (the loss day may yield no
//     post-daily snapshot), and the end-of-run snapshot must be
//     present with scholarDay == days — i.e. the loss day's final
//     state is captured even when the series is short by one.
//     Tele death capture must still match the harness capture.
// The full 8-seed pilot band runs as a separate sweep process, not
// inside this test: two harnesses must never share one node process.
// Usage: node scripts/test-recorderfix-a.js
'use strict';
const { endRunSnapshot, runSeed } = require('./sweep-tributecost-a');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(function f1() {
  const fake = { state: {
    scholar: { day: 129 },
    village: { pantry: [{ kcalEach: 500, units: 3 }, { kcalEach: 250, units: 2 }], roster: ['a', 'b', 'c'] },
  } };
  const s = endRunSnapshot(fake);
  check('F1 snapshot day', s.scholarDay === 129, 'got ' + s.scholarDay);
  check('F1 snapshot pantry 500*3+250*2=2000', s.pantryKcal === 2000, 'got ' + s.pantryKcal);
  check('F1 snapshot pop 3', s.pop === 3, 'got ' + s.pop);
  const empty = endRunSnapshot({});
  check('F1 snapshot tolerates missing state', empty.scholarDay === 0 && empty.pantryKcal === 0 && empty.pop === 0, JSON.stringify(empty));
})();

async function main() {
  process.env.LEANLINK = '1';
  const r = await runSeed(9913, 'leanlink', 180);
  check('F2 leanlink 9913 ends village-lost', r.endReason === 'village-lost', 'end=' + r.endReason + ' days=' + r.days);
  check('F2 series length days or days-1', r.pantryDaily.length === r.days || r.pantryDaily.length === r.days - 1, `${r.pantryDaily.length} vs ${r.days}`);
  check('F2 pop series matches pantry series length', r.popDaily.length === r.pantryDaily.length, `${r.popDaily.length} vs ${r.pantryDaily.length}`);
  const e = r.endSnapshot;
  check('F2 endSnapshot present', !!e, JSON.stringify(e));
  if (e) {
    check('F2 endSnapshot scholarDay == days', e.scholarDay === r.days, `${e.scholarDay} vs ${r.days}`);
    check('F2 endSnapshot pantry finite non-negative', Number.isFinite(e.pantryKcal) && e.pantryKcal >= 0, 'got ' + e.pantryKcal);
    check('F2 endSnapshot pop non-negative integer', Number.isInteger(e.pop) && e.pop >= 0, 'got ' + e.pop);
    const lastSeriesDay = r.pantryDaily.length ? r.pantryDaily[r.pantryDaily.length - 1].scholarDay : 0;
    check('F2 endSnapshot covers loss day (>= last series day)', e.scholarDay >= lastSeriesDay, `${e.scholarDay} vs ${lastSeriesDay}`);
  }
  check('F2 tele death capture matches harness capture', r.teleDeathCount === r.deathLogCount, `${r.teleDeathCount} vs ${r.deathLogCount}`);
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
