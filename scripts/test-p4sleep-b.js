#!/usr/bin/env node
// test-p4sleep-b.js — proof for sim-p4sleep-b instruments.
// Pure tests (default): window classification rules from the prereg, on
// synthetic records — no game load, no corpora needed. Must pass BEFORE
// any judged leg runs.
// Corpus mode: node scripts/test-p4sleep-b.js --corpus <dir>
// checks every per-seed file in <dir>: decisions == evenings in count,
// errs 0, loop-days contiguous from 1, every decision carries a morning
// snap, every evening carries an eveningOutcome, windows close exactly
// the loop-days after the first, and every re-derived unexplained morning
// has a window record (moves array present, even when empty).
// Usage: node scripts/test-p4sleep-b.js [--corpus <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const { atHaven, classifySeed } = require('./analyze-absencehunt-b');
const { nameMechanism, classifyMorning, classifySeedP4 } = require('./analyze-p4sleep-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function havenPos(over) {
  return Object.assign({ inside: false, tile: 'forest_floor', mapPx: 1, mapPy: 2, havenPx: 4, havenPy: 4 }, over || {});
}
function awayPos(over) {
  return Object.assign({ inside: false, tile: 'ruin', mapPx: 4, mapPy: 3, havenPx: null, havenPy: null }, over || {});
}

// Synthetic inst: 3 loop-days. Day 1: haven morning, haven evening.
// Day 2: away morning (unexplained), away evening. Day 3: away morning.
function mkInst(windowEventsDay2, sayLines) {
  const decisions = [
    { loopDay: 1, morning: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), ctxDelta: {} },
    { loopDay: 2, morning: awayPos(), ctxDelta: {} },
    { loopDay: 3, morning: awayPos(), ctxDelta: {} },
  ];
  const evenings = [
    { loopDay: 1, ...havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), dayLines: [], ctxDelta: {}, eveningOutcome: 'policy-no-record' },
    { loopDay: 2, ...awayPos(), dayLines: [], ctxDelta: {}, eveningOutcome: 'policy-no-record' },
    { loopDay: 3, ...awayPos(), dayLines: [], ctxDelta: {}, eveningOutcome: 'policy-no-record' },
  ];
  const windows = [
    { openingLoopDay: 1, openingEvening: evenings[0], closingLoopDay: 2, closingMorning: decisions[1].morning, events: windowEventsDay2 },
    { openingLoopDay: 2, openingEvening: evenings[1], closingLoopDay: 3, closingMorning: decisions[2].morning, events: [] },
  ];
  return { seed: 99999, policy: 'nomadseek', days: 30, daysAlive: 30, endReason: 'survived', errCount: 0, decisions, evenings, windows, sayLines: sayLines || [] };
}

function pure() {
  // atHaven shared with absencehunt
  check('atHaven haven tile', atHaven(havenPos({ tile: 'haven' })) === true);
  check('atHaven away', atHaven(awayPos()) === false);
  // Re-derivation: day 2 morning away after day 1 evening haven = unexplained
  {
    const inst = mkInst([], []);
    const base = classifySeed(inst);
    check('re-derived unexplained morning day 2', JSON.stringify(base.unexplainedAwayMornings) === '[2]', base.unexplainedAwayMornings);
    check('day 3 morning away is continuation, not unexplained', base.unexplainedAwayMornings.length === 1);
  }
  // EXPLAINED-MECHANISM via deedHunt counter in an upkeep hook
  {
    const ev = { hook: 'upkeep-1-post', segment: 'upkeep-1',
      from: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), to: awayPos(),
      ctxDelta: { capHuntSorties: 1, capHuntAmbushed: 0 }, saySeqBefore: 0, saySeqAfter: 0 };
    const inst = mkInst([ev], []);
    const m = classifyMorning(inst, 2);
    check('deedHunt counter -> EXPLAINED-MECHANISM', m.class === 'EXPLAINED-MECHANISM' && m.mechanism === 'deedHunt-sortie', m);
    check('deedHunt counter -> segment upkeep-1', m.segment === 'upkeep-1', m);
    check('deedHunt counter, no say -> unnarrated', m.narration === 'unnarrated', m);
  }
  // EXPLAINED-MECHANISM via travel say line in a wait-block
  {
    const ev = { hook: 'doAction-wait-post', segment: 'wait-block',
      from: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), to: awayPos(),
      ctxDelta: {}, saySeqBefore: 0, saySeqAfter: 1 };
    const inst = mkInst([ev], [{ seq: 0, day: 2, line: 'Travel 2 tiles to ruin' }]);
    const m = classifyMorning(inst, 2);
    check('travel say line -> EXPLAINED-MECHANISM upkeep-travel', m.class === 'EXPLAINED-MECHANISM' && m.mechanism === 'upkeep-travel', m);
    check('travel say line -> narrated', m.narration === 'narrated', m);
  }
  // EXPLAINED-SEGMENT-ONLY: named segment, no counter, no say line
  {
    const ev = { hook: 'upkeep-2-post', segment: 'upkeep-2',
      from: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), to: awayPos(),
      ctxDelta: {}, saySeqBefore: 0, saySeqAfter: 0 };
    const inst = mkInst([ev], []);
    const m = classifyMorning(inst, 2);
    check('bare segment -> EXPLAINED-SEGMENT-ONLY', m.class === 'EXPLAINED-SEGMENT-ONLY' && m.mechanism === null, m);
  }
  // Fight-drive with trace only -> EXPLAINED-MECHANISM traceOnly
  {
    const ev = { hook: 'fight-post', segment: 'fight-drive',
      from: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), to: awayPos(),
      ctxDelta: {}, saySeqBefore: 0, saySeqAfter: 0 };
    const inst = mkInst([ev], []);
    const m = classifyMorning(inst, 2);
    check('fight-drive trace -> EXPLAINED-MECHANISM traceOnly', m.class === 'EXPLAINED-MECHANISM' && m.mechanism === 'fight-drive-move' && m.traceOnly === true, m);
  }
  // UNEXPLAINED: window exists, no move event
  {
    const inst = mkInst([], []);
    const m = classifyMorning(inst, 2);
    check('no move event -> UNEXPLAINED', m.class === 'UNEXPLAINED' && m.reason === 'no-move-event-in-window', m);
  }
  // UNEXPLAINED: no window record at all
  {
    const inst = mkInst([], []);
    inst.windows = [];
    const m = classifyMorning(inst, 2);
    check('no window record -> UNEXPLAINED', m.class === 'UNEXPLAINED' && m.reason === 'no-window-record', m);
  }
  // First haven->away move explains; later away->away moves do not replace it
  {
    const ev1 = { hook: 'upkeep-1-post', segment: 'upkeep-1',
      from: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), to: awayPos({ mapPx: 4, mapPy: 3 }),
      ctxDelta: { capHuntSorties: 1 }, saySeqBefore: 0, saySeqAfter: 0 };
    const ev2 = { hook: 'upkeep-3-post', segment: 'upkeep-3',
      from: awayPos({ mapPx: 4, mapPy: 3 }), to: awayPos({ mapPx: 3, mapPy: 3, tile: 'forest_floor' }),
      ctxDelta: {}, saySeqBefore: 0, saySeqAfter: 0 };
    const inst = mkInst([ev1, ev2], []);
    const m = classifyMorning(inst, 2);
    check('first out-move explains', m.mechanism === 'deedHunt-sortie' && m.outMovesInWindow === 1 && m.windowEvents === 2, m);
  }
  // nameMechanism direct: nomad counter
  {
    const named = nameMechanism({ sayLines: [] }, { segment: 'upkeep-1', ctxDelta: { nomadMoves: 1 } });
    check('nomad counter named', named.mechanism === 'nomad-road', named);
  }
  // Seed-level counts
  {
    const ev = { hook: 'upkeep-1-post', segment: 'upkeep-1',
      from: havenPos({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4 }), to: awayPos(),
      ctxDelta: { capHuntSorties: 1 }, saySeqBefore: 0, saySeqAfter: 0 };
    const c = classifySeedP4(mkInst([ev], []));
    check('seed counts', c.unexplainedCount === 1 && c.explainedMechanism === 1 && c.stillUnexplained === 0, c);
  }
  console.log('pure: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) process.exit(1);
}

function corpus(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  check('corpus non-empty', files.length > 0, files.length);
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const tag = f;
    check(tag + ' errs 0', inst.errCount === 0, inst.errCount);
    check(tag + ' decisions == evenings', inst.decisions.length === inst.evenings.length, [inst.decisions.length, inst.evenings.length]);
    const loopDays = inst.decisions.map((d) => d.loopDay);
    const contiguous = loopDays.every((d, i) => d === i + 1);
    check(tag + ' loop-days contiguous from 1', contiguous, loopDays.slice(0, 5));
    check(tag + ' every decision has morning', inst.decisions.every((d) => !!d.morning), null);
    check(tag + ' every evening has outcome', inst.evenings.every((e) => !!e.eveningOutcome), null);
    // windows close loop-days 2..N (loop-day 1 has no previous evening)
    const closing = (inst.windows || []).map((w) => w.closingLoopDay).sort((a, b) => a - b);
    const expected = loopDays.slice(1);
    check(tag + ' windows close loop-days 2..N', JSON.stringify(closing) === JSON.stringify(expected), [closing, expected]);
    check(tag + ' every window has events array', (inst.windows || []).every((w) => Array.isArray(w.events)), null);
    const base = classifySeed(inst);
    for (const ld of (base.unexplainedAwayMornings || [])) {
      const w = (inst.windows || []).find((x) => x.closingLoopDay === ld);
      check(tag + ' unexplained morning ' + ld + ' has window record', !!w && Array.isArray(w.events), null);
    }
  }
  console.log('corpus(' + dir + '): ' + pass + ' passed, ' + fail + ' failed');
  if (fail) process.exit(1);
}

if (require.main === module) {
  const ci = process.argv.indexOf('--corpus');
  if (ci >= 0) corpus(process.argv[ci + 1]);
  else pure();
}
