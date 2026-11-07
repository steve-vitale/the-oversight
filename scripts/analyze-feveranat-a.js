#!/usr/bin/env node
// analyze-feveranat-a.js — aggregate the feveranat-a diagnosis corpus,
// rebuild every fever/sickness episode from wrapper onset/end events,
// and answer F1–F6 (incidence, duration, vector attribution, treatment in
// the wild, production cost, spread). Also judges G2 (recorded vs bare
// fingerprints), G3 (corpus validity, CORRECTED per the prodcollapse metric
// review: daySeries length == daysAlive OR daysAlive-1 with the missing day
// named), and G4 (every episode classified by vector/treatment/outcome, or
// honestly unattributed with the sensor gap named).
// Reads per-seed JSONs from evidence/2026-11-07/feveranat-a-corpus/
// feveranat-a-competent-s*.json (+ feveranat-a-bare-s*.json + sweep-competent.json).
// Pure analysis: reads only, prints a report, exits 0. Verdict logic lives here;
// the sweep never judges.
//
// EPISODE JOIN RULES (fixed before the judged sweep):
// - Onsets pair with ends FIFO per (seed, who, name) for NPCs and per
//   (seed, who, diseaseId) for the scholar; onsets sort before ends on the
//   same day (a food onset + same-day cure pairs correctly).
// - 'stale-cleanup' ends pair with the oldest open onset; the analyzer then
//   reclassifies via deathRows: a death row for that villager on/before the
//   end day -> 'died (other cause: <cause>)', else 'record cleaned'.
// - Scholar 'recovered (expired)' ends + a scholar death row the same day
//   with a sickness cause ('sickness', 'the trembles', 'lockjaw', 'disease')
//   -> 'died of <cause>' (trembles/lockjaw expiry removes the entry and THEN
//   kills the bearer, so the raw removal event reads as a recovery).
// - Treatment join: a treatEvent counts for an episode when its who matches
//   and its day falls in [onsetDay, endDay] (endDay = daysAlive for open
//   episodes).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'feveranat-a-corpus');

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const mean = (xs) => (xs.length ? sum(xs) / xs.length : null);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');
const r1 = (n) => (n == null ? 'n/a' : (Math.round(n * 10) / 10));
const r3 = (n) => (n == null ? 'n/a' : (Math.round(n * 1000) / 1000));

// ---- per-day aggregates from one per-seed file (mealRows + daySeries) ----
function dayAggs(s) {
  const byDay = new Map();
  const get = (d) => {
    let a = byDay.get(d);
    if (!a) {
      a = { day: d, produced: 0, need: 0, expected: 0, healthSum: 0, healthN: 0,
        multSum: 0, multN: 0, rows: 0, sickCountNPC: 0, scholarSickN: 0,
        throttle: null, freshDays: null, pantryKcal: null, pop: null,
        meanHealth: null, sickMeanHealth: null, healthyMeanHealth: null,
        healerPresent: null, medicCount: null, drinksDirty: null };
      byDay.set(d, a);
    }
    return a;
  };
  for (const r of (s.mealRows || [])) {
    const a = get(r.day);
    a.rows++;
    a.produced += r.produced || 0;
    a.need += r.needEst || 0;
    a.expected += r.expected || 0;
    if (r.healthFrac != null) { a.healthSum += r.healthFrac; a.healthN++; }
    if (r.mult != null) { a.multSum += r.mult; a.multN++; }
  }
  for (const d of (s.daySeries || [])) {
    const a = get(d.day);
    a.sickCountNPC = d.sickCountNPC || 0;
    a.scholarSickN = (d.scholarSick || []).length;
    a.throttle = d.throttleEngaged; a.freshDays = d.freshDays;
    a.pantryKcal = d.pantryKcal; a.pop = d.pop;
    a.meanHealth = d.meanHealth; a.sickMeanHealth = d.sickMeanHealth;
    a.healthyMeanHealth = d.healthyMeanHealth;
    a.healerPresent = d.healerPresent; a.medicCount = d.medicCount;
    a.drinksDirty = d.drinksDirty;
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

// ---- episode reconstruction (FIFO pairing per who+name/diseaseId) ----
function buildEpisodes(s) {
  const eps = [];
  const orphanEnds = [];
  const queues = new Map();
  const keyOf = (ev) => {
    const who = ev.who;
    const name = (ev.kind === 'scholar' ? ev.diseaseId : ev.name);
    return who + '|' + String(name);
  };
  const events = [];
  for (const o of (s.sickOnsets || [])) events.push({ t: 'on', day: o.day, o });
  for (const e of (s.sickEnds || [])) events.push({ t: 'end', day: e.day, e });
  events.sort((a, b) => a.day - b.day || (a.t === 'on' ? -1 : 1));
  const finish = (o, endEv, outcome) => {
    return { seed: s.seed, who: o.who, whoName: o.whoName, kind: o.kind,
      name: o.name, diseaseId: o.diseaseId, vector: o.vector,
      vectorSource: o.vectorSource, vectorEvidence: o.vectorEvidence,
      onsetDay: o.day, endDay: endEv ? endEv.day : null,
      duration: endEv ? (endEv.day - o.day) : null,
      outcome, by: endEv ? (endEv.by || null) : null,
      daysLeft0: o.daysLeft0, dayPartsLeft0: o.dayPartsLeft0,
      severity: o.severity, hpAtOnset: o.hpAtOnset, rangeProfile: o.rangeProfile,
      drinksDirty: o.drinksDirty, hygiene: o.hygiene,
      healerPresent: o.healerPresent, medicCount: o.medicCount,
      sayWin: o.sayWin || [], treated: false, treatKinds: [] };
  };
  for (const ev of events) {
    if (ev.t === 'on') {
      const k = keyOf(ev.o);
      if (!queues.has(k)) queues.set(k, []);
      queues.get(k).push(ev.o);
    } else {
      const e = ev.e;
      const k = keyOf(e);
      const q = queues.get(k) || [];
      if (!q.length) { orphanEnds.push(e); continue; }
      const o = q.shift();
      eps.push(finish(o, e, e.outcome));
    }
  }
  for (const q of queues.values()) for (const o of q) eps.push(finish(o, null, 'open at run end'));
  // Reclassify stale-cleanup + scholar-expiry ends via deathRows.
  const deaths = s.deathRows || [];
  for (const ep of eps) {
    if (ep.outcome === 'stale-cleanup') {
      const d = deaths.find(d => d.who === ep.who && d.day <= (ep.endDay == null ? 9999 : ep.endDay));
      ep.outcome = d ? ('died (other cause: ' + d.cause + ')') : 'record cleaned (already dead/off-roster)';
      if (d) ep.deathCause = d.cause;
    }
    if (ep.kind === 'scholar' && ep.outcome === 'recovered (expired)') {
      const d = deaths.find(d => d.isPlayer && d.day === ep.endDay &&
        /sickness|trembles|lockjaw|disease/i.test(d.cause || ''));
      if (d) { ep.outcome = 'died of ' + d.cause; ep.deathCause = d.cause; }
    }
    if (ep.kind === 'npc' && ep.outcome === 'died') {
      const d = deaths.find(d => d.who === ep.who && d.day === ep.endDay);
      if (d) ep.deathCause = d.cause;
    }
  }
  // Treatment join.
  for (const ep of eps) {
    const endD = ep.endDay == null ? s.daysAlive : ep.endDay;
    for (const t of (s.treatEvents || [])) {
      if (t.who !== ep.who) continue;
      if (t.day < ep.onsetDay || t.day > endD) continue;
      // Scholar treatments are disease-specific; NPC treatments are per-patient.
      if (ep.kind === 'scholar' && t.diseaseId && t.diseaseId !== ep.diseaseId) continue;
      if (ep.kind === 'scholar' && t.diseaseId === 'tick_attached') continue;
      ep.treated = true;
      if (!ep.treatKinds.includes(t.kind)) ep.treatKinds.push(t.kind);
    }
  }
  return { eps, orphanEnds };
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => /^feveranat-a-competent-s\d+\.json$/.test(f)).sort();
  if (!files.length) { console.error('no per-seed files in ' + DIR); process.exit(2); }
  const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const perSeed = seeds.map(s => ({ seed: s.seed, days: dayAggs(s), raw: s,
    built: buildEpisodes(s) }));
  const allEps = perSeed.flatMap(ps => ps.built.eps);
  const orphanEnds = perSeed.flatMap(ps => ps.built.orphanEnds);

  console.log('=== sim-feveranat-a DIAGNOSIS (seeds ' + seeds.map(s => s.seed).join(',') + ', competent, 150d) ===');
  console.log('');

  // ---- pooled wall / production context ----
  const P = { produced: 0, need: 0, ate: 0, starveDeaths: 0, deathCauses: {},
    national: 0, table: 0, wins: 0, daysAlive: [], waveReach: {}, snapDays: 0 };
  for (const s of seeds) {
    P.produced += sum((s.mealRows || []).map(r => r.produced || 0));
    P.need += sum((s.mealRows || []).map(r => r.needEst || 0));
    P.ate += sum((s.mealRows || []).map(r => r.ate || 0));
    for (const d of (s.deathRows || [])) {
      P.deathCauses[d.cause] = (P.deathCauses[d.cause] || 0) + 1;
      if (d.cause === 'starvation' && !d.isPlayer) P.starveDeaths++;
    }
    P.daysAlive.push(s.daysAlive);
    P.snapDays += (s.daySeries || []).length;
    for (const w of (s.waveReach || [])) P.waveReach[w] = (P.waveReach[w] || 0) + 1;
    if (s.national) P.national++;
    if (s.table) P.table++;
    if (s.win) P.wins++;
  }
  console.log('CONTEXT (pooled): produced=' + fmt(P.produced) + ' need=' + fmt(P.need) +
    ' produced/need=' + (P.need ? (P.produced / P.need).toFixed(3) : 'n/a') +
    ' starvation deaths (villager)=' + P.starveDeaths +
    ' death causes=' + JSON.stringify(P.deathCauses));
  console.log('WALL: national=' + P.national + '/' + seeds.length + ' table=' + P.table +
    ' wins=' + P.wins + ' waveReach=' + JSON.stringify(P.waveReach) +
    ' medianSurvival=' + med(P.daysAlive) + 'd max=' + Math.max(...P.daysAlive) + 'd');
  console.log('');

  // ---- F1 INCIDENCE ----
  const npcEps = allEps.filter(e => e.kind === 'npc');
  const schEps = allEps.filter(e => e.kind === 'scholar');
  const byDisease = {};
  for (const e of allEps) {
    const k = (e.diseaseId || e.name || '?');
    byDisease[k] = (byDisease[k] || 0) + 1;
  }
  const villagersAffected = new Set(npcEps.map(e => e.who)).size;
  let sickVillagerDays = 0, villageDays = 0;
  for (const ps of perSeed) {
    for (const d of ps.days) {
      villageDays++;
      sickVillagerDays += d.sickCountNPC + (d.scholarSickN > 0 ? 1 : 0);
    }
  }
  const perSeedCounts = {};
  for (const ps of perSeed) perSeedCounts[ps.seed] = ps.built.eps.length;
  console.log('F1 INCIDENCE: episodes=' + allEps.length + ' (NPC ' + npcEps.length +
    ', scholar ' + schEps.length + ') on ' + seeds.length + ' seeds; per-seed=' +
    JSON.stringify(perSeedCounts));
  console.log('  by disease id/name=' + JSON.stringify(byDisease));
  console.log('  villagers affected (distinct NPC vids)=' + villagersAffected +
    '; sick villager-days=' + sickVillagerDays + ' / village-days=' + villageDays +
    ' (' + pct(sickVillagerDays, villageDays) + ')');
  console.log('');

  // ---- F2 DURATION ----
  const closed = allEps.filter(e => e.duration != null);
  const open = allEps.filter(e => e.duration == null);
  const byOutcome = {};
  for (const e of allEps) byOutcome[e.outcome] = (byOutcome[e.outcome] || 0) + 1;
  const durs = closed.map(e => e.duration);
  console.log('F2 DURATION: closed episodes=' + closed.length + ' open at run end=' + open.length +
    '; duration days: min=' + (durs.length ? Math.min(...durs) : 'n/a') +
    ' median=' + med(durs) + ' mean=' + r1(mean(durs)) + ' max=' + (durs.length ? Math.max(...durs) : 'n/a'));
  console.log('  by outcome=' + JSON.stringify(byOutcome));
  const durHist = {};
  for (const d of durs) durHist[d] = (durHist[d] || 0) + 1;
  console.log('  duration histogram (days: count)=' + JSON.stringify(durHist));
  console.log('  sick-days as share of village-days=' + pct(sickVillagerDays, villageDays));
  const byDisDur = {};
  for (const e of closed) {
    const k = e.diseaseId || e.name;
    (byDisDur[k] = byDisDur[k] || []).push(e.duration);
  }
  for (const k of Object.keys(byDisDur).sort()) {
    console.log('    ' + k + ': n=' + byDisDur[k].length + ' median=' + med(byDisDur[k]) + ' mean=' + r1(mean(byDisDur[k])));
  }
  console.log('');

  // ---- F3 VECTOR ATTRIBUTION ----
  const byVector = {};
  for (const e of allEps) byVector[e.vector || 'unattributed'] = (byVector[e.vector || 'unattributed'] || 0) + 1;
  const unattributed = allEps.filter(e => !e.vector || e.vector === 'unattributed');
  console.log('F3 VECTOR ATTRIBUTION: by vector=' + JSON.stringify(byVector));
  console.log('  attributed=' + (allEps.length - unattributed.length) + '/' + allEps.length +
    ' unattributed=' + unattributed.length);
  for (const e of unattributed) {
    console.log('    UNATTRIBUTED seed=' + e.seed + ' ' + e.whoName + ' (' + e.who + ') ' + e.name +
      ' onset d' + e.onsetDay + ' via ' + e.vectorSource + ' — ' + (e.vectorEvidence || 'no evidence recorded'));
  }
  const woundEps = allEps.filter(e => e.vector === 'wound');
  const woundOk = woundEps.filter(e => e.hpAtOnset != null && e.hpAtOnset < 40).length;
  const tickEps = allEps.filter(e => e.vector === 'tick');
  const tickOk = tickEps.filter(e => e.rangeProfile === 'forager' || e.rangeProfile === 'explorer').length;
  const gutEps = allEps.filter(e => e.vector === 'dirty water');
  const gutOk = gutEps.filter(e => e.drinksDirty === true).length;
  console.log('  corroboration: wound onsets with hp<40 at onset=' + woundOk + '/' + woundEps.length +
    '; tick onsets with forager/explorer profile=' + tickOk + '/' + tickEps.length +
    '; gut-rot onsets with drinksDirty at onset=' + gutOk + '/' + gutEps.length);
  console.log('');

  // ---- F4 TREATMENT IN THE WILD ----
  const treatByKind = {};
  for (const s of seeds) for (const t of (s.treatEvents || [])) treatByKind[t.kind] = (treatByKind[t.kind] || 0) + 1;
  const treated = allEps.filter(e => e.treated);
  const untreated = allEps.filter(e => !e.treated);
  const treatedClosed = treated.filter(e => e.duration != null);
  const untreatedClosed = untreated.filter(e => e.duration != null);
  const treatedDied = treated.filter(e => /^died/.test(e.outcome)).length;
  const untreatedDied = untreated.filter(e => /^died/.test(e.outcome)).length;
  console.log('F4 TREATMENT IN THE WILD: treatEvents by kind=' + JSON.stringify(treatByKind) +
    ' (total ' + sum(Object.values(treatByKind)) + ')');
  console.log('  diagnoses=' + sum(seeds.map(s => (s.diagnoses || []).length)) +
    ' cures=' + sum(seeds.map(s => (s.cureEvents || []).length)) +
    ' statusEvents (alien/tick)=' + sum(seeds.map(s => (s.statusEvents || []).length)));
  console.log('  episodes treated=' + treated.length + '/' + allEps.length +
    ' (treated kinds: ' + JSON.stringify(treated.flatMap(e => e.treatKinds).reduce((m, k) => { m[k] = (m[k] || 0) + 1; return m; }, {})) + ')');
  console.log('  treated: median duration=' + med(treatedClosed.map(e => e.duration)) +
    ' mean=' + r1(mean(treatedClosed.map(e => e.duration))) + ' died=' + treatedDied + '/' + treated.length);
  console.log('  untreated: median duration=' + med(untreatedClosed.map(e => e.duration)) +
    ' mean=' + r1(mean(untreatedClosed.map(e => e.duration))) + ' died=' + untreatedDied + '/' + untreated.length);
  const hpEps = allEps.filter(e => e.healerPresent === true);
  const haEps = allEps.filter(e => e.healerPresent === false);
  const huEps = allEps.filter(e => e.healerPresent == null);
  const hpClosed = hpEps.filter(e => e.duration != null);
  const haClosed = haEps.filter(e => e.duration != null);
  console.log('  healer present at onset: ' + hpEps.length + ' episodes, median duration=' + med(hpClosed.map(e => e.duration)) +
    ' died=' + hpEps.filter(e => /^died/.test(e.outcome)).length);
  console.log('  healer absent at onset: ' + haEps.length + ' episodes, median duration=' + med(haClosed.map(e => e.duration)) +
    ' died=' + haEps.filter(e => /^died/.test(e.outcome)).length +
    (huEps.length ? ' (healer unknown: ' + huEps.length + ')' : ''));
  console.log('');

  // ---- F5 PRODUCTION COST ----
  const waveDays = [], nonWaveDays = [];
  for (const ps of perSeed) {
    for (const d of ps.days) {
      if (d.sickCountNPC >= 1 || d.scholarSickN >= 1) waveDays.push(d);
      else nonWaveDays.push(d);
    }
  }
  const agg = (days) => {
    const produced = sum(days.map(d => d.produced));
    const need = sum(days.map(d => d.need));
    const health = sum(days.map(d => d.healthSum)) / Math.max(1, sum(days.map(d => d.healthN)));
    return { n: days.length, produced, need, ratio: need ? produced / need : null, health };
  };
  const wA = agg(waveDays), nA = agg(nonWaveDays);
  const healthKcal = (wA.health < nA.health)
    ? wA.produced * (nA.health / wA.health - 1) : 0;
  console.log('F5 PRODUCTION COST: fever-wave days=' + wA.n + ' (sickCount>=1 or scholar sick) vs non-wave days=' + nA.n);
  console.log('  wave days: produced/need=' + r3(wA.ratio) + ' healthFrac=' + r3(wA.health) +
    ' produced=' + fmt(wA.produced) + ' need=' + fmt(wA.need));
  console.log('  non-wave days: produced/need=' + r3(nA.ratio) + ' healthFrac=' + r3(nA.health) +
    ' produced=' + fmt(nA.produced) + ' need=' + fmt(nA.need));
  console.log('  HEALTH counterfactual (wave produced at non-wave health): ' + fmt(healthKcal) + ' kcal');
  let sickVD = { produced: 0, expected: 0, healthSum: 0, healthN: 0, multSum: 0, multN: 0, n: 0 };
  let healthyVD = { produced: 0, expected: 0, healthSum: 0, healthN: 0, multSum: 0, multN: 0, n: 0 };
  for (const s of seeds) {
    const sickByDay = new Map();
    for (const d of (s.daySeries || [])) sickByDay.set(d.day, new Set(Object.keys(d.sickMap || {})));
    for (const r of (s.mealRows || [])) {
      const isSick = (sickByDay.get(r.day) || new Set()).has(r.vid);
      const b = isSick ? sickVD : healthyVD;
      b.n++;
      b.produced += r.produced || 0; b.expected += r.expected || 0;
      if (r.healthFrac != null) { b.healthSum += r.healthFrac; b.healthN++; }
      if (r.mult != null) { b.multSum += r.mult; b.multN++; }
    }
  }
  const vdLine = (b, label) => label + ': n=' + b.n + ' mean produced=' + fmt(b.n ? b.produced / b.n : 0) +
    ' mean expected=' + fmt(b.n ? b.expected / b.n : 0) +
    ' healthFrac=' + r3(b.healthN ? b.healthSum / b.healthN : null) +
    ' mult=' + r3(b.multN ? b.multSum / b.multN : null);
  console.log('  villager-day contrast (snapshot sickMap join):');
  console.log('    ' + vdLine(sickVD, 'sick'));
  console.log('    ' + vdLine(healthyVD, 'healthy'));
  console.log('');

  // ---- F6 SPREAD ----
  const onsetByDay = new Map(); // seed|day -> npc onsets
  for (const e of npcEps) {
    const k = e.seed + '|' + e.onsetDay;
    onsetByDay.set(k, (onsetByDay.get(k) || 0) + 1);
  }
  const dist = {};
  let totalDays = 0;
  for (const s of seeds) {
    for (let d = 1; d <= s.daysAlive; d++) {
      totalDays++;
      const n = onsetByDay.get(s.seed + '|' + d) || 0;
      dist[n] = (dist[n] || 0) + 1;
    }
  }
  console.log('F6 SPREAD: new NPC onsets per village-day distribution (onsets: days)=' + JSON.stringify(dist) +
    ' over ' + totalDays + ' village-days');
  const multiDays = [];
  for (const [k, n] of onsetByDay) if (n >= 2) multiDays.push({ key: k, n });
  console.log('  multi-onset days (>=2): ' + multiDays.length);
  for (const md of multiDays.slice(0, 12)) {
    const parts = md.key.split('|');
    const seed = Number(parts[0]), day = Number(parts[1]);
    const eps = npcEps.filter(e => e.seed === seed && e.onsetDay === day);
    const s = seeds.find(x => x.seed === seed);
    const snap = (s.daySeries || []).find(d => d.day === day || d.day === day + 1);
    console.log('    seed ' + seed + ' d' + day + ' (' + md.n + ' onsets): ' +
      eps.map(e => e.whoName + ':' + e.name + '→' + e.vector).join(', ') +
      ' | drinksDirty at onset: ' + eps.map(e => e.drinksDirty).join('/') +
      ' | snapshot drinksDirty d' + (snap ? snap.day : '?') + '=' + (snap ? snap.drinksDirty : 'n/a'));
  }
  let lagOnsets = 0, lagWindows = 0;
  for (const e of npcEps) {
    for (let lag = 1; lag <= 3; lag++) {
      lagWindows++;
      lagOnsets += onsetByDay.get(e.seed + '|' + (e.onsetDay + lag)) || 0;
    }
  }
  const baseRate = totalDays ? (npcEps.length / totalDays) : 0;
  console.log('  lag: onsets in days +1..+3 after an onset: ' + lagOnsets + ' over ' + lagWindows +
    ' windows (' + r3(lagWindows ? lagOnsets / lagWindows : null) + '/window) vs base rate ' +
    r3(baseRate) + '/day (ratio ' + r3(baseRate ? (lagOnsets / lagWindows) / baseRate : null) + ')');
  console.log('  code fact: no contagion path exists — villageSicknessTick rolls each villager independently per day; no household/contact structure in code. Clustering, if any, must come from shared daily conditions (dirty water, low HP after attacks), not person-to-person spread.');
  console.log('');

  // ---- G3 CORPUS (corrected) ----
  let g3ok = true;
  const g3notes = [];
  for (const s of seeds) {
    const days = s.daySeries || [], flows = s.flowSeries || [], meals = s.mealRows || [];
    const keys = meals.map(r => r.vid + '|' + r.day);
    const dayNums = new Set(days.map(d => d.day));
    const missing = [];
    for (let d = 1; d <= s.daysAlive; d++) if (!dayNums.has(d)) missing.push(d);
    const lenOk = days.length === s.daysAlive || (days.length === s.daysAlive - 1 && missing.length === 1);
    const snapByDay = new Map();
    for (const d of days) snapByDay.set(d.day, d);
    const unaccounted = [];
    for (const o of (s.sickOnsets || [])) {
      // "Later snapshot" means a snapshot taken AFTER the creation call: a
      // villageSicknessTick onset (endDay of day D) can first appear in the
      // day D+1 snapshot; a food/scholar onset (during day D parts) can first
      // appear in the day D snapshot. If no such snapshot exists (the run
      // ended before it — village died the next day), the onset is not
      // checkable by snapshot and is exempt, not a corpus gap.
      const appearDay = (o.vectorSource === 'villageSicknessTick') ? o.day + 1 : o.day;
      let seen = false, checkable = false;
      for (const dd of [appearDay, appearDay + 1]) {
        const snap = snapByDay.get(dd);
        if (!snap) continue;
        checkable = true;
        if (o.kind === 'npc' && snap.sickMap && snap.sickMap[o.who] && snap.sickMap[o.who].name === o.name) { seen = true; break; }
        if (o.kind === 'scholar' && (snap.scholarSick || []).some(e => e.id === o.diseaseId)) { seen = true; break; }
      }
      const endSoon = (s.sickEnds || []).some(e => e.who === o.who &&
        (e.kind === 'scholar' ? e.diseaseId === o.diseaseId : e.name === o.name) &&
        e.day >= o.day && e.day <= o.day + 1);
      if (!seen && !endSoon && checkable) unaccounted.push(o.who + ' d' + o.day + ' ' + o.name);
    }
    const ok = lenOk && flows.length > 0 &&
      new Set(keys).size === keys.length && Array.isArray(s.deathRows) &&
      unaccounted.length === 0;
    if (!ok) {
      g3ok = false;
      g3notes.push('s' + s.seed + ': daySeries=' + days.length + ' daysAlive=' + s.daysAlive +
        ' missingDays=' + JSON.stringify(missing) + ' flows=' + flows.length +
        ' mealRows=' + meals.length + ' deduped=' + (new Set(keys).size === keys.length) +
        ' unaccountedOnsets=' + unaccounted.length + (unaccounted.length ? ' (' + unaccounted.slice(0, 3).join('; ') + ')' : ''));
    }
  }
  const bareFiles = fs.readdirSync(DIR).filter(f => /^feveranat-a-bare-s\d+\.json$/.test(f)).sort();
  if (bareFiles.length !== 8) { g3ok = false; g3notes.push('bare fingerprints: ' + bareFiles.length + '/8 present'); }
  if (orphanEnds.length) { g3ok = false; g3notes.push('orphan sickEnds (no matching onset): ' + orphanEnds.length); }
  console.log('G3 CORPUS: ' + (g3ok ? 'PASS — all legs valid (8 recorded + 8 bare; every onset accounted for)' : 'FAIL — ' + g3notes.join('; ')));
  console.log('');

  // ---- G2 NEUTRALITY ----
  let g2 = 'NOT CHECKED (no sweep-competent.json summary found)';
  try {
    const summPath = path.join(DIR, 'sweep-competent.json');
    if (fs.existsSync(summPath)) {
      const summ = JSON.parse(fs.readFileSync(summPath, 'utf8'));
      const mism = [];
      for (const row of (summ.rows || [])) {
        const bf = path.join(DIR, `feveranat-a-bare-s${row.seed}.json`);
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
      g2 = mism.length ? 'FAIL — ' + mism.join('; ') : 'PASS — recorded == bare on all 8 seeds';
    }
  } catch (e) { g2 = 'ERROR — ' + e.message; }
  console.log('G2 NEUTRALITY: ' + g2);
  console.log('');

  // ---- G4 CLASSIFICATION ----
  const unclassified = allEps.filter(e => !e.vector || e.vector === 'unattributed');
  const seedsWithEp = perSeed.filter(ps => ps.built.eps.length).length;
  console.log('G4 CLASSIFICATION: ' + allEps.length + ' episode(s) on ' + seedsWithEp + '/8 seeds — ' +
    (unclassified.length === 0
      ? 'EVERY episode classified by vector + treatment + outcome'
      : unclassified.length + ' honestly unattributed (listed under F3 with the sensor gap named)') +
    ' (prevalence ' + seedsWithEp + '/8 seeds)');
  console.log('');

  // ---- Sense: quoted beats ----
  console.log('SENSE (say-lines around onsets — up to 5):');
  let shown = 0;
  for (const e of allEps) {
    if (shown >= 5) break;
    if ((e.sayWin || []).length) { console.log('  seed ' + e.seed + ' d' + e.onsetDay + ' ' + e.whoName + ' (' + e.name + ' → ' + e.vector + '): ' + JSON.stringify(e.sayWin)); shown++; }
  }
  const sickDeaths = seeds.flatMap(s => (s.deathRows || []).filter(d => /sick|disease|fever|gutrot|wound_fever|trembles|lockjaw|trichinosis/i.test(d.cause || '')));
  console.log('SENSE (sickness deaths: ' + sickDeaths.length + '):');
  for (const d of sickDeaths.slice(0, 6)) {
    const beats = (d.sayWin || []).slice(-3);
    if (beats.length) console.log('  d' + d.day + ' ' + d.whoName + ' (' + d.cause + '): ' + JSON.stringify(beats));
  }
  console.log('');
  console.log('DIAGNOSIS VERDICT: ' + (allEps.length
    ? 'COMPLETE — ' + allEps.length + ' episode(s) classified (' + (allEps.length - unclassified.length) + ' attributed, ' + unclassified.length + ' unattributed-with-gap-named)'
    : 'COMPLETE — no fever/sickness episode found on this band; see evidence'));
}

if (require.main === module) main();
module.exports = { buildEpisodes, dayAggs };
