#!/usr/bin/env node
// test-w5doormeasure-20261020.js — proof for the sim-w5door-measure wave-5
// unlock-path diagnostic instrument (flesh-out loop arm, 20261020T0415Z).
//
// (a) BAR-SHAPE FIXTURES: the bars the instrument measures match the live
//     engine's standingCfg + waveLedgerCfg — fails LOUD if the game bar
//     moves under the diagnostic.
// (b) CLASSIFICATION FIXTURES: synthetic daily path histories -> the
//     pre-registered stall class + attempt-window outcomes (known answers,
//     mirroring sim-w5census F1–F9 semantics).
// (c) BLOCKER FIXTURES: synthetic runs exercising each B1..B9 named blocker,
//     plus the fail-loud on a run with 0 named blockers (the PRIMARY gate).
// (d) SMOKE: both policies drive with path records on the substrate.
// (e) DET: instrument-on vs instrument-off byte-identical (via the probe's
//     DET mode — 2 seeds x 60d, both policies).
// (f) E4 FIXTURE: decoupled kill/faced events detected from synthetic recs.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 node scripts/test-w5doormeasure-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const AN = require('./analyze-w5doormeasure-20261020');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

const SWEEP = path.join(__dirname, 'probe-w5doormeasure-20261020.js');
function sweepEnv(extra) {
  return Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
    WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1',
  }, extra);
}

// Synthetic daily rec builder for fixtures.
function synRec(d, o) {
  return Object.assign({
    d, uw: 1, peak: 0, raw: 0, war: 0, dip: 0, plenty: 0, warPts: 0, links: 0, feasts: 0,
    cap: 0, l1: 0, l2: 0, l3: 0, l4: 0, l5: 0,
    r5: { arm: 0, wpn: 0, trk: 0, vet: 0, short: ['veterans'], rdy: false },
    r4: { arm: 3, wpn: 5, trk: 3, vet: 1, short: [], rdy: true },
    def4: false, def5: false, gf5: false,
    faced: { 1: 5, 2: 5, 3: 4, 4: 0, 5: 0 }, wEngaged4: 0,
    newKills: [], newFaced: [], _logLen: 0, _facedKeys: [],
    deed: null, alive: true, won: false,
  }, o);
}
function synRun(recs, end) {
  return Object.assign({
    seed: 1, policyId: 'leadfeast', gameDays: 180, endReason: 'survived',
    won: false, national: false, table: false, exiled: false,
    maxWave: 1, wave2Day: null, wave3Day: null, wave4Day: null, wave5Day: null,
    recs, endRec: recs[recs.length - 1], killLog: [], deathList: [], deaths: {},
  }, end);
}

async function barShape() {
  // The bars the instrument measures, pinned against the live engine.
  const { Game } = await loadGame({ seed: 65111, mode: 'w5doormeasure-proof', fullTelemetry: false });
  await setupGame(Game);
  const cfg = Game.standingCfg();
  check('bar t4=100', cfg.t4 === 100, `t4=${cfg.t4}`);
  check('bar t5=200', cfg.t5 === 200, `t5=${cfg.t5}`);
  check('bar plentyCapT5=100', cfg.plentyCapT5 === 100, `cap=${cfg.plentyCapT5}`);
  const d4 = cfg.readyDemand[4], d5 = cfg.readyDemand[5];
  check('bar w4 demand {3@P10,5,3,1}', d4.armored === 3 && d4.armorP === 10 && d4.armed === 5 && d4.tricks === 3 && d4.veterans === 1, JSON.stringify(d4));
  check('bar w5 demand {4@P15,6,3,2}', d5.armored === 4 && d5.armorP === 15 && d5.armed === 6 && d5.tricks === 3 && d5.veterans === 2, JSON.stringify(d5));
  const lc = Game.waveLedgerCfg();
  check('ledger bars {1:5,2:4,3:4,4:3,5:2}', lc.barsPerWave[1] === 5 && lc.barsPerWave[2] === 4 && lc.barsPerWave[3] === 4 && lc.barsPerWave[4] === 3 && lc.barsPerWave[5] === 2, JSON.stringify(lc.barsPerWave));
  check('ledger day floors 8/25', lc.wave2DayFloor === 8 && lc.dayFloor === 25, `${lc.wave2DayFloor}/${lc.dayFloor}`);
  for (const fn of ['villageStanding', 'standingPlentyCappedTotal', 'waveUnlockReady', 'standingDeferral', 'waveLedgerPoints', 'deedGateReady', 'unlockedWave', '_standingPeakWave', 'waveEngaged', 'deedState']) {
    check(`api ${fn} exists`, typeof Game[fn] === 'function', typeof Game[fn]);
  }
}

function classificationFixtures() {
  // F1: never-progressed — peak never reaches 4, def5 never true.
  let recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 40 + d, cap: 40 + d, uw: d > 100 ? 3 : 1, peak: 0 }));
  let c = AN.classify(synRun(recs, { endReason: 'survived' }));
  check('F1 never-progressed', c.stallClass === 'never-progressed', c.stallClass);
  // F2: progressed-but-stalled — w4 unlocked d60, def5 never true, cap<200.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 60 + d, cap: 60 + d, uw: d >= 60 ? 4 : 3, peak: d >= 60 ? 4 : 0 }));
  c = AN.classify(synRun(recs, { endReason: 'survived' }));
  check('F2 progressed-but-stalled', c.stallClass === 'progressed-but-stalled', c.stallClass);
  // F3: engaged-but-failed — deferral window d80-120, regressed, died d150.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: d < 80 ? 100 + d : d <= 120 ? 210 : 150, cap: d < 80 ? 100 + d : d <= 120 ? 205 : 150,
    uw: 4, peak: 4, def5: d >= 80 && d <= 120,
  }));
  const r3 = synRun(recs.slice(0, 150), { gameDays: 150, endReason: 'village-lost' });
  c = AN.classify(r3);
  check('F3 engaged-but-failed', c.stallClass === 'engaged-but-failed', c.stallClass);
  const atts = AN.attemptsOf(r3);
  check('F3 one attempt d80-120', atts.length === 1 && atts[0].start === 80 && atts[0].end === 120, JSON.stringify(atts.map(a => [a.start, a.end, a.outcome])));
  check('F3 attempt outcome regressed', atts[0].outcome === 'regressed', atts[0].outcome);
  // F4: unlocked — def5 d80-90, peak 5 at d91.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: 205, uw: d >= 91 ? 5 : 4, peak: d >= 91 ? 5 : 4, def5: d >= 80 && d < 91, gf5: d >= 91,
  }));
  const r4 = synRun(recs, { wave5Day: 91, maxWave: 5 });
  c = AN.classify(r4);
  check('F4 unlocked', c.stallClass === 'unlocked', c.stallClass);
  const a4 = AN.attemptsOf(r4);
  check('F4 attempt released', a4.length === 1 && a4[0].outcome === 'released', JSON.stringify(a4.map(a => a.outcome)));
  // F5: engaged-but-failed, door held to horizon — outcome horizon.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 100 }));
  const r5 = synRun(recs, { endReason: 'survived' });
  c = AN.classify(r5);
  check('F5 engaged-but-failed', c.stallClass === 'engaged-but-failed', c.stallClass);
  const a5 = AN.attemptsOf(r5);
  check('F5 attempt outcome horizon', a5.length === 1 && a5[0].outcome === 'horizon', JSON.stringify(a5.map(a => a.outcome)));
  // F6: w5door-without-w4 sub-shape — def5 true but peak never 4.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 3, peak: 0, def5: d >= 120 }));
  const r6 = synRun(recs, { endReason: 'survived' });
  c = AN.classify(r6);
  check('F6 engaged-but-failed + w5door-without-w4', c.stallClass === 'engaged-but-failed' && c.stallSub === 'w5door-without-w4', `${c.stallClass}/${c.stallSub}`);
  // F7: died in window — def5 true to run end, endReason village-lost.
  recs = [];
  for (let d = 1; d <= 150; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 80 }));
  const r7 = synRun(recs, { gameDays: 150, endReason: 'village-lost' });
  const a7 = AN.attemptsOf(r7);
  check('F7 attempt outcome died', a7.length === 1 && a7[0].outcome === 'died', JSON.stringify(a7.map(a => a.outcome)));
  // F8: endRec-boundary — daily series lags run end; endRec is the terminal
  // observation (the sim-w5census F9 lesson).
  recs = [];
  for (let d = 1; d <= 179; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 100 }));
  const endR = synRec(180, { raw: 210, cap: 205, uw: 4, peak: 4, def5: true });
  const r8 = synRun(recs, { gameDays: 180, endReason: 'survived', endRec: endR });
  const a8 = AN.attemptsOf(r8);
  check('F8 endRec extends window', a8.length === 1 && a8[0].end === 180 && a8[0].outcome === 'horizon', JSON.stringify(a8.map(a => [a.start, a.end, a.outcome])));
  // F9: two separate windows.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: (d >= 40 && d <= 60) || (d >= 100 && d <= 130) ? 205 : 150,
    uw: 4, peak: 4, def5: (d >= 40 && d <= 60) || (d >= 100 && d <= 130),
  }));
  const r9 = synRun(recs, { endReason: 'survived' });
  const a9 = AN.attemptsOf(r9);
  check('F9 two windows regressed/regressed', a9.length === 2 && a9.every(a => a.outcome === 'regressed'), JSON.stringify(a9.map(a => [a.start, a.end, a.outcome])));
  // E1: leg pacing — l1>=5 at d20, day floor d8, unlock d25.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { l1: d >= 20 ? 5 : 0, uw: d >= 25 ? 2 : 1 }));
  const legs = AN.legPacing(synRun(recs, { endReason: 'survived', wave2Day: 25 }));
  check('E1 w2barDay=20 floorDay=8 unlock=25', legs.w2barDay === 20 && legs.w2floorDay === 8 && legs.w2unlockDay === 25, JSON.stringify(legs));
}

function blockerFixtures() {
  // B1: standing-short — peak 4, def5 never true, capped stuck below 200.
  // (Engine-consistent: with capped<200, def5 never fires.)
  let recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 60 + d, cap: 150, uw: 4, peak: 4, war: 20, dip: 30, plenty: 100 }));
  let r = AN.attribute(synRun(recs, { endReason: 'survived', wave4Day: 60, maxWave: 4 }));
  check('B1 standing-short named', r.blockers.blockers.some(b => b.code === 'B1'), JSON.stringify(r.blockers.blockers));
  // B2/B3/B4: def5 true, veterans+armor+weapons short terminally; B7 died.
  recs = [];
  for (let d = 1; d <= 150; d++) recs.push(synRec(d, {
    raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 80, alive: false,
    r5: { arm: 1, wpn: 2, trk: 5, vet: 0, short: ['armor', 'weapons', 'veterans'], rdy: false },
  }));
  r = AN.attribute(synRun(recs, { gameDays: 150, endReason: 'village-lost', wave4Day: 60, maxWave: 4 }));
  const codes = r.blockers.blockers.map(b => b.code);
  check('B2+B3+B4 named', codes.includes('B2') && codes.includes('B3') && codes.includes('B4'), codes.join(','));
  check('B7 died-in-window named', codes.includes('B7'), codes.join(','));
  check('not unattributed', !r.blockers.unattributed, codes.join(','));
  // B5: tricks short.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 80,
    r5: { arm: 4, wpn: 6, trk: 1, vet: 2, short: ['tricks'], rdy: false },
  }));
  r = AN.attribute(synRun(recs, { endReason: 'survived', wave4Day: 60, maxWave: 4 }));
  check('B5 readiness-tricks named', r.blockers.blockers.some(b => b.code === 'B5'), JSON.stringify(r.blockers.blockers));
  // B6: w4 never faced despite peak>=4 and cap>=200.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 80, wEngaged4: 0, faced: { 1: 5, 2: 5, 3: 4, 4: 0, 5: 0 },
    r5: { arm: 4, wpn: 6, trk: 5, vet: 2, short: [], rdy: true },
  }));
  r = AN.attribute(synRun(recs, { endReason: 'survived', wave4Day: 60, maxWave: 4 }));
  check('B6 w4-never-faced named', r.blockers.blockers.some(b => b.code === 'B6'), JSON.stringify(r.blockers.blockers));
  // B8: regressed — window closed early, village alive.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: d <= 100 ? 210 : 150, cap: d <= 100 ? 205 : 150, uw: 4, peak: 4, def5: d >= 60 && d <= 100,
    r5: { arm: 4, wpn: 6, trk: 5, vet: 2, short: [], rdy: true },
  }));
  r = AN.attribute(synRun(recs, { endReason: 'survived', wave4Day: 60, maxWave: 4 }));
  check('B8 regressed named', r.blockers.blockers.some(b => b.code === 'B8'), JSON.stringify(r.blockers.blockers));
  // B9: horizon — window open at run end.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 100,
    r5: { arm: 4, wpn: 6, trk: 5, vet: 2, short: [], rdy: true },
  }));
  r = AN.attribute(synRun(recs, { endReason: 'survived', wave4Day: 60, maxWave: 4 }));
  check('B9 horizon named', r.blockers.blockers.some(b => b.code === 'B9'), JSON.stringify(r.blockers.blockers));
  // FAIL-LOUD mechanism: with attributeBlockers stubbed to return an
  // unattributed eligible run, runCorpus must exit 1 (the PRIMARY gate
  // fires on real data exactly this way).
  {
    const tmpE = path.join(__dirname, '..', 'evidence', '2026-10-20', 'tmp-failloud');
    const tmpO = path.join(__dirname, '..', 'evidence', '2026-10-20', 'tmp-failloud-out');
    fs.rmSync(tmpE, { recursive: true, force: true }); fs.rmSync(tmpO, { recursive: true, force: true });
    fs.mkdirSync(path.join(tmpE, 'leadfeast'), { recursive: true });
    const recs = [];
    for (let d = 1; d <= 10; d++) recs.push(synRec(d, { uw: 4, peak: 4 }));
    fs.writeFileSync(path.join(tmpE, 'leadfeast', 's1.json'), JSON.stringify(synRun(recs, { wave4Day: 5, maxWave: 4 })));
    const orig = AN.attributeBlockers;
    AN.attributeBlockers = () => ({ blockers: [], unattributed: true });
    let rc;
    try { rc = AN.runCorpus(tmpE, tmpO).exitCode; } finally { AN.attributeBlockers = orig; }
    fs.rmSync(tmpE, { recursive: true, force: true }); fs.rmSync(tmpO, { recursive: true, force: true });
    check('FAIL-LOUD: runCorpus exits 1 on unattributed', rc === 1, `exit=${rc}`);
    // And the clean path exits 0.
    fs.mkdirSync(path.join(tmpE, 'leadfeast'), { recursive: true });
    fs.writeFileSync(path.join(tmpE, 'leadfeast', 's1.json'), JSON.stringify(synRun(recs, { wave4Day: 5, maxWave: 4 })));
    let rc2;
    try { rc2 = AN.runCorpus(tmpE, tmpO).exitCode; } finally { fs.rmSync(tmpE, { recursive: true, force: true }); fs.rmSync(tmpO, { recursive: true, force: true }); }
    check('runCorpus exits 0 when attributed', rc2 === 0, `exit=${rc2}`);
  }
  check('na for non-eligible run', AN.attributeBlockers(synRun([synRec(1, {})], {}), { maxPeak: 3 }).na === true, '');
  // B0: a won run with peak<5 is attributed informationally (not a blocker).
  {
    const recs = [];
    for (let d = 1; d <= 100; d++) recs.push(synRec(d, { uw: 4, peak: 4, won: d >= 90 }));
    const r = AN.attribute(synRun(recs, { gameDays: 100, endReason: 'survived', wave4Day: 60, maxWave: 4, won: true }));
    check('B0 won-before-door attributed', r.blockers.blockers.some(b => b.code === 'B0') && !r.blockers.unattributed, JSON.stringify(r.blockers.blockers));
  }
}

function e4Fixture() {
  // Decoupled events: a wave-4 kill on day 50 while uw=2 (raid exposure
  // beyond progression — the #469 shape).
  const recs = [];
  for (let d = 1; d <= 180; d++) {
    const r = synRec(d, { uw: d >= 60 ? 4 : 2, peak: d >= 60 ? 4 : 0 });
    if (d === 50) r.newKills = [{ mid: 'the_congregation', w: 4, by: 'v1', cls: 'villager', ch: 'aid-crisis', uw: 2, decoupled: true }];
    if (d === 55) r.newFaced = [{ mid: 'the_eulogy', w: 4, decoupled: true }];
    recs.push(r);
  }
  const dec = AN.decoupling(synRun(recs, { endReason: 'survived' }));
  check('E4 decoupled kill detected', dec.kills.length === 1 && dec.kills[0].w === 4 && dec.kills[0].uw === 2, JSON.stringify(dec.kills));
  check('E4 decoupled faced detected', dec.faced.length === 1 && dec.faced[0].w === 4 && dec.faced[0].uw === 2, JSON.stringify(dec.faced));
}

function e3Fixture() {
  // E3: a wave-4 kill on day 80, killer v1 dies day 95 (within 30d);
  // killer v2 dies day 120 (outside 30d).
  const killLog = [
    { d: 80, mid: 'the_congregation', w: 4, by: 'v1', cls: 'villager', ch: 'wild' },
    { d: 85, mid: 'the_eulogy', w: 4, by: 'v2', cls: 'villager', ch: 'wild' },
  ];
  const deathList = [
    { day: 95, who: 'v1', player: false, kind: 'villager', cause: 'combat' },
    { day: 120, who: 'v2', player: false, kind: 'villager', cause: 'combat' },
  ];
  const rows = AN.earnersMortality(synRun([], { endReason: 'survived', killLog, deathList }));
  check('E3 rows=2', rows.length === 2, String(rows.length));
  check('E3 v1 diedWithin30=15', rows[0] && rows[0].diedWithin30 === 15, JSON.stringify(rows[0]));
  check('E3 v2 diedWithin30=null', rows[1] && rows[1].diedWithin30 == null, JSON.stringify(rows[1]));
}

async function smoke() {
  const out = execFileSync('node', [SWEEP], { env: sweepEnv({ SMOKE: '1', SEEDS: '65111', DAYS: '10' }), timeout: 300000 });
  const t = out.toString();
  check('SMOKE ran', /SMOKE GREEN/.test(t), t.slice(-300));
}

async function det() {
  const out = execFileSync('node', [SWEEP], { env: sweepEnv({ DET: '1', SEEDS: '65111,65112' }), timeout: 600000 });
  const t = out.toString();
  check('DET green', /DET GREEN/.test(t), t.slice(-300));
}

(async () => {
  try {
    await barShape();
    classificationFixtures();
    blockerFixtures();
    e4Fixture();
    e3Fixture();
    await smoke();
    await det();
    console.log(`\n${pass} passed, ${fail} failed.`);
    process.exit(fail ? 1 : 0);
  } catch (e) {
    console.error('TEST CRASH:', e);
    process.exit(2);
  }
})();
