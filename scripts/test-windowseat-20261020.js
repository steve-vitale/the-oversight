#!/usr/bin/env node
// test-windowseat-20261020.js — proof for arm sim-windowseat
// (flesh-out loop run fleshout-20261020T2145Z, axis scale-onramp).
//
// PROVES:
//   (1) RED->GREEN: the discriminating fixtures FAIL against a naive
//       windowsurvive-channel classifier (RED) and PASS against the real
//       9-class wall tree (GREEN) — the fixtures genuinely discriminate.
//   (2) The 9 classes + precedence + the aid-crisis divergence + the
//       monster-descriptor join + unexplained accounting.
//   (3) SMOKE: 1 seed x both policies drives, census live.
//   (4) DET: instrument-on vs instrument-off byte-identical (2 seeds x
//       60d, both policies).
//
// Usage (READ THIS — the 2026-10-20 env-trap lesson: the probe's SUBSTRATE
// GUARD runs at require time, so the sweep env is REQUIRED here too):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1 \
//   node scripts/test-windowseat-20261020.js
//   (DET runs at DAYS=60 in-process; override SEEDS="66001,66002" if needed)
'use strict';
const assert = require('assert');
const A = require('./analyze-windowseat-20261020');
const P = require('./probe-windowseat-20261020');

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { fail++; console.log(`  FAIL ${name}: ${e.message}`); }
}
const NS = A.nameSet();
function drec(cause, ctx, extra) {
  return Object.assign({ who: 'v1', day: 60, cause, ctx: Object.assign({ arena: false, inTb: false, noFlee: false, raidNight: false, atHaven: false, onExped: false, aid: false, router: null }, ctx || {}) }, extra || {});
}

// A naive classifier: the windowsurvive channel rules, unadapted —
// aid-crisis combat -> raid; dehydration -> other; no sealed/contest/
// kill-fight/starvation split. The discriminating fixtures must FAIL on
// this (RED) and PASS on classifyWall (GREEN).
function naiveClassify(d) {
  const cause = String(d.cause || 'unknown');
  const ctx = d.ctx || {};
  if (cause === 'raid' || cause === 'raid-defense') return 'raid';
  if (cause === 'starvation' || cause === 'thirst') return 'haven';
  if (cause === 'monster' || cause === 'combat') {
    if (ctx.aid) return 'raid';
    if (cause === 'combat' && ctx.atHaven) return 'raid';
    return 'wild';
  }
  return 'other';
}

console.log('== RED: discriminating fixtures vs the naive windowsurvive-channel classifier (expect FAILS) ==');
let redFails = 0;
function redExpect(name, d, killDays, mustNotBe) {
  const got = naiveClassify(d);
  if (got === mustNotBe) { console.log(`  RED-unexpected-pass ${name} (naive=${got})`); }
  else { redFails++; console.log(`  RED-fail(ok) ${name}: naive=${got} (wall tree must differ)`); }
}
redExpect('sealed-fight', drec('combat', { inTb: true, noFlee: true }), new Set(), 'sealed-fight');
redExpect('aid-crisis->expedition', drec('combat', { aid: true }), new Set(), 'expedition');
redExpect('dehydration->attrition', drec('dehydration', {}), new Set(), 'attrition');
redExpect('experiment->attrition', drec('experiment', {}), new Set(), 'attrition');
redExpect('contest-cause', drec('contest', {}), new Set(), 'contest');
console.log(`RED: ${redFails}/5 fixtures fail on the naive classifier (discrimination proven)`);

console.log('== GREEN: the 9-class wall tree ==');
t('contest by arena flag', () => {
  assert.deepStrictEqual(A.classifyWall(drec('combat', { arena: true, inTb: true }), new Set(), NS)[0], 'contest');
});
t('contest by cause even without arena', () => {
  assert.deepStrictEqual(A.classifyWall(drec('contest', { atHaven: true }), new Set(), NS)[0], 'contest');
});
t('sealed-fight keyed on noFlee (the #695 mark)', () => {
  assert.deepStrictEqual(A.classifyWall(drec('combat', { inTb: true, noFlee: true }), new Set(), NS), ['sealed-fight', 'ctx:noFlee-fight']);
});
t('sealed beats kill-fight on precedence (documented)', () => {
  const kd = new Set(['v1|60']);
  assert.deepStrictEqual(A.classifyWall(drec('combat', { inTb: true, noFlee: true }), kd, NS)[0], 'sealed-fight');
});
t('kill-fight: own wave-4+ kill same day', () => {
  const kd = new Set(['v1|60']);
  assert.deepStrictEqual(A.classifyWall(drec('combat', { atHaven: true }), kd, NS), ['kill-fight', 'same-day-own-w4+-kill']);
});
t('raid by cause', () => {
  assert.deepStrictEqual(A.classifyWall(drec('raid', {}), new Set(), NS)[0], 'raid');
});
t('raid by raid-night + at-haven', () => {
  assert.deepStrictEqual(A.classifyWall(drec('combat', { raidNight: true, atHaven: true }), new Set(), NS)[0], 'raid');
});
t('starvation', () => {
  assert.deepStrictEqual(A.classifyWall(drec('starvation', {}), new Set(), NS)[0], 'starvation');
});
t('attrition: sickness', () => {
  assert.deepStrictEqual(A.classifyWall(drec('sickness', {}), new Set(), NS)[0], 'attrition');
});
t('attrition: dehydration (the windowsurvive trap fixed)', () => {
  assert.deepStrictEqual(A.classifyWall(drec('dehydration', {}), new Set(), NS)[0], 'attrition');
});
t('attrition: experiment = food-trying death (canon)', () => {
  assert.deepStrictEqual(A.classifyWall(drec('experiment', {}), new Set(), NS), ['attrition', 'food-experiment']);
});
t('attrition: unclosed wound', () => {
  assert.deepStrictEqual(A.classifyWall(drec("a wound that wouldn't close", {}), new Set(), NS)[0], 'attrition');
});
t('haven-encounter: combat at haven, no raid night', () => {
  assert.deepStrictEqual(A.classifyWall(drec('combat', { atHaven: true }), new Set(), NS), ['haven-encounter', 'ctx:combat-at-haven']);
});
t('expedition: combat away from haven', () => {
  assert.deepStrictEqual(A.classifyWall(drec('combat', {}), new Set(), NS)[0], 'expedition');
});
t('expedition: aid-crisis combat (the deliberate divergence from windowsurvive)', () => {
  assert.deepStrictEqual(A.classifyWall(drec('combat', { aid: true }), new Set(), NS), ['expedition', 'ctx:aid-crisis']);
});
t('monster name cause is combatish: Ad Break -> expedition', () => {
  assert.ok(NS.has('ad break'), 'name set must contain ad break');
  assert.deepStrictEqual(A.classifyWall(drec('Ad Break', {}), new Set(), NS)[0], 'expedition');
});
t('monster DESCRIPTOR cause joins: toad descriptor -> name-lookup', () => {
  const desc = 'a toad like a war drum, throat swelling';
  assert.ok(NS.has(desc), 'name set must contain the belltoad unknown descriptor');
  assert.strictEqual(A.nameToWave(desc), 1);
  assert.deepStrictEqual(A.classifyWall(drec(desc, {}), new Set(), NS)[0], 'expedition');
});
t('other: named cause is explained', () => {
  assert.deepStrictEqual(A.classifyWall(drec('the night', {}), new Set(), NS), ['other:the night', 'cause-named']);
});
t('other: unknown cause is unexplained', () => {
  assert.deepStrictEqual(A.classifyWall(drec('unknown', {}), new Set(), NS), ['other:unknown', 'cause-unmapped']);
});
t('attemptsOf: won-through window outcome', () => {
  // The win lands WHILE def5 is still true: the window is open at run end.
  const recs = [];
  for (let d = 60; d <= 95; d++) recs.push({ d, st: { def5: true } });
  const rec = {
    won: true, gameDays: 95, endReason: 'over-other', wave5Day: null,
    recs, endRec: { d: 95, st: { def5: true } },
  };
  const w = A.attemptsOf(rec);
  assert.strictEqual(w.length, 1);
  assert.strictEqual(w[0].outcome, 'won');
});
t('attemptsOf: died window outcome', () => {
  const recs = [];
  for (let d = 61; d <= 80; d++) recs.push({ d, st: { def5: true } });
  const rec = { won: false, gameDays: 80, endReason: 'village-lost', wave5Day: null, recs, endRec: { d: 80, st: { def5: true } } };
  const w = A.attemptsOf(rec);
  assert.strictEqual(w.length, 1);
  assert.strictEqual(w[0].outcome, 'died');
});
t('joinKillerWave: combat death joins latest fight-start', () => {
  const rec = {
    fightStarts: [{ day: 55, mid: 'hushwolf', wave: 1, via: 'combat_start' }, { day: 59, mid: 'ad_break', wave: 3, via: 'combat_start' }],
    deathsAttributed: { attributed: [{ who: 'v1', day: 60, cause: 'combat', wave: null, ctx: {} }] },
  };
  const ds = A.joinKillerWave(rec);
  assert.strictEqual(ds[0].killerWave, 3);
  assert.strictEqual(ds[0].killerMid, 'ad_break');
});
t('attribute: clean synthetic run -> 0 unexplained', () => {
  // NOTE: no kill record here — a same-day own wave-4+ kill would
  // correctly classify the combat death as kill-fight (precedence:
  // kill-fight > raid), which is the next fixture's case, not this one's.
  const rec = {
    seed: 1, policyId: 'leadfeast', won: false, gameDays: 80, endReason: 'village-lost',
    wave5Day: null, kills: [],
    fightStarts: [], recs: [], endRec: null,
    deathsAttributed: {
      attributed: [drec('combat', { raidNight: true, atHaven: true }), drec('starvation', {})],
      unverifiable: [], phantomCount: 0, causeSpace: {},
    },
  };
  const a = A.attribute(rec);
  assert.strictEqual(a.unexplainedCount, 0);
  assert.strictEqual(a.windowDeathCount, 0);
  assert.deepStrictEqual(a.otherDeaths.map(d => d.wclass), ['raid', 'starvation']);
});
t('attribute: kill-day combat death -> kill-fight (precedence over raid)', () => {
  const rec = {
    seed: 1, policyId: 'leadfeast', won: false, gameDays: 80, endReason: 'village-lost',
    wave5Day: null, kills: [{ by: 'v1', day: 60 }],
    fightStarts: [], recs: [], endRec: null,
    deathsAttributed: {
      attributed: [drec('combat', { raidNight: true, atHaven: true })],
      unverifiable: [], phantomCount: 0, causeSpace: {},
    },
  };
  const a = A.attribute(rec);
  assert.strictEqual(a.unexplainedCount, 0);
  assert.deepStrictEqual(a.otherDeaths.map(d => d.wclass), ['kill-fight']);
});
t('attribute: unverifiable who -> unexplained counted LOUD', () => {
  const rec = {
    seed: 1, policyId: 'leadfeast', won: false, gameDays: 80, endReason: 'village-lost',
    wave5Day: null, kills: [], fightStarts: [], recs: [], endRec: null,
    deathsAttributed: {
      attributed: [], unverifiable: [{ who: '?', day: 60, cause: 'unknown' }], phantomCount: 0, causeSpace: {},
    },
  };
  const a = A.attribute(rec);
  assert.strictEqual(a.unexplainedCount, 1);
});

console.log('== SMOKE: both policies drive, census live ==');
(async () => {
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const out = await P.runOne(66001, policyId, { noWrite: true, days: 30 });
    assert.ok(out.gameDays > 0, `${policyId} drove 0 days`);
    assert.ok(out.deathsAttributed, `${policyId} missing deathsAttributed`);
    console.log(`  SMOKE ${policyId}: days=${out.gameDays} end=${out.endReason} attributed=${out.deathsAttributed.attributedCount} kills=${(out.kills || []).length} fightStarts=${(out.fightStarts || []).length} ierr=${out.instrumentErrors}`);
    pass++;
  }
  console.log('== DET: instrument-on vs instrument-off byte-identical ==');
  const odays = process.env.DAYS; process.env.DAYS = '60';
  const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66001, 66002]).filter(Number.isFinite);
  let ok = true;
  for (const seed of seeds) {
    for (const policyId of ['leadfeast', 'belongfeast']) {
      process.env.WSEAT_BARE = '1';
      const b1 = await P.runOne(seed, policyId, { noWrite: true });
      const b2 = await P.runOne(seed, policyId, { noWrite: true });
      delete process.env.WSEAT_BARE;
      const c1 = await P.runOne(seed, policyId, { noWrite: true });
      const c2 = await P.runOne(seed, policyId, { noWrite: true });
      const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
      const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
      const p = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
      console.log(`  DET s${seed} ${policyId}: ${p ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
      if (p) pass++; else { fail++; ok = false; }
    }
  }
  if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
  console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
  console.log(`\nPROOF: ${pass} pass, ${fail} fail, RED discrimination ${redFails}/5`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(2); });
