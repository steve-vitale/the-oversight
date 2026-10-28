#!/usr/bin/env node
// scripts/test-w4tbkill.js — analyzer / proof validator for sim-w4tbkill-a.
// Reads two corpora (control + phase) from EVID_CONTROL / EVID_PHASE
// env (defaults: perseed-w4tbkill-control / perseed-w4tbkill-a), or a
// single corpus with --corpus <dir> for a construction-only report.
// Definitions are the prereg's, verbatim in spirit:
//  - wave-4 kill: waveKillLog entry w==4 in raftdraft.logEntries;
//    killerStatus killers' kills4 must agree (log count governs).
//  - won wave-4 TB fight: tbdmg tbEnd result 'won' joined by fightId
//    to a nonworldkill start with wave==4. 'routed' is NOT won.
//  - world-origin wave-4 TB fight: nonworldkill start wave==4 and
//    origin == 'world-origin'.
//  - construction check (phase B only, reported not judged as a
//    verdict leg): for world-origin wave-4 TB fights, primary
//    fighter start HP vs tile HP.
// Exit 0 only when both corpora are valid (rows, days>0, recorder
// errs 0, no overflow, substrate gate) — the GO/NO-GO verdict is
// PRINTED from the prereg rule; a NO-GO verdict still exits 0
// (it is a measurement result, not an instrument failure). Exit 1
// only on instrument/corpus failure or a kill-count disagreement.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadCorpus(dir) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, `s${seed}-armed.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}
function corpusValid(rows) {
  const errs = [];
  if (rows.length !== SEEDS.length) errs.push('row count');
  for (const r of rows) {
    if (!(r.days > 0)) errs.push(`seed ${r.seed} days`);
    for (const k of ['spawnsrc', 'raftdraft', 'oldcore', 'w5births', 'defwound', 'nonworldkill', 'tbdmg', 'w4damage']) {
      const s = r[k];
      if (!s || !s.diag || s.diag.errs !== 0) errs.push(`seed ${r.seed} ${k} errs`);
      if (s && s.diag && s.diag.overflow && Object.values(s.diag.overflow).some(v => (v | 0) !== 0)) errs.push(`seed ${r.seed} ${k} overflow`);
    }
  }
  return errs;
}
function analyzeBand(rows) {
  const byId = {};
  let kills = 0, killsPyrrhic = 0, wonTb = 0, routedTb = 0;
  let tbWorld = 0, tbWorldWon = 0, tbWorldLost = 0, tbWorldFled = 0, tbWorldRouted = 0;
  let tbNonWorld = 0, tbFightsAll = 0;
  const partyDist = {};
  const construction = { checked: 0, equal: 0, exceptions: [] };
  const tbScholarDead = { total: 0 };
  for (const r of rows) {
    const log4 = (r.raftdraft && r.raftdraft.logEntries || []).filter(e => (e.w | 0) === 4);
    kills += log4.length;
    const ksKills = (r.killerStatus && r.killerStatus.killers || []).reduce((t, k) => t + (k.kills4 || 0), 0);
    if (ksKills !== log4.length) throw new Error(`kill-count disagreement seed ${r.seed}: log=${log4.length} killerStatus=${ksKills}`);
    const starts = (r.nonworldkill && r.nonworldkill.starts) || [];
    const ends = {};
    for (const e of (r.tbdmg && r.tbdmg.tbEnds) || []) ends[e.fightId] = e;
    for (const s of starts) {
      if ((s.wave | 0) !== 4) continue;
      const e = ends[s.fightId];
      if (!e) continue;
      tbFightsAll++;
      const isWorld = s.origin === 'world-origin';
      if (isWorld) tbWorld++; else tbNonWorld++;
      if (e.result === 'won') { wonTb++; if (isWorld) tbWorldWon++; }
      if (e.result === 'routed') { routedTb++; if (isWorld) tbWorldRouted++; }
      if (isWorld && e.result === 'lost') tbWorldLost++;
      if (isWorld && e.result === 'fled') tbWorldFled++;
      const party = (s.fighters || []).filter(f => ['player', 'villager', 'ally'].indexOf(f.kind) >= 0).length;
      partyDist[party] = (partyDist[party] || 0) + 1;
      const pf = (e.fighters || []).find(f => f.kind === 'player');
      if (pf && !pf.alive) tbScholarDead.total++;
      // construction check: primary monster fighter start HP vs tile HP
      if (isWorld && s.tileMonster && s.tileMonster.hp != null) {
        const m0 = (s.fighters || []).find(f => f.kind === 'monster');
        if (m0) {
          construction.checked++;
          if (m0.hp === s.tileMonster.hp) construction.equal++;
          else construction.exceptions.push({ seed: r.seed, day: s.day, mid: s.mid, seq: s.tileMonster.seq, tileHp: s.tileMonster.hp, fighterHp: m0.hp, lingering: s.tileMonster.lingering });
        }
      }
    }
    // pyrrhic flag: log entries from lost fights are not distinguishable
    // in the row alone; count 'lost' TB fights with a same-day log entry
    // as informational only (never added to kills, which come from log).
    void killsPyrrhic;
  }
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  return {
    n: rows.length,
    days: rows.map(r => r.days),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    won: rows.reduce((t, r) => t + r.won, 0),
    seats: seats,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    courtshipCombined: rows.reduce((t, r) => t + ((r.courtship && r.courtship.combined) || 0), 0),
    courtSeedsActive: rows.filter(r => r.courtship && r.courtship.combined > 0).length,
    kills: kills, wonTb: wonTb, routedTb: routedTb,
    tbWorld: tbWorld, tbWorldWon: tbWorldWon, tbWorldLost: tbWorldLost, tbWorldFled: tbWorldFled, tbWorldRouted: tbWorldRouted,
    tbNonWorld: tbNonWorld, tbFightsAll: tbFightsAll, partyDist: partyDist,
    tbScholarDead: tbScholarDead.total,
    construction: construction,
    decisions: rows.map(r => ({ seed: r.seed, w4tbkill: r.w4tbkill || null })),
  };
}
function main() {
  const args = process.argv.slice(2);
  const single = args.includes('--corpus') ? args[args.indexOf('--corpus') + 1] : null;
  if (single) {
    const rows = loadCorpus(single);
    const errs = corpusValid(rows);
    const a = analyzeBand(rows);
    console.log(JSON.stringify({ corpus: single, corpusValid: errs.length === 0, errs: errs, band: a }, null, 1));
    if (errs.length) process.exit(1);
    return;
  }
  const controlDir = process.env.EVID_CONTROL || path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4tbkill-control');
  const phaseDir = process.env.EVID_PHASE || path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4tbkill-a');
  const cRows = loadCorpus(controlDir);
  const pRows = loadCorpus(phaseDir);
  const cErrs = corpusValid(cRows), pErrs = corpusValid(pRows);
  const c = analyzeBand(cRows), p = analyzeBand(pRows);
  const substrateOk = c.courtshipCombined > 0 && c.courtSeedsActive >= 6 && p.courtshipCombined > 0 && p.courtSeedsActive >= 6;
  const killLeg = (p.kills >= 1 || p.wonTb >= 1) && (c.kills === 0 && c.wonTb === 0);
  const costOk = p.starvationTotal <= c.starvationTotal + 2 && p.medianDays >= 0.8 * c.medianDays;
  const verdict = (cErrs.length === 0 && pErrs.length === 0 && substrateOk && killLeg && costOk) ? 'GO' : 'NO-GO';
  const out = { control: c, phase: p, controlDir: controlDir, phaseDir: phaseDir, corpusErrors: { control: cErrs, phase: pErrs }, substrateOk: substrateOk, killLeg: killLeg, costOk: costOk, verdict: verdict };
  console.log(JSON.stringify(out, null, 1));
  const ap = path.join(phaseDir, 'analysis.json');
  fs.writeFileSync(ap, JSON.stringify(out, null, 1) + '\n');
  console.log(`VERDICT: ${verdict} (kills phase=${p.kills} control=${c.kills}; wonTb phase=${p.wonTb} control=${c.wonTb}; starv phase=${p.starvationTotal} control=${c.starvationTotal}; median phase=${p.medianDays} control=${c.medianDays})`);
  if (cErrs.length || pErrs.length) { console.error('CORPUS FAILURE'); process.exit(1); }
}
if (require.main === module) main();
module.exports = { analyzeBand, corpusValid, loadCorpus };
