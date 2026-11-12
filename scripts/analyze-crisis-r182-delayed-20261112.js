#!/usr/bin/env node
// analyze-crisis-r182-delayed-20261112.js — LANE B crisis r182 analyzer.
// Reads journey-crisis-r182-delayed-seed*.json from the evidence dir and
// prints panel verdicts for the pre-registered metrics D1-D6:
// D1 snapshot completeness, D2 crisis-at-clear classification, D3 drift
// label counts (unknown must be 0), D4 people check, D5 price honesty,
// D6 episode-keyed gorge-after.
// R154 additions: corrected missed-window count (sortie-attempt exclusion),
// drift-duplicate census, fight-1 vTaken vs break summary.
// Usage: node scripts/analyze-crisis-r182-delayed-20261112.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-12';
const files = fs.readdirSync(EVID).filter(f => /^journey-crisis-r182-delayed-seed\d+\.json$/.test(f)).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
function gorgeKcal(line) { const m = /([\d,]+) kcal/.exec(line); return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0; }
// R132: a name that appears as "<Name> killed ..." in a say line is the
// killer, not the dead (Ruth class, r131: "Ruth killed the Herald" was
// flagged as death-ish). Death-mismatch matching ignores killer-subject
// names; a line whose only names are killers is a kill report, not a
// death report, and is skipped by the D3 loops below.
function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function killerSubject(line, nm) { return new RegExp('(^|[^A-Za-z])' + escRe(nm) + ' killed', 'i').test(String(line || '')); }
function liveDeathNames(x) { return (x.names || []).filter(nm => !killerSubject(x.line, nm)); }
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
// R154 SOFTLOCK summary: seeds the frozen-day detector stopped. A softlock
// seed is NOT a horizon seed — its days/alive/pantry are the frozen state,
// and its frozenGameDay is the day the clock stopped on.
{
  const locked = recs.filter(d => d.endReason === 'softlock').map(d => ({ seed: d.seed, frozenGameDay: d.softlock ? d.softlock.frozenGameDay : null, iterationsAtFreeze: d.softlock ? d.softlock.iterationsAtFreeze : null, sayLinesTotal: d.softlock ? d.softlock.sayLinesTotal : null, inCombat: d.softlock ? d.softlock.inCombat : null, fight: d.softlock ? d.softlock.fight : null }));
  console.log('R181 SOFTLOCK seeds=' + locked.length + ' ' + JSON.stringify(locked, null, 1));
}

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
    const sayEntries = (s.deathsDuringSay || []).map(x => ({ ...x, names: liveDeathNames(x) }));
    const sayNames = new Set(sayEntries.flatMap(x => x.names || []));
    const rosterNames = new Set(s.deathsDuring || []);
    for (const nm of sayNames) {
      if (!rosterNames.has(nm)) deathMismatch.push({ seed: d.seed, day: s.day, name: nm, deathsDuring: s.deathsDuring, sayLines: sayEntries.filter(x => (x.names || []).includes(nm)).map(x => x.line) });
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
      const liveNames = liveDeathNames(x);
      if (!liveNames.length) continue; // kill report, not a death report (R132)
      if (!x.names || !x.names.length) unattributedDeathLines.push({ seed: d.seed, day: s.day, line: x.line });
      for (const nm of liveNames) {
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

// R181 D3 LEADER-AWARE (r180 filed item): a say name is a mismatch ONLY
// if it is in neither deathsDuring (roster diff), the muster, nor the
// sortie's leader deaths (deathsDuringLeader — fieldFight vDie rows,
// e.g. r180 14403 d86 Pavel). Names explained by a leader death are
// the Pavel class, closed. Legacy muster-aware block above stays for
// comparison.
let leaderExplained = 0;
const r181Mismatch = [];
for (const d of recs) {
  for (const srt of (d.sorties || [])) {
    const known = new Set([...(srt.deathsDuring || []), ...(srt.musterNames || []), ...((srt.deathsDuringLeader || []).map(l => l.leader))]);
    for (const x of (srt.deathsDuringSay || [])) {
      const liveNames = liveDeathNames(x);
      if (!liveNames.length) continue;
      for (const nm of liveNames) {
        if (known.has(nm)) {
          if ((srt.deathsDuringLeader || []).some(l => l.leader === nm)) leaderExplained++;
          continue;
        }
        r181Mismatch.push({ seed: d.seed, day: srt.day, name: nm, deathsDuring: srt.deathsDuring, deathsDuringLeader: srt.deathsDuringLeader, musterNames: srt.musterNames, line: x.line });
      }
    }
  }
}
console.log('R181 D3 leader-aware mismatches (say name in neither roster diff, muster, nor leader deaths): ' + JSON.stringify(r181Mismatch, null, 1));
console.log('R181 D3 leader-explained (Pavel class, closed): ' + leaderExplained);


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
// R154 CORRECTED missed-window (r132 metric review): a drift whose set had
// any sortie attempt (ok or refused) with day > lastSeenDay and day <=
// drift day is NOT a miss — the refusal or the broken sortie IS the answer.
// The raw count above stays for comparison; the corrected count is the watch
// number from here on (r132 corrected = 1).
let missedCorrected = 0; const missedExcluded = [], missedKept = [];
for (const d of recs) {
  const tp = d.lingerTickParts || [];
  for (const dr of (d.drifts || [])) {
    const hits = tp.filter(s => s.id === dr.id && s.episode === dr.episode && (s.nightsWaited || 0) >= 3 && dr.lastSeenDay !== null && s.day > dr.lastSeenDay && s.day <= dr.day);
    if (!hits.length) continue;
    const answered = (d.sorties || []).some(s => s.day > dr.lastSeenDay && s.day <= dr.day && (s.episodeInfo || []).some(e => e.id === dr.id && e.episode === dr.episode));
    const row = { seed: d.seed, driftDay: dr.day, id: dr.id, name: dr.name, episode: dr.episode, lastSeenDay: dr.lastSeenDay, label: dr.label };
    if (answered) missedExcluded.push(row); else { missedCorrected++; missedKept.push(row); }
  }
}
console.log('R154 missed-window corrected=' + missedCorrected + ' (raw=' + missedTotal + ', excluded-answered=' + missedExcluded.length + ')');
// R155 (r154 metric review): per-DAY missed-window count alongside the
// per-object count — one missed day covering 4 lingerer objects reads as 4.
const missedDays = new Set(missedKept.map(r => r.seed + '|d' + r.driftDay)).size;
console.log('R155 missed-window per-day=' + missedDays + ' (per-object corrected=' + missedCorrected + ')');
// R164 (r156 metric review): split the corrected count into valve-expiry
// vs drawn-off — the two mechanisms the corrected count conflates.
// Valve-expiry ('moved-on-valve'): the player waited in place and the
// set's moved-on valve fired — the real instrument signal. Drawn-off
// ('player-drawn-off'): the player was pulled away — a choice/consequence,
// not a miss. Other labels (melts-line, sortie-clear, unknown) are the
// remainder; unknown must stay 0 (D3).
{
  const byLabel = {};
  for (const r of missedKept) byLabel[r.label] = (byLabel[r.label] || 0) + 1;
  const valveKept = missedKept.filter(r => r.label === 'moved-on-valve');
  const drawnKept = missedKept.filter(r => r.label === 'player-drawn-off');
  const valveDays = new Set(valveKept.map(r => r.seed + '|d' + r.driftDay)).size;
  const drawnDays = new Set(drawnKept.map(r => r.seed + '|d' + r.driftDay)).size;
  console.log('R181 missed-window split (corrected=' + missedCorrected + '): valve-expiry=' + valveKept.length + ' per-day=' + valveDays + ' drawn-off=' + drawnKept.length + ' per-day=' + drawnDays + ' byLabel=' + JSON.stringify(byLabel));
}
console.log('R154 missed-window kept (true misses): ' + JSON.stringify(missedKept, null, 1));
console.log('R154 missed-window excluded (sortie attempt answered the set): ' + JSON.stringify(missedExcluded, null, 1));
// R154 drift-duplicate census (r132's 13304 d70 eater double-count): the
// driver now dedupes identical (id, episode, day, label) records at write
// time; any duplicate left in the JSONs is a live double-count. Also sums
// the driver's driftDupesSkipped counter.
{
  const seen = new Map(); let dupes = 0; const dupeRows = [];
  let skippedTotal = 0;
  for (const d of recs) {
    skippedTotal += (d.driftDupesSkipped || 0);
    for (const dr of (d.drifts || [])) {
      const k = dr.id + '|' + dr.episode + '|' + dr.day + '|' + dr.label;
      if (seen.has(k)) { dupes++; dupeRows.push({ seed: d.seed, key: k, name: dr.name }); }
      else seen.set(k, 1);
    }
  }
  console.log('R154 drift duplicates in panel JSONs=' + dupes + ' driverSkipped=' + skippedTotal + ' ' + JSON.stringify(dupeRows));
}
// R126: cross-check classifies each target as waited-ge3 / sampled-lt3 /
// none (no prior tick-part sample at all). A 'none' target that fired via
// the boundary rule (day - firstSeenDay >= 3 at the boundary) is
// boundary-joined, a different class from a missed window, not a
// cross-check failure. Classification only; no bar moves.
console.log('R126 boundary-sortie cross-check (waited-ge3 / sampled-lt3 / none per target):');
for (const d of recs) {
  const tp = d.lingerTickParts || [];
  for (const s of (d.sorties || [])) {
    const checks = (s.targets || []).map(t => {
      const hit = tp.filter(x => x.id === t.id && (x.nightsWaited || 0) >= 3 && x.day <= s.day);
      const any = tp.filter(x => x.id === t.id && x.day <= s.day);
      const sampleClass = hit.length ? 'waited-ge3' : (any.length ? 'sampled-lt3' : 'none');
      return { id: t.id, name: t.name, priorWaitedGe3Samples: hit.length, priorSamples: any.length, sampleClass };
    });
    // R155 (r154 metric review): a refusal WITH a recorded reason counts as
    // ok, not unfired — the refusal IS the answer for that boundary.
    console.log(JSON.stringify({ seed: d.seed, day: s.day, ok: !!(s.ret && (s.ret.ok || s.ret.why)), checks }));
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
  console.log(JSON.stringify({ seed: d.seed, end: d.endReason, pantryLow: low, pantryFinal: d.census ? d.census.pantryKcal : null, alive: d.census ? d.census.aliveCount : null, famineDeaths: causeHit(/famin|starv|hunger|malnour/i, deaths), diseaseDeaths: causeHit(/disease|sick|fever|infect|plague|illness/i, deaths), woundDeaths: causeHit(/wound|injur|bleed/i, deaths), corpseFamine: causeHit(/famin|starv|hunger|malnour/i, corpses), corpseDisease: causeHit(/disease|sick|fever|infect|plague|illness/i, corpses), corpseWounds: causeHit(/wound|injur|bleed/i, corpses), corpseThirst: causeHit(/thirst|dehydrat/i, corpses) }));
}
// R132 C7b (r131 deaths-feed gap): corpse-cause counts read from the corpse
// record alongside the feed counts above. The feed sees only combat deaths;
// C7b is the verdict-bearing count for famine/disease/wound/thirst.
console.log('R132 C7b corpse-cause counts (feed vs corpse record):');
for (const d of recs) {
  const causeCount = (re, list) => (list || []).filter(x => re.test(String((x.cause || '')))).length;
  const deaths = d.deaths || [];
  const corpses = (d.census && d.census.corpses) || [];
  const row = (re) => ({ feed: causeCount(re, deaths), corpse: causeCount(re, corpses) });
  console.log(JSON.stringify({ seed: d.seed, famine: row(/famin|starv|hunger|malnour/i), disease: row(/disease|sick|fever|infect|plague|illness/i), wound: row(/wound|injur|bleed/i), thirst: row(/thirst|dehydrat/i), corpseTotal: corpses.length, deathsTotal: deaths.length, corpseCauses: corpses.map(c => ({ day: c.day, name: c.name, cause: c.cause })) }));
}

// R155 C7b say-line cross-check (r154 metric review): the corpse record
// misses BURIED dead (Elif/Tashi, 13504) — cross-check corpse tallies
// against the say-line death record as well. The record is the CANDLE
// notice ("🕯️ <Name> is dead — <cause>."), the village's own death
// notice WITH a cause (sickness/starvation/dehydration/the wild/the
// arena). The Codex notice ("📖 ... is dead") fires for monsters too
// and is EXCLUDED; a bare name + death-word co-occurrence
// false-positives on succession lines. Each death gets two candle
// forms (treaties form + cause form); dedupe by first name, keep the
// longest name and the first real cause. The buried list is the
// deliverable: candle names absent from the corpse list.
console.log('R155 C7b say-line death record (buried dead never reach the corpse list):');
for (const d of recs) {
  const corpses = (d.census && d.census.corpses) || [];
  const corpseNames = new Set(corpses.map(c => c.name));
  const byFirst = {};
  for (const s of (d.sayLines || [])) {
    const line = String(s.line || '');
    if (line.indexOf('🕯️') !== 0) continue;
    const m = /🕯️\s+([A-Z][a-z]+(?:[ -][A-Z][a-z]+)*) is dead — ([^.]+)\./.exec(line);
    if (!m) continue;
    const full = m[1];
    const causeText = (m[2] || '').trim();
    const first = full.split(' ')[0];
    const prev = byFirst[first];
    const cause = causeText === 'and the dead hold no treaties' ? null : causeText;
    if (!prev) byFirst[first] = { name: full, cause: cause || 'unknown' };
    else {
      if (full.length > prev.name.length) prev.name = full;
      if (prev.cause === 'unknown' && cause) prev.cause = cause;
    }
  }
  const sayDeaths = Object.values(byFirst);
  const buried = sayDeaths.filter(x => !corpseNames.has(x.name)).map(x => x.name);
  const sayCount = (re) => sayDeaths.filter(x => re.test(String(x.cause || ''))).length;
  console.log(JSON.stringify({ seed: d.seed, deathsFeed: (d.deaths || []).length, corpseTotal: corpses.length, sayDeaths: sayDeaths.length, buried, sayFamine: sayCount(/famin|starv/i), sayDisease: sayCount(/sick/i), sayWound: sayCount(/wound|injur|bleed/i), sayThirst: sayCount(/dehydrat/i), sayWild: sayCount(/the wild|the arena/i), sayUnknownCause: sayDeaths.filter(x => x.cause === 'unknown').length }));
}

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

// R128 WRAP section: every driven transcript must carry a marked ending.
// Marker set (prereg): engine-ended, refused/ended, no-choices, turn threw,
// startConvo threw, convoChoices threw, convoGet threw, driver leave break,
// driver cap break. A transcript with none of these is UNMARKED.
console.log('R128 WRAP marked-ending check (prereg marker set):');
{
  const MARKERS = ['(conversation ended by the engine)', '(conversation refused/ended)', '(no choices offered)', '(turn threw:', '(startConvo threw:', '(convoChoices threw:', '(convoGet threw:', '(driver leave break:', '(driver cap break:'];
  let marked = 0, unmarked = 0; const unmarkedFiles = []; const markerCounts = {};
  for (const d of recs) for (const c of (d.convosDriven || [])) {
    let txt = '';
    try { txt = fs.readFileSync(path.join(EVID, c.file), 'utf8'); } catch (e) { txt = ''; }
    const hits = MARKERS.filter(m => txt.indexOf(m) !== -1);
    for (const h of hits) markerCounts[h] = (markerCounts[h] || 0) + 1;
    if (hits.length) marked++; else { unmarked++; unmarkedFiles.push({ seed: d.seed, file: c.file, tag: c.tag, day: c.day }); }
  }
  console.log(JSON.stringify({ transcripts: marked + unmarked, marked, unmarked, markerCounts, unmarkedFiles }));
}

// R132 BENCH section: at every REFUSED sortie, what did the bench look like?
// Shapes: gate-one-short (musterAvailable==1 — one fighter short of the
// gate of 2), supply-empty (musterAvailable==0 and livingBesidesPlayer<=1 —
// nobody left to send), availability-drain (livingBesidesPlayer>=2 but
// musterAvailable<2 — people exist but are away / with you / engaged /
// wounded). Also counts ok sorties after a refusal and full clears after a
// refusal (W1, carried forward: 66 refusals / 4 same-set re-musters /
// 4 ok sorties after a refusal / 1 full clear after a refusal, r150 close).
console.log('R181 BENCH refused-sortie bench census (prereg: gate vs supply vs availability):');
{
  const refusedRows = [];
  const okAfterRefusal = [];
  const clearedAfterRefusal = [];
  const sameSetRemusters = [];
  for (const d of recs) {
    const refusedSets = []; // {day, keys:Set('id|episode')}
    for (const s of (d.sorties || [])) {
      if (s.ret && !s.ret.ok) {
        const keys = new Set((s.episodeInfo || []).map(e => e.id + '|' + e.episode));
        refusedSets.push({ day: s.day, keys });
        const b = s.bench || {};
        refusedRows.push({ seed: d.seed, day: s.day, why: (s.ret || {}).why || null, musterAvailable: (b.musterAvailable === undefined ? null : b.musterAvailable), livingBesidesPlayer: (b.livingBesidesPlayer === undefined ? null : b.livingBesidesPlayer), excluded: b.excluded || null, benchMissing: !('bench' in s) });
      }
    }
    for (const s of (d.sorties || [])) {
      if (s.ret && s.ret.ok) {
        const keys = new Set((s.episodeInfo || []).map(e => e.id + '|' + e.episode));
        const prior = refusedSets.filter(rs => rs.day < s.day && [...rs.keys].some(k => keys.has(k)));
        if (prior.length) {
          sameSetRemusters.push({ seed: d.seed, day: s.day, priorRefusalDays: prior.map(p => p.day), remaining: s.ret.remaining });
          okAfterRefusal.push({ seed: d.seed, day: s.day, priorRefusalDays: prior.map(p => p.day), remaining: s.ret.remaining });
          if (s.ret.remaining === 0) clearedAfterRefusal.push({ seed: d.seed, day: s.day, priorRefusalDays: prior.map(p => p.day) });
        }
      }
    }
  }
  const byMuster = {};
  for (const r of refusedRows) { const k = String(r.musterAvailable); byMuster[k] = (byMuster[k] || 0) + 1; }
  const shape = { gateOneShort: 0, supplyEmpty: 0, availabilityDrain: 0, other: 0 };
  for (const r of refusedRows) {
    if (r.musterAvailable === 1) shape.gateOneShort++;
    else if (r.musterAvailable === 0 && (r.livingBesidesPlayer === null || r.livingBesidesPlayer <= 1)) shape.supplyEmpty++;
    else if (r.musterAvailable !== null && r.musterAvailable < 2 && r.livingBesidesPlayer !== null && r.livingBesidesPlayer >= 2) shape.availabilityDrain++;
    else shape.other++;
  }
  const exclTot = { away: 0, nodeAway: 0, withYou: 0, engaged: 0, nonMember: 0, dead: 0 };
  for (const r of refusedRows) { const e = r.excluded || {}; for (const k of Object.keys(exclTot)) exclTot[k] += (e[k] || 0); }
  console.log(JSON.stringify({ refused: refusedRows.length, byMusterAvailable: byMuster, shape, exclusionTotalsAcrossRefusals: exclTot }));
  // R132 (r131 metric review): the drain question restricted to
  // non-terminal villages — among refusals while the bench is still alive
  // (livingBesidesPlayer >= 2), does nodeAway predict the refusal?
  const aliveBench = refusedRows.filter(r => r.livingBesidesPlayer !== null && r.livingBesidesPlayer >= 2);
  const aliveShape = { gateOneShort: 0, supplyEmpty: 0, availabilityDrain: 0, other: 0 };
  for (const r of aliveBench) {
    if (r.musterAvailable === 1) aliveShape.gateOneShort++;
    else if (r.musterAvailable === 0 && (r.livingBesidesPlayer === null || r.livingBesidesPlayer <= 1)) aliveShape.supplyEmpty++;
    else if (r.musterAvailable !== null && r.musterAvailable < 2 && r.livingBesidesPlayer !== null && r.livingBesidesPlayer >= 2) aliveShape.availabilityDrain++;
    else aliveShape.other++;
  }
  const aliveNodeAway = aliveBench.reduce((t, r) => t + (((r.excluded || {}).nodeAway) || 0), 0);
  const aliveAway = aliveBench.reduce((t, r) => t + (((r.excluded || {}).away) || 0), 0);
  console.log(JSON.stringify({ aliveBenchRefusals: aliveBench.length, aliveShape, aliveNodeAwayExclusions: aliveNodeAway, aliveAwayExclusions: aliveAway, aliveBenchRows: aliveBench }));
  console.log(JSON.stringify({ refusedRows }, null, 1));
  console.log('R181 W1 carried count: same-set re-musters after a refusal=' + JSON.stringify(sameSetRemusters, null, 1));
  console.log('R181 W1 carried count: ok sorties after a refusal on the same set=' + JSON.stringify(okAfterRefusal, null, 1));
  console.log('R181 W1 carried count: full clears after a refusal on the same set=' + JSON.stringify(clearedAfterRefusal, null, 1));
  // R132 (r131 metric review): muster size vs break — per ok sortie, party
  // size, set size, fights fought with outcomes, and what broke it. The
  // question: would a 4+ fighter muster clear, or is wound-accumulation
  // across sequential fights the break driver?
  console.log('R181 muster-size vs break (per ok sortie):');
  for (const d of recs) for (const s of (d.sorties || [])) {
    if (!(s.ret && s.ret.ok)) continue;
    console.log(JSON.stringify({ seed: d.seed, day: s.day, partySize: (s.musterNames || []).length, party: s.musterNames || [], setSize: (s.targets || []).length, setHp: (s.targets || []).map(t => t.hp), broke: !!s.ret.broke, remaining: s.ret.remaining, cleared: !!s.ret.cleared, fights: (s.fights || []).map(f => ({ m: f.monster, out: f.outcome, vTaken: f.vTaken, leader: f.leaderName })), deathsDuring: s.deathsDuring || [] }));
  }
  // R180 FIGHT-1 DAMAGE THRESHOLD (r155 metric review): clears are
  // ret.cleared (the sortie killed/drove off >= 1 lingerer — vKill or
  // mFlee), NOT remaining-0 (a set wipe). Revised frame: breaks open on
  // a death/flee OR vTaken >= ~70; clears open on a vKill OR a monster
  // flee (mFlee). brokeAfter1 is the clean break signal (a multi-monster
  // sortie can clear some and then break on a later fight).
  // A sortie with no recorded fights (refused at the gate is excluded —
  // ok only) reports fights 0.
  console.log('R181 fight-1 vTaken vs break (per ok sortie):');
  {
    const rows = [];
    for (const d of recs) for (const s of (d.sorties || [])) {
      if (!(s.ret && s.ret.ok)) continue;
      const f1 = (s.fights || [])[0] || null;
      rows.push({ seed: d.seed, day: s.day, setSize: (s.targets || []).length, partySize: (s.musterNames || []).length, fight1Monster: f1 ? f1.monster : null, fight1Outcome: f1 ? f1.outcome : null, fight1VTaken: f1 ? (f1.vTaken === undefined ? null : f1.vTaken) : null, fightsFought: (s.fights || []).length, broke: !!s.ret.broke, remaining: s.ret.remaining, cleared: !!s.ret.cleared });
    }
    for (const r of rows) console.log(JSON.stringify(r));
    const broke1 = rows.filter(r => r.fightsFought === 1 && r.broke);
    const clearedRows = rows.filter(r => r.cleared);
    const openerCount = (rs) => { const c = {}; for (const r of rs) { const k = r.fight1Outcome || 'none'; c[k] = (c[k] || 0) + 1; } return c; };
    console.log('R181 fight-1 summary: okSorties=' + rows.length + ' brokeAfterFight1=' + broke1.length + ' cleared=' + clearedRows.length +
      ' brokeAfter1VTaken=' + JSON.stringify(broke1.map(r => r.fight1VTaken)) +
      ' clearedVTaken=' + JSON.stringify(clearedRows.map(r => r.fight1VTaken)) +
      ' clearedOpeners=' + JSON.stringify(openerCount(clearedRows)) +
      ' brokeAfter1Openers=' + JSON.stringify(openerCount(broke1)) +
      ' multiMonsterCleared=' + rows.filter(r => r.cleared && r.setSize > 1).length + '/' + rows.filter(r => r.setSize > 1).length);
  }
  // R180 MEDIC DUTY census (prereg Q2; r156 metric review): holder span
  // (first/last day per holder, live medicDutyHolder() reads), census
  // holder (live, not the raw field), Haven stash pharmacy doses by
  // medType, blocked departures, cures by channel. The 0-medicine-cures
  // finding is attributable only with the stash read beside it.
  // R181 SUPPLY DECOMPOSITION (prereg Q2): ruin searches, scavenge
  // items (rare flag resolved from the region scavenge pool at read
  // time is NOT available here — item ids are reported raw; the run
  // note maps them), med acquisitions by item id, pharmacy deposits,
  // beside the daily medSupply counters. Pre-r181 JSONs lack `supply`
  // and report nulls without error.
  console.log('R181 SUPPLY DECOMPOSITION (searches / rare rolls / acquisitions / deposits):');
  for (const d of recs) {
    const sp = d.supply || null;
    const rareIds = sp ? sp.scavengeItems.filter(x => /med_|antibiotic|antiparasitic|antimalarial|kakkonto|bandage|ors/i.test(x.item || '')).map(x => x.item) : [];
    console.log(JSON.stringify({ seed: d.seed, days: d.days, end: d.endReason, ruinSearches: sp ? sp.ruinSearches : null, forageByTile: sp ? sp.forageByTile : null, scavengeItems: sp ? sp.scavengeItems.length : null, scavengeMedItems: rareIds, medAcquisitions: sp ? sp.medAcquisitions : null, pharmacyDeposits: sp ? sp.pharmacyDeposits : null, medSupply: d.medSupply || null }));
  }
  console.log('R181 medic-duty census (live holder + spans + stash pharmacy):');
  for (const d of recs) {
    const md = (d.census && d.census.medicDuty) || null;
    // R180: mid-run stash sample at day 60 (absent on runs ending before
    // d60, and on pre-r180 JSONs — the analyzer tolerates its absence).
    console.log(JSON.stringify({ seed: d.seed, days: d.days, end: d.endReason, medicDuty: md, stashMid: d.stashMid || null, medSupply: d.medSupply || null, betrayalSiteForced: (d.convosDriven || []).filter(c => c.betrayalSiteForced).length }));
  }
  // R182 STRANGER VERDICT (prereg A1-A7; added in the r186 adoption — the
  // r182 analyzer shipped without this section, so the leg question had
  // no printed verdict). A kill is SILENT when it has no gossip AND no
  // retaliation AND no feed line in the 0-2d window after it. A7 GO iff
  // zero silent kills AND zero cooldown violations (alien-kill gaps < 5d).
  // Zero kills at all is reported as VACUOUS with the eligibility read
  // beside it (A7 cannot be judged on a channel that never fires).
  console.log('R182 STRANGER (A1-A7 leg question: is the "a stranger" cluster legible?):');
  let panelSilent = 0, panelViol = 0, panelKills = 0;
  for (const d of recs) {
    const st = d.stranger || {};
    const kills = st.alienKills || [];
    const sfd = st.strangerFightDeaths || [];
    const feed = st.feedLines || [];
    const fear = st.fearLines || [];
    const retal = st.retalLines || [];
    const gaps = [];
    for (let i = 1; i < kills.length; i++) gaps.push(kills[i].day - kills[i - 1].day);
    const violations = gaps.filter(g => g < 5);
    let silent = 0;
    for (const k of kills) {
      const inWin = (arr) => arr.some(x => (x.day - k.day) >= 0 && (x.day - k.day) <= 2);
      if (!inWin(feed) && !inWin(fear) && !inWin(retal)) silent++;
    }
    let maxWin = 0;
    const allDeaths = kills.concat(sfd).map(x => x.day).sort((a, b) => a - b);
    for (let i = 0; i < allDeaths.length; i++) {
      let n = 0;
      for (let j = i; j < allDeaths.length && allDeaths[j] - allDeaths[i] <= 16; j++) n++;
      if (n > maxWin) maxWin = n;
    }
    panelSilent += silent; panelViol += violations.length; panelKills += kills.length;
    console.log(JSON.stringify({ seed: d.seed, days: d.days, alienKills: kills.length, killDays: kills.map(k => k.day),
      gaps, cooldownViolations: violations.length, feedLines: feed.length, fearLines: fear.length, retalLines: retal.length,
      silentKills: silent, strangerFightDeaths: sfd.length, maxDeaths17d: maxWin,
      verdict: kills.length === 0 ? 'VACUOUS (no kills)' : (silent === 0 && violations.length === 0 ? 'A7 GO' : 'A7 NO-GO') }));
  }
  console.log('R182 STRANGER panel: kills=' + panelKills + ' silent=' + panelSilent + ' cooldownViolations=' + panelViol +
    ' verdict=' + (panelKills === 0 ? 'VACUOUS' : (panelSilent === 0 && panelViol === 0 ? 'A7 GO' : 'A7 NO-GO')));
  // R182 RUINROAD ARM (prereg S1-S5 arm): trips/searches/bridges + skip
  // shape per seed. Trips 0 with every skip 0 means the arm never ran
  // (RUINROAD env unset) — an instrument miss, not a game finding.
  console.log('R182 RUINROAD ARM (S1-S5 arm: search -> rare roll -> acquisition -> deposit -> cure):');
  for (const d of recs) {
    const st = d.stranger || {};
    const rr = st.ruinRoad || null;
    const md = (d.census && d.census.medicDuty) || {};
    const cures = (md.cures || {});
    console.log(JSON.stringify({ seed: d.seed, days: d.days, ruinRoad: rr,
      medAcquisitions: (d.supply || {}).medAcquisitions || null,
      pharmacyDeposits: (d.supply || {}).pharmacyDeposits || null,
      medicineCures: cures.medicine === undefined ? null : cures.medicine,
      armRan: !!(rr && (rr.trips > 0 || Object.values(rr.skips || {}).some(v => v > 0))) }));
  }
  // R186 ELIGIBILITY (adoption: why 0 kills — gate reads per day boundary).
  // Pre-r186 JSONs lack the series and report nulls without error.
  console.log('R186 ELIGIBILITY (alien playground gates per day boundary):');
  for (const d of recs) {
    const el = ((d.stranger || {}).eligibility) || null;
    if (!el) { console.log(JSON.stringify({ seed: d.seed, eligibility: null })); continue; }
    const tot = el.length;
    const apOk = el.filter(x => x.apEligible).length;
    const encOk = el.filter(x => x.encounterEligible).length;
    const bothOk = el.filter(x => x.apEligible && x.encounterEligible).length;
    const havenDays = el.filter(x => x.tileType === 'haven').length;
    const firstWave2 = (el.find(x => (x.wave || 0) >= 2) || {}).day || null;
    const firstSys = (el.find(x => x.systemArrived) || {}).day || null;
    const rScores = el.map(x => (x.readiness && typeof x.readiness.score === 'number') ? x.readiness.score : null).filter(v => v !== null);
    const rReady = el.filter(x => x.readiness && x.readiness.ready).length;
    const rMax = rScores.length ? Math.max.apply(null, rScores) : null;
    const rLast = rScores.length ? rScores[rScores.length - 1] : null;
    console.log(JSON.stringify({ seed: d.seed, daysSampled: tot, apEligibleDays: apOk, encounterEligibleDays: encOk,
      bothEligibleDays: bothOk, havenEndDays: havenDays, firstWave2Day: firstWave2, firstSystemArrivedDay: firstSys,
      readinessDaysReady: rReady, readinessMaxScore: rMax, readinessLastScore: rLast }));
  }
}
