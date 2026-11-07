#!/usr/bin/env node
// test-feveranat-a.js — proof for the feveranat-a diagnosis instruments.
// Legs: guard refusals (seeds/days/env), oneRun structure (incl. the NEW fever
// fields: event arrays, snapshot sickMap/scholarSick/healer/drinksDirty),
// determinism (G1 smoke), bare-vs-recorded fingerprint equality (G2 smoke),
// analyzer runs on a 5-day corpus and prints F1-F6 + G2/G3/G4, episode
// reconstruction unit test on synthetic events (FIFO pairing, outcome
// reclassification, treatment join, unattributed handling), flow accounting
// residual stays small, event-log well-formedness on the 5-day run.
// Uses seed 96301 at 5 days only (smoke scale); the judged 8-seed 150d corpus
// is produced by the sweep, not by this test.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SWEEP = path.join(__dirname, 'sweep-feveranat-a.js');
const ANALYZE = path.join(__dirname, 'analyze-feveranat-a.js');
const TMP = path.join('/tmp', 'feveranat-a-test-' + process.pid);

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function runSweep(env, expectCode) {
  const r = cp.spawnSync(process.execPath, [SWEEP], {
    env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 60000,
  });
  return r.status;
}

(async () => {
  // L1-L3: guard refusals (spawned; each must exit 2 without running sims).
  leg('L1 bad seeds refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '1,2,3', DAYS: '150' }), 2);
  });
  leg('L2 bad days refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '96301,96302,96303,96304,96305,96306,96307,96308', DAYS: '100' }), 2);
  });
  leg('L3 missing env refused', () => {
    const env = Object.assign({}, process.env);
    delete env.PLENTYDEPRI;
    const r = cp.spawnSync(process.execPath, [SWEEP], {
      env: Object.assign(env, { SEEDS: '96301,96302,96303,96304,96305,96306,96307,96308', DAYS: '150' }),
      encoding: 'utf8', timeout: 60000,
    });
    assert.strictEqual(r.status, 2);
  });

  const { oneRun, writeRobust } = require('./sweep-feveranat-a.js');
  const { buildEpisodes } = require('./analyze-feveranat-a.js');
  let first = null, second = null, bare = null;
  await aleg('L4 oneRun(96301, 5d) structure incl. fever fields', async () => {
    first = await oneRun(96301, 5);
    const ps = first.perSeed;
    assert.strictEqual(ps.seed, 96301);
    assert.strictEqual(ps.policy, 'competent');
    assert.ok(Array.isArray(ps.daySeries) && ps.daySeries.length === 5, 'daySeries length 5, got ' + ps.daySeries.length);
    assert.ok(Array.isArray(ps.flowSeries) && ps.flowSeries.length > 0, 'flowSeries non-empty');
    assert.ok(Array.isArray(ps.mealRows), 'mealRows array');
    const keys = ps.mealRows.map(r => r.vid + '|' + r.day);
    assert.strictEqual(new Set(keys).size, keys.length, 'mealRows deduped');
    const d0 = ps.daySeries[0];
    for (const k of ['pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'preservedKcal',
      'freshDays', 'pantryCapKcal', 'throttleEngaged', 'throttleRedirects',
      'throttleExemptDepth', 'plentyDepriKcal', 'depositGateKcal', 'pop', 'assignments',
      'season', 'weather', 'meanVigor', 'meanStockRatio', 'barrenTiles',
      'pressuredTiles', 'forageableTiles', 'awayCount', 'sickCount', 'meanHealth',
      'foragers', 'foragerMeanComp', 'assignDetail',
      // NEW fever fields
      'sickMap', 'scholarSick', 'tickAttached', 'healerPresent', 'medicCount',
      'drinksDirty', 'waterClean', 'waterDirty', 'triageHygiene',
      'sickMeanHealth', 'healthyMeanHealth', 'sickCountNPC']) {
      assert.ok(k in d0, 'daySeries has ' + k);
    }
    assert.ok(d0.sickMap && typeof d0.sickMap === 'object', 'sickMap is an object');
    assert.ok(Array.isArray(d0.scholarSick), 'scholarSick is an array');
    assert.ok(d0.tickAttached && typeof d0.tickAttached.present === 'boolean', 'tickAttached shape');
    assert.ok(Array.isArray(ps.deathRows), 'deathRows array');
    // NEW fever event arrays exist on the per-seed record.
    for (const k of ['sickOnsets', 'sickEnds', 'treatEvents', 'statusEvents', 'diagnoses', 'cureEvents']) {
      assert.ok(Array.isArray(ps[k]), 'perSeed has ' + k);
    }
    const f0 = ps.flowSeries[0];
    for (const k of ['stocked', 'stored', 'pantryAdd', 'donated', 'league', 'drawn',
      'spoiledDrawn', 'spoiledSwept', 'takeBulk', 'produced', 'need', 'ate', 'ownEat', 'gave', 'resolved',
      'vigorSum', 'vigorN', 'depletedSum', 'barrenSum', 'forageCalls',
      'huntKcal', 'huntZero', 'huntCalls', 'zones']) {
      assert.ok(k in f0, 'flowSeries has ' + k);
    }
    assert.ok(ps.mealRows.length > 0, 'mealRows non-empty');
    const m0 = ps.mealRows[0];
    for (const k of ['produced', 'expected', 'base', 'kf', 'knownN', 'occSkill',
      'ageCap', 'healthFrac', 'trust', 'task', 'mult']) {
      assert.ok(k in m0, 'mealRow has ' + k);
    }
    assert.ok(first.fingerprint && typeof first.fingerprint.daysAlive === 'number', 'fingerprint present');
    assert.ok(Array.isArray(first.fingerprint.deathKeys), 'fingerprint deathKeys array');
  });
  await aleg('L5 determinism G1 smoke: same seed twice => identical per-seed JSON', async () => {
    second = await oneRun(96301, 5);
    assert.strictEqual(JSON.stringify(second.perSeed), JSON.stringify(first.perSeed));
    assert.strictEqual(JSON.stringify(second.diag), JSON.stringify(first.diag));
    assert.strictEqual(JSON.stringify(second.fingerprint), JSON.stringify(first.fingerprint));
  });
  await aleg('L6 neutrality G2 smoke: bare fingerprint == recorded fingerprint', async () => {
    bare = await oneRun(96301, 5, { bare: true });
    assert.strictEqual(bare.perSeed, null, 'bare run has no perSeed');
    assert.strictEqual(JSON.stringify(bare.fingerprint), JSON.stringify(first.fingerprint),
      'bare vs recorded fingerprint: ' + JSON.stringify(bare.fingerprint) + ' vs ' + JSON.stringify(first.fingerprint));
  });
  await aleg('L7 analyzer runs on a 5-day corpus and prints F1-F6 + G2/G3/G4 + verdict', async () => {
    fs.mkdirSync(TMP, { recursive: true });
    writeRobust(path.join(TMP, 'feveranat-a-competent-s96301.json'), JSON.stringify(first.perSeed));
    const r = cp.spawnSync(process.execPath, [ANALYZE, TMP], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    for (const pat of ['F1 INCIDENCE', 'F2 DURATION', 'F3 VECTOR ATTRIBUTION',
      'F4 TREATMENT IN THE WILD', 'F5 PRODUCTION COST', 'F6 SPREAD',
      'G2 NEUTRALITY', 'G3 CORPUS', 'G4 CLASSIFICATION', 'DIAGNOSIS VERDICT']) {
      assert.ok(r.stdout.includes(pat), pat + ' printed');
    }
  });
  leg('L8 episode reconstruction: FIFO pairing, outcomes, treatment join, unattributed', () => {
    const mk = (o) => Object.assign({ seed: 96301, daysAlive: 150, deathRows: [],
      daySeries: [], mealRows: [], sickOnsets: [], sickEnds: [], treatEvents: [] }, o);
    // Two spells for the same villager+name pair FIFO in order; a cure closes
    // the first; the second recovers.
    const s1 = mk({ sickOnsets: [
      { day: 10, who: 'v1', whoName: 'Ana', kind: 'npc', name: 'tick fever', diseaseId: 'disease', vector: 'tick', vectorSource: 'villageSicknessTick', daysLeft0: 4, severity: 1 },
      { day: 20, who: 'v1', whoName: 'Ana', kind: 'npc', name: 'tick fever', diseaseId: 'disease', vector: 'tick', vectorSource: 'villageSicknessTick', daysLeft0: 5, severity: 1 },
    ], sickEnds: [
      { day: 12, who: 'v1', whoName: 'Ana', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'cured', by: 'treatVillager:herbal_remedy' },
      { day: 24, who: 'v1', whoName: 'Ana', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'recovered' },
    ], treatEvents: [
      { day: 11, kind: 'villagerCare', who: 'v1', diseaseName: 'tick fever' },
    ] });
    const b1 = buildEpisodes(s1);
    assert.strictEqual(b1.eps.length, 2, 'two episodes, got ' + b1.eps.length);
    assert.strictEqual(b1.eps[0].duration, 2, 'first duration 12-10=2, got ' + b1.eps[0].duration);
    assert.strictEqual(b1.eps[0].outcome, 'cured', 'first outcome cured');
    assert.strictEqual(b1.eps[0].treated, true, 'first treated (care d11 in [10,12])');
    assert.deepStrictEqual(b1.eps[0].treatKinds, ['villagerCare'], 'first treatKinds');
    assert.strictEqual(b1.eps[1].duration, 4, 'second duration 24-20=4');
    assert.strictEqual(b1.eps[1].treated, false, 'second untreated');
    assert.strictEqual(b1.orphanEnds.length, 0, 'no orphan ends');
    // Scholar expiry-death reclassification: trembles expires d30 and the
    // scholar dies of the trembles the same day -> outcome 'died of ...'.
    const s2 = mk({ deathRows: [{ day: 30, who: 'scholar', whoName: 'scholar', isPlayer: true, cause: 'the trembles' }],
      sickOnsets: [
        { day: 20, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'trembles', diseaseId: 'trembles', vector: 'food', vectorSource: 'contractDisease', dayPartsLeft0: 40, severity: 1 },
      ], sickEnds: [
        { day: 30, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'trembles', diseaseId: 'trembles', outcome: 'recovered (expired)', dayPartsLeftAtRemoval: 0 },
      ] });
    const b2 = buildEpisodes(s2);
    assert.strictEqual(b2.eps.length, 1, 'one scholar episode');
    assert.strictEqual(b2.eps[0].outcome, 'died of the trembles', 'expiry + same-day sickness death reclassified, got ' + b2.eps[0].outcome);
    // Stale-cleanup: villager died of a monster while sick; the tick later
    // cleans the record -> 'died (other cause: monster)'.
    const s3 = mk({ deathRows: [{ day: 15, who: 'v2', whoName: 'Bo', isPlayer: false, cause: 'monster' }],
      sickOnsets: [
        { day: 12, who: 'v2', whoName: 'Bo', kind: 'npc', name: 'gut rot', diseaseId: 'gutrot', vector: 'dirty water', vectorSource: 'villageSicknessTick', daysLeft0: 4, severity: 2 },
      ], sickEnds: [
        { day: 16, who: 'v2', whoName: 'Bo', kind: 'npc', name: 'gut rot', diseaseId: 'gutrot', outcome: 'stale-cleanup' },
      ] });
    const b3 = buildEpisodes(s3);
    assert.strictEqual(b3.eps[0].outcome, 'died (other cause: monster)', 'stale-cleanup reclassified, got ' + b3.eps[0].outcome);
    // Open episode: onset with no end stays open; unattributed vector survives.
    const s4 = mk({ sickOnsets: [
      { day: 149, who: 'v3', whoName: 'Cy', kind: 'npc', name: 'weird cough', diseaseId: null, vector: 'unattributed', vectorSource: 'villageSicknessTick', daysLeft0: 3, severity: 1 },
    ], sickEnds: [] });
    const b4 = buildEpisodes(s4);
    assert.strictEqual(b4.eps.length, 1, 'one open episode');
    assert.strictEqual(b4.eps[0].outcome, 'open at run end', 'open outcome');
    assert.strictEqual(b4.eps[0].duration, null, 'open duration null');
    assert.strictEqual(b4.eps[0].vector, 'unattributed', 'unattributed preserved');
    // Orphan end (no onset) is reported, not silently paired.
    const s5 = mk({ sickOnsets: [], sickEnds: [
      { day: 5, who: 'v9', whoName: 'Dee', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'recovered' },
    ] });
    const b5 = buildEpisodes(s5);
    assert.strictEqual(b5.eps.length, 0, 'orphan end makes no episode');
    assert.strictEqual(b5.orphanEnds.length, 1, 'one orphan end reported');
    // Same-tick turnover (recorder bug found by the G3 check on the judged
    // corpus): a villager recovers from tick fever and is re-infected with
    // wound fever in the SAME tick (candidates are computed after the
    // recovery loop). The recorder must emit BOTH an end for the old spell
    // and an onset for the new one on that day; the analyzer must pair them
    // as two episodes with no orphans.
    const s6 = mk({ sickOnsets: [
      { day: 10, who: 'v6', whoName: 'Ana', kind: 'npc', name: 'tick fever', diseaseId: 'disease', vector: 'tick', vectorSource: 'villageSicknessTick', daysLeft0: 4, severity: 1 },
      { day: 13, who: 'v6', whoName: 'Ana', kind: 'npc', name: 'wound fever', diseaseId: 'wound_fever', vector: 'wound', vectorSource: 'villageSicknessTick', daysLeft0: 5, severity: 2 },
    ], sickEnds: [
      { day: 13, who: 'v6', whoName: 'Ana', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'recovered' },
      { day: 17, who: 'v6', whoName: 'Ana', kind: 'npc', name: 'wound fever', diseaseId: 'wound_fever', outcome: 'recovered' },
    ] });
    const b6 = buildEpisodes(s6);
    assert.strictEqual(b6.eps.length, 2, 'turnover: two episodes, got ' + b6.eps.length);
    assert.strictEqual(b6.eps[0].outcome, 'recovered', 'turnover first recovered');
    assert.strictEqual(b6.eps[0].duration, 3, 'turnover first duration 13-10=3, got ' + b6.eps[0].duration);
    assert.strictEqual(b6.eps[1].name, 'wound fever', 'turnover second is wound fever');
    assert.strictEqual(b6.eps[1].duration, 4, 'turnover second duration 17-13=4, got ' + b6.eps[1].duration);
    assert.strictEqual(b6.orphanEnds.length, 0, 'turnover: no orphan ends');
  });
  await aleg('L9 flow accounting residual is small on the 5-day seed', async () => {
    const days = first.perSeed.daySeries, flows = first.perSeed.flowSeries;
    const n = days.length;
    const sumF = (fn, from, to) => flows.filter(f => f.day >= from && f.day <= to).reduce((t, f) => t + fn(f), 0);
    const dPantry = (days[n - 1].pantryKcal || 0) - (days[0].pantryKcal || 0);
    const inTot = sumF(f => Object.values(f.stocked || {}).reduce((a, b) => a + b, 0), 2, n)
      + sumF(f => (f.stored || 0) + (f.league || 0), 1, n - 1)
      + sumF(f => (f.pantryAdd || 0) + (f.donated || 0), 2, n);
    const outTot = sumF(f => (f.drawn || 0) + (f.drawGap || 0) + (f.spoiledDrawn || 0), 1, n - 1)
      + sumF(f => (f.spoiledSwept || 0) + (f.takeBulk || 0) + (f.removedKcal || 0), 2, n);
    const residual = dPantry - (inTot - outTot);
    const share = outTot ? Math.abs(residual) / outTot : 0;
    console.log('    residual=' + residual + ' inflows=' + inTot + ' outflows=' + outTot + ' share=' + (100 * share).toFixed(1) + '% of outflows');
    assert.ok(share < 0.10, 'residual share < 10% of outflows, got ' + (100 * share).toFixed(1) + '%');
  });
  leg('L10 event-log well-formedness on the 5-day run', () => {
    const ps = first.perSeed;
    for (const o of ps.sickOnsets) {
      assert.ok(o.vector && typeof o.vector === 'string' && o.vector.length > 0, 'onset has a vector: ' + JSON.stringify(o).slice(0, 160));
      assert.ok(o.vectorSource, 'onset has vectorSource');
      assert.ok(o.day >= 1 && o.day <= 5, 'onset day in [1,5], got ' + o.day);
      assert.ok(o.who && o.kind, 'onset has who+kind');
    }
    for (const e of ps.sickEnds) {
      assert.ok(e.outcome && typeof e.outcome === 'string', 'end has outcome');
      assert.ok(e.day >= 1 && e.day <= 5, 'end day in [1,5], got ' + e.day);
    }
    for (const t of ps.treatEvents) {
      assert.ok(t.kind && t.day >= 1 && t.day <= 5, 'treatEvent well-formed: ' + JSON.stringify(t).slice(0, 120));
    }
    // Reconstruction on the real 5-day corpus: no orphan ends; every onset is
    // paired or open at run end.
    const built = buildEpisodes(ps);
    assert.strictEqual(built.orphanEnds.length, 0, 'no orphan ends on 5-day run, got ' + built.orphanEnds.length);
    assert.strictEqual(built.eps.length, ps.sickOnsets.length,
      'episodes == onsets on 5-day run (' + built.eps.length + ' vs ' + ps.sickOnsets.length + ')');
    console.log('    5-day run: onsets=' + ps.sickOnsets.length + ' ends=' + ps.sickEnds.length +
      ' treats=' + ps.treatEvents.length + ' status=' + ps.statusEvents.length +
      ' diagnoses=' + ps.diagnoses.length + ' cures=' + ps.cureEvents.length);
  });

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
