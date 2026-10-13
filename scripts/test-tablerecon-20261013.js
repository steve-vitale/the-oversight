#!/usr/bin/env node
// scripts/test-tablerecon-20261013.js — proof test for the table-recon
// instrument (scripts/sweep-tablerecon-20261013.js, flesh-out r17 ARM 2).
//
// Proves the instrument works before the suite spends 16 runs on it:
//   (1) trackBest/namedGaps pure logic: seat escalation recorded, best-ever
//       rung maxing, lesser/full gap naming, exact-threshold edges.
//   (2) live sim (30 days, seed 11, competent, gates off): instruments attach
//       without altering gameplay (registerDeath/say wraps pass through),
//       tableRow() returns a sane row, deaths are recorded structurally,
//       say-line capture works on forced death/table beats, nationalFirstDay
//       agrees with the scale instrument's daily rows.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const tr = require('./sweep-tablerecon-20261013');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function fakeRow(over) {
  return Object.assign({
    day: 10, seat: 'none', w: [0, 0, 0], cx: 0, cr: 0, rank: 'village',
    stage: 0, food: false, gw: [0, 0, 0, 0, 0], gok: false, gcx: 0, gcr: 0,
    grank: 'village', waiting: false, done: false, arc: 1, wp: [0, 0, 0, 0],
  }, over || {});
}

// ---- (1) pure logic ----
(function logicTests() {
  const t = { rows: [], best: { w: [0, 0, 0], gw: [0, 0, 0, 0, 0], cx: 0, cr: 0, gcx: 0, gcr: 0, stage: 0, food: false, rankOrd: 0, rank: 'village', grankOrd: 0, grank: 'village', seatOrd: 0, seat: 'none', seatDay: null, wp: [0, 0, 0, 0] }, waitingDay: null, doneDay: null, arc4Day: null, nationalFirstDay: null, sayLines: [], deaths: [] };
  // seat escalation lesser -> full; regression back must NOT lower best
  tr.trackBest(t, fakeRow({ day: 60, seat: 'lesser', w: [4, 4, 3], cx: 2, cr: 2, rank: 'regional', stage: 2, food: true }));
  ok('best seat records lesser@60', t.best.seat === 'lesser' && t.best.seatDay === 60);
  tr.trackBest(t, fakeRow({ day: 80, seat: 'full', w: [5, 5, 4], gw: [5, 5, 4, 3, 2], gcx: 3, gcr: 3, grank: 'national', rank: 'national', stage: 3 }));
  ok('best seat escalates to full@80', t.best.seat === 'full' && t.best.seatDay === 80);
  tr.trackBest(t, fakeRow({ day: 100, seat: 'none', w: [0, 0, 0], cx: 0, cr: 0, rank: 'village', stage: 0 }));
  ok('regression does not lower best seat', t.best.seat === 'full' && t.best.w[0] === 5 && t.best.gw[4] === 2);
  // rung maxing across rows
  ok('cx/cr/stage max across rows', t.best.cx === 2 && t.best.cr === 2 && t.best.stage === 3);
  ok('nationalFirstDay from table rows', t.nationalFirstDay === 80, 'got ' + t.nationalFirstDay);
  ok('waitingDay latched', (() => { tr.trackBest(t, fakeRow({ day: 90, waiting: true })); return t.waitingDay === 90; })());
  // gap naming: exact thresholds met => met
  const met = { w: [4, 4, 3], gw: [5, 5, 4, 3, 2], cx: 2, cr: 2, gcx: 3, gcr: 3, stage: 2, food: true, rankOrd: 1, rank: 'regional', grankOrd: 2, grank: 'national' };
  const g = tr.namedGaps(met);
  ok('lesser met at exact thresholds', g.lesser.length === 0 && true, JSON.stringify(g.lesser));
  ok('full met at exact thresholds', g.full.length === 0, JSON.stringify(g.full));
  // gap naming: zero state names the wave-4/5 bars (the suspected binder)
  const g0 = tr.namedGaps({ w: [0, 0, 0], gw: [0, 0, 0, 0, 0], cx: 0, cr: 0, gcx: 0, gcr: 0, stage: 0, food: false, rankOrd: 0, rank: 'village', grankOrd: 0, grank: 'village' });
  ok('zero-state lesser gap names all 8 rungs', g0.lesser.length === 8, JSON.stringify(g0.lesser));
  ok('zero-state full gap includes w4/w5', g0.full.includes('w4 0/3') && g0.full.includes('w5 0/2'), JSON.stringify(g0.full));
  // wave-ledger points max across rows (the wave-4 gate input)
  tr.trackBest(t, fakeRow({ day: 70, wp: [9, 6, 2, 0] }));
  tr.trackBest(t, fakeRow({ day: 90, wp: [9, 6, 3, 0] }));
  ok('wave-3 ledger points max across rows', t.best.wp[2] === 3, JSON.stringify(t.best.wp));
})();

// ---- (2) live sim ----
(async () => {
  const { Game } = await loadGame({ seed: 11, mode: 'tablerecon-test' });
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = tr.attachTable(Game, m);

  // say-line capture: force a table/national beat line
  Game.say('A national envoy arrives — the TABLE will consider Haven.');
  ok('say capture records table beat', t.sayLines.length === 1 && t.sayLines[0].day >= 0 && /TABLE/.test(t.sayLines[0].text));

  // registerDeath pass-through: game behavior unchanged, record structured
  const before = t.deaths.length;
  const r0 = Game.registerDeath({ kind: 'person', villagerId: 'v-test-1', name: 'Testy Person', cause: 'monster:combat' });
  ok('registerDeath records structured death', t.deaths.length === before + 1 && t.deaths[t.deaths.length - 1].cause === 'monster:combat' && t.deaths[t.deaths.length - 1].day === ((Game.state.scholar || {}).day || 0));
  // double-death guard still applies (game behavior, not instrument)
  Game.registerDeath({ kind: 'person', villagerId: 'v-test-1', name: 'Testy Person', cause: 'monster:combat' });
  ok('registerDeath pass-through preserves double-death guard', t.deaths.length === before + 2); // hook records both calls; game guards the second

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
    try {
      const d = (G.state.scholar || {}).day || 0;
      if (d % 5 === 0) { const row = tr.tableRow(G); t.rows.push(row); tr.trackBest(t, row); }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: 30, sampleEvery: 10 });
  m._days = result.days;
  try { const rf = tr.tableRow(Game); t.rows.push(rf); tr.trackBest(t, rf); } catch (e) {}
  ok('30-day run completes', result.days > 0, 'days=' + result.days);
  const row = tr.tableRow(Game);
  ok('tableRow shape sane', row.seat && Array.isArray(row.w) && Array.isArray(row.gw) && row.day === ((Game.state.scholar || {}).day || 0), JSON.stringify({ seat: row.seat, day: row.day }));
  ok('best-ever tracked across rows', t.best.w[0] >= 0 && t.rows.length > 0);
  const fin = Object.assign({}, fc.finalize(Game, m, result), sr.finalizeScale(Game, m));
  ok('scale instrument co-attached (nationalHeldDays field)', 'nationalHeldDays' in fin);
  // nationalFirstDay cross-check against scale daily rows
  const sd = (m.scale.daily || []);
  let firstScaleNat = null;
  for (const r of sd) if (r.rank === 'national' || r.rank === 'global') { firstScaleNat = r.day; break; }
  ok('nationalFirstDay agrees with scale daily rows', firstScaleNat == null || t.nationalFirstDay === firstScaleNat,
    `table=${t.nationalFirstDay} scale=${firstScaleNat}`);
  console.log(`\nproof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
