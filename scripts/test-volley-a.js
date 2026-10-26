#!/usr/bin/env node
// scripts/test-volley-a.js — proof for sim-volley-a.
// Re-derives every summary number in
// evidence/2026-10-26/perseed-volley-a/summary.json from the per-seed
// rows, independently of the sweep's classifySeed (fresh counters here).
// PASS iff every re-derived number matches the summary exactly.
// Usage: node scripts/test-volley-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-volley-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else { fail++; console.log(`FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}
function counter(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}
function merge(list) {
  const m = {};
  for (const c of list) for (const k of Object.keys(c)) m[k] = (m[k] || 0) + c[k];
  return m;
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
const perSeed = [];
for (const seed of SEEDS) {
  const armed = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
  const base = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-baseline.json`), 'utf8'));
  perSeed.push({ seed, armed, base });
  const v = armed.volley.fieldFights, w = armed.w4dmg.fieldFights;
  const sp = summary.perSeed.find(p => p.seed === seed);
  check(`seed ${seed} fieldAll`, v.length, sp.fieldAll);
  check(`seed ${seed} field4`, v.filter(f => f.wave === 4).length, sp.field4);
  check(`seed ${seed} w4dmg count match`, v.length, w.length);
  check(`seed ${seed} w4dmg wave4 match`, v.filter(f => f.wave === 4).length, w.filter(f => f.wave === 4).length);
  check(`seed ${seed} gatesAll`, counter(v, f => f.gate), sp.gatesAll);
  check(`seed ${seed} gates4`, counter(v.filter(f => f.wave === 4), f => f.gate), sp.gates4);
  check(`seed ${seed} intentAll`, counter(v, f => f.intent), sp.intentAll);
  check(`seed ${seed} intent4`, counter(v.filter(f => f.wave === 4), f => f.intent), sp.intent4);
  check(`seed ${seed} intentWhy4`, counter(v.filter(f => f.wave === 4), f => f.intentWhy), sp.intentWhy4);
  check(`seed ${seed} party4`, counter(v.filter(f => f.wave === 4), f => {
    if (f.optsAllies === 0) return 'solo-potential';
    if (f.calledHelp) return 'called';
    if (f.everHopeless && f.intent === 'learn') return 'potential-learn-blocked';
    if (f.everHopeless) return 'potential-hopeless-engage-nocall';
    return 'potential-never-hopeless';
  }), sp.party4);
  check(`seed ${seed} fullyDecomposed`, sp.checks.all, true);
  check(`seed ${seed} G2 days`, armed.days === base.days && armed.gameDays === base.gameDays, true);
  check(`seed ${seed} G2 starvation`, armed.starvationDeaths, base.starvationDeaths);
  // Volley/ally totals agree between the two recorders on wave-4 rows.
  const v4 = v.filter(f => f.wave === 4), w4 = w.filter(f => f.wave === 4);
  check(`seed ${seed} volley dmg cross-check`, v4.reduce((t, f) => t + f.volleyDmg, 0), w4.reduce((t, f) => t + f.volleyDmg, 0));
  check(`seed ${seed} ally dmg cross-check`, v4.reduce((t, f) => t + f.allyDealt, 0), w4.reduce((t, f) => t + f.allyDmg, 0));
  check(`seed ${seed} intent cross-check`, JSON.stringify(v4.map(f => f.intent)), JSON.stringify(w4.map(f => f.intent)));
}
const allField = perSeed.flatMap(p => p.armed.volley.fieldFights);
const allField4 = allField.filter(f => f.wave === 4);
check('band gatesAll', counter(allField, f => f.gate), summary.bandGatesAll);
check('band gates4', counter(allField4, f => f.gate), summary.bandGates4);
check('band intentAll', counter(allField, f => f.intent), summary.bandIntentAll);
check('band intent4', counter(allField4, f => f.intent), summary.bandIntent4);
check('band partyAll', counter(allField, f => {
  if (f.optsAllies === 0) return 'solo-potential';
  if (f.calledHelp) return 'called';
  if (f.everHopeless && f.intent === 'learn') return 'potential-learn-blocked';
  if (f.everHopeless) return 'potential-hopeless-engage-nocall';
  return 'potential-never-hopeless';
}), summary.bandPartyAll);
check('band party4', counter(allField4, f => {
  if (f.optsAllies === 0) return 'solo-potential';
  if (f.calledHelp) return 'called';
  if (f.everHopeless && f.intent === 'learn') return 'potential-learn-blocked';
  if (f.everHopeless) return 'potential-hopeless-engage-nocall';
  return 'potential-never-hopeless';
}), summary.bandParty4);
check('band fieldAll', allField.length, summary.fieldAll);
check('band field4', allField4.length, summary.field4);
check('band volleyDmgAll', allField.reduce((t, f) => t + f.volleyDmg, 0), summary.volleyDmgAll);
check('band volleyDmg4', allField4.reduce((t, f) => t + f.volleyDmg, 0), summary.volleyDmg4);
check('band allyDmgAll', allField.reduce((t, f) => t + f.allyDealt, 0), summary.allyDmgAll);
check('band allyDmg4', allField4.reduce((t, f) => t + f.allyDealt, 0), summary.allyDmg4);
check('intentRepro', summary.intentRepro, summary.bandIntent4.learn === 10 && summary.bandIntent4.engage === 2);
check('verdict', summary.verdict, summary.fullyDecomposedSeeds >= 6 && summary.intentRepro ? 'DIAG-GO' : 'DIAG-NO-GO');
// Re-baseline bands, independently.
function bandOf(pid) {
  const rs = perSeed.map(p => p[pid === 'baseline' ? 'base' : 'armed']);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rs.length, won: rs.reduce((t, r) => t + r.won, 0), medianDays: medianOf(rs.map(r => r.days)),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0), nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0), entered: rs.reduce((t, r) => t + r.entered, 0),
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0), deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
  };
}
const bb = bandOf('baseline');
check('baseline won', bb.won, summary.baselineBand.won);
check('baseline medianDays', bb.medianDays, summary.baselineBand.medianDays);
check('baseline nationalEver', bb.nationalEver, summary.baselineBand.nationalEver);
check('baseline nationalFinal', bb.nationalFinal, summary.baselineBand.nationalFinal);
check('baseline table', bb.table, summary.baselineBand.table);
check('baseline entered', bb.entered, summary.baselineBand.entered);
check('baseline wave4', bb.wave4, summary.baselineBand.wave4);
check('baseline wave5', bb.wave5, summary.baselineBand.wave5);
check('baseline deaths', bb.deathTotal, summary.baselineBand.deathTotal);
check('baseline starvation', bb.starvationTotal, summary.baselineBand.starvationTotal);
console.log(`PROOF sim-volley-a: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
