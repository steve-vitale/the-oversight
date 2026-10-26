#!/usr/bin/env node
// test-racksvoice-gate-b.js — proof tests for sim-racksvoice-gate-b.
// T1: line parsers on known racks-full / worked / plain lines.
// T2: corpus assertions — every pilot + confirm file present and
//   parsing, numerics identical baseline-vs-variant, worked ==
//   resolutions, say == worked + racksFull + plain, structural
//   invariants (B: <=1 voice/day; C: no consecutive equal figures;
//   BC: <=1 voice/day and no consecutive equal figures), and the
//   pre-registered GO bars (pilot set only; confirm judged in the
//   evidence file, not here).
// Usage: node scripts/test-racksvoice-gate-b.js [corpus-dir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-racksvoice-gate-b-corpus');
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) { pass += 1; } else { fail += 1; console.log('FAIL: ' + name); } }
function eq(a, b, name) { ok(a === b, name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

// ---- T1: parsers (same regexes as the sweep) ----
function cookOf(text) {
  const m = String(text || '').match(/^🍲 (\S+) cooked for the haven/);
  if (m) return m[1];
  const m2 = String(text || '').match(/so (\S+) left the fresh pile/);
  return m2 ? m2[1] : '?';
}
function keptKcalOf(text) {
  const m = String(text || '').match(/\(([\d,]+) kcal kept/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}
const RF = '🍲 Miguel cooked for the haven — meals stretched. The racks are already full (20,187 kcal kept — more than the haven can eat before it turns), so Miguel left the fresh pile for tonight\'s dinner instead of smoking it onto the rot pile.';
const WK = '🍲 Hassan cooked for the haven — meals stretched. Hassan worked the smoke racks too — 5 batches preserved (~1631 kcal, keeps for weeks).';
const PL = '🍲 Grace cooked for the haven — meals stretched.';
eq(cookOf(RF), 'Miguel', 'T1 cookOf racks-full');
eq(keptKcalOf(RF), 20187, 'T1 keptKcalOf racks-full');
eq(cookOf(WK), 'Hassan', 'T1 cookOf worked');
eq(keptKcalOf(WK), null, 'T1 keptKcalOf worked is null');
eq(cookOf(PL), 'Grace', 'T1 cookOf plain');
eq(keptKcalOf(PL), null, 'T1 keptKcalOf plain is null');
// isRacksFullLine / isWorkedLine from say-capture.js
const { isRacksFullLine, isWorkedLine } = require('./say-capture');
ok(isRacksFullLine({ text: RF }), 'T1 isRacksFullLine true');
ok(!isRacksFullLine({ text: WK }) && !isRacksFullLine({ text: PL }), 'T1 isRacksFullLine false on worked/plain');
ok(isWorkedLine({ text: WK }), 'T1 isWorkedLine true');
ok(!isWorkedLine({ text: RF }), 'T1 isWorkedLine false on racks-full');

// ---- T2: corpus ----
const PILOT = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const VARIANTS = ['base', 'B', 'C', 'BC'];
function load(v, s) {
  const f = path.join(DIR, `racksvoice-gate-b-${v}-pd0-dg1-leadfeast-s${s}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function numerics(r) {
  return [r.daysAlive, r.preserveVillagerBatches, r.preserveVillagerResolutions,
    r.deaths, r.rank, r.national, JSON.stringify(r.waveReach)].join('|');
}
for (const v of VARIANTS) {
  for (const s of PILOT) {
    const r = load(v, s);
    ok(!!r, `T2 file present ${v} s${s}`);
    if (!r) continue;
    eq(r.seed, s, `T2 seed matches ${v} s${s}`);
    eq(r.preserveVillagerResolutions, r.workedLines, `T2 worked==res ${v} s${s}`);
    eq(r.sayTotal, r.racksFullLines + r.plainLines + r.workedLines, `T2 say==sum ${v} s${s}`);
    eq(r.census ? r.census.racksFullKcalParsed : (r.racksFullDetail || []).length, r.racksFullLines, `T2 detail length ${v} s${s}`);
    const b = load('base', s);
    if (v !== 'base' && b) eq(numerics(r), numerics(b), `T2 numerics identical ${v} vs base s${s}`);
    // Structural invariants from detail arrays
    const d = r.racksFullDetail || [];
    if (v === 'B' || v === 'BC') {
      const days = d.map(x => x.day);
      ok(new Set(days).size === days.length, `T2 ${v} <=1 voice/day s${s}`);
    }
    if (v === 'C' || v === 'BC') {
      let consec = 0;
      for (let i = 1; i < d.length; i++) if (d[i].kcal === d[i - 1].kcal) consec += 1;
      eq(consec, 0, `T2 ${v} no consecutive equal figures s${s}`);
    }
    // Plain conversion: silenced complaints become plain frames, say unchanged
    if (v !== 'base' && b) {
      eq(r.sayTotal, b.sayTotal, `T2 say total unchanged ${v} s${s}`);
      eq(r.plainLines - b.plainLines, b.racksFullLines - r.racksFullLines, `T2 plain rise == complaints cut ${v} s${s}`);
    }
  }
}
// GO bars (pilot)
const tot = v => PILOT.reduce((a, s) => a + ((load(v, s) || {}).racksFullLines || 0), 0);
const at = (v, s) => (load(v, s) || {}).racksFullLines;
const voiceDaysEq = v => PILOT.every(s => {
  const d = (load(v, s) || {}).racksFullDetail || [], b = (load('base', s) || {}).racksFullDetail || [];
  return new Set(d.map(x => x.day)).size === new Set(b.map(x => x.day)).size;
});
console.log('pilot totals: base=' + tot('base') + ' B=' + tot('B') + ' C=' + tot('C') + ' BC=' + tot('BC'));
console.log('pilot 9757: base=' + at('base', 9757) + ' B=' + at('B', 9757) + ' C=' + at('C', 9757) + ' BC=' + at('BC', 9757));
console.log('pilot 9756: base=' + at('base', 9756) + ' B=' + at('B', 9756) + ' C=' + at('C', 9756) + ' BC=' + at('BC', 9756));
// GO bars (pilot) — REPORTED here, judged in the evidence file, not
// by this test's exit code: a NO-GO variant is a valid outcome.
console.log('GO B pilot: ' + (at('B', 9757) <= 60 && tot('B') <= 212 && voiceDaysEq('B') ? 'GO' : 'NO-GO'));
console.log('GO C pilot: ' + (tot('C') <= 150 && at('C', 9756) === 17 ? 'GO' : 'NO-GO'));
console.log('GO BC pilot: judged in evidence (needs risk count from analyzer)');
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
