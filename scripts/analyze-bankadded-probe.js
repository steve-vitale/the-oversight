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
const { probeStackKey, PROBE_UNITS, PROBE_ADDED_KCAL } = require('./policies/bankadded-probe-diag');

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
// ---- Pre-snapshot window (sim-banksnap-a) ----
// The first-upkeep snapshot reads "after the first dawn upkeep eat"
// in the sleep-refused path, so a first-upkeep VANISHED can be food
// eaten as a morning meal BEFORE the snapshot. The every-upkeep snaps
// (st.upkeepSnaps, one per upkeep call, before that call's inner.upkeep)
// bracket that eat. Pure over the instance + event record.
//   snapPre  = FIRST upkeep snap with scholarDay == gameDay AND
//              afterDailyCalls == loopDay (first upkeep call of the
//              following loop-day, before that call's inner.upkeep).
//   snapPost = FIRST upkeep snap with scholarDay == gameDay+1 AND
//              afterDailyCalls == loopDay (first upkeep of the new day
//              inside the same loop-day's p-loop, i.e. the day rolled
//              during the p-loop wait, not during daily).
//   snapDrop = FIRST snap after snapPre (same loop-day p-loop) whose
//              injected-stack units are < 18; snapEat = the snap
//              immediately before snapDrop (the call whose inner.upkeep
//              ate the food).
// A staged event is RETAINED-THEN-EATEN iff E1–E5 hold (see prereg):
// E1 food present before the eating call, E2 gone at the new-day
// snapshot, E3 the drop localizes to one consecutive inter-snap step
// before the roll, E4 the competentEat trigger fired at the eating
// call, E5 the dawn spoil sweep cannot explain it (spoilDay > new
// day). E6 (kcal accounting) is quoted, not exact-matched: the endDay
// burn (2200) and pantry guard-loop takes share the window, so the
// residual R = kcal(snapPost) - (kcal(snapEat) + 720 - 2200) is
// attributed per event or named open — it corroborates, it does not
// arbitrate (prereg: retained 17051/11 went 2240 -> 0 while retained
// 17025/32 went 2230 -> 2090 under the same trigger state).
// If the day rolled during/after daily (snapPost missing from the
// loop-day p-loop) the window includes daily actions, so the drop is
// NOT attributable to the upkeep eat: reason 'roll-after-daily'. If
// sleep succeeded, no snapPre exists (the day had already rolled
// before the loop-day's first upkeep) and the old snapshot was
// already pre-eat: reason 'sleep-path', old verdict stands.
const EAT_TRIGGER_KCAL = 2040; // 0.85 x 2400 cap, competentEat trigger
const ENDDAY_BURN_KCAL = 2200; // ACTIVE_DAY, src/js/engine/calories.js
function preSnapshotWindow(inst, ev) {
  const snaps = inst.upkeepSnaps || null;
  if (!snaps || !snaps.length) return { available: false, reason: 'no-upkeep-snaps' };
  const gameDay = ev.gameDay, loopDay = ev.loopDay;
  const preCands = snaps.filter((s) => s.scholarDay === gameDay && s.afterDailyCalls === loopDay);
  const postCands = snaps.filter((s) => s.scholarDay === gameDay + 1 && s.afterDailyCalls === loopDay);
  // No old-day snap in the following loop-day's p-loop AND a new-day
  // snap there: the day had already rolled before that loop-day's
  // first upkeep (sleep succeeded) — the old snapshot was already
  // pre-eat. No new-day snap there either: the day rolled during/
  // after daily, so the window includes daily actions.
  if (!preCands.length && postCands.length) return { available: true, path: 'sleep-path', snapPre: null, snapPost: postCands[0] || null };
  if (!preCands.length) return { available: true, path: 'roll-after-daily', snapPre: null, snapPost: null };
  const snapPre = preCands[0];
  if (!postCands.length) return { available: true, path: 'roll-after-daily', snapPre, snapPost: null };
  const snapPost = postCands[0];
  const key = probeStackKey();
  const spoilDay = gameDay + 2;
  const injectedPre = unitsOfKeySpoil(snapPre.pack, key, spoilDay);
  const injectedPost = unitsOfKeySpoil(snapPost.pack, key, spoilDay);
  // First snap after snapPre (same loop-day p-loop) with injected < 18.
  const later = snaps.filter((s) => s.upkeepIndex > snapPre.upkeepIndex && s.afterDailyCalls === loopDay)
    .sort((a, b) => a.upkeepIndex - b.upkeepIndex);
  let snapDrop = null, snapEat = null;
  for (const s of later) {
    if (unitsOfKeySpoil(s.pack, key, spoilDay) < PROBE_UNITS) { snapDrop = s; break; }
  }
  if (snapDrop) {
    snapEat = snaps.find((s) => s.upkeepIndex === snapDrop.upkeepIndex - 1) || snapPre;
  }
  const injectedDrop = snapDrop ? unitsOfKeySpoil(snapDrop.pack, key, spoilDay) : null;
  const injectedEat = snapEat ? unitsOfKeySpoil(snapEat.pack, key, spoilDay) : null;
  const kcalPre = snapPre.kcal, kcalPost = snapPost.kcal;
  const kcalEat = snapEat ? snapEat.kcal : null;
  // The drop localizes to the single inter-snap step [snapEat, snapDrop]:
  // snapEat is the call whose inner.upkeep ate the food (snapDrop is the
  // very next upkeep snap). dropBeforeRoll: the food was already gone
  // before the day rolled; dropAtSnapshot: it went in the step across
  // the roll. Either way the only pack consumer in that step is the one
  // inner.upkeep call (plus, across the roll, endDay's spoil sweep —
  // excluded by E5). snapEat must sit in the same loop-day p-loop.
  const dropBeforeRoll = snapDrop ? snapDrop.scholarDay === gameDay : false;
  const dropAtSnapshot = snapDrop ? snapDrop === snapPost : false;
  const eatInLoopDay = snapEat ? snapEat.afterDailyCalls === loopDay : false;
  const triggerFired = kcalEat !== null && kcalEat < EAT_TRIGGER_KCAL;
  const spoilImmune = spoilDay > (gameDay + 1);
  const residualKcal = (kcalPost !== null && kcalEat !== null)
    ? kcalPost - (kcalEat + PROBE_ADDED_KCAL - ENDDAY_BURN_KCAL) : null;
  return { available: true, path: 'refused-path', snapPre, snapPost, snapEat, snapDrop,
    injectedPre, injectedPost, injectedEat, injectedDrop,
    kcalPre, kcalPost, kcalEat, triggerFired, spoilImmune,
    ediblePre: snapPre.pack ? snapPre.pack.edibleKcal : null,
    ediblePost: snapPost.pack ? snapPost.pack.edibleKcal : null,
    dropBeforeRoll, dropAtSnapshot, eatInLoopDay, residualKcal,
    e1: injectedPre === PROBE_UNITS && injectedEat === PROBE_UNITS,
    e2: injectedPost === 0,
    e3: !!snapDrop && injectedDrop === 0 && eatInLoopDay && (dropBeforeRoll || dropAtSnapshot),
    e4: triggerFired,
    e5: spoilImmune };
}
// Re-judge one judged event under the fixed snapshot. Returns
// { rejudgedVerdict, retainedFinal, preSnapshot }. Old verdicts stand
// where the new instrument has nothing to add (no snaps: old corpora;
// genuine/press-added: no injected identity); a staged VANISHED is
// re-classified RETAINED-THEN-EATEN only on E1–E5; a staged retained
// event must still show its 18 injected units at snapPre (food present
// before the pre-snapshot window) or it reads DISAGREED.
function rejudgeEvent(inst, ev) {
  const pre = preSnapshotWindow(inst, ev);
  const old = ev.verdict;
  if (!pre.available) return { rejudgedVerdict: old, retainedFinal: ev.retainedAtTrueMorning, preSnapshot: pre };
  if (pre.path === 'sleep-path' || pre.path === 'roll-after-daily') {
    return { rejudgedVerdict: old, retainedFinal: ev.retainedAtTrueMorning, preSnapshot: pre };
  }
  // Defensive: refused-path must carry both snaps; a missing one is
  // UNRESOLVED (prereg), never a silent fallback to the old verdict.
  if (pre.path === 'refused-path' && (!pre.snapPre || !pre.snapPost)) {
    return { rejudgedVerdict: 'UNRESOLVED-NO-PRE-SNAP', retainedFinal: false, preSnapshot: pre };
  }
  if (ev.kind === 'genuine' || ev.kind === 'press-added') {
    return { rejudgedVerdict: old, retainedFinal: ev.retainedAtTrueMorning, preSnapshot: pre };
  }
  if (old === 'RETAINED' || old === 'RETAINED-SPOIL-SWEPT') {
    if (pre.injectedPre === PROBE_UNITS) {
      return { rejudgedVerdict: old, retainedFinal: true, preSnapshot: pre };
    }
    return { rejudgedVerdict: 'DISAGREED', retainedFinal: false, preSnapshot: pre };
  }
  if (old === 'VANISHED' || old === 'PARTIAL-UNEXPLAINED') {
    if (pre.e1 && pre.e2 && pre.e3 && pre.e4 && pre.e5) {
      return { rejudgedVerdict: 'RETAINED-THEN-EATEN', retainedFinal: true, preSnapshot: pre };
    }
    return { rejudgedVerdict: old, retainedFinal: false, preSnapshot: pre };
  }
  return { rejudgedVerdict: old, retainedFinal: ev.retainedAtTrueMorning, preSnapshot: pre };
}
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
      const genEv = Object.assign({}, re, { kind: 'genuine', mode: 'bank', probeRecord: true,
        probeAddedKcal: 0, waits: rec.waits || 0, via: null, injectedStack: null });
      if (genEv.judged) {
        const rj = rejudgeEvent(inst, genEv);
        genEv.preSnapshot = rj.preSnapshot;
        genEv.rejudgedVerdict = rj.rejudgedVerdict;
        genEv.retainedFinal = rj.retainedFinal;
      }
      events.push(genEv);
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
      // Re-judgment under the fixed every-upkeep snapshot (sim-banksnap-a):
      // old first-upkeep verdict kept as `verdict`; `rejudgedVerdict` /
      // `retainedFinal` are the re-judgment. On corpora without upkeep
      // snaps (substrate corpus) this falls back to the old verdict.
      const rj = rejudgeEvent(inst, ev);
      ev.preSnapshot = rj.preSnapshot;
      ev.rejudgedVerdict = rj.rejudgedVerdict;
      ev.retainedFinal = rj.retainedFinal;
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
  // Re-judgment totals (sim-banksnap-a): the old `verdict` above is the
  // first-upkeep verdict; these count the fixed-snapshot re-judgment.
  // On corpora without upkeep snaps, rejudgedVerdict falls back to the
  // old verdict, so these totals equal the old ones there.
  t.retainedThenEaten = j.filter((e) => e.rejudgedVerdict === 'RETAINED-THEN-EATEN').length;
  t.disagreed = j.filter((e) => e.rejudgedVerdict === 'DISAGREED').length;
  t.unresolvedNoPreSnap = j.filter((e) => e.rejudgedVerdict === 'UNRESOLVED-NO-PRE-SNAP').length;
  t.retainedFinal = j.filter((e) => e.retainedFinal).length;
  t.unexplainedVanished = j.filter((e) => !e.retainedFinal).length;
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
  // Re-judgment verdict (sim-banksnap-a prereg GO bar): unanimous
  // retained-or-retained-then-eaten across the re-judged events.
  // The prereg's "re-judge all 14" count check lives in the evidence
  // file (distinctJudged must equal 14 there); this verdict only
  // judges unanimity over whatever was judged.
  t.unanimousFinal = distinct >= 1 && j.every((e) => e.retainedFinal);
  t.reVerdict = distinct < 1 ? 'INSUFFICIENT-DATA'
    : (t.unanimousFinal ? 'GO-RETAINED' : 'NO-GO-UNEXPLAINED');
  return report;
}
function main() {
  const a = args();
  if (!a.variant) { console.error('usage: --variant <probe-corpus-dir>'); process.exit(2); }
  console.log(JSON.stringify(summarizeDir(a.variant), null, 1));
}
if (require.main === module) main();
module.exports = { buildProbeEvents, injectedStackCheck, summarizeDir, loadDir, unitsOfKey,
  preSnapshotWindow, rejudgeEvent, EAT_TRIGGER_KCAL, ENDDAY_BURN_KCAL };
