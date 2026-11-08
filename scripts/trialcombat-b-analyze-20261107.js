// trialcombat-b-analyze-20261107.js — the trial-by-combat analyzer
// (arm sim-trialcombat-b). Reads the two per-seed corpora
// (evidence/2026-11-08/perseed-trialcombat-b-baseline/ and
// perseed-trialcombat-b-armed/) and judges the frozen prereg:
//   PRIMARY: trial entered >= 2/8 armed AND trial wins >= 1/8
//     armed. Baseline trial entered must be 0/8 (the RED pin).
//   SUBSTRATE SANITY: baseline earns lesser seats on >= 2/8
//     seeds AND sits on >= 2/8 seeds.
//   SUBSTRATE GUARD (per-seed exact reproduction): seeds where
//     neither leg enters a door reproduce the baseline EXACTLY
//     whole-run; seeds where either leg enters a door reproduce
//     the baseline EXACTLY on every daily row BEFORE the earlier
//     of the two first-entry days. Guard passes iff 8/8.
//   COST BAR: starvation deaths <= baseline + 2 total; median
//     survival >= 0.8x baseline.
// Trial detection is triple-sourced: door-verb calls
// (chooseTableOption 'beat:trial'), tablePrompt options at feared
// beat 1, and the trial transcript lines (TRIAL WON / TRIAL LOST /
// TRIAL WITHHELD). A trial never offered on the pilot band is a
// DIAG finding (offered/earned rates per seed), not a re-scope.
// Prints a JSON summary to stdout and writes it to
// /tmp/trialcombat-b-analysis.json (working copy; the evidence file
// is the record). Usage:
//   node scripts/trialcombat-b-analyze-20261107.js [baselineDir] [armedDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyGate } = require(path.join(__dirname, 'sitstep-instrument-20261107'));

// classifySeatDay: the sitstep2-analyze extended rule, copied (same
// gates) so this analyzer judges seat days identically:
//   'sat' | 'no-seat' | 'floor-day90' | 'no-preview-waiting' |
//   'no-preview-unknown' | 'entry-blocked' | 'offer-not-taken' |
//   'sit-refused' | 'sit-called'.
function classifySeatDay(row, callsToday) {
  row = row || {};
  callsToday = callsToday || [];
  if (row.tableDone) return { gate: 'sat', missing: [] };
  if (!row.seat || row.seat === 'none') {
    const c = classifyGate(row);
    return { gate: 'no-seat', missing: c.missing || [] };
  }
  if (!row.preview) {
    if (!row.winDayFloorOk) return { gate: 'floor-day90', missing: ['day ' + (row.day | 0) + ' < 90 (win-day floor; table not announced, no preview)'] };
    if (!row.tableWaiting) return { gate: 'no-preview-waiting', missing: ['tableWaiting false (Arc IV never fired)'] };
    return { gate: 'no-preview-unknown', missing: ['preview null for unknown reason'] };
  }
  if (!row.preview.ready) return { gate: 'entry-blocked', missing: [String(row.preview.why || 'unknown block')] };
  if (callsToday.length) {
    const ok = callsToday.some(function (c) { return c.ok; });
    if (ok) return { gate: 'sit-called', missing: ['sit verb called ok; tableDone still false'] };
    return { gate: 'sit-refused', missing: callsToday.map(function (c) { return c.call + ': ' + (c.msg || 'no msg'); }) };
  }
  return { gate: 'offer-not-taken', missing: ['preview ready; policy never called tableTakeSeat/tableOfferSeatTaker'] };
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  return s.length % 2 === 1 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
// Starvation count (feastdrive corrected rule, 2026-11-07): records
// whose kind/cause names starvation.
function starvation(o) {
  return Array.isArray(o.teleDeaths)
    ? o.teleDeaths.filter(function (d) { return /starv/i.test(((d.cause || '') + ' ' + (d.kind || ''))); }).length
    : 0;
}
function w4kills(o) {
  return (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
}
function pairDays(o) {
  return (o.daily || []).filter(function (d) { return d.pairDay; }).length;
}
function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const bySeed = {};
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[o.seed] = o;
  });
  return bySeed;
}

// Door entries from the driver's door-verb record: a chooseTableOption
// ('path:X') call whose before-phase is 'paths' and after-phase is
// 'challenge' with a path set. Cross-checked against the policy's
// walked list in analyzeSeed.
function entriesFromVerbs(o) {
  const out = [];
  (o.doorVerbMsgs || []).forEach(function (c) {
    if (c.call !== 'chooseTableOption') return;
    if (!c.arg || c.arg.indexOf('path:') !== 0) return;
    if (c.before && c.before.phase === 'paths' && c.after && c.after.phase === 'challenge' && c.after.path) {
      out.push({ day: c.day, path: c.after.path, branch: c.after.branch, offered: c.offered || [] });
    }
  });
  return out;
}

// Pre-entry exactness: compare the daily rows of armed vs baseline
// for every day BEFORE the entry day on the trajectory fields.
// Returns { match, daysCompared, firstDiff }.
function preEntryMatch(base, armed, entryDay) {
  const FIELDS = ['rawStanding', 'rosterSize', 'living', 'w4kills', 'seat',
    'feastSurgeUsed', 'sentimentTaught', 'pairDay', 'scholarAtHaven'];
  const brow = {};
  (base.daily || []).forEach(function (r) { brow[r.day] = r; });
  let compared = 0;
  for (const r of (armed.daily || [])) {
    if (r.day >= entryDay) break;
    const b = brow[r.day];
    if (!b) return { match: false, daysCompared: compared, firstDiff: 'missing baseline row day ' + r.day };
    for (const f of FIELDS) {
      if (JSON.stringify(r[f]) !== JSON.stringify(b[f])) {
        return { match: false, daysCompared: compared, firstDiff: 'day ' + r.day + ' field ' + f + ': armed=' + JSON.stringify(r[f]) + ' baseline=' + JSON.stringify(b[f]) };
      }
    }
    const rp = r.preview ? { ready: !!r.preview.ready, why: r.preview.why || '' } : null;
    const bp = b.preview ? { ready: !!b.preview.ready, why: b.preview.why || '' } : null;
    if (JSON.stringify(rp) !== JSON.stringify(bp)) {
      return { match: false, daysCompared: compared, firstDiff: 'day ' + r.day + ' preview: armed=' + JSON.stringify(rp) + ' baseline=' + JSON.stringify(bp) };
    }
    compared += 1;
  }
  return { match: true, daysCompared: compared, firstDiff: null };
}

// effectiveDays(days, won, horizon): the revised cost bar's
// survival measure — a won seed counts at the horizon (a win is a
// success, not a truncated life); any other seed counts its days.
function effectiveDays(days, won, horizon) {
  return won ? horizon : days;
}
function nonInferior(armedDays, armedWon, baselineDays, horizon) {
  return effectiveDays(armedDays, armedWon, horizon) >= baselineDays;
}
// The baseline leg walks via the feareddoor drive, the armed leg via
// the trialcombat drive (the driver records the leg in o.policy).
// Both stats objects share the walked/log/offers shape.
function doorStatsOf(o) {
  if (o && o.policy === 'trialcombat-armed') return o.trialcombatStats || {};
  return (o && o.feareddoorStats) || {};
}


// Trial detection (triple-sourced — the three records must agree;
// the analyzer reports each source separately so a disagreement is
// visible, not papered over):
//   (1) door verbs: a chooseTableOption call whose before-state is
//       feared beat 1 and whose offered list contains 'beat:trial'
//       (OFFERED), and a chooseTableOption('beat:trial') call
//       (ENTERED).
//   (2) tablePrompts: a challenge-phase feared beat-1 prompt whose
//       options contain 'beat:trial' (OFFERED, independent of the
//       verb record).
//   (3) the policy log: a rec with trialOffered / trialPicked true
//       (the armed leg's own instrument).
// The outcome comes from the transcript: 'TRIAL WON' / 'TRIAL LOST'
// / 'TRIAL WITHHELD' in tableLines.
function trialFromVerbs(o) {
  const offered = [], entered = [];
  (o.doorVerbMsgs || []).forEach(function (c) {
    if (c.call !== 'chooseTableOption') return;
    if (c.before && c.before.phase === 'challenge' && c.before.path === 'feared' && ((c.before.beat | 0) === 1)) {
      if ((c.offered || []).indexOf('beat:trial') >= 0) offered.push({ day: c.day, offered: (c.offered || []).slice() });
    }
    if (c.arg === 'beat:trial') entered.push({ day: c.day });
  });
  return { offered: offered, entered: entered };
}
function trialFromPrompts(o) {
  const offered = [];
  (o.tablePrompts || []).forEach(function (pr) {
    const t = pr.table || {};
    if (t.phase === 'challenge' && t.path === 'feared' && ((t.beat | 0) === 1)) {
      if ((pr.options || []).indexOf('beat:trial') >= 0) offered.push({ day: pr.day });
    }
  });
  return offered;
}
function trialFights(o) {
  return (o.tbFights || []).filter(function (f) {
    try { return /finale|trial/i.test(JSON.stringify(f)); } catch (e) { return false; }
  });
}

function analyzeSeed(o) {
  const daily = o.daily || [];
  const callsByDay = {};
  (o.sitVerbMsgs || []).forEach(function (c) {
    (callsByDay[c.day] = callsByDay[c.day] || []).push(c);
  });
  const gates = {};
  daily.forEach(function (d) {
    const g = classifySeatDay(d, callsByDay[d.day] || []).gate;
    gates[g] = (gates[g] | 0) + 1;
  });
  const seatDays = daily.filter(function (d) { return d.seat && d.seat !== 'none'; });
  const previewReadyDays = daily.filter(function (d) { return d.preview && d.preview.ready; }).length;
  const encounterBlocked = daily.filter(function (d) {
    return d.preview && !d.preview.ready && /encounter/i.test(d.preview.why || '');
  }).length;
  const ts = o.takeseatStats || {};
  const dw = doorStatsOf(o);
  const ld = o.linkdriveStats || {};
  const fd = o.feastdriveStats || {};
  const last = daily[daily.length - 1] || {};
  const verbEntries = entriesFromVerbs(o);
  const walked = (dw.walked || []).slice();
  const finals = (dw.log || []).filter(function (e) { return e.phase === 'finals'; }).length;
  const downgrades = (dw.log || []).filter(function (e) { return e.phase === 'downgrade'; }).length;
  const conscriptRefusals = (dw.log || []).filter(function (e) { return e.phase === 'conscript'; }).length;
  const trialOnlySkips = (dw.skips || {})['trial-only'] | 0;
  const offered = (dw.offers && dw.offers.length) ? dw.offers[0].offered : null;
  const fearedOffered = !!(offered && offered.indexOf('feared') >= 0);
  const fearedWalked = walked.filter(function (w) { return w.path === 'feared'; });
  const fearedVerbEntries = verbEntries.filter(function (e) { return e.path === 'feared'; });
  // A feared WIN: the seed won, the first walked door was feared, and
  // no downgrade ever fired (a downgrade means the feared path failed
  // and the win — if any — came on the second door).
  const finalOnFeared = (dw.log || []).filter(function (e) { return e.phase === 'finals'; })
    .some(function (e) { return e.path === 'feared'; });
  const fearedWin = !!o.won && fearedWalked.length > 0 && walked[0].path === 'feared' &&
    downgrades === 0 && finalOnFeared;
  const fearedOfferedUnwalked = fearedOffered && !(walked.length && walked[0].path === 'feared');
  // --- trial (this arm) ---
  const tc = o.trialcombatStats || {};
  const verbTrial = trialFromVerbs(o);
  const promptTrial = trialFromPrompts(o);
  const logTrialOffered = (dw.log || []).filter(function (e) { return e.trialOffered; });
  const logTrialPicked = (dw.log || []).filter(function (e) { return e.trialPicked; });
  const trialLines = (o.tableLines || []).filter(function (l) { return /TRIAL/.test(l.line); });
  const trialWon = trialLines.some(function (l) { return /TRIAL WON/.test(l.line); });
  const trialLost = trialLines.some(function (l) { return /TRIAL LOST/.test(l.line); });
  const trialWithheld = trialLines.some(function (l) { return /TRIAL WITHHELD/.test(l.line); });
  const trialNoShow = trialLines.some(function (l) { return /champion does not come/.test(l.line); });
  const trialFightsList = trialFights(o);
  const trialOffered = verbTrial.offered.length > 0 || promptTrial.length > 0 || logTrialOffered.length > 0;
  const trialEntered = verbTrial.entered.length > 0 || logTrialPicked.length > 0 || (tc.trialsEntered | 0) > 0;
  const trialEnteredDay = verbTrial.entered.length ? verbTrial.entered[0].day
    : (logTrialPicked.length ? logTrialPicked[0].day : null);
  // The feared prereq at sit: might+killed >= 6 on the sit-day row.
  const sitRow = (ts.seatDay != null) ? daily.find(function (d) { return d.day === ts.seatDay; }) : null;
  const ledgerAtSit = (sitRow && sitRow.ledger) ? { might: sitRow.ledger.might, killed: sitRow.ledger.killed, protected: sitRow.ledger.protected, exposed: sitRow.ledger.exposed } : null;
  const fearedPrereqAtSit = ledgerAtSit ? (((ledgerAtSit.might | 0) + (ledgerAtSit.killed | 0)) >= 6) : null;
  return {
    seed: o.seed, days: o.days, gameDays: o.gameDays, endReason: o.endReason,
    won: !!o.won, over: !!o.over, standing: o.standing, scaleRank: o.scaleRank,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave,
    finalSeat: o.finalSeat ? o.finalSeat.seat : null,
    firstSeatDay: seatDays.length ? seatDays[0].day : null,
    seatDays: seatDays.length, gates: gates,
    previewReadyDays: previewReadyDays,
    previewSeenDays: daily.filter(function (d) { return !!d.preview; }).length,
    encounterBlockedDays: encounterBlocked,
    tableDoneDays: daily.filter(function (d) { return d.tableDone; }).length,
    tableChoicesDays: daily.filter(function (d) { return d.tableChoicesSurfaced; }).length,
    sitAttempts: (o.sitAttempts || []).length,
    sitVerbCalls: (o.sitVerbMsgs || []).length,
    tsTaken: ts.seatTaken | 0, tsDay: ts.seatDay, tsKind: ts.seatKind,
    tsDoors: ts.doorsOffered, tsSkips: ts.skips || {}, tsErrors: ts.errors | 0,
    daysAfterSit: (ts.seatDay != null) ? ((o.gameDays || 0) - ts.seatDay) : null,
    doorsEntered: walked.length, walked: walked, verbEntries: verbEntries,
    verbWalkedAgree: walked.length === verbEntries.length &&
      walked.every(function (w, i) { return verbEntries[i] && w.path === verbEntries[i].path && w.day === verbEntries[i].day; }),
    entryDay: walked.length ? walked[0].day : null,
    entryLag: (walked.length && ts.seatDay != null) ? (walked[0].day - ts.seatDay) : null,
    doorsOffered: offered,
    offers: dw.offers || [],
    fearedOffered: fearedOffered,
    fearedEntered: fearedWalked.length, fearedWalked: fearedWalked,
    fearedVerbEntries: fearedVerbEntries,
    fearedWin: fearedWin, finalOnFeared: finalOnFeared,
    fearedOfferedUnwalked: fearedOfferedUnwalked,
    finalsAnswers: finals, downgradeAnswers: downgrades, conscriptRefusals: conscriptRefusals,
    trialOnlySkips: trialOnlySkips,
    dwAnswers: dw.answers | 0, dwSkips: dw.skips || {}, dwErrors: dw.errors | 0,
    dwStalls: dw.stalls | 0,
    daysAfterEntry: walked.length ? ((o.gameDays || 0) - walked[0].day) : null,
    surgeUsed: !!last.feastSurgeUsed, foodDeeds: !!(last.sentimentTaught && last.feastSurgeUsed),
    pairDays: pairDays(o), starvation: starvation(o),
    w4kills: w4kills(o),
    w5kills: (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); }).length,
    linksFormed: (ld.proposeAccepted | 0) + (ld.counterAnswers | 0) + (ld.raisesLinked | 0),
    feastsHosted: fd.feastsHosted | 0, donatedKcal: fd.donatedKcal | 0,
    errors: (o.instrumentErrors || []).length,
    endScholarId: o.endScholarId || null,
    // --- trial ---
    trialOffered: trialOffered, trialOfferedVerb: verbTrial.offered,
    trialOfferedPrompt: promptTrial, trialOfferedLog: logTrialOffered.map(function (e) { return { day: e.day, beat: e.beat }; }),
    trialEntered: trialEntered, trialEnteredDay: trialEnteredDay,
    trialEnteredVerb: verbTrial.entered, trialEnteredLog: logTrialPicked.map(function (e) { return { day: e.day, beat: e.beat }; }),
    trialStatsOffered: tc.trialsOffered | 0, trialStatsEntered: tc.trialsEntered | 0,
    trialWon: trialWon, trialLost: trialLost, trialWithheld: trialWithheld, trialNoShow: trialNoShow,
    trialLines: trialLines,
    trialFights: trialFightsList, trialFightsCount: trialFightsList.length,
    tbFightsCount: (o.tbFights || []).length,
    ledgerAtSit: ledgerAtSit, fearedPrereqAtSit: fearedPrereqAtSit,
  };
}

if (require.main === module) {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-08', 'perseed-trialcombat-b-baseline');
  const armedDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-08', 'perseed-trialcombat-b-armed');
  const base = loadDir(baseDir);
  const armed = loadDir(armedDir);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) throw new Error('no baseline files in ' + baseDir);
  seeds.forEach(function (s) { if (!armed[s]) throw new Error('missing armed file for seed ' + s); });

  const bRows = seeds.map(function (s) { return analyzeSeed(base[s]); });
  const aRows = seeds.map(function (s) { return analyzeSeed(armed[s]); });

  // --- substrate guard: per-seed exact reproduction, pre-first-bind ---
  const guard = [];
  seeds.forEach(function (s, i) {
    const b = base[s], a = armed[s];
    const bRow = bRows[i], aRow = aRows[i];
    const bEntry = bRow.entryDay, aEntry = aRow.entryDay;
    if (bEntry == null && aEntry == null) {
      const match = (a.days === b.days) && (a.endReason === b.endReason) &&
        (a.standing === b.standing) && (a.maxWave === b.maxWave) &&
        (w4kills(a) === w4kills(b)) &&
        (((a.finalSeat || {}).seat || null) === ((b.finalSeat || {}).seat || null)) &&
        (a.gameDays === b.gameDays);
      guard.push({ seed: s, clause: 'neither-entered whole-run', match: match,
        firstDiff: match ? null : ('days ' + a.days + '/' + b.days + ' end ' + a.endReason + '/' + b.endReason + ' standing ' + a.standing + '/' + b.standing + ' maxWave ' + a.maxWave + '/' + b.maxWave + ' w4kills ' + w4kills(a) + '/' + w4kills(b) + ' seat ' + ((a.finalSeat || {}).seat) + '/' + ((b.finalSeat || {}).seat)) });
    } else {
      const firstBind = Math.min(
        bEntry == null ? Infinity : bEntry,
        aEntry == null ? Infinity : aEntry);
      const pre = preEntryMatch(b, a, firstBind);
      guard.push({ seed: s, clause: 'entered pre-first-bind day<' + firstBind + ' (base entry ' + bEntry + ', armed entry ' + aEntry + ')', match: pre.match, daysCompared: pre.daysCompared, firstDiff: pre.firstDiff });
    }
  });
  const guardPass = guard.filter(function (g) { return g.match; }).length;

  // --- primary / sanity / cost (frozen prereg) ---
  const trialEnteredArmed = aRows.filter(function (r) { return r.trialEntered; }).length;
  const trialWinsArmed = aRows.filter(function (r) { return r.trialWon; }).length;
  const trialLostArmed = aRows.filter(function (r) { return r.trialLost; }).length;
  const trialOfferedArmed = aRows.filter(function (r) { return r.trialOffered; }).length;
  const trialOfferedBase = bRows.filter(function (r) { return r.trialOffered; }).length;
  const trialEnteredBase = bRows.filter(function (r) { return r.trialEntered; }).length;
  const trialWithheldArmed = aRows.filter(function (r) { return r.trialWithheld; }).length;
  const trialNoShowArmed = aRows.filter(function (r) { return r.trialNoShow; }).length;
  const fearedEnteredArmed = aRows.filter(function (r) { return r.fearedEntered > 0; }).length;
  const fearedWinsArmed = aRows.filter(function (r) { return r.fearedWin; }).length;
  const fearedEnteredBase = bRows.filter(function (r) { return r.fearedEntered > 0; }).length;
  const winsArmed = aRows.filter(function (r) { return r.won; }).length;
  const winsBase = bRows.filter(function (r) { return r.won; }).length;
  const baseSeats = bRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length;
  const baseSat = bRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const armedSat = aRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const bStarv = bRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const aStarv = aRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const bMedian = medianOf(bRows.map(function (r) { return r.days; }));
  const aMedian = medianOf(aRows.map(function (r) { return r.days; }));
  const aPairs = aRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const bPairs = bRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const fearedOfferedArmed = aRows.filter(function (r) { return r.fearedOffered; }).length;
  const fearedOfferedBase = bRows.filter(function (r) { return r.fearedOffered; }).length;
  const fearedOfferedUnwalkedArmed = aRows.filter(function (r) { return r.fearedOfferedUnwalked; }).length;
  const fearedOfferedUnwalkedBase = bRows.filter(function (r) { return r.fearedOfferedUnwalked; }).length;
  const wall = function (rows) {
    return {
      national: rows.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      tableSat: rows.filter(function (r) { return r.tsTaken > 0; }).length,
      doorsEntered: rows.filter(function (r) { return r.doorsEntered > 0; }).length,
      fearedEntered: rows.filter(function (r) { return r.fearedEntered > 0; }).length,
      fearedWins: rows.filter(function (r) { return r.fearedWin; }).length,
      trialOffered: rows.filter(function (r) { return r.trialOffered; }).length,
      trialEntered: rows.filter(function (r) { return r.trialEntered; }).length,
      trialWins: rows.filter(function (r) { return r.trialWon; }).length,
      trialLost: rows.filter(function (r) { return r.trialLost; }).length,
      wins: rows.filter(function (r) { return r.won; }).length,
      wave4unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length,
      wave5unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 5; }).length,
      wave5faced: rows.filter(function (r) { return (r.w5kills | 0) > 0; }).length,
      regional: rows.filter(function (r) { return r.scaleRank === 'regional' || r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      lesserSeats: rows.filter(function (r) { return r.finalSeat === 'lesser'; }).length,
      fullSeats: rows.filter(function (r) { return r.finalSeat === 'full'; }).length,
      medianSurvival: medianOf(rows.map(function (r) { return r.days; })),
      medianSurvivalNonWon: medianOf(rows.filter(function (r) { return !r.won; }).map(function (r) { return r.days; })),
      survivals: rows.map(function (r) { return r.days; }),
    };
  };

  const verdict = {
    primary: { trialEnteredArmed: trialEnteredArmed, trialWinsArmed: trialWinsArmed,
      trialLostArmed: trialLostArmed, trialOfferedArmed: trialOfferedArmed,
      trialOfferedBaseline: trialOfferedBase, trialEnteredBaseline: trialEnteredBase,
      trialWithheldArmed: trialWithheldArmed, trialNoShowArmed: trialNoShowArmed,
      fearedEnteredArmed: fearedEnteredArmed, fearedWinsArmed: fearedWinsArmed,
      winsArmed: winsArmed, winsBaseline: winsBase, winDelta: winsArmed - winsBase,
      bar: 'trial entered >=2/8 armed AND trial wins >=1/8 armed; baseline trial entered 0/8',
      pass: trialEnteredArmed >= 2 && trialWinsArmed >= 1 && trialEnteredBase === 0 },
    substrateSanity: { baseSeatsEarned: baseSeats, baseSat: baseSat, armedSat: armedSat, bar: 'baseline lesser >=2/8 AND sat >=2/8', pass: baseSeats >= 2 && baseSat >= 2 },
    substrateGuard: { exactSeeds: guardPass, of: seeds.length, bar: '8/8 per-seed exact pre-first-bind', pass: guardPass === seeds.length, detail: guard },
    costBar: {
      starvationBase: bStarv, starvationArmed: aStarv, starvationCap: bStarv + 2,
      starvationPass: aStarv <= bStarv + 2,
      medianBase: bMedian, medianArmed: aMedian, medianFloor: (bMedian == null ? null : 0.8 * bMedian),
      medianPass: (bMedian == null || aMedian == null) ? false : (aMedian >= 0.8 * bMedian),
      pairDaysArmed: aPairs, pairDaysBase: bPairs, pairDaysRecordedOnly: true,
      pass: null,
    },
    offered: { fearedOfferedBaseline: fearedOfferedBase, fearedOfferedArmed: fearedOfferedArmed,
      fearedOfferedUnwalkedBaseline: fearedOfferedUnwalkedBase, fearedOfferedUnwalkedArmed: fearedOfferedUnwalkedArmed,
      trialOfferedBaseline: trialOfferedBase, trialOfferedArmed: trialOfferedArmed },
  };
  verdict.costBar.pass = verdict.costBar.starvationPass && verdict.costBar.medianPass;
  verdict.overall = verdict.primary.pass && verdict.substrateSanity.pass && verdict.substrateGuard.pass && verdict.costBar.pass
    ? 'GO' : 'NO-GO';
  if (!verdict.substrateSanity.pass) verdict.overall = 'NO-GO (substrate — trial drive unjudged)';
  if (trialOfferedArmed === 0) verdict.overall = 'NO-GO (DIAG — trial never offered on this band)';

  const out = {
    arm: 'trialcombat-b', seeds: seeds,
    baseline: bRows, armed: aRows,
    guard: guard, wallBaseline: wall(bRows), wallArmed: wall(aRows),
    verdict: verdict,
  };
  fs.writeFileSync('/tmp/trialcombat-b-analysis.json', JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { analyzeSeed: analyzeSeed, classifySeatDay: classifySeatDay, preEntryMatch: preEntryMatch, entriesFromVerbs: entriesFromVerbs, medianOf: medianOf, starvation: starvation, doorStatsOf: doorStatsOf, effectiveDays: effectiveDays, nonInferior: nonInferior, trialFromVerbs: trialFromVerbs, trialFromPrompts: trialFromPrompts, trialFights: trialFights };
