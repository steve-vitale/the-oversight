#!/usr/bin/env node
// analyze-crisis-r60-delayed-20261028.js — LANE B crisis r60 analyzer (r57 verbatim EXCEPT glob + refused-book + bloodied checks).
// Reads journey-crisis-r60-delayed-seed*.json from the evidence dir and
// prints panel verdicts for the pre-registered metrics D1-D6:
// D1 snapshot completeness, D2 crisis-at-clear classification, D3 drift
// label counts (unknown must be 0), D4 people check, D5 price honesty,
// D6 episode-keyed gorge-after.
// Usage: node scripts/analyze-crisis-r60-delayed-20261028.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-28';
const files = fs.readdirSync(EVID).filter(f => /^journey-crisis-r60-delayed-seed\d+\.json$/.test(f)).sort();
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

// R57 additions: early-resolution census (D2/D7), death mismatches
// (D3), episode resets + old-vs-new nightsWaited (D1), convo contest
// snapshots (D4).
const earlyRes = [];
const earlyResLegacy = [];
const deathMismatch = [];
const episodeResets = [];
let convoSnapMissing = 0, convoSnapTotal = 0, driftOldNewDiff = 0, resLingeringMissing = 0;
for (const d of recs) {
  for (const a of (d.aidResolutions || [])) {
    if (!('lingeringAtResolution' in a)) resLingeringMissing++;
    // R59: TRUE count excludes the not-yet-removed corpse on an
    // aidFight vKill; legacy count keeps r57/r58 comparability.
    const trueCount = ('lingeringAtResolutionTrue' in a) ? a.lingeringAtResolutionTrue : a.lingeringAtResolution;
    if (a.how === 'fought' && (a.lingeringAtResolution || 0) > 0) {
      earlyResLegacy.push({ seed: d.seed, day: a.day, lingeringAtResolution: a.lingeringAtResolution });
    }
    if (a.how === 'fought' && (trueCount || 0) > 0) {
      const gorgeAfter = (d.gorgeNights || []).filter(g => g.day > a.day);
      const sortiesAfter = (d.sorties || []).filter(s => s.day > a.day);
      earlyRes.push({ seed: d.seed, day: a.day, during: a.during, lingeringAtResolution: a.lingeringAtResolution, lingeringAtResolutionTrue: trueCount, crisisName: a.crisisBefore && a.crisisBefore.name, gorgeAfterNights: gorgeAfter.length, gorgeAfterKcal: gorgeAfter.reduce((t, g) => t + gorgeKcal(g.line), 0), sortiesAfter: sortiesAfter.length, beat: (gorgeAfter.length > 0 || sortiesAfter.length > 0) ? 'beat-alive' : 'beat-dead' });
    }
  }
  for (const s of (d.sorties || [])) {
    const sayNames = new Set((s.deathsDuringSay || []).flatMap(x => x.names || []));
    const rosterNames = new Set(s.deathsDuring || []);
    for (const nm of sayNames) {
      if (!rosterNames.has(nm)) deathMismatch.push({ seed: d.seed, day: s.day, name: nm, deathsDuring: s.deathsDuring, sayLines: (s.deathsDuringSay || []).filter(x => (x.names || []).includes(nm)).map(x => x.line) });
    }
    if ((s.episodeInfo || []).some(e => e.episode > 1)) episodeResets.push({ seed: d.seed, day: s.day, episodeInfo: s.episodeInfo });
  }
  for (const dr of (d.drifts || [])) {
    if (dr.nightsWaitedOld !== null && dr.nightsWaitedOld !== undefined && dr.nightsWaitedOld !== dr.nightsWaited) driftOldNewDiff++;
  }
  for (const b of (d.lingerBook || [])) if (b.episode > 1) episodeResets.push({ seed: d.seed, book: b });
  for (const c of (d.convosDriven || [])) { convoSnapTotal++; if (!c.playerContests) convoSnapMissing++; }
}
console.log('R57 D2 early-resolution census (fought with lingerers remaining):');
console.log(JSON.stringify(earlyRes, null, 1));
console.log('R59 legacy early count (r57/r58 corpse-counting method): ' + earlyResLegacy.length + ' ' + JSON.stringify(earlyResLegacy.map(e => e.seed + ' d' + e.day + ':' + e.lingeringAtResolution)));
console.log('R59 TRUE early count (corpse excluded on aidFight vKill): ' + earlyRes.length);
console.log('R57 D7 beat classification: ' + JSON.stringify(earlyRes.map(e => e.seed + ' d' + e.day + ':' + e.beat)));
console.log('R57 D2 resolutions missing lingeringAtResolution: ' + resLingeringMissing);
console.log('R57 D3 death mismatches (say-only names): ' + JSON.stringify(deathMismatch, null, 1));
console.log('R57 D1 episode resets: ' + JSON.stringify(episodeResets, null, 1));
console.log('R57 D1 drift old-vs-new nightsWaited diffs: ' + driftOldNewDiff);
console.log('R57 D4 convo contest snapshots: total=' + convoSnapTotal + ' missing=' + convoSnapMissing);

// R57 additions: muster-aware death attribution (r54 metric review §2).
// Legacy roster-only mismatch above stays for comparison; the R57
// verdict uses roster ∪ muster: a say name is a mismatch ONLY if it
// is in neither deathsDuring (roster diff) nor the sortie's
// musterNames. Names explained by the muster are the Dina class,
// closed. Death-pattern lines with zero matched names are the
// residual unattributed set.
let musterParsed = 0, musterSortieLines = 0, musterNoLine = 0;
const r57Mismatch = [], musterExplained = [], unattributedDeathLines = [];
for (const d of recs) {
  for (const s of (d.sorties || [])) {
    const muster = new Set(s.musterNames || []);
    const rosterDiff = new Set(s.deathsDuring || []);
    if (s.sortieLine) {
      musterSortieLines++;
      if ((s.musterNames || []).length) musterParsed++;
    } else musterNoLine++;
    for (const x of (s.deathsDuringSay || [])) {
      if (!x.names || !x.names.length) unattributedDeathLines.push({ seed: d.seed, day: s.day, line: x.line });
      for (const nm of (x.names || [])) {
        if (rosterDiff.has(nm)) continue;
        if (muster.has(nm)) musterExplained.push({ seed: d.seed, day: s.day, name: nm, line: x.line });
        else r57Mismatch.push({ seed: d.seed, day: s.day, name: nm, deathsDuring: s.deathsDuring, musterNames: s.musterNames, line: x.line });
      }
    }
  }
}
console.log('R57 muster parse: sortieLines=' + musterSortieLines + ' parsed=' + musterParsed + ' noSortieLine=' + musterNoLine);
console.log('R57 D3 muster-aware mismatches (say name in neither roster diff nor muster): ' + JSON.stringify(r57Mismatch, null, 1));
console.log('R57 D3 muster-explained (Dina class, closed): ' + JSON.stringify(musterExplained, null, 1));
console.log('R57 D3 unattributed death lines (zero names matched): ' + JSON.stringify(unattributedDeathLines, null, 1));


// R58 checks: (a) refused-sortie book entries — a refused entry must NOT have
// moved its targets' book sorties/lastSortieDay to that day; (b) bloodied lines
// must be absent from deathsDuringSay.
console.log('R58 refused-sortie book check:');
for (const d of recs) {
  const book = new Map((d.lingerBook || []).map(b => [b.id, b]));
  for (const s of (d.sorties || [])) {
    if (s.ret && s.ret.ok) continue;
    for (const t of (s.targets || [])) {
      const b = book.get(t.id);
      console.log(JSON.stringify({ seed: d.seed, day: s.day, target: t.name, retOk: s.ret ? s.ret.ok : null, bookSorties: b ? b.sorties : null, bookLastSortieDay: b ? b.lastSortieDay : null, refusedDayIsLastSortie: b ? b.lastSortieDay === s.day : null }));
    }
  }
}
let bloodiedLines = 0;
for (const d of recs) for (const s of (d.sorties || [])) for (const x of (s.deathsDuringSay || [])) if (/bloodied/i.test(x.line)) { bloodiedLines++; console.log('R58 bloodied deathsDuringSay line: ' + JSON.stringify({ seed: d.seed, day: s.day, line: x.line })); }
console.log('R58 bloodied deathsDuringSay lines: ' + bloodiedLines);
