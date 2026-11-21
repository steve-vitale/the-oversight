// Drift smoke for sim-profilegate-b (SCOPED variant): did the off leg
// (full substrate, PROFILEGATE4 unset) and the on leg (full substrate,
// PROFILEGATE4=1) diverge BEFORE the lever could act? The lever's
// earliest possible effect is the first world-tick winPlanSeedFromFight
// (the VETREENGAGE-gated path) on the on leg — agency-evade /
// agency-flee / gate-avoid seed rows are live paths on BOTH legs and
// must NOT count as lever action (trickteach's D3 gap: its
// first-lever-day missed earlier-wave / scholar-channel actions).
// Fallback: the first depart row carrying a non-null companion2 (the
// other VETREENGAGE-gated action). This day is conservative: the
// profile gate can first act at a scored dawn for a plan holder, which
// is never before the first plan is planted — and for the SCOPED gate,
// first-v4-seed-row is a valid conservative bound, because the gate
// cannot act before a wave-4 plan exists (a needWave>=4 plan requires
// a wave-4 seed first). Before that day, identical seeds + identical
// policy + identical substrate must give identical daily snapshots. A
// divergence on an earlier day proves substrate (tip) drift, not a
// lever effect.
// Fingerprint per day: waveKillLog entries, vetsW4 killers, roster
// dead flags, wave4Slain, ready4/ready5 readiness flags (same as
// scripts/vetparty-drift-check.js).
// Usage: node scripts/profilegate4-drift-check.js <offDir> <onDir>
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
function firstLeverDay(a) {
  let d = null;
  for (const s of (a.v4seeds || [])) {
    if (s.path === 'world-tick') { if (d == null || s.day < d) d = s.day; }
  }
  if (d != null) return d;
  for (const dep of (a.v4departs || []).concat(a.dawnbidDeparts || [])) {
    if (dep.companion2 != null) { if (d == null || dep.day < d) d = dep.day; }
  }
  return d;
}
const off = loadDir(process.argv[2]);
const on = loadDir(process.argv[3]);
let drift = 0;
for (const seed of Object.keys(off).sort()) {
  const c = off[seed], a = on[seed];
  if (!a) { console.log(seed + ': on file missing'); continue; }
  const leverDay = firstLeverDay(a);
  const days = Math.min((c.daily || []).length, (a.daily || []).length);
  let firstDiv = null;
  for (let i = 0; i < days; i++) {
    if (fp(c.daily[i]) !== fp(a.daily[i])) { firstDiv = c.daily[i].day; break; }
  }
  const verdict = firstDiv == null ? 'IDENTICAL' :
    (leverDay != null && firstDiv >= leverDay ? 'CLEAN (diverges day ' + firstDiv + ', lever first acted day ' + leverDay + ')' :
    'DRIFT (diverges day ' + firstDiv + ', lever first acted day ' + leverDay + ')');
  if (firstDiv != null && (leverDay == null || firstDiv < leverDay)) drift++;
  console.log(seed + ': firstLeverDay=' + leverDay + ' firstDivDay=' + firstDiv + ' -> ' + verdict);
}
console.log(drift ? 'DRIFT SEEDS: ' + drift : 'NO PRE-LEVER DRIFT');
if (drift) process.exitCode = 1;
