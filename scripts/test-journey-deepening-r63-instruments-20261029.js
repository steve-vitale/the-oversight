// test-journey-deepening-r63-instruments-20261029.js -- PROOF TEST for the
// r63 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r63 driver carries the R63 teach/drop census wraps +
// dated prepPullDays + r63 output filenames; (b) pickChoice is
// byte-identical to r62 and the ENGAGE/ENGAGE2/DEFLECT lists are identical
// (panel picker unchanged); (c) favorSnap tracks a forage_help favor
// asked→promised→fulfilled with forageRun/deliveredKcal, ignores other
// favor kinds, and adds no transition when nothing changed (stub Game,
// extracted helpers only — carried from r62); (d) wrapTeachCensus records
// lessons with pre-call knowledge classification (genuinely-new vs
// already-known) and passes args/return through untouched; (e)
// wrapDropCensus records the pre-call item and passes through; (f) both
// wraps no-op safely when the Game method is absent.
// Usage: node scripts/test-journey-deepening-r63-instruments-20261029.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r63-20261029.js');
const DRIVER62 = path.join(__dirname, 'journey-deepening-r62-20261028.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src62 = fs.readFileSync(DRIVER62, 'utf8');
check('(a) driver contains R63 census wraps + dated pulls + r63 outputs',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') && src.includes('function wrapDropCensus(G, ctx, dayFn)') &&
  src.includes('wrapTeachCensus(G, ctx, gday)') && src.includes('wrapDropCensus(G, ctx, gday)') &&
  src.includes('ctx.prepPullDays') && src.includes('prepPullDays: ctx.prepPullDays') &&
  src.includes('journey-deepening-r63-seed${seed}.json') &&
  src.includes('journey-deepening-r63-transcript-') &&
  src.includes('teachLessons: ctx.teachLessons') && src.includes('dropEvents: ctx.dropEvents'));
check('(a2) wraps are read-only (pre-call reads before the call, return passed through)',
  src.indexOf('personKnowsSkill(learner, skillId)') < src.indexOf('_ts.apply(this, arguments)') &&
  src.indexOf('G.state.scholar') < src.indexOf('_di.apply(this, arguments)'));
check('(a3) no r62 output filenames left',
  !src.includes('journey-deepening-r62-seed') && !src.includes('journey-deepening-r62-transcript-'));
// (b) picker identical to r62
{
  const pick = (s) => {
    const a = s.indexOf('function pickChoice(');
    const b = s.indexOf('\nconst CONVO_DAYS', a);
    if (a < 0 || b < 0) return null;
    return s.slice(a, b);
  };
  const p63 = pick(src), p62 = pick(src62);
  check('(b) pickChoice byte-identical to r62 (panel picker unchanged)', p63 !== null && p63 === p62);
  for (const name of ['ENGAGE', 'ENGAGE2', 'DEFLECT']) {
    const re = new RegExp('const ' + name + ' = \\[.*?\\];', 's');
    check('(b) ' + name + ' identical to r62', re.exec(src)[0] === re.exec(src62)[0]);
  }
}
// (c) favorSnap against a stub Game (extracted helpers only, carried from r62)
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
// (d)+(e) wrap behavior against stub Games (extracted wrap functions only)
const wStart = src.indexOf('function wrapTeachCensus(');
const wMid = src.indexOf('function wrapDropCensus(', wStart);
const wEnd = src.indexOf('function makePolicy()', wMid);
if (wStart < 0 || wMid < 0 || wEnd < 0) { console.log('FAIL wrap extraction'); process.exit(1); }
const wrapCode = src.slice(wStart, wEnd);
const loadWraps = () => {
  const factory = new Function(wrapCode + '\nreturn { wrapTeachCensus, wrapDropCensus };');
  return factory();
};
{
  const { wrapTeachCensus, wrapDropCensus } = loadWraps();
  const dayFn = () => 55;
  // teach: stub Game where vidA lacks herbal_remedy, vidB already knows it
  const seen = [];
  const G = {
    personKnowsSkill: (who, sid) => (who === 'vidB' && sid === 'herbal_remedy'),
    teachSkill: function (teacher, learner, sid, opts) { seen.push([teacher, learner, sid, opts && opts.via]); return true; },
  };
  const ctx = {};
  wrapTeachCensus(G, ctx, dayFn);
  const r1 = G.teachSkill('vidA', 'player', 'herbal_remedy', { via: 'conversation' });
  const r2 = G.teachSkill('player', 'vidB', 'herbal_remedy', { via: 'conversation' });
  check('(d) teach passthrough (returns + args untouched)', r1 === true && r2 === true && seen.length === 2 && seen[0][2] === 'herbal_remedy', 'seen=' + JSON.stringify(seen));
  check('(d) genuinely-new classified (preKnown false)', ctx.teachLessons.length === 2 && ctx.teachLessons[0].preKnown === false && ctx.teachLessons[0].result === 'learned' && ctx.teachLessons[0].day === 55, JSON.stringify(ctx.teachLessons[0] || null));
  check('(d) already-known classified (preKnown true)', ctx.teachLessons[1].preKnown === true && ctx.teachLessons[1].teacher === 'player' && ctx.teachLessons[1].learner === 'vidB', JSON.stringify(ctx.teachLessons[1] || null));
  // teach fallback: skillsKnownBy path when personKnowsSkill absent
  const G2 = {
    skillsKnownBy: (who) => (who === 'vidC' ? ['tracking'] : []),
    teachSkill: function () { return false; },
  };
  const ctx2 = {};
  wrapTeachCensus(G2, ctx2, dayFn);
  G2.teachSkill('vidX', 'vidC', 'tracking', { via: 'daily' });
  G2.teachSkill('vidC', 'vidD', 'herbal_remedy', {});
  check('(d) skillsKnownBy fallback classifies', ctx2.teachLessons.length === 2 && ctx2.teachLessons[0].preKnown === true && ctx2.teachLessons[1].preKnown === false && ctx2.teachLessons[0].result === 'not-learned', JSON.stringify(ctx2.teachLessons));
  // drop: stub Game with a branch stack at index 0
  const dropped = [];
  const G3 = {
    state: { scholar: { inventory: [{ itemId: 'branch', units: 5 }, { itemId: 'bark_strip', units: 3 }] } },
    dropItem: function (idx) { dropped.push(idx); return 'left'; },
  };
  const ctx3 = {};
  wrapDropCensus(G3, ctx3, dayFn);
  const rd = G3.dropItem(0);
  check('(e) drop passthrough + pre-call item recorded', rd === 'left' && dropped.length === 1 && ctx3.dropEvents.length === 1 && ctx3.dropEvents[0].itemId === 'branch' && ctx3.dropEvents[0].units === 5 && ctx3.dropEvents[0].day === 55, JSON.stringify(ctx3.dropEvents[0] || null));
  // (f) no-op when methods absent
  const ctx4 = {};
  try {
    wrapTeachCensus({}, ctx4, dayFn);
    wrapDropCensus({}, ctx4, dayFn);
    check('(f) wraps no-op on method-less Game', (ctx4.teachLessons || []).length === 0 && (ctx4.dropEvents || []).length === 0);
  } catch (e) { check('(f) wraps no-op on method-less Game', false, String(e && e.message)); }
}
if (fail) { console.log('FAILURES: ' + fail); process.exit(1); }
console.log('ALL PASS');
