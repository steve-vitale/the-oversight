#!/usr/bin/env node
// analyze-spandraw-playpath-b.js — per-key census over playpath tap windows.
// (sim-spandraw-playpath-b; prereg evidence/2026-10-28/
// sim-spandraw-playpath-b-prereg.md.)
//
// Reads the playpath corpus (one file per seed×key), judges ONLY
// tap-window spans (nest evt in (evtBefore, evtAfter] for taps with
// outcome 'attempted'), and classifies each key with the census
// classes via the UNCHANGED span-dedup rule (applySpanDedup) for
// item-matched exclusions. Policy spans outside tap windows are
// never counted. A crossing counts toward PROMOTED-REAL-PLAY only
// when a span-internal draw is endDay-framed (its nest frames name
// endDay, as the design probe's sense trace showed).
//
// Usage: node scripts/analyze-spandraw-playpath-b.js [corpusDir]
//   (default: evidence/2026-10-28/sim-spandraw-playpath-b-corpus)
// Prints the per-key table as JSON to stdout (one JSON object).
'use strict';
const fs = require('fs');
const path = require('path');
const { applySpanDedup } = require('./dedupspan-ledger-b.js');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-spandraw-playpath-b-corpus');

function pairWindowSpans(events) {
  const ev = events.slice().sort((a, b) => (a.evt || 0) - (b.evt || 0));
  const stack = [], spans = [], draws = [];
  let pending = null;
  for (const e of ev) {
    if (e.kind === 'spanEnter') stack.push({ ability: e.ability, action: e.action, depth: e.depth, enterEvt: e.evt, enterDay: e.day, directBefore: e.directBefore, exitEvt: null, exitDay: null, directAfter: null, draws: [] });
    else if (e.kind === 'spanExit') {
      let idx = -1;
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].ability === e.ability && stack[i].action === e.action && stack[i].depth === e.depth) { idx = i; break; }
      if (idx < 0) continue;
      const sp = stack[idx]; sp.exitEvt = e.evt; sp.exitDay = e.day; sp.directAfter = e.directAfter; spans.push(sp); stack.splice(idx, 1);
    } else if (e.kind === 'drawEnter') {
      pending = { enterEvt: e.evt, frames: e.frames || [], span: stack.length ? stack[stack.length - 1] : null };
    } else if (e.kind === 'drawExit' && pending) {
      if (pending.span) pending.span.draws.push(pending);
      draws.push(pending); pending = null;
    }
  }
  return { spans, draws };
}

function analyzeFile(file) {
  const inst = JSON.parse(fs.readFileSync(file, 'utf8'));
  const key = inst.key || (inst.ability + '.' + inst.action);
  const taps = [];
  for (const t of (inst.taps || [])) {
    if (t.outcome !== 'attempted') { taps.push({ tapDay: t.tapDay, outcome: t.outcome, buttonWhy: t.buttonWhy || null, skipReason: t.skipReason || null, dayTicksBefore: t.dayTicksBefore, gameDayBefore: t.gameDayBefore }); continue; }
    const windowEvents = (inst.nestEvents || []).filter((e) => e.evt > t.evtBefore && e.evt <= t.evtAfter);
    const { spans } = pairWindowSpans(windowEvents);
    const keySpans = spans.filter((s) => s.ability === inst.ability && s.action === inst.action);
    const dedup = applySpanDedup({ nestEvents: windowEvents, directRecords: inst.directRecords || [], mealDrawRecords: inst.mealDrawRecords || [] });
    let exclKcal = 0;
    for (const sp of keySpans) {
      for (const ex of (dedup.exclusions || [])) {
        if (ex.spanEnterEvt === sp.enterEvt && ex.spanExitEvt === sp.exitEvt) exclKcal += ex.kcal;
      }
    }
    const crossed = keySpans.filter((s) => s.exitDay !== s.enterDay);
    const internalDraws = keySpans.reduce((n, s) => n + s.draws.length, 0);
    const endDayDraws = keySpans.reduce((n, s) => n + s.draws.filter((d) => (d.frames || []).join(' ').match(/endDay/i)).length, 0);
    const createsRecord = keySpans.filter((s) => s.directAfter === s.directBefore + 1).length;
    taps.push({ tapDay: t.tapDay, outcome: 'attempted', tapResult: t.tapResult,
      gameDayBefore: t.gameDayBefore, dayTicksBefore: t.dayTicksBefore, dayPartBefore: t.dayPartBefore,
      gameDayAfter: t.gameDayAfter, dayTicksAfter: t.dayTicksAfter,
      kcalBefore: t.kcalBefore, kcalAfter: t.kcalAfter, atHavenBefore: t.atHavenBefore,
      convoPartner: t.convoPartner || null, convoActive: !!t.convoActive,
      spans: keySpans.length, spanLogged: keySpans.length > 0,
      crossed: crossed.length, internalDraws, endDayDraws, createsRecord, exclKcal,
      sayWindow: t.sayWindow || [] });
  }
  return { seed: inst.seed, key, grantOk: !!inst.grantOk, endReason: inst.endReason, taps };
}

function main() {
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort() : [];
  const perKey = {};
  const perFile = [];
  let totalTaps = 0;
  for (const f of files) {
    const r = analyzeFile(path.join(DIR, f));
    perFile.push(r);
    if (!perKey[r.key]) perKey[r.key] = { key: r.key, instances: 0, attempted: 0, succeeded: 0, buttonRefused: 0, costRefused: 0, skipped: 0, spans: 0, crossingSpans: 0, internalDraws: 0, endDayDraws: 0, exclKcal: 0, seedsWithTaps: new Set(), seedsWithExcl: new Set(), buttonWhys: {}, skipReasons: {}, tapPositions: [] };
    const row = perKey[r.key]; row.instances++;
    for (const t of r.taps) {
      totalTaps++;
      if (t.outcome === 'attempted') {
        row.attempted++; row.spans += t.spans; row.crossingSpans += t.crossed; row.internalDraws += t.internalDraws; row.endDayDraws += t.endDayDraws; row.exclKcal += t.exclKcal;
        row.seedsWithTaps.add(r.seed);
        if (t.exclKcal > 0) row.seedsWithExcl.add(r.seed);
        if (t.tapResult === true) row.succeeded++;
        if (t.tapResult === false) row.costRefused++;
        row.tapPositions.push(t.dayTicksBefore);
      } else if (t.outcome === 'button-refused') {
        row.buttonRefused++;
        const w = t.buttonWhy || '?'; row.buttonWhys[w] = (row.buttonWhys[w] || 0) + 1;
      } else if (t.outcome === 'skipped') {
        row.skipped++;
        const w = t.skipReason || '?'; row.skipReasons[w] = (row.skipReasons[w] || 0) + 1;
      }
    }
  }
  const table = Object.values(perKey).sort((a, b) => a.key.localeCompare(b.key)).map((r) => {
    let classification;
    if (r.exclKcal > 0 && r.crossingSpans > 0 && r.internalDraws > 0 && r.endDayDraws > 0) classification = 'PROMOTED-REAL-PLAY';
    else if (r.attempted > 0 && r.crossingSpans === 0 && r.exclKcal === 0) classification = 'TAPPED-NO-CROSSING';
    else if (r.crossingSpans > 0 && r.internalDraws === 0 && r.exclKcal === 0) classification = 'SPAN-CROSSES-DAY-NO-DRAW';
    else if (r.attempted === 0) classification = 'NOT-TAPPED';
    else classification = 'MIXED-NEEDS-READ';
    return { key: r.key, instances: r.instances, attempted: r.attempted, succeeded: r.succeeded, buttonRefused: r.buttonRefused, costRefused: r.costRefused, skipped: r.skipped, spans: r.spans, crossingSpans: r.crossingSpans, internalDraws: r.internalDraws, endDayDraws: r.endDayDraws, exclKcal: r.exclKcal, seedsWithTaps: [...r.seedsWithTaps].sort((a, b) => a - b), seedsWithExcl: [...r.seedsWithExcl].sort((a, b) => a - b), classification, buttonWhys: r.buttonWhys, skipReasons: r.skipReasons, tapPositions: r.tapPositions };
  });
  console.log(JSON.stringify({ corpusDir: DIR, files: files.length, totalTaps, perKey: table, perFile }, null, 2));
}
if (require.main === module) main();
module.exports = { pairWindowSpans, analyzeFile };
