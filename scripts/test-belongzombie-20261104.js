// test-belongzombie-20261104.js — proof for the BELONG-zombie analyzer
// (arm sim-belongzombie-a). Pure-function fixtures over synthetic per-seed
// JSONs shaped like the diplo instrument's output. No Game, no sims.
// Usage: node scripts/test-belongzombie-20261104.js
'use strict';
const AN = require('./test-belongzombie-analyze-20261104');
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name); }
}
function snap(day, links, pantry) {
  return { day: day, pantryKcal: pantry == null ? 20000 : pantry,
    linkFunnel: { detail: links.map(function (l) {
      return { id: l.id, primary: l.primary, subordinate: l.subordinate, status: l.status, trust: l.trust };
    }) } };
}
function seedOut(days, linksFn, opts) {
  opts = opts || {};
  const daily = days.map(function (d) { return snap(d, linksFn(d), opts.pantry); });
  return { seed: opts.seed || 1, days: opts.days == null ? 200 : opts.days,
    villageLost: opts.lost == null ? true : opts.lost,
    daily: daily, proposalEvents: opts.proposals || [],
    linkFormedEvents: opts.formed || [], sayLines: opts.say || [],
    deathEvents: opts.deaths || [], instrumentErrors: [] };
}
// 1. BELONG zombie detected; Haven-primary trust-0 NOT counted; peer NOT counted.
(function () {
  const out = seedOut([10, 11, 12], function (d) {
    return [
      { id: 'b1', primary: 'village_0', subordinate: 'haven', status: 'active', trust: d === 10 ? 5 : 0 },
      { id: 'h1', primary: 'haven', subordinate: 'village_1', status: 'active', trust: 0 },
      { id: 'p1', primary: null, subordinate: null, status: 'active', trust: 0 },
    ];
  }, { days: 100 });
  const z = AN.belongZombies(out);
  check('belong zombie found, others excluded', z.length === 1 && z[0].village === 'village_0');
  check('firstZero + zeroDaysInLife', z[0].firstZero === 11 && z[0].zeroDaysInLife === 2);
})();
// 2. Death-day-only trust-0 is NOT an in-life zombie.
(function () {
  const out = seedOut([98, 99, 100], function (d) {
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: d === 100 ? 'broken' : 'active', trust: d === 100 ? 0 : 5 }];
  }, { days: 100 });
  // trust 0 appears only on the death-day broken snapshot; no active trust-0 snapshot before death
  const z = AN.belongZombies(out);
  check('death-day-only zero excluded', z.length === 0);
})();
// 3. Flicker: firstZero sticks at first in-life zero; zeroDays counts only trust-0 snapshots.
(function () {
  const out = seedOut([90, 91, 92, 93, 94], function (d) {
    const t = { 90: 3, 91: 0, 92: 2, 93: 0, 94: 0 }[d];
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: 'active', trust: t }];
  }, { days: 200 });
  const z = AN.belongZombies(out);
  check('flicker firstZero', z.length === 1 && z[0].firstZero === 91);
  check('flicker zeroDaysInLife', z[0].zeroDaysInLife === 3);
})();
// 4. Addressable: postZeroLife >= 35 AND pantry gate opens in window.
(function () {
  const days = [];
  for (let d = 90; d <= 140; d++) days.push(d);
  const out = seedOut(days, function (d) {
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: 'active', trust: d >= 100 ? 0 : 5 }];
  }, { days: 200, pantry: 20000 });
  const z = AN.belongZombies(out);
  check('addressable true', z.length === 1 && z[0].addressable === true && z[0].postZeroLife === 100);
  const out2 = seedOut(days, function (d) {
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: 'active', trust: d >= 100 ? 0 : 5 }];
  }, { days: 120, pantry: 5000 });
  const z2 = AN.belongZombies(out2);
  check('not addressable: short life + shut gate', z2.length === 1 && z2[0].addressable === false);
})();
// 5. Census judge: bar is addressable seeds >= 2.
(function () {
  function sum(seed, addr) {
    return { seed: seed, instrumentErrors: 0,
      belongZombies: addr ? [{ addressable: true }] : [{ addressable: false }] };
  }
  check('census GO-TO-STEP-2 at 2 addressable',
    AN.judgeCensus([sum(1, true), sum(2, true), sum(3, false)]).verdict === 'GO-TO-STEP-2');
  check('census INSUFFICIENT-DATA at 1 addressable',
    AN.judgeCensus([sum(1, true), sum(2, false)]).verdict === 'INSUFFICIENT-DATA');
  check('census SUBSTRATE-MISSING at 0 zombies',
    AN.judgeCensus([{ seed: 1, instrumentErrors: 0, belongZombies: [] }]).verdict === 'SUBSTRATE-MISSING');
})();
// 6. BELONG clear detection: trust-0 break + faded line in window counts;
//    trust-0 break with no faded line is otherBreak, not a clear.
(function () {
  const days = [10, 11, 12];
  const withSay = seedOut(days, function (d) {
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: d === 12 ? 'broken' : 'active', trust: 0 }];
  }, { days: 100, say: [{ day: 11, line: '🍂 The bond with Emberhold has faded to nothing — no trust left.' }] });
  const a = AN.analyzeSeed(withSay);
  check('faded clear detected', a.belongClears.length === 1 && a.belongClears[0].day === 12);
  const noSay = seedOut(days, function (d) {
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: d === 12 ? 'broken' : 'active', trust: 0 }];
  }, { days: 100 });
  const b = AN.analyzeSeed(noSay);
  check('unspoken break is otherBreak', b.belongClears.length === 0 && b.belongOtherBreaks.length === 1);
})();
// 7. Step-2 GO: clear + re-proposal + survival >= 35 + recovery pantry >= 12000.
(function () {
  // Build via analyzeSeed on a synthetic with a clear at d12, proposal d20,
  // re-link d21, survival to d100. Diplomacy recovery needs PF's drop/
  // recovery machinery — instead test judgeGo on summaries directly.
  check('judgeGo GO on passing summary',
    AN.judgeGo([{ seed: 1, instrumentErrors: 0, passesBelongRecovery: true, belongClears: [{}] }]).verdict === 'GO');
  check('judgeGo NO-GO on no pass',
    AN.judgeGo([{ seed: 1, instrumentErrors: 0, passesBelongRecovery: false, belongClears: [{}] }]).verdict === 'NO-GO');
})();
// 8. Cost bar: totals, per-seed excess, median ratio.
(function () {
  const armed = [{ seed: 1, days: 100, starvationDeaths: 1 }, { seed: 2, days: 120, starvationDeaths: 0 }];
  const control = [{ seed: 1, days: 100, starvationDeaths: 1 }, { seed: 2, days: 120, starvationDeaths: 0 }];
  check('cost bar pass on identity', AN.costBar(armed, control).pass === true);
  const bad = [{ seed: 1, days: 50, starvationDeaths: 5 }, { seed: 2, days: 60, starvationDeaths: 0 }];
  check('cost bar fails on excess + median', AN.costBar(bad, control).pass === false);
})();
// 9. Blocking record: proposals to zombie village while active are listed.
(function () {
  const out = seedOut([90, 91, 92], function (d) {
    return [{ id: 'b1', primary: 'village_0', subordinate: 'haven', status: 'active', trust: d >= 91 ? 0 : 5 }];
  }, { days: 200, proposals: [{ day: 92, fn: 'proposeLink', target: 'village_0' }] });
  const z = AN.belongZombies(out);
  check('propsWhileActive recorded', z.length === 1 && z[0].propsWhileActive.length === 1);
})();
console.log('belongzombie proof: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
