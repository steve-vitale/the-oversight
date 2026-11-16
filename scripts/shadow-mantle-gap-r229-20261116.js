#!/usr/bin/env node
// shadow-mantle-gap-r229-20261116.js — DESCRIPTIVE SHADOW, not the binding verdict.
// Recomputes MANTLE-FINE rows with the gap-subtraction revision proposed in the
// r229 metric review: fineLatencyGapAdj = (first roll with the new bearer).dayBefore
//   - entryDay - gapDays,
// where gapDays = days d in [entryDay, firstNewRoll.dayBefore) with NO roll having
// dayBefore == d (an unrecorded day transition gives no evidence either way; the
// first observed roll after the death already shows the new bearer, so the flip
// was in place by then). All other rules (rollCover, sameDayCascade, heldBriefly,
// VILLAGE-OVER) are the r229 analyzer's verbatim. Prints ONLY rows whose shadow
// class differs from the r229 class, plus a summary. Used to prove the revision
// for r230; the r229 binding verdict is untouched.
// Usage: node scripts/shadow-mantle-gap-r229-20261116.js <seed...>
//   (reads evidence/2026-11-16/journey-succession-r229-<seed>.stdout.json;
//    PREFIX env overrides the r229 prefix for the r224 corpora.)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-16');
const seeds = process.argv.slice(2);
const prefix = process.env.PREFIX || 'r229';
if (!seeds.length) { console.error('usage: node scripts/shadow-mantle-gap-r229-20261116.js <seed...>'); process.exit(2); }
let changed = 0, total = 0;
for (const seed of seeds) {
  const rec = JSON.parse(fs.readFileSync(path.join(EVID, `journey-succession-${prefix}-${seed}.stdout.json`), 'utf8'));
  const mf = rec.mantleFine || [];
  const samples = rec.mantleSamples || [];
  const rolls = rec.sleepRolls || [];
  const death = rec.death || null;
  const rows = mf.map((m, i) => {
    const firstNew = samples.find(s => s.bearer === m.newIdAfter && s.day >= m.entryDay);
    const fineLatencySample = (firstNew && m.newIdAfter != null) ? (firstNew.day - m.entryDay) : null;
    let fineLatency = null, firstRollNew = null;
    if (m.newIdAfter != null) {
      firstRollNew = rolls.find(r => r.dayBefore >= m.entryDay && (r.bearerBefore === m.newIdAfter || r.bearerAfter === m.newIdAfter));
      if (firstRollNew) fineLatency = firstRollNew.dayBefore - m.entryDay;
    }
    let heldBriefly = false;
    if (fineLatency == null && m.newIdAfter != null) {
      heldBriefly = mf.some((n, j) => j > i && n.oldId === m.newIdAfter);
      if (heldBriefly) fineLatency = 0;
    }
    const zeroDaySleep = rolls.some(r => r.dayBefore === m.entryDay && r.dayAfter === m.entryDay);
    const rollCover = rolls.some(r => r.dayBefore === m.entryDay && r.dayAfter === m.entryDay + 1 && r.bearerAfter === m.newIdAfter)
      || (zeroDaySleep && rolls.some(r => r.dayBefore === m.entryDay + 1 && r.bearerAfter === m.newIdAfter));
    const sameDayCascade = mf.some((n, j) => j < i && n.entryDay === m.entryDay);
    const cls = !m.flippedImmediate ? (m.over ? 'VILLAGE-OVER' : 'GAME') : (fineLatency != null && fineLatency >= 2) ? 'GAME-LATE' : (fineLatency === 1 && !rollCover && !sameDayCascade) ? 'UNEXPLAINED-1' : 'SAMPLING-or-CLEAN';
    // --- gap-subtraction shadow ---
    let gapDays = 0, fineLatencyGapAdj = fineLatency;
    if (firstRollNew) {
      for (let d = m.entryDay; d < firstRollNew.dayBefore; d++) {
        if (!rolls.some(r => r.dayBefore === d)) gapDays++;
      }
      fineLatencyGapAdj = fineLatency - gapDays;
      if (heldBriefly && fineLatency === 0) fineLatencyGapAdj = 0;
    }
    const clsGap = !m.flippedImmediate ? (m.over ? 'VILLAGE-OVER' : 'GAME') : (fineLatencyGapAdj != null && fineLatencyGapAdj >= 2) ? 'GAME-LATE' : (fineLatencyGapAdj === 1 && !rollCover && !sameDayCascade) ? 'UNEXPLAINED-1' : 'SAMPLING-or-CLEAN';
    total++;
    if (clsGap !== cls) {
      changed++;
      console.log(`CHANGED seed=${seed} entry d${m.entryDay} cause=${m.cause} r229 lat=${fineLatency} (sample=${fineLatencySample}) cls=${cls} -> gapAdj lat=${fineLatencyGapAdj} gapDays=${gapDays} cls=${clsGap} rollCover=${rollCover} zeroDaySleep=${zeroDaySleep}`);
    }
    return { cls, clsGap };
  });
  const fails = rows.filter(r => r.cls === 'UNEXPLAINED-1' || r.cls === 'GAME-LATE' || r.cls === 'GAME').length;
  const failsGap = rows.filter(r => r.clsGap === 'UNEXPLAINED-1' || r.clsGap === 'GAME-LATE' || r.clsGap === 'GAME').length;
  console.log(`seed ${seed}: rows=${rows.length} r229-fails=${fails} gapAdj-fails=${failsGap}`);
}
console.log(`SHADOW SUMMARY: rows=${total} changed=${changed}`);
