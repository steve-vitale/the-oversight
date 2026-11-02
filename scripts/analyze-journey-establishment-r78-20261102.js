#!/usr/bin/env node
// Journey-establishment r78 analyzer: 4-seed panel roll-up + promise-probe
// roll-up. Reads journey-establishment-r78-seed*.json and
// journey-establishment-r78-promise-seed*.json from EVIDDIR (default the
// r78-panel dir) and prints the pre-registered verdict table.
// Usage: node scripts/analyze-journey-establishment-r78-20261102.js [EVIDDIR]
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-02/r78-panel';
const seeds = [381, 382, 383, 384];
let panelGo = true, contestSeeds = 0, starvTotal = 0, anySub8 = false, anyAuto = false;
for (const seed of seeds) {
  const p = path.join(EVID, `journey-establishment-r78-seed${seed}.json`);
  if (!fs.existsSync(p)) { console.log(`== seed ${seed}: MISSING ${p}`); panelGo = false; continue; }
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const g = d.guardrails || {};
  const deaths = d.deaths || [];
  const starv = deaths.filter(x => /starvat|hunger|thirst/.test(String(x.cause || '')));
  starvTotal += starv.length;
  const contests = g.contestList || [];
  if (contests.length) contestSeeds++;
  const md = d.mshipDaily || [];
  const minRoster = md.length ? Math.min(...md.map(r => r.rosterLen)) : null;
  const sub8 = md.some(r => r.rosterLen < 8);
  if (sub8) anySub8 = true;
  const evs = d.mshipEvents || [];
  if (evs.length) anyAuto = true;
  const endApps = ((d.mshipSnap || {}).applications || []).map(a => ({ name: a.name, day: a.day, wait: (d.reachedDay || 42) - (a.day || 0) }));
  const maxWait = endApps.length ? Math.max(...endApps.map(a => a.wait)) : 0;
  const aliveEnd = g.popAlive;
  if (!(d.reachedDay >= 40 && aliveEnd > 0)) panelGo = false;
  console.log(`== seed ${seed}: reachedDay=${d.reachedDay} over=${d.over} aliveEnd=${aliveEnd} minAlive=${g.minAlive} minRosterDaily=${minRoster} tier=${g.tier} pantry=${g.pantryKcal}`);
  console.log(`   deaths=${deaths.length} starv=${starv.length} byCause=${JSON.stringify(deaths.reduce((a, x) => { a[x.cause] = (a[x.cause] || 0) + 1; return a; }, {}))}`);
  console.log(`   contests=${contests.length} [${contests.map(c => c.day + ':' + c.cid + ':' + c.outcome).join(', ')}]`);
  console.log(`   arrivals=${g.arrivals} mshipEvents=${JSON.stringify(evs)}`);
  console.log(`   endInbox=${JSON.stringify(endApps)} maxWait=${maxWait} pendingArrivals=${JSON.stringify((d.mshipSnap || {}).pendingArrivals || [])}`);
  console.log(`   c3=${JSON.stringify(d.c3)} c4=${JSON.stringify(d.c4)}`);
}
if (starvTotal > 0) panelGo = false;
if (contestSeeds < 3) panelGo = false;
console.log(`PANEL-GO (all reach d40 alive, starv 0, contests in >=3 seeds): ${panelGo ? 'GO' : 'NO-GO'} (contestSeeds=${contestSeeds} starvTotal=${starvTotal})`);
console.log(`THRESHOLD: anySub8=${anySub8} anyMshipEvents=${anyAuto} -> ${anySub8 && anyAuto ? 'CONFIRM-CANDIDATE (check accept-while-sub8 + arrival windows by hand)' : 'UNTESTED (no dip and/or no events)'}`);
console.log('--- promise probe ---');
for (const seed of seeds) {
  const p = path.join(EVID, `journey-establishment-r78-promise-seed${seed}.json`);
  if (!fs.existsSync(p)) { console.log(`== probe seed ${seed}: MISSING`); continue; }
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const t = d.target;
  if (!t) { console.log(`== probe seed ${seed}: NO-COMMIT (sits=${d.sits.length})`); continue; }
  const snaps = d.dawnSnaps || [];
  const waitingDawns = [...new Set(snaps.filter(s => s.waiting).map(s => s.day))];
  const windowDays = (t.dueDay != null && t.meetDay != null) ? (t.dueDay - t.meetDay + 1) : null;
  const everAbsent = snaps.some(s => s.favorPresent === false);
  console.log(`== probe seed ${seed}: ${d.verdict} target=${t.name} commitDay=${t.commitDay} meetDay=${t.meetDay} dueDay=${t.dueDay} windowDays=${windowDays} waitingDawns=${JSON.stringify(waitingDawns)} everAbsentFromLedger=${everAbsent} storeOverwritesForTarget=${(d.storeLog || []).filter(x => String(x.vid) === String(t.vid) && x.beforeKind !== null).length}`);
}
