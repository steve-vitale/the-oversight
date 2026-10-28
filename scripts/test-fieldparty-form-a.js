#!/usr/bin/env node
// scripts/test-fieldparty-form-a.js — sim-fieldparty-form-a analyzer / proof validator.
// Reads evidence/2026-10-28/perseed-fieldparty-form-a/s*-armed.json, classifies
// every wave-4 field meeting per the prereg (evidence/2026-10-28/
// sim-fieldparty-form-a-prereg.md), joins same-seq later meetings, checks
// parity vs the 1415Z demand corpus, and prints the DIAG-GO legs.
// Exit 0 on DIAG-GO census legs, 1 otherwise. The detgate result is NOT
// re-derived here (the sweep prints it); the evidence file records it.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-28', 'perseed-fieldparty-form-a');
const DEMAND_DIR = path.join(REPO, 'evidence', '2026-10-28', 'perseed-wave4demand-a');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];

function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
function isLiving(m) { return m && m.deadKnown !== true; }
function crewArmed(meeting) {
  return (meeting.crew || []).filter(m => isLiving(m) && m.armed === true);
}
function tileArmed(meeting) {
  return (meeting.tile || []).filter(m => isLiving(m) && m.armed === true);
}
// Prereg classification, applied in prereg order. TILE-ONLY is a sub-flag
// of NO-CREW (it requires NO-CREW), not a competing class.
function classify(m) {
  if (m.calledHelp && m.joinedAllyVid) {
    return m.allyFromStart ? 'JOINED-FROM-START' : 'JOINED-BY-SHOUT';
  }
  if ((m.engineAllies | 0) > 0) {
    let sub = null;
    if (m.intent === 'learn') sub = 'LEARN-PREEMPT';
    else if (!m.everHopeless) sub = 'NEVER-HOPELESS';
    else sub = 'HOPELESS-UNEXPLAINED';
    if (crewArmed(m).length === 0 && (m.crew || []).length > 0) sub = 'CREW-UNARMED+' + sub;
    return 'NAMED-NOT-FOUGHT:' + sub;
  }
  const crew = (m.crew || []).filter(isLiving);
  if (crew.length === 0) {
    const rawEmpty = !(m.crewRaw || []).length;
    const tileOnly = tileArmed(m).length >= 1;
    return 'NO-CREW:' + (rawEmpty ? 'RAW-EMPTY' : 'FILTERED-OUT') + (tileOnly ? '+TILE-ONLY' : '+TILE-EMPTY');
  }
  return 'UNCLASSIFIED:CREW-NONEMPTY-NO-ALLIES';
}

function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(DIR, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.log(`MISSING ROW seed=${seed}`); continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const allMeetings = [];
  for (const r of rows) {
    const ms = (r.fieldparty && r.fieldparty.meetings) || [];
    ms.forEach((m, i) => allMeetings.push(Object.assign({ seed: r.seed, idx: i }, m)));
  }
  const isJudged = (m) => m.wave === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0
    && !(m.leader && m.leader.isScholar);
  const isJudgedLiteral = (m) => m.wave === 4 && m.channel === 'field'
    && ['resolve', 'patrol'].indexOf(m.caller) >= 0
    && !(m.leader && m.leader.isScholar);
  const judged = allMeetings.filter(isJudged);
  const judgedLiteral = allMeetings.filter(isJudgedLiteral);
  const wave3 = allMeetings.filter(m => m.wave === 3 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
  const raid = allMeetings.filter(m => m.wave === 4 && m.channel === 'raid');
  const other = allMeetings.filter(m => m.wave === 4 && !isJudged(m) && m.channel !== 'raid');

  const table = {};
  for (const m of judged) {
    const c = classify(m);
    const base = c.split(':')[0];
    table[base] = (table[base] || 0) + 1;
    table[c] = (table[c] || 0) + 1;
    m.class = c;
    m.couldForm = crewArmed(m).length >= 1;
    m.tileCouldForm = tileArmed(m).length >= 1;
    m.formed = !!(m.calledHelp && m.joinedAllyVid);
  }
  const could = judged.filter(m => m.couldForm);
  const formed = judged.filter(m => m.formed);
  const formedCould = could.filter(m => m.formed);
  const unclassified = judged.filter(m => classify(m).indexOf('UNCLASSIFIED') === 0);
  const fought = judged.filter(m => m.outcome !== 'evade' && m.outcome !== 'alreadyDead');
  const foughtCould = fought.filter(m => m.couldForm);
  const foughtFormedCould = foughtCould.filter(m => m.formed);

  // Same-seq later meetings (judged + raid + other, wave 4, same seed+seq).
  const bySeq = {};
  for (const m of allMeetings.filter(x => x.wave === 4 && x.seq != null)) {
    const k = m.seed + ':' + m.seq;
    (bySeq[k] = bySeq[k] || []).push(m);
  }
  const seqGroups = Object.values(bySeq).filter(g => g.length > 1);
  let laterFormed = 0;
  for (const g of seqGroups) {
    g.sort((a, b) => (a.day - b.day) || (a.part - b.part) || (a.idx - b.idx));
    if (g.slice(1).some(x => x.calledHelp && x.joinedAllyVid)) laterFormed++;
  }
  const firstMeetings = Object.values(bySeq).map(g => {
    g.sort((a, b) => (a.day - b.day) || (a.part - b.part) || (a.idx - b.idx));
    return g[0];
  });

  const wall = {
    n: rows.length,
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver | 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal | 0), 0),
    table: rows.reduce((t, r) => t + (r.table | 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered | 0), 0),
    won: rows.reduce((t, r) => t + (r.won | 0), 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    deaths: rows.reduce((t, r) => t + (r.deathTotal | 0), 0),
    days: rows.map(r => r.days),
  };
  // Parity vs demand corpus summary + per-seed rows.
  let parity = null;
  try {
    const ds = JSON.parse(fs.readFileSync(path.join(DEMAND_DIR, 'summary.json'), 'utf8'));
    const perSeed = [];
    for (const seed of SEEDS) {
      const dr = JSON.parse(fs.readFileSync(path.join(DEMAND_DIR, `s${seed}-armed.json`), 'utf8'));
      const mr = rows.find(r => r.seed === seed);
      perSeed.push({
        seed, match: !!mr && ['days', 'won', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'waveReach']
          .every(k => (mr[k] | 0) === (dr[k] | 0) || mr[k] === dr[k]),
        mine: mr ? { days: mr.days, won: mr.won, natEver: mr.nationalEver, natFinal: mr.nationalFinal, table: mr.table, entered: mr.entered, deaths: mr.deathTotal, wave: mr.waveReach, court: mr.courtship && mr.courtship.combined } : null,
        demand: { days: dr.days, won: dr.won, natEver: dr.nationalEver, natFinal: dr.nationalFinal, table: dr.table, entered: dr.entered, deaths: dr.deathTotal, wave: dr.waveReach, court: dr.courtship && dr.courtship.combined },
      });
    }
    parity = { demandBand: ds.band, perSeed, allMatch: perSeed.every(x => x.match) };
  } catch (e) { parity = { error: String((e && e.message) || e).slice(0, 200) }; }

  const errs = rows.reduce((t, r) => t + (((r.fieldparty && r.fieldparty.diag && r.fieldparty.diag.errs) | 0)), 0);
  const perSeedJudged = {};
  for (const seed of SEEDS) perSeedJudged[seed] = judged.filter(m => m.seed === seed).length;
  const senseSeed = SEEDS.slice().sort((a, b) => perSeedJudged[b] - perSeedJudged[a])[0];

  const legs = {
    censusComplete: rows.length === 8 && rows.every(r => r.days > 0),
    recorderErrs: errs,
    unclassified: unclassified.length,
    couldFormN: could.length,
    formedN: formed.length,
    parityAllMatch: parity ? !!parity.allMatch : false,
  };
  const go = legs.censusComplete && errs === 0 && unclassified.length === 0
    && judged.length > 0 && parity.allMatch !== false;
  console.log('=== sim-fieldparty-form-a analyzer ===');
  console.log(`rows=${rows.length} meetingsTotal=${allMeetings.length} judgedW4=${judged.length} judgedLiteral(resolve+patrol)=${judgedLiteral.length} aidCaller=${judged.filter(m => m.caller === 'aid').length} wave3contrast=${wave3.length} raidW4=${raid.length} otherW4=${other.length}`);
  console.log(`perSeedJudged=${JSON.stringify(perSeedJudged)} senseSeed=${senseSeed}`);
  console.log(`classification=${JSON.stringify(table)}`);
  console.log(`couldForm=${could.length}/${judged.length} formed=${formed.length}/${judged.length} FORMATION-ON-COULD-FORM=${formedCould.length}/${could.length} tileCouldForm=${judged.filter(m => m.tileCouldForm).length}/${judged.length}`);
  console.log(`foughtOnly: fought=${fought.length} foughtCould=${foughtCould.length} foughtFormedCould=${foughtFormedCould.length}`);
  console.log(`wall: natEver=${wall.nationalEver}/8 natFinal=${wall.nationalFinal}/8 table=${wall.table}/8 entered=${wall.entered}/8 won=${wall.won}/8 wave4=${wall.wave4}/8 wave5=${wall.wave5}/8 medianDays=${wall.medianDays} deaths=${wall.deaths} days=${JSON.stringify(wall.days)}`);
  console.log(`sameSeqGroups=${seqGroups.length} groupsWithLaterFormed=${laterFormed} distinctSeqs=${Object.keys(bySeq).length}`);
  console.log(`recorderErrs=${errs} unclassified=${unclassified.length} parityAllMatch=${parity.allMatch}`);
  if (parity.perSeed) for (const p of parity.perSeed) console.log(`  parity seed=${p.seed} match=${p.match} mine=${JSON.stringify(p.mine)} demand=${JSON.stringify(p.demand)}`);
  console.log(`LEGS censusComplete=${legs.censusComplete} errs=${errs} unclassified=${unclassified.length} -> ${go ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  const analysis = {
    judged: judged, wave3contrast: wave3, raidW4: raid, otherW4: other,
    classification: table, couldFormN: could.length, formedN: formed.length,
    formedOnCould: formedCould.length, tileCouldN: judged.filter(m => m.tileCouldForm).length,
    fought: { n: fought.length, could: foughtCould.length, formedCould: foughtFormedCould.length },
    wall, parity, legs, verdict: go ? 'DIAG-GO' : 'DIAG-NO-GO',
    senseSeed, perSeedJudged, sameSeqGroups: seqGroups.length, laterFormedGroups: laterFormed,
    generated: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(DIR, 'analysis.json'), JSON.stringify(analysis, null, 1) + '\n');
  if (!go) process.exit(1);
}
main();
