#!/usr/bin/env node
// twoblow-analyze-20261031.js — sim-twoblow-a analyzer.
//
// Copy of the fieldkill census analyzer (same flee-trigger classes
// 1-8, kill join, killable-state definitions, party picture,
// cross-tabs, cross-checks) PLUS the committed-finish primary metric:
// converted field kills (wave >= 3, outcome vKill, committedFinish
// true), wave-3 / wave-4-5 field vKills, committed-fight outcomes,
// companion-floor flights, and committed-fight details for the
// sense read. Implements the prereg
// (evidence/2026-10-31/sim-twoblow-a-prereg.md).
// Reads splitter output: <corpusDir>/leadfeast/s<seed>.json.
//
// Usage: node scripts/twoblow-analyze-20261031.js <corpusDir> <seed...> [--out <file>]
// Prints a band summary to stdout; with --out writes the full JSON.
'use strict';
const fs = require('fs');
const path = require('path');

const W3_IDS = ['redactor', 'gavel', 'focus_group', 'spool', 'chorus_line', 'terms_of_service', 'callback', 'buffering', 'ad_break'];
// monsters.json hp upper bounds (data, wave 3) — fallback mMax only.
const W3_HP_HI = { redactor: 320, gavel: 360, focus_group: 300, spool: 340, chorus_line: 360, terms_of_service: 420, callback: 320, buffering: 340, ad_break: 380 };

function isW3Mid(mid) { return mid && W3_IDS.indexOf(mid) >= 0; }
function normCaller(row) {
  let c = row.caller || 'other';
  const stack = row.stack || '';
  if (c === 'other') {
    if (stack.indexOf('expeditionMonster') >= 0) c = 'expedition';
    else if (stack.indexOf('resolveWildMonsterEncounter') >= 0) c = 'wild';
    else if (stack.indexOf('resolvePatrol') >= 0) c = 'patrol';
    else if (stack.indexOf('aidFight') >= 0) c = 'aid';
    else if (stack.indexOf('lingererSortie') >= 0) c = 'sortie';
  }
  return c;
}

// Prereg flee-trigger classification, priority order 1-8. Returns class
// key or null for non-flight outcomes (caller must exclude those).
function classifyTrigger(f) {
  const mMax = f.mMaxHp != null ? f.mMaxHp : (W3_HP_HI[f.mid] || null);
  const mFrac = (f.mHpLeft != null && mMax) ? f.mHpLeft / mMax : null;
  if (f.outcome === 'mFlee' && f.rounds === 0 && f.volley && (f.volley.dmg || 0) > 0) return 'volley-driveoff';
  if (f.outcome === 'mFlee' && (f.peaceful || f.staredDown || (f.redactorQuiet || 0) >= 3 ||
      (Array.isArray(f.trickLog) && f.trickLog.some(t => String(t).indexOf('offer_food') >= 0)))) return 'trick-exit';
  if (f.fleeLearn === true) return 'learn';
  if (f.fleeHopeless === true && f.fleeLearn !== true) return 'hopeless';
  if (f.fleeHpFrac != null && f.fleeHopeless === false && f.fleeLearn !== true) return 'floor';
  if (f.outcome === 'mFlee' && mFrac != null && mFrac < 0.15) return 'mBreak-driveoff';
  if (f.rounds === 15 && (f.outcome === 'vFlee' || f.outcome === 'mFlee')) return 'round-cap';
  return 'unclassified';
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function dist(xs) { return { n: xs.length, median: median(xs), min: xs.length ? Math.min.apply(null, xs) : null, max: xs.length ? Math.max.apply(null, xs) : null }; }

function analyzeSeed(obj) {
  const seed = obj.seed;
  const field = (obj.fieldFights || []).filter(f => f.wave === 3);
  // --- committed-finish (primary metric, all waves >= 3) ---
  const fieldW3p = (obj.fieldFights || []).filter(f => (f.wave | 0) >= 3);
  const convertedRows = fieldW3p.filter(f => f.outcome === 'vKill' && f.committedFinish === true);
  const w3FieldVKills = field.filter(f => f.outcome === 'vKill');
  const w45FieldVKills = (obj.fieldFights || []).filter(f => (f.wave | 0) >= 4 && f.outcome === 'vKill');
  const committedFights = fieldW3p.filter(f => f.committedFinish === true);
  const committedOutcomes = {};
  for (const f of committedFights) committedOutcomes[f.outcome || 'null'] = (committedOutcomes[f.outcome || 'null'] || 0) + 1;
  const committedW3Details = committedFights.filter(f => f.wave === 3).map(f => ({ day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome, rounds: f.rounds, committedRounds: f.committedRounds | 0, twoblowLastTwo: f.twoblowLastTwo || null, twoblowSum: f.twoblowSum != null ? f.twoblowSum : null, mDealt: f.mDealt, vTaken: f.vTaken, mHpLeft: f.mHpLeft, mHpStart: f.mHpStart, mMaxHp: f.mMaxHp, intent: f.intent, caller: f.caller, log: f.log || null }));
  const floorFights = fieldW3p.filter(f => f.outcome === 'vFlee' && Array.isArray(f.log) && f.log.some(l => String(l).indexOf('Committed-finish floor') >= 0));
  const committedFloorN = floorFights.length;
  const committedDeaths = committedFights.filter(f => f.outcome === 'vDie').length;
  const tb = (obj.tbFights || []).filter(t => (t.monsterIds || []).some(isW3Mid));
  const kills = (obj.killEvents || []).filter(k => k.wave === 3);
  const pyrrhic = (obj.pyrrhicEvents || []).filter(k => k.wave === 3);
  const logW3 = (obj.killLog || []).filter(e => e.w === 3);

  // --- field outcome split ---
  const fieldOutcomes = {};
  for (const f of field) fieldOutcomes[f.outcome || 'null'] = (fieldOutcomes[f.outcome || 'null'] || 0) + 1;
  const tbOutcomes = {};
  for (const t of tb) tbOutcomes[t.result || 'null'] = (tbOutcomes[t.result || 'null'] || 0) + 1;

  // --- per-fight derived fields + trigger classification ---
  const flights = [];
  const unclassifiedFlights = [];
  const triggerCounts = {};
  const triggerXIntent = {};
  const triggerXCaller = {};
  for (const f of field) {
    const mMax = f.mMaxHp != null ? f.mMaxHp : (W3_HP_HI[f.mid] || null);
    let mHpStart = f.mHpStart;
    let derivedStart = false;
    if (mHpStart == null && f.mDealt != null && f.mHpLeft != null) { mHpStart = f.mDealt + f.mHpLeft; derivedStart = true; }
    let vDpr;
    if ((f.rounds || 0) >= 1) vDpr = (f.mDealt || 0) / Math.max(1, f.rounds);
    else vDpr = (f.volley && f.volley.dmg) || 0;
    const mDpr = (f.vTaken || 0) / Math.max(1, f.rounds || 0);
    const rtk = (f.mHpLeft != null) ? (vDpr > 0 ? f.mHpLeft / vDpr : Infinity) : null;
    f._mMax = mMax; f._mHpStart = mHpStart; f._derivedStart = derivedStart;
    f._vDpr = vDpr; f._mDpr = mDpr; f._rtk = rtk;
    f._mFracLeft = (f.mHpLeft != null && mMax) ? f.mHpLeft / mMax : null;
    f._caller = normCaller(f);
    if (f.outcome === 'vFlee' || f.outcome === 'mFlee') {
      const cls = classifyTrigger(f);
      f._trigger = cls;
      triggerCounts[cls] = (triggerCounts[cls] || 0) + 1;
      const intent = f.intent || 'null';
      triggerXIntent[cls] = triggerXIntent[cls] || {}; triggerXIntent[cls][intent] = (triggerXIntent[cls][intent] || 0) + 1;
      triggerXCaller[cls] = triggerXCaller[cls] || {}; triggerXCaller[cls][f._caller] = (triggerXCaller[cls][f._caller] || 0) + 1;
      flights.push(f);
      if (cls === 'unclassified') unclassifiedFlights.push({ day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt, vTaken: f.vTaken, mHpLeft: f.mHpLeft, fleeHopeless: f.fleeHopeless, fleeLearn: f.fleeLearn, fleeHpFrac: f.fleeHpFrac, volley: f.volley, peaceful: f.peaceful, staredDown: f.staredDown, redactorQuiet: f.redactorQuiet, trickLog: f.trickLog, caller: f._caller, intent: f.intent });
    }
  }

  // --- killable state over flee fights (zero-damage in own class) ---
  const finiteRtk = flights.filter(f => f._rtk !== Infinity && f._rtk != null).map(f => f._rtk);
  const zeroDmg = flights.filter(f => f._rtk === Infinity);
  const killable = flights.filter(f => f.mHpLeft != null && f._vDpr > 0 && f.mHpLeft <= 2 * f._vDpr);
  const nearKillable = flights.filter(f => f.mHpLeft != null && f._vDpr > 0 && f.mHpLeft <= 5 * f._vDpr);
  const belowBreak = flights.filter(f => f._mFracLeft != null && f._mFracLeft < 0.15);
  let closest = null;
  for (const f of flights) { if (f._rtk !== Infinity && f._rtk != null && (!closest || f._rtk < closest._rtk)) closest = f; }
  const closestInfo = closest ? { day: closest.day, vid: closest.vid, mid: closest.mid, outcome: closest.outcome, trigger: closest._trigger, rounds: closest.rounds, mDealt: closest.mDealt, vTaken: closest.vTaken, allyDealt: closest.allyDealt, mHpLeft: closest.mHpLeft, mMax: closest._mMax, mFracLeft: closest._mFracLeft, vDpr: closest._vDpr, rtk: closest._rtk, partySize: closest.partySize, calledHelp: closest.calledHelp, intent: closest.intent, caller: closest._caller, log: closest.log || null } : null;

  // --- damage distributions by outcome ---
  const byOutcome = {};
  for (const f of field) {
    const o = f.outcome || 'null';
    byOutcome[o] = byOutcome[o] || { mDealt: [], vTaken: [], allyDealt: [], rounds: [], vDpr: [], mDpr: [], mHpLeft: [], mFracLeft: [], rtk: [] };
    byOutcome[o].mDealt.push(f.mDealt || 0); byOutcome[o].vTaken.push(f.vTaken || 0);
    byOutcome[o].allyDealt.push(f.allyDealt || 0); byOutcome[o].rounds.push(f.rounds || 0);
    byOutcome[o].vDpr.push(f._vDpr); byOutcome[o].mDpr.push(f._mDpr);
    if (f.mHpLeft != null) byOutcome[o].mHpLeft.push(f.mHpLeft);
    if (f._mFracLeft != null) byOutcome[o].mFracLeft.push(f._mFracLeft);
    if (f._rtk !== Infinity && f._rtk != null) byOutcome[o].rtk.push(f._rtk);
  }
  const byOutcomeDist = {};
  for (const o of Object.keys(byOutcome)) {
    byOutcomeDist[o] = { n: byOutcome[o].mDealt.length };
    for (const k of ['mDealt', 'vTaken', 'allyDealt', 'rounds', 'vDpr', 'mDpr', 'mHpLeft', 'mFracLeft', 'rtk']) byOutcomeDist[o][k] = dist(byOutcome[o][k]);
  }

  // --- party picture (wild only + all) ---
  function partyClass(f) {
    const soloStart = !f.allyFromStart && (f.optsAllyVids || 0) === 0;
    if (f.calledHelp) return soloStart ? 'solo-shout-joined' : 'party-shout-joined';
    if (f.allyFromStart || (f.optsAllyVids || 0) > 0) return 'party-from-start';
    return 'solo-start-to-finish';
  }
  const wild = field.filter(f => f._caller === 'wild');
  function partyPicture(rows) {
    const counts = {}, outcomes = {};
    for (const f of rows) {
      const pc = partyClass(f);
      counts[pc] = (counts[pc] || 0) + 1;
      outcomes[pc] = outcomes[pc] || {}; outcomes[pc][f.outcome || 'null'] = (outcomes[pc][f.outcome || 'null'] || 0) + 1;
    }
    const partySizes = {};
    for (const f of rows) partySizes[f.partySize != null ? String(f.partySize) : 'null'] = (partySizes[f.partySize != null ? String(f.partySize) : 'null'] || 0) + 1;
    return { n: rows.length, partyClassCounts: counts, outcomesByPartyClass: outcomes, partySizeDist: partySizes,
      soloStartShare: rows.length ? rows.filter(f => !f.allyFromStart && (f.optsAllyVids || 0) === 0).length / rows.length : null,
      allyFromStartShare: rows.length ? rows.filter(f => f.allyFromStart).length / rows.length : null,
      shoutJoinedShare: rows.length ? rows.filter(f => f.calledHelp).length / rows.length : null,
      soloStartToFinishShare: rows.length ? rows.filter(f => partyClass(f) === 'solo-start-to-finish').length / rows.length : null };
  }

  // --- kill join (greedy, each event and each row used once) ---
  // Ledger events join to field vKill rows OR TB won/routed rows, same day + mid.
  const fieldVKills = field.filter(f => f.outcome === 'vKill');
  const tbWonRouted = tb.filter(t => t.result === 'won' || t.result === 'routed');
  const tbLost = tb.filter(t => t.result === 'lost');
  const usedField = new Set(), usedTbWR = new Set(), usedTbLost = new Set();
  function findRow(rows, used, day, mid) {
    for (let i = 0; i < rows.length; i++) {
      if (used.has(i)) continue;
      const r = rows[i];
      const rDay = r.day;
      const rMids = r.mid ? [r.mid] : (r.monsterIds || []);
      if (rDay === day && rMids.indexOf(mid) >= 0) { used.add(i); return r; }
    }
    return null;
  }
  const joinLedger = { fieldVKill: 0, tbWon: 0, tbRouted: 0, orphan: [] };
  for (const ev of kills) {
    let row = findRow(fieldVKills, usedField, ev.day, ev.mid);
    if (row) { joinLedger.fieldVKill++; continue; }
    row = findRow(tbWonRouted, usedTbWR, ev.day, ev.mid);
    if (row) { if (row.result === 'won') joinLedger.tbWon++; else joinLedger.tbRouted++; continue; }
    joinLedger.orphan.push(ev);
  }
  const joinPyrrhic = { tbLost: 0, orphan: [] };
  for (const ev of pyrrhic) {
    const row = findRow(tbLost, usedTbLost, ev.day, ev.mid);
    if (row) joinPyrrhic.tbLost++; else joinPyrrhic.orphan.push(ev);
  }
  // Field vKill rows with no kill event, TB won/routed rows with no kill event.
  const fieldVKillNoEvent = fieldVKills.filter((_, i) => !usedField.has(i)).map(f => ({ day: f.day, vid: f.vid, mid: f.mid }));
  const tbWRNoEvent = tbWonRouted.filter((_, i) => !usedTbWR.has(i)).map(t => ({ day: t.day, result: t.result, monsterIds: t.monsterIds }));
  // Kill-log coverage (iii): every wave-3 log entry needs a kill OR pyrrhic event.
  const allEvents = kills.concat(pyrrhic);
  const usedEv = new Set();
  const unmatchedLog = [];
  for (const le of logW3) {
    let found = -1;
    for (let i = 0; i < allEvents.length; i++) {
      if (usedEv.has(i)) continue;
      const ev = allEvents[i];
      if (ev.day === le.d && ev.mid === le.mid) { found = i; break; }
    }
    if (found >= 0) usedEv.add(found); else unmatchedLog.push(le);
  }
  const eventsNoLog = allEvents.filter((_, i) => !usedEv.has(i)).map(ev => ({ day: ev.day, mid: ev.mid, by: ev.by, via: ev.via, pyrrhic: !!ev.pyrrhic }));

  // --- wall numbers + checks ---
  const daily = obj.daily || [];
  const dailySorted = daily.every((r, i) => i === 0 || r.day >= daily[i - 1].day);
  const w3days = daily.filter(r => r.w3rung).length;
  const firstW3Day = (daily.find(r => r.w3rung) || {}).day || null;
  let endP3 = 0, endWar = 0;
  if (daily.length) { endP3 = daily[daily.length - 1].p3 || 0; endWar = daily[daily.length - 1].warPts || 0; }

  return { seed, anchorCommit: obj.anchorCommit || null, instrument: obj.instrument || null,
    days: obj.days, gameDays: obj.gameDays, endReason: obj.endReason, endScaleRank: obj.endScaleRank,
    national: obj.national, table: obj.table, won: obj.won, maxWave: obj.maxWave, wave4: obj.wave4, wave5: obj.wave5,
    recorderErrs: obj.recorderErrs, recorderErrors: obj.recorderErrors || [], recorderOverflow: obj.recorderOverflow || {},
    meetings: field.length + tb.length, fieldMeetings: field.length, tbMeetings: tb.length,
    fieldOutcomes, tbOutcomes,
    triggerCounts, triggerXIntent, triggerXCaller, unclassifiedFlights,
    fleeN: flights.length,
    killableN: killable.length, nearKillableN: nearKillable.length, belowBreakN: belowBreak.length, zeroDmgN: zeroDmg.length,
    rtkDist: dist(finiteRtk),
    rtkValues: finiteRtk,
    rtkLe2: finiteRtk.filter(x => x <= 2).length, rtkLe5: finiteRtk.filter(x => x <= 5).length, rtkLe15: finiteRtk.filter(x => x <= 15).length,
    byOutcomeDist, partyAll: partyPicture(field), partyWild: partyPicture(wild),
    joinLedger, joinPyrrhic, fieldVKillNoEvent, tbWRNoEvent, unmatchedLog, eventsNoLog,
    killEventsN: kills.length, pyrrhicEventsN: pyrrhic.length, logW3N: logW3.length,
    w3days, firstW3Day, endP3, endWar, dailySorted, dailyRows: daily.length,
    closestToKill: closestInfo,
    // committed-finish (primary metric)
    convertedN: convertedRows.length,
    convertedRows: convertedRows.map(f => ({ day: f.day, vid: f.vid, mid: f.mid, wave: f.wave, rounds: f.rounds, committedRounds: f.committedRounds | 0, twoblowLastTwo: f.twoblowLastTwo || null, twoblowSum: f.twoblowSum != null ? f.twoblowSum : null, mDealt: f.mDealt, vTaken: f.vTaken, mHpLeft: f.mHpLeft, intent: f.intent, caller: normCaller(f), log: f.log || null, twoblowCommitMhp: f.twoblowCommitMhp != null ? f.twoblowCommitMhp : null, twoblowCommitVhpFrac: f.twoblowCommitVhpFrac != null ? f.twoblowCommitVhpFrac : null, twoblowCommitSum: f.twoblowCommitSum != null ? f.twoblowCommitSum : null })),
    w3FieldVKillsN: w3FieldVKills.length, w45FieldVKillsN: w45FieldVKills.length,
    fieldW3pN: fieldW3p.length,
    committedFightsN: committedFights.length, committedOutcomes, committedW3Details,
    committedFloorN, committedDeaths,
    fieldW3DeathsN: fieldW3p.filter(f => f.outcome === 'vDie').length,
    fieldDeathsAllW3p: fieldW3p.filter(f => f.outcome === 'vDie').map(f => ({ day: f.day, vid: f.vid, mid: f.mid, wave: f.wave, rounds: f.rounds, committedFinish: !!f.committedFinish })),
    fieldDeaths: field.filter(f => f.outcome === 'vDie').map(f => ({ day: f.day, vid: f.vid, mid: f.mid, rounds: f.rounds })),
  };
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  let outFile = null;
  if (outIdx >= 0) { outFile = args[outIdx + 1]; args.splice(outIdx, 2); }
  const [corpusDir, ...seedArgs] = args;
  if (!corpusDir || !seedArgs.length) { console.error('usage: twoblow-analyze-20261031.js <corpusDir> <seed...> [--out <file>]'); process.exit(2); }
  const perSeed = [];
  for (const seed of seedArgs) {
    const fp = path.join(corpusDir, 'leadfeast', `s${seed}.json`);
    const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
    perSeed.push(analyzeSeed(obj));
  }
  // Band rollup.
  const sum = (fn) => perSeed.reduce((a, s) => a + (fn(s) || 0), 0);
  const band = {
    seeds: seedArgs.map(Number),
    nSeeds: perSeed.length,
    national: sum(s => s.national), table: sum(s => s.table), won: sum(s => s.won),
    wave4: sum(s => s.wave4), wave5: sum(s => s.wave5),
    medianSurvival: median(perSeed.map(s => s.gameDays || 0)), maxSurvival: Math.max.apply(null, perSeed.map(s => s.gameDays || 0)),
    meetings: sum(s => s.meetings), fieldMeetings: sum(s => s.fieldMeetings), tbMeetings: sum(s => s.tbMeetings),
    fieldOutcomes: {}, tbOutcomes: {}, triggerCounts: {},
    fleeN: sum(s => s.fleeN), killableN: sum(s => s.killableN), nearKillableN: sum(s => s.nearKillableN),
    belowBreakN: sum(s => s.belowBreakN), zeroDmgN: sum(s => s.zeroDmgN),
    rtkLe2: sum(s => s.rtkLe2), rtkLe5: sum(s => s.rtkLe5), rtkLe15: sum(s => s.rtkLe15),
    unclassifiedFlightsN: sum(s => s.unclassifiedFlights.length),
    orphanLedgerN: sum(s => s.joinLedger.orphan.length), orphanPyrrhicN: sum(s => s.joinPyrrhic.orphan.length),
    unmatchedLogN: sum(s => s.unmatchedLog.length), eventsNoLogN: sum(s => s.eventsNoLog.length),
    recorderErrs: sum(s => s.recorderErrs),
    killEventsN: sum(s => s.killEventsN), pyrrhicEventsN: sum(s => s.pyrrhicEventsN), logW3N: sum(s => s.logW3N),
    joinLedgerTotals: { fieldVKill: sum(s => s.joinLedger.fieldVKill), tbWon: sum(s => s.joinLedger.tbWon), tbRouted: sum(s => s.joinLedger.tbRouted) },
    joinPyrrhicTotals: { tbLost: sum(s => s.joinPyrrhic.tbLost) },
    fieldVKillNoEventN: sum(s => s.fieldVKillNoEvent.length), tbWRNoEventN: sum(s => s.tbWRNoEvent.length),
    dailySortedAll: perSeed.every(s => s.dailySorted),
    convertedN: sum(s => s.convertedN),
    w3FieldVKillsN: sum(s => s.w3FieldVKillsN), w45FieldVKillsN: sum(s => s.w45FieldVKillsN),
    fieldW3pN: sum(s => s.fieldW3pN),
    committedFightsN: sum(s => s.committedFightsN),
    committedOutcomes: perSeed.reduce((a, s) => { for (const [k, v] of Object.entries(s.committedOutcomes || {})) a[k] = (a[k] || 0) + v; return a; }, {}),
    committedFloorN: sum(s => s.committedFloorN), committedDeaths: sum(s => s.committedDeaths),
    fieldW3DeathsN: sum(s => s.fieldW3DeathsN),
  };
  for (const s of perSeed) {
    for (const [k, v] of Object.entries(s.fieldOutcomes)) band.fieldOutcomes[k] = (band.fieldOutcomes[k] || 0) + v;
    for (const [k, v] of Object.entries(s.tbOutcomes)) band.tbOutcomes[k] = (band.tbOutcomes[k] || 0) + v;
    for (const [k, v] of Object.entries(s.triggerCounts)) band.triggerCounts[k] = (band.triggerCounts[k] || 0) + v;
  }
  // Band rtk distribution, pooled over all flee fights on all seeds.
  const pooledRtk = perSeed.reduce((a, s) => a.concat(s.rtkValues || []), []);
  band.rtkPooled = dist(pooledRtk);
  band.rtkPooledShares = pooledRtk.length ? { le2: pooledRtk.filter(x => x <= 2).length / pooledRtk.length, le5: pooledRtk.filter(x => x <= 5).length / pooledRtk.length, le15: pooledRtk.filter(x => x <= 15).length / pooledRtk.length } : null;
  band.rtkSeedMedians = perSeed.map(s => ({ seed: s.seed, median: s.rtkDist.median, n: s.rtkDist.n }));
  const result = { band, perSeed };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
  console.log(JSON.stringify(band, null, 1));
  for (const s of perSeed) {
    console.log(`s${s.seed}: meet=${s.meetings} (field ${s.fieldMeetings} tb ${s.tbMeetings}) fieldOut=${JSON.stringify(s.fieldOutcomes)} tbOut=${JSON.stringify(s.tbOutcomes)} triggers=${JSON.stringify(s.triggerCounts)} flee=${s.fleeN} killable=${s.killableN} near=${s.nearKillableN} belowBreak=${s.belowBreakN} zeroDmg=${s.zeroDmgN} rtkMed=${s.rtkDist.median} rtk<=2:${s.rtkLe2} <=5:${s.rtkLe5} ledgerJoin=${JSON.stringify({ f: s.joinLedger.fieldVKill, w: s.joinLedger.tbWon, r: s.joinLedger.tbRouted, orph: s.joinLedger.orphan.length })} pyrrhicJoin=${JSON.stringify({ lost: s.joinPyrrhic.tbLost, orph: s.joinPyrrhic.orphan.length })} unmatchedLog=${s.unmatchedLog.length} errs=${s.recorderErrs} nat=${s.national} table=${s.table} won=${s.won} w4=${s.wave4} w5=${s.wave5} days=${s.gameDays} converted=${s.convertedN} w3fKill=${s.w3FieldVKillsN} w45fKill=${s.w45FieldVKillsN} committed=${s.committedFightsN} committedOut=${JSON.stringify(s.committedOutcomes)} floor=${s.committedFloorN} fDeathsW3p=${s.fieldW3DeathsN}`);
  }
}
if (require.main === module) main();
module.exports = { analyzeSeed, classifyTrigger, normCaller, W3_IDS, W3_HP_HI };
