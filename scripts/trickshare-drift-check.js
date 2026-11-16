// trickshare-drift-check.js — drift smoke for sim-trickshare-a A/B:
// did control (TRICKSHARE unset) and armed (TRICKSHARE=1)
// trajectories diverge BEFORE the lever could act?
// The lever's earliest possible effect is the first TAUGHT
// observation credited (prereg-frozen D3): the earliest armed-leg
// day a trickObservations row with source 'taught' appears, on ANY
// wave/channel — the lever also fires on waves 1–2 and via the
// scholar channel, invisible to wave-4/5 fight rows (trickteach
// metric review #1: first-lever-day is first lever ACTION on any
// wave/channel). Before that day, identical seeds + identical
// policy + identical substrate must give identical daily snapshots.
// A divergence on an earlier day proves substrate (tip) drift, not
// a lever effect. If no taught observation is ever credited on the
// armed leg, first-lever-day is null and any divergence is DRIFT
// (the lever never acted there — see the prereg metric review).
// Fingerprint per daily row: the whole row serialized (the
// killfail driver's daily snapshot: day, wave kills, veterans,
// roster, readiness). D1 proves two runs of the same tip+seed
// produce identical per-seed JSON, so identical fingerprints are
// the expected baseline.
// Usage: node scripts/trickshare-drift-check.js <controlDir> <leverDir>
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
  // first taught observation credited (prereg-frozen D3): the
  // earliest trickObservations row with source 'taught', any wave.
  // A pending offer alone writes state but consumes no RNG and
  // gates nothing, so it cannot diverge a trajectory.
  let first = null;
  for (const r of (j.trickObservations || [])) {
    if (r.source !== 'taught') continue;
    if (first == null || r.day < first) first = r.day;
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
