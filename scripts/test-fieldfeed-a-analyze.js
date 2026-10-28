#!/usr/bin/env node
// scripts/test-fieldfeed-a-analyze.js — sim-fieldfeed-a analyzer / verdict printer.
// Reads evidence/2026-10-28/<corpus>/s*-armed.json, classifies every wave-4
// field meeting per the prereg (evidence/2026-10-28/sim-fieldfeed-a-prereg.md),
// and prints the GO legs, guards, and wall table.
// Usage: node scripts/test-fieldfeed-a-analyze.js [--dir <corpus-dir>]
//   [--seeds 75101,75102,...] [--mode pilot|control|confirm]
// Modes: pilot/confirm judge the primary GO + guards (exit 0 iff all pass,
// exit 1 otherwise — a printed NO-GO is a verdict, not a script failure).
// control prints census + wall only (exit 0 iff census valid).
// The analyzer never re-scores: the prereg's definitions are literal here.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
function argVal(name, dflt) {
  const i = args.indexOf(name);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : dflt;
}
const DIR = path.resolve(argVal('--dir', path.join(REPO, 'evidence', '2026-10-28', 'perseed-fieldfeed-a')));
const MODE = argVal('--mode', 'pilot');
const SEEDS = argVal('--seeds', '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// 1528Z control wall (same band, no feed) — the shared baseline.
const CONTROL = {
  nationalEver: 7, nationalFinal: 6, table: 4, entered: 3, wins: 3,
  wave4: 6, wave5: 0, medianDays: 146, deaths: 286, starvation: 1,
};
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
function isLiving(m) { return m && m.deadKnown !== true; }
function earshotArmed(m) {
  return (m.earshot || []).filter(e => isLiving(e) && e.armed === true);
}
function earshotLiving(m) {
  return (m.earshot || []).filter(isLiving);
}
// Prereg classification, applied in prereg order.
function classify(m) {
  const fed = (m.engineAllies | 0) > 0;
  if (m.calledHelp && m.joinedAllyVid) {
    const retreated = m.outcome === 'vFlee';
    return (m.allyFromStart ? 'FORMED-FROM-START' : 'FORMED-BY-SHOUT') + (retreated ? '+RETREATED' : '');
  }
  if (fed) {
    let sub = null;
    if (m.intent === 'learn') sub = 'LEARN-PREEMPT';
    else if (!m.everHopeless) sub = 'NEVER-HOPELESS';
    else sub = 'HOPELESS-UNEXPLAINED';
    return 'FED-NOT-FOUGHT:' + sub;
  }
  const could = earshotArmed(m).length >= 1;
  if (could) {
    const living = earshotLiving(m);
    const allBelowFloor = living.length > 0 && living.every(e => (e.trust === null || e.trust === undefined) ? false : (e.trust < 15));
    return 'FED-BUT-UNANSWERED:' + (allBelowFloor ? 'TRUST-FLOOR' : 'OTHER');
  }
  const living = earshotLiving(m);
  if (living.length === 0) return 'SOLO-NO-PRESENCE:EARSHOT-EMPTY';
  return 'SOLO-NO-PRESENCE:EARSHOT-UNARMED-ONLY';
}
function isJudged(m) {
  return m && m.wave === 4 && (m.caller === 'resolve' || m.caller === 'patrol')
    && m.channel === 'field' && !(m.leader && m.leader.isScholar);
}
function main() {
  const rows = [];
  let missing = 0;
  for (const seed of SEEDS) {
    const p = path.join(DIR, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.log(`MISSING ROW seed=${seed}`); missing++; continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const allMeetings = [];
  for (const r of rows) {
    const ms = (r.fieldfeed && r.fieldfeed.meetings) || [];
    for (const m of ms) allMeetings.push(Object.assign({ seed: r.seed }, m));
  }
  const judged = allMeetings.filter(isJudged);
  const classes = {};
  const formed = [], fedUnanswered = [], fedNotFought = [], solo = [];
  let unclassified = 0;
  for (const m of judged) {
    const c = classify(m);
    classes[c] = (classes[c] || 0) + 1;
    if (c.indexOf('FORMED') === 0) formed.push(m);
    else if (c.indexOf('FED-BUT-UNANSWERED') === 0) fedUnanswered.push(m);
    else if (c.indexOf('FED-NOT-FOUGHT') === 0) fedNotFought.push(m);
    else if (c.indexOf('SOLO-NO-PRESENCE') === 0) solo.push(m);
    else { unclassified++; }
  }
  const tileCould = judged.filter(m => earshotArmed(m).length >= 1).length;
  const fedCount = judged.filter(m => (m.engineAllies | 0) > 0).length;
  // Field kills / wins / losses / deaths by channel (wave-4 meetings, all channels).
  const w4 = allMeetings.filter(m => m.wave === 4);
  const killsByChannel = {}, deathsByChannel = {};
  for (const m of w4) {
    const ch = m.channel === 'field' ? m.caller : m.channel;
    if (m.outcome === 'vKill') killsByChannel[ch] = (killsByChannel[ch] || 0) + 1;
    if (m.outcome === 'vDie') deathsByChannel[ch] = (deathsByChannel[ch] || 0) + 1;
  }
  const partyOutcomes = {};
  for (const m of formed) partyOutcomes[m.outcome || 'null'] = (partyOutcomes[m.outcome || 'null'] || 0) + 1;
  // Wall from rows.
  const wall = {
    n: rows.length,
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver | 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal | 0), 0),
    table: rows.reduce((t, r) => t + (r.table | 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered | 0), 0),
    wins: rows.reduce((t, r) => t + (r.won | 0), 0),
    wave4: rows.filter(r => (r.waveReach | 0) >= 4).length,
    wave5: rows.filter(r => (r.waveReach | 0) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    deaths: rows.reduce((t, r) => t + (r.deathTotal | 0), 0),
    starvation: rows.reduce((t, r) => t + (r.starvationDeaths | 0), 0),
  };
  const recorderErrs = rows.reduce((t, r) => t + ((r.fieldfeed && r.fieldfeed.diag && r.fieldfeed.diag.errs) | 0), 0);
  const censusValid = missing === 0 && rows.length === SEEDS.length && rows.every(r => r.days > 0)
    && unclassified === 0 && recorderErrs === 0;
  console.log(`\n=== sim-fieldfeed-a analyzer mode=${MODE} dir=${DIR} ===`);
  console.log(`rows: ${rows.length}/${SEEDS.length} missing=${missing} recorderErrs=${recorderErrs} censusValid=${censusValid}`);
  console.log(`judged wave-4 field meetings (resolve+patrol, non-scholar): ${judged.length}`);
  console.log(`classification: ${JSON.stringify(classes)}`);
  console.log(`tile-could-form: ${tileCould} fed: ${fedCount} formed: ${formed.length} fed-but-unanswered: ${fedUnanswered.length} fed-not-fought: ${fedNotFought.length} solo-no-presence: ${solo.length} unclassified: ${unclassified}`);
  for (const m of formed) {
    console.log(`  FORMED seed=${m.seed} d${m.day} caller=${m.caller} leader=${m.vid} ally=${m.joinedAllyVid} fed=${JSON.stringify(m.allyVids)} outcome=${m.outcome} rounds=${m.rounds} mDealt=${m.mDealt} vTaken=${m.vTaken} allyDealt=${m.allyDealt}`);
  }
  for (const m of fedUnanswered) {
    console.log(`  FED-BUT-UNANSWERED seed=${m.seed} d${m.day} caller=${m.caller} leader=${m.vid} earshot=${JSON.stringify((m.earshot || []).map(e => e.vid + ':t' + e.trust + (e.armed ? ':armed' : '')))} outcome=${m.outcome}`);
  }
  console.log(`field kills by channel (wave-4 meetings): ${JSON.stringify(killsByChannel)}`);
  console.log(`field deaths by channel (wave-4 meetings): ${JSON.stringify(deathsByChannel)}`);
  console.log(`party outcomes (formed): ${JSON.stringify(partyOutcomes)}`);
  console.log(`wall: natEver=${wall.nationalEver}/${wall.n} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wins=${wall.wins} wave4=${wall.wave4} wave5=${wall.wave5} medianDays=${wall.medianDays} deaths=${wall.deaths} starvation=${wall.starvation}`);
  console.log(`wall control (1528Z): natEver=${CONTROL.nationalEver}/8 natFinal=${CONTROL.nationalFinal} table=${CONTROL.table} entered=${CONTROL.entered} wins=${CONTROL.wins} wave4=${CONTROL.wave4} wave5=${CONTROL.wave5} medianDays=${CONTROL.medianDays} deaths=${CONTROL.deaths} starvation=${CONTROL.starvation}`);
  if (MODE === 'control') {
    console.log(`CONTROL-CENSUS: ${censusValid ? 'VALID' : 'INVALID'}`);
    process.exit(censusValid ? 0 : 1);
  }
  const primaryPass = formed.length >= 1;
  const guardMedian = wall.medianDays >= 117;
  const guardStarv = wall.starvation <= 2;
  const guardWave5 = true; // wave 5 is not the metric; reported, never claimed
  const go = censusValid && primaryPass && guardMedian && guardStarv && guardWave5;
  console.log(`PRIMARY formed>=1: ${formed.length} -> ${primaryPass ? 'PASS' : 'FAIL'}`);
  console.log(`GUARD median>=117d: ${wall.medianDays} -> ${guardMedian ? 'PASS' : 'FAIL'}`);
  console.log(`GUARD starvation<=2: ${wall.starvation} -> ${guardStarv ? 'PASS' : 'FAIL'}`);
  console.log(`GUARD wave5-not-claimed: wave5=${wall.wave5} (reported only) -> PASS`);
  console.log(`VERDICT: ${go ? 'GO' : 'NO-GO'} (censusValid=${censusValid} primary=${primaryPass} guards=${guardMedian && guardStarv})`);
  process.exit(go ? 0 : 1);
}
if (require.main === module) main();
