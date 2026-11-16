// analyze-gatelever-b.js — gate-lever judgment for sim-gatelever-b.
// Requires scripts/analyze-gatereach2-b.js for the shared substrate
// (wave-5 classes, FACED-NOT-KILLED share, starvation, survival,
// consultation/arrival classification, instrument errors) and adds
// the gatelever metrics on top: gate SEEKs, launched-party wave-4+
// field kills (distinct meetings), kill:death as defined in the
// prereg (Correction C1: denominator is encounter-row vDie on
// launched-party wave-4+ meetings ONLY — the 'villager combat'
// death-log rows are the killed beasts' own records, reported here
// as a secondary, never in the bar), and the mechanism
// decomposition (second-companion launches, trick_wait holds,
// re-point rows, gate rows with partyFromPlan > 0, SEEKs by
// mechanism). Read-only; prints JSON to stdout.
// Usage: node scripts/analyze-gatelever-b.js <controlDir> <leverDir>
//   two legs: control (seed call only) + lever (seed call + gate
//   changes), identical seeds. The combined judgment is the prereg
//   verdict. One dir: that leg's summary alone (5-bar judgment null).
'use strict';
const fs = require('fs');
const path = require('path');
const base = require('./analyze-gatereach2-b');
const w5k = require('./analyze-wave5kill-b');

function loadWave4plusIds(monstersPath) {
  try {
    const raw = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));
    const list = raw.monsters || raw;
    return new Set(list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }));
  } catch (e) { return new Set(); }
}

function meetingKey(seed, vid, day, mid) { return seed + '|' + vid + '|' + day + '|' + mid; }

// coveringLaunchFor(launches, seed, vid, day): a holder launch row
// (launched=true) whose window covers the day, or null.
function coveringLaunchFor(launches, seed, vid, day) {
  for (let i = launches.length - 1; i >= 0; i--) {
    const l = launches[i];
    if (!l || l.role !== 'holder' || !l.launched || l.vid !== vid || l.seed !== seed) continue;
    if (l.duration == null) continue;
    if (day >= l.day && day <= l.day + (l.duration | 0)) return l;
  }
  return null;
}

// analyzeGateleverFiles(fileObjs, w5set, w4plusSet): base analysis
// plus the gatelever section. fileObjs carry {path, leg}.
function analyzeGateleverFiles(fileObjs, w5set, w4plusSet) {
  const out = base.analyzeFiles(fileObjs, w5set);
  const gl = {
    seeksRows: 0, seeksDistinct: 0,
    gateByResultW4: {},
    launchedKills: 0, launchedKillsRows: 0,
    launchedDeaths: 0, launchedDeathsRows: 0,
    vcDeathsW4plus: 0,
    killDeath: null,
    mechanisms: {
      secondCompanionLaunches: 0, secondCompanionDeparts: 0,
      trickWaitRows: 0, trickWaitEpisodes: 0, trickWaitExpired: 0,
      repointRows: 0,
      gateRowsPlanCounted: 0, seeksPlanCounted: 0,
      seeksLivedFought: 0, seeksTargetMatch: 0,
    },
    perSeed: {},
  };
  const seekKeys = {};
  const killKeys = {};
  const deathKeys = {};
  const killDayBeast = [];
  const twEpisodes = {};
  for (const fo of fileObjs) {
    let d;
    try { d = JSON.parse(fs.readFileSync(fo.path, 'utf8')); }
    catch (e) { continue; }
    const seed = d.seed;
    const ps = { seeks: 0, launchedKills: 0, launchedDeaths: 0, secondCompanionLaunches: 0, trickWaitRows: 0, repointRows: 0 };
    const launches = (d.grLaunches || []).map(function (l) { return Object.assign({ seed: seed, leg: fo.leg || null }, l); });
    const gates = (d.w5gates || []).map(function (g) { return Object.assign({ seed: seed, leg: fo.leg || null }, g); });
    const encounters = (d.w5encounters || []).map(function (e) { return Object.assign({ seed: seed, leg: fo.leg || null }, e); });
    for (const g of gates) {
      if ((g.wave | 0) < 4) continue;
      gl.gateByResultW4[g.result || '?'] = (gl.gateByResultW4[g.result || '?'] || 0) + 1;
      if ((g.partyFromPlan | 0) > 0) {
        gl.mechanisms.gateRowsPlanCounted += 1;
        if (g.result === 'seek') gl.mechanisms.seeksPlanCounted += 1;
      }
      if (g.result === 'seek') {
        gl.seeksRows += 1;
        ps.seeks += 1;
        seekKeys[meetingKey(seed, g.vid, g.day, g.mid)] = true;
        // SEEK by mechanism: lived-fought acceptance vs target match.
        const targetMatch = (g.planTarget && g.mid === g.planTarget) ||
          (g.needWave != null && (g.wave | 0) === g.needWave) ||
          (g.planStage === 'standing' && (g.wave | 0) >= 3);
        if (g.livedFought && !targetMatch) gl.mechanisms.seeksLivedFought += 1;
        else if (targetMatch) gl.mechanisms.seeksTargetMatch += 1;
      }
    }
    for (const e of encounters) {
      if ((e.wave | 0) < 4) continue;
      if (e.origin !== 'expedition') continue;
      if (!coveringLaunchFor(launches, seed, e.vid, e.day)) continue;
      if (e.outcome === 'vKill') {
        gl.launchedKillsRows += 1;
        const k = meetingKey(seed, e.vid, e.day, e.mid);
        if (!killKeys[k]) { killKeys[k] = true; gl.launchedKills += 1; ps.launchedKills += 1; }
        killDayBeast.push({ seed: seed, day: e.day, mid: e.mid });
      } else if (e.outcome === 'vDie') {
        gl.launchedDeathsRows += 1;
        const k = meetingKey(seed, e.vid, e.day, e.mid);
        if (!deathKeys[k]) { deathKeys[k] = true; gl.launchedDeaths += 1; ps.launchedDeaths += 1; }
      }
    }
    // vcDeaths secondary (Correction C1): death-log rows kind
    // 'monster', cause 'villager combat', naming a wave-4+ beast,
    // on the same day as one of this leg's launched-party kills.
    for (const dd of (d.deaths || [])) {
      if (dd.kind !== 'monster' || dd.cause !== 'villager combat' || !w4plusSet.has(dd.who)) continue;
      if (killDayBeast.some(function (kb) { return kb.seed === seed && kb.day === dd.day && kb.mid === dd.who; })) gl.vcDeathsW4plus += 1;
    }
    for (const l of launches) {
      if (l.role === 'holder' && l.launched && ((l.partyAfter || []).length >= 2)) {
        gl.mechanisms.secondCompanionLaunches += 1;
        ps.secondCompanionLaunches += 1;
      }
    }
    for (const p of (d.w5departs || [])) {
      const isTrickWait = p.winPlanAction === 'trick_wait' ||
        (p.result === 'hold' && (p.stage === 'hunt' || p.stage === 'standing') && p.trickWaitSinceDay != null);
      if (isTrickWait) {
        gl.mechanisms.trickWaitRows += 1;
        ps.trickWaitRows += 1;
        const ek = seed + '|' + p.vid + '|' + (p.target || '-');
        if (!twEpisodes[ek]) twEpisodes[ek] = { firstDay: p.day, lastDay: p.day, expired: false };
        else twEpisodes[ek].lastDay = p.day;
      }
      if (p.result === 'launch' && p.secondCompanion) gl.mechanisms.secondCompanionDeparts += 1;
      if (p.result === 'launch' && p.winPlanAction !== 'party_wait') {
        // A launch after a trick wait for the same target expires it.
        const ek = seed + '|' + p.vid + '|' + (p.target || '-');
        if (twEpisodes[ek]) twEpisodes[ek].expired = true;
      }
    }
    for (const srow of (d.w5seeds || [])) {
      if (srow.repointed) { gl.mechanisms.repointRows += 1; ps.repointRows += 1; }
    }
    gl.perSeed[seed] = ps;
  }
  gl.seeksDistinct = Object.keys(seekKeys).length;
  for (const k of Object.keys(twEpisodes)) {
    gl.mechanisms.trickWaitEpisodes += 1;
    if (twEpisodes[k].expired) gl.mechanisms.trickWaitExpired += 1;
  }
  // Bar 3 (Correction C1): kills / launched-party vDie meetings.
  // Denominator 0 with kills >= 1 passes (value null — no deaths
  // to count against; the judge handles it).
  if (gl.launchedDeaths === 0) gl.killDeath = null;
  else gl.killDeath = +(gl.launchedKills / gl.launchedDeaths).toFixed(2);
  out.gatelever = gl;
  return out;
}

function analyzeGateleverLeg(dir, w5set, w4plusSet) {
  return analyzeGateleverFiles(base.listFiles(dir, null), w5set, w4plusSet);
}

// judgeGatelever(control, lever) — the frozen prereg bars on the
// gatelever per-leg summaries (each: base analyzeFiles output +
// .gatelever). Bar 3 passes with zero denominator when kills >= 1
// (prereg frozen rule); the instrument must also be clean on BOTH
// legs (8/8 files, 0 parse errors, 0 instrument errors,
// consultation share >= 0.90, arrival share >= 0.90) — a GO on a
// broken instrument is not a GO.
function judgeGatelever(control, lever) {
  function num(x) { return typeof x === 'number' && isFinite(x) ? x : null; }
  const g = lever.gatelever;
  const b1v = g.seeksRows;
  const b1 = b1v >= 1;
  const b2v = g.launchedKills;
  const b2 = b2v >= 1;
  const b3d = g.launchedDeaths;
  let b3v = g.killDeath;
  let b3;
  if (b2v >= 1 && b3d === 0) { b3 = true; b3v = null; }
  else b3 = b3v !== null && b3v >= 0.92;
  const b4v = num(lever.pooled.facedNotKilledShare);
  const b4 = b4v !== null && b4v <= 0.20;
  const b5starv = num(lever.pooled.starvation) !== null && num(control.pooled.starvation) !== null &&
    lever.pooled.starvation <= control.pooled.starvation + 2;
  const b5surv = num(lever.pooled.medianSurvivalAll) !== null && num(control.pooled.medianSurvivalAll) !== null &&
    lever.pooled.medianSurvivalAll >= 0.8 * control.pooled.medianSurvivalAll;
  const b5 = b5starv && b5surv;
  const inst = control.pooled.instrumentErrors === 0 && lever.pooled.instrumentErrors === 0 &&
    control.pooled.seeds === 8 && lever.pooled.seeds === 8 &&
    control.pooled.files === 8 && lever.pooled.files === 8 &&
    control.pooled.parseErrors === 0 && lever.pooled.parseErrors === 0 &&
    typeof control.gateConsultations.share === 'number' && control.gateConsultations.share >= 0.90 &&
    typeof lever.gateConsultations.share === 'number' && lever.gateConsultations.share >= 0.90 &&
    typeof control.arrivals.share === 'number' && control.arrivals.share >= 0.90 &&
    typeof lever.arrivals.share === 'number' && lever.arrivals.share >= 0.90;
  const go = b1 && b2 && b3 && b4 && b5 && inst;
  return {
    gateSeeks: { value: b1v, distinct: g.seeksDistinct, bar: '>= 1 per 8-seed leg', pass: b1 },
    launchedPartyKills: { value: b2v, rows: g.launchedKillsRows, bar: '>= 1 per 8-seed leg', pass: b2 },
    killDeath: { value: b3v, kills: b2v, deaths: b3d, vcDeathsSecondary: g.vcDeathsW4plus, bar: '>= 0.92 (zero denominator with kills >= 1 passes)', pass: b3 },
    facedNotKilledShare: { value: b4v, bar: '<= 0.20', pass: b4 },
    costs: { starvation: { value: lever.pooled.starvation, control: control.pooled.starvation, bar: '<= control + 2', pass: b5starv },
      medianSurvival: { value: lever.pooled.medianSurvivalAll, control: control.pooled.medianSurvivalAll, bar: '>= 0.8x control', pass: b5surv },
      pass: b5 },
    instrument: { controlErrors: control.pooled.instrumentErrors, leverErrors: lever.pooled.instrumentErrors,
      controlSeeds: control.pooled.seeds, leverSeeds: lever.pooled.seeds,
      controlConsultShare: control.gateConsultations.share, leverConsultShare: lever.gateConsultations.share,
      controlArrivalShare: control.arrivals.share, leverArrivalShare: lever.arrivals.share,
      pass: inst },
    verdict: go ? 'GO' : 'NO-GO',
  };
}

const isMain = require.main === module;
if (isMain) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node scripts/analyze-gatelever-b.js <controlDir> <leverDir>');
    process.exit(2);
  }
  const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
  const w5set = new Set(w5k.loadWave5Ids(monstersPath));
  const w4plusSet = loadWave4plusIds(monstersPath);
  if (process.argv[3]) {
    const control = analyzeGateleverLeg(dir, w5set, w4plusSet);
    const lever = analyzeGateleverLeg(process.argv[3], w5set, w4plusSet);
    const judgment = judgeGatelever(control, lever);
    console.log(JSON.stringify({ control: control, lever: lever, judgment: judgment }, null, 2));
  } else {
    const leg = analyzeGateleverLeg(dir, w5set, w4plusSet);
    console.log(JSON.stringify({ leg: leg, judgment: null }, null, 2));
  }
}

module.exports = { analyzeGateleverFiles: analyzeGateleverFiles,
  analyzeGateleverLeg: analyzeGateleverLeg,
  judgeGatelever: judgeGatelever,
  loadWave4plusIds: loadWave4plusIds, coveringLaunchFor: coveringLaunchFor };
