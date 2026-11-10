#!/usr/bin/env node
// test-medcure-ev-b.js — proof for sim-medcure-ev-b (EVENT-CAPTURE re-measure)
// Legs: L0 module shape; L1 episode-builder-v2 fixtures (synthetic corpora,
// no Game); L2 pharmacy-series fixture; L3 cure-split reconciliation
// fixture; L4 determinism + neutrality via child processes (one harness
// per process — never two loads in this process); L5 analyzer CLI on a
// synthetic corpus (GO on clean, NO-GO on broken). Every leg must FAIL on
// a broken fixture (sensitivity is asserted, not assumed). The L1a pair is
// the crux: the same-tick onset+cure joins ONLY when the pre-care snapshot
// is present — without it, the cure is unrecorded, which is exactly the
// medcure-b G2 failure shape.
//
// Writes only under /tmp/medcure-ev-b-test/ — never into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const DRIVER = path.join(__dirname, 'medcure-ev-driver-20261110.js');
const ANALYZE = path.join(__dirname, 'medcure-ev-analyze-20261110.js');
const TMP = '/tmp/medcure-ev-b-test';
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
function tickEv(day, phase, opts) {
  opts = opts || {};
  return { day, afterDay: opts.afterDay != null ? opts.afterDay : day, phase,
    healerPresent: !!opts.healer, healerVid: opts.healer ? 'v-healer' : null,
    medicCount: opts.healer ? 1 : 0,
    roster: opts.roster || ['v-a', 'v-b', 'v-healer'],
    sick: opts.sick || [] };
}
// One full tick (all four phases, no sickness) for a day — keeps G1's
// phase-count check honest in synthetic corpora.
function emptyTick(day, opts) {
  return ['preTick', 'preCare', 'postCare', 'postTick'].map(p => tickEv(day, p, opts));
}
function seedCorpus(seed, dayRows, deathRows, cureEvents, finalDutyCures, tickEvents) {
  const te = tickEvents || [];
  const pc = { preTick: 0, preCare: 0, postCare: 0, postTick: 0 };
  for (const t of te) if (t.phase in pc) pc[t.phase]++;
  return { seed, policy: 'competent', plentydepri: 1, depositgate: 1,
    daysAlive: dayRows.length ? dayRows[dayRows.length - 1].day : 0,
    villageDays: dayRows.length, deathCauses: {}, deathRows: deathRows || [],
    dayRows, tickEvents: te, tickPhaseCounts: pc,
    cureEvents: cureEvents || [], instrumentErrors: [],
    finalDutyCures: finalDutyCures || { ability: 0, medicine: 0 },
    national: false, table: false, win: false, waveReach: [1] };
}

(async () => {
  console.log('test-medcure-ev-b: proof for sim-medcure-ev-b');
  try { fs.mkdirSync(TMP, { recursive: true }); } catch (e) {}

  // ---- L0 module shape ----
  leg('L0 driver batch is 160501-160508, days 150', () => {
    assert.deepStrictEqual(driver.BATCH, [160501, 160502, 160503, 160504, 160505, 160506, 160507, 160508]);
    assert.strictEqual(driver.DAYS, 150);
    assert.strictEqual(typeof driver.oneRun, 'function');
  });

  // ---- L1 episode-builder-v2 fixtures ----
  leg('L1a same-tick onset+cure joins via the pre-care snapshot (the medcure-b blind spot)', () => {
    // No daily snapshot ever shows v-a sick: onset + cure inside tick d2.
    const s = seedCorpus(160501, [
      dayRow(1, { healer: true, sick: [] }),
      dayRow(2, { healer: true, sick: [] }),
      dayRow(3, { healer: true, sick: [] }),
    ], [], [{ day: 2, kind: 'dutyCure', channel: 'ability', holder: 'v-healer', holderName: 'Hal',
      who: 'v-a', whoName: 'Ana', diseaseId: 'wound_fever' }],
    { ability: 1, medicine: 0 },
    [
      ...emptyTick(1, { healer: true }),
      tickEv(2, 'preTick', { healer: true, sick: [] }),
      tickEv(2, 'preCare', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 5)] }),
      tickEv(2, 'postCare', { healer: true, sick: [] }),
      tickEv(2, 'postTick', { healer: true, sick: [] }),
      ...emptyTick(3, { healer: true }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    const ep = b.episodes[0];
    assert.strictEqual(ep.diseaseId, 'wound_fever');
    assert.strictEqual(ep.onsetDay, 2);
    assert.strictEqual(ep.onsetSource, 'preCare');
    assert.strictEqual(ep.healerPresent, true);
    assert.strictEqual(ep.outcome, 'cured-duty-ability');
    assert.strictEqual(ep.cureChannel, 'ability');
    assert.strictEqual(b.unrecordedCures.length, 0);
    assert.strictEqual(b.pretickSightings, 0);
  });
  leg('L1a-sensitivity: WITHOUT the tick snapshots the same cure is unrecorded (medcure-b G2 shape)', () => {
    const s = seedCorpus(160501, [
      dayRow(1, { healer: true, sick: [] }),
      dayRow(2, { healer: true, sick: [] }),
      dayRow(3, { healer: true, sick: [] }),
    ], [], [{ day: 2, kind: 'dutyCure', channel: 'ability', holder: 'v-healer', holderName: 'Hal',
      who: 'v-a', whoName: 'Ana', diseaseId: 'wound_fever' }],
    { ability: 1, medicine: 0 }, []);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 0);
    assert.strictEqual(b.unrecordedCures.length, 1);
  });
  leg('L1b wound-fever death in the progression loop joins (record in preTick, gone in preCare)', () => {
    const s = seedCorpus(160502, [
      dayRow(1, { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 2)] }),
      // Day 2's daily snapshot runs BEFORE the tick: v-b is still sick here.
      dayRow(2, { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 1)] }),
    ], [{ day: 2, who: 'v-b', whoName: 'Bo', kind: 'villager', cause: 'wound_fever', isPlayer: false }],
    [], { ability: 0, medicine: 0 },
    [
      tickEv(1, 'preTick', { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 2)] }),
      tickEv(1, 'preCare', { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 1)] }),
      tickEv(1, 'postCare', { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 1)] }),
      tickEv(1, 'postTick', { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 1)] }),
      tickEv(2, 'preTick', { healer: false, sick: [sickRow('v-b', 'wound_fever', 'wound fever', 1)] }),
      tickEv(2, 'preCare', { healer: false, sick: [] }),
      tickEv(2, 'postCare', { healer: false, sick: [] }),
      tickEv(2, 'postTick', { healer: false, sick: [] }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    assert.strictEqual(b.episodes[0].outcome, 'died');
    assert.strictEqual(b.episodes[0].deathDay, 2);
    assert.strictEqual(b.episodes[0].feverDeath, true);
    assert.strictEqual(b.unlinkedWoundFeverDeaths.length, 0);
  });
  leg('L1c recovery: daysLeft 1 in preTick, gone in preCare, no death -> recovered', () => {
    const s = seedCorpus(160503, [
      dayRow(1, { healer: true, sick: [sickRow('v-c', 'wound_fever', 'wound fever', 2)] }),
      dayRow(2, { healer: true, sick: [] }),
    ], [], [], { ability: 0, medicine: 0 },
    [
      // The patient must be on the tick snapshot's roster, else the close
      // reads as 'left' (stale-cleanup), not 'recovered'.
      tickEv(1, 'preTick', { healer: true, roster: ['v-c', 'v-a', 'v-healer'], sick: [sickRow('v-c', 'wound_fever', 'wound fever', 1)] }),
      tickEv(1, 'preCare', { healer: true, roster: ['v-c', 'v-a', 'v-healer'], sick: [] }),
      tickEv(1, 'postCare', { healer: true, roster: ['v-c', 'v-a', 'v-healer'], sick: [] }),
      tickEv(1, 'postTick', { healer: true, roster: ['v-c', 'v-a', 'v-healer'], sick: [] }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    assert.strictEqual(b.episodes[0].outcome, 'recovered');
  });
  leg('L1d wound_fever-cause death with no episode is unlinked (G2 failure shape)', () => {
    const s = seedCorpus(160504, [
      dayRow(1, { healer: true, sick: [] }),
      dayRow(2, { healer: true, sick: [] }),
    ], [{ day: 2, who: 'v-e', whoName: 'Eli', kind: 'villager', cause: 'wound_fever', isPlayer: false }],
    [], { ability: 0, medicine: 0 }, [...emptyTick(1, { healer: true }), ...emptyTick(2, { healer: true })]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.unlinkedWoundFeverDeaths.length, 1);
    assert.strictEqual(b.episodes.length, 0);
  });
  leg('L1e sensitivity: swapping healer labels flips the mortality split', () => {
    const mk = (healer) => seedCorpus(160505, [
      dayRow(1, { healer, sick: [sickRow('v-f', 'wound_fever', 'wound fever', 3)] }),
      dayRow(2, { healer, sick: [sickRow('v-f', 'wound_fever', 'wound fever', 2)] }),
      dayRow(3, { healer, sick: [] }),
    ], [{ day: 2, who: 'v-f', whoName: 'Fay', kind: 'villager', cause: 'wound_fever', isPlayer: false }],
    [], { ability: 0, medicine: 0 }, [...emptyTick(1, { healer }), ...emptyTick(2, { healer })]);
    const bTrue = buildEpisodes(mk(true));
    const bFalse = buildEpisodes(mk(false));
    assert.strictEqual(bTrue.episodes[0].healerPresent, true);
    assert.strictEqual(bFalse.episodes[0].healerPresent, false);
    assert.notStrictEqual(
      bTrue.episodes.filter(e => e.healerPresent).length,
      bFalse.episodes.filter(e => e.healerPresent).length);
  });
  leg('L1f re-onset after a cure opens a SECOND episode for the same villager (Lillian case)', () => {
    const s = seedCorpus(160506, [
      dayRow(1, { healer: true, sick: [] }),
      dayRow(2, { healer: true, sick: [] }),
      dayRow(3, { healer: true, sick: [] }),
      dayRow(4, { healer: true, sick: [] }),
      dayRow(5, { healer: true, sick: [] }),
    ], [], [
      { day: 1, kind: 'dutyCure', channel: 'ability', holder: 'v-healer', holderName: 'Hal',
        who: 'v-g', whoName: 'Gus', diseaseId: 'wound_fever' },
      { day: 4, kind: 'dutyCure', channel: 'ability', holder: 'v-healer', holderName: 'Hal',
        who: 'v-g', whoName: 'Gus', diseaseId: 'wound_fever' },
    ], { ability: 2, medicine: 0 },
    [
      ...emptyTick(1, { healer: true }).slice(0, 1),
      tickEv(1, 'preCare', { healer: true, sick: [sickRow('v-g', 'wound_fever', 'wound fever', 5)] }),
      tickEv(1, 'postCare', { healer: true, sick: [] }),
      tickEv(1, 'postTick', { healer: true, sick: [] }),
      ...emptyTick(2, { healer: true }),
      ...emptyTick(3, { healer: true }),
      tickEv(4, 'preTick', { healer: true, sick: [] }),
      tickEv(4, 'preCare', { healer: true, sick: [sickRow('v-g', 'wound_fever', 'wound fever', 4)] }),
      tickEv(4, 'postCare', { healer: true, sick: [] }),
      tickEv(4, 'postTick', { healer: true, sick: [] }),
      ...emptyTick(5, { healer: true }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 2);
    assert.strictEqual(b.episodes[0].onsetDay, 1);
    assert.strictEqual(b.episodes[0].outcome, 'cured-duty-ability');
    assert.strictEqual(b.episodes[1].onsetDay, 4);
    assert.strictEqual(b.episodes[1].outcome, 'cured-duty-ability');
    assert.strictEqual(b.unrecordedCures.length, 0);
  });
  leg('L1g open episode at run end stays open (not counted died or recovered)', () => {
    const s = seedCorpus(160507, [
      dayRow(1, { healer: false, sick: [sickRow('v-h', 'wound_fever', 'wound fever', 5)] }),
      dayRow(2, { healer: false, sick: [sickRow('v-h', 'wound_fever', 'wound fever', 4)] }),
    ], [], [], { ability: 0, medicine: 0 },
    // The tick snapshots must show the record too: a record present in the
    // daily snapshots but absent from every tick snapshot would close as
    // 'recovered' at the first tick (and no such sequence occurs live —
    // nothing deletes a record between the daily snapshot and preTick).
    ['preTick', 'preCare', 'postCare', 'postTick'].map(p =>
      tickEv(1, p, { healer: false, roster: ['v-h', 'v-a'], sick: [sickRow('v-h', 'wound_fever', 'wound fever', 5)] })).concat(
    ['preTick', 'preCare', 'postCare', 'postTick'].map(p =>
      tickEv(2, p, { healer: false, roster: ['v-h', 'v-a'], sick: [sickRow('v-h', 'wound_fever', 'wound fever', 4)] }))));
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes[0].outcome, 'open');
  });
  leg('L1k a tick without care phases (early return: no onset candidates) still builds episodes', () => {
    // villageSicknessTick early-returns before villagerCareTick when no
    // candidate exists, so a tick can carry preTick/postTick but no
    // preCare/postCare. The walk must not need the care phases.
    const s = seedCorpus(160508, [
      dayRow(1, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 3)] }),
      // Day 2's daily snapshot runs before the tick: the record is still here.
      dayRow(2, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 2)] }),
    ], [], [], { ability: 0, medicine: 0 },
    [
      tickEv(1, 'preTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 3)] }),
      tickEv(1, 'postTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 3)] }),
      tickEv(2, 'preTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 2)] }),
      tickEv(2, 'postTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 2)] }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    assert.strictEqual(b.episodes[0].outcome, 'open');
  });
  leg('L1h record for a villager off the roster closes as left and is excluded from M1', () => {
    const dir = path.join(TMP, 'l1h');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    const s = seedCorpus(160508, [
      dayRow(1, { healer: true, sick: [] }),
      dayRow(2, { healer: true, sick: [] }),
    ], [], [], { ability: 0, medicine: 0 },
    [
      tickEv(1, 'preTick', { healer: true, roster: ['v-a', 'v-b'], sick: [sickRow('v-z', 'wound_fever', 'wound fever', 3)] }),
      tickEv(1, 'preCare', { healer: true, roster: ['v-a', 'v-b'], sick: [] }),
      tickEv(1, 'postCare', { healer: true, roster: ['v-a', 'v-b'], sick: [] }),
      tickEv(1, 'postTick', { healer: true, roster: ['v-a', 'v-b'], sick: [] }),
      ...emptyTick(2, { healer: true }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    assert.strictEqual(b.episodes[0].outcome, 'left');
    // M1 excludes it: 7 filler seeds with no episodes + this one = present n 0.
    for (let k = 0; k < 7; k++) {
      const f = seedCorpus(160501 + k, [dayRow(1, { healer: true, sick: [] })], [], [], { ability: 0, medicine: 0 },
        [...emptyTick(1, { healer: true })]);
      fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s' + f.seed + '.json'), JSON.stringify(f));
    }
    fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s160508.json'), JSON.stringify(s));
    const a = analyze(dir);
    assert.strictEqual(a.pooled.m1.present.n, 0);
    assert.strictEqual(a.pooled.m1.leftExcluded, 1);
  });
  leg('L1i tend detection: preCare -> postCare daysLeft -1 with no deletion marks tended', () => {
    const s = seedCorpus(160501, [
      dayRow(1, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 4)] }),
      dayRow(2, { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 2)] }),
      dayRow(3, { healer: true, sick: [] }),
    ], [], [], { ability: 0, medicine: 0 },
    [
      tickEv(1, 'preTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 4)] }),
      tickEv(1, 'preCare', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 4)] }),
      tickEv(1, 'postCare', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 3)] }),
      tickEv(1, 'postTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 3)] }),
      tickEv(2, 'preTick', { healer: true, sick: [sickRow('v-a', 'wound_fever', 'wound fever', 2)] }),
      tickEv(2, 'preCare', { healer: true, sick: [] }),
      tickEv(2, 'postCare', { healer: true, sick: [] }),
      tickEv(2, 'postTick', { healer: true, sick: [] }),
    ]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.episodes.length, 1);
    assert.strictEqual(b.episodes[0].tended, true);
    assert.strictEqual(b.episodes[0].outcome, 'recovered');
  });
  leg('L1j tickDayMismatch counts ticks whose day label differs from afterDay', () => {
    const s = seedCorpus(160502, [dayRow(1, { healer: true, sick: [] })], [], [], { ability: 0, medicine: 0 },
      [tickEv(2, 'preTick', { afterDay: 1, healer: true, sick: [] })]);
    const b = buildEpisodes(s);
    assert.strictEqual(b.tickDayMismatches, 1);
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
      const s = seedCorpus(160501 + k, rows, [], [], { ability: 0, medicine: 0 },
        rows.map(r => emptyTick(r.day, {})).flat());
      seeds.push(s);
      fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s' + s.seed + '.json'), JSON.stringify(s));
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
      const s = seedCorpus(seed, [dayRow(1, {}), dayRow(2, {})], [], events, fin,
        [...emptyTick(1, {}), ...emptyTick(2, {})]);
      fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s' + seed + '.json'), JSON.stringify(s));
      return s;
    };
    for (let k = 0; k < 7; k++) mkSeed(160501 + k, [], { ability: 0, medicine: 0 });
    mkSeed(160508,
      [{ day: 1, kind: 'dutyCure', channel: 'ability', holder: 'v-h', holderName: 'Hal',
        who: 'v-i', whoName: 'Ivy', diseaseId: 'wound_fever' }],
      { ability: 1, medicine: 0 });
    const aGood = analyze(dir);
    assert.strictEqual(aGood.pooled.m2.ability, 1);
    assert.strictEqual(aGood.pooled.m2.medicine, 0);
    assert.strictEqual(aGood.pooled.m2.mismatchSeeds, 0);
    // Now break it: same events, final counter says 2 ability cures.
    const broken = seedCorpus(160508, [dayRow(1, {}), dayRow(2, {})],
      [], [{ day: 1, kind: 'dutyCure', channel: 'ability', holder: 'v-h', holderName: 'Hal',
        who: 'v-i', whoName: 'Ivy', diseaseId: 'wound_fever' }], { ability: 2, medicine: 0 },
      [...emptyTick(1, {}), ...emptyTick(2, {})]);
    fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s160508.json'), JSON.stringify(broken));
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
  const { fingerprint, perSeed } = await oneRun(160501, 150, { bare });
  require('fs').writeFileSync(process.argv[2], JSON.stringify({ fingerprint, tickEvents: perSeed ? perSeed.tickEvents.length : 0, tickPhaseCounts: perSeed ? perSeed.tickPhaseCounts : null, cureEvents: perSeed ? perSeed.cureEvents.length : 0 }));
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
    assert.strictEqual(a.fingerprint.seed, 160501);
    assert.ok(a.fingerprint.daysAlive > 0, 'run lived 0 days');
    assert.ok(a.tickEvents > 0, 'no tick events captured');
    // Phase rule (corrected — see prereg Amendment): entry/exit pairs
    // balance; a tick may legitimately lack care phases (early return when
    // no onset candidates exist), so preCare can be one short of preTick.
    assert.ok(a.tickPhaseCounts && a.tickPhaseCounts.preTick === a.tickPhaseCounts.postTick &&
      a.tickPhaseCounts.preCare === a.tickPhaseCounts.postCare &&
      a.tickPhaseCounts.preCare <= a.tickPhaseCounts.preTick,
      'tick phases unbalanced: ' + JSON.stringify(a.tickPhaseCounts));
  });
  await aleg('L4b neutrality: recorded vs bare fingerprints identical on seed 160501', async () => {
    const fRec = path.join(TMP, 'det1.json'), fBare = path.join(TMP, 'bare1.json');
    const r = cp.spawnSync(process.execPath, ['-e', CHILD, 'bare', fBare],
      { env: ENV, encoding: 'utf8', timeout: 300000 });
    assert.strictEqual(r.status, 0, 'bare child exit ' + r.status + ' ' + (r.stderr || '').slice(0, 300));
    const a = JSON.parse(fs.readFileSync(fRec, 'utf8'));
    const b = JSON.parse(fs.readFileSync(fBare, 'utf8'));
    assert.deepStrictEqual(a.fingerprint, b.fingerprint, 'recorder changed the trajectory');
  });

  // ---- L5 analyzer CLI on synthetic corpora ----
  leg('L5a analyzer CLI exits 0 (GO) on a clean 8-seed synthetic corpus', () => {
    const dir = path.join(TMP, 'l5good');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    for (let k = 0; k < 8; k++) {
      const s = seedCorpus(160501 + k, [
        dayRow(1, { healer: k % 2 === 0, sick: [sickRow('v-j', 'wound_fever', 'wound fever', 3)] }),
        dayRow(2, { healer: k % 2 === 0, sick: [] }),
      ], [], [], { ability: 0, medicine: 0 },
      [...emptyTick(1, { healer: k % 2 === 0 }), ...emptyTick(2, { healer: k % 2 === 0 })]);
      fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s' + s.seed + '.json'), JSON.stringify(s));
      // Bare fingerprints identical to the recorded trajectory (shared
      // subset): daysAlive 2, no deaths, wave 1.
      const bare = { seed: s.seed, daysAlive: 2, endReason: 'days', rank: 'village',
        maxWave: 1, national: false, table: false, win: false, deathCauses: {},
        deathKeys: [], finalPop: 10 };
      fs.writeFileSync(path.join(dir, 'medcure-ev-b-bare-s' + s.seed + '.json'), JSON.stringify(bare));
    }
    // The summary fingerprint path needs endReason/rank/finalPop — write it.
    const rows = [];
    for (let k = 0; k < 8; k++) {
      rows.push({ seed: 160501 + k, fingerprint: { seed: 160501 + k, daysAlive: 2,
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
      const s = seedCorpus(160501 + k, [dayRow(1, { healer: true, sick: [] })], deaths, [], { ability: 0, medicine: 0 },
        [...emptyTick(1, { healer: true })]);
      fs.writeFileSync(path.join(dir, 'medcure-ev-b-competent-s' + s.seed + '.json'), JSON.stringify(s));
    }
    const r = cp.spawnSync(process.execPath, [ANALYZE, dir], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 1, 'analyzer should exit 1, got ' + r.status);
    assert.ok(/VERDICT: NO-GO/.test(r.stdout), 'no NO-GO verdict:\n' + r.stdout.slice(0, 500));
  });

  console.log('\ntest-medcure-ev-b: ' + passed + ' passed, ' + failed + ' failed' +
    (failures.length ? '\n' + failures.map(f => '  - ' + f).join('\n') : ''));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
