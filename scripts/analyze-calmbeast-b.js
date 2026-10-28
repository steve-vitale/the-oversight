#!/usr/bin/env node
// analyze-calmbeast-b.js — judge prereg legs (a)-(d) for sim-calmbeast-b.
// Usage: analyze-calmbeast-b.js <before.json> <after.json> [barwhy-before.json barwhy-after.json]
// Exit 0 GO, 1 NO-GO (lists failures), 2 crash.
'use strict';
const fs = require('fs');
const [beforePath, afterPath, bwBeforePath, bwAfterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) { console.error('usage: analyze-calmbeast-b.js <before.json> <after.json> [barwhy-before.json barwhy-after.json]'); process.exit(2); }
const before = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
const after = JSON.parse(fs.readFileSync(afterPath, 'utf8'));
const failures = [];
const key = (r) => r.seed + '|' + r.scenario;
const bmap = new Map(before.map((r) => [key(r), r]));
const amap = new Map(after.map((r) => [key(r), r]));
const hasAttempt = (tap) => (tap.lines || []).some((l) => /then turns and goes|too far gone/.test(l));
const hasRefusal = (tap) => (tap.lines || []).some((l) => /Nothing here to calm/.test(l));

for (const [k, b] of bmap) {
  const a = amap.get(k);
  if (!a) { failures.push(`${k}: missing after row`); continue; }
  if (b.scenario === 'C1-hostile') {
    if (b.row.available !== false) failures.push(`${k}: BEFORE row should be disabled, got available=${b.row.available}`);
    if (a.row.available !== true) failures.push(`${k}: AFTER row should be enabled, got available=${a.row.available} why=${JSON.stringify(a.row.why)}`);
    if (!hasRefusal(b.tapNoTarget)) failures.push(`${k}: BEFORE no-target tap should refuse, lines=${JSON.stringify(b.tapNoTarget.lines)}`);
    if (!hasAttempt(a.tapNoTarget)) failures.push(`${k}: AFTER no-target tap should attempt, lines=${JSON.stringify(a.tapNoTarget.lines)}`);
    if (hasRefusal(a.tapNoTarget)) failures.push(`${k}: AFTER no-target tap still refuses`);
    if (!hasAttempt(b.tapExplicit)) failures.push(`${k}: BEFORE explicit-target tap should attempt (premise), lines=${JSON.stringify(b.tapExplicit.lines)}`);
    if (!hasAttempt(a.tapExplicit)) failures.push(`${k}: AFTER explicit-target tap should still attempt, lines=${JSON.stringify(a.tapExplicit.lines)}`);
  } else {
    // Guards: row availability and tap refusal must be identical before/after.
    if (b.row.available !== a.row.available) failures.push(`${k}: guard availability changed ${b.row.available} -> ${a.row.available}`);
    if (b.row.available !== false) failures.push(`${k}: guard row should be disabled, got ${b.row.available}`);
    if (!hasRefusal(a.tapNoTarget)) failures.push(`${k}: guard AFTER tap should still refuse, lines=${JSON.stringify(a.tapNoTarget.lines)}`);
  }
}
for (const k of amap.keys()) if (!bmap.has(k)) failures.push(`${k}: after row with no before row`);

// Barwhy corpus parity with the one allowed flip.
if (bwBeforePath && bwAfterPath) {
  const bb = JSON.parse(fs.readFileSync(bwBeforePath, 'utf8'));
  const ab = JSON.parse(fs.readFileSync(bwAfterPath, 'utf8'));
  const bk = (r) => r.seed + '|' + r.scenario + '|' + r.id;
  const bm = new Map(bb.map((r) => [bk(r), r]));
  const am = new Map(ab.map((r) => [bk(r), r]));
  let flips = 0;
  for (const [k, b] of bm) {
    const a = am.get(k);
    if (!a) { failures.push(`barwhy ${k}: missing after row`); continue; }
    if (b.available !== a.available) {
      if (b.scenario === 'C1-combat' && b.id === 'animal_ken.calm_beast' && b.available === false && a.available === true) flips++;
      else failures.push(`barwhy ${k}: availability changed ${b.available} -> ${a.available} (not the allowed flip)`);
    }
    if (!a.available && !a.why) failures.push(`barwhy ${k}: disabled but why empty`);
    if (a.available && a.why) failures.push(`barwhy ${k}: enabled but why=${JSON.stringify(a.why)}`);
  }
  for (const k of am.keys()) if (!bm.has(k)) failures.push(`barwhy ${k}: after row with no before row`);
  console.log(`barwhy corpus: ${bb.length} before rows, ${ab.length} after rows, allowed C1 calm_beast flips=${flips}`);
  if (flips !== 2) failures.push(`barwhy: expected exactly 2 allowed flips (seeds 9981,9982), got ${flips}`);
}
const c1After = after.filter((r) => r.scenario === 'C1-hostile');
// Success is narration-based, NOT fightOver: in this scaffold a failed calm
// spends the turn and the hostile's reply kills the player (revival ends the
// fight too), so fightOver is true on failures as well. Success = the
// "then turns and goes" line; failure = the "too far gone" line.
const succ = c1After.filter((r) => (r.tapNoTarget.lines || []).some((l) => /then turns and goes/.test(l))).length;
console.log(`C1 after: ${c1After.length} seeds, no-target tap calm-success narration on ${succ}, calm-failure narration on ${c1After.length - succ}`);
if (failures.length) {
  console.log('\nFAILURES (' + failures.length + '):');
  for (const f of failures) console.log('  FAIL ' + f);
  process.exit(1);
}
console.log('\nPASS: prereg legs (a)-(d) hold.');
