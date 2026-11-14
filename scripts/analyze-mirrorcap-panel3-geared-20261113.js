// analyze-mirrorcap-panel3-geared-20261113.js — analyzer for sim-mirrorcap panel 3.
// Reads both arms' per-seed JSONs (evidence/2026-11-13/perseed-mirrorcap-panel3-geared/)
// and prints the M1/M2/M3 table: cap fires, geared wins, damage dealt, chains
// reaching the Reunion wave, fixture failures. No game code, read-only.
// Usage: node scripts/analyze-mirrorcap-panel3-geared-20261113.js [dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-13', 'perseed-mirrorcap-panel3-geared');

function readArm(arm) {
  const rows = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.startsWith(arm + '-s') || !f.endsWith('.json')) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return rows;
}

function reunionDmg(row) {
  // Damage dealt to the Reunion wave = 1 - min remaining hpFrac across the
  // Reunion monsters at the wave's end (null if the wave never ended live).
  const w2 = (row.perWave || [])[2];
  if (!w2 || !w2.monstersAtEnd || !w2.monstersAtEnd.length) return null;
  const re = w2.monstersAtEnd.filter(function (m) { return m.id === 'reunion'; });
  if (!re.length) return null;
  const minHp = Math.min.apply(null, re.map(function (m) { return (m.hpFrac == null ? 1 : m.hpFrac); }));
  return Math.round((1 - minHp) * 1000) / 1000;
}

function summarize(arm) {
  const rows = readArm(arm);
  const s = { arm: arm, n: rows.length, reached: 0, won: 0, died: 0, routed: 0, other: 0,
    fixtureFailures: 0, mirrorCounts: [], rounds: [], dmg: [], hpAtStart: [], hpAtEnd: [] };
  for (const r of rows) {
    const w2 = (r.perWave || [])[2] || {};
    const rw = r.reunionWave || {};
    if (rw.reached) {
      s.reached++;
      s.mirrorCounts.push(rw.reunionCount == null ? null : rw.reunionCount);
      const row = (r.perWave || [])[2] || {};
      if (row.rowRounds != null) s.rounds.push(row.rowRounds);
      const d = reunionDmg(r);
      if (d != null) s.dmg.push(d);
      if (rw.scholarHpAtStart != null) s.hpAtStart.push(rw.scholarHpAtStart);
      if (rw.scholarHpAtEnd != null) s.hpAtEnd.push(rw.scholarHpAtEnd);
    }
    if (r.outcome === 'won') s.won++;
    else if (r.outcome === 'died') s.died++;
    else if (r.outcome === 'routed') s.routed++;
    else s.other++;
    if (r.outcome && String(r.outcome).indexOf('no-arena') === 0) s.fixtureFailures++;
  }
  return s;
}

function fmtArr(a) { return a.length ? ('[' + a.join(', ') + ']') : '[]'; }
function mean(a) { return a.length ? (a.reduce(function (x, y) { return x + y; }, 0) / a.length) : null; }

for (const arm of ['armed', 'baseline']) {
  const s = summarize(arm);
  console.log('ARM ' + arm + ': n=' + s.n + ' reachedReunion=' + s.reached +
    ' won=' + s.won + ' died=' + s.died + ' routed=' + s.routed + ' other=' + s.other +
    ' fixtureFailures=' + s.fixtureFailures);
  console.log('  mirrorCounts(at wave-3 start): ' + fmtArr(s.mirrorCounts));
  console.log('  reunionRounds: ' + fmtArr(s.rounds) + (mean(s.rounds) != null ? (' mean=' + (Math.round(mean(s.rounds) * 10) / 10)) : ''));
  console.log('  damageDealtToReunion (frac of one Reunion HP): ' + fmtArr(s.dmg) +
    (mean(s.dmg) != null ? (' mean=' + (Math.round(mean(s.dmg) * 1000) / 1000) + ' max=' + Math.max.apply(null, s.dmg)) : ''));
  console.log('  scholarHpAtStart(w3): ' + fmtArr(s.hpAtStart) + ' scholarHpAtEnd(w3): ' + fmtArr(s.hpAtEnd));
}
// Paired comparison (same seeds, both arms present).
const armed = readArm('armed'), base = readArm('baseline');
const bySeed = {};
armed.forEach(function (r) { (bySeed[r.seed] = bySeed[r.seed] || {}).armed = r; });
base.forEach(function (r) { (bySeed[r.seed] = bySeed[r.seed] || {}).baseline = r; });
let both = 0, bothReached = 0, armedWonBaseLost = 0;
Object.keys(bySeed).sort().forEach(function (seed) {
  const p = bySeed[seed];
  if (!p.armed || !p.baseline) return;
  both++;
  if ((p.armed.reunionWave || {}).reached && (p.baseline.reunionWave || {}).reached) {
    bothReached++;
    if (p.armed.outcome === 'won' && p.baseline.outcome !== 'won') armedWonBaseLost++;
  }
});
console.log('PAIRED: seeds with both arms=' + both + ' both reached Reunion=' + bothReached +
  ' armed-won-while-baseline-did-not=' + armedWonBaseLost);
