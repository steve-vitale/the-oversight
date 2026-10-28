#!/usr/bin/env node
// scripts/test-shoutgate-a.js — sim-shoutgate-a analyzer / verdict judge.
// Reads the sweep corpus (evidence/2026-10-28/perseed-shoutgate-a/
// s<seed>-<pid>.json, pid via PID env, default armed), classifies the
// judged set (identical to outdoorcrew-a), and prints the binding
// verdict legs from the prereg
// (evidence/2026-10-28/sim-shoutgate-a-prereg.md).
// Pure reads; never mutates game state. Exit 1 on corpus invalidity;
// exit 0 otherwise, with the verdict printed (GO / NO-GO /
// INSUFFICIENT-OPPORTUNITY are data, not exit codes).
//
// Judged set: wave 4, channel field, caller resolve/patrol/aid,
// leader a villager (not the scholar). Per meeting:
//   CREWED  = filtered crew non-empty (crewRaw minus the leader).
//   FORMED  = CREWED and calledHelp true OR joinedAllyVid non-null.
//   FORMED-STRUCK = FORMED and allyDealt > 0.
//   NON-RETREATING = FORMED-STRUCK and outcome in {vKill, mFlee}.
//   FED-NO-SHOUT = CREWED and not FORMED, split by fight-end round
//     (1 / 2 / 3+) x everHopeless (true/false).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-shoutgate-a');
const PID = process.env.PID || 'armed';
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadBand(pid) {
  const rows = []; const problems = [];
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-${pid}.json`);
    if (!fs.existsSync(p)) { problems.push(`missing s${seed}-${pid}.json`); continue; }
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(r);
    if (!r.fieldparty || !Array.isArray(r.fieldparty.meetings)) problems.push(`seed ${seed}: no fieldparty meetings`);
    else if (r.fieldparty.diag.errs !== 0 || Object.values(r.fieldparty.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed}: recorder errs/overflow`);
    if (!(r.days > 0)) problems.push(`seed ${seed}: days<=0`);
  }
  return { rows, problems };
}
function analyze(rows) {
  const meetings = [];
  for (const r of rows) for (const m of ((r.fieldparty || {}).meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const isJudged = (m) => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0
    && !(m.leader && m.leader.isScholar);
  const judged = meetings.filter(isJudged);
  const crewOf = (m) => ((m.crewRaw || []).filter(v => v !== m.vid));
  const crewed = judged.filter(m => crewOf(m).length > 0);
  const formed = judged.filter(m => crewOf(m).length > 0 && (m.calledHelp || m.joinedAllyVid));
  const formedStruck = formed.filter(m => (m.allyDealt | 0) > 0);
  const nonRet = formedStruck.filter(m => m.outcome === 'vKill' || m.outcome === 'mFlee');
  const fieldKills = judged.filter(m => m.outcome === 'vKill');
  const fedNoShout = crewed.filter(m => !(m.calledHelp || m.joinedAllyVid));
  const fnsSplit = {};
  for (const m of fedNoShout) {
    const r = (m.rounds | 0) <= 1 ? 'R1' : ((m.rounds | 0) === 2 ? 'R2' : 'R3+');
    const h = m.everHopeless ? 'hopeless' : 'neverHopeless';
    fnsSplit[r + '/' + h] = (fnsSplit[r + '/' + h] || 0) + 1;
  }
  const fnsByRound = {};
  for (const m of fedNoShout) { const r = (m.rounds | 0) <= 1 ? 'R1' : ((m.rounds | 0) === 2 ? 'R2' : 'R3+'); fnsByRound[r] = (fnsByRound[r] || 0) + 1; }
  const fnsByHopeless = { hopeless: fedNoShout.filter(m => m.everHopeless).length, neverHopeless: fedNoShout.filter(m => !m.everHopeless).length };
  const outcomes = {};
  for (const m of judged) outcomes[m.outcome || 'null'] = (outcomes[m.outcome || 'null'] || 0) + 1;
  const allCrewed = meetings.filter(m => crewOf(m).length > 0);
  const w3 = meetings.filter(m => (m.wave | 0) === 3 && m.channel === 'field');
  const w3Formed = w3.filter(m => crewOf(m).length > 0 && (m.calledHelp || m.joinedAllyVid));
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: 0,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; if (r.won && st === 'full') band.wonFull++; }
  return { meetings, judged, crewed, formed, formedStruck, nonRet, fieldKills, fedNoShout, fnsSplit, fnsByRound, fnsByHopeless, outcomes, allCrewed, w3, w3Formed, band };
}
function main() {
  const { rows, problems } = loadBand(PID);
  const corpusOk = problems.length === 0 && rows.length === SEEDS.length;
  const a = analyze(rows);
  const guardsPass = a.band.medianDays >= 120 && a.band.starvationTotal <= 3;
  const primaryPass = a.nonRet.length >= 1 || a.fieldKills.length >= 1;
  let verdict = 'NO-GO'; let sub = '';
  if (!corpusOk) { verdict = 'CORPUS-INVALID'; }
  else if (a.judged.length < 4) { verdict = 'INSUFFICIENT-OPPORTUNITY'; sub = ` (judged=${a.judged.length} < 4: band under-powered, neither GO nor NO-GO)`; }
  else if (primaryPass && guardsPass) { verdict = 'GO'; sub = ' (pilot GO; confirm band required for LAND)'; }
  else if (primaryPass && !guardsPass) { verdict = 'NO-GO'; sub = ' (primary passed, guard failed)'; }
  else if (a.fedNoShout.length > 0 && a.formed.length === 0) { verdict = 'NO-GO'; sub = ' (FED-NO-SHOUT: crew fed, shout never fired)'; }
  else { verdict = 'NO-GO'; sub = ' (primary 0: formed parties retreated or never formed)'; }
  console.log('=== sim-shoutgate-a analyzer ===');
  console.log(`corpus: pid=${PID} rows=${rows.length}/${SEEDS.length} ok=${corpusOk} ${problems.join('; ')}`);
  console.log(`meetings: all=${a.meetings.length} judged(w4 field resolve/patrol/aid, villager-led)=${a.judged.length}`);
  console.log(`PRIMARY: NON-RETREATING=${a.nonRet.length} FIELD-KILLS=${a.fieldKills.length} (GO>=1 of either) ${primaryPass ? 'PASS' : 'FAIL'}`);
  console.log(`MECHANISM: CREWED judged=${a.crewed.length} FORMED=${a.formed.length} FORMED-STRUCK=${a.formedStruck.length} CREWED all-waves=${a.allCrewed.length}`);
  console.log(`FED-NO-SHOUT: n=${a.fedNoShout.length} byRound=${JSON.stringify(a.fnsByRound)} byHopeless=${JSON.stringify(a.fnsByHopeless)} split=${JSON.stringify(a.fnsSplit)}`);
  console.log(`SECONDARY: outcomes=${JSON.stringify(a.outcomes)} wave3 field n=${a.w3.length} formed=${a.w3Formed.length}`);
  console.log(`WALL: won=${a.band.won} (full=${a.band.wonFull}) natEver=${a.band.nationalEver} natFinal=${a.band.nationalFinal} table=${a.band.table} entered=${a.band.entered} wave4=${a.band.wave4} wave5=${a.band.wave5} median=${a.band.medianDays} (guard>=120 ${a.band.medianDays >= 120 ? 'PASS' : 'FAIL'}) starv=${a.band.starvationTotal} (guard<=3 ${a.band.starvationTotal <= 3 ? 'PASS' : 'FAIL'}) deaths=${a.band.deathTotal}`);
  console.log(`GUARDS: ${guardsPass ? 'PASS' : 'FAIL'}`);
  console.log('PER-SEED:');
  for (const r of rows) {
    const jm = a.judged.filter(m => m.seed === r.seed);
    const jf = a.formed.filter(m => m.seed === r.seed);
    const jc = a.crewed.filter(m => m.seed === r.seed);
    const jn = a.nonRet.filter(m => m.seed === r.seed);
    console.log(`  s${r.seed} days=${r.days} won=${r.won} wave=${r.waveReach} judged=${jm.length} crewed=${jc.length} formed=${jf.length} nonRet=${jn.length} starv=${r.starvationDeaths} deaths=${r.deathTotal}`);
  }
  if (a.formed.length) {
    console.log('FORMED MEETINGS:');
    for (const m of a.formed) console.log(`  s${m.seed} d${m.day} leader=${m.vid} monster=${m.mid} caller=${m.caller} crew=${JSON.stringify(crewOfShim(m))} joined=${m.joinedAllyVid} calledHelp=${m.calledHelp} outcome=${m.outcome} rounds=${m.rounds} intent=${m.intent} everHopeless=${m.everHopeless} allyDealt=${m.allyDealt}`);
  }
  if (a.fedNoShout.length) {
    console.log('FED-NO-SHOUT MEETINGS:');
    for (const m of a.fedNoShout) console.log(`  s${m.seed} d${m.day} leader=${m.vid} monster=${m.mid} caller=${m.caller} outcome=${m.outcome} rounds=${m.rounds} intent=${m.intent} everHopeless=${m.everHopeless} calledHelp=${m.calledHelp} joined=${m.joinedAllyVid}`);
  }
  // Control comparison, when control rows exist alongside.
  if (PID === 'armed') {
    const c = loadBand('control');
    if (c.problems.length === 0 && c.rows.length === SEEDS.length) {
      const ca = analyze(c.rows);
      console.log(`CONTROL (substrate+base gate): judged=${ca.judged.length} crewed=${ca.crewed.length} formed=${ca.formed.length} nonRet=${ca.nonRet.length} fieldKills=${ca.fieldKills.length} fedNoShout=${ca.fedNoShout.length} median=${ca.band.medianDays} starv=${ca.band.starvationTotal} deaths=${ca.band.deathTotal} won=${ca.band.won} natEver=${ca.band.nationalEver} natFinal=${ca.band.nationalFinal} entered=${ca.band.entered} wave4=${ca.band.wave4} wave5=${ca.band.wave5}`);
    } else {
      console.log(`CONTROL: unavailable (${c.problems.join('; ')})`);
    }
  }
  console.log(`VERDICT: ${verdict}${sub}`);
  if (!corpusOk) process.exit(1);
  function crewOfShim(m) { return (m.crewRaw || []).filter(v => v !== m.vid); }
}
main();
