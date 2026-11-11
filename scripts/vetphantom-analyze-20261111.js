// vetphantom-analyze-20261111.js — analyzer for the vetphantom-b band
// (arm sim-vetphantom-b). Reads the 16 per-seed JSONs (8 control +
// 8 fix, seeds 190391–190398) from evidence/2026-11-11/
// perseed-vetphantom-b/ and judges them against the prereg
// (evidence/2026-11-11/sim-vetphantom-b-prereg.md).
//
// Per seed and leg it checks:
//   (1) END-OF-RUN TRIPLE AGREEMENT — w4 bar: ready4.veterans vs
//       ladderVets4 vs the instrument's final-snapshot vetsW3.count;
//       w5 bar: ready5.veterans vs ladderVets4 (the ladder's wave-4+
//       living count IS the w5 bar's ladder read) vs final vetsW4.count.
//   (2) PHANTOM DAYS — daily snapshots where the engine's own
//       ready4/ready5 veterans disagree with the instrument's
//       vetsW3/vetsW4 recomputation on the same day.
//   (3) SHADOW-PREVENTED DAYS (fix leg only) — days where the live
//       shadow old-rule count differs from the instrument count: the
//       phantom days the fix prevented on the same trajectory.
//   (4) WALL NUMBERS — days, end, wins, national/table reach, wave 4–5
//       unlocks, median survival, deaths, standing, scale.
// Verdict: GO iff the fix leg agrees 8/8 on both bars at end of run,
// zero phantom days on the fix leg, and the wall guardrails hold
// (wins/national/wave-5 unlocks not below control; median survival
// within ±25% of control). Exit 0 on GO, 1 on NO-GO.
// Usage: node scripts/vetphantom-analyze-20261111.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-vetphantom-b');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'vetphantom-pilot';

function load(seed, leg) {
  const f = path.join(DIR, 'vetphantom-s' + seed + '-' + RUN + '-' + leg + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function finalSnap(d) {
  const daily = (d.daily || []);
  return daily.length ? daily[daily.length - 1] : null;
}

function analyzeSeed(seed, leg) {
  const d = load(seed, leg);
  const snap = finalSnap(d);
  const r = {
    seed: seed, leg: leg, standingFix: d.standingFix, standingSha: d.standingSha,
    days: d.days, endReason: d.endReason, won: !!d.won, villageLost: !!d.villageLost,
    scaleRank: d.scaleRank, maxWave: d.maxWave, unlockedWave: d.unlockedWave,
    standing: d.standing, deaths: (d.deaths || []).length,
    endPantryKcal: d.endPantryKcal, blooded: !!d.blooded,
    errors: (d.instrumentErrors || []).length,
  };
  // (1) End-of-run triple agreement.
  const finW3 = snap && snap.vetsW3 ? snap.vetsW3.count : null;
  const finW4 = snap && snap.vetsW4 ? snap.vetsW4.count : null;
  r.endReady4 = d.ready4 ? d.ready4.veterans : null;
  r.endLadder4 = (d.ladderVets4 === null || d.ladderVets4 === undefined) ? null : d.ladderVets4;
  r.endInstW3 = finW3;
  r.endReady5 = d.ready5 ? d.ready5.veterans : null;
  r.endInstW4 = finW4;
  r.agreeW4 = (r.endReady4 !== null && r.endLadder4 !== null && finW3 !== null)
    ? (r.endReady4 === r.endLadder4 && r.endLadder4 === finW3) : null;
  r.agreeW5 = (r.endReady5 !== null && r.endLadder4 !== null && finW4 !== null)
    ? (r.endReady5 === r.endLadder4 && r.endLadder4 === finW4) : null;
  // (2) Phantom days: engine ready vs instrument on the same daily snapshot.
  let ph4 = 0, ph5 = 0, ph4Days = [], ph5Days = [];
  let sh4 = 0, sh5 = 0, sh4Days = [], sh5Days = [];
  for (const s of (d.daily || [])) {
    if (s.ready4 && s.vetsW3 && s.ready4.veterans !== s.vetsW3.count) { ph4++; ph4Days.push(s.day); }
    if (s.ready5 && s.vetsW4 && s.ready5.veterans !== s.vetsW4.count) { ph5++; ph5Days.push(s.day); }
    if (s.shadow && s.vetsW3 && s.shadow.w3 !== null && s.shadow.w3 !== s.vetsW3.count) { sh4++; sh4Days.push(s.day); }
    if (s.shadow && s.vetsW4 && s.shadow.w4 !== null && s.shadow.w4 !== s.vetsW4.count) { sh5++; sh5Days.push(s.day); }
  }
  r.phantomDaysW4 = ph4; r.phantomDaysW5 = ph5;
  r.phantomDayListW4 = ph4Days; r.phantomDayListW5 = ph5Days;
  r.shadowDaysW4 = sh4; r.shadowDaysW5 = sh5;
  r.shadowDayListW4 = sh4Days; r.shadowDayListW5 = sh5Days;
  r.snapshotCount = (d.daily || []).length;
  return r;
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

(function main() {
  const rows = [];
  for (const leg of ['control', 'fix']) {
    for (const seed of SEEDS) rows.push(analyzeSeed(seed, leg));
  }
  const byLeg = { control: rows.filter(function (r) { return r.leg === 'control'; }), fix: rows.filter(function (r) { return r.leg === 'fix'; }) };
  function wall(legRows) {
    return {
      wins: legRows.filter(function (r) { return r.won; }).length,
      national: legRows.filter(function (r) { return r.scaleRank === 'national'; }).length,
      regional: legRows.filter(function (r) { return r.scaleRank === 'regional'; }).length,
      village: legRows.filter(function (r) { return r.scaleRank === 'village'; }).length,
      wave5: legRows.filter(function (r) { return (r.maxWave || 1) >= 5; }).length,
      wave4: legRows.filter(function (r) { return (r.maxWave || 1) >= 4; }).length,
      medianDays: median(legRows.map(function (r) { return r.days; })),
      survived: legRows.filter(function (r) { return !r.villageLost; }).length,
      deaths: legRows.reduce(function (a, r) { return a + r.deaths; }, 0),
      standingRange: [Math.min.apply(null, legRows.map(function (r) { return r.standing; })), Math.max.apply(null, legRows.map(function (r) { return r.standing; }))],
    };
  }
  const summary = {
    seeds: SEEDS, run: RUN,
    perSeed: rows,
    agreeFixW4: byLeg.fix.filter(function (r) { return r.agreeW4 === true; }).length,
    agreeFixW5: byLeg.fix.filter(function (r) { return r.agreeW5 === true; }).length,
    agreeControlW4: byLeg.control.filter(function (r) { return r.agreeW4 === true; }).length,
    agreeControlW5: byLeg.control.filter(function (r) { return r.agreeW5 === true; }).length,
    phantomDaysFix: byLeg.fix.reduce(function (a, r) { return a + r.phantomDaysW4 + r.phantomDaysW5; }, 0),
    phantomDaysControl: byLeg.control.reduce(function (a, r) { return a + r.phantomDaysW4 + r.phantomDaysW5; }, 0),
    phantomSeedsControl: byLeg.control.filter(function (r) { return (r.phantomDaysW4 + r.phantomDaysW5) > 0; }).length,
    shadowPreventedFix: byLeg.fix.reduce(function (a, r) { return a + r.shadowDaysW4 + r.shadowDaysW5; }, 0),
    shadowPreventedSeedsFix: byLeg.fix.filter(function (r) { return (r.shadowDaysW4 + r.shadowDaysW5) > 0; }).length,
    instrumentErrors: rows.reduce(function (a, r) { return a + r.errors; }, 0),
    wall: { control: wall(byLeg.control), fix: wall(byLeg.fix) },
  };
  // GO rows (prereg §14).
  const go = [];
  go.push({ row: 'fix-leg bar agreement 8/8 (w4 + w5, end of run)', pass: summary.agreeFixW4 === 8 && summary.agreeFixW5 === 8, detail: 'w4 ' + summary.agreeFixW4 + '/8, w5 ' + summary.agreeFixW5 + '/8' });
  go.push({ row: 'zero phantom days on the fix leg', pass: summary.phantomDaysFix === 0, detail: summary.phantomDaysFix + ' phantom days' });
  const wc = summary.wall.control, wf = summary.wall.fix;
  go.push({ row: 'wins not below control', pass: wf.wins >= wc.wins, detail: 'fix ' + wf.wins + ' vs control ' + wc.wins });
  go.push({ row: 'national reach not below control', pass: wf.national >= wc.national, detail: 'fix ' + wf.national + ' vs control ' + wc.national });
  go.push({ row: 'wave-5 unlocks not below control', pass: wf.wave5 >= wc.wave5, detail: 'fix ' + wf.wave5 + ' vs control ' + wc.wave5 });
  const survRatio = wc.medianDays ? (wf.medianDays / wc.medianDays) : null;
  go.push({ row: 'median survival within ±25% of control', pass: survRatio !== null && survRatio >= 0.75 && survRatio <= 1.25, detail: 'fix ' + wf.medianDays + 'd vs control ' + wc.medianDays + 'd (ratio ' + (survRatio === null ? 'n/a' : survRatio.toFixed(2)) + ')' });
  go.push({ row: '0 instrument errors', pass: summary.instrumentErrors === 0, detail: summary.instrumentErrors + ' errors' });
  summary.goRows = go;
  summary.verdict = go.every(function (g) { return g.pass; }) ? 'GO' : 'NO-GO';
  const outFile = path.join(REPO, 'evidence', '2026-11-11', 'vetphantom-b-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('vetphantom-b: ' + summary.verdict);
  console.log('  fix agreement: w4 ' + summary.agreeFixW4 + '/8, w5 ' + summary.agreeFixW5 + '/8; control agreement: w4 ' + summary.agreeControlW4 + '/8, w5 ' + summary.agreeControlW5 + '/8');
  console.log('  phantom days: control ' + summary.phantomDaysControl + ' (' + summary.phantomSeedsControl + ' seeds), fix ' + summary.phantomDaysFix);
  console.log('  shadow-prevented on fix leg: ' + summary.shadowPreventedFix + ' days on ' + summary.shadowPreventedSeedsFix + ' seeds');
  console.log('  wall control: wins ' + wc.wins + ', national ' + wc.national + ', wave5 ' + wc.wave5 + ', median ' + wc.medianDays + 'd, deaths ' + wc.deaths);
  console.log('  wall fix:     wins ' + wf.wins + ', national ' + wf.national + ', wave5 ' + wf.wave5 + ', median ' + wf.medianDays + 'd, deaths ' + wf.deaths);
  for (const g of go) console.log('  [' + (g.pass ? 'GO' : 'NO-GO') + '] ' + g.row + ' — ' + g.detail);
  console.log('  summary: ' + path.relative(REPO, outFile));
  process.exit(summary.verdict === 'GO' ? 0 : 1);
})();
