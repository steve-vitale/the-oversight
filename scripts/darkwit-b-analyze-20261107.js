// darkwit-b-analyze-20261107.js — the dark-branch witness analyzer
// (arm sim-darkwit-b). Reads the two per-seed corpora
// (evidence/2026-11-07/perseed-darkwit-b-baseline/ and
// perseed-darkwit-b-armed/) and judges the frozen prereg:
//   PRIMARY (frozen prereg, auto-scales pilot 8 / confirm 12):
//     DARK-branch witness entered >= 4/12 armed (2/8 pilot) AND
//     (armed - baseline dark-witness-entered) >= 3 (2 pilot).
//     Dark witness wins are a recorded secondary with expectation
//     >= 3/12 (>= 2/8 pilot), NOT a gate.
//   SUBSTRATE SANITY: baseline earns lesser seats on >= 4/12
//     seeds AND sits on >= 4/12 seeds (2/8 pilot).
//   SUBSTRATE GUARD (REPLACEMENT guard — the witnessdoor exact-
//     reproduction guard CANNOT apply: the armed leg diverges
//     pre-sit by design): (1) determinism is proof-side, not
//     corpus-side; (2) attribution — every armed seed shows
//     ledgerdark activity OR a classified non-firing reason;
//     (3) ledger trace — the sit-time branch is reconstructable
//     from the daily ledger rows; (4) baseline shape — the
//     baseline leg passes substrate sanity on its own shape.
//   COST BAR (frozen, sim-scalemetric shape): starvation deaths
//     <= baseline + 2 total; arm-only starvation <= 1; median
//     survival (harness days, all seeds) armed >= 0.8x baseline
//     median. Per-seed survival non-inferiority is RECORDED, not
//     gated. Betrayal-attributed villager deaths are RECORDED,
//     not gated.
//   #1888: per walk, the beat framing lines (tablePrompt
//     capture) and the cold/let choice lines (tableLines) are
//     reported: do the beats narrate, and do the defense
//     witnesses testify in their own words?
// Prints a JSON summary to stdout and writes it to
// /tmp/darkwit-b-analysis.json (working copy; the evidence file
// is the record). Usage:
//   node scripts/darkwit-b-analyze-20261107.js [baselineDir] [armedDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyGate } = require(path.join(__dirname, 'sitstep-instrument-20261107'));
// sim-sitmetric-b: the row's finalSeat is the ALIGNED seat (taken, not
// priced) — see scripts/lib/seat-taken.js. A priced-but-untaken seat
// (seed 53004: "lesser", taken 0) reads 'none' here.
// sim-pricedseat-b: the substrate-sanity EARNED count must read the
// PRICED seat instead — pricedSeatOf (finalSeatPriced on new rows, the
// raw finalSeat on old rows) — never the taken seat.
const { alignedSeat, pricedSeatOf } = require(path.join(__dirname, 'lib', 'seat-taken'));

// classifySeatDay: the sitstep2-analyze extended rule, copied (same
// gates) so this analyzer judges seat days identically.
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
// 'challenge' with a path set.
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

function effectiveDays(days, won, horizon) {
  return won ? horizon : days;
}
function nonInferior(armedDays, armedWon, baselineDays, horizon) {
  return effectiveDays(armedDays, armedWon, horizon) >= baselineDays;
}

// sitLedger(o, entryDay): the ledger vector on the last daily row at
// or before the entry (or sit) day — the branch the table read.
// Returns { ledger, day } or null when no daily row carries one.
function sitLedger(o, refDay) {
  const daily = o.daily || [];
  let best = null;
  for (const r of daily) {
    if (!r.ledger || !r.ledger.witnessBranch) continue;
    if (refDay != null && (r.day | 0) > refDay) break;
    best = { day: r.day, ledger: r.ledger };
  }
  if (!best && daily.length) {
    const last = daily[daily.length - 1];
    if (last.ledger && last.ledger.witnessBranch) best = { day: last.day, ledger: last.ledger };
  }
  return best;
}

// roadAttribution(o): the replacement guard's attribution leg for an
// ARMED seed. Activity = any road verb fired; else a classified
// non-firing reason. Returns { active, activity, reason }.
function roadAttribution(o) {
  const ld = o.ledgerDarkStats || {};
  const activity = ((ld.begsRefused | 0) + (ld.aidBegsRefused | 0) + (ld.hoardTakes | 0) +
    (ld.betrayalDone | 0) + (ld.recruitDone | 0));
  if (activity > 0) return { active: true, activity: activity, reason: null };
  if ((o.gameDays | 0) < 15) return { active: false, activity: 0, reason: 'died-before-d15' };
  if (ld.quietExile) return { active: false, activity: 0, reason: 'exiled' };
  if (ld.stoppedTable) return { active: false, activity: 0, reason: 'preview-staged-early' };
  if ((ld.recruitTried | 0) > 0 || (ld.betrayalSkipped | 0) > 0) return { active: false, activity: 0, reason: 'attempted-no-convert' };
  return { active: false, activity: 0, reason: 'UNEXPLAINED' };
}

// walkNarration(o, walk): the #1888 read for one witness walk —
// beat framing lines from the tablePrompt capture on the walk day,
// testimony lines (`, sworn: `), and the cold/let choice lines in
// tableLines on the walk day.
function walkNarration(o, walk) {
  const prompts = (o.tablePrompts || []).filter(function (p) { return p.day === walk.day; });
  const texts = prompts.map(function (p) { return p.text || ''; });
  const joined = texts.join('\n');
  const lines = joined.split('\n').filter(function (l) { return l; });
  const hasBeat = function (re) { return re.test(joined); };
  const testimony = lines.filter(function (l) { return /, sworn: /.test(l); });
  const dayLines = (o.tableLines || []).filter(function (t) { return t.day === walk.day; }).map(function (t) { return t.line; });
  return {
    day: walk.day, branch: walk.branch,
    prompts: prompts.length,
    promptLines: lines.length,
    beat0Opening: hasBeat(/OPENING — THE CHARGES/),
    beat1Defense: hasBeat(/THE DEFENSE/),
    beat2SettlementOrChant: hasBeat(/THE SETTLEMENT|THE CHANT/),
    testimonyLines: testimony.length,
    testimony: testimony.slice(0, 4),
    coldLine: dayLines.some(function (l) { return /read them cold/i.test(l); }),
    letLine: dayLines.some(function (l) { return /let them speak/i.test(l); }),
    publicOrBloodLine: dayLines.some(function (l) { return /In public|You give it to them|measured verdict|the chant dies/i.test(l); }),
  };
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
  const dw = o.witnessdoorStats || {};
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
  const witnessOffered = !!(offered && offered.indexOf('witness') >= 0);
  const witnessWalked = walked.filter(function (w) { return w.path === 'witness'; });
  const darkWitnessWalked = witnessWalked.filter(function (w) { return w.branch === 'dark'; });
  const lightWitnessWalked = witnessWalked.filter(function (w) { return w.branch === 'light'; });
  const witnessVerbEntries = verbEntries.filter(function (e) { return e.path === 'witness'; });
  const finalOnWitness = (dw.log || []).filter(function (e) { return e.phase === 'finals'; })
    .some(function (e) { return e.path === 'witness'; });
  const witnessWin = !!o.won && witnessWalked.length > 0 && walked[0].path === 'witness' &&
    downgrades === 0 && finalOnWitness;
  const darkWitnessWin = witnessWin && walked[0].branch === 'dark';
  const lightWitnessWin = witnessWin && walked[0].branch === 'light';
  const witnessOfferedUnwalked = witnessOffered && !(walked.length && walked[0].path === 'witness');
  // Branch offered at the paths offer: the ledger trace on the
  // entry day (or the sit day) reads the branch the table offered.
  const refDay = walked.length ? walked[0].day : (ts.seatDay != null ? ts.seatDay : null);
  const sitLed = sitLedger(o, refDay);
  const offeredBranch = sitLed ? sitLed.ledger.witnessBranch.branch : null;
  const offeredMargin = sitLed ? { dark: sitLed.ledger.witnessBranch.dark, light: sitLed.ledger.witnessBranch.light } : null;
  const narration = witnessWalked.map(function (w) { return walkNarration(o, w); });
  const road = roadAttribution(o);
  return {
    seed: o.seed, days: o.days, gameDays: o.gameDays, endReason: o.endReason,
    won: !!o.won, over: !!o.over, standing: o.standing, scaleRank: o.scaleRank,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave,
    finalSeat: alignedSeat(o),
    finalSeatPriced: pricedSeatOf(o),
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
    witnessOffered: witnessOffered,
    witnessEntered: witnessWalked.length, witnessWalked: witnessWalked,
    darkWitnessEntered: darkWitnessWalked.length, darkWitnessWalked: darkWitnessWalked,
    lightWitnessEntered: lightWitnessWalked.length, lightWitnessWalked: lightWitnessWalked,
    witnessVerbEntries: witnessVerbEntries,
    witnessWin: witnessWin, darkWitnessWin: darkWitnessWin, lightWitnessWin: lightWitnessWin,
    finalOnWitness: finalOnWitness,
    witnessOfferedUnwalked: witnessOfferedUnwalked,
    offeredBranch: offeredBranch, offeredMargin: offeredMargin,
    sitLedger: sitLed ? { day: sitLed.day, killed: sitLed.ledger.killed, protected: sitLed.ledger.protected,
      betrayed: sitLed.ledger.betrayed, foodShared: sitLed.ledger.foodShared, foodHoarded: sitLed.ledger.foodHoarded,
      showmanship: sitLed.ledger.showmanship, exposed: sitLed.ledger.exposed,
      branch: sitLed.ledger.witnessBranch.branch, dark: sitLed.ledger.witnessBranch.dark, light: sitLed.ledger.witnessBranch.light,
      notes: sitLed.ledger.witnessBranch.notes } : null,
    ledgerTraceOk: !!sitLed,
    roadAttribution: road,
    ledgerDark: o.ledgerDarkStats || null,
    narration: narration,
    tablePrompts: (o.tablePrompts || []).length,
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
  };
}

if (require.main === module) {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-darkwit-b-baseline');
  const armedDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-darkwit-b-armed');
  const base = loadDir(baseDir);
  const armed = loadDir(armedDir);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) throw new Error('no baseline files in ' + baseDir);
  seeds.forEach(function (s) { if (!armed[s]) throw new Error('missing armed file for seed ' + s); });

  const bRows = seeds.map(function (s) { return analyzeSeed(base[s]); });
  const aRows = seeds.map(function (s) { return analyzeSeed(armed[s]); });

  // --- replacement guard: attribution + trace (armed leg only) ---
  const guard = seeds.map(function (s, i) {
    const a = aRows[i];
    const att = a.roadAttribution;
    const attOk = att.active || (att.reason && att.reason !== 'UNEXPLAINED');
    const traceOk = !!a.ledgerTraceOk;
    return { seed: s, clause: 'armed attribution + ledger trace',
      attributionActive: att.active, attributionReason: att.reason,
      traceOk: traceOk, match: attOk && traceOk,
      firstDiff: !attOk ? ('attribution UNEXPLAINED (road activity 0, no classified reason)') :
        (!traceOk ? 'ledger trace missing (no daily row with witnessBranch)' : null) };
  });
  const guardPass = guard.filter(function (g) { return g.match; }).length;

  // --- primary / sanity / cost ---
  const darkEnteredArmed = aRows.filter(function (r) { return r.darkWitnessEntered > 0; }).length;
  const darkWinsArmed = aRows.filter(function (r) { return r.darkWitnessWin; }).length;
  const darkEnteredBase = bRows.filter(function (r) { return r.darkWitnessEntered > 0; }).length;
  const lightEnteredArmed = aRows.filter(function (r) { return r.lightWitnessEntered > 0; }).length;
  const lightEnteredBase = bRows.filter(function (r) { return r.lightWitnessEntered > 0; }).length;
  const winsArmed = aRows.filter(function (r) { return r.won; }).length;
  const winsBase = bRows.filter(function (r) { return r.won; }).length;
  // sim-pricedseat-b: the sanity bar is about EARNED (priced) seats,
  // not taken ones — count finalSeatPriced, never finalSeat.
  const baseSeats = bRows.filter(function (r) { return r.finalSeatPriced === 'lesser' || r.finalSeatPriced === 'full'; }).length;
  const baseSat = bRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const armedSat = aRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const bStarv = bRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const aStarv = aRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const armOnlyStarv = aRows.reduce(function (t, r, i) { return t + (bRows[i].starvation === 0 ? r.starvation : 0); }, 0);
  const HORIZON = 150;
  const nonInf = seeds.map(function (s, i) {
    const effArmed = effectiveDays(aRows[i].days, aRows[i].won, HORIZON);
    const effBase = bRows[i].days;
    return { seed: s, armedDays: aRows[i].days, armedWon: !!aRows[i].won,
      armedEffective: effArmed, baselineDays: effBase, pass: effArmed >= effBase };
  });
  const nonInfPass = nonInf.filter(function (r) { return r.pass; }).length;
  const aPairs = aRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const bPairs = bRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const witnessOfferedArmed = aRows.filter(function (r) { return r.witnessOffered; }).length;
  const witnessOfferedBase = bRows.filter(function (r) { return r.witnessOffered; }).length;
  const witnessOfferedUnwalkedArmed = aRows.filter(function (r) { return r.witnessOfferedUnwalked; }).length;
  const witnessOfferedUnwalkedBase = bRows.filter(function (r) { return r.witnessOfferedUnwalked; }).length;
  // Betrayal-attributed villager deaths (recorded, not gated): the
  // road's betrayal victim, named per seed from the road counters.
  const betrayalDeaths = aRows.filter(function (r) {
    return r.ledgerDark && (r.ledgerDark.betrayalDone | 0) > 0;
  }).map(function (r) { return { seed: r.seed, day: r.ledgerDark.betrayalDay, victim: r.ledgerDark.betrayalVictim }; });

  const wall = function (rows) {
    return {
      national: rows.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      tableSat: rows.filter(function (r) { return r.tsTaken > 0; }).length,
      doorsEntered: rows.filter(function (r) { return r.doorsEntered > 0; }).length,
      witnessEntered: rows.filter(function (r) { return r.witnessEntered > 0; }).length,
      darkWitnessEntered: rows.filter(function (r) { return r.darkWitnessEntered > 0; }).length,
      darkWitnessWins: rows.filter(function (r) { return r.darkWitnessWin; }).length,
      witnessWins: rows.filter(function (r) { return r.witnessWin; }).length,
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

  // Bars auto-scale: 8-seed pilot bars vs 12-seed confirm bars
  // (frozen prereg). N is the corpus size.
  const N = seeds.length;
  const enteredBar = N === 8 ? 2 : 4;
  const marginBar = N === 8 ? 2 : 3;
  const sanityBar = N === 8 ? 2 : 4;
  const winsExpectation = N === 8 ? 2 : 3;
  const wallB = wall(bRows);
  const wallA = wall(aRows);
  const verdict = {
    primary: { darkWitnessEnteredArmed: darkEnteredArmed, darkWitnessWinsArmed: darkWinsArmed,
      darkWitnessWinsExpectation: winsExpectation, darkWitnessWinsMeetsExpectation: darkWinsArmed >= winsExpectation,
      winsArmed: winsArmed, winsBaseline: winsBase, winDelta: winsArmed - winsBase,
      darkWitnessEnteredBaseline: darkEnteredBase,
      darkWitnessEnteredMargin: darkEnteredArmed - darkEnteredBase,
      lightWitnessEnteredArmed: lightEnteredArmed, lightWitnessEnteredBaseline: lightEnteredBase,
      bar: 'dark witness entered >=' + enteredBar + '/' + N + ' armed AND margin >=' + marginBar + ' over baseline dark-witness-entered',
      pass: darkEnteredArmed >= enteredBar && (darkEnteredArmed - darkEnteredBase) >= marginBar },
    substrateSanity: { baseSeatsEarned: baseSeats, baseSat: baseSat, armedSat: armedSat, bar: 'baseline lesser >=' + sanityBar + '/' + N + ' AND sat >=' + sanityBar + '/' + N, pass: baseSeats >= sanityBar && baseSat >= sanityBar },
    substrateGuard: { exactSeeds: guardPass, of: seeds.length, bar: 'replacement guard: attribution + ledger trace ' + N + '/' + N, pass: guardPass === seeds.length, detail: guard },
    costBar: {
      starvationBase: bStarv, starvationArmed: aStarv, starvationCap: bStarv + 2,
      starvationArmOnly: armOnlyStarv, armOnlyCap: 1,
      starvationPass: aStarv <= bStarv + 2,
      armOnlyPass: armOnlyStarv <= 1,
      medianBase: wallB.medianSurvival, medianArmed: wallA.medianSurvival,
      medianFloor: (wallB.medianSurvival == null ? null : 0.8 * wallB.medianSurvival),
      medianPass: wallB.medianSurvival == null ? false : wallA.medianSurvival >= 0.8 * wallB.medianSurvival,
      nonInferiority: nonInf, nonInferiorSeeds: nonInfPass, nonInferiorOf: seeds.length,
      nonInferiorityPass: nonInfPass === seeds.length, nonInferiorityRecordedOnly: true,
      betrayalDeaths: betrayalDeaths, betrayalDeathsRecordedOnly: true,
      pairDaysArmed: aPairs, pairDaysBase: bPairs, pairDaysRecordedOnly: true,
      pass: null,
    },
    offered: { witnessOfferedBaseline: witnessOfferedBase, witnessOfferedArmed: witnessOfferedArmed,
      witnessOfferedUnwalkedBaseline: witnessOfferedUnwalkedBase, witnessOfferedUnwalkedArmed: witnessOfferedUnwalkedArmed },
  };
  verdict.costBar.pass = verdict.costBar.starvationPass && verdict.costBar.armOnlyPass && verdict.costBar.medianPass;
  verdict.overall = verdict.primary.pass && verdict.substrateSanity.pass && verdict.substrateGuard.pass && verdict.costBar.pass
    ? 'GO' : 'NO-GO';
  if (!verdict.substrateSanity.pass) verdict.overall = 'NO-GO (substrate — dark drive unjudged)';

  const out = {
    arm: 'darkwit-b', seeds: seeds,
    baseline: bRows, armed: aRows,
    guard: guard, wallBaseline: wall(bRows), wallArmed: wall(aRows),
    verdict: verdict,
  };
  fs.writeFileSync('/tmp/darkwit-b-analysis.json', JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { analyzeSeed: analyzeSeed, classifySeatDay: classifySeatDay, entriesFromVerbs: entriesFromVerbs, medianOf: medianOf, starvation: starvation, effectiveDays: effectiveDays, nonInferior: nonInferior, roadAttribution: roadAttribution, sitLedger: sitLedger, walkNarration: walkNarration };
