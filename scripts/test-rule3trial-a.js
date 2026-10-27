#!/usr/bin/env node
// scripts/test-rule3trial-a.js — proof for sim-rule3trial-a.
//
// DIAG / MEASUREMENT ONLY. Reads the screen corpus written by the reused
// scripts/test-rule3trial-a-sweep.js (env SEEDS/EVID/DAYS); writes
// nothing. Proves, per band:
//   G-screen: every expected config produced a row, days > 0, ts/dp
//     counter objects present.
//   G-offer: for every ARMED seated row, the offer list is consistent
//     with the door rule and the fallbackFeared flag:
//       doorRule 'defiant'            -> 'defiant' in offered, picked defiant
//       doorRule 'fallback-non-feared'-> 'defiant' NOT in offered,
//                                        picked is not 'feared'
//       doorRule 'fallback-feared'    -> offered == ['feared'] only,
//                                        picked 'feared', fallbackFeared 1
//     and the earned snapshot's defiant.earned matches offer inclusion.
//     Any mismatch is a PROOF-GATE FAILURE (exit 1), never a verdict.
//   Qualification (computed, not asserted): seated >= 3 AND >= 1 seated
//     seed with defiance NOT offered (this arm's prereg floor).
//   Phase 2 GO inputs (qualifying band only, computed, not asserted):
//     fallback-feared entered+won, starvation cost bar, median-days bar.
//   G-leak (qualifying band only): non-seated seeds identical
//     days/gameDays between legs.
// The verdict itself lives in the evidence file; this script only proves
// the corpus is coherent and reports the numbers the evidence judges.
//
// Usage: node scripts/test-lowdef-a.js [--require A,B]
//   (bands default to whatever is present in the corpus dir; --require
//   fails if a named band has missing rows.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-27', 'perseed-rule3trial-a');
const BANDS = {
  A: [77301, 77302, 77303, 77304, 77305, 77306, 77307, 77308],
};
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadRow(seed, pid) {
  const p = path.join(DIR, `s${seed}-${pid}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function main() {
  const args = process.argv.slice(2);
  const reqIdx = args.indexOf('--require');
  const required = reqIdx >= 0 ? args[reqIdx + 1].split(',').map(s => s.trim()) : [];
  const failures = [];
  const report = {};
  let firstQualifying = null;
  for (const [letter, seeds] of Object.entries(BANDS)) {
    const present = seeds.filter(s => loadRow(s, 'armed') && loadRow(s, 'baseline'));
    if (!present.length) { report[letter] = { status: 'not-run' }; continue; }
    if (required.includes(letter) && present.length !== seeds.length) {
      failures.push(`band ${letter}: only ${present.length}/8 seeds have both legs`);
    }
    const band = { seeds: present, seated: [], noDefianceSeated: [], fallbackFeared: [], gOffer: [], gLeak: [] };
    for (const seed of seeds) {
      const a = loadRow(seed, 'armed');
      const c = loadRow(seed, 'baseline');
      if (!a || !c) continue;
      // G-screen
      if (!(a.days > 0 && c.days > 0)) failures.push(`seed ${seed}: zero-day row`);
      if (!a.ts || typeof a.ts !== 'object' || !a.dp || typeof a.dp !== 'object' || !a.tr || typeof a.tr !== 'object') failures.push(`seed ${seed}: armed counters missing`);
      if (!c.ts || typeof c.ts !== 'object' || !c.dp || typeof c.dp !== 'object' || !c.tr || typeof c.tr !== 'object') failures.push(`seed ${seed}: baseline counters missing`);
      // G-leak: neither leg entered -> days/gameDays identical
      if (!a.entered && !c.entered) {
        const ok = a.days === c.days && a.gameDays === c.gameDays;
        band.gLeak.push({ seed, ok });
        if (!ok) failures.push(`seed ${seed}: G-leak FAIL baseline ${c.days}/${c.gameDays} vs armed ${a.days}/${a.gameDays}`);
      }
      if (!a.entered) continue;
      band.seated.push(seed);
      const offers = (a.dp && a.dp.dpOffers) || [];
      const pathsOffer = offers.find(o => Array.isArray(o.offered) && o.offered.length);
      if (!pathsOffer) { failures.push(`seed ${seed}: seated armed row has no dpOffers`); continue; }
      const offered = pathsOffer.offered;
      const defianceOffered = offered.indexOf('defiant') >= 0;
      const rule = a.doorRule;
      const picked = pathsOffer.picked;
      // G-offer: rule <-> offer-list consistency
      if (rule === 'defiant' && (!defianceOffered || picked !== 'defiant')) failures.push(`seed ${seed}: rule defiant but offered=${JSON.stringify(offered)} picked=${picked}`);
      if (rule === 'fallback-non-feared' && (defianceOffered || picked === 'feared')) failures.push(`seed ${seed}: rule fallback-non-feared but offered=${JSON.stringify(offered)} picked=${picked}`);
      if (rule === 'fallback-feared' && !(offered.length === 1 && offered[0] === 'feared' && picked === 'feared')) failures.push(`seed ${seed}: rule fallback-feared but offered=${JSON.stringify(offered)} picked=${picked}`);
      if ((a.fallbackFeared ? 1 : 0) !== (rule === 'fallback-feared' ? 1 : 0)) failures.push(`seed ${seed}: fallbackFeared=${a.fallbackFeared} inconsistent with doorRule=${rule}`);
      // Earned snapshot corroboration: defiant.earned must match offer inclusion
      const snap = (pathsOffer.earned || []).find(e => e.id === 'defiant');
      if (snap && !!snap.earned !== defianceOffered) failures.push(`seed ${seed}: earned snapshot defiant.earned=${snap.earned} vs offered=${defianceOffered}`);
      const defVal = snap ? (String(snap.why || '').match(/Defiance (\d+)/) || [])[1] || null : null;
      band.gOffer.push({ seed, offered, defianceOffered, defianceValue: defVal, picked, rule, fallbackFeared: a.fallbackFeared, won: a.won });
      if (!defianceOffered) band.noDefianceSeated.push(seed);
      if (a.fallbackFeared) band.fallbackFeared.push({ seed, won: a.won });
    }
    band.seatedCount = band.seated.length;
    const trialSum = (pid) => {
      let seen = 0, comp = 0, exp = 0, chaseP = 0, chaseI = 0;
      for (const seed of seeds) {
        const r = loadRow(seed, pid); if (!r || !r.tr) continue;
        seen += (r.tr.trTrials || []).length; comp += r.tr.trCompleted || 0; exp += r.tr.trExpired || 0;
        chaseP += r.tr.trChasePantry || 0; chaseI += r.tr.trChaseIdentify || 0;
      }
      return { seen, completed: comp, expired: exp, chasePantry: chaseP, chaseIdentify: chaseI };
    };
    band.trials = { baseline: trialSum('baseline'), armed: trialSum('armed') };
    band.noDefianceCount = band.noDefianceSeated.length;
    band.qualifies = band.seatedCount >= 3 && band.noDefianceCount >= 1;
    // Phase 2 GO inputs (only meaningful for the qualifying band)
    const aRows = seeds.map(s => loadRow(s, 'armed')).filter(Boolean);
    const cRows = seeds.map(s => loadRow(s, 'baseline')).filter(Boolean);
    let armOnlyStarv = 0;
    for (const seed of seeds) {
      const c = loadRow(seed, 'baseline'), a = loadRow(seed, 'armed');
      if (c && a && (c.starvationDeaths || 0) === 0 && (a.starvationDeaths || 0) > 0) armOnlyStarv += a.starvationDeaths;
    }
    band.phase2 = {
      fallbackFearedEntered: band.fallbackFeared.length,
      fallbackFearedWon: band.fallbackFeared.filter(f => f.won).length,
      starvationArmed: aRows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
      starvationBaseline: cRows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
      armOnlyStarvation: armOnlyStarv,
      medianDaysArmed: medianOf(aRows.map(r => r.days)),
      medianDaysBaseline: medianOf(cRows.map(r => r.days)),
      nationalEverArmed: aRows.reduce((t, r) => t + (r.nationalEver || 0), 0),
      nationalFinalArmed: aRows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
      tableArmed: aRows.reduce((t, r) => t + (r.table || 0), 0),
      winsArmed: aRows.reduce((t, r) => t + (r.won || 0), 0),
      wave4Armed: aRows.filter(r => (r.waveReach || 1) >= 4).length,
      wave5Armed: aRows.filter(r => (r.waveReach || 1) >= 5).length,
    };
    band.phase2.costBar =
      band.phase2.starvationArmed <= band.phase2.starvationBaseline + 2 &&
      band.phase2.armOnlyStarvation <= 2 &&
      band.phase2.medianDaysArmed >= 0.8 * band.phase2.medianDaysBaseline;
    band.phase2.go = band.phase2.fallbackFearedWon >= 1 && band.phase2.costBar;
    report[letter] = band;
    if (band.qualifies && !firstQualifying) firstQualifying = letter;
  }
  console.log('=== sim-rule3trial-a proof ===');
  for (const [letter, b] of Object.entries(report)) {
    if (b.status === 'not-run') { console.log(`  band ${letter}: not run`); continue; }
    console.log(`  band ${letter}: seated=${b.seatedCount} noDefianceSeated=${b.noDefianceCount} (${JSON.stringify(b.noDefianceSeated)}) qualifies=${b.qualifies} fallbackFeared=${b.fallbackFeared.length} won=${b.phase2.fallbackFearedWon} costBar=${b.phase2.costBar} GO-input=${b.phase2.go}`);
    console.log(`    trials baseline: ${JSON.stringify(b.trials.baseline)} armed: ${JSON.stringify(b.trials.armed)}`);
    for (const o of b.gOffer) console.log(`    seed ${o.seed}: offered=${JSON.stringify(o.offered)} defiance=${o.defianceOffered ? o.defianceValue : 'NOT-OFFERED'} picked=${o.picked} rule=${o.rule} won=${o.won}`);
    if (b.gLeak.length) console.log(`    G-leak comparable seeds: ${b.gLeak.length}, all-ok=${b.gLeak.every(x => x.ok)}`);
  }
  console.log(`  first qualifying band: ${firstQualifying || 'NONE'}`);
  if (failures.length) {
    console.log('  PROOF-GATE FAILURES:');
    for (const f of failures) console.log('    FAIL ' + f);
    process.exit(1);
  }
  console.log('  ALL APPLICABLE PROOFS PASS');
}
main();
