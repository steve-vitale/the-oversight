// takeseat-b-analyze-20261107.js — the sit-drive analyzer (arm
// sim-takeseat-b). Reads the two per-seed corpora
// (evidence/2026-11-07/perseed-takeseat-b-baseline/ and
// perseed-takeseat-b-armed/) and judges the frozen prereg:
//   PRIMARY: tables sat >= 3/8 armed vs 0/8 baseline.
//   SUBSTRATE SANITY: baseline earns lesser seats on >= 3/8 seeds.
//   SUBSTRATE GUARD (per-seed exact reproduction, sitstep2 metric
//   review proposal, adapted): never-sat seeds reproduce the baseline
//   EXACTLY whole-run; sat seeds reproduce the baseline EXACTLY on
//   every daily row BEFORE the sit day (sanctity + the overtime stop
//   diverge post-sit trajectories by design). Guard passes iff
//   >= 6/8 seeds satisfy their clause.
//   COST BAR: starvation deaths <= baseline + 2 total AND arm-only
//   <= 2 (the feastdrive/linkdrive inherited convention — the prereg
//   says "AND arm-only"; the cap 2 is the prior arms' rule, stated
//   here so the judge is auditable); median survival >= 0.8x
//   baseline median; pair days armed >= 14 (feastdrive-armed floor).
// Prints a JSON summary to stdout and writes it to
// /tmp/takeseat-b-analysis.json (working copy; the evidence file is
// the record). Usage:
//   node scripts/takeseat-b-analyze-20261107.js [baselineDir] [armedDir]
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
// whose kind/cause names starvation. (The old analyzer indexed the
// teleDeaths array as an object and always returned 0.)
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

// Pre-sit exactness: compare the daily rows of armed vs baseline for
// every day BEFORE the sit day on the trajectory fields. Returns
// { match, daysCompared, firstDiff }.
function preSitMatch(base, armed, sitDay) {
  const FIELDS = ['rawStanding', 'rosterSize', 'living', 'w4kills', 'seat',
    'feastSurgeUsed', 'sentimentTaught', 'pairDay', 'scholarAtHaven'];
  const brow = {};
  (base.daily || []).forEach(function (r) { brow[r.day] = r; });
  let compared = 0;
  for (const r of (armed.daily || [])) {
    if (r.day >= sitDay) break;
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
  const ld = o.linkdriveStats || {};
  const fd = o.feastdriveStats || {};
  const last = daily[daily.length - 1] || {};
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
    surgeUsed: !!last.feastSurgeUsed, foodDeeds: !!(last.sentimentTaught && last.feastSurgeUsed),
    pairDays: pairDays(o), starvation: starvation(o),
    w4kills: w4kills(o),
    w5kills: (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); }).length,
    linksFormed: (ld.proposeAccepted | 0) + (ld.counterAnswers | 0) + (ld.raisesLinked | 0),
    feastsHosted: fd.feastsHosted | 0, donatedKcal: fd.donatedKcal | 0,
    errors: (o.instrumentErrors || []).length,
    endScholarId: o.endScholarId || null,
  };
}

if (require.main === module) {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-takeseat-b-baseline');
  const armedDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-takeseat-b-armed');
  const base = loadDir(baseDir);
  const armed = loadDir(armedDir);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) throw new Error('no baseline files in ' + baseDir);
  seeds.forEach(function (s) { if (!armed[s]) throw new Error('missing armed file for seed ' + s); });

  const bRows = seeds.map(function (s) { return analyzeSeed(base[s]); });
  const aRows = seeds.map(function (s) { return analyzeSeed(armed[s]); });

  // --- substrate guard: per-seed exact reproduction ---
  const guard = [];
  seeds.forEach(function (s, i) {
    const b = base[s], a = armed[s];
    const aRow = aRows[i];
    if (!aRow.tsTaken) {
      const match = (a.days === b.days) && (a.endReason === b.endReason) &&
        (a.standing === b.standing) && (a.maxWave === b.maxWave) &&
        (w4kills(a) === w4kills(b)) &&
        (((a.finalSeat || {}).seat || null) === ((b.finalSeat || {}).seat || null)) &&
        (a.gameDays === b.gameDays);
      guard.push({ seed: s, clause: 'never-sat whole-run', match: match,
        firstDiff: match ? null : ('days ' + a.days + '/' + b.days + ' end ' + a.endReason + '/' + b.endReason + ' standing ' + a.standing + '/' + b.standing + ' maxWave ' + a.maxWave + '/' + b.maxWave + ' w4kills ' + w4kills(a) + '/' + w4kills(b) + ' seat ' + ((a.finalSeat || {}).seat) + '/' + ((b.finalSeat || {}).seat)) });
    } else {
      const pre = preSitMatch(b, a, aRow.tsDay);
      guard.push({ seed: s, clause: 'sat pre-sit day<' + aRow.tsDay, match: pre.match, daysCompared: pre.daysCompared, firstDiff: pre.firstDiff });
    }
  });
  const guardPass = guard.filter(function (g) { return g.match; }).length;

  // --- primary / sanity / cost ---
  const satArmed = aRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const satBase = bRows.filter(function (r) { return (r.sitAttempts || 0) > 0 && (r.tableDoneDays || 0) > 0; }).length;
  const baseSeats = bRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length;
  const armedSeats = aRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length;
  const bStarv = bRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const aStarv = aRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const armOnlyStarv = aRows.reduce(function (t, r, i) { return t + (bRows[i].starvation === 0 ? r.starvation : 0); }, 0);
  const bMed = medianOf(bRows.map(function (r) { return r.days; }));
  const aMed = medianOf(aRows.map(function (r) { return r.days; }));
  const aPairs = aRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const bPairs = bRows.reduce(function (t, r) { return t + r.pairDays; }, 0);

  const wall = function (rows) {
    return {
      national: rows.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      tableSat: rows.filter(function (r) { return r.tsTaken > 0; }).length,
      wins: rows.filter(function (r) { return r.won; }).length,
      wave4unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length,
      wave5unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 5; }).length,
      wave5faced: rows.filter(function (r) { return (r.w5kills | 0) > 0; }).length,
      regional: rows.filter(function (r) { return r.scaleRank === 'regional' || r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      lesserSeats: rows.filter(function (r) { return r.finalSeat === 'lesser'; }).length,
      fullSeats: rows.filter(function (r) { return r.finalSeat === 'full'; }).length,
      medianSurvival: medianOf(rows.map(function (r) { return r.days; })),
      survivals: rows.map(function (r) { return r.days; }),
    };
  };

  const verdict = {
    primary: { satArmed: satArmed, satBaseline: satBase, bar: '>=3/8 armed vs 0/8 baseline', pass: satArmed >= 3 && satBase === 0 },
    substrateSanity: { baseSeatsEarned: baseSeats, bar: '>=3/8 baseline lesser seats', pass: baseSeats >= 3 },
    substrateGuard: { exactSeeds: guardPass, of: seeds.length, bar: '>=6/8 per-seed exact', pass: guardPass >= 6, detail: guard },
    costBar: {
      starvationBase: bStarv, starvationArmed: aStarv, starvationCap: bStarv + 2,
      starvationArmOnly: armOnlyStarv, starvationArmOnlyCap: 2,
      starvationPass: aStarv <= bStarv + 2 && armOnlyStarv <= 2,
      medianBase: bMed, medianArmed: aMed, medianFloor: bMed == null ? null : Math.round(bMed * 0.8 * 10) / 10,
      medianPass: bMed == null ? false : (aMed >= 0.8 * bMed),
      pairDaysArmed: aPairs, pairDaysBase: bPairs, pairDaysFloor: 14,
      pairPass: aPairs >= 14,
    },
  };
  verdict.costBar.pass = verdict.costBar.starvationPass && verdict.costBar.medianPass && verdict.costBar.pairPass;
  verdict.overall = verdict.primary.pass && verdict.substrateSanity.pass && verdict.substrateGuard.pass && verdict.costBar.pass
    ? 'GO' : 'NO-GO';
  if (!verdict.substrateSanity.pass) verdict.overall = 'NO-GO (substrate — sit drive unjudged)';

  const out = {
    arm: 'takeseat-b', seeds: seeds,
    baseline: bRows, armed: aRows,
    guard: guard, wallBaseline: wall(bRows), wallArmed: wall(aRows),
    verdict: verdict,
  };
  fs.writeFileSync('/tmp/takeseat-b-analysis.json', JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { analyzeSeed: analyzeSeed, classifySeatDay: classifySeatDay, preSitMatch: preSitMatch, medianOf: medianOf, starvation: starvation };
