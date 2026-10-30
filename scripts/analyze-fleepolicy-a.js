#!/usr/bin/env node
// scripts/analyze-fleepolicy-a.js — sim-fleepolicy-a analyzer (pure).
//
// Reads the corpus (evidence/2026-10-30/perseed-fleepolicy-a/ rows,
// written by scripts/sweep-fleepolicy-a.js). Never touches game
// state, never writes into the corpus. Output is the analysis JSON
// beside the evidence file.
//
// Classification reuses fledcover-a's tbend rule verbatim:
// isLingerer = origin.lingering && !origin.titan; a tbend event is
// a fled lingerer fight iff result === 'fled' && isLingerer(origin).
// Restore: RESTORED = restored === true; BLOCKED = restored ===
// false && occupantAfter non-null; else UNCLASSIFIED.
// Scholarmelt meetings are censused separately and NEVER folded
// into the tbend lingerer count. No rate is computed anywhere:
// with an instrument-induced handful there is no population
// frequency to estimate, and with 0 fled the verdict is
// coverage-still-empty, never a rate.
//
// Verdict (prereg sim-fleepolicy-a-prereg.md):
//   INSTRUMENT-FAIL: fpFleePhaseFights == 0 (policy never fired).
//   GO: >= 1 fled lingerer fight classified.
//   STRONG: >= 3 fled lingerer fights with >= 1 RESTORED and
//     >= 1 BLOCKED (clear-restored / blocked-blocked contrast).
//   NO-GO: instrument fired but 0 fled lingerer fights.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function isLingerer(o) { return !!(o && o.lingering && !o.titan); }
function classifyFled(ev) {
  if (!ev || ev.result !== 'fled') return 'NOT-FLED';
  if (!isLingerer(ev.origin)) return 'NOT-LINGERER';
  if (ev.restored) return 'RESTORED';
  if (ev.occupantAfter) return 'BLOCKED';
  return 'UNCLASSIFIED';
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function analyze(corpusDir) {
  const seeds = [];
  const perSeed = {};
  const tbendByResult = {};
  const fledTbend = [];
  const fledLingerer = [];
  const smByResult = {};
  const fledMeetings = [];
  let corpusValid = true;
  const corpusProblems = [];
  const rows = [];
  let fpTotals = { lingererFights: 0, strikeTurns: 0, fleePhaseFights: 0, fleeTurns: 0, fleeAbandoned: 0, doorFlees: 0, edgeFlees: 0 };
  for (const fn of fs.readdirSync(corpusDir).sort()) {
    const m = fn.match(/^s(\d+)-fresh\.json$/);
    if (!m) continue;
    const seed = parseInt(m[1], 10);
    const row = JSON.parse(fs.readFileSync(path.join(corpusDir, fn), 'utf8'));
    rows.push(row);
    seeds.push(seed);
    const df = row.draftflag || {};
    const sm = row.scholarmelt || {};
    const fp = row.fleepolicy || null;
    const dfOk = Array.isArray(df.events) && df.diag && df.diag.errs === 0 &&
      Object.values(df.diag.overflow || {}).every(v => (v | 0) === 0);
    const smOk = Array.isArray(sm.meetings) && sm.diag && sm.diag.errs === 0 &&
      Object.values(sm.diag.overflow || {}).every(v => (v | 0) === 0);
    const fpOk = fp && Number.isFinite(fp.lingererFights) && Number.isFinite(fp.fleePhaseFights);
    if (!(row.days > 0 && dfOk && smOk && fpOk)) { corpusValid = false; corpusProblems.push('seed ' + seed + ': invalid row/recorder/counters'); }
    if (fp) for (const k of Object.keys(fpTotals)) fpTotals[k] += (fp[k] || 0);
    let tbFled = 0, tbFledLing = 0, smFled = 0;
    const lostLingerer = [];
    for (const ev of (df.events || [])) {
      if (ev.type !== 'tbend') continue;
      tbendByResult[ev.result] = (tbendByResult[ev.result] || 0) + 1;
      if (ev.result === 'fled') {
        tbFled++;
        const cls = classifyFled(ev);
        fledTbend.push({ seed, day: ev.day, seq: ev.seq, origin: ev.origin, occupantAfter: ev.occupantAfter || null, restored: !!ev.restored, classification: cls });
        if (isLingerer(ev.origin)) {
          tbFledLing++;
          fledLingerer.push({ seed, day: ev.day, seq: ev.seq, origin: ev.origin, occupantAfter: ev.occupantAfter || null, restored: !!ev.restored, classification: cls });
        }
      }
      if (ev.result === 'lost' && isLingerer(ev.origin)) {
        lostLingerer.push({ seed, day: ev.day, seq: ev.seq, origin: ev.origin, occupantAfter: ev.occupantAfter || null, restored: !!ev.restored });
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
      scholarmeltMeetings: (sm.meetings || []).length,
      fleepolicy: fp, lostLingerer: lostLingerer.length };
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
  const nFled = fledLingerer.length;
  const nRestored = fledLingerer.filter(e => e.classification === 'RESTORED').length;
  const nBlocked = fledLingerer.filter(e => e.classification === 'BLOCKED').length;
  const nUnclassified = fledLingerer.filter(e => e.classification === 'UNCLASSIFIED').length;
  let verdict;
  if (fpTotals.fleePhaseFights === 0) verdict = 'INSTRUMENT-FAIL';
  else if (nFled >= 3 && nRestored >= 1 && nBlocked >= 1) verdict = 'GO-STRONG';
  else if (nFled >= 1) verdict = 'GO';
  else verdict = 'NO-GO';
  return { corpusDir: path.basename(corpusDir), seeds, corpusValid, corpusProblems, perSeed,
    fpTotals,
    legN: { tbendByResult, fledTbend, fledLingerer, fledLingererTotal: nFled,
      restored: nRestored, blocked: nBlocked, unclassified: nUnclassified,
      scholarmeltByResult: smByResult, fledMeetings },
    verdict, wall, waveReachAtLeast: waveReachList };
}

function main() {
  const corpusDir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-fleepolicy-a');
  const outPath = process.argv[3] || null;
  const doc = analyze(corpusDir);
  const body = JSON.stringify(doc, null, 1) + '\n';
  if (outPath) fs.writeFileSync(outPath, body);
  else process.stdout.write(body);
  console.log('FLEEPOLICY fp=' + JSON.stringify(doc.fpTotals) +
    ' tbend=' + JSON.stringify(doc.legN.tbendByResult) +
    ' fledLingerer=' + doc.legN.fledLingererTotal +
    ' (restored=' + doc.legN.restored + ' blocked=' + doc.legN.blocked + ' unclassified=' + doc.legN.unclassified + ')' +
    ' scholarmeltFled=' + doc.legN.fledMeetings.length +
    ' VERDICT=' + doc.verdict + ' corpusValid=' + doc.corpusValid);
  console.log('WALL n=' + doc.wall.n + ' won=' + doc.wall.won + ' (full=' + doc.wall.wonFull + ')' +
    ' natEver=' + doc.wall.nationalEver + ' natFinal=' + doc.wall.nationalFinal +
    ' table=' + doc.wall.table + ' entered=' + doc.wall.entered +
    ' waveAtLeast=' + doc.waveReachAtLeast.join('/') + ' medianDays=' + doc.wall.medianDays + ' deaths=' + doc.wall.deaths);
}
if (require.main === module) main();
module.exports = { analyze, isLingerer, classifyFled };
