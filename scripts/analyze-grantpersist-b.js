#!/usr/bin/env node
// analyze-grantpersist-b.js — summarize a grantpersist trace corpus.
// Usage: node scripts/analyze-grantpersist-b.js [corpusDir]
// Prints one line per instance: seed, key, grant, loss?, bracket,
// bearer change?, scholar change?, list-ref change?, and the tap
// count refused with "You don't have that ability." Plus a
// reproduction table by seed/key and a per-reproducing-instance
// detail block (last present snapshot -> first absent snapshot,
// ability lists before/after).
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-grantpersist-b-corpus');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const rows = [];
for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const refusalTaps = (inst.taps || []).filter((t) => (t.sayWindow || []).some((l) => /don't have that ability/.test(l)));
  const loc = inst.lossLocalization || {};
  rows.push({ file: f, seed: inst.seed, key: inst.key, grantOk: inst.grantOk, endReason: inst.endReason,
    lost: !!loc.lost, lostAtSetup: !!loc.lostAtSetup, bracket: loc.bracket || null,
    bearerChanged: !!loc.bearerChanged, scholarChanged: !!loc.scholarChanged,
    listRefChanged: !!loc.listRefChanged, refusalTaps: refusalTaps.length,
    taps: (inst.taps || []).length, inst, loc });
}
console.log('instances: ' + rows.length);
console.log('seed,key,grant,lost,lostAtSetup,bracket,bearerChanged,scholarChanged,listRefChanged,refusalTaps,taps,endReason');
for (const r of rows) {
  console.log([r.seed, r.key, r.grantOk, r.lost, r.lostAtSetup, r.bracket, r.bearerChanged, r.scholarChanged, r.listRefChanged, r.refusalTaps, r.taps, r.endReason].join(','));
}
console.log('\n--- reproducing instances (loss after a present snapshot) ---');
for (const r of rows.filter((x) => x.lost && !x.lostAtSetup)) {
  const loc = r.loc;
  console.log('\n' + r.seed + ' ' + r.key + ' bracket=' + loc.bracket + ' bearerChanged=' + loc.bearerChanged + ' scholarChanged=' + loc.scholarChanged + ' listRefChanged=' + loc.listRefChanged + ' refusalTaps=' + r.refusalTaps);
  console.log('  lastPresent: ' + JSON.stringify(loc.lastPresent));
  console.log('  firstAbsent: ' + JSON.stringify(loc.firstAbsent));
  // All snapshots between lastPresent and firstAbsent (should be adjacent; print any in between).
  const snaps = r.inst.daySnapshots || [];
  // Match by content (JSON re-parse breaks object identity).
  const keyOf = (s) => s ? (s.phase + '|' + s.seq + '|' + s.gameDay + '|' + s.dayTicks) : '';
  const li = snaps.findIndex((s) => keyOf(s) === keyOf(loc.lastPresent));
  const fi = snaps.findIndex((s) => keyOf(s) === keyOf(loc.firstAbsent));
  console.log('  snapshot indices lastPresent=' + li + ' firstAbsent=' + fi + ' (adjacent=' + (fi === li + 1) + ')');
  // Bearer trajectory across all snapshots (any change at all?).
  const bearers = [...new Set(snaps.map((s) => s.bearerGame + '/' + s.bearerScholar))];
  console.log('  distinct bearers across snapshots: ' + bearers.join(' ; '));
  // Tap-day/game-day of each snapshot around the loss.
  for (let i = Math.max(0, li - 1); i <= Math.min(snaps.length - 1, fi + 1); i++) {
    const s = snaps[i];
    console.log('    [' + i + '] ' + s.phase + ' seq=' + s.seq + ' gameDay=' + s.gameDay + ' ticks=' + s.dayTicks + ' bearer=' + s.bearerGame + ' present=' + s.grantedPresent + ' hasAbility=' + s.hasAbility + ' list=' + s.abilities.map((a) => a.id + 'L' + a.level).join(','));
  }
}
console.log('\n--- counts ---');
console.log('lost total: ' + rows.filter((r) => r.lost).length + ' / ' + rows.length);
console.log('lost after present: ' + rows.filter((r) => r.lost && !r.lostAtSetup).length);
console.log('lostAtSetup: ' + rows.filter((r) => r.lostAtSetup).length);
console.log('refusal taps total: ' + rows.reduce((a, r) => a + r.refusalTaps, 0));
for (const seed of [...new Set(rows.map((r) => r.seed))].sort((a, b) => a - b)) {
  const sub = rows.filter((r) => r.seed === seed);
  console.log('seed ' + seed + ': lost=' + sub.filter((r) => r.lost).length + ' refusalTaps=' + sub.reduce((a, r) => a + r.refusalTaps, 0));
}
