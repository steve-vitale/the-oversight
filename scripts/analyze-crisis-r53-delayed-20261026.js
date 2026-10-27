#!/usr/bin/env node
// analyze-crisis-r53-delayed-20261026.js — LANE B crisis r53 analyzer.
// Reads journey-crisis-r53-delayed-seed*.json from the evidence dir and
// prints panel verdicts for the pre-registered metrics D1-D6:
// D1 snapshot completeness, D2 crisis-at-clear classification, D3 drift
// label counts (unknown must be 0), D4 people check, D5 price honesty,
// D6 episode-keyed gorge-after.
// Usage: node scripts/analyze-crisis-r53-delayed-20261026.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';
const files = fs.readdirSync(EVID).filter(f => /^journey-crisis-r53-delayed-seed\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
function gorgeKcal(line) { const m = /([\d,]+) kcal/.exec(line); return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0; }
function crisisClass(c) {
  if (c === null || c === undefined) return 'none';
  if (c.error) return 'error';
  return c.raiders ? 'live-raiders' : 'live-nonraiders';
}
let attempts = 0, ok = 0, refused = 0, cleared = 0, deltaExact = 0;
const deltaBad = [];
let gorgeNights = 0, gorgeKcalTot = 0, convos = 0, fab = 0, sortieFights = 0;
let snapMissing = 0, snapTotal = 0;
const clearTable = [];
const driftCounts = {};
const driftUnknown = [];
let deadInMuster = 0, gorgeAfterCleared = 0;
const out = [];
for (const d of recs) {
  gorgeNights += d.gorgeNights.length;
  gorgeKcalTot += d.gorgeNights.reduce((t, g) => t + gorgeKcal(g.line), 0);
  convos += d.convosDriven.length; fab += d.fabricHits.length;
  for (const s of d.sorties) {
    attempts++;
    snapTotal++;
    if (!('crisisBefore' in s) || !('crisisAfter' in s)) snapMissing++;
    const r = s.ret || {};
    if (r.ok) {
      ok++;
      if (s.pantryDelta === -(r.paid || 0)) deltaExact++; else deltaBad.push({ seed: d.seed, day: s.day, delta: s.pantryDelta, paid: r.paid });
      if (r.remaining === 0) {
        cleared++;
        // Same-day tick resolutions AFTER the sortie call (not in
        // resolutionsDuring): commsTick can resolve later that day.
        const duringKeys = new Set((s.resolutionsDuring || []).map(x => x.day + '|' + x.how + '|' + x.during));
        const laterSameDay = (d.aidResolutions || []).filter(a => a.day === s.day && !duringKeys.has(a.day + '|' + a.how + '|' + a.during));
        clearTable.push({
          seed: d.seed, day: s.day, nightsWaited: s.nightsWaited,
          crisisBefore: crisisClass(s.crisisBefore), crisisBeforeName: s.crisisBefore && s.crisisBefore.name,
          crisisBeforeSince: s.crisisBefore && s.crisisBefore.sinceDay,
          crisisAfter: crisisClass(s.crisisAfter),
          resolutionsDuring: (s.resolutionsDuring || []).map(x => x.how + '(' + x.during + ')'),
          laterSameDay: laterSameDay.map(x => x.how + '(' + x.during + ')'),
        });
      }
      sortieFights += s.fights.length;
      if (s.deadInMusterLine && s.deadInMusterLine.length) deadInMuster += s.deadInMusterLine.length;
    } else refused++;
  }
  for (const c of (d.clearedGorgeAfter || [])) {
    if (c.gorgeAfterNameMatched && c.gorgeAfterNameMatched.length) gorgeAfterCleared += c.gorgeAfterNameMatched.length;
  }
  for (const dr of (d.drifts || [])) {
    driftCounts[dr.label] = (driftCounts[dr.label] || 0) + 1;
    if (dr.label === 'unknown') driftUnknown.push({ seed: d.seed, ...dr });
  }
  out.push({ seed: d.seed, days: d.days, end: d.endReason, raids: d.raids.length, gorge: d.gorgeNights.length, sorties: d.sorties.length, convos: d.convosDriven.length, drifts: (d.drifts || []).length, resolutions: (d.aidResolutions || []).map(a => 'd' + a.day + ':' + a.how + '(' + a.during + ')'), alive: d.census ? d.census.aliveCount : null, pantry: d.census ? d.census.pantryKcal : null });
}
console.log('PANEL seeds=' + recs.map(d => d.seed).join(','));
console.log(JSON.stringify(out, null, 1));
console.log('attempts=' + attempts + ' ok=' + ok + ' refused=' + refused + ' cleared(remaining0)=' + cleared + ' deltaExact=' + deltaExact + ' deltaBad=' + JSON.stringify(deltaBad));
console.log('gorgeNights=' + gorgeNights + ' gorgeKcal=' + gorgeKcalTot + ' convos=' + convos + ' fabricHits=' + fab + ' sortieFights=' + sortieFights);
console.log('D1 snapshots: total=' + snapTotal + ' missing=' + snapMissing);
console.log('D2 crisis-at-clear table:');
console.log(JSON.stringify(clearTable, null, 1));
console.log('D3 drift labels: ' + JSON.stringify(driftCounts));
console.log('D3 drift unknown: ' + JSON.stringify(driftUnknown, null, 1));
console.log('D5 deltaBad=' + JSON.stringify(deltaBad));
console.log('deadInMusterLines=' + deadInMuster + ' gorgeAfterCleared(name-matched)=' + gorgeAfterCleared);
console.log('D1 delayed>=3 attempts: ' + recs.flatMap(d => d.sorties).filter(s => s.nightsWaited >= 3).length + '/' + attempts);
console.log('D2 clear rate ok: ' + cleared + '/' + ok);
console.log('D4 convos=' + convos + ' fab=' + fab);
