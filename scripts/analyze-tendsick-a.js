#!/usr/bin/env node
// analyze-tendsick-a.js — aggregate the tendsick-a corpus: fever burden (B1),
// opportunity + ability holdings (B2), production cost of fever (B3), guardrails
// (B4), NPC care (B5). Judges G2 (recorded vs bare fingerprints) and G3 (corpus
// validity, CORRECTED per the prodcollapse metric review). In comparison mode
// (second argv = baseline corpus dir) prints the BEFORE/AFTER replication table
// and the GO check against the Phase-B amendment constants below.
// Reads per-seed JSONs from evidence/2026-11-07/tendsick-a-corpus/
// tendsick-a-<policy>-s*.json (+ tendsick-a-bare-s*.json + sweep-<policy>.json).
// Pure analysis: reads only, prints a report, exits 0. Verdict logic lives here;
// the sweep never judges.
'use strict';
const fs = require('fs');
const path = require('path');

// ---- GO CHECK CONSTANTS (Phase-B amendment sets these before the pilot sweep) ----
// Primary: 'sickdays' (sick-days per village-day) OR 'duration' (mean episode
// duration). The amendment picks ONE and pins the numbers below.
const GO = {
  PRIMARY: 'sickdays',        // AMENDMENT-SET: 'sickdays' | 'duration'
  PRIMARY_MAXFRAC: 0.90,      // AMENDMENT-SET: armed primary <= this x baseline
  STARVE_MAX: null,           // null = armed starvation deaths <= baseline count
  SURV_MINFRAC: 0.80,         // armed median survival >= this x baseline median
  PERSEED_MAXREG: 1,          // max seeds regressing > PERSEED_REGDAYS vs own baseline
  PERSEED_REGDAYS: 30,
  ENGAGE_MIN_ACTS: 10,        // min tend/treat acts across the pilot
  ENGAGE_MIN_SHARE: 0.25,     // min share of sick-at-Haven days acted on
};

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'tendsick-a-corpus');
const BASE_DIR = process.argv[3] || null;

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');
const r1 = (n) => (n == null ? 'n/a' : (Math.round(n * 10) / 10));
const r3 = (n) => (n == null ? 'n/a' : (Math.round(n * 1000) / 1000));
const SICK_CAUSES = new Set(['sickness', 'disease', 'wound_fever', 'gutrot']);

// ---- episodes: join onsets to ends by vid (prereg definition) ----
function buildEpisodes(s) {
  const ends = (s.sickEnds || []).slice().sort((a, b) => a.day - b.day || 0);
  const used = new Set();
  const deathsByVid = {};
  for (const d of (s.deathRows || [])) {
    (deathsByVid[d.who] = deathsByVid[d.who] || []).push(d.day);
  }
  const eps = [];
  for (const o of (s.sickOnsets || [])) {
    let end = null, endIdx = -1;
    for (let i = 0; i < ends.length; i++) {
      if (used.has(i)) continue;
      if (ends[i].vid === o.vid && ends[i].day >= o.day) { end = ends[i]; endIdx = i; break; }
    }
    if (end) {
      used.add(endIdx);
      eps.push({ vid: o.vid, name: o.name, source: o.source, onsetDay: o.day,
        endDay: end.day, duration: end.day - o.day, outcome: end.outcome, via: end.via });
    } else {
      const deathDays = (deathsByVid[o.vid] || []).filter(d => d >= o.day);
      if (deathDays.length) {
        eps.push({ vid: o.vid, name: o.name, source: o.source, onsetDay: o.day,
          endDay: deathDays[0], duration: deathDays[0] - o.day, outcome: 'died', via: 'other-cause' });
      } else {
        eps.push({ vid: o.vid, name: o.name, source: o.source, onsetDay: o.day,
          endDay: null, duration: null, outcome: 'open', via: null });
      }
    }
  }
  return eps;
}

// ---- per-seed aggregates ----
function seedStats(s) {
  const days = s.daySeries || [];
  const sickDays = sum(days.map(d => d.sickCount || 0));
  const villageDays = sum(days.map(d => d.pop || 0));
  const eps = buildEpisodes(s);
  const closed = eps.filter(e => e.outcome !== 'open');
  const durations = closed.map(e => e.duration).filter(d => d != null);
  const vids = new Set(eps.map(e => e.vid));
  let starveDeaths = 0, sickDeaths = 0;
  const deathCauses = {};
  for (const d of (s.deathRows || [])) {
    deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
    if (!d.isPlayer && d.cause === 'starvation') starveDeaths++;
    if (!d.isPlayer && SICK_CAUSES.has(d.cause)) sickDeaths++;
  }
  const emptyPantryDays = days.filter(d => d.pantryKcal === 0).length;
  // Ability holdings: days with each healing ability held / at L2+.
  const holdDays = { herbal_remedy: 0, field_medicine: 0, triage: 0 };
  const holdL2Days = { herbal_remedy: 0, field_medicine: 0, triage: 0 };
  for (const d of days) {
    const ab = d.scholarAbilities || {};
    for (const id of Object.keys(holdDays)) {
      if (ab[id] && ab[id].held) {
        holdDays[id]++;
        if ((ab[id].level || 0) >= 2) holdL2Days[id]++;
      }
    }
  }
  // Treat/tend events by kind + outcome.
  const treatBy = {};
  for (const e of (s.treatEvents || [])) {
    const k = e.kind + ':' + e.outcome;
    treatBy[k] = (treatBy[k] || 0) + 1;
  }
  const cures = (s.treatEvents || []).filter(e => e.outcome === 'cured').length;
  const acts = (s.treatEvents || []).filter(e => ['cured', 'eased', 'tended'].includes(e.outcome)).length;
  // B3: fever days vs non-fever days (meal rows carry produced/need/healthFrac).
  const feverDaySet = new Set(days.filter(d => (d.sickCount || 0) > 0).map(d => d.day));
  let fProd = 0, fNeed = 0, fHealth = 0, fN = 0, nProd = 0, nNeed = 0, nHealth = 0, nN = 0;
  for (const r of (s.mealRows || [])) {
    if (r.produced == null || r.needEst == null) continue;
    if (feverDaySet.has(r.day)) { fProd += r.produced; fNeed += r.needEst; if (r.healthFrac != null) { fHealth += r.healthFrac; fN++; } }
    else { nProd += r.produced; nNeed += r.needEst; if (r.healthFrac != null) { nHealth += r.healthFrac; nN++; } }
  }
  return { seed: s.seed, daysAlive: s.daysAlive, sickDays, villageDays,
    sickDaysPerVillageDay: villageDays ? sickDays / villageDays : null,
    episodes: eps, episodeCount: eps.length, closedCount: closed.length,
    openCount: eps.length - closed.length,
    meanDuration: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
    distinctVids: vids.size, sickDeaths, starveDeaths, deathCauses,
    emptyPantryDays, holdDays, holdL2Days, treatBy, cures, acts,
    npcTends: (s.npcTends || []).length,
    opportunityDays: s.opportunityDays || 0,
    feverProdNeed: fNeed ? fProd / fNeed : null,
    nonFeverProdNeed: nNeed ? nProd / nNeed : null,
    feverHealth: fN ? fHealth / fN : null,
    nonFeverHealth: nN ? nHealth / nN : null,
    national: !!s.national, table: !!s.table, win: !!s.win,
    waveReach: s.waveReach || [], finalPop: null };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => /^tendsick-a-(competent|tendsick)-s\d+\.json$/.test(f)).sort();
  if (!files.length) { console.error('no per-seed files in ' + dir); process.exit(2); }
  const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return { dir, files, seeds, stats: seeds.map(seedStats) };
}

function pooled(stats) {
  const P = {
    seeds: stats.length,
    sickDays: sum(stats.map(s => s.sickDays)),
    villageDays: sum(stats.map(s => s.villageDays)),
    episodes: sum(stats.map(s => s.episodeCount)),
    closed: sum(stats.map(s => s.closedCount)),
    open: sum(stats.map(s => s.openCount)),
    distinctVids: sum(stats.map(s => s.distinctVids)),
    sickDeaths: sum(stats.map(s => s.sickDeaths)),
    starveDeaths: sum(stats.map(s => s.starveDeaths)),
    emptyPantryDays: sum(stats.map(s => s.emptyPantryDays)),
    acts: sum(stats.map(s => s.acts)),
    cures: sum(stats.map(s => s.cures)),
    npcTends: sum(stats.map(s => s.npcTends)),
    opportunityDays: sum(stats.map(s => s.opportunityDays)),
    national: sum(stats.map(s => s.national ? 1 : 0)),
    table: sum(stats.map(s => s.table ? 1 : 0)),
    wins: sum(stats.map(s => s.win ? 1 : 0)),
    daysAlive: stats.map(s => s.daysAlive),
    deathCauses: {},
    treatBy: {},
    holdDays: { herbal_remedy: 0, field_medicine: 0, triage: 0 },
    holdL2Days: { herbal_remedy: 0, field_medicine: 0, triage: 0 },
    waveReach: {},
  };
  P.sickDaysPerVillageDay = P.villageDays ? P.sickDays / P.villageDays : null;
  const durs = [];
  for (const s of stats) for (const e of s.episodes) if (e.duration != null) durs.push(e.duration);
  P.meanDuration = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null;
  P.medianSurvival = med(P.daysAlive);
  for (const s of stats) {
    for (const [k, v] of Object.entries(s.deathCauses)) P.deathCauses[k] = (P.deathCauses[k] || 0) + v;
    for (const [k, v] of Object.entries(s.treatBy)) P.treatBy[k] = (P.treatBy[k] || 0) + v;
    for (const id of Object.keys(P.holdDays)) { P.holdDays[id] += s.holdDays[id]; P.holdL2Days[id] += s.holdL2Days[id]; }
    for (const w of s.waveReach) P.waveReach[w] = (P.waveReach[w] || 0) + 1;
  }
  // B3 pooled: fever vs non-fever produced/need + healthFrac (recomputed from raw).
  return P;
}

function printCorpus(label, C) {
  const P = pooled(C.stats);
  console.log('=== ' + label + ' (seeds ' + C.seeds.map(s => s.seed).join(',') + ', ' + (C.seeds[0] || {}).policy + ', 150d) ===');
  console.log('');
  console.log('B1 FEVER BURDEN: sick-days=' + fmt(P.sickDays) + ' village-days=' + fmt(P.villageDays) +
    ' sick-days/village-day=' + r3(P.sickDaysPerVillageDay) +
    ' mean episode duration=' + r1(P.meanDuration) + 'd' +
    ' episodes=' + P.episodes + ' (closed ' + P.closed + ', open ' + P.open + ')' +
    ' villagers affected=' + P.distinctVids + ' sickness deaths=' + P.sickDeaths);
  console.log('  per-seed sick-days/village-day: ' + C.stats.map(s => 's' + s.seed + '=' + r3(s.sickDaysPerVillageDay)).join(' '));
  console.log('  per-seed mean duration: ' + C.stats.map(s => 's' + s.seed + '=' + r1(s.meanDuration)).join(' '));
  console.log('  per-seed episodes: ' + C.stats.map(s => 's' + s.seed + '=' + s.episodeCount).join(' '));
  console.log('B2 OPPORTUNITY: sick-at-Haven days (layer could fire)=' + P.opportunityDays +
    ' treat/tend acts=' + P.acts + ' (cures ' + P.cures + ')' +
    ' treatEvents by kind:outcome=' + JSON.stringify(P.treatBy));
  console.log('  scholar healing-ability holdings (days held / at L2+): ' +
    Object.keys(P.holdDays).map(id => id + ' ' + P.holdDays[id] + '/' + P.holdL2Days[id]).join(', '));
  console.log('B3 PRODUCTION COST: (per-seed fever vs non-fever produced/need + mean healthFrac)');
  for (const s of C.stats) {
    console.log('  s' + s.seed + ': fever prod/need=' + r3(s.feverProdNeed) + ' health=' + r3(s.feverHealth) +
      ' | non-fever prod/need=' + r3(s.nonFeverProdNeed) + ' health=' + r3(s.nonFeverHealth));
  }
  console.log('B4 GUARDRAILS: starvation deaths (villager)=' + P.starveDeaths +
    ' median survival=' + P.medianSurvival + 'd max=' + Math.max(...P.daysAlive) + 'd' +
    ' empty-pantry days=' + P.emptyPantryDays +
    ' death causes=' + JSON.stringify(P.deathCauses));
  console.log('  per-seed survival: ' + C.stats.map(s => 's' + s.seed + '=' + s.daysAlive + 'd').join(' '));
  console.log('  per-seed starvation: ' + C.stats.map(s => 's' + s.seed + '=' + s.starveDeaths).join(' '));
  console.log('WALL: national=' + P.national + '/' + P.seeds + ' table=' + P.table +
    ' wins=' + P.wins + ' waveReach=' + JSON.stringify(P.waveReach));
  console.log('B5 NPC CARE: villagerCareTick tends=' + P.npcTends +
    ' (' + r1(P.episodes ? P.npcTends / P.episodes : null) + ' per episode)');
  console.log('');
  return P;
}

function checkG3(C) {
  let ok = true;
  const notes = [];
  for (const s of C.seeds) {
    const days = s.daySeries || [], flows = s.flowSeries || [], meals = s.mealRows || [];
    const keys = meals.map(r => r.vid + '|' + r.day);
    const dayOk = days.length === s.daysAlive || days.length === s.daysAlive - 1;
    const missing = [];
    if (days.length === s.daysAlive - 1) {
      const have = new Set(days.map(d => d.day));
      for (let d = 1; d <= s.daysAlive; d++) if (!have.has(d)) missing.push(d);
    }
    const flowDays = new Set(flows.map(f => f.day));
    let flowOk = true;
    for (let d = 1; d <= s.daysAlive; d++) if (!flowDays.has(d)) { flowOk = false; break; }
    const eps = buildEpisodes(s);
    const openEps = eps.filter(e => e.outcome === 'open');
    const snapDays = new Set(days.map(d => d.day));
    let onsetOk = true;
    for (const o of (s.sickOnsets || [])) {
      const seenLater = [...snapDays].some(d => d >= o.day);
      const sameDayEnd = eps.some(e => e.onsetDay === o.day && e.endDay != null && e.endDay <= o.day + 1);
      if (!seenLater && !sameDayEnd) { onsetOk = false; break; }
    }
    if (!dayOk || !flowOk || new Set(keys).size !== keys.length || !Array.isArray(s.deathRows) || !onsetOk) {
      ok = false;
      notes.push('s' + s.seed + ': daySeries=' + days.length + ' daysAlive=' + s.daysAlive +
        (missing.length ? ' (missing day ' + missing.join(',') + ')' : '') +
        ' flowsCover=' + flowOk + ' mealRows=' + meals.length +
        ' deduped=' + (new Set(keys).size === keys.length) +
        ' openEpisodes=' + openEps.length + ' onsetInSnapshot=' + onsetOk);
    }
  }
  const bareFiles = fs.readdirSync(C.dir).filter(f => /^tendsick-a-bare-s\d+\.json$/.test(f)).sort();
  if (bareFiles.length !== C.seeds.length) { ok = false; notes.push('bare fingerprints: ' + bareFiles.length + '/' + C.seeds.length + ' present'); }
  return { ok, notes, bareFiles };
}

function checkG2(C) {
  const policy = (C.seeds[0] || {}).policy || 'competent';
  const summPath = path.join(C.dir, 'sweep-' + policy + '.json');
  if (!fs.existsSync(summPath)) return 'NOT CHECKED (no sweep-' + policy + '.json summary found)';
  try {
    const summ = JSON.parse(fs.readFileSync(summPath, 'utf8'));
    const mism = [];
    for (const row of (summ.rows || [])) {
      const bf = path.join(C.dir, `tendsick-a-bare-s${row.seed}.json`);
      if (!fs.existsSync(bf)) { mism.push('s' + row.seed + ': bare file missing'); continue; }
      const bareFp = JSON.parse(fs.readFileSync(bf, 'utf8'));
      const recFp = row.fingerprint;
      if (JSON.stringify(bareFp) !== JSON.stringify(recFp)) {
        const diffs = [];
        for (const k of Object.keys(bareFp)) {
          if (JSON.stringify(bareFp[k]) !== JSON.stringify(recFp ? recFp[k] : undefined)) diffs.push(k);
        }
        mism.push('s' + row.seed + ': fingerprint differs on ' + (diffs.join(', ') || 'unknown'));
      }
    }
    return mism.length ? 'FAIL — ' + mism.join('; ') : 'PASS — recorded == bare on all ' + C.seeds.length + ' seeds';
  } catch (e) { return 'ERROR — ' + e.message; }
}

function main() {
  const C = loadCorpus(DIR);
  const P = printCorpus('sim-tendsick-a ' + ((C.seeds[0] || {}).policy || ''), C);
  const g3 = checkG3(C);
  console.log('G3 CORPUS: ' + (g3.ok ? 'PASS — all legs valid (' + C.seeds.length + ' recorded + ' + g3.bareFiles.length + ' bare)' : 'FAIL — ' + g3.notes.join('; ')));
  console.log('G2 NEUTRALITY: ' + checkG2(C));
  console.log('');
  console.log('BASELINE VERDICT: ' + (g3.ok ? 'COMPLETE — B1–B5 answered above' : 'INCOMPLETE — G3 failed, see notes'));
  if (!BASE_DIR) return;
  // ---- comparison mode: armed (DIR) vs baseline (BASE_DIR) ----
  const B = loadCorpus(BASE_DIR);
  const PB = pooled(B.stats);
  console.log('=== BEFORE/AFTER (baseline ' + B.seeds.map(s => s.seed).join(',') + ' vs armed ' + C.seeds.map(s => s.seed).join(',') + ') ===');
  console.log('');
  const primaryKey = GO.PRIMARY === 'duration' ? 'meanDuration' : 'sickDaysPerVillageDay';
  const primBase = PB[primaryKey], primArmed = P[primaryKey];
  const primRatio = (primBase && primArmed != null) ? primArmed / primBase : null;
  console.log('PRIMARY (' + GO.PRIMARY + '): baseline=' + r3(primBase) + ' armed=' + r3(primArmed) +
    ' ratio=' + (primRatio == null ? 'n/a' : primRatio.toFixed(3)) + ' (GO: <= ' + GO.PRIMARY_MAXFRAC + 'x)');
  console.log('  sick-days/village-day: baseline=' + r3(PB.sickDaysPerVillageDay) + ' armed=' + r3(P.sickDaysPerVillageDay));
  console.log('  mean episode duration: baseline=' + r1(PB.meanDuration) + 'd armed=' + r1(P.meanDuration) + 'd');
  console.log('  episodes: baseline=' + PB.episodes + ' armed=' + P.episodes +
    ' | sickness deaths: baseline=' + PB.sickDeaths + ' armed=' + P.sickDeaths +
    ' | cures: baseline=' + PB.cures + ' armed=' + P.cures);
  console.log('GUARDS: starvation deaths baseline=' + PB.starveDeaths + ' armed=' + P.starveDeaths +
    ' (GO: <= ' + (GO.STARVE_MAX == null ? PB.starveDeaths : GO.STARVE_MAX) + ')' +
    ' | median survival baseline=' + PB.medianSurvival + 'd armed=' + P.medianSurvival + 'd' +
    ' (GO: >= ' + GO.SURV_MINFRAC + 'x = ' + r1(PB.medianSurvival * GO.SURV_MINFRAC) + 'd)');
  let regCount = 0;
  const regNotes = [];
  for (const bs of B.stats) {
    const as = C.stats.find(x => x.seed === bs.seed);
    if (!as) continue;
    const reg = bs.daysAlive - as.daysAlive;
    if (reg > GO.PERSEED_REGDAYS) { regCount++; regNotes.push('s' + bs.seed + ' -' + reg + 'd'); }
  }
  console.log('  per-seed survival regressions >' + GO.PERSEED_REGDAYS + 'd: ' + regCount +
    ' (GO: <= ' + GO.PERSEED_MAXREG + ')' + (regNotes.length ? ' [' + regNotes.join(', ') + ']' : ''));
  console.log('  empty-pantry days: baseline=' + PB.emptyPantryDays + ' armed=' + P.emptyPantryDays +
    ' | forage cost: stocked Foraged-food kcal baseline vs armed (see evidence table)');
  const engageShare = P.opportunityDays ? P.acts / P.opportunityDays : null;
  console.log('ENGAGEMENT: acts=' + P.acts + ' (GO: >= ' + GO.ENGAGE_MIN_ACTS + ')' +
    ' | share of sick-at-Haven days acted on=' + (engageShare == null ? 'n/a' : pct(P.acts, P.opportunityDays)) +
    ' (GO: >= ' + pct(GO.ENGAGE_MIN_SHARE, 1) + ')' +
    ' | opportunity days=' + P.opportunityDays);
  const primPass = primRatio != null && primRatio <= GO.PRIMARY_MAXFRAC;
  const starveMax = GO.STARVE_MAX == null ? PB.starveDeaths : GO.STARVE_MAX;
  const starvePass = P.starveDeaths <= starveMax;
  const survPass = P.medianSurvival != null && PB.medianSurvival != null && P.medianSurvival >= GO.SURV_MINFRAC * PB.medianSurvival;
  const perSeedPass = regCount <= GO.PERSEED_MAXREG;
  const engagePass = P.acts >= GO.ENGAGE_MIN_ACTS && engageShare != null && engageShare >= GO.ENGAGE_MIN_SHARE;
  console.log('');
  console.log('GO CHECK: primary ' + (primPass ? 'PASS' : 'FAIL') +
    ' | starvation ' + (starvePass ? 'PASS' : 'FAIL') +
    ' | survival ' + (survPass ? 'PASS' : 'FAIL') +
    ' | per-seed ' + (perSeedPass ? 'PASS' : 'FAIL') +
    ' | engagement ' + (engagePass ? 'PASS' : 'FAIL'));
  console.log('PILOT VERDICT: ' + ((primPass && starvePass && survPass && perSeedPass && engagePass) ? 'GO' : 'NO-GO') +
    ' (a miss is NO-GO, never re-scored)');
}

if (require.main === module) main();
module.exports = { buildEpisodes, seedStats, pooled, loadCorpus, GO };
