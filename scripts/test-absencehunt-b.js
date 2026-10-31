#!/usr/bin/env node
// test-absencehunt-b.js — proof for sim-absencehunt-b instruments.
// Pure tests (default): classifier definitions from the prereg, on
// synthetic records — no game load, no corpora needed. Must pass
// BEFORE any judged leg runs.
// Corpus mode: node scripts/test-absencehunt-b.js --corpus <dir>
// checks every per-seed file in <dir>: decisions == evenings in count,
// errs 0, loop-days contiguous from 1, every decision carries a morning
// snap, every evening carries an eveningOutcome.
// Usage: node scripts/test-absencehunt-b.js [--corpus <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const { atHaven, travelLegLines, classifySeed } = require('./analyze-absencehunt-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function havenPos(over) {
  return Object.assign({ inside: false, tile: 'forest_floor', mapPx: 1, mapPy: 2, havenPx: 4, havenPy: 4 }, over || {});
}
function mkInst(daysSpec) {
  // daysSpec: [{morning, evening, delta, lines}]
  const decisions = [], evenings = [];
  daysSpec.forEach((d, i) => {
    decisions.push({ loopDay: i + 1, morning: d.morning, ctxDelta: d.delta || {} });
    evenings.push({ loopDay: i + 1, ...d.evening, dayLines: d.lines || [], ctxDelta: d.delta || {}, eveningOutcome: d.evening.eveningOutcome || 'completed' });
  });
  return { seed: 99999, policy: 'test', days: 30, daysAlive: 30, endReason: 'survived', errCount: 0, decisions, evenings, sayLines: [] };
}

function pure() {
  // atHaven
  check('atHaven inside true', atHaven(havenPos({ inside: true })) === true);
  check('atHaven tile haven', atHaven(havenPos({ tile: 'haven' })) === true);
  check('atHaven map==node', atHaven(havenPos({ mapPx: 4, mapPy: 4 })) === true);
  check('atHaven away', atHaven(havenPos({})) === false);
  check('atHaven null', atHaven(null) === false);
  check('atHaven insideTent away still away', atHaven(havenPos({ insideTent: true })) === false);
  // travel lines
  check('travel lines count', travelLegLines(['Travel 2 tiles to forest floor', 'You walk back into Haven.', 'Fish. They report back.']) === 2);
  check('travel lines none', travelLegLines(['Fish.', 'Talk.']) === 0);
  check('travel lines non-array', travelLegLines(null) === 0);
  // genuine: evening away + next morning away
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({}), delta: {}, lines: [] }, // day1: away evening
      { morning: havenPos({}), evening: havenPos({}), delta: {}, lines: [] }, // day2: away morning+evening
      { morning: havenPos({}), evening: havenPos({ inside: true, tile: 'haven' }), delta: {}, lines: [] }, // day3 morning away, evening home
    ]);
    // day1 evening away, day2 morning away => genuine; day3 starts away ends home => away-return
    const c = classifySeed(inst);
    check('genuine counted', c.genuine === 1 && JSON.stringify(c.genuineDays) === '[1]', c);
    check('away-return counted', c.awayReturns === 1, c);
    check('awayOriginDays counts mornings away', c.awayOriginDays === 2, c);
  }
  // sleep-return: evening away, next morning home
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({}), delta: {}, lines: [] },
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: {}, lines: [] },
    ]);
    const c = classifySeed(inst);
    check('sleep-return excluded from genuine', c.genuine === 0 && c.sleepReturns === 1, c);
    check('sleep-return counts as departure', c.departures === 1, c);
  }
  // genuine-end-of-run: last day evening away, no following morning
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({}), delta: {}, lines: [] },
    ]);
    const c = classifySeed(inst);
    check('genuine-end-of-run', c.genuine === 1 && c.genuineDays[0] === 1, c);
  }
  // road absence excluded
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ roadActive: true }), delta: {}, lines: [] },
    ]);
    const c = classifySeed(inst);
    check('road excluded from genuine', c.genuine === 0 && c.roadAbsences === 1, c);
  }
  // day trip: forage delta, ends home
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: { forageTrips: 2 }, lines: ['Travel 1 tile to trail edge'] },
    ]);
    const c = classifySeed(inst);
    check('day-trip via forage delta', c.dayTrips === 1 && c.multiHop === 0, c);
  }
  // day trip: travel line only, ends home
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: {}, lines: ['You walk back into Haven.'] },
    ]);
    const c = classifySeed(inst);
    check('day-trip via travel line', c.dayTrips === 1, c);
  }
  // multi-hop: 4 travel lines, no forage/patrol, ends home
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: {},
        lines: ['Travel 1 tile to creek', 'Travel 1 tile to forest floor', 'Travel 1 tile to creek', 'You walk back into Haven.'] },
    ]);
    const c = classifySeed(inst);
    check('multi-hop 4 lines no forage', c.multiHop === 1 && c.dayTrips === 0, c);
  }
  // multi-hop blocked by forage delta (becomes day-trip)
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: { forageTrips: 1 },
        lines: ['Travel 1 tile to creek', 'Travel 1 tile to forest floor', 'Travel 1 tile to creek', 'You walk back into Haven.'] },
    ]);
    const c = classifySeed(inst);
    check('forage delta demotes multi-hop to day-trip', c.multiHop === 0 && c.dayTrips === 1, c);
  }
  // multi-hop blocked by patrol delta
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: { patrols: 1 },
        lines: ['Travel 1 tile to creek', 'Travel 1 tile to forest floor', 'Travel 1 tile to creek', 'You walk back into Haven.'] },
    ]);
    const c = classifySeed(inst);
    check('patrol delta demotes multi-hop', c.multiHop === 0 && c.dayTrips === 1, c);
  }
  // stay: no outward evidence
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven' }), delta: {}, lines: ['Fish. They report back.'] },
    ]);
    const c = classifySeed(inst);
    check('stay with no outward evidence', c.stays === 1 && c.dayTrips === 0, c);
  }
  // raw creek vs haven-checked: bucket creek but vessel at haven => raw only
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({ inside: true, tile: 'haven', }), delta: {}, lines: [] },
    ]);
    inst.evenings[0].woodcarry = { bucket: 'creek', rescued: true };
    const c = classifySeed(inst);
    check('raw creek counted, checked excluded at haven', c.rawCreekEvenings === 1 && c.havenCheckedCreekEvenings === 0, c);
  }
  // away-continuation: starts away, ends away (after a genuine day1)
  {
    const inst = mkInst([
      { morning: havenPos({ inside: true, tile: 'haven' }), evening: havenPos({}), delta: {}, lines: [] },
      { morning: havenPos({}), evening: havenPos({}), delta: {}, lines: [] },
    ]);
    const c = classifySeed(inst);
    check('away-continuation', c.awayContinuations === 1 && c.genuine === 1, c);
  }
  console.log('absencehunt pure: ' + pass + ' pass, ' + fail + ' fail');
  return fail === 0;
}

function corpus(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  check('corpus non-empty', files.length > 0, { dir, files: files.length });
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    check(f + ' decisions==evenings', inst.decisions.length === inst.evenings.length, { d: inst.decisions.length, e: inst.evenings.length });
    check(f + ' errs 0', inst.errCount === 0, { errs: inst.errCount });
    check(f + ' loopDays contiguous', inst.decisions.every((d, i) => d.loopDay === i + 1), {});
    check(f + ' mornings present', inst.decisions.every((d) => d.morning && typeof d.morning === 'object'), {});
    check(f + ' eveningOutcome present', inst.evenings.every((e) => typeof e.eveningOutcome === 'string'), {});
  }
  console.log('absencehunt corpus ' + dir + ': ' + pass + ' pass, ' + fail + ' fail over ' + files.length + ' files');
  return fail === 0;
}

if (require.main === module) {
  const idx = process.argv.indexOf('--corpus');
  const ok = idx >= 0 ? corpus(process.argv[idx + 1]) : pure();
  process.exit(ok ? 0 : 1);
}
module.exports = { pure, corpus };
