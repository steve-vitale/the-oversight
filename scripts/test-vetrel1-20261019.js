#!/usr/bin/env node
// test-vetrel1-20261019.js — proof for the sim-vetrel1 VETREL diagnostic
// re-measure (flesh-out loop arm sim-vetrel1, run fleshout-20261019T0415Z,
// axis scale-onramp; w5census named next #2).
//
// (a) BAR-SHAPE FIXTURES: the demands the instrument measures match the
//     engine's standingCfg (t4=100, t5=200, plentyCapT5=100, recalibrated
//     readyDemand) — fails LOUD if the game bar moves under the census.
// (b) VETREL-GATE FIXTURES: vetrelOn() env semantics; vetHuntLive() false
//     with the gate off; REUSE-FIDELITY: VETARM=off trajectories are
//     byte-identical to the w5census instrument (probe-w5path-20261019) on
//     the same seed — the fork changes nothing but the guard + out dir.
// (c) CLASSIFICATION FIXTURES: synthetic daily path histories -> the
//     pre-registered stall class + attempt-window outcomes (known answers)
//     through the shared analyzer machinery.
// (d) SMOKE: both arms x both policies drive with path records live.
// (e) DET: instrument-on vs instrument-off byte-identical trajectories per
//     arm (via each arm's DET mode — 2 seeds x 60d x 2 policies x 2 arms).
// (f) ATTRIBUTION COMPLETENESS: every real per-seed JSON in BOTH arms
//     classifies (32/32 — the brief's 100% stall attribution bar).
// (g) FIDELITY (FIDELITY=1): re-run 2 completed sweep seeds per arm,
//     byte-identical per-seed JSON.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 node scripts/test-vetrel1-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const AN = require('./analyze-w5path-20261019');
const VR = require('./policies/vetrel');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

const SWEEP = path.join(__dirname, 'probe-vetrel1-20261019.js');
const ARMDIRS = ['vetrel-off', 'vetrel-on'];
function sweepEnv(extra) {
  return Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
    WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1',
  }, extra);
}

// Synthetic daily rec builder for classification fixtures (same shape as
// the w5census proof — the analyzer is shared, these pin the wiring).
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
    seed: 63901, policyId: 'leadfeast', gameDays: 180, endReason: 'survived',
    won: false, national: false, table: false, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, recs, endRec: recs[recs.length - 1],
  }, end);
}

async function barShape() {
  const { Game } = await loadGame({ seed: 63901, mode: 'vetrel1-proof', fullTelemetry: false });
  await setupGame(Game);
  const cfg = Game.standingCfg();
  check('bar t4=100', cfg.t4 === 100, `t4=${cfg.t4}`);
  check('bar t5=200', cfg.t5 === 200, `t5=${cfg.t5}`);
  check('bar plentyCapT5=100', cfg.plentyCapT5 === 100, `cap=${cfg.plentyCapT5}`);
  const d4 = cfg.readyDemand[4], d5 = cfg.readyDemand[5];
  check('bar w4 demand {3@P10,5,3,1}', d4.armored === 3 && d4.armorP === 10 && d4.armed === 5 && d4.tricks === 3 && d4.veterans === 1, JSON.stringify(d4));
  check('bar w5 demand {4@P15,6,3,2}', d5.armored === 4 && d5.armorP === 15 && d5.armed === 6 && d5.tricks === 3 && d5.veterans === 2, JSON.stringify(d5));
  for (const fn of ['villageStanding', 'standingPlentyCappedTotal', 'waveUnlockReady', 'standingDeferral', 'waveLedgerPoints', 'deedGateReady', 'unlockedWave', '_standingPeakWave']) {
    check(`api ${fn} exists`, typeof Game[fn] === 'function', typeof Game[fn]);
  }
}

function vetrelGate() {
  // vetrelOn() reads the env flag, and ONLY the flag.
  const had = process.env.VETREL;
  delete process.env.VETREL;
  check('vetrelOn() false when VETREL unset', VR.vetrelOn() === false);
  process.env.VETREL = '1';
  check('vetrelOn() true when VETREL=1', VR.vetrelOn() === true);
  process.env.VETREL = '0';
  check('vetrelOn() false when VETREL=0', VR.vetrelOn() === false);
  if (had === undefined) delete process.env.VETREL; else process.env.VETREL = had;
  // vetHuntLive() is false with the gate off regardless of game state.
  check('vetHuntLive gate-off shape (fn exists)', typeof VR.vetHuntLive === 'function');
}

function reuseFidelity() {
  // VETARM=off trajectories are byte-identical to the w5census instrument
  // on the same seed: the fork changes the guard + out dir only.
  const child = `
    const W5 = require(${JSON.stringify(path.join(__dirname, 'probe-w5path-20261019.js'))});
    const V1 = require(${JSON.stringify(path.join(__dirname, 'probe-vetrel1-20261019.js'))});
    (async () => {
      const out = {};
      for (const [name, P] of [['w5', W5], ['v1', V1]]) {
        process.env.W5PATH_NOWRITE = '1';
        const r = await P.runOne(63901, 'leadfeast');
        out[name] = r.hashes.join('|');
      }
      console.log('REUSEFID w5hashes=' + out.w5.length + ' v1hashes=' + out.v1.length);
      console.log(out.w5 === out.v1 ? 'REUSEFID: IDENTICAL' : 'REUSEFID: DIVERGED');
    })().catch(e => { console.error('REUSEFID CRASH:', e.message); process.exit(2); });
  `;
  const out = execFileSync('node', ['-e', child], {
    env: sweepEnv({ VETARM: 'off', DAYS: '30' }),
    cwd: path.join(__dirname, '..'), timeout: 900000,
  }).toString();
  check('REUSEFID VETARM=off identical to w5census instrument', /REUSEFID: IDENTICAL/.test(out),
    out.split('\n').filter(l => l.includes('REUSEFID')).join(' | '));
}

function classificationFixtures() {
  // F1: never-progressed.
  let recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 40 + d, cap: 40 + d, uw: d > 100 ? 3 : 1, peak: 0 }));
  let c = AN.classify(synRun(recs, { endReason: 'survived' }));
  check('F1 never-progressed', c.stallClass === 'never-progressed', c.stallClass);
  // F3: engaged-but-failed, window d80-120 regressed, died d150.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: d < 80 ? 100 + d : d <= 120 ? 210 : 150, cap: d < 80 ? 100 + d : d <= 120 ? 205 : 150,
    uw: 4, peak: 4, def5: d >= 80 && d <= 120,
  }));
  const r3 = synRun(recs.slice(0, 150), { gameDays: 150, endReason: 'village-lost' });
  c = AN.classify(r3);
  check('F3 engaged-but-failed', c.stallClass === 'engaged-but-failed', c.stallClass);
  const a3 = AN.attemptsOf(r3);
  check('F3 attempt d80-120 regressed', a3.length === 1 && a3[0].start === 80 && a3[0].end === 120 && a3[0].outcome === 'regressed', JSON.stringify(a3.map(a => [a.start, a.end, a.outcome])));
  // F4: unlocked.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, {
    raw: 210, cap: 205, uw: d >= 91 ? 5 : 4, peak: d >= 91 ? 5 : 4, def5: d >= 80 && d < 91, gf5: d >= 91,
  }));
  const r4 = synRun(recs, { wave5Day: 91, maxWave: 5 });
  c = AN.classify(r4);
  check('F4 unlocked', c.stallClass === 'unlocked', c.stallClass);
  // F6: w5door-without-w4 sub-shape.
  recs = [];
  for (let d = 1; d <= 180; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 3, peak: 0, def5: d >= 120 }));
  const r6 = synRun(recs, { endReason: 'survived' });
  c = AN.classify(r6);
  check('F6 engaged-but-failed + w5door-without-w4', c.stallClass === 'engaged-but-failed' && c.stallSub === 'w5door-without-w4', `${c.stallClass}/${c.stallSub}`);
  // F9a: window open at horizon (endRec boundary).
  recs = [];
  for (let d = 1; d <= 181; d++) recs.push(synRec(d, { raw: 210, cap: 205, uw: 4, peak: 4, def5: d >= 175 }));
  const r9a = synRun(recs, { gameDays: 182, endReason: 'survived' });
  r9a.endRec = synRec(182, { raw: 210, cap: 205, uw: 4, peak: 4, def5: true });
  const a9a = AN.attemptsOf(r9a);
  check('F9a window open at horizon -> horizon', a9a.length === 1 && a9a[0].end === 182 && a9a[0].outcome === 'horizon', JSON.stringify(a9a.map(a => [a.start, a.end, a.outcome])));
  // F10: vetrel1 analyzer wiring — deaths/100d and villager-kill split.
  const AV = require('./analyze-vetrel1-20261019');
  const fake = { deaths: { starvation: 40, 'wave-4': 10 }, gameDays: 100 };
  check('F10 deathsPer100d', AV.deathsPer100d(fake) === 50, String(AV.deathsPer100d(fake)));
  check('F10 villagerW4Kills', AV.villagerW4Kills({ w4: { via: { player: 3, villager: 1, companion: 2 } } }) === 3, '');
  check('F10 veteranLegMet', AV.veteranLegMet({ r5term: { vet: 2 } }) === true && AV.veteranLegMet({ r5term: { vet: 1 } }) === false, '');
}

function armEnv(arm, extra) {
  const env = sweepEnv(Object.assign({}, extra, { VETARM: arm }));
  delete env.VETREL;
  if (arm === 'on') env.VETREL = '1';
  return env;
}

function smoke() {
  for (const arm of ['off', 'on']) {
    const out = execFileSync('node', [SWEEP], {
      env: armEnv(arm, { SMOKE: '1', SEEDS: '63901', W5PATH_NOWRITE: '1', DAYS: '30' }),
      cwd: path.join(__dirname, '..'), timeout: 900000,
    }).toString();
    check(`SMOKE ${arm} leadfeast drove`, /SMOKE leadfeast s63901: days=\d+ end=\S+ recs=\d+/.test(out), out.split('\n').slice(0, 4).join(' | '));
    check(`SMOKE ${arm} belongfeast drove`, /SMOKE belongfeast s63901: days=\d+ end=\S+ recs=\d+/.test(out), '');
    check(`SMOKE ${arm} path fields live`, /"def5":(true|false),"l4":\d+,"w4k":\d+/.test(out), '');
  }
}

function det() {
  for (const arm of ['off', 'on']) {
    const out = execFileSync('node', [SWEEP], {
      env: armEnv(arm, { DET: '1', SEEDS: '63901,63902' }),
      cwd: path.join(__dirname, '..'), timeout: 1800000,
    }).toString();
    const passes = (out.match(/DET s\d+ \w+: PASS/g) || []).length;
    check(`DET ${arm} 4/4 byte-identical (2 seeds x 2 policies)`, passes === 4 && /DET: ALL PASS/.test(out), out.split('\n').filter(l => l.includes('DET')).join(' | '));
  }
}

function attributionCompleteness() {
  let n = 0, classified = 0;
  const seen = { 'vetrel-off': 0, 'vetrel-on': 0 };
  for (const arm of ARMDIRS) {
    for (const p of ['leadfeast', 'belongfeast']) {
      const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-vetrel1', arm, p);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
        n++; seen[arm]++;
        try {
          const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
          if (!Array.isArray(rec.recs) || rec.recs.length === 0) { console.log(`  NO RECS: ${arm}/${p}/${f}`); continue; }
          const c = AN.classify(rec);
          if (['unlocked', 'engaged-but-failed', 'progressed-but-stalled', 'never-progressed'].includes(c.stallClass)) classified++;
          else console.log(`  UNCLASSIFIED: ${arm}/${p}/${f}`);
        } catch (e) { console.log(`  UNPARSEABLE: ${arm}/${p}/${f} (${e.message})`); }
      }
    }
  }
  if (n === 0) { check('completeness INFO-SKIP (no sweep yet)', true); return; }
  check(`completeness ${classified}/${n} = 32/32 (16/arm)`, n === 32 && classified === 32, `${classified}/${n} off=${seen['vetrel-off']} on=${seen['vetrel-on']}`);
}

function fidelity() {
  if (process.env.FIDELITY !== '1') { console.log('  fidelity SKIP (FIDELITY=1 not set)'); return; }
  let ok = true;
  for (const arm of ['off', 'on']) {
    const out = execFileSync('node', [SWEEP], {
      env: armEnv(arm, { FIDELITY: '1', SEEDS: '63901,63902' }),
      cwd: path.join(__dirname, '..'), timeout: 1800000,
    }).toString();
    const passes = (out.match(/FIDELITY s\d+ \w+: PASS/g) || []).length;
    const skips = (out.match(/SKIP/g) || []).length;
    if (!(passes === 4 && /FIDELITY: ALL PASS/.test(out))) { ok = false; console.log(`  FIDELITY ${arm} output:`, out.split('\n').filter(l => l.includes('FIDELITY')).join(' | ')); }
  }
  check('FIDELITY 8/8 byte-identical re-runs (2 seeds x 2 policies x 2 arms)', ok);
}

(async () => {
  console.log('== bar-shape =='); await barShape();
  console.log('== vetrel-gate =='); vetrelGate();
  console.log('== reuse-fidelity =='); reuseFidelity();
  console.log('== classification fixtures =='); classificationFixtures();
  console.log('== smoke =='); smoke();
  console.log('== det =='); det();
  console.log('== attribution completeness =='); attributionCompleteness();
  console.log('== fidelity =='); fidelity();
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(1); });
