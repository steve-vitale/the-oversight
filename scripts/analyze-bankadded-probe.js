#!/usr/bin/env node
// analyze-bankadded-probe.js — probe-given-food census analyzer
// (sim-bankadded-substrate-a; prereg: evidence/2026-11-05/
// sim-bankadded-substrate-a-prereg.md, committed BEFORE any judged sim).
// Reads bankadded-probe-trace-b.js corpora (bankfood-b-nighttravel-
// s<seed>.json, one file per seed) and judges the narrow bank-band
// added case: probe-staged events (mode 'bank-probe',
// probeAddedKcal > 0) PLUS genuine bank-mode delta > 0 events in the
// same corpora (probe record genuine:true, no injection). A FOLLOWING
// MORNING IN-STACK (next loop-day row + firstUpkeep for scholarDay =
// gameDay + 1) makes an event JUDGED; otherwise CENSORED. Retention
// verdict at the first-upkeep snapshot via the spec-conformant
// classifier in scripts/analyze-bankretain-rerun.js (spoil check
// precedes vanish check). The injected-stack identity check isolates
// the staged haul from any carried stack of the same key by
// subtracting packBefore units of that key. Flip-mode delta > 0
// events are reported as screen CONTEXT only, never counted toward
// the bar. Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { retainedEvents, classifyRetention, morningDisposition, sourceOf } = require('./analyze-bankretain-rerun');
const { filterBankAdded } = require('./analyze-bankadded');
const { probeStackKey, PROBE_UNITS } = require('./policies/bankadded-probe-diag');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
function loadDir(dir) {
  const out = {};
  if (!dir) return out;
  for (const f of fs.readdirSync(dir).filter((x) => /^bankfood-b-nighttravel-s\d+\.json$/.test(x)).sort()) {
    const seed = f.match(/s(\d+)\.json$/)[1];
    out[seed] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
function stackKey(s) { return [s.name, s.kcalEach, s.edible, s.foodState].join('|'); }
function unitsOfKey(pack, key) {
  if (!pack || !Array.isArray(pack.stacks)) return 0;
  let n = 0;
  for (const s of pack.stacks) if (s && stackKey(s) === key) n += (s.units || 0);
  return n;
}
function unitsOfKeySpoil(pack, key, spoilDay) {
  if (!pack || !Array.isArray(pack.stacks)) return 0;
  let n = 0;
  for (const s of pack.stacks) if (s && stackKey(s) === key && s.spoilDay === spoilDay) n += (s.units || 0);
  return n;
}
// Injected-stack identity check (pure). The injected stack is identified
// by key AND spoilDay (gameDay + 2) — not by key alone: a carried stack
// of the same key with an earlier spoilDay can be dawn-swept overnight,
// and subtracting packBefore units of the bare key would then undercount
// the injected units (observed on 17025/33: a carried spoilDay-34 grape
// stack was swept while all 18 injected spoilDay-35 grapes survived,
// and the bare-key check reported 8/18). Units of the exact
// (key, spoilDay) in packBefore are subtracted as the carried baseline.
function injectedStackCheck(postBank, packBefore, firstUp, gameDay) {
  const key = probeStackKey();
  const spoilDay = gameDay + 2;
  const carriedSameSpoil = unitsOfKeySpoil(packBefore, key, spoilDay);
  const postBankInjectedUnits = unitsOfKeySpoil(postBank, key, spoilDay) - carriedSameSpoil;
  const firstUpInjectedUnits = unitsOfKeySpoil(firstUp.pack, key, spoilDay) - carriedSameSpoil;
  return { key, expectedUnits: PROBE_UNITS, expectedSpoilDay: spoilDay,
    carriedSameSpoil,
    postBankInjectedUnits, firstUpInjectedUnits,
    spoilDay, spoilDayMatch: postBankInjectedUnits === PROBE_UNITS,
    match: postBankInjectedUnits === PROBE_UNITS && firstUpInjectedUnits === PROBE_UNITS };
}
// Build judged/censored bank-band added events for one corpus instance.
// Staged events come from the probe store; genuine events reuse the
// retainedEvents record for the same loop-day (same classifier,
// same morning disposition). Pure over the instance object.
function buildProbeEvents(inst) {
  const rows = inst.evenings || [];
  const store = inst.bankfoodStore || {};
  const probeStore = inst.bankaddedProbeStore || {};
  const reEvents = retainedEvents(inst);
  const events = [];
  for (const rec of (probeStore.evenings || [])) {
    const row = rows.find((x) => x.loopDay === rec.loopDay) || null;
    if (!row) continue;
    if (rec.genuine) {
      // Genuine bank-mode delta > 0: reuse the retainedEvents record.
      const re = reEvents.find((e) => e.loopDay === rec.loopDay && e.mode === 'bank' && e.bankedEdibleDelta > 0) || null;
      if (!re) { events.push({ seed: inst.seed, loopDay: rec.loopDay, gameDay: rec.gameDay, kind: 'genuine', mode: 'bank', judged: false, censoredReason: 'genuine-event-not-in-retained-events', probeRecord: true }); continue; }
      events.push(Object.assign({}, re, { kind: 'genuine', mode: 'bank', probeRecord: true,
        probeAddedKcal: 0, waits: rec.waits || 0, via: null, injectedStack: null }));
      continue;
    }
    if (!rec.staged && rec.kind !== 'press-added') continue; // skips are not events
    const postBank = row.postDailyPack || rec.packAfter || null;
    const postEdible = postBank ? (postBank.edibleKcal || 0) : 0;
    const beforeEdible = rec.packBefore ? (rec.packBefore.edibleKcal || 0) : null;
    const delta = postBank && beforeEdible !== null ? postEdible - beforeEdible : null;
    const nextLoopDay = row.loopDay + 1;
    const nextRow = rows.find((x) => x.loopDay === nextLoopDay) || null;
    const firstUp = (inst.firstUpkeeps || []).find((u) => u.scholarDay === (row.gameDay + 1)) || null;
    const morning = (store.mornings || []).find((m) => m.loopDay === nextLoopDay) ||
      (nextRow && nextRow.bankfoodMorning) || null;
    const judged = !!(nextRow && firstUp);
    const ev = { seed: inst.seed, loopDay: row.loopDay, gameDay: row.gameDay,
      kind: rec.kind || (rec.staged ? 'staged' : 'unknown'), mode: 'bank-probe', probeRecord: true,
      probeAddedKcal: rec.probeAddedKcal || 0, waits: rec.waits || 0,
      rests: rec.rests || 0, presses: (rec.pressRecords || []).length,
      via: rec.via || null,
      underlyingMode: rec.underlyingMode || null,
      packBeforeEdible: beforeEdible, postBankEdible: postEdible,
      bankedEdibleDelta: delta,
      deltaMatchesProbe: rec.staged ? delta === (rec.probeAddedKcal || 0) : null,
      deltaMatchesPresses: rec.kind === 'press-added' ? delta === (rec.pressDelta || 0) : null,
      pressDelta: (rec.pressDelta === undefined ? null : rec.pressDelta),
      pressEknown: (rec.pressEknown === undefined ? null : rec.pressEknown),
      source: sourceOf(beforeEdible, delta),
      postBank: postBank ? { edibleKcal: postBank.edibleKcal, grossKcal: postBank.grossKcal,
        lumpUnits: postBank.lumpUnits, stacks: postBank.stacks } : null,
      judged, censoredReason: judged ? null :
        (!nextRow ? 'no-next-loop-day' : 'no-first-upkeep-for-next-day'),
      scholarKcalEvening: rec.kcalAfter };
    if (judged) {
      ev.firstUpkeep = { scholarDay: firstUp.scholarDay, kcal: firstUp.kcal,
        dayTicks: firstUp.dayTicks,
        pack: { edibleKcal: firstUp.pack.edibleKcal, grossKcal: firstUp.pack.grossKcal,
          lumpUnits: firstUp.pack.lumpUnits, stacks: firstUp.pack.stacks } };
      ev.classification = classifyRetention(postBank, firstUp);
      ev.verdict = ev.classification.verdict;
      ev.retainedAtTrueMorning = ev.verdict === 'RETAINED' || ev.verdict === 'RETAINED-SPOIL-SWEPT';
      // Provenance: the injected-stack identity check applies to
      // 'staged' only; 'press-added' carries press provenance.
      if (ev.kind === 'staged') {
        ev.injectedStack = injectedStackCheck(postBank, rec.packBefore, firstUp, row.gameDay);
        ev.pressProvenance = null;
      } else if (ev.kind === 'press-added') {
        ev.injectedStack = null;
        ev.pressProvenance = { presses: (rec.pressRecords || []).length,
          rests: rec.rests || 0, pressEknown: rec.pressEknown || 0,
          pressDelta: rec.pressDelta, deltaMatchesPresses: ev.deltaMatchesPresses };
      } else { ev.injectedStack = null; ev.pressProvenance = null; }
      ev.morningPhase = morning ? { ate: morning.ate, eatErr: morning.eatErr || null,
        skip: morning.skip || null, kcalBefore: morning.kcalBefore,
        kcalAfterEat: morning.kcalAfterEat,
        packBefore: morning.packBefore ? { edibleKcal: morning.packBefore.edibleKcal,
          grossKcal: morning.packBefore.grossKcal, lumpUnits: morning.packBefore.lumpUnits } : null,
        packAfter: morning.packAfter ? { edibleKcal: morning.packAfter.edibleKcal,
          grossKcal: morning.packAfter.grossKcal, lumpUnits: morning.packAfter.lumpUnits } : null,
        wakeTile: morning.wakeTile || null } : null;
      ev.morningDisposition = morningDisposition(firstUp, morning);
    }
    events.push(ev);
  }
  return events;
}
function summarizeDir(dir) {
  const insts = loadDir(dir);
  const report = { dir, seeds: {}, judgedEvents: [], censoredEvents: [],
    totals: { seeds: 0, strandedEvenings: 0, stagedTotal: 0, stagedJudged: 0,
      stagedCensored: 0, pressAddedTotal: 0, pressAddedJudged: 0,
      pressAddedCensored: 0, genuineTotal: 0, genuineJudged: 0, genuineCensored: 0,
      judged: 0, censored: 0, retainedAtTrueMorning: 0, retainedClean: 0,
      retainedSpoilSwept: 0, vanished: 0, partialUnexplained: 0,
      injectedStackMatch: 0, injectedStackMismatch: 0,
      flipAddedTotal: 0, flipAddedJudged: 0, flipAddedCensored: 0,
      probeErrs: 0, bfErrs: 0 } };
  for (const seed of Object.keys(insts).sort()) {
    const inst = insts[seed];
    const evs = buildProbeEvents(inst);
    const judged = evs.filter((e) => e.judged), cens = evs.filter((e) => !e.judged);
    const probeStore = inst.bankaddedProbeStore || {};
    // Stranded evenings = bankfood evening records (the bankfood
    // evening phase pushes a record ONLY when its stranded gate
    // fires; mode bank/flip/skip all count as stranded evenings).
    const strandedCount = (inst.evenings || []).filter((r) => {
      const ev = r.bankfoodEvening;
      return ev && (ev.mode === 'bank' || ev.mode === 'flip' || ev.mode === 'skip');
    }).length;
    const flip = filterBankAdded(retainedEvents(inst));
    const s = { daysAlive: inst.daysAlive, endReason: inst.endReason,
      bfErrs: (inst.bankfoodStore && inst.bankfoodStore.errs) || 0,
      probeErrs: (probeStore.errs || 0),
      strandedEvenings: strandedCount, probeRecords: (probeStore.evenings || []).length,
      stagedTotal: evs.filter((e) => e.kind === 'staged').length,
      stagedJudged: evs.filter((e) => e.kind === 'staged' && e.judged).length,
      stagedCensored: evs.filter((e) => e.kind === 'staged' && !e.judged).length,
      pressAddedTotal: evs.filter((e) => e.kind === 'press-added').length,
      pressAddedJudged: evs.filter((e) => e.kind === 'press-added' && e.judged).length,
      pressAddedCensored: evs.filter((e) => e.kind === 'press-added' && !e.judged).length,
      genuineTotal: evs.filter((e) => e.kind === 'genuine').length,
      genuineJudged: evs.filter((e) => e.kind === 'genuine' && e.judged).length,
      genuineCensored: evs.filter((e) => e.kind === 'genuine' && !e.judged).length,
      judged: judged.length, censored: cens.length,
      flipAddedTotal: flip.flipAddedTotal, flipAddedJudged: flip.flipAddedJudged.length,
      flipAddedCensored: flip.flipAddedCensored.length };
    report.seeds[seed] = s;
    report.judgedEvents.push(...judged);
    report.censoredEvents.push(...cens);
    const t = report.totals;
    t.seeds++;
    t.strandedEvenings += strandedCount;
    t.stagedTotal += s.stagedTotal; t.stagedJudged += s.stagedJudged; t.stagedCensored += s.stagedCensored;
    t.pressAddedTotal += s.pressAddedTotal; t.pressAddedJudged += s.pressAddedJudged; t.pressAddedCensored += s.pressAddedCensored;
    t.genuineTotal += s.genuineTotal; t.genuineJudged += s.genuineJudged; t.genuineCensored += s.genuineCensored;
    t.judged += judged.length; t.censored += cens.length;
    t.probeErrs += s.probeErrs; t.bfErrs += s.bfErrs;
    t.flipAddedTotal += s.flipAddedTotal; t.flipAddedJudged += s.flipAddedJudged; t.flipAddedCensored += s.flipAddedCensored;
  }
  const j = report.judgedEvents;
  const retained = j.filter((e) => e.retainedAtTrueMorning);
  const t = report.totals;
  t.retainedAtTrueMorning = retained.length;
  t.retainedClean = j.filter((e) => e.verdict === 'RETAINED').length;
  t.retainedSpoilSwept = j.filter((e) => e.verdict === 'RETAINED-SPOIL-SWEPT').length;
  t.vanished = j.filter((e) => e.verdict === 'VANISHED').length;
  t.partialUnexplained = j.filter((e) => e.verdict === 'PARTIAL-UNEXPLAINED').length;
  t.injectedStackMatch = j.filter((e) => e.kind === 'staged' && e.injectedStack && e.injectedStack.match).length;
  t.injectedStackMismatch = j.filter((e) => e.kind === 'staged' && e.injectedStack && !e.injectedStack.match).length;
  // Unanimity + GO bar (prereg): >= 3 distinct judged events, unanimous.
  const distinct = new Set(j.map((e) => e.seed + '/' + e.loopDay)).size;
  t.distinctJudged = distinct;
  t.unanimousRetained = distinct >= 1 && retained.length === j.length;
  t.unanimousNotRetained = distinct >= 1 && retained.length === 0 &&
    j.every((e) => e.verdict === 'VANISHED' || e.verdict === 'PARTIAL-UNEXPLAINED');
  t.goBarMet = distinct >= 3 && (t.unanimousRetained || t.unanimousNotRetained);
  t.verdict = t.goBarMet
    ? (t.unanimousRetained ? 'GO-RETAINED' : 'GO-NOT-RETAINED')
    : (distinct < 3 ? 'INSUFFICIENT-DATA' : 'NO-GO-NON-UNANIMOUS');
  return report;
}
function main() {
  const a = args();
  if (!a.variant) { console.error('usage: --variant <probe-corpus-dir>'); process.exit(2); }
  console.log(JSON.stringify(summarizeDir(a.variant), null, 1));
}
if (require.main === module) main();
module.exports = { buildProbeEvents, injectedStackCheck, summarizeDir, loadDir, unitsOfKey };
