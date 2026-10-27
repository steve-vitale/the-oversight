#!/usr/bin/env node
// scripts/test-journey-scale-r42-bystander.js — proof test for the
// journey-scale r42 BYSTANDER HOLD fix (src/js/game.js startCombat).
//
// BEFORE (r41/r42 measurement, no fix): on seed 73675, the day-145
// gauntlet fires three tb fights (lockpick_raccoon, nevermore,
// speedbump_turtle) while three lingerers stand on the player tile
// (sweeps_week s19, eater s28, eulogy s31). startCombat lifted the tile
// monster on every fight and tbEnd never restored it on 'won', so all
// three vanished: the r42 removal corpus shows three tb-bystander-lift
// rows on d145 and fates vanished-near-player for s28/s31.
//
// AFTER (this fix): the tile monster is lifted ONLY when it is one of
// the fight's monsters. This test re-runs seed 73675 through the r42
// removal driver (same policy, same band) into a temp dir and asserts:
//   1. ZERO tb-bystander-lift rows on day 145 (the gauntlet-day class
//      is gone, not merely reduced).
//   2. Seqs 28 and 31 are NOT vanished (they survive the gauntlet day).
//   3. CONTROL: tb-fight-lift rows still exist somewhere in the run —
//      normal fights still lift their own monster (the fix did not
//      disable lifting entirely).
//   4. The run still fully partitions (no diag errors, no overflow).
//
// The temp dir is disposable (created under os.tmpdir, removed in
// finally); no repo evidence is written by this test.
// Usage: node scripts/test-journey-scale-r42-bystander.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runOne, classifyFate } = require('./test-removalsite-r42');

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r42-bystander-'));
  let failures = 0;
  const check = (name, ok, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) failures++;
  };
  try {
    const row = await runOne(73675, 180, dir);
    const c = classifyFate(row);
    const rows = (row.removalsite && row.removalsite.rows) || [];
    const d145Bystanders = rows.filter(r => r.day === 145 && r.site === 'tb-bystander-lift');
    check('no-day145-bystander-lift', d145Bystanders.length === 0,
      `found ${d145Bystanders.length}: ${d145Bystanders.map(r => r.id + '/s' + r.seq).join(',') || 'none'}`);
    const bySeq = {};
    for (const d of c.detail) bySeq[d.seq] = d.fate;
    check('seq28-not-vanished', !String(bySeq[28] || '').startsWith('vanished'), `seq28 fate=${bySeq[28]}`);
    check('seq31-not-vanished', !String(bySeq[31] || '').startsWith('vanished'), `seq31 fate=${bySeq[31]}`);
    const fightLifts = rows.filter(r => r.site === 'tb-fight-lift');
    check('fight-lift-still-works', fightLifts.length > 0, `${fightLifts.length} tb-fight-lift rows`);
    check('fully-partitioned', c.fullyPartitioned === true,
      `diagErrs=${c.diagErrs} overflow=${c.overflowN} unclassified=${(c.fates.unclassified | 0)}`);
    console.log(`seed 73675 under fix: fates=${JSON.stringify(c.fates)} d145Bystanders=${d145Bystanders.length} fightLifts=${fightLifts.length}`);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
  if (failures) { console.log(`${failures} FAILURES`); process.exit(1); }
  console.log('ALL BYSTANDER PROOF CHECKS PASS');
})().catch(e => { console.error('PROOF ERROR:', (e && e.stack) || e); process.exit(2); });
