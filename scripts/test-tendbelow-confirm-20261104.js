// test-tendbelow-confirm-20261104.js — confirm-arm proof (arm
// sim-tendbelow-confirm-b). Pure-function tests, no harness, no
// Game: (1) rung order + rungJudge incl. the pilot 91506 shape,
// (2) six-leg judgeGo6 incl. rung-fail overturning a pilot GO and
// INSUFFICIENT-DATA carry-through, (3) policy predicate
// boundaries, (4) confirm driver/analyzer wiring vs the pilot
// files (pilot files unedited). Run: node
// scripts/test-tendbelow-confirm-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const AN = require(path.join(__dirname, 'test-tendbelow-confirm-analyze-20261104'));
const POL = require(path.join(__dirname, 'policies', 'leadcourt-tendbelow-b'));

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// Fake pair for judgeGo: only the fields judgeGo/rungJudge read.
function fakePair(seed, o) {
  function sum(days, band) {
    return { days: days, instrumentErrors: 0, firstDiploDay: o.diplo === false ? null : 10,
      holdShare: o.hold === undefined ? 1 : o.hold, postFirstSnapshots: 10,
      everW4: o.w4 === undefined ? true : o.w4, everW5: o.w5 === undefined ? false : o.w5,
      drops: new Array(o.drops === undefined ? 0 : o.drops), tendBelowBar: o.below === undefined ? 10 : o.below,
      tendSeasoned: o.seasoned === undefined ? 0 : o.seasoned, tendUnknown: o.unknown === undefined ? 0 : o.unknown,
      tendTotal: o.tends === undefined ? 10 : o.tends, tendDecisionMatch: o.match === undefined ? true : o.match,
      scaleRank: o.rank, survivalBand: band };
  }
  const base = sum(o.baseDays === undefined ? 100 : o.baseDays, o.baseBand || 'C');
  const armed = sum(o.armedDays === undefined ? 100 : o.armedDays, o.armedBand || 'C');
  base.scaleRank = o.baseRank === undefined ? 'village' : o.baseRank;
  armed.scaleRank = o.armedRank === undefined ? 'village' : o.armedRank;
  if (o.baseDiplo === false) base.firstDiploDay = null;
  if (o.armedDiplo === false) armed.firstDiploDay = null;
  if (o.baseHold !== undefined) base.holdShare = o.baseHold;
  if (o.armedHold !== undefined) armed.holdShare = o.armedHold;
  if (o.baseW4 !== undefined) base.everW4 = o.baseW4;
  if (o.armedW4 !== undefined) armed.everW4 = o.armedW4;
  if (o.baseDrops !== undefined) base.drops = new Array(o.baseDrops);
  if (o.armedDrops !== undefined) armed.drops = new Array(o.armedDrops);
  if (o.baseTends !== undefined) base.tendTotal = o.baseTends;
  if (o.armedTends !== undefined) armed.tendTotal = o.armedTends;
  if (o.armedBelow !== undefined) armed.tendBelowBar = o.armedBelow;
  if (o.armedSeasoned !== undefined) armed.tendSeasoned = o.armedSeasoned;
  if (o.armedUnknown !== undefined) armed.tendUnknown = o.armedUnknown;
  if (o.armedMatch !== undefined) armed.tendDecisionMatch = o.armedMatch;
  if (o.baseMatch !== undefined) base.tendDecisionMatch = o.baseMatch;
  if (o.baseErr !== undefined) base.instrumentErrors = o.baseErr;
  if (o.armedErr !== undefined) armed.instrumentErrors = o.armedErr;
  const regressed = { D: 0, C: 1, B: 2, A: 3 }[armed.survivalBand] < { D: 0, C: 1, B: 2, A: 3 }[base.survivalBand];
  return { seed: seed, base: base, armed: armed,
    deltaDays: armed.days - base.days, regressed: regressed };
}

// (1) Rung order + rungJudge.
t('rung order village<regional<national<global',
  AN.rungOf('village') === 0 && AN.rungOf('regional') === 1 && AN.rungOf('national') === 2 && AN.rungOf('global') === 3);
t('rungOf unknown/null -> null', AN.rungOf('bogus') === null && AN.rungOf(null) === null);
const pilotShape = [fakePair(1, { baseRank: 'global', armedRank: 'regional' }),
  fakePair(2, { baseRank: 'global', armedRank: 'regional' })];
const rPilot = AN.rungJudge(pilotShape);
t('pilot shape: armed 2 vs baseline 0 -> legF FAIL',
  rPilot.armedDowngrades === 2 && rPilot.baselineDowngrades === 0 && rPilot.legF_pass === false);
const balanced = [fakePair(1, { baseRank: 'global', armedRank: 'regional' }),
  fakePair(2, { baseRank: 'regional', armedRank: 'global' })];
const rBal = AN.rungJudge(balanced);
t('balanced 1 down / 1 up -> legF PASS', rBal.armedDowngrades === 1 && rBal.baselineDowngrades === 1 && rBal.legF_pass === true);
const ties = [fakePair(1, { baseRank: 'global', armedRank: 'global' })];
t('tie counts for neither side', AN.rungJudge(ties).armedDowngrades === 0 && AN.rungJudge(ties).baselineDowngrades === 0);
const unknowns = [fakePair(1, { baseRank: null, armedRank: 'global' }),
  fakePair(2, { baseRank: 'global', armedRank: null }),
  fakePair(3, { baseRank: null, armedRank: null })];
t('unknown ranks listed, counted for neither',
  eq(AN.rungJudge(unknowns).unknownRankSeeds, [1, 2, 3]) && AN.rungJudge(unknowns).armedDowngrades === 0);
const natCounts = [fakePair(1, { baseRank: 'national', armedRank: 'global' })];
t('national+/global counts reported',
  AN.rungJudge(natCounts).nationalBase === 1 && AN.rungJudge(natCounts).nationalArmed === 1
  && AN.rungJudge(natCounts).globalBase === 0 && AN.rungJudge(natCounts).globalArmed === 1);

// (2) Six-leg judge.
const goPairs = [];
for (let i = 0; i < 16; i++) goPairs.push(fakePair(91301 + i, {}));
const jGo = AN.judgeGo6(goPairs);
t('all legs pass -> GO', jGo.verdict === 'GO' && jGo.legF_pass === true && jGo.legA_noRegression === true);
const rungFailPairs = goPairs.slice();
rungFailPairs[0] = fakePair(91301, { baseRank: 'global', armedRank: 'regional' });
rungFailPairs[1] = fakePair(91302, { baseRank: 'global', armedRank: 'regional' });
const jRungFail = AN.judgeGo6(rungFailPairs);
t('rung fail overturns pilot GO -> NO-GO',
  jRungFail.verdict === 'NO-GO' && jRungFail.legF_pass === false && jRungFail.legA_noRegression === true);
const regPairs = goPairs.slice();
regPairs[0] = fakePair(91301, { baseBand: 'C', armedBand: 'D' });
t('band regression -> NO-GO (leg a carried)', AN.judgeGo6(regPairs).verdict === 'NO-GO');
const premPairs = goPairs.slice();
premPairs[0] = fakePair(91301, { armedSeasoned: 1 });
t('armed seasoned tend -> INSUFFICIENT-DATA (premise carried)',
  AN.judgeGo6(premPairs).verdict === 'INSUFFICIENT-DATA');
const unkPairs = goPairs.slice();
unkPairs[0] = fakePair(91301, { baseRank: null, armedRank: 'global' });
unkPairs[1] = fakePair(91302, { baseRank: null, armedRank: 'global' });
unkPairs[2] = fakePair(91303, { baseRank: null, armedRank: 'global' });
t('>2 unknown ranks -> INSUFFICIENT-DATA', AN.judgeGo6(unkPairs).verdict === 'INSUFFICIENT-DATA');
const unk2Pairs = goPairs.slice();
unk2Pairs[0] = fakePair(91301, { baseRank: null, armedRank: 'global' });
unk2Pairs[1] = fakePair(91302, { baseRank: null, armedRank: 'global' });
t('exactly 2 unknown ranks -> still judged (GO)', AN.judgeGo6(unk2Pairs).verdict === 'GO');
const leverPairs = goPairs.slice();
leverPairs.forEach(function (p, i) { leverPairs[i] = fakePair(91301 + i, { armedBelow: 0, armedTends: 0 }); });
t('zero below-bar tends -> INSUFFICIENT-DATA (lever never fired)',
  AN.judgeGo6(leverPairs).verdict === 'INSUFFICIENT-DATA');

// (3) Policy predicate boundaries (mock Game: scholar day only).
function mockGame(day) { return { state: { scholar: { day: day } } }; }
t('predicate: age 29 trust 99 -> below', POL.belowSeasonedBar(mockGame(100), { day: 71, trust: 99 }) === true);
t('predicate: age 30 trust 39 -> below', POL.belowSeasonedBar(mockGame(100), { day: 70, trust: 39 }) === true);
t('predicate: age 30 trust 40 -> seasoned (NOT below)', POL.belowSeasonedBar(mockGame(100), { day: 70, trust: 40 }) === false);
t('predicate: age 31 trust 40 -> seasoned (NOT below)', POL.belowSeasonedBar(mockGame(100), { day: 69, trust: 40 }) === false);
t('policy id is leadcourt-tendbelow-b', POL.leadcourtTendbelowB.id === 'leadcourt-tendbelow-b');

// (4) Wiring: confirm driver/analyzer carry the confirm names;
// pilot files carry no confirm names (unedited).
const cDriver = fs.readFileSync(path.join(__dirname, 'test-tendbelow-confirm-driver-20261104.js'), 'utf8');
const pDriver = fs.readFileSync(path.join(__dirname, 'test-tendbelow-driver-20261104.js'), 'utf8');
const cAn = fs.readFileSync(path.join(__dirname, 'test-tendbelow-confirm-analyze-20261104.js'), 'utf8');
t('confirm driver: confirm outDir', cDriver.indexOf('perseed-tendbelow-confirm-b') !== -1);
t('confirm driver: confirm RUN names', cDriver.indexOf('tendbelow-confirm-base') !== -1 && cDriver.indexOf('tendbelow-confirm-armed') !== -1);
t('confirm driver: confirm file prefix', cDriver.indexOf("'tendbelow-confirm-s'") !== -1);
t('confirm driver: requires confirm analyzer', cDriver.indexOf('test-tendbelow-confirm-analyze-20261104') !== -1);
t('pilot driver unedited (no confirm names)', pDriver.indexOf('tendbelow-confirm') === -1);
t('confirm analyzer: rung guard present', cAn.indexOf('rungJudge') !== -1 && cAn.indexOf('judgeGo6') !== -1);
const prereg = fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-11-04', 'sim-tendbelow-confirm-b-prereg.md'), 'utf8');
t('prereg states band + leg (f)', prereg.indexOf('91301') !== -1 && prereg.indexOf('91316') !== -1 && prereg.indexOf('(f) RUNG GUARD') !== -1);

console.log(pass + '/' + (pass + fail) + ' PASS');
if (fail) process.exit(1);
