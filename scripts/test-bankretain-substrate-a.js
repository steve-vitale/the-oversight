#!/usr/bin/env node
// test-bankretain-substrate-a.js — proof for the distinct-event union
// (scripts/union-bankretain-substrate-a.js). Pure checks only: leg
// instances are replication, never sample size; unanimity across
// judged instances; disagreement flags, never averages away.
// Usage: node scripts/test-bankretain-substrate-a.js
'use strict';
const { unionLegs } = require('./union-bankretain-substrate-a');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function pack(edibleKcal, stacks) {
  return { edibleKcal, grossKcal: edibleKcal, lumpUnits: 0, stacks };
}
function st(name, units, kcalEach, spoilDay) {
  return { name, units, kcalEach, edible: true, foodState: 'ready', spoilDay };
}
function row(loopDay, gameDay, ev, postDailyPack) {
  return { loopDay, gameDay, bankfoodEvening: ev, postDailyPack,
    kcal: 2000, tile: 'forest_floor', mx: 8, my: 2 };
}
function evFlip(packBeforeEd, actions) {
  return { mode: 'flip', kcalAfter: 500,
    packBefore: { edibleKcal: packBeforeEd }, actions };
}
function inst(seed, evenings, firstUpkeeps, mornings) {
  return { seed, evenings, firstUpkeeps,
    bankfoodStore: { mornings: mornings || [], evenings: [], errs: 0 } };
}
function retainedInst(seed, loopDay, gameDay, beforeEd, postEd, fuEd, kcalFu, kcalMorn) {
  const food = [st('Muscadine Grapes', 6, 90, 63)];
  const ev = evFlip(beforeEd, [{ kind: 'walk' }, { kind: 'gather' }]);
  return inst(seed,
    [row(loopDay, gameDay, ev, pack(postEd, food)),
     row(loopDay + 1, gameDay + 1, null, pack(0, []))],
    [{ scholarDay: gameDay + 1, kcal: kcalFu, dayTicks: 0, pack: pack(fuEd, food) }],
    [{ loopDay: loopDay + 1, ate: false, skip: 'no-pack-food', kcalBefore: kcalMorn,
      kcalAfterEat: kcalMorn, packBefore: pack(0, []) }]);
}

// Same event on both legs counts ONCE, retained on both.
{
  const u = unionLegs([
    { leg: 'guard-variant', inst: retainedInst(17001, 20, 20, 540, 540, 540, 344, 884) },
    { leg: 'on-variant', inst: retainedInst(17001, 20, 20, 540, 540, 540, 344, 884) },
  ]);
  check('same event on two legs counts once', u.totals.distinctJudged === 1, JSON.stringify(u.totals));
  check('retained on both legs', u.distinctJudged[0] && u.distinctJudged[0].retained === true);
  check('two judged instances recorded', u.distinctJudged[0] && u.distinctJudged[0].judgedInstances === 2);
  check('no disagreement when legs agree', u.distinctJudged[0] && u.distinctJudged[0].disagreed === false);
}
// One leg judged, other leg censored (no next row): still one judged event.
{
  const cens = inst(17002,
    [row(30, 30, evFlip(0, [{ kind: 'forage', Eknown: 195, unknownUnits: 3 }]),
      pack(195, [st('Blackberry', 3, 65, 32)]))], [], []);
  const u = unionLegs([
    { leg: 'guard-variant', inst: retainedInst(17002, 20, 20, 540, 540, 540, 344, 884) },
    { leg: 'on-variant', inst: cens },
  ]);
  check('judged + censored legs still one judged event', u.totals.distinctJudged === 1, JSON.stringify(u.totals));
  check('censored-only keys tracked separately', u.totals.distinctCensored === 1, JSON.stringify(u.totals));
}
// Legs disagree (retained vs vanished): event NOT retained, flagged.
{
  const v = retainedInst(17003, 20, 20, 540, 540, 540, 344, 884);
  const food = [st('Muscadine Grapes', 6, 90, 63)];
  const van = inst(17003,
    [row(20, 20, evFlip(540, [{ kind: 'walk' }]), pack(540, food)),
     row(21, 21, null, pack(0, []))],
    [{ scholarDay: 21, kcal: 300, dayTicks: 0, pack: pack(0, []) }],
    [{ loopDay: 21, ate: false, skip: 'no-pack-food', kcalBefore: 300, kcalAfterEat: 300, packBefore: pack(0, []) }]);
  const u = unionLegs([
    { leg: 'guard-variant', inst: v },
    { leg: 'on-variant', inst: van },
  ]);
  check('disagreeing legs flag disagreement', u.distinctJudged[0] && u.distinctJudged[0].disagreed === true);
  check('disagreeing event not retained', u.distinctJudged[0] && u.distinctJudged[0].retained === false);
  check('disagreement counts as not-retained in totals', u.totals.distinctRetained === 0 && u.totals.distinctVanished === 1);
}
// Distinct keys: two seeds, three loop-days = three events.
{
  const u = unionLegs([
    { leg: 'guard-variant', inst: retainedInst(17004, 10, 10, 540, 540, 540, 344, 884) },
    { leg: 'guard-variant', inst: retainedInst(17004, 25, 25, 540, 540, 540, 344, 884) },
    { leg: 'guard-variant', inst: retainedInst(17005, 10, 10, 540, 540, 540, 344, 884) },
  ]);
  check('three distinct keys from two seeds', u.totals.distinctJudged === 3, JSON.stringify(u.totals));
  check('screened seeds with judged counted', u.totals.screenedSeedsWithJudged === 2, JSON.stringify(u.totals));
}
// ---- substrate-a: full dawn sweep is spoil-swept, not vanished ----
// Instrument correction to match the prereg definition ("every
// shortfall is a named per-form dawn spoil sweep"): when every edible
// stack's spoilDay has arrived, fuEdible is 0 AND every shortfall is
// named — that is RETAINED-SPOIL-SWEPT (screen event 17021/51).
// A full loss with any UNNAMED shortfall stays VANISHED.
{
  const { classifyRetention } = require('./analyze-bankretain-rerun');
  const pb = pack(270, [st('Muscadine Grapes', 3, 90, 52)]);
  const fu = { scholarDay: 52, pack: pack(0, []) };
  const c = classifyRetention(pb, fu);
  check('full named dawn sweep is spoil-swept, not vanished', c.verdict === 'RETAINED-SPOIL-SWEPT', c.verdict);
  check('full sweep shortfall named', c.shortfalls.length === 1 && c.shortfalls[0].namedSpoil === true);
}
{
  const { classifyRetention } = require('./analyze-bankretain-rerun');
  const pb = pack(270, [st('Muscadine Grapes', 3, 90, 99)]);
  const fu = { scholarDay: 52, pack: pack(0, []) };
  const c = classifyRetention(pb, fu);
  check('full unnamed loss stays vanished', c.verdict === 'VANISHED', c.verdict);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
