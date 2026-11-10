#!/usr/bin/env node
// test-medcure-b.js — proof for sim-medcure-b (FIRST NUMBERS instrument)
// Legs: L0 module shape; L1 episode-builder fixtures (synthetic corpora,
// no Game); L2 pharmacy-series fixture; L3 cure-split reconciliation
// fixture; L4 determinism + neutrality via child processes (one harness
// per process — never two loads in this process); L5 analyzer CLI on a
// synthetic corpus (GO on clean, NO-GO on broken). Every leg must FAIL on
// a broken fixture (sensitivity is asserted, not assumed).
//
// Writes only under /tmp/medcure-b-test/ — never into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const DRIVER = path.join(__dirname, 'medcure-driver-20261110.js');
const ANALYZE = path.join(__dirname, 'medcure-analyze-20261110.js');
const TMP = '/tmp/medcure-b-test';
const ENV = Object.assign({}, process.env, { PLENTYDEPRI: '1', DEPOSITGATE: '1' });

let passed = 0, failed = 0;
const failures = [];
function leg(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; failures.push(name + ': ' + e.message); console.log('  FAIL ' + name + ' — ' + e.message); }
}
async function aleg(name, fn) {
  try { await fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; failures.push(name + ': ' + e.message); console.log('  FAIL ' + name + ' — ' + e.message); }
}

const { buildEpisodes, analyze } = require(ANALYZE);
// The driver reads DAYS from env at require time; pin it so L0 sees the
// CLI value (the CLI itself FATALs unless DAYS is exactly 150).
process.env.DAYS = '150';
const driver = require(DRIVER);

// ---- synthetic corpus helpers ----
function dayRow(day, opts) {
  opts = opts || {};
  return { day, pop: 10, healerPresent: !!opts.healer, healerVid: opts.healer ? 'v-healer' : null,
    medicCount: opts.healer ? 1 : 0, sickCountNPC: (opts.sick || []).length, sick: opts.sick || [],
    dutyVid: opts.duty || null, dutyCures: opts.cures || { ability: 0, medicine: 0 },
    pharmacy: opts.pharmacy || { antibiotics: 0, antiparasitic: 0, total: 0 } };
}
function sickRow(vid, diseaseId, name, daysLeft) {
  return { vid, name, diseaseId, daysLeft: daysLeft == null ? 3 : daysLeft, severity: 1, diagnosed: false };
}
function seedCorpus(seed, dayRows, deathRows, cureEvents, finalDutyCures) {
  return { seed, policy: 'competent', plentydepri: 1, depositgate: 1,
    daysAlive: dayRows.length ? dayRows[dayRows.length - 1].day : 0,
    villageDays: dayRows.length, deathCauses: {}, deathRows: deathRows || [],
    dayRows, cureEvents: cureEvents || [], instrumentErrors: [],
    finalDutyCures: finalDutyCures || { ability: 0, medicine: 0 },
    national: false, table: false, win: false, waveReach: [1] };
}

(async () => {
  console.log('test-medcure-b: proof for sim-medcure-b');
  try { fs.mkdirSync(TMP, { recursive: true }); } catch (e) {}

  // ---- L0 module shape ----
  leg('L0 driver batch is 160209-160216, days 150', () => {
    assert.deepStrictEqual(driver.BATCH, [160209, 160210, 160211, 160212, 160213, 160214, 160215, 160216]);
    assert.strictEqual(driver.DAYS, 150);
    assert.strictEqual(typeof driver.oneRun, 'function');
  });

  // ---- L1 episode-builder fixtures ----
  leg('L1a wound-fever episode, healer present at onset, fever death joins', () => {
    const s = seedCorpus(160209, [
      dayRow(1, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 4)] }),
      dayRow(2, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 3)] }),
      dayRow(3, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 2)] }),
      dayRow(4, { healer: true, sick: [] }),
    ], [{ day: 3, who: 'v-a', whoName: 'Ana', kind: 'villager', cause: 'wound_fever', isPlayer: false }]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    const ep = b.episodes[0];
    assert.strictEqual(ep.diseaseId, 'wound_fever');
    assert.strictEqual(ep.onsetDay, 1);
    assert.strictEqual(ep.healerPresent, true);
    assert.strictEqual(ep.outcome, 'died');
    assert.strictEqual(ep.deathCause, 'wound_fever');
    assert.strictEqual(ep.feverDeath, true);
    assert.strictEqual(b.unlinkedWoundFeverDeaths.length, 0);
  });
  leg('L1b healer-absent episode recovers; cured-duty-medicine joins by channel', () => {
    const s = seedCorpus(160210, [
      dayRow(1, { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 4)] }),
      dayRow(2, { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 3)] }),
      dayRow(3, { healer: false, sick: [] }),
      dayRow(4, { healer: false, sick: [sickRow('v-c', 'disease', 'tick fever', 3)] }),
      dayRow(5, { healer: false, sick: [] }),
    ], [], [{ day: 2, kind: 'dutyCure', channel: 'medicine', holder: 'v-h', holderName: 'Hal',
      who: 'v-b', whoName: 'Bo', diseaseId: 'wound_fever' }],
    { ability: 0, medicine: 1 });
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 2);
    const wf = b.episodes.find(e => e.diseaseId === 'wound_fever');
    assert.strictEqual(wf.outcome, 'cured-duty-medicine');
    assert.strictEqual(wf.cureChannel, 'medicine');
    assert.strictEqual(wf.healerPresent, false);
    const tf = b.episodes.find(e => e.diseaseId === 'disease');
    assert.strictEqual(tf.outcome, 'recovered');
    assert.strictEqual(b.unrecordedCures.length, 0);
  });
  leg('L1c death after last snapshot joins via the +1 window and is counted reconciled', () => {
    const s = seedCorpus(160211, [
      dayRow(1, { healer: false, sick: [sickRow('v-d', 'wound_fever', 'wound fever', 2)] }),
      dayRow(2, { healer: false, sick: [sickRow('v-d', 'wound_fever', 'wound fever', 1)] }),
      // day 3: the tick kills v-d before any snapshot; no day-3 sick row.
      dayRow(3, { healer: false, sick: [] }),
    ], [{ day: 3, who: 'v-d', whoName: 'Dee', kind: 'villager', cause: 'sickness', isPlayer: false }]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    assert.strictEqual(b.episodes[0].outcome, 'died');
    assert.strictEqual(b.episodes[0].deathDay, 3);
    assert.strictEqual(b.reconciledDeaths.length, 1);
    assert.strictEqual(b.unlinkedWoundFeverDeaths.length, 0);
  });
  leg('L1d wound_fever-cause death with no episode is unlinked (G2 failure shape)', () => {
    const s = seedCorpus(160212, [
      dayRow(1, { healer: true, sick: [] }),
      dayRow(2, { healer: true, sick: [] }),
    ], [{ day: 2, who: 'v-e', whoName: 'Eli', kind: 'villager', cause: 'wound_fever', isPlayer: false }]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.unlinkedWoundFeverDeaths.length, 1);
    assert.strictEqual(b.episodes.length, 0);
  });
  leg('L1e sensitivity: swapping healer labels flips the mortality split', () => {
    const mk = (healer) => seedCorpus(160213, [
      dayRow(1, { healer, sick: [sickRow('v-f', 'wound_fever', 'wound fever', 3)] }),
      dayRow(2, { healer, sick: [sickRow('v-f', 'wound_fever', 'wound fever', 2)] }),
      dayRow(3, { healer, sick: [] }),
    ], [{ day: 2, who: 'v-f', whoName: 'Fay', kind: 'villager', cause: 'wound_fever', isPlayer: false }]);
    const bTrue = buildEpisodes(mk(true));
    const bFalse = buildEpisodes(mk(false));
    assert.strictEqual(bTrue.episodes[0].healerPresent, true);
    assert.strictEqual(bFalse.episodes[0].healerPresent, false);
    assert.notStrictEqual(
      bTrue.episodes.filter(e => e.healerPresent).length,
      bFalse.episodes.filter(e => e.healerPresent).length);
  });
  leg('L1f sensitivity: dropping the cure event turns cured into recovered', () => {
    const rows = [
      dayRow(1, { healer: true, sick: [sickRow('v-g', 'wound_fever', 'wound fever', 4)] }),
      dayRow(2, { healer: true, sick: [] }),
    ];
    const withCure = seedCorpus(160214, rows, [],
      [{ day: 1, kind: 'dutyCure', channel: 'ability', holder: 'v-h', holderName: 'Hal',
        who: 'v-g', whoName: 'Gus', diseaseId: 'wound_fever' }], { ability: 1, medicine: 0 });
    const withoutCure = seedCorpus(160214, rows, [], [], { ability: 0, medicine: 0 });
    assert.strictEqual(buildEpisodes(withCure).episodes[0].outcome, 'cured-duty-ability');
    assert.strictEqual(buildEpisodes(withoutCure).episodes[0].outcome, 'recovered');
  });
  leg('L1g open episode at run end stays open (not counted died or recovered)', () => {
    const s = seedCorpus(160215, [
      dayRow(1, { healer: false, sick: [sickRow('v-h', 'wound_fever', 'wound fever', 5)] }),
      dayRow(2, { healer: false, sick: [sickRow('v-h', 'wound_fever', 'wound fever', 4)] }),
    ], []);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes[0].outcome, 'open');
  });

  // ---- L2 pharmacy fixture ----
  leg('L2 pharmacy series: mean/max/stocked days exact on a known series', () => {
    const dir = path.join(TMP, 'l2');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    const rows = [];
    // 10 days: 0,0,3,3,3,2,2,0,0,6 (abx/antip split on day 10: 4/2)
    const totals = [0, 0, 3, 3, 3, 2, 2, 0, 0, 6];
    totals.forEach((t, i) => {
      const ph = i === 9 ? { antibiotics: 4, antiparasitic: 2, total: 6 }
        : t === 3 ? { antibiotics: 3, antiparasitic: 0, total: 3 }
        : t === 2 ? { antibiotics: 0, antiparasitic: 2, total: 2 }
        : { antibiotics: 0, antiparasitic: 0, total: 0 };
      rows.push(dayRow(i + 1, { pharmacy: ph }));
    });
    const seeds = [];
    for (let k = 0; k < 8; k++) {
      const s = seedCorpus(160209 + k, rows, []);
      seeds.push(s);
      fs.writeFileSync(path.join(dir, 'medcure-b-competent-s' + s.seed + '.json'), JSON.stringify(s));
    }
    const a = analyze(dir);
    assert.strictEqual(a.pooled.m3.villageDays, 80);
    assert.strictEqual(a.pooled.m3.maxDoses, 6);
    assert.strictEqual(a.pooled.m3.stockedDays, 8 * 6);
    assert.strictEqual(a.pooled.m3.zeroDays, 8 * 4);
    assert.strictEqual(a.pooled.m3.seedsEverStocked, 8);
    // mean = (0+0+3+3+3+2+2+0+0+6)/10 = 1.9
    assert.ok(Math.abs(a.pooled.m3.meanDoses - 1.9) < 1e-9, 'mean ' + a.pooled.m3.meanDoses);
    // stock changes per seed: 0->3, 3->2, 2->0, 0->6 = 4
    assert.strictEqual(a.pooled.m3.stockChanges, 8 * 4);
  });

  // ---- L3 cure-split reconciliation fixture ----
  leg('L3a events matching finalDutyCures reconcile (mismatch 0); L3b mismatch flags', () => {
    const dir = path.join(TMP, 'l3');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    const mkSeed = (seed, events, fin) => {
      const s = seedCorpus(seed, [dayRow(1, {}), dayRow(2, {})], [], events, fin);
      fs.writeFileSync(path.join(dir, 'medcure-b-competent-s' + seed + '.json'), JSON.stringify(s));
      return s;
    };
    for (let k = 0; k < 7; k++) mkSeed(160209 + k, [], { ability: 0, medicine: 0 });
    mkSeed(160216,
      [{ day: 1, kind: 'dutyCure', channel: 'ability', holder: 'v-h', holderName: 'Hal',
        who: 'v-i', whoName: 'Ivy', diseaseId: 'wound_fever' }],
      { ability: 1, medicine: 0 });
    const aGood = analyze(dir);
    assert.strictEqual(aGood.pooled.m2.ability, 1);
    assert.strictEqual(aGood.pooled.m2.medicine, 0);
    assert.strictEqual(aGood.pooled.m2.mismatchSeeds, 0);
    // Now break it: same events, final counter says 2 ability cures.
    const broken = seedCorpus(160216, [dayRow(1, {}), dayRow(2, {})],
      [], [{ day: 1, kind: 'dutyCure', channel: 'ability', holder: 'v-h', holderName: 'Hal',
        who: 'v-i', whoName: 'Ivy', diseaseId: 'wound_fever' }], { ability: 2, medicine: 0 });
    fs.writeFileSync(path.join(dir, 'medcure-b-competent-s160216.json'), JSON.stringify(broken));
    const aBad = analyze(dir);
    assert.strictEqual(aBad.pooled.m2.mismatchSeeds, 1);
    assert.strictEqual(aBad.gates.G2_episode_join_clean, false);
  });

  // ---- L4 determinism + neutrality (live, child processes) ----
  const CHILD = `
process.env.PLENTYDEPRI='1'; process.env.DEPOSITGATE='1';
const { oneRun } = require(${JSON.stringify(DRIVER)});
(async () => {
  const bare = process.argv[1] === 'bare';
  const { fingerprint } = await oneRun(160209, 150, { bare });
  require('fs').writeFileSync(process.argv[2], JSON.stringify(fingerprint));
})().catch(e => { console.error(e); process.exit(2); });
`;
  await aleg('L4a determinism: same seed twice in separate processes, identical fingerprints', async () => {
    const f1 = path.join(TMP, 'det1.json'), f2 = path.join(TMP, 'det2.json');
    for (const f of [f1, f2]) {
      const r = cp.spawnSync(process.execPath, ['-e', CHILD, 'rec', f],
        { env: ENV, encoding: 'utf8', timeout: 300000 });
      assert.strictEqual(r.status, 0, 'child exit ' + r.status + ' ' + (r.stderr || '').slice(0, 300));
    }
    const a = JSON.parse(fs.readFileSync(f1, 'utf8'));
    const b = JSON.parse(fs.readFileSync(f2, 'utf8'));
    assert.deepStrictEqual(a, b, 'fingerprints differ between identical runs');
    assert.strictEqual(a.seed, 160209);
    assert.ok(a.daysAlive > 0, 'run lived 0 days');
  });
  await aleg('L4b neutrality: recorded vs bare fingerprints identical on seed 160209', async () => {
    const fRec = path.join(TMP, 'det1.json'), fBare = path.join(TMP, 'bare1.json');
    const r = cp.spawnSync(process.execPath, ['-e', CHILD, 'bare', fBare],
      { env: ENV, encoding: 'utf8', timeout: 300000 });
    assert.strictEqual(r.status, 0, 'bare child exit ' + r.status + ' ' + (r.stderr || '').slice(0, 300));
    const a = JSON.parse(fs.readFileSync(fRec, 'utf8'));
    const b = JSON.parse(fs.readFileSync(fBare, 'utf8'));
    assert.deepStrictEqual(a, b, 'recorder changed the trajectory');
  });

  // ---- L5 analyzer CLI on synthetic corpora ----
  leg('L5a analyzer CLI exits 0 (GO) on a clean 8-seed synthetic corpus', () => {
    const dir = path.join(TMP, 'l5good');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    for (let k = 0; k < 8; k++) {
      const s = seedCorpus(160209 + k, [
        dayRow(1, { healer: k % 2 === 0, sick: [sickRow('v-j', 'wound_fever', 'wound fever', 3)] }),
        dayRow(2, { healer: k % 2 === 0, sick: [] }),
      ], []);
      fs.writeFileSync(path.join(dir, 'medcure-b-competent-s' + s.seed + '.json'), JSON.stringify(s));
      // Bare fingerprints identical to the recorded trajectory (shared
      // subset): daysAlive 2, no deaths, wave 1.
      const bare = { seed: s.seed, daysAlive: 2, endReason: 'days', rank: 'village',
        maxWave: 1, national: false, table: false, win: false, deathCauses: {},
        deathKeys: [], finalPop: 10 };
      fs.writeFileSync(path.join(dir, 'medcure-b-bare-s' + s.seed + '.json'), JSON.stringify(bare));
    }
    // The summary fingerprint path needs endReason/rank/finalPop — write it.
    const rows = [];
    for (let k = 0; k < 8; k++) {
      rows.push({ seed: 160209 + k, fingerprint: { seed: 160209 + k, daysAlive: 2,
        endReason: 'days', rank: 'village', maxWave: 1, national: false, table: false,
        win: false, deathCauses: {}, deathKeys: [], finalPop: 10 } });
    }
    fs.writeFileSync(path.join(dir, 'sweep-competent.json'), JSON.stringify({ rows }));
    const r = cp.spawnSync(process.execPath, [ANALYZE, dir], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit ' + r.status + '\n' + r.stdout.slice(0, 800) + r.stderr.slice(0, 300));
    assert.ok(/VERDICT: GO/.test(r.stdout), 'no GO verdict:\n' + r.stdout.slice(0, 500));
  });
  leg('L5b analyzer CLI exits 1 (NO-GO) on a corpus with an unlinked wound-fever death', () => {
    const dir = path.join(TMP, 'l5bad');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    for (let k = 0; k < 8; k++) {
      const deaths = k === 0
        ? [{ day: 1, who: 'v-k', whoName: 'Kay', kind: 'villager', cause: 'wound_fever', isPlayer: false }]
        : [];
      const s = seedCorpus(160209 + k, [dayRow(1, { healer: true, sick: [] })], deaths);
      fs.writeFileSync(path.join(dir, 'medcure-b-competent-s' + s.seed + '.json'), JSON.stringify(s));
    }
    const r = cp.spawnSync(process.execPath, [ANALYZE, dir], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 1, 'analyzer should exit 1, got ' + r.status);
    assert.ok(/VERDICT: NO-GO/.test(r.stdout), 'no NO-GO verdict:\n' + r.stdout.slice(0, 500));
  });

  console.log('\ntest-medcure-b: ' + passed + ' passed, ' + failed + ' failed' +
    (failures.length ? '\n' + failures.map(f => '  - ' + f).join('\n') : ''));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
