#!/usr/bin/env node
// analyze-crisis-r45.js — verdicts M1-M7 + interesting bars for the r45 pilot.
// Usage: node scripts/analyze-crisis-r45.js <dir-with-seed-jsons>
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-23');
const files = fs.readdirSync(DIR).filter(f => /^journey-crisis-r45-seed\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
console.log('# crisis r45 panel — ' + files.length + ' seeds');
for (const r of recs) {
  const W = r.outbreakWindows || [];
  const comp = r.compoundRaises || [];
  const tnd = (r.tendedOnWindowDays || []).length;
  const sickDeaths = r.sicknessDeaths || [];
  const mournOk = sickDeaths.filter(s => s.mournedWithin7d).length;
  console.log(`\n## seed ${r.seed} — days ${r.days}, end ${r.endReason}`);
  console.log(`  windows: ${W.length} (peak weight ${r.maxOutbreakWeight}), famineDays ${r.famineDays}, famine∩outbreak ${r.famineOutbreakOverlapDays}`);
  console.log(`  relief openings: ${(r.reliefOpenings || []).map(o => o.kind + 'd' + o.day).join(', ') || 'none'}`);
  console.log(`  sickness relief used: ${JSON.stringify(r.reliefUsed)}`);
  console.log(`  tended-on-window-days: ${tnd}, triageHygiene episodes: ${(r.triageHygieneDays || []).length}`);
  console.log(`  compound raises: ${comp.length} ${comp.map(c => c.fromKind + '→' + c.toKind + 'd' + c.day).join(', ')} | compound lines fired: ${r.compoundFramingLines}`);
  console.log(`  sickness deaths: ${sickDeaths.length} (mourned≤7d: ${mournOk}) ${sickDeaths.map(s => (s.player ? '[PLAYER]' : '') + s.name + ' d' + s.day + ' ' + String(s.cause).slice(0, 40)).join('; ')}`);
  console.log(`  sickDepartures: ${(r.sickDepartures || []).length}, sickDeposits: ${r.sickDeposits}`);
  console.log(`  true-name hits: ${(r.trueNameHits || []).length}, fabric hits: ${(r.fabricHits || []).length}`);
  console.log(`  convos driven: ${(r.convosDriven || []).length}, census alive: ${r.census && r.census.aliveCount}, scattered: ${r.census && r.census.scattered}`);
}
// ---- verdicts ----
const verdict = (name, cond, detail) => console.log(`\n**${name}: ${cond ? 'GO' : 'NO-GO'}** ${detail || ''}`);
const outSeeds = recs.filter(r => (r.outbreakWindows || []).length > 0);
verdict('M1 outbreak reached', outSeeds.length >= 2, `— ${outSeeds.length}/4 seeds`);
const m2 = recs.filter(r => (r.outbreakWindows || []).length > 0 && (r.reliefOpenings || []).some(o => o.kind === 'sickness'));
verdict('M2 relief fires', m2.length >= 2, `— ${m2.length}/4`);
const m3 = recs.filter(r => (r.outbreakWindows || []).length > 0 && (r.tendedOnWindowDays || []).length > 0);
verdict("M3' care per-window", m3.length >= 3, `— ${m3.length}/4 outbreak seeds with tended-on-window-day`);
let tot = 0, ok = 0; for (const r of recs) for (const s of (r.sicknessDeaths || [])) { tot++; if (s.mournedWithin7d) ok++; }
verdict("M4' mourning parity", tot === ok && tot > 0, `— ${ok}/${tot} deaths mourned ≤7d`);
const m5 = recs.every(r => (r.sickDepartures || []).length === 0 && r.sickDeposits === 0);
verdict('M5 sick stay home', m5, `— departures ${recs.reduce((t, r) => t + (r.sickDepartures || []).length, 0)}, sick-deposits ${recs.reduce((t, r) => t + (r.sickDeposits || 0), 0)}`);
const m6 = recs.reduce((t, r) => t + (r.fabricHits || []).length, 0);
verdict('M6 no theater', m6 === 0, `— ${m6} fabric hits`);
//   - M7 (compound reachability, r44's fix under natural load): >=1
//     true-compound raise (different-kind raiseRelief while a relief is
//     open) on >=1/4 seeds, AND the compound line fires at most once per
//     compounding (no relief fires it twice; later different-kind raises
//     ride silently per the r44 compound-once design).
const compSeeds = recs.filter(r => (r.compoundRaises || []).length > 0);
let silentExplained = true, doubleFire = 0;
for (const r of recs) {
  const lineDays = new Set();
  for (const s of (r.sayLines || [])) {
    if (/and now .*?,?\s*on top of it all/i.test(s.line)) {
      if (lineDays.has(s.day)) doubleFire++;
      lineDays.add(s.day);
    }
  }
  for (const c of (r.compoundRaises || [])) {
    if (!lineDays.has(c.day)) {
      // silent raise: explainable only if a compound line fired earlier for
      // the still-open relief (first compounding stands)
      const earlier = [...lineDays].some(d => d < c.day);
      if (!earlier) silentExplained = false;
    }
  }
}
verdict('M7 compound reachability', compSeeds.length >= 1 && doubleFire === 0 && silentExplained,
  `— ${compSeeds.length}/4 seeds with a compound raise; double-fires ${doubleFire}; silent raises all explained ${silentExplained}`);
// interesting bars
console.log('\n## interesting bars');
console.log('  (a) outbreak w/o sickness relief opening:',
  recs.filter(r => (r.outbreakWindows || []).length > 0 && !(r.reliefOpenings || []).some(o => o.kind === 'sickness')).map(r => r.seed));
console.log('  (b) sick-day production deposits:',
  recs.filter(r => r.sickDeposits > 0).map(r => `s${r.seed}:${r.sickDeposits}`));
console.log('  (c) sickness deaths unmourned ≤7d:',
  recs.flatMap(r => (r.sicknessDeaths || []).filter(s => !s.mournedWithin7d).map(s => `s${r.seed} ${s.name} d${s.day}`)));
console.log('  (d) TRUE-NAME REGRESSION (undiagnosed true name in scholar warning/death line):');
for (const r of recs) for (const h of (r.trueNameHits || [])) {
  if (h.knowsDisease === false && h.warningCtx) console.log(`    REGRESSION s${r.seed} d${h.day}: "${h.line.slice(0, 140)}"`);
}
const undiag = recs.reduce((t, r) => t + (r.trueNameHits || []).filter(h => h.knowsDisease === false && h.warningCtx).length, 0);
console.log(`    ${undiag} regression hits total`);
console.log('  (e) compound line re-fires or missed compounds:',
  recs.filter(r => r.compoundFramingLines !== (r.compoundRaises || []).length).map(r => `s${r.seed}: lines=${r.compoundFramingLines} raises=${(r.compoundRaises || []).length}`));
