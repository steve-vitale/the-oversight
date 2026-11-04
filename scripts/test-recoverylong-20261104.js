// test-recoverylong-20261104.js — recoverylong analyzer proof
// (arm sim-recoverylong-b). Fixture-only: no Game. Covers clear
// detection (trust-0 break = clear, trust>0 break = other),
// GO pass + each single-leg failure, and the cost-bar judge.
// Usage: node scripts/test-recoverylong-20261104.js
'use strict';
const AN = require('./test-recoverylong-analyze-20261104');
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name); }
}
function snap(day, diplo, link, pantry) {
  return { day: day, standing: { diplomacy: diplo },
    linkFunnel: { detail: link ? [link] : [], seasoned: 0, regionalPlus: 0 },
    pantryKcal: pantry == null ? 1000 : pantry, readiness5: { ready: false } };
}
function link(id, status, trust, seasoned) {
  return { id: id, primary: 'haven', subordinate: 'village_2', status: status, trust: trust, seasoned: !!seasoned };
}
// Build a run: link active trust 30 until d109 (trust 0 at d109 in
// clear cases), broken from d110, re-seasoned active at d145.
function build(opts) {
  const o = opts || {};
  const daily = [];
  for (let d = 100; d <= 149; d++) {
    let diplo = 5, L = link('L1', 'active', 30, true), pantry = 1000;
    if (o.noClear) { /* link stays healthy, diplo stays 5 */ }
    else if (d === 109) { L = link('L1', 'active', 0, false); }
    else if (d >= 110 && d < 145) { diplo = 0; L = link('L1', 'broken', 0, false); }
    else if (d >= 145) { diplo = 5; L = link('L1', 'active', 40, true); pantry = (o.pantry == null ? 15000 : o.pantry); }
    else if (d < 109) { L = link('L1', 'active', 30, true); }
    if (o.noClear) { diplo = 5; L = link('L1', 'active', 50, true); }
    if (o.trustBreak && d >= 110 && d < 145) { L = link('L1', 'broken', 20, false); }
    if (o.trustBreak && d === 109) { L = link('L1', 'active', 20, false); }
    daily.push(snap(d, diplo, L, pantry));
  }
  return { seed: 99801, policy: 'leadcourt', run: 'recoverylong-armed',
    days: (o.days == null ? 180 : o.days), villageLost: true, won: false,
    daily: daily,
    proposalEvents: o.noRepro ? [] : [{ day: 120, fn: 'proposeLink', target: 'village_2' }],
    linkFormedEvents: o.noRepro ? [] : [{ day: 121, link: { id: 'L2' } }],
    courtshipEvents: [], deathEvents: o.deaths || [],
    sayLines: o.noClear ? [] : [{ day: 109, via: 'say', line: '🍂 The bond with Thornfield has faded to nothing — no trust left.' }],
    instrumentErrors: [] };
}
const passOut = build({});
const sPass = AN.analyzeSeed(passOut);
check('pass fixture has 1 clear d110', sPass.clears.length === 1 && sPass.clears[0].day === 110);
check('pass fixture survival 70', sPass.survivalAfterClear === 70);
check('pass fixture reSeason pantry 15000', sPass.reSeasonPantry === 15000);
check('pass fixture passes', sPass.passesRecoveryLong === true);
check('pass fixture say day 109', sPass.sayClearDay === 109);
const short = AN.analyzeSeed(build({ days: 130 }));
check('short survival fails', short.survivalAfterClear === 20 && short.passesRecoveryLong === false);
const poor = AN.analyzeSeed(build({ pantry: 8000 }));
check('low pantry fails', poor.reSeasonPantry === 8000 && poor.passesRecoveryLong === false);
const norepro = AN.analyzeSeed(build({ noRepro: true }));
check('no reproposal/relink fails', norepro.passesRecoveryLong === false);
const noclear = AN.analyzeSeed(build({ noClear: true }));
check('no clear fails', noclear.clears.length === 0 && noclear.passesRecoveryLong === false);
const tbreak = AN.analyzeSeed(build({ trustBreak: true }));
check('trust>0 break is otherBreak not clear', tbreak.clears.length === 0 && tbreak.otherBreaks.length === 1);
check('judge GO on pass', AN.judgeGo([sPass]).verdict === 'GO');
check('judge NO-GO on fails', AN.judgeGo([short, poor, norepro]).verdict === 'NO-GO');
const armed = [{ seed: 1, days: 100, starvationDeaths: 1, instrumentErrors: 0 },
  { seed: 2, days: 120, starvationDeaths: 0, instrumentErrors: 0 }];
const control = [{ seed: 1, days: 100, starvationDeaths: 0, instrumentErrors: 0 },
  { seed: 2, days: 110, starvationDeaths: 0, instrumentErrors: 0 }];
const cb = AN.costBar(armed, control);
check('cost bar pass (starv 1<=2, median 110>=88)', cb.pass === true && cb.armedMedian === 110 && cb.controlMedian === 105);
const cbFail = AN.costBar(
  [{ seed: 1, days: 50, starvationDeaths: 5, instrumentErrors: 0 }],
  [{ seed: 1, days: 100, starvationDeaths: 0, instrumentErrors: 0 }]);
check('cost bar fails on starvation + median', cbFail.pass === false && cbFail.notes.length === 3);
console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
