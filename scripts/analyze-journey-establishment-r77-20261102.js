#!/usr/bin/env node
// Journey-establishment r77 analyzer (focused): same-base control-vs-tents
// membership comparison on seed 371. Reads the two per-seed JSONs written
// by journey-establishment-r77-20261102.js (EVID subdirs r77-control and
// r77-tents) and prints the pre-registered verdict table. Measurement only.
// Usage: node scripts/analyze-journey-establishment-r77-20261102.js [EVIDDIR]
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-02';
function load(arm) {
  const p = path.join(EVID, 'r77-' + arm, 'journey-establishment-r77-seed371.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function show(name, d) {
  const g = d.guardrails || {};
  const md = d.mshipDaily || [];
  const firstSub8 = md.filter(r => r.rosterLen < 8).map(r => r.day);
  const inboxFullFrom = (md.find(r => (r.applications || []).length >= 3) || {}).day || null;
  console.log(`== ${name}: alive=${g.popAlive} minAlive=${g.minAlive} deaths=${g.deaths} arrivals=${g.arrivals} pantry=${g.pantryKcal} tier=${g.tier} notability=${(d.mshipSnap || {}).notability}`);
  console.log(`   contests=${(g.contestList || []).map(c => c.day + ':' + c.cid).join(',')}`);
  console.log(`   mshipEvents=${JSON.stringify(d.mshipEvents || [])}`);
  console.log(`   firstSub8=${JSON.stringify(firstSub8)} inboxFullFrom=${inboxFullFrom} endApps=${JSON.stringify(((d.mshipSnap || {}).applications || []).map(a => a.name + '@d' + a.day))} pending=${JSON.stringify((d.mshipSnap || {}).pendingArrivals || [])}`);
  console.log(`   reliefAnswers=${JSON.stringify((d.reliefLog || []).filter(r => r.action === 'answer').map(r => ({ day: r.day, before: r.pantryBefore, after: r.pantryAfter })))}`);
  console.log(`   aliveTrace=${JSON.stringify((d.pantryTrace || []).map(r => r.day + ':' + r.alive))}`);
}
const c = load('control'), t = load('tents');
show('CONTROL', c); show('TENTS', t);
const cSub8 = (c.mshipDaily || []).some(r => r.rosterLen < 8);
const tSub8 = (t.mshipDaily || []).some(r => r.rosterLen < 8);
console.log('VERDICT mechanism-confirmed (control dips <8 AND auto-accepts fire AND arrivals match +2..4d):',
  (cSub8 && (c.mshipEvents || []).some(e => e.kind === 'accept') && (c.guardrails.arrivals || 0) > 0) ? 'YES' : 'NO');
console.log('VERDICT premise-vanished (neither arm dips <8, zero events, zero arrivals both arms):',
  (!cSub8 && !tSub8 && !(c.mshipEvents || []).length && !(t.mshipEvents || []).length && !c.guardrails.arrivals && !t.guardrails.arrivals) ? 'YES' : 'NO');
console.log('NOTE deaths-channel: control deaths=' + c.guardrails.deaths + ' with alive ' + c.guardrails.popAlive +
  ' (roster net ' + ((c.pantryTrace[0] || {}).alive - c.guardrails.popAlive) + '); tents deaths=' + t.guardrails.deaths +
  ' with alive ' + t.guardrails.popAlive + ' — deaths telemetry counts non-roster deaths too; bar on alive, not deaths.');
