#!/usr/bin/env node
// analyze-wideduty-a.js — WIDEN THE DUTY census analyzer
// (sim-wideduty-a, 2026-11-09.) Reads the wideduty-a-corpus before leg
// (and, with --before/--after, judges the lever against the prereg bar)
// and reports: duty-held village-days share, duty-held-by-trained share,
// seeds with zero duty-held days, eligible-count coverage, duty cures,
// wall numbers, guardrails.
//
// G2 third clause ("no new death-cause mode >= 2") is WIRED HERE, not
// hand-judged (the medheadcount metric review says hand-judging it is
// not acceptable for the next arm). Modes group labels by HOW the
// villager died, not the exact string: the fight family (monster /
// arena / combat / wild / expedition / duel / hunt / beast / attack /
// ambush / raid / maul / slain / killed / fight / stranger / titan /
// reunion / show / contest) is one mode; starvation, dehydration,
// wound/sickness (sick / disease / fever / poison / radiation /
// plague / gut / tremble / lockjaw / wound / infection / rot / belly),
// cold/exposure, and grief are their own modes; any label matching
// none of these is its own mode (conservative: a genuinely new label
// with count >= 2 fails the clause and must be explained, not waved
// through as label noise).
//
//   node scripts/analyze-wideduty-a.js --leg <dir>
//   node scripts/analyze-wideduty-a.js --before <dir> --after <dir>
'use strict';
const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Seed list: the pilot band by default; the confirm band overrides via
// WIDEDUTY_SEEDS (comma list — must match the sweep that wrote the
// corpus). N is used in every "/8" count below.
const SEED_LIST = (process.env.WIDEDUTY_SEEDS || '96301,96302,96303,96304,96305,96306,96307,96308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const N = SEED_LIST.length;

// Death-cause MODE: how they died, not the exact label string.
function causeMode(c) {
  c = String(c || '?').toLowerCase();
  if (/starv/.test(c)) return 'starvation';
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/monster|arena|combat|wild|expedition|duel|hunt|beast|attack|ambush|raid|maul|slain|killed|fight|stranger|titan|reunion|show|contest/.test(c)) return 'fight';
  if (/sick|disease|fever|poison|radiation|plague|gut|tremble|lockjaw|wound|infection|rot|belly|cholera|dysentery|flu|pneumonia|sepsis|tetanus|rabies/.test(c)) return 'wound/sickness';
  if (/cold|frozen|exposure|hypothermia|froze/.test(c)) return 'cold/exposure';
  if (/grief|despair|suicide|starve-protest|hunger-strike/.test(c)) return 'grief';
  return 'label:' + c.slice(0, 32);
}

function summarize(dir) {
  const leg = { seeds: [], villageDays: 0, dutyHeldDays: 0, dutyTrainedDays: 0,
    zeroDutySeeds: 0, eligibleDays: 0, eligibleMax: 0,
    medicPresentDays: 0, zeroMedicSeeds: 0,
    spawnMedics: 0, spawnSeedsWithMedic: 0, lessons: [], joins: [], medicJoins: [],
    medicDeaths: [], triageNonMedicMax: 0, triageNonMedicDays: 0,
    wcHolderDays: 0, hmHolderDays: 0, curesAbility: 0, curesMedicine: 0,
    national: 0, table: 0, wins: 0, waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    survivalDays: [], starvationDeaths: 0, deathCauses: {}, deathModes: {},
    newModes: [] };
  for (const s of SEED_LIST) {
    const f = path.join(dir, `wideduty-a-competent-s${s}.json`);
    if (!fs.existsSync(f)) { console.error('MISSING ' + f); process.exit(2); }
    const d = readJson(f);
    const days = d.days || [];
    let held = 0, trained = 0, zeroSeed = true, present = 0, zeroMedic = true, eligMax = 0;
    for (const m of days) {
      if ((m.dutyHeld || 0) >= 1) { held++; zeroSeed = false; }
      if ((m.dutyTrained || 0) >= 1) trained++;
      if ((m.eligibleCount || 0) >= 1) leg.eligibleDays++;
      if ((m.eligibleCount || 0) > eligMax) eligMax = m.eligibleCount;
      if ((m.medicCount || 0) >= 1) { present++; zeroMedic = false; }
      if ((m.triageNonMedic || 0) > 0) leg.triageNonMedicDays++;
      if ((m.triageNonMedic || 0) > leg.triageNonMedicMax) leg.triageNonMedicMax = m.triageNonMedic;
      leg.wcHolderDays += (m.wcHolders || 0) > 0 ? 1 : 0;
      leg.hmHolderDays += (m.hmHolders || 0) > 0 ? 1 : 0;
    }
    leg.villageDays += days.length;
    leg.dutyHeldDays += held;
    leg.dutyTrainedDays += trained;
    if (zeroSeed) leg.zeroDutySeeds++;
    leg.eligibleMax = Math.max(leg.eligibleMax, eligMax);
    leg.medicPresentDays += present;
    if (zeroMedic) leg.zeroMedicSeeds++;
    if (d.spawn) {
      leg.spawnMedics += d.spawn.medics || 0;
      if ((d.spawn.medics || 0) >= 1) leg.spawnSeedsWithMedic++;
    }
    // Duty cures: last day's cumulative counts.
    const last = days[days.length - 1];
    if (last) {
      leg.curesAbility += last.curesAbility || 0;
      leg.curesMedicine += last.curesMedicine || 0;
    }
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
      const m = causeMode(c);
      leg.deathModes[m] = (leg.deathModes[m] || 0) + n;
    }
    leg.seeds.push({ seed: s, daysAlive: d.daysAlive, villageDays: days.length,
      dutyHeldDays: held, dutyTrainedDays: trained,
      medicPresentDays: present, spawnMedics: (d.spawn && d.spawn.medics) || 0,
      eligibleMax: eligMax,
      lessons: (d.lessons || []).length, joins: (d.joins || []).length,
      medicJoins: (d.joins || []).filter(j => j.isMedic).length,
      medicDeaths: (d.medicDeaths || []).length, triageNonMedicMax: leg.triageNonMedicMax });
  }
  leg.dutyHeldShare = leg.villageDays ? leg.dutyHeldDays / leg.villageDays : null;
  leg.dutyTrainedShare = leg.villageDays ? leg.dutyTrainedDays / leg.villageDays : null;
  leg.medicPresentShare = leg.villageDays ? leg.medicPresentDays / leg.villageDays : null;
  leg.eligibleShare = leg.villageDays ? leg.eligibleDays / leg.villageDays : null;
  const sorted = [...leg.survivalDays].sort((a, b) => a - b);
  leg.medianSurvival = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  leg.maxSurvival = sorted.length ? sorted[sorted.length - 1] : null;
  return leg;
}

function printLeg(tag, leg) {
  console.log(`=== sim-wideduty-a ${tag} ===`);
  console.log(`WALL: national=${leg.national}/${N} table=${leg.table} wins=${leg.wins} waveReach=${JSON.stringify(leg.waveReach)} medianSurvival=${leg.medianSurvival}d max=${leg.maxSurvival}d`);
  console.log(`PRIMARY: dutyHeld=${leg.dutyHeldDays}/${leg.villageDays} share=${leg.dutyHeldShare == null ? 'n/a' : (leg.dutyHeldShare * 100).toFixed(1) + '%'} dutyTrained=${leg.dutyTrainedDays}/${leg.villageDays} (${leg.dutyTrainedShare == null ? 'n/a' : (leg.dutyTrainedShare * 100).toFixed(1) + '%'}) zeroDutySeeds=${leg.zeroDutySeeds}/${N}`);
  console.log(`COVERAGE: eligibleDays=${leg.eligibleDays}/${leg.villageDays} (${leg.eligibleShare == null ? 'n/a' : (leg.eligibleShare * 100).toFixed(1) + '%'}) eligibleMax=${leg.eligibleMax} medicPresent=${leg.medicPresentDays}/${leg.villageDays} (${leg.medicPresentShare == null ? 'n/a' : (leg.medicPresentShare * 100).toFixed(1) + '%'}) zeroMedicSeeds=${leg.zeroMedicSeeds}/${N} spawnMedics=${leg.spawnMedics} spawnSeedsWithMedic=${leg.spawnSeedsWithMedic}/${N}`);
  console.log(`PATHS: medLessons=${leg.lessons.length} triageNonMedicDays=${leg.triageNonMedicDays} triageNonMedicMax=${leg.triageNonMedicMax} wcHolderDays=${leg.wcHolderDays} hmHolderDays=${leg.hmHolderDays} dutyCures ability=${leg.curesAbility} medicine=${leg.curesMedicine}`);
  console.log(`RECRUIT: joins=${leg.joins.length} medicJoins=${leg.medicJoins.length} medicDeaths=${leg.medicDeaths.length}`);
  console.log(`GUARDRAILS: starvationDeaths=${leg.starvationDeaths} deathModes=${JSON.stringify(leg.deathModes)} deathCauses=${JSON.stringify(leg.deathCauses)}`);
  for (const r of leg.seeds) {
    console.log(`  seed ${r.seed}: days=${r.daysAlive} dutyHeld=${r.dutyHeldDays}/${r.villageDays} dutyTrained=${r.dutyTrainedDays} eligibleMax=${r.eligibleMax} medicPresent=${r.medicPresentDays} spawnMedics=${r.spawnMedics} lessons=${r.lessons} joins=${r.joins} medicJoins=${r.medicJoins} medicDeaths=${r.medicDeaths}`);
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
  // G1 thresholds come from the prereg (evidence/2026-11-09/sim-wideduty-a-prereg.md).
  // They are read from env so the analyzer judges the bar the prereg set,
  // not a bar invented here. Defaults match the prereg as written.
  const SHARE_GO = parseFloat(process.env.WIDEDUTY_SHARE_GO || '0.60');
  const ZERO_GO = parseInt(process.env.WIDEDUTY_ZERO_GO || '2', 10);
  const shareOk = a.dutyHeldShare != null && a.dutyHeldShare >= SHARE_GO;
  const zeroOk = a.zeroDutySeeds <= ZERO_GO;
  const survOk = a.medianSurvival != null && b.medianSurvival != null && a.medianSurvival >= 0.8 * b.medianSurvival;
  const starvOk = a.starvationDeaths <= b.starvationDeaths + 2;
  // G2 third clause, WIRED: any death-cause MODE with >= 2 deaths in the
  // after leg and 0 in the before leg is a new way to die.
  const newModes = [];
  for (const [m, n] of Object.entries(a.deathModes)) {
    if (n >= 2 && !(b.deathModes[m] || 0)) newModes.push({ mode: m, count: n });
  }
  const modeOk = newModes.length === 0;
  console.log(`G1 PRIMARY: dutyHeldShare=${(a.dutyHeldShare * 100).toFixed(1)}% (need >=${(SHARE_GO * 100).toFixed(0)}%, before ${(b.dutyHeldShare * 100).toFixed(1)}%) -> ${shareOk ? 'PASS' : 'FAIL'}; zeroDutySeeds=${a.zeroDutySeeds} (need <=${ZERO_GO}, before ${b.zeroDutySeeds}) -> ${zeroOk ? 'PASS' : 'FAIL'}; G1 ${shareOk && zeroOk ? 'PASS' : 'FAIL'}`);
  console.log(`G2 GUARDRAILS: medianSurvival ${a.medianSurvival} vs 0.8x before ${Math.round(0.8 * b.medianSurvival)} -> ${survOk ? 'PASS' : 'FAIL'}; starvation ${a.starvationDeaths} vs before+2 ${b.starvationDeaths + 2} -> ${starvOk ? 'PASS' : 'FAIL'}; newDeathModes>=2 ${newModes.length ? JSON.stringify(newModes) : 'none'} -> ${modeOk ? 'PASS' : 'FAIL'}; G2 ${survOk && starvOk && modeOk ? 'PASS' : 'FAIL'}`);
  console.log(`VERDICT: ${shareOk && zeroOk && survOk && starvOk && modeOk ? 'GO (G1+G2 pass; G3 panel + G4 proof judged separately)' : 'NO-GO'}`);
  process.exit(shareOk && zeroOk && survOk && starvOk && modeOk ? 0 : 1);
} else {
  console.error('USAGE: analyze-wideduty-a.js --leg <dir> | --before <dir> --after <dir>');
  process.exit(2);
}
