#!/usr/bin/env node
// analyze-medheadcount-a.js — MEDIC HEADCOUNT census analyzer
// (sim-medheadcount-a, 2026-11-08.) Reads the medheadcount-a-corpus
// before leg (and, with --before/--after, judges the lever against the
// prereg bar) and reports: medic-present village-days share, seeds with
// zero medic-days, spawn medics, wound_care / herbal_medicine lessons,
// triage holders who are not occupation-medics, medic joins by source,
// medic deaths, wall numbers, guardrails.
//
//   node scripts/analyze-medheadcount-a.js --leg <dir>
//   node scripts/analyze-medheadcount-a.js --before <dir> --after <dir>
//   node scripts/analyze-medheadcount-a.js --before <dir> --after <dir> --seeds 96009,...,96024
//
// (sim-medheadcount-confirm-a 2026-11-09: --seeds generalizes the
// 8-seed pilot band to any seed list; denominators and the G1/G2 bars
// scale with the seed count (zero-medic ≤1 per 8 seeds, starvation ≤
// before + 2 per 8 seeds). With the default pilot band the output is
// byte-identical to the pilot analyzer.)
'use strict';
const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const PILOT_SEEDS = [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308];

// Death-cause MODE collapse (G2 third clause, prereg mode reading):
// fight labels are one mode, not many. A mode is "new" when it is
// absent in before and present with count >= 2 in after.
const FIGHT_CAUSE = /monster|arena|combat|wild|expedition|duel|raid|ambush|stranger|contest/i;
function causeMode(c) {
  c = String(c || '?').toLowerCase();
  if (FIGHT_CAUSE.test(c)) return 'fight';
  return c.slice(0, 32);
}
function newDeathModes(beforeCauses, afterCauses) {
  const bModes = {}, aModes = {};
  for (const [c, n] of Object.entries(beforeCauses || {})) bModes[causeMode(c)] = (bModes[causeMode(c)] || 0) + n;
  for (const [c, n] of Object.entries(afterCauses || {})) aModes[causeMode(c)] = (aModes[causeMode(c)] || 0) + n;
  return Object.entries(aModes)
    .filter(([m, n]) => n >= 2 && !(bModes[m] > 0))
    .map(([m, n]) => `${m}:${n}`);
}

function summarize(dir, seeds) {
  const list = seeds && seeds.length ? seeds : PILOT_SEEDS;
  const n = list.length;
  const leg = { seeds: [], villageDays: 0, medicPresentDays: 0, zeroMedicSeeds: 0,
    spawnMedics: 0, spawnSeedsWithMedic: 0, lessons: [], joins: [], medicJoins: [],
    medicDeaths: [], triageNonMedicMax: 0, triageNonMedicDays: 0,
    wcHolderDays: 0, hmHolderDays: 0,
    national: 0, table: 0, wins: 0, waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    survivalDays: [], starvationDeaths: 0, deathCauses: {}, producedNeed: null, seedCount: n };
  for (const s of list) {
    const f = path.join(dir, `medheadcount-a-competent-s${s}.json`);
    if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
    const d = readJson(f);
    const days = d.days || [];
    let present = 0, zeroSeed = true, triageNMMax = 0;
    for (const m of days) {
      if ((m.medicCount || 0) >= 1) { present++; zeroSeed = false; }
      if ((m.triageNonMedic || 0) > 0) leg.triageNonMedicDays++;
      if ((m.triageNonMedic || 0) > triageNMMax) triageNMMax = m.triageNonMedic;
      leg.wcHolderDays += (m.wcHolders || 0) > 0 ? 1 : 0;
      leg.hmHolderDays += (m.hmHolders || 0) > 0 ? 1 : 0;
    }
    leg.villageDays += days.length;
    leg.medicPresentDays += present;
    if (zeroSeed) leg.zeroMedicSeeds++;
    if (d.spawn) {
      leg.spawnMedics += d.spawn.medics || 0;
      if ((d.spawn.medics || 0) >= 1) leg.spawnSeedsWithMedic++;
    }
    leg.triageNonMedicMax = Math.max(leg.triageNonMedicMax, triageNMMax);
    for (const l of (d.lessons || [])) leg.lessons.push({ seed: s, ...l });
    for (const j of (d.joins || [])) {
      leg.joins.push({ seed: s, ...j });
      if (j.isMedic) leg.medicJoins.push({ seed: s, ...j });
    }
    for (const md of (d.medicDeaths || [])) leg.medicDeaths.push({ seed: s, ...md });
    if (d.national) leg.national++;
    if (d.table) leg.table++;
    if (d.win) leg.wins++;
    for (const w of (d.waveReach || [])) if (leg.waveReach[w] != null) leg.waveReach[w]++;
    leg.survivalDays.push(d.daysAlive || 0);
    for (const [c, n] of Object.entries(d.deathCauses || {})) {
      leg.deathCauses[c] = (leg.deathCauses[c] || 0) + n;
      if (/starvation/.test(c)) leg.starvationDeaths += n;
    }
    leg.seeds.push({ seed: s, daysAlive: d.daysAlive, villageDays: days.length,
      medicPresentDays: present, spawnMedics: (d.spawn && d.spawn.medics) || 0,
      lessons: (d.lessons || []).length, joins: (d.joins || []).length,
      medicJoins: (d.joins || []).filter(j => j.isMedic).length,
      medicDeaths: (d.medicDeaths || []).length, triageNonMedicMax: triageNMMax });
  }
  leg.medicPresentShare = leg.villageDays ? leg.medicPresentDays / leg.villageDays : null;
  const sorted = [...leg.survivalDays].sort((a, b) => a - b);
  leg.medianSurvival = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  leg.maxSurvival = sorted.length ? sorted[sorted.length - 1] : null;
  return leg;
}

function printLeg(tag, leg) {
  const n = leg.seedCount || 8;
  console.log(`=== sim-medheadcount-a ${tag} ===`);
  console.log(`WALL: national=${leg.national}/${n} table=${leg.table} wins=${leg.wins} waveReach=${JSON.stringify(leg.waveReach)} medianSurvival=${leg.medianSurvival}d max=${leg.maxSurvival}d`);
  console.log(`PRIMARY: medicPresent=${leg.medicPresentDays}/${leg.villageDays} share=${leg.medicPresentShare == null ? 'n/a' : (leg.medicPresentShare * 100).toFixed(1) + '%'} zeroMedicSeeds=${leg.zeroMedicSeeds}/${n} spawnMedics=${leg.spawnMedics} spawnSeedsWithMedic=${leg.spawnSeedsWithMedic}/${n}`);
  console.log(`PATHS: medLessons=${leg.lessons.length} (${leg.lessons.map(l => l.skill).join(',') || 'none'}) triageNonMedicDays=${leg.triageNonMedicDays} triageNonMedicMax=${leg.triageNonMedicMax} wcHolderDays=${leg.wcHolderDays} hmHolderDays=${leg.hmHolderDays}`);
  console.log(`RECRUIT: joins=${leg.joins.length} medicJoins=${leg.medicJoins.length} (${leg.medicJoins.map(j => j.seed + ':' + j.source + ':' + j.occ).join(', ') || 'none'}) medicDeaths=${leg.medicDeaths.length} (${leg.medicDeaths.map(m => m.seed + ':' + m.occ + '@d' + m.day).join(', ') || 'none'})`);
  console.log(`GUARDRAILS: starvationDeaths=${leg.starvationDeaths} deathCauses=${JSON.stringify(leg.deathCauses)}`);
  for (const r of leg.seeds) {
    console.log(`  seed ${r.seed}: days=${r.daysAlive} medicPresent=${r.medicPresentDays}/${r.villageDays} spawnMedics=${r.spawnMedics} lessons=${r.lessons} joins=${r.joins} medicJoins=${r.medicJoins} medicDeaths=${r.medicDeaths} triageNonMedicMax=${r.triageNonMedicMax}`);
  }
  if (leg.lessons.length) {
    console.log('LESSONS:');
    for (const l of leg.lessons) console.log(`  ${l.seed} d${l.day}: ${l.teacher} -> ${l.learner} (${l.skill})`);
  }
}

const args = process.argv.slice(2);
const getArg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const seedArg = getArg('--seeds');
const seeds = seedArg ? seedArg.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean) : null;
if (seedArg && (!seeds || !seeds.length)) { console.error('USAGE: --seeds <csv> needs at least one seed'); process.exit(2); }
if (getArg('--leg')) {
  printLeg('BEFORE', summarize(getArg('--leg'), seeds));
} else if (getArg('--before') && getArg('--after')) {
  const b = summarize(getArg('--before'), seeds);
  const a = summarize(getArg('--after'), seeds);
  printLeg('BEFORE', b);
  printLeg('AFTER', a);
  // Bars scale with the seed count (confirm prereg: zero-medic ≤1 per
  // 8 seeds, starvation ≤ before + 2 per 8 seeds). At 8 seeds these
  // reduce exactly to the pilot bars.
  const scale = (a.seedCount || 8) / 8;
  const zeroBar = Math.max(1, Math.round(scale));
  const starvBar = b.starvationDeaths + 2 * scale;
  const shareOk = a.medicPresentShare != null && a.medicPresentShare >= 0.70;
  const zeroOk = a.zeroMedicSeeds <= zeroBar;
  const survOk = a.medianSurvival != null && b.medianSurvival != null && a.medianSurvival >= 0.8 * b.medianSurvival;
  const starvOk = a.starvationDeaths <= starvBar;
  const newModes = newDeathModes(b.deathCauses, a.deathCauses);
  console.log(`G1 PRIMARY: share=${(a.medicPresentShare * 100).toFixed(1)}% (need >=70%, before ${(b.medicPresentShare * 100).toFixed(1)}%) -> ${shareOk ? 'PASS' : 'FAIL'}; zeroMedicSeeds=${a.zeroMedicSeeds} (need <=${zeroBar}, before ${b.zeroMedicSeeds}) -> ${zeroOk ? 'PASS' : 'FAIL'}; G1 ${shareOk && zeroOk ? 'PASS' : 'FAIL'}`);
  console.log(`G2 GUARDRAILS: medianSurvival ${a.medianSurvival} vs 0.8x before ${Math.round(0.8 * b.medianSurvival)} -> ${survOk ? 'PASS' : 'FAIL'}; starvation ${a.starvationDeaths} vs before+${2 * scale} ${starvBar} -> ${starvOk ? 'PASS' : 'FAIL'}; G2 ${survOk && starvOk ? 'PASS' : 'FAIL'}`);
  console.log(`G2 NEW-MODES (mode reading, fight labels collapsed): ${newModes.length ? newModes.join(', ') + ' -> FAIL' : 'none -> PASS'}`);
  console.log(`VERDICT: ${shareOk && zeroOk && survOk && starvOk && !newModes.length ? 'GO (G1+G2 pass; G3 panel + G4 proof judged separately)' : 'NO-GO'}`);
  process.exit(shareOk && zeroOk && survOk && starvOk && !newModes.length ? 0 : 1);
} else {
  console.error('USAGE: analyze-medheadcount-a.js --leg <dir> | --before <dir> --after <dir> [--seeds <csv>]');
  process.exit(2);
}
