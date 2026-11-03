#!/usr/bin/env node
// analyze-guarde-deploy-b.js — DEPLOYED-GUARD ARMED-PAIR ANALYZER
// (sim-guarde-deploy-b, Loop B food-economy arm, 2026-11-03).
// Prereg: evidence/2026-11-03/sim-guarde-deploy-b-prereg.md
// Reads two homewardstep-rpt-b-driver JSONLs (old guard vs new
// guard, identical seeds) and prints the pre-registered cost
// guardrail: (i) false vetoes in the new log (vetoed hop with
// E pass AND empty entry blockers), (ii) band daysAlive totals,
// (iii) band forage-success totals — plus veto-cause census
// (escape vs entry, spoken vs silent) and a say-line census
// (entry line vs escape line) for the sense-test. The verdict
// is written by the worker in the evidence file, not here.
// Usage: node scripts/analyze-guarde-deploy-b.js <old.jsonl>
//        <new.jsonl> [--seeds csv]
// Exit 2 on seed-set mismatch.
'use strict';
const fs = require('fs');
const ESCAPE_LINE = "You don't walk there — you couldn't get home from there.";
const ENTRY_LINE = "You can't step there — you couldn't get in from here.";
function parseArgs(argv) {
  const out = { old: null, nw: null, seeds: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--seeds') out.seeds = argv[++i].split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    else if (!out.old) out.old = argv[i];
    else if (!out.nw) out.nw = argv[i];
  }
  return out;
}
function readJsonl(path) {
  return fs.readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function summarize(legs) {
  const bySeed = new Map();
  for (const leg of legs) {
    const hops = [];
    for (const d of (leg.days || [])) for (const h of (d.hops || [])) hops.push(h);
    const vetoed = hops.filter((h) => h.vetoed);
    const forageOk = (leg.days || []).reduce((n, d) => n + ((d.forages || []).filter((f) => f.ok).length), 0);
    const sayLines = leg.sayLines || [];
    bySeed.set(leg.seed, {
      daysAlive: leg.daysAlive ?? null, endReason: leg.endReason || null,
      hops: hops.length, vetoes: vetoed.length,
      spokenVetoes: vetoed.filter((h) => !h.silent).length,
      silentVetoes: vetoed.filter((h) => !!h.silent).length,
      entryVetoes: vetoed.filter((h) => h.vetoCause === 'entry').length,
      escapeVetoes: vetoed.filter((h) => h.vetoCause === 'escape').length,
      spokenEntry: vetoed.filter((h) => h.vetoCause === 'entry' && !h.silent).length,
      spokenEscape: vetoed.filter((h) => h.vetoCause === 'escape' && !h.silent).length,
      // False veto: allow' passes (E pass + entry clear) but vetoed.
      // Old-guard logs carry no entryBlockers field, so this only
      // fires on new-guard logs (where the field exists).
      falseVetoes: vetoed.filter((h) => h.simOk && Array.isArray(h.entryBlockers) && h.entryBlockers.length === 0).length,
      falseVetoList: vetoed.filter((h) => h.simOk && Array.isArray(h.entryBlockers) && h.entryBlockers.length === 0)
        .map((h) => (h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y)),
      entryVetoList: vetoed.filter((h) => h.vetoCause === 'entry')
        .map((h) => (h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y + '(' + (h.entryBlockers || []).join('+') + ')')),
      forageOk,
      sayEntry: sayLines.filter((s) => s.line === ENTRY_LINE).length,
      sayEscape: sayLines.filter((s) => s.line === ESCAPE_LINE).length,
      sayEntrySample: sayLines.filter((s) => s.line === ENTRY_LINE).slice(0, 3),
      sayEscapeSample: sayLines.filter((s) => s.line === ESCAPE_LINE).slice(0, 3),
    });
  }
  return bySeed;
}
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.old || !args.nw) { console.error('usage: analyze-guarde-deploy-b.js <old.jsonl> <new.jsonl> [--seeds csv]'); process.exit(2); }
  const oldLegs = readJsonl(args.old), newLegs = readJsonl(args.nw);
  const oldBy = summarize(oldLegs), newBy = summarize(newLegs);
  const seeds = args.seeds || [...oldBy.keys()].sort((a, b) => a - b);
  const gotOld = [...oldBy.keys()].sort((a, b) => a - b), gotNew = [...newBy.keys()].sort((a, b) => a - b);
  if (JSON.stringify(gotOld) !== JSON.stringify(seeds) || JSON.stringify(gotNew) !== JSON.stringify(seeds)) {
    console.error('SEED-SET MISMATCH old=' + gotOld.join(',') + ' new=' + gotNew.join(',') + ' want=' + seeds.join(','));
    process.exit(2);
  }
  let tDaysOld = 0, tDaysNew = 0, tForOld = 0, tForNew = 0, tFalse = 0;
  for (const seed of seeds) {
    const o = oldBy.get(seed), n = newBy.get(seed);
    tDaysOld += (o.daysAlive || 0); tDaysNew += (n.daysAlive || 0);
    tForOld += o.forageOk; tForNew += n.forageOk; tFalse += n.falseVetoes;
    console.log('SEED ' + seed + ' daysAlive old=' + o.daysAlive + ' new=' + n.daysAlive
      + ' forageOk old=' + o.forageOk + ' new=' + n.forageOk
      + ' vetoes old=' + o.vetoes + ' new=' + n.vetoes
      + ' entryVetoes new=' + n.entryVetoes + ' escapeVetoes new=' + n.escapeVetoes
      + ' falseVetoes new=' + n.falseVetoes + (n.falseVetoList.length ? ' ' + JSON.stringify(n.falseVetoList) : '')
      + ' spokenEntry new=' + n.spokenEntry + ' spokenEscape new=' + n.spokenEscape
      + ' sayEntry new=' + n.sayEntry + ' sayEscape new=' + n.sayEscape
      + (n.entryVetoList.length ? ' entryVetoes@' + n.entryVetoList.join(' ') : ''));
  }
  console.log('TOTALS daysAlive old=' + tDaysOld + ' new=' + tDaysNew + ' PASS=' + (tDaysNew >= tDaysOld));
  console.log('TOTALS forageOk old=' + tForOld + ' new=' + tForNew + ' PASS=' + (tForNew >= tForOld));
  console.log('TOTALS falseVetoes new=' + tFalse + ' PASS=' + (tFalse === 0));
  console.log('GUARDRAIL ' + ((tFalse === 0 && tDaysNew >= tDaysOld && tForNew >= tForOld) ? 'PASS' : 'FAIL'));
}
main();
