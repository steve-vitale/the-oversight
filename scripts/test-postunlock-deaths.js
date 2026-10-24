#!/usr/bin/env node
// test-postunlock-deaths.js — proof for scripts/analyze-postunlock-deaths.js
// (gap line 883). Builds a synthetic per-seed corpus in a temp dir shaped
// like scripts/postunlock-sweep.js output — including the triage shape
// (unlinked 'monster' rows, fightBasis 'none') — and asserts the analyzer
// links the linkable rows and honestly keeps the unlinkable one unlinked.
// No live evidence is read or written.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'postunlock-deaths-'));
const corpus = {
  seed: 70811, unlock: { w5Day: 40 },
  postunlockDeaths: [
    { day: 50, who: 'v1', whoName: 'A', cause: 'combat', fightBasis: 'same-day:combat_start' },
    { day: 51, who: 'v2', whoName: 'B', cause: 'monster', fightBasis: 'none' },
    { day: 52, who: 'v3', whoName: 'C', cause: 'monster', fightBasis: 'none',
      nearestFight: { day: 52, mid: 'eulogy', wave: 4, dayDistance: 0 } },
    { day: 99, who: 'v4', whoName: 'D', cause: 'monster', fightBasis: 'none' },
  ],
  postunlockFights: [{ day: 51, mid: 'eulogy', wave: 4, party: ['v2'] }],
};
fs.writeFileSync(path.join(dir, 'postunlock-s70811.json'), JSON.stringify(corpus));
const r = spawnSync(process.execPath,
  [path.join(__dirname, 'analyze-postunlock-deaths.js'), dir], { encoding: 'utf8' });
assert.strictEqual(r.status, 0, 'analyzer exit 0, got ' + r.status + ': ' + r.stderr);
const out = JSON.parse(r.stdout);
assert.strictEqual(out.total, 4, '883 total 4, got ' + out.total);
assert.strictEqual(out.linked, 3, '883 linked 3 (prior + same-day postpass + nearest-fight postpass), got ' + out.linked);
assert.strictEqual(out.unlinked, 1, '883 unlinked 1 honestly kept, got ' + out.unlinked);
assert.strictEqual(out.unlinkedRows.length, 1, '883 one unlinked row listed');
assert.strictEqual(out.unlinkedRows[0].unlinkedReason, 'no-fight-in-window', '883 unlinked reason');
assert.strictEqual(out.unlinkedRows[0].seed, 70811, '883 unlinked row carries seed');
console.log('PASS 883 analyzer: total=4 linked=3 unlinked=1 (no-fight-in-window)');
console.log(JSON.stringify({ total: out.total, linked: out.linked, unlinked: out.unlinked, byStrength: out.byStrength }));
console.log('ALL POSTUNLOCK-DEATH PROOFS PASS');
