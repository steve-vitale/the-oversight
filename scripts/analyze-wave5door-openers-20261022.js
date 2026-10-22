#!/usr/bin/env node
// analyze-wave5door-openers-20261022.js — wave-5 DOOR-OPENERS census
// analyzer (sim-wave5door-openers, DIAG, axis scale-onramp).
//
// Reads evidence/2026-10-22/perseed-wave5door-openers/{policy}/s<seed>.json
// and prints:
//   1. per unlocking run: the door-open path census — peak-record days vs
//      door-open days, per-gate release-path (live-demand vs grandfathered)
//      with bar release days, w5gates-lib attribution, end-of-run
//      grandfathered-hold-open state;
//   2. per locked run: the binding gate (via the lib), 16/16 attributed or
//      0 unexplained;
//   3. the census: how many seeds unlock and on which release-path mix +
//      wall numbers.
//
// Usage: node scripts/analyze-wave5door-openers-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-wave5door-openers');
const CL = require('./wave5door-openers-classify-20261022');

const runs = [];
for (const pol of fs.readdirSync(EVID)) {
  const dir = path.join(EVID, pol);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    runs.push(r);
  }
}
runs.sort((a, b) => a.seed - b.seed || (a.policyId < b.policyId ? -1 : 1));

const unlocking = runs.filter(r => r.w5Day != null);
const locked = runs.filter(r => r.w5Day == null);
console.log(`=== wave5door-openers: ${runs.length} runs, ${unlocking.length} unlocking (maxWave 5), ${locked.length} locked ===\n`);

for (const r of unlocking) {
  const gv = r.gateVector || {};
  const c = CL.classifyOpenPath(r.window || [], {
    t4: gv.t4 || 100, t5: gv.t5 || 200,
    demand4: r.demand4 || null, demand5: r.demand5 || null,
  });
  console.log(`--- UNLOCK ${r.policyId} s${r.seed}: door-open d${c.w5Day} | peakRecord5Day=${c.peakRecord5Day} | defer5 open path=${c.defer5OpenPath} | r5.ready@${c.w5Day}=${c.r5ReadyAtW5Day}`);
  console.log(`    w4: door d${c.w4Day} peakRecord4Day=${c.peakRecord4Day} openPath=${c.defer4OpenPath} r4.ready@${c.w4Day}=${c.r4ReadyAtW4Day}`);
  console.log(`    bar release d5 (demand=${JSON.stringify(r.demand5)}): ${JSON.stringify(c.barRelease5)}`);
  console.log(`    bar release d4 (demand=${JSON.stringify(r.demand4)}): ${JSON.stringify(c.barRelease4)}`);
  console.log(`    bars@${c.w5Day}: ${JSON.stringify(c.barsAtW5Day)} | end: uw=${c.endUw} r5.ready=${c.endR5Ready} bars=${JSON.stringify(c.endBars)} holdOpen-grandfathered=${c.grandfatheredHoldOpen}`);
  console.log(`    gates: w3 d${c.w3Day} (live) | standRaw d${c.standRawDay} (live) | plentyCap d${c.plentyDay} (live) | w4faced d${c.w4facedDay} (live)`);
  if (gv.attr) {
    const a = gv.attr;
    console.log(`    lib: ${a.outcome} attributed=${a.attributed} why=${a.why}${a.binding ? ' binding=' + a.binding : ''} | df4=${JSON.stringify(gv.df4)} df5=${JSON.stringify(gv.df5)} peak=${gv.peak}`);
    if (!a.attributed) console.log('    !!! UNEXPLAINED unlock — violates DIAG-GO(a)');
  } else {
    console.log(`    lib: MISSING (gateErr=${r.gateErr}) !!!`);
  }
  console.log(`    win: won=${r.won} winDay=${r.winDay} path=${r.winPath} | days=${r.gameDays} end=${r.endReason} errs=${(r.instrumentErrors || []).length}`);
  console.log('');
}

console.log('=== locked runs: binding gates ===');
let attrCount = 0, unexplCount = 0;
for (const r of locked) {
  const a = (r.gateVector || {}).attr;
  if (a && a.attributed) { attrCount++; console.log(`  ${r.policyId} s${r.seed}: binding=${a.binding} (unmet: ${a.unmet.join(',')}) days=${r.gameDays} maxWave=${r.maxWave} errs=${(r.instrumentErrors || []).length}`); }
  else { unexplCount++; console.log(`  ${r.policyId} s${r.seed}: UNEXPLAINED (attr=${a ? a.why : 'missing'}) !!!`); }
}
console.log(`  locked attributed=${attrCount}/${locked.length} unexplained=${unexplCount}\n`);

console.log('=== release-path census (unlocking runs only) ===');
const mix = {};
for (const r of unlocking) {
  const gv = r.gateVector || {};
  const c = CL.classifyOpenPath(r.window || [], {
    t4: gv.t4 || 100, t5: gv.t5 || 200,
    demand4: r.demand4 || null, demand5: r.demand5 || null,
  });
  const k = `defer4:${c.defer4OpenPath}/defer5:${c.defer5OpenPath}`;
  mix[k] = (mix[k] || 0) + 1;
}
console.log('  ' + JSON.stringify(mix));
const holdOpen = unlocking.filter(r => {
  const gv = r.gateVector || {};
  const c = CL.classifyOpenPath(r.window || [], { t4: gv.t4 || 100, t5: gv.t5 || 200, demand4: r.demand4 || null, demand5: r.demand5 || null });
  return c.grandfatheredHoldOpen;
}).length;
console.log(`  doors held open grandfathered at end-of-run: ${holdOpen}/${unlocking.length}`);

console.log('\n=== wall numbers ===');
let nat = 0, tab = 0, won = 0, errs = 0;
const wreach = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const surv = [];
for (const r of runs) {
  nat += r.national | 0; tab += r.table | 0; won += r.won | 0;
  errs += (r.instrumentErrors || []).length;
  const mw = r.maxWave | 0;
  for (let w = 1; w <= mw; w++) wreach[w]++;
  surv.push(r.gameDays | 0);
}
surv.sort((a, b) => a - b);
const med = surv.length ? surv[surv.length >> 1] : 0;
console.log(`  runs=${runs.length} national=${nat} table=${tab} wins=${won} wave5-unlocks=${unlocking.length}`);
console.log(`  wave reach: ${JSON.stringify(wreach)}`);
console.log(`  survival: median=${med} max=${surv.length ? surv[surv.length - 1] : 0} instrumentErrors=${errs}`);

// Death-cause shares across the corpus.
const dc = {};
for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) dc[k] = (dc[k] || 0) + v;
const dcTop = Object.entries(dc).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log(`  death causes (top): ${JSON.stringify(Object.fromEntries(dcTop))}`);

if (!unlocking.length) console.log('\nVERDICT: DIAG insufficient-data — zero unlocks on current master in this corpus.');
else console.log('\nVERDICT: see evidence/2026-10-22/sim-wave5door-openers.md for the door-open path census verdict.');
