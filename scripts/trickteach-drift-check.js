// trickteach-drift-check.js — drift smoke for sim-trickteach-b A/B:
// did control (TRICKTEACH unset) and armed (TRICKTEACH=1)
// trajectories diverge BEFORE the lever could act?
// The lever's earliest possible effect is the first trick learned
// on one observation instead of two: the earliest armed-leg day a
// wave-4/5 trick is first recorded known (first killfailFights row
// with trickAfter true for a species with no earlier
// trickAfter-true row, per seed; earliest across seeds). Before
// that day, identical seeds + identical policy + identical
// substrate must give identical daily snapshots. A divergence on
// an earlier day proves substrate (tip) drift, not a lever effect.
// If no trick is ever learned on the armed leg, first-lever-day
// is null and any divergence is DRIFT (the lever never acted
// there — see the prereg metric review).
// Fingerprint per daily row: the whole row serialized (the
// killfail driver's daily snapshot: day, wave kills, veterans,
// roster, readiness). D1 proves two runs of the same tip+seed
// produce identical per-seed JSON, so identical fingerprints are
// the expected baseline.
// Usage: node scripts/trickteach-drift-check.js <controlDir> <leverDir>
'use strict';
const fs = require('fs');
const path = require('path');

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); })) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function fp(row) {
  return JSON.stringify(row);
}
function firstLeverDay(j) {
  // Earliest day the LEVER acted in this seed's armed leg — the
  // first trick-learned transition in the fight rows (prereg-frozen):
  // a killfailFights row with trickAfter true for a species with no
  // earlier trickAfter-true row in this seed.
  const seen = {};
  let first = null;
  const fights = (j.killfailFights || []).slice().sort(function (a, b) { return (a.day - b.day) || 0; });
  for (const f of fights) {
    if (!f.trickAfter || seen[f.mid]) continue;
    seen[f.mid] = true;
    if (first == null || f.day < first) first = f.day;
  }
  return first;
}
const firstSeedDay = firstLeverDay;
const control = loadDir(process.argv[2]);
const armed = loadDir(process.argv[3]);
let drift = 0;
for (const seed of Object.keys(control).sort()) {
  const c = control[seed], a = armed[seed];
  if (!a) { console.log(seed + ': armed file missing'); continue; }
  const leverDay = firstLeverDay(a);
  const cDaily = c.daily || [];
  const aDaily = a.daily || [];
  const days = Math.min(cDaily.length, aDaily.length);
  let firstDiv = null;
  for (let i = 0; i < days; i++) {
    if (fp(cDaily[i]) !== fp(aDaily[i])) { firstDiv = cDaily[i].day; break; }
  }
  const verdict = firstDiv == null ? 'IDENTICAL' :
    (leverDay != null && firstDiv >= leverDay ? 'CLEAN (diverges day ' + firstDiv + ', lever first acted day ' + leverDay + ')' :
    'DRIFT (diverges day ' + firstDiv + ', lever first acted day ' + leverDay + ')');
  if (firstDiv != null && (leverDay == null || firstDiv < leverDay)) drift++;
  console.log(seed + ': firstLeverDay=' + leverDay + ' firstDivDay=' + firstDiv + ' -> ' + verdict);
}
console.log(drift ? 'DRIFT SEEDS: ' + drift : 'NO PRE-LEVER DRIFT');
process.exit(drift ? 1 : 0);

module.exports = { loadDir: loadDir, fp: fp, firstSeedDay: firstSeedDay, firstLeverDay: firstLeverDay };
