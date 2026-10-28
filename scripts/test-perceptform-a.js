#!/usr/bin/env node
// scripts/test-perceptform-a.js — sim-perceptform-a analyzer / verdict
// judge. Reads a sweep corpus (evidence/2026-10-28/perseed-
// perceptform-a/s<seed>-<band>.json, BAND env, default armed), with
// the control corpus under CEVID for guard bars (default: the same
// directory, band control).
//
// Judged set: wave 4, channel field, caller resolve/patrol/aid,
// leader a villager (not the scholar). Per meeting:
//   STAMP-PARTNERS = recorder stamp.partners for the leader.
//   PERCEIVED-PRESENT = a stamp partner with sameTileAsMonster.
//   PARTY-AT-START-PERCEIVED = allyFromStart AND joinedAllyVid is a
//     same-tile stamp partner (same outing + same tile + same person).
//   AUDIT-FAIL = allyFromStart with a joined ally that is NOT a
//     same-tile stamp partner (a from-start join sourced from
//     anything but a seen outing partner — mechanism invalid).
//   CREW-TILE (comparison only, earlycrew definition) = a tile entry
//     that is also in crewRaw.
//   FOUGHT-AS-PARTY = calledHelp AND joinedAllyVid (strict, as
//     earlycrew-a).
// Modes (MODE env): 'verdict' (prereg verdict for BAND vs control)
// or 'gate' (control gate: every judged meeting solo, field kills 0).
// Exit 1 on corpus invalidity; verdict/gate printed (data, not exit
// codes, except corpus invalidity).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-perceptform-a');
const BAND = process.env.BAND || 'armed';
const CEVID = process.env.CEVID || EVID;
const MODE = process.env.MODE || 'verdict';
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadBand(dir, band) {
  const rows = [];
  const problems = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, `s${seed}-${band}.json`);
    if (!fs.existsSync(p)) { problems.push(`missing s${seed}-${band}.json`); continue; }
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(r);
    if (!r.fieldparty || !Array.isArray(r.fieldparty.meetings)) problems.push(`seed ${seed}: no fieldparty meetings`);
    else if (r.fieldparty.diag.errs !== 0 || Object.values(r.fieldparty.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed}: recorder errs/overflow`);
    if (!(r.days > 0)) problems.push(`seed ${seed}: days<=0`);
  }
  return { rows, problems };
}
function meetingsOf(rows) {
  const out = [];
  for (const r of rows) for (const m of ((r.fieldparty || {}).meetings || [])) out.push(Object.assign({ seed: r.seed }, m));
  return out;
}
function isJudged(m) {
  return (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0
    && !(m.leader && m.leader.isScholar);
}
function stampPartners(m) { return ((m.stamp && m.stamp.partners) || []); }
function perceivedPresent(m) { return stampPartners(m).filter(p => p.sameTileAsMonster); }
function partyAtStartPerceived(m) {
  if (!m.allyFromStart || !m.joinedAllyVid) return false;
  return perceivedPresent(m).some(p => p.vid === m.joinedAllyVid);
}
function auditFail(m) {
  if (!m.allyFromStart) return false;
  if (!m.joinedAllyVid) return false;
  return !partyAtStartPerceived(m);
}
function crewTile(m) {
  const crew = new Set((m.crewRaw || []).map(String));
  return (m.tile || []).filter(t => crew.has(String(t.vid)));
}
function wallOf(rows) {
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  const deaths = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deaths[k] = (deaths[k] || 0) + v;
  return {
    won: rows.reduce((t, r) => t + r.won, 0), seats,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    deaths,
  };
}
function main() {
  const { rows, problems } = loadBand(EVID, BAND);
  const corpusOk = problems.length === 0 && rows.length === SEEDS.length;
  const meetings = meetingsOf(rows);
  const judged = meetings.filter(isJudged);
  const perceived = judged.filter(m => perceivedPresent(m).length > 0);
  const fromStartPerceived = judged.filter(partyAtStartPerceived);
  const fromStartAny = judged.filter(m => m.allyFromStart && m.joinedAllyVid);
  const auditFails = judged.filter(auditFail);
  const fought = judged.filter(m => m.calledHelp && m.joinedAllyVid);
  const fieldKills = judged.filter(m => m.outcome === 'vKill');
  const crewTileMeetings = judged.filter(m => crewTile(m).length > 0);
  const outcomes = {};
  for (const m of judged) outcomes[m.outcome || 'null'] = (outcomes[m.outcome || 'null'] || 0) + 1;
  const wall = wallOf(rows);
  let ctl = null, ctlWall = null, ctlJudged = [];
  if (MODE === 'verdict' && BAND !== 'control') {
    const c = loadBand(CEVID, 'control');
    if (c.problems.length === 0 && c.rows.length === SEEDS.length) {
      ctl = c.rows; ctlWall = wallOf(c.rows); ctlJudged = meetingsOf(c.rows).filter(isJudged);
    }
  }
  const guards = ctlWall ? {
    medianBar: 0.8 * ctlWall.medianDays,
    medianPass: wall.medianDays >= 0.8 * ctlWall.medianDays,
    starvBar: ctlWall.starvationTotal + 2,
    starvPass: wall.starvationTotal <= ctlWall.starvationTotal + 2,
  } : null;
  const floorMet = judged.length >= 4;
  const primaryPass = (fromStartPerceived.length >= 2 || fieldKills.length >= 1);
  let verdict = 'NO-GO', sub = '';
  if (MODE === 'gate') {
    if (!corpusOk) { verdict = 'CORPUS-INVALID'; }
    else if (fromStartAny.length === 0 && fought.length === 0 && fieldKills.length === 0) verdict = 'GATE-PASS';
    else { verdict = 'GATE-FAIL'; sub = ` (fromStart=${fromStartAny.length} fought=${fought.length} kills=${fieldKills.length} — control does NOT reproduce the all-solo shape)`; }
  } else {
    if (!corpusOk) verdict = 'CORPUS-INVALID';
    else if (!floorMet) { verdict = 'INSUFFICIENT-OPPORTUNITY'; sub = ` (judged=${judged.length} < 4)`; }
    else if (auditFails.length > 0) { verdict = 'NO-GO'; sub = ' (MECHANISM-INVALID: from-start join(s) failing the perception audit)'; }
    else if (primaryPass && guards && guards.medianPass && guards.starvPass) { verdict = 'GO'; sub = ' (pilot GO; confirm band required for LAND)'; }
    else if (primaryPass && guards && (!guards.medianPass || !guards.starvPass)) { verdict = 'NO-GO'; sub = ' (primary passed, guard failed)'; }
    else if (perceived.length === 0) { verdict = 'NO-GO'; sub = ' (NO-PERCEPTION-OPPORTUNITY: no judged meeting had a same-tile stamp partner)'; }
    else { verdict = 'NO-GO'; sub = ' (PERCEIVED-NO-FIGHT: perceived allies present, no from-start party)'; }
  }
  console.log('=== sim-perceptform-a analyzer (band=' + BAND + ' mode=' + MODE + ') ===');
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk} ${problems.join('; ')}`);
  console.log(`meetings: all=${meetings.length} judged(w4 field resolve/patrol/aid, villager-led)=${judged.length}`);
  console.log(`PRIMARY: PARTY-AT-START-PERCEIVED=${fromStartPerceived.length} fieldKills=${fieldKills.length} (GO: >=2 perceived-from-start OR >=1 kill) ${primaryPass ? 'PASS' : 'FAIL'} | FLOOR: judged=${judged.length} (>=4 ${floorMet ? 'MET' : 'NOT MET'})`);
  console.log(`PERCEPTION: perceived-present meetings=${perceived.length} fromStartAny=${fromStartAny.length} auditFails=${auditFails.length} crewTileMeetings=${crewTileMeetings.length} fought=${fought.length}`);
  console.log(`OUTCOMES judged: ${JSON.stringify(outcomes)}`);
  if (ctlWall) console.log(`CONTROL (same seeds): judged=${ctlJudged.length} median=${ctlWall.medianDays} starv=${ctlWall.starvationTotal} natEver=${ctlWall.nationalEver} natFinal=${ctlWall.nationalFinal} table=${ctlWall.table} entered=${ctlWall.entered} won=${ctlWall.won} wave4=${ctlWall.wave4} wave5=${ctlWall.wave5}`);
  if (guards) console.log(`GUARDS: median ${wall.medianDays} vs bar ${guards.medianBar} (${guards.medianPass ? 'PASS' : 'FAIL'}); starvation ${wall.starvationTotal} vs bar ${guards.starvBar} (${guards.starvPass ? 'PASS' : 'FAIL'})`);
  console.log(`WALL: won=${wall.won} seats=${JSON.stringify(wall.seats)} natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal}`);
  console.log(`DEATHS: ${JSON.stringify(wall.deaths)}`);
  console.log('PER-SEED:');
  for (const r of rows) {
    const jm = judged.filter(m => m.seed === r.seed);
    const jp = fromStartPerceived.filter(m => m.seed === r.seed);
    const jperc = perceived.filter(m => m.seed === r.seed);
    console.log(`  s${r.seed} days=${r.days} won=${r.won} wave=${r.waveReach} judged=${jm.length} perceivedPresent=${jperc.length} fromStartPerceived=${jp.length} ecPairs=${(r.ec && r.ec.ecPairs) | 0} ecAssigned=${(r.ec && r.ec.ecAssigned) | 0} starv=${r.starvationDeaths} deaths=${r.deathTotal}`);
  }
  if (fromStartPerceived.length) {
    console.log('COUNTED PARTY-AT-START-PERCEIVED MEETINGS (audit detail):');
    for (const m of fromStartPerceived) {
      const p = perceivedPresent(m).find(x => x.vid === m.joinedAllyVid);
      console.log(`  s${m.seed} d${m.day} leader=${m.vid} partner=${m.joinedAllyVid} monster=${m.mid} caller=${m.caller} stamp={day:${m.stamp && m.stamp.day},part:${m.stamp && m.stamp.part},task:${m.stamp && m.stamp.task}} mTile=${JSON.stringify(m.mTile)} partnerNode=${p ? JSON.stringify(p.node) : 'null'} outcome=${m.outcome} rounds=${m.rounds} leaderGear=${JSON.stringify(m.leader)} allyDealt=${m.allyDealt} mDealt=${m.mDealt}`);
      const tp = (m.tile || []).find(t => String(t.vid) === String(m.joinedAllyVid));
      if (tp) console.log(`    partner gear on tile: armed=${tp.armed} armorP=${tp.armorP} veteranW3=${tp.veteranW3}`);
    }
  }
  if (perceived.length && !fromStartPerceived.length) {
    console.log('PERCEIVED-PRESENT BUT UNJOINED (why no from-start):');
    for (const m of perceived) console.log(`  s${m.seed} d${m.day} leader=${m.vid} monster=${m.mid} caller=${m.caller} perceivedPartners=${JSON.stringify(perceivedPresent(m).map(p => p.vid))} allyFromStart=${!!m.allyFromStart} joined=${m.joinedAllyVid} calledHelp=${m.calledHelp} outcome=${m.outcome} rounds=${m.rounds} intent=${m.intent} everHopeless=${m.everHopeless}`);
  }
  if (auditFails.length) {
    console.log('AUDIT-FAILING FROM-START MEETINGS:');
    for (const m of auditFails) console.log(`  s${m.seed} d${m.day} leader=${m.vid} joined=${m.joinedAllyVid} stamp=${JSON.stringify(m.stamp)} tile=${JSON.stringify((m.tile || []).map(t => t.vid))} crewRaw=${JSON.stringify(m.crewRaw)}`);
  }
  console.log(`VERDICT: ${verdict}${sub}`);
  if (!corpusOk) process.exit(1);
}
main();
