// test-journey-deepening-r62-instruments-20261028.js -- PROOF TEST for the
// r62 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r62 driver carries the R62 favor census + outing arm
// and r62 output filenames; (b) pickChoice is byte-identical to r61 and
// the ENGAGE/ENGAGE2/DEFLECT lists are identical (panel picker unchanged);
// (c) favorSnap tracks a forage_help favor asked→promised→fulfilled with
// forageRun/deliveredKcal, ignores other favor kinds, and adds no
// transition when nothing changed (stub Game, extracted helpers only).
// Usage: node scripts/test-journey-deepening-r62-instruments-20261028.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r62-20261028.js');
const DRIVER61 = path.join(__dirname, 'journey-deepening-r61-20261028.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src61 = fs.readFileSync(DRIVER61, 'utf8');
check('(a) driver contains R62 census + arm + r62 outputs',
  src.includes('function favorRow(G, f)') && src.includes('function favorSnap(G, ctx, tag)') &&
  src.includes('function outingDawnArm(ctx)') && src.includes('function outingAttemptFavor(ctx, vid, favor)') &&
  src.includes('function armConvoAction(vid)') && src.includes('const OUTING_ARM = process.env.OUTING_ARM') &&
  src.includes('journey-deepening-r62-seed${seed}.json') &&
  src.includes('journey-deepening-r62-transcript-') &&
  src.includes('favorCensus: { transitions: ctx.favorTransitions') &&
  src.includes('outingArm: ctx.outingArm') &&
  src.includes("favorSnap(_G, ctx, 'dawn')") && src.includes("favorSnap(_G, ctx, 'convo')"));
check('(a2) arm is env-gated and never calls performForageFavor directly',
  src.includes('if (!OUTING_ARM) return;') && !src.includes('performForageFavor(vid, favor)'));
// (b) picker identical to r61
{
  const pick = (s) => {
    const a = s.indexOf('function pickChoice(');
    const b = s.indexOf('\nconst CONVO_DAYS', a);
    if (a < 0 || b < 0) return null;
    return s.slice(a, b);
  };
  const p62 = pick(src), p61 = pick(src61);
  check('(b) pickChoice byte-identical to r61 (panel picker unchanged)', p62 !== null && p62 === p61);
  for (const name of ['ENGAGE', 'ENGAGE2', 'DEFLECT']) {
    const re = new RegExp('const ' + name + ' = \\[.*?\\];', 's');
    check('(b) ' + name + ' identical to r61', re.exec(src)[0] === re.exec(src61)[0]);
  }
}
// (c) favorSnap against a stub Game (extracted helpers only)
const hStart = src.indexOf('function favorRow(');
const hEnd = src.indexOf('// ---- census ----', hStart);
if (hStart < 0 || hEnd < 0 || hEnd <= hStart) { console.log('FAIL helper extraction'); process.exit(1); }
const helperCode = src.slice(hStart, hEnd);
const loadHelpers = (g) => {
  const factory = new Function('_G', 'function gday(){ try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch(e){ return 0; } }\n' + helperCode + '\nreturn { favorRow, favorSnap };');
  return factory(g);
};
{
  const G = { state: { village: { favorLedger: {
    vid1: { id: 'f1', vid: 'vid1', kind: 'forage_help', state: 'asked', askedDay: 40 },
    vid2: { id: 'f2', vid: 'vid2', kind: 'water_haul', state: 'asked', askedDay: 40 },
  }, promises: {} } } };
  const { favorSnap } = loadHelpers(G);
  const ctx = {};
  favorSnap(G, ctx, 'test');
  check('(c) first snap records the forage_help ask only', ctx.favorTransitions.length === 1 && ctx.favorTransitions[0].to === 'asked', 'n=' + ctx.favorTransitions.length);
  G.state.village.favorLedger.vid1.state = 'promised';
  G.state.village.favorLedger.vid1.promisedDay = 45;
  G.state.village.favorLedger.vid1.meetDay = 46;
  favorSnap(G, ctx, 'test');
  check('(c) promise transition recorded with from/to', ctx.favorTransitions.length === 2 && ctx.favorTransitions[1].from === 'asked' && ctx.favorTransitions[1].to === 'promised', 'n=' + ctx.favorTransitions.length);
  favorSnap(G, ctx, 'test');
  check('(c) unchanged state adds no transition', ctx.favorTransitions.length === 2, 'n=' + ctx.favorTransitions.length);
  G.state.village.favorLedger.vid1.state = 'fulfilled';
  G.state.village.favorLedger.vid1.forageRun = { startedDay: 46, forageCount: 1, deliveredKcal: 900, returned: true, returnedDay: 46 };
  G.state.village.promises.vid1 = { kept: true };
  favorSnap(G, ctx, 'test');
  const last = ctx.favorTransitions[ctx.favorTransitions.length - 1];
  check('(c) fulfilled transition carries forageRun + kept', ctx.favorTransitions.length === 3 && last.to === 'fulfilled' && last.row.promiseKept === true && last.row.forageRun.deliveredKcal === 900, 'n=' + ctx.favorTransitions.length);
}
if (fail) { console.log('FAILURES: ' + fail); process.exit(1); }
console.log('ALL PASS');
