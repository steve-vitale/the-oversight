#!/usr/bin/env node
// scripts/test-dipholdbar.js — proof for the sim-dipholdbar game-code arm
// (flesh-out loop A, run fleshout-20261020T0015Z): the BELONG good-standing
// bar's arrears leg becomes "current on new bills".
//
// PRE-REGISTERED BAR FORMULA (verbatim): the arrears leg holds iff the
// trailing-7d tribute ACTUALLY PAID on the link (tributePaidLog, stamped in
// payTribute, pruned to the trailing 7 days on every write) covers at least
// one full current weekly bill (sum >= link.tributeKcalPerWeek). Legacy
// arrears may stand — the leg does not read l.arrears. Bootstrap: a bond
// with no recorded payments and clean books (arrears==0) reads current.
// Bill <= 0 is vacuously current.
//
// Fixtures (RED-verified against pristine hierarchy.js before the change):
//   F1 bar holds with legacy arrears standing when trailing-7d paid >= bill (RED on old)
//   F2 bar breaks when trailing-7d paid < bill, arrears standing (GREEN both — no over-leniency)
//   F3 clean-books bond with no recorded payments holds (GREEN both — bootstrap)
//   F4 grief-leverage ratchet untouched: x1.5, twice, third refused (GREEN both — steve-call #668)
//   F5 payments straddling the settlement boundary count together (RED on old)
//   F6 payments stopped 10d ago: bar breaks even with arrears 0 (RED on old — strictness side)
//   F7 payTribute stamps the trailing-7d log with ACTUAL kcal (RED on old)
//   F8 full weekly payment still zeroes arrears (engine behavior preserved; GREEN both)
//   F9 kingdomEndingEligible still requires arrears===0 (the doorway moves, not the room)
//
// Usage: node scripts/test-dipholdbar.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mkLink(Game, over) {
  const links = Game.hierarchyState();
  const link = Object.assign({
    id: 'L_' + Math.floor(Math.random() * 1e9),
    status: 'active', subordinate: 'haven', primary: 'PX',
    trust: 60, arrears: 0, day: 80,
    tributeKcalPerWeek: 11250, tributePaidWeek: -1, tributePaidKcal: 0,
  }, over || {});
  links.push(link);
  return link;
}
function clearLinks(Game) { Game.mshipState().links.length = 0; }
function setDay(Game, d) { Game.state.scholar = Game.state.scholar || {}; Game.state.scholar.day = d; }
function realm4(Game, prim) {
  Game.state.foreignPolities = [{ primary: prim || 'PX', subs: ['a', 'b'], day: 50 }];
}

async function main() {
  const { Game } = await loadGame({ seed: 64207, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  Game.state.village = Game.state.village || {};
  console.log('fixtures: BELONG good-standing bar, bill-current leg');

  // F1: legacy arrears stand, trailing-7d paid >= bill -> good standing holds
  setDay(Game, 100); realm4(Game);
  mkLink(Game, { arrears: 5250, tributePaidLog: [{ day: 96, kcal: 6000 }, { day: 99, kcal: 6000 }] });
  ok('F1 legacy arrears + trailing-7d paid >= bill holds the bar', !!Game.polityOf('PX'),
    'polityOf returned null');

  // F2: arrears standing, trailing-7d paid < bill -> bar broken (no over-leniency)
  clearLinks(Game);
  setDay(Game, 100); realm4(Game);
  mkLink(Game, { arrears: 5250, tributePaidLog: [{ day: 96, kcal: 3000 }] });
  ok('F2 trailing-7d paid < bill breaks the bar', !Game.polityOf('PX'),
    'polityOf granted standing on 3000/11250');

  // F3: clean books, no recorded payments -> holds (bootstrap / pre-change saves)
  clearLinks(Game);
  setDay(Game, 100); realm4(Game);
  const f3 = mkLink(Game, { arrears: 0 });
  delete f3.tributePaidLog;
  ok('F3 clean-books bond with no payment history holds', !!Game.polityOf('PX'),
    'polityOf returned null');

  // F4: the grief-leverage ratchet is untouched (steve-call #668 stays Steve's)
  const rl = mkLink(Game, { tributeKcalPerWeek: 5000 });
  const r1 = Game._griefLeverage(rl), b1 = rl.tributeKcalPerWeek;
  const r2 = Game._griefLeverage(rl), b2 = rl.tributeKcalPerWeek;
  const r3 = Game._griefLeverage(rl), b3 = rl.tributeKcalPerWeek;
  ok('F4 ratchet x1.5 twice then refused, untouched',
    r1 === true && b1 === 7500 && r2 === true && b2 === 11250 && r3 === false && b3 === 11250,
    `got ${r1}/${b1} ${r2}/${b2} ${r3}/${b3}`);

  // F5: dribs straddling the settlement boundary count together
  clearLinks(Game);
  setDay(Game, 100); realm4(Game);
  mkLink(Game, { arrears: 5250, tributePaidLog: [{ day: 94, kcal: 6000 }, { day: 100, kcal: 6000 }] });
  ok('F5 boundary-straddling dribs summing >= bill hold the bar', !!Game.polityOf('PX'),
    'polityOf returned null');

  // F6: payments stopped 10 days ago -> bar breaks even with zero arrears
  clearLinks(Game);
  setDay(Game, 100); realm4(Game);
  mkLink(Game, { arrears: 0, tributePaidLog: [{ day: 90, kcal: 11250 }] });
  ok('F6 stale payments (10d) break the bar', !Game.polityOf('PX'),
    'polityOf granted standing on a 10-day-old payment');

  // F7: payTribute stamps the log with ACTUAL kcal moved
  clearLinks(Game);
  setDay(Game, 50);
  Game.state.village.pantry = [{ kcalEach: 1000, units: 20, spoilDay: 999 }];
  const pl = mkLink(Game, { id: 'LPAY', tributeKcalPerWeek: 4000 });
  const paid = Game.payTribute('LPAY', 4000);
  const logged = (pl.tributePaidLog || []).reduce((s, e) => s + (e.kcal || 0), 0);
  ok('F7 payTribute stamps trailing-7d log with actual kcal',
    paid > 0 && logged === paid && (pl.tributePaidLog || [])[0].day === 50,
    `paid=${paid} logged=${logged}`);

  // F8: full weekly payment still zeroes arrears (engine behavior preserved)
  clearLinks(Game);
  setDay(Game, 60);
  Game.state.village.pantry = [{ kcalEach: 1000, units: 30, spoilDay: 999 }];
  const pz = mkLink(Game, { id: 'LZERO', tributeKcalPerWeek: 4000, arrears: 9000 });
  Game.payTribute('LZERO', 4000);
  ok('F8 full weekly payment still zeroes arrears', (pz.arrears || 0) === 0,
    `arrears=${pz.arrears}`);

  // F9: the ending frame still requires arrears===0 (doorway moves, not the room)
  clearLinks(Game);
  setDay(Game, 100); realm4(Game);
  const f9 = mkLink(Game, { arrears: 5250, trust: 80, day: 70,
    tributePaidLog: [{ day: 96, kcal: 6000 }, { day: 99, kcal: 6000 }] });
  const elig = Game.kingdomEndingEligible();
  ok('F9 ending frame still requires arrears 0', !(elig && elig.eligible) && !!Game.polityOf('PX'),
    `eligible=${elig && elig.eligible}`);

  console.log(`\ntest-dipholdbar: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('failed: ' + failures.join(', ')); process.exit(1); }
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
