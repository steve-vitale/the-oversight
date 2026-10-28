// test-journey-deepening-r60-instruments-20261028.js -- PROOF TEST for the
// r60 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r60 driver carries the R60 helpers, the meat-test wrap,
// and r60 output filenames; (b) pickChoice is byte-identical to r59
// (panel picker unchanged); (c) plotSnap counts total/active/sprung/
// resolved on a stub betrayal state and returns zeros (no throw) when
// betrayalState is missing; (d) meatPantrySnap keeps only monster-meat
// rows (foodKind meat, id meat_*, name 'unknown flesh') and sums units
// and cooked units; (e) the meat-test wrap passes the return value
// through unaltered and records the call, and a Game without
// testMonsterMeat does not throw.
// Usage: node scripts/test-journey-deepening-r60-instruments-20261028.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r60-20261028.js');
const DRIVER59 = path.join(__dirname, 'journey-deepening-r59-20261028.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
check('(a) driver contains R60 helpers + wraps + r60 outputs',
  src.includes('function plotSnap(day)') && src.includes('function meatPantrySnap(day, phase)') &&
  src.includes('R60 MEAT-TEST COUNTER') && src.includes('R60 PLOT-FORMATION WRAP') &&
  src.includes('journey-deepening-r60-seed${seed}.json') &&
  src.includes('journey-deepening-r60-transcript-') && src.includes('plotSnaps: ctx.plotSnaps') &&
  src.includes('plotFormations: _plotFormations') &&
  src.includes('meatPantrySnaps: ctx.meatPantrySnaps') && src.includes('meatTestCalls: _meatTestCalls') &&
  src.includes('R59 INVITE WRAP'));
check('(a2) driver resets r60 globals per seed',
  src.includes('_meatTestCalls = [];') && src.includes('_inviteDecisions = [];'));
// (b) picker identical to r59
{
  const pick = (s) => {
    const a = s.indexOf('function pickChoice(');
    const b = s.indexOf('\nconst CONVO_DAYS', a);
    if (a < 0 || b < 0) return null;
    return s.slice(a, b);
  };
  const p60 = pick(src), p59 = pick(fs.readFileSync(DRIVER59, 'utf8'));
  check('(b) pickChoice byte-identical to r59 (panel picker unchanged)', p60 !== null && p60 === p59);
}
// (c)+(d): extract helpers and run against stubs
const hStart = src.indexOf('function plotSnap(day)');
const hEnd = src.indexOf('// ---- census ----', hStart);
if (hStart < 0 || hEnd < 0 || hEnd <= hStart) { console.log('FAIL helper extraction'); process.exit(1); }
const helperCode = src.slice(hStart, hEnd);
const loadHelpers = (g) => {
  const factory = new Function('_G', helperCode + '\nreturn { plotSnap, meatPantrySnap };');
  return factory(g);
};
{
  const stub = { betrayalState: () => ({ plots: [
    { id: 'plot_1', leader: 'a', inviter: 'b', target: 'c', day: 41, active: true, sprung: false, resolved: false },
    { id: 'plot_2', leader: 'd', inviter: 'e', target: 'f', day: 50, active: false, sprung: true, resolved: true },
    { id: 'plot_3', leader: 'g', inviter: 'h', target: 'i', day: 60, active: true, sprung: true, resolved: false },
  ] }), state: { village: { pantry: [] } } };
  const { plotSnap } = loadHelpers(stub);
  const s = plotSnap(70);
  check('(c) plotSnap counts total/active/sprung/resolved + maps fields',
    s.day === 70 && s.total === 3 && s.active === 2 && s.sprung === 2 && s.resolved === 1 &&
    s.plots[0].id === 'plot_1' && s.plots[0].inviter === 'b' && s.plots[0].target === 'c');
}
{
  const { plotSnap } = loadHelpers({ state: { village: {} } });
  let threw = false, s = null;
  try { s = plotSnap(50); } catch (e) { threw = true; }
  check('(c2) plotSnap with no betrayalState: no throw, zeros', !threw && s && s.total === 0 && s.active === 0);
}
{
  const stub = { state: { village: { pantry: [
    { plantId: 'meat_boar', foodKind: 'meat', foodState: 'raw', units: 3, cooked: false, kcalEach: 200, edible: false },
    { id: 'meat_deer', foodKind: 'meat', foodState: 'cooked', units: 2, cooked: true, kcalEach: 300, edible: true },
    { name: 'unknown flesh', foodKind: 'meat', foodState: 'raw', units: 1, cooked: false, kcalEach: 100, edible: false },
    { plantId: 'acorn', foodKind: 'plant', foodState: 'cooked', units: 9, cooked: true, kcalEach: 50, edible: true },
    { plantId: 'berry', foodKind: 'plant', foodState: 'raw', units: 5, cooked: false, kcalEach: 20, edible: true },
  ] } } };
  const { meatPantrySnap } = loadHelpers(stub);
  const s = meatPantrySnap(60);
  check('(d) meatPantrySnap keeps only meat rows + sums units/cookedUnits',
    s.day === 60 && s.n === 3 && s.units === 6 && s.cookedUnits === 2 &&
    s.rows.every(r => r.foodKind === 'meat' || r.name === 'unknown flesh') &&
    meatPantrySnap(60, 'dawn').phase === 'dawn');
}
// (e): meat-test wrap pass-through + missing-method safety
{
  const start = src.indexOf('  // R60 MEAT-TEST COUNTER');
  const end = src.indexOf('  // R10 death-honesty', start);
  if (start < 0 || end < 0 || end <= start) { console.log('FAIL meat-wrap extraction'); process.exit(1); }
  const wrapCode = src.slice(start, end);
  const runWrap = (game, day) => {
    const records = [];
    const factory = new Function('Game', 'gday', '_meatTestCalls', wrapCode + '\nreturn Game;');
    return { game: factory(game, () => day, records), records };
  };
  const sentinel = { item: 'revealed_boar' };
  const stub = { testMonsterMeat: () => sentinel };
  const { game, records } = runWrap(stub, 55);
  const back = game.testMonsterMeat(0, true);
  check('(e) meat-test wrap records call + returns original value',
    records.length === 1 && records[0].day === 55 && records[0].nargs === 2 && back === sentinel);
  let threw = false;
  try { runWrap({}, 10); } catch (e2) { threw = true; }
  check('(e2) Game without testMonsterMeat: no throw', !threw);
}
// (f): armPlot wrap pass-through + missing-method safety
{
  const start = src.indexOf('  // R60 PLOT-FORMATION WRAP');
  const end = src.indexOf('  // R60 MEAT-TEST COUNTER', start);
  if (start < 0 || end < 0 || end <= start) { console.log('FAIL armPlot-wrap extraction'); process.exit(1); }
  const wrapCode = src.slice(start, end);
  const runWrap = (game, day) => {
    const records = [];
    const factory = new Function('Game', 'gday', '_plotFormations', wrapCode + '\nreturn Game;');
    return { game: factory(game, () => day, records), records };
  };
  const sentinel = { id: 'plot_9', leader: 'miguel_santos', target: 'gen_au1uvlw' };
  const stub = { armPlot: () => sentinel };
  const { game, records } = runWrap(stub, 11);
  const back = game.armPlot('miguel_santos', ['raj_patel'], 'gen_au1uvlw', {});
  check('(f) armPlot wrap records formation + returns original plot',
    records.length === 1 && records[0].day === 11 && records[0].id === 'plot_9' &&
    records[0].leader === 'miguel_santos' && records[0].target === 'gen_au1uvlw' && back === sentinel);
  let threw = false;
  try { runWrap({}, 10); } catch (e2) { threw = true; }
  check('(f2) Game without armPlot: no throw', !threw);
}
process.exit(fail ? 1 : 0);
