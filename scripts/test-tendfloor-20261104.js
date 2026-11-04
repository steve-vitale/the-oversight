// test-tendfloor-20261104.js — proof for the floored tend-through leg
// (arm sim-tendfloor-b). Fixture tests for: the floored policy
// (EXACTLY the 13,500 floor added to tend-through; tend-through and
// leadcourt untouched), survival bands, tend counting by pantry
// band, ever-faced wave detection, pooled hold-share, and the
// prereg GO judge (all four legs + insufficient-data), plus a live
// harness smoke test: loadGame + diplo instrument + 2-day
// leadcourt-tendfloor-b run, 0 instrument errors. Writes nothing
// to the repo (in-memory only).
// Usage: node scripts/test-tendfloor-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const WRAP = require(path.join(REPO, 'scripts', 'test-tendfloor-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}

// 1. Floored policy: exactly one gate added to tend-through.
const floorText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendfloor-b.js'), 'utf8');
const throughText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough.js'), 'utf8');
const leadText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt.js'), 'utf8');
eq('floor gate 13500 present', floorText.indexOf('pantryKcal(Game) > 13500') >= 0, true);
eq('floor keeps weekly check', floorText.indexOf('link.tendedWeek !== week') >= 0, true);
eq('floor keeps Haven-primary tend', floorText.indexOf("link.primary === 'haven'") >= 0, true);
eq('floor keeps proposal gate 12000', floorText.indexOf('pantryKcal(Game) > 12000') >= 0, true);
eq('floor keeps counter rich gate 25000', floorText.indexOf('pantryKcal(Game) > 25000') >= 0, true);
eq('floor has no 20000 tend gate', floorText.indexOf('pantryKcal(Game) > 20000'), -1);
eq('tendthrough still unconditional tend', throughText.indexOf('pantryKcal(Game) > 13500'), -1);
eq('tendthrough still no 20000 gate', throughText.indexOf('pantryKcal(Game) > 20000'), -1);
eq('leadcourt still has 20000 tend gate', leadText.indexOf('pantryKcal(Game) > 20000') >= 0, true);
const pol = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendfloor-b')).leadcourtTendfloorB;
eq('floor id', pol.id, 'leadcourt-tendfloor-b');
eq('floor daily fn', typeof pol.daily, 'function');
const polBase = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough')).leadcourtTendthrough;
eq('baseline id', polBase.id, 'leadcourt-tendthrough');

// 2. Survival bands.
eq('band A horizon', WRAP.bandFor(300, 'horizon'), 'A');
eq('band B', WRAP.bandFor(200, 'lost'), 'B');
eq('band C', WRAP.bandFor(143, 'lost'), 'C');
eq('band D', WRAP.bandFor(98, 'lost'), 'D');
eq('band edge 150', WRAP.bandFor(150, 'lost'), 'B');
eq('band edge 100', WRAP.bandFor(100, 'lost'), 'C');

// 3. Median.
eq('median even', WRAP.median([10, -4, 3, 7]), 5);
eq('median odd', WRAP.median([1, 2, 9]), 2);

// 4. Summarize: tend bands + ever-faced, on fixtures.
function link(id, trust, seasoned, status) {
  return { id: id, kind: null, primary: 'haven', subordinate: 'v' + id, status: status || 'active',
    trust: trust, seasoned: seasoned, regionalPlus: seasoned };
}
function snap(day, diplo, detail, pantry, w4, w5) {
  const seasoned = detail.filter(function (d) { return d.seasoned; }).length;
  return { day: day, tile: { x: 4, y: 4 }, insideHaven: true, ovs: [], onVillageTile: null,
    linkFunnel: { total: detail.length, active: detail.filter(function (d) { return d.status === 'active'; }).length,
      seasoned: seasoned, regionalPlus: seasoned, seasonedNotRegional: 0, detail: detail },
    pending: { counter: false, accord: false, national: false, global: false, counterDetail: null },
    standing: { total: diplo, war: 0, diplomacy: diplo, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: diplo, peak: null, scaleRank: 'village', readiness5: { ready: false },
    w4faced: !!w4, w5faced: !!w5, roster: [], livingCount: 3, pantryKcal: pantry == null ? 10000 : pantry };
}
function daysRange(a, b, fn) { const out = []; for (let d = a; d <= b; d++) out.push(fn(d)); return out; }
(function () {
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, [link('l1', 70, true), link('l2', 80, true), link('l3', 54, true)], 30000, d === 70, false); }),
    daysRange(89, 100, function (d) { return snap(d, 0, [link('l1', 70, true), link('l2', 80, true), link('l3', 38, false)], 5000, false, false); }));
  const out = { seed: 99001, policy: 'leadcourt-tendfloor-b', run: 'test', anchorCommit: 'test',
    days: 100, endReason: 'lost', won: false, villageLost: true, scaleRank: 'regional',
    maxWave: 4, endUnlockedWave: 4, endCallMovedPeak: false, daily: daily,
    proposalEvents: [], courtshipEvents: [
      { day: 70, fn: 'tendLink', target: 'l3' },
      { day: 90, fn: 'tendLink', target: 'l3' },
      { day: 95, fn: 'tendLink', target: 'l1' },
      { day: 65, fn: 'tendLink', target: 'l2' },
    ],
    travelCalls: [], linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [] };
  const s = WRAP.summarizeLeg(out);
  eq('summarize trajectory collapses', s.trajectory, 'collapses');
  eq('summarize tend total', s.tendTotal, 4);
  eq('summarize tend blocked <=13500', s.tendBlocked, 2);
  eq('summarize tend floored 13501-20000', s.tendFloored, 0);
  eq('summarize tend high >20000', s.tendHigh, 2);
  eq('summarize everW4 from mid-run snapshot', s.everW4, true);
  eq('summarize everW5 false', s.everW5, false);
  eq('summarize band', s.survivalBand, 'C');
})();

// 5. GO judge fixtures (prereg: (a) no regression, (b) median delta
// >= -5, (c) pooled hold within 0.05, (d) wave guard within 1).
function leg(seed, days, bandDays, firstDiplo, postFirst, hold, everW4, everW5, errors) {
  return { seed: seed, days: days, endReason: 'lost', firstDiploDay: firstDiplo,
    postFirstSnapshots: postFirst, holdShare: hold, everW4: everW4, everW5: everW5,
    instrumentErrors: errors || 0 };
}
function pair(seed, baseDays, armedDays, baseHold, armedHold, baseW4, armedW4, baseW5, armedW5) {
  const b = leg(seed, baseDays, baseDays, 60, 40, baseHold, baseW4, baseW5, 0);
  const a = leg(seed, armedDays, armedDays, 60, 40, armedHold, armedW4, armedW5, 0);
  // bandFor via pairSeeds needs full outs; emulate pair shape directly:
  const BAND = { D: 0, C: 1, B: 2, A: 3 };
  function band(d) { return d >= 300 ? 'A' : d >= 150 ? 'B' : d >= 100 ? 'C' : 'D'; }
  return { seed: seed, base: b, armed: a, deltaDays: armedDays - baseDays,
    baseBand: band(baseDays), armedBand: band(armedDays),
    regressed: BAND[band(armedDays)] < BAND[band(baseDays)] };
}
(function () {
  const go = [pair(1, 120, 118, 1.0, 1.0, true, true, false, false),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true)];
  eq('judge GO', WRAP.judgeGo(go).verdict, 'GO');
  const reg = [pair(1, 120, 90, 1.0, 1.0, true, true, false, false),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true)];
  eq('judge NO-GO regression', WRAP.judgeGo(reg).verdict, 'NO-GO');
  const med = [pair(1, 120, 100, 1.0, 1.0, true, true, false, false),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true)];
  // deltas -20, 0 -> median -10, but 120->100 is also a band regression;
  // use band-safe median miss: 160->155 and 140->130 (both C/B safe? 160 B->B, 140 C->C)
  const med2 = [pair(1, 160, 152, 1.0, 1.0, true, true, false, false),
    pair(2, 140, 132, 1.0, 1.0, true, true, true, true)];
  eq('judge median fixture deltas', WRAP.judgeGo(med2).legB_medianDelta, -8);
  eq('judge NO-GO median', WRAP.judgeGo(med2).verdict, 'NO-GO');
  const hold = [pair(1, 120, 120, 1.0, 0.90, true, true, false, false),
    pair(2, 140, 140, 1.0, 0.90, true, true, true, true)];
  eq('judge NO-GO hold', WRAP.judgeGo(hold).verdict, 'NO-GO');
  const wave = [pair(1, 120, 120, 1.0, 1.0, true, false, true, false),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true)];
  // wave guard: w4 2->1 ok (within 1), w5 2->1 ok -> still GO; make w5 2->0:
  const wave2 = [pair(1, 120, 120, 1.0, 1.0, true, false, true, false),
    pair(2, 140, 140, 1.0, 1.0, true, false, true, false)];
  eq('judge NO-GO wave guard', WRAP.judgeGo(wave2).verdict, 'NO-GO');
  eq('judge wave within-1 passes guard', WRAP.judgeGo(wave).legD_pass, true);
  const bad = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true)];
  bad[0].armed.instrumentErrors = 3;
  bad[1].base.instrumentErrors = 3;
  eq('judge bad-seed count', WRAP.judgeGo(bad).badSeeds, 2);
  bad[0].base.instrumentErrors = 3;
  eq('judge insufficient-data', WRAP.judgeGo(bad).verdict, 'INSUFFICIENT-DATA');
})();

// Live harness smoke: tendfloor 2-day run, instrument clean.
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 99001, mode: 'tendfloor-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const s0 = inst.snapshot();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot funnel shape', typeof (s0.linkFunnel && s0.linkFunnel.total), 'number');
    await quietLog(async function () { await runDays(Game, pol, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.snapshot();
    eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
    eq('smoke snapshots taken', inst.t.daily.length >= 2, true);
    inst.uninstall();
  } catch (e) {
    fail++;
    console.log('FAIL live smoke: ' + (e && e.stack ? e.stack.slice(0, 500) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });
