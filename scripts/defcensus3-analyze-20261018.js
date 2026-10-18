#!/usr/bin/env node
// defcensus3-analyze-20261018.js — analyzer for the sim-defercensus2b sweep.
// Reads evidence/2026-10-18/perseed-defercensus2b/*.json, applies the
// wave4census-lib-20261017.js attribution, and emits per substrate:
//   - binding-bar counts (taxonomy: single bar | multi:a+b | none-single |
//     standing | unlocked)
//   - deferral-day anatomy (days in `short` per bar over all deferral days)
//   - wave-4 unlocks, firstW4Day, deferralArmorMargin median (butcharmor
//     metric: rd.armored - 4 at the last wave-4-unready day)
//   - wall numbers (national / table / wave-4 / wave-5 / wins / median survival)
// Usage: node scripts/defcensus3-analyze-20261018.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const { attributeRun } = require('./wave4census-lib-20261017');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-defercensus2b');
const T4 = 100;
const BARS = ['armor', 'weapons', 'tricks', 'veterans'];

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('ANALYZER STOP: no per-seed JSONs in ' + EVID); process.exit(2); }

const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const rows = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  let attr = null, attrErr = null;
  try { attr = attributeRun(r.snaps, { t4: T4 }); } catch (e) { attrErr = e.message; }
  rows.push({ file: f, run: r, attr, attrErr });
}

const bySub = {};
for (const row of rows) {
  const sub = row.run.substrate || 'unknown';
  (bySub[sub] = bySub[sub] || []).push(row);
}

function analyze(sub, srows) {
  const bindingCounts = {};
  for (const { attr, attrErr } of srows) {
    const k = attrErr ? 'ERROR:' + attrErr : attr.binding;
    bindingCounts[k] = (bindingCounts[k] || 0) + 1;
  }
  const daysShort = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
  let totalDeferDays = 0;
  const maxVets = [], maxArmored = [];
  for (const { run } of srows) {
    maxVets.push(Math.max(0, ...((run.snaps || []).map(s => s.veterans | 0))));
    maxArmored.push(Math.max(0, ...((run.snaps || []).map(s => s.armored | 0))));
    for (const s of (run.snaps || [])) {
      const deferred = (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4;
      if (!deferred) continue;
      totalDeferDays++;
      for (const b of (s.short || [])) if (daysShort[b] !== undefined) daysShort[b]++;
    }
  }
  const margins = srows.map(r => r.run.deferralArmorMargin).filter(m => m != null);
  const firstW4 = srows.map(r => r.run.firstW4Day).filter(d => d != null);
  const wall = {
    n: srows.length,
    national: srows.filter(r => r.run.national).length,
    table: srows.filter(r => (r.run.table | 0) === 1).length,
    wave4: srows.filter(r => (r.run.maxWave | 0) >= 4).length,
    wave5: srows.filter(r => (r.run.maxWave | 0) >= 5).length,
    wins: srows.filter(r => r.run.won).length,
    lost: srows.filter(r => /lost/i.test(r.run.endReason || '')).length,
    medianSurvival: median(srows.map(r => r.run.gameDays | 0)),
  };
  return {
    substrate: sub, n: srows.length, bindingCounts, totalDeferDays, daysShort,
    daysShortShare: Object.fromEntries(Object.entries(daysShort).map(([b, n]) => [b, totalDeferDays ? +(n / totalDeferDays).toFixed(3) : 0])),
    medians: {
      maxLivingVeterans: median(maxVets), maxArmored: median(maxArmored),
      deferralArmorMargin: margins.length ? median(margins) : null,
      firstW4Day: firstW4.length ? median(firstW4) : null,
    },
    maxVetsRange: [Math.min(...maxVets), Math.max(...maxVets)],
    deferralArmorMarginN: margins.length,
    wave4Unlocks: wall.wave4,
    wall,
    perRun: srows.map(({ file, run, attr, attrErr }) => ({
      file, seed: run.seed, policy: run.policyId,
      days: run.gameDays, end: run.endReason, won: !!run.won, maxWave: run.maxWave,
      firstW4Day: run.firstW4Day, deferralArmorMargin: run.deferralArmorMargin,
      binding: attrErr ? 'ERROR:' + attrErr : attr.binding,
      deferDays: attrErr ? -1 : attr.deferDays,
      maxVets: attrErr ? -1 : attr.maxVal.veterans, maxArmored: attrErr ? -1 : attr.maxVal.armor,
      instrumentErrors: run.instrumentErrors, censusErrors: run.censusErrors,
    })),
  };
}

const out = { substrates: {} };
for (const [sub, srows] of Object.entries(bySub)) out.substrates[sub] = analyze(sub, srows);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(out, null, 1));
} else {
  for (const [sub, a] of Object.entries(out.substrates)) {
    console.log(`\n===== ${sub} (n=${a.n}) =====`);
    console.log('binding counts:', JSON.stringify(a.bindingCounts, null, 1));
    console.log(`deferral days: ${a.totalDeferDays}`);
    console.log('days in short:', JSON.stringify(a.daysShort), 'shares:', JSON.stringify(a.daysShortShare));
    console.log('medians:', JSON.stringify(a.medians), 'maxVets range:', JSON.stringify(a.maxVetsRange));
    console.log(`wave-4 unlocks: ${a.wave4Unlocks}/${a.n}; deferralArmorMargin n=${a.deferralArmorMarginN}`);
    console.log('wall:', JSON.stringify(a.wall));
    console.log('per-run:');
    for (const p of a.perRun) console.log(`  ${p.policy}-s${p.seed} days=${p.days} end=${p.end} won=${p.won} w=${p.maxWave} firstW4=${p.firstW4Day} margin=${p.deferralArmorMargin} binding=${p.binding} defer=${p.deferDays} maxVets=${p.maxVets} maxArmored=${p.maxArmored} ierr=${p.instrumentErrors}`);
  }
}
