#!/usr/bin/env node
// fightoutcome-analyze-20261102.js — join/audit analyzer for the
// fight-outcome recorder pilot (sim-fightoutcome-recorder). Reads
// per-seed JSON ONLY (no re-simulation): the join is a real check
// because attempt rows, outcome rows, field-fight rows, and the raw
// titan outcomes array are separate fields in each per-seed file,
// so the recorder is not grading itself.
//
// Checks (prereg GO legs):
//   leg1a: every FOUGHT attempt carries exactly one tbFight row
//     (by fightSeq); no duplicate outcome rows for one fight.
//   leg1b: every fieldFight row carries a resolved engine outcome
//     (not 'unresolved').
//   leg1c: every titan 'slain'/'fled' record in titanOutcomesEnd
//     joins to exactly one tbFight row (same day, same titan,
//     normalized matching); titan 'fought' record count equals
//     titan TB fight count.
//   leg2: zero outcome rows without a matching fight start (TB
//     or field); zero duplicates.
//   floor: corpus contains >= 1 titan TB fight and >= 1 field fight.
//   determinism (when an r1/r2 pair is passed): outcome rows
//     identical minus run label.
// Usage:
//   node scripts/fightoutcome-analyze-20261102.js <per-seed-dir> [r2-dir]
// Prints a human summary to stdout and writes analysis.json into
// the per-seed dir (analysis file lives with the records it judges).
'use strict';
const path = require('path');
const fs = require('fs');
const { splitFromLegacy } = require(path.join(__dirname, 'fightoutcome-tableflags'));

const dir = process.argv[2];
if (!dir) { console.error('FIGHTOUTCOME-ANALYZE STOP: per-seed dir required.'); process.exit(2); }
const r2dir = process.argv[3] || null;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'analysis.json').sort();

function analyzeOne(rec) {
  const problems = [];
  const attempts = rec.attempts || [];
  const tbFights = rec.tbFights || [];
  const fieldFights = rec.fieldFights || [];
  // Starts are FOUGHT attempts plus BYPASS starts (engine paths
  // that build tbfight directly: alien fights, uprisings,
  // betrayals). A tbFight row joining to either class is a real
  // outcome; only a row joining to NEITHER is a false outcome.
  const fought = attempts.filter(a => a.cls === 'FOUGHT' || a.cls === 'BYPASS');
  const foughtTb = attempts.filter(a => a.cls === 'FOUGHT');
  const bypass = attempts.filter(a => a.cls === 'BYPASS');
  const bySeq = {};
  tbFights.forEach(function (f) {
    if (f.fightSeq == null) { problems.push('tbFight row without fightSeq: day ' + f.day + ' mid ' + f.mid); return; }
    if (bySeq[f.fightSeq]) problems.push('duplicate outcome row for fightSeq ' + f.fightSeq);
    bySeq[f.fightSeq] = f;
  });
  const missing = [];
  fought.forEach(function (a) {
    if (!bySeq[a.fightSeq]) missing.push({ fightSeq: a.fightSeq, day: a.day, mid: a.mid });
  });
  const orphanTb = tbFights.filter(function (f) { return f.fightSeq != null && !fought.some(a => a.fightSeq === f.fightSeq); })
    .map(function (f) { return { fightSeq: f.fightSeq, day: f.day, mid: f.mid }; });
  const unresolvedField = fieldFights.filter(f => f.outcome === 'unresolved')
    .map(function (f) { return { day: f.day, vid: f.vid, mid: f.mid }; });
  const unresolvedTb = tbFights.filter(f => f.engineResult === 'unresolved' || f.engineResult === 'unknown')
    .map(function (f) { return { fightSeq: f.fightSeq, day: f.day, mid: f.mid }; });

  // Titan outcome joins (raw end snapshot, independent of tbFights).
  const titanEnd = rec.titanOutcomesEnd || [];
  const slainFled = titanEnd.filter(o => o.outcome === 'slain' || o.outcome === 'fled');
  // Engine semantics (titans.js titanResolveOutcome): the 'fought'
  // record appended at fight start is RESOLVED IN PLACE to
  // 'slain'/'fled' at tbEnd — it is not a second record. So the
  // count invariant is fought+slain+fled records == titan TB
  // fights, not fought records alone (a fought-only count would
  // read every resolved fight as missing).
  const foughtRecs = titanEnd.filter(o => o.outcome === 'fought' || o.outcome === 'slain' || o.outcome === 'fled');
  const titanJoins = [];
  slainFled.forEach(function (o) {
    const matches = tbFights.filter(f => f.titan && f.mid === o.titan && f.endDay === o.day && f.normalized === o.outcome);
    const anyDay = tbFights.filter(f => f.titan && f.mid === o.titan && f.normalized === o.outcome);
    titanJoins.push({ day: o.day, titan: o.titan, outcome: o.outcome,
      joined: matches.length === 1, matchCount: matches.length,
      sameDayAny: anyDay.length, seq: matches.length ? matches[0].fightSeq : null });
    if (matches.length !== 1) problems.push('titan outcome ' + o.titan + '/' + o.outcome + ' day ' + o.day + ' joins ' + matches.length + ' tbFight rows');
  });
  const titanTbCount = tbFights.filter(f => f.titan).length;
  if (foughtRecs.length !== titanTbCount) {
    problems.push('titan fought records (' + foughtRecs.length + ') != titan TB fights (' + titanTbCount + ')');
  }
  // Driver-listed unresolved must agree with the re-derivation.
  const driverUnresolved = rec.unresolved || [];
  if (driverUnresolved.length !== missing.length) {
    problems.push('driver unresolved (' + driverUnresolved.length + ') != re-derived missing (' + missing.length + ')');
  }
  // TABLEDONE SPLIT (20261103): per-seed split via splitFromLegacy.
  // Legacy table=1 records report null (unknown), never a guess.
  const split = splitFromLegacy(rec);
  return { seed: rec.seed, run: rec.run, callDay: rec.callDay,
    tableWaiting: split.tableWaiting, tableDone: split.tableDone,
    attempts: attempts.length, fought: fought.length, foughtTb: foughtTb.length, bypass: bypass.length,
    tbFights: tbFights.length,
    fieldFights: fieldFights.length, titanTb: titanTbCount,
    titanOutcomes: titanEnd.map(o => ({ day: o.day, titan: o.titan, outcome: o.outcome })),
    missing: missing, orphanTb: orphanTb, unresolvedField: unresolvedField,
    unresolvedTb: unresolvedTb, titanJoins: titanJoins, problems: problems };
}

const perSeed = [];
let totFought = 0, totTb = 0, totField = 0, totTitanTb = 0, totMissing = 0, totOrphan = 0, totProblems = 0;
let wallNational = 0, wallTable = 0, wallTableWaiting = 0, wallTableDone = 0, wallTableUnknown = 0, wallWon = 0, wallW4 = 0, wallW5 = 0;
const survivals = [];
files.forEach(function (f) {
  const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const a = analyzeOne(rec);
  a.file = f;
  perSeed.push(a);
  totFought += a.fought; totTb += a.tbFights; totField += a.fieldFights; totTitanTb += a.titanTb;
  totMissing += a.missing.length; totOrphan += a.orphanTb.length; totProblems += a.problems.length;
  wallNational += rec.national || 0; wallTable += rec.table || 0; wallWon += rec.won || 0;
  // Split wall sums are ADDITIVE ONLY: wallTable above is untouched,
  // so old corpora keep their old wall.table exactly. Unknown counts
  // legacy table=1 (or table-less) records whose split is unrecoverable.
  if (a.tableWaiting === null || a.tableDone === null) wallTableUnknown += 1;
  else { wallTableWaiting += a.tableWaiting; wallTableDone += a.tableDone; }
  wallW4 += rec.wave4 || 0; wallW5 += rec.wave5 || 0;
  if (rec.gameDays != null) survivals.push(rec.gameDays);
});
survivals.sort((a, b) => a - b);
const medianSurvival = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
const floorTitan = totTitanTb >= 1;
const floorField = totField >= 1;
const leg1 = totMissing === 0 && totOrphan === 0 && perSeed.every(s => s.unresolvedField.length === 0 && s.unresolvedTb.length === 0 && s.problems.length === 0);
const leg2 = totOrphan === 0 && perSeed.every(s => s.problems.filter(p => /duplicate|without fightSeq|orphan/i.test(p)).length === 0);
let det = null;
if (r2dir) {
  det = [];
  files.forEach(function (f) {
    const r1 = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const f2 = f.replace(/-r1\.json$/, '-r2.json');
    const p2 = path.join(r2dir, f2);
    if (!fs.existsSync(p2)) { det.push({ file: f, r2: null, equal: false, note: 'no r2 file' }); return; }
    const r2 = JSON.parse(fs.readFileSync(p2, 'utf8'));
    const strip = function (rec) {
      const c = JSON.parse(JSON.stringify(rec));
      c.run = 'rX';
      return JSON.stringify({ attempts: c.attempts, tbFights: c.tbFights, fieldFights: c.fieldFights, kills: c.kills, titanOutcomesEnd: c.titanOutcomesEnd, unresolved: c.unresolved });
    };
    det.push({ file: f, r2: f2, equal: strip(r1) === strip(r2) });
  });
}
const out = { seeds: perSeed.length, files: files,
  totals: { fought: totFought, tbFights: totTb, fieldFights: totField, titanTb: totTitanTb,
    missingOutcomes: totMissing, orphanOutcomes: totOrphan, problems: totProblems },
  floor: { titanTb: floorTitan, fieldFight: floorField },
  legs: { leg1_complete: leg1, leg2_noFalse: leg2, floor: floorTitan && floorField },
  wall: { national: wallNational, table: wallTable, tableWaiting: wallTableWaiting, tableDone: wallTableDone, tableUnknown: wallTableUnknown, won: wallWon, wave4: wallW4, wave5: wallW5,
    medianSurvival: medianSurvival, maxSurvival: survivals.length ? survivals[survivals.length - 1] : null,
    survivals: survivals },
  determinism: det, perSeed: perSeed };
fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(out, null, 2) + '\n');
console.log('seeds: ' + perSeed.length);
console.log('fought TB: ' + totFought + ' | tbFight rows: ' + totTb + ' | missing: ' + totMissing + ' | orphan: ' + totOrphan);
console.log('field fights: ' + totField + ' | titan TB fights: ' + totTitanTb + ' | problems: ' + totProblems);
console.log('floor titanTb=' + floorTitan + ' field=' + floorField);
console.log('leg1_complete=' + leg1 + ' leg2_noFalse=' + leg2);
console.log('wall: national=' + wallNational + ' table=' + wallTable + ' tableWaiting=' + wallTableWaiting + ' tableDone=' + wallTableDone + ' tableUnknown=' + wallTableUnknown + ' won=' + wallWon + ' wave4=' + wallW4 + ' wave5=' + wallW5 + ' medianSurvival=' + medianSurvival);
if (det) det.forEach(d => console.log('det ' + d.file + ' == ' + d.r2 + ' : ' + d.equal));
perSeed.forEach(function (s) {
  console.log('seed ' + s.seed + ' call=' + s.callDay + ' fought=' + s.fought + ' (tb=' + s.foughtTb + ' bypass=' + s.bypass + ') tb=' + s.tbFights + ' field=' + s.fieldFights + ' titanTb=' + s.titanTb + ' problems=' + s.problems.length);
  s.problems.forEach(p => console.log('  PROBLEM: ' + p));
  s.missing.forEach(m => console.log('  MISSING outcome: seq ' + m.fightSeq + ' day ' + m.day + ' mid ' + m.mid));
  s.orphanTb.forEach(m => console.log('  ORPHAN outcome: seq ' + m.fightSeq + ' day ' + m.day + ' mid ' + m.mid));
  s.titanJoins.forEach(j => console.log('  titan join: ' + j.titan + '/' + j.outcome + ' d' + j.day + ' joined=' + j.joined + ' matches=' + j.matchCount));
});
