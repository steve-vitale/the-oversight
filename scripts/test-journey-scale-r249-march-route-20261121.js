#!/usr/bin/env node
// MARCH ROUTE-AROUND (journey-scale r249, 2026-11-21): the march walks like
// a competent human — when the shortest path's first step is refused (a
// fallen tree guarding the approach), go around it instead of sitting at
// the haven edge for weeks.
// BEFORE (committed r249 panel corpus, no route-around):
//   seed 103927 march: d51-d78 held=blocked-at:4,4 (28 days, ready muster,
//   14+ blades), arrived only d79 when the herald wandered adjacent.
// AFTER (this driver, COMPETENT_ROUTE_AROUND=1 for the march walk): the
// same seed must arrive within days of the muster going ready and slay
// the titan on-march — no multi-week sit at the haven edge.
// This test runs the REAL r249 driver on seed 103927 into a temp dir
// (EVIDIR override; the panel corpus is untouched) and reads the march
// ledger it writes. ~1 min.
// Usage: node scripts/test-journey-scale-r249-march-route-20261121.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

let failures = 0, passes = 0;
function ok(cond, label) {
  if (cond) { passes++; console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r249-march-route-'));
try {
  execFileSync('node', [path.join(__dirname, 'journey-scale-r249-20261121.js')], {
    env: Object.assign({}, process.env, { SEEDS: '103927', ARM: 'B', EVIDIR: tmp }),
    stdio: 'ignore',
    timeout: 300000,
  });
  const marchTxt = fs.readFileSync(path.join(tmp, 'journey-scale-r249-b-march-103927.txt'), 'utf8');
  const rows = marchTxt.trim().split('\n').filter(Boolean).map(line => {
    const m = line.match(/^d(\d+) (\S+) stage=(\d+) lair=([\d,]+) from=([\d,]+|-) arrived=(\d) onTile=(\d) pending=(\d) held=(.*?) ta=/);
    return m ? { day: +m[1], titan: m[2], lair: m[4], from: m[5], arrived: m[6] === '1', held: m[9] } : null;
  }).filter(Boolean);
  ok(rows.length > 0, `march ledger written (${rows.length} rows)`);
  const firstDay = rows[0].day;
  const arrivedRows = rows.filter(r => r.arrived);
  ok(arrivedRows.length >= 1, `march arrives at least once (${arrivedRows.length}x)`);
  const firstArrived = arrivedRows.length ? arrivedRows[0].day : null;
  ok(firstArrived !== null && firstArrived - firstDay <= 7,
    `march arrives within 7 days of ready (first row d${firstDay}, arrived d${firstArrived}; BEFORE: 28-day sit, arrived d79)`);
  const blockedRows = rows.filter(r => (r.held || '').startsWith('blocked-at:'));
  ok(blockedRows.length < 5, `blocked-at rows < 5 (got ${blockedRows.length}; BEFORE: 28)`);
  const marchJson = JSON.parse(fs.readFileSync(path.join(tmp, 'journey-scale-r249-b-march-103927.json'), 'utf8'));
  const te = marchJson.titanEnd || {};
  ok(te.slain && te.slain.herald === true, `herald slain after the march (titanEnd.slain.herald=true)`);
  const outcome = ((te.outcomes || []).find(o => o.titan === 'herald' && o.outcome === 'slain')) || null;
  ok(!!outcome && firstArrived !== null && outcome.day - firstArrived <= 3,
    `slay follows arrival within 3 days (arrived d${firstArrived}, slain d${outcome ? outcome.day : '-'}; BEFORE: arrived d79, slain d80)`);
} catch (e) {
  failures++;
  console.log(`  FAIL driver run threw: ${(e && e.message) || e}`);
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
console.log(failures ? `RESULT: ${passes} PASS, ${failures} FAIL` : `RESULT: ${passes} PASS, 0 FAIL`);
process.exit(failures ? 1 : 0);
