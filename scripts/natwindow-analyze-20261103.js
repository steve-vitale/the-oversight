// natwindow-analyze-20261103.js — aggregates the judged natwindow
// corpus into the prereg verdict. Run:
//   node scripts/natwindow-analyze-20261103.js [perseed-dir]
// Corpus files: natprobe-<policy>-s<seed>.json per seed/arm, as written
// by scripts/natprobe-driver-20261103.js. Prints the before/after
// table and the prereg bars; exits 1 if any bar fails.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-03', 'perseed-natwindow-a');
const SEEDS = [97330, 97331, 97332, 97333, 97334, 97335, 97336, 97338, 97339, 97340, 97341, 97342];

function load(policy, seed) {
  const f = path.join(dir, `natprobe-${policy}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function polityDiedPreGate(d) {
  const s = d.summary || {};
  return !!(s.everPolity && s.firstPolityDay != null && s.regionalPlus30Day != null &&
    s.firstNationalDay == null && d.daily && d.daily.some(r => r.day >= s.firstPolityDay && r.day < s.regionalPlus30Day && !r.polity));
}
function polityHeldToGate(d) {
  const s = d.summary || {};
  if (!s.everPolity || s.firstNationalDay == null) return false;
  const g = s.regionalPlus30Day;
  const row = (d.daily || []).find(r => r.day === g) || (d.daily || []).find(r => r.day > g);
  return !!(row && row.polity);
}
function median(xs) {
  const v = xs.slice().sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : 0;
}

const rows = [];
for (const seed of SEEDS) {
  const b = load('closecommit', seed);
  const v = load('natwindow', seed);
  const bs = b.summary || {}, vs = v.summary || {};
  rows.push({
    seed,
    bNat: !!bs.everNational, bNatDay: bs.firstNationalDay,
    vNat: !!vs.everNational, vNatDay: vs.firstNationalDay,
    bWon: !!b.won, vWon: !!v.won,
    bDays: b.days, vDays: v.days,
    bEnd: b.endReason, vEnd: v.endReason,
    bPolityDiedPreGate: polityDiedPreGate(b),
    vHeldToGate: polityHeldToGate(v),
  });
}
console.log('seed | base nat | variant nat | base won | var won | base days | var days | base end | var end');
for (const r of rows) {
  console.log(`${r.seed} | ${r.bNat ? 'day ' + r.bNatDay : 'never'} | ${r.vNat ? 'day ' + r.vNatDay : 'never'} | ${r.bWon} | ${r.vWon} | ${r.bDays} | ${r.vDays} | ${r.bEnd} | ${r.vEnd}`);
}
const bNat = rows.filter(r => r.bNat).length;
const vNat = rows.filter(r => r.vNat).length;
const bWon = rows.filter(r => r.bWon).length;
const vWon = rows.filter(r => r.vWon).length;
const diedPreGate = rows.filter(r => r.bPolityDiedPreGate);
const held = diedPreGate.filter(r => r.vHeldToGate).length;
const bMed = median(rows.map(r => r.bDays));
const vMed = median(rows.map(r => r.vDays));
console.log(`\nNational-ever: baseline ${bNat}/12, variant ${vNat}/12, delta ${vNat - bNat >= 0 ? '+' : ''}${vNat - bNat}`);
console.log(`Won: baseline ${bWon}/12, variant ${vWon}/12`);
console.log(`Median survival days: baseline ${bMed}, variant ${vMed}`);
console.log(`Mechanism: baseline polity died pre-gate on ${diedPreGate.length} seeds (${diedPreGate.map(r => r.seed).join(',') || 'none'}); variant held to gate on ${held} of them.`);
const bars = [
  ['PRIMARY variant national-ever >= 4/12', vNat >= 4],
  ['PRIMARY delta >= +3', (vNat - bNat) >= 3],
  ['PRIMARY variant > baseline', vNat > bNat],
  ['MECHANISM held >= half of died-pre-gate', diedPreGate.length === 0 ? false : held * 2 >= diedPreGate.length],
  ['GUARDRAIL won variant >= baseline - 1', vWon >= bWon - 1],
  ['GUARDRAIL median survival variant >= 0.8x baseline', vMed >= 0.8 * bMed],
];
let fail = 0;
for (const [name, ok] of bars) { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) fail++; }
if (fail) { console.log(`VERDICT: HELD (${fail} bar(s) failed)`); process.exit(1); }
console.log('VERDICT: GO — natwindow leg lands');
