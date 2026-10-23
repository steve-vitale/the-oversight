#!/usr/bin/env node
// analyze-w5door-b.js — wave-5 DOOR-OPENERS census analyzer (sim-w5door-b,
// DIAG, axis scale-onramp, namespace w5door-b).
//
// Reads evidence/2026-10-23/perseed-w5door-b/{control,armorydrive}/s<seed>.json
// and prints the mechanism table:
//   1. per unlocking run: door-open path census — peak-record days vs
//      door-open days, per-gate release-path (live-demand vs grandfathered)
//      with bar release days, w5gates-lib attribution (0 unexplained),
//      end-of-run grandfathered-hold-open state, measured conditions at
//      unlock (bar fill days, w4 unlock/faced days);
//   2. per locked run: the binding gate (via the lib, UNMODIFIED);
//   3. the census by arm + the wall numbers.
//
// Pure functions (classifyRun, census) are unit-tested by
// scripts/test-w5door-b.js on synthetic fixtures (RED→GREEN).
//
// Usage: node scripts/analyze-w5door-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-w5door-b');
const CL = require(path.join(REPO, 'scripts', 'wave5door-openers-classify-20261022'));

function classifyRun(r) {
  const gv = r.gateVector || {};
  const c = CL.classifyOpenPath(r.window || [], {
    t4: gv.t4 || 100, t5: gv.t5 || 200,
    demand4: r.demand4 || null, demand5: r.demand5 || null,
  });
  const attr = gv.attr || null;
  if (r.w5Day != null) {
    return {
      seed: r.seed, arm: r.arm, policyId: r.policyId, unlocked: true,
      w5Day: c.w5Day, peakRecord5Day: c.peakRecord5Day,
      defer5OpenPath: c.defer5OpenPath, r5ReadyAtW5Day: c.r5ReadyAtW5Day,
      defer4OpenPath: c.defer4OpenPath, w4Day: c.w4Day, peakRecord4Day: c.peakRecord4Day,
      barRelease5: c.barRelease5, barRelease4: c.barRelease4, barsAtW5Day: c.barsAtW5Day,
      endUw: c.endUw, endR5Ready: c.endR5Ready, endBars: c.endBars,
      grandfatheredHoldOpen: c.grandfatheredHoldOpen,
      w3Day: c.w3Day, standRawDay: c.standRawDay, plentyDay: c.plentyDay, w4facedDay: c.w4facedDay,
      libOutcome: attr ? attr.outcome : null, libWhy: attr ? attr.why : null,
      attributed: !!(attr && attr.attributed),
      unexplained: !(attr && attr.attributed),
      won: r.won | 0, winDay: r.winDay, winPath: r.winPath,
      gameDays: r.gameDays | 0, endReason: r.endReason,
      instrumentErrors: (r.instrumentErrors || []).length,
      nTitans: r.nTitansOutcomes | 0,
      eng5Monster: (r.engagements || []).filter(e => e.wave === 5 && e.channel === 'monster').length,
      kills5: (r.kills || []).filter(k => k.wave === 5).length,
      anchorCommit: r.anchorCommit,
    };
  }
  return {
    seed: r.seed, arm: r.arm, policyId: r.policyId, unlocked: false,
    binding: attr ? attr.binding : null, unmet: attr ? attr.unmet : null,
    libOutcome: attr ? attr.outcome : null, libWhy: attr ? attr.why : null,
    attributed: !!(attr && attr.attributed),
    unexplained: !(attr && attr.attributed),
    maxWave: r.maxWave | 0, gameDays: r.gameDays | 0, endReason: r.endReason,
    instrumentErrors: (r.instrumentErrors || []).length,
    anchorCommit: r.anchorCommit,
  };
}

// census(records): the mechanism table. DIAG-GO = attributed fraction >=
// 80% (0 unexplained preferred) + named nexts.
function census(records) {
  const unlocking = records.filter(r => r.unlocked);
  const locked = records.filter(r => !r.unlocked);
  const mix = {};
  for (const r of unlocking) {
    const k = `defer4:${r.defer4OpenPath}/defer5:${r.defer5OpenPath}`;
    mix[k] = (mix[k] || 0) + 1;
  }
  const bindings = {};
  for (const r of locked) {
    const k = r.binding || 'UNEXPLAINED';
    bindings[k] = (bindings[k] || 0) + 1;
  }
  const unexplained = records.filter(r => r.unexplained).length;
  return {
    n: records.length, unlocking: unlocking.length, locked: locked.length,
    releaseMix: mix, bindingTally: bindings,
    unexplained, attributedFrac: records.length ? (records.length - unexplained) / records.length : 0,
    diagGo: records.length > 0 && unexplained === 0,
  };
}

function wallNumbers(runs) {
  let nat = 0, tab = 0, won = 0, errs = 0;
  const wreach = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const surv = [];
  const dc = {};
  for (const r of runs) {
    nat += r.national | 0; tab += r.table | 0; won += r.won | 0;
    errs += (r.instrumentErrors || []).length;
    const mw = r.maxWave | 0;
    for (let w = 1; w <= Math.min(mw, 5); w++) wreach[w]++;
    surv.push(r.gameDays | 0);
    for (const [k, v] of Object.entries(r.deaths || {})) dc[k] = (dc[k] || 0) + v;
  }
  surv.sort((a, b) => a - b);
  const med = surv.length ? surv[surv.length >> 1] : 0;
  return { n: runs.length, national: nat, table: tab, wins: won, wreach, median: med, max: surv.length ? surv[surv.length - 1] : 0, instrumentErrors: errs, deathCauses: dc };
}

module.exports = { classifyRun, census, wallNumbers };

if (require.main === module) {
  const runs = [];
  for (const pol of fs.readdirSync(EVID)) {
    const dir = path.join(EVID, pol);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^s\d+\.json$/.test(f)) continue;
      runs.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
    }
  }
  runs.sort((a, b) => a.seed - b.seed || (a.policyId < b.policyId ? -1 : 1));

  // The #793 anchor check: every per-seed anchorCommit must equal the sweep
  // anchor. A DIAG claiming "current master" with a mixed anchor is invalid.
  const anchors = {};
  for (const r of runs) anchors[r.anchorCommit || 'missing'] = (anchors[r.anchorCommit || 'missing'] || 0) + 1;
  console.log(`=== w5door-b: ${runs.length} runs | anchorCommit census: ${JSON.stringify(anchors)} ===\n`);

  const recs = runs.map(classifyRun);
  const unlocking = recs.filter(r => r.unlocked);
  const locked = recs.filter(r => !r.unlocked);

  for (const r of unlocking) {
    console.log(`--- UNLOCK ${r.policyId} s${r.seed}: door-open d${r.w5Day} | peakRecord5Day=${r.peakRecord5Day} | defer5 open path=${r.defer5OpenPath} | r5.ready@${r.w5Day}=${r.r5ReadyAtW5Day}`);
    console.log(`    w4: door d${r.w4Day} peakRecord4Day=${r.peakRecord4Day} openPath=${r.defer4OpenPath}`);
    console.log(`    bar release d5: ${JSON.stringify(r.barRelease5)}`);
    console.log(`    bar release d4: ${JSON.stringify(r.barRelease4)}`);
    console.log(`    bars@${r.w5Day}: ${JSON.stringify(r.barsAtW5Day)} | end: uw=${r.endUw} r5.ready=${r.endR5Ready} bars=${JSON.stringify(r.endBars)} holdOpen-grandfathered=${r.grandfatheredHoldOpen}`);
    console.log(`    gates: w3 d${r.w3Day} | standRaw d${r.standRawDay} | plentyCap d${r.plentyDay} | w4faced d${r.w4facedDay}`);
    console.log(`    lib: ${r.libOutcome} attributed=${r.attributed} why=${r.libWhy}${r.unexplained ? ' !!! UNEXPLAINED — violates DIAG-GO(a)' : ''}`);
    console.log(`    win: won=${r.won} winDay=${r.winDay} path=${r.winPath} | days=${r.gameDays} end=${r.endReason} errs=${r.instrumentErrors} | eng5=${r.eng5Monster} kills5=${r.kills5} titans=${r.nTitans}`);
    console.log('');
  }

  console.log('=== locked runs: binding gates ===');
  for (const r of locked) {
    if (r.attributed) console.log(`  ${r.policyId} s${r.seed}: binding=${r.binding} (unmet: ${(r.unmet || []).join(',')}) days=${r.gameDays} maxWave=${r.maxWave} errs=${r.instrumentErrors}`);
    else console.log(`  ${r.policyId} s${r.seed}: UNEXPLAINED (why=${r.libWhy}) !!!`);
  }
  console.log('');

  console.log('=== mechanism table by arm ===');
  for (const arm of ['control', 'armorydrive']) {
    const rec = recs.filter(r => r.arm === arm);
    if (!rec.length) { console.log(`  ${arm}: no runs`); continue; }
    const c = census(rec);
    console.log(`  ${arm}: n=${c.n} doors=${c.unlocking}/${c.n} | releaseMix=${JSON.stringify(c.releaseMix)} | bindings=${JSON.stringify(c.bindingTally)} | unexplained=${c.unexplained} | DIAG-GO(a)=${c.diagGo}`);
    const w = wallNumbers(runs.filter(r => r.arm === arm));
    console.log(`       wall: national=${w.national} table=${w.table} wins=${w.wins} reach=${JSON.stringify(w.wreach)} median=${w.median} max=${w.max}`);
  }
  const c = census(recs);
  console.log(`\n  COMBINED: n=${c.n} doors=${c.unlocking}/${c.n} | releaseMix=${JSON.stringify(c.releaseMix)} | bindings=${JSON.stringify(c.bindingTally)} | unexplained=${c.unexplained} | attributedFrac=${c.attributedFrac.toFixed(2)} | DIAG-GO(a)=${c.diagGo}`);
  const w = wallNumbers(runs);
  console.log(`  wall: national=${w.national} table=${w.table} wins=${w.wins} reach=${JSON.stringify(w.wreach)} median=${w.median} max=${w.max} instrumentErrors=${w.instrumentErrors}`);
  const dcTop = Object.entries(w.deathCauses).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log(`  death causes (top): ${JSON.stringify(Object.fromEntries(dcTop))}`);

  if (!unlocking.length) console.log('\nVERDICT: DIAG insufficient-data — zero unlocks on current master in this corpus (report-only, not a kill).');
}
