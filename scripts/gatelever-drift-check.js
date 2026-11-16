// gatelever-drift-check.js — drift smoke for sim-gatelever-b A/B:
// did control (seed call only) and lever (seed call + gate changes)
// trajectories diverge BEFORE the lever could act?
// The seed call is present in BOTH legs, so the first w5seeds day
// is NOT a lever-action day here. The lever's earliest possible
// effect is the first LEVER-action row in the lever leg: the first
// trick_wait depart row, the first second-companion launch, the
// first re-point seed row, or the first gate row with
// partyFromPlan > 0 (or a lived-fought SEEK) — whichever is
// earliest. Before that day, identical seeds + identical policy +
// identical substrate must give identical daily snapshots. A
// divergence on an earlier day proves substrate (tip) drift, not a
// lever effect. If no lever-action row exists in the lever leg,
// first-lever-day is null and any divergence is DRIFT (the lever
// never acted there — see the prereg metric review).
// Fingerprint per series row: stRaw, war, dip, plenty, w1–w5 faced,
// vet4, vet5, rd4ready, rd5ready, pop, pantry, wave kills.
// Usage: node scripts/gatelever-drift-check.js <controlDir> <leverDir>
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
  return JSON.stringify({
    st: row.stRaw, war: row.war, dip: row.dip, plenty: row.plenty,
    w1: row.w1, w2: row.w2, w3: row.w3, w4: row.w4, w5: row.w5,
    vet4: row.vet4, vet5: row.vet5,
    r4: row.rd4ready, r5: row.rd5ready,
    pop: row.pop, pantry: row.pantry,
    wk: row.wk || {},
  });
}
function firstLeverDay(j) {
  // Earliest day the LEVER acted in this seed's lever leg — the
  // minimum over the four lever-action row kinds (prereg-frozen):
  // trick_wait depart rows (brain winPlanAction or a hold at
  // hunt/standing with a trick-wait clock), second-companion
  // launches (holder launch with 2 in plan.party after), re-point
  // seed rows, and gate rows where the plan-counting fired
  // (partyFromPlan > 0) or a SEEK came through lived-fought
  // acceptance (livedFought with no target match).
  const days = [];
  for (const p of (j.w5departs || [])) {
    if (p.winPlanAction === 'trick_wait') { days.push(p.day); continue; }
    if (p.result === 'hold' && (p.stage === 'hunt' || p.stage === 'standing') && p.trickWaitSinceDay != null) days.push(p.day);
  }
  for (const l of (j.grLaunches || [])) {
    if (l.role === 'holder' && l.launched && ((l.partyAfter || []).length >= 2)) days.push(l.day);
  }
  for (const s of (j.w5seeds || [])) if (s.repointed) days.push(s.day);
  for (const g of (j.w5gates || [])) {
    if ((g.partyFromPlan | 0) > 0) { days.push(g.day); continue; }
    if (g.result === 'seek' && g.livedFought) {
      const targetMatch = (g.planTarget && g.mid === g.planTarget) ||
        (g.needWave != null && (g.wave | 0) === g.needWave) ||
        (g.planStage === 'standing' && (g.wave | 0) >= 3);
      if (!targetMatch) days.push(g.day);
    }
  }
  if (!days.length) return null;
  return Math.min.apply(null, days);
}
const firstSeedDay = firstLeverDay;
const control = loadDir(process.argv[2]);
const armed = loadDir(process.argv[3]);
let drift = 0;
for (const seed of Object.keys(control).sort()) {
  const c = control[seed], a = armed[seed];
  if (!a) { console.log(seed + ': armed file missing'); continue; }
  const leverDay = firstLeverDay(a);
  const days = Math.min((c.series || []).length, (a.series || []).length);
  let firstDiv = null;
  for (let i = 0; i < days; i++) {
    if (fp(c.series[i]) !== fp(a.series[i])) { firstDiv = c.series[i].d; break; }
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
