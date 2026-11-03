#!/usr/bin/env node
// analyze-guarde-entry-b.js — ENTRY-CHECKED ALLOW' ANALYZER
// (sim-guarde-entry-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-guarde-entry-b-prereg.md
// Reads creekhop-b-recorder JSONL (file path arg) and prints:
//   - per-seed day-5 start + forced moved-pattern + control
//     comparison vs a prior jsonl (--prior: creekhop pilot
//     format, same hops array; --priorC: homewardac C
//     shadow format, days[4].construct.steps);
//   - allow' fidelity (moved / allow'-pass hops), E-pass
//     fidelity, veto invariance (E-fail hops all vetoed
//     under both rules), entry-model agreement
//     (checkHop blockers empty <=> engine moved) N/N;
//   - allow-to-veto conversions (E pass + entry blocked)
//     with blockType census, E-fail moved (pocket
//     entries), E-fail refused;
//   - per-hop table (E, entry, allow', engine, moved).
// The final verdict is written by the worker in the
// evidence file, not here.
// Usage: node scripts/analyze-guarde-entry-b.js <recorder.jsonl>
//        [--prior <creekhop-pilot.jsonl>]
//        [--priorC <homewardac-pilotC-shadow.jsonl>]
//        [--seeds 69501,...,69508]
// Exit 2 on seed-set mismatch.
'use strict';
const fs = require('fs');
const { allowPrimeFromRecord } = require('./policies/competent-guarde-entry-b');
const DEFAULT_SEEDS = [69501, 69502, 69503, 69504, 69505, 69506, 69507, 69508];
function parseArgs(argv) {
  const out = { file: null, prior: null, priorC: null, seeds: DEFAULT_SEEDS };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--prior') out.prior = argv[++i];
    else if (argv[i] === '--priorC') out.priorC = argv[++i];
    else if (argv[i] === '--seeds') out.seeds = argv[++i].split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    else if (!out.file) out.file = argv[i];
  }
  return out;
}
function readJsonl(path) {
  return fs.readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) { console.error('usage: analyze-guarde-entry-b.js <recorder.jsonl> [--prior f] [--priorC f] [--seeds csv]'); process.exit(2); }
  const legs = readJsonl(args.file);
  const bySeed = new Map(legs.map((l) => [l.seed, l]));
  const got = legs.map((l) => l.seed).sort((a, b) => a - b);
  const want = [...args.seeds].sort((a, b) => a - b);
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    console.error('SEED-SET MISMATCH got=' + got.join(',') + ' want=' + want.join(','));
    process.exit(2);
  }
  let priorBySeed = null;
  if (args.prior) {
    priorBySeed = new Map();
    for (const r of readJsonl(args.prior)) {
      priorBySeed.set(r.seed, {
        start: r.day5Start || null,
        moved: ((r.hops || []).filter((h) => h.attempted)).map((h) => !!h.moved),
      });
    }
  }
  let priorCBySeed = null;
  if (args.priorC) {
    priorCBySeed = new Map();
    for (const r of readJsonl(args.priorC)) {
      const d5 = (r.days || [])[4] || {};
      const steps = ((d5.construct || {}).steps || []);
      priorCBySeed.set(r.seed, {
        start: d5.start && d5.start.pos ? { x: d5.start.pos.x, y: d5.start.pos.y } : null,
        moved: steps.map((s) => !!s.moved),
      });
    }
  }
  let totalHops = 0, ePass = 0, ePassMoved = 0, allowPass = 0, allowPassMoved = 0;
  let eFailMoved = 0, eFailRefused = 0, entryAgree = 0, entryMismatch = 0;
  let vetoChanges = 0, eFailOutcomeChanges = 0;
  const conversions = [];
  const mismatches = [];
  const eFailMovedList = [];
  let legsAtHaven = 0;
  for (const seed of want) {
    const leg = bySeed.get(seed);
    const attempted = (leg.hops || []).filter((h) => h.attempted);
    const movedPat = attempted.map((h) => !!h.moved);
    const atHaven = leg.day5Start && leg.day5Start.x === 4 && leg.day5Start.y === 4;
    if (atHaven) legsAtHaven++;
    let ctrl = 'n/a';
    if (priorBySeed && priorBySeed.has(seed)) {
      const p = priorBySeed.get(seed);
      const sameStart = p.start && leg.day5Start && p.start.x === leg.day5Start.x && p.start.y === leg.day5Start.y;
      const sameMoved = JSON.stringify(p.moved) === JSON.stringify(movedPat);
      ctrl = (sameStart && sameMoved) ? 'PASS' : 'FAIL start=' + JSON.stringify(p.start) + ' moved=' + JSON.stringify(p.moved);
    }
    if (priorCBySeed && priorCBySeed.has(seed)) {
      const p = priorCBySeed.get(seed);
      const sameStart = p.start && leg.day5Start && p.start.x === leg.day5Start.x && p.start.y === leg.day5Start.y;
      const sameMoved = JSON.stringify(p.moved) === JSON.stringify(movedPat);
      ctrl = (sameStart && sameMoved) ? 'PASS' : 'FAIL start=' + JSON.stringify(p.start) + ' moved=' + JSON.stringify(p.moved);
    }
    console.log('SEED ' + seed + ' day5Start=' + JSON.stringify(leg.day5Start) + ' moved=' + JSON.stringify(movedPat) + ' control=' + ctrl + (leg.error ? ' ERROR=' + leg.error : ''));
    for (const h of attempted) {
      totalHops++;
      const ap = allowPrimeFromRecord(h);
      const eOk = ap.eOk;
      if (eOk) {
        ePass++;
        if (h.moved) ePassMoved++;
      } else {
        if (h.moved) { eFailMoved++; eFailMovedList.push(seed + ':' + h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y); }
        else eFailRefused++;
      }
      if (ap.allow) {
        allowPass++;
        if (h.moved) allowPassMoved++;
      }
      // Veto invariance: old veto IFF E fail, new veto IFF NOT
      // allow'. An E-fail hop is vetoed under both by
      // construction (allow' => E pass); count any violation.
      if (ap.vetoOld !== ap.vetoNew && !eOk) { vetoChanges++; }
      if (!eOk && ap.vetoOld !== true) { eFailOutcomeChanges++; }
      if (eOk && ap.entryBlocked) {
        conversions.push({ seed, from: h.from, to: h.to, moved: !!h.moved,
          entryTypes: ap.entryBlockers.map((b) => b.blockType),
          engineType: h.engineBlock && h.engineBlock.blockType });
      }
      // Entry-model agreement: blockers empty <=> moved.
      const entrySaysCrossable = !ap.entryBlocked;
      if (entrySaysCrossable === !!h.moved) entryAgree++;
      else { entryMismatch++; mismatches.push({ seed, from: h.from, to: h.to, entryBlocked: ap.entryBlocked, moved: !!h.moved }); }
      console.log('HOP ' + seed + ' ' + h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y
        + ' E=' + (eOk ? 'pass' : 'FAIL') + ' entry=' + (ap.entryBlockers.map((b) => b.blockType).join('+') || '-')
        + " allow'=" + (ap.allow ? 'pass' : 'FAIL') + ' engine=' + ((h.engineBlock && h.engineBlock.blockType) || '-')
        + ' moved=' + (!!h.moved) + ' tile=' + ((h.tile && h.tile.type) || '?')
        + (h.tile && h.tile.needsBridge ? '(needsBridge' + (h.tile.bridged ? ',bridged' : ',unbridged') + ')' : '')
        + ' swimmer=' + (!!h.swimmer));
    }
  }
  const convCensus = {};
  for (const c of conversions) for (const t of c.entryTypes) convCensus[t] = (convCensus[t] || 0) + 1;
  console.log('TOTALS hops=' + totalHops + ' legsAtHaven=' + legsAtHaven + '/' + want.length);
  console.log('EPASS fidelity=' + ePassMoved + '/' + ePass);
  console.log('ALLOWPRIME fidelity=' + allowPassMoved + '/' + allowPass);
  console.log('ENTRY agreement=' + entryAgree + '/' + totalHops + (mismatches.length ? ' MISMATCH=' + JSON.stringify(mismatches) : ''));
  console.log('VETO invariance: E-fail hops=' + (eFailMoved + eFailRefused) + ' vetoChangesOnEfail=' + vetoChanges + ' eFailOutcomeChanges=' + eFailOutcomeChanges);
  console.log('EFAIL moved(pocket)=' + eFailMoved + ' ' + eFailMovedList.join(' '));
  console.log('EFAIL refused=' + eFailRefused);
  console.log('CONVERSIONS allow->veto=' + conversions.length + ' census=' + JSON.stringify(convCensus));
  for (const c of conversions) console.log('CONV ' + c.seed + ' ' + c.from.x + ',' + c.from.y + '->' + c.to.x + ',' + c.to.y + ' moved=' + c.moved + ' entry=' + c.entryTypes.join('+') + ' engine=' + (c.engineType || '-'));
}
main();
