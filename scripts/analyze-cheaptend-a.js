#!/usr/bin/env node
// analyze-cheaptend-a.js — aggregate the cheaptend-a corpus: fever burden (B1),
// opportunity + gate pool + ability holdings (B2), production cost of fever (B3),
// guardrails (B4), NPC care (B5), forage cost (B6). Judges G2 (recorded vs bare
// fingerprints) and G3 (corpus validity, with the PRE-REGISTERED final-day
// revision: a missing final-day snapshot/flow is excused when the run ends
// mid-day — endReason village-lost / over-other — not only when a death is
// recorded that day). In comparison mode (second argv = baseline corpus dir)
// prints the BEFORE/AFTER replication table and the GO check against the
// prereg constants below.
// Reads per-seed JSONs from evidence/2026-11-07/cheaptend-a-corpus/
// cheaptend-a-<policy>-s*.json (+ cheaptend-a-bare-s*.json + sweep-<policy>.json).
// Pure analysis: reads only, prints a report, exits 0. Verdict logic lives here;
// the sweep never judges.
'use strict';
const fs = require('fs');
const path = require('path');

// ---- GO CHECK CONSTANTS (prereg sim-cheaptend-a-prereg.md sets these before the pilot sweep) ----
// Primary: 'sickdays' (sick-days per village-day) OR 'duration' (mean episode
// duration). The prereg picks ONE and pins the numbers below.
const GO = {
  PRIMARY: 'sickdays',        // PREREG-SET: 'sickdays' | 'duration'
  PRIMARY_MAXFRAC: 0.90,      // PREREG-SET: armed primary <= this x baseline
  STARVE_MAX: null,           // PREREG-SET: null = armed starvation deaths <= baseline count + 1
  SURV_MINFRAC: 0.80,         // armed median survival >= this x baseline median
  PERSEED_MAXREG: 1,          // max seeds regressing > PERSEED_REGDAYS vs own baseline
  PERSEED_REGDAYS: 30,
  ENGAGE_MIN_ACTS: 10,        // min tend/treat acts across the pilot
  ENGAGE_MIN_SHARE: 0.25,     // min share of ELIGIBLE sick-at-Haven days acted on (acts / eligibleDays)
  FORAGE_MINFRAC: 0.90,       // PREREG-SET: each stocked series >= this x baseline (foraged, fish, duty-all)
};

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'cheaptend-a-corpus');
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
  // B6 FORAGE COST (this arm): pooled stocked kcal from flowSeries.
  // 'Foraged food' + 'Fish catch' by name; duty-stocked all names = Σ over
  // every stocked name. Per-village-day rates alongside for interpretation.
  let stockedForaged = 0, stockedFish = 0, stockedAll = 0;
  for (const f of (s.flowSeries || [])) {
    for (const [nm, kcal] of Object.entries(f.stocked || {})) {
      stockedAll += kcal || 0;
      if (nm === 'Foraged food') stockedForaged += kcal || 0;
      if (nm === 'Fish catch') stockedFish += kcal || 0;
    }
  }
  // Gate pool (this arm): eligible days from the snapshot flags, and the
  // cross-check — acts must be 0 on days the trip was planned.
  const eligibleDaySet = new Set(days.filter(d => d.eligible === true).map(d => d.day));
  const rangingDaySet = new Set(days.filter(d => d.tripPlanned === true).map(d => d.day));
  let actsOnEligible = 0, actsOnRanging = 0, daysWithActs = 0;
  {
    const actDays = new Set();
    for (const e of (s.treatEvents || [])) {
      if (!['cured', 'eased', 'tended'].includes(e.outcome)) continue;
      actDays.add(e.day);
      if (eligibleDaySet.has(e.day)) actsOnEligible++;
      if (rangingDaySet.has(e.day)) actsOnRanging++;
    }
    daysWithActs = actDays.size;
  }
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
    eligibleDays: s.eligibleDays != null ? s.eligibleDays : eligibleDaySet.size,
    tripPlannedDays: rangingDaySet.size,
    actsOnEligible, actsOnRanging, daysWithActs,
    stockedForaged, stockedFish, stockedAll,
    endReason: s.endReason || null,
    feverProdNeed: fNeed ? fProd / fNeed : null,
    nonFeverProdNeed: nNeed ? nProd / nNeed : null,
    feverHealth: fN ? fHealth / fN : null,
    nonFeverHealth: nN ? nHealth / nN : null,
    national: !!s.national, table: !!s.table, win: !!s.win,
    waveReach: s.waveReach || [], finalPop: null };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => /^cheaptend-a-(competent|cheaptend-a)-s\d+\.json$/.test(f)).sort();
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
    eligibleDays: sum(stats.map(s => s.eligibleDays)),
    tripPlannedDays: sum(stats.map(s => s.tripPlannedDays)),
    actsOnEligible: sum(stats.map(s => s.actsOnEligible)),
    actsOnRanging: sum(stats.map(s => s.actsOnRanging)),
    daysWithActs: sum(stats.map(s => s.daysWithActs)),
    stockedForaged: sum(stats.map(s => s.stockedForaged)),
    stockedFish: sum(stats.map(s => s.stockedFish)),
    stockedAll: sum(stats.map(s => s.stockedAll)),
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
  console.log('B2b GATE POOL (this arm): eligible days (sick + at Haven + no trip planned)=' + P.eligibleDays +
    ' | trip-planned days=' + P.tripPlannedDays +
    ' | acts on eligible days=' + P.actsOnEligible + ' | acts on ranging days=' + P.actsOnRanging +
    ' (cross-check: must be 0)' + ' | days with acts=' + P.daysWithActs);
  console.log('  per-seed eligible days: ' + C.stats.map(s => 's' + s.seed + '=' + s.eligibleDays).join(' '));
  console.log('  per-seed acts: ' + C.stats.map(s => 's' + s.seed + '=' + s.acts).join(' '));
  console.log('B6 FORAGE COST (this arm — pooled stocked kcal from flowSeries):' +
    ' Foraged food=' + fmt(P.stockedForaged) + ' Fish catch=' + fmt(P.stockedFish) +
    ' duty-stocked all names=' + fmt(P.stockedAll));
  console.log('  per-village-day: foraged=' + fmt(P.villageDays ? P.stockedForaged / P.villageDays : null) +
    ' fish=' + fmt(P.villageDays ? P.stockedFish / P.villageDays : null) +
    ' duty-all=' + fmt(P.villageDays ? P.stockedAll / P.villageDays : null));
  console.log('  per-seed foraged: ' + C.stats.map(s => 's' + s.seed + '=' + fmt(s.stockedForaged)).join(' '));
  console.log('  per-seed fish: ' + C.stats.map(s => 's' + s.seed + '=' + fmt(s.stockedFish)).join(' '));
  console.log('  per-seed duty-all: ' + C.stats.map(s => 's' + s.seed + '=' + fmt(s.stockedAll)).join(' '));
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
  let ok = true, okRevised = true;
  const notes = [], notesRevised = [];
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
    let flowOk = true, flowOkRevised = true;
    const missingFlow = [];
    for (let d = 1; d <= s.daysAlive; d++) if (!flowDays.has(d)) { flowOk = false; missingFlow.push(d); }
    // G3 FINAL-DAY REVISION (PRE-REGISTERED in sim-cheaptend-a-prereg.md,
    // adopted from the tendsick metric review before any sims): a flow row
    // cannot exist for a day the village dies before any flow event
    // happens (no meals, no assignments resolved — the death itself is
    // the day's only event, and it IS recorded in deathRows). The LETTER
    // rule allows a missing flow row ONLY on the final day when a death
    // is recorded that day. The REVISED rule ALSO excuses the final
    // day's missing flow row when the run ends mid-day — endReason
    // 'village-lost' OR 'over-other' (the harness's game-over value;
    // runDays returns 'village-lost' / 'over-other' / 'survived' —
    // there is no literal 'game over' value) — not only when a death is
    // recorded that day. A 'survived' end (150d cap) excuses nothing.
    // Any other missing day still fails. Both verdicts are printed: the
    // letter (pre-registered) and the revised (binding corpus check).
    const midDayEnd = ['village-lost', 'over-other'].includes(s.endReason);
    const deathOnFinal = (s.deathRows || []).some(d => d.day === s.daysAlive);
    if (!flowOk && missingFlow.length === 1 && missingFlow[0] === s.daysAlive &&
        (deathOnFinal || midDayEnd)) flowOkRevised = true;
    else if (!flowOk) flowOkRevised = false;
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
    if (!dayOk || !flowOkRevised || new Set(keys).size !== keys.length || !Array.isArray(s.deathRows) || !onsetOk) {
      okRevised = false;
      notesRevised.push('s' + s.seed + ': endReason=' + (s.endReason || '?') +
        (flowOkRevised ? '' : ' flow missing days ' + missingFlow.join(',')));
    }
  }
  const bareFiles = fs.readdirSync(C.dir).filter(f => /^cheaptend-a-bare-s\d+\.json$/.test(f)).sort();
  if (bareFiles.length !== C.seeds.length) {
    ok = false; okRevised = false;
    notes.push('bare fingerprints: ' + bareFiles.length + '/' + C.seeds.length + ' present');
    notesRevised.push('bare fingerprints: ' + bareFiles.length + '/' + C.seeds.length + ' present');
  }
  return { ok, notes, okRevised, notesRevised, bareFiles };
}

function checkG2(C) {
  const policy = (C.seeds[0] || {}).policy || 'competent';
  const summPath = path.join(C.dir, 'sweep-' + policy + '.json');
  if (!fs.existsSync(summPath)) return 'NOT CHECKED (no sweep-' + policy + '.json summary found)';
  try {
    const summ = JSON.parse(fs.readFileSync(summPath, 'utf8'));
    const mism = [];
    for (const row of (summ.rows || [])) {
      const bf = path.join(C.dir, `cheaptend-a-bare-s${row.seed}.json`);
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
  const P = printCorpus('sim-cheaptend-a ' + ((C.seeds[0] || {}).policy || ''), C);
  const g3 = checkG3(C);
  console.log('G3 CORPUS (letter, as pre-registered): ' + (g3.ok ? 'PASS — all legs valid (' + C.seeds.length + ' recorded + ' + g3.bareFiles.length + ' bare)' : 'FAIL — ' + g3.notes.join('; ')));
  console.log('G3 CORPUS (revised, final-day excused on death-day OR mid-day end village-lost/over-other): ' + (g3.okRevised ? 'PASS' : 'FAIL — ' + g3.notesRevised.join('; ')));
  console.log('G2 NEUTRALITY: ' + checkG2(C));
  console.log('');
  console.log('CORPUS VERDICT: ' + (g3.okRevised ? 'COMPLETE — B1–B6 answered above (G3 letter-miss, if any, recorded in the metric review)' : 'INCOMPLETE — G3 failed, see notes'));
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
    ' (GO: <= ' + (GO.STARVE_MAX == null ? PB.starveDeaths + 1 : GO.STARVE_MAX) + ' = baseline+1)' +
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
  console.log('  empty-pantry days: baseline=' + PB.emptyPantryDays + ' armed=' + P.emptyPantryDays);
  const fr = (a, b) => (b ? a / b : null);
  const fForaged = fr(P.stockedForaged, PB.stockedForaged);
  const fFish = fr(P.stockedFish, PB.stockedFish);
  const fDuty = fr(P.stockedAll, PB.stockedAll);
  console.log('FORAGE COST (GO: each >= ' + GO.FORAGE_MINFRAC + 'x baseline):');
  console.log('  Foraged food: baseline=' + fmt(PB.stockedForaged) + ' armed=' + fmt(P.stockedForaged) +
    ' ratio=' + (fForaged == null ? 'n/a' : fForaged.toFixed(3)) +
    ' (' + fmt(PB.villageDays ? PB.stockedForaged / PB.villageDays : null) + ' -> ' +
    fmt(P.villageDays ? P.stockedForaged / P.villageDays : null) + ' kcal/village-day)');
  console.log('  Fish catch: baseline=' + fmt(PB.stockedFish) + ' armed=' + fmt(P.stockedFish) +
    ' ratio=' + (fFish == null ? 'n/a' : fFish.toFixed(3)) +
    ' (' + fmt(PB.villageDays ? PB.stockedFish / PB.villageDays : null) + ' -> ' +
    fmt(P.villageDays ? P.stockedFish / P.villageDays : null) + ' kcal/village-day)');
  console.log('  Duty-stocked all names: baseline=' + fmt(PB.stockedAll) + ' armed=' + fmt(P.stockedAll) +
    ' ratio=' + (fDuty == null ? 'n/a' : fDuty.toFixed(3)) +
    ' (' + fmt(PB.villageDays ? PB.stockedAll / PB.villageDays : null) + ' -> ' +
    fmt(P.villageDays ? P.stockedAll / P.villageDays : null) + ' kcal/village-day)');
  const engageShare = P.eligibleDays ? P.acts / P.eligibleDays : null;
  const engageShareAll = P.opportunityDays ? P.acts / P.opportunityDays : null;
  console.log('ENGAGEMENT: acts=' + P.acts + ' (GO: >= ' + GO.ENGAGE_MIN_ACTS + ')' +
    ' | share of ELIGIBLE sick-at-Haven days=' + (engageShare == null ? 'n/a' : pct(P.acts, P.eligibleDays)) +
    ' (GO: >= ' + pct(GO.ENGAGE_MIN_SHARE, 1) + ')' +
    ' | eligible days=' + P.eligibleDays + ' (baseline eligible=' + PB.eligibleDays + ')' +
    ' | share of ALL sick-at-Haven days (tendsick denominator, for comparability)=' +
    (engageShareAll == null ? 'n/a' : pct(P.acts, P.opportunityDays)) +
    ' | acts on ranging days=' + P.actsOnRanging + ' (gate cross-check: must be 0)' +
    ' | days with acts=' + P.daysWithActs);
  const primPass = primRatio != null && primRatio <= GO.PRIMARY_MAXFRAC;
  const starveMax = GO.STARVE_MAX == null ? PB.starveDeaths + 1 : GO.STARVE_MAX;
  const starvePass = P.starveDeaths <= starveMax;
  const survPass = P.medianSurvival != null && PB.medianSurvival != null && P.medianSurvival >= GO.SURV_MINFRAC * PB.medianSurvival;
  const perSeedPass = regCount <= GO.PERSEED_MAXREG;
  const engagePass = P.acts >= GO.ENGAGE_MIN_ACTS && engageShare != null && engageShare >= GO.ENGAGE_MIN_SHARE;
  const foragePass = fForaged != null && fForaged >= GO.FORAGE_MINFRAC &&
    fFish != null && fFish >= GO.FORAGE_MINFRAC &&
    fDuty != null && fDuty >= GO.FORAGE_MINFRAC;
  const gatePass = P.actsOnRanging === 0;
  console.log('');
  console.log('GO CHECK: primary ' + (primPass ? 'PASS' : 'FAIL') +
    ' | starvation ' + (starvePass ? 'PASS' : 'FAIL') +
    ' | survival ' + (survPass ? 'PASS' : 'FAIL') +
    ' | per-seed ' + (perSeedPass ? 'PASS' : 'FAIL') +
    ' | engagement ' + (engagePass ? 'PASS' : 'FAIL') +
    ' | forage-cost ' + (foragePass ? 'PASS' : 'FAIL') +
    ' | gate-crosscheck ' + (gatePass ? 'PASS' : 'FAIL') + ' (acts on ranging days = 0)');
  console.log('PILOT VERDICT: ' + ((primPass && starvePass && survPass && perSeedPass && engagePass && foragePass && gatePass) ? 'GO' : 'NO-GO') +
    ' (a miss is NO-GO, never re-scored)');
}

if (require.main === module) main();
module.exports = { buildEpisodes, seedStats, pooled, loadCorpus, GO };
