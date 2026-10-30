#!/usr/bin/env node
// scripts/analyze-fledcover-a.js — sim-fledcover-a analyzer (pure).
//
// Reads the Leg N corpus (evidence/2026-10-30/perseed-fledcover-a/
// rows, written by scripts/sweep-draftflag-a.js verbatim) and the
// Leg S scenario JSON (scripts/test-fledcover-a.js --scenarios).
// Never touches game state, never writes into the corpus. Output is
// the analysis JSON beside the evidence file.
//
// Leg N classification reuses blockedrestore's tbend rule verbatim:
// isLingerer = origin.lingering && !origin.titan; a tbend event is
// a fled lingerer fight iff result === 'fled' && isLingerer(origin).
// Scholarmelt meetings are censused separately (their result field
// carries fled for scholar TB fights that never had a worldOrigin
// tbend event, and dissolved rows are never fled by construction).
// Wall numbers come from the Leg N rows only; the carried
// 75101-75116 band numbers are never mixed in here.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function isLingerer(o) { return !!(o && o.lingering && !o.titan); }
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function analyze(corpusDir, scenariosPath) {
  const seeds = [];
  const perSeed = {};
  const tbendByResult = {};
  const fledTbend = [];
  const smByResult = {};
  const fledMeetings = [];
  let corpusValid = true;
  const corpusProblems = [];
  const rows = [];
  for (const fn of fs.readdirSync(corpusDir).sort()) {
    const m = fn.match(/^s(\d+)-fresh\.json$/);
    if (!m) continue;
    const seed = parseInt(m[1], 10);
    const row = JSON.parse(fs.readFileSync(path.join(corpusDir, fn), 'utf8'));
    rows.push(row);
    seeds.push(seed);
    const df = row.draftflag || {};
    const sm = row.scholarmelt || {};
    const dfOk = Array.isArray(df.events) && df.diag && df.diag.errs === 0 &&
      Object.values(df.diag.overflow || {}).every(v => (v | 0) === 0);
    const smOk = Array.isArray(sm.meetings) && sm.diag && sm.diag.errs === 0 &&
      Object.values(sm.diag.overflow || {}).every(v => (v | 0) === 0);
    if (!(row.days > 0 && dfOk && smOk)) { corpusValid = false; corpusProblems.push('seed ' + seed + ': invalid row/recorder'); }
    let tbFled = 0, tbFledLing = 0, smFled = 0;
    for (const ev of (df.events || [])) {
      if (ev.type !== 'tbend') continue;
      tbendByResult[ev.result] = (tbendByResult[ev.result] || 0) + 1;
      if (ev.result === 'fled') {
        tbFled++;
        fledTbend.push({ seed, day: ev.day, seq: ev.seq, origin: ev.origin, occupantBefore: ev.occupantBefore || null, restored: ev.restored });
        if (isLingerer(ev.origin)) tbFledLing++;
      }
    }
    for (const mt of (sm.meetings || [])) {
      smByResult[mt.result] = (smByResult[mt.result] || 0) + 1;
      if (mt.result === 'fled') { smFled++; fledMeetings.push({ seed, fightSeq: mt.fightSeq, day: mt.day }); }
    }
    perSeed[seed] = { days: row.days, endReason: row.endReason, won: row.won, waveReach: row.waveReach,
      nationalEver: row.nationalEver, nationalFinal: row.nationalFinal, table: row.table, entered: row.entered,
      deaths: row.deathTotal, tbendFled: tbFled, tbendFledLingerer: tbFledLing, scholarmeltFled: smFled,
      tbendTotal: (df.events || []).filter(e => e.type === 'tbend').length,
      scholarmeltMeetings: (sm.meetings || []).length };
  }
  seeds.sort((a, b) => a - b);
  const wall = {
    n: rows.length,
    won: rows.reduce((t, r) => t + (r.won || 0), 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered || 0), 0),
    waveReach: {},
    medianDays: medianOf(rows.map(r => r.days)),
    deaths: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  for (const r of rows) { const w = r.waveReach || 1; wall.waveReach['w' + w] = (wall.waveReach['w' + w] || 0) + 1; }
  const waveReachList = [1, 2, 3, 4, 5].map(w => rows.filter(r => (r.waveReach || 1) >= w).length);

  let scenarios = null;
  if (scenariosPath && fs.existsSync(scenariosPath)) scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
  const scenRows = scenarios ? scenarios.scenarios.map(s => ({
    scenario: s.scenario, production: s.production, classification: s.classification,
    fledVia: s.fledVia, barrierCrossings: s.barrierCrossings,
    damagingStrikes: s.damagingStrikes, strikeDealt: s.strikes.filter(x => 'dealt' in x).map(x => x.dealt),
    origin: s.origin, originHpAfter: s.originHpAfter, occupantAfter: s.occupantAfter,
    restoreCapCheck: s.restoreCapCheck, playerHpEnd: s.playerHpEnd,
  })) : [];
  const fledLingererScenarios = scenRows.filter(s => s.production === 'FLED-LINGERER');
  const fledLingererTotal = fledTbend.filter(e => isLingerer(e.origin)).length + fledLingererScenarios.length;
  const verdict = (fledLingererTotal >= 1)
    ? ((fledLingererScenarios.length >= 3 &&
        fledLingererScenarios.some(s => s.scenario === 'S-clear' && s.classification === 'RESTORED') &&
        fledLingererScenarios.some(s => s.scenario === 'S-blocked' && s.classification === 'BLOCKED') &&
        fledLingererScenarios.some(s => s.scenario === 'S-chase' && s.classification === 'RESTORED'))
      ? 'DIAG-GO-STRONG' : 'DIAG-GO')
    : 'DIAG-NO-GO';
  return { corpusDir: path.basename(corpusDir), seeds, corpusValid, corpusProblems, perSeed,
    legN: { tbendByResult, fledTbend, fledTbendLingerer: fledTbend.filter(e => isLingerer(e.origin)).length,
      scholarmeltByResult: smByResult, fledMeetings },
    legS: { seed: scenarios ? scenarios.seed : null, scenarios: scenRows, fledLingererScenarios: fledLingererScenarios.length },
    fledLingererTotal, verdict, wall, waveReachAtLeast: waveReachList };
}

function main() {
  const corpusDir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-fledcover-a');
  const scenariosPath = process.argv[3] || null;
  const outPath = process.argv[4] || null;
  const doc = analyze(corpusDir, scenariosPath);
  const body = JSON.stringify(doc, null, 1) + '\n';
  if (outPath) fs.writeFileSync(outPath, body);
  else process.stdout.write(body);
  console.log('FLEDCOVER legN tbend=' + JSON.stringify(doc.legN.tbendByResult) +
    ' fledLingererTbend=' + doc.legN.fledTbendLingerer +
    ' scholarmeltFled=' + doc.legN.fledMeetings.length +
    ' legS fledLingerer=' + doc.legS.fledLingererScenarios +
    ' TOTAL=' + doc.fledLingererTotal + ' VERDICT=' + doc.verdict);
  console.log('WALL n=' + doc.wall.n + ' won=' + doc.wall.won + ' (full=' + doc.wall.wonFull + ')' +
    ' natEver=' + doc.wall.nationalEver + ' natFinal=' + doc.wall.nationalFinal +
    ' table=' + doc.wall.table + ' entered=' + doc.wall.entered +
    ' waveAtLeast=' + doc.waveReachAtLeast.join('/') + ' medianDays=' + doc.wall.medianDays + ' deaths=' + doc.wall.deaths);
}
if (require.main === module) main();
module.exports = { analyze, isLingerer };
