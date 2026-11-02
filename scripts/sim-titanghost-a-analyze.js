#!/usr/bin/env node
// sim-titanghost-a-analyze.js — B1 bar checker for titanghost probe JSONs.
// Usage: node scripts/sim-titanghost-a-analyze.js <beforeDir> <afterDir>
// Each dir holds probe JSONs named <tag>-s<seed>.json (one JSON object
// per file, as printed by sim-titanghost-a-probe.js). Prints per-seed
// rows, kill-band totals, control byte-equality, and a GO/NO-GO line
// per B1 bar (bars 1–4 of the prereg; bar 5 is the unit test).
'use strict';
const fs = require('fs'), path = require('path');
const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) { console.error('usage: sim-titanghost-a-analyze.js <beforeDir> <afterDir>'); process.exit(2); }
function load(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const m = /-s(\d+)\.json$/.exec(f);
    if (!m) continue;
    out[m[1]] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
const before = load(beforeDir), after = load(afterDir);
const KILL = ['95402', '95433', '95438', '95439', '95440'];
const CTRL = ['95423', '95413'];
function musterFormed(j) {
  const s = (j.callProbe || {}).snapAfterProbe || {};
  const a = (s.musterAllies == null ? 0 : s.musterAllies) + (s.musterHaven == null ? 0 : s.musterHaven);
  const callNull = ((j.callProbe || {}).callReturn === 'null');
  return { formed: (s.musterAllies !== null || s.musterHaven !== null) && a > 0, blades: a, callNull: callNull };
}
console.log('seed mode | phantomBefore -> phantomAfter | callBefore -> callAfter | musterBefore -> musterAfter | upkeepBefore -> upkeepAfter');
let bPhantom = 0, aPhantom = 0, bMuster = 0, aMuster = 0;
for (const s of KILL) {
  const b = before[s], a = after[s];
  if (!b || !a) { console.log(s + ' MISSING before=' + !!b + ' after=' + !!a); continue; }
  const bp = (b.postKillEscalation || []).length, ap = (a.postKillEscalation || []).length;
  const bm = musterFormed(b), am = musterFormed(a);
  const bu = ((b.callProbe || {}).upkeep || {}).charged, au = ((a.callProbe || {}).upkeep || {}).charged;
  bPhantom += bp; aPhantom += ap; bMuster += bm.formed ? 1 : 0; aMuster += am.formed ? 1 : 0;
  console.log(s + ' kill | ' + bp + ' -> ' + ap +
    ' | ' + b.callProbe.callReturn + ' -> ' + a.callProbe.callReturn +
    ' | blades ' + bm.blades + ' -> ' + am.blades +
    ' | ' + bu + ' -> ' + au +
    ' | heraldPresent before-call ' + b.snapBeforeCall.heraldPresent + '/' + a.snapBeforeCall.heraldPresent +
    ' | otherMusters ' + JSON.stringify((b.callProbe.upkeep || {}).otherMustersStanding) + '/' + JSON.stringify((a.callProbe.upkeep || {}).otherMustersStanding));
}
console.log('KILL TOTALS phantom ' + bPhantom + ' -> ' + aPhantom + ' | musters formed ' + bMuster + ' -> ' + aMuster);
console.log('--- controls (must be byte-identical: call, commit1, commit2, blades, upkeep) ---');
let ctrlOk = true;
for (const s of CTRL) {
  const b = before[s], a = after[s];
  if (!b || !a) { console.log(s + ' MISSING before=' + !!b + ' after=' + !!a); ctrlOk = false; continue; }
  const keys = ['callReturn', 'commit1Return', 'commit2Return'];
  const diffs = [];
  for (const k of keys) if ((b.callProbe || {})[k] !== (a.callProbe || {})[k]) diffs.push(k + ':' + b.callProbe[k] + '!=' + a.callProbe[k]);
  const bm = musterFormed(b), am = musterFormed(a);
  if (bm.blades !== am.blades) diffs.push('blades:' + bm.blades + '!=' + am.blades);
  const bu = ((b.callProbe || {}).upkeep || {}).charged, au = ((a.callProbe || {}).upkeep || {}).charged;
  if (bu !== au) diffs.push('upkeep:' + bu + '!=' + au);
  if (diffs.length) ctrlOk = false;
  console.log(s + ' control | present ' + b.snapBeforeCall.heraldPresent + '/' + a.snapBeforeCall.heraldPresent +
    ' | call ' + b.callProbe.callReturn + ' | commit ' + b.callProbe.commit1Return + ' -> ' + b.callProbe.commit2Return +
    ' | blades ' + bm.blades + ' | upkeep ' + bu + (diffs.length ? ' | DIFFS: ' + diffs.join('; ') : ' | IDENTICAL'));
}
const bar1 = aPhantom === 0;
const bar2 = aMuster === 0;
const bar3 = KILL.every(s => after[s] && ((after[s].callProbe || {}).upkeep || {}).charged === 0);
console.log('BAR1 phantom 26->0: ' + (bar1 ? 'PASS' : 'FAIL') + ' (' + bPhantom + '->' + aPhantom + ')');
console.log('BAR2 musters formed 0: ' + (bar2 ? 'PASS' : 'FAIL') + ' (' + aMuster + '/5)');
console.log('BAR3 upkeep charged 0: ' + (bar3 ? 'PASS' : 'FAIL'));
console.log('BAR4 controls identical: ' + (ctrlOk ? 'PASS' : 'FAIL'));
console.log('B1: ' + ((bar1 && bar2 && bar3 && ctrlOk) ? 'GO (bars 1-4; bar 5 = unit test)' : 'NO-GO'));
