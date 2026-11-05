#!/usr/bin/env node
// analyze-bankadded.js — BANK-ADDED-edible event filter
// (sim-bankadded-a; prereg: evidence/2026-11-04/
// sim-bankadded-a-prereg.md, committed BEFORE any judged sim).
// Reads bankfood-b-nighttravel-s<seed>.json corpora (one file
// per seed) via scripts/analyze-bankretain-rerun.js's
// retainedEvents, and filters to the NARROW event this arm
// judges: mode 'bank' AND bank-added edible delta > 0
// (postBankEdible − packBeforeEdible), split judged vs
// censored. Flip-mode delta > 0 events are reported as
// screen CONTEXT only, never counted toward the bar.
// Strandnarr corpora (strandnarr-s<seed>.json) carry the same
// evenings + bankfoodStore but no top-level firstUpkeeps;
// normalizeStrandnarr() lifts bankfoodStore.firstUpkeeps to
// the top level so retainedEvents applies unchanged.
// Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { retainedEvents } = require('./analyze-bankretain-rerun');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
// Normalize a strandnarr corpus instance to the bankfood
// corpus shape retainedEvents expects. Pure: returns a
// shallow copy with firstUpkeeps lifted; bankfood corpora
// pass through unchanged.
function normalizeStrandnarr(inst) {
  if (!inst) return inst;
  if (Array.isArray(inst.firstUpkeeps)) return inst;
  const fu = inst.bankfoodStore && inst.bankfoodStore.firstUpkeeps;
  if (!Array.isArray(fu)) return inst;
  return Object.assign({}, inst, { firstUpkeeps: fu });
}
// The narrow bank-added predicate: mode 'bank' + delta > 0.
// delta is bankedEdibleDelta (postBank − packBefore); null
// delta (no packBefore) never qualifies.
function isBankAdded(e) {
  return !!e && e.mode === 'bank' &&
    typeof e.bankedEdibleDelta === 'number' && e.bankedEdibleDelta > 0;
}
function isFlipAdded(e) {
  return !!e && e.mode === 'flip' &&
    typeof e.bankedEdibleDelta === 'number' && e.bankedEdibleDelta > 0;
}
function filterBankAdded(events) {
  const evs = events || [];
  const bankMode = evs.filter((e) => e.mode === 'bank');
  const bankAdded = evs.filter(isBankAdded);
  const flipAdded = evs.filter(isFlipAdded);
  return {
    bankModeEvenings: bankMode.length,
    bankModeWithEdible: bankMode.filter((e) => (e.postBankEdible || 0) > 0).length,
    bankAddedTotal: bankAdded.length,
    bankAddedJudged: bankAdded.filter((e) => e.judged),
    bankAddedCensored: bankAdded.filter((e) => !e.judged),
    flipAddedTotal: flipAdded.length,
    flipAddedJudged: flipAdded.filter((e) => e.judged),
    flipAddedCensored: flipAdded.filter((e) => !e.judged),
    allJudged: evs.filter((e) => e.judged).length,
    allCensored: evs.filter((e) => !e.judged).length,
  };
}
// Raw evening-mode counts, INCLUDING lump-only / no-gain evenings
// that retainedEvents drops (it only returns postEdible > 0 rows).
// Needed for the prereg's screen-yield reporting ("how many
// BANK-mode evenings found"): a bank-mode evening that banks only
// lumps is a bank-mode evening with delta 0, not an absent evening.
// Pure over one corpus instance's evening rows. Delta uses the
// row's canonical postDailyPack when present, else the evening
// record's packAfter; null when neither pack is available.
function rawModeCounts(inst) {
  const out = { bank: 0, flip: 0, skip: 0, bankDeltaPos: 0, bankDeltaZero: 0,
    bankDeltaNeg: 0, bankDeltaNull: 0, flipDeltaPos: 0 };
  for (const row of (inst.evenings || [])) {
    const ev = row.bankfoodEvening;
    if (!ev || (ev.mode !== 'bank' && ev.mode !== 'flip' && ev.mode !== 'skip')) continue;
    out[ev.mode]++;
    const post = row.postDailyPack || ev.packAfter || null;
    const before = ev.packBefore || null;
    if (!post || !before || typeof post.edibleKcal !== 'number' || typeof before.edibleKcal !== 'number') {
      if (ev.mode === 'bank') out.bankDeltaNull++;
      continue;
    }
    const delta = post.edibleKcal - before.edibleKcal;
    if (ev.mode === 'bank') {
      if (delta > 0) out.bankDeltaPos++;
      else if (delta === 0) out.bankDeltaZero++;
      else out.bankDeltaNeg++;
    } else if (ev.mode === 'flip' && delta > 0) {
      out.flipDeltaPos++;
    }
  }
  return out;
}
function loadBankfoodDir(dir) {
  const out = {};
  if (!dir) return out;
  for (const f of fs.readdirSync(dir).filter((x) => /^bankfood-b-nighttravel-s\d+\.json$/.test(x)).sort()) {
    const seed = f.match(/s(\d+)\.json$/)[1];
    out[seed] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
function loadStrandnarrDir(dir) {
  const out = {};
  if (!dir) return out;
  for (const f of fs.readdirSync(dir).filter((x) => /^strandnarr-s\d+\.json$/.test(x)).sort()) {
    const seed = f.match(/s(\d+)\.json$/)[1];
    out[seed] = normalizeStrandnarr(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}
function summarizeDir(dir, loader) {
  const insts = loader(dir);
  const report = { dir, seeds: {}, totals: {
    seeds: 0, bankModeEvenings: 0, bankModeWithEdible: 0,
    bankAddedTotal: 0, bankAddedJudged: 0, bankAddedCensored: 0,
    flipAddedTotal: 0, flipAddedJudged: 0, flipAddedCensored: 0,
    allJudged: 0, allCensored: 0,
    rawBank: 0, rawFlip: 0, rawSkip: 0, rawBankDeltaPos: 0,
    rawBankDeltaZero: 0, rawBankDeltaNeg: 0, rawBankDeltaNull: 0, rawFlipDeltaPos: 0 } };
  for (const seed of Object.keys(insts).sort()) {
    const inst = insts[seed];
    const evs = retainedEvents(inst);
    const f = filterBankAdded(evs);
    const raw = rawModeCounts(inst);
    report.seeds[seed] = {
      daysAlive: inst.daysAlive, endReason: inst.endReason,
      bfErrs: (inst.bankfoodStore && inst.bankfoodStore.errs) || 0,
      rawBank: raw.bank, rawFlip: raw.flip, rawSkip: raw.skip,
      rawBankDeltaPos: raw.bankDeltaPos, rawBankDeltaZero: raw.bankDeltaZero,
      rawBankDeltaNeg: raw.bankDeltaNeg, rawBankDeltaNull: raw.bankDeltaNull,
      rawFlipDeltaPos: raw.flipDeltaPos,
      bankModeEvenings: f.bankModeEvenings,
      bankModeWithEdible: f.bankModeWithEdible,
      bankAddedTotal: f.bankAddedTotal,
      bankAddedJudged: f.bankAddedJudged.map((e) => ({ seed: e.seed, loopDay: e.loopDay,
        gameDay: e.gameDay, source: e.source, packBeforeEdible: e.packBeforeEdible,
        postBankEdible: e.postBankEdible, delta: e.bankedEdibleDelta,
        verdict: e.verdict || null, retainedAtTrueMorning: e.retainedAtTrueMorning || null,
        morningDisposition: e.morningDisposition ? e.morningDisposition.disposition : null })),
      bankAddedCensored: f.bankAddedCensored.map((e) => ({ seed: e.seed, loopDay: e.loopDay,
        gameDay: e.gameDay, source: e.source, packBeforeEdible: e.packBeforeEdible,
        postBankEdible: e.postBankEdible, delta: e.bankedEdibleDelta,
        censoredReason: e.censoredReason })),
      flipAddedTotal: f.flipAddedTotal,
      flipAddedJudged: f.flipAddedJudged.length,
      flipAddedCensored: f.flipAddedCensored.length,
      allJudged: f.allJudged, allCensored: f.allCensored };
    const t = report.totals;
    t.seeds++;
    t.bankModeEvenings += f.bankModeEvenings;
    t.bankModeWithEdible += f.bankModeWithEdible;
    t.bankAddedTotal += f.bankAddedTotal;
    t.bankAddedJudged += f.bankAddedJudged.length;
    t.bankAddedCensored += f.bankAddedCensored.length;
    t.flipAddedTotal += f.flipAddedTotal;
    t.flipAddedJudged += f.flipAddedJudged.length;
    t.flipAddedCensored += f.flipAddedCensored.length;
    t.allJudged += f.allJudged;
    t.allCensored += f.allCensored;
    t.rawBank += raw.bank; t.rawFlip += raw.flip; t.rawSkip += raw.skip;
    t.rawBankDeltaPos += raw.bankDeltaPos; t.rawBankDeltaZero += raw.bankDeltaZero;
    t.rawBankDeltaNeg += raw.bankDeltaNeg; t.rawBankDeltaNull += raw.bankDeltaNull;
    t.rawFlipDeltaPos += raw.flipDeltaPos;
  }
  return report;
}
function main() {
  const a = args();
  if (!a.variant) { console.error('usage: --variant <bankfood-dir> [--strandnarr <strandnarr-dir>]'); process.exit(2); }
  const report = { screen: summarizeDir(a.variant, loadBankfoodDir) };
  if (a.strandnarr) report.census = summarizeDir(a.strandnarr, loadStrandnarrDir);
  console.log(JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { isBankAdded, isFlipAdded, filterBankAdded, normalizeStrandnarr, rawModeCounts, summarizeDir, loadBankfoodDir, loadStrandnarrDir };
