// Drift smoke for sim-vetparty-a A/B: did control (prereg tip) and armed
// (rebased tip) trajectories diverge BEFORE the lever could act?
// The lever's earliest possible effect is the first winPlanSeedFromFight
// on a wave-4+ flee (v4seeds[0].day in the armed leg). Before that day,
// identical seeds + identical policy + identical substrate must give
// identical daily snapshots. A divergence on an earlier day proves
// substrate (tip) drift, not a lever effect.
// Fingerprint per day: waveKillLog entries, vetsW4 killers, roster dead
// flags, wave4Slain, ready4/ready5 readiness flags.
// Usage: node /tmp/vetparty-drift-check.js <controlDir> <onDir>
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
function fp(day) {
  const roster = (day.roster || []).map(function (r) { return r.vid + ':' + (r.dead ? 1 : 0); }).join(',');
  const wkl = (day.waveKillLog || []).map(function (e) { return (e.vid || e.killer || '?') + '@' + e.w + ':' + (e.mid || e.id || '?'); }).join(',');
  return JSON.stringify({
    wkl: wkl,
    w4slain: day.wave4Slain,
    v3: (day.vetsW3 || {}).count, v4: (day.vetsW4 || {}).count,
    r4: day.ready4 && day.ready4.ready, r5: day.ready5 && day.ready5.ready,
    roster: roster,
  });
}
const control = loadDir(process.argv[2]);
const armed = loadDir(process.argv[3]);
let drift = 0;
for (const seed of Object.keys(control).sort()) {
  const c = control[seed], a = armed[seed];
  if (!a) { console.log(seed + ': armed file missing'); continue; }
  const firstSeedDay = (a.v4seeds || []).length ? Math.min.apply(null, a.v4seeds.map(function (s) { return s.day; })) : null;
  const firstDepartDay = (a.v4departs || []).length ? Math.min.apply(null, a.v4departs.map(function (s) { return s.day; })) : null;
  const firstLeverDay = firstSeedDay == null ? firstDepartDay : (firstDepartDay == null ? firstSeedDay : Math.min(firstSeedDay, firstDepartDay));
  const days = Math.min((c.daily || []).length, (a.daily || []).length);
  let firstDiv = null;
  for (let i = 0; i < days; i++) {
    if (fp(c.daily[i]) !== fp(a.daily[i])) { firstDiv = c.daily[i].day; break; }
  }
  const verdict = firstDiv == null ? 'IDENTICAL' :
    (firstLeverDay != null && firstDiv >= firstLeverDay ? 'CLEAN (diverges day ' + firstDiv + ', lever first acted day ' + firstLeverDay + ')' :
    'DRIFT (diverges day ' + firstDiv + ', lever first acted day ' + firstLeverDay + ')');
  if (firstDiv != null && (firstLeverDay == null || firstDiv < firstLeverDay)) drift++;
  console.log(seed + ': firstLeverDay=' + firstLeverDay + ' firstDivDay=' + firstDiv + ' -> ' + verdict);
}
console.log(drift ? 'DRIFT SEEDS: ' + drift : 'NO PRE-LEVER DRIFT');
