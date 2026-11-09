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
'use strict';
const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function summarize(dir) {
  const leg = { seeds: [], villageDays: 0, medicPresentDays: 0, zeroMedicSeeds: 0,
    spawnMedics: 0, spawnSeedsWithMedic: 0, lessons: [], joins: [], medicJoins: [],
    medicDeaths: [], triageNonMedicMax: 0, triageNonMedicDays: 0,
    wcHolderDays: 0, hmHolderDays: 0,
    national: 0, table: 0, wins: 0, waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    survivalDays: [], starvationDeaths: 0, deathCauses: {}, producedNeed: null };
  for (let s = 96301; s <= 96308; s++) {
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
  console.log(`=== sim-medheadcount-a ${tag} ===`);
  console.log(`WALL: national=${leg.national}/8 table=${leg.table} wins=${leg.wins} waveReach=${JSON.stringify(leg.waveReach)} medianSurvival=${leg.medianSurvival}d max=${leg.maxSurvival}d`);
  console.log(`PRIMARY: medicPresent=${leg.medicPresentDays}/${leg.villageDays} share=${leg.medicPresentShare == null ? 'n/a' : (leg.medicPresentShare * 100).toFixed(1) + '%'} zeroMedicSeeds=${leg.zeroMedicSeeds}/8 spawnMedics=${leg.spawnMedics} spawnSeedsWithMedic=${leg.spawnSeedsWithMedic}/8`);
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
if (getArg('--leg')) {
  printLeg('BEFORE', summarize(getArg('--leg')));
} else if (getArg('--before') && getArg('--after')) {
  const b = summarize(getArg('--before'));
  const a = summarize(getArg('--after'));
  printLeg('BEFORE', b);
  printLeg('AFTER', a);
  const shareOk = a.medicPresentShare != null && a.medicPresentShare >= 0.70;
  const zeroOk = a.zeroMedicSeeds <= 1;
  const survOk = a.medianSurvival != null && b.medianSurvival != null && a.medianSurvival >= 0.8 * b.medianSurvival;
  const starvOk = a.starvationDeaths <= b.starvationDeaths + 2;
  console.log(`G1 PRIMARY: share=${(a.medicPresentShare * 100).toFixed(1)}% (need >=70%, before ${(b.medicPresentShare * 100).toFixed(1)}%) -> ${shareOk ? 'PASS' : 'FAIL'}; zeroMedicSeeds=${a.zeroMedicSeeds} (need <=1, before ${b.zeroMedicSeeds}) -> ${zeroOk ? 'PASS' : 'FAIL'}; G1 ${shareOk && zeroOk ? 'PASS' : 'FAIL'}`);
  console.log(`G2 GUARDRAILS: medianSurvival ${a.medianSurvival} vs 0.8x before ${Math.round(0.8 * b.medianSurvival)} -> ${survOk ? 'PASS' : 'FAIL'}; starvation ${a.starvationDeaths} vs before+2 ${b.starvationDeaths + 2} -> ${starvOk ? 'PASS' : 'FAIL'}; G2 ${survOk && starvOk ? 'PASS' : 'FAIL'}`);
  console.log(`VERDICT: ${shareOk && zeroOk && survOk && starvOk ? 'GO (G1+G2 pass; G3 panel + G4 proof judged separately)' : 'NO-GO'}`);
  process.exit(shareOk && zeroOk && survOk && starvOk ? 0 : 1);
} else {
  console.error('USAGE: analyze-medheadcount-a.js --leg <dir> | --before <dir> --after <dir>');
  process.exit(2);
}
