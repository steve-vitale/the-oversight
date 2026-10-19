#!/usr/bin/env node
// test-w5path-20261019.js — proof for the sim-w5census wave-5 unlock-path
// instrument (flesh-out loop arm sim-w5census, 20261019T0215Z).
//
// (a) BAR-SHAPE FIXTURES: the demands the instrument measures match the
//     engine's standingCfg (t4=100, t5=200, plentyCapT5=100, recalibrated
//     readyDemand) — fails LOUD if the game bar moves under the census.
// (b) CLASSIFICATION FIXTURES: synthetic daily path histories -> the
//     pre-registered stall class + attempt-window outcomes (known answers).
// (c) SMOKE: both policies drive with path records on the w5path substrate.
// (d) DET: instrument-on vs instrument-off byte-identical trajectories
//     (via the sweep's DET mode — 2 seeds x 60d, both policies).
// (e) ATTRIBUTION COMPLETENESS: every real per-seed JSON classifies
//     (>=30/32 — the brief's >=15/16 fraction on the 32-run census).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 node scripts/test-w5path-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const AN = require('./analyze-w5path-20261019');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

const SWEEP = path.join(__dirname, 'probe-w5path-20261019.js');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-w5path');
function sweepEnv(extra) {
  return Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
    WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1',
  }, extra);
}

// Synthetic daily rec builder for classification fixtures.
function synRec(d, o) {
  return Object.assign({
    d, uw: 1, peak: 0, raw: 0, war: 0, dip: 0, plenty: 0, warPts: 0, links: 0, feasts: 0,
    cap: 0, l3: 0, l4: 0, l5: 0,
    r5: { arm: 0, wpn: 0, trk: 0, vet: 0, short: ['veterans'], rdy: false },
    r4: { arm: 0, wpn: 0, trk: 0, vet: 0, short: ['veterans'], rdy: false },
    def5: false, gf5: false, w4k: 0, w4d: 0, w4killers: 0, w4via: null,
    deed: null, alive: true, won: false,
  }, o);
}
function synRun(recs, end) {
  return Object.assign({
    seed: 1, policyId: 'leadfeast', gameDays: 180, endReason: 'survived',
    won: false, national: false, table: false, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, recs, endRec: recs[recs.length - 1],
  }, end);
}

async function barShape() {
  // The bar the instrument measures, pinned against the live engine.
  const { Game } = await loadGame({ seed: 63701, mode: 'w5path-proof', fullTelemetry: false });
  await setupGame(Game);
  const cfg = Game.standingCfg();
  check('bar t4=100', cfg.t4 === 100, `t4=${cfg.t4}`);
  check('bar t5=200', cfg.t5 === 200, `t5=${cfg.t5}`);
  check('bar plentyCapT5=100', cfg.plentyCapT5 === 100, `cap=${cfg.plentyCapT5}`);
  const d4 = cfg.readyDemand[4], d5 = cfg.readyDemand[5];
  check('bar w4 demand {3@P10,5,3,1}', d4.armored === 3 && d4.armorP === 10 && d4.armed === 5 && d4.tricks === 3 && d4.veterans === 1, JSON.stringify(d4));
  check('bar w5 demand {4@P15,6,3,2}', d5.armored === 4 && d5.armorP === 15 && d5.armed === 6 && d5.tricks === 3 && d5.veterans === 2, JSON.stringify(d5));
  // The instrument's pure reads exist and don't throw on a fresh game.
  for (const fn of ['villageStanding', 'standingPlentyCappedTotal', 'waveUnlockReady', 'standingDeferral', 'waveLedgerPoints', 'deedGateReady', 'unlockedWave', '_standingPeakWave']) {
    check(`api ${fn} exists`, typeof Game[fn] === 'function', typeof Game[fn]);
  }
}

function classificationFixtures() {
  // F1: never-progressed — peak never reaches 4, def5 never true.
  let recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 40 + d, cap: 40 + d, uw: d > 100 ? 3 : 1, peak: 0 }));
  let c = AN.classify(synRun(recs, { endReason: 'survived' }));
  check('F1 never-progressed', c.stallClass === 'never-progressed', c.stallClass);
  // F2: progressed-but-stalled — w4 unlocked d60, def5 never true.
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
  // F7: two disjoint attempt windows — died in the second.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: (d >= 50 && d <= 70) || (d >= 110 && d <= 130) ? 205 : 150,
    uw: 4, peak: 4, def5: (d >= 50 && d <= 70) || (d >= 110 && d <= 130),
  }));
  const r7 = synRun(recs.slice(0, 130), { gameDays: 130, endReason: 'village-lost' });
  const a7 = AN.attemptsOf(r7);
  check('F7 two windows', a7.length === 2, `${a7.length}`);
  check('F7 outcomes regressed+died', a7[0].outcome === 'regressed' && a7[1].outcome === 'died', a7.map(a => a.outcome).join(','));
  // F8: won during the window — outcome won.
  recs = [];
  for (let d = 1; d <= 100; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 80 }));
  const r8 = synRun(recs, { gameDays: 100, endReason: 'over-other', won: true });
  const a8 = AN.attemptsOf(r8);
  check('F8 attempt outcome won', a8.length === 1 && a8[0].outcome === 'won', JSON.stringify(a8.map(a => a.outcome)));
  // F9: endRec-boundary — the daily series can lag run end by a day.
  // (a) window open at run end (endRec def5 true) -> horizon, not regressed.
  recs = [];
  for (let d = 1; d <= 181; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 175 }));
  const r9a = synRun(recs, { gameDays: 182, endReason: 'survived' });
  r9a.endRec = synRec(182, { raw: 210, cap: 205, uw: 4, peak: 4, def5: true });
  const a9a = AN.attemptsOf(r9a);
  check('F9a window open at horizon -> horizon', a9a.length === 1 && a9a[0].end === 182 && a9a[0].outcome === 'horizon', JSON.stringify(a9a.map(a => [a.start, a.end, a.outcome])));
  // (b) death-day deferral (endRec def5 true, village-lost) -> died, not regressed.
  recs = [];
  for (let d = 1; d <= 136; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 72 }));
  const r9b = synRun(recs, { gameDays: 137, endReason: 'village-lost' });
  r9b.endRec = synRec(137, { raw: 210, cap: 205, uw: 4, peak: 4, def5: true });
  const a9b = AN.attemptsOf(r9b);
  check('F9b death-day deferral -> died', a9b.length === 1 && a9b[0].end === 137 && a9b[0].outcome === 'died', JSON.stringify(a9b.map(a => [a.start, a.end, a.outcome])));
  // (c) REAL regression — window ends while alive, endRec def5 false -> regressed.
  recs = [];
  for (let d = 1; d <= 181; d++) recs.push(synRec(d, { raw: 335, cap: d <= 175 ? 205 : 175, uw: 4, peak: 4, def5: d >= 163 && d <= 175 }));
  const r9c = synRun(recs, { gameDays: 182, endReason: 'survived' });
  r9c.endRec = synRec(182, { raw: 335, cap: 175, uw: 4, peak: 4, def5: false });
  const a9c = AN.attemptsOf(r9c);
  check('F9c true regression -> regressed', a9c.length === 1 && a9c[0].outcome === 'regressed', JSON.stringify(a9c.map(a => [a.start, a.end, a.outcome])));
}

function smoke() {
  const out = execFileSync('node', [SWEEP], {
    env: sweepEnv({ SMOKE: '1', SEEDS: '63701', W5PATH_NOWRITE: '1', DAYS: '30' }),
    cwd: path.join(__dirname, '..'), timeout: 600000,
  }).toString();
  check('SMOKE leadfeast drove', /SMOKE leadfeast s63701: days=\d+ end=\S+ recs=\d+/.test(out), out.split('\n').slice(0, 4).join(' | '));
  check('SMOKE belongfeast drove', /SMOKE belongfeast s63701: days=\d+ end=\S+ recs=\d+/.test(out), '');
  check('SMOKE path fields live', /"def5":(true|false),"l4":\d+,"w4k":\d+/.test(out), '');
}

function det() {
  const out = execFileSync('node', [SWEEP], {
    env: sweepEnv({ DET: '1', SEEDS: '63701,63702' }),
    cwd: path.join(__dirname, '..'), timeout: 1200000,
  }).toString();
  const passes = (out.match(/DET s\d+ \w+: PASS/g) || []).length;
  check('DET 4/4 byte-identical (2 seeds x 2 policies)', passes === 4 && /DET: ALL PASS/.test(out), out.split('\n').filter(l => l.includes('DET')).join(' | '));
}

function attributionCompleteness() {
  if (!fs.existsSync(EVID)) { check('completeness SKIP (no sweep yet)', true); return; }
  let n = 0, classified = 0;
  for (const p of ['leadfeast', 'belongfeast']) {
    const dir = path.join(EVID, p);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
      n++;
      const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const c = AN.classify(rec);
      if (['unlocked', 'engaged-but-failed', 'progressed-but-stalled', 'never-progressed'].includes(c.stallClass)) classified++;
      else console.log(`  UNCLASSIFIED: ${p}/${f}`);
    }
  }
  check(`completeness ${classified}/${n} >= 30/32`, n === 0 || classified >= 30, `${classified}/${n}`);
}

(async () => {
  console.log('== bar-shape =='); await barShape();
  console.log('== classification fixtures =='); classificationFixtures();
  console.log('== smoke =='); smoke();
  console.log('== det =='); det();
  console.log('== attribution completeness =='); attributionCompleteness();
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(1); });
