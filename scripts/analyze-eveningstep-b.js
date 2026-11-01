#!/usr/bin/env node
// analyze-eveningstep-b.js — evening-step leg decomposition analyzer (DIAG ONLY).
// (sim-eveningstep-b; prereg: evidence/2026-11-01/
// sim-eveningstep-b-prereg.md, committed BEFORE any judged leg.)
//
// Reads awayeve corpora (per-seed JSON files as written by
// scripts/split-absencehunt-jsonl-b.js) and classifies each
// evening's evening-step leg path from the corpus record alone.
// The classification is exact because each nightStep outcome is
// reachable by exactly one branch of scripts/policies/
// nighttravel.js nightStep (plus insideevening.js eveningStep
// for the entry leg), and the corpus stores that outcome as
// eveningOutcome and its travelledHome flag as travelledHome.
//
// Leg paths (prereg taxonomy):
//   L0-no-step            eveningOutcome 'policy-no-record' (BARE)
//   L1-guard-game-over    'game-over'
//   L1-guard-combat       'blocked-combat' (combatLive at STEP time;
//                          the evening snap's inCombat is taken AFTER
//                          the step and may differ — both reported)
//   L1-guard-tent         'blocked-tent'
//   L2-offer-no           'out-of-reach' (step ran, haven not offered)
//   L3-hop-no             'travel-refused' (offered, hop moved nothing)
//   L3-hop-yes-entry-yes  travelledHome + 'completed'/'already-inside'
//   L3-hop-yes-entry-no   travelledHome + walk-no-path /
//                          no-go-inside-button / entry-refused /
//                          walk-interrupted-combat
//   L4-entry-only         NOT travelledHome + completed/already-inside
//                          (day already ended on the haven tile; the
//                          step ran only the entry leg)
//   L4-entry-no-only      NOT travelledHome + an entry-failure outcome
//                          (day ended on the haven tile, entry failed)
//   LX-*                  travel-arrived-combat, travel-died,
//                          haven-unknown, step-error, detour-* (the
//                          detour gate is OFF, so detour-* is an
//                          instrument surprise), or any unknown outcome
//                          (surprise).
//
// Deciding-leg rule (per P1-vs-BARE pair on one seed-day):
//   P1 haven + BARE away + P1 travelledHome  -> 'L3-hop' (the hop is
//     the necessary leg; entry is never necessary for the haven/away
//     classification because atHaven is position-based — if P1 inside
//     is false the entry is PROVEN unnecessary on that pair).
//   P1 haven + BARE away + NOT P1 travelledHome -> 'daytime-divergence'
//     (the evening step ran only the entry leg or no travel leg; the
//     day's end position differed before the step ran).
//   P1 away -> the keeping leg: L1 guard / L2 offer-no / L3 hop-no / LX.
//   Both haven, or both away with the same keeping class -> 'no-step-difference'.
//   Anything involving an LX surprise outcome -> 'UNISOLATED'.
//
// Usage:
//   node scripts/analyze-eveningstep-b.js --census <corpusDir...> <outFile>
//   node scripts/analyze-eveningstep-b.js --pair <p1File> <bareFile> <csFile> <day,day...> <outFile>
//     (pair mode emits one decomposition object per day: morning/evening
//     snaps, leg paths, wrapper/creekseek records, quoted day lines,
//     following-morning snaps, and the deciding leg per the rule above.)
'use strict';
const fs = require('fs');
const path = require('path');
const { atHaven } = require('./analyze-absencehunt-b');

const ENTRY_FAIL = new Set(['walk-no-path', 'no-go-inside-button', 'entry-refused', 'walk-interrupted-combat']);
const ENTRY_OK = new Set(['completed', 'already-inside']);

function legPathOf(eve) {
  const outcome = (eve && eve.eveningOutcome) || null;
  const trav = !!(eve && eve.travelledHome);
  if (outcome === 'policy-no-record') return { path: 'L0-no-step', surprise: false };
  if (outcome === 'game-over') return { path: 'L1-guard-game-over', surprise: false };
  if (outcome === 'blocked-combat') return { path: 'L1-guard-combat', surprise: false };
  if (outcome === 'blocked-tent') return { path: 'L1-guard-tent', surprise: false };
  if (outcome === 'out-of-reach') return { path: 'L2-offer-no', surprise: false };
  if (outcome === 'travel-refused') return { path: 'L3-hop-no', surprise: false };
  if (outcome === 'travel-arrived-combat') return { path: 'LX-arrived-combat', surprise: false };
  if (outcome === 'travel-died') return { path: 'LX-hop-died', surprise: false };
  if (outcome === 'haven-unknown') return { path: 'LX-haven-unknown', surprise: true };
  if (outcome === 'step-error') return { path: 'LX-step-error', surprise: true };
  if (outcome && outcome.indexOf('detour') === 0) return { path: 'LX-' + outcome, surprise: true };
  if (ENTRY_OK.has(outcome)) {
    return trav
      ? { path: 'L3-hop-yes-entry-yes', surprise: false }
      : { path: 'L4-entry-only', surprise: false };
  }
  if (ENTRY_FAIL.has(outcome)) {
    return trav
      ? { path: 'L3-hop-yes-entry-no', surprise: false }
      : { path: 'L4-entry-no-only', surprise: false };
  }
  return { path: 'LX-unknown-outcome:' + outcome, surprise: true };
}

function eveClass(eve) {
  if (!eve) return 'missing';
  if (atHaven(eve)) return 'haven';
  if (eve.roadActive || eve.roadOnRoad) return 'road';
  return 'away';
}

function keepingLeg(path) {
  if (path === 'L1-guard-game-over') return 'L1-guard-game-over';
  if (path === 'L1-guard-combat') return 'L1-guard-combat';
  if (path === 'L1-guard-tent') return 'L1-guard-tent';
  if (path === 'L2-offer-no') return 'L2-offer-no';
  if (path === 'L3-hop-no') return 'L3-hop-no';
  if (path === 'L0-no-step') return 'L0-no-step';
  return null;
}

function decidingLeg(p1Eve, bareEve) {
  const p1 = legPathOf(p1Eve);
  const bare = legPathOf(bareEve);
  if (p1.surprise || bare.surprise) return { leg: 'UNISOLATED', reason: 'surprise outcome on pair day' };
  const p1c = eveClass(p1Eve), barec = eveClass(bareEve);
  if (p1c === 'haven' && barec === 'away') {
    if (p1Eve.travelledHome) {
      return {
        leg: 'L3-hop',
        reason: 'P1 travelledHome true (' + p1.path + '); BARE no-step away; ' +
          (p1Eve.inside ? 'entry succeeded but is not necessary: atHaven is position-based, so the hop alone decides the haven class.'
            : 'entry FAILED (inside false) yet evening is haven by position — entry proven unnecessary on this pair.'),
      };
    }
    return {
      leg: 'daytime-divergence',
      reason: 'P1 travelledHome false (' + p1.path + '): the evening step moved nothing; the day ended at haven on P1 and away on BARE before the step ran.',
    };
  }
  if (p1c === 'away' && barec === 'away') {
    const keep = keepingLeg(p1.path);
    if (keep) return { leg: keep, reason: 'P1 stayed away via ' + p1.path + ' while BARE stayed away by no-step.' };
    return { leg: 'UNISOLATED', reason: 'P1 away via non-keeping path ' + p1.path };
  }
  if (p1c === 'away' && barec === 'haven') {
    const keep = keepingLeg(p1.path);
    return { leg: keep || 'UNISOLATED', reason: 'reverse pair: BARE day ended home, P1 day ended away and the step kept it away (' + p1.path + ').' };
  }
  return { leg: 'no-step-difference', reason: 'both evenings ' + p1c + ' (' + p1.path + ' vs ' + bare.path + ').' };
}

const QUOTE_RE = /travel \d+ tiles? to|you come home|walk back into haven|back is back|the way home still refuses|no crossing without a bridge|you lash logs|rough bridge|you make for the creek|to drink before night|travel \d+ tiles? to haven|the bridge stands/i;

function dayRec(inst, day) {
  const dec = (inst.decisions || []).find((d) => d.loopDay === day) || null;
  const eve = (inst.evenings || []).find((e) => e.loopDay === day) || null;
  const nextDec = (inst.decisions || []).find((d) => d.loopDay === day + 1) || null;
  const nextEve = (inst.evenings || []).find((e) => e.loopDay === day + 1) || null;
  return { dec, eve, nextDec, nextEve };
}

function snapOf(dec) {
  if (!dec || !dec.morning) return null;
  const m = dec.morning;
  return { tile: m.tile, mapPx: m.mapPx, mapPy: m.mapPy, inside: m.inside, kcal: m.kcal, dayTicks: m.dayTicks, vesselId: m.vesselId };
}

function eveSnapOf(eve) {
  if (!eve) return null;
  return {
    tile: eve.tile, mapPx: eve.mapPx, mapPy: eve.mapPy, inside: eve.inside,
    kcal: eve.kcal, dayTicks: eve.dayTicks, vesselId: eve.vesselId,
    eveningOutcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome,
    inCombat: eve.inCombat, insideTent: eve.insideTent, class: eveClass(eve),
  };
}

function pairDay(p1, bare, cs, day) {
  const P = dayRec(p1, day), B = dayRec(bare, day), C = cs ? dayRec(cs, day) : null;
  const out = { day };
  for (const [key, R] of [['p1', P], ['bare', B], ['creekseek', C]]) {
    if (!R) { out[key] = null; continue; }
    const eve = R.eve;
    out[key] = {
      morning: snapOf(R.dec),
      evening: eveSnapOf(eve),
      legPath: eve ? legPathOf(eve).path : 'missing',
      legSurprise: eve ? legPathOf(eve).surprise : true,
      woodcarry: eve ? (eve.woodcarry || null) : null,
      warmth: eve ? (eve.warmth || null) : null,
      creekseek: eve ? (eve.creekseek || null) : null,
      forageTrips: R.dec ? (R.dec.ctxDelta || {}).forageTrips : null,
      quotedLines: eve ? (eve.dayLines || []).filter((l) => QUOTE_RE.test(l)) : [],
      dayLines: eve ? (eve.dayLines || []) : [],
      nextMorning: snapOf(R.nextDec),
      nextEvening: eveSnapOf(R.nextEve),
    };
  }
  out.deciding = (P.eve && B.eve) ? decidingLeg(P.eve, B.eve) : { leg: 'UNISOLATED', reason: 'missing pair-day record' };
  return out;
}

function censusOfDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const seeds = {};
  const legCounts = {};
  let evenings = 0, travelledHome = 0, surprises = 0;
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const perDay = {};
    for (const eve of (inst.evenings || [])) {
      const lp = legPathOf(eve);
      legCounts[lp.path] = (legCounts[lp.path] || 0) + 1;
      evenings++;
      if (eve.travelledHome) travelledHome++;
      if (lp.surprise) surprises++;
      perDay[eve.loopDay] = { path: lp.path, outcome: eve.eveningOutcome, travelledHome: !!eve.travelledHome, class: eveClass(eve), tile: eve.tile, mapPx: eve.mapPx, mapPy: eve.mapPy, inCombat: eve.inCombat };
    }
    seeds[inst.seed] = { errCount: inst.errCount || 0, endReason: inst.endReason, daysAlive: inst.daysAlive, perDay };
  }
  return { dir, files: files.length, seeds: Object.keys(seeds).length, evenings, travelledHome, surprises, legCounts, perSeed: seeds };
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--census') {
    const outFile = args[args.length - 1];
    const dirs = args.slice(1, -1);
    const parts = dirs.map(censusOfDir);
    const merged = { dirs, files: 0, seeds: 0, evenings: 0, travelledHome: 0, surprises: 0, legCounts: {}, perSeed: {} };
    for (const p of parts) {
      merged.files += p.files; merged.seeds += p.seeds; merged.evenings += p.evenings;
      merged.travelledHome += p.travelledHome; merged.surprises += p.surprises;
      for (const [k, v] of Object.entries(p.legCounts)) merged.legCounts[k] = (merged.legCounts[k] || 0) + v;
      Object.assign(merged.perSeed, p.perSeed);
    }
    fs.writeFileSync(outFile, JSON.stringify(merged, null, 2) + '\n');
    console.log('census: dirs=' + dirs.length + ' files=' + merged.files + ' evenings=' + merged.evenings + ' travelledHome=' + merged.travelledHome + ' surprises=' + merged.surprises);
    return;
  }
  if (args[0] === '--pair') {
    const [p1File, bareFile, csFile, dayList, outFile] = args.slice(1);
    const p1 = JSON.parse(fs.readFileSync(p1File, 'utf8'));
    const bare = JSON.parse(fs.readFileSync(bareFile, 'utf8'));
    const cs = csFile === 'none' ? null : JSON.parse(fs.readFileSync(csFile, 'utf8'));
    const days = dayList.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    const result = {
      seed: p1.seed, p1File: path.basename(p1File), bareFile: path.basename(bareFile), csFile: cs ? path.basename(csFile) : null,
      pairs: days.map((d) => pairDay(p1, bare, cs, d)),
    };
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
    for (const pr of result.pairs) console.log('pair day=' + pr.day + ' p1=' + pr.p1.legPath + ' bare=' + pr.bare.legPath + ' deciding=' + pr.deciding.leg);
    return;
  }
  console.error('usage: analyze-eveningstep-b.js --census <dir...> <out> | --pair <p1> <bare> <cs|none> <days> <out>');
  process.exit(2);
}

if (require.main === module) main();
module.exports = { legPathOf, eveClass, decidingLeg, pairDay, censusOfDir };
