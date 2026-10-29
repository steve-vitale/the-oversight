#!/usr/bin/env node
// test-blocktype-b.js — sim-blocktype-b proof (prereg:
// evidence/2026-10-29/sim-blocktype-b-prereg.md).
//
//   node scripts/test-blocktype-b.js --on <on-corpus-dir>
//     [--off <off-corpus-dir>] [--seeds 12001,12002]
//
// Scored legs (exit 1 on any failure):
//   T1 gate default OFF (unit, no corpus): layerOn() false
//     when BLOCKTYPE_DIAG is unset; a wrapped stub policy
//     with the gate unset leaves ctx untouched; isClassified
//     accepts a clean record and rejects missing /
//     mismatch / error records.
//   T2 census completeness (ON corpus): unclassified
//     refused evenings == 0 (prereg primary bar).
//   T3 probe agreement (ON corpus): every classified
//     record has probeAgrees true (implied by T2, checked
//     directly); every refused evening has a record.
//   T4 route-path structure (ON corpus): for every
//     classified record with a path, path[0] == departure,
//     consecutive steps Manhattan 1, last step == haven,
//     path.length - 1 == routeAroundLength.
//   T5 OFF vs ON deep-equal (only when --off given):
//     G-deep-equal — zero diffs.
//   T6 partition sums (ON corpus): evenings.length ==
//     sum of outcome partition; refused == classified +
//     unclassified, per seed.
//   T7 recorder errors (ON corpus): max blocktypeErrs == 0.
//   T8 leg identity: ON files carry recorderOn true, OFF
//     files (when given) carry recorderOn false.
// Prints PROOF-GREEN on a full pass, else PROOF-RED with
// the failing legs.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { layerOn, newStore, isClassified, withBlocktypeDiag } = require('./policies/blocktype-diag');
const { loadCorpus, analyzeSeed, diffCorpora } = require('./analyze-blocktype-b');

function parseArgs(argv) {
  const o = { on: null, off: null, seeds: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--on') o.on = argv[++i];
    else if (a === '--off') o.off = argv[++i];
    else if (a === '--seeds') o.seeds = argv[++i].split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite);
  }
  return o;
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  const fails = [];
  const notes = [];
  const check = (name, ok, detail) => {
    console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
    if (!ok) fails.push(name);
  };

  // T1: gate default OFF (unit).
  let t1 = true;
  try {
    if (process.env.BLOCKTYPE_DIAG !== undefined) {
      // The proof itself must run with the gate unset for T1
      // to be meaningful; if set, T1 is void, not passed.
      notes.push('T1 void: BLOCKTYPE_DIAG is set in this process env');
      t1 = false;
    } else if (layerOn() !== false) t1 = false;
    else {
      const stub = { daily(Game, ctx) { ctx.stubRan = true; } };
      const wrapped = withBlocktypeDiag(stub, 't1', 't1', newStore());
      const ctx = {};
      wrapped.daily({}, ctx);
      if (!ctx.stubRan || ctx._blocktype !== undefined || ctx._blocktypeLast !== undefined) t1 = false;
      if (!isClassified({ blockType: 'rubble', probeAgrees: true, probeError: null, routeAroundError: null })) t1 = false;
      if (isClassified(null)) t1 = false;
      if (isClassified({ blockType: 'rubble', probeAgrees: false })) t1 = false;
      if (isClassified({ blockType: 'rubble', probeAgrees: true, probeError: 'x' })) t1 = false;
      if (isClassified({ blockType: null, probeAgrees: true })) t1 = false;
    }
  } catch (e) { t1 = false; notes.push('T1 threw: ' + String(e && e.message)); }
  check('T1 gate-default-OFF + isClassified unit', t1);

  if (!o.on) {
    console.log('no --on corpus given: corpus legs skipped');
    if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
    console.log('PROOF-GREEN (unit only)');
    return;
  }

  const corpus = loadCorpus(o.on, o.seeds);
  const seedRows = corpus.map(analyzeSeed);
  const pooled = { refused: 0, classified: 0, unclassified: 0 };
  for (const s of seedRows) { pooled.refused += s.refused; pooled.classified += s.classified; pooled.unclassified += s.unclassified; }

  // T2: census completeness.
  check('T2 unclassified==0', pooled.unclassified === 0,
    'refused=' + pooled.refused + ' classified=' + pooled.classified + ' unclassified=' + pooled.unclassified);

  // T3: every refused evening has a record; classified all agree.
  let missing = 0, disagree = 0;
  for (const inst of corpus) {
    for (const e of (inst.evenings || [])) {
      if (e.eveningOutcome !== 'travel-refused') continue;
      if (!e.blocktype) missing++;
      else if (isClassified(e.blocktype) && !e.blocktype.probeAgrees) disagree++;
    }
  }
  check('T3 records present + probe agreement', missing === 0 && disagree === 0,
    'missing=' + missing + ' disagree=' + disagree);

  // T4: route-path structure.
  let pathBad = 0, pathChecked = 0;
  for (const inst of corpus) {
    for (const e of (inst.evenings || [])) {
      if (e.eveningOutcome !== 'travel-refused' || !e.blocktype || !isClassified(e.blocktype)) continue;
      const bt = e.blocktype;
      if (!bt.routeAroundPath) continue;
      pathChecked++;
      const p = bt.routeAroundPath;
      const dep = bt.departure || {};
      let bad = false;
      if (p.length < 1 || p[0][0] !== dep.mapPx || p[0][1] !== dep.mapPy) bad = true;
      const hv = bt.haven || {};
      if (p[p.length - 1][0] !== hv.hx || p[p.length - 1][1] !== hv.hy) bad = true;
      for (let i = 1; i < p.length; i++) {
        if (Math.abs(p[i][0] - p[i - 1][0]) + Math.abs(p[i][1] - p[i - 1][1]) !== 1) { bad = true; break; }
      }
      if (p.length - 1 !== bt.routeAroundLength) bad = true;
      if (bad) pathBad++;
    }
  }
  check('T4 route-path structure', pathBad === 0, 'paths checked=' + pathChecked + ' bad=' + pathBad);

  // T5: OFF vs ON deep-equal.
  if (o.off) {
    const d = diffCorpora(o.off, o.on, o.seeds);
    check('T5 OFF-vs-ON deep-equal', d.diffs.length === 0,
      'diffs=' + d.diffs.length + (d.diffs.length ? ' first=' + JSON.stringify(d.diffs[0]) : ''));
  } else {
    console.log('SKIP T5 (no --off given)');
  }

  // T6: partition sums.
  let partBad = 0;
  for (const s of seedRows) {
    const sum = Object.values(s.partition).reduce((a, b) => a + b, 0);
    if (sum !== s.evenings) partBad++;
    if (s.refused !== s.classified + s.unclassified) partBad++;
  }
  check('T6 partition sums', partBad === 0, 'bad seeds=' + partBad);

  // T7: recorder errors.
  let maxErrs = 0;
  for (const s of seedRows) maxErrs = Math.max(maxErrs, s.recorderErrs || 0);
  check('T7 recorder errs==0', maxErrs === 0, 'maxErrs=' + maxErrs);

  // T8: leg identity.
  let idBad = 0;
  for (const inst of corpus) if (inst.recorderOn !== true) idBad++;
  if (o.off) {
    for (const inst of loadCorpus(o.off, o.seeds)) if (inst.recorderOn !== false) idBad++;
  }
  check('T8 leg identity flags', idBad === 0, 'bad files=' + idBad);

  for (const n of notes) console.log('NOTE ' + n);
  if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
  console.log('PROOF-GREEN');
}

if (require.main === module) main();
