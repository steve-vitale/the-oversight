#!/usr/bin/env node
// analyze-scholardist-b.js — pilot adjudication for sim-scholardist-b.
//
// Reads evidence/2026-10-22/perseed-scholardist-b/*.json and judges the
// pre-registered PRIMARY + guardrails (see sim-scholardist-b.md header):
//   PRIMARY: thin-pool starvation deaths armed <= control-2 AND control >= 1
//   g1: total starvation armed <= control
//   g2: median survival (gameDays) armed >= control-10
//   g3: no new death modes (mechanism-class level)
//   g4: median per-run median daily pantryFreshDays armed >= 0.8x control
//   ENGAGEMENT (kill-fast): grantedKcal > 0 on >= 6/16 armed runs
// Plus wall numbers, paired rows, mechanism telemetry, beat sample.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-scholardist-b');

function load() {
  return fs.readdirSync(DIR).filter(f => /\.json$/.test(f))
    .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
// Refined mechanism-class taxonomy (applied at analysis time from the raw
// cause; the per-seed pclass is the sweep-time class). Monster-name causes
// (registerDeath cause = mName, 'split-fight: '+mname) are combat deaths;
// 'thirst' is dehydration; wound sentences are wounds; alien-player kills
// are combat.
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
  if (c === 'sickness' || c === 'disease' || c === 'lockjaw') return 'sickness';
  if (c === 'contest') return 'contest';
  if (/raid/i.test(c)) return 'raid';
  if (/combat/i.test(c) || c === 'monster' || c === 'alien' || c === 'alien_beam' ||
      c === 'ambush' || c === 'expedition' || c.startsWith('split-fight:') || MONSTER_NAMES.has(c)) return 'combat';
  return 'other:' + c;
}
const key = r => r.policy + '|s' + r.seed;
const median = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
// g3 uses the refined mechanism classes, recomputed from raw causes
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

  const cThin = pairs.reduce((t, p) => t + p.c.thinPoolStarvation, 0);
  const aThin = pairs.reduce((t, p) => t + p.a.thinPoolStarvation, 0);
  const cTot = pairs.reduce((t, p) => t + p.c.totalStarvation, 0);
  const aTot = pairs.reduce((t, p) => t + p.a.totalStarvation, 0);
  const cMed = median(pairs.map(p => p.c.gameDays));
  const aMed = median(pairs.map(p => p.a.gameDays));
  const cModes = new Set(), aModes = new Set();
  for (const p of pairs) { rowModes(p.c).forEach(m => cModes.add(m)); rowModes(p.a).forEach(m => aModes.add(m)); }
  const newModes = [...aModes].filter(m => !cModes.has(m));
  const cPan = median(pairs.map(p => p.c.medFreshDays).filter(x => x !== null));
  const aPan = median(pairs.map(p => p.a.medFreshDays).filter(x => x !== null));

  console.log('=== PRIMARY + guardrails ===');
  console.log(`thin-pool starvation: control=${cThin} armed=${aThin}  bar: armed <= control-2 AND control >= 1  => ${aThin <= cThin - 2 && cThin >= 1 ? 'GO' : 'MISS'}`);
  console.log(`g1 total starvation: control=${cTot} armed=${aTot}  bar: armed <= control  => ${aTot <= cTot ? 'PASS' : 'FAIL'}`);
  console.log(`g2 median survival: control=${cMed}d armed=${aMed}d  bar: armed >= control-10  => ${aMed >= cMed - 10 ? 'PASS' : 'FAIL'}`);
  console.log(`g3 death modes: control=[${[...cModes].sort()}] armed=[${[...aModes].sort()}]  new=[${newModes}]  => ${newModes.length ? 'REVIEW' : 'PASS'}`);
  console.log(`g4 median pantry: control=${cPan} armed=${aPan}  bar: armed >= 0.8x control  => ${aPan >= 0.8 * cPan ? 'PASS' : 'FAIL'}`);
  console.log('');

  console.log('=== paired rows (thin-pool starvation / total starvation / gameDays) ===');
  for (const p of pairs) {
    const flag = (p.a.thinPoolStarvation !== p.c.thinPoolStarvation) ? '  <-- DELTA' : '';
    console.log(`  ${p.c.policy} s${p.c.seed}: thin ${p.c.thinPoolStarvation}->${p.a.thinPoolStarvation} | tot ${p.c.totalStarvation}->${p.a.totalStarvation} | days ${p.c.gameDays}->${p.a.gameDays}${flag}`);
  }
  console.log('');

  // mechanism telemetry
  let thinMeals = 0, halves = 0, grants = 0, grantedKcal = 0, voices = 0, errs = 0;
  let engagedRuns = 0;
  for (const p of pairs) {
    const t = p.a.tele || {};
    thinMeals += t.thinMeals || 0; halves += t.halves || 0; grants += t.grants || 0;
    grantedKcal += t.grantedKcal || 0; voices += t.voices || 0; errs += t.errors || 0;
    if ((t.grantedKcal || 0) > 0) engagedRuns++;
  }
  console.log(`mechanism (armed, 16 configs): thinMeals=${thinMeals} halves=${halves} grants=${grants} grantedKcal=${grantedKcal} voices=${voices} errors=${errs}`);
  console.log(`ENGAGEMENT kill-fast gate: grantedKcal>0 on ${engagedRuns}/16 armed runs  bar: >= 6/16  => ${engagedRuns >= 6 ? 'PASS' : 'KILL'}`);
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
