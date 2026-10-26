#!/usr/bin/env node
// analyze-crisis-r52-delayed-20261026.js — LANE B crisis r52 analyzer.
// Reads journey-crisis-r52-delayed-seed*.json from the evidence dir and
// prints panel verdicts for the pre-registered metrics D1-D7, plus
// drift classification (melts-back line / moved-on resolution / other).
// Usage: node scripts/analyze-crisis-r52-delayed-20261026.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';
const files = fs.readdirSync(EVID).filter(f => /^journey-crisis-r52-delayed-seed\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
function gorgeKcal(line) { const m = /([\d,]+) kcal/.exec(line); return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0; }
let attempts = 0, ok = 0, refused = 0, cleared = 0, deltaExact = 0, deltaBad = [];
let gorgeNights = 0, gorgeKcalTot = 0, convos = 0, fab = 0, sortieFights = 0;
let driftArtifacts = 0, driftValve = 0, driftOther = [];
let deadInMuster = 0, gorgeAfterCleared = 0;
const out = [];
for (const d of recs) {
  gorgeNights += d.gorgeNights.length;
  gorgeKcalTot += d.gorgeNights.reduce((t, g) => t + gorgeKcal(g.line), 0);
  convos += d.convosDriven.length; fab += d.fabricHits.length;
  for (const s of d.sorties) {
    attempts++;
    const r = s.ret || {};
    if (r.ok) {
      ok++;
      if (s.pantryDelta === -(r.paid || 0)) deltaExact++; else deltaBad.push({ seed: d.seed, day: s.day, delta: s.pantryDelta, paid: r.paid });
      if (r.remaining === 0) cleared++;
      sortieFights += s.fights.length;
      if (s.deadInMusterLine && s.deadInMusterLine.length) deadInMuster += s.deadInMusterLine.length;
    } else refused++;
  }
  for (const c of (d.clearedGorgeAfter || [])) {
    if (c.gorgeAfterNameMatched && c.gorgeAfterNameMatched.length) gorgeAfterCleared += c.gorgeAfterNameMatched.length;
  }
  // Drift classification
  for (const dr of (d.drifts || [])) {
    if (dr.clearedBySortieDay !== null) { driftArtifacts++; continue; }
    const melts = d.sayLines.filter(s => s.day >= dr.firstSeenDay && s.day <= dr.day && /melts back into the dark/.test(s.line));
    const moved = d.aidResolutions.filter(a => a.how === 'moved-on' && Math.abs(a.day - dr.day) <= 2);
    if (melts.length || moved.length) driftValve++;
    else driftOther.push({ seed: d.seed, ...dr, melts: melts.length, moved: moved.length });
  }
  out.push({ seed: d.seed, days: d.days, end: d.endReason, raids: d.raids.length, gorge: d.gorgeNights.length, sorties: d.sorties.length, convos: d.convosDriven.length, alive: d.census ? d.census.aliveCount : null, pantry: d.census ? d.census.pantryKcal : null });
}
console.log('PANEL seeds=' + recs.map(d => d.seed).join(','));
console.log(JSON.stringify(out, null, 1));
console.log('attempts=' + attempts + ' ok=' + ok + ' refused=' + refused + ' cleared(remaining0)=' + cleared + ' deltaExact=' + deltaExact + ' deltaBad=' + JSON.stringify(deltaBad));
console.log('gorgeNights=' + gorgeNights + ' gorgeKcal=' + gorgeKcalTot + ' convos=' + convos + ' fabricHits=' + fab + ' sortieFights=' + sortieFights);
console.log('driftArtifacts(sortie-clears)=' + driftArtifacts + ' driftValve(melts/moved-on)=' + driftValve + ' driftOther=' + JSON.stringify(driftOther, null, 1));
console.log('deadInMusterLines=' + deadInMuster + ' gorgeAfterCleared(name-matched)=' + gorgeAfterCleared);
console.log('D1 delayed>=3 attempts: ' + recs.flatMap(d => d.sorties).filter(s => s.nightsWaited >= 3).length + '/' + attempts);
console.log('D2 clear rate ok: ' + cleared + '/' + ok);
console.log('D6 convos=' + convos + ' fab=' + fab);
