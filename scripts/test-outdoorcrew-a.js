#!/usr/bin/env node
// scripts/test-outdoorcrew-a.js — sim-outdoorcrew-a analyzer / verdict
// judge. Reads the sweep corpus (evidence/2026-10-28/perseed-
// outdoorcrew-a/s<seed>-armed.json, or --summary's summary.json via
// EVID), classifies the judged set, and prints the binding verdict
// legs from the prereg (evidence/2026-10-28/sim-outdoorcrew-a-prereg.md).
// Pure reads; never mutates game state. Exit 1 on corpus invalidity
// (missing rows, recorder errors/overflow); exit 0 otherwise, with
// the verdict printed (GO / NO-GO / DIAG-NO-GO are data, not exit
// codes — the evidence file judges them).
//
// Judged set: wave 4, channel field, caller resolve/patrol/aid,
// leader a villager (not the scholar). Per meeting:
//   CREWED  = filtered crew non-empty (crewRaw minus the leader —
//             the engine's own filter; raw crewRaw count reported
//             alongside, never merged).
//   FORMED  = CREWED and a second fighter actually fights
//             (calledHelp true OR joinedAllyVid non-null).
//   PARTYSIZE2 = engineAllies >= 1 (engine party count, secondary).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-outdoorcrew-a');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const CONTROL = { medianDays: 146, starvation: 1, nationalEver: 7, nationalFinal: 6, table: 4, entered: 3, wins: 3, wave4: 6, wave5: 0, deaths: 286, crewNonempty: 0, meetingsAll: 1272 };
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function main() {
  const rows = [];
  let corpusOk = true;
  const corpusProblems = [];
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { corpusOk = false; corpusProblems.push(`missing s${seed}-armed.json`); continue; }
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(r);
    if (!r.fieldparty || !Array.isArray(r.fieldparty.meetings)) { corpusOk = false; corpusProblems.push(`seed ${seed}: no fieldparty meetings`); }
    else if (r.fieldparty.diag.errs !== 0 || Object.values(r.fieldparty.diag.overflow || {}).some(v => (v | 0) !== 0)) { corpusOk = false; corpusProblems.push(`seed ${seed}: recorder errs/overflow`); }
    if (!(r.days > 0)) { corpusOk = false; corpusProblems.push(`seed ${seed}: days<=0`); }
  }
  const meetings = [];
  for (const r of rows) for (const m of ((r.fieldparty || {}).meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const isJudged = (m) => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0
    && !(m.leader && m.leader.isScholar);
  const judged = meetings.filter(isJudged);
  const crewOf = (m) => ((m.crewRaw || []).filter(v => v !== m.vid));
  const formed = judged.filter(m => crewOf(m).length > 0 && (m.calledHelp || m.joinedAllyVid));
  const crewed = judged.filter(m => crewOf(m).length > 0);
  const crewedRaw = judged.filter(m => (m.crewRaw || []).length > 0);
  const partySize2 = judged.filter(m => (m.engineAllies | 0) >= 1);
  const tileCould = judged.filter(m => (m.tile || []).some(t => t.armed));
  const allCrewed = meetings.filter(m => crewOf(m).length > 0);
  const allCrewedRaw = meetings.filter(m => (m.crewRaw || []).length > 0);
  const w3 = meetings.filter(m => (m.wave | 0) === 3 && m.channel === 'field');
  const w3Formed = w3.filter(m => crewOf(m).length > 0 && (m.calledHelp || m.joinedAllyVid));
  const outcomes = {};
  for (const m of judged) outcomes[m.outcome || 'null'] = (outcomes[m.outcome || 'null'] || 0) + 1;
  const byChannel = {};
  for (const m of meetings) {
    const k = `${m.channel || '?'}/${m.caller || '?'}`;
    byChannel[k] = byChannel[k] || { n: 0, vKill: 0, vDie: 0, vFlee: 0, mFlee: 0 };
    byChannel[k].n++;
    if (m.outcome && byChannel[k][m.outcome] !== undefined) byChannel[k][m.outcome]++;
  }
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    ocPairs: rows.reduce((t, r) => t + ((r.oc && r.oc.ocPairs) | 0), 0),
    ocAssigned: rows.reduce((t, r) => t + ((r.oc && r.oc.ocAssigned) | 0), 0),
    ocRefused: rows.reduce((t, r) => t + ((r.oc && r.oc.ocRefused) | 0), 0),
    ocSingles: rows.reduce((t, r) => t + ((r.oc && r.oc.ocSingles) | 0), 0),
    ocEmptyParts: rows.reduce((t, r) => t + ((r.oc && r.oc.ocEmptyParts) | 0), 0),
    ocUpkeeps: rows.reduce((t, r) => t + ((r.oc && r.oc.ocUpkeeps) | 0), 0),
  };
  const guardsPass = band.medianDays >= 117 && band.starvationTotal <= 2;
  const primaryPass = formed.length >= 1;
  let verdict = 'NO-GO';
  let sub = '';
  if (!corpusOk) { verdict = 'CORPUS-INVALID'; }
  else if (primaryPass && guardsPass) { verdict = 'GO'; sub = ' (pilot GO; confirm band required for LAND)'; }
  else if (primaryPass && !guardsPass) { verdict = 'NO-GO'; sub = ' (primary passed, guard failed)'; }
  else if (band.ocAssigned === 0) { verdict = 'DIAG-NO-GO'; sub = ' (crew path never fed from the policy side: ocAssigned 0)'; }
  else if (allCrewed.length === 0) { verdict = 'NO-GO'; sub = ' (UNFED: assignments made but snapshot never reaches meetings)'; }
  else { verdict = 'NO-GO'; sub = ' (FED-NO-FORM: crew fed, no shout ever answered)'; }
  console.log('=== sim-outdoorcrew-a analyzer ===');
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk} ${corpusProblems.join('; ')}`);
  console.log(`meetings: all=${meetings.length} judged(w4 field resolve/patrol/aid, villager-led)=${judged.length}`);
  console.log(`PRIMARY: FORMED=${formed.length} (GO>=1) ${primaryPass ? 'PASS' : 'FAIL'}`);
  console.log(`MECHANISM: CREWED judged=${crewed.length} raw=${crewedRaw.length}; CREWED all-waves=${allCrewed.length} raw=${allCrewedRaw.length} (control raw 0/1272)`);
  console.log(`SECONDARY: PARTYSIZE2 judged=${partySize2.length} tile-could-form=${tileCould.length} outcomes=${JSON.stringify(outcomes)}`);
  console.log(`CONTRAST wave-3 field: n=${w3.length} formed=${w3Formed.length}`);
  console.log(`OUTINGS: pairs=${band.ocPairs} singles=${band.ocSingles} assigned=${band.ocAssigned} refused=${band.ocRefused} emptyParts=${band.ocEmptyParts} upkeeps=${band.ocUpkeeps}`);
  console.log(`WALL: won=${band.won} (ctl ${CONTROL.wins}) natEver=${band.nationalEver} (ctl ${CONTROL.nationalEver}) natFinal=${band.nationalFinal} (ctl ${CONTROL.nationalFinal}) table=${band.table} (ctl ${CONTROL.table}) entered=${band.entered} (ctl ${CONTROL.entered}) wave4=${band.wave4} (ctl ${CONTROL.wave4}) wave5=${band.wave5} (ctl ${CONTROL.wave5}) median=${band.medianDays} (ctl ${CONTROL.medianDays}, guard>=117 ${band.medianDays >= 117 ? 'PASS' : 'FAIL'}) starv=${band.starvationTotal} (ctl ${CONTROL.starvation}, guard<=2 ${band.starvationTotal <= 2 ? 'PASS' : 'FAIL'}) deaths=${band.deathTotal} (ctl ${CONTROL.deaths})`);
  console.log(`GUARDS: ${guardsPass ? 'PASS' : 'FAIL'}`);
  console.log(`CHANNELS (all meetings): ${JSON.stringify(byChannel)}`);
  console.log('PER-SEED:');
  for (const r of rows) {
    const jm = judged.filter(m => m.seed === r.seed);
    const jf = formed.filter(m => m.seed === r.seed);
    const jc = crewed.filter(m => m.seed === r.seed);
    console.log(`  s${r.seed} days=${r.days} won=${r.won} wave=${r.waveReach} judged=${jm.length} crewed=${jc.length} formed=${jf.length} ocPairs=${(r.oc && r.oc.ocPairs) | 0} ocAssigned=${(r.oc && r.oc.ocAssigned) | 0} ocRefused=${(r.oc && r.oc.ocRefused) | 0} starv=${r.starvationDeaths} deaths=${r.deathTotal} courtCombined=${(r.courtship && r.courtship.combined) | 0}`);
  }
  if (formed.length) {
    console.log('FORMED MEETINGS:');
    for (const m of formed) console.log(`  s${m.seed} d${m.day} leader=${m.vid} monster=${m.mid} caller=${m.caller} crew=${JSON.stringify(crewOf(m))} allyVids=${JSON.stringify(m.allyVids)} joined=${m.joinedAllyVid} calledHelp=${m.calledHelp} outcome=${m.outcome} rounds=${m.rounds} intent=${m.intent} everHopeless=${m.everHopeless} mDealt=${m.mDealt} allyDealt=${m.allyDealt}`);
  }
  if (crewed.length && !formed.length) {
    console.log('CREWED-BUT-UNFORMED MEETINGS (why no shout):');
    for (const m of crewed) console.log(`  s${m.seed} d${m.day} leader=${m.vid} monster=${m.mid} caller=${m.caller} crew=${JSON.stringify(crewOf(m))} outcome=${m.outcome} rounds=${m.rounds} intent=${m.intent} everHopeless=${m.everHopeless} calledHelp=${m.calledHelp} joined=${m.joinedAllyVid}`);
  }
  console.log(`VERDICT: ${verdict}${sub}`);
  if (!corpusOk) process.exit(1);
}
main();
