#!/usr/bin/env node
// scripts/sim-tableline-a-analyze.js — sim-tableline-a census analyzer.
// Reads evidence/2026-10-26/perseed-sim-tableline-a/s<seed>.json rows
// (harvested UNFILTERED by sim-tableline-a-sweep.js) and classifies
// every fireside line:
//
//   Templates (the six tableWaitTalk pool lines, havenGrowth.js):
//     T0 "The table's set. The ring of pale light ..." (the tablenat
//        canned line — the reproduction leg)
//     T1 "Nobody's sleeping. The sky is waiting ..."
//     T2 "Did you see their faces? Too many angles ..."
//     T3 "It waits. We wait. Somebody should check the snares ..."
//     T4 "It eats while we deliberate. The Herald feeds ..."
//     T5 "Why them? ... they're the one who has to sit in it."
//     OTHER = any other fireside line (haven-need talk etc.), listed
//        separately and NEVER counted as table talk.
//   Situation per line, from that day's snapshot + seed markers:
//     seatState: pre-waiting | waiting | entered (entered = tableDone
//        true that day, or the line day is on/after firstEnteredDay)
//     waitDur: days since firstWaitingDay — early (<=14) | mid (15-60)
//        | late (>60) | n/a (seed never waited / pre-waiting)
//     pantry: empty (0) | low (1-999) | ok (>=1000) | unknown (null)
//     flags: announced / pellet / nationProd (line day on/after the
//        seed's marker day, or false when the marker never fired).
//
// Writes analysis.json next to the rows and prints the readable
// census. Exit 1 if any row is missing/errored (coverage miss), or
// if --seed is given and that seed's row is missing. A coverage miss
// is reported as such, never as a zero — the analyzer refuses to
// fabricate a row.
// Usage: node scripts/sim-tableline-a-analyze.js [--seed <seed>]
//   (default: all 8 band seeds 73671-73678).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tableline-a');
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

const TEMPLATES = [
  { id: 'T0', key: 'ring of pale light', label: "The table's set. The ring of pale light — it's just sitting there." },
  { id: 'T1', key: "Nobody's sleeping", label: "Nobody's sleeping. The sky is waiting ..." },
  { id: 'T2', key: 'Too many angles', label: 'Did you see their faces? Too many angles.' },
  { id: 'T3', key: 'check the snares', label: 'It waits. We wait. Somebody should check the snares.' },
  { id: 'T4', key: 'Herald feeds', label: "It eats while we deliberate. The Herald feeds on our stores." },
  { id: 'T5', key: 'Why them?', label: "Why them? ... they're the one who has to sit in it." },
];
function classify(text) {
  for (const t of TEMPLATES) if (text.indexOf(t.key) >= 0) return t.id;
  return 'OTHER';
}
function waitDurClass(firstWaitingDay, day) {
  if (!firstWaitingDay || day < firstWaitingDay) return 'n/a';
  const d = day - firstWaitingDay;
  if (d <= 14) return 'early';
  if (d <= 60) return 'mid';
  return 'late';
}
function pantryClass(p) {
  if (p === null || p === undefined) return 'unknown';
  if (p === 0) return 'empty';
  if (p < 1000) return 'low';
  return 'ok';
}

function analyze(seeds) {
  const missing = [];
  const rows = [];
  for (const seed of seeds) {
    const p = path.join(OUTDIR, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (r.error) { missing.push(seed); continue; }
    rows.push(r);
  }
  const lines = [];
  for (const r of rows) {
    const byDay = new Map();
    for (const s of (r.snapshots || [])) byDay.set(s.day, s);
    const snapFor = (day) => {
      if (byDay.has(day)) return byDay.get(day);
      let best = null;
      for (const s of (r.snapshots || [])) if (s.day <= day && (!best || s.day > best.day)) best = s;
      return best;
    };
    for (const f of (r.fireside || [])) {
      const template = classify(f.text);
      const s = snapFor(f.day);
      const entered = !!((s && s.tableDone) || (r.firstEnteredDay && f.day >= r.firstEnteredDay));
      const waiting = !!(s && s.tableWaiting);
      const seatState = entered ? 'entered' : (waiting ? 'waiting' : 'pre-waiting');
      const m = r.markers || {};
      lines.push({
        seed: r.seed, day: f.day, speaker: f.speaker, listener: f.listener,
        template, text: f.text,
        situation: {
          seatState,
          waitDur: waitDurClass(r.firstWaitingDay, f.day),
          pantry: pantryClass(s ? s.pantry : null),
          rank: s ? s.rank : null, arc: s ? s.arc : null, stage: s ? s.stage : null,
          pop: s ? s.pop : null,
          waitingDaysSoFar: s ? s.waitingDays : null,
          announced: !!(m.announceDay && f.day >= m.announceDay),
          pellet: !!(m.pelletDay && f.day >= m.pelletDay),
          nationProd: !!(m.nationProdDay && f.day >= m.nationProdDay),
        },
      });
    }
  }
  const tableLines = lines.filter(l => l.template !== 'OTHER');
  const countBy = (arr, fn) => { const o = {}; for (const x of arr) { const k = fn(x); o[k] = (o[k] || 0) + 1; } return o; };
  const analysis = {
    generated: new Date().toISOString(),
    seedsCovered: rows.map(r => r.seed),
    seedsMissing: missing,
    totalFireside: lines.length,
    totalTableTalk: tableLines.length,
    templateCounts: countBy(tableLines, l => l.template),
    otherFiresideCount: lines.length - tableLines.length,
    perSeed: {},
    perTemplateSpeaker: {},
    perTemplateSeatState: {},
    perTemplateWaitDur: {},
    perTemplatePantry: {},
    perTemplateFlags: {},
    lines,
  };
  for (const r of rows) {
    const ls = tableLines.filter(l => l.seed === r.seed);
    analysis.perSeed[r.seed] = {
      days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
      finalRank: r.finalRank, table: r.table, entered: r.entered,
      firstWaitingDay: r.firstWaitingDay, waitingDays: r.waitingDays,
      firesideCount: (r.fireside || []).length, tableTalkCount: ls.length,
      templateCounts: countBy(ls, l => l.template),
      markers: r.markers,
    };
  }
  for (const t of TEMPLATES.map(x => x.id)) {
    const ls = tableLines.filter(l => l.template === t);
    analysis.perTemplateSpeaker[t] = countBy(ls, l => l.speaker);
    analysis.perTemplateSeatState[t] = countBy(ls, l => l.situation.seatState);
    analysis.perTemplateWaitDur[t] = countBy(ls, l => l.situation.waitDur);
    analysis.perTemplatePantry[t] = countBy(ls, l => l.situation.pantry);
    analysis.perTemplateFlags[t] = {
      announced: ls.filter(l => l.situation.announced).length,
      pellet: ls.filter(l => l.situation.pellet).length,
      nationProd: ls.filter(l => l.situation.nationProd).length,
    };
  }
  return analysis;
}

function printReport(a) {
  console.log('=== sim-tableline-a census ===');
  console.log(`seeds covered: ${a.seedsCovered.join(',')}  missing: ${a.seedsMissing.length ? a.seedsMissing.join(',') : 'none'}`);
  console.log(`fireside lines total: ${a.totalFireside}  table-talk: ${a.totalTableTalk}  other fireside: ${a.otherFiresideCount}`);
  console.log('--- template counts ---');
  for (const t of TEMPLATES) console.log(`  ${t.id} (${a.templateCounts[t.id] || 0}): ${t.label}`);
  console.log(`  OTHER (${a.otherFiresideCount})`);
  console.log('--- per seed ---');
  for (const seed of Object.keys(a.perSeed).sort()) {
    const s = a.perSeed[seed];
    console.log(`  ${seed}: ${s.days}d ${s.endReason} won=${s.won ? 1 : 0} rank ${s.maxRank}/${s.finalRank} table=${s.table ? 1 : 0} entered=${s.entered ? 1 : 0} firstWait=${s.firstWaitingDay} waitDays=${s.waitingDays} fireside=${s.firesideCount} tableTalk=${s.tableTalkCount} templates=${JSON.stringify(s.templateCounts)}`);
  }
  console.log('--- per template: speakers / seatState / waitDur / pantry ---');
  for (const t of TEMPLATES) {
    console.log(`  ${t.id}: speakers=${JSON.stringify(a.perTemplateSpeaker[t.id])} seat=${JSON.stringify(a.perTemplateSeatState[t.id])} waitDur=${JSON.stringify(a.perTemplateWaitDur[t.id])} pantry=${JSON.stringify(a.perTemplatePantry[t.id])} flags=${JSON.stringify(a.perTemplateFlags[t.id])}`);
  }
}

function main() {
  let seeds = SEEDS;
  const si = process.argv.indexOf('--seed');
  if (si >= 0) seeds = [parseInt(process.argv[si + 1], 10)].filter(Number.isFinite);
  const a = analyze(seeds);
  fs.writeFileSync(path.join(OUTDIR, 'analysis.json'), JSON.stringify(a, null, 1) + '\n');
  printReport(a);
  if (a.seedsMissing.length) {
    console.error('TABLELINE ANALYSIS COVERAGE MISS (not a zero): ' + a.seedsMissing.join(','));
    process.exit(1);
  }
  console.log('TABLELINE ANALYSIS PASS: all requested seeds harvested.');
}
if (require.main === module) main();
module.exports = { analyze, classify, TEMPLATES, printReport };
