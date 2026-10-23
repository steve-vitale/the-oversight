#!/usr/bin/env node
// analyze-scholardistsafe-b.js — scholar-safe variant adjudication.
//
// Reads evidence/2026-10-23/perseed-scholardistsafe-b/*.json and judges
// the pre-registered PRIMARY + guardrails (see sim-scholardistsafe-b.md
// header):
//   PRIMARY (binding): exposure-normalized thin-pool starvation deaths
//       per 100 village-days (corpus total thin-pool deaths / corpus
//       total gameDays x 100): armed <= control x 0.85. If control rate
//       is 0: PASS requires armed rate 0, else FAIL.
//   g1: total starvation deaths armed <= control+2
//   g2: median survival (gameDays) armed >= control-10
//   g3: no new death modes (mechanism-class level: 'experiment' ->
//       sickness-adjacent, named-threat kills -> combat, applied at
//       analysis time from raw causes)
//   g4: median per-run median daily pantryFreshDays armed >= control-1
//   ENGAGEMENT (kill-fast): grantedKcal > 0 on >= 12/32 armed runs
// Plus wall numbers, paired rows (directions reported, never re-scored),
// mechanism telemetry, gate census, beat sample.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-23', 'perseed-scholardistsafe-b');

function load() {
  return fs.readdirSync(DIR).filter(f => /\.json$/.test(f))
    .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
let MONSTER_NAMES = new Set();
try {
  const ms = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of (Array.isArray(ms) ? ms : ms.monsters || [])) {
    if (!m) continue;
    if (m.name) MONSTER_NAMES.add(String(m.name));
    for (const a of (m.villageNames || [])) MONSTER_NAMES.add(String(a));
    for (const a of (m.aliases || [])) MONSTER_NAMES.add(String(a));
  }
} catch (e) {}
function mechClass(cause) {
  const c = String(cause || 'unknown');
  if (c === 'starvation') return 'starvation';
  if (c === 'thirst' || c === 'dehydration') return 'dehydration';
  if (/wound/i.test(c)) return 'wound';
  if (c === 'sickness' || c === 'disease' || c === 'lockjaw' || /experiment/i.test(c)) return 'sickness';
  if (c === 'contest') return 'contest';
  if (/raid/i.test(c)) return 'raid';
  if (/combat/i.test(c) || c === 'monster' || c === 'alien' || c === 'alien_beam' ||
      c === 'ambush' || c === 'expedition' || c.startsWith('split-fight:') || MONSTER_NAMES.has(c)) return 'combat';
  return 'other:' + c;
}
const key = r => r.policy + '|s' + r.seed;
const median = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const rowModes = r => [...new Set(r.deaths.map(d => mechClass(d.cause)))].sort();

function main() {
  const rows = load();
  const byKey = {};
  for (const r of rows) byKey[key(r) + '|' + r.arm] = r;
  const pairs = [];
  for (const r of rows) {
    if (r.arm !== 'control') continue;
    const a = byKey[key(r) + '|armed'];
    if (!a) { console.log('MISSING armed pair for ' + key(r)); continue; }
    pairs.push({ c: r, a });
  }
  console.log('configs: ' + rows.length + ', paired: ' + pairs.length + '\n');

  // PRIMARY: exposure-normalized thin-pool starvation per 100 village-days
  const cThin = pairs.reduce((t, p) => t + p.c.thinPoolStarvation, 0);
  const aThin = pairs.reduce((t, p) => t + p.a.thinPoolStarvation, 0);
  const cDays = pairs.reduce((t, p) => t + p.c.gameDays, 0);
  const aDays = pairs.reduce((t, p) => t + p.a.gameDays, 0);
  const cRate = cThin / Math.max(1, cDays) * 100;
  const aRate = aThin / Math.max(1, aDays) * 100;
  let primaryVerdict;
  if (cRate === 0) primaryVerdict = (aRate === 0) ? 'PASS (control rate 0, armed 0)' : 'FAIL (control rate 0, armed > 0)';
  else primaryVerdict = (aRate <= cRate * 0.85) ? 'GO' : 'MISS';
  const cTot = pairs.reduce((t, p) => t + p.c.totalStarvation, 0);
  const aTot = pairs.reduce((t, p) => t + p.a.totalStarvation, 0);
  const cMed = median(pairs.map(p => p.c.gameDays));
  const aMed = median(pairs.map(p => p.a.gameDays));
  const cModes = new Set(), aModes = new Set();
  for (const p of pairs) { rowModes(p.c).forEach(m => cModes.add(m)); rowModes(p.a).forEach(m => aModes.add(m)); }
  const newModes = [...aModes].filter(m => !cModes.has(m));
  const cPan = median(pairs.map(p => p.c.medFreshDays).filter(x => x !== null));
  const aPan = median(pairs.map(p => p.a.medFreshDays).filter(x => x !== null));

  console.log('=== PRIMARY + guardrails (pre-registered bars, ' + pairs.length + ' paired configs) ===');
  console.log(`PRIMARY exposure-normalized thin-pool starvation /100 village-days: control=${cThin}/${cDays}d=${cRate.toFixed(3)} armed=${aThin}/${aDays}d=${aRate.toFixed(3)}  bar: armed <= control x 0.85  => ${primaryVerdict}`);
  console.log(`g1 total starvation: control=${cTot} armed=${aTot}  bar: armed <= control+2  => ${aTot <= cTot + 2 ? 'PASS' : 'FAIL'}`);
  console.log(`g2 median survival: control=${cMed}d armed=${aMed}d  bar: armed >= control-10  => ${aMed >= cMed - 10 ? 'PASS' : 'FAIL'}`);
  console.log(`g3 death modes: control=[${[...cModes].sort()}] armed=[${[...aModes].sort()}]  new=[${newModes}]  => ${newModes.length ? 'REVIEW' : 'PASS'}`);
  console.log(`g4 median pantry: control=${cPan} armed=${aPan}  bar: armed >= control-1  => ${aPan >= cPan - 1 ? 'PASS' : 'FAIL'}`);
  console.log('');

  console.log('=== paired rows (thin-pool starvation / total starvation / gameDays) — directions reported, never re-scored ===');
  let better = 0, worse = 0, same = 0;
  for (const p of pairs) {
    const dir = p.a.thinPoolStarvation < p.c.thinPoolStarvation ? 'better' : (p.a.thinPoolStarvation > p.c.thinPoolStarvation ? 'worse' : 'same');
    if (dir === 'better') better++; else if (dir === 'worse') worse++; else same++;
    const flag = (p.a.thinPoolStarvation !== p.c.thinPoolStarvation) ? `  <-- ${dir}` : '';
    console.log(`  ${p.c.policy} s${p.c.seed}: thin ${p.c.thinPoolStarvation}->${p.a.thinPoolStarvation} | tot ${p.c.totalStarvation}->${p.a.totalStarvation} | days ${p.c.gameDays}->${p.a.gameDays}${flag}`);
  }
  console.log(`  pair directions: better=${better} worse=${worse} same=${same}`);
  console.log('');

  // mechanism telemetry + gate census
  const agg = { thinMeals: 0, halves: 0, grants: 0, grantedKcal: 0, voices: 0, errors: 0, gatedBurn: 0, gatedHunger: 0, gatedNoMouth: 0 };
  let engagedRuns = 0;
  for (const p of pairs) {
    const t = p.a.tele || {};
    for (const k of Object.keys(agg)) agg[k] += t[k] || 0;
    if ((t.grantedKcal || 0) > 0) engagedRuns++;
  }
  console.log(`mechanism (armed, ${pairs.length} configs): thinMeals=${agg.thinMeals} halves=${agg.halves} grants=${agg.grants} grantedKcal=${agg.grantedKcal} voices=${agg.voices} errors=${agg.errors}`);
  console.log(`gate census: gatedBurn=${agg.gatedBurn} (d1 artifact days) gatedHunger=${agg.gatedHunger} (scholar hungry) gatedNoMouth=${agg.gatedNoMouth} (no eligible mouth)`);
  console.log(`ENGAGEMENT kill-fast gate: grantedKcal>0 on ${engagedRuns}/${pairs.length} armed runs  bar: >= 12/${pairs.length}  => ${engagedRuns >= 12 ? 'PASS' : 'KILL'}`);
  console.log('');

  // wall
  const wall = (rs, f) => rs.filter(f).length;
  for (const arm of ['control', 'armed']) {
    const rs = pairs.map(p => p[arm === 'control' ? 'c' : 'a']);
    const surv = rs.map(r => r.gameDays).sort((a, b) => a - b);
    console.log(`wall ${arm}: won ${wall(rs, r => r.won)}/${rs.length}, national ${wall(rs, r => r.national)}, table ${wall(rs, r => r.table)}, ` +
      `wave4 ${wall(rs, r => r.maxWave >= 4)}, wave5 ${wall(rs, r => r.maxWave >= 5)}, exiled ${wall(rs, r => r.exiled)}, ` +
      `median ${median(surv)}d max ${surv[surv.length - 1]}d`);
  }
  console.log('');

  // death-cause shares
  for (const arm of ['control', 'armed']) {
    const rs = pairs.map(p => p[arm === 'control' ? 'c' : 'a']);
    const all = rs.flatMap(r => r.deaths.map(d => mechClass(d.cause)));
    const share = {};
    for (const c of all) share[c] = (share[c] || 0) + 1;
    const tot = all.length || 1;
    console.log(`death-cause shares ${arm} (${all.length} deaths): ` +
      Object.keys(share).sort((a, b) => share[b] - share[a]).map(c => `${c} ${(share[c] / tot * 100).toFixed(1)}%`).join(', '));
  }
  console.log('');

  // thin-pool starvation census
  console.log('=== thin-pool starvation census ===');
  for (const p of pairs) {
    for (const arm of ['c', 'a']) {
      for (const d of p[arm].deaths) {
        if (d.thinPool) console.log(`  [${arm === 'c' ? 'control' : 'armed'}] ${p.c.policy} s${p.c.seed} d${d.day} ${d.who} fd=${d.deathDayFreshDays} player=${d.player}`);
      }
    }
  }
  console.log('');

  // beat sample (sense-test)
  console.log('=== beat sample (first 8 armed beats) ===');
  let n = 0;
  for (const p of pairs) {
    for (const b of (p.a.beats || [])) {
      if (n < 8) console.log(`  ${p.a.policy} s${p.a.seed} d${b.day}: ${b.line}`);
      n++;
    }
  }
  console.log('  total armed beats: ' + n);
}
main();
