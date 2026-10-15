#!/usr/bin/env node
// scripts/test-readinessbind-20261015.js — proof for the readinessbind
// instrument (2026-10-15). INSTRUMENT-ONLY build: no src/js changes, so the
// load-bearing claim is trajectory-neutrality of the read-only sampler,
// plus honest unlock detection, outcome classification, and the
// attribution/separation math.
//
// REAL RED PHASES (each RED must FAIL for a genuine reason; a RED that
// passes means the proof is broken and exits 1):
//   R1 HONESTY-RED: the MUTATE=1 naive probe (deliberately drains 500
//       kcal/day) MUST diverge from the clean run — asserting identical
//       trajectories FAILS. Proves the trajectory hash is sensitive enough
//       to catch contamination.
//   R2 NO-HALLUCINATION-RED: 15d smoke x 3 policies — asserting >=1 unlock
//       detected FAILS (Standing cannot reach 100 by day 15). Proves the
//       detector doesn't hallucinate unlocks.
//   R3 CLASSIFIER-RED: synthetic outcome cases asserted with INVERTED
//       labels — each assertion FAILS. Proves the classifier isn't
//       vacuously passing.
//   R4 MATH-RED: attribution below the bar asserted GO (FAILS); a
//       separated synthetic set asserted UNCONCENTRATED (FAILS); an
//       underpowered set asserted not-underpowered (FAILS).
// GREEN: the honest assertions — MUTATE-free instrument ON vs OFF is
// byte-identical; smoke collects clean samples; classifier labels correct;
// attribution/separation math correct.
//
// Usage:
//   FOURTHLINK=1 FEASTSCALE_R13=1 node scripts/test-readinessbind-20261015.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const RB = require('./readinessbind-lib');
const sweep = require('./readinessbind-sweep');

let failures = 0;
function t(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}
// redExpectFail: the assertion MUST fail (that's the RED). If it passes,
// the proof is broken — loud failure.
function redExpectFail(name, cond, detail) {
  const ok = !cond;
  console.log(`  ${ok ? 'RED-OK' : 'RED-BROKEN'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

function hashesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function firstDiv(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

// R1: MUTATE=1 naive probe vs clean — must DIVERGE (hash is sensitive).
async function phaseR1() {
  console.log('R1 HONESTY-RED: mutating naive probe must diverge from clean');
  process.env.MUTATE = '1'; delete process.env.RB_OFF;
  const mutated = await sweep.oneRun(33, 'leadfeast', 60);
  delete process.env.MUTATE; process.env.RB_OFF = '1';
  const clean = await sweep.oneRun(33, 'leadfeast', 60);
  delete process.env.RB_OFF;
  const div = firstDiv(mutated.hashes, clean.hashes);
  redExpectFail('MUTATE probe diverges from clean (hash sensitive)',
    hashesEqual(mutated.hashes, clean.hashes),
    `diverged at hash idx ${div} (day ~${div})`);
}

// G1: instrument ON vs OFF — must be BYTE-IDENTICAL.
async function phaseG1() {
  console.log('G1 HONESTY-GREEN: instrument ON vs OFF byte-identical');
  delete process.env.MUTATE; delete process.env.RB_OFF;
  const on = await sweep.oneRun(33, 'leadfeast', 60);
  process.env.RB_OFF = '1';
  const off = await sweep.oneRun(33, 'leadfeast', 60);
  delete process.env.RB_OFF;
  const div = firstDiv(on.hashes, off.hashes);
  t('instrument ON vs OFF identical trajectories', hashesEqual(on.hashes, off.hashes),
    `n=${on.hashes.length}/${off.hashes.length}, firstDiv=${div}`);
  t('ON run still sampled (instrument did work)', on.samples.length > 0, `samples=${on.samples.length}`);
}

// R2: 15d smoke — asserting an unlock was detected must FAIL.
async function phaseR2() {
  console.log('R2 NO-HALLUCINATION-RED: 15d smoke must detect zero unlocks');
  delete process.env.MUTATE; delete process.env.RB_OFF;
  for (const pid of ['fourthlink', 'belongseek', 'leadfeast']) {
    const rec = await sweep.oneRun(11, pid, 15);
    redExpectFail(`[${pid}] >=1 unlock on 15d smoke`, rec.unlocks.length >= 1,
      `unlocks=${rec.unlocks.length}`);
    t(`[${pid}] samples collected`, rec.samples.length > 0, `n=${rec.samples.length}`);
    const shapeOk = rec.samples.every(s => typeof s.wave === 'number' && typeof s.standingTotal === 'number' && typeof s.living === 'number');
    t(`[${pid}] sample shape (wave/standing/living)`, shapeOk);
  }
}

// G2: readinessSnapshot shape on a live day-1 game — all 8 covariates.
async function phaseG2() {
  console.log('G2 SNAPSHOT-GREEN: full covariate shape on a live game');
  const { Game } = await loadGame({ seed: 11, mode: 'rb-proof-snap' });
  await quietLog(async () => { await setupGame(Game); });
  const snap = RB.readinessSnapshot(Game, 4);
  t('snapshotComplete on day-1 state', RB.snapshotComplete(snap), JSON.stringify({
    ledgerPointsPrev: snap.ledgerPointsPrev, tricksPrev: snap.tricksPrev,
    scholarArmorP: snap.scholarArmorP, rosterAlive: snap.rosterAlive,
    pantryFreshDays: snap.pantryFreshDays, trustMean: snap.trustMean, rank: snap.rank,
  }));
  t('wave-4 types counted for tricksPrev', snap.tricksPrev.total > 0, `total=${snap.tricksPrev.total}`);
  t('ledger per-type is a plain object', snap.ledgerPerType && typeof snap.ledgerPerType === 'object');
}

function mkUnlock(over) {
  return { snapshot: { day: 100, standing: { total: 102 }, ledgerPerType: {}, ledgerPointsPrev: 0,
    tricksPrev: { known: 0, total: 9, share: 0 }, scholarArmorP: 20, rosterAlive: 10,
    pantryFreshDays: 6, trustMean: 40, rank: 'regional' }, outcome: over };
}

// R3/G3: outcome classifier.
function phaseR3G3() {
  console.log('R3 CLASSIFIER-RED (inverted labels must fail) / G3 (true labels pass)');
  const cases = [
    ['held', { unlockDay: 100, wave: 4 },
      { finalDay: 200, endReason: 'survived', livingAtPlus30: 5, tableDays: [110] },
      { outcome: 'held', tableBy30: 1, daysObserved: 30 }],
    ['died', { unlockDay: 100, wave: 4 },
      { finalDay: 115, endReason: 'village-lost', livingAtPlus30: -1, tableDays: [] },
      { outcome: 'died', tableBy30: 0, daysObserved: 15 }],
    ['hollow-via-deadtail', { unlockDay: 100, wave: 5 },
      { finalDay: 112, endReason: 'village-dead', livingAtPlus30: -1, tableDays: [] },
      { outcome: 'hollow', tableBy30: 0, daysObserved: 12 }],
    ['hollow-at-30', { unlockDay: 100, wave: 4 },
      { finalDay: 200, endReason: 'survived', livingAtPlus30: 0, tableDays: [] },
      { outcome: 'hollow', tableBy30: 0, daysObserved: 30 }],
    ['held-censored', { unlockDay: 170, wave: 4 },
      { finalDay: 180, endReason: 'survived', livingAtPlus30: -1, tableDays: [] },
      { outcome: 'held-censored', tableBy30: 0, daysObserved: 10 }],
    ['table-boundary-in', { unlockDay: 100, wave: 4 },
      { finalDay: 200, endReason: 'survived', livingAtPlus30: 4, tableDays: [130] },
      { outcome: 'held', tableBy30: 1, daysObserved: 30 }],
    ['table-boundary-out', { unlockDay: 100, wave: 4 },
      { finalDay: 200, endReason: 'survived', livingAtPlus30: 4, tableDays: [131] },
      { outcome: 'held', tableBy30: 0, daysObserved: 30 }],
  ];
  const wrong = { held: 'died', died: 'held', 'hollow-via-deadtail': 'held', 'hollow-at-30': 'died',
    'held-censored': 'died', 'table-boundary-in': 'hollow', 'table-boundary-out': 'hollow' };
  for (const [name, unlock, run, exp] of cases) {
    const got = RB.classifyOutcome(unlock, run);
    redExpectFail(`[R3] ${name} inverted label`, got.outcome === wrong[name],
      `inverted=${wrong[name]} actual=${got.outcome}`);
    const ok = got.outcome === exp.outcome && got.tableBy30 === exp.tableBy30 && got.daysObserved === exp.daysObserved;
    t(`[G3] ${name} -> ${exp.outcome}/table${exp.tableBy30}/${exp.daysObserved}d`, ok, JSON.stringify(got));
  }
}

function sepUnlock(armorP, outcome) {
  const u = mkUnlock();
  u.snapshot.scholarArmorP = armorP;
  u.snapshot.rosterAlive = 10; u.snapshot.pantryFreshDays = 6; u.snapshot.trustMean = 40;
  u.snapshot.ledgerPointsPrev = 2; u.snapshot.tricksPrev = { known: 1, total: 9, share: 0.111 };
  u.outcome = { outcome, tableBy30: 0, daysObserved: 30 };
  return u;
}

// R4/G4: attribution + separation math.
function phaseR4G4() {
  console.log('R4 MATH-RED / G4 MATH-GREEN');
  // attribution: 5 unlocks, 2 incomplete -> rate 0.6 < 0.8
  const partial = [sepUnlock(20, 'held'), sepUnlock(22, 'held'), sepUnlock(18, 'died'),
    { snapshot: null, outcome: { outcome: 'held', tableBy30: 0, daysObserved: 30 } },
    { snapshot: { day: 0 }, outcome: { outcome: 'died', tableBy30: 0, daysObserved: 5 } }];
  const aPartial = RB.attribution(partial);
  redExpectFail('[R4] 60% attribution asserted GO', aPartial.rate >= 0.8, `rate=${aPartial.rate}`);
  t('[G4] 60% attribution honestly below bar', aPartial.rate === 0.6 && aPartial.fullyAttributed === 3,
    JSON.stringify(aPartial));
  // full: 5/5 -> 1.0
  const full = [sepUnlock(20, 'held'), sepUnlock(22, 'held'), sepUnlock(18, 'died'),
    sepUnlock(25, 'held'), sepUnlock(15, 'hollow')];
  const aFull = RB.attribution(full);
  t('[G4] 100% attribution meets bar', aFull.rate === 1, `rate=${aFull.rate}`);
  // censored boundary: 4 complete + 1 held-censored -> 4/5 = 0.8 meets bar
  const cens = full.slice(0, 4).concat([(() => { const u = sepUnlock(21, 'held-censored'); return u; })()]);
  const aCens = RB.attribution(cens);
  t('[G4] censored excluded from numerator, in denominator (4/5=0.8)',
    aCens.rate === 0.8 && aCens.censored === 1, JSON.stringify(aCens));
  // separation: holders P {60,64,70} vs corpses {10,14,20} -> SEPARATES on scholarArmorP
  const sepSet = [sepUnlock(60, 'held'), sepUnlock(64, 'held'), sepUnlock(70, 'held'),
    sepUnlock(10, 'died'), sepUnlock(14, 'died'), sepUnlock(20, 'hollow')];
  const sSep = RB.separation(sepSet);
  redExpectFail('[R4] separated set asserted UNCONCENTRATED', sSep.verdict === 'UNCONCENTRATED',
    `verdict=${sSep.verdict}`);
  t('[G4] separated set names scholarArmorP', sSep.verdict === 'SEPARATING' &&
    /scholarArmorP/.test(sSep.note), sSep.note);
  // overlapping: holders {40,50,60} vs corpses {45,55,65} -> UNCONCENTRATED
  const overSet = [sepUnlock(40, 'held'), sepUnlock(50, 'held'), sepUnlock(60, 'held'),
    sepUnlock(45, 'died'), sepUnlock(55, 'died'), sepUnlock(65, 'hollow')];
  const sOver = RB.separation(overSet);
  redExpectFail('[R4] overlapping set asserted SEPARATING', sOver.verdict === 'SEPARATING',
    `verdict=${sOver.verdict}`);
  t('[G4] overlapping set names unconcentration', sOver.verdict === 'UNCONCENTRATED', sOver.note);
  // underpowered: 3 unlocks
  const sUnder = RB.separation(sepSet.slice(0, 3));
  redExpectFail('[R4] 3-unlock set asserted not-underpowered', !sUnder.underpowered,
    `verdict=${sUnder.verdict}`);
  t('[G4] 3-unlock set flagged underpowered', sUnder.underpowered === true && sUnder.verdict === 'UNDERPOWERED');
}

(async () => {
  await phaseR1();
  await phaseG1();
  await phaseR2();
  await phaseG2();
  phaseR3G3();
  phaseR4G4();
  console.log(failures ? `\nPROOF FAIL: ${failures} failure(s).` : '\nPROOF GREEN: all RED phases failed honestly, all GREEN phases pass.');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
