#!/usr/bin/env node
// test-creekremedy-b.js — proof for the sim-creekremedy-b DIAG.
// Usage: node scripts/test-creekremedy-b.js --on <dir> --off <dir> [--rerun <dir>]
//   --rerun: dir holding a determinism re-run of one ON seed (same
//     filename as in --on); T6 compares it byte-for-byte.
// T1 gate-default-OFF unit + feasibility pure-judge unit.
// T2 ON corpus: creek n, unclassified == 0, recorder errs == 0.
// T3 OFF-vs-ON deep-equal after stripping creekRemedy fields +
//     creekRemedyStore (recorder must not perturb play).
// T4 partition sums: per seed, travel-refused == creek +
//     other-refused + unclassified recorder records (when ON);
//     evenings length consistent OFF vs ON.
// T5 feasibility recomputation: recorder feasible flags equal
//     an independent recomputation from raw fields.
// T6 determinism re-run byte-identical (skipped unless --rerun).
// Exit 0 + PROOF-GREEN iff all non-skipped checks pass.
// NOTE: T2's DIAG-GO bar (creek n >= 8) is judged in the
// evidence file against the prereg, not here: this proof
// validates the INSTRUMENT (T1–T6); a thin creek n is an
// INSUFFICIENT-DATA verdict, not a proof failure — EXCEPT
// unclassified/errs/diffs, which fail the proof outright.
'use strict';
const fs = require('fs');
const path = require('path');
const { feasibleOf, bucketOf, layerOn } = require('./policies/creekremedy-diag');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
const { on, off, rerun } = args();
if (!on || !off) { console.error('FATAL: --on <dir> --off <dir> required'); process.exit(2); }
const results = [];
function check(name, ok, detail) { results.push({ name, ok, detail: detail || '' }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); }

// T1a: gate default OFF (env unset in this process unless caller sets it).
delete process.env.CREEKREMEDY_DIAG;
check('T1a gate-default-OFF', layerOn() === false, 'layerOn() false when unset');
// T1b: feasibility pure judge on synthetic records.
const f1 = feasibleOf({ blockedTileNeedsBridge: true, blockedTileBridged: false, woodPlayer: 4, kcal: 100, gameOver: false, combatLive: false });
const f2 = feasibleOf({ blockedTileNeedsBridge: true, blockedTileBridged: false, woodPlayer: 3, kcal: 500, gameOver: false, combatLive: false });
const f3 = feasibleOf({ blockedTileNeedsBridge: true, blockedTileBridged: false, woodPlayer: 9, kcal: 59, gameOver: false, combatLive: false });
const f4 = feasibleOf({ blockedTileNeedsBridge: true, blockedTileBridged: false, woodPlayer: 4, kcal: 260, gameOver: false, combatLive: false });
const f5 = feasibleOf({ blockedTileNeedsBridge: true, blockedTileBridged: true, woodPlayer: 9, kcal: 500, gameOver: false, combatLive: false });
check('T1b feasibleOf unit', f1.feasible === true && f1.floorFeasible === false && f2.binding === 'wood-short' && f3.binding === 'kcal-short' && f4.floorFeasible === true && f5.feasible === false && f5.binding === 'other',
  JSON.stringify({ f1, f2: f2.binding, f3: f3.binding, f4: f4.floorFeasible, f5: f5.binding }));
check('T1c bucketOf unit', bucketOf({ isCreek: true, probeError: null }) === 'creek' && bucketOf({ isCreek: false, hopReturnKind: 'block:creek' }) === 'unclassified' && bucketOf({ isCreek: false, hopReturnKind: 'block:fallen_tree' }) === 'other-refused', '');

function strip(inst) {
  const c = JSON.parse(JSON.stringify(inst));
  delete c.creekRemedyStore;
  for (const e of (c.evenings || [])) delete e.creekRemedy;
  return c;
}
const onFiles = fs.readdirSync(on).filter((f) => f.endsWith('.json')).sort();
const offFiles = fs.readdirSync(off).filter((f) => f.endsWith('.json')).sort();
check('T3a same seed files OFF vs ON', JSON.stringify(onFiles) === JSON.stringify(offFiles), onFiles.join(',') + ' vs ' + offFiles.join(','));
let diffs = 0, diffDetail = '';
for (const f of onFiles) {
  const a = strip(JSON.parse(fs.readFileSync(path.join(off, f), 'utf8')));
  const b = strip(JSON.parse(fs.readFileSync(path.join(on, f), 'utf8')));
  if (JSON.stringify(a) !== JSON.stringify(b)) { diffs++; diffDetail += f + ' '; }
}
check('T3 OFF-vs-ON deep-equal (stripped)', diffs === 0, diffs ? ('diffs in: ' + diffDetail) : (onFiles.length + ' files identical'));

let creekN = 0, uncl = 0, errs = 0, partFail = 0, feasFail = 0, partDetail = '';
for (const f of onFiles) {
  const inst = JSON.parse(fs.readFileSync(path.join(on, f), 'utf8'));
  const st = inst.creekRemedyStore || {};
  errs += (st.errs || 0);
  const rows = inst.evenings || [];
  const refused = rows.filter((r) => r.eveningOutcome === 'travel-refused');
  const recs = rows.map((r) => r.creekRemedy).filter(Boolean);
  const c = recs.filter((r) => r.isCreek && !r.probeError).length;
  const o = recs.filter((r) => !r.isCreek && r.hopReturnKind && !/^block:creek$/.test(r.hopReturnKind)).length;
  const u = recs.filter((r) => !r.isCreek && /^block:creek$/.test(r.hopReturnKind || '')).length;
  creekN += c; uncl += u;
  if (refused.length !== recs.length || refused.length !== c + o + u) { partFail++; partDetail += f + '(refused=' + refused.length + ' recs=' + recs.length + ' c/o/u=' + c + '/' + o + '/' + u + ') '; }
  for (const r of recs.filter((x) => x.isCreek && !x.probeError)) {
    const recomputed = feasibleOf(r);
    if (recomputed.feasible !== r.feasible || recomputed.floorFeasible !== r.floorFeasible || recomputed.binding !== r.binding) feasFail++;
  }
}
check('T2a recorder errs == 0', errs === 0, 'errs=' + errs);
check('T2b unclassified == 0', uncl === 0, 'unclassified=' + uncl);
check('T4 partition sums', partFail === 0, partFail ? partDetail : 'all seeds partition');
check('T5 feasibility recomputation', feasFail === 0, 'mismatches=' + feasFail);
console.log('INFO creekN=' + creekN + ' (DIAG bar n>=8 judged in evidence file, not here)');
if (rerun) {
  const rf = fs.readdirSync(rerun).filter((x) => x.endsWith('.json')).sort();
  let ok = rf.length > 0, detail = '';
  for (const f of rf) {
    const a = fs.readFileSync(path.join(on, f), 'utf8');
    const b = fs.readFileSync(path.join(rerun, f), 'utf8');
    if (a !== b) { ok = false; detail += f + ' differs '; }
  }
  check('T6 determinism re-run byte-identical', ok, detail || (rf.join(',') + ' identical'));
} else {
  console.log('SKIP T6 determinism re-run (no --rerun dir)');
}
const failed = results.filter((r) => !r.ok);
if (failed.length) { console.log('PROOF-RED: ' + failed.map((r) => r.name).join(', ')); process.exit(1); }
console.log('PROOF-GREEN');
