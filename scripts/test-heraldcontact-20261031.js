#!/usr/bin/env node
// test-heraldcontact-20261031.js — sim-heraldcontact-a proof test.
//
// SYNTHETIC fixtures only (no band seeds, no sims): exercises the
// analyzer's join, commit-block taxonomy, ceiling arithmetic, cluster
// collapse, and per-day re-face counting exactly as the prereg
// defines them. Exits non-zero on any failure.
'use strict';
const A = require('./heraldcontact-analyze-20261031');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}
function snap(over) {
  const base = { day: 100, have: 0, need: 10, musterExists: false,
    alliesRaw: 0, alliesUnique: 0, havenValid: 0, readyManual: false,
    readyGame: false, omenStage: null, omenDay: null,
    links: [
      { villageId: 'v1', name: 'Stonebridge', trust: 64, opinion: 14, arrears: 0, quota: 2, facesFree: 5, already: 0, wouldRefuse: false, wouldYield: 2 },
      { villageId: 'v2', name: 'Thornfield', trust: 59, opinion: 14, arrears: 0, quota: 2, facesFree: 0, already: 0, wouldRefuse: false, wouldYield: 0 },
    ],
    callYield: 2, volunteers: 2 };
  return Object.assign(base, over || {});
}

// 1. Commit-block taxonomy, in prereg order.
check('block NO-OMEN beats stage', A.commitBlock(snap({ omenStage: null })) === 'NO-OMEN');
check('block OMEN-STAGE-LT-2', A.commitBlock(snap({ omenStage: 1 })) === 'OMEN-STAGE-LT-2');
check('block HAVEN-CAP', A.commitBlock(snap({ omenStage: 2, havenValid: 3 })) === 'HAVEN-CAP');
check('block NO-VOLUNTEERS', A.commitBlock(snap({ omenStage: 2, volunteers: 0 })) === 'NO-VOLUNTEERS');
check('block UNBLOCKED', A.commitBlock(snap({ omenStage: 2, volunteers: 2 })) === 'UNBLOCKED');
check('block UNBLOCKED with null volunteers is not NO-VOLUNTEERS (null != 0)',
  A.commitBlock(snap({ omenStage: 2, volunteers: null })) === 'UNBLOCKED');

// 2. Ceiling arithmetic: muster-a state (yield 2, no omen) -> ceiling 2.
const c0 = A.ceilingIfCalledPlusCommit(snap({}));
check('ceiling no-omen = 2 (commit blocked adds 0)',
  c0.totalIfCalled === 2 && c0.commitAdd === 0 && c0.ceiling === 2, JSON.stringify(c0));
// Located state, 2 yield + 2 volunteers + haven 0 -> ceiling 4 (still < 10).
const c1 = A.ceilingIfCalledPlusCommit(snap({ omenStage: 2, volunteers: 2 }));
check('ceiling located = 2 + 2 = 4', c1.ceiling === 4, JSON.stringify(c1));
// Trusted-link state: quota 6, 6 free -> yield 6; +3 haven -> 9, still < 10.
const trusted = snap({ omenStage: 2, volunteers: 3, callYield: 6,
  links: [{ villageId: 'v1', name: 'Stonebridge', trust: 80, opinion: 14, arrears: 0, quota: 6, facesFree: 6, already: 0, wouldRefuse: false, wouldYield: 6 }] });
const c2 = A.ceilingIfCalledPlusCommit(trusted);
check('ceiling trusted single link = 6 + 3 = 9 (< 10)',
  c2.totalIfCalled === 6 && c2.commitAdd === 3 && c2.ceiling === 9, JSON.stringify(c2));

// 3. Join + cluster collapse: 4 same-day refusals, one state.
const row = {
  seed: 99999,
  attempts: [100, 100, 100, 100].map((d, i) => ({ day: d, mid: 'herald', cls: 'REFUSED', reason: 'MUSTER-GATE', gameOutcomes: [{ outcome: 'refused', detail: { gate: 'muster', have: 0, need: 10 } }] })),
  musterRefusals: [snap({}), snap({}), snap({}), snap({})],
  fieldFights: [], kills: [], musterCalls: {}, instrumentErrors: [], musterErrs: 0,
};
const joined = A.joinRefusals(row);
check('join 4/4 same-day refusals', joined.length === 4 && joined.every(j => j.joined));
const an = A.analyzeSeed(Object.assign({}, row, { national: 0, table: 0, won: 0, maxWave: 4, wave4: 1, wave5: 0, gameDays: 120, endReason: 'village-lost', endOmenStage: null, endMusterExists: false }));
check('one cluster from 4 same-day refusals', an.clusters.length === 1, JSON.stringify(an.clusters.length));
check('cluster reFaceCount = 4', an.clusters[0] && an.clusters[0].reFaceCount === 4);
check('cluster perDay max = 4', an.maxPerDay === 4);
check('completeness 4/4', an.complete === 4 && an.heraldRef === 4);
check('ready agreement 4/4', an.readyAgree === 4 && an.readyTotal === 4);
check('gameOutcomeMatch 4/4 (real shape: gate inside detail)', an.gameOutcomeMatch === 4);
check('cluster ceiling range recorded', an.clusters[0] && an.clusters[0].ceilings.length === 4 && Math.min.apply(null, an.clusters[0].ceilings) === 2, JSON.stringify(an.clusters[0] && an.clusters[0].ceilings));

// 4. Distinct states stay distinct: different omen stage -> 2 clusters.
const row2 = Object.assign({}, row, {
  attempts: [{ day: 100, mid: 'herald', cls: 'REFUSED', reason: 'MUSTER-GATE', gameOutcomes: [] },
             { day: 110, mid: 'herald', cls: 'REFUSED', reason: 'MUSTER-GATE', gameOutcomes: [] }],
  musterRefusals: [snap({ day: 100 }), snap({ day: 110, omenStage: 2 })],
});
const an2 = A.analyzeSeed(Object.assign({}, row2, { national: 0, table: 0, won: 0, maxWave: 4, wave4: 1, wave5: 0, gameDays: 120, endReason: 'village-lost', endOmenStage: 2, endMusterExists: false }));
check('two clusters for two omen stages', an2.clusters.length === 2, JSON.stringify(an2.clusters.length));
check('feast-draw regression counter', (() => {
  const r3 = Object.assign({}, row, { attempts: [{ day: 100, mid: 'herald', cls: 'REFUSED', reason: 'MUSTER-GATE', caller: 'feast-draw', gameOutcomes: [] }] });
  return A.analyzeSeed(Object.assign({}, r3, { national: 0, table: 0, won: 0, maxWave: 4, wave4: 1, wave5: 0, gameDays: 120, endReason: 'village-lost', endOmenStage: null, endMusterExists: false })).feastDrawHerald === 1;
})());

// 5. Asymmetry table: field fights counted separately from TB; kills by channel.
const row4 = Object.assign({}, row, {
  attempts: [{ day: 100, mid: 'herald', cls: 'FOUGHT', end: 'lost', gameOutcomes: [] }],
  musterRefusals: [],
  fieldFights: [{ mid: 'herald', outcome: 'vFlee' }, { mid: 'herald', outcome: 'vFlee' }],
  kills: [],
});
const an4 = A.analyzeSeed(Object.assign({}, row4, { national: 0, table: 0, won: 0, maxWave: 4, wave4: 1, wave5: 0, gameDays: 120, endReason: 'village-lost', endOmenStage: 2, endMusterExists: false }));
check('asymmetry: 1 TB fought, 2 field, 0 kills either channel',
  an4.heraldFought === 1 && an4.heraldFF === 2 && an4.heraldTbKills === 0 && an4.heraldFieldKills === 0);

// 6. Proper even-n median (herald-b band: middle two 102/111 -> 106.5).
const medRows = [34, 46, 90, 90, 90, 91, 102, 102, 111, 113, 118, 122, 126, 132, 135, 139].map((d, i) => ({
  seed: 90000 + i, attempts: [], fieldFights: [], kills: [], musterRefusals: [],
  national: 0, table: 0, won: 0, maxWave: 4, wave4: 1, wave5: 0, gameDays: d,
  endReason: 'village-lost', endOmenStage: null, endMusterExists: false,
  instrumentErrors: [], musterErrs: 0, musterCalls: {},
}));
const medOut = A.analyzeAll(medRows);
check('median even-n = mean of middle two (106.5)', medOut.wall.medianSurvival === 106.5, JSON.stringify(medOut.wall.medianSurvival));

// 7. cross-seed clusters must NOT collapse across seeds — two
// seeds with identical day/yield/block stay two clusters, and
// analyzeAll counts both (the generalization question is per-seed).
const crossRows = [99901, 99902].map((sd) => ({
  seed: sd, attempts: [{ day: 100, mid: 'herald', cls: 'REFUSED', reason: 'MUSTER-GATE', gameOutcomes: [{ outcome: 'refused', detail: { gate: 'muster', have: 0, need: 10 } }] }],
  musterRefusals: [snap({ day: 100, omenStage: 2, callYield: 9, volunteers: 2 })],
  fieldFights: [], kills: [], musterCalls: {}, instrumentErrors: [], musterErrs: 0,
  national: 0, table: 0, won: 0, maxWave: 4, wave4: 1, wave5: 0, gameDays: 120,
  endReason: 'village-lost', endOmenStage: 2, endMusterExists: false,
}));
const crossOut = A.analyzeAll(crossRows);
check('cross-seed: identical states on 2 seeds = 2 clusters, not 1',
  crossOut.clusters.length === 2 && crossOut.clusters[0].seed !== crossOut.clusters[1].seed,
  JSON.stringify(crossOut.clusters.map(c => c.seed)));

// 8. heraldcontact: screen selection rule (prereg, binding).
const S = require('./heraldcontact-screen-20261031');
const selRows = [
  { seed: 99911, gameDays: 90, won: 1 },    // day-90 win: censored, NOT selected early
  { seed: 99912, gameDays: 120, won: 0 },   // tier A boundary: exactly 120 un-won
  { seed: 99913, gameDays: 200, won: 0 },   // tier A
  { seed: 99914, gameDays: 120, won: 1 },   // won day 120: NOT tier B (needs > 120)
  { seed: 99915, gameDays: 150, won: 1 },   // tier B: late win
  { seed: 99916, gameDays: 119, won: 0 },   // tier C: just under the line
  { seed: 99917, gameDays: 45, won: 0 },    // tier C, short
  { seed: 99918, gameDays: 190, won: 0 },   // tier A
  { seed: 99919, gameDays: 130, won: 0 },   // tier A
  { seed: 99920, gameDays: 201, won: 0 },   // tier A
];
const sel = S.selectBand(selRows);
check('selection tiers counted', sel.tierCounts.A === 5 && sel.tierCounts.B === 1 && sel.tierCounts.C === 2,
  JSON.stringify(sel.tierCounts));
check('selection tier order A then B then C (seed-asc within A/B)',
  JSON.stringify(sel.pilot) === JSON.stringify([99912, 99913, 99918, 99919, 99920, 99915, 99916, 99917]),
  JSON.stringify(sel.pilot));
check('selection excludes censored winners entirely (day-90 win, won-day-120 never selected)',
  sel.confirm.length === 0 && sel.pilot.indexOf(99911) === -1 && sel.pilot.indexOf(99914) === -1,
  JSON.stringify({ pilot: sel.pilot, confirm: sel.confirm }));
check('selection confirmN is 12 when tier A < 24', sel.confirmN === 12);
const bigA = [];
for (let i = 0; i < 25; i++) bigA.push({ seed: 99000 + i, gameDays: 150 + i, won: 0 });
const selBig = S.selectBand(bigA);
check('selection confirmN is 16 when tier A >= 24',
  selBig.confirmN === 16 && selBig.pilot.length === 8 && selBig.confirm.length === 16,
  JSON.stringify({ n: selBig.confirmN, p: selBig.pilot.length, c: selBig.confirm.length }));
check('selection never picks a won day-90 seed ahead of tier A',
  sel.pilot.indexOf(99911) === -1 || sel.pilot.indexOf(99912) < sel.pilot.indexOf(99911),
  JSON.stringify(sel.pilot));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
