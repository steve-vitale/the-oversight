// Drift smoke for sim-d3refreeze-b (RE-FREEZE of the confirm D3): did the off
// leg (full substrate, PROFILEGATE4 unset) and the on leg (full substrate,
// PROFILEGATE4=1) diverge BEFORE the lever could act? The re-frozen
// first-lever-day is the first needWave>=4 pool row on the ON leg — the
// first scored dawn for a needWave>=4 holder the recorder observes
// (sim-d3refreeze-b-prereg.md; finding #2639). The old bound (first
// world-tick v4 seed row) was proven non-conservative on seed 106751:
// the lever acted day 74 (gate-open launch) while the first world-tick
// row is day 111. Fallback: the first depart row carrying a non-null
// companion2. A seed with no needWave>=4 pool row and a divergence is
// DRIFT (leverDay null); with no divergence it is IDENTICAL. The
// world-tick fallback is REMOVED — it was the defective bound.
// Fingerprint per day: waveKillLog entries, vetsW4 killers, roster
// dead flags, wave4Slain, ready4/ready5 readiness flags (same as
// scripts/vetparty-drift-check.js).
// Usage: node scripts/profilegate4-d3refreeze-b-drift-check.js <offDir> <onDir>
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
  // RE-FREEZE (sim-d3refreeze-b-prereg.md, finding #2639): first
  // needWave>=4 pool row on the ON leg — the first scored dawn for a
  // needWave>=4 holder the recorder observes. The old definition
  // (first world-tick v4 seed row) is removed: it was proven
  // non-conservative (106751: lever acted day 74, world-tick row 111).
  let d = null;
  for (const r of (a.companionPool || [])) {
    if (((r.needWave | 0) >= 4)) { if (d == null || r.day < d) d = r.day; }
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
