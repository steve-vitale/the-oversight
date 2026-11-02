#!/usr/bin/env node
// analyze-homeveto-screen-b.js — ARMED-POLICY HOMEWARD-VETO screener
// (sim-homeveto-band-b, 2026-11-02). Prereg:
// evidence/2026-11-02/sim-homeveto-band-b-prereg.md.
// Reads ONE driver .jsonl file (one JSON object per seed, stdout of
// scripts/homext-abl-b-driver.js) and reports, per seed and band-wide,
// the armed-policy homeward-veto count — the screening qualifier's
// leg (b) — plus away day-ends and veto totals for disclosure.
// Counts come ONLY from exact driver fields (day.homewardVetoes,
// day.vetoes, day.silentVetoes, day-end snapshots vs haven). NO
// episode logic is duplicated here: baseline pocket episodes for
// qualifier leg (a) come from scripts/analyze-homext-abl-b.js in
// screening mode (--baseline alone), the authoritative analyzer.
// Usage: node scripts/analyze-homeveto-screen-b.js --file <jsonl>
// Exit 0 always (reporter, never a judge); the caller applies the
// prereg qualifier (>= 1 armed homeward veto).
'use strict';
const fs = require('fs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
const file = arg('file', null);
if (!file) { console.error('usage: analyze-homeveto-screen-b.js --file <jsonl>'); process.exit(2); }
const insts = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
let bandHomeward = 0, bandVetoes = 0, bandSilent = 0, bandAway = 0;
console.log('SCREEN-ARMED seed | policy | loopDays | away | homewardVetoes | vetoes(silent) | lateral | credit | outwardOnlyPasses | vetoOriginPass/Fail');
for (const inst of insts) {
  const days = inst.days || [];
  const haven = (days[0] && days[0].start && days[0].start.haven) || { x: 4, y: 4 };
  const away = days.filter((d) => d.end && d.end.pos && (d.end.pos.x !== haven.x || d.end.pos.y !== haven.y)).length;
  const homeward = days.reduce((t, d) => t + (d.homewardVetoes || 0), 0);
  const vetoes = days.reduce((t, d) => t + (d.vetoes || 0), 0);
  const silent = days.reduce((t, d) => t + (d.silentVetoes || 0), 0);
  const lateral = days.reduce((t, d) => t + (d.lateralPasses || 0), 0);
  const credit = days.reduce((t, d) => t + (d.creditUses || 0), 0);
  const passes = days.reduce((t, d) => t + (d.outwardOnlyPasses || 0), 0);
  const vop = days.reduce((t, d) => t + (d.vetoOriginPass || 0), 0);
  const vof = days.reduce((t, d) => t + (d.vetoOriginFail || 0), 0);
  bandHomeward += homeward; bandVetoes += vetoes; bandSilent += silent; bandAway += away;
  console.log(inst.seed + ' | ' + inst.policy + ' | ' + days.length + ' | ' + away + ' | ' + homeward +
    ' | ' + vetoes + '(' + silent + ') | ' + lateral + ' | ' + credit + ' | ' + passes + ' | ' + vop + '/' + vof);
}
console.log('SCREEN-ARMED BAND seeds=' + insts.length + ' away=' + bandAway +
  ' homewardVetoes=' + bandHomeward + ' vetoes=' + bandVetoes + '(' + bandSilent + ' silent)' +
  ' QUALIFIES-ARMED=' + (bandHomeward >= 1 ? 'YES' : 'no'));
module.exports = {};
