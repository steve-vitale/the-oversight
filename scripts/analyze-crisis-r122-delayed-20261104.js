#!/usr/bin/env node
// analyze-crisis-r122-delayed-20261104.js — LANE B crisis r122 analyzer (r71 verbatim EXCEPT glob + V1/F1 sections).
// Reads journey-crisis-r122-delayed-seed*.json from the evidence dir and
// prints panel verdicts for the pre-registered metrics D1-D6:
// D1 snapshot completeness, D2 crisis-at-clear classification, D3 drift
// label counts (unknown must be 0), D4 people check, D5 price honesty,
// D6 episode-keyed gorge-after.
// Usage: node scripts/analyze-crisis-r71-delayed-20261030.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-04';
const files = fs.readdirSync(EVID).filter(f => /^journey-crisis-r122-delayed-seed\d+\.json$/.test(f)).sort();
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
let deadInMuster = 0, gorgeAfterCleared = 0, gorgeAfterIdMatched = 0, gorgeAfterReturn = 0;
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
    if (c.gorgeAfterIdMatched && c.gorgeAfterIdMatched.length) gorgeAfterIdMatched += c.gorgeAfterIdMatched.length;
    if (c.gorgeAfterReturn && c.gorgeAfterReturn.length) gorgeAfterReturn += c.gorgeAfterReturn.length;
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
console.log('deadInMusterLines=' + deadInMuster + ' gorgeAfterCleared(name-matched)=' + gorgeAfterCleared + ' gorgeAfterIdMatched=' + gorgeAfterIdMatched + ' gorgeAfterReturn=' + gorgeAfterReturn);
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


// R70 additions: phoenix burn-chain census, linger-conditional
// gorge/sortie judgment (prereg C2b), days-tail wobble (prereg C6).
console.log('R70 phoenix burn-chain census:');
for (const d of recs) {
  const burns = d.phoenixBurns || [];
  const byFight = {};
  for (const b of burns) {
    const k = (b.fight === null || b.fight === undefined) ? 'outside-fight' : ('fight#' + b.fight);
    byFight[k] = (byFight[k] || 0) + 1;
  }
  const fightCounts = Object.entries(byFight).filter(([k]) => k !== 'outside-fight').map(([, v]) => v);
  const maxSayDay = (d.sayLines || []).reduce((m, s) => Math.max(m, s.day || 0), 0);
  const lastDeathDay = (d.deaths || []).reduce((m, x) => Math.max(m, x.day || 0), 0);
  console.log(JSON.stringify({
    seed: d.seed, end: d.endReason, daysField: d.days, maxSayDay, lastDeathDay,
    wrapMissing: !!d.phoenixBurnWrapMissing,
    burnsTotal: burns.length,
    burnsWilling: burns.filter(b => b.willing).length,
    burnsOutsideFight: byFight['outside-fight'] || 0,
    maxBurnsOneFight: fightCounts.length ? Math.max(...fightCounts) : 0,
    fightsWith2Plus: fightCounts.filter(v => v >= 2).length,
    fightsWith6Plus: fightCounts.filter(v => v >= 6).length,
    burnsByDay: burns.reduce((acc, b) => { acc[b.day] = (acc[b.day] || 0) + 1; return acc; }, {}),
    burns: burns.map(b => 'd' + b.day + ':' + b.victim + (b.willing ? '(willing)' : '') + (b.fight === null ? '(outside)' : '(f#' + b.fight + ')')),
  }));
}
console.log('R70 linger-conditional gorge/sortie judgment (prereg C2b):');
for (const d of recs) {
  const lingered = ((d.lingerDaily || []).some(x => x.n > 0)) || ((d.lingerBook || []).length > 0);
  console.log(JSON.stringify({
    seed: d.seed, lingererSetFormed: lingered,
    gorgeNights: (d.gorgeNights || []).length, sorties: (d.sorties || []).length,
    verdict: lingered ? 'judged on gorge+sorties' : 'PASS episodes-fire on raids+resolutions alone (no lingerers to gorge/sortie)',
  }));
}

// R82 sections: V1 defender-voice steering + F1 favor call-time log.
console.log('R82 V1 defender steering:');
for (const d of recs) {
  for (const c of (d.convosDriven || [])) {
    if (c.tag === 'DEFENDER-after-resolution') console.log(JSON.stringify({ seed: d.seed, day: c.day, file: c.file, vid: c.vid, latelySteered: !!c.latelySteered, latelyOffered: !!c.latelyOffered, latelyFired: !!c.latelyFired, subjectNavs: c.subjectNavs || 0 }));
  }
}
console.log('R82 F1 favor call-time no-longer entries:');
for (const d of recs) {
  console.log(JSON.stringify({ seed: d.seed, wrapMissing: !!d.favorNoLongerWrapMissing, entries: d.favorNoLongerCalls || [] }));
}

// R88 sections: tick-part sampler coverage, skipped-window analysis,
// boundary-sortie cross-check, C7 famine/disease pressure census.
console.log('R88 tick-part sampler coverage:');
for (const d of recs) {
  const tp = d.lingerTickParts || [];
  const waited = tp.filter(s => (s.nightsWaited || 0) >= 3);
  const verbs = {};
  for (const s of tp) verbs[s.verb] = (verbs[s.verb] || 0) + 1;
  console.log(JSON.stringify({ seed: d.seed, doActionWrapMissing: !!d.doActionWrapMissing, samples: tp.length, waitedGe3: waited.length, verbs, instrumentErrors: d.instrumentErrors || [] }));
}
console.log('R88 skipped-window analysis (drift with a tick-part waited>=3 sample after lastSeenDay and <= drift day, same id+episode):');
let missedTotal = 0;
for (const d of recs) {
  const tp = d.lingerTickParts || [];
  for (const dr of (d.drifts || [])) {
    const hits = tp.filter(s => s.id === dr.id && s.episode === dr.episode && (s.nightsWaited || 0) >= 3 && dr.lastSeenDay !== null && s.day > dr.lastSeenDay && s.day <= dr.day);
    if (hits.length) {
      missedTotal++;
      console.log(JSON.stringify({ seed: d.seed, driftDay: dr.day, id: dr.id, name: dr.name, episode: dr.episode, lastSeenDay: dr.lastSeenDay, label: dr.label, windowSamples: hits.length, firstWindowDay: hits[0].day, firstWindowWaited: hits[0].nightsWaited }));
    }
  }
}
console.log('R88 missed-window total=' + missedTotal);
console.log('R88 boundary-sortie cross-check (each sortie target should have a prior tick-part waited>=3 sample):');
for (const d of recs) {
  const tp = d.lingerTickParts || [];
  for (const s of (d.sorties || [])) {
    const checks = (s.targets || []).map(t => {
      const hit = tp.filter(x => x.id === t.id && (x.nightsWaited || 0) >= 3 && x.day <= s.day);
      return { id: t.id, name: t.name, priorWaitedGe3Samples: hit.length };
    });
    console.log(JSON.stringify({ seed: d.seed, day: s.day, ok: !!(s.ret && s.ret.ok), checks }));
  }
}
console.log('R88 C7 famine/disease pressure census:');
for (const d of recs) {
  const pd = d.pantryDaily || [];
  let low = null;
  for (const row of pd) { if (row.kcal !== null && (low === null || row.kcal < low.kcal)) low = row; }
  const causeHit = (re, list) => (list || []).filter(x => re.test(String((x.cause || '')))).map(x => ({ day: x.day, name: x.name, cause: x.cause }));
  const deaths = d.deaths || [];
  const corpses = (d.census && d.census.corpses) || [];
  console.log(JSON.stringify({ seed: d.seed, end: d.endReason, pantryLow: low, pantryFinal: d.census ? d.census.pantryKcal : null, alive: d.census ? d.census.aliveCount : null, famineDeaths: causeHit(/famin|starv|hunger|malnour/i, deaths), diseaseDeaths: causeHit(/disease|sick|fever|infect|plague|illness/i, deaths), woundDeaths: causeHit(/wound|injur|bleed/i, deaths), corpseFamine: causeHit(/famin|starv|hunger|malnour/i, corpses), corpseDisease: causeHit(/disease|sick|fever|infect|plague|illness/i, corpses) }));
}

// R122 id-attributed gorge-after-clear (capture-time attribution, key +
// cleared episode). The name-matched count above is kept for comparison;
// the id-matched count is the verdict-bearing number. Panels recorded
// before r122 carry no attribution fields: they report idMatched 0
// with attributedFields false, and their name counts reproduce the
// old verdicts unchanged (backward-compat proof, not a new finding).
console.log('R122 gorge attribution census + id-matched gorge-after-clear:');
for (const d of recs) {
  const gs = d.gorgeNights || [];
  const hasAttr = gs.some(g => ('attribution' in g));
  const byAttr = { single: 0, ambiguous: 0, none: 0 };
  for (const g of gs) if (g.attribution) byAttr[g.attribution] = (byAttr[g.attribution] || 0) + 1;
  // Same-night same-name groups: >1 gorge event, one night, one name.
  // Their attributed keys say whether one monster gorged twice or two
  // individuals gorged once each (r117 d75 double-Eulogy question).
  const groups = {};
  for (const g of gs) { const nm = g.name || ((/The lingering (.+?) gorges at the treeline/.exec(g.line || '') || [])[1]) || '?'; const k = g.day + '|' + nm; (groups[k] = groups[k] || []).push(g); }
  const multiGroups = Object.entries(groups).filter(([, v]) => v.length > 1).map(([k, v]) => ({ night: k, events: v.length, attributedKeys: v.map(g => (g.attributedKey === undefined ? null : g.attributedKey)), attributions: v.map(g => g.attribution || null) }));
  const clearedRows = (d.clearedGorgeAfter || []).map(c => ({ key: c.key === undefined ? null : c.key, id: c.id, clearedDay: c.clearedDay, clearedEpisode: c.clearedEpisode === undefined ? null : c.clearedEpisode, nameMatched: (c.gorgeAfterNameMatched || []).length, idMatched: (c.gorgeAfterIdMatched || []).length, returned: (c.gorgeAfterReturn || []).length, idMatchedEvents: c.gorgeAfterIdMatched || [], returnEvents: c.gorgeAfterReturn || [] }));
  console.log(JSON.stringify({ seed: d.seed, attributedFields: hasAttr, gorgeTotal: gs.length, byAttribution: byAttr, multiGroups, clearedRows }));
}
console.log('R122 panel totals: gorgeAfterIdMatched=' + gorgeAfterIdMatched + ' gorgeAfterReturn=' + gorgeAfterReturn + ' (name-matched=' + gorgeAfterCleared + ' above, for comparison)');
