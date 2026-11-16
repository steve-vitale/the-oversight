// test-stand199-b.js — proof for arm sim-stand199-b (DIAG: standing-199 stall).
// Static checks (zero src/js diff; instrument reused by path) + fixture
// tests (hold-kind classification, contribution-stop derivation,
// national-lapse classification, OFF/ON comparison) + live harness
// legs: smoke (1 seed, 30d, 0 instrument errors, every snapshot
// reconciles), D1 determinism (recorder ON twice, seed 102701, 60d,
// identical ON corpus), D2 neutrality (recorder ON vs OFF, seed 102701,
// 60d, identical daily signatures + wall fields).
// Usage: node scripts/test-stand199-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'standing199-instrument-20261110'));
const DRIVER = require(path.join(REPO, 'scripts', 'stand199-driver-20261116'));
const AN = require(path.join(REPO, 'scripts', 'stand199-analyze-20261116'));

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; failures.push(name + (extra ? ' :: ' + extra : '')); console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function snap(o) {
  return Object.assign({
    day: 1, standing: { total: 0, war: 0, diplomacy: 0, plenty: 0 },
    capped: 0, gated: 0, peakWave: 0,
    readiness4: { ready: true, demand: { armored: 4, armed: 6, tricks: 3, veterans: 1 } },
    readiness5: { ready: true, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 } },
  }, o);
}

(async function () {
  // ---- static checks ----
  let srcDiff = '';
  try { srcDiff = execSync('git diff --stat HEAD -- src/', { cwd: REPO }).toString().trim(); } catch (e) { srcDiff = 'ERR:' + e.message; }
  check('static: zero src/ diff', srcDiff === '', srcDiff.slice(0, 200));
  check('static: instrument file exists', fs.existsSync(path.join(REPO, 'scripts', 'standing199-instrument-20261110.js')));
  check('static: driver file exists', fs.existsSync(path.join(REPO, 'scripts', 'stand199-driver-20261116.js')));
  check('static: analyzer file exists', fs.existsSync(path.join(REPO, 'scripts', 'stand199-analyze-20261116.js')));
  let untrackedSrc = '';
  try { untrackedSrc = execSync('git status --porcelain -- src/', { cwd: REPO }).toString().trim(); } catch (e) {}
  check('static: no uncommitted src/ changes', untrackedSrc === '', untrackedSrc.slice(0, 200));

  // ---- holdKind fixtures (the cap vs defer5 distinction) ----
  // Cap: raw >= 200, capped < 200 (plenty over the cap), readiness ready.
  check('holdKind: cap', INST.holdKind(snap({ standing: { total: 250, war: 100, diplomacy: 0, plenty: 150 }, capped: 150, gated: 199, peakWave: 4 })) === 'cap');
  // Defer5: capped >= 200, readiness5 not ready.
  check('holdKind: defer5', INST.holdKind(snap({ standing: { total: 250, war: 250, diplomacy: 0, plenty: 0 }, capped: 250, gated: 199, peakWave: 4, readiness5: { ready: false, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 }, armored: 4, armed: 6, tricks: 5, veterans: 1 } })) === 'defer5');
  // Defer4: raw >= 100, readiness4 not ready, peak < 4.
  check('holdKind: defer4', INST.holdKind(snap({ standing: { total: 120, war: 120, diplomacy: 0, plenty: 0 }, capped: 120, gated: 99, peakWave: 0, readiness4: { ready: false, demand: { armored: 4, armed: 6, tricks: 3, veterans: 1 }, armored: 2, armed: 3, tricks: 1, veterans: 0 } })) === 'defer4');
  // None: raw < 100, everything ready.
  check('holdKind: none (standing-short)', INST.holdKind(snap({ standing: { total: 75, war: 75, diplomacy: 0, plenty: 0 }, capped: 75, gated: 75, peakWave: 0 })) === 'none');
  // None: released (peak 5) — no hold applies once the ratchet fired.
  check('holdKind: none (released, peak 5)', INST.holdKind(snap({ standing: { total: 420, war: 400, diplomacy: 0, plenty: 20 }, capped: 420, gated: 420, peakWave: 5, readiness5: { ready: false, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 }, armored: 4, armed: 6, tricks: 5, veterans: 0 } })) === 'none');
  // Cap and defer5 are mutually exclusive on one day.
  check('holdKind: cap beats defer5 when capped<200', INST.holdKind(snap({ standing: { total: 300, war: 100, diplomacy: 0, plenty: 200 }, capped: 150, gated: 199, peakWave: 4, readiness5: { ready: false, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 }, armored: 1, armed: 1, tricks: 0, veterans: 0 } })) === 'cap');

  // ---- contributionStops fixtures ----
  const csDaily = [
    { day: 1, standing: { war: 0, diplomacy: 0, plenty: 0 } },
    { day: 2, standing: { war: 25, diplomacy: 0, plenty: 0 } },
    { day: 3, standing: { war: 25, diplomacy: 0, plenty: 20 } },
    { day: 5, standing: { war: 50, diplomacy: 0, plenty: 20 } },
    { day: 9, standing: { war: 50, diplomacy: 34, plenty: 20 } },
  ];
  const cs = AN.contributionStops(csDaily);
  check('contributionStops: war last-gain d5', cs.war.lastGainDay === 5, JSON.stringify(cs.war));
  check('contributionStops: war plateau 4d at end', cs.war.plateauDaysAtEnd === 4, JSON.stringify(cs.war));
  check('contributionStops: plenty last-gain d3', cs.plenty.lastGainDay === 3, JSON.stringify(cs.plenty));
  check('contributionStops: diplomacy last-gain d9', cs.diplomacy.lastGainDay === 9, JSON.stringify(cs.diplomacy));
  const csZero = AN.contributionStops([
    { day: 1, standing: { war: 25, diplomacy: 0, plenty: 0 } },
    { day: 2, standing: { war: 25, diplomacy: 0, plenty: 0 } },
  ]);
  check('contributionStops: never-grown diplomacy is null', csZero.diplomacy.lastGainDay === null && csZero.diplomacy.plateauDaysAtEnd === null, JSON.stringify(csZero.diplomacy));

  // ---- nationalLapses fixtures ----
  function link(key, trust, seasoned, regional) {
    return { key: key, trust: trust, seasoned: seasoned, regional: regional, status: 'active' };
  }
  const nlDaily = [
    { day: 10, nationalLive: false, links: [link('village_0|trade', 41, true, false)] },
    { day: 11, nationalLive: true, links: [link('village_0|trade', 41, true, true)] },
    { day: 12, nationalLive: true, links: [link('village_0|trade', 40, true, true)] },
    { day: 13, nationalLive: false, links: [link('village_0|trade', 39, false, false)] },
    { day: 20, nationalLive: true, links: [link('village_0|trade', 42, true, true)] },
  ];
  const nl = AN.nationalLapses(nlDaily);
  check('nationalLapses: one lapse d13', nl.lapses.length === 1 && nl.lapses[0].day === 13, JSON.stringify(nl.lapses));
  check('nationalLapses: cause names trust-below-40', /trust-below-40/.test(nl.lapses[0].cause), nl.lapses[0].cause);
  check('nationalLapses: two restages d11 + d20', nl.restages.length === 2 && nl.restages[0].day === 11 && nl.restages[1].day === 20, JSON.stringify(nl.restages));
  const nlNone = AN.nationalLapses([
    { day: 1, nationalLive: false, links: [] },
    { day: 2, nationalLive: false, links: [] },
  ]);
  check('nationalLapses: no flips, no lapses', nlNone.lapses.length === 0 && nlNone.restages.length === 0);

  // ---- compareLegs fixtures ----
  const onA = { seed: 1, days: 60, standing: 199, standingRaw: 250, scaleRank: 'regional', maxWave: 4, w4kills: 3, w3kills: 5, w5kills: 0, deaths: [{ day: 3 }, { day: 9 }], dailySig: [{ day: 1, living: 7, pantryKcal: 100, gated: 0, raw: 0, war: 0, diplomacy: 0, plenty: 0, capped: 0, peakWave: 0, scaleRank: 'village', nationalLive: false }, { day: 2, living: 7, pantryKcal: 90, gated: 25, raw: 25, war: 25, diplomacy: 0, plenty: 0, capped: 25, peakWave: 0, scaleRank: 'village', nationalLive: false }] };
  const offA = JSON.parse(JSON.stringify(onA));
  check('compareLegs: identical legs, 0 divergences', AN.compareLegs(onA, offA).divergences === 0, JSON.stringify(AN.compareLegs(onA, offA).errors));
  const offB = JSON.parse(JSON.stringify(onA));
  offB.dailySig[1].gated = 200;
  check('compareLegs: one gated divergence detected', AN.compareLegs(onA, offB).divergences === 1, JSON.stringify(AN.compareLegs(onA, offB).errors));
  const offC = JSON.parse(JSON.stringify(onA));
  offC.standing = 250;
  check('compareLegs: one wall divergence detected', AN.compareLegs(onA, offC).divergences === 1);

  // ---- medianStd fixture (standard median, even n) ----
  check('medianStd: even-n standard median', AN.medianStd([65, 74, 82, 116, 125, 139, 150, 150]) === 120.5, String(AN.medianStd([65, 74, 82, 116, 125, 139, 150, 150])));

  // ---- live harness legs ----
  const SEED = 102701;
  // Smoke: 30d ON.
  const smoke = await DRIVER.oneRun(SEED, { days: 30, recorderOn: true });
  check('live smoke: 0 instrument errors', smoke.instrumentErrors.length === 0, JSON.stringify(smoke.instrumentErrors.slice(0, 3)));
  let reconErrs = 0, gatedMismatch = 0, snaps = 0;
  for (const s of (smoke.daily || [])) {
    if (!s.standing) continue;
    snaps++;
    const sum = (s.standing.war | 0) + (s.standing.diplomacy | 0) + (s.standing.plenty | 0);
    if (sum !== (s.standing.total | 0)) reconErrs++;
    if (s.capped != null) {
      const capSum = (s.standing.war | 0) + (s.standing.diplomacy | 0) + Math.min(s.standing.plenty | 0, 100);
      if (capSum !== (s.capped | 0)) reconErrs++;
    }
    const kind = INST.holdKind(s);
    if ((s.gated | 0) === 199 && kind !== 'cap' && kind !== 'defer5') gatedMismatch++;
  }
  check('live smoke: snapshots reconcile (raw + capped)', reconErrs === 0, reconErrs + ' errors over ' + snaps + ' snapshots');
  check('live smoke: gated==199 implies a 199-hold', gatedMismatch === 0, gatedMismatch + ' mismatches');
  check('live smoke: dailySig present every snapshot day', smoke.dailySig.length > 0 && smoke.dailySig.length <= smoke.daily.length + 1, 'sig ' + smoke.dailySig.length + ' vs daily ' + smoke.daily.length);

  // D1: ON twice, 60d, identical ON corpus.
  const d1a = await DRIVER.oneRun(SEED, { days: 60, recorderOn: true });
  const d1b = await DRIVER.oneRun(SEED, { days: 60, recorderOn: true });
  check('D1: identical daily arrays', JSON.stringify(d1a.daily) === JSON.stringify(d1b.daily));
  check('D1: identical dailySig', JSON.stringify(d1a.dailySig) === JSON.stringify(d1b.dailySig));
  check('D1: identical wall fields', d1a.days === d1b.days && d1a.standing === d1b.standing && d1a.standingRaw === d1b.standingRaw && d1a.scaleRank === d1b.scaleRank && d1a.maxWave === d1b.maxWave && d1a.w4kills === d1b.w4kills);

  // D2: ON vs OFF, 60d, identical signatures + wall fields.
  const d2off = await DRIVER.oneRun(SEED, { days: 60, recorderOn: false });
  const d2cmp = AN.compareLegs(d1a, d2off);
  check('D2: 0 divergences ON vs OFF (60d)', d2cmp.divergences === 0, JSON.stringify(d2cmp.errors.slice(0, 5)));

  console.log('\nstand199-b proof: ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('FAILURES:\n' + failures.join('\n')); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
